import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import http from 'node:http';
import { resolve } from 'node:path';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import request from 'supertest';
import { listen, closeAll } from '../helpers/loopback.js';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';
import { blackboardMiddleware } from '../../server/middleware.js';
import { answerScroll, reviewOf, fileHash } from '../../server/scroll-answer.js';
import { parseMakingSections } from '../../src/lib/scroll-view.js';
import { parseAnswers } from '../../src/lib/scroll-answers.js';
import { buildQueue } from '../../src/lib/queue-model.js';

// A Specialist with a scroll of two test proofs and a tuning ledger, and a
// page with a scroll and no ledger, in a throwaway git repo.
const HOME = 'Stable Audio Open';
const SCROLL_REL = `Shop/${HOME}/${HOME} — scroll.md`;
const LEDGER_REL = `Shop/${HOME}/${HOME} — tuning.md`;
const BOARD_REL = '_ops/swarm/persistent/blackboard.jsonl';
const P = `Shop/${HOME}/proofs/2026-11-15-twenty-steps`;

const scrollText = (home, sections) => [
  '---', `title: "${home} — scroll"`, '---', '', `# ${home} — scroll`, '',
  '<!-- scroll:now:start -->', '## Now', '<!-- scroll:now:end -->', '', '## Plan', '',
  '<!-- scroll:plan:start -->', '<!-- scroll:plan:end -->', '', '## Standing Orders', '',
  '<!-- scroll:orders:start -->', '<!-- scroll:orders:end -->', '', '## The making', '',
  '<!-- scroll:making:start -->', sections, '<!-- scroll:making:end -->', '',
].join('\n');

const SECTIONS = [
  '<!-- scroll:entry id="test-2026-11-15-twenty-steps" -->',
  '### 2026-11-15 — Twenty steps for a walk',
  '',
  'Nobody has heard either.',
  '',
  'The question: **does the walk of twenty different steps sound more like a person walking?**',
  '',
  '**Artifacts:**',
  `- [the walk, twenty different steps](${P}/walk-twenty-steps.m4a)`,
  `- [the same walk, one step repeated](${P}/walk-one-step-repeated.m4a)`,
  `- [the script](${P}/walk.py)`,
  '',
  '<sub>test proof, 2026-11-15</sub>',
  '<!-- /scroll:entry -->',
  '',
  '<!-- scroll:entry id="test-2026-11-15-mount" -->',
  '### 2026-11-15 — The mount block',
  '',
  '**Nobody but its maker has seen these.** The question for your eye: can you find all four holes?',
  '',
  `- [the sheet](Shop/${HOME}/proofs/mount/sheet.png)`,
  '<!-- /scroll:entry -->',
  '',
  '<!-- scroll:entry id="run-1" -->',
  '### 2026-11-14 — a run',
  'ran, nothing new',
  '<!-- /scroll:entry -->',
].join('\n');

function makePalace({ withGit = true } = {}) {
  const root = mkdtempSync(resolve(tmpdir(), 'stigmergy-scroll-answer-test-'));
  const git = (...args) => execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'], env: gitFreeEnv() });
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  mkdirSync(resolve(root, '_ops/agents/permanent'), { recursive: true });
  mkdirSync(resolve(root, P), { recursive: true });
  mkdirSync(resolve(root, `Shop/${HOME}/proofs/mount`), { recursive: true });
  mkdirSync(resolve(root, 'Loose Page'), { recursive: true });
  writeFileSync(resolve(root, BOARD_REL), '');
  writeFileSync(resolve(root, '_ops/agents/permanent/REGISTRY.json'), JSON.stringify({ schema_version: '1.0', agents: [] }));
  writeFileSync(resolve(root, `Shop/${HOME}.md`), `---\ntitle: "${HOME}"\ntype: specialist\nstatus: alive\n---\n# ${HOME}\n`);
  writeFileSync(resolve(root, SCROLL_REL), scrollText(HOME, SECTIONS));
  writeFileSync(resolve(root, LEDGER_REL), `# ${HOME} — tuning\n\n- run · 2026-11-15 · twenty steps · nothing new · by the bench\n`);
  writeFileSync(resolve(root, `${P}/walk-twenty-steps.m4a`), 'twenty');
  writeFileSync(resolve(root, `${P}/walk-one-step-repeated.m4a`), 'one');
  writeFileSync(resolve(root, `${P}/walk.py`), 'print()');
  writeFileSync(resolve(root, `Shop/${HOME}/proofs/mount/sheet.png`), 'png');
  writeFileSync(resolve(root, 'Loose Page.md'), '---\ntitle: "Loose Page"\ntype: concept\nstage: seed\n---\n# Loose\n');
  writeFileSync(resolve(root, 'Loose Page/Loose Page — scroll.md'), scrollText('Loose Page', '<!-- scroll:entry id="hand-1" -->\n### a picture\n\nNobody has seen it.\n\n- [it](Loose Page/pic.png)\n<!-- /scroll:entry -->'));
  writeFileSync(resolve(root, 'Loose Page/pic.png'), 'pic');
  if (withGit) {
    git('init', '-q', '-b', 'main'); assertScratchRepo(root);
    git('config', 'user.email', 't@t'); git('config', 'user.name', 't'); git('config', 'commit.gpgsign', 'false');
    git('add', '-A'); git('commit', '-q', '-m', 'seed');
  }
  return { root, git };
}

function makeServer(palaceRoot) {
  const plugin = blackboardMiddleware(palaceRoot);
  const handlers = [];
  plugin.configureServer({ middlewares: { use: (fn) => handlers.push(fn) } });
  return http.createServer((req, res) => {
    let i = 0;
    const next = () => { if (i >= handlers.length) { res.statusCode = 404; res.end('nf'); return; } handlers[i++](req, res, next); };
    next();
  });
}

const sectionOf = (root, rel, id) => parseMakingSections(readFileSync(resolve(root, rel), 'utf8')).find((s) => s.id === id);
const boardOf = (root) => readFileSync(resolve(root, BOARD_REL), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));

describe('answerScroll — one send, the answer and its three deliveries', () => {
  let root, git;
  beforeEach(() => { ({ root, git } = makePalace()); });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  test('the block lands in the section, the line on the ledger, the note on the board, all in one commit', async () => {
    const before = readFileSync(resolve(root, SCROLL_REL), 'utf8');
    const r = await answerScroll({
      palaceRoot: root, home: HOME, section: 'test-2026-11-15-twenty-steps',
      words: 'the twenty sound like a person; the one is a machine',
      marks: [{ kind: 'pick', path: `${P}/walk-twenty-steps.m4a` }, { kind: 'flag', path: `${P}/walk-one-step-repeated.m4a`, note: 'clicks' }],
      now: '2026-11-17T15:00:00.000Z', today: '2026-11-17',
    });
    expect(r.ok).toBe(true);
    expect(r.notes).toEqual([]);

    // The scroll: only this section changed, and only by the block.
    const after = readFileSync(resolve(root, SCROLL_REL), 'utf8');
    expect(after.replace(`\n\n${r.block}\n`, '\n')).toBe(before);
    const sec = sectionOf(root, SCROLL_REL, 'test-2026-11-15-twenty-steps');
    const { answers } = parseAnswers(sec.body);
    expect(answers).toHaveLength(1);
    expect(answers[0]).toMatchObject({ by: 'Loudon', date: '2026-11-17', sense: 'heard', words: 'the twenty sound like a person; the one is a machine' });
    expect(answers[0].marks).toEqual([{ kind: 'pick', file: 'walk-twenty-steps.m4a', note: '' }, { kind: 'flag', file: 'walk-one-step-repeated.m4a', note: 'clicks' }]);
    // Only what he can hear or see is fingerprinted; the script is not.
    expect(Object.keys(answers[0].files).sort()).toEqual([`${P}/walk-one-step-repeated.m4a`, `${P}/walk-twenty-steps.m4a`]);
    expect(answers[0].files[`${P}/walk-twenty-steps.m4a`]).toBe(fileHash(root, `${P}/walk-twenty-steps.m4a`));

    // The ledger: the Maker's form, owed a review.
    expect(r.ledger).toBe(LEDGER_REL);
    expect(readFileSync(resolve(root, LEDGER_REL), 'utf8').trimEnd().split('\n').pop())
      .toBe(`- heard by Loudon · 2026-11-17 · \`${P}/\` · "the twenty sound like a person; the one is a machine · pick walk-twenty-steps.m4a · flag walk-one-step-repeated.m4a: clicks" · owed a review`);

    // The board: a review note on the page, which the QUEUE shows as one.
    const board = boardOf(root);
    expect(board).toHaveLength(1);
    expect(board[0]).toMatchObject({ id: r.board_id, from: 'TRICKSTER', type: 'BROADCAST', board: 'GENERAL' });
    expect(board[0].payload).toMatchObject({ kind: 'human_eval', entry: HOME, task: `scroll:${HOME}:test-2026-11-15-twenty-steps` });
    expect(board[0].payload.scroll).toMatchObject({ path: SCROLL_REL, section: 'test-2026-11-15-twenty-steps', sense: 'heard', question: 'does the walk of twenty different steps sound more like a person walking?' });
    const card = buildQueue(board).find((it) => it.kind === 'human_eval');
    expect(card).toMatchObject({ entry: HOME, via: 'page' });
    expect(card.notes[0].section).toBe('2026-11-15 — Twenty steps for a walk');
    expect(card.notes[0].note).toContain('the twenty sound like a person');

    // The commit: his hand, the scroll and the ledger and nothing else.
    expect(r.commit).toBeTruthy();
    const log = git('log', '-1', '--format=%s%n%b').toString();
    expect(log).toMatch(/^edit\(Stable Audio Open\): Loudon's answer on the scroll, section test-2026-11-15-twenty-steps/);
    expect(log).toContain('Palace-Author: trickster');
    expect(git('-c', 'core.quotepath=off', 'show', '--name-only', '--format=', 'HEAD').toString().trim().split('\n').sort()).toEqual([LEDGER_REL, SCROLL_REL].sort());
  });

  test('a second answer is a second block; the first stays', async () => {
    const base = { palaceRoot: root, home: HOME, section: 'test-2026-11-15-mount' };
    await answerScroll({ ...base, words: 'three of four', today: '2026-11-17' });
    await answerScroll({ ...base, words: 'found the fourth', today: '2026-11-18' });
    const { answers } = parseAnswers(sectionOf(root, SCROLL_REL, 'test-2026-11-15-mount').body);
    expect(answers.map((a) => [a.sense, a.date, a.words])).toEqual([['seen', '2026-11-17', 'three of four'], ['seen', '2026-11-18', 'found the fourth']]);
  });

  test('a page with no tuning ledger keeps the answer and says no line was written', async () => {
    const r = await answerScroll({ palaceRoot: root, home: 'Loose Page', section: 'hand-1', words: 'fine', today: '2026-11-17' });
    expect(r.ok).toBe(true);
    expect(r.ledger).toBeNull();
    expect(r.notes).toEqual(['this page keeps no tuning ledger, so no ledger line was written']);
    expect(r.commit).toBeTruthy();
    expect(parseAnswers(sectionOf(root, 'Loose Page/Loose Page — scroll.md', 'hand-1').body).answers).toHaveLength(1);
  });

  test('refusals write nothing', async () => {
    const before = readFileSync(resolve(root, SCROLL_REL), 'utf8');
    const base = { palaceRoot: root, home: HOME, section: 'test-2026-11-15-twenty-steps' };
    expect(await answerScroll({ ...base, words: '  ', marks: [] })).toMatchObject({ ok: false, status: 422, error: 'empty-answer' });
    expect(await answerScroll({ ...base, marks: [{ kind: 'pick', path: 'SCHEMA.md' }] })).toMatchObject({ ok: false, status: 422, error: 'mark-names-a-file-not-in-the-section' });
    expect(await answerScroll({ ...base, section: 'nope', words: 'x' })).toMatchObject({ ok: false, status: 404, error: 'section-not-found' });
    expect(await answerScroll({ palaceRoot: root, home: 'Ghost', section: 'x', words: 'x' })).toMatchObject({ ok: false, status: 404 });
    expect(readFileSync(resolve(root, SCROLL_REL), 'utf8')).toBe(before);
    expect(boardOf(root)).toHaveLength(0);
  });

  test('reviewOf counts what waits, and a remade file sends an answered section back to waiting', async () => {
    const read = () => reviewOf(root, readFileSync(resolve(root, SCROLL_REL), 'utf8'));
    expect(read()).toEqual({ waiting: 2, answered: 0, stale: {} });
    await answerScroll({ palaceRoot: root, home: HOME, section: 'test-2026-11-15-twenty-steps', words: 'yes', today: '2026-11-17' });
    expect(read()).toEqual({ waiting: 1, answered: 1, stale: {} });
    writeFileSync(resolve(root, `${P}/walk-twenty-steps.m4a`), 'twenty, rendered again and longer');
    expect(read()).toEqual({ waiting: 2, answered: 0, stale: { 'test-2026-11-15-twenty-steps': [`${P}/walk-twenty-steps.m4a`] } });
  });
});

describe('POST /api/projects/answer', () => {
  let root, base;
  afterEach(async () => { await closeAll(); rmSync(root, { recursive: true, force: true }); });

  test('answers in place and hands back the fresh scroll with its count', async () => {
    ({ root } = makePalace());
    base = await listen(makeServer(root));
    const get = await request(base).get('/api/projects/scroll?home=' + encodeURIComponent(HOME));
    expect(get.body.review).toMatchObject({ waiting: 2, answered: 0 });
    const res = await request(base).post('/api/projects/answer').send({ home: HOME, section: 'test-2026-11-15-mount', words: 'all four, and the red reads' });
    expect(res.status).toBe(200);
    expect(res.body.answer.commit).toBeTruthy();
    expect(res.body.answer.ledger).toBe(LEDGER_REL);
    expect(res.body.review).toMatchObject({ waiting: 1, answered: 1 });
    expect(res.body.zones.making).toContain('**Seen.** Loudon, ');
    const rows = await request(base).get('/api/projects');
    expect(rows.body.pages.find((r) => r.home === HOME).review).toEqual({ waiting: 1, answered: 1 });
  });

  test('says so when the commit cannot land, and keeps the answer', async () => {
    ({ root } = makePalace({ withGit: false }));
    base = await listen(makeServer(root));
    const res = await request(base).post('/api/projects/answer').send({ home: HOME, section: 'test-2026-11-15-mount', words: 'kept anyway' });
    expect(res.status).toBe(200);
    expect(res.body.answer.commit).toBeNull();
    expect(res.body.answer.notes.join(' ')).toMatch(/saved but not committed/);
    expect(res.body.zones.making).toContain('kept anyway');
  });

  test('400 and 422 for a bad body', async () => {
    ({ root } = makePalace());
    base = await listen(makeServer(root));
    expect((await request(base).post('/api/projects/answer').send({ section: 'x', words: 'x' })).status).toBe(400);
    expect((await request(base).post('/api/projects/answer').send({ home: HOME, words: 'x' })).status).toBe(400);
    expect((await request(base).post('/api/projects/answer').send({ home: HOME, section: 'test-2026-11-15-mount', words: '' })).status).toBe(422);
  });
});
