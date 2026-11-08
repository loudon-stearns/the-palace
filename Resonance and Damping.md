---
title: Resonance and Damping
type: concept
pillars:
  - tools
  - creation
  - philosophy
born: 2026-10
stage: growing
forward_vector: "I want to be the page every instrument build points at when it says resonance, Q or loss: two numbers, where a thing rings and how fast it forgets, said in plain words with their equations beside them. I want Q heard before it is read, through a sweep a learner can play, and I want the Waveguide's soundboard tuned from my ring-time rule instead of by guess."
links:
  - target: "[[Bessel Functions in Synthesis]]"
    type: connects-to
    label: the-filter-is-a-spring
  - target: "[[Waveguide Synthesizer]]"
    type: connects-to
    label: loss-per-trip
  - target: "[[Synthesis Topologies]]"
    type: connects-to
    label: physical-modelling
  - target: "[[Parametric Resonance]]"
    type: contrasts-with
    label: pushed-not-pumped
  - target: "[[Frequency-Time Duality]]"
    type: connects-to
    label: sharp-peak-long-ring
  - target: "[[Portamento and Physical Pitch Modeling]]"
    type: connects-to
    label: pitch-that-settles
  - target: "[[Crystal Synthesizer]]"
    type: connects-to
    label: q-from-mode-lifetime
  - target: "[[Tract Mirror]]"
    type: connects-to
    label: formants-are-resonances
  - target: "[[Kuramoto Coupling]]"
    type: connects-to
    label: quarter-cycle-lag
  - target: "[[Haptic Handwheel]]"
    type: connects-to
    label: damped-by-a-finger
  - target: "[[Progressive Staging]]"
    type: connects-to
    label: staged-by
---

# Resonance and Damping

![[Resonance and Damping — hero.png]]

Push a child on a swing. Push at the swing's own rate and every push adds to the last; push at any other rate and half your pushes fight the swing. That is resonance: a thing that wants to move at one rate answers that rate far more than any other. Now stop pushing. The swing keeps going, a little lower each time, until it hangs still. That is damping: how fast a thing forgets.

Every resonant filter, every plucked string, every bell and every vowel is these two facts together. A synthesizer's resonance knob, a waveguide's loss filter and a guitar's wooden body are three ways of setting the same two numbers.

## Two numbers

The equation is the one [[Differential Equations]] gives for the second-order system, with a push added on the right:

`d²y/dt² + 2ζω_n·dy/dt + ω_n²·y = F(t)`

In words: how fast the motion is changing, plus a friction that grows with speed, plus a spring that pulls back harder the further it goes, equals whatever is pushing it.

Only two numbers decide what it does. **ω_n**, the natural frequency, is where it rings (in hertz, f_n = ω_n ÷ 2π). **ζ**, the damping ratio, is how fast the ring dies. Below ζ = 1 it rings, at 1 it settles without overshoot, above 1 it creeps. Differential Equations walks those three regimes; this page lives in the first, where things ring.

Audio people rarely say ζ. They say **Q**, the quality factor, which is the same number turned upside down:

`Q = 1 ÷ (2ζ)`

High Q, little damping, long ring. Low Q, heavy damping, short thud. A Q of 100 loses about a sixteenth of its stored energy on each cycle: the fraction is 2π ÷ Q.

## One number, three faces

Q shows up three ways, and they are the same fact.

- **How tall the peak is.** Push the system at its own rate and it swings Q times as far as the same push held steady would move it.
- **How narrow the peak is.** The band it answers to, measured between the points where its response has fallen to half power, is f_n ÷ Q wide (exactly, for a band-pass filter's output; for the swing itself, closely once Q is above a few).
- **How long it rings.** Strike it and the ring falls 60 dB in about 2.2 × Q ÷ f_n seconds.

| Q | ζ | width of the peak at 1 kHz | ring time at 1 kHz |
|---|---|---|---|
| 1 | 0.5 | 1000 Hz | 2.2 ms |
| 10 | 0.05 | 100 Hz | 22 ms |
| 100 | 0.005 | 10 Hz | 0.22 s |
| 1000 | 0.0005 | 1 Hz | 2.2 s |

The width and the ring time trade against each other exactly: the width in hertz times the time it takes the ring to fall to about a third (1/e) is 1 ÷ π, whatever the Q. A peak that is sharp in frequency is long in time. It is [[Frequency-Time Duality]]'s reciprocal again, f = 1/T, applied to the width of a peak and the length of a ring. You cannot have a filter that picks out one frequency precisely and also stops ringing quickly.

## Pushing it

The earliest clear account of resonance is Galileo's, in 1638, and he got half of it wrong. He saw that one ringer, pulling in time, could swing a bell so hard that four or even six men grabbing its rope were lifted off their feet, and he concluded that a pendulum cannot be made to swing at any rate but its own. Thomas Young showed in 1807 that it can: push it smoothly, as a sine, and it swings at the rate of the push, not its own (the history is Jörn Bleck-Neuhaus's, "Mechanical resonance: 300 years from discovery to the full understanding of its importance", arXiv 1811.08353). Both are true, and the difference is the whole of this section. Struck, a thing rings at its own rate. Driven, it moves at yours, and its own rate only decides how much.

Three things happen as the push passes the natural frequency:

- **The swing peaks**, at Q times its steady value. With heavy damping the peak in displacement slides a little below f_n, and at Q below about 0.707 (ζ above about 0.707) it flattens away entirely. That boundary has a name in filter design: a two-pole low-pass at Q = 0.707 is the Butterworth, the flattest response with no bump.
- **The swing falls a quarter cycle behind the push.** Below resonance it moves with the push; far above, against it; at resonance, exactly 90° behind. [[Kuramoto Coupling]] meets the same quarter cycle as the point of maximum coupling force.
- **Every push goes in and none comes back.** At that quarter-cycle lag the push is in step with the velocity, so the push only ever adds energy. Off resonance, energy flows in and back out each cycle. What stops the swing growing forever is damping, which spends energy exactly as fast as the push supplies it.

This is resonance from outside, a force at f_n. [[Parametric Resonance]] is its contrast: nothing pushes, a parameter like the spring's stiffness is wobbled at twice f_n, and the swing grows exponentially from inside. Damping matters there too, as the threshold the pump has to beat.

## Where the builds point

### The filter's resonance knob

A resonant filter is a mass on a spring. [[Bessel Functions in Synthesis]] § The State-Variable Filter as Physics shows the state-variable filter is a discretised `m·ẍ + b·ẋ + k·x = F`: cutoff is the natural frequency, the resonance knob is Q. Turning up resonance is taking friction away. Sweep a high-Q filter over noise and you hear a whistle where the peak sits, because a narrow band of noise is nearly a sine. Take the damping below zero, as the top of a resonance knob does in many analogue designs, and the ring grows instead of fading until something nonlinear holds it: the filter has become an oscillator. The [[VST Template]]'s SimpleSynth carries a two-pole state-variable filter whose Resonance tops out at Q = 20 and never self-oscillates: its damping never reaches zero, and the only nonlinearity is a soft clip on the output.

### The string's loss filter

A [[Waveguide Synthesizer]] string has no friction term. Its damping is what the loop takes each trip. If one trip keeps a fraction g of the wave, the ring falls 60 dB in 60 ÷ (−20·log₁₀ g) trips, and a trip lasts one period. At 220 Hz, a loop gain of 0.995 loses 0.044 dB a trip and rings for about 1,380 trips: 6.3 seconds.

The loop filter makes that loss depend on frequency. Each partial of the string is a resonator of its own, and the filter gives each its own Q: upper partials lose more each trip, so they die first, and the note goes from bright to dark. Brightness and sustain feel like two settings on a waveguide string. Underneath they are one curve, the damping of each partial, and the loop's gain and its filter bend that curve in different places.

### The body

The Three Doorways of Frequency-Time Duality say it in one line: tune the loop filter and the string has a material; branch a resonator off it and it has a body. A body is a bank of resonators, each a mode of the plate or box with its own frequency and Q. The Waveguide's soundboard is twelve of them. Its v1.8 notes put the energy plainly: "the energy the string loses at the bridge is exactly the energy the board gets." A rigid bridge gives a long, quiet note; a soft one a shorter, louder, woodier note.

### A struck thing is a bank of resonators

This is the root of modal synthesis, one of physical modelling's main families beside the waveguide ([[Synthesis Topologies]] gathers the families). A bell, a bar, a plate: strike it and every mode rings at its own frequency with its own Q, and the timbre is the list of those pairs. [[Crystal Synthesizer]]'s modal option, still a design, would take the Q of each resonator from the lifetime of a lattice mode. The voice runs the same way from the other side. A formant is a resonance of the vocal tract, and in [[Tract Mirror]] each formant is a pair of poles of the all-pole filter: their angle is the formant's frequency, their distance from the centre its bandwidth.

### Pitch that settles

The resonator need not be the sound. [[Portamento and Physical Pitch Modeling]] makes the pitch itself the mass on the spring, so a glide overshoots and settles like a singer landing on a note. On the [[Haptic Handwheel]] the knob would be the spring, and Loudon described the move: "I kind of strike it and let the mechanism of the virtual spring wobble down into pitch, and I could interact with it to damp it with my finger." The finger is the ζ.

## Damping is where the sound goes

Damping reads like loss, a leak to be plugged, and in a sense it is. But a string alone moves almost no air. What makes it audible is the energy leaving it through the bridge into the body, and that leaving is the string's damping. A string with no damping would ring forever and you would never hear it. Sustain and loudness are drawn from the same store, spent slowly or spent fast. The tension doesn't resolve, and an instrument maker lives inside it: every choice of bridge, body and wood is a choice of where on that trade to sit.

## Building one

The digital resonator is two numbers again, now as the angle and the radius of a pole:

`y[n] = x[n] + 2r·cos θ·y[n−1] − r²·y[n−2]`

In words: each output is the input plus a ring made from the last two outputs. **θ = 2π·f_n ÷ fs** is the angle, the pitch. **r = e^(−π·f_n ÷ (Q·fs))** is the radius, and each sample the ring shrinks by a factor of r. An r of 1 rings forever; smaller r forgets faster. The relation between r and the peak's width is exact for narrow peaks and close for broad ones. The Mathieu Resonator in [[Floquet Time-Modulated Loops]] is the same mass on a spring, stepped forward sample by sample with its stiffness pumped, and its `damping_zeta` is the ζ above.

[Q you can hear](Resonance%20and%20Damping/Resonance%20and%20Damping%20—%20sketch%20—%20q-you-can-hear.html) is this resonator in a page: strike it, feed it noise, or drive it with a sine you sweep through the peak, while it draws the peak, the ring and the lag from the same two numbers. It is silent until you press play. [Five steps up to it](Resonance%20and%20Damping/Resonance%20and%20Damping%20—%20sketch%20—%20q-step-by-step.html) come first, staged after [[Progressive Staging]]: it rings at its own rate, it forgets, pushed it moves at your rate, near its own rate the push piles up, and the swing falls a quarter cycle behind.

## Origin

Minted 2026-10-25. [[Differential Equations]] linked this page before it existed, as the place where "resonance IS the response of a second-order system to driving at its natural frequency", and it stayed a forward ghost across four map cycles. The handoff that carried it off the retired Palace To-Do asked for the page the filter, string, body and physical-modelling builds could all point at, grown from the second-order material Differential Equations already held.

## Forward Vector

- **Hear Q.** The sketch is a rough, and it has its place now: on this page's rich face, under § Building one, as a proposal. Whether the strike, the noise and the sweep make the three faces of Q land is for Loudon's ears, in his own time. He answers with a note from the review dock at that section's foot, which reaches the board as a review note on this page, or with his word in chat ([[Review Layer]], [[Enrichment]] § Proposal and approval).
- **Hear the steps.** The five steps up to the sketch were finished on 2026-10-29: one weight across the page, a push in hertz that holds still on steps 3 to 5, step 4's peak drawn both ways from the rest line, and Claude's closing question kept on Loudon's word. They wait beside the sketch in the same proposal, for his ears through speakers. That is a review, not a task: it stays on the face until he has heard them. One wish beyond it: a learner taking the steps by hand, to see whether the walk teaches someone who has not read the page.
- **Tune the soundboard by ring time.** The Waveguide's scroll has carried a rough since cycle 8: at higher notes the string goes quiet in about a second while the board keeps ringing. The rule here, ring time ≈ 2.2 × Q ÷ f, gives each of the board's twelve modes a Q to aim for, from the ring time a real soundboard has. The board sets ring times today, which come to about Q 14 at its lowest mode and Q 49 at its highest.
- **Measure the filters.** SimpleSynth's is answered from its code: its Resonance tops out at Q = 20, and it never self-oscillates. The same question stands for every other filter a palace instrument carries.

---

*"First of all one must observe that each pendulum has its own time of vibration so definite and determinate that it is not possible to make it move with any other period than that which nature has given it."* — Galileo Galilei, *Dialogues Concerning Two New Sciences* (1638; trans. Henry Crew and Alfonso de Salvio, 1914). Half right: see § Pushing it.
