import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
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
const RICH_SRC = resolve(HERE, '../../../../rich-face');
const APP = resolve(HERE, '../..');
const ENTRY = 'Kit Entry';

// One second of a quiet 440 Hz tone: what PhosphorAudio plays on a card.
function toneWav() {
  const rate = 8000, n = rate, buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(800 * Math.sin((2 * Math.PI * 440 * i) / rate)), 44 + i * 2);
  return buf;
}
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
  // The rich face finds files through git's index (resolve.mjs), never by walking
  // the disk, so the temp palace is a repository; new files count untracked.
  execFileSync('git', ['init', '-q'], { cwd: root });
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  mkdirSync(resolve(root, '_ops/swarm/sessions'), { recursive: true });
  writeFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), '', 'utf8');
  mkdirSync(resolve(root, 'Kit'), { recursive: true });
  for (const [name, html] of Object.entries(PIECES)) writeFileSync(resolve(root, 'Kit', name), html, 'utf8');
  copyFileSync(TONE_EXPLORER, resolve(root, 'Kit', 'tone.html'));
  writeFileSync(resolve(root, 'Kit', 'tone.wav'), toneWav());
  // A rich face with one broken piece, for the errored mark.
  mkdirSync(resolve(root, '_ops/rich-face'), { recursive: true });
  for (const f of ['rich.html', 'parse.js']) copyFileSync(resolve(RICH_SRC, f), resolve(root, '_ops/rich-face', f));
  writeFileSync(resolve(root, `${ENTRY}.md`), ['---', `title: ${ENTRY}`, '---', `# ${ENTRY}`, '', '## Pieces', '', 'Here.', ''].join('\n'), 'utf8');
  mkdirSync(resolve(root, ENTRY), { recursive: true });
  writeFileSync(resolve(root, ENTRY, 'broken.html'), PIECES['broken.html'], 'utf8');
  writeFileSync(resolve(root, ENTRY, `${ENTRY} — rich.json`), JSON.stringify({ entry: ENTRY, sections: [{ heading: 'Pieces', pieces: [{ file: 'broken.html', origin: 'made', height: 300 }] }] }), 'utf8');
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

// The deck's own half of the protocol: STIGMERGY's real ArtifactSlot (and the
// PhosphorAudio it plays audio with), bundled by esbuild into a page that
// mounts one slot per piece, the way a scroll's trail or a TRICKSTER card does.
let deckJs = null;
async function deckBundle() {
  if (deckJs) return deckJs;
  const esbuild = createRequire(resolve(APP, 'package.json'))('esbuild');
  const out = await esbuild.build({
    stdin: {
      resolveDir: APP, loader: 'js', sourcefile: 'deck-host.js',
      contents: `import React from 'react'; import { createRoot } from 'react-dom/client';
import ArtifactSlot from './src/components/ArtifactSlot.jsx';
const names = new URLSearchParams(location.search).get('p').split(',');
createRoot(document.getElementById('root')).render(React.createElement(React.Fragment, null,
  names.map((n) => React.createElement('div', { key: n, 'data-slot': n }, React.createElement(ArtifactSlot, { payload: { artifacts: [{ path: 'Kit/' + n }] } })))));`,
    },
    bundle: true, format: 'esm', write: false, loader: { '.jsx': 'jsx' },
    define: { 'process.env.NODE_ENV': '"development"' },
  });
  deckJs = out.outputFiles[0].text;
  return deckJs;
}

function makeServer(palaceRoot) {
  const plugin = blackboardMiddleware(palaceRoot);
  const handlers = [];
  plugin.configureServer({ middlewares: { use: (fn) => handlers.push(fn) } });
  return http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    if (u.pathname === '/deck') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<!doctype html><body style="margin:0;width:900px"><div id="root"></div><script type="module" src="/deck-host.js"></script></body>');
      return;
    }
    if (u.pathname === '/deck-host.js') {
      deckBundle().then((js) => { res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(js); }, (e) => { res.writeHead(500); res.end(String(e)); });
      return;
    }
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

  test('the rich face marks a piece whose script failed, and shows the error under it', async () => {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    await page.goto(`${base}/rich/?entry=${encodeURIComponent(ENTRY)}&review=0`);
    const fig = page.locator('figure[data-piece="broken.html"]');
    await fig.locator('iframe').scrollIntoViewIfNeeded({ timeout: 20000 });
    await expect.poll(() => fig.getAttribute('data-errored'), { timeout: 8000 }).toBe('1');
    expect(await fig.locator('.rf-error').textContent()).toMatch(/the piece reported an error: .*(null|boom)/i);
    await page.close();
  }, 30000);

  describe('in the deck: STIGMERGY\'s own ArtifactSlot', () => {
    const openDeck = async (names) => {
      const page = await browser.newPage({ viewport: { width: 940, height: 900 } });
      await page.goto(`${base}/deck?p=${names.join(',')}`);
      await page.waitForSelector('[data-testid="artifact-slot"]', { timeout: 20000 });
      return page;
    };
    const slotFrame = (page, n) => page.frameLocator(`[data-slot="${n}"] iframe`);

    test('one voice at a time across frames and the phosphor player', async () => {
      const page = await openDeck(['a.html', 'b.html', 'tone.wav']);
      const state = (n) => frameOf(page, n).evaluate(() => window.toneState());
      const audioPaused = () => page.$eval('[data-slot="tone.wav"] audio', (a) => a.paused);
      await slotFrame(page, 'a.html').locator('#go').click();
      await expect.poll(() => state('a.html'), { timeout: 5000 }).toBe('running');
      await slotFrame(page, 'b.html').locator('#go').click();
      await expect.poll(() => state('a.html'), { timeout: 5000 }).toBe('suspended');
      // The player starts: the frame that was playing goes quiet.
      await page.locator('[data-slot="tone.wav"] [data-testid="phosphor-audio-toggle"]').click();
      await expect.poll(audioPaused, { timeout: 5000 }).toBe(false);
      await expect.poll(() => state('b.html'), { timeout: 5000 }).toBe('suspended');
      // A touch wakes a frame, and the player pauses for it.
      await slotFrame(page, 'a.html').locator('div').first().click();
      await expect.poll(() => state('a.html'), { timeout: 5000 }).toBe('running');
      await expect.poll(audioPaused, { timeout: 5000 }).toBe(true);
      await page.close();
    }, 40000);

    test('a frame takes the piece\'s height, and a failed script shows under it', async () => {
      const page = await openDeck(['flow.html', 'broken.html']);
      const f = frameOf(page, 'flow.html');
      await f.waitForLoadState();
      const content = await f.evaluate(() => Math.ceil(document.querySelector('p').getBoundingClientRect().bottom + 8));
      const frameH = () => page.$eval('[data-slot="flow.html"] iframe', (el) => el.clientHeight);
      await expect.poll(frameH, { timeout: 5000 }).toBeGreaterThan(content - 3);
      expect(Math.abs((await frameH()) - content)).toBeLessThanOrEqual(3);
      const err = page.locator('[data-slot="broken.html"] [data-testid="artifact-piece-error"]');
      await expect.poll(() => err.count(), { timeout: 5000 }).toBe(1);
      expect(await err.textContent()).toMatch(/the piece reported an error: .*(null|boom)/i);
      await page.close();
    }, 30000);
  });
});
