// review-and-leave-cli.test.js — the two commands Loudon's yes of 2026-10-21
// made, run end to end against a throwaway git repo: settle-proposal.mjs pays a
// proposal only with the commit that changed its page and declines one with
// his line, and declines from the board what he declined on the deck;
// leave-stewardship.mjs reads before it acts and retires a steward on --apply.

import { describe, test, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import { proposalLines, parseProposals } from '../../src/ledger.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const STIG = resolve(HERE, '..', '..', '..');
const plain = (t) => String(t || '').replace(/\x1b\[[0-9;]*m/g, '');
const run = (script, args, cwd) => {
  const r = spawnSync('node', [join(STIG, script), ...args], { cwd, encoding: 'utf8' });
  return { status: r.status, stdout: plain(r.stdout), stderr: plain(r.stderr) };
};
const git = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

let root;
afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

function repo() {
  root = mkdtempSync(join(tmpdir(), 'review-leave-cli-'));
  git(root, 'init', '-q', '-b', 'main');
  git(root, 'config', 'user.email', 't@example.com');
  git(root, 'config', 'user.name', 'T');
  mkdirSync(join(root, 'Projects/Wave'), { recursive: true });
  mkdirSync(join(root, '_ops/swarm/persistent'), { recursive: true });
  mkdirSync(join(root, '_ops/agents/permanent/keys'), { recursive: true });
  writeFileSync(join(root, 'Projects/Wave.md'), '---\ntitle: "Wave"\ntype: project\nstatus: active\nstage: growing\n---\n# Wave\n\n## Forward Vector\n\nFirst move: a sketch.\n');
  writeFileSync(join(root, 'Projects/Wave/Wave — tuning.md'), ['# Wave — tuning', '',
    ...proposalLines(2, { page: 'Wave', path: 'Projects/Wave.md', entry: true, exists: true, place: '§ Forward Vector', words: 'The sketch is done.', why: 'the plan moved', date: '2026-10-20', by: 'proposed by the steward, cycle 19' }),
    ...proposalLines(3, { page: 'Wave', path: 'Projects/Wave.md', entry: true, exists: true, place: '§ Gotchas', words: 'Keep it slow.', why: 'it clicks', date: '2026-10-20', by: 'proposed by the steward, cycle 20' }),
    ...proposalLines(4, { page: 'Wave', path: 'Projects/Wave.md', entry: true, exists: true, place: '§ Gotchas', words: 'Never loud.', why: 'ears', date: '2026-10-21', by: 'proposed by the steward, cycle 21', urgent: true, ask: 'wave-21-urgent-1' }),
    ''].join('\n'));
  writeFileSync(join(root, 'Projects/Keys.md'), '---\ntitle: "Keys"\ntype: project\nstatus: complete\nstage: fruiting\n---\n# Keys\n');
  writeFileSync(join(root, '_ops/agents/permanent/keys/manifest.json'), '{}\n');
  writeFileSync(join(root, '_ops/agents/permanent/REGISTRY.json'), JSON.stringify({ schema_version: '1.0', agents: [{ agent_id: 'Keys', home: 'Keys', dir: '_ops/agents/permanent/keys', registered_at: 'x' }] }, null, 2) + '\n');
  const deny = { schema_version: '1.0', id: 'resp-1', ts: '2026-10-21T13:00:00Z', from: 'TRICKSTER', to: 'Wave', type: 'RESOURCE_GRANT', board: 'TRICKSTER', re: 'wave-21-urgent-1', payload: { option_id: 'DECLINE', notes: 'already in the gotchas' } };
  writeFileSync(join(root, '_ops/swarm/persistent/blackboard.jsonl'), `${JSON.stringify(deny)}\n`);
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'seed');
  return root;
}
const items = () => parseProposals(readFileSync(join(root, 'Projects/Wave/Wave — tuning.md'), 'utf8'));
const board = () => join(root, '_ops/swarm/persistent/blackboard.jsonl');

describe('settle-proposal.mjs', () => {
  test('a pay cites the commit that changed the page, a decline carries the line, and a settled item is not settled twice', () => {
    repo();
    const seed = git(root, 'rev-parse', 'HEAD');
    writeFileSync(join(root, 'notes.txt'), 'x\n');
    git(root, 'add', 'notes.txt'); git(root, 'commit', '-q', '-m', 'unrelated');
    const unrelated = git(root, 'rev-parse', 'HEAD');
    expect(run('settle-proposal.mjs', ['Wave', '2', '--paid', unrelated, '--root', root], root).stderr).toMatch(/does not change Projects\/Wave\.md/);
    expect(items()[0].owed).toBe(true);

    writeFileSync(join(root, 'Projects/Wave.md'), readFileSync(join(root, 'Projects/Wave.md'), 'utf8').replace('First move: a sketch.', 'The sketch is done.'));
    git(root, 'add', 'Projects/Wave.md'); git(root, 'commit', '-q', '-m', 'edit(Wave): takes in item 2');
    const landed = git(root, 'rev-parse', 'HEAD');
    const paid = run('settle-proposal.mjs', ['Wave', '2', '--paid', landed, '--root', root], root);
    expect(paid.status).toBe(0);
    expect(paid.stdout).toContain(`paid Wave item 2 in ${landed.slice(0, 8)}`);
    expect(paid.stdout).toContain('--path "Projects/Wave/Wave — tuning.md"');
    expect(items()[0]).toMatchObject({ owed: false, outcome: { kind: 'paid', commit: landed.slice(0, 8) } });

    expect(run('settle-proposal.mjs', ['Wave', '3', '--declined', 'not a gotcha yet', '--root', root], root).status).toBe(0);
    expect(items()[1]).toMatchObject({ owed: false, outcome: { kind: 'declined', reason: 'not a gotcha yet' } });
    expect(run('settle-proposal.mjs', ['Wave', '3', '--declined', 'again', '--root', root], root).stderr).toMatch(/already settled/);
    expect(seed).not.toBe(landed);
  });

  test('--from-board declines what Loudon declined on the deck, stamped when he said it', () => {
    repo();
    const r = run('settle-proposal.mjs', ['--from-board', '--root', root, '--board', board()], root);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('declined Wave item 4: already in the gotchas');
    const four = items()[2];
    expect(four).toMatchObject({ owed: false, outcome: { kind: 'declined', reason: 'already in the gotchas' } });
    expect(four.status).toMatch(/^declined on 2026-10-21 \d{2}:\d{2}: already in the gotchas$/);
    expect(items()[0].owed).toBe(true); // an item with no answer is left for the review
  });
});

describe('leave-stewardship.mjs', () => {
  test('it reads before it acts, refuses a page that has not ended, and retires an ended one on --apply', () => {
    repo();
    const live = run('leave-stewardship.mjs', ['Wave', '--root', root, '--board', board()], root);
    expect(live.stdout).toMatch(/Not yet:[\s\S]*has not ended/);
    const dry = run('leave-stewardship.mjs', ['Keys', '--root', root, '--board', board()], root);
    expect(dry.stdout).toContain('Nothing stands in the way.');
    expect(existsSync(join(root, '_ops/agents/permanent/keys'))).toBe(true);
    const done = run('leave-stewardship.mjs', ['Keys', '--apply', '--why', 'finished', '--root', root, '--board', board()], root);
    expect(done.status).toBe(0);
    expect(done.stdout).toContain('Keys has left stewardship.');
    expect(done.stdout).toContain('--path "_ops/agents/permanent/REGISTRY.json" --path "_ops/agents/permanent/keys"');
    expect(existsSync(join(root, '_ops/agents/permanent/keys'))).toBe(false);
    expect(JSON.parse(readFileSync(join(root, '_ops/agents/permanent/REGISTRY.json'), 'utf8')).agents).toEqual([]);
  });
});
