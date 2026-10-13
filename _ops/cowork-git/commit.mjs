// commit.mjs — the cowork-git lock-safe committer.
//
// WHY THIS EXISTS. The Cowork sandbox mounts the palace with a filesystem that
// can create and rename files but CANNOT unlink (delete) them. A normal `git
// commit` writes its data fine (objects/refs land via rename) but then fails to
// remove its own `*.lock` files at the end — and the stranded `index.lock`
// wedges the NEXT git op. Your committer (`server/commit.js commitSelected`)
// already does the right palace things (stage only named paths, derive the
// Palace-* trailers, write a spec message), and its lock rule
// (`server/git-locks.js`) decides WHEN a lock may go — but it clears one with
// rmSync, which is exactly the call that no-ops in Cowork.
//
// So this is a THIN wrapper, not a reimplementation, and it carries no lock
// rule of its own: the palace has ONE — a lock is stale only when it is older
// than the threshold AND no git process is running against this checkout; a
// live one is waited out, then refused; a dry run touches nothing. What this
// file adds is only what the sandbox forces: every `*.lock` under `.git` is a
// candidate (git strands ref and packed-refs locks here too, not just
// HEAD.lock and index.lock), and a stale one is moved aside by RENAME into
// the junk dir. Then: call commitSelected unchanged → sweep the locks our own
// commit just stranded (age ignored; those are ours) → leave a weave_flag so
// the next Weave clears the litter.
//
// Layer A (phased core). Direct commit for small, non-canon changes. When the
// situation is NOT ideal (canon/knowledge entries, a lock that may be a live
// op, an in-progress merge/rebase) it REFUSES and tells you to hand off
// rather than risk the repo. The BBS commit-handoff consumer is layer B.
//
// Usage:
//   node _ops/cowork-git/commit.mjs --paths "a.js,b.md" --kind ops \
//        --scope cowork-git --summary "what changed" [--body "why"] \
//        --verify unverified [--author claude] [--lock-threshold 30] \
//        [--no-flag] [--dry-run] [--root <palace>]
//
// A move: name BOTH sides in --paths, the old path and the new one (files or
// folders). commitSelected then commits the move whole and derives no
// Palace-Stage / Palace-Vector line for it. One side alone commits half a
// move; the output's `notes` says so.

import { existsSync, renameSync, mkdirSync, readdirSync, readFileSync, appendFileSync } from 'node:fs';
import { resolve, join, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── arg parsing ────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const a = { paths: [], kind: null, scope: null, summary: null, body: '', verify: null,
    author: 'claude', lockThreshold: 30, flag: true, dryRun: false, root: null };
  for (let i = 0; i < argv.length; i += 1) {
    const k = argv[i];
    const v = () => argv[++i];
    if (k === '--paths') a.paths.push(...v().split(',').map((s) => s.trim()).filter(Boolean));
    else if (k === '--path') a.paths.push(v().trim());
    else if (k === '--kind') a.kind = v();
    else if (k === '--scope') a.scope = v();
    else if (k === '--summary') a.summary = v();
    else if (k === '--body') a.body = v();
    else if (k === '--verify') a.verify = v();
    else if (k === '--author') a.author = v();
    else if (k === '--lock-threshold') a.lockThreshold = Number(v());
    else if (k === '--no-flag') a.flag = false;
    else if (k === '--dry-run') a.dryRun = true;
    else if (k === '--root') a.root = v();
  }
  return a;
}

// ── lock handling: the shared rule, plus the sandbox's one affordance ───────
// Every `*.lock` under the git dir. git-locks.js looks only at HEAD.lock and
// index.lock by default; Cowork strands whatever lock a commit took.
export function findLockFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    let ents;
    try { ents = readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const e of ents) {
      const p = join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.name.endsWith('.lock')) out.push(p);
    }
  }
  return out;
}

// An operation is "in progress" if git left a transaction marker.
export function transactionInProgress(gitDir) {
  const markers = ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'BISECT_LOG', 'rebase-merge', 'rebase-apply'];
  return markers.filter((m) => existsSync(join(gitDir, m)));
}

/**
 * Sweep the stranded locks of `palaceRoot` under the palace's one lock rule
 * (server/git-locks.js), moving a stale one aside by rename into
 * `_ops/scratch/gitlock-junk/` since the sandbox cannot unlink. Never throws.
 *
 *   - freshMs: locks younger than this are presumed live (default 30 s).
 *   - force:   ignore age — for the POST-commit sweep, where any lock present
 *              was just stranded by OUR own commit, which has already
 *              returned. A git process this sandbox can see still keeps a lock.
 *              Force also sidesteps a clock-skew trap: a freshly stranded lock
 *              can carry an mtime a hair ahead of the node clock.
 *   - dryRun:  report what is there and move nothing.
 *
 * Returns { moved: [rel], held: [{ path, ageSec, heldBy }], refused?, dryRun }.
 * `refused` carries the rule's message when a live lock outlasted the wait.
 */
export async function sweepStrandedLocks(palaceRoot, { freshMs = 30_000, force = false, dryRun = false, attempts, delayMs, log = (s) => process.stderr.write(s) } = {}) {
  const gitDir = join(palaceRoot, '.git');
  const junkDir = join(palaceRoot, '_ops', 'scratch', 'gitlock-junk'); // _ops/scratch is already gitignored
  const { clearStaleLocks, LockHeldError } = await import(pathToFileURL(join(palaceRoot, '_ops/stigmergy/app/server/git-locks.js')).href);

  // The sandbox allows rename, not unlink: a stale lock goes to the junk dir.
  const relocate = (lock) => {
    mkdirSync(junkDir, { recursive: true });
    const flat = relative(gitDir, lock).replace(/[\\/]/g, '_');
    const dest = join(junkDir, `${Date.now()}-${flat}`);
    renameSync(lock, dest);
    return `renamed to ${relative(palaceRoot, dest)}`;
  };
  const asHeld = (rows) => rows.map((h) => ({ path: h.rel, ageSec: Math.round(h.ageMs / 1000), heldBy: h.heldBy.map((p) => p.pid) }));
  const opts = {
    tag: 'cowork-git', log, dryRun, freshMs, ignoreAge: force,
    locks: () => findLockFiles(gitDir), remove: relocate,
    ...(attempts != null ? { attempts } : {}), ...(delayMs != null ? { delayMs } : {}),
  };
  try {
    const r = await clearStaleLocks(palaceRoot, opts);
    return { moved: r.cleared.map((c) => c.rel), held: asHeld(r.held), dryRun };
  } catch (e) {
    if (!(e instanceof LockHeldError)) throw e;
    return {
      moved: e.cleared.map((c) => c.rel),
      held: [{ path: relative(palaceRoot, e.path), ageSec: Math.round(e.ageMs / 1000), heldBy: e.heldBy.map((p) => p.pid) }],
      refused: e.message,
      dryRun,
    };
  }
}

// ── weave cleanup flag (idempotent) ─────────────────────────────────────────
function readBoard(board) {
  try { return readFileSync(board, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); }
  catch { return []; }
}
function openCleanupFlag(boardMsgs) {
  const flags = boardMsgs.filter((m) => m.type === 'BROADCAST' && m.board === 'WEAVE'
    && m.payload && m.payload.kind === 'weave_flag' && m.payload.flag_type === 'cowork_litter_sweep');
  if (flags.length === 0) return null;
  const resolved = new Set(boardMsgs.filter((m) => (m.type === 'RESOURCE_GRANT' || m.type === 'RESOURCE_DENY') && m.re).map((m) => m.re));
  return flags.find((f) => !resolved.has(f.id)) || null;
}
async function emitCleanupFlag(palaceRoot, board, shortHash) {
  const existing = openCleanupFlag(readBoard(board));
  if (existing) return { posted: false, existing: existing.id };
  const msg = {
    schema_version: '1.0',
    id: randomUUID(),
    ts: new Date().toISOString(),
    session_id: 'cowork-git',
    from: 'cowork-git',
    to: 'weave-ceremony',
    type: 'BROADCAST',
    board: 'WEAVE',
    // Path-2 health stub: the strict validator relaxes the token fields only
    // when dispatch_mode === 'claude-code-subagent' — which Cowork is. The
    // `tool` sub-field keeps cowork-git provenance visible.
    health: { score: 'green', model: 'cowork-git', _orchestrator_metadata: { dispatch_mode: 'claude-code-subagent', tool: 'cowork-git', note: 'lock-safe commit litter' } },
    payload: {
      kind: 'weave_flag',
      flag_type: 'cowork_litter_sweep',
      source_entries: ['SUBSTRATE'],
      target_entry: '_ops/scratch/gitlock-junk',
      proposed_action: 'Cowork lock-safe commits relocate stranded git *.lock files to _ops/scratch/gitlock-junk/ (rename, since the sandbox cannot unlink) and leave tmp_obj_* litter in .git/objects. Mac-side: delete _ops/scratch/gitlock-junk/* and any stray .git/objects/**/tmp_obj_*, then this flag may close.',
      rationale: 'The Cowork mount blocks unlink; only a Mac-side process can delete the litter lock-safe committing leaves behind. One open flag covers all such commits until swept.',
      source_deposit_id: shortHash || 'cowork-git',
    },
  };
  let validation = { valid: true };
  try {
    const { validateMessage } = await import(pathToFileURL(join(palaceRoot, '_ops/stigmergy/core/schema/validator.js')).href);
    validation = validateMessage(msg);
  } catch (e) { validation = { valid: false, errors: [{ path: '', message: `validator import failed: ${e.message}` }] }; }
  if (!validation.valid) return { posted: false, error: 'flag failed §2.2 validation', detail: validation.errors };
  appendFileSync(board, JSON.stringify(msg) + '\n');
  return { posted: true, id: msg.id };
}

// ── main ────────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const palaceRoot = resolve(args.root || resolve(__dirname, '../..'));
  const gitDir = join(palaceRoot, '.git');
  const board = join(palaceRoot, '_ops', 'swarm', 'persistent', 'blackboard.jsonl');
  const out = (o) => process.stdout.write(JSON.stringify(o, null, 2) + '\n');
  const fail = (error, extra = {}) => { out({ ok: false, error, ...extra }); process.exit(1); };
  // The rule's own lines go to stderr as they happen, and ride along in the JSON.
  const lockLog = [];
  const log = (s) => { lockLog.push(s.trimEnd()); process.stderr.write(s); };

  if (args.paths.length === 0) return fail('no --paths given');
  if (!args.summary) return fail('no --summary given');
  if (!args.kind) return fail('no --kind given (deposit|edit|enrich|handoff|steward|weave|schema|ops|merge|mixed)');
  if (!args.verify) return fail('no --verify given (verified|unverified|couldnt) — be honest');
  if (!existsSync(gitDir)) return fail(`no .git at palace root ${palaceRoot}`);

  // Guard 1: an in-progress git transaction is a hard stop.
  const txn = transactionInProgress(gitDir);
  if (txn.length) return fail(`git transaction in progress (${txn.join(', ')}) — resolve it before committing, or hand off`, { handoff: true });

  // Guard 2: the palace's one lock rule. A stale lock (old, nobody behind it)
  // is moved aside and we proceed; a live one is waited out, then refused,
  // because it may be a live op (another sandbox, the heartbeat) we cannot
  // see. A dry run only reports what is there.
  const pre = await sweepStrandedLocks(palaceRoot, { freshMs: args.lockThreshold * 1000, dryRun: args.dryRun, log });
  if (pre.refused) {
    return fail(`${pre.refused} — retry shortly or hand off`, { handoff: true, heldLocks: pre.held, movedStaleLocks: pre.moved, lockLog });
  }

  if (args.dryRun) return out({ ok: true, dryRun: true, palaceRoot, wouldCommit: args, locksSeen: pre.held, lockLog });

  // The actual commit — your committer, unchanged (single source of truth for the spec).
  const { commitSelected } = await import(pathToFileURL(join(palaceRoot, '_ops/stigmergy/app/server/commit.js')).href);
  const result = await commitSelected(palaceRoot, {
    paths: args.paths, kind: args.kind, scope: args.scope || null,
    summary: args.summary, body: args.body || '', verify: args.verify, author: args.author,
  });

  // ALWAYS post-sweep, age ignored — a commit (success OR partial) re-creates
  // locks it cannot unlink; those are ours and must be cleared so the next
  // commit is not wedged. A git this sandbox can see still keeps a lock.
  const post = await sweepStrandedLocks(palaceRoot, { force: true, log });
  const movedLocks = [...pre.moved, ...post.moved];
  const lockFailures = post.refused ? [{ error: post.refused, held: post.held }] : [];

  if (!result.ok) return fail(result.error || 'commitSelected failed', { handoff: true, movedLocks, lockFailures, lockLog, commitMessagePreview: result.message });

  let flag = { posted: false, skipped: 'no-flag' };
  if (args.flag) { try { flag = await emitCleanupFlag(palaceRoot, board, result.shortHash); } catch (e) { flag = { posted: false, error: e.message }; } }

  out({ ok: true, shortHash: result.shortHash, subject: result.subject, committed: result.committed, ...(result.notes ? { notes: result.notes } : {}), movedLocks, ...(lockFailures.length ? { lockFailures } : {}), lockLog, weaveFlag: flag });
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((e) => { process.stdout.write(JSON.stringify({ ok: false, error: e.message, stack: e.stack }, null, 2) + '\n'); process.exit(1); });
}
