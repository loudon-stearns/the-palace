---
title: "Revival Ceremony — tuning"
born: 2026-09-25
links:
  - target: "[[Revival Ceremony]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Revival's record of what each run taught it, numbered, each lesson naming the spec change it forced, if any, so the ceremony's version has a reason you can read. Every run leaves a line here; a run that taught something also leaves a numbered item. Never prune what a real run taught."
ledger: tuning
standards:
  for: "what each revival taught the Revival Ceremony"
  run: "one revival"
  line: "- run · <date> · v<version> · <what it ran on> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid"
  writes: "the run itself, in the commit that records it"
  merge: union
  kept: git
  trim: never
---

# Revival Ceremony — tuning

What each revival taught the ceremony, and the lessons that reached it from elsewhere. Each item names what was shown and the spec change it forced, if any, or says **owed** when a change hasn't landed. Newest last. Hashes are commits to `_ops/Revival Ceremony.md` unless noted.

**v1.0 (2026-09-25)** is the card as it stood that day, plus the opening read. It marks where counting starts, not a ranking of what came before. The number moves when the procedure does — a step, a postcondition, a gate — never for prose. A revival's record is its commit.

## From Schema v1.19, every agent is born a child — 2026-09-22

1. **A revival writes a stage change and proposes typed links, so a child can't run it.** Forced: precondition 4, the operator has grown — [[ELDER]] and [[SCHEMA]] read (`4dd9c51d`).

## From the redesign with Loudon, before the first run — 2026-10-21

2. **Read against the palace of October 2026, v1.2 could not revive anything it would meet.** It could not turn a spore into anything, since a spore's stage is always dormant and Step 5 only moved the stage; its Revival Note wrote history onto the page; its Waking said come back at seed or sprout while Step 5's word counts said growing; it asked for a grown operator where a child now walks a rite and hands its writes to the Concierge; and it knew nothing of scrolls, plans or stewards. Meanwhile the palace had decided two revivals without it: on 2026-09-23 a standing order had two dormant stewarded projects probe and ask, Loudon granted both on 2026-09-24, Quantum Synthesizer landed only on 2026-10-13 after its steward flagged it (`2782ff34`), and Particle Synthesis's grant had not landed when this redesign began. The deciding happened on the board; nothing carried it home. Forced: v2.0. Four ways in, one rite; meet it through a made thing before anything is decided; the type change for a spore; stage as agreement ([[Substrate Skill]]), not word count; the page made true with every word read first, the story on the scroll and in the commit; a scroll, an agreed Plan, and on Loudon's word a waking and then a steward, enchanted only after the stage change; the commit through the door under the ceremony's name; the Concierge's cold read after landing. Settled with Loudon in the revival-ceremony session, from the baton of 2026-09-26.

## From the first run, Particle Synthesis — 2026-10-21

3. **A revived project that already has a steward came back without a plan.** The first page landed under v2.0 was Particle Synthesis, by the land-particle-synthesis session on Loudon's yes (`b0d4007d`, landed `97daf2f2`). It followed the card where the card was clear: the board grant of 2026-09-24 counted as the meeting, the stage went dormant → sprout, no Revival Note went on the page, the revival-conditions line was dropped (none of its three conditions was what woke it, and none was ever checked), the story went on the scroll's trail and in the commit, and the revival-probe standing order was deleted on his word. It did not agree a Plan; the commit says the steward leans on its forward vector and may propose one. Step 5 says a project gets a Plan Loudon agrees "or it is not written", and is silent on whether the revival waits for one. For a page that already has a steward, the stewardship path's answer (the steward proposes a plan as an ask) is a working answer too. **Loudon's call, paid 2026-10-21:** does a revival of a stewarded page require an agreed Plan before it lands, or may it land planless and leave the plan to the steward's first proposal? He answered "land then plan". Forced: v2.1. A page that already has a steward may land without a plan; its steward's first cycle proposes one as a plan revision for his yes, made that cycle's job by a one-shot order in the steward's tuning ledger, and the revival's commit says the plan is still to come.

- run · 2026-10-21 · v2.0 · Particle Synthesis (a granted board request as the meeting; landed `97daf2f2` by the land-particle-synthesis session) · taught item 3

## From the second run, Shimmer Cloud — 2026-10-21

4. **The first revival met in the room taught four things.** Shimmer Cloud came back from a spore to a project at sprout (`9280bec0`), met by ear on a listening page (`343effc6`), woken read-only, then given a steward (`b4cf1012`). **Loudon's call, paid 2026-10-21:** he answered each lesson, below. Forced: v2.1.
   - **The meeting made the plan, not only the decision.** Step 2 reads as a yes or no: is it alive? Loudon's listening chose the lens (the droplet and dispersion clouds together, dispersion first) and wrote three of the Plan's six moves: push the dispersion until the modes come apart, an interval and then a cloud, a swell before the dry with long tails. Step 2 is where a revived page's plan comes from, and could say so. He answered "add it": Step 2 now says what he says about what he meets is the first draft of its plan.
   - **What the meeting decided belongs on the page; how and when it was met belongs on the scroll.** The entry's "Where it stands" now carries a dated account of the revival day, which Loudon read and approved, while Step 4 sends the story of the waking to the scroll and the commit. Step 4 could draw the line between the two. He answered "keep the page small, put the info on the scroll": Step 4 now keeps the page to what it is and where it is going, and sends what was made, how and when he met it, and the story of the sleep and the waking to the trail and the commit.
   - **No waking tool can see a page made true on a branch.** `_ops/daily-page/wake.mjs` wakes the main checkout's page, and main did not yet have the revived one, so this run woke it read-only with the same prompt builder (`buildEphemeralPrompt`, `_ops/stigmergy/orchestrator/src/ephemeral-prompt.js`) pointed at the worktree. The fix is a `--root` on `wake.mjs`, or Step 5 naming the builder. He answered "the first": Step 5 now names `wake.mjs`, says a page made true on a branch needs its `--root`, and names the builder until then. The `--root` itself is a tool change the supervisor holds for wave 3.
   - **The standing order was written by hand on his word,** as Particle Synthesis's was on 2026-09-23, while [[The Scroll]] says standing orders are edited on the scroll in STIGMERGY and nowhere else. Either the rite says how an elder writes one on his word, or The Scroll allows it. He answered "allow it": Step 5 and [[The Scroll]] now let an elder write one on his explicit word, quoting him and the date.

- run · 2026-10-21 · v2.0 · Shimmer Cloud (spore → project at sprout; met by ear on a listening page; the plan written from his listening; woken from the branch, then enchanted) · taught item 4
