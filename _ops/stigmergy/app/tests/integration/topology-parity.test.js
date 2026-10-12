import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readLiveMap } from '../../src/lib/topology-live.js';

// Two builders draw the typed-link graph: the Python Map Build
// (`_ops/swarm/build-map-*.py`), whose dated snapshot the Weave and the linters
// argue from, and src/lib/topology-live.js, which the TOPOLOGY lens reads on
// every load. If they disagree, the lens and the Weave see different palaces.
// This runs the real builder over the real tree — this checkout — and holds
// the live graph to it, node for node and edge for edge.
//
// It needs python3 with PyYAML and the builder on disk. Where it can't run it
// skips and says why; it never passes quietly on a comparison it didn't make.

const PALACE = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../../..');
const SWARM = join(PALACE, '_ops', 'swarm');

function newestBuilder() {
  if (!existsSync(SWARM)) return null;
  const names = readdirSync(SWARM).filter((n) => /^build-map-.*\.py$/.test(n)).sort();
  return names.length ? join(SWARM, names[names.length - 1]) : null;
}

// What the two must agree on. `use` and `last_used` are the snapshot's alone
// (git-derived, as of its date); the lens reads them from the entry catalog.
const nodeKey = (n) => [n.id, n.path, n.type, n.stage, n.has_forward_vector, n.outbound_count, n.inbound_count, n.ops_card];
const edgeKey = (e) => JSON.stringify([e.source, e.type, e.target, e.label]);

describe('live topology vs the Map Build', () => {
  let outDir = null;
  let built = null;
  let skipReason = null;

  beforeAll(() => {
    const builder = newestBuilder();
    if (!builder) { skipReason = `no build-map-*.py under ${SWARM}`; return; }
    // The builder tests every part of the absolute path against its exclude
    // list, so a checkout that itself sits under .claude/ (a session worktree)
    // maps to nothing. Nothing to compare there.
    if (PALACE.split(sep).includes('.claude')) {
      skipReason = `this checkout sits under .claude/, which the builder excludes: ${PALACE}`;
      return;
    }
    outDir = mkdtempSync(join(tmpdir(), 'palace-parity-'));
    const run = spawnSync('python3', [builder, '--date', '2000-01-01', '--out-dir', outDir], {
      encoding: 'utf8', timeout: 110_000,
    });
    const file = join(outDir, 'palace-map-full-2000-01-01.json');
    if (run.error || run.status !== 0 || !existsSync(file)) {
      const why = run.error?.message ?? (run.stderr || '').trim().split('\n').slice(-2).join(' / ');
      skipReason = `the builder did not run here (${why || `exit ${run.status}`})`;
      return;
    }
    built = JSON.parse(readFileSync(file, 'utf8'));
  }, 120_000);

  afterAll(() => { if (outDir) rmSync(outDir, { recursive: true, force: true }); });

  const guard = (ctx) => {
    if (built) return false;
    console.warn(`[topology-parity] SKIPPED — ${skipReason}`);
    ctx.skip();
    return true;
  };

  test('same nodes, with the same fields', (ctx) => {
    if (guard(ctx)) return;
    const live = readLiveMap(PALACE);
    expect(live.meta.duplicate_ids).toEqual([]);
    expect(live.nodes.map(nodeKey)).toEqual(built.nodes.map(nodeKey));
    expect(live.meta.node_count).toBe(built.meta.node_count);
  });

  test('same edges — source, type, target and label', (ctx) => {
    if (guard(ctx)) return;
    const live = readLiveMap(PALACE);
    expect(live.edges.map(edgeKey).sort()).toEqual(built.edges.map(edgeKey).sort());
    expect(live.meta.edge_count).toBe(built.meta.edge_count);
  });
});
