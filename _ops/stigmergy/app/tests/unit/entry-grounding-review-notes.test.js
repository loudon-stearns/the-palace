// The companion's grounding carries the page's open rich-face notes, and the
// turn's prompt shows them. "Open" means what it means on the QUEUE: the same
// human_eval cards buildQueue makes, for this page only.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assembleGrounding } from '../../src/lib/entry-grounding.js';
import { buildEntryPrompt } from '../../server/companion-prompt.js';
import { buildReviewMessage } from '../../../../rich-face/rich-handler.mjs';

let root;
let bare;

const send = (id, ts, entry, round, groups, overall = '') => ({
  ...buildReviewMessage({ task: `rich-face:${entry}:round-${round}`, groups, overall: { note: overall, round } }),
  id, ts,
});

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'stigmergy-review-notes-'));
  writeFileSync(join(root, 'Kuramoto Coupling.md'),
    '---\ntitle: Kuramoto Coupling\ntype: hub\nstage: mature\nforward_vector: "I want every system seeking coherence to find me."\n---\n# K\n\n## The Mechanism\ncoupling.\n');
  mkdirSync(join(root, '_ops/swarm/persistent'), { recursive: true });
  const board = [
    // round 1: answered — not open
    send('kc-r1', '2026-10-13T09:00:00Z', 'Kuramoto Coupling', 1, { 'The Mechanism': { note: 'answered already' } }),
    { id: 'g1', type: 'RESOURCE_GRANT', re: 'kc-r1', from: 'TRICKSTER', to: 'TRICKSTER', ts: '2026-10-13T09:30:00Z', board: 'TRICKSTER', payload: {} },
    // round 2: open
    send('kc-r2', '2026-10-13T10:00:00Z', 'Kuramoto Coupling', 2, { 'The Mechanism': { note: 'the slider reads backwards' } }, 'the bed is too loud'),
    // another page's note
    send('sc-r1', '2026-10-13T10:05:00Z', 'Spinoza Conatus', 1, { Core: { note: 'not this page' } }),
    // a rating sheet: same kind, names no page
    { ...buildReviewMessage({ task: 'r4ng3r-lora-grade', groups: { flux: { note: 'hooded' } } }), id: 'rating', ts: '2026-10-13T10:06:00Z' },
  ];
  writeFileSync(join(root, '_ops/swarm/persistent/blackboard.jsonl'), board.map((m) => JSON.stringify(m)).join('\n') + '\n{torn line\n');

  bare = mkdtempSync(join(tmpdir(), 'stigmergy-review-notes-bare-'));
  writeFileSync(join(bare, 'Kuramoto Coupling.md'), '---\ntitle: Kuramoto Coupling\ntype: hub\nstage: mature\n---\n# K\n');
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
  rmSync(bare, { recursive: true, force: true });
});

describe('assembleGrounding — the page\'s open rich-face notes', () => {
  it('carries this page\'s open notes, and no answered round, other page or rating sheet', () => {
    const g = assembleGrounding(root, 'Kuramoto Coupling.md');
    expect(g.review_notes).toEqual([{
      id: 'kc-r2', ts: '2026-10-13T10:00:00Z', round: 2,
      notes: [
        { section: null, note: 'the bed is too loud' },
        { section: 'The Mechanism', note: 'the slider reads backwards' },
      ],
    }]);
  });

  it('carries an empty list when the palace has no board', () => {
    expect(assembleGrounding(bare, 'Kuramoto Coupling.md').review_notes).toEqual([]);
  });
});

describe('buildEntryPrompt — the open notes reach the turn', () => {
  const args = (grounding) => ({ grounding, frontmatter: { title: 'Kuramoto Coupling' }, body: '# K', message: 'tighten the mechanism', section: 'The Mechanism' });

  it('shows the open notes, with their round and section', () => {
    const prompt = buildEntryPrompt(args(assembleGrounding(root, 'Kuramoto Coupling.md')));
    expect(prompt).toContain("LOUDON'S OPEN NOTES ON YOUR RICH FACE");
    expect(prompt).toContain('round 2 · The Mechanism: the slider reads backwards');
    expect(prompt).toContain('round 2 · the whole page: the bed is too loud');
    expect(prompt).not.toContain('answered already');
  });

  it('leaves the block out when there are none', () => {
    const prompt = buildEntryPrompt(args(assembleGrounding(bare, 'Kuramoto Coupling.md')));
    expect(prompt).not.toContain("LOUDON'S OPEN NOTES");
  });
});
