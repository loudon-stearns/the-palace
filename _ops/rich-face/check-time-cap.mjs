// check-time-cap.mjs — a sound left alone stops on its own. Re-checks, in
// headless Chromium, the kit's cap (kit/piece.js § the cap): a piece that has
// sounded with nothing touching it stops, says so, and comes back on a touch;
// a touch resets the clock; "keep it playing" holds it; silence never trips it.
//
//   node _ops/rich-face/check-time-cap.mjs           (~50 seconds)
//   node _ops/rich-face/check-time-cap.mjs --face    (+ ~75 s: the real minute,
//                                                     on Frequency-Time Duality's face)
//
// The fixture pieces call RichPiece.capAfter(4), so the cap bites at 4 s and
// warns a second before. What is checked is real: each AudioContext's state,
// each media element's paused, the kit's line over the piece.
//
// It prints PASS/FAIL per claim and exits non-zero on any FAIL. It writes
// nothing to the palace; the preview it starts with --face is stopped at the end.

import { createRequire } from 'node:module';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './rich-server.mjs';
import { injectKit } from './kit/inject.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(resolve(HERE, '../stigmergy/app'), 'package.json'));
const { chromium } = require('playwright');
const FACE = process.argv.includes('--face');

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };

// Beneath the kit, in every frame: keep every AudioContext made and every media element started.
const INIT = `(() => {
  if (window.__capCtx) return;
  window.__capCtx = []; window.__capMedia = [];
  const N = window.AudioContext || window.webkitAudioContext;
  if (N) {
    const W = class extends N { constructor(...a) { super(...a); window.__capCtx.push(this); } };
    window.AudioContext = W;
    if ('webkitAudioContext' in window) window.webkitAudioContext = W;
  }
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { if (!window.__capMedia.includes(this)) window.__capMedia.push(this); return play.apply(this, arguments); };
})();`;

async function state(frame) {
  return frame.evaluate(() => {
    const m = new Set([...(window.__capMedia || []), ...document.querySelectorAll('audio, video')]);
    const n = document.querySelector('[data-rich-kit="cap"]');
    return {
      ctx: (window.__capCtx || []).filter((c) => c.state === 'running').length,
      media: [...m].filter((x) => !x.paused).length,
      line: n && n.isConnected ? n.textContent : '',
    };
  });
}
// Ask over a moment: the kit looks once a second.
async function until(frame, want, ms) {
  let s = await state(frame);
  for (const t0 = Date.now(); !want(s) && Date.now() - t0 < ms;) { await new Promise((r) => setTimeout(r, 100)); s = await state(frame); }
  return s;
}
const say = (s) => `${s.ctx} context(s) running, ${s.media} media playing${s.line ? `; the line reads “${s.line}”` : ''}`;

function wav() {
  const rate = 8000, n = rate, buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(800 * Math.sin((2 * Math.PI * 220 * i) / rate)), 44 + i * 2);
  return 'data:audio/wav;base64,' + buf.toString('base64');
}
// #tone: a quiet sine; #silent: a context left running at zero gain, as a
// stopped piece often leaves it; #loop: an Audio() never put in the page.
const FIXTURE = `<!doctype html><html><head><meta charset="utf-8"><title>a piece left alone</title></head>
<body style="margin:0;padding:24px;height:240px"><button id="tone">tone</button> <button id="silent">silent</button> <button id="loop">loop</button>
<script>
RichPiece.capAfter(4);
function voice(level) {
  const ctx = new AudioContext(), o = ctx.createOscillator(), g = ctx.createGain();
  g.gain.value = level; o.connect(g); g.connect(ctx.destination); o.start();
}
document.getElementById('tone').onclick = () => voice(0.02);
document.getElementById('silent').onclick = () => voice(0);
document.getElementById('loop').onclick = () => { const el = new Audio('${wav()}'); el.loop = true; el.play(); };
</script></body></html>`;
const HOST = `<!doctype html><html><head><meta charset="utf-8"><title>a page that sends nothing</title></head>
<body style="margin:0"><iframe id="p" sandbox="allow-scripts" allow="autoplay" src="http://cap.test/piece.html" style="width:640px;height:300px;border:0"></iframe></body></html>`;

const browser = await chromium.launch();
let preview = null;
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(INIT);
  await context.route('http://cap.test/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/piece.html') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: injectKit(FIXTURE) });
    if (path === '/host.html') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: HOST });
    return route.fulfill({ status: 404, body: '' });
  });
  const fresh = async () => { const page = await context.newPage(); await page.goto('http://cap.test/piece.html', { waitUntil: 'load' }); return page; };

  // ── left alone: warned, then stopped, then a touch brings it back ──
  {
    const page = await fresh();
    await page.locator('#tone').click();
    const warned = await until(page, (x) => !!x.line, 6000);
    check('alone: warned before the cap, still sounding', warned.ctx === 1 && /stops in/.test(warned.line), say(warned));
    const capped = await until(page, (x) => x.ctx === 0, 3000);
    check('alone: stopped at the cap, and says so', capped.ctx === 0 && /Stopped after 4 seconds untouched/.test(capped.line), say(capped));
    await page.waitForTimeout(1500);
    const stays = await state(page);
    check('alone: the line stays while it is stopped', stays.ctx === 0 && /Stopped/.test(stays.line), say(stays));
    await page.getByRole('button', { name: 'go on', exact: true }).click();
    await page.waitForTimeout(300);
    const back = await state(page);
    check('alone: "go on" brings it back and clears the line', back.ctx === 1 && !back.line, say(back));
    await page.close();
  }

  // ── left stopped: the line goes, the quiet stays ──
  {
    const page = await fresh();
    await page.locator('#tone').click();
    await until(page, (x) => /Stopped/.test(x.line), 7000);
    await page.getByRole('button', { name: 'leave it stopped' }).click();
    await page.waitForTimeout(1500);
    const s = await state(page);
    check('left: "leave it stopped" clears the line and stays quiet', s.ctx === 0 && !s.line, say(s));
    await page.close();
  }

  // ── touched: the clock is the last touch, not the start ──
  {
    const page = await fresh();
    await page.locator('#tone').click();
    for (let i = 0; i < 4; i++) { await page.waitForTimeout(2000); await page.mouse.click(600, 200); }
    const s = await state(page);
    check('touched: a touch every 2 s keeps a 4 s cap from biting over 8 s', s.ctx === 1 && !/Stopped/.test(s.line), say(s));
    await page.close();
  }

  // ── kept: "keep it playing" holds it for the visit ──
  {
    const page = await fresh();
    await page.locator('#tone').click();
    await page.getByRole('button', { name: 'keep it playing' }).click({ timeout: 6000 });
    await page.waitForTimeout(6000);
    const s = await state(page);
    check('kept: held past twice the cap, with no line', s.ctx === 1 && !s.line, say(s));
    await page.close();
  }

  // ── silent: a running context at zero gain is not a sound ──
  {
    const page = await fresh();
    await page.locator('#silent').click();
    await page.waitForTimeout(6000);
    const s = await state(page);
    check('silent: a context running at zero gain is left alone, no line', s.ctx === 1 && !s.line, say(s));
    await page.close();
  }

  // ── media: an Audio() is stopped too, and "go on" plays it again ──
  {
    const page = await fresh();
    await page.locator('#loop').click();
    const capped = await until(page, (x) => /Stopped/.test(x.line), 7000);
    check('media: an Audio() never put in the page stops at the cap', capped.media === 0 && /Stopped/.test(capped.line), say(capped));
    await page.getByRole('button', { name: 'go on', exact: true }).click();
    await page.waitForTimeout(500);
    const back = await state(page);
    check('media: "go on" plays it again', back.media === 1, say(back));
    await page.close();
  }

  // ── framed: the kit alone, inside a page that sends nothing ──
  {
    const page = await context.newPage();
    await page.goto('http://cap.test/host.html', { waitUntil: 'load' });
    const frame = page.frames().find((f) => f.url().endsWith('/piece.html'));
    await frame.locator('#tone').click();
    const s = await until(frame, (x) => /Stopped/.test(x.line), 7000);
    check('framed: stopped at the cap with no page helping', s.ctx === 0 && /Stopped/.test(s.line), say(s));
    await page.close();
  }

  // ── the face: the real minute, on a real piece ──
  if (FACE) {
    preview = await serve({ keep: true });
    if (!preview.pieces) throw new Error(`the preview's piece origin did not start: ${preview.piecesError}`);
    const page = await context.newPage();
    await page.goto(`${preview.url}?entry=${encodeURIComponent('Frequency-Time Duality')}`, { waitUntil: 'load' });
    const slot = page.locator('iframe[src*="mod-rate-sweep"]');
    await slot.scrollIntoViewIfNeeded();
    const frame = await (await slot.elementHandle()).contentFrame();
    await frame.waitForLoadState('load');
    await frame.locator('#play').click();
    await page.waitForTimeout(55000);
    const warned = await state(frame);
    check('the face: the May sweep still plays at 55 s, warned', warned.ctx === 1 && /stops in 10 seconds/.test(warned.line), say(warned));
    const capped = await until(frame, (x) => /Stopped/.test(x.line), 9000);
    check('the face: stopped at a minute untouched', capped.ctx === 0 && /Stopped after a minute untouched/.test(capped.line), say(capped));
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
