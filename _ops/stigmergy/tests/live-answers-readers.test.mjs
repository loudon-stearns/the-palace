// live-answers-readers.test.mjs — the readers outside the packages' own suites
// honour a RETRACT the way the deck does (SCHEMA — Reference §9; the rule is
// ../live-answers.mjs): the Return map's "blocked on Loudon" probe, the review
// fold read-answers.mjs and the app's review-notes.js run, and the handoff
// fold. A retracted grant or deny answers nothing, so its ask is waiting again;
// a retracted request is no ask; a RETRACT naming a RETRACT changes nothing.
// Every board here is a scratch file, byte-for-byte the same after.
//
// Run:  node --test _ops/stigmergy/tests/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildReviewMessage } from '../../rich-face/rich-handler.mjs';
import { openReviews, reviewMessages } from '../../loudon-eval/read-answers.mjs';
import { openReviewNotes, BOARD_REL } from '../app/src/lib/review-notes.js';
import { foldHandoffs } from '../handoff-model.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const RETURN_MAP = resolve(HERE, '../../concierge/return-map.mjs');
const ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));

const env = (extra) => ({ schema_version: '1.0', session_id: 's', health: { score: 'green', model: 'x' }, ...extra });
const ask = (id, ts) => env({ id, request_id: id, ts, from: 'Shep', to: 'TRICKSTER', type: 'RESOURCE_REQUEST', board: 'TRICKSTER', payload: { question: `ask ${id}`, blocking: true, options: ['a', 'b'] } });
const grant = (re, id, ts) => env({ id, ts, from: 'TRICKSTER', to: 'Shep', type: 'RESOURCE_GRANT', board: 'TRICKSTER', re, payload: { option_id: 'a' } });
const retract = (re, id, ts) => env({ id, ts, from: 'TRICKSTER', to: '*', type: 'RETRACT', board: 'TRICKSTER', re, payload: { reason: 'posted in error' } });
const dock = (id, ts, entry, round, note) => ({
  ...buildReviewMessage({ task: `rich-face:${entry}:round-${round}`, groups: { Core: { note } }, overall: { round } }), id, ts,
});

function scratch(lines) {
  const dir = mkdtempSync(join(tmpdir(), 'live-answers-readers-'));
  const board = join(dir, 'blackboard.jsonl');
  writeFileSync(board, lines.map((m) => JSON.stringify(m)).join('\n') + '\n');
  return { dir, board };
}

function blockedIds(board) {
  const data = JSON.parse(execFileSync(process.execPath, [RETURN_MAP, '--json', '--since', '1h'], { env: { ...ENV, STIGMERGY_BOARD: board }, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
  assert.equal(data.inFlight.blocked.ok, true);
  return data.inFlight.blocked.waiting.map((w) => w.id).sort();
}

test('the Return map: a retracted grant leaves its ask waiting; a RETRACT of that RETRACT changes nothing; a retracted ask is not waiting', () => {
  const { dir, board } = scratch([
    ask('q-open', '2026-11-01T09:00:00Z'),
    ask('q-answered', '2026-11-01T09:00:00Z'), grant('q-answered', 'g-a', '2026-11-01T10:00:00Z'),
    ask('q-reopened', '2026-11-01T09:00:00Z'), grant('q-reopened', 'g-r', '2026-11-01T10:00:00Z'), retract('g-r', 'x1', '2026-11-01T11:00:00Z'),
    ask('q-twice', '2026-11-01T09:00:00Z'), grant('q-twice', 'g-t', '2026-11-01T10:00:00Z'), retract('g-t', 'x2', '2026-11-01T11:00:00Z'), retract('x2', 'x3', '2026-11-01T12:00:00Z'),
    ask('q-withdrawn', '2026-11-01T09:00:00Z'), retract('q-withdrawn', 'x4', '2026-11-01T11:00:00Z'),
  ]);
  try {
    const before = readFileSync(board, 'utf8');
    assert.deepEqual(blockedIds(board), ['q-open', 'q-reopened', 'q-twice']);
    assert.equal(readFileSync(board, 'utf8'), before);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('the Return map keys an ask the deck\'s way: answered by its request_id or by its message id; with no RETRACT, as before', () => {
  // An ask whose request_id differs from its message id, answered by the request_id:
  // the old probe keyed asks by message id alone and showed this one as waiting.
  const split = { ...ask('msg-7', '2026-11-01T09:00:00Z'), request_id: 'req-7' };
  // An ask with no request_id, answered by its message id.
  const bare = { ...ask('msg-8', '2026-11-01T09:00:00Z') }; delete bare.request_id;
  const { dir, board } = scratch([
    split, grant('req-7', 'g-7', '2026-11-01T10:00:00Z'),
    bare, grant('msg-8', 'g-8', '2026-11-01T10:00:00Z'),
    ask('q-open', '2026-11-01T09:00:00Z'),
    ask('q-answered', '2026-11-01T09:00:00Z'), grant('q-answered', 'g-a', '2026-11-01T10:00:00Z'),
    { ...ask('msg-9', '2026-11-01T09:00:00Z'), request_id: 'req-9' },
  ]);
  try {
    assert.deepEqual(blockedIds(board), ['msg-9', 'q-open']);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('read-answers --open and review-notes.js: a retracted answer reopens its review card; a RETRACT of it changes nothing', () => {
  const lines = [
    dock('kc-r1', '2026-11-02T09:00:00Z', 'Kuramoto Coupling', 1, 'the slider reads backwards'),
    grant('kc-r1', 'g1', '2026-11-02T10:00:00Z'),
  ];
  const read = (ls) => openReviews(reviewMessages(ls.map((m) => JSON.stringify(m)).join('\n'))).map((r) => r.id);
  assert.deepEqual(read(lines), []);
  assert.deepEqual(read([...lines, retract('g1', 'x1', '2026-11-02T11:00:00Z')]), ['kc-r1']);
  assert.deepEqual(read([...lines, retract('g1', 'x1', '2026-11-02T11:00:00Z'), retract('x1', 'x2', '2026-11-02T12:00:00Z')]), ['kc-r1']);
  // a retracted note is no card
  assert.deepEqual(read([lines[0], retract('kc-r1', 'x3', '2026-11-02T11:00:00Z')]), []);

  const root = mkdtempSync(join(tmpdir(), 'live-answers-review-notes-'));
  try {
    const abs = join(root, BOARD_REL);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, [...lines, retract('g1', 'x1', '2026-11-02T11:00:00Z')].map((m) => JSON.stringify(m)).join('\n') + '\n');
    assert.deepEqual(openReviewNotes(root, { title: 'Kuramoto Coupling' }).map((r) => r.id), ['kc-r1']);
    writeFileSync(abs, lines.map((m) => JSON.stringify(m)).join('\n') + '\n');
    assert.deepEqual(openReviewNotes(root, { title: 'Kuramoto Coupling' }), []);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('the handoff fold still reads its withdrawn set the same way through the shared helper', () => {
  const ready = { id: 'h1', type: 'BROADCAST', payload: { kind: 'handoff_ready', entry: 'X', move: 'm' } };
  const close = { id: 'c1', type: 'REPLY', re: 'h1', payload: { kind: 'handoff_closed', handoff_id: 'h1' } };
  const r = (re, id) => ({ id, type: 'RETRACT', re, payload: { reason: 'r' } });
  assert.equal(foldHandoffs([ready, close]).all[0].state, 'closed');
  assert.equal(foldHandoffs([ready, close, r('c1', 'x1')]).all[0].state, 'open');
  assert.equal(foldHandoffs([ready, close, r('c1', 'x1'), r('x1', 'x2')]).all[0].state, 'open');
});
