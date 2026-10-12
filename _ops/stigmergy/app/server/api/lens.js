// server/api/lens.js — GET /api/lens/suggest?subject=<title>&limit=<n>
//
// Ranks candidate GLASS pages for a lensing subject by link-distance over the
// live typed-link graph (the same source TopologyLens reads), per
// [[The Lens]]'s own design: "lean on the graph to suggest high-value
// lensings — never make the user hunt N²."

import { jsonResponse } from '../http.js';
import { readLiveMap } from '../../src/lib/topology-live.js';
import { rankLensCandidates } from '../../src/lib/lens-suggest.js';

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 50;

export async function lensRoutes(ctx) {
  const { res, palaceRoot, urlPath, query, method } = ctx;
  if (urlPath !== '/api/lens/suggest' || method !== 'GET') return false;

  const subject = query.get('subject');
  if (!subject) {
    jsonResponse(res, 400, { error: 'missing ?subject' });
    return true;
  }

  const map = readLiveMap(palaceRoot);

  const limitRaw = Number.parseInt(query.get('limit'), 10);
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, MAX_LIMIT) : DEFAULT_LIMIT;

  const candidates = rankLensCandidates(map, subject, limit);
  jsonResponse(res, 200, { subject, candidates, map_source: map.source });
  return true;
}
