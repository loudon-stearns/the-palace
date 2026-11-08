---
title: "Action Potential Oscillator — Context"
born: 2026-11-08
links:
  - target: "[[Action Potential Oscillator]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why Action Potential Oscillator is shaped as it is — what it left out, what was tried and dropped, the decisions behind its sections — so a worker arriving next reads the reasons instead of re-deriving them, and I grow only when the page's shape changes."
---

# Action Potential Oscillator — Context

This file is for whoever next edits [[Action Potential Oscillator]]. The page was written in March 2026 around a single neuron. Since then the project has grown a crowd of neurons, a Faust engine and a Python render, and most of that growth was put somewhere other than the page. This file says where it went and why, records the one claim the page makes that nobody can currently check, and explains the parts of the page that read oddly unless you know their history. Where the project stands today is on [[Action Potential Oscillator — scroll|the scroll]].

## What the page left out, and where it went

**The crowd's working detail.** The page used to explain population dynamics at length: how to read a raster plot, the argument that a neuron is a grain, and the case for Faust's `par(i, N, neuron(i))`. The October Weave cut all of that down to one sentence, which says the section "is the ground of [[Neural Granular Synthesis]]", where the raster plot and the `par()` layer are developed now (`a75350ec`). The Hodgkin-Huxley hypothesis stayed, because it is this page's own question. Two *progressed* notes under Open Questions report what Neural Granular Synthesis measured: synchrony and brightness fall on one curve when coupling is plotted against spread, and its RNBO crowd runs 512 neurons against this page's 32.

**The Faust crowd's tuning.** The crowd running in Faust since 14 October gets one sentence under Implementation Status. Its decisions are on the scroll. A locked crowd plays the pitch of its fastest member, so a pitch-anchor knob shifts the spread until that member sits on the dial. Each neuron's frequency compensation is now measured from what actually happened, not predicted from the planned phase lengths (cycle 9, `apo-steward-020`). The steward proposed a bullet for the page's list of key implementation decisions. It is item 2 in [[Action Potential Oscillator — tuning]], waiting on Loudon's review. Until he says yes, that list records only the March decisions for the single neuron.

**The Max pause and the product order.** On 2026-10-16 Loudon paused all Max work until Max patching standards exist (`929de8c5`). On 2026-10-21 he asked for a VST on the [[VST Template]] first (`ca454ba2`). Both orders live in the scroll's Standing Orders. The page doesn't mention either one. Implementation Environment still describes Gen~ as the development path. That is true of what was built, and it says nothing about what comes next.

**The open choice.** The steward's question `apo-steward-012` (2026-10-14) asks whether the crowd or the single neuron goes to hardware first, or whether the work stays in Faust. Loudon has not answered. The frontmatter forward vector still names "an H90 port via RNBO" as a next output. That line was put there on purpose: when the audit of 2026-05-28 removed a resolved Claude-to-Loudon comment about the H90, it noted that "answer now lives in the forward_vector" (`c82561a1`).

**Links held elsewhere.** In the October folds the page gave up nine frontmatter links: Kuramoto Coupling, Signal-Rate CV Architecture, Frequency-Time Duality, Striatum, Biomechanical Synthesis, State Machine, Bessel Functions in Synthesis, Threshold Conatus and Scale-Stratified Identity (`769c93ad`). The body still links most of them inline. Under the one-link-per-pair rule the pair is carried by whichever side kept the link. I did not check each of the nine from the other side.

## What was tried and dropped

**Claiming a strong isomorphism.** The page's central claim is that these are "not metaphors — they are structural identities". On 2026-05-05 a philosopher's visit pushed on the word *isomorphism* (`8da2e1f3`). Loudon asked for specific edits in response, and four were drafted in [[Palace Graffiti]]. They name three layers of isomorphism (mathematical, functional, phenomenal) and say the page claims the third layer on evidence for the first. They were held for review and never applied. The page carries the visit as a callout under the claim, and the claim itself has not changed. So the tension is held on purpose, not settled. If a worker wants to sharpen the claim, the drafted edits are the place to start.

**The Claude project as the source of truth.** Until the October Weave the page said its source of truth was a Claude project called "Neural synthesizer" and that the palace held a periodic snapshot. The Weave cut that line (`a75350ec`). The bundle is now the only home.

**The Stage 4 codebox.** The page says "The Stage 4 codebox and its interface text are in this page's folder." In March the fuller version said the complete codebox, plus the interface text for its intro, four phases and eight parameters, was archived in the folder (removed at `a75350ec`). The November challenger looked and couldn't find it (`11a7eec2`). I looked again on 2026-11-08 and found only the Faust crowd's codeboxes under `rnbo/` and the Gen~ plan's pseudocode in `neural_oscillator_dev_plan.md`. Most likely it stayed in the Claude project the deleted line named, but I can't verify that. This sentence on the page is unsupported until someone finds the codebox or removes the claim.

**The Faust-or-Gen~ question.** The struck-through question under Open Questions ("Should they diverge or stay isomorphic?") was settled in March: Gen~ for teaching, Faust as the production candidate. It is kept struck through on the page rather than cut, so the decision stays visible beside the questions still open.

## Why it is shaped as it is

**Four stages, each playable.** The stage sections and the separate Implementation Status come from the deposit that wrote [[State Machine]] and [[Progressive Staging]] (`7c9de128`, 2026-03-24). The oscillator was the case that taught the method: each stage is complete and playable before the next begins, and stage 4 moved to codebox because its four-state machine outgrew visual patching. The page's `emerged-from` link to Progressive Staging, added in the 2026-03-30 Weave (`b54785f4`), runs backwards against that history. Progressive Staging says itself that "the principle emerged from building" this oscillator (`Progressive Staging.md:43`), yet it also links here as `enables`. So the pair carries two links. Both make the method the ground of the build, and the history says the opposite. `lint-link-pairs.py` passes the pair as lineage, so no linter will catch it. I flag it here and don't change it.

**"Stage 6" is not a fifth oscillator stage.** The heading *The Refractory Period as Threshold Conatus* says it comes from "the Stage 6 dialogue". That is Stage 6 of the palace's enchantment programme, the first dialogue with all four integration layers active (`a2a77dd8`, 2026-04-01), not a stage of this instrument. The same dialogue added the `agency_profile` and revised the forward vector. A reader counting four oscillator stages will trip on it. Renaming it is a small edit worth offering.

**Roadmap Connections is one paragraph.** By the time the page moved into `Projects/` (`b54785f4`, 2026-03-30), this section was already three bold-led paragraphs, one each for Kuramoto Coupling, Boundary-Crossing Instruments and Frequency-Time Duality. The October Weave folded them into a single paragraph (`a75350ec`) in the same pass that folded away the matching frontmatter links.

**Type and stage.** It is a `project`, `growing` until the October Weave moved it to `mature` (`6c356eb4`, 2026-10-24). The scroll's Now still said `growing` because it was last regenerated on 2026-10-20. The `agency_profile` predates the stewards. Its tools line still asks for a Faust `par()` layer, which now exists in a first form (`neuropulse.dsp`), and its practice line reads as of March.

For the next hand, things worth recording: the ruling on `apo-steward-012`, Loudon's review of tuning item 2, whether the March Stage 4 codebox turns up, and the first time anyone listens to the crowd. The scroll's trail has said "Nobody has listened yet" since cycle 8.
