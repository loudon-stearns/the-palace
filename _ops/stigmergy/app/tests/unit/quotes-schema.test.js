// The placement schema: the anchor rule (a `near` phrase must be on the page),
// the honesty fields (fidelity · checked), the ledger fold (append-only, a
// retirement lands on its placement). One source for the placer, the server
// and the reader — so this is where the rule is pinned.

import { describe, it, expect } from 'vitest';
import {
  normalize, bodyBlocks, findNear, validatePlacement, foldLedger, parseLedger, newId,
  fidelityGlyph, fidelityLabel, STATUSES, MODES, decisionLine, validateDecision, ledgerHeader, statusLabel,
} from '../../../../quotes/schema.mjs';

const BODY = `# Kuramoto Coupling

![[Kuramoto Coupling — hero.png]]

The Kuramoto model describes how populations of oscillators **synchronize** when
coupling exceeds a threshold. See [[Threshold Conatus|the threshold]].

\`\`\`js
const near = 'this phrase is inside a code fence';
\`\`\`

<!-- graffiti: this phrase is inside a comment -->

## Origin

> Studied across an *8-lesson* series, building from two oscillators.

- first item with the word emergence
- second item
`;

describe('normalize', () => {
  it('flattens emphasis, wikilinks, curly quotes and whitespace', () => {
    expect(normalize('**bold** and *it*  and `code`')).toBe('bold and it and code');
    expect(normalize('see [[Threshold Conatus|the threshold]]')).toBe('see threshold conatus');
    expect(normalize('don’t “quote”')).toBe('don\'t "quote"');
    expect(normalize(null)).toBe('');
  });
});

describe('bodyBlocks', () => {
  it('splits prose blocks under their heading and skips fences and comments', () => {
    const blocks = bodyBlocks(BODY);
    const texts = blocks.map((b) => b.text);
    expect(texts.some((t) => t.includes('inside a code fence'))).toBe(false);
    expect(texts.some((t) => t.includes('inside a comment'))).toBe(false);
    const origin = blocks.find((b) => b.kind === 'block' && b.text.includes('8-lesson'));
    expect(origin.heading).toBe('Origin');
    const list = blocks.find((b) => b.text.includes('emergence'));
    expect(list.text).toContain('second item');
  });
});

describe('findNear', () => {
  it('finds a phrase through markdown and reports the heading and an excerpt', () => {
    const a = findNear(BODY, 'populations of oscillators synchronize when coupling');
    expect(a.found).toBe(true);
    expect(a.heading).toBe('Kuramoto Coupling');
    expect(a.excerpt).toContain('Kuramoto model');
  });
  it('matches a phrase written plain against a wikilinked original', () => {
    expect(findNear(BODY, 'See threshold conatus').found).toBe(true);
  });
  it('never anchors to a code fence, a comment, or a heading', () => {
    expect(findNear(BODY, 'inside a code fence').found).toBe(false);
    expect(findNear(BODY, 'inside a comment').found).toBe(false);
    expect(findNear(BODY, 'Origin').found).toBe(false);
  });
  it('is honest about an empty phrase', () => {
    expect(findNear(BODY, '').found).toBe(false);
  });
});

const GOOD = {
  quote: 'Each thing, as far as it can by its own power, strives to persevere in its being.',
  attribution: 'Spinoza',
  source: { kind: 'tradition', work: 'Ethics', locus: 'III, P6', translator: 'Curley' },
  fidelity: 'translation',
  checked: 'web',
  lens: 'Spinoza Conatus',
  target: 'Kuramoto Coupling',
  near: 'populations of oscillators synchronize',
  why: 'The threshold is where a striving meets another and both are increased.',
};

describe('validatePlacement', () => {
  it('accepts a complete placement anchored to words on the page', () => {
    const v = validatePlacement(GOOD, { targetBody: BODY, lensFound: true });
    expect(v.ok).toBe(true);
    expect(v.errors).toEqual([]);
    expect(v.anchor.found).toBe(true);
  });
  it('refuses a near phrase that is not on the page', () => {
    const v = validatePlacement({ ...GOOD, near: 'words that are not here' }, { targetBody: BODY, lensFound: true });
    expect(v.ok).toBe(false);
    expect(v.errors.join(' ')).toMatch(/not on "Kuramoto Coupling"/);
  });
  it('refuses a missing target, a missing lens, a page as its own glass', () => {
    expect(validatePlacement(GOOD, { targetBody: null, lensFound: true }).errors.join(' ')).toMatch(/no palace entry named "Kuramoto Coupling"/);
    expect(validatePlacement(GOOD, { targetBody: BODY, lensFound: false }).errors.join(' ')).toMatch(/no palace entry named "Spinoza Conatus"/);
    expect(validatePlacement({ ...GOOD, lens: 'Kuramoto Coupling' }, { targetBody: BODY }).errors.join(' ')).toMatch(/own glass/);
  });
  it('insists on the honesty fields and a why', () => {
    const v = validatePlacement({ ...GOOD, fidelity: 'exact', checked: 'trust me', why: '' }, { targetBody: BODY });
    expect(v.errors.join(' ')).toMatch(/fidelity/);
    expect(v.errors.join(' ')).toMatch(/checked/);
    expect(v.errors.join(' ')).toMatch(/why/);
  });
  it('knows the two ways a voice is found, and holds a new voice to a web check with its source kept', () => {
    expect(MODES).toEqual(['open', 'roster']);
    expect(validatePlacement({ ...GOOD, mode: 'sideways' }, { targetBody: BODY }).errors.join(' ')).toMatch(/mode/);
    expect(validatePlacement({ ...GOOD, mode: 'open' }, { targetBody: BODY }).ok).toBe(true);
    const unverified = validatePlacement({ ...GOOD, new_voice: true, checked: 'recalled' }, { targetBody: BODY });
    expect(unverified.ok).toBe(false);
    expect(unverified.errors.join(' ')).toMatch(/checked on the web/);
    expect(unverified.errors.join(' ')).toMatch(/source\.url/);
    const withUrl = validatePlacement({ ...GOOD, new_voice: true, checked: 'web', source: { ...GOOD.source, url: 'https://example.org/ethics' } }, { targetBody: BODY });
    expect(withUrl.ok).toBe(true);
    expect(validatePlacement({ ...GOOD, source: { ...GOOD.source, url: 'not a link' } }, { targetBody: BODY }).errors.join(' ')).toMatch(/source\.url/);
  });
  it('warns, without refusing, on a verbatim quote from memory and a translation without a translator', () => {
    const v = validatePlacement({ ...GOOD, fidelity: 'verbatim', checked: 'recalled' }, { targetBody: BODY });
    expect(v.ok).toBe(true);
    expect(v.warnings.join(' ')).toMatch(/memory/);
    const w = validatePlacement({ ...GOOD, source: { kind: 'tradition', work: 'Ethics' } }, { targetBody: BODY });
    expect(w.ok).toBe(true);
    expect(w.warnings.join(' ')).toMatch(/translator/);
  });
});

describe('the ledger', () => {
  it('parses leniently and folds a retirement onto its placement', () => {
    const text = [
      JSON.stringify({ id: 'q-1', quote: 'a', status: 'placed' }),
      'not json',
      '',
      JSON.stringify({ id: 'q-2', quote: 'b', status: 'placed' }),
      JSON.stringify({ id: 'q-1', status: 'retired', retired_why: 'moved' }),
    ].join('\n');
    const { lines, skipped } = parseLedger(text);
    expect(skipped).toHaveLength(1);
    const folded = foldLedger(lines);
    expect(folded.map((q) => q.id)).toEqual(['q-1', 'q-2']);
    expect(folded[0]).toMatchObject({ quote: 'a', status: 'retired', retired_why: 'moved' });
  });
  it('mints ids that read as a date and never collide for one second', () => {
    const now = new Date('2026-10-13T10:00:00Z');
    let i = 0;
    const rng = () => [0.1, 0.9][i++ % 2];
    const a = newId(now, rng);
    const b = newId(now, rng);
    expect(a).toMatch(/^q-20261013-[0-9a-z]{6}$/);
    expect(a).not.toBe(b);
  });
});

describe('a decision', () => {
  it('knows three standings and two decisions', () => {
    expect(STATUSES).toEqual(['placed', 'kept', 'retired']);
    expect(validateDecision({ id: 'q-1', decision: 'keep' }).ok).toBe(true);
    expect(validateDecision({ id: '', decision: 'keep' }).ok).toBe(false);
    expect(validateDecision({ id: 'q-1', decision: 'maybe' }).errors.join(' ')).toMatch(/decision/);
    expect(statusLabel('placed')).toBe('awaiting your read');
  });
  it('writes a keep or a let-go line that folds onto the placement, and a keep after a let-go revives it', () => {
    const now = new Date('2026-10-13T12:00:00Z');
    const keep = decisionLine('q-1', 'keep', { now });
    expect(keep).toMatchObject({ id: 'q-1', status: 'kept', decided_by: 'loudon' });
    expect(keep.kept_at).toBe('2026-10-13T12:00:00.000Z');
    const go = decisionLine('q-1', 'retire', { now, why: 'off key' });
    expect(go).toMatchObject({ id: 'q-1', status: 'retired', retired_why: 'off key' });
    expect(decisionLine('q-1', 'retire', { now }).retired_why).toBe('let go by loudon');
    const folded = foldLedger([{ id: 'q-1', quote: 'a', status: 'placed' }, go, keep]);
    expect(folded[0].status).toBe('kept');
    expect(folded[0].retired_why).toBe('off key'); // the history stays on the record
  });
  it('passes over the ledger header, which carries the bundle-file minimum and no id', () => {
    const h = ledgerHeader('Palace Quotes', '2026-10-13');
    expect(h.title).toBe('Palace Quotes — placements');
    expect(h.links[0].target).toBe('[[Palace Quotes]]');
    expect(typeof h.forward_vector).toBe('string');
    expect(foldLedger([h, { id: 'q-1', quote: 'a' }])).toHaveLength(1);
  });
});

describe('the fidelity glyph', () => {
  it('reads ◉ checked verbatim · ◐ checked but not verbatim · ◇ unconfirmed', () => {
    expect(fidelityGlyph('verbatim', 'web')).toBe('◉');
    expect(fidelityGlyph('translation', 'web')).toBe('◐');
    expect(fidelityGlyph('verbatim', 'palace')).toBe('◉');
    expect(fidelityGlyph('verbatim', 'recalled')).toBe('◇');
    expect(fidelityGlyph('paraphrase', 'partial')).toBe('◇');
    expect(fidelityLabel('translation', 'web')).toBe('translation · checked on the web');
  });
});
