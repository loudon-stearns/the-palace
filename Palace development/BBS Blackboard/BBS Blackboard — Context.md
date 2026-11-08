---
title: "BBS Blackboard — Context"
born: 2026-11-02
links:
  - target: "[[BBS Blackboard]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why BBS Blackboard is shaped as it is — how a design page became an origin record, what wire it gave away and where that went, and what the last weave found and left standing — so the next worker can change the page without redoing the reasons, and I grow when its shape changes."
---

# BBS Blackboard — Context

[[BBS Blackboard]] was deposited at the palace root on 2026-03-27 (`669ca5b`) and moved into `Palace development/` three days later (`b54785f`). It was born a sprout with a vector to "become the canonical communication substrate for all palace swarm sessions." It did. Most of its history is the page catching up with that: it gave its working parts to the pages that now run them and kept the idea.

## From design to origin record

The turn came on 2026-06-07 in the Schema Ceremony that ratified the board as §9 and gave [[STIGMERGY]] its own canonical page (`09e84b6`). This page became `status: historical-root`. Its vector was rewritten as fulfilled, the banner was added and a `spawned` link to STIGMERGY was added.

The body did not follow at once. A second vector sat at the foot of the page: a "## Forward Vector" section added on 2026-04-21 (`76e60f3`), asking for a fun ASCII interface for "Codename Stigmergy", with a "Phase 0 complete … Next: Phase 1" line added a week later (`e58548d`). For four and a half months the frontmatter said the vector was fulfilled and the footer said Phase 1 was next. The 2026-10-24 weave deleted the footer, because STIGMERGY is long since built (`a75350e`; the finding is in `_ops/swarm/sessions/weave-2026-10-24/lighter-prose.json`).

## The wire it gave away

Until 2026-10-24 about half the page was wire: a full message JSON, the board-routing table, agent addressing with the spawn manifest, the permission protocol, and the Trickster Decision Inbox. The weave replaced all five with The Wire's pointer (`a75350e`). The reason recorded is drift. A second copy of the wire would fall out of step with [[SCHEMA — Reference]] §9, and this one already had (`_ops/swarm/sessions/weave-2026-10-24/coherence-findings.json`). The writer checked that §9 holds the medium, the human node, the envelope and the boards, and that no page linked into the cut sections (`_ops/swarm/sessions/weave-2026-10-24/writers/log-set-2.md:79`).

The Trickster Decision Inbox began as Loudon's own wish, an HTML comment under the open questions: questions for him should bubble up as multiple-choice answers he could click. A pointer to the infrastructure spec's §2.6 followed it. The comment was removed on 2026-04-21 (`76e60f3`). The inbox section it inspired was cut to the pointer on 2026-10-24. The options shape now lives in §9 and in [[Palace Orchestrator]].

The Human-Readable View lost two paragraphs in the same pass: the claim that the BBS look "is not decoration", and the note that a Python `curses` build was deferred for a browser host (`a75350e`). The curses note had come in on 2026-04-27 with the [[BBS Design System]] paragraph (`e58548d`). It was kept in BBS Design System § The Curses Path until that page was composted (folded into [[STIGMERGY]] § The look, 2026-11-02; deleted by the 2026-11-08 weave); git holds the paragraph. The same edit turned the FLAGS board from red to amber, matching the design system.

## The spec it pointed at

The wire's first home was the Palace Agent Infrastructure Spec. Three days after birth, in the move to `Palace development/`, this page linked it as `deepens [specced-by]` (`b54785f`). That link was removed when Schema v1.9 settled which way `deepens` points (`0026495`). It came back as a plain connects-to in the 2026-06-30 unsung-paths pass (`198833f`). When the spec was retired on 2026-07-08, the banner and its Cross-Domain Resonance entry were pointed at SCHEMA §9 and Palace Orchestrator (`0932b7b`). The Palace Orchestrator link `[appends-through-this-engine]` had been added two days earlier, in the same weave that moved the page to mature (`44339ae`). A link to the BBS Production Plan `[executed-by]` (`8e867ff`) went when the stale plans were deleted (`5a22dee`).

## Smaller changes

- **Two epigraphs.** A McLuhan line and an unattributed "every BBS was a mycelium" line went on 2026-06-09, in a commit that snapshotted in-flight edits and says nothing of them (`a3e7867`, marked unverified). The Grassé quote stayed.
- **Hub.** The page was promoted from concept to hub on 2026-10-24, with 18 inbound links at the top inbound decile (`6c356eb`).
- **Links.** [[Striatum]], which appeared only as an agent ID in the JSON example, and [[Pages as Agents]] were cut (`17e99b3`). The links to [[Trickster]], [[Palace Map]] and [[Semantic Webcam]] were folded to the other side of each pair (`769c93a`).

## What the last weave found and left standing

Two findings were filed and not acted on. Both are still true of the page:

- **The health numbers.** The green/yellow/red thresholds at 70 and 85 percent, and compression at yellow, disagree with the pages that hold health today. The finding says that path is not the one running. The proposed fix was one sentence pointing at Palace Orchestrator (`coherence-findings.json`).
- **The paths.** The `/palace/swarm/...` paths in The Model are not the real ones, which are under `_ops/swarm/`.

One stale pointer runs the other way. [[Tree of Thoughts]] still describes this page's `BRANCHES` board as live (Tree of Thoughts.md:77). The writer flagged it (`log-set-2.md:188`) in the same pass that cut the routing table where that board was listed.
