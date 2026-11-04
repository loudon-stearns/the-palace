---
title: "Tone.js — rich — challenge"
born: 2026-11-04
links:
  - target: "[[Tone.js]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for Tone.js's first rich face: one remake of a caption, one keep, and six offers recomputed by a second route and relabelled where their kind or home was wrong, so the maker's next round and Loudon's approval start from what was checked."
---

# Tone.js — rich — challenge

Proposal round, cloud batch 4, 2026-11-04. Challenger: claude-opus-5-5, which did not make this face. Judged against `Shop/Tone.js.md` as it stands (fingerprints in step), the manifest, the made piece's source, the gathered explorer's source, the maker's proof, and the maker's commit body (de976bd2).

## Checks run

- `node "Shop/Tone.js/Tone.js — proof — rich checks.mjs"`: every row reads as recorded (rows 1–5, 7, 8 pass; 6, 9, 10 fail), no AudioContext before a click, no page errors, 13.9 s.
- `python3 -I "Shop/Tone.js/Tone.js — challenge — recompute.py"` (kept, workshop): no Web Audio at all. Each tone is a phase accumulator fed the explorer's tick as written (`Kuramoto Coupling/two-oscillators-coupling-explorer-audio.html:218-247`), the per-sample arm is a scalar Euler loop, and the meters are mine (whole-beat count on the unwrapped gap, numpy FFT bands). Results: beat 2.000 at K 0; 1.733 · 0.873 · 0.282 pushed against 1.732 · 0.872 · 0.282 per sample and Adler at K 0.5 · 0.9 · 0.99; lock at K 1.00 both; locked gap 0.939 against 0.730, offset 0.209 = 2π·2/60; staircase −72.5 dB pushed, −140.1 per sample; −35.8 / −51.9 at Δf 12.5, K 6; locked swing 0.00 · 19.31 · 23.99 Hz at 60 · 30 · 20 (maker 19.46 · 24.23, a meter difference); shudder onset 9.6 · 4.9 · 3.4; tone A's line 20 Hz off at Δf 100, K 6: −19.2 pushed, −124.4 per sample; open loop on schedule −0.40 dB; one stalled frame of 60–500 ms: −0.9, −4.0, −14.4, −10.7, −2.9, −0.1, −0.6, −16.1 dB. Every maker number reproduces. That Chromium's offline render and a bare phase accumulator agree to 0.1 dB says Chromium applies each `setValueAtTime` as a held, sample-accurate step. That bears on offer 1.
- `node _ops/rich-face/conform.mjs "Tone.js"`: the made piece is clean. The explorer gives 3 errors (ERR_TUNNEL_CONNECTION_FAILED, Tone is not defined ×2) and a play-silent warning. All of it is the CDN being blocked in this cloud, not a finding.
- `node _ops/rich-face/fingerprint.mjs "Tone.js"`: Gotchas `c5d80b3dd7d9`, Recipes `d459335ffe92`, both in step.
- I loaded the face through rich-server in headless Chromium (1400 px) and scrolled so both frames loaded. The console showed only the CDN failure and Permissions-Policy bluetooth warnings. From inside the piece's frame I rendered the blind clips for both rounds and read cues that need no listening (below).

## The pieces

### Gotchas — `Tone.js — rich — sixty pushes.html` (made) — **remake, caption only**

1. **Test or decoration?** It tests the claim. Rows 1–5 could have failed: row 6 uses the same meter and reads −35.8 against a −40 bar, and row 7 is a control predicted from the Euler step before any render. The pushed arm is the explorer's tick, run in its own order. I checked that against the source line by line.
2. **Faithful?** The walk and the step-4 text are. Step 3's hint says plainly that at 60 pushes the shudder edge, 9.6 Hz, lies past the slider. The **caption** overreaches in two places:
   - "Its reason ... doesn't hold as written". The page's reason is "the parameter automation is rendered at audio rate by Web Audio's internal scheduling". A held step applied sample by sample to a phase accumulator *is* rendering at audio rate, and both renders above show that is what happens. The reason is incomplete, not wrong: it leaves out why sixty a second is enough, which is that the beat is slow next to the frame rate.
   - "The lock shudders above K ≈ rate/2π" gives no frame rate. At the page's ~60 Hz the edge is 9.6 Hz. Even for the widest gap that can still lock with the slider (Δf 12, K_c 6) it is 11.3 Hz. Both are past the explorer's 0–6 Hz K slider. The shudder sits inside the page's ranges only at 30 frames a second or fewer, which the page does not claim.
   Rewrite the caption so it says: the reason is right but incomplete; the shudder is a condition at 30 pushes a second or fewer; the aliasing (Δf 100, inside the explorer's f sliders, at 60) is real but sits where nothing can lock (K_c 50 against a 6 Hz slider); and the stall is modelled offline, not timed. Nothing in the piece changes. The commit body's verdict line ("its reason and condition don't hold as written") wants the same fix.
3. **Walks up?** Yes: two sines alone, then coupled, then two drives with the staircase drawn, then the test, then the blind listen.

Runs clean. No AudioContext before a click. The kit's hush works (conform shows no play-silent for this piece). Fully inline, with no CDN and nothing licensed.

**The blind A/B.** The chance level (1/16) and the verdict rule (only 4/4 counts, one-sided) sit in the rule box above the first trial. It is two-alternative forced choice, so both arms are in every trial and both are scored. The control round (20 pushes/s, K 5) is a positive control past the 3.4 Hz onset. I tried to pass it without listening:
- Length: both clips are 384000 samples.
- Level: the clips are RMS-matched over the whole clip (main +0.43 dB). What is left, in 2 s segments, is +0.21, −0.19, −0.01, +0.02 dB, and the peak of the pushed clip sits 0.43 dB higher. All of that is under a loudness JND, and it is not visible on the page.
- Order: random per trial.
- The page's paragraph does not say which clip is which.
The score is shown after each trial and the same two clips are reused, so a listener who can tell them apart but not name them gets 1/2 for 4/4. A guesser still gets 1/16, so the rule holds. One thing to note, not a leak: a 4/4 would show the clips can be told apart, by any cue. Both clips lock by construction, so it speaks to "no need for a worklet", not to "enough to feel locking". The piece's own text says no number hears. Neither I nor any agent heard these clips.

### Recipes — `/Kuramoto Coupling/two-oscillators-coupling-explorer-audio.html` (gathered) — **keep**

This is the Recipe's own output, shipped. It lets a reader run the Recipe's smoke test by ear ("both sliders affect the heard tone, beating slows ... as K crosses K_c"). It loads Tone from the CDN, so it errors here. That is a cloud artefact; on the live face it plays. The file is tracked, and the contract declares its icon. The caption is honest that the note's K/2π and the readout's name are carried as an offer.

## The offers

1. **Gotchas · claim-change → relabel no-claim-edit.** The numbers are confirmed (above). The disputed part is the kind. "Rendered at audio rate" is true: the step is applied on the exact sample and the phase is accumulated per sample. The offer adds the missing half of the reason (the beat is slow next to the frame rate) and names the staircase. That sharpens the reason; it does not change it.
2. **Gotchas · claim-change → confirm the kind, narrow the text.** The carrier never enters either edge, so "100–500 Hz" is the wrong variable. That part is confirmed. Shudder onsets are 9.6 · 4.9 · 3.4 Hz, and the 20 Hz alias line is at −19.2 dB. Two cuts are needed. (a) The shudder is outside the page's situation at 60 frames (9.6, or 11.3 at the widest lockable gap, against a 6 Hz slider). Offer it as a condition for 30 frames or fewer, not as a failure at 60. (b) The alias at Δf 100 sits where K_c is 50, so it limits "sample-coherent ... carriers" and not "enough to feel locking". Also, the pushed tone *lacks* the coupled pair's real line 100 Hz off (−47.4 against −30.4 dB). Suggested condition: the gap well under half the frame rate, and K under about rate/2π.
3. **Gotchas · claim-change → relabel no-claim-edit (an added caveat), and mark it modelled.** The numbers are confirmed exactly: −0.40 dB on schedule, −0.1 to −16.1 dB over eight stalls. Every run still locks, so the sentence's claim stands. What fails is "sample-coherent" for phase. The stall was injected offline, not timed on a device, and the offer should say so. The rAF stall itself is real when a tab is backgrounded while audio runs, which the page's own community list names. The range is a sample, not a bound: a shifted gap can also make the chord up to +0.59 dB louder (1/cos(φ*/2) at φ* = 0.730), so write "shifted", not "quieter".
4. **Gotchas · no-claim-edit → confirmed.** Δθ̇ = Δω − 2K sin Δθ locks at K ≥ |Δω|/2. That threshold is π|Δf| rad/s with K in rad/s, and |Δf|/2 only when K is in Hz, as the explorer's code has it (`:231-240`).
5. **Gotchas · no-claim-edit → confirmed.** √(Δf² − 4K²) gives 1.732 · 0.872 · 0.282 at K 0.5 · 0.9 · 0.99. One note: the page's "past K_c first slows ... then collapses" is also true of the transient. A beat already under way when K steps just past K_c crawls through the bottleneck for about 1/√(4K² − Δf²), 1.6 s at K 1.05, and the explorer's "pulling in" state is that crawl. So this is a clarity edit.
6. **Recipes · no-claim-edit → confirmed, relabel section "→ Kuramoto Coupling".** The note says K/2π (`two-oscillators-coupling-explorer-audio.html:128, :228`). The code adds K (`:234-235`). The readout is |f_A,inst − f_B,inst| (`:250`, labelled `:123`), which below lock swings between Δf − 2K and Δf + 2K. The offer itself says the fix lives in the explorer file, and that file sits in Kuramoto Coupling's bundle. Tone.js's Recipe text says nothing about K/2π.

## The face as a whole

It makes the page's idea felt rather than busy. In the Gotcha's own situation the claim holds, and the piece shows that to a thousandth of a hertz before it goes looking for the edges. The edges are real and every number reproduces by a second route. Where it goes too far is in framing: it calls the page's reason wrong when it is only incomplete, and it lists a shudder that the page's 60 frames cannot reach next to the failures that matter. Both are fixed in the caption and the offer labels; the piece itself needs nothing. Whether the lock is felt is still Loudon's to say: no agent heard it.
