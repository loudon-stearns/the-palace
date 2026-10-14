// Opens study v1.9 in Chrome, holds the bow, and photographs the grip chart
// and the string at five bow settings (default, light force, heavy force, near
// the bridge, fast), plus a run of frames at the default so one catch and one
// release can be seen in order. Logs page errors and what the chart says.
// usage: node stills.mjs   (needs Google Chrome and the stigmergy app's playwright)
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const PAGE = path.join(HERE, '..', 'study-v1.9-the-bow-grips', 'index.html');
const srv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(fs.readFileSync(PAGE)); }).listen(5911);
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const pg = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
// this machine's audio device would not render on 2026-10-14; see fake_audio_clock.js
if (process.env.FAKE_CLOCK !== '0') await pg.addInitScript({ path: path.join(HERE, 'fake_audio_clock.js') });
const errors = []; pg.on('pageerror', e => errors.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await pg.goto('http://localhost:5911/'); await pg.waitForTimeout(1200);
await pg.click('#gateBtn'); await pg.waitForTimeout(400);
await pg.mouse.move(1270, 710);
const STATES = [
  ['default', {}], ['light-force', { bfrc: 0.2 }], ['heavy-force', { bfrc: 1.0 }],
  ['near-bridge', { bpos: 0.93 }], ['fast', { bspd: 1.0 }],
];
const DEF = { bspd: 0.5, bfrc: 0.7, bpos: 0.74 };
const out = [];
for (const [name, s] of STATES) {
  await pg.evaluate((s) => { for (const [k, v] of Object.entries(s)) setSlider(k, v); setBow(true); }, { ...DEF, ...s });
  await pg.waitForTimeout(1500);
  const f = path.join(HERE, 'still-' + name + '.png'); await pg.screenshot({ path: f });
  out.push({ name, ...DEF, ...s, chart_says: await pg.evaluate(() => $('gripState').textContent),
    meter_dbfs: +(await pg.evaluate(() => 20 * Math.log10(meterPeak + 1e-9))).toFixed(1) });
  await pg.evaluate(() => setBow(false)); await pg.waitForTimeout(700);
}
// one catch and one release, in order: default bow, slow motion 6 s a cycle
await pg.evaluate((d) => { for (const [k, v] of Object.entries(d)) setSlider(k, v); setSlider('slow', 6); setBow(true); }, DEF);
await pg.waitForTimeout(1500);
const seq = [];
for (let i = 0; i < 12; i++) {
  const f = path.join(HERE, 'frames', 'cycle-' + String(i).padStart(2, '0') + '.png');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  await pg.screenshot({ path: f });
  seq.push(await pg.evaluate(() => ({ phase: +gripCursor.toFixed(3), holding: gripAt >= 0.98 })));
  await pg.waitForTimeout(500);
}
await b.close(); srv.close();
const res = { errors, out, cycle_frames: seq };
console.log(JSON.stringify(res, null, 1));
fs.writeFileSync(path.join(HERE, 'stills.json'), JSON.stringify(res, null, 1));
