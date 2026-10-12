import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { isNode, targetId, buildGraph, readLiveMap } from '../../src/lib/topology-live.js';

// The rules here are the Python map builder's, restated. These tests pin each
// rule on small fixtures; tests/integration/topology-parity.test.js holds the
// whole thing to the real builder over the real tree.

const rec = (path, type = 'concept', links = [], extra = {}) => ({
  path, type, stage: null, has_forward_vector: false, links, ...extra,
});
const link = (target, type = 'connects-to', label = null) => ({ target, type, label });

describe('isNode', () => {
  it('takes an entry with a canonical type', () => {
    expect(isNode(rec('Kuramoto Coupling.md', 'concept'))).toBe(true);
    expect(isNode(rec('Projects/BLUELINE.md', 'project'))).toBe(true);
  });
  it('refuses an untyped file, and a type outside the canon', () => {
    expect(isNode(rec('Projects/BLUELINE/NOTES.md', null))).toBe(false);
    expect(isNode(rec('Old Idea.md', 'breakthrough'))).toBe(false);
    expect(isNode(rec('Odd.md', 'whatever'))).toBe(false);
  });
  it('refuses a typed file under a folder the builder never reads', () => {
    expect(isNode(rec('_tools/ComfyUI/README.md', 'concept'))).toBe(false);
    expect(isNode(rec('Shop/thing/dist/Notes.md', 'concept'))).toBe(false);
    expect(isNode(rec('Projects/X/entries/Draft.md', 'concept'))).toBe(false);
  });
  it('under _ops/, takes only a ceremony card', () => {
    // directly in _ops/, or one level into a subfolder that is not machinery
    expect(isNode(rec('_ops/Deposit Ceremony.md', 'practice'))).toBe(true);
    expect(isNode(rec('_ops/concierge/README.md', 'practice'))).toBe(true);
    expect(isNode(rec('_ops/swarm/Coordinator Synthesis Template.md', 'practice'))).toBe(false);
    expect(isNode(rec('_ops/concierge/prompts/companion.md', 'practice'))).toBe(false);
  });
});

describe('targetId', () => {
  it('reduces a link target to the filename it names', () => {
    expect(targetId('Kuramoto Coupling')).toBe('Kuramoto Coupling');
    expect(targetId('Kuramoto Coupling|coupling')).toBe('Kuramoto Coupling');
    expect(targetId('Kuramoto Coupling#The Formula')).toBe('Kuramoto Coupling');
    expect(targetId('Projects/BLUELINE.md')).toBe('BLUELINE');
    expect(targetId('  Projects/BLUELINE  ')).toBe('BLUELINE');
  });
});

describe('buildGraph', () => {
  it('keys a node by its filename and carries the fields the lens draws from', () => {
    const g = buildGraph([
      rec('Projects/BLUELINE.md', 'project', [], { stage: 'growing', has_forward_vector: true }),
      rec('_ops/Deposit Ceremony.md', 'practice'),
    ]);
    expect(g.nodes).toEqual([
      { id: 'BLUELINE', path: 'Projects/BLUELINE.md', type: 'project', stage: 'growing',
        has_forward_vector: true, outbound_count: 0, inbound_count: 0, ops_card: false },
      { id: 'Deposit Ceremony', path: '_ops/Deposit Ceremony.md', type: 'practice', stage: null,
        has_forward_vector: false, outbound_count: 0, inbound_count: 0, ops_card: true },
    ]);
    expect(g.source).toBe('live');
    expect(g.meta).toMatchObject({ scope: 'live', node_count: 2, edge_count: 0 });
  });

  it('turns every typed link into an edge, with its type and label', () => {
    const g = buildGraph([
      rec('A.md', 'concept', [link('B', 'mirrors', 'same shape'), link('B#part', 'deepens')]),
      rec('B.md', 'concept'),
    ]);
    expect(g.edges).toEqual([
      { source: 'A', type: 'mirrors', target: 'B', label: 'same shape' },
      { source: 'A', type: 'deepens', target: 'B', label: null },
    ]);
    expect(g.meta.edge_count).toBe(2);
  });

  it('keeps an edge whose target is not a node, but counts only the ones that land', () => {
    const g = buildGraph([
      rec('A.md', 'concept', [link('B'), link('Not Written Yet'), link('A — scroll')]),
      rec('B.md', 'concept', [link('A')]),
      rec('A/A — scroll.md', null),
    ]);
    expect(g.edges).toHaveLength(4);
    const a = g.nodes.find((n) => n.id === 'A');
    const b = g.nodes.find((n) => n.id === 'B');
    expect([a.outbound_count, a.inbound_count]).toEqual([1, 1]);
    expect([b.outbound_count, b.inbound_count]).toEqual([1, 1]);
  });

  it('skips a link out to the web', () => {
    const g = buildGraph([rec('A.md', 'concept', [link('https://example.com/x'), link('HTTP://example.com')])]);
    expect(g.edges).toEqual([]);
  });

  it('matches a target by exact case only', () => {
    const g = buildGraph([rec('A.md', 'concept', [link('b')]), rec('B.md', 'concept')]);
    expect(g.edges).toEqual([{ source: 'A', type: 'connects-to', target: 'b', label: null }]);
    expect(g.nodes.find((n) => n.id === 'B').inbound_count).toBe(0);
  });

  it('collapses two entries that share a filename into one node, and says so', () => {
    const g = buildGraph([rec('Zed/Twin.md', 'concept'), rec('Alpha/Twin.md', 'project')]);
    expect(g.nodes.map((n) => n.path)).toEqual(['Alpha/Twin.md']);
    expect(g.meta.duplicate_ids).toEqual(['Twin']);
  });

  it('lists nodes in id order whatever order the walk found them', () => {
    const g = buildGraph([rec('C.md'), rec('A.md'), rec('B.md')]);
    expect(g.nodes.map((n) => n.id)).toEqual(['A', 'B', 'C']);
  });
});

describe('readLiveMap', () => {
  let root;
  const write = (rel, text) => {
    mkdirSync(dirname(resolve(root, rel)), { recursive: true });
    writeFileSync(resolve(root, rel), text);
  };
  const entry = (type, links = '') => `---\ntype: ${type}\nstage: seed\nlinks:\n${links}---\n\nbody\n`;

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'palace-live-'));
    write('Alive.md', entry('concept', '  - { target: "[[Neighbor]]", type: mirrors, label: "same shape" }\n'));
    write('Neighbor.md', entry('practice'));
    write('Alive/Alive — scroll.md', '# no frontmatter\n');
    write('Broken.md', '---\ntype: concept\ntype: project\n---\n');
  });
  afterAll(() => { rmSync(root, { recursive: true, force: true }); });

  it('reads the graph straight from the files', () => {
    const g = readLiveMap(root);
    expect(g.nodes.map((n) => n.id)).toEqual(['Alive', 'Neighbor']);
    expect(g.edges).toEqual([{ source: 'Alive', type: 'mirrors', target: 'Neighbor', label: 'same shape' }]);
    expect(g.nodes[0]).toMatchObject({ stage: 'seed', outbound_count: 1 });
    expect(g.meta.generated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('a page removed from disk is gone from the next read; a new one is there', () => {
    rmSync(resolve(root, 'Neighbor.md'));
    write('Newborn.md', entry('project'));
    const g = readLiveMap(root);
    expect(g.nodes.map((n) => n.id)).toEqual(['Alive', 'Newborn']);
    // the link still stands in Alive's frontmatter; it now points at no node
    expect(g.nodes[0].outbound_count).toBe(0);
  });
});
