// The pure half of the QUOTES lens: the random draw, where a quote leads, the
// trail. The server has anchored every quote; these only move between them.

import { describe, it, expect } from 'vitest';
import {
  activeQuotes, pickRandom, neighborsOf, linkedTitles, quotesForEntry, pushTrail, tally, shortQuote,
} from '../../src/lib/quote-walk.js';

const Q = (id, target, lens, extra = {}) => ({
  id, target, lens, quote: `quote ${id}`, attribution: 'A', fidelity: 'verbatim', checked: 'web',
  target_path: `${target}.md`, status: 'placed', ...extra,
});

const quotes = [
  Q('a1', 'Alpha', 'Spinoza Conatus'),
  Q('a2', 'Alpha', 'Stoicism'),
  Q('b1', 'Beta', 'Spinoza Conatus'),
  Q('c1', 'Gamma', 'Deleuze'),
  Q('r1', 'Alpha', 'Deleuze', { status: 'retired' }),
];

const topology = {
  nodes: [{ id: 'Alpha', path: 'Alpha.md' }, { id: 'Beta', path: 'Beta.md' }, { id: 'Gamma', path: 'Gamma.md' }],
  edges: [{ source: 'Alpha', target: 'Gamma', type: 'mirrors' }, { source: 'Beta', target: 'Alpha', type: 'deepens' }],
};

describe('activeQuotes', () => {
  it('drops retired quotes and tolerates junk', () => {
    expect(activeQuotes(quotes).map((q) => q.id)).toEqual(['a1', 'a2', 'b1', 'c1']);
    expect(activeQuotes(null)).toEqual([]);
  });
});

describe('pickRandom', () => {
  it('draws from the active pool and never the one being shown when there is a choice', () => {
    const rng = () => 0; // always the first candidate
    expect(pickRandom(quotes, { rng }).id).toBe('a1');
    expect(pickRandom(quotes, { excludeId: 'a1', rng }).id).toBe('a2');
    expect(pickRandom([quotes[0]], { excludeId: 'a1', rng }).id).toBe('a1'); // the only one left
    expect(pickRandom([], { rng })).toBe(null);
  });
  it('never indexes past the end on rng() === 1', () => {
    expect(pickRandom(quotes, { rng: () => 1 })).toBeTruthy();
  });
});

describe('linkedTitles + neighborsOf', () => {
  it('reads both directions of the typed-link graph', () => {
    expect([...linkedTitles('Alpha', topology)].sort()).toEqual(['Beta', 'Gamma']);
    expect(linkedTitles('Alpha', null).size).toBe(0);
  });
  it('splits where a quote leads into same page / same lens / linked pages, each quote once', () => {
    const n = neighborsOf(quotes[0], quotes, topology);
    expect(n.samePage.map((q) => q.id)).toEqual(['a2']);   // r1 is retired
    expect(n.sameLens.map((q) => q.id)).toEqual(['b1']);   // same lens, other page
    expect(n.linked.map((q) => q.id)).toEqual(['c1']);     // Alpha → Gamma; b1 (Beta → Alpha) already shown under same lens
    expect(neighborsOf(null, quotes, topology)).toEqual({ samePage: [], sameLens: [], linked: [] });
  });
});

describe('quotesForEntry', () => {
  it('narrows to one page by path', () => {
    expect(quotesForEntry(quotes, 'Alpha.md').map((q) => q.id)).toEqual(['a1', 'a2']);
    expect(quotesForEntry(quotes, null)).toEqual([]);
  });
});

describe('pushTrail', () => {
  it('appends without an immediate repeat and bounds the length', () => {
    expect(pushTrail([], 'a1')).toEqual(['a1']);
    expect(pushTrail(['a1'], 'a1')).toEqual(['a1']);
    expect(pushTrail(['a1'], 'b1')).toEqual(['a1', 'b1']);
    const long = pushTrail(Array.from({ length: 24 }, (_, i) => `q${i}`), 'z', { max: 24 });
    expect(long).toHaveLength(24);
    expect(long[23]).toBe('z');
    expect(long[0]).toBe('q1');
  });
});

describe('tally + shortQuote', () => {
  it('counts lenses and pages over active quotes, most first', () => {
    const t = tally(quotes);
    expect(t.lenses[0]).toEqual({ name: 'Spinoza Conatus', count: 2 });
    expect(t.pages[0]).toEqual({ name: 'Alpha', count: 2 });
    expect(t.lenses.find((l) => l.name === 'Deleuze').count).toBe(1); // the retired one is not counted
  });
  it('shortens a long quote on one line with an ellipsis', () => {
    expect(shortQuote({ quote: 'short' })).toBe('short');
    const s = shortQuote({ quote: 'a '.repeat(80) }, 20);
    expect(s.length).toBeLessThanOrEqual(20);
    expect(s.endsWith('…')).toBe(true);
  });
});
