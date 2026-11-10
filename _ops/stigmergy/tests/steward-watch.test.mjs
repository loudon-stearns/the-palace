// steward-watch.test.mjs — a baton and a steward on one project see each other.
//
// [[Two Batons, One Board]], check 2. BLUELINE, 2026-11-04 to 11-07: the
// steward built the open baton's item 1 and filed it as a proposal; the pickup
// never said the project had a steward, and nothing told the steward the close.
//
// Everything runs against a throwaway git repo standing in for the palace and a
// scratch board (steward-watch-fixture.mjs): no real board line is written.
//
// Run:  node --test _ops/stigmergy/tests/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rmSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  activeSteward, batonBorn, cardSince, stewardCommitsSince, owedProposalsFor,
  activeCardsFor, stewardNotesOn, STEWARD_CYCLE_KIND,
} from '../steward-watch.mjs';
import { PAGE, DIR, palace, run } from './steward-watch-fixture.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PICKUP = resolve(HERE, '../pickup-handoff.mjs');
const CLOSE = resolve(HERE, '../close-handoff.mjs');

test('activeSteward: registered with its runtime on disk; not when unregistered or the dir is gone', () => {
  const p = palace();
  try {
    assert.deepEqual(activeSteward(p.root, PAGE), { agent_id: PAGE, home: PAGE, dir: DIR });
    assert.deepEqual(activeSteward(p.root, 'test page'), { agent_id: PAGE, home: PAGE, dir: DIR }, 'case does not matter');
    assert.equal(activeSteward(p.root, 'Other'), null);
    rmSync(join(p.root, DIR), { recursive: true, force: true });
    assert.equal(activeSteward(p.root, PAGE), null, 'the leaving rite deleted its runtime');
  } finally { rmSync(p.base, { recursive: true, force: true }); }
  const q = palace({ registered: false });
  try { assert.equal(activeSteward(q.root, PAGE), null); } finally { rmSync(q.base, { recursive: true, force: true }); }
});

test('since the baton was born: the earlier of its born date and the card, so a remainder card does not hide the cycles', () => {
  const p = palace();
  try {
    assert.equal(batonBorn(p.root, `${PAGE}/${PAGE} — baton.md`), '2026-11-04');
    assert.equal(batonBorn(p.root, 'missing.md'), null);
    const [card] = activeCardsFor(JSON.parse(`[${readFileSync(p.board, 'utf8').trim().split('\n').join(',')}]`), PAGE);
    assert.deepEqual(cardSince(p.root, card), { since: '2026-11-04', from: 'baton' });
    const commits = stewardCommitsSince(p.root, activeSteward(p.root, PAGE), '2026-11-04');
    assert.deepEqual(commits.map((c) => c.hash), [p.c2, p.c1], 'both cycles, newest first, and nothing else');
    assert.deepEqual(stewardCommitsSince(p.root, activeSteward(p.root, PAGE), '2026-11-07T12:00:00Z'), [], 'the card time alone would show none');
    assert.deepEqual(owedProposalsFor(p.root, PAGE).map((o) => [o.n, o.page]), [['2', 'Test Page/Schema.md']]);
  } finally { rmSync(p.base, { recursive: true, force: true }); }
});

test('activeCardsFor and stewardNotesOn read the one fold; a closed card is not active', () => {
  const ready = { id: 'r', type: 'BROADCAST', payload: { kind: 'handoff_ready', entry: PAGE } };
  const closed = { id: 'c', type: 'REPLY', re: 'r', payload: { kind: 'handoff_closed', handoff_id: 'r' } };
  const note = { id: 'n', type: 'REPLY', re: 'r', payload: { kind: STEWARD_CYCLE_KIND } };
  assert.deepEqual(activeCardsFor([ready, note], PAGE).map((c) => c.state), ['open'], 'a steward note does not change a card');
  assert.deepEqual(activeCardsFor([ready, note, closed], PAGE), []);
  assert.deepEqual(stewardNotesOn([ready, note, closed], 'r').map((m) => m.id), ['n']);
});

test('pickup --dry-run warns of the steward, lists its cycles, notes and owed proposals, and writes nothing', () => {
  const p = palace();
  try {
    const before = readFileSync(p.board, 'utf8');
    const out = run(PICKUP, [p.ready.id, '--root', p.root, '--board', p.board, '--dry-run']);
    assert.match(out, /"Test Page" has an active steward \(Test Page, _ops\/agents\/permanent\/test-page\)/);
    assert.match(out, /its commits since the baton was born \(2026-11-04\):/);
    assert.ok(out.includes(`${p.c1} 2026-11-05 steward(Test Page): cycle 1`));
    assert.ok(out.includes(`${p.c2} 2026-11-05 steward(Test Page): cycle 2`));
    assert.ok(!out.includes('unrelated'), 'only the steward\'s commits');
    assert.match(out, /its cycles posted 1 note against this card:/);
    assert.match(out, /item 2 · 2026-11-05 · Test Page\/Schema\.md — the clock block/);
    assert.match(out, /say so on the baton and in the ledger, and settle it once/);
    assert.match(out, /--dry-run — would post/);
    assert.equal(readFileSync(p.board, 'utf8'), before, 'nothing posted');
  } finally { rmSync(p.base, { recursive: true, force: true }); }
});

test('pickup says nothing of a steward when the project has none', () => {
  const p = palace({ registered: false });
  try {
    const out = run(PICKUP, [p.ready.id, '--root', p.root, '--board', p.board, '--dry-run']);
    assert.ok(!/active steward/.test(out));
  } finally { rmSync(p.base, { recursive: true, force: true }); }
});

test('the close is addressed to the steward; with none it stays a broadcast', () => {
  const p = palace();
  try {
    const out = run(CLOSE, [p.ready.id, '--root', p.root, '--board', p.board, '--commit', p.c3, '--dry-run']);
    assert.match(out, /"Test Page" has an active steward — the close is addressed to Test Page\./);
    const json = JSON.parse(out.slice(out.indexOf('{', out.indexOf('handoff_closed:'))));
    assert.equal(json.to, PAGE);
    assert.equal(json.payload.steward, PAGE);
    assert.equal(json.payload.kind, 'handoff_closed');

    // a real close on the scratch board: the steward's cycle filter keeps a line addressed to it
    run(CLOSE, [p.ready.id, '--root', p.root, '--board', p.board, '--commit', p.c3]);
    const last = JSON.parse(readFileSync(p.board, 'utf8').trim().split('\n').pop());
    assert.equal(last.to, PAGE);
    assert.equal(activeCardsFor(readFileSync(p.board, 'utf8').trim().split('\n').map((l) => JSON.parse(l)), PAGE).length, 0);
  } finally { rmSync(p.base, { recursive: true, force: true }); }
  const q = palace({ registered: false });
  try {
    const out = run(CLOSE, [q.ready.id, '--root', q.root, '--board', q.board, '--commit', q.c3, '--dry-run']);
    const json = JSON.parse(out.slice(out.indexOf('{', out.indexOf('handoff_closed:'))));
    assert.equal(json.to, '*');
    assert.equal(json.payload.steward, undefined);
  } finally { rmSync(q.base, { recursive: true, force: true }); }
});

