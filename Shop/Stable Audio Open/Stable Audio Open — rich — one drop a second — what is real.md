---
title: "Stable Audio Open — rich — one drop a second — what is real"
born: 2026-11-17
links:
  - target: "[[Stable Audio Open]]"
    type: connects-to
    label: rich-face-of
forward_vector: "I keep, whole and in the maker's words, what is real and what is a choice in the piece beside me, so a reader of the face can tell a finding from a decision."
---

**What is real and what is a choice**

- Real: both halves come from small-sfx at its defaults (8 steps, cfg 1.0). The first half is the page's own drip prompt, sent whole: "slow water drip, one single drop falling into water every second, silence between the drops, close and dry, no rain, no stream". Re-rendered on 2026-11-17 at seed 1935, the whole 26 s take gives 40 onsets by the page's own detector, the same count as on 2026-11-14 and the low end of the page's "40 to 69".
- Choice: seed 1935 is the take the 2026-11-14 selection picked as nearest one onset a second, the fewest-onset of its four seeds. So the piece shows the kindest take, not the worst. It was rendered once; no seed was hunted.
- Choice: you hear the first 10 s of the 26 s take, not the whole.
- Construction, not measurement: the second half's one-second rate comes from the grid. The hand placed one drop (seed 1935 of four, chosen by third.py's cut rule) identically ten times, at 0.5, 1.5 … 9.5 s. Its count of 10 and its 1.002 s mean gap confirm the placement; they do not show anything the model did. Nothing but the timing varies: real drips vary, and these don't, on purpose.
- Choice, and a limit: "onsets" are the page's detector (20 ms windows, a crossing of median + 12 dB), not drops. One drop and its splash can count twice. The asked-for count moves with the detector's settings. At 10 ms and 40 ms windows it is 28 and 13. With the 20 ms windows starting 5, 10 and 15 ms later, it is 21, 22 and 21. The placed half counts 10 under every one of these settings. The detector also misses an event at the very first instant (0.02 s), because nothing comes before it.
- Choice: each half was set to the same sample peak, then the whole file was lowered about 1.4 dB (sample peak −0.97 to −2.35 dBFS), so the m4a sits under the house ceiling of −1 dBTP. Before lowering, the true peak was −0.1 dBTP at −0.97 dBFS sample peak. Each lane of the picture is scaled to its own loudest moment, so the picture compares timing, not level.
- Measured on the m4a: 21.0 s, mono (as small-sfx gives), sample peak −2.35 dBFS, true peak −1.4 dBTP, integrated loudness −23.5 LUFS. That is 7.5 LU under the house's −16 LUFS for a finished mix. Reaching −16 under −1 dBTP would mean limiting the drops' attacks, which are what the piece is about, so I left the level there. That is a choice an elder may overrule.

**Leaking in:** the third Oliveros room. The single-drop prompt and the cut rule are borrowed from `Shop/Maker/comparisons/2026-11-14-oliveros-room/third.py`, the recipe the page cites in § Recipes. No neighbouring page's sentence is borrowed.

**Added at placing, from the challenger's second verdict; the Concierge's words, not the maker's.**
- The two halves were matched by peak, not by loudness. The asked half measures −27.7 LUFS and the placed half −21.1, so the steady half plays about 6.6 LU louder. That difference comes from the matching and is not part of the finding.
- The file is 44.1 kHz mono, where the house line asks for 48 kHz stereo. Mono is as small-sfx gives; the sample rate is a second departure from the house.
- The bench's record of what made this piece does not name the step that lowered the file 1.40 dB; the account above does.
