#!/usr/bin/env node
// trunk-state -- what the trunk looks like right now, read and never touched.
//
//   node _ops/stigmergy/app/scripts/trunk-state.mjs [--since 24h] [--json] [--no-writers]
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
//   - worktrees and local branches: merged and clean, or still holding work.
// Every git call is a read with optional locks off.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { homedir } from 'node:os';

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
  if (!m) return now - 24 * 3600000;
  const n = Number(m[1]);
  return now - n * (m[2] === 'd' ? 86400000 : m[2] === 'h' ? 3600000 : 60000);
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

export function remoteState(owner) {
  const origin = git(owner, ['rev-parse', '-q', '--verify', 'refs/remotes/origin/main']).trim();
  if (!origin) return { ahead: null };
  const ahead = Number(git(owner, ['rev-list', '--count', 'origin/main..main']).trim() || 0);
  const oldest = git(owner, ['log', '--reverse', '--format=%ct', 'origin/main..main']).split('\n').filter(Boolean)[0];
  return { ahead, oldestMs: oldest ? Date.now() - Number(oldest) * 1000 : null };
}

export function earState(owner, common, sinceMs) {
  const lines = readJsonl(join(common, 'palace-ear.jsonl')).filter((l) => Date.parse(l.ts) >= sinceMs && l.ref === 'refs/heads/main');
  const around = lines.filter((l) => l.via !== 'door');
  const hooks = resolve(owner, git(owner, ['rev-parse', '--git-path', 'hooks']).trim() || '.git/hooks');
  return { installed: existsSync(join(hooks, 'reference-transaction')), moves: lines.length, door: lines.length - around.length, around };
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
    if (code[0] === 'R' || code[0] === 'C') i += 1;
    let mtime = null;
    try { mtime = statSync(join(owner, path)).mtimeMs; } catch (_) { /* deleted */ }
    rows.push({ code, path, mtime });
  }
  return rows;
}

// Which session last wrote each path: the newest transcript holding a
// file-writing tool call (Write, Edit, NotebookEdit) on that file's full path.
// A session that only printed the path (a git status, say) does not count.
// A file a script or a steward wrote is not found this way; its folder usually
// says whose it is.
export function writers(owner, paths) {
  const dir = join(homedir(), '.claude', 'projects', owner.replace(/[^A-Za-z0-9]/g, '-'));
  if (!existsSync(dir) || paths.length === 0) return {};
  const files = readdirSync(dir).filter((f) => f.endsWith('.jsonl')).map((f) => ({ f, t: statSync(join(dir, f)).mtimeMs })).sort((a, b) => b.t - a.t);
  const found = {};
  for (const { f } of files) {
    let text;
    try { text = readFileSync(join(dir, f), 'utf8'); } catch (_) { continue; }
    for (const p of paths) {
      if (found[p]) continue;
      const needle = `"file_path":${JSON.stringify(join(owner, p))}`;
      if (text.includes(needle)) found[p] = f.replace(/\.jsonl$/, '');
    }
    if (Object.keys(found).length === paths.length) break;
  }
  return found;
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
    let dirty = 0;
    try { dirty = git(path[1], ['status', '--porcelain']).split('\n').filter(Boolean).length; } catch (_) { dirty = -1; }
    trees.push({ path: path[1], branch: branch ? branch[1] : '(detached)', merged, dirty });
  }
  const branches = git(owner, ['for-each-ref', '--format=%(refname:short)', 'refs/heads']).split('\n').filter((b) => b && b !== 'main');
  const unmerged = branches.filter((b) => !isAncestor(owner, b, 'main'));
  return { trees, branches: branches.length, unmerged };
}

function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes('--json');
  const noWriters = argv.includes('--no-writers');
  const si = argv.indexOf('--since');
  const sinceText = si >= 0 ? argv[si + 1] : '24h';
  const from = process.env.PALACE_ROOT ? resolve(process.env.PALACE_ROOT) : resolve(git(process.cwd(), ['rev-parse', '--show-toplevel'], { allowFail: false }).trim());
  const { owner, common } = locate(from);
  const sinceMs = parseSince(sinceText);

  const remote = remoteState(owner);
  const lastPush = readJsonl(join(common, 'palace-push.jsonl')).at(-1) || null;
  const ear = earState(owner, common, sinceMs);
  const marker = existsSync(join(common, 'palace-land.json')) ? JSON.parse(readFileSync(join(common, 'palace-land.json'), 'utf8')) : null;
  const dirt = unsaved(owner);
  const who = noWriters ? {} : writers(owner, dirt.map((d) => d.path));
  const wb = worktreesAndBranches(owner);

  if (json) {
    process.stdout.write(`${JSON.stringify({ owner, since: new Date(sinceMs).toISOString(), remote, lastPush, ear, marker, unsaved: dirt.map((d) => ({ ...d, writer: who[d.path] || null })), ...wb }, null, 1)}\n`);
    return;
  }

  const out = [];
  out.push(`The trunk, ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`);
  out.push(remote.ahead === null ? '- origin: no tracking ref' : `- main is ${remote.ahead} ahead of origin${remote.ahead ? `, the oldest unsent ${ageText(remote.oldestMs)} old` : ''}`);
  out.push(lastPush ? `- last push: ${lastPush.ts.slice(0, 16).replace('T', ' ')}, ${lastPush.count} commits, ${lastPush.ok ? 'sent' : 'FAILED'}, gate ${lastPush.gate || 'n/a'}` : '- last push: no receipt yet');
  out.push(!ear.installed && ear.moves === 0 ? '- the ear is not installed' : `- the ear, since ${sinceText}: ${ear.moves} move${ear.moves === 1 ? '' : 's'} of main, ${ear.door} through the door, ${ear.around.length} around it${ear.installed ? '' : ' (the ear is not installed now)'}`);
  for (const a of ear.around.slice(0, 10)) out.push(`    around: ${a.ts.slice(11, 16)} ${a.new.slice(0, 8)} by ${a.caller || '?'}${a.session ? ` (session ${a.session.slice(0, 8)})` : ''} in ${a.cwd}`);
  if (marker) out.push(`- a landing died halfway and is not healed yet: ${marker.branch} (${marker.old.slice(0, 8)} to ${marker.new.slice(0, 8)}); the next pass through the door finishes or undoes it`);
  const groups = {};
  for (const d of dirt) {
    const top = d.path.split('/').slice(0, d.path.startsWith('Projects/') || d.path.startsWith('_ops/') ? 2 : 1).join('/');
    (groups[top] = groups[top] || []).push(d);
  }
  out.push(`- unsaved in the main checkout: ${dirt.length} path${dirt.length === 1 ? '' : 's'} in ${Object.keys(groups).length} place${Object.keys(groups).length === 1 ? '' : 's'}`);
  for (const [top, rows] of Object.entries(groups).sort((a, b) => b[1].length - a[1].length)) {
    const newest = Math.max(...rows.map((r) => r.mtime || 0));
    const oldest = Math.min(...rows.map((r) => r.mtime || Date.now()));
    const names = [...new Set(rows.map((r) => who[r.path]).filter(Boolean))];
    out.push(`    ${top}: ${rows.length}, ${ageText(Date.now() - oldest)} to ${ageText(Date.now() - newest)} old${names.length ? `, named in session ${names.map((n) => n.slice(0, 8)).join(', ')}` : ''}`);
  }
  const mergedClean = wb.trees.filter((t) => t.merged && t.dirty === 0);
  out.push(`- worktrees: ${wb.trees.length}, of which ${mergedClean.length} merged and clean`);
  for (const t of wb.trees.filter((x) => !(x.merged && x.dirty === 0))) out.push(`    ${t.branch}: ${t.merged ? 'merged' : 'holds work not on main'}${t.dirty ? `, ${t.dirty} unsaved` : ''} (${t.path})`);
  out.push(`- branches: ${wb.branches} besides main, ${wb.unmerged.length} with work not on main${wb.unmerged.length ? `: ${wb.unmerged.slice(0, 8).join(', ')}` : ''}`);
  process.stdout.write(`${out.join('\n')}\n`);
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('trunk-state.mjs');
if (invokedDirectly) main();
