// entry-paths.js — resolve a palace entry's file and its bundle folder from a
// title alone. The orchestrator joins a steward to its entry by `home` (the
// exact entry title); everything entry-local — the bundle, its scroll — is
// derivable from that one field. This module is that hinge.
//
// Obsidian resolves [[wikilinks]] flatly across the vault regardless of folder,
// so a title is enough to locate the entry; the bundle is its sibling folder of
// the same name (SCHEMA §8). Extracted as the canonical home for findEntryFile
// (build-cycle-prompt.js re-exports it for back-compat) so the scroll
// materializer and the prompt builder resolve paths the same way.

import { readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';

// System dirs that never hold knowledge entries (Substrate Skill § Directory Structure).
export const EXCLUDE_DIRS = new Set(['.git', '.claude', '.obsidian', 'node_modules', '_tools', '.venvs']);

// One index per palace root: every `<name>.md` → the path a walk meets first.
// A walk of the whole palace is ~5,300 folders (2026-11-03), and the PROJECTS
// deck asked for 47 of them on every 3 s poll — enough to peg the dev server
// and starve the steward lane's reap (a finished Wavetable Scanner cycle was
// lost to the restart). Now one walk builds the index; a hit is trusted only
// while its file still exists, and a miss or a stale hit walks again, so a new
// or moved entry is found the moment it is asked for, as before.
const indexes = new Map();

function buildIndex(palaceRoot) {
  const index = new Map();
  const stack = [palaceRoot];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (!EXCLUDE_DIRS.has(e.name)) stack.push(join(dir, e.name));
      } else if (e.name.endsWith('.md') && !index.has(e.name)) {
        index.set(e.name, join(dir, e.name));
      }
    }
  }
  indexes.set(palaceRoot, index);
  return index;
}

/**
 * Locate a palace entry file by title (Obsidian-style flat namespace): the
 * first `<title>.md` an iterative DFS of the tree meets, skipping system
 * directories and following no symlinks. Returns the absolute path or null.
 * Served from the root's index (above); the answer is the one a fresh walk
 * would give.
 *
 * @param {string} palaceRoot
 * @param {string} title — the entry title, no extension
 * @returns {string|null}
 */
export function findEntryFile(palaceRoot, title) {
  const target = `${title}.md`;
  const hit = indexes.get(palaceRoot)?.get(target);
  if (hit && existsSync(hit)) return hit;
  return buildIndex(palaceRoot).get(target) ?? null;
}

/**
 * Resolve the bundle folder for an entry: the sibling folder named identically
 * to the entry file (SCHEMA §8, `[Entry].md` ↔ `[Entry]/`). The folder need not
 * exist yet — bundles are lazy. Returns the entry file path and the bundle dir
 * path, or null when the entry file cannot be found.
 *
 * @param {string} palaceRoot
 * @param {string} home — the entry title
 * @returns {{ entryFile: string, bundleDir: string }|null}
 */
export function resolveBundleDir(palaceRoot, home) {
  const entryFile = findEntryFile(palaceRoot, home);
  if (!entryFile) return null;
  // Two layouts are handled: the sibling bundle every entry uses
  // (`Projects/Foo.md` ↔ `Projects/Foo/`), and an entry sitting inside a
  // folder of its own name (`Projects/Foo/Foo.md`). In the second, the folder
  // that holds the entry IS the bundle — a sibling `Foo/Foo/` would be a
  // phantom nested bundle.
  const parent = dirname(entryFile);
  if (basename(parent) === home) return { entryFile, bundleDir: parent };
  return { entryFile, bundleDir: join(parent, home) };
}
