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
// A steward is grown up for its own page and bundle (decided 2026-10-16): it
// may edit its own entry, body and frontmatter alike, and its bundle's files,
// and lists each edit in its post as `page_edits: [{ path, why }]`. Those go
// through vetPageEdits, not the artifact rule: its own entry `.md` and its
// bundle's files ride, once any frontmatter they carry parses (a page whose
// frontmatter fails to parse reads as blank to the deck and to the steward, so
// it is refused loudly). Another page, a new entry, canon, the scroll the cycle
// writes and the ledger it keeps are refused, and stay proposals.

import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, statSync, readFileSync, copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, relative, isAbsolute, join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { payloadPathArtifacts } from './scroll-file.js';
import { declaredPathsOf } from './artifact-backstop.js';

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

/**
 * Sort a steward's page edits into what the cycle may commit and what it may
 * not. Allowed: its own entry `.md`, and files in its bundle other than the
 * scroll and the tuning ledger (the cycle writes those) and other entries kept
 * there (another page). Every allowed `.md` must have frontmatter that parses;
 * its own entry must have some. Paths come back palace-relative; each refusal
 * carries a reason and whether it stays a proposal.
 *
 * @returns {{ allowed: {path, why}[], refused: {path, why, reason, proposal: boolean}[] }}
 */
export function vetPageEdits({ palaceRoot, home, entryFile, bundleDir, edits = [] }) {
  const root = resolve(palaceRoot);
  const entry = entryFile ? resolve(root, entryFile) : null;
  const bundle = bundleDir ? resolve(root, bundleDir) : null;
  const kept = new Set(bundle ? [join(bundle, `${home} — scroll.md`), join(bundle, `${home} — tuning.md`)] : []);
  const allowed = [];
  const refused = [];
  const seen = new Set();
  for (const e of edits) {
    const abs = isAbsolute(e.path) ? resolve(e.path) : resolve(root, e.path);
    const rel = relative(root, abs);
    if (seen.has(rel)) continue;
    seen.add(rel);
    const refuse = (reason, proposal = false) => refused.push({ path: rel, why: e.why, reason, proposal });
    const isOwnEntry = entry && abs === entry;
    const r = bundle ? relative(bundle, abs) : '..';
    const inBundle = !!bundle && !!r && !r.startsWith('..') && !isAbsolute(r);
    if (rel.startsWith('..') || isAbsolute(rel)) { refuse('outside the palace'); continue; }
    if (!isOwnEntry && !inBundle) { refuse('another page or canon, outside its own page and bundle', true); continue; }
    if (kept.has(abs)) { refuse('the cycle writes this file; the steward does not'); continue; }
    if (!existsSync(abs) || !statSync(abs).isFile()) { refuse('no such file'); continue; }
    if (!isOwnEntry && isEntryFile(abs) && !basename(abs).startsWith(`${home} — `)) { refuse('another entry kept in the bundle, so another page', true); continue; }
    if (abs.toLowerCase().endsWith('.md')) {
      let text = '';
      try { text = readFileSync(abs, 'utf8'); } catch (err) { refuse(`unreadable: ${err.message}`); continue; }
      const fm = checkFrontmatter(text, { required: isOwnEntry });
      if (!fm.ok) { refuse(`frontmatter does not parse (${fm.error})`); continue; }
    }
    allowed.push({ path: rel, why: e.why });
  }
  return { allowed, refused };
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

// A cycle commit's body, from what rode and what was left out and why.
export function cycleBody({ shipped = [], pageEdits = [], refusedEdits = [], oversize = [], entries = [], outside = [], ignored = [], maxBytes = MAX_COMMIT_BYTES }) {
  const lines = [];
  if (pageEdits.length) lines.push(`Changed the page:\n${pageEdits.map((e) => `- ${e.path}${e.why ? ` — ${e.why}` : ''}`).join('\n')}`);
  if (refusedEdits.length) lines.push(`Page edits NOT committed:\n${refusedEdits.map((e) => `- ${e.path} — ${e.reason}${e.proposal ? '; it stays a proposal' : ''}`).join('\n')}`);
  if (shipped.length) lines.push(`Shipped this cycle:\n${shipped.map((p) => `- ${p}`).join('\n')}`);
  if (oversize.length) lines.push(`Left uncommitted, over ${Math.round(maxBytes / 1048576)} MB:\n${oversize.map((o) => `- ${o.path} (${(o.bytes / 1048576).toFixed(1)} MB)`).join('\n')}`);
  if (entries.length) lines.push(`Not committed — an entry rides only as the steward's own page edit:\n${entries.map((p) => `- ${p}`).join('\n')}`);
  if (outside.length) lines.push(`Not committed — outside the steward's bundle:\n${outside.map((p) => `- ${p}`).join('\n')}`);
  if (ignored.length) lines.push(ignoredNote(ignored));
  lines.push(COMMITTED_BY);
  return lines.join('\n\n');
}

// git's own refusal to add an ignored path, which fails the whole commit.
export function isIgnoredRefusal(text) {
  return /paths are ignored by one of your \.gitignore files/i.test(String(text || ''));
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
    ? cycleBody({ ...parts, shipped: (parts.shipped || []).filter((p) => !ignored.includes(p)), pageEdits: (parts.pageEdits || []).filter((e) => !ignored.includes(e.path)), ignored: [...(parts.ignored || []), ...ignored] })
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
 */
export function planCycleCommit({ palaceRoot, home, cycleN, bundleDir, messages, extraPaths = [], pageEdits = [], refusedEdits = [], maxBytes = MAX_COMMIT_BYTES }) {
  const pick = selectCommitPaths({ palaceRoot, bundleDir, paths: shippedPaths(messages), maxBytes });
  const root = resolve(palaceRoot);
  // Page edits arrive already vetted (vetPageEdits); a path the steward also
  // listed as an artifact rides as the edit, not as a refused entry.
  const edited = new Set(pageEdits.map((e) => e.path));
  const extras = extraPaths
    .map((p) => relative(root, isAbsolute(p) ? p : join(root, p)))
    .filter((rel) => !rel.startsWith('..') && existsSync(join(root, rel)));
  const candidates = [...new Set([...pick.paths, ...edited, ...extras])];
  const ignored = ignoredPaths(root, candidates);
  const all = candidates.filter((p) => !ignored.includes(p));
  const shipped = pick.paths.filter((p) => !ignored.includes(p) && !edited.has(p));
  const edits = pageEdits.filter((e) => !ignored.includes(e.path));
  const entries = pick.entries.filter((p) => !edited.has(p));
  const outside = pick.outside.filter((p) => !edited.has(p));
  const parts = { shipped, pageEdits: edits, refusedEdits, oversize: pick.oversize, entries, outside, ignored, maxBytes };
  return {
    palaceRoot, paths: all, kind: 'steward', scope: home,
    summary: `cycle ${cycleN} — ${headlineOf(messages)}`,
    body: cycleBody(parts), parts,
    verify: 'unverified', author: 'claude',
    shipped, pageEdits: edits, refusedEdits, oversize: pick.oversize, entries, outside, missing: pick.missing, ignored,
  };
}

/**
 * The whole step for one cycle: pick what may ride, then commit it with the
 * cycle's machinery, scroll and the board.
 */
export function commitCycle({ palaceRoot, home, cycleN, bundleDir, messages, extraPaths = [], pageEdits = [], refusedEdits = [], maxBytes = MAX_COMMIT_BYTES, committer, exec }) {
  const plan = planCycleCommit({ palaceRoot, home, cycleN, bundleDir, messages, extraPaths, pageEdits, refusedEdits, maxBytes });
  const res = commitPaths({
    palaceRoot, paths: plan.paths, kind: plan.kind, scope: plan.scope,
    summary: plan.summary, body: plan.body, parts: plan.parts, committer, exec,
  });
  const late = res.ignored || [];
  return { ...res, paths: plan.paths.filter((p) => !late.includes(p)), shipped: plan.shipped.filter((p) => !late.includes(p)), pageEdits: plan.pageEdits.filter((e) => !late.includes(e.path)), refusedEdits: plan.refusedEdits, oversize: plan.oversize, entries: plan.entries, outside: plan.outside, missing: plan.missing, ignored: [...plan.ignored, ...late] };
}
