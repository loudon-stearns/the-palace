# The two checks, for GoButton's ltc.js

A patch drafted in SMPTE LTC's workshop on 2026-11-17, on Loudon's yes of 2026-11-08 ("draft in the
workshop, a GoButton session lands it"). Nothing in `GoButton Local` was touched. Workshop, not an entry.

## Why

GoButton's reader trusts every sync word it finds. Through +12 dB of EQ at 2 kHz it read 119 frames
and every one was wrong; across the hostile gauntlet's files and sweeps it read 300 wrong frames
(`../hostile/README.md`). In a show rig a wrong time is a desk that jumps the show; no time is a desk
that waits. LTC has no checksum, but a reader can check two things for nothing: every frame's 0s are
even (the polarity bit), and every frame is the one after the frame before.

## What changes

`ltc.js` here is GoButton's `v2/device/ltc.js` (sha256 `40efd97c…`, last changed in GoButton's `b169078`,
2026-10-06, copied as `ltc.original.js`) with the checks added. `ltc.js.diff` is the whole change.

- Every frame `decodeSample` returns now also carries `even`, `follows`, `sure` (both) and `run`, how
  many sure frames in a row up to this one. The decoder keeps two more numbers of state: `prev`, the
  last even frame, and `run`.
- Nothing it already returned changes: the same frames, at the same samples, with the same times. So
  the decoder codebox still matches it, and every existing check still passes.
- `decode(d, samples, trust)` takes an optional trust level: only frames with at least that run.
- "Follows" is asked at all three counts (24, 25, 30), not the measured rate's: a tape at half speed
  measures 12.5 frames a second and still counts 25.

## What the gauntlet says

`../hostile/sure-reader.mjs` is GoButton's reader with these checks and nothing else.

| reader | wrong frames, files | wrong frames, sweeps | files passed |
|---|---|---|---|
| GoButton's, as it is | 125 | 175 | 22 of 26 |
| with the checks, run 1 | 4 | 0 | 22 of 26 |
| with the checks, run 2 | 0 | 0 | 0 of 26 * |
| the careful reader (checks + hysteresis + gap rule) | 0 | 0 | 22 of 26 |

\* Run 2 reads every file with no wrong frame, and misses one more frame at each lock than the
gauntlet's slack of three allows; the slack was set for one confirming frame and is left as it is.

The 4 are all in the EQ file: of 119 frames misread there, 4 had even 0s and happened to follow the
one before. Two checks are not proof. Run 2 stops all of them, for one more frame (33 ms at 30 fps) at
lock and after every jump or dropout. Which one the device acts on is the device's choice, which is
why `ltc.js` reports `run` and does not decide.

## The checks

`v2-ltc-checks-tests.js` is eleven checks in GoButton's own shape (`run(check, section, known)`), to sit
in `tests/` and be added to the list near the end of `tests/run-v2-tests.js`, after `v2-ltc-tests.js`.
`node run-checks.js` runs them here against the patched copy: all 11 pass.

In a scratch copy of GoButton (tests, v2, tools and Previous V2 Files) with the patch and the new
file in: 1956 of 1968 V2 checks pass. The 12 that fail are the colour checks, and they fail the same
way without the patch: GoButton's working tree has an uncommitted `show-colors.csv`.

## To land it (a GoButton session)

1. Copy `ltc.js` over `v2/device/ltc.js` (or apply `ltc.js.diff`), and `v2-ltc-checks-tests.js` into
   `tests/`; add it to the list in `run-v2-tests.js`. Run the suite.
2. Decide where a frame must be sure before it acts. Today the device reads time from the codebox,
   not from `ltc.js`, so the patch protects nothing on stage until step 3.
3. The codebox (`v2/timecode/ltc-decoder.genexpr`) waits for the Max pause. What it will need, kept
   here so the build is quick: a count of 0 bits over the 80 (or a running parity flipped as each bit
   shifts in and out), three History values for the last even frame's packed time (`packTime`) and
   its drop flag, a History for `run`, and at each frame: `follows` is `packTime(prev + 1)` at counts
   24, 25 and 30 equal to the frame's packed time; `run` = `sure ? run + 1 : 0`. One new outlet for
   `run`, so the patch can gate on it.
4. Then refresh SMPTE LTC's teaching room: its `SMPTE LTC — rich — checks.mjs` compares GoButton's
   `ltc.js` with the room's pinned copy, and goes red by design when GoButton's changes. Copy the whole
   file again under the room's header and update `PINNED`. The room has no decoder in it, so nothing
   it shows changes.

Not checked: any hardware reader, any real desk, Max.
