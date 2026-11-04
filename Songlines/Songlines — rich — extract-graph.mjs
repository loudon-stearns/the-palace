#!/usr/bin/env node
/*
  title: Songlines — rich — extract-graph
  born: 2026-11-04
  links: [[Songlines]] (connects-to · rich-face-tool) · feeds [[Songlines — rich — two-walkers.html]]
  forward_vector: I read the palace's own roads — every body [[wikilink]] between tracked entries — and the
    use each entry has had, and hand them to the two-walkers piece as data, naming the commit I read at, so
    the piece's numbers can always be traced to a graph someone can rebuild.

  What it reads (run from the palace root, or pass --root):
    nodes  every tracked .md (git ls-files) whose frontmatter carries a canonical `type:` — the Palace Map's
           node rule (_ops/swarm/entry-use.py _entries), with its excluded folders and its _ops
           rule (build-map-2026-11-03.py: a ceremony card sits in _ops/ or one level into a non-machinery folder). Title = file stem.
    edges  every distinct [[wikilink]] in a node's BODY (frontmatter and ``` fences stripped; ![[embeds]]
           are figures, not roads, and are skipped) whose target resolves, case-insensitively, to another
           node. Target = text before | and #, .md dropped, last path segment. Self-links dropped.
    words  each node's body word count (frontmatter stripped), for the 'not thin' read
    use    each node's 90-day use (page + bundle + linked days) from the newest Map Build,
           _ops/maps/palace-map-full-<date>.json, computed by entry-use.py on the owner's full history.
           A node the map does not list gets use 0 and is flagged.
  Also records the Map Build's own counts (frontmatter typed links only) for comparison, and which entries
  no body road reaches from the doors but the Map Build's frontmatter roads do.
  Doors: the seven pages every agent is born with (CLAUDE.md § Born with).

  Usage:
    node "Songlines/Songlines — rich — extract-graph.mjs"                 # JSON to stdout
    node "Songlines/Songlines — rich — extract-graph.mjs" --inline <html> # rewrite the data block in a piece
*/
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ROOT = path.resolve(opt('--root') || process.cwd());

const CANON = new Set(['concept','hub','project','source','meta','practice','person','question','spore','specialist','maker']);
const EXCLUDE = new Set(['.git','.obsidian','.claude','__pycache__','node_modules','venv','.venv','.venvs','dist','build','.next','.cache','site-packages','_tools','_manim_media','proofs','entries']);
const OPS_EXCLUDE = new Set(['swarm','stigmergy','agents','sample-libraries','loudon-live','maps','scratch','claude-code-prompts','heartbeat','lost-and-found','Harvest Ceremony']);
const DOORS = ['JEWEL','FOUR PILLARS','Palace Philosophies','Cooperation Yields Agency','Modes of Collaboration','Hilaritas Generator','CHILD'];

const git = (...a) => execFileSync('git', ['-C', ROOT, '-c', 'core.quotePath=false', ...a], { encoding: 'utf8', maxBuffer: 1 << 28 });
const commit = git('rev-parse', '--short=8', 'HEAD').trim();
const files = git('ls-files', '-z', '--', '*.md').split('\0').filter(Boolean);

function split(text) {
  if (!text.startsWith('---\n')) return [null, text];
  const end = text.indexOf('\n---', 4);
  if (end < 0) return [null, text];
  const nl = text.indexOf('\n', end + 4);
  return [text.slice(4, end), nl < 0 ? '' : text.slice(nl + 1)];
}

const nodes = new Map(); // title -> {path, body}
for (const rel of files) {
  const parts = rel.split('/');
  if (parts.slice(0, -1).some(p => EXCLUDE.has(p))) continue;
  // the map's _ops rule: a ceremony card sits directly in _ops/ or one level into a non-machinery folder
  if (parts[0] === '_ops' && !(parts.length === 2 || (parts.length === 3 && !OPS_EXCLUDE.has(parts[1])))) continue;
  const abs = path.join(ROOT, rel);
  let st; try { st = fs.lstatSync(abs); } catch { continue; }
  if (st.isSymbolicLink() || !st.isFile()) continue;
  const [fm, body] = split(fs.readFileSync(abs, 'utf8'));
  if (fm == null) continue;
  const m = fm.match(/^type:\s*['"]?([A-Za-z\-]+)/m);
  if (!m || !CANON.has(m[1].toLowerCase())) continue;
  const title = path.basename(rel, '.md');
  if (!nodes.has(title)) nodes.set(title, { path: rel, body });
}

const byLower = new Map([...nodes.keys()].map(t => [t.toLowerCase(), t]));
const titles = [...nodes.keys()].sort((a, b) => a.localeCompare(b));
const index = new Map(titles.map((t, i) => [t, i]));
const out = titles.map(() => new Set());
let rawLinks = 0, unresolved = 0;
for (const t of titles) {
  const body = nodes.get(t).body.replace(/^```[\s\S]*?^```/gm, '');
  for (const m of body.matchAll(/(!?)\[\[([^\]\n]+?)\]\]/g)) {
    if (m[1]) continue;
    rawLinks++;
    let tg = m[2].split('|')[0].split('#')[0].trim();
    if (tg.endsWith('.md')) tg = tg.slice(0, -3);
    tg = tg.split('/').pop().trim();
    const hit = byLower.get(tg.toLowerCase());
    if (!hit) { unresolved++; continue; }
    if (hit !== t) out[index.get(t)].add(index.get(hit));
  }
}

const maps = fs.readdirSync(path.join(ROOT, '_ops/maps')).filter(f => /^palace-map-full-.*\.json$/.test(f)).sort();
const mapFile = maps[maps.length - 1];
const map = JSON.parse(fs.readFileSync(path.join(ROOT, '_ops/maps', mapFile), 'utf8'));
const mapUse = new Map(map.nodes.map(n => [n.id, n.use]));
const use = titles.map(t => mapUse.get(t)?.recent?.use ?? 0);
const notInMap = titles.filter(t => !mapUse.has(t));
const words = titles.map(t => nodes.get(t).body.split(/\s+/).filter(Boolean).length);

// which entries no body road reaches from the doors, and which of those the map's frontmatter roads do reach
const doorIdx = DOORS.filter(d => index.has(d)).map(d => index.get(d));
const reach = new Set(doorIdx), q = [...doorIdx];
while (q.length) { const v = q.shift(); for (const t of out[v]) if (!reach.has(t)) { reach.add(t); q.push(t); } }
const madj = {}; for (const e of map.edges) (madj[e.source] ||= []).push(e.target);
const mreach = new Set(doorIdx.map(i => titles[i])), mq = [...mreach];
while (mq.length) { const v = mq.shift(); for (const t of madj[v] || []) if (!mreach.has(t)) { mreach.add(t); mq.push(t); } }
const disconnected = titles.filter((t, i) => !reach.has(i));
const onMapRoads = disconnected.filter(t => mreach.has(t));

const data = {
  read_at: commit,
  read_on: new Date().toISOString().slice(0, 10),
  rule: 'nodes: tracked .md with canonical type (map node rule); edges: distinct body [[wikilinks]] between nodes, embeds and fences skipped',
  counts: { nodes: titles.length, edges: out.reduce((s, x) => s + x.size, 0), body_links_seen: rawLinks, unresolved_targets: unresolved },
  use_source: { file: `_ops/maps/${mapFile}`, generated: map.meta.generated, head: map.meta.use?.head, window_days: map.meta.use?.window_days, not_in_map: notInMap },
  map_build: { nodes: map.nodes.length, edges: map.edges.length, rule: 'frontmatter typed links only',
               body_disconnected_on_map_roads: onMapRoads },
  doors: doorIdx,
  titles,
  use,
  words,
  out: out.map(s => [...s].sort((a, b) => a - b)),
};

const html = opt('--inline');
if (html) {
  const src = fs.readFileSync(html, 'utf8');
  const re = /\/\*GRAPH-BEGIN\*\/[\s\S]*?\/\*GRAPH-END\*\//;
  if (!re.test(src)) { console.error('no /*GRAPH-BEGIN*/…/*GRAPH-END*/ block in ' + html); process.exit(1); }
  fs.writeFileSync(html, src.replace(re, () => '/*GRAPH-BEGIN*/' + JSON.stringify(data) + '/*GRAPH-END*/'));
  console.error(`inlined graph @ ${commit}: ${data.counts.nodes} nodes, ${data.counts.edges} edges → ${html}`);
} else {
  process.stdout.write(JSON.stringify(data, null, 1) + '\n');
}
