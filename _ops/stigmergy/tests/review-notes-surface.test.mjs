// review-notes-surface.test.mjs — Loudon's open review notes surface where work begins.
//
// A review note waits on the board as a REVIEW NOTE card until someone grants or denies it,
// and nothing that starts work used to look. The Return map and baton pickup now read them,
// through the QUEUE's own fold (read-answers.mjs openReviews → buildQueue), so the map, the
// pickup and the deck agree on which are open. Both are read-only here: the scratch board is
// byte-for-byte the same after.
//
// Run:  node --test _ops/stigmergy/tests/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildReviewMessage } from '../../rich-face/rich-handler.mjs';
import { buildAnswersMessage } from '../../loudon-eval/eval-server.mjs';
import { openReviews, reviewMessages } from '../../loudon-eval/read-answers.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PICKUP = resolve(HERE, '../pickup-handoff.mjs');
const RETURN_MAP = resolve(HERE, '../../concierge/return-map.mjs');
const ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
const plain = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');

const dock = (id, ts, entry, round, note) => ({
  ...buildReviewMessage({ task: `rich-face:${entry}:round-${round}`, groups: { Core: { note } }, overall: { round } }), id, ts,
});
const answers = (id, ts, entry, summary, url) => ({
  ...buildAnswersMessage({ page: entry, task: 'a-rough', answers: { a: 1 }, summary, url }).message, id, ts,
});

function scratchBoard() {
  const dir = mkdtempSync(join(tmpdir(), 'review-notes-surface-'));
  const board = join(dir, 'blackboard.jsonl');
  const lines = [
    { schema_version: '1.0', id: 'kc-handoff', ts: '2026-11-01T09:00:00Z', session_id: 's', from: 'Kuramoto Coupling', to: '*',
      type: 'BROADCAST', board: 'GENERAL', health: { score: 'green', model: 'x' },
      payload: { kind: 'handoff_ready', entry: 'Kuramoto Coupling', move: 'tighten the mechanism', handoff_path: 'Kuramoto Coupling/Kuramoto Coupling — baton.md' } },
    dock('kc-dock-r1', '2026-11-02T09:00:00Z', 'Kuramoto Coupling', 1, 'answered already'),
    { id: 'g1', type: 'RESOURCE_GRANT', re: 'kc-dock-r1', from: 'TRICKSTER', to: 'TRICKSTER', ts: '2026-11-02T10:00:00Z', board: 'TRICKSTER', payload: {} },
    dock('kc-dock-r2', '2026-11-03T09:00:00Z', 'Kuramoto Coupling', 2, 'the slider reads backwards'),
    answers('kc-answers', '2026-11-04T09:00:00Z', 'Kuramoto Coupling', 'from the rough: the bold one', '/Kuramoto Coupling/proofs/r/blind.html'),
    answers('ohm-answers', '2026-11-05T09:00:00Z', "Ohm's Law", 'another page entirely', '/Ohm\'s Law/proofs/r/ask.html'),
  ];
  writeFileSync(board, lines.map((m) => JSON.stringify(m)).join('\n') + '\n');
  return { dir, board };
}

test('openReviews: the QUEUE fold, both kinds, answered ones gone, newest first', () => {
  const { dir, board } = scratchBoard();
  try {
    const open = openReviews(reviewMessages(readFileSync(board, 'utf8')));
    assert.deepEqual(open.map((r) => [r.entry, r.via, r.round, r.url]), [
      ["Ohm's Law", 'page', null, "/Ohm's Law/proofs/r/ask.html"],
      ['Kuramoto Coupling', 'page', null, '/Kuramoto Coupling/proofs/r/blind.html'],
      ['Kuramoto Coupling', 'rich-face', 2, null],
    ]);
    assert.equal(openReviews(reviewMessages(readFileSync(board, 'utf8')), { page: 'kuramoto coupling' }).length, 2);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('pickup prints the open notes on the entry it claims, beside the commits, and writes nothing', () => {
  const { dir, board } = scratchBoard();
  try {
    const before = readFileSync(board, 'utf8');
    const out = plain(execFileSync(process.execPath, [PICKUP, 'kc-handoff', '--board', board, '--dry-run'], { env: ENV, encoding: 'utf8' }));
    assert.match(out, /Loudon has open review notes on "Kuramoto Coupling"/);
    assert.match(out, /act on 1 review note on the rich face of \[\[Kuramoto Coupling\]\] \(round 2\)/);
    assert.match(out, /Core: the slider reads backwards/);
    assert.match(out, /act on 1 review note on \[\[Kuramoto Coupling\]\], sent from blind\.html/);
    assert.doesNotMatch(out, /answered already/);
    assert.doesNotMatch(out, /another page entirely/);
    assert.ok(out.indexOf('open review notes') < out.indexOf('--dry-run — would post'), 'the notes come before the claim');
    assert.equal(readFileSync(board, 'utf8'), before);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('pickup says plainly when the entry has no open notes', () => {
  const { dir, board } = scratchBoard();
  try {
    const lines = readFileSync(board, 'utf8').split('\n').filter((l) => l && !l.includes('human_eval'));
    writeFileSync(board, lines.join('\n') + '\n');
    const out = plain(execFileSync(process.execPath, [PICKUP, 'kc-handoff', '--board', board, '--dry-run'], { env: ENV, encoding: 'utf8' }));
    assert.match(out, /no open review notes from Loudon on "Kuramoto Coupling"/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('the Return map lists every page with open notes, in --json and in its text, and writes nothing', () => {
  const { dir, board } = scratchBoard();
  try {
    const before = readFileSync(board, 'utf8');
    const env = { ...ENV, STIGMERGY_BOARD: board };
    const data = JSON.parse(execFileSync(process.execPath, [RETURN_MAP, '--json'], { env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
    const { reviews } = data.inFlight;
    assert.equal(reviews.ok, true);
    assert.equal(reviews.cmd, 'node _ops/loudon-eval/read-answers.mjs --open');
    assert.deepEqual(reviews.open.map((r) => [r.entry, r.count, r.via, r.round, r.source]), [
      ["Ohm's Law", 1, 'page', null, 'ask.html'],
      ['Kuramoto Coupling', 1, 'page', null, 'blind.html'],
      ['Kuramoto Coupling', 1, 'rich-face', 2, null],
    ]);
    for (const r of reviews.open) assert.ok(r.age && r.id && r.ts);
    const text = plain(execFileSync(process.execPath, [RETURN_MAP], { env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
    assert.match(text, /\$ node _ops\/loudon-eval\/read-answers\.mjs --open/);
    assert.match(text, /◇ Kuramoto Coupling {2}1 note · rich face, round 2 · /);
    assert.match(text, /◇ Ohm's Law {2}1 note · sent from ask\.html · /);
    assert.equal(readFileSync(board, 'utf8'), before);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('read-answers --open: one reader for both kinds, the one Enrichment step 1 runs', () => {
  const { dir, board } = scratchBoard();
  try {
    const READ = resolve(HERE, '../../loudon-eval/read-answers.mjs');
    const json = JSON.parse(execFileSync(process.execPath, [READ, '--page', 'Kuramoto Coupling', '--open', '--json', '--board', board], { env: ENV, encoding: 'utf8' }));
    assert.deepEqual(json.map((r) => r.via), ['page', 'rich-face']);
    const text = execFileSync(process.execPath, [READ, '--page', 'Kuramoto Coupling', '--open', '--board', board], { env: ENV, encoding: 'utf8' });
    assert.match(text, /Core: the slider reads backwards/);
    assert.match(text, /a-rough: from the rough: the bold one/);
    assert.doesNotMatch(text, /answered already/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
