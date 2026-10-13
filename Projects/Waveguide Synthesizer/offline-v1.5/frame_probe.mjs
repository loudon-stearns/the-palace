// Loads study v1.5 inside an iframe sandboxed exactly as the board's ArtifactSlot
// does (sandbox="allow-scripts", 480 px tall), clicks the start door once, then
// moves the stiffness and pitch sliders the way a hand would and reads what the
// stiffness label says, plucks and reads the output meter, and screenshots the
// open slider panel. Runs twice: worklet normal, then worklet forced to fail
// (the main-thread fallback). Needs Google Chrome + the stigmergy app's playwright.
// usage: node frame_probe.mjs
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const INST = path.join(HERE, '..', 'study-v1.5-even-stiffness', 'index.html');
const HOST = '<body style="margin:0"><iframe src="/inst.html" sandbox="allow-scripts" style="width:900px;height:480px;border:0"></iframe></body>';
const srv = http.createServer((q, r) => {
  r.writeHead(200, { 'content-type': 'text/html' });
  r.end(q.url.startsWith('/inst.html') ? fs.readFileSync(INST) : HOST);
}).listen(5898);
const b = await chromium.launch({ channel: 'chrome' });
const meter = async (fr, ms) => { let pk = 0; for (let i = 0; i < ms / 50; i++) { await new Promise(r => setTimeout(r, 50)); pk = Math.max(pk, await fr.evaluate(() => meterPeak)); } return +(20 * Math.log10(pk + 1e-9)).toFixed(1); };
const slide = (fr, id, v) => fr.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input')); }, [id, v]);
const label = (fr) => fr.evaluate(() => document.getElementById('vStiffNote').textContent);
const out = [];
for (const breakIt of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 900, height: 480 } });
  if (breakIt) await ctx.addInitScript(() => { if (window.AudioWorklet)
    AudioWorklet.prototype.addModule = () => Promise.reject(new DOMException('blocked for test', 'AbortError')); });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('http://localhost:5898/'); await pg.waitForTimeout(2000);
  const fr = pg.frames()[1];
  await pg.mouse.click(450, 240);
  const pluckPeak = await meter(fr, 1200);
  const r = { engine: breakIt ? 'main thread (forced)' : 'audio thread', pluckPeak, labels: {} };
  for (let s = 0; s <= 1.0001; s += 0.01) await slide(fr, 'stiff', s.toFixed(2));   // a full drag
  for (const [st, f] of [[0, 196], [0.67, 196], [0.67, 82], [0.67, 659], [1, 82], [1, 440]]) {
    await slide(fr, 'stiff', st); await slide(fr, 'freq', f); await fr.waitForTimeout(150);
    r.labels[`stiff ${st} @ ${f} Hz`] = await label(fr);
  }
  await slide(fr, 'stiff', 0.67); await slide(fr, 'freq', 196);
  await fr.evaluate(() => pluck(0.13, 'strike'));
  r.stiffPluckPeak = await meter(fr, 1000);
  if (!breakIt) {
    if (await fr.$('#more') && await fr.evaluate(() => document.body.classList.contains('short'))) await fr.click('#more');
    await fr.waitForTimeout(300); await pg.screenshot({ path: path.join(HERE, 'board-frame-stiffness.png') });
  }
  r.errors = errs; out.push(r); await ctx.close();
}
await b.close(); srv.close();
fs.writeFileSync(path.join(HERE, 'frame-probe.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
