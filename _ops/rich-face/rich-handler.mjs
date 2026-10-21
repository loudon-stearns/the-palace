// rich-handler.mjs — everything a rich face needs from a server, as one request
// handler. Mounted two ways, same code:
//   · inside STIGMERGY at /rich/  (server/api/rich.js)  — the everyday door
//   · standalone at /             (rich-server.mjs)      — when STIGMERGY is down
//
// Four jobs, all same-origin so the page has no CORS to fight:
//   1. Serve the renderer (rich.html, _rich/*), its two libraries (_vendor/*,
//      from STIGMERGY's own install — never a CDN) and any palace file — the
//      live .md, the bundle's media — with byte ranges, so video and audio can
//      seek (serve-file.mjs, which the piece origin sends files with too).
//   2. Resolve an entry name to its .md, its bundle, its manifest, and every
//      file its text and manifest name — where each landed, or why it didn't —
//      and, for each piece, how it is framed on the piece origin (contract.mjs
//      through piece-origin.mjs's describe).
//   3. Answer one more lookup for a name the page meets later (a live edit).
//   Both lookups are resolve.mjs's, the one resolver the fingerprint and the
//   public build use too.
//   4. Forward review notes to STIGMERGY as a `human_eval` BROADCAST — the
//      message shape _ops/loudon-eval proved against the board's strict
//      validator, posted to the sanctioned write path (POST /api/persistent).
//
// Every URL it hands the page is relative, so the page works under any base.
// It never writes to the palace.

import { existsSync, statSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { join, normalize, sep, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeResolver } from './resolve.mjs';
import { mediaRefs, isMedia } from './parse.js';
import { isPiecePage } from './kit/inject.mjs';
import { serveFile } from './serve-file.mjs';
// A palace .html or .svg is an active document. The rich face frames its pieces
// sandboxed, but a piece reached any other way — a link in the prose, a
// top-level navigation — would run on this origin with its authority, so it is
// served sandboxed too: scripts run, in an opaque origin. Only the renderer
// itself (rich.html, at the mount's root) and its own files are exempt.
// STIGMERGY's GET /api/file sends the same header (app/server/api/files.js).
export const ACTIVE_SANDBOX = 'sandbox allow-scripts';
const ACTIVE = /\.(?:html?|svg)$/i;

// The renderer's own files; nothing else in this folder is served as _rich/*.
const RENDERER_FILES = new Set(['parse.js', 'rich.js']);
// The renderer's own folder: the code that is running, whatever palace it reads.
export const RICH_FACE_DIR = dirname(fileURLToPath(import.meta.url));

/**
 * The rich page's own policy. Its scripts are its own files (rich.js and what
 * it imports), so an entry's text that slipped past the sanitizer still runs
 * nothing; it frames only the piece origin.
 */
export function pageCsp(pieceOrigin) {
  return ["script-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'none'", `frame-src ${pieceOrigin || "'none'"}`].join('; ');
}

// A manifest entry's own contract block, for a gathered proof (contract.mjs).
function manifestContracts(manifest) {
  const out = new Map();
  for (const s of (manifest && manifest.sections) || []) for (const p of s.pieces || []) if (p && typeof p.file === 'string' && p.contract) out.set(p.file, p.contract);
  return out;
}

// What a figure shows when no piece origin is there to run its piece.
function unframed(path, why) {
  return { path, blocked: why, mark: 'pre-contract', chips: [], needs: [], files: [], net: [], size: { mode: 'flow' }, problems: [], refused: [], sameOrigin: false, allow: 'autoplay' };
}
const NO_ORIGIN = 'this server runs no piece origin, so no piece runs here';

// The page's two libraries — marked, and mermaid with its chunks — come from STIGMERGY's
// install, which npm checked against the lockfile's hashes, so a reader never runs code
// a CDN handed over. They are looked up the way node resolves them from the app — its own
// node_modules first, then the workspace's — so the app's exact pin on marked wins over
// the newer copy mermaid pulls in. Only these files are ever served as _vendor/*.
const STIGMERGY = resolve(dirname(fileURLToPath(import.meta.url)), '../stigmergy');
const MERMAID_CHUNK = /^chunks\/mermaid\.esm\.min\/[\w.-]+\.mjs$/;

function packageDir(name) {
  for (const d of [join(STIGMERGY, 'app/node_modules', name), join(STIGMERGY, 'node_modules', name)]) {
    if (existsSync(join(d, 'package.json'))) return d;
  }
  return null;
}

/** The file on disk behind a _vendor/ path, or null for anything not on the list. */
export function vendorFile(rel) {
  const [lib, ...rest] = String(rel).split('/');
  const tail = rest.join('/');
  if (lib === 'marked' && tail === 'marked.esm.js') {
    const d = packageDir('marked');
    return d && join(d, 'lib/marked.esm.js');
  }
  if (lib === 'mermaid' && (tail === 'mermaid.esm.min.mjs' || MERMAID_CHUNK.test(tail))) {
    const d = packageDir('mermaid');
    return d && join(d, 'dist', tail);
  }
  return null;
}

/** Every _vendor/ file that exists, for the static build to copy: [{ rel, abs }]. */
export function vendorFiles() {
  const rels = ['marked/marked.esm.js', 'mermaid/mermaid.esm.min.mjs'];
  const d = packageDir('mermaid');
  const chunks = d && join(d, 'dist/chunks/mermaid.esm.min');
  if (chunks && existsSync(chunks)) {
    for (const f of readdirSync(chunks)) if (MERMAID_CHUNK.test(`chunks/mermaid.esm.min/${f}`)) rels.push(`mermaid/chunks/mermaid.esm.min/${f}`);
  }
  return rels.map((rel) => ({ rel, abs: vendorFile(rel) })).filter((f) => f.abs && existsSync(f.abs));
}

/**
 * Every file a rich face names, in its text (the three shapes parse.js reads,
 * the shapes the page lays as figures) and in its manifest (a piece's `file`),
 * and where each lands by the one resolver. The live page gets this table from
 * _api/resolve and the public build writes it into data/rich.json, so the two
 * cannot disagree about a file.
 * @returns {Map<string, { ok: true, path: string } | { ok: false, reason: string, label: string }>}
 */
export function richReferences(resolver, mdRel, text, manifest) {
  const names = new Set(mediaRefs(text || '').map((m) => m.name));
  (function collect(v, key) {
    if (Array.isArray(v)) v.forEach((x) => collect(x, key));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) collect(x, k);
    else if (typeof v === 'string' && (key === 'file' || key === 'name') && (isMedia(v) || /\.md$/i.test(v))) names.add(v);
  })(manifest);
  const out = new Map();
  for (const n of names) out.set(n, resolver.resolve(n, mdRel));
  return out;
}

const safeDecode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };
const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
const statOrNull = (p) => { try { return statSync(p); } catch { return null; } };
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// A review is refused here at the size the board itself refuses
// (MAX_BODY_BYTES in app/server/http.js), so nothing is forwarded only to bounce.
const MAX_REVIEW_BYTES = 64 * 1024;
const ID_TASK_CHARS = 64; // the task travels whole in the payload; only its slug in the id is cut

// Collect the body as bytes and decode once at the end: decoding chunk by chunk
// garbles a character whose bytes land in two chunks. Past the cap it answers
// 413 and resolves null; the rest of the body is read and dropped, not kept.
function readBody(req, res, cap) {
  return new Promise((ok, fail) => {
    const chunks = [];
    let total = 0, settled = false;
    const settle = (fn, v) => { if (!settled) { settled = true; fn(v); } };
    req.on('data', (c) => {
      if (settled) return;
      total += c.length;
      if (total > cap) { chunks.length = 0; json(res, 413, { error: `too large — the board takes at most ${cap / 1024} KB` }); settle(ok, null); return; }
      chunks.push(c);
    });
    req.on('end', () => settle(ok, Buffer.concat(chunks).toString('utf8')));
    req.on('error', (e) => settle(fail, e));
    req.on('close', () => settle(fail, new Error('the request closed before its body ended')));
  });
}

// The human_eval message — honest zeros for a human, iteration >= 1, and the
// human node's model id (SCHEMA — Reference §9). It goes on GENERAL, the board
// for content left for any reader, under one session id, `trickster`, reused
// for every review — §9's one slug per agent, never one minted per day or page.
// _ops/loudon-eval posts its ratings on the same wire.
export function buildReviewMessage(data) {
  const d = isPlainObject(data) ? data : {};
  const ts = new Date().toISOString();
  const task = String(d.task || 'rich-face');
  return {
    schema_version: '1.0', id: `human-eval-${task.replace(/[^\w-]+/g, '-').slice(0, ID_TASK_CHARS)}-${Date.now()}`, ts,
    session_id: 'trickster', from: 'TRICKSTER', to: '*', type: 'BROADCAST', board: 'GENERAL',
    health: { context_pct: 0, stop_reason: 'human_eval', iteration: 1, tokens_this_call: 0, model: 'loudon-trickster', score: 'green' },
    payload: { kind: 'human_eval', task, groups: d.groups || {}, overall: d.overall || {} },
  };
}

/**
 * @param {object} o
 * @param {string} o.root   palace root
 * @param {string} o.here   the rich-face folder (rich.html, parse.js, manifests/)
 * @param {string} [o.base] mount point, '' or e.g. '/rich'
 * @param {(req) => string} o.app  STIGMERGY origin for review forwarding
 * @param {object|Promise<object>} [o.pieces] the piece origin (piece-origin.mjs's
 *   startPieceOrigin); without one, every piece's figure says it cannot run
 * @returns {(req, res) => Promise<boolean>} true when it owned the response
 */
export function createRichHandler({ root, here = RICH_FACE_DIR, base = '', app, pieces = null }) {
  const ROOT = resolve(root), HERE = resolve(here);
  const resolver = makeResolver(ROOT);

  const inside = (dir, rel) => {
    let r;
    try { r = decodeURIComponent(rel); } catch { return null; }
    const abs = normalize(join(dir, r));
    if (abs !== dir && !abs.startsWith(dir + sep)) return null;
    return landsInside(dir, abs) ? abs : null;
  };
  // The words of a path can stay inside while the file does not: a symlink in
  // the palace can point anywhere, and serving it follows the link. So judge
  // where the path really lands. A path that is not there passes, and the
  // caller answers 404. STIGMERGY's resolveInsidePalace keeps the same rule.
  const landsInside = (dir, abs) => {
    let real, realDir;
    try { real = realpathSync(abs); } catch (e) { return e.code === 'ENOENT' || e.code === 'ENOTDIR'; }
    try { realDir = realpathSync(dir); } catch { return false; }
    return real === realDir || real.startsWith(realDir + sep);
  };
  const relUrl = (rel) => rel.split('/').map(encodeURIComponent).join('/');

  // How each piece is framed, from the piece origin, or why it cannot run.
  async function pieceOrigin() {
    const po = await pieces;
    return po && typeof po.describe === 'function' ? po : null;
  }
  const originStatus = (po) => (po ? po.status : { ok: false, origin: null, error: NO_ORIGIN });
  const planFor = (po, path, manifestContract) => (po ? po.describe(path, { manifestContract }) : unframed(path, NO_ORIGIN));

  // An entry, its bundle and manifest as relative urls, the names in the
  // bundle's top folder, the media table — every file the text and the
  // manifest name → { path, url } or { error, label } for the labelled box —
  // and the pieces table: every web page among them → how it is framed.
  async function resolveEntry(name) {
    const e = resolver.entry(name);
    if (!e) return null;
    let text = '', manifest = null;
    try { text = readFileSync(resolver.abs(e.md), 'utf8'); } catch { /* the page reports it */ }
    try { manifest = e.manifest ? JSON.parse(readFileSync(resolver.abs(e.manifest), 'utf8')) : null; } catch { /* the page reports it */ }
    const po = await pieceOrigin();
    const contracts = manifestContracts(manifest);
    const media = {}, pieceTable = {};
    for (const [n, r] of richReferences(resolver, e.md, text, manifest)) {
      media[n] = r.ok ? { path: r.path, url: relUrl(r.path) } : { error: r.reason, label: r.label };
      if (r.ok && isPiecePage(r.path)) pieceTable[n] = planFor(po, r.path, contracts.get(n));
    }
    return {
      title: e.title, path: e.md, md: relUrl(e.md), bundle: e.bundle ? relUrl(e.bundle) + '/' : null, manifest: e.manifest ? relUrl(e.manifest) : null,
      files: e.files, media, pieceOrigin: originStatus(po), pieces: pieceTable,
    };
  }

  // A bad request must never take the server down: whatever throws on the way
  // through becomes a 500 for that request alone.
  return async function handle(req, res) {
    try {
      return await route(req, res);
    } catch (e) {
      console.error('[rich-face]', req.method, req.url, e);
      if (res.headersSent) res.destroy();
      else json(res, 500, { error: 'the rich face failed on this request: ' + (e && e.message ? e.message : String(e)) });
      return true;
    }
  };

  async function route(req, res) {
    const u = new URL(req.url, 'http://x');
    let path = u.pathname;
    if (base) {
      if (path === base) { res.writeHead(301, { Location: base + '/' + u.search }); res.end(); return true; }
      if (!path.startsWith(base + '/')) return false;
      path = path.slice(base.length);
    }

    if (path === '/_api/resolve') {
      const r = await resolveEntry(u.searchParams.get('entry') || '');
      r ? json(res, 200, r) : json(res, 404, { error: `no entry named "${u.searchParams.get('entry')}"` });
      return true;
    }
    // `from` is the .md the name is written in; `prefer`, an older page's
    // bundle folder, stands for the .md that owns it.
    if (path === '/_api/find' || path === '/_api/media') {
      const prefer = u.searchParams.get('prefer');
      const from = u.searchParams.get('from') || (prefer ? safeDecode(prefer).replace(/\/+$/, '') + '.md' : '');
      const r = resolver.resolve(u.searchParams.get('name') || '', from || undefined);
      if (path === '/_api/find') {
        if (!r.ok) { json(res, 404, { error: r.label, reason: r.reason, label: r.label }); return true; }
        const found = { path: r.path, url: relUrl(r.path) };
        if (isPiecePage(r.path)) { const po = await pieceOrigin(); found.piece = planFor(po, r.path); found.pieceOrigin = originStatus(po); }
        json(res, 200, found);
        return true;
      }
      if (!r.ok) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(r.label); return true; }
      res.writeHead(302, { Location: (base || '') + '/' + relUrl(r.path), 'Cache-Control': 'no-store' });
      res.end();
      return true;
    }
    if (path === '/_api/review' && req.method === 'POST') {
      const body = await readBody(req, res, MAX_REVIEW_BYTES);
      if (body === null) return true; // 413 already sent
      let data;
      try { data = JSON.parse(body); } catch (e) { json(res, 400, { error: 'bad json: ' + e.message }); return true; }
      if (!isPlainObject(data)) { json(res, 400, { error: 'a review is a JSON object' }); return true; }
      const msg = buildReviewMessage(data);
      const target = app(req).replace(/\/$/, '');
      try {
        const r = await fetch(target + '/api/persistent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(msg) });
        const txt = await r.text();
        let board; try { board = JSON.parse(txt); } catch { board = txt; }
        json(res, r.status, { forwarded: r.status, board_response: board, message_id: msg.id });
      } catch (e) {
        json(res, 502, { error: `cannot reach STIGMERGY at ${target} — is it running?`, detail: String(e) });
      }
      return true;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') return false;
    let file, palaceFile = false, headers = {};
    if (path === '/' || path === '/index.html') {
      file = join(HERE, 'rich.html');
      const po = await pieceOrigin();
      headers = { 'Content-Security-Policy': pageCsp(originStatus(po).origin) };
    }
    else if (path.startsWith('/_rich/')) {
      const name = path.slice('/_rich/'.length);
      file = RENDERER_FILES.has(name) ? join(HERE, name) : null;
    } else if (path.startsWith('/_vendor/')) file = vendorFile(path.slice('/_vendor/'.length));
    else { file = inside(ROOT, path); palaceFile = true; }
    const st = file ? statOrNull(file) : null;
    if (!st || !st.isFile()) { res.writeHead(404); res.end('not found: ' + path); return true; }
    if (palaceFile && ACTIVE.test(file)) headers['Content-Security-Policy'] = ACTIVE_SANDBOX;
    serveFile(req, res, file, { size: st.size, root: ROOT, piece: palaceFile, headers });
    return true;
  }
}
