// The app's readers of answers honour a RETRACT the way the deck does (SCHEMA —
// Reference §9; the rule is ../../../live-answers.mjs): a retracted grant or deny
// answers nothing, so its ask is waiting again; a retracted request or proposal
// is no ask; a RETRACT naming a RETRACT changes nothing.

import { describe, test, expect } from 'vitest';
import { decisionFor } from '../../src/lib/scroll-view.js';
import { planUnsungEmission, planHubEmission } from '../../src/lib/weave-propose.js';
import { unansweredRequests } from '../../src/lib/inbox.js';
import { buildQueue } from '../../src/lib/queue-model.js';

const grant = (re, id, extra = {}) => ({ id, ts: '2026-11-02T09:00:00Z', type: 'RESOURCE_GRANT', board: 'TRICKSTER', from: 'TRICKSTER', re, payload: { option_id: 'SHIP', ...extra } });
const deny = (re, id) => ({ id, ts: '2026-11-02T09:00:00Z', type: 'RESOURCE_DENY', board: 'TRICKSTER', from: 'TRICKSTER', re, payload: {} });
const retract = (re, id) => ({ id, ts: '2026-11-03T09:00:00Z', type: 'RETRACT', board: 'TRICKSTER', from: 'TRICKSTER', re, payload: { reason: 'posted in error' } });

describe('scroll-view decisionFor', () => {
  const msg = { id: 'gsl-039', request_id: 'gsl-039', type: 'RESOURCE_REQUEST', payload: {} };

  test('grant, then a RETRACT of the grant: the card shows no decision', () => {
    expect(decisionFor(msg, [msg, grant('gsl-039', 'g1')])).toMatchObject({ option: 'SHIP' });
    expect(decisionFor(msg, [msg, grant('gsl-039', 'g1'), retract('g1', 'x1')])).toBe(null);
  });

  test('a RETRACT of the RETRACT changes nothing', () => {
    expect(decisionFor(msg, [msg, grant('gsl-039', 'g1'), retract('g1', 'x1'), retract('x1', 'x2')])).toBe(null);
  });

  test('the first live answer is the one shown, as before; a retracted first gives way to the next', () => {
    const board = [msg, grant('gsl-039', 'g1', { option_id: 'FIRST' }), grant('gsl-039', 'g2', { option_id: 'SECOND' })];
    expect(decisionFor(msg, board).option).toBe('FIRST');
    expect(decisionFor(msg, [...board, retract('g1', 'x1')]).option).toBe('SECOND');
  });
});

describe('weave-propose suppression', () => {
  const edges = [
    { source: 'A.md', target_name: 'B', target_path: 'B.md' },
    { source: 'A.md', target_name: 'C', target_path: 'C.md' },
  ];
  const prop = { id: 'old-1', type: 'BROADCAST', payload: { kind: 'vector_proposal', source_entry: 'A.md', target_entry: 'B.md' } };

  test('a granted pair is not suppressed; grant then RETRACT of the grant: the proposal is open again, so suppressed', () => {
    expect(planUnsungEmission({ edges, existing: [prop, grant('old-1', 'g1')], limit: 10, runId: 'R' }).deduped).toBe(0);
    expect(planUnsungEmission({ edges, existing: [prop, grant('old-1', 'g1'), retract('g1', 'x1')], limit: 10, runId: 'R' }).deduped).toBe(1);
  });

  test('a RETRACT of the RETRACT changes nothing', () => {
    expect(planUnsungEmission({ edges, existing: [prop, grant('old-1', 'g1'), retract('g1', 'x1'), retract('x1', 'x2')], limit: 10, runId: 'R' }).deduped).toBe(1);
  });

  test('a retracted deny no longer suppresses as a "no"; it is open and suppressed as open', () => {
    expect(planUnsungEmission({ edges, existing: [prop, deny('old-1', 'd1'), retract('d1', 'x1')], limit: 10, runId: 'R' }).deduped).toBe(1);
  });

  test('a retracted proposal suppresses nothing', () => {
    expect(planUnsungEmission({ edges, existing: [prop], limit: 10, runId: 'R' }).deduped).toBe(1);
    expect(planUnsungEmission({ edges, existing: [prop, retract('old-1', 'x1')], limit: 10, runId: 'R' }).deduped).toBe(0);
  });

  test('the hub planner reads the same way', () => {
    const hub = { id: 'hub-1', type: 'BROADCAST', payload: { kind: 'vector_proposal', proposal_type: 'promote_hub', source_entry: 'A.md' } };
    const cand = [{ path: 'A.md', title: 'A', inbound_degree: 9 }];
    expect(planHubEmission({ candidates: cand, existing: [hub, grant('hub-1', 'g1')] }).deduped).toBe(0);
    expect(planHubEmission({ candidates: cand, existing: [hub, grant('hub-1', 'g1'), retract('g1', 'x1')] }).deduped).toBe(1);
    expect(planHubEmission({ candidates: cand, existing: [hub, retract('hub-1', 'x1')] }).deduped).toBe(0);
  });
});

describe('the deck: inbox.js and buildQueue through the shared helper', () => {
  const req = { id: 'q1', request_id: 'q1', ts: '2026-11-01T09:00:00Z', type: 'RESOURCE_REQUEST', board: 'TRICKSTER', from: 'Shep', payload: { resource: 'fork' } };
  const prop = { id: 'vp1', ts: '2026-11-01T09:00:00Z', type: 'BROADCAST', board: 'WEAVE', from: 'Weave', payload: { kind: 'vector_proposal', proposal_type: 'promote_unsung', source_entry: 'A', target_entry: 'B' } };
  const open = (msgs) => unansweredRequests(msgs).map((m) => m.id);
  const cards = (msgs) => buildQueue(msgs).map((c) => c.id).sort();

  test('grant then RETRACT of the grant: the ask is open; a RETRACT of that RETRACT changes nothing', () => {
    expect(open([req, grant('q1', 'g1')])).toEqual([]);
    expect(open([req, grant('q1', 'g1'), retract('g1', 'x1')])).toEqual(['q1']);
    expect(open([req, grant('q1', 'g1'), retract('g1', 'x1'), retract('x1', 'x2')])).toEqual(['q1']);
    expect(open([req, retract('q1', 'x1')])).toEqual([]);
  });

  test('buildQueue: a retracted grant brings the proposal card back; a RETRACT of that RETRACT changes nothing', () => {
    expect(cards([prop, grant('vp1', 'g1')])).toEqual([]);
    expect(cards([prop, grant('vp1', 'g1'), retract('g1', 'x1')])).toEqual(['vp1']);
    expect(cards([prop, grant('vp1', 'g1'), retract('g1', 'x1'), retract('x1', 'x2')])).toEqual(['vp1']);
  });
});
