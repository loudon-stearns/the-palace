// palace-land and the ledgers git merges by union: on copies of the palace's
// real Closing Well and Return tuning ledgers, with its own .gitattributes, in
// a throwaway repo. Union never conflicts, so two closes that each append the
// next item, or a Return that edits its last item in place beside another
// branch's append, landed silently before (twice by hand, e87fe638 and
// b5e36856). Now the second landing is refused, naming the items, and lands
// once they are settled in the branch. The check itself: tests/unit/ledger-merge.test.js.

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readMarker } from '../../server/landing.js';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP = resolve(__dirname, '..', '..');
const PALACE = resolve(APP, '..', '..', '..');
const LAND = join(APP, 'scripts', 'palace-land.mjs');
const CW = 'Closing Well/Closing Well — tuning.md';
const RT = '_ops/Return Ceremony/Return Ceremony — tuning.md';

let base;
let owner;
let a;
let b;
const g = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', env: gitFreeEnv() });
const land = (cwd, branch) => spawnSync('node', [LAND, branch], { cwd, encoding: 'utf8', env: gitFreeEnv({ PALACE_DOOR_NO_BOARD: '1' }) });
const read = (root, p) => readFileSync(join(root, p), 'utf8');
const write = (root, p, s) => writeFileSync(join(root, p), s);
const numbers = (text) => [...text.matchAll(/^(\d+[a-z]?)\. /gm)].map((m) => m[1]);
const repeated = (text) => numbers(text).filter((n, i, all) => all.indexOf(n) !== i);
const lastNumber = (text) => Math.max(...numbers(text).map((n) => parseInt(n, 10)));

// A close's lesson, appended at the end the way Closing Well's executor does.
const closeAppend = (text, who, n) => `${text.replace(/\n*$/, '\n')}\n## From close ${who} — 2026-10-21\n\n${n}. **Close ${who}'s lesson.** What close ${who} learned.\n- run · 2026-10-21 · v1.12 · close-${who.toLowerCase()} · taught item ${n}\n`;

// The Return's last item and where it sits, so the edit and the other side's
// append meet whatever the real ledger has grown to.
function lastItem(text) {
  const lines = text.split('\n');
  let at = -1;
  lines.forEach((l, i) => { if (/^\d+[a-z]?\. /.test(l)) at = i; });
  return { lines, at };
}
function returnAppendAfterLastItem(text, n) {
  const { lines, at } = lastItem(text);
  lines.splice(at + 1, 0, '', `${n}. **Return A's lesson.** What return A learned.`);
  return lines.join('\n');
}
function returnSeenAgain(text) {
  const { lines, at } = lastItem(text);
  lines[at] = `${lines[at]} Seen again at return B (2026-10-21).`;
  return lines.join('\n');
}

beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), 'ledgerland-'));
  owner = join(base, 'owner');
  mkdirSync(owner);
  g(owner, 'init', '-q', '-b', 'main');
  assertScratchRepo(owner, base);
  g(owner, 'config', 'user.email', 't@t');
  g(owner, 'config', 'user.name', 't');
  g(owner, 'config', 'commit.gpgsign', 'false');
  for (const p of ['.gitattributes', CW, RT]) {
    mkdirSync(dirname(join(owner, p)), { recursive: true });
    writeFileSync(join(owner, p), readFileSync(join(PALACE, p)));
  }
  g(owner, 'add', '-A');
  g(owner, 'commit', '-qm', 'the real ledgers');
  a = join(base, 'a');
  b = join(base, 'b');
  g(owner, 'worktree', 'add', '-q', '-b', 'close/a', a);
  g(owner, 'worktree', 'add', '-q', '-b', 'close/b', b);
  assertScratchRepo(a, base);
  assertScratchRepo(b, base);
});
afterEach(() => { rmSync(base, { recursive: true, force: true }); });

describe('palace-land over union-merged ledgers', () => {
  test('the real ledgers are union-merged here, as in the palace', () => {
    const attr = g(owner, '-c', 'core.quotepath=false', 'check-attr', 'merge', '--', CW, RT);
    expect(attr).toContain(`${CW}: merge: union`);
    expect(attr).toContain(`${RT}: merge: union`);
  });

  test('two closes that append the same next item, and a Return edited in place beside an append: the second landing is refused, naming the items; settled in its branch, it lands', () => {
    const n = lastNumber(read(owner, CW)) + 1;
    const r = lastNumber(read(owner, RT));
    write(a, CW, closeAppend(read(a, CW), 'A', n));
    write(a, RT, returnAppendAfterLastItem(read(a, RT), r + 1));
    g(a, 'commit', '-qam', 'close A and return A');
    write(b, CW, closeAppend(read(b, CW), 'B', n));
    write(b, RT, returnSeenAgain(read(b, RT)));
    g(b, 'commit', '-qam', 'close B and return B');

    const first = land(a, 'close/a');
    expect(first.status, first.stderr).toBe(0);
    const before = g(owner, 'rev-parse', 'main').trim();

    const second = land(b, 'close/b');
    expect(second.status).toBe(2);
    expect(second.stderr).toContain('palace-land: refused: the merge would leave');
    expect(second.stderr).toContain(`${CW}: item ${n} twice (both sides added one)`);
    expect(second.stderr).toContain(`${RT}: item ${r} in two forms`);
    expect(second.stderr).toMatch(/Merge main into the branch in its own worktree/);
    expect(g(owner, 'rev-parse', 'main').trim()).toBe(before);
    expect(readMarker(owner)).toBeNull();
    expect(repeated(read(owner, CW))).toEqual([]);

    // Settled in the branch: main merged in, close B's lesson renumbered, the
    // Return's item kept once, in its new form.
    g(b, 'merge', '-q', '--no-edit', 'main');
    write(b, CW, closeAppend(read(owner, CW), 'B', n + 1));
    write(b, RT, returnSeenAgain(read(owner, RT)));
    g(b, 'commit', '-qam', 'close B renumbered after close A; the Return\'s item once');

    const third = land(b, 'close/b');
    expect(third.status, third.stderr).toBe(0);
    const cw = read(owner, CW);
    const rt = read(owner, RT);
    expect(repeated(cw)).toEqual([]);
    expect(repeated(rt)).toEqual([]);
    expect(cw).toContain(`${n}. **Close A's lesson.**`);
    expect(cw).toContain(`${n + 1}. **Close B's lesson.**`);
    expect(rt).toContain('Seen again at return B (2026-10-21).');
  }, 60_000);

  test('two closes with their own numbers land, and a heading run on from the line above is noted, not refused', () => {
    const n = lastNumber(read(owner, CW)) + 1;
    write(a, CW, closeAppend(read(a, CW), 'A', n));
    g(a, 'commit', '-qam', 'close A');
    write(b, CW, closeAppend(read(b, CW), 'B', n + 1));
    g(b, 'commit', '-qam', 'close B');

    expect(land(a, 'close/a').status).toBe(0);
    const second = land(b, 'close/b');
    expect(second.status, second.stderr).toBe(0);
    expect(second.stdout).toMatch(/palace-land: landed [0-9a-f]{8}/);
    expect(second.stderr).toContain(`palace-land: note: in ${CW}, the heading "## From close B — 2026-10-21" run on from the line above`);
    expect(repeated(read(owner, CW))).toEqual([]);
  }, 60_000);
});
