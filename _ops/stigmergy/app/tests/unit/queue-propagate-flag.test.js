// The deck tells the same truth about weave flags as _ops/swarm/lint-weave-flags.py
// (Weave Ceremony Step 1c): a propagate flag is never hidden by a GRANT/DENY or
// closed by a touch or a decline; a Palace-Resolves trailer closes any weave flag;
// a Declined flag line closes an entry flag; a Carried flag line shows how far a
// propagate flag has got.

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildQueue, reconcileWeaveFlags, synthesizeFlagAsk } from '../../src/lib/queue-model.js';
import { parseFlagLines, classifyCommit } from '../../src/lib/commit-parse.js';
import QueueItem from '../../src/components/queue/QueueItem.jsx';

const flag = (id, payload) => ({
  schema_version: '1.0', id, ts: '2026-10-18T10:00:00-04:00', session_id: 's', from: 'TRICKSTER',
  to: '*', type: 'BROADCAST', board: 'WEAVE', payload: { kind: 'weave_flag', ...payload },
});
const propagateFlag = (id = 'p-1') => flag(id, {
  flag_type: 'propagate', source_entries: [], target_entry: 'SCHEMA — Reference',
  decision: 'last_tested is retired', scope: 'pages still carrying the field',
  check: 'does the page carry last_tested?', rhythm: 'by-touch', pattern: '^last_tested:',
  proposed_action: 'take it off when the page grows a tuning ledger', rationale: 'retire page by page',
  source_deposit_id: '9f9d1cf1',
});
const entryFlag = (id = 'e-1') => flag(id, {
  flag_type: 'backlink_audit', source_entries: ['Alpha'], target_entry: 'Beta',
  proposed_action: 'link Alpha to Beta', rationale: 'r', source_deposit_id: 'D-1',
});
const deny = (re) => ({ id: `deny-${re}`, ts: '2026-10-18T11:00:00-04:00', type: 'RESOURCE_DENY', board: 'WEAVE', re, payload: {} });
const commit = (shortHash, body, over = {}) => ({
  shortHash, date: '2026-10-21T10:00:00-04:00', entries: [],
  ...classifyCommit({ subject: 'Weave — 2026-10-21 — x', body, paths: [] }), ...over,
});

describe('parseFlagLines', () => {
  it('reads Declined and Carried lines, with or without a list marker, and an older msg- id', () => {
    const { declined, carried } = parseFlagLines([
      'Declined flag e-1: no longer true',
      '- Declined flag msg-e-2: superseded',
      'Carried flag p-1: 12 pages left',
      'Palace-Resolves: x',
    ].join('\n'));
    expect(declined).toEqual([{ id: 'e-1', note: 'no longer true' }, { id: 'msg-e-2', note: 'superseded' }]);
    expect(carried).toEqual([{ id: 'p-1', note: '12 pages left' }]);
  });
  it('rides on every classified commit', () => {
    const c = classifyCommit({ subject: 'x', body: 'Carried flag p-1: half', paths: [] });
    expect(c.carried).toEqual([{ id: 'p-1', note: 'half' }]);
    expect(c.declined).toEqual([]);
  });
});

describe('buildQueue — propagate flags', () => {
  it('keeps a propagate flag a RESOURCE_DENY answered, and still drops a denied entry flag', () => {
    const items = buildQueue([propagateFlag(), entryFlag(), deny('p-1'), deny('e-1')]);
    expect(items.map((i) => i.id)).toEqual(['p-1']);
  });
  it('carries the decision, points at its home, and names no entry a touch could close it by', () => {
    const [it] = buildQueue([propagateFlag()]);
    expect(it.summary).toBe('last_tested is retired');
    expect(it.propagate).toMatchObject({ rhythm: 'by-touch', pattern: '^last_tested:', scope: 'pages still carrying the field' });
    expect(it.pointer).toEqual({ type: 'entry', target: 'SCHEMA — Reference' });
    expect(it.entry).toBeNull();
    expect(it.entries).toEqual([]);
    expect(it.stale_if).toBe('a commit carries Palace-Resolves: p-1 once the check is clean');
  });
  it('synthesizes an ask when a propagate flag carries no action', () => {
    expect(synthesizeFlagAsk('propagate', [], 'The Palace Voice', { decision: 'say entry', scope: 'every canon entry' }))
      .toBe('carry "say entry" (home [[The Palace Voice]]) to every canon entry');
  });
});

describe('reconcileWeaveFlags', () => {
  const items = () => buildQueue([propagateFlag(), entryFlag(), entryFlag('e-2')]);
  const byId = (list) => Object.fromEntries(list.map((i) => [i.id, i]));

  it('a decline closes an entry flag (msg- form too) and never a propagate flag', () => {
    const out = byId(reconcileWeaveFlags(items(), [
      commit('aaa1111', 'Declined flag e-1: done elsewhere\nDeclined flag msg-e-2: old form\nDeclined flag p-1: a weave may not'),
    ]));
    expect(out['e-1'].resolved).toMatchObject({ done: true, reason: 'declined in commit aaa1111: done elsewhere' });
    expect(out['e-2'].resolved.done).toBe(true);
    expect(out['p-1'].resolved.done).toBe(false);
  });
  it('a Carried line shows the latest note and leaves the flag open', () => {
    const out = byId(reconcileWeaveFlags(items(), [
      commit('bbb2222', 'Carried flag p-1: 3 pages left'),
      commit('ccc3333', 'Carried flag p-1: 9 pages left', { date: '2026-09-24T10:00:00-04:00' }),
    ]));
    expect(out['p-1'].carried).toMatchObject({ commit: 'bbb2222', note: '3 pages left' });
    expect(out['p-1'].resolved.done).toBe(false);
  });
  it('a Palace-Resolves trailer closes any weave flag, one id or a list', () => {
    const out = byId(reconcileWeaveFlags(items(), [commit('ddd4444', 'Palace-Resolves: p-1, e-1')]));
    expect(out['p-1'].resolved).toMatchObject({ done: true, commit: 'ddd4444' });
    expect(out['e-1'].resolved.done).toBe(true);
    expect(out['e-2'].resolved.done).toBe(false);
  });
  it('a commit that only touched a flag\'s entry closes nothing, and other kinds pass through', () => {
    const todo = { id: 't-1', kind: 'stigmergy_todo', resolved: { done: false } };
    const out = reconcileWeaveFlags([...items(), todo], [commit('eee5555', 'edit', { entries: ['Alpha', 'SCHEMA — Reference'] })]);
    expect(out.every((i) => !i.resolved.done)).toBe(true);
    expect(out[out.length - 1]).toBe(todo);
  });
});

describe('QueueItem — a propagate card', () => {
  const render = (item) => renderToStaticMarkup(React.createElement(QueueItem, { item, onRespond: () => {} }));

  it('shows the decision, its reach, rhythm and close rule, and offers no grant or deny', () => {
    const [it] = reconcileWeaveFlags(buildQueue([propagateFlag()]), [commit('bbb2222', 'Carried flag p-1: 3 pages left')]);
    const html = render(it);
    expect(html).toContain('last_tested is retired');
    expect(html).toContain('reaches: pages still carrying the field');
    expect(html).toContain('by touch: measured, never swept');
    expect(html).toContain('home: SCHEMA — Reference');
    expect(html).toContain('carried in bbb2222: 3 pages left');
    expect(html).toContain('closes when a weave&#x27;s commit carries Palace-Resolves: p-1');
    expect(html).not.toContain('data-testid="queue-item-grant"');
    expect(html).not.toContain('data-testid="queue-item-deny"');
  });
  it('an entry flag keeps its grant and deny', () => {
    const [it] = buildQueue([entryFlag()]);
    const html = render(it);
    expect(html).toContain('data-testid="queue-item-grant"');
    expect(html).not.toContain('data-testid="queue-item-propagate"');
  });
});
