// scroll-view.js — pure helpers for rendering a project scroll in the terminal.
// No DOM, no React; unit-tested. The scroll's zones arrive as markdown text
// from GET /api/projects/scroll; these split the making trail into sections
// and lift each section's artifacts so ArtifactSlot can render them inline.

const ENTRY_RE = /<!--\s*scroll:entry id="([^"]+)"\s*-->([\s\S]*?)<!--\s*\/scroll:entry\s*-->/g;
const MEDIA_EXT = /\.(png|jpe?g|gif|webp|svg|wav|mp3|ogg|m4a|flac|mp4|mov|html?|pdf)$/i;

/**
 * Split the making zone into sections: [{ id, heading, body, artifacts }],
 * in file order (newest first). Text outside entry markers (a hand-written
 * note, the empty-trail placeholder) becomes a section with id null.
 */
export function parseMakingSections(makingText) {
  const text = String(makingText || '');
  const out = [];
  let last = 0;
  let m;
  ENTRY_RE.lastIndex = 0;
  while ((m = ENTRY_RE.exec(text)) !== null) {
    const before = text.slice(last, m.index).trim();
    if (before) out.push(freeSection(before));
    out.push(entrySection(m[1], m[2]));
    last = m.index + m[0].length;
  }
  const tail = text.slice(last).trim();
  if (tail) out.push(freeSection(tail));
  return out;
}

function freeSection(body) {
  return { id: null, heading: null, body, footer: null, artifacts: liftArtifacts(body) };
}

function entrySection(id, inner) {
  const lines = inner.replace(/^\n+/, '').split('\n');
  let heading = null;
  if (lines.length && /^###\s+/.test(lines[0])) heading = lines.shift().replace(/^###\s+/, '').trim();
  // The section's closing `<sub>…</sub>` line (id, board, version) is a footer,
  // not prose — the markdown reader would show the tag raw.
  let footer = null;
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  const fm = lines.length ? /^<sub>(.*)<\/sub>$/.exec(lines[lines.length - 1].trim()) : null;
  if (fm) { footer = fm[1].replace(/`/g, ''); lines.pop(); }
  const body = lines.join('\n').trim();
  return { id, heading, body, footer, artifacts: liftArtifacts(body) };
}

/**
 * The palace path a trail link names, or null. A scroll is written by many
 * hands, so one file arrives in every form the palace writes (2026-10-18
 * census: 39 web pages on 16 scrolls missed the trail for their form alone):
 * a plain path, spaces and all, which is most project bundles; one in
 * <angle brackets> or %20-encoded; `open:<path>`, the open-in-its-app link;
 * an `obsidian://open?…&file=<path>` vault link; a palace-absolute `/path`.
 * A web address is not a palace file.
 */
export function palacePathOf(target) {
  let t = String(target || '').trim();
  if (t.startsWith('<') && t.endsWith('>')) t = t.slice(1, -1).trim();
  t = t.replace(/\s+"[^"]*"$/, '');
  if (/^obsidian:/i.test(t)) {
    try { t = new URL(t).searchParams.get('file') || ''; } catch { return null; }
  } else if (/^open:/i.test(t)) {
    t = t.slice('open:'.length);
  } else if (/^[a-z][a-z0-9+.-]*:/i.test(t)) {
    return null;
  }
  if (/%[0-9a-f]{2}/i.test(t)) { try { t = decodeURIComponent(t); } catch { /* keep it as written */ } }
  t = t.replace(/^\/+/, '').trim();
  return t || null;
}

/** Markdown links whose target is a palace media file → [{ path, caption }]. */
export function liftArtifacts(body) {
  const out = [];
  const re = /\[([^\]]*)\]\(\s*(<[^>]*>|[^)]*?)\s*\)/g;
  let m;
  while ((m = re.exec(String(body || ''))) !== null) {
    const path = palacePathOf(m[2]);
    if (!path || !MEDIA_EXT.test(path)) continue;
    if (out.some((a) => a.path === path)) continue;
    out.push({ path, caption: m[1] || null });
  }
  return out;
}

/** "3 days ago" / "today" / '' for a timestamp. */
export function ageOf(ts, now = Date.now()) {
  const t = ts ? Date.parse(ts) : NaN;
  if (Number.isNaN(t)) return '';
  const d = Math.max(0, Math.round((now - t) / 86400000));
  if (d === 0) return 'today';
  if (d === 1) return '1d';
  if (d < 60) return `${d}d`;
  return `${Math.round(d / 30)}mo`;
}

/**
 * The one-word signal for a project row, and its tone. Order matters: what
 * needs Loudon outranks what he can advance, which outranks a stall.
 */
export function rowSignal(row) {
  if (!row) return { text: '—', tone: 'dim' };
  if (row.running) return { text: row.run ? `running ${row.run.position}/${row.run.cap}` : 'running', tone: 'warn' };
  if (row.open_asks > 0) return { text: row.open_blocking ? 'paused on you' : `${row.open_asks} ask${row.open_asks === 1 ? '' : 's'}`, tone: 'warn' };
  if (row.answered_unconsumed > 0) return { text: `${row.answered_unconsumed} ready`, tone: 'ok' };
  if (row.stalled) return { text: 'stalled', tone: 'err' };
  if (row.barren_streak > 0) return { text: 'barren once', tone: 'warn' };
  if (!row.stewarded) return { text: 'no steward', tone: 'dim' };
  return { text: 'steady', tone: 'dim' };
}

/** Group rows for the table: needs you · ready · stuck · tended · untended. */
export function groupProjects(rows) {
  const g = { needs_you: [], ready: [], stuck: [], tended: [], untended: [] };
  for (const r of rows || []) {
    if (r.running || r.open_asks > 0) g.needs_you.push(r);
    else if (r.answered_unconsumed > 0) g.ready.push(r);
    else if (r.stalled) g.stuck.push(r);
    else if (r.stewarded) g.tended.push(r);
    else g.untended.push(r);
  }
  return g;
}

// ── the trail as cards (2026-10-13) ─────────────────────────────────────────
// A making section is keyed on its board message id, and the app already holds
// the board. Joining the two lets the trail render each made thing the way the
// Trickster card rendered it the day it shipped — headline, ground, catch-up,
// prose, equations, tables, artifacts, and the decision Loudon filed — instead
// of the flattened markdown the scroll file keeps. The file stays the durable
// text; the card is how it is played.

const HEAVY_EXT = /\.(html?|mp4|mov|pdf)$/i;

/** The board message a section was written from, or null. */
export function messageForSection(section, messages) {
  if (!section || !section.id || !Array.isArray(messages)) return null;
  return messages.find((m) => m && m.id === section.id) || null;
}

/** Loudon's answer to this message, if it was an ask: { option, notes, ts } or null. */
export function decisionFor(msg, messages) {
  if (!msg || !Array.isArray(messages)) return null;
  const key = msg.request_id != null ? msg.request_id : msg.id;
  const g = messages.find((m) => m && (m.type === 'RESOURCE_GRANT' || m.type === 'RESOURCE_DENY') && m.re === key);
  if (!g) return null;
  const p = g.payload || {};
  return { option: p.option_label || p.option_id || (g.type === 'RESOURCE_DENY' ? 'denied' : 'granted'), notes: typeof p.notes === 'string' && p.notes.trim() ? p.notes.trim() : null, ts: g.ts || null };
}

/**
 * What a making card shows. With a message: the payload's fields, artifacts split
 * into `light` (images, audio — mount when the card is near) and `heavy` (web,
 * video, pdf — each mounts only while it is near the screen, and unloads once
 * you have scrolled past). Without one: the section's own prose and lifted
 * artifacts.
 */
export function cardSpec(section, messages) {
  const msg = messageForSection(section, messages);
  if (!msg) {
    return { id: section.id, heading: section.heading, fromMessage: false, prose: section.body, artifacts: splitHeavy(section.artifacts), footer: section.footer };
  }
  const p = msg.payload || {};
  const arts = [];
  if (Array.isArray(p.artifacts)) for (const a of p.artifacts) if (a && a.path) arts.push({ path: a.path, caption: a.caption || null });
  if (typeof p.artifact_path === 'string' && p.artifact_path && !arts.some((a) => a.path === p.artifact_path)) arts.push({ path: p.artifact_path, caption: p.caption || null });
  for (const a of section.artifacts || []) if (!arts.some((x) => x.path === a.path)) arts.push(a);
  return {
    id: section.id,
    heading: section.heading,
    fromMessage: true,
    ts: msg.ts || null,
    type: msg.type,
    headline: p.headline || p.subject || null,
    ground: p.ground || null,
    catchup: p.catchup || null,
    prose: typeof p.content === 'string' ? p.content : (typeof p.rationale === 'string' ? p.rationale : ''),
    payload: p,
    artifacts: splitHeavy(arts),
    leftRough: p.left_rough || null,
    nextMoves: Array.isArray(p.next_moves) ? p.next_moves.map(String) : [],
    options: Array.isArray(p.options) ? p.options.filter((o) => o && (o.id || o.label)).map((o) => ({ id: o.id || null, label: o.label || o.id })) : [],
    decision: decisionFor(msg, messages),
    footer: section.footer,
  };
}

function splitHeavy(artifacts) {
  const light = [], heavy = [];
  for (const a of artifacts || []) (HEAVY_EXT.test(a.path) ? heavy : light).push(a);
  return { light, heavy };
}
