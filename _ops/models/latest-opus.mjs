// latest-opus.mjs — the one place the palace says which Opus is "the latest."
//
// Every script that runs an Opus, or stamps one on a board message, asks here
// instead of carrying its own pin, so a new Opus release needs no sweep.
// Loudon's wish: every time Opus is chosen, it is the latest Opus.
//
// How the answer is found — the newest of these wins:
//   1. FLOOR_OPUS, below: the newest Opus this file has been told about. It is
//      the answer whenever nothing newer can be read, and nothing undercuts it.
//   2. Claude Code's own model catalog, which the Claude app caches on this Mac
//      at ~/.claude/cache/model-catalog/*.json and refreshes about hourly.
//      Every plain `claude-opus-<major>[-<minor>][-<yyyymmdd>]` id listed there
//      is a candidate. One newer than the floor is taken only when the `claude`
//      CLI the lanes spawn meets that model's `min_claude_code_version`: the
//      catalog comes from the app, the dispatch runs the CLI, and the two can
//      sit on different versions.
// It works offline and touches no credentials: it reads local files, takes
// only each model's `id` and `min_claude_code_version` from them, and runs
// `claude --version` only when a newer candidate actually shows up. If the
// catalog is missing or its shape changes, the answer is the floor.
//
// PALACE_LATEST_OPUS, when set, wins outright — a global hold if a new Opus
// misbehaves, or a fixed answer for a test.
//
// The answer is always an exact id, never the CLI's bare `opus` alias, which
// has lagged the latest Opus. The word `opus` is still welcome as INPUT:
// resolveModel('opus') returns the exact id, so a steward manifest or the
// launch picker can say "opus" and mean "the latest Opus." Any other id passes
// through untouched — an explicit pin stays a pin.
//
// From a shell:  node _ops/models/latest-opus.mjs          → the id
//                node _ops/models/latest-opus.mjs --why    → the id and how it was found

import { readdirSync, readFileSync, accessSync, constants } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const FLOOR_OPUS = 'claude-opus-5-5';

const OPUS_ID = /^claude-opus-(\d+)(?:-(\d{1,2}))?(?:-(\d{8}))?$/;
const SEMVER = /^(\d+)\.(\d+)\.(\d+)/;
const CACHE_MS = 10 * 60 * 1000;

/** [major, minor, yyyymmdd] for a plain Opus id; null for anything else. */
export function opusVersion(id) {
  const m = OPUS_ID.exec(String(id ?? ''));
  return m ? [Number(m[1]), Number(m[2] ?? 0), Number(m[3] ?? 0)] : null;
}

/** Positive when Opus id `a` is newer than `b`. Both must be plain Opus ids. */
export function compareOpus(a, b) {
  const va = opusVersion(a);
  const vb = opusVersion(b);
  for (let i = 0; i < 3; i++) if (va[i] !== vb[i]) return va[i] - vb[i];
  return 0;
}

/** True when CLI version `have` is at least `need`. Unreadable either way → false. */
export function cliAtLeast(have, need) {
  const h = SEMVER.exec(String(have ?? ''));
  const n = SEMVER.exec(String(need ?? ''));
  if (!h || !n) return false;
  for (let i = 1; i <= 3; i++) if (Number(h[i]) !== Number(n[i])) return Number(h[i]) > Number(n[i]);
  return true;
}

function catalogDirFor(env) {
  return join(env.HOME || homedir(), '.claude', 'cache', 'model-catalog');
}

/**
 * Every plain Opus id in Claude Code's cached catalogs → the CLI version it
 * needs (null when no catalog states one). Where catalogs disagree on the
 * minimum, the stricter one is kept. A missing or unreadable dir → empty map.
 */
export function readCatalogOpus(dir) {
  const found = new Map();
  let files = [];
  try { files = readdirSync(dir).filter((f) => f.endsWith('.json')); } catch { return found; }
  for (const f of files) {
    let models;
    try { models = JSON.parse(readFileSync(join(dir, f), 'utf8'))?.catalog?.config?.models; } catch { continue; }
    if (!Array.isArray(models)) continue;
    for (const m of models) {
      if (!m || !opusVersion(m.id)) continue;
      const min = typeof m.min_claude_code_version === 'string' ? m.min_claude_code_version : null;
      const prev = found.get(m.id);
      if (!found.has(m.id) || (min && (!prev || cliAtLeast(min, prev)))) found.set(m.id, min ?? prev ?? null);
    }
  }
  return found;
}

// The CLI the lanes spawn, in the same order as
// _ops/stigmergy/app/server/claude-bin.js: $CLAUDE_BIN, then ~/.local/bin/claude,
// then whatever `claude` PATH finds.
function claudeBin(env) {
  if (env.CLAUDE_BIN) return env.CLAUDE_BIN;
  const pinned = join(env.HOME || homedir(), '.local', 'bin', 'claude');
  try { accessSync(pinned, constants.X_OK); return pinned; } catch { return 'claude'; }
}

function installedCliVersion(env) {
  try {
    const out = execFileSync(claudeBin(env), ['--version'], {
      encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'],
    });
    return SEMVER.exec(String(out).trim())?.[0] ?? null;
  } catch { return null; }
}

/**
 * The latest Opus, and how it was found.
 * @param {object} [opts]
 * @param {object} [opts.env]         default process.env
 * @param {string} [opts.catalogDir]  default ~/.claude/cache/model-catalog
 * @param {string|null} [opts.cliVersion]  the installed CLI's version; when
 *   absent, `claude --version` is asked, and only if a newer candidate exists
 * @returns {{ id: string, source: 'env'|'catalog'|'floor', floor: string,
 *             catalog_newest: string|null, skipped: string[] }}
 */
export function latestOpusInfo(opts = {}) {
  const env = opts.env || process.env;
  const hold = String(env.PALACE_LATEST_OPUS ?? '').trim();
  if (hold) return { id: hold, source: 'env', floor: FLOOR_OPUS, catalog_newest: null, skipped: [] };

  const found = readCatalogOpus(opts.catalogDir || catalogDirFor(env));
  const newestFirst = [...found.keys()].sort((a, b) => compareOpus(b, a));
  const catalog_newest = newestFirst[0] ?? null;
  const skipped = [];
  let cli;
  let asked = false;
  for (const id of newestFirst) {
    if (compareOpus(id, FLOOR_OPUS) <= 0) break;
    const min = found.get(id);
    if (min) {
      if (!asked) { asked = true; cli = 'cliVersion' in opts ? opts.cliVersion : installedCliVersion(env); }
      if (!cliAtLeast(cli, min)) { skipped.push(`${id} needs claude ${min}; have ${cli ?? 'unknown'}`); continue; }
    }
    return { id, source: 'catalog', floor: FLOOR_OPUS, catalog_newest, skipped };
  }
  return { id: FLOOR_OPUS, source: 'floor', floor: FLOOR_OPUS, catalog_newest, skipped };
}

let memo = null;

/**
 * The exact id of the latest Opus. With no arguments the answer is kept for ten
 * minutes, so a long-running server picks up a new release without a restart
 * and a busy one does not re-read the catalog on every dispatch. Passing opts
 * skips the cache.
 */
export function latestOpus(opts) {
  if (opts) return latestOpusInfo(opts).id;
  const now = Date.now();
  if (!memo || now - memo.at > CACHE_MS) memo = { at: now, id: latestOpusInfo().id };
  return memo.id;
}

/** A requested model → the id to run: empty or "opus" → the latest Opus; anything else as given. */
export function resolveModel(name, opts) {
  const n = typeof name === 'string' ? name.trim() : '';
  if (!n || n.toLowerCase() === 'opus') return latestOpus(opts);
  return name;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--why')) console.log(JSON.stringify(latestOpusInfo(), null, 2));
  else console.log(latestOpus());
}
