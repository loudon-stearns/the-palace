// Opens study v1.8 in Chrome and photographs the board in five states, so the
// links can be checked by eye without the video: default, rigid bridge, soft
// bridge, small board, big board. Logs page errors.
// usage: node stills.mjs   (needs Google Chrome and the stigmergy app's playwright)
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const PAGE = path.join(HERE, '..', 'study-v1.8-the-body', 'index.html');
const srv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(fs.readFileSync(PAGE)); }).listen(5899);
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const pg = await (await b.newContext({ viewport: { width: 1100, height: 680 } })).newPage();
const errors = []; pg.on('pageerror', e => errors.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await pg.goto('http://localhost:5899/'); await pg.waitForTimeout(1200);
await pg.click('#gateBtn'); await pg.waitForTimeout(500);
await pg.mouse.move(1050, 650);
const STATES = [
  ['default', { bridge: 0.985, body: 0.5 }],
  ['bridge-rigid', { bridge: 1.0, body: 0.5 }],
  ['bridge-soft', { bridge: 0.9, body: 0.5 }],
  ['body-small', { bridge: 0.985, body: 0.12 }],
  ['body-big', { bridge: 0.985, body: 1.0 }],
];
const out = [];
for (const [name, s] of STATES) {
  await pg.evaluate((s) => { for (const [k, v] of Object.entries(s)) setSlider(k, v); pluck(0.3, 'pluck'); }, s);
  await pg.waitForTimeout(name === 'bridge-soft' ? 120 : 450);
  const st = await pg.evaluate(() => ({ db: 20 * Math.log10(meterPeak + 1e-9), env: latestBody ? Array.from(latestBody.env).reduce((a, b) => a + b, 0) : null, drive: latestBody && latestBody.drive }));
  const f = path.join(HERE, 'still-' + name + '.png'); await pg.screenshot({ path: f });
  out.push({ name, ...s, meter_dbfs: +st.db.toFixed(1), board_motion: st.env && +st.env.toFixed(3), post_drive: st.drive && +st.drive.toFixed(4) });
}
await b.close(); srv.close();
console.log(JSON.stringify({ errors, out }, null, 1));
fs.writeFileSync(path.join(HERE, 'stills.json'), JSON.stringify({ errors, out }, null, 1));
