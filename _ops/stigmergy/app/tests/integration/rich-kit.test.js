import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { listen, closeAll } from '../helpers/loopback.js';
import { blackboardMiddleware } from '../../server/middleware.js';

// The piece kit (_ops/rich-face/kit/piece.js) is injected into every web page
// the palace serves as a piece, so a piece sizes its frame, quiets the others
// when it plays and reports its errors with no line from its maker. These
// pieces carry none of the protocol themselves (but one, which speaks it and
// must be left to it). Driven in headless Chromium against STIGMERGY's own
// middleware on a temp palace: never :5173, never the real board.

const HERE = dirname(fileURLToPath(import.meta.url));
// Kuramoto's gathered Tone.js explorer: it knows nothing of the protocol, and
// Tone builds its own context, so it is the test of whether the kit's wrap
// reaches a library's audio (the spec's named unknown, § 7).
const TONE_EXPLORER = resolve(HERE, '../../../../../Kuramoto Coupling/two-oscillators-coupling-explorer-audio.html');
const require = createRequire(import.meta.url);
let chromium = null;
try { ({ chromium } = require('playwright')); if (!existsSync(chromium.executablePath())) chromium = null; } catch { chromium = null; }
if (!chromium) console.warn('[rich-kit] SKIPPED — no Playwright Chromium on this machine (npx playwright install chromium)');

// A tone on a click, the way a proof does it, and nothing else.
const TONE = (label) => `<!doctype html><html><head><meta charset="utf-8"><title>${label}</title></head>
<body style="margin:8px"><button id="go">play ${label}</button><div style="height:600px">${label}</div>
<script>
let ctx = null;
document.getElementById('go').addEventListener('click', () => {
  ctx = ctx || new AudioContext();
  const o = ctx.createOscillator(), g = ctx.createGain();
  g.gain.value = 0.001; o.connect(g); g.connect(ctx.destination); o.start();
  ctx.resume();
});
window.toneState = () => (ctx ? ctx.state : 'none');
</script></body></html>`;

const WORDS = Array.from({ length: 900 }, (_, i) => `word${i}`).join(' ');
const PIECES = {
  'a.html': TONE('a'),
  'b.html': TONE('b'),
  // Prose that wraps, so its height depends on the frame's width. No <head>.
  'flow.html': `<!doctype html><body style="margin:8px"><p style="font:16px/20px monospace;margin:0">${WORDS}</p></body>`,
  // Sized by the viewport: each time its frame grows, so does it.
  'vh.html': '<!doctype html><body style="margin:8px"><div style="height:100vh;background:#123">full</div></body>',
  // Speaks the protocol itself: its own height is the one that counts.
  'speaker.html': `<!doctype html><body><div style="height:900px">x</div><script>
parent.postMessage({ type: 'rich:height', height: 333 }, '*');
</script></body>`,
  'broken.html': '<!doctype html><body><div>b</div><script>null.boom;</script></body>',
};

function makeTempPalace() {
  const root = mkdtempSync(resolve(tmpdir(), 'rich-kit-test-'));
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  mkdirSync(resolve(root, '_ops/swarm/sessions'), { recursive: true });
  writeFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), '', 'utf8');
  mkdirSync(resolve(root, 'Kit'), { recursive: true });
  for (const [name, html] of Object.entries(PIECES)) writeFileSync(resolve(root, 'Kit', name), html, 'utf8');
  copyFileSync(TONE_EXPLORER, resolve(root, 'Kit', 'tone.html'));
  return root;
}

// The host stands in for a page that frames pieces the way ArtifactSlot does:
// sandboxed to scripts, 480 px until the piece speaks, heights taken within
// 120..8000, and a rich:play from one frame sends rich:hush to every other.
// It keeps every message it hears, by frame, in window.__heard.
function hostPage(names, width) {
  const frames = names.map((n) => `<iframe data-n="${n}" sandbox="allow-scripts" src="/api/file?path=${encodeURIComponent(`Kit/${n}`)}" style="display:block;width:${width}px;height:480px;border:0"></iframe>`).join('');
  return `<!doctype html><body style="margin:0">${frames}<script>
window.__heard = [];
const frames = [...document.querySelectorAll('iframe')];
window.addEventListener('message', (e) => {
  const f = frames.find((x) => x.contentWindow === e.source);
  if (!f || !e.data) return;
  window.__heard.push({ n: f.dataset.n, ...e.data });
  if (e.data.type === 'rich:height') { const px = Math.ceil(e.data.height); if (px >= 120 && px <= 8000) f.style.height = px + 'px'; }
  if (e.data.type === 'rich:play') frames.forEach((x) => { if (x !== f) x.contentWindow.postMessage({ type: 'rich:hush' }, '*'); });
});
</script></body>`;
}

function makeServer(palaceRoot) {
  const plugin = blackboardMiddleware(palaceRoot);
  const handlers = [];
  plugin.configureServer({ middlewares: { use: (fn) => handlers.push(fn) } });
  return http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    if (u.pathname === '/host') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(hostPage(u.searchParams.get('p').split(','), Number(u.searchParams.get('w') || 900)));
      return;
    }
    let i = 0;
    const next = () => { if (i >= handlers.length) { res.statusCode = 404; res.end('not found'); return; } handlers[i++](req, res, next); };
    next();
  });
}

describe.skipIf(!chromium)('the piece kit', () => {
  let root, base, browser;
  const open = async (names, width = 900) => {
    const page = await browser.newPage({ viewport: { width: width + 40, height: 900 } });
    await page.goto(`${base}/host?p=${names.join(',')}&w=${width}`);
    return page;
  };
  const frameOf = (page, n) => page.frames().find((f) => f.url().includes(encodeURIComponent(`Kit/${n}`)));
  const heard = (page, n, type) => page.evaluate(([n, type]) => window.__heard.filter((m) => m.n === n && m.type === type), [n, type]);
  const frameHeight = (page, n) => page.$eval(`iframe[data-n="${n}"]`, (f) => f.getBoundingClientRect().height);

  beforeAll(async () => {
    root = makeTempPalace();
    base = await listen(makeServer(root));
    browser = await chromium.launch();
  }, 60000);
  afterAll(async () => {
    await browser?.close();
    await closeAll();
    if (root) rmSync(root, { recursive: true, force: true });
  });

  test('every served web page carries the kit, still sandboxed: /api/file and /rich/<path>', async () => {
    for (const url of [`/api/file?path=${encodeURIComponent('Kit/a.html')}`, '/rich/Kit/a.html']) {
      const r = await fetch(base + url);
      const body = await r.text();
      expect(r.status).toBe(200);
      expect(r.headers.get('content-security-policy')).toBe('sandbox allow-scripts');
      expect(body).toContain('data-rich-kit="1"');
      expect(body.indexOf('data-rich-kit')).toBeLessThan(body.indexOf('new AudioContext'));
    }
  });

  test('a piece sizes its frame to its content, at two widths', async () => {
    for (const w of [900, 450]) {
      const page = await open(['flow.html'], w);
      const f = frameOf(page, 'flow.html');
      await f.waitForLoadState();
      const content = await f.evaluate(() => Math.ceil(document.querySelector('p').getBoundingClientRect().bottom + 8));
      await expect.poll(() => frameHeight(page, 'flow.html'), { timeout: 5000 }).toBeGreaterThan(content - 3);
      expect(Math.abs((await frameHeight(page, 'flow.html')) - content)).toBeLessThanOrEqual(3);
      await page.close();
    }
  }, 30000);

  test('starting one piece quiets the other; touching it again brings it back and quiets the first', async () => {
    const page = await open(['a.html', 'b.html']);
    const A = () => frameOf(page, 'a.html'), B = () => frameOf(page, 'b.html');
    await page.frameLocator('iframe[data-n="a.html"]').locator('#go').click();
    await expect.poll(() => A().evaluate(() => window.toneState()), { timeout: 5000 }).toBe('running');
    await page.frameLocator('iframe[data-n="b.html"]').locator('#go').click();
    await expect.poll(() => B().evaluate(() => window.toneState()), { timeout: 5000 }).toBe('running');
    await expect.poll(() => A().evaluate(() => window.toneState()), { timeout: 5000 }).toBe('suspended');
    expect((await heard(page, 'b.html', 'rich:play')).length).toBeGreaterThan(0);
    // A touch on the quieted piece wakes what the kit quieted, and that start
    // quiets the other one in turn.
    await page.frameLocator('iframe[data-n="a.html"]').locator('div').click();
    await expect.poll(() => A().evaluate(() => window.toneState()), { timeout: 5000 }).toBe('running');
    await expect.poll(() => B().evaluate(() => window.toneState()), { timeout: 5000 }).toBe('suspended');
    await page.close();
  }, 30000);

  test('a sound nobody asked for claims nothing: no rich:play before a click', async () => {
    const page = await open(['a.html', 'b.html']);
    await A_loaded(page);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.__heard.filter((m) => m.type === 'rich:play').length)).toBe(0);
    await page.close();
    async function A_loaded(p) { await frameOf(p, 'a.html').waitForLoadState(); }
  }, 20000);

  test('a piece sized by the viewport stops growing after two equal steps', async () => {
    const page = await open(['vh.html']);
    await frameOf(page, 'vh.html').waitForLoadState();
    await page.waitForTimeout(1500);
    const h = await frameHeight(page, 'vh.html');
    expect(h).toBeLessThan(480 + 16 * 4);
    await page.waitForTimeout(800);
    expect(await frameHeight(page, 'vh.html')).toBe(h);
    await page.close();
  }, 20000);

  test('a piece that reports its own height is left to it', async () => {
    const page = await open(['speaker.html']);
    await frameOf(page, 'speaker.html').waitForLoadState();
    await page.waitForTimeout(800);
    const heights = (await heard(page, 'speaker.html', 'rich:height')).map((m) => m.height);
    expect(heights).toEqual([333]);
    await page.close();
  }, 20000);

  test('a script error is reported to the page', async () => {
    const page = await open(['broken.html']);
    await expect.poll(async () => (await heard(page, 'broken.html', 'rich:error')).length, { timeout: 5000 }).toBe(1);
    const [err] = await heard(page, 'broken.html', 'rich:error');
    expect(err.message).toMatch(/null|boom/i);
    await page.close();
  }, 20000);

  test("a Tone.js piece is quieted too: the kit's wrap reaches the library's own context", async (ctx) => {
    const online = await fetch('https://cdn.jsdelivr.net/npm/tone@15.0.4/build/Tone.js', { method: 'HEAD' }).then((r) => r.ok, () => false);
    if (!online) { console.warn('[rich-kit] Tone.js test skipped: the CDN is out of reach'); ctx.skip(); return; }
    const page = await open(['tone.html', 'a.html']);
    const T = () => frameOf(page, 'tone.html');
    await T().waitForFunction(() => window.Tone, null, { timeout: 15000 });
    await page.frameLocator('iframe[data-n="tone.html"]').locator('#toggle').click();
    await expect.poll(() => T().evaluate(() => Tone.getContext().state), { timeout: 5000 }).toBe('running');
    expect((await heard(page, 'tone.html', 'rich:play')).length).toBeGreaterThan(0);
    await page.frameLocator('iframe[data-n="a.html"]').locator('#go').click();
    await expect.poll(() => T().evaluate(() => Tone.getContext().state), { timeout: 5000 }).toBe('suspended');
    await page.close();
  }, 40000);
});
