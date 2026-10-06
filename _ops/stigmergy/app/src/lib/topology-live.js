// Live topology — the typed-link graph, read from the files as they are now.
//
// The Map Build (`_ops/swarm/build-map-*.py`) writes a dated snapshot that the
// Weave, the linters and the partitioner all argue from; that file is a fixed
// picture on purpose. The TOPOLOGY lens sits in STATE — "what is known now" —
// so it draws from this module instead: the same walk the entry list uses,
// turned into the same { meta, nodes, edges } shape the snapshot has.
//
// Every rule below is the Python builder's, restated. Two builders that
// disagree would make the lens and the Weave see different palaces, so
// tests/integration/topology-parity.test.js runs the real builder over the
// real tree and holds this file to its output. Change a rule there, change it
// here, and let that test say when they have drifted.
//
// What is left out is what only a dated record needs: the git-derived `use`
// and `last_used` on each node (the lens reads those from the entry catalog),
// the ghost taxonomy and the frontmatter-error list.

import { basename } from 'node:path';
import { walkEntryRecords } from './entries.js';

// SCHEMA §1 minus `breakthrough` — the builder's CANON_TYPES.
const CANON_TYPES = new Set([
  'concept', 'hub', 'project', 'source', 'meta',
  'practice', 'person', 'question', 'spore', 'specialist', 'maker',
]);

// A file under any of these folders is never a node (builder: EXCLUDE_PARTS).
const EXCLUDE_PARTS = new Set([
  '.git', '.obsidian', '.claude', '__pycache__', 'node_modules', 'venv', '.venv',
  '.venvs', 'dist', 'build', '.next', '.cache', 'site-packages', '_tools', 'entries',
  '_manim_media',
]);

// Machinery subtrees under _ops/ whose files are not ceremony cards
// (builder: OPS_EXCLUDE).
const OPS_EXCLUDE = new Set([
  'swarm', 'stigmergy', 'agents', 'sample-libraries', 'loudon-live', 'maps', 'scratch',
  'claude-code-prompts', 'heartbeat', 'lost-and-found', 'Harvest Ceremony',
]);

// A .md is a node iff it carries a canonical `type:` and sits where entries
// live. Under _ops/ only a ceremony card counts: a file directly in _ops/, or
// one level into a subfolder that is not machinery.
export function isNode(record) {
  if (!record || typeof record.path !== 'string') return false;
  const parts = record.path.split('/');
  if (parts.some((p) => EXCLUDE_PARTS.has(p))) return false;
  if (parts[0] === '_ops') {
    const card = parts.length === 2 || (parts.length === 3 && !OPS_EXCLUDE.has(parts[1]));
    if (!card) return false;
  }
  return CANON_TYPES.has(record.type);
}

// A link target names a page by its filename: drop an |alias, a #heading, a
// folder path and a trailing .md.
export function targetId(target) {
  let t = target.split('|')[0].split('#')[0].trim();
  if (t.endsWith('.md')) t = t.slice(0, -3);
  if (t.includes('/')) t = t.split('/').pop();
  return t.trim();
}

// Pure: entry records in, graph out. A node's id is its filename, so two
// entries sharing a name collapse into one node (the first by path wins, and
// meta.duplicate_ids names them). Every typed link is an edge, including one
// whose target is not a node — a forward ghost or a bundle file; the lens
// drops those when it draws. Only edges that land on a node are counted in a
// node's outbound/inbound.
export function buildGraph(records, { generated = null } = {}) {
  const byId = new Map();
  const duplicates = new Set();
  const sorted = [...records].filter(isNode).sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  for (const r of sorted) {
    const id = basename(r.path, '.md');
    if (byId.has(id)) { duplicates.add(id); continue; }
    byId.set(id, r);
  }

  const edges = [];
  const outbound = new Map();
  const inbound = new Map();
  const bump = (m, k) => m.set(k, (m.get(k) ?? 0) + 1);
  for (const [id, r] of byId) {
    for (const link of r.links ?? []) {
      if (/^https?:\/\//i.test(link.target)) continue;
      const target = targetId(link.target);
      edges.push({ source: id, type: link.type, target, label: link.label });
      if (byId.has(target)) { bump(outbound, id); bump(inbound, target); }
    }
  }

  const nodes = [...byId.keys()].sort().map((id) => {
    const r = byId.get(id);
    return {
      id,
      path: r.path,
      type: r.type,
      stage: r.stage ?? null,
      has_forward_vector: !!r.has_forward_vector,
      outbound_count: outbound.get(id) ?? 0,
      inbound_count: inbound.get(id) ?? 0,
      ops_card: r.path.startsWith('_ops/'),
    };
  });

  return {
    source: 'live',
    meta: {
      generated,
      scope: 'live',
      node_count: nodes.length,
      edge_count: edges.length,
      duplicate_ids: [...duplicates].sort(),
    },
    nodes,
    edges,
  };
}

// Walk the palace and build the graph. One read of every entry's
// frontmatter — the same cost as the entry list.
export function readLiveMap(palaceRoot) {
  const records = [];
  for (const r of walkEntryRecords(palaceRoot)) {
    // The body is the heavy part of a record and the graph never reads it.
    records.push({ path: r.path, type: r.type, stage: r.stage, has_forward_vector: r.has_forward_vector, links: r.links });
  }
  return buildGraph(records, { generated: new Date().toISOString().slice(0, 10) });
}
