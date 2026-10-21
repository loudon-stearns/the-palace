import { describe, test, expect, afterEach } from 'vitest';
import { resolve } from 'node:path';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { buildProjectRows } from '../../server/projects.js';
import { proposalLines, declinedStatus } from '../../../orchestrator/src/ledger.js';

// The ledger review's pressure on the PROJECTS deck (Loudon, 2026-10-18, "all
// three"): a project row counts what its steward proposed for canon and Loudon
// has not reviewed, read from the page's tuning ledger.

function makePalace() {
  const root = mkdtempSync(resolve(tmpdir(), 'stigmergy-proposed-test-'));
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  mkdirSync(resolve(root, '_ops/agents/permanent'), { recursive: true });
  mkdirSync(resolve(root, 'Projects/Murmuration'), { recursive: true });
  mkdirSync(resolve(root, 'Projects/Quiet'), { recursive: true });
  writeFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), '');
  const page = (t) => `---\ntitle: "${t}"\ntype: project\nstatus: active\nstage: growing\nforward_vector: "I want to become a flock."\n---\n# ${t}\n\n## What Exists\n\n- one\n`;
  writeFileSync(resolve(root, 'Projects/Murmuration.md'), page('Murmuration'));
  writeFileSync(resolve(root, 'Projects/Quiet.md'), page('Quiet'));
  const item = (n, extra = {}) => proposalLines(n, { page: 'Murmuration', path: 'Projects/Murmuration.md', entry: true, exists: true, place: '§ What Exists', words: '- two', why: 'it is built', date: '2026-10-20', by: 'proposed by the steward, cycle 3', ...extra });
  const declined = item(3);
  declined[0] = declined[0].replace('canon change owed', declinedStatus('not yet', new Date(2026, 9, 21, 9, 0)));
  writeFileSync(resolve(root, 'Projects/Murmuration/Murmuration — tuning.md'), ['# Murmuration — tuning', '', ...item(1), ...item(2, { words: '- three', urgent: true, ask: 'm-urgent-1' }), ...declined, ''].join('\n'));
  return root;
}

describe('a project row counts its owed proposals for canon', () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

  test('owed ones count, urgent ones are named, a settled one is not counted', () => {
    root = makePalace();
    const rows = buildProjectRows({ palaceRoot: root });
    const m = rows.find((r) => r.home === 'Murmuration');
    const q = rows.find((r) => r.home === 'Quiet');
    expect(m).toMatchObject({ proposed_owed: 2, proposed_urgent: 1 });
    expect(q).toMatchObject({ proposed_owed: 0, proposed_urgent: 0 });
    expect(rows[0].home).toBe('Murmuration'); // it needs Loudon, so it sorts first
  });
});
