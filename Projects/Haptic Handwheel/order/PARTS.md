# Haptic Handwheel — first parts order (a draft, nothing bought)

Everything needed to put the bench tests and the first feels in a hand. It
replaces the starter brief's list where the simulation argued with it. Prices
were read on 2026-10-13; the ones marked *search* came from search summaries,
not the shop page. Nothing here has been ordered, and the order waits on your
yes.

## The order

| # | Part | Pick | Price | Why this one |
|---|---|---|---|---|
| 1 | Motor + encoder | [iFlight GM5208-12 with AS5048A](https://shop.iflight.com/ipower-motor-gm5208-12-brushless-gimbal-motor-with-as5048a-encoder-pro248) | $61.99, in stock (read on page) | Unchanged from the brief. 15.2 Ω across two leads, 456–504 rpm no-load at 20 V, 209 g, Ø63 mm, hollow shaft 15 mm outside / 12 mm inside. |
| 2 | Driver ×2 | [SimpleFOC Mini v1 (DRV8313)](https://www.tindie.com/products/adz1122/simplefocminiv10-bldc-driver-drv8313-module/) | ~$8.80 each, *search* | **Changed from the brief's SimpleFOCShield.** The motor's own brake only exists when the driver sets volts and doesn't measure current. The Mini v1 does exactly that, costs a third as much, and the second one is a spare for the first wiring mistake. 8–35 V, about 2.5 A. |
| 3 | Controller | [ESP32-DevKitC-32E](https://www.digikey.com/en/products/detail/espressif-systems/ESP32-DEVKITC-32E/12091810) | ~$10, *search* | **Changed from the brief's STM32 Nucleo.** The firmware is already written for a classic ESP32 and its pins. The ESP32-S3-DevKitC-1 ($15, *search*) would also work, with a native USB port, but every pin in the sketch would move. |
| 4 | Bench supply | any 0–30 V / 0–5 A supply with a current knob (several on Amazon) | ~$40–70, *not read* | **The volts matter more than the brief said** — see below. Start every new firmware at 12 V with the current knob at 0.5 A. |
| 5 | Contact mic | a piezo pickup with a ¼″ jack | ~$9–15, *search* | Taped to the cap, into your interface. It is the only real test of whether you can feel a G: at 196 Hz the cap moves about 2 µm, which the encoder can't see. |
| 6 | Capacitor | 470 µF, 35 V electrolytic, across the driver's power input | ~$1 | When your hand spins the motor it becomes a generator and pushes current back. A bench supply can't swallow it; the capacitor can. |
| 7 | Caps (printed) | a light cap (~40 g, 80 mm) and a disc of known mass; later a 150 g cap with pockets for steel | a few dollars of filament | The light cap is what the simulation favours; the disc is what the inertia test needs. **Measure the motor's top bolt pattern before printing** — the shop page doesn't give it. |
| 8 | Mount + wiring | a hardwood or aluminium block clamped to the desk; dupont jumpers (the motor uses 2.5 mm dupont); a short encoder lead | ~$10 | The base must not move when the knob pushes back. Keep the encoder lead short and away from the motor wires; encoder noise is this motor's known weak spot. |
| 9 | Multimeter | the one you have | — | For the first bench test: ohms across each pair of motor leads. |

**About $145–185 with two drivers and the supply, or about $75–95 if you
already have a bench supply.** The brief guessed $170–230.

## Why 24 volts, not 12

The firmware asks the driver for volts. Part of that pushes on your hand; the
rest cancels the motor's own brake, and that part grows with speed. The
driver can put about the supply ÷ √3 on the motor. So the supply sets two
things at once: how hard the knob can push, and how fast it can spin before
a cancelled brake runs out of volts and the struck spring, the pendulum and
the turntable start to feel braked again. From
[`fit_check.mjs`](fit_check.mjs), with the datasheet's brackets:

| supply | hardest push, worst motor … middle | brake stays cancelled up to | …while also pushing 0.08 N·m | most current |
|---|---|---|---|---|
| 12 V | 0.082 … 0.18 N·m | 158 … 241 rpm | 132 rpm | 0.9 A |
| 16 V | 0.11 … 0.24 N·m | 210 … 321 rpm | 212 rpm | 1.2 A |
| 24 V | 0.16 … 0.35 N·m | 315 … 481 rpm | 373 rpm | 1.8 A |

What the feels ask for: a turntable at 33⅓ is 33 rpm, so any supply will do.
A struck spring flicked half a radian at 5.9 Hz peaks at 177 rpm, which is
past what 12 V can give while it is also pushing. On the worst motor, 12 V
gives exactly the brief's 0.08 N·m target and nothing to spare. So: do the
bench tests at 12 V, then move to 24 V with the firmware's `voltage_limit`
held down until the heat is known. 24 V is above the motor's 3–5S rating
(9–15 V nominal, though the shop page also quotes its speed at 20 V). The
firmware caps the volts it actually puts on the motor, so the supply's
number is headroom, not what the winding sees — but that is my reading, not
something checked against the maker. The 1.8 A worst case is a full push
held still, under the Mini's 2.5 A but over the 2 A it likes long term.

## What I left out, and why

- **The load cell and touch sensing** the brief's test order mentions. Nothing in
  the first feels needs them; the hand's grip shows up in the motor's own numbers.
- **A second, small vibration actuator** for feeling a pitch. Wait for the
  contact-mic test: if this motor can carry 196 Hz, it isn't needed.
- **The lever or bar.** It trades force for travel and asks for a stronger motor;
  that is a second build.

## In what order, once it arrives

1. Meter the leads. 2. Flash the firmware at 12 V, current knob at 0.5 A.
3. `bench coast`, then the two `accel` runs, `cog`, and `chirp` with the contact
mic (see [BENCH.md](../firmware/BENCH.md)). 4. Run `bench_analyze.py` and send
me the numbers; the feel lab gets re-tuned to the real motor. 5. Open
[`handwheel-host.maxpat`](../max/handwheel-host.maxpat) and play the feels.
