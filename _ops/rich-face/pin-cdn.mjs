#!/usr/bin/env node
// pin-cdn.mjs — the library shelf and the pins that follow it. Every library a
// piece loads from a CDN is loaded at an exact version, with its SRI hash, as
// the shelf (libs.json) names it, so the browser refuses bytes that are not the
// ones the shelf was made from. CSP limits where data goes, not what code runs;
// the pins are the real defense (spec — rich-face pieces § 3, § 7).
//
//   node _ops/rich-face/pin-cdn.mjs <page.html> …        pin these pages to the shelf
//   node _ops/rich-face/pin-cdn.mjs --all                 every web page the palace keeps
//       --except <prefix>   leave pages under a folder alone (repeatable)
//   node _ops/rich-face/pin-cdn.mjs --add <exact url> [--from <loose url>]…
//       put a library on the shelf: fetch it, hash it (sha384); each --from names
//       a loose spelling it stands for (`d3@7`), and is refused if it serves
//       other bytes today. Repeatable: each --from belongs to the --add before it.
//   … --seed            with pages: put every exact CDN url they load on the shelf
//   … --shelf-only      change the shelf alone; pin no page (what they'd need is still reported)
//   … --write <digest>  write exactly the change a run without it showed
//   --root <palace>  --json
//
// A run without --write writes nothing: it prints each file's diff and a digest
// of the whole change. --write <digest> works the change out again and writes
// it only if it comes to that digest, and each file only if it is still what was
// read, so nothing lands that was not seen (spec § 6: every script shows a diff
// first and writes only to a file unchanged since it was read).
//
// A page's tag is pinned in place: its src or href becomes the shelf's exact
// url, it gains (or corrects) integrity, and crossorigin="anonymous" when it has
// none, since the browser checks a cross-origin hash only over CORS. A load the
// tags don't carry (an import in code, an import map) is listed to pin by hand.
// Gathered proofs are records: this is the one edit the migration makes to them,
// and only after Loudon has seen the diff (spec § 9, decision 3).

import { readFileSync, writeFileSync, existsSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT as PALACE } from './resolve.mjs';
import { attrsOf, classify, exactVersion, palaceFiles, scanPage } from './conform.mjs';
import { SHELF_FILE } from './contract.mjs';
import { makeUnifiedDiff } from '../stigmergy/app/server/entry-save.js';

// Google's fonts: the house standard allows them unpinned (conform.mjs FONT_HOSTS).
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const PAGE = /\.html?$/i;
const SHELF_ABOUT = 'The library shelf: every library a piece may load from a CDN, at an exact version, with its SRI hash. A page loads a library by its url here, carrying its integrity and crossorigin="anonymous". `from` lists the loose spellings a pin replaces. Written only through _ops/rich-face/pin-cdn.mjs, which shows the diff first. Read by conform.mjs (the pins) and contract.mjs (the CSP\'s script origins). Plan: STIGMERGY — spec — rich-face pieces § 3.';

const blank = (s) => s.replace(/[^\n]/g, ' ');
const sha = (s) => createHash('sha256').update(s).digest('hex');

// ── the shelf ───────────────────────────────────────────────────────────────

/** libs.json as written, or an empty shelf. */
export function readShelf(root) {
  const abs = join(root, ...SHELF_FILE.split('/'));
  if (!existsSync(abs)) return { text: null, data: { about: SHELF_ABOUT, libs: [] } };
  const text = readFileSync(abs, 'utf8');
  const data = JSON.parse(text);
  if (!Array.isArray(data.libs)) throw new Error(`${SHELF_FILE} has no "libs" list`);
  return { text, data };
}

/** The shelf as lookups: exact url → lib, and loose spelling → lib. */
export function shelfIndex(data) {
  const byUrl = new Map(), byFrom = new Map();
  for (const l of data.libs || []) {
    if (!l || typeof l.url !== 'string') continue;
    byUrl.set(l.url, l);
    for (const f of l.from || []) byFrom.set(f, l);
  }
  return { byUrl, byFrom };
}

/** The shelf's text: libraries sorted by url, so a diff shows only what changed. */
export function shelfText(data) {
  const libs = [...data.libs].sort((a, b) => a.url.localeCompare(b.url))
    .map((l) => ({ name: l.name, version: l.version, url: l.url, integrity: l.integrity, ...(l.from?.length ? { from: [...new Set(l.from)].sort() } : {}) }));
  return JSON.stringify({ about: data.about || SHELF_ABOUT, libs }, null, 2) + '\n';
}

/** A library's name from its CDN url: jsDelivr's /npm/<name>@, unpkg's /<name>@, cdnjs's /ajax/libs/<name>/. */
export function libName(url) {
  const u = new URL(url);
  const p = decodeURIComponent(u.pathname);
  let m = /^\/ajax\/libs\/([^/]+)\//.exec(p);
  if (m) return m[1];
  m = /^\/(?:npm\/)?((?:@[^/]+\/)?[^/@]+)@/.exec(p);
  if (m) return m[1];
  return u.host + p;
}

/** Fetch a library and say what the shelf would hold for it. Throws with a reason when it can't be pinned. */
export async function hashLibrary(url, { fetchImpl = fetch } = {}) {
  const r = await fetchImpl(url, { redirect: 'manual' });
  if (r.status >= 300 && r.status < 400) throw new Error(`${url} redirects to ${r.headers.get('location')}; pin the url it lands on`);
  if (!r.ok) throw new Error(`${url} answered ${r.status}`);
  const bytes = Buffer.from(await r.arrayBuffer());
  const cors = r.headers.get('access-control-allow-origin');
  return {
    integrity: 'sha384-' + createHash('sha384').update(bytes).digest('base64'),
    bytes: bytes.length,
    cors,
  };
}

// ── pages ───────────────────────────────────────────────────────────────────

/**
 * The CDN library tags in a page, with where each sits: script src, and link
 * href for a stylesheet or module. Comments are blanked, offsets kept.
 */
export function libraryTags(html) {
  const src = String(html).replace(/<!--[\s\S]*?-->/g, blank);
  // Tags only, not what a script or a style says inside.
  const tags = src.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)/gi, (w, a, b, c) => a + blank(b) + c)
    .replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style\s*>)/gi, (w, a, b, c) => a + blank(b) + c);
  const out = [];
  for (const m of tags.matchAll(/<(script|link)\b([^>]*)>/gi)) {
    const tag = m[1].toLowerCase();
    const a = attrsOf(m[2]);
    const attr = tag === 'script' ? 'src' : (/stylesheet|modulepreload/.test((a.rel || '').toLowerCase()) ? 'href' : null);
    if (!attr || !a[attr]) continue;
    const c = classify(a[attr]);
    if (!c || c.where !== 'external' || FONT_HOSTS.includes(c.host)) continue;
    out.push({ tag, attr, url: c.url, raw: a[attr], integrity: a.integrity || null, crossorigin: a.crossorigin ?? null, start: m.index, end: m.index + m[0].length, line: html.slice(0, m.index).split('\n').length });
  }
  return out;
}

const attrRe = (name) => new RegExp(`(\\s${name}\\s*=\\s*)("([^"]*)"|'([^']*)'|([^\\s"'=<>\`]+))`, 'i');

/** One start tag, pinned: its url the shelf's, its integrity the shelf's, crossorigin when it had none. */
export function pinTag(tagText, attr, lib) {
  let t = tagText;
  const q = (v) => `"${v}"`;
  const at = attrRe(attr).exec(t);
  t = t.slice(0, at.index) + at[1] + q(lib.url) + t.slice(at.index + at[0].length);
  let add = '';
  const integ = attrRe('integrity').exec(t);
  if (integ) t = t.slice(0, integ.index) + integ[1] + q(lib.integrity) + t.slice(integ.index + integ[0].length);
  else add += ` integrity=${q(lib.integrity)}`;
  if (!/\scrossorigin(\s|=|>|\/)/i.test(t)) add += ' crossorigin="anonymous"';
  if (add) {
    const after = attrRe(attr).exec(t);
    const cut = after.index + after[0].length;
    t = t.slice(0, cut) + add + t.slice(cut);
  }
  return t;
}

/**
 * What pinning one page to the shelf does: its new text, what changed, what
 * is not on the shelf, and what the tags don't carry.
 */
export function pinPage(html, index) {
  const tags = libraryTags(html);
  const changes = [], offShelf = [];
  let out = '', from = 0;
  for (const g of tags) {
    const lib = index.byUrl.get(g.url) || index.byFrom.get(g.url);
    if (!lib) { offShelf.push({ url: g.url, line: g.line, exact: !!exactVersion(g.url) }); continue; }
    const pinned = g.url === lib.url && g.integrity === lib.integrity && g.crossorigin !== null;
    if (pinned) continue;
    const text = html.slice(g.start, g.end);
    const next = pinTag(text, g.attr, lib);
    out += html.slice(from, g.start) + next;
    from = g.end;
    changes.push({ line: g.line, from: g.url, to: lib.url, integrity: g.integrity === lib.integrity ? 'kept' : g.integrity ? 'corrected' : 'added' });
  }
  out += html.slice(from);
  // Loads the tags don't carry: an import in code, an import map.
  const tagLines = new Set(tags.map((g) => g.line));
  const byHand = scanPage(html).loads
    .filter((l) => l.where === 'external' && ['script', 'module', 'style'].includes(l.kind) && !FONT_HOSTS.includes(l.host) && !tagLines.has(l.line))
    .map((l) => ({ url: l.url, line: l.line }));
  return { text: out, changes, offShelf, byHand };
}

// ── a run: work the change out, show it, and write it only as shown ─────────

/**
 * @param {object} o
 * @param {string} o.root
 * @param {string[]} o.pages       palace paths
 * @param {{ url: string, from: string[] }[]} [o.add]
 * @param {boolean} [o.seed]
 * @param {boolean} [o.shelfOnly]  write the shelf alone; the pages' pins are only reported
 * @returns {Promise<{ files: { path, before, after }[], digest, report }>}
 */
export async function plan({ root, pages, add = [], seed = false, shelfOnly = false, fetchImpl = fetch }) {
  const shelf = readShelf(root);
  const data = { about: shelf.data.about || SHELF_ABOUT, libs: (shelf.data.libs || []).map((l) => ({ ...l })) };
  const report = { added: [], refused: [], pages: [], offShelf: [], byHand: [] };
  const index = () => shelfIndex(data);

  // What goes on the shelf: each --add, then with --seed every exact url the pages load.
  const wanted = add.map((a) => ({ url: classify(a.url)?.url || a.url, from: (a.from || []).map((f) => classify(f)?.url || f) }));
  const texts = new Map();
  for (const p of pages) texts.set(p, readFileSync(join(root, p), 'utf8'));
  if (seed) {
    const have = index();
    for (const html of texts.values()) for (const g of libraryTags(html)) {
      if (exactVersion(g.url) && !have.byUrl.has(g.url) && !wanted.some((w) => w.url === g.url)) wanted.push({ url: g.url, from: [] });
    }
  }
  for (const w of wanted) {
    if (!exactVersion(w.url)) { report.refused.push({ url: w.url, why: 'not at an exact version: name the exact url, and the loose one with --from' }); continue; }
    let h;
    try { h = await hashLibrary(w.url, { fetchImpl }); } catch (e) { report.refused.push({ url: w.url, why: e.message }); continue; }
    let refused = false;
    for (const f of w.from) {
      let hf;
      try { hf = await hashLibrary(f, { fetchImpl }); } catch (e) { report.refused.push({ url: w.url, why: `its loose spelling ${f} could not be read: ${e.message}` }); refused = true; break; }
      if (hf.integrity !== h.integrity) { report.refused.push({ url: w.url, why: `${f} serves other bytes today (${hf.integrity}), so pinning it here would change what loads` }); refused = true; break; }
    }
    if (refused) continue;
    const old = data.libs.find((l) => l.url === w.url);
    if (old && old.integrity !== h.integrity) { report.refused.push({ url: w.url, why: `the shelf holds ${old.integrity}, and the CDN now serves ${h.integrity}: the bytes behind an exact url changed; look before replacing it` }); continue; }
    if (old) { old.from = [...new Set([...(old.from || []), ...w.from])]; continue; }
    data.libs.push({ name: libName(w.url), version: exactVersion(w.url), url: w.url, integrity: h.integrity, ...(w.from.length ? { from: w.from } : {}) });
    report.added.push({ url: w.url, integrity: h.integrity, bytes: h.bytes, cors: h.cors, from: w.from });
  }

  const files = [];
  // The shelf is written only when its libraries change, never just to reformat it.
  const after = shelfText(data);
  if (after !== shelfText(shelf.data)) files.push({ path: SHELF_FILE, before: shelf.text ?? '', after });
  const idx = index();
  for (const [p, html] of texts) {
    const r = pinPage(html, idx);
    if (r.text !== html && !shelfOnly) files.push({ path: p, before: html, after: r.text });
    if (r.changes.length) report.pages.push({ path: p, changes: r.changes });
    for (const o of r.offShelf) report.offShelf.push({ path: p, ...o });
    for (const b of r.byHand) report.byHand.push({ path: p, ...b });
  }
  const digest = sha(files.map((f) => `${f.path}\0${sha(f.before)}\0${sha(f.after)}`).join('\n')).slice(0, 12);
  return { files, digest, report };
}

/** Write a plan's files, each only if it is still what the plan read. */
export function writePlan(root, files) {
  const changed = files.filter((f) => { const abs = join(root, f.path); return (existsSync(abs) ? readFileSync(abs, 'utf8') : '') !== f.before; });
  if (changed.length) return { written: [], changed: changed.map((f) => f.path) };
  for (const f of files) writeFileSync(join(root, f.path), f.after, 'utf8');
  return { written: files.map((f) => f.path), changed: [] };
}

/** The pages a run covers: named ones, or every web page git keeps, less the --except folders. */
export function pagesFor(root, { all = false, named = [], except = [] } = {}) {
  const list = all ? palaceFiles(root).filter((f) => PAGE.test(f)) : named;
  return list.filter((p) => !except.some((x) => p.startsWith(x.replace(/\/?$/, '/'))));
}

// ── command line ────────────────────────────────────────────────────────────

const isMain = (() => { try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (isMain) {
  const argv = process.argv.slice(2);
  let root = PALACE, all = false, seed = false, shelfOnly = false, json = false, write = null;
  const named = [], except = [], add = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') root = resolve(argv[++i]);
    else if (a === '--all') all = true;
    else if (a === '--seed') seed = true;
    else if (a === '--shelf-only') shelfOnly = true;
    else if (a === '--json') json = true;
    else if (a === '--write') write = argv[++i];
    else if (a === '--except') except.push(argv[++i]);
    else if (a === '--add') add.push({ url: argv[++i], from: [] });
    else if (a === '--from') { if (!add.length) { console.error('pin-cdn: --from belongs to the --add before it'); process.exit(2); } add[add.length - 1].from.push(argv[++i]); }
    else if (a.startsWith('--')) { console.error(`pin-cdn: unknown flag ${a}`); process.exit(2); }
    else named.push(a.replace(/^\/+/, ''));
  }
  if (!all && !named.length && !add.length) {
    console.error('usage: pin-cdn.mjs <page.html>… | --all [--except <prefix>]… [--seed] [--shelf-only] [--add <url> [--from <loose>]…]… [--write <digest>] [--root <palace>] [--json]');
    process.exit(2);
  }
  const pages = pagesFor(root, { all, named, except });
  const missing = pages.filter((p) => !existsSync(join(root, p)));
  if (missing.length) { console.error(`pin-cdn: no such page: ${missing.join(', ')}`); process.exit(2); }

  const run = await plan({ root, pages, add, seed, shelfOnly });
  const { files, digest, report } = run;
  if (json && !write) {
    console.log(JSON.stringify({ digest, files: files.map((f) => f.path), ...report }, null, 2));
  } else if (!write) {
    for (const f of files) process.stdout.write(makeUnifiedDiff(f.path, f.before, f.after));
    const lines = [];
    for (const a of report.added) lines.push(`shelf + ${a.url}  (${a.bytes} bytes${a.cors === '*' ? '' : `; CORS ${a.cors || 'none'}: SRI needs it`}${a.from.length ? `; stands for ${a.from.join(', ')}` : ''})`);
    for (const r of report.refused) lines.push(`not on the shelf: ${r.url} — ${r.why}`);
    const tagCount = report.pages.reduce((n, p) => n + p.changes.length, 0);
    lines.push(`${tagCount} tag(s) ${shelfOnly ? 'would be pinned (--shelf-only: no page changes)' : 'pinned'} in ${report.pages.length} of ${pages.length} page(s)`);
    const off = new Map();
    for (const o of report.offShelf) off.set(o.url, [...(off.get(o.url) || []), `${o.path}:${o.line}`]);
    for (const [u, at] of off) lines.push(`off the shelf (${exactVersion(u) ? '--seed or --add puts it on' : 'loose: --add <exact url> --from it'}): ${u}  ← ${at.length > 3 ? `${at.slice(0, 3).join(', ')} and ${at.length - 3} more` : at.join(', ')}`);
    for (const b of report.byHand) lines.push(`pin by hand (not in a tag): ${b.url}  ← ${b.path}:${b.line}`);
    console.log('\n' + lines.join('\n'));
    console.log(files.length ? `\ndigest ${digest} — to write exactly this: the same command with --write ${digest}` : '\nnothing to change');
  } else {
    if (write !== digest) {
      console.error(`pin-cdn: the change now comes to ${digest}, not ${write}: something moved since the diff was shown. Nothing was written; run it again without --write and look.`);
      process.exit(1);
    }
    const w = writePlan(root, files);
    if (w.changed.length) { console.error(`pin-cdn: changed since it was read, so nothing was written: ${w.changed.join(', ')}`); process.exit(1); }
    console.log(`pin-cdn: wrote ${w.written.length} file(s) (${digest})`);
    for (const p of w.written) console.log(`  ${p}`);
  }
}
