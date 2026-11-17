// Where does the scene update's time go? Times each piece of drawScene, and the
// level meter, at a given CPU slowdown on an upright phone, idle and bowing.
// usage: node split_probe.mjs <study-folder> [throttle]
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const PAGE = path.join(HERE, '..', process.argv[2], 'index.html'); const RATE = +(process.argv[3] || 8);
const srv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(fs.readFileSync(PAGE)); }).listen(5963);
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const pg = await ctx.newPage(); await pg.addInitScript({ path: path.join(HERE, 'fake_audio_clock_timed.js') });
const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.goto('http://localhost:5963/'); await pg.waitForTimeout(1500); await pg.tap('#gateBtn'); await pg.waitForTimeout(500);
await pg.evaluate(() => { window.__t = {}; window.__n = 0;
  for (const f of ['drawScene', 'drawGrip', 'drawLadder', 'drawBoard', 'fitToFrame', 'setLabel', 'drawEnd', 'walkStep', 'lessonStep', 'waveAt', 'updateMeter']) {
    const F = window[f]; if (!F) continue; window[f] = function (...a) { const t = performance.now(); const r = F.apply(this, a); __t[f] = (__t[f] || 0) + performance.now() - t; if (f === 'drawScene') __n++; return r; }; } });
const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });
const take = async () => { await pg.evaluate(() => { __t = {}; __n = 0; }); await pg.waitForTimeout(4000);
  return pg.evaluate(() => Object.fromEntries(Object.entries(__t).map(([k, v]) => [k, +(v / __n).toFixed(2)]).sort((a, b) => b[1] - a[1]))); };
const out = { throttle: RATE, page: process.argv[2] };
await pg.evaluate(() => $('pluck').click()); out.plucked = await take();
await pg.evaluate(() => $('bow').dispatchEvent(new PointerEvent('pointerdown', { pointerId: 21, pointerType: 'touch', bubbles: true })));
await pg.waitForTimeout(500); out.bowing = await take();
console.log(JSON.stringify(out, null, 1)); console.log('errors', errs);
await b.close(); srv.close();
