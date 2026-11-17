import { describe, test, expect } from 'vitest';
import { findQuestion, saysUnheard, senseOf, parseAnswers, cleanMarks, formatAnswerBlock, insertAnswer, proofName, ledgerLine, sectionState, staleFiles, countStates } from '../../src/lib/scroll-answers.js';
import { parseMakingSections } from '../../src/lib/scroll-view.js';

describe('findQuestion — the forms the palace writes', () => {
  test('The question: **…**', () => {
    expect(findQuestion('Measured: things.\n\nThe question: **does the walk sound like a person?**\n\n**Artifacts:**')).toBe('does the walk sound like a person?');
  });
  test('The question for your eye, mid-line after a bold lead', () => {
    expect(findQuestion('**Nobody has seen these.** The question for your eye: does it read as Loudon Live, and is the gloss too light?')).toBe('does it read as Loudon Live, and is the gloss too light?');
  });
  test('a whole bold line, for Loudon', () => {
    expect(findQuestion('**The question for Loudon: press Draw both. Do the two graphs look the same?**')).toBe('press Draw both. Do the two graphs look the same?');
  });
  test('A question for your eye and ear, closed with a full stop', () => {
    expect(findQuestion('**A question for your eye and ear.** Do the words light as the voice says them?')).toBe('Do the words light as the voice says them?');
  });
  test("the bench's line", () => {
    expect(findQuestion('What only an ear can say: is the hum too loud?')).toBe('is the hum too loud?');
  });
  test('a paragraph that is all bold and ends in a question mark', () => {
    expect(findQuestion('Numbers.\n\n**Play the first render, then the second. Would you have heard it?**\n\nNobody has heard this.')).toBe('Play the first render, then the second. Would you have heard it?');
  });
  test('prose that only mentions a question is not one', () => {
    expect(findQuestion('4. Longer than 13.5 s; the question is whether the voice drifts.\n\n**Artifacts:**')).toBeNull();
    expect(findQuestion('')).toBeNull();
  });
});

describe('saysUnheard / senseOf', () => {
  test('nobody has heard, seen, watched', () => {
    expect(saysUnheard('Nobody has heard either.')).toBe(true);
    expect(saysUnheard('Nobody but its maker has seen these.')).toBe(true);
    expect(saysUnheard('Nobody has watched or heard it.')).toBe(true);
    expect(saysUnheard('Loudon heard it on the 14th.')).toBe(false);
  });
  test('the sense follows the files', () => {
    expect(senseOf(['a/b.m4a', 'a/c.wav'])).toBe('heard');
    expect(senseOf(['a/b.png', 'a/c.html'])).toBe('seen');
    expect(senseOf(['a/b.mp4'])).toBe('heard and seen');
    expect(senseOf(['a/b.m4a', 'a/c.png'])).toBe('heard and seen');
  });
});

const FILES = { 'Shop/X/proofs/p/walk twenty.m4a': 'aaaaaaaaaaaa', 'Shop/X/proofs/p/one.m4a': 'bbbbbbbbbbbb' };
const BLOCK = formatAnswerBlock({
  date: '2026-11-17', at: '2026-11-17T10:00:00.000Z', sense: 'heard', words: 'the twenty  sound "alive",\nthe one is a machine',
  marks: [{ kind: 'pick', path: 'Shop/X/proofs/p/walk twenty.m4a', note: '' }, { kind: 'flag', path: 'Shop/X/proofs/p/one.m4a', note: 'clicks at 3 s' }],
  files: FILES,
});

describe('the answer block', () => {
  test('is written in plain words the bench can already read', () => {
    const lines = BLOCK.split('\n');
    expect(lines[0]).toMatch(/^<!-- scroll:answer by="Loudon" date="2026-11-17" at="2026-11-17T10:00:00.000Z" files="/);
    expect(lines[1]).toBe('**Heard.** Loudon, 2026-11-17: "the twenty sound \'alive\', the one is a machine"');
    expect(lines[2]).toBe('- pick · `walk twenty.m4a`');
    expect(lines[3]).toBe('- flag · `one.m4a` — "clicks at 3 s"');
    expect(lines[4]).toBe('<!-- /scroll:answer -->');
    // Shop/shop.mjs `tests` reads who has heard a proof from its scroll section with this.
    expect(BLOCK).toMatch(/\*\*(Heard|Seen)\.?\*\*[^\n]{0,80}/);
  });
  test('round-trips through parseAnswers, files and all', () => {
    const { body, answers } = parseAnswers(`Some prose.\n\n${BLOCK}\n`);
    expect(body).toBe('Some prose.');
    expect(answers).toHaveLength(1);
    expect(answers[0]).toMatchObject({ by: 'Loudon', date: '2026-11-17', sense: 'heard', words: "the twenty sound 'alive', the one is a machine", files: FILES });
    expect(answers[0].marks).toEqual([{ kind: 'pick', file: 'walk twenty.m4a', note: '' }, { kind: 'flag', file: 'one.m4a', note: 'clicks at 3 s' }]);
  });
  test('marks alone are an answer', () => {
    const b = formatAnswerBlock({ date: '2026-11-17', sense: 'seen', words: '  ', marks: [{ kind: 'pick', path: 'a/b.png', note: '' }], files: {} });
    expect(b.split('\n')[1]).toBe('**Seen.** Loudon, 2026-11-17, marks only');
    expect(parseAnswers(b).answers[0]).toMatchObject({ sense: 'seen', words: '', marks: [{ kind: 'pick', file: 'b.png', note: '' }] });
  });
  test('cleanMarks drops what is not a mark', () => {
    expect(cleanMarks([{ kind: 'pick', path: 'a.m4a' }, { kind: 'note', path: 'a.m4a', note: ' ' }, { kind: 'note', path: 'a.m4a', note: 'too\nbright' }, { kind: 'like', path: 'a.m4a' }, { kind: 'flag' }, null]))
      .toEqual([{ kind: 'pick', path: 'a.m4a', note: '' }, { kind: 'note', path: 'a.m4a', note: 'too bright' }]);
    expect(cleanMarks('x')).toEqual([]);
  });
});

const SCROLL = [
  '<!-- scroll:making:start -->',
  '<!-- scroll:entry id="test-a" -->',
  '### 2026-11-15 — Twenty steps',
  '',
  'Nobody has heard either.',
  '',
  'The question: **does it sound like walking?**',
  '',
  '**Artifacts:**',
  '- [twenty](Shop/X/proofs/p/walk twenty.m4a)',
  '- [one](Shop/X/proofs/p/one.m4a)',
  '',
  '<sub>test proof, 2026-11-15</sub>',
  '<!-- /scroll:entry -->',
  '',
  '<!-- scroll:entry id="run-b" -->',
  '### 2026-11-14 — a run line',
  'ran, nothing new',
  '<!-- /scroll:entry -->',
  '<!-- scroll:making:end -->',
].join('\n');

describe('insertAnswer', () => {
  test('lands before the footer of its own section and changes nothing else', () => {
    const next = insertAnswer(SCROLL, 'test-a', BLOCK);
    expect(next).toContain(`- [one](Shop/X/proofs/p/one.m4a)\n\n${BLOCK}\n\n<sub>test proof, 2026-11-15</sub>\n<!-- /scroll:entry -->`);
    expect(next.replace(`\n\n${BLOCK}\n`, '\n')).toBe(SCROLL);
    const [a, , b] = parseMakingSections(next.split('<!-- scroll:making:start -->')[1].split('<!-- scroll:making:end -->')[0]);
    expect(a.footer).toBe('test proof, 2026-11-15');
    expect(parseAnswers(a.body).answers).toHaveLength(1);
    expect(b ?? parseMakingSections(next)[1]).toBeTruthy();
  });
  test('a section with no footer takes it at its end', () => {
    const next = insertAnswer(SCROLL, 'run-b', BLOCK);
    expect(next).toContain(`ran, nothing new\n\n${BLOCK}\n<!-- /scroll:entry -->`);
  });
  test('a second answer follows the first; nothing is deleted', () => {
    const b2 = formatAnswerBlock({ date: '2026-11-18', sense: 'heard', words: 'changed my mind', files: FILES });
    const twice = insertAnswer(insertAnswer(SCROLL, 'test-a', BLOCK), 'test-a', b2);
    const sec = parseMakingSections(twice).find((s) => s.id === 'test-a');
    expect(parseAnswers(sec.body).answers.map((x) => x.date)).toEqual(['2026-11-17', '2026-11-18']);
    expect(sec.footer).toBe('test proof, 2026-11-15');
  });
  test('a section that is not there is null', () => {
    expect(insertAnswer(SCROLL, 'nope', BLOCK)).toBeNull();
  });
});

describe('the ledger line', () => {
  test("is the Maker's form, on one line", () => {
    expect(proofName('test-a', Object.keys(FILES))).toBe('Shop/X/proofs/p/');
    expect(proofName('test-a', ['a/x.png', 'b/y.png'])).toBe('test-a');
    expect(ledgerLine({ date: '2026-11-17', sense: 'heard', proof: 'Shop/X/proofs/p/', words: 'the twenty\nwin', marks: [{ kind: 'flag', path: 'Shop/X/proofs/p/one.m4a', note: 'clicks' }] }))
      .toBe('- heard by Loudon · 2026-11-17 · `Shop/X/proofs/p/` · "the twenty win · flag one.m4a: clicks" · owed a review');
  });
});

describe('sectionState and the count', () => {
  const sections = () => parseMakingSections(SCROLL);
  test('a section that asks and has no answer is waiting; one that asks nothing is null', () => {
    const [a, b] = sections().filter((s) => s.id);
    expect(sectionState(a)).toBe('waiting');
    expect(sectionState(b)).toBeNull();
    expect(sectionState({ id: null, body: 'The question: **x?**', artifacts: [] })).toBeNull();
  });
  test('answered; then waiting again, as earlier, once a file is remade', () => {
    const a = parseMakingSections(insertAnswer(SCROLL, 'test-a', BLOCK)).find((s) => s.id === 'test-a');
    expect(sectionState(a)).toBe('answered');
    expect(sectionState(a, FILES)).toBe('answered');
    const remade = { ...FILES, 'Shop/X/proofs/p/one.m4a': 'cccccccccccc' };
    expect(sectionState(a, remade)).toBe('earlier');
    expect(staleFiles(parseAnswers(a.body).answers[0], remade)).toEqual(['Shop/X/proofs/p/one.m4a']);
    expect(countStates(['waiting', 'earlier', 'answered', null])).toEqual({ waiting: 2, answered: 1 });
  });
  test('any section can be answered, asked or not, and then counts as answered', () => {
    const b = parseMakingSections(insertAnswer(SCROLL, 'run-b', BLOCK)).find((s) => s.id === 'run-b');
    expect(sectionState(b)).toBe('answered');
  });
});
