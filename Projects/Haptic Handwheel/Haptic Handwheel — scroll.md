---
title: "Haptic Handwheel — scroll"
born: 2026-10-06
links:
  - target: "[[Haptic Handwheel]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Haptic Handwheel's scroll — the one page that always opens on where the project stands now and the plan it is following, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my plan changes only when Loudon agrees, and every change is logged on my trail; my standing orders are Loudon's; my trail only ever grows."
---

# Haptic Handwheel — scroll

> The project's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Haptic Handwheel]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-13T22:40:59.666Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** seed · **Steward:** cycle 3 · last ran 2026-10-13 (today)
- **Plan:** none agreed yet — the work leans on the forward vector · **a proposed revision is waiting on you**
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-13 (today) — A parts order you could place today, about $145–185, plus a first Max patch that speaks the knob's language. Nothing bought yet. (`haptic-handwheel-steward-007`)
- **Last commit touching this project:** 2026-10-13 `e7287cbf` — steward(Haptic Handwheel): cycle 2 — SPINNING UP. HOME: [[Haptic Handwheel]]. Neighborhood loaded. Cycle 2: …
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Haptic Handwheel is your idea for one big knob that is a motor and a sensor at once, played as an instrument. Software decides how it feels: frets, a string, a struck spring, a turntable. It's research reaching toward a product, and the nearer product is a simpler knob that knows which parameter it's controlling. So far it exists only in simulation. Earlier cycles built a feel lab in the browser, found that the motor brakes itself (which lets stiff feels survive the trip over USB), and wrote firmware and bench tests that compile on the laptop but have never run on a board. This cycle turned all of that into a parts order you could place, and a Max patch for when the knob arrives. Ordering s…

### Open asks

- `haptic-handwheel-steward-003` — proposed plan revision: a first plan, from simulation to your hand · posted 2026-10-13 · options: adopt · context-first · keep

### Answered, not yet consumed

_None._

### Decided

_Nothing decided on the board yet._

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="haptic-handwheel-steward-007" -->
### 2026-10-13 — cycle 3 — A parts order you could place today, about $145–185, plus a first Max patch that speaks the knob's language. Nothing bought yet.
> shipped · order drafted, waiting on the plan · steward leans a 24 V supply

**The order.** The motor stays the same: the iFlight GM5208-12 with its encoder, $61.99 and in stock, read on the shop page today. Two parts change from the brief. The driver becomes the SimpleFOC Mini v1, about $9, and I'd buy two so the first wiring mistake costs nothing. It sets volts and doesn't measure current, which is exactly the condition that gives us the motor's own brake. That makes the brief's pricier Shield, with its current sensing, the wrong fit as well as the dearer one. The controller becomes a classic ESP32 dev board, about $10, because the firmware is already written for its pins. The rest: a 0–30 V bench supply with a current knob, a piezo contact mic (the only real test of whether you can feel a G), a $1 capacitor so the motor can't push current back into the supply when your hand spins it, printed caps, and a block to clamp it to. That comes to about $145–185, or $75–95 if you already own a bench supply. The brief guessed $170–230. I left out the load cell, touch sensing, a second vibration motor and the lever, and the sheet says why for each.

**Why the volts matter.** The firmware asks the driver for volts. Part of that pushes on your hand. The rest cancels the motor's brake, and that part grows with speed. At 12 V, on the weakest motor the datasheet allows, the knob pushes exactly the brief's 0.08 N·m with nothing to spare. A struck spring flicked half a radian peaks at 177 rpm, past the 132 rpm that 12 V can hold while also pushing. At 24 V everything fits. So: bench tests at 12 V, then play at 24 V with the firmware's voltage cap held low. I made the supply voltage a named setting in the firmware so that switch is one line.

**The Max patch.** handwheel-host.maxpat opens the serial port, reads the knob's angle, speed and torque every 2 ms, and plays the angle as a pitch, 12 semitones per turn. It has a menu for the feels, number boxes for stiffness, damping, the brake dial, turntable speed and a torque ceiling, an LFO you can play into your hand, and buttons for the five bench tests. A script builds it, so it can be regenerated, and a second script checked that every wire lands on a real inlet and outlet. It has never been opened in Max.

**Artifacts:**
- [The order: nine lines with links and prices, why each changed from the brief, what's left out, and what to do when it arrives.](Projects/Haptic Handwheel/order/PARTS.md)
- [Works out what 12, 16 and 24 V buy: push, current, and how fast the brake stays cancelled.](Projects/Haptic Handwheel/order/fit_check.mjs)
- [The numbers behind the voltage table.](Projects/Haptic Handwheel/order/fit_check.json)
- [The Max side of the knob: port, feel menu, parameters, an LFO into the hand, angle played as pitch, bench buttons. Never opened in Max.](Projects/Haptic Handwheel/max/handwheel-host.maxpat)
- [Builds the patch from code, so it can be fixed and rebuilt.](Projects/Haptic Handwheel/max/build_host_patch.mjs)
- [The board sketch, now with the supply voltage and voltage cap as named settings. Still never compiled for a board.](Projects/Haptic Handwheel/firmware/handwheel/handwheel.ino)

_What the supply buys, using the datasheet's ranges (worst motor … middle motor)_
| supply | hardest push N·m | brake stays cancelled up to | …while pushing 0.08 N·m | most current |
| --- | --- | --- | --- | --- |
| 12 V | 0.082 … 0.18 | 158 … 241 rpm | 132 rpm | 0.9 A |
| 16 V | 0.11 … 0.24 | 210 … 321 rpm | 212 rpm | 1.2 A |
| 24 V | 0.16 … 0.35 | 315 … 481 rpm | 373 rpm | 1.8 A |

_Left rough:_ The Max patch has never been opened in Max; I'm least sure that a toggle can start and stop snapshot~ and that the serial line parsing works as written. Only the motor's price was read on its shop page. The driver, ESP32 and contact mic prices come from search summaries, and the bench supply price is a guess. The motor's top bolt pattern isn't published, so the caps can't be printed until someone measures it. 24 V is above the motor's 9–15 V nominal rating, and my reasoning that the firmware's voltage cap makes that safe hasn't been checked with the maker. The bench analyzer still can't read the cogging map or the contact-mic sweep.

_Next moves named:_ If you adopt the plan, the order sheet is the parts list to buy from; if you'd rather start with the context knob, the same parts serve it. · Teach bench_analyze.py the cogging map and the contact-mic sweep, so the first bench session turns straight into numbers. · Add the brake dial to the browser feel lab, so you can feel the trade between ringing and calm with a mouse before you feel it by hand.
<sub>`haptic-handwheel-steward-007` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="haptic-handwheel-steward-005" -->
### 2026-10-13 — cycle 2 — The motor turns out to brake itself, which lets stiff feels survive a cable. I also wrote the firmware's feel core and the bench tests that will measure the real motor.
> shipped · nothing bought, board sketch uncompiled · steward leans parts list next

**The motor brakes itself.** Last cycle's limit rested on a guess: that the motor and its bearings barely slow the knob down. The iFlight datasheet says otherwise. It gives 15.2 Ω across two leads, about 480 rpm with no load at 20 V, and 0.18–0.25 N·m at 1 A. When a driver like SimpleFOC sets the motor's voltage and doesn't measure current, a spinning motor generates a voltage of its own, and that voltage drives a current through the winding that pushes back against the spin. That push is a damper: real, physical and instant, with no loop and no delay in it. From the datasheet it comes out somewhere between 0.002 and 0.023 N·m·s/rad, which is 20 to 230 times what I had assumed.

**What that changes.** I re-ran the stability sweep with this brake included. Over USB to Max, the stiffest feel that stays calm goes from 0.022 to between 0.5 and 1.7 N·m/rad. That's enough for frets and a full string bend to run in Max and stay calm with no hand on the knob. The simulation agrees with the textbook rule within 8% in every case. The guess from 2026-10-05 still holds: springs, frets and walls are safest on the device. But there's now a real choice instead of a wall.

**What it costs.** The same brake kills anything that should keep moving on its own. A struck spring on the light cap rings for about eight wobbles with the brake cancelled. With the brake left on, it gets under half a wobble at the gentlest end of the range, and it doesn't wobble at all at the middle. The turntable would fight it too. So the firmware treats the brake as a dial each feel sets for itself, `cancelBrake` from 0 to 1. Stiff feels leave the brake on. The struck spring, the pendulum and the turntable cancel it, and they have to be computed on the knob. In the WAV, listen for the same flick three times: brake cancelled, then the gentlest brake, then the middle one.

**The firmware.** `feel_core.h` is plain C++ with no Arduino in it. It holds every feel that responds to the hand (frets, the string, the struck spring and pendulum, the melody-follower, the turntable, end stops), plus local damping, the brake dial and an input for torque played in from Max. It compiles on this laptop with no warnings. A test drives it and the browser feel lab's engine with the same 2,800 inputs, and they agree to within a millionth of a N·m, so the lab and the firmware describe one knob. `handwheel.ino` wraps it for an ESP32 with SimpleFOC and the AS5048A encoder. It speaks a one-line text protocol Max can send with [serial]: `feel frets`, `set k 0.2`, `play 0.01`. The knob reports its angle every 2 ms.

**The bench tests.** The firmware also has five tests that replace the four guesses: a spin-down done twice (driver off, then driver on at 0 V; the difference between the two is the brake), a push from rest with and without a disc of known weight (inertia and strength), a cogging map, and a frequency sweep. For the sweep, a contact mic on the cap recorded into your interface is the real test of whether you can feel a G. At 196 Hz the cap moves about 2 µm, which is too small for the encoder to see. `bench_analyze.py` turns a capture into numbers. I checked it on a made-up motor with known values, and it recovers them within 5%.

**Artifacts:**
- [One flick of the struck spring, three times: brake cancelled (rings), gentlest brake, middle brake (no wobble).](Projects/Haptic Handwheel/proofs/motor-numbers/motor_brake.wav)
- [The datasheet turned into ranges, and the stability sweep re-run with the brake.](Projects/Haptic Handwheel/proofs/motor-numbers/motor_numbers.mjs)
- [The numbers behind the table and the ring times.](Projects/Haptic Handwheel/proofs/motor-numbers/motor_numbers.json)
- [The feels in plain C++: compiles here, matches the feel lab, has the brake dial.](Projects/Haptic Handwheel/firmware/handwheel/feel_core.h)
- [ESP32 + SimpleFOC sketch with the Max protocol and five bench tests. Never compiled.](Projects/Haptic Handwheel/firmware/handwheel/handwheel.ino)
- [Drives the C++ core over 2,800 inputs.](Projects/Haptic Handwheel/firmware/host-test/test_core.cpp)
- [Checks the C++ core against the browser feel engine.](Projects/Haptic Handwheel/firmware/host-test/compare.mjs)
- [Turns a bench capture into the motor's numbers; --selftest recovers a made-up motor within 5%.](Projects/Haptic Handwheel/firmware/bench/bench_analyze.py)
- [One page: what each bench test needs, what it measures, and why it matters.](Projects/Haptic Handwheel/firmware/BENCH.md)

_How stiff a feel can be before it buzzes, hands off, light cap (N·m/rad). Frets need ~0.72, a full string bend ~0.79_
| where the feel is computed | brake cancelled (old guess) | brake on, gentlest | brake on, middle |
| --- | --- | --- | --- |
| on the knob, 1 kHz loop | 0.20 | 4.5 | 14.6 |
| USB to Max, ~4 ms | 0.022 | 0.51 | 1.7 |
| audio line, ~5.3 ms | 0.019 | 0.43 | 1.4 |

_Left rough:_ The board sketch was never compiled: no Arduino or SimpleFOC on this machine, and the pins are guesses. The brake's range is ten times wide because the datasheet leaves out KV and inductance. Only a meter and the spin-down test will narrow it. The rotor inertia is still estimated from the motor's shape. The analyzer can't read the cogging map or the frequency sweep yet, and its self-test used a motor I made up.

_Next moves named:_ Write the final parts list with real prices (motor, ESP32, driver that suits voltage mode, piezo contact mic, printed caps), the last step before the parts-order move in the proposed plan · Teach bench_analyze.py the cogging map and the contact-mic frequency sweep · Add the brake dial to the browser feel lab, so the ring-versus-calm trade can be felt by mouse before it's felt by hand
<sub>`haptic-handwheel-steward-005` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="haptic-handwheel-steward-002" -->
### 2026-10-13 — cycle 1 — A feel lab for the knob that doesn't exist yet: all seven feels playable in the browser, five rendered to audio, plus a stability sweep showing which feels can cross a cable.
> shipped · simulated, nothing bought · steward leans pin the motor's unknowns next

**What I built.** feel_engine.js is a small physics model of the knob: a cap with weight, a motor that senses and pushes on a loop of a chosen speed and delay, a 14-bit encoder, the motor's own friction, and a hand that can grip, turn or rest a finger as a brake. The seven feels are short functions in it: frets, the stiffening string, the LFO felt, the pitch itself, the lock, haptic filtering, the struck spring (with a pendulum variant) and the turntable. The browser page and the offline renders both load this one file, so they can't drift apart. In the page, dragging the knob grips it, shift-drag brakes it, and an amber trace shows the torque your hand would feel, since the screen can't push back. You can switch the feel onto a slow wire and watch a fret start to buzz the moment you let go.

**What the sweep says.** I released a virtual spring and looked for the stiffest one that didn't grow on its own, for four places the feel could be computed. The simulation matches the textbook rule within 10% in every case. The rule: delay acts like negative damping, so the stiffest stable spring is the real damping divided by the delay. Three findings. (1) The page's guess holds, and it holds more sharply than it said. Over USB to Max, the stiffest feel that stays calm with no hand on the knob is 0.022 N·m/rad, which is softer than a pitch-wheel return spring. Frets, the string and walls belong on the device. The LFO, the pitch and the beat clicks are fine anywhere, because they don't depend on where the hand is. (2) The hand is part of the stability. Gripping adds its own damping, and that roughly 30× margin is what keeps most feels calm over a slow wire. So 'only while held' is a real category. (3) Weight doesn't buy stability. In this model the light and the 150 g caps have the same limit, because the limit is damping against delay, not mass. That pushes against the brief's 'heavy helps stability'. A way out appears: if the device adds a little damping of its own, locally and fast, stiffness up to about 0.47 N·m/rad can cross USB. So a split design, with the springs in Max and the damping in the knob, looks possible.

**Smaller findings.** Feeling a pitch: on the light cap, 0.005 N·m at 196 Hz moves the rim about 2.1 µm, against about 0.1 µm a fingertip can detect near that pitch. The simulation and the hand calculation agree (2.135 against 2.127 µm). So the physics allows it. Whether this motor and driver can push cleanly at 196 Hz is still unknown. The struck spring holds 5.9 Hz all the way down. The pendulum starts at 4.9 Hz and quickens to 5.8 as it settles, so the difference your page predicted is audible. The turntable idles 10% slow, because a speed servo with no integral term droops under the motor's own friction. Here the I term your sketch said has no acoustic counterpart turns out to have one: a turntable's speed control. In the lock, the beat click crawls around the LFO's wobble (0, 0.50, 0.99, 0.48 …), then lands at the same point every beat once the rate reaches the tempo.

**Artifacts:**
- [the feel lab: drag to grip, shift-drag to brake, pick a feel and a wire, start sound. Note boxes on every section.](Projects/Haptic Handwheel/proofs/feel-lab/feel-lab.html)
- [the stability sweep: the stiffest calm spring for each place the feel could run, against what each feel needs.](Projects/Haptic Handwheel/proofs/feel-lab/stability.png)
- [struck spring: pulled, let go, it wobbles into pitch at one rate. A finger lands at 2.2 s.](Projects/Haptic Handwheel/proofs/feel-lab/struck_spring.wav)
- [struck pendulum: the same strike, slow at first and quickening as it settles (4.9 → 5.8 Hz).](Projects/Haptic Handwheel/proofs/feel-lab/struck_pendulum.wav)
- [haptic filtering: the knob plays a melody alone, then with a finger braking it (slower glides), then gripped with vibrato.](Projects/Haptic Handwheel/proofs/feel-lab/follow_melody.wav)
- [turntable: spinning, a light brake, a hard brake, a push forward, let go.](Projects/Haptic Handwheel/proofs/feel-lab/turntable.wav)
- [the lock: the hand eases an LFO's rate down to the beat. The tremolo crawls against the clicks, then locks.](Projects/Haptic Handwheel/proofs/feel-lab/lock.wav)
- [the shared physics: knob, motor loop, encoder, friction, hand, and the feels.](Projects/Haptic Handwheel/proofs/feel-lab/feel_engine.js)
- [runs the sweep, the felt-pitch check and the five renders from the engine.](Projects/Haptic Handwheel/proofs/feel-lab/render_feel_lab.mjs)
- [inlines the engine and the sweep results into the page.](Projects/Haptic Handwheel/proofs/feel-lab/build_feel_lab.mjs)
- [the page before inlining.](Projects/Haptic Handwheel/proofs/feel-lab/feel_lab_template.html)
- [every number above: the sweep, the verdicts, felt pitch, struck-spring rates, turntable speeds, click phases.](Projects/Haptic Handwheel/proofs/feel-lab/feel_lab_results.json)
- [the sweep chart as vector.](Projects/Haptic Handwheel/proofs/feel-lab/stability.svg)

_Where can each feel be computed? Light 40 g cap, simulated. 'only while held' = the hand's damping keeps it stable_
| feel (stiffness, N·m/rad) | device, 10 kHz | device, 1 kHz | USB to Max, ~4 ms | audio line, ~5.3 ms |
| --- | --- | --- | --- | --- |
| soft centring spring (0.03) | fine | fine | only while held | only while held |
| struck spring (0.085) | fine | fine | only while held | only while held |
| haptic filtering (0.25) | fine | only while held | only while held | only while held |
| frets, 24 per turn (0.72) | fine | only while held | only while held | buzzes |
| string, full bend (0.79) | fine | only while held | buzzes | buzzes |
| end stop / wall (3) | only while held | only while held | buzzes | buzzes |
| LFO, a pitch, beat clicks (0) | fine | fine | fine | fine |

_Left rough:_ Every result rests on numbers I had to assume: the rotor's inertia, the motor's own friction and damping, the grip of a fingertip, and the USB and audio delays. The rule holds whatever they turn out to be, but the boundaries in the table will move once a bench measures them. Nobody has heard the renders. I only drove the page in headless Chrome: it draws and its scripts parse, but dragging and the live sound path are untested. And whether this motor can push at 196 Hz isn't something a simulation can settle.

_Next moves named:_ Pin the motor's unknowns before anything is bought: rotor inertia, cogging and friction, and winding inductance (which decides whether it can carry a pitch). Find them in datasheets and forum measurements, or name the bench test that would settle each. · Sketch the firmware shape the sweep argues for: stiff feels and local damping on the device, plus a torque input line for what's played into the hand. A SimpleFOC sketch that compiles, marked unverified on hardware. · Model the split design properly (springs computed in Max, damping on the device), including the encoder noise that limits how much damping the device can add.
<sub>`haptic-handwheel-steward-002` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

_Nothing made yet — the first shipped thing will open the trail._
<!-- scroll:making:end -->
