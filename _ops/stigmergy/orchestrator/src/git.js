// git.js — page-change detection per the Palace Orchestrator entry (Definitions of record).
//
// Wraps `git log` to detect commits to a palace entry since a given timestamp.
// The orchestrator skill calls this before each cycle to construct
// PAGE_UPDATE_NOTICEs and to detect forward-vector drift.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, relative, basename } from 'node:path';
import { resolveBundleDir } from './entry-paths.js';

/**
 * Run a git command, returning stdout. Throws with stderr on failure.
 */
function git(args, cwd) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    const stderr = e.stderr ? e.stderr.toString() : e.message;
    throw new Error(`git ${args.join(' ')} failed: ${stderr.trim()}`);
  }
}

/**
 * Resolve the palace entry path for a wikilink target. Searches recursively
 * from the palace root for a `.md` file matching the entry name (filename
 * without extension). Excludes .git/, .claude/, .obsidian/, node_modules/,
 * _ops/swarm/sessions/.
 *
 * Note: this is a "best effort" resolver — if multiple matches exist it
 * returns the first found. Production palace assumes filename uniqueness.
 *
 * @param {string} palaceRoot
 * @param {string} entryName
 * @returns {string | null} absolute path, or null if not found
 */
export function resolveEntryPath(palaceRoot, entryName) {
  // Use git ls-files to enumerate tracked .md files quickly.
  let files;
  try {
    files = git(['ls-files', '--', '*.md'], palaceRoot).split('\n').filter(Boolean);
  } catch {
    return null;
  }
  const target = `${entryName}.md`;
  // Excluded prefixes:
  const excluded = ['.git/', '.claude/', '.obsidian/', 'node_modules/'];
  for (const f of files) {
    if (excluded.some((p) => f.startsWith(p))) continue;
    if (f === target) return resolve(palaceRoot, f);
    if (f.endsWith('/' + target)) return resolve(palaceRoot, f);
  }
  return null;
}

/**
 * Detect git changes to a file since a given ISO timestamp.
 *
 * Returns commits as `{ hash, ts, author, subject }` objects in chronological
 * order (oldest first). Empty array if no changes (or file untracked).
 *
 * @param {string} palaceRoot
 * @param {string} fileRelativePath — relative to palaceRoot
 * @param {string} sinceIso
 */
export function getChangesSince(palaceRoot, fileRelativePath, sinceIso) {
  if (!existsSync(resolve(palaceRoot, fileRelativePath))) {
    return [];
  }
  const out = git(
    [
      'log',
      `--since=${sinceIso}`,
      '--reverse',
      '--pretty=format:%H%x09%aI%x09%an%x09%s',
      '--follow',
      '--',
      fileRelativePath,
    ],
    palaceRoot
  );
  if (!out.trim()) return [];
  return out.trim().split('\n').map((line) => {
    const [hash, ts, author, ...subjectParts] = line.split('\t');
    return { hash, ts, author, subject: subjectParts.join('\t') };
  });
}

/**
 * Check whether a palace entry has been modified since `sinceIso`. The entry
 * is resolved to its file via resolveEntryPath.
 *
 * @returns {{ resolved: string | null, changed: boolean, commits: Array }}
 */
export function checkPageChange(palaceRoot, entryName, sinceIso) {
  const abs = resolveEntryPath(palaceRoot, entryName);
  if (!abs) {
    return { resolved: null, changed: false, commits: [] };
  }
  // Convert abs back to a path relative to palaceRoot for git.
  const rel = abs.slice(palaceRoot.endsWith('/') ? palaceRoot.length : palaceRoot.length + 1);
  const commits = getChangesSince(palaceRoot, rel, sinceIso);
  return { resolved: abs, changed: commits.length > 0, commits };
}

/**
 * Detect commits to the home entry's bundle faces and memory since `sinceIso`:
 * the files named `<home> — …` at the bundle's top (rich face, Context, face),
 * which a live session may change while the steward sleeps. Left out: the
 * scroll and the tuning ledger, which the cycle writes and injects itself; the
 * steward's own cycle commits; and the workshop below the top. Each commit
 * carries the bundle files it touched. (Loudon, 2026-11-08: "Yes, all three".)
 *
 * @returns {{ changed: boolean, commits: Array }}
 */
export function checkBundleChange(palaceRoot, home, sinceIso) {
  const found = resolveBundleDir(palaceRoot, home);
  if (!found || !existsSync(found.bundleDir)) return { changed: false, commits: [] };
  const rel = relative(palaceRoot, found.bundleDir);
  const out = git(
    [
      '-c',
      'core.quotepath=off',
      'log',
      `--since=${sinceIso}`,
      '--reverse',
      '--no-merges',
      '--name-only',
      '--pretty=format:%x1e%H%x09%aI%x09%an%x09%s',
      '--',
      `:(glob)${rel}/${home} — *`,
      `:(exclude,glob)${rel}/${home} — scroll.md`,
      `:(exclude,glob)${rel}/${home} — tuning.md`,
    ],
    palaceRoot
  );
  const commits = out.split('\x1e').map((s) => s.trim()).filter(Boolean).map((block) => {
    const [head, ...files] = block.split('\n').filter(Boolean);
    const [hash, ts, author, ...subjectParts] = head.split('\t');
    return { hash, ts, author, subject: subjectParts.join('\t'), files: files.map((f) => basename(f)) };
  }).filter((c) => !c.subject.startsWith('steward('));
  return { changed: commits.length > 0, commits };
}

/**
 * Read the current frontmatter `forward_vector` field of an entry by reading
 * the file directly (not git). Returns null if the file or field is absent.
 *
 * Used by the skill workflow for forward-vector drift detection. The live
 * frontmatter value is the single source of truth; whether it has *changed*
 * since the steward last ran is detected via `checkPageChange` (git commits to
 * the entry since `state.last_active`), NOT against a duplicated copy in
 * state.json — that copy was removed in the Bundle-Local Stewardship SSOT
 * cutover (2026-06-09).
 */
export function readForwardVector(palaceRoot, entryName) {
  const abs = resolveEntryPath(palaceRoot, entryName);
  if (!abs) return null;
  const text = readFileSync(abs, 'utf8');
  const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return null;
  const fm = fmMatch[1];
  // Look for either "forward_vector: ..." (single-line) or "forward_vector: >\n  ..." (block scalar)
  const single = fm.match(/^forward_vector:\s*"?([^"\n]+)"?\s*$/m);
  if (single) return single[1].trim();
  const block = fm.match(/^forward_vector:\s*>\s*\n([\s\S]+?)(?=\n[a-z_]+:|\n$)/m);
  if (block) {
    return block[1].split('\n').map((l) => l.trim()).filter(Boolean).join(' ');
  }
  return null;
}
