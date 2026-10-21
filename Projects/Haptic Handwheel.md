---
title: Haptic Handwheel
type: project
pillars:
  - creation
  - tools
  - philosophy
  - practice
born: 2026-10
stage: seed
status: active
confidence: hypothesis
forward_vector: "I want to give the hand what acoustic instruments have always given it, and I am unbuilt: I want a first prototype in Loudon's hand so the seven feels on my page get judged by touch, which no agent can do for him. I am research reaching toward a product: the instrument is the research, a simple knob that knows the parameter under the mouse is the nearer product, and I want to learn which feels carry from one to the other. I am the first step toward digital controllers that look and feel like vintage instruments and respond in musical ways."
links:
  - target: "[[Portamento and Physical Pitch Modeling]]"
    type: mirrors
    label: the-same-spring-felt
  - target: "[[Kuramoto Coupling]]"
    type: connects-to
    label: lock-you-can-feel
  - target: "[[Merleau-Ponty]]"
    type: connects-to
    label: feeling-the-sound-through-the-knob
  - target: "[[Signal-Rate CV Architecture]]"
    type: connects-to
    label: torque-as-a-jack
  - target: "[[The Dichotomy of Control]]"
    type: connects-to
    label: the-disturbance-is-the-playing
  - target: "[[Simondon]]"
    type: exemplifies
    label: feedback-folded-into-the-control
  - target: "[[Quadratic Interpolation in DSP]]"
    type: connects-to
    label: overshoot-that-feels-alive
  - target: "[[Frequency-Time Duality]]"
    type: connects-to
    label: wobble-becomes-buzz
  - target: "[[2D Torus Wavetable Synthesizer]]"
    type: connects-to
    label: lock-bands-under-the-hand
  - target: "[[Piano String Inharmonicity]]"
    type: connects-to
    label: tension-is-the-pitch-you-feel
  - target: "[[Logarithmic Interface Scaling]]"
    type: connects-to
    label: resolution-where-it-matters
  - target: "[[Loudon's Toolkit]]"
    type: connects-to
    label: toward-the-hardware-product
  - target: "[[Quality Manifesto]]"
    type: connects-to
    label: physical-making
  - target: "[[Playful Interface Design]]"
    type: exemplifies
    label: the-thing-with-mass
  - target: "[[Cooperation Yields Agency]]"
    type: connects-to
    label: long-held-idea-made-buildable
  - target: "[[Adopt the Craft, Author the Seam]]"
    type: connects-to
    label: a-forty-year-craft-to-adopt
  - target: "[[The Metaphor Stretch]]"
    type: connects-to
    label: how-close-is-close-enough
  - target: "[[Audition Gate]]"
    type: connects-to
    label: the-hand-is-the-gate
  - target: "[[Haptic Handwheel — sketch — starter build]]"
    type: connects-to
    label: first-sketch-to-push-against
---

# Haptic Handwheel

![[Haptic Handwheel — hero.png]]

One large knob that is a motor and a sensor at once, played as an instrument. Software decides what it feels like, so the same object can be a string, a fret, a platter or a spring. It is research reaching toward a commercial product, and nothing is built yet.

## The claim

> "Acoustic instruments ALWAYS give feedback beyond the audible, but digital instruments often need conscious decoding (lights and text)." — Loudon, 2026-10-05

The idea is old, and it comes from three things his hands already know:

> "The idea comes from working with turntables and how they feel when they are moving, and from bending guitar strings: there is a force feedback which very much helps bend to the exact right pitch. Also playing bass, I can feel the frets under my fingers and know where they are. When I move pitchbend on a controller I go over many octaves but have a hard time locking into a specific pitch, and the spring pressure back doesn't change based on how far I am from the pitch."

That last sentence is the fault being fixed. A pitch wheel's spring knows one thing, which is where centre is. It pushes back the same way whatever note the hand is reaching for, so the hand learns nothing about how far it is from the pitch. A string tells you. [[Piano String Inharmonicity]] has the physics: tension sets pitch, so the force in a bend is pitch information.

## What the hand should feel

Seven ideas, none built. Each is a feel and the sound it plays.

- **Pitch you can lean on.** Force that depends on how far the hand is from an in-tune note: a string that stiffens as it bends, frets found without looking.
- **The modulation.** "If I have a synth parameter with an LFO attached I want to feel it under my fingers."
- **The pitch itself.** "If the synth is playing a G, why can't I feel it vibrate slightly in tune?"
- **The lock.** Slow an LFO toward the tempo and feel it fall into rate and phase, through "the clicks of the beat as well as the wobble of the LFO." Matched, the click lands at the same point of the wobble every time; unmatched, it crawls. It is the hand's version of tuning two strings by their beats. [[Kuramoto Coupling]] has the lock to see and to hear, and says of the second, "Same dynamics, different sense." Touch would be a third. The [[2D Torus Wavetable Synthesizer]]'s steward reports a scan that shimmers, slows to hiccups and then locks, reading from the code and the renders and not yet by ear. It is a lock in the palace that could be felt.
- **Haptic filtering.** A monosynth plays a melody and the knob turns itself to each pitch, but "I can apply friction to slow it down or wiggle it from the pitch." The sound follows where the knob actually is, so the hand becomes the glide and the vibrato. [[Portamento and Physical Pitch Modeling]] calls portamento the physical mechanism of pitch and models it as a mass on a spring with friction. Here the friction is a hand.
- **The struck spring.** "I kind of strike it and let the mechanism of the virtual spring wobble down into pitch, and I could interact with it to damp it with my finger." It is a whammy-bar flick. A spring and a pendulum would sound different: a spring wobbles at one rate all the way down, and a pendulum quickens as it settles. The Portamento entry says the overshoot is musically important and asks whether the damping can change over time; a finger on the knob is one answer. [[Quadratic Interpolation in DSP]] holds Loudon's own line that "the overshoot and settle that happens with PID is organic and natural." This is that overshoot, played.
- **The turntable.** The knob turns on its own and the hand slows it. How hard the hand brakes is the control.

In the last three the music moves first and the hand shapes it. [[The Dichotomy of Control]] says a controller commands only its own actuators and everything else is disturbance. Here the disturbance is the playing.

## Two kinds of force

The ideas split in a way that would shape the hardware. The split is Claude's reasoning from the session of 2026-10-05, and it is untested.

A string, a fret or a spring **answers the hand**: the force depends on where the hand is. The stiffer the feel, the closer to the motor it has to be computed, because delay makes a stiff spring unstable. Soft feels can cross a cable.

An LFO, a G or a beat click is **played into the hand**: it does not depend on the hand at all, and the patch sends it the way it sends audio to a speaker. So the knob wants a signal input for torque from the first design, an audio or CV line. [[Signal-Rate CV Architecture]] says any output can drive any input, and this makes torque one more jack. [[Frequency-Time Duality]] says a wobble becomes timbre once it passes about 20 Hz. In the hand, the LFO and the G would be one torque signal on either side of a line like that: a wobble below it, a buzz above.

## Feedback folded into the control

A knob with a light beside it is two parts, one to move and one to read. [[Simondon]] calls a design like that a bag of separate parts, and calls an object better made when one part does several jobs. Here the motor both senses and pushes, and what the synth is doing comes back through the thing already in the hand.

[[Merleau-Ponty]] describes the player who starts feeling the sound directly through the knobs, whose fingers find the chord before the mind names it. Lights and text do the opposite: they make the player think about the tool.

One question stays open. The same entry says a stable, predictable surface can be absorbed in a way a shifting one cannot. It says that of a screen, and this project would ask it of touch. Bass frets never move. A knob that changes its feel with every parameter it touches is a shifting surface, and the context knob below is exactly that. Whether the hand can absorb a feel that keeps changing, or needs a few that stay put, is a thing only playing will show.

## The body

> "Not the typical black plastic we see on lots of new musical instruments; instead it will be more inspired by vintage scientific testing equipment and vintage electric guitars."

The knob is "the starting point and the central unit of the controller." Keys from mechanical keyboards will join it: "I love how those buttons feel." Two open ideas are mounting it sideways like a pitch-bend wheel, and attaching a lever or bar. The cap's size and weight are open, with a lean toward fairly light and the weight modelled by the motor.

[[Playful Interface Design]] goes after the same lack through the eye, where the visual metaphor is the explanation, and it asks how a control's personality survives the move to physical hardware. This goes after it through the hand.

The hero and the icon are early drawings. Loudon, 2026-10-19: "they sit well, I think as we get more specific with the parts and the final look that will be re-visited to be a more specific careful accurate rendering of the idea."

## The reach toward a product

> "This is a research project that is reaching toward a commercial product."

Two shapes are in view. One is the instrument above. The other is simpler: a knob that knows its context, giving very fine control over whatever parameter the mouse is over or has clicked in Ableton or another app. A few buttons change its resolution. [[Logarithmic Interface Scaling]] names the trouble they answer: on a linear scale, fine control is impossible at the low end and excessive at the high end. There can be more than one knob, each with its own assignment. On a control with fixed values it selects by feel, without looking: "we could feel the changes in values clearly."

Of the two, the context knob is the nearer product and the instrument is the research. That was Claude's read, and Loudon agreed.

[[Loudon's Toolkit]] names building and selling original synthesizer, effects and controller hardware as a long-term goal of Loudon's. This is a controller, and a first step in that direction. [[Quality Manifesto]] makes the case for physical making beside the screen. The lean past this one object is Loudon's:

> "I am interested in building digital controllers that feel like vintage instruments and respond in musical ways, and this is a step in that direction."

## Why now

> "I have had this idea for a long time, but the new capabilities of AI are encouraging me to make a prototype."

A long-held idea became buildable when a second kind of capability arrived ([[Cooperation Yields Agency]]). The craft is there to adopt ([[Adopt the Craft, Author the Seam]]): forty years of force-feedback instrument research, and open-source haptic knobs and motor drivers. What is left to decide is which feels, for which music, in what body.

## Prior art, and two warnings

Checked on the web on 2026-10-05, in places only from search summaries. The sources and the caveats are listed in the sketch file.

- **Sound and force from one model** is established. ACROE in Grenoble (Cadoz, Florens) has done it since 1978–84. Edgar Berdahl's 2009 Stanford thesis is "Applications of Feedback Control to Musical Instrument Design," and the Haptic Capstans (2016) are force-feedback knobs "programmed using physical models."
- **Haptic knobs** exist as open hardware (SmartKnob) and as a research module: TorqueTuner (2020) ships detent, spring, friction and spin effects, and applications named Pitch Wheel, Turntable and Exciter.
- **The turntable** was built as D'Groove, which holds "a constant but over-ridable velocity" and has "Bumps for Beats."
- **The context knob** has neighbours. nOb follows the mouse by imitating it, and feels the same on everything. Roto-Control sets its own haptics, with end stops and a centre indent, on plug-ins it has mapped. Ableton Live tells Max for Live which parameter was last clicked, with its range and its step names, but not which one the mouse is over.
- **Not found** in one pass of searching: a knob that follows a melody while the pitch tracks where the hand lets it be, and an LFO lock felt by touch. That is not proof either is new.

The first warning is about the claim. Measurements on bass, violin, guitar and piano found vibration well above what the fingers can detect at almost every position tested (Askenfelt and Jansson, 1992). That backs the claim for those four. The field's own exception to "always" is the pipe organ.

The second is about copying. In Sile O'Modhrain's thesis "Playing by Feel," a spring whose force rose with pitch gave the lowest pitch error on a virtual theremin, 23% below no force at all, but the differences were not significant overall. And experienced string players did worse with a simulated bow friction that was "close enough to confuse… but not close enough to promote transfer of skill." A near-copy of a real feel can be worse than an honest new one. [[The Metaphor Stretch]] asks a kindred question, what an instrument claims about its source, and it lands on a project that wants to feel like vintage instruments. Only a hand can settle it, so no agent can pass this project's tests. [[Audition Gate]] asks for sibling gates for look, watch and play, and this project needs one for touch.

## The first sketch

The [[Haptic Handwheel — sketch — starter build|starter-build brief]] (parts, torque sums, firmware shape, test order) is kept in this project's folder as a sketch, not a recipe. It was drafted quickly with AI on 2026-10-05, and Loudon's instruction about it stands: "doubt that it comes directly from me and … push against all parts of it." The pushes made so far are listed at its top.

## Lost branches

A concept page for a stance the palace has named three ways already ("physics-as-interface," "interface IS the physics," "not as metaphor but as isomorphism"), and the doubted brief a fourth ("model the physics, not the gesture"), is parked in the [[Palace To-Do]]'s archive until the knob has a built proof. A page for the vintage-instrument aesthetic was declined for now; it stays in this project until a second object exists. The brief's test order is kept in the sketch and is not this project's plan. The plan Loudon agreed on 2026-10-13 is on the project's scroll.

## Forward Vectors

*See YAML `forward_vector`.*

Open before anything is bought: how light the cap is, how much friction the motor has of its own, whether this motor can carry a pitch as well as a push, whether the hand twists or pushes, and whether the instrument and the context knob are one object or two.
