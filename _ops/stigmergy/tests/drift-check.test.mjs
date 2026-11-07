// drift-check.test.mjs — the drift check runs on this checkout and reports in shape.
//
// It reads STIGMERGY.md beside the code; on a fresh checkout the page and the code
// should agree on decks, types and lanes, so those three report nothing. The board
// and the ledger can legitimately differ, so they are only checked for shape.
//
// Run:  node --test _ops/stigmergy/tests/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CHECK = resolve(dirname(fileURLToPath(import.meta.url)), '../drift-check.mjs');

test('drift-check --json: every finding names its check, what and where; decks, types and lanes are level', () => {
  const out = JSON.parse(execFileSync('node', [CHECK, '--json'], { encoding: 'utf8' }));
  assert.ok(Array.isArray(out.findings));
  for (const f of out.findings) for (const k of ['check', 'what', 'where']) assert.equal(typeof f[k], 'string', `${k} on ${JSON.stringify(f)}`);
  for (const c of ['decks', 'types', 'lanes']) assert.deepEqual(out.findings.filter((f) => f.check === c), [], `${c} drifted`);
});
