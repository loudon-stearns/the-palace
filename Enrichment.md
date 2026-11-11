---
title: "Enrichment"
type: meta
pillars: [creation, tools, practice, philosophy]
born: 2026-05-04
stage: growing
confidence: working
energy: very high
version: "2.10"
trigger: ["enrich [page]", "enrich this page", "let's enrich [page]", "enrich the palace", "proposal round", "enrich these pages"]
forward_vector: "I am the ceremony that makes one page as rich as the Shop can make it — sound, image and interaction laid beside the entry's own words, which I read live and never copy. I want every enriched page to be something you can play, and every piece I make to test the text rather than decorate it; when a piece teaches the text something, I carry it home — shown to Loudon first, and through the Deposit Ceremony's map when it changes what the page says."
links:
  - target: "[[Palace Ceremonies]]"
    type: connects-to
    label: ceremony-registry
  - target: "[[The Scroll]]"
    type: connects-to
    label: sibling-face
  - target: "[[The Shop]]"
    type: connects-to
    label: the-makers
  - target: "[[Drift and Consolidation]]"
    type: connects-to
    label: disclosed-drift
  - target: "[[SCHEMA]]"
    type: connects-to
    label: face-not-canon
  - target: "[[Hilaritas Generator]]"
    type: exemplifies
    label: a-page-that-plays
  - target: "[[Loudon Live Design System]]"
    type: connects-to
    label: house-dress
  - target: "[[STIGMERGY]]"
    type: connects-to
    label: mounted-at-rich
  - target: "[[Kuramoto Coupling]]"
    type: connects-to
    label: first-rich-face
  - target: "[[Latent Error]]"
    type: connects-to
    label: the-hidden-assumption
  - target: "[[Deposit Ceremony]]"
    type: connects-to
    label: findings-gate
  - target: "[[Progressive Staging]]"
    type: connects-to
    label: the-test-is-the-last-step
---

# Enrichment

![[Enrichment — hero.png]]

Say **"enrich [page]"** and the whole [[The Shop|Shop]] goes to work on one page, until it does what text can't: you hear the claim, play the equation, watch the idea move. What comes out is the page's **rich face** — the entry's own words as the spine, read live from the `.md`, with sound, image and interaction laid beside the headings they serve.

The plain page stays plain. The `.md` is the considered truth and keeps its beauty in Obsidian; the rich face is a reading of it, not a copy ([[SCHEMA]] §1). The face is jewelry and the page gets the care: Loudon wants enrichment abundant, polished as he tweaks it over time, and never treated as canon the rest of the palace relies on — "this is jewelry, and I can polish the jewlery over time" (Loudon, 2026-11-04). Enrichment tends — not as a strict rule — to place what it makes in the rich face and leave the text alone; the text still keeps what it needs to be understood, like formulas and essential graphics. When making teaches the text something, an edit that changes no claim is shown to Loudon before it's written; a finding that changes what the page says goes home through the [[Deposit Ceremony]]'s map, which he approves.

## Trigger

*"Enrich [page]"*, *"enrich this page"*, *"let's enrich [page]"*. One page per agent — depth, not coverage.

**The proposal round.** *"Enrich the palace"*, *"proposal round"*, *"enrich these pages"* runs the ceremony on many pages at once: one agent per page, each in its own worktree, each page still at depth. The round changes three things and nothing else. The plain `.md` is never written during the round — what making teaches the text waits as an offer (step 7). A second agent challenges every piece before it lands (step 6). And every section a round makes carries `status: proposal` until Loudon approves it (§ Proposal and approval). Loudon, 2026-11-03: "all the enrichments are vetted and challenged by other agents before added."

## The rich face

In [[STIGMERGY]] the face switch at the right of an entry's top bar offers it on every page — `F` cycles text, rich, scroll — and opens it as its own page, the whole tab. The floating companion lives on the text face only; on the rich face, the notes and their dock are how you answer it. The direct address is `http://localhost:5173/rich/?entry=<Entry>`, or `node _ops/rich-face/rich-server.mjs --detach` serves the same page on a port leased to it and prints its address; add `?entry=<Entry>`. Any entry opens there; one that hasn't been enriched shows its text and the media it already embeds.

- **Three kinds of material, each labelled.** Figures the text already carries render as media, with their captions. Pieces the Shop *gathered* from the bundle and pieces it *made* live in a manifest, `[Entry]/[Entry] — rich.json`, keyed by heading. Small pieces sit in the margin beside their paragraph; video and interactives span the page beneath it. A page may carry a low room-tone bed.
- **Made pieces live in the bundle** as `[Entry] — rich — <what>.<ext>`, self-describing like any bundle file; a coherent set of files gets one folder named for what the set is. Gathered pieces keep their names. A piece's `near` places it beside the paragraph or figure it clarifies, not at the bottom.
- **The review is built in.** Every section has a note (◇); the dock sends them to the board as a `human_eval` from TRICKSTER ([[Review Layer]]).
- **Sibling of [[The Scroll]].** The scroll shows what a page has *made*, newest first; the rich face shows the page's *idea*, in the order of the idea.

The renderer, its server and the fingerprint tool are `_ops/rich-face/` (README there: the manifest format, the piece gotchas). A rich face is a whole page — not STIGMERGY's *inline rich content*, the artifacts a single board message can carry.

## The steps

0. **Open with the tail read of [[Enrichment — tuning]]** ([[SCHEMA — Reference]] §6). Those are this run's first candidates for a spec change.
1. **Read the entry whole, then its bundle. Gather first.** The forward vector is the brief: the page should be made rich in the direction it already leans. Bundles hold media nothing links to — narrations, beds, renders from earlier rounds. **Then read what Loudon already said.** Every note he left on the page waits on the board as a `human_eval` until someone grants or denies it: his notes from an earlier round's review dock and his answers to a rough about the page, both ([[Review Layer]] § How the answers come back). `node _ops/loudon-eval/read-answers.mjs --page "<Entry>" --open` reads the open ones, the same ones the QUEUE shows. They are his part of the brief: read them before making anything, and say in the commit which ones this run took up. The placement tendency, in Loudon's own words, not smoothed: "Now that we have the rich face, we should tend to place enrichments in the rich face and keep the main page text, but do not hold this as a strict rule. If a diagram or image is really necessary for understanding the text, like if the text is talking about an image, or a signal flow diagram is fundamental to understanding the text, then we leave it in. Enrichments are not necessary for understanding the text, leave in the text what is necessary (like formulas, and essential graphics)."
2. **Walk it section by section** and ask one question: what can only be shown, heard or played here? Prefer a piece that **tests the section's claim** over one that illustrates it — or one that shows what the section takes for granted without saying ([[Latent Error]]). The test is the last step, not the first: a piece that tests a hard claim opens on one concept alone and walks up to it ([[Progressive Staging]]). A face opens on a hook: something visceral, outside the technical, that gives a reason to dig in. Whether the hook is the proof itself or comes before it is the topic's to decide (Loudon, 2026-11-10: "allow the topic to bend the form"). A face whose only interaction is a chart with faders has no hook yet. A piece with nothing to test and nothing to make felt doesn't ship.
3. **Make it with the Shop**, at one tier for the whole page — a Sketch tonight, a Study, a Piece over days. The tier is how finished the face is, not where a piece starts: a Sketch still walks up to its test. The [[Maker]] picks the Specialists. Equations appear twice, symbols and words ([[Loudon Live Design System]]). **Each piece declares what it needs from its host** in its own `<head>`; a gathered proof is a record, so its manifest entry carries a `contract` block instead. The rules, and the shelf a CDN library loads from: `_ops/rich-face/README.md` § What the page lets run.
4. **Verify what can be verified.** Run each piece's engine against the claim it makes; load the page and read the console. Then `node _ops/rich-face/conform.mjs "<Entry>"`, which reads every piece against its declaration and its code and loads each in headless Chromium; put its table in the commit. A file it lists as *only on this Mac* shows a box on the public face: track the ones the face needs, by the step it prints. Name what you couldn't check — an agent can't hear the mix.
5. **Stamp** each section the run made or checked, by name: `node _ops/rich-face/fingerprint.mjs "<Entry>" --stamp "<Section>"`. A bare `--stamp` covers every drifted section, one held drifted on purpose too (Kuramoto's "Asymmetric Coupling: The Stubbornness Parameter"), so keep it for a page with no section held.
6. **The challenge.** A second agent that did not make the face loads the entry, the manifest and every piece, runs `conform.mjs`, and gives each piece a verdict with a reason — **keep**, **remake** or **retire** — against three questions: does it test the claim or decorate it; is it faithful to what the text says; does it walk up ([[Progressive Staging]]). Remake gets one round, then a second verdict. Retire is dropped before landing: the file goes, and the manifest with it. The record stays in the bundle as workshop, `[Entry] — rich — challenge.md`, and the manifest's section carries the verdicts in its `challenge` block. In a single-page run the maker may ask for a challenge; in a proposal round it is not optional.
7. **Carry findings home, split by what they change.** When making a piece teaches the text something: an edit that changes no claim — a unit fixed, a symbol renamed to match the piece — is shown to Loudon before it's written, then re-stamp that section. A finding that changes what the page *says* goes home through the [[Deposit Ceremony]]'s map, which Loudon approves, before it's written. **In a proposal round nothing is written to the text:** each finding goes into the manifest's `offers` list, named by section and kind (`no-claim-edit` or `claim-change`), and waits there for Loudon; `proposals.mjs` lists the open ones.
8. **Commit** `enrich(<Entry>): <what> — <tier>`, and in a proposal round `enrich(<Entry>): <what> — <tier> · proposal`. The body names the version the run ran under, what was and wasn't verified, the challenger's verdicts (how many kept, remade, retired, and why each retire), and what this run taught the ceremony ("nothing" is a legal answer); the run marks the tuning file with its run line, and a lesson that changed the spec also goes there as a numbered item.

## Proposal and approval

Every section a proposal round makes carries `status: proposal` in the manifest, with a `proposed` block naming the date, the maker and the round. The face shows a chip on each of that section's figures — *proposal · date* — on the live page and the public one alike, and the page head counts the sections still waiting. Loudon, 2026-11-03: "keep the enrichments as pending or proposal until I approve them. They should still live in the page's rich face, but clearly noted as proposal until I approve or revise them."

Approval is per section and Loudon's alone, at his own pace: a note on the section from the review dock, or his word in chat. `node _ops/rich-face/approve.mjs "<Entry>" "<Section>"` flips the section to `approved` and writes who and how; `--all` takes every proposal section on the page. A revision note is the next round's brief — step 1 already reads every note he left. A section with no `status` is approved: the faces made before this round stand as they are. `node _ops/rich-face/proposals.mjs` lists every section still at proposal across the palace, with its age and its challenger's counts, and every open offer. The field shapes are in `_ops/rich-face/README.md` § The manifest.

## Drift — how the two faces stay honest

Drift is disclosed, not prevented ([[Drift and Consolidation]]); when the faces disagree, the text wins.

- **Words can't drift.** The rich face never holds the entry's words; it reads them on every look and re-reads every few seconds.
- **Placement** can: a renamed heading strands its pieces in *Lost its place*, never dropped — with *probably a rename* when the words under a new heading match the old stamp. A piece whose anchor phrase is gone moves to its section's end, and says why.
- **Meaning** can, and a machine can't see it. Each section of the manifest is stamped with a fingerprint of the prose its pieces were made against; when the prose changes, those pieces carry *made against an earlier version of this section*. The re-tune reads only flagged sections and decides per piece: still true (re-stamp that section), remake, or retire.

## Postcondition

The manifest's sections all read *in step* under `fingerprint.mjs`; every made piece is in the bundle, named and self-describing; the manifest sits in the bundle, so the entry list marks the page enriched; the page renders at `/rich/` with a clean console and its review dock; `conform.mjs` names no error on the face's pieces, or the commit names each one and why it stands; the commit body says what was verified and what wasn't. In a proposal round, also: the `.md` is byte-for-byte what it was; every made section carries `status: proposal`; every piece has a challenger's verdict and no retired piece landed; the challenge record is in the bundle.

---

*The version and what each run taught the ceremony: [[Enrichment — tuning]]. The first rich face: [[Kuramoto Coupling]].*

## Active Baton

[[Enrichment — baton — rich-face nominations 2026-11]] — drafted 2026-11-08
[[Enrichment — baton — hook pilot 2026-11]] — drafted 2026-11-11
