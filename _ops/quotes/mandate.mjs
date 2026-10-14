// mandate.mjs — the prompt that wakes Palace Quotes as a glass over a page.
//
// [[The Lens]]'s own mandate (buildLensMandate) wakes the glass page as itself,
// hands it the subject, and asks for the two-attempt read — then tells it to
// report a spark to the WEAVE board and, at 4 or more, to ask TRICKSTER whether
// to commit. Palace Quotes keeps the read and drops the reporting: a quote is
// small and there will be many, and Loudon judges them in STIGMERGY with one
// key each (y / x), so a board card per quote would only fill the inbox
// (Loudon, 2026-10-14). The placement line IS the report; the "awaiting your
// read" count is the inbox.
//
// So this builder takes the Lens's prompt, cuts its reporting section, and
// appends the quoter's method (prompts/quoter.md). Used by place.mjs --mandate
// and by STIGMERGY's [L] lens when the glass picked is Palace Quotes
// (server/api/launch.js). No shebang: the app imports this by relative path.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLensMandate } from '../stigmergy/orchestrator/src/lens-mandate.js';

const HERE = dirname(fileURLToPath(import.meta.url));
export const GLASS = 'Palace Quotes';

// The Lens's reporting section starts at this heading and runs to the end of
// the procedure (or to Loudon's extra note, when one was given).
const REPORT_HEADING = '## Report — do not write the candidate yourself';
const NOTE_MARKER = '\n\n---\n\n# Loudon\'s extra note for this lensing';

export function stripLensReport(full) {
  const at = full.indexOf(REPORT_HEADING);
  if (at === -1) return full;
  const noteAt = full.indexOf(NOTE_MARKER, at);
  return noteAt === -1 ? full.slice(0, at).trimEnd() : `${full.slice(0, at).trimEnd()}${full.slice(noteAt)}`;
}

export function quoterText(subjectTitle) {
  return readFileSync(join(HERE, 'prompts', 'quoter.md'), 'utf8').replace(/\{\{SUBJECT\}\}/g, subjectTitle);
}

/**
 * Same shape as buildLensMandate — { ok, status, glass, subject, stage, full }
 * — so a caller can thread it straight into /api/launch/ephemeral. `glassTitle`
 * is accepted and ignored: this builder is Palace Quotes' own.
 */
export function buildQuoteMandate({ palaceRoot, subjectTitle, loudonNote = '' } = {}) {
  const built = buildLensMandate({ palaceRoot, glassTitle: GLASS, subjectTitle, loudonNote });
  if (!built.ok) return built;
  const full = `${stripLensReport(built.full)}\n\n---\n\n${quoterText(subjectTitle)}`;
  return { ...built, full, payoff: 'quote' };
}
