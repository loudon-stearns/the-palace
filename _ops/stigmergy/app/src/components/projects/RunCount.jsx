import React from 'react';

// RunCount -- the cycle count beside a scroll's ADVANCE (2026-11-03, Loudon's
// ask while advancing the Shopkeeper by hand: "a nicer way to set the cycle
// count from the deck"). One advance is a RUN of this many cycles, sent to the
// lane as `max_cycles`; the run still ends early on a blocking ask, a stall, a
// session request or a usage limit (steward-lane.js nextRunStep), and the
// manifest's max_iterations on disk is never touched. The count starts at the
// manifest's own cap, so an untouched click does what it did before. It sits
// beside ADVANCE on a scroll and in a PROJECTS row's confirm step (Loudon,
// 2026-11-03: "as the Confirm option opens I can set a max").

export const RUN_COUNT_MAX = 5;

/** A whole number in 1..RUN_COUNT_MAX; anything unreadable is 1. */
export function clampRunCount(n) {
  const v = Number.parseInt(n, 10);
  if (!Number.isFinite(v)) return 1;
  return Math.min(RUN_COUNT_MAX, Math.max(1, v));
}

/** Where the control starts for a row: its manifest's run cap, clamped. */
export function defaultRunCount(row) {
  return clampRunCount(row && row.run_cap ? row.run_cap : 1);
}

function Chip({ label, testid, off, onClick }) {
  return (
    <span
      role="button"
      tabIndex={off ? -1 : 0}
      data-testid={testid}
      aria-disabled={off ? 'true' : 'false'}
      onClick={off ? undefined : onClick}
      onKeyDown={off ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1, padding: '2px 6px',
        border: '1px solid currentColor', color: off ? 'var(--fg3)' : 'var(--phosphor)',
        textShadow: off ? 'none' : 'var(--glow)', cursor: off ? 'default' : 'pointer', userSelect: 'none',
      }}
    >{label}</span>
  );
}

// `testId` names the control for tests: the scroll's is `scroll-run-count`,
// a PROJECTS row's `steward-run-count-<slug>`; the chips take `-less` / `-more`.
export default function RunCount({ value, onChange, disabled = false, testId = 'scroll-run-count' }) {
  const n = clampRunCount(value);
  return (
    <span
      data-testid={testId}
      data-count={n}
      title={`cycles per advance, 1 to ${RUN_COUNT_MAX} -- the run still stops early on a blocking ask, a stall or a usage limit`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--phosphor-dim)', textShadow: 'none', letterSpacing: '.04em', textTransform: 'uppercase' }}
    >
      <span>cycles</span>
      <Chip label="-" testid={`${testId}-less`} off={disabled || n <= 1} onClick={() => onChange(clampRunCount(n - 1))} />
      <span data-testid={`${testId}-value`} style={{ color: 'var(--phosphor-white)', textShadow: 'var(--glow)', minWidth: '1ch', textAlign: 'center', fontSize: 13 }}>{n}</span>
      <Chip label="+" testid={`${testId}-more`} off={disabled || n >= RUN_COUNT_MAX} onClick={() => onChange(clampRunCount(n + 1))} />
    </span>
  );
}
