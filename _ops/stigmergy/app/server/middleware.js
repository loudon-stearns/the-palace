// Stigmergy data adapter middleware — the Vite dev-server plugin factory.
//
// A thin seam: it builds the two long-lived worker lanes (server/workers.js) and
// delegates every request to the api/ endpoint families via server/router.js.
// The handlers live in server/api/*.js; shared HTTP + data-read helpers in
// server/http.js; the SSE stream lifecycle in server/sse.js. (This module was an
// 858-line megamodule before the audit §4 decomposition.)
//
// Endpoints served (see server/api/ for the handlers):
//   GET  /api/persistent[/stream]   GET/POST /api/persistent
//   GET  /api/sessions   GET/POST /api/sessions/:id[/stream]
//   GET  /api/open  /api/file  /api/entries  /api/unsung-paths  /api/topology  /api/entry
//   GET  /api/log  /api/commit  /api/uncommitted   POST /api/commit/create
//   GET  /api/stewards   POST /api/steward/advance  /api/stewards/advance-all
//   POST /api/digest/verdict   GET /api/digest/verdicts   POST /api/entry/save
//   GET  /rich/?entry=<Entry>  — an entry's rich face (_ops/rich-face/)
//   GET  /api/piece?path=<web page>  — how the deck frames a piece on the piece origin
//
// It also starts the piece origin (_ops/rich-face/piece-origin.mjs): the second
// listener, on 127.0.0.1:8843 beside the app's own 5173 (any free port beside
// any other), where every rich-face and deck piece runs. STIGMERGY_PIECE_PORT
// names another; opts.pieces hands one in (tests).
//
// The palace root is derived from PALACE_ROOT if set, else from a default path.
// Tests pass an explicit `palaceRoot` to avoid env-var coupling, and may inject
// opts.stewardLane / opts.companionLane so the test path never spawns a real worker.

import { buildWorkers } from './workers.js';
import { dispatch } from './router.js';
import { guardRequest } from './request-guard.js';
import { startPieceOrigin, piecePortFor } from '../../../rich-face/piece-origin.mjs';

// Re-exported from http.js so direct importers keep working (middleware.test.js).
export { resolveInsidePalace, contentTypeFor, readPersistent, listSessions, readSession } from './http.js';

export function blackboardMiddleware(palaceRoot, opts = {}) {
  // The long-lived worker lanes (steward, companion). See
  // workers.js for the scar #4 single-global-worker rule and the
  // STIGMERGY_STUB_WORKER gate. Tests inject opts.stewardLane / opts.companionLane.
  const { stewardLane, companionLane } = buildWorkers(palaceRoot, opts);

  const plugin = {
    name: 'stigmergy-blackboard-middleware',
    // The piece origin once configureServer has started it: a promise of it.
    pieces: null,
    configureServer(server) {
      const allowedHosts = server.config?.server?.allowedHosts;
      // A real dev server starts its piece origin now, so a taken port is said at
      // once and a piece opened on its own is served from the first request.
      // Anything else (a test's stub, middleware mode) starts it the first time
      // a route asks, so a server that never shows a piece never listens twice.
      let started = null;
      const start = () => started || (started = (opts.pieces !== undefined
        ? Promise.resolve(opts.pieces)
        : startPieceOrigin({ root: palaceRoot, port: opts.piecePort ?? piecePortFor(server.config?.server?.port) })
      ).then((po) => {
        if (po && !po.status.ok) console.warn(`[stigmergy] no piece origin: ${po.status.error}. Every piece's figure will say so.`);
        return po;
      }));
      const pieces = { then: (ok, fail) => start().then(ok, fail) };
      if (server.httpServer) start();
      plugin.pieces = pieces;
      server.middlewares.use(async (req, res, next) => {
        // Strip query string for routing; keep it (in ctx.query) for the handlers.
        const rawUrl = req.url || '';
        const [urlPath, queryString] = rawUrl.split('?');
        const query = new URLSearchParams(queryString || '');
        const method = (req.method || 'GET').toUpperCase();

        // Foreign hosts, preflights, and actions from any origin but this one stop
        // here (server/request-guard.js) — before Vite's own middlewares run.
        if (guardRequest(req, res, { urlPath, method, allowedHosts })) return;

        const ctx = { req, res, palaceRoot, urlPath, query, method, stewardLane, companionLane, opts, pieces };
        if (await dispatch(ctx)) return; // a family owned the response
        next(); // not an /api route we handle — let Vite serve the app
      });
    },
  };
  return plugin;
}
