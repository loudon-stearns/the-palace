#!/usr/bin/env node
// pickup-handoff.mjs — CLAIM a handoff (catch the baton, start the work).
//
// Rung 1 of the Reliable Handoff ladder splits "I've got it" from "it's done."
// This is the first half: posting a claim (handoff_picked_up, lifecycle: claim)
// moves the card from OPEN to CLAIMED. It does NOT retire the card — the work
// isn't done yet, and a claim that ages with no close is exactly the fumble we
// want visible. When the move actually lands, close it:
//
//     node _ops/stigmergy/close-handoff.mjs <id | entry> --commit <hash>
//
// Before it claims, it prints a reconciliation view — every commit that touched
// the entry since the baton was posted — because the move may already have
// landed ([[Baton Ceremony]] § On pickup: "this may already be done; check
// before continuing"). Read that list before you commit to the work.
//
// When the entry has an active steward (_ops/agents/permanent/<slug>/, on
// REGISTRY.json), it says so and lists the steward's commits since the baton was
// born, the notes its cycles posted against this card, and the canon edits it
// has filed and Loudon has not settled ([[Two Batons, One Board]]; steward-watch.mjs).
//
// Beside it, Loudon's open review notes on the entry: the REVIEW NOTE cards the QUEUE
// holds for it, from a rich face's dock or as answers from a rough ([[Review Layer]]),
// read through the QUEUE's own fold (read-answers.mjs openReviews). Read-only: the
// pickup never answers a card. Work on a page begins by reading them.
//
// Usage:
//   node _ops/stigmergy/pickup-handoff.mjs <handoff-id | entry-name>
//   node _ops/stigmergy/pickup-handoff.mjs BLUELINE --note "caught on feature/x; move confirmed still needed"
//   node _ops/stigmergy/pickup-handoff.mjs <id> --dry-run     # show the claim, write nothing
//
// Flags:
//   --from <page>     who is catching it (default: the handoff's entry)
//   --surface <text>  receiving_surface note (default: "Claude Code (Mac)")
//   --note <text>     free-text note on the claim + health metadata
//   --model <id>      health.model (default: the latest Opus, _ops/models/latest-opus.mjs)
//   --board <path>    board file override (default: owner persistent board)
//   --root <path>     the checkout to read git, the registry and ledgers from (default: the owner)
//   --dry-run         print the claim + reconciliation view; do not post

import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import {
  ownerRoot, boardPath, loadBoard, foldHandoffs, resolveCard,
  postMessage, slug, stamp, stubHealth, C,
} from './handoff-model.mjs';

// --- args -------------------------------------------------------------------
const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--dry-run') { flags.dryRun = true; continue; }
  if (a.startsWith('--')) { flags[a.slice(2)] = argv[++i]; continue; }
  positional.push(a);
}
const selector = positional[0];

function die(msg) { console.error(`${C.Rd}✗ ${msg}${C.R}`); process.exit(1); }

if (!selector) {
  die('usage: node _ops/stigmergy/pickup-handoff.mjs <handoff-id | entry-name> [--note "..."] [--dry-run]');
}

const ROOT = flags.root ? resolve(flags.root) : ownerRoot();
const board = boardPath(flags.board);
const fold = foldHandoffs(loadBoard(board));
const res = resolveCard(fold, selector);

if (res.closed && res.closed.state === 'retracted') {
  const by = (res.closed.close.payload || {}).superseded_by;
  console.log(`${C.G}✓ retracted${C.R} — ${C.B}${res.closed.p.entry}${C.R} (${res.closed.m.id}) was withdrawn${by ? `; see ${by}` : ''}. Nothing to claim.`);
  process.exit(0);
}
if (res.closed) {
  console.log(`${C.G}✓ already closed${C.R} — ${C.B}${res.closed.p.entry}${C.R} (${res.closed.m.id}) is retired. Nothing to claim.`);
  process.exit(0);
}
if (res.error) die(res.error);

const card = res.card;
const p = card.m.payload;

if (card.state === 'claimed') {
  const who = (card.claim && card.claim.from) || '?';
  console.log(`${C.Y}◐ already claimed${C.R} — ${C.B}${p.entry}${C.R} is in flight (claimed by ${who}). Re-claiming; close it when the move lands.\n`);
}

// --- reconciliation heads-up: what changed on the entry since the baton? -----
console.log(`${C.B}CLAIMING${C.R} ${C.B}${p.entry}${C.R}  ${C.D}(${card.m.id})${C.R}`);
if (p.move) console.log(`  move: ${p.move}`);
if (p.handoff_path) console.log(`  baton: ${p.handoff_path}`);
console.log('');

if (p.entry) {
  let hist = '';
  try {
    hist = execSync(
      `git -C "${ROOT}" log --since="${card.m.ts}" --format="%h %cs %s" -- "*${p.entry}*"`,
      { encoding: 'utf8' },
    ).trim();
  } catch { /* ignore */ }
  if (hist) {
    console.log(`${C.Y}⚠ commits touched "${p.entry}" since this baton was posted — the move may already have landed:${C.R}`);
    for (const l of hist.split('\n').slice(0, 8)) console.log(`  ${C.D}${l}${C.R}`);
    console.log(`  ${C.D}→ confirm the move still needs doing before you continue (Baton Ceremony § On pickup).${C.R}`);
  } else {
    console.log(`${C.D}no commits have touched "${p.entry}" since the baton was posted — likely still fresh.${C.R}`);
  }
  console.log('');
}

// --- a steward on the same project (read-only) --------------------------------
// [[Two Batons, One Board]]: a baton and a steward working one project at once
// must each see what the other did. If the entry has an active steward, say so,
// list its commits since the baton was born, the notes its cycles posted against
// this card, and the canon edits it has filed and Loudon has not settled — one of
// those may be a baton item already (one route per edit: say so on both, settle it once).
if (p.entry) {
  try {
    const { activeSteward, cardSince, stewardCommitsSince, stewardNotesOn, owedProposalsFor } = await import('./steward-watch.mjs');
    const st = activeSteward(ROOT, p.entry);
    if (st) {
      const { since, from: sinceFrom } = cardSince(ROOT, card);
      const commits = stewardCommitsSince(ROOT, st, since);
      const notes = stewardNotesOn(loadBoard(board), card.m.id);
      const owed = owedProposalsFor(ROOT, st.home);
      const sinceLabel = sinceFrom === 'baton' ? `since the baton was born (${since})` : `since the card was posted (${String(since).slice(0, 10)})`;
      console.log(`${C.Y}⚑ "${p.entry}" has an active steward (${st.agent_id}, ${st.dir}). It may have moved this baton's items.${C.R}`);
      if (commits.length) {
        console.log(`  its commits ${sinceLabel}:`);
        for (const c of commits.slice(0, 12)) console.log(`  ${C.D}${c.hash} ${c.date} ${c.subject.slice(0, 110)}${C.R}`);
        if (commits.length > 12) console.log(`  ${C.D}… and ${commits.length - 12} more (git log -- ${st.dir})${C.R}`);
      } else {
        console.log(`  ${C.D}no steward commits ${sinceLabel}.${C.R}`);
      }
      if (notes.length) {
        console.log(`  its cycles posted ${notes.length} note${notes.length === 1 ? '' : 's'} against this card:`);
        for (const n of notes.slice(-6)) console.log(`  ${C.D}${String(n.ts).slice(0, 10)} cycle ${n.payload.cycle}: ${(n.payload.proposals || []).map((x) => `item ${x.item} (${x.page})`).join(', ') || 'no proposals'}${C.R}`);
      }
      if (owed.length) {
        console.log(`  its proposals for canon, owed until Loudon's ledger review (${owed[0].ledger}):`);
        for (const o of owed.slice(0, 8)) console.log(`  ${C.D}item ${o.n} · ${o.date} · ${o.page}${o.place ? ` — ${o.place.slice(0, 70)}` : ''}${C.R}`);
        console.log(`  ${C.D}→ if a baton item is one of these, it is one change: say so on the baton and in the ledger, and settle it once.${C.R}`);
      }
      console.log(`  ${C.D}→ the close will be addressed to ${st.agent_id}, so its next cycle reads what landed.${C.R}`);
      console.log('');
    }
  } catch (e) {
    console.log(`${C.D}steward check: unavailable — ${e.message}${C.R}\n`);
  }
}

// --- Loudon's open review notes on the entry (read-only) ----------------------
if (p.entry) {
  try {
    const { readFileSync } = await import('node:fs');
    const { openReviews, reviewMessages, showOpen } = await import('../loudon-eval/read-answers.mjs');
    const open = openReviews(reviewMessages(readFileSync(board, 'utf8')), { page: p.entry });
    if (open.length) {
      console.log(`${C.Y}◇ Loudon has open review notes on "${p.entry}" — read them before the move:${C.R}`);
      for (const r of open) console.log(showOpen(r, { width: 160 }).split('\n').map((l) => `  ${l}`).join('\n'));
      console.log(`  ${C.D}→ whole: node _ops/loudon-eval/read-answers.mjs --page "${p.entry}" --open · the commit that takes one up says so${C.R}`);
    } else {
      console.log(`${C.D}no open review notes from Loudon on "${p.entry}".${C.R}`);
    }
  } catch (e) {
    console.log(`${C.D}open review notes: unavailable — ${e.message}${C.R}`);
  }
  console.log('');
}

// --- build the claim --------------------------------------------------------
const note = flags.note || 'Baton caught; starting the move. Will post a close (handoff_closed) when it lands.';
const msg = {
  schema_version: '1.0',
  id: `claim-${slug(p.entry || selector)}-${stamp()}`,
  ts: new Date().toISOString(),
  session_id: flags.from ? slug(flags.from) : `claim-${slug(p.entry || selector)}`,
  from: flags.from || p.entry || 'COORDINATOR',
  to: '*',
  type: 'REPLY',
  board: 'GENERAL',
  re: card.m.id,
  health: stubHealth(flags.model, note),
  payload: {
    kind: 'handoff_picked_up',
    lifecycle: 'claim',                 // marks this a lifecycle-v1 claim, not a legacy terminal pickup
    entry: p.entry,
    handoff_id: card.m.id,
    handoff_path: p.handoff_path,
    receiving_surface: flags.surface || 'Claude Code (Mac)',
    move: p.move,
    note,
  },
};

if (flags.dryRun) {
  console.log(`${C.D}--dry-run — would post (nothing written):${C.R}`);
  console.log(JSON.stringify(msg, null, 2));
  process.exit(0);
}

try {
  postMessage(board, msg);
} catch (e) {
  die(e.message);
}
console.log(`${C.Y}◐ claimed${C.R} — ${C.B}${p.entry}${C.R} is in flight (re: ${card.m.id}). It stays on the board until you close it.`);
console.log(`${C.D}  When the move lands: node _ops/stigmergy/close-handoff.mjs ${card.m.id} --commit <hash>${C.R}`);
