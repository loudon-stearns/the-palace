// handoff-retract.test.mjs — a RETRACT withdraws a handoff_ready.
//
// SCHEMA — Reference §9: RETRACT withdraws a message posted in error or no longer
// true, by adding a line, never editing one. The fold reads it: a ready whose id
// is a RETRACT's `re` is shown nowhere and resolves like a closed card, and the
// card that replaces it (posted first, so the move is never off the board) is open.
//
// Run:  node --test _ops/stigmergy/tests/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { foldHandoffs, resolveCard } from '../handoff-model.mjs';

const ready = (id, extra = {}) => ({ id, type: 'BROADCAST', payload: { kind: 'handoff_ready', entry: 'STIGMERGY', move: 'm', ...extra } });
const claim = (re) => ({ id: `claim-${re}`, type: 'REPLY', re, payload: { kind: 'handoff_picked_up', lifecycle: 'claim', handoff_id: re } });
const retract = (re, superseded_by) => ({ id: `retract-${re}`, type: 'RETRACT', re, payload: { kind: 'retract', reason: 'stale', superseded_by } });

test('a retracted ready leaves open and claimed, and its repost is open', () => {
  const fold = foldHandoffs([ready('old', { worktree: { dir: '/gone' } }), ready('new'), retract('old', 'new')]);
  assert.deepEqual(fold.open.map((c) => c.m.id), ['new']);
  assert.deepEqual(fold.retracted.map((c) => c.m.id), ['old']);
  assert.equal(fold.claimed.length, 0);
});

test('a RETRACT outranks a claim: a withdrawn card is not in flight', () => {
  const fold = foldHandoffs([ready('old'), claim('old'), retract('old', 'new'), ready('new')]);
  assert.equal(fold.claimed.length, 0);
  assert.equal(fold.retracted[0].close.type, 'RETRACT');
});

test('resolveCard answers a retracted id like a closed one, naming its replacement', () => {
  const fold = foldHandoffs([ready('old'), ready('new'), retract('old', 'new')]);
  const res = resolveCard(fold, 'old');
  assert.ok(res.closed);
  assert.equal(res.closed.state, 'retracted');
  assert.equal(res.closed.close.payload.superseded_by, 'new');
  assert.equal(resolveCard(fold, 'STIGMERGY').card.m.id, 'new'); // the entry name finds the live card only
});

test('a RETRACT naming some other message touches no card', () => {
  const fold = foldHandoffs([ready('a'), retract('not-a-handoff')]);
  assert.deepEqual(fold.open.map((c) => c.m.id), ['a']);
  assert.equal(fold.retracted.length, 0);
});
