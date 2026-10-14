import React, { useState } from 'react';
import QuoteDecide from './QuoteDecide.jsx';
import { fidelityGlyph, fidelityLabel } from '../../lib/quote-walk.js';

// A quote Palace Quotes laid beside a paragraph — a textbook callout: a box
// floated to the right of the paragraph its `near` phrase lives in, the
// page's words flowing around it (EntryBody renders it just before that
// block, so the float wraps). The page's own words stay untouched.
//
// The mark is the CP437 half-block quotation mark, lit, and the quote beside
// it in the body face; who said it beneath, right-aligned, with the fidelity
// glyph. A short moment on the page, not its focus (Loudon, 2026-10-13):
// closed, that is all. Click the box to open the rest — where the line is
// from, the lens, [→] walk from here, the why, the keep / let-go chips — which
// stack inside the same box so the words keep flowing. It opens on its own
// only when the URL names it (the reader stepped through from the QUOTES
// lens) or when its phrase has left the page and that needs saying. The
// float, and its fall-back to full width on a phone, is `.quote-callout` in
// tokens.css. `moved` marks are listed at the page's end, not floated.

const OPEN_MARK = ' ▄▀ ▄▀\n ██ ██\n ▀▀ ▀▀';

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
  const glyphColor = glyph === '◇' ? 'var(--warn)' : 'var(--phosphor-dim)';

  return (
    <aside
      id={`quote-${quote.id}`}
      className={moved ? 'quote-callout quote-callout--moved' : 'quote-callout'}
      data-testid="quote-mark"
      data-quote-id={quote.id}
      data-lit={lit ? '1' : '0'}
      data-moved={moved ? '1' : '0'}
      data-open={open ? '1' : '0'}
      style={{
        background: lit ? 'color-mix(in srgb, var(--phosphor) 8%, transparent)' : 'transparent',
        boxShadow: lit ? 'inset -2px 0 0 var(--phosphor-dim)' : 'none',
        transition: 'background var(--dur-fade) linear',
      }}
    >
      {/* the callout a reader meets: the mark, the quote, who said it. The
          whole box is the toggle. */}
      <div
        data-testid="quote-mark-line"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={open ? 'close the quote' : 'open the quote'}
        onClick={toggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
        title={open ? 'close' : 'open — the lens, the walk, the why'}
        style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}
      >
        <pre aria-hidden="true" style={{
          margin: 0, flex: '0 0 auto',
          fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.05, letterSpacing: 0,
          color: 'var(--phosphor)', textShadow: 'var(--glow)',
        }}>{OPEN_MARK}</pre>
        <div style={{ flex: '1 1 auto', minWidth: 0, textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 13.5, lineHeight: 1.5,
            color: open ? 'var(--phosphor-white)' : 'var(--phosphor)', textShadow: open ? 'var(--glow)' : 'none',
          }}>
            {quote.quote}<span style={{ color: 'var(--phosphor-dim)', textShadow: 'none' }}>”</span>
          </div>
          <div style={{ ...mono, marginTop: 2, color: 'var(--phosphor-dim)', textShadow: 'none' }}>
            — <span style={{ color: 'var(--phosphor)', textShadow: 'var(--glow)', textTransform: 'uppercase' }}>{quote.attribution}</span>
            {' '}<span style={{ color: glyphColor }}>{glyph}</span>
            {' '}<span aria-hidden="true">[{open ? '−' : '+'}]</span>
          </div>
        </div>
      </div>

      {open ? (
        <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px dotted var(--phosphor-dim)' }}>
          <div style={{ ...mono, display: 'flex', flexWrap: 'wrap', gap: '4px 12px', alignItems: 'baseline', color: 'var(--phosphor-dim)', textShadow: 'none' }}>
            {sourceBits.length ? <span>{sourceBits.join(' · ')}</span> : null}
            <span title={label} data-testid="quote-fidelity" data-glyph={glyph}>
              <span style={{ color: glyph === '◇' ? 'var(--warn)' : 'var(--phosphor)', textShadow: 'var(--glow)' }}>{glyph}</span> {label}
            </span>
            {src.url ? (
              <a data-testid="quote-source-url" href={src.url} target="_blank" rel="noopener noreferrer" title={src.url}
                style={{ color: 'var(--link)', textShadow: 'var(--glow)', textDecoration: 'none', borderBottom: '1px dashed currentColor' }}>
                source ↗
              </a>
            ) : null}
            {quote.new_voice ? (
              <span data-testid="quote-new-voice" title="a voice the palace had not heard before this quote" style={{
                color: 'var(--phosphor-white)', textShadow: 'var(--glow)', border: '1px solid var(--phosphor-dim)', padding: '0 6px',
                textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 10,
              }}>✦ new voice</span>
            ) : null}
          </div>
          <div style={{ ...mono, marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: '4px 12px', alignItems: 'baseline' }}>
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
              marginTop: 6, fontSize: 12.5, lineHeight: 1.5, fontStyle: 'italic',
              color: 'var(--phosphor)', textShadow: 'none', opacity: 0.85,
            }}>{quote.why}</div>
          ) : null}
          {moved ? (
            <div style={{ marginTop: 5, ...mono, color: 'var(--warn)', textShadow: 'none' }}>
              laid beside “{quote.near}” — those words are no longer on this page
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
