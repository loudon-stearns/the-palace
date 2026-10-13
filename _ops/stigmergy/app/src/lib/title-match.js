// Title search for a picker -- the ranking behind the LENS combobox, kept
// pure so it can be tested without a DOM.
//
// A query matches a title case-insensitively, anywhere in it. Hits come back
// in three tiers so the one you meant is near the top: titles that START
// with the query, then titles with a WORD that starts with it, then titles
// that merely contain it. Each tier keeps the caller's order (the index is
// alphabetical), so results are stable as you type.

function tierOf(lower, q) {
  if (lower.startsWith(q)) return 0;
  const at = lower.indexOf(q);
  if (at < 0) return -1;
  // A word start: the character before the hit is not a letter or digit.
  return /[^\p{L}\p{N}]/u.test(lower[at - 1]) ? 1 : 2;
}

// rankTitles(titles, query, { limit, exclude }) -> { hits, total }
//   hits  -- the top `limit` matches, best tier first
//   total -- how many titles matched in all (so the UI can say "+N more")
// An empty or whitespace query matches nothing: the picker has other ways to
// suggest (the graph-nearest chips), and listing every page is noise.
export function rankTitles(titles, query, { limit = 12, exclude = null } = {}) {
  const q = (query ?? '').trim().toLowerCase();
  if (!q) return { hits: [], total: 0 };
  const tiers = [[], [], []];
  for (const title of titles) {
    if (title === exclude) continue;
    const t = tierOf(title.toLowerCase(), q);
    if (t >= 0) tiers[t].push(title);
  }
  const all = tiers.flat();
  return { hits: all.slice(0, limit), total: all.length };
}

// splitMatch(title, query) -> [before, hit, after]
// The first case-insensitive run of `query` inside `title`, so a row can light
// the letters you typed. No hit (or no query) puts the whole title in `before`.
export function splitMatch(title, query) {
  const q = (query ?? '').trim().toLowerCase();
  if (!q) return [title, '', ''];
  const at = title.toLowerCase().indexOf(q);
  if (at < 0) return [title, '', ''];
  return [title.slice(0, at), title.slice(at, at + q.length), title.slice(at + q.length)];
}
