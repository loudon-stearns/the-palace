# Haptic Handwheel — bench tests (before anything else is bought)

The feel lab guessed four numbers about the GM5208-12. Every feel's stability
and every feel's sound hangs on them. These tests replace the guesses. They
need the motor, its encoder, a driver board, a 12 V supply, a multimeter, and
one disc of known mass (the light 40 g, 80 mm printed cap will do).

Nothing here has been run on a motor. The analyzer is checked only against a
pretend motor: `python3 bench/bench_analyze.py --selftest --plot selftest.png`
recovers its weight, strength, drag and brake within 5 %, its bumps and
friction within 1 %, and its winding inductance within 8 % (1 % across a
sweep of other inductances). See `bench/selftest.txt` and `bench/selftest.png`.

**The sketch compiles** (2026-10-13), with no warnings from our files, for the
Arduino Nano ESP32 (an ESP32-S3; the core already on this laptop) against
SimpleFOC **2.3.3**. SimpleFOC 2.3.4 and 2.4.0 refuse to build on that core:
they need arduino-esp32 3.x. So either pin SimpleFOC to 2.3.3, or update the
ESP32 core to 3.x first. Not yet compiled for the classic ESP32-DevKitC in the
parts order (its core isn't installed), and never run on a board. The pins are
still guesses.

| Test | What you do | What it pins | Why it matters |
|---|---|---|---|
| meter | ohms across each pair of motor leads | R per phase (half the reading) | turns torque into volts |
| `bench coast` | nothing — it spins up and lets go twice | bearing drag, dry friction, **the motor's own brake** | the brake decides how stiff a feel can cross a cable, and how long the struck spring rings |
| `bench accel-bare`, then fit the disc, `bench accel-disc` | swap the cap on between runs | rotor inertia, torque per amp | the feel lab's weight and strength |
| `bench cog` | hands off, ~100 s (one turn forward, one back) | cogging and friction around one turn; writes `handwheel/cog_map.h` so the firmware cancels the bumps | whether frets made in software are louder than the motor's own bumps |
| `bench chirp` + a contact mic | disc on, piezo taped to its rim, record it into your interface (start recording first; the analyzer finds the sweep by itself) | how much push survives 10 → 400 Hz, and the winding's inductance | the only real test of "can I feel a G" — the encoder only counts up to about 90 Hz |

Capture the serial lines to a file (the Arduino serial monitor, or `cat
/dev/cu.usbserial-* > capture.csv`), then:

    python3 bench/bench_analyze.py capture.csv --R <ohms per phase> --disc-mass 0.040 --disc-radius 0.040

For the chirp, add the recording: `--mic chirp_mic.wav --plot bench.png`.

## Two decisions this bench settles, with the rule written down first

**Do software frets beat the motor's own bumps?** This motor has 12 slots and
14 magnets, so it should bump 84 times a turn. Frets at the default 0.03 N·m
should be at least 3× the raw bumps, and cancelling should leave them 20× or
more. If not, raise the fret strength or move to a smoother motor. (The pretend
motor gives 3.6× raw and 45× cancelled.) If the map looks smeared, the hold
spring (40 V/rad in `bench cog`) is too soft for this motor's bumps: double it.

**One motor, or does a small vibration motor join it?** The model says the
GM5208 moves the rim about 10 µm per volt at G3 (196 Hz), 60× what a fingertip
can detect. The rule: if the contact-mic curve shows 10× the threshold at 196 Hz
for **1 V of sine or less**, one motor carries the pitch and no second actuator
is bought. If it takes more than 1 V, the pitch would eat into the push the
other feels need, and a voice-coil or LRA joins the cap. The model can't
include a gripping hand, which loads the cap; the recording is taken hands-off,
so repeat the 196 Hz point with a finger resting on the rim before deciding.

**Do frets land in tune?** (added 2026-10-14, from `proofs/feel-lab/render_feel_map.mjs`)
With friction, a fret's pull is too weak to move the knob off the ridge between
two notes: in the model about one let-go in twenty stays balanced there, up to
50 cents off. The firmware now adds a small push off the ridge (`set kick`,
default 0.006 N·m, a little above the pretend motor's 0.004 N·m friction). The
model then lands every let-go within 2.4 cents. On the bench: run `feel frets`,
let go near the ridge between two notes twenty times, and read the angle from the
`a` lines. If any let-go stays put, raise `kick` to just above the friction that
`bench coast` measured.
