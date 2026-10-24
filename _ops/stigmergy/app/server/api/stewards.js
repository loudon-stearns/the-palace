// server/api/stewards.js — permanent-steward lane endpoints.
//   GET  /api/stewards            — registered stewards + grant state + worker
//   POST /api/steward/advance     — advance ONE steward by a run (up to max_cycles / manifest max_iterations)
//   POST /api/stewards/advance-all — advance every ready steward (queues behind a live cycle)
//   POST /api/steward/dequeue     — take a queued steward back out of the lane's queue

import { jsonResponse, readBody } from '../http.js';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

export async function stewardsRoutes(ctx) {
  const { req, res, urlPath, method, stewardLane, opts } = ctx;

  // Each row carries grants_waiting (TRICKSTER grants the steward hasn't yet
  // consumed) plus the steward-lane worker status.
  if (urlPath === '/api/stewards' && method === 'GET') {
    try {
      jsonResponse(res, 200, {
        stewards: stewardLane.list(),
        worker: stewardLane.status(),
        stubbed: !!process.env.STIGMERGY_STUB_WORKER || !!opts.stewardLane,
        ts: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      jsonResponse(res, 500, { error: `read stewards failed: ${err.message}` });
      return true;
    }
  }

  // Body: { name }. Fires the steward-lane worker; the reap consumes its
  // pending grants. When a steward cycle is already alive the name joins the
  // lane's queue instead (200, { queued: true, position }).
  if (urlPath === '/api/steward/advance' && method === 'POST') {
    const bodyText = await readBody(req, res);
    if (bodyText === null) return true; // 413 already sent
    let body;
    try { body = JSON.parse(bodyText); } catch (e) {
      jsonResponse(res, 400, { error: `malformed JSON: ${e.message}` });
      return true;
    }
    const name = body && typeof body.name === 'string' ? body.name.trim() : '';
    if (name === '') { jsonResponse(res, 400, { error: 'missing or empty name' }); return true; }
    // `max_cycles` (optional) caps this activation's run; otherwise the
    // manifest's stopping_conditions.max_iterations applies (see steward-lane).
    const maxCycles = Number.isInteger(body.max_cycles) && body.max_cycles > 0 ? body.max_cycles : undefined;
    const result = stewardLane.advance({ name, maxCycles });
    if (!result.ok) {
      // unknown steward -> 404; anything else -> 500 (busy now queues, never refuses).
      const status = result.found === false ? 404 : (result.busy ? 409 : 500);
      jsonResponse(res, status, { ...result, ...stewardLane.status() });
      return true;
    }
    jsonResponse(res, 200, { ...result, ...stewardLane.status() });
    return true;
  }

  // Body: { name }. Removes a queued steward from the lane's queue.
  if (urlPath === '/api/steward/dequeue' && method === 'POST') {
    const bodyText = await readBody(req, res);
    if (bodyText === null) return true;
    let body;
    try { body = JSON.parse(bodyText); } catch (e) {
      jsonResponse(res, 400, { error: `malformed JSON: ${e.message}` });
      return true;
    }
    const name = body && typeof body.name === 'string' ? body.name.trim() : '';
    if (name === '') { jsonResponse(res, 400, { error: 'missing or empty name' }); return true; }
    const result = stewardLane.dequeue({ name });
    jsonResponse(res, result.ok ? 200 : 404, { ...result, ...stewardLane.status() });
    return true;
  }

  // Body: { names? }. Defaults to all stewards with grants_waiting > 0. Fires
  // them serially (one worker per lane); the reap drains the queue. With a
  // cycle alive, the names join the queue behind it.
  if (urlPath === '/api/stewards/advance-all' && method === 'POST') {
    const bodyText = await readBody(req, res);
    if (bodyText === null) return true; // 413 already sent
    let body = {};
    if (bodyText.trim() !== '') {
      try { body = JSON.parse(bodyText); } catch (e) {
        jsonResponse(res, 400, { error: `malformed JSON: ${e.message}` });
        return true;
      }
    }
    const names = Array.isArray(body.names) ? body.names : undefined;
    const maxCycles = Number.isInteger(body.max_cycles) && body.max_cycles > 0 ? body.max_cycles : undefined;
    // Batch limits (2026-10-14): a wall clock in minutes and a token budget,
    // summed from each cycle's own result line; `source` names the caller
    // (e.g. "heartbeat") so the deck can say whose batch is running.
    const maxMinutes = Number.isFinite(body.max_minutes) && body.max_minutes > 0 ? body.max_minutes : undefined;
    const maxTokens = Number.isFinite(body.max_tokens) && body.max_tokens > 0 ? body.max_tokens : undefined;
    const source = typeof body.source === 'string' ? body.source.slice(0, 40) : undefined;
    const maxCycleMinutes = Number.isFinite(body.max_cycle_minutes) && body.max_cycle_minutes > 0 ? body.max_cycle_minutes : undefined;
    const result = stewardLane.advanceAll({ names, maxCycles, maxMinutes, maxTokens, maxCycleMinutes, source });
    if (!result.ok && result.busy) {
      jsonResponse(res, 409, { ...result });
      return true;
    }
    jsonResponse(res, 200, { ...result });
    return true;
  }

  // GET /api/steward/transcript?home=<agent_id>&from=<line> — the WATCH pane
  // (2026-10-13). While the steward is the live cycle, its transcript is the
  // lane's current_transcript; otherwise the newest transcript for that
  // steward's slug. Returns the lines from `from` on, the next cursor, and
  // whether the cycle is still running.
  if (urlPath === '/api/steward/transcript' && method === 'GET') {
    const home = (ctx.query.get('home') || '').trim();
    const from = Math.max(0, parseInt(ctx.query.get('from') || '0', 10) || 0);
    if (!home) { jsonResponse(res, 400, { error: 'missing home' }); return true; }
    const found = typeof stewardLane.transcriptFor === 'function' ? stewardLane.transcriptFor(home) : null;
    const path = found ? found.path : null;
    if (!path || !existsSync(path)) { jsonResponse(res, 404, { error: 'no transcript for this steward', home }); return true; }
    const all = readFileSync(path, 'utf8').split('\n');
    if (all.length && all[all.length - 1] === '') all.pop();
    const lines = all.slice(from);
    const running = !!(found && found.running);
    jsonResponse(res, 200, { ok: true, home, path: relative(ctx.palaceRoot, path), from, next: all.length, lines, running });
    return true;
  }

  return false;
}
