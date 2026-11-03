---
title: "Enrichment — tuning"
born: 2026-09-24
links:
  - target: "[[Enrichment]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am Enrichment's record of what each run taught it, numbered, each lesson naming the spec change it forced, if any, so the ceremony's version has a reason you can read. Every run leaves a line here; a run that taught something also leaves a numbered item. Never prune what a real run taught."
ledger: tuning
standards:
  for: "what each enrichment taught Enrichment"
  run: "one enrichment of one page"
  line: "- run · <date> · v<version> · <what it ran on> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid"
  writes: "the run itself, in the commit that records it"
  merge: union
  kept: git
  trim: never
---

# Enrichment — tuning

What each enrichment taught the ceremony, appended after a run that taught it something. Each item names what the run showed and the spec change it forced, if any. Lessons that changed only the tool live in `_ops/rich-face/README.md`. Newest last.

## From the assessment and the first rich face — Kuramoto Coupling, 2026-09-24

1. **Breadth starved every page, and the machine that fed it failed silently.** Five small cards spread across many entries never transformed one. The queue's worker ran a test stub in May, hit a usage limit in June, and had no retry, so responses sat for four months; the critic passed 29 of 30 cards. Forced: **v2.0** — depth on one page with the whole Shop, no queue, no worker, no critic; the rich face replaces the card.
2. **Gathering paid before making did.** Kuramoto's bundle held two narrations and an ambient bed that nothing linked to. Forced: step 1, gather first.
3. **A piece that tests the text beats one that illustrates it.** The Path B piece confirmed the entry's waveform claim; building the stubbornness piece found a condition the text lacked (an anchor needs K_send as well as K_receive → 0). Forced: step 2's preference and step 6, carry findings home.

## From Closing Well, 2026-09-25

4. **Loudon named the placement rule directly.** Enrichment already leaned toward the rich face in practice, but the ceremony never said so. His words, quoted rather than smoothed: "Now that we have the rich face, we should tend to place enrichments in the rich face and keep the main page text, but do not hold this as a strict rule. If a diagram or image is really necessary for understanding the text, like if the text is talking about an image, or a signal flow diagram is fundamental to understanding the text, then we leave it in. Enrichments are not necessary for understanding the text, leave in the text what is necessary (like formulas, and essential graphics)." Forced: the intro names the tendency, and step 1 carries the rule in full. v2.1.
5. **A finding was written into a mature hub without being shown, then had to be cut, then restored.** The Kuramoto K_send paragraph went into a mature hub unshown (025528fd), was cut on a quick call (c9a8c7a8), and was restored only after Loudon read it at the close panel (b9f57b16) — a round trip a shown-first step would have skipped. Forced: step 6 splits by size — a small edit is shown to Loudon before it's written; a finding that changes what the page says goes home through the [[Deposit Ceremony]]'s map, which he approves. v2.1.

## From the face switch, 2026-09-25

6. **The door line would not scale.** Every enriched entry carried a hand-written link to its rich face under the hero. Loudon: "right now it is a link in the body text, as we have more and more enriched pages this will not be acceptable." The face switch (`617745f0`, landed in `207d937e`) now reads an entry's faces from its bundle and offers the rich face wherever the manifest sits. Forced: step 7 drops the door and is just the commit; the postcondition names the manifest in the bundle, not the door line; the intro loses its door clause, and the rich-face section names the switch as the way in. v2.3.

## From the review-notes baton, 2026-10-13

7. **The ceremony never read what Loudon had already said about the page.** The rich face's review dock posts his section notes to the board, and [[Review Layer]] makes them for the next round to act on, but no step read them, and nothing turned them into work. Closing Well caught the gap on 2026-09-25; the QUEUE now carries each note as an item (`25837dc0`). Forced: step 1 reads a page's earlier notes before making anything, and the commit names the ones the run took up. v2.4.
- run · 2026-10-13 · v2.3 · Language as a Tonal Medium · nothing new

## From the Kuramoto face-switch cleanup, 2026-10-13

8. **A bare `--stamp` re-stamps a section held drifted on purpose.** Step 5 runs `fingerprint.mjs "<Entry>" --stamp` bare, and a bare stamp covers every drifted section with no sign that one was held. Kuramoto's "Asymmetric Coupling: The Stubbornness Parameter" is held drifted on purpose (stamped `f19f12592784`, prose now `084c089b289f`; `48bda7a1`): it wants a real re-tune, not a quiet stamp, and a bare stamp would give it one. Spec change: step 5 stamps by section name whenever any section is held. **Paid in v2.7, 2026-10-25.**

## From the Dissolutions sits, 2026-10-25

9. **The test came first, and the person it was for couldn't reach it.** Step 2 prefers a piece that tests its section's claim (item 3), and Dissolutions' Plan asks the same of its proofs in nearly the same words. Loudon played three of its six proofs on 2026-10-25 and sent all six back with one note: "these are the end of a proof, we need to work our way there with each of them." The preference holds; its place moves. Forced: step 2 says the test is the last step, reached by steps that take one concept alone ([[Progressive Staging]]), and step 3 says the tier is how finished the face is, not where a piece starts. v2.6.
- correction · 2026-10-25 · item 8's "the version stays v2.4" was true when it was written and is not now: v2.5 came at 37853d97 (a piece declares what it needs; conform.mjs reads every piece) and v2.6 at 450a3a84 (item 9). Item 8's change is still unmade: step 5 still stamps bare, though `fingerprint.mjs` already takes a section name after `--stamp`.
- run · 2026-10-25 · v2.5 · Frequency-Time Duality · nothing new

## From the proposal round, 2026-11-03

10. **Loudon asked for breadth again, and item 1 says breadth starved every page.** His words: "I am interested in enriching as much of the palace as possible … keep the enrichments as pending or proposal until I approve them. They should still live in the page's rich face, but clearly noted as proposal until I approve or revise them … all the enrichments are vetted and challenged by other agents before added" — and, on reading the process drafted from that, "all approve, proceed". The tension with item 1 is real and held, not resolved: the May queue spread five small cards across many entries, its critic passed 29 of 30, and no page was transformed. This round keeps what v2.0 learned — one agent per page, each at depth, the whole Shop — and adds what the critic lacked: a challenger who did not make the face and must give a reason for every verdict, with retire dropped before landing. What breadth costs is the text's authority, so the round never writes the `.md`: findings wait as offers, and every made section is a proposal until Loudon approves it, section by section, over weeks if he likes. Forced: the trigger gains the proposal round; step 6 is the challenge; step 7 holds findings as offers in a round; step 8's commit line gains `· proposal`; a new section, Proposal and approval, with `approve.mjs` and `proposals.mjs`; the manifest gains `status`, `proposed`, `approved`, `challenge` and `offers` (`_ops/rich-face/README.md`, [[SCHEMA — Reference]] §8). v2.8. Open: whether the dock's approve button is enough, or he wants to approve from the QUEUE.
- run · 2026-11-03 · v2.7 with the proposal-round settings · Compressor Design · nothing new
- run · 2026-11-03 · v2.7 with the proposal-round settings · Rational Hearing · nothing new
- run · 2026-11-03 · v2.7 with the proposal-round settings · Dispersion · nothing new
- run · 2026-11-03 · v2.7 with the proposal-round settings · Typography as Meaning · nothing new
- run · 2026-11-03 · v2.7 with the proposal-round settings · Ohm's Law · nothing new
- run · 2026-11-03 · v2.7 with the proposal-round settings · Latent Error · nothing new
- run · 2026-11-03 · v2.7 with the proposal-round settings · Progressive Staging · nothing new
- run · 2026-11-03 · v2.7 with the proposal-round settings · GenAI Camera · nothing new
- run · 2026-11-03 · v2.7 with the proposal-round settings · The Lens · nothing new
