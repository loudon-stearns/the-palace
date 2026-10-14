// mandate.mjs — the prompt that wakes Palace Quotes as a glass over a page.
//
// [[The Lens]]'s own mandate (buildLensMandate) wakes the glass page as itself,
// hands it the subject, and asks for the two-attempt read — then tells it to
// report a spark to the WEAVE board and, at 4 or more, to ask TRICKSTER whether
// to commit. Palace Quotes keeps the read and drops the reporting: a quote is
// small and there will be many, and Loudon judges them in STIGMERGY with one
// key each (y / x), so a board card per quote would only fill the inbox
// (Loudon, 2026-10-14). The placement line IS the report; the "awaiting your
// read" count is the inbox.
//
// So this builder takes the Lens's prompt, cuts its reporting section, and
// appends the quoter's method (prompts/quoter.md). Used by place.mjs --mandate
// and by STIGMERGY's [L] lens when the glass picked is Palace Quotes
// (server/api/launch.js). No shebang: the app imports this by relative path.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLensMandate } from '../stigmergy/orchestrator/src/lens-mandate.js';
import { findEntryFile } from '../stigmergy/orchestrator/src/entry-paths.js';
import { parseLedger, foldLedger, normalize } from './schema.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const GLASS = 'Palace Quotes';
const LEDGER_REL = '_ops/Palace Quotes/Palace Quotes — placements.jsonl';

// The pages one typed link away from the subject: title and path, so the
// reader can read the neighborhood the open reading starts from. Read off the
// subject's frontmatter links; a target with no page is named as a ghost.
export function neighborsOf(palaceRoot, subjectTitle) {
  const file = findEntryFile(palaceRoot, subjectTitle);
  if (!file) return [];
  const text = readFileSync(file, 'utf8');
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return [];
  const out = [];
  const seen = new Set();
  for (const m of fm[1].matchAll(/target:\s*"?\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]"?/g)) {
    const title = m[1].trim();
    if (seen.has(title) || title === subjectTitle) continue;
    seen.add(title);
    const nf = findEntryFile(palaceRoot, title);
    out.push({ title, path: nf ? relative(palaceRoot, nf).split(sep).join('/') : null });
  }
  return out;
}

// The roster, one line per voice, and who has been quoted so far — so a
// reader can reach for the least-used circle and know which voices would be
// new to the palace.
export function visitContext(palaceRoot, subjectTitle) {
  const neighbors = neighborsOf(palaceRoot, subjectTitle);
  const roster = JSON.parse(readFileSync(join(HERE, 'voices.json'), 'utf8'));
  const ledgerPath = join(palaceRoot, LEDGER_REL);
  const placements = existsSync(ledgerPath) ? foldLedger(parseLedger(readFileSync(ledgerPath, 'utf8')).lines) : [];
  const active = placements.filter((q) => q.status !== 'retired');
  // Tallied by the normalized name, shown by the name as it was first written.
  const tally = new Map();
  const shown = new Map();
  for (const q of active) {
    const k = normalize(q.attribution);
    tally.set(k, (tally.get(k) || 0) + 1);
    if (!shown.has(k)) shown.set(k, q.attribution);
  }
  const onThisPage = active.filter((q) => q.target === subjectTitle);

  const lines = [];
  lines.push('## For this visit');
  lines.push('');
  lines.push(`**The neighborhood of ${subjectTitle}** — the pages one typed link away; read the ones that bear on your sentence (paths are palace-relative):`);
  lines.push('');
  if (neighbors.length === 0) lines.push('- (no typed links yet — read the page alone)');
  for (const n of neighbors) lines.push(`- ${n.title}${n.path ? ` — \`${n.path}\`` : ' — (no page yet; a forward ghost)'}`);
  lines.push('');
  if (onThisPage.length) {
    lines.push(`**Already on this page** — lay yours beside a different sentence, through a different lens:`);
    lines.push('');
    for (const q of onThisPage) lines.push(`- “${q.quote.slice(0, 80)}${q.quote.length > 80 ? '…' : ''}” — ${q.attribution} · through ${q.lens} · beside “${q.near}”`);
    lines.push('');
  }
  lines.push(`**Who has been quoted so far** (${active.length} quotes; a voice at 3 or more is one to leave alone):`);
  lines.push('');
  lines.push([...tally.entries()].sort((a, b) => b[1] - a[1]).map(([who, n]) => `${shown.get(who)} ×${n}`).join(' · ') || '(no one yet)');
  lines.push('');
  lines.push(`**The roster, the floor** (\`_ops/quotes/voices.json\`; \`answers\` names the lens pages a voice tends to speak to; a citizen's \`speech\` file holds cited verbatim excerpts that need no web check):`);
  lines.push('');
  for (const v of roster.voices) {
    const used = tally.get(normalize(v.name)) || 0;
    lines.push(`- **${v.name}** (${v.circle}) — ${v.domain} · answers ${v.answers.join(', ')}${v.speech ? ` · speech: \`${v.speech}\`` : v.palace ? ` · page: \`${v.palace}\`` : ''}${used ? ` · quoted ×${used}` : ''}`);
  }
  lines.push('');
  lines.push('A voice not on this list and not under People is **new to the palace**: the open reading hopes for one, and the placer holds it to `checked: web` with `source.url`.');
  return lines.join('\n');
}

// The Lens's reporting section starts at this heading and runs to the end of
// the procedure (or to Loudon's extra note, when one was given).
const REPORT_HEADING = '## Report — do not write the candidate yourself';
const NOTE_MARKER = '\n\n---\n\n# Loudon\'s extra note for this lensing';

export function stripLensReport(full) {
  const at = full.indexOf(REPORT_HEADING);
  if (at === -1) return full;
  const noteAt = full.indexOf(NOTE_MARKER, at);
  return noteAt === -1 ? full.slice(0, at).trimEnd() : `${full.slice(0, at).trimEnd()}${full.slice(noteAt)}`;
}

export function quoterText(subjectTitle) {
  return readFileSync(join(HERE, 'prompts', 'quoter.md'), 'utf8').replace(/\{\{SUBJECT\}\}/g, subjectTitle);
}

/**
 * Same shape as buildLensMandate — { ok, status, glass, subject, stage, full }
 * — so a caller can thread it straight into /api/launch/ephemeral. `glassTitle`
 * is accepted and ignored: this builder is Palace Quotes' own.
 */
export function buildQuoteMandate({ palaceRoot, subjectTitle, loudonNote = '' } = {}) {
  const built = buildLensMandate({ palaceRoot, glassTitle: GLASS, subjectTitle, loudonNote });
  if (!built.ok) return built;
  const full = `${stripLensReport(built.full)}\n\n---\n\n${quoterText(subjectTitle)}\n\n${visitContext(palaceRoot, subjectTitle)}`;
  return { ...built, full, payoff: 'quote' };
}
