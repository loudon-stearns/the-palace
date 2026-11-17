// server/scroll-answer.js — the door Loudon's answer on a scroll goes through.
//
// He answers a trail section where he reads it (ScrollView → MakingCard). One
// send is one answer to the section, carrying any marks he left on single
// files. The answer is kept in the scroll section itself, as a marked block
// (src/lib/scroll-answers.js): that block is the one source of truth. From it,
// in the same send, this delivers:
//   - one line on the page's tuning ledger, in the Maker's form, owed a review
//     (Shop/Maker.md § Testing and Improving a Specialist), when the page keeps one;
//   - one `human_eval` note on the board, the rich face's wire, so the QUEUE
//     shows it and `_ops/loudon-eval/read-answers.mjs --page` reads it;
//   - one Trickster Commit of the scroll and the ledger.
// The scroll is written first. A delivery that fails is reported, never hidden,
// and never undoes the answer: his words are already beside the proof.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { validateMessage } from '@stigmergy/core/schema';
import { appendJsonLine } from '@stigmergy/core/blackboard';
import { resolveBundleDir } from '../../orchestrator/src/entry-paths.js';
import { MARK } from '../../orchestrator/src/scroll-file.js';
import { tuningPathFor, appendLedgerLine } from '../../orchestrator/src/ledger.js';
import { parseMakingSections } from '../src/lib/scroll-view.js';
import {
  parseAnswers, cleanMarks, formatAnswerBlock, insertAnswer, senseOf, proofName, ledgerLine,
  findQuestion, sectionState, staleFiles, countStates,
} from '../src/lib/scroll-answers.js';
import { commitSelected } from './commit.js';
import { PERSISTENT_REL } from './http.js';

const MAX_WORDS = 20000;
const MAX_HASH_BYTES = 512 * 1024 * 1024;

/** Loudon's local date, YYYY-MM-DD — the date the palace's ledgers use. */
function localDay(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// A file's fingerprint: the first 12 hex of its SHA-256, the size the rich
// face stamps a section with. Cached on (mtime, size), so the scroll's 4 s
// poll re-reads a file only when it has changed.
const hashCache = new Map();
export function fileHash(palaceRoot, rel) {
  const root = resolve(palaceRoot);
  const abs = resolve(root, rel);
  if (abs !== root && !abs.startsWith(root + sep)) return 'outside';
  let st;
  try { st = statSync(abs); } catch { return 'missing'; }
  if (!st.isFile()) return 'missing';
  if (st.size > MAX_HASH_BYTES) return `size${st.size}`;
  const key = `${st.mtimeMs}:${st.size}`;
  const hit = hashCache.get(abs);
  if (hit && hit.key === key) return hit.hash;
  const hash = createHash('sha256').update(readFileSync(abs)).digest('hex').slice(0, 12);
  hashCache.set(abs, { key, hash });
  return hash;
}

function makingOf(text) {
  const t = String(text || '');
  const a = t.indexOf(MARK.makingStart);
  const b = a >= 0 ? t.indexOf(MARK.makingEnd, a) : -1;
  return a >= 0 && b >= 0 ? t.slice(a + MARK.makingStart.length, b) : t;
}

/**
 * Where a scroll's sections stand with him: { waiting, answered, stale }.
 * `stale` maps a section id to the files its newest answer was about that
 * have been remade since. Only answered sections cost a hash.
 */
export function reviewOf(palaceRoot, scrollText) {
  const states = [];
  const stale = {};
  for (const s of parseMakingSections(makingOf(scrollText))) {
    if (!s.id) continue;
    const { answers } = parseAnswers(s.body);
    let current = null;
    if (answers.length) {
      current = {};
      for (const p of Object.keys(answers[answers.length - 1].files || {})) current[p] = fileHash(palaceRoot, p);
      const gone = staleFiles(answers[answers.length - 1], current);
      if (gone.length) stale[s.id] = gone;
    }
    states.push(sectionState(s, current));
  }
  return { ...countStates(states), stale };
}

// The same count for a deck row, read from the scroll on disk and cached on
// its mtime: the deck polls every few seconds and most scrolls have not moved.
const rowCache = new Map();
export function reviewCountFor(palaceRoot, scrollRel) {
  const abs = join(palaceRoot, scrollRel);
  let st;
  try { st = statSync(abs); } catch { return null; }
  const key = `${st.mtimeMs}:${st.size}`;
  const hit = rowCache.get(abs);
  // An answered section can go stale without the scroll moving, so a cached
  // count that holds answers is re-checked; one with none is final until the file moves.
  if (hit && hit.key === key && hit.answered === 0) return { waiting: hit.waiting, answered: 0 };
  let text;
  try { text = readFileSync(abs, 'utf8'); } catch { return null; }
  const { waiting, answered } = reviewOf(palaceRoot, text);
  rowCache.set(abs, { key, waiting, answered });
  return { waiting, answered };
}

// The board note: the rich face's `human_eval` wire, naming the page outright
// (payload.entry), so queue-model's readReview takes it as a note on that page
// and one card gathers every section he answered there.
export function buildAnswerMessage({ home, sectionId, heading, question, sense, words, marks, files, scrollRel, now }) {
  const said = [String(words || '').replace(/\s+/g, ' ').trim(), ...marks.map((m) => `${m.kind} ${m.path.split('/').pop()}${m.note ? `: ${m.note}` : ''}`)].filter(Boolean).join(' · ');
  return {
    schema_version: '1.0',
    id: `human-eval-scroll-${String(sectionId).replace(/[^\w-]+/g, '-').slice(0, 64)}-${Date.parse(now) || Date.now()}`,
    ts: now,
    session_id: 'trickster', from: 'TRICKSTER', to: '*', type: 'BROADCAST', board: 'GENERAL',
    health: { context_pct: 0, stop_reason: 'human_eval', iteration: 1, tokens_this_call: 0, model: 'loudon-trickster', score: 'green' },
    payload: {
      kind: 'human_eval',
      task: `scroll:${home}:${sectionId}`,
      entry: home,
      groups: { [heading || sectionId]: { note: said } },
      overall: {},
      scroll: { path: scrollRel, section: sectionId, question: question || null, sense, marks, files },
    },
  };
}

/**
 * Take one answer. Returns { ok, ... } and never throws:
 *   { ok: true, block, scroll_path, ledger, ledger_line, board_id, commit, notes }
 * `notes` lists any delivery that did not happen and why; the answer itself
 * is on disk whenever ok is true.
 */
export async function answerScroll({ palaceRoot, home, section, words = '', marks = [], by = 'Loudon', now = new Date().toISOString(), today = localDay(), commit = true } = {}) {
  if (!palaceRoot) return { ok: false, status: 500, error: 'palaceRoot not configured' };
  const bundle = resolveBundleDir(palaceRoot, home);
  if (!bundle) return { ok: false, status: 404, error: 'entry-file-not-found' };
  const scrollPath = join(bundle.bundleDir, `${home} — scroll.md`);
  if (!existsSync(scrollPath)) return { ok: false, status: 404, error: 'scroll-not-on-disk' };
  const scrollRel = relative(palaceRoot, scrollPath);
  const text = readFileSync(scrollPath, 'utf8');
  const sec = parseMakingSections(makingOf(text)).find((s) => s.id === section);
  if (!sec) return { ok: false, status: 404, error: 'section-not-found' };

  const said = String(words || '').trim();
  if (said.length > MAX_WORDS) return { ok: false, status: 413, error: 'answer-too-long' };
  const paths = sec.artifacts.map((a) => a.path);
  const kept = cleanMarks(marks);
  const stray = kept.find((m) => !paths.includes(m.path));
  if (stray) return { ok: false, status: 422, error: 'mark-names-a-file-not-in-the-section', path: stray.path };
  if (!said && kept.length === 0) return { ok: false, status: 422, error: 'empty-answer' };

  const files = {};
  for (const p of paths) files[p] = fileHash(palaceRoot, p);
  const sense = senseOf(paths);
  const block = formatAnswerBlock({ by, date: today, at: now, sense, words: said, marks: kept, files });
  const next = insertAnswer(text, section, block);
  if (next == null) return { ok: false, status: 404, error: 'section-not-found' };
  try { writeFileSync(scrollPath, next, 'utf8'); } catch (e) { return { ok: false, status: 500, error: `write failed: ${e.message}` }; }

  const notes = [];
  const committed = [scrollRel];

  // The ledger line, owed a review.
  let ledgerRel = null, line = null;
  const ledger = tuningPathFor(palaceRoot, home);
  if (ledger) {
    line = ledgerLine({ by, date: today, sense, proof: proofName(section, paths), words: said, marks: kept });
    try { appendLedgerLine(ledger, line); ledgerRel = relative(palaceRoot, ledger); committed.push(ledgerRel); }
    catch (e) { line = null; notes.push(`the ledger line was not written: ${e.message}`); }
  } else {
    notes.push('this page keeps no tuning ledger, so no ledger line was written');
  }

  // The board note.
  let boardId = null;
  const { body: prose } = parseAnswers(sec.body);
  const msg = buildAnswerMessage({ home, sectionId: section, heading: sec.heading, question: findQuestion(prose), sense, words: said, marks: kept, files, scrollRel, now });
  const valid = validateMessage(msg);
  if (!valid.valid) notes.push(`the board note was not posted: ${valid.errors.map((e) => e.message).join('; ')}`);
  else {
    try { await appendJsonLine(resolve(palaceRoot, PERSISTENT_REL), msg); boardId = msg.id; }
    catch (e) { notes.push(`the board note was not posted: ${e.message}`); }
  }

  // The commit, through the door, as his hand.
  let hash = null;
  if (commit) {
    const c = await commitSelected(palaceRoot, {
      paths: committed,
      kind: 'edit',
      scope: home,
      summary: `Loudon's answer on the scroll, section ${section}${ledgerRel ? '; the ledger line owed a review' : ''}`,
      body: block.split('\n').slice(1, -1).join('\n'),
      verify: 'unverified',
      author: 'trickster',
    }).catch((e) => ({ ok: false, error: e.message }));
    if (c.ok) hash = c.shortHash; else notes.push(`saved but not committed: ${c.error}`);
  }

  return { ok: true, block, scroll_path: scrollRel, ledger: ledgerRel, ledger_line: line, board_id: boardId, commit: hash, notes };
}
