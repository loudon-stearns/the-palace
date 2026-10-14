#!/usr/bin/env node
// palace-land -- land a branch on main, through the door. The palace's `git land`.
//
// Usage (from any checkout of the palace):
//   node _ops/stigmergy/app/scripts/palace-land.mjs <branch> [--summary "..."] [--verify verified|unverified|couldnt] [--dry-run]
//
// What it does, all inside the door (server/door.js), in the palace's main
// checkout, whichever checkout you run it from:
//   1. finishes or undoes a landing that died halfway, if it finds one
//      (server/landing.js);
//   2. refuses when the main checkout is off main or something is half done;
//   3. says "already landed" when the branch is already on main;
//   4. tries the merge against main as it stands that moment, outside every
//      checkout (`git merge-tree`), and refuses a conflict, naming the files;
//   5. refuses when a file the landing would change is unsaved or untracked in
//      Loudon's folder, naming it: that file is someone's work;
//   6. builds a true merge commit (main first parent, the branch second), writes
//      a marker, moves main and the folder together with a fast-forward, and
//      clears the marker.
// One line comes back: "landed <hash>; main is N ahead of origin", or one
// sentence saying why not and what to do. Exit 0 landed or already landed,
// 2 refused, 75 the door stayed shut.
//
// A conflict is settled in the branch's own worktree (merge main into it,
// resolve, commit), never in Loudon's folder; then land again.

import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { withDoorSync, trunkProblem, DoorBusyError } from '../server/door.js';
import { LockHeldError } from '../server/git-locks.js';
import { writeMarker, clearMarker, mainCheckout } from '../server/landing.js';
import { VERIFY_VALUES } from '../src/lib/commit-spec.js';

function git(root, args, { allowFail = false } = {}) {
  try {
    return execFileSync('git', args, {
      cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
    });
  } catch (e) {
    if (allowFail) return null;
    throw e;
  }
}

function fail(code, text) {
  process.stderr.write(text.endsWith('\n') ? text : `${text}\n`);
  process.exit(code);
}

export function parseArgs(argv) {
  const opts = { branch: null, summary: null, verify: 'unverified', dryRun: false, unknown: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--summary') opts.summary = argv[++i];
    else if (a === '--verify') opts.verify = argv[++i];
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a.startsWith('--')) opts.unknown.push(a);
    else if (!opts.branch) opts.branch = a;
    else opts.unknown.push(a);
  }
  return opts;
}

export function landingMessage({ branch, summary, verify }) {
  const scope = branch.replace(/^(feature|fix|land|claude|prepare)\//, '');
  return `merge(${scope}): ${summary || `land ${branch}`}\n\nLanded with palace-land through the door.\n\nPalace-Kind: merge\nPalace-Verify: ${verify}\nPalace-Author: claude\n`;
}

// Files in the main checkout that are modified, staged or untracked, by path.
function unsavedPaths(owner) {
  const out = git(owner, ['-c', 'core.quotepath=false', 'status', '--porcelain=v1', '-z', '--untracked-files=all']);
  const set = new Set();
  const parts = out.split('\0');
  for (let i = 0; i < parts.length; i += 1) {
    const e = parts[i];
    if (!e) continue;
    set.add(e.slice(3));
    if (e[0] === 'R' || e[0] === 'C') i += 1; // the rename's source follows
  }
  return set;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.unknown.length) fail(2, `palace-land: unknown argument ${opts.unknown.join(', ')}. Nothing was landed.`);
  if (!opts.branch) fail(2, 'palace-land: name the branch to land, e.g. palace-land feature/my-work');
  if (!VERIFY_VALUES.includes(opts.verify)) fail(2, `palace-land: --verify must be one of ${VERIFY_VALUES.join(', ')}`);

  const here = process.env.PALACE_ROOT ? resolve(process.env.PALACE_ROOT) : resolve(git(process.cwd(), ['rev-parse', '--show-toplevel']).trim());
  const owner = mainCheckout(here);
  const tmp = mkdtempSync(join(tmpdir(), 'palace-land-'));
  let result;
  try {
    result = withDoorSync(owner, `land:${opts.branch}`, (dgit) => {
      const problem = trunkProblem(owner);
      if (problem) return { refused: problem };

      const tip = git(owner, ['rev-parse', '-q', '--verify', `${opts.branch}^{commit}`], { allowFail: true });
      if (!tip) return { refused: `there is no branch "${opts.branch}".` };
      const branchTip = tip.trim();
      const before = git(owner, ['rev-parse', 'refs/heads/main']).trim();
      if (git(owner, ['merge-base', '--is-ancestor', branchTip, before], { allowFail: true }) !== null) {
        return { already: true, before };
      }

      // The trial, outside every checkout: exit 1 means conflicts, listed by name.
      let tree;
      try {
        tree = git(owner, ['merge-tree', '--write-tree', '--name-only', '--no-messages', before, branchTip]).trim().split('\n')[0];
      } catch (e) {
        const lines = String(e.stdout || '').trim().split('\n').slice(1).filter(Boolean);
        return { refused: `the branch conflicts with main in ${lines.join(', ') || 'some files'}. Merge main into the branch in its own worktree, settle it there, commit, and land again.` };
      }

      const msgFile = join(tmp, 'MSG');
      writeFileSync(msgFile, landingMessage(opts));
      const merge = git(owner, ['commit-tree', tree, '-p', before, '-p', branchTip, '-F', msgFile]).trim();

      const changed = git(owner, ['-c', 'core.quotepath=false', 'diff', '--name-only', '-z', before, merge]).split('\0').filter(Boolean);
      const unsaved = unsavedPaths(owner);
      const inTheWay = changed.filter((p) => unsaved.has(p));
      if (inTheWay.length) {
        return { refused: `${inTheWay.length === 1 ? 'a file' : `${inTheWay.length} files`} the landing would change ${inTheWay.length === 1 ? 'is' : 'are'} unsaved or untracked in the main checkout: ${inTheWay.join(', ')}. ${inTheWay.length === 1 ? 'It is' : 'They are'} someone's work; get ${inTheWay.length === 1 ? 'it' : 'them'} committed or set aside by their owner, then land again.` };
      }

      if (opts.dryRun) return { dry: true, merge, changed: changed.length, before };

      writeMarker(owner, { root: owner, old: before, new: merge, branch: opts.branch });
      dgit(['merge', '--ff-only', '-q', merge]);
      clearMarker(owner);
      return { landed: true, merge, before, changed: changed.length };
    });
  } catch (e) {
    if (e instanceof DoorBusyError || e instanceof LockHeldError) fail(75, e.message);
    if (e && e.stderr) fail(1, `palace-land: ${String(e.stderr).trim()}`);
    throw e;
  } finally {
    try { rmSync(tmp, { recursive: true, force: true }); } catch (_) { /* ignore */ }
  }

  if (result.refused) fail(2, `palace-land: refused: ${result.refused}`);
  if (result.already) { process.stdout.write(`palace-land: ${opts.branch} is already on main\n`); process.exit(0); }
  if (result.dry) { process.stdout.write(`palace-land: dry run: would land ${opts.branch} as a merge changing ${result.changed} file${result.changed === 1 ? '' : 's'}; nothing moved\n`); process.exit(0); }
  const ahead = git(owner, ['rev-list', '--count', 'origin/main..main'], { allowFail: true });
  process.stdout.write(`palace-land: landed ${result.merge.slice(0, 8)}${ahead ? `; main is ${ahead.trim()} ahead of origin` : ''}\n`);
  process.exit(0);
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('palace-land.mjs');
if (invokedDirectly) main();
