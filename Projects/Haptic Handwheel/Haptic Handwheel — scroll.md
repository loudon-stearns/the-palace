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

> _Regenerated 2026-10-14T00:00:49.285Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** seed · **Steward:** cycle 6 · last ran 2026-10-14 (today)
- **Plan:** agreed 2026-10-13 (today) · 5 made things since
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-14 (today) — A feel map: which feels want the motor's own brake, where each one can live, and a fix so frets can't stick between notes. (`haptic-handwheel-steward-012`)
- **Last commit touching this project:** 2026-10-13 `9e2ac59e` — steward(Haptic Handwheel): cycle 5 — SPINNING UP. HOME: [[Haptic Handwheel]]. Neighborhood loaded. Cycle 5. …
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Haptic Handwheel is your one-big-knob instrument: a motor that is also a sensor, with software deciding how it feels (frets, a string, a struck spring, a turntable). It's research, and the nearer product is a simpler knob that follows the parameter you've clicked in Ableton. The plan you agreed goes: try the knob in simulation, pin down the unknowns, buy the parts on your yes, bring it up on the bench, then your hands judge each feel. The first two are done on paper, and the parts list waits on you. This cycle used that wait. It worked out which feels want the motor's free brake and where each feel can be computed. It also found and fixed a way frets could land out of tune.

### Open asks

- `haptic-handwheel-steward-010` — the first parts order · posted 2026-10-13 · options: ORDER · ORDER-TRIMMED · CHANGE · WAIT

### Answered, not yet consumed

_None._

### Decided

- `haptic-handwheel-steward-003` — a first plan, from simulation to your hand → GRANTED — option_id=adopt (2026-10-13)

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
Where this is going: a first prototype in Loudon's hand, so the seven feels get judged by touch, and a record of which feels carry over from the instrument to the simpler context knob.

1. The knob in simulation. A feel lab and a stability sweep, so every feel can be tried by eye and ear, and so we know which feels must run on the knob and which can come down a cable. (Started 2026-10-13.)
2. Pin the unknowns before buying. Find or name a test for the motor's rotor inertia, friction and cogging, and winding inductance (can it carry a pitch?). Decide whether one motor does everything or a small vibration actuator joins it. Write a firmware sketch that compiles (SimpleFOC: on-device feels, local damping, a torque input line) and the message format to Max. Finish with a final parts list with prices.
3. The parts order. Loudon says yes to the list and the spend. Nothing is bought before this.
4. Bench bring-up. Encoder reads cleanly, a centring spring, frets, then measure the real stability edge and the motor's real numbers, and retune the simulation with them so it stops guessing.
5. The touch gate. Loudon plays each feel and keeps, changes or drops it. Only a hand can pass this move. What he says goes back into the page.
6. The context knob. Port the feels that carried to a knob that follows Ableton's selected parameter (through Max for Live): fine control, with stepped values felt as steps.
7. Write it back. Which feels carried from the instrument to the product, and what the body (cap, weight, keys, the vintage look) should be next.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="haptic-handwheel-steward-012" -->
### 2026-10-14 — cycle 6 — A feel map: which feels want the motor's own brake, where each one can live, and a fix so frets can't stick between notes.
> shipped · parts order still yours to answer · steward leans keep building toward the bench

**The brake decides where a feel can live.** Driven by voltage, this motor slows itself for free. The free brake is what lets a stiff feel be computed in Max, over a slow USB cable, without buzzing. It is also what kills a ring. So I went feel by feel. The frets, the string, the centring spring, the haptic filter and the context knob's stepped values (8 clicks a turn) all want the brake on, and with it on they can be computed in Max. Frets and the string need the brake to be at least the middle of my guesses for that. End stops still have to run on the knob itself. The struck spring wants the brake off: 3 wobbles before it dies with it off, 1 with it on. With the brake off it has to run on the knob. The turntable wants it off too: it idles at 88% speed with it off and 52% with it on. It is a speed loop, and it lives on the knob. The LFO, the pitch and the beat clicks don't care. That is good news for the product: nearly everything the context knob needs could be computed in Max.

**Frets could stick between notes. Fixed.** With friction, a fret's pull is weakest exactly on the ridge between two notes. Let go there and the knob just stays. In the model, about one let-go in twenty stuck, up to 50 cents off. The motor's 84 bumps a turn hardly matter for tuning. The ridge does. So the frets now give a small push off the ridge: nothing at each note, 0.006 N·m on the ridge, just above friction. Every let-go then lands within 2.4 cents. It's in the firmware (`set kick`). The firmware still compiles for the Nano ESP32, and the laptop test still matches the browser simulation. BENCH.md has the test to check it on the real motor.

**Hear it:** frets_landing.wav plays four passes of eight let-gos, with clicks marking passes 1 to 4: no bumps, raw bumps, bumps cancelled, then bumps cancelled with the push off the ridge. Each landed note plays beside its in-tune neighbour, so slow beating means a sour landing. struck_brakes.wav plays the same strike four times, from brake cancelled to the strongest guess. The feel lab now has brake and bumps switches and the feel map table.

**Artifacts:**
- [the feel lab, sketch 2: new brake and bumps switches, and the feel map table.](Projects/Haptic Handwheel/proofs/feel-lab/feel-lab.html)
- [how far off pitch frets land after a let-go, four ways, and the struck spring's wobbles at each brake.](Projects/Haptic Handwheel/proofs/feel-lab/feel_map.png)
- [four passes of eight let-gos, each landed note beside its in-tune neighbour. Beating means sour.](Projects/Haptic Handwheel/proofs/feel-lab/frets_landing.wav)
- [the same strike four times, from brake cancelled to the strongest guess.](Projects/Haptic Handwheel/proofs/feel-lab/struck_brakes.wav)
- [runs the brake sweep, the landing test, both sounds and the chart.](Projects/Haptic Handwheel/proofs/feel-lab/render_feel_map.mjs)
- [every number above.](Projects/Haptic Handwheel/proofs/feel-lab/feel_map_results.json)
- [the chart as vector.](Projects/Haptic Handwheel/proofs/feel-lab/feel_map.svg)
- [the shared physics, now with the motor's bumps, real sticking friction, the brake guesses and the push off the ridge.](Projects/Haptic Handwheel/proofs/feel-lab/feel_engine.js)
- [the page before inlining.](Projects/Haptic Handwheel/proofs/feel-lab/feel_lab_template.html)
- [now inlines the feel map too.](Projects/Haptic Handwheel/proofs/feel-lab/build_feel_lab.mjs)
- [frets gain the push off the ridge (kick, 0.006 N·m by default).](Projects/Haptic Handwheel/firmware/handwheel/feel_core.h)
- [accepts 'set kick'. Compiles for the Nano ESP32 against SimpleFOC 2.3.3.](Projects/Haptic Handwheel/firmware/handwheel/handwheel.ino)
- [the laptop check, still matching the browser engine within 1e-5 N·m.](Projects/Haptic Handwheel/firmware/host-test/compare.mjs)
- [a new bench check: let go near the ridge twenty times.](Projects/Haptic Handwheel/firmware/BENCH.md)

_The feel map · pretend motor · 'Max' means computed over USB, about 4 ms each way_
| feel | motor's brake | where it can be computed | why |
| --- | --- | --- | --- |
| frets, 24 a turn | on | Max, if the brake is the middle guess or stronger | calm, no ring |
| string bend | on | Max, if the brake is the middle guess or stronger | a held bend sits still |
| end stops | on | on the knob | the stiffest thing it does |
| stepped values, 8 a turn (context knob) | on | Max | clicks you can count |
| soft centring spring | on | Max | no wobble on return |
| haptic filter | on | Max | 89 ms glide; 29 ms with 18% overshoot without |
| struck spring and pendulum | off | on the knob | 3 wobbles off, 1 on |
| turntable | off | on the knob | idles at 88% off, 52% on |
| LFO, the pitch, beat clicks | either | anywhere | played into the hand |

_Left rough:_ It's all a pretend motor again: the brake, friction and bumps are guesses until the bench measures them, and the brake guesses alone move frets between Max and the knob. I haven't listened to either new recording. I only loaded the page headless: it draws and its scripts parse, but dragging and sound with the new switches are untested. The older table above the feel map still assumes the brake is cancelled. The turntable's slow idle is still unfixed. It needs a slow correction in the speed loop, the integral term the earlier simulation pointed to, and I haven't built it.

_Next moves named:_ Make the brake switch with the feel in firmware: each feel sets its own brake setting when you select it, so the struck spring rings and frets stay calm without you sending 'set cancelBrake'. · Give the turntable the slow speed correction it's missing, so it holds 33⅓ whatever the brake does. · When you say yes to the parts: the bring-up checklist for the day the box arrives.
<sub>`haptic-handwheel-steward-012` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="haptic-handwheel-steward-010" -->
### 2026-10-13 — cycle 5 — The parts order is ready — about $145–185, or $75–95 with your own bench supply. Shall I treat it as yes?
> still working · unknowns pinned on paper · steward leans ORDER

Catch-up: Haptic Handwheel is your one-big-knob instrument, a motor whose feel is software. The plan you agreed today goes simulate, pin the unknowns, buy, bench, then your hands judge each feel. The simulation and the pinning-down are done as far as paper goes. The firmware compiles, and the bench tests and their analyzer are ready. What's left can only be learned from a real motor. The next move on the plan is the one I can't make: you saying yes to the list and the spend. The list is order/PARTS.md: the iFlight GM5208 motor with its encoder ($62), two $9 drivers, an ESP32, a contact mic, a capacitor, printed caps and a clamp block, plus a 0–30 V bench supply if you don't have one. No vibration motor: the model says this motor carries a G alone. If you own an Arduino Nano ESP32, skip the controller. I keep building either way; nothing is bought until you say.

**Artifacts:**
- [The order: nine lines with links and prices, why each one, and what's left out.](Projects/Haptic Handwheel/order/PARTS.md)
- [What the bench will measure once the parts arrive, drawn from a pretend motor.](Projects/Haptic Handwheel/firmware/bench/selftest.png)
<sub>`haptic-handwheel-steward-010` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="haptic-handwheel-steward-009" -->
### 2026-10-13 — cycle 5 — The knob's firmware compiled for a real board for the first time, and the bench analyzer can now map the motor's bumps and answer 'can it carry a G'.
> shipped · pinning the unknowns is done on paper · steward leans place the order

**It compiles.** Your laptop already has the Arduino IDE and the Arduino Nano ESP32 core. I fetched SimpleFOC into a scratch folder and built the sketch: no warnings from our files, 10% of the board's space. It took one honest failure to get there. SimpleFOC 2.4.0 and 2.3.4 refuse this core, because they want arduino-esp32 3.x. 2.3.3 builds. So before the parts arrive: either pin SimpleFOC to 2.3.3, or update the ESP32 core. That's noted in the sketch and in BENCH.md. It also means that if a Nano ESP32 is sitting in a drawer, it could stand in for the controller on the order, with the pins moved.

**The motor's own bumps.** This motor has 12 slots and 14 magnets, so it should bump 84 times a turn, and those bumps are frets you didn't ask for. The cog test now holds the knob at 1,680 points, going one turn forward and one back. Going both ways pulls the two things apart: the bumps are the average of the two passes, and friction is half the gap between them. The analyzer fits the bumps and writes `cog_map.h`, and the firmware adds the opposite push so that it cancels them (`set cogGain 0` from Max lets you feel the raw motor again). On a pretend motor it recovers the bumps and the friction within 1%. A default software fret comes out 3.6× the raw bumps, and 45× what's left after cancelling.

**Can it carry a G?** The encoder can only count the wobble up to about 90 Hz, so the contact mic does the rest. A piezo on the cap hears acceleration, so dividing by pitch squared gives the knob's movement at every pitch, scaled where the encoder and the mic both hear. The mic and the knob keep separate clocks. The analyzer finds the sweep in the recording by itself (it found a 1.37 s offset to the millisecond). It then fits the winding's inductance, which is what decides how fast the push dies at high pitch. Across pretend motors from 1 to 12 mH it lands within 1%. With the encoder alone it can be off by 80%, so the mic is worth its $10.

**One motor or two.** The plan asked whether a small vibration motor should join this one. The model's answer: one is enough, by a wide margin. About 10 µm of rim movement per volt at G3, against roughly 0.16 µm a fingertip detects. I've written the rule down before the data: one motor if the mic shows ten times the threshold at 196 Hz for 1 V or less, re-checked with a finger resting on the rim. So the vibration motor stays off the order.

**Artifacts:**
- [What the first bench session will hand back, drawn from a pretend motor: software frets against the motor's own bumps, and the push at each pitch against what a fingertip feels.](Projects/Haptic Handwheel/firmware/bench/selftest.png)
- [The analyzer against a pretend motor with known numbers: every number, measured against true.](Projects/Haptic Handwheel/firmware/bench/selftest.txt)
- [Now reads all five bench tests, including the cog map (writes cog_map.h) and the chirp with the contact-mic WAV.](Projects/Haptic Handwheel/firmware/bench/bench_analyze.py)
- [Adds the push that cancels the motor's bumps once a map exists. Until then it cancels nothing.](Projects/Haptic Handwheel/firmware/handwheel/cog_cancel.h)
- [The board sketch: cog test both ways, cancelling wired in. Compiles for the Nano ESP32 with SimpleFOC 2.3.3; never run on a board.](Projects/Haptic Handwheel/firmware/handwheel/handwheel.ino)
- [The bench page, now with the compile notes and the two decisions it settles, each rule written before the data.](Projects/Haptic Handwheel/firmware/BENCH.md)
- [The order, plus a note: check the drawer for a Nano ESP32 before buying the controller.](Projects/Haptic Handwheel/order/PARTS.md)

_The analyzer against a pretend motor (selftest.txt)_
| what it measures | measured | true | off by |
| --- | --- | --- | --- |
| rotor + cap weight (inertia) | 4.94e-5 kg·m² | 5.2e-5 | −4.9% |
| the motor's own brake | 0.00884 N·m·s/rad | 0.00890 | −0.6% |
| bumps, peak | 8.36 mN·m | 8.29 | +0.8% |
| bumps per turn | 84 | 84 | 0 |
| friction | 3.97 mN·m | 4.00 | −0.8% |
| winding inductance | 3.23 mH | 3.00 | +7.5% |
| rim at G3, per volt | 10.1 µm | 9.98 | +1.1% |

_Left rough:_ Everything here is checked against a motor I made up, so it shows the analyzer can read a capture, not what the GM5208 will say. The sketch compiled for the Nano ESP32, not the classic ESP32 on the order (its core isn't installed), and it has never run, with the pins still guesses. The fingertip threshold is a rough curve shaped after Verrillo's classic measurements, not your hand. And the model can't include a gripping hand, which will soak up some of the G.

_Next moves named:_ If you say yes to the order: a bring-up checklist for the day the box arrives (wiring photo-guide, first power-on at 0.5 A, the meter test, then the five bench runs in order). · Add the brake dial and cogging to the browser feel lab, so you can feel ringing versus calm, and raw versus cancelled bumps, with a mouse before your hand meets them.
<sub>`haptic-handwheel-steward-009` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-haptic-handwheel-steward-003" -->
### 2026-10-13 — Plan agreed: Shall this be the Handwheel's first plan: simulate, pin the unknowns, buy, bench, then your hands judge each feel?

Haptic Handwheel is your one-big-knob instrument: a motor and sensor whose feel is software. Until today it had seven feels on paper, a parts brief you asked us to doubt, and no plan. Today I built it in simulation. The sweep shows the stiff feels must run on the knob itself, and that a cable is fine for anything played into the hand. That gives the path a shape. Most of it I can do without you. The two places it can't go without you are spending money on parts and judging the feels by touch. The plan below puts those two at fixed points, so I never ask for either early. The cost of adopting it is a parts order around the third move. If you'd rather start from the context knob (the nearer product), say so and I'll put it first. I'll keep building along the first move either way.
<sub>`plan-haptic-handwheel-steward-003` · plan agreed · agreed 2026-10-13T22:53:41.216Z · proposed by Haptic Handwheel's steward (`haptic-handwheel-steward-003`), adopted by Loudon (`resp-mv7a24m8-fnomaf`)</sub>
<!-- /scroll:entry -->

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
