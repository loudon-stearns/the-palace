import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { resolve, join } from 'node:path';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';
import { plan, writePlan, pinTag, libraryTags, libName, pagesFor } from '../../../../rich-face/pin-cdn.mjs';
import { loadShelf } from '../../../../rich-face/conform.mjs';

// pin-cdn.mjs over a temp palace (a git repository, since pages are listed from
// git's index), with a stand-in for the CDN: no test reaches the network.

const D3 = 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js';
const D3_LOOSE = 'https://cdn.jsdelivr.net/npm/d3@7';
const P5 = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js';
const BYTES = { [D3]: 'd3 v7.9.0', [D3_LOOSE]: 'd3 v7.9.0', [P5]: 'p5 1.9.4', 'https://unpkg.com/x@1.0.0/x.js': 'x one' };
const sri = (s) => 'sha384-' + createHash('sha384').update(s).digest('base64');

function fakeFetch(bytes = BYTES) {
  return async (url) => {
    if (!(url in bytes)) return new Response('not found', { status: 404 });
    return new Response(bytes[url], { status: 200, headers: { 'access-control-allow-origin': '*' } });
  };
}

let root;
beforeEach(() => {
  root = mkdtempSync(resolve(tmpdir(), 'rich-pin-cdn-'));
  execFileSync('git', ['init', '-q'], { cwd: root, env: gitFreeEnv() });
  assertScratchRepo(root);
  mkdirSync(join(root, '_ops/rich-face'), { recursive: true });
  mkdirSync(join(root, 'Entry'), { recursive: true });
  writeFileSync(join(root, 'Entry/loose.html'), [
    '<!doctype html><head>',
    '<!-- <script src="https://cdn.jsdelivr.net/npm/d3@7"></script> a comment is not a load -->',
    `<script src="${D3_LOOSE}"></script>`,
    `<script defer src='${P5}' data-x="1"></script>`,
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">',
    '</head><body><script type="module">import y from "https://unpkg.com/y@2.0.0/y.js";</script></body>',
  ].join('\n'), 'utf8');
  writeFileSync(join(root, 'Entry/pinned.html'), `<script src="${P5}" integrity="${sri(BYTES[P5])}" crossorigin="anonymous"></script>\n`, 'utf8');
  mkdirSync(join(root, 'Theirs'), { recursive: true });
  writeFileSync(join(root, 'Theirs/page.html'), `<script src="${P5}"></script>\n`, 'utf8');
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('the shelf', () => {
  test('a library is named from its CDN url', () => {
    expect(libName(D3)).toBe('d3');
    expect(libName(P5)).toBe('p5.js');
    expect(libName('https://unpkg.com/@babel/standalone@7.29.0/babel.min.js')).toBe('@babel/standalone');
    expect(libName('https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6.17/dist/plot.umd.min.js')).toBe('@observablehq/plot');
  });

  test('--add with --from puts the exact url on the shelf, standing for the loose spelling', async () => {
    const r = await plan({ root, pages: [], add: [{ url: D3, from: [D3_LOOSE] }], fetchImpl: fakeFetch() });
    expect(r.files.map((f) => f.path)).toEqual(['_ops/rich-face/libs.json']);
    const shelf = JSON.parse(r.files[0].after);
    expect(shelf.libs).toEqual([{ name: 'd3', version: '7.9.0', url: D3, integrity: sri('d3 v7.9.0'), from: [D3_LOOSE] }]);
    // conform reads the same file, in lane B's shape.
    writePlan(root, r.files);
    expect(loadShelf(root).byUrl.get(D3).integrity).toBe(sri('d3 v7.9.0'));
  });

  test('a loose spelling that serves other bytes today is refused, and a loose url is never shelved', async () => {
    const r = await plan({ root, pages: [], add: [{ url: D3, from: [D3_LOOSE] }, { url: D3_LOOSE, from: [] }], fetchImpl: fakeFetch({ ...BYTES, [D3_LOOSE]: 'd3 v7.9.1' }) });
    expect(r.files).toEqual([]);
    expect(r.report.refused.map((x) => x.why)).toEqual([
      expect.stringMatching(/serves other bytes today/),
      expect.stringMatching(/not at an exact version/),
    ]);
  });

  test('an exact url whose bytes changed under the shelf is refused, not replaced', async () => {
    writeFileSync(join(root, '_ops/rich-face/libs.json'), JSON.stringify({ libs: [{ name: 'p5.js', version: '1.9.4', url: P5, integrity: sri('old bytes') }] }), 'utf8');
    const r = await plan({ root, pages: [], add: [{ url: P5, from: [] }], fetchImpl: fakeFetch() });
    expect(r.files).toEqual([]);
    expect(r.report.refused[0].why).toMatch(/bytes behind an exact url changed/);
  });
});

describe('pinning pages', () => {
  test('the tags in comments and in code are not tags; fonts are left alone', () => {
    const tags = libraryTags(readFileSync(join(root, 'Entry/loose.html'), 'utf8'));
    expect(tags.map((t) => [t.url, t.line])).toEqual([[D3_LOOSE, 3], [P5, 4]]);
  });

  test('a tag keeps its other attributes and quoting, gains integrity and crossorigin, and takes the exact url', () => {
    const lib = { url: D3, integrity: sri('d3 v7.9.0') };
    expect(pinTag(`<script defer src='${D3_LOOSE}' data-x="1">`, 'src', lib))
      .toBe(`<script defer src="${D3}" integrity="${lib.integrity}" crossorigin="anonymous" data-x="1">`);
    expect(pinTag(`<script src="${D3}" integrity="sha384-wrong" crossorigin>`, 'src', lib))
      .toBe(`<script src="${D3}" integrity="${lib.integrity}" crossorigin>`);
  });

  test('--seed shelves the exact urls the pages load; each page is pinned; code loads are listed by hand; a pinned page is left alone', async () => {
    const r = await plan({ root, pages: ['Entry/loose.html', 'Entry/pinned.html'], seed: true, add: [{ url: D3, from: [D3_LOOSE] }], fetchImpl: fakeFetch() });
    expect(r.files.map((f) => f.path)).toEqual(['_ops/rich-face/libs.json', 'Entry/loose.html']);
    const page = r.files[1].after;
    expect(page).toContain(`<script src="${D3}" integrity="${sri('d3 v7.9.0')}" crossorigin="anonymous"></script>`);
    expect(page).toContain(`<script defer src="${P5}" integrity="${sri('p5 1.9.4')}" crossorigin="anonymous" data-x="1"></script>`);
    expect(page).toContain('<!-- <script src="https://cdn.jsdelivr.net/npm/d3@7"></script> a comment is not a load -->');
    expect(page).toContain('fonts.googleapis.com/css2?family=Inter">');
    expect(r.report.byHand).toEqual([{ path: 'Entry/loose.html', url: 'https://unpkg.com/y@2.0.0/y.js', line: 6 }]);
    expect(r.report.pages[0].changes.map((c) => c.integrity)).toEqual(['added', 'added']);
  });

  test('--shelf-only shelves what the pages load and changes no page, saying what pinning would do', async () => {
    const r = await plan({ root, pages: ['Entry/loose.html'], seed: true, shelfOnly: true, add: [{ url: D3, from: [D3_LOOSE] }], fetchImpl: fakeFetch() });
    expect(r.files.map((f) => f.path)).toEqual(['_ops/rich-face/libs.json']);
    expect(JSON.parse(r.files[0].after).libs.map((l) => l.url)).toEqual([D3, P5]);
    expect(r.report.pages[0].changes).toHaveLength(2);
  });

  test('a page whose library is not on the shelf is reported, not changed', async () => {
    const r = await plan({ root, pages: ['Entry/loose.html'], fetchImpl: fakeFetch() });
    expect(r.files).toEqual([]);
    expect(r.report.offShelf.map((o) => [o.url, o.exact])).toEqual([[D3_LOOSE, false], [P5, true]]);
  });

  test('--except leaves a folder alone', () => {
    execFileSync('git', ['add', '-A'], { cwd: root, env: gitFreeEnv() });
    expect(pagesFor(root, { all: true, except: ['Theirs'] }).sort()).toEqual(['Entry/loose.html', 'Entry/pinned.html']);
  });
});

describe('writing only what was shown', () => {
  test('the same run comes to the same digest; a file that changed since it was read is not written', async () => {
    const args = { root, pages: ['Entry/loose.html'], seed: true, add: [{ url: D3, from: [D3_LOOSE] }], fetchImpl: fakeFetch() };
    const a = await plan(args), b = await plan(args);
    expect(a.digest).toBe(b.digest);
    writeFileSync(join(root, 'Entry/loose.html'), readFileSync(join(root, 'Entry/loose.html'), 'utf8') + '<!-- someone else -->\n', 'utf8');
    const c = await plan(args);
    expect(c.digest).not.toBe(a.digest);
    const w = writePlan(root, a.files);
    expect(w).toEqual({ written: [], changed: ['Entry/loose.html'] });
    expect(readFileSync(join(root, 'Entry/loose.html'), 'utf8')).toContain(`src="${D3_LOOSE}"`);
  });
});
