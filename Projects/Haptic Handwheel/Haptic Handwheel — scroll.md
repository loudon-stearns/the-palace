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

> _Regenerated 2026-10-13T22:26:01.735Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** seed · **Steward:** cycle 1 · last ran 2026-10-13 (today)
- **Plan:** none agreed yet — the work leans on the forward vector · **a proposed revision is waiting on you**
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-13 (today) — A feel lab for the knob that doesn't exist yet: all seven feels playable in the browser, five rendered to audio, plus a stability sweep showing which feels can cross a cable. (`haptic-handwheel-steward-002`)
- **Last commit touching this project:** 2026-10-12 `29eef697` — edit(Loudon's Toolkit): Hardware Product line placed on Loudon's read; Push, Move and HISE on his word
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Haptic Handwheel is your idea for one big knob that is a motor and a sensor at once, played as an instrument. Software decides how it feels, so it can be a string, a fret, a spring or a turntable. It is research reaching toward a product, and the nearer product is a simple knob that knows which parameter it's controlling. On 2026-10-05 the page gathered seven feels, a quickly drafted parts brief you asked us to push against, and a guess from that session: feels that answer the hand (springs, frets) must be computed near the motor, while feels played into the hand (an LFO, a pitch, a beat) can come down a cable. Nothing is built. This cycle I built the knob in simulation so the feels can be…

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
