// Drives the study page's export buttons in Chrome, Firefox and WebKit: pack the
// 122 AKWF_fmsynth files, click Serum / Vital, Surge .wt and Ableton, compare each
// download with the node export of the same pack (formats_check.cjs), then drop
// the Serum and Surge files back on the page and check they read as 122 frames.
// usage: node formats_browser_check.mjs   (after node formats_check.cjs)
import { chromium, firefox, webkit } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const ROOT = path.resolve(HERE, '../../..');
const srv = http.createServer((q, r) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!fs.existsSync(p)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': p.endsWith('.css') ? 'text/css' : 'text/html' }); r.end(fs.readFileSync(p));
}).listen(5913);
const AK = path.join(os.homedir(), 'Desktop/AKWF/AKWF_fmsynth');
const files = fs.readdirSync(AK).filter(n => n.endsWith('.wav')).map(n => path.join(AK, n));
const ref = { serum: 'akwf_fmsynth_family_chain_serum.wav', surge: 'akwf_fmsynth_family_chain.wt', ableton: 'akwf_fmsynth_family_chain_ableton.wav' };
const report = {};
for (const [name, type, opts] of [['chrome', chromium, { channel: 'chrome' }], ['firefox', firefox, {}], ['webkit', webkit, {}]]) {
  const R = report[name] = {}; let b;
  try { b = await type.launch(opts); } catch (e) { R.launch_error = e.message.split('\n')[0]; continue; }
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1500 }, acceptDownloads: true });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  try {
    await pg.goto('http://localhost:5913/Projects/Wavetable%20Scanner/wavetable_scanner_study.html');
    await pg.waitForFunction(() => window.__wavetable && window.__wavetable.VIZ.drag, null, { timeout: 15000 });
    await pg.click('#engage'); await pg.waitForTimeout(500);
    await pg.setInputFiles('#cFile', files);
    await pg.waitForFunction(() => /cycles packed/.test(document.getElementById('vFile').textContent), null, { timeout: 30000 });
    const saved = {};
    for (const kind of Object.keys(ref)) {
      const dl = pg.waitForEvent('download'); await pg.click(`#exportSeg [data-kind=${kind}]`); const d = await dl;
      const p = path.join(os.tmpdir(), `fbc_${name}_${d.suggestedFilename()}`); await d.saveAs(p); saved[kind] = p;
      R[`${kind}_matches_node`] = fs.readFileSync(p).equals(fs.readFileSync(path.join(HERE, 'exports', ref[kind])));
      R[`${kind}_name_ends`] = d.suggestedFilename().slice(-24);
    }
    R.export_label = await pg.evaluate(() => document.getElementById('vExport').textContent);
    if (name === 'chrome') await pg.locator('#exportSeg').locator('..').screenshot({ path: path.join(HERE, 'shot-export-buttons.png') });
    for (const kind of ['serum', 'surge']) {
      await pg.setInputFiles('#cFile', [saved[kind]]);
      await pg.waitForFunction(k => document.getElementById('vFile').textContent.includes(k === 'serum' ? 'CLM' : 'Surge'), kind, { timeout: 10000 });
      R[`${kind}_reads_back`] = await pg.evaluate(() => ({ text: document.getElementById('vFile').textContent.split('—').pop().trim(), frames: window.__wavetable.tableData[window.__wavetable.state.tableIdx].frames }));
    }
    if (name === 'chrome') await pg.screenshot({ path: path.join(HERE, 'shot-serum-read-back.png'), clip: { x: 0, y: 0, width: 1280, height: 900 } });
  } catch (e) { R.error = e.message.split('\n')[0]; }
  R.page_errors = errs; await b.close();
}
srv.close();
fs.writeFileSync(path.join(HERE, 'formats_browser_check.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
