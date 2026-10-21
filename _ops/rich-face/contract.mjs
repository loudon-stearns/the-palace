// contract.mjs — the piece contract, read one way. A piece declares in its own
// <head> what it needs from its host; a gathered proof nobody should edit has
// the same declaration as a `contract` block in its manifest entry instead.
// The checker (conform.mjs), the Sentry and build gates, and the piece origin
// all read a declaration, the grants and the library shelf through here, so a
// piece is judged and served by the same reading.
// Plan: STIGMERGY — spec — rich-face pieces § 3, "The piece contract".
//
//   <meta name="piece:needs" content="camera storage">
//   <meta name="piece:files" content="frames.json">
//   <meta name="piece:net"   content="storage.googleapis.com">
//   <meta name="piece:size"  content="fill 4/3">
//
// A list is split on commas when it has one, else on whitespace, so a file
// name with a space in it is written `a b.json, c.json`. The same meta may be
// given more than once; the lists join.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** The closed list of needs. Anything else is refused. */
export const NEEDS = Object.freeze(['camera', 'microphone', 'midi', 'storage', 'fullscreen']);
/** Needs that a declaration alone does not open: each also needs a line in grants.json. */
export const GRANTED_NEEDS = Object.freeze(['camera', 'microphone', 'midi']);
/** The metas a piece may carry. */
export const METAS = Object.freeze(['needs', 'files', 'net', 'size']);

export const GRANTS_FILE = '_ops/rich-face/grants.json';
export const LIBS_FILE = '_ops/rich-face/libs.json';

const decodeEntities = (s) => String(s)
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** The attributes of one start tag's inside, as a lower-cased-name map. */
export function attrsOf(tagInside) {
  const out = {};
  const re = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(tagInside))) out[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
  return out;
}

/** A content list: split on commas when it has one, else on whitespace. */
export function splitList(s) {
  const t = String(s || '').trim();
  if (!t) return [];
  return (t.includes(',') ? t.split(',') : t.split(/\s+/)).map((x) => x.trim()).filter(Boolean);
}

/** The text before <body> (or the whole page when it has none): where a declaration counts. */
function headOf(html) {
  const s = String(html);
  const b = /<body[\s>]/i.exec(s);
  return b ? s.slice(0, b.index) : s;
}

/**
 * Normalise a declaration given as lists or strings — the manifest's `contract`
 * block, or the metas read from a head — into one shape, with every problem
 * named. Unknown needs and a malformed size are problems; the rest is kept.
 * @returns {{ needs: string[], files: string[], net: string[], size: object|null, problems: {rule: string, detail: string}[] }}
 */
export function normalize(raw) {
  const problems = [];
  const list = (v) => (Array.isArray(v) ? v.flatMap((x) => splitList(x)) : splitList(v));
  const needs = [];
  for (const n of list(raw.needs).map((x) => x.toLowerCase())) {
    if (!NEEDS.includes(n)) problems.push({ rule: 'needs-unknown', detail: `“${n}” is not a need (the list is ${NEEDS.join(', ')})` });
    else if (!needs.includes(n)) needs.push(n);
  }
  const files = [...new Set(list(raw.files).map((f) => { try { return decodeURIComponent(f); } catch { return f; } }))];
  const net = [];
  for (const h of list(raw.net).map((x) => x.toLowerCase())) {
    if (!/^(\*\.)?[a-z0-9.-]+(:\d+)?$/.test(h)) problems.push({ rule: 'net-malformed', detail: `“${h}” is not a host (write the host alone, no scheme or path)` });
    else if (!net.includes(h)) net.push(h);
  }
  let size = null;
  const sz = Array.isArray(raw.size) ? raw.size.join(' ') : raw.size;
  if (sz != null && String(sz).trim()) {
    size = parseSize(String(sz));
    if (!size) problems.push({ rule: 'size-malformed', detail: `“${String(sz).trim()}” is not a size (write flow, or fill and a ratio like 4/3)` });
  }
  return { needs, files, net, size, problems };
}

/** `flow` | `fill 4/3` | `fill 1.5` → { mode, ratio } or null. */
export function parseSize(s) {
  const t = String(s).trim().toLowerCase();
  if (t === 'flow') return { mode: 'flow', ratio: null, text: 'flow' };
  const m = /^fill\s+(\d+(?:\.\d+)?)(?:\s*[/:]\s*(\d+(?:\.\d+)?))?$/.exec(t);
  if (!m) return null;
  const ratio = m[2] ? Number(m[1]) / Number(m[2]) : Number(m[1]);
  return ratio > 0 && Number.isFinite(ratio) ? { mode: 'fill', ratio, text: t } : null;
}

/**
 * The declaration a page carries in its head, or null when it carries none.
 * `metas` keeps what was written, for the report.
 */
export function readDeclaration(html) {
  const head = headOf(html);
  const raw = { needs: [], files: [], net: [], size: [] };
  const unknown = [];
  let any = false;
  for (const m of head.matchAll(/<meta\b([^>]*)>/gi)) {
    const a = attrsOf(m[1]);
    const name = (a.name || '').toLowerCase();
    if (!name.startsWith('piece:')) continue;
    any = true;
    const key = name.slice('piece:'.length);
    if (METAS.includes(key)) raw[key].push(a.content || '');
    else unknown.push(key);
  }
  if (!any) return null;
  const d = normalize({ ...raw, size: raw.size.length ? raw.size[raw.size.length - 1] : null });
  for (const k of unknown) d.problems.push({ rule: 'meta-unknown', detail: `piece:${k} is not part of the contract (${METAS.map((x) => `piece:${x}`).join(', ')})` });
  if (raw.size.length > 1) d.problems.push({ rule: 'size-malformed', detail: 'piece:size is given more than once' });
  d.source = 'head';
  return d;
}

/** A manifest piece's `contract` block, normalised, or null. */
export function manifestContract(piece) {
  if (!piece || piece.contract == null) return null;
  if (typeof piece.contract !== 'object' || Array.isArray(piece.contract)) {
    return { needs: [], files: [], net: [], size: null, source: 'manifest', problems: [{ rule: 'contract-malformed', detail: 'a contract block is an object: { needs, files, net, size }' }] };
  }
  const d = normalize(piece.contract);
  for (const k of Object.keys(piece.contract)) if (!METAS.includes(k)) d.problems.push({ rule: 'meta-unknown', detail: `“${k}” is not part of a contract block (${METAS.join(', ')})` });
  d.source = 'manifest';
  return d;
}

function readJson(root, rel) {
  const abs = join(root, rel);
  if (!existsSync(abs)) return { missing: true };
  try { return { data: JSON.parse(readFileSync(abs, 'utf8')) }; } catch (e) { return { error: `${rel} is not JSON: ${e.message}` }; }
}

/**
 * grants.json — one line per piece, written only on Loudon's yes:
 *   { "grants": [ { "piece": "<palace path>", "needs": ["camera"], "net": ["host"], "yes": "YYYY-MM-DD", "why": "…" } ] }
 * Returns a lookup by piece path: { needs: Set, net: Set }, plus any problem reading it.
 */
export function loadGrants(root, text = null) {
  const r = text != null ? (() => { try { return { data: JSON.parse(text) }; } catch (e) { return { error: `${GRANTS_FILE} is not JSON: ${e.message}` }; } })() : readJson(root, GRANTS_FILE);
  const byPiece = new Map();
  const problems = [];
  if (r.error) problems.push(r.error);
  const rows = Array.isArray(r.data?.grants) ? r.data.grants : r.data && !r.missing ? (problems.push(`${GRANTS_FILE} has no "grants" list`), []) : [];
  for (const g of rows) {
    if (!g || typeof g.piece !== 'string') { problems.push(`${GRANTS_FILE}: a grant names no piece`); continue; }
    const cur = byPiece.get(g.piece) || { needs: new Set(), net: new Set() };
    for (const n of splitList(Array.isArray(g.needs) ? g.needs.join(',') : g.needs)) cur.needs.add(n.toLowerCase());
    for (const h of splitList(Array.isArray(g.net) ? g.net.join(',') : g.net)) cur.net.add(h.toLowerCase());
    byPiece.set(g.piece, cur);
  }
  return { present: !r.missing, byPiece, problems, get: (p) => byPiece.get(p) || { needs: new Set(), net: new Set() } };
}

/**
 * libs.json — the library shelf, an exact version and an SRI hash per library:
 *   { "libs": [ { "name": "d3", "version": "7.9.0", "url": "https://…/d3@7.9.0/dist/d3.min.js", "integrity": "sha384-…" } ] }
 * Returns a lookup by URL and the set of hosts on the shelf.
 */
export function loadShelf(root, text = null) {
  const r = text != null ? (() => { try { return { data: JSON.parse(text) }; } catch (e) { return { error: `${LIBS_FILE} is not JSON: ${e.message}` }; } })() : readJson(root, LIBS_FILE);
  const byUrl = new Map();
  const hosts = new Set();
  const problems = [];
  if (r.error) problems.push(r.error);
  for (const l of Array.isArray(r.data?.libs) ? r.data.libs : []) {
    if (!l || typeof l.url !== 'string') { problems.push(`${LIBS_FILE}: a library names no url`); continue; }
    byUrl.set(l.url, l);
    try { hosts.add(new URL(l.url).host); } catch { problems.push(`${LIBS_FILE}: “${l.url}” is not a URL`); }
  }
  return { present: !r.missing && !r.error, byUrl, hosts, problems };
}

/** Is this version segment of a CDN URL exact? `@7.9.0`, `/7.8.5/`, three's `r128` are; `@7`, `@0.6`, none are not. */
export function exactVersion(url) {
  let path;
  try { path = new URL(url, 'https://x').pathname; } catch { path = String(url); }
  const m = /(?:@|\/)v?(\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)(?=\/|$)/.exec(path) || /\/(r\d+)(?=\/)/.exec(path);
  return m ? m[1] : null;
}

/** Hosts a piece may load from without a pin: Google's fonts, which the house standard allows. */
export const FONT_HOSTS = Object.freeze(['fonts.googleapis.com', 'fonts.gstatic.com']);

/** The folder every piece may load from without declaring it (Flocking's pieces load palace-tokens.js there). */
export const SHARED_DIRS = Object.freeze(['_ops/loudon-live/design-system/']);
