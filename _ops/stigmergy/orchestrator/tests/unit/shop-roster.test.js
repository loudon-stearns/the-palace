import { describe, test, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rosterTriggers, outsideRoster, refreshShopRoster } from '../../src/shop-roster.js';
import { commitPathsAsync, commitCycle, planCycleCommit } from '../../src/cycle-commit.js';
import { processCycle } from '../../src/process-cycle.js';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

const FIXTURES = fileURLToPath(new URL('../fixtures/shop-roster/', import.meta.url));
const STAND_IN = path.join(FIXTURES, 'build-roster.mjs');
const OVERREACHING = path.join(FIXTURES, 'overreaching-builder.mjs');
const REAL_BUILDER = fileURLToPath(new URL('../../../../../Shop/Maker/build-roster.mjs', import.meta.url));

const git = (root, args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', env: gitFreeEnv() });
const ENTRY = 'Projects/Test Steward.md';
const HUB = 'The Shop.md';

// The Shop hub: a body of judgment calls around one generated block.
const hubText = (rows) => [
  '---', 'title: The Shop', 'type: hub', '---', '# The Shop', '',
  '## The Current Bet', '', "Loudon's call, not the cycle's.", '',
  '## Roster', '', '<!-- ROSTER:START -->', ...rows, '<!-- ROSTER:END -->', '',
  '## Lost Branches', '', 'Midjourney, 2026-05-30.', '',
].join('\n');
const specialist = (title, status) => `---\ntitle: ${title}\ntype: specialist\nstatus: ${status}\nlinks:\n  member-of: ["[[The Shop]]"]\n---\n# ${title}\n`;

let root;
afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

// A committed palace: a steward, one Specialist, and a hub
// whose roster is current for the stand-in builder (or `rows`, when given).
function shopPalace({ rows = ['| FLUX | alive |'], builder = STAND_IN } = {}) {
  root = mkdtempSync(path.join(tmpdir(), 'palace-roster-'));
  mkdirSync(path.join(root, 'Projects/Test Steward'), { recursive: true });
  mkdirSync(path.join(root, 'Shop/Maker'), { recursive: true });
  writeFileSync(path.join(root, ENTRY), '---\ntitle: Test Steward\ntype: project\nstage: growing\nstatus: active\n---\n# Test Steward\n');
  writeFileSync(path.join(root, 'Shop/FLUX.md'), specialist('FLUX', 'alive'));
  writeFileSync(path.join(root, HUB), hubText(rows));
  copyFileSync(builder, path.join(root, 'Shop/Maker/build-roster.mjs'));
  const agentDir = '_ops/agents/permanent/test-steward';
  mkdirSync(path.join(root, agentDir), { recursive: true });
  mkdirSync(path.join(root, '_ops/swarm/persistent'), { recursive: true });
  writeFileSync(path.join(root, agentDir, 'manifest.json'), JSON.stringify({ agent_id: 'Test Steward', home: 'Test Steward', mode: 'long_duration_background', session_id: 's', model: { name: 'claude-sonnet-5' } }));
  writeFileSync(path.join(root, agentDir, 'state.json'), JSON.stringify({ iteration: 0, last_active: null, last_read_cursor: null }));
  writeFileSync(path.join(root, agentDir, 'history.jsonl'), '');
  writeFileSync(path.join(root, '_ops/swarm/persistent/blackboard.jsonl'), '');
  writeFileSync(path.join(root, '.gitignore'), 'transcript.jsonl\n');
  git(root, ['init', '-q', '-b', 'main']);
  assertScratchRepo(root);
  git(root, ['config', 'user.name', 'test']);
  git(root, ['config', 'user.email', 'test@example.com']);
  git(root, ['add', '-A']);
  git(root, ['commit', '-q', '-m', 'init']);
  return { agentDir };
}

const read = (rel) => readFileSync(path.join(root, rel), 'utf8');
const headFiles = () => git(root, ['-c', 'core.quotepath=false', 'show', '--name-only', '--format=', 'HEAD']).trim().split('\n');
const history = (agentDir) => read(`${agentDir}/history.jsonl`).trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));

// One cycle's transcript: a shipped message listing these page edits.
function cycleTranscript(id, pageEdits) {
  const msg = {
    schema_version: '1.0', id, ts: '2026-10-18T08:00:00-04:00', session_id: 's',
    from: 'Test Steward', to: '*', type: 'BROADCAST', board: 'GENERAL',
    payload: { kind: 'shipped_artifact', headline: 'A new Specialist', content: 'OCR Smith joins as a stub.', page_edits: pageEdits },
  };
  const transcriptPath = path.join(root, 'transcript.jsonl');
  const text = '```json\n' + JSON.stringify(msg) + '\n```';
  writeFileSync(transcriptPath, JSON.stringify({ type: 'assistant', message: { usage: {}, content: [{ type: 'text', text }] } }));
  return transcriptPath;
}
const NEW_SPECIALIST = [{ path: 'Shop/OCR Smith.md', why: 'new stub Specialist' }];
const cycle = (agentDir, transcriptPath, commit) => processCycle({ palaceRoot: root, transcriptPath, agentDir, cycleN: 17, iteration: 1, tsNow: '2026-10-18T08:12:00-04:00', commit });

describe('what can move the roster', () => {
  test('only pages directly under Shop/, each once', () => {
    expect(rosterTriggers([
      { path: 'Shop/FLUX.md' }, { path: 'Shop/FLUX/recipe.md' }, { path: 'Shopping.md' },
      { path: 'Projects/Shop/X.md' }, { path: 'Shop/OCR Smith.md' }, { path: 'Shop/FLUX.md' }, { path: 'Shop/notes.txt' },
    ])).toEqual(['Shop/FLUX.md', 'Shop/OCR Smith.md']);
    expect(rosterTriggers([])).toEqual([]);
  });

  test('outsideRoster cuts the block out, and is null when a marker is missing', () => {
    const t = hubText(['| FLUX | alive |']);
    expect(outsideRoster(t)).toBe(outsideRoster(hubText(['| FLUX | stub |', '| OCR Smith | stub |'])));
    expect(outsideRoster(t)).toContain('## The Current Bet');
    expect(outsideRoster(t)).not.toContain('FLUX');
    expect(outsideRoster(t.replace('<!-- ROSTER:END -->', ''))).toBeNull();
    expect(outsideRoster(t.replace('<!-- ROSTER:START -->', ''))).toBeNull();
  });
});

describe('refreshShopRoster', () => {
  test('with no Shop page among the edits, nothing runs', () => {
    shopPalace();
    const calls = [];
    const exec = (...a) => { calls.push(a); return ''; };
    expect(refreshShopRoster({ palaceRoot: root, pageEdits: [{ path: ENTRY }, { path: 'Shop/FLUX/recipe.md' }], exec })).toBeNull();
    expect(calls).toEqual([]);
  });

  test('a new Specialist regenerates the block, and nothing outside it changes', () => {
    shopPalace();
    const before = read(HUB);
    writeFileSync(path.join(root, 'Shop/OCR Smith.md'), specialist('OCR Smith', 'stub'));
    const r = refreshShopRoster({ palaceRoot: root, pageEdits: NEW_SPECIALIST });
    expect(r).toMatchObject({ triggers: ['Shop/OCR Smith.md'], builder: 'Shop/Maker/build-roster.mjs', changed: true, path: HUB });
    expect(r.refused).toBeUndefined();
    expect(read(HUB)).toContain('| OCR Smith | stub |');
    expect(outsideRoster(read(HUB))).toBe(outsideRoster(before));
  });

  test('an edit that leaves the roster as it was changes nothing', () => {
    shopPalace();
    writeFileSync(path.join(root, 'Shop/FLUX.md'), specialist('FLUX', 'alive') + '\nA dated note.\n');
    const r = refreshShopRoster({ palaceRoot: root, pageEdits: [{ path: 'Shop/FLUX.md' }] });
    expect(r).toMatchObject({ changed: false, path: null });
    expect(git(root, ['status', '--porcelain', '--', HUB])).toBe('');
  });

  test('uncommitted changes outside the block are refused, and the builder never runs', () => {
    shopPalace();
    writeFileSync(path.join(root, 'Shop/OCR Smith.md'), specialist('OCR Smith', 'stub'));
    const edited = read(HUB).replace("Loudon's call, not the cycle's.", 'A steward rewrote the bet.');
    writeFileSync(path.join(root, HUB), edited);
    const r = refreshShopRoster({ palaceRoot: root, pageEdits: NEW_SPECIALIST });
    expect(r.changed).toBe(false);
    expect(r.refused).toMatch(/uncommitted changes outside the roster block/);
    expect(read(HUB)).toBe(edited); // left as it was found: no new row
  });

  test('a builder that writes outside the block is refused, and the file is put back', () => {
    shopPalace({ builder: OVERREACHING });
    const before = read(HUB);
    writeFileSync(path.join(root, 'Shop/OCR Smith.md'), specialist('OCR Smith', 'stub'));
    const r = refreshShopRoster({ palaceRoot: root, pageEdits: NEW_SPECIALIST });
    expect(r.changed).toBe(false);
    expect(r.refused).toMatch(/outside the roster block, so the file was put back/);
    expect(read(HUB)).toBe(before);
  });

  test('a builder that fails is refused, and the file is left as it was', () => {
    shopPalace();
    const before = read(HUB);
    const broken = path.join(root, 'broken-builder.mjs');
    writeFileSync(broken, "console.error('no Shop folder here'); process.exit(3);\n");
    git(root, ['add', 'broken-builder.mjs']);
    git(root, ['commit', '-q', '-m', 'a broken builder']);
    const r = refreshShopRoster({ palaceRoot: root, pageEdits: NEW_SPECIALIST, builder: 'broken-builder.mjs' });
    expect(r.refused).toMatch(/the roster builder failed \(no Shop folder here\)/);
    expect(read(HUB)).toBe(before);
  });

  test('a builder with uncommitted changes is refused before it runs: only a committed builder writes the block', () => {
    shopPalace();
    const before = read(HUB);
    writeFileSync(path.join(root, 'Shop/OCR Smith.md'), specialist('OCR Smith', 'stub'));
    copyFileSync(OVERREACHING, path.join(root, 'Shop/Maker/build-roster.mjs'));
    const r = refreshShopRoster({ palaceRoot: root, pageEdits: [...NEW_SPECIALIST, { path: 'Shop/Maker/build-roster.mjs' }] });
    expect(r.refused).toMatch(/the roster builder Shop\/Maker\/build-roster\.mjs has changes git does not hold yet/);
    expect(read(HUB)).toBe(before);
    // A builder git has never held is refused the same way.
    const r2 = refreshShopRoster({ palaceRoot: root, pageEdits: NEW_SPECIALIST, builder: STAND_IN });
    expect(r2.refused).toMatch(/has changes git does not hold yet/);
  });

  test('the change names the block lines it adds and drops, against HEAD', () => {
    shopPalace({ rows: ['| FLUX | stub |'] }); // committed stale: drift older than this cycle
    writeFileSync(path.join(root, 'Shop/OCR Smith.md'), specialist('OCR Smith', 'stub'));
    const r = refreshShopRoster({ palaceRoot: root, pageEdits: NEW_SPECIALIST });
    expect(r.added).toEqual(['| FLUX | alive |', '| OCR Smith | stub |']);
    expect(r.removed).toEqual(['| FLUX | stub |']);
  });

  test('a committed hub with no block to fill is refused', () => {
    shopPalace();
    writeFileSync(path.join(root, HUB), '---\ntitle: The Shop\ntype: hub\n---\n# The Shop\n');
    git(root, ['commit', '-q', '-am', 'no block']);
    const r = refreshShopRoster({ palaceRoot: root, pageEdits: NEW_SPECIALIST });
    expect(r.refused).toMatch(/no ROSTER:START … ROSTER:END block/);
    expect(read(HUB)).toBe('---\ntitle: The Shop\ntype: hub\n---\n# The Shop\n');
  });

  test('the real Shop/Maker/build-roster.mjs keeps to its block', () => {
    shopPalace({ builder: REAL_BUILDER, rows: [] });
    writeFileSync(path.join(root, HUB), read(HUB).replace('<!-- ROSTER:START -->', '<!-- ROSTER:START — generated by Shop/Maker/build-roster.mjs; do not edit by hand -->'));
    git(root, ['commit', '-q', '-am', 'the real marker']);
    const before = read(HUB);
    writeFileSync(path.join(root, 'Shop/OCR Smith.md'), specialist('OCR Smith', 'stub'));
    const r = refreshShopRoster({ palaceRoot: root, pageEdits: NEW_SPECIALIST });
    expect(r.refused, r.refused).toBeUndefined();
    expect(r.changed).toBe(true);
    expect(read(HUB)).toMatch(/\[\[Shop\/OCR Smith\\\|OCR Smith\]\] \| stub/);
    expect(outsideRoster(read(HUB))).toBe(outsideRoster(before));
  });
});

// Since 2026-10-18 no steward edits the house (Loudon: "I don't like the
// editing of canon without my eyes"), so no vetted page edit reaches a Shop
// page and the cycle never runs the builder. The refresh and the commit's
// handling of it are kept for when one may again.
describe('a cycle no longer reaches a Shop page, so the roster never runs from one', () => {
  test('a new Specialist and an edit to The Shop.md are both refused; the builder never runs; both stay on disk, uncommitted', () => {
    const { agentDir } = shopPalace({ rows: ['| FLUX | stub |'] }); // stale, so a builder run would change it
    writeFileSync(path.join(root, 'Shop/OCR Smith.md'), specialist('OCR Smith', 'stub'));
    const edited = read(HUB).replace("Loudon's call, not the cycle's.", 'The Shopkeeper rewrote the bet.');
    writeFileSync(path.join(root, HUB), edited);
    const summary = cycle(agentDir, cycleTranscript('sr-1', [...NEW_SPECIALIST, { path: HUB, why: 'a new bet' }]), 'plan');
    expect(summary.page_edits.allowed).toEqual([]);
    expect(summary.page_edits.refused.map((e) => [e.path, e.proposal])).toEqual([['Shop/OCR Smith.md', true], [HUB, true]]);
    expect(summary.shop_roster).toBeNull();
    expect(summary.commit.plan.paths).not.toContain('Shop/OCR Smith.md');
    expect(summary.commit.plan.paths).not.toContain(HUB);
    expect(summary.commit.plan.body).not.toMatch(/Shop roster/);
    expect(read(HUB)).toBe(edited);
    expect(history(agentDir).some((e) => /^SHOP_ROSTER/.test(e.event))).toBe(false);
  });
});

// The commit still carries a roster it is handed (cycle-commit.js), called
// here directly with the Shop page edit a cycle once followed.
describe('the commit carries a roster it is handed', () => {
  const shipped = [{ id: 'sr', type: 'BROADCAST', payload: { kind: 'shipped_artifact', headline: 'A new Specialist' } }];
  const args = (roster) => ({ palaceRoot: root, home: 'Test Steward', cycleN: 17, bundleDir: path.join(root, 'Projects/Test Steward'), messages: shipped, pageEdits: NEW_SPECIALIST, roster });

  test('commitCycle (the CLI path): The Shop.md rides as machinery, and the body says so', () => {
    shopPalace();
    writeFileSync(path.join(root, 'Shop/OCR Smith.md'), specialist('OCR Smith', 'stub'));
    const roster = refreshShopRoster({ palaceRoot: root, pageEdits: NEW_SPECIALIST });
    const res = commitCycle(args(roster));
    expect(res.ok, res.error).toBe(true);
    expect(res.roster).toMatchObject({ changed: true });
    expect(headFiles()).toEqual(expect.arrayContaining(['Shop/OCR Smith.md', HUB]));
    expect(git(root, ['show', `HEAD:${HUB}`])).toContain('| OCR Smith | stub |');
    expect(git(root, ['status', '--porcelain', '--', HUB])).toBe('');
    const body = git(root, ['log', '-1', '--format=%b']);
    expect(body).toMatch(/Regenerated the Shop roster, as machinery and not a page edit:\n- The Shop\.md § Roster — rebuilt by Shop\/Maker\/build-roster\.mjs after this cycle changed Shop\/OCR Smith\.md; nothing outside the generated block changed\n- now reads:\n  \| OCR Smith \| stub \|/);
    expect(body.split('\n\n').find((para) => para.startsWith('Changed in the workshop:'))).not.toContain(HUB);
  });

  test("planCycleCommit (the server path): the plan carries The Shop.md, and commitPathsAsync commits it", async () => {
    shopPalace();
    writeFileSync(path.join(root, 'Shop/OCR Smith.md'), specialist('OCR Smith', 'stub'));
    const plan = planCycleCommit(args(refreshShopRoster({ palaceRoot: root, pageEdits: NEW_SPECIALIST })));
    expect(plan.paths).toEqual(expect.arrayContaining(['Shop/OCR Smith.md', HUB]));
    expect(plan.body).toMatch(/Regenerated the Shop roster, as machinery and not a page edit:\n- The Shop\.md § Roster/);
    expect(git(root, ['rev-list', '--count', 'HEAD']).trim()).toBe('1'); // nothing committed yet
    const res = await commitPathsAsync({ palaceRoot: root, ...plan });
    expect(res.ok, res.error).toBe(true);
    expect(headFiles()).toEqual(expect.arrayContaining(['Shop/OCR Smith.md', HUB]));
    expect(git(root, ['log', '-1', '--format=%b'])).toMatch(/Regenerated the Shop roster/);
  });

  test('a builder that strays is refused: the Shop page still rides, The Shop.md does not, and the note says why', async () => {
    shopPalace({ builder: OVERREACHING });
    const before = read(HUB);
    writeFileSync(path.join(root, 'Shop/OCR Smith.md'), specialist('OCR Smith', 'stub'));
    const roster = refreshShopRoster({ palaceRoot: root, pageEdits: NEW_SPECIALIST });
    expect(roster.refused).toMatch(/outside the roster block/);
    const plan = planCycleCommit(args(roster));
    expect(plan.paths).toContain('Shop/OCR Smith.md');
    expect(plan.paths).not.toContain(HUB);
    expect(plan.body).toMatch(/Shop roster NOT regenerated, after this cycle changed Shop\/OCR Smith\.md:\n- the builder changed The Shop\.md outside the roster block, so the file was put back as it was; run node Shop\/Maker\/build-roster\.mjs by hand once that is settled/);
    expect(read(HUB)).toBe(before);
    const res = await commitPathsAsync({ palaceRoot: root, ...plan });
    expect(res.ok, res.error).toBe(true);
    expect(headFiles()).not.toContain(HUB);
  });
});
