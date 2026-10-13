// server/api/quotes.js — the quotes Palace Quotes has laid on pages.
//   GET  /api/quotes                 every placement, anchored to its page as it stands
//   GET  /api/quotes?target=<path>   the quotes on one page (the reader's marginalia)
//   POST /api/quotes/decide          { id, decision: 'keep' | 'retire', why? } — Loudon's
//                                    yes or no on a placed quote; one ledger line, committed
//
// The placer (`node _ops/quotes/place.mjs`, _ops/quotes/README.md) lays
// quotes; this route only reads them, and records the one thing the terminal
// decides: whether a quote stays. A decision is appended to the ledger and
// committed through the same path the TRICKSTER save uses (commitSelected:
// only the ledger is staged, never -A), as Palace-Author loudon. If the
// commit cannot land (no repo, a lock), the line still stands and the answer
// says `committed: false` with the reason — the ledger is append-only and the
// next commit of it carries the line.

import { jsonResponse, readBody } from '../http.js';
import { resolveQuotes, appendDecision, LEDGER_REL } from '../../src/lib/quotes.js';
import { entryUse } from '../../src/lib/entry-use.js';
import { listEntries } from '../../src/lib/entries.js';
import { commitSelected } from '../commit.js';

export async function quotesRoutes(ctx) {
  const { req, res, palaceRoot, urlPath, query, method, opts } = ctx;

  if (urlPath === '/api/quotes' && method === 'GET') {
    const target = query.get('target') || null;
    try {
      const entries = listEntries(palaceRoot, { use: await entryUse(palaceRoot) });
      const out = await resolveQuotes(palaceRoot, { target, entries });
      jsonResponse(res, 200, out);
    } catch (e) {
      jsonResponse(res, 500, { error: `could not read the quotes ledger: ${e.message}` });
    }
    return true;
  }

  if (urlPath === '/api/quotes/decide' && method === 'POST') {
    const bodyText = await readBody(req, res);
    if (bodyText === null) return true;
    let body;
    try { body = JSON.parse(bodyText); } catch (e) {
      jsonResponse(res, 400, { ok: false, error: `malformed JSON: ${e.message}` });
      return true;
    }
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const decision = typeof body.decision === 'string' ? body.decision.trim() : '';
    const why = typeof body.why === 'string' ? body.why.trim() : '';

    const r = appendDecision(palaceRoot, { id, decision, why, by: 'loudon' });
    if (!r.ok) { jsonResponse(res, r.status, { ok: false, error: r.error }); return true; }

    // Commit the ledger line. Injectable for tests (opts.commitImpl); a failed
    // commit is reported, never hidden, and never undoes the append.
    const commit = (opts && opts.commitImpl) || commitSelected;
    const verb = decision === 'keep' ? 'kept' : 'let go';
    const short = r.quote.quote.length > 48 ? `${r.quote.quote.slice(0, 47)}…` : r.quote.quote;
    let committed = false;
    let commitError = null;
    let shortHash = null;
    try {
      const c = await commit(palaceRoot, {
        paths: [LEDGER_REL],
        kind: 'edit',
        scope: 'Palace Quotes',
        summary: `${verb} “${short}” on ${r.quote.target}`,
        body: why ? `${why}\n` : '',
        verify: 'verified',
        author: 'loudon',
      });
      committed = !!(c && c.ok);
      shortHash = c && c.ok ? c.shortHash : null;
      commitError = c && !c.ok ? c.error : null;
    } catch (e) {
      commitError = e.message;
    }
    jsonResponse(res, 200, { ok: true, quote: r.quote, line: r.line, committed, shortHash, commit_error: commitError });
    return true;
  }

  return false;
}
