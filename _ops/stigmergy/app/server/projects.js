// server/projects.js — the PROJECTS deck's data: every `type: project` entry
// as one row, stewarded or not, plus the read/write seam for its scroll. More
// groups share the deck: SERVICES (2026-09-25), stewarded pages that are not
// projects (the Shopkeeper, once enchanted); CEREMONIES, every page carrying
// `trigger:` (SCHEMA v1.28; orchestrator/src/ceremony-scroll.js) — its version,
// its runs since the spec last changed (counted from its tuning ledger's run
// lines), and what the ledger still owes; and PAGES, every other page that
// keeps a tuning ledger, shown the same way. A ledger no longer makes a page a
// ceremony: a project that keeps one stays a project, with its board and its runs.
//
// The big-picture view Loudon asked for (2026-09-23): "no really good big-
// picture view of the projects and all their current states." One row per
// project, computed by the SAME code the scroll's Now zone uses (computeNow in
// the orchestrator's scroll-file.js) — so the table and the scroll can never
// disagree about what is waiting on him, what is ready to advance, or which
// steward is stalled. One rule, two readers.
//
// Reading a scroll here regenerates it IN MEMORY for display (the
// "regenerated on every look" promise) through the same materializer a cycle
// and the CLI use, without touching disk — the on-disk scroll is written by
// steward cycles, by an explicit `write`, and whenever Loudon saves a page's
// Standing Orders or its Plan. That keeps the working tree quiet between cycles
// while the terminal always shows the live state. Orders come in two kinds:
// standing ones go on the scroll, for every page; a one-shot order goes to the
// page's tuning ledger as an owed line the next run reads (SCHEMA — Reference §6).

import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { readJsonl } from '@stigmergy/core/blackboard';
import { listProjectEntries, stewardIndex } from '../../orchestrator/src/scroll.js';
import {
  MARK, computeNow, readZone, readStandingOrders, materializeScroll,
  readPlan, writePlan as writePlanFile, localIso, ordersPlaceholderFor, scrollKind,
} from '../../orchestrator/src/scroll-file.js';
import { resolveBundleDir, findEntryFile } from '../../orchestrator/src/entry-paths.js';
import { listCeremonies } from '../../orchestrator/src/ceremony-scroll.js';
import {
  readTuningState, listTuningLedgers, tuningPathFor, appendLedgerLine, orderLine, normVersion, parseProposals,
} from '../../orchestrator/src/ledger.js';
import { parseFrontmatter } from '../../orchestrator/src/entry-frontmatter.js';
import { enchantSteward } from '../../orchestrator/src/enchant.js';
import { resolveModel } from '../../../models/latest-opus.mjs';

const PERSISTENT_REL = '_ops/swarm/persistent/blackboard.jsonl';

function readBoard(palaceRoot) {
  const p = join(palaceRoot, PERSISTENT_REL);
  return existsSync(p) ? readJsonl(p) : [];
}

function readJsonSafe(p) {
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

function readHistorySafe(p) {
  try {
    return readFileSync(p, 'utf8').trim().split('\n').filter(Boolean)
      .map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  } catch { return []; }
}

/**
 * Sort key for the table: what needs Loudon first, then what he can advance,
 * then what is stuck, then everything else by most recent activity. Pure.
 */
export function projectSortKey(row) {
  // lower sorts first
  let bucket = 4;
  if (row.open_asks > 0 || row.proposed_owed > 0) bucket = 0;
  else if (row.answered_unconsumed > 0) bucket = 1;
  else if (row.stalled) bucket = 2;
  else if (row.stewarded) bucket = 3;
  const t = row.last_activity ? Date.parse(row.last_activity) : 0;
  return [bucket, -(Number.isNaN(t) ? 0 : t)];
}

export function sortProjects(rows) {
  return rows.slice().sort((a, b) => {
    const [ba, ta] = projectSortKey(a);
    const [bb, tb] = projectSortKey(b);
    return ba - bb || ta - tb || String(a.home).localeCompare(String(b.home));
  });
}

/**
 * One row per `type: project` entry. `stewardLane` (optional) supplies the
 * live worker status so the row can show "● running" and the run position.
 */
export function buildProjectRows({ palaceRoot, board = null, stewardLane = null, now = new Date().toISOString() }) {
  const boardMsgs = board || readBoard(palaceRoot);
  const stewards = stewardIndex(palaceRoot);
  const worker = stewardLane ? stewardLane.status() : null;
  const rows = [];
  for (const p of listProjectEntries(palaceRoot)) {
    rows.push(entryRow({ palaceRoot, p, boardMsgs, stewards, worker, now }));
  }
  return sortProjects(rows);
}

/**
 * Stewarded pages that are not projects — the SERVICES group. Same row shape
 * and signal as a project row, so the deck renders them with the same code.
 */
export function buildServiceRows({ palaceRoot, board = null, stewardLane = null, now = new Date().toISOString() }) {
  const boardMsgs = board || readBoard(palaceRoot);
  const stewards = stewardIndex(palaceRoot);
  const worker = stewardLane ? stewardLane.status() : null;
  const projects = new Set(listProjectEntries(palaceRoot).map((p) => p.title));
  const rows = [];
  for (const home of stewards.keys()) {
    if (projects.has(home)) continue;
    const file = findEntryFile(palaceRoot, home);
    if (!file) continue;
    const fm = (() => { try { return parseFrontmatter(readFileSync(file, 'utf8')); } catch { return {}; } })();
    const p = { title: home, file: relative(palaceRoot, file), status: typeof fm.status === 'string' ? fm.status : null, stage: typeof fm.stage === 'string' ? fm.stage : null };
    rows.push({ ...entryRow({ palaceRoot, p, boardMsgs, stewards, worker, now }), kind: 'service', type: fm.type || null });
  }
  return sortProjects(rows);
}

function entryRow({ palaceRoot, p, boardMsgs, stewards, worker, now }) {
  const bundle = resolveBundleDir(palaceRoot, p.title);
  const entryText = (() => { try { return readFileSync(join(palaceRoot, p.file), 'utf8'); } catch { return ''; } })();
  const fm = parseFrontmatter(entryText);
  const s = stewards.get(p.title) || null;
  let state = null; let history = []; let manifest = null;
  if (s) {
    const dirAbs = s.dir.startsWith('/') ? s.dir : join(palaceRoot, s.dir);
    state = readJsonSafe(join(dirAbs, 'state.json'));
    manifest = readJsonSafe(join(dirAbs, 'manifest.json'));
    history = readHistorySafe(join(dirAbs, 'history.jsonl'));
  }
  const nowView = computeNow({
    home: p.title, board: boardMsgs, state, history,
    meta: { stage: fm.stage, data: fm }, entryText, tsNow: now,
    lastTouch: null, bundleMedia: [],
  });
  // What the steward proposed for canon and Loudon has not reviewed: a page
  // with any needs him (the ledger review, Loudon, 2026-10-18). Read straight
  // from the bundle's tuning ledger; no git, so the 3 s poll stays cheap.
  const proposed = (() => {
    if (!bundle) return [];
    try { return parseProposals(readFileSync(join(bundle.bundleDir, `${p.title} — tuning.md`), 'utf8')).filter((x) => x.owed); } catch { return []; }
  })();
  const scrollRel = bundle ? relative(palaceRoot, join(bundle.bundleDir, `${p.title} — scroll.md`)) : null;
  const scrollExists = scrollRel ? existsSync(join(palaceRoot, scrollRel)) : false;
  const lastShip = nowView.last_shipped;
  const lastActivity = [nowView.latest_spoken_ts, state && state.last_active].filter(Boolean).sort().pop() || null;
  const running = !!(worker && worker.running && worker.current === p.title);
  const qi = worker && Array.isArray(worker.queue) ? worker.queue.indexOf(p.title) : -1;
  const queued = !running && qi >= 0 ? qi + 1 : null; // 1-based place in the lane's queue
  return {
    kind: 'project',
    home: p.title,
    path: p.file,
    status: p.status,
    stage: p.stage,
    stewarded: !!s,
    steward_dir: s ? s.dir : null,
    iteration: nowView.iteration,
    last_active: nowView.last_active,
    run_cap: manifest && manifest.stopping_conditions && Number.isInteger(manifest.stopping_conditions.max_iterations) ? manifest.stopping_conditions.max_iterations : (s ? 1 : null),
    model: manifest && manifest.model && manifest.model.name ? resolveModel(manifest.model.name) : null,
    health: state && state.health ? state.health.score || null : null,
    stalled: nowView.stall.stalled,
    barren_streak: nowView.stall.barren_streak,
    open_asks: nowView.open.length,
    open_blocking: nowView.open.some((r) => r.blocking),
    answered_unconsumed: nowView.answered_unconsumed.length,
    proposed_owed: proposed.length,
    proposed_urgent: proposed.filter((x) => x.urgent).length,
    last_shipped: lastShip ? { id: lastShip.id, ts: lastShip.ts, headline: (lastShip.payload && (lastShip.payload.headline || lastShip.payload.subject)) || null } : null,
    last_activity: lastActivity,
    drift: nowView.drift,
    stands: nowView.stands || '',
    scroll_path: scrollRel,
    scroll_exists: scrollExists,
    running,
    queued,
    run: running && worker.current_run ? { position: worker.current_run.position, cap: worker.current_run.cap, cycle_n: worker.current_run.cycle_n } : null,
  };
}

// Ledger state reads git history, so it is cached per page until HEAD or one
// of its files changes; the ceremony list (a frontmatter walk for `trigger:`)
// and the ledger list are re-walked at most every 30 s. The deck polls every 3 s
// and must not pay for a dozen git walks each time.
const ledgerCache = { root: null, listAt: 0, ceremonies: null, ledgers: null, states: new Map() };

function gitHead(palaceRoot) {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: palaceRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).trim();
  } catch { return ''; }
}

const mtimes = (paths) => paths.map((p) => { try { return statSync(p).mtimeMs; } catch { return 0; } }).join(':');

function refreshLists(palaceRoot, fresh) {
  const t = Date.now();
  if (fresh || ledgerCache.root !== palaceRoot || !ledgerCache.ceremonies || t - ledgerCache.listAt > 30000) {
    if (ledgerCache.root !== palaceRoot) ledgerCache.states.clear();
    ledgerCache.root = palaceRoot;
    ledgerCache.ceremonies = listCeremonies(palaceRoot);
    ledgerCache.ledgers = listTuningLedgers(palaceRoot);
    ledgerCache.listAt = t;
  }
  return ledgerCache;
}

/** One page's tuning state, cached until HEAD or the page's files change. */
function cachedTuningState(palaceRoot, { title, path, tuning }, head, fresh) {
  const tuningAbs = join(palaceRoot, tuning);
  const hit = ledgerCache.states.get(title);
  const watch = [tuningAbs, dirname(tuningAbs), join(palaceRoot, '_ops/maps')];
  if (path) watch.push(join(palaceRoot, path));
  else if (hit && hit.state) watch.push(join(palaceRoot, hit.state.path));
  const key = `${head}|${mtimes(watch)}`;
  if (!fresh && hit && hit.key === key) return hit.state;
  const state = readTuningState(palaceRoot, title);
  const keyAfter = state ? `${head}|${mtimes([...watch.slice(0, 3), join(palaceRoot, state.path)])}` : key;
  ledgerCache.states.set(title, { key: keyAfter, state });
  return state;
}

/**
 * Every ceremony's state — every page carrying `trigger:`. A ceremony with a
 * tuning ledger reads it (readTuningState); one that has none yet still lists,
 * with its version from its frontmatter and no runs.
 */
export function ceremonyStates({ palaceRoot, fresh = false }) {
  const { ceremonies } = refreshLists(palaceRoot, fresh);
  const head = gitHead(palaceRoot);
  const out = [];
  for (const c of ceremonies) {
    if (c.tuning) {
      const st = cachedTuningState(palaceRoot, c, head, fresh);
      if (st) { out.push(st); continue; }
    }
    out.push(unledgeredState(palaceRoot, c));
  }
  return out;
}

/** A ceremony that keeps no tuning ledger yet: its version, and nothing run. */
function unledgeredState(palaceRoot, c) {
  const file = join(palaceRoot, c.path);
  const fm = (() => { try { return parseFrontmatter(readFileSync(file, 'utf8')); } catch { return {}; } })();
  const version = normVersion(fm.version);
  const b = resolveBundleDir(palaceRoot, c.title);
  return {
    home: c.title, path: c.path, tuning: null, bundleDir: b ? b.bundleDir : dirname(file), version,
    spec: version ? { hash: null, ts: null, subject: 'no tuning ledger yet', version } : null,
    versions: [], runs: [], runs_since: [], last_run: null, owed: [], orders: [], latest: { heading: null, item: null },
  };
}

/**
 * The pages that keep a tuning ledger and are none of the deck's other kinds —
 * not a project, not stewarded, not a ceremony. A ledger is a family any page
 * may keep (SCHEMA v1.28); such a page shows here as itself, with its Plan.
 */
export function ledgerPageStates({ palaceRoot, fresh = false }) {
  const { ceremonies, ledgers } = refreshLists(palaceRoot, fresh);
  const skip = new Set([
    ...ceremonies.map((c) => c.title),
    ...listProjectEntries(palaceRoot).map((p) => p.title),
    ...stewardIndex(palaceRoot).keys(),
  ]);
  const head = gitHead(palaceRoot);
  const out = [];
  for (const l of ledgers) {
    if (skip.has(l.title)) continue;
    const st = cachedTuningState(palaceRoot, { title: l.title, path: null, tuning: l.tuning }, head, fresh);
    if (st) out.push(st);
  }
  return out;
}

/** A ledger row: the version, the runs since it changed, the last run, what is owed. */
function ledgerRow(palaceRoot, st, kind) {
  const scrollRel = relative(palaceRoot, join(st.bundleDir, `${st.home} — scroll.md`));
  const lastTs = st.last_run ? String(st.last_run.ts) : null;
  const ordersOwed = (st.orders || []).filter((o) => o.owed);
  return {
    kind,
    home: st.home,
    path: st.path,
    tuning: st.tuning,
    version: st.version,
    spec_changed: st.spec ? { ts: st.spec.ts, hash: st.spec.hash, subject: st.spec.subject } : null,
    runs_since: st.version ? st.runs_since.length : st.runs.length,
    runs_total: st.runs.length,
    run_days_since: new Set((st.version ? st.runs_since : st.runs).map((r) => r.date)).size,
    last_run: st.last_run ? { ts: lastTs, subject: `${st.last_run.what || 'a run'} · ${st.last_run.outcome}`, version: st.last_run.version } : null,
    owed: [...st.owed.map((o) => o.n), ...ordersOwed.map((o) => `Loudon ${o.date}`)],
    orders_owed: ordersOwed.length,
    latest: st.latest,
    last_activity: [lastTs, st.spec && st.spec.ts].filter(Boolean).sort().pop() || null,
    scroll_path: scrollRel,
    scroll_exists: existsSync(join(palaceRoot, scrollRel)),
  };
}

const byActivity = (a, b) => String(b.last_activity || '').localeCompare(String(a.last_activity || '')) || a.home.localeCompare(b.home);

/** One row per ceremony (every page carrying `trigger:`), newest activity first. */
export function buildCeremonyRows({ palaceRoot }) {
  return ceremonyStates({ palaceRoot }).map((st) => ledgerRow(palaceRoot, st, 'ceremony')).sort(byActivity);
}

/** One row per page that keeps a tuning ledger and is no other kind of row. */
export function buildLedgerPageRows({ palaceRoot }) {
  return ledgerPageStates({ palaceRoot }).map((st) => ledgerRow(palaceRoot, st, 'page')).sort(byActivity);
}

/**
 * Read any page's scroll with a LIVE Now zone — a project's, a ceremony's, any
 * page's — through the one materializer (scroll-file.js), so the deck shows
 * exactly what a cycle or the CLI would write. Returns the full text as it
 * would be on disk after a regeneration (written only with `write`). A page
 * with no scroll yet gets one rendered in memory, so the deck can always open it.
 */
export function readScroll({ palaceRoot, home, write = false, now = new Date().toISOString() }) {
  const bundle = resolveBundleDir(palaceRoot, home);
  if (!bundle) return null;
  const s = stewardIndex(palaceRoot).get(home) || null;
  const scrollPath = join(bundle.bundleDir, `${home} — scroll.md`);
  const existed = existsSync(scrollPath);
  const r = materializeScroll({ palaceRoot, home, agentDir: s ? s.dir : undefined, tsNow: now, dryRun: !write });
  if (!r.text) {
    // A hand-made scroll without the zone markers is shown as it stands.
    if (!existed) return { home, path: relative(palaceRoot, scrollPath), exists: false, error: r.reason || 'could-not-read-scroll' };
    const raw = readFileSync(scrollPath, 'utf8');
    return {
      home, kind: r.kind || null, path: relative(palaceRoot, scrollPath), exists: true, text: raw,
      zones: { now: readZone(raw, MARK.nowStart, MARK.nowEnd) || '', plan: readPlan(raw), orders: readStandingOrders(raw), making: readZone(raw, MARK.makingStart, MARK.makingEnd) || '' },
      now: {}, tuning: null, ledger_orders: [], steward: s ? { dir: s.dir, agent_id: s.agent_id } : null, ts: now, note: r.reason,
    };
  }
  const text = r.text;
  const nowView = r.nowView;
  const st = r.ledger;
  return {
    home,
    kind: r.kind,
    path: relative(palaceRoot, scrollPath),
    exists: existed || !!write,
    text,
    zones: {
      now: readZone(text, MARK.nowStart, MARK.nowEnd) || '',
      plan: readPlan(text),
      orders: readStandingOrders(text),
      making: readZone(text, MARK.makingStart, MARK.makingEnd) || '',
    },
    now: {
      status: nowView.status, stage: nowView.stage, stewarded: nowView.stewarded, iteration: nowView.iteration,
      last_active: nowView.last_active, open: nowView.open, answered_unconsumed: nowView.answered_unconsumed,
      stalled: nowView.stall.stalled, drift: nowView.drift, stands: nowView.stands, plan: nowView.plan,
      last_shipped: nowView.last_shipped ? { id: nowView.last_shipped.id, ts: nowView.last_shipped.ts } : null,
      version: st ? st.version : null,
      spec_changed: st && st.spec ? { ts: st.spec.ts, hash: st.spec.hash } : null,
      runs_since: st ? (st.version ? st.runs_since.length : st.runs.length) : 0,
      owed: st ? st.owed.map((o) => o.n) : [],
    },
    // The tuning ledger, when the page keeps one: where a one-shot order goes,
    // and the orders already there.
    tuning: st ? st.tuning : null,
    ledger_orders: st ? st.orders : [],
    steward: s ? { dir: s.dir, agent_id: s.agent_id } : null,
    ts: now,
  };
}

/** Loudon's local date, YYYY-MM-DD — the date the palace's ledgers use. */
function localDay(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Write one of Loudon's orders (SCHEMA — Reference §6). Orders come in two
 * kinds, and the deck asks which:
 *   - `standing` (the default) holds until he revokes it. It goes in the
 *     page's scroll, any page's — a ceremony's too — creating the scroll first
 *     if needed: only the orders zone changes, and Now is regenerated as part
 *     of the write so the file on disk is fresh. A steward reads it every
 *     cycle; a ceremony's run reads it before it starts.
 *   - `once` is a job for the next run. It is appended to the page's tuning
 *     ledger as `- from Loudon · <date> · <his words> · owed`, which the next
 *     run's tail read picks up and pays; the scroll file is not touched. A page
 *     with no tuning ledger has nowhere to keep one (`no-tuning-ledger`).
 * Returns the updated readScroll.
 */
export function writeOrders({ palaceRoot, home, orders, kind = 'standing', now = new Date().toISOString(), today = localDay() }) {
  const bundle = resolveBundleDir(palaceRoot, home);
  if (!bundle) return { error: 'entry-file-not-found' };
  if (kind !== 'standing' && kind !== 'once') return { error: 'unknown-order-kind' };
  if (kind === 'once') {
    const ledger = tuningPathFor(palaceRoot, home);
    if (!ledger) return { error: 'no-tuning-ledger' };
    const words = String(orders || '').replace(/\s+/g, ' ').trim();
    if (!words) return { error: 'empty-order' };
    appendLedgerLine(ledger, orderLine(today, words));
    return { ...readScroll({ palaceRoot, home, now }), order_kind: 'once' };
  }
  const s = stewardIndex(palaceRoot).get(home) || null;
  const scrollPath = join(bundle.bundleDir, `${home} — scroll.md`);
  if (!existsSync(scrollPath)) {
    const r = materializeScroll({ palaceRoot, home, agentDir: s ? s.dir : undefined, tsNow: now });
    if (!r.written) return { error: r.reason || 'could-not-create-scroll' };
  }
  const text = readFileSync(scrollPath, 'utf8');
  const start = text.indexOf(MARK.ordersStart);
  const end = start >= 0 ? text.indexOf(MARK.ordersEnd, start) : -1;
  if (start < 0 || end < 0) return { error: 'orders-markers-missing', path: relative(palaceRoot, scrollPath) };
  const body = String(orders || '').trim();
  const fm = (() => { try { return parseFrontmatter(readFileSync(bundle.entryFile, 'utf8')); } catch { return {}; } })();
  const empty = ordersPlaceholderFor(scrollKind(fm), { stewarded: !!s });
  const next = text.slice(0, start + MARK.ordersStart.length) + '\n' + (body || empty) + '\n' + text.slice(end);
  if (!existsSync(bundle.bundleDir)) mkdirSync(bundle.bundleDir, { recursive: true });
  writeFileSync(scrollPath, next);
  // Refresh the Now zone on disk too (a save is a look).
  materializeScroll({ palaceRoot, home, agentDir: s ? s.dir : undefined, tsNow: now });
  return { ...readScroll({ palaceRoot, home, now }), order_kind: 'standing' };
}

/** The deck's older name for writing orders; standing unless `kind` says once. */
export const writeStandingOrders = writeOrders;

/**
 * Write the agreed plan from the deck — Loudon's own edit, so it goes in as
 * agreed. Any page may hold a Plan, a ceremony's too (SCHEMA v1.28); a tuning
 * ledger's owed lines are the next run's to-do beneath it. The change is logged
 * on the scroll's trail with his `why`. Returns the updated readScroll.
 */
export function writePlan({ palaceRoot, home, plan, why = '', headline = '', now = localIso() }) {
  if (!resolveBundleDir(palaceRoot, home)) return { error: 'entry-file-not-found' };
  const s = stewardIndex(palaceRoot).get(home) || null;
  const r = writePlanFile({ palaceRoot, home, plan, why, headline, by: 'Loudon, on the PROJECTS deck', agentDir: s ? s.dir : undefined, ts: now });
  if (r.error) return r;
  return readScroll({ palaceRoot, home, now });
}

/**
 * Give a project a steward from the deck — the one-at-a-time enchantment that
 * batch.md § "Enchant a new steward" describes, reached from the "no steward"
 * rows instead of a terminal. Wraps enchantSteward (manifest + state + history
 * + registry) and maps its status to an HTTP shape. Idempotent: a project that
 * already has a steward comes back `already_enchanted`, not an error. The files
 * it writes are steward machinery, left uncommitted like a cycle's output; the
 * heartbeat wrapper's scoped commit picks them up.
 */
export function enchantProject({ palaceRoot, home, today = new Date().toISOString().slice(0, 10) }) {
  const { status: result, ...r } = enchantSteward({ palaceRoot, title: home, today });
  const http = result === 'enchanted' || result === 'already_enchanted' ? 200
    : result === 'not_found' ? 404
    : 422;
  return { http, ok: http === 200, result, ...r, home };
}
