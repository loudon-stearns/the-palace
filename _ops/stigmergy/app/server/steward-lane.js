// steward-lane.js -- the bridge that lets the BBS board ADVANCE a permanent
// steward by one cycle, converging the Enrichment "board-as-actuator" pattern
// with the palace-orchestrator's permanent-steward cycle.
//
// The flow per cycle:
//   1. resolve the steward's agent dir via REGISTRY.json,
//   2. capture iteration/cycleN/tsNow from state.json BEFORE firing (processCycle
//      overwrites state.iteration),
//   3. assemble the cycle prompt with the orchestrator's buildCyclePrompt (its
//      board slice already contains the TRICKSTER grants -- the worker just sees
//      and acts on them),
//   4. fire a headless `claude -p ... --output-format stream-json` worker on a
//      dedicated lane, capturing its stdout to a per-cycle transcript file,
//   5. on the worker's exit, REAP: run the orchestrator's processCycle against
//      that transcript (strict §2.2 validate -> append -> reconcile
//      pending_requests -> write state.json + history.jsonl).
//
// A separate state dir (`.actuator-steward/`) keeps steward cycles off the
// Enrichment lane; the single-global-worker scar keeps stewards serial (correct
// -- they share one board). A small in-memory FIFO queue gives batch advance:
// the reap fires the next queued steward. Any advance that arrives while a
// worker is alive joins that queue (2026-10-13) rather than being refused.
//
// The orchestrator modules import with ZERO new deps (Node built-ins + the
// shared @stigmergy/core substrate). The old back-edge -- posting.js reaching
// into this app's server/validator.js -- is gone: the strict §2.2 validator now
// lives in @stigmergy/core/schema, so app -> orchestrator is a one-way edge
// (cycle helpers only), not a circular dependency.

import { existsSync, readFileSync, writeFileSync, appendFileSync, readdirSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createActuator } from './actuator.js';
import { buildCyclePrompt } from '../../orchestrator/src/build-cycle-prompt.js';
import { processCycle, reconcilePendingRequests } from '../../orchestrator/src/process-cycle.js';
import { commitPathsAsync } from '../../orchestrator/src/cycle-commit.js';
import { readRegistry, findAgent } from '../../orchestrator/src/registry.js';
import { readEntryMeta } from '../../orchestrator/src/entry-frontmatter.js';
import { dueForCycle } from '../../orchestrator/src/batch-due.js';
import { readJsonl } from '@stigmergy/core/blackboard';
import { resolveClaudeBin } from './claude-bin.js';
import { resolveModel } from '../../../models/latest-opus.mjs';

const DEFAULT_REGISTRY_REL = '_ops/agents/permanent/REGISTRY.json';
const DEFAULT_STATE_DIR_REL = '_ops/stigmergy/.actuator-steward';
const PERSISTENT_REL = '_ops/swarm/persistent/blackboard.jsonl';

// The steward-cycle prompt templates are part of the CODEBASE, not the palace
// data dir. Resolve them from this module's location (palace/_ops/stigmergy/
// app/server/) so the prompt assembles correctly even when palaceRoot is a temp
// dir under test. buildCyclePrompt's default (skillRoot = palaceRoot/_ops/…)
// would otherwise miss the templates.
const SKILL_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../../_ops/orchestrator');

// ── pure helpers (exported for unit tests) ──────────────────────────────────

/** Filesystem-safe steward slug from its agent dir (the dir basename). */
export function slugFromDir(dir) {
  return basename(String(dir == null ? '' : dir));
}

/** Per-cycle transcript filename. The ts is colon/dot-sanitized for the FS. */
export function transcriptNameFor(slug, cycleN, tsIso) {
  const safeTs = String(tsIso).replace(/[:.]/g, '-');
  return `${slug}-cycle-${cycleN}-${safeTs}.jsonl`;
}

/** The real (non-stub) worker argv: a headless stream-json claude cycle. */
export function stewardArgv(prompt, model) {
  return [
    resolveClaudeBin(), '-p', prompt,
    '--model', resolveModel(model),
    '--output-format', 'stream-json',
    '--verbose',
    '--permission-mode', 'bypassPermissions',
  ];
}

/**
 * Count of grants WAITING to be consumed for one steward: grants that answer one
 * of this steward's asks and landed on the board AFTER its `last_read_cursor` —
 * i.e. not yet read. The board is append-only, so array index == chronological
 * order, and processCycle advances the cursor each cycle, so this drops to 0 once
 * a cycle reads past the grants -- the precise "ready to advance" signal.
 * (Reconcile alone never drops to 0: the ask+grant live on the board forever.)
 *
 * After the Bundle-Local Stewardship SSOT cutover, state.json no longer records
 * consumed decisions (the old `resolved_requests` array is gone), so the cursor —
 * not a stored array — is the consumed boundary. A null/absent cursor (never
 * cycled) means nothing is consumed yet: every answered ask counts.
 */
export function grantsWaitingFor(board, home, state) {
  const { nowResolved } = reconcilePendingRequests(board, home);
  if (!nowResolved.length) return 0;
  // A grant is "waiting" if it landed AFTER the steward last ran (`last_active`).
  // last_active advances every cycle (regardless of what the steward posts), so
  // once a cycle runs past a grant it stops counting -- the faithful board-native
  // reconstruction of the old "answered but not in resolved_requests" signal now
  // that state no longer stores consumed decisions. Never-cycled (null
  // last_active) means nothing is consumed yet: every answered ask counts. An
  // unknown grant timestamp counts too (safe over-report, never silent drop).
  const lastActiveMs = state.last_active ? Date.parse(state.last_active) : NaN;
  if (Number.isNaN(lastActiveMs)) return nowResolved.length;
  return nowResolved.filter((r) => {
    const ts = r.resolved_at ? Date.parse(r.resolved_at) : NaN;
    return Number.isNaN(ts) || ts > lastActiveMs;
  }).length;
}

/**
 * Map a registry entry + its on-disk state to a UI row (or a `missing` stub).
 * Post-SSOT-cutover: stage is read LIVE from the entry frontmatter (the single
 * source of truth), and open-asks / grants-waiting are board-derived — state.json
 * carries only pure runtime (iteration, cursor, health). `palaceRoot` enables the
 * live stage read; without it (pure-helper callers) it falls back to the
 * manifest's immutable spawn snapshot.
 */
export function stewardRow({ entry, state, manifest, board, palaceRoot }) {
  if (!state || !manifest) {
    return { agent_id: entry.agent_id, home: entry.home, dir: entry.dir, missing: true };
  }
  const meta = palaceRoot ? readEntryMeta(palaceRoot, entry.home) : null;
  const liveStage = meta?.stage ?? manifest.stewardship?.stage_at_spawn ?? null;
  // Live project status (single source of truth) feeds the due predicate's
  // status gate; absent (no palaceRoot / no field) → the gate is simply skipped.
  const liveStatus = typeof meta?.data?.status === 'string' ? meta.data.status : undefined;
  // Open (un-granted) asks are board-derived; grants-waiting is the cursor-based
  // count above. The two are orthogonal: an ask is either still open OR granted
  // and waiting to be consumed.
  const { stillPending } = reconcilePendingRequests(board, entry.home);
  // "due next run?" — would the next heartbeat actually cycle this steward? Same
  // rule as the batch planner (batch-due.js), so the column can never disagree
  // with what the scheduler does.
  const due_next_run = dueForCycle({ stage: liveStage, status: liveStatus, lastActive: state.last_active ?? null }).due;
  return {
    agent_id: entry.agent_id,
    home: entry.home,
    dir: entry.dir,
    stage: liveStage,
    iteration: Number.isFinite(state.iteration) ? state.iteration : 0,
    last_active: state.last_active ?? null,
    pending_count: stillPending.length,
    grants_waiting: grantsWaitingFor(board, entry.home, state),
    due_next_run,
    health: state.health?.score ?? null,
    model: manifest.model?.name ? resolveModel(manifest.model.name) : null,
  };
}

/**
 * The run cap for a steward: an explicit override, else the manifest's
 * `stopping_conditions.max_iterations`, else 1. (`max_iterations` was validated
 * but never enforced before 2026-09-23; the run gives it its meaning.)
 */
// A single cycle that runs longer than this is stopped by the watchdog, batch
// or no batch: the longest honest cycle seen so far was 37 minutes (Waveguide,
// 2026-10-13); 91 minutes was a stall. Overridable per batch (max_cycle_minutes).
export const DEFAULT_CYCLE_CEILING_MIN = 45;

export function runCapFor(manifest, override = null) {
  if (Number.isInteger(override) && override > 0) return override;
  const m = manifest && manifest.stopping_conditions && manifest.stopping_conditions.max_iterations;
  return Number.isInteger(m) && m > 0 ? m : 1;
}

/**
 * Decide the next step of a run from the cycle's stop_hint. Returns the next
 * run descriptor to fire, or null when the run ends.
 *
 *   shipped              → continue while position < cap
 *   barren               → retry once (retryOfBarren), then stop (stalled)
 *   blocking_ask         → stop (Loudon's move)
 *   interactive_session  → stop (a conversation, not a cycle)
 *   spawn_failed         → stop at once, no retry — the worker never ran
 *   interrupted          → stop at once, no retry — the worker was cut off (a usage limit)
 *                          (retrying an environment failure just repeats it)
 */
export function nextRunStep(run, stopHint) {
  const r = run || { cap: 1, position: 1, retried: false };
  if (stopHint === 'spawn_failed' || stopHint === 'interrupted') return null;
  if (stopHint === 'barren') {
    if (r.retried) return null;
    return { cap: r.cap, position: r.position, retried: true, retryOfBarren: true };
  }
  if (stopHint === 'shipped' && r.position < r.cap) {
    return { cap: r.cap, position: r.position + 1, retried: false };
  }
  return null;
}

/**
 * The whole decision after a cycle: continue this steward's run, and whether to
 * keep firing the queue. A usage limit (processCycle's `usage_limit`, set even
 * when the cycle shipped) ends the run AND drops the rest of the queue — every
 * steward after it would hit the same wall. Dropped stewards stay ready; the
 * next advance after the reset picks them up.
 */
export function afterCycle(run, summary) {
  const s = summary || {};
  if (s.usage_limit) return { next: null, dropQueue: true, stoppedBecause: 'usage_limit' };
  const next = nextRunStep(run, s.stop_hint);
  return { next, dropQueue: false, stoppedBecause: next ? null : stopReason(run, s.stop_hint) };
}

/** Why a run ended, in one word for the log + the deck. */
export function stopReason(run, stopHint) {
  if (stopHint === 'spawn_failed') return 'spawn_failed';
  if (stopHint === 'interrupted') return 'interrupted';
  if (stopHint === 'barren') return run && run.retried ? 'stalled' : 'barren';
  if (stopHint === 'blocking_ask') return 'paused_on_loudon';
  if (stopHint === 'interactive_session') return 'wants_a_session';
  if (stopHint === 'shipped') return 'run_cap';
  return stopHint || 'unknown';
}

// ── the lane ────────────────────────────────────────────────────────────────

/**
 * Create a steward lane bound to a palace root.
 *
 * @param {object} opts
 * @param {string} opts.palaceRoot
 * @param {string} [opts.registryPath]
 * @param {string} [opts.stateDir]   — the lane's actuator state dir
 * @param {string} [opts.boardPath]  — the persistent blackboard
 * @param {(prompt:string)=>string[]} [opts.buildArgv] — stub injection; when set,
 *        the lane fires this instead of the real `claude -p` argv (tests).
 * @returns {{ list, advance, advanceAll, status, paths }}
 */
export function createStewardLane(opts = {}) {
  const root = resolve(opts.palaceRoot ?? process.cwd());
  const registryPath = opts.registryPath ? resolve(opts.registryPath) : join(root, DEFAULT_REGISTRY_REL);
  const stateDir = opts.stateDir ? resolve(opts.stateDir) : join(root, DEFAULT_STATE_DIR_REL);
  const boardPath = opts.boardPath ? resolve(opts.boardPath) : join(root, PERSISTENT_REL);
  const stubArgv = typeof opts.buildArgv === 'function' ? opts.buildArgv : null;

  const transcriptsDir = join(stateDir, 'transcripts');
  const lastCycleFile = join(stateDir, 'last-cycle.json');

  // dryReap: fire + exit + status, but DO NOT run processCycle. The stub gate
  // on the live dev server sets this so an e2e fire never mutates the real
  // palace (state.json / blackboard). The integration test, which wants the
  // genuine consume, uses a temp palace with dryReap off.
  const dryReap = opts.dryReap === true;

  // Per-fire model, read by the real argv builder. Race-free: scar #4 admits
  // at most one in-flight worker, and `advance`/the reap set this synchronously
  // immediately before each `fire`.
  let pendingModel = null; // null → the latest Opus (stewardArgv resolves it)

  // Batch state (in-memory; lost on server restart -- acceptable for v1).
  let queue = [];
  // A batch: how many, how many done, and — for a heartbeat or any caller
  // that names them — the limits that end it early (2026-10-14; Loudon:
  // "the heartbeat needs some additional limits, this was way too much").
  //   limits.max_minutes — wall clock from the first fire
  //   limits.max_usd     — summed from each cycle's own result line
  // `usd` is the running total; `stopped_because` names the limit that hit.
  let batch = freshBatch(0);
  function freshBatch(total, { source = null, limits = null } = {}) {
    return { total, done: 0, started: total > 0 ? Date.now() : null, usd: 0, source, limits, stopped_because: null };
  }
  // The cost a cycle reports in its own result line (stream-json `result`).
  function readCycleCost(transcriptPath) {
    try {
      const text = readFileSync(transcriptPath, 'utf8');
      const i = text.lastIndexOf('{"type":"result"');
      if (i < 0) return null;
      const line = text.slice(i, text.indexOf('\n', i) < 0 ? undefined : text.indexOf('\n', i));
      const r = JSON.parse(line);
      return typeof r.total_cost_usd === 'number' ? r.total_cost_usd : null;
    } catch (_) { return null; }
  }
  // The watchdog (2026-10-15): the clock used to be checked only at a reap, so
  // one slow cycle ran 91 minutes under a 60-minute limit (the first heartbeat
  // under limits — Semantic Webcam, 20 turns in 87 minutes, API-bound). Now a
  // timer looks every 30 s while a worker is alive and sends it SIGTERM when
  // the batch clock or the per-cycle ceiling is passed; the reap then counts
  // the cycle as interrupted and limitHit drops the queue as before.
  let watchdog = null;
  let cycleStarted = null;
  let cycleCeilingMin = null;  // per-cycle ceiling for the live fire, minutes (null = none)
  function cycleOverrun() {
    const now = Date.now();
    const L = batch.limits;
    if (L && Number.isFinite(L.max_minutes) && L.max_minutes > 0 && batch.started && (now - batch.started) / 60000 >= L.max_minutes) return `batch clock: ${Math.round((now - batch.started) / 60000)} of ${L.max_minutes} min`;
    if (Number.isFinite(cycleCeilingMin) && cycleCeilingMin > 0 && cycleStarted && (now - cycleStarted) / 60000 >= cycleCeilingMin) return `cycle ceiling: ${Math.round((now - cycleStarted) / 60000)} of ${cycleCeilingMin} min`;
    return null;
  }
  function startWatchdog() {
    stopWatchdog();
    watchdog = setInterval(() => {
      const why = cycleOverrun();
      if (!why) return;
      const alive = actuator.isAlive();
      if (!alive.running || !alive.pid) { stopWatchdog(); return; }
      logLine(`watchdog — ${why}: stopping ${current || 'the live worker'} (pid ${alive.pid})`);
      if (!batch.stopped_because) batch.stopped_because = why;
      try { process.kill(alive.pid, 'SIGTERM'); } catch (_) { /* already gone */ }
      stopWatchdog();
    }, 30000);
    if (typeof watchdog.unref === 'function') watchdog.unref();
  }
  function stopWatchdog() { if (watchdog) { clearInterval(watchdog); watchdog = null; } }

  // Which batch limit, if any, is now exceeded. Checked after every reap.
  function limitHit() {
    const L = batch.limits;
    if (!L) return null;
    if (Number.isFinite(L.max_usd) && L.max_usd > 0 && batch.usd >= L.max_usd) return `budget: $${batch.usd.toFixed(2)} of $${L.max_usd}`;
    if (Number.isFinite(L.max_minutes) && L.max_minutes > 0 && batch.started && (Date.now() - batch.started) / 60000 >= L.max_minutes) return `clock: ${Math.round((Date.now() - batch.started) / 60000)} of ${L.max_minutes} min`;
    return null;
  }
  let current = null;
  let currentRun = null;          // { name, cap, position, retried, cycle_n } while a run is live
  let currentTranscript = null;   // the live cycle's transcript path (WATCH pane, 2026-10-13)
  let pendingCapOverride = null;  // advance({ maxCycles }) → applies to the next fireOne only

  const realArgv = (prompt) => stewardArgv(prompt, pendingModel);

  const actuator = createActuator({
    palaceRoot: root,
    stateDir,
    buildArgv: stubArgv || realArgv,
    onExit: reap,
  });

  function logLine(line) {
    try { appendFileSync(actuator.paths.logFile, `${line}\n`); } catch (_) { /* best effort */ }
  }

  function writeLastCycle(obj) {
    try { writeFileSync(lastCycleFile, JSON.stringify(obj, null, 2) + '\n'); } catch (_) { /* best effort */ }
  }

  function readLastCycle() {
    try { return JSON.parse(readFileSync(lastCycleFile, 'utf8')); } catch (_) { return null; }
  }

  function readJson(path) {
    return JSON.parse(readFileSync(path, 'utf8'));
  }

  // The reap: runs in the worker's exit handler (after pid cleanup). Wrapped so
  // a throw can never escape into the exit handler -- that would crash Vite.
  function reap(ctx) {
    stopWatchdog();
    const meta = ctx && ctx.meta;
    const run = (meta && meta.run) || { cap: 1, position: 1, retried: false };
    // A live run honours a cap lowered mid-run (2026-10-13): re-read the
    // manifest at every reap and never exceed what it says now. An explicit
    // per-advance override (a cap the deck asked for) is left alone.
    if (meta && meta.agentDir && !run.override) {
      try {
        const nowCap = runCapFor(readJson(join(meta.agentDir, 'manifest.json')));
        if (nowCap < run.cap) { logLine(`run: ${meta.home} cap lowered ${run.cap} -> ${nowCap} by its manifest`); run.cap = nowCap; }
      } catch (_) { /* keep the cap the run started with */ }
    }
    let next = null; // the next fire of THIS steward's run, if any
    let dropQueue = false; // a usage limit: stop firing the rest of the batch
    let commitPlan = null; // the cycle's commit, made after the reap without blocking the server
    try {
      if (dryReap) {
        writeLastCycle({ ok: true, stub: true, name: meta && meta.home, cycle_n: meta && meta.cycleN, ts: meta && meta.tsNow, run });
        return;
      }
      if (!meta || !meta.transcriptPath) throw new Error('reap: missing fire metadata');
      const summary = processCycle({
        palaceRoot: root,
        transcriptPath: meta.transcriptPath,
        agentDir: meta.agentDir,
        cycleN: meta.cycleN,
        iteration: meta.cycleN,        // state.iteration := cycleN (matches the orchestrator)
        tsNow: meta.tsNow,
        dispatchedBy: 'bbs-actuator',
        boardPath,
        // The cycle commits what it shipped, but not here: this runs on the
        // server's event loop, and the server may be holding the door for a
        // commit of its own. A blocking commit would wait on the server, which
        // could not finish while blocked. So the cycle plans its commit, and
        // the commit runs asynchronously below (cycle-commit.js).
        commit: 'plan',
      });
      if (summary.commit && summary.commit.planned) {
        commitPlan = summary.commit.plan;
        summary.commit = { pending: true, paths: commitPlan.paths.length };
      }
      // The run controller (2026-09-23). A steward activation is a RUN of up
      // to `cap` cycles: keep firing the same steward while it ships and
      // nothing is waiting on Loudon. A barren cycle earns exactly one retry
      // (with a mandate that says so); a second barren cycle is STALLED
      // (processCycle flagged state + scroll) and the run stops. A paused ask
      // (`blocking: true`) or a live-session request also ends the run — the
      // next move is Loudon's, not another cycle.
      const usd = readCycleCost(meta.transcriptPath);
      if (usd != null) batch.usd += usd;
      const step = afterCycle(run, summary);
      next = step.next;
      dropQueue = step.dropQueue;
      const hit = limitHit();
      if (hit) {
        // A batch limit ends this steward's run AND the rest of the batch.
        next = null; dropQueue = true; batch.stopped_because = hit; step.stoppedBecause = step.stoppedBecause || 'batch_limit';
        logLine(`batch limit — ${hit}: ${meta.home}'s run ends here and the rest of the batch is dropped`);
      }
      writeLastCycle({
        ok: summary.stop_hint !== 'spawn_failed' && summary.stop_hint !== 'interrupted', name: meta.home, cycle_n: meta.cycleN, ts: meta.tsNow, ...summary,
        ...(summary.stop_hint === 'spawn_failed' ? { error: 'the worker never spoke — see the lane log (auth? permission mode? root?); the cycle was not counted' } : {}),
        ...(summary.stop_hint === 'interrupted' ? { error: `the worker was cut off before posting (${(summary.errors && summary.errors[0] && summary.errors[0].error) || 'error'}); the cycle was not counted` } : {}),
        run: { ...run, stop_hint: summary.stop_hint, continued: !!next, stopped_because: step.stoppedBecause },
        usd, batch_usd: batch.usd,
      });
      logLine(`run: ${meta.home} cycle ${meta.cycleN} (${run.position}/${run.cap}) -> ${summary.stop_hint}${next ? (next.retryOfBarren ? ' -> retrying once' : ` -> continuing (${next.position}/${next.cap})`) : ` -> run ends (${step.stoppedBecause})`}`);
    } catch (e) {
      logLine(`ERROR: steward reap failed: ${e.message}`);
      writeLastCycle({ ok: false, name: meta && meta.home, error: e.message, ts: meta && meta.tsNow, run });
    } finally {
      const carryOn = () => {
        if (dropQueue && queue.length > 0) {
          if (!batch.stopped_because) batch.stopped_because = 'usage_limit';
          logLine(`${batch.stopped_because === 'usage_limit' ? 'usage limit' : 'batch limit'}: not firing ${queue.length} queued steward(s) — they stay ready: ${queue.join(', ')}`);
          queue = [];
          if (batch.total > 0) batch.total = batch.done + 1;
        }
        if (next && meta && meta.home) {
          const r = fireOne(meta.home, next);
          if (!r.fired) { logLine(`run: could not continue ${meta.home}: ${r.msg}`); drainQueue(); }
        } else {
          drainQueue();
        }
      };
      if (commitPlan) {
        // Commit first, then fire the next cycle, so a commit never picks up
        // files the next cycle is halfway through writing. The server's event
        // loop stays free the whole time.
        commitPathsAsync({ palaceRoot: root, ...commitPlan })
          .then((res) => {
            logLine(`commit: ${meta.home} cycle ${meta.cycleN} -> ${res.ok ? (res.hash || 'nothing to commit') : `FAILED: ${res.error}`}`);
            const last = readLastCycle();
            if (last && last.name === meta.home && last.cycle_n === meta.cycleN) writeLastCycle({ ...last, commit: res });
          })
          .catch((e) => logLine(`ERROR: cycle commit failed: ${e && e.message}`))
          .finally(() => { try { carryOn(); } catch (e) { logLine(`ERROR: steward lane could not carry on: ${e && e.message}`); } });
      } else {
        carryOn();
      }
    }
  }

  // Advance the batch: count the finished cycle, then fire the next queued one.
  function drainQueue() {
    if (batch.total > 0 && batch.done < batch.total) batch.done += 1;
    current = null;
    currentRun = null;
    if (queue.length > 0) {
      const next = queue.shift();
      fireOne(next);
    } else if (batch.total > 0 && batch.done >= batch.total) {
      // batch complete -- leave totals for status() to report, reset queue.
      queue = [];
    }
  }

  // Resolve, build the prompt, and fire ONE steward cycle — the first of a run
  // or a continuation of one (`run` = { cap, position, retried, retryOfBarren }).
  // Returns a structured result; never throws.
  function fireOne(name, run = null) {
    let registry;
    try { registry = readRegistry(registryPath); } catch (e) {
      return { ok: false, fired: false, found: false, msg: `registry unreadable: ${e.message}`, name };
    }
    const entry = findAgent(registry, name);
    if (!entry) return { ok: false, fired: false, found: false, msg: `unknown steward "${name}"`, name };

    const agentDirAbs = resolve(root, entry.dir); // resolve() leaves absolute dirs untouched
    let state, manifest;
    try {
      state = readJson(join(agentDirAbs, 'state.json'));
      manifest = readJson(join(agentDirAbs, 'manifest.json'));
    } catch (e) {
      return { ok: false, fired: false, found: true, msg: `steward state/manifest unreadable: ${e.message}`, name };
    }

    const iteration = Number.isFinite(state.iteration) ? state.iteration : 0;
    const cycleN = iteration + 1;
    const tsNow = new Date().toISOString();
    const model = resolveModel(manifest.model?.name); // "opus" or none → the latest Opus, an exact id
    // The run cap: an explicit override, else the manifest's
    // stopping_conditions.max_iterations (3 by default since 2026-10-13; 10 before), else 1.
    const thisRun = run || { cap: runCapFor(manifest, pendingCapOverride), position: 1, retried: false, override: Number.isInteger(pendingCapOverride) && pendingCapOverride > 0 };

    let prompt;
    try {
      ({ full: prompt } = buildCyclePrompt({
        palaceRoot: root,
        agentDir: entry.dir,
        cycleN,
        boardPath,
        skillRoot: SKILL_ROOT,
        today: tsNow.slice(0, 10),
        runPosition: thisRun.position,
        runCap: thisRun.cap,
        retryOfBarren: !!thisRun.retryOfBarren,
      }));
    } catch (e) {
      return { ok: false, fired: false, found: true, msg: `could not build cycle prompt: ${e.message}`, name };
    }

    const transcriptPath = join(transcriptsDir, transcriptNameFor(slugFromDir(entry.dir), cycleN, tsNow));
    pendingModel = model; // read by realArgv on the very next fire (synchronous)

    const r = actuator.fire(prompt, {
      transcriptPath,
      meta: { agentDir: entry.dir, home: entry.home, cycleN, tsNow, transcriptPath, model, run: thisRun },
    });
    current = r.fired ? name : null;
    currentRun = r.fired ? { name, ...thisRun, cycle_n: cycleN } : null;
    if (r.fired) { cycleStarted = Date.now(); startWatchdog(); } else { cycleStarted = null; }
    currentTranscript = r.fired ? transcriptPath : null;
    return { ok: !!r.fired, fired: !!r.fired, found: true, msg: r.msg, name, cycle_n: cycleN, model, run: thisRun };
  }

  // ── public surface ──

  /** Every registered steward, with its grants_waiting / pending counts. */
  function list() {
    let registry;
    try { registry = readRegistry(registryPath); } catch (_) { return []; }
    const board = existsSync(boardPath) ? readJsonl(boardPath) : [];
    const rows = [];
    for (const entry of registry.agents || []) {
      const agentDirAbs = resolve(root, entry.dir);
      let state = null, manifest = null;
      try { state = readJson(join(agentDirAbs, 'state.json')); } catch (_) { /* missing */ }
      try { manifest = readJson(join(agentDirAbs, 'manifest.json')); } catch (_) { /* missing */ }
      rows.push(stewardRow({ entry, state, manifest, board, palaceRoot: root }));
    }
    return rows;
  }

  /** Names of stewards with at least one grant waiting (the default batch set). */
  function readyNames() {
    return list().filter((r) => !r.missing && r.grants_waiting > 0).map((r) => r.agent_id);
  }

  // A steward is "in flight" when it is the live worker or already queued.
  function inFlight(name) {
    if (actuator.isAlive().running && current === name) return 'running';
    const i = queue.indexOf(name);
    return i >= 0 ? i + 1 : null;
  }

  // Put stewards behind the live worker. Returns the names actually added
  // (duplicates of the live one or of a queued one are skipped). Grows the
  // batch so status() counts them.
  function enqueue(names) {
    const added = [];
    for (const n of names) {
      if (inFlight(n)) continue;
      queue.push(n); added.push(n);
    }
    if (added.length) {
      if (batch.total === 0) batch = freshBatch(1 + added.length); // the live one + these
      else batch.total += added.length;
      logLine(`queued ${added.length} steward(s) behind ${current || 'the live cycle'}: ${added.join(', ')} (queue now ${queue.length})`);
    }
    return added;
  }

  /**
   * Advance one steward by a run. If a worker is alive, the steward joins the
   * queue instead (2026-10-13, Loudon's ask: clicking advance on several rows
   * lines them up, one lane, in click order). Returns { fired: true, ... } when
   * it fired now, { fired: false, queued: true, position } when it waits, or
   * { fired: false, queued: true, already: 'running' | position } when it was
   * already in flight. A queued steward runs at its manifest's cap; `maxCycles`
   * only applies when it fires now.
   */
  function advance({ name, maxCycles } = {}) {
    if (typeof name !== 'string' || name.trim() === '') {
      return { ok: false, fired: false, found: false, msg: 'missing steward name' };
    }
    if (actuator.isAlive().running) {
      const already = inFlight(name);
      if (already) return { ok: true, fired: false, queued: true, already, name, msg: already === 'running' ? `${name} is the live cycle` : `${name} is already queued (#${already})` };
      let registry;
      try { registry = readRegistry(registryPath); } catch (e) {
        return { ok: false, fired: false, found: false, msg: `registry unreadable: ${e.message}`, name };
      }
      if (!findAgent(registry, name)) return { ok: false, fired: false, found: false, msg: `unknown steward "${name}"`, name };
      enqueue([name]);
      return { ok: true, fired: false, queued: true, position: queue.length, name, msg: `${name} queued behind ${current || 'the live cycle'} (#${queue.length})` };
    }
    // Not part of a batch: clear batch state so status() reads cleanly.
    queue = [];
    batch = freshBatch(0);
    cycleCeilingMin = DEFAULT_CYCLE_CEILING_MIN;
    pendingCapOverride = Number.isInteger(maxCycles) && maxCycles > 0 ? maxCycles : null;
    return fireOne(name);
  }

  /** Take a queued steward back out. The live one cannot be dequeued. */
  function dequeue({ name } = {}) {
    const i = queue.indexOf(name);
    if (i < 0) return { ok: false, found: false, msg: inFlight(name) === 'running' ? `${name} is the live cycle, not queued` : `${name} is not queued` };
    queue.splice(i, 1);
    if (batch.total > 0) batch.total -= 1;
    logLine(`dequeued ${name} (queue now ${queue.length})`);
    return { ok: true, name, ...status() };
  }

  /**
   * Advance every ready steward serially (or an explicit `names` list). With a
   * worker alive, the targets join the queue behind it instead of being refused;
   * `queued` then lists only the ones newly added.
   */
  function advanceAll({ names, maxCycles, maxMinutes, maxUsd, maxCycleMinutes, source } = {}) {
    const targets = Array.isArray(names) && names.length ? names.slice() : readyNames();
    if (actuator.isAlive().running) {
      const added = enqueue(targets);
      return { ok: true, queued: added, appended: true, msg: added.length ? `${added.length} steward(s) queued behind the live cycle` : 'nothing new to queue', ...status() };
    }
    if (targets.length === 0) {
      return { ok: true, queued: [], msg: 'no stewards have grants waiting', ...status() };
    }
    queue = targets.slice();
    const limits = (Number.isFinite(maxMinutes) && maxMinutes > 0) || (Number.isFinite(maxUsd) && maxUsd > 0) || (Number.isFinite(maxCycleMinutes) && maxCycleMinutes > 0)
      ? { max_minutes: Number.isFinite(maxMinutes) && maxMinutes > 0 ? maxMinutes : null, max_usd: Number.isFinite(maxUsd) && maxUsd > 0 ? maxUsd : null, max_cycles: Number.isInteger(maxCycles) && maxCycles > 0 ? maxCycles : null, max_cycle_minutes: Number.isFinite(maxCycleMinutes) && maxCycleMinutes > 0 ? maxCycleMinutes : null }
      : null;
    cycleCeilingMin = limits && limits.max_cycle_minutes ? limits.max_cycle_minutes : DEFAULT_CYCLE_CEILING_MIN;
    batch = freshBatch(targets.length, { source: typeof source === 'string' && source ? source : null, limits });
    pendingCapOverride = Number.isInteger(maxCycles) && maxCycles > 0 ? maxCycles : null;
    const first = queue.shift();
    const r = fireOne(first);
    if (limits) logLine(`batch${batch.source ? ` (${batch.source})` : ''}: ${targets.length} steward(s), limits ${JSON.stringify(limits)}`);
    return { ok: r.ok, queued: targets, first: r, ...status() };
  }

  /** Lane + actuator status, including batch progress and the last reap summary. */
  function status() {
    const a = actuator.status();
    return {
      ...a,
      current,
      current_run: currentRun,
      current_transcript: a.running ? currentTranscript : null,
      cycle_minutes: a.running && cycleStarted ? Math.round((Date.now() - cycleStarted) / 600) / 100 : null,
      cycle_ceiling_minutes: cycleCeilingMin,
      queue: queue.slice(),
      batch: { total: batch.total, done: batch.done, remaining: queue.length, usd: Math.round(batch.usd * 100) / 100, started: batch.started ? new Date(batch.started).toISOString() : null, source: batch.source, limits: batch.limits, stopped_because: batch.stopped_because },
      last_cycle: readLastCycle(),
    };
  }

  /** The transcript to watch for a steward: the live one when it is the live cycle, else its newest on disk. */
  function transcriptFor(home) {
    if (actuator.isAlive().running && current === home && currentTranscript) return { path: currentTranscript, running: true };
    let registry;
    try { registry = readRegistry(registryPath); } catch (_) { return null; }
    const entry = findAgent(registry, home);
    if (!entry || !existsSync(transcriptsDir)) return null;
    const slug = slugFromDir(entry.dir);
    const files = readdirSync(transcriptsDir).filter((f) => f.startsWith(slug + '-cycle-') && f.endsWith('.jsonl')).sort();
    return files.length ? { path: join(transcriptsDir, files[files.length - 1]), running: false } : null;
  }

  return {
    list,
    readyNames,
    transcriptFor,
    advance,
    dequeue,
    advanceAll,
    status,
    paths: {
      stateDir, transcriptsDir, lastCycleFile, registryPath, boardPath,
      logFile: actuator.paths.logFile, pidFile: actuator.paths.pidFile,
    },
  };
}
