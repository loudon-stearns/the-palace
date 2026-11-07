#!/usr/bin/env node
// drift-check.mjs — does STIGMERGY.md still describe the terminal it names?
//
// The page fell five months behind its own code once (relaid 2026-11-05): it
// counted a board a third the size, called finished work in progress, and claimed
// a reconciliation the deck had switched off. Nothing noticed. This reads the
// page beside the code and says where they part. It writes nothing and never
// blocks: the Weave runs it in its Substrate sweep and the findings are judgment
// (Loudon, 2026-11-07, in place of a steward for STIGMERGY).
//
//   node _ops/stigmergy/drift-check.mjs            the report
//   node _ops/stigmergy/drift-check.mjs --json     machine output
//   node _ops/stigmergy/drift-check.mjs --root <palace> [--board <jsonl>]
//
// The checks, each a pair the page or a rule says should agree:
//   decks      app/src/lib/decks.js DECKS          ↔ STIGMERGY.md § The decks
//   types      core/schema/validator.js VALID_TYPES ↔ § The coordination schema, SCHEMA — Reference §9
//   lanes      app/server/*-lane.js + scheduler.js ↔ § The lanes
//   tokens     design-system/colors_and_type.css   ↔ app/src/styles/tokens.css (kit tokens the app lacks)
//   readme     app/README.md's directory map names ↔ the files under app/src/components
//   handoffs   cards naming a worktree that is gone; claims older than 14 days with no close
//   tuning     app commits since STIGMERGY — tuning's newest run line

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { foldHandoffs, loadBoard, worktreeLive } from './handoff-model.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const ROOT = resolve(arg('--root') || join(HERE, '../..'));
const BOARD = arg('--board') || join(ROOT, '_ops/swarm/persistent/blackboard.jsonl');
const JSON_OUT = argv.includes('--json');
const CLAIM_DAYS = 14;

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const findings = [];
const F = (check, what, where) => findings.push({ check, what, where });

// The text under one `## ` heading of the page, up to the next.
function section(md, heading) {
  const i = md.indexOf(`\n## ${heading}\n`);
  if (i < 0) return null;
  const rest = md.slice(i + heading.length + 5);
  const j = rest.search(/\n## /);
  return j < 0 ? rest : rest.slice(0, j);
}

const page = read('STIGMERGY.md');

// decks
{
  const src = read('_ops/stigmergy/app/src/lib/decks.js');
  const m = src.match(/export const DECKS = \[([^\]]*)\]/);
  const decks = m ? [...m[1].matchAll(/'([A-Z]+)'/g)].map((x) => x[1]) : [];
  const sec = section(page, 'The decks');
  if (!sec) F('decks', 'STIGMERGY.md has no § The decks', 'STIGMERGY.md');
  else {
    const named = [...sec.matchAll(/^- \*\*([A-Z]+)\*\*/gm)].map((x) => x[1]);
    for (const d of decks) if (!named.includes(d)) F('decks', `the app has a ${d} deck the page does not describe`, '_ops/stigmergy/app/src/lib/decks.js');
    for (const d of named) if (!decks.includes(d)) F('decks', `the page describes a ${d} deck the app does not have`, 'STIGMERGY.md § The decks');
  }
}

// types
{
  const src = read('_ops/stigmergy/core/schema/validator.js');
  const m = src.match(/VALID_TYPES = new Set\(\[([\s\S]*?)\]\)/);
  const types = m ? [...m[1].matchAll(/'([A-Z_]+)'/g)].map((x) => x[1]) : [];
  const sec = section(page, 'The coordination schema') || '';
  const said = new Set([...sec.matchAll(/`([A-Z_]+)`(?:\/`?([A-Z_]+)`?)?/g)].flatMap((x) => [x[1], x[2]]).filter(Boolean));
  // the page writes pairs short: `RESOURCE_GRANT`/`DENY`, `SESSION_INIT`/`CLOSE`
  for (const t of [...said]) if (t === 'DENY') said.add('RESOURCE_DENY'); else if (t === 'CLOSE') said.add('SESSION_CLOSE');
  for (const t of types) if (!said.has(t)) F('types', `the validator accepts ${t}; the page's list of message types leaves it out`, 'STIGMERGY.md § The coordination schema');
  const ref = existsSync(join(ROOT, 'SCHEMA — Reference.md')) ? read('SCHEMA — Reference.md') : '';
  const s9 = ref.slice(ref.indexOf('## 9.'));
  for (const t of types) if (!s9.includes('`' + t)) F('types', `the validator accepts ${t}; SCHEMA — Reference §9 does not name it`, 'SCHEMA — Reference.md §9');
}

// lanes
{
  const server = join(ROOT, '_ops/stigmergy/app/server');
  const files = existsSync(server) ? readdirSync(server) : [];
  const lanes = files.filter((f) => /-lane\.js$/.test(f)).map((f) => f.replace(/-lane\.js$/, ''));
  if (files.includes('scheduler.js')) lanes.push('schedule');
  const sec = (section(page, 'The lanes') || '').toLowerCase();
  const named = [...sec.matchAll(/^- \*\*([a-z]+)\*\*/gm)].map((x) => x[1]);
  for (const l of lanes) if (!named.includes(l)) F('lanes', `the server runs a ${l} lane the page does not describe`, `_ops/stigmergy/app/server/`);
  for (const l of named) if (!lanes.includes(l)) F('lanes', `the page describes a ${l} lane the server does not have`, 'STIGMERGY.md § The lanes');
}

// tokens
{
  const props = (p) => new Set([...read(p).matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((x) => x[1]));
  const kit = props('_ops/stigmergy/design-system/colors_and_type.css');
  const app = props('_ops/stigmergy/app/src/styles/tokens.css');
  for (const t of kit) if (!app.has(t)) F('tokens', `the kit defines ${t}; the app's tokens.css does not mirror it`, '_ops/stigmergy/app/src/styles/tokens.css');
}

// readme
{
  const md = read('_ops/stigmergy/app/README.md');
  const i = md.indexOf('## Directory map');
  const block = i < 0 ? '' : md.slice(i, md.indexOf('```', md.indexOf('```', i) + 3));
  const line = block.split('\n').find((l) => l.includes('components/')) || '';
  const names = [...line.matchAll(/\b([A-Z][A-Za-z]+)\b/g)].map((x) => x[1]);
  const comps = join(ROOT, '_ops/stigmergy/app/src/components');
  const have = new Set(existsSync(comps) ? readdirSync(comps).map((f) => f.replace(/\.jsx?$/, '')) : []);
  for (const n of names) if (!have.has(n)) F('readme', `the README's directory map names ${n}, which src/components does not hold`, '_ops/stigmergy/app/README.md § Directory map');
}

// handoffs
{
  let fold = null;
  try { fold = foldHandoffs(loadBoard(BOARD)); } catch (e) { F('handoffs', `cannot read the board: ${e.message}`, BOARD); }
  if (fold) {
    const now = Date.now();
    for (const c of [...fold.open, ...fold.claimed]) {
      const wt = c.p.worktree;
      if (wt && wt.dir && !worktreeLive(wt, ROOT)) F('handoffs', `${c.m.id} (${c.p.entry}) names worktree ${wt.branch || wt.dir}, which is gone`, 'the board');
    }
    for (const c of fold.claimed) {
      const days = (now - Date.parse(c.claim.ts)) / 864e5;
      if (days > CLAIM_DAYS) F('handoffs', `${c.m.id} (${c.p.entry}) claimed ${Math.floor(days)} days ago with no close`, 'the board');
    }
  }
}

// tuning
{
  const t = read('STIGMERGY/STIGMERGY — tuning.md');
  const dates = [...t.matchAll(/^- run · (\d{4}-\d{2}-\d{2})/gm)].map((x) => x[1]).sort();
  const last = dates.at(-1) || '2026-10-21';
  let n = 0;
  try {
    n = execFileSync('git', ['-C', ROOT, 'log', '--no-merges', '--oneline', `--since=${last}T23:59:59`, '--', '_ops/stigmergy/app'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n').filter(Boolean).length;
  } catch { /* not a git checkout */ }
  if (n) F('tuning', `${n} commit(s) changed the app after the ledger's newest run line (${last})`, 'STIGMERGY/STIGMERGY — tuning.md');
}

if (JSON_OUT) { console.log(JSON.stringify({ root: ROOT, findings }, null, 2)); process.exit(0); }
const checks = ['decks', 'types', 'lanes', 'tokens', 'readme', 'handoffs', 'tuning'];
console.log(`STIGMERGY drift check — ${findings.length ? `${findings.length} finding(s)` : 'the page and the terminal agree'}\n`);
for (const c of checks) {
  const fs = findings.filter((f) => f.check === c);
  console.log(`${fs.length ? '!' : '✓'} ${c.padEnd(9)} ${fs.length ? '' : 'level'}`);
  for (const f of fs) console.log(`    ${f.what}  — ${f.where}`);
}
