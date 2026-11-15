#!/usr/bin/env node
// check.mjs — born 2026-11-15, for [[D3.js]]'s proof "the Shop as a relaxed graph".
// Headless Chromium (playwright) loads shop-graph.html over a throwaway local server (port 0, the
// palace root, read-only) and measures what a script can: that the piece is still before a click,
// that d3-force relaxes the graph (edge crossings, node overlaps, nodes in frame), that the
// timer-driven Relax and a synchronous settle() land on the same layout, and that the keyboard
// and screen-reader paths work. Writes measured.json and three PNGs beside this file.
// Exits 1 if any rule fails. Run from anywhere:
//   node Shop/D3.js/proofs/2026-11-15-shop-graph/check.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PALACE = path.resolve(HERE, '../../../..');
const { chromium } = await import(pathToFileURL(path.join(PALACE, '_ops/stigmergy/app/node_modules/playwright/index.mjs')).href);

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(PALACE, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(PALACE) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] ?? 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;
const url = base + path.relative(PALACE, path.join(HERE, 'shop-graph.html')).split(path.sep).map(encodeURIComponent).join('/');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1130, height: 1100 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(url);
await page.waitForFunction(() => typeof graph !== 'undefined' && graph && graph.nodes.length > 0);

// Layout quality, computed in the page from the live node positions.
const layout = () => page.evaluate(() => {
  const N = graph.nodes, L = graph.links;
  const rad = (d) => d.kind === 'outside' ? 3 + Math.min(d.degree, 8) * 0.6 : 5 + Math.min(d.degree, 40) * 0.25;
  const cross = (a, b, c, d) => {
    const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
    return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
  };
  let crossings = 0;
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
    const a = L[i], b = L[j];
    if (a.source === b.source || a.source === b.target || a.target === b.source || a.target === b.target) continue;
    if (cross(a.source, a.target, b.source, b.target)) crossings++;
  }
  let overlaps = 0;
  for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++)
    if (Math.hypot(N[i].x - N[j].x, N[i].y - N[j].y) < rad(N[i]) + rad(N[j])) overlaps++;
  const outOfFrame = N.filter((d) => d.x < 0 || d.x > 960 || d.y < 0 || d.y > 700).length;
  const lens = L.map((l) => Math.hypot(l.source.x - l.target.x, l.source.y - l.target.y));
  const mean = lens.reduce((s, v) => s + v, 0) / lens.length;
  const cv = Math.sqrt(lens.reduce((s, v) => s + (v - mean) ** 2, 0) / lens.length) / mean;
  const pos = N.map((d) => [d.id, +d.x.toFixed(6), +d.y.toFixed(6)]);
  return { crossings, overlaps, outOfFrame, meanEdge: +mean.toFixed(1), edgeLengthCV: +cv.toFixed(3), pos };
});
const posKey = (p) => JSON.stringify(p);
const maxDelta = (a, b) => Math.max(...a.map((r, i) => Math.max(Math.abs(r[1] - b[i][1]), Math.abs(r[2] - b[i][2]))));

const m = { checked: new Date().toISOString(), url_path: path.relative(PALACE, path.join(HERE, 'shop-graph.html')), viewport: '1130x1100', d3_version: await page.evaluate(() => d3.version), rules: {} };
const counts = await page.evaluate(() => ({ nodes: graph.nodes.length, links: graph.links.length,
  drawnNodes: document.querySelectorAll('#graph g.node').length, drawnLinks: document.querySelectorAll('#graph line').length }));
m.graph = counts;
const data = JSON.parse(fs.readFileSync(path.join(HERE, 'shop-graph.json'), 'utf8'));
m.rules.every_node_and_link_drawn = counts.drawnNodes === data.nodes.length && counts.drawnLinks === data.links.length;

// 1. Still before a click.
const before = await layout();
await page.waitForTimeout(800);
const before2 = await layout();
m.rules.still_before_click = posKey(before.pos) === posKey(before2.pos);
await page.screenshot({ path: path.join(HERE, 'before.png'), fullPage: true });

// 2. Relax through the button: the simulation's own timer, timed.
const t0 = Date.now();
await page.click('#relax');
await page.waitForFunction(() => /^settled/.test(document.getElementById('status').textContent), null, { timeout: 20000 });
const relaxMs = Date.now() - t0;
const relaxTicks = await page.evaluate(() => sim.ticks);
const after = await layout();
await page.screenshot({ path: path.join(HERE, 'settled.png'), fullPage: true });

// 3. Same layout from a synchronous settle() after a reset: d3-force is deterministic.
await page.click('#reset');
const reset = await layout();
const syncT0 = await page.evaluate(() => performance.now());
await page.evaluate((n) => settle(n), relaxTicks);
const syncMs = await page.evaluate((t) => performance.now() - t, syncT0);
const sync = await layout();
m.relax = { button_ms_wall: relaxMs, ticks: relaxTicks, sync_settle_ms: +syncMs.toFixed(1) };
m.layout = {
  before: { crossings: before.crossings, overlaps: before.overlaps, outOfFrame: before.outOfFrame, meanEdge: before.meanEdge, edgeLengthCV: before.edgeLengthCV },
  after: { crossings: after.crossings, overlaps: after.overlaps, outOfFrame: after.outOfFrame, meanEdge: after.meanEdge, edgeLengthCV: after.edgeLengthCV },
};
m.rules.reset_returns_to_start = maxDelta(before.pos, reset.pos) < 1e-9;
m.determinism = { max_position_delta_timer_vs_sync: maxDelta(after.pos, sync.pos) };
m.rules.timer_and_sync_same_layout = m.determinism.max_position_delta_timer_vs_sync < 1e-6;
m.rules.crossings_at_least_halved = after.crossings <= before.crossings / 2;
m.rules.no_node_overlaps_after = after.overlaps === 0;
m.rules.all_nodes_in_frame_after = after.outOfFrame === 0;

// 4. Keyboard and screen-reader paths.
const active = () => page.evaluate(() => {
  const a = document.activeElement;
  return { label: a?.getAttribute('aria-label') ?? null, role: a?.getAttribute('role') ?? null, pressed: a?.getAttribute('aria-pressed') ?? null };
});
const kb = {};
await page.focus('#reset');
await page.keyboard.press('Tab');
kb.tab_lands_on = (await active()).label;
const walk = [kb.tab_lands_on];
for (const k of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'ArrowRight']) {
  await page.keyboard.press(k);
  walk.push((await active()).label);
}
kb.arrow_walk = walk;
await page.keyboard.press('Enter');
kb.enter_pressed = (await active()).pressed;
kb.announced_after_enter = await page.evaluate(() => document.getElementById('announce').textContent);
const hub = (await active()).label.split(',')[0];
await page.keyboard.press(']');
kb.bracket_lands_on = (await active()).label;
kb.bracket_is_neighbour = await page.evaluate((h) => {
  const id = document.activeElement.__data__.id;
  return graph.links.some((l) => (l.source.id === h && l.target.id === id) || (l.target.id === h && l.source.id === id));
}, hub);
await page.screenshot({ path: path.join(HERE, 'selected.png'), fullPage: true });
await page.keyboard.press('Escape');
kb.pressed_after_escape = await page.evaluate(() => document.querySelectorAll('#graph [aria-pressed="true"]').length);
await page.keyboard.press('m');
kb.letter_m_lands_on = (await active()).label;
await page.keyboard.press('Tab');
kb.tab_leaves_graph = await page.evaluate(() => !document.activeElement.closest('#graph'));
const a11y = await page.evaluate(() => {
  const g = [...document.querySelectorAll('#graph g.node')];
  return { nodes: g.length, with_role_button: g.filter((n) => n.getAttribute('role') === 'button').length,
    with_label: g.filter((n) => (n.getAttribute('aria-label') ?? '').length > 0).length,
    tab_stops: g.filter((n) => n.getAttribute('tabindex') === '0').length,
    list_items: document.querySelectorAll('#list li').length,
    text_has_anchor_and_baseline: [...document.querySelectorAll('#graph text')].every((t) => t.getAttribute('text-anchor') && t.getAttribute('dominant-baseline')) };
});
kb.aria_snapshot_head = (await page.locator('#graph').ariaSnapshot()).split('\n').slice(0, 6);
m.keyboard = kb;
m.a11y = a11y;
m.rules.tab_enters_at_one_node = kb.tab_lands_on?.startsWith('D3.js,') ?? false;
m.rules.arrows_move_focus = new Set(walk).size >= 4 && walk.every((l) => l);
m.rules.enter_selects_and_announces = kb.enter_pressed === 'true' && /\d+ links?\./.test(kb.announced_after_enter);
m.rules.bracket_walks_to_a_neighbour = kb.bracket_is_neighbour;
m.rules.escape_lets_go = kb.pressed_after_escape === 0;
m.rules.letter_jumps = /^m/i.test(kb.letter_m_lands_on ?? '');
m.rules.tab_leaves_graph = kb.tab_leaves_graph;
m.rules.every_node_labelled_one_tab_stop = a11y.with_label === a11y.nodes && a11y.with_role_button === a11y.nodes && a11y.tab_stops === 1;
m.rules.svg_text_anchor_and_baseline_set = a11y.text_has_anchor_and_baseline;
m.console_errors = errors;
m.rules.clean_console = errors.length === 0;

// 5. Framed the way a scroll frames it: the piece origin, the plan's sandbox, from another origin.
// conform's browser pass frames the piece sandboxed with no origin, where the fetch of a declared file
// is blocked; this shows whether shop-graph.json reaches the piece where Loudon will look at it.
const { createPieceOrigin } = await import(pathToFileURL(path.join(PALACE, '_ops/rich-face/piece-origin.mjs')).href);
const REL = path.relative(PALACE, path.join(HERE, 'shop-graph.html')).split(path.sep).join('/');
const origin = createPieceOrigin({ root: PALACE, port: 0 });
const st = await origin.start();
if (st.ok) {
  const plan = origin.describe(REL);
  const host = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!doctype html><body style="margin:0"><iframe id="f" src="${plan.url}" sandbox="allow-scripts${plan.sameOrigin ? ' allow-same-origin' : ''}" allow="${plan.allow || ''}" style="width:1130px;height:1200px;border:0"></iframe></body>`);
  });
  await new Promise((ok) => host.listen(0, 'localhost', ok));
  const hp = await browser.newPage({ viewport: { width: 1130, height: 1200 } });
  await hp.goto(`http://localhost:${host.address().port}/`);
  const frame = await (await hp.waitForSelector('#f')).contentFrame();
  const framed = await frame.waitForFunction(() => document.querySelectorAll('#graph g.node').length, null, { timeout: 8000 })
    .then((h) => h.jsonValue()).catch(() => 0);
  m.framed = { sameOrigin: plan.sameOrigin, nodes_drawn: framed, status: await frame.textContent('#status').catch(() => null) };
  m.rules.declared_file_reaches_framed_piece = framed === data.nodes.length;
  host.close();
  await origin.close();
} else {
  m.framed = { error: st.error };
  m.rules.declared_file_reaches_framed_piece = false;
}

await browser.close();
server.close();
fs.writeFileSync(path.join(HERE, 'measured.json'), JSON.stringify(m, null, 1) + '\n');
const failed = Object.entries(m.rules).filter(([, v]) => !v).map(([k]) => k);
console.log(JSON.stringify({ graph: m.graph, layout: m.layout, relax: m.relax, determinism: m.determinism, keyboard: { tab: kb.tab_lands_on, walk, enter: kb.announced_after_enter.slice(0, 160), bracket: kb.bracket_lands_on, m: kb.letter_m_lands_on } }, null, 1));
console.log(failed.length ? `FAIL: ${failed.join(', ')}` : `ok: ${Object.keys(m.rules).length} rules hold`);
process.exit(failed.length ? 1 : 0);
