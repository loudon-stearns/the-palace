// live-answers.test.mjs — the one rule every board reader folds answers by.
//
// SCHEMA — Reference §9, the RETRACT row: a retracted RESOURCE_GRANT or
// RESOURCE_DENY answers nothing, so its ask is waiting again; a retracted
// RESOURCE_REQUEST is no ask; a RETRACT naming a RETRACT changes nothing.
//
// Run:  node --test _ops/stigmergy/tests/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ANSWER_TYPES, isAnswer, retractedIds, isWithdrawn, askKey, liveAnswers, liveAnswerFor, readAnswers,
} from '../live-answers.mjs';

const ask = (id, extra = {}) => ({ id, request_id: id, type: 'RESOURCE_REQUEST', board: 'TRICKSTER', from: 'Steward', payload: { options: ['a', 'b'] }, ...extra });
const grant = (re, id = `grant-${re}`, option_id = 'a') => ({ id, type: 'RESOURCE_GRANT', board: 'TRICKSTER', from: 'TRICKSTER', re, payload: { option_id } });
const deny = (re, id = `deny-${re}`) => ({ id, type: 'RESOURCE_DENY', board: 'TRICKSTER', from: 'TRICKSTER', re, payload: {} });
const retract = (re, id = `retract-${re}`) => ({ id, type: 'RETRACT', board: 'GENERAL', from: 'X', re, payload: { reason: 'posted in error' } });

test('the answer types are the grant and the deny, and an answer must name what it answers', () => {
  assert.deepEqual([...ANSWER_TYPES], ['RESOURCE_GRANT', 'RESOURCE_DENY']);
  assert.equal(isAnswer(grant('q')), true);
  assert.equal(isAnswer(deny('q')), true);
  assert.equal(isAnswer({ ...grant('q'), re: '' }), false);
  assert.equal(isAnswer({ type: 'REPLY', re: 'q' }), false);
  assert.equal(isAnswer(null), false);
});

test('a grant answers its ask', () => {
  const r = readAnswers([ask('q'), grant('q')]);
  assert.equal(r.answerFor(ask('q')).id, 'grant-q');
});

test('grant, then a RETRACT of the grant: the ask reads as open', () => {
  const board = [ask('q'), grant('q'), retract('grant-q')];
  const r = readAnswers(board);
  assert.equal(r.answerFor(ask('q')), null);
  assert.equal(r.withdrawn(board[0]), false);
  assert.ok(r.retracted.has('grant-q'));
});

test('a retracted deny answers nothing either', () => {
  const r = readAnswers([ask('q'), deny('q'), retract('deny-q')]);
  assert.equal(r.answerFor(ask('q')), null);
});

test('a RETRACT of a RETRACT changes nothing: the first retraction stands', () => {
  const board = [ask('q'), grant('q'), retract('grant-q', 'r1'), retract('r1', 'r2')];
  const r = readAnswers(board);
  assert.equal(r.answerFor(ask('q')), null);
  assert.equal(r.retracted.has('r1'), false, 'a RETRACT id is never in the withdrawn set');
  assert.equal(r.withdrawn(board[2]), false);
});

test('a retracted request is withdrawn, by its id or by its request_id', () => {
  const retracted = retractedIds([retract('q')]);
  assert.equal(isWithdrawn(ask('q'), retracted), true);
  const byRid = retractedIds([retract('rid-1')]);
  assert.equal(isWithdrawn(ask('msg-1', { request_id: 'rid-1' }), byRid), true);
  // request_id is honoured for a request only
  assert.equal(isWithdrawn({ id: 'b-1', type: 'BROADCAST', request_id: 'rid-1' }, byRid), false);
});

test('a later live answer stands after an earlier one is retracted', () => {
  const r = readAnswers([ask('q'), grant('q', 'g1'), retract('g1'), deny('q', 'd2')]);
  assert.equal(r.answerFor(ask('q')).id, 'd2');
});

test('the tie: the last live answer wins by default, the first with pick: first', () => {
  const board = [ask('q'), grant('q', 'g1', 'a'), grant('q', 'g2', 'b'), deny('q', 'd3')];
  assert.equal(liveAnswerFor(ask('q'), liveAnswers(board)).id, 'd3');
  assert.equal(liveAnswerFor(ask('q'), liveAnswers(board, { pick: 'first' })).id, 'g1');
  // first-wins still skips a retracted answer
  const withRetract = [...board, retract('g1')];
  assert.equal(liveAnswerFor(ask('q'), liveAnswers(withRetract, { pick: 'first' })).id, 'g2');
  assert.equal(liveAnswerFor(ask('q'), liveAnswers(withRetract)).id, 'd3');
});

test('the key: request_id if present, else id; an answer by the message id is accepted too', () => {
  assert.equal(askKey(ask('q')), 'q');
  assert.equal(askKey({ id: 'm1', type: 'RESOURCE_REQUEST' }), 'm1');
  assert.equal(askKey({ id: 'm1', request_id: 'r1', type: 'RESOURCE_REQUEST' }), 'r1');
  assert.equal(askKey({ type: 'RESOURCE_REQUEST' }), null);
  const twoNames = { id: 'm1', request_id: 'r1', type: 'RESOURCE_REQUEST' };
  assert.equal(liveAnswerFor(twoNames, liveAnswers([twoNames, grant('m1')])).id, 'grant-m1');
  // both named: the request_id's answer is the one
  assert.equal(liveAnswerFor(twoNames, liveAnswers([twoNames, grant('r1'), grant('m1')])).id, 'grant-r1');
});

test('the RETRACT counts whichever board it is on, and a bad board reads as empty', () => {
  const r = readAnswers([ask('q'), grant('q'), { ...retract('grant-q'), board: 'SYSTEM' }]);
  assert.equal(r.answerFor(ask('q')), null);
  assert.equal(retractedIds(null).size, 0);
  assert.equal(liveAnswers(undefined).size, 0);
  assert.equal(liveAnswerFor(null, new Map()), null);
});
