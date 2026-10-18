import { describe, test, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { readTrigger, isCeremony, listCeremonies, ceremonyCanonPaths } from '../../src/ceremony-scroll.js';
import { appendLedgerLine, orderLine, readTuningState, renderLedgerSection, parseRuns } from '../../src/ledger.js';
import {
  MARK, materializeScroll, readStandingOrders, readPlan, writePlan, updateScrollText, retireOldShape,
  CEREMONY_STANDING_PLACEHOLDER, PLAN_PLACEHOLDER,
} from '../../src/scroll-file.js';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

describe('the trigger field', () => {
  test('a list of words, a single string read as one, nothing when empty', () => {
    expect(readTrigger({ trigger: ['deposit', "let's deposit"] })).toEqual(['deposit', "let's deposit"]);
    expect(readTrigger({ trigger: 'spore check' })).toEqual(['spore check']);
    expect(readTrigger({ trigger: [] })).toBe(null);
    expect(readTrigger({ trigger: ['  '] })).toBe(null);
    expect(readTrigger({})).toBe(null);
    expect(readTrigger(null)).toBe(null);
  });
});

describe('which pages are ceremonies', () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

  function palace() {
    root = mkdtempSync(path.join(tmpdir(), 'palace-register-'));
    for (const d of ['_ops/Walk Ceremony', 'Closing Well', 'Palace development/Sentry', 'Projects/Generative Sample Libraries', 'Old/Archive']) mkdirSync(path.join(root, d), { recursive: true });
    // A card in _ops, with its ledger and its Context.
    writeFileSync(path.join(root, '_ops/Walk Ceremony.md'), '---\ntitle: "Walk Ceremony"\ntrigger: ["walk", "let\'s walk"]\n---\n# Walk\n');
    writeFileSync(path.join(root, '_ops/Walk Ceremony/Walk Ceremony — tuning.md'), '# t\n');
    writeFileSync(path.join(root, '_ops/Walk Ceremony/Walk Ceremony — Context.md'), '# c\n');
    // A ceremony at the root with no "Ceremony" in its name; its thin card carries no trigger.
    writeFileSync(path.join(root, 'Closing Well.md'), '---\ntitle: "Closing Well"\ntrigger: ["close well"]\n---\n');
    writeFileSync(path.join(root, 'Closing Well/Closing Well — Context.md'), '# c\n');
    writeFileSync(path.join(root, '_ops/Closing Well Ceremony.md'), '---\ntitle: "Closing Well Ceremony"\n---\n# the card\n');
    // A ceremony with no tuning ledger yet still counts.
    writeFileSync(path.join(root, 'Palace development/Sentry.md'), '---\ntitle: "Sentry"\ntrigger:\n  - sentry sweep\n---\n');
    // A project that keeps a tuning ledger is NOT a ceremony (v1.28).
    writeFileSync(path.join(root, 'Projects/Generative Sample Libraries.md'), '---\ntitle: "Generative Sample Libraries"\ntype: project\n---\n');
    writeFileSync(path.join(root, 'Projects/Generative Sample Libraries/Generative Sample Libraries — tuning.md'), '# t\n');
    // Prose about a trigger, an archived ceremony, a symlinked copy: none count.
    writeFileSync(path.join(root, 'Notes.md'), '---\ntitle: "Notes"\n---\ntrigger: ["not frontmatter"]\n');
    writeFileSync(path.join(root, 'Old/Archive/Old Ceremony.md'), '---\ntrigger: ["old"]\n---\n');
    symlinkSync(path.join(root, '_ops/Walk Ceremony.md'), path.join(root, 'Walk_Ceremony.md'));
    return root;
  }

  test('the list is every page carrying trigger:, wherever it lives, with its ledger if it keeps one', () => {
    palace();
    expect(listCeremonies(root)).toEqual([
      { title: 'Closing Well', path: 'Closing Well.md', trigger: ['close well'], tuning: null },
      { title: 'Sentry', path: 'Palace development/Sentry.md', trigger: ['sentry sweep'], tuning: null },
      { title: 'Walk Ceremony', path: '_ops/Walk Ceremony.md', trigger: ['walk', "let's walk"], tuning: '_ops/Walk Ceremony/Walk Ceremony — tuning.md' },
    ]);
  });

  test('a tuning ledger no longer makes a page a ceremony; the field does', () => {
    palace();
    expect(isCeremony(root, 'Walk Ceremony')).toBe(true);
    expect(isCeremony(root, 'Sentry')).toBe(true);
    expect(isCeremony(root, 'Generative Sample Libraries')).toBe(false);
    expect(isCeremony(root, 'Notes')).toBe(false);
    expect(isCeremony(root, 'Nobody')).toBe(false);
  });

  test('ceremony canon is each ceremony page and the Context companion it keeps', () => {
    palace();
    expect([...ceremonyCanonPaths(root)].sort()).toEqual([
      'Closing Well.md', 'Closing Well/Closing Well — Context.md', 'Palace development/Sentry.md',
      '_ops/Walk Ceremony.md', '_ops/Walk Ceremony/Walk Ceremony — Context.md',
    ]);
  });
});

describe('a ceremony\'s scroll, drawn by the one materializer', () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', env: gitFreeEnv(), stdio: ['ignore', 'pipe', 'ignore'] });
  const card = (v) => ['---', 'title: "Return Ceremony"', 'type: practice', 'stage: growing', 'trigger: ["I\'m back", "return"]', v == null ? null : `version: ${v}`, '---', '', '# Return Ceremony', ''].filter((l) => l != null).join('\n');
  const LEDGER = () => path.join(root, '_ops/Return Ceremony/Return Ceremony — tuning.md');
  const SCROLL = () => path.join(root, '_ops/Return Ceremony/Return Ceremony — scroll.md');
  const commit = (msg, date) => { git('add', '-A'); execFileSync('git', ['commit', '-q', '-m', msg], { cwd: root, env: gitFreeEnv({ GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date }) }); };

  function palace() {
    root = mkdtempSync(path.join(tmpdir(), 'palace-ceremony-'));
    git('init', '-q');
    assertScratchRepo(root);
    git('config', 'user.email', 't@t'); git('config', 'user.name', 't');
    mkdirSync(path.join(root, '_ops/Return Ceremony'), { recursive: true });
    mkdirSync(path.join(root, '_ops/swarm/persistent'), { recursive: true });
    writeFileSync(path.join(root, '_ops/swarm/persistent/blackboard.jsonl'), '');
    writeFileSync(path.join(root, '_ops/Return Ceremony.md'), card(null));
    commit('add the card', '2026-09-01T10:00:00Z');
    writeFileSync(path.join(root, '_ops/Return Ceremony.md'), card('"1.0"'));
    writeFileSync(LEDGER(), '# Return Ceremony — tuning\n\n## From the first return — 2026-09-02\n\n1. **A debt.** Spec change owed: a probe.\n');
    commit('edit(Return Ceremony): v1.0 — version, tuning ledger\n\nThe reason for 1.0.', '2026-09-02T10:00:00Z');
    appendLedgerLine(LEDGER(), '- run · 2026-09-03 · v1.0 · a gap · taught item 1');
    commit('return(2026-09-03): a gap\n\nWhat the gap held.', '2026-09-03T10:00:00Z');
    writeFileSync(path.join(root, '_ops/Return Ceremony.md'), card(1));   // a reformat, not a change
    commit('edit(Return Ceremony): quote the version', '2026-09-04T10:00:00Z');
    writeFileSync(path.join(root, '_ops/Return Ceremony.md'), card('"1.1"'));
    commit('edit(Return Ceremony): v1.1 — a new probe', '2026-09-05T10:00:00Z');
    appendLedgerLine(LEDGER(), '- run · 2026-09-06 · v1.1 · back again · nothing new');
    commit('return(2026-09-06): back again', '2026-09-06T10:00:00Z');
    writeFileSync(path.join(root, 'note.md'), 'z');
    commit('return(2026-09-07): a commit subject alone is not a run', '2026-09-07T10:00:00Z');
    return root;
  }

  test('state: the spec change is the last VALUE change, and runs are the ledger\'s run lines', () => {
    palace();
    const st = readTuningState(root, 'Return Ceremony');
    expect(st.version).toBe('1.1');
    expect(st.versions.map((c) => c.version)).toEqual(['1.0', '1.1']);   // the reformat is not a change
    expect(st.spec.subject).toBe('edit(Return Ceremony): v1.1 — a new probe');
    expect(st.runs.map((r) => r.what)).toEqual(['back again', 'a gap']);   // newest first; the bare commit is not counted
    expect(st.runs_since.map((r) => r.what)).toEqual(['back again']);
    expect(st.owed.map((o) => o.n)).toEqual(['1']);
    expect(st.versions[0].lead).toBe('The reason for 1.0.');
    appendLedgerLine(LEDGER(), '- run · 2026-09-08 · v1.1 · uncommitted · nothing new');
    expect(readTuningState(root, 'Return Ceremony').runs_since.map((r) => r.what)).toEqual(['uncommitted', 'back again']);
  });

  test('Now shows the runs block — and no board block, for a ceremony that never speaks on the board', () => {
    palace();
    const r = materializeScroll({ palaceRoot: root, home: 'Return Ceremony', tsNow: '2026-09-08T00:00:00Z', dryRun: true });
    expect(r.kind).toBe('ceremony');
    const t = r.text;
    expect(t).toMatch(/from the entry's frontmatter, its tuning ledger and git\. This zone is machine-owned — the ceremony is steered by the \*\*Plan\*\* and \*\*Standing Orders\*\*/);
    expect(t).toMatch(/- \*\*Status:\*\* — · \*\*Stage:\*\* growing\n/);
    expect(t).toMatch(/\*\*Plan:\*\* none agreed yet — the next run works from what the ledger owes/);
    expect(t).toMatch(/\*\*Version:\*\* v1\.1 · the spec last changed 2026-09-05/);
    expect(t).toMatch(/\*\*Runs since the change:\*\* 1 run on 1 day/);
    expect(t).toMatch(/\*\*Last run:\*\* 2026-09-06 — back again · nothing new \(under v1\.1\)/);
    expect(t).toMatch(/\*\*Owed in the ledger:\*\* 1 — item 1/);
    expect(t).toMatch(/Latest lesson:\*\* item 1, from the first return/);
    expect(t).not.toContain('Waiting on you');
    expect(t).not.toContain('### Open asks');
  });

  test('a handoff once posted in the ceremony\'s name does not make it a board page', () => {
    palace();
    const board = [{ id: 'h-1', ts: '2026-09-04T10:00:00Z', from: 'Return Ceremony', to: '*', type: 'BROADCAST', board: 'GENERAL', payload: { kind: 'handoff_ready', entry: 'Return Ceremony', move: 'x' } }];
    const t = materializeScroll({ palaceRoot: root, home: 'Return Ceremony', tsNow: 'x', board, dryRun: true }).text;
    expect(t).not.toContain('### Where this stands');
    expect(t).toContain('**Version:** v1.1');
  });

  test('an owed one-shot order shows in Now until a run pays it', () => {
    palace();
    appendLedgerLine(LEDGER(), orderLine('2026-09-08', 'Ask before adding a probe.'));
    const a = materializeScroll({ palaceRoot: root, home: 'Return Ceremony', tsNow: 'x', dryRun: true }).text;
    expect(a).toMatch(/\*\*Owed in the ledger:\*\* 2 — item 1 and 1 order from Loudon/);
    expect(a).toContain('- **From Loudon, 2026-09-08.** Ask before adding a probe.');
    writeFileSync(LEDGER(), readFileSync(LEDGER(), 'utf8').replace('Ask before adding a probe. · owed', 'Ask before adding a probe. · paid in item 2'));
    expect(materializeScroll({ palaceRoot: root, home: 'Return Ceremony', tsNow: 'x', dryRun: true }).text).not.toContain('From Loudon');
  });

  test('an uncommitted version change is said as such', () => {
    palace();
    writeFileSync(path.join(root, '_ops/Return Ceremony.md'), card('"1.2"'));
    expect(materializeScroll({ palaceRoot: root, home: 'Return Ceremony', tsNow: 'x', dryRun: true }).text).toMatch(/v1\.2 · changed in the working tree, not committed yet/);
  });

  test('a new scroll has all four zones — a Plan too — and a second pass adds only what is new', () => {
    palace();
    const r1 = materializeScroll({ palaceRoot: root, home: 'Return Ceremony', tsNow: '2026-09-08T00:00:00Z' });
    expect(r1.created).toBe(true);
    const text = readFileSync(SCROLL(), 'utf8');
    for (const m of Object.values(MARK)) expect(text).toContain(m);
    expect(readPlan(text)).toBe('');
    expect(text).toContain(PLAN_PLACEHOLDER);
    expect(text).toContain('label: scroll-for');
    expect(text).toContain('The card [[Return Ceremony]] stays the spec, and its lessons live in [[Return Ceremony — tuning]]');
    expect(readStandingOrders(text)).toBe('');   // the placeholder reads as no orders
    expect(text).toContain(CEREMONY_STANDING_PLACEHOLDER);
    expect(CEREMONY_STANDING_PLACEHOLDER).toMatch(/holds until he revokes it/);
    expect(r1.added_sections).toBe(4);           // two runs, two version changes
    const order = ['back again', 'the spec moved to v1.1', 'a gap', 'the spec moved to v1.0'].map((t) => text.indexOf(t));
    expect(order).toEqual([...order].sort((a, b) => a - b));   // newest first, each run after the change it ran under

    appendLedgerLine(LEDGER(), '- run · 2026-09-09 · v1.1 · a third · nothing new');
    const r2 = materializeScroll({ palaceRoot: root, home: 'Return Ceremony', tsNow: '2026-09-10T00:00:00Z' });
    expect(r2.created).toBe(false);
    expect(r2.added_sections).toBe(1);
    expect(readFileSync(SCROLL(), 'utf8').match(/scroll:entry id="run-/g).length).toBe(3);
  });

  test('a ceremony takes a Plan, logged on its trail, and its Standing Orders survive a regeneration', () => {
    palace();
    materializeScroll({ palaceRoot: root, home: 'Return Ceremony' });
    const w = writePlan({ palaceRoot: root, home: 'Return Ceremony', plan: 'Fold the Cowork probe into the block, then pay items 7 to 10.', why: 'the owed probes keep recurring', ts: '2026-09-09T12:00:00+00:00' });
    expect(w.written).toBe(true);
    let text = readFileSync(SCROLL(), 'utf8');
    expect(readPlan(text)).toBe('Fold the Cowork probe into the block, then pay items 7 to 10.');
    expect(text).toMatch(/### 2026-09-09 — Plan agreed/);
    const s = text.indexOf(MARK.ordersStart) + MARK.ordersStart.length;
    const e = text.indexOf(MARK.ordersEnd);
    writeFileSync(SCROLL(), `${text.slice(0, s)}\nAsk before adding a probe.\n${text.slice(e)}`);
    materializeScroll({ palaceRoot: root, home: 'Return Ceremony' });
    text = readFileSync(SCROLL(), 'utf8');
    expect(readStandingOrders(text)).toBe('Ask before adding a probe.');
    expect(text).toMatch(/\*\*Plan:\*\* agreed 2026-09-09/);
  });

  test('a ceremony scroll made before v1.28 is re-made: a Plan, its new voice and placeholder; hand edits kept', () => {
    palace();
    const old = [
      '---', 'title: "Return Ceremony — scroll"', 'born: 2026-09-25', 'links:', '  - target: "[[Return Ceremony]]"', '    type: connects-to', '    label: scroll-for',
      'forward_vector: "I am Return Ceremony\'s scroll — the one page that opens on which version of the ceremony is live, whether it has run since it last changed, and what its tuning ledger still owes, then reads down through its runs and version changes, newest first. My top is regenerated whenever anyone looks; my standing orders are Loudon\'s; my trail only ever grows."',
      '---', '', '# Return Ceremony — scroll', '',
      '> The ceremony\'s front door. **Now** is regenerated on every look — its version, its runs since the spec last changed, what its ledger owes; **Standing Orders** are Loudon\'s; **The making** is the trail of runs and version changes, newest first. The card [[Return Ceremony]] stays the spec, and its lessons live in [[Return Ceremony — tuning]]. Rendered in [[STIGMERGY]]\'s PROJECTS deck. See [[The Scroll]].',
      '', MARK.nowStart, '## Now', MARK.nowEnd, '', '## Standing Orders', '', MARK.ordersStart,
      '_Loudon\'s standing direction for this ceremony. An order saved on the PROJECTS deck goes into the tuning ledger as owed; the next run\'s tail read picks it up, and Now shows it as owed until a run acts on it._',
      MARK.ordersEnd, '', '## The making', '', MARK.makingStart, '<!-- scroll:entry id="hand-1" -->', '### a hand-written section', '<!-- /scroll:entry -->', MARK.makingEnd, '',
    ].join('\n');
    writeFileSync(SCROLL(), old);
    materializeScroll({ palaceRoot: root, home: 'Return Ceremony' });
    const text = readFileSync(SCROLL(), 'utf8');
    expect(text).toContain(MARK.planStart);
    expect(text.indexOf('## Plan')).toBeLessThan(text.indexOf('## Standing Orders'));
    expect(text).toContain('then the plan it is following');
    expect(text).toContain('the **Plan** is the path agreed with Loudon');
    expect(text).toContain(CEREMONY_STANDING_PLACEHOLDER);
    expect(text).not.toContain('goes into the tuning ledger as owed; the next run');
    expect(text).toContain('### a hand-written section');
    // Idempotent: a second pass changes nothing but Now.
    const again = retireOldShape(text, { home: 'Return Ceremony', kind: 'ceremony' });
    expect(again).toBe(text);
  });

  test('real orders written in an old scroll are kept, not swapped for the placeholder', () => {
    const t = `${MARK.nowStart}\n${MARK.nowEnd}\n\n## Standing Orders\n\n${MARK.ordersStart}\nNever skip the probe.\n${MARK.ordersEnd}\n`;
    expect(retireOldShape(t, { home: 'X', kind: 'ceremony' })).toContain(`${MARK.ordersStart}\nNever skip the probe.\n${MARK.ordersEnd}`);
  });
});

describe('sections', () => {
  test('a run and a version change each render with their key', () => {
    const [r] = parseRuns('- run · 2026-09-03 · v1.0 · a gap · taught item 1');
    const run = renderLedgerSection({ ...r, kind: 'run' });
    expect(run).toContain(`<!-- scroll:entry id="${r.key}" -->`);
    expect(run).toContain('### 2026-09-03 — a gap');
    expect(run).toContain('taught item 1');
    expect(run).toContain('a run under v1.0');
    const [bare] = parseRuns('- run · 2026-10-15 · cycle 38 · nothing new');
    expect(renderLedgerSection({ ...bare, kind: 'run' })).toContain('<sub>a run · its line in the tuning ledger</sub>');
    const ver = renderLedgerSection({ kind: 'version', key: 'version-abc', hash: 'abcdef1234', ts: '2026-09-05T10:00:00Z', subject: 'edit(X): v1.1', version: '1.1', lead: '' });
    expect(ver).toContain('the spec moved to v1.1');
  });

  test('updateScrollText keeps an unmarked hand-made scroll untouched', () => {
    const r = updateScrollText('# a hand-made scroll', { nowText: 'x', newSections: [] });
    expect(r.applied).toBe(false);
  });
});
