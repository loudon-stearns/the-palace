import React, { useEffect, useState } from 'react';
import { fetchTrunkState } from '../../adapters/log.js';
import { trunkStrip } from '../../lib/trunk-strip.js';

// The trunk in one line, at the top of GIT STATE: main against origin, the
// last push, what the ear heard in a day, a landing that died halfway, what
// sits unsaved in the main checkout, and branches holding work not on main.
// It reads /api/trunk-state (scripts/trunk-state.mjs without the writer
// search; the server holds one read for 30 s) and refreshes on the panel's
// nonce. The wording lives in src/lib/trunk-strip.js.
// Read-only by construction: nothing here pushes, heals, prunes or removes.

const dimText = { color: 'var(--phosphor-dim)', textShadow: 'none' };

const TONE = {
  dim: dimText,
  plain: { color: 'var(--phosphor)' },
  warn: { color: 'var(--warn)' },
  loud: { color: 'var(--error)', textShadow: 'var(--glow)' },
};

export function TrunkLine({ phrases }) {
  if (!phrases || phrases.length === 0) return null;
  const loud = phrases.some((p) => p.tone === 'loud');
  return (
    <div data-testid="trunk-strip" data-loud={loud ? 'true' : 'false'} style={{
      display: 'flex', flexWrap: 'wrap', gap: '2px 14px', alignItems: 'center',
      border: `1px solid ${loud ? 'var(--error)' : 'var(--phosphor-dim)'}`, padding: '5px 12px', fontSize: 12, marginBottom: 10,
    }}>
      <span style={{ ...dimText, fontSize: 10, letterSpacing: '.16em' }}>⑂ TRUNK</span>
      {phrases.map((p, i) => (
        <React.Fragment key={p.key}>
          {i > 0 ? <span style={dimText}>·</span> : null}
          <span data-testid="trunk-phrase" data-key={p.key} data-tone={p.tone} title={p.title || undefined}>
            {p.parts.map((part, j) => <span key={j} style={TONE[part.tone] || TONE.plain}>{part.text}</span>)}
          </span>
        </React.Fragment>
      ))}
      <span style={{ ...dimText, fontSize: 11, opacity: 0.7, marginLeft: 'auto' }}>read-only</span>
    </div>
  );
}

export default function TrunkStrip({ nonce = 0 }) {
  const [state, setState] = useState({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState((s) => (s.kind === 'ok' ? s : { kind: 'loading' }));
    fetchTrunkState().then((r) => {
      if (cancelled) return;
      if (r.ok) setState({ kind: 'ok', data: r });
      else setState({ kind: 'err', error: r.error });
    });
    return () => { cancelled = true; };
  }, [nonce]);

  if (state.kind === 'err') {
    return (
      <div data-testid="trunk-strip-error" style={{ color: 'var(--error)', textShadow: 'var(--glow)', border: '1px solid var(--error)', padding: 8, fontSize: 12, marginBottom: 10 }}>
        could not read the trunk: {state.error}
      </div>
    );
  }
  if (state.kind === 'loading') {
    return <div data-testid="trunk-strip-loading" style={{ ...dimText, fontSize: 12, marginBottom: 10 }}>reading the trunk…</div>;
  }
  return <TrunkLine phrases={trunkStrip(state.data)} />;
}
