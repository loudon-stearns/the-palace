// Palace Quotes worn as a glass: the Lens's read, without its board reports,
// the quoter's method appended. A temp palace with the glass page and a
// subject is enough — buildLensMandate reads both from disk.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { buildQuoteMandate, stripLensReport } from '../../../../quotes/mandate.mjs';

describe('buildQuoteMandate', () => {
  let root;
  beforeAll(() => {
    root = mkdtempSync(resolve(tmpdir(), 'stigmergy-quote-mandate-'));
    mkdirSync(resolve(root, '_ops'), { recursive: true });
    writeFileSync(resolve(root, '_ops/Palace Quotes.md'),
      '---\ntitle: Palace Quotes\ntype: meta\npillars: [philosophy]\nborn: 2026-03\nstage: sprout\nforward_vector: "I lay quotes beside pages."\nlinks:\n  - target: "[[Kuramoto]]"\n    type: connects-to\n---\n# Palace Quotes\n\nA page that leaves quotes on other pages.\n');
    writeFileSync(resolve(root, 'Kuramoto.md'),
      '---\ntitle: Kuramoto\ntype: concept\npillars: [tools]\nborn: 2026-03\nstage: growing\nlinks:\n  - target: "[[Granular]]"\n    type: enables\n  - target: "[[Nowhere Yet]]"\n    type: connects-to\n---\n# Kuramoto\n\nThe coupling constant K is the key parameter.\n');
    writeFileSync(resolve(root, 'Granular.md'),
      '---\ntitle: Granular\ntype: concept\npillars: [creation]\nborn: 2026-03\nstage: sprout\n---\n# Granular\n\nThe grain is the atom.\n');
    mkdirSync(resolve(root, '_ops/Palace Quotes'), { recursive: true });
    writeFileSync(resolve(root, '_ops/Palace Quotes/Palace Quotes — placements.jsonl'),
      JSON.stringify({ id: 'q-1', quote: 'Each thing strives.', attribution: 'Spinoza', lens: 'Spinoza Conatus', target: 'Kuramoto', near: 'coupling constant K', status: 'placed' }) + '\n'
      + JSON.stringify({ id: 'q-2', quote: 'Gone.', attribution: 'Spinoza', lens: 'Spinoza Conatus', target: 'Granular', near: 'the grain', status: 'retired' }) + '\n');
  });
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('keeps the Lens read, cuts its board reports, and appends the quoter', () => {
    const built = buildQuoteMandate({ palaceRoot: root, subjectTitle: 'Kuramoto' });
    expect(built.ok).toBe(true);
    expect(built.glass).toBe('Palace Quotes');
    expect(built.payoff).toBe('quote');
    expect(built.full).toContain('# You are also a LENS this session');
    expect(built.full).toContain('Attempt 2 — the fidelity self-check');
    expect(built.full).not.toContain('## Report — do not write the candidate yourself');
    expect(built.full).not.toContain('RESOURCE_REQUEST');
    expect(built.full).not.toContain('appendMessage(');
    expect(built.full).toContain('# You are Palace Quotes, and your payoff is a quote');
    expect(built.full).toContain('Post to no board');
    expect(built.full).toContain('"target": "Kuramoto"');
    expect(built.full).not.toContain('{{SUBJECT}}');
  });

  it('hands the reader the neighborhood, what is already on the page, the tally, and the roster', () => {
    const built = buildQuoteMandate({ palaceRoot: root, subjectTitle: 'Kuramoto' });
    expect(built.full).toContain('## For this visit');
    expect(built.full).toContain('- Granular — `Granular.md`');
    expect(built.full).toContain('- Nowhere Yet — (no page yet; a forward ghost)');
    expect(built.full).toContain('**Already on this page**');
    expect(built.full).toContain('“Each thing strives.” — Spinoza · through Spinoza Conatus · beside “coupling constant K”');
    expect(built.full).toContain('Spinoza ×1'); // the retired one is not counted
    expect(built.full).toContain('**Pauline Oliveros** (music)');
    expect(built.full).toContain('speech: `People/Brian Eno/Brian Eno — speech.md`');
    expect(built.full).toContain('new to the palace');
  });

  it("keeps Loudon's extra note when one is given, after the read and before the quoter", () => {
    const built = buildQuoteMandate({ palaceRoot: root, subjectTitle: 'Kuramoto', loudonNote: 'look at the threshold' });
    expect(built.full).toContain("# Loudon's extra note for this lensing");
    expect(built.full).toContain('look at the threshold');
    expect(built.full).not.toContain('## Report — do not write');
    expect(built.full.indexOf("Loudon's extra note")).toBeLessThan(built.full.indexOf('# You are Palace Quotes'));
  });

  it('reports a missing subject the way the Lens does', () => {
    const built = buildQuoteMandate({ palaceRoot: root, subjectTitle: 'Nowhere' });
    expect(built.ok).toBe(false);
    expect(built.status).toBe('subject_not_found');
  });
});

describe('stripLensReport', () => {
  it('cuts from the report heading to the end, or to the note marker', () => {
    expect(stripLensReport('read\n\n## Report — do not write the candidate yourself\n\npost it')).toBe('read');
    const kept = stripLensReport('read\n\n## Report — do not write the candidate yourself\n\npost it\n\n---\n\n# Loudon\'s extra note for this lensing\n\nnote');
    expect(kept).toBe('read\n\n---\n\n# Loudon\'s extra note for this lensing\n\nnote');
    expect(stripLensReport('no report here')).toBe('no report here');
  });
});
