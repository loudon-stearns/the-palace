---
title: "SMPTE LTC — Context"
born: 2026-11-04
links:
  - target: "[[SMPTE LTC]]"
    type: connects-to
    label: context-of
forward_vector: "I hold what the SMPTE LTC entry left out: how the project began, what the old page claimed and what was wrong with it, where the working LTC code lives outside the palace, and why the page turned toward teaching, and I grow when the page's shape changes."
---

# SMPTE LTC — Context

What [[SMPTE LTC]] leaves out, and why it is shaped as it is.

## Why the page was rewritten (2026-11-04)

Loudon: "This is a needed page, but the forward vector is wrong." The old vector wanted the page to become a finished, annotated Max implementation and "the palace's example of temporal synchrony as a design problem." The new one turns it toward teaching: the fine technical points, mastery of making and reading LTC in every form, building plugins and applications that read and write it, and a rich face Loudon can teach a class from. The philosophy the old vector reached for stays on the page as two short sections (*Why it matters*, *The trickster in timecode*); the weight moved to the craft.

## What the old page got wrong, corrected in the rewrite

- **"Sub-sample precision locking."** LTC's number resolves a frame and its edges a bit (about 0.4 ms at 30 fps). Finer phase takes edge interpolation or another clock.
- **"Peak detection yields the bit stream."** Readers time the intervals between zero crossings; peaks carry nothing.
- **"Reverse playback — probably not."** LTC reads in reverse: the sync word is not symmetrical, and the reader learns the direction from it.
- **"Reading LTC is a frequency-domain act."** A reader works in time, measuring intervals. The duality is honest only as a choice: biphase mark is two tones an octave apart, so a reader could also listen for tones.
- **"Generated at −10 dBFS nominal."** No source for that number was found. The rule kept is GoButton's: a few dB above what the receiver needs, never clipped.
- **Drop-frame "skips frame-number counts at minute boundaries."** Every minute except each tenth.
- **Multi-rate: "can a single LTC stream serve both?"** No: one stream carries one rate. A 24 fps and a 25 fps system need two streams, or a converter.

## How the project began

It began as an Ableton Extension (Node.js, the Extension SDK) that wrote LTC as WAV files: `frameBuilder.cjs` built the eighty bits, `biphaseEncoder.cjs` turned them into samples, each with a test, and `ltc-generator.js` ran the same in a Max `[v8]`. Its limits — 24, 25 and 30 fps only, no drop-frame, files rather than live audio — are why it became a reference rather than the encoder. A copy lives in `GoButton Local/v2/timecode/reference/generator/`.

The old page said the project then "transitioned to Max MSP v8 native implementation"; the v8 there is Max's `[v8]` JavaScript object, not Max 8. What happened next is the GoButton timecode device, built 2026-10-03 to 10-06: `ltc.js` as the tested specification, gen~ codebox encoder and reader held to it sample for sample, a TIMECODE track of named clips, Locate, the reader that needs no frame-rate setting. Its notes are `GoButton Local/v2/timecode/LTC-NOTES.md`, the best single account of LTC Loudon's work has produced; they restate the facts of Phil Rees's "SMPTE EBU timecode" page, which asks not to be reproduced.

## Open threads

- The link to [[Modes of Collaboration]] (`multi-device-sync`) is kept for now. Under the teaching vector it reads as forced — device sync is not a mode of collaboration — and whether to cut it is Loudon's call.
- The rich face holds Count, Bits, the encoder and the backward reader (`1436e03d`). The page's *The teaching room* is the ladder the rest should follow.
- The scroll has a Plan, adopted on 2026-11-08 (`f1c14499`).
- Approved unseen: the encoder and the backward reader were approved 2026-11-04 on the challenger's word; no one has played them with Loudon. The first hearing is owed.
- All the way up. Loudon, 2026-11-08: "I have read the page, it is excellent, it states that we need to teach "all the way down" but it doesn't teach "all the way up" we have done a great job of showing how the protocol works, but we have not shown how it is used." It stands on the scroll as a Standing Order. The forward vector still says "all the way down"; a new one is left to the next session on the page.
