// draw_budget.mjs — what the 3D landscape costs to draw, table by table, in Chrome.
// Opens the study page, picks each built-in table, then packs the AKWF FM folder (122 frames) and
// times 120 renders of the scene, each finished with a one-pixel read so the GPU's work is counted.
// Reports draw calls, line vertices, geometries, and ms per render. Writes draw_budget.json.
// usage: node draw_budget.mjs        (needs ~/Desktop/AKWF/AKWF_fmsynth for the packed row, and
//        /tmp/wtsc_512.wav — 512 frames thinned from the FM chain — for the largest row)
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const ROOT = path.resolve(HERE, '../../..');
const srv = http.createServer((q, r) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!fs.existsSync(p)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': p.endsWith('.css') ? 'text/css' : 'text/html' }); r.end(fs.readFileSync(p));
}).listen(5913);

const measure = pg => pg.evaluate(() => {
  const { VIZ } = window.__wavetable, R = VIZ.renderer, gl = R.getContext(), px = new Uint8Array(4);
  R.info.autoReset = true; R.render(VIZ.scene, VIZ.camera);
  const calls = R.info.render.calls, lines = R.info.render.lines, geos = R.info.memory.geometries;
  let verts = 0; VIZ.scene.traverse(o => { if (o.isLine && o.geometry.attributes.position) verts += o.geometry.attributes.position.count; });
  const t = [];
  for (let i = 0; i < 120; i++) { const t0 = performance.now(); R.render(VIZ.scene, VIZ.camera); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); t.push(performance.now() - t0); }
  t.sort((a, b) => a - b);
  return { draw_calls: calls, lines, geometries: geos, line_vertices: verts, ms_median: +t[60].toFixed(2), ms_p95: +t[114].toFixed(2) };
});

const b = await chromium.launch({ channel: 'chrome', args: ['--enable-gpu', '--use-angle=metal', '--ignore-gpu-blocklist'] });
const pg = await (await b.newContext({ viewport: { width: 1280, height: 1500 }, deviceScaleFactor: 2 })).newPage();
await pg.goto('http://localhost:5913/Projects/Wavetable%20Scanner/wavetable_scanner_study.html');
await pg.waitForFunction(() => window.__wavetable && window.__wavetable.VIZ.drag, null, { timeout: 15000 });
const out = { browser: 'chrome ' + b.version(), pixel_ratio: 2 };
out.gpu = await pg.evaluate(() => { const gl = window.__wavetable.VIZ.renderer.getContext(), e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); });
out.canvas = await pg.evaluate(() => { const c = window.__wavetable.VIZ.canvas; return `${c.width}×${c.height}`; });
out.rows = [];
const n = await pg.evaluate(() => window.__wavetable.tableData.length);
for (let i = 0; i < n; i++) {
  await pg.evaluate(i => { const s = document.getElementById('cTable'); s.value = i; s.dispatchEvent(new Event('change')); }, i);
  await pg.waitForTimeout(300);
  const label = await pg.evaluate(i => window.__wavetable.tableData[i].label + ' · ' + window.__wavetable.tableData[i].frames + ' frames', i);
  out.rows.push({ table: label, ...(await measure(pg)) });
}
const AK = path.join(os.homedir(), 'Desktop/AKWF/AKWF_fmsynth');
if (fs.existsSync(AK)) {
  await pg.setInputFiles('#cFile', fs.readdirSync(AK).filter(f => f.endsWith('.wav')).map(f => path.join(AK, f)));
  await pg.waitForFunction(() => /cycles packed/.test(document.getElementById('vFile').textContent), null, { timeout: 30000 });
  await pg.waitForTimeout(300);
  const label = await pg.evaluate(() => { const w = window.__wavetable, t = w.tableData[w.state.tableIdx]; return t.label + ' · ' + t.frames + ' frames'; });
  out.rows.push({ table: label, ...(await measure(pg)) });
}
// the most frames the study page will show: a single table file is cut to its first 256
const BIG = '/tmp/wtsc_512.wav';
if (fs.existsSync(BIG)) {
  await pg.setInputFiles('#cFile', [BIG]);
  await pg.waitForFunction(() => { const w = window.__wavetable; return w.tableData[w.state.tableIdx].frames === 256; }, null, { timeout: 30000 });
  await pg.waitForTimeout(300);
  const label = await pg.evaluate(() => { const w = window.__wavetable, t = w.tableData[w.state.tableIdx]; return t.label + ' · ' + t.frames + ' frames'; });
  out.rows.push({ table: label, ...(await measure(pg)) });
}
await b.close(); srv.close();
fs.writeFileSync(path.join(HERE, 'draw_budget.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
