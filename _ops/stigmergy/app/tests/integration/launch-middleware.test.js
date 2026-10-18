// Integration test for POST /api/launch — the route wiring (body parse, status
// codes, palace-root pass-through). The launch impl is injected via opts so NO
// real Terminal opens.

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import http from 'node:http';
import { EventEmitter } from 'node:events';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import request from 'supertest';
import { listen, closeAll } from '../helpers/loopback.js';
import { blackboardMiddleware } from '../../server/middleware.js';

function makeServer(palaceRoot, opts = {}) {
  const plugin = blackboardMiddleware(palaceRoot, opts);
  const handlers = [];
  plugin.configureServer({ middlewares: { use: (fn) => handlers.push(fn) } });
  return http.createServer((req, res) => {
    let i = 0;
    const next = () => {
      if (i >= handlers.length) { res.statusCode = 404; res.end('nf'); return; }
      handlers[i++](req, res, next);
    };
    next();
  });
}

function makeTempPalace() {
  const root = mkdtempSync(resolve(tmpdir(), 'stigmergy-launch-mw-'));
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  writeFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), '', 'utf8');
  return root;
}

describe('POST /api/launch', () => {
  let root;
  beforeEach(() => { root = makeTempPalace(); });
  afterEach(async () => { await closeAll(); rmSync(root, { recursive: true, force: true }); });

  test('400 on an empty prompt', async () => {
    const res = await request(await listen(makeServer(root))).post('/api/launch').send({ prompt: '   ' });
    expect(res.status).toBe(400);
  });

  test('200 + launched, passing the prompt and palace root to the impl', async () => {
    let seen = null;
    const launchImpl = (prompt, o) => { seen = { prompt, palaceRoot: o.palaceRoot }; return { launched: true, supported: true, scriptPath: '/tmp/x/launch.command' }; };
    const res = await request(await listen(makeServer(root, { launchImpl }))).post('/api/launch').send({ prompt: 'drive [[Foo]] — "go"' });
    expect(res.status).toBe(200);
    expect(res.body.launched).toBe(true);
    expect(seen.prompt).toBe('drive [[Foo]] — "go"');
    expect(seen.palaceRoot).toBe(root);
  });

  test('501 when the host is not macOS (client falls back to copy)', async () => {
    const launchImpl = () => ({ launched: false, supported: false, error: 'open-in-terminal is macOS-only — use copy prompt.' });
    const res = await request(await listen(makeServer(root, { launchImpl }))).post('/api/launch').send({ prompt: 'x' });
    expect(res.status).toBe(501);
    expect(res.body.supported).toBe(false);
  });

  test('500 on an unexpected launch failure', async () => {
    const launchImpl = () => ({ launched: false, supported: true, error: 'open exited 1' });
    const res = await request(await listen(makeServer(root, { launchImpl }))).post('/api/launch').send({ prompt: 'x' });
    expect(res.status).toBe(500);
  });
});

describe('POST /api/launch/agent', () => {
  let root;
  beforeEach(() => { root = makeTempPalace(); });
  afterEach(async () => { await closeAll(); rmSync(root, { recursive: true, force: true }); });

  // A registered steward roster + an injected cycle-prompt builder, so the route
  // is exercised without real agent files on disk.
  const ROW = { agent_id: 'Kuramoto Coupling', home: 'Kuramoto Coupling', dir: '_ops/agents/permanent/kuramoto-coupling', stage: 'growing', iteration: 9 };
  const stewardLane = { list: () => [ROW] };

  test('400 when no home is given', async () => {
    const res = await request(await listen(makeServer(root, { stewardLane }))).post('/api/launch/agent').send({});
    expect(res.status).toBe(400);
  });

  test('404 when the page is not a registered steward (client falls back)', async () => {
    const res = await request(await listen(makeServer(root, { stewardLane: { list: () => [] } })))
      .post('/api/launch/agent').send({ home: 'Not A Steward' });
    expect(res.status).toBe(404);
    expect(res.body.registered).toBe(false);
  });

  test('preview returns the tiered construction + the constructed prompt, built in interactive mode at the right cycle', async () => {
    let built = null;
    const buildCyclePromptImpl = (o) => { built = o; return { full: `CONSTRUCTED for ${o.agentDir} (cycle ${o.cycleN})` }; };
    const res = await request(await listen(makeServer(root, { stewardLane, buildCyclePromptImpl })))
      .post('/api/launch/agent').send({ home: 'Kuramoto Coupling', mandate: 'resolve stage 2', preview: true });
    expect(res.status).toBe(200);
    expect(res.body.preview).toBe(true);
    expect(res.body.cycle).toBe(10);                 // iteration 9 -> cycle 10
    expect(res.body.prompt).toContain('CONSTRUCTED for');
    expect(res.body.construction.tiers).toHaveLength(4);   // the JEWEL tiers 0-3
    expect(res.body.construction.tiers[3].loads).toBe('injected'); // active surface is injected
    expect(res.body.construction.framing).toMatch(/narrates every write/i);
    // the builder was driven in interactive mode, at the resolved dir/cycle, with the mandate
    expect(built.mode).toBe('interactive');
    expect(built.agentDir).toBe(ROW.dir);
    expect(built.cycleN).toBe(10);
    expect(built.extraMandate).toBe('resolve stage 2');
  });

  test('launch hands the constructed prompt + model/effort to the launcher', async () => {
    let launched = null;
    const buildCyclePromptImpl = () => ({ full: 'THE CONSTRUCTED PROMPT' });
    const launchImpl = (prompt, o) => { launched = { prompt, model: o.model, effort: o.effort }; return { launched: true, supported: true, scriptPath: '/tmp/x/launch.command' }; };
    const res = await request(await listen(makeServer(root, { stewardLane, buildCyclePromptImpl, launchImpl })))
      .post('/api/launch/agent').send({ home: 'Kuramoto Coupling', model: 'claude-opus-4-8', effort: 'xhigh' });
    expect(res.status).toBe(200);
    expect(res.body.launched).toBe(true);
    expect(res.body.cycle).toBe(10);
    expect(launched.prompt).toBe('THE CONSTRUCTED PROMPT');
    expect(launched.model).toBe('claude-opus-4-8');
    expect(launched.effort).toBe('xhigh');
  });

  test('an out-of-range effort is dropped (launcher applies its default)', async () => {
    let launched = null;
    const buildCyclePromptImpl = () => ({ full: 'P' });
    const launchImpl = (prompt, o) => { launched = o; return { launched: true, supported: true }; };
    await request(await listen(makeServer(root, { stewardLane, buildCyclePromptImpl, launchImpl })))
      .post('/api/launch/agent').send({ home: 'Kuramoto Coupling', effort: 'ludicrous' });
    expect(launched.effort).toBeUndefined();  // not in the allowlist -> default
  });

  test('include toggles pass to the builder and trim the Tier-3 construction summary', async () => {
    let built = null;
    const buildCyclePromptImpl = (o) => { built = o; return { full: 'P' }; };
    const res = await request(await listen(makeServer(root, { stewardLane, buildCyclePromptImpl })))
      .post('/api/launch/agent').send({ home: 'Kuramoto Coupling', include: { board: false, scroll: false }, preview: true });
    expect(res.status).toBe(200);
    // normalized: only the toggled-off layers go false; the rest default true
    expect(built.include).toEqual({ board: false, history: true, pageChange: true, scroll: false });
    expect(res.body.construction.include.board).toBe(false);
    // Tier-3 text reflects the trim
    expect(res.body.construction.tiers[3].what).not.toMatch(/board slice/i);
    expect(res.body.construction.tiers[3].what).toMatch(/recent history/i);
    // identity + state are never trimmed
    expect(res.body.construction.tiers[3].what).toMatch(/injected in full as identity/i);
    expect(res.body.construction.tiers[3].what).toMatch(/state \(/i);
  });
});

describe('POST /api/launch/ephemeral', () => {
  let root;
  beforeEach(() => { root = makeTempPalace(); });
  afterEach(async () => { await closeAll(); rmSync(root, { recursive: true, force: true }); });

  // The ephemeral path wakes ANY page as itself (no steward roster). An injected
  // builder stands in for buildEphemeralPrompt so the route is exercised without
  // walking a palace.
  const okBuild = (o) => ({ ok: true, status: 'built', home: o.title, stage: 'growing', full: `AWAKEN ${o.title}` });

  test('400 when no home is given', async () => {
    const res = await request(await listen(makeServer(root, { buildEphemeralPromptImpl: okBuild })))
      .post('/api/launch/ephemeral').send({});
    expect(res.status).toBe(400);
  });

  test('preview returns the awaken construction + the prompt — no steward layers, no cycle', async () => {
    let built = null;
    const buildEphemeralPromptImpl = (o) => { built = o; return okBuild(o); };
    const res = await request(await listen(makeServer(root, { buildEphemeralPromptImpl })))
      .post('/api/launch/ephemeral').send({ home: 'Murmuration', mandate: 'sketch the boids', preview: true });
    expect(res.status).toBe(200);
    expect(res.body.preview).toBe(true);
    expect(res.body.ephemeral).toBe(true);
    expect(res.body.cycle).toBeUndefined();          // a woken page has no cycle
    expect(res.body.prompt).toContain('AWAKEN Murmuration');
    expect(res.body.construction.tiers).toHaveLength(4);
    expect(res.body.construction.tiers[3].loads).toBe('injected');
    expect(res.body.construction.ephemeral).toBe(true);
    expect(res.body.construction.include).toBeUndefined(); // no layer toggles for a woken page
    // the awaken framing + the three-desire posture
    expect(res.body.construction.framing).toMatch(/enchanted/i);
    expect(res.body.construction.framing).toMatch(/not a steward/i);
    expect(res.body.construction.posture).toMatch(/forward vector/i);
    expect(res.body.construction.posture).toMatch(/good palace citizen/i);
    expect(res.body.construction.posture).toMatch(/healthy for the palace/i);
    expect(res.body.construction.tiers[3].what).toMatch(/your forward vector/i);
    expect(res.body.construction.tiers[3].what).toMatch(/injected in full as identity/i);
    // the builder is driven by title + the session note only — no mode, no include
    expect(built.title).toBe('Murmuration');
    expect(built.extraMandate).toBe('sketch the boids');
    expect(built.mode).toBeUndefined();
    expect(built.include).toBeUndefined();
  });

  test('launch hands the woken prompt + model/effort to the launcher', async () => {
    let launched = null;
    const launchImpl = (prompt, o) => { launched = { prompt, model: o.model, effort: o.effort }; return { launched: true, supported: true, scriptPath: '/tmp/x/launch.command' }; };
    const res = await request(await listen(makeServer(root, { buildEphemeralPromptImpl: okBuild, launchImpl })))
      .post('/api/launch/ephemeral').send({ home: 'Murmuration', model: 'claude-sonnet-4-6', effort: 'high' });
    expect(res.status).toBe(200);
    expect(res.body.launched).toBe(true);
    expect(res.body.ephemeral).toBe(true);
    expect(res.body.cycle).toBeUndefined();
    expect(launched.prompt).toBe('AWAKEN Murmuration');
    expect(launched.model).toBe('claude-sonnet-4-6');
    expect(launched.effort).toBe('high');
  });

  test('404 when the page is not found', async () => {
    const buildEphemeralPromptImpl = () => ({ ok: false, status: 'not_found', home: 'Ghost' });
    const res = await request(await listen(makeServer(root, { buildEphemeralPromptImpl })))
      .post('/api/launch/ephemeral').send({ home: 'Ghost' });
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('not_found');
  });

  test('422 when the page has no frontmatter (a learning material, not a canon entry)', async () => {
    const buildEphemeralPromptImpl = () => ({ ok: false, status: 'no_frontmatter', home: 'Plain' });
    const res = await request(await listen(makeServer(root, { buildEphemeralPromptImpl })))
      .post('/api/launch/ephemeral').send({ home: 'Plain' });
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/no frontmatter/i);
  });

  test('501 when the host is not macOS (client falls back to copy)', async () => {
    const launchImpl = () => ({ launched: false, supported: false, error: 'open-in-terminal is macOS-only — use copy prompt.' });
    const res = await request(await listen(makeServer(root, { buildEphemeralPromptImpl: okBuild, launchImpl })))
      .post('/api/launch/ephemeral').send({ home: 'Murmuration' });
    expect(res.status).toBe(501);
    expect(res.body.supported).toBe(false);
  });
});

// target: 'desktop' — the same three routes, built the same way, handed to the
// desktop door instead of the terminal. Both impls are injected, so a test can
// see which door a request reached; nothing opens.
describe('launch target: desktop', () => {
  let root;
  beforeEach(() => { root = makeTempPalace(); });
  afterEach(async () => { await closeAll(); rmSync(root, { recursive: true, force: true }); });

  // Records which door was used and with what.
  function doors() {
    const seen = [];
    const ok = (door) => (prompt, o) => { seen.push({ door, prompt, ...o }); return { launched: true, supported: true, ...(door === 'desktop' ? { stagedPath: '/p/x.txt', link: 'claude://code/new?q=x' } : { scriptPath: '/tmp/x/launch.command' }) }; };
    return { seen, launchImpl: ok('terminal'), desktopLaunchImpl: ok('desktop') };
  }

  test('/api/launch: target desktop reaches the desktop door with the prompt, root and label', async () => {
    const d = doors();
    const res = await request(await listen(makeServer(root, d)))
      .post('/api/launch').send({ prompt: 'catch the baton', target: 'desktop', label: 'handoff h-1' });
    expect(res.status).toBe(200);
    expect(res.body.launched).toBe(true);
    expect(res.body.stagedPath).toBe('/p/x.txt');
    expect(res.body.link).toBe('claude://code/new?q=x');
    expect(d.seen).toHaveLength(1);
    // every LaunchModal prompt says to grow before writing, so q does too
    expect(d.seen[0]).toMatchObject({ door: 'desktop', prompt: 'catch the baton', palaceRoot: root, label: 'handoff h-1', role: 'grow' });
  });

  test('/api/launch: no target, or target terminal, stays on the terminal door', async () => {
    const d = doors();
    const srv = await listen(makeServer(root, d));
    await request(srv).post('/api/launch').send({ prompt: 'a' });
    await request(srv).post('/api/launch').send({ prompt: 'b', target: 'terminal' });
    expect(d.seen.map((x) => x.door)).toEqual(['terminal', 'terminal']);
  });

  test('400 on an unknown target, on all three routes, before anything is built or opened', async () => {
    const d = doors();
    let built = 0;
    const srv = await listen(makeServer(root, {
      ...d,
      stewardLane: { list: () => [{ agent_id: 'K', home: 'K', dir: 'd', iteration: 0 }] },
      buildCyclePromptImpl: () => { built++; return { full: 'P' }; },
      buildEphemeralPromptImpl: () => { built++; return { ok: true, full: 'P' }; },
    }));
    for (const [path, body] of [
      ['/api/launch', { prompt: 'x', target: 'cowork' }],
      ['/api/launch/agent', { home: 'K', target: 'cowork' }],
      ['/api/launch/ephemeral', { home: 'K', target: 'cowork' }],
    ]) {
      const res = await request(srv).post(path).send(body);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/unknown launch target/);
    }
    expect(built).toBe(0);
    expect(d.seen).toHaveLength(0);
  });

  test('/api/launch/agent: the constructed steward prompt goes to the desktop door, labelled', async () => {
    const d = doors();
    const ROW = { agent_id: 'Kuramoto Coupling', home: 'Kuramoto Coupling', dir: '_ops/agents/permanent/kuramoto-coupling', iteration: 9 };
    const res = await request(await listen(makeServer(root, { ...d, stewardLane: { list: () => [ROW] }, buildCyclePromptImpl: () => ({ full: 'THE CONSTRUCTED PROMPT' }) })))
      .post('/api/launch/agent').send({ home: 'Kuramoto Coupling', target: 'desktop' });
    expect(res.status).toBe(200);
    expect(res.body.cycle).toBe(10);
    expect(res.body.construction.tiers).toHaveLength(4);
    // the construction carries ELDER + SCHEMA, so the steward is told it is grown
    expect(d.seen[0]).toMatchObject({ door: 'desktop', prompt: 'THE CONSTRUCTED PROMPT', label: 'agent Kuramoto Coupling', role: 'grown' });
  });

  test('/api/launch/ephemeral: an enchant and a lens go to the desktop door, labelled by kind', async () => {
    const d = doors();
    const srv = await listen(makeServer(root, {
      ...d,
      buildEphemeralPromptImpl: (o) => ({ ok: true, full: `AWAKEN ${o.title}` }),
      buildLensMandateImpl: (o) => ({ ok: true, full: `LENS ${o.subjectTitle} THROUGH ${o.glassTitle}` }),
    }));
    await request(srv).post('/api/launch/ephemeral').send({ home: 'Murmuration', target: 'desktop' });
    await request(srv).post('/api/launch/ephemeral').send({ home: 'The Lens', lensSubject: 'Kuramoto Coupling', target: 'desktop' });
    // a woken page, lens or not, stays a child
    expect(d.seen[0]).toMatchObject({ door: 'desktop', prompt: 'AWAKEN Murmuration', label: 'enchant Murmuration', role: 'child' });
    expect(d.seen[1]).toMatchObject({ door: 'desktop', prompt: 'LENS Kuramoto Coupling THROUGH The Lens', label: 'lens The Lens Kuramoto Coupling', role: 'child' });
  });

  test('through the real desktop door: the prompt is staged in the palace and the link points at it', async () => {
    // Only the spawn is faked (launchOpts reaches the real launchDesktop).
    const opened = [];
    const spawnImpl = (cmd, args) => {
      opened.push({ cmd, args });
      const child = new EventEmitter();
      queueMicrotask(() => child.emit('close', 0));
      return child;
    };
    const res = await request(await listen(makeServer(root, { launchOpts: { platform: 'darwin', spawnImpl } })))
      .post('/api/launch').send({ prompt: 'catch [[Foo]] — "go"', target: 'desktop', label: 'handoff h-9' });
    expect(res.status).toBe(200);
    expect(res.body.stagedPath.startsWith(resolve(root, '_ops/stigmergy/launches') + '/')).toBe(true);
    expect(readFileSync(res.body.stagedPath, 'utf8')).toBe('catch [[Foo]] — "go"');
    expect(opened).toEqual([{ cmd: 'open', args: [res.body.link] }]);
    const url = new URL(res.body.link);
    expect(url.searchParams.get('folder')).toBe(root);
    expect(url.searchParams.get('q')).toContain(res.body.stagedPath);
    expect(url.searchParams.get('q').startsWith('Grow up (read ELDER.md, then SCHEMA.md), then read "')).toBe(true);
  });

  test('501 when the host is not macOS (client falls back to copy)', async () => {
    const res = await request(await listen(makeServer(root, { launchOpts: { platform: 'linux' } })))
      .post('/api/launch').send({ prompt: 'x', target: 'desktop' });
    expect(res.status).toBe(501);
    expect(res.body.supported).toBe(false);
  });
});
