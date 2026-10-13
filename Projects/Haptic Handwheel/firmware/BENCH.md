# Haptic Handwheel — bench tests (before anything else is bought)

The feel lab guessed four numbers about the GM5208-12. Every feel's stability
and every feel's sound hangs on them. These tests replace the guesses. They
need the motor, its encoder, a driver board, a 12 V supply, a multimeter, and
one disc of known mass (the light 40 g, 80 mm printed cap will do).

Nothing here has been run. The firmware is unverified; the analyzer is checked
only against a pretend motor (`python3 bench/bench_analyze.py --selftest`
recovers its numbers within 5 %).

| Test | What you do | What it pins | Why it matters |
|---|---|---|---|
| meter | ohms across each pair of motor leads | R per phase (half the reading) | turns torque into volts |
| `bench coast` | nothing — it spins up and lets go twice | bearing drag, dry friction, **the motor's own brake** | the brake decides how stiff a feel can cross a cable, and how long the struck spring rings |
| `bench accel-bare`, then fit the disc, `bench accel-disc` | swap the cap on between runs | rotor inertia, torque per amp | the feel lab's weight and strength |
| `bench cog` | hands off, ~40 s | cogging and friction around one turn | whether frets made in software are louder than the motor's own bumps |
| `bench chirp` + a contact mic | tape a piezo to the cap, record it into your interface | how much torque survives 10 → 400 Hz | the only real test of "can I feel a G" — the encoder is too coarse to see a 2 µm wobble |

Capture the serial lines to a file (the Arduino serial monitor, or `cat
/dev/cu.usbserial-* > capture.csv`), then:

    python3 bench/bench_analyze.py capture.csv --R <ohms per phase> --disc-mass 0.040 --disc-radius 0.040
