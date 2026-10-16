// server/ceremony-register.js — which files are ceremony canon, for the careful
// edit path (src/lib/entry-edit.js checkCanon).
//
// A ceremony is a page carrying `trigger:` (SCHEMA v1.28); its page and its
// Context companion are canon the careful path will not write. The list comes
// from the palace itself (orchestrator/src/ceremony-scroll.js), walked at most
// every 30 s per palace root — a save is rare, but the entry API asks on every
// read.

import { ceremonyCanonPaths } from '../../orchestrator/src/ceremony-scroll.js';

const cache = new Map(); // palaceRoot → { at, paths }

/** The Set of palace-relative paths that are ceremony canon. Never throws. */
export function ceremonyPathsFor(palaceRoot, { maxAgeMs = 30000 } = {}) {
  if (!palaceRoot) return new Set();
  const hit = cache.get(palaceRoot);
  const t = Date.now();
  if (hit && t - hit.at < maxAgeMs) return hit.paths;
  let paths;
  try { paths = ceremonyCanonPaths(palaceRoot); } catch { paths = hit ? hit.paths : new Set(); }
  cache.set(palaceRoot, { at: t, paths });
  return paths;
}
