// _ops/loudon-eval/eval-server.mjs — the answers server: Loudon's answers, posted to STIGMERGY.
//
//   node _ops/loudon-eval/eval-server.mjs                     the palace, on http://127.0.0.1:8211/
//   node _ops/loudon-eval/eval-server.mjs --dir <folder>      a rating sheet: rate.html + its manifest
//   [--port 8211] [--app http://localhost:5173] [--root <palace>]
//
// A page that asks Loudon something is opened here, by its palace path
// (http://127.0.0.1:8211/The%20Lens/proofs/…/woken-glasses.html), in whichever browser he
// likes. The page and this server share one origin, so the page can send his answers with no
// CORS. The server wraps them in a §2.2 `human_eval` BROADCAST and forwards it server-to-server
// to the running STIGMERGY app's one write path (POST /api/persistent), where the app's own
// strict validator and append helper do the work. The session then reads them off the board
// file (read-answers.mjs), so nothing depends on which browser he used or on the page keeping
// its state.
//
// Two write routes, one wire:
//   POST /answers  { page, task?, answers, summary?, url? }  any page that asks him something.
//                  `page` names the palace entry the answers are about; it travels as
//                  payload.entry, and the readable summary as payload.overall.note, so the
//                  QUEUE raises it as a REVIEW NOTE card on that page (queue-model.js readReview).
//   POST /eval     { task, groups, overall }                  the June rating sheet (rate.html),
//                  unchanged; it names no page, so it stays off the QUEUE and is read back by
//                  the session that asked.
// When the app cannot be reached the answer is 502 and nothing is written; the page's script
// (answers.js, served at /_answers/answers.js) then shows the answers as one block to copy.
//
// What it serves. With --dir, that folder, and rate.html at / (the rating sheet, as in June).
// Without it, the palace: every file under the root but a dotfolder or dotfile (.git, .claude,
// .obsidian, .env …) and anything in node_modules, judged by where the path really lands, so a
// symlink out of the palace is refused like a traversal. HTML is served as itself, not
// sandboxed: being same-origin with /answers is the point. That is the one way this server
// differs from STIGMERGY's /api/file, and why it binds 127.0.0.1 only and stands behind the
// app's request guard.
//
// A rating or an answer it forwards lands as TRICKSTER, Loudon's own voice, so STIGMERGY's
// request guard (checkRequest) stands in front of every path, as it does for the standalone
// rich face: a foreign Host is refused (a DNS-rebinding page), and so is a write that is not
// JSON or comes from a foreign page. One rule, imported, not copied.

import http from 'node:http';
import { createReadStream, existsSync, statSync, realpathSync } from 'node:fs';
import { resolve, join, extname, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkRequest } from '../stigmergy/app/server/request-guard.js';

const HERE = dirname(fileURLToPath(import.meta.url));
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i >= 0 ? process.argv[i + 1] : def; }

export const DEFAULT_PORT = 8211;
const DIR_ARG = arg('dir', null);
const ROOT = resolve(DIR_ARG ?? arg('root', resolve(HERE, '../..')));
const PORT = parseInt(arg('port', String(DEFAULT_PORT)), 10);
const APP  = arg('app', 'http://localhost:5173').replace(/\/$/, '');
const HARNESS = join(HERE, 'rate.html');
const SCRIPT = join(HERE, 'answers.js');
export const SCRIPT_PATH = '/_answers/answers.js';

// The board refuses a body over 64 KB (app README, POST /api/persistent); refuse it here first.
const MAX_BODY = 64 * 1024;
const ID_TASK_CHARS = 64;

const CT = {
  '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.flac': 'audio/flac',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
};

const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const str = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const slug = (s) => String(s).replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, ID_TASK_CHARS) || 'x';

/**
 * A request path, resolved inside ROOT, or null when it must not be served: a traversal, a
 * dotfolder or dotfile anywhere on the path, node_modules, a null byte, or a symlink whose
 * target lies outside the root.
 */
export function resolveServed(root, urlPath) {
  let rel;
  try { rel = decodeURIComponent(urlPath); } catch { return null; }
  if (rel.includes('\0')) return null;
  const parts = rel.split(/[/\\]+/).filter((p) => p !== '');
  if (parts.some((p) => p === '..' || p.startsWith('.') || p === 'node_modules')) return null;
  const base = resolve(root);
  const abs = resolve(base, ...parts);
  if (abs !== base && !abs.startsWith(base + sep)) return null;
  let real, realRoot;
  try { realRoot = realpathSync(base); } catch { return null; }
  try { real = realpathSync(abs); } catch { return abs; } // not there: the caller answers 404
  if (real !== realRoot && !real.startsWith(realRoot + sep)) return null;
  return abs;
}

// The human node's stub health: honest zeros (no context, no tokens), iteration >= 1, and the
// human node's model id (SCHEMA — Reference §9). GENERAL, under the one session id `trickster`,
// reused for every note; the rich face's review dock posts on the same wire (rich-handler.mjs).
function envelope(id, payload) {
  return {
    schema_version: '1.0', id, ts: new Date().toISOString(),
    session_id: 'trickster', from: 'TRICKSTER', to: '*', type: 'BROADCAST', board: 'GENERAL',
    health: { context_pct: 0, stop_reason: 'human_eval', iteration: 1, tokens_this_call: 0, model: 'loudon-trickster', score: 'green' },
    payload,
  };
}

/** The June rating sheet's message: a task, its groups and the overall read. Names no page. */
export function buildMessage(data) {
  const d = isPlainObject(data) ? data : {};
  const task = String(d.task || 'eval');
  return envelope(`human-eval-${slug(task)}-${Date.now()}`,
    { kind: 'human_eval', task, groups: d.groups || {}, overall: d.overall || {} });
}

/** A readable block from the answers when the page sent none: one line per answer. */
export function summarize(answers) {
  if (typeof answers === 'string') return answers;
  if (!isPlainObject(answers) && !Array.isArray(answers)) return String(answers ?? '');
  return Object.entries(answers).map(([k, v]) => `- ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`).join('\n');
}

/**
 * An answers message: page → payload.entry, the readable summary → payload.overall.note, so
 * readReview (src/lib/queue-model.js) reads it as a review of that page and the QUEUE raises a
 * REVIEW NOTE card. Returns { error } when the body cannot make one.
 */
export function buildAnswersMessage(data, { referer } = {}) {
  if (!isPlainObject(data)) return { error: 'answers are a JSON object: { page, task?, answers, summary? }' };
  const page = str(data.page);
  if (!page) return { error: '"page" is required: the palace entry these answers are about' };
  if (page.length > 200) return { error: '"page" is an entry title, at most 200 characters' };
  if (data.answers === undefined) return { error: '"answers" is required' };
  const task = str(data.task) || 'answers';
  const summary = str(data.summary) || summarize(data.answers) || '(no answers given)';
  let url = str(data.url);
  if (!url && referer) { try { url = new URL(referer).pathname; } catch { url = null; } }
  if (url) { try { url = decodeURIComponent(url); } catch { /* keep it as sent */ } }
  const payload = {
    kind: 'human_eval', entry: page, task, answers: data.answers, summary,
    overall: { note: summary }, groups: {},
  };
  if (url) payload.url = url;
  return { message: envelope(`human-eval-answers-${slug(page)}-${Date.now()}`, payload) };
}

async function readBody(req) {
  let body = '';
  for await (const c of req) { body += c; if (body.length > MAX_BODY) return null; }
  return body;
}

async function forward(res, msg) {
  try {
    const r = await fetch(APP + '/api/persistent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(msg) });
    const txt = await r.text();
    res.writeHead(r.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ forwarded: r.status, board_response: safeParse(txt), message_id: msg.id }));
  } catch (e) {
    json(res, 502, { error: `cannot reach STIGMERGY at ${APP} — is it running on :5173?`, detail: String(e) });
  }
}

function serveFile(req, res, file) {
  const st = statSync(file);
  const type = CT[extname(file).toLowerCase()] || 'application/octet-stream';
  const headers = { 'Content-Type': type, 'Cache-Control': 'no-cache', 'Accept-Ranges': 'bytes' };
  const m = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range || ''));
  if (m && (m[1] !== '' || m[2] !== '')) {
    let start = m[1] === '' ? Math.max(0, st.size - Number(m[2])) : Number(m[1]);
    let end = m[1] !== '' && m[2] !== '' ? Math.min(Number(m[2]), st.size - 1) : st.size - 1;
    if (start > end || start >= st.size) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }); return res.end(); }
    res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Content-Length': end - start + 1 });
    if (req.method === 'HEAD') return res.end();
    return createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...headers, 'Content-Length': st.size });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
}

const INDEX = `<!doctype html><meta charset="utf-8"><title>answers server</title>
<body style="font:15px/1.5 system-ui;max-width:40em;margin:3em auto;padding:0 1em">
<h1 style="font-size:20px">The answers server</h1>
<p>Open a page that asks Loudon something by its palace path, e.g.
<code>/The%20Lens/proofs/2026-11-03-bold-mandate/woken-glasses.html</code>.
Its answers go to the STIGMERGY board as a <code>human_eval</code>; when the board can't be reached,
the page shows them as one block to copy.</p></body>`;

const server = http.createServer(async (req, res) => {
  const method = (req.method || 'GET').toUpperCase();
  const urlPath = (req.url || '').split('?')[0];
  if (checkRequest(req, res, { urlPath, method })) return;
  const u = new URL(req.url, 'http://x');

  if (method === 'POST' && (u.pathname === '/answers' || u.pathname === '/eval')) {
    const body = await readBody(req);
    if (body === null) return json(res, 413, { error: 'too large: the board takes at most 64 KB' });
    let data; try { data = JSON.parse(body); } catch (e) { return json(res, 400, { error: 'bad json: ' + e.message }); }
    if (u.pathname === '/eval') return forward(res, buildMessage(data));
    const built = buildAnswersMessage(data, { referer: req.headers.referer });
    if (built.error) return json(res, 400, { error: built.error });
    return forward(res, built.message);
  }

  if (method !== 'GET' && method !== 'HEAD') return json(res, 405, { error: 'GET, HEAD, or POST /answers' });

  let file;
  if (u.pathname === SCRIPT_PATH) file = SCRIPT;
  else if (u.pathname === '/rate.html' || (DIR_ARG && u.pathname === '/')) file = HARNESS;
  else if (u.pathname === '/') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(INDEX); }
  else file = resolveServed(ROOT, u.pathname);
  if (!file) return json(res, 403, { error: 'not served: a dotfolder, node_modules, or a path outside the root' });
  if (!existsSync(file) || !statSync(file).isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('not found: ' + u.pathname); }
  serveFile(req, res, file);
});

function safeParse(t) { try { return JSON.parse(t); } catch { return t; } }

// Listen only when run, so the tests can import the builders.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  server.listen(PORT, '127.0.0.1', () => {
    const port = server.address().port;
    console.log(`answers server up — http://127.0.0.1:${port}/  ·  serving ${ROOT}  ·  posting to ${APP}/api/persistent`);
  });
}
