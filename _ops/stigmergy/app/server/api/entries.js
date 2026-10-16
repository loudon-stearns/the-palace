// server/api/entries.js — palace-entry read endpoints (the STATE deck's data).
//   GET /api/entries       — recursive index of palace .md entries
//   GET /api/tree          — folder-structure tree (TREE lens), bundles nested
//   GET /api/unsung-paths  — body-wikilink edges not formalized in YAML
//   GET /api/topology      — the typed-link graph, read live from the files
//   GET /api/entry?path=   — one entry's full read shape

import { jsonResponse } from '../http.js';
import { listEntries, readEntry, walkEntryRecords } from '../../src/lib/entries.js';
import { buildEntryTree } from '../../src/lib/entry-tree.js';
import { readLiveMap } from '../../src/lib/topology-live.js';
import { findUnsungEdges, buildPalaceIndex } from '../../src/lib/unsung-paths.js';
import { entryUse } from '../../src/lib/entry-use.js';
import { checkAllowList } from '../../src/lib/entry-edit.js';
import { ceremonyPathsFor } from '../ceremony-register.js';

export async function entriesRoutes(ctx) {
  const { res, palaceRoot, urlPath, query, method } = ctx;

  if (urlPath === '/api/entries' && method === 'GET') {
    const entries = listEntries(palaceRoot, { use: await entryUse(palaceRoot) });
    jsonResponse(res, 200, { entries, count: entries.length, ts: new Date().toISOString() });
    return true;
  }

  // The palace folder structure as a nested tree: org folders contain entries,
  // and each bundled entry carries its owned files as children. Full walk like
  // /api/entries; no user input, so no path-safety surface.
  if (urlPath === '/api/tree' && method === 'GET') {
    const tree = buildEntryTree(palaceRoot, { use: await entryUse(palaceRoot) });
    jsonResponse(res, 200, { ...tree, ts: new Date().toISOString() });
    return true;
  }

  // For each entry, the [[wikilinks]] in the body that are NOT formalized in
  // YAML AND resolve to a known entry — the Weave's "unsung paths".
  if (urlPath === '/api/unsung-paths' && method === 'GET') {
    const records = [];
    for (const r of walkEntryRecords(palaceRoot)) records.push(r);
    const palaceIndex = buildPalaceIndex(records);
    const edges = findUnsungEdges(records, palaceIndex);
    jsonResponse(res, 200, {
      edges,
      entry_count: records.length,
      edge_count: edges.length,
      ts: new Date().toISOString(),
    });
    return true;
  }

  // The typed-link graph as the files stand now — not the dated Map Build
  // snapshot, which stays the Weave's fixed picture (see topology-live.js).
  if (urlPath === '/api/topology' && method === 'GET') {
    jsonResponse(res, 200, readLiveMap(palaceRoot));
    return true;
  }

  // One entry: { path, title, frontmatter, body, links, bundle, summary, care }.
  // `care` is the careful edit path's answer for this file, with the ceremony
  // register the browser cannot read for itself (a ceremony is a page carrying
  // `trigger:`, wherever it lives).
  if (urlPath === '/api/entry' && method === 'GET') {
    const rel = query.get('path');
    if (!rel) {
      jsonResponse(res, 400, { error: 'missing ?path' });
      return true;
    }
    const entry = readEntry(palaceRoot, rel, { use: await entryUse(palaceRoot) });
    if (!entry) {
      jsonResponse(res, 404, { error: 'entry not found or excluded', path: rel });
      return true;
    }
    const care = checkAllowList(entry.path, { ceremonyPaths: ceremonyPathsFor(palaceRoot), frontmatter: entry.frontmatter });
    jsonResponse(res, 200, { ...entry, care });
    return true;
  }

  return false;
}
