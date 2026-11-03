---
title: "Semantic Delay — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Semantic Delay]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for Semantic Delay's first rich face: each piece judged by whether it tests the page, stays faithful to it and walks up, and each of the maker's four offers recomputed, so the remake round and Loudon start from numbers, not trust."
---

# Semantic Delay — rich — challenge

Proposal round, 2026-11-03. Challenger: claude-opus-5-5, who did not make this face. I judged it from the page, the four pieces and the maker's commit body (2ea876ae; the maker amended its own unlanded commit once, cddc7375 → 2ea876ae, which a worktree allows). I also read the steward's latest cycle (cycle 11).

**Verdicts: 2 keep, 2 remake, 0 retire.**

## The pieces

### Rhythmic Coupling: Two-Stage Pool-Then-Select

**`stage4-real-coupling-contours.png` (gathered) — keep.**
1. Test or decoration: it's a record, not a test, but it's the evidence the walk beside it stands on.
2. Faithful: yes. The caption's "within 0.1 to 0.15 st of what it was asked" matches `stage4-real-report.json` (sung_vs_asked 0.13, 0.10, 0.15). The dive near 6.2 s is folded down by an octave in the asked line, as `repair_octave_jumps` does (coupling.py:78–99). It shows pitch only. The section is about rhythm, and that gap is offer 1.
3. Walks up: not applicable; it sits in the margin.

**`what the knob holds.html` (made) — remake.**
1. Test: yes, and in two halves. The melody-and-rhythm half is a real measurement on the three real takes; it would have come out differently if K moved timing. The lock half follows from the code (see offer 2), but it's still a fair test of the claim against the build.
2. Faithful: mostly, with three lines to fix.
   - **The method note presents a fit as a check.** It says the sandbox tracker "puts the K = 1 echo 0.33 st from yours, as RMVPE did". But `CLARITY = 0.60` was chosen because "0.60 matches RMVPE's K = 1 figure" (measure.py:37). At the tracker's default floor of 0.55 the K = 1 figure is 0.47, and at 0.65 it is 0.29 (my recompute). Say the floor was set at K = 1, and name the independent agreement: K = 0.5 and K = 0 (0.75 vs 0.83, 1.48 vs 1.50). The ordering holds at every floor I tried.
   - **"The model copies your rhythm at every setting" overstates.** Each echo's loudness line meets yours at only r 0.55–0.56 (the piece shows this itself in step 3). What is measured is timing: best alignment at 0 ms, falling to 0.19–0.27 at ±120 ms, the same at every K. "Keeps your timing" is the measured claim. Also, the piece prints the echo-to-echo range as "0.92 to 0.94" (it rounds 0.945 down), while the offer and commit say 0.95. Make them agree.
   - **Name whose claim the lock test refutes.** The page's sentence (Semantic Delay.md:53) is about speech rhythm and musical meter in Stage B, which isn't built. The build makes the claim in coupling.py:9–16 ("The knob is Kuramoto's… At K = 1 the tap is phase-locked"), and the forward vector (Semantic Delay.md:18) names this F0 knob as where the coupling re-enters. One clause in the sub or the verdict should say the takes refute the built pitch knob, not the unbuilt rhythm stage.
   - Optional: per [[Progressive Staging]] § Inside One Piece, the last step could link to `stage4-real-report.json`, the existing proof. Step 3's equation shows *a* without saying it rises with K (coupling.py:129). The settled point doesn't depend on *a*, so this is a note, not a fix.
3. Walks up: yes. One phrase, one echo held, the knob loosened (with K = 1 as the way back), then the test. Each step plays and has one thing to hear.

### Phase 1 Plan — SVC + VST (2026-04-20)

**`how long a delay.html` (made) — remake.**
1. Test: yes. It puts "≥8 s as the honest minimum" (Semantic Delay.md:143) against every measured speed, and the answer partly goes against the text.
2. Faithful to the page: yes. It quotes the page's own 4 s / 1.65 arithmetic (line 137). **The problem is the cost law the piece asserts.** Step 2 gives c = r·(L + 0.3) as the model's work, and step 5 draws a straight line per speed from 1 to 8 s. The bundle's own conversions run faster per second on longer phrases:
   - 32 steps: 2.275 at 4.78 s sent, 1.985 at 6.69 s.
   - 16 steps: 1.20 and 1.14 at 4.79 s, 1.02 and 1.01 at 6.70 s (helper.log).

   That points to a fixed cost per echo; the steward's cycle 9 names one, the 10.7 s singer clip re-read on every echo. Fitting fixed cost plus rate to the bench and the two runs (10.7 s clip):
   - 32 steps: about 3.6 s + 1.46 s per second sent.
   - 16 steps: about 2.5 s + 0.64 s per second sent.

   The 1.65 and 32-step conclusions survive either way. At 32 steps an 8 s delay carries 2.7 s phrases on the fit and 3.35 s on the flat rate, both short of 4. **The 16-step line does not survive cleanly.** On the fit, 8 s carries a full 8 s phrase (7.6 s of work); at a flat 1.19 it carries 6.4 s. The fix: one sentence in step 2 and the method saying each line is one speed measured on a 4.5 s phrase and extrapolated, and a softer 16-step line in the verdict. One small thing: a phrase cut at 8 s closes without the 0.3 s of quiet (Algorithm.h:190), so `E.work` over-counts it by 0.3·r.
3. Walks up: yes, and well. The phrase ends, the work, the delay counted from the end, two real runs, then the test. Every step plays or moves.

**`timeline.png` (gathered) — keep.** The plugin's real-time record, placed beside the forcing function it bears out (Semantic Delay.md:127). The caption matches `report.json` (four echoes, 12 s delay, 16 steps, each started at its due sample, late 0) and `helper.log`.

## Checks run

- `conform.mjs "Semantic Delay"`: 2 introduced, errors 0, warnings 0, browser pass at 760 and 1130 px.
- `fingerprint.mjs "Semantic Delay"`: both sections in step (`cd57afd88047`, `64b60caec1da`).
- The maker's `check.mjs`: all passed.
- Served with `rich-server.mjs --root <worktree> --detach` and opened `?entry=Semantic Delay` in headless Chromium. Both pieces loaded and both walks stepped through every step. Four proposal chips showed. Console clean once both frames had loaded. On a first pass, the host's postMessage to a not-yet-loaded lazy frame logged two origin warnings; that is host-side and transient, not from these pieces.
- Sound: no audio element exists before a click. Each piece played on click, and hiding the page paused it (the kit's hush).
- Every file the pieces declare is tracked, as are both gathered PNGs. Nothing licensed is copied; the takes are SoulX's example vocal.
- I recomputed the knob numbers independently, with the bundle's own f0.py and coupling.py, outside the bundle. The script is in the session scratchpad and is not part of this record.

## The offers

**1. The knob couples melody; the model carries the rhythm (claim-change) — confirmed, with two corrections.**
- Melody distance reproduced: 0.33, 0.75, 1.48 st.
- Echo-to-echo loudness r: 0.938, 0.916, 0.945.
- Every echo best aligned with the source at 0 ms.
- Corrections: the K = 1 figure is fitted (see the piece), and each echo's loudness meets the source at only r ≈ 0.55, so "the model keeps your timing" is the measured form.
- Where the page says it: the offer says "the section and the Technical Stack call the F0 knob rhythmic coupling", but the section never mentions F0. The page says it in its forward vector (line 18). The Technical Stack line (88) is Phase 2's and adds a syllable/duration constraint.
- The steward's scroll already calls it a "melody knob" and says the free echo "keeps your words and rhythm" (Semantic Delay — scroll.md:36, 185, 279). The steward's pending Status proposal uses the same words (Semantic Delay — tuning.md:40). This offer carries the steward's own description home; it doesn't contradict anything.

**2. A blend, not a phase-lock (claim-change) — confirmed, and the remedy needs one more clause.**
- From coupling.py:133: `state += a·(K(m − state) + (1 − K)(s − state))` is `state += a·(p* − state)` with p* = K·m + (1 − K)·s. That is a one-pole follower toward a straight-line blend.
- Its distance from the melody is (1 − K)·|s − m|. No sine, no detuning held back, no threshold.
- Sweep reproduced: 21 points, 1.450 → 0.038, monotone, 0.134 st off the line. Most of that bend is the scale quantizer weighted by 1 − K. Without it, at fixed *a*, the rule is 0.03 off.
- But "give it a sine term if a lock is wanted" won't do it alone. Replacing both pulls with sines (12 st period) still gives no knee (0.13 off the line). A lock needs the spirit to enter as a drift rate the coupling has to overcome, on a quantity that wraps: dφ/dt = Δ − K sin φ. Simulated, it slides at √(Δ² − K²) and stops at K = Δ.
- Rhythm phase is the natural wrapping variable, which is what the page's sentence names. So offers 1 and 2 meet.
- Is "This is Kuramoto" a loose metaphor or a refuted claim? On the page, it's a metaphor stated as an identity, for a stage not yet built. The Kuramoto page itself uses "This is Kuramoto coupling" just as loosely for speech and groove (Kuramoto Coupling.md:124), but defines the model by its critical threshold (lines 66, 68).
- Holding that line: the built knob keeps Kuramoto's destination, a weighted average (Kuramoto Coupling.md:172 — "where a locked crowd settles is the average… each weighted"). It drops the arrival, the threshold. "A pull that borrows Kuramoto's picture" is right for the knob. What the piece refutes is coupling.py's docstring, not the page's vision.

**3. "≥8 s" holds for a 4 s phrase only (claim-change) — confirmed in direction; the formula needs a caveat.**
- Derivation, from the forcing function (Semantic Delay.md:118, 127):
  - The work starts only once the phrase is closed. The plugin closes after 0.3 s of quiet (Algorithm.h:68, 190) and sends all it captured.
  - The helper's rtf is wall time over the audio sent (soulx_backend.py:270), so c = r·(L + 0.3).
  - The echo is due at end + D (Algorithm.h:212), so it's on time iff c ≤ D, for a phrase with the helper free.
- Arithmetic reproduced: 4.548, 3.353, 13.695 and 18.177 s.
- Offline lateness: 5.28 and 9.65 s. The second includes waiting behind the first.
- Real-time spare: 5.17, 5.92, 4.65 and 5.69 s. The logged completion spacing (5.77, 6.74, 5.49 s) matches the reconstruction (5.75, 6.77, 5.46).
- Two caveats for the dated note:
  - r is not constant in L (see the piece). The minimum is the work the phrase takes, about r·(L + 0.3) at the speed measured for that length.
  - "16 steps ran 0.89 to 1.20" folds in the 3 s and 5 s singer clips. At the default 10.7 s clip, 16 steps ran 1.01–1.20.
- Steward: cycle 9 already found this ("an 8-second phrase needs about an 18-second delay", the scroll's 2026-10-14 entry). The offer carries it to the page and doesn't contradict it. The scroll's own plan still says "an echo needs 8 seconds or more" (scroll.md:78); that plan is Loudon's to change.

**4. The delay counts from the phrase's end (no-claim-edit) — confirmed.**
- Algorithm.h:212 and 304: due = s.end + (i + 1)·delay, with s.end set at close, after the quiet (190, 262).
- delay_engine.py:72 and instrument.py:179–181: end_sample + delay.
- A 4 s phrase at 8 s is heard 12.3 s after the first word.
- One exception worth the clause: a phrase cut at 8 s closes with no quiet, so it's L + D.
- It complements the scroll plan's tempo-lock move (scroll.md:85) and cycle 11's next move; no contradiction.

## The face as a whole

It makes the page's idea felt rather than busy. Two walks and two records. Each walk puts real takes and real timing behind a section that the text can only assert, and each reaches a test that came out partly against the text. That is the thing a rich face is for. The risk runs the other way from decoration: read together, the face is an audit of the page, and the page's other register — the spirits, the dub ghosts, the haunting — gets no voice in it yet. That's fine for a sketch, and worth naming for the next round. The two remakes are each one or two sentences, and both are about saying exactly what was measured. Nobody has listened to any of these takes for these questions; the ear is still Loudon's.
