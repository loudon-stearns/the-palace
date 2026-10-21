import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import http from 'node:http';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync, symlinkSync, copyFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { makeResolver } from '../../../../rich-face/resolve.mjs';
import { createRichHandler } from '../../../../rich-face/rich-handler.mjs';
import { startPieceOrigin } from '../../../../rich-face/piece-origin.mjs';
import { pathId } from '../../src/lib/public-mode.js';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

// The one resolver (_ops/rich-face/resolve.mjs) against a throwaway palace that
// is a git repository, the way the real one is: the spec's four tests (Flocking's
// three figures, an ambiguous index.html, a symlink out of the palace, the live
// server and the public build agreeing), and the rules around them.

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '../..');
const RICH_SRC = resolve(APP, '../../rich-face');
const git = (cwd, ...args) => execFileSync('git', ['-c', 'user.email=test@example.com', '-c', 'user.name=test', ...args], { cwd, stdio: 'ignore', env: gitFreeEnv() });
const PAGE = (t) => `<!doctype html><title>${t}</title><body>${t}</body>`;

const require = createRequire(import.meta.url);
let chromium = null;
try { ({ chromium } = require('playwright')); if (!existsSync(chromium.executablePath())) chromium = null; } catch { chromium = null; }
if (!chromium) console.warn('[rich-resolve] page checks SKIPPED — no Playwright Chromium on this machine (npx playwright install chromium)');

// Flocking.md as it stands: three blockquote figures, each a link by path
// from the palace root (Flocking.md:94-102).
const FLOCKING = ['interactive-control', 'observable-plot-analytical', 'p5-expressive'].map((n) => `Flocking/flocking-${n}.html`);

let root, outside;
function write(rel, body) {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), body);
}

beforeAll(() => {
  root = mkdtempSync(resolve(tmpdir(), 'rich-resolve-test-'));
  outside = mkdtempSync(resolve(tmpdir(), 'rich-resolve-outside-'));
  git(root, 'init', '-q');
  assertScratchRepo(root);
  writeFileSync(join(outside, 'escape.html'), PAGE('outside the palace'));

  write('Flocking.md', ['---', 'title: Flocking', 'type: concept', '---', '# Flocking', '', 'Words.', '',
    ...FLOCKING.flatMap((p, i) => [`> **Lens ${i}.** A caption.`, '>', `> [Flocking · lens ${i} →](${p})`, '']),
    'Not a lens: [the page](index.html).', ''].join('\n'));
  for (const p of FLOCKING) write(p, PAGE(p));

  // A rich face whose manifest names every kind of reference.
  write('Demo.md', ['---', 'title: Demo', 'type: concept', '---', '# Demo', '', '![[pond.png]]', '', '## Pieces', '', 'The pieces sit here.', ''].join('\n'));
  // Not a hero: the build would shrink one with sips, into the app's image cache.
  write('Demo/pond.png', 'PNG');
  write('Demo/proofs/gathered/index.html', PAGE('the gathered proof'));
  write('Demo/Demo — rich.json', JSON.stringify({ entry: 'Demo', sections: [{ heading: 'Pieces', pieces: [
    { file: 'index.html', origin: 'gathered' },            // one copy in the bundle's tree
    { file: 'shared.html', origin: 'gathered' },           // two copies elsewhere, none in the bundle
    { file: 'escape.html', origin: 'gathered' },           // a symlink out of the palace
    { file: '/Elsewhere/abs.html', origin: 'gathered' },   // palace-absolute
    { file: 'gone.html', origin: 'gathered' },             // nowhere
    { file: 'take.wav', origin: 'made' },                  // a steward's render git ignores: only on this Mac
  ] }] }));
  symlinkSync(join(outside, 'escape.html'), join(root, 'Demo/escape.html'));
  write('Other/index.html', PAGE('another index'));
  write('Third/index.html', PAGE('a third index'));
  write('A/shared.html', PAGE('shared a'));
  write('B/shared.html', PAGE('shared b'));
  write('Elsewhere/abs.html', PAGE('absolute'));

  // An alias for a file inside the palace, as the root's `_` @import links are.
  write('FOUR PILLARS.md', '# Four Pillars\n');
  symlinkSync('FOUR PILLARS.md', join(root, 'FOUR_PILLARS.md'));

  write('.hidden/x.png', 'PNG');
  write('ignored/clip.mp4', 'MP4');
  write('ignored/notes.txt', 'not media');
  // Tracked before an ignore rule came to match it: tracked stays reachable.
  write('Kept/held.wav', 'RIFF');
  git(root, 'add', 'Kept/held.wav');
  git(root, 'commit', '-qm', 'tracked');
  // A steward's renders, ignored by a file rule (as Projects/**/*.wav is), one
  // of them sharing its name with the tracked take.
  write('Demo/renders/take.wav', 'RIFF');
  write('Demo/renders/held.wav', 'RIFF');
  write('Demo/renders/log.txt', 'a log');
  write('.gitignore', 'ignored/\nKept/*.wav\nDemo/renders/*\n');

  write('_ops/loudon-live/design-system/colors_and_type.css', ':root{}');
  mkdirSync(join(root, '_ops/rich-face'), { recursive: true });
  for (const f of ['rich.html', 'parse.js']) copyFileSync(join(RICH_SRC, f), join(root, '_ops/rich-face', f));
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
  rmSync(outside, { recursive: true, force: true });
});

describe('resolve.mjs, the one resolver', () => {
  // Written, not yet committed: found, and marked local, since git does not track them yet.
  test("Flocking's three text figures resolve: a path with a slash, tried beside the .md", () => {
    const r = makeResolver(root);
    for (const p of FLOCKING) expect(r.resolve(p, 'Flocking.md')).toEqual({ ok: true, path: p, local: true });
  });

  test('a path with a slash: beside the .md, then the root, then the bundle — and never by its last name', () => {
    write('Deep/Inner.md', '# Inner\n');
    write('Deep/sub/beside.png', 'PNG');
    write('sub/rooted.png', 'PNG');
    write('Deep/Inner/sub/bundled.png', 'PNG');
    write('Deep/Inner/stray/beside2.png', 'PNG');
    const r = makeResolver(root);
    expect(r.resolve('sub/beside.png', 'Deep/Inner.md').path).toBe('Deep/sub/beside.png');
    expect(r.resolve('sub/rooted.png', 'Deep/Inner.md').path).toBe('sub/rooted.png');
    expect(r.resolve('sub/bundled.png', 'Deep/Inner.md').path).toBe('Deep/Inner/sub/bundled.png');
    const wrongFolder = r.resolve('elsewhere/beside2.png', 'Deep/Inner.md');
    expect(wrongFolder.ok).toBe(false);
    expect(wrongFolder.reason).toBe('missing');
  });

  test('an ambiguous index.html is refused with a label naming the copies; one in the bundle is chosen', () => {
    const r = makeResolver(root);
    const amb = r.resolve('index.html', 'Flocking.md');
    expect(amb.ok).toBe(false);
    expect(amb.reason).toBe('ambiguous');
    expect(amb.candidates).toEqual(['Demo/proofs/gathered/index.html', 'Other/index.html', 'Third/index.html']);
    expect(amb.label).toMatch(/^3 files are named “index\.html”/);
    // Demo's bundle holds exactly one copy, deep in its tree, so Demo's page finds it.
    expect(r.resolve('index.html', 'Demo.md')).toEqual({ ok: true, path: 'Demo/proofs/gathered/index.html', local: true });
    expect(r.resolve('shared.html', 'Demo.md').reason).toBe('ambiguous');
  });

  test('a symlink out of the palace is refused, by any form of reference', () => {
    const r = makeResolver(root);
    for (const [ref, from] of [['escape.html', 'Demo.md'], ['Demo/escape.html', undefined], ['/Demo/escape.html', undefined]]) {
      const x = r.resolve(ref, from);
      expect(x.ok, ref).toBe(false);
      expect(x.reason, ref).toBe('outside');
      expect(x.label).toContain('outside the palace');
    }
    expect(r.resolve('../x.html', 'Demo.md').reason).toBe('outside');
  });

  test('an alias inside the palace lands on its real file, counted once', () => {
    const r = makeResolver(root);
    expect(r.resolve('FOUR_PILLARS.md')).toEqual({ ok: true, path: 'FOUR PILLARS.md', local: true });
    expect(r.findEntry('four pillars')).toBe('FOUR PILLARS.md');
  });

  // Loudon, 2026-10-20: the live page plays a file that is only on this Mac,
  // and says so; the public build plays only what git tracks.
  test('git decides what exists: a render git ignores plays live, marked local; anything else ignored is refused', () => {
    const r = makeResolver(root);
    expect(r.resolve('ignored/clip.mp4')).toEqual({ ok: true, path: 'ignored/clip.mp4', local: true }); // inside a folder ignored whole
    expect(r.resolve('ignored/notes.txt').reason).toBe('ignored');
    expect(r.resolve('take.wav', 'Demo.md')).toEqual({ ok: true, path: 'Demo/renders/take.wav', local: true }); // by its bare name
    expect(r.resolve('log.txt', 'Demo.md').reason).toBe('missing');
    expect(r.resolve('clip.mp4', 'Demo.md').reason).toBe('missing'); // a folder ignored whole is reached only by a path
    expect(r.resolve('Kept/held.wav')).toEqual({ ok: true, path: 'Kept/held.wav' });
    expect(r.resolve('.hidden/x.png').reason).toBe('hidden');
    expect(r.resolve('/.git/HEAD').reason).toBe('hidden');
    expect(r.resolve('x.png', 'Demo.md').reason).toBe('missing');
  });

  test('a tracked file and a local one by the same name: the tracked one wins, as the build would choose', () => {
    const r = makeResolver(root);
    expect(r.resolve('held.wav', 'Flocking.md')).toEqual({ ok: true, path: 'Kept/held.wav' });
    expect(r.resolve('held.wav', 'Demo.md')).toEqual({ ok: true, path: 'Demo/renders/held.wav', local: true }); // its own bundle first
    expect(makeResolver(root, { tracked: true }).resolve('held.wav', 'Flocking.md')).toEqual({ ok: true, path: 'Kept/held.wav' });
  });

  test("the build ships only committed files, and names a file that is only on this Mac", () => {
    const r = makeResolver(root, { tracked: true });
    expect(r.resolve('Kept/held.wav')).toEqual({ ok: true, path: 'Kept/held.wav' });
    for (const [ref, from] of [[FLOCKING[0], 'Flocking.md'], ['ignored/clip.mp4'], ['take.wav', 'Demo.md']]) {
      const x = r.resolve(ref, from);
      expect(x.ok, ref).toBe(false);
      // Still a miss to the build, and to every caller that asks why (the checker files it as missing).
      expect(x.reason, ref).toBe('missing');
      expect(x.local, ref).toBe(true);
      expect(x.label).toBe(`“${ref}” is only on this Mac: track it to publish.`);
    }
    expect(r.resolve('gone.wav', 'Demo.md')).toMatchObject({ reason: 'missing', label: expect.stringMatching(/^No file “gone\.wav”/) });
    expect(r.resolve('gone.wav', 'Demo.md').local).toBeUndefined();
    expect(r.resolve('ignored/notes.txt').reason).toBe('missing'); // never served, so not offered for publishing either
  });

  test('case counts, as it does on the Linux host that builds the read view', () => {
    const r = makeResolver(root);
    const x = r.resolve('flocking/flocking-p5-expressive.html', 'Flocking.md');
    expect(x.reason).toBe('case');
    expect(x.label).toContain('Flocking/flocking-p5-expressive.html');
  });

  test('a file made after the index was read is found once a second has passed', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      const r = makeResolver(root);
      expect(r.resolve('fresh.png', 'Demo.md').reason).toBe('missing');
      write('Demo/fresh.png', 'PNG');
      vi.setSystemTime(Date.now() + 1500);
      expect(r.resolve('fresh.png', 'Demo.md')).toEqual({ ok: true, path: 'Demo/fresh.png', local: true });
    } finally { vi.useRealTimers(); }
  });

  test('a face kept inside its bundle searches that bundle', () => {
    const r = makeResolver(root);
    expect(r.bundleOf('Demo/Demo — scroll.md')).toBe('Demo');
    expect(r.bundleOf('Demo.md')).toBe('Demo');
    expect(r.resolve('index.html', 'Demo/Demo — scroll.md').path).toBe('Demo/proofs/gathered/index.html');
  });

  test('a palace with no git index finds nothing, and says why', () => {
    const bare = mkdtempSync(resolve(tmpdir(), 'rich-resolve-bare-'));
    try {
      writeFileSync(join(bare, 'a.png'), 'PNG');
      const x = makeResolver(bare).resolve('a.png');
      expect(x.reason).toBe('no-index');
    } finally { rmSync(bare, { recursive: true, force: true }); }
  });
});

describe('the live server and the public build agree', () => {
  let server, port, out, pieces;
  const get = (path) => new Promise((ok, fail) => {
    http.get({ host: '127.0.0.1', port, path }, (res) => {
      const parts = [];
      res.on('data', (c) => parts.push(c));
      res.on('end', () => ok({ status: res.statusCode, headers: res.headers, text: Buffer.concat(parts).toString('utf8') }));
    }).on('error', fail);
  });

  beforeAll(async () => {
    // Committed, as the palace is when CI builds it: the build counts only what git holds.
    git(root, 'add', '-A');
    git(root, 'commit', '-qm', 'the palace');
    // Its pieces run on a piece origin of their own, on a free port (piece-origin.mjs).
    pieces = await startPieceOrigin({ root, port: 0 });
    const handle = createRichHandler({ root, base: '', app: () => 'http://127.0.0.1:9', pieces });
    server = http.createServer(async (req, res) => { if (!(await handle(req, res))) { res.writeHead(405); res.end(); } });
    port = await new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server.address().port)));

    // The build without vite: the app shell it would have made, then the rest for real.
    out = mkdtempSync(resolve(tmpdir(), 'rich-resolve-out-'));
    mkdirSync(join(out, 'assets'), { recursive: true });
    writeFileSync(join(out, 'index.html'), '<!doctype html><title>x</title>');
    execFileSync(process.execPath, [join(APP, 'scripts/build-public.mjs'), '--no-vite', '--root', root, '--out', out], { cwd: APP, stdio: 'pipe', env: gitFreeEnv() });
  }, 60_000);

  afterAll(async () => {
    server.close();
    await pieces?.close();
    rmSync(out, { recursive: true, force: true });
  });

  test("every file the rich face names lands on the same palace path, or fails for the same reason, live and built", async () => {
    const live = JSON.parse((await get('/_api/resolve?entry=Demo')).text).media;
    const built = JSON.parse(readFileSync(join(out, 'data/rich.json'), 'utf8')).entries.Demo.media;
    expect(Object.keys(built).sort()).toEqual(Object.keys(live).sort());
    for (const [name, l] of Object.entries(live)) {
      const b = built[name];
      if (l.local) {
        // Plays on this Mac, marked so; the build refuses it and says why.
        expect(l, name).toMatchObject({ path: 'Demo/renders/take.wav', local: true });
        expect(b, name).toMatchObject({ error: 'missing', label: `“${name}” is only on this Mac: track it to publish.` });
      } else if (l.path) {
        expect(b.path, name).toBe(l.path);
        expect(existsSync(join(out, decodeURIComponent(b.url.replace(/^\.\.\//, '')))), name).toBe(true);
      } else {
        expect(b.error, name).toBe(l.error);
        expect(b.label, name).toBe(l.label);
      }
    }
    expect(live['index.html'].path).toBe('Demo/proofs/gathered/index.html');
    expect(live['/Elsewhere/abs.html'].path).toBe('Elsewhere/abs.html');
    expect(live['shared.html'].error).toBe('ambiguous');
    expect(live['escape.html'].error).toBe('outside');
    expect(live['gone.html'].error).toBe('missing');
    expect(existsSync(join(out, 'files/Demo/escape.html'))).toBe(false);
  });

  test("Flocking's figures play live, and the read view links and carries them", async () => {
    const info = JSON.parse((await get('/_api/resolve?entry=Flocking')).text);
    for (const p of FLOCKING) expect(info.media[p], p).toEqual({ path: p, url: p.split('/').map(encodeURIComponent).join('/') });
    expect(info.media['index.html'].error).toBe('ambiguous');
    const entry = JSON.parse(readFileSync(join(out, `data/entry/${pathId('Flocking.md')}.json`), 'utf8'));
    for (const p of FLOCKING) {
      expect(entry.body).toContain(`](files/${p.split('/').map(encodeURIComponent).join('/')})`);
      expect(existsSync(join(out, 'files', p)), p).toBe(true);
    }
    // The ambiguous link keeps its words and loses the link, live box or not.
    expect(entry.body).toContain('Not a lens: the page.');
  });

  // The page itself, live and as the read view built it: a failed file is a
  // labelled box in the figure's place, the same box in both.
  describe.skipIf(!chromium)('in a browser', () => {
    let browser, statics, staticPort;
    const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.md': 'text/markdown', '.png': 'image/png' };
    beforeAll(async () => {
      browser = await chromium.launch();
      statics = http.createServer((req, res) => {
        let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        if (p.endsWith('/')) p += 'index.html';
        const file = join(out, p);
        if (!file.startsWith(out) || !existsSync(file) || !statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
        res.writeHead(200, { 'Content-Type': TYPES[p.slice(p.lastIndexOf('.'))] || 'application/octet-stream' });
        res.end(readFileSync(file));
      });
      staticPort = await new Promise((ok) => statics.listen(0, '127.0.0.1', () => ok(statics.address().port)));
    }, 30_000);
    afterAll(async () => { await browser?.close(); statics?.close(); });

    const laid = async (url) => {
      const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
      await page.goto(url);
      await page.waitForSelector('figure', { timeout: 20_000 });
      await page.waitForTimeout(300);
      const got = await page.evaluate(() => ({
        boxes: Object.fromEntries([...document.querySelectorAll('.rf-missing')].map((b) => [b.querySelector('b').textContent, b.textContent])),
        frames: [...document.querySelectorAll('iframe')].map((f) => decodeURIComponent(f.getAttribute('src'))),
        local: [...document.querySelectorAll('figure .rf-chip[data-key="local"]')].map((c) => c.closest('figure').dataset.piece),
        list: [...document.querySelectorAll('.head .rf-local li code')].map((c) => c.textContent),
        strips: [...document.querySelectorAll('figure[data-piece] .aud')].map((a) => a.closest('figure').dataset.piece),
      }));
      await page.close();
      return got;
    };

    test('a file that fails is a labelled box, live and in the read view alike', async () => {
      const live = await laid(`http://127.0.0.1:${port}/?entry=Demo&review=0`);
      const built = await laid(`http://127.0.0.1:${staticPort}/rich/?entry=Demo`);
      expect(Object.keys(live.boxes).sort()).toEqual(['escape.html', 'gone.html', 'shared.html']);
      expect(live.boxes['shared.html']).toMatch(/2 files are named “shared\.html”/);
      expect(live.boxes['escape.html']).toMatch(/outside the palace/);
      // A render only on this Mac plays live, marked on its figure and in the
      // head's list; the read view shows its box instead, saying why.
      expect(live.strips).toContain('take.wav');
      expect(live.local).toEqual(['take.wav']);
      expect(live.list).toEqual(['Demo/renders/take.wav']);
      const { 'take.wav': takeBox, ...rest } = built.boxes;
      expect(takeBox).toBe('take.wav“take.wav” is only on this Mac: track it to publish.');
      expect(rest).toEqual(live.boxes);
      expect(built.local).toEqual([]);
      expect(built.list).toEqual([]);
      expect(live.frames).toEqual(expect.arrayContaining(['Demo/proofs/gathered/index.html', 'Elsewhere/abs.html'].map((p) => `${pieces.status.origin}/${p}`)));
      expect(built.frames).toEqual(expect.arrayContaining(['../files/Demo/proofs/gathered/index.html', '../files/Elsewhere/abs.html']));
    }, 60_000);

    test("Flocking's three figures are frames on the live page", async () => {
      const live = await laid(`http://127.0.0.1:${port}/?entry=Flocking&review=0`);
      expect(live.frames).toEqual(FLOCKING.map((p) => `${pieces.status.origin}/${p}`));
      expect(live.boxes).toEqual({});
    }, 30_000);
  });

  test('a name met later asks the same resolver, and a failure answers with its label', async () => {
    const hit = await get(`/_api/media?name=${encodeURIComponent(FLOCKING[0])}&from=Flocking.md`);
    expect(hit.status).toBe(302);
    expect(hit.headers.location).toBe('/' + FLOCKING[0]);
    const amb = await get('/_api/find?name=shared.html&from=Demo.md');
    expect(amb.status).toBe(404);
    expect(JSON.parse(amb.text)).toMatchObject({ reason: 'ambiguous' });
    const out = await get('/_api/media?name=escape.html&from=Demo.md');
    expect(out.status).toBe(404);
    expect(out.text).toContain('outside the palace');
  });
});
