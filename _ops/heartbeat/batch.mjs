#!/usr/bin/env node
// batch.mjs — the heartbeat's steward batch, fired through STIGMERGY's own
// steward lane (2026-10-14).
//
// Before this the heartbeat ran one long `claude -p` session on the
// palace-orchestrator skill, which dispatched stewards as subagents: no
// transcript on disk, nothing on the PROJECTS deck, no limit but the manifest
// cap, and a usage limit made it sit silent for hours and carry on. Loudon:
// "I need to be able to see what the heartbeat is doing. The heartbeat needs
// some additional limits, this was way too much."
//
// Now:
//   1. Read _ops/heartbeat/limits.json.
//   2. Ask batch-plan.js which stewards are due (stage floor + debounce), order
//      them least-recently-active first, and take the first N.
//   3. Make sure the STIGMERGY app is up (start it if not — the lane lives in
//      it), then POST /api/stewards/advance-all with the names, the per-steward
//      cycle cap, the wall clock and the dollar budget, source "heartbeat".
//   4. Watch the lane until the batch ends, writing one log line per reap, and
//      leave _ops/heartbeat/last-batch.json for the scheduler strip.
// Every cycle fires the same way a click on the deck does: same worker, same
// transcript under .actuator-steward/transcripts/ (so the WATCH pane works),
// same per-cycle commit, same scroll regeneration.
//
//   node _ops/heartbeat/batch.mjs [--dry-run] [--ignore-debounce] [--root <palace>]

import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, openSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const ROOT = resolve(arg('--root', resolve(here, '../..')));
const DRY = argv.includes('--dry-run');
const APP = process.env.STIGMERGY_URL || 'http://localhost:5173';
const LANE_STATE = join(ROOT, '_ops/stigmergy/.actuator-steward');
const LAST = join(here, 'last-batch.json');

const log = (line) => process.stdout.write(`${new Date().toISOString().slice(11, 19)} ${line}\n`);

function readLimits() {
  const defaults = { max_stewards_per_batch: 4, max_cycles_per_steward: 2, max_cycle_minutes: 25, max_minutes: 60, max_usd: 15, debounce_hours: 12 };
  try { return { ...defaults, ...JSON.parse(readFileSync(join(here, 'limits.json'), 'utf8')) }; } catch { return defaults; }
}

function plan(limits) {
  const out = execFileSync(process.execPath, [join(ROOT, '_ops/stigmergy/orchestrator/src/batch-plan.js'), '--root', ROOT, '--min-age-hours', String(limits.debounce_hours), '--no-unenchanted', ...(argv.includes('--ignore-debounce') ? ['--ignore-debounce'] : [])], { encoding: 'utf8' });
  const p = JSON.parse(out);
  const due = (p.due || []).slice().sort((a, b) => String(a.last_active || '').localeCompare(String(b.last_active || '')));
  return { due, skipped: p.skipped || p.not_due || [] };
}

async function appUp() {
  try { const r = await fetch(`${APP}/api/stewards`, { signal: AbortSignal.timeout(4000) }); return r.ok; } catch { return false; }
}

async function ensureApp() {
  if (await appUp()) return 'already up';
  log('STIGMERGY app is down — starting it (the lane lives in it)');
  const outLog = openSync(join(here, 'logs', 'app-from-heartbeat.log'), 'a');
  const child = spawn('npm', ['--prefix', join(ROOT, '_ops/stigmergy/app'), 'run', 'dev'], { cwd: ROOT, detached: true, stdio: ['ignore', outLog, outLog], env: { ...process.env, PALACE_ROOT: ROOT } });
  child.unref();
  for (let i = 0; i < 30; i++) { await new Promise((r) => setTimeout(r, 2000)); if (await appUp()) return `started (pid ${child.pid})`; }
  throw new Error('the app did not come up in 60 s — see logs/app-from-heartbeat.log');
}

async function status() {
  const r = await fetch(`${APP}/api/stewards`, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`api/stewards ${r.status}`);
  return (await r.json()).worker;
}

function readLastCycle() {
  try { return JSON.parse(readFileSync(join(LANE_STATE, 'last-cycle.json'), 'utf8')); } catch { return null; }
}

async function main() {
  const limits = readLimits();
  const started = new Date();
  log(`heartbeat batch — limits: ${limits.max_stewards_per_batch} stewards · ${limits.max_cycles_per_steward} cycles each · ${limits.max_cycle_minutes} min per cycle · ${limits.max_minutes} min · $${limits.max_usd} · debounce ${limits.debounce_hours} h`);
  const { due } = plan(limits);
  const names = due.slice(0, limits.max_stewards_per_batch).map((d) => d.agent);
  log(`due: ${due.length} (${due.map((d) => d.agent).join(', ') || 'none'})`);
  log(`firing: ${names.join(', ') || 'nothing'}`);
  const record = { started: started.toISOString(), ended: null, source: 'heartbeat', limits, due: due.map((d) => d.agent), fired: names, cycles: [], usd: 0, stopped_because: null, dry_run: DRY };
  if (DRY || names.length === 0) { record.ended = new Date().toISOString(); writeFileSync(LAST, JSON.stringify(record, null, 2) + '\n'); log(DRY ? 'dry run — nothing fired' : 'nothing due — done'); return; }

  log(`app: ${await ensureApp()}`);
  const before = await status();
  if (before.running) { log(`the lane is busy (${before.current}) — not firing; try again next morning`); record.stopped_because = 'lane_busy'; record.ended = new Date().toISOString(); writeFileSync(LAST, JSON.stringify(record, null, 2) + '\n'); return; }

  const r = await fetch(`${APP}/api/stewards/advance-all`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ names, max_cycles: limits.max_cycles_per_steward, max_cycle_minutes: limits.max_cycle_minutes, max_minutes: limits.max_minutes, max_usd: limits.max_usd, source: 'heartbeat' }) });
  const fired = await r.json().catch(() => ({}));
  if (!r.ok || !fired.ok) { log(`advance-all refused: ${fired.msg || fired.error || r.status}`); record.stopped_because = 'refused'; record.ended = new Date().toISOString(); writeFileSync(LAST, JSON.stringify(record, null, 2) + '\n'); process.exitCode = 1; return; }
  log(`lane: ${fired.current} fired; ${(fired.queue || []).length} queued`);

  // Watch until the batch ends: one line per reap, from last-cycle.json.
  let lastSeen = (() => { try { return statSync(join(LANE_STATE, 'last-cycle.json')).mtimeMs; } catch { return 0; } })();
  const hardStop = Date.now() + (limits.max_minutes + 20) * 60000; // the lane enforces the clock; this is the backstop
  for (;;) {
    await new Promise((res) => setTimeout(res, 15000));
    let m = 0; try { m = statSync(join(LANE_STATE, 'last-cycle.json')).mtimeMs; } catch { /* none yet */ }
    if (m !== lastSeen) {
      lastSeen = m;
      const c = readLastCycle();
      if (c) {
        record.cycles.push({ name: c.name, cycle: c.cycle_n, stop: c.stop_hint, ok: c.ok, usd: c.usd ?? null, commit: c.commit && c.commit.hash ? c.commit.hash : null, error: c.error || null });
        log(`reaped: ${c.name} cycle ${c.cycle_n} -> ${c.stop_hint}${c.usd != null ? ` · $${c.usd.toFixed(2)}` : ''}${c.commit && c.commit.hash ? ` · ${c.commit.hash}` : ''}${c.error ? ` · ${c.error}` : ''}`);
      }
    }
    let st; try { st = await status(); } catch (e) { log(`status unreachable: ${e.message}`); continue; }
    if (st.batch && typeof st.batch.usd === 'number') record.usd = st.batch.usd;
    if (st.batch && st.batch.stopped_because) record.stopped_because = st.batch.stopped_because;
    if (!st.running && (!st.queue || st.queue.length === 0)) { log(`batch ended — ${record.cycles.length} cycle(s), $${record.usd.toFixed(2)}${record.stopped_because ? `, stopped: ${record.stopped_because}` : ''}`); break; }
    if (Date.now() > hardStop) { log('backstop: the watch window passed; leaving the lane to finish on its own'); record.stopped_because = record.stopped_because || 'watch_backstop'; break; }
  }
  record.ended = new Date().toISOString();
  writeFileSync(LAST, JSON.stringify(record, null, 2) + '\n');
}

main().catch((e) => { log(`ERROR: ${e.message}`); process.exitCode = 1; });
