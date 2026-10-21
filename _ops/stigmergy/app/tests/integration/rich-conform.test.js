import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';
import {
  makeContext, checkStatic, checkBrowser, findChromium, commitContext, openErrors, renderReport, RULES, scanPage, blankJsComments,
} from '../../../../rich-face/conform.mjs';
import { readDeclaration, manifestContract, exactVersion, parseSize } from '../../../../rich-face/contract.mjs';

// The piece checker (_ops/rich-face/conform.mjs): a planted case for every rule
// it has, in a temp palace that is a git repository (the resolver reads git's
// index), and the marks a piece comes out with. The browser rules run in
// headless Chromium against the checker's own loopback server, never :5173.

const HERE = dirname(fileURLToPath(import.meta.url));
const KIT_DIR = resolve(HERE, '../../../../rich-face');

const page = (head, body = '<p>a piece</p>') => `<!doctype html><html><head><meta charset="utf-8">${head}</head><body style="margin:8px">${body}</body></html>`;
const NONE = '<meta name="piece:needs" content="">'; // declares, and needs nothing
const TONE_ON_CLICK = `<button id="go">play</button><div style="height:300px"></div><script>
let ctx; document.getElementById('go').addEventListener('click', () => { ctx = ctx || new AudioContext(); const o = ctx.createOscillator(), g = ctx.createGain(); g.gain.value = 0.001; o.connect(g); g.connect(ctx.destination); o.start(); ctx.resume(); });
</script>`;

// Each planted page, by name, and the one rule it is there to trip (null: it trips none).
const PIECES = {
  'clean.html': [page(`${NONE}<meta name="piece:size" content="flow">`), null],
  'needs-unknown.html': [page('<meta name="piece:needs" content="telepathy">'), 'needs-unknown'],
  'net-malformed.html': [page('<meta name="piece:net" content="https://api.example.com/v1">'), 'net-malformed'],
  'size-malformed.html': [page('<meta name="piece:size" content="huge">'), 'size-malformed'],
  'meta-unknown.html': [page(`${NONE}<meta name="piece:colour" content="red">`), 'meta-unknown'],
  'need-undeclared.html': [page(NONE, '<script>localStorage.setItem("k", 1)</script>'), 'need-undeclared'],
  'need-undeclared-pre.html': [page('', '<script>localStorage.setItem("k", 1)</script>'), 'need-undeclared'],
  'need-unused.html': [page('<meta name="piece:needs" content="storage">'), 'need-unused'],
  'grant-missing.html': [page('<meta name="piece:needs" content="camera">', '<script>navigator.mediaDevices.getUserMedia({ video: true })</script>'), 'grant-missing'],
  'granted.html': [page('<meta name="piece:needs" content="camera">', '<script>navigator.mediaDevices.getUserMedia({ video: true })</script>'), null],
  'file-undeclared.html': [page(NONE, '<script>fetch("data.json")</script>'), 'file-undeclared'],
  'file-declared.html': [page(`${NONE}<meta name="piece:files" content="data.json">`, '<script>fetch("data.json")</script>'), null],
  'file-missing.html': [page(`${NONE}<meta name="piece:files" content="nope.json">`), 'file-missing'],
  'file-ignored.html': [page(NONE, '<img src="renders/frame.png">'), 'file-ignored'],
  'file-outside.html': [page(`${NONE}<meta name="piece:files" content="away.json">`), 'file-outside'],
  'net-undeclared.html': [page(NONE, '<script>fetch("https://api.example.com/v1/x")</script>'), 'net-undeclared'],
  'cdn-unpinned.html': [page(`${NONE}<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>`), 'cdn-unpinned'],
  'cdn-no-sri.html': [page(`${NONE}<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>`), 'cdn-no-sri'],
  'url-root-absolute.html': [page(NONE, '<img src="/Pieces/data.json">'), 'url-root-absolute'],
  'post-target.html': [page(NONE, '<script>parent.postMessage({ type: "x" }, location.origin)</script>'), 'post-target'],
  'parent-reach.html': [page(NONE, '<script>try { parent.document.title } catch (e) {}</script>'), 'parent-reach'],
  'kit-bundled.html': [page(`${NONE}<script data-rich-kit="1">/* an old copy */</script>`), 'kit-bundled'],
  'review-layer.html': [page(`${NONE}<script src="../_ops/loudon-live/design-system/ui_kits/review-layer/review-layer.js"></script>`), 'review-layer'],
  'shared.html': [page(`${NONE}<script src="../_ops/loudon-live/design-system/palace-tokens.js"></script>`), null],
  'commented.html': [page(NONE, '<script>/* <script src="gone.js"> fetch("gone.json") */ // localStorage\nconst u = "http://x/y"; loadPreset("smooth");</script>'), null],
  // The browser's rules.
  'console-error.html': [page(NONE, '<div>b</div><script>null.boom;</script>'), 'console-error'],
  'sandbox-blocked.html': [page('', '<script>localStorage.getItem("k")</script>'), 'sandbox-blocked'],
  'height-silent.html': [page(NONE, '<div style="height:400px"></div><script>/* speaks rich:height itself, and never sends one */</script>'), 'height-silent'],
  'play-silent.html': [page(NONE, '<button id="go">play</button><script>const ctx = new AudioContext();</script>'), 'play-silent'],
  'hush-loud.html': [page(NONE, `${TONE_ON_CLICK}<script>/* answers rich:hush itself, and does nothing */</script>`), 'hush-loud'],
  'plays.html': [page(NONE, TONE_ON_CLICK), null],
  'error-after-block.html': [page(NONE, '<script>fetch("data.json").catch(() => {}); setTimeout(() => notDefinedAnywhere(), 300);</script>'), 'error-after-block'],
  'load-failed.html': [page(NONE, '<script>const t = Date.now(); while (Date.now() - t < 2500) {}</script>'), 'load-failed'],
};
const BROWSER = ['console-error.html', 'sandbox-blocked.html', 'height-silent.html', 'play-silent.html', 'hush-loud.html', 'plays.html', 'clean.html', 'error-after-block.html', 'load-failed.html'];

const MANIFEST = (pieces) => JSON.stringify({ entry: 'Face', sections: [{ heading: 'Pieces', pieces }] });

function makePalace() {
  const root = mkdtempSync(resolve(tmpdir(), 'rich-conform-test-'));
  execFileSync('git', ['init', '-q'], { cwd: root, env: gitFreeEnv() });
  assertScratchRepo(root);
  const put = (rel, text) => { mkdirSync(dirname(resolve(root, rel)), { recursive: true }); writeFileSync(resolve(root, rel), text, 'utf8'); };
  put('.gitignore', 'Pieces/renders/\n');
  for (const [name, [html]] of Object.entries(PIECES)) put(`Pieces/${name}`, html);
  put('Pieces/data.json', '{}');
  put('_ops/loudon-live/design-system/palace-tokens.js', '/* tokens */');
  put('_ops/loudon-live/design-system/ui_kits/review-layer/review-layer.js', '/* review layer */');
  put('_ops/rich-face/grants.json', JSON.stringify({ grants: [{ piece: 'Pieces/granted.html', needs: ['camera'], yes: '2026-10-20', why: 'test' }] }));
  mkdirSync(resolve(root, 'Outside'), { recursive: true });
  symlinkSync(resolve(tmpdir()), resolve(root, 'Pieces/away.json'));
  // A rich face: one piece by its path, a gathered proof with a contract, one
  // found only across the palace, one with both declarations, one missing.
  put('Face.md', '---\ntitle: Face\n---\n# Face\n\n## Pieces\n\nWords.\n');
  put('Elsewhere/loose.html', page(NONE));
  put('Face/gathered.html', page('', '<script>localStorage.setItem("k", 1)</script>'));
  put('Face/both.html', page(NONE));
  put('Face/bad-contract.html', page(''));
  put('Face/Face — rich.json', MANIFEST([
    { file: 'gathered.html', origin: 'gathered', contract: { needs: ['storage'], size: 'fill 4/3' } },
    { file: 'both.html', origin: 'made', contract: { needs: [] } },
    { file: 'bad-contract.html', origin: 'gathered', contract: 'camera' },
    { file: 'loose.html', origin: 'gathered' },
    { file: '/Pieces/clean.html', origin: 'made' },
    { file: 'ghost.html', origin: 'made' },
  ]));
  return root;
}

let root, run, byPath;
const rulesOf = (path) => (byPath.get(path)?.findings || []).map((f) => f.rule);
const finding = (path, rule) => (byPath.get(path)?.findings || []).find((f) => f.rule === rule);

beforeAll(() => {
  root = makePalace();
  const ctx = makeContext(root);
  run = checkStatic(ctx, { all: true });
  byPath = new Map(run.results.map((r) => [r.path, r]));
});
afterAll(() => { if (root) rmSync(root, { recursive: true, force: true }); });

describe('the contract, read one way', () => {
  test('a head declaration: lists split on commas when there is one, else on spaces; a repeated meta joins', () => {
    const d = readDeclaration(page('<meta name="piece:needs" content="camera storage"><meta name="piece:files" content="a b.json, c.json"><meta name="piece:files" content="d.json"><meta content="fill 4/3" name="piece:size">'));
    expect(d.needs).toEqual(['camera', 'storage']);
    expect(d.files).toEqual(['a b.json', 'c.json', 'd.json']);
    expect(d.size).toMatchObject({ mode: 'fill' });
    expect(d.size.ratio).toBeCloseTo(4 / 3);
    expect(readDeclaration(page(''))).toBeNull();
    expect(readDeclaration(page(NONE))).toMatchObject({ needs: [], source: 'head' });
  });
  test('a manifest contract block, and sizes and versions', () => {
    expect(manifestContract({ contract: { needs: 'camera', size: 'fill 4/3' } })).toMatchObject({ needs: ['camera'], source: 'manifest' });
    expect(manifestContract({})).toBeNull();
    expect(parseSize('flow')).toMatchObject({ mode: 'flow' });
    expect(parseSize('fill 1.5')).toMatchObject({ mode: 'fill', ratio: 1.5 });
    expect(parseSize('big')).toBeNull();
    for (const [u, v] of [['https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js', '7.9.0'], ['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'r128'], ['https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js', '7.8.5'], ['https://cdn.jsdelivr.net/npm/d3@7', null], ['https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/dist/plot.umd.min.js', null], ['https://cdn.tailwindcss.com', null]]) expect(exactVersion(u)).toBe(v);
  });
  test('comments are not code, and a string handed to a loader counts only when it reads as a file', () => {
    expect(blankJsComments('a // fetch("x")\nb /* c */ "//d"').includes('fetch')).toBe(false);
    const s = scanPage(PIECES['commented.html'][0]);
    expect(s.loads).toEqual([]);
    expect([...s.uses.keys()]).toEqual([]);
  });
});

describe('a planted case for every static rule', () => {
  const planted = Object.entries(PIECES).filter(([n, [, rule]]) => rule && !BROWSER.includes(n));
  test.each(planted)('%s trips its rule', (name, [, rule]) => {
    expect(rulesOf(`Pieces/${name}`)).toContain(rule);
  });
  test.each(Object.entries(PIECES).filter(([, [, rule]]) => !rule).map(([n]) => n))('%s trips none', (name) => {
    expect(rulesOf(`Pieces/${name}`)).toEqual([]);
  });
  test('every static rule has a planted case', () => {
    const tripped = new Set([...run.results.flatMap((r) => r.findings), ...run.faceFindings].map((f) => f.rule));
    const staticRules = Object.entries(RULES).filter(([, m]) => m.family !== 'browser').map(([r]) => r);
    const shelfRules = ['cdn-off-shelf', 'cdn-sri-mismatch']; // planted against a shelf, below
    expect(staticRules.filter((r) => !tripped.has(r) && !shelfRules.includes(r))).toEqual([]);
  });
  test('a need the code uses is an error for a piece that declared, a warning for one that never did', () => {
    expect(finding('Pieces/need-undeclared.html', 'need-undeclared').level).toBe('error');
    expect(finding('Pieces/need-undeclared-pre.html', 'need-undeclared').level).toBe('warn');
  });
  test('a file git ignores is a warning, a file that is nowhere an error', () => {
    expect(finding('Pieces/file-ignored.html', 'file-ignored').level).toBe('warn');
    expect(finding('Pieces/file-missing.html', 'file-missing').level).toBe('error');
  });
});

describe('the rich face: how it names its files', () => {
  const faceRules = () => run.faceFindings.map((f) => `${f.rule}:${f.key}`);
  test('a name that resolves nowhere, and one found only across the palace', () => {
    expect(faceRules()).toContain('ref-missing:ghost.html');
    expect(faceRules()).toContain('ref-loose:loose.html');
    expect(faceRules().filter((r) => r.startsWith('ref-loose'))).toEqual(['ref-loose:loose.html']);
  });
  test('a gathered proof whose manifest declares for it is introduced, and owed', () => {
    const r = byPath.get('Face/gathered.html');
    expect(r.declaration).toMatchObject({ source: 'manifest', needs: ['storage'], size: 'fill 4/3' });
    expect(r.mark).toBe('introduced');
    expect(r.owed).toBe(true);
    expect(rulesOf('Face/gathered.html')).toEqual([]);
  });
  test('both declarations: the head wins, and says so; a contract that is not an object', () => {
    expect(rulesOf('Face/both.html')).toEqual(['contract-both']);
    expect(rulesOf('Face/bad-contract.html')).toContain('contract-malformed');
  });
  test('marks: introduced, pre-contract, errored', () => {
    expect(byPath.get('Pieces/clean.html').mark).toBe('introduced');
    expect(byPath.get('Pieces/need-undeclared-pre.html').mark).toBe('pre-contract');
    expect(byPath.get('Pieces/cdn-unpinned.html').mark).toBe('errored');
  });
  test('the report names every page and counts by rule', () => {
    const md = renderReport(run, { title: 't' });
    expect(md).toContain('`Pieces/clean.html` | introduced');
    expect(md).toContain('| cdn-unpinned | pins | 1 |');
  });
});

describe('the shelf', () => {
  test('a library off the shelf, and one whose hash is not the shelf\'s', () => {
    const dir = mkdtempSync(resolve(tmpdir(), 'rich-conform-shelf-'));
    try {
      execFileSync('git', ['init', '-q'], { cwd: dir, env: gitFreeEnv() });
      assertScratchRepo(dir);
      mkdirSync(resolve(dir, 'P'), { recursive: true });
      mkdirSync(resolve(dir, '_ops/rich-face'), { recursive: true });
      const url = 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js';
      writeFileSync(resolve(dir, '_ops/rich-face/libs.json'), JSON.stringify({ libs: [{ name: 'd3', version: '7.9.0', url, integrity: 'sha384-good' }] }));
      writeFileSync(resolve(dir, 'P/off.html'), page(`${NONE}<script src="https://unpkg.com/three@0.128.0/build/three.min.js"></script>`));
      writeFileSync(resolve(dir, 'P/bad.html'), page(`${NONE}<script src="${url}" integrity="sha384-bad"></script>`));
      writeFileSync(resolve(dir, 'P/good.html'), page(`${NONE}<script src="${url}" integrity="sha384-good" crossorigin="anonymous"></script>`));
      const r = new Map(checkStatic(makeContext(dir), { all: true }).results.map((x) => [x.path, x.findings.map((f) => f.rule)]));
      expect(r.get('P/off.html')).toEqual(['cdn-off-shelf']);
      expect(r.get('P/bad.html')).toEqual(['cdn-sri-mismatch']);
      expect(r.get('P/good.html')).toEqual([]);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

describe('a commit, not the working tree', () => {
  test('the push gate judges what is committed; an uncommitted fix is not seen, nor an uncommitted fault', () => {
    const dir = mkdtempSync(resolve(tmpdir(), 'rich-conform-commit-'));
    const g = (...a) => execFileSync('git', a, { cwd: dir, env: gitFreeEnv({ GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t.invalid', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t.invalid' }) }).toString().trim();
    try {
      g('init', '-q');
      assertScratchRepo(dir);
      mkdirSync(resolve(dir, 'Face'), { recursive: true });
      writeFileSync(resolve(dir, 'Face.md'), '# Face\n\n## Pieces\n\nWords.\n');
      writeFileSync(resolve(dir, 'Face/p.html'), page(`${NONE}<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>`));
      writeFileSync(resolve(dir, 'Face/Face — rich.json'), MANIFEST([{ file: 'p.html', origin: 'made' }]));
      g('add', '-A'); g('commit', '-qm', 'one');
      const sha = g('rev-parse', 'HEAD');
      writeFileSync(resolve(dir, 'Face/p.html'), page(NONE)); // fixed, but not committed
      const { ctx, done } = commitContext(dir, sha);
      try {
        const c = checkStatic(ctx, { all: false });
        expect(openErrors(c).map((f) => `${f.rule}:${f.piece}`)).toEqual(['cdn-unpinned:Face/p.html']);
      } finally { done(); }
      expect(openErrors(checkStatic(makeContext(dir), { all: false }))).toEqual([]); // the working tree is clean
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

const { chromium } = findChromium();
if (!chromium) console.warn('[rich-conform] browser rules SKIPPED — no Playwright Chromium on this machine (npx playwright install chromium)');

describe.skipIf(!chromium)('a planted case for every browser rule, in headless Chromium', () => {
  let results;
  beforeAll(async () => {
    const ctx = makeContext(root);
    results = BROWSER.map((n) => byPath.get(`Pieces/${n}`)).map((r) => ({ ...r, findings: [...r.findings] }));
    const b = await checkBrowser(ctx, results, { concurrency: 4, loadTimeout: 1200 });
    expect(b.ran).toBe(true);
  }, 120_000);
  const of = (n) => results.find((r) => r.path === `Pieces/${n}`);
  test.each(BROWSER.filter((n) => PIECES[n][1]))('%s trips its rule', (n) => {
    expect(of(n).findings.map((f) => f.rule)).toContain(PIECES[n][1]);
  });
  test('a clean piece reports its height at both widths; one that plays posts rich:play and goes quiet on hush', () => {
    expect(of('clean.html').findings.map((f) => f.rule)).toEqual([]);
    for (const w of of('clean.html').browser) expect(w.height).toBeGreaterThan(0);
    expect(of('plays.html').findings.map((f) => f.rule)).toEqual([]);
    expect(of('plays.html').browser.every((w) => w.play && w.hushed)).toBe(true);
  });
  test('every rule the checker has, static or browser, has a planted case', () => {
    const tripped = new Set([...run.results.flatMap((r) => r.findings), ...run.faceFindings, ...results.flatMap((r) => r.findings)].map((f) => f.rule));
    expect(Object.keys(RULES).filter((r) => !tripped.has(r) && !['cdn-off-shelf', 'cdn-sri-mismatch'].includes(r))).toEqual([]);
  });
  test('a script error is an error; storage refused by the sandbox is a warning until the piece origin', () => {
    expect(of('console-error.html').mark).toBe('errored');
    expect(of('sandbox-blocked.html').findings.find((f) => f.rule === 'sandbox-blocked').level).toBe('warn');
  });
});
