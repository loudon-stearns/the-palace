// leave.js — how a project leaves stewardship (Loudon, 2026-10-21).
//
// A steward leaves when its page ends; it never decides the end. A page has
// ended when it is finished (`status: complete` or `archived`) or composting (a
// folded page composts once its fold has crossed) — pageEnded in batch-due.js.
// A page set down to rest (`stage: dormant`) keeps its steward: that is a
// pause, and the Revival Ceremony is its way back.
//
// Leaving settles what the steward left standing, then ends it:
//   - each open ask, answered by Loudon on the deck (a deny with one line);
//   - each proposal for canon still owed, taken in or declined at the ledger
//     review (ledger-review.js);
//   - the Plan, closed with a paragraph Loudon agrees, logged on the trail
//     like any plan change (applyPlan);
//   - the scroll, which stays, with one last entry on its trail;
//   - the runtime (`_ops/agents/permanent/<slug>/`), taken off the registry and
//     deleted. It is the steward's baton, updated in place while the move went
//     on; now the move has ended it goes the way a caught baton goes, and git
//     is its archive.
//
// leavingCheck reads what still stands in the way; leaveStewardship acts only
// when nothing does. Canon: [[Project Stewardship System]].

import { existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { readRegistry, findAgent, deregisterAgent } from './registry.js';
import { resolveBundleDir } from './entry-paths.js';
import { parseFrontmatter } from './entry-frontmatter.js';
import { reconcilePendingRequests } from './process-cycle.js';
import { parseProposals } from './ledger.js';
import { pageEnded } from './batch-due.js';
import { MARK, readPlan, applyPlan, existingEntryIds, localIso, PLAN_PLACEHOLDER } from './scroll-file.js';

const REGISTRY_REL = '_ops/agents/permanent/REGISTRY.json';

/** A Plan that holds words of its own, not the placeholder a new scroll starts with. */
const hasPlan = (plan) => !!String(plan || '').trim() && String(plan).trim() !== PLAN_PLACEHOLDER.trim();
/** The closing paragraph leaveStewardship gives a Plan: `**Left stewardship, <date>.** …`. */
const CLOSED_RE = /\*\*Left stewardship, \d{4}-\d{2}-\d{2}\.\*\*/;

/**
 * What stands between a steward and leaving: { home, page, ended, steward,
 * asks, proposals, scroll, blockers }. `blockers` are plain sentences, empty
 * when the rite may act. A closing paragraph for the Plan (`planClose`)
 * answers the Plan's blocker. `board` is every message on the persistent board.
 */
export function leavingCheck({ palaceRoot, home, board = [], planClose = '' }) {
  const blockers = [];
  const bundle = resolveBundleDir(palaceRoot, home);
  const entryText = bundle ? (() => { try { return readFileSync(bundle.entryFile, 'utf8'); } catch { return ''; } })() : '';
  const fm = entryText ? parseFrontmatter(entryText) : {};
  const page = bundle ? { path: relative(palaceRoot, bundle.entryFile), status: fm.status || null, stage: fm.stage || null } : null;
  if (!page) blockers.push(`No page is titled "${home}".`);

  const ended = page ? pageEnded(fm) : null;
  if (page && !ended) {
    blockers.push(fm.stage === 'dormant'
      ? `${home} is resting (stage: dormant), not ended: a resting page keeps its steward, and wakes by the Revival Ceremony.`
      : `${home} has not ended (status: ${fm.status || 'none'}, stage: ${fm.stage || 'none'}). A steward leaves when its page ends — finished, archived or composting — and never decides the end.`);
  }

  const registry = readRegistry(join(palaceRoot, REGISTRY_REL));
  const agent = findAgent(registry, home) || null;
  const dir = agent ? agent.dir : null;
  const steward = { registered: !!agent, dir, exists: !!(dir && existsSync(join(palaceRoot, dir))) };
  if (!steward.registered && !steward.exists) blockers.push(`${home} has no steward to retire.`);

  const asks = reconcilePendingRequests(board, home).stillPending
    .map((a) => ({ request_id: a.request_id, topic: a.decision_topic || a.resource || '', blocking: a.blocking, posted_at: a.posted_at }));
  if (asks.length) blockers.push(`${asks.length} open ask${asks.length === 1 ? '' : 's'} on the board: answer each on the deck first (a deny with one line, "left stewardship: <why>").`);

  const ledger = bundle ? join(bundle.bundleDir, `${home} — tuning.md`) : null;
  const proposals = ledger && existsSync(ledger) ? parseProposals(readFileSync(ledger, 'utf8')).filter((p) => p.owed).map((p) => ({ n: p.n, page: p.page, place: p.place })) : [];
  if (proposals.length) blockers.push(`${proposals.length} proposal${proposals.length === 1 ? '' : 's'} for canon still owed in its tuning ledger: settle each at the ledger review first.`);

  const scrollAbs = bundle ? join(bundle.bundleDir, `${home} — scroll.md`) : null;
  const scrollText = scrollAbs && existsSync(scrollAbs) ? readFileSync(scrollAbs, 'utf8') : '';
  const plan = scrollText ? readPlan(scrollText) : '';
  const scroll = { path: scrollAbs ? relative(palaceRoot, scrollAbs) : null, exists: !!scrollText, plan: hasPlan(plan) && !CLOSED_RE.test(plan) };
  if (scroll.plan && !String(planClose || '').trim()) blockers.push('Its scroll has a Plan: it needs a closing paragraph Loudon agrees, saying what became of each open move (carried, let go, or kept for a revival).');

  return { home, page, ended, steward, asks, proposals, scroll, blockers };
}

/** The scroll's last trail entry: when it left, why, and where its runtime went. */
export function leftSection({ id, date, why, dir }) {
  return [
    `<!-- scroll:entry id="${id}" -->`,
    `### ${date} — Left stewardship: ${why}`,
    '',
    `The steward is retired. Its runtime${dir ? `, \`${dir}/\`,` : ''} is off the registry and deleted; git keeps it, and a revival can read its history back from the commit that removed it.`,
    `<sub>\`${id}\` · left stewardship · on Loudon's word</sub>`,
    '<!-- /scroll:entry -->',
  ].join('\n');
}

/**
 * Retire a steward whose page has ended, once leavingCheck finds nothing in the
 * way: close the Plan with Loudon's paragraph (logged on the trail), add the
 * scroll's last entry, take the steward off the registry and delete its
 * runtime. `why` says the end in a few words ("finished", "folded into
 * [[X]]"). Returns { left, changed, check } — `changed` the palace-relative
 * paths written or removed, for the commit — or { left: false, check } when a
 * blocker stands.
 */
export function leaveStewardship({ palaceRoot, home, board = [], why = '', planClose = '', ts = localIso() }) {
  const check = leavingCheck({ palaceRoot, home, board, planClose });
  if (check.blockers.length) return { left: false, check };
  const date = ts.slice(0, 10);
  const reason = String(why || '').replace(/\s+/g, ' ').trim() || check.ended.sentence.replace(/^it is /, '');
  const changed = [];

  if (check.scroll.exists) {
    const abs = join(palaceRoot, check.scroll.path);
    let text = readFileSync(abs, 'utf8');
    if (check.scroll.plan) {
      const closed = `${readPlan(text)}\n\n**Left stewardship, ${date}.** ${String(planClose).trim()}`;
      const r = applyPlan(text, { plan: closed, headline: 'closed: the project left stewardship', why: `Loudon, ${date}: ${reason}.`, by: 'Loudon', ts });
      if (r.applied) text = r.text;
    }
    const base = `left-stewardship-${date}`;
    const have = existingEntryIds(text);
    if (!have.has(base)) {
      const at = text.indexOf(MARK.makingStart);
      if (at >= 0) {
        const cut = at + MARK.makingStart.length;
        text = `${text.slice(0, cut)}\n${leftSection({ id: base, date, why: reason, dir: check.steward.dir })}\n${text.slice(cut)}`;
      }
    }
    writeFileSync(abs, text);
    changed.push(check.scroll.path);
  }

  if (check.steward.registered) {
    deregisterAgent(join(palaceRoot, REGISTRY_REL), home);
    changed.push(REGISTRY_REL);
  }
  if (check.steward.exists) {
    const abs = resolve(palaceRoot, check.steward.dir);
    // Only ever a folder under the permanent agents' own directory.
    if (!abs.startsWith(resolve(palaceRoot, '_ops/agents/permanent') + '/')) throw new Error(`leaveStewardship: refusing to delete ${check.steward.dir}, outside _ops/agents/permanent/`);
    rmSync(abs, { recursive: true });
    changed.push(check.steward.dir);
  }
  return { left: true, changed, check };
}
