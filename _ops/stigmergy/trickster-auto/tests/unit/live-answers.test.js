import { describe, it, expect } from 'vitest';
import { buildInbox } from '../../src/inbox.js';
import { scoreBoard } from '../../src/retro.js';
import { loadRuleset } from '../../src/ruleset.js';

// A RETRACT withdraws (SCHEMA — Reference §9; the rule is ../../../live-answers.mjs,
// shared with the deck): a retracted grant or deny answers nothing, so its ask
// is pending again; a retracted request is no ask; a RETRACT naming a RETRACT
// changes nothing.

const fork = (id, recId = 'A', optionIds = ['A', 'B']) => ({
  id, type: 'RESOURCE_REQUEST', request_id: id, from: `Steward ${id}`, board: 'TRICKSTER',
  payload: {
    resource: 'directional_decision', blocking: false,
    steward_recommendation: `${recId} — because reasons`,
    options: optionIds.map((o) => ({ id: o, label: `${o} — label` })),
  },
});
const grant = (re, id, optionId = 'A') => ({ id, type: 'RESOURCE_GRANT', from: 'TRICKSTER', board: 'TRICKSTER', re, payload: { granted: true, option_id: optionId } });
const deny = (re, id) => ({ id, type: 'RESOURCE_DENY', from: 'TRICKSTER', board: 'TRICKSTER', re, payload: { granted: false } });
const retract = (re, id) => ({ id, type: 'RETRACT', from: 'TRICKSTER', board: 'TRICKSTER', re, payload: { reason: 'posted in error' } });
const pendingIds = (board) => buildInbox(board).pending.map((r) => r.request_id);

describe('buildInbox and RETRACT', () => {
  it('grant, then a RETRACT of the grant: the ask is pending again', () => {
    expect(pendingIds([fork('r1'), grant('r1', 'g1')])).toEqual([]);
    const inbox = buildInbox([fork('r1'), grant('r1', 'g1'), retract('g1', 'x1')]);
    expect(inbox.pending.map((r) => r.request_id)).toEqual(['r1']);
    expect(inbox.answeredIds.has('r1')).toBe(false);
    expect(inbox.counts).toMatchObject({ requests: 1, answered: 0, pending: 1 });
  });

  it('a RETRACT of the RETRACT changes nothing', () => {
    expect(pendingIds([fork('r1'), grant('r1', 'g1'), retract('g1', 'x1'), retract('x1', 'x2')])).toEqual(['r1']);
  });

  it('a retracted request is no ask: neither pending nor unanswerable', () => {
    const inbox = buildInbox([fork('r1'), retract('r1', 'x1')]);
    expect(inbox.pending).toEqual([]);
    expect(inbox.unanswerable).toEqual([]);
    expect(inbox.counts.requests).toBe(0);
  });
});

describe('scoreBoard and RETRACT', () => {
  const ruleset = loadRuleset();
  const rule = (report) => report.rules.find((r) => r.ruleId === 'grant-nonblocking-recommended-fork');

  it('a retracted human answer is not scored as his decision', () => {
    expect(rule(scoreBoard([fork('r1'), deny('r1', 'd1')], ruleset)).dangerous).toBe(1);
    const report = scoreBoard([fork('r1'), deny('r1', 'd1'), retract('d1', 'x1')], ruleset);
    expect(report.decided).toBe(0);
    expect(rule(report).dangerous).toBe(0);
  });

  it('a RETRACT of the RETRACT changes nothing; a later live answer is scored', () => {
    expect(scoreBoard([fork('r1'), deny('r1', 'd1'), retract('d1', 'x1'), retract('x1', 'x2')], ruleset).decided).toBe(0);
    const report = scoreBoard([fork('r1'), deny('r1', 'd1'), retract('d1', 'x1'), grant('r1', 'g2', 'A')], ruleset);
    expect(rule(report)).toMatchObject({ decided: 1, exactOption: 1, dangerous: 0 });
  });

  it('a retracted request is not replayed', () => {
    expect(scoreBoard([fork('r1'), retract('r1', 'x1')], ruleset).total).toBe(0);
  });
});
