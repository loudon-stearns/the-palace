import { describe, test, expect } from 'vitest';
import { reconcilePendingRequests } from '../../src/process-cycle.js';
import { adoptedPlanRevisions, applyAdoptedPlans, ensurePlanZone, readPlan } from '../../src/scroll-file.js';
import { urgentAnswer } from '../../src/ledger-review.js';

// The orchestrator's readers of answers honour a RETRACT (SCHEMA — Reference §9;
// ../../../live-answers.mjs): a retracted grant or deny answers nothing, so its
// ask is waiting again; a retracted request is no ask; a RETRACT naming a
// RETRACT changes nothing.

const HOME = 'Shep';
const ask = (id, payload = {}) => ({ id, request_id: id, ts: '2026-11-01T09:00:00Z', from: HOME, to: 'TRICKSTER', type: 'RESOURCE_REQUEST', board: 'TRICKSTER', payload: { resource: 'fork', options: ['a', 'b'], ...payload } });
const grant = (re, id, option_id = 'a', ts = '2026-11-02T09:00:00Z') => ({ id, ts, from: 'TRICKSTER', to: HOME, type: 'RESOURCE_GRANT', board: 'TRICKSTER', re, payload: { option_id } });
const deny = (re, id, ts = '2026-11-02T09:00:00Z') => ({ id, ts, from: 'TRICKSTER', to: HOME, type: 'RESOURCE_DENY', board: 'TRICKSTER', re, payload: { notes: 'no' } });
const retract = (re, id) => ({ id, ts: '2026-11-03T09:00:00Z', from: 'TRICKSTER', to: '*', type: 'RETRACT', board: 'TRICKSTER', re, payload: { reason: 'posted in error' } });
const ids = (rows) => rows.map((r) => r.request_id);

describe('reconcilePendingRequests', () => {
  test('grant, then a RETRACT of the grant: the ask is pending again', () => {
    const board = [ask('q1'), grant('q1', 'g1'), retract('g1', 'r1')];
    const { stillPending, nowResolved } = reconcilePendingRequests(board, HOME);
    expect(ids(stillPending)).toEqual(['q1']);
    expect(nowResolved).toEqual([]);
  });

  test('a RETRACT of the RETRACT changes nothing: the ask stays pending', () => {
    const board = [ask('q1'), grant('q1', 'g1'), retract('g1', 'r1'), retract('r1', 'r2')];
    expect(ids(reconcilePendingRequests(board, HOME).stillPending)).toEqual(['q1']);
  });

  test('a later live answer resolves it, and a retracted request is in neither list', () => {
    const board = [ask('q1'), grant('q1', 'g1'), retract('g1', 'r1'), deny('q1', 'd2', '2026-11-04T09:00:00Z'), ask('q2'), retract('q2', 'r3')];
    const { stillPending, nowResolved } = reconcilePendingRequests(board, HOME);
    expect(stillPending).toEqual([]);
    expect(nowResolved.map((r) => [r.request_id, r.resolved_by])).toEqual([['q1', 'd2']]);
    expect(nowResolved[0].outcome).toMatch(/^DENIED/);
  });

  test('with no RETRACT the last answer still wins, as before', () => {
    const board = [ask('q1'), grant('q1', 'g1', 'a'), grant('q1', 'g2', 'b', '2026-11-05T09:00:00Z')];
    expect(reconcilePendingRequests(board, HOME).nowResolved[0].resolved_by).toBe('g2');
  });
});

describe('adoptedPlanRevisions', () => {
  const PLAN_ASK = ask('shep-010', { kind: 'plan_revision', decision_topic: 'glide first', plan: 'Go up, gliding.', options: [{ id: 'adopt' }, { id: 'keep' }] });
  const adopt = grant('shep-010', 'g-adopt', 'adopt');

  test('an adopt grant later retracted adopts nothing', () => {
    expect(adoptedPlanRevisions([PLAN_ASK, adopt], HOME).map((r) => r.request_id)).toEqual(['shep-010']);
    expect(adoptedPlanRevisions([PLAN_ASK, adopt, retract('g-adopt', 'r1')], HOME)).toEqual([]);
  });

  test('a RETRACT of that RETRACT changes nothing; a retracted ask adopts nothing', () => {
    expect(adoptedPlanRevisions([PLAN_ASK, adopt, retract('g-adopt', 'r1'), retract('r1', 'r2')], HOME)).toEqual([]);
    expect(adoptedPlanRevisions([PLAN_ASK, adopt, retract('shep-010', 'r3')], HOME)).toEqual([]);
  });

  test('a plan already applied stays on the scroll when its grant is retracted: nothing un-applies', () => {
    const scroll = ensurePlanZone('# Shep — scroll\n\n<!-- scroll:now:start -->\n<!-- scroll:now:end -->\n\n## Making\n\n<!-- scroll:making:start -->\n<!-- scroll:making:end -->\n');
    const first = applyAdoptedPlans(scroll, [PLAN_ASK, adopt], HOME);
    expect(first.applied).toEqual(['shep-010']);
    expect(readPlan(first.text)).toBe('Go up, gliding.');
    const after = applyAdoptedPlans(first.text, [PLAN_ASK, adopt, retract('g-adopt', 'r1')], HOME);
    expect(after.applied).toEqual([]);
    expect(after.text).toBe(first.text);
    // and the ask reads as waiting again
    expect(ids(reconcilePendingRequests([PLAN_ASK, adopt, retract('g-adopt', 'r1')], HOME).stillPending)).toEqual(['shep-010']);
  });
});

describe('urgentAnswer', () => {
  const item = { urgent: true, ask: 'urgent-1' };
  const placeNow = grant('urgent-1', 'g1', 'PLACE-NOW');

  test('a PLACE-NOW later retracted is no answer: the item stays owed with the rest', () => {
    expect(urgentAnswer(item, [placeNow])).toMatchObject({ option: 'PLACE-NOW', id: 'g1' });
    expect(urgentAnswer(item, [placeNow, retract('g1', 'r1')])).toBe(null);
  });

  test('a RETRACT of that RETRACT changes nothing; an earlier live answer stands', () => {
    expect(urgentAnswer(item, [placeNow, retract('g1', 'r1'), retract('r1', 'r2')])).toBe(null);
    const review = grant('urgent-1', 'g0', 'REVIEW', '2026-11-01T10:00:00Z');
    expect(urgentAnswer(item, [review, placeNow, retract('g1', 'r1')])).toMatchObject({ option: 'REVIEW', id: 'g0' });
  });

  test('a retracted deny no longer declines', () => {
    expect(urgentAnswer(item, [deny('urgent-1', 'd1'), retract('d1', 'r1')])).toBe(null);
  });
});
