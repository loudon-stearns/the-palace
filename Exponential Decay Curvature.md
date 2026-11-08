---
title: Exponential Decay Curvature
type: concept
pillars:
  - tools
  - creation
born: 2026-06
stage: growing
confidence: working
energy: medium
hook_quality: 8
beauty: 9
who_leads: shared
links:
  - target: "[[Frequency-Time Duality]]"
    type: deepens
    label: same-equation-across-timescale
  - target: "[[2D Torus Wavetable Synthesizer]]"
    type: couples-with
    label: envelope-as-waveform
  - target: "[[Compressor Design]]"
    type: mirrors
    label: singularity-removed-by-coordinate-change
  - target: "[[Three Kinds of Warp]]"
    type: connects-to
    label: shape-decoupled-from-period
  - target: "[[Dissolutions]]"
    type: member-of
    label: envelope-is-waveform-at-slow-rate
  - target: "[[Loudon Live]]"
    type: connects-to
  - target: "[[Synth Templates]]"
    type: connects-to
    label: where-the-curve-is-heard
  - target: "[[Logarithmic Interface Scaling]]"
    type: deepens
    label: the-ear-hears-a-rise-in-ratios
forward_vector: "I want to be the small, exact entry that proves a single decay law is both an envelope and an oscillator waveform depending only on how fast you read it — and to be the place the palace keeps its growing catalogue of timescale dissolutions, where one equation flips identity when the clock speeds up. And to hold what the curve does inside a real synthesizer: the Moog contour, the way its bend changes what a stated time sounds like, and why the ear, which counts a rise in ratios, hears the exponential approach as straight and the straight line as a jump."
---
# Exponential Decay Curvature

![[Exponential Decay Curvature — hero.png]]

A tight, self-contained result: the **curvature control** found on synth envelopes — the knob that sweeps a decay from convex through linear to concave while holding total decay time fixed — admits a clean closed form, and that form reveals that *the same equation is an envelope at slow speed and an oscillator waveform at audio rate.* There was never two of them.

## From the decay law to a shape function

Start with ordinary exponential decay, amplitude as a function of time:

$$A(t) = A_0 \, e^{-t/\tau},$$

where $A_0$ is the starting amplitude and $\tau$ (the time constant) sets how fast it falls. This shape is fixed — always the same convex curve. A musician wants a *curvature* parameter: hold the duration constant, but bend the path from convex (fast-then-slow) through a straight line to concave (slow-then-fast). The normalized shape function that does this:

$$f(\text{time}, \text{curvature}) = \frac{e^{-\,\text{curvature}\cdot\text{time}/\text{duration}} - e^{-\text{curvature}}}{1 - e^{-\text{curvature}}}.$$

Reading the structure: the **numerator** pins the endpoint to zero (at time = duration, the two exponential terms cancel); the **denominator** normalizes the start to one (at time = 0, the expression equals 1). What remains — the *curvature* parameter — **decouples shape from duration.** Duration is carried entirely by the `duration` term; curvature changes only the bend. Positive curvature gives convex, negative gives concave, and the interesting case is the seam between them.

## The straight line is the hard case

Set curvature to zero and the formula is $0/0$ — undefined. The limit, by L'Hôpital's rule, is exactly the linear ramp $f = 1 - \text{time}/\text{duration}$. So perfect linearity is not a separate mode bolted on; it is the curvature = 0 limit of the one family. But the singularity is real in code: evaluating the closed form at or near zero curvature produces division by a vanishing denominator and audible clicks. The fix is a **Taylor-expansion branch** near curvature = 0 — compute the limit analytically in a small neighborhood, the exact form everywhere else.

This is the structural mirror worth preserving: the [[Compressor Design|soft-knee compressor]] dissolves *its* hard-knee singularity by the same trick — change coordinates so the corner becomes a smooth limit of a parameterized family rather than a special case. Two unrelated audio problems, one move: *a singularity is usually a sign you are looking at a family from the wrong coordinate.*

## Audio-rate feasibility — and the dissolution

The design question that pulled this into instrument-building: can both parameters modulate sample-by-sample? Yes, by **separating the phasor from the shape function.** The phasor supplies normalized time (a ramp from 0 to 1); the shape function maps that ramp through $f$. Then:

- modulating `duration` changes the phasor increment — which, run at audio rate, *is* frequency modulation;
- modulating `curvature` changes the waveshape itself, continuously, click-free given the Taylor branch.

And here the boundary dissolves. Run $f$ once per note and it is an **envelope.** Run the identical $f$ once per cycle at audio rate and it is an **oscillator waveform** — a decaying-exponential wave whose timbre is set by curvature. The same curve, slowed down, is a sound's loudness contour; sped up, it is the sound itself. This is a fresh instance of the palace's recurring [[Frequency-Time Duality]] — rhythm and pitch, envelope and resonance, as one continuum read at different rates — which is why this small result earns an entry rather than a code comment.

Implementation notes carried from the session, for whoever builds it: the curvature = 0 Taylor branch (above); two exponentials per sample is the CPU cost, mitigable by table or polynomial approximation; large |curvature| sharpens the waveform and aliases, so PolyBLEP or oversampling applies exactly as it would to any steep oscillator.

## The curve in a synthesizer: the Moog contour

In the classic synthesizer the convex member of this family is not a design choice. It is what a capacitor does. The Minimoog's contour generator is two identical circuits on Board 2, each a voltage envelope with variable attack, decay and sustain, driving the VCA's gain or the VCF's cutoff. What that circuit does, in Atkinson's and AJH's account, is an RC charge switched by a comparator. On the gate the capacitor charges toward a reference through the attack resistor, along $1 - e^{-t/RC}$; a comparator at the peak switches in the decay resistor, and the voltage falls toward the sustain potential along $s + e^{-t/RC}$; the release is the same fall toward zero. In Atkinson's general account of the capacitor envelope, a comparison level set at the maximum would never be reached in theory, so circuit noise gets it there, and long attacks vary a little from note to note. AJH Synth's replicas, built with "identical all transistor EG circuitry", say the attack "rises in an exponential manner, i.e. more quickly at first and then more slowly as it gets towards maximum level", that the decay "again … follows an exponential curve" and the release likewise "follows an exponential rather than linear slope", and that "the very fast exponential slope" is what gives the Model D its punch.

So every Moog stage is one thing: an exponential approach to its target — the peak, the sustain level, silence. In this entry's terms, each stage is the positive-curvature member run toward a different endpoint, and the straight line at curvature 0 is the one member an RC stage never makes.

An approach never arrives, so a stage time needs a landmark. [[Synth Templates]] takes the 95 % point, three time constants ($\tau = T/3$). That convention is the project's, not Moog's; a comparator set below the maximum is the hardware's version of the same decision.

## Which way "exponential" bends

Synth talk says "exponential attack" for a slow start that rushes at the end — the $e^{x}$ shape, concave in this entry's terms; a linear ramp fed to an exponential control input makes it, as in Yamaha's OPL and OPM chips. The Moog attack is the opposite, fast first and flattening, and its decay and release bend the same way. In animation's words every Moog stage is ease-out; ease-in is the slow-start shape, and no Moog stage has it. The phrase that cannot be misread is *exponential approach to the target*.

## How the ear takes the rise

The curve decides how much of the rise the ear gets, and when. Loudon found this by ear first, matching the linear time table to the Moog one word by word on [[Synth Templates]] (2026-11-02), and said what the matching had felt like before anyone had the reason:

> "Very often the linear one feels smooth but then I feel there is a 'jump' toward the end of the rise. Like even though it is 'linear' the rise is not linear; it feels like almost two different rates, like it is going up and that at some threshold it jumps to a faster rise. Where when I listen to the Moog one the rise feels like it is a 'straight' line."

The jump belonged to the linear rise only. The explanation came afterward, from drawing both curves the way the ear counts them, in decibels.

![[heard-rise-linear-vs-moog.svg]]

The ear hears loudness in ratios ([[Logarithmic Interface Scaling]]), so a rise is heard closer to decibels than to amplitude. In decibels a linear amplitude ramp starts at minus infinity, and in a quiet room its first few percent sit under the room's floor, so the note's beginning is not heard. Its audible climb, from about 30 dB down to 6 dB down, takes the first half of the stated time; the last 6 dB take the other half; and then the ramp arrives with a corner, a slope that stops at once. So what is heard is a late emergence, a long approach, and a hard arrival. The figure offers one candidate for the jump Loudon heard near the end: the arrival, a rise that is still moving when it stops, rather than a faster rate. The Moog approach clears the floor almost at once, climbs steeply and then ever more gently, nearer the ear's own scale, and has no corner because it never arrives. No corner is what the ear calls a straight line.

Put a landmark on each curve and the numbers follow. With a floor 30 dB down and "arrived" at 6 dB down, a linear rise's audible climb runs from 0.03 T to 0.50 T, a Moog rise's from 0.01 T to 0.23 T. The audible part of a linear rise is about twice that of a Moog rise with the same stated time, so for the same heard attack the linear number should come out smaller. Loudon's matched sitting did that at the slow end: slow, long and very slow sat at 0.5 to 0.65 of the Moog number, very long at 0.88; at medium and below the two sat close, the linear sometimes longer. The same word earns a different number under each curve, which is why [[Synth Templates]] keeps one time table per curve and defines each time word under its curve. The catalog's technique template "Envelope Curves" is the same ADSR with linear against exponential stages, so a learner hears the confound before naming it.

The curves above are amplitude in decibels, a first approximation of loudness. Real loudness growth is a little less steep than decibels, and for a bass note at low level it is steeper than for a treble note, because the equal-loudness contours bunch together at low frequencies. That would make the linear ramp's late jump stronger on a bass voice than on a lead; untested.

## Cross-Domain Resonance

- **FM falls out for free.** Because `duration` controls the phasor increment, audio-rate duration modulation is literally frequency modulation — the curvature engine is an FM operator whose carrier waveshape is itself a continuously-bendable parameter. Most FM operators have a fixed sine carrier; this one's carrier morphs from convex spike to linear saw to concave swell.
- **The c-morph is a gesture.** Crossfading curvature *during* a held note is audible as a single continuous timbral motion — a candidate performance control, not just a preset shape.

## Forward Vectors

- Catalogue the dissolutions: where else does one equation flip identity under a timescale change? This entry is the second clean specimen (after the repeat-rate-becomes-pitch case in [[Frequency-Time Duality]]); a small registry of them may eventually earn a hub.
- Is the c-morph worth exposing as a first-class performance control in a [[Loudon Live]] build?

## Artifact

The teaching artifact (oscilloscope plot, envelope and audio-rate modes) was built in the 2026-05-28 chat and has not been retrieved; when it is, it belongs in this entry's bundle.

---

> *"Between the convex and the concave lies the straight line — and it is the hardest to reach, requiring a limit to arrive at it."* — from the source dialogue, 2026-05-28
>
> *"The same curve, slowed down, becomes a sound; sped up, a shape. There was never two of them."* — from the source dialogue, 2026-05-28

*Sources for the Moog contour: the Minimoog Model D service manual, § Contour Generator, Board 2 ([synfo.nl](https://www.synfo.nl/servicemanuals/Moog/MINIMOOG-D_SERVICE_MANUAL.pdf)); AJH Synth, MiniMod Dual Contour user guide ([gear4music copy](https://r2.gear4music.com/media/30/303400/download_303400.pdf)) and MiniMod DH-ADSR user manual ([ajhsynth.com](https://ajhsynth.com/pdf/MiniMod%20DH-ADSR%20User%20Manual.pdf)); Richard Atkinson, W3C public-audio list, 5 August 2014 ([lists.w3.org](https://lists.w3.org/Archives/Public/public-audio/2014JulSep/0058.html)). The 95 % landmark and the two time tables are [[Synth Templates]]'s (`workshop/vocabulary.yaml`, 2026-11-02). The matched sitting (linear `time_linear` sat by ear to sound the same as the Moog `time` table, 2026-11-02, draft 0.5; the Moog table has since moved under a decay sitting on 2026-11-03) and Loudon's words on the two rates are from the same project's session that day; the figure's curves are analytic, drawn in `Exponential Decay Curvature/heard-rise-linear-vs-moog.tex`.*
