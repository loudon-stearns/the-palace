// ledger-review.js — the review's read: what the stewards have proposed for
// canon, page by page, and what each page says in that place now.
//
// No steward writes the house; each change it wants waits in its tuning ledger
// as a proposal for canon, owed until Loudon's review (ledger.js § Proposals
// for canon). This is the reading end of that review, built on the seam's own
// listOwedProposals: the proposals grouped by the page they would change, the
// section each one names as the page reads it today (the words before), and
// the one line every caller says when it mentions the review — the PROJECTS
// deck, the Return, the Weave. One reader, so the three never disagree.
//
// Read-only. A proposal is settled on its own ledger, by payProposal or
// declineProposal, once Loudon has said yes or no (settle-proposal.mjs);
// nothing here writes.
// Canon: [[Project Stewardship System]] § What's Decided.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { listOwedProposals } from './ledger.js';

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

/** A heading as a place names it: no bold, no links, one space, lower case. */
const norm = (s) => String(s || '').replace(/\*\*|__|\[\[|\]\]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Every owed proposal, grouped by the page it would change: [{ page, path,
 * exists, stewards, items, oldest, urgent }]. Pages with an urgent item come
 * first, then the oldest; items inside a page keep the seam's order, oldest
 * first. A proposal for a page that does not exist yet groups under its title.
 */
export function proposalsByPage(palaceRoot) {
  const groups = new Map();
  for (const p of listOwedProposals(palaceRoot)) {
    const key = norm(p.path || p.page);
    if (!groups.has(key)) groups.set(key, { page: p.page, path: p.path, exists: p.exists, stewards: [], items: [], oldest: p.date, urgent: 0 });
    const g = groups.get(key);
    g.items.push(p);
    if (!g.stewards.includes(p.steward)) g.stewards.push(p.steward);
    if (p.date < g.oldest) g.oldest = p.date;
    if (p.urgent) g.urgent += 1;
  }
  return [...groups.values()].sort((a, b) => (b.urgent > 0) - (a.urgent > 0) || a.oldest.localeCompare(b.oldest) || a.page.localeCompare(b.page));
}

/**
 * The page's headings, in file order: [{ level, text, line }] (line 1-based,
 * counted in the whole file). Headings inside a fenced block are not headings.
 */
export function pageHeadings(pageText) {
  const out = [];
  let fenced = false;
  String(pageText || '').split('\n').forEach((l, i) => {
    if (/^\s*(```|~~~)/.test(l)) { fenced = !fenced; return; }
    if (fenced) return;
    const m = HEADING_RE.exec(l);
    if (m) out.push({ level: m[1].length, text: m[2], line: i + 1 });
  });
  return out;
}

/**
 * The section a proposal's place names, as the page reads it now: { kind:
 * 'section', heading, level, line, end, text } for `§ <heading>…`, { kind:
 * 'frontmatter', text } for a place that says frontmatter, or null when the
 * place names nothing the page has. A place says more than its heading ("§
 * What Exists, new bullet after …"), so the heading is the longest one of the
 * page's own that the place opens with; the section runs to the next heading
 * of the same level or higher.
 */
export function sectionNow(pageText, place) {
  const text = String(pageText || '');
  const where = String(place || '').trim();
  if (/^frontmatter\b/i.test(where)) {
    const fm = FRONTMATTER_RE.exec(text);
    return fm ? { kind: 'frontmatter', text: fm[1] } : null;
  }
  const m = /^§\s*(.+)$/.exec(where);
  if (!m) return null;
  const asked = norm(m[1]);
  const heads = pageHeadings(text);
  let hit = null;
  for (const h of heads) {
    const t = norm(h.text);
    if (!t || !(asked === t || asked.startsWith(`${t},`) || asked.startsWith(`${t}:`) || asked.startsWith(`${t} `) || asked.startsWith(`${t}—`))) continue;
    if (!hit || t.length > norm(hit.text).length) hit = h;
  }
  // A place can also name a heading by its opening words: "§ Implementation
  // Status, end of …" for "## Implementation Status (March 2026)".
  if (!hit) {
    const head = asked.split(/[,:]/)[0].trim();
    hit = head ? heads.find((h) => norm(h.text).startsWith(`${head} `)) || null : null;
  }
  if (!hit) return null;
  const lines = text.split('\n');
  const next = heads.find((h) => h.line > hit.line && h.level <= hit.level);
  const end = next ? next.line - 1 : lines.length;
  const body = lines.slice(hit.line, end).join('\n').replace(/^\s*\n/, '').replace(/\s+$/, '');
  return { kind: 'section', heading: hit.text, level: hit.level, line: hit.line, end, text: body };
}

/**
 * What Loudon already said to an urgent proposal's ask on the board, the latest
 * answer `re:` its ask id: { option, notes, ts, id }, or null. LAND-NOW is his
 * yes to the words the ask quoted: the review lands it first, and it is paid
 * when it lands, not when he clicked. DECLINE, or a deny, declines it with his
 * note. REVIEW leaves it owed with the rest (Loudon, 2026-10-21).
 */
export function urgentAnswer(proposal, board = []) {
  if (!proposal || !proposal.urgent || !proposal.ask) return null;
  let hit = null;
  for (const m of board) {
    if (m && (m.type === 'RESOURCE_GRANT' || m.type === 'RESOURCE_DENY') && m.re === proposal.ask) hit = m;
  }
  if (!hit) return null;
  const p = hit.payload || {};
  const option = hit.type === 'RESOURCE_DENY' ? 'DECLINE' : String(p.option_id || 'LAND-NOW').toUpperCase();
  return { option, notes: typeof p.notes === 'string' ? p.notes.trim() : '', ts: hit.ts || null, id: hit.id || null };
}

/**
 * One page's review, read for a card: the group from proposalsByPage with each
 * item given `now`, the section it names as the page reads today (sectionNow),
 * or null when the page is new or the place names nothing it has; and
 * `answer`, what Loudon already said to an urgent one on the board
 * (urgentAnswer). The page is read once from the root the review runs on.
 */
export function pageReview(palaceRoot, group, { board = [] } = {}) {
  let text = '';
  if (group.path && group.exists) { try { text = readFileSync(join(palaceRoot, group.path), 'utf8'); } catch { text = ''; } }
  return { ...group, readable: !!text, items: group.items.map((p) => ({ ...p, now: text ? sectionNow(text, p.place) : null, answer: urgentAnswer(p, board) })) };
}

/** How many proposals are owed, on how many pages, how many urgent, and the oldest date. */
export function reviewCount(palaceRoot) {
  const pages = proposalsByPage(palaceRoot);
  const owed = pages.reduce((n, g) => n + g.items.length, 0);
  return {
    owed,
    pages: pages.length,
    urgent: pages.reduce((n, g) => n + g.urgent, 0),
    oldest: pages.length ? pages.map((g) => g.oldest).sort()[0] : null,
  };
}

/**
 * The one line a caller says about the review (reviewCount's numbers), in
 * plain words: "4 proposals for canon owed on 3 pages, the oldest from
 * 2026-10-20", with the urgent ones named first when there are any.
 */
export function reviewLine({ owed, pages, urgent, oldest }) {
  if (!owed) return 'No proposals for canon are owed.';
  const n = (k, one, many) => `${k} ${k === 1 ? one : many}`;
  const head = !urgent ? n(owed, 'proposal', 'proposals')
    : urgent === owed ? n(owed, 'urgent proposal', 'urgent proposals')
      : `${n(urgent, 'urgent proposal', 'urgent proposals')} and ${owed - urgent} more`;
  return `${head} for canon owed on ${n(pages, 'page', 'pages')}, the oldest from ${oldest}.`;
}
