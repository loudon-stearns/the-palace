---
title: "Quantization ↔ Precision vs Flow — Context"
born: 2026-11-02
links:
  - target: "[[Quantization ↔ Precision vs Flow]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why Quantization ↔ Precision vs Flow is shaped as it is — the worked numbers and the teaching rationale two editors cut, and the links it gained without the prose saying them — so the next worker can change the page without redoing the reasons, and I grow when its shape changes."
---

# Quantization ↔ Precision vs Flow — Context

The page arrived on 2026-03-25 as one of the Bridges in the 4 Pillars Framework artifacts, in the palace-wide restructure (`46d904f`). It came in at 444 lines, already mature, linked only to [[Cross-Domain Resonances]] and [[FOUR PILLARS]]. Since then it has lost about 90 lines to two editing passes and gained four links. Its argument has not changed.

## What it left out

Neither cut moved anything anywhere. What went lives only in git.

**The worked numbers (2026-05-28, `b41c7c5`).** The audit's shortening pass cut the ten Bridges' Technical Side taxonomies and repeated "why it works" triads, and kept their structural mappings and philosophy. Here the Technical Side had three worked blocks: a bit-depth ladder from 1-bit to 24-bit with a 3-bit rounding example (0.637 to 0.571, error 0.066, "called quantization noise"), a MIDI timing block, and a velocity block, ending on fixed velocity 100 as "precision achieved, musicality destroyed". All three became one paragraph. The bit-depth and timing numbers check out. The velocity line is loose: 73 is nine steps from 64 but seven from 80, and a grid of 16 drops fifteen of every sixteen levels, not nine. That sentence survives on the page (Quantization ↔ Precision vs Flow.md § The Technical Side).

One anchor did not survive the fold. The timing block said the grid was 16th notes at 120 BPM, 0.125 s apart. The paragraph that stands in for it keeps 0.537 s snapping to 0.500 s and drops the tempo, and the tempo is what makes 0.500 the nearest grid point. If the example is ever touched, put "at 120 BPM" back. The sentence that named the rounding error quantization noise went too; the term stays only in the Structural Identity table.

The same pass cut the whole of Why This Resonance Works. It made three teaching claims. Quantization is the right entry point because its result is audible at once, "obvious even to beginners", unlike EQ or compression. It makes a universal creative tension literal. And the DAW's strength slider, 0 to 100 percent, turns "how much should I plan before creating?" into something you can hear. The third survives in spirit in the 25/75/100 percent experiments. The first, the case for starting here, is gone. The Final Insight went from paired lists, bit depth beside life, to one paragraph.

**The measure (2026-10-24, `a75350e`).** A Weave writer cut Success Metrics from a Not/But list of four self-check questions to its closing sentence (writer log, `_ops/swarm/sessions/weave-2026-10-24/writers/log-set-4.md:60`). The four were: can you say why you quantize, do you try different amounts, can you hear when it helps or hurts, have you questioned your default.

**A note that outlived its section.** An in-file comment, "SHOW & TELL audio examples that can have creative output, exports a sample matrix", has sat in the Technical Side since the first commit (`46d904f`). It began under the bit-depth example. The 2026-05-28 fold carried it onto the end of the new paragraph (`b41c7c5`). No commit has answered it. It is the page's one standing request for a made thing.

## Links it gained

**A type used before it existed.** Like its sibling Bridges, the page was born linking FOUR PILLARS as `exemplifies` before the schema had that type (`46d904f`). The 2026-05-28 audit turned it into a connects-to with exemplifies as a label (`1c1b14c`). The Schema Ceremony that day added the type, and the link went back (`cf8872b`).

**Moved, then wired.** When the 4 Pillars Framework folder was dissolved on 2026-06-16, the page moved unchanged into Cross-Domain Resonances/ (`871cde1`). The Weave that day made the hub link `member-of` and added [[Brian Eno]] and [[Rick Rubin]] as informed-by, and [[Flocking]] as a mirror, local rules giving global feel (`cc01c30`). The 2026-06-26 Weave added [[Quality Manifesto]] as the felt metric (`198833f`), and gave the page its first forward vector (`b67fa03`).

What the prose says has not caught up with those links. Eno and Rubin are named in the Deeper Principle but have never been wikilinked in the body. Flocking and the Quality Manifesto are not named in the body at all. The nearest thing is the student who says it "sounds better quantized, but feels worse". If either link is ever questioned, the reason will have to come from the Weave that made it, not from this page's text.
