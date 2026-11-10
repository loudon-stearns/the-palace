// A steward cycle on a page with an active baton posts a note against its card
// ([[Two Batons, One Board]], check 1). BLUELINE, 2026-11-05: the steward built
// the open baton's item 1 and filed it as a proposal, and nothing told the card.
import { describe, test, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { processCycle } from '../../src/process-cycle.js';
import { foldHandoffs } from '../../../handoff-model.mjs';
import { STEWARD_CYCLE_KIND, stewardNotesOn } from '../../../steward-watch.mjs';
import { isMakingMessage } from '../../src/scroll-file.js';

function assistantLine(fences) {
  const text = fences.map((f) => '```json\n' + JSON.stringify(f) + '\n```').join('\n\n');
  return JSON.stringify({ type: 'assistant', message: { usage: { output_tokens: 5 }, content: [{ type: 'text', text }] } });
}

const ready = (id, entry = 'Test Steward') => ({
  schema_version: '1.0', id, ts: '2026-11-04T14:00:00Z', session_id: 's', from: entry, to: '*', type: 'BROADCAST', board: 'GENERAL',
  health: { score: 'green', model: 'claude-opus-5-5' },
  payload: { kind: 'handoff_ready', entry, handoff_path: `${entry}/${entry} — baton.md`, move: 'put the record on the tempo map' },
});
const claim = (re) => ({ schema_version: '1.0', id: `claim-${re}`, ts: '2026-11-04T15:00:00Z', session_id: 's', from: 'a session', to: '*', type: 'REPLY', board: 'GENERAL', re, health: { score: 'green', model: 'm' }, payload: { kind: 'handoff_picked_up', lifecycle: 'claim', handoff_id: re } });
const closed = (re) => ({ schema_version: '1.0', id: `close-${re}`, ts: '2026-11-04T16:00:00Z', session_id: 's', from: 'a session', to: '*', type: 'REPLY', board: 'GENERAL', re, health: { score: 'green', model: 'm' }, payload: { kind: 'handoff_closed', handoff_id: re, commit: 'abc' } });

describe('a steward cycle posts against an active baton card on its page', () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });
  const BOARD = () => path.join(root, '_ops/swarm/persistent/blackboard.jsonl');
  const board = () => readFileSync(BOARD(), 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));

  function makePalace(boardLines) {
    if (root) rmSync(root, { recursive: true, force: true });
    root = mkdtempSync(path.join(tmpdir(), 'palace-pc-baton-'));
    const agentDir = path.join(root, '_ops/agents/permanent/test-steward');
    mkdirSync(agentDir, { recursive: true });
    mkdirSync(path.join(root, '_ops/swarm/persistent'), { recursive: true });
    mkdirSync(path.join(root, 'Test Steward'), { recursive: true });
    writeFileSync(path.join(agentDir, 'manifest.json'), JSON.stringify({ agent_id: 'Test Steward', home: 'Test Steward', mode: 'long_duration_background', session_id: 'sess-1', model: { name: 'claude-opus-4-7' } }));
    writeFileSync(path.join(agentDir, 'state.json'), JSON.stringify({ iteration: 0, last_active: null, last_read_cursor: null }));
    writeFileSync(path.join(agentDir, 'history.jsonl'), '');
    writeFileSync(path.join(root, 'Test Steward.md'), '---\ntitle: "Test Steward"\ntype: project\nstage: growing\nstatus: active\n---\n# Test Steward\n\n## Scope\n\nOne tempo.\n');
    writeFileSync(BOARD(), boardLines.map((m) => JSON.stringify(m)).join('\n') + (boardLines.length ? '\n' : ''));
    return '_ops/agents/permanent/test-steward';
  }

  function cycle(agentDir, fences, cycleN = 1) {
    const transcriptPath = path.join(root, `t-${cycleN}.jsonl`);
    writeFileSync(transcriptPath, assistantLine(fences));
    return processCycle({ palaceRoot: root, transcriptPath, agentDir, cycleN, iteration: cycleN, tsNow: '2026-11-05T15:43:36Z' });
  }

  const shipped = (extra = {}) => ({
    schema_version: '1.0', id: 'ts-ship-1', ts: '2026-11-05T15:40:00Z', session_id: 'sess-1', from: 'Test Steward', to: '*', type: 'BROADCAST', board: 'GENERAL',
    payload: { kind: 'shipped_artifact', headline: 'the tempo map', content: 'built a reader of the Set clock', ...extra },
  });

  test('a shipped cycle posts one note against the open card, naming the proposal it filed', () => {
    const agentDir = makePalace([ready('h-open')]);
    const summary = cycle(agentDir, [shipped({ proposed_edits: [{ page: 'Test Steward', place: 'Scope', words: 'Any tempo.', why: 'the tempo map reads the Set clock' }] })]);

    expect(summary.posted_ids).toEqual(['ts-ship-1']);   // the note is not counted as shipped
    expect(summary.handoff_notes).toHaveLength(1);
    expect(summary.handoff_notes[0]).toMatchObject({ handoff_id: 'h-open', state: 'open' });

    const notes = stewardNotesOn(board(), 'h-open');
    expect(notes).toHaveLength(1);
    const n = notes[0];
    expect(n).toMatchObject({ type: 'REPLY', re: 'h-open', from: 'Test Steward', to: '*', board: 'GENERAL' });
    expect(n.payload).toMatchObject({ kind: STEWARD_CYCLE_KIND, handoff_id: 'h-open', cycle: 1, posted: ['ts-ship-1'], move: 'put the record on the tempo map' });
    expect(n.payload.proposals).toEqual([{ item: '1', page: 'Test Steward', place: 'Scope' }]);
    expect(n.payload.note).toMatch(/item 1 \(Test Steward\).*say so on both and settle it once/);
    expect(n.health.score).toBe('green');

    // The note never changes the card's state: still open, nothing closed or claimed.
    const fold = foldHandoffs(board());
    expect(fold.open.map((c) => c.m.id)).toEqual(['h-open']);
    expect(fold.claimed).toHaveLength(0);
    // and the scroll never counts it as a made thing
    expect(isMakingMessage(n)).toBe(false);

    const hist = readFileSync(path.join(root, agentDir, 'history.jsonl'), 'utf8');
    expect(hist).toContain('"event":"HANDOFF_NOTED"');
  });

  test('a claimed card is noted too, and says it is claimed', () => {
    const agentDir = makePalace([ready('h-claimed'), claim('h-claimed')]);
    cycle(agentDir, [shipped()]);
    const [n] = stewardNotesOn(board(), 'h-claimed');
    expect(n.payload.handoff_state).toBe('claimed');
    expect(n.payload.proposals).toEqual([]);
    expect(n.payload.note).toMatch(/while this baton is claimed/);
    expect(foldHandoffs(board()).claimed.map((c) => c.m.id)).toEqual(['h-claimed']);
  });

  test('no note for a closed card, another page\'s card, or a barren cycle', () => {
    const agentDir = makePalace([ready('h-done'), closed('h-done'), ready('h-other', 'Other Page')]);
    const s1 = cycle(agentDir, [shipped()]);
    expect(s1.handoff_notes).toEqual([]);
    expect(board().some((m) => m.payload && m.payload.kind === STEWARD_CYCLE_KIND)).toBe(false);

    const agentDir2 = makePalace([ready('h-open')]);
    const transcriptPath = path.join(root, 't-barren.jsonl');
    writeFileSync(transcriptPath, JSON.stringify({ type: 'assistant', message: { usage: { output_tokens: 3 }, content: [{ type: 'text', text: 'posting nothing' }] } }));
    const s2 = processCycle({ palaceRoot: root, transcriptPath, agentDir: agentDir2, cycleN: 2, iteration: 2, tsNow: '2026-11-05T16:00:00Z' });
    expect(s2.barren).toBe(true);
    expect(s2.handoff_notes).toEqual([]);
    expect(stewardNotesOn(board(), 'h-open')).toEqual([]);
  });

  test('the note rides the cycle\'s commit with the board', () => {
    const agentDir = makePalace([ready('h-open')]);
    const transcriptPath = path.join(root, 't-plan.jsonl');
    writeFileSync(transcriptPath, assistantLine([shipped()]));
    const summary = processCycle({ palaceRoot: root, transcriptPath, agentDir, cycleN: 1, iteration: 1, tsNow: '2026-11-05T15:43:36Z', commit: 'plan' });
    expect(summary.handoff_notes).toHaveLength(1);
    expect(JSON.stringify(summary.commit.plan)).toContain('blackboard.jsonl');
  });
});
