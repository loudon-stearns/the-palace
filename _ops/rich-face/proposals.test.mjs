// node --test _ops/rich-face/proposals.test.mjs — proposals.mjs on throwaway manifests.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { collectProposals, formatReport, ageDays, readManifests } from './proposals.mjs';

const A = {
  entry: 'Alpha', sections: [
    { heading: 'One', status: 'proposal', proposed: { date: '2026-11-01', by: 'maker-a', round: 'proposal-round-2026-11' },
      challenge: { date: '2026-11-02', by: 'ch-b', verdicts: [{ file: 'x', verdict: 'keep', why: '' }, { file: 'y', verdict: 'remake', why: '' }, { file: 'z', verdict: 'retire', why: '' }] },
      pieces: [{ file: 'x' }, { file: 'y' }] },
    { heading: 'Two', status: 'proposal', proposed: { date: '2026-10-30', by: 'maker-a' }, pieces: [] },
    { heading: 'Three', pieces: [] },
    { heading: 'Four', status: 'approved', approved: { date: '2026-11-03', by: 'Loudon', via: 'chat' }, pieces: [] },
    { heading: 'Five', status: 'retired', pieces: [] },
  ],
  offers: [
    { section: 'One', kind: 'no-claim-edit', what: 'k → K', status: 'open' },
    { section: 'Two', kind: 'claim-change', what: 'needs K_send too' },          // no status: open
    { section: 'Two', kind: 'claim-change', what: 'done', status: 'taken' },
  ],
};
const B = { entry: 'Beta', sections: [{ heading: 'Only', pieces: [] }] };

test('ageDays counts whole days, never negative, null without a date', () => {
  assert.equal(ageDays('2026-11-01', '2026-11-03'), 2);
  assert.equal(ageDays('2026-11-05', '2026-11-03'), 0);
  assert.equal(ageDays(undefined, '2026-11-03'), null);
});

test('collects proposal sections with age and verdict counts, and open offers only', () => {
  const r = collectProposals([{ entry: 'Alpha', path: 'Alpha/Alpha — rich.json', manifest: A }, { entry: 'Beta', path: 'Beta/Beta — rich.json', manifest: B }], { today: '2026-11-03' });
  assert.deepEqual(r.proposals.map((p) => p.heading), ['One', 'Two']);
  assert.equal(r.proposals[0].age_days, 2);
  assert.deepEqual(r.proposals[0].challenge, { date: '2026-11-02', by: 'ch-b', keep: 1, remake: 1, retire: 1 });
  assert.equal(r.proposals[1].challenge, null);
  assert.equal(r.proposals[1].age_days, 4);
  assert.deepEqual(r.offers.map((o) => o.what), ['k → K', 'needs K_send too']);
  assert.deepEqual(r.errors, []);
});

test('a manifest that is not JSON is reported, not thrown', () => {
  const r = collectProposals([{ entry: 'Bad', path: 'Bad/Bad — rich.json', manifest: null, error: 'Unexpected token' }], { today: '2026-11-03' });
  assert.equal(r.errors.length, 1);
  assert.match(formatReport(r), /Bad\/Bad — rich\.json: Unexpected token/);
});

test('the report names each entry, its proposals and offers, and a total', () => {
  const r = collectProposals([{ entry: 'Alpha', path: 'Alpha/Alpha — rich.json', manifest: A }], { today: '2026-11-03' });
  const t = formatReport(r);
  assert.match(t, /^Alpha  \(Alpha\/Alpha — rich\.json\)/m);
  assert.match(t, /proposal  "One"  · 2 days · 2 pieces · by maker-a · proposal-round-2026-11 · challenge: 1 keep, 1 remake, 1 retire \(ch-b\)/);
  assert.match(t, /proposal  "Two"  · 4 days · 0 pieces · by maker-a · not yet challenged/);
  assert.match(t, /offer     "One" · no-claim-edit · open · k → K/);
  assert.match(t, /2 section\(s\) at proposal across 1 page\(s\) · 2 open offer\(s\)$/);
  assert.match(formatReport(collectProposals([], { today: '2026-11-03' })), /nothing waits/);
});

test('readManifests finds tracked and new manifests in a throwaway repo', () => {
  const root = mkdtempSync(join(tmpdir(), 'rich-proposals-'));
  execFileSync('git', ['-C', root, 'init', '-q']);
  mkdirSync(join(root, 'Alpha'));
  writeFileSync(join(root, 'Alpha', 'Alpha — rich.json'), JSON.stringify(A));
  execFileSync('git', ['-C', root, 'add', '-A']);
  mkdirSync(join(root, 'Beta'));
  writeFileSync(join(root, 'Beta', 'Beta — rich.json'), JSON.stringify(B));          // new, untracked
  writeFileSync(join(root, 'Beta', 'Beta — scroll.md'), '');                          // not a manifest
  const got = readManifests(root);
  assert.deepEqual(got.map((g) => g.path), ['Alpha/Alpha — rich.json', 'Beta/Beta — rich.json']);
  assert.deepEqual(got.map((g) => g.entry), ['Alpha', 'Beta']);
  assert.equal(got[0].manifest.sections.length, 5);
});
