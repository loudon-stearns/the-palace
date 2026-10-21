// server/api/pieces.js — how the deck frames a web page.
//   GET /api/piece?path=<palace path>  → { piece, pieceOrigin }
//
// A web page on a TRICKSTER card or a scroll's trail runs on the piece origin
// (_ops/rich-face/piece-origin.mjs), as a rich face's pieces do. Asking here
// registers it there, so the piece origin serves it and the files it declares,
// and answers with the plan ArtifactSlot builds its frame from (contract.mjs):
// the URL, the sandbox, the devices granted, the chips. Another site can send
// this GET but cannot read the answer (no CORS), and registering a page lets
// nothing reach it that GET /api/file does not already serve.

import { jsonResponse } from '../http.js';

const NO_ORIGIN = 'this server runs no piece origin, so no piece runs here';

export async function piecesRoutes(ctx) {
  const { res, urlPath, query, method, pieces = null } = ctx;
  if (urlPath !== '/api/piece') return false;
  if (method !== 'GET' && method !== 'HEAD') { jsonResponse(res, 405, { error: 'GET only' }); return true; }
  const rel = query.get('path');
  if (!rel) { jsonResponse(res, 400, { error: 'missing path (a palace-relative web page)' }); return true; }
  const po = await pieces;
  if (!po) {
    jsonResponse(res, 200, { piece: { path: rel, blocked: NO_ORIGIN, mark: 'pre-contract', chips: [] }, pieceOrigin: { ok: false, origin: null, error: NO_ORIGIN } });
    return true;
  }
  const plan = po.describe(rel);
  if (plan.error) { jsonResponse(res, 404, { error: plan.label, reason: plan.error, path: rel }); return true; }
  jsonResponse(res, 200, { piece: plan, pieceOrigin: po.status });
  return true;
}
