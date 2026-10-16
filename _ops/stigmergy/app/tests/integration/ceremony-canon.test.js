// The careful edit path's ceremony guard reads the register, not a list
// (SCHEMA v1.28): a page carrying `trigger:` is ceremony canon wherever it lives,
// and so is its Context companion. The entry API hands the browser the same
// answer, since the browser cannot walk the palace for it.

import { describe, test, expect, afterEach } from 'vitest';
import http from 'node:http';
import { resolve } from 'node:path';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import request from 'supertest';
import { listen, closeAll } from '../helpers/loopback.js';
import { blackboardMiddleware } from '../../server/middleware.js';
import { ceremonyPathsFor } from '../../server/ceremony-register.js';

function makeServer(palaceRoot) {
  const plugin = blackboardMiddleware(palaceRoot);
  const handlers = [];
  plugin.configureServer({ middlewares: { use: (fn) => handlers.push(fn) } });
  return http.createServer((req, res) => {
    let i = 0;
    const next = () => { if (i >= handlers.length) { res.statusCode = 404; res.end('nf'); return; } handlers[i++](req, res, next); };
    next();
  });
}

const RITE = ['---', 'title: "A Morning Rite"', 'type: practice', 'pillars: [practice]', 'born: 2026-10', 'stage: seed', 'trigger: ["morning rite"]', 'forward_vector: "I begin the day."', '---', '', '# A Morning Rite', '', 'Body.', ''].join('\n');

function makePalace() {
  const root = mkdtempSync(resolve(tmpdir(), 'stigmergy-ceremony-canon-'));
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  writeFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), '');
  // A ceremony that lives nowhere a filename pattern would look.
  mkdirSync(resolve(root, 'Rituals/A Morning Rite'), { recursive: true });
  writeFileSync(resolve(root, 'Rituals/A Morning Rite.md'), RITE);
  writeFileSync(resolve(root, 'Rituals/A Morning Rite/A Morning Rite — Context.md'), '---\ntitle: "A Morning Rite — Context"\n---\n# why\n');
  writeFileSync(resolve(root, 'Rituals/A Morning Rite/A Morning Rite — tuning.md'), '# t\n');
  writeFileSync(resolve(root, 'Kuramoto Coupling.md'), '---\ntitle: Kuramoto Coupling\ntype: concept\npillars: [tools]\nborn: 2026-03\nstage: mature\nforward_vector: "I sync."\n---\n\n# Kuramoto Coupling\n\nBody.\n');
  return root;
}

let root;
afterEach(async () => { await closeAll(); if (root) rmSync(root, { recursive: true, force: true }); root = null; });

describe('the ceremony register guards the careful path', () => {
  test('the register is each trigger: page and its Context companion', () => {
    root = makePalace();
    expect([...ceremonyPathsFor(root, { maxAgeMs: 0 })].sort()).toEqual(['Rituals/A Morning Rite.md', 'Rituals/A Morning Rite/A Morning Rite — Context.md']);
  });

  test('a careful save of a trigger: page is refused, wherever it lives; an ordinary entry is not', async () => {
    root = makePalace();
    const base = await listen(makeServer(root));
    const refused = await request(base).post('/api/entry/save').set('Content-Type', 'application/json').send({
      path: 'Rituals/A Morning Rite.md',
      frontmatter: { title: 'A Morning Rite', type: 'practice', pillars: ['practice'], born: '2026-10', stage: 'sprout', trigger: ['morning rite'], forward_vector: 'I begin the day.' },
      body: '# A Morning Rite\n\nBody.\n', summary: 'grow it', verify: 'verified',
    });
    expect(refused.status).toBe(403);
    expect(refused.body.error).toMatch(/^ceremony canon/);
    const ok = await request(base).post('/api/entry/save').set('Content-Type', 'application/json').send({
      path: 'Kuramoto Coupling.md',
      frontmatter: { title: 'Kuramoto Coupling', type: 'concept', pillars: ['tools'], born: '2026-03', stage: 'fruiting', forward_vector: 'I sync.' },
      body: '# Kuramoto Coupling\n\nBody.\n', summary: 'fruit', verify: 'verified',
    });
    expect(ok.status).toBe(200);
  });

  test('the entry API tells the editor the careful path\'s answer', async () => {
    root = makePalace();
    const base = await listen(makeServer(root));
    const rite = await request(base).get('/api/entry').query({ path: 'Rituals/A Morning Rite.md' });
    expect(rite.body.care).toEqual({ allowed: false, reason: expect.stringMatching(/^ceremony canon/) });
    const ctx = await request(base).get('/api/entry').query({ path: 'Rituals/A Morning Rite/A Morning Rite — Context.md' });
    expect(ctx.body.care.allowed).toBe(false);
    const ledger = await request(base).get('/api/entry').query({ path: 'Rituals/A Morning Rite/A Morning Rite — tuning.md' });
    expect(ledger.body.care.allowed).toBe(true);   // a run writes its own ledger
    const plain = await request(base).get('/api/entry').query({ path: 'Kuramoto Coupling.md' });
    expect(plain.body.care).toEqual({ allowed: true, reason: null });
  });
});
