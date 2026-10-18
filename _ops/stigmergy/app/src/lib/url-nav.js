// URL-driven entry navigation for STATE.
//
// Stage A's smoke test surfaced a real navigation gap: following a wikilink
// dropped the previous entry from any history STIGMERGY tracked, the chrome
// only offered "back to pulse," and the browser back button did nothing
// because nothing was ever pushed to history.
//
// The fix routes navigation through the URL: `?entry=<rel-path>` (with an
// optional `&edit=1`) IS the source of truth for which entry is open. The
// React state mirrors the URL, popstate updates the React state, and clicks
// pushState. Browser back/forward then work for free; entries are bookmark-
// able; deep-links land.
//
// Pure helpers + a hook. The hook intentionally keeps the URL surface
// minimal (only `entry` and `edit`); other query params (?deck=, ?demo=)
// pass through untouched so the existing e2e tests don't break.

import { useCallback, useEffect, useState } from 'react';
import { DECKS, DECK_ALIASES } from './decks.js';
import { IS_PUBLIC } from './public-mode.js';

// Parse `?commit=<sha>` from the URL. Returns the sha or null. SSR-safe.
export function parseCommitFromUrl(searchString) {
  if (typeof searchString !== 'string') return null;
  const sha = new URLSearchParams(searchString).get('commit');
  return sha && sha !== '' ? sha : null;
}

// Build a new search string preserving all params except `commit`, which is
// overwritten by `sha` (or cleared when sha is null).
export function buildCommitSearch(searchString, sha) {
  const params = new URLSearchParams(searchString || '');
  params.delete('commit');
  if (sha) params.set('commit', sha);
  const s = params.toString();
  return s === '' ? '' : `?${s}`;
}

// React hook: keeps `commit` in sync with the URL. The mutation (openCommit)
// pushes history *and* updates the URL in the same call, then mirrors into
// React state; popstate only reads the URL back into state. See the note on
// `pushEntry` in useEntryNavigation for why the push lives in the setter and
// not in an effect (the latch-leak bug).
export function useCommitNavigation() {
  const initial = typeof window === 'undefined'
    ? null
    : parseCommitFromUrl(window.location.search);
  const [sha, setSha] = useState(initial);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    function onPop() {
      setSha(parseCommitFromUrl(window.location.search));
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openCommit = useCallback((nextSha) => {
    const target = nextSha || null;
    if (typeof window !== 'undefined') {
      const nextSearch = buildCommitSearch(window.location.search, target);
      const currentSearch = window.location.search || '';
      if (nextSearch !== currentSearch) {
        const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;
        window.history.pushState({ commit: target }, '', nextUrl);
      }
    }
    setSha(target);
  }, []);

  const closeCommit = useCallback(() => openCommit(null), [openCommit]);
  const goBack = useCallback(() => {
    if (typeof window !== 'undefined') window.history.back();
  }, []);

  return { commit: sha, openCommit, closeCommit, goBack };
}

// Parse the current location into { path, edit } where path is the entry
// rel-path or null and edit is a boolean. SSR-safe (returns nulls).
export function parseEntryFromUrl(searchString) {
  if (typeof searchString !== 'string') return { path: null, edit: false };
  const params = new URLSearchParams(searchString);
  const path = params.get('entry');
  const edit = params.get('edit') === '1';
  return { path: path && path !== '' ? path : null, edit };
}

// Build a new search string preserving every existing param except `entry`
// and `edit`, which are overwritten by the next state. Empty path clears
// both; falsy edit clears just the edit flag.
export function buildEntrySearch(searchString, { path, edit }) {
  const params = new URLSearchParams(searchString || '');
  params.delete('entry');
  params.delete('edit');
  if (path) {
    params.set('entry', path);
    if (edit) params.set('edit', '1');
  }
  const s = params.toString();
  return s === '' ? '' : `?${s}`;
}

// React hook: keeps {path, edit} in sync with the URL, exposes setters that
// push history entries so the browser back button traverses the visit
// sequence. `goBack()` uses native history.back so forward stays reachable.
//
// Push-in-setter, not push-in-effect. Every mutation calls `pushEntry`, which
// does the pushState *and* the setState together; popstate only mirrors the
// URL back into state. The earlier design pushed from a useEffect guarded by a
// `fromPop` ref, but that ref leaked: a popstate that changed only a *sibling*
// slice (lens, commit, deck -- all sharing this one URL) left this hook's latch
// stuck `true`, and the next real navigation here got silently swallowed (no
// push, URL went stale). That was the intermittent-dead-back-button bug.
// Pushing straight from the setter removes the latch and the whole failure
// class -- each user action is exactly one history entry, period.
export function useEntryNavigation() {
  const initial = typeof window === 'undefined'
    ? { path: null, edit: false }
    : parseEntryFromUrl(window.location.search);
  const [state, setState] = useState(initial);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    function onPop() {
      setState(parseEntryFromUrl(window.location.search));
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const pushEntry = useCallback((next) => {
    if (typeof window !== 'undefined') {
      const nextSearch = buildEntrySearch(window.location.search, next);
      const currentSearch = window.location.search || '';
      if (nextSearch !== currentSearch) {
        const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;
        window.history.pushState({ entry: next.path, edit: next.edit }, '', nextUrl);
      }
    }
    setState(next);
  }, []);

  // The current open path is read from the URL (the source of truth) so the
  // editor toggles stay correct without threading state through a ref.
  const currentPath = () => (typeof window === 'undefined'
    ? null
    : parseEntryFromUrl(window.location.search).path);

  const openEntry = useCallback((path) => {
    pushEntry({ path: path || null, edit: false });
  }, [pushEntry]);

  const openEditor = useCallback(() => {
    pushEntry({ path: currentPath(), edit: true });
  }, [pushEntry]);

  const closeEditor = useCallback(() => {
    pushEntry({ path: currentPath(), edit: false });
  }, [pushEntry]);

  const backToPulse = useCallback(() => {
    pushEntry({ path: null, edit: false });
  }, [pushEntry]);

  // Use the browser's native back so forward stays reachable. The popstate
  // listener will resync local state when it fires.
  const goBack = useCallback(() => {
    if (typeof window !== 'undefined') window.history.back();
  }, []);

  return {
    path: state.path,
    edit: state.edit,
    openEntry,
    openEditor,
    closeEditor,
    backToPulse,
    goBack,
  };
}

// The PULSE filter rides in the URL as `?q=`, so opening an entry and coming
// back -- by the reader's [back] or the browser's -- lands on the same
// filtered list. buildEntrySearch and the deck/lens builders already carry
// sibling params through, so nothing else has to know about it. Written with
// replaceState, never pushState: a keystroke is not a step in history.
export function parseFilterFromUrl(searchString) {
  if (typeof searchString !== 'string') return '';
  return new URLSearchParams(searchString).get('q') ?? '';
}

// Build a search string preserving every param except `q`; a blank filter
// clears it so an unfiltered PULSE keeps a clean URL.
export function buildFilterSearch(searchString, q) {
  const params = new URLSearchParams(searchString || '');
  params.delete('q');
  if (q && q.trim()) params.set('q', q);
  const s = params.toString();
  return s === '' ? '' : `?${s}`;
}

export function replaceFilterInUrl(q) {
  if (typeof window === 'undefined') return;
  const nextSearch = buildFilterSearch(window.location.search, q);
  if (nextSearch === (window.location.search || '')) return;
  const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;
  window.history.replaceState(window.history.state, '', nextUrl);
}

// The STATE lenses. The default is implicit (omitted from the URL): PULSE in
// STIGMERGY, TOPOLOGY in the public read view, whose visitors land on the
// graph. Unknown values fall back to the default. QUOTES is the travel-by-quote
// lens: one quote at a time, each a window into the page it is laid on.
export const LENSES = new Set(['pulse', 'topology', 'tree', 'quotes']);
export const DEFAULT_LENS = IS_PUBLIC ? 'topology' : 'pulse';

// Parse `?lens=topology` / `?lens=tree` from the URL. Returns a known lens id
// or 'pulse' (the default). SSR-safe.
export function parseLensFromUrl(searchString) {
  if (typeof searchString !== 'string') return DEFAULT_LENS;
  const v = new URLSearchParams(searchString).get('lens');
  return LENSES.has(v) ? v : DEFAULT_LENS;
}

// Build a new search string preserving all params except `lens`. Pulse is
// the implicit default, so we omit `lens=pulse` to keep URLs clean.
export function buildLensSearch(searchString, lens) {
  const params = new URLSearchParams(searchString || '');
  params.delete('lens');
  if (lens && lens !== DEFAULT_LENS && LENSES.has(lens)) params.set('lens', lens);
  const s = params.toString();
  return s === '' ? '' : `?${s}`;
}

// Parse `?tree=<path>` — the TREE lens deep-link target (an entry path to
// reveal: its ancestor folders open, the row scrolled into view). SSR-safe.
export function parseTreeTargetFromUrl(searchString) {
  if (typeof searchString !== 'string') return null;
  const v = new URLSearchParams(searchString).get('tree');
  return v && v !== '' ? v : null;
}

// Build a search string with `tree` set to `path` (or cleared when falsy),
// preserving every other param. Lets a future "locate in tree" affordance link
// straight to a focused TREE view.
export function buildTreeTargetSearch(searchString, path) {
  const params = new URLSearchParams(searchString || '');
  params.delete('tree');
  if (path) params.set('tree', path);
  const s = params.toString();
  return s === '' ? '' : `?${s}`;
}

// React hook: keeps `lens` in sync with the URL. pushState on switch so
// browser back/forward traverses lens changes. Default landing is PULSE.
// Push-in-setter (see useEntryNavigation) so the latch-leak bug can't strand
// a lens switch when a sibling slice moved.
export function useLensNavigation() {
  const initial = typeof window === 'undefined'
    ? DEFAULT_LENS
    : parseLensFromUrl(window.location.search);
  const [lens, setLensState] = useState(initial);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    function onPop() {
      setLensState(parseLensFromUrl(window.location.search));
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const setLens = useCallback((next) => {
    const lensId = LENSES.has(next) ? next : DEFAULT_LENS;
    if (typeof window !== 'undefined') {
      const nextSearch = buildLensSearch(window.location.search, lensId);
      const currentSearch = window.location.search || '';
      if (nextSearch !== currentSearch) {
        const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;
        window.history.pushState({ lens: lensId }, '', nextUrl);
      }
    }
    setLensState(lensId);
  }, []);

  return { lens, setLens };
}

// ---------------------------------------------------------------------------
// Quote navigation — `?quote=<id>` names the quote the QUOTES lens is showing,
// and, when an entry is open, the quote mark the reader scrolls to and lights.
// One param, two readings, so "step through the window" (lens → entry) and
// "back" (entry → lens) land on the same quote. Push-in-setter like the
// siblings; `replace` is for the lens's own first draw, which is not a step
// the walker took.

export function parseQuoteFromUrl(searchString) {
  if (typeof searchString !== 'string') return null;
  const v = new URLSearchParams(searchString).get('quote');
  return v && v !== '' ? v : null;
}

export function buildQuoteSearch(searchString, id) {
  const params = new URLSearchParams(searchString || '');
  params.delete('quote');
  if (id) params.set('quote', id);
  const s = params.toString();
  return s === '' ? '' : `?${s}`;
}

export function useQuoteNavigation() {
  const initial = typeof window === 'undefined' ? null : parseQuoteFromUrl(window.location.search);
  const [quoteId, setQuoteState] = useState(initial);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    function onPop() { setQuoteState(parseQuoteFromUrl(window.location.search)); }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openQuote = useCallback((id, { replace = false } = {}) => {
    const target = id || null;
    if (typeof window !== 'undefined') {
      const nextSearch = buildQuoteSearch(window.location.search, target);
      const currentSearch = window.location.search || '';
      if (nextSearch !== currentSearch) {
        const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;
        if (replace) window.history.replaceState({ ...(window.history.state || {}), quote: target }, '', nextUrl);
        else window.history.pushState({ quote: target }, '', nextUrl);
      }
    }
    setQuoteState(target);
  }, []);

  const clearQuote = useCallback(() => openQuote(null, { replace: true }), [openQuote]);
  return { quoteId, openQuote, clearQuote };
}

// ---------------------------------------------------------------------------
// Deck navigation — the PRIMARY axis (STATE / QUEUE / LOG / TRICKSTER /
// STEWARDS). Historizing the deck is what makes the browser back button work
// *across* decks, not just within a deck's sub-views. The deck used to be
// plain React state read from `?deck=` once on mount and never pushed, so
// every deck switch was a dead spot for back/forward. This hook (mounted once
// in App, which is always present regardless of the open deck) puts the deck
// in the same single history timeline as entry/lens/commit.

// Resolve a deck from a search string, mirroring the original initialDeck
// heuristic: an explicit `?deck=` (case-insensitive, must be a known deck)
// wins; else the demo showcase lands on QUEUE; else STATE. SSR-safe.
export function deckFromSearch(searchString) {
  const params = new URLSearchParams(typeof searchString === 'string' ? searchString : '');
  const v = params.get('deck');
  if (typeof v === 'string') {
    const up = DECK_ALIASES[v.toUpperCase()] || v.toUpperCase();
    if (DECKS.includes(up)) return up;
  }
  if (params.get('demo')) return 'QUEUE';
  return 'STATE';
}

// ---------------------------------------------------------------------------
// Scroll navigation — `?scroll=<home>` opens that page's scroll on whatever
// deck you are on. Any page may keep a scroll (a project's, a ceremony's, a
// hub's), so the scroll is a face of the page, not a corner of the PROJECTS
// deck: reading an entry in STATE and switching to its scroll keeps STATE lit,
// and closing the scroll drops only this param, which lands you back where you
// were. `?project=` is the old name, still read so old links land.

export function parseScrollFromUrl(searchString) {
  if (typeof searchString !== 'string') return null;
  const params = new URLSearchParams(searchString);
  const v = params.get('scroll') || params.get('project');
  return v && v !== '' ? v : null;
}

export function buildScrollSearch(searchString, home) {
  const params = new URLSearchParams(searchString || '');
  params.delete('scroll');
  params.delete('project');
  if (home) params.set('scroll', home);
  const s = params.toString();
  return s === '' ? '' : `?${s}`;
}

// Push-in-setter like the siblings. `backFromScroll` is the scroll's own back
// button: when this tab opened the scroll (the history entry carries it), it
// is a real history step, so the page you came from comes back as you left it;
// a scroll you landed on by link has nothing behind it, so it closes instead.
export function useScrollNavigation() {
  const initial = typeof window === 'undefined' ? null : parseScrollFromUrl(window.location.search);
  const [scroll, setScrollState] = useState(initial);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    function onPop() { setScrollState(parseScrollFromUrl(window.location.search)); }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openScroll = useCallback((home) => {
    const target = home || null;
    if (typeof window !== 'undefined') {
      const nextSearch = buildScrollSearch(window.location.search, target);
      const currentSearch = window.location.search || '';
      if (nextSearch !== currentSearch) {
        const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;
        window.history.pushState({ scroll: target }, '', nextUrl);
      }
    }
    setScrollState(target);
  }, []);

  const closeScroll = useCallback(() => openScroll(null), [openScroll]);

  const backFromScroll = useCallback(() => {
    if (typeof window !== 'undefined') {
      const here = parseScrollFromUrl(window.location.search);
      if (here && window.history.state && window.history.state.scroll === here) {
        window.history.back();
        return;
      }
    }
    closeScroll();
  }, [closeScroll]);

  return { scroll, openScroll, closeScroll, backFromScroll };
}

// Build a search string with `deck` set (uppercased), preserving every other
// param. Unlike lens, the deck is always written on an explicit switch — even
// STATE, the default — so the history timeline is unambiguous when stepping
// back across decks.
export function buildDeckSearch(searchString, deck) {
  const params = new URLSearchParams(searchString || '');
  params.delete('deck');
  if (deck) params.set('deck', String(deck).toUpperCase());
  const s = params.toString();
  return s === '' ? '' : `?${s}`;
}

// React hook: owns the deck as URL-driven state. `navigateDeck` pushes history
// and updates the URL, then mirrors into state; popstate reads the deck back
// out of the URL. Push-in-setter, same discipline as the sibling hooks.
export function useDeckNavigation() {
  const initial = typeof window === 'undefined'
    ? 'STATE'
    : deckFromSearch(window.location.search);
  const [deck, setDeckState] = useState(initial);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    function onPop() {
      setDeckState(deckFromSearch(window.location.search));
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigateDeck = useCallback((next) => {
    if (!next) return;
    const up = String(next).toUpperCase();
    const target = DECK_ALIASES[up] || up;
    if (typeof window !== 'undefined') {
      const nextSearch = buildDeckSearch(window.location.search, target);
      const currentSearch = window.location.search || '';
      if (nextSearch !== currentSearch) {
        const nextUrl = `${window.location.pathname}${nextSearch}${window.location.hash}`;
        window.history.pushState({ deck: target }, '', nextUrl);
      }
    }
    setDeckState(target);
  }, []);

  return { deck, navigateDeck };
}
