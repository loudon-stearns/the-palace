import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync, execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fingerprint } from '../../../../rich-face/parse.js';

// _ops/rich-face/fingerprint.mjs --stamp, run in a temp palace. The script
// finds entries from its own checkout root, so the three files it needs are
// copied in and the real palace is never read or written. The manifest is
// written compact on purpose: any rewrite at all shows up as changed bytes.

const __dirname = dirname(fileURLToPath(import.meta.url));
const RICH_SRC = resolve(__dirname, '../../../../rich-face');
const MANIFEST_REL = 'Demo Entry/Demo Entry — rich.json';
const STALE = '000000000000';

let root;
const manifestText = () => readFileSync(resolve(root, MANIFEST_REL), 'utf8');
function stamp(...names) {
  const r = spawnSync(process.execPath, [resolve(root, '_ops/rich-face/fingerprint.mjs'), 'Demo Entry', '--stamp', ...names], { encoding: 'utf8' });
  return { status: r.status, out: r.stdout + r.stderr };
}

describe('fingerprint.mjs --stamp', () => {
  beforeEach(() => {
    root = mkdtempSync(resolve(tmpdir(), 'rich-fingerprint-test-'));
    // The rich face finds files through git's index (resolve.mjs), never by walking
    // the disk, so the temp palace is a repository; new files count untracked.
    execFileSync('git', ['init', '-q'], { cwd: root });
    mkdirSync(resolve(root, '_ops/rich-face'), { recursive: true });
    for (const f of ['fingerprint.mjs', 'parse.js', 'resolve.mjs']) copyFileSync(resolve(RICH_SRC, f), resolve(root, '_ops/rich-face', f));
    writeFileSync(resolve(root, 'Demo Entry.md'), '# Demo Entry\n\nSome words.\n\n## A Section\n\nMore words.\n\n## Another\n\nStill more.\n', 'utf8');
    mkdirSync(resolve(root, 'Demo Entry'), { recursive: true });
    writeFileSync(resolve(root, MANIFEST_REL), JSON.stringify({ entry: 'Demo Entry', sections: [
      { heading: 'A Section', made_against: STALE, pieces: [] },
      { heading: 'Another', made_against: STALE, pieces: [] },
    ] }), 'utf8');
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  test('a mistyped section name is named in a warning, and the manifest is not rewritten', () => {
    const before = manifestText();
    const r = stamp('A Sectoin');
    expect(r.out).toContain('A Sectoin');
    expect(r.status).not.toBe(0);
    expect(manifestText()).toBe(before);
  });

  test('with one name right and one wrong, it stamps the right one and warns on the other', () => {
    const r = stamp('A Section', 'Nope');
    expect(r.out).toContain('Nope');
    expect(r.status).not.toBe(0);
    const m = JSON.parse(manifestText());
    expect(m.sections[0].made_against).toMatch(/^[0-9a-f]{12}$/);
    expect(m.sections[0].made_against).not.toBe(STALE);
    expect(m.sections[1].made_against).toBe(STALE);
  });

  test('a bare --stamp stamps every section', () => {
    const r = stamp();
    expect(r.status).toBe(0);
    const m = JSON.parse(manifestText());
    expect(m.sections.map((s) => s.made_against)).not.toContain(STALE);
  });

  test('when every named section is already in step, nothing is written', () => {
    stamp();
    const settled = manifestText();
    writeFileSync(resolve(root, MANIFEST_REL), JSON.stringify(JSON.parse(settled)), 'utf8'); // compact again
    const before = manifestText();
    const r = stamp('A Section');
    expect(r.status).toBe(0);
    expect(manifestText()).toBe(before);
  });

  // Two headings with the same text once shared one key, so both manifest
  // sections were stamped against the second one's words.
  describe('a heading the entry repeats', () => {
    beforeEach(() => {
      writeFileSync(resolve(root, 'Demo Entry.md'), '# Demo Entry\n\n## Notes\n\nThe first words.\n\n## Notes\n\nThe second words.\n', 'utf8');
      writeFileSync(resolve(root, MANIFEST_REL), JSON.stringify({ entry: 'Demo Entry', sections: [
        { heading: 'Notes', made_against: STALE, pieces: [] },
        { heading: 'Notes (2)', made_against: STALE, pieces: [] },
      ] }), 'utf8');
    });

    test('each is stamped against its own words', async () => {
      expect(stamp().status).toBe(0);
      const m = JSON.parse(manifestText());
      expect(m.sections[0].made_against).toBe(await fingerprint('The first words.'));
      expect(m.sections[1].made_against).toBe(await fingerprint('The second words.'));
    });

    test('the second is stamped by its name, "Notes (2)", and the first is left alone', async () => {
      expect(stamp('Notes (2)').status).toBe(0);
      const m = JSON.parse(manifestText());
      expect(m.sections[0].made_against).toBe(STALE);
      expect(m.sections[1].made_against).toBe(await fingerprint('The second words.'));
    });
  });
});
