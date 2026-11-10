// handoff-retract-answer.test.mjs — a RETRACT that names a close or a claim
// withdraws that event, and the card falls back a state.
//
// Loudon, 2026-11-10: "retracting an answer should reopen a card." A retracted
// handoff_closed leaves the card claimed (or open, with no live claim); a
// retracted claim leaves it open. A retracted partial close does not withdraw
// the remainder it posted. A RETRACT of a RETRACT does nothing. The deck's fold,
// app/src/lib/queue-model.js buildQueue, reads the board the same way.
//
// Run:  node --test _ops/stigmergy/tests/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { foldHandoffs, resolveCard } from '../handoff-model.mjs';

const ready = (id, extra = {}) => ({ id, type: 'BROADCAST', payload: { kind: 'handoff_ready', entry: 'STIGMERGY', move: 'm', ...extra } });
const claim = (re, id = `claim-${re}`) => ({ id, type: 'REPLY', re, payload: { kind: 'handoff_picked_up', lifecycle: 'claim', handoff_id: re } });
const legacy = (re, id = `pickup-${re}`) => ({ id, type: 'REPLY', re, payload: { kind: 'handoff_picked_up', handoff_id: re } });
const close = (re, id = `close-${re}`, extra = {}) => ({ id, type: 'REPLY', re, payload: { kind: 'handoff_closed', handoff_id: re, ...extra } });
const retract = (re, id = `retract-${re}`) => ({ id, type: 'RETRACT', re, payload: { kind: 'retract', reason: 'posted in error' } });
const states = (fold) => fold.all.map((c) => `${c.m.id}:${c.state}`).sort();

test('a retracted close leaves the card claimed when its claim stands', () => {
  const fold = foldHandoffs([ready('a'), claim('a'), close('a'), retract('close-a')]);
  assert.deepEqual(states(fold), ['a:claimed']);
  assert.equal(fold.claimed[0].claim.id, 'claim-a');
  assert.equal(fold.claimed[0].close, null);
});

test('a retracted close with no claim leaves the card open', () => {
  const fold = foldHandoffs([ready('a'), close('a'), retract('close-a')]);
  assert.deepEqual(states(fold), ['a:open']);
});

test('a retracted claim leaves the card open; retracting both close and claim, open', () => {
  assert.deepEqual(states(foldHandoffs([ready('a'), claim('a'), retract('claim-a')])), ['a:open']);
  const fold = foldHandoffs([ready('a'), claim('a'), close('a'), retract('close-a'), retract('claim-a')]);
  assert.deepEqual(states(fold), ['a:open']);
});

test('a retracted claim with the close standing: still closed', () => {
  assert.deepEqual(states(foldHandoffs([ready('a'), claim('a'), close('a'), retract('claim-a')])), ['a:closed']);
});

test('a retracted legacy pickup no longer grandfathers the card closed', () => {
  assert.deepEqual(states(foldHandoffs([ready('a'), legacy('a')])), ['a:closed']);
  assert.deepEqual(states(foldHandoffs([ready('a'), legacy('a'), retract('pickup-a')])), ['a:open']);
});

test('with two closes, retracting one leaves the card closed by the other', () => {
  const fold = foldHandoffs([ready('a'), close('a', 'c1'), close('a', 'c2'), retract('c1')]);
  assert.deepEqual(states(fold), ['a:closed']);
  assert.equal(fold.closed[0].close.id, 'c2');
});

test('retracting a partial close reopens the original; its remainder stands until retracted by name', () => {
  const lines = [ready('a'), claim('a'), ready('a-rest'), close('a', 'close-a', { completion: 'partial', remainder_handoff_id: 'a-rest' }), retract('close-a')];
  assert.deepEqual(states(foldHandoffs(lines)), ['a-rest:open', 'a:claimed']);
  assert.deepEqual(states(foldHandoffs([...lines, retract('a-rest')])), ['a-rest:retracted', 'a:claimed']);
});

test('a reopened card resolves as active again, so pickup and close can find it', () => {
  const fold = foldHandoffs([ready('a'), claim('a'), close('a'), retract('close-a')]);
  assert.equal(resolveCard(fold, 'a').card.m.id, 'a');
});

test('a retraction of a retraction does nothing: the first stands', () => {
  const fold = foldHandoffs([ready('a'), close('a'), retract('close-a', 'r1'), retract('r1', 'r2')]);
  assert.deepEqual(states(fold), ['a:open']);
  const withdrawn = foldHandoffs([ready('a'), retract('a', 'r1'), retract('r1', 'r2')]);
  assert.deepEqual(states(withdrawn), ['a:retracted']);
});
