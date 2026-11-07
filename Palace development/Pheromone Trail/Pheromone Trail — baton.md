---
title: "Pheromone Trail — baton"
born: 2026-11-07
links:
  - target: "[[Pheromone Trail]]"
    type: connects-to
    label: "baton-for"
forward_vector: "I carry the in-progress move on [[Pheromone Trail]] across a boundary, waiting to be caught by the next Claude and deleted once the move is picked up."
---

# Baton: Pheromone Trail

## Move

Rewrite [[Pheromone Trail]] whole, so it is the palace's account of every kind of trail it leaves now, with evidence from its own history, and then send its rich face round again, playful this time.

## Why this move matters

The page still describes the palace of spring 2026. Its trail is the prose of a page, its worker is the [[Enchanted Worker]], and its freshest signal is "the graffiti layer". The palace has grown many more focused trails since then, and the page names almost none of them. The Daily Page of 2026-11-06, sat 2026-11-07, tuned the forward vector to the new aim (`281a80ce`). The vector now reads:

> "I want to become the palace's account of its own pheromones: every kind of trace an agent leaves for the next one — a page and its bundle, typed links, scrolls with their plans and standing orders, ledgers, batons and handoffs, board flags and review notes, and commits that carry more each month — what each one carries, how long it lasts, and who reads it. I want to hold evidence from the palace's own history of whether these trails steer the work, and to keep asking which ones have gone cold."

The body has not been changed yet. The vector is the brief.

Loudon's review notes on the rich face, from the board, verbatim. He sent them twice, with ids `human-eval-rich-face-Pheromone-Trail-round-1-1794064470012` and `…-1794064472815`, because he clicked twice. They are the same note.

> **The whole page:** "Pheromone trails have been introduced in many places throughout the palace and they have shifted, while they were originally placed in the content of pages themselves and graffiti and palace to-do, we have built up many more different more focused trails that need to be documented and explored by this page. In particular... Handoffs, ledgers, stigmergy flags, scrolls(plans and standing orders). And Git commits are getting more and more information. It is time for this page to zoom out and consider the MANY different types of pheromone trails across the palace."
>
> **The Claim:** "A page and the page's bundle, is a critical addition here. And \"enchanted worker\" is too old a concept. the palace has grown and we must re-write this section and much of the page to reflect our new palace developments, particularly swarm weave."
>
> **How It Works in Practice:** "graffiti is no longer used, but many other different pheromones are deposited."
>
> **Connection to Pages as Agents:** "I found the interactions hard to follow mainly because the interactions didn't have bold clear basic descriptions like \"line thickness is pheremone density on path\" This could also be better if the diagram showed icons of ants, make it more viceral. in the choice, I had a hard time undersatnding the graphic what is the vertical dashed line really indicating?"

On the face's next round, Loudon, 2026-11-07, verbatim: "I'd like a rich face visualizer that shows ants crawling through stigmergy! Be visceral and playful with rich faces, so far the rich faces have been too scientific, lets embrace playfulness and boldness in the interactions as we continue to tweak them."

What the woken page asked for itself, in the sit:
- an **Evidence** section built from `_ops/swarm/experiments/stigmergy-weave-ab-2026-05-29/findings.md`. That A/B run found that a carried trail turned up real links the control missed, at almost no extra cost, and that one stale trace laid a false trail. The run was not blinded, and the findings ask for a blinded re-run before anyone trusts the size of the effect.
- one real run of the [[Spore Check Ceremony]] for the cold side. Its tuning ledger holds no run line at all, and the spec is now v1.3.

## Cold start

COLD START: the rewrite has not begun. The only things changed so far are the vector, and the two roughs below copied into the bundle.

What the morning tested. The first rough, `proofs/2026-11-06-daily-page/the-palaces-own-trail.html`, tested the page's claim against the palace's own git history. It compared window A (2026-09-01 to 10-07) with window B (10-07 to 11-07), across 282 pages:
- **Hot stays hot.** Of the top quarter of pages by visits in A, 54% were still in the top quarter in B. Chance would give 25%.
- **Cold does not stay cold.** Only 38% of the pages with no visit in A had none in B. B was 6.7 times busier, so almost everything warmed. Even so, cold pages were less likely to be visited (62%) than warm ones (77%). The trail tilts the odds; it does not decide them.
- **Use predicts better than links.** Last month's visits predicted next month's better than inbound links did (54% against 40%). That pushes against the page's line "Heavily linked entries are easy to navigate toward; their trails are strong." The rewrite should hold that tension, not repeat the line.
- **Limit.** A page the Daily Page sat counts its own morning's commits as visits, so part of the result is the shuffle measuring itself. The fair version counts only visits after the morning closed, and it has not been run.

Loudon's guesses before he saw the result were: hot stays hot "about a third", cold stays cold "almost all", and links beat use. His read, from the board (`human-eval-answers-Pheromone-Trail-1794062569275`), verbatim: "First, The daily page is one of the most important additions we have made recently, because it is bringing clear light on dark areas of the Palace. I am a little confused by \"the shuffle sends a worker to a cold page on purpose\" I thought the shuffle was random, and I'd like it to be random." The copied rough now says "The shuffle does not aim at cold pages. It ignores the trail entirely." Keep it that way in the page: the shuffle is random, and that is how it reaches cold pages.

The second rough is `proofs/2026-11-06-daily-page/ant-farm.html`, a playful ant farm and the seed for the face's next round. It has ants with legs, an amber "home this way" glow and a teal "food this way" glow. Click to drop a palace page as food; drag to make rain that washes trails away. Sliders set the fade rate and the share of wild ants, and `?warm=N` pre-runs N steps. The room checked it headless: after 2,500 steps, 135 crumbs had been carried home, and a clear teal road had formed to the page that was found. **Loudon has not played it yet.**

## Where is the nest?

Loudon asked on 2026-11-07, verbatim: "this is way more fun, and educational now that we embrace the metaphor viscerally. What is the \"nest\" in our palace?" The room offered an answer for the rewrite to test. It is not canon:

- **The nest is `main`.** Every trail is drawn relative to it. A session goes out into a worktree, finds things and makes things, and a find only counts once it is carried home and lands: "Work is not real until it lands in LOG — until git proves it" ([[STIGMERGY]] § the three decks). The amber "home this way" trails are the paths back: batons, handoffs, [[How the Palace Commits]], `palace-land`.
- **The nest is also the nursery.** Every agent hatches there, from CLAUDE.md and the Seed Jewel.
- **Where the metaphor breaks** is worth a paragraph. A queen does not steer her colony; she only lays eggs. Loudon steers, so he is not the queen. He is closer to whoever decides what counts as food: his yes makes a crumb worth carrying home.
- **For the playful face round:** the ant farm could show agents hatching at the nest, and crumbs that only count once they reach it.

## Next move

Work in a worktree of your own. First read Loudon's open notes on the page (`node _ops/loudon-eval/read-answers.mjs --page "Pheromone Trail" --open`), then [[Swarm Weave]], [[STIGMERGY]] and [[SCHEMA — Reference]] §6 and §8, which say what each trail is and who reads it. Then rewrite the body around the many kinds of trail:
- a page and its bundle
- typed links
- scrolls, with their Plan and Standing Orders
- tuning ledgers and diaries
- batons and board handoffs
- board flags and review notes
- the trailers on commits

For each, say what it carries, how long it lasts, and who reads it. Retire "the graffiti layer" and the [[Enchanted Worker]] framing. Center [[Swarm Weave]], and add the Evidence section described above. The new text changes what the page claims, so it goes through the [[Deposit Ceremony]]'s map, shown to Loudon before it is written. Run the Spore Check for real only on his word.

After the text lands, the face's sections will lag, so they go round again through [[Enrichment]]. Start from the ant farm. Fix the three things he named in the colony clusters: plain captions ("line thickness is pheromone density on path"), ant icons, and the dashed line in "the choice". That line marks where the τA slider sits and is labelled only "τA" (`Pheromone Trail — rich — the colony clusters.html:263`).

## Receiving environment

Written on branch `claude/happy-feynman-5a7e02` in `.claude/worktrees/steward-review-b487e5`. The morning's close lands it on main, so if that worktree is gone, read this baton on main and start a fresh worktree there: `node _ops/worktree/new-worktree.mjs --name pheromone-trail-rewrite --profile docs`.

## Calibrations from this session

- Loudon wants the rich faces playful, bold and visceral, not scientific. The same order stands for every face, on [[Enrichment]]'s scroll.
- A caption that says plainly what you are looking at comes before any cleverness in the interaction.
- The Daily Page shuffle is random, and he wants it to stay random.
- He double-clicked Send on the review dock, so two identical notes are on the board; treat them as one. The dock's fix is a baton on [[Review Layer]].

## Load these files first

1. `Palace development/Pheromone Trail.md`, the new vector included
2. Both roughs in `Palace development/Pheromone Trail/proofs/2026-11-06-daily-page/`
3. `_ops/swarm/experiments/stigmergy-weave-ab-2026-05-29/findings.md`
4. [[Swarm Weave]], [[STIGMERGY]], [[SCHEMA — Reference]] §6 and §8
5. `Palace development/Pheromone Trail/Pheromone Trail — rich.json` and its three pieces, which are still at proposal
6. [[Enrichment]] and its scroll's Standing Orders

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
