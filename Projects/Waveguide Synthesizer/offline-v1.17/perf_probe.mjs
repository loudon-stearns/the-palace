// How smooth is the string on a slow phone? Opens a study page as a phone (touch,
// 3x pixels), slows Chrome's CPU by a factor (4x by default, Chrome's "low-end
// mobile" preset), and for five seconds in each of five states counts frames and
// times where each frame's work goes: the scene update (drawScene), the WebGL
// draw (renderer.render), and the sound engine. On the stand-in speaker clock the
// engine runs on the main thread, so it steals frame time a real phone's audio
// thread would not; the table reports it separately so it can be set aside.
// Headless Chrome draws WebGL in software, so render times are a pessimistic bound.
// usage: node perf_probe.mjs <study-folder> <tag> [throttle]
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const PAGE = path.join(HERE, '..', process.argv[2], 'index.html'); const TAG = process.argv[3]; const RATE = +(process.argv[4] || 4);
const srv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(fs.readFileSync(PAGE)); }).listen(5962);
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader'] });
const res = { throttle: RATE, page: process.argv[2], errors: [], sizes: [] };
const SIZES = [['phone', 390, 844], ['phone-flat', 844, 390]];
const meter = (ms) => async (pg) => {
  await pg.evaluate(() => { window.__eng = 0; window.__f = []; window.__ds = 0; window.__rr = 0; const g = window.__gen = (window.__gen || 0) + 1; window.__mon = true;
    const loop = (t) => { if (!__mon || __gen !== g) return; __f.push(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
  await pg.waitForTimeout(ms);
  return pg.evaluate(() => { __mon = false; const f = __f, d = []; for (let i = 1; i < f.length; i++) d.push(f[i] - f[i - 1]);
    const secs = (f[f.length - 1] - f[0]) / 1000, n = d.length; d.sort((a, b) => a - b);
    return { fps: +(n / secs).toFixed(1), p95_ms: +d[Math.floor(n * 0.95)].toFixed(1), worst_ms: +d[n - 1].toFixed(1),
      scene_ms: +(__ds / n).toFixed(2), draw_ms: +(__rr / n).toFixed(2), engine_ms_per_frame: +(__eng / n).toFixed(2),
      drops_over_20ms: d.filter(x => x > 20).length, frames: n }; });
};
for (const [name, w, h] of SIZES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  await pg.addInitScript({ path: path.join(HERE, 'fake_audio_clock_timed.js') });
  pg.on('pageerror', e => res.errors.push(name + ': ' + e.message));
  await pg.goto('http://localhost:5962/'); await pg.waitForTimeout(1500);
  await pg.tap('#gateBtn'); await pg.waitForTimeout(500);
  await pg.evaluate(() => { window.__ds = 0; window.__rr = 0; window.__eng = 0; const D = window.drawScene; window.drawScene = function (...a) { const t = performance.now(); const r = D.apply(this, a); __ds += performance.now() - t; return r; };
    const R = renderer.render.bind(renderer); renderer.render = (s, c) => { const t = performance.now(); R(s, c); __rr += performance.now() - t; }; });
  const cdp = await ctx.newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });
  const m = { size: name + ' ' + w + 'x' + h };
  m.idle = await meter(4000)(pg);
  await pg.evaluate(() => $('pluck').click()); m.plucked = await meter(4000)(pg);
  await pg.evaluate(() => $('bow').dispatchEvent(new PointerEvent('pointerdown', { pointerId: 21, pointerType: 'touch', bubbles: true })));
  await pg.waitForTimeout(500); m.bowing = await meter(4000)(pg);
  await pg.evaluate(() => $('bow').dispatchEvent(new PointerEvent('pointerup', { pointerId: 21, pointerType: 'touch', bubbles: true })));
  await pg.evaluate(() => $('lessonBtn').click()); await pg.waitForTimeout(800);
  await pg.evaluate(() => $('pluck').click()); m.lesson = await meter(4000)(pg);
  m.pixel_ratio = await pg.evaluate(() => renderer.getPixelRatio());
  res.sizes.push(m); console.log(JSON.stringify(m));
  await ctx.close();
}
fs.writeFileSync(path.join(HERE, `perf-${TAG}.json`), JSON.stringify(res, null, 1));
console.log('errors', res.errors); await b.close(); srv.close();
