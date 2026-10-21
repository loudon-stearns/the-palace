#!/usr/bin/env node
// settle-proposal.mjs — the ledger review's last step: a steward's proposal for
// canon, settled in its own tuning ledger once Loudon has said yes or no.
//
// The review goes page by page (list-proposals.mjs --page). Loudon says yes,
// adjust or no to each item; an elder places the yeses in one edit per page and
// commits it; then each yes is paid with that commit, and each no declined
// with his one line. The steward reads either once, on its next run
// (Loudon, 2026-10-21; [[Project Stewardship System]]).
//
//   node _ops/stigmergy/settle-proposal.mjs "<steward>" <n> --paid <commit>
//   node _ops/stigmergy/settle-proposal.mjs "<steward>" <n> --declined "<his one line>"
//   node _ops/stigmergy/settle-proposal.mjs --from-board
//       declines every urgent proposal Loudon declined on the deck, with his
//       note; a LAND-NOW waits for the elder who lands it to pay it.
//
// A pay must cite the commit that landed the words: the commit has to exist
// and change the page the proposal names. It writes the checkout you run it
// from (--root to name another), reads the owner's board, and never commits:
// it prints the committer line for the ledgers it changed.

import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { boardPath, loadBoard, C } from './handoff-model.mjs';
import { tuningPathFor, parseProposals, payProposal, declineProposal, listOwedProposals } from './orchestrator/src/ledger.js';
import { urgentAnswer } from './orchestrator/src/ledger-review.js';
import { readFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const opt = (f) => (argv.includes(f) ? argv[argv.indexOf(f) + 1] : undefined);
const valued = new Set(['--root', '--paid', '--declined', '--board']);
const bare = argv.filter((a, i) => !a.startsWith('--') && !valued.has(argv[i - 1]));
const git = (root, args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const here = () => { try { return git(process.cwd(), ['rev-parse', '--show-toplevel']); } catch { return process.cwd(); } };
const root = opt('--root') ? resolve(opt('--root')) : here();
const rel = (abs) => abs.slice(root.length + 1);
const commitLine = (scope, ledgers) => `node "<owner>/_ops/stigmergy/app/scripts/palace-commit.mjs" --kind ops --scope "${scope}" --summary "..." --verify <...> ${ledgers.map((l) => `--path "${l}"`).join(' ')}`;
const die = (msg) => { console.error(`${C.Rd}settle-proposal:${C.R} ${msg}`); process.exit(1); };

if (argv.includes('--from-board')) {
  const board = loadBoard(boardPath(opt('--board')));
  const touched = new Set();
  let n = 0;
  for (const p of listOwedProposals(root)) {
    const a = urgentAnswer(p, board);
    if (!a) continue;
    if (a.option !== 'DECLINE') { console.log(`${C.D}${p.steward} item ${p.n}: you said ${a.option}; it waits for the review${a.option === 'LAND-NOW' ? ', first' : ''}.${C.R}`); continue; }
    const at = a.ts ? new Date(a.ts) : new Date();
    if (declineProposal(join(root, p.ledger), p.n, a.notes || 'declined on the deck', { at })) {
      n += 1; touched.add(p.ledger);
      console.log(`${C.G}declined${C.R} ${p.steward} item ${p.n}: ${a.notes || 'declined on the deck'}`);
    }
  }
  if (!n) { console.log('Nothing declined on the deck is still owed.'); process.exit(0); }
  console.log(`\n${C.D}commit → ${commitLine('Project Stewardship System', [...touched])}${C.R}`);
  process.exit(0);
}

const [steward, n] = bare;
if (!steward || !n || (!opt('--paid') && !opt('--declined'))) {
  process.stderr.write('usage: settle-proposal.mjs "<steward>" <n> --paid <commit> | --declined "<one line>"  ·  settle-proposal.mjs --from-board\n');
  process.exit(2);
}
const ledger = tuningPathFor(root, steward);
if (!ledger) die(`${steward} keeps no tuning ledger in ${root}.`);
const item = parseProposals(readFileSync(ledger, 'utf8')).find((p) => String(p.n) === String(n));
if (!item) die(`${steward}'s ledger has no proposal numbered ${n}.`);
if (!item.owed) die(`${steward} item ${n} is already settled: ${item.status}.`);

if (opt('--paid')) {
  let full;
  try { full = git(root, ['rev-parse', '--verify', `${opt('--paid')}^{commit}`]); } catch { die(`no commit ${opt('--paid')} in ${root}.`); }
  if (item.path) {
    const files = git(root, ['-c', 'core.quotepath=off', 'show', '--name-only', '--format=', full]).split('\n');
    if (!files.includes(item.path)) die(`commit ${full.slice(0, 8)} does not change ${item.path}, the page item ${n} names. Pay it with the commit that landed its words.`);
  }
  payProposal(ledger, n, full.slice(0, 8));
  console.log(`${C.G}paid${C.R} ${steward} item ${n} in ${full.slice(0, 8)}`);
} else {
  const reason = String(opt('--declined') || '').trim();
  if (!reason) die('a decline carries his one line of why.');
  declineProposal(ledger, n, reason);
  console.log(`${C.G}declined${C.R} ${steward} item ${n}: ${reason}`);
}
console.log(`\n${C.D}commit → ${commitLine(steward, [rel(ledger)])}${C.R}`);
