// ledger.js — what a page's ledgers say, for its scroll and its next run.
//
// A ledger is an append-only file a page keeps in its bundle so its next run
// or waking starts from what came before (SCHEMA — Reference §6 and §8). Any
// page may keep one, and several; the kinds read here are the two a scroll
// shows: the tuning ledger (`[Entry] — tuning.md`) and the diary
// (`[Entry] — diary.md`). Each says how it is kept in its own frontmatter
// (`ledger`, `standards`).
//
// A tuning ledger holds one run line for every run, whatever it taught:
//
//   - run · 2026-09-25 · v1.1 · close-2026-09-25-ceremonies · taught item 31
//   - run · 2026-10-15 · cycle 38 · nothing new          (a page with no version)
//
// numbered items for what a run taught, Loudon's one-shot orders, owed
// until a run pays them: `- from Loudon · <date> · <his words> · owed`, and a
// steward's proposals for canon, numbered items owed until Loudon's review
// (Loudon, 2026-10-18; see Proposals for canon below). Version
// changes are read from git: the commits where the page's version value
// changed. Trail sections are keyed on the version commit or on the run line
// itself, so re-materializing a scroll never duplicates or deletes.
//
// Which pages are ceremonies is not decided here — a ledger no longer marks
// one; `trigger:` does (ceremony-scroll.js). Canon: [[The Scroll]], [[SCHEMA]].

import { existsSync, readFileSync, readdirSync, appendFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolveBundleDir, EXCLUDE_DIRS } from './entry-paths.js';
import { parseFrontmatter } from './entry-frontmatter.js';

const day = (iso) => (iso ? String(iso).slice(0, 10) : '—');

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$)/;

/** A ledger's text with its frontmatter cut, so `standards` never reads as a line. */
export function ledgerBody(text) {
  return String(text || '').replace(FRONTMATTER_RE, '');
}

/** The local calendar date of a moment, YYYY-MM-DD — the date the palace's ledgers use. */
export function localDate(ts = new Date()) {
  const d = ts instanceof Date ? ts : new Date(ts);
  if (Number.isNaN(d.getTime())) return day(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "2" → "2.0"; strips quotes. So a quoting fix never reads as a spec change. */
export function normVersion(v) {
  if (v == null) return null;
  const s = String(v).trim().replace(/^["']|["']$/g, '');
  if (!s) return null;
  return /^\d+$/.test(s) ? `${s}.0` : s;
}

// ── Run lines ───────────────────────────────────────────────────────────────

// `- run · <date> · [v<version> ·] [<what it ran on> ·] <outcome>`. The version
// is there when the page has one; the outcome is `nothing new` or `taught
// item N`, and is whatever follows the last separator.
const RUN_RE = /^- run · (\d{4}-\d{2}-\d{2}) · (.+?)\s*$/;
// `v1.2`, `v2`, or a bare dotted `1.2` — never a "what" such as `2D`.
const VERSION_FIELD_RE = /^(?:v(\d[\w.]*)|(\d+(?:\.\d+)+))$/;

/** One run line → { date, version, what, outcome }, or null. */
export function parseRunLine(line) {
  const m = RUN_RE.exec(String(line || ''));
  if (!m) return null;
  let rest = m[2];
  let version = null;
  const first = rest.indexOf(' · ');
  const head = first >= 0 ? rest.slice(0, first) : rest;
  const vm = VERSION_FIELD_RE.exec(head.trim());
  if (vm && first >= 0) { version = normVersion(vm[1] || vm[2]); rest = rest.slice(first + 3); }
  const cut = rest.lastIndexOf(' · ');
  return {
    date: m[1],
    version,
    what: cut >= 0 ? rest.slice(0, cut).trim() : '',
    outcome: (cut >= 0 ? rest.slice(cut + 3) : rest).trim(),
  };
}

/**
 * Every run line in a ledger, in file order (newest last). Each carries a key
 * made from the line itself, so a trail section keyed on it survives a union
 * merge that reorders lines; a second identical line gets its own key.
 */
export function parseRuns(ledgerText) {
  const seen = new Map();
  const out = [];
  String(ledgerText || '').split('\n').forEach((line, index) => {
    const r = parseRunLine(line);
    if (!r) return;
    const text = line.trim();
    const h = createHash('sha1').update(text).digest('hex').slice(0, 10);
    const n = (seen.get(h) || 0) + 1;
    seen.set(h, n);
    out.push({ ...r, line: text, index, key: `run-${h}${n > 1 ? `-${n}` : ''}` });
  });
  return out;
}

/** The run line a run leaves (SCHEMA — Reference §6). No version, no field. */
export function runLine({ date, version = null, what = '', outcome = 'nothing new' }) {
  const v = normVersion(version);
  const w = String(what || '').replace(/\s+/g, ' ').replace(/ · /g, ', ').trim();
  return `- run · ${date}${v ? ` · v${v}` : ''} · ${w ? `${w} · ` : ''}${outcome}`;
}

/** How a run reads in a list: its date, what it ran on, what it taught. */
export function runText(r) {
  return `${r.date} — ${r.what || 'a run'} · ${r.outcome}`;
}

/** The date of the newest run line, or null — what `last_tested` used to keep by hand. */
export function lastRunDate(ledgerText) {
  const runs = parseRuns(ledgerText);
  return runs.length ? runs.map((r) => r.date).sort().pop() : null;
}

// ── Loudon's one-shot orders ────────────────────────────────────────────────

// `- from Loudon · <date> · <his words> · owed` — the last field says `owed`
// until a run acts on it and replaces it with what it did. Standing orders are
// not here: they live on the page's scroll (scroll-file.js).
const ORDER_RE = /^- from Loudon · (\d{4}-\d{2}-\d{2}) · (.+) · ([^·]+?)\s*$/;

/** The line a one-shot order becomes. His words go in whole, on one line. */
export function orderLine(date, words) {
  return `- from Loudon · ${date} · ${String(words || '').replace(/\s+/g, ' ').trim()} · owed`;
}

/**
 * Loudon's orders in a ledger: [{ date, text, status, owed }]. A union merge
 * can keep both forms of a line paid in place — the paid one and the stale
 * owed one (SCHEMA — Reference §6) — so an order paid anywhere is paid.
 */
export function parseOrders(ledgerText) {
  const all = [];
  for (const line of String(ledgerText || '').split('\n')) {
    const m = ORDER_RE.exec(line);
    if (m) all.push({ date: m[1], text: m[2].trim(), status: m[3].trim() });
  }
  const isOwed = (o) => /^owed$/i.test(o.status);
  const k = (o) => `${o.date}\u0000${o.text}`;
  const paid = new Set(all.filter((o) => !isOwed(o)).map(k));
  const shown = new Set();
  const out = [];
  for (const o of all) {
    if (isOwed(o) && paid.has(k(o))) continue;
    if (shown.has(`${k(o)}\u0000${o.status}`)) continue;
    shown.add(`${k(o)}\u0000${o.status}`);
    out.push({ ...o, owed: isOwed(o) });
  }
  return out;
}

/**
 * Pay one-shot orders in place: the run that acts on an order replaces `owed`
 * with what it did (SCHEMA — Reference §6). Each ref names an owed order by its
 * date (`2026-10-15`) or by its words, whole or their opening. Returns the
 * number of lines paid. An order already paid is left alone.
 */
export function payOrders(ledgerPath, refs, how) {
  const wanted = (refs || []).map((r) => String(r || '').replace(/\s+/g, ' ').trim().toLowerCase()).filter(Boolean);
  if (!wanted.length || !existsSync(ledgerPath)) return 0;
  const text = readFileSync(ledgerPath, 'utf8');
  let n = 0;
  const out = text.split('\n').map((line) => {
    const m = ORDER_RE.exec(line);
    if (!m || !/^owed$/i.test(m[3].trim())) return line;
    const words = m[2].replace(/\s+/g, ' ').trim().toLowerCase();
    const hit = wanted.some((w) => w === m[1] || words === w || words.startsWith(w) || w.startsWith(words));
    if (!hit) return line;
    n += 1;
    return `- from Loudon · ${m[1]} · ${m[2].trim()} · ${String(how).replace(/\s+/g, ' ').replace(/ · /g, ', ').trim()}`;
  });
  if (n) writeFileSync(ledgerPath, out.join('\n'));
  return n;
}

// ── Items ───────────────────────────────────────────────────────────────────

// An item is owed when it says so as its status — "spec change owed", "change
// still owed", "two fixes owed", or "Owed" opening a sentence ("**Owed:** …",
// ". Owed — …") — and not paid. Stricter than the tail read's `grep -w owed`
// (SCHEMA — Reference §6), which also catches the word in passing ("the four
// owed changes", "reads as still-owed"); that grep is a reader's net, this is a
// count.
const OWED_RE = /(?:\b(?:change|changes|fix|fixes)\s+(?:still\s+)?|(?:^|[.;:!?—])(?:\*\*)?\s*(?:\*\*)?|\*\*)owed\b/i;

/** The numbered items a ledger still owes: [{ n, text }]. */
export function parseOwed(ledgerText) {
  const out = [];
  for (const line of ledgerBody(ledgerText).split('\n')) {
    const m = /^\s*(\d+[a-z]?)\.\s+(.*)$/.exec(line);
    if (!m) continue;
    if (!OWED_RE.test(m[2]) || /\bpaid\b/i.test(m[2])) continue;
    const text = m[2].replace(/\*\*/g, '');
    out.push({ n: m[1], text: text.length > 180 ? `${text.slice(0, 177)}…` : text });
  }
  return out;
}

/** The ledger's newest group heading and the last item number. */
export function parseLatestLesson(ledgerText) {
  let heading = null; let item = null;
  for (const line of ledgerBody(ledgerText).split('\n')) {
    const h = /^##\s+(.+)$/.exec(line);
    if (h) heading = h[1].trim();
    const i = /^\s*(\d+[a-z]?)\.\s/.exec(line);
    if (i) item = i[1];
  }
  return { heading, item };
}

/** The next free item number: one past the largest a ledger holds (4a counts as 4). */
export function nextItemNumber(ledgerText) {
  let max = 0;
  for (const line of ledgerBody(ledgerText).split('\n')) {
    const m = /^\s*(\d+)[a-z]?\.\s/.exec(line);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

/**
 * The tail read every run opens with (SCHEMA — Reference §6): the last `n`
 * lines once the run lines are set aside, and every line that says owed,
 * wherever it sits. Frontmatter is not read, so `standards` never lands in it.
 * Returns { recent: string[], owed: [{ line, text }] } — owed lines already in
 * the recent window are not repeated. `setAside(line)` leaves out more lines,
 * by their line number in the file, the way run lines are left out: the cycle
 * prompt sets proposals for canon aside, since it shows them in full elsewhere.
 */
export function tailRead(ledgerText, n = 40, { setAside = null } = {}) {
  const body = ledgerBody(ledgerText);
  const offset = String(ledgerText || '').split('\n').length - body.split('\n').length;
  const lines = body.split('\n');
  const aside = (line) => !!(setAside && setAside(line));
  const kept = lines.map((text, i) => ({ text, line: i + 1 + offset })).filter((l) => !parseRunLine(l.text) && !aside(l.line));
  while (kept.length && !kept[kept.length - 1].text.trim()) kept.pop();
  const recent = kept.slice(-n);
  const inRecent = new Set(recent.map((l) => l.line));
  const owed = lines
    .map((text, i) => ({ text, line: i + 1 + offset }))
    .filter((l) => /\bowed\b/i.test(l.text) && !inRecent.has(l.line) && !aside(l.line));
  return { recent: recent.map((l) => l.text), owed };
}

/**
 * Append one line to a ledger's end. A line that follows prose gets a blank
 * line before it, so it reads as a list; one that follows a list item joins it.
 */
export function appendLedgerLine(ledgerPath, line) {
  const text = existsSync(ledgerPath) ? readFileSync(ledgerPath, 'utf8') : '';
  const last = text.replace(/\s+$/, '').split('\n').pop() || '';
  const endsBlank = text === '' || /\n[ \t]*\n$/.test(text);
  const listy = /^\s*(?:[-*]|\d+[a-z]?\.)\s/.test(last);
  let pre = text && !text.endsWith('\n') ? '\n' : '';
  if (!endsBlank && !listy && last.trim()) pre += '\n';
  appendFileSync(ledgerPath, `${pre}${line}\n`);
}

/**
 * Record one run in a tuning ledger, in the shape the existing ledgers keep:
 * when the run taught something or proposed a canon edit, a `## From <what> —
 * <date>` group with one numbered item per lesson and then one per proposal
 * (proposalLines), then the run line naming them; otherwise the run line
 * alone, "nothing new". `by` says whose lesson it is when the page did not
 * write it itself (a steward's offer, carried by the machinery), `proposedBy`
 * whose proposal. A proposal already owed here, for the same target in the same
 * words, is not filed twice, and one that names items it `replaces` leaves
 * them superseded. Returns { line, items, proposed, filed, skipped,
 * superseded }: the run line written, the lesson and proposal item numbers it
 * names, each proposal filed with its `item`, the proposals left out as
 * already owed, and the items the new ones replaced.
 */
export function recordRun(ledgerPath, { date, version = null, what = '', lessons = [], by = '', proposals = [], proposedBy = '' }) {
  const text = existsSync(ledgerPath) ? readFileSync(ledgerPath, 'utf8') : '';
  const taught = [...new Set((lessons || []).map((l) => String(l || '').replace(/\s+/g, ' ').trim()).filter(Boolean))];
  const owedNow = new Set(parseProposals(text).filter((p) => p.owed).map(proposalKey));
  const fresh = [];
  const skipped = [];
  for (const p of proposals || []) {
    const k = proposalKey({ target: proposalTargetText(p), words: cutWords(p.words).kept });
    if (owedNow.has(k)) { skipped.push(p); continue; }
    owedNow.add(k);
    fresh.push(p);
  }
  const items = [];
  const proposed = [];
  const filed = [];
  if (taught.length || fresh.length) {
    let n = nextItemNumber(text);
    const heading = `## From ${String(what || 'a run').replace(/\s+/g, ' ').trim()} — ${date}`;
    const lines = taught.map((l) => { items.push(n); return `${n++}. ${l}${by ? ` *(${by})*` : ''}`; });
    for (const p of fresh) { proposed.push(n); filed.push({ ...p, item: n }); lines.push(...proposalLines(n++, { ...p, date, by: proposedBy })); }
    const pre = text === '' ? '' : (text.endsWith('\n\n') ? '' : (text.endsWith('\n') ? '\n' : '\n\n'));
    appendFileSync(ledgerPath, `${pre}${heading}\n\n${lines.join('\n')}\n`);
  }
  // A proposal that names an owed one it replaces (`replaces`) supersedes it:
  // latest wins, and the older one is no longer owed.
  const superseded = [];
  for (const f of filed) {
    for (const r of Array.isArray(f.replaces) ? f.replaces : []) {
      for (const k of settleProposals(ledgerPath, [{ n: r, status: supersededStatus(f.item) }])) superseded.push({ n: k, by: f.item });
    }
  }
  const plural = (ns) => (ns.length === 1 ? `item ${ns[0]}` : `items ${ns.join(', ')}`);
  const parts = [];
  if (items.length) parts.push(`taught ${plural(items)}`);
  if (proposed.length) parts.push(`proposed ${plural(proposed)} for canon`);
  const outcome = parts.length ? parts.join(', ') : 'nothing new';
  const line = runLine({ date, version, what, outcome });
  appendLedgerLine(ledgerPath, line);
  return { line, items, proposed, filed, skipped, superseded };
}

// ── Proposals for canon ─────────────────────────────────────────────────────
//
// No steward writes the house without Loudon's eyes (Loudon, 2026-10-18: "what
// the steward wants to edit is place in a tuning ledger and used in the future,
// and eventually we go through the tuning ledgers to see what we actualy want
// to place in canon"). Each canon edit a steward proposes (`proposed_edits`) is
// filed in its own tuning ledger as a numbered item, and its next runs read it
// back and work as if it holds, while the page itself stays as it is:
//
//   43. **Proposed for canon** · 2026-10-20 · [[Shopkeeper]] · § Standing duties · canon change owed *(proposed by the steward, cycle 41; urgent, asked as Shopkeeper-…-urgent-1)*
//       Why: one line.
//       Path: `Shop/Shopkeeper.md`
//       > the proposed words, as many lines as they take
//
// The field before the tag is the item's status. "canon change owed" is the
// owed status every reader here already counts (parseOwed, tailRead), so no
// second machinery keeps these. A proposal is settled the way a paid order is
// (payOrders): its owed status is replaced in place with what became of it.
//
//   paid in <commit> on <YYYY-MM-DD HH:MM>             Loudon said yes; the commit landed it
//   declined on <YYYY-MM-DD HH:MM>: <his one line>     Loudon said no, and why
//   superseded by item N                               the steward's newer proposal replaced it
//
// The steward reads a paid or declined item back once, on its first run after
// the moment it was settled (build-cycle-prompt.js), so a no teaches it
// something. How the review decides is its own; these are only its ledger end.

/** The status a proposal is filed with; replacing it settles the proposal. */
export const PROPOSAL_OWED = 'canon change owed';
/** Proposed words kept in the ledger; longer text belongs in a workshop draft the words point to. */
export const MAX_PROPOSAL_LINES = 60;

const PROPOSAL_HEAD_RE = /^(\d+[a-z]?)\.\s+\*\*Proposed for canon\*\* · (\d{4}-\d{2}-\d{2}) · (.+?)\s*$/;
const TAG_RE = /\s*\*\((.+)\)\*\s*$/;
const field = (v) => String(v ?? '').replace(/\s+/g, ' ').replace(/ · /g, ', ').trim();

/** How a proposal names its target in the ledger: `[[Title]]` for a page, a backticked path for any other file. */
export function proposalTargetText(p) {
  if (p.target) return p.target;
  const md = !p.path || /\.md$/i.test(p.path);
  return p.entry || (!p.exists && md) ? `[[${field(p.page)}]]` : `\`${field(p.path || p.page)}\``;
}

function cutWords(words) {
  const all = String(words || '').replace(/\r\n/g, '\n').replace(/\s+$/, '').split('\n');
  return { kept: all.slice(0, MAX_PROPOSAL_LINES).join('\n'), cut: Math.max(0, all.length - MAX_PROPOSAL_LINES) };
}

const proposalKey = (p) => `${String(p.target || '').toLowerCase()}\u0000${String(p.words || '').replace(/\s+/g, ' ').trim()}`;

/** The local moment a settlement is stamped with: `YYYY-MM-DD HH:MM`. */
export function settleStamp(at = new Date()) {
  const d = at instanceof Date ? at : new Date(at);
  return `${localDate(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** The status a yes leaves: the commit that landed the proposal, and when. */
export const paidStatus = (commit, at = new Date()) => `paid in ${field(commit).slice(0, 40)} on ${settleStamp(at)}`;
/** The status a no leaves: when, and Loudon's one-line reason. */
export const declinedStatus = (reason, at = new Date()) => `declined on ${settleStamp(at)}: ${field(reason) || 'no reason given'}`;
/** The status a steward's newer proposal leaves on the one it replaces. */
export const supersededStatus = (n) => `superseded by item ${n}`;

/**
 * What became of a proposal, read from its status: { kind: 'owed' | 'paid' |
 * 'declined' | 'superseded' | 'settled', at, commit, reason, by }. `at` is the
 * stamp a settlement carries (`YYYY-MM-DD HH:MM`, or a bare date when one was
 * settled by hand), or null.
 */
export function proposalOutcome(status) {
  const s = String(status || '').trim();
  const at = (/\b(\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2})?)\b/.exec(s) || [])[1] || null;
  if (/\bpaid\b/i.test(s)) return { kind: 'paid', at, commit: (/\bpaid in ([0-9a-f]{7,40})\b/i.exec(s) || [])[1] || null, reason: '', by: null };
  if (/^declined\b/i.test(s)) return { kind: 'declined', at, commit: null, reason: (/^declined(?: on \d{4}-\d{2}-\d{2}(?: \d{2}:\d{2})?)?\s*:\s*(.*)$/i.exec(s) || [])[1] || '', by: null };
  const sup = /^superseded by item (\d+[a-z]?)/i.exec(s);
  if (sup) return { kind: 'superseded', at, commit: null, reason: '', by: sup[1] };
  if (/\bowed\b/i.test(s)) return { kind: 'owed', at: null, commit: null, reason: '', by: null };
  return { kind: 'settled', at, commit: null, reason: '', by: null };
}

/**
 * The lines one proposal is filed as: its numbered head (date, target, place,
 * status, whose, and whether it is urgent), then indented Why, Path and the
 * words as a quote. Words past MAX_PROPOSAL_LINES are cut, and the item says
 * so; the whole text stays in the cycle's post on the board.
 */
export function proposalLines(n, { date, page, path = null, entry = false, exists = false, place = '', words = '', why = '', by = '', urgent = false, ask = '' }) {
  const pad = ' '.repeat(String(n).length + 2);
  const target = proposalTargetText({ page, path, entry, exists });
  const { kept, cut } = cutWords(words);
  const tagParts = [field(by), urgent ? `urgent${ask ? `, asked as ${field(ask)}` : ''}` : ''].filter(Boolean);
  return [
    `${n}. **Proposed for canon** · ${date} · ${target} · ${field(place) || '—'} · ${PROPOSAL_OWED}${tagParts.length ? ` *(${tagParts.join('; ')})*` : ''}`,
    `${pad}Why: ${field(why) || 'no reason given'}`,
    `${pad}Path: ${path ? `\`${field(path)}\`` : 'none yet'}${exists ? '' : ' (a new page)'}`,
    ...kept.split('\n').map((l) => `${pad}>${l.trim() ? ` ${l.replace(/\s+$/, '')}` : ''}`),
    ...(cut ? [`${pad}Cut here, ${cut} more line${cut === 1 ? '' : 's'}: the whole text is in the cycle's post on the board.`] : []),
  ];
}

/**
 * The proposals for canon a ledger holds, in file order: [{ n, date, target,
 * page, path, exists, place, status, owed, outcome, by, urgent, ask, why,
 * words, line, end }]. `line` and `end` are the item's first and last line
 * numbers in the file (1-based), so a reader can set the whole item aside.
 * `page` is the target's title, or its path when it is not a page; `outcome`
 * is proposalOutcome(status). A proposal is owed until its status stops saying
 * so; a union merge that keeps both a settled and an owed form of the same
 * item counts it settled, as parseOrders does.
 */
export function parseProposals(ledgerText) {
  const text = String(ledgerText || '');
  const offset = text.split('\n').length - ledgerBody(text).split('\n').length;
  const lines = ledgerBody(text).split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = PROPOSAL_HEAD_RE.exec(lines[i]);
    if (!m) continue;
    const fields = m[3].split(' · ');
    const last = fields.pop();
    const tag = TAG_RE.exec(last);
    const status = (tag ? last.slice(0, tag.index) : last).trim();
    const target = (fields.shift() || '').trim();
    const place = fields.join(', ').trim();
    const tagParts = tag ? tag[1].split('; ').map((t) => t.trim()) : [];
    const urgentPart = tagParts.find((t) => /^urgent\b/i.test(t));
    const outcome = proposalOutcome(status);
    const p = {
      n: m[1], date: m[2], target,
      page: target.replace(/^\[\[|\]\]$/g, '').replace(/^`|`$/g, ''),
      path: null, exists: true, place: place === '—' ? '' : place, status,
      owed: outcome.kind === 'owed', outcome,
      by: tagParts.filter((t) => t !== urgentPart).join('; '),
      urgent: !!urgentPart, ask: urgentPart ? ((/asked as (\S+)/.exec(urgentPart) || [])[1] || '') : '',
      why: '', words: '', line: i + 1 + offset, end: i + 1 + offset,
    };
    const words = [];
    for (let j = i + 1; j < lines.length && /^\s{2,}\S/.test(lines[j]); j++) {
      const l = lines[j].trim();
      p.end = j + 1 + offset;
      if (l.startsWith('>')) words.push(l.replace(/^> ?/, ''));
      else if (/^Why: /.test(l)) p.why = l.slice(5).trim();
      else if (/^Path: /.test(l)) { const pm = /`([^`]+)`/.exec(l); p.path = pm ? pm[1] : null; p.exists = !/\(a new page\)/.test(l); }
    }
    p.words = words.join('\n');
    out.push(p);
  }
  const twin = (p) => `${p.n}\u0000${proposalKey(p)}`;
  const settled = new Set(out.filter((p) => !p.owed).map(twin));
  return out.map((p) => (p.owed && settled.has(twin(p)) ? { ...p, owed: false } : p));
}

/**
 * Settle owed proposals in place, as payOrders pays orders: each { n, status }
 * replaces item n's `canon change owed` with `status` (paidStatus,
 * declinedStatus, supersededStatus), keeping its tag. An item already settled
 * is left alone. Returns the item numbers settled.
 */
export function settleProposals(ledgerPath, settles = []) {
  const wanted = new Map((settles || []).filter((x) => x && x.n != null && x.status).map((x) => [String(x.n), field(x.status)]));
  if (!wanted.size || !existsSync(ledgerPath)) return [];
  const done = [];
  const out = readFileSync(ledgerPath, 'utf8').split('\n').map((line) => {
    const m = PROPOSAL_HEAD_RE.exec(line);
    if (!m || !wanted.has(m[1])) return line;
    const cut = line.lastIndexOf(' · ');
    const last = line.slice(cut + 3);
    const tag = TAG_RE.exec(last);
    const status = (tag ? last.slice(0, tag.index) : last).trim();
    if (proposalOutcome(status).kind !== 'owed') return line;
    done.push(m[1]);
    return `${line.slice(0, cut)} · ${wanted.get(m[1])}${tag ? ` ${tag[0].trim()}` : ''}`;
  });
  if (done.length) writeFileSync(ledgerPath, out.join('\n'));
  return [...new Set(done)];
}

/** A yes: item n is paid with the commit that landed it. Returns true when it was owed. */
export const payProposal = (ledgerPath, n, commit, { at } = {}) => settleProposals(ledgerPath, [{ n, status: paidStatus(commit, at) }]).length > 0;
/** A no: item n is declined with Loudon's one-line reason. Returns true when it was owed. */
export const declineProposal = (ledgerPath, n, reason, { at } = {}) => settleProposals(ledgerPath, [{ n, status: declinedStatus(reason, at) }]).length > 0;

/**
 * What a steward's next run reads back from its ledger's proposals: `pending`,
 * every proposal still owed (a superseded one is not, so the newer one stands
 * alone), and `settled`, each paid or declined one settled after `since` (the
 * steward's last run; every one when it has not run), shown once and then no
 * more. A settlement with no time on it counts from the start of its day.
 */
export function proposalsForRun(ledgerText, { since = null } = {}) {
  const all = parseProposals(ledgerText);
  const from = since ? Date.parse(since) : NaN;
  const when = (at) => (at ? Date.parse(at.includes(' ') ? at.replace(' ', 'T') : `${at}T00:00`) : NaN);
  return {
    pending: all.filter((p) => p.owed),
    settled: all.filter((p) => !p.owed && (p.outcome.kind === 'paid' || p.outcome.kind === 'declined')
      && (Number.isNaN(from) || (!Number.isNaN(when(p.outcome.at)) && when(p.outcome.at) > from))),
  };
}

/**
 * The seam the canon review plugs into: every steward's proposals for canon
 * still owed, across the palace, oldest first — [{ steward, ledger, page, path,
 * exists, place, why, words, date, n, by, urgent, ask, line }], enough to group
 * them by target page. A steward here is the page whose tuning ledger holds
 * the item; only a steward cycle files these. Read-only: the review settles
 * an item with payProposal or declineProposal on the ledger it names.
 */
export function listOwedProposals(palaceRoot) {
  const out = [];
  for (const { title, tuning } of listTuningLedgers(palaceRoot)) {
    let text = '';
    try { text = readFileSync(join(palaceRoot, tuning), 'utf8'); } catch { continue; }
    for (const p of parseProposals(text)) {
      if (!p.owed) continue;
      const { owed, status, outcome, target, end, ...rest } = p;
      out.push({ steward: title, ledger: tuning, ...rest });
    }
  }
  const num = (n) => parseInt(n, 10) || 0;
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.steward.localeCompare(b.steward) || num(a.n) - num(b.n));
}

// ── Growing a steward's ledger ──────────────────────────────────────────────

/**
 * The tuning ledger the orchestrator grows on a stewarded page the first time
 * a cycle offers a lesson (Loudon, 2026-10-16) or proposes a canon edit
 * (2026-10-18). A left-rough note never grows one; those stay on the trail,
 * where the scroll's Now lists the ones that recur. Standard frontmatter (§6,
 * §8); no `standards` value and no line of the body says owed, because the
 * tail read's grep would find it.
 */
export function stewardLedgerText(home, date) {
  const q = (s) => JSON.stringify(s);
  return [
    '---',
    `title: ${q(`${home} — tuning`)}`,
    `born: ${date}`,
    'links:',
    `  - target: ${q(`[[${home}]]`)}`,
    '    type: connects-to',
    '    label: tuning-for',
    `forward_vector: ${q(`I am ${home}'s record of what its steward's cycles taught it: a line for every cycle, a numbered item when a cycle taught something the next one should carry, and one for each change to the house its steward proposed, kept here until Loudon's review.`)}`,
    'ledger: tuning',
    'standards:',
    `  for: ${q(`what each steward cycle taught ${home} about how it works`)}`,
    '  run: "one steward cycle"',
    '  line: "- run · <date> · cycle <N> · nothing new | taught item N | proposed item N for canon"',
    '  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"',
    '  writes: "the steward cycle (process-cycle.js), in the cycle\'s commit; a lesson the steward offers is filed straight in as an item tagged as its offer, and a canon edit it proposes as an item tagged as its proposal, which the page does not take in until Loudon\'s review"',
    '  merge: union',
    '  kept: git',
    '  trim: never',
    '---',
    '',
    `# ${home} — tuning`,
    '',
    `What ${home}'s steward cycles taught the page, and the changes to the house its steward proposed. The orchestrator grew this ledger on ${date}, when a cycle first offered a lesson or proposed a change, and writes every line in it. A proposal waits here for Loudon's review; the page takes it in only on his yes. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.`,
    '',
  ].join('\n');
}

/** Grow a stewarded page's tuning ledger in its bundle; returns its path. Never overwrites. */
export function growTuningLedger(palaceRoot, home, { date }) {
  const b = resolveBundleDir(palaceRoot, home);
  if (!b) return null;
  const p = join(b.bundleDir, `${home} — tuning.md`);
  if (existsSync(p)) return p;
  mkdirSync(b.bundleDir, { recursive: true });
  writeFileSync(p, stewardLedgerText(home, date));
  return p;
}

// ── Where a page keeps its ledgers ──────────────────────────────────────────

/** `[Entry]/[Entry] — <kind>.md` for an entry, or null when there is none. */
export function ledgerPathFor(palaceRoot, home, kind) {
  const b = resolveBundleDir(palaceRoot, home);
  if (!b) return null;
  const p = join(b.bundleDir, `${home} — ${kind}.md`);
  return existsSync(p) ? p : null;
}

export const tuningPathFor = (palaceRoot, home) => ledgerPathFor(palaceRoot, home, 'tuning');
export const diaryPathFor = (palaceRoot, home) => ledgerPathFor(palaceRoot, home, 'diary');

/**
 * Every tuning ledger in the palace that sits in its own page's bundle:
 * [{ title, tuning }]. A ledger is a family any page may keep, so this is not a
 * list of ceremonies — a page with `trigger:` is one (ceremony-scroll.js).
 */
export function listTuningLedgers(palaceRoot) {
  const out = [];
  const stack = [palaceRoot];
  while (stack.length) {
    const dir = stack.pop();
    let ents;
    try { ents = readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of ents) {
      if (e.isDirectory()) { if (!EXCLUDE_DIRS.has(e.name) && e.name !== 'Archive') stack.push(join(dir, e.name)); continue; }
      const m = / — tuning\.md$/.exec(e.name);
      if (!m || e.isSymbolicLink()) continue;
      const title = e.name.slice(0, m.index);
      if (basename(dir) !== title) continue; // a ledger lives in its page's bundle
      out.push({ title, tuning: relative(palaceRoot, join(dir, e.name)) });
    }
  }
  return out.sort((a, b) => a.title.localeCompare(b.title));
}

/** A ledger's own `ledger` and `standards` (§6), or {} when it states none. */
export function readStandards(ledgerText) {
  const fm = parseFrontmatter(ledgerText);
  return {
    ledger: typeof fm.ledger === 'string' ? fm.ledger : null,
    standards: fm.standards && typeof fm.standards === 'object' ? fm.standards : {},
  };
}

/** True when a ledger says it is kept off git (`kept: private…`). */
export function isPrivateLedger(ledgerText) {
  const { standards } = readStandards(ledgerText);
  return /^private\b/i.test(String(standards.kept || '').trim());
}

// ── Version history (git) ───────────────────────────────────────────────────

function git(palaceRoot, args) {
  try {
    return execFileSync('git', args, {
      cwd: palaceRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 15000, maxBuffer: 32 * 1024 * 1024,
    });
  } catch { return ''; }
}

/** True when git ignores a path (it never leaves this machine). */
export function isGitIgnored(palaceRoot, path) {
  try {
    execFileSync('git', ['check-ignore', '-q', path], { cwd: palaceRoot, stdio: 'ignore', timeout: 5000 });
    return true;
  } catch { return false; }
}

/**
 * The commits where the page's version VALUE changed, oldest first:
 * [{ hash, ts, subject, version }]. A reformat that keeps the value (2 → "2.0")
 * is not a change.
 */
export function versionHistory(palaceRoot, entryRel) {
  const out = git(palaceRoot, ['log', '--reverse', '--format=%H%x09%aI%x09%s', '-G^version:', '--', entryRel]).trim();
  if (!out) return [];
  const changes = [];
  let prev = null;
  for (const line of out.split('\n')) {
    const [hash, ts, ...s] = line.split('\t');
    const text = git(palaceRoot, ['show', `${hash}:${entryRel}`]);
    const v = normVersion(parseFrontmatter(text).version);
    if (v && v !== prev) changes.push({ hash, ts, subject: s.join('\t'), version: v });
    prev = v;
  }
  return changes;
}

/** Bodies for a handful of commits, in one git call: Map hash → body. */
function bodiesFor(palaceRoot, hashes) {
  const map = new Map();
  if (!hashes.length) return map;
  const out = git(palaceRoot, ['log', '--no-walk=unsorted', '--format=%H%x1f%b%x1e', ...hashes]);
  for (const r of out.split('\x1e')) {
    const [hash, body = ''] = r.replace(/^\n/, '').split('\x1f');
    if (hash) map.set(hash.trim(), body);
  }
  return map;
}

/** First prose paragraph of a commit body — trailers and blank lines dropped. */
export function bodyLead(body, max = 600) {
  const paras = String(body || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const lead = paras.find((p) => !/^[A-Z][A-Za-z-]+: /.test(p.split('\n')[0]));
  if (!lead) return '';
  const flat = lead.replace(/\n/g, ' ');
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

/**
 * Where a run sits in time, for ordering the trail. A run line carries only
 * its date, so it is placed inside the span its version was live — after the
 * change that made the version, before the next — and same-day runs keep the
 * ledger's own order (newest last).
 */
function runMs(run, changes) {
  const i = run.version ? changes.findIndex((c) => c.version === run.version) : -1;
  const from = i >= 0 ? Date.parse(changes[i].ts) : NaN;
  const to = i >= 0 && i + 1 < changes.length ? Date.parse(changes[i + 1].ts) : NaN;
  let base = Date.parse(`${run.date}T00:00:00`);
  if (!Number.isNaN(from) && base <= from) base = from + 1;
  if (!Number.isNaN(to) && base + run.index >= to) base = to - 1e6;
  return base + run.index;
}

// ── A page's tuning state and diary state ───────────────────────────────────

/**
 * Everything a scroll's runs block and trail need, read from the page, its
 * tuning ledger and git; null when the page keeps no tuning ledger. Never throws.
 */
export function readTuningState(palaceRoot, home) {
  const b = resolveBundleDir(palaceRoot, home);
  if (!b) return null;
  const tuningAbs = join(b.bundleDir, `${home} — tuning.md`);
  if (!existsSync(tuningAbs)) return null;
  const entryRel = relative(palaceRoot, b.entryFile);
  const entryText = (() => { try { return readFileSync(b.entryFile, 'utf8'); } catch { return ''; } })();
  const ledger = (() => { try { return readFileSync(tuningAbs, 'utf8'); } catch { return ''; } })();
  const version = normVersion(parseFrontmatter(entryText).version);

  const changes = versionHistory(palaceRoot, entryRel);
  const last = changes.length ? changes[changes.length - 1] : null;
  // The working tree can hold a version git hasn't seen yet.
  const spec = last && last.version === version ? last : (version ? { hash: null, ts: null, subject: 'not committed yet', version } : null);
  const bodies = bodiesFor(palaceRoot, changes.map((c) => c.hash));
  for (const c of changes) c.lead = bodyLead(bodies.get(c.hash));

  // Newest first. A run belongs to the version its line names.
  const runs = parseRuns(ledger)
    .map((r) => ({ ...r, kind: 'run', ts: r.date, ms: runMs(r, changes) }))
    .sort((x, y) => y.ms - x.ms);

  return {
    home,
    path: entryRel,
    tuning: relative(palaceRoot, tuningAbs),
    bundleDir: b.bundleDir,
    version,
    spec,
    versions: changes,
    runs,
    runs_since: version ? runs.filter((r) => r.version === version) : [],
    last_run: runs[0] || null,
    // A proposal for canon is owed to Loudon's review, not to the next run, so
    // it is listed apart (parseProposals) and not among the run's owed items.
    ...(() => {
      const proposed = parseProposals(ledger).filter((p) => p.owed);
      const isProposal = new Set(proposed.map((p) => p.n));
      return { owed: parseOwed(ledger).filter((o) => !isProposal.has(o.n)), proposed };
    })(),
    orders: parseOrders(ledger),
    latest: parseLatestLesson(ledger),
  };
}

/**
 * The newest encounter a diary records: its last `## ` heading or dated list
 * line, whichever comes later — diaries keep their own line shapes
 * (`standards.line`), so this reads both. { date, text } or null.
 */
export function lastEncounter(diaryText) {
  let last = null;
  for (const line of ledgerBody(diaryText).split('\n')) {
    const h = /^##\s+(.+?)\s*$/.exec(line);
    const l = /^- (\d{4}-\d{2}-\d{2}) · (.+?)\s*$/.exec(line);
    if (h) last = { date: (/(\d{4}-\d{2}-\d{2})/.exec(h[1]) || [])[1] || null, text: h[1] };
    else if (l) last = { date: l[1], text: l[2] };
  }
  if (!last) return null;
  const text = last.text.replace(/\*\*/g, '');
  return { date: last.date, text: text.length > 160 ? `${text.slice(0, 157)}…` : text };
}

/**
 * A page's diary, for its scroll's Now: { path, private, readable, last }, or
 * null when the page keeps none. A private diary (`kept: private…`) is never
 * read into a scroll git tracks — only into one that stays on this machine
 * too (`scrollPrivate`).
 */
export function readDiaryState(palaceRoot, home, { scrollPrivate = false } = {}) {
  const p = diaryPathFor(palaceRoot, home);
  if (!p) return null;
  const text = (() => { try { return readFileSync(p, 'utf8'); } catch { return ''; } })();
  const priv = isPrivateLedger(text);
  return {
    path: relative(palaceRoot, p),
    private: priv,
    readable: !priv || scrollPrivate,
    last: !priv || scrollPrivate ? lastEncounter(text) : null,
  };
}

// ── Trail sections: runs and version changes ────────────────────────────────

/** One trail section: a run or a version change. */
export function renderLedgerSection(item) {
  const L = [];
  L.push(`<!-- scroll:entry id="${item.key}" -->`);
  if (item.kind === 'version') {
    L.push(`### ${day(item.ts)} — the spec moved to v${item.version}`);
    L.push('');
    L.push(item.subject);
    if (item.lead) { L.push(''); L.push(item.lead); }
    L.push(`<sub>\`${item.hash.slice(0, 8)}\` · version change</sub>`);
  } else {
    L.push(`### ${item.date} — ${item.what || 'a run'}`);
    L.push('');
    L.push(item.outcome);
    L.push(`<sub>a run${item.version ? ` under v${item.version}` : ''} · its line in the tuning ledger</sub>`);
  }
  L.push('<!-- /scroll:entry -->');
  return L.join('\n');
}

/** Trail items (runs and version changes) newest first, each with `ms`. */
export function ledgerTrail(st) {
  if (!st) return [];
  const versions = (st.versions || []).map((c) => ({
    kind: 'version', key: `version-${c.hash}`, hash: c.hash, ts: c.ts, ms: Date.parse(c.ts), subject: c.subject, version: c.version, lead: c.lead || '',
  }));
  return [...versions, ...st.runs].sort((a, b) => b.ms - a.ms);
}
