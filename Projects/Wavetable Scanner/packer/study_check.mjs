// Drives wavetable_scanner_study.html in Chrome, Firefox and WebKit (Safari's
// engine) the way a hand would: engage audio, pack the 122 AKWF_fmsynth files,
// export and compare the download with the node packer, drag the cursor plane
// in the 3D scene with the mouse, orbit from off the plane, and walk a mocked
// folder drop (nested folders, readEntries in batches of 100, as Chrome hands
// them out). Photographs each browser mid-drag.
// usage: node study_check.mjs   (needs the stigmergy app's playwright, with
//        `npx playwright install webkit firefox` run once in that app)
import { chromium, firefox, webkit } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { execFileSync } from 'node:child_process';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const ROOT = path.resolve(HERE, '../../..');
const srv = http.createServer((q, r) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!fs.existsSync(p)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': p.endsWith('.css') ? 'text/css' : 'text/html' }); r.end(fs.readFileSync(p));
}).listen(5912);
const AK = path.join(os.homedir(), 'Desktop/AKWF/AKWF_fmsynth');
const files = fs.readdirSync(AK).filter(n => n.endsWith('.wav')).map(n => path.join(AK, n));
const ref = path.join(os.tmpdir(), 'study_check_ref.wav');
execFileSync('node', [path.join(HERE, 'pack_folder.cjs'), AK, ref, 'chain', '0']);
const refBytes = fs.readFileSync(ref);

// Screen point of a world point, in page pixels.
const project = (pg, x, y, z) => pg.evaluate(([x, y, z]) => {
  const { VIZ } = window.__wavetable, v = new THREE.Vector3(x, y, z).project(VIZ.camera);
  const r = VIZ.canvas.getBoundingClientRect();
  return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
}, [x, y, z]);
const zOf = p => -2 + 4 * p;

const report = {};
for (const [name, type, opts] of [['chrome', chromium, { channel: 'chrome' }], ['firefox', firefox, {}], ['webkit', webkit, {}]]) {
  const R = report[name] = {};
  let b;
  try { b = await type.launch(opts); } catch (e) { R.launch_error = e.message.split('\n')[0]; continue; }
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1500 }, acceptDownloads: true });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  try {
    await pg.goto('http://localhost:5912/Projects/Wavetable%20Scanner/wavetable_scanner_study.html');
    await pg.waitForFunction(() => window.__wavetable && window.__wavetable.VIZ.drag, null, { timeout: 15000 });
    R.version = b.version();
    R.webgl = await pg.evaluate(() => { const g = window.__wavetable.VIZ.renderer.getContext(); return g.getParameter(g.VERSION); });
    await pg.click('#engage'); await pg.waitForTimeout(800);
    R.audio = await pg.evaluate(() => ({ state: audioCtx && audioCtx.state, worklet: !!wtNode, rate: audioCtx && audioCtx.sampleRate }));

    const t0 = Date.now();
    await pg.setInputFiles('#cFile', files);
    await pg.waitForFunction(() => /cycles packed/.test(document.getElementById('vFile').textContent), null, { timeout: 30000 });
    R.pack_ms_wall = Date.now() - t0;
    R.packed = await pg.evaluate(() => document.getElementById('vFile').textContent);
    const dl = pg.waitForEvent('download'); await pg.click('#cExport'); const d = await dl;
    const got = fs.readFileSync(await d.path());
    R.export_matches_node = got.equals(refBytes);

    // Drag: grab the plane at Position 0.1, carry it to 0.8, then back to 0.35.
    await pg.evaluate(() => { const el = document.getElementById('cPos'); el.value = 0.1; el.dispatchEvent(new Event('input')); });
    await pg.waitForTimeout(200);
    const grab = await project(pg, 1.2, 0.6, zOf(0.1));
    await pg.mouse.move(grab.x, grab.y); await pg.waitForTimeout(100);
    R.hover_cursor = await pg.evaluate(() => window.__wavetable.VIZ.canvas.style.cursor);
    const cam0 = await pg.evaluate(() => window.__wavetable.VIZ.camera.position.toArray().map(v => +v.toFixed(3)));
    await pg.mouse.down();
    for (const target of [0.8, 0.35]) {
      const to = await project(pg, 1.2, 0.6, zOf(target));
      await pg.mouse.move(to.x, to.y, { steps: 12 });
      R['pos_after_drag_to_' + target] = await pg.evaluate(() => +window.__wavetable.state.pos.toFixed(3));
    }
    await pg.screenshot({ path: path.join(HERE, `shot-drag-${name}.png`), clip: { x: 100, y: 340, width: 1080, height: 560 } });
    await pg.mouse.up();
    R.slider_follows = await pg.evaluate(() => document.getElementById('cPos').value);
    R.camera_still_during_drag = JSON.stringify(cam0) === JSON.stringify(await pg.evaluate(() => window.__wavetable.VIZ.camera.position.toArray().map(v => +v.toFixed(3))));

    // Orbit: a press far from the plane should turn the camera and leave Position alone.
    const posBefore = await pg.evaluate(() => window.__wavetable.state.pos);
    const box = await pg.evaluate(() => { const r = window.__wavetable.VIZ.canvas.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    await pg.mouse.move(box.x + 60, box.y + box.h - 60); await pg.mouse.down();
    await pg.mouse.move(box.x + 260, box.y + box.h - 90, { steps: 10 }); await pg.mouse.up(); await pg.waitForTimeout(600);
    const cam1 = await pg.evaluate(() => window.__wavetable.VIZ.camera.position.toArray().map(v => +v.toFixed(3)));
    R.orbit_moves_camera = JSON.stringify(cam0) !== JSON.stringify(cam1);
    R.orbit_leaves_position = posBefore === await pg.evaluate(() => window.__wavetable.state.pos);

    // From the new angle, grab again and carry to 0.9.
    const g2 = await project(pg, 1.2, 0.6, zOf(0.35)); await pg.mouse.move(g2.x, g2.y); await pg.mouse.down();
    const t2 = await project(pg, 1.2, 0.6, zOf(0.9)); await pg.mouse.move(t2.x, t2.y, { steps: 12 }); await pg.mouse.up();
    R.pos_after_drag_from_new_angle_to_0_9 = await pg.evaluate(() => +window.__wavetable.state.pos.toFixed(3));

    // The folder-drop walker, on a mocked drop: a folder of 250 files in batches
    // of 100, one nested folder of 3, and a stray .txt.
    R.drop_walker_files = await pg.evaluate(async () => {
      const file = n => ({ isFile: true, isDirectory: false, file: ok => ok(new File([new Uint8Array(4)], n)) });
      const dir = kids => ({ isFile: false, isDirectory: true, createReader: () => {
        let i = 0; return { readEntries: ok => setTimeout(() => { ok(kids.slice(i, i + 100)); i += 100; }) }; } });
      const inner = dir([file('a.wav'), file('b.wav'), file('c.wav')]);
      const top = dir([...Array.from({ length: 250 }, (_, i) => file(`f${i}.wav`)), inner, file('notes.txt')]);
      const got = await filesFromDrop({ items: [{ webkitGetAsEntry: () => top }], files: [] });
      return got.length;
    });
  } catch (e) { R.error = e.message.split('\n')[0]; }
  R.page_errors = errs;
  await b.close();
}
srv.close();
fs.writeFileSync(path.join(HERE, 'study_check.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
