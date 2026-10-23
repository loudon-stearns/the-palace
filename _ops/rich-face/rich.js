// rich.js — the rich face's renderer, the page's one script: _ops/rich-face/rich.html
// loads it as _rich/rich.js, so the page carries script-src 'self' and an entry's
// text that slipped past the sanitizer below still runs nothing. It reads the
// entry live, lays prose and figures, frames each piece on the piece origin from
// the plan the server sends (contract.mjs), marks drift, and carries the review dock.
import { marked } from '../_vendor/marked/marked.esm.js';
import { parseEntry, sectionProse, sectionKey, fingerprint, mediaKind, isMedia } from './parse.js';

// An entry's own HTML is shown, not run. This page is served from STIGMERGY's
// origin, so a tag that runs script here runs as STIGMERGY. Comments stay unseen
// (agents leave notes in them). Plain formatting tags with no attributes, and a
// div or span whose one attribute is a class, still render — Kuramoto's equation
// piece is laid out that way. Any other tag is escaped and shows as written.
const KEEP_TAGS = new Set(['b', 'strong', 'i', 'em', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup', 'kbd', 'br', 'div', 'span']);
const escapeHtml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function safeHtml(raw) {
  return raw.replace(/<!--[\s\S]*?(?:-->|$)/g, '').replace(/<[^>]*>?/g, (tag) => {
    const m = tag.match(/^<(\/?)([a-z][a-z0-9]*)(\s+class="[\w\s-]*")?\s*\/?>$/i);
    const name = m && m[2].toLowerCase();
    return m && KEEP_TAGS.has(name) && (!m[3] || name === 'div' || name === 'span') ? tag : escapeHtml(tag);
  });
}
marked.use({ renderer: { html: (html) => safeHtml(html) } });

// The guarantee, whatever marked's lexer did on the way. After an inline <kbd>,
// <code>, <pre> or <script> it is "in a raw block" and emits the text that
// follows unescaped, past the renderer above. So the final HTML is parsed inert
// (a <template> runs nothing and loads nothing) and every element and attribute
// this page did not choose is dropped before it reaches innerHTML: markdown's
// own elements, KEEP_TAGS, and per element the attributes listed here.
const ALLOWED = {
  p: [], br: [], hr: [], blockquote: [], ul: [], ol: ['start'], li: [], pre: [], code: ['class'],
  h1: [], h2: [], h3: [], h4: [], h5: [], h6: [], em: [], strong: [], del: [],
  table: [], thead: [], tbody: [], tr: [], th: ['align'], td: ['align'],
  a: ['href', 'title', 'class'], img: ['src', 'alt', 'title'], input: ['type', 'checked', 'disabled'],
  b: [], i: [], u: [], s: [], ins: [], mark: [], small: [], sub: [], sup: [], kbd: [], div: ['class'], span: ['class'],
};
// Gone with everything inside them; any other element not allowed is unwrapped
// and its words kept.
const DROP_WHOLE = new Set(['script', 'style', 'template', 'noscript', 'iframe', 'frame', 'object', 'embed',
  'svg', 'math', 'title', 'textarea', 'select', 'button', 'form', 'link', 'meta', 'base']);
// A link or image goes only to the web, to mail, or somewhere in the palace (a
// relative path); a link may also open the vault in Obsidian (obsidian:, a local
// app, no script). Resolved the way the browser would, so case, spaces and tabs
// can't dress a javascript: URL up as something else. open:, STIGMERGY's own
// pseudo-scheme, never worked here and is not kept.
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
const safeUrl = (v, also = []) => { try { const p = new URL(v, location.href).protocol; return SAFE_PROTOCOLS.has(p) || also.includes(p); } catch { return false; } };
function keepAttr(tag, a) {
  if (!ALLOWED[tag].includes(a.name)) return false;
  if (a.name === 'href') return safeUrl(a.value, ['obsidian:']);
  if (a.name === 'src') return safeUrl(a.value);
  if (a.name === 'class') return /^[\w\s-]*$/.test(a.value);
  if (tag === 'input' && a.name === 'type') return a.value === 'checkbox';
  return true;
}
function sanitize(html) {
  const t = document.createElement('template');
  t.innerHTML = html;
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.COMMENT_NODE) { child.remove(); continue; }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const tag = child.localName;
      if (!Object.hasOwn(ALLOWED, tag) || (tag === 'input' && child.getAttribute('type') !== 'checkbox')) {
        if (DROP_WHOLE.has(tag)) child.remove();
        else { walk(child); child.replaceWith(...child.childNodes); }
        continue;
      }
      for (const a of [...child.attributes]) if (!keepAttr(tag, a)) child.removeAttribute(a.name);
      walk(child);
    }
  };
  walk(t.content);
  return t.innerHTML;
}

const params = new URLSearchParams(location.search);
const ENTRY = params.get('entry') || 'Kuramoto Coupling';
// The public read view serves this page static (scripts/build-public.mjs marks
// it with <meta name="rich:static">): lookups come from data/rich.json, nothing
// is posted, and the text is the snapshot's rather than re-read live.
const STATIC = !!document.querySelector('meta[name="rich:static"]') || window.RICH_STATIC === true;
const REVIEW = !STATIC && params.get('review') !== '0';
const $ = (s, el = document) => el.querySelector(s);
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v; else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null) el.append(c.nodeType ? c : document.createTextNode(c));
  return el;
};
// What a file is comes from parse.js, the one media list; this page keeps none.
const kindOf = mediaKind;
const SMALL = new Set(['audio', 'image', 'text']);

let info, manifest, lastMd = '', entry, lastRead = Date.now();

// ── media urls. Every file the text and manifest name was found by the
// server's one resolver (resolve.mjs) before the page was laid: info.media maps
// each name to { url } or to { error, label }. Live and static read the same
// table; the static build wrote its copy with the served names (a hero is a .jpg
// there). A name met later (a live edit) asks the same resolver. Every URL is
// relative, so the page works at / and under STIGMERGY's /rich/.
function mediaUrl(name) {
  const m = info.media && info.media[name];
  if (m) return m.url || '';
  if (info.bundle && info.files.includes(name)) return info.bundle + encodeURIComponent(name);
  if (STATIC) return '';
  return `_api/media?name=${encodeURIComponent(name)}&from=${encodeURIComponent(info.path || '')}`;
}
// Where a file lands, or why it doesn't → { url } or { error, label }.
async function locate(name) {
  const m = info.media && info.media[name];
  if (m && (m.error || !kindIsPiece(name) || (info.pieces && info.pieces[name]) || STATIC)) return m;
  if (!m && info.bundle && info.files.includes(name) && (!kindIsPiece(name) || STATIC)) return { url: info.bundle + encodeURIComponent(name) };
  if (STATIC) return m || { error: 'missing', label: `No file “${name}” in the read view.` };
  try {
    const r = await fetch(`_api/find?name=${encodeURIComponent(name)}&from=${encodeURIComponent(info.path || '')}`, { cache: 'no-store' });
    const j = await r.json();
    if (r.ok && j.piece) { (info.pieces = info.pieces || {})[name] = j.piece; if (j.pieceOrigin) info.pieceOrigin = j.pieceOrigin; }
    return r.ok ? j : { error: j.reason || 'missing', label: j.label || `No file “${name}”.` };
  } catch (e) { return { error: 'unreachable', label: `“${name}” could not be looked up: ${e.message}` }; }
}
const kindIsPiece = (name) => mediaKind(name) === 'interactive';
const missingBox = (name, label) => h('div', { class: 'rf-missing', role: 'note' }, h('b', {}, name), label);

// ── markdown: Obsidian wikilinks → links to other rich faces ──
function mdToHtml(md, inline = false) {
  const pre = md
    .replace(/!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (m, n) => `![](${mediaUrl(n.trim())})`)
    .replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (m, target, label) => {
      const t = target.trim(), l = (label || t.split('#')[0]).trim();
      if (isMedia(t)) return `[${l}](${mediaUrl(t)})`;
      if (STATIC) {
        // Static: a wikilink opens the entry in the read view, if it was published.
        const p = info.paths && info.paths[t.split('#')[0]];
        return p ? `[${l}](../?entry=${encodeURIComponent(p)} "wl")` : l;
      }
      return `[${l}](?entry=${encodeURIComponent(t.split('#')[0])}${REVIEW ? '' : '&review=0'} "wl")`;
    });
  let html = inline ? marked.parseInline(pre) : marked.parse(pre);
  return sanitize(html.replace(/<a href="([^"]*)" title="wl">/g, '<a class="wl" href="$1">'));
}

// ── the one custom control: an audio strip with no browser chrome ──
function audioStrip(src, label) {
  const a = new Audio(); a.preload = 'metadata'; a.src = src; audios.add(a);
  const btn = h('button', { 'aria-label': 'play' }, '▸');
  const fill = h('i'); const bar = h('div', { class: 'bar' }, fill);
  const t = h('span', { class: 't' }, '0:00');
  const fmt = (s) => isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '–';
  a.addEventListener('loadedmetadata', () => { t.textContent = fmt(a.duration); });
  a.addEventListener('timeupdate', () => { fill.style.width = `${(a.currentTime / (a.duration || 1)) * 100}%`; t.textContent = fmt(a.duration - a.currentTime); });
  a.addEventListener('play', () => { btn.textContent = '❚❚'; document.dispatchEvent(new CustomEvent('rich:play', { detail: a })); });
  a.addEventListener('pause', () => { btn.textContent = '▸'; });
  a.addEventListener('ended', () => { btn.textContent = '▸'; fill.style.width = '0'; });
  btn.onclick = () => (a.paused ? a.play() : a.pause());
  bar.onclick = (e) => { const r = bar.getBoundingClientRect(); a.currentTime = ((e.clientX - r.left) / r.width) * (a.duration || 0); };
  return h('div', { class: 'aud' }, btn, bar, t, h('div', { class: 'lbl' }, label));
}
// ── pieces. Every web page the text or the manifest names runs on the piece
// origin (piece-origin.mjs: 127.0.0.1:8843 beside the app's 5173), framed from
// the plan the server worked out from the piece's declaration, its manifest and
// grants.json (contract.mjs): info.pieces[name] → { url, sameOrigin, allow,
// size, chips, mark, blocked }. The page only builds what the plan says:
//   · allow-same-origin only for a piece that needs its origin (a device,
//     storage, a declared file), and only once its URL is checked to be on
//     another origin than this page's — never on the app's own;
//   · no piece origin (its port taken, or none on this server) → every piece's
//     figure says so; it never falls back to this origin;
//   · the public read view frames pieces opaque, from its own files; a camera
//     or microphone piece opens in its own tab there.
// They speak the kit's protocol over postMessage (kit/piece.js): rich:height,
// rich:held, rich:play, rich:error, rich:camera, rich:storage. A piece is known
// by its frame, and a piece with an origin by that origin too; hush and
// camera-off go to the piece's own origin, or to '*' for an opaque one, which
// no origin can name — they carry nothing but their type.
const audios = new Set();
const frameOf = (win) => [...document.querySelectorAll('iframe')].find((f) => f.contentWindow === win);
const pieceFrameOf = (e) => { const f = frameOf(e.source); return f && (f._target === '*' || e.origin === f._target) ? f : null; };
const tell = (f, msg) => { try { f.contentWindow?.postMessage(msg, f._target || '*'); } catch { /* a frame gone */ } };
function hushAll(except) {
  document.querySelectorAll('video').forEach((v) => { if (v !== except) v.pause(); });
  audios.forEach((x) => { if (x !== except) x.pause(); });
  document.querySelectorAll('iframe').forEach((f) => { if (f.contentWindow !== except) tell(f, { type: 'rich:hush' }); });
}
document.addEventListener('rich:play', (e) => hushAll(e.detail));
// The caps a frame holds a piece to, each named on the figure when it bites.
const CAP = { min: 120, max: 8000 };
const PIECE_HEIGHT = 800;
function capNote(f, words) {
  let n = f._cap;
  if (!words) { if (n) n.hidden = true; return; }
  if (!n) { n = f._cap = h('div', { class: 'rf-cap' }); f.after(n); }
  n.hidden = false; n.textContent = words;
}
window.addEventListener('message', (e) => {
  const type = e.data && e.data.type;
  if (typeof type !== 'string' || !type.startsWith('rich:')) return;
  const f = pieceFrameOf(e);
  if (!f) return;
  const fig = f.closest('figure');
  if (type === 'rich:play') { hushAll(e.source); return; }
  if (type === 'rich:height') {
    if (f._fill) return; // sized from the column, whatever it says
    f._heard = true;
    const asked = Math.ceil(Number(e.data.height));
    if (!(asked > 0)) return;
    const px = Math.min(CAP.max, Math.max(CAP.min, asked));
    f.style.height = px + 'px';
    capNote(f, asked > CAP.max ? `asked for ${asked} px; held at ${CAP.max}, the most a frame takes`
      : asked < CAP.min ? `asked for ${asked} px; held at ${CAP.min}, the least a frame takes` : null);
    return;
  }
  if (type === 'rich:held') { capNote(f, `sized by its own window, so it grows with its frame: held at ${Math.ceil(Number(e.data.height)) || parseInt(f.style.height, 10)} px`); return; }
  if (type === 'rich:camera') {
    if (e.data.on) document.querySelectorAll('iframe').forEach((o) => { if (o !== f) tell(o, { type: 'rich:camera-off' }); });
    return;
  }
  if (type === 'rich:storage' && fig && e.data.kept === false) {
    chip(fig, { text: 'storage · this visit only', state: 'note', title: f._plan && f._plan.needs.includes('storage') ? 'storage that lasts only while the page is open' : 'the piece uses storage it does not declare, so it runs without an origin and its storage lasts only this visit' }, 'storage');
    return;
  }
  // A piece whose script failed says so. Its figure is marked errored and the
  // first error shows under the frame, as STIGMERGY's frames show it, so a
  // broken piece is never a silent blank. The text goes in as text.
  if (type === 'rich:error') {
    if (!fig || fig.dataset.errored) return;
    fig.dataset.errored = '1';
    const mark = fig.querySelector('.rf-mark');
    if (mark) { mark.dataset.mark = 'errored'; mark.textContent = 'errored'; }
    const where = e.data.where ? ` (${String(e.data.where)})` : '';
    (f._cap || f).after(h('div', { class: 'rf-error' }, `the piece reported an error: ${String(e.data.message || 'error')}${where}`));
  }
});

// A chip on a figure: what its piece uses. One per key.
function chip(fig, c, key = c.text) {
  let row = fig.querySelector('.rf-chips');
  if (!row) { row = h('div', { class: 'rf-chips' }); (fig.querySelector('.tag') || fig).before(row); }
  if (row.querySelector(`[data-key="${CSS.escape(key)}"]`)) return;
  row.append(h('span', { class: 'rf-chip', 'data-state': c.state || 'ok', 'data-key': key, title: c.title || null }, c.text));
}
// The figure's mark and chips, from its piece's plan.
function markPiece(fig, el) {
  const plan = el && el._plan;
  if (!plan) return;
  fig.dataset.contract = plan.mark;
  const tag = fig.querySelector('.tag');
  if (tag && !tag.querySelector('.rf-mark')) tag.prepend(h('span', { class: 'rf-mark', 'data-mark': plan.mark, title: plan.mark === 'introduced' ? `the piece declares what it needs (${plan.source === 'manifest' ? 'its manifest speaks for it' : 'in its own head'})` : 'made before the piece contract: it declares nothing, and runs with no origin' }, plan.mark));
  for (const c of plan.chips || []) chip(fig, c);
}

// A file git does not track plays here, on this Mac, and not on the public
// face (Loudon, 2026-10-20): its figure says so, and so does the head's list.
const LOCAL_CHIP = { text: 'only on this Mac', state: 'warn', title: 'git does not track this file, so the public face will not have it: track it to publish' };
function markLocal(fig, names) {
  if (names.some((n) => info.media && info.media[n] && info.media[n].local)) chip(fig, LOCAL_CHIP, 'local');
}
// Every file the face names that git does not track, pieces' declared files too.
function localFiles() {
  const out = new Map();
  for (const [n, m] of Object.entries(info.media || {})) if (m && m.local) out.set(m.path, n);
  for (const plan of Object.values(info.pieces || {})) for (const f of (plan && plan.localFiles) || []) if (!out.has(f)) out.set(f, `declared by ${plan.path.split('/').pop()}`);
  return out;
}

// The frame a plan describes, or the box that says why there is none.
function pieceFrame(name, found, opts = {}) {
  const plan = (info.pieces && info.pieces[name]) || (STATIC ? { url: found.url, sameOrigin: false, allow: 'autoplay', size: { mode: 'flow' }, mark: 'pre-contract', chips: [] } : null);
  if (!plan) return missingBox(name, `No plan came with the page for this piece, so it is not shown.`);
  if (plan.blocked) { const b = missingBox(name, `No piece origin: ${plan.blocked}. A piece never runs on the page's own origin, so it is not shown.`); b._plan = plan; return b; }
  if (plan.tab) {
    const b = h('div', { class: 'rf-tab' }, h('b', {}, name.split('/').pop()),
      `This piece uses the ${(plan.needs || []).includes('camera') ? 'camera' : 'microphone'}, so on the public site it runs in its own tab. `,
      h('a', { href: plan.url, target: '_blank', rel: 'noopener' }, 'open it ↗'));
    b._plan = plan;
    return b;
  }
  let url;
  try { url = new URL(plan.url, location.href); } catch { return missingBox(name, `The piece's address “${plan.url}” is not a URL.`); }
  const sameOrigin = !!plan.sameOrigin && !STATIC && url.origin !== location.origin;
  const f = h('iframe', { sandbox: 'allow-scripts' + (sameOrigin ? ' allow-same-origin' : ''), src: plan.url, loading: 'lazy', allow: plan.allow || 'autoplay', title: name.split('/').pop() });
  f._plan = plan;
  f._target = sameOrigin ? url.origin : '*';
  if (plan.size && plan.size.mode === 'fill') {
    f._fill = plan.size.ratio;
    const fit = () => { if (f.clientWidth) f.style.height = Math.max(CAP.min, Math.round(f.clientWidth / f._fill)) + 'px'; };
    f.style.height = Math.round((opts.height || PIECE_HEIGHT * 0.75)) + 'px';
    new ResizeObserver(fit).observe(f);
  } else {
    const start = opts.height || PIECE_HEIGHT;
    f.style.height = start + 'px';
    // Until the piece says how tall it is, it has its manifest height, or the
    // default; if it never says, the figure names the size it was given.
    f.addEventListener('load', () => setTimeout(() => {
      if (!f._heard) capNote(f, `the piece reported no height; shown at ${start} px, ${opts.height ? 'its manifest height' : 'the default'}`);
    }, 3000), { once: true });
  }
  return f;
}

async function mediaEl(name, opts = {}) {
  const found = await locate(name);
  if (!found.url) return missingBox(name, found.label || `No file “${name}”.`);
  const src = found.url, kind = kindOf(name);
  if (kind === 'video') { const v = h('video', { src, controls: true, preload: 'metadata', playsinline: true }); v.addEventListener('play', () => document.dispatchEvent(new CustomEvent('rich:play', { detail: v }))); return v; }
  if (kind === 'audio') { const s = audioStrip(src, opts.label || name); return s; }
  if (kind === 'image') return h('img', { src, alt: opts.label || name, loading: 'lazy' });
  if (kind === 'interactive') return pieceFrame(name, found, opts);
  if (kind === 'text') {
    const md = (await (await fetch(src, { cache: 'no-store' })).text()).replace(/^---\n[\s\S]*?\n---\n?/, ''); // a bundle file's own frontmatter
    return h('div', { class: 'textpiece', html: mdToHtml(md) });
  }
  return h('a', { href: src }, name);
}

let mermaidMod;
async function diagramEl(code) {
  mermaidMod = mermaidMod || (await import('../_vendor/mermaid/mermaid.esm.min.mjs')).default;
  mermaidMod.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'strict', fontFamily: 'Manrope, system-ui, sans-serif' });
  const box = h('div', { class: 'diagram' });
  try { const { svg } = await mermaidMod.render('m' + Math.random().toString(36).slice(2), code); box.innerHTML = svg; }
  catch (e) { box.textContent = 'diagram did not render: ' + e.message; }
  return box;
}

// A figure the text carries (its caption travels with it, so it can't drift).
async function textFigure(b) {
  const fig = h('figure', { class: 'fig' });
  const media = h('div', { class: 'media' });
  if (b.diagram) media.append(await diagramEl(b.diagram));
  else {
    const [first, ...rest] = b.media;
    media.append(await mediaEl(first.name, { label: first.label }));
    if (rest.length && kindOf(first.name) === 'video') {
      const also = h('div', { class: 'also' }, 'also here: ');
      for (const r of rest) also.append(h('button', { onclick: () => { const v = media.querySelector('video'); v.src = mediaUrl(r.name); v.play(); } }, r.label || r.name), ' ');
      fig._also = also;
    }
  }
  fig.append(media);
  if (b.caption) fig.append(h('figcaption', { html: mdToHtml(b.caption) }));
  if (fig._also) fig.append(fig._also);
  fig.append(h('div', { class: 'tag' }, h('span', {}, 'from the text')));
  fig._kind = b.diagram ? 'diagram' : kindOf(b.media[0].name);
  markPiece(fig, media.firstElementChild);
  if (!b.diagram) markLocal(fig, b.media.map((m) => m.name));
  return fig;
}

// A piece the rich face adds (made or gathered) — the kind that can drift.
async function manifestFigure(p, sec) {
  const fig = h('figure', { class: 'fig', 'data-piece': p.file });
  fig.append(h('div', { class: 'rf-drift', hidden: true }));   // first, so a tall piece can't hide it
  const media = h('div', { class: 'media' }, await mediaEl(p.file, { label: p.title, height: p.height }));
  fig.append(media);
  if (p.caption) fig.append(h('figcaption', { html: mdToHtml(p.caption) }));
  fig.append(h('div', { class: 'tag' },
    h('span', { class: p.origin === 'made' ? 'made' : '' }, p.origin === 'made' ? `made · ${p.by || 'the Shop'}` : 'gathered from the bundle'),
    h('span', {}, `${sec.made || manifest.made || ''}`)));
  fig._kind = kindOf(p.file);
  fig._place = p.place;
  markPiece(fig, media.firstElementChild);
  markLocal(fig, [p.file]);
  return fig;
}

// ── lay one section: prose rows, margin figures, band figures ──
async function laySection(s, idx) {
  const el = h('section', { class: 'sec', id: 's-' + idx, 'data-key': s.key });
  const flags = h('span', { class: 'flags' });
  const label = h('div', { class: 'sec-label' }, h('span', {}, s.level === 1 ? 'Opening' : `§ ${String(idx).padStart(2, '0')}`), flags);
  el.append(label);
  if (s.level > 1) el.append(h('h2', { html: mdToHtml(s.heading, true) }));

  const rows = [];
  let cur = null;
  const newRow = () => { cur = { prose: h('div', { class: 'prose' }), margin: h('div', { class: 'margin' }), band: h('div', { class: 'band' }) }; rows.push(cur); return cur; };
  const place = (fig) => {
    const small = fig._place ? fig._place === 'margin' : SMALL.has(fig._kind);
    if (!cur) newRow();
    if (small) (cur.band.childElementCount ? newRow() : cur).margin.append(fig);
    else cur.band.append(fig);
  };

  // Where each manifest piece goes: right after the paragraph that holds its
  // `near` phrase, or right after the figure whose file it names; otherwise at
  // the section's end. A `near` that no longer matches is itself a drift sign.
  const norm = (t) => t.replace(/[*_`]/g, '').replace(/\s+/g, ' ').toLowerCase();
  const ms = manifestSection(s.key);
  const afterProse = new Map(), afterFig = new Map(), atEnd = [];
  const proseBlocks = s.blocks.filter((b) => b.type === 'prose');
  const figNames = new Set(s.blocks.filter((b) => b.type === 'figure' && !b.diagram).flatMap((b) => b.media.map((m) => m.name)));
  for (const p of (ms && ms.pieces) || []) {
    if (p.near && figNames.has(p.near)) { (afterFig.get(p.near) || afterFig.set(p.near, []).get(p.near)).push(p); continue; }
    const i = p.near ? proseBlocks.findIndex((b) => norm(b.md).includes(norm(p.near))) : -1;
    if (i >= 0) (afterProse.get(i) || afterProse.set(i, []).get(i)).push(p);
    else atEnd.push({ ...p, _lostNear: p.near || null });
  }
  const placePieces = async (list) => { for (const p of list || []) { const fig = await manifestFigure(p, ms); fig._lostNear = p._lostNear; place(fig); } };

  let pi = 0;
  for (const b of s.blocks) {
    if (b.type === 'prose') {
      if (!cur || cur.band.childElementCount || cur.margin.childElementCount) newRow();
      cur.prose.append(h('div', { 'data-prose': `${idx}:${pi}`, html: mdToHtml(b.md) }));
      await placePieces(afterProse.get(pi));
      pi++;
    } else {
      place(await textFigure(b));
      if (!b.diagram) for (const m of b.media) await placePieces(afterFig.get(m.name));
    }
  }
  await placePieces(atEnd);

  for (const r of rows) {
    if (r.prose.childElementCount || r.margin.childElementCount) el.append(h('div', { class: 'row' }, r.prose, r.margin));
    if (r.band.childElementCount) el.append(r.band);
  }

  if (REVIEW) {
    const k = noteKey(s.key);
    const ta = h('textarea', { placeholder: `A note on “${s.heading}” — the words, the pieces, or both.` });
    ta.value = localStorage.getItem(k) || '';
    const box = h('div', { class: 'rf-note' }, ta);
    const pin = h('button', { class: 'pin' + (ta.value ? ' has' : ''), title: 'leave a note on this section' }, ta.value ? '◆ note' : '◇ note');
    pin.onclick = () => { box.classList.toggle('open'); if (box.classList.contains('open')) ta.focus(); };
    ta.oninput = () => { localStorage.setItem(k, ta.value); pin.className = 'pin' + (ta.value ? ' has' : ''); pin.textContent = ta.value ? '◆ note' : '◇ note'; countNotes(); };
    flags.append(pin);
    label.after(box);
  }
  return el;
}

function manifestSection(key) { return manifest && (manifest.sections || []).find((m) => sectionKey(m.heading) === key); }

// ── drift: compare each made piece's stamp against the prose it serves ──
async function checkDrift() {
  let lagging = 0;
  for (const s of entry.sections) {
    const ms = manifestSection(s.key);
    if (!ms) continue;
    const now = await fingerprint(sectionProse(s));
    const drifted = ms.made_against && ms.made_against !== now;
    const secEl = document.querySelector(`section.sec[data-key="${CSS.escape(s.key)}"]`);
    if (!secEl) continue;
    secEl.querySelectorAll('figure[data-piece]').forEach((fig) => {
      const d = fig.querySelector('.rf-drift');
      const notes = [];
      if (drifted) notes.push(`made against an earlier version of this section — the words have changed since ${ms.made || 'it was made'}`);
      if (fig._lostNear) notes.push(`its anchor phrase “${fig._lostNear}” is gone from the text — placed at the section's end`);
      d.hidden = !notes.length; d.textContent = notes.join(' · ');
      d.title = drifted ? `stamped ${ms.made_against} · text now ${now}` : '';
      if (notes.length) lagging++;
    });
    const flags = secEl.querySelector('.flags');
    let lag = flags.querySelector('.lag');
    if (drifted && !lag) { lag = h('span', { class: 'lag', style: 'color:var(--warn)' }, '◐ may lag the text'); flags.prepend(lag); }
    if (!drifted && lag) lag.remove();
  }
  return lagging;
}

// ── review dock: one note per section, one for the page; send → STIGMERGY ──
const round = () => (manifest && manifest.round) || 1;
const noteKey = (k) => `richface:${ENTRY}:r${round()}:${k}`;
function countNotes() {
  let n = 0;
  for (const s of entry.sections) if ((localStorage.getItem(noteKey(s.key)) || '').trim()) n++;
  if (($('#overall').value || '').trim()) n++;
  $('#dock-count').textContent = `${n} note${n === 1 ? '' : 's'}`;
  return n;
}
function collectNotes() {
  const groups = {};
  for (const s of entry.sections) { const v = (localStorage.getItem(noteKey(s.key)) || '').trim(); if (v) groups[s.name] = { note: v }; }
  return { task: `rich-face:${ENTRY}:round-${round()}`, groups, overall: { note: ($('#overall').value || '').trim(), round: round(), url: location.href } };
}
function mountDock() {
  const dock = $('#dock'); dock.hidden = false;
  $('#dock-head').onclick = () => dock.classList.toggle('open');
  const ok = noteKey('__overall');
  $('#overall').value = localStorage.getItem(ok) || '';
  $('#overall').oninput = () => { localStorage.setItem(ok, $('#overall').value); countNotes(); };
  $('#copy').onclick = async () => {
    const d = collectNotes();
    const md = [`# Review — ${ENTRY} rich face, round ${round()}`, '', d.overall.note && `**The whole page:** ${d.overall.note}`, '',
      ...Object.entries(d.groups).map(([k, v]) => `**${k}:** ${v.note}`)].filter((x) => x !== false && x !== '').join('\n\n');
    try { await navigator.clipboard.writeText(md); $('#dock-msg').textContent = 'Copied as markdown.'; } catch { $('#dock-msg').textContent = 'Clipboard blocked — use Send.'; }
  };
  $('#send').onclick = async () => {
    const d = collectNotes();
    if (!countNotes()) { $('#dock-msg').textContent = 'Nothing to send yet.'; return; }
    $('#dock-msg').textContent = 'Sending…';
    try {
      const r = await fetch('_api/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
      const j = await r.json();
      $('#dock-msg').textContent = r.ok ? `On the board — ${j.message_id}. The next session reads it from there.` : `Not sent: ${j.error || JSON.stringify(j.board_response)}`;
    } catch (e) { $('#dock-msg').textContent = 'Not sent: ' + e.message; }
  };
  countNotes();
}

// ── room tone: the page's bed, low and looped ──
function mountBed() {
  const bed = manifest && manifest.page && manifest.page.bed;
  if (!bed) return;
  const btn = $('#bed'); btn.hidden = false;
  const a = new Audio(mediaUrl(bed.file)); a.loop = true; a.volume = 0;
  let target = bed.volume || 0.18, raf;
  const fade = (to) => { cancelAnimationFrame(raf); const step = () => { a.volume += (to - a.volume) * 0.06; if (Math.abs(to - a.volume) > 0.004) raf = requestAnimationFrame(step); else { a.volume = to; if (!to) a.pause(); } }; step(); };
  btn.onclick = () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', on); btn.textContent = on ? 'room tone ❚❚' : 'room tone ▸';
    if (on) { a.play(); fade(target); } else fade(0);
  };
}

// ── live: re-read the text every few seconds ──
const structureOf = (e) => e.sections.map((s) => s.key + ':' + s.blocks.map((b) => b.type === 'prose' ? 'p' : 'f' + (b.diagram ? 'd' : b.media.map((m) => m.name).join('+'))).join(',')).join('|');
let lastManifest = '';
async function poll() {
  try {
    if (info.manifest) {
      const mt = await (await fetch(info.manifest, { cache: 'no-store' })).text();
      if (lastManifest && mt !== lastManifest) { manifest = JSON.parse(mt); await checkDrift(); }
      lastManifest = mt;
    }
    const md = await (await fetch(info.md, { cache: 'no-store' })).text();
    lastRead = Date.now();
    if (md !== lastMd) {
      const next = parseEntry(md);
      if (structureOf(next) !== structureOf(entry)) { $('#banner').hidden = false; }
      else {
        next.sections.forEach((s, i) => s.blocks.filter((b) => b.type === 'prose').forEach((b, j) => {
          const el = document.querySelector(`[data-prose="${i}:${j}"]`); if (el) el.innerHTML = mdToHtml(b.md);
        }));
        entry = next; await checkDrift();
      }
      lastMd = md;
    }
  } catch { /* the server may be restarting; try again */ }
}
if (!STATIC) setInterval(poll, 3000);
if (!STATIC) setInterval(() => { const s = Math.round((Date.now() - lastRead) / 1000); $('#sync').innerHTML = `text <b>live</b> · read ${s < 2 ? 'just now' : s + 's ago'}`; }, 1000);

// ── the face switch ──
// The same switch the reader carries (_ops/stigmergy/app/src/components/FaceSwitch.jsx):
// the entry's faces in a fixed order — text, rich, scroll — with this one lit.
// The bundle is the signal: a scroll shows when the entry's own folder holds
// `<Name> — scroll.md`. Mounted at `<base>rich/` (STIGMERGY, the read view) the
// text and scroll open there; served alone, the text opens in Obsidian and
// the scroll isn't offered. F cycles.
function layFaces() {
  // The entry's palace-relative path (static: given; live: the served URL is that path).
  const mdRel = info.path || decodeURIComponent(info.md).replace(/^\//, '');
  const stem = info.title;
  const underApp = /\/rich\/$/.test(location.pathname);
  const obsidian = `obsidian://open?vault=The%20Palace&file=${encodeURIComponent(mdRel.replace(/\.md$/, ''))}`;
  const href = {
    text: underApp ? `../?entry=${encodeURIComponent(mdRel)}` : obsidian,
    // Live, the scroll view on the PROJECTS deck; static, the scroll itself in the reader.
    scroll: !underApp || !(info.files || []).includes(`${stem} — scroll.md`) ? null
      : STATIC ? `../?entry=${encodeURIComponent(`${mdRel.replace(/\.md$/, '')}/${stem} — scroll.md`)}`
      : `../?deck=projects&project=${encodeURIComponent(stem)}`,
  };
  const faces = $('#faces');
  for (const f of ['text', 'rich', 'scroll']) {
    if (f === 'rich') faces.append(h('a', { class: 'btn', 'aria-current': 'page' }, 'rich'));
    else if (href[f]) faces.append(h('a', { class: 'btn', href: href[f] }, f));
  }
  faces.hidden = false;
  // Obsidian stays one click away on your own machine, outside the switch.
  if (!STATIC && underApp && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
    $('#obs').href = obsidian; $('#obs').hidden = false;
  }
  const order = [...faces.querySelectorAll('a.btn')];
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || (e.key !== 'f' && e.key !== 'F')) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    const i = order.findIndex((a) => a.getAttribute('aria-current') === 'page');
    const next = order[(i + 1) % order.length];
    if (next && next.href) { e.preventDefault(); location.assign(next.href); }
  });
}

// ── boot ──
document.getElementById('relay').addEventListener('click', () => location.reload());

async function boot() {
  const r = await fetch(STATIC ? '../data/rich.json' : `_api/resolve?entry=${encodeURIComponent(ENTRY)}`);
  info = r.ok ? (STATIC ? (((await r.json()).entries || {})[ENTRY] || null) : await r.json()) : null;
  if (!info) { $('#sections').append(h('div', { class: 'err' }, `No entry named “${ENTRY}”.`)); return; }
  if (STATIC) $('#sync').innerHTML = 'text <b>snapshot</b>';
  document.title = `${info.title} · rich face`;
  manifest = info.manifest ? await (await fetch(info.manifest, { cache: 'no-store' })).json() : null;
  lastMd = await (await fetch(info.md, { cache: 'no-store' })).text();
  entry = parseEntry(lastMd);
  layFaces();

  // head
  const fm = entry.fm, head = $('#head');
  if (entry.hero) head.append(h('img', { class: 'hero', src: mediaUrl(entry.hero), alt: '' }));
  head.append(h('div', { class: 'eyebrow' }, [fm.type, fm.stage].filter(Boolean).join(' · ') || 'entry'));
  head.append(h('h1', {}, entry.title));
  if (fm.forward_vector) head.append(h('p', { class: 'fv' }, fm.forward_vector));
  if (fm.pillars) head.append(h('div', { class: 'meta' }, fm.pillars.join(' / ')));

  // sections
  const main = $('#sections');
  for (let i = 0; i < entry.sections.length; i++) main.append(await laySection(entry.sections[i], i));

  // lost: manifest sections whose heading no longer exists
  const keys = new Set(entry.sections.map((s) => s.key));
  const lost = (manifest && manifest.sections || []).filter((m) => !keys.has(sectionKey(m.heading)));
  // A heading renamed without touching its words keeps its fingerprint — so a
  // lost section whose stamp matches a current section was probably renamed.
  const fpNow = new Map();
  for (const s of entry.sections) fpNow.set(await fingerprint(sectionProse(s)), s.name);
  for (const m of lost) for (const p of m.pieces || []) {
    const fig = await manifestFigure(p, m);
    const renamed = m.made_against && fpNow.get(m.made_against);
    fig.querySelector('.rf-drift').hidden = false;
    fig.querySelector('.rf-drift').textContent = `was placed under “${m.heading}”, which the text no longer has`
      + (renamed ? ` — its words are still here, under “${renamed}”: probably a rename` : '');
    $('#lost-body').append(fig);
  }
  $('#lost').hidden = !lost.length;

  // ledger: what the page is made of
  const textFigs = entry.sections.reduce((n, s) => n + s.blocks.filter((b) => b.type === 'figure').length, 0);
  const pieces = (manifest && manifest.sections || []).flatMap((m) => m.pieces || []);
  const made = pieces.filter((p) => p.origin === 'made').length;
  const lagging = await checkDrift();
  const ledger = h('div', { class: 'ledger' },
    h('span', {}, manifest ? `enriched · ${manifest.tier || 'sketch'} · ${manifest.made || ''}` : 'not yet enriched'),
    h('span', {}, `${textFigs} carried by the text`),
    manifest && h('span', {}, `${pieces.length - made} gathered`),
    manifest && h('span', {}, `${made} made`),
    lagging ? h('span', { style: 'color:var(--warn)' }, `${lagging} may lag the text`) : null);
  head.append(ledger);
  // What the public face will lack, named, so an author can track it on purpose.
  const local = STATIC ? new Map() : localFiles();
  if (local.size) {
    head.append(h('details', { class: 'rf-local' },
      h('summary', {}, `${local.size} file${local.size === 1 ? '' : 's'} only on this Mac`),
      h('p', {}, 'Git does not track these, so they play here and not on the public face. To publish one, track it: ',
        h('code', {}, 'node _ops/rich-face/untracked.mjs'), ' lists them with the step for each.'),
      h('ul', {}, [...local].map(([path, as]) => h('li', {}, h('code', {}, path), as && as !== path.split('/').pop() ? ` (${as})` : '')))));
  }

  $('#sig').append(h('span', { class: 'wm', html: 'Loud’n <i>Live</i>' }),
    h('span', {}, 'the text is the truth · this face is a reading of it'));

  mountBed();
  if (REVIEW) mountDock();
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
}
boot().catch((e) => { $('#sections').append(h('div', { class: 'err' }, 'The page could not be laid: ' + e.message)); console.error(e); });
