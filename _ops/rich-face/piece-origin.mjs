// piece-origin.mjs — the piece origin: a listener inside STIGMERGY, on
// 127.0.0.1:8843, where every rich-face piece runs. Authority lives on the app's
// own origin (the board, /api/open, the reader); nothing the palace writes runs
// there. 127.0.0.1 is another site from localhost, so whatever a piece sends
// toward STIGMERGY is cross-site: the request guard refuses its writes and
// /api/open, and STIGMERGY sends no CORS, so a piece cannot read what comes
// back. Plan: STIGMERGY — spec — rich-face pieces § 2 and § 4.2.
//
// It holds nothing and serves little:
//   · GET and HEAD only, for its exact Host, with no CORS.
//   · Only registered pieces, the files they declare (piece:files), and the
//     design-system folder (Flocking's pieces load palace-tokens.js from it) —
//     every one a file git keeps, found by the one resolver.
//   · A piece is registered when a face names it: every manifest at boot and
//     again on a miss, and any piece the rich page or the deck asks to frame
//     (describe). Anything else gets a 404 that says why.
//   · Each piece goes out with the kit injected, its Permissions-Policy (what
//     grants.json allows it: the real gate), its CSP (report-only for a round),
//     CORP and nosniff. CORP is same-origin for a piece and its declared files,
//     which only a piece with this origin loads; the design system's files are
//     cross-origin, since a piece with no origin of its own (opaque) loads them
//     too, and an opaque origin is never the same origin as this one.
//   · If its port is taken, it says so, and every figure says so in turn. A
//     piece never falls back to the app's origin.

import http from 'node:http';
import { statSync, readFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { posix } from 'node:path';
import { checkRequest } from '../stigmergy/app/server/request-guard.js';
import { makeResolver } from './resolve.mjs';
import { richReferences } from './rich-handler.mjs';
import { serveFile } from './serve-file.mjs';
import { isPiecePage } from './kit/inject.mjs';
import { contractOf, readGrants, framePlan, piecePolicy, pieceCsp, shelfOrigins, declaredPath, DESIGN_SYSTEM, REVIEW_LAYER } from './contract.mjs';

export const PIECE_HOST = '127.0.0.1';
export const PIECE_PORT = 8843;
const APP_PORT = 5173;
const MISS_RESCAN_MS = 1000;

/**
 * The port a STIGMERGY instance's piece origin takes. STIGMERGY_PIECE_PORT when
 * set; 8843 beside the app's own 5173; any free port for every other instance
 * (a worktree's, a scratch server's, a test's), since 8843 is a single port.
 */
export function piecePortFor(appPort, env = process.env) {
  const set = env.STIGMERGY_PIECE_PORT;
  if (set !== undefined && set !== '' && Number.isInteger(Number(set))) return Number(set);
  return Number(appPort) === APP_PORT ? PIECE_PORT : 0;
}

const hidden = (rel) => rel.split('/').some((s) => s.startsWith('.'));
const STIGMERGY_PATHS = /^(?:api|rich|_api|_rich|_vendor|@vite|@fs|@id|src|node_modules)(?:\/|$)/;

function text(res, status, body, extra = {}) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(body);
}

/** The pieces a manifest names, with the contract block its entry carries (or none). */
function manifestPieces(manifest) {
  const out = new Map();
  for (const s of (manifest && manifest.sections) || []) for (const p of s.pieces || []) if (p && typeof p.file === 'string') out.set(p.file, p.contract || null);
  return out;
}

/**
 * Make (but do not start) a piece origin for a palace.
 * @param {{ root: string, port?: number, host?: string }} o
 */
export function createPieceOrigin({ root, port = PIECE_PORT, host = PIECE_HOST }) {
  const resolver = makeResolver(root);
  const pieces = new Map();      // palace path -> { plan, files: Set, folders: string[] }
  const contracts = new Map();   // palace path -> the manifest's contract block, from the last scan
  let status = { ok: false, starting: true, origin: null, error: null };
  let scannedAt = 0;
  let server = null;

  // Every manifest the palace keeps, and every piece its face names. The
  // manifests are listed without holding the event loop (the scan runs while
  // the server answers), and a palace with none costs nothing more.
  let scanning = null;
  function listManifests() {
    return new Promise((done) => {
      execFile('git', ['-c', 'core.quotepath=off', 'ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', '*— rich.json'],
        { cwd: root, maxBuffer: 64 * 1024 * 1024, encoding: 'utf8' },
        (err, out) => done(err ? [] : String(out).split('\0').filter(Boolean)));
    });
  }
  function scan() {
    if (!scanning) scanning = rescan().finally(() => { scanning = null; });
    return scanning;
  }
  async function rescan() {
    scannedAt = Date.now();
    const list = await listManifests();
    for (const m of list) {
      const title = posix.basename(m).replace(/ — rich\.json$/, '');
      const e = resolver.entry(title);
      if (!e || e.manifest !== m) continue; // a manifest only counts where the face would read it
      let text = '', manifest = null;
      try { text = readFileSync(resolver.abs(e.md), 'utf8'); manifest = JSON.parse(readFileSync(resolver.abs(m), 'utf8')); } catch { continue; }
      const named = manifestPieces(manifest);
      for (const [name, r] of richReferences(resolver, e.md, text, manifest)) {
        if (!r.ok || !isPiecePage(r.path)) continue;
        if (named.get(name)) contracts.set(r.path, named.get(name));
        describe(r.path);
      }
    }
    // A registered piece may have changed its declaration since: read it again.
    for (const p of [...pieces.keys()]) describe(p);
  }

  /**
   * Register a piece and say how it is framed: framePlan's plan, or
   * { error, label } when the file is not one the resolver will give.
   * @param {string} path  palace path
   * @param {{ manifestContract?: object }} [o]
   */
  function describe(path, { manifestContract } = {}) {
    const r = resolver.resolve('/' + String(path || '').replace(/^\/+/, ''));
    if (!r.ok) return { error: r.reason, label: r.label };
    if (!isPiecePage(r.path)) return { error: 'not-a-piece', label: `“${r.path}” is not a web page, so it is not a piece.` };
    if (manifestContract) contracts.set(r.path, manifestContract);
    let html = '';
    try { html = readFileSync(resolver.abs(r.path), 'utf8'); } catch (e) { return { error: 'unreadable', label: `“${r.path}” could not be read: ${e.code || e.message}` }; }
    const contract = contractOf({ html, manifestContract: contracts.get(r.path) });
    const grants = readGrants(root);
    const plan = framePlan({ path: r.path, contract, grant: grants.byPiece.get(r.path), mode: 'live', origin: status.origin || `http://${host}:${port}` });
    if (!grants.ok) plan.chips.push({ text: 'grants unreadable', state: 'warn', title: grants.error });
    if (!status.ok) plan.blocked = status.starting ? 'The piece origin is still starting.' : status.error;
    const files = new Set(), folders = [];
    for (const f of contract.files) {
      const d = declaredPath(r.path, f);
      if (d && d.endsWith('/')) folders.push(d); else if (d) files.add(d);
    }
    pieces.set(r.path, { plan, files, folders });
    return plan;
  }

  // May `rel` be served here? → { piece } for a registered piece, { ok } for a
  // declared or design-system file, or { why } with the reason it may not.
  function admit(rel) {
    if (hidden(rel)) return { why: `“${rel}” is in a hidden folder; the piece origin never serves one.` };
    if (rel.startsWith(REVIEW_LAYER)) return { why: 'The review layer stays out of faces: its notes land in storage a face does not keep.' };
    if (pieces.has(rel)) return { piece: true };
    if (declaredByAny(rel)) return { ok: true };
    if (rel.startsWith(DESIGN_SYSTEM)) return { ok: true };
    return null;
  }
  const declaredByAny = (rel) => { for (const p of pieces.values()) if (p.files.has(rel) || p.folders.some((d) => rel.startsWith(d))) return true; return false; };

  async function handle(req, res) {
    const [rawPath] = String(req.url || '/').split('?');
    const method = String(req.method || 'GET').toUpperCase();
    // STIGMERGY's own door first: a foreign Host name, a preflight, an action
    // from another origin (server/request-guard.js).
    if (checkRequest(req, res, { urlPath: rawPath, method })) return;
    const self = `${host}:${server.address().port}`;
    if (String(req.headers.host || '').toLowerCase() !== self) {
      text(res, 421, `The piece origin answers only as http://${self}.`);
      return;
    }
    if (method !== 'GET' && method !== 'HEAD') { text(res, 405, 'The piece origin only serves files: GET and HEAD.', { Allow: 'GET, HEAD' }); return; }
    let rel;
    try { rel = posix.normalize(decodeURIComponent(rawPath)).replace(/^\/+/, ''); } catch { text(res, 400, 'That path is not a path.'); return; }
    if (rel === '' || rel === '.') { text(res, 404, 'The piece origin serves pieces, not a page of its own.'); return; }
    if (rel === '..' || rel.startsWith('../')) { text(res, 404, 'That path leads outside the palace.'); return; }
    if (STIGMERGY_PATHS.test(rel)) { text(res, 403, 'The piece origin serves no part of STIGMERGY: no board, no /api, no reader.'); return; }
    let a = admit(rel);
    if (!a && Date.now() - scannedAt > MISS_RESCAN_MS) { await scan(); a = admit(rel); }
    if (!a) { text(res, 404, `“${rel}” is not served here: the piece origin serves only pieces a face has named, the files they declare (piece:files), and the design system.`); return; }
    if (a.why) { text(res, 404, a.why); return; }
    const r = resolver.resolve('/' + rel);
    if (!r.ok || r.path !== rel) { text(res, 404, r.ok ? `“${rel}” is not where its file is (${r.path}).` : r.label); return; }
    // A piece's own page is read again on every load, so its headers follow
    // its declaration and grants.json as they are now.
    const plan = a.piece ? describe(rel) : null;
    const abs = resolver.abs(rel);
    let st;
    try { st = statSync(abs); } catch { text(res, 404, `“${rel}” is gone.`); return; }
    const shared = !a.piece && rel.startsWith(DESIGN_SYSTEM); // public assets, which the build publishes anyway
    const headers = { 'X-Content-Type-Options': 'nosniff', 'Cross-Origin-Resource-Policy': shared ? 'cross-origin' : 'same-origin', 'Referrer-Policy': 'no-referrer' };
    if (isPiecePage(rel)) {
      headers['Permissions-Policy'] = piecePolicy(plan && !plan.error ? plan : null);
      headers['Content-Security-Policy-Report-Only'] = pieceCsp(plan && !plan.error ? plan : null, shelfOrigins(root));
    }
    serveFile(req, res, abs, { size: st.size, root, piece: true, headers });
  }

  /** Listen. Resolves to the status either way: { ok, origin } or { ok: false, error }. */
  function start() {
    return new Promise((done) => {
      server = http.createServer((req, res) => {
        handle(req, res).catch((e) => {
          console.error('[piece-origin]', req.method, req.url, e);
          if (res.headersSent) res.destroy(); else text(res, 500, 'The piece origin failed on this request: ' + (e && e.message ? e.message : String(e)));
        });
      });
      server.once('error', (e) => {
        status = { ok: false, starting: false, origin: null, error: e.code === 'EADDRINUSE'
          ? `port ${port} is taken by another program, so no piece runs here`
          : `the piece origin could not listen on ${host}:${port}: ${e.message}` };
        for (const p of pieces.values()) p.plan.blocked = status.error;
        done(status);
      });
      server.listen(port, host, () => {
        status = { ok: true, starting: false, origin: `http://${host}:${server.address().port}`, error: null };
        server.unref(); // the app's own server keeps the process alive, never this one
        scan();
        done(status);
      });
    });
  }

  return {
    get status() { return status; },
    describe,
    scan,
    start,
    close: () => new Promise((done) => {
      if (status.ok) status = { ok: false, starting: false, origin: null, error: 'the piece origin has stopped' };
      if (server && server.listening) { server.close(() => done()); server.closeAllConnections?.(); } else done();
    }),
  };
}

// One piece origin per palace and port in a process, and one per palace for "any
// free port". Vite builds its server again when its config's imports change, and
// calls configureServer before the old one closes: the second start must find the
// first, not a port the first still holds, nor leave the first listening with no
// one to close it. One that has stopped, or whose port was taken, is started anew.
const LIVE = Symbol.for('palace.rich-face.piece-origins');
const live = globalThis[LIVE] || (globalThis[LIVE] = new Map());

/**
 * Start the piece origin for a palace (or find the one already running on that
 * port in this process). Never throws: a port that is taken comes back as
 * { status: { ok: false, error } }, which every figure then shows.
 */
export async function startPieceOrigin({ root, port = PIECE_PORT, host = PIECE_HOST }) {
  const key = `${root}\0${host}\0${port || 'any'}`;
  if (live.has(key)) {
    const o = live.get(key);
    await o.ready;
    if (o.status.ok) return o;
    if (live.get(key) === o) live.delete(key); // stopped, or its port was taken last time: try again
  }
  const o = createPieceOrigin({ root, port, host });
  o.ready = o.start();
  live.set(key, o);
  const status = await o.ready;
  if (!status.ok && live.get(key) === o) live.delete(key);
  return o;
}
