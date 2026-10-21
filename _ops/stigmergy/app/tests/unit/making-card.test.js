// MakingCard renders a made thing the way the Trickster card did; in node (no
// IntersectionObserver) LazyMount renders its children at once.
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import MakingCard from '../../src/components/projects/MakingCard.jsx';

const spec = {
  id: 'torus-steward-023', heading: '2026-10-13 — cycle 10 — The dead line has a voice', fromMessage: true,
  headline: 'The dead line has a voice.', ground: 'recovered · Penrose sings', catchup: 'A synthesizer on a torus.',
  prose: 'What I built. A hand.', payload: { equations: [{ label: 'het', symbolic: 'y ← W(x, y)', worded: 'out gets surface' }], table: { caption: 'slip', columns: ['K', 'Hz'], rows: [['0', '16.5']] } },
  artifacts: { light: [{ path: 'Projects/T/a.png', caption: 'a picture' }], heavy: [{ path: 'Projects/T/b.html', caption: 'the instrument' }] },
  leftRough: 'Membrane silent', nextMoves: ['read the loudest row'],
  options: [{ id: 'A', label: 'A — yes' }, { id: 'B', label: 'B — no' }], decision: { option: 'A — yes', notes: 'go', ts: '2026-10-13T20:00:00Z' }, footer: 'torus-steward-023 · BROADCAST on GENERAL',
};

describe('MakingCard', () => {
  it('plays a message-backed section as a card: headline, ground, prose, equation, table, media, decision', () => {
    const html = renderToStaticMarkup(React.createElement(MakingCard, { spec }));
    expect(html).toContain('data-card="message"');
    expect(html).toContain('The dead line has a voice.');
    expect(html).toContain('recovered · Penrose sings');
    expect(html).toContain('data-testid="equation-block"');
    expect(html).toContain('data-testid="table-block"');
    expect(html).toContain('data-testid="artifact-slot"');         // the light one mounts
    expect(html).toContain('data-testid="heavy-artifact"');         // the heavy one plays in place,
    // No click: the same slot a TRICKSTER card draws, asking /api/piece how to
    // frame the page on the piece origin (the first render, before it answers).
    expect(html).toContain('data-testid="artifact-piece-pending"');
    expect(html).not.toContain('play it here');
    expect(html).toContain('Membrane silent');
    expect(html).toContain('data-chosen="true"');
    expect(html).toContain('you answered');
    expect(html).toContain('go');
  });
  it('falls back to prose for a section with no message', () => {
    const html = renderToStaticMarkup(React.createElement(MakingCard, { spec: { id: 'x', heading: 'h', fromMessage: false, prose: 'plain **text**', artifacts: { light: [], heavy: [] }, footer: null } }));
    expect(html).toContain('data-card="prose"');
    expect(html).toContain('text');
  });
  it('a heavy artifact sits in a lazy mount of its own, apart from the light ones', () => {
    const html = renderToStaticMarkup(React.createElement(MakingCard, { spec: { id: 'y', heading: 'h', fromMessage: false, prose: 'p', artifacts: { light: [], heavy: [{ path: 'Dissolutions/proofs/x/one-curve.html', caption: null }] }, footer: null } }));
    const at = html.indexOf('data-testid="heavy-artifact"');
    expect(at).toBeGreaterThan(-1);
    expect(html.indexOf('data-testid="lazy-mount"', at)).toBeGreaterThan(at);  // its own mount, inside the card's
    expect(html).toContain('data-path="Dissolutions/proofs/x/one-curve.html"');
  });
});
