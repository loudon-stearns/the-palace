// close-handoff.test.mjs — a partial close carries a worktree only while it lives.
//
// The bug: close-handoff.mjs copied `worktree` onto a remainder card unchecked,
// so a card whose worktree had been deleted sent its next catcher to nothing —
// and every later partial close copied the dead coordinate forward again
// (the STIGMERGY rich-face card still named close/2026-10-13-handoffs, gone).
//
// Two seams: worktreeLive() against a throwaway repo (live, rm -rf'd, plain
// folder, missing), and the real script against a scratch board.
//
// Run:  node --test _ops/stigmergy/tests/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, realpathSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { worktreeLive, ownerRoot, loadBoard } from '../handoff-model.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CLOSE = resolve(HERE, '../close-handoff.mjs');

// Every GIT_* the caller carries is dropped, so a run under a hook asks the
// throwaway repo (or the palace) rather than whatever GIT_DIR points at.
const ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
const git = (cwd, ...args) => execFileSync('git', args, { cwd, env: ENV, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });

function scratch() { return realpathSync(mkdtempSync(join(tmpdir(), 'close-handoff-'))); }

test('worktreeLive: listed and on disk is live; rm -rf, plain folder and missing are not', () => {
  const base = scratch();
  try {
    const repo = join(base, 'repo');
    mkdirSync(repo);
    git(repo, 'init', '-q', '-b', 'main');
    writeFileSync(join(repo, 'a.txt'), 'a\n');
    git(repo, 'add', 'a.txt');
    git(repo, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'a');

    const live = join(base, 'live');
    const gone = join(base, 'gone');
    git(repo, 'worktree', 'add', '-q', '-b', 'live', live);
    git(repo, 'worktree', 'add', '-q', '-b', 'gone', gone);
    rmSync(gone, { recursive: true, force: true });   // deleted, never `git worktree remove`d
    const plain = join(base, 'plain');
    mkdirSync(plain);

    assert.equal(worktreeLive({ branch: 'live', dir: live }, repo), true);
    assert.equal(worktreeLive({ branch: 'live', dir: live + '/' }, repo), true, 'a trailing slash is the same place');
    assert.equal(worktreeLive({ branch: 'gone', dir: gone }, repo), false, 'still listed (prunable), but gone');
    assert.equal(worktreeLive({ branch: 'x', dir: plain }, repo), false, 'a folder, not a worktree');
    assert.equal(worktreeLive({ branch: 'x', dir: join(base, 'never') }, repo), false);
    assert.equal(worktreeLive(null, repo), false);
    assert.equal(worktreeLive({ branch: 'x' }, repo), false);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

function ready(id, worktree, surface) {
  return {
    schema_version: '1.0', id, ts: '2026-10-25T00:00:00Z', session_id: 'test', from: 'Test Entry',
    to: '*', type: 'BROADCAST', board: 'GENERAL',
    health: { score: 'green', model: 'claude-opus-5-5' },
    payload: {
      kind: 'handoff_ready', entry: 'Test Entry', handoff_path: 'Test Entry/baton.md',
      receiving_surface: surface, move: 'the whole move', worktree,
    },
  };
}

test('a partial close keeps a live worktree and drops a gone one, saying so', () => {
  const base = scratch();
  try {
    // The script checks against the palace's own worktree list, so the live
    // coordinate is the owner checkout itself — always listed, always on disk.
    const owner = ownerRoot();
    const head = execFileSync('git', ['-C', owner, 'rev-parse', 'HEAD'], { env: ENV, encoding: 'utf8' }).trim();
    const deadDir = join(base, 'palace-close-gone');
    const board = join(base, 'board.jsonl');
    writeFileSync(board, [
      ready('card-live', { branch: 'main', dir: owner, profile: 'docs' }, 'Claude Code (Mac)'),
      ready('card-gone', { branch: 'close/gone', dir: deadDir, profile: 'docs' }, `Claude Code, worktree close/gone (${deadDir})`),
    ].map((m) => JSON.stringify(m)).join('\n') + '\n');

    const close = (id) => execFileSync('node', [CLOSE, id, '--commit', head, '--partial', '--remainder', `rest of ${id}`, '--board', board],
      { env: ENV, encoding: 'utf8' });

    const liveOut = close('card-live');
    const goneOut = close('card-gone');
    assert.doesNotMatch(liveOut, /worktree dropped/);
    assert.match(goneOut, /worktree dropped/);

    const remainders = loadBoard(board).filter((m) => m.payload.kind === 'handoff_ready' && /-remainder-/.test(m.id));
    const byMove = (move) => remainders.find((m) => m.payload.move === move).payload;

    const kept = byMove('rest of card-live');
    assert.deepEqual(kept.worktree, { branch: 'main', dir: owner, profile: 'docs' });
    assert.doesNotMatch(kept.note, /is gone/);

    const dropped = byMove('rest of card-gone');
    assert.equal('worktree' in dropped, false, 'no worktree field on the remainder');
    assert.match(dropped.note, /Its worktree close\/gone \(.*palace-close-gone\) is gone, so this card names none\./);
    assert.equal(dropped.receiving_surface, 'Claude Code (Mac)', 'a surface naming the dead worktree falls back');
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});
