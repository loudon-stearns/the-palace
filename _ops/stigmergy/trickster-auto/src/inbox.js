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
//
// A RETRACT withdraws (SCHEMA — Reference §9; the rule is ../../live-answers.mjs,
// shared with the deck and the stewards): a retracted request is no ask, in
// neither `pending` nor `unanswerable`, and a retracted grant or deny answers
// nothing.
//
// An ask whose answer was withdrawn goes back to Loudon only (Loudon,
// 2026-11-10). It has no live answer and at least one withdrawn one, so it is
// not in `pending` and the engine never evaluates or answers it; it is listed
// in `returned`, counted, and named in the digest and the CLI summary, so it is
// plain the engine is leaving it for him. That holds whoever posted the
// withdrawn answer and whoever posted the RETRACT. On the deck the same ask is
// waiting again, as the RETRACT row says; a later live answer settles it here
// as there.

import { parseRequest } from './parse.js';
import { readAnswers, isAnswer } from '../../live-answers.mjs';

/**
 * @param {Array<object>} messages — parsed board messages, in board order
 * @returns {{
 *   pending: Array<ReturnType<typeof parseRequest>>,
 *   returned: Array<ReturnType<typeof parseRequest>>,
 *   unanswerable: Array<ReturnType<typeof parseRequest>>,
 *   answeredIds: Set<string>,
 *   counts: { requests: number, answered: number, pending: number, returned: number, unanswerable: number }
 * }}
 */
export function buildInbox(messages) {
  // Every `re` a live grant or deny names. A retracted answer is not here.
  const live = readAnswers(messages);
  const answeredIds = new Set([...live.answers.keys()].filter((re) => re.trim() !== ''));

  // Every `re` a withdrawn grant or deny names: the asks Loudon gets back.
  const withdrawnIds = new Set();
  for (const m of Array.isArray(messages) ? messages : []) {
    if (isAnswer(m) && live.withdrawn(m) && m.re.trim() !== '') withdrawnIds.add(m.re);
  }

  // De-duplicate by key, keeping the LAST occurrence (a re-posted request
  // supersedes its earlier form — matches the gsl-steward-004 →
  // gsl-steward-005 supersession pattern seen on the live board).
  const byId = new Map();
  const unanswerable = [];
  for (const m of messages) {
    if (!m || m.type !== 'RESOURCE_REQUEST') continue;
    if (live.withdrawn(m)) continue;          // a retracted request is no ask
    const r = parseRequest(m);
    if (r.request_id) byId.set(r.request_id, r);
    else unanswerable.push(r);
  }

  const named = (ids, r) => ids.has(r.request_id) || (typeof r.raw?.id === 'string' && ids.has(r.raw.id));

  const requests = [...byId.values()];
  const open = requests.filter((r) => !named(answeredIds, r));
  const returned = open.filter((r) => named(withdrawnIds, r));
  const pending = open.filter((r) => !named(withdrawnIds, r));

  return {
    pending,
    returned,
    unanswerable,
    answeredIds,
    counts: {
      requests: requests.length,
      answered: requests.length - open.length,
      pending: pending.length,
      returned: returned.length,
      unanswerable: unanswerable.length,
    },
  };
}
