#!/usr/bin/env node
// list-proposals.mjs — the "list proposals" fast path: what the stewards have
// proposed for canon, waiting on Loudon's review.
//
// No steward writes the house. Each change it wants waits in its own tuning
// ledger as a numbered item, `canon change owed`, until Loudon says yes or no
// ([[Project Stewardship System]] § What's Decided). This lists every owed
// item across the palace, grouped by the page it would change, with the one
// line the deck, the Return and the Weave all say about it
// (orchestrator/src/ledger-review.js). Read-only: it writes nothing.
//
//   node _ops/stigmergy/list-proposals.mjs                  every page with owed proposals
//   node _ops/stigmergy/list-proposals.mjs --page "<title>" one page's card: each item's
//                                                           place as the page reads now, then the words
//   node _ops/stigmergy/list-proposals.mjs --line           the one line, alone
//   node _ops/stigmergy/list-proposals.mjs --json           the same, for a machine
//
// --root <path> reads another checkout; by default it reads the owner, where
// canon is, as list-handoffs does. --full shows a long section whole.

import { resolve } from 'node:path';
import { ownerRoot, C } from './handoff-model.mjs';
import { proposalsByPage, pageReview, reviewCount, reviewLine } from './orchestrator/src/ledger-review.js';

const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);
const opt = (f) => (argv.includes(f) ? argv[argv.indexOf(f) + 1] : undefined);

const root = opt('--root') ? resolve(opt('--root')) : ownerRoot();
const wantPage = opt('--page');
const SHOWN = 24; // lines of a section shown before it is cut, unless --full

const pages = proposalsByPage(root);
const count = reviewCount(root);
const line = reviewLine(count);

if (flag('--line')) { console.log(line); process.exit(0); }

if (flag('--json')) {
  const chosen = wantPage ? pages.filter((g) => g.page.toLowerCase() === wantPage.toLowerCase()) : pages;
  console.log(JSON.stringify({ root, line, count, pages: wantPage ? chosen.map((g) => pageReview(root, g)) : chosen }, null, 2));
  process.exit(0);
}

const quote = (text, pad, max = Infinity) => {
  const all = String(text || '').split('\n');
  const kept = all.slice(0, max).map((l) => `${pad}${C.D}│${C.R} ${l}`);
  if (all.length > max) kept.push(`${pad}${C.D}│ … ${all.length - max} more line${all.length - max === 1 ? '' : 's'} (--full)${C.R}`);
  return kept.join('\n');
};

const head = (g) => `${g.urgent ? `${C.Rd}!${C.R}` : `${C.Y}●${C.R}`} ${C.B}${g.page}${C.R}  ${C.D}[${g.items.length} owed · oldest ${g.oldest} · from ${g.stewards.join(', ')}]${C.R}`;
const where = (g) => (g.path ? `${C.D}${g.path}${g.exists ? '' : ' (a new page)'}${C.R}` : `${C.D}a new page, no path yet${C.R}`);

if (!wantPage) {
  console.log(`${C.B}PROPOSALS FOR CANON${C.R} — ${line}\n`);
  for (const g of pages) {
    console.log(head(g));
    console.log(`    ${where(g)}`);
    for (const p of g.items) {
      console.log(`    ${C.B}${p.n}.${C.R} ${p.place || '—'}${p.urgent ? `  ${C.Rd}urgent${C.R}` : ''}  ${C.D}${p.date} · ${p.steward}'s ledger${C.R}`);
      console.log(`       ${C.D}why: ${p.why}${C.R}`);
    }
    console.log('');
  }
  if (pages.length) console.log(`${C.D}a page's card → list-proposals.mjs --page "<title>"${C.R}`);
  process.exit(0);
}

const g = pages.find((x) => x.page.toLowerCase() === wantPage.toLowerCase());
if (!g) { console.log(`${C.B}${wantPage}${C.R} — no proposals for canon owed. ${C.D}(${line})${C.R}`); process.exit(0); }

const r = pageReview(root, g);
console.log(head(r));
console.log(`  ${where(r)}\n`);
for (const p of r.items) {
  console.log(`${C.B}${p.n}.${C.R} ${p.place || '—'}${p.urgent ? `  ${C.Rd}urgent${p.ask ? `, asked as ${p.ask}` : ''}${C.R}` : ''}`);
  console.log(`   ${C.D}${p.date} · ${p.by || 'proposed'} · ${p.ledger}, item ${p.n}${C.R}`);
  console.log(`   why: ${p.why}`);
  if (p.now) {
    const label = p.now.kind === 'frontmatter' ? 'the frontmatter now' : `the page now, § ${p.now.heading} (lines ${p.now.line}–${p.now.end})`;
    console.log(`\n   ${C.D}${label}:${C.R}`);
    console.log(quote(p.now.text || '(empty)', '   ', flag('--full') ? Infinity : SHOWN));
  } else {
    console.log(`\n   ${C.D}${!r.exists ? 'the page does not exist yet' : r.readable ? 'the page has no place by that name; read it whole' : 'the page could not be read'}${C.R}`);
  }
  console.log(`\n   ${C.D}proposed:${C.R}`);
  console.log(quote(p.words, '   '));
  console.log('');
}
