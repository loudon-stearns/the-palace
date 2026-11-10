// live-answers.mjs — which answers on the board still answer, in one place.
//
// The rule (SCHEMA — Reference §9, the RETRACT row): a RETRACT withdraws the
// message its `re` names. A retracted RESOURCE_GRANT or RESOURCE_DENY answers
// nothing, so its ask is waiting again. A retracted RESOURCE_REQUEST is no ask.
// A RETRACT is never itself withdrawn: a RETRACT naming a RETRACT changes
// nothing, and the first retraction stands.
//
// Every reader that folds answers off the board asks these questions, so a
// steward, the deck, the auto-Trickster and the Return map read one ask the
// same way. Pure: no imports and no Node-only APIs, so the Vite app, the
// orchestrator, trickster-auto, the concierge and the handoff tools can all
// import it. Python readers cannot; one that folds answers mirrors this rule
// with a comment naming this file.
//
// Two rules a reader would otherwise settle on its own:
//
//   The key. An ask is keyed `request_id` if it carries one, else its own `id`
//   (askKey). That is what the write path puts in an answer's `re`
//   (app/src/lib/response-builder.js: `re: request.request_id ?? request.id`;
//   trickster-auto/src/parse.js the same). liveAnswerFor also accepts an
//   answer whose `re` is the ask's message id when the two differ, as the
//   deck's inbox.js already does, so the deck and a steward never
//   disagree about an ask answered by either name.
//
//   The tie. When several live answers name one ask, the LAST in board order
//   is its answer: the board is append-only, so the last word is the latest.
//   buildQueue, reconcilePendingRequests, adoptedPlanRevisions and urgentAnswer
//   all read it this way. `pick: 'first'` is there for the one reader that has
//   always taken the first (scroll-view.js decisionFor, the decision a making
//   card shows); its retracted answers are still skipped.

export const ANSWER_TYPES = Object.freeze(['RESOURCE_GRANT', 'RESOURCE_DENY']);

const nonEmpty = (v) => (typeof v === 'string' && v !== '' ? v : null);

/** A RESOURCE_GRANT or RESOURCE_DENY that names what it answers in `re`. */
export function isAnswer(m) {
  return !!m && (m.type === 'RESOURCE_GRANT' || m.type === 'RESOURCE_DENY') && nonEmpty(m.re) !== null;
}

/**
 * The ids a RETRACT on the board has withdrawn: each RETRACT's `re`. An id
 * that belongs to a RETRACT is left out, since a retraction is never itself
 * withdrawn. Whichever board the RETRACT was posted on.
 */
export function retractedIds(messages) {
  const out = new Set();
  if (!Array.isArray(messages)) return out;
  const retractIds = new Set();
  for (const m of messages) {
    if (m && m.type === 'RETRACT') {
      if (nonEmpty(m.id)) retractIds.add(m.id);
      if (nonEmpty(m.re)) out.add(m.re);
    }
  }
  for (const id of retractIds) out.delete(id);
  return out;
}

/**
 * Is this message withdrawn? Any message but a RETRACT, named by its `id`; a
 * RESOURCE_REQUEST also by its `request_id`, since a request may be named
 * either way.
 */
export function isWithdrawn(m, retracted) {
  if (!m || m.type === 'RETRACT' || !retracted) return false;
  if (nonEmpty(m.id) && retracted.has(m.id)) return true;
  return m.type === 'RESOURCE_REQUEST' && nonEmpty(m.request_id) !== null && retracted.has(m.request_id);
}

/** The key an ask is answered by: its `request_id`, else its own `id`; null with neither. */
export function askKey(m) {
  if (!m) return null;
  return nonEmpty(m.request_id) ?? nonEmpty(m.id);
}

/**
 * Every live answer, keyed by the `re` it answers: Map<re, answer message>.
 * A withdrawn answer is skipped. `pick: 'last'` (the default) keeps the last
 * live answer in board order; `pick: 'first'` keeps the first. Pass
 * `retracted` when the caller already has it, to read the board once.
 */
export function liveAnswers(messages, { retracted, pick = 'last' } = {}) {
  const out = new Map();
  if (!Array.isArray(messages)) return out;
  const gone = retracted || retractedIds(messages);
  for (const m of messages) {
    if (!isAnswer(m) || isWithdrawn(m, gone)) continue;
    if (pick === 'first' && out.has(m.re)) continue;
    out.set(m.re, m);
  }
  return out;
}

/**
 * The live answer to one ask, or null: the answer keyed by its `request_id`,
 * else by its own `id` (see The key, above).
 */
export function liveAnswerFor(ask, answers) {
  if (!ask || !answers) return null;
  const k = askKey(ask);
  if (k !== null && answers.has(k)) return answers.get(k);
  const id = nonEmpty(ask.id);
  if (id !== null && id !== k && answers.has(id)) return answers.get(id);
  return null;
}

/**
 * The whole read most callers want, from one pass over the board:
 * { retracted, answers, answerFor(ask), withdrawn(m) }.
 */
export function readAnswers(messages, { pick = 'last' } = {}) {
  const retracted = retractedIds(messages);
  const answers = liveAnswers(messages, { retracted, pick });
  return {
    retracted,
    answers,
    answerFor: (ask) => liveAnswerFor(ask, answers),
    withdrawn: (m) => isWithdrawn(m, retracted),
  };
}
