# C2a — Contexts owed (Weave 2026-11-08)

Flag carried: `commons-the-palace-1792897100361`. Five Contexts written, five parent links added (`spawned` [rationale-archive], block style, appended at the end of each `links:` block). Two pages stopped under the brief's Archive rule. No git writes.

## Stopped: Archive/ present, coordinator rules

- **Loudon Live** (`Projects/Loudon Live/Archive/`): holds `Loudon Live — Curriculum Map.md`, its 2026-05-04 priority-guide HTML, and `Loudon Live — asset plan.md`. These were archived as retired bundle files on 2026-09-26 (`a22b039b`). They are not Contexts. Nothing written.
- **Crystal Synthesizer** (`Projects/Crystal Synthesizer/Archive/`): holds `Crystal Synthesizer — Staging.md` and `Crystal Synthesizer — spec — Loudon Live sessions.md` (the latter archived by `a22b039b`). Nothing written.

## Written

**2D Torus Wavetable Synthesizer**: `Projects/2D Torus Wavetable Synthesizer/2D Torus Wavetable Synthesizer — Context.md`, 1392 words.
- Left out: answered well (the Étude cycles, the VST order, the strategy bet from the composted page, seven links held from the other side, each one checked).
- Tried and dropped: answered well (the second dimension as the mechanism, lattice shear, the Theta symmetry example, one seventh surface becoming three).
- Shape: answered well.
- Commits: e58548d8, 09262fa2, a75350ec, b3b7d5e0, ca454ba2, e8dc7318, 769c93ad, 050af498, a22b039b, 39a1a54e, 340d4598, c2480ee3, 5ae5b0f9, 2488e3d9; board torus-steward-022/-031/-034/-042/-049.
- Not verified: I found no answer on the board to `torus-steward-022`. I did not check the Lost Branches against the palace.

**Action Potential Oscillator**: `Projects/Action Potential Oscillator/Action Potential Oscillator — Context.md`, 1273 words.
- Left out: answered well.
- Tried and dropped: answered well (the isomorphism edits held in Palace Graffiti, the Claude-project source line, the missing codebox, the Faust/Gen~ question).
- Shape: answered well.
- Commits: a75350ec, 929de8c5, ca454ba2, c82561a1, 769c93ad, 8da2e1f3, 11a7eec2, 7c9de128, a2a77dd8, b54785f4, 6c356eb4; board apo-steward-012/-020.
- Not verified: the page says "The Stage 4 codebox and its interface text are in this page's folder". Neither the challenger (`11a7eec2`) nor I could find it. I did not check the nine folded links from their other sides.

**Loudon Live Design System**: `Palace development/Loudon Live Design System/Loudon Live Design System — Context.md`, about 1260 words.
- Left out: answered well.
- Tried and dropped: answered well (no cyan, the audience stamp, the baton rethink, BBS as a sibling).
- Shape: answered well (the May, July and October rebuilds, why the floor appears twice).
- Commits: 023dd3fd, f2567624, df2e3c14, 3c817503, 38bbe523, 863a34d1, 258d73cc, 9a7f3d18, 42dc4091, 876d2054, 94b53d49, 94d9b885, cb63fa8d, 79e88bde, 74d578ec, 3a6c437a, 3b3e7a42, 7463e92d, e451140e.
- Not verified: the count of which specialist pages mention the system (4 of 8) comes from a name search. Lane A was editing Shop pages during this run, so the count may move.

**Portamento and Physical Pitch Modeling**: `Projects/Portamento and Physical Pitch Modeling/Portamento and Physical Pitch Modeling — Context.md`, about 1200 words.
- Left out: answered well.
- Tried and dropped: answered well (REAL-RECORDINGS and PROGRESSIVE-CURRICULUM passed over for MULTI-MODE on 2026-08-26).
- Shape: answered thinly for the body. It is January writing that came into git whole, and the founding conversation of 2026-01-06 is not in git.
- Commits: 4169e6ad, b54785f4, c2dd3616, e1d3a66f, 1c964395, 17e99b33, 050af498, 74543f34, a75350ec, a22b039b; board portamento-steward-014/-015/-028.
- Not verified: nothing in the record shows the formulas being checked.

**Identity Molting**: `Identity Molting/Identity Molting — Context.md`, about 1065 words. The bundle folder already existed (faces only).
- Left out: answered well (the molt catalogue went to The Gallery, `1e9fd845`; four links held from the other side; the narrative-therapy kinship).
- Tried and dropped: answered thinly. Little was dropped.
- Shape: answered thinly. The page came into git whole in an unrelated deposit (`669ca5b8`), and its founding conversation is not recorded. The Context says so and names what to record.
- Commits: 669ca5b8, c2dd3616, 1c964395, 674f262c, 1e9fd845, 769c93ad, 050af498, 17e99b33, b54785f4, a22b039b, 863a34d1; flag commons-…-1790128920547.
- Not verified: the attributions in the closing quotations.

## Found on the way, not touched

1. **APO ↔ Progressive Staging carries two links.** APO `emerged-from` PS (`b54785f4`), and PS `enables` APO. Both make the method the ground, but `Progressive Staging.md:43` says the principle emerged from building APO. `lint-link-pairs.py` passes the pair as lineage.
2. **LLDS forward vector** still ends "BBS the swarm terminal". It was missed by the BBS fold (`94b53d49`).
3. **LLDS `spawned` [[Loudon Live — asset plan]]** (`cemented-from`) reads backwards against its own § Origin.
4. **Torus Forward Vectors** still says "beyond seven" over a list of nine.
5. **Torus page sentence** "Theta's modular symmetry vs. Membrane's 4-fold" is contradicted by the built tables (`340d4598`). This is a canon edit for Loudon.
6. **Identity Molting `mirrors` [[Progressive Staging]]** has no label and no body reason. Under the Standing Order it is a candidate for a reason or a cut.
7. **APO "Stage 6 dialogue" heading** means the enchantment programme's Stage 6, not an oscillator stage.

## For Loudon

- Identity Molting § Personal Application names "learning architect". Does that still name what is forming, given the coach portrait of 2026-10-14?
- Is there a source for Identity Molting's founding conversation, and for Portamento's 2026-01-06 conversation?

## Audit after

`python3 _ops/swarm/bundle-audit.py | grep -A20 'CONTEXT OWED'` still names two of my pages, both stopped under the Archive rule:

```
  in= 29   9 KB  Loudon Live  (project/growing) — inbound 29
  in= 12  17 KB  Crystal Synthesizer  (project/fruiting) — fruiting
```

The third line, Shepard Tone Synthesizer, is C2b's. `lint-ghost-links.py` shows nothing from my five files (one ghost link, to the composted Infeasible DSP Now Shippable, was unlinked). `lint-bundle-hygiene.py` reports 0 errors.

## Addendum: the two stopped pages, written on the coordinator's ruling

The coordinator ruled that neither `Archive/` holds a Context, so the stop rule does not apply. Both Contexts are now written, and each parent page has its `spawned` [rationale-archive] link in block style. I read the archived files as tried-and-dropped history.

**Loudon Live**: `Projects/Loudon Live/Loudon Live — Context.md`, 1362 words. Parent link added to `Projects/Loudon Live.md`.
- Left out: answered well (LDN RTM, the mechanics of the read view, the coaching self-assessment kept off git, the launch kit).
- Tried and dropped: answered well. The Context covers the three portraits (May curriculum channel, September whole public self, October teaching and coaching face), the Curriculum Map with its entry points, arcs and gaps list, the four-tier priority guide of 2026-05-04, the asset plan, and the reputation engine.
- Shape: answered well.
- Commits: 605aefc0, a5ca537b, a22b039b, 016ec791, c82561a1, adc728ee, 5eac9572, 67c820c0, b63b896b, 16e8e514, 3a36791b, 6c356eb4, 769c93ad, 9671412f.
- Not verified: the cleanup commit (`a5ca537b`) gives no reason for the change from hub to project. I could not find which commit dropped the May open question on palace work as a topic, so the Context leaves it out.
- Found: the link to the Torus, labelled `signature-instrument-candidate`, outlives the question it came from. Crystal's Standing Orders, and a note on this page's scroll, still carry the retired portrait.

**Crystal Synthesizer**: `Projects/Crystal Synthesizer/Crystal Synthesizer — Context.md`, about 1250 words. Parent link added to `Projects/Crystal Synthesizer.md`.
- Left out: answered well.
- Tried and dropped: answered well (the five-session staging and its retirement in two steps, the fidelity question merged into The Metaphor Stretch, H90 kept and then overtaken by the VST order).
- Shape: answered well. The turning point was Loudon's first-person comment of 2026-03-25 ("I don't believe these descriptions…", `46d904fe`). The 2026-04-07 Weave answered it by recasting every sound description as a hypothesis (`c2dd3616`).
- Commits: 4169e6ad, 46d904fe, c2dd3616, a75350ec, 76e60f39, d4cb3fa1, a22b039b, 929de8c5, ca454ba2, 016ec791, 3e8c896c, 8972a53d, 769c93ad, 050af498, a5ca537b; board crystal-synth-steward-018, -029, -032.
- Found:
  - The scroll's Standing Orders still carry the April Alignment Record (Gen~ inside RNBO, the 70/30 session ratio, "the audience is autodidact polymaths") underneath the Max pause and the VST order. Only Loudon can retire them.
  - The labradorite hypothesis line is contradicted by `crystal-rings/` but has not been updated.
  - A stray design note sits under the Bravais heading (`46d904fe`).
  - Seven frontmatter links have no label.

**Audit after the addendum:** `python3 _ops/swarm/bundle-audit.py | grep -A20 'CONTEXT OWED'` prints `CONTEXT OWED (0)`. No owed Context remains, mine or C2b's. `lint-ghost-links.py` shows nothing from either new file.
