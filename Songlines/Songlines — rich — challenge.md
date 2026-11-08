---
title: "Songlines — rich — challenge"
born: 2026-11-04
links:
  - target: "[[Songlines]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for Songlines' first rich face: one remake with its reason, both offers recomputed by a second engine and a control the maker didn't run, so the next round and Loudon's approval start from what was checked rather than what was claimed."
---

# Songlines — rich — challenge

Proposal round 2026-11, cloud batch 3, 2026-11-04. Challenger: claude-opus-5-5, which did not make this face. Judged against `Songlines.md` as it stands (Cross-Domain Resonance, fingerprint `1be4c70735d6`, in step), the manifest, the piece's source, both bundle scripts, and the maker's commit body (`287beffa`) as its only account.

## Checks run

- `node _ops/rich-face/conform.mjs "Songlines"`: 1 piece, introduced, errors 0, warnings 0, browser pass at 760 and 1130 px.
- `node _ops/rich-face/fingerprint.mjs "Songlines"`: Cross-Domain Resonance `1be4c70735d6`, 1 piece, in step.
- Live face, `rich-server.mjs --detach`, `?entry=Songlines` in headless Chromium at 1130 px: walked to step 4 and ran the test. On screen: null 0.98 / 42; A 117 vs 58.5, 100/100; B 81% worn, 79% even; "matches it, number for number". Console: only the server's Permissions-Policy `bluetooth` header warning. No failed requests, no CDN tags; the piece is fully inline. No sound, so hush and click-to-start do not arise.
- Re-ran `extract-graph.mjs` at the worktree's head: 328 entries, 2,289 body links, 3,592 seen, 416 unresolved; titles, use, words, roads and doors identical to the data inlined in the piece.
- Re-ran `check-walkers.mjs`: every number in the commit body reproduced.
- My own engine (scratchpad, not the piece's code: a different RNG, weights passed in as an array), 100 seeds at 200 walks: even 59, worn 115, ratio 1.95. Then a control the piece does not have: the same use values shuffled across entries.

## The piece

**`Songlines — rich — two-walkers.html` — remake.**

1. *Test or decoration?* A test, and a careful one. The rule is on screen before the run button, both walkers are scored, the even walker is a fair chance level for "no wear", the null at α = 0 can fail and was given bars, and the hop-count confound is measured (worn walks 2,991 hops, even 2,925). B is reported straight: 81% against chance's 79%, said on screen not to tell wear from chance. That is item 11(a) done right.

   What it is missing is the control that asks whether *this palace's* wear does the hiding. With the same use values dealt to random entries, the worn walker still leaves a median 100.5 entries unreached (40 shuffles × 25 seeds; range 83–121), 1.70× chance. Most of A's effect, about 42 of the 58 extra entries, comes from use being uneven at all, not from which entries are worn. Against 200 shuffles, the real use leaves at least as many unreached as 29 of them (real median 112 on those seeds, shuffled median 100): not separable at p ≈ 0.15. A holds as "any walker this unevenly weighted covers less", which is close to arithmetic; as "the palace's own songlines hide country" it passes a scrambled control too. Tuning 12(c): a null a scrambled control also passes is not yet a test of the specific claim.

2. *Faithful?* Mostly. Two places say more than the stand-in shows:
   - Step 3's last sentence, "Walking the same tracks more does not open the land beside them", is wrong on the piece's own numbers. The worn walker's unreached count falls from 175.5 at 50 walks to 28.5 at 5,000 (mine: 172 → 27.5). The ratio grows because chance runs out of country first. The gap in entries rises and then closes: 48.5, 61, 41.5, 21.5 (mine 44, 56, 42, 20.5).
   - "Wear" is entry-use.py's 90-day use: days the page or bundle was edited, plus entries that formed a link to it (`_ops/swarm/entry-use.py:9–18`). That is a proxy for the page's "activated many times" and "sessions sung through": it counts writing, not visits, and it sits on the destination, not on the road. The weights are fixed, so walking never deepens a track. Step 1 states what *u* counts, and the provenance line says "a model … not a record of any session". The caption does neither: it says "follows wear".

3. *Walks up?* Yes. One page and its roads, one walk each, many walks, then the test.

**The remake, in one round:** (a) add a shuffled-use arm, scored, with its bar stated before the run: for example, A-specific holds if real use leaves more unreached than shuffled use in ≥ 95% of permutations. Report what it gives, which on my numbers is that it does not hold, and let the piece say that wear this uneven hides country whoever wears it. (b) Rewrite step 3's last sentence to the absolute counts. (c) Have the caption say that use counts edits and links formed, not visits, and that tracks do not deepen in the model. Keep everything else.

## The offers

**Offer 1 — partly confirmed, partly disputed.** Confirmed: 117 of 293 against 58.5, 100/100 seeds (mine 115 vs 59); 70 hidden entries, median 1,212 words and 3.5 in-links; seven of them one road from Palace Philosophies, named correctly. Disputed: "walking longer widens the gap" and "singing the same tracks longer deepens them". The ratio widens (1.34×, 1.95×, 3.47× at 1,000 on my run, 3.93×), but the worn walker's unreached count falls by about 145 entries and the gap closes after 200 walks. In this model nothing deepens, because the weights never change. Also disputed: the finding as the palace's own pattern, since shuffled use gives 100.5 unreached. Kind: the page already claims that worn paths hide adjacent entries, so what is new is an addition at most. Its true, carryable part: the hidden entries are not thin and some sit one link from a door, which bears out the page's "not because they're wrong or thin".

**Offer 2 — numbers confirmed, kind adjusted.** Computed from `_ops/maps/palace-map-full-2026-11-03.json` directly: 35 of 328 entries are on no body road from the seven doors, 23 of them with no body link in, and 22 of the 35 are reachable on the map's frontmatter links followed in their stated direction (34 if the links are read both ways). The distinction is real, and it is more than a restated definition. These 35 are off the roads because no road was laid, not because no recent session sang them, which is a different cause from the one the page names. It adds to the paragraph and changes none of its claims: an addition, not a claim-change.

## The face as a whole

It makes the idea felt. Watching the worn walker's grid stay pale beside the even walker's at the same budget is the paragraph, seen. It is also unusually honest: the rule comes first, B's non-result is shown, and the provenance names whose numbers these are. Its one overreach is the one the page invites. It shows that uneven attention hides country, then reads that as *this palace's* wear and as tracks deepening, and a shuffle shows neither. One control and two sentences away from keep.
