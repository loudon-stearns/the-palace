// The runner's own path: runCycle() hands back what the inbox could not queue,
// and the plain-text summary names it. Shadow only — a temp board, a temp
// digest folder and a temp budget path; nothing touches the live board.

import { describe, it, expect } from 'vitest';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { runCycle } from '../../src/cli.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '../../src/cli.js');
const NOW = '2026-10-13T12:00:00Z';

// A request carrying neither request_id nor id: nothing can ever answer it.
const ORPHAN = {
  schema_version: '1.0', ts: '2026-10-01T09:00:00Z', session_id: 'hand', from: 'Orphan Page',
  to: 'TRICKSTER', type: 'RESOURCE_REQUEST', board: 'TRICKSTER',
  payload: { resource: 'directional_decision', blocking: true, options: [{ id: 'a', label: 'a' }] },
};

function tempBoard() {
  const dir = mkdtempSync(join(tmpdir(), 'trickster-auto-cli-'));
  const board = join(dir, 'board.jsonl');
  writeFileSync(board, JSON.stringify(ORPHAN) + '\n', 'utf8');
  return { dir, board };
}

describe('runCycle and the CLI — a request with neither id', () => {
  it('runCycle returns it as unanswerable, not pending', () => {
    const { dir, board } = tempBoard();
    const out = runCycle({ boardPath: board, now: NOW, budgetStatePath: join(dir, 'budget.json') });
    expect(out.unanswerable).toHaveLength(1);
    expect(out.unanswerable[0].from).toBe('Orphan Page');
    expect(out.digest.counts.pending).toBe(0);
  });

  it('the plain-text summary names it once', () => {
    const { dir, board } = tempBoard();
    const run = spawnSync(process.execPath, [CLI, '--board', board, '--out', dir], { encoding: 'utf8' });
    expect(run.status).toBe(0);
    const named = run.stdout.split('\n').filter((l) => l.includes('unanswerable (no request_id, no id)'));
    expect(named).toEqual(['  unanswerable (no request_id, no id): Orphan Page · 2026-10-01T09:00:00Z']);
  });
});
