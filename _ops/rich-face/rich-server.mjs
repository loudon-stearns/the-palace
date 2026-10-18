// rich-server.mjs — the rich face on its own, for when STIGMERGY isn't running.
// (With STIGMERGY up, the same page lives at http://localhost:5173/rich/.)
//
//   node _ops/rich-face/rich-server.mjs [--port 8842] [--app http://localhost:5173]
//   → http://127.0.0.1:8842/?entry=Kuramoto%20Coupling
//
// Binds 127.0.0.1 only. Never writes to the palace; review notes are forwarded
// to STIGMERGY's board (--app), which must be running to receive them, and land
// there as TRICKSTER — Loudon's own voice. So STIGMERGY's request guard stands in
// front of every path here, as it does in front of /rich/ there: a foreign Host
// is refused (a DNS-rebinding page), and so is a write that is not JSON or comes
// from a foreign page. One rule, imported, not copied.

import http from 'node:http';
import { realpathSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT } from './resolve.mjs';
import { createRichHandler } from './rich-handler.mjs';
import { checkRequest } from '../stigmergy/app/server/request-guard.js';

const HERE = dirname(fileURLToPath(import.meta.url));

/** The standalone server: the rich face at /, over a palace root, forwarding reviews to `app`. */
export function createRichServer({ root = ROOT, here = HERE, app }) {
  const handle = createRichHandler({ root, here, base: '', app: () => app });
  return http.createServer(async (req, res) => {
    const urlPath = (req.url || '').split('?')[0];
    if (checkRequest(req, res, { urlPath, method: (req.method || 'GET').toUpperCase() })) return;
    if (!(await handle(req, res))) { res.writeHead(405); res.end(); }
  });
}

const isMain = (() => { try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (isMain) {
  const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; };
  const PORT = parseInt(arg('port', '8842'), 10);
  const APP = arg('app', 'http://localhost:5173');
  createRichServer({ app: APP }).listen(PORT, '127.0.0.1', () => {
    console.log(`rich face up — http://127.0.0.1:${PORT}/?entry=Kuramoto%20Coupling  ·  palace ${ROOT}  ·  reviews → ${APP}/api/persistent`);
  });
}
