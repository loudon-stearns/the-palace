#!/usr/bin/env node
// extract.mjs — born 2026-11-15, for [[D3.js]]'s proof "the Shop as a relaxed graph".
// Reads the frontmatter of every page directly in Shop/ (the Specialists, the Maker, the
// Shopkeeper) and writes shop-graph.json beside this file: one node per page and per link
// target, one edge per typed frontmatter link. Read-only on the palace.
// Run from anywhere:  node Shop/D3.js/proofs/2026-11-15-shop-graph/extract.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PALACE = path.resolve(HERE, '../../../..');
const require = createRequire(path.join(PALACE, '_ops/stigmergy/orchestrator/package.json'));
const YAML = require('yaml');

const shop = path.join(PALACE, 'Shop');
const pages = fs.readdirSync(shop).filter((f) => f.endsWith('.md')).sort();
const nodes = new Map();
const links = [];
// "[[Shop/Manim CE|Manim CE]]" and "[[Manim CE#Gotchas]]" both name the page "Manim CE".
const strip = (t) => String(t).replace(/^\[\[|\]\]$/g, '').split('|')[0].split('#')[0].trim().split('/').pop();

for (const f of pages) {
  const src = fs.readFileSync(path.join(shop, f), 'utf8');
  const m = /^---\n([\s\S]*?)\n---/.exec(src);
  if (!m) continue;
  const fm = YAML.parse(m[1]);
  const id = f.replace(/\.md$/, '');
  nodes.set(id, { id, kind: fm.type === 'specialist' ? 'specialist' : 'shop', status: fm.status ?? null, medium: fm.medium ?? null });
  for (const l of fm.links ?? []) {
    if (!l || !l.target) continue;
    const t = strip(l.target);
    if (!t || t === id) continue;
    if (!nodes.has(t)) nodes.set(t, { id: t, kind: 'outside' });
    links.push({ source: id, target: t, type: l.type ?? 'connects-to', label: l.label ?? null });
  }
}
// A link target that is itself a Shop page was first met as "outside"; fix its kind.
for (const f of pages) {
  const id = f.replace(/\.md$/, '');
  if (nodes.get(id)?.kind === 'outside') nodes.get(id).kind = 'shop';
}

const out = {
  about: 'The Shop pages and their typed frontmatter links, read by extract.mjs on the date below. A node is a page; an edge is one link in a page\'s frontmatter, typed as the page typed it.',
  extracted: new Date().toISOString().slice(0, 10),
  from: 'Shop/*.md frontmatter `links:`',
  counts: { pages: pages.length, nodes: nodes.size, links: links.length },
  nodes: [...nodes.values()],
  links,
};
fs.writeFileSync(path.join(HERE, 'shop-graph.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`shop-graph.json: ${pages.length} pages, ${nodes.size} nodes, ${links.length} links`);
const types = {}; for (const l of links) types[l.type] = (types[l.type] ?? 0) + 1;
console.log(types);
