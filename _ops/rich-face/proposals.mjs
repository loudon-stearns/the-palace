// proposals.mjs — what still waits for Loudon across every rich face.
//
//   node proposals.mjs            every section still at proposal, by entry, with its age and
//                                 its challenger's verdict counts; and every open offer
//   node proposals.mjs --json     the same as JSON
//
// Report-only: reads every `[Entry] — rich.json` git knows (tracked, or new and
// not ignored) and writes nothing. The fields it reads are documented in
// README.md § A section's status.

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve as resolvePath, join, posix } from 'node:path';
import { ROOT } from './resolve.mjs';

const MANIFEST = / — rich\.json$/;

/** Every manifest path git knows, palace-relative. */
export function manifestPaths(root = ROOT) {
  const ls = (args) => execFileSync('git', ['-C', root, 'ls-files', '-z', ...args], { encoding: 'utf8' }).split('\0').filter(Boolean);
  const all = new Set([...ls([]), ...ls(['--others', '--exclude-standard'])]);
  return [...all].filter((p) => MANIFEST.test(p)).sort();
}

export function readManifests(root = ROOT) {
  return manifestPaths(root).map((path) => {
    let manifest = null, error = null;
    try { manifest = JSON.parse(readFileSync(join(root, ...path.split('/')), 'utf8')); } catch (e) { error = e.message; }
    const entry = (manifest && manifest.entry) || posix.basename(path).replace(MANIFEST, '');
    return { entry, path, manifest, error };
  });
}

const dayMs = 86400000;
export function ageDays(date, today) {
  if (!date) return null;
  const a = Date.parse(date), b = Date.parse(today);
  return Number.isFinite(a) && Number.isFinite(b) ? Math.max(0, Math.floor((b - a) / dayMs)) : null;
}

/** Pure: from read manifests to what waits. */
export function collectProposals(list, { today } = {}) {
  const day = today || new Date().toLocaleDateString('en-CA');
  const proposals = [], offers = [], errors = [];
  for (const { entry, path, manifest, error } of list) {
    if (error || !manifest) { errors.push({ entry, path, error: error || 'empty' }); continue; }
    for (const m of manifest.sections || []) {
      if (!m || m.status !== 'proposal') continue;
      const v = (m.challenge && m.challenge.verdicts) || [];
      const counts = { keep: 0, remake: 0, retire: 0 };
      for (const x of v) if (x && x.verdict in counts) counts[x.verdict]++;
      proposals.push({
        entry, path, heading: m.heading,
        proposed: m.proposed || null,
        age_days: ageDays(m.proposed && m.proposed.date, day),
        pieces: (m.pieces || []).length,
        challenge: m.challenge ? { date: m.challenge.date || null, by: m.challenge.by || null, ...counts } : null,
      });
    }
    for (const o of manifest.offers || []) {
      if (!o || (o.status && o.status !== 'open')) continue;
      offers.push({ entry, path, section: o.section || null, kind: o.kind || null, what: o.what || '', status: o.status || 'open' });
    }
  }
  return { today: day, proposals, offers, errors };
}

export function formatReport({ today, proposals, offers, errors }) {
  const lines = [];
  const byEntry = new Map();
  for (const p of proposals) (byEntry.get(p.entry) || byEntry.set(p.entry, []).get(p.entry)).push(p);
  for (const o of offers) if (!byEntry.has(o.entry)) byEntry.set(o.entry, []);
  if (!byEntry.size) lines.push(`nothing waits — no section at proposal, no open offer (${today})`);
  for (const [entry, ps] of byEntry) {
    const path = (ps[0] || offers.find((o) => o.entry === entry)).path;
    lines.push(`${entry}  (${path})`);
    for (const p of ps) {
      const age = p.age_days === null ? 'age unknown' : `${p.age_days} day${p.age_days === 1 ? '' : 's'}`;
      const who = p.proposed ? ` · by ${p.proposed.by || '?'}${p.proposed.round ? ` · ${p.proposed.round}` : ''}` : ' · no proposed block';
      const ch = p.challenge ? `challenge: ${p.challenge.keep} keep, ${p.challenge.remake} remake, ${p.challenge.retire} retire${p.challenge.by ? ` (${p.challenge.by})` : ''}` : 'not yet challenged';
      lines.push(`  proposal  "${p.heading}"  · ${age} · ${p.pieces} piece${p.pieces === 1 ? '' : 's'}${who} · ${ch}`);
    }
    for (const o of offers.filter((x) => x.entry === entry)) lines.push(`  offer     "${o.section || '?'}" · ${o.kind || '?'} · ${o.status} · ${o.what}`);
  }
  for (const e of errors) lines.push(`  !  ${e.path}: ${e.error}`);
  lines.push(`${proposals.length} section(s) at proposal across ${new Set(proposals.map((p) => p.entry)).size} page(s) · ${offers.length} open offer(s)`);
  return lines.join('\n');
}

function main() {
  const json = process.argv.includes('--json');
  const bad = process.argv.slice(2).filter((a) => a !== '--json');
  if (bad.length) { console.error('usage: node proposals.mjs [--json]'); process.exit(2); }
  const report = collectProposals(readManifests());
  if (json) console.log(JSON.stringify(report, null, 2));
  else console.log(formatReport(report));
}

if (process.argv[1] && resolvePath(process.argv[1]) === fileURLToPath(import.meta.url)) main();
