# One knock, five rooms

**Files:** `one-knock-five-rooms.m4a` (20.25 s; also `.wav`), with its picture `one-knock-five-rooms.png` (`.svg`).

*Remade once, 2026-11-17, after the challenge (`challenge.md`): the words and the picture changed, the sound did not.*

## Caption

**Growing the network changes the room.** One knock is sent into one colony five times as it grows. At 3 threads it rings for 0.40 s. At 25, 60 and 170 threads it rings for 1.27, 1.76 and 2.29 s. Frost it until no dead end is left (121 threads) and it rings for 2.68 s. The colony is all that changed between the five. Each number is RT60, the time a sound takes to fall by 60 dB, measured on this one colony with the plugin's own engine. Nobody has heard it yet.

## What is real and what is a choice

**Real, from the engine.** Every sample comes from `Projects/Mycelial Reverb/plugin/src/Algorithm.h`, the plugin's engine, which was read and not changed. Its gate matches it to the piece's JavaScript sample for sample. This piece grew the colony, copied the network at each stage, and rendered the knock through it. The thread counts, loops, dead ends, listening points and their positions are the engine's own. The challenger rebuilt the harness, and every array came out byte-identical.

**The colony is one, not a median.** Seed 21 is the first seed of the piece check's growth section, chosen before any run. Food runs on between stages here, but the check restarts its food at each stage, so this is not the check's seed-21 colony.

**The stages are a choice.** I picked 3, 25, 60 and 170 threads (fed for 0, 3, 14 and 34 s), then frosted until nothing died.

**The frost is nine frosts, not one.** The page's table says "a frost kills every dead end one thread back … what is left rings longer". On this colony one frost took 14 dead ends and changed RT60 by less than a thousandth of a second (2.291 → 2.290 s). That room is measured but left out of the sound, because it sounds the same as the one before. What you hear is the dish after 9 frosts, when no dead end is left.
- Across the check's twelve seeds (`out/survey.jsonl`), one frost lengthened the tail in 9 and shortened it in 3, by a median of +0.025 s.
- Frosting until no dead end is left lengthened it in 12 of 12, by a median of +0.36 s.
- So "rings longer" is true of frosting until no dead end is left, and close to a coin toss for one frost. The challenger's rerun with fitted lines agrees.

**"No dead end left" is not "all joined up".** Of the frosted dish's 121 threads, 51 are bridges: threads on no loop, whose loss would split the colony in two. They were counted from the saved threads.

**Two measures, drawn as two.**
- **Red** is RT60's own measure: a single-sample click sent through the same network, and the energy still to come at each moment (Schroeder's backward sum), in dB of its own start. RT60 is read off it the check's way: a straight line through the points where it crosses −5 and −35 dB, with its time doubled. The tick marks that RT60. The red curve itself reaches −60 dB within 0.09 s of the tick (at 0.44, 1.35, 1.85, 2.33 and 2.68 s).
- **Grey** is the knock as heard: the loudest point in each 10 ms of the saved file, in dB below the file's loudest moment, cut off at −60.
  - The newborn's grey starts at 0 dB, because it holds that loudest moment. It drops below −60 dB at 0.46 s, a little after its RT60 of 0.40 s.
  - The other four start 5.7 to 9.1 dB down. Their highest point there is the dry knock, not the dish.
  - They leave the scale at 1.16, 1.43, 1.78 and 2.15 s, before their RT60s, because they are measured from the file's loudest moment and not from their own start.
- The two do not disagree; they answer different questions.

**The mix is the plugin's rules, without its guard.**
- The dry knock is at 0.6, the plugin's default Dry level.
- The dish is at ×3.5, the plugin's wet gain for carry 3 s.
- Neither the piece's compressor nor the plugin's guard is used.
- Carry is 3 s, soil wetness 0.25, and tips give back 0.8: the piece's house settings.
- One gain of −4.72 dB over the whole file puts its loudest sample, in the newborn room, at −1.00 dBFS.

**Why the grown rooms are quieter is not explained.**
- The engine's rule: the spore is a listening point at 0.7071 per side while there is no fruiting body, and at 0.45 times that once there is one. Each fruiting body is tapped at 1/√n, panned by where it sits.
- I tested whether that rule explains the drop (`probe.cpp`, `out/probe.jsonl`).
  - As built, the four later rooms' dish peaks are 6.5, 11.6, 13.7 and 13.7 dB below the newborn's; their energy is 5.4 to 9.9 dB below.
  - Listening at the spore alone, at the newborn's own gain, the drops are 13.1 to 14.8 dB in peak and 7.2 to 8.8 dB in energy.
  - So the tap rule does not make the grown dish quieter. At 25 threads the fruiting body's tap makes it louder than the spore alone would be.
- The drop comes from the network itself. Why a grown network gives back less at the spore was not tested, so I do not say.
- Nor did I test why the newborn is the loudest room. The first draft's "because three short loops make a comb" is withdrawn.

**Loudness can be heard as length.** The shortest room is the loudest, and the longest rooms are among the quietest. A listener may hear "quieter" where the caption says "longer". The rooms were left at the level the engine gave them, because evening them out would hide the drop just described. Only an ear can say which one a listener hears.

**The knock is the piece's knock.** It is `knockBuf()`, 90 ms long, with its 96 samples of noise drawn from a seeded source (seed 7) instead of `Math.random`.

**The drawing.**
- Each dish is drawn at the same scale, 1000 × 600 engine units, so its growth shows as size.
- The newborn dish is also drawn ×7 in a circle beside it: one junction and three threads, which at true scale hide under the ring.
- Line width follows each thread's thickness.
- Red dots are the fruiting bodies, where you listen. The red ring is the way in at the spore, which is also a listening point.
- Each lane names its two zeros: red's is the click's own start, grey's is the file's loudest moment. The gap between the curves is not a finding.
- The time axis runs 0 to 3 s. Each room plays 4 s in the sound, but every room is below −60 dB of the file's loudest moment by 2.2 s.
- The grey is drawn from the saved 16-bit wav.
- The stereo is close to mono (the challenger found an L/R correlation of 0.988).

**Loudness, measured on the saved files.**

| | WAV | M4A |
|---|---|---|
| Integrated loudness | −26.0 LUFS | −26.1 LUFS |
| True peak | −1.0 dBFS | −0.9 dBFS |

The file is quiet on purpose: one gain over the whole file keeps the rooms' real levels against each other.

**Workshop data.** `out/` holds the engine's arrays, `rooms.json`, `measure.json`, `survey.jsonl` and `probe.jsonl`, plus the compiled binaries `rooms`, `survey` and `probe`: about 27 MB of workshop data, not for the bundle. Only the m4a and the png are meant to be placed.

**One command, one owner per file.** `python3 make.py` makes exactly the files to be placed: first the sound (`make.py sound`, the bench job `one-knock-five-rooms`: wav, m4a, `out/rooms.json`, `out/measure.json`), then the picture from the saved wav (`make.py picture`, the job `one-knock-five-rooms-picture`: svg, png). The frost survey and the tap-rule probe have jobs of their own (`one-frost-survey`, `tap-rule-probe`). The m4a is the same file the challenger measured, byte for byte.

## Leaking in

The piece check of Biomechanical Synthesis, `Projects/Biomechanical Synthesis/workshop/2026-11-10-mycelial-reverb/check-output.txt`, lines 21, 26 and 34. Over twelve colonies its medians run from 0.40 s at 3 threads to 2.22 s at 170, and 2.66 s "after frosting to the loops alone". This one colony lands near them, at 0.40, 2.29 and 2.68 s. The knock and the RT60 method are also the piece's.

## Anchor

"the network that grows is the room you hear"

## Made with

1. hand: Mycelial Reverb plugin engine (`Algorithm.h`), through `rooms.cpp`, `survey.cpp` and `probe.cpp`.
2. Sound from Code (`make.py`, numpy, ffmpeg for the m4a and the loudness measurement).
3. Drawn SVG (`make.py picture`, PNG by headless Chrome).

The engine has to be named as hand because the bench refuses a project's instrument by name.
