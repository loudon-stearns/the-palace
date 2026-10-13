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

  it('lets a re-send of the same page and round stand for that round', () => {
    // The dock sends every note of the round each time, so the newest send is the whole round.
    const first = note({ id: 'human-eval-kc-r2-a', ts: '2026-10-13T10:00:00.000Z' });
    const second = note({ id: 'human-eval-kc-r2-b', ts: '2026-10-13T10:05:00.000Z' });
    const q = buildQueue([first, second]);
    expect(q).toHaveLength(1);
    expect(q[0].id).toBe('human-eval-kc-r2-b');
    // Answering the newest send closes the round.
    expect(buildQueue([first, second, grant('human-eval-kc-r2-b')])).toHaveLength(0);
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
