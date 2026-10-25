---
title: Palace To-Do
type: meta
pillars:
  - practice
  - tools
born: 2026-03
stage: composting
forward_vector: "I am the palace's live worklist, and my discipline is subtraction — I hold about a dozen things Loudon could actually pick up this week, and I push everything else into my archive rather than let myself grow into a document nobody reads. I want every item on me to name its next physical action. I end each cycle by asking what has gone stale on me and moving it out."
links:
  - target: "[[Harvest Ceremony]]"
    type: enables
  - target: "[[Deposit Ceremony]]"
    type: enables
  - target: "[[SUBSTRATE]]"
    type: deepens
  - target: "[[Palace To-Do — Archive]]"
    type: spawned
    label: what-i-set-down
  - target: "[[Loudon Live]]"
    type: connects-to
    label: what-i-feed
---

# Palace To-Do

![[Palace To-Do — hero.png]]

The live worklist. Items here are things Loudon could pick up this week, each with a next physical
action. Everything completed, parked, or waiting on a condition lives in
[[Palace To-Do — Archive]] — nothing is deleted, and a parked item comes back here when its
condition is met.

The list is capped by intent, not by rule: if it grows past roughly a dozen items, that is the
signal to triage, not to scroll.

**What this list feeds: [[Loudon Live]], Loudon's teaching and coaching face, building slowly.** An item earns a slot
here if it feeds that, or if it is cheap and unblocks something that does.

---

## Feeding Loudon Live

- [ ] **AI and the Future of Higher Education** — Loudon's specific hopes, predictions, and the vision he wants to push. Not a brainstorm; a manifesto-level crystallization. This is the philosophy under [[Loudon Live]], and it is the one entry on this list that is straightforwardly *content* rather than infrastructure. Next action: a dedicated session with Loudon talking, Claude drafting.

- [ ] **Legacy artifact migration to the AP Oscillator HTML pattern** — the palace has a canonical form for interactive teaching artifacts (self-contained single-file HTML, no build step, runs offline; reference `Projects/Action Potential Oscillator/neuron_oscillator.html`). Teaching artifacts made in public should all be in it. First migration: `Projects/Piano String Inharmonicity/string_bending_inharmonicity.jsx` → single-file HTML; delete the `... 1.jsx` sync-duplicate while there.

- [ ] **[[Synthesis Topologies]]** — a hub for the family of synthesis architectures (subtractive, FM, granular, wavetable, physical modeling) that the instrument projects keep reaching for. Pointed at by [[Generative Audio Devices]] and [[Generative Preset Development]], and still a seed. Growing it makes the projects legible as a family rather than a list.

- [ ] **An FM synthesis page** — the second of [[Frequency-Time Duality]]'s three doorways has no page of its own behind it. [[Bessel Functions in Synthesis]] holds the sideband maths, the index of modulation and why a 1:1 ratio buzzes, but not the instrument: what a two-operator patch is, or a DX7 algorithm. A sibling of the [[Synthesis Topologies]] hub, still a seed. Next action: a session that writes the page from the doorway inward, then links it from Duality's Three Doorways.

- [ ] **Resonance and Damping** — persistent forward-ghost across four map cycles from [[Differential Equations]]. Central to filter design and physical modeling; several instrument builds will need it underneath them.

- [ ] **Rich faces nominated by the 2026-10-24 weave** — Spinoza Conatus, Hyperdimensional Prism, Boundary-Crossing Instruments, Cross-Domain Resonances, Action Potential Oscillator, Phoneme Choir, 2D Torus Wavetable Synthesizer; the claim each piece would test is in `_ops/swarm/sessions/weave-2026-10-24/checkpoint-2-for-loudon.md` § 12. Next action: Loudon picks the first; Enrichment makes it.

## Own-session threads re-homed from the 2026-09-24 close

Unrelated loose ends the September weave declined to settle in place (each wants its own session, not a weave touch). Re-homed here so they aren't lost — see `Weave Ceremony — Context` for the weave's own record of declining them.

- [ ] **[[Two Batons, One Board]] — the fixture that hardcodes its path** — the entry has three homes across the codebase, and `_ops/stigmergy/app/tests/e2e/state-deck.spec.js:317` hardcodes its exact path as a fixture. If the entry moves, the test breaks silently. Its own session.
- [ ] **[[STIGMERGY Philosophical Lenses]] → The Lens — re-scope, not a fold** — The Lens's own body asks for this re-scope; the weave dropped it as too big for a fold. Its own session.
- [ ] **[[Objects to Think With]] — the 21-project list needs re-deriving** — against Papert's own criterion, not just re-counted. Its own session.
- [ ] **[[Shop/Maker]] — whether the Shop can hold an operated Specialist, and the Producer layer** — an architecture question, plus generalizing the Post-producer charter (Loudon deferred both, 2026-09-02). Its own session.

## Palace upkeep that is cheap and unblocks something

- [ ] **Give the linters a scoped mode** — four of the five (`lint-doc-drift`, `lint-ghost-links`, `lint-link-directions`, `lint-entry-naming`) take no file argument; only `lint-bundle-hygiene` has `--paths`. So [[Deposit Ceremony]] Step 7c, which says run them "over the new files," can only ever ask *is the whole palace clean?* — and against a 52-warning standing baseline, an unchanged total is weak evidence that the work just done is clean. `lint-link-directions` is worse: it reads the newest map JSON, so it is structurally blind to anything deposited since that map was built. A `--paths` flag on the other four, plus a rebuild-or-warn in the direction linter, turns a claim into a check.

- [ ] **Move the RunPod key's remaining readers onto the resolver** — `_ops/commons/runpod_config.py` (2026-09-26) is the one place that knows where the key lives, falling back to the primary checkout so a worktree without the symlink still finds it; the Commons pod provider and `Shop/Hero and Avatar Maker/regen_one.py` use it. Eleven BLUELINE readers still spell the path themselves — the ten pod/serverless orchestrators under `Projects/BLUELINE/proofs/` and `render-backend/serverless_runner.py`. All point at the right path today, but each finds the palace root its own way (seven by absolute path) and can only be proven with a live pod, so move each when BLUELINE work next runs it.

- [x] **Let the dead-link checker read bundle files** — `_ops/swarm/lint-ghost-links.py` scans only entries: it skips any file whose frontmatter has no canon `type` (`:155-157`), and bundle files carry none by design ([[SCHEMA — Reference]] §8). So a dead `[[link]]` inside a bundle file never reaches the Weave, and as more tools fold into bundles, more of the palace goes dark to it. Widen the scan to bundle files, reported apart from entries so the Weave can tell them apart. First known case: `[[PDL]]` in `Shop/VCV Patch Generator/VCV Patch Generator — spec — PDL generation prompt.md`, which dropped out of the lint's sight when the prompt folded into the bundle (D-2026-09-26-PDLGP, the Concierge's flag); move 4 on the [[Generative Audio Devices]] scroll, a PDL Spec page, would give it a target. Loudon asked for this, 2026-09-26. — done by the 2026-10-24 weave: lint-ghost-links.py now scans bundle files into a separate block

- [ ] **`Palace-Verify:` is a self-report** — the trailer that exists to prevent self-report is typed by the agent that did the work ([[Deposit Ceremony]] step 7, "land with the honest verify state"). The palace's own rule is that an agent can report what it *did* and not what it *is*, and verification status is the second kind. Fixing it means deriving the value from something checkable — a linter exit code, a scoped run — or dropping the field rather than letting it assert what it cannot know. Related: the scoped-linter item above is probably its precondition.
  — progressed: [[Deposit Ceremony]] steps 6–7 now verify rather than assert — someone who didn't write it reads the placement cold, and `verified` is allowed only if step 6's checks passed. What remains is deriving the value from a checkable source, which waits on the scoped linters (2026-10-24).

- [ ] **Re-split the Weave and Baton cards** — both were split into a card plus a `— Context` companion, and both cards grew back: Weave ~36 KB, Baton ~28 KB, against the ~8 KB line in [[SCHEMA — Reference]] §6. A card that size teaches every runner that its history is the procedure. Next action: move the history and rationale out again, and keep the steps.

- [ ] **Entry voice diversity** — enchanted voices read too alike. Audit which entries are merely expository versus which carry real voice or opinion, and write guidance for entries that are enchantment candidates. Now coupled to the markup-density work in [[The Palace Voice]]: the drift that flattened entry voice is measurable, and the same check catches both.

- [ ] **Spore check on [[1 from 2]]** — dormant, revival condition is "Loudon ready to return to fiction." Worth one honest read against current work rather than carrying indefinitely: either the condition has moved, or the entry should be re-parked with a date.

## Small fixes the fan-out of 2026-10-20/21 found

The sessions of that fan-out noticed these and fixed none; each line names where it lives and who owns it.

- [ ] **The deck calls a dormant page ready** — `ProjectsDeck.jsx:190` builds `readyRows` from stewarded rows with an answer waiting and nothing running, with no stage check, where `batch-due.js:30` turns a page away by stage first. Owner: [[Project Stewardship System]] and [[STIGMERGY]].
- [ ] **The Commons writer stamps a tool name on a human's flags** — `_ops/commons/board.py:97` fills `health.model` with `claude-code` on every line it writes, TRICKSTER's included. Owner: [[The Commons]].
- [ ] **A rich-face piece should hush when its tab is hidden** — nothing in the rich-face kit silences a playing piece on a hidden page. Owner: the rich-face kit, under [[Enrichment]].
- [x] **`palace-commit --help` prints no usage** — `--help` is an unknown flag, so the committer refuses it; the door's measure counts it the commonest refusal, 19 times in 17 sessions. Owner: [[How the Palace Commits]]. — done by the 2026-10-24 weave: --help prints the usage block from the header and exits 0; one test
- [ ] **`scroll.js --all` filters on status alone, and a new scroll gets an entry nobody asked for** — its header says composting projects are skipped and the filter reads `status` only; at birth it also writes a `backfill-<date>` trail entry. Owner: [[The Scroll]].
- [ ] **A partial close copies a stale worktree field forward** — the remainder card keeps a stale worktree coordinate copied forward from the earlier cards (seen on the STIGMERGY card: `close/2026-10-13-handoffs`, profile docs). Owner: `_ops/stigmergy/close-handoff.mjs`, under [[STIGMERGY]].
- [ ] **Three Revival tool gaps** — `entry-use.py` in a worktree; media mtime in a worktree; and a `--root` flag on `wake.mjs` (Loudon's answer 4, which Revival v2.1 names owed). Owner: [[Revival Ceremony]].
- [ ] **Give the Project Stewardship rite's "land" its own verb** — "land it" is said for the git side and again for the rite's step, two yeses for two landings under one word. A line in the design settles it. Owner: [[Project Stewardship System]].
- [ ] **The CAD Drafter's first job** — the Handwheel's real drawings through the Maker, which is what moves the Specialist from stub to alive. Owner: [[CAD Drafter]], with [[Haptic Handwheel]] and [[Shop/Maker]].
- [ ] **About thirty old merged branches** — merged `claude/*` branches left alone at the close; `git branch --merged main` lists them. Owner: [[Worktree Practice]].

---

## Hygiene rules

- Client work belongs in dedicated Claude Projects, not general chat history. Projects scope the harvest boundary and keep client material from seeping into the palace unexpectedly.
- This card is capped at roughly a dozen items. When it overflows, triage into [[Palace To-Do — Archive]] — do not let it grow a scrollbar.

---

*Everything completed, parked, or condition-blocked — including the STIGMERGY v0.3 / v2.0 / M2 roadmaps, the Orchestrator v0.2 plan, the nine Enchantment next-steps, and the 2026-04-27 Graffiti To-Do — is held verbatim in [[Palace To-Do — Archive]].*

## Active Baton

[[Palace To-Do — baton]] — drafted 2026-10-25
