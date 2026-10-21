import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, copyFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { makeResolver } from '../../../../rich-face/resolve.mjs';
import { untrackedFor, faceEntries, KEEP_FOLDER } from '../../../../rich-face/untracked.mjs';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

// Media a rich face needs is placed in git on purpose (Loudon, 2026-10-20).
// untracked.mjs lists every file a face names that git does not track, with
// the step to track it; the convention it prints is the palace's own .gitignore
// rule: a steward's take is copied into its entry's bundle under rich-face/,
// which .gitignore keeps, and committed, and the face, naming it as before,
// lands on the copy live and in the build. A temp palace that is a git
// repository, with the palace's real .gitignore.

const HERE = dirname(fileURLToPath(import.meta.url));
const PALACE = resolve(HERE, '../../../../..');
const SCRIPT = resolve(HERE, '../../../../rich-face/untracked.mjs');
const ENTRY = 'Sound Study';
const BUNDLE = `Projects/${ENTRY}/${ENTRY}`;
const git = (cwd, ...args) => execFileSync('git', ['-c', 'user.email=test@example.com', '-c', 'user.name=test', ...args], { cwd, stdio: 'ignore', env: gitFreeEnv() });

let root;
const write = (rel, body) => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), body); };

beforeAll(() => {
  root = mkdtempSync(resolve(tmpdir(), 'rich-untracked-test-'));
  git(root, 'init', '-q');
  assertScratchRepo(root);
  copyFileSync(join(PALACE, '.gitignore'), join(root, '.gitignore')); // the palace's own rules
  write(`${BUNDLE}.md`, `---\ntitle: ${ENTRY}\n---\n# ${ENTRY}\n\n## Takes\n\nWords.\n\n![[take-07.wav]]\n`);
  write(`${BUNDLE}/${ENTRY} — rich.json`, JSON.stringify({ entry: ENTRY, sections: [{ heading: 'Takes', pieces: [
    { file: 'take-08.mp4', origin: 'made' },
    { file: 'player.html', origin: 'made', height: 300 },
    { file: 'kept.wav', origin: 'made' },
  ] }] }));
  // The steward's renders, outside the bundle: ignored by Projects/**/*.wav and *.mp4.
  write(`Projects/${ENTRY}/renders/take-07.wav`, 'RIFF7');
  write(`Projects/${ENTRY}/renders/take-08.mp4`, 'MP48');
  write(`${BUNDLE}/loop.wav`, 'RIFFL');
  write(`${BUNDLE}/player.html`, '<!doctype html><html><head><meta name="piece:files" content="loop.wav"></head><body>p</body></html>');
  write(`${BUNDLE}/${KEEP_FOLDER}/kept.wav`, 'RIFFK');
  git(root, 'add', '-A');
  git(root, 'commit', '-qm', 'the palace');
  write(`${BUNDLE}/fresh.png`, 'PNG'); // new, not ignored, not yet committed
  const m = JSON.parse(readFileSync(join(root, `${BUNDLE}/${ENTRY} — rich.json`), 'utf8'));
  m.sections[0].pieces.push({ file: 'fresh.png', origin: 'made' });
  writeFileSync(join(root, `${BUNDLE}/${ENTRY} — rich.json`), JSON.stringify(m));
});
afterAll(() => { if (root) rmSync(root, { recursive: true, force: true }); });

describe('every file a face names that git does not track', () => {
  test('the palace .gitignore keeps a bundle’s rich-face/ folder and ignores the render beside it', () => {
    const check = (p) => spawnSync('git', ['check-ignore', '-q', '--no-index', p], { cwd: root, env: gitFreeEnv() }).status === 0;
    expect(check(`Projects/${ENTRY}/renders/take-07.wav`)).toBe(true);
    expect(check(`${BUNDLE}/${KEEP_FOLDER}/take-07.wav`)).toBe(false);
    expect(check(`Shop/Shopkeeper/Lamp/${KEEP_FOLDER}/turn.mp4`)).toBe(false);
    expect(check(`${BUNDLE}/${KEEP_FOLDER}/take-07.wav.asd`)).toBe(true); // Ableton's sidecar stays out
  });

  test('lists them, how each is untracked, who names it, and the step to track it', () => {
    const r = untrackedFor(makeResolver(root), ENTRY);
    const by = Object.fromEntries(r.files.map((f) => [f.path, f]));
    expect(Object.keys(by).sort()).toEqual([`${BUNDLE}/fresh.png`, `${BUNDLE}/loop.wav`, `Projects/${ENTRY}/renders/take-07.wav`, `Projects/${ENTRY}/renders/take-08.mp4`]);
    expect(by[`Projects/${ENTRY}/renders/take-07.wav`]).toMatchObject({ ignored: true, via: 'named by the face' });
    expect(by[`${BUNDLE}/loop.wav`]).toMatchObject({ ignored: true, via: 'declared by player.html' });
    expect(by[`${BUNDLE}/fresh.png`]).toMatchObject({ ignored: false });
    expect(by[`${BUNDLE}/fresh.png`].steps).toEqual([expect.stringMatching(/palace-commit\.mjs .*--path "Projects\/Sound Study\/Sound Study\/fresh\.png"$/)]);
    expect(by[`Projects/${ENTRY}/renders/take-07.wav`].steps[0]).toBe(`mkdir -p "${BUNDLE}/${KEEP_FOLDER}" && cp "Projects/${ENTRY}/renders/take-07.wav" "${BUNDLE}/${KEEP_FOLDER}/take-07.wav"`);
    expect(by[`Projects/${ENTRY}/renders/take-07.wav`].steps[1]).toMatch(new RegExp(`--path "${BUNDLE}/${KEEP_FOLDER}/take-07\\.wav"$`));
    expect(faceEntries(makeResolver(root))).toEqual([ENTRY]);
  });

  test('the command line says the same, and exits 1 while any is untracked', () => {
    const run = spawnSync(process.execPath, [SCRIPT, ENTRY, '--root', root], { encoding: 'utf8', env: gitFreeEnv() });
    expect(run.status).toBe(1);
    expect(run.stdout).toMatch(new RegExp(`^${ENTRY}: 4 files only on this Mac`));
    expect(run.stdout).toContain(`Projects/${ENTRY}/renders/take-07.wav  (ignored by git; named by the face)`);
    const nobody = spawnSync(process.execPath, [SCRIPT, 'No Such Entry', '--root', root], { encoding: 'utf8', env: gitFreeEnv() });
    expect(nobody.status).toBe(2);
  });

  test('copied into rich-face/ and committed, as it says, the face lands on the copy, live and in the build, naming it as before', () => {
    const before = makeResolver(root, { tracked: true }).resolve('take-07.wav', `${BUNDLE}.md`);
    expect(before).toMatchObject({ ok: false, reason: 'missing', local: true });
    // The steps the list printed, run as an author would.
    execFileSync('sh', ['-c', `mkdir -p "${BUNDLE}/${KEEP_FOLDER}" && cp "Projects/${ENTRY}/renders/take-07.wav" "${BUNDLE}/${KEEP_FOLDER}/take-07.wav"`], { cwd: root });
    git(root, 'add', '--', `${BUNDLE}/${KEEP_FOLDER}/take-07.wav`); // a plain add takes it: not ignored, so the committer can
    git(root, 'commit', '-qm', 'the rich face keeps take-07.wav');
    const live = makeResolver(root).resolve('take-07.wav', `${BUNDLE}.md`);
    const built = makeResolver(root, { tracked: true }).resolve('take-07.wav', `${BUNDLE}.md`);
    expect(live).toEqual({ ok: true, path: `${BUNDLE}/${KEEP_FOLDER}/take-07.wav` });
    expect(built).toEqual({ ok: true, path: `${BUNDLE}/${KEEP_FOLDER}/take-07.wav` });
    expect(untrackedFor(makeResolver(root), ENTRY).files.map((f) => f.path)).not.toContain(`Projects/${ENTRY}/renders/take-07.wav`);
    // The steward renders that take again: the face's copy, and git, do not move.
    writeFileSync(join(root, `Projects/${ENTRY}/renders/take-07.wav`), 'RIFF7-again');
    expect(execFileSync('git', ['status', '--porcelain'], { cwd: root, env: gitFreeEnv() }).toString()).not.toMatch(/take-07/);
  }, 30000);

  // The palace's usual layout: Projects/Foo.md, its bundle Projects/Foo/, and
  // the steward's render in that bundle's own top folder, which the resolver
  // looks in first (the Concierge's probe, 2026-10-21; three such renders exist).
  test('a render in the bundle’s own top folder: once its copy is committed, the copy wins there too, live and built', () => {
    write('Projects/Foo.md', '---\ntitle: Foo\n---\n# Foo\n\n## Takes\n\n![[top.wav]]\n');
    write('Projects/Foo/top.wav', 'RIFFT'); // ignored by Projects/**/*.wav
    write('Projects/Foo/Foo — rich.json', JSON.stringify({ entry: 'Foo', sections: [{ heading: 'Takes', pieces: [] }] }));
    git(root, 'add', '-A');
    git(root, 'commit', '-qm', 'Foo');
    expect(makeResolver(root).resolve('top.wav', 'Projects/Foo.md')).toEqual({ ok: true, path: 'Projects/Foo/top.wav', local: true });
    const [step] = untrackedFor(makeResolver(root), 'Foo').files.map((f) => f.steps[0]);
    execFileSync('sh', ['-c', step], { cwd: root });
    git(root, 'add', '--', `Projects/Foo/${KEEP_FOLDER}/top.wav`);
    git(root, 'commit', '-qm', 'the rich face keeps top.wav');
    const want = { ok: true, path: `Projects/Foo/${KEEP_FOLDER}/top.wav` };
    expect(makeResolver(root).resolve('top.wav', 'Projects/Foo.md')).toEqual(want);
    expect(makeResolver(root, { tracked: true }).resolve('top.wav', 'Projects/Foo.md')).toEqual(want);
    expect(untrackedFor(makeResolver(root), 'Foo').files).toEqual([]);
  }, 30000);
});
