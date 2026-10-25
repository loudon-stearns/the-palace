// schema.mjs — the shape of a placed quote, and the two checks that keep a
// placement honest: the words it is anchored to must be on the page, and the
// quote must say how far it is from its source.
//
// Pure: no filesystem, no network. Imported by place.mjs (the CLI), by the
// STIGMERGY server (src/lib/quotes.js) and by the tests. No shebang — the app
// bundles files it imports by relative path, and esbuild keeps a shebang as a
// syntax error (_ops/stigmergy/app/README.md § gotchas).
//
// A placement lives as one JSON line in the ledger
// `_ops/Palace Quotes/Palace Quotes — placements.jsonl`. The ledger is
// append-only: a retirement is a second line with the same id and
// `status: "retired"`; readers fold by id and the last line wins (foldLedger).
// The target page's own file is never touched — the quote is laid beside its
// words, the way a rich-face piece is (CHILD.md § A page and its folder).

// How far the quote's words are from the source's.
//   verbatim     the source's own words, in its own language
//   translation  a published translation, translator named in source.translator
//   paraphrase   the sense, not the words — attributed as such
//   adapted      the source's line bent to a new use, and said to be
export const FIDELITIES = ['verbatim', 'translation', 'paraphrase', 'adapted'];

// How the wording was checked before it was placed.
//   web       found in a source on the web, matching
//   palace    the words are in a palace page (Loudon's own lines, or a page's)
//   partial   the passage was found but the exact wording was not confirmed
//   recalled  from memory only — the surface shows this plainly
export const CHECKED = ['web', 'palace', 'partial', 'recalled'];

// Where the quote comes from.
//   tradition  a philosopher or a text outside the palace
//   palace     another palace page's words
//   loudon     Loudon's own line
export const SOURCE_KINDS = ['tradition', 'palace', 'loudon'];

// A quote's standing.
//   placed   laid by the agent, awaiting Loudon's read
//   kept     Loudon's yes — it stays, and it is what the public read view shows
//   retired  taken down, with the reason; the line stays in the ledger
export const STATUSES = ['placed', 'kept', 'retired'];

// How the voice was found.
//   open     the open reading: the page and its neighbors first, then whoever
//            in any field has stood exactly here — a voice found, not looked up
//   roster   the floor: a voice from voices.json for the lens that bit
export const MODES = ['open', 'roster'];

// What Loudon (or an elder on his word) can do to a placed quote.
export const DECISIONS = ['keep', 'retire'];

export const PLACED_BY_DEFAULT = 'Palace Quotes';

// The line a decision appends. `keep` on a retired quote revives it — the fold
// takes the last line — so a let-go has an undo.
export function decisionLine(id, decision, { why = '', by = 'loudon', now = new Date() } = {}) {
  const ts = now.toISOString();
  if (decision === 'keep') return { id, status: 'kept', kept_at: ts, decided_by: by, ...(why ? { kept_why: why } : {}) };
  return { id, status: 'retired', retired_at: ts, retired_why: why || `let go by ${by}`, decided_by: by };
}

export function validateDecision({ id, decision, why } = {}) {
  const errors = [];
  if (typeof id !== 'string' || id.trim() === '') errors.push('id: required');
  if (!DECISIONS.includes(decision)) errors.push(`decision: one of ${DECISIONS.join(' | ')}`);
  if (why !== undefined && why !== null && typeof why !== 'string') errors.push('why: a string when given');
  return { ok: errors.length === 0, errors };
}

// Collapse markdown and whitespace so a `near` phrase can be written in plain
// words and still match the page: emphasis marks, backticks, wikilink brackets
// and curly quotes are flattened; runs of whitespace become one space.
export function normalize(s) {
  return String(s ?? '')
    .replace(/[*_`]/g, '')
    .replace(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g, '$1')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Split a markdown body into blocks, each with the nearest heading above it.
// Fences are kept whole so a phrase inside code never anchors a quote; HTML
// comments (graffiti) are dropped. Returns [{ text, heading, start }] where
// `start` is the block's first line number (0-based).
export function bodyBlocks(body) {
  const lines = String(body ?? '').replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let heading = null;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      let j = i + 1;
      while (j < lines.length && !/^```/.test(lines[j])) j += 1;
      i = j + 1;
      continue;
    }
    if (line.trim().startsWith('<!--')) {
      let j = i;
      while (j < lines.length && !lines[j].includes('-->')) j += 1;
      i = j + 1;
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (h) {
      heading = h[2].trim();
      out.push({ text: h[2].trim(), heading, start: i, kind: 'heading' });
      i += 1;
      continue;
    }
    if (line.trim() === '') { i += 1; continue; }
    const start = i;
    const buf = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^```/.test(lines[i]) && !/^#{1,6}\s/.test(lines[i])) {
      buf.push(lines[i].replace(/^>\s?/, '').replace(/^\s*(?:[-*]|\d+\.)\s+/, ''));
      i += 1;
    }
    out.push({ text: buf.join(' '), heading, start, kind: 'block' });
  }
  return out;
}

// Find the block a `near` phrase lives in. Returns
// { found: true, heading, excerpt, start } or { found: false }.
// The excerpt is the matched block, trimmed around the phrase so the surface
// can show the words the quote was laid beside without the whole paragraph.
export function findNear(body, near, { excerptChars = 280 } = {}) {
  const want = normalize(near);
  if (!want) return { found: false };
  for (const b of bodyBlocks(body)) {
    if (b.kind === 'heading') continue;
    const have = normalize(b.text);
    const at = have.indexOf(want);
    if (at === -1) continue;
    return { found: true, heading: b.heading, excerpt: excerptAround(b.text, want, excerptChars), start: b.start };
  }
  return { found: false };
}

// Markdown flattened for display (not for matching): emphasis marks and
// backticks dropped, a wikilink shown by its display text, whitespace to one
// space. Case and quotes are kept so the excerpt reads as the page does.
export function plainText(s) {
  return String(s ?? '')
    .replace(/\[\[([^\]|]+)\|([^\]]*)\]\]/g, '$2')
    .replace(/\[\[([^\]|]+)\]\]/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function excerptAround(text, wantNorm, max) {
  const flat = plainText(text);
  if (flat.length <= max) return flat;
  // A case-insensitive search on the flattened text finds the phrase in
  // nearly every case; the fallback is the block's head.
  const idx = normalize(flat).indexOf(wantNorm);
  if (idx === -1) return `${flat.slice(0, max - 1)}…`;
  const half = Math.floor((max - wantNorm.length) / 2);
  const from = Math.max(0, idx - half);
  const to = Math.min(flat.length, idx + wantNorm.length + half);
  return `${from > 0 ? '…' : ''}${flat.slice(from, to).trim()}${to < flat.length ? '…' : ''}`;
}

// A fresh id: q-<yyyymmdd>-<6 base36>. Date for a human reading the ledger,
// random tail so two agents placing in the same second never collide.
export function newId(now = new Date(), rand = Math.random) {
  const d = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const tail = Math.floor(rand() * 36 ** 6).toString(36).padStart(6, '0');
  return `q-${d}-${tail}`;
}

const nonEmpty = (v) => typeof v === 'string' && v.trim() !== '';

// Validate one placement against the page it lands on.
//   p            the placement (without id/placed_at — those are stamped)
//   targetBody   the target entry's markdown body (null → target not found)
//   lensFound    whether the lens title resolved to a palace entry
// Returns { ok, errors: [], warnings: [] }. Errors refuse the placement;
// warnings go on the record and into the surface.
export function validatePlacement(p, { targetBody = null, lensFound = true } = {}) {
  const errors = [];
  const warnings = [];
  if (!p || typeof p !== 'object') return { ok: false, errors: ['placement must be an object'], warnings };

  if (!nonEmpty(p.quote)) errors.push('quote: required');
  else if (p.quote.length > 600) warnings.push('quote: over 600 characters — a quote is a window, not a wall');
  if (!nonEmpty(p.attribution)) errors.push('attribution: required (who said it)');
  if (!FIDELITIES.includes(p.fidelity)) errors.push(`fidelity: one of ${FIDELITIES.join(' | ')}`);
  if (!CHECKED.includes(p.checked)) errors.push(`checked: one of ${CHECKED.join(' | ')}`);
  if (p.fidelity === 'verbatim' && p.checked === 'recalled') {
    warnings.push('a verbatim quote from memory alone — the surface will show it as unconfirmed');
  }
  if (!p.source || typeof p.source !== 'object') errors.push('source: required ({ kind, work?, locus?, translator?, note? })');
  else {
    if (!SOURCE_KINDS.includes(p.source.kind)) errors.push(`source.kind: one of ${SOURCE_KINDS.join(' | ')}`);
    if (p.fidelity === 'translation' && !nonEmpty(p.source.translator)) warnings.push('translation without a translator named');
  }
  if (!nonEmpty(p.lens)) errors.push('lens: required (the palace philosophy page the target was read through)');
  else if (!lensFound) errors.push(`lens: no palace entry named "${p.lens}"`);
  if (!nonEmpty(p.target)) errors.push('target: required (the page the quote is laid on)');
  else if (targetBody === null) errors.push(`target: no palace entry named "${p.target}"`);
  if (nonEmpty(p.lens) && nonEmpty(p.target) && p.lens === p.target) errors.push('lens and target are the same page — a page cannot be its own glass');
  if (!nonEmpty(p.near)) errors.push('near: required (a phrase from the target, the words the quote is laid beside)');
  else if (p.near.length < 12) warnings.push('near: a short phrase may match the wrong paragraph — twelve characters or more is safer');
  if (!nonEmpty(p.why)) errors.push('why: required (one or two sentences — why this quote, here, through this lens)');
  else if (p.why.length > 700) warnings.push('why: long — the why is a margin note, not an essay');
  if (p.status !== undefined && !STATUSES.includes(p.status)) errors.push(`status: one of ${STATUSES.join(' | ')}`);
  if (p.mode !== undefined && !MODES.includes(p.mode)) errors.push(`mode: one of ${MODES.join(' | ')}`);
  if (p.source && p.source.url !== undefined && !(typeof p.source.url === 'string' && /^https?:\/\//.test(p.source.url))) {
    errors.push('source.url: an http(s) link to where the wording was found');
  }
  // A voice the palace has never heard is where an invented line is most
  // likely, so the rule tightens exactly there: checked on the web, with the
  // source kept on the placement, or not placed.
  if (p.new_voice === true) {
    if (p.checked !== 'web') errors.push('new_voice: a voice the palace has never heard must be checked on the web (checked: web)');
    if (!p.source || !nonEmpty(p.source.url)) errors.push('new_voice: keep the source — source.url — so a reader can meet the person');
  }

  let anchor = null;
  if (targetBody !== null && nonEmpty(p.near)) {
    anchor = findNear(targetBody, p.near);
    if (!anchor.found) errors.push(`near: the phrase "${p.near}" is not on "${p.target}" — anchor to words that are there`);
  }
  return { ok: errors.length === 0, errors, warnings, anchor };
}

// Fold ledger lines by id: later lines override earlier ones field by field,
// so a decision line `{ id, status: 'kept' | 'retired', … }` lands on the
// original placement. Order of first appearance is kept. A line with no id
// (the ledger's own header, below) is not a placement and is skipped.
export function foldLedger(lines) {
  const byId = new Map();
  for (const raw of Array.isArray(lines) ? lines : []) {
    if (!raw || typeof raw !== 'object' || !nonEmpty(raw.id)) continue;
    const prev = byId.get(raw.id);
    byId.set(raw.id, prev ? { ...prev, ...raw } : { ...raw });
  }
  return [...byId.values()];
}

// The ledger's first line: the minimal self-description every bundle file
// carries (SCHEMA — Reference §8 — title, born, a link to the parent, a
// forward vector), as a JSON record with no `id`, so the fold passes over it.
export function ledgerHeader(entry = 'Palace Quotes', born = '2026-10-13') {
  return {
    title: `${entry} — placements`,
    born,
    links: [{ target: `[[${entry}]]`, type: 'connects-to', label: 'ledger-of' }],
    forward_vector: `I am the ledger of every quote ${entry} has laid beside a page: one line per placement, one more per decision, append-only, the last line for an id the one that counts. I never hold a page's words — only the phrase a quote sits beside, and how far the quote is from its source.`,
    format: 'jsonl · one placement per line · a decision line carries the id and a new status',
  };
}

// Parse JSONL text leniently: blank lines skipped, a malformed line is
// reported, never thrown.
export function parseLedger(text) {
  const lines = [];
  const skipped = [];
  String(text ?? '').replace(/^﻿/, '').split(/\r?\n/).forEach((raw, i) => {
    if (!raw.trim()) return;
    try {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) lines.push(obj);
      else skipped.push({ line: i + 1, reason: 'not an object' });
    } catch (e) {
      skipped.push({ line: i + 1, reason: e.message });
    }
  });
  return { lines, skipped };
}

// A short word for a quote's standing, for a tag.
export function statusLabel(status) {
  return { placed: 'awaiting your read', kept: 'kept', retired: 'let go' }[status] || 'placed';
}

// The glyph the surface shows for how trustworthy the wording is.
//   ◉  checked (web/palace) and verbatim
//   ◐  checked, but a translation / paraphrase / adaptation
//   ◇  not confirmed — partial or recalled
export function fidelityGlyph(fidelity, checked) {
  if (checked !== 'web' && checked !== 'palace') return '◇';
  return fidelity === 'verbatim' ? '◉' : '◐';
}

export function fidelityLabel(fidelity, checked) {
  const f = FIDELITIES.includes(fidelity) ? fidelity : 'unknown';
  const c = {
    web: 'checked on the web',
    palace: 'from the palace itself',
    partial: 'passage found, wording unconfirmed',
    recalled: 'from memory — unconfirmed',
  }[checked] || 'unchecked';
  return `${f} · ${c}`;
}
