---
title: "Retrospective Delay — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Retrospective Delay]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record for Retrospective Delay's proposal-round face: a verdict and a reason for each of its ten pieces, the checks re-run from the steward's own models rather than the pieces' engine, and the four offers held against what the steward had already recorded, so Loudon can approve section by section knowing what was tested and what wasn't."
---

# Retrospective Delay — rich — challenge

Challenger for the proposal round of 2026-11-03, on the maker's commit `fa569346` in the worktree `enrich/retrospective-delay`. I read the page, the manifest, both made pieces and their check, the gathered files, the steward's scroll (Now, Plan, Standing Orders, cycles 19 to 26) and its tuning ledger. I judged from those and the maker's commit body, nothing else.

## What the face touched

The maker's commit adds four files and nothing else, all in the bundle's top folder: the manifest, the two pieces and `check.mjs`. `git diff main -- "Projects/Retrospective Delay.md"` is empty, so the page is byte for byte what it was. Nothing under `plugin/` is touched, and the face gathers nothing from it. The owner's checkout shows no change under the project in `git status`; its `plugin/` holds the steward's ignored build output (`build/`, `out/`, logs), and the face reads none of it. Cycle 26 (`76f73276`, the Speed knob) is an ancestor of the worktree, so the steward's latest record was in front of the maker.

## The checks

- `conform.mjs "Retrospective Delay"`: 3 pages, introduced 2, errored 1. The tape and phrase or taps, 0 errors and 0 warnings at 760 and 1130 px. `portal-web.html` (gathered): `grant-missing` (microphone) error, plus `review-layer` and `play-silent` warnings. This is the maker's account, less the `file-local` warnings the commit cleared.
- `fingerprint.mjs`: all five sections in step (941ae3656376, 6ecda98128fb, f94d53f5acca, 29dcd2f4ff16, c83d1eb14f6d).
- `untracked.mjs`: every file the face names is tracked.
- The maker's `check.mjs`: all pass. It shares an engine with the pieces, so I didn't count it as independent.
- Served with `rich-server.mjs --root <worktree> --detach` and driven in headless Chromium. The console was clean on load; the two made pieces framed; 10 proposal chips; no miss boxes. Neither made piece built an AudioContext before a click. I walked both pieces through all five steps. The tape's grid read `1.00 0.00 0.00 / 1.00 0.00 0.00 / 1.00 0.97 0.00 / 1.00 0.97 0.94`. Phrase or taps read "max difference 0, exactly" over 384,000 samples, then "kept 0.80 · left 0.42" at f 0.80 and "kept 0.94 · left 0.00" for the séance. A ▸ play it click started the tape's context, running at 44.1 kHz. When I played the hide signal into every frame (the method `check-hidden-hush.mjs` uses), the context went to `suspended`. After I drove clicks inside the frames, two warnings appeared: `postMessage` target-origin mismatches (8851 vs 8850). They come from `rich.js:185`, the host's `tell`, not from the pieces, which matches the maker's account. Server stopped.
- Nothing licensed is copied. The phrases are synthesized plucks, and every gathered file is the steward's own render, tracked.

## Independent recompute

I didn't use the pieces' engine for any of this. I used the steward's own `witness_model.py` and `seance_model.py` plus the tracked WAVs, imported with no bytecode written. The script is in the session scratchpad, not the bundle.

- **The seven renders.** The maker's claim that its engine reproduces witness-input, witness-A, witness-B, seam-hard, seam-smoothed, comein-hard and comein-crossfaded sample for sample is confirmed by its check (0 LSB on all seven). Independently, the steward's model gives witness A minus a half-note echo = 0.000 at every one of 768,000 samples, and `witness-A-as-specified.wav` equals the quantized echo to 0 LSB.
- **The twelve-way knob table.** I wrote my own tape with a switch for knob side: the steward's gate and 5 ms ramp, a 20 ms knob ramp, and the same windows. Knob in, always writes: 1.00 / 0.00 / 0.00. Knob in, keeps: 1.00 / 0.00 / 0.00. Knob out, always writes: 1.00 / 0.97 / 0.00. Knob out, keeps: 1.00 / 0.97 / 0.94. Same as the piece. The result doesn't depend on the gate listening to the player rather than to the knobbed input: either way, with the knob in, nothing reaches the tape while the knob is down.
- **Phrase or taps.** In the steward's séance model, kept is 0.9386 and left is 5.8e-17. With a one-measure-tap echo, f 0.50 keeps 0.50 and leaves 0.08; f 0.80 keeps 0.80 and leaves 0.42; f 0.94 keeps 0.94 and leaves 0.78; f 0.95 leaves 0.82; f 1.00 leaves 1.00. Of the 51 settings, none both keeps phrase one and clears it. With a half-measure phrase two, the séance leaves 0.44.
- **The seams, read straight from the WAVs** (the input is silent in the window). seam-hard 0.1784, seam-smoothed 0.0110, comein-hard 0.2373, comein-crossfaded 0.0325. In seam-hard, the largest step within 50 samples of a measure line is 0.0081.

## The pieces

**The Core Architecture · `Retrospective Delay — rich — the tape.html` — keep.**
1. *Test or decoration:* a test. It puts the page's own words, "multiplies the write amplitude", against the summoning gesture the rest of the page promises. With the knob still, all four versions agree (1.00), and that column is the control. They part only when the knob moves. If the page's write side could summon, the "later" column would say so, and it doesn't.
2. *Faithful:* yes. It quotes the page, labels which version is the page's and which is the séance's, and leaves the contradiction open; the verdict line names it. It doesn't claim the page says silence-keeps. Step 4 says the opening line is a promise "this tape can't keep yet", which is the page against itself, said plainly.
3. *Walks up:* yes, five steps, each one new thing: the write head alone (no read head drawn, ghost silent), the read head, the knob in two places, silence keeps, then the test.

It runs clean, sounds only on a click, and hushes when hidden.

**How It Differs From Standard Delay · `Retrospective Delay — rich — phrase or taps.html` — keep.**
1. *Test or decoration:* a test, two of them. The null (max difference 0) could have failed, and it is the honest version of the witness finding. The keep-then-play-over sweep could have found a feedback setting that does both. For an echo, kept equals f by construction, so the sweep's force lies in the séance's 0.00 and in the half-measure counterpoint (0.44 left), which keeps the piece from overclaiming.
2. *Faithful:* yes. It gives the clarity claim to the séance, not to the architecture the section describes, and says so in the verdict. It quotes the page's own "gradually erased by the present" for the half-measure case.
3. *Walks up:* yes. One phrase alone, then an echo, then the tape, then the null, then the test. The change from a half-note tap (step 2) to a one-measure tap (step 5) is named as giving the echo its best chance.

Note, taste only: the verdict could add that the held tape is itself a loop at feedback 1 which the present overwrites. That is the kindest reading of the page's "feedback is natural", and it would give Loudon a line to keep rather than only one to cut.

**The Ghost Metaphor · `stage-2-seance/seance-performance.wav` (gathered) — keep.** It is the summoning made audible, and it would have come out differently with a write-side knob: the ghost survives a measure dismissed at gain 0. The caption matches `seance_model.py`'s `performance()` step by step, says it was rendered from the model and not played in Max, and runs 30.0 s as stated. This is the tracked stage-2 render, not the cycle-26 one in `plugin/proofs/`, which is ignored.

**Interface Design Philosophy · `proofs/2026-05-04-seance-cat-poses-v2-7frames.svg` (gathered) — keep, with a note.** It illustrates more than it tests: it is the page's character concept as first drawn, seven poses set by the knob alone, and its labels match the caption (0% dormant through 100% ascended). It earns its place beside face-moments, whose last frame, the empty room, shows what a knob-only pose can't tell apart.

**Interface Design Philosophy · `stage-4-character/face/face-moments.png` (gathered) — keep.** The six labels in the image match the caption, including *dismissed: asleep, past still kept* and *the empty room: knob up, nothing kept*. It carries the steward's cycle-23 finding that the cat reads the device, not the knob, and the caption says it as the steward's, not as the page's claim.

**Interface Design Philosophy · `stage-4-character/face/face-film.mp4` (gathered) — keep.** 30.0 s with an audio track, as captioned. It is honest that nothing has run in JSUI.

**Open Questions · `stage-3-grammar/shrinking-measure.wav` (gathered) — keep, with a note.** Item 1 asks one measure or two; this goes the other way, down to 500 samples, and the caption says "crossed the other way". It is a real cross-domain moment ([[Frequency-Time Duality]], which the page links). The figures (2 s, 250 ms, 50 ms, 500 samples) match cycle 21's table. Note for the maker: it also points at a finding nobody offered. Under the always-recording architecture the buffer's length never shows (the null above), so item 1's question only has meaning once the tape holds. That may be worth a fifth offer in a later round.

**Open Questions · `stage-2-seance/seam-hard.wav` (gathered) — keep, with a note.** It confirms item 2's answer and moves the seam: 0.178 against the chord's own 0.013, and 0.008 at the measure line. One precision point for the caption, and for offer 4 with it: the tick sits where the tape *stops listening*, about 0.45 s after the chord stops (0.82 of the measure; the chord ended at 0.60), because the gate waits for a 100 ms release to fall under its threshold. "Where you stopped" is close; "just after you stopped, where the tape starts holding" is exact. The come-in click sits exactly at the entry (0.410 of the measure).

**Open Questions · `stage-2-seance/seam-smoothed.wav` (gathered) — keep.** 0.0110, below the chord's 0.013, as captioned. Its render carries the 5 ms linear crossfade of cycle 22: the maker's engine reproduces it with a 5 ms step, and `seance_model.py`'s `GATE_RAMP` is 240 samples.

**Open Questions · `stage-5-portal/portal-web.html` (gathered) — keep, with a note.** The `grant-missing` (microphone) error stands until Loudon says yes to a grant; that is his call, not the round's. The piece plays its own phrase without the mic, and the mic is asked for only from its button's click. The caption's "hand transpiler, not RNBO's own web export" matches `build_portal_web.mjs`'s header. The review-layer warning (notes in storage that won't keep) and play-silent (conform's click not finding *Start audio*) are tolerable. I didn't drive this frame; it hadn't loaded below the fold in my run.

## The offers

All four carry what the steward found in cycles 19 to 22 that never reached the page. None collides with the steward's own pending proposals 2, 3 and 5, which touch item 4 of Open Questions, a new Interface paragraph, and VST Template. Offer 4 and proposal 2 sit in the same section, so whichever Loudon takes first will flag Open Questions' pieces for a re-tune. That is the drift mechanism working, not a conflict.

1. **Knob on the read side — confirmed, and understated.** `seance_model.py`, `seance.genexpr` ("on the way OUT of the tape"), `portal.codebox` (same words) and the plugin's `Algorithm.h` (`out = Dry·x + Gain·ghost`, writes `sl`) all put it on the read side. So do the witness builds, which come before the séance: `witness_model.py` (`GAIN`, "the conduit, on the read side") and `build_witness_patch.py` (`wave~ → *~ vca`). The write side lives only in the April spec and in the page. The offer's numbers hold (above). It could say "every build", not "every build since the séance".
2. **The opening line needs silence-keeps — confirmed.** Ghost RMS per measure from the tracked WAVs. Witness A: 0.068 0.090 0.048 **0.000 0.000** 0.058 0.048 0.000. Witness B: 0.068 0.090 0.077 **0.077 0.077** 0.076 0.069 0.069. Under "always recording", the last phrase plays once in silence and is gone. This also matches Loudon's KEEP-SPEC call of 2026-10-15 (`retrospective-delay-steward-044`): the witness stays an echo, and silence-keeps belongs to the séance.
3. **An echo with no feedback, and no feedback path — confirmed.** Null 0 at every sample (768,000 in the steward's input, 384,000 in the piece's). Séance 0.94 kept, 0.00 left; echo 0.42 left at f 0.8, 0.82 at f 0.95; none of 51 does both. No build feeds the ghost back into the tape: every write takes the input alone, and the steward dropped the promised "re-echoes" in cycle 22 for that reason. The page claims a "natural" feedback path; there isn't one. A gentler rewording is open, as noted under phrase or taps: the hold is a loop at feedback 1 that playing overwrites.
4. **The seam is where you stop and where you come back in — confirmed, with one precision.** 0.178 hard vs 0.011 crossfaded; 0.237 vs 0.033, read from the WAVs. The measure line's largest step is 0.008. The going-quiet click lands where the tape starts holding, about 0.45 s after the last sound, not at the instant you stop. The offer's line should say so.

## The face as a whole

It makes the page's idea felt, and it makes the page's own contradiction audible. The two made pieces are the Hilaritas kind: something that could fail, put in your hands, reached a step at a time. They land where the page is weakest. The page describes a write-side knob and an always-recording tape, then promises a séance that only a read-side knob with silence-keeps can perform, and the face lets you hear both and count the difference. The gathered pieces are the steward's best evidence placed by the sentences they answer, each captioned honestly as model-rendered and not yet played in Max or Live. It is busy only in the Interface section, where three figures stand beside two paragraphs, and even there the empty-room frame earns the space. What no one can say yet is how any of it sounds to a player: an agent can't hear the mix, and nobody has played the plugin in Live.
