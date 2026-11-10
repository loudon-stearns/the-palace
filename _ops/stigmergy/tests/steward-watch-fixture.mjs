// steward-watch-fixture.mjs — a palace in miniature for the steward-watch and
// project-since tests: a throwaway git repo and a scratch board. Not a test file.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { STEWARD_CYCLE_KIND } from '../steward-watch.mjs';

export const ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
const git = (cwd, args, date) => execFileSync('git', args, {
  cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'],
  env: { ...ENV, ...(date ? { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } : {}) },
});
const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
export const run = (script, args) => strip(execFileSync('node', [script, ...args], { encoding: 'utf8', env: ENV }));

export const PAGE = 'Test Page';
export const DIR = '_ops/agents/permanent/test-page';

// A palace in miniature: an entry with a bundle, a baton born 2026-11-04, a
// registered steward with two cycles on 11-05, an owed proposal, and a scratch
// board holding the card (posted 11-07, as a remainder card is) and a steward note.
export function palace({ registered = true } = {}) {
  const base = realpathSync(mkdtempSync(join(tmpdir(), 'steward-watch-')));
  const root = join(base, 'palace');
  mkdirSync(join(root, PAGE), { recursive: true });
  mkdirSync(join(root, DIR), { recursive: true });
  mkdirSync(join(root, '_ops/agents/permanent'), { recursive: true });
  git(root, ['init', '-q', '-b', 'main']);
  git(root, ['config', 'user.name', 't']); git(root, ['config', 'user.email', 't@t']);
  const commit = (msg, date, files) => {
    for (const [p, text] of Object.entries(files)) writeFileSync(join(root, p), text);
    git(root, ['add', '-A']);
    git(root, ['commit', '-q', '-m', msg], date);
    return git(root, ['rev-parse', '--short', 'HEAD']).trim();
  };
  commit('edit(Test Page): born', '2026-11-01T10:00:00Z', {
    [`${PAGE}.md`]: '---\ntitle: "Test Page"\ntype: project\nstage: growing\n---\n# Test Page\n',
    [`${PAGE}/${PAGE} — baton.md`]: '---\ntitle: "Test Page — baton"\nborn: 2026-11-04\n---\n# Baton\n',
    '_ops/agents/permanent/REGISTRY.json': JSON.stringify({ schema_version: '1.0', agents: registered ? [{ agent_id: PAGE, home: PAGE, dir: DIR }] : [] }),
    [`${DIR}/state.json`]: '{}',
  });
  const c1 = commit('steward(Test Page): cycle 1 — built the tempo map', '2026-11-05T15:00:00Z', { [`${DIR}/state.json`]: '{"i":1}' });
  const c2 = commit('steward(Test Page): cycle 2 — filed the clock edit', '2026-11-05T16:00:00Z', {
    [`${DIR}/state.json`]: '{"i":2}',
    [`${PAGE}/${PAGE} — tuning.md`]: [
      '---', 'title: "Test Page — tuning"', 'ledger: tuning', '---', '', '# Test Page — tuning', '',
      '2. **Proposed for canon** · 2026-11-05 · `Test Page/Schema.md` · the clock block · canon change owed *(proposed by the steward, cycle 2)*',
      '   Why: any tempo', '   > the Set is the clock', '',
    ].join('\n'),
  });
  const c3 = commit('edit(Other): unrelated', '2026-11-06T10:00:00Z', { 'Other.md': 'x\n' });
  const board = join(base, 'board.jsonl');
  const ready = {
    schema_version: '1.0', id: 'test-page-remainder-1', ts: '2026-11-07T12:00:00Z', session_id: 's', from: PAGE, to: '*', type: 'BROADCAST', board: 'GENERAL',
    health: { score: 'green', model: 'claude-opus-5-5' },
    payload: { kind: 'handoff_ready', entry: PAGE, handoff_path: `${PAGE}/${PAGE} — baton.md`, move: 'put the record on the tempo map' },
  };
  const note = {
    schema_version: '1.0', id: 'test-page-cycle-2-on-x', ts: '2026-11-07T13:00:00Z', session_id: 's', from: PAGE, to: '*', type: 'REPLY', board: 'GENERAL', re: ready.id,
    health: { score: 'green', model: 'm' }, payload: { kind: STEWARD_CYCLE_KIND, handoff_id: ready.id, cycle: 3, proposals: [{ item: '2', page: 'Schema' }] },
  };
  writeFileSync(board, [ready, note].map((m) => JSON.stringify(m)).join('\n') + '\n');
  return { base, root, board, c1, c2, c3, ready };
}

