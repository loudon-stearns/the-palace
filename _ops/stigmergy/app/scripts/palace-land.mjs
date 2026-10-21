#!/usr/bin/env node
// palace-land -- land a branch on main, through the door. The palace's `git land`.
//
// Usage (from any checkout of the palace):
//   node _ops/stigmergy/app/scripts/palace-land.mjs <branch | HEAD> [--summary "..."] [--verify verified|unverified|couldnt] [--dry-run]
//
// HEAD (or @) means the branch of the checkout you run it from. Only a local
// branch lands; a tag or a bare commit id is refused.
//
// What it does, all inside the door (server/door.js), in the palace's main
// checkout, whichever checkout you run it from:
//   1. heals a landing that died halfway, if the door finds one
//      (server/landing.js), and refuses while one still stands;
//   2. refuses when the main checkout is off main or something is half done;
//   3. says "already landed" when the branch is already on main;
//   4. tries the merge against main as it stands that moment, outside every
//      checkout (`git merge-tree`), and refuses a conflict, naming the files;
//      a ledger merged by union never conflicts, so it also reads what the
//      merge made of each one both sides changed, and refuses an item number
//      twice, an item in two forms, or two lines joined, naming the items
//      (src/lib/ledger-merge.js); a heading run on is only noted;
//   5. refuses when a file the landing would change, or a folder on its way,
//      is unsaved, untracked or ignored in Loudon's folder, naming it: that is
//      someone's work, or something local that git would overwrite;
//   6. builds a true merge commit (main first parent, the branch second), writes
//      a marker, moves main and the folder together with a fast-forward, and
//      clears the marker. If git refuses or fails the fast-forward, whatever it
//      wrote is put back and the marker cleared before the refusal is reported,
//      so a landing reported as not done never lands later. If git is killed,
//      the landing is healed on the spot.
// One line comes back: "landed <hash>; main is N ahead of origin", or one
// sentence saying why not and what to do. Exit 0 landed or already landed,
// 2 refused, 75 the door or a lock stayed shut (retry), 1 git failed.
//
// A conflict is settled in the branch's own worktree (merge main into it,
// resolve, commit), never in Loudon's folder; then land again.
//
// --dry-run checks everything without taking the door and moves nothing.

import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { withDoorSync, trunkProblem, DoorBusyError } from '../server/door.js';
import { LockHeldError } from '../server/git-locks.js';
import { writeMarker, readMarker, clearMarker, mainCheckout, recoverLanding } from '../server/landing.js';
import { VERIFY_VALUES } from '../src/lib/commit-spec.js';
import { ledgerDefects, describeDefect } from '../src/lib/ledger-merge.js';

function git(root, args, { allowFail = false } = {}) {
  try {
    return execFileSync('git', args, {
      cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
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
    if (a === '--summary' || a === '--verify') {
      const v = argv[++i];
      if (v === undefined || v.startsWith('--')) { opts.unknown.push(`${a} (no value)`); continue; }
      if (a === '--summary') opts.summary = v; else opts.verify = v;
    } else if (a === '--dry-run') opts.dryRun = true;
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

// The branch a name means, read in the checkout it was run from: HEAD and @
// are that checkout's own branch, never the main checkout's.
export function branchName(here, name) {
  if (name === 'HEAD' || name === '@') {
    const sym = git(here, ['symbolic-ref', '-q', '--short', 'HEAD'], { allowFail: true });
    if (!sym || !sym.trim()) return { refused: 'HEAD here is not on a branch; name the branch to land.' };
    return { branch: sym.trim() };
  }
  return { branch: name.replace(/^refs\/heads\//, '') };
}

// Paths in the main checkout that are modified, staged, untracked or ignored.
// A rename's source counts as well as its destination.
function localPaths(owner) {
  const out = git(owner, ['-c', 'core.quotepath=false', 'status', '--porcelain=v1', '-z', '--untracked-files=all', '--ignored=matching']);
  const rows = [];
  const parts = out.split('\0');
  for (let i = 0; i < parts.length; i += 1) {
    const e = parts[i];
    if (!e) continue;
    const code = e.slice(0, 2);
    rows.push({ path: e.slice(3).replace(/\/$/, ''), shown: e.slice(3), code });
    if (code[0] === 'R' || code[0] === 'C') { i += 1; if (parts[i]) rows.push({ path: parts[i], code }); }
  }
  return rows;
}

// The changed paths something local stands in the way of: the same path, a
// folder above it, or something below it (a file the landing writes where a
// folder holds local files). Compared without case on a case-insensitive disk.
export function inTheWay(changed, local, { ignoreCase = false } = {}) {
  const fold = ignoreCase ? (s) => s.toLowerCase() : (s) => s;
  const exact = new Map();
  const above = new Map(); // every folder that holds a local path -> one such path
  for (const l of local) {
    const p = fold(l.path);
    exact.set(p, l);
    const parts = p.split('/');
    for (let i = 1; i < parts.length; i += 1) {
      const d = parts.slice(0, i).join('/');
      if (!above.has(d)) above.set(d, l);
    }
  }
  const hits = [];
  for (const c of changed) {
    const p = fold(c);
    let hit = exact.get(p) || above.get(p);
    const parts = p.split('/');
    for (let i = 1; !hit && i < parts.length; i += 1) hit = exact.get(parts.slice(0, i).join('/'));
    if (hit) hits.push({ path: c, local: hit.shown || hit.path, ignored: hit.code === '!!' });
  }
  return hits;
}

function wayRefusal(hits) {
  const n = hits.length;
  const named = hits.slice(0, 8).map((h) => (h.local === h.path ? h.path : `${h.path} (in the way: ${h.local})`)).join(', ') + (n > 8 ? `, and ${n - 8} more` : '');
  const ignored = hits.some((h) => h.ignored);
  return `${n === 1 ? 'a path' : `${n} paths`} the landing would change ${n === 1 ? 'meets' : 'meet'} something unsaved, untracked${ignored ? ' or ignored' : ''} in the main checkout: ${named}. That is someone's work${ignored ? ', or something local that git would overwrite' : ''}; get it committed or set aside by its owner, then land again.`;
}

// The trial merge, outside every checkout. Exit 1 means conflicts, listed by
// name (NUL-separated, so em-dash names stay readable); any other failure is
// git's own error.
function trialMerge(owner, before, tip) {
  const r = spawnSync('git', ['-c', 'core.quotepath=false', 'merge-tree', '--write-tree', '--name-only', '--no-messages', '-z', before, tip], {
    cwd: owner, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
  });
  const parts = String(r.stdout || '').split('\0');
  if (r.status === 0) return { tree: parts[0] };
  if (r.status === 1) {
    const names = [];
    for (const p of parts.slice(1)) {
      if (!p) break;
      const n = p.replace(/~[0-9a-f]{7,64}$/, ''); // a file/folder clash is named by git's side-name
      if (!names.includes(n)) names.push(n);
    }
    return { refused: `the branch conflicts with main in ${names.join(', ') || 'some files'}. Merge main into the branch in its own worktree, settle it there, commit, and land again.` };
  }
  return { refused: `git could not try the merge: ${String(r.stderr || '').trim() || `exit ${r.status}`}` };
}

// The union-merged ledgers among the changed paths, by the merge attribute
// git itself read for the trial merge (.gitattributes in the main checkout).
function unionPaths(owner, paths) {
  if (!paths.length) return { paths: [] };
  const r = spawnSync('git', ['-c', 'core.quotepath=false', 'check-attr', '--stdin', '-z', 'merge'], {
    cwd: owner, input: `${paths.join('\0')}\0`, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
  });
  if (r.status !== 0) return { refused: `git could not read the merge attributes: ${String(r.stderr || '').trim() || `exit ${r.status}`}` };
  const parts = String(r.stdout).split('\0');
  const union = [];
  for (let i = 0; i + 2 < parts.length; i += 3) if (parts[i + 2] === 'union') union.push(parts[i]);
  return { paths: union };
}

function blobAt(owner, rev, path) {
  const r = spawnSync('git', ['cat-file', 'blob', `${rev}:${path}`], {
    cwd: owner, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
  });
  return r.status === 0 ? r.stdout : null;
}

// The item numbers each merge inside the branch doubled by union in a ledger
// (the branch merging main in, as a refused landing is told to): path ->
// numbers. Only a merge whose ledger differs from both its parents can have
// doubled one.
function carriedDuplicates(owner, before, tip, paths) {
  const out = new Map();
  if (!paths.length) return out;
  const merges = (git(owner, ['rev-list', '--merges', `${before}..${tip}`, '--', ...paths], { allowFail: true }) || '').split('\n').filter(Boolean);
  for (const m of merges) {
    const parents = git(owner, ['rev-parse', `${m}^1`, `${m}^2`], { allowFail: true });
    if (!parents) continue;
    const [p1, p2] = parents.trim().split('\n');
    for (const path of paths) {
      const merged = blobAt(owner, m, path);
      const ours = blobAt(owner, p1, path);
      const theirs = blobAt(owner, p2, path);
      if (merged === null || merged === ours || merged === theirs) continue;
      const items = ledgerDefects({ ours: ours ?? '', theirs: theirs ?? '', merged }).refuse.filter((d) => d.item).map((d) => d.item);
      if (items.length) out.set(path, [...new Set([...(out.get(path) || []), ...items])]);
    }
  }
  return out;
}

// A ledger git merged by union never conflicts, so the trial merge cannot
// refuse what union gets wrong: an item number twice, an item in two forms,
// two lines joined. This reads what the landing makes of each union-merged
// ledger it changes, the branch's own merges of main included, and refuses
// those, naming the items; a heading run on from the line above is only noted
// (src/lib/ledger-merge.js).
export function ledgerCheck(owner, before, tip, merge, changed) {
  const union = unionPaths(owner, changed);
  if (union.refused) return union;
  const carried = carriedDuplicates(owner, before, tip, union.paths);
  const found = [];
  const notes = [];
  for (const path of union.paths) {
    const merged = blobAt(owner, merge, path);
    if (merged === null) continue; // the landing deletes it
    const r = ledgerDefects({ ours: blobAt(owner, before, path) ?? '', theirs: blobAt(owner, tip, path) ?? '', merged, carried: carried.get(path) || [] });
    if (r.refuse.length) found.push(`${path}: ${r.refuse.slice(0, 4).map(describeDefect).join(', ')}${r.refuse.length > 4 ? `, and ${r.refuse.length - 4} more` : ''}`);
    for (const n of r.notes) notes.push(`in ${path}, ${describeDefect(n)}; give it a blank line at the ledger's next run`);
  }
  if (found.length) {
    return { refused: `the merge would leave ${found.join('; ')}. Git's union merge keeps both sides of a ledger without a conflict, so it cannot see this. Merge main into the branch in its own worktree, renumber or settle the items there, commit, and land again.` };
  }
  return { notes };
}

// Everything short of moving anything: the branch tip, already-landed, the
// trial merge, the merge commit, the ledgers union merged, and what stands in
// the way.
function plan(owner, branch, opts, tmp) {
  const tip = git(owner, ['rev-parse', '-q', '--verify', `refs/heads/${branch}^{commit}`], { allowFail: true });
  if (!tip) return { refused: `there is no branch "${branch}".` };
  const branchTip = tip.trim();
  const before = git(owner, ['rev-parse', 'refs/heads/main']).trim();
  if (git(owner, ['merge-base', '--is-ancestor', branchTip, before], { allowFail: true }) !== null) return { already: true, before };
  const trial = trialMerge(owner, before, branchTip);
  if (trial.refused) return trial;
  const msgFile = join(tmp, 'MSG');
  writeFileSync(msgFile, landingMessage({ ...opts, branch }));
  const merge = git(owner, ['commit-tree', trial.tree, '-p', before, '-p', branchTip, '-F', msgFile]).trim();
  const changed = git(owner, ['-c', 'core.quotepath=false', 'diff', '--name-only', '-z', '--no-renames', before, merge]).split('\0').filter(Boolean);
  const ledgers = ledgerCheck(owner, before, branchTip, merge, changed);
  if (ledgers.refused) return ledgers;
  const ignoreCase = (git(owner, ['config', '--bool', 'core.ignorecase'], { allowFail: true }) || '').trim() === 'true';
  const hits = inTheWay(changed, localPaths(owner), { ignoreCase });
  if (hits.length) return { refused: wayRefusal(hits) };
  return { before, merge, changed, notes: ledgers.notes };
}

// git's refusal in a sentence, keeping the paths it names.
function gitRefusal(e) {
  const text = String(e.stderr || e.message || '').trim();
  const files = text.split('\n').filter((l) => /^\t/.test(l)).map((l) => l.trim());
  if (/would be overwritten|would be removed|untracked working tree files/i.test(text)) {
    return `git refused to move the folder: ${files.length ? `${files.join(', ')} would be overwritten or removed` : text.split('\n')[0]}. That is someone's work; get it committed or set aside by its owner, then land again.`;
  }
  return `git refused the fast-forward: ${text.split('\n').slice(0, 3).join(' ')}`;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.unknown.length) fail(2, `palace-land: unknown argument ${opts.unknown.join(', ')}. Nothing was landed.`);
  if (!opts.branch) fail(2, 'palace-land: name the branch to land, e.g. palace-land feature/my-work (or HEAD for this checkout\'s branch)');
  if (!VERIFY_VALUES.includes(opts.verify)) fail(2, `palace-land: --verify must be one of ${VERIFY_VALUES.join(', ')}`);

  let here;
  try {
    here = process.env.PALACE_ROOT ? resolve(process.env.PALACE_ROOT) : resolve(git(process.cwd(), ['rev-parse', '--show-toplevel']).trim());
  } catch (_) {
    fail(2, 'palace-land: run it from a checkout of the palace (this is not one). Nothing was landed.');
  }
  const named = branchName(here, opts.branch);
  if (named.refused) fail(2, `palace-land: refused: ${named.refused}`);
  const { branch } = named;
  const owner = mainCheckout(here);
  const tmp = mkdtempSync(join(tmpdir(), 'palace-land-'));

  let result;
  try {
    if (opts.dryRun) {
      const standing = readMarker(owner);
      const problem = trunkProblem(owner);
      result = problem ? { refused: problem } : { ...plan(owner, branch, opts, tmp), dry: true, standing };
    } else {
      result = withDoorSync(owner, `land:${branch}`, (dgit) => {
        const standing = readMarker(owner);
        if (standing) {
          return { refused: `a landing that died halfway (${standing.branch || 'unnamed'}) still stands; the door could not heal it (its reason is printed above). Nothing was landed; trunk-state shows it.` };
        }
        const problem = trunkProblem(owner);
        if (problem) return { refused: problem };
        const p = plan(owner, branch, opts, tmp);
        if (p.refused || p.already) return p;

        writeMarker(owner, { root: owner, old: p.before, new: p.merge, branch });
        try {
          dgit(['merge', '--ff-only', '--no-overwrite-ignore', '-q', p.merge]);
        } catch (e) {
          const now = git(owner, ['rev-parse', 'refs/heads/main']).trim();
          if (now === p.merge) { clearMarker(owner); return { landed: true, ...p }; } // git moved main, then complained
          if (e.signal) {
            // git was killed mid-landing: heal it now, while this process holds the door.
            const healed = recoverLanding(owner, { git: dgit, tag: `land:${branch}`, trunkProblem });
            return healed && healed.finished
              ? { landed: true, ...p, note: healed.line }
              : { refused: `git was killed mid-landing: ${healed ? healed.line : 'nothing was left to heal'}` };
          }
          // git refused or failed: put back whatever it wrote and drop the
          // marker, so a landing reported as not done never lands later.
          // If the undo cannot run now, the marker says "abandon", and the next
          // pass through the door undoes it instead of finishing it.
          writeMarker(owner, { root: owner, old: p.before, new: p.merge, branch, abandon: true });
          let after = '';
          try {
            const undone = recoverLanding(owner, { git: dgit, tag: `land:${branch}`, trunkProblem });
            if (undone && (undone.waiting || undone.stuck)) after = ' The landing is marked to be undone; the next pass through the door does it.';
            else if (undone && undone.named && undone.named.length) after = ` ${undone.line}`;
          } catch (u) {
            after = ` The landing is marked to be undone; the next pass through the door does it (${u.message}).`;
          }
          if (e instanceof LockHeldError) { e.message += after; throw e; }
          return { refused: `${gitRefusal(e)}${after}` };
        }
        clearMarker(owner);
        return { landed: true, ...p };
      });
    }
  } catch (e) {
    if (e instanceof DoorBusyError || e instanceof LockHeldError) fail(75, e.message);
    if (e && e.stderr) fail(1, `palace-land: ${String(e.stderr).trim()}`);
    fail(1, `palace-land: ${e && e.message ? e.message : e}`);
  } finally {
    try { rmSync(tmp, { recursive: true, force: true }); } catch (_) { /* ignore */ }
  }

  if (result.refused) fail(2, `palace-land: refused: ${result.refused}`);
  if (result.already) { process.stdout.write(`palace-land: ${branch} is already on main\n`); process.exit(0); }
  for (const n of result.notes || []) process.stderr.write(`palace-land: note: ${n}\n`);
  if (result.dry) {
    const waiting = result.standing ? `; a landing that died halfway (${result.standing.branch || 'unnamed'}) is waiting, and the next pass through the door heals it first` : '';
    process.stdout.write(`palace-land: dry run: would land ${branch} as a merge changing ${result.changed.length} file${result.changed.length === 1 ? '' : 's'}; nothing moved${waiting}\n`);
    process.exit(0);
  }
  if (result.note) process.stderr.write(`palace-land: ${result.note}\n`);
  const ahead = git(owner, ['rev-list', '--count', 'origin/main..main'], { allowFail: true });
  process.stdout.write(`palace-land: landed ${result.merge.slice(0, 8)}${ahead ? `; main is ${ahead.trim()} ahead of origin` : ''}\n`);
  process.exit(0);
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('palace-land.mjs');
if (invokedDirectly) main();
