---
title: "Buckminster Fuller — rich — challenge"
born: 2026-11-04
links:
  - target: "[[Buckminster Fuller]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for Buckminster Fuller's first rich face: two remakes, each a matter of saying plainly what the model's failure routes are, with every headline number recomputed by a second route, so the maker's next round and Loudon's approval start from what was checked rather than what was claimed."
---

# Buckminster Fuller — rich — challenge

Proposal round 2026-11, cloud batch 3, 2026-11-04. Challenger: claude-opus-5-5, which did not make this face. Judged against the page as it stands (`People/Buckminster Fuller.md`, both made sections in step), the manifest, both pieces' source, the maker's `check.mjs`, and the maker's commit body (`64d29b03`) as its only account. A person page: neither piece reproduces anything of Fuller's (no recording, lecture passage or quotation; the only words of his near the face are the page's own). Both pieces are fully inline: no `src=`, no `http`, no CDN or font tag in either file.

## Checks run

- `node _ops/rich-face/conform.mjs "Buckminster Fuller"`: 2 pieces, introduced 2, errors 0, warnings 0, browser pass at 760 and 1130 px.
- `node _ops/rich-face/fingerprint.mjs "Buckminster Fuller"`: The life that shaped the thought `cbe2be1d7fe9` and Where he can't see `ddc2e827c13a`, both in step.
- `node "People/Buckminster Fuller/Buckminster Fuller — rich — check.mjs"`: 20 PASS, 0 FAIL.
- Live face, `rich-server.mjs --detach` at `http://127.0.0.1:8850/?entry=Buckminster%20Fuller`, headless Chromium, scrolled, stepped through all five steps of each piece and pressed Run: both frames loaded; the console held only the host's two Permissions-Policy `bluetooth` warnings. No errors. Stopped after.
- Neither piece makes a sound, so hush and click-to-start have nothing to govern; neither creates an AudioContext.
- My own recompute, in the scratchpad: the trimtab engine loaded from the piece and probed (null with terms removed, the hinge sweep at 0.1 m, the matched path against the direct arm's limits, a work-based ratio, a wider tab travel); the stock-and-flow written again from the caption's equation, not the piece's code, then swept over stock, start use and horizon.

## The life that shaped the thought — `Buckminster Fuller — rich — trimtab.html`

**What kind of claim.** The sentence is a reading of a life: the boom-and-winch shows "the whole of him", "one well-placed mechanical intervention rather than more force", and "that is the trimtab". The piece cannot test the biography and doesn't try; it tests the image the sentence leans on, and its variable is the sentence's own word, *well-placed*. That is a fair test of the image, said so on the sheet ("Every number on this sheet is this model's").

**Tests or decorates?** Tests, and the test can fail: the hinge slider turns the verdict over. My numbers agree with the maker's: L = 7.256 at the trailing edge (E direct 907 kN·m·s, E tab 125.0); settles 56.45 s against 44.15 s direct, delay 12.30 s = 12.00 s counter-push + 0.30 s swing; first hinge where the turn is made, 0.90 m (0.85 m ends at 19.19°, outside 0.5°); at 0.30 m, L 0.88, not made.

**Confounds.** Clean where the brief asked. The matched direct arm stays inside the direct arm's own limits: its path peaks at 10.5° (limit 15°) and 14.8°/s (gear 20°/s), so it is a path the real direct arm could drive. Effort is read at the driven joint in both arms — the tab hinge in one, the rudder stock in the other — which is where the hand pushes. The two arms differ in the route and nothing else. One note, not a defect: the rule chose torque-time, and says why (holding costs effort); by work, ∫|Q dθ|, the same run gives 8,288 against 2,959, a ratio of 2.8. Still above 1.

**The null can fail.** It reads −0.372%; a 2% error in the hold term reads +1.62%, over the 1% limit. It is blind to the inertia and damping terms (dropping either moves it by under 0.3 points), but those move L by under 0.1% (7.258 and 7.251), so the blind spots are ones that don't matter.

**Faithful?** The sheet is, mostly; the caption and the step-5 verdict say more than the run shows, in two places.

1. *L is the lever arms, not "mostly".* At every hinge from 0 to 1.6 m the run's L equals the steady ratio (x_h + k_t·c_t − x_cp) ÷ (k_t·c_t) within 0.1% (7.256 against 7.250 at the trailing edge). Step 4 says "most of this number is lever arms the model sets; step 5 adds what a real turn costs on top", and the verdict repeats "what the run adds is the cost of a real turn". For L, the turn adds 0.08%. What the run adds is the delay.
2. *The failure routes are misnamed in the caption.* "Forward of 0.90 m the turn isn't made, and at 0.30 m L is 0.88" reads as leverage sliding through 1. The sweep says otherwise. L ≤ 1 only between about 0.28 and 0.60 m, and forward of 0.44 m that L is read on a reversed turn. Forward of 0.44 m the tab outpushes its rudder and the ship turns the wrong way (0.30 m ends at −8.7°; 0 m ends at −27.2° with L reading 2.76 on that reversed turn). From 0.60 to 0.85 m, L is 1.0 to 2.6 and the turn fails only because the tab's 30° travel can't push the rudder far enough: give the tab 60° and 0.80 m ends at 19.57°, within tolerance. Step 4's readout already flags the reversal ("the ship turns the wrong way"); the caption doesn't.

**Walks up?** Yes: hull alone, the loaded rudder, the floating rudder, where the tab sits, then the test with its rule written above it.

**Verdict: remake.** Leave the engine and the test alone. Change the words: (a) in step 4, step 5's verdict and the caption, say L is the lever-arm ratio the model sets, within 0.1%, and that the run's contribution is the delay; (b) in the caption, replace "forward of 0.90 m … at 0.30 m L is 0.88" with the three bands: aft of 0.90 m the page is right; from 0.60 to 0.90 m the tab has leverage but its 30° travel can't make the turn (a limit the model sets); forward of about 0.44 m it turns the ship the wrong way. Add a check line for the 0.44 m reversal and the 0.60 m crossing.

## Where he can't see — `Buckminster Fuller — rich — no brake.html`

**What kind of claim.** A systems claim: "do more with less" has no brake, his story has no balancing loop, and the efficiency he wins is reinvested, not banked. The piece tests that sentence and not a neighbour: banked efficiency (step 2) is shown working as slack, spent efficiency (step 3) is the page's case, and step 4 adds the balancing loop the page names as missing. It does not model the page's other clause, that he "assumes growth continues": use here grows only through the rebound. That's fair at sketch tier and worth a line.

**Tests or decorates?** Half two tests: the braked line can fall below 100% and does at a start use of 1.6 (−50%, 70.1% at 1% and 2%), holding up to about 1.349 at stock 10. Half one is weaker than the sheet says.

My numbers, from my own stock-and-flow written from the caption's equation: collapse lines 62.6, 81.1, 92.2, 95.9, 97.8, 98.9% at 1, 2, 5, 10, 20, 50% a cycle; braked 123.5, 160.3, 183.0, 191.7, 197.8, 206.0%. Identical to the piece. The 81.1% is not a horizon artifact (3,000 cycles gives 81.1% too).

**Can half one fail, and what number would have meant failure?** In the page's situation — use above regrowth, a finite stock — not on an unbounded horizon. A rebound just under 100% makes use fall as slowly as you like, so any overdraw drains any finite stock in time: with 100,000 cycles the 2% line is 98.08% at stock 100 and 99.81% at stock 1,000, still below 100%. The band below 100% exists by what the model is; the measurement is its width in 300 cycles. The sheet's only offered failure, a start use at or below 1.0, removes the overdraw, which is the page's situation. And the sheet's own sliders reach a failure the text misattributes: at a start use of 1.05 and stock 30, or 1.1 and stock 40, half one fails (103.1/101.6% and 102.0/101.0% at 1% and 2%) with the overdraw still there. That failure is the 300-cycle horizon, and the failure text says "With the start use at or below what regrows, that is what the model must say".

**Faithful?** Yes, and careful: 100% as arithmetic is stated as such, "this brake is one choice of balancing loop, and a weak one" is on the sheet, and every number is called the model's. The width of the band (81% at stock 10, 93.6% at stock 30, both at start 1.3 and 2%) is the model's number, which the caption says.

**Walks up?** Yes: one stock, banked, spent, the loop, then the sweep.

**Verdict: remake.** Words and one check, not the engine: (a) say in the rule and the caption that half one holds by construction on a long enough horizon whenever use starts above regrowth, and that what the sweep measures is how wide the band is inside 300 cycles; (b) correct the failure text so it names the horizon as the other way half one fails (a small overdraw with a big stock, e.g. 1.05 and 30), not only a start at or below regrowth; (c) add those two to `check.mjs`.

## Offers

**1. Where he can't see, no-claim-edit — confirmed as a no-claim-edit, with one caution on its evidence.** The definition is right. The Jevons paradox names efficiency gains that raise total use; in the rebound literature that is a rebound above 100% ("backfire"), and a rebound below 100% is the rebound effect. The page's parenthesis puts the stronger name on a looser case. Changing the gloss to "(the rebound effect, and at its extreme the Jevons paradox)" leaves the claim unchanged — no balancing loop, efficiency reinvested — so it is a no-claim-edit, not a claim-change. The offer names its own page and section, correctly. The caution: the offer's supporting sentence, "the stock runs out from 81% rebound while use is still falling", is one stock and one start use. At stock 30 it is 93.6%; on a long horizon it approaches 100% for any finite stock. The doubt does bite below Jevons in every case, which supports the edit, but 81% should not travel to the page.

**2. Voice, no-claim-edit — real but slight, a reading of a figure; Loudon's taste.** In the mechanism the hand-sized part is the tab, so "a rudder the size of my hand" is loose if read literally. But the line is the closing voice, first person, and "a rudder for the rudder" is what a trimtab is — the piece's own title says so. Read that way the line is not wrong. Not a finding the text needs; offer it, and lean toward leaving the figure.

## The face as a whole

It makes the page's idea felt, not busy. Both pieces are honest models that walk up one concept at a time, both name their numbers as the model's, and the brief's hard checks hold: the matched arm differs only in route, effort is read where the hand pushes, the null can fail where it matters, and every headline number reproduces by a second route. What both need is the same small thing: say plainly how they can fail. The trimtab's L is its lever arms, and its forward failures are a reversal and a travel limit, not leverage leaking away. The no-brake band below 100% is guaranteed by the model given time, so its width is the finding and the horizon is a failure route the text should name. Together they put Fuller's two halves side by side — the small tab that really does steer, and the same instinct with no loop to stop it — which is what the page asks a reader to hold.
