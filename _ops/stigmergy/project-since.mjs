#!/usr/bin/env node
// project-since.mjs — what has moved on a project since a point. Run it before
// a status claim.
//
// "Still waiting", "nothing has moved", "the move is still open" are claims
// about a whole project, not about the files a session was about to edit. On
// 2026-11-07 a session called BLUELINE "still waiting" after checking only its
// own files; two steward cycles had built the waited-for thing two days before
// ([[Two Batons, One Board]]). This prints every commit on the project since a
// point — its entry, its bundle, and its steward's runtime — and the project's
// open and claimed batons. Read-only: it writes nothing and posts nothing.
//
// Usage:
//   node _ops/stigmergy/project-since.mjs "<entry>"                       since its oldest active baton card was posted, else 14 days
//   node _ops/stigmergy/project-since.mjs "<entry>" --since 2026-11-04    a date or ISO time
//   node _ops/stigmergy/project-since.mjs "<entry>" --since b3ad6656      a commit (exclusive)
//   node _ops/stigmergy/project-since.mjs "<entry>" --since <handoff-id>  since that baton was born
//   --root <path>   the checkout to read (default: the owner, where canon is)
//   --board <path>  board override (default: the owner's persistent board)
//   --json          the same, for a machine

import { resolve } from 'node:path';
import { ownerRoot, boardPath, loadBoard, foldHandoffs, age, C } from './handoff-model.mjs';
import { projectSince, activeCardsFor, cardSince } from './steward-watch.mjs';

const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--json') { flags.json = true; continue; }
  if (a.startsWith('--')) { flags[a.slice(2)] = argv[++i]; continue; }
  positional.push(a);
}
const entry = positional[0];
if (!entry) {
  console.error(`${C.Rd}✗ usage: node _ops/stigmergy/project-since.mjs "<entry>" [--since <date | commit | handoff-id>]${C.R}`);
  process.exit(1);
}

const ROOT = flags.root ? resolve(flags.root) : ownerRoot();
let board = [];
try { board = loadBoard(boardPath(flags.board)); } catch { board = []; }
const cards = activeCardsFor(board, entry);

// Where "since" starts, and why — said in the output, so the claim names its window.
let since = flags.since || null;
let why = since ? 'as asked' : null;
if (since) {
  const byId = foldHandoffs(board).all.find((c) => c.m.id === since);
  if (byId) { const s = cardSince(ROOT, byId); since = s.since; why = s.from === 'baton' ? `baton ${byId.m.id} was born` : `card ${byId.m.id} was posted`; }
} else if (cards.length) {
  // The card's post, not the baton file's born date: a baton updated in place
  // at each partial close was brought up to date then, so the card's time is
  // the last point someone read the project whole. --since <handoff-id> reaches back to born.
  const c = [...cards].sort((a, b) => Date.parse(a.m.ts) - Date.parse(b.m.ts))[0];
  since = c.m.ts; why = `its active baton card was posted (${c.m.id})`;
} else {
  since = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10); why = 'the last 14 days; it has no active baton';
}

const r = projectSince(ROOT, entry, since);
if (r.error) { console.error(`${C.Rd}✗ ${r.error}${C.R}`); process.exit(1); }

if (flags.json) {
  console.log(JSON.stringify({ entry, since, why, root: ROOT, paths: r.paths, steward: r.steward, commits: r.commits,
    batons: cards.map((c) => ({ id: c.m.id, state: c.state, ts: c.m.ts, move: c.p.move })) }, null, 2));
  process.exit(0);
}

console.log(`${C.B}${entry}${C.R} since ${since} ${C.D}(${why})${C.R}`);
console.log(`${C.D}  read: ${r.paths.join(' · ')}${C.R}`);
if (r.commits.length) {
  console.log(`${C.Y}${r.commits.length} commit${r.commits.length === 1 ? '' : 's'} on the project:${C.R}`);
  for (const c of r.commits.slice(0, 20)) console.log(`  ${C.D}${c.hash} ${c.date}${C.R} ${c.subject.slice(0, 120)}`);
  if (r.commits.length > 20) console.log(`  ${C.D}… and ${r.commits.length - 20} more${C.R}`);
} else {
  console.log(`${C.G}no commits on the project since ${since}.${C.R}`);
}
if (r.steward) {
  const cycles = r.commits.filter((c) => c.subject.startsWith('steward('));
  console.log(`${C.Y}steward:${C.R} ${r.steward.agent_id} (${r.steward.dir}) — ${cycles.length} steward commit${cycles.length === 1 ? '' : 's'} in this window`);
}
for (const c of cards) {
  console.log(`${c.state === 'claimed' ? `${C.Y}◐ claimed` : `${C.G}● open`}${C.R} baton ${C.D}${c.m.id} [${age(c.m.ts)}]${C.R}  ${(c.p.move || '').slice(0, 100)}`);
}
console.log(`${C.D}→ a status claim ("still waiting", "nothing has moved") is about this list, not only the files you were about to edit.${C.R}`);
