import React from 'react';
import QuoteDecide from './QuoteDecide.jsx';
import { fidelityGlyph, fidelityLabel } from '../../lib/quote-walk.js';

// A quote Palace Quotes laid beside a paragraph — rendered right after the
// block its `near` phrase lives in (EntryBody). The page's own words stay
// untouched; this is a mark in the margin, in the register of the graffiti
// scrawl and the typed-link rail: phosphor, a double left rule, no new color.
//
//   “the quote”
//   — WHO · work · locus     ◉ verbatim · checked on the web
//   through [Lens page]  ·  [→] walk from here
//   why it is here (dim, italic)
//
// `lit` marks the quote the URL names (?quote=<id>): the reader scrolls to it
// and it carries a brighter wash, the way the companion's section glow does.

export default function QuoteMark({ quote, lensPath = null, onNavigate, onWalk, onDecide = null, lit = false, moved = false }) {
  if (!quote) return null;
  const glyph = fidelityGlyph(quote.fidelity, quote.checked);
  const label = fidelityLabel(quote.fidelity, quote.checked);
  const src = quote.source || {};
  const sourceBits = [src.work, src.locus, src.translator ? `tr. ${src.translator}` : null].filter(Boolean);
  const lensKnown = !!lensPath;

  return (
    <aside
      id={`quote-${quote.id}`}
      data-testid="quote-mark"
      data-quote-id={quote.id}
      data-lit={lit ? '1' : '0'}
      data-moved={moved ? '1' : '0'}
      style={{
        margin: '10px 0 16px', padding: '8px 14px 8px 16px', maxWidth: '100%',
        borderLeft: `3px double ${lit ? 'var(--phosphor)' : 'var(--phosphor-dim)'}`,
        background: lit ? 'color-mix(in srgb, var(--phosphor) 8%, transparent)' : 'transparent',
        boxShadow: lit ? 'inset 2px 0 0 var(--phosphor-dim)' : 'none',
        transition: 'background var(--dur-fade) linear',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.55,
        color: 'var(--phosphor-white)', textShadow: 'var(--glow)',
      }}>
        <span style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}>“</span>
        {quote.quote}
        <span style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}>”</span>
      </div>
      <div style={{
        marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: '4px 14px', alignItems: 'baseline',
        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.04em',
        color: 'var(--phosphor-dim)', textShadow: 'none',
      }}>
        <span>
          <span style={{ color: 'var(--phosphor)', textShadow: 'var(--glow)', textTransform: 'uppercase' }}>— {quote.attribution}</span>
          {sourceBits.length ? <span> · {sourceBits.join(' · ')}</span> : null}
        </span>
        <span title={label} data-testid="quote-fidelity" data-glyph={glyph}>
          <span style={{ color: glyph === '◇' ? 'var(--warn)' : 'var(--phosphor)', textShadow: 'var(--glow)' }}>{glyph}</span> {label}
        </span>
      </div>
      <div style={{
        marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: '4px 12px', alignItems: 'baseline',
        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.04em',
      }}>
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
        <div style={{ marginTop: 5, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--warn)', textShadow: 'none' }}>
          laid beside “{quote.near}” — those words are no longer on this page
        </div>
      ) : null}
    </aside>
  );
}
