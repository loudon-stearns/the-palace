import { describe, test, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { listProjectEntries, scrollAll } from '../../src/scroll.js';

describe('scrollAll', () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

  // One project per case the header names: active, blank, dormant (stewarded),
  // complete, and composting by stage with an active or blank status.
  function palace() {
    root = mkdtempSync(path.join(tmpdir(), 'palace-scroll-all-'));
    mkdirSync(path.join(root, 'Projects'), { recursive: true });
    const project = (title, fm) => writeFileSync(path.join(root, 'Projects', `${title}.md`), `---\ntype: project\n${fm}---\n# ${title}`);
    project('Active', 'status: active\nstage: growing\n');
    project('Blank', 'stage: sprout\n');
    project('Sleeper', 'stage: dormant\n');
    project('Done', 'status: complete\nstage: mature\n');
    project('Compost Active', 'status: active\nstage: composting\n');
    project('Compost Blank', 'stage: composting\n');
    const agentDir = path.join(root, '_ops/agents/permanent/sleeper');
    mkdirSync(agentDir, { recursive: true });
    writeFileSync(path.join(root, '_ops/agents/permanent/REGISTRY.json'), JSON.stringify({ schema_version: '1.0', agents: [{ agent_id: 'sleeper', home: 'Sleeper', dir: agentDir }] }));
  }

  const byHome = (rs) => Object.fromEntries(rs.map((r) => [r.home, r]));

  test('listProjectEntries carries the stage beside the status', () => {
    palace();
    const e = Object.fromEntries(listProjectEntries(root).map((p) => [p.title, p]));
    expect(e['Compost Blank']).toMatchObject({ status: null, stage: 'composting' });
    expect(e['Compost Active']).toMatchObject({ status: 'active', stage: 'composting' });
  });

  // Each file's answer is kept until its mtime or size changes; an edited page
  // must be read again, never served from what it said before.
  test('listProjectEntries reads a page again once it changes', () => {
    palace();
    const file = path.join(root, 'Projects', 'Blank.md');
    expect(listProjectEntries(root).find((p) => p.title === 'Blank')).toMatchObject({ stage: 'sprout' });
    writeFileSync(file, '---\ntype: project\nstage: growing\n---\n# Blank, grown');
    utimesSync(file, new Date(), new Date(Date.now() + 5000));
    expect(listProjectEntries(root).find((p) => p.title === 'Blank')).toMatchObject({ stage: 'growing' });
    writeFileSync(file, '---\ntype: practice\n---\n# Blank, no longer a project at all');
    utimesSync(file, new Date(), new Date(Date.now() + 10000));
    expect(listProjectEntries(root).find((p) => p.title === 'Blank')).toBeUndefined();
  });

  test('--all skips stage composting whatever the status, keeps dormant stewarded projects', () => {
    palace();
    const r = byHome(scrollAll({ palaceRoot: root, dryRun: true, tsNow: '2026-10-25T00:00:00Z' }));
    expect(r['Compost Active']).toEqual({ home: 'Compost Active', skipped: 'stage_composting' });
    expect(r['Compost Blank']).toEqual({ home: 'Compost Blank', skipped: 'stage_composting' });
    expect(r['Done']).toEqual({ home: 'Done', skipped: 'status_complete' });
    expect(r['Sleeper']).toMatchObject({ stewarded: true, written: false });
    expect(r['Sleeper'].skipped).toBeUndefined();
    expect(r['Active'].skipped).toBeUndefined();
    expect(r['Blank'].skipped).toBeUndefined();
    // a dry run writes nothing
    expect(existsSync(path.join(root, 'Projects', 'Sleeper', 'Sleeper — scroll.md'))).toBe(false);
  });

  test('--include-inactive still scrolls everything, composting included', () => {
    palace();
    const rs = scrollAll({ palaceRoot: root, dryRun: true, includeInactive: true, tsNow: '2026-10-25T00:00:00Z' });
    expect(rs.filter((r) => r.skipped)).toEqual([]);
    expect(rs.map((r) => r.home)).toHaveLength(6);
  });
});
