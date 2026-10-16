import { describe, test, expect, afterEach } from 'vitest';
import http from 'node:http';
import { resolve, join } from 'node:path';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import request from 'supertest';
import { listen, closeAll } from '../helpers/loopback.js';
import { blackboardMiddleware } from '../../server/middleware.js';
import { createStewardLane } from '../../server/steward-lane.js';
import { buildCeremonyRows, buildServiceRows, buildLedgerPageRows, ceremonyStates, writeOrders, readScroll } from '../../server/projects.js';
import { MARK, CEREMONY_STANDING_PLACEHOLDER, readStandingOrders } from '../../../orchestrator/src/scroll-file.js';

function makeServer(palaceRoot) {
  const stewardLane = createStewardLane({
    palaceRoot,
    stateDir: join(palaceRoot, '_ops/stigmergy/.actuator-steward'),
    buildArgv: () => ['node', '-e', '0', '--permission-mode', 'bypassPermissions'],
    dryReap: true,
  });
  const plugin = blackboardMiddleware(palaceRoot, { stewardLane });
  const handlers = [];
  plugin.configureServer({ middlewares: { use: (fn) => handlers.push(fn) } });
  return http.createServer((req, res) => {
    let i = 0;
    const next = () => { if (i >= handlers.length) { res.statusCode = 404; res.end('nf'); return; } handlers[i++](req, res, next); };
    next();
  });
}

// A temp palace in a git repo: one project, one ceremony (Return, v1.0, one
// run line since — a ceremony because it carries `trigger:`), one stewarded
// page that is not a project (a service), and two pages that keep a tuning
// ledger and are NOT ceremonies (SCHEMA v1.28): a project, and the Hero and
// Avatar Maker, which is neither project nor service.
const LEDGER_REL = '_ops/Return Ceremony/Return Ceremony — tuning.md';
const MAKER_LEDGER_REL = 'Shop/Hero and Avatar Maker/Hero and Avatar Maker — tuning.md';
function makePalace({ withGit = true } = {}) {
  const root = mkdtempSync(resolve(tmpdir(), 'stigmergy-ceremonies-test-'));
  const git = (...args) => execFileSync('git', args, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] });
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  mkdirSync(resolve(root, '_ops/Return Ceremony'), { recursive: true });
  mkdirSync(resolve(root, '_ops/agents/permanent/shopkeeper'), { recursive: true });
  mkdirSync(resolve(root, 'Projects'), { recursive: true });
  mkdirSync(resolve(root, 'Shop'), { recursive: true });
  writeFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), '');
  writeFileSync(resolve(root, 'Projects/Murmuration.md'), '---\ntitle: "Murmuration"\ntype: project\nstatus: active\nstage: growing\n---\n# m\n');
  writeFileSync(resolve(root, 'Shop/Shopkeeper.md'), '---\ntitle: "Shopkeeper"\ntype: maker\nstatus: alive\n---\n# the shopkeeper\n');
  writeFileSync(resolve(root, '_ops/agents/permanent/REGISTRY.json'), JSON.stringify({ schema_version: '1.0', agents: [
    { agent_id: 'Shopkeeper', home: 'Shopkeeper', dir: '_ops/agents/permanent/shopkeeper', registered_at: '2026-09-25T00:00:00.000Z' },
  ] }));
  writeFileSync(resolve(root, '_ops/agents/permanent/shopkeeper/state.json'), JSON.stringify({ iteration: 1, last_active: '2026-09-25T10:00:00Z' }));
  writeFileSync(resolve(root, '_ops/Return Ceremony.md'), '---\ntitle: "Return Ceremony"\ntype: practice\nstage: growing\ntrigger: ["I\'m back", "return"]\nversion: "1.0"\n---\n# Return Ceremony\n');
  // A ceremony with no ledger yet still lists.
  writeFileSync(resolve(root, 'Sentry.md'), '---\ntitle: "Sentry"\ntype: practice\ntrigger: ["sentry sweep"]\nversion: "1.0"\n---\n# Sentry\n');
  // A project that keeps a ledger stays a project.
  mkdirSync(resolve(root, 'Projects/Murmuration'), { recursive: true });
  writeFileSync(resolve(root, 'Projects/Murmuration/Murmuration — tuning.md'), '# Murmuration — tuning\n\n- run · 2026-09-24 · a flock · nothing new\n');
  // A page that is none of the deck's other kinds, keeping a ledger.
  mkdirSync(resolve(root, 'Shop/Hero and Avatar Maker'), { recursive: true });
  writeFileSync(resolve(root, 'Shop/Hero and Avatar Maker.md'), '---\ntitle: "Hero and Avatar Maker"\ntype: maker\nstatus: alive\n---\n# Maker\n');
  writeFileSync(resolve(root, MAKER_LEDGER_REL), '# Hero and Avatar Maker — tuning\n\n- run · 2026-10-15 · Kuramoto Coupling, hero + avatar · nothing new\n');
  writeFileSync(resolve(root, '_ops/Return Ceremony/Return Ceremony — tuning.md'), '# Return Ceremony — tuning\n\n## From the first return — 2026-09-25\n\n7. **A probe.** Spec change owed: the probe joins the block.\n');
  if (withGit) {
    git('init', '-q'); git('config', 'user.email', 't@t'); git('config', 'user.name', 't');
    git('add', '-A'); git('commit', '-q', '-m', 'edit(Return Ceremony): v1.0 — version, tuning ledger');
    writeFileSync(resolve(root, LEDGER_REL), readFileSync(resolve(root, LEDGER_REL), 'utf8') + '- run · 2026-09-25 · v1.0 · ten hours · taught item 7\n');
    git('add', '-A'); git('commit', '-q', '-m', 'return(2026-09-25): ten hours');
  }
  return root;
}

let root;
afterEach(async () => { await closeAll(); if (root) rmSync(root, { recursive: true, force: true }); root = null; });

describe('the deck lists ceremonies by trigger:, and every other page as itself', () => {
  test('GET /api/projects carries all four groups', async () => {
    root = makePalace();
    const res = await request(await listen(makeServer(root))).get('/api/projects');
    expect(res.status).toBe(200);
    expect(res.body.projects.map((r) => r.home)).toEqual(['Murmuration']);
    expect(res.body.services.map((r) => r.home)).toEqual(['Shopkeeper']);
    expect(res.body.services[0]).toMatchObject({ kind: 'service', type: 'maker', stewarded: true });
    // CEREMONIES is every page carrying trigger: — not every page with a ledger.
    expect(res.body.ceremonies.map((r) => r.home).sort()).toEqual(['Return Ceremony', 'Sentry']);
    const c = res.body.ceremonies.find((r) => r.home === 'Return Ceremony');
    expect(c).toMatchObject({ kind: 'ceremony', home: 'Return Ceremony', version: '1.0', runs_since: 1, owed: ['7'], orders_owed: 0 });
    expect(c.last_run).toEqual({ ts: '2026-09-25', subject: 'ten hours · taught item 7', version: '1.0' });
    expect(res.body.ceremonies.find((r) => r.home === 'Sentry')).toMatchObject({ kind: 'ceremony', version: '1.0', tuning: null, runs_since: 0, last_run: null, owed: [] });
    // A ledgered project is a project, listed once; the Maker shows under PAGES.
    expect(res.body.pages).toHaveLength(1);
    expect(res.body.pages[0]).toMatchObject({ kind: 'page', home: 'Hero and Avatar Maker', version: null, tuning: MAKER_LEDGER_REL, runs_since: 1, runs_total: 1 });
    expect(res.body.pages[0].last_run).toEqual({ ts: '2026-10-15', subject: 'Kuramoto Coupling, hero + avatar · nothing new', version: null });
  });

  test('ceremony state is cached until HEAD moves', () => {
    root = makePalace();
    const pick = () => ceremonyStates({ palaceRoot: root }).find((s) => s.home === 'Return Ceremony');
    const a = pick();
    expect(pick()).toBe(a);   // same object: served from cache
    writeFileSync(resolve(root, LEDGER_REL), readFileSync(resolve(root, LEDGER_REL), 'utf8') + '- run · 2026-09-26 · v1.0 · again · nothing new\n');
    execFileSync('git', ['commit', '-q', '-am', 'return(2026-09-26): again'], { cwd: root, stdio: 'ignore' });
    const b = pick();
    expect(b).not.toBe(a);
    expect(b.runs_since).toHaveLength(2);
  });

  test('without git the ceremony still lists, and its run lines still count', () => {
    root = makePalace({ withGit: false });
    writeFileSync(resolve(root, LEDGER_REL), readFileSync(resolve(root, LEDGER_REL), 'utf8') + '- run · 2026-09-25 · v1.0 · ten hours · nothing new\n');
    const c = buildCeremonyRows({ palaceRoot: root }).find((r) => r.home === 'Return Ceremony');
    expect(c).toMatchObject({ home: 'Return Ceremony', version: '1.0', runs_since: 1, owed: ['7'] });
    expect(c.spec_changed.hash).toBe(null);
    expect(buildServiceRows({ palaceRoot: root }).map((r) => r.home)).toEqual(['Shopkeeper']);
  });
});

describe('a ceremony scroll through the projects endpoints', () => {
  test('GET /api/projects/scroll renders a ceremony scroll live without writing it — with a Plan zone', async () => {
    root = makePalace();
    const res = await request(await listen(makeServer(root))).get('/api/projects/scroll').query({ home: 'Return Ceremony' });
    expect(res.status).toBe(200);
    expect(res.body.kind).toBe('ceremony');
    expect(res.body.exists).toBe(false);
    expect(res.body.zones.now).toMatch(/\*\*Version:\*\* v1\.0/);
    expect(res.body.zones.making).toContain('### 2026-09-25 — ten hours');
    expect(res.body.zones.making).not.toContain('return(2026-09-25)');   // a commit subject is not a run
    expect(res.body.text).toContain(MARK.planStart);
    expect(res.body.zones.plan).toBe('');
    expect(res.body.tuning).toBe(LEDGER_REL);
    expect(existsSync(resolve(root, '_ops/Return Ceremony/Return Ceremony — scroll.md'))).toBe(false);
  });

  test('a standing order goes on the ceremony\'s scroll, and holds there', async () => {
    root = makePalace();
    const before = readFileSync(resolve(root, LEDGER_REL), 'utf8');
    const res = await request(await listen(makeServer(root))).put('/api/projects/orders').send({ home: 'Return Ceremony', orders: 'Never skip the Cowork probe.' });
    expect(res.status).toBe(200);
    expect(res.body.order_kind).toBe('standing');
    expect(res.body.zones.orders).toBe('Never skip the Cowork probe.');
    expect(readFileSync(resolve(root, LEDGER_REL), 'utf8')).toBe(before);   // the ledger is not the destination
    const scroll = readFileSync(resolve(root, '_ops/Return Ceremony/Return Ceremony — scroll.md'), 'utf8');
    expect(readStandingOrders(scroll)).toBe('Never skip the Cowork probe.');
    // Clearing it puts the ceremony's placeholder back.
    writeOrders({ palaceRoot: root, home: 'Return Ceremony', orders: '' });
    expect(readFileSync(resolve(root, '_ops/Return Ceremony/Return Ceremony — scroll.md'), 'utf8')).toContain(`${MARK.ordersStart}\n${CEREMONY_STANDING_PLACEHOLDER}\n${MARK.ordersEnd}`);
  });

  test('a one-shot order goes into the tuning ledger as owed, and Now shows it', async () => {
    root = makePalace();
    const res = await request(await listen(makeServer(root))).put('/api/projects/orders').send({ home: 'Return Ceremony', orders: 'Ask before adding\na probe.', kind: 'once' });
    expect(res.status).toBe(200);
    expect(res.body.order_kind).toBe('once');
    expect(res.body.tuning).toBe(LEDGER_REL);
    const ledger = readFileSync(resolve(root, LEDGER_REL), 'utf8');
    expect(ledger.endsWith('- run · 2026-09-25 · v1.0 · ten hours · taught item 7\n- from Loudon · ' + res.body.ledger_orders[0].date + ' · Ask before adding a probe. · owed\n')).toBe(true);
    expect(res.body.ledger_orders).toEqual([{ date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), text: 'Ask before adding a probe.', status: 'owed', owed: true }]);
    expect(res.body.zones.now).toContain('1 order from Loudon');
    expect(res.body.zones.now).toContain('Ask before adding a probe.');
    expect(existsSync(resolve(root, '_ops/Return Ceremony/Return Ceremony — scroll.md'))).toBe(false);   // a once order never writes the scroll
    const row = buildCeremonyRows({ palaceRoot: root }).find((r) => r.home === 'Return Ceremony');
    expect(row.owed).toEqual(['7', `Loudon ${res.body.ledger_orders[0].date}`]);
    expect(row.orders_owed).toBe(1);
  });

  test('a once order uses the date it is given; an empty one adds nothing; a page with no ledger refuses one', async () => {
    root = makePalace();
    const before = readFileSync(resolve(root, LEDGER_REL), 'utf8');
    expect(writeOrders({ palaceRoot: root, home: 'Return Ceremony', orders: '   ', kind: 'once' })).toEqual({ error: 'empty-order' });
    expect(readFileSync(resolve(root, LEDGER_REL), 'utf8')).toBe(before);
    const r = writeOrders({ palaceRoot: root, home: 'Return Ceremony', orders: 'Keep the block to one command.', kind: 'once', today: '2026-10-01' });
    expect(r.ledger_orders).toEqual([{ date: '2026-10-01', text: 'Keep the block to one command.', status: 'owed', owed: true }]);
    expect(writeOrders({ palaceRoot: root, home: 'Sentry', orders: 'x', kind: 'once' })).toEqual({ error: 'no-tuning-ledger' });
    const res = await request(await listen(makeServer(root))).put('/api/projects/orders').send({ home: 'Return Ceremony', orders: 'x', kind: 'sometimes' });
    expect(res.status).toBe(400);
  });

  test('PUT /api/projects/plan writes a ceremony\'s Plan, logged on its trail', async () => {
    root = makePalace();
    const res = await request(await listen(makeServer(root))).put('/api/projects/plan').send({ home: 'Return Ceremony', plan: 'Fold the Cowork probe into the block.', why: 'item 7 keeps recurring' });
    expect(res.status).toBe(200);
    expect(res.body.zones.plan).toBe('Fold the Cowork probe into the block.');
    expect(res.body.zones.making).toMatch(/Plan agreed/);
    expect(res.body.zones.now).toMatch(/\*\*Plan:\*\* agreed/);
  });

  test('scroll.js --ceremonies writes every trigger: page\'s scroll, with the standing-orders placeholder', () => {
    root = makePalace();
    execFileSync('node', [resolve(__dirname, '../../../orchestrator/src/scroll.js'), '--ceremonies', '--root', root], { stdio: 'ignore' });
    const text = readFileSync(resolve(root, '_ops/Return Ceremony/Return Ceremony — scroll.md'), 'utf8');
    expect(text).toContain(`${MARK.ordersStart}\n${CEREMONY_STANDING_PLACEHOLDER}\n${MARK.ordersEnd}`);
    expect(text).toContain(MARK.planStart);
    expect(existsSync(resolve(root, 'Sentry/Sentry — scroll.md'))).toBe(true);           // a ceremony with no ledger yet
    expect(existsSync(resolve(root, 'Projects/Murmuration/Murmuration — scroll.md'))).toBe(false);   // a ledger is not a trigger
  });

  test('an unknown home is a 404', async () => {
    root = makePalace();
    const res = await request(await listen(makeServer(root))).get('/api/projects/scroll').query({ home: 'Nope' });
    expect(res.status).toBe(404);
  });
});

describe('a page that keeps a ledger and is no ceremony shows as itself', () => {
  test('a ledgered project opens as a project: its board, its runs, its Plan', () => {
    root = makePalace();
    const r = readScroll({ palaceRoot: root, home: 'Murmuration' });
    expect(r.kind).toBe('project');
    expect(r.zones.now).toContain('**Waiting on you:**');
    expect(r.zones.now).toContain('- **Runs:** 1 run on 1 day');
    expect(r.text).toContain(MARK.planStart);
    expect(buildCeremonyRows({ palaceRoot: root }).map((x) => x.home)).not.toContain('Murmuration');
  });

  test('the Hero and Avatar Maker opens as a page, takes a Plan, and takes both kinds of order', async () => {
    root = makePalace();
    const app = await listen(makeServer(root));
    const scroll = await request(app).get('/api/projects/scroll').query({ home: 'Hero and Avatar Maker' });
    expect(scroll.body.kind).toBe('page');
    expect(scroll.body.zones.now).toContain('- **Last run:** 2026-10-15 — Kuramoto Coupling, hero + avatar · nothing new');
    expect(scroll.body.zones.now).not.toContain('Version: none on the card');
    const plan = await request(app).put('/api/projects/plan').send({ home: 'Hero and Avatar Maker', plan: 'Give every canon entry its face.', why: 'first plan' });
    expect(plan.status).toBe(200);
    expect(plan.body.zones.plan).toBe('Give every canon entry its face.');
    const once = await request(app).put('/api/projects/orders').send({ home: 'Hero and Avatar Maker', orders: 'Redo the Spinoza hero once.', kind: 'once' });
    expect(once.status).toBe(200);
    expect(readFileSync(resolve(root, MAKER_LEDGER_REL), 'utf8')).toMatch(/- from Loudon · \d{4}-\d{2}-\d{2} · Redo the Spinoza hero once\. · owed\n$/);
    const standing = await request(app).put('/api/projects/orders').send({ home: 'Hero and Avatar Maker', orders: 'Hand-drawn, never glossy.' });
    expect(standing.body.zones.orders).toBe('Hand-drawn, never glossy.');
    expect(buildLedgerPageRows({ palaceRoot: root })[0]).toMatchObject({ home: 'Hero and Avatar Maker', orders_owed: 1 });
  });
});
