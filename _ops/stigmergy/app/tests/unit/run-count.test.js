// The cycle count beside a scroll's ADVANCE (2026-11-03): the control, what it
// sends, and the words the scroll uses for a run's progress and its end. The
// lane side (max_cycles → a run that stops at its cap, retries a barren cycle
// once, and ends on a blocking ask) is proven in
// tests/integration/stewards-middleware.test.js "the run: …".
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import RunCount, { RUN_COUNT_MAX, clampRunCount, defaultRunCount } from '../../src/components/projects/RunCount.jsx';
import { advanceFeedback, runEndedFeedback } from '../../src/components/projects/steward-feedback.js';
import { advanceSteward } from '../../src/adapters/stewards.js';
import { ProjectRow } from '../../src/components/projects/ProjectsDeck.jsx';

describe('clampRunCount / defaultRunCount', () => {
  it('holds 1..RUN_COUNT_MAX and reads anything unreadable as 1', () => {
    expect(RUN_COUNT_MAX).toBe(5);
    expect(clampRunCount(0)).toBe(1);
    expect(clampRunCount(-3)).toBe(1);
    expect(clampRunCount(3)).toBe(3);
    expect(clampRunCount(99)).toBe(5);
    expect(clampRunCount('2')).toBe(2);
    expect(clampRunCount('x')).toBe(1);
    expect(clampRunCount(undefined)).toBe(1);
  });

  it("starts at the manifest's own cap, so an untouched click runs as it did (Shopkeeper 1, most stewards 3)", () => {
    expect(defaultRunCount({ run_cap: 1 })).toBe(1);
    expect(defaultRunCount({ run_cap: 3 })).toBe(3);
    expect(defaultRunCount({ run_cap: 10 })).toBe(5);
    expect(defaultRunCount({ run_cap: null })).toBe(1);
    expect(defaultRunCount(null)).toBe(1);
  });
});

describe('RunCount', () => {
  it('shows the count with a less and a more chip, and disables the chip at each end', () => {
    const at1 = renderToStaticMarkup(React.createElement(RunCount, { value: 1, onChange: () => {} }));
    expect(at1).toContain('data-testid="scroll-run-count"');
    expect(at1).toContain('data-count="1"');
    expect(at1).toMatch(/data-testid="scroll-run-count-less"[^>]*aria-disabled="true"/);
    expect(at1).toMatch(/data-testid="scroll-run-count-more"[^>]*aria-disabled="false"/);
    const at5 = renderToStaticMarkup(React.createElement(RunCount, { value: 5, onChange: () => {} }));
    expect(at5).toMatch(/data-testid="scroll-run-count-less"[^>]*aria-disabled="false"/);
    expect(at5).toMatch(/data-testid="scroll-run-count-more"[^>]*aria-disabled="true"/);
    const off = renderToStaticMarkup(React.createElement(RunCount, { value: 3, onChange: () => {}, disabled: true }));
    expect(off).toMatch(/data-testid="scroll-run-count-less"[^>]*aria-disabled="true"/);
    expect(off).toMatch(/data-testid="scroll-run-count-more"[^>]*aria-disabled="true"/);
  });

  it('takes a testid of its own for a PROJECTS row', () => {
    const html = renderToStaticMarkup(React.createElement(RunCount, { value: 2, onChange: () => {}, testId: 'steward-run-count-shopkeeper' }));
    expect(html).toContain('data-testid="steward-run-count-shopkeeper"');
    expect(html).toContain('data-testid="steward-run-count-shopkeeper-less"');
    expect(html).toContain('data-testid="steward-run-count-shopkeeper-more"');
    expect(html).not.toContain('scroll-run-count');
  });

  it('never renders a value outside the range', () => {
    expect(renderToStaticMarkup(React.createElement(RunCount, { value: 42, onChange: () => {} }))).toContain('data-count="5"');
  });
});

describe('advanceSteward sends the count as max_cycles', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it('posts max_cycles when a count is given, and nothing extra when it is not', async () => {
    const calls = [];
    vi.stubGlobal('fetch', async (url, init) => { calls.push({ url, body: JSON.parse(init.body) }); return { ok: true, status: 200, json: async () => ({ fired: true, cycle_n: 2, run: { cap: 3, position: 1 } }) }; });
    const r = await advanceSteward('Shopkeeper', { maxCycles: 3 });
    expect(r).toMatchObject({ ok: true, fired: true, run: { cap: 3 } });
    expect(calls[0].url).toBe('/api/steward/advance');
    expect(calls[0].body).toEqual({ name: 'Shopkeeper', max_cycles: 3 });
    await advanceSteward('Shopkeeper');
    expect(calls[1].body).toEqual({ name: 'Shopkeeper' });
    await advanceSteward('Shopkeeper', { maxCycles: 0 });
    expect(calls[2].body).toEqual({ name: 'Shopkeeper' });
  });
});

describe('the words: advancing, and how the last run ended', () => {
  it('names the run cap and that it can stop early, only when the run is more than one cycle', () => {
    expect(advanceFeedback('Shopkeeper', { ok: true, fired: true, cycle_n: 9, run: { cap: 3, position: 1 } }).text).toBe('advancing Shopkeeper -> cycle 9 (a run of up to 3 cycles -- it stops early on a blocking ask, a stall or a usage limit)');
    expect(advanceFeedback('Shopkeeper', { ok: true, fired: true, cycle_n: 9, run: { cap: 1, position: 1 } }).text).toBe('advancing Shopkeeper -> cycle 9');
  });

  it('is nothing for another steward, or a record with no run', () => {
    expect(runEndedFeedback('Shopkeeper', null)).toBeNull();
    expect(runEndedFeedback('Shopkeeper', { name: 'Crystal Synthesizer', run: { cap: 3, position: 3 } })).toBeNull();
    expect(runEndedFeedback('Shopkeeper', { name: 'Shopkeeper' })).toBeNull();
    // a record with no verdict (the stub worker's dry reap) says nothing rather than "unknown"
    expect(runEndedFeedback('Shopkeeper', { ok: true, stub: true, name: 'Shopkeeper', cycle_n: 5, run: { cap: 3, position: 1, retried: false, override: true } })).toBeNull();
  });

  it('a run that reached its cap reads ok; one that stopped early says so and why', () => {
    const full = runEndedFeedback('Shopkeeper', { ok: true, name: 'Shopkeeper', cycle_n: 11, stop_hint: 'shipped', run: { cap: 3, position: 3, continued: false, stopped_because: 'run_cap' } });
    expect(full).toEqual({ tone: 'ok', text: 'last run: cycle 11 · 3/3 of the run · ran its cycles' });
    const paused = runEndedFeedback('Shopkeeper', { ok: true, name: 'Shopkeeper', cycle_n: 9, stop_hint: 'blocking_ask', run: { cap: 3, position: 1, continued: false, stopped_because: 'paused_on_loudon' } });
    expect(paused).toEqual({ tone: 'warn', text: 'last run: cycle 9 · 1/3 of the run · stopped early: paused -- a blocking ask waits on you' });
    const stalled = runEndedFeedback('Shopkeeper', { ok: true, name: 'Shopkeeper', cycle_n: 10, stop_hint: 'barren', run: { cap: 5, position: 2, retried: true, continued: false, stopped_because: 'stalled' } });
    expect(stalled.tone).toBe('warn');
    expect(stalled.text).toContain('2/5 of the run · stopped early: stalled');
    const cut = runEndedFeedback('Shopkeeper', { ok: false, name: 'Shopkeeper', cycle_n: 10, stop_hint: 'interrupted', run: { cap: 2, position: 1, continued: false, stopped_because: 'interrupted' } });
    expect(cut.tone).toBe('err');
    expect(cut.text).toContain('the worker was cut off');
  });

  it('between cycles of a live run it reads as continuing', () => {
    expect(runEndedFeedback('Shopkeeper', { ok: true, name: 'Shopkeeper', cycle_n: 9, run: { cap: 3, position: 1, continued: true, stopped_because: null } })).toEqual({ tone: 'dim', text: 'last run: cycle 9 · 1/3 of the run -> continuing' });
  });

  it('an unknown reason comes through in plain words rather than vanishing', () => {
    expect(runEndedFeedback('Shopkeeper', { ok: true, name: 'Shopkeeper', cycle_n: 1, run: { cap: 3, position: 1, stopped_because: 'clock: 61 of 60 min' } }).text).toContain('stopped early: clock: 61 of 60 min');
  });
});

describe("a PROJECTS row's confirm step carries the count (every stewarded row, Loudon 2026-11-03)", () => {
  const row = { home: 'Shopkeeper', stewarded: true, run_cap: 1, stage: null, iteration: 4 };
  const props = { row, onOpen: () => {}, onAdvance: () => {}, canAdvance: true, onConfirm: () => {}, onCancel: () => {}, busy: false };

  it('shows the control beside CONFIRM while confirming, at the count the deck holds', () => {
    const html = renderToStaticMarkup(React.createElement(ProjectRow, { ...props, confirming: true, runCount: 3, onRunCount: () => {} }));
    expect(html).toContain('data-testid="steward-run-count-shopkeeper"');
    expect(html).toContain('data-count="3"');
    expect(html).toContain('data-testid="steward-confirm-shopkeeper"');
    expect(html).not.toContain('run up to');
  });

  it("falls back to the row's manifest cap when the deck holds no count", () => {
    const html = renderToStaticMarkup(React.createElement(ProjectRow, { ...props, confirming: true, runCount: null }));
    expect(html).toContain('data-count="1"');
  });

  it('hides the control when the row is not confirming', () => {
    const html = renderToStaticMarkup(React.createElement(ProjectRow, { ...props, confirming: false }));
    expect(html).not.toContain('steward-run-count-');
    expect(html).toContain('data-testid="steward-advance-shopkeeper"');
  });
});
