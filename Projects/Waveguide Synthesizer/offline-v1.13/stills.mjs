// Opens study v1.13 in Chrome on the stand-in speaker clock, holds the bow at
// three forces, and photographs the grip chart's pull panel at each, then a run
// of slowed frames at the default so the dot can be seen sitting at half and
// kicked over. Logs page errors and what the chart says.
// usage: node stills.mjs   (needs Google Chrome and the stigmergy app's playwright)
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const PAGE = path.join(HERE, '..', 'study-v1.13-the-hair-holds-at-half', 'index.html');
const srv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(fs.readFileSync(PAGE)); }).listen(5931);
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
await pg.addInitScript({ path: path.join(HERE, 'fake_audio_clock.js') });
const errors = []; pg.on('pageerror', e => errors.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await pg.goto('http://localhost:5931/'); await pg.waitForTimeout(1200);
await pg.click('#gateBtn'); await pg.waitForTimeout(400);
await pg.mouse.move(1270, 710);
const DEF = { bspd: 0.5, bfrc: 0.6, bpos: 0.74 };
const out = []; fs.mkdirSync(path.join(HERE, 'frames'), { recursive: true });
for (const [name, s] of [['light', { bfrc: 0.3 }], ['singing', {}], ['heavy', { bfrc: 1.0 }]]) {
  await pg.evaluate((s) => { for (const [k, v] of Object.entries(s)) setSlider(k, v); setBow(true); }, { ...DEF, ...s });
  await pg.waitForTimeout(1800);
  await pg.locator('#grip').screenshot({ path: path.join(HERE, 'frames', 'pull-' + name + '.png') });
  out.push({ name, ...DEF, ...s, chart_says: await pg.evaluate(() => $('gripState').textContent) });
  await pg.evaluate(() => setBow(false)); await pg.waitForTimeout(700);
}
await pg.evaluate((d) => { for (const [k, v] of Object.entries(d)) setSlider(k, v); setSlider('slow', 6); setBow(true); }, DEF);
await pg.waitForTimeout(1800);
await pg.screenshot({ path: path.join(HERE, 'still-singing-full.png') });
const seq = [];
for (let i = 0; i < 8; i++) {
  await pg.locator('#grip').screenshot({ path: path.join(HERE, 'frames', 'slow-' + String(i).padStart(2, '0') + '.png') });
  seq.push(await pg.evaluate(() => ({ phase: +gripCursor.toFixed(3), holding: gripAt >= 0.98 })));
  await pg.waitForTimeout(700);
}
await b.close(); srv.close();
const res = { errors, out, slow_frames: seq };
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(path.join(HERE, 'stills.json'), JSON.stringify(res, null, 1));
