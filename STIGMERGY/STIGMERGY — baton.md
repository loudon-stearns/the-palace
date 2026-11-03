---
title: "STIGMERGY — baton"
born: 2026-11-02
links:
  - target: "[[STIGMERGY]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[STIGMERGY]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

## Move

Fold [[BBS Design System]] into [[STIGMERGY]] by a [[Deposit Ceremony]]: STIGMERGY gains a short "The look" section and one sentence of lineage, the nine pages that point at the kit's page point at STIGMERGY instead, and the emptied page composts.

## Why this move matters

The Daily Page dealt [[BBS Design System]] on 2026-11-01, and the sit (2026-11-02) gave the verdict **fold**, on Loudon's yes. His read: the April 2026 kit is the origin of the whole palace front end, and the page does not add enough to stand alone. What it holds is the look of the thing STIGMERGY already is. The page itself says so: "The running app is [[STIGMERGY]]; this kit is its look" (`Palace development/BBS Design System.md`, § The Running App).

## Tried and rejected

Two lines in the page's forward vector are dropped, not carried:

- **"Trickster channel glowing gold."** No gold token exists in the kit or the app. A search for `gold` in `_ops/stigmergy/design-system/*.md`, `colors_and_type.css` and `_ops/stigmergy/app/src/styles/tokens.css` finds nothing.
- **"Agent health visible."** Every message on the persistent board scores green (1,183 of 1,183 lines on 2026-11-02, `_ops/swarm/persistent/blackboard.jsonl`), so health shown as colour would show nothing.

## Current state

Nothing of the fold is written yet. One thing has: the morning's game, **Find the Ask**, is kept at `STIGMERGY/proofs/2026-11-01-find-the-ask/` (`find-the-ask.html` with its fonts). It is the evidence for the "colour is a signal" rule.

What the game is: a timed hunt on nine real 24-line windows of the persistent board, one ask (`RESOURCE_REQUEST`) or `FLAG` per window, in three dresses over three rounds each. MONO is all phosphor. RESERVED is cyan handles, the ask lit gold and the `FLAG` amber. RAINBOW gives each agent its own hue. Mean, best and last times:

- reserved 47.4 / 12.4 / 1.7 s, 14 misses
- rainbow 52.4 / 16.9 / 14.3 s, 7 misses
- mono 26.6 / 5.0 / 14.4 s, 0 misses

The shuffle put two reserved rounds first, while the game was still being learned, and the misses were unclear instructions. Once it was learned, the one reserved round took 1.7 s, and rainbow never beat mono. One player, nine rounds: a good sign, not proof.

## Next move

A later session, not a morning, runs the [[Deposit Ceremony]] on this map. The final text is shown to Loudon before it lands: STIGMERGY is canonical, and it has no permanent steward (no match in `_ops/agents/permanent/REGISTRY.json`, checked 2026-11-02).

1. **STIGMERGY.md gains "The look"**, short, carrying:
   - The name rule: STIGMERGY in all UI copy; "BBS Blackboard" is internal only.
   - The non-negotiables in brief. Phosphor `#33ff66` on `#050a06` with bloom. VT323 banners and IBM Plex Mono body on 1ch x 1.4em cells. 80ch. CSS borders that evoke CP437, radius 0. `steps()` motion only. Colour reserved as signal: amber FLAGS, red errors and DENY, cyan handles. The .NFO voice: lowercase body, no em dashes, no emoji.
   - The kit's own line, "the aesthetic follows the architecture" (`_ops/stigmergy/design-system/README.md:13`).
   - Pointers to the kit's `SKILL.md` and `README.md` in `_ops/stigmergy/design-system/`.
   - That the app's `tokens.css` is a hand-kept mirror of `colors_and_type.css`, not an import, and why: the kit's woff2 paths 403 under Vite and its CDN URLs are stale (`_ops/stigmergy/app/src/styles/tokens.css`, header comment).
   - The proof above, cited as the evidence that colour is a signal.
   - Whether the deferred curses path (a headless or SSH build, considered and unbuilt) gets a line or is let go is the deposit's call.
2. **STIGMERGY's Lineage gains one sentence**: the April 2026 kit was the palace's first design system, and the grammar that [[Drafting Table Design System]] and [[Loudon Live]]'s Worn Broadcast look grew from.
3. **Repoint the inbound links** to STIGMERGY, or to STIGMERGY § The look. There are nine of them: [[The Lens]], [[Speak Like a Person, Log Like a Protocol]], [[The Reader's Context Window]], [[Semantic Webcam]], [[STIGMERGY Philosophical Lenses]], [[Shop/Maker|Maker]], [[Loudon Live Design System]], [[BBS Blackboard]], [[Drafting Table Design System]]. Then the body mentions: Drafting Table § Which dress table; the Maker cascade table, l.167 and l.179; Loudon Live Design System l.139, 211, 240–252, 287 and 299. The Loudon Live comparison table keeps its contrast, aimed at STIGMERGY's look. A `git grep "BBS Design System"` on 2026-11-02 also finds [[LDN RTM]], [[The Scroll]], [[Substrate Skill]], STIGMERGY.md itself, [[STIGMERGY — Context]], [[Maker — Context]] and `_ops/stigmergy/about/README.md`; check each one. Archive and swarm-session files are history and stay as they are.
4. **Then BBS Design System composts**: the [[Spore Check Ceremony]]'s composting note, `stage: composting`, and the next Weave confirms. Its hero and icon go with it, or to Archive, as the rite says.

**Open, for Loudon to decide: a signal colour for the TRICKSTER board.** He picked red in the game. Red is already errors and DENY in the kit, so the two would clash. Name the clash and let him choose; don't settle it in the deposit.

## Load these files first

`Palace development/BBS Design System.md` · `STIGMERGY.md` · `_ops/stigmergy/design-system/README.md` and `SKILL.md` · `_ops/stigmergy/app/src/styles/tokens.css` (header) · `STIGMERGY/proofs/2026-11-01-find-the-ask/find-the-ask.html` (play it, don't edit it) · [[Deposit Ceremony]] · [[Spore Check Ceremony]]

## On pickup (fixed — the catcher's checklist; do not rewrite per session)
*Identical in every baton. It rides along because the catching Claude loads the
baton and the entry, not this ceremony — so the catcher's obligations live where
the catcher will see them. Omit nothing here.*
A pickup has two beats: **claim** it when you catch it, **close** it when the move lands. The card stays visible in between — a claim that ages with no close is how a dropped baton (a "fumble") surfaces instead of vanishing. (A parent-entry baton that was never announced on the board has no card; skip the board posts — just remove the pointer and delete the file at close, step 8.)

**Catch it — claim:**
1. State the move back in one sentence. If you can't, the baton wasn't caught — stop and ask Loudon.
2. Check it may already be done before you commit to it. The baton is a snapshot from when it was written; the project may have moved past it. Re-read the parent entry and `git log` it since the baton's `born` date, and confirm the "Current state" the baton quotes still matches the file. For a board-announced baton, `node _ops/stigmergy/pickup-handoff.mjs <id>` prints exactly this reconciliation view — every commit that touched the entry since the baton posted — and then claims the card, so run it and read the list *before* you continue. If the move is already done, superseded, or no longer wanted, STOP — do not claim it; surface to Loudon, and if it plainly landed already, close it as a reconciler (step 7). A stale baton followed silently produces drift. (The auto-staleness heuristic is off by design — the freshness call is yours.)
3. If this baton or its board line is still uncommitted, commit them first. That commit is the git archive step 8 relies on.
4. Claim it. For a board-announced baton (it shows in `list-handoffs`), the `pickup-handoff.mjs` from step 2 has already posted the claim (`handoff_picked_up`, `lifecycle: claim`) — the card moves to **CLAIMED (in flight)**; it does *not* leave the board. Leave the "Active Baton" pointer and the baton file in place for now — they come out at close, so a fumble mid-move never erases the work.
5. If the baton names a receiving-surface capability delta or a worktree coordinate, confirm it holds before relying on it — for a worktree, check `git worktree list` and recreate it (`node _ops/worktree/new-worktree.mjs --name <branch> --profile <p>`) if it is gone. A build that was supposed to run here but can't is a finding to report, not a failure to hide.
6. Act on the move, holding the calibrations above.

**Close it — when the move lands:**
7. Post the close. `node _ops/stigmergy/close-handoff.mjs <id | entry> --commit <hash>` retires the card — an explicit close is the *only* thing that clears it (done is never inferred). Cite the commit that landed the move: it makes the close a checkable claim, not a self-report. **Complete, or re-baton the rest:** if you finished the whole move, close plain; if you did only part, `--partial --remainder "<what's left>"` posts the leftover as a fresh `handoff_ready` so it reappears as open work. Never let "in the spirit of the original" quietly drop scope — a gap becomes a new baton, not silence.
8. Delete the baton file (git is its archive) and remove the "Active Baton" section from the parent entry. Steward batons are the exception — updated in place, never deleted or closed, until their page ends and the steward leaves stewardship.
