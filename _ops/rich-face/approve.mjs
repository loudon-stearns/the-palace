// approve.mjs — Loudon's yes on a proposal section, written into the manifest.
//
//   node approve.mjs "Kuramoto Coupling" "In Our Instruments"      approve one section
//   node approve.mjs "Kuramoto Coupling" "A" "B" --via dock          approve several, the yes came from the dock
//   node approve.mjs "Kuramoto Coupling" --all                        every section still at proposal
//   [--by Loudon] [--via chat|dock]                                   who said yes, and how (defaults: Loudon, chat)
//
// Approval is Loudon's alone (Enrichment § Proposal and approval); this script
// is the pen an agent uses on his word. It flips `status: proposal` to
// `approved`, writes the `approved` block, leaves every other field — pieces,
// stamps, the challenge, the offers — exactly as it was, and prints the
// palace-commit line to run. It never commits, and it writes only the manifest,
// never the entry. The manifest is found the way fingerprint.mjs finds it.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve as resolvePath } from 'node:path';
import { sectionKey } from './parse.js';
import { makeResolver } from './resolve.mjs';

export const VIAS = ['chat', 'dock'];

/** Flip the named sections (or, with `all`, every proposal section) to approved. Pure: edits `manifest` in place and reports. */
export function approveSections(manifest, { sections = [], all = false, by = 'Loudon', via = 'chat', today } = {}) {
  if (!VIAS.includes(via)) throw new Error(`--via must be one of ${VIAS.join(', ')}, not "${via}"`);
  if (!by) throw new Error('--by needs a name');
  if (!all && !sections.length) throw new Error('name a section, or say --all');
  const date = today || new Date().toLocaleDateString('en-CA');   // local date, YYYY-MM-DD
  const list = Array.isArray(manifest.sections) ? manifest.sections : [];
  const byKey = new Map(list.map((m) => [sectionKey(m.heading), m]));
  const out = { approved: [], unmatched: [], notProposal: [] };
  // A name that matches no manifest section is almost always a typo — say so.
  for (const s of sections) if (!byKey.has(sectionKey(s))) out.unmatched.push(s);
  const want = new Set(sections.map(sectionKey));
  for (const m of list) {
    const k = sectionKey(m.heading);
    if (!all && !want.has(k)) continue;
    if (m.status !== 'proposal') { if (want.has(k)) out.notProposal.push({ heading: m.heading, status: m.status || 'approved (no status)' }); continue; }
    m.status = 'approved';
    m.approved = { date, by, via };
    out.approved.push(m.heading);
  }
  return out;
}

/** Read a manifest file, approve, write it back only when something changed. */
export function approveManifestFile(manifestPath, opts) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const out = approveSections(manifest, opts);
  if (out.approved.length) writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  return out;
}

export function parseArgs(argv) {
  const o = { sections: [], all: false, by: 'Loudon', via: 'chat', name: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--all') o.all = true;
    else if (a === '--by') o.by = argv[++i];
    else if (a === '--via') o.via = argv[++i];
    else if (a.startsWith('--')) throw new Error(`unknown flag ${a}`);
    else if (o.name === null) o.name = a;
    else o.sections.push(a);
  }
  return o;
}

function main() {
  let o;
  try { o = parseArgs(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exit(2); }
  if (!o.name || (!o.all && !o.sections.length)) {
    console.error('usage: node approve.mjs "<Entry>" ["<Section>" …] [--all] [--by Loudon] [--via chat|dock]');
    process.exit(2);
  }
  const resolver = makeResolver();
  const found = resolver.entry(o.name);
  if (!found) { console.error(`no entry named "${o.name}"`); process.exit(1); }
  if (!found.manifest) { console.error(`"${o.name}" has no rich face (no manifest in its bundle)`); process.exit(1); }
  const manifestPath = resolver.abs(found.manifest);
  let out;
  try { out = approveManifestFile(manifestPath, o); } catch (e) { console.error(e.message); process.exit(2); }
  for (const s of out.unmatched) console.error(`  no manifest section named "${s}"`);
  for (const { heading, status } of out.notProposal) console.error(`  skip  "${heading}" — not at proposal (${status})`);
  for (const hd of out.approved) console.log(`  approved "${hd}" · ${o.by} · via ${o.via}`);
  if (!out.approved.length) { console.log(`nothing approved — ${found.manifest} left as it was`); process.exitCode = out.unmatched.length ? 1 : 0; return; }
  const n = out.approved.length;
  console.log(`${n} section(s) approved in ${found.manifest}. Commit it:`);
  const summary = `approved ${n === 1 ? `"${out.approved[0]}"` : `${n} sections`} — ${o.by}, via ${o.via}`;
  console.log(`  node _ops/stigmergy/app/scripts/palace-commit.mjs --kind enrich --scope ${JSON.stringify(o.name)} --summary ${JSON.stringify(summary)} --verify verified --path ${JSON.stringify(found.manifest)}`);
  if (out.unmatched.length) process.exitCode = 1;
}

if (process.argv[1] && resolvePath(process.argv[1]) === fileURLToPath(import.meta.url)) main();
