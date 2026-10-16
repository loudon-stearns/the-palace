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
// numbered items for what a run taught, and Loudon's one-shot orders, owed
// until a run pays them: `- from Loudon · <date> · <his words> · owed`. Version
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
 * the recent window are not repeated.
 */
export function tailRead(ledgerText, n = 40) {
  const body = ledgerBody(ledgerText);
  const offset = String(ledgerText || '').split('\n').length - body.split('\n').length;
  const lines = body.split('\n');
  const kept = lines.map((text, i) => ({ text, line: i + 1 + offset })).filter((l) => !parseRunLine(l.text));
  while (kept.length && !kept[kept.length - 1].text.trim()) kept.pop();
  const recent = kept.slice(-n);
  const inRecent = new Set(recent.map((l) => l.line));
  const owed = lines
    .map((text, i) => ({ text, line: i + 1 + offset }))
    .filter((l) => /\bowed\b/i.test(l.text) && !inRecent.has(l.line));
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
 * when the run taught something, a `## From <what> — <date>` group with one
 * numbered item per lesson, then the run line naming them; otherwise the run
 * line alone, "nothing new". `by` says whose lesson it is when the page did not
 * write it itself (a steward's offer, carried by the machinery). Returns
 * { line, items } — the run line written and the item numbers it names.
 */
export function recordRun(ledgerPath, { date, version = null, what = '', lessons = [], by = '' }) {
  const text = existsSync(ledgerPath) ? readFileSync(ledgerPath, 'utf8') : '';
  const taught = [...new Set((lessons || []).map((l) => String(l || '').replace(/\s+/g, ' ').trim()).filter(Boolean))];
  const items = [];
  if (taught.length) {
    let n = nextItemNumber(text);
    const heading = `## From ${String(what || 'a run').replace(/\s+/g, ' ').trim()} — ${date}`;
    const lines = taught.map((l) => { items.push(n); return `${n++}. ${l}${by ? ` *(${by})*` : ''}`; });
    const pre = text === '' ? '' : (text.endsWith('\n\n') ? '' : (text.endsWith('\n') ? '\n' : '\n\n'));
    appendFileSync(ledgerPath, `${pre}${heading}\n\n${lines.join('\n')}\n`);
  }
  const outcome = !items.length ? 'nothing new'
    : items.length === 1 ? `taught item ${items[0]}` : `taught items ${items.join(', ')}`;
  const line = runLine({ date, version, what, outcome });
  appendLedgerLine(ledgerPath, line);
  return { line, items };
}

// ── Growing a steward's ledger ──────────────────────────────────────────────

/**
 * The tuning ledger the orchestrator grows on a stewarded page the first time
 * a cycle offers a lesson (Loudon, 2026-10-16). A left-rough note never grows
 * one; those stay on the trail, where the scroll's Now lists the ones that
 * recur. Standard frontmatter (§6, §8); no `standards` value says owed,
 * because the tail read's grep would find it.
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
    `forward_vector: ${q(`I am ${home}'s record of what its steward's cycles taught it: a line for every cycle, and a numbered item when a cycle taught something the next one should carry.`)}`,
    'ledger: tuning',
    'standards:',
    `  for: ${q(`what each steward cycle taught ${home} about how it works`)}`,
    '  run: "one steward cycle"',
    '  line: "- run · <date> · cycle <N> · nothing new | taught item N"',
    '  read: "the last 40 lines with run lines set aside, plus every line not yet paid, at the start of a cycle"',
    '  writes: "the steward cycle (process-cycle.js), in the cycle\'s commit; a lesson the steward offers is filed straight in as an item tagged as its offer"',
    '  merge: union',
    '  kept: git',
    '  trim: never',
    '---',
    '',
    `# ${home} — tuning`,
    '',
    `What ${home}'s steward cycles taught the page. The orchestrator grew this ledger on ${date}, when a cycle first offered a lesson, and writes every line in it. What a cycle leaves rough stays on the scroll's trail, and the scroll's Now lists what keeps recurring.`,
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
    owed: parseOwed(ledger),
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
