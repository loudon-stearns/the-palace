---
title: "Dissolutions — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Dissolutions]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's read of Dissolutions' first rich face: each piece judged for whether it tests the seam paragraph, stays true to it and walks up to it, with what I ran and what came back, so the next round starts from a reason and not a guess."
---

# Dissolutions — rich — challenge

Proposal round of Enrichment v2.7, 2026-11-03. Judged from the page (`Dissolutions.md`), the manifest, the two pieces and their sources, with the maker's commit `5d9381f0` as its only account. One section carries pieces: **Identity, isomorphism, analogy**, both anchored at "A dissolution in the math can leave a seam in perception" (`Dissolutions.md:63`).

## The pieces

### Dissolutions — rich — the seam.html — remake

**Does it test or decorate?** It tests, and the design is good. The paragraph makes two claims: the seam sits "somewhere near 20 Hz", and "nothing in the equation changes there; the ear does." The piece holds the equation fixed (A = 0.30, B = 0.60 at every speed, no filter, no crossfade, confirmed below) and asks the listener to mark where loudness becomes a sound, gliding up and down, each wire alone or both. A listener who marks at 35 Hz, or marks the two wires far apart, is evidence the text could use. That is a test.

**Is it faithful?** Yes on the equation, the numbers and the claim. It makes no claim the page doesn't. The caption is honest about headphones.

**Does it walk up?** Yes. Loudness alone and slow (a fade you can count), loudness faster (tremolo), the straight wire alone (a pitch you drag down until it goes), both wires, then the test. The rail stays open, so the walk is a path and not a gate. Changing step stops the sound.

**Why remake: the test shows the answer while it is being asked.** During the glide the piece shows the reader speed live and a meter whose "power at or above 20 Hz, the usual floor of hearing" sits at 31.1% from 10 to 19.99 Hz and jumps to 100% at exactly 20 Hz. I drove the glide headless and read both, visible and updating: 5.34, 7.14, 9.53, 12.7, 17.0 Hz, meter 5.1% → 11.5% → 31.1%. The step's own words also name "near 20 Hz" before the glide. A listener watching a number climb toward the page's 20, and a meter that leaps at 20, will mark near 20. That anchors the one result the piece exists to collect, so the test can come out differently from the text less easily than it should.

The fix, one round: while a glide runs, hide the speed readout, the slider's motion and the meter (or freeze them on "gliding…"), and reveal the speed only in the marks table at the mark. Move "near 20 Hz" out of step 5's opening words, into a line shown after the first mark ("the page says near 20 Hz; you marked …"). Nothing in the engine changes, and the check stays 9 PASS.

Two notes, not conditions: the meter is a step function at a convention (20 Hz) the page itself may revise (the offer below), so outside the test it could read "power in partials at or above 20 Hz" without "the usual floor of hearing"; and a mark made while listening to one wire reports the other wire's level as 0.00, which is honest but reads as if the equation moved. Labelling the off wire "off" would keep the point clean.

### proofs/2026-10-18-one-curve-three-doorways/one-curve-three-doorways-2.html — keep

**Does it test or decorate?** It tests the sentence just above the seam: "A curve read slowly is an envelope; read fast, the same curve is the waveform" (`Dissolutions.md:59`). One gold curve stays put while three readers change, so the identity is played, not stated. Loudon played it in its sit (scroll, 2026-10-18 "One curve, three readers"; baton names it the model he has played).

**Is it faithful?** On the seam, it is not: it draws the seam in with a crossfade (`directMix` 0 below 12 Hz, 0.56 at 20, 1 above 30), which is the code changing exactly where the text says nothing changes. The caption says so plainly and points back to the walk, which is the honest way to gather a played record. A gathered proof stays as it was (Progressive Staging § Inside One Piece), so this is a caption's job, and the caption does it.

**Does it walk up?** It is the end of the walk, placed after it. Fine.

Note, not a condition: the caption calls it "the proof the walk leads to", but on the seam the walk's own last step is the stronger test, and this proof contradicts the seam. It leads on from the walk to the identity, one curve with three readers. A caption that says it is the proof of line 59's identity, with the seam disclaimer kept, would be truer.

## The checks

- `node "Dissolutions/Dissolutions — rich — the seam — check.mjs"`: 9 PASS, exit 0. Engine equals the stated equation over 33 speed and curvature pairs, worst 2.98e-8; levels 0.30 and 0.60 at every speed; rate enters only as the reader's step; glide 8.000, 16.000, 32.000 Hz at 6, 12, 18 s and ends at 64; largest step per sample 2.667e-3 against a bound of 2.667e-3; meter 2 Hz 0.32%, 5 Hz 5.09%, 10–19 Hz 31.15%, 20 and 40 Hz 100%, page and audio equal; worst peak 0.825 × 0.5 = −7.7 dBFS; the rough's directMix at 8, 12, 20, 30, 60 Hz = 0.00, 0.00, 0.56, 1.00, 1.00. I recomputed directMix(20) by hand: ln(20/12) ÷ ln(30/12) = 0.511 ÷ 0.916 = 0.557.
- `node _ops/rich-face/conform.mjs "Dissolutions"`: 2 pages, introduced 2, pre-contract 0, errored 0, errors 0, warnings 0, browser pass at 760 and 1130 px. The seam declares nothing; the rough declares storage through the manifest's contract and uses it (`localStorage` at lines 333–334).
- `node _ops/rich-face/fingerprint.mjs "Dissolutions"`: "Identity, isomorphism, analogy" 9c8b729a0d36, 2 pieces, in step.
- rich-server on the worktree, headless Chromium at 1130 and 760 px: both frames load, console clean (no error, no warning, no page error), before and after playing. No AudioContext exists before the click (0); Play makes one, running; Next stops the sound (button back to Play); with the page and frames turned hidden, the context goes to suspended. The glide and a mark run (marked 17.0 Hz, A = 0.30 · B = 0.60).
- Files: the seam, its check and the rough are all tracked. No audio files, nothing from Splice.
- Not checked: anything heard. Where the seam falls for an ear, the two wires' balance, and how speakers move it are Loudon's to hear.

## The restraint: right, and the face is not too thin

The maker made one walk-up and left the catalogue bare. I checked the reason. The handoff `dissolutions-remainder-20261025T132839Z` is open and claimed (scroll's Where this stands); branch `claude/dissolutions-sequences-905758` holds six learning sequences as roughs (a3f4df6c, efda5834, 26338d61, 605e3798), with Loudon's words on the one he played, "will need work, but not tonight", and his "Pause it: keep the handoff claimed and the branch unlanded tonight" (commit 49302443). He sent the six bare proofs back on 2026-10-25 as "the end of a proof" (scroll line 105). So placing the bare proofs would put back what he refused, and building new walk-ups would race a claimed branch. The restraint was right.

Thin is not the problem here. Dissolutions is a hub: its catalogue lines point at member entries, each with its own proof, and their walk-ups belong first on those pages and then here when the branch lands, as the manifest's forward vector already says. The one paragraph on the hub that only sound can test is the seam, and it got the piece. "The recurring move" has nothing to play, as the maker said. Ship it as a sketch, after the seam's one-round fix.

## The offer: stands in kind, disputed in its lower number

The maker proposes "somewhere between 20 and 30 Hz" for "somewhere near 20 Hz", from the literature. I checked the sources it names, from their abstracts and published summaries, not the full texts.

- Zwicker and Fastl (Psychoacoustics, the fluctuation-strength and roughness chapters): fluctuation strength peaks near 4 Hz modulation; roughness covers modulation rates from about **15** to 300 Hz, peaking near 70 Hz; the change from one to the other is gradual around 15–20 Hz.
- Krumbholz, Patterson and Pressnitzer 2000 (JASA 108, 1170–1180, "The lower limit of pitch as determined by rate discrimination"): the lower limit of pitch is about 30 Hz (intervals under about 33 ms), set by a temporal mechanism, and it moves with the stimulus: with alternating-phase harmonics the transition drops almost an octave.
- Pressnitzer, Patterson and Krumbholz 2001 (JASA 109, 2074–2084, "The lower limit of melodic pitch"): the same limit by a melody task, near 30 Hz.

So the citations are real and say what the maker says, with one gap. The sentence has two halves, and the literature puts them at two ends. "Stops being heard as a change in loudness" is the fluctuation-to-roughness change, which starts near 15 Hz. "Starts being heard as a sound", if sound means pitch, is near 30 Hz. "Between 20 and 30 Hz" drops the 15–20 Hz stretch that its own first source names. What the sources support is **"somewhere between about 15 and 30 Hz"**, or the half-by-half version: it stops being loudness around 15 to 20 Hz and is a pitch by about 30, with a stretch between that is neither. That last clause is already what the seam's step 4 asks ("a single place … or a stretch where it is neither?"). Still from the literature, not a measurement, and it is a claim change, so it goes through the Deposit Ceremony's map on Loudon's yes.

## The face as a whole

It makes the idea felt. One curve, two wires that never change level, and a listener asked to find the boundary: that is the paragraph's whole claim, that the seam lives in the ear and not the equation, turned into something you do. The gathered rough sits after it as the played record of the identity, honestly captioned for the one thing it gets wrong. It is not busy; if anything the rest of the hub waits on a branch Loudon paused, and the manifest says so. The one thing standing between this and a fair test is that the screen whispers the answer during the glide. Blind the glide and it's done.
