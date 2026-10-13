// Opens study v1.6 in Chrome, plucks and holds the strobe still, then moves
// each slider to its two ends and photographs the scene at each: the before
// and after of every control. Also checks the audio is v1.5's (same output
// meter after the same pluck) and that no errors were thrown.
// usage: node slider_sheet.mjs   (needs Google Chrome + the stigmergy app's playwright)
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const PAGES = { v16: path.join(HERE, '..', 'study-v1.6-every-slider-shows', 'index.html'),
  v15: path.join(HERE, '..', 'study-v1.5-even-stiffness', 'index.html') };
const srv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' });
  r.end(fs.readFileSync(q.url.includes('v15') ? PAGES.v15 : PAGES.v16)); }).listen(5899);
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const slide = (pg, id, v) => pg.evaluate(([id, v]) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input')); }, [id, String(v)]);
const meter = async (pg, ms) => { let pk = 0; for (let i = 0; i < ms / 50; i++) { await pg.waitForTimeout(50); pk = Math.max(pk, await pg.evaluate(() => meterPeak)); } return +(20 * Math.log10(pk + 1e-9)).toFixed(1); };
const out = { meters: {}, shots: [], errors: [] };
for (const v of ['v15', 'v16']) {
  const ctx = await b.newContext({ viewport: { width: 1100, height: 720 } });
  const pg = await ctx.newPage(); pg.on('pageerror', e => out.errors.push(v + ': ' + e.message));
  await pg.goto('http://localhost:5899/' + v); await pg.waitForTimeout(1500);
  await pg.mouse.click(550, 360); out.meters[v] = await meter(pg, 1000);
  if (v === 'v15') { await ctx.close(); continue; }
  const DIR = path.join(HERE, 'frames'); fs.mkdirSync(DIR, { recursive: true });
  const SL = [['freq', 60, 880, 'pitch'], ['bright', 0, 1, 'brightness'], ['bridge', 0.9, 1, 'bridge loss'],
    ['nut', 0.9, 1, 'nut loss'], ['stiff', 0, 1, 'stiffness'], ['pick', 0.1, 0.9, 'pickup'],
    ['bspd', 0, 1, 'bow speed'], ['bfrc', 0, 1, 'bow force'], ['bpos', 0.55, 0.95, 'bow position']];
  const DEF = { freq: 196, bright: 0.55, bridge: 0.985, nut: 0.995, stiff: 0, pick: 0.82, bspd: 0.5, bfrc: 0.7, bpos: 0.74 };
  for (const [id, lo, hi, name] of SL) {
    for (const [k, val] of Object.entries(DEF)) await slide(pg, k, val);
    const bowed = id.startsWith('b') && id !== 'bright' && id !== 'bridge';
    for (const [tag, val] of [['lo', lo], ['hi', hi]]) {
      await slide(pg, id, val); await pg.waitForTimeout(200);
      // a fresh pluck (or a held bow) for every photo, so the string is moving in each
      await pg.evaluate(() => { if (view.hold) toggleHold(); });
      if (bowed) { await pg.evaluate(() => setBow(true)); await pg.waitForTimeout(2200); }
      else { await pg.evaluate(() => pluck(0.3, 'pluck')); await pg.waitForTimeout(40); }
      await pg.evaluate(() => toggleHold()); await pg.waitForTimeout(80);
      const file = path.join(DIR, `${id}-${tag}.png`);
      await pg.screenshot({ path: file, clip: { x: 320, y: 110, width: 780, height: 480 } });
      out.shots.push({ id, name, tag, val, file: path.relative(HERE, file) });
      if (bowed) await pg.evaluate(() => setBow(false));
    }
    // and one hovered frame, to show the flare
    await pg.hover('#' + id); await pg.waitForTimeout(200);
    await pg.screenshot({ path: path.join(DIR, `${id}-hover.png`), clip: { x: 0, y: 0, width: 1100, height: 720 } });
    await pg.mouse.move(1000, 700);
  }
  await ctx.close();
}
await b.close(); srv.close();
fs.writeFileSync(path.join(HERE, 'slider-sheet.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ meters: out.meters, errors: out.errors, shots: out.shots.length }, null, 1));
