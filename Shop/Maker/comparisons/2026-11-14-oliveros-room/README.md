---
title: "Hand against Shop — the Pauline Oliveros room"
born: 2026-11-14
links:
  - target: "[[Maker]]"
    type: connects-to
    label: "comparison-of"
  - target: "[[Stable Audio Open]]"
    type: connects-to
    label: "tried"
  - target: "[[Pauline Oliveros]]"
    type: connects-to
    label: "made-for"
forward_vector: "I am one comparison waiting for Loudon's ear: the same piece made by hand and through the Shop. Once he has judged it, the verdict goes to Stable Audio Open's page and I stay as the record."
---

# Hand against Shop — the Pauline Oliveros room

The first comparison of stage 0 of the Shop discovery design ([[The Shop — sketch — discovery design]]). Loudon, 2026-11-14: "When we think that the shop will be worse we make through the shop and make handbuilt and compare and contrast and use that info help us in future decisions."

**The piece.** Beside "How her mind moves" on [[Pauline Oliveros]]: the same room played twice. First attention closes on one drip and everything else falls away; then it opens and nothing is left out.

**Two files to play, 26 seconds each.**

- `hand — one point, then the whole sphere.m4a` — the light round's piece, as it sits on her rich face. A room synthesized from noise, sines and plucks (`Enrichment/light-round-2026-11/make-sounds-3.py`, `listening()`). Its maker's own note afterward: "filtered noise with sine blips does not read as a room."
- `shop — one point, then the whole sphere.m4a` — the same shape, different materials. [[Stable Audio Open]] made a drip and a room; the hand gated and mixed them. The two sources are here too, ungated: `source — drip.m4a`, `source — room.m4a`.

**Held the same:** length, the gate times (focal to 11.5 s, global from 13 s), the depth (everything but the drip fifty times down while focal), peak level.

**Different:** the materials. Also the stereo: the hand pans its six sources; every Stable Audio take came back with left and right identical, so the Shop side is mono. And the hand's room has a bell, a bird and a prepared string placed at chosen seconds, each drawn in its picture; the Shop's room has whatever the model put there, and no picture can be drawn from it.

**What was measured.** Nobody has heard either side of this pair as a pair.

- The first take (seed 1932, `make.py`) missed the brief by the numbers: the drip ran about four onsets a second and fell 9 dB across the clip, and the room rose 8 dB at 15 s.
- So four seeds of each were taken with tighter prompts (`takes.py`, `takes.json`) and chosen by measurement: the drip nearest one onset a second (seed 1935, about 40 onsets in 26 s by a rough detector that may count a drop and its ring as two), and the room with the flattest level (seed 1932, 1.2 dB across quarters).
- No take held "one drop a second" by that count. The hand's drip is placed every 1.3 s exactly.
- Cost: the model loaded in 8 s and each 26 s render took 1.6 to 3.1 s. Ten renders in all.
- `report.json` holds the prompts, seeds, every take's numbers, the levels measured on the saved file, and a hash of each file.

**What only an ear can say.** Whether the Shop's room reads as a room where the hand's does not. Whether the drip reads as one point of attention when it is not one drop a second. Whether the piece's claim survives the trade: a room that sounds real but cannot be drawn, against a room that can be drawn and does not sound real.

**Heard by:** Loudon, 2026-11-14, both files. His verdict, whole:

> the " by hand" version sounds like "musique contrete" a collection of precise crafted sounds assembled together. The stable audio version, while not as good by my ear, rings "truer" to me and doesn't feel artificially collected. I feel for this example you had some very specific sonic goals, and stable couldn't meet them, but you are getting good at editing pieces together, and perhaps it is choosing to use stable to generate pieces that would be "sampled" and by hand for sounds that are clearly "synthesized".

So neither side won. The hand's is better made and reads as assembled; the Shop's is worse and reads as true. What he offers from it is a split by kind of sound, not by tool: generate what would have been sampled, build by hand what is plainly synthesized, and edit the two together.

## The third room — his split, tried

`third — one point, then the whole sphere.m4a`, with its picture, made the same day on his "Make the third" (`third.py`, `third-report.json`).

**How it is made.** Stable Audio Open generates each sampled thing on its own, four seeds each: one drop, a bird call, a far bell, a low plucked string, a bed of rain. The hand keeps the mains hum, which is plainly synthesized. Then the hand cuts one event out of each chosen take and places, pans, gates and mixes them at the first piece's own times. The picture is drawn from the same arrays, so it shows what was placed.

**Measured on the saved file.** Nine drips in the first 11 s, 1.27 s apart on average (the hand's are 1.3 s). Left and right now differ (correlation 0.78; the second version was 1.00). The focal half sits 8.7 dB under the global half.

**What went wrong on the way, and was fixed by measurement.**
- The bell was first chosen as a 0.06 s click, because the choosing rule rewarded a sharp onset. Now a ringing thing must keep its ring. The bell that was kept stands only 6 dB above what came before it in its take, so it may arrive with noise or an earlier ring under it. An ear has to say.
- The rain's first wording ("soft steady rain heard through an open window, constant level…") varied 7 to 17 dB over four seeds. The plain wording from the morning's probe, "steady rain at a constant even intensity", came back within 0.3 dB.

**Cost.** Twenty-one renders, each 0.6 to 2.4 s.

**Not known.** Whether the cut events sound like what they are named. The bird and the string were chosen by how cleanly they start, not by what they are. Nobody has heard this version.

**Heard by (third version):** nobody yet.
