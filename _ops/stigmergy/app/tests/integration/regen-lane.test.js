// Integration test for the regen lane (the Hero and Avatar Maker companion door).
//
// THE proof: regen() fires the real render script (regen_one.py --mock — tiny
// PNGs, no RunPod) for one entry; it places the face into the bundle, embeds the
// hero, writes the face.json sidecar, and on the actuator's exit the reap COMMITS
// those files and posts companion_regen_started → companion_regen_done on the
// board. The window reads those back over SSE (turn-id scoped).
//
// The lane passes the temp palace root via --palace, so the REAL tracked script
// (Shop/Hero and Avatar Maker/regen_one.py) operates on the temp palace; --mock
// keeps it offline (no RunPod).

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createRegenLane } from '../../server/regen-lane.js';
import { fakePs } from '../helpers/fake-ps.js';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

const REGEN_SCRIPT_SRC = fileURLToPath(new URL('../../../../../Shop/Hero and Avatar Maker/regen_one.py', import.meta.url));

// -c core.quotepath=false → raw UTF-8 paths in output (else em-dash bundle paths
// come back octal-escaped, e.g. `Face Me \342\200\224 hero.png`).
function git(cwd, args) { return execFileSync('git', ['-c', 'core.quotepath=false', ...args], { cwd, encoding: 'utf8', env: gitFreeEnv() }); }

function makeTempPalace() {
  const root = mkdtempSync(resolve(tmpdir(), 'stig-regen-'));
  git(root, ['init', '-q', '-b', 'main']);
  assertScratchRepo(root);
  git(root, ['config', 'user.email', 'test@example.com']);
  git(root, ['config', 'user.name', 'Test User']);
  git(root, ['config', 'commit.gpgsign', 'false']);
  mkdirSync(join(root, '_ops/swarm/persistent'), { recursive: true });
  writeFileSync(join(root, '_ops/swarm/persistent/blackboard.jsonl'), '', 'utf8');
  // An entry with no face yet.
  writeFileSync(
    join(root, 'Face Me.md'),
    '---\ntitle: "Face Me"\ntype: concept\nstage: growing\nforward_vector: "I want a face."\n---\n# Face Me\n\nA body to illustrate.\n',
  );
  git(root, ['add', '-A']);
  git(root, ['commit', '-q', '-m', 'deposit: seed entry']);
  return root;
}

function waitFor(predicate, { timeout = 20000, interval = 60 } = {}) {
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

describe('regen lane (companion hero/avatar door)', () => {
  let root, lane, keepRoot;
  const boardPath = (r) => join(r, '_ops/swarm/persistent/blackboard.jsonl');
  const readBoard = (r) => readFileSync(boardPath(r), 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));

  // The lane's end-of-work signal. A render is over when its reap has posted the
  // terminal row (done | failed) — NOT when the pid file clears: the actuator
  // drops the pid file first and only then runs the reap, which awaits a git
  // commit in this palace before it posts. Returns the turns still in flight.
  const ENDED = new Set(['companion_regen_done', 'companion_regen_failed']);
  const inFlight = (r) => {
    const rows = readBoard(r).map((m) => m.payload || {});
    const ended = new Set(rows.filter((p) => ENDED.has(p.kind)).map((p) => p.turn_id));
    return rows.filter((p) => p.kind === 'companion_regen_started' && !ended.has(p.turn_id)).map((p) => p.turn_id);
  };
  const settled = (r, opts) => waitFor(() => inFlight(r).length === 0, opts);

  // What the lane, the pid file and the OS each say about a render just fired --
  // gathered when a "running" check fails, so the failure explains itself. The
  // first one (2026-10-12) left nothing behind: teardown had removed the palace.
  const witness = (fired, status, askMs) => {
    const pid = Number((/pid (\d+)/.exec(fired.msg || '') || [])[1]);
    let alive; try { process.kill(pid, 0); alive = 'yes'; } catch (e) { alive = `no (${e.code})`; }
    let ps; try { ps = execFileSync('ps', ['-p', String(pid), '-o', 'stat=,command='], { encoding: 'utf8', timeout: 2000 }).trim(); } catch (e) { ps = `nothing (ps exit ${e.status})`; }
    let log; try { log = readFileSync(lane.paths.logFile, 'utf8').trim(); } catch (_) { log = '(no worker log)'; }
    return [
      `the lane's first answer: running=${status.running} pid=${status.pid}, ${askMs.toFixed(1)} ms to give`,
      `the fire said: ${fired.msg}`,
      `pid file: ${existsSync(lane.paths.pidFile) ? 'still there' : 'GONE'}`,
      `pid ${pid} alive now: ${alive}; ps shows now: ${ps}`,
      `worker log:\n${log}`,
    ].join('\n');
  };

  beforeEach(() => {
    keepRoot = false;
    root = makeTempPalace();
    // The real tracked script, pointed at the temp palace via the lane's --palace.
    lane = createRegenLane({ palaceRoot: root, mock: true, scriptPath: REGEN_SCRIPT_SRC });
  });
  afterEach(async () => {
    // Remove the temp palace only once nothing is still working in it. Removing
    // it when the pid file cleared raced the reap's commit: ENOTEMPTY under load,
    // and otherwise a board file the reap wrote back into the deleted folder. A
    // render that never ends is a real leak — fail on it, and leave the folder.
    try { await settled(root, { timeout: 20000 }); } catch (_) {
      throw new Error(`regen lane never settled: ${inFlight(root).join(', ')} started but posted no done/failed — left in ${root}`);
    }
    if (!keepRoot) rmSync(root, { recursive: true, force: true });
  }, 30000);

  test('renders BOTH, places + embeds + commits, and posts started → done (THE proof)', async () => {
    const turnId = 'companion-face-me-1';
    const r = lane.regen({
      path: 'Face Me.md', target: 'both', idiom: 'test woodcut',
      heroPrompt: 'a bold woodcut banner', iconPrompt: 'a bold woodcut emblem', note: 'brighter', turnId,
    });
    expect(r.fired).toBe(true);
    // started posts synchronously, before the async reap
    await waitFor(() => readBoard(root).some((m) => m.payload?.kind === 'companion_regen_started' && m.payload.turn_id === turnId), { timeout: 4000 });

    // wait for the render to exit and the reap to commit + post done
    await waitFor(() => !existsSync(lane.paths.pidFile), { timeout: 20000 });
    await waitFor(() => readBoard(root).some((m) => m.payload?.kind === 'companion_regen_done' && m.payload.turn_id === turnId), { timeout: 8000 });

    const done = readBoard(root).find((m) => m.payload?.kind === 'companion_regen_done' && m.payload.turn_id === turnId);
    expect(done.type).toBe('PROOF');
    expect(done.from).toBe('Hero and Avatar Maker');
    expect(typeof done.payload.commit).toBe('string');
    expect(done.payload.hero_rel).toMatch(/Face Me — hero\.png$/);
    expect(done.payload.icon_rel).toMatch(/Face Me — icon\.png$/);

    // the face landed in the bundle + the hero was embedded
    expect(existsSync(join(root, 'Face Me/Face Me — hero.png'))).toBe(true);
    expect(existsSync(join(root, 'Face Me/Face Me — icon.png'))).toBe(true);
    expect(existsSync(join(root, 'Face Me/Face Me — face.json'))).toBe(true);
    expect(readFileSync(join(root, 'Face Me.md'), 'utf8')).toMatch(/!\[\[Face Me — hero\.png\]\]/);

    // committed surgically as an enrich(<Entry>) commit at HEAD
    expect(git(root, ['log', '-1', '--format=%s'])).toMatch(/^enrich\(Face Me\): regenerate hero \+ icon via companion/);
    const showHead = git(root, ['show', '--stat', 'HEAD']);
    expect(showHead).toMatch(/Face Me — hero\.png/);
    expect(showHead).toMatch(/Face Me — face\.json/);
  }, 40000);

  test('when the Maker keeps a tuning ledger, the face\'s commit carries its run line (SCHEMA — Reference §6)', async () => {
    mkdirSync(join(root, 'Shop/Hero and Avatar Maker'), { recursive: true });
    writeFileSync(join(root, 'Shop/Hero and Avatar Maker.md'), '---\ntitle: "Hero and Avatar Maker"\ntype: maker\nstatus: alive\n---\n# Maker\n');
    const ledger = join(root, 'Shop/Hero and Avatar Maker/Hero and Avatar Maker — tuning.md');
    writeFileSync(ledger, '---\ntitle: "Hero and Avatar Maker — tuning"\nledger: tuning\nstandards:\n  for: what each face taught\n---\n\n# Hero and Avatar Maker — tuning\n');
    git(root, ['add', '-A']);
    git(root, ['commit', '-q', '-m', 'ops: the Maker keeps a ledger']);
    const turnId = 'companion-face-me-ledger';
    expect(lane.regen({ path: 'Face Me.md', target: 'hero', heroPrompt: 'a bold woodcut banner', turnId }).fired).toBe(true);
    await waitFor(() => readBoard(root).some((m) => m.payload?.kind === 'companion_regen_done' && m.payload.turn_id === turnId), { timeout: 20000 });
    expect(readFileSync(ledger, 'utf8')).toMatch(/\n- run · \d{4}-\d{2}-\d{2} · Face Me, hero · nothing new\n$/);
    expect(git(root, ['show', '--stat', 'HEAD'])).toMatch(/Hero and Avatar Maker — tuning\.md/);
    expect(git(root, ['status', '--porcelain', '--', 'Shop'])).toBe('');   // nothing left uncommitted
  }, 40000);

  test('target "icon" remakes only the avatar (no hero png, no md embed)', async () => {
    const turnId = 'companion-face-me-icon-1';
    lane.regen({ path: 'Face Me.md', target: 'icon', idiom: 'bold glyph', iconPrompt: 'a bold emblem', turnId });
    await waitFor(() => !existsSync(lane.paths.pidFile), { timeout: 20000 });
    await waitFor(() => readBoard(root).some((m) => m.payload?.kind === 'companion_regen_done' && m.payload.turn_id === turnId), { timeout: 8000 });

    expect(existsSync(join(root, 'Face Me/Face Me — icon.png'))).toBe(true);
    expect(existsSync(join(root, 'Face Me/Face Me — hero.png'))).toBe(false);
    // no hero → no embed added to the md
    expect(readFileSync(join(root, 'Face Me.md'), 'utf8')).not.toMatch(/!\[\[Face Me — hero\.png\]\]/);
    // the commit staged the icon + sidecar, not the md
    const showHead = git(root, ['show', '--stat', 'HEAD']);
    expect(showHead).toMatch(/Face Me — icon\.png/);
    expect(showHead).not.toMatch(/Face Me\.md/);
  }, 40000);

  test('refuses a second render while one is running (single worker per lane)', async () => {
    const first = lane.regen({ path: 'Face Me.md', target: 'both', heroPrompt: 'h', iconPrompt: 'i', turnId: 'r-a' });
    expect(first.fired).toBe(true);
    // A lane that has just fired reads running on the FIRST ask, with no wait: it
    // holds the worker it spawned and needs nobody's word for it. This used to
    // poll for 3 s, and the poll could not save it -- when the first ask met ps
    // in the moment it cannot read the worker's command line, that ask deleted
    // the pid file and every later one read idle (README, testing gotchas).
    const t0 = performance.now();
    const status = lane.status();
    if (status.running !== true) {
      keepRoot = true;
      throw new Error(`a render was just fired, but the lane reads idle — palace left in ${root}\n${witness(first, status, performance.now() - t0)}`);
    }
    const second = lane.regen({ path: 'Face Me.md', target: 'both', heroPrompt: 'h', iconPrompt: 'i', turnId: 'r-b' });
    expect(second.fired).toBe(false);
    expect(second.busy).toBe(true);
  }, 40000);

  test('a render whose command line ps cannot read yet still holds the lane', async () => {
    // python3 here is a launcher that re-execs into Python.app a few ms after
    // the fire. For under a millisecond of that swap the kernel has no command
    // line for the pid, and `ps -o command=` prints "(python3.14)", exit 0 --
    // about one fire in 1,000 with the suite running. With the stand-in, any
    // ask of ps gets that answer. The old actuator asked, read idle, and fired
    // a twin; the lane now holds its own worker without asking ps at all.
    const restore = fakePs('echo "(python3.14)"');
    try {
      const first = lane.regen({ path: 'Face Me.md', target: 'both', heroPrompt: 'h', iconPrompt: 'i', turnId: 'u-a' });
      expect(first.fired).toBe(true);
      expect(lane.status().running).toBe(true);
      expect(existsSync(lane.paths.pidFile)).toBe(true);
      const second = lane.regen({ path: 'Face Me.md', target: 'both', heroPrompt: 'h', iconPrompt: 'i', turnId: 'u-b' });
      expect(second.fired).toBe(false);
      expect(second.busy).toBe(true);
    } finally {
      restore();
    }
  }, 40000);

  test('the pid file clears before the reap has committed, so teardown waits for the terminal row', async () => {
    // A pre-commit hook that sleeps holds the reap's commit open well past the
    // worker's exit — the gap a loaded machine opens by itself, made certain.
    mkdirSync(join(root, '.git/hooks'), { recursive: true });
    writeFileSync(join(root, '.git/hooks/pre-commit'), '#!/bin/sh\nsleep 0.5\n', { mode: 0o755 });
    const turnId = 'slow-reap-1';
    const r = lane.regen({ path: 'Face Me.md', target: 'both', heroPrompt: 'h', iconPrompt: 'i', turnId });
    expect(r.fired).toBe(true);

    // the worker is gone and the lane reads idle, yet the reap is still committing
    await waitFor(() => !existsSync(lane.paths.pidFile), { timeout: 20000 });
    expect(lane.status().running).toBe(false);
    expect(inFlight(root)).toEqual([turnId]);

    // settled means the reap finished: committed, posted, recorded
    await settled(root, { timeout: 20000 });
    expect(readBoard(root).some((m) => m.payload?.kind === 'companion_regen_done' && m.payload.turn_id === turnId)).toBe(true);
    expect(git(root, ['log', '-1', '--format=%s'])).toMatch(/^enrich\(Face Me\): regenerate hero \+ icon via companion/);
    expect(lane.status().last_run.turn_id).toBe(turnId);
  }, 40000);

  test('declines an unknown entry honestly', () => {
    const r = lane.regen({ path: 'Nope.md', target: 'both', heroPrompt: 'h', iconPrompt: 'i' });
    expect(r.ok).toBe(false);
    expect(r.fired).toBe(false);
    expect(r.msg).toMatch(/not found/i);
  });
});
