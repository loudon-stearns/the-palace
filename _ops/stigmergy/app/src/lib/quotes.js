// quotes.js — read the ledger of quotes Palace Quotes has laid on pages and
// anchor each one to the page as it stands now. Server-side (Node): the
// STATE deck's /api/quotes and the public build both call resolveQuotes.
//
// The ledger is `_ops/Palace Quotes/Palace Quotes — placements.jsonl`
// (_ops/quotes/README.md). A line names the page by title and the words it is
// laid beside (`near`); nothing is written into the page. This module turns
// titles into paths, finds the paragraph the `near` phrase lives in today,
// and says whether the section's words have moved since the quote was placed
// (the rich face's own fingerprint, so the two drift signals agree).

import { existsSync, readFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { listEntries, readEntry } from './entries.js';
import { buildIndex, resolveWikilink } from './wikilink.js';
import {
  parseLedger, foldLedger, findNear, normalize, decisionLine, validateDecision, ledgerHeader,
} from '../../../../quotes/schema.mjs';
import { parseEntry, sectionProse, sectionKey, fingerprint } from '../../../../rich-face/parse.js';

export const LEDGER_REL = '_ops/Palace Quotes/Palace Quotes — placements.jsonl';

// Read and fold the ledger. Missing file → empty (the surface shows "no
// quotes placed yet"), never an error.
export function readLedger(palaceRoot) {
  const abs = resolve(palaceRoot, LEDGER_REL);
  if (!existsSync(abs)) return { placements: [], skipped: [], exists: false };
  const { lines, skipped } = parseLedger(readFileSync(abs, 'utf8'));
  return { placements: foldLedger(lines), skipped, exists: true };
}

// Loudon's decision on a placed quote — keep or let go — appended to the
// ledger as one line (the fold takes the last line for an id; a keep after a
// let-go revives it). Returns { ok, line, quote } with the folded quote as it
// now stands, or { ok:false, status, error }. Writes the ledger only; the
// caller commits it.
export function appendDecision(palaceRoot, { id, decision, why = '', by = 'loudon' } = {}) {
  const v = validateDecision({ id, decision, why });
  if (!v.ok) return { ok: false, status: 400, error: v.errors.join('; ') };
  const { placements } = readLedger(palaceRoot);
  const q = placements.find((p) => p.id === id);
  if (!q) return { ok: false, status: 404, error: `no placement ${id}` };
  const line = decisionLine(id, decision, { why, by });
  const abs = resolve(palaceRoot, LEDGER_REL);
  mkdirSync(dirname(abs), { recursive: true });
  if (!existsSync(abs)) appendFileSync(abs, `${JSON.stringify(ledgerHeader())}\n`, 'utf8');
  appendFileSync(abs, `${JSON.stringify(line)}\n`, 'utf8');
  return { ok: true, line, quote: { ...q, ...line } };
}

// The fingerprint of the section a `near` phrase sits in, computed the way
// the rich face computes it (parse.js), so a quote stamped at placement can
// be compared later. The rich face's sections are H1/H2 only; a phrase under
// an H3 is found by its words. Returns { key, heading, fp } or null.
export async function sectionStamp(entryText, heading, near = null) {
  const parsed = parseEntry(entryText);
  const want = heading ? sectionKey(heading) : null;
  let sec = want ? parsed.sections.find((s) => s.key === want) : null;
  if (!sec && near) {
    const phrase = normalize(near);
    sec = parsed.sections.find((s) => normalize(sectionProse(s)).includes(phrase));
  }
  if (!sec) sec = parsed.sections[0];
  if (!sec) return null;
  return { key: sec.key, heading: sec.heading, fp: await fingerprint(sectionProse(sec)) };
}

/**
 * Every placed (and retired) quote, anchored to its page as it stands.
 * @param {string} palaceRoot
 * @param {object} [opts]
 * @param {string} [opts.target] — a palace-relative entry path to narrow to
 * @param {Set<string>} [opts.onlyPaths] — keep quotes whose page is in this set (the public build)
 * @param {Array} [opts.entries] — a pre-listed entry index, to save the walk
 * @returns {Promise<{ quotes, count, lenses, pages, skipped, ledger_exists, ts }>}
 */
export async function resolveQuotes(palaceRoot, { target = null, onlyPaths = null, entries = null } = {}) {
  const { placements, skipped, exists } = readLedger(palaceRoot);
  const summaries = entries || listEntries(palaceRoot);
  const index = buildIndex(summaries);
  const byPath = new Map(summaries.map((s) => [s.path, s]));

  const entryCache = new Map();
  const readOnce = (path) => {
    if (!entryCache.has(path)) entryCache.set(path, readEntry(palaceRoot, path));
    return entryCache.get(path);
  };

  const quotes = [];
  for (const p of placements) {
    const targetPath = resolveWikilink(index, p.target).path;
    const lensPath = resolveWikilink(index, p.lens).path;
    if (target && targetPath !== target) continue;
    if (onlyPaths && (!targetPath || !onlyPaths.has(targetPath))) continue;

    const q = {
      ...p,
      target_path: targetPath,
      lens_path: lensPath,
      target_found: !!targetPath,
      lens_found: !!lensPath,
      anchor: { found: false, heading: null, excerpt: null },
      drift: null, // null = unknown; false = words unchanged; true = the section moved
      target_type: null,
      target_stage: null,
      target_pillars: [],
      target_forward_vector: null,
    };
    const sum = targetPath ? byPath.get(targetPath) : null;
    if (sum) {
      q.target_type = sum.type;
      q.target_stage = sum.stage;
      q.target_pillars = sum.pillars || [];
      q.target_forward_vector = sum.forward_vector;
    }
    if (targetPath) {
      const entry = readOnce(targetPath);
      if (entry) {
        const anchor = findNear(entry.body || '', p.near);
        q.anchor = anchor.found
          ? { found: true, heading: anchor.heading, excerpt: anchor.excerpt }
          : { found: false, heading: null, excerpt: null };
        if (p.made_against) {
          const text = readFileSync(resolve(palaceRoot, targetPath), 'utf8');
          const stamp = await sectionStamp(text, anchor.found ? anchor.heading : p.section, p.near);
          q.drift = stamp ? stamp.fp !== p.made_against : null;
        }
      }
    }
    quotes.push(q);
  }

  const active = quotes.filter((q) => q.status !== 'retired');
  const count = (m, k) => m.set(k, (m.get(k) || 0) + 1);
  const lensMap = new Map();
  const pageMap = new Map();
  for (const q of active) { count(lensMap, q.lens); count(pageMap, q.target); }
  const sorted = (m, pathOf) => [...m.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([title, n]) => ({ title, path: pathOf(title), count: n }));

  return {
    quotes,
    count: active.length,
    lenses: sorted(lensMap, (t) => resolveWikilink(index, t).path),
    pages: sorted(pageMap, (t) => resolveWikilink(index, t).path),
    skipped,
    ledger_exists: exists,
    ts: new Date().toISOString(),
  };
}
