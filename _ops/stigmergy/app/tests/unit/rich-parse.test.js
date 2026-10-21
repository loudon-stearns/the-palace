import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEntry, sectionProse, fingerprint, mediaRefs } from '../../../../rich-face/parse.js';
import * as richParse from '../../../../rich-face/parse.js';

const RICH_SRC = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../rich-face');

// _ops/rich-face/parse.js — the one parser the rich face and fingerprint.mjs
// share. A section list or a fingerprint that moves here moves on every page.

const FM = '---\ntitle: Demo\ntype: hub\n---\n';
const keys = (e) => e.sections.map((s) => s.key);
const dupes = (e) => keys(e).filter((k, i, a) => a.indexOf(k) !== i);

describe('what comes before the first heading', () => {
  test('a blank line between frontmatter and the H1 opens no section of its own', () => {
    const e = parseEntry(FM + '\n# Demo\n\nSome words.\n\n## Next\n\nMore.\n');
    expect(keys(e)).toEqual(['demo', 'next']);
    expect(e.sections[0].level).toBe(1);
  });

  test('blank lines before the H1 with no frontmatter open nothing either', () => {
    const e = parseEntry('\n\n\n# Demo\n\nSome words.\n');
    expect(keys(e)).toEqual(['demo']);
  });

  test('the same words, with and without the blank line, fingerprint the same', async () => {
    const tight = parseEntry(FM + '# Demo\n\nSome words.\n');
    const loose = parseEntry(FM + '\n\n# Demo\n\nSome words.\n');
    expect(keys(loose)).toEqual(keys(tight));
    expect(await fingerprint(sectionProse(loose.sections[0]))).toBe(await fingerprint(sectionProse(tight.sections[0])));
  });

  test('real content before the H1 joins the H1\'s section — never a second section with one key', () => {
    const e = parseEntry(FM + '\n<!-- a note to the next agent -->\n\n# Demo\n\nSome words.\n\n## Next\n\nMore.\n');
    expect(keys(e)).toEqual(['demo', 'next']);
    expect(dupes(e)).toEqual([]);
    expect(e.sections[0].heading).toBe('Demo');
    expect(e.sections[0].blocks.map((b) => b.md)).toEqual(['<!-- a note to the next agent -->', 'Some words.']);
  });

  test('content before an H1 that differs from the title still joins the H1', () => {
    const e = parseEntry('---\ntitle: Something Else\n---\nA stray line.\n\n# Demo\n\nSome words.\n');
    expect(keys(e)).toEqual(['demo']);
    expect(e.sections[0].blocks).toHaveLength(2);
  });

  test('a hero above the H1 is still the page\'s hero, and opens no section', () => {
    const e = parseEntry(FM + '\n![[Demo — hero.png]]\n\n# Demo\n\nSome words.\n');
    expect(e.hero).toBe('Demo — hero.png');
    expect(keys(e)).toEqual(['demo']);
  });

  test('with no H1, opening words still get an opening section keyed to the title', () => {
    const e = parseEntry(FM + '\nOpening words.\n\n## Next\n\nMore.\n');
    expect(keys(e)).toEqual(['demo', 'next']);
    expect(e.sections[0].level).toBe(1);
    expect(e.sections[0].blocks[0].md).toBe('Opening words.');
  });

  test('with no H1 and nothing but blank lines before the first H2, there is no empty opening', () => {
    const e = parseEntry(FM + '\n\n## Next\n\nMore.\n');
    expect(keys(e)).toEqual(['next']);
  });

  test('a later H1 still opens a section of its own', () => {
    const e = parseEntry(FM + '# Demo\n\nSome words.\n\n# Second\n\nMore.\n');
    expect(keys(e)).toEqual(['demo', 'second']);
  });
});

describe('the door — a line linking the rich face — is dropped by the line', () => {
  const DOOR = '*Also as a [rich face ↗](http://localhost:5173/rich/?entry=Demo) — this page with its sound.*';
  const prose = (e, i = 0) => e.sections[i].blocks.filter((b) => b.type === 'prose').map((b) => b.md);

  test('the words around a door line in the same paragraph stay', () => {
    const e = parseEntry('# Demo\n\nReal words here.\n' + DOOR + '\nMore words.\n');
    expect(prose(e)).toEqual(['Real words here.\nMore words.']);
  });

  test('a door on its own paragraph leaves nothing behind (Kuramoto\'s shape)', () => {
    const e = parseEntry(FM + '# Demo\n\n![[Demo — hero.png]]\n\n' + DOOR + '\n\nThe first real paragraph.\n');
    expect(e.hero).toBe('Demo — hero.png');
    expect(prose(e)).toEqual(['The first real paragraph.']);
  });

  test('a door paragraph right after a figure is not its caption', () => {
    const e = parseEntry('# Demo\n\n![[pic.png]]\n\n' + DOOR + '\n');
    const fig = e.sections[0].blocks.find((b) => b.type === 'figure');
    expect(fig.caption).toBe('');
  });

  test('a door line under an embed in the same paragraph is not its caption', () => {
    const e = parseEntry('# Demo\n\n![[pic.png]]\n' + DOOR + '\n');
    const fig = e.sections[0].blocks.find((b) => b.type === 'figure');
    expect(fig).toBeTruthy();
    expect(fig.caption).toBe('');
    expect(prose(e)).toEqual([]);
  });

  test('a door line inside a blockquote figure is not part of its caption', () => {
    const e = parseEntry('# Demo\n\n> ![[pic.png]]\n> ' + DOOR + '\n> the real caption\n');
    expect(e.sections[0].blocks[0].caption).toBe('the real caption');
  });

  test('a door above a first H2, with no H1, opens no empty section', () => {
    const e = parseEntry(FM + DOOR + '\n\n## Next\n\nMore.\n');
    expect(keys(e)).toEqual(['next']);
  });

  test('adding a door anywhere in a section leaves its fingerprint alone', async () => {
    const plain = '# Demo\n\nOne paragraph,\nstill going.\n\nAnother.\n';
    const before = await fingerprint(sectionProse(parseEntry(plain).sections[0]));
    for (const withDoor of [
      '# Demo\n\n' + DOOR + '\n\nOne paragraph,\nstill going.\n\nAnother.\n',
      '# Demo\n\nOne paragraph,\n' + DOOR + '\nstill going.\n\nAnother.\n',
      '# Demo\n\nOne paragraph,\nstill going.\n\nAnother.\n' + DOOR + '\n',
    ]) expect(await fingerprint(sectionProse(parseEntry(withDoor).sections[0]))).toBe(before);
  });

  test('inside a code fence a door-shaped line is just text, and the fence stays', () => {
    const e = parseEntry('# Demo\n\n```md\n[rich face](/rich/?entry=Demo)\n```\n');
    expect(prose(e)).toEqual(['```md\n[rich face](/rich/?entry=Demo)\n```']);
  });
});

describe('media references', () => {
  test('a stray % in a link does not fail the page', () => {
    expect(() => mediaRefs('[the chart](growth-100%.png)')).not.toThrow();
    expect(mediaRefs('[the chart](growth-100%.png)')[0].name).toBe('growth-100%.png');
    expect(() => parseEntry('# Demo\n\n> [the chart](growth-100%.png)\n> a caption\n')).not.toThrow();
  });

  test('a well-formed escape still decodes', () => {
    expect(mediaRefs('[a take](my%20take.wav)')[0].name).toBe('my take.wav');
  });

  // Every extension mediaRefs accepts, a link line of it in a blockquote figure
  // is media, not caption.
  test.each(['mp4', 'webm', 'mov', 'wav', 'mp3', 'ogg', 'm4a', 'flac', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'html', 'htm'])(
    'a [label](file.%s) line is media, not caption', (ext) => {
      expect(mediaRefs(`[listen](take.${ext})`)).toHaveLength(1);
      const e = parseEntry(`# Demo\n\n> [listen](take.${ext})\n> the caption\n`);
      expect(e.sections[0].blocks[0]).toMatchObject({ type: 'figure', caption: 'the caption' });
    });
});

// The page once kept its own extension lists beside this parser's. Its wikilink
// list had no ogg, m4a or flac, so [[take.ogg]] became a link to an entry named
// "take.ogg". The page now asks the parser what a file is.
describe('one media list, shared with the page', () => {
  test.each([
    ['take.wav', 'audio'], ['take.mp3', 'audio'], ['take.ogg', 'audio'], ['take.m4a', 'audio'], ['take.flac', 'audio'],
    ['clip.mp4', 'video'], ['clip.webm', 'video'], ['clip.mov', 'video'],
    ['pic.png', 'image'], ['pic.jpg', 'image'], ['pic.jpeg', 'image'], ['pic.gif', 'image'], ['pic.webp', 'image'], ['pic.svg', 'image'],
    ['piece.html', 'interactive'], ['piece.htm', 'interactive'], ['TAKE.OGG', 'audio'],
    ['notes.md', 'text'], ['Some Entry', 'file'], ['data.json', 'file'],
  ])('%s is %s', (name, kind) => {
    expect(richParse.mediaKind(name)).toBe(kind);
  });

  test('media is exactly video, audio, image and interactive', () => {
    for (const n of ['take.ogg', 'take.m4a', 'take.flac', 'take.wav', 'clip.mp4', 'pic.png', 'piece.html']) expect(richParse.isMedia(n)).toBe(true);
    for (const n of ['notes.md', 'Some Entry', 'data.json', 'Kuramoto Coupling']) expect(richParse.isMedia(n)).toBe(false);
  });

  test('the page keeps no extension list of its own', () => {
    const html = readFileSync(resolve(RICH_SRC, 'rich.html'), 'utf8') + readFileSync(resolve(RICH_SRC, 'rich.js'), 'utf8');
    // An alternation of extensions — the shape both of its old lists had: \.(mp4|webm|mov)
    expect(html.match(/\\\.\((?:\?:)?[\w?]+\|[\w?|]+\)/g)).toBeNull();
  });
});

describe('a blockquote figure\'s media lines are never its caption', () => {
  test.each(['[[take.wav]]', '[[take.wav|listen]]', '[[take.ogg|the take]]', '[[Some Entry/clip.mp4|the clip]]', '![[take.wav]]', '[listen](take.wav)'])(
    'a %s line is media, not caption', (line) => {
      const e = parseEntry(`# Demo\n\n> ${line}\n> the caption\n`);
      expect(e.sections[0].blocks[0]).toMatchObject({ type: 'figure', caption: 'the caption' });
    });

  test('a line that links an entry, not a file, stays in the caption', () => {
    const e = parseEntry('# Demo\n\n> ![[pic.png]]\n> [[Some Entry]]\n');
    expect(e.sections[0].blocks[0]).toMatchObject({ type: 'figure', caption: '[[Some Entry]]' });
  });
});

// A manifest, the drift marks, a section's review note and fingerprint.mjs all
// find a section by its key. Two sections sharing one laid the same pieces under
// both and kept one note for the two.
describe('two headings with the same text', () => {
  const names = (e) => e.sections.map((s) => s.name);

  test('get two keys, and the second is named "Notes (2)"', () => {
    const e = parseEntry('# Demo\n\n## Notes\n\nA.\n\n## Notes\n\nB.\n');
    expect(keys(e)).toEqual(['demo', 'notes', 'notes (2)']);
    expect(e.sections[2].heading).toBe('Notes'); // the page still shows the heading as written
    expect(names(e)).toEqual(['Demo', 'Notes', 'Notes (2)']);
    expect(richParse.sectionKey(e.sections[2].name)).toBe(e.sections[2].key); // what a manifest's heading resolves to
  });

  test('a third is "(3)"', () => {
    const e = parseEntry('# Demo\n\n## Notes\n\nA.\n\n## Notes\n\nB.\n\n## Notes\n\nC.\n');
    expect(keys(e)).toEqual(['demo', 'notes', 'notes (2)', 'notes (3)']);
  });

  test('an H2 that repeats the H1 gets a key of its own', () => {
    const e = parseEntry('# Demo\n\nA.\n\n## Demo\n\nB.\n');
    expect(keys(e)).toEqual(['demo', 'demo (2)']);
  });

  test('headings that differ only in case or emphasis count as the same', () => {
    const e = parseEntry('# Demo\n\n## Notes\n\nA.\n\n## *notes*\n\nB.\n');
    expect(dupes(e)).toEqual([]);
    expect(keys(e)).toEqual(['demo', 'notes', 'notes (2)']);
  });

  test('a heading written "Notes (2)" keeps its own key, wherever it stands; a repeat steps past it', () => {
    const before = parseEntry('# Demo\n\n## Notes (2)\n\nA.\n\n## Notes\n\nB.\n\n## Notes\n\nC.\n');
    expect(keys(before)).toEqual(['demo', 'notes (2)', 'notes', 'notes (3)']);
    const after = parseEntry('# Demo\n\n## Notes\n\nA.\n\n## Notes\n\nB.\n\n## Notes (2)\n\nC.\n');
    expect(keys(after)).toEqual(['demo', 'notes', 'notes (3)', 'notes (2)']);
    expect(dupes(after)).toEqual([]);
  });

  test('an entry with no repeats is keyed exactly as before, and each name is its heading', () => {
    const e = parseEntry(FM + '# Demo\n\nSome words.\n\n## Next\n\nMore.\n');
    expect(keys(e)).toEqual(['demo', 'next']);
    expect(names(e)).toEqual(['Demo', 'Next']);
  });
});
