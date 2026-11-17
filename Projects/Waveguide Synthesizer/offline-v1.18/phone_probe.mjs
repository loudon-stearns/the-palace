// Opens a study page in Chrome as a phone or tablet (touch, mobile viewport, 3x pixels),
// on the stand-in speaker clock, and checks the three things a phone needs:
//   1. can you see the string: how many of seven points along it are covered by a panel, or off screen;
//   2. does a finger tap on the string pluck it, where you tapped;
//   3. does a held bow survive a second finger touching a slider (the multi-touch case).
// It photographs the open page and the lesson's bow stop at every size.
// usage: node phone_probe.mjs <study-folder> <tag>
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const PAGE = path.join(HERE, '..', process.argv[2], 'index.html'); const TAG = process.argv[3];
const srv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(fs.readFileSync(PAGE)); }).listen(5966);
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const SIZES = [['phone', 390, 844], ['phone-big', 430, 932], ['phone-flat', 844, 390], ['tablet', 820, 1180]];
fs.mkdirSync(path.join(HERE, 'frames'), { recursive: true });
const res = { errors: [], sizes: [] };
const look = () => {
  const R = (el) => { if (!el) return null; const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return null; const r = el.getBoundingClientRect(); return r.width ? r : null; };
  const pts = [0, 0.05, 0.25, 0.5, 0.75, 0.95, 1].map(u => { const v = new THREE.Vector3(-STRING_LEN / 2 + u * STRING_LEN, 0, 0).project(camera);
    return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight }; });
  const inR = (p, r) => r && p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom;
  const panels = ['ui', 'ladder', 'grip', 'lesson', 'hint', 'walkCap', 'dockBar'].map(id => [id, R(document.getElementById(id))]).filter(x => x[1]);
  const covered = pts.map(p => panels.filter(([, r]) => inR(p, r)).map(([id]) => id).join('+') || '-');
  const span = Math.round(Math.abs(pts[6].x - pts[0].x));
  const small = [...document.querySelectorAll('button')].filter(x => R(x)).map(x => { const r = x.getBoundingClientRect(); return [x.id, Math.round(r.height)]; }).filter(([, h]) => h < 40).map(([id]) => id);
  return { covered, offscreen: pts.filter(p => p.x < 0 || p.x > innerWidth || p.y < 0 || p.y > innerHeight).length, span_px: span,
    string_mid: [Math.round(pts[3].x), Math.round(pts[3].y)], at_25: [Math.round(pts[2].x), Math.round(pts[2].y)], buttons_under_40px: small,
    page_scroll: document.scrollingElement.scrollHeight > innerHeight + 1, canvas_touch_action: getComputedStyle(renderer.domElement).touchAction };
};
for (const [name, w, h] of SIZES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  await pg.addInitScript({ path: path.join(HERE, 'fake_audio_clock.js') });
  // count plucks and where they land, and every bow on/off, by watching what the page sends the engine
  pg.on('pageerror', e => res.errors.push(name + ': ' + e.message));
  await pg.goto('http://localhost:5966/'); await pg.waitForTimeout(1000);
  await pg.tap('#gateBtn'); await pg.waitForTimeout(500);
  await pg.evaluate(() => { window.__sent = []; const P = wgNode.port.postMessage.bind(wgNode.port);
    wgNode.port.postMessage = (m) => { if (m.type === 'pluck' || m.type === 'bow' && 'on' in m) __sent.push({ type: m.type, position: m.position, on: m.on }); return P(m); }; });
  const m = { size: name + ' ' + w + 'x' + h, open: await pg.evaluate(look) };
  await pg.screenshot({ path: path.join(HERE, 'frames', `${TAG}-${name}-open.png`) });
  // 2. a finger tap at a quarter of the way along the string
  await pg.evaluate(() => { window.__sent.length = 0; });
  const [qx, qy] = m.open.at_25;
  await pg.touchscreen.tap(qx, qy); await pg.waitForTimeout(300);
  m.tap_quarter = await pg.evaluate(() => window.__sent.filter(s => s.type === 'pluck').map(s => +s.position.toFixed(2)));
  // 3. hold the bow with one finger, touch a slider with a second, lift the second
  m.two_fingers = await pg.evaluate(() => {
    const bow = $('bow'); if (!bow.getBoundingClientRect().width) return 'no bow button visible';
    const sl = ['bspd', 'bfrc', 'freq'].map($).find(e => e.getBoundingClientRect().width) || $('more');
    const P = (t, el, id) => el.dispatchEvent(new PointerEvent(t, { pointerId: id, pointerType: 'touch', isPrimary: id === 11, bubbles: true }));
    P('pointerdown', bow, 11); const a = bowing;
    P('pointerdown', sl, 12); P('pointerup', sl, 12); const b = bowing;
    P('pointerup', bow, 11); const c = bowing;
    return { bow_on_press: a, bow_after_second_finger_lifts: b, bow_after_own_finger_lifts: c };
  });
  // holding the bow: the grip chart takes the top, and the string must still be clear
  await pg.evaluate(() => $('bow').dispatchEvent(new PointerEvent('pointerdown', { pointerId: 21, pointerType: 'touch', bubbles: true })));
  await pg.waitForTimeout(1200);
  m.bowing = await pg.evaluate(look);
  await pg.screenshot({ path: path.join(HERE, 'frames', `${TAG}-${name}-bowing.png`) });
  await pg.evaluate(() => window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 21, pointerType: 'touch' }))); await pg.waitForTimeout(300);
  // the lesson's bow stop
  await pg.evaluate(() => { if (!lesson) lessonStart(); }); await pg.waitForTimeout(300);
  await pg.evaluate(() => lesson ? lessonGo(5) : null); await pg.waitForTimeout(1200);
  m.lesson_bow = await pg.evaluate(look);
  await pg.screenshot({ path: path.join(HERE, 'frames', `${TAG}-${name}-lesson-bow.png`) });
  res.sizes.push(m);
  await ctx.close();
}
await b.close(); srv.close();
fs.writeFileSync(path.join(HERE, `phone-${TAG}.json`), JSON.stringify(res, null, 1));
for (const s of res.sizes) console.log(JSON.stringify(s));
console.log('errors', res.errors);
