import { describe, it, expect } from 'vitest';
import { buildQueue, reconcileQueue } from '../../src/lib/queue-model.js';
import { buildReviewMessage } from '../../../../rich-face/rich-handler.mjs';

// A rich-face review note becomes QUEUE work. The messages here are built by the
// real poster (rich-handler.mjs buildReviewMessage), fed the body the review
// dock in rich.html sends (collectNotes), so if the poster's shape drifts these
// tests see it. The consumer keys on payload.kind and the page the note names,
// not on the envelope's board or session_id, which may change.

const POSTED = '2026-10-13T10:00:00.000Z';

function dockBody(entry, round, groups, overallNote) {
  return {
    task: `rich-face:${entry}:round-${round}`,
    groups,
    overall: { note: overallNote, round, url: `http://localhost:5173/rich/?entry=${encodeURIComponent(entry)}` },
  };
}

// A posted note, with a fixed id and ts so tests can order and answer it.
function note(over = {}, body = dockBody('Kuramoto Coupling', 2, {
  'The Mechanism': { note: 'the coupling slider reads backwards' },
  'Why it holds': { note: 'the sync demo hides the drift' },
}, 'the page lands, but the bed is too loud')) {
  return { ...buildReviewMessage(body), id: 'human-eval-kc-r2', ts: POSTED, ...over };
}

const grant = (re, type = 'RESOURCE_GRANT') => ({
  id: `answer-${re}`, type, re, from: 'TRICKSTER', to: 'TRICKSTER',
  ts: '2026-10-13T11:00:00Z', board: 'TRICKSTER', payload: {},
});

describe('buildQueue — human_eval (a rich-face review note)', () => {
  it('a note on GENERAL under session "trickster" — the wire since 2026-10-13 — is a card', () => {
    const n = note();
    expect(n).toMatchObject({ board: 'GENERAL', session_id: 'trickster', payload: { kind: 'human_eval' } });
    const q = buildQueue([n]);
    expect(q).toHaveLength(1);
    expect(q[0]).toMatchObject({ kind: 'human_eval', entry: 'Kuramoto Coupling', board: 'GENERAL' });
  });

  it('turns a note the rich face posts into one QUEUE item on its page', () => {
    const q = buildQueue([note()]);
    expect(q).toHaveLength(1);
    const it0 = q[0];
    expect(it0.kind).toBe('human_eval');
    expect(it0.id).toBe('human-eval-kc-r2');
    expect(it0.from).toBe('TRICKSTER');
    expect(it0.entry).toBe('Kuramoto Coupling');
    expect(it0.entries).toEqual(['Kuramoto Coupling']);
    expect(it0.round).toBe(2);
    expect(it0.pointer).toEqual({ type: 'entry', target: 'Kuramoto Coupling' });
    expect(it0.ask).toMatch(/Kuramoto Coupling/);
    expect(it0.ask).toMatch(/3 review notes/);
    expect(it0.summary).toBe(it0.ask);
    // The notes themselves ride in the rationale, page note first.
    expect(it0.notes).toEqual([
      { section: null, note: 'the page lands, but the bed is too loud' },
      { section: 'The Mechanism', note: 'the coupling slider reads backwards' },
      { section: 'Why it holds', note: 'the sync demo hides the drift' },
    ]);
    expect(it0.rationale).toMatch(/the bed is too loud/);
    expect(it0.rationale).toMatch(/The Mechanism: the coupling slider reads backwards/);
    expect(it0.stale_if).toMatch(/Kuramoto Coupling/);
    expect(it0.stale_if).toMatch(/RESOURCE_GRANT\/DENY/);
    expect(it0.blocking).toBe(false);
  });

  it('is retired by a RESOURCE_GRANT answering it', () => {
    expect(buildQueue([note(), grant('human-eval-kc-r2')])).toHaveLength(0);
  });

  it('is retired by a RESOURCE_DENY answering it', () => {
    expect(buildQueue([note(), grant('human-eval-kc-r2', 'RESOURCE_DENY')])).toHaveLength(0);
  });

  it('does not depend on the board or the session_id shape', () => {
    const q = buildQueue([note({ board: 'REVIEW', session_id: 'rich-face-reviewer' })]);
    expect(q).toHaveLength(1);
    expect(q[0].kind).toBe('human_eval');
    expect(q[0].board).toBe('REVIEW');
    expect(q[0].sessionId).toBe('rich-face-reviewer');
  });

  it('keeps a page title whole when it holds a colon', () => {
    const q = buildQueue([note({}, dockBody('Meaning: the Link', 1, {}, 'too dense'))]);
    expect(q[0].entry).toBe('Meaning: the Link');
    expect(q[0].round).toBe(1);
  });

  it('takes the round from overall.round when the task is not the rich face\'s', () => {
    const m = note();
    const q = buildQueue([{ ...m, payload: { kind: 'human_eval', task: 'some-other-task', entry: 'Spinoza Conatus', groups: {}, overall: { note: 'tighten it', round: 3 } } }]);
    expect(q).toHaveLength(1);
    expect(q[0].round).toBe(3);
  });

  it('reads a section note sent as a bare string', () => {
    const q = buildQueue([note({}, dockBody('Kuramoto Coupling', 2, { 'The Mechanism': 'a bare string note' }, ''))]);
    expect(q[0].notes).toEqual([{ section: 'The Mechanism', note: 'a bare string note' }]);
  });

  it('takes the page from payload.entry when a poster names it outright', () => {
    const m = note();
    const q = buildQueue([{ ...m, payload: { ...m.payload, task: 'some-other-task', entry: 'Spinoza Conatus' } }]);
    expect(q).toHaveLength(1);
    expect(q[0].entry).toBe('Spinoza Conatus');
  });

  it('leaves a rating sheet that names no page off the QUEUE', () => {
    // _ops/loudon-eval posts the same kind for a grade the asking session reads back.
    const rating = note({ id: 'human-eval-r4ng3r' }, { task: 'r4ng3r-lora-grade', groups: { flux_lora: { identity: 1, note: 'hooded' } }, overall: { note: 'base wins' } });
    expect(buildQueue([rating])).toHaveLength(0);
  });

  it('leaves a note with no words in it off the QUEUE', () => {
    const empty = note({}, dockBody('Kuramoto Coupling', 2, { 'The Mechanism': { note: '   ' } }, ''));
    expect(buildQueue([empty])).toHaveLength(0);
  });

  it('folds a re-send of the same page and round into one card', () => {
    const first = note({ id: 'human-eval-kc-r2-a', ts: '2026-10-13T10:00:00.000Z' });
    const second = note({ id: 'human-eval-kc-r2-b', ts: '2026-10-13T10:05:00.000Z' });
    const q = buildQueue([first, second]);
    expect(q).toHaveLength(1);
    expect(q[0].id).toBe('human-eval-kc-r2-b');
    expect(q[0].sources).toEqual(['human-eval-kc-r2-a', 'human-eval-kc-r2-b']);
    expect(q[0].notes).toHaveLength(3);
    // Answering the newest send closes the round.
    expect(buildQueue([first, second, grant('human-eval-kc-r2-b')])).toHaveLength(0);
  });

  it('takes the newer send by ts, not by board order', () => {
    const body = (n) => dockBody('Kuramoto Coupling', 2, { 'The Mechanism': { note: n } }, '');
    const first = note({ id: 'kc-old', ts: '2026-10-13T10:00:00.000Z' }, body('old word'));
    const second = note({ id: 'kc-new', ts: '2026-10-13T10:05:00.000Z' }, body('new word'));
    const q = buildQueue([second, first]);
    expect(q).toHaveLength(1);
    expect(q[0].id).toBe('kc-new');
    expect(q[0].notes).toEqual([{ section: 'The Mechanism', note: 'new word' }]);
  });

  it('keeps every note when two sends of a round each carry only some', () => {
    // Two browsers, or two origins, keep two note stores; a send from each carries only its own.
    const a = note({ id: 'kc-a', ts: '2026-10-13T10:00:00.000Z' },
      dockBody('Kuramoto Coupling', 2, { S1: { note: 'one' }, S2: { note: 'two' } }, ''));
    const b = note({ id: 'kc-b', ts: '2026-10-13T10:05:00.000Z' },
      dockBody('Kuramoto Coupling', 2, { S3: { note: 'three' } }, ''));
    const q = buildQueue([a, b]);
    expect(q).toHaveLength(1);
    expect(q[0].notes.map((n) => n.note)).toEqual(['one', 'two', 'three']);
    expect(q[0].ask).toMatch(/3 review notes/);
    // A grant on the card (re: its newest send) answers the whole round.
    expect(buildQueue([a, b, grant('kc-b')])).toHaveLength(0);
  });

  it('merges sends whose page differs only in case', () => {
    const a = note({ id: 'kc-upper', ts: '2026-10-13T10:00:00.000Z' },
      dockBody('Kuramoto Coupling', 2, { S1: { note: 'one' } }, ''));
    const b = note({ id: 'kc-lower', ts: '2026-10-13T10:05:00.000Z' },
      dockBody('kuramoto coupling', 2, { S2: { note: 'two' } }, ''));
    const q = buildQueue([a, b]);
    expect(q).toHaveLength(1);
    expect(q[0].notes.map((n) => n.note)).toEqual(['one', 'two']);
  });

  it('shows only what is new when a round is re-sent after a grant', () => {
    // The dock keeps its notes after a send, so the next send repeats the answered ones.
    const a = note({ id: 'kc-a', ts: '2026-10-13T10:00:00.000Z' },
      dockBody('Kuramoto Coupling', 2, { S1: { note: 'one' }, S2: { note: 'two' } }, ''));
    const c = note({ id: 'kc-c', ts: '2026-10-13T10:10:00.000Z' },
      dockBody('Kuramoto Coupling', 2, { S1: { note: 'one' }, S2: { note: 'two, and more' }, S3: { note: 'three' } }, ''));
    const q = buildQueue([a, grant('kc-a'), c]);
    expect(q).toHaveLength(1);
    expect(q[0].id).toBe('kc-c');
    expect(q[0].sources).toEqual(['kc-c']);
    expect(q[0].notes).toEqual([
      { section: 'S2', note: 'two, and more' },
      { section: 'S3', note: 'three' },
    ]);
    // A re-send with nothing new raises no card.
    const same = note({ id: 'kc-same', ts: '2026-10-13T10:20:00.000Z' },
      dockBody('Kuramoto Coupling', 2, { S1: { note: 'one' }, S2: { note: 'two' } }, ''));
    expect(buildQueue([a, grant('kc-a'), same])).toHaveLength(0);
  });

  it('leaves a later send open when only an earlier one was answered', () => {
    const a = note({ id: 'kc-a', ts: '2026-10-13T10:00:00.000Z' },
      dockBody('Kuramoto Coupling', 2, { S1: { note: 'one' } }, ''));
    const b = note({ id: 'kc-b', ts: '2026-10-13T10:05:00.000Z' },
      dockBody('Kuramoto Coupling', 2, { S3: { note: 'three' } }, ''));
    const q = buildQueue([a, b, grant('kc-a')]);
    expect(q).toHaveLength(1);
    expect(q[0].id).toBe('kc-b');
    expect(q[0].notes).toEqual([{ section: 'S3', note: 'three' }]);
  });

  it('keeps two rounds of the same page as two items', () => {
    const r1 = note({ id: 'human-eval-kc-r1' }, dockBody('Kuramoto Coupling', 1, {}, 'round one'));
    const r2 = note();
    expect(buildQueue([r1, r2]).map((i) => i.id).sort()).toEqual(['human-eval-kc-r1', 'human-eval-kc-r2']);
  });
});

describe('reconcileQueue — human_eval', () => {
  it('closes when a commit touches the page after the note was posted', () => {
    const out = reconcileQueue(buildQueue([note()]), [
      { shortHash: 'enr01', date: '2026-10-13T12:00:00Z', entries: ['Kuramoto Coupling'], resolves: [] },
    ]);
    expect(out[0].resolved.done).toBe(true);
    expect(out[0].resolved.reason).toMatch(/enr01.*Kuramoto Coupling/);
  });

  it('stays open when the touching commit came before the note', () => {
    const out = reconcileQueue(buildQueue([note()]), [
      { shortHash: 'old01', date: '2026-10-13T09:00:00Z', entries: ['Kuramoto Coupling'], resolves: [] },
    ]);
    expect(out[0].resolved.done).toBe(false);
  });
});
