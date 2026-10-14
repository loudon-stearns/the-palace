import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StageGlyph from './StageGlyph.jsx';
import QuoteDecide from './QuoteDecide.jsx';
import { typeColor } from '../../lib/entry-style.js';
import { IS_PUBLIC } from '../../lib/public-mode.js';
import { fetchQuotes, fetchTopologyForQuotes, decideQuote } from '../../adapters/quotes.js';
import {
  activeQuotes, awaitingQuotes, applyDecision, pickRandom, neighborsOf, pushTrail, tally, shortQuote,
  fidelityGlyph, fidelityLabel,
} from '../../lib/quote-walk.js';

// The QUOTES lens — travel the palace quote to quote.
//
// One quote at a time, large, and under it the page it is a window into: the
// title, type and stage, the paragraph the quote is laid beside, and why it is
// there. From here the walk goes three ways: another quote on this page, a
// quote read through the same lens, a quote on a page one typed link away —
// or `n` draws one at random. `Enter` steps through the window into the page
// at the mark. The trail of the walk so far runs along the bottom.
//
// The quote shown rides in the URL (?quote=<id>, url-nav useQuoteNavigation),
// so the browser's back button walks back and a quote can be bookmarked.
//
// The one thing the lens writes is Loudon's decision: `y` keeps the quote
// shown, `x` lets it go (POST /api/quotes/decide → one ledger line,
// committed). The "awaiting your read" chip narrows the walk to the quotes he
// has not judged yet, and after each decision the lens moves to the next one,
// so a backlog clears at one keystroke per quote. Placing stays with
// _ops/quotes/place.mjs.

const ui = {
  eyebrow: {
    fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase',
    color: 'var(--phosphor-dim)', textShadow: 'none',
  },
  chip: (active) => ({
    cursor: 'pointer', userSelect: 'none', fontSize: 11, letterSpacing: '.04em',
    fontFamily: 'var(--font-mono)', padding: '1px 7px',
    color: active ? 'var(--bg)' : 'var(--phosphor)',
    background: active ? 'var(--phosphor)' : 'transparent',
    textShadow: active ? 'none' : 'var(--glow)',
    border: `1px ${active ? 'solid var(--phosphor)' : 'dashed var(--phosphor-dim)'}`,
  }),
  key: (hot) => (
    <span style={{ color: 'var(--phosphor)', textShadow: 'var(--glow)' }}>
      [<b style={{ color: 'var(--phosphor-white)' }}>{hot}</b>]
    </span>
  ),
};

export default function QuotesLens({ quoteId = null, onOpenQuote, onStepThrough, onOpenEntry }) {
  const [state, setState] = useState({ kind: 'loading' });
  const [topology, setTopology] = useState(null);
  const [lensFilter, setLensFilter] = useState(null);
  // The "awaiting your read" chip: narrow the walk to the quotes not yet judged.
  const [awaitingOnly, setAwaitingOnly] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [lastDecision, setLastDecision] = useState(null); // { id, decision, committed, error }
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    let live = true;
    fetchQuotes().then((r) => {
      if (!live) return;
      if (r.ok) setState({ kind: 'ok', data: r });
      else setState({ kind: 'err', error: r.error ?? 'unknown error' });
    });
    fetchTopologyForQuotes().then((t) => { if (live) setTopology(t); });
    return () => { live = false; };
  }, []);

  const quotes = useMemo(() => (state.kind === 'ok' ? activeQuotes(state.data.quotes) : []), [state]);
  const pool = useMemo(() => {
    let p = awaitingOnly ? awaitingQuotes(quotes) : quotes;
    if (lensFilter) p = p.filter((q) => q.lens === lensFilter);
    return p;
  }, [quotes, lensFilter, awaitingOnly]);
  // The quote shown may have just been let go (it stays on screen with its
  // undo), so it is looked up among every placement, not only the active ones.
  const current = useMemo(() => (state.kind === 'ok' ? state.data.quotes : []).find((q) => q.id === quoteId) || null, [state, quoteId]);
  const counts = useMemo(() => tally(quotes), [quotes]);
  const awaitingCount = useMemo(() => awaitingQuotes(quotes).length, [quotes]);

  // The first draw: no quote named in the URL (or a stale id) → draw one, as a
  // replace, not a step — the walker has not moved yet.
  useEffect(() => {
    if (state.kind !== 'ok' || quotes.length === 0) return;
    if (current) return;
    const pick = pickRandom(pool.length ? pool : quotes);
    if (pick) onOpenQuote?.(pick.id, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.kind, quotes.length, current]);

  // The trail follows whatever is shown, however it got there (a chip, `n`,
  // the browser's back button).
  useEffect(() => {
    if (current) setTrail((t) => pushTrail(t, current.id));
  }, [current]);

  const another = useCallback(() => {
    const pick = pickRandom(pool.length ? pool : quotes, { excludeId: current?.id ?? null });
    if (pick) onOpenQuote?.(pick.id);
  }, [pool, quotes, current, onOpenQuote]);

  const stepThrough = useCallback(() => {
    if (current?.target_path) onStepThrough?.(current.target_path, current.id);
  }, [current, onStepThrough]);

  // Loudon's decision on the quote shown. The answer is folded into the local
  // list at once; with "awaiting your read" on, the lens moves to the next
  // unjudged quote so a backlog clears at one key per quote. A let-go quote
  // stays on screen otherwise, with its undo (keep).
  const decide = useCallback(async (id, decision) => {
    if (IS_PUBLIC || deciding || !id) return;
    setDeciding(true);
    const r = await decideQuote({ id, decision });
    setDeciding(false);
    if (!r.ok) { setLastDecision({ id, decision, error: r.error || `http ${r.status}` }); return; }
    setLastDecision({ id, decision, committed: !!r.committed, error: r.commit_error || null });
    setState((s) => (s.kind === 'ok' ? { ...s, data: { ...s.data, quotes: applyDecision(s.data.quotes, r.quote) } } : s));
    if (awaitingOnly) {
      const rest = awaitingQuotes(applyDecision(quotes, r.quote)).filter((q) => q.id !== id && (!lensFilter || q.lens === lensFilter));
      const next = pickRandom(rest);
      if (next) onOpenQuote?.(next.id);
    }
  }, [deciding, awaitingOnly, lensFilter, quotes, onOpenQuote]);

  // Keys: n another · Enter step through · y keep · x let go · Escape clear
  // the filters. The deck letters (S Q L T P R …) are App's; these stay off them.
  const keysRef = useRef({ another, stepThrough, decide, current });
  keysRef.current = { another, stepThrough, decide, current };
  useEffect(() => {
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t && (/input|textarea|select/i.test(t.tagName) || t.isContentEditable)) return;
      const k = keysRef.current;
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); k.another(); }
      else if (e.key === 'Enter') { e.preventDefault(); k.stepThrough(); }
      else if ((e.key === 'y' || e.key === 'Y') && k.current) { e.preventDefault(); k.decide(k.current.id, 'keep'); }
      else if ((e.key === 'x' || e.key === 'X') && k.current) { e.preventDefault(); k.decide(k.current.id, 'retire'); }
      else if (e.key === 'Escape') { setLensFilter(null); setAwaitingOnly(false); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const neighbors = useMemo(() => {
    const n = neighborsOf(current, quotes, topology);
    if (!lensFilter) return n;
    const keep = (list) => list.filter((q) => q.lens === lensFilter);
    return { samePage: keep(n.samePage), sameLens: n.sameLens.filter((q) => q.lens === lensFilter), linked: keep(n.linked) };
  }, [current, quotes, topology, lensFilter]);

  if (state.kind === 'loading') {
    return <div data-testid="quotes-lens" style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}>reading the quotes ledger…</div>;
  }
  if (state.kind === 'err') {
    return (
      <div data-testid="quotes-lens" style={{ color: 'var(--error)', textShadow: 'var(--glow)', border: '1px solid var(--error)', padding: 12 }}>
        could not read the quotes: {state.error}
      </div>
    );
  }
  if (quotes.length === 0) {
    return (
      <div data-testid="quotes-lens" data-empty="1" style={{ color: 'var(--phosphor-dim)', textShadow: 'none', lineHeight: 1.6 }}>
        <div style={ui.eyebrow}>quotes · windows into pages</div>
        <div style={{ marginTop: 8 }}>no quotes placed yet.</div>
        <div style={{ marginTop: 4, fontSize: 12 }}>
          Palace Quotes leaves one by reading a page through one of the palace's lenses —
          <code style={{ color: 'var(--phosphor)', marginLeft: 6 }}>node _ops/quotes/place.mjs --mandate "&lt;Page&gt;"</code>
        </div>
      </div>
    );
  }

  const lensPath = (title) => state.data.lenses?.find((l) => l.title === title)?.path ?? current?.lens_path ?? null;

  return (
    <div data-testid="quotes-lens" style={{ position: 'relative' }}>
      {/* header strip: count, the lens filter, the keys */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', alignItems: 'center', marginBottom: 10 }}>
        <span style={ui.eyebrow} data-testid="quotes-count">
          {quotes.length} quote{quotes.length === 1 ? '' : 's'} on {counts.pages.length} page{counts.pages.length === 1 ? '' : 's'} · through {counts.lenses.length} lens{counts.lenses.length === 1 ? '' : 'es'}
        </span>
        <span style={{ ...ui.eyebrow, marginLeft: 'auto' }}>
          {ui.key('n')} another &nbsp; {ui.key('↵')} step through &nbsp;
          {!IS_PUBLIC ? <>{ui.key('y')} keep &nbsp; {ui.key('x')} let go &nbsp; </> : null}
          {ui.key('←')} back
        </span>
      </div>
      <div data-testid="quotes-lens-filter" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 14 }}>
        {!IS_PUBLIC ? (
          <span
            role="button"
            tabIndex={0}
            data-testid="quotes-awaiting-chip"
            onClick={() => setAwaitingOnly((v) => !v)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAwaitingOnly((v) => !v); } }}
            title="walk only the quotes you have not kept or let go yet; y and x move you to the next"
            style={{ ...ui.chip(awaitingOnly), borderColor: awaitingOnly ? 'var(--phosphor)' : 'var(--warn)', color: awaitingOnly ? 'var(--bg)' : 'var(--warn)', marginRight: 8 }}
          >awaiting your read · {awaitingCount}</span>
        ) : null}
        <span style={ui.eyebrow}>through</span>
        <span role="button" tabIndex={0} onClick={() => setLensFilter(null)} style={ui.chip(lensFilter === null)}>any lens</span>
        {counts.lenses.map((l) => (
          <span
            key={l.name}
            role="button"
            tabIndex={0}
            data-testid="quotes-lens-chip"
            onClick={() => setLensFilter(lensFilter === l.name ? null : l.name)}
            style={ui.chip(lensFilter === l.name)}
            title={`${l.count} quote${l.count === 1 ? '' : 's'} read through ${l.name}`}
          >{l.name}<span style={{ opacity: 0.7 }}> · {l.count}</span></span>
        ))}
      </div>

      {current ? (
        <TheWindow
          q={current}
          lensPath={lensPath(current.lens)}
          onStepThrough={stepThrough}
          onOpenEntry={onOpenEntry}
          onDecide={decide}
          deciding={deciding}
          lastDecision={lastDecision && lastDecision.id === current.id ? lastDecision : null}
        />
      ) : null}

      {current ? (
        <WhereThisLeads neighbors={neighbors} onPick={(id) => onOpenQuote?.(id)} onAnother={another} />
      ) : null}

      {trail.length > 1 ? (
        <div data-testid="quotes-trail" style={{ marginTop: 18, borderTop: '1px solid var(--phosphor-dim)', paddingTop: 8 }}>
          <div style={ui.eyebrow}>the walk so far</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 6px', marginTop: 6, alignItems: 'baseline' }}>
            {trail.map((id, i) => {
              const q = quotes.find((x) => x.id === id);
              if (!q) return null;
              const here = id === current?.id;
              return (
                <React.Fragment key={`${id}-${i}`}>
                  {i > 0 ? <span style={{ color: 'var(--phosphor-dim)', textShadow: 'none', fontSize: 11 }}>›</span> : null}
                  <span
                    onClick={() => onOpenQuote?.(id)}
                    title={shortQuote(q, 120)}
                    style={{
                      cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11,
                      color: here ? 'var(--phosphor-white)' : 'var(--phosphor-dim)',
                      textShadow: here ? 'var(--glow)' : 'none',
                      borderBottom: here ? '1px solid var(--phosphor)' : '1px dotted var(--phosphor-dim)',
                    }}
                  >{q.target}</span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// The quote, and the page it opens onto.
function TheWindow({ q, lensPath, onStepThrough, onOpenEntry, onDecide = null, deciding = false, lastDecision = null }) {
  const glyph = fidelityGlyph(q.fidelity, q.checked);
  const label = fidelityLabel(q.fidelity, q.checked);
  const src = q.source || {};
  const sourceBits = [src.work, src.locus, src.translator ? `tr. ${src.translator}` : null].filter(Boolean);
  const border = '3px double var(--phosphor-dim)';
  return (
    <div data-testid="quote-window" data-quote-id={q.id} style={{ border, maxWidth: 'min(100%, 86ch)' }}>
      {/* the quote */}
      <div style={{ padding: '22px 26px 16px' }}>
        <div data-testid="quote-text" style={{
          fontFamily: 'var(--font-body)', fontSize: 'clamp(16px, 1.55vw, 21px)', lineHeight: 1.5,
          color: 'var(--phosphor-white)', textShadow: 'var(--glow-strong)',
        }}>
          <span style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}>“</span>
          {q.quote}
          <span style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}>”</span>
        </div>
        <div style={{
          marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: '4px 16px', alignItems: 'baseline',
          fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.04em',
        }}>
          <span>
            <span style={{ color: 'var(--phosphor)', textShadow: 'var(--glow)', textTransform: 'uppercase' }}>— {q.attribution}</span>
            {sourceBits.length ? <span style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}> · {sourceBits.join(' · ')}</span> : null}
          </span>
          <span title={label} data-testid="quote-fidelity" style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}>
            <span style={{ color: glyph === '◇' ? 'var(--warn)' : 'var(--phosphor)', textShadow: 'var(--glow)' }}>{glyph}</span> {label}
          </span>
          {src.url ? (
            <a data-testid="quote-window-source-url" href={src.url} target="_blank" rel="noopener noreferrer" title={src.url}
              style={{ color: 'var(--link)', textShadow: 'var(--glow)', textDecoration: 'none', borderBottom: '1px dashed currentColor' }}>
              source ↗
            </a>
          ) : null}
          {q.new_voice ? (
            <span data-testid="quote-window-new-voice" title="a voice the palace had not heard before this quote" style={{
              color: 'var(--phosphor-white)', textShadow: 'var(--glow)', border: '1px solid var(--phosphor-dim)', padding: '0 6px',
              textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 10,
            }}>✦ new voice</span>
          ) : null}
          <span style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}>
            through{' '}
            <span
              data-testid="quote-window-lens"
              onClick={lensPath && onOpenEntry ? () => onOpenEntry(lensPath) : undefined}
              style={{
                color: lensPath ? 'var(--link)' : 'var(--phosphor-dim)',
                textShadow: lensPath ? 'var(--glow)' : 'none',
                borderBottom: lensPath ? '1px dashed currentColor' : '1px dotted currentColor',
                cursor: lensPath && onOpenEntry ? 'pointer' : 'default',
              }}
            >{q.lens}</span>
          </span>
        </div>
      </div>

      {/* the page under the glass */}
      <div style={{ borderTop: '1px solid var(--phosphor-dim)', padding: '12px 26px 18px' }}>
        <div style={ui.eyebrow}>a window into</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', alignItems: 'baseline', marginTop: 4 }}>
          <span
            data-testid="quote-window-title"
            onClick={q.target_path ? onStepThrough : undefined}
            style={{
              fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '.02em',
              color: 'var(--phosphor-white)', textShadow: 'var(--glow-strong)',
              cursor: q.target_path ? 'pointer' : 'default',
              borderBottom: q.target_path ? '1px dashed var(--phosphor-dim)' : 'none',
            }}
            title={q.target_path ? 'step through into the page' : 'this page could not be found'}
          >{q.target}</span>
          {q.target_type ? (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em',
              color: typeColor(q.target_type), textShadow: 'var(--glow)', border: `1px solid ${typeColor(q.target_type)}`, padding: '0 6px',
            }}>{q.target_type}</span>
          ) : null}
          {q.target_stage ? <StageGlyph stage={q.target_stage} /> : null}
          {(q.target_pillars || []).length ? (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--phosphor-dim)', textShadow: 'none', letterSpacing: '.04em' }}>
              {q.target_pillars.join(' · ')}
            </span>
          ) : null}
        </div>

        {q.anchor?.found ? (
          <div style={{ marginTop: 10 }}>
            {q.anchor.heading ? <div style={{ ...ui.eyebrow, color: 'var(--phosphor)', textShadow: 'var(--glow)' }}>§ {q.anchor.heading}</div> : null}
            <div data-testid="quote-window-excerpt" style={{
              marginTop: 4, fontSize: 13.5, lineHeight: 1.55, color: 'var(--phosphor)', textShadow: 'var(--glow)', opacity: 0.9,
            }}>
              <Lit text={q.anchor.excerpt} near={q.near} />
            </div>
          </div>
        ) : (
          <div data-testid="quote-window-moved" style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--warn)', textShadow: 'none' }}>
            laid beside “{q.near}” — those words are no longer on the page
          </div>
        )}

        {q.why ? (
          <div data-testid="quote-window-why" style={{ marginTop: 10, fontSize: 13, lineHeight: 1.55, fontStyle: 'italic', color: 'var(--phosphor)', textShadow: 'none', opacity: 0.85 }}>
            {q.why}
          </div>
        ) : null}

        <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <span
            data-testid="quote-step-through"
            role="button"
            tabIndex={0}
            aria-label="step through the window"
            onClick={q.target_path ? onStepThrough : undefined}
            style={{
              cursor: q.target_path ? 'pointer' : 'not-allowed', opacity: q.target_path ? 1 : 0.4,
              color: 'var(--phosphor)', textShadow: 'var(--glow)',
              border: '1px solid var(--phosphor)', padding: '3px 10px',
              textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 12, fontFamily: 'var(--font-mono)',
            }}
          >
            {ui.key('↵')}&nbsp;step through the window
          </span>
          {q.drift ? (
            <span data-testid="quote-window-drift" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--warn)', textShadow: 'none' }}>
              ◐ the words here have moved since this was placed
            </span>
          ) : null}
          <span style={{ marginLeft: 'auto' }}>
            <QuoteDecide quote={q} onDecide={onDecide} busy={deciding} showKeys />
          </span>
        </div>
        {lastDecision ? (
          <div data-testid="quote-window-decided" style={{ marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: lastDecision.error ? 'var(--warn)' : 'var(--phosphor-dim)', textShadow: 'none' }}>
            {lastDecision.error
              ? `${lastDecision.decision === 'keep' ? 'kept' : 'let go'} in the ledger — but not committed: ${lastDecision.error}`
              : `${lastDecision.decision === 'keep' ? 'kept' : 'let go'} · written to the ledger${lastDecision.committed ? ' and committed' : ''}`}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// The excerpt with the `near` phrase lit — found case-insensitively on the
// flattened text; when markdown in the page keeps it from matching, the
// excerpt shows unlit rather than wrong.
function Lit({ text, near }) {
  const flat = String(text || '');
  const n = String(near || '');
  const at = n ? flat.toLowerCase().indexOf(n.toLowerCase()) : -1;
  if (at === -1) return <>{flat}</>;
  return (
    <>
      {flat.slice(0, at)}
      <span style={{ color: 'var(--phosphor-white)', textShadow: 'var(--glow-strong)', borderBottom: '1px solid var(--phosphor-dim)' }}>{flat.slice(at, at + n.length)}</span>
      {flat.slice(at + n.length)}
    </>
  );
}

function WhereThisLeads({ neighbors, onPick, onAnother }) {
  const groups = [
    { key: 'samePage', label: 'more on this page', list: neighbors.samePage },
    { key: 'sameLens', label: 'through the same lens', list: neighbors.sameLens },
    { key: 'linked', label: 'on linked pages', list: neighbors.linked },
  ].filter((g) => g.list.length > 0);
  return (
    <div data-testid="quotes-leads" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', alignItems: 'baseline' }}>
        <span style={ui.eyebrow}>where this leads</span>
        <span
          data-testid="quotes-another"
          role="button"
          tabIndex={0}
          aria-label="another quote, at random"
          onClick={onAnother}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onAnother(); } }}
          style={{
            cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase',
            color: 'var(--phosphor)', textShadow: 'var(--glow)', border: '1px solid var(--phosphor-dim)', padding: '0 7px',
          }}
        >{ui.key('n')}&nbsp;another, at random</span>
      </div>
      {groups.length === 0 ? (
        <div style={{ marginTop: 6, fontSize: 12, color: 'var(--phosphor-dim)', textShadow: 'none' }}>
          nowhere yet by quote — this page's neighbors carry no quotes. Draw another, or step through.
        </div>
      ) : groups.map((g) => (
        <div key={g.key} data-testid={`quotes-leads-${g.key}`} style={{ marginTop: 8 }}>
          <div style={{ ...ui.eyebrow, fontSize: 9 }}>{g.label} · {g.list.length}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 3 }}>
            {g.list.slice(0, 6).map((q) => (
              <span
                key={q.id}
                data-testid="quotes-lead"
                role="button"
                tabIndex={0}
                aria-label={`go to the quote on ${q.target}`}
                onClick={() => onPick(q.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onPick(q.id); } }}
                title={q.quote}
                style={{
                  cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.4,
                  color: 'var(--phosphor)', textShadow: 'var(--glow)',
                }}
              >
                <span style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}>{fidelityGlyph(q.fidelity, q.checked)} </span>
                “{shortQuote(q)}”
                <span style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}> — {q.attribution}</span>
                {g.key !== 'samePage' ? <span style={{ color: 'var(--link)', textShadow: 'var(--glow)' }}> · {q.target}</span> : null}
              </span>
            ))}
            {g.list.length > 6 ? <span style={{ fontSize: 11, color: 'var(--phosphor-dim)', textShadow: 'none' }}>… and {g.list.length - 6} more</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
