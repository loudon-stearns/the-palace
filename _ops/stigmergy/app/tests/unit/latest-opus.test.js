// The one resolver for "the latest Opus" (_ops/models/latest-opus.mjs).
// Every case hands it its own catalog dir and CLI version, so nothing here
// reads ~/.claude or runs `claude`.
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  FLOOR_OPUS, opusVersion, compareOpus, cliAtLeast, readCatalogOpus,
  latestOpusInfo, latestOpus, resolveModel,
} from '../../../../models/latest-opus.mjs';

let dir;
beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'latest-opus-')); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

// One catalog file in Claude Code's cached shape.
function catalog(name, models) {
  writeFileSync(join(dir, name), JSON.stringify({
    version: 2, fetchedAt: 0, staleAt: 0,
    catalog: { surface: 'ccd', config: { id: 'ccd', models } },
  }));
}
const NO_ENV = { HOME: '/nonexistent' };

describe('reading Opus ids', () => {
  test('opusVersion parses plain Opus ids and refuses everything else', () => {
    expect(opusVersion('claude-opus-5-5')).toEqual([5, 5, 0]);
    expect(opusVersion('claude-opus-5')).toEqual([5, 0, 0]);
    expect(opusVersion('claude-opus-4-1-20250805')).toEqual([4, 1, 20250805]);
    expect(opusVersion('claude-opus-4-20250514')).toEqual([4, 0, 20250514]);
    for (const id of ['opus', 'claude-sonnet-5-5', 'claude-opus-5-5-fast', 'claude-opus-5-5[1m]', '', null]) {
      expect(opusVersion(id)).toBeNull();
    }
  });

  test('compareOpus orders by major, then minor, then date', () => {
    expect(compareOpus('claude-opus-6', 'claude-opus-5-5')).toBeGreaterThan(0);
    expect(compareOpus('claude-opus-5-5', 'claude-opus-5')).toBeGreaterThan(0);
    expect(compareOpus('claude-opus-4-8', 'claude-opus-5')).toBeLessThan(0);
    expect(compareOpus('claude-opus-5-5', 'claude-opus-5-5')).toBe(0);
  });

  test('cliAtLeast compares versions numerically and refuses what it cannot read', () => {
    expect(cliAtLeast('2.1.280', '2.1.280')).toBe(true);
    expect(cliAtLeast('2.1.300', '2.1.280')).toBe(true);
    expect(cliAtLeast('2.2.0', '2.1.999')).toBe(true);
    expect(cliAtLeast('2.1.279', '2.1.280')).toBe(false);
    expect(cliAtLeast(null, '2.1.280')).toBe(false);
    expect(cliAtLeast('2.1.280', 'soon')).toBe(false);
  });

  test('readCatalogOpus keeps only Opus ids, and the stricter minimum where catalogs disagree', () => {
    catalog('a-ccd.json', [
      { id: 'claude-opus-6', min_claude_code_version: '2.2.0' },
      { id: 'claude-sonnet-6' },
      { id: 'claude-opus-5-5' },
    ]);
    catalog('b-cc.json', [{ id: 'claude-opus-6', min_claude_code_version: '2.3.0' }]);
    writeFileSync(join(dir, 'x-cc.headless-failed.json'), JSON.stringify({ failedAt: 1, failures: 1 }));
    writeFileSync(join(dir, 'broken.json'), '{ not json');
    const found = readCatalogOpus(dir);
    expect([...found.keys()].sort()).toEqual(['claude-opus-5-5', 'claude-opus-6']);
    expect(found.get('claude-opus-6')).toBe('2.3.0');
    expect(found.get('claude-opus-5-5')).toBeNull();
  });

  test('a missing catalog dir reads as empty, not an error', () => {
    expect(readCatalogOpus(join(dir, 'nope')).size).toBe(0);
  });
});

describe('deciding the latest Opus', () => {
  test('no catalog → the floor', () => {
    const info = latestOpusInfo({ env: NO_ENV, catalogDir: join(dir, 'nope'), cliVersion: '9.9.9' });
    expect(info).toMatchObject({ id: FLOOR_OPUS, source: 'floor', catalog_newest: null });
  });

  test('a newer Opus the installed CLI can run → that Opus', () => {
    catalog('a-ccd.json', [{ id: 'claude-opus-6', min_claude_code_version: '2.2.0' }, { id: FLOOR_OPUS }]);
    const info = latestOpusInfo({ env: NO_ENV, catalogDir: dir, cliVersion: '2.2.1' });
    expect(info).toMatchObject({ id: 'claude-opus-6', source: 'catalog', catalog_newest: 'claude-opus-6' });
  });

  test('a newer Opus the installed CLI is too old for → skipped, with the reason', () => {
    catalog('a-ccd.json', [
      { id: 'claude-opus-6-1', min_claude_code_version: '2.4.0' },
      { id: 'claude-opus-6', min_claude_code_version: '2.2.0' },
    ]);
    const info = latestOpusInfo({ env: NO_ENV, catalogDir: dir, cliVersion: '2.3.0' });
    expect(info.id).toBe('claude-opus-6');
    expect(info.skipped).toEqual(['claude-opus-6-1 needs claude 2.4.0; have 2.3.0']);
  });

  test('a CLI version nobody could read takes no Opus that states a minimum', () => {
    catalog('a-ccd.json', [{ id: 'claude-opus-6', min_claude_code_version: '2.2.0' }]);
    expect(latestOpusInfo({ env: NO_ENV, catalogDir: dir, cliVersion: null }).id).toBe(FLOOR_OPUS);
  });

  test('a newer Opus with no stated minimum is taken without asking the CLI', () => {
    catalog('a-ccd.json', [{ id: 'claude-opus-6' }]);
    expect(latestOpusInfo({ env: NO_ENV, catalogDir: dir }).id).toBe('claude-opus-6');
  });

  test('an older catalog never undercuts the floor', () => {
    catalog('a-ccd.json', [{ id: 'claude-opus-4-8' }, { id: 'claude-opus-5' }]);
    const info = latestOpusInfo({ env: NO_ENV, catalogDir: dir, cliVersion: '9.9.9' });
    expect(info).toMatchObject({ id: FLOOR_OPUS, source: 'floor', catalog_newest: 'claude-opus-5' });
  });

  test('PALACE_LATEST_OPUS holds the answer whatever the catalog says', () => {
    catalog('a-ccd.json', [{ id: 'claude-opus-6' }]);
    const info = latestOpusInfo({ env: { ...NO_ENV, PALACE_LATEST_OPUS: 'claude-opus-5-5' }, catalogDir: dir });
    expect(info).toMatchObject({ id: 'claude-opus-5-5', source: 'env' });
  });
});

describe('resolveModel', () => {
  test('empty or the word "opus" → the latest Opus, an exact id', () => {
    catalog('a-ccd.json', [{ id: 'claude-opus-6' }]);
    const opts = { env: NO_ENV, catalogDir: dir };
    for (const asked of [undefined, null, '', 'opus', ' Opus ']) expect(resolveModel(asked, opts)).toBe('claude-opus-6');
  });

  test('any other model passes through untouched — an explicit pin stays a pin', () => {
    const opts = { env: NO_ENV, catalogDir: dir };
    for (const asked of ['claude-opus-4-8', 'claude-sonnet-5', 'sonnet', 'claude-fable-5-1']) expect(resolveModel(asked, opts)).toBe(asked);
  });

  test('with no options it answers an exact Opus id from the real machine', () => {
    expect(opusVersion(latestOpus()) || process.env.PALACE_LATEST_OPUS).toBeTruthy();
    expect(compareOpus(latestOpus(), FLOOR_OPUS) >= 0 || !!process.env.PALACE_LATEST_OPUS).toBe(true);
  });
});
