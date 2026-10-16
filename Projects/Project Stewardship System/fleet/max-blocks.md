# Max blocks — the first three agendas

*Workshop draft, 2026-10-16. Drawn from reading 1 (`reading.json`) and the stewards' own left-rough notes.*

Seventeen Max patches and devices sit across eight projects. The stewards wrote all of them from memory of Max's file format, and nobody has opened any of them. Almost every one of those stewards ends its cycle saying so. A block is how we pay that down together: open the patch, fix it while it's open, play it, decide.

## How a block runs (about 90 minutes)

- **Before.** I refresh the fleet reading, update this agenda, and pick four items or fewer. Each item comes with its file path and the gaps its steward said it couldn't check.
- **During.** You open each file in Max and tell me what Max says; paste the console when it complains. I fix the patch file from the terminal and you reload it. Each item has four rungs, and stopping on any one of them is a fine result:
  1. It **loads.**
  2. It **compiles** (rnbo~ builds it).
  3. It **makes sound.**
  4. **Your verdict:** keep, or redirect, in a sentence.
- **After.** I post your verdict to each steward's board as your answer, so its next cycle builds on what you heard. I write each failure as a Gotcha on [[RNBO codebox~ smith]], so the next hand-written patch loads first time. The next fleet reading counts the item as paid.

## Block 1 — does it load

RNBO patches written by hand. Smallest first, because each fix teaches the next one.

1. **Blood Compressor** (sprout) — `Projects/Blood Compressor/rnbo/blood-compressor-test.maxpat`, then `Blood Compressor 0.2.amxd` in Live. The steward couldn't check:
   - whether the device finds `blood-vessel.js` sitting next to it (freezing the device should settle that)
   - whether v8ui takes the file as written
   - whether rnbo~ compiles the two-input chain
2. **Bayesian Granular Synthesizer** (sprout) — `Projects/Bayesian Granular Synthesizer/RNBO/belief-cloud.maxpat`. Gaps:
   - whether `[unpack]` exists under that name inside rnbo~
   - whether a multislider list reaches `[inport paint]` as `paint k v`
3. **Action Potential Oscillator** (growing) — `Projects/Action Potential Oscillator/rnbo/neuropulse-crowd.maxpat`. The box layout was copied from RNBO 1.4 help patches, and the codebox may use syntax RNBO rejects: a top-level `const`, the ternary. This is the patch on the road to the Eventide H90.
4. **2D Torus Wavetable Synthesizer** (fruiting) — `Projects/2D Torus Wavetable Synthesizer/RNBO/torus-ab.maxpat`. Its rnbo~ insides, its codebox~, the combine that builds file paths and 2d.wave~'s `@rows` were all typed from memory. The steward has said "nothing here has been opened in Max" in 7 notes running.

## Block 2 — play the instruments

These are further along and ready to be heard, not just loaded.

1. **Crystal Synthesizer** (fruiting), in `Projects/Crystal Synthesizer/`, five files:
   - `crystal-rings/crystal-rings.maxpat` and `Crystal Synthesizer Rings 0.1.amxd`
   - `crystal-on-the-road/crystal-poly.maxpat` and `Crystal Synthesizer 0.1.amxd`
   - `crystal-on-the-road/faust/crystal-faust-rnbo.maxpat`

   Also `playable-crystal/crystal-bank.maxpat`. Gap: the steward modelled RNBO's voice allocation in Node, and RNBO may pick voices in a different order.
2. **Neural Granular Synthesis** (growing) — the fixed codebox, never compiled. Turning the crowd knob at 512 neurons may click: the steward counted about 262,000 comparisons in the one sample where it moves.

## Block 3 — the long build

**Retrospective Delay** (growing), nine files across five stages in `Projects/Retrospective Delay/`:
- witness A and B (`stage-1/witness/`)
- séance (`stage-2-seance/`)
- grammar (`stage-3-grammar/`)
- character, the face (`stage-4-character/face/`)
- portal (`stage-5-portal/`)

Take the stages in order. Gap: a 384,000-slot array is bigger than any RNBO array the palace has built, and may not compile.

## Not yet

- **Haptic Handwheel** — `max/handwheel-host.maxpat` waits on the bench. The brake, friction and bumps are guesses until the motor is measured.
- **BLUELINE** — two devices from June (`Blueline ClipScan 1.0.amxd`, `Blueline Transport 1.0.amxd`). No steward tends this project, so these are yours to place.
