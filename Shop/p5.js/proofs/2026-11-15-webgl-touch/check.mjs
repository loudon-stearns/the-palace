#!/usr/bin/env node
// check.mjs — the WebGL field for mouse and finger, measured headless. Born 2026-11-15 for [[p5.js]].
// Loads webgl-touch.html in headless Chromium (file://) twice:
//   desktop, 1130 wide: the canvas is WebGL2; the real mouse moved over the field presses boxes, and the pressed
//     boxes sit under the mouse (their screenshot centroid within 0.12 of it).
//   phone, 390 x 844, touch, mobile: two fingers put down through Chrome's input pipeline (CDP Input.dispatchTouchEvent)
//     are both seen in p5's touches array and press two separate places; one finger dragged up on the field does not
//     scroll the page, while the same drag on the text below does (the control, so the rule can fail). The test adds
//     1500 px of padding under the page so there is somewhere to scroll; the piece itself doesn't have it.
//   It also records, as a finding, which p5 handlers one tap fired (does a tap also call mousePressed in 1.x?).
// Writes measured.json and screenshots beside itself. Exits 1 if a rule fails.
// How a finger feels against the mouse is Loudon's hand and eye, not this. A maker who can measure it better does so.
//   node Shop/p5.js/proofs/2026-11-15-webgl-touch/check.mjs
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { writeFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../../../..');
const { chromium } = await import(pathToFileURL(join(ROOT, '_ops/stigmergy/app/node_modules/playwright/index.mjs')).href);
const url = pathToFileURL(join(here, 'webgl-touch.html')).href;
const browser = await chromium.launch();
const consoleErrors = [], pageErrors = [];
const watch = (page) => {
  page.on('console', m => { if (m.type() === 'error' && !/GPU stall/.test(m.text())) consoleErrors.push(m.text().slice(0, 300)); });
  page.on('pageerror', e => pageErrors.push(e.message));
};
const frames = (page, n) => page.evaluate((n) => { for (let i = 0; i < n; i++) window.__sketch.redraw(); }, n);
const probe = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.__probe)));
const canvasBox = (page) => page.locator('#stage canvas').boundingBox();

// ---- desktop: the mouse
const desk = await browser.newPage({ viewport: { width: 1130, height: 900 } });
watch(desk);
await desk.goto(url);
await desk.waitForFunction(() => window.__sketch && window.__probe && window.__probe.webgl);
let box = await canvasBox(desk);
const mouseAt = { fx: 0.3, fy: 0.55 };
await desk.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
await desk.mouse.move(box.x + box.width * mouseAt.fx, box.y + box.height * mouseAt.fy, { steps: 5 });
await frames(desk, 30);
const deskProbe = await probe(desk);
// centroid of the pressed boxes, read from the canvas: the accent-warm pixels
const warmCentroid = (page) => page.evaluate(() => {
  const src = window.__sketch.canvas; window.__sketch.redraw();
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  const g = c.getContext('2d'); g.drawImage(src, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const T = palaceTokens(); const m = /#?(..)(..)(..)/.exec(T.accent); const a = [1, 2, 3].map(i => parseInt(m[i], 16));
  // warm = hue near the accent: red and green well above blue, in the accent's ratio
  let n = 0, sx = 0, sy = 0, xs = [];
  for (let y = 0; y < c.height; y += 2) for (let x = 0; x < c.width; x += 2) {
    const i = (y * c.width + x) * 4, r = d[i], gg = d[i + 1], b = d[i + 2];
    if (r > 90 && r - b > 0.6 * (a[0] - a[2]) && gg - b > 0.4 * (a[1] - a[2])) { n++; sx += x; sy += y; xs.push(x / c.width); }
  }
  xs.sort((p, q) => p - q);
  return { warm_share: n / (c.width * c.height / 4), fx: n ? sx / n / c.width : null, fy: n ? sy / n / c.height : null, xs_gap: (() => { let gmax = 0; for (let i = 1; i < xs.length; i++) gmax = Math.max(gmax, xs[i] - xs[i - 1]); return gmax; })() };
});
const deskWarm = await warmCentroid(desk);
await desk.screenshot({ path: join(here, 'webgl-touch-desktop-mouse.png'), fullPage: true });

// ---- phone: fingers
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const phone = await ctx.newPage();
watch(phone);
await phone.goto(url);
await phone.waitForFunction(() => window.__sketch && window.__probe && window.__probe.webgl);
const cdp = await ctx.newCDPSession(phone);
const touch = (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points });
box = await canvasBox(phone);
const P = (fx, fy, id) => ({ x: box.x + box.width * fx, y: box.y + box.height * fy, id });

// one tap: which handlers fire?
const before = await probe(phone);
await touch('touchStart', [P(0.5, 0.5, 0)]);
await touch('touchEnd', []);
await phone.waitForTimeout(400);
const afterTap = await probe(phone);
const tapFired = Object.fromEntries(['mouseMoved', 'mousePressed', 'touchStarted', 'touchMoved', 'touchEnded'].map(k => [k, afterTap[k] - before[k]]));

// two fingers, held
const f1 = { fx: 0.2, fy: 0.5 }, f2 = { fx: 0.8, fy: 0.5 };
await touch('touchStart', [P(f1.fx, f1.fy, 1), P(f2.fx, f2.fy, 2)]);
await touch('touchMove', [P(f1.fx + 0.01, f1.fy, 1), P(f2.fx - 0.01, f2.fy, 2)]);
await frames(phone, 30);
const twoProbe = await probe(phone);
const twoWarm = await warmCentroid(phone);
await phone.screenshot({ path: join(here, 'webgl-touch-phone-two-fingers.png'), fullPage: true });
await touch('touchEnd', []);
await frames(phone, 30);
const releasedProbe = await probe(phone);

// does the page hold still under a finger on the field? and scroll under one on the text (the control)?
await phone.evaluate(() => { document.body.style.paddingBottom = '1500px'; window.scrollTo(0, 0); });
const drag = async (x, y0, y1) => {
  await touch('touchStart', [{ x, y: y0, id: 9 }]);
  for (let i = 1; i <= 10; i++) await touch('touchMove', [{ x, y: y0 + (y1 - y0) * i / 10, id: 9 }]);
  await touch('touchEnd', []);
  await phone.waitForTimeout(600);
  return phone.evaluate(() => window.scrollY);
};
box = await canvasBox(phone);
const cx = box.x + box.width / 2;
const scrollOnField = await drag(cx, box.y + box.height * 0.85, box.y + box.height * 0.15);
await phone.evaluate(() => window.scrollTo(0, 0));
await phone.waitForTimeout(200);
const textBox = await phone.locator('main > p.read').boundingBox();
const scrollOnText = await drag(cx, textBox.y + textBox.height / 2, textBox.y + textBox.height / 2 - 200);
await browser.close();

const near = (a, b, tol) => a != null && Math.abs(a - b) <= tol;
const rules = [
  ['the canvas is WebGL2', deskProbe.webgl === 'webgl2'],
  ['no page errors', pageErrors.length === 0],
  ['no console errors', consoleErrors.length === 0],
  ['the mouse presses boxes', deskProbe.pressed > 0 && deskProbe.sources[0]?.kind === 'mouse'],
  ['the pressed boxes sit under the mouse (centroid within 0.12)', near(deskWarm.fx, mouseAt.fx, 0.12) && near(deskWarm.fy, mouseAt.fy, 0.12)],
  ['two fingers seen at once in p5 touches', twoProbe.maxTouches >= 2 && twoProbe.sources.length === 2 && twoProbe.sources.every(s => s.kind === 'touch')],
  ['two fingers press two separate places (a gap of 0.25 across the warm pixels)', twoWarm.xs_gap > 0.25],
  ['the field springs back when the fingers lift', releasedProbe.pressed === 0],
  ['a finger dragged on the field does not scroll the page', scrollOnField === 0],
  ['the same drag on the text does scroll it (control)', scrollOnText > 50],
];
const out = {
  measured: new Date().toISOString(),
  host: 'headless Chromium (playwright), SwiftShader WebGL; desktop 1130 x 900; phone 390 x 844 at 2x, touch and mobile emulated, touches sent by CDP Input.dispatchTouchEvent',
  p5: '1.10.0',
  desktop: { mouse_at: mouseAt, probe: deskProbe, warm: deskWarm },
  phone: { one_tap_fired: tapFired, two_fingers_at: [f1, f2], probe_two: twoProbe, warm_two: twoWarm, pressed_after_lift: releasedProbe.pressed, scrollY_after_drag_on_field: scrollOnField, scrollY_after_drag_on_text: scrollOnText },
  console_errors: consoleErrors, page_errors: pageErrors,
  rules: rules.map(([name, ok]) => ({ name, ok })),
  pass: rules.every(([, ok]) => ok),
  not_measured: 'a real phone or tablet, a real finger, and how pressing feels; frame rate on a real GPU',
};
writeFileSync(join(here, 'measured.json'), JSON.stringify(out, null, 2) + '\n');
for (const [name, ok] of rules) console.log((ok ? 'ok   ' : 'FAIL ') + name);
console.log(JSON.stringify({ tapFired, deskWarm, twoWarm, scrollOnField, scrollOnText }, null, 1));
process.exit(out.pass ? 0 : 1);
