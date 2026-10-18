// fingerprint.mjs — read an entry's section fingerprints; stamp a manifest.
//
//   node fingerprint.mjs "Kuramoto Coupling"              list sections, fingerprints, drift
//   node fingerprint.mjs "Kuramoto Coupling" --stamp      stamp every manifest section with the text as it is now
//   node fingerprint.mjs "Kuramoto Coupling" --stamp "The Fine-Tuning Insight"
//                                                          re-stamp one section — the "still true" verdict
//
// Uses parse.js, the same code the page runs, so a stamp written here is the
// stamp the page compares against. Writes only the manifest, never the entry.

import { readFileSync, writeFileSync } from 'node:fs';
import { parseEntry, sectionProse, sectionKey, fingerprint } from './parse.js';
import { makeResolver } from './resolve.mjs';

const [name, flag, ...only] = process.argv.slice(2);
if (!name) { console.error('usage: node fingerprint.mjs "<Entry>" [--stamp [section …]]'); process.exit(2); }

// The entry and its manifest, found the way the page and the build find them.
const resolver = makeResolver();
const found = resolver.entry(name);
if (!found) { console.error(`no entry named "${name}"`); process.exit(1); }
const mdPath = resolver.abs(found.md);
const manifestPath = found.manifest && resolver.abs(found.manifest);

const entry = parseEntry(readFileSync(mdPath, 'utf8'));
const fps = new Map();
// s.name, not s.heading: a repeated heading is named "Notes (2)", as its manifest section is.
for (const s of entry.sections) fps.set(s.key, { heading: s.name, fp: await fingerprint(sectionProse(s)) });

const manifest = manifestPath ? JSON.parse(readFileSync(manifestPath, 'utf8')) : null;
const bySection = new Map((manifest?.sections || []).map((m) => [sectionKey(m.heading), m]));

if (flag === '--stamp') {
  if (!manifest) { console.error('no manifest to stamp'); process.exit(1); }
  const want = new Set(only.map(sectionKey));
  // A name that matches no manifest section is almost always a typo — say so,
  // rather than stamping nothing in silence.
  const inManifest = new Set(manifest.sections.map((m) => sectionKey(m.heading)));
  const unmatched = only.filter((s) => !inManifest.has(sectionKey(s)));
  for (const s of unmatched) console.error(`  no manifest section named "${s}" — the manifest has ${manifest.sections.map((m) => `"${m.heading}"`).join(', ')}`);
  const today = new Date().toLocaleDateString('en-CA');   // local date, YYYY-MM-DD
  let n = 0;
  for (const m of manifest.sections) {
    const k = sectionKey(m.heading);
    if (want.size && !want.has(k)) continue;
    const cur = fps.get(k);
    if (!cur) { console.log(`  skip  "${m.heading}" — the text has no such heading (lost its place)`); continue; }
    if (m.made_against !== cur.fp) { m.made_against = cur.fp; m.stamped = today; n++; console.log(`  stamp "${m.heading}" → ${cur.fp}`); }
  }
  const where = found.manifest;
  // Written only when a stamp changed: nothing matched, or everything was
  // already in step, leaves the file exactly as it was.
  if (n) { writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n'); console.log(`${n} section(s) stamped in ${where}`); }
  else console.log(`nothing stamped — ${where} left as it was`);
  if (unmatched.length) process.exitCode = 1;
} else {
  for (const [k, { heading, fp }] of fps) {
    const m = bySection.get(k);
    const state = !m ? '' : !m.made_against ? '  (unstamped)' : m.made_against === fp ? '  in step' : `  ◐ drifted (stamped ${m.made_against})`;
    console.log(`${fp}  ${heading}${m ? `  · ${m.pieces.length} piece(s)` : ''}${state}`);
  }
  const byFp = new Map([...fps.values()].map((v) => [v.fp, v.heading]));
  for (const [k, m] of bySection) {
    if (fps.has(k)) continue;
    const renamed = m.made_against && byFp.get(m.made_against);
    console.log(`   lost   ${m.heading}  · ${m.pieces.length} piece(s) — heading gone${renamed ? `; same words now under "${renamed}" (probably a rename)` : ''}`);
  }
}
