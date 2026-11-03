---
title: "Shepard Tone Synthesizer — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Shepard Tone Synthesizer]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's reading of the first Shepard Tone Synthesizer rich face, piece by piece, with the numbers recomputed, so the maker can act on each verdict without asking and Loudon can see which findings held."
---

# Challenge — Shepard Tone Synthesizer, rich face, proposal round

Challenger, 2026-11-03, against the maker's commit e517ba51 on `enrich/shepard-tone-synthesizer`. I read the page whole, the manifest, both made pieces and their engines, the maker's check script, `shepard_synth.py`'s Stage 1 defaults, `session-2-interactive.html`'s constants, both render manifests in `proofs/`, and the May showcase the first-take quote comes from. Nothing was heard. Where I write a number below, I computed it myself in my own script, not with the pieces' engines.

**Tally: 17 keep, 2 remake, 0 retire.**

## The two made pieces

### the still drone (Theory § Stage 1) — remake

1. **Test or decoration.** Step 4 is a real test. If seven sines didn't fuse, the reader would hear seven pitches at 0 ¢. And the page gives no tolerance, so the reader finds one. Step 3 is not a test as built. The page says "a literal bandpass in Hz would over-emphasize the lower octaves". The piece stands in a Gaussian drawn symmetric on a linear Hz axis for "a literal bandpass", and that shape over-weights the lows by construction, whatever its width. I got a low-octave share of 33.8 %, 57.0 %, 58.3 % and 53.2 % at σ_Hz = 0.5, 1, 2 and 4 × C4, against 21.8 % for the log window. A real bandpass is a different thing. A 2-pole bandpass is symmetric in octaves (|H(f)| = |H(fc²/f)|). On the Stage 1 stack at C4 with a 2-octave band (Q 0.667), it gives C3 = C5 = −3.0 dB and C2 = C6 = −8.6 dB, with 28.7 % of the energy below C4 and 28.7 % above. Two of them in series give C3 = C5 = −6.0 dB. So step 3 confirms the sentence only because of the stand-in it picked. With the thing the sentence names, the sentence comes out wrong.
2. **Faithful.** The engine matches `shepard_synth.py` (C1–C7, σ 1 octave, centroid log2 261.63). The dB figures in its equation are right: −4.3, −17.4 and −39.1 dB at 1, 2 and 3 octaves. The Hz bell is the piece's own, and its header says so. Its step-3 teach text calls it "a Gaussian in Hz" and ties it to "the claim", but the text's word is "bandpass".
3. **Walks up.** Yes. One sine, then its octaves, then the window, then the test. Each step carries a way back, and the step list stays open.
- **Runs clean.** Yes: no context before a click, changing step stops the sound, hidden tab hushed by the kit, conform clean.
- **Remake, one round.** In step 3, add a fourth window, "a real bandpass at C4 (2-pole, 2-octave band)", using the response above, with the low/high energy readout for every window. Rename the Hz bell to say what it is: "a bell drawn on a linear Hz axis". Rewrite the step-3 teach and `says` lines so the step asks the question rather than answering it. The sentence on the page is then tested, and the reader sees it hold for a Hz-drawn bell and fail for a real bandpass. The finding goes to Loudon as an offer (below), not into the piece as a verdict. A taste note, not part of the remake: step 4 could take the free seam's picture cover, since the spoke on the circle tells the eye the answer before the ear is asked.

### the free seam (Theory § Stage 2) — remake

1. **Test or decoration.** A real test, blind and tallied against chance. The chance figures are right: 1/12 = 8.3 % on the step, and 34/144 = 23.6 % within one step. Every trial has exactly one wrap, spread evenly over steps 1–12. That holds because nine octave-spaced voices sit in a band nine octaves wide (14000/512 = 27.34 Hz), and the random start maps start 0→9 … 8→1, 9→12, 10→11, 11→10.
2. **Faithful, with two slips.**
   - (a) The piece calls session-2's window (600 Hz, σ 1.6 oct) "the page's window", in its switch label, its condition labels and its caption. The page states neither number; they are the June instrument's. Say "Stage 2's window", or "session 2's".
   - (b) The step-5 teach text says each switch "takes one away" and that the semitone-off wrap "arrives as the wrong note". In the condition the reader meets first, it barely arrives at all. With session-2's window the wrong-landing voice lands 33.2 dB under the loudest voice and peaks at −19.8 dB in the rest of a 12-step trial. A 27–52 Hz sine at that level is close to inaudible on most rigs. So *page window / wrong* will probably also score near chance. A reader would then read that as "octave equivalence does nothing", which the piece's design does not show. The 2×2 does pull the two causes apart, but only through the right pairs: *page/octave* against *wide/octave* gives the window's share, and *wide/octave* against *wide/wrong* gives octave equivalence's share. The piece doesn't name those pairs.
3. **Walks up.** Yes: still drone, one step, twelve steps, the seam shown, then the blind test. The test comes last, and the steps stay open.
- **Runs clean.** Yes, by the maker's check script and conform. Wraps change frequency with Web Audio's phase-continuous oscillator, so the join itself doesn't click.
- **Remake, one round.** Fix (a). Rewrite the step-5 teach text to name the two comparisons above. Say that *page/wrong* is expected near chance because the mislanded voice stays ≥ 19.8 dB down, and that this points at the window, not at octave equivalence (the maker's own offer 1). Add one line: listen on headphones. In *wide/octave* the seam is a 14 kHz sine leaving and a 27.5 Hz sine arriving, each about −5.5 dB. Laptop speakers can't play 27 Hz, and many ears don't hear 14 kHz, so a null there means the rig or the ear can't reach the ends, not that the seam is free. The tally and the engine need no change.

## The gathered pieces — all keep

- **May chart, `proofs/2026-05-04-shepard-explanation.png`** — keep. It illustrates rather than tests, but its caption is honest about where it disagrees with the text (the window sits near 300 Hz on A, not C4), and that disagreement sets up offer 2. A note: "enters near silent" is generous. The chart's own window is about 0.15 (−16 dB) at its drawn edge. "Quiet" or the number would be truer.
- **endless ascent v2** — keep. The section's mechanism as sound. The caption's history checks out against the 2026-05-04 Proof Showcase v2 (`Projects/Project Stewardship System/Archive/2026-05-04 Proof Showcase v2.html`): the clicks came from all octaves snapping back at once, and the fix was a per-voice wrap near zero amplitude.
- **session-1 (the April rack)** — keep. Something to make, not a test. The caption flags the one aged step: session-1 line 530 offers a saw, and Stage 4 measured that a saw thumps through a filter on the sum.
- **September broken-async / one-glide pair** — keep. An A/B pair that could go against the text by ear, placed at "The challenge" and "Practical effect".
- **endless ascent, first take** — keep. "A seam that was not free": the quote is real (same showcase), and it lands beside the "seam is free" claim as the counter-case. The wrap is free only when it happens while the voice is quiet.
- **session-2 (June)** — keep. The proof the walk ends at.
- **Stage 3 A / C / E renders and the glide-fusion chart** — keep. The captions match `proofs/2026-10-18-stage3-manifest.json`: 0.0 ¢, 92.8 ¢ and 1005.9 ¢ at 150 Hz/s, on the phrase 0 4 7 12 16 19 24.
- **session-3** — keep. Its controls are named correctly ("start sound", "endless up", "drift between octaves", "Hz slew, per voice"). The review-layer storage warning is the gathered record's own, and stands.
- **Stage 4 A / D / E renders and the timbre chart** — keep. The captions match `proofs/2026-10-18-stage4-manifest.json`: purity 0.924 with 0.065 on the fifth (the page rounds to 7 %), a 0.195-octave jump, and a seam at −29.5 dB. E's caption says honestly that nobody has listened for the thump yet.
- **session-4** — keep. Its controls are named correctly.

## Checks run

- `node _ops/rich-face/conform.mjs "Shepard Tone Synthesizer"`: 6 pages, introduced 6, **errors 0, warnings 1**. The one warning is session-3's review-layer kit. The maker's eight file-local warnings are gone now that the files are tracked. The browser pass ran at 760 and 1130 px.
- `node _ops/rich-face/fingerprint.mjs "Shepard Tone Synthesizer"`: all four manifest sections are **in step** (189480882cd4, 41681087d6f3, a5a0e0a3021b, af68b2fb6ca1).
- The maker's `Shepard Tone Synthesizer — proof — rich piece checks.mjs`: **45 passed, 0 failed**. It confirms no context before a click, step changes stopping the sound, the kit's hidden-tab hush, and the trial's curtain and reveal.
- The rich face served from the worktree, loaded headless at 1400 px for 12 s: **no console messages, no page errors**, 6 frames, 4 images, no "Lost its place". Ten WAV requests show `net::ERR_ABORTED`. That is Chromium cancelling media preload; the server answers `206 audio/wav` to a range request. Every gathered file the face names is tracked and none is ignored, so the public face has them. No Splice or other licensed material is copied.

## The maker's offers

1. **Wrap level (claim-change) — confirmed.** I got −34.82 dB leaving (at 14080 Hz) and −33.22 dB landing (at 27.5 Hz) against the loudest voice, the same for all 12 starts. The summed level changes 0.0002 dB across the swap and 0.0003 dB over a full octave of steps. The wrong-landing peak over the rest of a trial is −19.79 dB. With the window opened to σ 4: −5.6 and −5.4 dB. The reading holds: in this window the level alone keeps the join quiet. One caution for the Deposit map: these are session-2's numbers, not a window the page states.
2. **C2/C3 in the sweet spot (no-claim-edit) — confirmed.** Symmetric on C4 at σ 1 octave: C3 = C5 = −4.34 dB, C2 = C6 = −17.37 dB, C1 = C7 = −39.09 dB. Also, the example's stack lists C1 to C5 and then has C6 fading, though C6 is not in the stack it listed.
3. **1.4 × fc, and 128 MIDI octaves (no-claim-edit) — confirmed, with one nit.** fc/2 to 2fc is 1.5 × fc wide, Q = 2/3 = 0.667. A width of 1.4 × fc would be a 1.88-octave band. MIDI notes 0–127 span 127/12 = 10.58 octaves. The manifest's "about ten and a half" is right; the commit body's "~10.7" is 128/12 and slightly off.
4. **"Pair with Stage N above" (no-claim-edit) — confirmed.** There is no Stage heading above Theory. The only Stage headings are Theory's own `###` subsections (lines 171, 181, 198, 213 of the .md).

**The challenger's own offer, for Loudon (Theory § Stage 1, claim-change).** "A literal bandpass in Hz would over-emphasize the lower octaves (closer together in absolute frequency) and break the symmetry" (line 179) is not true of a real bandpass filter. A 2-pole or Butterworth bandpass is geometrically symmetric about its centre, so it is symmetric in octaves: C3 = C5 = −3.0 dB, C2 = C6 = −8.6 dB at a 2-octave band on C4. What would over-weight the lows is a window drawn symmetric on a linear Hz axis. The live difference between a bandpass and the log-Gaussian is the skirt: the 2-pole leaves C1 and C7 at −14.6 dB where the Gaussian has −39 dB. That bears on Design Challenge 1's "too wide … muddy" more than on symmetry. The same fact is why the page's Global Shepard Filter works at all.

## The face as a whole

It makes the idea felt more than it busies the page. Gathering did most of the work: the bundle already held a test for Stages 3 and 4 (renders and playable instruments with the numbers in their captions), and the maker laid them in the order of the idea. The two new walks fill the two stages that had nothing a reader could play against. The free seam's blind trial is the best thing on the face. It is the only piece whose result is genuinely unknown, and it asks the page's most quoted line ("the eye sees the join the ear forgives") to survive a tally. Both remakes are about honesty of reading, not engines. One stand-in made a sentence look true. One condition will read as a null for the wrong reason. Theory carries 14 pieces against 2, 1 and 2 elsewhere, and that is heavy but earned: it is where the page's claims are.
