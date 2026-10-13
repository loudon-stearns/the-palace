// Render tests for the QUOTES lens and the on-page quote mark. renderToStaticMarkup
// runs each once with no effects, so the lens asserts its loading state and the
// mark asserts the full static shape: quote, attribution, fidelity glyph, lens
// chip, why, walk affordance, and the moved / lit variants.

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import QuotesLens from '../../src/components/state/QuotesLens.jsx';
import QuoteMark from '../../src/components/state/QuoteMark.jsx';
import EntryBody from '../../src/components/state/EntryBody.jsx';

const quote = {
  id: 'q-1',
  quote: 'The many become one, and are increased by one.',
  attribution: 'Whitehead',
  source: { kind: 'tradition', work: 'Process and Reality', locus: 'p. 21' },
  fidelity: 'verbatim',
  checked: 'web',
  lens: 'Whitehead',
  lens_path: 'Whitehead.md',
  target: 'STIGMERGY',
  target_path: 'STIGMERGY.md',
  near: 'Work is not real until it lands in LOG',
  why: 'A commit is an actual occasion.',
  status: 'placed',
};

describe('QuotesLens', () => {
  it('renders its loading state before the ledger arrives', () => {
    const html = renderToStaticMarkup(React.createElement(QuotesLens, { quoteId: null }));
    expect(html).toContain('data-testid="quotes-lens"');
    expect(html).toContain('reading the quotes ledger');
  });
});

describe('QuoteMark', () => {
  it('shows the quote, who said it, the glyph, the lens and the why', () => {
    const html = renderToStaticMarkup(React.createElement(QuoteMark, { quote, lensPath: 'Whitehead.md', onWalk: () => {} }));
    expect(html).toContain('data-testid="quote-mark"');
    expect(html).toContain('id="quote-q-1"');
    expect(html).toContain('The many become one');
    expect(html).toContain('Whitehead');
    expect(html).toContain('Process and Reality');
    expect(html).toContain('data-glyph="◉"');
    expect(html).toContain('verbatim · checked on the web');
    expect(html).toContain('data-testid="quote-lens"');
    expect(html).toContain('data-testid="quote-walk"');
    expect(html).toContain('A commit is an actual occasion.');
    expect(html).toContain('data-lit="0"');
  });
  it('offers keep and let go on a placed quote, and shows a kept one as kept', () => {
    const placed = renderToStaticMarkup(React.createElement(QuoteMark, { quote, onDecide: () => {} }));
    expect(placed).toContain('data-testid="quote-decide"');
    expect(placed).toContain('data-status="placed"');
    expect(placed).toContain('awaiting your read');
    expect(placed).toContain('data-testid="quote-keep"');
    expect(placed).toContain('data-testid="quote-retire"');
    const kept = renderToStaticMarkup(React.createElement(QuoteMark, { quote: { ...quote, status: 'kept', kept_at: '2026-10-13T10:00:00Z' }, onDecide: () => {} }));
    expect(kept).toContain('◆ kept · 2026-10-13');
    expect(kept).not.toContain('data-testid="quote-keep"');
    expect(kept).toContain('data-testid="quote-retire"');
    const silent = renderToStaticMarkup(React.createElement(QuoteMark, { quote }));
    expect(silent).not.toContain('data-testid="quote-decide"'); // no onDecide → nothing to decide with
  });
  it('marks an unconfirmed quote with ◇ and a moved quote with its lost phrase', () => {
    const html = renderToStaticMarkup(React.createElement(QuoteMark, {
      quote: { ...quote, fidelity: 'paraphrase', checked: 'recalled' }, moved: true, lit: true,
    }));
    expect(html).toContain('data-glyph="◇"');
    expect(html).toContain('from memory');
    expect(html).toContain('data-moved="1"');
    expect(html).toContain('no longer on this page');
    expect(html).toContain('data-lit="1"');
    expect(html).not.toContain('data-testid="quote-walk"'); // no onWalk given
  });
});

describe('EntryBody lays quotes', () => {
  const body = '# STIGMERGY\n\nIntro paragraph.\n\n## The honesty discipline\n\nWork is not real until it lands in LOG — until git proves it.\n\nAnother paragraph.\n';
  it('places a mark right after the paragraph its near phrase lives in', () => {
    const html = renderToStaticMarkup(React.createElement(EntryBody, { body, index: new Map(), quotes: [quote] }));
    const para = html.indexOf('until git proves it');
    const mark = html.indexOf('data-testid="quote-mark"');
    const next = html.indexOf('Another paragraph.');
    expect(para).toBeGreaterThan(-1);
    expect(mark).toBeGreaterThan(para);
    expect(next).toBeGreaterThan(mark);
    expect(html).not.toContain('data-testid="quotes-moved"');
  });
  it('lists a quote whose phrase has left the page under "moved"', () => {
    const html = renderToStaticMarkup(React.createElement(EntryBody, {
      body, index: new Map(), quotes: [{ ...quote, near: 'words that are gone' }],
    }));
    expect(html).toContain('data-testid="quotes-moved"');
    expect(html).toContain('data-moved="1"');
  });
  it('never anchors to a heading and skips retired quotes', () => {
    const html = renderToStaticMarkup(React.createElement(EntryBody, {
      body, index: new Map(), quotes: [{ ...quote, near: 'The honesty discipline' }, { ...quote, id: 'q-2', status: 'retired' }],
    }));
    expect(html).toContain('data-testid="quotes-moved"'); // the heading match counts as moved
    expect(html).not.toContain('id="quote-q-2"');
  });
});
