// The typed-links frame (2026-10-18). Loudon: "I often can't read the second
// column in the typed links frame." A link's label ran 18 characters at the
// median and 48 at most, and a 14ch column cut it with an ellipsis in the
// dimmest green. Now each row reads as a statement, "Connects to Hyperdimensional
// Prism", and the label runs beneath the whole statement, in italics, whole and
// wrapping ("[Mirrors]->[Entry] and then the next line below (description) in
// italics"; "it can just read like a statement"; "the label can have more space
// and go under the entire 'connects to' as well as the destination page").
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import TypedLinkPanel, { typeAsWords } from '../../src/components/state/TypedLinkPanel.jsx';

const render = (links) => renderToStaticMarkup(React.createElement(TypedLinkPanel, {
  links,
  index: new Map([['Hyperdimensional Prism', 'Hyperdimensional Prism.md'], ['Dispersion Table', 'Dispersion Table.md']]),
}));

describe('the typed-links frame', () => {
  it('shows a long label whole, never cut to a column with an ellipsis', () => {
    const html = render([{ type: 'couples-with', label: '2nd-order-linear-with-periodic-coefficient', target: 'Dispersion Table' }]);
    expect(html).toContain('data-testid="typed-link-label"');
    expect(html).toContain('>2nd-order-linear-with-periodic-coefficient<');
    expect(html).not.toContain('text-overflow:ellipsis');
    expect(html).toContain('overflow-wrap:anywhere');
  });

  it('draws the label in the readable green, not the dim one', () => {
    const html = render([{ type: 'mirrors', label: 'higher-dimensional-unity', target: 'Hyperdimensional Prism' }]);
    const label = html.slice(html.indexOf('data-testid="typed-link-label"'));
    expect(label.slice(0, label.indexOf('>'))).toContain('color:var(--phosphor)');
  });

  it('puts the target beside the type and the label beneath it, and leaves no placeholder when there is no label', () => {
    const html = render([
      { type: 'mirrors', label: 'higher-dimensional-unity', target: 'Hyperdimensional Prism' },
      { type: 'connects-to', target: 'Not Yet Written' },
    ]);
    expect(html.indexOf('>Hyperdimensional Prism<')).toBeLessThan(html.indexOf('higher-dimensional-unity'));
    expect(html.match(/data-testid="typed-link-label"/g)).toHaveLength(1);
    expect(html).toContain('title="no page by this name yet"');
    expect(html).not.toContain('>--<');
  });

  it('reads as a statement: the type in words, then the target, with no arrow', () => {
    expect(['mirrors', 'connects-to', 'emerged-from', 'couples-with', 'member-of'].map(typeAsWords))
      .toEqual(['Mirrors', 'Connects to', 'Emerged from', 'Couples with', 'Member of']);
    const html = render([{ type: 'connects-to', target: 'Hyperdimensional Prism' }]);
    expect(html).toContain('data-type="connects-to"');
    expect(html).toContain('>Connects to<');
    expect(html).toContain('>Hyperdimensional Prism<');
    expect(html).not.toContain('-&gt;');
    expect(html).not.toContain('??');
    expect(html).not.toContain('text-transform:uppercase');
  });

  it('is no table: the statement is one line, and the label runs under all of it', () => {
    const html = render([{ type: 'emerged-from', label: 'representation-dissolves-discontinuity', target: 'Dispersion Table' }]);
    expect(html).not.toContain('grid-template-columns');
    const row = html.slice(html.indexOf('data-testid="typed-link-row"'));
    // The label is a direct child of the row, after the statement line, not nested beside the target.
    const line = row.indexOf('data-testid="typed-link-type"');
    const label = row.indexOf('data-testid="typed-link-label"');
    expect(line).toBeLessThan(label);
    expect(row.slice(line, label)).toMatch(/Emerged from<\/span> <span[^>]*>Dispersion Table<\/span>(<small[\s\S]*?<\/small>)?<\/div><div/);
  });
});
