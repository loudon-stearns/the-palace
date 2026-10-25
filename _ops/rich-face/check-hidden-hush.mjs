// check-hidden-hush.mjs — a page nobody can see says nothing. Re-checks, in
// headless Chromium, that a playing piece goes quiet when its page is hidden,
// and stays quiet when the page comes back.
//
//   node _ops/rich-face/check-hidden-hush.mjs        (~10 seconds)
//
// Three cases:
//   the face   Kuramoto Coupling's rich face on a standalone preview of this
//              checkout (rich.js, its pieces on their own piece origin, the kit
//              injected): room tone and the ensemble piece playing.
//   framed     a piece that does not answer rich:hush itself, framed by a page
//              that sends it nothing: the kit alone has to quiet it, an
//              AudioContext and an Audio() never put in the page.
//   alone      the same piece opened in its own tab, with no page around it.
//
// Headless Chromium never hides a page: a second tab in front, a minimized
// window and a background target all leave it 'visible' (tried 2026-10-25, in
// both headless modes and headed under Playwright). So the hide is the
// browser's own signal, played in every frame top-down: visibilityState and
// hidden turn 'hidden', then visibilitychange fires. What is checked after it
// is real: each AudioContext's state, each media element's paused.
//
// It prints PASS/FAIL per claim and exits non-zero on any FAIL. It writes
// nothing to the palace; the preview it starts is stopped at the end.

import { createRequire } from 'node:module';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './rich-server.mjs';
import { injectKit } from './kit/inject.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(resolve(HERE, '../stigmergy/app'), 'package.json'));
const { chromium } = require('playwright');

const QUIET_WAIT_MS = 1500; // a piece may fade before it suspends; ask over a moment
const STAY_MS = 1500;       // how long the page is watched after it comes back

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };

// Runs in every frame before any of its scripts (and so beneath the kit): keeps
// every AudioContext made and every media element started, in the page or not.
const INIT = `(() => {
  if (window.__hushCtx) return;
  window.__hushCtx = []; window.__hushMedia = [];
  const N = window.AudioContext || window.webkitAudioContext;
  if (N) {
    const W = class extends N { constructor(...a) { super(...a); window.__hushCtx.push(this); } };
    window.AudioContext = W;
    if ('webkitAudioContext' in window) window.webkitAudioContext = W;
  }
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { if (!window.__hushMedia.includes(this)) window.__hushMedia.push(this); return play.apply(this, arguments); };
})();`;

// What is sounding, frame by frame: contexts running, media playing.
async function sounding(page) {
  let ctx = 0, media = 0;
  for (const fr of page.frames()) {
    const n = await fr.evaluate(() => {
      const m = new Set([...(window.__hushMedia || []), ...document.querySelectorAll('audio, video')]);
      return { ctx: (window.__hushCtx || []).filter((c) => c.state === 'running').length, media: [...m].filter((x) => !x.paused).length };
    }).catch(() => ({ ctx: 0, media: 0 }));
    ctx += n.ctx; media += n.media;
  }
  return { ctx, media, total: ctx + media };
}
const say = (s) => `${s.ctx} context(s) running, ${s.media} media playing`;

// The browser's hide, played in every frame from the top down.
async function setHidden(page, hidden) {
  for (const fr of page.frames()) {
    await fr.evaluate((h) => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
      document.dispatchEvent(new Event('visibilitychange'));
    }, hidden).catch(() => {});
  }
}

async function until(page, want, ms) {
  let s = await sounding(page);
  for (const t0 = Date.now(); !want(s) && Date.now() - t0 < ms;) { await page.waitForTimeout(100); s = await sounding(page); }
  return s;
}

// Hide the page and ask that it go quiet; show it and ask that it stay quiet.
async function hideAndReturn(page, label) {
  await setHidden(page, true);
  const after = await until(page, (s) => s.total === 0, QUIET_WAIT_MS);
  check(`${label}: quiet once the page is hidden`, after.total === 0, `${say(after)} within ${QUIET_WAIT_MS / 1000} s`);
  await setHidden(page, false);
  await page.waitForTimeout(STAY_MS);
  const back = await sounding(page);
  check(`${label}: still quiet when the page comes back`, back.total === 0, `${say(back)} ${STAY_MS / 1000} s after`);
}

// A piece that does not speak the protocol: a tone in an AudioContext and a
// loop in an Audio() that is never put in the page.
function wav() {
  const rate = 8000, n = rate, buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(800 * Math.sin((2 * Math.PI * 220 * i) / rate)), 44 + i * 2);
  return 'data:audio/wav;base64,' + buf.toString('base64');
}
const FIXTURE = `<!doctype html><html><head><meta charset="utf-8"><title>a piece that keeps its own counsel</title></head>
<body style="margin:0;padding:24px"><button id="go">start</button>
<script>
let ctx, el;
document.getElementById('go').onclick = () => {
  ctx = new AudioContext();
  const o = ctx.createOscillator(), g = ctx.createGain();
  g.gain.value = 0.02; o.connect(g).connect(ctx.destination); o.start();
  el = new Audio('${wav()}'); el.loop = true; el.play();
};
</script></body></html>`;
const HOST = `<!doctype html><html><head><meta charset="utf-8"><title>a page that sends nothing</title></head>
<body style="margin:0"><iframe id="p" sandbox="allow-scripts" allow="autoplay" src="http://hush.test/piece.html" style="width:600px;height:200px;border:0"></iframe></body></html>`;

async function routeFixture(context) {
  await context.route('http://hush.test/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/piece.html') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: injectKit(FIXTURE) });
    if (path === '/host.html') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: HOST });
    return route.fulfill({ status: 404, body: '' });
  });
}

const browser = await chromium.launch();
let preview = null;
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(INIT);
  await routeFixture(context);

  // ── the face: rich.js, its bed and its pieces, on a preview of this checkout ──
  {
    preview = await serve({ keep: true });
    if (!preview.pieces) throw new Error(`the preview's piece origin did not start: ${preview.piecesError}`);
    const page = await context.newPage();
    await page.goto(`${preview.url}?entry=${encodeURIComponent('Kuramoto Coupling')}`, { waitUntil: 'load' });
    const bed = page.locator('#bed');
    await bed.waitFor({ state: 'visible', timeout: 10000 });
    await bed.click();
    const slot = page.locator('iframe[src*="ensemble"]');
    await slot.scrollIntoViewIfNeeded();
    const frame = await (await slot.elementHandle()).contentFrame();
    await frame.waitForLoadState('load');
    await frame.locator('#go').click();
    const playing = await until(page, (s) => s.ctx > 0 && s.media > 0, 5000);
    check('the face: room tone and the ensemble piece are playing', playing.ctx > 0 && playing.media > 0, say(playing));
    await hideAndReturn(page, 'the face');
    check('the face: the room-tone button reads off', (await bed.getAttribute('aria-pressed')) === 'false', `aria-pressed ${await bed.getAttribute('aria-pressed')}, "${await bed.textContent()}"`);
    await page.close();
  }

  // ── framed: the kit alone, inside a page that sends nothing ──
  {
    const page = await context.newPage();
    await page.goto('http://hush.test/host.html', { waitUntil: 'load' });
    const frame = page.frames().find((f) => f.url().endsWith('/piece.html'));
    await frame.locator('#go').click();
    const playing = await until(page, (s) => s.ctx > 0 && s.media > 0, 5000);
    check('framed: the piece is playing, a context and an Audio() outside the page', playing.ctx > 0 && playing.media > 0, say(playing));
    await hideAndReturn(page, 'framed');
    await frame.locator('body').click({ position: { x: 300, y: 10 } });
    const woke = await until(page, (s) => s.ctx > 0, 2000);
    check('framed: a touch on the piece wakes its audio, as after any hush', woke.ctx > 0, say(woke));
    await page.close();
  }

  // ── alone: the same piece in its own tab ──
  {
    const page = await context.newPage();
    await page.goto('http://hush.test/piece.html', { waitUntil: 'load' });
    await page.locator('#go').click();
    const playing = await until(page, (s) => s.ctx > 0 && s.media > 0, 5000);
    check('alone: the piece is playing', playing.ctx > 0 && playing.media > 0, say(playing));
    await hideAndReturn(page, 'alone');
    await page.close();
  }
} catch (e) {
  check('the run', false, e.message.split('\n')[0]);
} finally {
  await browser.close();
  if (preview) await preview.close();
}
console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
