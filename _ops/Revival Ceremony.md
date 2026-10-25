---
title: "Revival Ceremony"
type: practice
pillars: [practice, philosophy]
born: 2026-03
stage: mature
version: "2.1"
trigger: ["revive [entry]", "let's revive [entry]", "time to revive [entry]"]
forward_vector: "I am how a sleeping page comes back into the work. I want every waking to be earned by something made and met, and to end in a page that tells the truth about itself and has someone to work it, so that dormancy is a season the palace can turn, never a door that only opens one way."
links:
  - target: "[[Spore Check Ceremony]]"
    type: emerged-from
    label: one-of-four-ways-in
  - target: "[[Deposit Ceremony]]"
    type: connects-to
    label: rewrites-what-a-page-claims
  - target: "[[Project Stewardship System]]"
    type: connects-to
    label: the-way-back-in-from-sleep
  - target: "[[The Scroll]]"
    type: connects-to
    label: where-the-waking-is-told
  - target: "[[Palace Enchantment]]"
    type: connects-to
    label: you-are-alive
  - target: "[[The Daily Page]]"
    type: connects-to
    label: a-morning-decides-revive
---

# Revival Ceremony

![[Revival Ceremony — hero.png]]

A revival is how a sleeping page comes back into the work. Loudon meets it through something made, and decides whether it is alive. Then the palace makes the page true to what it now is, and gives it a way forward: a plan, and someone to work it. The deciding is his, through his senses. The landing is an elder's, shown to him before it is written.

The palace puts pages to sleep at the Weave, checks on the sleepers at the [[Spore Check Ceremony|Spore Check]], and meets them one at a time on [[The Daily Page]]. This rite is the only one that wakes them.

## Contract

| | |
|---|---|
| **Ways in** | Four, and nothing else revives a page: Loudon says "revive [entry]"; a Spore Check decides *revive*; a Daily Page morning decides *revive*; Loudon grants a steward's revive request on the TRICKSTER board. |
| **Precondition** | The page is asleep: `stage: dormant` or `composting`, or `type: spore` at any stage. A page already deleted is first restored from git at its composting state, then the rite runs. |
| **Postcondition** | Loudon met the page through a made thing, or the rite cites where he already did. The page's frontmatter and body say what it is now, with every changed word read by him first. A project has a scroll with a Plan he agreed, or, when the page already has a steward, a plan owed from its first cycle; and, on his word, a steward. The commit is the run's record, and the run's line is in [[Revival Ceremony — tuning]]. |
| **Does not do** | Write the story of the sleep on the page. Wire links *into* the revived page from other pages unless Loudon asks for one; the next Weave finds the rest. Run a steward cycle; the heartbeat does that. |
| **Who writes** | An elder. A child walks the rite with Loudon and hands every write to the [[Concierge]]. |
| **Halts** | When the meeting says it is not alive. It stays asleep, or it is folded into the neighbor that already carries it, through the [[Deposit Ceremony]]. A revival nobody can feel is a confusion, not a ceremony. |

---

## Steps

**1. Read it, and what happened while it slept.**

First take the tail read of [[Revival Ceremony — tuning]] ([[SCHEMA — Reference]] §6). Then the whole page and its bundle: often the work went on there while the page kept saying it was asleep. Then git since it went quiet (`git log --since <when it went dormant> -- "<page>" "<bundle>"`), its requests and answers on the board, and the neighbors that have moved since. Ask the Concierge what the palace has said about it meanwhile; a Weave may have voted to compost it, a sibling may already carry the idea.

**2. Meet it.**

Loudon hears, sees or plays something made. What is in the bundle, if anything is; otherwise the smallest new thing that can be made in the room: a render, a sketch, a probe. Make it easy to meet: one page that plays each piece on a click and stays silent until then. The question is his: is it alive? What he says about what he meets is the first draft of its plan: write it down as he says it.

If he has already met it, cite where, and go on: a revive request he granted on the board, with the made things it pointed to; a morning's rough in the page's `proofs`. If the answer is no, stop here (Halts, above).

**3. Decide what it becomes.**

Show Loudon one block, and write nothing until he says yes:

- **Type.** A spore becomes a `project` (`status: active`) if it will be built, or a `concept` if the palace will reason with it. Any other type stays what it was.
- **Stage.** How far Loudon and Claude agree on where it is going ([[Substrate Skill]] § Stage as Alignment Confidence), not its word count. A revived page usually comes back at `sprout`: its idea was settled once, but the plan for the work ahead is new.
- **`revival_conditions`.** Dropped. The commit names which conditions were met, and which were never checkable.
- **Links.** Outward from the page, typed and labelled ([[SCHEMA]] §4). A link back from another page only where Loudon asks for one.

**4. Make the page true now.**

Rewrite what has become false: a section saying nothing has been built, a forward vector the work has outgrown. Show the changed sections only, and let Loudon read every word before it is written, as the [[Deposit Ceremony]] map does (its steps 4 and 5). Write what is, not what was ([[ELDER]]). Keep the page small. It says what the page is and where it is going now; what was made, how and when Loudon met it, and the story of the sleep and the waking go on the scroll's trail and in the commit.

**5. Give it a way forward.**

A project gets its scroll, `[Entry]/[Entry] — scroll.md` (`node _ops/stigmergy/orchestrator/src/scroll.js --home "<Entry>"` makes it; [[The Scroll]]). Write a dated section on its trail, by hand, for the work it did while it slept and for this revival. Then the Plan: where the work is going, and the moves ahead, each named by what it does. Loudon agrees it, or it is not written; once he has, `scroll.js --home "<Entry>" --plan <file> --why "<what and why>"` writes it and logs the change on the trail. A page that already has a steward may land without a plan: its steward's first cycle proposes one as a plan revision for his yes, and the revival's commit says the plan is owed. To make it that cycle's job, leave it as a one-shot order in the steward's tuning ledger (`- from Loudon · <date> · <his words> · owed`, [[SCHEMA — Reference]] §6). A standing order Loudon gives during the revival is written into the scroll's orders zone by an elder, quoting his words and the date.

Then, on his word, its steward. Wake the page once first, read-only, as every woken page is woken ([[JEWEL]]), with `_ops/daily-page/wake.mjs`: ask it who it is now, whether its forward vector still holds, what it wants to make first, and what its steward should never do, and let Loudon hear the answer before the steward is made. `wake.mjs` reads the main checkout; a page made true on a branch needs its `--root`, which is owed, and until then is woken with the same builder (`buildEphemeralPrompt`, `_ops/stigmergy/orchestrator/src/ephemeral-prompt.js`) pointed at the worktree. Then `node _ops/stigmergy/orchestrator/src/enchant.js "<Entry>"` ([[Project Stewardship System]]; `_ops/orchestrator/batch.md` § Enchant a new steward). Enchant only after the type and stage have changed, because the heartbeat skips a dormant page, and a steward that has never cycled goes first in the next batch. A page that already has a steward needs no enchanting: the stage change wakes it. If a standing order told it to probe while dormant, ask Loudon whether that order is done.

A concept gets its forward vector looked at, and nothing more.

**6. Land and record.**

Commit through the door with the ceremony's own name: `palace-commit.mjs --ceremony "Revival" --summary "<Entry> — <one line on why now>" --verify <verified|unverified|couldnt>`, one `--path` per file ([[How the Palace Commits]]). The body says what Loudon met, which conditions were met, and what the page became, and ends with what this revival taught the ceremony ("nothing" is a legal answer). The run marks [[Revival Ceremony — tuning]] with its run line, and a lesson that changes the spec also goes there as a numbered item. Then the Concierge reads what landed, cold, and says whether each thing is where it belongs.

---

## A revival is earned by making

The honest test of a sleeping idea is to make something with it and listen, not to argue that its conditions have been met.

## The closed loop

```
seed → sprout → growing → mature → fruiting → dormant ──→ Revival ──→ back into the work
                                                 │           ↑
                       Spore Check · Daily Page  │           │  caught before the Weave deletes it
                                                 ↓           │
                                            composting ──────┘
                                                 │
                                                 ↓
                                     deleted at the Weave, unless revived first
```

Without a revival, dormancy is a one-way door. With it, dormancy is a season, and seasons turn. A page can be caught from `dormant` or from `composting`, right up until the Weave confirms the deletion ([[SCHEMA]] §2).

## Open Questions

- How a page leaves stewardship is still undesigned ([[Project Stewardship System]] § What's Open). A revival is the way back in; the two rites will want to read as one lifecycle once both exist.
  — answered on [[Project Stewardship System]] § What's Decided (2026-10-24): a steward leaves when its page ends (decided 2026-10-21), and a page set down to rest keeps its steward, with this rite as its way back.
- Should a steward be allowed to probe a dormant page without a standing order, when its last cycles left work nobody has heard?

---

*The version and what each revival taught the ceremony: [[Revival Ceremony — tuning]].*
