// node --test _ops/rich-face/approve.test.mjs — approve.mjs on a throwaway manifest.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { approveSections, approveManifestFile, parseArgs } from './approve.mjs';

const fixture = () => ({
  title: 'Throwaway — rich', entry: 'Throwaway', tier: 'sketch', made: '2026-11-03', round: 2,
  offers: [{ section: 'One', kind: 'no-claim-edit', what: 'rename k to K', status: 'open' }],
  sections: [
    { heading: 'One', made_against: 'abcabcabcabc', status: 'proposal', proposed: { date: '2026-11-01', by: 'maker-a', round: 'proposal-round-2026-11' },
      challenge: { date: '2026-11-02', by: 'challenger-b', verdicts: [{ file: 'Throwaway — rich — one.html', verdict: 'keep', why: 'tests the claim' }] },
      pieces: [{ file: 'Throwaway — rich — one.html', origin: 'made' }] },
    { heading: 'Two', made_against: 'defdefdefdef', status: 'proposal', proposed: { date: '2026-11-01', by: 'maker-a', round: 'proposal-round-2026-11' }, pieces: [] },
    { heading: 'Notes', made_against: '111111111111', pieces: [] },                 // no status: approved already
    { heading: 'Notes (2)', made_against: '222222222222', status: 'retired', pieces: [] },
  ],
});

test('approves the named section and writes the block, nothing else moves', () => {
  const m = fixture();
  const out = approveSections(m, { sections: ['One'], via: 'dock', today: '2026-11-03' });
  assert.deepEqual(out, { approved: ['One'], unmatched: [], notProposal: [] });
  assert.equal(m.sections[0].status, 'approved');
  assert.deepEqual(m.sections[0].approved, { date: '2026-11-03', by: 'Loudon', via: 'dock' });
  assert.equal(m.sections[1].status, 'proposal');                                  // untouched
  assert.deepEqual(m.sections[0].challenge, fixture().sections[0].challenge);      // kept
  assert.deepEqual(m.offers, fixture().offers);                                    // offers untouched
});

test('--all takes every proposal section and leaves approved and retired alone', () => {
  const m = fixture();
  const out = approveSections(m, { all: true, today: '2026-11-03' });
  assert.deepEqual(out.approved, ['One', 'Two']);
  assert.equal(m.sections[2].status, undefined);
  assert.equal(m.sections[3].status, 'retired');
});

test('a section not at proposal is skipped and named; a missing one is named', () => {
  const m = fixture();
  const out = approveSections(m, { sections: ['Notes', 'Nowhere', 'notes (2)'], today: '2026-11-03' });
  assert.deepEqual(out.approved, []);
  assert.deepEqual(out.unmatched, ['Nowhere']);
  assert.deepEqual(out.notProposal.map((x) => x.heading), ['Notes', 'Notes (2)']);
});

test('refuses a bad --via, an empty --by, and no sections without --all', () => {
  assert.throws(() => approveSections(fixture(), { sections: ['One'], via: 'email' }), /--via/);
  assert.throws(() => approveSections(fixture(), { sections: ['One'], by: '' }), /--by/);
  assert.throws(() => approveSections(fixture(), {}), /--all/);
});

test('the file is rewritten only when a section was approved', () => {
  const dir = mkdtempSync(join(tmpdir(), 'rich-approve-'));
  const p = join(dir, 'Throwaway — rich.json');
  const text = JSON.stringify(fixture(), null, 2) + '\n';
  writeFileSync(p, text);
  assert.deepEqual(approveManifestFile(p, { sections: ['Notes'], today: '2026-11-03' }).approved, []);
  assert.equal(readFileSync(p, 'utf8'), text);
  const out = approveManifestFile(p, { sections: ['Two'], today: '2026-11-03' });
  assert.deepEqual(out.approved, ['Two']);
  const back = JSON.parse(readFileSync(p, 'utf8'));
  assert.equal(back.sections[1].status, 'approved');
  assert.equal(back.sections[0].status, 'proposal');
  assert.ok(readFileSync(p, 'utf8').endsWith('\n'));
});

test('parseArgs reads entry, sections and flags', () => {
  assert.deepEqual(parseArgs(['E', 'A', 'B', '--via', 'dock']), { name: 'E', sections: ['A', 'B'], all: false, by: 'Loudon', via: 'dock' });
  assert.deepEqual(parseArgs(['E', '--all']), { name: 'E', sections: [], all: true, by: 'Loudon', via: 'chat' });
  assert.throws(() => parseArgs(['E', '--alll']), /unknown flag/);
});
