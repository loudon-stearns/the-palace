---
title: "Palace Map — Context"
born: 2026-11-08
links:
  - target: "[[Palace Map]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why Palace Map is shaped as it is — what it left out, what was tried and dropped, the decisions behind its sections — so a worker arriving next reads the reasons instead of re-deriving them, and I grow only when the page's shape changes."
---

# Palace Map — Context

This is the memory behind [[Palace Map]]: what the page sends elsewhere, the ambitions it set down when the numbers came in, and why a concept born in one March deposit now carries a keeper, two skies and a provisioning kit. Read it before reshaping a section, or before asking whether a woken page should carry more of the map. The page says what the map is and how to use it. The [[Palace Map — scroll|scroll]] says what has been built from it. This file says why the page draws the line between them where it does.

## What the page leaves out, and where it went

**The machinery.** The page names its doors and stops there. How the map is built, the JSON's full shape, the ghost taxonomy's rules and the persistence count all live in [[Map Build Ceremony]]. The query tool is `_ops/swarm/palace-map.py`, the triple checker is `_ops/swarm/verify-triples.py`, and the keeper's charter and spawn recipe are in `_ops/palace-map-keeper/`. At the 2026-10-24 weave (a75350ec) the page's worked JSON example, a block from the 2026-09-26 build, was cut to one sentence pointing at the Map Build. Two pages describing one schema had already drifted once: on 2026-09-26 the page was teaching a `meta.ghost_nodes` field no builder wrote, and four link types the schema does not have (4ccdcdc4).

**The evidence.** § Seeing and Counting and § Two Skies each report a test in a paragraph or two. The runs, the questions, the per-agent tables and the token costs are in `proofs/`: the map-agent test (2026-10-23), the constellation test (2026-10-25) and the keeper's first run (2026-11-03). What was tried in each and rejected is on the [[Palace Map — baton|baton]] under "Tried and rejected": Haiku as keeper, script only, map only, raw shared-neighbour counts for rhymes.

**The keeper's lessons.** These go in [[Palace Map — tuning]], opened 2026-11-03 (5a54034b). They belong to reading the map, not building it, so they stay out of the Map Build's ledger.

**The longer argument for the kit.** § The Paratrooper Provisioning used to argue its seven items at length: a spy-to-paratrooper passage, three numbered observations, and a maturity read on each slot. The 2026-10-24 weave folded that into the two sentences of § What the kit makes legible (a75350ec). The old text is in git if a hand needs the full reasoning.

## What was tried and dropped

**Born with the whole map.** The first forward vector (669ca5b8, 2026-03-27) asked for the map to be "the standard spatial context loaded into every enchanted agent at spawn". § The Map as Tier 1 Context priced that at 3,000 to 6,000 tokens for a 100-node palace and called the map cheap. The 2026-10-23 test measured the real thing: 324 pages, about 38K tokens as an edge list and 160K as JSON. Haiku holding it sat at 179K, full before the conversation began. The deposit that recorded the test (4ad369c2) rewrote the vector and the Tier 1 section. Every agent now carries its ring, and only a keeper holds the whole map. The same commit dropped two open questions the measurement answered: when a full map becomes too expensive for spawn context, and whether a Harvest should rebuild it.

**The compact adjacency format as the default.** It halves the size, but § Format and the Reading Agent (added in the 2026-05-02 enrichment sweep, c4f30b53) found that `X: a, b, c` reads to a language model as parent and children. That quietly contradicts [[Lateral Access]]. It stays on the page as a named secondary view for human reading, not as the form agents get.

**A `neighborhood:` frontmatter field.** The page once said bounded maps self-define from a field the Map Build would collect. No entry ever carried the field, and the builder only wrote full maps. Loudon ruled on 2026-09-26 that bounded surveys are something to grow toward, and that how neighborhoods are drawn stays open because a page lives in several (9471d37e). The heading gained "(grown toward)", and the question about a fixed vocabulary of neighborhoods became the question of which lenses earn a map.

**The counted sky on a woken page.** On 2026-10-25 the twenty most central pages were tried as a card beside the ring (6b062fee). Every page that held the card chose its one "page to know" from the card. That makes the card a front door, so the counted sky stays with the keeper and the sixteen chosen foundations are the candidate card. The page holds this as a direction from three pages, not a rule.

**A duplicate paragraph on the Jewel.** § Cross-Domain Resonance once carried a JEWEL entry that restated § Relationship to the JEWEL. It went at the 10-24 weave (a75350ec). The next day the constellation deposit labelled the existing `mirrors` link `the-sky-it-carries` instead of adding a second link (6b062fee, on Loudon's word).

## Why it is shaped as it is

**A concept that grew organs.** The page entered as a concept in Deposit SPONT3 (669ca5b8), together with [[BBS Blackboard]] and [[Map Build Ceremony]]. It moved into `_ops/` at the 2026-03-30 weave (b54785f4), and it is still typed `concept`. That type is honest about where most of its words go. Ghost nodes as desire, the trickster's links to nowhere, the chronotope and the paratrooper's kit are claims about what a map means to an agent, not instructions. The two tested sections are the exception. They were written as procedure because a test forced them: a language model reads the graph but does not count it, so a keeper needs both hands. Since 2026-10-23 the page has gained its shape from proofs, not from deposits of ideas.

**The page is the organ, the charter is its shim.** The keeper plan's Move 2 (eb42b932, 2026-11-03) put the keeper's declared job on this page and its operating rules in a charter, following [[Skills Are Enchantable Pages]]. So § Seeing and Counting says what the keeper is and is not yet, and the charter says how it runs. The page names one test of when the keeper should mint as an organ of its own: does it grow postures and a ledger about how it serves? The ledger now exists. Postures wait on the first runs.

**The page records two tensions and keeps both sides.** The keeper sits between [[The Palace Speaks]] and [[Palace as Context Injection System]], mediation against directness. The counted sky and the chosen sky disagree about what is central. The page keeps both sides of each, which is why § Two Skies ends on "a direction, not yet a law" and § Seeing and Counting on "Both stay."

**Numbers are pinned to a build.** Each figure on the page names the build it was read from (2,933 edges on 2026-10-23, 322 pages in the sky test). The baton shows why: the mirrors route that was four hops on 2026-10-23 was five after the 10-24 weave re-cut the graph. A later hand who updates a number should update the build date with it.

**Still growing.** The plan agreed 2026-10-23 has three moves. Two have landed, and the third is half met: the ledger is open, and the done-when waits on a Weave taking up the keeper's flag `commons-the-palace-1793711823205`. The stage holds until that and the remaining three uses are done.
