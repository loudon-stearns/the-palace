// The Actuator -- fire a headless `claude -p` worker from the board, and keep
// it honest. The steward, companion and regen lanes all build on it.
//
// It began as a Node port of the old Enrichment server's worker fire (retired
// with the card queue, 2026-09-24); the hard-won robustness scars came along
// EXACTLY in spirit:
//
//   1. bypassPermissions is load-bearing. Headless `claude -p` has no TTY to
//      answer Write/Edit permission prompts, so without
//      `--permission-mode bypassPermissions` the worker hangs forever. The
//      default argv carries it.
//   2. Existence != liveness. Before trusting a pid from the pid FILE, verify
//      via `ps -p <pid> -o command=` that it is actually our worker -- the OS
//      reuses pids, and a recycled pid reads as "alive" under a bare
//      kill(pid,0). This is `whoHoldsPid`. Skipped in exactly one case: the
//      worker this very process fired and has not yet reaped, whose pid the OS
//      cannot give to anyone else.
//   3. Exit cleanup. When the worker exits, remove the pid file -- otherwise
//      stale pid state blocks the next fire and the surface wedges silently.
//      The 'exit' handler does this while the server lives; the ps-liveness
//      check in isAlive() heals stale state across restarts.
//   4. Single global worker per lane. Refuse a second fire while one is alive.
//   5. "ps could not say" is not "not ours". python3 here is a launcher that
//      re-execs into Python.app a few ms after the spawn; for under a
//      millisecond of that swap the kernel has no command line for the pid,
//      and ps prints the bare name in parentheses -- "(python3.14)" -- with
//      exit 0. Deleting the pid file on that answer left a live render reading
//      idle for the rest of its run, and the lane then fired a second one
//      (caught 2026-10-12, about 1 fire in 1,000 under load). A ps that
//      times out or fails to run says no more than that. Only an answer ps
//      could actually read removes a pid file. A lane held this way frees
//      itself at the next ask ps can answer; by hand, delete its .worker.pid.
//
// "Carry the lessons, not the language." The Flask app is retired (Phase 4.5);
// the liveness check and cleanup -- the parts that took real debugging -- live
// on here.
//
// Testability: the spawn command is injectable via `buildArgv`, so tests fire
// a harmless stub instead of a real `claude -p`. The default fires the real
// worker; nothing in the build/test path ever does.

import { spawn, execFileSync } from 'node:child_process';
import {
  existsSync, mkdirSync, openSync, writeSync, closeSync, writeFileSync,
  readFileSync, readSync, unlinkSync, statSync,
} from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { logTail as tailLines, lastFireStatus } from '../src/lib/worker-log.js';
import { resolveClaudeBin } from './claude-bin.js';

// The default real-worker argv. The `bypassPermissions` flag doubles as the
// liveness signature (scar #2) -- that flag combination effectively never
// appears in unrelated processes, and survives however the `claude` binary is
// named (node / claude / a shell wrapper).
export function defaultBuildArgv(prompt) {
  return [resolveClaudeBin(), '-p', prompt, '--permission-mode', 'bypassPermissions'];
}

const DEFAULT_SIGNATURE = 'bypassPermissions';

// Create an actuator bound to a lane directory. One lane = one global worker.
export function createActuator({
  palaceRoot,
  stateDir,
  buildArgv = defaultBuildArgv,
  signature = DEFAULT_SIGNATURE,
  onExit = null,
} = {}) {
  const root = resolve(palaceRoot ?? process.cwd());
  const dir = stateDir ? resolve(stateDir) : join(root, '_ops/stigmergy/.actuator');
  const pidFile = join(dir, '.worker.pid');
  const logFile = join(dir, '.worker.log');
  const startedFile = join(dir, '.worker.started');

  function ensureDir() {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  // The pid of the worker THIS process fired and has not yet reaped. The OS
  // cannot give a child's pid to anyone else before its parent reaps it, and
  // the 'exit' handler runs in the same turn as the reap, before any other
  // code here -- so until that handler clears it, this pid needs no ps to
  // vouch for it.
  let ownPid = null;

  // scars #2 + #5: ask `ps -p <pid> -o command=` who holds a pid.
  //   'ours'    -- the command line carries the signature.
  //   'foreign' -- ps read a command line without it (a recycled pid), reports
  //                the process dead and unreaped ("<defunct>"), or finds no
  //                such process (exit 1 with nothing printed on either stream).
  //   'unknown' -- ps printed no command line (macOS prints the bare name in
  //                parentheses, "(name)", mid-exec; or nothing at all), or ps
  //                itself timed out, failed to run, or exited with an error.
  function whoHoldsPid(pid) {
    let out;
    try {
      out = execFileSync('ps', ['-p', String(pid), '-o', 'command='], {
        timeout: 2000, encoding: 'utf8',
      });
    } catch (e) {
      const said = `${(e && e.stdout) || ''}${(e && e.stderr) || ''}`.trim();
      return e && e.status === 1 && said === '' ? 'foreign' : 'unknown';
    }
    if (out.includes(signature)) return 'ours';
    const line = out.trim();
    return line === '' || /^\(.*\)$/.test(line) ? 'unknown' : 'foreign';
  }

  function cleanPid() {
    try { if (existsSync(pidFile)) unlinkSync(pidFile); } catch (_) { /* ignore */ }
  }

  // (running, pid). Cleans stale pid files. Existence != liveness.
  function isAlive() {
    if (!existsSync(pidFile)) return { running: false, pid: null };
    let pid;
    try {
      pid = parseInt(readFileSync(pidFile, 'utf8').trim(), 10);
    } catch (_) {
      return { running: false, pid: null };
    }
    if (!Number.isInteger(pid)) return { running: false, pid: null };
    // Our own unreaped child: certain, and the one case ps is not asked.
    if (pid === ownPid) return { running: true, pid };
    // Cheap existence probe.
    try {
      process.kill(pid, 0);
    } catch (_) {
      cleanPid();
      return { running: false, pid: null };
    }
    // Existence != liveness -- verify it is actually our worker. Only a clear
    // 'foreign' removes the file; when ps could not say, the pid exists and the
    // lane stays held until an ask that can tell (scar #5).
    if (whoHoldsPid(pid) === 'foreign') {
      cleanPid();
      return { running: false, pid: null };
    }
    return { running: true, pid };
  }

  // Fire a worker. Idempotent: refuses while one is alive (scar #4).
  // Returns { fired, msg, pid? }.
  //
  // opts.transcriptPath -- when set, the worker's STDOUT is redirected to this
  //   file (the per-cycle stream-json transcript) while STDERR still flows to
  //   .worker.log, so lastFireStatus keeps classifying auth/spawn errors. When
  //   unset, stdout+stderr both go to the log (the original Enrichment shape).
  // opts.meta -- an arbitrary context object pinned to THIS fire's closure and
  //   handed to onExit(ctx) when the child dies. Because scar #4 refuses a
  //   second concurrent fire, the closure capture is race-free: there is at
  //   most one in-flight worker, and its meta is the one onExit will see.
  function fire(prompt, opts = {}) {
    const { transcriptPath = null, meta = null } = opts;
    const alive = isAlive();
    if (alive.running) return { fired: false, msg: `already running (pid ${alive.pid})`, pid: alive.pid };
    if (typeof prompt !== 'string' || prompt.trim() === '') {
      return { fired: false, msg: 'empty prompt' };
    }

    ensureDir();
    let logFd;
    try {
      logFd = openSync(logFile, 'a');
    } catch (e) {
      return { fired: false, msg: `could not open log: ${e.message}` };
    }

    // Optional per-cycle transcript fd (worker stdout). Failure to open it is
    // non-fatal: fall back to logging stdout so the fire still proceeds.
    let transcriptFd = null;
    if (transcriptPath) {
      try {
        mkdirSync(dirname(transcriptPath), { recursive: true });
        transcriptFd = openSync(transcriptPath, 'a');
      } catch (e) {
        try { writeSync(logFd, `ERROR: could not open transcript ${transcriptPath}: ${e.message}\n`); } catch (_) { /* ignore */ }
        transcriptFd = null;
      }
    }

    const nowIso = new Date().toISOString();
    writeSync(logFd, `\n--- worker fire ${nowIso} ---\n`);

    const argv = buildArgv(prompt);
    const [cmd, ...args] = argv;

    // stdout -> transcript (if any) else the log; stderr -> the log always.
    const stdoutTarget = transcriptFd != null ? transcriptFd : logFd;

    let child;
    try {
      child = spawn(cmd, args, {
        cwd: root,
        detached: true,
        stdio: ['ignore', stdoutTarget, logFd],
        windowsHide: true,
      });
    } catch (e) {
      try { writeSync(logFd, `ERROR: spawn failed: ${e.message}\n`); } catch (_) { /* ignore */ }
      try { closeSync(logFd); } catch (_) { /* ignore */ }
      if (transcriptFd != null) { try { closeSync(transcriptFd); } catch (_) { /* ignore */ } }
      return { fired: false, msg: `spawn failed: ${e.message}` };
    }

    // spawn() can emit 'error' asynchronously (e.g. ENOENT for a missing
    // binary). Capture it into the log so the banner can classify it.
    child.on('error', (err) => {
      try { writeSync(logFd, `ERROR: ${err.message}\n`); } catch (_) { /* ignore */ }
    });

    const pid = child.pid;
    if (Number.isInteger(pid)) ownPid = pid;
    try {
      writeFileSync(pidFile, String(pid));
      writeFileSync(startedFile, nowIso);
    } catch (_) {
      // If we can't record the pid we can't manage the worker -- best effort.
    }

    // scar #3: cleanup on exit. While the server lives, the 'exit' handler
    // removes the pid file (only if it still names THIS pid -- avoids racing a
    // newer fire). The ps-liveness check heals it across server restarts.
    child.on('exit', (code, signal) => {
      if (ownPid === pid) ownPid = null;
      try {
        if (existsSync(pidFile) && readFileSync(pidFile, 'utf8').trim() === String(pid)) {
          unlinkSync(pidFile);
        }
      } catch (_) { /* ignore */ }
      try { writeSync(logFd, `\n--- worker exit pid ${pid} at ${new Date().toISOString()} ---\n`); } catch (_) { /* ignore */ }
      try { closeSync(logFd); } catch (_) { /* ignore */ }
      if (transcriptFd != null) { try { closeSync(transcriptFd); } catch (_) { /* ignore */ } }
      // Reap hook -- runs AFTER pid cleanup so status() already reads idle.
      // NEVER let a throw here escape: an uncaught error in an 'exit' handler
      // crashes the host process (the Vite dev server). The lane's reap does
      // its own error logging; this is a last-resort swallow.
      if (typeof onExit === 'function') {
        try {
          onExit({ meta, transcriptPath, pid, code, signal });
        } catch (_) { /* swallow */ }
      }
    });

    // Detach so the worker outlives this request, but keep the listeners
    // active for cleanup (unref lets the parent exit independently).
    child.unref();
    return { fired: true, msg: `fired (pid ${pid})`, pid };
  }

  // Read the worker log (last 32KB) and classify the most recent fire.
  function readLog() {
    if (!existsSync(logFile)) return { content: '', tail: [], lastFire: { status: 'none' } };
    let content = '';
    try {
      const size = statSync(logFile).size;
      const fd = openSync(logFile, 'r');
      const start = Math.max(0, size - 32768);
      const len = size - start;
      const buf = Buffer.alloc(len);
      readSync(fd, buf, 0, len, start);
      closeSync(fd);
      content = buf.toString('utf8');
    } catch (_) {
      content = '';
    }
    return { content, tail: tailLines(content, 12), lastFire: lastFireStatus(content) };
  }

  function status() {
    const alive = isAlive();
    let started = null;
    try { if (existsSync(startedFile)) started = readFileSync(startedFile, 'utf8').trim() || null; } catch (_) { /* ignore */ }
    const log = readLog();
    return {
      running: alive.running,
      pid: alive.pid,
      started,
      logTail: log.tail,
      lastFire: log.lastFire,
    };
  }

  return { fire, status, isAlive, paths: { dir, pidFile, logFile, startedFile } };
}
