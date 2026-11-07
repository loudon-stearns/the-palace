// finalize-live.js — square a steward's books after a cycle Loudon drove live.
// (Invoked via `node <file>`; no shebang, for the same bundling reason as process-cycle.js.)
//
// A headless cycle ends in processCycle, which advances the iteration, writes
// history, marks the tuning ledger, regenerates the scroll and commits. A cycle
// driven live (build-cycle-prompt.js, mode 'interactive') has no orchestrator
// after it: the steward posts to the board itself and the session simply ends,
// so state.json still names the previous cycle, the scroll's Now still shows
// the old open asks, and the ledger has a run line only if someone wrote one by
// hand. Found at Shopkeeper's cycle 15 close (2026-11-07): state said cycle 14,
// the scroll said "waiting on you: 1 open ask" three days after it was answered.
//
// This reads what the steward posted to the board since its last read cursor,
// treats that as the live cycle, and does processCycle's bookkeeping over it —
// nothing is re-posted, the board already has it:
//   1. reconcile the steward's asks against the board,
//   2. state.json: iteration + 1, last_active, last_read_cursor, health,
//   3. history.jsonl: the cycle's events, marked dispatched_by 'live-session',
//   4. the tuning ledger's run line and any offered lesson — skipped when the
//      ledger already carries this cycle's run line (a close wrote it by hand),
//   5. the scroll, regenerated from the board,
//   6. one commit of exactly those files (cycle-commit.js), unless told not to.
// Idempotent: once run, the cursor sits on the cycle's last post, so a second
// run finds nothing new and says so.
//
// Closing Well calls this for a live steward session (dispatch.md § A steward
// session); the live prompt tells the steward to call it before it stops.
//
//   node _ops/stigmergy/orchestrator/src/finalize-live.js --agent-dir _ops/agents/permanent/<slug> [--dry-run] [--no-commit]
//   node _ops/stigmergy/orchestrator/src/finalize-live.js --home "<page title>"   (finds the agent dir by its manifest)

import { readFileSync, writeFileSync, appendFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readJsonl } from '@stigmergy/core/blackboard';
import { reconcilePendingRequests, recordStewardRun } from './process-cycle.js';
import { tuningPathFor } from './ledger.js';
import { materializeScroll } from './scroll-file.js';
import { resolveBundleDir } from './entry-paths.js';
import { commitCycle } from './cycle-commit.js';

const PALACE_ROOT_DEFAULT = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../..');

/** The steward's own posts after its read cursor (all of them when the cursor is gone from the board). */
export function livePostsSince(board, home, cursor) {
  const at = cursor ? board.findIndex((m) => m && m.id === cursor) : -1;
  return board.slice(at + 1).filter((m) => m && m.from === home && m.id);
}

/** The permanent steward's directory for a page title, from the manifests under _ops/agents/permanent/. */
export function agentDirFor(palaceRoot, home) {
  const base = join(palaceRoot, '_ops/agents/permanent');
  if (!existsSync(base)) return null;
  for (const d of readdirSync(base)) {
    const f = join(base, d, 'manifest.json');
    if (!existsSync(f)) continue;
    try { if (JSON.parse(readFileSync(f, 'utf8')).home === home) return join('_ops/agents/permanent', d); } catch { /* not a manifest */ }
  }
  return null;
}

/** True when the ledger already carries a run line for this cycle. */
export function ledgerHasRun(ledgerText, cycleN) {
  return new RegExp(`^- run · .*· cycle ${cycleN}(?=[ ,·]|$)`, 'm').test(ledgerText || '');
}

export function finalizeLive({ palaceRoot = PALACE_ROOT_DEFAULT, agentDir, tsNow = new Date().toISOString(), boardPath, commit = false, dryRun = false }) {
  if (!agentDir) throw new Error('finalizeLive: agentDir is required');
  const agentDirAbs = resolve(palaceRoot, agentDir);
  const boardFile = boardPath ? resolve(boardPath) : resolve(palaceRoot, '_ops/swarm/persistent/blackboard.jsonl');
  const state = JSON.parse(readFileSync(join(agentDirAbs, 'state.json'), 'utf8'));
  const manifest = JSON.parse(readFileSync(join(agentDirAbs, 'manifest.json'), 'utf8'));
  const home = manifest.home;

  const board = readJsonl(boardFile);
  const posts = livePostsSince(board, home, state.last_read_cursor);
  if (!posts.length) return { home, finalized: false, reason: `nothing posted by ${home} since ${state.last_read_cursor || 'the start of the board'}` };

  const cycleN = (state.iteration || 0) + 1;
  const ids = posts.map((m) => m.id);
  const ledgerPath = tuningPathFor(palaceRoot, home);
  const ledgerAlready = ledgerPath ? ledgerHasRun(readFileSync(ledgerPath, 'utf8'), cycleN) : false;
  if (dryRun) return { home, finalized: false, dry_run: true, cycle: cycleN, posts: ids, ledger: ledgerPath ? (ledgerAlready ? 'run line already there — left alone' : 'run line to add') : 'no ledger' };

  const { stillPending, nowResolved } = reconcilePendingRequests(board, home);
  delete state.pending_requests;
  delete state.resolved_requests;
  delete state.stewardship;
  state.iteration = cycleN;
  state.last_active = tsNow;
  state.last_read_cursor = ids[ids.length - 1];
  state.health = { ...(state.health || {}), posting_discipline_violations: 0, score: 'green', stalled: false };
  writeFileSync(join(agentDirAbs, 'state.json'), JSON.stringify(state, null, 2) + '\n');

  const histPath = join(agentDirAbs, 'history.jsonl');
  for (const e of [
    { event: `CYCLE_${cycleN}_SPAWN`, ts: tsNow, dispatched_by: 'live-session', note: 'driven live by Loudon; finalized after the session by finalize-live.js' },
    ...ids.map((id) => ({ event: 'TOOL_CALL', ts: tsNow, tool: 'write_blackboard', args: { message_id: id }, result: 'posted live' })),
    { event: 'CYCLE_COMPLETE', ts: tsNow, iteration: cycleN, stop_reason: 'live_session', posted_messages: ids, pending_after: stillPending.map((p) => p.request_id) },
  ]) appendFileSync(histPath, JSON.stringify(e) + '\n');

  let run = null;
  if (ledgerAlready) run = { ledger: ledgerPath, skipped: 'the ledger already carries this cycle\'s run line' };
  else {
    try { run = recordStewardRun({ palaceRoot, home, cycleN, tsNow, messages: posts }); } catch (e) { run = { error: e.message }; }
  }

  let scroll;
  try {
    const { text, ledger, diary, nowView, ...rest } = materializeScroll({ palaceRoot, home, agentDir: agentDirAbs, boardPath: boardFile, tsNow, leftovers: [] }) || {};
    scroll = rest;
  } catch (e) { scroll = { written: false, reason: `error: ${e.message}` }; }

  let commitResult = null;
  if (commit) {
    const bundle = resolveBundleDir(palaceRoot, home);
    try {
      commitResult = commitCycle({
        palaceRoot, home, cycleN,
        bundleDir: bundle ? bundle.bundleDir : null,
        messages: [], pageEdits: [], refusedEdits: [], proposals: [], roster: null, leftovers: [],
        extraPaths: [
          join(agentDirAbs, 'state.json'),
          histPath,
          ...(scroll && scroll.scrollPath ? [scroll.scrollPath] : []),
          ...(run && run.ledger ? [run.ledger] : []),
        ],
      });
    } catch (e) { commitResult = { ok: false, hash: null, error: e.message }; }
  }

  return { home, finalized: true, cycle: cycleN, posts: ids, pending_after: stillPending.map((p) => p.request_id), resolved_count_after: nowResolved.length, run, scroll, commit: commitResult };
}

function main() {
  const argv = process.argv.slice(2);
  const arg = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
  const palaceRoot = arg('--root', PALACE_ROOT_DEFAULT);
  const home = arg('--home');
  const agentDir = arg('--agent-dir') || (home ? agentDirFor(palaceRoot, home) : null);
  if (!agentDir) { process.stderr.write(`finalize-live: no steward found${home ? ` for "${home}"` : ''} — pass --agent-dir or --home\n`); process.exit(2); }
  const summary = finalizeLive({
    palaceRoot,
    agentDir,
    tsNow: arg('--ts-now', new Date().toISOString()),
    boardPath: arg('--board'),
    commit: !argv.includes('--no-commit'),
    dryRun: argv.includes('--dry-run'),
  });
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
