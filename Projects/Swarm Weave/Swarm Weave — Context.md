---
title: "Swarm Weave — Context"
born: 2026-11-02
links:
  - target: "[[Swarm Weave]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why Swarm Weave is shaped as it is — a build plan cut down to its architecture, a lens chapter folded in rather than minted, and a few sentences that outlived the plan they belonged to — so the next worker can change the page without redoing the reasons, and I grow when its shape changes."
---

# Swarm Weave — Context

Why [[Swarm Weave]] is shaped as it is, read from its git history. What the swarm has run is on its scroll; the contract is the [[Weave Ceremony]]'s. This file holds neither. It holds why the page carries what it carries and not more.

## It began as a build plan

The page entered git on 2026-03-19, at the palace root, as a sprout (`7181a13`). It was born to be built from: a full worker system prompt, a JSON report schema, a `Promise.all()` pseudocode sketch, a Mode 2 prompt template meant for claude.ai, and a seven-step learning path ending in "harden and ceremony-ify." Its open questions already asked the one that would reshape it in July: one worker per entry, or one per cluster?

Eight more commits landed the same day, and most of them corrected the plan rather than grew it:

- **Names.** Tier 1 and Tier 2 became unsung paths and new introductions, with caps of three per worker and five palace-wide (`20d7006`). The Single-Doc Worker became the Palace Worker (`6c0a030`). The template file carries the old name: on 2026-08-25 `worker-prompt-template.md` was renamed `Single-Doc Worker Prompt Template.md` to match its own title (`b5b1763`), and the page has pointed at it under that name since 2026-10-14 (`02e8a53`). The page's role name and the template's filename have never agreed.
- **The coordinator.** At birth the coordinator was handed the whole palace to build worker contexts. `32995ed` corrected that to frontmatter only, paths not content. This is the constraint the page now treats as the reason it scales. The same commit split the learning path into a hands-on Claude Code phase (with the Hilaritas Generator neighbourhood as test bed) and an SDK phase.
- **Access.** `e9d6663` gave Mode 2 two variants, filesystem first and GitHub raw URLs as a fallback. The same day `1581298` dropped the fallback: raw URLs read last-committed state, so filesystem became the only access model.
- **The trigger.** Mode 2 was first "after any Deposit." `f0a0634` took that assumption out. `f985423` let anyone invoke a worker, including another worker. The Deposit Ceremony's Step 7.5 was wired in the same day (`20d7006`).

The pheromone-trail and epigenetics section came in on `6c0a030`, though the subject line of `32995ed` claims it.

## The worker learned it is crew, not voice

On 2026-03-25 the graffiti audit became a worker task (`15d4a86`). Then `4dbb574` rewrote the worker's self-description, from "a specialist responsible for deep attention" to a maintenance agent that does not embody or channel its entry, and added the forward-vector check. The same commit deposited [[Palace Enchantment]] and the "is this correct? / is this alive?" split that now runs through the page.

The face check came on 2026-06-26 with merit rules: projects, hubs, five or more links, philosophy concepts, growing and up (`f16cb67`). On 2026-10-14 every canon entry got a face, so "merits a face" became "wears its face" (`02e8a53`).

## Cut to its architecture

By July the page had 827 lines and two jobs. On 2026-07-06, `1c1c509` cut it to 353. Its message gives the reason: the embedded worker prompt still carried the old face-check criteria, so "a fresh Claude reading it cold got the old model." Out went the worker prompt, the JSON schema, the Gemma dispatch code and its list of failed smaller models (`1490c3a`, 2026-04-08), and both phases of the learning path. They went to the Weave Ceremony card and the swarm templates. The architecture, the philosophical frame and the Phase 2 frontier were kept word for word, and so were all fifteen frontmatter links. The banner at the top dates from this cut, and so does the page's first forward vector.

The Mode 2 template had carried a local machine path since `e9d6663`. It went out with the template in this cut.

## The lens chapter was folded, not minted

The same day, the Multi-Lens Weave was deposited into this page (`ec9b43f`). The commit gives Loudon's reason: fresh agents already read this entry, and the idea answers its own worker-scope question. The first estimate was about 35 agent runs, "~7× fewer" than one worker per entry. After the first run, `37019a4` replaced it with what happened: about 32 agents over 301 entries. It also added the four sections from the cut-and-mandate lesson through the write deployment. It folded rather than minted on purpose ("closing-well gotcha 18").

That day an Active Baton notice sat at the top of the page (`ec9b43f`). It came off when the partition tool was built and the baton was caught and deleted (`247f1b8`). The answered worker-scope question stayed in Forward Vectors as "answered above" until the October weave removed it (`a75350e`). The oblique lens once also pointed at a `go oblique` Enrichment trigger, dropped when Enrichment 2.0 retired it (`d7ab521`).

## Links let go

- **[[BBS Blackboard]]** `enables`, added 2026-03-27 (`669ca5b`), removed 2026-06-05 while reciprocal contradictions were being resolved (`8379795`).
- **[[Spinoza Conatus]]** `mirrors`, labelled philosophical-ground, added 2026-04-07 (`c2dd361`), cut 2026-10-24 by the weak-link readers and skeptic (`17e99b3`).
- **[[Endosymbiosis]]** `mirrors`, a [[STIGMERGY]] link labelled coordinated-on, and a bare duplicate to [[Lateral Access]], all removed in the one-link-per-pair pass (`769c93a`). The body still names Endosymbiosis and stigmergy. Only the typed edges went.
- The Lateral Access link was misspelled "Lataral" in a frontmatter rewrite (`4169e6a`) and fixed twice on 2026-03-25 (`e7d0c1b`, `4dbb574`).

## Sentences that outlived their plan

Three passages predate the cut and still describe the plan the cut removed. The next hand should check them, not take them as decisions:

- **Parallelism** still says workers run through `Promise.all()` in Node.js. That is the birth text (`7181a13`). The SDK phase it belonged to was cut (`1c1c509`), and the Execution paragraph written in the same cut says workers run as Claude Code sub-agents.
- **The rate-limit forward vector** about Anthropic API tokens per minute is also from birth. It belongs to the same SDK path.
- **"Do not build Phase 2 until Phase 1 is ceremony-ified"** was written when Phase 1 was still a plan (`6c0a030`). Phase 1 is now the Weave's default, and the guard has not been revisited.

## Smaller moves

It moved from the root to `Palace development/` on 2026-03-30 (`b54785f`), then to `Projects/` on 2026-10-12, because it is typed project (`1ce2d2e`). On 2026-03-24 Open Questions was renamed Forward Vectors (`3633346`). The resource-pooling question came in with the Palace Map deposit (`669ca5b`). On 2026-09-26 the Kuramoto-threshold paragraph was re-grounded on use read from git, when `activation_count` retired (`32cb19e`). The same day a pointer to [[Palace Enchantment — proof — agent capabilities]] was added under Execution (`114d359`).
