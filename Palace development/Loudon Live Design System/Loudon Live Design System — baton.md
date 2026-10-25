---
title: "Loudon Live Design System — baton"
born: 2026-10-14
links:
  - target: "[[Loudon Live Design System]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Loudon Live Design System]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
session_thread: "The Daily Page, 2026-10-14 (Loudon Live dealt), a commissioning baton. Rewritten 2026-10-25 at the partial close of the look rethink to carry only the remainder (board: loudon-live-design-system-remainder-20261025T151130Z)."
---

# Baton: Loudon Live Design System

## Move

Bring the design system's text up to the 2026-10-14 portrait of Loud'n Live in `Projects/Loudon Live.md`, in small, plain edits shown to Loudon before writing. And ask him whether Drafting Table's own "Never cyan" goes too.

## Why this move matters

The look rethink this baton first carried is done. On 2026-10-25 Loud'n Live got three complete looks of its own (Worn Broadcast, Cyanotype, Night Signal), "no cyan" was retired in this system, and Loudon called the set complete: *"that is all the looks we need we can close this out"* (commits `3c817503`, `9a7f3d18`, `42dc4091`; the calls, in his words, are in the workshop README's Decisions). The text side never moved. Every visual agent reads `SKILL.md`, and it still describes the old Loud'n Live.

## Current state

`Projects/Loudon Live.md` is the current portrait ("When another page disagrees with this one, this one is current"). Loud'n Live is his professional persona and his teaching and coaching face, online and in person, starting soon as YouTube videos and livestreams for electronic musicians, and a moving target. The audience is "electronic musicians, to start." [[Autodidact Polymaths]] stands, in the background. Keep the Amber Lab "autodidact polymaths" line.

These still teach the old portrait (line numbers as of `42dc4091`):

- `_ops/loudon-live/design-system/SKILL.md:9`: "Loudon Live is Loudon's public self — streams and builds, the RTM series, the palace in public, his music". The most urgent line.
- `_ops/loudon-live/design-system/README.md:3`: the same "public self" opening. `:7`: "**Audience:** Autodidact Polymaths". `:193` § Naming the audience is built on that term.
- `Palace development/Loudon Live Design System.md:158` § Naming the audience, the README's mirror ("The audience is [[Autodidact Polymaths]]"). Edit both or neither.
- `_ops/loudon-live/design-system/ui_kits/session-artifact/README.md:5`: calls the retired footer "the audience signature".
- `Projects/Loudon Live.md:89` § The look: calls this system "the palace's default dress". That has been stale since Drafting Table took the work itself (2026-10-21). It should name the three looks.

## Next move

Draft the edits, show them to Loudon in one pass, write on his yes, commit by path. Ask the Drafting Table question in the same pass: `_ops/drafting-table/design-system/README.md:59` still says "Never cyan". Loudon has not decided it; the Cyanotype look borrows Drafting Table's grammar but changed nothing in it.

## Calibrations

- `Projects/Loudon Live.md` wins over this system's descriptions of Loud'n Live.
- The floor (the studio voice, the Lissajous sigil, no emoji, no hype) stands. Cyan is allowed in this system now.
- The six-skin house style stays the default dress for everything else the public channel shows; Loud'n Live wears its looks (`Loudon Live Design System.md` § Looks).

## Load these files first

1. `Projects/Loudon Live.md`: the current portrait.
2. `Palace development/Loudon Live Design System.md`: § Looks and § Naming the audience.
3. `_ops/loudon-live/design-system/SKILL.md` and `README.md`.
4. `_ops/loudon-live/design-system/ui_kits/session-artifact/README.md`.

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
