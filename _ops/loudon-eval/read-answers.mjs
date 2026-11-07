#!/usr/bin/env node
// _ops/loudon-eval/read-answers.mjs — read Loudon's answers back off the STIGMERGY board.
//
//   node _ops/loudon-eval/read-answers.mjs --page "The Lens"            the latest answers on that page
//   node _ops/loudon-eval/read-answers.mjs --page "The Lens" --all      every one, oldest first
//   node _ops/loudon-eval/read-answers.mjs --task woken-glasses         match the task instead (or as well)
//   node _ops/loudon-eval/read-answers.mjs                              the ten latest, any page
//   [--since 2h | 3d | 2026-11-07T12:00Z]  [--json]  [--board <path>]
//
// It reads the board file itself, not the app, so it works with STIGMERGY stopped. The board is
// the main checkout's (every worktree appends there, SCHEMA — Reference §9), so from a worktree
// it finds the owner by git's common dir. It reads every human_eval: the answers server's, the
// rich face dock's and the June rating sheets'. Pages match without regard to case, as the
// QUEUE matches them.

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = (n) => argv.includes('--' + n);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : undefined; };

function ownerRoot() {
  const here = resolve(HERE, '../..');
  try {
    const common = execFileSync('git', ['-C', here, 'rev-parse', '--path-format=absolute', '--git-common-dir'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).trim();
    return dirname(common);
  } catch { return here; }
}

export function parseSince(s, now = Date.now()) {
  if (!s) return null;
  const m = /^(\d+(?:\.\d+)?)\s*([mhdw])$/.exec(s);
  if (m) return now - Number(m[1]) * { m: 6e4, h: 36e5, d: 864e5, w: 6048e5 }[m[2]];
  const t = Date.parse(s);
  if (Number.isNaN(t)) throw new Error(`--since: "${s}" is neither 2h / 3d nor a date`);
  return t;
}

// The page a human_eval is about: payload.entry, else the rich face's task `rich-face:<page>:round-<n>`.
export function pageOf(p) {
  if (typeof p?.entry === 'string' && p.entry.trim()) return p.entry.trim();
  const m = typeof p?.task === 'string' ? p.task.match(/^rich-face:(.+):round-\d+$/) : null;
  return m ? m[1] : null;
}

export function readAnswers(text, { page, task, since } = {}) {
  const out = [];
  for (const line of text.split('\n')) {
    if (!line.includes('human_eval')) continue;
    let m; try { m = JSON.parse(line); } catch { continue; }
    const p = m?.payload;
    if (p?.kind !== 'human_eval') continue;
    if (page && (pageOf(p) || '').toLowerCase() !== page.toLowerCase()) continue;
    if (task && p.task !== task) continue;
    if (since != null && !(Date.parse(m.ts) >= since)) continue;
    out.push(m);
  }
  return out.sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts));
}

function show(m) {
  const p = m.payload;
  const lines = [`── ${m.ts}  ${pageOf(p) ?? '(no page)'}${p.task ? '  · ' + p.task : ''}  · ${m.id}`];
  if (p.url) lines.push(`   from ${p.url}`);
  const body = p.summary || p.overall?.note;
  if (body) lines.push(body.replace(/\s+$/, ''));
  if (p.answers !== undefined) lines.push('answers: ' + JSON.stringify(p.answers, null, 2));
  else if (p.groups && Object.keys(p.groups).length) lines.push('groups: ' + JSON.stringify(p.groups, null, 2));
  return lines.join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const board = resolve(opt('board') ?? join(ownerRoot(), '_ops/swarm/persistent/blackboard.jsonl'));
  if (!existsSync(board)) { console.error(`no board at ${board}`); process.exit(2); }
  let since;
  try { since = parseSince(opt('since')); } catch (e) { console.error(e.message); process.exit(2); }
  const page = opt('page'), task = opt('task');
  let found = readAnswers(readFileSync(board, 'utf8'), { page, task, since });
  if (!flag('all')) found = page || task ? found.slice(-1) : found.slice(-10);
  if (flag('json')) { console.log(JSON.stringify(found, null, 2)); process.exit(found.length ? 0 : 1); }
  if (!found.length) {
    console.log(`no answers yet${page ? ` for "${page}"` : ''}${task ? ` (task ${task})` : ''}${since != null ? ' in that window' : ''} — board: ${board}`);
    process.exit(1);
  }
  console.log(found.map(show).join('\n\n'));
}
