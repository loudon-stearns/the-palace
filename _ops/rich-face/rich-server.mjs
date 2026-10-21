// rich-server.mjs — the rich face on its own: when STIGMERGY isn't running, or
// over a palace that isn't this checkout (a throwaway, a clone at a branch).
// (With STIGMERGY up, the same page lives at http://localhost:5173/rich/.)
//
//   node _ops/rich-face/rich-server.mjs [--root <palace>] [--app <STIGMERGY origin>] [--port N] [--detach] [--keep]
//   → rich face up — http://127.0.0.1:8850/   (open an entry: ?entry=Kuramoto%20Coupling)
//   node _ops/rich-face/rich-server.mjs --list [--all]    your previews (--all: everyone's)
//   node _ops/rich-face/rich-server.mjs --stop [port]     stop yours: every one, or the one on that port
//
// Each preview runs on a port leased to it (_ops/commons/port-lease.mjs), so two
// sessions previewing two roots never meet on one port, and --stop reaches only
// the previews of the holder that asks. --detach starts the preview in the
// background and returns once it is up. A preview a Claude session starts stops
// when that session ends, unless --keep. --port asks for one exact port.
//
// Binds 127.0.0.1 only. Never writes to the palace. Review notes reach a board
// only when started with --app, and land there as TRICKSTER — Loudon's own
// voice; without --app the review dock says where to send them. So STIGMERGY's
// request guard stands in front of every path here, as it does in front of
// /rich/ there: a foreign Host is refused (a DNS-rebinding page), and so is a
// write that is not JSON or comes from a foreign page. One rule, imported, not copied.

import http from 'node:http';
import { realpathSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT } from './resolve.mjs';
import { createRichHandler } from './rich-handler.mjs';
import { checkRequest } from '../stigmergy/app/server/request-guard.js';
import {
  acquire, watchSession, detach, announce, announceFailure, runListOrStop,
} from '../commons/port-lease.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const KIND = 'rich-face';

const NO_BOARD = 'this preview has no board: start it with --app http://localhost:5173 to send review notes';

/** The standalone server: the rich face at /, over a palace root, forwarding reviews to `app` (or nowhere). */
export function createRichServer({ root = ROOT, here = HERE, app = null }) {
  const handle = createRichHandler({ root, here, base: '', app: () => app });
  return http.createServer(async (req, res) => {
    const urlPath = (req.url || '').split('?')[0];
    const method = (req.method || 'GET').toUpperCase();
    if (checkRequest(req, res, { urlPath, method })) return;
    if (!app && urlPath === '/_api/review') {
      res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: NO_BOARD }));
      return;
    }
    if (!(await handle(req, res))) { res.writeHead(405); res.end(); }
  });
}

function bind(server, port) {
  return new Promise((ok, fail) => {
    const onError = (e) => { server.off('listening', onListening); fail(e); };
    const onListening = () => { server.off('error', onError); ok(); };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, '127.0.0.1');
  });
}

/**
 * Lease a port, serve the rich face on it, and hand back how to stop it.
 * A port taken between the lease's probe and this start is let go for the next.
 */
export async function serve({ root = ROOT, here = HERE, app = null, port = null, keep = false, env = process.env, onSessionEnd = null } = {}) {
  const lease = await acquire({ names: ['page'], kind: KIND, port, env, meta: { root, app: app || null, log: env.PALACE_LEASE_LOG || null } });
  const server = createRichServer({ root, here, app });
  for (let tries = 0; ; tries++) {
    try { await bind(server, lease.ports.page); break; } catch (e) {
      if (e.code !== 'EADDRINUSE' || port != null || tries >= 4) { lease.release(); throw e; }
      await lease.renew('page');
    }
  }
  const url = `http://127.0.0.1:${lease.ports.page}/`;
  lease.update({ url });
  let unwatch = null;
  const close = () => new Promise((done) => {
    if (unwatch) unwatch();
    server.close(() => { lease.release(); done(); });
    server.closeAllConnections?.();
  });
  if (!keep) unwatch = watchSession(() => (onSessionEnd ? onSessionEnd() : close()), { env });
  return { server, lease, url, port: lease.ports.page, root, app, close };
}

const isMain = (() => { try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (isMain) {
  const argv = process.argv.slice(2);
  const listed = await runListOrStop(argv, { kind: KIND });
  if (listed !== null) process.exit(listed);

  const arg = (name, def) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : def; };
  const has = (name) => argv.includes('--' + name);
  const root = resolve(arg('root', ROOT));
  const app = arg('app', null);
  const port = arg('port', null);
  const upLine = ({ url, port: p, root: r, app: a }) => [
    `rich face up — ${url}   (open an entry: ${url}?entry=Kuramoto%20Coupling)`,
    `  palace ${r}  ·  reviews → ${a ? `${a}/api/persistent` : 'no board (start with --app to send them)'}`,
    `  stop it: node _ops/rich-face/rich-server.mjs --stop ${p}`,
  ].join('\n');

  try {
    if (!existsSync(root) || !statSync(root).isDirectory()) throw new Error(`--root ${root} is not a folder`);
    if (!existsSync(join(root, '.git'))) console.warn(`warning: ${root} is not a git checkout; the rich face finds files through git's index (resolve.mjs), so git init it`);
    if (has('detach')) {
      const up = await detach({ script: fileURLToPath(import.meta.url), args: argv.filter((a) => a !== '--detach'), kind: KIND });
      console.log(`${upLine(up)}\n  pid ${up.pid}  ·  log ${up.log}`);
      process.exit(0);
    }
    const s = await serve({ root, app, port, keep: has('keep'), onSessionEnd: () => shutdown('its session ended') });
    let stopping = false;
    async function shutdown(why) {
      if (stopping) return;
      stopping = true;
      console.log(`rich face on ${s.port} stopping: ${why}`);
      setTimeout(() => process.exit(0), 3000).unref();
      await s.close();
      process.exit(0);
    }
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    console.log(upLine(s));
    announce({ url: s.url, port: s.port, root, app });
  } catch (e) {
    announceFailure(e);
    console.error(`rich face did not start: ${e.message}`);
    process.exit(1);
  }
}
