// readLog's `flags` filter: only the commits that close or carry a weave flag,
// across all of history, so the QUEUE deck can reconcile a flag closed long
// before the last page of commits.

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readLog } from '../../server/git.js';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

describe('readLog — flags', () => {
  let root;
  const g = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', env: gitFreeEnv() });
  const commit = (file, msg) => { writeFileSync(join(root, file), msg); g('add', '--', file); g('commit', '-q', '-m', msg); };

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'readlog-flags-'));
    g('init', '-q');
    assertScratchRepo(root);
    g('config', 'user.email', 'test@palace');
    g('config', 'user.name', 'Test Palace');
    g('config', 'commit.gpgsign', 'false');
    commit('a.md', 'weave: one\n\nPalace-Resolves: f-1');
    commit('b.md', 'edit(B): nothing about flags');
    commit('c.md', 'weave: two\n\nDeclined flag f-2: no longer true');
    commit('d.md', 'weave: three\n\nCarried flag p-1: half done');
    commit('e.md', 'edit(E): plain again');
  });
  afterAll(() => { rmSync(root, { recursive: true, force: true }); });

  test('keeps only the closing and carrying commits, newest first, with their lines parsed', async () => {
    const { commits } = await readLog(root, { limit: 2000, flags: true });
    expect(commits.map((c) => c.summary)).toEqual(['three', 'two', 'one']);
    expect(commits[0].carried).toEqual([{ id: 'p-1', note: 'half done' }]);
    expect(commits[1].declined).toEqual([{ id: 'f-2', note: 'no longer true' }]);
    expect(commits[2].resolves).toEqual(['f-1']);
  });

  test('without flags, the page of recent commits is unchanged', async () => {
    const { commits } = await readLog(root, { limit: 2 });
    expect(commits.map((c) => c.summary)).toEqual(['plain again', 'three']);
  });
});
