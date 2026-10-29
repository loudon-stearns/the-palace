---
title: "Graphic Storytelling — baton"
born: 2026-10-29
links:
  - target: "[[Graphic Storytelling]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Graphic Storytelling]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Graphic Storytelling

## Move
Land the revision of [[Graphic Storytelling]] from the draft Loudon read and corrected at the Daily Page, move the old research canon into a new [[Graphic Storytelling — Context]], and get his final yes on the landed text.

## Why this move matters
The morning's verdict was **tune**, and the tune is the whole body, not just the vector. Two blind-take strips tested the page's color claim, and he redirected the page from "black-and-white plus one bold color" to its real subject: sequential art as a set of tools, each one an expectation the maker bends. Color is one of those tools, and its rank among them is unproven. He also added the direction from the page to the screen. Until this lands, the live page still argues the position he corrected: "the live edge — black-and-white, plus one bold color" and restraint as the source of the punch.

## Cold start
COLD START. The rewrite has not begun on the page itself; no prior state, no tried-and-rejected. What exists is the draft, which is finished text, not residue.

## Next move
Open the draft and the live page side by side. Make the draft's text the page (its frontmatter is kept in a code block at the top of the proof file; it becomes the page's frontmatter). Then write `Graphic Storytelling/Graphic Storytelling — Context.md` holding what the draft moves out, so nothing researched is lost:
- Toth's rules in full (subtract then commit, spot blacks selectively, shot scale as the pacing engine);
- the full lettering rules (balloon reading order, tail geometry, balloon shape as vocal channel, the four caption registers, reserve negative space). Check first how much of this [[Typography as Meaning]] already holds;
- the color specifics: spot color and the color hold, restraint, the color script, Stewart's flat color, the two-ink risograph look;
- Chion's added value and the acousmêtre;
- the sources and their verification status ("adversarially verified" against "sourced, hand-checked, verification-pending"), and the note that the verifier was rate-limited;
- why the page was reshaped on 2026-10-29, with the two proofs as the reason.

Show Loudon the landed page before committing. It is an edit that changes what the page says, so it goes through [[Deposit Ceremony]]'s map if he wants it, or as a plain edit on his yes; ask which.

**Open questions, left open:**
- **Fold.** Should [[Comic and Cinema — Two Ways of Seeing]] fold into this page, now that the revision has a section from the page to the screen? Ask him; do not decide it.
- **Overlap.** The lettering grammar is held twice, here and in [[Typography as Meaning]]. The draft already points there for "the whole lettering grammar". Whether the Context keeps the full rules or Typography as Meaning takes them is open.

## Calibrations from this session
- He called "color is the most powerful single variable" overstated and unproven. Do not let it back in, in any wording.
- The page-to-screen section is his addition: keep the frozen frame and the gap, and add what a screen allows. The test is whether the gap still does its work.
- Both studies are one viewer, one sitting: readings, not laws. The draft says so; keep it.
- The woken page asked for frontmatter links to [[Frame Designer]] and [[Comic and Cinema — Two Ways of Seeing]]. These are not owed: both already point in, and the Weave's one-link-per-pair pass (050af498) is why. Don't add them.
- The draft drops the stale "hero + icon pending" comment; the hero and icon exist.

## Load these files first
1. `Graphic Storytelling/proofs/2026-10-28-daily-page/Graphic Storytelling — proof — revision-draft.md` — the text to land.
2. `Graphic Storytelling.md` — the live page, the source for the Context.
3. `Graphic Storytelling/Graphic Storytelling — scroll.md` — the two studies and the plan.
4. `Typography as Meaning.md` — before deciding where the lettering rules go.
5. `Comic and Cinema — Two Ways of Seeing.md` — for the fold question.
6. [[SCHEMA — Reference]] §8 for the Context file's frontmatter.

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
