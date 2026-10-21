// contract.mjs — the piece contract, read in one place. A piece says in its own
// <head> what it needs from its host; a gathered proof nobody should edit has a
// `contract` block in its manifest entry instead; Loudon's grants live in
// grants.json. From those three this module works out how the piece is framed,
// what its chips say, and the policies the piece origin sends with it. The page
// (rich-handler.mjs → _api/resolve), STIGMERGY's deck (GET /api/piece), the
// piece origin (piece-origin.mjs) and the public build all ask here, so a piece
// is framed the same way wherever it is shown. Plan: STIGMERGY — spec —
// rich-face pieces § 3.
//
//   <meta name="piece:needs" content="camera storage">     camera microphone midi storage fullscreen
//   <meta name="piece:files" content="frames.json data/">  beside the piece, or /palace/absolute; a
//                                                          folder ends in "/"; a space in a name is %20
//   <meta name="piece:net"   content="storage.googleapis.com">
//   <meta name="piece:size"  content="fill 4/3">           flow (the default: the piece reports its
//                                                          height) or fill <w>/<h> (sized from the column)
//
// Lists split on spaces and commas. Camera, microphone, midi and every net host
// also need a line in grants.json, written only on Loudon's yes; that file is
// the real gate, sent as each piece's Permissions-Policy.

import { readFileSync, statSync } from 'node:fs';
import { join, posix } from 'node:path';

export const NEEDS = ['camera', 'microphone', 'midi', 'storage', 'fullscreen'];
// Needs that also take a grant line (so does every net host).
export const GRANTED_NEEDS = ['camera', 'microphone', 'midi'];
// A frame's height: what it takes from a piece, and what it shows until told.
export const CAPS = { min: 120, max: 8000, fallback: 800 };
export const GRANTS_FILE = '_ops/rich-face/grants.json';
export const SHELF_FILE = '_ops/rich-face/libs.json';
// Served on the piece origin to every piece: Flocking's pieces load palace-tokens.js from here.
export const DESIGN_SYSTEM = '_ops/loudon-live/design-system/';
// …all but the review layer, whose notes land in storage a face does not keep (review-layer.js:96-97).
export const REVIEW_LAYER = '_ops/loudon-live/design-system/ui_kits/review-layer/';
// The CDNs pieces load libraries from today, until libs.json (the shelf) names its own.
const DEFAULT_SHELF = ['https://unpkg.com', 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'];

const words = (v) => (Array.isArray(v) ? v.map(String) : String(v ?? '').split(/[\s,]+/)).map((s) => s.trim()).filter(Boolean);
const safeDecode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };

// Every <meta> in the page's head, as { name, content }.
function metas(html) {
  const s = String(html || '');
  const end = s.search(/<\/head\s*>|<body[\s>]/i);
  const head = s.slice(0, end < 0 ? 64 * 1024 : end);
  const out = [];
  for (const m of head.matchAll(/<meta\b([^>]*)>/gi)) {
    const attrs = {};
    for (const a of m[1].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4] ?? '';
    if (attrs.name) out.push({ name: attrs.name.toLowerCase(), content: attrs.content ?? '' });
  }
  return out;
}

function parseSize(v, problems) {
  const t = String(v ?? '').trim().toLowerCase();
  if (!t || t === 'flow') return { mode: 'flow' };
  const m = t.match(/^fill\s+(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+(?:\.\d+)?))?$/);
  if (m) {
    const ratio = m[2] ? Number(m[1]) / Number(m[2]) : Number(m[1]);
    if (ratio > 0.1 && ratio < 10) return { mode: 'fill', ratio, as: m[2] ? `${m[1]}/${m[2]}` : m[1] };
  }
  problems.push(`size “${v}” is not flow or fill <w>/<h>`);
  return { mode: 'flow' };
}

const hostOf = (v) => { const t = String(v).trim().toLowerCase(); try { return new URL(t.includes('://') ? t : `https://${t}`).host; } catch { return null; } };

/** One declaration from its parts (a piece's metas, or a manifest's contract block). */
function declaration(parts) {
  const problems = [];
  const needs = [];
  for (const n of words(parts.needs).map((x) => x.toLowerCase())) {
    if (!NEEDS.includes(n)) problems.push(`“${n}” is not a need (${NEEDS.join(', ')})`);
    else if (!needs.includes(n)) needs.push(n);
  }
  const files = [...new Set(words(parts.files).map(safeDecode))];
  const net = [];
  for (const h of words(parts.net)) { const host = hostOf(h); if (!host) problems.push(`net “${h}” is not a host`); else if (!net.includes(host)) net.push(host); }
  return { needs, files, net, size: parseSize(parts.size, problems), problems };
}

/**
 * What a piece declares in its own <head>, or null when it declares nothing.
 * @returns {null | { needs: string[], files: string[], net: string[], size: object, problems: string[] }}
 */
export function readDeclaration(html) {
  const parts = {};
  let any = false;
  for (const { name, content } of metas(html)) {
    const key = name.startsWith('piece:') ? name.slice(6) : null;
    if (!key) continue;
    any = true;
    if (['needs', 'files', 'net', 'size'].includes(key)) parts[key] = parts[key] ? `${parts[key]} ${content}` : content;
  }
  return any ? declaration(parts) : null;
}

/**
 * The contract a piece is held to: its own declaration, or else its manifest
 * entry's `contract` block (the manifest speaks for a gathered proof), or else
 * none — a pre-contract piece, framed as every piece was before the contract.
 */
export function contractOf({ html, manifestContract } = {}) {
  const own = readDeclaration(html);
  if (own) return { source: 'piece', ...own };
  if (manifestContract && typeof manifestContract === 'object') return { source: 'manifest', ...declaration(manifestContract) };
  return { source: null, needs: [], files: [], net: [], size: { mode: 'flow' }, problems: [] };
}

/**
 * A declared file as a palace path, named from the piece at `piecePath`.
 * A folder keeps its trailing "/". Null for one that climbs out of the palace.
 */
export function declaredPath(piecePath, ref) {
  const r = String(ref || '').trim();
  if (!r) return null;
  const dir = r.endsWith('/');
  const joined = r.startsWith('/') ? r.replace(/^\/+/, '') : posix.join(posix.dirname(piecePath), r);
  const p = posix.normalize(joined).replace(/\/+$/, '');
  if (!p || p === '.' || p === '..' || p.startsWith('../')) return null;
  return dir ? `${p}/` : p;
}

// ── grants.json ────────────────────────────────────────────────────────────
// { "grants": [ { "piece": "<palace path>", "allow": ["camera"], "net": ["host"], "yes": "Loudon, <date>" } ] }
const grantCache = new Map(); // root -> { mtimeMs, value }

/** The grants Loudon has given: piece path → { allow: Set, net: Set }. A file that is missing grants nothing. */
export function readGrants(root) {
  const file = join(root, ...GRANTS_FILE.split('/'));
  let st;
  try { st = statSync(file); } catch { return { ok: true, byPiece: new Map(), error: null }; }
  const hit = grantCache.get(root);
  if (hit && hit.mtimeMs === st.mtimeMs) return hit.value;
  let value;
  try {
    const json = JSON.parse(readFileSync(file, 'utf8'));
    const byPiece = new Map();
    for (const g of Array.isArray(json.grants) ? json.grants : []) {
      if (!g || typeof g.piece !== 'string') continue;
      const cur = byPiece.get(g.piece) || { allow: new Set(), net: new Set() };
      for (const a of words(g.allow).map((x) => x.toLowerCase())) if (GRANTED_NEEDS.includes(a)) cur.allow.add(a);
      for (const h of words(g.net)) { const host = hostOf(h); if (host) cur.net.add(host); }
      byPiece.set(g.piece, cur);
    }
    value = { ok: true, byPiece, error: null };
  } catch (e) {
    value = { ok: false, byPiece: new Map(), error: `${GRANTS_FILE} could not be read, so nothing is granted: ${e.message}` };
  }
  grantCache.set(root, { mtimeMs: st.mtimeMs, value });
  return value;
}

// ── the shelf ──────────────────────────────────────────────────────────────
/** The origins a piece may load libraries from: every https URL libs.json names, or today's three CDNs. */
export function shelfOrigins(root) {
  let json;
  try { json = JSON.parse(readFileSync(join(root, ...SHELF_FILE.split('/')), 'utf8')); } catch { return DEFAULT_SHELF; }
  const found = new Set();
  (function walk(v) {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    else if (typeof v === 'string' && /^https:\/\//i.test(v)) { try { found.add(new URL(v).origin); } catch { /* not a url */ } }
  })(json);
  return found.size ? [...found].sort() : DEFAULT_SHELF;
}

// ── the frame ──────────────────────────────────────────────────────────────
const LABEL = { camera: 'camera', microphone: 'microphone', midi: 'midi' };

/**
 * How a piece is framed and what its figure says. The same plan feeds the rich
 * page and STIGMERGY's deck; each only renders it.
 * @param {object} o
 * @param {string} o.path           the piece's palace path
 * @param {object} o.contract       from contractOf
 * @param {{ allow: Set, net: Set } | undefined} o.grant  its line in grants.json
 * @param {'live'|'static'} [o.mode] live: on the piece origin; static: the public read view, opaque
 * @param {string} [o.origin]       the piece origin, live
 * @param {string} [o.url]          where the piece is fetched, static
 */
export function framePlan({ path, contract, grant, mode = 'live', origin, url }) {
  const c = contract || contractOf();
  const g = grant || { allow: new Set(), net: new Set() };
  const chips = [];
  const allow = ['autoplay'];
  const refused = [];
  const isStatic = mode === 'static';
  for (const need of c.needs) {
    if (GRANTED_NEEDS.includes(need)) {
      if (isStatic) { chips.push({ text: `${LABEL[need]} · opens in its own tab`, state: 'note', title: 'On the public site a camera or microphone piece runs in its own tab, not in the face.' }); continue; }
      if (g.allow.has(need)) { allow.push(need); chips.push({ text: LABEL[need], state: 'ok', title: `granted in ${GRANTS_FILE}` }); }
      else { refused.push(need); chips.push({ text: `${LABEL[need]} · not granted`, state: 'warn', title: `declared, but ${GRANTS_FILE} has no line for this piece, so the browser refuses it` }); }
    } else if (need === 'storage') {
      chips.push(isStatic
        ? { text: 'storage · this visit only', state: 'note', title: 'The public site keeps a piece’s storage in memory: it is gone when the page closes.' }
        : { text: 'storage', state: 'ok', title: 'kept on the piece origin, under this piece’s own prefix' });
    } else if (need === 'fullscreen') {
      allow.push('fullscreen');
      chips.push({ text: 'fullscreen', state: 'ok', title: 'may go fullscreen' });
    }
  }
  if (c.files.length) chips.push({ text: `files · ${c.files.length}`, state: 'ok', title: `declared files: ${c.files.join(', ')}` });
  const net = [];
  for (const host of c.net) {
    if (isStatic || g.net.has(host)) { net.push(host); chips.push({ text: `net · ${host}`, state: 'ok', title: isStatic ? 'reaches this host' : `granted in ${GRANTS_FILE}` }); }
    else { refused.push(`net ${host}`); chips.push({ text: `net · ${host} · not granted`, state: 'warn', title: `declared, but ${GRANTS_FILE} has no line for it, so the piece cannot reach it` }); }
  }
  if (c.size.mode === 'fill') chips.push({ text: `fill ${c.size.as}`, state: 'ok', title: 'sized from the column' });
  if (c.problems.length) chips.push({ text: `declaration · ${c.problems.length} problem${c.problems.length === 1 ? '' : 's'}`, state: 'warn', title: c.problems.join('; ') });
  if (c.source === 'manifest') chips.push({ text: 'declared by its manifest', state: 'note', title: 'a gathered proof: its manifest entry speaks for it' });
  // A piece that needs anything of its origin — a device, storage, a file
  // beside it — runs as the piece origin; the page adds allow-same-origin only
  // after checking that origin is not its own. Everything else stays opaque.
  const sameOrigin = !isStatic && (c.needs.some((n) => n !== 'fullscreen') || c.files.length > 0);
  return {
    path,
    url: isStatic ? url : `${origin}/${String(path).split('/').map(encodeURIComponent).join('/')}`,
    mark: c.source ? 'introduced' : 'pre-contract',
    source: c.source,
    needs: c.needs, files: c.files, net, size: c.size, problems: c.problems,
    sameOrigin,
    allow: [...new Set(allow)].join('; '),
    refused,
    tab: isStatic && c.needs.some((n) => n === 'camera' || n === 'microphone'),
    chips,
  };
}

/** The Permissions-Policy the piece origin sends with a piece: what grants.json allows it, and nothing else. */
export function piecePolicy(plan) {
  const on = (need) => (plan && plan.allow.split('; ').includes(need) ? 'self' : '');
  return [
    `camera=(${on('camera')})`, `microphone=(${on('microphone')})`, `midi=(${on('midi')})`, `fullscreen=(${on('fullscreen')})`,
    'geolocation=()', 'display-capture=()', 'usb=()', 'serial=()', 'hid=()', 'bluetooth=()', 'payment=()',
  ].join(', ');
}

/**
 * The piece's Content-Security-Policy: where its data may go. Scripts from the
 * shelf; fetches to the piece origin and the hosts it was granted. It limits
 * where data goes, not what code runs; the shelf's SRI pins are the defense
 * for that (spec § 7). It ships report-only for one round.
 */
export function pieceCsp(plan, shelf = DEFAULT_SHELF) {
  const s = shelf.join(' ');
  const net = (plan ? plan.net : []).map((h) => `https://${h}`).join(' ');
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: ${s}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com ${s}`,
    `font-src 'self' data: https://fonts.gstatic.com ${s}`,
    "img-src 'self' data: blob:",
    "media-src 'self' data: blob: mediastream:",
    `connect-src 'self' ${net}`.trim(),
    "worker-src 'self' blob:",
    "frame-src 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'none'",
  ].join('; ');
}
