#!/usr/bin/env node
// place.mjs — lay a quote on a palace page, honestly.
//
//   node _ops/quotes/place.mjs --file placement.json [--dry-run] [--by "<agent>"]
//   node _ops/quotes/place.mjs --stdin < placement.json
//   node _ops/quotes/place.mjs --keep <id> [--why "<note>"]       Loudon's yes (an elder, on his word)
//   node _ops/quotes/place.mjs --retire <id> --why "<reason>"      take it down; --keep later revives it
//   node _ops/quotes/place.mjs --list [--target "<Title>"] [--lens "<Title>"] [--awaiting]
//   node _ops/quotes/place.mjs --voices            who has been quoted, how often, and which voices are new to the palace
//   node _ops/quotes/place.mjs --check             re-anchor every placement; report what moved
//   node _ops/quotes/place.mjs --mandate "<Title>" print the prompt that wakes Palace Quotes as a glass over that page
//
// The page the quote lands on is never written. A placement is one JSON line
// appended to the ledger in Palace Quotes' own bundle; STIGMERGY lays it
// beside the page's words (src/lib/quotes.js, the QUOTES lens). The checks
// here are the ones that keep that honest: the `near` phrase must be on the
// page, the lens must be a palace page, and the quote must say how far it is
// from its source and how it was checked (schema.mjs).
//
// Runs from any worktree; writes to THIS checkout's ledger. Append-only, so
// two agents placing at once cannot clobber each other (assume multi-agent).

import { readFileSync, existsSync, appendFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findEntryFile } from '../stigmergy/orchestrator/src/entry-paths.js';
import { parseEntry, sectionProse, sectionKey, fingerprint } from '../rich-face/parse.js';
import {
  validatePlacement, findNear, normalize, newId, parseLedger, foldLedger,
  fidelityGlyph, statusLabel, decisionLine, ledgerHeader, PLACED_BY_DEFAULT,
} from './schema.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const LEDGER_REL = '_ops/Palace Quotes/Palace Quotes — placements.jsonl';
const GLASS = 'Palace Quotes';

// ── args ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name) => { const i = argv.indexOf(`--${name}`); return i !== -1 && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };

const root = resolve(opt('root') || resolve(HERE, '..', '..'));
const ledgerPath = join(root, LEDGER_REL);
const NOT_LENSES = new Set((() => {
  try { return JSON.parse(readFileSync(join(HERE, 'lenses.json'), 'utf8')).not_lenses || []; } catch { return []; }
})());

function splitFm(text) {
  const m = text.match(/^---\n[\s\S]*?\n---\n?/);
  return m ? text.slice(m[0].length) : text;
}

function readLedger() {
  if (!existsSync(ledgerPath)) return { all: [], folded: [] };
  const { lines, skipped } = parseLedger(readFileSync(ledgerPath, 'utf8'));
  for (const s of skipped) console.error(`  ! ledger line ${s.line} skipped: ${s.reason}`);
  return { all: lines, folded: foldLedger(lines) };
}

// A ledger is born with its header line (SCHEMA — Reference §8: every bundle
// file says what it is), then only ever appended to.
function appendLine(obj) {
  mkdirSync(dirname(ledgerPath), { recursive: true });
  if (!existsSync(ledgerPath)) appendFileSync(ledgerPath, `${JSON.stringify(ledgerHeader())}\n`, 'utf8');
  appendFileSync(ledgerPath, `${JSON.stringify(obj)}\n`, 'utf8');
}

// The section fingerprint the rich face would compute for the section the
// `near` phrase sits in — stamped on the placement so a later read can say
// whether the words moved (drift), the same way a rich-face piece can. The
// rich face's sections are H1/H2 only, so a phrase under an H3 is found by
// its words: the section whose prose carries the phrase.
async function stampFor(entryText, heading, near) {
  const parsed = parseEntry(entryText);
  const key = heading ? sectionKey(heading) : null;
  let sec = key ? parsed.sections.find((s) => s.key === key) : null;
  if (!sec && near) {
    const want = normalize(near);
    sec = parsed.sections.find((s) => normalize(sectionProse(s)).includes(want));
  }
  if (!sec) sec = parsed.sections[0];
  if (!sec) return null;
  return { heading: sec.heading, fp: await fingerprint(sectionProse(sec)) };
}

// ── place ───────────────────────────────────────────────────────────────────
async function place(input, { dryRun, by, force }) {
  const items = Array.isArray(input) ? input : [input];
  const { folded } = readLedger();
  let placed = 0;
  let refused = 0;
  for (const p of items) {
    const targetFile = p && typeof p.target === 'string' ? findEntryFile(root, p.target) : null;
    const lensFile = p && typeof p.lens === 'string' ? findEntryFile(root, p.lens) : null;
    const targetText = targetFile ? readFileSync(targetFile, 'utf8') : null;
    const targetBody = targetText === null ? null : splitFm(targetText);
    const v = validatePlacement(p, { targetBody, lensFound: !!lensFile });

    const label = `"${String(p?.quote ?? '').slice(0, 48)}…" → ${p?.target ?? '?'}`;
    // A register hub like Palace Philosophies has no apparatus of its own; The
    // Lens's fidelity test cannot run through it. But `type: hub` is earned by
    // inbound links, and Spinoza Conatus or Kuramoto Coupling are hubs with
    // every bit of apparatus — so the warning is by name (lenses.json
    // `not_lenses`), not by type. Warn, don't refuse.
    if (NOT_LENSES.has(p.lens)) {
      v.warnings.push(`lens "${p.lens}" is a register hub — it has no apparatus of its own; quote through the page that does`);
    }
    for (const w of v.warnings) console.log(`  ~ ${label}: ${w}`);
    if (!v.ok) {
      refused += 1;
      for (const e of v.errors) console.error(`  ✗ ${label}: ${e}`);
      continue;
    }

    // The same words on the same page twice is a slip, not a second window.
    const dup = folded.find((q) => q.status !== 'retired' && q.target === p.target && normalize(q.quote) === normalize(p.quote));
    if (dup && !force) {
      refused += 1;
      console.error(`  ✗ ${label}: already placed as ${dup.id} — retire it first, or --force`);
      continue;
    }
    // One voice everywhere narrows the walk. Warn, don't refuse: the why may
    // earn it, and Loudon's key decides.
    const sameVoice = folded.filter((q) => q.status !== 'retired' && normalize(q.attribution) === normalize(p.attribution)).length;
    if (sameVoice >= 3) console.log(`  ~ ${label}: ${p.attribution} already has ${sameVoice} quotes placed — reach wider unless this one is the line`);

    const stamp = await stampFor(targetText, v.anchor.heading, p.near);
    const line = {
      id: newId(),
      quote: p.quote.trim(),
      attribution: p.attribution.trim(),
      source: p.source,
      fidelity: p.fidelity,
      checked: p.checked,
      lens: p.lens.trim(),
      target: p.target.trim(),
      near: p.near.trim(),
      section: stamp?.heading ?? v.anchor.heading ?? null,
      made_against: stamp?.fp ?? null,
      why: p.why.trim(),
      placed_by: by || p.placed_by || PLACED_BY_DEFAULT,
      placed_at: new Date().toISOString(),
      status: 'placed',
    };
    if (p.mode) line.mode = p.mode;
    if (p.new_voice === true) line.new_voice = true;
    if (p.session) line.session = p.session;

    if (dryRun) {
      console.log(`  ○ would place ${fidelityGlyph(line.fidelity, line.checked)} ${label} · under "${line.section}" · stamp ${line.made_against}`);
    } else {
      appendLine(line);
      placed += 1;
      console.log(`  ● placed ${line.id} ${fidelityGlyph(line.fidelity, line.checked)} ${label} · under "${line.section}"`);
    }
    console.log(JSON.stringify(line));
  }
  console.log(`\n${dryRun ? 'dry run — ' : ''}${placed} placed, ${refused} refused · ledger: ${ledgerPath.replace(root + '/', '')}`);
  if (refused) process.exitCode = 1;
}

// ── keep / retire — a decision on a placed quote ────────────────────────────
function decide(id, decision, why, by) {
  const { folded } = readLedger();
  const q = folded.find((x) => x.id === id);
  if (!q) { console.error(`  ✗ no placement ${id}`); process.exitCode = 1; return; }
  if (decision === 'retire' && q.status === 'retired') { console.log(`  · ${id} is already let go`); return; }
  if (decision === 'keep' && q.status === 'kept') { console.log(`  · ${id} is already kept`); return; }
  if (decision === 'retire' && !why) { console.error('  ✗ --why is required: say why the quote comes down'); process.exitCode = 1; return; }
  const line = decisionLine(id, decision, { why, by: by || 'loudon' });
  appendLine(line);
  const verb = decision === 'keep' ? (q.status === 'retired' ? 'revived' : 'kept') : 'let go';
  console.log(`  ${decision === 'keep' ? '◆' : '○'} ${verb} ${id} — "${q.quote.slice(0, 48)}…" on ${q.target}`);
  console.log(JSON.stringify(line));
}

// ── list / check ────────────────────────────────────────────────────────────
async function list({ target, lens, check, awaiting }) {
  const { folded } = readLedger();
  let rows = folded.filter((q) => q.status !== 'retired');
  if (awaiting) rows = rows.filter((q) => q.status !== 'kept');
  if (target) rows = rows.filter((q) => q.target === target);
  if (lens) rows = rows.filter((q) => q.lens === lens);
  if (rows.length === 0) { console.log('  no quotes placed' + (target || lens ? ' there' : ' yet')); return; }
  let moved = 0;
  let drifted = 0;
  for (const q of rows) {
    let note = '';
    if (check) {
      const file = findEntryFile(root, q.target);
      if (!file) note = '  ✗ page gone';
      else {
        const text = readFileSync(file, 'utf8');
        const a = findNear(splitFm(text), q.near);
        if (!a.found) { moved += 1; note = '  ✗ near phrase no longer on the page'; }
        else if (q.made_against) {
          const s = await stampFor(text, a.heading, q.near);
          if (s && s.fp !== q.made_against) { drifted += 1; note = `  ◐ section drifted (stamped ${q.made_against}, now ${s.fp})`; }
          else note = '  in step';
        }
      }
    }
    const standing = q.status === 'kept' ? '◆ kept' : 'awaiting';
    console.log(`${q.id}  ${fidelityGlyph(q.fidelity, q.checked)}  ${standing.padEnd(8)}  ${q.target} ← ${q.lens}  “${q.quote.slice(0, 56)}${q.quote.length > 56 ? '…' : ''}” — ${q.attribution}${note}`);
  }
  const kept = rows.filter((q) => q.status === 'kept').length;
  console.log(`\n${rows.length} placed · ${kept} kept · ${rows.length - kept} ${statusLabel('placed')}${check ? ` · ${moved} moved · ${drifted} drifted` : ''}`);
  if (check && moved) process.exitCode = 1;
}

// ── voices: who has been quoted, and how often ──────────────────────────────
function voices() {
  const { folded } = readLedger();
  const active = folded.filter((q) => q.status !== 'retired');
  const tally = new Map();
  for (const q of active) {
    const k = q.attribution;
    const t = tally.get(k) || { n: 0, kept: 0, newVoice: false, modes: new Set() };
    t.n += 1; if (q.status === 'kept') t.kept += 1; if (q.new_voice) t.newVoice = true; if (q.mode) t.modes.add(q.mode);
    tally.set(k, t);
  }
  const rows = [...tally.entries()].sort((a, b) => b[1].n - a[1].n || a[0].localeCompare(b[0]));
  if (rows.length === 0) { console.log('  no quotes placed yet'); return; }
  for (const [who, t] of rows) {
    console.log(`${String(t.n).padStart(3)}  ${String(t.kept).padStart(2)} kept  ${t.newVoice ? '✦ new ' : '      '} ${who}${t.modes.size ? `  (${[...t.modes].join(', ')})` : ''}`);
  }
  const open = active.filter((q) => q.mode === 'open');
  console.log(`\n${rows.length} voices · ${active.length} quotes · ${open.length} from the open reading · ${active.filter((q) => q.new_voice).length} new to the palace`);
}

// ── mandate: wake Palace Quotes as the glass over a page ────────────────────
// The Lens's read, without its board reports; the quoter's method appended
// (mandate.mjs — the same builder STIGMERGY's [L] lens uses for this glass).
async function mandate(subject, note) {
  const { buildQuoteMandate } = await import('./mandate.mjs');
  const built = buildQuoteMandate({ palaceRoot: root, subjectTitle: subject, loudonNote: note || '' });
  if (!built.ok) { console.error(`  ✗ ${built.status}: ${subject}`); process.exitCode = 1; return; }
  process.stdout.write(`${built.full}\n`);
}

// ── main ────────────────────────────────────────────────────────────────────
const by = opt('by');
if (flag('mandate')) {
  await mandate(opt('mandate'), opt('note'));
} else if (flag('retire')) {
  decide(opt('retire'), 'retire', opt('why'), by);
} else if (flag('keep')) {
  decide(opt('keep'), 'keep', opt('why'), by);
} else if (flag('voices')) {
  voices();
} else if (flag('list') || flag('check')) {
  await list({ target: opt('target'), lens: opt('lens'), check: flag('check'), awaiting: flag('awaiting') });
} else if (flag('file') || flag('stdin')) {
  const text = flag('stdin') ? readFileSync(0, 'utf8') : readFileSync(resolve(opt('file')), 'utf8');
  let input;
  try { input = JSON.parse(text); } catch (e) { console.error(`  ✗ not JSON: ${e.message}`); process.exit(2); }
  await place(input, { dryRun: flag('dry-run'), by, force: flag('force') });
} else {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 9).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(2);
}
