// steward-watch.mjs — a baton and a steward on one project, each seeing the other.
//
// [[Two Batons, One Board]]: a hand-written baton and a steward are one atom in
// two forms, and when both work one project at the same time they must not be
// blind to each other (BLUELINE, 2026-11-04 to 11-07: the steward built the
// baton's item 1 and filed it as a proposal; nothing told the baton's card).
// This module is the read side both halves share:
//
//   - activeSteward    — is the entry stewarded? (REGISTRY.json + its runtime dir)
//   - stewardCommitsSince — the steward's commits since a point (git, never a copy)
//   - owedProposalsFor — the canon edits the steward has filed and Loudon has not
//                        settled (its tuning ledger), for the one-route check
//   - activeCardsFor   — the entry's OPEN or CLAIMED handoff cards (the one fold)
//   - stewardNotesOn   — what steward cycles posted against a card
//   - stewardCycleNote — the REPLY a shipped steward cycle posts against an
//                        active card on its page (process-cycle.js)
//   - projectSince     — every commit on a project since a point: the entry, its
//                        bundle, its steward's runtime (project-since.mjs)
//
// Read-only except stewardCycleNote, which only builds a message; the caller
// posts it. Nothing here closes, claims or edits a baton: a steward writes only
// its workshop, its scroll and its tuning ledger (ELDER § Age and its limits).
// The note is a board line, which every steward cycle already writes.

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative } from 'node:path';
import { foldHandoffs } from './handoff-model.mjs';
import { tuningPathFor, parseProposals } from './orchestrator/src/ledger.js';
import { resolveBundleDir } from './orchestrator/src/entry-paths.js';

/** The payload kind a steward cycle's note against a handoff card carries. Not a new message type: a REPLY convention, as handoff_ready is a BROADCAST one. */
export const STEWARD_CYCLE_KIND = 'handoff_steward_cycle';

const eqi = (a, b) => String(a || '').toLowerCase() === String(b || '').toLowerCase();

// Every GIT_* the caller carries is dropped, so a run under a hook asks the
// repo named here rather than whatever GIT_DIR points at.
const GIT_ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_')));
function git(root, args) {
  try {
    return execFileSync('git', args, {
      cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
      env: { ...GIT_ENV, GIT_OPTIONAL_LOCKS: '0' }, stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch { return null; }
}

/**
 * The entry's active steward, or null. Active means registered in
 * `_ops/agents/permanent/REGISTRY.json` with `home` the entry, and its runtime
 * dir still on disk (the leaving rite deletes both). Matching ignores case, as
 * resolveCard does for an entry name.
 * @returns {{ agent_id: string, home: string, dir: string }|null}
 */
export function activeSteward(root, entry) {
  if (!entry) return null;
  let reg;
  try { reg = JSON.parse(readFileSync(join(root, '_ops/agents/permanent/REGISTRY.json'), 'utf8')); } catch { return null; }
  const a = (Array.isArray(reg && reg.agents) ? reg.agents : []).find((x) => x && eqi(x.home, entry));
  if (!a || !a.dir || !existsSync(join(root, a.dir))) return null;
  return { agent_id: a.agent_id || a.home, home: a.home, dir: a.dir };
}

/** A baton file's `born:` (YYYY-MM-DD), or null when the file or the field is missing. */
export function batonBorn(root, handoffPath) {
  if (!handoffPath) return null;
  let text;
  try { text = readFileSync(join(root, handoffPath), 'utf8'); } catch { return null; }
  const fm = /^---\n([\s\S]*?)\n---/.exec(text);
  const m = fm && /^born:\s*["']?(\d{4}-\d{2}-\d{2})/m.exec(fm[1]);
  return m ? m[1] : null;
}

/**
 * Where "since the baton was born" starts for a card: the earlier of the baton
 * file's `born:` and the card's own post. A remainder card is posted at each
 * partial close while its baton file lives on, so the card's time alone would
 * hide what happened under the same baton before it (the BLUELINE case).
 * @returns {{ since: string, from: 'baton'|'card' }}
 */
export function cardSince(root, card) {
  const born = batonBorn(root, card && card.p && card.p.handoff_path);
  const ts = card && card.m && card.m.ts;
  if (born && (!ts || Date.parse(born) < Date.parse(ts))) return { since: born, from: 'baton' };
  return { since: ts || born, from: 'card' };
}

function logLines(out) {
  return String(out || '').trim().split('\n').filter(Boolean).map((l) => {
    const [hash, date, ...rest] = l.split('\t');
    return { hash, date, subject: rest.join('\t') };
  });
}

/**
 * The steward's commits since `since`: commits to its runtime dir whose
 * subject is a steward's (`steward(<home>): cycle N — …`, or the heartbeat's
 * sweep), newest first. Read from git on `root`, never from a copy.
 */
export function stewardCommitsSince(root, steward, since) {
  if (!steward || !steward.dir) return [];
  const args = ['log', '--format=%h%x09%cs%x09%s', '--grep=^steward(', ...(since ? [`--since=${since}`] : []), '--', steward.dir];
  return logLines(git(root, args));
}

/** The steward's proposals for canon still owed in its tuning ledger: [{ n, page, place, date }]. */
export function owedProposalsFor(root, home) {
  let path;
  try { path = tuningPathFor(root, home); } catch { path = null; }
  if (!path) return [];
  let text = '';
  try { text = readFileSync(path, 'utf8'); } catch { return []; }
  return parseProposals(text).filter((p) => p.owed).map((p) => ({ n: p.n, page: p.page, place: p.place, date: p.date, ledger: relative(root, path) }));
}

/** The entry's OPEN and CLAIMED handoff cards, folded from the board by the one fold (handoff-model.mjs). */
export function activeCardsFor(board, entry) {
  const fold = foldHandoffs(board || []);
  return [...fold.open, ...fold.claimed].filter((c) => eqi(c.p && c.p.entry, entry));
}

/** The notes steward cycles posted against one card, oldest first. */
export function stewardNotesOn(board, cardId) {
  return (board || []).filter((m) => m && m.re === cardId && m.payload && m.payload.kind === STEWARD_CYCLE_KIND);
}

/**
 * The REPLY a shipped steward cycle posts against an active handoff card on its
 * own page: which cycle shipped, the messages it posted, the canon edits it
 * filed this cycle (each its ledger item), and the card's move, so the catcher
 * reads it at pickup and the steward reads it back on its next cycle (its own
 * line). It does not say the cycle advanced the move: the code cannot know
 * that; the catcher decides. When an item here and a baton item are the same
 * change, the one route is to say so on both and settle it once.
 *
 * The payload deliberately has no `proposed_edits`, `page_edits` or
 * `artifacts`, so the scroll never counts the note as a made thing.
 */
export function stewardCycleNote({ card, home, cycleN, tsNow, sessionId, health, posted = [], proposals = [], stamp }) {
  const id = `${slug(home)}-cycle-${cycleN}-on-${slug(card.m.id).slice(0, 60)}-${stamp || compact(tsNow)}`;
  const items = proposals.map((p) => ({ item: p.item != null ? String(p.item) : null, page: p.page || null, place: p.place || null }));
  const itemWords = items.length
    ? ` It filed ${items.map((x) => `item ${x.item ?? '?'} (${x.page || '?'})`).join(', ')} in its tuning ledger, owed until Loudon's review; if a baton item is the same change, say so on both and settle it once.`
    : '';
  return {
    schema_version: '1.0',
    id,
    ts: tsNow || new Date().toISOString(),
    session_id: sessionId || `steward-${slug(home)}`,
    from: home,
    to: '*',
    type: 'REPLY',
    board: 'GENERAL',
    re: card.m.id,
    health,
    payload: {
      kind: STEWARD_CYCLE_KIND,
      entry: home,
      handoff_id: card.m.id,
      handoff_state: card.state,
      cycle: cycleN,
      posted: posted.slice(0, 20),
      proposals: items,
      move: card.p && card.p.move,
      note: `${home}'s steward shipped cycle ${cycleN} while this baton is ${card.state === 'claimed' ? 'claimed' : 'open'}. Check whether it moved any item of the baton before acting on it.${itemWords}`,
    },
  };
}

/**
 * Every commit on a project since `since` (a date, an ISO time or a commit):
 * its entry file, its bundle, and its steward's runtime, newest first. This is
 * the check before a status claim ("still waiting", "nothing has moved").
 * @returns {{ entryFile, bundleDir, steward, since, commits: [{hash,date,subject}], paths: string[] } | { error }}
 */
export function projectSince(root, entry, since) {
  let b = null;
  try { b = resolveBundleDir(root, entry); } catch { b = null; }
  if (!b) return { error: `no entry named "${entry}" under ${root}` };
  const steward = activeSteward(root, entry);
  const paths = [relative(root, b.entryFile), relative(root, b.bundleDir), ...(steward ? [steward.dir] : [])];
  let range = [];
  if (since) {
    const isCommit = /^[0-9a-f]{6,40}$/i.test(since) && git(root, ['cat-file', '-t', since]) && git(root, ['cat-file', '-t', since]).trim() === 'commit';
    range = isCommit ? [`${since}..HEAD`] : [`--since=${since}`];
  }
  const out = git(root, ['log', '--format=%h%x09%cs%x09%s', ...range, '--', ...paths]);
  if (out == null) return { error: `git could not read the log in ${root}` };
  return { entryFile: b.entryFile, bundleDir: b.bundleDir, steward, since: since || null, commits: logLines(out), paths };
}

export function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x';
}
function compact(ts) {
  const d = ts ? new Date(ts) : new Date();
  return (Number.isNaN(d.getTime()) ? new Date() : d).toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
}
