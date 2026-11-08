---
title: "Action Potential Oscillator — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Action Potential Oscillator]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's reading of this page's proposed rich face, piece by piece and offer by offer, with the numbers re-run, so Loudon can take or leave each one knowing which parts held when someone else pushed on them."
---

# Challenge — Action Potential Oscillator's rich face, proposal round 2026-11-03

Read against the page as it stands in the worktree (`Projects/Action Potential Oscillator.md`), the manifest, every piece's source, and the maker's commit body (60782882). I didn't make any of this. Verdicts: **7 keep, 1 remake, 0 retire.**

## The pieces

### The Four Stages · `Action Potential Oscillator — rich — four stages.html` (made) — **remake**

1. **Test or decoration?** A test, twice over. Step 5 sweeps the note against the fixed 1 ms spike and counts harmonics. If the section's "darkening with pitch" were wrong, that count would come out differently. Step 4's half-note slot would light up if the recovery made a subharmonic. Both could fail, and only the second one does.
2. **Faithful?** Step 4 contradicts the page's "subharmonic growl" (Stage 4, and § The Refractory Period). The text wins. The contradiction is carried as offer 1, so it's an offer, not a fault. One number isn't faithful to the measurement, though. The centroid in hertz is summed over only the first 64 harmonics (`measureNeuron`, line 181: `maxBin = Math.min(Math.floor(L / 2), 2 * 64)`). So the band it measures changes with the note: 3.5 kHz at 55 Hz, 7 kHz at 110, 14 kHz at 220, and the whole band only from about 375 Hz up. The verdict's "481 to 1232 Hz" and the blue line under 375 Hz compare different bands.
3. **Walks up?** Yes. Capacitor, leak, spike, recovery, then the test. Each step adds one mechanism. τ = ∞ in step 2 is step 1 sample for sample (checked), and the rail stays open.

Runs clean (conform 0/0, console clean). It's silent until a click and makes no AudioContext before one. A step change suspends the sound, and a hidden page suspends it too. All of this was driven headless.

**The remake, exactly:** take the centroid over one fixed band at every pitch, either every harmonic up to Nyquist or a fixed cap in Hz, not the first 64. Then let the verdict and the blue line re-read it. On the full band the stage 3 centroid goes from 764 Hz at 55 Hz to 1206 Hz at 440. Also draw the sawtooth's centroid beside it, since it rises too (4054 → 5765 Hz, full band). Without that reference, "in hertz it does not darken" reads as something peculiar to the spike, and it isn't. What's peculiar to the spike is the count against the note, and that part stands.

There's one smaller fix in the same pass. At the corner of both sliders, τ 0.5 ms and 55 Hz, the neuron goes silent in steps 2–4, because τ carries over from step 2. The drive is worked out so the membrane lands exactly on threshold, and at that corner the target is threshold to within floating-point precision (c ≈ e⁻³⁶). The membrane sits at 1.0000 and never crosses, and the readouts go blank. This isn't rheobase. Fire at `thr − 1e-9`, or floor τ at 0.6 ms. One round.

### Population Dynamics · `Action Potential Oscillator — rich — crowd.html` (made) — **keep**

1. A test. It puts the section's own hypothesis ("individual spike shape averages out") in quotes and lets the reader measure brightness live, scattered and then locked, for four shapes. If shape did average out, the locked readings would converge, and they don't (locked centroids 249 to 2548 Hz).
2. It's faithful to the text by quoting it. The result contradicts the text and is carried as offer 4. The verdict line about width carrying the colour is the maker's own refinement, and it's labelled as such in the offer. Step 3's "between about 0.003 and 0.005 the smear snaps" checks out on the measured curve: R is 0.40 at K 0.0032 and 0.90 at 0.0046.
3. It walks up: one neuron, a scattered crowd, coupling, then the test.

The engine matches Faust v0.4 within 5.4e-8 per sample, with the mean field exact. I re-ran that, and the numbers it quotes match the checks file. Console clean. It's silent before a click, and step change and hiding both suspend the sound.

### Implementation Status · `neuropulse-faust-sweep.wav` (gathered) — **keep**

A record, not a test. It's the evidence for "since 14 October a crowd … runs in Faust". The caption is honest: 32 neurons, K from 0 to 0.016 and back over 30 s (matches `faust-render/render_sweep.py:17`), and the 116 Hz lock that predates the anchor. It's also consistent with offer 3, because the render harness sets N = 32 (`faust-render/neuropulse_render.dsp:3`). Tracked.

### Implementation Status · `faust-vs-python.png` (gathered) — **keep**

A record. The caption says what each panel shows, and the left-out June audition is named in the commit. Tracked.

### The Artifact · `neuron_oscillator.html` (gathered, contract fill 3/4) — **keep**

This is the thing the section describes, shown unchanged. Its caption says something the page doesn't: with the pitch held, a short τ is brighter. That's about the artifact's own label, not the page, and it's carried as offer 5. I confirmed it below. Conform lists the contract as "(manifest; owed)", with 0 errors and 0 warnings.

### Population Dynamics · `neuropulse-spike-shapes.wav` (gathered) — **keep**

The steward's offline version of the crowd piece's test. The caption's timings follow from `spike-shape/analysis.py:5,69`: 5.5 s per shape with 0.4 s gaps, so segments start at 0, 5.9, 11.8 and 17.7 s and the file runs 23.6 s. That matches `afinfo`.

### Population Dynamics · `spike-shape-findings.png` (gathered) — **keep, with a note**

The caption says that on v0.4 "the numbers move a little, the finding doesn't". True for the finding. But one number's sign flipped. On v0.2.1 the half-lock was 0.0039 with the undershoot and 0.0033 without (`spike-shape/findings.json`, and apo-steward-018). On v0.4 it's 0.0034 with and 0.0037 without. "The tail barely matters" survives the flip, but no reading about which way the tail pushes does. A clause would say so: "…and the tail's small effect even changes sign". That's a matter of wording, so it doesn't make this a remake.

### Open Questions · `proofs/2026-05-04-spike-oscillator.wav` (gathered) — **keep**

A first listen at a spike whose shape comes out of the equations rather than being prescribed, beside "When does the oscillator become Hodgkin-Huxley?". The caption agrees with the May record (`Projects/Project Stewardship System/Archive/2026-05-04 Proof Showcase v2.html:245–247`: FitzHugh–Nagumo, A2, I 0.45 → 0.85), and `afinfo` gives 6.0 s. Its claim that the script isn't in the bundle is right, so far as I found.

## The offers

**1 · subharmonic growl can't happen.** Confirmed for the engine the face ships, and for neuropulse.dsp v0.4. **Disputed in part** for the Gen~ plan's literal pseudocode.

- **Why v0.4 can't, by construction.** Every spike resets the whole state. V is latched at threshold, the phase goes to 1, t and el go to 0, and vel to 0. v0 is overwritten when the recovery hands over, before the charge reads it (`neuropulse.dsp:104–113`). So the state at every firing is identical, and the waveform must repeat exactly at the note.
- **Built in Faust.** I built neuropulse.dsp's own `crowd` with no spread and no coupling (sixteen identical neurons, one voice) at `-double`, 48 kHz, and checked one cycle against the next. Damping went to 0.01, which is below the slider's 0.05. Depth went to −0.8, τ ran from 0.5 to 50 ms, refractory from 0.1 to 20 ms, pitch from 55 to 220 Hz. Every run gave one interval, a cycle-to-cycle difference of exactly 0, and nothing within −320 dB at half the note.
- **Swept in the piece's engine.** I ran 4,032 combinations: ζ from 0.05 to 2, depth from −0.01 to −0.8, refractory from 0.1 to 20 ms, τ from 0.5 to 50 ms, six pitches, at both 44.1 and 48 kHz. None was aperiodic. The loudest half-note bin was −296 dB. The 224 runs that fired too few times to measure were all outside the piece's step-4 controls; inside them, no setting falls silent.
- **The plan's pseudocode can period-double.** In `neural_oscillator_dev_plan.md` (phase 0, line 440, has no latch), the threshold overshoot rides into the spike. Below a raw damping of about 0.03, inside its own guard of `max(in7, 0.01)` (line 412), a few settings lock into a one-sample alternation, for example 487/488 samples. That puts a line at half the note, 43–49 dB down. It's rare: 2 of 4,941 settings at its defaults over damping 0.01–1.4 and 55–440 Hz, and 1–2 of 2,541 at damping 0.01–0.05. The cause is whole-sample firing that the ringing has knocked loose, not the ringing sounding below the note. So the subharmonic is real but faint, and nobody would hear it as a growl.
- **Where the claim probably came from.** The plan's prose puts the ringing at "~40–100 Hz" (line 388). Its code rings at about 1.27 kHz (spring `1/(refr·0.5)`, line 424, at 1.5 ms and 48 kHz). In v0.4 the ringing is about 1103/√τ Hz: 493 Hz at 5 ms and 156 Hz at 50 ms. Neither code rings below the note, and both cut the ring off when the recovery ends.
- **The maker's numbers.** "±1.7 dB" on harmonics 1–8 is confirmed (−1.6 to +1.7). But "about −100 dB on the Gen~ plan" is too broad a reading of the plan.
- **Suggested wording:** "…underdamped (the voltage rings past rest before the next charge, reshaping each cycle; in an engine that latches the spike at threshold the period never changes, so it colours the harmonics and adds no subharmonics)".
- **What I couldn't check.** Implementation Status line 66 says "the Stage 4 codebox and its interface text are in this page's folder". I found no March Gen~ Stage 4 codebox in the bundle or anywhere tracked; only the Faust-generated and hand-written crowd codeboxes are there. So whether the built Gen~ neuron latches at threshold, and so whether it can show the plan's faint period-2, is the one thing here I couldn't settle. That line may itself be worth an offer.

**2 · darkening is relative to the note.** The counts are confirmed: 14 → 9 → 5 → 2 harmonics within 20 dB from 55 to 440 Hz, with the sawtooth at 10. That's from my own DFT of one exact cycle, which agrees with the piece's. The ceiling of 960 / 393 Hz is confirmed by the checks. **The centroid "481 → 1206 Hz" is disputed as a band artifact**; see the four-stages remake. Over a fixed band:

| band | 55 Hz | 440 Hz |
|---|---|---|
| full | 764 Hz | 1206 Hz |
| ≤ 10 kHz | 631 Hz | 991 Hz |
| ≤ 3.52 kHz | 481 Hz | 745 Hz |
| sawtooth, full band | 4054 Hz | 5765 Hz |

The direction holds on every band. What the offer should say is that the centroid rises in hertz as any harmonic tone's does, and stays at about a fifth of the sawtooth's. The wording "darkening relative to the note" stands.

**3 · neuropulse.dsp builds N = 16.** Confirmed at `neuropulse.dsp:32`. Every crowd that was measured used 32: `spike-shape/shape_render.dsp:9`, `pitch-anchor/anchor_render.dsp:9`, `faust-render/neuropulse_render.dsp:3`. So does the hand-written RNBO crowd (`rnbo/neuropulse-crowd.codebox:27`, `NUM = 32`). The Faust-generated `rnbo/neuropulse.codebox` has 16 (scroll, line 204). The proposed wording is accurate.

**4 · adopt apo-steward-018, with the width refinement.** Confirmed. The board entry, 2026-10-14, is FLAG on FLAGS, "steward leans adopt". It says what the maker says it says: when the crowd locks barely depends on the tail; spectral shape survives the lock (r 0.99); the shapes stay 9.5–14 dB apart; locking darkens by 35–58%; plus the proposed replacement sentence. The maker's v0.4 numbers re-ran exactly in the checks:

- half-lock 0.00342 with the undershoot and 0.0037 without
- the click needs 10.6× the coupling
- r 0.993–0.996
- pair distances average 9.5 dB scattered and 14.3 dB locked (six pairs: 1.0, 9.9, 9.8, 10.3, 8.9, 17.3 and 1.1, 15.5, 13.8, 16.2, 12.9, 26.3)
- darkening of 49, 51, 49 and 57%

The refinement holds too: full against no undershoot is 1.0 dB scattered and 1.1 dB locked. One note for whoever writes it: the tail's small lock effect changed sign between v0.2.1 and v0.4, as the findings-figure note above says. The paragraph should say "barely", not give a direction.

**5 · the artifact's τ label runs backwards.** Confirmed. At 110 Hz with the pitch held, τ 0.5 ms keeps 31 harmonics within 20 dB, against 10 at 5 ms and 10 at ∞. The full-band centroid is 5473 Hz against 4548 and 4515. The dev plan's Stage 2 criteria say the same as the artifact ("bright to warm", line 220; "low tau should show reduced upper harmonics", line 222), so if this is taken up they would follow.

**Also found, for the steward rather than the page.** neuropulse.dsp v0.4 has the same silent corner, and its τ slider goes down to 0.1 ms. A single neuron built from it in Faust fires 0 times a second at τ 0.5 ms / 55 Hz, at 0.2 ms / 110 Hz, and at 0.1 ms / 220 Hz. With the same τ values at higher pitches (110 Hz at 0.5 ms, 440 Hz at 0.1 ms) it fires normally.

## Checks run

- `conform.mjs "Action Potential Oscillator"`: 3 pieces, all introduced, **errors 0, warnings 0**, browser at 760 and 1130 px.
- `fingerprint.mjs`: all five sections **in step**.
- The maker's `— rich — checks.mjs`, Faust present: **45 checks, all pass** (25 s).
- `rich-server.mjs --detach`, face at `?entry=Action Potential Oscillator`, then `--stop`. No missing-file or cap boxes.
- Both pieces opened and driven headless (Chromium via STIGMERGY's playwright): no AudioContext before the click; running after it; suspended on a step change; suspended on a hidden page. The four-stages sweep runs, and stepping to the test takes 195 ms (the sweep curve). **Console clean** on both pieces and the face.
- My own scripts, in the session scratchpad, which will be cleared within days, so nothing here depends on them:
  - the subharmonic grid on the piece's engine
  - the dev plan's Stage 4 pseudocode, written out literally
  - a Faust build of neuropulse.dsp's `crowd` with no spread and no coupling
  - a fixed-band centroid on one exact cycle

## The face as a whole

It makes the page's idea felt rather than busy, and it does that by pushing on the page, not by illustrating it. The four stages turns Progressive Staging into something you play, one mechanism per step, each able to turn back into the one before. It ends on a test that splits "darker with pitch" into the part that's true (fewer harmonics against the note) and the part that isn't (darker in hertz). The crowd takes the section's boldest guess and lets you measure it, and the guess comes out half wrong in a way you can hear. The gathered pieces are well chosen and honestly captioned, and the left-outs are named with reasons. Its weak spot is one measure in the four stages, a centroid whose band slides with the note. It's fixable in a round. One question stays open: the page's "subharmonic growl" is false for every engine anyone can run today, but the March Gen~ neuron it was written about isn't in the folder to check.
