import React, { useState } from 'react';
import QuoteDecide from './QuoteDecide.jsx';
import { fidelityGlyph, fidelityLabel } from '../../lib/quote-walk.js';

// A quote Palace Quotes laid beside a paragraph — rendered right after the
// block its `near` phrase lives in (EntryBody). The page's own words stay
// untouched; this is a mark in the margin, in the register of the graffiti
// scrawl and the typed-link rail: phosphor, a thin left rule, no new color.
//
// A short moment on the page, not its focus (Loudon, 2026-10-13): closed, the
// mark is one line — the quote and who said it. Click it to open the rest:
// where the line is from, the lens it was read through, [→] walk from here,
// the why, and the keep / let-go chips. It opens on its own only when the
// URL names it (?quote=<id>: the reader arrived here through the lens, and
// wants the window), or when its phrase has left the page and it needs saying.

export default function QuoteMark({
  quote, lensPath = null, onNavigate, onWalk, onDecide = null, lit = false, moved = false, open: openProp = null,
}) {
  const [opened, setOpened] = useState(null); // null = not yet touched; the default below decides
  if (!quote) return null;
  const open = opened !== null ? opened : (openProp !== null ? openProp : (lit || moved));
  const toggle = () => setOpened(!open);
  const glyph = fidelityGlyph(quote.fidelity, quote.checked);
  const label = fidelityLabel(quote.fidelity, quote.checked);
  const src = quote.source || {};
  const sourceBits = [src.work, src.locus, src.translator ? `tr. ${src.translator}` : null].filter(Boolean);
  const lensKnown = !!lensPath;
  const mono = { fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.04em' };

  return (
    <aside
      id={`quote-${quote.id}`}
      data-testid="quote-mark"
      data-quote-id={quote.id}
      data-lit={lit ? '1' : '0'}
      data-moved={moved ? '1' : '0'}
      data-open={open ? '1' : '0'}
      style={{
        margin: open ? '10px 0 16px' : '6px 0 10px',
        padding: open ? '8px 14px 8px 16px' : '3px 12px 3px 14px',
        maxWidth: '100%',
        borderLeft: open ? `3px double ${lit ? 'var(--phosphor)' : 'var(--phosphor-dim)'}` : '2px solid var(--phosphor-dim)',
        background: lit ? 'color-mix(in srgb, var(--phosphor) 8%, transparent)' : 'transparent',
        boxShadow: lit ? 'inset 2px 0 0 var(--phosphor-dim)' : 'none',
        transition: 'background var(--dur-fade) linear',
      }}
    >
      {/* the one line a reader meets: the quote, who said it, the glyph, and a
          toggle. The whole row is the toggle. */}
      <div
        data-testid="quote-mark-line"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={open ? 'close the quote' : 'open the quote'}
        onClick={toggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
        title={open ? 'close' : 'open — the lens, the walk, the why'}
        style={{ cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'baseline', userSelect: 'none' }}
      >
        <span style={{
          flex: '1 1 auto', minWidth: 0,
          fontFamily: 'var(--font-body)', fontSize: open ? 15 : 13.5, lineHeight: 1.5,
          color: open ? 'var(--phosphor-white)' : 'var(--phosphor)', textShadow: open ? 'var(--glow)' : 'none',
        }}>
          <span style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}>“</span>
          {quote.quote}
          <span style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}>”</span>
          {!open ? (
            <span style={{ ...mono, color: 'var(--phosphor-dim)', textShadow: 'none', marginLeft: 8, whiteSpace: 'nowrap' }}>
              — {quote.attribution} <span style={{ color: glyph === '◇' ? 'var(--warn)' : 'var(--phosphor-dim)' }}>{glyph}</span>
            </span>
          ) : null}
        </span>
        <span aria-hidden="true" style={{ ...mono, flex: '0 0 auto', color: 'var(--phosphor-dim)', textShadow: 'none' }}>
          [{open ? '−' : '+'}]
        </span>
      </div>

      {open ? (
        <>
          <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: '4px 14px', alignItems: 'baseline', ...mono, color: 'var(--phosphor-dim)', textShadow: 'none' }}>
            <span>
              <span style={{ color: 'var(--phosphor)', textShadow: 'var(--glow)', textTransform: 'uppercase' }}>— {quote.attribution}</span>
              {sourceBits.length ? <span> · {sourceBits.join(' · ')}</span> : null}
            </span>
            <span title={label} data-testid="quote-fidelity" data-glyph={glyph}>
              <span style={{ color: glyph === '◇' ? 'var(--warn)' : 'var(--phosphor)', textShadow: 'var(--glow)' }}>{glyph}</span> {label}
            </span>
          </div>
          <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: '4px 12px', alignItems: 'baseline', ...mono }}>
            <span style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}>
              through{' '}
              <span
                data-testid="quote-lens"
                onClick={lensKnown && onNavigate ? () => onNavigate(lensPath) : undefined}
                title={lensKnown ? `open ${quote.lens}` : `${quote.lens} (no page found)`}
                style={{
                  color: lensKnown ? 'var(--link)' : 'var(--phosphor-dim)',
                  textShadow: lensKnown ? 'var(--glow)' : 'none',
                  borderBottom: lensKnown ? '1px dashed currentColor' : '1px dotted currentColor',
                  cursor: lensKnown && onNavigate ? 'pointer' : 'default',
                }}
              >{quote.lens}</span>
            </span>
            {onWalk ? (
              <span
                data-testid="quote-walk"
                role="button"
                tabIndex={0}
                aria-label="walk from here"
                onClick={() => onWalk(quote.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onWalk(quote.id); } }}
                title="open the QUOTES lens here and walk on from this quote"
                style={{
                  cursor: 'pointer', color: 'var(--phosphor)', textShadow: 'var(--glow)',
                  border: '1px solid var(--phosphor-dim)', padding: '0 6px',
                  textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 10,
                }}
              >
                [<b style={{ color: 'var(--phosphor-white)' }}>→</b>]&nbsp;walk from here
              </span>
            ) : null}
            {quote.drift ? (
              <span data-testid="quote-drift" title="the section's words have changed since this quote was placed" style={{ color: 'var(--warn)', textShadow: 'none' }}>
                ◐ the words here have moved since this was placed
              </span>
            ) : null}
            <QuoteDecide quote={quote} onDecide={onDecide} />
          </div>
          {quote.why ? (
            <div style={{
              marginTop: 5, fontSize: 12.5, lineHeight: 1.5, fontStyle: 'italic',
              color: 'var(--phosphor)', textShadow: 'none', opacity: 0.85,
            }}>{quote.why}</div>
          ) : null}
          {moved ? (
            <div style={{ marginTop: 5, ...mono, color: 'var(--warn)', textShadow: 'none' }}>
              laid beside “{quote.near}” — those words are no longer on this page
            </div>
          ) : null}
        </>
      ) : null}
    </aside>
  );
}
