// The push gate's rich check — against real git, in throwaway repos.
//   node --test _ops/sentry/tests/*.test.mjs
//
// The gate reads the commit being pushed, never the working tree, and runs the piece checker on its
// rich faces when the push touches one. While _ops/rich-face/conform.json has enforce.push off, a
// fault prints and the push goes on; on, an unpinned CDN in a piece blocks it. A push that touches no
// rich face does not run the check at all.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, realpathSync } from 'node:fs';
import { join, dirname, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const SENTRY = dirname(dirname(fileURLToPath(import.meta.url)));
const GATE = join(SENTRY, 'pre-push.mjs');
const ZERO = '0'.repeat(40);

const ENV = {
  ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_'))),
  GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'T', GIT_AUTHOR_EMAIL: 't@example.com', GIT_COMMITTER_NAME: 'T', GIT_COMMITTER_EMAIL: 't@example.com',
};

const PIECE = (head) => `<!doctype html><html><head><meta charset="utf-8"><meta name="piece:needs" content="">${head}</head><body>a piece</body></html>`;
const UNPINNED = PIECE('<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>');
const PINNED = PIECE('<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>');

function scratch({ enforce }) {
  const base = realpathSync(mkdtempSync(join(tmpdir(), 'sentry-rich-')));
  try {
    const repo = join(base, 'repo'), remote = join(base, 'remote.git');
    const g = (...a) => execFileSync('git', ['-c', 'core.hooksPath=/dev/null', ...a], { cwd: repo, env: ENV, encoding: 'utf8' }).trim();
    execFileSync('git', ['init', '-q', '--bare', '-b', 'main', remote], { env: ENV });
    execFileSync('git', ['init', '-q', '-b', 'main', repo], { env: ENV });
    if (!g('rev-parse', '--path-format=absolute', '--git-common-dir').startsWith(base + sep)) throw new Error('git is not aimed at the scratch repo');
    g('remote', 'add', 'origin', remote);
    const put = (rel, body) => { mkdirSync(dirname(join(repo, rel)), { recursive: true }); writeFileSync(join(repo, rel), body); };
    put('a.md', 'start\n');
    put('_ops/rich-face/conform.json', JSON.stringify({ enforce: { push: enforce, build: false }, not_pieces: [], allow: [] }));
    put('Face.md', '# Face\n\n## Pieces\n\nWords.\n');
    put('Face/Face — rich.json', JSON.stringify({ entry: 'Face', sections: [{ heading: 'Pieces', pieces: [{ file: 'p.html', origin: 'made' }] }] }));
    put('Face/p.html', PINNED);
    g('add', '-A'); g('commit', '-q', '-m', 'start');
    g('push', '-q', 'origin', 'main');
    const commit = (rel, body, msg) => { put(rel, body); g('add', '-A'); g('commit', '-q', '-m', msg); return g('rev-parse', 'HEAD'); };
    const pushOf = (sha) => {
      const old = g('rev-parse', 'origin/main');
      return spawnSync('node', [GATE, 'origin', remote], { cwd: repo, env: ENV, input: `refs/heads/main ${sha} refs/heads/main ${old}\n`, encoding: 'utf8' });
    };
    return { repo, g, put, commit, pushOf, done: () => rmSync(base, { recursive: true, force: true }) };
  } catch (e) { rmSync(base, { recursive: true, force: true }); throw e; }
}

test('enforced: an unpinned CDN in a piece a face shows blocks the push', () => {
  const s = scratch({ enforce: true });
  try {
    const r = s.pushOf(s.commit('Face/p.html', UNPINNED, 'unpin d3'));
    assert.equal(r.status, 1, r.stderr);
    assert.match(r.stderr, /PUSH BLOCKED/);
    assert.match(r.stderr, /HIGH\s+rich\/cdn-unpinned\s+Face\/p\.html/);
    assert.match(r.stderr, /fix it in a new commit, no rewrite/);
    assert.doesNotMatch(r.stderr, /is a rewrite, and only Loudon orders one/);
  } finally { s.done(); }
});

test('report-only: the same fault prints, and the push goes on', () => {
  const s = scratch({ enforce: false });
  try {
    const r = s.pushOf(s.commit('Face/p.html', UNPINNED, 'unpin d3'));
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stderr, /report-only: nothing it finds blocks/);
    assert.match(r.stderr, /medium rich\/cdn-unpinned\s+Face\/p\.html/);
  } finally { s.done(); }
});

test('enforced: a pinned CDN with no hash is raised, not blocked', () => {
  const s = scratch({ enforce: true });
  try {
    const r = s.pushOf(s.commit('Face/notes.md', 'a note beside the face\n', 'touch the face'));
    assert.equal(r.status, 0, r.stderr);
    // notes.md is not something the face depends on: no rich check ran.
    assert.doesNotMatch(r.stderr, /rich check/);
    const r2 = s.pushOf(s.commit('Face/p.html', PINNED.replace('a piece', 'a piece, edited'), 'edit the piece'));
    assert.equal(r2.status, 0, r2.stderr);
    assert.match(r2.stderr, /low\s+rich\/cdn-no-sri\s+Face\/p\.html/);
  } finally { s.done(); }
});

test('enforced: the gate judges the commit, not the working tree', () => {
  const s = scratch({ enforce: true });
  try {
    const sha = s.commit('Face/p.html', UNPINNED, 'unpin d3');
    s.put('Face/p.html', PINNED); // fixed on disk, not committed: the push still carries the fault
    const r = s.pushOf(sha);
    assert.equal(r.status, 1, r.stderr);
    assert.match(r.stderr, /rich\/cdn-unpinned/);
  } finally { s.done(); }
});

test('enforced: deleting a piece a face still names blocks the push; touching only a.md runs nothing', () => {
  const s = scratch({ enforce: true });
  try {
    const quiet = s.pushOf(s.commit('a.md', 'more\n', 'a note'));
    assert.equal(quiet.status, 0, quiet.stderr);
    assert.doesNotMatch(quiet.stderr, /rich check/);
    s.g('rm', '-q', 'Face/p.html'); s.g('commit', '-q', '-m', 'drop the piece');
    const r = s.pushOf(s.g('rev-parse', 'HEAD'));
    assert.equal(r.status, 1, r.stderr);
    assert.match(r.stderr, /HIGH\s+rich\/ref-missing\s+Face\.md/);
  } finally { s.done(); }
});
