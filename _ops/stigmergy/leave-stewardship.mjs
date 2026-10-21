#!/usr/bin/env node
// leave-stewardship.mjs — a project leaves stewardship (Loudon, 2026-10-21).
//
// A steward leaves when its page ends — finished, archived or composting —
// and never decides the end; a resting (dormant) page keeps its steward. This
// reads what still stands in the way (open asks, owed proposals for canon, a
// Plan with no closing paragraph) and, with --apply on Loudon's word, retires
// the steward: the Plan closed and logged, the scroll's last trail entry, the
// steward off the registry and its runtime folder deleted (git keeps it).
// Canon: [[Project Stewardship System]]; code: orchestrator/src/leave.js.
//
//   node _ops/stigmergy/leave-stewardship.mjs "<page>"                  what stands in the way (writes nothing)
//   node _ops/stigmergy/leave-stewardship.mjs "<page>" --apply --why "finished" [--plan "<closing paragraph>"]
//
// It writes the checkout you run it from (--root to name another) and reads the
// owner's board, the single one. It never commits: it prints the committer
// line naming every path it changed.

import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { boardPath, loadBoard, C } from './handoff-model.mjs';
import { leavingCheck, leaveStewardship } from './orchestrator/src/leave.js';

const argv = process.argv.slice(2);
const opt = (f) => (argv.includes(f) ? argv[argv.indexOf(f) + 1] : undefined);
const valued = new Set(['--root', '--why', '--plan', '--board']);
const home = argv.find((a, i) => !a.startsWith('--') && !valued.has(argv[i - 1]));
if (!home) {
  process.stderr.write('usage: node _ops/stigmergy/leave-stewardship.mjs "<page>" [--apply --why "<the end, in a few words>"] [--plan "<closing paragraph>"] [--root <checkout>]\n');
  process.exit(2);
}

const here = () => { try { return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim(); } catch { return process.cwd(); } };
const root = opt('--root') ? resolve(opt('--root')) : here();
const board = loadBoard(boardPath(opt('--board')));
const planClose = opt('--plan') || '';

const check = leavingCheck({ palaceRoot: root, home, board, planClose });
const yes = (b) => (b ? `${C.G}yes${C.R}` : `${C.D}no${C.R}`);
console.log(`${C.B}LEAVING STEWARDSHIP${C.R} — ${home}  ${C.D}(${root})${C.R}\n`);
if (check.page) console.log(`  page      ${check.page.path}  ${C.D}status ${check.page.status || '—'} · stage ${check.page.stage || '—'}${C.R}`);
console.log(`  ended     ${check.ended ? `${C.G}${check.ended.sentence}${C.R}` : `${C.Y}not ended${C.R}`}`);
console.log(`  steward   registered ${yes(check.steward.registered)} · runtime ${check.steward.dir || '—'} ${check.steward.exists ? '' : `${C.D}(no folder)${C.R}`}`);
console.log(`  asks      ${check.asks.length ? check.asks.map((a) => `${a.request_id}${a.blocking ? ' (blocking)' : ''}`).join(', ') : `${C.D}none open${C.R}`}`);
console.log(`  proposals ${check.proposals.length ? check.proposals.map((p) => `item ${p.n}`).join(', ') : `${C.D}none owed${C.R}`}`);
console.log(`  scroll    ${check.scroll.exists ? `${check.scroll.path}${check.scroll.plan ? ' · has a Plan' : ''}` : `${C.D}none${C.R}`}\n`);

if (check.blockers.length) {
  console.log(`${C.Y}Not yet:${C.R}`);
  for (const b of check.blockers) console.log(`  - ${b}`);
  process.exit(argv.includes('--apply') ? 1 : 0);
}

if (!argv.includes('--apply')) {
  console.log(`${C.G}Nothing stands in the way.${C.R} On Loudon's word: --apply --why "<the end, in a few words>"`);
  process.exit(0);
}

const r = leaveStewardship({ palaceRoot: root, home, board, why: opt('--why') || '', planClose });
if (!r.left) { for (const b of r.check.blockers) console.log(`  - ${b}`); process.exit(1); }
console.log(`${C.G}${home} has left stewardship.${C.R} Changed:`);
for (const p of r.changed) console.log(`  ${p}`);
const paths = r.changed.map((p) => `--path "${p}"`).join(' ');
console.log(`\n${C.D}commit → node "<owner>/_ops/stigmergy/app/scripts/palace-commit.mjs" --kind ops --scope "${home}" --summary "leaves stewardship: ..." --verify <...> ${paths}${C.R}`);
