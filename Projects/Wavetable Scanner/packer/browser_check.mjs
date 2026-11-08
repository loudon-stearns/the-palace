// Drives wavetable_scanner_study.html in Chrome the way a hand would: pick the
// 122 AKWF_fmsynth files, read the HUD (family chain by default), blur along
// Position, export, and check the downloaded table against the same packer run
// headless; then flip to centroid and file order. Photographs each state.
// usage: node browser_check.mjs   (needs Chrome + the stigmergy app's playwright)
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const ROOT = path.resolve(HERE, '../../..');
const srv = http.createServer((q, r) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!fs.existsSync(p)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': p.endsWith('.css') ? 'text/css' : 'text/html' }); r.end(fs.readFileSync(p));
}).listen(5911);
const AK = path.join(os.homedir(), 'Desktop/AKWF/AKWF_fmsynth');
const files = fs.readdirSync(AK).filter(n => n.endsWith('.wav')).map(n => path.join(AK, n));
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 1280, height: 1500 }, acceptDownloads: true });
const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.goto('http://localhost:5911/Projects/Wavetable%20Scanner/wavetable_scanner_study.html');
await pg.waitForTimeout(1500);
const report = { page_errors: errs };
report.opens_on = await pg.evaluate(() => document.getElementById('hud').innerText);
await pg.screenshot({ path: path.join(HERE, 'shot-demo-cello.png') });
await pg.click('#engage'); await pg.waitForTimeout(500);
report.audio = await pg.evaluate(() => ({ state: audioCtx && audioCtx.state, worklet: !!wtNode }));
const t0 = Date.now();
await pg.setInputFiles('#cFile', files);
await pg.waitForFunction(() => /cycles packed/.test(document.getElementById('vFile').textContent), null, { timeout: 20000 });
report.pack_ms_wall = Date.now() - t0;
report.after_pack = await pg.evaluate(() => ({ file: document.getElementById('vFile').textContent, table: document.getElementById('cTable').selectedOptions[0].textContent }));
for (const [pos, name] of [[0, 'shot-fmsynth-chain-start.png'], [0.62, 'shot-fmsynth-chain-mid.png'], [1, 'shot-fmsynth-chain-end.png']]) {
  await pg.evaluate(p => { const el = document.getElementById('cPos'); el.value = p; el.dispatchEvent(new Event('input')); }, pos);
  await pg.waitForTimeout(300);
  report['hud_chain_pos_' + pos] = await pg.evaluate(() => document.getElementById('hud').innerText);
  await pg.screenshot({ path: path.join(HERE, name) });
}
await pg.click('#smoothSeg [data-smooth="1"]'); await pg.waitForTimeout(500);
report.after_smooth = await pg.evaluate(() => ({ smooth: document.getElementById('vSmooth').textContent, table: document.getElementById('cTable').selectedOptions[0].textContent }));
const dl = pg.waitForEvent('download'); await pg.click('#cExport'); const d = await dl;
const saved = path.join(HERE, 'browser_export_fmsynth_chain_smooth.wav'); await d.saveAs(saved);
report.download_name = d.suggestedFilename().slice(-40);
await pg.click('#smoothSeg [data-smooth="0"]'); await pg.click('#orderSeg [data-order="centroid"]'); await pg.waitForTimeout(400);
report.hud_centroid = await pg.evaluate(() => document.getElementById('hud').innerText);
await pg.click('#orderSeg [data-order="file"]'); await pg.waitForTimeout(400);
report.hud_file_order = await pg.evaluate(() => document.getElementById('hud').innerText);
report.table_count_after_toggles = await pg.evaluate(() => tableData.length);
await b.close(); srv.close();
fs.writeFileSync(path.join(HERE, 'browser_check.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
