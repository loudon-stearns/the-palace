import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildInbox } from '../../src/inbox.js';
import { scoreBoard } from '../../src/retro.js';
import { loadRuleset } from '../../src/ruleset.js';
import { evaluateAll } from '../../src/evaluate.js';
import { buildDigest, renderDigestMarkdown } from '../../src/digest.js';
import { runCycle } from '../../src/cli.js';

// A RETRACT withdraws (SCHEMA — Reference §9; the rule is ../../../live-answers.mjs,
// shared with the deck): a retracted grant or deny answers nothing; a retracted
// request is no ask; a RETRACT naming a RETRACT changes nothing. An ask whose
// answer was withdrawn goes back to Loudon only (Loudon, 2026-11-10): it is in
// `returned`, never in `pending`, so the engine leaves it alone.

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

const returnedIds = (board) => buildInbox(board).returned.map((r) => r.request_id);

describe('buildInbox and RETRACT', () => {
  it('with no RETRACT nothing is returned: an open ask is pending, an answered one is not', () => {
    const inbox = buildInbox([fork('r1'), fork('r2'), grant('r1', 'g1')]);
    expect(inbox.pending.map((r) => r.request_id)).toEqual(['r2']);
    expect(inbox.returned).toEqual([]);
    expect(inbox.counts).toEqual({ requests: 2, answered: 1, pending: 1, returned: 0, unanswerable: 0 });
  });

  it('grant, then a RETRACT of the grant: the ask goes back to Loudon, not to pending', () => {
    expect(pendingIds([fork('r1'), grant('r1', 'g1')])).toEqual([]);
    const inbox = buildInbox([fork('r1'), grant('r1', 'g1'), retract('g1', 'x1')]);
    expect(inbox.pending).toEqual([]);
    expect(inbox.returned.map((r) => r.request_id)).toEqual(['r1']);
    expect(inbox.answeredIds.has('r1')).toBe(false);
    expect(inbox.counts).toEqual({ requests: 1, answered: 0, pending: 0, returned: 1, unanswerable: 0 });
  });

  it('a retracted deny returns the ask the same way', () => {
    expect(returnedIds([fork('r1'), deny('r1', 'd1'), retract('d1', 'x1')])).toEqual(['r1']);
  });

  it('whoever answered and whoever retracted: an auto answer retracted by the engine\'s own name is returned too', () => {
    const autoGrant = { ...grant('r1', 'auto-resp-r1'), from: 'TRICKSTER (auto)', payload: { granted: true, option_id: 'A', decided_by: 'auto' } };
    const autoRetract = { ...retract('auto-resp-r1', 'x1'), from: 'Some Steward' };
    expect(returnedIds([fork('r1'), autoGrant, autoRetract])).toEqual(['r1']);
    expect(pendingIds([fork('r1'), autoGrant, autoRetract])).toEqual([]);
  });

  it('an ask answered by its message id, whose answer is withdrawn, is returned', () => {
    const ask = { ...fork('m1'), request_id: undefined };
    expect(returnedIds([ask, grant('m1', 'g1'), retract('g1', 'x1')])).toEqual(['m1']);
  });

  it('a later live answer settles a returned ask', () => {
    const inbox = buildInbox([fork('r1'), grant('r1', 'g1'), retract('g1', 'x1'), deny('r1', 'd2')]);
    expect(inbox.pending).toEqual([]);
    expect(inbox.returned).toEqual([]);
    expect(inbox.counts).toMatchObject({ answered: 1, returned: 0 });
  });

  it('a RETRACT of the RETRACT changes nothing: the ask stays returned', () => {
    expect(returnedIds([fork('r1'), grant('r1', 'g1'), retract('g1', 'x1'), retract('x1', 'x2')])).toEqual(['r1']);
  });

  it('a retracted request is no ask: neither pending nor unanswerable', () => {
    const inbox = buildInbox([fork('r1'), retract('r1', 'x1')]);
    expect(inbox.pending).toEqual([]);
    expect(inbox.unanswerable).toEqual([]);
    expect(inbox.counts.requests).toBe(0);
  });
});

describe('the digest and the runner name a returned ask, and never answer it', () => {
  const ruleset = loadRuleset();
  // r1 would auto-grant (a non-blocking recommended fork); its grant was withdrawn.
  const board = [fork('r1'), grant('r1', 'g1'), retract('g1', 'x1'), fork('r2')];

  it('buildDigest counts and lists it apart from pending; the markdown names it', () => {
    const { pending, returned } = buildInbox(board);
    const digest = buildDigest(evaluateAll(pending, ruleset), { generatedAt: 'T', returned });
    expect(digest.counts).toMatchObject({ pending: 1, returned: 1 });
    expect(digest.returned.map((r) => r.request_id)).toEqual(['r1']);
    expect(digest.auto_decisions.map((d) => d.request_id)).not.toContain('r1');
    const md = renderDigestMarkdown(digest);
    expect(md).toContain('## Back with you — 1 answer was withdrawn');
    expect(md).toContain('`r1`');
  });

  it('with none returned the markdown is as it was', () => {
    const { pending } = buildInbox([fork('r2')]);
    const before = buildDigest(evaluateAll(pending, ruleset), { generatedAt: 'T' });
    const after = buildDigest(evaluateAll(pending, ruleset), { generatedAt: 'T', returned: [] });
    expect(renderDigestMarkdown(after)).toBe(renderDigestMarkdown(before));
    expect(renderDigestMarkdown(after)).not.toContain('Back with you');
    expect(after.counts.returned).toBe(0);
  });

  it('runCycle --live on a temp board posts for the pending ask only, and hands back the returned one', () => {
    const dir = mkdtempSync(join(tmpdir(), 'trickster-auto-returned-'));
    const path = join(dir, 'board.jsonl');
    writeFileSync(path, board.map((m) => JSON.stringify(m)).join('\n') + '\n', 'utf8');
    const out = runCycle({ boardPath: path, mode: 'live', now: '2026-11-10T12:00:00Z', budgetStatePath: join(dir, 'budget.json') });
    expect(out.returned.map((r) => r.request_id)).toEqual(['r1']);
    expect(out.posted.map((m) => m.re)).not.toContain('r1');
    const written = readFileSync(path, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    expect(written.filter((m) => m.re === 'r1' && m.type !== 'RETRACT').map((m) => m.id)).toEqual(['g1']);
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
