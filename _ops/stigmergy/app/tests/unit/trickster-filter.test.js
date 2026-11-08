// Unit tests for the [T] deck's search and filter (trickster-filter.js).

import { describe, it, expect } from 'vitest';
import {
  filterRequests, matchesQuery, showCounts, projectsOf, isFiltering,
} from '../../src/lib/trickster-filter.js';

const SHEPARD = {
  request_id: 'shep-1', from: 'Shepard Tone Synthesizer', blocking: true,
  headline: 'Swap the plan’s Max moves for the plugin?', ground: 'plugin installed and checked',
  recommended_option: { id: 'ADOPT' }, options: [{ id: 'ADOPT', label: 'ADOPT — swap them' }],
};
const SHOP = {
  request_id: 'shop-1', from: 'Shopkeeper',
  headline: 'The LightOnOCR-3 pod never answered — drop it?', ground: 'pod killed',
  recommended_option: null, options: [{ id: 'MAC', label: 'MAC-BOUND — a mac pass' }],
};
const SHOP_SESSION = {
  request_id: 'shop-2', from: 'Shopkeeper', kind: 'interactive_session',
  headline: 'Open a session on the pricing sheet?', recommended_option: { id: 'GO' },
};
const LIST = [SHEPARD, SHOP, SHOP_SESSION];

describe('matchesQuery', () => {
  it('matches any field, case-insensitively', () => {
    expect(matchesQuery(SHOP, 'lightonocr')).toBe(true);
    expect(matchesQuery(SHOP, 'shopkeeper')).toBe(true);
    expect(matchesQuery(SHOP, 'mac pass')).toBe(true); // option label
    expect(matchesQuery(SHOP, 'shop-1')).toBe(true);    // request id
  });
  it('needs every term, in any order', () => {
    expect(matchesQuery(SHEPARD, 'plugin shepard')).toBe(true);
    expect(matchesQuery(SHEPARD, 'plugin pod')).toBe(false);
  });
  it('an empty query matches everything', () => {
    expect(matchesQuery(SHOP, '   ')).toBe(true);
  });
});

describe('filterRequests', () => {
  it('no filters keeps the whole list, in order', () => {
    expect(filterRequests(LIST)).toEqual(LIST);
  });
  it('show: waiting keeps the blocking cards', () => {
    expect(filterRequests(LIST, { show: 'waiting' })).toEqual([SHEPARD]);
  });
  it('show: call keeps the cards with no lean', () => {
    expect(filterRequests(LIST, { show: 'call' })).toEqual([SHOP]);
  });
  it('show: session keeps the session requests', () => {
    expect(filterRequests(LIST, { show: 'session' })).toEqual([SHOP_SESSION]);
  });
  it('project, show and query all narrow together', () => {
    expect(filterRequests(LIST, { project: 'Shopkeeper' })).toEqual([SHOP, SHOP_SESSION]);
    expect(filterRequests(LIST, { project: 'Shopkeeper', query: 'pricing' })).toEqual([SHOP_SESSION]);
    expect(filterRequests(LIST, { project: 'Shopkeeper', show: 'waiting' })).toEqual([]);
  });
});

describe('showCounts / projectsOf / isFiltering', () => {
  it('counts what each chip would show under the other filters', () => {
    expect(showCounts(LIST)).toEqual({ all: 3, waiting: 1, call: 1, session: 1 });
    expect(showCounts(LIST, { project: 'Shopkeeper', show: 'waiting' }))
      .toEqual({ all: 2, waiting: 0, call: 1, session: 1 });
  });
  it('lists projects most asks first', () => {
    expect(projectsOf(LIST)).toEqual([
      { name: 'Shopkeeper', n: 2 },
      { name: 'Shepard Tone Synthesizer', n: 1 },
    ]);
  });
  it('knows when anything is narrowing the deck', () => {
    expect(isFiltering({})).toBe(false);
    expect(isFiltering({ query: ' ', show: 'all', project: '' })).toBe(false);
    expect(isFiltering({ query: 'pod' })).toBe(true);
    expect(isFiltering({ show: 'call' })).toBe(true);
    expect(isFiltering({ project: 'Shopkeeper' })).toBe(true);
  });
});
