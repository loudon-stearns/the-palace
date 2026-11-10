import { describe, test, expect } from 'vitest';
import { reconcilePendingRequests } from '../../src/process-cycle.js';
import { adoptedPlanRevisions, applyAdoptedPlans, ensurePlanZone, readPlan, readPlanInfo, applyPlan, withdrawnAdoption, computeNow, renderNow } from '../../src/scroll-file.js';
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

describe('Now says when the plan on the scroll was adopted by an answer since withdrawn', () => {
  const PLAN_ASK = ask('shep-010', { kind: 'plan_revision', decision_topic: 'glide first', plan: 'Go up, gliding.', options: [{ id: 'adopt' }, { id: 'keep' }] });
  const adopt = grant('shep-010', 'g-adopt', 'adopt');
  const SCROLL = ensurePlanZone('# Shep — scroll\n\n<!-- scroll:now:start -->\n<!-- scroll:now:end -->\n\n## Making\n\n<!-- scroll:making:start -->\n<!-- scroll:making:end -->\n');
  const CLAUSE = '**the plan here was adopted by an answer that has since been withdrawn**';
  const adopted = applyAdoptedPlans(SCROLL, [PLAN_ASK, adopt], HOME).text;
  const planLineOf = (text, board) => renderNow(computeNow({ home: HOME, board, state: null, tsNow: '2026-11-10T00:00:00Z', plan: readPlanInfo(text) }), { home: HOME })
    .split('\n').find((l) => l.startsWith('- **Plan:**'));

  test('with no RETRACT the line is as it was', () => {
    expect(withdrawnAdoption([PLAN_ASK, adopt], HOME, readPlanInfo(adopted).id)).toBe(null);
    expect(planLineOf(adopted, [PLAN_ASK, adopt])).toBe('- **Plan:** agreed 2026-11-02 (8 days ago) · 0 made things since');
  });

  test('the adopt grant retracted: Now says so, beside the waiting ask, and the plan stays', () => {
    const board = [PLAN_ASK, adopt, retract('g-adopt', 'r1')];
    expect(readPlanInfo(adopted).id).toBe('plan-shep-010');
    expect(withdrawnAdoption(board, HOME, 'plan-shep-010')).toBe('shep-010');
    expect(planLineOf(adopted, board)).toBe(`- **Plan:** agreed 2026-11-02 (8 days ago) · 0 made things since · ${CLAUSE} · **a proposed revision is waiting on you**`);
    expect(readPlan(applyAdoptedPlans(adopted, board, HOME).text)).toBe('Go up, gliding.');
  });

  test('a RETRACT of that RETRACT changes nothing; a later live answer settles it', () => {
    expect(withdrawnAdoption([PLAN_ASK, adopt, retract('g-adopt', 'r1'), retract('r1', 'r2')], HOME, 'plan-shep-010')).toBe('shep-010');
    expect(withdrawnAdoption([PLAN_ASK, adopt, retract('g-adopt', 'r1'), grant('shep-010', 'g2', 'adopt', '2026-11-04T09:00:00Z')], HOME, 'plan-shep-010')).toBe(null);
  });

  test('the adopt retracted, then denied or answered keep: the plan here is still not adopted, and Now says so with nothing waiting', () => {
    const denied = [PLAN_ASK, adopt, retract('g-adopt', 'r1'), deny('shep-010', 'd1', '2026-11-04T09:00:00Z')];
    expect(withdrawnAdoption(denied, HOME, 'plan-shep-010')).toBe('shep-010');
    expect(planLineOf(adopted, denied)).toBe(`- **Plan:** agreed 2026-11-02 (8 days ago) · 0 made things since · ${CLAUSE}`);
    const kept = [PLAN_ASK, adopt, retract('g-adopt', 'r1'), grant('shep-010', 'g-keep', 'keep', '2026-11-04T09:00:00Z')];
    expect(withdrawnAdoption(kept, HOME, 'plan-shep-010')).toBe('shep-010');
  });

  test('only the plan on the scroll counts: a later plan written over it, or a retracted grant that was not adopt, says nothing', () => {
    const board = [PLAN_ASK, adopt, retract('g-adopt', 'r1')];
    const over = applyPlan(adopted, { plan: 'Go down.', headline: 'by hand', ts: '2026-11-05T09:00:00' }).text;
    expect(readPlanInfo(over).id).not.toBe('plan-shep-010');
    expect(withdrawnAdoption(board, HOME, readPlanInfo(over).id)).toBe(null);
    expect(planLineOf(over, board)).not.toContain(CLAUSE);
    const keep = grant('shep-010', 'g-keep', 'keep');
    expect(withdrawnAdoption([PLAN_ASK, keep, retract('g-keep', 'r1')], HOME, 'plan-shep-010')).toBe(null);
  });

  test('a retracted ask, or another page\'s ask, is not read this way', () => {
    expect(withdrawnAdoption([PLAN_ASK, adopt, retract('g-adopt', 'r1'), retract('shep-010', 'r3')], HOME, 'plan-shep-010')).toBe(null);
    expect(withdrawnAdoption([PLAN_ASK, adopt, retract('g-adopt', 'r1')], 'Other', 'plan-shep-010')).toBe(null);
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
