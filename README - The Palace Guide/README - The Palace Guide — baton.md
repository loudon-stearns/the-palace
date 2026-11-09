---
title: "README - The Palace Guide — baton"
born: 2026-11-09
links:
  - target: "[[README - The Palace Guide]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry a commission for the Palace Guide across a boundary: settle where the newcomer's map lives, then build it and test the door on a stranger. I wait to be caught by the next Claude and am deleted once the move is picked up."
session_thread: "Daily Page, 2026-11-09 — the Guide rewritten as a door (1992eb9a, 2a211c42); root README.md generated (b2b4e4c8); proofs and scroll (59837da4)"
---

# Baton: README - The Palace Guide

## Move

An [[Enrichment]] round on the Guide. First, settle with Loudon where the newcomer's map lives. Then build it from the door-map rough, and run a cold-reader test of the door with an AI that is not Claude.

## Why this move matters

The Guide used to copy other pages' rules, and seven of the ten sentences checked on 2026-11-09 had drifted. It is now a door that holds nothing another page owns, and it is the repo's root `README.md`. Any face built for it has to keep that rule: a map that reads the pages' own words and holds no text of its own. A door that has only ever been read by its author is also untested. The real question is whether a stranger reaches the right page.

## Decided

- **Who the door is for.** The README is the door for GitHub visitors and for any AI. It sends humans on to the public site (https://loudon-stearns.github.io/the-palace/), which is the house tour. Loudon, 2026-11-09: "I agree". The page already sends humans there first (`2a211c42`).

## Cold start

COLD START — this work has not begun; there is no prior state and nothing tried and rejected. Ask these first, before building any face:

1. **Where does the newcomer's map live?** The public site already does much of what the door-map rough does, for humans: STIGMERGY.md:120; `_ops/stigmergy/app/scripts/build-public.mjs`; its TOPOLOGY view, grouped by pillar. Settle with Loudon whether the map belongs in the site's TOPOLOGY rather than as a rich face on the Guide.
2. **`welcome.md` is a second copy of the Seed Jewel.** The site's BBS welcome, `_ops/stigmergy/app/src/public/welcome.md`, is a lightly adapted copy of [[JEWEL]]. That is the same kind of drift this morning was about. Ask Loudon what to do with it.
3. **The stray older bundle `The Palace Guide/`** sits beside the real one. It holds a face.json, a hero and an icon from `099e3d82`, and its hero differs from the one in `README - The Palace Guide/`. It needs a decision: fold it, delete it, or keep it.

## Next move

Once those are answered, build the map from `README - The Palace Guide/proofs/2026-11-09/2026-11-09-door-map.html`, in whichever home was chosen.

- It must read the newest map in `_ops/maps/`, not the snapshot embedded in the rough (the `var DATA` there was built 2026-11-09).
- The forward vectors of SCHEMA and ROSETTA did not show in the rough, because a regular expression missed them. Fix that.

Then run the cold-reader test the woken page proposed:

- Give an AI that is not Claude only `README.md` and ask it to make a small deposit. The local Gemma in [[Gemma 4 — Local Coordination Guide]] is one choice.
- Watch whether it reaches `CLAUDE.md`, whether it stays a child, and whether it avoids `git add .`.
- Put what it does on the Guide's scroll.

## Receiving environment

The work lives on branch `claude/awesome-lovelace-4fc7d8`, in worktree `.claude/worktrees/dazzling-noyce-acd879`, until the morning's close lands it on main. After that, catch it from main. The cold-reader test needs Gemma running locally on this Mac.

## Calibrations from this session

- Loudon: "we can't allow a foundational page to drift! Go deep make as much as you can."
- His rule for the Guide: a door holds nothing another page owns. A face for it obeys the same rule.
- He doubted that a human should be sent to `CLAUDE.md`. Humans get other routes, and the public site comes first.
- `README.md` is generated (`node _ops/readme/build-readme.mjs`; `--check` reports when it is stale). Never edit it by hand. Nothing runs `--check` automatically yet.

## Load these files first

1. `README - The Palace Guide.md`, and this bundle's scroll and Context (§ The 2026-11-09 rewrite)
2. `README - The Palace Guide/proofs/2026-11-09/2026-11-09-door-map.html`
3. [[Enrichment]], then STIGMERGY.md:120 and `_ops/stigmergy/app/src/public/welcome.md`
4. [[Gemma 4 — Local Coordination Guide]]

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
