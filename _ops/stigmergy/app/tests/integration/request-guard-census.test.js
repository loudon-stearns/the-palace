// Every server under _ops/ stands behind STIGMERGY's request guard.
//
// A server on this Mac that takes a write — a review note, a rating, a board line — is a door
// any web page the browser loads can aim at. server/request-guard.js is the one rule for that
// door, and a server keeps it by importing checkRequest and calling it on every request; a copy
// of the rule drifts. This census reads every tracked code file under _ops/ (git ls-files, so
// a server still being written is not counted until it is committed) and fails on any that
// listens without calling checkRequest.
//
// A server that only reads may be let off with a reason in EXEMPT below, but not one that
// handles a write method, writes a file or runs a command: those are what the guard is for.
// The Vite dev server (vite.config.js) listens through Vite, not a createServer of its own, so
// it is checked by name in the last block.

import { describe, test, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gitFreeEnv } from '../helpers/git-env.js';

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PALACE = resolve(APP, '../../..');

// path (from the palace root) -> why it may listen without the guard. Empty today.
const EXEMPT = {};

// path -> what it is: a launcher that listens through Vite with the app's own vite.config.js, so
// the guard it stands behind is the one the last block checks there, not a checkRequest of its own.
const THROUGH_VITE = {
  '_ops/stigmergy/app/scripts/scratch-vite.mjs': 'the scratch STIGMERGY: the app’s own config over a throwaway palace, on a leased port',
};

const CODE = /\.(?:m?js|cjs|ts|mts|py|sh)$/;
const NOT_A_SERVER = /(?:^|\/)(?:tests?|node_modules)\/|\.(?:test|spec)\.[^/]+$/;
const LISTENS = /\bcreateServer\s*\(|\.listen\s*\(|\bHTTPServer\b|\bhttp\.server\b|\bsocketserver\b|\bserve_forever\b|\bwebsockets\.serve\b|\buvicorn\b|\bFlask\s*\(|\bFastAPI\s*\(|\bBun\.serve\b|\bDeno\.serve\b/;
const IMPORTS_GUARD = /import\s*\{[^}]*\bcheckRequest\b[^}]*\}\s*from\s*['"][^'"]*stigmergy\/app\/server\/request-guard\.js['"]/;
const CALLS_GUARD = /\bcheckRequest\s*\(\s*req\b/;
const MUTATES = /['"](?:POST|PUT|PATCH|DELETE)['"]|\b(?:writeFile|appendFile|rename|unlink|rm|mkdir)(?:Sync)?\s*\(|\b(?:exec|execFile|spawn|fork)(?:Sync)?\s*\(|\bdo_(?:POST|PUT|PATCH|DELETE)\b/;

function trackedOpsCode() {
  const out = execFileSync('git', ['-c', 'core.quotepath=off', 'ls-files', '-z', '--', '_ops'], { cwd: PALACE, maxBuffer: 64 * 1024 * 1024, env: gitFreeEnv() });
  return out.toString('utf8').split('\0').filter((p) => p && CODE.test(p) && !NOT_A_SERVER.test(p));
}

const read = (rel) => readFileSync(resolve(PALACE, rel), 'utf8');
const listeners = trackedOpsCode().filter((rel) => LISTENS.test(read(rel)));

describe('every server under _ops/ runs checkRequest', () => {
  test('the census finds the servers it is known to guard (so a broken pattern cannot pass empty)', () => {
    expect(listeners).toEqual(expect.arrayContaining(['_ops/loudon-eval/eval-server.mjs', '_ops/rich-face/rich-server.mjs']));
  });

  test('each server that listens imports checkRequest and calls it on the request', () => {
    const skipping = listeners
      .filter((rel) => !(rel in EXEMPT) && !(rel in THROUGH_VITE))
      .filter((rel) => { const src = read(rel); return !IMPORTS_GUARD.test(src) || !CALLS_GUARD.test(src); });
    expect(skipping, 'these listen without STIGMERGY’s request guard — import checkRequest from '
      + '_ops/stigmergy/app/server/request-guard.js and call it first in the request handler').toEqual([]);
  });

  test('an exemption is for a server that only reads, and says why', () => {
    for (const [rel, why] of Object.entries(EXEMPT)) {
      expect(String(why).trim().length, `${rel}: an exemption names its reason`).toBeGreaterThan(0);
      expect(MUTATES.test(read(rel)), `${rel} takes a write, writes a file or runs a command, so it cannot be exempt`).toBe(false);
    }
  });
});

describe('the STIGMERGY dev server keeps the same door', () => {
  test('vite.config.js mounts the guarded middleware and turns Vite’s CORS off', () => {
    const config = read('_ops/stigmergy/app/vite.config.js');
    expect(config).toMatch(/blackboardMiddleware\(/);
    expect(config).toMatch(/\bcors:\s*false\b/);
  });

  // A launcher that brought plugins or middleware of its own, or ran Vite in middleware mode
  // behind its own server, would put a door the guard does not see in front of the app.
  test('a launcher that listens through Vite loads the app’s own vite.config.js and adds nothing in front of it', () => {
    for (const [rel, what] of Object.entries(THROUGH_VITE)) {
      const src = read(rel);
      expect(String(what).trim().length, `${rel}: says what it is`).toBeGreaterThan(0);
      expect(src, `${rel} must load the app’s vite.config.js`).toMatch(/configFile:\s*join\(APP,\s*'vite\.config\.js'\)/);
      expect(src, `${rel} must add no plugin, middleware or server of its own`).not.toMatch(/\bplugins\s*:|\bmiddlewareMode\b|\bconfigureServer\b|\bhttp\.createServer\b|\bcheckRequest\b/);
    }
  });

  test('middleware.js runs guardRequest before any route family sees the request', () => {
    const mw = read('_ops/stigmergy/app/server/middleware.js');
    const guard = mw.search(/\bguardRequest\(\s*req\b/);
    const route = mw.search(/\bdispatch\(\s*ctx\b/);
    expect(guard).toBeGreaterThan(-1);
    expect(route).toBeGreaterThan(guard);
  });
});
