// project-since.test.mjs — before a status claim, every commit on the project.
//
// [[Two Batons, One Board]], check 3. On 2026-11-07 a session called BLUELINE
// "still waiting" after checking only the files it was about to edit; two
// steward cycles had built the waited-for thing two days before.
//
// Run:  node --test _ops/stigmergy/tests/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectSince } from '../steward-watch.mjs';
import { PAGE, DIR, palace, run } from './steward-watch-fixture.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SINCE = resolve(HERE, '../project-since.mjs');

test('projectSince: every commit on the entry, its bundle and its steward, and only those', () => {
  const p = palace();
  try {
    const r = projectSince(p.root, PAGE, '2026-11-04');
    assert.deepEqual(r.commits.map((c) => c.hash), [p.c2, p.c1]);
    assert.deepEqual(r.paths, [`${PAGE}.md`, PAGE, DIR]);
    assert.deepEqual(projectSince(p.root, PAGE, p.c2).commits, [], 'a commit is exclusive');
    assert.ok(projectSince(p.root, 'Nope', null).error);

    const out = run(SINCE, [PAGE, '--root', p.root, '--board', p.board]);
    assert.match(out, /Test Page since 2026-11-07T12:00:00Z \(its active baton card was posted/);
    assert.match(out, /no commits on the project since/);
    const back = run(SINCE, [PAGE, '--root', p.root, '--board', p.board, '--since', p.ready.id]);
    assert.match(back, /since 2026-11-04 \(baton test-page-remainder-1 was born\)/);
    assert.match(back, /2 commits on the project:/);
    assert.match(back, /steward: Test Page .* 2 steward commits in this window/);
    assert.match(back, /● open baton test-page-remainder-1/);
  } finally { rmSync(p.base, { recursive: true, force: true }); }
});
