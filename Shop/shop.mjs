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
// Run:  node Shop/shop.mjs menu [need]        what the Shop can do, by medium; `need` filters
//                                              (a medium, a name, or any word on a card)
//       node Shop/shop.mjs card "<Specialist>" one Specialist's whole card
//       node Shop/shop.mjs missing            Specialists with no card, or a card with holes
//       add --json for the data, --host mac|sandbox|cloud|runpod to ask about another host,
//       --all to include stubs in the menu.
//
// It works from any worktree: pages are read from the checkout this file sits in, and
// the tools are looked for in the main checkout (git's common dir), where _tools/ lives.
// Zero dependencies, like the rest of the Shop toolchain. Design and reasons:
// "The Shop/The Shop — sketch — discovery design.md".

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

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
  if (!s.date) return 'never run';
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

function main() {
  const args = process.argv.slice(2);
  const flag = (f) => { const i = args.indexOf(f); if (i < 0) return false; args.splice(i, 1); return true; };
  const opt = (f) => { const i = args.indexOf(f); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
  const json = flag('--json'), all = flag('--all'); const host = thisHost(); const cls = opt('--host') || host.cls;
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
  console.error('Usage: node Shop/shop.mjs menu [need] | card "<Specialist>" | missing   [--json] [--all] [--host mac|sandbox|cloud|runpod]');
  process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
