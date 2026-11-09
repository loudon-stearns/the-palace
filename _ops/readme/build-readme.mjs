#!/usr/bin/env node
// build-readme.mjs — writes the repo's root README.md from [[README - The Palace Guide]].
//
// The Guide is the palace's door; GitHub shows README.md at the root. This keeps
// one source: it reads `README - The Palace Guide.md`, drops the YAML frontmatter
// and any leading HTML comment, turns `[[Title]]` / `[[Title|alias]]` into a
// relative Markdown link to the tracked file of that name, and `![[img]]` into an
// image link to its real path, then writes README.md. README.md is generated:
// never edit it by hand. No dependencies.
//
//   node _ops/readme/build-readme.mjs           write README.md
//   node _ops/readme/build-readme.mjs --check   exit 1 with one line if README.md differs
//
// The palace root is PALACE_ROOT if set, else two folders above this script.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve, join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.PALACE_ROOT
  ? resolve(process.env.PALACE_ROOT)
  : resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE = 'README - The Palace Guide.md';
const TARGET = 'README.md';
const check = process.argv.includes('--check');

function fail(msg) { console.error(`build-readme: ${msg}`); process.exit(1); }

// Every tracked path, keyed the way a wikilink resolves: by file name, with or
// without its extension (.md names are found without it). Shortest path wins,
// as in Obsidian, when two files share a name.
function trackedIndex() {
  const out = execFileSync('git', ['-C', ROOT, 'ls-files', '-z'], { maxBuffer: 1 << 28 });
  const index = new Map();
  for (const p of out.toString('utf8').split('\0').filter(Boolean)) {
    const name = basename(p);
    const keys = [name];
    if (extname(name) === '.md') keys.push(name.slice(0, -3));
    for (const k of keys) {
      const prev = index.get(k);
      if (!prev || p.length < prev.length) index.set(k, p);
    }
  }
  return index;
}

const encode = (p) => p.split('/').map(encodeURIComponent).join('/');

export function render(src, index) {
  let body = src;
  if (body.startsWith('---\n')) {
    const end = body.indexOf('\n---\n', 4);
    if (end === -1) fail(`${SOURCE}: frontmatter is not closed`);
    body = body.slice(end + 5);
  }
  body = body.replace(/^\s*<!--[\s\S]*?-->\s*/, '');
  const missing = [];
  const resolveName = (name) => {
    const p = index.get(name.trim());
    if (!p) missing.push(name.trim());
    return p;
  };
  // ![[img]] or ![[img|size]] first, so the plain-link pass does not see it.
  body = body.replace(/!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g, (m, name) => {
    const p = resolveName(name);
    return p ? `![${name.trim()}](${encode(p)})` : m;
  });
  body = body.replace(/\[\[([^\]|#]+)(#[^\]|]*)?(?:\|([^\]]*))?\]\]/g, (m, name, _heading, alias) => {
    const p = resolveName(name);
    return p ? `[${(alias ?? name).trim()}](${encode(p)})` : m;
  });
  if (missing.length) fail(`no tracked file for ${missing.map((n) => `[[${n}]]`).join(', ')}`);
  const banner = `<!-- Generated from "${SOURCE}" by _ops/readme/build-readme.mjs. Do not edit by hand. -->\n\n`;
  return banner + body.replace(/^\n+/, '');
}

const src = readFileSync(join(ROOT, SOURCE), 'utf8');
const want = render(src, trackedIndex());
const targetPath = join(ROOT, TARGET);

if (check) {
  if (!existsSync(targetPath)) fail(`${TARGET} is missing; run node _ops/readme/build-readme.mjs`);
  if (readFileSync(targetPath, 'utf8') !== want) fail(`${TARGET} differs from "${SOURCE}"; run node _ops/readme/build-readme.mjs`);
  console.log(`build-readme: ${TARGET} matches "${SOURCE}"`);
} else {
  writeFileSync(targetPath, want);
  console.log(`build-readme: wrote ${TARGET} from "${SOURCE}"`);
}
