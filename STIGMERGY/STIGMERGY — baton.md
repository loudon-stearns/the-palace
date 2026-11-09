---
title: "STIGMERGY — baton"
born: 2026-11-09
links:
  - target: "[[STIGMERGY]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry a commission for STIGMERGY's public site across a boundary: an orientation option for someone's very first visit, built from the Palace Guide's door-map rough. I wait to be caught by the next Claude and am deleted once the move is picked up."
session_thread: "Daily Page, 2026-11-09 — the Palace Guide rewritten as a door (1992eb9a); this commission moved here from the Guide's baton (8005b120)"
---

# Baton: STIGMERGY

## Move

Add an "orientation" option to the public site for someone's first visit. Build it from the door-map rough, after settling with Loudon what to do about `welcome.md` being a second copy of the Seed Jewel.

## Why this move matters

Loudon, 2026-11-09: "I think the newcomer map can be concidered as part of the public site, maybe we have an "orientation" option on the public site for the very first time someone shows up at the door". Earlier he agreed ("I agree") to a split. The repo's README, generated from [[README - The Palace Guide]], is the door for GitHub visitors and for any AI, and it sends humans on to the site. The site is the house tour. So the newcomer's map is the site's job, not a rich face on the Guide.

The rule this morning made for the Guide holds here too: a door holds nothing another page owns. The rough keeps to it, because the map reads the pages' own forward vectors and has no text of its own.

## Cold start

COLD START — this work has not begun; there is no prior state and nothing tried and rejected. Ask first, before building:

1. **`welcome.md` is a second copy of the Jewel.** The site's BBS welcome, `_ops/stigmergy/app/src/public/welcome.md`, is a lightly adapted copy of [[JEWEL]] (STIGMERGY.md:120). It is the same kind of drift the Guide had: seven of ten checked sentences had gone stale. Should the site read the Jewel itself, should a build check the copy against it, or should welcome.md become Loudon's own words and stop claiming to be the Jewel?
2. **Where orientation sits.** Does it come before or after the BBS welcome on a first visit, can it be reached again later, and how does it relate to TOPOLOGY, the pillar view a first visit lands on now?

## Next move

Build orientation into the public build (`_ops/stigmergy/app/scripts/build-public.mjs`; the site's source is in `_ops/stigmergy/app/src/public/`). Start from `README - The Palace Guide/proofs/2026-11-09/2026-11-09-door-map.html`. That rough picks a reason for coming and lights up the pages that answer it, each in its own forward vector.

Two things to change in it:
- It must read the graph the site already ships, or the newest map in `_ops/maps/`, not the `var DATA` snapshot embedded in the rough.
- The forward vectors of SCHEMA and ROSETTA did not show, because a regular expression missed them.

Whatever goes on the public surface goes past the [[Sentry]] first.

## Receiving environment

The rough and the Guide's rewrite are on branch `claude/awesome-lovelace-4fc7d8`, in worktree `.claude/worktrees/dazzling-noyce-acd879`, until the morning's close lands them on main. After that, catch it from main. The site publishes on every push to main, so try it out in a scratch build first.

## Calibrations from this session

- Loudon: "we can't allow a foundational page to drift! Go deep make as much as you can."
- Humans are sent to the site, not to `CLAUDE.md`.

## Load these files first

1. STIGMERGY.md:120 (the public read view), then `_ops/stigmergy/app/scripts/build-public.mjs` and `_ops/stigmergy/app/src/public/welcome.md`
2. `README - The Palace Guide/proofs/2026-11-09/2026-11-09-door-map.html`
3. `README - The Palace Guide.md` and its scroll
4. [[JEWEL]]

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
