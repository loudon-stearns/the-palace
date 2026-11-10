// Plays "each partial is a loop" with a real mouse in headless Chromium, photographs it, and checks the hand → picture → sound chain:
// after each drag it reads where the frame drew every loop (pixels), turns pixels into harmonics by the ruler's own ticks,
// asks the running worklet what it is playing, and prints the two side by side.
//   node "Projects/Inharmonic Wavetable Synthesis/workshop/rich-checks/shoot-loops.mjs" <base url of a rich-server on this palace> [out dir]
// Failure would be: a grabbed loop that did not follow the mouse to within 1.5 px, or any loop drawn more than 2 cents
// (or, low down where a pixel is many cents, more than half a pixel) from what the worklet plays.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');
const require = createRequire(join(ROOT, '_ops/stigmergy/app/package.json'));
const { chromium } = require('playwright');
const base = (process.argv[2] || '').replace(/\/$/, '');
const out = process.argv[3] || resolve(HERE, '../hook-pilot-2026-11/shots');
if (!base) { console.error('give the rich-server url'); process.exit(2); }
mkdirSync(out, { recursive: true });
const PIECE = base + '/' + ['Projects', 'Inharmonic Wavetable Synthesis', 'Inharmonic Wavetable Synthesis — rich — each partial is a loop.html'].map(encodeURIComponent).join('/');
const browser = await chromium.launch({ args: ['--autoplay-policy=user-gesture-required'] });
const log = []; let fail = false;
const say = (s) => { log.push(s); console.log(s); };

async function open(width, height, scale = 1) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') say(`   console ${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => { say('   PAGE ERROR: ' + e.message); fail = true; });
  await page.goto(PIECE, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__loops && window.__loops.drawn.loops.length === 24);
  return page;
}
const shot = async (page, name, full = true) => { await page.screenshot({ path: join(out, name + '.png'), fullPage: full }); say('   shot ' + name + '.png'); };
const state = (page) => page.evaluate(() => { const c = document.getElementById('obj').getBoundingClientRect(); return { box: { x: c.left + scrollX, y: c.top + scrollY, w: c.width, h: c.height, vy: c.top }, loops: window.__loops.drawn.loops, ticks: window.__loops.drawn.ticks, cy: window.__loops.view.cy }; });
function harmonicsFromRuler(ticks, x) {      // pixels → harmonics, by the ticks the frame drew, not by the piece's own inverse
  for (let j = 0; j < ticks.length - 1; j++) if (x >= ticks[j].x && x <= ticks[j + 1].x) return ticks[j].k + (x - ticks[j].x) / (ticks[j + 1].x - ticks[j].x);
  const a = ticks[0], b = ticks[1]; return a.k + (x - a.x) / (b.x - a.x);
}
async function probe(page) {
  await page.evaluate(() => { window.__loops.probed = null; window.__loops.probe(); });
  await page.waitForFunction(() => window.__loops.probed);
  return page.evaluate(() => window.__loops.probed);
}
async function chain(page, label) {           // picture against the running worklet
  await page.waitForTimeout(250);              // the worklet's 20 ms smoothing, many times over
  const st = await state(page), pr = await probe(page);
  if (!pr.now) { say(`   FAIL ${label}: nothing is sounding`); fail = true; return; }
  let worstC = 0, worstPx = 0, at = 0;
  for (const L of st.loops) {
    const pic = harmonicsFromRuler(st.ticks, L.x), heard = pr.now.f[L.n - 1] / pr.now.f0;
    const cents = 1200 * Math.log2(pic / heard);
    const px = Math.abs(pic - heard) * (st.ticks[1].x - st.ticks[0].x);
    if (Math.abs(cents) > Math.abs(worstC)) { worstC = cents; at = L.n; } worstPx = Math.max(worstPx, px);
  }
  const ok = worstPx < 0.5 || Math.abs(worstC) < 2; if (!ok) fail = true;
  say(`   ${ok ? 'PASS' : 'FAIL'} ${label}: picture (read off the ruler) against the worklet · worst ${worstC.toFixed(2)} c at loop ${at} · worst ${worstPx.toFixed(3)} px · context ${pr.sr} Hz`);
  return { st, pr };
}
async function drag(page, n, dx, dy, opts = {}) {
  const st = await state(page), L = st.loops[n - 1];
  const x0 = st.box.x + L.x, y0 = st.box.vy + (opts.below ? L.bottom + 6 : L.top - 6);
  if (opts.shift) await page.keyboard.down('Shift');
  await page.mouse.move(x0, y0); await page.mouse.down();
  for (let k = 1; k <= 12; k++) { await page.mouse.move(x0 + dx * k / 12, y0 + dy * k / 12); await page.waitForTimeout(16); }
  if (opts.shift) await page.keyboard.up('Shift');
  await page.waitForTimeout(120);
  const after = await state(page), moved = after.loops[n - 1].x - L.x;
  const ok = Math.abs(moved - dx) < 1.5; if (!ok) fail = true;
  say(`   ${ok ? 'PASS' : 'FAIL'} loop ${n} followed the hand: mouse ${dx} px, loop ${moved.toFixed(2)} px · now at ${after.loops[n - 1].r.toFixed(3)} × f0`);
  return after;
}
const pick = (page, id, val) => page.click(`#${id} button[data-val="${val}"]`);

// ── desktop, the width of the face's column ──
say('desktop 1130 × 900');
{ const page = await open(1130, 900);
  await page.waitForTimeout(350); await shot(page, '01-untouched-bars');
  await page.waitForTimeout(3600); await shot(page, '02-untouched-turning');
  const ctxState0 = await page.evaluate(() => window.__loops.UI.sounding);
  say(`   before any click, sounding: ${ctxState0}`); if (ctxState0) fail = true;
  await page.click('#wake'); await page.waitForTimeout(900);
  say(`   after the wake click, sounding: ${await page.evaluate(() => window.__loops.UI.sounding)}`);
  await chain(page, 'woken, untouched');
  await shot(page, '03-woken-harmonic');
  // one loop nudged
  await pick(page, 'grip', 'one'); await pick(page, 'putty', 'stay');
  await drag(page, 7, 40, 0);
  const one = await chain(page, 'one loop nudged, hand still on it');
  { const L = one.st.loops; let others = 0; for (const l of L) if (l.n !== 7 && Math.abs(l.r - l.n) > 1e-9) others++; say(`   other loops moved: ${others} · tell line: ${(await page.textContent('#tell')).replace(/\s+/g, ' ').slice(0, 200)}`); if (others) fail = true; }
  await shot(page, '04-one-loop-nudged');
  await page.mouse.up(); await page.click('#home'); await page.waitForTimeout(2500);
  // whole body pulled
  await pick(page, 'grip', 'body');
  await drag(page, 16, 110, -40);
  await chain(page, 'whole body pulled, hand still on it');
  await shot(page, '05-whole-body-pulled');
  await pick(page, 'putty', 'ooze'); await page.mouse.up();
  await page.mouse.move(40, 40); await page.waitForTimeout(1800);
  await chain(page, 'let go, 1.8 s into the ooze');
  await shot(page, '06-oozing-home');
  // turned end-on
  await page.evaluate(() => { const t = document.getElementById('turn'); t.value = 68; t.dispatchEvent(new Event('input')); });
  await pick(page, 'putty', 'stay'); await page.waitForTimeout(900);
  await chain(page, 'turned to 68°');
  await shot(page, '07-turned-end-on');
  await page.evaluate(() => { const t = document.getElementById('turn'); t.value = 0; t.dispatchEvent(new Event('input')); }); await page.waitForTimeout(900);
  await shot(page, '08-turned-side-on-bars');
  await page.evaluate(() => { const t = document.getElementById('turn'); t.value = 32; t.dispatchEvent(new Event('input')); });
  await page.click('#home'); await pick(page, 'rest', 'bell'); await page.waitForTimeout(3000);
  await chain(page, 'home is the bell');
  await shot(page, '09-bell-home');
  await pick(page, 'rest', 'string'); await page.waitForTimeout(3000);
  await chain(page, 'home is the stiff string');
  await shot(page, '10-string-home');
  // a chord, then quiet
  await pick(page, 'rest', 'flat'); await page.waitForTimeout(2500);
  await page.keyboard.press('f'); await page.keyboard.press('g'); await page.waitForTimeout(200);
  say(`   keys f and g latched: notes ${JSON.stringify(await page.evaluate(() => [...window.__loops.UI.notes]))}`);
  await page.click('#sound'); await page.waitForTimeout(1200);
  say(`   after the quiet button, sounding: ${await page.evaluate(() => window.__loops.UI.sounding)}`);
  await page.context().close(); }

// ── a phone ──
say('phone 390 × 844 @2x');
{ const page = await open(390, 844, 2);
  await page.waitForTimeout(4000); await shot(page, '11-phone-untouched');
  await page.click('#wake'); await page.waitForTimeout(900);
  await pick(page, 'putty', 'stay');
  await drag(page, 12, 46, 0);
  await chain(page, 'phone, whole body pulled');
  await shot(page, '12-phone-body-pulled');
  await page.mouse.up();
  await pick(page, 'grip', 'one'); await page.click('#home'); await page.waitForTimeout(2500);
  await drag(page, 3, 14, 0);
  await chain(page, 'phone, one loop nudged');
  await shot(page, '13-phone-one-loop-nudged', false);
  await page.mouse.up();
  await page.context().close(); }

// ── in the face ──
say('in the face, 1280 × 900');
{ const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') say(`   face console error: ${m.text()}`); });
  page.on('pageerror', (e) => say('   FACE PAGE ERROR: ' + e.message));
  await page.goto(base + '/?entry=' + encodeURIComponent('Inharmonic Wavetable Synthesis'), { waitUntil: 'load' });
  await page.waitForTimeout(5000);
  const frames = page.frames().filter((f) => /each%20partial|each partial/.test(decodeURIComponent(f.url())));
  say(`   frames holding the piece: ${frames.length}`);
  if (frames[0]) { const el = await frames[0].frameElement(); await el.scrollIntoViewIfNeeded(); const b = await el.boundingBox(); say(`   its frame is ${Math.round(b.width)} × ${Math.round(b.height)} px`); await page.evaluate((y) => scrollBy(0, y - 120), b.y); }
  await page.waitForTimeout(800);
  await shot(page, '14-in-the-face', false);
  await ctx.close(); }

await browser.close();
say(fail ? 'SOMETHING FAILED' : 'ALL PASS');
process.exit(fail ? 1 : 0);
