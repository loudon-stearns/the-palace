# What the Max host patch will need

Max work is paused until there are Max patching standards (Loudon, 2026-10-16).
`handwheel-host.maxpat` was written from memory of Max's file format and has
never been opened; it stays as it is. This note is what the patch should do,
taken from what the box-day console (`firmware/box-day.html`) already does over
the same wire, so the patch is quick to build once the standards exist. The
console is the working reference: anything below can be tried there first.

## The wire

USB serial, 921600 baud, one text line per message (`handwheel.ino` header).

Max → knob: `feel <name>` · `set <param> <value>` · `play <N·m>` ·
`bench <test>` · `hello`.
Knob → Max: `a <angle rad> <speed rad/s> <torque N·m>` every 2 ms;
`f <name> brake <0|1>` on each feel change; `hello handwheel <board>` and
`ready` on start and on `hello`; `b,…` lines only during a bench test.

## What the patch should do, in the console's order

1. **Find the port and say hello.** Open the port, send `hello`, wait for
   `ready` before sending anything else. A Nano ESP32 doesn't reset when the
   port opens, so it never greets unasked.
2. **One button per feel:** centre, frets, string, struck, pendulum, follow,
   turntable, free. The knob is the source of truth for which feel is on: light
   the button from the `f` line, not from the click.
3. **Show the brake** from the `f` line: `1` cancelled (moves freely), `0` on
   (calm).
4. **Settings per feel.** A menu of the selected feel's settings plus the
   common three, and a number box; sends `set <param> <value>`. A `set`
   changes only the selected feel, so the menu must refill on each `f` line.
   Lists (from the console's `PARAMS`):
   - centre: k, kick, kickW, rest
   - frets: peak, kick, semisPerTurn
   - string: k3
   - struck, pendulum: k, damp, rest
   - follow: k, damp (and `target`, which the melody sends; see 7)
   - turntable: rpm, kv, speedTf, cap, ki, gate, trim, ffB, ffC
   - every feel: cancelBrake, tauMax, cogGain
5. **Readings from the `a` line:** angle (rad and degrees), torque, and speed
   read as **angle travelled over the last half second**, with the wobble
   beside it. One `a` line catches the motor's bumps at a random point of their
   47 Hz wobble: single readings ran 28–38 rpm while the turntable averaged
   33.3 (`proofs/feel-lab/render_turntable_bumps.mjs`). Unwrap the angle; it
   is not wrapped to one turn.
6. **Play into the hand:** a slider and a signal input for `play <N·m>`.
   The console's slider runs ±0.05; the knob clamps the feel and the played
   torque together at `tauMax` (0.2). This is the torque jack: an LFO, the
   note, beat clicks. Throttle it to about one line every 2 ms. The knob reads
   one line per loop, and how fast a stream of `play` lines can go is untested.
7. **The melody for the haptic filter:** each note sends `set target <rad>`
   with the follow feel selected, where rad = semitones ÷ semisPerTurn × 2π.
8. **Pitch out:** angle → MIDI note = 45 + angle ÷ 2π × semisPerTurn, for the
   synth that the frets, string and follow feels play.
9. **Stop:** `feel free` then `play 0`, on a big button and on closing the
   patch.
10. **Bench is not the patch's job.** `run_bench.py` owns the port while it
    runs; the patch must close the port first.

## Later, once feels are judged

The context knob (Ableton's selected parameter via Max for Live) needs only
items 1–5 plus a stepped-values feel. It is the plan's move after the touch
tests, and it is Max work, so it waits for the same standards.
