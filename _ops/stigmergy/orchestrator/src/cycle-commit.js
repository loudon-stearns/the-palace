// cycle-commit.js — a steward's cycle commits what it shipped (decided 2026-09-25).
//
// A made thing that is not in git is lost the day the tree is cleaned, and a
// shipped thing is not a proposal waiting on review — it is the steward's work.
// So when a cycle ends, process-cycle.js commits the files that cycle's own
// messages declared, together with its scroll, its machinery and the board.
//
// The model never runs git; this deterministic step does, through the house
// committer (`palace-commit.mjs --only`), so the commit holds exactly the named
// paths even while other writers have work staged. What may ride along is
// narrow on purpose:
//   - inside the steward's own bundle folder (a steward's workshop),
//   - an existing file, 10 MB or smaller (larger files stay uncommitted and are
//     named in the commit body),
//   - never an entry by way of `artifacts`: a `.md` whose frontmatter carries
//     `type:` is the house. Some bundles hold entries
//     (`Modes of Collaboration/Dialectic.md`), so the folder rule alone is not
//     enough;
//   - never a file .gitignore ignores: the committer refuses a commit that names
//     one, so a single ignored artifact would leave the whole cycle uncommitted.
//     It is left out and named in the commit body, like an oversize file.
//
// No steward edits the house without Loudon's eyes (Loudon, 2026-10-18,
// reversing the 2026-10-16 own-page grant and the Shopkeeper's 2026-10-18 reach
// over Shop/: "I don't like the editing of canon without my eyes ... what the
// steward wants to edit is place in a tuning ledger and used in the future").
// So `page_edits` carries workshop files only: a file inside the steward's own
// bundle that is not an entry, once any frontmatter it carries parses. Its own
// entry, an entry kept in its bundle, every other page and canon are refused.
// A change it wants there is posted as `proposed_edits: [{ page, place, words,
// why }]`; vetProposedEdits names each one's target, and the cycle files it in
// the steward's tuning ledger as an item owed until Loudon's review
// (ledger.js, recordRun). A manifest field no longer widens any of this.
//
// The Shop roster refresh (shop-roster.js) is left in place: it reruns when a
// cycle's vetted edits touch a page directly under Shop/, which no vetted edit
// can now do, so it does not fire.

import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, statSync, readFileSync, copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, relative, isAbsolute, join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { payloadPathArtifacts } from './scroll-file.js';
import { declaredPathsOf } from './artifact-backstop.js';
import { findEntryFile } from './entry-paths.js';

export const MAX_COMMIT_BYTES = 10 * 1024 * 1024;

const HERE = dirname(fileURLToPath(import.meta.url));
export const COMMITTER_DEFAULT = resolve(HERE, '../../app/scripts/palace-commit.mjs');

/** Every file path a set of messages declares as made (artifacts, legacy fields, path-like payload fields). */
export function shippedPaths(messages) {
  const out = new Set();
  for (const m of messages || []) {
    const p = m && m.payload;
    if (!p || typeof p !== 'object') continue;
    for (const x of declaredPathsOf(p)) out.add(x);
    if (Array.isArray(p.artifacts)) for (const a of p.artifacts) if (typeof a === 'string') out.add(a);
    for (const a of payloadPathArtifacts(p)) out.add(a.path);
  }
  return [...out].map((x) => String(x).trim()).filter(Boolean);
}

/** True when the file is a palace entry — a `.md` whose frontmatter declares a `type`. */
export function isEntryFile(absPath) {
  if (!absPath.toLowerCase().endsWith('.md')) return false;
  let head = '';
  try { head = readFileSync(absPath, 'utf8').slice(0, 4096); } catch { return false; }
  const m = head.match(/^---\n([\s\S]*?)\n---/);
  return !!(m && /^type:\s*\S/m.test(m[1]));
}

/** The page edits a cycle's messages list: each `payload.page_edits` item, as { path, why }. */
export function pageEditsOf(messages) {
  const out = [];
  for (const m of messages || []) {
    const l = m && m.payload ? m.payload.page_edits : null;
    for (const e of Array.isArray(l) ? l : []) {
      const path = typeof e === 'string' ? e : e && typeof e.path === 'string' ? e.path : '';
      if (!path.trim()) continue;
      const why = e && typeof e.why === 'string' ? e.why.trim() : '';
      out.push({ path: path.trim(), why });
    }
  }
  return out;
}

const FRONTMATTER_BLOCK = /^---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/;

/**
 * Does a markdown file's frontmatter parse? Strict where parseFrontmatter is
 * forgiving: that one reads a broken block as {}, which is how a page goes
 * blank without a word. `required` demands a block (the steward's own entry
 * must keep one); otherwise a file with no block passes.
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function checkFrontmatter(text, { required = false } = {}) {
  const t = String(text ?? '');
  const m = FRONTMATTER_BLOCK.exec(t);
  if (!m) {
    if (/^---\r?\n/.test(t)) return { ok: false, error: 'the frontmatter block never closes' };
    return required ? { ok: false, error: 'no frontmatter block' } : { ok: true };
  }
  let data;
  try { data = parseYaml(m[1]); } catch (e) { return { ok: false, error: String(e && e.message || e).split('\n')[0] }; }
  if (data == null && !required) return { ok: true };
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, error: 'the frontmatter is not a set of fields' };
  return { ok: true };
}

// Why the house refuses an edit, said the same way on the board, the trail and
// the commit body. The edit is not lost: it was meant as a proposal.
const TO_REVIEW = 'it changes only through Loudon\'s review: post it in `proposed_edits`';

/**
 * Sort a steward's page edits into what the cycle may commit and what it may
 * not (Loudon, 2026-10-18: no canon edit without his eyes). Allowed: workshop
 * files in its own bundle, never an entry (a `.md` whose frontmatter carries
 * `type:`), never the scroll or tuning ledger the cycle writes, never its
 * Context, and only once any frontmatter they carry parses. Its own entry, its
 * Context, every other page and canon are refused, marked `proposal` so the
 * trail says where they belong. The Context carries no `type:` (no bundle file
 * does), but it is the page's memory of why the entry is shaped as it is, and
 * changes with the entry. Paths come back palace-relative; each refusal
 * carries a reason.
 *
 * @returns {{ allowed: {path, why}[], refused: {path, why, reason, proposal: boolean}[] }}
 */
export function vetPageEdits({ palaceRoot, home, entryFile, bundleDir, edits = [] }) {
  const root = resolve(palaceRoot);
  const entry = entryFile ? resolve(root, entryFile) : null;
  const bundle = bundleDir ? resolve(root, bundleDir) : null;
  const kept = new Set(bundle ? [join(bundle, `${home} — scroll.md`), join(bundle, `${home} — tuning.md`)] : []);
  const context = bundle ? join(bundle, `${home} — Context.md`) : null;
  const allowed = [];
  const refused = [];
  const seen = new Set();
  for (const e of edits) {
    const abs = isAbsolute(e.path) ? resolve(e.path) : resolve(root, e.path);
    const rel = relative(root, abs);
    if (seen.has(rel)) continue;
    seen.add(rel);
    const refuse = (reason, proposal = false) => refused.push({ path: rel, why: e.why, reason, proposal });
    const r = bundle ? relative(bundle, abs) : '..';
    const inBundle = !!bundle && !!r && !r.startsWith('..') && !isAbsolute(r);
    if (rel.startsWith('..') || isAbsolute(rel)) { refuse('outside the palace'); continue; }
    if (entry && abs === entry) { refuse(`its own entry: ${TO_REVIEW}`, true); continue; }
    if (!inBundle) { refuse(`another page or canon, outside its own bundle: ${TO_REVIEW}`, true); continue; }
    if (kept.has(abs)) { refuse('the cycle writes this file; the steward does not'); continue; }
    if (abs === context) { refuse(`its own Context, the memory beside its entry: ${TO_REVIEW}`, true); continue; }
    if (!existsSync(abs) || !statSync(abs).isFile()) { refuse('no such file'); continue; }
    if (isEntryFile(abs)) { refuse(`an entry kept in its bundle: ${TO_REVIEW}`, true); continue; }
    if (abs.toLowerCase().endsWith('.md')) {
      let text = '';
      try { text = readFileSync(abs, 'utf8'); } catch (err) { refuse(`unreadable: ${err.message}`); continue; }
      const fm = checkFrontmatter(text);
      if (!fm.ok) { refuse(`frontmatter does not parse (${fm.error})`); continue; }
    }
    allowed.push({ path: rel, why: e.why });
  }
  return { allowed, refused };
}

// ── Proposals for canon (Loudon, 2026-10-18) ────────────────────────────────

const oneLine = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
const firstText = (...vs) => { for (const v of vs) if (typeof v === 'string' && v.trim()) return v; return ''; };

/**
 * The canon edits a cycle's messages propose: each `payload.proposed_edits`
 * item as { page, place, words, why }. `page` names the target by title or by
 * palace path; `place` is where on it (a section, `frontmatter`); `words` are
 * the proposed text, kept with its line breaks; `why` is one line.
 */
export function proposedEditsOf(messages) {
  const out = [];
  for (const m of messages || []) {
    const l = m && m.payload ? m.payload.proposed_edits : null;
    for (const e of Array.isArray(l) ? l : []) {
      if (!e || typeof e !== 'object') continue;
      out.push({
        page: oneLine(firstText(e.page, e.path)),
        place: oneLine(firstText(e.place, e.section)),
        words: firstText(e.words, e.text).replace(/\r\n/g, '\n').replace(/^\s*\n/, '').replace(/\s+$/, ''),
        why: oneLine(e.why),
      });
    }
  }
  return out;
}

/**
 * Where a proposal points: { page, path, entry, exists }, or { error }. A
 * title (`Shopkeeper`, `[[Shopkeeper]]`) is looked up as an entry; a path
 * (`_ops/heartbeat/README.md`) is taken as given, inside the palace. A target
 * that does not exist yet is a proposed new page, and `path` is null for a
 * title no entry carries.
 */
export function proposalTarget(palaceRoot, page, { findEntry = findEntryFile } = {}) {
  const root = resolve(palaceRoot);
  const s = String(page || '').trim().replace(/^\[\[/, '').replace(/\]\]$/, '').split('|')[0].split('#')[0].trim();
  if (!s) return null;
  if (s.includes('/') || /\.[a-z]{2,5}$/i.test(s)) {
    const abs = isAbsolute(s) ? resolve(s) : resolve(root, s);
    const rel = relative(root, abs);
    if (!rel || rel.startsWith('..') || isAbsolute(rel)) return { error: 'outside the palace' };
    const exists = existsSync(abs) && statSync(abs).isFile();
    const entry = exists && isEntryFile(abs);
    const md = /\.md$/i.test(rel);
    return { page: entry || (!exists && md) ? basename(rel).replace(/\.md$/i, '') : rel, path: rel, entry, exists };
  }
  const f = findEntry(root, s);
  return { page: s, path: f ? relative(root, f) : null, entry: !!f && isEntryFile(f), exists: !!f };
}

/**
 * Name each proposal's target and set aside the ones that cannot be filed: no
 * page named, no words, or a path outside the palace. Every target is fair to
 * propose, its own entry, canon and a new page included; nothing here writes
 * the page. Returns { filed: [{ page, path, entry, exists, place, words, why }],
 * dropped: [{ page, why, reason }] }.
 */
export function vetProposedEdits({ palaceRoot, edits = [], findEntry = findEntryFile }) {
  const filed = [];
  const dropped = [];
  for (const e of edits) {
    if (!e.page) { dropped.push({ page: '', why: e.why, reason: 'names no page' }); continue; }
    if (!e.words.trim()) { dropped.push({ page: e.page, why: e.why, reason: 'carries no words' }); continue; }
    const t = proposalTarget(palaceRoot, e.page, { findEntry });
    if (!t || t.error) { dropped.push({ page: e.page, why: e.why, reason: t ? t.error : 'names no page' }); continue; }
    filed.push({ page: t.page, path: t.path, entry: t.entry, exists: t.exists, place: e.place, words: e.words, why: e.why });
  }
  return { filed, dropped };
}

/**
 * The palace-relative paths among `paths` that the committer's `git add` would
 * refuse as ignored. Asked of `git add --dry-run` itself, with the door's own
 * literal pathspecs, so its verdict is git add's: an untracked ignored file, a
 * tracked file inside an ignored folder, a name with [ ] ? * in it, a name in
 * decomposed Unicode. A dry run still takes the index lock, so it runs against
 * a scratch copy of the index and never contends with another writer. One run
 * answers for every path; only when it refuses something is each path asked
 * alone. When git cannot answer, nothing is reported, and the committer's own
 * refusal is the backstop (dropIgnored).
 */
export function ignoredPaths(palaceRoot, paths) {
  if (!paths || paths.length === 0) return [];
  const root = resolve(palaceRoot);
  let scratch = null;
  try {
    scratch = mkdtempSync(join(tmpdir(), 'cycle-commit-index-'));
    const index = join(scratch, 'index');
    // Without the real index every tracked file would look untracked, and a tracked file a rule
    // matches would be dropped though the committer takes it: when git cannot say, say nothing.
    const real = spawnSync('git', ['rev-parse', '--git-path', 'index'], { cwd: root, encoding: 'utf8' });
    if (real.status !== 0 || !real.stdout.trim()) return [];
    const realIndex = resolve(root, real.stdout.trim());
    if (existsSync(realIndex)) copyFileSync(realIndex, index); // none yet: an empty index is the truth
    const env = { ...process.env, GIT_INDEX_FILE: index, GIT_LITERAL_PATHSPECS: '1', GIT_OPTIONAL_LOCKS: '0' };
    const dry = (ps) => spawnSync('git', ['add', '--dry-run', '--', ...ps], { cwd: root, env, encoding: 'utf8', timeout: 30_000 });
    const refused = (r) => r.status === 1 && /ignored by one of your \.gitignore files/i.test(r.stderr || '');
    const out = [];
    for (let i = 0; i < paths.length; i += 200) {
      const chunk = paths.slice(i, i + 200);
      // A clean run settles the chunk. Anything else, a refusal or a path git cannot find, is
      // asked path by path, so one missing path never hides an ignored one beside it.
      if (dry(chunk).status === 0) continue;
      for (const p of chunk) if (refused(dry([p]))) out.push(p);
    }
    return out;
  } catch {
    return [];
  } finally {
    if (scratch) rmSync(scratch, { recursive: true, force: true });
  }
}

/**
 * Sort declared paths into what this cycle may commit and why the rest may not.
 * Paths come back palace-relative.
 */
export function selectCommitPaths({ palaceRoot, bundleDir, paths, maxBytes = MAX_COMMIT_BYTES }) {
  const root = resolve(palaceRoot);
  const bundle = bundleDir ? resolve(root, bundleDir) : null;
  const result = { paths: [], oversize: [], outside: [], missing: [], entries: [] };
  const seen = new Set();
  for (const raw of paths || []) {
    const abs = isAbsolute(raw) ? resolve(raw) : resolve(root, raw);
    const rel = relative(root, abs);
    if (seen.has(rel)) continue;
    seen.add(rel);
    const inBundle = bundle && !relative(bundle, abs).startsWith('..') && !isAbsolute(relative(bundle, abs));
    if (rel.startsWith('..') || isAbsolute(rel) || !inBundle) { result.outside.push(rel); continue; }
    if (!existsSync(abs) || !statSync(abs).isFile()) { result.missing.push(rel); continue; }
    if (isEntryFile(abs)) { result.entries.push(rel); continue; }
    const bytes = statSync(abs).size;
    if (bytes > maxBytes) { result.oversize.push({ path: rel, bytes }); continue; }
    result.paths.push(rel);
  }
  return result;
}

/** The first shipped message's headline, for the commit subject. */
export function headlineOf(messages) {
  for (const m of messages || []) {
    const p = (m && m.payload) || {};
    const h = p.headline || p.subject || p.summary || p.question || p.content;
    if (typeof h === 'string' && h.trim()) {
      const one = h.replace(/\s+/g, ' ').trim();
      return one.length > 72 ? `${one.slice(0, 71)}…` : one;
    }
  }
  return 'machinery and scroll';
}

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

// A brief contention on git's own index lock is worth a short retry. A door
// timeout is not: the committer has already waited its full time limit
// (server/door.js), so retrying would only stack more waits behind it.
export function isRetryable(text) {
  const t = String(text || '');
  if (/could not lock the door/i.test(t)) return false;
  return /index\.lock|could not lock|Unable to create/i.test(t);
}

const COMMITTED_BY = 'Committed by process-cycle.js after the cycle; the steward did not run git.';
const ignoredNote = (paths) => `Not committed — ignored by .gitignore:\n${paths.map((p) => `- ${p}`).join('\n')}`;

// What the cycle did with the Shop roster (shop-roster.js), for the body: a
// regenerated block rides as machinery, with the block lines that changed
// (some may be drift older than the cycle), and a refusal is named with its reason.
const ROSTER_LINES_SHOWN = 8;
const rosterChanges = (label, lines = []) => (lines.length
  ? [`- ${label}:`, ...lines.slice(0, ROSTER_LINES_SHOWN).map((l) => `  ${l}`), ...(lines.length > ROSTER_LINES_SHOWN ? [`  … and ${lines.length - ROSTER_LINES_SHOWN} more`] : [])]
  : []);
function rosterLines(roster) {
  if (!roster) return [];
  const after = `after this cycle changed ${roster.triggers.join(', ')}`;
  if (roster.changed) {
    return [[
      'Regenerated the Shop roster, as machinery and not a page edit:',
      `- ${roster.path} § Roster — rebuilt by ${roster.builder} ${after}; nothing outside the generated block changed`,
      ...rosterChanges('now reads', roster.added),
      ...rosterChanges('no longer reads', roster.removed),
    ].join('\n')];
  }
  if (roster.refused) return [`Shop roster NOT regenerated, ${after}:\n- ${roster.refused}; run node ${roster.builder} by hand once that is settled`];
  return [];
}

// How a proposal names its target in a body or on a trail: the page, then the place.
export function proposalName(p) {
  const named = p.entry || !p.exists || !p.path ? p.page : p.path;
  return `${named}${p.place ? ` (${p.place})` : ''}${p.exists ? '' : ', a new page'}`;
}

// A cycle commit's body, from what rode and what was left out and why.
export function cycleBody({ shipped = [], pageEdits = [], refusedEdits = [], proposals = [], roster = null, oversize = [], entries = [], outside = [], ignored = [], maxBytes = MAX_COMMIT_BYTES }) {
  const lines = [];
  if (pageEdits.length) lines.push(`Changed in the workshop:\n${pageEdits.map((e) => `- ${e.path}${e.why ? ` — ${e.why}` : ''}`).join('\n')}`);
  if (refusedEdits.length) lines.push(`Page edits NOT committed:\n${refusedEdits.map((e) => `- ${e.path} — ${e.reason}`).join('\n')}`);
  if (proposals.length) lines.push(`Proposed for canon, filed in the tuning ledger and owed until Loudon's review:\n${proposals.map((p) => `- ${proposalName(p)}${p.item ? `, item ${p.item}` : ''}${p.why ? ` — ${p.why}` : ''}`).join('\n')}`);
  lines.push(...rosterLines(roster));
  if (shipped.length) lines.push(`Shipped this cycle:\n${shipped.map((p) => `- ${p}`).join('\n')}`);
  if (oversize.length) lines.push(`Left uncommitted, over ${Math.round(maxBytes / 1048576)} MB:\n${oversize.map((o) => `- ${o.path} (${(o.bytes / 1048576).toFixed(1)} MB)`).join('\n')}`);
  if (entries.length) lines.push(`Not committed — an entry changes only through Loudon's review:\n${entries.map((p) => `- ${p}`).join('\n')}`);
  if (outside.length) lines.push(`Not committed — outside the steward's bundle:\n${outside.map((p) => `- ${p}`).join('\n')}`);
  if (ignored.length) lines.push(ignoredNote(ignored));
  lines.push(COMMITTED_BY);
  return lines.join('\n\n');
}

// git's own refusal to add an ignored path, which fails the whole commit.
export function isIgnoredRefusal(text) {
  return /paths are ignored by one of your \.gitignore files/i.test(String(text || ''));
}

// A regenerated roster the commit no longer carries (git ignores it) is not
// claimed as regenerated; the ignored list names it instead.
function rosterRiding(roster, paths) {
  return roster && roster.changed && !paths.includes(roster.path) ? null : roster;
}

// The backstop: when the committer refuses because a path is ignored (the
// screen missed it, or .gitignore changed since), ask git again and return the
// paths and body for one more try without the ignored ones, or null when there
// is nothing to drop or nothing left.
export function dropIgnored({ palaceRoot, paths, body, parts = null }) {
  const ignored = ignoredPaths(palaceRoot, paths);
  const rest = paths.filter((p) => !ignored.includes(p));
  if (ignored.length === 0 || rest.length === 0) return null;
  // A cycle's body is rebuilt from its parts, so a dropped file leaves the
  // shipped list and joins the one ignored list; any other body gets a note.
  const nextBody = parts
    ? cycleBody({ ...parts, shipped: (parts.shipped || []).filter((p) => !ignored.includes(p)), pageEdits: (parts.pageEdits || []).filter((e) => !ignored.includes(e.path)), roster: rosterRiding(parts.roster, rest), ignored: [...(parts.ignored || []), ...ignored] })
    : body && body.includes(COMMITTED_BY) ? body.replace(COMMITTED_BY, `${ignoredNote(ignored)}\n\n${COMMITTED_BY}`)
      : [body, ignoredNote(ignored)].filter(Boolean).join('\n\n');
  return { paths: rest, body: nextBody, ignored };
}

function committerArgs({ committer, kind, scope, summary, body, verify, author, paths }) {
  const args = [committer, '--only', '--kind', kind, '--summary', summary, '--verify', verify, '--author', author];
  if (scope) args.push('--scope', scope);
  if (body) args.push('--body', body);
  for (const p of paths) args.push('--path', p);
  return args;
}

function readCommitted(out) {
  const m = String(out).match(/palace-commit: committed ([0-9a-f]{7,40})/);
  if (m) return { ok: true, hash: m[1] };
  if (/nothing to commit/.test(String(out))) return { ok: true, hash: null, nothing: true };
  return { ok: false, hash: null, error: `unexpected committer output: ${String(out).slice(-300)}` };
}

/**
 * Commit the named paths through the house committer. Retries briefly when
 * another writer holds the git lock. Never throws: a failed commit leaves the
 * files on disk, uncommitted, exactly as before this step existed.
 *
 * @returns {{ ok: boolean, hash: string|null, nothing?: boolean, error?: string }}
 */
export function commitPaths({ palaceRoot, paths, kind = 'steward', scope, summary, body = '', parts = null, verify = 'unverified', author = 'claude', committer = COMMITTER_DEFAULT, retries = 3, exec = execFileSync }) {
  if (!paths || paths.length === 0) return { ok: true, hash: null, nothing: true };
  let args = committerArgs({ committer, kind, scope, summary, body, verify, author, paths });
  let lastErr = null;
  let dropped = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const out = exec('node', args, { cwd: palaceRoot, encoding: 'utf8', env: { ...process.env, PALACE_ROOT: palaceRoot }, stdio: ['ignore', 'pipe', 'pipe'] });
      return dropped ? { ...readCommitted(out), ignored: dropped } : readCommitted(out);
    } catch (e) {
      lastErr = String((e && (e.stderr || e.message)) || e);
      if (!dropped && isIgnoredRefusal(lastErr)) {
        const next = dropIgnored({ palaceRoot, paths, body, parts });
        // The try without them does not spend a retry: a refusal on the last attempt still gets it.
        if (next) { dropped = next.ignored; args = committerArgs({ committer, kind, scope, summary, body: next.body, verify, author, paths: next.paths }); attempt -= 1; continue; }
      }
      if (!isRetryable(lastErr)) break;
      sleep(400 * (attempt + 1));
    }
  }
  return { ok: false, hash: null, error: lastErr ? lastErr.slice(-500) : 'unknown' };
}

/**
 * The async twin of commitPaths, for the STIGMERGY server. The server holds
 * the door asynchronously for its own commits (deck saves, companion edits,
 * regen, the Trickster's undo), so it must never wait on the committer with
 * its event loop blocked: a blocked server cannot finish the commit it is
 * holding the door for, and the cycle's committer would wait on it forever.
 * Same arguments, same result shape; resolves, never rejects.
 */
export function commitPathsAsync({ palaceRoot, paths, kind = 'steward', scope, summary, body = '', parts = null, verify = 'unverified', author = 'claude', committer = COMMITTER_DEFAULT, retries = 3, spawnFn = spawn }) {
  if (!paths || paths.length === 0) return Promise.resolve({ ok: true, hash: null, nothing: true });
  let args = committerArgs({ committer, kind, scope, summary, body, verify, author, paths });
  let dropped = null;
  const once = () => new Promise((done) => {
    let out = '';
    let err = '';
    let child;
    try {
      child = spawnFn('node', args, { cwd: palaceRoot, env: { ...process.env, PALACE_ROOT: palaceRoot }, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) { done({ code: -1, out, err: String(e && e.message) }); return; }
    child.stdout.on('data', (b) => { out += b; });
    child.stderr.on('data', (b) => { err += b; });
    child.on('error', (e) => done({ code: -1, out, err: String(e && e.message) }));
    child.on('close', (code) => done({ code, out, err }));
  });
  return (async () => {
    let lastErr = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      const r = await once();
      if (r.code === 0) return dropped ? { ...readCommitted(r.out), ignored: dropped } : readCommitted(r.out);
      lastErr = r.err || r.out || `exit ${r.code}`;
      if (!dropped && isIgnoredRefusal(lastErr)) {
        const next = dropIgnored({ palaceRoot, paths, body, parts });
        // The try without them does not spend a retry: a refusal on the last attempt still gets it.
        if (next) { dropped = next.ignored; args = committerArgs({ committer, kind, scope, summary, body: next.body, verify, author, paths: next.paths }); attempt -= 1; continue; }
      }
      if (!isRetryable(lastErr)) break;
      await new Promise((w) => setTimeout(w, 400 * (attempt + 1)));
    }
    return { ok: false, hash: null, error: lastErr ? String(lastErr).slice(-500) : 'unknown' };
  })();
}

/**
 * What one cycle's commit holds, without making it: the paths that may ride,
 * the message, and what was left out and why. commitCycle makes the commit
 * here and now; the STIGMERGY server hands the plan to commitPathsAsync.
 * `roster` is what refreshShopRoster did this cycle (shop-roster.js): a
 * regenerated The Shop.md rides as machinery, named as such in the body.
 */
export function planCycleCommit({ palaceRoot, home, cycleN, bundleDir, messages, extraPaths = [], pageEdits = [], refusedEdits = [], proposals = [], roster = null, maxBytes = MAX_COMMIT_BYTES }) {
  const pick = selectCommitPaths({ palaceRoot, bundleDir, paths: shippedPaths(messages), maxBytes });
  const root = resolve(palaceRoot);
  // Page edits arrive already vetted (vetPageEdits); a path the steward also
  // listed as an artifact rides as the edit, not as a refused entry. So does a
  // regenerated roster: it rides as machinery.
  const edited = new Set(pageEdits.map((e) => e.path));
  const rosterPath = roster && roster.changed && roster.path ? roster.path : null;
  const rides = (p) => edited.has(p) || p === rosterPath;
  const extras = [...extraPaths, ...(rosterPath ? [rosterPath] : [])]
    .map((p) => relative(root, isAbsolute(p) ? p : join(root, p)))
    .filter((rel) => !rel.startsWith('..') && existsSync(join(root, rel)));
  const candidates = [...new Set([...pick.paths, ...edited, ...extras])];
  const ignored = ignoredPaths(root, candidates);
  const all = candidates.filter((p) => !ignored.includes(p));
  const shipped = pick.paths.filter((p) => !ignored.includes(p) && !rides(p));
  const edits = pageEdits.filter((e) => !ignored.includes(e.path));
  const entries = pick.entries.filter((p) => !rides(p));
  const outside = pick.outside.filter((p) => !rides(p));
  const parts = { shipped, pageEdits: edits, refusedEdits, proposals, roster: rosterRiding(roster, all), oversize: pick.oversize, entries, outside, ignored, maxBytes };
  return {
    palaceRoot, paths: all, kind: 'steward', scope: home,
    summary: `cycle ${cycleN} — ${headlineOf(messages)}`,
    body: cycleBody(parts), parts,
    verify: 'unverified', author: 'claude',
    shipped, pageEdits: edits, refusedEdits, proposals, roster: parts.roster, oversize: pick.oversize, entries, outside, missing: pick.missing, ignored,
  };
}

/**
 * The whole step for one cycle: pick what may ride, then commit it with the
 * cycle's machinery, scroll and the board.
 */
export function commitCycle({ palaceRoot, home, cycleN, bundleDir, messages, extraPaths = [], pageEdits = [], refusedEdits = [], proposals = [], roster = null, maxBytes = MAX_COMMIT_BYTES, committer, exec }) {
  const plan = planCycleCommit({ palaceRoot, home, cycleN, bundleDir, messages, extraPaths, pageEdits, refusedEdits, proposals, roster, maxBytes });
  const res = commitPaths({
    palaceRoot, paths: plan.paths, kind: plan.kind, scope: plan.scope,
    summary: plan.summary, body: plan.body, parts: plan.parts, committer, exec,
  });
  const late = res.ignored || [];
  const paths = plan.paths.filter((p) => !late.includes(p));
  return { ...res, paths, shipped: plan.shipped.filter((p) => !late.includes(p)), pageEdits: plan.pageEdits.filter((e) => !late.includes(e.path)), refusedEdits: plan.refusedEdits, proposals: plan.proposals, roster: rosterRiding(plan.roster, paths), oversize: plan.oversize, entries: plan.entries, outside: plan.outside, missing: plan.missing, ignored: [...plan.ignored, ...late] };
}
