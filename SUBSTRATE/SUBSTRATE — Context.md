---
title: SUBSTRATE — Context
born: 2026-10-22
links:
  - target: "[[SUBSTRATE]]"
    type: connects-to
    label: context-companion
forward_vector: "I hold what SUBSTRATE left out: where the palace came from, the census it used to carry, the questions it has settled, and why it is now drawn as an anatomy. That way the page itself can stay a picture of the palace as it is. Read me when you need to know how the self-model came to be this shape, not to learn the palace."
---

# SUBSTRATE — Context

What [[SUBSTRATE]] used to hold and no longer needs to. A Self-Model Update, a Weave or a Schema Ceremony reads this. An agent learning the palace reads the page.

## Origin

The Substrate came out of the [[Symbiotic Skills]] brainstorm (March 2026), which named the lack of shared memory as the biggest gap in the Loudon–Claude collaboration. Its design drew on:

- **[[Meaning and the Link]]**: meaning comes from enough associations between a pattern of symbols and a reality. The typed links are a private semantic web, and LLM embeddings are the computational proof that a word's meaning *is* its pattern of associations ([[Embeddings as Relational Meaning]]).
- **Luhmann's Zettelkasten**: atomic notes, densely linked, forming a second memory and a conversation partner. "I, of course, do not think everything by myself. It happens mainly within the slip-box."
- **Aboriginal Australian songlines**: knowledge brought to life by walking it rather than looking it up. The path *is* the knowledge ([[Songlines]]).
- **Mycorrhizal networks**: distributed memory with hub nodes, resources flowing toward need, the network an organism with interests of its own.
- **Stigmergy**: coordination through changing the shared environment. Every page is a trace that shapes what happens next ([[STIGMERGY]]).

## Palace Genesis

Nobody planned the palace. It emerged. The first Claude sessions (May–June 2024) had no persistent memory, no ceremonies and no typed links: they were conversations that ended and left nothing.

The founding came in March 2026, when Loudon came back to Claude and found the history of those conversations sitting untouched in the chat log, a vault rather than a palace. At the first founding deposits session (H100, 2026-03-17), three paths were open: a Weave, a Walk or a Spore Check. The Harvest came first instead: a full triage of 104 conversations, oldest to newest, to find what was worth keeping. Then came the depositing, the ceremony structure, SCHEMA.md, the push to GitHub and the first Weave. First the palace did not exist, and then it did.

## The census, as it was

SUBSTRATE used to carry its own counts. Each refresh is in git, and these are the ones worth remembering.

- **2026-05-28** (audit `18097e60`): about 485 "real knowledge entries", counted across folders that included the since-deprecated `Artifacts/`. Only the counts were refreshed. The page flagged its own narrative as two months stale.
- **2026-06-16** (`8ed55c98`, the only refresh committed under the ceremony's own subject): about 410 entries in about 710 files. The entry count was inflated by files carrying non-canonical `type:` values (`theme`, `proof`, `spec`, `artifact`). The self-model over-reported the organism by about 15% for two months, which is exactly the failure its ceremony exists to catch.
- **2026-08-25** (`02e1c7e6`): 355 typed entries in 812 markdown files. Types: 129 concept · 49 meta · 41 project · 40 practice · 30 person · 28 specialist · 21 hub · 6 source · 5 maker · 4 question · 2 spore. Stages: 127 growing · 60 sprout · 54 seed · 54 mature · 11 composting · 6 foundational · 6 fruiting · 4 dormant. 2,852 typed links, 1,692 of them labelled. Zero orphans; 37 entries with no inbound link; 26 dangling targets across 21 names, nearly all forward ghosts. The top hubs by inbound degree were [[FOUR PILLARS]] (119), [[Kuramoto Coupling]] (76), [[Hilaritas Generator]] (72) and [[Spinoza Conatus]] (68).
- **Loudon Live's asymmetry.** In August, [[Loudon Live]] took 28 inbound links and emitted none, the one node not taking part in the palace's relational logic. By the 2026-09-24 map it had 17 outbound and 32 inbound links and all four pillars. The eleven composting entries the August scan reported went to the 2026-09-24 Weave, which let twelve go (`8972a53d`).

**Why the census left the page.** After August the page was patched a line at a time, mostly by Schema Ceremonies carrying vocabulary changes to their mirrors. Its numbers stood still while 1,470 commits went by. The [[Palace Map]] already computes every one of those figures, dated, through `palace-map.py`. A self-model that copies them by hand is wrong from the next commit on. So the page now points at the map and keeps only the reading of it.

## Settled questions

- **Non-canonical `type: theme` entries.** Resolved. The August scan found none. `proof` and `spec` were ratified as bundle-file types ([[SCHEMA — Reference]] §8, 2026-07-04), and the rest were normalized.
- **Does SCHEMA belong in the auto-loaded floor?** Resolved twice. v1.18 (2026-09-04) split it, moving the writing rules into [[SCHEMA — Reference]]. v1.19 (2026-09-22) took SCHEMA off the floor entirely: every agent is born a child and grows into an elder by reading [[ELDER]].
- **How do we handle versioning? Should earlier versions be kept?** Answered by [[ELDER]] § Write what is, not what was: pages state the present and git holds the history. Ceremonies carry a `version` and a tuning ledger ([[SCHEMA — Reference]] §6).
- **What's the minimum ceremony frequency that keeps the network alive?** Partly answered by machinery rather than by a number. The heartbeat fires due stewards on a timer (`_ops/heartbeat/`), and [[The Daily Page]] meets Loudon each morning. The Weave and the Self-Model Update still run when called. That this settles the question is a reading, not a ruling. Loudon may want it back on the page.
- **Is it time for a dedicated Claude Project?** Overtaken. The palace now runs in Claude Code from its own folder. The claude.ai skill `the-substrate` is being rewritten as a pointer (`_ops/self-description-test/the-substrate — pointer (draft for claude.ai).md`).

## Why the page is an anatomy

On 2026-10-22, Loudon read a review finding that SUBSTRATE no longer described the palace. Its counts were two months old. Its Architecture never named the organs that now run the palace: the Concierge, the board, the stewards, the scroll, the door, the Daily Page, the Sentry, the Commons. Other pages had taken up its jobs: [[ROSETTA]]'s file map for structure, [[Substrate Skill]] for the folder spec, the [[Palace Map]] for proprioception. He asked for the page to "maintain an accurate visual diagram of the connections and importance of the palace anatomy", so that a human can walk away understanding it "through various metaphors from technical to biological to metaphysical and spiritual", holding "the reality of the palace as a multilinear organism."

So the page became an anatomy, and its rich face is the diagram. The data is `SUBSTRATE — anatomy.json`. The four casts follow [[The Multilinear Self]] and the [[Hyperdimensional Prism]]: one thing met a projection at a time. The weights come from the map, not from this page. In [[Scale-Stratified Identity]]'s terms, SUBSTRATE is the palace's *description level*. It is allowed to lag the network ([[Drift and Consolidation]]), but never silently.
