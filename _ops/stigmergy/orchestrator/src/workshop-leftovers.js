// workshop-leftovers.js — what a steward's bundle holds that git does not.
//
// A cycle commits only the paths its own messages declare (cycle-commit.js).
// A spawn that dies before posting declares nothing, so everything it wrote is
// left untracked: on 2026-10-24 the Generative Preset Development steward's
// cycle 10 wrote `vital/` for 25 minutes, ended mid-wait, was recorded barren,
// and its commit took only the scroll. The folder sat unseen until 2026-10-26.
//
// The cycle does not sweep such files in. No steward edits the house without
// Loudon's eyes, and a file no message declared is one nobody has looked at:
// it may be a dead spawn's work, a half-written file, or Loudon's own edit in
// the bundle. So it names them, said the same way everywhere a person looks:
// the commit body, a WORKSHOP_LEFTOVERS line in history, and the scroll's Now.

import { spawnSync } from 'node:child_process';
import { relative, join, isAbsolute, resolve } from 'node:path';

const STATE = { '?': 'new', D: 'deleted' };

/**
 * Every file under the bundle that git sees as not committed — untracked (not
 * ignored), changed or deleted — palace-relative and sorted, as { path, state }
 * with state 'new' | 'changed' | 'deleted'. The scroll and tuning ledger the
 * cycle writes are left out, and so is anything in `exclude` (palace-relative
 * or absolute). Read through git with no optional locks, so it never contends
 * with a writer. Never throws: when git cannot answer, it says nothing.
 */
export function uncommittedInBundle(palaceRoot, bundleDir, { home = null, exclude = [] } = {}) {
  if (!bundleDir) return [];
  const root = resolve(palaceRoot);
  const bundle = isAbsolute(bundleDir) ? resolve(bundleDir) : resolve(root, bundleDir);
  const rel = relative(root, bundle);
  if (!rel || rel.startsWith('..') || isAbsolute(rel)) return [];
  const skip = new Set(exclude.map((p) => relative(root, isAbsolute(p) ? resolve(p) : resolve(root, p))));
  if (home) for (const own of ['scroll', 'tuning']) skip.add(join(rel, `${home} — ${own}.md`));
  let r;
  try {
    r = spawnSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--no-renames', '--', rel], {
      cwd: root, encoding: 'utf8', timeout: 15_000, maxBuffer: 16 * 1024 * 1024,
      env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_LITERAL_PATHSPECS: '1' },
    });
  } catch { return []; }
  if (!r || r.status !== 0 || typeof r.stdout !== 'string') return [];
  const out = [];
  for (const rec of r.stdout.split('\0')) {
    if (rec.length < 4) continue;
    const xy = rec.slice(0, 2);
    const path = rec.slice(3);
    if (xy === '!!' || skip.has(path)) continue;
    out.push({ path, state: STATE[xy[0]] || STATE[xy[1]] || 'changed' });
  }
  return out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0)); // git's order, by code point
}

/** The leftovers as list lines, at most `max`, then a count of the rest. */
export function leftoverLines(leftovers = [], { max = 30 } = {}) {
  const shown = leftovers.slice(0, max).map((l) => `- ${l.path} (${l.state})`);
  if (leftovers.length > max) shown.push(`- … and ${leftovers.length - max} more`);
  return shown;
}
