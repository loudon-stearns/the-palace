#!/usr/bin/env node
// trunk-state -- what the trunk looks like right now, read and never touched.
//
//   node _ops/stigmergy/app/scripts/trunk-state.mjs [--since 24h] [--json] [--no-writers] [--sessions]
//
// One reader for every place that asks "what is in flight": the Return's map,
// Closing Well's cold read, the Weave's sweep, and the LOG deck's strip. It
// reports, in this order:
//   - main against origin: how far ahead, how old the oldest unsent commit is,
//     and the last push receipt (palace-push.jsonl);
//   - what the ear heard since --since: moves of main through the door and
//     around it, the around ones named (palace-ear.jsonl);
//   - a landing that died and has not been healed yet (palace-land.json);
//   - what sits unsaved in the main checkout, grouped by folder, with its age
//     and, where a session transcript names the file, its writer (Loudon's
//     okay, 2026-10-14); --no-writers skips that search;
//   - worktrees and local branches: merged and clean, or still holding work;
//   - with --sessions, the roll call of every unarchived Claude desktop session
//     and the pile each seems to be in (session-roll-call.mjs, read from the
//     app's records and transcripts, never waking one); a session the writer
//     search names for an unsaved file is held back from "can go".
// Every git call is a read with optional locks off.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { rollCall, render as renderRollCall } from './session-roll-call.mjs';

function git(root, args, { allowFail = true } = {}) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
  } catch (e) {
    if (allowFail) return '';
    throw e;
  }
}

function isAncestor(root, a, b) {
  return spawnSync('git', ['merge-base', '--is-ancestor', a, b], { cwd: root, stdio: 'ignore', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } }).status === 0;
}

export function parseSince(text, now = Date.now()) {
  const m = /^(\d+)\s*([hdm])$/.exec(String(text || '24h').trim());
  if (!m) return null;
  const n = Number(m[1]);
  return now - n * (m[2] === 'd' ? 86400000 : m[2] === 'h' ? 3600000 : 60000);
}

// The other way: the --since that reaches back to startMs, for a caller that
// knows when its gap began (the Return's map). Whole hours, or whole days past
// a week, rounded up so the window falls short of the start by a minute at
// most; never under floorMs. The minute is grace for the seconds a caller
// spends between finding the start and asking: git reads a bare date as that
// day at this time of day, which should come out 72h, not 73h.
export function sinceFor(startMs, { now = Date.now(), floorMs = 0 } = {}) {
  const ms = Math.max(now - startMs - 60000, floorMs);
  const hours = Math.max(1, Math.ceil(ms / 3600000));
  return hours > 168 ? `${Math.ceil(ms / 86400000)}d` : `${hours}h`;
}

function readJsonl(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch (_) { return null; } }).filter(Boolean);
}

function ageText(ms) {
  if (ms === null || !Number.isFinite(ms)) return 'n/a';
  const h = ms / 3600000;
  return h < 1 ? `${Math.max(1, Math.round(h * 60))} min` : h < 48 ? `${Math.round(h)} h` : `${Math.round(h / 24)} days`;
}

// The main checkout and its common dir, from any checkout.
export function locate(from) {
  const common = resolve(from, git(from, ['rev-parse', '--git-common-dir']).trim());
  const out = git(from, ['worktree', 'list', '--porcelain']);
  const m = /^worktree (.+)$/m.exec(out);
  return { owner: m ? m[1] : dirname(common), common };
}

export function remoteState(owner, common) {
  const origin = git(owner, ['rev-parse', '-q', '--verify', 'refs/remotes/origin/main']).trim();
  if (!origin) return { ahead: null };
  const ahead = Number(git(owner, ['rev-list', '--count', 'origin/main..main']).trim() || 0);
  const behind = Number(git(owner, ['rev-list', '--count', 'main..origin/main']).trim() || 0);
  const oldest = git(owner, ['log', '--reverse', '--format=%ct', 'origin/main..main']).split('\n').filter(Boolean)[0];
  // When origin/main was last brought up to date: its own reflog, else FETCH_HEAD.
  const refTime = Number(git(owner, ['log', '-g', '-1', '--format=%ct', 'refs/remotes/origin/main']).trim()) * 1000;
  let fetchedMs = Number.isFinite(refTime) && refTime > 0 ? refTime : null;
  try { const f = statSync(join(common, 'FETCH_HEAD')).mtimeMs; if (!fetchedMs || f > fetchedMs) fetchedMs = f; } catch (_) { /* never fetched */ }
  return { ahead, behind, oldestMs: oldest ? Date.now() - Number(oldest) * 1000 : null, fetchedMs };
}

export function earState(owner, common, sinceMs) {
  const all = readJsonl(join(common, 'palace-ear.jsonl'));
  const firstMs = all.length ? Date.parse(all[0].ts) : null;
  const lines = all.filter((l) => Date.parse(l.ts) >= sinceMs && l.ref === 'refs/heads/main');
  const around = lines.filter((l) => l.via !== 'door');
  const hooks = resolve(owner, git(owner, ['rev-parse', '--git-path', 'hooks']).trim() || '.git/hooks');
  // The ear hears only from its first line on; a window reaching earlier is partial.
  const heardFromMs = firstMs !== null && firstMs > sinceMs ? firstMs : sinceMs;
  return { installed: existsSync(join(hooks, 'reference-transaction')), moves: lines.length, door: lines.length - around.length, around, partial: firstMs === null || firstMs > sinceMs, heardFromMs };
}

export function unsaved(owner) {
  const out = git(owner, ['-c', 'core.quotepath=false', 'status', '--porcelain=v1', '-z', '--untracked-files=normal']);
  const rows = [];
  const parts = out.split('\0');
  for (let i = 0; i < parts.length; i += 1) {
    const e = parts[i];
    if (!e) continue;
    const code = e.slice(0, 2);
    const path = e.slice(3);
    if ('RC'.includes(code[0]) || 'RC'.includes(code[1])) i += 1; // the rename's source follows
    let mtime = null;
    try { mtime = statSync(join(owner, path)).mtimeMs; } catch (_) { /* deleted */ }
    rows.push({ code, path, mtime });
  }
  return rows;
}

// Which session last wrote each path: the newest Write, Edit, MultiEdit or
// NotebookEdit call on that file's full path, by the call's own timestamp, in
// this project's session transcripts and their subagents' (credited to the
// parent session). A session that only read or printed the path does not count.
// A write that a later change has overtaken (the file is much newer than the
// call) is marked as such. One linear pass per transcript pulls out every path
// a tool call names and checks it against the unsaved set; only a hit's line is
// parsed. Transcripts last touched before the oldest unsaved file are skipped,
// newest are read first, and the scan stops at a time limit and says so.
const WRITE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);
const SCAN_MS = 30_000;
const PATH_FIELD = /"(?:file_path|notebook_path)":"((?:[^"\\]|\\.)*)"/g;

export function writers(owner, rows, { now = Date.now() } = {}) {
  const dir = join(homedir(), '.claude', 'projects', owner.replace(/[^A-Za-z0-9]/g, '-'));
  const result = { by: {}, truncated: false };
  if (!existsSync(dir) || rows.length === 0) return result;
  // A row is a file, or an untracked folder (its path ends in /), which a
  // write to any file inside it counts for.
  const fileRows = new Map();
  const dirRows = new Map();
  for (const r of rows) {
    if (r.path.endsWith('/')) dirRows.set(join(owner, r.path).replace(/\/$/, ''), r);
    else fileRows.set(join(owner, r.path), r);
  }
  const rowFor = (target) => {
    if (fileRows.has(target)) return fileRows.get(target);
    for (let d = dirname(target); d.length > owner.length; d = dirname(d)) if (dirRows.has(d)) return dirRows.get(d);
    return null;
  };
  const floor = Math.min(...rows.map((r) => r.mtime || now)) - 3600000;
  const files = [];
  const add = (full, session) => { try { const st = statSync(full); if (st.mtimeMs >= floor) files.push({ full, session, mtime: st.mtimeMs }); } catch (_) { /* gone */ } };
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (f.endsWith('.jsonl')) add(full, f.replace(/\.jsonl$/, ''));
    else {
      const sub = join(full, 'subagents');
      if (existsSync(sub)) for (const g of readdirSync(sub)) if (g.endsWith('.jsonl')) add(join(sub, g), f);
    }
  }
  files.sort((x, y) => y.mtime - x.mtime);
  const t0 = Date.now();
  const best = {};
  for (const { full, session, mtime } of files) {
    if (Date.now() - t0 > SCAN_MS) { result.truncated = true; break; }
    let text;
    try { text = readFileSync(full, 'utf8'); } catch (_) { continue; }
    PATH_FIELD.lastIndex = 0;
    let m;
    while ((m = PATH_FIELD.exec(text)) !== null) {
      let target;
      try { target = JSON.parse(`"${m[1]}"`); } catch (_) { continue; }
      const row = rowFor(target);
      if (!row) continue;
      const lo = text.lastIndexOf('\n', m.index) + 1;
      const hi = text.indexOf('\n', m.index);
      let o;
      try { o = JSON.parse(text.slice(lo, hi < 0 ? undefined : hi)); } catch (_) { continue; }
      const items = (o.message && Array.isArray(o.message.content)) ? o.message.content : [];
      for (const it of items) {
        if (!it || it.type !== 'tool_use' || !WRITE_TOOLS.has(it.name)) continue;
        const t = it.input && (it.input.file_path || it.input.notebook_path);
        if (t !== target) continue;
        const ts = Date.parse(o.timestamp || '') || mtime;
        if (!best[row.path] || ts > best[row.path].ts) best[row.path] = { session, ts, target };
      }
      if (hi < 0) break;
      PATH_FIELD.lastIndex = hi;
    }
  }
  for (const [rel, w] of Object.entries(best)) {
    let fileMs = null;
    try { fileMs = statSync(w.target).mtimeMs; } catch (_) { /* gone since */ }
    result.by[rel] = { session: w.session, overtaken: fileMs !== null && fileMs - w.ts > 60_000 };
  }
  return result;
}

export function worktreesAndBranches(owner) {
  const out = git(owner, ['worktree', 'list', '--porcelain']);
  const trees = [];
  for (const block of out.split('\n\n')) {
    const path = /^worktree (.+)$/m.exec(block);
    if (!path || path[1] === owner) continue;
    const branch = /^branch refs\/heads\/(.+)$/m.exec(block);
    const head = /^HEAD ([0-9a-f]+)$/m.exec(block);
    const merged = head ? isAncestor(owner, head[1], 'main') : false;
    const prunable = /^prunable/m.test(block) || !existsSync(path[1]);
    let dirty = -1;
    if (!prunable) {
      try { dirty = git(path[1], ['status', '--porcelain'], { allowFail: false }).split('\n').filter(Boolean).length; } catch (_) { dirty = -1; }
    }
    trees.push({ path: path[1], branch: branch ? branch[1] : '(detached)', merged, dirty, prunable });
  }
  const branches = git(owner, ['for-each-ref', '--format=%(refname:short)', 'refs/heads']).split('\n').filter((b) => b && b !== 'main');
  const unmerged = branches.filter((b) => !isAncestor(owner, b, 'main'));
  return { trees, branches: branches.length, unmerged };
}

function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes('--json');
  const noWriters = argv.includes('--no-writers');
  const withSessions = argv.includes('--sessions');
  const si = argv.indexOf('--since');
  const sinceText = si >= 0 ? argv[si + 1] : '24h';
  const from = process.env.PALACE_ROOT ? resolve(process.env.PALACE_ROOT) : resolve(git(process.cwd(), ['rev-parse', '--show-toplevel'], { allowFail: false }).trim());
  const { owner, common } = locate(from);
  const sinceMs = parseSince(sinceText);
  if (sinceMs === null) { process.stderr.write(`trunk-state: --since takes a number and h, d or m (24h, 2d, 90m), not "${sinceText}"\n`); process.exit(2); }

  const remote = remoteState(owner, common);
  const lastPush = readJsonl(join(common, 'palace-push.jsonl')).at(-1) || null;
  const ear = earState(owner, common, sinceMs);
  let marker = null;
  if (existsSync(join(common, 'palace-land.json'))) {
    try {
      marker = JSON.parse(readFileSync(join(common, 'palace-land.json'), 'utf8'));
      let alive = false;
      try { process.kill(marker.pid, 0); alive = true; } catch (e) { alive = e.code === 'EPERM'; }
      marker.state = alive ? 'in progress' : 'died';
    } catch (_) { marker = { state: 'unreadable' }; }
  }
  const dirt = unsaved(owner);
  const found = noWriters ? { by: {}, truncated: false } : writers(owner, dirt);
  const who = Object.fromEntries(Object.entries(found.by).map(([p, w]) => [p, w.session]));
  const wb = worktreesAndBranches(owner);
  // Each session the writer search names for an unsaved file is held back from "can go".
  const byWriter = new Map();
  for (const [p, w] of Object.entries(found.by)) byWriter.set(w.session, [...(byWriter.get(w.session) || []), p]);
  const sessions = withSessions ? rollCall({ mainWriters: noWriters ? null : byWriter }) : null;

  if (json) {
    process.stdout.write(`${JSON.stringify({ owner, since: new Date(sinceMs).toISOString(), remote, lastPush, ear, marker, writers_truncated: found.truncated, unsaved: dirt.map((d) => ({ ...d, writer: who[d.path] || null, overtaken: found.by[d.path] ? found.by[d.path].overtaken : null })), ...wb, ...(sessions ? { sessions } : {}) }, null, 1)}\n`);
    return;
  }

  const out = [];
  out.push(`The trunk, ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`);
  const asOf = remote.fetchedMs ? ` (origin as last fetched, ${ageText(Date.now() - remote.fetchedMs)} ago)` : '';
  if (remote.ahead === null) out.push('- origin: no tracking ref');
  else if (remote.behind > 0) out.push(`- main and origin have diverged: main is ${remote.ahead} ahead and ${remote.behind} behind${asOf}; a push would not be a fast-forward`);
  else out.push(`- main is ${remote.ahead} ahead of origin${remote.ahead ? `, the oldest unsent ${ageText(remote.oldestMs)} old` : ''}${asOf}`);
  out.push(lastPush ? `- last push: ${lastPush.ts.slice(0, 16).replace('T', ' ')}, ${lastPush.count} commits, ${lastPush.ok ? 'sent' : 'FAILED'}, gate ${lastPush.gate || 'n/a'}` : '- last push: no receipt yet');
  const window = ear.partial ? `since it began listening, ${new Date(ear.heardFromMs).toISOString().slice(0, 16).replace('T', ' ')} UTC (less than the ${sinceText} asked)` : `in the last ${sinceText}`;
  out.push(!ear.installed && ear.moves === 0 ? '- the ear is not installed' : `- the ear, ${window}: ${ear.moves} move${ear.moves === 1 ? '' : 's'} of main, ${ear.door} through the door, ${ear.around.length} around it${ear.installed ? '' : ' (the ear is not installed now)'}`);
  for (const a of ear.around.slice(0, 10)) out.push(`    around: ${a.ts.slice(11, 16)} ${a.new.slice(0, 8)} by ${a.caller || '?'}${a.session ? ` (session ${a.session.slice(0, 8)})` : ''} in ${a.cwd}`);
  if (marker && marker.state === 'in progress') out.push(`- a landing is in progress: ${marker.branch}`);
  else if (marker && marker.state === 'died') out.push(`- a landing died halfway and is not healed yet: ${marker.branch} (${String(marker.old).slice(0, 8)} to ${String(marker.new).slice(0, 8)}); the next pass through the door finishes or undoes it`);
  else if (marker) out.push('- a landing marker is present but unreadable; the next pass through the door will look at it');
  const groups = {};
  for (const d of dirt) {
    const top = d.path.split('/').slice(0, d.path.startsWith('Projects/') || d.path.startsWith('_ops/') ? 2 : 1).join('/');
    (groups[top] = groups[top] || []).push(d);
  }
  out.push(`- unsaved in the main checkout: ${dirt.length} path${dirt.length === 1 ? '' : 's'} in ${Object.keys(groups).length} place${Object.keys(groups).length === 1 ? '' : 's'}`);
  for (const [top, rows] of Object.entries(groups).sort((a, b) => b[1].length - a[1].length)) {
    const times = rows.map((r) => r.mtime).filter((t) => t !== null);
    const span = times.length ? `${ageText(Date.now() - Math.min(...times))} to ${ageText(Date.now() - Math.max(...times))} old` : 'deleted';
    const names = [...new Set(rows.map((r) => who[r.path]).filter(Boolean))];
    out.push(`    ${top}: ${rows.length}, ${span}${names.length ? `, written by session ${names.map((n) => n.slice(0, 8)).join(', ')}` : ''}`);
  }
  if (found.truncated) out.push('    (the writer search stopped at its time limit; some writers may be missing)');
  const mergedClean = wb.trees.filter((t) => t.merged && t.dirty === 0);
  out.push(`- worktrees: ${wb.trees.length}, of which ${mergedClean.length} merged and clean`);
  for (const t of wb.trees.filter((x) => !(x.merged && x.dirty === 0))) {
    const state = t.prunable ? 'its folder is gone (prunable)' : t.dirty < 0 ? 'could not be read' : t.merged ? `merged, ${t.dirty} unsaved` : `holds work not on main${t.dirty ? `, ${t.dirty} unsaved` : ''}`;
    out.push(`    ${t.branch}: ${state} (${t.path})`);
  }
  out.push(`- branches: ${wb.branches} besides main, ${wb.unmerged.length} with work not on main${wb.unmerged.length ? `: ${wb.unmerged.slice(0, 8).join(', ')}` : ''}`);
  if (sessions) out.push('', renderRollCall(sessions).trimEnd());
  process.stdout.write(`${out.join('\n')}\n`);
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('trunk-state.mjs');
if (invokedDirectly) main();
