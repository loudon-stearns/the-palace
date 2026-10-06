---
title: Haptic Handwheel — sketch — starter build
born: 2026-10-05
links:
  - target: "[[Haptic Handwheel]]"
    type: connects-to
    label: child-of
forward_vector: "I am the first build sketch for the Haptic Handwheel, drafted quickly with AI and kept so it can be argued with; I am done when a real parts order and a tested firmware shape have replaced me."
---

# Haptic Handwheel — sketch — starter build

This is the starter-build brief Loudon brought on 2026-10-05, kept unchanged at the bottom of this file. It is a sketch, not a recipe. His word on it:

> "The brief was very much written quickly with AI, so you should doubt that it comes directly from me and you should push against all parts of it."

What is his, in his own words, is on [[Haptic Handwheel]]. Where this file and that page disagree, the page wins.

## Pushes against the sketch

Made in the session of 2026-10-05. Each group says who made the push and how far it was checked. Nothing here has been tested on hardware, because there is no hardware yet.

### Lines Loudon rejected

1. **"Haptics earn their place where the ear cannot help."** Wrong. His claim is the opposite: acoustic instruments always give feedback beyond the audible, and a string's force helps the hand reach a pitch the ear could also judge.
2. **"A fast payoff and sales are not goals."** Not his. "This is a research project that is reaching toward a commercial product."
3. **"An instrument, not a control surface."** Both. A simple knob that knows its context is the nearer product and the instrument is the research; that was Claude's read, and he agreed.
4. **"Keep the cap moderately heavy."** Open. His lean is fairly light, with the weight modelled by the motor.

### Lines the web check weakened

5. **"The open ground is the musical modelling."** Too broad. TorqueTuner already ships applications named Pitch Wheel, Turntable and Exciter. Sound and force from one physical model goes back to ACROE in 1978–84, and the Haptic Capstans (2016) are force-feedback knobs "programmed using physical models." Not found in one pass of searching: a knob that follows a melody while the pitch tracks where the hand lets it be, and an LFO lock felt by touch.
6. **"A round trip over USB is too slow for the feel itself."** Too strong. The FireFader computes its loop on the laptop over USB serial. The cost it names is delay, and instability with "a very stiff spring or strong damper." Stiff feels belong on the device; soft ones can cross the cable.

### Claude's pushes, from reasoning and rough sums

7. **Two-way coupling is filed under "later."** Feeling an LFO, a pitch or a beat puts it at the centre. Typed commands such as `detents 12 0.4` cannot carry a G. The knob wants a signal input for torque, an audio or CV line, in the first design.
8. **The firmware function has no memory.** Turning the current angle and speed into torque covers springs and detents. A platter, a flywheel or a pendulum with modelled weight needs a simulated body with its own momentum, tied to the knob by a stiff virtual spring. This is from memory of common haptics practice and was not checked.
9. **Mass fights fine feel.** For a given torque, movement falls by four for each octave up. Rough sum: a gentle torque at G3 moves the rim of a weighted 80 mm cap a few microns. The fingers can detect far less than that (see 17), so a pitch should be feelable in principle. But no report was found of a gimbal motor under SimpleFOC giving clean torque at 100–400 Hz, and no cogging or friction figure was found for the GM5208-12. Feeling a pitch may need a second, small vibration actuator.
10. **Leaps cost time.** Rough sum, with an assumed inertia: a weighted 80 mm cap at two octaves per turn takes about a tenth of a second to jump a fifth at full torque. Fast lines would smear into glides.
11. **A lever trades force for travel.** A motor that gives about 5 N at the rim of an 80 mm cap gives about 1.3 N at the end of a 150 mm bar, and the bar's swing weight can exceed the cap's. A bar asks for a stronger motor or gearing.
12. **A slow wobble on a light cap needs simulated weight.** Otherwise the motor's own friction stops a struck spring before the model does. The motor's friction is the number to find before buying.
13. **PID is already in it, unnamed.** The spring line is the P and the damping line is the D. Knob, spring and damping obey the same equation as a resonant low-pass filter, so a detent has a cutoff and a resonance. The I term, a force that builds the longer the hand stays off target, has no acoustic counterpart.
14. **The motor is in a turntable's class on torque, not on momentum.** A Technics SL-1200MK2's starting torque is 1.5 kg·cm, about 0.147 N·m, against this motor's 0.18–0.25 N·m. That figure came from search summaries and was not read on the page. The platter's inertia was not found. Its momentum would have to be simulated.

### Research to carry

15. **Sile O'Modhrain, "Playing by Feel"** (Stanford thesis). On a virtual theremin with 21 players and six force conditions, no force was worst and a spring whose force rose with pitch was best, 23% lower error. But "overall, the differences in feedback condition were not significant." And experienced string players did worse with a simulated bow friction: it was "close enough to confuse… but not close enough to promote transfer of skill."
16. **Askenfelt and Jansson (1992)** measured vibration "well above threshold for almost all positions" on bass, violin, guitar and piano. The field's own exception to "always" is the pipe organ.
17. **Touch is sensitive enough.** The classic figure is about 0.1 µm at 250 Hz, and about 0.03 µm at 150–200 Hz when gripping a vibrating cylinder. A low G at 196 Hz sits near the peak.
18. **Neighbouring work.** Snibbe et al. (2001): a knob that spins or brakes media through a virtual clutch. Chafe (1993): instrument audio sent to the skin. De Pra, Fontana and Papetti (2021): a programmable-resistance knob gave "significantly lower errors." TorqueTuner (IDMIL, 2020) ships Wall, Magnet, Detents, Spring, Friction, Spin and Free effects. D'Groove holds "a constant but over-ridable velocity" and has "Bumps for Beats." Berdahl's thesis is "Applications of Feedback Control to Musical Instrument Design" (Stanford, December 2009).
19. **For the context knob.** In Ableton Live, `live_set view selected_parameter` can be observed from Max for Live, and a `DeviceParameter` exposes `is_quantized`, `value_items`, `min` and `max`. No hovered parameter is exposed. nOb (2015) follows the mouse by imitating it and has mechanical resistance only. Roto-Control sets haptics and names by itself on plug-ins it has mapped; nothing shows it following a clicked parameter. Surface Dial and Logitech's Craft crown are per-app dials with simple stepped feel.

### Found at the cold read

20. **The brief asks for parts it does not list.** Its test order and its torque-sensor section mention a load cell and touch sensing, and the parts list has neither.

### Sources

Checked on the web by the Concierge on 2026-10-05.

- O'Modhrain: [thesis](https://ccrma.stanford.edu/~sile/thesis.html) · [chapter 4](https://ccrma.stanford.edu/~sile/thesis/pdf/chapter4.pdf) · [chapter 5](https://ccrma.stanford.edu/~sile/thesis/pdf/chapter5.pdf)
- ACROE: [Castagné, Cadoz et al. 2004](https://arxiv.org/abs/1005.3182) · [Cordis 1984](https://labs.sonicfield.org/library/responsive-input-devices-and-sound-synthesis-by-stimulation-of-instrumental-mech)
- Berdahl: [thesis](https://purl.stanford.edu/pb603fs3989) · [FireFader, CMJ](https://muse.jhu.edu/article/506565) · [FireFader design paper](https://www.cct.lsu.edu/~eberdahl/Papers/Berdahl_and_Kontogeorgakopoulos_2012a_FireFader_and_Derivatives.pdf) · [waveguide junction 2009](https://nime.org/proc/nime2009_berdahl_a/) · [Haptic Capstans](https://nime.org/proc/nime2016_sheffield/)
- Felt feedback: [Askenfelt and Jansson 1992](https://sonicfield.org/library/on-vibration-sensation-and-finger-touch-in-stringed-instrument-playing) · [Musical Haptics, chapter 4](https://air.uniud.it/bitstream/11390/1140599/1/MH_book_ch4.pdf)
- Knobs and turntables: [TorqueTuner](https://www.idmil.org/?p=1823) · [D'Groove](https://www.cs.ubc.ca/labs/spin/sites/default/files/local_pdfs/Designing_the_haptic_turntable_for_musical_control.pdf) · [Snibbe et al. 2001](https://www.cs.ubc.ca/labs/spin/node/242) · [Chafe 1993](https://ccrma.stanford.edu/~cc/shtml/tacAudFb.shtml) · [De Pra et al. 2021](https://dafx.de/paper-archive/details/AbFCuk7Y1EaAIrqdVFqNEA) · [SmartKnob](https://www.cnx-software.com/2022/04/07/smartknob-view-is-a-diy-haptic-input-knob-with-wifi-and-bluetooth-connectivity/)
- Motor and platter: [SL-1200MK2 service manual](https://steampoweredradio.com/pdf/technics/manuals/Technics%20SL-1200MK2%20Service%20Manual.pdf) · [SimpleFOC anti-cogging thread](https://community.simplefoc.com/t/does-simplefoc-implement-anti-cogging-feature/89)
- Context knobs: [nOb](https://newatlas.com/nob-usb-software-controller/40799/) · [Surface Dial](https://www.soundonsound.com/reviews/microsoft-surface-dial) · [Logitech Craft](https://logitech.com/en-us/craft/craft-experience.html) · [Roto-Control](https://www.soundonsound.com/reviews/melbourne-instruments-roto-control)
- Live API: [DeviceParameter](https://docs.cycling74.com/apiref/lom/deviceparameter/) · [Song.View](https://docs.cycling74.com/apiref/lom/song_view/)

---

Everything below is the brief as Loudon brought it, unchanged.

# Haptic knob: starter build

Oct 5, 2026 · @Loudon

A single large haptic knob played as a musical instrument, built from a gimbal motor with a mounted encoder, a SimpleFOC driver and an STM32 board, talking to Max over serial. Parts total roughly $170–230.

## Why this exists

The goal is a single knob that is a musical instrument in its own right: it feels what the hand does and pushes back, so sound and touch are shaped by the same physical model.

- **One knob, many bodies:** the knob is an encoder and a motor at once. Software decides what it feels like, so one object can be a stepped switch, a string, a harp or a turntable.
- **An instrument, not a control surface:** one large, weighty knob to be played, as opposed to a digital row of small knobs to be set.
- **A playground of haptics:** the feel is a function that can be rewritten freely, so the maths of touch can be explored like a synthesis patch.
- **Built by hand:** making it and understanding it is the point. A fast payoff and sales are not goals.
- **Where it lives:** high-end performance and modular synthesis. It talks to a computer and Max first, with CV to follow.

## Musical uses

| Mode | What the hand feels | What it plays |
| --- | --- | --- |
| Stepped selector | Virtual clicks, one per choice, with end stops | An on-screen multi-choice parameter, set precisely by feel |
| Pitch magnet | A soft pull toward in-tune pitches that the hand can lean against | Pitch between notes, with room for bends and vibrato around each centre |
| String bend | Resistance that grows and then stiffens like a guitar string, with a slight give at the semitone and whole tone | A pitch bend wheel whose stiffness can change with the note |
| Harp strum | Each string resists, then lets go; a fast turn sweeps across many | A note per release, with loudness from speed or built-up force |
| Flywheel | A flick that coasts, each string stealing a little momentum | A glissando that slows and dies away on its own |
| Turntable | Constant rotation that the hand slows by friction | Playback speed or any parameter, driven by how hard the hand brakes |

## Design principles

- **Model the physics, not the gesture:** a pluck is a spring that releases, not a detent. Sound and feel come from the same model.
- **Feel is rendered on the device:** the knob computes its own torque thousands of times a second. The computer only describes the feel and listens to the motion.
- **Haptics earn their place where the ear cannot help:** setting a value before a note sounds, or cueing silently. Where the ear already gives the answer, the feel should add expression, not repeat it.
- **Real mass is a choice:** physical weight steadies the knob but blurs fine detail. Keep the cap moderately heavy and simulate the rest.
- **Two-way coupling:** later, signals from a patch can push on the hand, so an LFO or envelope is felt as well as heard.

## Prior art to study

The hardware concept is established; the open ground is the musical modelling. Roto-Control was checked on the as-of date and the other three are from memory.

- **SmartKnob (Scott Bezek):** open-source haptic knob with virtual detents and end stops.
- **TorqueTuner (IDMIL, McGill):** force-feedback knob module made for digital musical instruments.
- **D'Groove (Beamish, MacLean, Fels):** a haptic turntable for DJs.
- **[Melbourne Instruments Roto-Control](https://www.synthtopia.com/?p=147007):** a commercial controller with eight motorized, touch-sensitive knobs and user-definable haptics.

## Parts list

Motor and driver specs were checked against vendor pages on the as-of date. Controller, power supply and mechanical costs are approximate, from general knowledge.

| Part | Pick | Why | Approx. cost |
| --- | --- | --- | --- |
| Motor and encoder | [iPower GM5208-12 with AS5048A encoder](https://shop.iflight.com/ipower-motor-gm5208-12-brushless-gimbal-motor-with-as5048a-encoder-pro248) | Hollow-shaft gimbal motor with a 14-bit magnetic encoder already mounted | $61.99 |
| Driver | [SimpleFOCShield v3.2](https://www.simplefoc.com/simplefoc_shield_product_v3) | Made for gimbal motors, has current sensing, stacks on the controller | 15–30€ |
| Controller | STM32 Nucleo-64 (e.g. F446RE) | Fast enough for torque control; its USB port shows up as a serial device for Max | about $20 |
| Power | 24 V bench supply with adjustable current limit | The current limit is the safety net while code is untested | $50–80 |
| Knob | 70–90 mm cap, 3D printed, with pockets for steel weights | Lets you tune mass by hand before machining anything | a few dollars |
| Base | Heavy plate (steel or thick aluminium) with rubber feet | The base must not move when the knob pushes back | $10–20 |
| Wiring | Jumper leads, shielded cable for the encoder | Encoder noise is the known weak spot of this motor | $10 |

## Why these parts fit

- **Torque:** the motor is rated at 1800–2500 g·cm, about 0.18–0.25 N·m. The target is 0.08 N·m, which gives 2 N at the fingertips of an 80 mm knob.
- **Electrical match:** the motor's 15.2 Ω resistance draws about 1.6 A at 24 V. The shield is designed for gimbal motors of around 10 Ω and should stay under 2 A for long-term use.
- **Controller:** SimpleFOC recommends Nucleo-64, ESP32 or Teensy-class boards over an Arduino UNO for current control.

## Known weak spots

- **Encoder noise:** an ODrive forum user fixed errors with this encoder by moving its cable away from the motor phase wires. Keep them separated from day one.
- **Coarse current sensing:** the shield's sensor covers up to 5 A and the motor uses under 2 A, so readings will be noisy. Start in voltage mode and treat true current control as an upgrade.
- **Encoder resolution:** 14 bits is enough to start. If stiff plucks chatter, the encoder is the first thing to upgrade.
- **Knob mass:** real mass blurs fine detail but helps stability. Keep the cap moderately heavy, with weight near the centre, and simulate the rest.
- **Safety:** clamp torque and speed in firmware and add a watchdog before fitting a heavy cap.

## Firmware shape

SimpleFOC runs the motor. The playground is one function, called a couple of thousand times a second, that turns angle and velocity into torque.

```cpp
float haptic(float angle, float vel) {
  float t = 0;
  t += -k_spring * (angle - center);              // spring
  t += -k_damp * vel;                             // viscosity
  t += -k_detent * sin(n_detents * angle);        // detents
  return constrain(t, -t_max, t_max);             // safety clamp
}

void loop() {
  motor.loopFOC();
  motor.move(haptic(motor.shaft_angle, motor.shaft_velocity));
}
```

Each musical model is a new term in that function:

- **String bend:** torque is a linear plus a cubic term in angle, pitch rises roughly with the square of displacement, and shallow dips mark the semitone and whole-tone points.
- **Pluck:** a spring that ramps up and releases at a threshold. The note fires at the release.
- **Flywheel:** virtual inertia that coasts after a flick, with each string stealing a little momentum.
- **Turntable:** a velocity target with a torque cap. The gap between target and actual speed is the hand's braking, sent out as a control signal.

## Talking to Max

The haptic loop stays on the device. Max only sends descriptions of feel and receives motion, because a round trip over USB is too slow for the feel itself.

- **Transport:** plain serial over the Nucleo's USB cable into Max's `serial` object.
- **Knob to Max:** angle, velocity and events such as "pluck fired", a few hundred times a second.
- **Max to knob:** short text commands such as `detents 12 0.4` or `mode pluck`, easy to parse and to type by hand while testing.
- **Later:** a binary format or USB MIDI once the vocabulary settles, then CV.

## Test order

- [ ] Spin the motor open loop and confirm the encoder reads cleanly
- [ ] Add a centring spring
- [ ] Add detents, and change their count from Max
- [ ] Add the pluck, which is the hard test of motor and encoder
- [ ] Add the flywheel and the string bend
- [ ] Add the load cell and touch sensing once rotation feels right

## Optional: torque sensor

A reaction torque sensor between the motor and the base measures hand torque directly. The encoder and commanded torque already estimate it, so add this only for hiding the knob's real mass, reading forces below the friction floor, or reading force with the motor off.

| Route | Parts | Fit for this build |
| --- | --- | --- |
| DIY torque arm | Motor on a free-turning bearing mount, a short arm resting on a small bar load cell, and an [ADS1220 amplifier board](https://www.ti.com/product/ADS1220) | Cheapest way to learn whether the signal is worth having. Roughly $25 in parts, approximate. |
| Budget flange sensor | DYJN-104 class static torque sensor, sold in 0.5 to 5 N·m ranges | Bolts in between motor and base. Price and quality not verified; expect to buy from an import marketplace. |
| Professional flange sensor | [FUTEK TFF400](https://www.futek.com/store/torque-sensors/reaction-torque-sensor/reaction-TFF400/FSH03985), 160 in-oz model FSH03985 (about 1.1 N·m) | Flange-to-flange with overload protection. Priced by quote; expect it to cost more than the rest of the build combined. |

- **Range:** the motor peaks near 0.25 N·m, so a 0.5 to 1.1 N·m sensor leaves headroom for a hard grab.
- **Stiffness:** a torque sensor is a spring between motor and base. Low-capacity sensors are soft and make sharp effects feel mushy, so pick a higher range and recover resolution with a 24-bit amplifier.
- **Speed:** the ADS1220 samples up to 2000 times a second, enough to use inside the haptic loop. The common HX711 board is much slower and only suits the downward-pressure load cell.
- **Side loads:** the sensor also carries the motor's weight and any leaning on the knob, which leaks into the torque reading. Calibrate with the knob fitted.

## Sources

- [iFlight: GM5208-12 with encoder](https://shop.iflight.com/ipower-motor-gm5208-12-brushless-gimbal-motor-with-as5048a-encoder-pro248)
- [iFlight: GM5208-12 specifications](https://shop.iflight.com/ipower-motor-gm5208-12-brushless-gimbal-motor-pro279)
- [SimpleFOCShield v3.2 product page](https://www.simplefoc.com/simplefoc_shield_product_v3)
- [SimpleFOCShield v3.2 documentation](https://docs.simplefoc.com/arduino_simplefoc_shield_showcase)
- [ODrive forum: GM5208-12 configuration](https://discourse.odriverobotics.com/t/gm5208-12-odrive-s1-configuration/12720)
