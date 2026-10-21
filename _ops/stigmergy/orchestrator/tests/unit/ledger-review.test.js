import { describe, test, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { proposalLines } from '../../src/ledger.js';
import { proposalsByPage, pageHeadings, sectionNow, pageReview, reviewCount, reviewLine, urgentAnswer } from '../../src/ledger-review.js';

// The review's read (Loudon, 2026-10-18: "eventually we go through the tuning
// ledgers to see what we actualy want to place in canon"): every steward's owed
// proposals, page by page, each with the words its place holds today.

const PAGE = [
  '---', 'title: "Shep"', 'type: project', 'stage: growing', '---', '',
  '# Shep', '',
  '## What Exists', '',
  '- A Shepard tone in the browser.', '- A Max patch nobody opened.', '',
  '### Inside it', '', 'An inner part.', '',
  '## Implementation Status (March 2026)', '',
  'Key implementation decisions:', '- one', '',
  '```', '## not a heading', '```', '',
  '## Forward Vector', '', 'First move: a sketch.', '',
].join('\n');

describe('a place, as the page reads it now', () => {
  test('headings are read in file order, and a fenced line is not one', () => {
    expect(pageHeadings(PAGE).map((h) => [h.level, h.text])).toEqual([
      [1, 'Shep'], [2, 'What Exists'], [3, 'Inside it'], [2, 'Implementation Status (March 2026)'], [2, 'Forward Vector'],
    ]);
  });

  test('a place opening with a heading names that section, to the next heading at its level', () => {
    const s = sectionNow(PAGE, "§ What Exists, new bullet after 'A Shepard tone'");
    expect(s).toMatchObject({ kind: 'section', heading: 'What Exists', level: 2 });
    expect(s.text).toContain('- A Max patch nobody opened.');
    expect(s.text).toContain('An inner part.');
    expect(s.text).not.toContain('Key implementation');
    expect(sectionNow(PAGE, "§ Forward Vector: replace the paragraph that begins 'First move'").text).toBe('First move: a sketch.');
    expect(sectionNow(PAGE, '§ Inside it').text).toBe('An inner part.');
  });

  test("a place may name a heading by its opening words, and the frontmatter by name", () => {
    expect(sectionNow(PAGE, "§ Implementation Status, end of the 'Key implementation decisions' list")).toMatchObject({ heading: 'Implementation Status (March 2026)' });
    expect(sectionNow(PAGE, 'frontmatter, stage')).toMatchObject({ kind: 'frontmatter' });
    expect(sectionNow(PAGE, 'frontmatter').text).toContain('stage: growing');
  });

  test('a place the page does not have reads as nothing, never as a guess', () => {
    expect(sectionNow(PAGE, '§ Gotchas')).toBe(null);
    expect(sectionNow(PAGE, 'the end of the page')).toBe(null);
    expect(sectionNow(PAGE, '')).toBe(null);
    expect(sectionNow('no frontmatter here', 'frontmatter')).toBe(null);
  });
});

describe("the review's read across the palace", () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

  const by = (cycle) => `proposed by the steward, cycle ${cycle}`;
  const palace = () => {
    root = mkdtempSync(path.join(tmpdir(), 'ledger-review-'));
    mkdirSync(path.join(root, 'Projects/Shep'), { recursive: true });
    mkdirSync(path.join(root, 'Shop/Shopkeeper'), { recursive: true });
    writeFileSync(path.join(root, 'Projects/Shep.md'), PAGE);
    writeFileSync(path.join(root, 'Projects/Shep/Shep — tuning.md'), [
      '# Shep — tuning', '',
      ...proposalLines(2, { page: 'Shep', path: 'Projects/Shep.md', entry: true, exists: true, place: '§ What Exists, new bullet', words: '- The Singer.', why: 'it is built', date: '2026-10-20', by: by(22) }),
      ...proposalLines(4, { page: 'Shep', path: 'Projects/Shep.md', entry: true, exists: true, place: '§ Forward Vector: replace it', words: 'The sketch is done.', why: 'the plan moved', date: '2026-10-21', by: by(23) }),
      '5. **Proposed for canon** · 2026-10-19 · [[Shep]] · — · declined on 2026-10-21 09:00: not its job', '   Why: old', '   > x', '',
    ].join('\n'));
    writeFileSync(path.join(root, 'Shop/Shopkeeper/Shopkeeper — tuning.md'), [
      '# Shopkeeper — tuning', '',
      ...proposalLines(1, { page: 'FLUX (Hugging Face)', path: 'Shop/FLUX (Hugging Face).md', entry: true, exists: true, place: '§ Gotchas', words: '2026-10-18 — FLUX 3 is out.', why: 'the pin is a generation behind', date: '2026-10-21', by: by(41), urgent: true, ask: 'shop-msg-urgent-1' }),
      ...proposalLines(2, { page: 'OCR Smith', path: null, entry: false, exists: false, place: '', words: 'A new Specialist.', why: 'it cleared the bar', date: '2026-10-19', by: by(40) }),
      '',
    ].join('\n'));
    return root;
  };

  test('owed proposals group by the page they would change; urgent pages lead, then the oldest', () => {
    const pages = proposalsByPage(palace());
    expect(pages.map((g) => [g.page, g.items.map((p) => p.n), g.oldest, g.urgent, g.stewards])).toEqual([
      ['FLUX (Hugging Face)', ['1'], '2026-10-21', 1, ['Shopkeeper']],
      ['OCR Smith', ['2'], '2026-10-19', 0, ['Shopkeeper']],
      ['Shep', ['2', '4'], '2026-10-20', 0, ['Shep']],
    ]);
    expect(pages[1]).toMatchObject({ path: null, exists: false });
  });

  test("a page's card gives each item the words its place holds now", () => {
    const r = palace();
    const shep = pageReview(r, proposalsByPage(r).find((g) => g.page === 'Shep'));
    expect(shep.readable).toBe(true);
    expect(shep.items.map((p) => [p.n, p.now && p.now.heading, p.words])).toEqual([
      ['2', 'What Exists', '- The Singer.'],
      ['4', 'Forward Vector', 'The sketch is done.'],
    ]);
    expect(shep.items[1].now.text).toBe('First move: a sketch.');
    const ocr = pageReview(r, proposalsByPage(r).find((g) => g.page === 'OCR Smith'));
    expect(ocr).toMatchObject({ readable: false });
    expect(ocr.items[0].now).toBe(null);
    const flux = pageReview(r, proposalsByPage(r).find((g) => g.page === 'FLUX (Hugging Face)'));
    expect(flux).toMatchObject({ readable: false }); // its page is not in this palace
  });

  // An urgent proposal also asked on the board (Loudon, 2026-10-21): LAND-NOW
  // is his yes to the words, paid when it lands; DECLINE or a deny declines it
  // with his note; REVIEW leaves it with the rest.
  test("an urgent item carries what Loudon already said to its ask, the latest answer first", () => {
    const r = palace();
    const flux = proposalsByPage(r).find((g) => g.page === 'FLUX (Hugging Face)').items[0];
    const answer = (type, option, notes, ts) => ({ id: `resp-${ts}`, ts, type, board: 'TRICKSTER', from: 'TRICKSTER', re: 'shop-msg-urgent-1', payload: { option_id: option, notes } });
    expect(urgentAnswer(flux, [])).toBe(null);
    expect(urgentAnswer(flux, [answer('RESOURCE_GRANT', 'LAND-NOW', '', '2026-10-21T10:00:00Z')])).toMatchObject({ option: 'LAND-NOW', ts: '2026-10-21T10:00:00Z' });
    expect(urgentAnswer(flux, [answer('RESOURCE_GRANT', 'review', '', '2026-10-21T10:00:00Z'), answer('RESOURCE_GRANT', 'DECLINE', 'probe Klein first', '2026-10-21T11:00:00Z')]))
      .toMatchObject({ option: 'DECLINE', notes: 'probe Klein first' });
    expect(urgentAnswer(flux, [answer('RESOURCE_DENY', undefined, 'not this', '2026-10-21T10:00:00Z')])).toMatchObject({ option: 'DECLINE', notes: 'not this' });
    expect(urgentAnswer({ ...flux, urgent: false }, [answer('RESOURCE_GRANT', 'LAND-NOW', '', 'x')])).toBe(null);
    const card = pageReview(r, proposalsByPage(r).find((g) => g.page === 'FLUX (Hugging Face)'), { board: [answer('RESOURCE_GRANT', 'LAND-NOW', '', '2026-10-21T10:00:00Z')] });
    expect(card.items[0].answer).toMatchObject({ option: 'LAND-NOW' });
  });

  test('the one line says how many, on how many pages, the urgent first, and the oldest', () => {
    const c = reviewCount(palace());
    expect(c).toEqual({ owed: 4, pages: 3, urgent: 1, oldest: '2026-10-19' });
    expect(reviewLine(c)).toBe('1 urgent proposal and 3 more for canon owed on 3 pages, the oldest from 2026-10-19.');
    expect(reviewLine({ owed: 1, pages: 1, urgent: 0, oldest: '2026-10-20' })).toBe('1 proposal for canon owed on 1 page, the oldest from 2026-10-20.');
    expect(reviewLine({ owed: 2, pages: 1, urgent: 2, oldest: '2026-10-20' })).toBe('2 urgent proposals for canon owed on 1 page, the oldest from 2026-10-20.');
    expect(reviewLine(reviewCount(path.join(root, 'nowhere')))).toBe('No proposals for canon are owed.');
  });
});
