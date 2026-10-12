import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createActuator } from '../../server/actuator.js';
import { fakePs } from '../helpers/fake-ps.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STUB = resolve(__dirname, '../fixtures/stub-worker.mjs');

// Build argv that runs the harmless stub via node, while STILL carrying the
// bypassPermissions signature so the actuator's ps-liveness check recognizes
// it as "our worker" -- this is the whole point of the scar under test.
function stubArgv(extra = []) {
  return (prompt) => ['node', STUB, '--permission-mode', 'bypassPermissions', ...extra];
}

function waitFor(predicate, { timeout = 4000, interval = 40 } = {}) {
  return new Promise((res, rej) => {
    const start = Date.now();
    const tick = () => {
      let ok = false;
      try { ok = predicate(); } catch (_) { ok = false; }
      if (ok) return res(true);
      if (Date.now() - start > timeout) return rej(new Error('waitFor timeout'));
      setTimeout(tick, interval);
    };
    tick();
  });
}

describe('actuator', () => {
  let dir;
  beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'actuator-')); });
  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  test('fires a worker, writes pid + log, then reaps the pid on exit (scars #1+#3)', async () => {
    const act = createActuator({ palaceRoot: dir, stateDir: dir, buildArgv: stubArgv(['--sleep', '300']) });
    const r = act.fire('do a thing');
    expect(r.fired).toBe(true);
    expect(typeof r.pid).toBe('number');
    // pid file written while alive
    expect(existsSync(act.paths.pidFile)).toBe(true);
    // a fire header was logged
    expect(readFileSync(act.paths.logFile, 'utf8')).toMatch(/--- worker fire .+ ---/);
    // after the stub exits, the pid file is reaped (scar #3)
    await waitFor(() => !existsSync(act.paths.pidFile), { timeout: 5000 });
    expect(act.isAlive().running).toBe(false);
  });

  test('refuses a second fire while one is alive (scar #4)', async () => {
    const act = createActuator({ palaceRoot: dir, stateDir: dir, buildArgv: stubArgv(['--sleep', '600']) });
    const first = act.fire('first');
    expect(first.fired).toBe(true);
    // While the first stub is still alive, a second fire is refused.
    await waitFor(() => act.isAlive().running === true, { timeout: 3000 });
    const second = act.fire('second');
    expect(second.fired).toBe(false);
    expect(second.msg).toMatch(/already running/);
    // cleanup
    await waitFor(() => !existsSync(act.paths.pidFile), { timeout: 5000 });
  });

  test('a recycled / foreign pid is not mistaken for our worker (scar #2)', async () => {
    const act = createActuator({ palaceRoot: dir, stateDir: dir, buildArgv: stubArgv() });
    // Write a pid file pointing at THIS test process (pid 1-ish exists but is
    // NOT a bypassPermissions worker). isAlive must reject it and clean up.
    const { writeFileSync, mkdirSync } = await import('node:fs');
    mkdirSync(act.paths.dir, { recursive: true });
    writeFileSync(act.paths.pidFile, String(process.pid));
    expect(existsSync(act.paths.pidFile)).toBe(true);
    const alive = act.isAlive();
    expect(alive.running).toBe(false);
    // stale pid file cleaned
    expect(existsSync(act.paths.pidFile)).toBe(false);
  });

  test('a worker it fired stays running when ps cannot read its command line (scar #5)', async () => {
    const act = createActuator({ palaceRoot: dir, stateDir: dir, buildArgv: stubArgv(['--sleep', '600']) });
    // What ps prints while a launcher re-execs into the real program: the bare
    // name in parentheses, exit 0, no signature anywhere in it. Any ask of ps
    // gets that answer here. The old actuator asked and read idle; this one
    // holds the worker it fired and does not ask.
    const restore = fakePs('echo "(node)"');
    try {
      const first = act.fire('first');
      expect(first.fired).toBe(true);
      expect(act.isAlive()).toEqual({ running: true, pid: first.pid });
      // the pid file survives the ask, so the lane goes on reading running...
      expect(existsSync(act.paths.pidFile)).toBe(true);
      expect(act.status().running).toBe(true);
      // ...and refuses a twin (scar #4)
      const second = act.fire('second');
      expect(second.fired).toBe(false);
      expect(second.msg).toMatch(/already running/);
    } finally {
      restore();
    }
    // the exit still clears it (scar #3)
    await waitFor(() => !existsSync(act.paths.pidFile), { timeout: 5000 });
    expect(act.isAlive().running).toBe(false);
  });

  test('after a restart, only an answer ps could read removes a live pid file (scar #5)', async () => {
    // A restarted server: a second actuator on the same lane folder, holding no
    // child of its own, so it has to ask ps about the pid the first one left.
    // This is the one test where the answer ps gives is actually read.
    const worker = () => {
      const lane = mkdtempSync(join(tmpdir(), 'actuator-restart-'));
      const before = createActuator({ palaceRoot: lane, stateDir: lane, buildArgv: stubArgv(['--sleep', '5000']) });
      const fired = before.fire('long');
      expect(fired.fired).toBe(true);
      return { lane, fired, restarted: createActuator({ palaceRoot: lane, stateDir: lane, buildArgv: stubArgv() }) };
    };
    const ask = (script) => {
      const w = worker();
      const restore = fakePs(script);
      try { return { ...w, alive: w.restarted.isAlive(), kept: existsSync(w.restarted.paths.pidFile) }; } finally { restore(); }
    };
    const lanes = [];
    const pids = [];
    const gone = (pid) => { try { process.kill(pid, 0); return false; } catch (_) { return true; } };
    try {
      // ps could not say: the bare name mid-exec, nothing at all, or an error
      // of its own (exit 2 stands in for a ps that timed out or could not run;
      // exit 1 WITH a complaint is ps failing, not "no such process"). The pid
      // exists and nothing shows it is foreign -- the file stays, the lane
      // stays held.
      for (const script of ['echo "(node)"', 'true', 'exit 2', 'echo "ps: something went wrong" >&2; exit 1']) {
        const r = ask(script); lanes.push(r.lane); pids.push(r.fired.pid);
        expect({ script, running: r.alive.running, kept: r.kept }).toEqual({ script, running: true, kept: true });
        // a later ask, with the real ps back, still finds the same worker
        expect(r.restarted.isAlive()).toEqual({ running: true, pid: r.fired.pid });
      }
      // ps could say, and it is not our live worker: dead but unreaped, gone,
      // or another program on a recycled pid. The stale file goes (scar #2).
      for (const script of ['echo "<defunct>"', 'exit 1', 'echo "/usr/sbin/some-daemon --serve"']) {
        const r = ask(script); lanes.push(r.lane); pids.push(r.fired.pid);
        expect({ script, running: r.alive.running, kept: r.kept }).toEqual({ script, running: false, kept: false });
      }
    } finally {
      // end the stub workers, and see them reaped before their folders go
      for (const pid of pids) { try { process.kill(pid, 'SIGKILL'); } catch (_) { /* already gone */ } }
      await waitFor(() => pids.every(gone), { timeout: 4000 });
      for (const l of lanes) rmSync(l, { recursive: true, force: true });
    }
  });

  test('status surfaces the last fire as ok on a success marker', async () => {
    const act = createActuator({ palaceRoot: dir, stateDir: dir, buildArgv: stubArgv(['--sleep', '100', '--emit', 'success']) });
    act.fire('emit success');
    await waitFor(() => act.status().lastFire.status === 'ok', { timeout: 5000 });
    expect(act.status().lastFire.status).toBe('ok');
  });

  test('status surfaces a failed fire on a failure pattern', async () => {
    const act = createActuator({ palaceRoot: dir, stateDir: dir, buildArgv: stubArgv(['--sleep', '100', '--emit', 'fail']) });
    act.fire('emit fail');
    await waitFor(() => act.status().lastFire.status === 'failed', { timeout: 5000 });
    expect(act.status().lastFire.status).toBe('failed');
  });

  test('refuses an empty prompt', () => {
    const act = createActuator({ palaceRoot: dir, stateDir: dir, buildArgv: stubArgv() });
    expect(act.fire('').fired).toBe(false);
    expect(act.fire('   ').fired).toBe(false);
  });

  test('a missing binary does not throw and does not wedge a live worker', async () => {
    const act = createActuator({
      palaceRoot: dir, stateDir: dir,
      buildArgv: () => ['this-binary-does-not-exist-xyz', '--permission-mode', 'bypassPermissions'],
    });
    // The contract: fire() never throws (returns a boolean), and a missing
    // `claude` binary must not leave a phantom "alive" worker that blocks the
    // next fire. (Whether spawn surfaces ENOENT synchronously or via an async
    // 'error' event is platform-dependent; either way the surface must not
    // wedge.) A fire header is always logged before the spawn attempt.
    const r = act.fire('boom');
    expect(typeof r.fired).toBe('boolean');
    expect(readFileSync(act.paths.logFile, 'utf8')).toMatch(/--- worker fire .+ ---/);
    // The worker must not read as alive (the missing binary is no real process).
    await waitFor(() => act.isAlive().running === false, { timeout: 4000 });
    expect(act.isAlive().running).toBe(false);
  });
});
