// inbox.js — Phase 0. Rebuild the Trickster inbox from the board (§2.6).
//
// The inbox is the set of RESOURCE_REQUEST messages that have NOT yet received
// a RESOURCE_GRANT or RESOURCE_DENY correlated by top-level `re`. This mirrors
// the STIGMERGY inbox builder (app/src/lib/inbox.js): scan from the beginning,
// track which ids have been answered, return the unanswered ones — parsed into
// the stable record shape from parse.js.
//
// A request is keyed by its parsed `request_id` — the wire request_id, else the
// message's own `id`, the same key the deck's grant writes into `re` — and it
// counts as answered when a grant's `re` matches either id, as the deck reads
// it. A request carrying neither id can never be answered, so it is named once
// in `unanswerable` rather than queued forever.

import { parseRequest } from './parse.js';

/**
 * @param {Array<object>} messages — parsed board messages, in board order
 * @returns {{
 *   pending: Array<ReturnType<typeof parseRequest>>,
 *   unanswerable: Array<ReturnType<typeof parseRequest>>,
 *   answeredIds: Set<string>,
 *   counts: { requests: number, answered: number, pending: number, unanswerable: number }
 * }}
 */
export function buildInbox(messages) {
  const answeredIds = new Set();
  for (const m of messages) {
    if (m && (m.type === 'RESOURCE_GRANT' || m.type === 'RESOURCE_DENY')) {
      const re = typeof m.re === 'string' && m.re.trim() !== '' ? m.re : null;
      if (re) answeredIds.add(re);
    }
  }

  // De-duplicate by key, keeping the LAST occurrence (a re-posted request
  // supersedes its earlier form — matches the gsl-steward-004 →
  // gsl-steward-005 supersession pattern seen on the live board).
  const byId = new Map();
  const unanswerable = [];
  for (const m of messages) {
    if (!m || m.type !== 'RESOURCE_REQUEST') continue;
    const r = parseRequest(m);
    if (r.request_id) byId.set(r.request_id, r);
    else unanswerable.push(r);
  }

  const isAnswered = (r) =>
    answeredIds.has(r.request_id) || (typeof r.raw?.id === 'string' && answeredIds.has(r.raw.id));

  const requests = [...byId.values()];
  const pending = requests.filter((r) => !isAnswered(r));

  return {
    pending,
    unanswerable,
    answeredIds,
    counts: {
      requests: requests.length,
      answered: requests.length - pending.length,
      pending: pending.length,
      unanswerable: unanswerable.length,
    },
  };
}
