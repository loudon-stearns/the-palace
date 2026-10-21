// port-lease.mjs — a loopback port leased to one agent at a time.
//
// Several Claudes run preview servers on this Mac at once: a rich face over a
// throwaway palace, a scratch STIGMERGY. A fixed port (the old :8842) is a
// shared singleton, and "find a free port, then start on it" races: two
// sessions can find the same one between the look and the start. Worse, a
// look that tries 127.0.0.1 alone calls 5173 free while the live STIGMERGY
// holds it on [::1] (app README, "A scratch Vite given `port: 0` takes 5173").
// This module hands each server its own port ([[assume multi-agent]]: lease
// what is scarce, scope every list and stop to your own).
//
// A lease is a kernel lock (flock) on `<dir>/port-<N>.lock`, taken by the
// server's own process and held for as long as it lives. It is the committer
// door's mechanism (app/server/door.js), aimed at a port instead of the index:
//   - Two holders never hold one port. The kernel decides, not a read and a
//     write of a shared file.
//   - A holder that dies, however it dies, frees its ports at once. There is
//     no stale lease to sweep.
//   - A lock file is never deleted. Deleting one while it is held would let a
//     second process lock a fresh file of the same name.
// Node has no flock, so a three-line helper (python3, else perl) locks a file
// this process opened and exits; the lock belongs to the open file, which this
// process keeps open. Files Node opens are close-on-exec, so a child the server
// starts (Vite's esbuild) does not keep the lock past the server.
//
// Beside each lock, `port-<N>.json` says who holds it: the holder's slug, by
// the Commons rule (identity.py), and its Claude session, pid, start time and
// what it serves. Only a process holding the lock writes the note, so two never
// write one note. list reads the notes and shows the live ones; stop signals
// only a server of your own whose pid is still the one that wrote the note.
//
// Before a port is handed out, a probe connects to it on 127.0.0.1 and on
// [::1]. Anything that answers there keeps it: the live STIGMERGY, another app,
// a server someone started by hand. The probe connects rather than binds,
// because a bind on 127.0.0.1 succeeds beside a server on [::1] alone. The
// server's own start, with its port strict, is the last word; a tool that
// loses that race releases the port and leases the next.
//
//   node _ops/commons/port-lease.mjs whoami
//   node _ops/commons/port-lease.mjs list [--all] [--json]
//   node _ops/commons/port-lease.mjs stop [--port N] [--kind K]
//
// Env: PALACE_LEASE_DIR (default: <git common dir>/palace-leases, shared by
// every worktree), PALACE_LEASE_PORTS (default 8850-8949), COMMONS_AGENT_SLUG.

import net from 'node:net';
import os from 'node:os';
import {
  openSync, closeSync, readFileSync, writeFileSync, renameSync, unlinkSync, readdirSync, mkdirSync, realpathSync,
} from 'node:fs';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

// Below the ephemeral range (49152+), so the OS never hands one of these to a
// socket that asked for any port; clear of every port .claude/launch.json names.
export const DEFAULT_RANGE = [8850, 8949];

// A pid whose process started more than this far from the note's start time
// has gone to someone else (the actuator's scar 6, app/server/actuator.js).
const START_SLACK_MS = 5000;

export class LeaseError extends Error {
  constructor(message) { super(message); this.name = 'LeaseError'; }
}

// ── who holds ────────────────────────────────────────────────────────────────

/**
 * This agent's namespace slug, by the Commons rule (_ops/commons/identity.py,
 * agent_slug): $COMMONS_AGENT_SLUG, then $RUNPOD_AGENT_SLUG, then the name of
 * the checkout this file sits in, then host-<hostname>; kebab, at most 32.
 * The parity test holds the two to one answer.
 */
export function agentSlug(env = process.env) {
  let s = String(env.COMMONS_AGENT_SLUG || '').trim() || String(env.RUNPOD_AGENT_SLUG || '').trim();
  if (!s) {
    try {
      s = basename(execFileSync('git', ['-C', HERE, 'rev-parse', '--show-toplevel'], {
        encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'],
      }).trim());
    } catch { s = ''; }
  }
  if (!s) s = 'host-' + os.hostname();
  s = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s.slice(0, 32) || 'default';
}

/**
 * The holder: the Commons slug and, when a Claude session runs this, its id.
 * The slug is per checkout, so two sessions sharing one checkout share it; the
 * session tells them apart. A human at a terminal has no session id.
 */
export function holder(env = process.env) {
  return { slug: agentSlug(env), session: String(env.CLAUDE_CODE_SESSION_ID || '').trim() || null };
}

/** Is this note's lease held by `me`? Same slug and same session (both none counts). */
export function isMine(note, me = holder()) {
  return !!note && note.slug === me.slug && (note.session || null) === (me.session || null);
}

// ── where leases live ────────────────────────────────────────────────────────

/** The folder every worktree of this repo shares, or the user's temp folder outside git. */
export function leaseDir(env = process.env) {
  if (env.PALACE_LEASE_DIR) return resolve(env.PALACE_LEASE_DIR);
  try {
    const common = execFileSync('git', ['-C', HERE, 'rev-parse', '--path-format=absolute', '--git-common-dir'], {
      encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (common) return join(common, 'palace-leases');
  } catch { /* not in a checkout */ }
  return join(os.tmpdir(), 'palace-leases');
}

/**
 * Where a leased server's log and caches go: the user's temp folder, or beside
 * the leases when PALACE_LEASE_DIR moves them (as tests do, so a run leaves nothing behind).
 */
export function scratchDir(env = process.env) {
  return env.PALACE_LEASE_DIR ? join(resolve(env.PALACE_LEASE_DIR), 'scratch') : join(os.tmpdir(), 'palace-leases');
}

/** [lo, hi], inclusive, from PALACE_LEASE_PORTS ("8850-8949") or the default. */
export function portRange(env = process.env) {
  const m = /^\s*(\d+)\s*-\s*(\d+)\s*$/.exec(String(env.PALACE_LEASE_PORTS || ''));
  if (!m) return [...DEFAULT_RANGE];
  const lo = +m[1], hi = +m[2];
  if (!(lo >= 1024 && hi <= 65535 && lo <= hi)) throw new LeaseError(`PALACE_LEASE_PORTS must be lo-hi within 1024-65535, not "${env.PALACE_LEASE_PORTS}"`);
  return [lo, hi];
}

const lockPath = (dir, port) => join(dir, `port-${port}.lock`);
const notePath = (dir, port) => join(dir, `port-${port}.json`);

// ── the kernel lock ──────────────────────────────────────────────────────────

// The door's helpers, asked once: lock fd 0 exclusively or exit 75 at once.
// `-I`: isolated mode, so no fcntl.py lying in some folder stands in for the real one.
const PY_TRY = [
  'import fcntl,sys,errno',
  'try:',
  '    fcntl.flock(0, fcntl.LOCK_EX|fcntl.LOCK_NB)',
  'except OSError as e:',
  '    sys.exit(75 if e.errno in (errno.EWOULDBLOCK, errno.EAGAIN) else 2)',
].join('\n');
const PERL_TRY = 'use Fcntl qw(:flock); exit(flock(STDIN, LOCK_EX|LOCK_NB) ? 0 : 75)';
const HELPERS = [['python3', ['-I', '-c', PY_TRY]], ['/usr/bin/perl', ['-e', PERL_TRY]]];

/** Try to lock an open file without waiting. true: this process now holds it. */
function tryLock(fd, dir) {
  for (const [cmd, args] of HELPERS) {
    const r = spawnSync(cmd, args, { cwd: dir, stdio: [fd, 'ignore', 'pipe'], encoding: 'utf8', timeout: 10_000 });
    if (r.error && r.error.code === 'ENOENT') continue;
    if (r.error) throw r.error;
    if (r.status === 0) return true;
    if (r.status === 75) return false;
    throw new LeaseError(`lock helper ${cmd} failed (exit ${r.status}): ${String(r.stderr || '').trim()}`);
  }
  throw new LeaseError('no lock helper available (python3 or perl)');
}

// ── is anything there ────────────────────────────────────────────────────────

function answersOn(port, host, timeoutMs) {
  return new Promise((done) => {
    const sock = net.connect({ port, host });
    const finish = (yes) => { sock.removeAllListeners(); sock.destroy(); done(yes); };
    sock.setTimeout(timeoutMs, () => finish(true)); // loopback that neither answers nor refuses: leave it be
    sock.once('connect', () => finish(true));
    sock.once('error', () => finish(false)); // refused, or no IPv6 loopback at all
  });
}

/** Does anything answer on this port at 127.0.0.1 or [::1]? */
export async function answers(port, { timeoutMs = 500 } = {}) {
  const [v4, v6] = await Promise.all([answersOn(port, '127.0.0.1', timeoutMs), answersOn(port, '::1', timeoutMs)]);
  return v4 || v6;
}

// ── is the holder still there ────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// `ps -o lstart=` under LC_ALL=C and TZ=UTC as epoch ms, NaN for anything else.
// Matched by shape, never Date.parse (the actuator's reason, scar 6).
function lstartMs(text) {
  const m = /^[A-Z][a-z]{2} ([A-Z][a-z]{2}) {1,2}(\d{1,2}) (\d{2}):(\d{2}):(\d{2}) (\d{4})$/.exec(String(text).trim());
  const month = m ? MONTHS.indexOf(m[1]) : -1;
  return month < 0 ? NaN : Date.UTC(+m[6], month, +m[2], +m[3], +m[4], +m[5]);
}

/** When the process holding `pid` started, as epoch ms; NaN when ps cannot say. */
export function processStartMs(pid) {
  try {
    return lstartMs(execFileSync('ps', ['-p', String(pid), '-o', 'lstart='], {
      encoding: 'utf8', timeout: 2000, stdio: ['ignore', 'pipe', 'ignore'], env: { ...process.env, TZ: 'UTC', LC_ALL: 'C' },
    }));
  } catch { return NaN; }
}

function pidExists(pid) {
  try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
}

/**
 * 'live'    — the pid exists and started when the note says;
 * 'gone'    — no such process, or the pid has gone to a process that started at another time;
 * 'unknown' — the pid exists and ps could not say when it started.
 */
export function holderState(note) {
  const pid = note && note.pid;
  if (!Number.isInteger(pid) || pid <= 0) return 'gone';
  if (!pidExists(pid)) return 'gone';
  const started = Date.parse(note.started || '');
  const actual = processStartMs(pid);
  if (Number.isNaN(started) || Number.isNaN(actual)) return 'unknown';
  return Math.abs(actual - started) > START_SLACK_MS ? 'gone' : 'live';
}

// ── notes ────────────────────────────────────────────────────────────────────

function readNote(dir, port) {
  try { return JSON.parse(readFileSync(notePath(dir, port), 'utf8')); } catch { return null; }
}

// Whole or not at all: a reader never sees half a note.
function writeNote(dir, port, note) {
  const tmp = `${notePath(dir, port)}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(note, null, 2) + '\n');
  renameSync(tmp, notePath(dir, port));
}

// The door's clearHolder rule: a note is removed only by the process it names.
function clearNote(dir, port) {
  const n = readNote(dir, port);
  if (n && n.pid === process.pid) { try { unlinkSync(notePath(dir, port)); } catch { /* gone already */ } }
}

const START_ISO = new Date(Date.now() - process.uptime() * 1000).toISOString();

// ── leasing ──────────────────────────────────────────────────────────────────

const held = new Map(); // `${dir}\0${port}` -> { dir, port, fd }, across every lease this process holds
let exitHooked = false;
function hookExit() {
  if (exitHooked) return;
  exitHooked = true;
  // The courtesy: notes go with the process. The locks need nothing; the
  // kernel frees them. A process killed outright leaves its notes, which
  // list reads as gone and the next holder of the port overwrites.
  process.on('exit', () => { for (const h of held.values()) clearNote(h.dir, h.port); });
}

function takePort(dir, port) {
  const key = `${dir}\0${port}`;
  if (held.has(key)) return null; // this process holds it already, for another name
  let fd;
  try { fd = openSync(lockPath(dir, port), 'a'); } catch (e) { throw new LeaseError(`cannot open ${lockPath(dir, port)}: ${e.message}`); }
  let ok = false;
  try { ok = tryLock(fd, dir); } finally { if (!ok) closeSync(fd); }
  if (!ok) return null;
  const h = { dir, port, fd };
  held.set(key, h);
  return h;
}

function dropPort(h) {
  clearNote(h.dir, h.port);
  held.delete(`${h.dir}\0${h.port}`);
  try { closeSync(h.fd); } catch { /* closed */ }
}

/**
 * Lease one port per name, all or none.
 *
 *   const lease = await acquire({ names: ['page'], kind: 'rich-face', meta: { root } });
 *   lease.ports.page  → 8850
 *   lease.update({ url })   after the server is up
 *   lease.release()         when it stops (process exit does the same)
 *
 * `port` asks for one exact port (with one name); it is never swapped for another.
 * @returns {Promise<{ ports: Record<string, number>, holder: object, dir: string,
 *   update(meta: object): void, release(name?: string): void, renew(name: string): Promise<number> }>}
 */
export async function acquire({ names = ['port'], kind = 'server', meta = {}, port = null, env = process.env, dir = leaseDir(env), range = portRange(env) } = {}) {
  if (!names.length || new Set(names).size !== names.length) throw new LeaseError('names must be distinct and at least one');
  if (port != null && names.length !== 1) throw new LeaseError('an exact port leases one name');
  mkdirSync(dir, { recursive: true });
  hookExit();
  const me = holder(env);
  const mine = new Map(); // name -> handle
  let extra = { ...meta };

  const noteFor = (name, h) => ({
    port: h.port, name, kind, slug: me.slug, session: me.session,
    pid: process.pid, started: START_ISO, leased: new Date().toISOString(), cwd: process.cwd(), ...extra,
  });

  async function leaseOne(name, skip) {
    const [lo, hi] = range;
    const candidates = port != null ? [Number(port)] : Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
    for (const p of candidates) {
      if (skip.has(p)) continue;
      const h = takePort(dir, p);
      if (!h) continue;
      if (await answers(p)) { dropPort(h); continue; }
      writeNote(dir, p, noteFor(name, h));
      return h;
    }
    return null;
  }

  for (const name of names) {
    const h = await leaseOne(name, new Set());
    if (!h) {
      for (const got of mine.values()) dropPort(got);
      if (port != null) {
        const n = readNote(dir, Number(port));
        const who = n && holderState(n) !== 'gone' ? ` — leased to ${describe(n)}` : ' — something else answers there, or it is leased';
        throw new LeaseError(`port ${port} is not free${who}`);
      }
      throw new LeaseError(`no free port in ${range[0]}-${range[1]} (leases in ${dir}; \`node _ops/commons/port-lease.mjs list --all\` shows who holds them)`);
    }
    mine.set(name, h);
  }

  const lease = {
    dir,
    holder: me,
    get ports() { return Object.fromEntries([...mine].map(([n, h]) => [n, h.port])); },
    update(more) {
      extra = { ...extra, ...more };
      for (const [n, h] of mine) writeNote(dir, h.port, noteFor(n, h));
    },
    release(name) {
      for (const [n, h] of [...mine]) if (name === undefined || n === name) { dropPort(h); mine.delete(n); }
    },
    // The server lost the race for this name's port after all (something
    // started on it between the probe and the start). Let it go, lease the next.
    async renew(name) {
      if (port != null) throw new LeaseError(`port ${port} was asked for exactly; it is taken`);
      const old = mine.get(name);
      const skip = new Set([...mine.values()].map((h) => h.port));
      const h = await leaseOne(name, skip);
      if (old) dropPort(old);
      if (!h) { mine.delete(name); throw new LeaseError(`no free port in ${range[0]}-${range[1]}`); }
      mine.set(name, h);
      return h.port;
    },
  };
  return lease;
}

// ── list and stop: your own ──────────────────────────────────────────────────

/** Every note in `dir` whose holder is not gone, yours only unless `all`. */
export function list({ all = false, kind = null, env = process.env, dir = leaseDir(env) } = {}) {
  const me = holder(env);
  let files;
  try { files = readdirSync(dir); } catch { return []; }
  const notes = [];
  for (const f of files) {
    const m = /^port-(\d+)\.json$/.exec(f);
    if (!m) continue;
    const n = readNote(dir, +m[1]);
    if (!n || (kind && n.kind !== kind) || (!all && !isMine(n, me))) continue;
    const state = holderState(n);
    if (state === 'gone') continue;
    notes.push({ ...n, state, mine: isMine(n, me) });
  }
  return notes.sort((a, b) => a.port - b.port);
}

/** "rich-face for sharp-brahmagupta (session 33b65c3c, pid 123)" */
export function describe(n) {
  const session = n.session ? `session ${String(n.session).slice(0, 8)}, ` : '';
  return `${n.kind || 'a server'} for ${n.slug} (${session}pid ${n.pid})`;
}

/**
 * Stop your own servers: every one, or the one on `port`, or those of `kind`.
 * A server is signalled only when its note is yours and its pid is still the
 * process that wrote it. One server holding several ports is signalled once.
 * @returns {Promise<{ stopped: object[], refused: { note?: object, port?: number, why: string }[] }>}
 */
export async function stop({ port = null, kind = null, env = process.env, dir = leaseDir(env), timeoutMs = 8000 } = {}) {
  const me = holder(env);
  const stopped = [], refused = [];
  let notes = list({ all: true, kind, env, dir });
  if (port != null) {
    notes = notes.filter((n) => n.port === Number(port));
    if (!notes.length) refused.push({ port: Number(port), why: `no live lease on port ${port}` });
  }
  const byPid = new Map();
  for (const n of notes) {
    if (!isMine(n, me)) {
      if (port != null) refused.push({ note: n, why: `port ${n.port} is not yours: it is ${describe(n)}; you are ${me.slug}${me.session ? ` (session ${me.session.slice(0, 8)})` : ''}` });
      continue;
    }
    if (n.state !== 'live') { refused.push({ note: n, why: `cannot tell whether pid ${n.pid} is still the server (ps gave no start time); not signalled` }); continue; }
    if (n.pid === process.pid) { refused.push({ note: n, why: 'that lease is this process; it is not signalled' }); continue; }
    if (!byPid.has(n.pid)) byPid.set(n.pid, []);
    byPid.get(n.pid).push(n);
  }
  for (const [pid, ns] of byPid) {
    try { process.kill(pid, 'SIGTERM'); } catch (e) { refused.push({ note: ns[0], why: `SIGTERM to ${pid} failed: ${e.code || e.message}` }); continue; }
    const deadline = Date.now() + timeoutMs;
    while (pidExists(pid) && Date.now() < deadline) await new Promise((r) => setTimeout(r, 100));
    if (pidExists(pid)) refused.push({ note: ns[0], why: `pid ${pid} did not stop within ${Math.round(timeoutMs / 1000)}s of SIGTERM` });
    else stopped.push(...ns);
  }
  return { stopped, refused };
}

// ── a server's life: tied to its session, started in the background ─────────

/**
 * Call `onGone` once the Claude session that started this process ends
 * ($CLAUDE_PID), so a preview never outlives the session that wanted it. With
 * no session (a human at a terminal), nothing is watched and null comes back.
 */
export function watchSession(onGone, { env = process.env, intervalMs = Number(env.PALACE_LEASE_WATCH_MS) || 5000 } = {}) {
  const pid = parseInt(String(env.CLAUDE_PID || ''), 10);
  if (!Number.isInteger(pid) || pid <= 0) return null;
  const began = processStartMs(pid);
  let fired = false;
  const t = setInterval(() => {
    if (fired) return;
    const moved = !Number.isNaN(began) && Math.abs(processStartMs(pid) - began) > START_SLACK_MS;
    if (!pidExists(pid) || moved) { fired = true; clearInterval(t); onGone(); }
  }, intervalMs);
  t.unref();
  return () => clearInterval(t);
}

/**
 * Start `script` again in the background, detached from this terminal, and wait
 * for it to say it is up (announce) or fail (announceFailure). Its output goes
 * to a log named for the kind and the holder. Resolves to what it announced,
 * plus its pid and log.
 */
export function detach({ script, args = [], kind = 'server', env = process.env, timeoutMs = 60_000 } = {}) {
  const logDir = scratchDir(env);
  mkdirSync(logDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const log = join(logDir, `${kind}--${agentSlug(env)}--${stamp}.log`);
  const out = openSync(log, 'a');
  const child = spawn(process.execPath, [script, ...args], {
    detached: true, stdio: ['ignore', out, out, 'ipc'], env: { ...env, PALACE_LEASE_LOG: log },
  });
  closeSync(out);
  const tail = () => { try { return readFileSync(log, 'utf8').split('\n').slice(-15).join('\n'); } catch { return ''; } };
  return new Promise((ok, fail) => {
    let done = false;
    const settle = (fn, v) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      child.removeAllListeners();
      try { child.disconnect(); } catch { /* already */ }
      child.unref();
      fn(v);
    };
    const timer = setTimeout(() => { try { child.kill('SIGTERM'); } catch { /* gone */ } settle(fail, new LeaseError(`no word from ${kind} in ${timeoutMs / 1000}s; it was stopped. Its log: ${log}\n${tail()}`)); }, timeoutMs);
    child.on('message', (m) => {
      if (m && m.type === 'ready') settle(ok, { ...m, pid: child.pid, log });
      else if (m && m.type === 'failed') settle(fail, new LeaseError(`${m.error}\n(its log: ${log})`));
    });
    child.on('exit', (code, signal) => settle(fail, new LeaseError(`${kind} exited (${code ?? signal}) before it was up. Its log: ${log}\n${tail()}`)));
  });
}

/** In a detached server: tell the starter it is up. A no-op in the foreground. */
export function announce(info) {
  if (typeof process.send !== 'function') return;
  process.send({ type: 'ready', ...info });
  process.disconnect();
}

/** In a detached server: tell the starter it could not start. A no-op in the foreground. */
export function announceFailure(error) {
  if (typeof process.send !== 'function') return;
  process.send({ type: 'failed', error: String((error && error.message) || error) });
  process.disconnect();
}

// ── command line ─────────────────────────────────────────────────────────────

function age(iso) {
  const s = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1000));
  return s < 90 ? `${s}s` : s < 5400 ? `${Math.round(s / 60)}m` : `${Math.floor(s / 3600)}h${Math.round((s % 3600) / 60)}m`;
}

/** The table list prints: one line per port. */
export function formatList(notes, { all = false } = {}) {
  if (!notes.length) return all ? 'no live leases' : 'you hold no live leases';
  return notes.map((n) => [
    String(n.port).padEnd(5), String(n.kind).padEnd(14), String(n.name).padEnd(5),
    ...(all ? [`${n.slug}${n.session ? '/' + String(n.session).slice(0, 8) : ''}${n.mine ? ' (yours)' : ''}`.padEnd(48)] : []),
    `pid ${n.pid}`.padEnd(10), age(n.leased || n.started).padStart(5), n.url || '(starting)', ...(n.root ? [`root ${n.root}`] : []),
  ].join('  ')).join('\n');
}

/** Shared by every tool that leases: --list / --stop on its own kind. Returns an exit code. */
export async function runListOrStop(argv, { kind = null, env = process.env } = {}) {
  const has = (f) => argv.includes(f);
  const after = (f) => { const i = argv.indexOf(f); const v = i >= 0 ? argv[i + 1] : undefined; return v && !v.startsWith('--') ? v : undefined; };
  if (has('--list') || argv[0] === 'list') {
    const all = has('--all');
    const notes = list({ all, kind, env });
    console.log(has('--json') ? JSON.stringify(notes, null, 2) : formatList(notes, { all }));
    return 0;
  }
  if (has('--stop') || argv[0] === 'stop') {
    const port = after('--stop') ?? after('--port') ?? null;
    const k = after('--kind') ?? kind;
    const { stopped, refused } = await stop({ port, kind: k, env });
    for (const n of stopped) console.log(`stopped ${n.kind} on ${n.port} (pid ${n.pid})`);
    for (const r of refused) console.error(`not stopped: ${r.why}`);
    if (!stopped.length && !refused.length) console.log('nothing of yours to stop');
    return refused.length ? 1 : 0;
  }
  return null;
}

const isMain = (() => { try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (isMain) {
  const argv = process.argv.slice(2);
  if (argv[0] === 'whoami') {
    const me = holder();
    console.log(`slug    = ${me.slug}\nsession = ${me.session || '(none)'}\nleases  = ${leaseDir()}\nports   = ${portRange().join('-')}`);
  } else {
    const code = await runListOrStop(argv);
    if (code === null) {
      console.error('usage: node _ops/commons/port-lease.mjs whoami | list [--all] [--json] | stop [--port N] [--kind K]');
      process.exit(2);
    }
    process.exit(code);
  }
}
