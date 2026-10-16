import { describe, test, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  parseRunLine, parseRuns, runLine, parseOrders, orderLine, appendLedgerLine, payOrders,
  normVersion, parseOwed, parseLatestLesson, nextItemNumber, tailRead, recordRun, lastRunDate,
  bodyLead, ledgerBody, readStandards, isPrivateLedger, lastEncounter, readDiaryState, readTuningState,
  listTuningLedgers, localDate, growTuningLedger, stewardLedgerText,
} from '../../src/ledger.js';

describe('run lines', () => {
  test('a run line reads as date, version, what it ran on, and what it taught', () => {
    expect(parseRunLine('- run · 2026-09-25 · v1.1 · close-2026-09-25-ceremonies · taught item 31')).toEqual({
      date: '2026-09-25', version: '1.1', what: 'close-2026-09-25-ceremonies', outcome: 'taught item 31',
    });
    expect(parseRunLine('- run · 2026-04-01 · v2 · full · nothing new').version).toBe('2.0');
  });

  test('the four-field shape reads too, with nothing for what it ran on', () => {
    expect(parseRunLine('- run · 2026-09-25 · v1.1 · nothing new')).toEqual({ date: '2026-09-25', version: '1.1', what: '', outcome: 'nothing new' });
  });

  test('a page with no version leaves the field out, and a "what" is never read as one', () => {
    expect(parseRunLine('- run · 2026-10-15 · cycle 38 · nothing new')).toEqual({ date: '2026-10-15', version: null, what: 'cycle 38', outcome: 'nothing new' });
    expect(parseRunLine('- run · 2026-10-15 · nothing new')).toEqual({ date: '2026-10-15', version: null, what: '', outcome: 'nothing new' });
    expect(parseRunLine('- run · 2026-10-15 · 2D Torus, the hero · nothing new').version).toBe(null);
    expect(parseRunLine('- run · 2026-10-15 · 2D · nothing new')).toMatchObject({ version: null, what: '2D' });
    expect(parseRunLine('- run · 2026-10-15 · 1.2 · a · nothing new')).toMatchObject({ version: '1.2', what: 'a' });
  });

  test('only a line that starts with the prefix is a run', () => {
    expect(parseRunLine('  - run · 2026-09-25 · v1.1 · nothing new')).toBe(null);
    expect(parseRunLine('31. **A run · 2026-09-25 · v1.1** taught this.')).toBe(null);
    expect(parseRunLine('- from Loudon · 2026-09-25 · Ask first. · owed')).toBe(null);
  });

  test('runLine writes what the parser reads, and keeps its own separator out of the what field', () => {
    const line = runLine({ date: '2026-09-25', version: '1.0', what: 'Palace Ceremonies · review', outcome: 'nothing new' });
    expect(line).toBe('- run · 2026-09-25 · v1.0 · Palace Ceremonies, review · nothing new');
    expect(parseRunLine(line).what).toBe('Palace Ceremonies, review');
    const bare = runLine({ date: '2026-10-15', what: 'cycle 38' });
    expect(bare).toBe('- run · 2026-10-15 · cycle 38 · nothing new');
    expect(parseRunLine(bare)).toEqual({ date: '2026-10-15', version: null, what: 'cycle 38', outcome: 'nothing new' });
  });

  test('keys come from the line, and a second identical line gets its own', () => {
    const runs = parseRuns(['# x', '- run · 2026-09-25 · v1.0 · nothing new', 'prose', '- run · 2026-09-25 · v1.0 · nothing new', '- run · 2026-09-26 · v1.0 · a · nothing new'].join('\n'));
    expect(runs.map((r) => r.index)).toEqual([1, 3, 4]);
    expect(runs[0].key).toMatch(/^run-[0-9a-f]{10}$/);
    expect(runs[1].key).toBe(`${runs[0].key}-2`);
    expect(new Set(runs.map((r) => r.key)).size).toBe(3);
    // the key survives a reorder (a union merge can interleave lines)
    const again = parseRuns('- run · 2026-09-26 · v1.0 · a · nothing new\n- run · 2026-09-25 · v1.0 · nothing new');
    expect(again.find((r) => r.date === '2026-09-26').key).toBe(runs[2].key);
  });

  test('when it last ran is computed from the run lines — what last_tested used to keep by hand', () => {
    expect(lastRunDate('- run · 2026-09-25 · v1 · a · nothing new\n- run · 2026-10-02 · v1 · b · nothing new\n- run · 2026-09-30 · v1 · c · nothing new')).toBe('2026-10-02');
    expect(lastRunDate('no runs')).toBe(null);
  });
});

describe('orders from Loudon', () => {
  test('an order is his words on one line, owed until a run says otherwise', () => {
    expect(orderLine('2026-09-25', '  Ask before adding\na probe.  ')).toBe('- from Loudon · 2026-09-25 · Ask before adding a probe. · owed');
    const orders = parseOrders([
      '- from Loudon · 2026-09-25 · Ask before adding a probe. · owed',
      '- from Loudon · 2026-09-26 · Keep it short · even the card. · paid in item 32',
    ].join('\n'));
    expect(orders).toEqual([
      { date: '2026-09-25', text: 'Ask before adding a probe.', status: 'owed', owed: true },
      { date: '2026-09-26', text: 'Keep it short · even the card.', status: 'paid in item 32', owed: false },
    ]);
  });

  test('a union merge that keeps both forms of a paid line reads as paid', () => {
    const orders = parseOrders([
      '- from Loudon · 2026-09-25 · Ask first. · paid in item 32',
      '- from Loudon · 2026-09-25 · Ask first. · owed',
    ].join('\n'));
    expect(orders).toEqual([{ date: '2026-09-25', text: 'Ask first.', status: 'paid in item 32', owed: false }]);
  });

  test('the owed grep of the tail read finds an order line', () => {
    expect(/\bowed\b/i.test(orderLine('2026-09-25', 'x'))).toBe(true);
  });

  describe('on disk', () => {
    let dir;
    afterEach(() => { if (dir) rmSync(dir, { recursive: true, force: true }); dir = null; });
    const ledger = (text) => { dir = mkdtempSync(path.join(tmpdir(), 'ledger-')); const p = path.join(dir, 'X — tuning.md'); writeFileSync(p, text); return p; };

    test('after a list item it joins the list; after prose it opens one', () => {
      const a = ledger('31. **An item.** Spec change owed.\n');
      appendLedgerLine(a, '- run · 2026-09-25 · v1.1 · nothing new');
      expect(readFileSync(a, 'utf8')).toBe('31. **An item.** Spec change owed.\n- run · 2026-09-25 · v1.1 · nothing new\n');
      const b = ledger('No items yet.');
      appendLedgerLine(b, '- run · 2026-09-25 · v1.0 · nothing new');
      expect(readFileSync(b, 'utf8')).toBe('No items yet.\n\n- run · 2026-09-25 · v1.0 · nothing new\n');
      const c = ledger('No items yet.\n\n');
      appendLedgerLine(c, '- run · 2026-09-25 · v1.0 · nothing new');
      expect(readFileSync(c, 'utf8')).toBe('No items yet.\n\n- run · 2026-09-25 · v1.0 · nothing new\n');
    });

    test('a run that acts on an order pays it in place, by date or by its words', () => {
      const p = ledger([
        '- from Loudon · 2026-10-01 · Re-render the marimba\'s top octave once. · owed',
        '- from Loudon · 2026-10-02 · Widen the pool to five takes. · owed',
        '- from Loudon · 2026-10-03 · Already done. · paid in item 4',
        '',
      ].join('\n'));
      expect(payOrders(p, ['re-render the marimba'], 'paid in cycle 34')).toBe(1);
      expect(payOrders(p, ['2026-10-02', '2026-10-03'], 'paid in cycle 35')).toBe(1);
      expect(payOrders(p, ['nothing matches'], 'x')).toBe(0);
      expect(parseOrders(readFileSync(p, 'utf8'))).toEqual([
        { date: '2026-10-01', text: 'Re-render the marimba\'s top octave once.', status: 'paid in cycle 34', owed: false },
        { date: '2026-10-02', text: 'Widen the pool to five takes.', status: 'paid in cycle 35', owed: false },
        { date: '2026-10-03', text: 'Already done.', status: 'paid in item 4', owed: false },
      ]);
    });

    test('recordRun writes the run line, and a lesson as a numbered item the line names', () => {
      const p = ledger('---\ntitle: "X — tuning"\nledger: tuning\nstandards:\n  for: what X learns\n---\n\n# X — tuning\n\n## From the first run — 2026-09-01\n\n1. **A lesson.**\n4a. **A sub-item.**\n- run · 2026-09-01 · first · taught item 1\n');
      expect(recordRun(p, { date: '2026-10-15', what: 'cycle 37' })).toEqual({ line: '- run · 2026-10-15 · cycle 37 · nothing new', items: [] });
      const r = recordRun(p, { date: '2026-10-15', version: '1.0', what: 'cycle 38', lessons: ['Velocity layers thin; widen the pool.', '  '], by: 'offered by the steward, cycle 38' });
      expect(r).toEqual({ line: '- run · 2026-10-15 · v1.0 · cycle 38 · taught item 5', items: [5] });
      const text = readFileSync(p, 'utf8');
      expect(text.endsWith([
        '- run · 2026-10-15 · cycle 37 · nothing new',
        '',
        '## From cycle 38 — 2026-10-15',
        '',
        '5. Velocity layers thin; widen the pool. *(offered by the steward, cycle 38)*',
        '- run · 2026-10-15 · v1.0 · cycle 38 · taught item 5',
        '',
      ].join('\n'))).toBe(true);
      expect(recordRun(p, { date: '2026-10-16', what: 'two', lessons: ['a', 'b'] }).line).toBe('- run · 2026-10-16 · two · taught items 6, 7');
    });
  });
});

describe('ledger reading', () => {
  const LEDGER = [
    '---', 'title: "Foo — tuning"', 'ledger: tuning', 'standards:', '  for: what Foo learns', '  read: the tail, plus every line not yet paid', '---',
    '# Foo — tuning', '',
    '## From the first run — 2026-09-01', '',
    '1. **A lesson that landed.** Forced: step 2 (`abc`).',
    '2. **An already-landed deposit reads as still-owed** without the column.',
    '3. **A debt.** Spec change owed: the card catches up.',
    '4. **An old debt.** Spec change still owed: Step 1c.',
    '5. **A paid debt.** Paid in v2.0; the spec change owed was made.',
    '', '## From the second run — 2026-09-20', '',
    '6. **The newest.** No spec change.',
    '7. **A trap.** **Owed:** step 6 says where canon waits.',
    '8. **A second baton can\'t take a qualifier.** Owed — it is item 6\'s family.',
    '9. **Two traps.** Two fixes owed: (a) one, (b) two.',
    '10. **Prose.** Step 0 reads the four owed changes first.',
  ].join('\n');

  test('owed means the ledger says so as a status, not the word in passing, and paid clears it', () => {
    expect(parseOwed(LEDGER).map((o) => o.n)).toEqual(['3', '4', '7', '8', '9']);
  });

  test('the latest lesson is the last heading and the last item; the next number follows the largest', () => {
    expect(parseLatestLesson(LEDGER)).toEqual({ heading: 'From the second run — 2026-09-20', item: '10' });
    expect(nextItemNumber(LEDGER)).toBe(11);
    expect(nextItemNumber('')).toBe(1);
  });

  test('a ledger says how it is kept in its frontmatter, and the body reads without it', () => {
    expect(readStandards(LEDGER)).toEqual({ ledger: 'tuning', standards: { for: 'what Foo learns', read: 'the tail, plus every line not yet paid' } });
    expect(ledgerBody(LEDGER).startsWith('# Foo — tuning')).toBe(true);
    expect(isPrivateLedger(LEDGER)).toBe(false);
    expect(isPrivateLedger('---\nledger: diary\nstandards:\n  kept: "private: the main checkout only"\n---\n')).toBe(true);
  });

  test('the tail read: the last lines with run lines set aside, plus every owed line, never the frontmatter', () => {
    const text = [LEDGER, '- run · 2026-09-20 · v1 · second · taught item 6', '- from Loudon · 2026-09-21 · Ask first. · owed', ''].join('\n');
    const { recent, owed } = tailRead(text, 4);
    expect(recent).toEqual(['8. **A second baton can\'t take a qualifier.** Owed — it is item 6\'s family.', '9. **Two traps.** Two fixes owed: (a) one, (b) two.', '10. **Prose.** Step 0 reads the four owed changes first.', '- from Loudon · 2026-09-21 · Ask first. · owed']);
    expect(owed.map((o) => o.text.slice(0, 12))).toEqual(['2. **An alre', '3. **A debt.', '4. **An old ', '5. **A paid ', '7. **A trap.']);
    expect(owed.every((o) => !/standards|read:/.test(o.text))).toBe(true);   // "not yet paid" in standards never lands
    expect(text.split('\n')[owed[1].line - 1]).toBe(owed[1].text);          // line numbers are the file's
  });

  test('normVersion reads a reformat as no change', () => {
    expect(normVersion(2)).toBe('2.0');
    expect(normVersion('"2.0"')).toBe('2.0');
    expect(normVersion('1.1')).toBe('1.1');
    expect(normVersion(undefined)).toBe(null);
  });

  test('bodyLead skips trailers', () => {
    expect(bodyLead('The first paragraph\nwraps here.\n\nSecond.\n\nPalace-Kind: edit\nPalace-Verify: verified')).toBe('The first paragraph wraps here.');
    expect(bodyLead('Palace-Kind: edit')).toBe('');
  });

  test('localDate is the calendar date on this machine', () => {
    const d = new Date(2026, 9, 15, 23, 30);
    expect(localDate(d)).toBe('2026-10-15');
  });
});

describe('diaries', () => {
  test('the last encounter is the newest heading or dated line, whichever shape the diary keeps', () => {
    expect(lastEncounter('---\nledger: diary\n---\n# D\n\n## Encounter 1 — a talk · 2026-07-01\n\nx\n\n## Encounter 2 — a walk · 2026-07-02\n\ny\n'))
      .toEqual({ date: '2026-07-02', text: 'Encounter 2 — a walk · 2026-07-02' });
    expect(lastEncounter('# D\n\n- 2026-10-14 · Kuramoto Coupling · arrived "tired"\n- 2026-10-15 · The Shop · arrived "—"\n'))
      .toEqual({ date: '2026-10-15', text: 'The Shop · arrived "—"' });
    expect(lastEncounter('# nothing yet')).toBe(null);
  });

  describe('on a page', () => {
    let root;
    afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });
    function palace(kept) {
      root = mkdtempSync(path.join(tmpdir(), 'palace-diary-'));
      mkdirSync(path.join(root, 'People/Brian Eno'), { recursive: true });
      writeFileSync(path.join(root, 'People/Brian Eno.md'), '---\ntitle: "Brian Eno"\ntype: person\n---\n# Eno\n');
      writeFileSync(path.join(root, 'People/Brian Eno/Brian Eno — diary.md'), `---\nledger: diary\nstandards:\n  for: his memory\n  kept: ${kept}\n---\n\n## Encounter 3 — a walk · 2026-07-02\n`);
      return root;
    }

    test('a tracked diary shows its last encounter', () => {
      palace('git');
      expect(readDiaryState(root, 'Brian Eno')).toEqual({ path: 'People/Brian Eno/Brian Eno — diary.md', private: false, readable: true, last: { date: '2026-07-02', text: 'Encounter 3 — a walk · 2026-07-02' } });
      expect(readDiaryState(root, 'Nobody')).toBe(null);
    });

    test('a private diary is read only into a scroll that stays on this machine too', () => {
      palace('"private: on this machine only"');
      expect(readDiaryState(root, 'Brian Eno')).toMatchObject({ private: true, readable: false, last: null });
      expect(readDiaryState(root, 'Brian Eno', { scrollPrivate: true })).toMatchObject({ private: true, readable: true, last: { date: '2026-07-02' } });
    });
  });
});

describe('where ledgers live', () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

  test('every tuning ledger in its own page\'s bundle is listed; a stray or archived one is not', () => {
    root = mkdtempSync(path.join(tmpdir(), 'palace-ledgers-'));
    for (const d of ['Shop/Hero and Avatar Maker', '_ops/Walk Ceremony', 'Misc', 'Old/Archive/Old']) mkdirSync(path.join(root, d), { recursive: true });
    writeFileSync(path.join(root, 'Shop/Hero and Avatar Maker.md'), '---\ntitle: "Hero and Avatar Maker"\ntype: maker\n---\n');
    writeFileSync(path.join(root, 'Shop/Hero and Avatar Maker/Hero and Avatar Maker — tuning.md'), '# t\n');
    writeFileSync(path.join(root, '_ops/Walk Ceremony/Walk Ceremony — tuning.md'), '# t\n');
    writeFileSync(path.join(root, 'Misc/Someone Else — tuning.md'), '# not in its own bundle\n');
    writeFileSync(path.join(root, 'Old/Archive/Old/Old — tuning.md'), '# archived\n');
    expect(listTuningLedgers(root)).toEqual([
      { title: 'Hero and Avatar Maker', tuning: 'Shop/Hero and Avatar Maker/Hero and Avatar Maker — tuning.md' },
      { title: 'Walk Ceremony', tuning: '_ops/Walk Ceremony/Walk Ceremony — tuning.md' },
    ]);
    // A page with no version still has a tuning state: runs, with nothing to count since.
    writeFileSync(path.join(root, 'Shop/Hero and Avatar Maker/Hero and Avatar Maker — tuning.md'), '# t\n\n- run · 2026-10-15 · Kuramoto Coupling, hero · nothing new\n');
    const st = readTuningState(root, 'Hero and Avatar Maker');
    expect(st).toMatchObject({ version: null, spec: null, runs_since: [], tuning: 'Shop/Hero and Avatar Maker/Hero and Avatar Maker — tuning.md' });
    expect(st.runs.map((r) => r.what)).toEqual(['Kuramoto Coupling, hero']);
    expect(readTuningState(root, 'Nobody')).toBe(null);
  });
});

describe("growing a steward's ledger", () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

  test('it lands in the bundle with its standards stated, never saying owed, and never overwrites', () => {
    root = mkdtempSync(path.join(tmpdir(), 'ledger-grow-'));
    writeFileSync(path.join(root, 'Foo.md'), '---\ntitle: Foo\n---\n# Foo');
    const p = growTuningLedger(root, 'Foo', { date: '2026-10-16' });
    expect(p).toBe(path.join(root, 'Foo', 'Foo — tuning.md'));
    const text = readFileSync(p, 'utf8');
    const { ledger, standards } = readStandards(text);
    expect(ledger).toBe('tuning');
    expect(standards).toMatchObject({ run: 'one steward cycle', merge: 'union', kept: 'git', trim: 'never' });
    expect(JSON.stringify(standards)).not.toMatch(/\bowed\b/i);
    expect(tailRead(text).owed).toEqual([]);
    expect(parseRuns(text)).toEqual([]);
    writeFileSync(p, 'kept');
    expect(growTuningLedger(root, 'Foo', { date: '2026-10-17' })).toBe(p);
    expect(readFileSync(p, 'utf8')).toBe('kept');
    expect(growTuningLedger(root, 'Nobody', { date: '2026-10-17' })).toBe(null);
    expect(stewardLedgerText('Foo', '2026-10-16')).toContain('title: "Foo — tuning"');
  });
});
