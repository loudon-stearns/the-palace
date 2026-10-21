import { describe, test, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { leavingCheck, leaveStewardship, leftSection } from '../../src/leave.js';
import { proposalLines } from '../../src/ledger.js';
import { MARK, readPlan } from '../../src/scroll-file.js';

// How a project leaves stewardship (Loudon, 2026-10-21): a steward leaves when
// its page ends, never deciding the end; what it left standing is settled
// first; then the Plan closes, the scroll takes its last entry, and the
// runtime is taken off the registry and deleted.

const TS = '2026-10-21T10:00:00-04:00';

describe('leaving stewardship', () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

  const page = (status, stage) => `---\ntitle: "Keys"\ntype: project\nstatus: ${status}\nstage: ${stage}\nforward_vector: "x"\n---\n# Keys\n`;
  const scroll = (plan) => [
    '# Keys — scroll', '', MARK.nowStart, '## Now', '', MARK.nowEnd, '', '## Plan', '', MARK.planStart, plan, MARK.planEnd, '',
    '## Standing Orders', '', MARK.ordersStart, MARK.ordersEnd, '', '## The making', '', MARK.makingStart,
    '<!-- scroll:entry id="keys-001" -->', '### 2026-10-01 — cycle 1', '', 'made a thing', '<!-- /scroll:entry -->', MARK.makingEnd, '',
  ].join('\n');
  const ask = { schema_version: '1.0', id: 'keys-007', request_id: 'keys-007', ts: '2026-10-10T00:00:00Z', from: 'Keys', to: 'TRICKSTER', type: 'RESOURCE_REQUEST', board: 'TRICKSTER', payload: { resource: 'directional_decision', decision_topic: 'which voice', blocking: false } };

  const palace = ({ status = 'complete', stage = 'fruiting', plan = null, owed = false } = {}) => {
    root = mkdtempSync(path.join(tmpdir(), 'leave-'));
    mkdirSync(path.join(root, 'Projects/Keys'), { recursive: true });
    mkdirSync(path.join(root, '_ops/agents/permanent/keys'), { recursive: true });
    writeFileSync(path.join(root, 'Projects/Keys.md'), page(status, stage));
    for (const f of ['manifest.json', 'state.json', 'history.jsonl']) writeFileSync(path.join(root, '_ops/agents/permanent/keys', f), '{}\n');
    writeFileSync(path.join(root, '_ops/agents/permanent/REGISTRY.json'), JSON.stringify({ schema_version: '1.0', agents: [
      { agent_id: 'Keys', home: 'Keys', dir: '_ops/agents/permanent/keys', registered_at: '2026-10-13T23:04:01Z' },
      { agent_id: 'Other', home: 'Other', dir: '_ops/agents/permanent/other', registered_at: '2026-10-13T23:04:02Z' },
    ] }, null, 2));
    if (plan != null) writeFileSync(path.join(root, 'Projects/Keys/Keys — scroll.md'), scroll(plan));
    if (owed) writeFileSync(path.join(root, 'Projects/Keys/Keys — tuning.md'), ['# Keys — tuning', '', ...proposalLines(2, { page: 'Keys', path: 'Projects/Keys.md', entry: true, exists: true, place: '§ What Exists', words: '- x', why: 'y', date: '2026-10-20', by: 'proposed by the steward, cycle 3' }), ''].join('\n'));
    return root;
  };
  const registered = () => JSON.parse(readFileSync(path.join(root, '_ops/agents/permanent/REGISTRY.json'), 'utf8')).agents.map((a) => a.agent_id);

  test('a page that has not ended keeps its steward; a resting one is told so', () => {
    palace({ status: 'active', stage: 'growing' });
    expect(leavingCheck({ palaceRoot: root, home: 'Keys' }).blockers[0]).toMatch(/has not ended .* never decides the end/);
    rmSync(root, { recursive: true, force: true });
    palace({ status: 'active', stage: 'dormant' });
    const c = leavingCheck({ palaceRoot: root, home: 'Keys' });
    expect(c.ended).toBe(null);
    expect(c.blockers[0]).toMatch(/resting \(stage: dormant\).*Revival Ceremony/);
    expect(leaveStewardship({ palaceRoot: root, home: 'Keys', ts: TS }).left).toBe(false);
    expect(existsSync(path.join(root, '_ops/agents/permanent/keys'))).toBe(true);
  });

  test('an open ask, an owed proposal and an unclosed Plan each stand in the way, and nothing is written', () => {
    palace({ plan: 'Build the keys, then the voice.', owed: true });
    const c = leavingCheck({ palaceRoot: root, home: 'Keys', board: [ask] });
    expect(c.ended).toMatchObject({ how: 'complete' });
    expect(c.asks.map((a) => a.request_id)).toEqual(['keys-007']);
    expect(c.proposals.map((p) => p.n)).toEqual(['2']);
    expect(c.scroll).toMatchObject({ exists: true, plan: true });
    expect(c.blockers).toHaveLength(3);
    const before = readFileSync(path.join(root, 'Projects/Keys/Keys — scroll.md'), 'utf8');
    expect(leaveStewardship({ palaceRoot: root, home: 'Keys', board: [ask], planClose: 'Let go.', ts: TS }).left).toBe(false);
    expect(readFileSync(path.join(root, 'Projects/Keys/Keys — scroll.md'), 'utf8')).toBe(before);
    expect(registered()).toEqual(['Keys', 'Other']);
  });

  test('an answered ask no longer stands in the way', () => {
    palace();
    const deny = { schema_version: '1.0', id: 'resp-1', ts: '2026-10-21T00:00:00Z', from: 'TRICKSTER', to: 'Keys', type: 'RESOURCE_DENY', board: 'TRICKSTER', re: 'keys-007', payload: { notes: 'left stewardship: finished' } };
    expect(leavingCheck({ palaceRoot: root, home: 'Keys', board: [ask, deny] }).blockers).toEqual([]);
  });

  test('with nothing in the way: the Plan closes, the scroll takes its last entry, the steward is deregistered and its runtime deleted', () => {
    palace({ plan: 'Build the keys, then the voice.' });
    const r = leaveStewardship({ palaceRoot: root, home: 'Keys', why: 'finished', planClose: 'The voice move is let go; the keys are done.', ts: TS });
    expect(r.left).toBe(true);
    expect(r.changed).toEqual(['Projects/Keys/Keys — scroll.md', '_ops/agents/permanent/REGISTRY.json', '_ops/agents/permanent/keys']);
    expect(registered()).toEqual(['Other']);
    expect(existsSync(path.join(root, '_ops/agents/permanent/keys'))).toBe(false);
    const text = readFileSync(path.join(root, 'Projects/Keys/Keys — scroll.md'), 'utf8');
    expect(readPlan(text)).toBe('Build the keys, then the voice.\n\n**Left stewardship, 2026-10-21.** The voice move is let go; the keys are done.');
    const making = text.slice(text.indexOf(MARK.makingStart));
    expect(making.indexOf('### 2026-10-21 — Left stewardship: finished')).toBeLessThan(making.indexOf('Plan revised: closed'));
    expect(making).toContain('<!-- scroll:entry id="keys-001" -->'); // the trail only grows
    // Done once: a second run finds no steward to retire.
    expect(leavingCheck({ palaceRoot: root, home: 'Keys' }).blockers).toEqual(['Keys has no steward to retire.']);
  });

  test('a page with no scroll leaves through the registry and its runtime alone, and the end says why by itself', () => {
    palace();
    const r = leaveStewardship({ palaceRoot: root, home: 'Keys', ts: TS });
    expect(r.changed).toEqual(['_ops/agents/permanent/REGISTRY.json', '_ops/agents/permanent/keys']);
    expect(leftSection({ id: 'left-stewardship-2026-10-21', date: '2026-10-21', why: 'finished (status: complete)', dir: '_ops/agents/permanent/keys' }))
      .toContain('### 2026-10-21 — Left stewardship: finished (status: complete)');
  });

  test('a registry row pointing outside the permanent agents is never deleted', () => {
    palace();
    const reg = path.join(root, '_ops/agents/permanent/REGISTRY.json');
    mkdirSync(path.join(root, 'Projects/Keys/proofs'), { recursive: true });
    writeFileSync(reg, JSON.stringify({ schema_version: '1.0', agents: [{ agent_id: 'Keys', home: 'Keys', dir: 'Projects/Keys/proofs', registered_at: 'x' }] }));
    expect(() => leaveStewardship({ palaceRoot: root, home: 'Keys', ts: TS })).toThrow(/refusing to delete/);
    expect(existsSync(path.join(root, 'Projects/Keys/proofs'))).toBe(true);
  });
});
