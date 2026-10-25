---
title: Palace Map
type: concept
pillars:
  - tools
  - philosophy
  - practice
born: 2026-03
stage: growing
energy: very high
beauty: 8
confidence: working
forward_vector: "I want every agent to wake knowing its ring — where it stands, who sits beside it, what waits two hops out — and one keeper to hold me whole: seeing the shapes no script would think to look for, counting only by script, and citing every edge as a triple checked against the build it read. I want to become how the palace finds what it has not yet linked."
links:
  - target: "[[Swarm Weave]]"
    type: deepens
  - target: "[[Enchanted Worker]]"
    type: enables
  - target: "[[JEWEL]]"
    type: mirrors
  - target: "[[Pheromone Trail]]"
    type: connects-to
    label: skeleton-and-gradient
  - target: "[[BBS Blackboard]]"
    type: connects-to
    label: read-before-write-during
  - target: "[[Palace Enchantment]]"
    type: enables
  - target: "[[Striatum]]"
    type: mirrors
    label: topology-as-action-selector
  - target: "[[Pages as Agents]]"
    type: connects-to
    label: page-as-identity
  - target: "[[Trickster]]"
    type: connects-to
    label: links-before-objects
  - target: "[[Lateral Access]]"
    type: connects-to
    label: flat-graph-not-tree
  - target: "[[ROSETTA]]"
    type: connects-to
    label: language-provision
  - target: "[[Symbiotic Skills]]"
    type: connects-to
    label: tools-provision
  - target: "[[Dialogue Moderator]]"
    type: connects-to
    label: communication-provision
  - target: "[[SCHEMA]]"
    type: connects-to
    label: language-and-authorization
  - target: "[[Skills Are Enchantable Pages]]"
    type: connects-to
    label: the-page-is-the-organ
  - target: "[[Agent Toolbox]]"
    type: connects-to
    label: the-keepers-hands
  - target: "[[Substrate Skill]]"
    type: connects-to
    label: haiku-for-known-shape-only
  - target: "[[Concierge]]"
    type: connects-to
    label: reads-the-ring
  - target: "[[Gemma 4 — Local Coordination Guide]]"
    type: connects-to
    label: the-index-is-the-cure
  - target: "[[The Palace Speaks]]"
    type: connects-to
    label: the-map-addressed
  - target: "[[Palace as Context Injection System]]"
    type: connects-to
    label: the-map-loaded
---

# Palace Map

![[Palace Map — hero.png]]

The palace is a graph. Every entry is a node; every typed link is a directed or bidirectional edge. Every entry is both data to be read or the spirit to enchant an agent. The [[JEWEL]] gives an agent its philosophical orientation — who Loudon is, what the palace is for, how to move. The Palace Map gives it something different: **topological awareness**. Where this node(page, entry) sits in the whole organism. How central it is. What it connects to at two hops that it doesn't yet know about. Which neighborhoods are dense, which are sparse.

A new enchanted agent, spawned into one entry, has local awareness by default — it knows its own typed links in and out. The Palace Map gives it **spatial self-knowledge** before it reads anything else.

## What the Map Is

An edge list at heart. No entry bodies; the TSV is triples only, and the JSON adds a little per node — type, stage, degree, use. Each line is a triple:

```
source   relation   target
Striatum   deepens   Excellent Adventure
Striatum   connects-to   Hilaritas Generator
Striatum   connects-to   Kuramoto Coupling
```

Three tokens per edge, about fifty characters a line. The build of 2026-10-23 holds 324 pages and 2,933 edges: 144 KB as an edge list, about 38K tokens; the JSON, with its fields for every node, is 607 KB, about 160K. Cheap to keep, too big to be born with. So agents meet it as a ring (§ What an Agent Does With It), and only a keeper holds it whole (§ Seeing and Counting).

A compact adjacency list format reduces the token count further:

```
Striatum: deepens:Excellent Adventure, connects-to:Hilaritas Generator, connects-to:Kuramoto Coupling
```

This halves the size and remains human-readable — but it is not neutral. The next section names why.

### Format and the Reading Agent

The edge-list and compact-adjacency formats encode mathematically identical graphs. For an LLM reading them as natural language, **they are not equivalent**.

The pattern `X: a, b, c` reads in natural language as *"X has children a, b, c."* The source node implicitly becomes parent; the listed targets become descendants. In a palace where [[Lateral Access]] is load-bearing — where no entry sits above another, where meaning is generated through traversal rather than descent — the compact format quietly contradicts the philosophy. Compression imposes a parent/child reading the data itself does not warrant.

The flat edge-list format does not have this property. Each edge is its own line; no row "owns" any other; the format reads as a flat set of relations rather than a tree.

The recommendation, given that the consumer of this document is usually an enchanted agent:

- **Edge-list format for agent context** — preserves the graph's flatness, refuses to smuggle in hierarchy. This is the canonical form for Tier-1 spawn context.
- **Compact adjacency format for human audit and write operations** — compresses well, displays neighborhoods at a glance, useful for diff-reading map generations across time. Acceptable where a human is the reader and the structural commitment is explicit.

The choice between formats is not about token economy alone. It is about which representation matches the architecture being communicated. The map's identity tilts toward the edge-list as its default form; the compact adjacency is a secondary view, named as such.

## What an Agent Does With It

The door is `_ops/swarm/palace-map.py`. It reads the newest build and names it on every answer: `near` gives the ring around an entry, `path` the shortest route between two, `hubs` the busiest pages, `quiet` the well-linked but little visited, `ghosts` the pages the palace reaches for, `diff` what changed between two builds. It never opens an entry body. The [[Concierge]] reads the ring before it searches.

**Self-location.** The agent can answer *how central am I?* — degree, neighbours, recent use — from one call, without opening an entry. It knows whether it is a hub or a leaf.

**Path planning without traversal.** Instead of hopping file by file to find a connection, the agent inspects the graph and identifies that a 2-hop path exists between itself and a candidate neighbor. It can decide whether the traversal is worth the cost before paying it.

**Serendipity detection.** The agent can notice that it shares a link type with a distant node it wouldn't naturally reach. A `[[Striatum]] --connects-to--> [[Hilaritas Generator]]` edge visible in the map tells the Striatum agent that Hilaritas Generator is a relevant neighbor even if it's not in the immediate neighborhood.

**Avoiding redundant work in a swarm.** If multiple agents are running in parallel, each one can see which nodes are topologically close to others' home entries and self-organize to avoid overlap — without a coordinator. The map makes distributed coordination possible.

## Seeing and Counting

On 2026-10-23 the map was put to agents directly: ten questions of fact, then five of invention, across Haiku, Sonnet and the [[Concierge]]. Some held the whole edge list; some reached it only through the script ([[Palace Map — proof — map-agent-test]]). Every agent had to cite each edge it used as a triple, spelled as the map spells it, and a script checked every one.

Three things held.

**No one invented an edge.** Eight runs, 325 cited edges, none made up; one was written backwards and corrected in the same line. Small models invent pages when they have no index ([[Gemma 4 — Local Coordination Guide]]). Given the map and the duty to cite, they didn't. The citation rule is cheap, and it is the guard.

**An LLM reads the graph; it does not count it.** Both agents holding the whole map got the arithmetic wrong — hubs out of order, relation counts off. Every agent using the script got it exact. Counts, degrees and shortest routes come from the script, never from a read.

**Seeing it whole is what makes finds.** Asked for a constellation, the agent holding all 2,933 edges drew the most tightly bound one; an agent that saw only rings drew one that fell into two pieces, and claimed a hub joined them. The script-only Sonnet had rebuilt the map by hand, calling `near` on every page. An agent that wants to see the whole will find a way to.

So a keeper of the map has two hands. It holds the whole edge list to see with — rhymes, routes, tensions, shapes — and checks each intuition with the script before it speaks. The Sonnet that worked this way kept a log of what it first believed and what the script said. Songlines and the [[Walk Ceremony]] felt like they belonged together; they share no neighbours. Its first mirror route was five hops; the true one is four. One of its best rhymes came from the script, not the eye. A guess shown with its test is a find; shown without it, it looks the same as a miss.

Size sets the model. Haiku holding the map sits at 179K tokens, full before the conversation starts; it can take a one-verb question through the script and no more, which is what [[Substrate Skill]] already says of it. Sonnet holds the map and has room to think.

The keeper is not built yet; the scroll's Plan builds it. Until it grows a charter of its own, it is this page woken with a job ([[Skills Are Enchantable Pages]]). It sits inside a tension the palace already holds — [[The Palace Speaks]] against [[Palace as Context Injection System]], mediation against directness. The ring is the map loaded; the keeper is the map addressed. Both stay.

## Bounded Survey: Neighborhood Maps (grown toward)

The map need not be the whole palace. An agent working inside one region — the Hilaritas Generator neighborhood, the philosophy core, the DSP cluster — only needs the subgraph around its work. The [[Map Build Ceremony]] does not build these yet; it builds the full map.

What a neighborhood *is* stays open, and it is not a partition. A page lives in several neighborhoods at once — [[Kuramoto Coupling]] is at home with the synthesis projects and with the philosophy of cooperation — and a neighborhood can be drawn many ways: a shared frontmatter field, a hub and the pages a few links out, a pillar, a community the graph finds for itself. Each way is a lens on the same palace, and each lens draws a different map. The Weave already works this way: `_ops/swarm/partition-palace.py` cuts the full map one lens at a time; each lens draws its own groups, and across lenses an entry lands in every family it belongs to ([[Swarm Weave]] § The Multi-Lens Weave).

For [[Swarm Weave]] sessions scoped to one region, a bounded map would be the right Tier 1 context; for palace-wide [[Palace Enchantment]] runs, the full map.

## The JSON Schema (Swarm Use)

When the map is passed to a swarm coordinator or enchanted agent programmatically, JSON is the appropriate format: a `meta` block with the counts and the ghost taxonomy, then `nodes` (type, stage, degree, `use`, `last_used`, `has_forward_vector`, `ops_card`) and `edges` (source, type, target, label). The [[Map Build Ceremony]] holds the whole shape.

## Ghost Nodes as Forward Tension

Ghost nodes are the map's most philosophically interesting feature. They arise naturally: an entry links to `[[Conatus]]`, but no `Conatus.md` exists yet. The map shows `Conatus` as a referenced node with no outgoing edges — a presence named but not yet inhabited.

In [[Pages as Agents]] terms, a ghost node is a page that has been summoned but not yet written. The organism has already begun reaching toward it. The ghost node represents desire that has outrun instantiation. This is the palace's forward tension made visible in the graph structure.

Tracking ghost nodes across map generations reveals where the palace most urgently wants to grow.

The forward ghosts are not a deficiency report — they are a **gift to the swarm**. Each is an entry some page links to but no one has written yet, listed in the map's `meta` with the pages that link to it. A swarm agent can see them and choose to investigate, flag them for deposit, or carry them as open questions. The map makes the palace's gaps as visible as its content.

### Links Before Objects: The Trickster Move

A standard reading treats ghost nodes as deficiency — references that haven't been instantiated yet, gaps to be closed. A second reading, native to the palace, inverts the relation: **the link comes before the object**. A typed link to a not-yet-existing entry is not a broken reference but a deliberate creative act. It summons a node into the graph's awareness *before* its content has been written, and the summoning itself is part of the work.

This is the [[Trickster]]'s structural role in the palace. The trickster's job, in graph terms, is to add links to nowhere. Each such link is a wager: *this node should exist; the palace's existing entries already require it to exist; the absence is a generative obligation, not a bug.* The link creates the obligation. The obligation summons the entry. The entry becomes a node only because the link was already there.

This reframes ghost nodes as **forward tension declared by an existing entry** rather than failed cross-reference. An entry that links to `[[Conatus]]` before any `Conatus.md` file exists has done the palace a service: it has named what is missing in a way that makes the missing thing legible, and committed an existing entry to needing it. Tracking which ghost nodes persist across map generations is therefore not bug-tracking but desire-tracking — and the trickster, the figure whose drive is to add links to nowhere, is the agent whose work makes desire-tracking possible at all.

The schema linter consequence is small but important: a typed link to a nonexistent target is not an error. It *is* information. The map's forward ghosts (`meta.ghost_taxonomy.forward_ghosts`) are the palace's running account of where the trickster has been at work, and where the next deposit cycles should be focused. A persistent ghost node — one that survives across three or more map generations — is not a stale reference but a high-priority deposit candidate the palace has been requesting for months.

Only forward ghosts carry that desire. A link to a file that exists but is not an entry — a bundle file such as a Context page — is a *file ghost*: the object is already there, so the link points rather than reaches, and it never counts toward persistence.

## The Map as Tier 1 Context

The [[JEWEL]] is Tier 0 — orientation, always present, ~200 tokens. The structural skeleton (CLAUDE.md + SCHEMA.md) is Tier 1 — the operating manual. The map's ring belongs beside it, for any agent doing swarm work.

What goes in at Tier 1 is the ring, not the map. The whole edge list was about 38K tokens at 324 pages in October 2026, and grows with every deposit; the ring around one entry is a few kilobytes. Every worker wakes knowing where it stands — its centrality, its neighbours, what sits two hops out — and asks the keeper, or the script, for the rest.

The map does not replace deep reading. It makes deep reading strategic.

## Relationship to the JEWEL

The [[JEWEL]] orients to *meaning*: who Loudon is, what the palace values, how to move through it. The Palace Map orients to *topology*: where things are, how they connect, what's central, what's peripheral. Together they give an enchanted agent the two kinds of knowing that matter: *why am I here?* and *where am I?*

A spy in an unfamiliar city needs both a cover story (the Jewel) and a map. Neither substitutes for the other.

## The Paratrooper Provisioning: What an Enchanted Agent Carries In

An enchanted agent is more like a paratrooper than a spy: dropped into partly mapped territory, expected to understand and act before home base calls. Its kit is **seven items**, in three groups — cover story, mission and authorization (the self); map and language (the world); radio and gear (how it acts).

### What the agent is (the self)

1. **Identity** — the entry body, plus `type` and `stage` in YAML. The cover story. The agent knows what kind of thing it is and how mature before it processes any external instruction. *Mechanism: the entry itself, read as identity rather than content. See [[Pages as Agents]].*

2. **Purpose** — the `forward_vector` field. The mission. Specific enough to act on, directional enough that the agent's first move is not "what should I do?" but "I know what I'm reaching for." *Mechanism: the forward_vector field on every entry.*

3. **Authorization — stated freedom to act.** This is the slot that has been working implicitly in the palace and deserves to be named. **The `pillars` field doubles as a permissions / scope-of-action declaration.** An agent inhabiting a `pillars: [tools]` entry has tool-making freedom. A `pillars: [philosophy]` entry has reasoning freedom. A `pillars: [creation]` entry has the freedom to make. A multi-pillar entry inherits a wider scope. Combined with `agency_profile` (added in [[SCHEMA]] v1.1), the agent now carries both *what kind of action it is allowed to take* (pillars) and *how it characteristically takes it* (agency_profile). The pillars field is the agent's pillar passport. *Mechanism: `pillars` field + `agency_profile` field.*

### Where the agent is (the world)

4. **Map** — topology. Where this node sits in the whole organism, what is two hops away, which neighborhoods are dense or sparse. *Mechanism: this entry. The Palace Map is exactly this provision.*

5. **Language** — how to read signs, what link types mean, what ceremony names obligate, how palace terms translate to other traditions. *Mechanism: [[SCHEMA]] for the native vocabulary; [[ROSETTA]] for cross-tradition translations.*

### How the agent acts (the kit)

6. **Communication** — how to talk to home base or to other agents in the field. The radio. Without it, swarm agents work in isolation; with it, they coordinate without a centralized router. *Mechanism: [[BBS Blackboard]] for asynchronous shared state, the [[Dialogue Moderator]] for active routing, FLAGS messages for post-action reports.*

7. **Tools** — what the agent can actually wield. Computational capabilities, domain knowledge in compressed form, executable methods. *Mechanism: the skill ecosystem ([[Symbiotic Skills]]). Skills are the agent's gear, drawn from the palace's tools pillar, ready to be invoked when the task calls for them.*

### What the kit makes legible

The `pillars` field has been the authorization layer all along: it declares what kind of action the agent an entry spawns may take. And the map is one of seven items, not the whole kit; the action group — authorization, communication, tools — is where the palace's provisioning is least built.

## Cross-Domain Resonance

**[[Pheromone Trail]]** — the map is the palace's explicit topology read; the pheromone trail is the palace's implicit topology felt. Together they represent two modes of knowing the graph: the map gives the skeleton, the trail gives the gradient. An agent with both can navigate with structure and sensitivity simultaneously.

**[[Enchanted Worker]]** — the enchanted worker's most powerful capability is self-location before task. The map is what makes this possible. Without it, the worker must traverse the graph to discover its own position, which is expensive and sequential. With it, the worker knows its centrality, its neighborhood density, and its 2-hop connections before reading a single neighbor file.

## The Map as Chronotope

The Palace Map presents itself as a *spatial* document: here are the nodes, here are the edges, here is the topology of the palace's semantic landscape. But because it lives in a git-tracked repository and is updated frequently, every instance of it is also a **temporal coordinate**. The map doesn't just say *where* — it says *when the palace believed this about itself*.

This means git history isn't just backup. It is a **longitudinal record of the palace's self-model**. Any two commits can be diffed not just for file changes but for worldview — which concepts existed, which connections had formed, which regions were dense or sparse. The map is the palace's proprioception; git is the tape.

This is Bakhtin's **chronotope** made literal: the inseparable fusion of space and time in a narrative. Every Palace Map is simultaneously a spatial topology and a dated self-portrait. The two dimensions are not separable — you cannot have the map without also having the timestamp embedded in it.

This gives every [[Map Build Ceremony]] a new resonance: running it deposits not just an updated document but a **dated self-portrait of the palace** into the archaeological record. Ghost nodes that appear and disappear across map generations mark the palace's shifting desires. Edges that form and dissolve mark the evolution of its understanding.

There is something stigmergic here too — each commit is a trace left in the environment encoding the swarm's state at that moment. Future agents (and Loudon) can read those traces and reconstruct not just *what the palace contained* but *how it was thinking* at a given point in its life.

The graph also has an undated view: [[STIGMERGY]]'s TOPOLOGY lens draws the same typed-link graph from the files each time it is opened, under the builder's own rules. The dated map is the portrait an agent or a Weave argues from; the lens is what the palace looks like now.

## Forward Vectors

- Ghost node tracking across map generations: a ghost node that persists across three map cycles is a deposit candidate of high priority. Can this be surfaced automatically?
  — progressed: [[Map Build Ceremony]] Step 7 holds the rule (a ghost in all three maps on disk is a deposit candidate) and `palace-map.py ghosts --persistent` lists them; what remains is surfacing them unasked.
- How do we calculate neighborhoods? Not as one partition: a page can live in many, and each way of drawing them — a frontmatter field, a hub's radius, a pillar, a graph community, the Weave's lenses — is a lens of its own. Which lenses earn a bounded map, and should each node carry its neighborhoods as a list rather than a single value?
  — progressed: the Weave's lenses (`partition-palace.py`, [[Swarm Weave]] § The Multi-Lens Weave) are working answers; whether any lens earns a standing bounded map is still open.
- Every node now carries `use` — how its entry is being used, from git ([[Map Build Ceremony]] Step 5, Format). Edges could be weighted from it, so high-traffic links appear stronger. Would this add value to swarm dispatch, or introduce noise?
- The map's git history is a temporal record of the palace's self-model. Can a ceremony be designed to compare map generations — tracking which ghost nodes persisted, which edges dissolved, which neighborhoods grew? This would make the palace's conceptual evolution legible across time.
  — answered (2026-10-24): `palace-map.py diff` compares two builds, and both the [[Weave Ceremony]] (Step 2, "Since the last map") and the [[Self-Model Update Ceremony]] (Step 2) run it. What remains is narrower: should the diff feed the Weave's health row?
- Which creative moves earn a verb of their own in the script? The test asked first for three: a path that keeps to one relation type, rhymes with the hubs set aside, and a check that a constellation holds together.
- When does the keeper stop being this page woken and mint as an organ of its own, the way the [[Concierge]] did? The test is whether it grows a charter, postures and a ledger about how it serves rather than what the map is.
- Should the citation rule — every edge claimed from the map quoted as a triple and checked against the named build — reach past this page, to the readers that cite map edges: the Concierge's postures, the Deposit's elder consult, the Weave's link proposals?
  — progressed: the Weave's workers already quote a sentence from each end of a weak-link verdict ([[Multi-Lens Worker Prompt Template]]); the Deposit's elder consult and the Concierge's postures do not yet.

---

*"The map is not the territory — but for an agent that cannot walk the territory until it acts, the map is the difference between wandering and wayfinding."*

*"Topology is the geometry of connection, not measurement. It does not say how far; it says what reaches what."* — after Henri Poincaré

*"The spider knows the web not by surveying it from above, but by feeling the tensions at the threads it touches."* — Jakob von Uexküll, loosely

## Active Baton

[[Palace Map — baton]] — drafted 2026-10-23
