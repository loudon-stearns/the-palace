#!/usr/bin/env node
// shop.mjs — the Shop's bench. Stage 1: read-only.
//
// What the Shop can do, here and now, read from the Specialists' own pages. Nothing in
// this file knows a Specialist by name: the menu is computed from three things each
// Specialist already keeps —
//   1. the CARD at the top of its page (labelled lines; see CARD below),
//   2. its row in Shop/Maker/host-capability.json (which hosts can run it),
//   3. the last "- run ·" line of its tuning ledger (when it was last used).
// So the menu cannot drift from the pages the way a hand-kept list does; a Specialist
// with no card shows as having none.
//
// Read:  node Shop/shop.mjs menu [need]        what the Shop can do, by medium; `need` filters
//                                               (a medium, a name, or any word on a card)
//        node Shop/shop.mjs card "<Specialist>" one Specialist's whole card
//        node Shop/shop.mjs missing            Specialists with no card, or a card with holes
//        node Shop/shop.mjs tests "<Specialist>" its open tests: the card's "Not yet shown to hold"
//                                               items, its ledger's owed lines, and its proofs
//                                               with who has heard or seen each
//        add --json for the data, --host mac|sandbox|cloud|runpod to ask about another host,
//        --all to include stubs in the menu.
//
// Make (stage 2):
//        node Shop/shop.mjs workshop <folder> [--for "<what this round is>"]
//            start a workshop with the bench already in it: a jobs.json skeleton and a
//            README carrying today's menu, so the first file a maker opens is the Shop's.
//        node Shop/shop.mjs run <jobs.json> [job …] [--by <who>] [--taught "<a lesson>"] [--dry-run] [--no-present]
//            run jobs. A job is whatever command makes one piece — usually a function in the
//            maker's own script — plus the chain of Specialists it passes through. The bench
//            times it, checks its outputs exist, hashes them, and writes provenance.json beside
//            the jobs file. For each Specialist in a chain it appends ONE run line per batch to
//            that Specialist's ledger in this checkout, so the line lands with the work. Then it
//            presents the folder (below) unless --no-present.
//        node Shop/shop.mjs present <jobs.json> [--page-scrolls] [--dry-run]
//            put the folder's work where Loudon looks and listens: one section on the scroll of
//            every Specialist in its chains (the scroll is made if missing), and a short link on
//            the scroll of each `page` a piece is for, when that page has a scroll (--page-scrolls
//            makes one). The section says what each piece claims, who has heard or seen it and
//            what they said, and links every file by palace path so STIGMERGY plays it in place.
//            Keyed on the folder, so presenting again replaces the section, never doubles it.
//            Optional jobs.json fields it reads: "headline", "notes", "question" (what only an
//            ear or eye can say), "artifacts": [{ "path", "caption" }] listed first, a job's
//            "caption", and "scroll_id". A job never run through the bench may carry its own
//            "heard_by" and "verdict"; the section says the bench did not record it.
//        node Shop/shop.mjs heard <jobs.json> <job> --by <who> [--verdict "<their words>"]
//            record who has heard or seen a piece, and what they said; --round instead of a job
//            records a verdict on the whole round. Then presents again, so the verdict shows.
//        node Shop/shop.mjs check <path …> [--strict]
//            for every sound, image and video under a path: what made it, whether the file
//            still matches its provenance, and who has heard or seen it — or that nothing says.
//
// jobs.json:  { "made_for": "...", "tier": "sketch", "jobs": [ { "name": "drip",
//   "page": "Pauline Oliveros", "sentence": "...", "claim": "...", "seed": 1932,
//   "chain": ["Stable Audio Open", "hand: cut, place and mix"],
//   "run": "$SHOP_TOOLS/stable-audio-3/.venv/bin/python make.py drip",
//   "outputs": ["drip.m4a", "drip — picture.svg"], "inputs": [], "heard_by": null } ] }
// A chain entry that names a Specialist gets the ledger line; one that starts "hand" is the
// maker's own code and gets none (until the hand has pages of its own). `run` executes in the
// jobs file's folder with SHOP_MAIN (the main checkout), SHOP_TOOLS (its _tools) and
// SHOP_PALACE (this checkout) set, so a script reaches the tools from any worktree.
//
// It works from any worktree: pages are read from the checkout this file sits in, and
// the tools are looked for in the main checkout (git's common dir), where _tools/ lives.
// Zero dependencies, like the rest of the Shop toolchain. Design and reasons:
// "The Shop/The Shop — sketch — discovery design.md".

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';

const SHOP = path.dirname(fileURLToPath(import.meta.url));
const PALACE = path.dirname(SHOP);

// The card: labelled lines in the page body. The first three are the labels Stable Audio
// Open's page carried first (2026-11-14); a label is matched at the start of a line.
export const CARD = [
  ['best', 'Best used for, so far'],
  ['notYet', 'Not yet shown to hold'],
  ['notFor', 'Not my purpose'],
  ['run', 'Run'],
  ['speed', 'Speed'],
  ['checkedBy', 'Checked by'],
  ['wears', 'Wears'],
  ['handsOn', 'Hands on'],
];

function frontmatter(text) {
  if (!text.startsWith('---')) return '';
  const end = text.indexOf('\n---', 3);
  return end < 0 ? '' : text.slice(3, end);
}
function scalar(fm, key) {
  const m = fm.match(new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, 'm'));
  return m ? m[1].replace(/^["']|["']$/g, '') : null;
}
function readCard(text) {
  const card = {};
  for (const [key, label] of CARD) {
    const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = text.match(new RegExp(`^\\*\\*${esc}:\\*\\*[ \\t]*(.+)$`, 'm'));
    if (m) card[key] = m[1].trim();
  }
  return card;
}
function lastRun(name) {
  const p = path.join(SHOP, name, `${name} — tuning.md`);
  if (!fs.existsSync(p)) return { ledger: false, date: null, owed: 0 };
  const text = fs.readFileSync(p, 'utf8');
  const runs = [...text.matchAll(/^- run · (\d{4}-\d{2}-\d{2})/gm)].map((m) => m[1]).sort();
  const owed = (text.match(/\bowed\b/gi) || []).length;
  return { ledger: true, date: runs.length ? runs[runs.length - 1] : null, owed };
}
function mainCheckout() {
  try {
    const common = execFileSync('git', ['-C', PALACE, 'rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8' }).trim();
    return path.dirname(common);
  } catch { return PALACE; }
}
function thisHost() {
  // Loudon's Mac is the one host that has the tools folder; anything else is a sandbox.
  const main = mainCheckout();
  const tools = fs.existsSync(path.join(main, '_tools'));
  return { cls: process.platform === 'darwin' && tools ? 'mac' : 'sandbox', main, tools };
}

export function load() {
  const manifest = JSON.parse(fs.readFileSync(path.join(SHOP, 'Maker', 'host-capability.json'), 'utf8')).specialists || {};
  const out = [];
  for (const f of fs.readdirSync(SHOP).filter((f) => f.endsWith('.md')).sort()) {
    const text = fs.readFileSync(path.join(SHOP, f), 'utf8');
    const fm = frontmatter(text);
    if (scalar(fm, 'type') !== 'specialist') continue;
    const name = f.slice(0, -3);
    out.push({
      name, file: `Shop/${f}`, status: scalar(fm, 'status') || '?', medium: scalar(fm, 'medium') || 'other',
      tool: scalar(fm, 'tool') || '', card: readCard(text), host: manifest[name] || null, ...lastRun(name),
    });
  }
  return out;
}

function days(date) { return date ? Math.floor((Date.now() - new Date(date + 'T12:00:00').getTime()) / 864e5) : null; }
function ran(s) {
  if (!s.ledger) return 'no ledger';
  if (!s.date) return 'no run line in its ledger';
  const d = days(s.date);
  return d <= 0 ? 'last ran today' : d === 1 ? 'last ran yesterday' : `last ran ${s.date} (${d} days)`;
}
function here(s, cls) {
  if (!s.host) return 'host not recorded';
  if (s.host.hosts.includes(cls)) return 'runs here';
  const reach = s.host.hosts.filter((h) => h === 'cloud' || h === 'runpod');
  if (reach.length) return `not local: ${reach.map((h) => (h === 'cloud' ? 'an API call and a token' : 'a rented pod, which costs money')).join(' or ')}`;
  return `not here: needs ${s.host.hosts.join(' or ')}`;
}
function wrap(text, indent, width = 100) {
  const words = text.split(/\s+/); const lines = []; let line = '';
  for (const w of words) { if ((line + ' ' + w).trim().length > width - indent.length) { lines.push(line); line = w; } else line = (line + ' ' + w).trim(); }
  if (line) lines.push(line);
  return lines.map((l) => indent + l).join('\n');
}

function menu(list, need, cls, all) {
  let rows = list.filter((s) => all || s.status !== 'stub');
  if (need) {
    const n = need.toLowerCase();
    rows = rows.filter((s) => [s.name, s.medium, s.tool, ...Object.values(s.card)].join(' ').toLowerCase().includes(n));
  }
  const order = ['sound', 'image', 'motion', 'interactive', 'other', 'plumbing'];
  const media = [...new Set(rows.map((s) => s.medium))].sort((a, b) => (order.indexOf(a) + 99) % 99 - (order.indexOf(b) + 99) % 99);
  const out = [`THE SHOP — what it can do on this host (${cls})${need ? `, for "${need}"` : ''}`, ''];
  for (const m of media) {
    out.push(m.toUpperCase());
    for (const s of rows.filter((r) => r.medium === m)) {
      out.push(`  ${s.name}${s.status === 'stub' ? ' (stub)' : ''} — ${here(s, cls)} · ${ran(s)}`);
      out.push(wrap(s.card.best || 'No card yet: open the page.', '      '));
      if (s.card.speed && !/^not recorded/i.test(s.card.speed)) out.push(wrap(`Speed: ${s.card.speed}`, '      '));
    }
    out.push('');
  }
  if (!rows.length) out.push('  Nothing matches. Try a medium (sound, image, motion, interactive) or `menu --all` for stubs.', '');
  out.push('One Specialist whole: node Shop/shop.mjs card "<name>"   ·   A made thing is usually several of these and an editor: choose each for what it does best, then collect and edit together.');
  return out.join('\n');
}
function cardText(s, cls) {
  const out = [`${s.name} — ${s.medium} · ${s.status} · ${s.tool}`, `${here(s, cls)} · ${ran(s)}${s.owed ? ` · ${s.owed} ledger line(s) owed a review` : ''}`, ''];
  for (const [key, label] of CARD) out.push(`${label}:`, wrap(s.card[key] || '— not on the page yet', '    '));
  if (s.host?.fallback) out.push('', `If it cannot run here: ${s.host.fallback}. ${s.host.fallback_note || ''}`);
  out.push('', `The page: ${s.file}   ·   its ledger: Shop/${s.name}/${s.name} — tuning.md`);
  return out.join('\n');
}

// ── stage 2: making ──────────────────────────────────────────────────────────────────
const MEDIA = new Set(['.wav', '.m4a', '.mp3', '.aif', '.aiff', '.flac', '.ogg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.mp4', '.mov', '.webm', '.pdf', '.glb', '.als', '.vcv']);
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 16);
const rel = (p) => path.relative(PALACE, p) || '.';
function git(args, cwd = PALACE) { try { return execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } }
function readJobs(file) {
  if (!file || !fs.existsSync(file)) { console.error(`No jobs file at "${file || ''}". Start one: node Shop/shop.mjs workshop <folder>`); process.exit(1); }
  const abs = path.resolve(file); const data = JSON.parse(fs.readFileSync(abs, 'utf8'));
  if (!Array.isArray(data.jobs)) { console.error(`${file}: no "jobs" array.`); process.exit(1); }
  return { abs, dir: path.dirname(abs), data, prov: path.join(path.dirname(abs), 'provenance.json') };
}
function readProv(p) { return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : { note: 'Written by Shop/shop.mjs run. What made each piece here, and who has heard or seen it.', jobs: {}, batches: [] }; }
const writeJson = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const isHand = (link) => /^hand\b/i.test(link.trim());
function specialistOf(link, list) {
  const name = link.split(/[:(]/)[0].trim().toLowerCase();
  return list.find((s) => s.name.toLowerCase() === name) || null;
}

function workshop(rest, what, list, cls) {
  const dir = path.resolve(rest[0] || ''); if (!rest[0]) { console.error('Usage: node Shop/shop.mjs workshop <folder> [--for "<what>"]'); process.exit(1); }
  fs.mkdirSync(dir, { recursive: true });
  const jobs = path.join(dir, 'jobs.json'), readme = path.join(dir, 'README.md'); const made = [];
  if (!fs.existsSync(jobs)) {
    writeJson(jobs, { made_for: what || 'say what this round is for', tier: 'sketch', jobs: [{
      name: 'example', page: 'the entry this piece is for', sentence: 'the sentence it sits beside', claim: 'what the piece will show, written before it is made',
      chain: ['a Specialist from the menu, by name', 'hand: what your own script does with it'], seed: 1,
      run: 'python3 make.py example', outputs: ['example.m4a'], inputs: [], heard_by: null }] });
    made.push('jobs.json');
  }
  if (!fs.existsSync(readme)) {
    const title = path.basename(dir);
    fs.writeFileSync(readme, `---
title: "${title} — workshop"
born: ${today()}
links:
  - target: "[[The Shop]]"
    type: connects-to
    label: "made-through"
forward_vector: "I am a workshop: where one round of making happens, with the Shop's bench already in it, so what is made here says what made it."
---

# ${title}

${what || 'Say what this round is for.'}

## Before the first file

Choose the tool for each PART of a piece, not for the piece: what would have been recorded or photographed is generated, what is plainly synthesized or a diagram is built by hand, and the two are edited together. Then write the piece's job in \`jobs.json\`, with its chain, and run it through the bench:

\`\`\`sh
node Shop/shop.mjs run "${rel(jobs)}" <job>     # from the palace root
node Shop/shop.mjs check "${rel(dir)}"          # what made each file here, and who has heard it
node Shop/shop.mjs card "<Specialist>"          # one Specialist whole: its command, its speed, what it has not been shown to hold
\`\`\`

Your own script is welcome. Name it in the chain as \`hand: …\`, and let a job be one function in it. A brief you hand another maker says what makes the piece, or that the maker chooses from the menu below.

## Where it is heard

Loudon looks and listens on a page's scroll in STIGMERGY. A run presents this folder there by itself: a section on the scroll of each Specialist in the chain, and a link on the scroll of the page a piece is for. Again by hand: \`node Shop/shop.mjs present "${rel(jobs)}"\`. Link any file by its palace path, as \`[caption](${rel(dir)}/file.m4a)\`; the app plays sound, shows images and frames a web page from such a link. Plain ASCII filenames with no em-dash keep a web page's URL whole. Presenting another way is welcome when it shows the work better; leave both on the scroll to compare.

## The menu on ${today()}, on this host (${cls})

\`\`\`
${menu(list, null, cls, false).split('\n').slice(2, -1).join('\n')}
\`\`\`

Today's menu: \`node Shop/shop.mjs menu\`.
`);
    made.push('README.md');
  }
  console.log(made.length ? `Workshop at ${rel(dir)}: wrote ${made.join(' and ')}.` : `Workshop at ${rel(dir)} already has its jobs.json and README; nothing written.`);
}

function ledgerLine(spec, text) {
  const p = path.join(SHOP, spec.name, `${spec.name} — tuning.md`);
  if (!fs.existsSync(p)) return `no ledger at Shop/${spec.name}/ — nothing written; start one as SCHEMA — Reference §6 says if this use is worth keeping`;
  const t = fs.readFileSync(p, 'utf8'); fs.writeFileSync(p, t.replace(/\n*$/, '\n') + text + '\n'); return `one line on Shop/${spec.name}/${spec.name} — tuning.md`;
}

function run(rest, o, list, host) {
  const J = readJobs(rest[0]); const want = rest.slice(1);
  const jobs = want.length ? want.map((n) => J.data.jobs.find((j) => j.name === n) || (console.error(`No job "${n}" in ${rel(J.abs)}. Jobs: ${J.data.jobs.map((j) => j.name).join(', ')}`), process.exit(1))) : J.data.jobs;
  const prov = readProv(J.prov); const env = { ...process.env, SHOP_MAIN: host.main, SHOP_TOOLS: path.join(host.main, '_tools'), SHOP_PALACE: PALACE };
  const head = git(['rev-parse', '--short', 'HEAD']); const used = new Map(); const done = []; let failed = 0;
  for (const j of jobs) {
    if (!j.run || !Array.isArray(j.chain) || !j.chain.length) { console.error(`✗ ${j.name}: a job needs "run" and a "chain" (which Specialists, and what the hand does).`); failed++; continue; }
    const unknown = j.chain.filter((l) => !isHand(l) && !specialistOf(l, list));
    if (unknown.length) { console.error(`✗ ${j.name}: not on the roster: ${unknown.join('; ')}. Name a Specialist as the menu does, or start the link with "hand".`); failed++; continue; }
    if (o.dry) { console.log(`would run ${j.name}: ${j.run}   [${j.chain.join(' → ')}]`); continue; }
    const t0 = Date.now(); const r = spawnSync(j.run, { cwd: J.dir, env, shell: true, stdio: 'inherit' }); const sec = Math.round((Date.now() - t0) / 100) / 10;
    const outs = {}; const missing = [];
    for (const f of j.outputs || []) { const p = path.join(J.dir, f); if (fs.existsSync(p)) outs[f] = sha(p); else missing.push(f); }
    const ok = r.status === 0 && !missing.length;
    if (!ok) { console.error(`✗ ${j.name}: ${r.status !== 0 ? `the command exited ${r.status}` : `ran, but did not write ${missing.join(', ')}`}. Nothing recorded for it.`); failed++; continue; }
    const before = prov.jobs[j.name];
    prov.jobs[j.name] = { page: j.page || null, sentence: j.sentence || null, claim: j.claim || null, chain: j.chain, run: j.run, seed: j.seed ?? null,
      inputs: Object.fromEntries((j.inputs || []).filter((f) => fs.existsSync(path.join(J.dir, f))).map((f) => [f, sha(path.join(J.dir, f))])),
      outputs: outs, made: new Date().toISOString(), seconds: sec, host: host.cls, commit_at_run: head, by: o.by || null,
      runs: (before?.runs || 0) + 1, heard_by: j.heard_by ?? before?.heard_by ?? null, verdict: before?.verdict ?? null };
    if (before && JSON.stringify(before.outputs) !== JSON.stringify(outs)) { prov.jobs[j.name].heard_by = null; prov.jobs[j.name].verdict = null; prov.jobs[j.name].remade_after_heard = before.heard_by ? `the file ${before.heard_by} heard was replaced by this run` : undefined; }
    for (const l of j.chain) { const s = specialistOf(l, list); if (s && !isHand(l)) used.set(s.name, [...(used.get(s.name) || []), j.name]); }
    done.push(j.name); console.log(`✓ ${j.name} · ${sec} s · ${Object.keys(outs).length} file(s) · ${j.chain.join(' → ')}`);
  }
  if (o.dry) return;
  if (done.length) {
    const lines = {};
    for (const [name, names] of used) {
      const spec = list.find((s) => s.name === name);
      const brief = (J.data.made_for || path.basename(J.dir)).split(/(?<=[.:])\s/)[0].replace(/[.:]$/, '').slice(0, 90);
      const what = `${brief} (${names.length} job${names.length > 1 ? 's' : ''}: ${names.join(', ')}; \`${rel(J.dir)}/\`), ${J.data.tier || 'sketch'}`;
      lines[name] = ledgerLine(spec, `- run · ${today()} · ${what} · ${o.taught ? 'a lesson is noted on the next line, owed a review' : 'nothing new'} · by the bench`);
      if (o.taught) ledgerLine(spec, `- from the bench · ${today()} · ${names.join(', ')} · "${o.taught.replace(/"/g, "'")}" · ${o.by ? `noted by ${o.by} · ` : ''}owed a review`);
    }
    prov.batches.push({ at: new Date().toISOString(), jobs: done, by: o.by || null, ledgers: lines });
    writeJson(J.prov, prov);
    console.log(`\nprovenance: ${rel(J.prov)}`); for (const [n, l] of Object.entries(lines)) console.log(`${n}: ${l}`);
    if (!o.noPresent) present(J.abs, { pageScrolls: o.pageScrolls }, list, host);
    console.log(`Commit the ledger line(s)${o.noPresent ? '' : ' and the scroll section(s)'} with the work. Nobody has heard or seen these until someone has: node Shop/shop.mjs heard "${rel(J.abs)}" <job> --by <who>`);
  }
  if (failed) process.exitCode = 1;
}

function heard(rest, by, verdict, o, list, host) {
  const J = readJobs(rest[0]); const name = rest[1];
  if ((!name && !o.round) || !by) { console.error('Usage: node Shop/shop.mjs heard <jobs.json> <job> --by <who> [--verdict "<their words>"]   (or --round for the whole round)'); process.exit(1); }
  const prov = readProv(J.prov);
  if (o.round) {
    if (!Object.keys(prov.jobs).length) { console.error(`${rel(J.prov)} records no jobs; nothing has been run through the bench to have heard.`); process.exit(1); }
    prov.round = { heard_by: `${by}, ${today()}`, verdict: verdict || null }; writeJson(J.prov, prov);
    console.log(`the round: heard by ${prov.round.heard_by}${verdict ? ` — "${verdict}"` : ''}.`);
    if (!o.noPresent) present(J.abs, { pageScrolls: o.pageScrolls }, list, host);
    return;
  }
  const p = prov.jobs[name];
  if (!p) { console.error(`No provenance for "${name}" in ${rel(J.prov)}; it has not been run through the bench.`); process.exit(1); }
  const changed = Object.entries(p.outputs).filter(([f, h]) => !fs.existsSync(path.join(J.dir, f)) || sha(path.join(J.dir, f)) !== h).map(([f]) => f);
  if (changed.length) { console.error(`${changed.join(', ')} no longer match what the bench recorded, so this would record a verdict on a different file. Re-run the job first.`); process.exit(1); }
  p.heard_by = `${by}, ${today()}`; if (verdict) p.verdict = verdict; writeJson(J.prov, prov);
  console.log(`${name}: heard by ${p.heard_by}${verdict ? ` — "${verdict}"` : ''}. What it teaches belongs on the Specialist's page too: node Shop/shop.mjs tests "<Specialist>" shows what is still open.`);
  if (!o.noPresent) present(J.abs, { pageScrolls: o.pageScrolls }, list, host);
}

// ── presenting: the bench puts its own work on a scroll (2026-11-15) ────────────────────
// Loudon looks and listens on a page's scroll in STIGMERGY, not in Obsidian, so a made
// thing that is not on a scroll has not been shown to him. `present` writes one hand
// section per jobs folder, in the shape the app plays (The Scroll.md § The making; the
// worked example is Stable Audio Open's `comparison-2026-11-14-substrate-sounds`), on
// the scroll of every Specialist in the chains, and a short link on the scroll of the
// page a piece is for. A section is keyed on an id from its folder, so presenting again
// replaces it in place. The materializer only rewrites Now and inserts new sections
// after `scroll:making:start`, so a section written here survives every re-materialize.
// This is one way to present; a maker who can show the work better another way does,
// and leaves both on the scroll to compare.
const AUDIO = /\.(wav|m4a|mp3|aiff?|flac|ogg)$/i, VISUAL = /\.(png|jpe?g|gif|webp|svg|mp4|mov|webm|pdf|html?|glb)$/i;
const PLACEHOLDER = /^_(No run in the ledger yet|Nothing made yet)[^\n]*_\s*$/m;
const MAKING_START = '<!-- scroll:making:start -->';

export function sectionId(dir, data = {}) {
  if (data.scroll_id) return data.scroll_id;
  const base = path.basename(dir).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const parent = path.basename(path.dirname(dir));
  return `${parent === 'comparisons' ? 'comparison' : parent === 'proofs' ? 'test' : 'shop'}-${base}`;
}
const linkTo = (p) => (/[()<>]/.test(p) ? `<${p}>` : p);
// A verdict as kept: a leading date is dropped (the heard line carries it), escaped quotes
// are unescaped. A verdict with no quote mark in it is taken as the hearer's own words and
// quoted; one with quote marks already says which words were theirs, and is left as kept.
export function quote(v) {
  const t = String(v).replace(/^\d{4}-\d{2}-\d{2}:\s*/, '').replace(/\\"/g, '"').trim();
  return t.includes('"') ? t : `"${t}"`;
}
function senseOf(files) {
  const a = files.some((f) => AUDIO.test(f)), v = files.some((f) => VISUAL.test(f));
  return a && v ? 'heard or seen' : v ? 'seen' : 'heard';
}
function headlineOf(data, dir) {
  if (data.headline) return data.headline;
  return (data.made_for || path.basename(dir)).split(/(?<=[.:;])\s/)[0].replace(/[.:;]$/, '').slice(0, 110);
}
function dayOf(dir, prov) {
  const m = path.basename(dir).match(/^\d{4}-\d{2}-\d{2}/); if (m) return m[0];
  return prov.batches?.[0]?.at?.slice(0, 10) || today();
}

/** Each job as the section tells it: the jobs file's words, the bench's record over them. */
export function jobRows(data, prov) {
  return data.jobs.map((j) => {
    const p = prov.jobs?.[j.name];
    const outputs = p ? Object.keys(p.outputs || {}) : (j.outputs || []);
    return { name: j.name, page: j.page || null, sentence: j.sentence || null, claim: j.claim || null, chain: j.chain || [], outputs, caption: j.caption || null,
      ran: !!p, heard_by: p ? p.heard_by : (j.heard_by || null), verdict: p ? p.verdict : (j.verdict || null), remade: p?.remade_after_heard || null };
  });
}
function heardSummary(rows) {
  const sense = senseOf(rows.flatMap((r) => r.outputs)); const heard = rows.filter((r) => r.heard_by);
  if (!heard.length) return `Nobody has ${sense} ${rows.length === 1 ? 'this' : 'any of these'} yet.`;
  const who = [...new Set(heard.map((r) => r.heard_by))].join('; ');
  if (heard.length === rows.length) return `${rows.length === 1 ? 'It has' : `All ${rows.length} have`} been ${sense}: ${who}.`;
  return `${heard.length} of ${rows.length} have been ${sense} (${who}); nobody has ${sense} ${heard.length === rows.length - 1 ? 'the other' : `the other ${rows.length - heard.length}`}: ${rows.filter((r) => !r.heard_by).map((r) => r.name).join(', ')}.`;
}
function artifactLines(J, rows) {
  const out = []; const seen = new Set();
  const add = (f, caption) => { const p = rel(path.join(J.dir, f)); if (seen.has(p)) return; seen.add(p); out.push(`- [${caption}](${linkTo(p)})`); };
  for (const a of J.data.artifacts || []) add(a.path, a.caption || a.path);
  for (const r of rows) for (const f of r.outputs) add(f, r.outputs.length > 1 || !r.caption ? `${r.caption || r.name}: ${f}` : r.caption);
  return { lines: out, add };
}

/** The section on a Specialist's scroll: the whole round. */
export function renderSection(J, prov, { id, specialist = null, presented = today() } = {}) {
  const rows = jobRows(J.data, prov); const sense = senseOf(rows.flatMap((r) => r.outputs));
  const L = [`<!-- scroll:entry id="${id}" -->`, `### ${dayOf(J.dir, prov)} — ${headlineOf(J.data, J.dir)}`, ''];
  if (J.data.made_for) L.push(J.data.made_for, '');
  if (J.data.notes) L.push(J.data.notes, '');
  if (J.data.question) L.push(`What only ${sense === 'seen' ? 'an eye' : sense === 'heard' ? 'an ear' : 'an ear or an eye'} can say: ${J.data.question}`, '');
  const claims = new Map();
  for (const r of rows) if (r.claim) claims.set(r.claim, [...(claims.get(r.claim) || []), r.name]);
  if (claims.size) {
    L.push('**What each piece claims, written before it was made:**');
    for (const [c, names] of claims) L.push(`- ${names.join(', ')}: ${c}`);
    L.push('');
  }
  L.push(`**Each piece, and who has ${sense} it:**`);
  for (const r of rows) {
    const chain = r.chain.join(' → ');
    const said = r.heard_by ? `${r.heard_by}${r.verdict ? `: ${quote(r.verdict)}` : ''}` : `nobody has ${senseOf(r.outputs)} this yet${r.remade ? ` (${r.remade})` : ''}`;
    L.push(`- **${r.name}**${r.sentence ? `, ${r.page ? `for ${r.page}, ` : ''}${r.sentence}` : ''} · ${chain || 'no chain'}${r.ran ? '' : ' · not run through the bench'} · ${said}`);
  }
  L.push('', heardSummary(rows), '');
  if (prov.round?.heard_by) L.push(`**${sense === 'seen' ? 'Seen' : 'Heard'}.** ${prov.round.heard_by}${prov.round.verdict ? `: ${quote(prov.round.verdict)}` : ''}`, '');
  const art = artifactLines(J, rows);
  if (fs.existsSync(J.prov)) art.add('provenance.json', 'what made each file, and who has heard or seen it');
  art.add(path.basename(J.abs), 'the jobs as written');
  L.push('**Artifacts:**', ...art.lines, '');
  L.push(`<sub>${footer(J, prov, rows, presented, specialist)}</sub>`, '<!-- /scroll:entry -->');
  return L.join('\n');
}
function footer(J, prov, rows, presented, specialist) {
  const ran = rows.filter((r) => r.ran).length; const b = prov.batches || [];
  const parts = [`${J.data.tier || 'sketch'}, ${rows.length} job${rows.length === 1 ? '' : 's'}`];
  if (ran) {
    const by = [...new Set(b.map((x) => x.by).filter(Boolean))].join(', '); const commits = [...new Set(Object.values(prov.jobs || {}).map((j) => j.commit_at_run).filter(Boolean))].join(', ');
    parts.push(`${ran === rows.length ? 'every job' : `${ran} of ${rows.length} jobs`} made through the bench${b.length ? `, ${b.length} batch${b.length === 1 ? '' : 'es'} from ${b[0].at.slice(0, 10)}` : ''}${by ? ` by ${by}` : ''}${commits ? ` at ${commits}` : ''}`);
  }
  if (ran < rows.length) parts.push(`${ran ? 'the rest were' : 'nothing here was'} run through the bench, so no hash checks these files against what was ${senseOf(rows.flatMap((r) => r.outputs))}; their jobs file was written after the making`);
  parts.push(`folder ${rel(J.dir)}/`, `presented ${presented} by the bench (Shop/shop.mjs present)${specialist ? ` on ${specialist}'s scroll` : ''}`);
  return parts.join(' · ');
}

/** The short section on the scroll of the page a piece is for: what was made for it, and where the round is. */
export function renderPageSection(J, prov, { id, page, specialists, presented = today() }) {
  const rows = jobRows(J.data, prov).filter((r) => r.page === page);
  const L = [`<!-- scroll:entry id="${id}" -->`, `### ${dayOf(J.dir, prov)} — ${headlineOf(J.data, J.dir)}`, ''];
  const sentences = [...new Set(rows.map((r) => r.sentence).filter(Boolean))];
  L.push(`Made for this page through the Shop${sentences.length ? `, beside: ${sentences.join('; ')}` : ''}. Nothing here is wired into the page; that is still the page's call.`, '');
  L.push(`The whole round, with what each piece claims and who has ${senseOf(rows.flatMap((r) => r.outputs))} it, is on ${specialists.map((s) => `[${s}'s scroll](${linkTo(`Shop/${s}/${s} — scroll.md`)})`).join(' and ')}. ${heardSummary(rows)}`, '');
  const art = artifactLines(J, rows);
  L.push('**Artifacts:**', ...art.lines, '', `<sub>a link from the Shop · ${rows.length} piece${rows.length === 1 ? '' : 's'} for ${page} · folder ${rel(J.dir)}/ · presented ${presented} by the bench (Shop/shop.mjs present)</sub>`, '<!-- /scroll:entry -->');
  return L.join('\n');
}

/** Put a section into a scroll's making trail: replace its own id in place, or add it at the top. */
export function upsertSection(text, id, section) {
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<!--\\s*scroll:entry id="${esc}"\\s*-->[\\s\\S]*?<!--\\s*\\/scroll:entry\\s*-->`);
  if (re.test(text)) return { text: text.replace(re, () => section), how: 'replaced' };
  const at = text.indexOf(MAKING_START);
  if (at < 0) return { text, how: null };
  const head = text.slice(0, at + MAKING_START.length); let tail = text.slice(at + MAKING_START.length);
  const end = tail.indexOf('<!-- scroll:making:end -->');
  if (end >= 0 && PLACEHOLDER.test(tail.slice(0, end)) && !/scroll:entry/.test(tail.slice(0, end))) tail = tail.replace(PLACEHOLDER, '').replace(/^\n+/, '\n');
  return { text: `${head}\n${section}\n${tail.startsWith('\n') ? '' : '\n'}${tail}`, how: 'added' };
}

function pageFile(title) {
  const hits = (git(['ls-files', '--', `${title}.md`, `*/${title}.md`]) || '').split('\n').filter(Boolean);
  return hits.length ? path.join(PALACE, hits[0]) : null;
}
function scrollOf(title) {
  const f = pageFile(title); if (!f) return null;
  return path.join(path.dirname(f), title, `${title} — scroll.md`);
}
function makeScroll(title, host) {
  // The materializer needs the orchestrator's packages; a worktree may not have them,
  // so the main checkout's copy is asked to write into this checkout (--root).
  for (const root of [...new Set([PALACE, host.main])]) {
    const r = spawnSync(process.execPath, [path.join(root, '_ops/stigmergy/orchestrator/src/scroll.js'), '--root', PALACE, '--home', title], { encoding: 'utf8' });
    if (r.status === 0) return true;
  }
  return false;
}

export function present(file, o, list, host, say = console.log) {
  const J = readJobs(file); const prov = readProv(J.prov); const id = sectionId(J.dir, J.data); const notes = [];
  const specs = [...new Set(J.data.jobs.flatMap((j) => (j.chain || []).filter((l) => !isHand(l)).map((l) => specialistOf(l, list)?.name).filter(Boolean)))];
  const write = (title, section, { create }) => {
    const sp = scrollOf(title);
    if (!sp) return notes.push(`${title}: no page by that title; nothing written.`);
    if (!fs.existsSync(sp)) {
      if (!create) return notes.push(`${title}: has no scroll, so nothing is linked from it. Making one is the page's call: node _ops/stigmergy/orchestrator/src/scroll.js --home "${title}", then present again (or present --page-scrolls).`);
      if (o.dry || !makeScroll(title, host) || !fs.existsSync(sp)) return notes.push(`${title}: has no scroll${o.dry ? '; one would be made' : ' and the materializer could not make one'}.`);
      notes.push(`${title}: scroll made.`);
    }
    const r = upsertSection(fs.readFileSync(sp, 'utf8'), id, section);
    if (!r.how) return notes.push(`${rel(sp)}: no scroll:making:start marker; nothing written.`);
    if (!o.dry) fs.writeFileSync(sp, r.text);
    notes.push(`${o.dry ? 'would have ' : ''}${r.how} \`${id}\` on ${rel(sp)}`);
  };
  if (!specs.length) notes.push('No Specialist in any chain, so no Specialist scroll to present on.');
  for (const s of specs) write(s, renderSection(J, prov, { id, specialist: s }), { create: true });
  const pages = [...new Set(J.data.jobs.map((j) => j.page).filter((p) => p && !/^the entry this piece is for$/.test(p)))];
  for (const p of pages) if (specs.length) write(p, renderPageSection(J, prov, { id, page: p, specialists: specs }), { create: !!o.pageScrolls });
  if (!o.quiet) { say(`present ${rel(J.abs)}:`); for (const n of notes) say(`  ${n}`); }
  return notes;
}

// ── a Specialist's open tests ───────────────────────────────────────────────────────
export function splitNotYet(line) {
  if (!line) return [];
  const parts = line.includes(';') ? line.split(/;\s+/) : line.split(/(?<=\.)\s+(?=[A-Z(`])/);
  return parts.map((s) => s.trim().replace(/[.;]$/, '')).filter(Boolean);
}
function scrollSays(scrollText, folderRel) {
  const re = /<!--\s*scroll:entry id="([^"]+)"\s*-->([\s\S]*?)<!--\s*\/scroll:entry\s*-->/g; let m;
  while ((m = re.exec(scrollText)) !== null) {
    if (!m[2].includes(folderRel + '/')) continue;
    const nobody = m[2].match(/[^.\n]*\bnobody has (heard|seen)[^.\n]*/i);
    const heard = m[2].match(/\*\*(Heard|Seen)\.?\*\*[^\n]{0,80}|\b(Heard|Seen) by[^\n]{0,80}|\bLoudon (heard|saw|listened|looked)[^.\n]{0,60}|\b(heard|saw|seen)[^.\n]{0,40}\b\d{4}-\d{2}-\d{2}/);
    return `its scroll section \`${m[1]}\` says: ${heard ? heard[0].trim().replace(/\s+\S*$/, '…') : nobody ? nobody[0].trim() : 'nothing about who has heard or seen it'}`;
  }
  return 'not on its scroll';
}
export function openTests(s) {
  const dir = path.join(SHOP, s.name); const ledgerP = path.join(dir, `${s.name} — tuning.md`);
  const owed = fs.existsSync(ledgerP) ? fs.readFileSync(ledgerP, 'utf8').split('\n').filter((l) => /\bowed\b/i.test(l)).map((l) => l.trim()) : [];
  const scrollP = path.join(dir, `${s.name} — scroll.md`); const scrollText = fs.existsSync(scrollP) ? fs.readFileSync(scrollP, 'utf8') : '';
  const folders = new Set();
  const proofs = path.join(dir, 'proofs');
  if (fs.existsSync(proofs)) for (const f of fs.readdirSync(proofs)) if (fs.statSync(path.join(proofs, f)).isDirectory()) folders.add(path.join(proofs, f));
  const findProv = (p, depth = 0) => { if (depth > 4 || !fs.existsSync(p)) return; for (const f of fs.readdirSync(p)) { const q = path.join(p, f); if (f === 'provenance.json') { try { const v = JSON.parse(fs.readFileSync(q, 'utf8')); if (Object.values(v.jobs || {}).some((j) => (j.chain || []).some((l) => !isHand(l) && specialistOf(l, [s])))) folders.add(p); } catch { /* not the bench's */ } } else if (!f.startsWith('.') && fs.statSync(q).isDirectory()) findProv(q, depth + 1); } };
  findProv(SHOP);
  const rows = [...folders].sort((x, y) => path.basename(y).localeCompare(path.basename(x))).map((f) => {
    const pf = path.join(f, 'provenance.json');
    if (fs.existsSync(pf)) {
      const v = readProv(pf); const js = Object.entries(v.jobs || {});
      const heardN = js.filter(([, j]) => j.heard_by).length;
      return { folder: rel(f), heard: js.length ? `${heardN} of ${js.length} job(s) heard or seen${heardN ? ` (${[...new Set(js.map(([, j]) => j.heard_by).filter(Boolean))].join('; ')})` : ''}, from its provenance` : 'provenance holds no jobs', scroll: scrollSays(scrollText, rel(f)) };
    }
    return { folder: rel(f), heard: 'no provenance', scroll: scrollSays(scrollText, rel(f)) };
  });
  const plan = path.join(dir, 'tests', 'test-plan.md');
  return { name: s.name, notYet: splitNotYet(s.card.notYet), owed, proofs: rows, testPlan: fs.existsSync(plan) ? rel(plan) : null, scroll: scrollText ? rel(scrollP) : null };
}
function testsText(t) {
  const out = [`${t.name} — open tests`, '', 'Not yet shown to hold (its card):'];
  out.push(...(t.notYet.length ? t.notYet.map((x) => wrap(`- ${x}`, '  ')) : ['  — the card has no such line']));
  out.push('', 'Owed in its ledger:', ...(t.owed.length ? t.owed.map((x) => wrap(x.replace(/^- /, '- '), '  ')) : ['  — nothing owed']));
  out.push('', 'Proofs, newest first, and who has heard or seen each:');
  out.push(...(t.proofs.length ? t.proofs.flatMap((p) => [`  ${p.folder}/`, wrap(`${p.heard}; ${p.scroll}`, '      ')]) : ['  — no proof folders yet']));
  out.push('', `${t.scroll ? `Its scroll: ${t.scroll}` : 'No scroll yet: node _ops/stigmergy/orchestrator/src/scroll.js --home "' + t.name + '"'}${t.testPlan ? `   ·   its test plan: ${t.testPlan}` : ''}`);
  return out.join('\n');
}

function walk(p, out = []) {
  const st = fs.statSync(p);
  if (st.isDirectory()) { for (const f of fs.readdirSync(p)) if (!f.startsWith('.') && f !== 'node_modules') walk(path.join(p, f), out); }
  else if (MEDIA.has(path.extname(p).toLowerCase())) out.push(p);
  return out;
}
function check(rest, strict, json) {
  if (!rest.length) { console.error('Usage: node Shop/shop.mjs check <path…> [--strict]'); process.exit(1); }
  const files = rest.flatMap((r) => (fs.existsSync(r) ? walk(path.resolve(r)) : (console.error(`No such path: ${r}`), [])));
  const provs = new Map(); const rows = [];
  for (const f of files) {
    const dir = path.dirname(f); if (!provs.has(dir)) provs.set(dir, fs.existsSync(path.join(dir, 'provenance.json')) ? readProv(path.join(dir, 'provenance.json')) : null);
    const prov = provs.get(dir); const base = path.basename(f);
    const hit = prov && Object.entries(prov.jobs).find(([, j]) => base in (j.outputs || {}));
    if (!hit) { rows.push({ file: rel(f), state: 'nothing says' }); continue; }
    const [name, j] = hit; const same = sha(f) === j.outputs[base];
    rows.push({ file: rel(f), state: same ? 'matches' : 'changed since the bench ran it', job: name, chain: j.chain, made: j.made.slice(0, 10), heard_by: j.heard_by || 'nobody yet', verdict: j.verdict || null });
  }
  if (json) return console.log(JSON.stringify(rows, null, 2));
  for (const r of rows) console.log(r.state === 'nothing says' ? `?  ${r.file} — nothing says what made it` : `${r.state === 'matches' ? '✓' : '≠'}  ${r.file} — ${r.chain.join(' → ')} · ${r.made}${r.state === 'matches' ? '' : ' · CHANGED since the bench ran it'} · heard by ${r.heard_by}`);
  const n = rows.filter((r) => r.state === 'nothing says').length, c = rows.filter((r) => r.state.startsWith('changed')).length;
  console.log(`\n${rows.length} made file(s): ${rows.length - n - c} with provenance that matches, ${c} changed since, ${n} that nothing accounts for.`);
  if (strict && (n || c)) process.exitCode = 1;
}

function main() {
  const args = process.argv.slice(2);
  const flag = (f) => { const i = args.indexOf(f); if (i < 0) return false; args.splice(i, 1); return true; };
  const opt = (f) => { const i = args.indexOf(f); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
  const json = flag('--json'), all = flag('--all'); const host = thisHost(); const cls = opt('--host') || host.cls;
  const pre = { for: null, by: null, taught: null, verdict: null };
  for (const k of Object.keys(pre)) pre[k] = opt('--' + k);
  const dry = flag('--dry-run'), strict = flag('--strict'), noPresent = flag('--no-present'), pageScrolls = flag('--page-scrolls'), round = flag('--round');
  const [cmd, ...rest] = args; const list = load();
  if (cmd === 'menu' || !cmd) {
    const need = rest.join(' ').trim() || null;
    if (json) return console.log(JSON.stringify({ host: cls, need, specialists: list }, null, 2));
    return console.log(menu(list, need, cls, all));
  }
  if (cmd === 'card') {
    const q = rest.join(' ').trim().toLowerCase();
    const s = list.find((x) => x.name.toLowerCase() === q) || list.find((x) => x.name.toLowerCase().includes(q));
    if (!q || !s) { console.error(`No Specialist matches "${rest.join(' ')}". Names: ${list.map((x) => x.name).join(', ')}`); process.exit(1); }
    return console.log(json ? JSON.stringify(s, null, 2) : cardText(s, cls));
  }
  if (cmd === 'missing') {
    const holes = list.map((s) => ({ name: s.name, missing: CARD.filter(([k]) => !s.card[k]).map(([, l]) => l), host: !s.host }))
      .filter((h) => h.missing.length || h.host);
    if (json) return console.log(JSON.stringify(holes, null, 2));
    if (!holes.length) return console.log(`Every one of the ${list.length} Specialists has a whole card and a host row.`);
    for (const h of holes) console.log(`${h.name}: ${h.missing.length === CARD.length ? 'no card' : h.missing.length ? 'card lacks ' + h.missing.join(', ') : 'card whole'}${h.host ? ' · no row in host-capability.json' : ''}`);
    process.exitCode = 1; return;
  }
  if (cmd === 'workshop') return workshop(rest, pre.for, list, cls);
  if (cmd === 'run') return run(rest, { by: pre.by, taught: pre.taught, dry, noPresent, pageScrolls }, list, host);
  if (cmd === 'heard') return heard(rest, pre.by, pre.verdict, { noPresent, pageScrolls, round }, list, host);
  if (cmd === 'present') { if (!rest[0]) { console.error('Usage: node Shop/shop.mjs present <jobs.json> [--page-scrolls] [--dry-run]'); process.exit(1); } present(rest[0], { dry, pageScrolls }, list, host); return; }
  if (cmd === 'tests') {
    const q = rest.join(' ').trim().toLowerCase();
    const s = list.find((x) => x.name.toLowerCase() === q) || list.find((x) => x.name.toLowerCase().includes(q));
    if (!q || !s) { console.error(`No Specialist matches "${rest.join(' ')}". Names: ${list.map((x) => x.name).join(', ')}`); process.exit(1); }
    const t = openTests(s); return console.log(json ? JSON.stringify(t, null, 2) : testsText(t));
  }
  if (cmd === 'check') return check(rest, strict, json);
  console.error('Usage: node Shop/shop.mjs menu [need] | card "<Specialist>" | tests "<Specialist>" | missing | workshop <folder> | run <jobs.json> [job…] | present <jobs.json> | heard <jobs.json> <job> --by <who> | check <path…>');
  process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
