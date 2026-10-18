// The Sentry reads commits and tags — against real git, in throwaway repos.
//   node --test _ops/sentry/tests/*.test.mjs
//
// A message is as public as a file once it is pushed, so the push gate reads every commit and tag
// a push would add (the message in full, the headers for credentials) and the names of the refs
// it updates, and the deep sweep's history check reads every commit and tag in every ref. The
// planted values are built at run time, so this file never trips the Sentry itself.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, realpathSync } from 'node:fs';
import { join, dirname, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const SENTRY = dirname(dirname(fileURLToPath(import.meta.url)));
const GATE = join(SENTRY, 'pre-push.mjs');
const SWEEP = join(SENTRY, 'sweep.mjs');
const KEY = 'ghp_' + 'A1b2C3d4E5f6G7h8'.repeat(3).slice(0, 36);
const ID = ['078', '05', '1120'].join('-');
const WARN = ['do not tell', 'the user'].join(' '); // a phrase the gate raises but never blocks on
const ZERO = '0'.repeat(40);

// Every GIT_* the caller carries is dropped: a hook or `rebase -x` sets GIT_DIR, and these git
// calls must never reach the palace's own repository.
const ENV = {
  ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_'))),
  GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'T', GIT_AUTHOR_EMAIL: 't@example.com', GIT_COMMITTER_NAME: 'T', GIT_COMMITTER_EMAIL: 't@example.com',
};

function scratch() {
  const base = realpathSync(mkdtempSync(join(tmpdir(), 'sentry-msg-')));
  try {
    const repo = join(base, 'repo'), remote = join(base, 'remote.git');
    const g = (...a) => execFileSync('git', ['-c', 'core.hooksPath=/dev/null', ...a], { cwd: repo, env: ENV, encoding: 'utf8' }).trim();
    execFileSync('git', ['init', '-q', '--bare', '-b', 'main', remote], { env: ENV });
    execFileSync('git', ['init', '-q', '-b', 'main', repo], { env: ENV });
    if (!g('rev-parse', '--path-format=absolute', '--git-common-dir').startsWith(base + sep)) throw new Error('git is not aimed at the scratch repo');
    g('remote', 'add', 'origin', remote);
    writeFileSync(join(repo, 'a.md'), 'start\n');
    g('add', 'a.md'); g('commit', '-q', '-m', 'start');
    g('push', '-q', 'origin', 'main');
    const commit = (file, msg) => { writeFileSync(join(repo, file), `${file} ${Math.random()}\n`); g('add', file); g('commit', '-q', '-m', msg); return g('rev-parse', 'HEAD'); };
    const object = (type, text) => execFileSync('git', ['hash-object', '-t', type, '-w', '--stdin'], { cwd: repo, env: ENV, input: text, encoding: 'utf8' }).trim();
    const gate = (lines) => spawnSync('node', [GATE, 'origin', remote], { cwd: repo, env: ENV, input: lines.join('\n') + '\n', encoding: 'utf8' });
    const history = () => {
      const r = spawnSync('node', [SWEEP, '--only', 'history', '--json'], { cwd: repo, env: ENV, encoding: 'utf8' });
      assert.equal(r.status, 0, r.stderr);
      return JSON.parse(r.stdout);
    };
    return { base, repo, remote, g, commit, object, gate, history, done: () => rmSync(base, { recursive: true, force: true }) };
  } catch (e) { rmSync(base, { recursive: true, force: true }); throw e; }
}

const blockedOn = (r, re) => { assert.equal(r.status, 1, r.stderr); assert.match(r.stderr, re); };

test('a key in a commit message blocks the push, named by its commit and masked', () => {
  const s = scratch();
  try {
    const old = s.g('rev-parse', 'origin/main');
    const sha = s.commit('b.md', `edit(b): a clean file\n\nthe token was ${KEY}, pasted by mistake`);
    const r = s.gate([`refs/heads/main ${sha} refs/heads/main ${old}`]);
    blockedOn(r, new RegExp(`HIGH\\s+secret/github-token\\s+commit ${sha.slice(0, 8)} message:3`));
    assert.ok(!r.stderr.includes(KEY), 'the gate printed the raw key');
    assert.match(r.stderr, /bring it to him/);
    assert.doesNotMatch(r.stderr, /git tag -d/);
  } finally { s.done(); }
});

test('a clean message is read and passes, and a message already on the remote is not read again', () => {
  const s = scratch();
  try {
    const dirty = s.commit('b.md', `edit(b): ${KEY}`);
    s.g('push', '-q', 'origin', 'main'); // went out before the gate, as a past push would have
    const clean = s.commit('c.md', `edit(c): ${WARN} about this`);
    const r = s.gate([`refs/heads/main ${clean} refs/heads/main ${dirty}`]);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stderr, new RegExp(`inject/secrecy-order\\s+commit ${clean.slice(0, 8)} message:1`), 'the new message was read');
    assert.ok(!r.stderr.includes(`commit ${dirty.slice(0, 8)}`), 'the public message was read again');
  } finally { s.done(); }
});

test('a merge commit\'s own message is read, which a patch reader never sees', () => {
  const s = scratch();
  try {
    const old = s.g('rev-parse', 'origin/main');
    s.g('checkout', '-q', '-b', 'side');
    s.commit('side.md', 'edit(side): clean');
    s.g('checkout', '-q', 'main');
    s.commit('main.md', 'edit(main): clean');
    s.g('merge', '-q', '--no-ff', 'side', '-m', `merge(side): with ${KEY}`);
    const merge = s.g('rev-parse', 'HEAD');
    blockedOn(s.gate([`refs/heads/main ${merge} refs/heads/main ${old}`]), new RegExp(`commit ${merge.slice(0, 8)} message`));
  } finally { s.done(); }
});

test('an annotated tag carries its own message, read even when its commit is public, and fixed with no rewrite', () => {
  const s = scratch();
  try {
    const pub = s.g('rev-parse', 'origin/main');
    s.g('tag', '-a', 'v1', '-m', `release notes\n\nfor the record ${ID}`, pub);
    const tag = s.g('rev-parse', 'v1');
    const r = s.gate([`refs/tags/v1 ${tag} refs/tags/v1 ${ZERO}`]);
    blockedOn(r, new RegExp(`HIGH\\s+pii/us-ssn\\s+tag ${tag.slice(0, 8)} message:3`));
    assert.match(r.stderr, /git tag -d/);
    assert.doesNotMatch(r.stderr, /bring it to him/);
    assert.ok(!r.stderr.includes(ID.slice(0, 6)), 'more than the last digits of the ID were printed');
  } finally { s.done(); }
});

test('a new branch is read for everything no remote has, messages included', () => {
  const s = scratch();
  try {
    s.g('checkout', '-q', '-b', 'topic');
    const first = s.commit('t1.md', `edit(t1): ${KEY}`);
    const tip = s.commit('t2.md', 'edit(t2): clean');
    blockedOn(s.gate([`refs/heads/topic ${tip} refs/heads/topic ${ZERO}`]), new RegExp(`commit ${first.slice(0, 8)} message`));
  } finally { s.done(); }
});

test('a message "fixed" with git replace is read as the original that push sends', () => {
  const s = scratch();
  try {
    const old = s.g('rev-parse', 'origin/main');
    const sha = s.commit('b.md', `edit(b): ${KEY}`);
    const clean = s.object('commit', s.g('cat-file', 'commit', sha).replace(KEY, '[scrubbed]') + '\n');
    s.g('replace', sha, clean);
    assert.ok(!s.g('log', '-1', '--format=%B', sha).includes(KEY), 'the replace ref did not take');
    blockedOn(s.gate([`refs/heads/main ${sha} refs/heads/main ${old}`]), new RegExp(`commit ${sha.slice(0, 8)} message`));
  } finally { s.done(); }
});

test('a signed tag a merge carries whole is read: its message as prose, its credentials anywhere', () => {
  const s = scratch();
  try {
    const old = s.g('rev-parse', 'origin/main');
    const side = s.commit('side.md', 'edit(side): clean');
    const tagText = `object ${side}\ntype commit\ntag v9\ntagger T <t@example.com> 1 +0000\n\nnotes ${ID}\nand ${KEY}\n-----BEGIN PGP SIGNATURE-----\n\nabc\n-----END PGP SIGNATURE-----\n`;
    const folded = 'mergetag ' + tagText.replace(/\n$/, '').split('\n').join('\n ');
    const tree = s.g('rev-parse', `${side}^{tree}`);
    const merge = s.object('commit', `tree ${tree}\nparent ${old}\nparent ${side}\nauthor T <t@example.com> 1 +0000\ncommitter T <t@example.com> 1 +0000\n${folded}\n\nmerge(v9): clean\n`);
    const r = s.gate([`refs/heads/main ${merge} refs/heads/main ${old}`]);
    blockedOn(r, new RegExp(`pii/us-ssn\\s+commit ${merge.slice(0, 8)} mergetag message:1`));
    assert.match(r.stderr, new RegExp(`secret/github-token\\s+commit ${merge.slice(0, 8)} header`));
  } finally { s.done(); }
});

test('a credential in a tag\'s name or a branch\'s name is caught, and never printed', () => {
  const s = scratch();
  try {
    const sha = s.commit('b.md', 'edit(b): clean');
    s.g('tag', '-a', `rel-${KEY}`, '-m', 'clean notes', sha);
    const tag = s.g('rev-parse', `rel-${KEY}`);
    const r = s.gate([`refs/tags/rel-${KEY} ${tag} refs/tags/rel-${KEY} ${ZERO}`, `refs/heads/wip-${KEY} ${sha} refs/heads/wip-${KEY} ${ZERO}`]);
    blockedOn(r, new RegExp(`secret/github-token\\s+tag ${tag.slice(0, 8)} header`));
    assert.match(r.stderr, /secret\/github-token\s+pushed ref names:2/);
    assert.match(r.stderr, /push it under a clean name/);
    assert.doesNotMatch(r.stderr, /bring it to him/, 'a name needs no rewrite');
    assert.ok(!r.stderr.includes(KEY), 'the gate printed the raw key');
    const log = readFileSync(join(s.repo, '_ops', 'sentry', 'held', 'gate.log'), 'utf8');
    assert.ok(!log.includes(KEY) && log.includes('(ref name withheld)'), 'the gate logged the raw name');
  } finally { s.done(); }
});

test('one commit pushed on two refs is one finding', () => {
  const s = scratch();
  try {
    const old = s.g('rev-parse', 'origin/main');
    const sha = s.commit('b.md', `edit(b): ${KEY}`);
    const r = s.gate([`refs/heads/main ${sha} refs/heads/main ${old}`, `refs/heads/twin ${sha} refs/heads/twin ${ZERO}`]);
    blockedOn(r, /PUSH BLOCKED — 1 finding\(s\)/);
  } finally { s.done(); }
});

test('the history check reads every commit and tag in every ref and says which are public', () => {
  const s = scratch();
  try {
    const pushed = s.commit('b.md', `edit(b): ${KEY}`);
    s.g('push', '-q', 'origin', 'main');
    s.g('fetch', '-q', 'origin');
    s.g('tag', '-a', 'out', '-m', `notes ${ID}`, pushed);
    s.g('tag', '-a', 'kept', '-m', `notes ${ID} again`, pushed);
    s.g('checkout', '-q', '-b', 'local');
    const local = s.commit('c.md', `edit(c): ${KEY}`);
    s.g('checkout', '-q', '-b', 'ghost', 'main');
    const ghost = s.commit('d.md', `edit(d): ${KEY}`);
    s.g('tag', '-a', 'ghost-tag', '-m', 'clean', ghost);
    s.g('push', '-q', 'origin', 'refs/tags/out', 'refs/tags/ghost-tag'); // tags only: no branch reaches ghost

    const report = s.history();
    const keys = Object.fromEntries(report.findings.filter(f => f.message && f.rule === 'github-token').map(f => [f.commit, f.public]));
    assert.equal(keys[pushed], true, 'a message on a pushed branch is public');
    assert.equal(keys[local], false, 'a message only a local branch reaches is not');
    assert.equal(keys[ghost], true, 'a message only a pushed tag reaches is public');
    const ids = Object.fromEntries(report.findings.filter(f => f.message === 'tag' && f.rule === 'us-ssn').map(f => [f.tag, f.public]));
    assert.equal(ids[s.g('rev-parse', 'out')], true, 'a pushed tag\'s message is public');
    assert.equal(ids[s.g('rev-parse', 'kept')], false, 'a local tag\'s message is not');
    assert.equal(report.checks.history.messages, 7, 'four commits and three tags');
    const held = readFileSync(join(s.repo, '_ops', 'sentry', 'held', 'latest.md'), 'utf8');
    assert.ok(!held.includes(KEY) && !held.includes(ID.slice(0, 6)), 'the held report printed a raw value');
  } finally { s.done(); }
});

test('when one remote cannot be asked, a hit no listed ref reaches but a local tag does is unknown, never no', () => {
  const s = scratch();
  try {
    const pub = s.g('rev-parse', 'origin/main');
    s.g('tag', '-a', 'out', '-m', `notes ${ID}`, pub);
    s.g('push', '-q', 'origin', 'refs/tags/out');
    s.g('tag', '-a', 'kept', '-m', `notes ${ID} again`, pub);
    s.g('checkout', '-q', '-b', 'ghost');
    const ghost = s.commit('d.md', `edit(d): ${KEY}`);
    s.g('tag', '-a', 'ghost-tag', '-m', 'clean', ghost);
    s.g('remote', 'add', 'gone', join(s.base, 'gone.git'));
    const report = s.history();
    const tags = Object.fromEntries(report.findings.filter(f => f.message === 'tag').map(f => [f.tag, f.public]));
    assert.equal(tags[s.g('rev-parse', 'out')], true, 'the remote that answered lists this tag');
    assert.equal(tags[s.g('rev-parse', 'kept')], 'unknown', 'the remote that did not answer might have it');
    assert.equal(report.findings.find(f => f.message === 'commit' && f.commit === ghost).public, 'unknown');
    assert.match(readFileSync(join(s.repo, '_ops', 'sentry', 'held', 'latest.md'), 'utf8'), /\| unknown \|/);
  } finally { s.done(); }
});
