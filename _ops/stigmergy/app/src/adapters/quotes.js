// Adapter for the quotes Palace Quotes has laid on pages.
//
// fetchQuotes() pulls every placed quote, anchored to its page, from
// GET /api/quotes (STIGMERGY) or data/quotes.json (the public read view).
// fetchQuotes({ target }) narrows to one page's quotes — the reader's
// marginalia. Returns { ok:false } on failure rather than throwing; the UI
// shows nothing extra when the ledger cannot be read.

import { IS_PUBLIC, dataUrl } from '../lib/public-mode.js';

export async function fetchQuotes({ target = null } = {}) {
  try {
    let url;
    if (IS_PUBLIC) url = dataUrl('quotes.json');
    else url = target ? `/api/quotes?target=${encodeURIComponent(target)}` : '/api/quotes';
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return { ok: false, status: res.status, error: `http ${res.status}` };
    const data = await res.json();
    // The read view ships one snapshot; the page filter is applied here.
    if (IS_PUBLIC && target) {
      const quotes = (data.quotes || []).filter((q) => q.target_path === target);
      return { ok: true, ...data, quotes, count: quotes.length };
    }
    return { ok: true, ...data };
  } catch (err) {
    return { ok: false, error: err?.message ?? String(err) };
  }
}

// POST /api/quotes/decide — Loudon's yes or no on a placed quote. Returns
// { ok, quote (as it now stands), committed, shortHash, commit_error } or
// { ok:false, status, error }. Never in the public read view.
export async function decideQuote({ id, decision, why = '' }) {
  if (IS_PUBLIC) return { ok: false, error: 'the read view cannot decide' };
  try {
    const res = await fetch('/api/quotes/decide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id, decision, why }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, status: res.status, ...data };
    return { ok: true, ...data };
  } catch (err) {
    return { ok: false, error: err?.message ?? String(err) };
  }
}

// The typed-link graph, for "quotes on linked pages". Fetched once per lens
// mount; a failure only empties that one neighbor list.
export async function fetchTopologyForQuotes() {
  try {
    const url = IS_PUBLIC ? dataUrl('topology.json') : '/api/topology';
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  }
}
