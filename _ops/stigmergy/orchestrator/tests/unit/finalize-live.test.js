import { describe, test, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { finalizeLive, livePostsSince, ledgerHasRun } from '../../src/finalize-live.js';

// A cycle Loudon drives live posts to the board itself and has no orchestrator
// after it (Shopkeeper cycle 15, 2026-11-07): finalizeLive squares the books.
describe('finalizing a cycle driven live', () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });
  const AGENT = '_ops/agents/permanent/test-steward';
  const LEDGER = () => path.join(root, 'Test Steward', 'Test Steward — tuning.md');
  const BOARD = () => path.join(root, '_ops/swarm/persistent/blackboard.jsonl');

  const msg = (id, extra = {}) => ({ schema_version: '1.0', id, ts: '2026-11-07T12:00:00Z', session_id: 'sess-1', from: 'Test Steward', to: 'GENERAL', type: 'BROADCAST', board: 'GENERAL', health: { score: 'green' }, payload: { content: id }, ...extra });

  function makePalace({ handRunLine = false } = {}) {
    root = mkdtempSync(path.join(tmpdir(), 'palace-fl-'));
    const agentDir = path.join(root, AGENT);
    mkdirSync(agentDir, { recursive: true });
    mkdirSync(path.join(root, '_ops/swarm/persistent'), { recursive: true });
    mkdirSync(path.join(root, 'Test Steward'), { recursive: true });
    writeFileSync(path.join(agentDir, 'manifest.json'), JSON.stringify({ agent_id: 'Test Steward', home: 'Test Steward', session_id: 'sess-1' }));
    writeFileSync(path.join(agentDir, 'state.json'), JSON.stringify({ iteration: 14, last_active: '2026-11-04T13:58:55Z', last_read_cursor: 'ask-14', pending_requests: [{ request_id: 'ask-14' }] }));
    writeFileSync(path.join(agentDir, 'history.jsonl'), '');
    writeFileSync(path.join(root, 'Test Steward.md'), '---\ntitle: "Test Steward"\ntype: project\nstage: growing\nstatus: active\n---\n# Test Steward');
    writeFileSync(LEDGER(), ['---', 'title: "Test Steward — tuning"', 'ledger: tuning', '---', '', '# Test Steward — tuning', '',
      '## From cycle 14 — 2026-11-04', '', '1. **Old lesson.**', '- run · 2026-11-04 · cycle 14 · taught item 1', '',
      ...(handRunLine ? ['## From cycle 15 — 2026-11-07', '', '2. **Filed by hand at the close.**', '- run · 2026-11-07 · cycle 15 · taught items 2', ''] : [])].join('\n'));
    const board = [
      msg('cycle-14'),
      { ...msg('ask-14', { type: 'RESOURCE_REQUEST', board: 'TRICKSTER', to: 'TRICKSTER' }), request_id: 'ask-14', payload: { resource: 'directional_decision', rationale: 'r', blocking: false, options: [{ id: 'A', label: 'A — a' }] } },
      msg('live-spinup'),
      { ...msg('grant'), from: 'TRICKSTER', to: 'Test Steward', type: 'RESOURCE_GRANT', board: 'TRICKSTER', re: 'ask-14', payload: { granted: true, notes: 'steer' } },
      msg('live-ship', { payload: { kind: 'shipped_artifact', headline: 'it reads', content: 'c', lesson: 'Read the model card first.' } }),
      { ...msg('other'), from: 'Someone Else' },
    ];
    writeFileSync(BOARD(), board.map((m) => JSON.stringify(m)).join('\n') + '\n');
    return AGENT;
  }

  test('the steward\'s own posts after its cursor are the live cycle', () => {
    makePalace();
    const board = readFileSync(BOARD(), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    expect(livePostsSince(board, 'Test Steward', 'ask-14').map((m) => m.id)).toEqual(['live-spinup', 'live-ship']);
  });

  test('a live cycle advances the steward, clears the answered ask, marks the ledger and the scroll', () => {
    const agentDir = makePalace();
    const s = finalizeLive({ palaceRoot: root, agentDir, tsNow: '2026-11-07T13:00:00Z' });
    expect(s).toMatchObject({ finalized: true, cycle: 15, posts: ['live-spinup', 'live-ship'], pending_after: [] });
    const state = JSON.parse(readFileSync(path.join(root, AGENT, 'state.json'), 'utf8'));
    expect(state).toMatchObject({ iteration: 15, last_active: '2026-11-07T13:00:00Z', last_read_cursor: 'live-ship' });
    expect(state.pending_requests).toBeUndefined();
    const history = readFileSync(path.join(root, AGENT, 'history.jsonl'), 'utf8');
    expect(history).toContain('"dispatched_by":"live-session"');
    expect(history).toContain('"stop_reason":"live_session"');
    expect(readFileSync(LEDGER(), 'utf8')).toContain('2. Read the model card first. *(offered by the steward, cycle 15)*\n- run · 2026-11-07 · cycle 15 · taught item 2');
    const scroll = readFileSync(path.join(root, 'Test Steward', 'Test Steward — scroll.md'), 'utf8');
    expect(scroll).toContain('**Steward:** cycle 15');
    expect(s.commit).toBe(null);   // the caller did not opt in
  });

  test('a run line the close already wrote by hand is left alone', () => {
    const agentDir = makePalace({ handRunLine: true });
    const before = readFileSync(LEDGER(), 'utf8');
    const s = finalizeLive({ palaceRoot: root, agentDir, tsNow: '2026-11-07T13:00:00Z' });
    expect(s.run.skipped).toMatch(/already carries/);
    expect(readFileSync(LEDGER(), 'utf8')).toBe(before);
  });

  test('a second run finds nothing new; a dry run writes nothing', () => {
    const agentDir = makePalace();
    const stateBefore = readFileSync(path.join(root, AGENT, 'state.json'), 'utf8');
    expect(finalizeLive({ palaceRoot: root, agentDir, dryRun: true })).toMatchObject({ dry_run: true, cycle: 15, ledger: 'run line to add' });
    expect(readFileSync(path.join(root, AGENT, 'state.json'), 'utf8')).toBe(stateBefore);
    finalizeLive({ palaceRoot: root, agentDir, tsNow: '2026-11-07T13:00:00Z' });
    expect(finalizeLive({ palaceRoot: root, agentDir })).toMatchObject({ finalized: false });
  });

  test('ledgerHasRun reads cycle numbers exactly', () => {
    expect(ledgerHasRun('- run · 2026-11-07 · cycle 15 · taught items 11, 12', 15)).toBe(true);
    expect(ledgerHasRun('- run · 2026-11-07 · cycle 15, posted nothing · nothing new', 15)).toBe(true);
    expect(ledgerHasRun('- run · 2026-11-07 · cycle 150 · nothing new', 15)).toBe(false);
  });
});
