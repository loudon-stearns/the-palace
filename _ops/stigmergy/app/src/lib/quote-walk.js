// quote-walk.js — the pure half of the QUOTES lens: which quote to show next,
// where a quote leads, and the trail of the walk so far. The server has
// already folded the ledger and anchored every quote to its page
// (src/lib/quotes.js); this module only moves between them.
//
// A quote is a window into a page. Travel is quote-to-quote: from the one
// you are looking at, the neighbors are the other quotes on the same page,
// the quotes read through the same lens, and the quotes on pages the page
// links to (both directions of the typed-link graph). Or draw at random.

export { fidelityGlyph, fidelityLabel, statusLabel } from '../../../../quotes/schema.mjs';

// A decision as the surface has it, folded onto the quote it was made on.
export function applyDecision(quotes, decided) {
  if (!decided || !decided.id) return quotes;
  return (Array.isArray(quotes) ? quotes : []).map((q) => (q.id === decided.id ? { ...q, ...decided } : q));
}

// The quotes still awaiting Loudon's read.
export function awaitingQuotes(quotes) {
  return activeQuotes(quotes).filter((q) => (q.status || 'placed') === 'placed');
}

// Only placed quotes travel. (The server folds retirements; this is the
// one filter the client applies.)
export function activeQuotes(quotes) {
  return (Array.isArray(quotes) ? quotes : []).filter((q) => q && q.status !== 'retired');
}

// A uniform draw, never the one being shown (when there is a choice).
// `rng` is injectable so a test can pin the draw.
export function pickRandom(quotes, { excludeId = null, rng = Math.random } = {}) {
  const pool = activeQuotes(quotes);
  if (pool.length === 0) return null;
  const candidates = pool.length > 1 && excludeId ? pool.filter((q) => q.id !== excludeId) : pool;
  const i = Math.min(candidates.length - 1, Math.floor(rng() * candidates.length));
  return candidates[i] || null;
}

// The set of page titles one typed link away from `title`, in either
// direction, read off the topology's edges. `nodes` map ids to titles/paths;
// edges carry node ids. Returns a Set of titles (never including `title`).
export function linkedTitles(title, topology) {
  const out = new Set();
  if (!topology || !Array.isArray(topology.nodes) || !Array.isArray(topology.edges)) return out;
  const byId = new Map(topology.nodes.map((n) => [n.id, n]));
  const me = topology.nodes.find((n) => n.title === title || n.id === title || n.label === title);
  if (!me) return out;
  for (const e of topology.edges) {
    const s = typeof e.source === 'object' ? e.source.id : e.source;
    const t = typeof e.target === 'object' ? e.target.id : e.target;
    if (s === me.id && byId.has(t)) out.add(byId.get(t).title ?? byId.get(t).label ?? t);
    if (t === me.id && byId.has(s)) out.add(byId.get(s).title ?? byId.get(s).label ?? s);
  }
  out.delete(title);
  return out;
}

// Where a quote leads: three short lists, each excluding the quote itself,
// and each quote listed once — in the first group it belongs to.
//   samePage  other quotes laid on the same page
//   sameLens  quotes read through the same lens, on other pages
//   linked    quotes on pages one typed link away from this quote's page,
//             not already shown above
// `topology` is optional; without it `linked` is empty.
export function neighborsOf(current, quotes, topology = null) {
  const empty = { samePage: [], sameLens: [], linked: [] };
  if (!current) return empty;
  const pool = activeQuotes(quotes).filter((q) => q.id !== current.id);
  const samePage = pool.filter((q) => q.target === current.target);
  const sameLens = pool.filter((q) => q.lens === current.lens && q.target !== current.target);
  const shown = new Set([...samePage, ...sameLens].map((q) => q.id));
  const near = linkedTitles(current.target, topology);
  const linked = pool.filter((q) => !shown.has(q.id) && q.target !== current.target && near.has(q.target));
  return { samePage, sameLens, linked };
}

// Quotes laid on one page, by path (the reader's marginalia).
export function quotesForEntry(quotes, path) {
  if (!path) return [];
  return activeQuotes(quotes).filter((q) => q.target_path === path);
}

// The walk so far: a bounded list of quote ids, newest last, no immediate
// repeat. Pure — returns a new array.
export function pushTrail(trail, id, { max = 24 } = {}) {
  const t = Array.isArray(trail) ? trail : [];
  if (!id || t[t.length - 1] === id) return t;
  const next = [...t, id];
  return next.length > max ? next.slice(next.length - max) : next;
}

// Distinct lenses and pages across the quotes, with counts, for the filter
// strip and the header line.
export function tally(quotes) {
  const lenses = new Map();
  const pages = new Map();
  for (const q of activeQuotes(quotes)) {
    lenses.set(q.lens, (lenses.get(q.lens) || 0) + 1);
    pages.set(q.target, (pages.get(q.target) || 0) + 1);
  }
  const sorted = (m) => [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count }));
  return { lenses: sorted(lenses), pages: sorted(pages) };
}

// A short form of a quote for a chip: the first ~N characters, on one line.
export function shortQuote(q, max = 72) {
  const s = String(q?.quote ?? '').replace(/\s+/g, ' ').trim();
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}
