// server/api/log.js — the LOG deck: git history + structured commit creation.
//   GET  /api/log          — the commit stream (classified + diffstat)
//   GET  /api/commit?sha=  — one commit's palace-aware diff
//   GET  /api/uncommitted  — the working-tree delta (the banner)
//   GET  /api/git-state    — worktree topology (branches, ahead/behind, dirty)
//   GET  /api/trunk-state  — the trunk as scripts/trunk-state.mjs reads it
//   POST /api/commit/create — record a structured palace commit

import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { jsonResponse, readBody } from '../http.js';
import { readLog, readCommit, readUncommitted, readGitState, readCommitGraph } from '../git.js';
import { commitSelected } from '../commit.js';

// The trunk for the LOG deck's strip: what `trunk-state.mjs --json
// --no-writers --since 24h` prints, the same object by construction. It runs
// as its own process rather than imported: its readers are synchronous git
// calls (about 1.8 s on the real palace, most of it the worktree walk) that
// would hold the dev server for that long, and a script outside the Vite
// config's import graph can change without rebuilding the lanes. --no-writers
// skips the slow transcript search. One read serves every caller for 30 s, and
// a request that arrives while one runs waits for it rather than starting
// another. Every git call in the script is a read with optional locks off.
const TRUNK_STATE = fileURLToPath(new URL('../../scripts/trunk-state.mjs', import.meta.url));
export const TRUNK_TTL_MS = 30_000;
const trunkReads = new Map(); // palace root -> { at, pending, promise }

export function readTrunkState(palaceRoot, { now = Date.now(), ttlMs = TRUNK_TTL_MS } = {}) {
  const root = resolve(palaceRoot);
  const held = trunkReads.get(root);
  if (held && (held.pending || now - held.at < ttlMs)) return held.promise;
  const read = { at: now, pending: true, promise: null };
  read.promise = new Promise((ok, fail) => {
    execFile(process.execPath, [TRUNK_STATE, '--json', '--no-writers', '--since', '24h'], {
      cwd: root,
      env: { ...process.env, PALACE_ROOT: root, GIT_OPTIONAL_LOCKS: '0' },
      maxBuffer: 16 * 1024 * 1024,
      timeout: 60_000,
      windowsHide: true,
    }, (err, stdout, stderr) => {
      read.pending = false;
      const drop = () => { if (trunkReads.get(root) === read) trunkReads.delete(root); };
      if (err) { drop(); fail(new Error(String(stderr || '').trim() || err.message)); return; }
      try {
        read.at = Date.now();
        ok({ ...JSON.parse(stdout), ts: new Date(read.at).toISOString() });
      } catch (e) { drop(); fail(new Error(`unreadable output: ${e.message}`)); }
    });
  });
  trunkReads.set(root, read);
  return read.promise;
}

export async function logRoutes(ctx) {
  const { req, res, palaceRoot, urlPath, query, method } = ctx;

  // ?limit=N caps the stream; ?path=<rel> filters to one entry's history;
  // ?flags=1 keeps only the commits that close or carry a weave flag.
  if (urlPath === '/api/log' && method === 'GET') {
    try {
      const limit = query.get('limit') ?? '100';
      const pathspec = query.get('path');
      const flags = query.get('flags') === '1';
      const result = await readLog(palaceRoot, { limit, pathspec, flags });
      if (result.error) { jsonResponse(res, 400, { error: result.error }); return true; }
      jsonResponse(res, 200, { ...result, ts: new Date().toISOString() });
      return true;
    } catch (err) {
      jsonResponse(res, 500, { error: `git log failed: ${err.message}` });
      return true;
    }
  }

  if (urlPath === '/api/commit' && method === 'GET') {
    const sha = query.get('sha');
    if (!sha) { jsonResponse(res, 400, { error: 'missing ?sha' }); return true; }
    try {
      const commit = await readCommit(palaceRoot, sha);
      if (!commit) { jsonResponse(res, 404, { error: 'commit not found or invalid ref', sha }); return true; }
      jsonResponse(res, 200, commit);
      return true;
    } catch (err) {
      jsonResponse(res, 500, { error: `git show failed: ${err.message}` });
      return true;
    }
  }

  if (urlPath === '/api/uncommitted' && method === 'GET') {
    try {
      const delta = await readUncommitted(palaceRoot);
      jsonResponse(res, 200, { ...delta, ts: new Date().toISOString() });
      return true;
    } catch (err) {
      jsonResponse(res, 500, { error: `git status failed: ${err.message}` });
      return true;
    }
  }

  // The worktree topology -- read-only; never prunes or mutates a worktree.
  if (urlPath === '/api/git-state' && method === 'GET') {
    try {
      const state = await readGitState(palaceRoot);
      jsonResponse(res, 200, { ...state, ts: new Date().toISOString() });
      return true;
    } catch (err) {
      jsonResponse(res, 500, { error: `git worktree read failed: ${err.message}` });
      return true;
    }
  }

  // The trunk, for the strip at the top of GIT STATE. Read-only: no push, no
  // heal, nothing pruned or removed. `ts` is when the held read was taken.
  if (urlPath === '/api/trunk-state' && method === 'GET') {
    try {
      jsonResponse(res, 200, await readTrunkState(palaceRoot));
    } catch (err) {
      jsonResponse(res, 500, { error: `trunk read failed: ${err.message}` });
    }
    return true;
  }

  // The commit DAG behind the worktrees (LOG deck TOPOLOGY). Read-only.
  // ?depth=N walks the drawn root N commits deeper down the trunk.
  if (urlPath === '/api/commit-graph' && method === 'GET') {
    try {
      const graph = await readCommitGraph(palaceRoot, { depth: query.get('depth') ?? 0 });
      jsonResponse(res, 200, { ...graph, ts: new Date().toISOString() });
      return true;
    } catch (err) {
      jsonResponse(res, 500, { error: `git graph read failed: ${err.message}` });
      return true;
    }
  }

  // Body: { paths:[...], kind, summary, verify, scope?, body?, campaign?,
  // resolves? }. Stages ONLY the named paths (never -A), derives the Palace-*
  // trailers from their staged diff, and commits exactly those.
  if (urlPath === '/api/commit/create' && method === 'POST') {
    const bodyText = await readBody(req, res);
    if (bodyText === null) return true; // 413 already sent
    let payload;
    try { payload = JSON.parse(bodyText); } catch (e) {
      jsonResponse(res, 400, { error: `malformed JSON: ${e.message}` });
      return true;
    }
    const { paths, kind, scope, summary, body, verify, campaign, resolves } = payload || {};
    const result = await commitSelected(palaceRoot, {
      paths, kind, scope, summary, body, verify, campaign, resolves, author: 'loudon',
    });
    if (!result.ok) { jsonResponse(res, 400, result); return true; }
    jsonResponse(res, 200, { ...result, ts: new Date().toISOString() });
    return true;
  }

  return false;
}
