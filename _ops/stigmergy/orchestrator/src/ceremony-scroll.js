// ceremony-scroll.js — which pages are ceremonies.
//
// A ceremony is a page that carries `trigger:`, the words Loudon says to begin
// it (SCHEMA §1; SCHEMA — Reference §6, v1.28). The field is the mark, not a
// ledger: any page may keep a tuning ledger, and a ceremony may not have one
// yet. The PROJECTS deck, the deck's canon guard, the commit hook and
// `_ops/swarm/lint-doc-drift.py` all read this one field, so the registers that
// used to disagree — a ledger here, a hand-kept list there, "ceremony" in a
// filename — are one. Connection, Query and the Ceremony Reader have no page of
// their own and stay rows in the tables.
//
// A ceremony's scroll is drawn by the same code as every page's
// (scroll-file.js), from what the page has; its ledgers are read by ledger.js.
// This file's name is older than that — it once drew a ceremony's scroll of its
// own, with no Plan, and sent every order to the ledger.
//
// Canon: [[Palace Ceremonies]] § What Makes a Ceremony, [[The Scroll]].

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, dirname, basename } from 'node:path';
import { findEntryFile, EXCLUDE_DIRS } from './entry-paths.js';
import { parseFrontmatter } from './entry-frontmatter.js';

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

/**
 * The trigger words a page's frontmatter carries, or null when it carries none.
 * `trigger:` is a list (`["deposit", "let's deposit"]`); a single string is
 * read as a list of one, since pages may write their fields loosely.
 */
export function readTrigger(fm) {
  const t = fm && fm.trigger;
  const list = Array.isArray(t) ? t : (typeof t === 'string' ? [t] : []);
  const words = list.map((w) => String(w == null ? '' : w).trim()).filter(Boolean);
  return words.length ? words : null;
}

/** A page's bundle: the sibling folder of its name, or the folder it sits in when that is its name. */
function bundleOf(entryFile, title) {
  const parent = dirname(entryFile);
  return basename(parent) === title ? parent : join(parent, title);
}

export function isCeremony(palaceRoot, home) {
  const file = findEntryFile(palaceRoot, home);
  if (!file) return false;
  try { return readTrigger(parseFrontmatter(readFileSync(file, 'utf8'))) != null; } catch { return false; }
}

/**
 * Every ceremony in the palace — every page carrying `trigger:`:
 * [{ title, path, trigger, tuning }], `tuning` the ledger's path or null.
 * Archived pages and symlinks (the `_`-import links to the World files) are
 * skipped.
 */
export function listCeremonies(palaceRoot) {
  const out = [];
  const stack = [palaceRoot];
  while (stack.length) {
    const dir = stack.pop();
    let ents;
    try { ents = readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of ents) {
      if (e.isDirectory()) { if (!EXCLUDE_DIRS.has(e.name) && e.name !== 'Archive') stack.push(join(dir, e.name)); continue; }
      if (!e.name.endsWith('.md') || e.isSymbolicLink()) continue;
      const file = join(dir, e.name);
      let text;
      try { text = readFileSync(file, 'utf8'); } catch { continue; }
      const m = FRONTMATTER_RE.exec(text);
      if (!m || !/^trigger:/m.test(m[1])) continue;   // cheap test before the YAML parse
      const trigger = readTrigger(parseFrontmatter(text));
      if (!trigger) continue;
      const title = e.name.slice(0, -3);
      const tuningAbs = join(bundleOf(file, title), `${title} — tuning.md`);
      out.push({ title, path: relative(palaceRoot, file), trigger, tuning: existsSync(tuningAbs) ? relative(palaceRoot, tuningAbs) : null });
    }
  }
  return out.sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * The files the careful edit path treats as ceremony canon: each ceremony's
 * page, and its Context companion where it keeps one (SCHEMA — Reference §6).
 * A Set of palace-relative paths, for `checkCanon` in the app's entry-edit.js.
 */
export function ceremonyCanonPaths(palaceRoot, ceremonies = listCeremonies(palaceRoot)) {
  const paths = new Set();
  for (const c of ceremonies) {
    paths.add(c.path);
    const ctx = join(bundleOf(join(palaceRoot, c.path), c.title), `${c.title} — Context.md`);
    if (existsSync(ctx)) paths.add(relative(palaceRoot, ctx));
  }
  return paths;
}
