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
//   - never an entry: a `.md` whose frontmatter carries `type:` is the house,
//     and the house changes only through an elder. Some bundles hold entries
//     (`Modes of Collaboration/Dialectic.md`), so the folder rule alone is not
//     enough;
//   - never a file .gitignore ignores: the committer refuses a commit that names
//     one, so a single ignored artifact would leave the whole cycle uncommitted.
//     It is left out and named in the commit body, like an oversize file.

import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, statSync, readFileSync } from 'node:fs';
import { resolve, relative, isAbsolute, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
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

/**
 * The palace-relative paths among `paths` that .gitignore ignores, asked of git
 * itself (`git check-ignore`, which never reports a tracked file: a tracked file
 * commits whatever the ignore rules say). When git cannot answer, nothing is
 * reported, and the committer's own refusal is the backstop (see dropIgnored).
 */
export function ignoredPaths(palaceRoot, paths) {
  if (!paths || paths.length === 0) return [];
  const r = spawnSync('git', ['check-ignore', '-z', '--stdin'], {
    cwd: palaceRoot, input: paths.map((p) => `${p}\0`).join(''), encoding: 'utf8',
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' }, timeout: 30_000,
  });
  if (r.status !== 0) return []; // 1: none ignored; anything else: git could not say
  const hit = new Set(String(r.stdout || '').split('\0').filter(Boolean));
  return paths.filter((p) => hit.has(p));
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

// git's own refusal to add an ignored path, which fails the whole commit.
export function isIgnoredRefusal(text) {
  return /paths are ignored by one of your \.gitignore files/i.test(String(text || ''));
}

// The backstop: when the committer refuses because a path is ignored (the
// screen missed it, or .gitignore changed since), ask git again and return the
// paths and body for one more try without the ignored ones, or null when there
// is nothing to drop or nothing left.
export function dropIgnored({ palaceRoot, paths, body }) {
  const ignored = ignoredPaths(palaceRoot, paths);
  const rest = paths.filter((p) => !ignored.includes(p));
  if (ignored.length === 0 || rest.length === 0) return null;
  const note = ignoredNote(ignored);
  const nextBody = body && body.includes(COMMITTED_BY) ? body.replace(COMMITTED_BY, `${note}\n\n${COMMITTED_BY}`) : [body, note].filter(Boolean).join('\n\n');
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
export function commitPaths({ palaceRoot, paths, kind = 'steward', scope, summary, body = '', verify = 'unverified', author = 'claude', committer = COMMITTER_DEFAULT, retries = 3, exec = execFileSync }) {
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
        const next = dropIgnored({ palaceRoot, paths, body });
        if (next) { dropped = next.ignored; args = committerArgs({ committer, kind, scope, summary, body: next.body, verify, author, paths: next.paths }); continue; }
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
export function commitPathsAsync({ palaceRoot, paths, kind = 'steward', scope, summary, body = '', verify = 'unverified', author = 'claude', committer = COMMITTER_DEFAULT, retries = 3, spawnFn = spawn }) {
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
        const next = dropIgnored({ palaceRoot, paths, body });
        if (next) { dropped = next.ignored; args = committerArgs({ committer, kind, scope, summary, body: next.body, verify, author, paths: next.paths }); continue; }
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
export function planCycleCommit({ palaceRoot, home, cycleN, bundleDir, messages, extraPaths = [], maxBytes = MAX_COMMIT_BYTES }) {
  const pick = selectCommitPaths({ palaceRoot, bundleDir, paths: shippedPaths(messages), maxBytes });
  const root = resolve(palaceRoot);
  const extras = extraPaths
    .map((p) => relative(root, isAbsolute(p) ? p : join(root, p)))
    .filter((rel) => !rel.startsWith('..') && existsSync(join(root, rel)));
  const candidates = [...new Set([...pick.paths, ...extras])];
  const ignored = ignoredPaths(root, candidates);
  const all = candidates.filter((p) => !ignored.includes(p));
  const shipped = pick.paths.filter((p) => !ignored.includes(p));
  const lines = [];
  if (shipped.length) lines.push(`Shipped this cycle:\n${shipped.map((p) => `- ${p}`).join('\n')}`);
  if (pick.oversize.length) lines.push(`Left uncommitted, over ${Math.round(maxBytes / 1048576)} MB:\n${pick.oversize.map((o) => `- ${o.path} (${(o.bytes / 1048576).toFixed(1)} MB)`).join('\n')}`);
  if (pick.entries.length) lines.push(`Not committed — entries change only through an elder:\n${pick.entries.map((p) => `- ${p}`).join('\n')}`);
  if (pick.outside.length) lines.push(`Not committed — outside the steward's bundle:\n${pick.outside.map((p) => `- ${p}`).join('\n')}`);
  if (ignored.length) lines.push(ignoredNote(ignored));
  lines.push(COMMITTED_BY);
  return {
    palaceRoot, paths: all, kind: 'steward', scope: home,
    summary: `cycle ${cycleN} — ${headlineOf(messages)}`,
    body: lines.join('\n\n'),
    verify: 'unverified', author: 'claude',
    shipped, oversize: pick.oversize, entries: pick.entries, outside: pick.outside, missing: pick.missing, ignored,
  };
}

/**
 * The whole step for one cycle: pick what may ride, then commit it with the
 * cycle's machinery, scroll and the board.
 */
export function commitCycle({ palaceRoot, home, cycleN, bundleDir, messages, extraPaths = [], maxBytes = MAX_COMMIT_BYTES, committer, exec }) {
  const plan = planCycleCommit({ palaceRoot, home, cycleN, bundleDir, messages, extraPaths, maxBytes });
  const res = commitPaths({
    palaceRoot, paths: plan.paths, kind: plan.kind, scope: plan.scope,
    summary: plan.summary, body: plan.body, committer, exec,
  });
  return { ...res, paths: plan.paths, shipped: plan.shipped, oversize: plan.oversize, entries: plan.entries, outside: plan.outside, missing: plan.missing, ignored: [...plan.ignored, ...(res.ignored || [])] };
}
