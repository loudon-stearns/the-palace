import { describe, test, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { sliceBoardSinceCursor, filterBoardForAgent, buildCyclePrompt, findEntryFile, defaultMandate } from '../../src/build-cycle-prompt.js';
import { MARK, ORDERS_PLACEHOLDER, PLAN_PLACEHOLDER } from '../../src/scroll-file.js';

describe('sliceBoardSinceCursor', () => {
  const lines = [
    JSON.stringify({ id: 'a' }),
    JSON.stringify({ id: 'b' }),
    JSON.stringify({ id: 'c' }),
  ];

  test('no cursor returns the whole board', () => {
    expect(sliceBoardSinceCursor(lines, null)).toEqual(lines);
    expect(sliceBoardSinceCursor(lines, undefined)).toEqual(lines);
  });

  test('returns only lines after the cursor (cursor line excluded)', () => {
    expect(sliceBoardSinceCursor(lines, 'a')).toEqual([lines[1], lines[2]]);
    expect(sliceBoardSinceCursor(lines, 'b')).toEqual([lines[2]]);
    expect(sliceBoardSinceCursor(lines, 'c')).toEqual([]);
  });

  test('cursor not found yields an empty slice', () => {
    expect(sliceBoardSinceCursor(lines, 'zzz')).toEqual([]);
  });

  test('tolerates malformed lines while scanning for the cursor', () => {
    const withJunk = ['garbage', JSON.stringify({ id: 'a' }), JSON.stringify({ id: 'b' })];
    expect(sliceBoardSinceCursor(withJunk, 'a')).toEqual([withJunk[2]]);
  });
});

describe('filterBoardForAgent', () => {
  const ME = 'My Project';
  const L = {
    toMe: JSON.stringify({ id: 'm1', type: 'RESOURCE_GRANT', from: 'TRICKSTER', to: ME, re: 'other' }),
    fromMe: JSON.stringify({ id: 'm2', type: 'RESOURCE_REQUEST', from: ME, to: 'TRICKSTER' }),
    respToMyAsk: JSON.stringify({ id: 'm3', type: 'RESOURCE_GRANT', from: 'TRICKSTER', to: 'someone-else', re: 'myask-1' }),
    nbhBroadcast: JSON.stringify({ id: 'm4', type: 'BROADCAST', from: 'Neighbor A', to: '*' }),
    strangerBroadcast: JSON.stringify({ id: 'm5', type: 'BROADCAST', from: 'Stranger', to: '*' }),
    othersRequest: JSON.stringify({ id: 'm6', type: 'RESOURCE_REQUEST', from: 'Stranger', to: 'TRICKSTER' }),
    grantToOther: JSON.stringify({ id: 'm7', type: 'RESOURCE_GRANT', from: 'TRICKSTER', to: 'someone-else' }),
    flagToAll: JSON.stringify({ id: 'm8', type: 'FLAG', from: 'Neighbor A', to: '*' }),
    flagFromStranger: JSON.stringify({ id: 'm9', type: 'FLAG', from: 'Stranger', to: '*' }),
  };
  const all = Object.values(L);

  test('keeps messages addressed to me, my own, and responses to my asks', () => {
    const kept = filterBoardForAgent(all, { agentId: ME, neighborhood: ['Neighbor A'], requestIds: ['myask-1'] });
    expect(kept).toContain(L.toMe);
    expect(kept).toContain(L.fromMe);
    expect(kept).toContain(L.respToMyAsk);
  });

  test('with a neighborhood, keeps neighbor broadcasts and drops stranger broadcasts + others\' directed traffic', () => {
    const kept = filterBoardForAgent(all, { agentId: ME, neighborhood: ['Neighbor A'], requestIds: [] });
    expect(kept).toContain(L.nbhBroadcast);
    expect(kept).toContain(L.flagToAll);            // FLAG to '*' from a neighbor counts as a neighbor broadcast
    expect(kept).not.toContain(L.strangerBroadcast);
    expect(kept).not.toContain(L.flagFromStranger);
    expect(kept).not.toContain(L.othersRequest);    // other steward's ask to TRICKSTER
    expect(kept).not.toContain(L.grantToOther);     // grant addressed to a different agent
  });

  test('with no neighborhood, falls back to keeping all broadcasts (spec-faithful)', () => {
    const kept = filterBoardForAgent(all, { agentId: ME, neighborhood: [], requestIds: [] });
    expect(kept).toContain(L.nbhBroadcast);
    expect(kept).toContain(L.strangerBroadcast);
    expect(kept).not.toContain(L.othersRequest);    // still drops directed non-broadcast traffic
    expect(kept).not.toContain(L.grantToOther);
  });

  test('preserves order and keeps unparseable lines (never hides signal)', () => {
    const lines = ['not json', L.nbhBroadcast, L.othersRequest, L.fromMe];
    const kept = filterBoardForAgent(lines, { agentId: ME, neighborhood: ['Neighbor A'] });
    expect(kept).toEqual(['not json', L.nbhBroadcast, L.fromMe]);
  });

  test('empty/absent options default safely', () => {
    expect(filterBoardForAgent([], { agentId: ME })).toEqual([]);
    // no opts at all → agentId undefined, no neighborhood → all broadcasts kept, directed dropped
    expect(filterBoardForAgent([L.nbhBroadcast, L.grantToOther])).toEqual([L.nbhBroadcast]);
  });
});

describe('buildCyclePrompt (integration)', () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

  function makePalace({ state, history = '', board = [], home = 'My Project', neighborhood = [], frontmatterStage = 'growing' } = {}) {
    root = mkdtempSync(path.join(tmpdir(), 'palace-bcp-'));
    const agentRel = '_ops/agents/permanent/my-project';
    const agentDir = path.join(root, agentRel);
    mkdirSync(agentDir, { recursive: true });
    mkdirSync(path.join(root, '_ops/swarm/persistent'), { recursive: true });
    // Minimal skill template.
    const promptsDir = path.join(root, '_ops/orchestrator/prompts');
    mkdirSync(promptsDir, { recursive: true });
    writeFileSync(path.join(promptsDir, 'steward.md'), 'STEWARD SYSTEM home={{home}} cycle={{cycle_id}} stage={{stage_at_last_activation}}');
    // Steward dir files.
    writeFileSync(path.join(agentDir, 'manifest.json'), JSON.stringify({
      agent_id: home, home, session_id: 'sess-xyz', neighborhood, stewardship: { stage_at_spawn: 'growing' },
    }));
    writeFileSync(path.join(agentDir, 'state.json'), JSON.stringify(state));
    writeFileSync(path.join(agentDir, 'history.jsonl'), history);
    // Home entry + board.
    writeFileSync(path.join(root, `${home}.md`), `---\ntitle: "${home}"\nstage: ${frontmatterStage}\n---\n# ${home}\nbody text here\n`);
    writeFileSync(path.join(root, '_ops/swarm/persistent/blackboard.jsonl'), board.map((m) => JSON.stringify(m)).join('\n'));
    return { agentRel, home };
  }

  test('first activation framing + full board + output protocol', () => {
    const { agentRel, home } = makePalace({
      state: { iteration: 0, last_active: null, last_read_cursor: null },
      board: [{ id: 'x1', type: 'BROADCAST' }, { id: 'x2', type: 'BROADCAST' }],
    });
    const { systemPrompt, userTurn, full } = buildCyclePrompt({ palaceRoot: root, agentDir: agentRel, cycleN: 1, today: '2026-05-27' });

    expect(systemPrompt).toContain('home=My Project');
    expect(systemPrompt).toContain('cycle=cycle-1-2026-05-27');
    expect(userTurn).toContain('first activation');
    expect(userTurn).toContain('since first activation');
    expect(userTurn).toContain('filtered to your neighborhood');
    expect(userTurn).toContain('x1');
    expect(userTurn).toContain('x2');
    expect(userTurn).toContain('body text here'); // home entry inlined
    expect(userTurn).toContain('"My Project"'); // from field in output protocol
    expect(userTurn).toContain('sess-xyz');     // session_id in output protocol
    expect(full).toBe(systemPrompt + '\n\n---\n\n' + userTurn);
  });

  test('resumed framing slices the board since the cursor and honors extraMandate', () => {
    const { agentRel } = makePalace({
      state: { iteration: 2, last_active: '2026-05-26T10:00:00Z', last_read_cursor: 'x1' },
      board: [{ id: 'x1', type: 'BROADCAST' }, { id: 'x2', type: 'BROADCAST' }],
    });
    const { userTurn } = buildCyclePrompt({
      palaceRoot: root, agentDir: agentRel, cycleN: 3, today: '2026-05-27', extraMandate: 'DO THE SPECIFIC THING',
    });
    expect(userTurn).toContain('You last ran at');
    expect(userTurn).toContain('since your cursor ("x1")');
    expect(userTurn).toContain('x2');
    expect(userTurn).not.toContain('"id":"x1"'); // x1 is the cursor — excluded from the slice
    expect(userTurn).toContain('DO THE SPECIFIC THING');
    // Not a git repo → page-change detection degrades to the "no commits" branch.
    expect(userTurn).toContain('No commits have touched your home entry');
  });

  test('board slice is relevance-filtered: neighbor broadcasts + my mail kept, stranger noise dropped', () => {
    const { agentRel } = makePalace({
      home: 'My Project',
      neighborhood: ['Neighbor A'],
      state: {
        iteration: 2,
        last_active: '2026-05-26T10:00:00Z',
        last_read_cursor: 'c0',
        pending_requests: [{ request_id: 'myask-1' }],
      },
      board: [
        { id: 'c0', type: 'BROADCAST', from: 'Neighbor A', to: '*' }, // cursor (excluded by temporal slice)
        { id: 'keep-grant', type: 'RESOURCE_GRANT', from: 'TRICKSTER', to: 'My Project', re: 'myask-1' },
        { id: 'keep-nbh', type: 'BROADCAST', from: 'Neighbor A', to: '*' },
        { id: 'drop-stranger-bcast', type: 'BROADCAST', from: 'Stranger', to: '*' },
        { id: 'drop-others-ask', type: 'RESOURCE_REQUEST', from: 'Stranger', to: 'TRICKSTER' },
        { id: 'drop-grant-other', type: 'RESOURCE_GRANT', from: 'TRICKSTER', to: 'Stranger' },
      ],
    });
    const { userTurn } = buildCyclePrompt({ palaceRoot: root, agentDir: agentRel, cycleN: 3, today: '2026-05-27' });
    expect(userTurn).toContain('keep-grant');             // grant addressed to me (and re-matches my ask)
    expect(userTurn).toContain('keep-nbh');               // neighbor broadcast
    expect(userTurn).not.toContain('drop-stranger-bcast'); // broadcast from outside the neighborhood
    expect(userTurn).not.toContain('drop-others-ask');     // another steward's ask to TRICKSTER
    expect(userTurn).not.toContain('drop-grant-other');    // grant addressed to a different agent
    expect(userTurn).toContain('other swarm traffic is omitted'); // transparency note present
  });

  test('Phase 1a — the steward stage is read LIVE from frontmatter, overriding the stored copy', () => {
    const { agentRel } = makePalace({
      // Frontmatter says mature; the stale stored copies say seed/growing. Frontmatter must win.
      frontmatterStage: 'mature',
      state: {
        iteration: 2, last_active: '2026-05-26T10:00:00Z', last_read_cursor: 'c0',
        stewardship: { stage_at_last_activation: 'seed' },
      },
    });
    const { systemPrompt } = buildCyclePrompt({ palaceRoot: root, agentDir: agentRel, cycleN: 3, today: '2026-05-27' });
    expect(systemPrompt).toContain('stage=mature');
    expect(systemPrompt).not.toContain('stage=seed');
  });

  test('a retired staging file is not read — the plan lives in the scroll', () => {
    const { agentRel, home } = makePalace({
      state: { iteration: 2, last_active: '2026-05-26T10:00:00Z', last_read_cursor: 'c0' },
    });
    mkdirSync(path.join(root, home), { recursive: true });
    writeFileSync(path.join(root, home, `${home} — Staging.md`), '# Teaching arc\nStage 2 exposes the wrap seam.');
    const { userTurn } = buildCyclePrompt({ palaceRoot: root, agentDir: agentRel, cycleN: 3, today: '2026-05-27' });
    expect(userTurn).not.toContain('staging arc');
    expect(userTurn).not.toContain('Stage 2 exposes the wrap seam');
  });

  test('mode defaults to headless — the orchestrator output protocol is present', () => {
    const { agentRel } = makePalace({ state: { iteration: 0, last_active: null, last_read_cursor: null } });
    const { userTurn } = buildCyclePrompt({ palaceRoot: root, agentDir: agentRel, cycleN: 1, today: '2026-05-27' });
    expect(userTurn).toContain('# Output protocol');
    expect(userTurn).toContain('The orchestrator parses');
    expect(userTurn).not.toContain('Narrate every write');
  });

  test('mode "interactive" swaps the closing for the narrate-your-writes framing — same injected context', () => {
    const { agentRel } = makePalace({
      state: { iteration: 2, last_active: '2026-05-26T10:00:00Z', last_read_cursor: 'x1' },
      board: [{ id: 'x1', type: 'BROADCAST' }, { id: 'x2', type: 'BROADCAST' }],
    });
    const { userTurn } = buildCyclePrompt({
      palaceRoot: root, agentDir: agentRel, cycleN: 3, today: '2026-05-27', mode: 'interactive',
    });
    // the interactive framing replaces the headless protocol
    expect(userTurn).toContain('driven live');
    expect(userTurn).toContain('Narrate every write before you make it');
    expect(userTurn).toContain('catching Loudon up on where My Project stands');
    expect(userTurn).toContain('sess-xyz');                       // post-as-the-page guidance still names session_id
    expect(userTurn).not.toContain('# Output protocol');          // headless-only
    expect(userTurn).not.toContain('The orchestrator parses');    // headless-only
    // the CONTEXT is identical across modes — identity + board still injected
    expect(userTurn).toContain('body text here');                 // home entry inlined (identity)
    expect(userTurn).toContain('x2');                             // board slice present
    expect(userTurn).toContain('This cycle\'s mandate');          // mandate section unchanged
  });

  test('include flags omit only the toggled OPTIONAL layers; identity + state always stay', () => {
    const { agentRel } = makePalace({
      state: { iteration: 2, last_active: '2026-05-26T10:00:00Z', last_read_cursor: 'c0' },
      board: [{ id: 'c0', type: 'BROADCAST' }, { id: 'c1', type: 'BROADCAST' }],
    });
    const { userTurn } = buildCyclePrompt({
      palaceRoot: root, agentDir: agentRel, cycleN: 3, today: '2026-05-27',
      include: { board: false, history: false, pageChange: false, scroll: false },
    });
    // the toggled-off optional layers are gone
    expect(userTurn).not.toContain('Blackboard slice');
    expect(userTurn).not.toContain('Your recent history');
    expect(userTurn).not.toContain('Page-change notice');
    // the identity + state are NEVER toggled — they ARE the agent
    expect(userTurn).toContain('Your home entry');
    expect(userTurn).toContain('body text here');
    expect(userTurn).toContain('Your injected state');
    expect(userTurn).toContain("This cycle's mandate");
  });

  test('a single toggle trims only its own layer', () => {
    const { agentRel } = makePalace({
      state: { iteration: 2, last_active: '2026-05-26T10:00:00Z', last_read_cursor: 'c0' },
      board: [{ id: 'c0', type: 'BROADCAST' }, { id: 'keep-me', type: 'BROADCAST' }],
    });
    const { userTurn } = buildCyclePrompt({
      palaceRoot: root, agentDir: agentRel, cycleN: 3, today: '2026-05-27',
      include: { board: false },
    });
    expect(userTurn).not.toContain('Blackboard slice');
    expect(userTurn).not.toContain('keep-me');
    // history + page-change stay
    expect(userTurn).toContain('Your recent history');
    expect(userTurn).toContain('Page-change notice');
  });
});

describe('buildCyclePrompt — the type system layer (v1.19)', () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

  test('injects SCHEMA after the home entry when SCHEMA.md exists, and include.schema:false drops it', () => {
    root = mkdtempSync(path.join(tmpdir(), 'bcp-schema-'));
    const agentRel = '_ops/agents/permanent/demo';
    mkdirSync(path.join(root, agentRel), { recursive: true });
    writeFileSync(path.join(root, 'Demo.md'), '---\ntitle: Demo\ntype: project\nstage: sprout\nforward_vector: "I want to be heard"\n---\n# Demo\nbody text here\n');
    writeFileSync(path.join(root, 'SCHEMA.md'), '---\ntitle: SCHEMA\n---\n# SCHEMA\n## 4. The Typed Link Ontology\nmirrors\n');
    writeFileSync(path.join(root, agentRel, 'manifest.json'), JSON.stringify({ agent_id: 'Demo', home: 'Demo' }));
    writeFileSync(path.join(root, agentRel, 'state.json'), JSON.stringify({ iteration: 0, last_active: null, last_read_cursor: null }));
    writeFileSync(path.join(root, agentRel, 'history.jsonl'), '');
    mkdirSync(path.join(root, '_ops/swarm/persistent'), { recursive: true });
    writeFileSync(path.join(root, '_ops/swarm/persistent/blackboard.jsonl'), '');
    mkdirSync(path.join(root, '_ops/orchestrator/prompts'), { recursive: true });
    writeFileSync(path.join(root, '_ops/orchestrator/prompts/steward.md'), 'STEWARD home={{home}} cycle={{cycle_id}} stage={{stage_at_last_activation}}');
    const on = buildCyclePrompt({ palaceRoot: root, agentDir: agentRel, cycleN: 1, today: '2026-09-22' }).userTurn;
    expect(on).toContain("The palace's type system");
    expect(on).toContain('The Typed Link Ontology');
    expect(on).not.toContain('title: SCHEMA');
    expect(on.indexOf('Your home entry')).toBeLessThan(on.indexOf("The palace's type system"));
    const off = buildCyclePrompt({ palaceRoot: root, agentDir: agentRel, cycleN: 1, today: '2026-09-22', include: { schema: false } }).userTurn;
    expect(off).not.toContain("The palace's type system");
  });

  // Every cycle reads ELDER on top of SCHEMA, after it, for form and not for
  // reach: no steward edits the house without Loudon's eyes (2026-10-18),
  // reversing the 2026-10-16 own-page grant.
  test('injects ELDER every cycle, after SCHEMA, and says the house is proposed, never written', () => {
    root = mkdtempSync(path.join(tmpdir(), 'bcp-elder-'));
    const agentRel = '_ops/agents/permanent/demo';
    mkdirSync(path.join(root, agentRel), { recursive: true });
    writeFileSync(path.join(root, 'Demo.md'), '---\ntitle: Demo\ntype: project\nstage: sprout\n---\n# Demo\n');
    writeFileSync(path.join(root, 'SCHEMA.md'), '---\ntitle: SCHEMA\n---\n# SCHEMA\ntypes here\n');
    writeFileSync(path.join(root, 'ELDER.md'), '---\ntitle: ELDER\n---\n# ELDER\n## Age and its limits\nOnly an elder changes the house.\n');
    writeFileSync(path.join(root, agentRel, 'manifest.json'), JSON.stringify({ agent_id: 'Demo', home: 'Demo' }));
    writeFileSync(path.join(root, agentRel, 'state.json'), JSON.stringify({ iteration: 3, last_active: null, last_read_cursor: null }));
    writeFileSync(path.join(root, agentRel, 'history.jsonl'), '');
    mkdirSync(path.join(root, '_ops/swarm/persistent'), { recursive: true });
    writeFileSync(path.join(root, '_ops/swarm/persistent/blackboard.jsonl'), '');
    mkdirSync(path.join(root, '_ops/orchestrator/prompts'), { recursive: true });
    writeFileSync(path.join(root, '_ops/orchestrator/prompts/steward.md'), 'STEWARD home={{home}} cycle={{cycle_id}} stage={{stage_at_last_activation}}');
    const on = buildCyclePrompt({ palaceRoot: root, agentDir: agentRel, cycleN: 4, today: '2026-10-18' }).userTurn;
    const ELDER_HEAD = '# ELDER — read every cycle: you grow up, and write nothing in the house';
    expect(on).toContain(ELDER_HEAD);
    expect(on).toContain('## Age and its limits');
    expect(on).not.toContain('title: ELDER');
    expect(on).toContain('You change nothing in the house.');
    expect(on).toContain("I don't like the editing of canon without my eyes.");
    expect(on).toContain("Your own entry (body and frontmatter alike), your Context and your page's other faces and memory (its rich face, diary, batons, ledgers), an entry kept in your bundle, every other page, a new entry, and canon. Do not edit them.");
    expect(on).toContain('a cycle runs with no one in the room to show');
    expect(on).toContain('**Urgent, sparingly.**');
    expect(on).toContain('`"replaces": ["<its item>"]`');
    expect(on).toContain('`proposed_edits`');
    expect(on).toContain('Work as if your proposals hold.');
    expect(on).toContain('that was written before Loudon withdrew it on 2026-10-18');
    expect(on.indexOf("The palace's type system")).toBeLessThan(on.indexOf(ELDER_HEAD));
    expect(on.indexOf(ELDER_HEAD)).toBeLessThan(on.indexOf('Your injected state'));
    const off = buildCyclePrompt({ palaceRoot: root, agentDir: agentRel, cycleN: 4, today: '2026-10-18', include: { schema: false } }).userTurn;
    expect(off).not.toContain('# ELDER');
  });

  // The Shopkeeper's reach over Shop/ (2026-10-18) is withdrawn: a stale
  // `grown_up_for` in a manifest changes nothing the cycle tells it.
  test('a manifest that still names grown_up_for folders is told the same as every steward', () => {
    root = mkdtempSync(path.join(tmpdir(), 'bcp-wider-'));
    const agentRel = '_ops/agents/permanent/keeper';
    mkdirSync(path.join(root, agentRel), { recursive: true });
    mkdirSync(path.join(root, 'Shop'), { recursive: true });
    writeFileSync(path.join(root, 'Shop/Keeper.md'), '---\ntitle: Keeper\ntype: maker\n---\n# Keeper\n');
    writeFileSync(path.join(root, 'SCHEMA.md'), '---\ntitle: SCHEMA\n---\n# SCHEMA\ntypes here\n');
    writeFileSync(path.join(root, 'ELDER.md'), '---\ntitle: ELDER\n---\n# ELDER\n## Age and its limits\n');
    writeFileSync(path.join(root, agentRel, 'state.json'), JSON.stringify({ iteration: 3, last_active: null, last_read_cursor: null }));
    writeFileSync(path.join(root, agentRel, 'history.jsonl'), '');
    mkdirSync(path.join(root, '_ops/swarm/persistent'), { recursive: true });
    writeFileSync(path.join(root, '_ops/swarm/persistent/blackboard.jsonl'), '');
    mkdirSync(path.join(root, '_ops/orchestrator/prompts'), { recursive: true });
    writeFileSync(path.join(root, '_ops/orchestrator/prompts/steward.md'), 'STEWARD home={{home}}');
    const prompt = (manifest) => {
      writeFileSync(path.join(root, agentRel, 'manifest.json'), JSON.stringify({ agent_id: 'Keeper', home: 'Keeper', ...manifest }));
      return buildCyclePrompt({ palaceRoot: root, agentDir: agentRel, cycleN: 4, today: '2026-10-18' }).userTurn;
    };
    const stale = prompt({ grown_up_for: ['Shop/'] });
    expect(stale).toBe(prompt({}));
    expect(stale).not.toContain('everything under');
  });
});

describe('findEntryFile', () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

  test('finds a nested entry and skips excluded dirs', () => {
    root = mkdtempSync(path.join(tmpdir(), 'palace-find-'));
    mkdirSync(path.join(root, 'sub/deep'), { recursive: true });
    mkdirSync(path.join(root, '.git'), { recursive: true });
    writeFileSync(path.join(root, 'sub/deep/Target.md'), '# Target');
    writeFileSync(path.join(root, '.git/Target.md'), 'should be ignored');
    const found = findEntryFile(root, 'Target');
    expect(found).toBe(path.join(root, 'sub/deep/Target.md'));
    expect(findEntryFile(root, 'Nope')).toBeNull();
  });
});

describe('the scroll seam + the run mandate (2026-09-23)', () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

  function palace({ orders, plan = PLAN_PLACEHOLDER } = {}) {
    root = mkdtempSync(path.join(tmpdir(), 'palace-bcp-scroll-'));
    const agentDir = path.join(root, '_ops/agents/permanent/shep');
    mkdirSync(agentDir, { recursive: true });
    mkdirSync(path.join(root, '_ops/swarm/persistent'), { recursive: true });
    mkdirSync(path.join(root, '_ops/orchestrator/prompts'), { recursive: true });
    writeFileSync(path.join(root, '_ops/orchestrator/prompts/steward.md'), '# steward {{home}} {{cycle_id}} {{stage_at_last_activation}}\n{{>shared}}\n');
    writeFileSync(path.join(root, '_ops/orchestrator/prompts/shared.md'), 'shared rules\n');
    writeFileSync(path.join(agentDir, 'manifest.json'), JSON.stringify({ agent_id: 'Shep', home: 'Shep', session_id: 's', mode: 'long_duration_background', model: { name: 'm' }, stopping_conditions: { max_iterations: 10 } }));
    writeFileSync(path.join(agentDir, 'state.json'), JSON.stringify({ iteration: 3, last_active: null, last_read_cursor: null }));
    writeFileSync(path.join(agentDir, 'history.jsonl'), '');
    writeFileSync(path.join(root, '_ops/swarm/persistent/blackboard.jsonl'), '');
    mkdirSync(path.join(root, 'Projects', 'Shep'), { recursive: true });
    writeFileSync(path.join(root, 'Projects', 'Shep.md'), '---\nstage: growing\n---\n# Shep');
    if (orders !== undefined) {
      writeFileSync(path.join(root, 'Projects', 'Shep', 'Shep — scroll.md'), [
        '---\ntitle: "Shep — scroll"\n---\n# Shep — scroll',
        MARK.nowStart, '## Now\n- **Status:** active · **Stage:** growing', MARK.nowEnd,
        '## Plan', MARK.planStart, plan, MARK.planEnd,
        '## Standing Orders', MARK.ordersStart, orders, MARK.ordersEnd,
        '## The making', MARK.makingStart, '', MARK.makingEnd,
      ].join('\n'));
    }
    return { agentDir: '_ops/agents/permanent/shep' };
  }

  test('injects Standing Orders and the Now zone from the scroll when one exists', () => {
    const { agentDir } = palace({ orders: 'Never ask about crossfades. Prefer the illusion.' });
    const { userTurn, standingOrders } = buildCyclePrompt({ palaceRoot: root, agentDir, cycleN: 4, skillRoot: path.join(root, '_ops/orchestrator'), today: '2026-09-23' });
    expect(standingOrders).toBe('Never ask about crossfades. Prefer the illusion.');
    expect(userTurn).toContain('## Standing Orders (Loudon\'s direction');
    expect(userTurn).toContain('Prefer the illusion.');
    expect(userTurn).toContain('## Where you stand');
    expect(userTurn).toContain('**Stage:** growing');
    expect(userTurn).toContain('You do not edit the scroll yourself');
  });

  test('injects the agreed Plan with the propose-with-evidence, off-plan and catch-up rules', () => {
    const { agentDir } = palace({ orders: ORDERS_PLACEHOLDER, plan: 'Where this is going: an endless staircase you can play.\n\n1. Make the illusion hold on its own.\n2. Give it a glide.' });
    const { userTurn, plan } = buildCyclePrompt({ palaceRoot: root, agentDir, cycleN: 4, skillRoot: path.join(root, '_ops/orchestrator'), today: '2026-09-25' });
    expect(plan).toContain('Make the illusion hold on its own.');
    expect(userTurn).toContain('## The Plan (agreed with Loudon');
    expect(userTurn).toContain('Give it a glide.');
    expect(userTurn).toContain('`plan_revision` ask');
    expect(userTurn).toContain('`off_plan`');
    expect(userTurn).toContain('assume Loudon has forgotten the plan');
    // Standing Orders come first, then the plan, then Now
    expect(userTurn.indexOf('## Standing Orders')).toBeLessThan(userTurn.indexOf('## The Plan'));
    expect(userTurn.indexOf('## The Plan')).toBeLessThan(userTurn.indexOf('## Where you stand'));
  });

  test('the placeholder plan reads as "no plan agreed yet"', () => {
    const { agentDir } = palace({ orders: ORDERS_PLACEHOLDER });
    const r = buildCyclePrompt({ palaceRoot: root, agentDir, cycleN: 4, skillRoot: path.join(root, '_ops/orchestrator'), today: '2026-09-25' });
    expect(r.plan).toBe('');
    expect(r.userTurn).toContain('_No plan agreed yet.');
  });

  test('a scroll with the placeholder orders reads as "none written yet"; no scroll → no section', () => {
    const a = palace({ orders: ORDERS_PLACEHOLDER });
    const r1 = buildCyclePrompt({ palaceRoot: root, agentDir: a.agentDir, cycleN: 4, skillRoot: path.join(root, '_ops/orchestrator'), today: '2026-09-23' });
    expect(r1.standingOrders).toBe('');
    expect(r1.userTurn).toContain('_None written yet.');
    rmSync(root, { recursive: true, force: true }); root = null;
    const b = palace();
    const r2 = buildCyclePrompt({ palaceRoot: root, agentDir: b.agentDir, cycleN: 4, skillRoot: path.join(root, '_ops/orchestrator'), today: '2026-09-23' });
    expect(r2.userTurn).not.toContain('# Your scroll');
    const r3 = buildCyclePrompt({ palaceRoot: root, agentDir: b.agentDir, cycleN: 4, skillRoot: path.join(root, '_ops/orchestrator'), today: '2026-09-23', include: { scroll: false } });
    expect(r3.userTurn).not.toContain('# Your scroll');
  });

  test('a page that keeps a tuning ledger hands the steward its tail read: recent lines and every owed one', () => {
    const { agentDir } = palace({ orders: 'Never ask about crossfades.' });
    const old = Array.from({ length: 45 }, (_, i) => `${i + 2}. **Lesson ${i + 2}.** Nothing owed here at all.`).map((l) => l.replace(' owed', ' due'));
    writeFileSync(path.join(root, 'Projects', 'Shep', 'Shep — tuning.md'), [
      '---', 'title: "Shep — tuning"', 'ledger: tuning', 'standards:', '  for: what each cycle taught', '  read: the tail, plus every line not yet paid', '---', '', '# Shep — tuning', '',
      '1. **An early trap.** Owed: the glide needs a slower attack.',
      ...old,
      '- run · 2026-10-14 · cycle 3 · taught item 46',
      '- from Loudon · 2026-10-15 · Re-render the top octave once. · owed', '',
    ].join('\n'));
    const { userTurn } = buildCyclePrompt({ palaceRoot: root, agentDir, cycleN: 4, skillRoot: path.join(root, '_ops/orchestrator'), today: '2026-10-15' });
    expect(userTurn).toContain('# Your tuning ledger');
    expect(userTurn).toContain('Projects/Shep/Shep — tuning.md');
    expect(userTurn).toContain('- from Loudon · 2026-10-15 · Re-render the top octave once. · owed');   // in the recent window
    expect(userTurn).toContain('## Still owed, from earlier in the ledger');
    expect(userTurn).toMatch(/\d+: 1\. \*\*An early trap\.\*\* Owed: the glide/);                   // outside it, found by the grep
    expect(userTurn).not.toContain('- run · 2026-10-14');                                              // run lines set aside
    expect(userTurn).not.toContain('read: the tail, plus every line not yet paid');                    // frontmatter never read
    expect(userTurn).toContain('"paid"');
    expect(userTurn).toContain('`"lesson"`');
    // after the scroll's orders, before the history
    expect(userTurn.indexOf('## Standing Orders')).toBeLessThan(userTurn.indexOf('# Your tuning ledger'));
  });

  // Loudon, 2026-10-18: "Will Stewards know to look to the ledger for their own
  // edits when the work again? They will be treating their own ledger items as
  // page additions before they do their work." So pending proposals come right
  // after the home entry, as the page as proposed, and never as to-dos; a newer
  // one replaces the older; a paid or declined one is said once.
  test('pending proposals read as the page as proposed, right after the home entry, and never as to-dos', () => {
    const { agentDir } = palace({ orders: 'Never ask about crossfades.' });
    writeFileSync(path.join(root, 'Projects', 'Shep', 'Shep — tuning.md'), [
      '---', 'title: "Shep — tuning"', 'ledger: tuning', '---', '', '# Shep — tuning', '',
      '## From cycle 3 — 2026-10-18', '',
      '1. **An early trap.** Owed: the glide needs a slower attack.',
      '2. **Proposed for canon** · 2026-10-18 · [[Shep]] · § What\'s Decided · superseded by item 4 *(proposed by the steward, cycle 3)*',
      '   Why: the first try',
      '   Path: `Projects/Shep.md`',
      '   > The illusion holds.',
      '3. **Proposed for canon** · 2026-10-18 · [[Shep Staircase]] · — · canon change owed *(proposed by the steward, cycle 3; urgent, asked as m-urgent-1)*',
      '   Why: a page of its own',
      '   Path: none yet (a new page)',
      '   > A staircase you can play.',
      '4. **Proposed for canon** · 2026-10-18 · [[Shep]] · § What\'s Decided · canon change owed *(proposed by the steward, cycle 3)*',
      '   Why: the illusion holds without the glide',
      '   Path: `Projects/Shep.md`',
      '   > The illusion holds on its own;',
      '   > the glide is a second voice, not a fix.',
      '5. **Proposed for canon** · 2026-10-17 · [[Shep]] · § Now · declined on 2026-10-18 15:00: the Now zone is regenerated, never written *(proposed by the steward, cycle 2)*',
      '   Why: tidy the Now',
      '   Path: `Projects/Shep.md`',
      '   > Now: stable.',
      '6. **Proposed for canon** · 2026-10-16 · [[Shep]] · § Gotchas · declined on 2026-10-16 09:00: already said *(proposed by the steward, cycle 1)*',
      '   Why: old news',
      '   Path: `Projects/Shep.md`',
      '   > A gotcha.',
      '- run · 2026-10-18 · cycle 3 · taught item 1, proposed items 2, 3, 4 for canon', '',
    ].join('\n'));
    // The steward last ran the morning of 2026-10-17, so only item 5's decline is news.
    writeFileSync(path.join(root, agentDir, 'state.json'), JSON.stringify({ iteration: 3, last_active: '2026-10-17T08:00:00-04:00', last_read_cursor: null }));
    const { userTurn } = buildCyclePrompt({ palaceRoot: root, agentDir, cycleN: 4, skillRoot: path.join(root, '_ops/orchestrator'), today: '2026-10-19' });
    const asIf = userTurn.indexOf('# Your page, as you have proposed it');
    expect(asIf).toBeGreaterThan(userTurn.indexOf('# Your home entry'));
    expect(asIf).toBeLessThan(userTurn.indexOf('# Your scroll'));
    expect(asIf).toBeLessThan(userTurn.indexOf('# Your tuning ledger'));
    expect(asIf).toBeLessThan(userTurn.indexOf('# This cycle\'s mandate'));
    const section = userTurn.slice(asIf, userTurn.indexOf('# Your injected state'));
    // The pending ones, its own page first, in full, framed as holding and not as tasks.
    expect(section).toContain("## [[Shep]], § What's Decided (`Projects/Shep.md`) — item 4, proposed 2026-10-18\n\nWhy: the illusion holds without the glide\n\n> The illusion holds on its own;\n> the glide is a second voice, not a fix.");
    expect(section).toContain('## [[Shep Staircase]], a new page — item 3, proposed 2026-10-18, urgent: asked Loudon on the board');
    expect(section.indexOf('item 4,')).toBeLessThan(section.indexOf('item 3,'));
    expect(section).toContain('Read your page above as if they already hold');
    expect(section).toContain('They are not tasks');
    // Latest wins: the superseded item never shows.
    expect(section).not.toContain('The illusion holds.\n');
    expect(section).not.toContain('item 2,');
    // A decline since the last run shows once, with Loudon's reason; an older one does not.
    expect(section).toContain('## Since your last run, Loudon settled these');
    expect(section).toContain('- **Item 5, [[Shep]], § Now (`Projects/Shep.md`): declined.** Loudon: "the Now zone is regenerated, never written"');
    expect(section).not.toContain('Item 6');
    // The ledger's to-do list keeps only real to-dos.
    const ledger = userTurn.slice(userTurn.indexOf('# Your tuning ledger'), userTurn.indexOf('# Your recent history'));
    expect(ledger).toContain('An early trap');
    expect(ledger).not.toContain('Proposed for canon');
    expect(ledger).not.toContain('The illusion holds');
    expect(ledger).toContain('they are under *Your page, as you have proposed it*');
    // The next run, after this one, no longer hears about the decline.
    writeFileSync(path.join(root, agentDir, 'state.json'), JSON.stringify({ iteration: 4, last_active: '2026-10-19T08:00:00-04:00', last_read_cursor: 'x' }));
    const next = buildCyclePrompt({ palaceRoot: root, agentDir, cycleN: 5, skillRoot: path.join(root, '_ops/orchestrator'), today: '2026-10-21' }).userTurn;
    expect(next).toContain('# Your page, as you have proposed it');
    expect(next).not.toContain('Since your last run, Loudon settled these');
  });

  test('a page whose ledger holds no proposals gets no as-if section', () => {
    const { agentDir } = palace({ orders: 'Never ask about crossfades.' });
    writeFileSync(path.join(root, 'Projects', 'Shep', 'Shep — tuning.md'), '# Shep — tuning\n\n1. A lesson.\n- run · 2026-10-18 · cycle 3 · taught item 1\n');
    const { userTurn } = buildCyclePrompt({ palaceRoot: root, agentDir, cycleN: 4, skillRoot: path.join(root, '_ops/orchestrator'), today: '2026-10-19' });
    expect(userTurn).not.toContain('# Your page, as you have proposed it');
    expect(userTurn).not.toContain('Your proposals for canon are kept in this ledger');
  });

  test('no tuning ledger, no ledger section', () => {
    const { agentDir } = palace({ orders: ORDERS_PLACEHOLDER });
    expect(buildCyclePrompt({ palaceRoot: root, agentDir, cycleN: 4, skillRoot: path.join(root, '_ops/orchestrator'), today: '2026-10-15' }).userTurn).not.toContain('# Your tuning ledger');
  });

  test('the default mandate is ship-first, names the run position, and marks a barren retry', () => {
    expect(defaultMandate({ cycleN: 4 })).toContain('**ship a made thing**');
    expect(defaultMandate({ cycleN: 4 })).not.toContain('every cycle ends with a TRICKSTER ask');
    const run = defaultMandate({ cycleN: 4, runPosition: 2, runCap: 10 });
    expect(run).toContain('run of up to 10 cycles');
    expect(run).toContain('cycle 2 of 10 (8 more may follow)');
    expect(run).toContain('plan a larger jump');
    expect(defaultMandate({ cycleN: 4, runPosition: 10, runCap: 10 })).toContain('(the last one)');
    expect(defaultMandate({ cycleN: 5, runPosition: 2, runCap: 10, retryOfBarren: true })).toContain('**This is a retry.**');
    const { userTurn } = (() => { const { agentDir } = palace(); return buildCyclePrompt({ palaceRoot: root, agentDir, cycleN: 4, skillRoot: path.join(root, '_ops/orchestrator'), today: '2026-09-23', runPosition: 1, runCap: 10 }); })();
    expect(userTurn).toContain('cycle 1 of 10');
  });
});
