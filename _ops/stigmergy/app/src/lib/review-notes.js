// review-notes.js — the open notes Loudon left on one page's rich face, for the
// companion's grounding (entry-grounding.js).
//
// "Open" means what it means on the QUEUE: the human_eval cards buildQueue
// makes (queue-model.js buildReviewCards), one per page and round, with what
// was already answered left out. So the companion and the deck never disagree
// about which notes still stand. Server-side only (it reads the board file).

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildQueue } from './queue-model.js';

export const BOARD_REL = '_ops/swarm/persistent/blackboard.jsonl';

// Only these lines matter: the notes, and the grants and denies that answer them.
const WANTED = /"human_eval"|"RESOURCE_GRANT"|"RESOURCE_DENY"/;

/**
 * @param {string} palaceRoot
 * @param {{ title?: string, path?: string }} page — matched by title or file stem, regardless of case
 * @returns {Array<{ id, ts, round, notes: Array<{ section: string|null, note: string }> }>} oldest round first
 */
export function openReviewNotes(palaceRoot, { title, path } = {}) {
  const abs = resolve(palaceRoot, BOARD_REL);
  if (!existsSync(abs)) return [];
  let text;
  try { text = readFileSync(abs, 'utf8'); } catch { return []; }
  const messages = [];
  for (const line of text.split('\n')) {
    if (!WANTED.test(line)) continue;
    try { messages.push(JSON.parse(line)); } catch { /* a torn line is skipped */ }
  }
  const stem = typeof path === 'string' ? path.split('/').pop().replace(/\.md$/i, '') : null;
  const names = new Set([title, stem].filter((s) => typeof s === 'string' && s).map((s) => s.toLowerCase()));
  return buildQueue(messages)
    .filter((it) => it.kind === 'human_eval' && typeof it.entry === 'string' && names.has(it.entry.toLowerCase()))
    .sort((a, b) => (a.round ?? 0) - (b.round ?? 0))
    .map((it) => ({ id: it.id, ts: it.ts, round: it.round, notes: it.notes }));
}
