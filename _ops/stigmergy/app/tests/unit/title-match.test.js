import { describe, it, expect } from 'vitest';
import { rankTitles, splitMatch } from '../../src/lib/title-match.js';

const TITLES = [
  '1 from 2',
  'Baton Ceremony',
  'Kuramoto Coupling',
  'Palace Conatus',
  'Palace Quotes',
  'Spinoza Conatus',
  'The Palace Voice',
  'Unpalaced',
];

describe('rankTitles', () => {
  it('matches nothing on an empty query', () => {
    expect(rankTitles(TITLES, '')).toEqual({ hits: [], total: 0 });
    expect(rankTitles(TITLES, '   ')).toEqual({ hits: [], total: 0 });
  });

  it('ranks a title start, then a word start, then anywhere inside', () => {
    expect(rankTitles(TITLES, 'palace').hits).toEqual([
      'Palace Conatus', 'Palace Quotes', // title starts with it
      'The Palace Voice', // a word starts with it
      'Unpalaced', // buried inside a word
    ]);
  });

  it('ignores case and surrounding whitespace', () => {
    expect(rankTitles(TITLES, '  CONATUS ').hits).toEqual(['Palace Conatus', 'Spinoza Conatus']);
  });

  it('keeps the index order inside a tier', () => {
    expect(rankTitles(TITLES, 'o').hits.slice(0, 2)).toEqual(['1 from 2', 'Baton Ceremony']);
  });

  it('leaves out the excluded title (the page being read)', () => {
    expect(rankTitles(TITLES, 'palace', { exclude: 'Palace Quotes' }).hits).not.toContain('Palace Quotes');
  });

  it('caps the hits but reports the whole count', () => {
    const r = rankTitles(TITLES, 'a', { limit: 3 });
    expect(r.hits).toHaveLength(3);
    expect(r.total).toBe(7);
  });

  it('is empty when nothing matches', () => {
    expect(rankTitles(TITLES, 'zzz')).toEqual({ hits: [], total: 0 });
  });
});

describe('splitMatch', () => {
  it('splits around the first case-insensitive hit', () => {
    expect(splitMatch('The Palace Voice', 'palace')).toEqual(['The ', 'Palace', ' Voice']);
    expect(splitMatch('Palace Quotes', 'Pal')).toEqual(['', 'Pal', 'ace Quotes']);
  });

  it('keeps the whole title whole when there is no hit or no query', () => {
    expect(splitMatch('Palace Quotes', 'zzz')).toEqual(['Palace Quotes', '', '']);
    expect(splitMatch('Palace Quotes', '')).toEqual(['Palace Quotes', '', '']);
  });
});
