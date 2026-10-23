import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { createRequire } from 'node:module';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync, copyFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { listen, closeAll } from '../helpers/loopback.js';
import { blackboardMiddleware } from '../../server/middleware.js';
import { buildReviewMessage, vendorFiles } from '../../../../rich-face/rich-handler.mjs';
import { createPieceOrigin } from '../../../../rich-face/piece-origin.mjs';
import { contractOf, framePlan } from '../../../../rich-face/contract.mjs';
import { pieceBytes } from '../../../../rich-face/kit/inject.mjs';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

// Rich-face pieces on the piece origin, in headless Chromium: steps 4 and 5 of
// STIGMERGY — spec — rich-face pieces. The app is reached as localhost and its
// pieces run on 127.0.0.1 (another site), as they do live; the rich face is a
// page of its own, as the reader's face switch opens it, so a piece's camera is
// one frame deep. A temp palace that is a git
// repository, STIGMERGY's own middleware, a piece origin on a free port: never
// :5173, never 8843, never the real board.

const HERE = dirname(fileURLToPath(import.meta.url));
const RICH_SRC = resolve(HERE, '../../../../rich-face');
const APP = resolve(HERE, '../..');
const ENTRY = 'Piece Entry';

const require = createRequire(import.meta.url);
let chromium = null;
try { ({ chromium } = require('playwright')); if (!existsSync(chromium.executablePath())) chromium = null; } catch { chromium = null; }
if (!chromium) console.warn('[rich-pieces] SKIPPED — no Playwright Chromium on this machine (npx playwright install chromium)');

const doc = (head, body) => `<!doctype html><html><head><meta charset="utf-8">${head}</head><body style="margin:8px">${body}</body></html>`;

// A camera piece: a click asks the kit for the camera and shows it.
const CAM = (needs = 'camera', size = 'fill 4/3') => doc(`<meta name="piece:needs" content="${needs}"><meta name="piece:size" content="${size}">`, `
<button id="go">camera</button><video id="v" autoplay muted playsinline style="width:160px"></video>
<script>
window.camLog = []; let stream = null;
document.getElementById('go').addEventListener('click', async () => {
  try { stream = await RichPiece.camera(); document.getElementById('v').srcObject = stream; camLog.push('on'); }
  catch (e) { camLog.push('refused:' + e.name); }
});
window.camState = () => !stream ? 'none' : stream.getVideoTracks().some((t) => t.readyState === 'live') ? 'live' : 'off';
</script>`);
// A camera piece that asks on load, the way an older build does, with no click.
const AUTOCAM = doc('<meta name="piece:needs" content="camera">', `<div style="height:200px">auto</div><script>
let stream = null;
navigator.mediaDevices.getUserMedia({ video: true }).then((s) => { stream = s; });
window.camState = () => !stream ? 'none' : stream.getVideoTracks().some((t) => t.readyState === 'live') ? 'live' : 'off';
</script>`);
// A tone on a click; `needs` gives it an origin, so its hush must be addressed to it.
const TONE = (needs) => doc(needs ? `<meta name="piece:needs" content="${needs}">` : '', `<button id="go">tone</button><div style="height:300px">tone</div><script>
let ctx = null;
document.getElementById('go').addEventListener('click', () => { ctx = ctx || new AudioContext(); const o = ctx.createOscillator(), g = ctx.createGain(); g.gain.value = 0.001; o.connect(g); g.connect(ctx.destination); o.start(); ctx.resume(); });
window.toneState = () => (ctx ? ctx.state : 'none');
</script>`);
const STORE = (needs) => doc(needs ? '<meta name="piece:needs" content="storage">' : '', `<div style="height:200px">store</div><script>
localStorage.setItem('k', ${JSON.stringify(needs ? 'kept' : 'mem')});
localStorage.n = '1';
window.raw = () => { const f = document.createElement('iframe'); document.body.append(f); const s = f.contentWindow.localStorage; const out = {}; for (let i = 0; i < s.length; i++) out[s.key(i)] = s.getItem(s.key(i)); f.remove(); return out; };
window.view = () => ({ k: localStorage.getItem('k'), n: localStorage.n, keys: Object.keys(localStorage).sort(), length: localStorage.length });
</script>`);
const FILES = doc('<meta name="piece:files" content="data.json">', `<div style="height:200px">files</div><script>
(async () => {
  const out = {};
  out.data = await fetch('data.json').then((r) => r.ok ? r.json() : r.status, (e) => 'blocked');
  out.secret = await fetch('secret.json').then((r) => r.status, () => 'blocked');
  out.tokens = await fetch('/_ops/loudon-live/design-system/palace-tokens.js').then((r) => r.status, () => 'blocked');
  document.body.dataset.out = JSON.stringify(out);
})();
</script>`);
// What a piece must not reach, tried from a piece that has an origin of its own.
const CANARY = doc('<meta name="piece:needs" content="camera storage">', `<button id="go">try the camera</button><div style="height:200px">canary</div><script>
const app = location.ancestorOrigins[0];
const msg = ${JSON.stringify(JSON.stringify(buildReviewMessage({ task: 'from-a-canary' })))};
const out = { app };
(async () => {
  try { out.json = (await fetch(app + '/api/persistent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: msg })).status; } catch (e) { out.json = 'blocked'; }
  try { await fetch(app + '/api/persistent', { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: msg }); out.plain = 'sent'; } catch (e) { out.plain = 'blocked'; }
  try { out.read = (await (await fetch(app + '/api/file?path=' + encodeURIComponent('${ENTRY}.md'))).text()).length; } catch (e) { out.read = 'blocked'; }
  try { out.parent = !!parent.document.body; } catch (e) { out.parent = 'refused'; }
  try { out.top = String(top.location.href); } catch (e) { out.top = 'refused'; }
  try { out.git = (await fetch('/.git/HEAD')).status; } catch (e) { out.git = 'blocked'; }
  try { out.board = (await fetch('/api/persistent')).status; } catch (e) { out.board = 'blocked'; }
  document.body.dataset.out = JSON.stringify(out);
})();
document.getElementById('go').addEventListener('click', async () => {
  try { await RichPiece.camera(); out.camera = 'granted'; } catch (e) { out.camera = e.name; }
  document.body.dataset.camera = out.camera;
});
</script>`);
const TALL = doc('', '<div>tall</div><script>parent.postMessage({ type: "rich:height", height: 9400 }, "*");</script>');
const SILENT = doc('', '<canvas style="position:fixed;inset:0"></canvas><script>/* this piece answers rich:height itself, and never does */</script>');
const BROKEN = doc('', '<div style="height:150px">b</div><script>null.boom;</script>');
const PLAIN = doc('', '<div style="height:300px">plain</div>');
// A piece that declares nothing (so runs opaque) and wears the design system by tags, as Flocking's skins do.
const SKIN = doc('<link rel="stylesheet" href="/_ops/loudon-live/design-system/colors_and_type.css"><script src="/_ops/loudon-live/design-system/palace-tokens.js"></script>',
  '<div id="s" style="height:200px">skin</div><script>window.skin = () => ({ tokens: window.tokens || null, css: getComputedStyle(document.getElementById(\'s\')).getPropertyValue(\'--skin\').trim() });</script>');

const PIECES = {
  'cam.html': [CAM(), 'Cam', 480], 'cam2.html': [CAM(), 'Cam 2', 480], 'nocam.html': [CAM(), 'No cam', 480], 'autocam.html': [AUTOCAM, 'Autocam', 400],
  'tone.html': [TONE('storage'), 'Tone', 400], 'tone2.html': [TONE('storage'), 'Tone 2', 400],
  'store.html': [STORE(true), 'Store', 300], 'store2.html': [STORE(true), 'Store 2', 300], 'memstore.html': [STORE(false), 'Mem store', 300],
  'files.html': [FILES, 'Files', 300], 'canary.html': [CANARY, 'Canary', 300],
  'tall.html': [TALL, 'Tall', 500], 'silent.html': [SILENT, 'Silent', 640], 'broken.html': [BROKEN, 'Broken', 300], 'plain.html': [PLAIN, 'Plain', 500],
  'skin.html': [SKIN, 'Skin', 300],
};
const GRANTED = ['cam.html', 'cam2.html', 'autocam.html'];

function makeTempPalace() {
  const root = mkdtempSync(resolve(tmpdir(), 'rich-pieces-test-'));
  execFileSync('git', ['init', '-q'], { cwd: root, env: gitFreeEnv() });
  assertScratchRepo(root);
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  mkdirSync(resolve(root, '_ops/swarm/sessions'), { recursive: true });
  writeFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), '', 'utf8');
  mkdirSync(resolve(root, '_ops/loudon-live/design-system'), { recursive: true });
  writeFileSync(resolve(root, '_ops/loudon-live/design-system/palace-tokens.js'), 'window.tokens = 1;');
  writeFileSync(resolve(root, '_ops/loudon-live/design-system/colors_and_type.css'), ':root { --skin: worn; }');
  mkdirSync(resolve(root, '_ops/rich-face'), { recursive: true });
  writeFileSync(resolve(root, '_ops/rich-face/grants.json'), JSON.stringify({ grants: GRANTED.map((f) => ({ piece: `${ENTRY}/${f}`, allow: ['camera'], yes: 'test' })) }));
  writeFileSync(resolve(root, `${ENTRY}.md`), ['---', `title: ${ENTRY}`, '---', `# ${ENTRY}`, '', '## Pieces', '', 'The pieces sit here.', ''].join('\n'), 'utf8');
  mkdirSync(resolve(root, ENTRY), { recursive: true });
  for (const [name, [html]] of Object.entries(PIECES)) writeFileSync(resolve(root, ENTRY, name), html, 'utf8');
  writeFileSync(resolve(root, ENTRY, 'data.json'), '{"declared":true}');
  writeFileSync(resolve(root, ENTRY, 'secret.json'), '{"secret":true}');
  writeFileSync(resolve(root, ENTRY, `${ENTRY} — rich.json`), JSON.stringify({ entry: ENTRY, sections: [{ heading: 'Pieces', pieces:
    Object.entries(PIECES).map(([file, [, title, height]]) => ({ file, title, origin: 'made', height })) }] }), 'utf8');
  // Committed, as a palace is: a file git does not track would be marked "only on this Mac".
  execFileSync('git', ['-c', 'user.email=test@example.com', '-c', 'user.name=test', 'add', '-A'], { cwd: root, env: gitFreeEnv() });
  execFileSync('git', ['-c', 'user.email=test@example.com', '-c', 'user.name=test', 'commit', '-qm', 'the palace'], { cwd: root, env: gitFreeEnv() });
  return root;
}

// The deck's half: STIGMERGY's real ArtifactSlot, bundled into a page that mounts one slot per piece.
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
  names.map((n) => React.createElement('div', { key: n, 'data-slot': n }, React.createElement(ArtifactSlot, { payload: { artifacts: [{ path: ${JSON.stringify(ENTRY + '/')} + n }] } })))));`,
    },
    bundle: true, format: 'esm', write: false, loader: { '.jsx': 'jsx' },
    define: { 'process.env.NODE_ENV': '"development"' },
  });
  deckJs = out.outputFiles[0].text;
  return deckJs;
}

function makeServer(palaceRoot, log, opts = {}) {
  const plugin = blackboardMiddleware(palaceRoot, opts);
  const handlers = [];
  plugin.configureServer({ middlewares: { use: (fn) => handlers.push(fn) } });
  const server = http.createServer((req, res) => {
    res.on('finish', () => log.push(`${req.method} ${req.url.split('?')[0]} ${res.statusCode}`));
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
    let i = 0;
    const next = () => { if (i >= handlers.length) { res.statusCode = 404; res.end('not found'); return; } handlers[i++](req, res, next); };
    next();
  });
  return { server, plugin };
}

describe.skipIf(!chromium)('rich-face pieces on the piece origin', () => {
  let root, app, plugin, pieceOrigin, browser;
  const log = [];
  const board = () => readFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), 'utf8').trim();
  // The app as localhost (the piece origin is 127.0.0.1: another site, as live).
  const appUrl = (path) => app.replace('127.0.0.1', 'localhost') + path;
  const frameNamed = (page, n) => page.frames().find((f) => f.url().endsWith(`/${encodeURIComponent(ENTRY)}/${n}`));

  // The rich face as the face switch opens it: the whole tab. `rf` is the page
  // itself, which answers locator() and frameLocator() as a frame would.
  async function openReader() {
    const page = await browser.newPage({ viewport: { width: 1240, height: 940 } });
    await page.goto(appUrl(`/rich/?entry=${encodeURIComponent(ENTRY)}&review=0`));
    const rf = page;
    await rf.locator('figure[data-piece="plain.html"] iframe').waitFor({ state: 'attached', timeout: 30000 });
    return { page, rf };
  }
  // A piece's frame, scrolled into view (they load lazily) and loaded.
  async function piece(page, rf, n) {
    const el = rf.locator(`figure[data-piece="${n}"] iframe`);
    await el.scrollIntoViewIfNeeded({ timeout: 20000 });
    await expect.poll(() => !!frameNamed(page, n), { timeout: 15000 }).toBe(true);
    const f = frameNamed(page, n);
    await f.waitForLoadState();
    return { el, f, in: rf.frameLocator(`figure[data-piece="${n}"] iframe`) };
  }

  beforeAll(async () => {
    root = makeTempPalace();
    const made = makeServer(root, log);
    plugin = made.plugin;
    app = await listen(made.server);
    pieceOrigin = (await plugin.pieces).status.origin;
    browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  }, 60000);
  afterAll(async () => {
    await browser?.close();
    await (await plugin?.pieces)?.close();
    await closeAll();
    if (root) rmSync(root, { recursive: true, force: true });
  });

  test('each frame is built from its plan: pieces on the piece origin, an origin only for a piece that needs one', async () => {
    const { page, rf } = await openReader();
    const frames = await rf.locator('figure[data-piece] iframe').evaluateAll((fs) => Object.fromEntries(fs.map((f) => [f.closest('figure').dataset.piece, { src: f.getAttribute('src'), sandbox: f.getAttribute('sandbox'), allow: f.getAttribute('allow') }])));
    expect(Object.keys(frames).sort()).toEqual(Object.keys(PIECES).sort());
    for (const [n, f] of Object.entries(frames)) expect(f.src, n).toBe(`${pieceOrigin}/${encodeURIComponent(ENTRY)}/${n}`);
    expect(frames['cam.html']).toMatchObject({ sandbox: 'allow-scripts allow-same-origin', allow: 'autoplay; camera' });
    expect(frames['nocam.html']).toMatchObject({ sandbox: 'allow-scripts allow-same-origin', allow: 'autoplay' });
    expect(frames['plain.html']).toMatchObject({ sandbox: 'allow-scripts', allow: 'autoplay' });
    expect(frames['files.html'].sandbox).toBe('allow-scripts allow-same-origin');
    // The page itself carries script-src 'self'; its frames may only be the piece origin.
    const r = await fetch(appUrl(`/rich/?entry=${encodeURIComponent(ENTRY)}`));
    expect(r.headers.get('content-security-policy')).toBe(`script-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-src ${pieceOrigin}`);
    await page.close();
  }, 60000);

  test('a chip on each figure says what its piece uses, and each figure is marked introduced or pre-contract', async () => {
    const { page, rf } = await openReader();
    const figs = await rf.locator('figure[data-piece]').evaluateAll((fs) => Object.fromEntries(fs.map((f) => [f.dataset.piece, {
      mark: f.querySelector('.rf-mark')?.textContent, chips: [...f.querySelectorAll('.rf-chip')].map((c) => `${c.textContent}|${c.dataset.state}`),
    }])));
    expect(figs['cam.html']).toEqual({ mark: 'introduced', chips: ['camera|ok', 'fill 4/3|ok'] });
    expect(figs['nocam.html']).toEqual({ mark: 'introduced', chips: ['camera · not granted|warn', 'fill 4/3|ok'] });
    expect(figs['files.html']).toEqual({ mark: 'introduced', chips: ['files · 1|ok'] });
    expect(figs['plain.html']).toEqual({ mark: 'pre-contract', chips: [] });
    await page.close();
  }, 60000);

  test('a granted webcam streams two frames deep; an ungranted one is refused', async () => {
    const { page, rf } = await openReader();
    const cam = await piece(page, rf, 'cam.html');
    await cam.in.locator('#go').click();
    await expect.poll(() => cam.f.evaluate(() => window.camState()), { timeout: 10000 }).toBe('live');
    await expect.poll(() => cam.f.evaluate(() => document.getElementById('v').videoWidth), { timeout: 10000 }).toBeGreaterThan(0);
    const no = await piece(page, rf, 'nocam.html');
    await no.in.locator('#go').click();
    await expect.poll(() => no.f.evaluate(() => window.camLog.join(',')), { timeout: 10000 }).toBe('refused:NotAllowedError');
    await page.close();
  }, 60000);

  test('the camera starts only on a click: a piece that asks on load waits for one', async () => {
    const { page, rf } = await openReader();
    const auto = await piece(page, rf, 'autocam.html');
    await page.waitForTimeout(800);
    expect(await auto.f.evaluate(() => window.camState())).toBe('none');
    const start = auto.in.locator('button[data-rich-kit="start"]');
    expect(await start.textContent()).toBe('start the camera');
    await start.click();
    await expect.poll(() => auto.f.evaluate(() => window.camState()), { timeout: 10000 }).toBe('live');
    expect(await start.count()).toBe(0);
    await page.close();
  }, 60000);

  test('one piece holds the camera at a time; a touch brings it back; a sound elsewhere stops it', async () => {
    const { page, rf } = await openReader();
    const a = await piece(page, rf, 'cam.html');
    const b = await piece(page, rf, 'cam2.html');
    // Each step waits for what it expects; if it never comes, the failure says
    // what every camera and the tone were doing (one unexplained miss, 2026-10-20).
    const states = async () => `cam ${await a.f.evaluate(() => window.camState())}, cam2 ${await b.f.evaluate(() => window.camState())}`
      + (t ? `, tone ${await t.f.evaluate(() => window.toneState())}` : '');
    let t = null;
    async function until(step, frame, fn, want) {
      try { await expect.poll(() => frame.evaluate(fn), { timeout: 10000 }).toBe(want); }
      catch { throw new Error(`${step}: wanted ${want}; ${await states()}`); }
    }
    const cam = () => window.camState();
    await a.in.locator('#go').click();
    await until('a starts', a.f, cam, 'live');
    await b.in.locator('#go').click();
    await until('b starts', b.f, cam, 'live');
    await until('b takes it from a', a.f, cam, 'off');
    // A touch on the first brings its camera back, into the same stream, and the second lets go.
    await a.in.locator('video').click();
    await until('a touched', a.f, cam, 'live');
    await until('a takes it back from b', b.f, cam, 'off');
    // Hush stops it: a tone starts in another piece.
    t = await piece(page, rf, 'tone.html');
    await t.in.locator('#go').click();
    await until('the tone starts', t.f, () => window.toneState(), 'running');
    await until('the tone hushes a', a.f, cam, 'off');
    await page.close();
  }, 90000);

  test('hush reaches a piece that has an origin of its own: starting one quiets the other', async () => {
    const { page, rf } = await openReader();
    const a = await piece(page, rf, 'tone.html');
    const b = await piece(page, rf, 'tone2.html');
    await a.in.locator('#go').click();
    await expect.poll(() => a.f.evaluate(() => window.toneState()), { timeout: 10000 }).toBe('running');
    await b.in.locator('#go').click();
    await expect.poll(() => b.f.evaluate(() => window.toneState()), { timeout: 10000 }).toBe('running');
    await expect.poll(() => a.f.evaluate(() => window.toneState()), { timeout: 10000 }).toBe('suspended');
    await page.close();
  }, 60000);

  test('storage is kept under each piece’s own prefix; a piece with no origin keeps it in memory and the page says so', async () => {
    const { page, rf } = await openReader();
    const s1 = await piece(page, rf, 'store.html');
    const s2 = await piece(page, rf, 'store2.html');
    expect(await s1.f.evaluate(() => window.view())).toEqual({ k: 'kept', n: '1', keys: ['k', 'n'], length: 2 });
    const raw = await s1.f.evaluate(() => window.raw());
    expect(raw).toMatchObject({ [`piece:${ENTRY}/store.html:k`]: 'kept', [`piece:${ENTRY}/store2.html:k`]: 'kept' });
    expect(Object.keys(raw).every((k) => k.startsWith('piece:'))).toBe(true);
    expect(await s2.f.evaluate(() => window.view().keys)).toEqual(['k', 'n']);
    const mem = await piece(page, rf, 'memstore.html');
    expect(await mem.f.evaluate(() => window.view())).toEqual({ k: 'mem', n: '1', keys: ['k', 'n'], length: 2 });
    const chips = rf.locator('figure[data-piece="memstore.html"] .rf-chip');
    await expect.poll(() => chips.allTextContents(), { timeout: 5000 }).toContain('storage · this visit only');
    await page.close();
  }, 60000);

  // Spec § 7's open question: Chrome partitions a framed piece's storage by the
  // top-level site. Answered here for headless Chromium: what a piece keeps in
  // the face, it does not see opened on its own.
  test('framed storage is partitioned: a piece opened on its own does not see what it kept in the face', async () => {
    const { page, rf } = await openReader();
    const framed = await piece(page, rf, 'store.html');
    await framed.f.evaluate(() => localStorage.setItem('framed-only', 'x'));
    const alone = await browser.newPage();
    try {
      await alone.goto(`${pieceOrigin}/${encodeURIComponent(ENTRY)}/store.html`);
      await alone.waitForFunction(() => window.view);
      expect(await alone.evaluate(() => localStorage.getItem('framed-only'))).toBeNull();
      await alone.evaluate(() => localStorage.setItem('alone-only', 'y'));
    } finally { await alone.close(); }
    expect(await framed.f.evaluate(() => localStorage.getItem('alone-only'))).toBeNull();
    expect(await framed.f.evaluate(() => localStorage.getItem('framed-only'))).toBe('x');
    await page.close();
  }, 60000);

  test('a piece fetches the files it declares and the design system, and nothing else', async () => {
    const { page, rf } = await openReader();
    const f = await piece(page, rf, 'files.html');
    await f.f.waitForSelector('body[data-out]', { state: 'attached', timeout: 10000 });
    expect(JSON.parse(await f.f.$eval('body', (b) => b.dataset.out))).toEqual({ data: { declared: true }, secret: 404, tokens: 200 });
    await page.close();
  }, 60000);

  test('a piece with no origin of its own still wears the design system, by tags', async () => {
    const { page, rf } = await openReader();
    const s = await piece(page, rf, 'skin.html');
    expect(await s.el.getAttribute('sandbox')).toBe('allow-scripts');
    await expect.poll(() => s.f.evaluate(() => window.skin()), { timeout: 8000 }).toEqual({ tokens: 1, css: 'worn' });
    await page.close();
  }, 60000);

  test('the canary is refused: the board, the parent page, the reader, /.git/HEAD, an ungranted camera', async () => {
    const { page, rf } = await openReader();
    const c = await piece(page, rf, 'canary.html');
    await c.f.waitForSelector('body[data-out]', { state: 'attached', timeout: 15000 });
    const out = JSON.parse(await c.f.$eval('body', (b) => b.dataset.out));
    expect(out.app).toBe(appUrl('').replace(/\/$/, ''));
    expect(out.json).toBe('blocked');   // the preflight is refused, so the write never leaves
    expect(out.read).toBe('blocked');   // STIGMERGY answers with no CORS, so nothing comes back
    expect(out.parent).toBe('refused');
    expect(out.top).toBe('refused');
    expect(out.git).toBe(404);
    expect(out.board).toBe(403);        // the piece origin serves no part of STIGMERGY
    await c.in.locator('#go').click();
    await expect.poll(() => c.f.evaluate(() => document.body.dataset.camera || ''), { timeout: 10000 }).toBe('NotAllowedError');
    expect(board()).toBe('');
    expect(log.filter((l) => /^POST \/api\/persistent 200$/.test(l))).toEqual([]);
    await page.close();
  }, 60000);

  test('every cap is named on the figure: a height past the most a frame takes, and a piece that never says', async () => {
    const { page, rf } = await openReader();
    const tall = await piece(page, rf, 'tall.html');
    await expect.poll(() => tall.el.evaluate((f) => f.style.height), { timeout: 5000 }).toBe('8000px');
    expect(await rf.locator('figure[data-piece="tall.html"] .rf-cap').textContent()).toBe('asked for 9400 px; held at 8000, the most a frame takes');
    await piece(page, rf, 'silent.html');
    const note = rf.locator('figure[data-piece="silent.html"] .rf-cap');
    await expect.poll(() => note.textContent().catch(() => ''), { timeout: 8000 }).toBe('the piece reported no height; shown at 640 px, its manifest height');
    await page.close();
  }, 60000);

  test('a piece whose script fails is marked errored', async () => {
    const { page, rf } = await openReader();
    await piece(page, rf, 'broken.html');
    const mark = rf.locator('figure[data-piece="broken.html"] .rf-mark');
    await expect.poll(() => mark.textContent(), { timeout: 8000 }).toBe('errored');
    expect(await rf.locator('figure[data-piece="broken.html"] .rf-error').textContent()).toMatch(/the piece reported an error: .*(null|boom)/i);
    await page.close();
  }, 60000);

  test('a fill piece is sized from the column', async () => {
    const { page, rf } = await openReader();
    const cam = await piece(page, rf, 'cam.html');
    await expect.poll(() => cam.el.evaluate((f) => Math.abs(f.clientWidth / f.clientHeight - 4 / 3) < 0.02), { timeout: 5000 }).toBe(true);
    await page.close();
  }, 60000);

  test('in the deck, the slot frames a piece on the piece origin with what grants.json allows, and the camera streams', async () => {
    const page = await browser.newPage({ viewport: { width: 940, height: 900 } });
    await page.goto(appUrl('/deck?p=cam.html,nocam.html,plain.html'));
    const slot = (n) => page.locator(`[data-slot="${n}"] [data-testid="artifact-iframe"]`);
    await slot('cam.html').waitFor({ timeout: 20000 });
    expect(await slot('cam.html').getAttribute('src')).toBe(`${pieceOrigin}/${encodeURIComponent(ENTRY)}/cam.html`);
    expect(await slot('cam.html').getAttribute('sandbox')).toBe('allow-scripts allow-same-origin');
    expect(await slot('cam.html').getAttribute('allow')).toBe('autoplay; camera');
    expect(await slot('nocam.html').getAttribute('allow')).toBe('autoplay');
    expect(await slot('plain.html').getAttribute('sandbox')).toBe('allow-scripts');
    expect(await page.locator('[data-slot="nocam.html"] [data-testid="artifact-piece-chips"]').textContent()).toContain('camera · not granted');
    await page.frameLocator('[data-slot="cam.html"] iframe').locator('#go').click();
    await expect.poll(() => frameNamed(page, 'cam.html').evaluate(() => window.camState()), { timeout: 10000 }).toBe('live');
    await page.close();
  }, 60000);
});

describe.skipIf(!chromium)('with no piece origin', () => {
  let root, app, browser, holder;
  beforeAll(async () => {
    root = makeTempPalace();
    holder = http.createServer((req, res) => res.end('another program'));
    const held = Number(new URL(await listen(holder)).port);
    const taken = createPieceOrigin({ root, port: held });
    await taken.start();
    app = await listen(makeServer(root, [], { pieces: taken }).server);
    browser = await chromium.launch();
  }, 60000);
  afterAll(async () => {
    await browser?.close();
    await closeAll();
    if (root) rmSync(root, { recursive: true, force: true });
  });

  test('every piece’s figure says the port is taken, and no piece runs on the page’s own origin', async () => {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    await page.goto(`${app}/rich/?entry=${encodeURIComponent(ENTRY)}&review=0`);
    await page.waitForSelector('figure[data-piece="plain.html"] .rf-missing', { timeout: 30000 });
    expect(await page.locator('figure[data-piece] iframe').count()).toBe(0);
    const boxes = await page.locator('figure[data-piece] .rf-missing').allTextContents();
    expect(boxes).toHaveLength(Object.keys(PIECES).length);
    for (const b of boxes) expect(b).toMatch(/No piece origin: port \d+ is taken by another program, so no piece runs here\. A piece never runs on the page's own origin/);
    await page.close();
  }, 60000);
});

describe.skipIf(!chromium)('on the public site', () => {
  let out, browser, statics, base;
  const STATIC = 'Static Entry';
  beforeAll(async () => {
    // The read view as build-public.mjs lays it: the page marked static, its
    // modules, the snapshot's table with each piece's static plan, the files.
    out = mkdtempSync(resolve(tmpdir(), 'rich-pieces-static-'));
    const put = (rel, body) => { mkdirSync(dirname(join(out, rel)), { recursive: true }); writeFileSync(join(out, rel), body); };
    put('rich/index.html', readFileSync(join(RICH_SRC, 'rich.html'), 'utf8').replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="rich:static" content="1">'));
    for (const f of ['rich.js', 'parse.js']) put(`rich/_rich/${f}`, readFileSync(join(RICH_SRC, f)));
    for (const { rel, abs } of vendorFiles()) put(`rich/_vendor/${rel}`, readFileSync(abs));
    const pieces = { 'cam.html': CAM(), 'store.html': STORE(true) };
    const media = {}, plans = {};
    for (const [n, html] of Object.entries(pieces)) {
      const rel = `${STATIC}/${n}`, url = `../files/${encodeURIComponent(STATIC)}/${n}`;
      const tmp = join(out, '_src.html');
      writeFileSync(tmp, html);
      put(`files/${rel}`, pieceBytes(tmp));
      media[n] = { path: rel, url };
      plans[n] = framePlan({ path: rel, contract: contractOf({ html }), mode: 'static', url });
    }
    put(`files/${STATIC}.md`, `---\ntitle: ${STATIC}\n---\n# ${STATIC}\n\n## Pieces\n\nWords.\n`);
    put(`files/${STATIC}/${STATIC} — rich.json`, JSON.stringify({ entry: STATIC, sections: [{ heading: 'Pieces', pieces: Object.keys(pieces).map((file) => ({ file, origin: 'made', height: 300 })) }] }));
    put('data/rich.json', JSON.stringify({ entries: { [STATIC]: {
      title: STATIC, path: `${STATIC}.md`, md: `../files/${encodeURIComponent(STATIC)}.md`, bundle: `../files/${encodeURIComponent(STATIC)}/`,
      manifest: `../files/${encodeURIComponent(STATIC)}/${encodeURIComponent(`${STATIC} — rich.json`)}`, files: [], media, pieces: plans, paths: {},
    } } }));
    const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.md': 'text/markdown' };
    statics = http.createServer((req, res) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const file = join(out, p);
      if (!file.startsWith(out) || !existsSync(file) || !statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[p.slice(p.lastIndexOf('.'))] || 'application/octet-stream' });
      res.end(readFileSync(file));
    });
    base = await listen(statics);
    browser = await chromium.launch();
  }, 60000);
  afterAll(async () => {
    await browser?.close();
    await closeAll();
    if (out) rmSync(out, { recursive: true, force: true });
  });

  test('a camera piece opens in its own tab; storage lives in memory and the figure says so', async () => {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    await page.goto(`${base}/rich/?entry=${encodeURIComponent(STATIC)}`);
    const tab = page.locator('figure[data-piece="cam.html"] .rf-tab');
    await tab.waitFor({ timeout: 30000 });
    expect(await tab.locator('a').getAttribute('href')).toBe(`../files/${encodeURIComponent(STATIC)}/cam.html`);
    expect(await tab.locator('a').getAttribute('target')).toBe('_blank');
    expect(await page.locator('figure[data-piece="cam.html"] .rf-chip').allTextContents()).toContain('camera · opens in its own tab');
    const store = page.locator('figure[data-piece="store.html"] iframe');
    expect(await store.getAttribute('sandbox')).toBe('allow-scripts');
    await store.scrollIntoViewIfNeeded();
    expect(await page.locator('figure[data-piece="store.html"] .rf-chip').allTextContents()).toContain('storage · this visit only');
    const frame = await (await store.elementHandle()).contentFrame();
    await frame.waitForLoadState();
    expect(await frame.evaluate(() => window.view())).toEqual({ k: 'kept', n: '1', keys: ['k', 'n'], length: 2 });
    await page.close();
  }, 60000);
});
