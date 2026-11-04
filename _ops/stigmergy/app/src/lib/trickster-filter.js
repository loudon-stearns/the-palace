// trickster-filter.js — the [T] deck's search and filter, pure.
//
// Loudon, 2026-11-04: the deck holds dozens of asks, and he wants to find one.
// Three narrowings, all ANDed: a text search, a "show" kind, and a project.
// No React, no I/O — the same shape as trickster-keys.js, so the whole rule is
// covered in the node env. The deck feeds the result to the card list, the
// keyboard layer and FILE ALL alike: what you see is what f files.

// The "show" kinds, in chip order. Each is a predicate over a pending item.
export const SHOW_KINDS = [
  { id: 'all', test: () => true },
  { id: 'waiting', test: (p) => !!p.blocking },
  { id: 'call', test: (p) => !p.recommended_option },
  { id: 'session', test: (p) => p.kind === 'interactive_session' },
];

// Everything a search can hit on one card, lowercased once.
export function haystack(p) {
  const opts = (p.options || []).map((o) => o.label || o.id || '');
  return [p.from, p.headline, p.ground, p.rationale, p.resource, p.request_id, ...opts]
    .filter(Boolean).join(' \n ').toLowerCase();
}

// Every whitespace-separated term must appear somewhere on the card, in any
// order — "shepard plugin" finds the Shepard card that mentions the plugin.
export function matchesQuery(p, query) {
  const terms = String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const hay = haystack(p);
  return terms.every((term) => hay.includes(term));
}

// filters: { query, show, project } — project null/'' means every project.
export function filterRequests(list, filters = {}) {
  const kind = SHOW_KINDS.find((k) => k.id === filters.show) || SHOW_KINDS[0];
  return (list || []).filter((p) =>
    kind.test(p)
    && (!filters.project || p.from === filters.project)
    && matchesQuery(p, filters.query));
}

// How many cards each "show" chip would leave, given the other two filters —
// so a chip's count is what clicking it would actually show.
export function showCounts(list, filters = {}) {
  const out = {};
  for (const k of SHOW_KINDS) out[k.id] = filterRequests(list, { ...filters, show: k.id }).length;
  return out;
}

// The projects with asks on the deck, most asks first, then by name.
export function projectsOf(list) {
  const counts = new Map();
  for (const p of list || []) if (p.from) counts.set(p.from, (counts.get(p.from) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, n]) => ({ name, n }));
}

export function isFiltering(filters = {}) {
  return !!(String(filters.query || '').trim() || (filters.show && filters.show !== 'all') || filters.project);
}
