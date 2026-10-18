// GET /api/quotes — the ledger of placed quotes, anchored to the pages as they
// stand. A temp palace with a lens page, two targets and a ledger of four
// lines: one anchored and in step, one whose near phrase has left the page,
// one stamped against words that have since changed (drift), one retired.

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { resolve } from 'node:path';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import request from 'supertest';
import { listen, closeAll } from '../helpers/loopback.js';
import { blackboardMiddleware } from '../../server/middleware.js';
import { LEDGER_REL } from '../../src/lib/quotes.js';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

function makeServer(palaceRoot, opts = {}) {
  const plugin = blackboardMiddleware(palaceRoot, opts);
  const handlers = [];
  plugin.configureServer({ middlewares: { use: (fn) => handlers.push(fn) } });
  return http.createServer((req, res) => {
    let i = 0;
    const next = () => {
      if (i >= handlers.length) { res.statusCode = 404; res.end('not found'); return; }
      handlers[i++](req, res, next);
    };
    next();
  });
}

const line = (o) => `${JSON.stringify(o)}\n`;

function makeTempPalace({ withLedger = true } = {}) {
  const root = mkdtempSync(resolve(tmpdir(), 'stigmergy-quotes-test-'));
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  writeFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), '', 'utf8');
  writeFileSync(resolve(root, 'Spinoza Conatus.md'),
    '---\ntitle: Spinoza Conatus\ntype: concept\nstage: mature\n---\n# Spinoza Conatus\n\nConatus is the striving.\n');
  writeFileSync(resolve(root, 'Kuramoto.md'),
    '---\ntitle: Kuramoto\ntype: concept\npillars: [tools, philosophy]\nstage: growing\nforward_vector: "to teach synchronization."\n---\n# Kuramoto\n\nThe coupling constant **K** is the key parameter.\n\n## Origin\n\nStudied across an eight-lesson series.\n');
  writeFileSync(resolve(root, 'Granular.md'),
    '---\ntitle: Granular\ntype: concept\nstage: sprout\n---\n# Granular\n\nThe grain is the atom; the cloud is the material.\n');
  if (withLedger) {
    mkdirSync(resolve(root, '_ops/Palace Quotes'), { recursive: true });
    const base = {
      attribution: 'Spinoza', source: { kind: 'tradition', work: 'Ethics', locus: 'III, P6', translator: 'Curley' },
      fidelity: 'translation', checked: 'web', lens: 'Spinoza Conatus', why: 'because', placed_by: 'Palace Quotes',
      placed_at: '2026-10-13T00:00:00.000Z', status: 'placed',
    };
    writeFileSync(resolve(root, LEDGER_REL), [
      line({ ...base, id: 'q-ok', quote: 'Each thing strives.', target: 'Kuramoto', near: 'coupling constant K is the key parameter', section: 'Kuramoto' }),
      line({ ...base, id: 'q-moved', quote: 'Moved words.', target: 'Kuramoto', near: 'a phrase that is not on the page' }),
      line({ ...base, id: 'q-drift', quote: 'Drifted words.', target: 'Granular', near: 'the grain is the atom', section: 'Granular', made_against: '000000000000' }),
      line({ ...base, id: 'q-gone', quote: 'Taken down.', target: 'Granular', near: 'the cloud is the material' }),
      line({ id: 'q-gone', status: 'retired', retired_at: '2026-10-13T01:00:00.000Z', retired_why: 'test', placed_by: 'Palace Quotes' }),
      'not json at all\n',
    ].join(''), 'utf8');
  }
  return root;
}

describe('GET /api/quotes', () => {
  let root, base;
  beforeAll(async () => {
    root = makeTempPalace();
    base = await listen(makeServer(root));
  });
  afterAll(async () => {
    await closeAll();
    rmSync(root, { recursive: true, force: true });
  });

  test('returns every placement folded, anchored, with lens and page tallies', async () => {
    const res = await request(base).get('/api/quotes');
    expect(res.status).toBe(200);
    expect(res.body.ledger_exists).toBe(true);
    expect(res.body.count).toBe(3); // the retired one is not counted
    expect(res.body.skipped).toHaveLength(1); // the junk line, reported not thrown
    const byId = Object.fromEntries(res.body.quotes.map((q) => [q.id, q]));

    expect(byId['q-ok'].target_path).toBe('Kuramoto.md');
    expect(byId['q-ok'].lens_path).toBe('Spinoza Conatus.md');
    expect(byId['q-ok'].anchor).toMatchObject({ found: true, heading: 'Kuramoto' });
    expect(byId['q-ok'].anchor.excerpt).toContain('coupling constant');
    expect(byId['q-ok'].drift).toBe(null); // no stamp to compare
    expect(byId['q-ok'].target_type).toBe('concept');
    expect(byId['q-ok'].target_stage).toBe('growing');
    expect(byId['q-ok'].target_pillars).toEqual(['tools', 'philosophy']);

    expect(byId['q-moved'].anchor.found).toBe(false);
    expect(byId['q-drift'].anchor.found).toBe(true);
    expect(byId['q-drift'].drift).toBe(true);
    expect(byId['q-gone'].status).toBe('retired');
    expect(byId['q-gone'].retired_why).toBe('test');

    expect(res.body.lenses).toEqual([{ title: 'Spinoza Conatus', path: 'Spinoza Conatus.md', count: 3 }]);
    expect(res.body.pages.map((p) => p.title).sort()).toEqual(['Granular', 'Kuramoto']);
  });

  test('?target= narrows to one page', async () => {
    const res = await request(base).get('/api/quotes?target=' + encodeURIComponent('Granular.md'));
    expect(res.status).toBe(200);
    expect(res.body.quotes.map((q) => q.id).sort()).toEqual(['q-drift', 'q-gone']);
    expect(res.body.count).toBe(1);
  });

  test('only GET answers', async () => {
    const res = await request(base).post('/api/quotes').send({});
    expect(res.status).toBe(404);
  });
});

// Loudon's yes or no: one ledger line, then a commit of the ledger. The commit
// is injected here (opts.commitImpl) so the route's own behaviour is pinned
// without a repo; the last test lets the real commit land in a temp repo.
describe('POST /api/quotes/decide', () => {
  let root, base;
  const commits = [];
  beforeAll(async () => {
    root = makeTempPalace();
    base = await listen(makeServer(root, {
      commitImpl: async (_root, o) => { commits.push(o); return { ok: true, shortHash: 'abc1234', subject: `${o.kind}(${o.scope}): ${o.summary}` }; },
    }));
  });
  afterAll(async () => {
    await closeAll();
    rmSync(root, { recursive: true, force: true });
  });

  test('keep appends a kept line, commits the ledger as loudon, and answers with the quote as it stands', async () => {
    const res = await request(base).post('/api/quotes/decide').send({ id: 'q-ok', decision: 'keep' }).set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.quote.status).toBe('kept');
    expect(res.body.committed).toBe(true);
    expect(res.body.shortHash).toBe('abc1234');
    expect(commits.at(-1)).toMatchObject({ paths: [LEDGER_REL], kind: 'edit', scope: 'Palace Quotes', author: 'loudon', verify: 'verified' });
    expect(commits.at(-1).summary).toMatch(/^kept “Each thing strives\.” on Kuramoto$/);
    const tail = readFileSync(resolve(root, LEDGER_REL), 'utf8').trim().split('\n').at(-1);
    expect(JSON.parse(tail)).toMatchObject({ id: 'q-ok', status: 'kept', decided_by: 'loudon' });
    const after = await request(base).get('/api/quotes');
    expect(after.body.quotes.find((q) => q.id === 'q-ok').status).toBe('kept');
  });

  test('retire lets a quote go with a why, and a later keep revives it', async () => {
    const go = await request(base).post('/api/quotes/decide').send({ id: 'q-drift', decision: 'retire', why: 'lens does not bite' }).set('Content-Type', 'application/json');
    expect(go.status).toBe(200);
    expect(go.body.quote).toMatchObject({ status: 'retired', retired_why: 'lens does not bite' });
    expect(commits.at(-1).summary).toMatch(/^let go “Drifted words\.” on Granular$/);
    let list = await request(base).get('/api/quotes');
    expect(list.body.count).toBe(2);
    const back = await request(base).post('/api/quotes/decide').send({ id: 'q-drift', decision: 'keep' }).set('Content-Type', 'application/json');
    expect(back.body.quote.status).toBe('kept');
    list = await request(base).get('/api/quotes');
    expect(list.body.count).toBe(3);
  });

  test('refuses an unknown id, a bad decision, and malformed JSON', async () => {
    expect((await request(base).post('/api/quotes/decide').send({ id: 'q-nope', decision: 'keep' }).set('Content-Type', 'application/json')).status).toBe(404);
    expect((await request(base).post('/api/quotes/decide').send({ id: 'q-ok', decision: 'maybe' }).set('Content-Type', 'application/json')).status).toBe(400);
    expect((await request(base).post('/api/quotes/decide').set('Content-Type', 'application/json').send('{not json')).status).toBe(400);
  });

  test('a cross-site write is refused before the route sees it', async () => {
    const res = await request(base).post('/api/quotes/decide').send({ id: 'q-ok', decision: 'keep' }).set('Content-Type', 'application/json').set('Sec-Fetch-Site', 'cross-site');
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});

describe('POST /api/quotes/decide with a real repo', () => {
  let root, base;
  const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', env: gitFreeEnv() });
  beforeAll(async () => {
    root = makeTempPalace();
    git(['init', '-q', '-b', 'main']);
    assertScratchRepo(root);
    git(['config', 'user.email', 'test@palace']);
    git(['config', 'user.name', 'test']);
    git(['add', '-A']);
    git(['commit', '-q', '-m', 'seed']);
    base = await listen(makeServer(root));
  });
  afterAll(async () => {
    await closeAll();
    rmSync(root, { recursive: true, force: true });
  });

  test('the decision line lands in a commit scoped to the ledger', async () => {
    const res = await request(base).post('/api/quotes/decide').send({ id: 'q-ok', decision: 'keep' }).set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
    expect(res.body.committed).toBe(true);
    expect(typeof res.body.shortHash).toBe('string');
    const subject = git(['log', '-1', '--format=%s']).trim();
    expect(subject).toBe('edit(Palace Quotes): kept “Each thing strives.” on Kuramoto');
    // quotepath off: git would otherwise print the em-dash path octal-escaped and quoted.
    const files = git(['-c', 'core.quotepath=false', 'show', '--name-only', '--format=', 'HEAD']).trim().split('\n');
    expect(files).toEqual([LEDGER_REL]);
    expect(git(['status', '--porcelain']).trim()).toBe('');
  });
});

describe('GET /api/quotes without a ledger', () => {
  let root, base;
  beforeAll(async () => {
    root = makeTempPalace({ withLedger: false });
    base = await listen(makeServer(root));
  });
  afterAll(async () => {
    await closeAll();
    rmSync(root, { recursive: true, force: true });
  });

  test('is an empty answer, not an error', async () => {
    const res = await request(base).get('/api/quotes');
    expect(res.status).toBe(200);
    expect(res.body.ledger_exists).toBe(false);
    expect(res.body.quotes).toEqual([]);
    expect(res.body.count).toBe(0);
  });
});
