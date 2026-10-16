#!/usr/bin/env node
// fleet-reading.mjs — the Project Stewardship System reads its own fleet.
//
// Gathers every steward's record into one dataset (fleet.json): each cycle and
// how it ended, every ask and how long it waited for Loudon, each scroll's
// standing orders, plan and recurring rough notes, the cost each transcript
// reports, the heartbeat's last batch and the triage engine's last digest.
// Read-only: it writes fleet.json and nothing else.
//
// It classifies with the lane's own helpers (isMakingMessage, reconcile-
// PendingRequests, recurringRough, costFromTranscriptText) so it can never
// disagree with the PROJECTS deck about what a cycle did.
//
//   node fleet-reading.mjs [--root <palace>] [--out <dir>]

import { readFileSync, existsSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const ROOT = resolve(opt('--root', join(here, '..', '..', '..')));
const OUT = resolve(opt('--out', here));
const ST = join(ROOT, '_ops', 'stigmergy');

const mod = (p) => import(pathToFileURL(join(ST, p)).href);
const sf = await mod('orchestrator/src/scroll-file.js');
const pc = await mod('orchestrator/src/process-cycle.js');
const ef = await mod('orchestrator/src/entry-frontmatter.js');
let costOf = null;
try { costOf = (await mod('app/server/steward-lane.js')).costFromTranscriptText; } catch { /* no app deps here: costs stay null */ }

const readJson = (p, d = null) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return d; } };
const readJsonl = (p) => {
  if (!existsSync(p)) return [];
  const out = [];
  for (const l of readFileSync(p, 'utf8').split('\n')) { if (!l.trim()) continue; try { out.push(JSON.parse(l)); } catch { /* a torn line */ } }
  return out;
};
const ms = (iso) => { const t = iso ? Date.parse(iso) : NaN; return Number.isNaN(t) ? null : t; };
const HOUR = 3600e3, DAY = 24 * HOUR;
const NOW = Date.now();

// The live board, plus the board archived at the 2026-06-16 re-seed: a cycle
// from before the re-seed names messages that now live only in the archive.
// Open asks are read from the live board alone, as the deck reads them.
const board = readJsonl(join(ROOT, '_ops/swarm/persistent/blackboard.jsonl'));
const ARCH = join(ROOT, '_ops/swarm/persistent/Archive');
const archived = existsSync(ARCH) ? readdirSync(ARCH).filter((f) => f.endsWith('.jsonl')).flatMap((f) => readJsonl(join(ARCH, f))) : [];
const byId = new Map([...archived, ...board].filter((m) => m && m.id).map((m) => [m.id, m]));
const allBoard = [...byId.values()];
const registry = readJson(join(ROOT, '_ops/agents/permanent/REGISTRY.json'), { agents: [] });

// Transcripts, keyed by steward slug: one per dispatched cycle (and per retry).
const TX = join(ST, '.actuator-steward', 'transcripts');
const transcripts = {};
if (existsSync(TX)) {
  for (const f of readdirSync(TX)) {
    const m = /^(.+)-cycle-(\d+)-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)\.jsonl$/.exec(f);
    if (!m) continue;
    const ts = m[3].replace(/T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z/, 'T$1:$2:$3.$4Z');
    let cost = null;
    if (costOf) { try { cost = costOf(readFileSync(join(TX, f), 'utf8')); } catch { /* unreadable */ } }
    (transcripts[m[1]] ||= []).push({ cycle: Number(m[2]), ts, cost, file: `_ops/stigmergy/.actuator-steward/transcripts/${f}` });
  }
}

function readCycles(history) {
  const spawns = {}; const cleared = new Set();
  for (const e of history) {
    const s = /^CYCLE_(\d+)_SPAWN$/.exec(e.event || '');
    if (s) spawns[Number(s[1])] = { ts: e.ts, by: e.dispatched_by || null, model: e.model || null };
    if (e.event === 'STALL_CLEARED') for (const c of e.cycles || []) cleared.add(Number(c.cycle));
  }
  const cycles = [];
  for (const e of history) {
    if (e.event === 'CYCLE_COMPLETE') {
      const n = Number(e.iteration);
      const posted = Array.isArray(e.posted_messages) ? e.posted_messages : [];
      const msgs = posted.map((id) => byId.get(id)).filter(Boolean);
      let outcome;
      if (!posted.length) outcome = cleared.has(n) ? 'interrupted' : 'barren';
      else if (msgs.some(sf.isMakingMessage)) outcome = 'made';
      else if (msgs.some((m) => m.type === 'RESOURCE_REQUEST')) outcome = 'asked';
      else if (msgs.length) outcome = 'spoke';
      else outcome = 'lost';   // posted, but the board no longer holds it (the May reset)
      const sp = spawns[n] || {};
      cycles.push({
        n, ts: e.ts || sp.ts || null, outcome,
        by: sp.by || (e.batch_run ? 'batch' : null), model: sp.model || null,
        posted: posted.length,
        blocking: msgs.some((m) => m.type === 'RESOURCE_REQUEST' && m.payload && m.payload.blocking === true),
        page_edits: msgs.some((m) => m.payload && Array.isArray(m.payload.page_edits) && m.payload.page_edits.length),
        reclassified: cleared.has(n) || undefined,
      });
    } else if (e.event === 'CYCLE_INTERRUPTED') {
      cycles.push({ n: Number(e.attempted_cycle), ts: e.ts, outcome: 'interrupted', by: e.dispatched_by || null, model: e.model || null, reason: e.reason || null, posted: 0 });
    }
  }
  return cycles;
}

// What a left-rough note is waiting on — read loosely from its words. A cycle
// that "can't hear" is waiting on an ear; one that never opened Max or Live is
// waiting on a hand in the tool; the rest are the steward's own unfinished work.
function roughNeeds(note) {
  const t = String(note).toLowerCase();
  if (/\b(hear|heard|listen|listened|ear|ears|audition|audible)\b/.test(t)) return 'ear';
  if (/\b(opened|open|loaded|load|clicked|click|ran|run|played|play)\b.*\b(max|live|ableton|browser|patch|device|sforzando|decentsampler|plugin|rnbo)\b|\b(max|live|ableton|browser)\b.*\b(opened|loaded|run)\b/.test(t)) return 'hands';
  if (/\b(see|seen|look|looked|eye|eyes|watch|watched)\b/.test(t)) return 'eye';
  return 'work';
}

const stewards = [];
for (const entry of registry.agents || []) {
  const dir = join(ROOT, entry.dir);
  const slug = basename(entry.dir);
  const manifest = readJson(join(dir, 'manifest.json'), {});
  const state = readJson(join(dir, 'state.json'), {});
  const history = readJsonl(join(dir, 'history.jsonl'));
  const meta = ef.readEntryMeta(ROOT, entry.home);
  const cycles = readCycles(history);

  const { stillPending } = pc.reconcilePendingRequests(board, entry.home);
  const openIds = new Set(stillPending.map((a) => a.request_id));
  const every = pc.reconcilePendingRequests(allBoard, entry.home);
  const asks = [...every.nowResolved, ...every.stillPending.filter((a) => openIds.has(a.request_id))].map((a) => {
    const p = ms(a.posted_at), r = ms(a.resolved_at);
    return {
      id: a.request_id, topic: a.decision_topic || null, kind: a.kind || null, blocking: !!a.blocking,
      posted_at: a.posted_at || null, resolved_at: a.resolved_at || null,
      wait_h: p != null && r != null ? Math.max(0, (r - p) / HOUR) : null,
      open_days: r == null && p != null ? (NOW - p) / DAY : null,
    };
  });

  const sp = sf.scrollPathFor(ROOT, entry.home);
  const scrollPath = sp ? resolve(ROOT, sp) : null;
  const scrollText = scrollPath && existsSync(scrollPath) ? readFileSync(scrollPath, 'utf8') : '';
  const orders = scrollText ? sf.readStandingOrders(scrollText) : '';
  const plan = scrollText ? sf.readPlanInfo(scrollText) : { text: '' };
  let rough = [], roughNotes = [];
  try { rough = scrollText ? sf.recurringRough(scrollText) : []; roughNotes = scrollText ? sf.leftRoughNotes(scrollText) : []; } catch { /* older scroll shape */ }
  const stall = sf.readStall(history, state);

  stewards.push({
    home: entry.home, slug, dir: entry.dir, registered_at: entry.registered_at || null,
    type: meta?.data?.type || null, status: meta?.data?.status || null, stage: meta?.stage || null,
    role: manifest.role || null,
    cap: manifest.stopping_conditions?.max_iterations ?? null,
    iteration: Number.isFinite(state.iteration) ? state.iteration : 0,
    last_active: state.last_active || null,
    health: state.health?.score || null,
    stalled: stall.stalled, barren_streak: stall.barren_streak,
    cycles, asks,
    open_asks: stillPending.length,
    scroll: {
      path: scrollPath ? scrollPath.slice(ROOT.length + 1) : null,
      has_orders: !!orders, orders_words: orders ? orders.split(/\s+/).length : 0,
      has_plan: !!plan.text, plan_revised: plan.revised || null,
      rough_notes: roughNotes.map((n) => ({ cycle: n.cycle, date: n.date, needs: roughNeeds(n.note), note: n.note.length > 240 ? `${n.note.slice(0, 239)}…` : n.note })),
      recurring_rough: rough.map((r) => ({ since: r.since, last: r.last, notes: r.cycles, latest: r.latest })),
    },
    transcripts: (transcripts[slug] || []).sort((a, b) => a.ts.localeCompare(b.ts)),
  });
}

// Projects with no steward: every scroll whose entry is a project and is not in the registry.
const stewardedHomes = new Set(stewards.map((s) => s.home));
const unstewarded = [];
const PROJ = join(ROOT, 'Projects');
for (const d of existsSync(PROJ) ? readdirSync(PROJ) : []) {
  const f = join(PROJ, d, `${d} — scroll.md`);
  if (!existsSync(f) || stewardedHomes.has(d)) continue;
  const meta = ef.readEntryMeta(ROOT, d);
  if (meta?.data?.type !== 'project') continue;
  unstewarded.push({ home: d, status: meta.data.status || null, stage: meta.stage || null });
}

// Fleet-wide asks open on TRICKSTER, from anyone.
const answered = new Set(board.filter((m) => m && (m.type === 'RESOURCE_GRANT' || m.type === 'RESOURCE_DENY') && m.re).map((m) => m.re));
const openAsks = board.filter((m) => m && m.type === 'RESOURCE_REQUEST' && m.board === 'TRICKSTER' && !answered.has(m.request_id || m.id))
  .map((m) => ({ id: m.request_id || m.id, from: m.from, ts: m.ts, blocking: m.payload?.blocking === true, topic: m.payload?.decision_topic || m.payload?.subject || null }));

const grants = board.filter((m) => m && m.type === 'RESOURCE_GRANT');
const handoffs = { ready: 0, picked_up: 0, closed: 0 };
for (const m of board) {
  const k = m && m.payload && m.payload.kind;
  if (k === 'handoff_ready') handoffs.ready++;
  else if (k === 'handoff_picked_up') handoffs.picked_up++;
  else if (k === 'handoff_closed') handoffs.closed++;
}

const lastBatch = readJson(join(ROOT, '_ops/heartbeat/last-batch.json'));
const limits = readJson(join(ROOT, '_ops/heartbeat/limits.json'));
const logsDir = join(ROOT, '_ops/heartbeat/logs');
const batchLogs = existsSync(logsDir) ? readdirSync(logsDir).filter((f) => f.startsWith('steward-batch-')).sort().map((f) => ({ file: f, ts: f.replace(/^steward-batch-|\.log$/g, ''), bytes: statSync(join(logsDir, f)).size })) : [];
const digest = readJson(join(ST, 'trickster-auto/digest-latest.json'));

const fleet = {
  schema: 'fleet-reading/0.1',
  generated_at: new Date(NOW).toISOString(),
  palace_root: ROOT,
  stewards,
  unstewarded,
  board: {
    messages: board.length, archived: archived.length,
    open_asks: openAsks,
    grants: grants.length,
    grants_by_trickster: grants.filter((g) => g.from === 'TRICKSTER').length,
    handoffs,
  },
  heartbeat: {
    limits,
    last_batch: lastBatch ? {
      started: lastBatch.started, ended: lastBatch.ended, source: lastBatch.source,
      due: lastBatch.due?.length ?? null, fired: lastBatch.fired || [], cycles: lastBatch.cycles || [],
      stopped_because: lastBatch.stopped_because || null, spent_usd: lastBatch.spent_usd ?? lastBatch.usd ?? null,
    } : null,
    batch_logs: batchLogs,
  },
  triage: digest ? { generated_at: digest.generated_at, mode: digest.mode, counts: digest.counts } : null,
};

writeFileSync(join(OUT, 'fleet.json'), JSON.stringify(fleet, null, 1) + '\n');
const c = stewards.flatMap((s) => s.cycles);
const tally = c.reduce((a, x) => ((a[x.outcome] = (a[x.outcome] || 0) + 1), a), {});
console.log(`fleet.json: ${stewards.length} stewards, ${c.length} cycles ${JSON.stringify(tally)}, ${openAsks.length} open asks, ${unstewarded.length} projects without a steward`);

// The dashboard: the template with this reading, the written suggestions
// (reading.json, the steward's own words) and the house review layer inlined,
// so the one file opens anywhere with no server.
const TEMPLATE = join(here, 'dashboard.template.html');
if (existsSync(TEMPLATE)) {
  const inline = (x) => JSON.stringify(x).replace(/</g, '\\u003c');
  const reading = readJson(join(here, 'reading.json'), {});
  const reviewJs = (() => { try { return readFileSync(join(ROOT, '_ops/loudon-live/design-system/ui_kits/review-layer/review-layer.js'), 'utf8'); } catch { return ''; } })();
  const html = readFileSync(TEMPLATE, 'utf8')
    .replace('/*FLEET*/', () => inline(fleet))
    .replace('/*READING*/', () => inline(reading))
    .replace('/*REVIEW_LAYER*/', () => reviewJs.replace(/<\/script/gi, '<\\/script'));
  writeFileSync(join(OUT, 'Stewardship Health.html'), html);
  console.log(`Stewardship Health.html written (${Math.round(html.length / 1024)} KB)`);
}
