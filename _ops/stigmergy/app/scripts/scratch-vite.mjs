// scratch-vite.mjs — a scratch STIGMERGY over a throwaway palace, on a port of its own.
//
//   node _ops/stigmergy/app/scripts/scratch-vite.mjs --root <throwaway palace> [--new] [--detach] [--keep]
//   → scratch STIGMERGY up — http://127.0.0.1:8851/
//   node _ops/stigmergy/app/scripts/scratch-vite.mjs --list [--all]   your scratch servers (--all: everyone's)
//   node _ops/stigmergy/app/scripts/scratch-vite.mjs --stop [port]    stop yours: every one, or the one on that port
//
// For a browser check of this checkout's app — a deck, a write path, the rich
// face — without touching Loudon's :5173 or the real board. It is the recipe
// sessions kept rebuilding by hand, made one command:
//   - The port is leased (_ops/commons/port-lease.mjs) and strict, so two
//     sessions never share one, and none lands on 127.0.0.1:5173 beside the
//     live server on [::1] (app README, "A scratch Vite given `port: 0` takes 5173").
//   - A second port is leased for the piece origin and handed over as
//     STIGMERGY_PIECE_PORT, so a scratch server never reaches for the live
//     one's 8843 (spec — rich-face pieces, §7).
//   - PALACE_ROOT is the throwaway, so the board, the lanes' state and every
//     palace read are its own. A checkout of this repository is refused: its
//     board is tracked, and a scratch write there rides into a commit.
//   - Workers are stubbed (STIGMERGY_STUB_WORKER=1): no real steward fires.
//   - Vite's cache is a folder of this holder's own, removed when the server
//     stops. The app's node_modules is a link to the owner's install in a
//     worktree, and the default cache would land in it, beside the live server's.
// It listens through Vite with the app's own vite.config.js, so the request
// guard (blackboardMiddleware → guardRequest) stands in front of /api/ and
// /rich/ exactly as on :5173. The guard census knows it by name.
//
// --new makes the root an empty throwaway palace first (git init, an empty
// board) when the folder does not exist. --detach starts the server in the
// background and returns once it is up; one a Claude session starts stops when
// that session ends, unless --keep. Open it in the Browser pane by its URL.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, realpathSync, statSync, rmSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  acquire, list, agentSlug, scratchDir, watchSession, detach, announce, announceFailure, runListOrStop,
} from '../../../commons/port-lease.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '..');
export const KIND = 'stigmergy-vite';

function commonDir(dir) {
  try {
    return realpathSync(execFileSync('git', ['-C', dir, 'rev-parse', '--path-format=absolute', '--git-common-dir'], {
      encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'],
    }).trim());
  } catch { return null; }
}

/** Why `root` cannot be a scratch palace, or null when it can. */
export function refuseRoot(root) {
  if (!existsSync(root) || !statSync(root).isDirectory()) return `--root ${root} is not a folder (add --new to make an empty throwaway palace there)`;
  const ours = commonDir(APP);
  const theirs = commonDir(root);
  if (ours && theirs && ours === theirs) {
    return `--root ${root} is a checkout of this palace; its board is tracked, so a scratch server there writes into a commit. Use a throwaway: --root <new folder> --new, or a clone`;
  }
  return null;
}

/** An empty throwaway palace: a git repository with an empty board. */
export function makeScratchPalace(root) {
  mkdirSync(join(root, '_ops/swarm/persistent'), { recursive: true });
  mkdirSync(join(root, '_ops/swarm/sessions'), { recursive: true });
  const board = join(root, '_ops/swarm/persistent/blackboard.jsonl');
  if (!existsSync(board)) writeFileSync(board, '');
  if (!existsSync(join(root, '.git'))) {
    const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
    execFileSync('git', ['init', '-q'], { cwd: root, env, stdio: 'ignore' });
  }
}

/**
 * Lease two ports, start Vite on the first with the app's own config over
 * `root`, and hand back how to stop it. The env is set before the config loads
 * (vite.config.js reads PALACE_ROOT then), and is this process's own.
 */
/**
 * Remove this slug's Vite caches whose port no live lease holds: what a server
 * killed outright, or one whose last write raced its exit, left behind. Scoped
 * to the slug, and a cache whose port is still leased (by any session) is kept.
 */
export function sweepCaches(env = process.env) {
  const prefix = `vite-cache--${agentSlug(env)}--`;
  const live = new Set(list({ all: true, kind: KIND, env }).map((n) => n.port));
  let names;
  try { names = readdirSync(scratchDir(env)); } catch { return []; }
  const swept = [];
  for (const name of names) {
    if (!name.startsWith(prefix)) continue;
    const port = Number(name.slice(prefix.length));
    if (!Number.isInteger(port) || live.has(port)) continue;
    rmSync(join(scratchDir(env), name), { recursive: true, force: true });
    swept.push(name);
  }
  return swept;
}

export async function serve({ root, keep = false, env = process.env, onSessionEnd = null } = {}) {
  const lease = await acquire({ names: ['app', 'piece'], kind: KIND, env, meta: { root, app: APP, log: env.PALACE_LEASE_LOG || null } });
  sweepCaches(env);
  process.env.PALACE_ROOT = root;
  process.env.STIGMERGY_STUB_WORKER = '1';
  process.env.STIGMERGY_PIECE_PORT = String(lease.ports.piece);
  const vite = await import('vite');
  let server, cacheDir;
  for (let tries = 0; ; tries++) {
    const port = lease.ports.app;
    // Its own while it runs, gone when it stops: a cache per holder and port, ~20 MB, would pile up.
    cacheDir = join(scratchDir(env), `vite-cache--${agentSlug(env)}--${port}`);
    server = await vite.createServer({
      configFile: join(APP, 'vite.config.js'),
      configLoader: 'native',
      root: APP,
      cacheDir,
      clearScreen: false,
      server: { host: '127.0.0.1', port, strictPort: true },
    });
    try { await server.listen(); break; } catch (e) {
      await server.close().catch(() => {});
      rmSync(cacheDir, { recursive: true, force: true });
      if (!/already in use/i.test(String(e && e.message)) || tries >= 4) { lease.release(); throw e; }
      await lease.renew('app');
    }
  }
  const url = `http://127.0.0.1:${lease.ports.app}/`;
  lease.update({ url, cache: cacheDir });
  // On exit, not after close: Vite answers SIGTERM itself, closing and exiting
  // before any handler of ours could finish.
  const dropCache = () => rmSync(cacheDir, { recursive: true, force: true });
  process.once('exit', dropCache);
  let unwatch = null;
  const close = async () => {
    if (unwatch) unwatch();
    await server.close();
    dropCache();
    process.off('exit', dropCache);
    lease.release();
  };
  if (!keep) unwatch = watchSession(() => (onSessionEnd ? onSessionEnd() : close()), { env });
  return { server, lease, url, port: lease.ports.app, piecePort: lease.ports.piece, root, close };
}

const isMain = (() => { try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (isMain) {
  const argv = process.argv.slice(2);
  const listed = await runListOrStop(argv, { kind: KIND });
  if (listed !== null) process.exit(listed);

  const arg = (name) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : undefined; };
  const has = (name) => argv.includes('--' + name);
  const upLine = ({ url, port, piecePort, root }) => [
    `scratch STIGMERGY up — ${url}`,
    `  palace ${root}  ·  piece port ${piecePort}  ·  workers stubbed`,
    `  stop it: node _ops/stigmergy/app/scripts/scratch-vite.mjs --stop ${port}`,
  ].join('\n');

  try {
    if (!arg('root')) throw new Error('--root <throwaway palace> is required (add --new to make an empty one)');
    const root = resolve(arg('root'));
    if (has('new') && !existsSync(root)) makeScratchPalace(root);
    const why = refuseRoot(root);
    if (why) throw new Error(why);
    if (!existsSync(join(root, '_ops/swarm/persistent/blackboard.jsonl'))) console.warn(`warning: ${root} has no _ops/swarm/persistent/blackboard.jsonl; the board reads empty`);
    if (has('detach')) {
      const up = await detach({ script: fileURLToPath(import.meta.url), args: argv.filter((a) => a !== '--detach'), kind: KIND });
      console.log(`${upLine(up)}\n  pid ${up.pid}  ·  log ${up.log}`);
      process.exit(0);
    }
    const s = await serve({ root, keep: has('keep'), onSessionEnd: () => shutdown('its session ended') });
    let stopping = false;
    async function shutdown(why) {
      if (stopping) return;
      stopping = true;
      console.log(`scratch STIGMERGY on ${s.port} stopping: ${why}`);
      setTimeout(() => process.exit(0), 5000).unref();
      await s.close();
      process.exit(0);
    }
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    console.log(upLine(s));
    announce({ url: s.url, port: s.port, piecePort: s.piecePort, root });
  } catch (e) {
    announceFailure(e);
    console.error(`scratch STIGMERGY did not start: ${e.message}`);
    process.exit(1);
  }
}
