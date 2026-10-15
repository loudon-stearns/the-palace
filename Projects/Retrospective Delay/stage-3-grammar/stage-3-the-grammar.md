---
title: "Retrospective Delay — the grammar behind the spell (session draft)"
project: "[[Retrospective Delay]]"
loudon-live-status: drafting
last-updated: 2026-10-14
---

# The grammar behind the spell — session draft

*The third move of five, and the first of the two deliberate migrations: vanilla Max to Gen~. Still a Max for Live audio effect; the core moves into a gen~ object inside it. About 90 minutes, split roughly half framing, half making, because the shift in thinking needs room.*

Draft written by the steward from a working model ([grammar_model.py](grammar_model.py)) and an unopened patch ([grammar.maxpat](grammar.maxpat)). Nothing here has been played in Max yet.

## What the participant leaves with

The séance from last session, rewritten as about thirty lines of code that run once per sample. The same instrument — the model says the gen~ ghost and the vanilla ghost match to the sixteenth decimal place. And two ideas they can carry to any patch:

1. **Order is a musical decision.** Reading the tape before writing it is the difference between "one measure ago" and "now."
2. **A delay, a looper, an RMS meter and an oscillator are one buffer at different lengths.**

## Frame (20 min)

Open on the question last session left: *why did the whole note have to be 0.999?*

In the séance, `poke~` writes the tape and `wave~` reads it. At a lag of exactly one measure they point at the same slot. Max processes signal objects in vectors, in an order you didn't choose and can't see in the patch, so "one measure ago" and "right now" were a coin toss. We dodged it with 0.999.

Gen~ answers by changing the grain of time. A vanilla patch is a set of objects, each handling a block of samples. A gen~ patch describes **one sample**, top to bottom, and Max runs it 48,000 times a second. Lines happen in the order you write them. So you can say *read first, then write* — and mean it.

Play the two renders back to back. Same patch, same phrase, lag exactly 1, knob up:

- [order-read-first.wav](order-read-first.wav) — while you play the second measure you hear the first under it. Correlation with the input one measure earlier: 1.000.
- [order-write-first.wav](order-write-first.wav) — while you play, the "ghost" is just you, louder. Correlation with the input right now: 1.000. When you stop, both versions hold the phrase, because in silence the tape writes back what it already had. The bug only shows while you're playing, which is why nobody caught it by ear in the vanilla patch.

## Make (40 min)

Start from the séance patch. Delete everything between `plugin~` and `plugout~` except the transport clock and the measure length. Make a `gen~`, double-click, add a codebox. Build [seance.genexpr](seance.genexpr) in this order, listening after each step:

1. **The tape and the two heads.** `Data tape(192000)`, a write slot from the measure phase, one `peek` and one `poke`. Read line above write line. Send `lag 1.` and hear the whole note, exact.
2. **Silence keeps.** The envelope, the threshold, and `old + listen * (in1 - old)` — listen while you play, hold in silence. Notice it's the same arithmetic as the vanilla `-~ / *~ / +~` chain, now readable in one line.
3. **The seam.** `listen = listen + clamp(target - listen, -lstep, lstep)` with `lstep = 1 / mstosamps(5)` *is* `rampsmooth~ 240 240`. Same 5 ms crossfade, same sound — and now it says "5 ms" instead of a sample count that only means 5 ms at 48 kHz.
4. **Two heads, one fade.** The lag change is now an `if`: when the lag Param moves, the idle head takes it and the fade turns toward it. Last session's `t b f b → counter → gate 2` routing becomes eight lines.
5. **The knob.** `Param gain`, slewed. The live.dial now just sends `gain $1`.

Ask the room which version they'd rather debug in a year. Then ask which one they'd rather *teach from*. The answers usually differ, and both are right.

One honest wrinkle to name: the write slot is `floor(phase * M + 0.5)`, rounded, not truncated. `phasor~` hands gen~ a float that can land a hair below a whole number, and truncating would occasionally write one slot early. At tempos where a measure isn't a whole number of samples the slot will also sometimes repeat or skip one — the vanilla patch did the same, invisibly.

## The same buffer at 11 milliseconds (20 min)

Put [compressor-window.genexpr](compressor-window.genexpr) beside the séance. It's the RMS detector from [[Compressor Design]]: a 500-sample window (about 11 ms at 44.1 kHz) that keeps a running sum by adding the newest squared sample and subtracting the oldest. Look at its middle two lines:

```
oldest = peek(win, w);   // read first: one window ago
poke(win, sq, w);        // then write
```

They are the séance's read-then-write at a whole-note lag. The compressor's window *is* a retrospective delay — one that holds about two hundred times less time and is never played back, only subtracted. (The model checks it: the running sum matches a plain windowed RMS to 1e-15.)

Then cross the line on purpose. [shrinking-measure.wav](shrinking-measure.wav) freezes one phrase into four tape lengths and plays only the held loop:

| tape length | loop repeats at | what you hear |
|---|---|---|
| 2 s (a measure at 120) | 0.5 Hz | the phrase — memory |
| 250 ms | 4 Hz | a stutter — rhythm |
| 50 ms | 20 Hz | a flutter, right at the edge of pitch |
| 500 samples (the compressor's window) | 96 Hz | a tone — the loop has become an oscillator |

Somewhere between 50 ms and 11 ms, time turns into pitch. That's [[Frequency-Time Duality]] heard rather than drawn, and it's why the compressor's window works below perception: at that length, the buffer stops being a "when" and becomes a "what."

## Reflect (10 min)

*What did writing it as one sample change about how you think of the séance? Where else in your patches is order deciding something you never chose?*

Hand-off to the face: the gen~ object has one knob's worth of meaning in it, `gs`. Next session, a cat is going to wear it.

## Left open

- The gen~ patch hasn't been opened. The embedded codebox format is written from memory; the paste-it-yourself fallback is in [build_grammar_patch.py](build_grammar_patch.py).
- The tape is fixed at 4 s, so below 60 BPM the measure clips. Fine for a session; the portal move will want to size it from the sample rate.
- The shrinking-measure render uses a hand freeze, not the level gate. At 500 samples the gate's 100 ms release is two hundred loops long and would erase the tape before it held anything. The gate has to scale with the buffer — a good question for anyone who wants to build the tiny version for real.
