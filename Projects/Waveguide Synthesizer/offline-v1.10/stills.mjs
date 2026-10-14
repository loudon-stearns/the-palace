// Opens study v1.10 in Chrome, plucks G3 at four stiffnesses and C5 at 0.7,
// and photographs the overtone ladder and the string a moment after each
// pluck. Logs page errors and what the ladder says.
// usage: node stills.mjs   (needs Google Chrome and the stigmergy app's playwright)
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const PAGE = path.join(HERE, '..', 'study-v1.10-the-overtones-run-sharp', 'index.html');
const srv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(fs.readFileSync(PAGE)); }).listen(5912);
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
if (process.env.FAKE_CLOCK !== '0') await pg.addInitScript({ path: path.join(HERE, 'fake_audio_clock.js') });
const errors = []; pg.on('pageerror', e => errors.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await pg.goto('http://localhost:5912/'); await pg.waitForTimeout(1200);
await pg.click('#gateBtn'); await pg.waitForTimeout(400);
const STATES = [['s0', 196, 0], ['s04', 196, 0.4], ['s07', 196, 0.7], ['s10', 196, 1.0], ['c5-s07', 523, 0.7]];
const out = [];
for (const [name, freq, stiff] of STATES) {
  await pg.mouse.move(1270, 710);
  await pg.evaluate(([f, s]) => { setSlider('freq', f); setSlider('stiff', s); }, [freq, stiff]);
  await pg.waitForTimeout(300);
  await pg.evaluate(() => pluck(0.3, 'pluck')); await pg.waitForTimeout(450);
  // hover the stiffness slider so its links light, as a hand would
  await pg.hover('#stiff'); await pg.waitForTimeout(150);
  await pg.screenshot({ path: path.join(HERE, 'still-' + name + '.png') });
  out.push({ name, freq, stiff, ladder_says: await pg.evaluate(() => $('ladderState').textContent),
    slider_note: await pg.evaluate(() => $('vStiffNote').textContent) });
  await pg.waitForTimeout(900);
}
await b.close(); srv.close();
const res = { errors, out };
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(path.join(HERE, 'stills.json'), JSON.stringify(res, null, 1));
