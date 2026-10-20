---
title: "Shopkeeper — baton — CAD"
born: 2026-10-19
links:
  - target: "[[Shopkeeper]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Shopkeeper]] — CAD — across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Shopkeeper — CAD

## Move

Commission a Shop addition for accurate CAD drawing: find, and prove on the Haptic Handwheel's own parts, a way to make very accurate dimensioned drawings of mechanical devices, then propose it as a new Specialist.

## Why this move matters

Loudon, 2026-10-19: "I also think that this project will push us toward finding a solution for very accurate CAD drawings of mechanical devices and I'd like you to create a handoff for that exact thing, a new shop addition for CAD."

[[Haptic Handwheel]] is the first object the palace will watch leave the screen. Its plan runs to a bench and then to a hand, and the parts order already asks for pieces that must fit: printed caps, whose motor bolt pattern is not yet measured, and a mount block (`Projects/Haptic Handwheel/order/PARTS.md:19-20`). The lever or bar, left out of the first order as a second build (`PARTS.md:60`), the keys and the sideways mount (`Projects/Haptic Handwheel.md:124`) will want drawings of their own. A part that misses by a millimetre does not mount, and a picture that looks right does not say so.

The Shop has nothing for this. [[Blender]] blocks and renders scenes and carries no dimension or fabrication content. The [[Image-to-3D Smith]] turns an image into a mesh and is still a stub (`Shop/Image-to-3D Smith.md:4`). A search of the palace's markdown for FreeCAD, OpenSCAD, CadQuery, build123d, "technical drawing" and "dimensioned" finds no entry.

## Cold start

COLD START — this work has not begun; no prior state, no tried-and-rejected. What follows is where to look first, not a result.

- **Adopt before building.** The [[Technical Diagram Standard]] covers DSP and math diagrams, not mechanical parts (`_ops/Technical Diagram Standard.md:38`). Its test is the likely right one for a CAD choice: the source is plain text, so git can diff it (`:50-56`). That fit is the moderator's inference, not Loudon's.
- **On this machine, checked 2026-10-19.** FreeCAD at `/Applications/FreeCAD.app` (the app folder dated 2026-03-24, with `Contents/Resources/bin/freecadcmd` for headless runs) and Blender 5.1.2 at `/opt/homebrew/bin/blender`. Not found: `openscad` on the path, and `cadquery` and `build123d` under the default `python3`. The palace has no entry on FreeCAD, and who installed it, or whether Loudon uses it, is not known.
- **The route for a new Specialist.** The [[Shopkeeper]] probes with its own hands, writes a dossier, drafts the Specialist entry in its bundle and proposes it (`Shop/Shopkeeper.md:62-86`). [[AuK]] is the worked example: probe in `Shop/Shopkeeper/probes/2026-09-12-auk/`, draft, then landed as a stub on Loudon's yes (`94ac3e88`).

## Next move

Put three questions to Loudon before choosing any tool. They are his, and they shape everything after.

1. Form: dimensioned 2D drawings, parametric 3D models that export STEP or STL, or both.
2. Must the tool be text-first, its source a plain file git can diff, or is a GUI file acceptable.
3. Who verifies a fit. No agent can. Calipers on a printed part can.

Then run the Shopkeeper's loop on a Handwheel part: scan for candidates, probe each survivor with the smallest honest drawing, judge it against the bar. If one clears it, write the dossier and draft the Specialist entry in `Shop/Shopkeeper/drafts/`. The commission ends at the proposal. Landing it in the Shop is Loudon's yes.

## Receiving environment

A Claude Code session on Loudon's Mac, with Loudon in the room, because the three questions are his. The tools worth trying are Mac apps. If a candidate is a Python package, say which host ran it. This baton is written on branch `close/2026-10-19-handwheel` (worktree `/Users/loudonstearns/Documents/palace-close-2026-10-19-handwheel`, profile `docs`) and waits there for Loudon's yes; once it is on `main` no worktree is needed. If that branch is gone and the baton is not on `main`, it was never accepted: ask.

## Calibrations from this session

- Loudon chose a formal baton for this, over a To-Do line.
- Dimensions come from a datasheet or a caliper, never from memory. `PARTS.md:19` says the motor's top bolt pattern is not on the shop page. A drawing marks it unknown until someone measures it.
- The Shopkeeper tends the Shop and proposes; it does not write it (`Shopkeeper — scroll`, Standing Orders). This is a proposal, not a minting.
- `Shop/Shopkeeper.md:50` says the Shopkeeper makes to learn a tool, not for a brief. This commission is a brief with a probe inside it. Whether the Shopkeeper's loop still fits is a question for Loudon, not settled here.
- This is not the Shopkeeper's carried steward baton. It is a one-off commission and is deleted at close, like any other; the line below about steward batons being updated in place does not apply to it.
- `PARTS.md` is the Handwheel steward's draft; nothing is bought, and a later cycle may change it. Re-read it at pickup.

## Load these files first

1. `Shop/Shopkeeper.md` (the loop and the dossier, lines 56-86) and its Standing Orders in [[Shopkeeper — scroll]]
2. `Projects/Haptic Handwheel/order/PARTS.md` and `Projects/Haptic Handwheel.md` (lines 120-126)
3. `Shop/Blender.md` and `Shop/Image-to-3D Smith.md` (what the Shop already holds)
4. `_ops/Technical Diagram Standard.md` (lines 32-56)
5. `Shop/AuK.md` and `Shop/Shopkeeper/probes/2026-09-12-auk/` (a Specialist's road in)

## On pickup (fixed — the catcher's checklist; do not rewrite per session)
*Identical in every baton. It rides along because the catching Claude loads the
baton and the entry, not this ceremony — so the catcher's obligations live where
the catcher will see them. Omit nothing here.*
A pickup has two beats: **claim** it when you catch it, **close** it when the move lands. The card stays visible in between — a claim that ages with no close is how a dropped baton (a "fumble") surfaces instead of vanishing. (A parent-entry baton that was never announced on the board has no card; skip the board posts — just remove the pointer and delete the file at close, step 8.)

**Catch it — claim:**
1. State the move back in one sentence. If you can't, the baton wasn't caught — stop and ask Loudon.
2. Check it may already be done before you commit to it. The baton is a snapshot from when it was written; the project may have moved past it. Re-read the parent entry and `git log` it since the baton's `born` date, and confirm the "Current state" the baton quotes still matches the file. For a board-announced baton, `node _ops/stigmergy/pickup-handoff.mjs <id>` prints exactly this reconciliation view — every commit that touched the entry since the baton posted — and then claims the card, so run it and read the list *before* you continue. If the move is already done, superseded, or no longer wanted, STOP — do not claim it; surface to Loudon, and if it plainly landed already, close it as a reconciler (step 7). A stale baton followed silently produces drift. (The auto-staleness heuristic is off by design — the freshness call is yours.)
3. If this baton or its board line is still uncommitted (authored on a surface that couldn't commit — e.g. Cowork), commit them first. That commit is the git archive step 8 relies on.
4. Claim it. For a board-announced baton (it shows in `list-handoffs`), the `pickup-handoff.mjs` from step 2 has already posted the claim (`handoff_picked_up`, `lifecycle: claim`) — the card moves to **CLAIMED (in flight)**; it does *not* leave the board. Leave the "Active Baton" pointer and the baton file in place for now — they come out at close, so a fumble mid-move never erases the work.
5. If the baton names a receiving-surface capability delta or a worktree coordinate, confirm it holds before relying on it (the [[Surfaces and Capabilities]] catalog can be stale) — for a worktree, check `git worktree list` and recreate it (`node _ops/worktree/new-worktree.mjs --name <branch> --profile <p>`) if it is gone. A build that was supposed to run here but can't is a finding to report, not a failure to hide.
6. Act on the move, holding the calibrations above.

**Close it — when the move lands:**
7. Post the close. `node _ops/stigmergy/close-handoff.mjs <id | entry> --commit <hash>` retires the card — an explicit close is the *only* thing that clears it (done is never inferred). Cite the commit that landed the move: it makes the close a checkable claim, not a self-report. **Complete, or re-baton the rest:** if you finished the whole move, close plain; if you did only part, `--partial --remainder "<what's left>"` posts the leftover as a fresh `handoff_ready` so it reappears as open work. Never let "in the spirit of the original" quietly drop scope — a gap becomes a new baton, not silence.
8. Delete the baton file (git is its archive) and remove the "Active Baton" section from the parent entry. On a surface that can't delete (Cowork), remove the pointer and note "deletion pending." Steward batons are the exception — updated in place, never deleted or closed.
