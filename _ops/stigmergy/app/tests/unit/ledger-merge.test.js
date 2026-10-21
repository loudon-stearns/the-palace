// What git's union merge made of a ledger that neither side had
// (src/lib/ledger-merge.js), on small texts shaped like the palace's ledgers.
// The same defects on the real ledgers, landed by palace-land, are in
// tests/integration/ledger-landing.test.js.

import { describe, it, expect } from 'vitest';
import { ledgerDefects, itemKey, describeDefect } from '../../src/lib/ledger-merge.js';

const doc = (...lines) => `${lines.join('\n')}\n`;
const BASE = doc('# Tuning', '', '## From close 1', '', '1. **First.** Owed.', '- run · 2026-10-01 · v1 · close-1 · taught item 1');

describe('itemKey', () => {
  it('reads an item number at column 0 and a numbered heading', () => {
    expect(itemKey('59. **Close A.** x')).toBe('59');
    expect(itemKey('12b. **A late one.**')).toBe('12b');
    expect(itemKey('## Encounter 4 — a walk')).toBe('## Encounter 4');
    expect(itemKey('   3. indented')).toBeNull();
    expect(itemKey('## From the Wave 2 close — 2026-10-15')).toBeNull();
    expect(itemKey('- run · 2026-10-21 · v1 · x · taught item 59')).toBeNull();
  });
});

describe('ledgerDefects', () => {
  it('finds two items with one number when both sides added one', () => {
    const ours = doc(BASE.trimEnd(), '', '2. **From A.** x');
    const theirs = doc(BASE.trimEnd(), '', '2. **From B.** y');
    const merged = doc(BASE.trimEnd(), '', '2. **From A.** x', '', '2. **From B.** y');
    expect(ledgerDefects({ base: BASE, ours, theirs, merged }).refuse).toEqual([{ kind: 'twice', item: '2' }]);
  });

  it('finds an item in two forms when it was edited in place beside the other side\'s append', () => {
    const ours = doc(BASE.trimEnd(), '2. **New.** z');
    const theirs = BASE.replace('Owed.', 'Paid in item 2.');
    const merged = doc('# Tuning', '', '## From close 1', '', '1. **First.** Owed.', '- run · 2026-10-01 · v1 · close-1 · taught item 1', '2. **New.** z', '1. **First.** Paid in item 2.');
    expect(ledgerDefects({ base: BASE, ours, theirs, merged }).refuse).toEqual([{ kind: 'two-forms', item: '1' }]);
  });

  it('finds a line on neither side', () => {
    const ours = doc(BASE.trimEnd(), '- run · 2026-10-02 · v1 · close-2 · nothing new');
    const theirs = doc(BASE.trimEnd(), '- run · 2026-10-03 · v1 · close-3 · nothing new');
    const merged = doc(BASE.trimEnd(), '- run · 2026-10-02 · v1 · close-2 · nothing new- run · 2026-10-03 · v1 · close-3 · nothing new');
    const { refuse } = ledgerDefects({ base: BASE, ours, theirs, merged });
    expect(refuse).toHaveLength(1);
    expect(refuse[0].kind).toBe('neither');
  });

  it('notes a heading run on from the line above, and does not refuse it', () => {
    const ours = doc(BASE.trimEnd(), '', '## From close A', '', '2. **A.** x', '- run · a · taught item 2');
    const theirs = doc(BASE.trimEnd(), '', '## From close B', '', '3. **B.** y', '- run · b · taught item 3');
    const merged = doc(BASE.trimEnd(), '', '## From close A', '', '2. **A.** x', '- run · a · taught item 2', '## From close B', '', '3. **B.** y', '- run · b · taught item 3');
    const r = ledgerDefects({ base: BASE, ours, theirs, merged });
    expect(r.refuse).toEqual([]);
    expect(r.notes).toEqual([{ kind: 'run-on', line: '## From close B' }]);
  });

  it('passes two appends with their own numbers, and a far edit merged clean', () => {
    const ours = doc(BASE.replace('Owed.', 'Paid in item 3.').trimEnd(), '', '2. **A.** x');
    const theirs = doc(BASE.trimEnd(), '', '3. **B.** y');
    const merged = doc(BASE.replace('Owed.', 'Paid in item 3.').trimEnd(), '', '2. **A.** x', '', '3. **B.** y');
    expect(ledgerDefects({ base: BASE, ours, theirs, merged })).toEqual({ refuse: [], notes: [] });
  });

  it('never refuses a number a side already repeated', () => {
    const repeated = doc(BASE.trimEnd(), '1. **A second first.**');
    const ours = doc(repeated.trimEnd(), '2. **A.** x');
    const merged = doc(repeated.trimEnd(), '2. **A.** x');
    expect(ledgerDefects({ base: repeated, ours, theirs: repeated, merged }).refuse).toEqual([]);
  });

  it('counts numbered headings, as a diary numbers its encounters', () => {
    const base = doc('# Diary', '', '## Encounter 3 — a walk', '', 'text');
    const ours = doc(base.trimEnd(), '', '## Encounter 4 — with Cage', '', 'a');
    const theirs = doc(base.trimEnd(), '', '## Encounter 4 — with Eno', '', 'b');
    const merged = doc(base.trimEnd(), '', '## Encounter 4 — with Cage', '', 'a', '', '## Encounter 4 — with Eno', '', 'b');
    expect(ledgerDefects({ base, ours, theirs, merged }).refuse).toEqual([{ kind: 'twice', item: '## Encounter 4' }]);
  });

  it('refuses a number a merge inside the branch doubled, while it is still doubled', () => {
    // The branch merged main in after a refusal, and union doubled item 2 there.
    const main = doc(BASE.trimEnd(), '', '2. **From A.** x');
    const branch = doc(BASE.trimEnd(), '', '2. **From A.** x', '', '2. **From B.** y');
    expect(ledgerDefects({ ours: main, theirs: branch, merged: branch }).refuse).toEqual([]);
    expect(ledgerDefects({ ours: main, theirs: branch, merged: branch, carried: ['2'] }).refuse).toEqual([{ kind: 'twice', item: '2' }]);
    const settled = doc(BASE.trimEnd(), '', '2. **From A.** x', '', '3. **From B.** y');
    expect(ledgerDefects({ ours: main, theirs: settled, merged: settled, carried: ['2'] }).refuse).toEqual([]);
  });

  it('never refuses a numbered list the branch wrote on its own', () => {
    const list = doc(BASE.trimEnd(), '', 'Steps:', '1. one', '2. two', '', 'Again:', '1. one', '2. two');
    expect(ledgerDefects({ ours: BASE, theirs: list, merged: list }).refuse).toEqual([]);
  });

  it('says each defect in a phrase', () => {
    expect(describeDefect({ kind: 'twice', item: '59' })).toBe('item 59 twice (two items took the number)');
    expect(describeDefect({ kind: 'two-forms', item: '16' })).toMatch(/^item 16 in two forms/);
    expect(describeDefect({ kind: 'neither', line: 'x'.repeat(80) })).toMatch(/…"\)$/);
  });
});
