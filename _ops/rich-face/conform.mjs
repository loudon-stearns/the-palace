#!/usr/bin/env node
// conform.mjs — the piece checker. A piece declares in its own <head> what it
// needs from its host; this reads every piece against that declaration and
// against what its code actually does, so no one has to remember a rule.
// The declaration and the grants are read by contract.mjs, the same reader the
// piece origin frames a piece by, so a piece is judged by the reading it is
// served by. Plan: STIGMERGY — spec — rich-face pieces § 5.
//
//   node _ops/rich-face/conform.mjs "<Entry>"     every piece the entry's rich face shows
//   node _ops/rich-face/conform.mjs --all         every web page the palace keeps
//   node _ops/rich-face/conform.mjs <a.html> …    named pages
//     --static        the static checks only, no browser
//     --browser       add the headless pass to --all (an entry gets it by default)
//     --enforce       exit 1 on any error (default: report-only, exit 0)
//     --json          machine output       --out <file>   also write the report
//     --root <dir>    the palace (default: this checkout)
//
// Static checks, for each page:
//   the declaration    needs from the closed list, a size it can read, hosts as hosts
//   needs vs code      camera, microphone, midi, storage and fullscreen the code
//                      uses but doesn't declare (or declares and doesn't use); a
//                      granted need or a host with no line in grants.json; every
//                      file the piece loads, declared and present beside it
//   pins               a CDN script at an exact version, with its SRI hash, and on
//                      the shelf (libs.json) once there is one
//   root-absolute URLs a /path lands on whatever origin serves the piece
//   addressing         how a rich face names its files (a bare name found only by
//                      the palace-wide lookup worked by luck), and how a piece
//                      addresses its page (postMessage to a fixed origin, reaching
//                      into the parent)
// The browser pass, at 760 and 1130 px in headless Chromium, the piece served
// the way the rich face serves it (kit injected, sandboxed): a clean console,
// a height within 3 s, rich:play after a click when the piece makes sound, and
// silence after rich:hush.
//
// Each piece comes out marked introduced (it declares, and passes), pre-contract
// (it declares nothing), or errored. A gathered proof whose manifest entry
// carries the declaration is introduced, and marked owed: the manifest speaks
// for it.

import { readFileSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import http from 'node:http';
import { join, dirname, resolve, posix } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { makeResolver } from './resolve.mjs';
import { richReferences, createRichHandler } from './rich-handler.mjs';
import { checkRequest } from '../stigmergy/app/server/request-guard.js';
import {
  readDeclaration, contractOf, declaredPath, readGrants,
  GRANTED_NEEDS, GRANTS_FILE, SHELF_FILE, DESIGN_SYSTEM,
} from './contract.mjs';

// Hosts a piece may load from without a pin: Google's fonts, which the house standard allows.
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
// The folders every piece may load from without declaring them (the piece origin serves them to all).
const SHARED_DIRS = [DESIGN_SYSTEM];
const METAS = ['needs', 'files', 'net', 'size'];

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

/** Is this version segment of a CDN URL exact? `@7.9.0`, `/7.8.5/`, three's `r128` are; `@7`, `@0.6`, none are not. */
export function exactVersion(url) {
  let path;
  try { path = new URL(url, 'https://x').pathname; } catch { path = String(url); }
  const m = /(?:@|\/)v?(\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)(?=\/|$)/.exec(path) || /\/(r\d+)(?=\/)/.exec(path);
  return m ? m[1] : null;
}

/**
 * The library shelf (libs.json), as the pins read it: each library's exact URL
 * and its SRI hash. The piece origin reads the same file for its CDN origins
 * (contract.mjs shelfOrigins); its shape is settled with the migration (spec § 9):
 *   { "libs": [ { "name": "d3", "version": "7.9.0", "url": "https://…/d3@7.9.0/dist/d3.min.js", "integrity": "sha384-…" } ] }
 */
export function loadShelf(root) {
  let data;
  try { data = JSON.parse(readFileSync(join(root, ...SHELF_FILE.split('/')), 'utf8')); } catch { return { present: false, byUrl: new Map() }; }
  const byUrl = new Map();
  for (const l of Array.isArray(data?.libs) ? data.libs : []) if (l && typeof l.url === 'string') byUrl.set(l.url, l);
  return { present: true, byUrl };
}

// contract.mjs names a problem in words; the checker files it under a rule.
const problemRule = (p) => (/is not a need/.test(p) ? 'needs-unknown' : /is not a host/.test(p) ? 'net-malformed' : /^size/.test(p) ? 'size-malformed' : 'contract-malformed');

const HERE = dirname(fileURLToPath(import.meta.url));
export const CONFIG_FILE = '_ops/rich-face/conform.json';
const STIGMERGY_APP = resolve(HERE, '../stigmergy/app');
const MANIFEST = / — rich\.json$/;
const PAGE = /\.html?$/i;
const WIDTHS = [760, 1130];
const HEIGHT_WAIT_MS = 3000;
const HUSH_WAIT_MS = 1500;

// Every rule, its level, and what it means. `soft`: a pre-contract piece
// promised nothing, so the rule only warns there.
export const RULES = {
  'needs-unknown':     { level: 'error', family: 'declaration', what: 'a need outside the closed list' },
  'net-malformed':     { level: 'error', family: 'declaration', what: 'a piece:net entry that is not a host' },
  'size-malformed':    { level: 'error', family: 'declaration', what: 'a piece:size that is neither flow nor fill <ratio>' },
  'meta-unknown':      { level: 'warn',  family: 'declaration', what: 'a piece: meta the contract does not have' },
  'contract-malformed':{ level: 'error', family: 'declaration', what: "a manifest contract block that isn't { needs, files, net, size }" },
  'contract-both':     { level: 'warn',  family: 'declaration', what: 'the piece declares in its head and its manifest entry carries a contract; the head wins' },
  'need-undeclared':   { level: 'error', family: 'needs', soft: true, what: 'the code uses a need the piece does not declare' },
  'need-unused':       { level: 'warn',  family: 'needs', what: 'a declared need the code does not show' },
  'grant-missing':     { level: 'error', family: 'needs', what: 'a declared camera, microphone, midi or host with no line in grants.json' },
  'file-undeclared':   { level: 'error', family: 'needs', soft: true, what: 'the piece loads a file beside it that piece:files does not name' },
  'file-missing':      { level: 'error', family: 'needs', what: 'a file the piece loads or declares is not in the palace' },
  'file-outside':      { level: 'error', family: 'needs', what: 'a file the piece names leads outside the palace, into a hidden folder, or to an ignored file' },
  'file-ignored':      { level: 'warn',  family: 'needs', what: 'a file the piece loads is one git ignores (renders stay on the Mac), so it works only where that file sits' },
  'net-undeclared':    { level: 'error', family: 'needs', soft: true, what: 'the code reaches a host piece:net does not name' },
  'cdn-unpinned':      { level: 'error', family: 'pins', what: 'a CDN script or stylesheet not at an exact version' },
  'cdn-no-sri':        { level: 'warn',  family: 'pins', what: 'a CDN script or stylesheet with no integrity hash' },
  'cdn-off-shelf':     { level: 'error', family: 'pins', what: 'a CDN library not on the shelf (libs.json)' },
  'cdn-sri-mismatch':  { level: 'error', family: 'pins', what: "a CDN library whose integrity is not the shelf's" },
  'url-root-absolute': { level: 'warn',  family: 'root-absolute', what: 'a /path lands on whatever origin serves the piece; the read view serves it under files/' },
  'ref-missing':       { level: 'error', family: 'addressing', what: 'a file the rich face names does not resolve (the page shows a labelled box)' },
  'ref-loose':         { level: 'warn',  family: 'addressing', what: "a bare name found only by the palace-wide lookup, outside the entry's bundle; give its path" },
  'post-target':       { level: 'warn',  family: 'addressing', what: "a message to the page addressed to one origin; it never arrives once the piece leaves the page's origin" },
  'parent-reach':      { level: 'warn',  family: 'addressing', what: "the code reaches into its parent page, which a piece's origin never allows" },
  'kit-bundled':       { level: 'warn',  family: 'kit', what: 'the piece carries a copy of the kit; the server injects it' },
  'review-layer':      { level: 'warn',  family: 'kit', what: "the review-layer kit is in a piece; its notes land in storage that won't keep" },
  'load-failed':       { level: 'error', family: 'browser', what: 'the piece did not load in the browser' },
  'console-error':     { level: 'error', family: 'browser', what: 'an error in the console or a script error the kit reported' },
  'sandbox-blocked':   { level: 'warn',  family: 'browser', what: 'an error the sandbox causes today (storage, a fetch beside it, the camera); the piece origin should cure it' },
  'error-after-block': { level: 'warn',  family: 'browser', what: 'an error after a load the sandbox blocked; it may only follow from that block, so judge it again on the piece origin' },
  'height-silent':     { level: 'error', family: 'browser', what: 'no rich:height within 3 s' },
  'play-silent':       { level: 'warn',  family: 'browser', what: 'the piece makes sound but no rich:play arrived after a click' },
  'hush-loud':         { level: 'error', family: 'browser', what: 'still sounding after rich:hush' },
};

// ── reading the palace ──────────────────────────────────────────────────────

/** The checker's settings (conform.json): enforcement, pages that are never pieces, reviewed exceptions. */
export function loadConfig(root, text = null) {
  let c = {};
  try { c = JSON.parse(text ?? readFileSync(join(root, CONFIG_FILE), 'utf8')); } catch { c = {}; }
  const notPieces = Array.isArray(c.not_pieces) ? c.not_pieces : [];
  const allow = Array.isArray(c.allow) ? c.allow : [];
  return {
    enforce: { push: !!c.enforce?.push, build: !!c.enforce?.build },
    isPiece: (p) => !notPieces.some((n) => (n.path && n.path === p) || (n.prefix && p.startsWith(n.prefix)) || (n.pattern && new RegExp(n.pattern).test(p))),
    allows: (f) => allow.some((a) => a.piece === f.piece && a.rule === f.rule && (a.key == null || a.key === f.key)),
  };
}

/** Every file git keeps here, the resolver's own index: tracked, plus new files git doesn't ignore (or tracked only). */
export function palaceFiles(root, { tracked = false } = {}) {
  const which = tracked ? ['--cached'] : ['--cached', '--others', '--exclude-standard'];
  return execFileSync('git', ['-c', 'core.quotepath=off', 'ls-files', '-z', ...which],
    { cwd: root, maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }).toString('utf8').split('\0').filter(Boolean);
}

/** Everything one run needs: the resolver, the grants, the shelf, the settings, and a reader. */
export function makeContext(root, { tracked = false, files = null, resolver = null, gitRoot = null } = {}) {
  const ROOT = resolve(root);
  const list = files || palaceFiles(ROOT, { tracked });
  return {
    root: ROOT,
    gitRoot: gitRoot || ROOT,
    files: list,
    resolver: resolver || makeResolver(ROOT, files ? { files, tracked: true } : { tracked }),
    grants: (() => { const g = readGrants(ROOT); return { error: g.error, get: (p) => g.byPiece.get(p) || { allow: new Set(), net: new Set() } }; })(),
    shelf: loadShelf(ROOT),
    config: loadConfig(ROOT),
    read: (rel) => readFileSync(join(ROOT, ...rel.split('/')), 'utf8'),
  };
}

// ── a rich face: what it names, and how ─────────────────────────────────────

/** Every piece in a manifest, by the name it is written with. */
function manifestPieces(manifest) {
  const out = new Map();
  for (const s of manifest?.sections || []) for (const p of s.pieces || []) if (p && typeof p.file === 'string') out.set(p.file, p);
  return out;
}

/**
 * One rich face: its references, where each landed, and the faults in how it
 * names them. `pieces` are the web pages it shows, each with its manifest entry.
 */
export function readFace(ctx, mdRel, manifestRel) {
  const { resolver } = ctx;
  let text = '', manifest = null;
  const findings = [];
  try { text = ctx.read(mdRel); } catch { /* reported as the entry missing below */ }
  if (manifestRel) {
    try { manifest = JSON.parse(ctx.read(manifestRel)); } catch (e) {
      findings.push(finding('contract-malformed', manifestRel, 'manifest', `the manifest is not JSON: ${e.message}`));
    }
  }
  const byName = manifestPieces(manifest);
  const bundle = resolver.bundleOf(mdRel);
  const pieces = [];
  for (const [name, r] of richReferences(resolver, mdRel, text, manifest)) {
    if (!r.ok) { findings.push(finding('ref-missing', mdRel, name, r.label)); continue; }
    if (!name.includes('/') && !r.path.startsWith(bundle + '/')) {
      findings.push(finding('ref-loose', mdRel, name, `“${name}” is found at ${r.path} only by looking across the palace; write “/${r.path}”`));
    }
    if (PAGE.test(r.path)) pieces.push({ path: r.path, name, manifestPiece: byName.get(name) || null });
  }
  return { entry: posix.basename(mdRel, '.md'), md: mdRel, manifest: manifestRel, bundle, pieces, findings };
}

/** Every rich face the palace keeps: each manifest, with the entry it belongs to. */
export function allFaces(ctx) {
  const faces = [];
  for (const m of ctx.files.filter((p) => MANIFEST.test(p))) {
    let entryName = posix.basename(m).replace(MANIFEST, '');
    try { const j = JSON.parse(ctx.read(m)); if (typeof j.entry === 'string' && j.entry.trim()) entryName = j.entry.trim(); } catch { /* readFace names it */ }
    const md = ctx.resolver.findEntry(entryName);
    if (!md) { faces.push({ entry: entryName, md: null, manifest: m, bundle: null, pieces: [], findings: [finding('ref-missing', m, entryName, `no entry “${entryName}” for this manifest`)] }); continue; }
    const e = ctx.resolver.entry(entryName);
    if (e && e.manifest && e.manifest !== m) continue; // a bundle's manifest wins over a workshop copy
    faces.push(readFace(ctx, md, m));
  }
  return faces;
}

/** The rich face of one entry, by name. */
export function entryFace(ctx, name) {
  const e = ctx.resolver.entry(name);
  if (!e) return null;
  return readFace(ctx, e.md, e.manifest);
}

// ── reading a page ──────────────────────────────────────────────────────────

const blank = (s) => s.replace(/[^\n]/g, ' ');

/** JS with its comments blanked to spaces (strings, templates and regexes kept), so offsets stay put. */
export function blankJsComments(code) {
  const out = code.split('');
  let i = 0, prev = '';
  const n = code.length;
  const regexAllowed = () => !prev || /[(,=:[!&|?{};+\-*%<>~^]/.test(prev) || /\b(return|typeof|case|do|else|in|of|new|delete|void|throw)$/.test(code.slice(Math.max(0, i - 8), i).trimEnd());
  while (i < n) {
    const c = code[i], d = code[i + 1];
    if (c === '/' && d === '/') { while (i < n && code[i] !== '\n') out[i++] = ' '; continue; }
    if (c === '/' && d === '*') { const e = code.indexOf('*/', i + 2); const end = e === -1 ? n : e + 2; for (; i < end; i++) if (code[i] !== '\n') out[i] = ' '; continue; }
    if (c === '"' || c === "'" || c === '`') {
      i++;
      while (i < n && code[i] !== c) { if (code[i] === '\\') i++; else if (c !== '`' && code[i] === '\n') break; i++; }
      i++; prev = c; continue;
    }
    if (c === '/' && regexAllowed()) {
      let j = i + 1, cls = false;
      while (j < n && code[j] !== '\n') { if (code[j] === '\\') j++; else if (code[j] === '[') cls = true; else if (code[j] === ']') cls = false; else if (code[j] === '/' && !cls) break; j++; }
      if (j < n && code[j] === '/') { i = j + 1; prev = '/'; continue; }
    }
    if (!/\s/.test(c)) prev = c;
    i++;
  }
  return out.join('');
}

/** The arguments of a call whose "(" is at `open`, split at top-level commas. */
export function callArgs(code, open) {
  const args = [];
  let depth = 0, start = open + 1, i = open + 1, q = null;
  for (; i < code.length; i++) {
    const c = code[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') {
      if (depth === 0) { args.push(code.slice(start, i).trim()); return args.filter((a, k) => a || k < args.length - 1); }
      depth--;
    } else if (c === ',' && depth === 0) { args.push(code.slice(start, i).trim()); start = i + 1; }
  }
  return args;
}

const lineAt = (s, i) => { let n = 1; for (let k = 0; k < i && k < s.length; k++) if (s.charCodeAt(k) === 10) n++; return n; };
const STRING = String.raw`(['"\x60])((?:(?!\1)[^\\\n]|\\.)*)\1`;
// A string handed to a call that loads it: fetch, import, workers, worklets,
// Audio, the loaders of p5 and three (loadImage, loader.load, …), new URL(…).
const LOAD_CALLS = [
  { kind: 'connect', re: new RegExp(String.raw`\bfetch\s*\(\s*` + STRING, 'g') },
  { kind: 'connect', re: new RegExp(String.raw`\bnew\s+(?:WebSocket|EventSource)\s*\(\s*` + STRING, 'g') },
  { kind: 'connect', re: new RegExp(String.raw`\.open\s*\(\s*['"][A-Za-z]+['"]\s*,\s*` + STRING, 'g') },
  { kind: 'module',  re: new RegExp(String.raw`\bimport\s*\(\s*` + STRING, 'g') },
  { kind: 'module',  re: new RegExp(String.raw`\bimport\s+(?:[\w*{}\s,$]+\s+from\s+)?` + STRING, 'g') },
  { kind: 'script',  re: new RegExp(String.raw`\bnew\s+(?:Shared)?Worker\s*\(\s*` + STRING, 'g') },
  { kind: 'script',  re: new RegExp(String.raw`\baddModule\s*\(\s*` + STRING, 'g') },
  { kind: 'script',  re: new RegExp(String.raw`\bimportScripts\s*\(\s*` + STRING, 'g') },
  { kind: 'media',   re: new RegExp(String.raw`\bnew\s+Audio\s*\(\s*` + STRING, 'g') },
  { kind: 'media',   re: new RegExp(String.raw`\bload[A-Z]\w*\s*\(\s*` + STRING, 'g'), fileLike: true },
  { kind: 'media',   re: new RegExp(String.raw`\.load\s*\(\s*` + STRING, 'g'), fileLike: true },
  { kind: 'media',   re: new RegExp(String.raw`\.src\s*=\s*` + STRING, 'g'), fileLike: true },
  { kind: 'media',   re: new RegExp(String.raw`\bnew\s+URL\s*\(\s*` + STRING + String.raw`\s*,\s*(?:import\.meta\.url|location|document\.baseURI)`, 'g') },
];
// The tags that load what they name, and the attribute that names it.
const LOAD_TAGS = { script: 'src', img: 'src', audio: 'src', video: 'src', source: 'src', track: 'src', iframe: 'src', embed: 'src', object: 'data', input: 'src' };

/** Where a URL written in a piece goes: null (nothing to fetch), external, root-absolute, or relative. */
export function classify(u) {
  const s = String(u || '').trim();
  if (!s || s.startsWith('#') || /^%23/i.test(s) || /^(data|blob|javascript|about|mailto|tel|chrome|obsidian):/i.test(s)) return null;
  // Built at run time or filled in later: a template's ${…}, a string joined
  // with +, a {{placeholder}} or __PLACEHOLDER__. Nothing to fetch as written.
  if (/\$\{|^\$|['"`]\s*\+|\+\s*['"`]|\{\{|^__[A-Z0-9_]+__$/.test(s)) return null;
  if (/^(https?|wss?):\/\//i.test(s) || s.startsWith('//')) {
    try { const url = new URL(s.startsWith('//') ? 'https:' + s : s); return { where: 'external', url: url.href, host: url.host.toLowerCase(), scheme: url.protocol }; } catch { return null; }
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return null;
  const path = s.split(/[?#]/)[0];
  if (!path) return null;
  let dec = path; try { dec = decodeURI(path); } catch { /* keep as written */ }
  return s.startsWith('/') ? { where: 'root', path: dec } : { where: 'relative', path: dec };
}

/**
 * What a page does, read from its source: the URLs it loads (by kind, with
 * line), the needs its code shows, how it posts to its page.
 */
export function scanPage(html) {
  const src = String(html).replace(/<!--[\s\S]*?-->/g, blank);
  const loads = [];
  const add = (kind, raw, at, extra = {}) => { const c = classify(raw); if (c) loads.push({ kind, raw, line: lineAt(src, at), ...c, ...extra }); };

  // Inline code, comments blanked, offsets kept: script bodies and on* handlers.
  let code = '';
  const segments = [];
  for (const m of src.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const a = attrsOf(m[1]);
    const type = (a.type || '').toLowerCase();
    const at = m.index + m[0].indexOf('>') + 1;
    if (type === 'importmap') {
      try { const map = JSON.parse(m[2]); for (const u of Object.values({ ...(map.imports || {}), ...Object.assign({}, ...Object.values(map.scopes || {})) })) add('module', u, at, { integrity: map.integrity?.[u] || null }); } catch { /* not JSON */ }
      continue;
    }
    if (type && !/(java|ecma)script|module|babel|jsx/.test(type)) continue; // shaders, JSON, templates
    segments.push({ at, body: blankJsComments(m[2]) });
  }
  for (const m of src.matchAll(/<[a-z][\w-]*\b[^>]*?\son[a-z]+\s*=\s*("([^"]*)"|'([^']*)')/gi)) segments.push({ at: m.index, body: m[2] ?? m[3] ?? '' });
  code = segments.map((s) => s.body).join('\n;\n');

  // Tags that load — outside scripts and styles, where a tag is only a string or a comment.
  const tags = src.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)/gi, (w, a, b, c) => a + blank(b) + c)
    .replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style\s*>)/gi, (w, a, b, c) => a + blank(b) + c);
  for (const m of tags.matchAll(/<([a-z]+)\b([^>]*)>/gi)) {
    const tag = m[1].toLowerCase();
    const a = attrsOf(m[2]);
    if (tag === 'link') {
      const rel = (a.rel || '').toLowerCase();
      if (a.href && /stylesheet|modulepreload|preload|icon|manifest/.test(rel)) add(/stylesheet/.test(rel) ? 'style' : /modulepreload/.test(rel) ? 'module' : 'media', a.href, m.index, { integrity: a.integrity || null, tag });
      continue;
    }
    const attr = LOAD_TAGS[tag];
    if (attr && a[attr] != null) add(tag === 'script' ? 'script' : 'media', a[attr], m.index, { integrity: a.integrity || null, tag });
    if ((tag === 'video') && a.poster) add('media', a.poster, m.index, { tag });
  }
  // CSS url(…) in <style> and style="".
  for (const m of src.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>|\sstyle\s*=\s*"([^"]*)"/gi)) {
    const css = (m[1] ?? m[2] ?? '').replace(/\/\*[\s\S]*?\*\//g, blank);
    const base = m.index;
    for (const u of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)) add('media', u[2], base + u.index, { tag: 'css' });
    for (const u of css.matchAll(/@import\s+(?:url\()?\s*(['"])([^'"]+)\1/gi)) add('style', u[2], base + u.index, { tag: 'css' });
  }
  // Strings the code hands to something that loads them.
  for (const s of segments) {
    for (const { kind, re, fileLike } of LOAD_CALLS) {
      for (const m of s.body.matchAll(re)) {
        // loadPreset('smooth') names a preset, not a file: a generic loader's
        // string counts only when it reads as a file (an extension) or a URL.
        if (fileLike && !/^(https?:|wss?:|\/\/)/i.test(m[2]) && !/\.[A-Za-z0-9]{1,6}(?:[?#].*)?$/.test(m[2])) continue;
        add(kind, m[2], s.at + m.index, { tag: 'code' });
      }
    }
  }

  // The needs the code shows.
  const uses = new Map(); // need → first line
  const use = (need, at, how) => { if (!uses.has(need)) uses.set(need, { line: lineAt(src, at), how }); };
  for (const s of segments) {
    const b = s.body;
    for (const m of b.matchAll(/\b(?:getUserMedia|webkitGetUserMedia|mozGetUserMedia)\s*\(/g)) {
      const args = callArgs(b, m.index + m[0].length - 1);
      const c = (args[0] || '').replace(/\s+/g, ' ');
      const video = /\bvideo\b/.test(c) && !/\bvideo\s*:\s*false\b/.test(c);
      const audio = /\baudio\b/.test(c) && !/\baudio\s*:\s*false\b/.test(c);
      if (video || (!audio && !/^\{/.test(c))) use('camera', s.at + m.index, video ? 'getUserMedia({ video })' : `getUserMedia(${c.slice(0, 30)}) — constraints not written in place; read as the camera`);
      if (audio) use('microphone', s.at + m.index, 'getUserMedia({ audio })');
    }
    for (const [need, re] of [
      ['midi', /\brequestMIDIAccess\s*\(/g],
      ['storage', /\b(?:localStorage|sessionStorage|indexedDB)\b/g],
      ['fullscreen', /\b(?:requestFullscreen|webkitRequestFullscreen|webkitRequestFullScreen|mozRequestFullScreen|msRequestFullscreen)\b/g],
    ]) { const m = re.exec(b); if (m) use(need, s.at + m.index, m[0].replace(/\s*\($/, '')); }
  }

  // How it addresses its page.
  const posts = [];
  const reaches = [];
  for (const s of segments) {
    const b = s.body;
    for (const m of b.matchAll(/\b(?:window\.|self\.)?(parent|top|opener)\s*\.\s*postMessage\s*\(/g)) {
      const args = callArgs(b, m.index + m[0].length - 1);
      const target = (args[1] || '').trim();
      const ok = /^(['"`])\*\1$/.test(target) || /targetOrigin\s*:\s*(['"`])\*\1/.test(target);
      if (!ok) posts.push({ line: lineAt(src, s.at + m.index), to: m[1], target: target || '(none)' });
    }
    for (const m of b.matchAll(/\b(?:window\.)?(?:parent|top)\s*\.\s*(document|location|frames|localStorage|sessionStorage|history)\b|\bwindow\.frameElement\b/g)) {
      reaches.push({ line: lineAt(src, s.at + m.index), what: m[0].replace(/\s+/g, '') });
    }
  }

  // Sound: an audio context (Tone's included), an Audio, an <audio>, or a
  // <video> playing a file. A <video> fed by the camera makes none.
  const sound = /\b(?:AudioContext|webkitAudioContext|Tone\.(?:start|Synth|Player|Transport|context)|new\s+Audio\s*\()/.test(code)
    || /<audio\b/i.test(tags) || /<video\b(?![^>]*\bmuted\b)[^>]*\bsrc\s*=|<video\b(?![^>]*\bmuted\b)[^>]*>\s*<source\b/i.test(tags);
  return {
    loads, uses, posts, reaches, sound,
    kit: /\bdata-rich-kit\s*=/.test(src),
    reviewLayer: /review-layer(?:\.js|\/)/.test(src),
  };
}

// ── judging a page ──────────────────────────────────────────────────────────

function finding(rule, piece, key, detail, line = 0) {
  const r = RULES[rule] || { level: 'warn' };
  return { rule, level: r.level, family: r.family, piece, key: String(key ?? ''), detail, line };
}

/**
 * Judge one page against its declaration and its code.
 * @param ctx  makeContext(...)
 * @param t    { path, via: [{ entry, name, manifestPiece }] }
 */
export function checkPage(ctx, t, html = null) {
  const piece = t.path;
  const findings = [];
  const F = (rule, key, detail, line) => findings.push(finding(rule, piece, key, detail, line));
  let src;
  try { src = html ?? ctx.read(piece); } catch (e) {
    F('file-missing', piece, `cannot read ${piece}: ${e.message}`);
    return result(ctx, t, null, null, findings);
  }

  // The declaration: the piece's own, or its manifest entry's contract block
  // for a gathered proof (contract.mjs contractOf: the piece's own wins).
  const head = readDeclaration(src);
  const mp = (t.via || []).map((v) => v.manifestPiece).find((p) => p && p.contract != null) || null;
  const raw = mp ? mp.contract : null;
  const rawBad = raw != null && (typeof raw !== 'object' || Array.isArray(raw));
  const c = contractOf({ html: src, manifestContract: rawBad ? null : raw });
  const decl = c.source ? c : null;
  for (const p of c.problems) F(problemRule(p), p, p);
  if (rawBad) F('contract-malformed', 'contract', 'the manifest entry\'s contract is not an object: { needs, files, net, size }');
  if (head && raw != null) F('contract-both', 'contract', 'the head declares, and the manifest entry carries a contract too; the head wins');
  if (c.source === 'manifest') for (const k of Object.keys(raw)) if (!METAS.includes(k)) F('meta-unknown', k, `“${k}” is not part of a contract block (${METAS.join(', ')})`);
  if (head) {
    const end = src.search(/<\/head\s*>|<body[\s>]/i);
    for (const m of src.slice(0, end < 0 ? src.length : end).matchAll(/<meta\b([^>]*)>/gi)) {
      const name = (attrsOf(m[1]).name || '').toLowerCase();
      if (name.startsWith('piece:') && !METAS.includes(name.slice(6))) F('meta-unknown', name, `${name} is not part of the contract (${METAS.map((x) => `piece:${x}`).join(', ')}), so nothing reads it`);
    }
  }
  const declared = !!decl;
  const soft = (rule) => (RULES[rule].soft && !declared ? 'warn' : RULES[rule].level);
  const S = (rule, key, detail, line) => findings.push({ ...finding(rule, piece, key, detail, line), level: soft(rule) });

  const scan = scanPage(src);
  const dir = posix.dirname(piece);
  const needs = new Set(decl?.needs || []);

  // Needs against the code.
  for (const [need, u] of scan.uses) {
    if (!needs.has(need)) S('need-undeclared', need, declared ? `uses ${need} (${u.how}) and does not declare it` : `uses ${need} (${u.how}); a declaration would say piece:needs ${need}`, u.line);
  }
  for (const need of needs) {
    if (!scan.uses.has(need)) F('need-unused', need, `declares ${need}; the code does not show it (a library may use it; say so in allow if so)`);
  }
  if (declared) {
    const g = ctx.grants.get(piece);
    for (const need of needs) if (GRANTED_NEEDS.includes(need) && !g.allow.has(need)) F('grant-missing', need, `needs ${need}, and ${GRANTS_FILE} has no line for this piece (written only on Loudon's yes)`);
    for (const host of decl.net) if (!g.net.has(host)) F('grant-missing', host, `reaches ${host}, and ${GRANTS_FILE} has no line for it (written only on Loudon's yes)`);
  }

  // Declared files: beside the piece (or /palace-absolute), present, inside.
  // A folder ends in "/" and covers every file under it.
  const declaredFiles = new Set();
  const declaredDirs = [];
  for (const f of decl?.files || []) {
    const rel = declaredPath(piece, f);
    if (!rel) { F('file-outside', f, `declares ${f}, which climbs out of the palace`); continue; }
    if (rel.endsWith('/')) {
      declaredDirs.push(rel);
      if (!ctx.files.some((p) => p.startsWith(rel))) { F('file-missing', f, `declares the folder ${f}, and the palace keeps nothing under ${rel}`); findings[findings.length - 1].missing = rel.slice(0, -1); }
      continue;
    }
    declaredFiles.add(rel);
    const r = present(ctx, rel);
    if (!r.ok) { F(r.reason === 'missing' ? 'file-missing' : 'file-outside', f, `declares ${f}: ${r.label}`); findings[findings.length - 1].missing = rel; }
  }

  // What it loads.
  const seen = new Set();
  for (const l of scan.loads) {
    const k = `${l.kind}|${l.url || l.path}`;
    if (seen.has(k)) continue;
    seen.add(k);
    const where = l.where;
    if (where === 'external') judgeExternal(ctx, l, decl, F, S);
    else {
      const rel = where === 'root' ? posix.normalize(l.path.slice(1)) : posix.normalize(posix.join(dir, l.path));
      if (where === 'root') F('url-root-absolute', l.raw, `${l.raw} (line ${l.line}) lands at the root of whatever serves the piece; the read view serves it under files/, so write it relative to the piece`, l.line);
      if (rel.startsWith('../') || rel === '..') { F('file-outside', l.raw, `${l.raw} (line ${l.line}) climbs out of the palace`, l.line); continue; }
      const r = present(ctx, rel);
      if (!r.ok) { F(r.reason === 'missing' ? 'file-missing' : 'file-outside', l.raw, `loads ${l.raw} (line ${l.line}): ${r.label}`, l.line); findings[findings.length - 1].missing = rel; continue; }
      const shared = SHARED_DIRS.some((d) => r.path.startsWith(d));
      if (!shared && !declaredFiles.has(rel) && !declaredFiles.has(r.path) && !declaredDirs.some((d) => rel.startsWith(d) || r.path.startsWith(d))) {
        S('file-undeclared', rel, declared ? `loads ${l.raw} (line ${l.line}), which piece:files does not name` : `loads ${l.raw} (line ${l.line}); a declaration would name it in piece:files`, l.line);
      }
    }
  }

  // Addressing.
  for (const p of scan.posts) F('post-target', `${p.to}:${p.target}`, `${p.to}.postMessage(…, ${p.target}) at line ${p.line}: addressed to one origin, it never arrives once the piece leaves the page's origin (the kit posts rich:play and height itself)`, p.line);
  for (const r of scan.reaches) F('parent-reach', r.what, `${r.what} at line ${r.line}: a piece cannot reach its page`, r.line);
  if (scan.kit) F('kit-bundled', 'kit', 'carries data-rich-kit: the server injects the kit, and skips a page that already has one, so this copy goes stale');
  if (scan.reviewLayer) F('review-layer', 'review-layer', "loads the review-layer kit, whose notes land in storage that won't keep");

  return result(ctx, t, decl, scan, findings);
}

/** Is `rel` a file the palace keeps, by the one resolver's rules? */
function present(ctx, rel) {
  const r = ctx.resolver.resolve('/' + rel);
  return r.ok ? r : { ...r, label: r.reason === 'missing' ? `no file ${rel}` : r.label };
}

function judgeExternal(ctx, l, decl, F, S) {
  if (FONT_HOSTS.includes(l.host)) return;
  if (l.kind === 'connect') {
    const hosts = decl?.net || [];
    const host = l.host;
    const ok = hosts.some((h) => h === host || (h.startsWith('*.') && host.endsWith(h.slice(1))));
    if (!ok) S('net-undeclared', host, decl ? `reaches ${host} (line ${l.line}), which piece:net does not name` : `reaches ${host} (line ${l.line}); a declaration would name it in piece:net`, l.line);
    return;
  }
  if (!['script', 'module', 'style'].includes(l.kind)) return; // media from the web: the CSP's business, not a pin
  const v = exactVersion(l.url);
  if (!v) F('cdn-unpinned', l.url, `${l.url} (line ${l.line}) is not at an exact version`, l.line);
  if (ctx.shelf.present) {
    const lib = ctx.shelf.byUrl.get(l.url);
    if (!lib) F('cdn-off-shelf', l.url, `${l.url} (line ${l.line}) is not on the shelf (${SHELF_FILE})`, l.line);
    else if (lib.integrity && l.integrity !== lib.integrity) F('cdn-sri-mismatch', l.url, `${l.url} (line ${l.line}) carries ${l.integrity ? 'a different integrity' : 'no integrity'}; the shelf says ${lib.integrity}`, l.line);
  } else if (!l.integrity && l.tag !== 'code') {
    F('cdn-no-sri', l.url, `${l.url} (line ${l.line}) carries no integrity hash`, l.line);
  }
}

function result(ctx, t, decl, scan, findings) {
  for (const f of findings) f.allowed = ctx.config.allows(f);
  const open = findings.filter((f) => !f.allowed);
  const errored = open.some((f) => f.level === 'error');
  return {
    path: t.path,
    via: (t.via || []).map((v) => ({ entry: v.entry, name: v.name, origin: v.manifestPiece?.origin || null })),
    declaration: decl ? { source: decl.source, needs: decl.needs, files: decl.files, net: decl.net, size: decl.size?.mode === 'fill' ? `fill ${decl.size.as}` : 'flow' } : null,
    uses: scan ? [...scan.uses.keys()] : [],
    sound: !!scan?.sound,
    mark: errored ? 'errored' : decl ? 'introduced' : 'pre-contract',
    owed: decl?.source === 'manifest',
    findings,
  };
}

/** Re-mark a result after findings were added (the browser pass). */
function remark(ctx, r) {
  for (const f of r.findings) if (f.allowed === undefined) f.allowed = ctx.config.allows(f);
  const errored = r.findings.some((f) => !f.allowed && f.level === 'error');
  r.mark = errored ? 'errored' : r.declaration ? 'introduced' : 'pre-contract';
  return r;
}

// ── a run ───────────────────────────────────────────────────────────────────

/** The pieces of some faces, each page once, with every face that shows it. */
export function targetsOf(faces) {
  const byPath = new Map();
  for (const f of faces) for (const p of f.pieces) {
    const t = byPath.get(p.path) || { path: p.path, via: [] };
    t.via.push({ entry: f.entry, name: p.name, manifestPiece: p.manifestPiece });
    byPath.set(p.path, t);
  }
  return byPath;
}

/**
 * Check faces and pages statically. `scope`: { entry } | { all: true } | { paths }.
 * @returns {{ faces, results, faceFindings, scope }}
 */
export function checkStatic(ctx, scope) {
  let faces, targets;
  if (scope.entry) {
    const f = entryFace(ctx, scope.entry);
    if (!f) throw new Error(`no entry named “${scope.entry}”`);
    faces = [f];
    targets = targetsOf(faces);
  } else {
    faces = allFaces(ctx);
    targets = targetsOf(faces);
    if (scope.all) {
      for (const p of ctx.files) if (PAGE.test(p) && ctx.config.isPiece(p) && !p.split('/').some((s) => s.startsWith('.')) && !targets.has(p)) targets.set(p, { path: p, via: [] });
    } else if (scope.paths) {
      const want = new Map();
      for (const p of scope.paths) want.set(p, targets.get(p) || { path: p, via: [] });
      targets = want;
      faces = faces.filter((f) => f.pieces.some((p) => want.has(p.path)));
    }
  }
  const results = [...targets.values()].sort((a, b) => a.path.localeCompare(b.path)).map((t) => checkPage(ctx, t));
  markIgnored(ctx, results);
  const faceFindings = faces.flatMap((f) => f.findings);
  for (const f of faceFindings) f.allowed = ctx.config.allows(f);
  return { faces, results, faceFindings, scope };
}

/**
 * A file that is missing here may be one git ignores: since 2026-10-18 the
 * stewards' renders under Projects/ and Shop/ stay on the Mac (.gitignore), and
 * a worktree never has them. Asked of git once for the whole run, by pattern,
 * so the answer is the same in a worktree as in the owner checkout.
 */
function markIgnored(ctx, results) {
  const misses = results.flatMap((r) => r.findings.filter((f) => f.rule === 'file-missing' && f.missing));
  if (!misses.length) return;
  let ignored = new Set();
  try {
    const out = execFileSync('git', ['-c', 'core.quotepath=off', 'check-ignore', '-z', '--stdin'],
      { cwd: ctx.gitRoot, input: [...new Set(misses.map((f) => f.missing))].join('\0') + '\0', maxBuffer: 64 * 1024 * 1024, stdio: ['pipe', 'pipe', 'ignore'] });
    ignored = new Set(out.toString('utf8').split('\0').filter(Boolean));
  } catch (e) {
    if (e.status === 1 && e.stdout) ignored = new Set(e.stdout.toString('utf8').split('\0').filter(Boolean)); // 1: none ignored
  }
  for (const f of misses) {
    if (!ignored.has(f.missing)) continue;
    f.rule = 'file-ignored';
    f.level = RULES['file-ignored'].level;
    f.family = RULES['file-ignored'].family;
    f.detail = f.detail.replace(/: no file .*$/, `: git ignores ${f.missing}, so it is kept only where it was rendered`);
  }
  for (const r of results) remark(ctx, r);
}

/** Every open error in a run: what an enforced gate refuses on. */
export function openErrors(run) {
  return [...run.faceFindings, ...run.results.flatMap((r) => r.findings)].filter((f) => !f.allowed && f.level === 'error');
}

// ── the browser pass ────────────────────────────────────────────────────────

/** Playwright's Chromium, from STIGMERGY's install, or null with the reason. */
export function findChromium() {
  try {
    const require = createRequire(join(STIGMERGY_APP, 'package.json'));
    const { chromium } = require('playwright');
    if (!existsSync(chromium.executablePath())) return { chromium: null, why: 'Playwright has no Chromium here (npx playwright install chromium, in _ops/stigmergy/app)' };
    return { chromium };
  } catch (e) {
    return { chromium: null, why: `Playwright is not installed for STIGMERGY (${e.code || e.message})` };
  }
}

// The page a piece is checked in: one frame, framed the way the rich face frames
// a piece today (sandboxed to scripts, served with the kit, 480 px until it
// speaks, heights taken within 120..8000). When the piece origin lands
// (spec § 4, lane A), this frame moves onto it, with the declared allow list.
function hostPage(piece, width) {
  const src = '/rich/' + piece.split('/').map(encodeURIComponent).join('/');
  return `<!doctype html><html><head><meta charset="utf-8"><title>conform</title></head><body style="margin:0">
<iframe id="p" sandbox="allow-scripts" src="${src}" style="display:block;width:${width}px;height:480px;border:0"></iframe>
<script>
window.__heard = [];
const f = document.getElementById('p');
window.addEventListener('message', (e) => {
  if (e.source !== f.contentWindow || !e.data || typeof e.data.type !== 'string') return;
  window.__heard.push({ at: performance.now(), ...e.data });
  if (e.data.type === 'rich:height') { const px = Math.ceil(e.data.height); if (px >= 120 && px <= 8000) f.style.height = px + 'px'; }
});
window.__hush = () => f.contentWindow.postMessage({ type: 'rich:hush' }, '*');
</script></body></html>`;
}

// Runs in every frame before any of its scripts (and so beneath the kit): keeps
// every AudioContext a piece makes, so the pass can ask whether it went quiet.
const INIT = `(() => {
  const N = window.AudioContext || window.webkitAudioContext;
  if (!N || window.__conformCtx) return;
  window.__conformCtx = [];
  const W = class extends N { constructor(...a) { super(...a); window.__conformCtx.push(this); } };
  window.AudioContext = W;
  if ('webkitAudioContext' in window) window.webkitAudioContext = W;
})();`;

const SANDBOX_HINT = /sandbox|allow-same-origin|origin 'null'|null origin|CORS|cross-origin|Access-Control|permissions policy|Permissions-Policy|NotAllowedError|Permission denied|SecurityError.*(?:localStorage|sessionStorage|indexedDB|cookie)|(?:localStorage|sessionStorage|indexedDB).*(?:denied|sandbox)/i;
// What a CORS block leaves behind: Chromium logs the failed load, and the
// fetch rejects. The sandbox's only when a block from origin 'null' came first.
const AFTER_CORS = /net::ERR_FAILED|Failed to fetch|NetworkError when attempting to fetch/i;
// Not a fault: p5 and others probe the motion sensors at start, and the
// sandbox (like the piece origin, which grants no sensors) says no.
const NOISE = [/Permissions policy violation: (?:accelerometer|gyroscope|magnetometer|devicemotion|deviceorientation)\b/i,
  /Failed to load resource: the server responded with a status of/i]; // carried by the response, with its URL

/**
 * Serve the palace the way the rich face does (rich-handler: kit injected,
 * every palace page sandboxed), on a loopback port of its own, and drive each
 * piece at both widths. Never :5173, never the board: the handler's review
 * path is pointed at a port nothing answers.
 */
export async function checkBrowser(ctx, results, { concurrency = 4, loadTimeout = 15000, log = () => {} } = {}) {
  const { chromium, why } = findChromium();
  if (!chromium) return { ran: false, why };
  const handler = createRichHandler({ root: ctx.root, here: HERE, base: '/rich', app: () => 'http://127.0.0.1:9' });
  const server = http.createServer(async (req, res) => {
    // STIGMERGY's request guard first, as on every server in _ops (the census test holds it).
    if (checkRequest(req, res, { urlPath: (req.url || '').split('?')[0], method: (req.method || 'GET').toUpperCase() })) return;
    const u = new URL(req.url, 'http://x');
    if (u.pathname === '/__conform/host') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(hostPage(u.searchParams.get('piece') || '', Number(u.searchParams.get('w')) || 760));
      return;
    }
    if (!(await handler(req, res))) { res.writeHead(404); res.end(); }
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    await context.addInitScript(INIT);
    const queue = results.slice();
    let done = 0;
    // Drive one piece at both widths and lay what the browser saw over the
    // static findings (a second drive replaces the first's).
    const browse = async (r, { alone = false } = {}) => {
      const fill = r.declaration?.size?.startsWith('fill');
      const drive = (w) => drivePiece(context, origin, r, w, { fill, loadTimeout });
      const runs = alone ? [await drive(WIDTHS[0]), await drive(WIDTHS[1])] : await Promise.all(WIDTHS.map(drive));
      r.findings = r.findings.filter((f) => !f.browser);
      r.browser = runs.map((x) => ({ width: x.width, height: x.height, play: x.play, hushed: x.hushed }));
      const seen = new Set(r.findings.filter((f) => f.missing).map((f) => `missing|${f.missing}`));
      for (const f of runs.flatMap((x) => x.findings)) {
        const k = f.missing ? `missing|${f.missing}` : `${f.rule}|${f.key}`;
        if (!seen.has(k)) { seen.add(k); r.findings.push(f); }
      }
      remark(ctx, r);
    };
    const worker = async () => {
      while (queue.length) {
        const r = queue.shift();
        await browse(r);
        log(`  browser ${++done}/${results.length}  ${r.mark.padEnd(12)} ${r.path}`);
      }
    };
    await Promise.all(Array.from({ length: Math.min(concurrency, results.length) }, worker));
    // A piece that missed its time — no load within the limit, no height within
    // 3 s — is driven again, alone: among eight frames at once a heavy piece can
    // be slow without being wrong. What the second, quiet drive sees stands.
    const SLOW = ['load-failed', 'height-silent'];
    for (const r of results.filter((x) => x.findings.some((f) => SLOW.includes(f.rule)))) {
      await browse(r, { alone: true });
      for (const f of r.findings) if (SLOW.includes(f.rule)) f.detail += ' (and again, driven alone)';
      log(`  browser again, alone  ${r.mark.padEnd(12)} ${r.path}`);
    }
    await context.close();
    markIgnored(ctx, results);
  } finally {
    await browser.close();
    await new Promise((ok) => server.close(ok));
  }
  return { ran: true };
}

async function drivePiece(context, origin, r, width, { fill, loadTimeout }) {
  const piece = r.path;
  const out = { width, height: null, play: null, hushed: null, findings: [] };
  const F = (rule, key, detail) => out.findings.push({ ...finding(rule, piece, key, detail), browser: true, width });
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  const errors = [];
  const failed = new Map(); // palace path → status, for what the piece asked of the palace and did not get
  page.on('console', (m) => { if (m.type() === 'error' && m.location()?.url && !m.location().url.includes('/__conform/')) errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e.message || e)));
  page.on('response', (res) => {
    if (res.status() < 400) return;
    const u = new URL(res.url());
    if (u.origin !== origin || !u.pathname.startsWith('/rich/')) return;
    let rel = u.pathname.slice('/rich/'.length);
    try { rel = decodeURIComponent(rel); } catch { /* as sent */ }
    if (rel && rel !== piece) failed.set(rel, res.status());
  });
  try {
    try {
      await page.goto(`${origin}/__conform/host?piece=${encodeURIComponent(piece)}&w=${width}`, { waitUntil: 'load', timeout: loadTimeout });
    } catch (e) {
      F('load-failed', 'load', `did not load at ${width} px: ${e.message.split('\n')[0]}`);
      return out;
    }
    const heard = () => page.evaluate(() => window.__heard);
    const t0 = Date.now();
    let h = null;
    while (Date.now() - t0 < HEIGHT_WAIT_MS) {
      h = (await heard()).filter((m) => m.type === 'rich:height').pop();
      if (h) break;
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(400); // let late errors land
    out.height = h ? Math.ceil(h.height) : null;
    if (!h && !fill) F('height-silent', 'height', `no rich:height within ${HEIGHT_WAIT_MS / 1000} s at ${width} px`);

    if (r.sound) {
      const frame = page.frames().find((fr) => fr !== page.mainFrame());
      if (frame) {
        const before = (await heard()).length;
        await clickToPlay(page, frame);
        let play = null;
        const t1 = Date.now();
        while (Date.now() - t1 < 2000) { play = (await heard()).slice(before).find((m) => m.type === 'rich:play'); if (play) break; await page.waitForTimeout(100); }
        out.play = !!play;
        if (!play) F('play-silent', 'play', `makes sound, and no rich:play arrived after a click at ${width} px (the click may not have found its start control)`);
        const loud = async () => frame.evaluate(() => {
          const ctx = (window.__conformCtx || []).filter((c) => c.state === 'running').length;
          const media = [...document.querySelectorAll('audio, video')].filter((m) => !m.paused).length;
          return ctx + media;
        }).catch(() => 0);
        if (await loud()) {
          await page.evaluate(() => window.__hush());
          // A piece may fade before it suspends (Kuramoto's waits 200 ms), so
          // quiet is asked for over a moment, not at one instant.
          let still = 1;
          for (const t1 = Date.now(); still && Date.now() - t1 < HUSH_WAIT_MS;) { await page.waitForTimeout(100); still = await loud(); }
          out.hushed = !still;
          if (still) F('hush-loud', 'hush', `${still} context(s) or media still sounding ${HUSH_WAIT_MS / 1000} s after rich:hush at ${width} px`);
        }
      }
    }

    const kitErrors = (await heard()).filter((m) => m.type === 'rich:error').map((m) => `${m.message}${m.where ? ` (${m.where})` : ''}`);
    const all = [...new Set([...errors, ...kitErrors])].filter((e) => !NOISE.some((re) => re.test(e)));
    const cors = all.some((e) => /from origin 'null'/.test(e));
    let blockedAny = false;
    for (const e of all) {
      const blocked = SANDBOX_HINT.test(e) || (cors && AFTER_CORS.test(e));
      blockedAny ||= blocked;
    }
    for (const e of all.slice(0, 8)) {
      const blocked = SANDBOX_HINT.test(e) || (cors && AFTER_CORS.test(e));
      F(blocked ? 'sandbox-blocked' : blockedAny ? 'error-after-block' : 'console-error', e.slice(0, 120), `${e.slice(0, 300)} (at ${width} px)`);
    }
    // A file the piece asked for at run time and the palace did not have: the
    // same finding the static pass makes for a file it can see, so the two
    // dedupe, and the ignore pass sorts a render left on the Mac from a file
    // that is nowhere.
    for (const [rel, status] of failed) {
      if (status === 404) { F('file-missing', rel, `loads ${rel} at run time: no file ${rel}`); out.findings[out.findings.length - 1].missing = rel; }
      else F('console-error', rel, `loads ${rel} at run time, and the server answered ${status} (at ${width} px)`);
    }
    if (blockedAny) for (const f of out.findings) if (f.rule === 'play-silent') f.detail += '; it came after a load the sandbox blocked, so it may only follow from that';
  } finally {
    await page.close().catch(() => {});
  }
  return out;
}

// A sound starts on a click. Try the control that says so, then any button,
// then the middle of the piece.
async function clickToPlay(page, frame) {
  const start = /\b(play|start|begin|listen|sound|audio|enable|unmute|tap|go|run)\b|▶|►|⏵/i;
  try {
    const handles = await frame.$$('button, [role=button], input[type=button], input[type=submit], .btn, .button');
    let pick = null;
    for (const h of handles) {
      const label = (await h.evaluate((el) => `${el.textContent || ''} ${el.value || ''} ${el.getAttribute('aria-label') || ''} ${el.id} ${el.className}`)).trim();
      if (start.test(label) && await h.isVisible()) { pick = h; break; }
    }
    if (!pick) for (const h of handles) if (await h.isVisible()) { pick = h; break; }
    if (pick) { await pick.click({ timeout: 1500 }); return; }
  } catch { /* fall through to the middle */ }
  const box = await (await frame.frameElement()).boundingBox().catch(() => null);
  if (box) await page.mouse.click(box.x + box.width / 2, box.y + Math.min(box.height / 2, 300));
}

// ── a commit: what a push sends ─────────────────────────────────────────────

/**
 * A context over one commit instead of the working tree, for the push gate:
 * the resolver indexes the commit's tree, and the files a check reads (the
 * manifests, their entries, every file the faces name or the pieces load) are
 * written out of the commit into a temp folder. A file read only to see that
 * it is there is written empty. Uncommitted work is never what is judged.
 * @returns {{ ctx, done: () => void }}
 */
export function commitContext(repo, rev) {
  const tree = execFileSync('git', ['-c', 'core.quotepath=off', 'ls-tree', '-r', '-z', '--full-tree', rev], { cwd: repo, maxBuffer: 256 * 1024 * 1024 })
    .toString('utf8').split('\0').filter(Boolean).map((l) => { const tab = l.indexOf('\t'); const [mode, type, oid] = l.slice(0, tab).split(' '); return { mode, type, oid, path: l.slice(tab + 1) }; })
    .filter((e) => e.type === 'blob');
  const byPath = new Map(tree.map((e) => [e.path, e]));
  const byBase = new Map();
  for (const e of tree) { const b = posix.basename(e.path); (byBase.get(b) || byBase.set(b, []).get(b)).push(e); }
  const tmp = mkdtempSync(join(tmpdir(), 'conform-commit-'));
  const written = new Set();
  const TEXT = /\.(md|json|html?|js|mjs|css|txt)$/i;
  const blob = (oid) => execFileSync('git', ['cat-file', 'blob', oid], { cwd: repo, maxBuffer: 256 * 1024 * 1024 });
  const write = (rel, depth = 0) => {
    if (written.has(rel) || depth > 4) return;
    const e = byPath.get(rel);
    if (!e) return;
    written.add(rel);
    const abs = join(tmp, ...rel.split('/'));
    mkdirSync(dirname(abs), { recursive: true });
    if (e.mode === '120000') {
      const target = blob(e.oid).toString('utf8');
      symlinkSync(target, abs);
      if (!target.startsWith('/')) write(posix.normalize(posix.join(posix.dirname(rel), target)), depth + 1);
    } else writeFileSync(abs, TEXT.test(rel) ? blob(e.oid) : '');
  };
  const files = tree.map((e) => e.path);
  for (const f of [CONFIG_FILE, GRANTS_FILE, SHELF_FILE]) write(f);
  for (const m of files.filter((p) => MANIFEST.test(p))) write(m);
  const resolver = makeResolver(tmp, { files, tracked: true });
  const ctx = makeContext(tmp, { files, resolver, gitRoot: repo });
  // Every entry a manifest belongs to, and every file it could name: all files
  // sharing a referenced name, so the resolver's lookup sees what it would see.
  const names = new Set();
  for (const m of files.filter((p) => MANIFEST.test(p))) {
    let j = null; try { j = JSON.parse(ctx.read(m)); } catch { continue; }
    const want = `${(j.entry || posix.basename(m).replace(MANIFEST, '')).trim()}.md`.toLowerCase();
    for (const e of tree) if (posix.basename(e.path).toLowerCase() === want) write(e.path);
    const md = resolver.findEntry(j.entry || posix.basename(m).replace(MANIFEST, ''));
    let text = ''; try { text = md ? ctx.read(md) : ''; } catch { /* missing */ }
    for (const n of collectNames(text, j)) names.add(n);
  }
  for (const n of names) {
    const base = posix.basename(n.replace(/^\/+/, ''));
    for (const e of byBase.get(base) || []) write(e.path);
    if (n.startsWith('/')) write(posix.normalize(n.slice(1)));
  }
  // Then every file the pieces declare or load, by exact path.
  for (const p of files.filter((x) => PAGE.test(x) && written.has(x))) {
    let html = ''; try { html = ctx.read(p); } catch { continue; }
    const dir = posix.dirname(p);
    const decl = readDeclaration(html);
    for (const f of decl?.files || []) { const rel = declaredPath(p, f); if (rel && !rel.endsWith('/')) write(rel); }
    for (const l of scanPage(html).loads) if (!l.url) write(l.path.startsWith('/') ? posix.normalize(l.path.slice(1)) : posix.normalize(posix.join(dir, l.path)));
  }
  resolver.refresh();
  return { ctx, done: () => rmSync(tmp, { recursive: true, force: true }) };
}

// The names a face's text and manifest hold, the way richReferences reads them.
function collectNames(text, manifest) {
  const out = new Set();
  for (const m of String(text).matchAll(/!?\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g)) out.add(m[1].trim());
  for (const m of String(text).matchAll(/\[[^\]]*\]\(\s*<?([^)\s>]+)>?\s*\)/g)) { try { out.add(decodeURI(m[1].trim())); } catch { out.add(m[1].trim()); } }
  (function walk(v, key) {
    if (Array.isArray(v)) v.forEach((x) => walk(x, key));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, k);
    else if (typeof v === 'string' && (key === 'file' || key === 'name')) out.add(v);
  })(manifest);
  return out;
}

// ── the report ──────────────────────────────────────────────────────────────

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** The run as markdown: the table a commit carries, then every finding, then counts by rule. */
export function renderReport(run, { title = 'conform', browser = null, enforce = false } = {}) {
  const all = [...run.faceFindings, ...run.results.flatMap((r) => r.findings)];
  const open = all.filter((f) => !f.allowed);
  const marks = run.results.reduce((a, r) => (a[r.mark] = (a[r.mark] || 0) + 1, a), {});
  const L = [];
  L.push(`# ${title}`, '');
  L.push(`${run.results.length} pages · ${run.faces.length} rich faces · introduced ${marks.introduced || 0} · pre-contract ${marks['pre-contract'] || 0} · errored ${marks.errored || 0}`);
  L.push(`errors ${open.filter((f) => f.level === 'error').length} · warnings ${open.filter((f) => f.level === 'warn').length} · allowed ${all.length - open.length} · ${enforce ? 'enforced' : 'report-only'}${browser ? ` · browser: ${browser.ran ? 'ran at ' + WIDTHS.join(' and ') + ' px' : browser.why}` : ' · browser: not run'}`, '');
  L.push('| piece | mark | declares | uses | errors | warnings |', '|---|---|---|---|---|---|');
  for (const r of run.results) {
    const o = r.findings.filter((f) => !f.allowed);
    const d = r.declaration;
    const declares = d ? [d.needs.length ? d.needs.join(' ') : 'nothing', d.files.length ? `files ${d.files.length}` : '', d.net.length ? `net ${d.net.join(' ')}` : '', d.size ? d.size : ''].filter(Boolean).join(' · ') + (r.owed ? ' (manifest; owed)' : '') : '—';
    L.push(`| \`${esc(r.path)}\` | ${r.mark} | ${esc(declares)} | ${r.uses.join(' ') || '—'} | ${o.filter((f) => f.level === 'error').length} | ${o.filter((f) => f.level === 'warn').length} |`);
  }
  if (run.faceFindings.length) {
    L.push('', '## How the faces name their files', '', '| face | rule | level | finding |', '|---|---|---|---|');
    for (const f of run.faceFindings) L.push(`| \`${esc(f.piece)}\` | ${f.rule}${f.allowed ? ' (allowed)' : ''} | ${f.level} | ${esc(f.detail)} |`);
  }
  const pieceFindings = run.results.flatMap((r) => r.findings);
  if (pieceFindings.length) {
    // A run of one rule on one page (a gallery's 240 renders) reads as one row.
    L.push('', '## Findings', '', '| piece | rule | level | finding |', '|---|---|---|---|');
    for (const r of run.results) {
      const groups = new Map();
      for (const f of r.findings) { const k = `${f.rule}|${f.level}|${!!f.allowed}`; (groups.get(k) || groups.set(k, []).get(k)).push(f); }
      for (const fs of groups.values()) {
        const f = fs[0];
        const detail = fs.length > 4 ? `${fs.length} like this: ${fs.slice(0, 3).map((x) => x.key).join(' · ')} … (first: ${f.detail})` : null;
        if (detail) L.push(`| \`${esc(f.piece)}\` | ${f.rule}${f.allowed ? ' (allowed)' : ''} | ${f.level} | ${esc(detail)} |`);
        else for (const x of fs) L.push(`| \`${esc(x.piece)}\` | ${x.rule}${x.allowed ? ' (allowed)' : ''} | ${x.level} | ${esc(x.detail)} |`);
      }
    }
  }
  const byRule = {};
  for (const f of open) { const b = byRule[f.rule] || (byRule[f.rule] = { error: 0, warn: 0, pages: new Set() }); b[f.level === 'error' ? 'error' : 'warn']++; b.pages.add(f.piece); }
  L.push('', '## By rule', '', '| rule | family | errors | warnings | pages | what it means |', '|---|---|---|---|---|---|');
  for (const [rule, meta] of Object.entries(RULES)) {
    const b = byRule[rule];
    if (b) L.push(`| ${rule} | ${meta.family} | ${b.error} | ${b.warn} | ${b.pages.size} | ${esc(meta.what)} |`);
  }
  return L.join('\n') + '\n';
}

/** The run as a compact table for a terminal or a commit body. */
export function renderTable(run) {
  const rows = run.results.map((r) => {
    const o = r.findings.filter((f) => !f.allowed);
    return `  ${r.mark.padEnd(12)} ${String(o.filter((f) => f.level === 'error').length).padStart(2)}E ${String(o.filter((f) => f.level === 'warn').length).padStart(2)}W  ${r.path}`;
  });
  const faces = run.faceFindings.filter((f) => !f.allowed).map((f) => `  ${f.level.padEnd(12)} ${f.rule}  ${f.piece}: ${f.detail}`);
  return [...faces, ...rows].join('\n');
}

// ── the command ─────────────────────────────────────────────────────────────

async function main(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith('--')));
  const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
  const valued = new Set(['--out', '--root']);
  const words = argv.filter((a, i) => !a.startsWith('--') && !valued.has(argv[i - 1]));
  const root = resolve(opt('--root') || resolve(HERE, '../..'));
  const ctx = makeContext(root);
  const json = flags.has('--json');
  const log = (s) => { if (!json) console.error(s); };
  let scope, title;
  if (flags.has('--all')) { scope = { all: true }; title = 'conform — every web page the palace keeps'; }
  else if (words.length && words.every((w) => PAGE.test(w))) { scope = { paths: words.map((w) => posix.normalize(w.replace(/^\.?\/+/, ''))) }; title = `conform — ${words.length} page(s)`; }
  else if (words.length === 1) { scope = { entry: words[0] }; title = `conform — ${words[0]}`; }
  else { console.error('usage: conform.mjs "<Entry>" | --all | <page.html> …   [--static] [--browser] [--enforce] [--json] [--out file]'); process.exitCode = 2; return; }

  const t0 = Date.now();
  const run = checkStatic(ctx, scope);
  log(`conform: ${run.results.length} pages, ${run.faces.length} rich faces read statically in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  let browser = null;
  const wantBrowser = !flags.has('--static') && (flags.has('--browser') || !scope.all);
  if (wantBrowser && run.results.length) {
    log('conform: the browser pass, at 760 and 1130 px …');
    browser = await checkBrowser(ctx, run.results, { log });
    if (!browser.ran) log(`conform: browser pass skipped — ${browser.why}`);
  }
  const enforce = flags.has('--enforce');
  const report = renderReport(run, { title, browser, enforce });
  if (opt('--out')) { mkdirSync(dirname(resolve(opt('--out'))), { recursive: true }); writeFileSync(resolve(opt('--out')), report); log(`conform: report → ${opt('--out')}`); }
  if (json) console.log(JSON.stringify({ scope, browser, faces: run.faces.map((f) => ({ entry: f.entry, md: f.md, manifest: f.manifest })), faceFindings: run.faceFindings, results: run.results }, null, 2));
  else console.log(report);
  const errors = openErrors(run);
  if (enforce && errors.length) { console.error(`conform: ${errors.length} error(s)`); process.exitCode = 1; }
}

const invokedDirectly = (() => { try { return !!process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url); } catch { return false; } })();
if (invokedDirectly) main(process.argv.slice(2)).catch((e) => { console.error('conform failed:', e); process.exitCode = 2; });
