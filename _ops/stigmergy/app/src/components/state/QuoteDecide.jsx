import React from 'react';
import { IS_PUBLIC } from '../../lib/public-mode.js';
import { statusLabel } from '../../lib/quote-walk.js';

// Loudon's quick yes or no on a quote — the same two chips wherever a quote
// shows (the mark on a page, the window in the QUOTES lens):
//
//   awaiting your read   [Y] keep   [X] let go
//   ◆ kept · 2026-10-13             [X] let go
//   let go               [Y] keep (revive)
//
// Read-only in the public read view (nothing there can decide). The keys are
// the lens's; here they are only shown. `onDecide(id, 'keep' | 'retire')`.

export default function QuoteDecide({ quote, onDecide, busy = false, showKeys = false }) {
  if (!quote || IS_PUBLIC || !onDecide) return null;
  const status = quote.status || 'placed';
  const chip = (label, hot, decision, tone) => (
    <span
      data-testid={`quote-${decision}`}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={busy ? undefined : () => onDecide(quote.id, decision)}
      onKeyDown={(e) => { if (!busy && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); onDecide(quote.id, decision); } }}
      style={{
        cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.5 : 1,
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase',
        color: tone, textShadow: 'var(--glow)', border: `1px solid ${tone}`, padding: '0 6px',
      }}
    >
      {showKeys ? <>[<b style={{ color: 'var(--phosphor-white)' }}>{hot}</b>]&nbsp;</> : null}{label}
    </span>
  );
  const when = (status === 'kept' ? quote.kept_at : status === 'retired' ? quote.retired_at : null);
  const day = when ? String(when).slice(0, 10) : null;
  return (
    <span data-testid="quote-decide" data-status={status} style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 8, alignItems: 'baseline' }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', textShadow: 'none',
        color: status === 'kept' ? 'var(--phosphor)' : status === 'retired' ? 'var(--phosphor-dim)' : 'var(--warn)',
      }}>
        {status === 'kept' ? '◆ ' : ''}{statusLabel(status)}{day ? ` · ${day}` : ''}
      </span>
      {status !== 'kept' ? chip(status === 'retired' ? 'keep (revive)' : 'keep', 'Y', 'keep', 'var(--phosphor)') : null}
      {status !== 'retired' ? chip('let go', 'X', 'retire', 'var(--phosphor-dim)') : null}
    </span>
  );
}
