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
// nothing, so its request is pending again. That holds whoever answered: an
// ask whose answer Loudon retracted is pending here as it is on the deck, and
// the rules evaluate it like any other. In --shadow (the default; switching
// --live is still Loudon's open move, [[Project Stewardship System]]) that only
// changes the digest; in --live the engine could answer an ask whose answer
// Loudon withdrew. Whether his retraction
// should keep the engine off is Loudon's call; this reader does not decide it.

import { parseRequest } from './parse.js';
import { readAnswers } from '../../live-answers.mjs';

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
  // Every `re` a live grant or deny names. A retracted answer is not here.
  const live = readAnswers(messages);
  const answeredIds = new Set([...live.answers.keys()].filter((re) => re.trim() !== ''));

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
