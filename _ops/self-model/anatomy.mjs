#!/usr/bin/env node
// anatomy.mjs — the check and the measure behind SUBSTRATE's anatomy diagram.
//
// SUBSTRATE/SUBSTRATE — anatomy.json is the palace's anatomy as data, written by
// hand at a Self-Model Update: its organs, the systems they sit in, how they
// couple, and what each is called under four lenses. This script keeps that
// hand-written file honest against the palace as it is, and measures what a
// hand should not write: how much each organ weighs.
//
//   node _ops/self-model/anatomy.mjs            check, and print the weights
//   node _ops/self-model/anatomy.mjs --write    check, then write the measure
//                                               (SUBSTRATE/SUBSTRATE — anatomy — measured.json)
//   --root <palace>   another checkout (default: the one this file sits in)
//   --json            the report as JSON
//
// The check fails (exit 1) when an organ's home is gone, a member names no
// entry, a coupling names no organ, or a ceremony (an entry carrying
// `trigger:`) belongs to no organ — the palace grew an organ the anatomy
// does not show. Meta entries no organ claims are listed, not failed: many
// meta pages are notes, not organs, and only a reading decides which.
//
// Weight is measured from frontmatter and git, never written by hand:
//   inbound  typed links into the organ's members, read live from frontmatter
//            (not from the Palace Map, which is as old as its last build)
//   use      the members' recent use from _ops/swarm/entry-use.py (30 days)
//   weight   inbound + 2 × use — the diagram sizes an organ by its square root

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
const ROOT = opt('--root', join(dirname(fileURLToPath(import.meta.url)), '..', '..'));
const ANATOMY = join(ROOT, 'SUBSTRATE', 'SUBSTRATE — anatomy.json');
const MEASURED = join(ROOT, 'SUBSTRATE', 'SUBSTRATE — anatomy — measured.json');
const USE_WINDOW = 30;

const git = (...a) => execFileSync('git', ['-C', ROOT, '-c', 'core.quotepath=off', ...a], { encoding: 'utf8', maxBuffer: 64 << 20 });

// ---- every entry: title, path, type, trigger, outbound typed targets ----
function frontmatter(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  return end < 0 ? null : text.slice(3, end);
}
const entries = new Map(); // title → { path, type, trigger, targets[] }
for (const path of git('ls-files', '-z', '--', '*.md').split('\0').filter(Boolean)) {
  if (/(^|\/)(node_modules|_tools|\.venvs)\//.test(path)) continue;
  let text; try { text = readFileSync(join(ROOT, path), 'utf8'); } catch { continue; }
  const fm = frontmatter(text); if (!fm) continue;
  const type = (fm.match(/^type:\s*["']?([\w-]+)/m) || [])[1];
  if (!type) continue; // a bundle file or a learning material, not an entry
  const title = ((fm.match(/^title:\s*["']?(.+?)["']?\s*$/m) || [])[1]) || basename(path, '.md');
  const targets = [...fm.matchAll(/^\s*-?\s*target:\s*["']?\[\[([^\]|#]+)/gm)].map((m) => m[1].trim());
  const entry = { path, title, type, trigger: /^trigger:/m.test(fm), targets };
  entries.set(title, entry);
  // a [[wikilink]] resolves by filename, so a page whose title strays from its
  // filename (SCHEMA — Reference §3 says it should not) is found by either
  const file = basename(path, '.md');
  if (file !== title && !entries.has(file)) entries.set(file, entry);
}
const inbound = new Map();
const unique = [...new Set(entries.values())];
for (const e of unique) for (const t of new Set(e.targets)) if (t !== e.title && t !== basename(e.path, '.md')) inbound.set(t, (inbound.get(t) || 0) + 1);
const inboundOf = (e) => (inbound.get(e.title) || 0) + (basename(e.path, '.md') !== e.title ? inbound.get(basename(e.path, '.md')) || 0 : 0);
const useOf = (e) => (use[e.title]?.recent?.use ?? use[basename(e.path, '.md')]?.recent?.use ?? 0);

// ---- recent use, from git ----
let use = {};
try {
  const out = execFileSync('python3', [join(ROOT, '_ops/swarm/entry-use.py'), '--root', ROOT, '--json', '-', '--window', String(USE_WINDOW)],
    { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] });
  use = JSON.parse(out).entries || {};
} catch { /* no use figures: weight falls back to inbound alone, and the report says so */ }

// ---- the anatomy, checked ----
const anatomy = JSON.parse(readFileSync(ANATOMY, 'utf8'));
const problems = [];
const organIds = new Set(anatomy.organs.map((o) => o.id));
const systemIds = new Set(anatomy.systems.map((s) => s.id));
const lensIds = anatomy.lenses.map((l) => l.id);
const claimed = new Set();

for (const o of anatomy.organs) {
  if (!systemIds.has(o.system)) problems.push(`organ "${o.id}": system "${o.system}" is not in systems`);
  if (!o.home || !existsSync(join(ROOT, o.home))) problems.push(`organ "${o.id}": home "${o.home}" does not exist`);
  for (const m of o.members || []) {
    if (!entries.has(m)) problems.push(`organ "${o.id}": member "${m}" names no entry`);
    else claimed.add(entries.get(m));
  }
  for (const l of lensIds) if (!o.lenses?.[l]?.name) problems.push(`organ "${o.id}": no ${l} name`);
}
for (const c of anatomy.couplings) {
  for (const end of [c.from, c.to]) if (!organIds.has(end)) problems.push(`coupling ${c.from} → ${c.to}: "${end}" is no organ`);
}
const unclaimedCeremonies = unique.filter((e) => e.trigger && !claimed.has(e)).map((e) => e.title).sort();
for (const t of unclaimedCeremonies) problems.push(`ceremony "${t}" belongs to no organ`);
const unclaimedMeta = unique.filter((e) => e.type === 'meta' && !claimed.has(e)).map((e) => e.title).sort();

// ---- the measure ----
const degree = new Map();
for (const c of anatomy.couplings) for (const end of [c.from, c.to]) degree.set(end, (degree.get(end) || 0) + 1);
const organs = {};
for (const o of anatomy.organs) {
  const members = [...new Set((o.members || []).filter((m) => entries.has(m)).map((m) => entries.get(m)))];
  const inb = members.reduce((s, e) => s + inboundOf(e), 0);
  const u = members.reduce((s, e) => s + useOf(e), 0);
  organs[o.id] = { inbound: inb, use: u, weight: inb + 2 * u, couplings: degree.get(o.id) || 0, members: members.length };
}
const measured = {
  title: 'SUBSTRATE — anatomy — measured',
  born: '2026-10-22',
  links: [{ target: '[[SUBSTRATE]]', type: 'connects-to', label: 'anatomy-measure-of' }],
  forward_vector: 'I am the machine-owned half of the anatomy: how much each organ weighs, measured from frontmatter and git by _ops/self-model/anatomy.mjs. Never edit me by hand; rerun the script.',
  generated: new Date().toLocaleDateString('en-CA'), // the local day, as git's dates are read here
  head: git('rev-parse', '--short', 'HEAD').trim(),
  entries: unique.length,
  use_window_days: Object.keys(use).length ? USE_WINDOW : null,
  organs,
};

const report = { ok: problems.length === 0, problems, unclaimed_meta: unclaimedMeta, measured };
if (flag('--json')) console.log(JSON.stringify(report, null, 1));
else {
  console.log(`anatomy: ${anatomy.organs.length} organs · ${anatomy.systems.length} systems · ${anatomy.couplings.length} couplings · against ${unique.length} entries at ${measured.head}`);
  if (!measured.use_window_days) console.log('  ! entry-use.py gave nothing: weights are inbound links alone');
  const rows = Object.entries(organs).sort((a, b) => b[1].weight - a[1].weight);
  for (const [id, m] of rows) console.log(`  ${String(m.weight).padStart(4)}  ${id.padEnd(24)} in ${m.inbound} · use ${m.use} · couplings ${m.couplings}`);
  if (problems.length) { console.log(`\n${problems.length} problem(s):`); for (const p of problems) console.log(`  ✗ ${p}`); }
  else console.log('\n✓ every home, member and coupling resolves; every ceremony has an organ');
  if (unclaimedMeta.length) console.log(`\nmeta entries no organ claims (${unclaimedMeta.length}) — read, then claim or leave:\n  ${unclaimedMeta.join(' · ')}`);
}
if (flag('--write')) { writeFileSync(MEASURED, JSON.stringify(measured, null, 1) + '\n'); if (!flag('--json')) console.log(`\nwrote ${MEASURED.slice(ROOT.length + 1)}`); }
process.exit(problems.length ? 1 : 0);
