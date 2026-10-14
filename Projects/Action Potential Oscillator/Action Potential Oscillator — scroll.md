---
title: "Action Potential Oscillator — scroll"
born: 2026-09-23
links:
  - target: "[[Action Potential Oscillator]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Action Potential Oscillator's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Action Potential Oscillator — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Action Potential Oscillator]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-14T11:12:47.290Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 8 · last ran 2026-10-14 (today)
- **Plan:** agreed 2026-09-25 (18 days ago) · 5 made things since
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-14 (today) — My entry's guess that 'spike shape averages out in the crowd' is half wrong. I measured it and propose a corrected paragraph. (`apo-steward-018`)
- **Last commit touching this project:** 2026-10-14 `6089d080` — steward(Action Potential Oscillator): cycle 7 — SPINNING UP. HOME: [Action Potential Oscillator](obsidian://open?vault=…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Action Potential Oscillator builds a synth from a neuron's biology. The single neuron has been playable in Gen~ since March. Today the crowd of 32 coupled neurons compiled in Faust and locked into a tone, and I wrote a hand-made RNBO version that matches it sample for sample. The plan's next step is carrying the instrument to the Eventide H90 through RNBO, and I'm still waiting on whether the crowd or the single neuron goes first. Meanwhile I ran the experiment the project has always pointed at: where does the neuron's biological detail stop mattering to the sound? I tried four spike shapes in the same crowd. The detail stops mattering to how the crowd behaves, but not to how it sounds.

### Open asks

- `apo-steward-012` — directional_decision · posted 2026-10-14 · options: CROWD-FIRST · NEURON-FIRST · STAY-IN-FAUST

### Answered, not yet consumed

_None._

### Decided

- `apo-steward-009` — directional_decision → GRANTED — option_id=FAUST-FIRST (2026-06-25)

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** An instrument where a neuron's biology is the synthesis, every knob traced to a real mechanism. The single neuron is behind it: four playable Gen~ oscillators, from a capacitor's sawtooth to a full spike with its refractory growl, built in March 2026 and specified in [[neural_oscillator_dev_plan|the Gen~ development plan]]. What lies ahead is the crowd, many slightly different neurons coupled so that the coupling itself becomes timbre. A Python render of 32 coupled neurons (June 2026) let the project hear that for the first time; the Faust engine meant to carry it is drafted but does not compile yet.

**The moves ahead**

1. **Get the Faust crowd to compile and sound.** Make `neuropulse.dsp` compile on the Mac, render a slow sweep of the coupling from none to full, and set it beside the Python render to hear whether the two agree. This is the step Loudon chose on 2026-06-25; `neuropulse-mac-compile-handoff.md` in the bundle lists what to check first.
2. **Put it on hardware.** Carry the instrument through RNBO to the Eventide H90, so it can be played away from a computer. Which one travels first, the single neuron or the crowd, is still Loudon's call: the forward vector he confirmed on 2026-06-03 names the single neuron, and the crowd became the work after it.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="apo-steward-018" -->
### 2026-10-14 — cycle 8 — My entry's guess that 'spike shape averages out in the crowd' is half wrong. I measured it and propose a corrected paragraph.
> finding · entry edit proposed, not made · steward leans adopt

**target entries:** Action Potential Oscillator
**claim:** The Population Dynamics section of [Action Potential Oscillator](obsidian://open?vault=The%20Palace&file=Action%20Potential%20Oscillator) guesses that a spike's shape matters for one neuron but averages out in a population. Today's experiment (four spike shapes, 32 neurons, 19 coupling values) splits that guess in two. When the crowd locks barely depends on the spike's tail: half-lock at coupling 0.0039 with the undershoot and 0.0033 without. Spike width matters only through the charge each spike hands its neighbours. How the crowd sounds keeps the shape: each shape's spectral shape is the same scattered or locked (correlation 0.99), and the four shapes stay 9.5–14 dB apart. Locking also darkens every shape, with the spectral centroid falling 35–58%, so coupling works like a lowpass. Proposed replacement for the hypothesis sentence: 'Spike shape stops mattering to the crowd's behaviour, but not to its sound. When the population locks is set by coupling, heterogeneity and the charge each spike delivers. The spike's shape survives as the colour the crowd plays in, and the tightness of the lock darkens that colour.' Evidence: [neuropulse-spike-shapes.wav](open:Projects/Action Potential Oscillator/neuropulse-spike-shapes.wav), [spike-shape-findings.png](open:Projects/Action Potential Oscillator/spike-shape-findings.png).
**confidence:** high for this model; untested against full Hodgkin-Huxley gating

**Artifacts:**
- [The three panels behind the claim.](Projects/Action Potential Oscillator/spike-shape-findings.png)
- [Hear each shape keep its colour through the lock.](Projects/Action Potential Oscillator/neuropulse-spike-shapes.wav)
<sub>`apo-steward-018` · FLAG on FLAGS</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="apo-steward-017" -->
### 2026-10-14 — cycle 8 — I tested four spike shapes in the crowd. The spike's tail barely changes when the crowd locks, but every shape keeps its own colour in the sound.
> shipped · spike-shape question answered · steward leans crowd first, then put the locked pitch back on the dialed note

**The four shapes.** (1) The full Stage-4 spike: 1 ms, with a ringing undershoot. (2) The same spike with no undershoot. (3) A bare click, 0.06 ms, which is just integrate-and-fire with a reset. (4) A slow 3 ms spike. For each one I swept the coupling over 19 values. Each run starts with the crowd free for 1 s, then turns coupling on. Synchrony is the true Kuramoto order parameter, worked out from each neuron's own spike times, so it isn't fooled by how wide the pulse is.

**What the crowd does.** The undershoot hardly matters: the full spike reaches half-lock at K≈0.0039, the flat one at 0.0033. Width matters only through the charge a spike hands its neighbours. The click needs about 9 times the coupling (0.035). Per unit of charge, short pulses lock most easily: the click needs 0.035, the 1 ms spike 0.059 and the 3 ms spike 0.139. So the spike's tail does stop mattering here, which is what the entry guessed.

**What you hear.** This is where the entry's guess was wrong. Each shape's spectral shape is almost the same when the crowd is scattered as when it's locked (correlation 0.99). The four shapes stay about 9.5 dB apart when scattered and 14 dB apart when locked. The crowd doesn't average the spike away. The spike sets the colour the crowd plays in. And the coupling has its own sound: locking darkens every shape. The spectral centroid falls from 874 to 496 Hz for the full spike and from 4256 to 2808 Hz for the click, because the low harmonics add up in step while the highs stay slightly smeared. **The tighter the lock, the darker the tone, so coupling acts as a lowpass.** That's 'coupling becomes timbre' as a measurement.

**Listen.** In [neuropulse-spike-shapes.wav](open:Projects/Action Potential Oscillator/neuropulse-spike-shapes.wav), each shape plays 2.5 s scattered, then 3 s locked (coupling set to 3 times its half-lock value), all at matched loudness. Full spike 0–5.5 s (locks at 2.5), no undershoot 5.9–11.4 (locks at 8.4), click 11.8–17.3 (locks at 14.3), slow spike 17.7–23.2 (locks at 20.2). The figure is [spike-shape-findings.png](open:Projects/Action Potential Oscillator/spike-shape-findings.png).

**The pitch pull, confirmed.** Last cycle I guessed that the 116 Hz lock comes from the fastest neuron. It does, exactly: at 5%, 10% and 20% rate spread, the locked crowd plays its fastest member's own solo pitch to within 0.01 Hz (116.2, 121.8, 132.6 Hz, against 110 dialed). Before the lock, coupling only adds drive, so the pitch also creeps up slowly.

**A bug fixed on the way.** A spike whose length isn't a whole number of samples overshot its peak and its floor. The click fell so far below its floor that it spent about 170 extra samples recovering, and its pitch dropped from 110 to 78 Hz. Both `neuropulse.dsp` (now v0.2.1) and the RNBO codebox (v0.1.1) now clamp the spike. I re-checked them against each other: the largest difference is 4e-8 per sample, and the synchrony outputs are identical.

**Artifacts:**
- [Four spike shapes, each scattered then locked, at matched loudness: full, no undershoot, click, slow.](Projects/Action Potential Oscillator/neuropulse-spike-shapes.wav)
- [Lock curves against coupling and against charge delivered, plus spectral shape scattered vs. locked.](Projects/Action Potential Oscillator/spike-shape-findings.png)
- [Faust harness: every spike-shape control on the command line, plus each neuron's own spike flag.](Projects/Action Potential Oscillator/spike-shape/shape_render.dsp)
- [Lock-curve sweep: 4 shapes × 19 couplings, with a Kuramoto order parameter from spike times.](Projects/Action Potential Oscillator/spike-shape/sweep.py)
- [Renders the audition, the spectra, the pitch-pull test and the figure.](Projects/Action Potential Oscillator/spike-shape/analysis.py)
- [Offline render wrapper, copied from faust-render.](Projects/Action Potential Oscillator/spike-shape/arch.cpp)
- [Raw lock-curve data.](Projects/Action Potential Oscillator/spike-shape/sweep.json)
- [Every number quoted in this post.](Projects/Action Potential Oscillator/spike-shape/findings.json)
- [v0.2.1: spike clamped at its peak and floor.](Projects/Action Potential Oscillator/neuropulse.dsp)
- [v0.1.1: the same clamp, still matches Faust within 4e-8.](Projects/Action Potential Oscillator/rnbo/neuropulse-crowd.codebox)

_Four spike shapes in a crowd of 32 · K½ = coupling at half-lock · charge = K½ × pulse length_
| shape | K½ | charge at K½ | locked pitch | brightness scattered → locked |
| --- | --- | --- | --- | --- |
| full 1 ms, ringing undershoot | 0.0039 | 0.059 | 116.2 Hz | 874 → 496 Hz |
| same spike, no undershoot | 0.0033 | 0.050 | 113.7 Hz | 923 → 470 Hz |
| bare click 0.06 ms | 0.035 | 0.035 | 114.0 Hz | 4256 → 2808 Hz |
| slow spike 3 ms | 0.0032 | 0.139 | 115.9 Hz | 595 → 253 Hz |

_Left rough:_ This is one crowd at one pitch with excitatory coupling. I haven't tried full Hodgkin-Huxley gating, so 'the tail doesn't matter' applies to this model's shapes, not real channel kinetics. Every run starts with all neurons together, then a 1 s free stretch, so I can't rule out some lock memory. Brightness is a single centroid number. Nobody has listened yet, and the codebox clamp is still unopened in Max.

_Next moves named:_ Put the locked pitch back on the dialed note: shift the spread so the fastest neuron sits at the frequency inlet, in both Faust and the codebox. Right now 20% spread plays 132.6 Hz when you ask for 110. · Turn 'coupling is a lowpass' into a control: measure brightness against synchrony across the coupling range, and decide whether the synchrony output should drive a filter or just be heard. · Once Loudon answers crowd-or-neuron, size the crowd for the H90.
<sub>`apo-steward-017` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="apo-steward-015" -->
### 2026-10-14 — cycle 7 — I wrote the crowd's RNBO version by hand, with every control a signal inlet. It matches the Faust crowd sample for sample, and a Max patch holds it.
> shipped · the crowd's code is ready for RNBO, not yet opened in Max · steward leans crowd first

**Why I wrote it by hand.** Faust's automatic export (`rnbo/neuropulse.codebox`) is 928 lines of generated code. It has only 16 neurons, and every control is a fixed setting, not a signal jack. This project's rule is that every knob is a signal inlet you can patch an LFO or envelope into. The new file, [neuropulse-crowd.codebox](open:Projects/Action Potential Oscillator/rnbo/neuropulse-crowd.codebox), is about 150 lines. It uses the same maths as the Faust version, with one array slot per neuron. It has 8 inlets: frequency, coupling, spread, leak time, spike length, undershoot depth, recovery damping and refractory time. It has two outputs: the crowd's voice, and a new one, **synchrony**, which is the share of the crowd spiking right now. You can use it as a modulation signal (0 to 1).

**How I checked it without Max.** I can't open Max, so I wrote a small Node harness (`rnbo/codebox-harness.mjs`). It runs the codebox text itself, line for line, with stand-ins for RNBO's built-in functions. I rendered the same 30-second coupling sweep as last cycle's Faust render, with Faust built in double precision as RNBO runs. The audio differs by at most 6e-8 over 1.44 million samples, and the synchrony output is identical. Against last cycle's single-precision Faust build, the two drift apart after 9 ms because the system is chaotic, but the lock and release come out the same.

**What the signal inlets buy you.** [neuropulse-codebox-phrase.wav](open:Projects/Action Potential Oscillator/neuropulse-codebox-phrase.wav) is 24 s of a four-note phrase, A2 C3 E3 D3. Coupling breathes on a 0.2 Hz sine while the spread between neurons slowly widens. Early breaths lock fully. By the last ones, the crowd only reaches about a third of the way to a lock, because a wider spread needs more coupling. You can see it in [codebox-vs-faust.png](open:Projects/Action Potential Oscillator/codebox-vs-faust.png): harmonic lines appear on the breaths and smear between them. The synchrony curve trails the coupling a little on the way up.

**The Max patch.** [neuropulse-crowd.maxpat](open:Projects/Action Potential Oscillator/rnbo/neuropulse-crowd.maxpat) is written by hand (`make_maxpat.py`), with no py2max. Inside is an rnbo~ with in~ 1 to 8, the codebox, and out~ 1 and 2. Outside, each inlet has a number box feeding a sig~ with its default value, then a gain stage, a DAC, and a synchrony meter. A 0.2 Hz cycle~ sits beside the coupling inlet, unwired, ready to make the coupling breathe. To try it: open the patch, turn on audio, and raise coupling past about 0.005.

**Artifacts:**
- [24 s phrase: four notes, coupling breathing, spread widening until the crowd can't lock.](Projects/Action Potential Oscillator/neuropulse-codebox-phrase.wav)
- [Top: codebox and Faust synchrony on top of each other. Middle and bottom: the phrase's spectrogram and synchrony.](Projects/Action Potential Oscillator/codebox-vs-faust.png)
- [The hand-written RNBO codebox: 32 neurons, 8 signal inlets, a voice output and a synchrony output.](Projects/Action Potential Oscillator/rnbo/neuropulse-crowd.codebox)
- [Max patch with the codebox inside an rnbo~ and sig~ defaults on every inlet. Not yet opened in Max.](Projects/Action Potential Oscillator/rnbo/neuropulse-crowd.maxpat)
- [Runs the codebox text in Node so its maths can be checked without Max.](Projects/Action Potential Oscillator/rnbo/codebox-harness.mjs)
- [Compares the codebox with Faust, then renders the phrase and the figure.](Projects/Action Potential Oscillator/rnbo/check_codebox.py)
- [Writes the Max patch by hand from the codebox source.](Projects/Action Potential Oscillator/rnbo/make_maxpat.py)

_Hand-written RNBO codebox vs. the Faust crowd · same 30 s sweep, 32 neurons · 'together' = largest share spiking in the same instant_
| seconds | codebox together | Faust together | largest audio difference |
| --- | --- | --- | --- |
| 0–3 | 0.24 | 0.24 | ≤ 6e-8 across the whole render |
| 6–9 | 0.72 | 0.72 | — |
| 13–17 | 0.96 | 0.96 | — |
| 21–24 | 0.73 | 0.73 | — |
| 27–30 | 0.22 | 0.22 | — |

_Left rough:_ Nobody has opened the patch or the codebox in Max. I built the box layout from RNBO 1.4 help patches, but Max may reject some of it, and the codebox may use syntax RNBO doesn't accept, like the top-level const or the ternary. CPU is unmeasured: every sample runs 32 pow() calls. The first note of the phrase shows full synchrony only because every neuron starts from rest at the same moment. I still don't know whether the H90 can actually load an RNBO export.

_Next moves named:_ Once the patch has been opened in Max: fix whatever it rejects, record each failure on the RNBO codebox~ smith page, and measure CPU. If it's heavy, recompute each neuron's constants only when an input changes. · Find out what the Eventide H90 actually accepts from RNBO and what its CPU limit is, and size the crowd to fit (32 neurons, or 16 if it must shrink).
<sub>`apo-steward-015` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="apo-steward-012" -->
### 2026-10-14 — cycle 6 — Should the crowd or the single neuron go to the H90 first?
> still working · Faust crowd compiles and locks · steward leans CROWD-FIRST

Quick catch-up: this project is a synth built from a neuron's biology. The single neuron has been playable in Gen~ since March. This cycle the Faust crowd of coupled neurons finally compiled, and you can hear it lock into a tone in [the sweep](open:Projects/Action Potential Oscillator/neuropulse-faust-sweep.wav). The comparison picture is [faust-vs-python.png](open:Projects/Action Potential Oscillator/faust-vs-python.png). The plan's next step is getting the instrument onto the Eventide H90 through RNBO, and it leaves to you which one goes first. I lean crowd. Faust already produced an RNBO codebox for it, so it's the shorter path, and the crowd is where the new sound is. The single neuron is the cleaner teaching piece, but its Gen~ code would have to be ported by hand. I'll keep going on the crowd unless you redirect.

**Artifacts:**
- [The crowd locking and unlocking: the thing that would travel.](Projects/Action Potential Oscillator/neuropulse-faust-sweep.wav)
- [Faust vs. Python: only the Faust crowd actually locks.](Projects/Action Potential Oscillator/faust-vs-python.png)
<sub>`apo-steward-012` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="apo-steward-011" -->
### 2026-10-14 — cycle 6 — The Faust crowd compiles at last. In the 30 s sweep, 32 neurons snap into a clean tone and let go. The June Python audition never locked.
> shipped · first step of the plan done · steward leans the crowd goes to the H90 first

**Why it never compiled.** Faust 2.88 is on the Mac now, and the June file died with 'stack overflow in eval'. Each neuron's voltage, phase, timer and recovery velocity were four separate feedback loops that referred to each other in a circle. The three fixes the June handoff note describes never landed in the file. Its spread formula was also wrong, so the neurons weren't really varied.

**What changed (v0.2).** Each neuron is now one feedback loop over its whole state: charge, then spike rise, then spike fall, then a damped recovery from the undershoot. The crowd adds up its voltages and its spike signals in a single step, so the splitting stage is gone. Only the crowd's average spike signal goes back into each neuron's drive, scaled by coupling K. It compiles in 0.1 s. A small offline renderer is in `faust-render/`.

**What the sweep shows.** 32 neurons, coupling rising from 0 to 0.016 and back to 0 over 30 s, chosen to match the June render's shape. Listen to [neuropulse-faust-sweep.wav](open:Projects/Action Potential Oscillator/neuropulse-faust-sweep.wav). For the first 4.7 s you hear a buzzy smear. Then the crowd snaps into a clean harmonic tone, holds, and lets go at about 25.7 s. It locks and unlocks at nearly the same coupling (about 0.005 going up, 0.0046 coming down), so there's barely any memory in the switch. The locked tone sits near 116 Hz, not the 110 Hz you dial in. My guess is that the faster neurons pull the crowd up to their pace. I haven't tested that.

**The comparison is the real news.** In [faust-vs-python.png](open:Projects/Action Potential Oscillator/faust-vs-python.png), the Faust spectrogram turns into clean harmonic lines while it's locked. The June Python audition is broadband noise from start to finish. Its coupling was probably too weak to ever pull the crowd together. So the two don't agree. The Faust render is the first time this project has made the locking you can hear.

**A bonus step toward the H90.** `faust2rnbo` turned the crowd into an RNBO codebox (`rnbo/neuropulse.codebox`, 928 lines). Its Max patch wrapper failed because the Python package py2max is missing. Nobody has opened it in Max yet.

**Artifacts:**
- [30 s, 32 neurons, coupling rising and falling: the lock arrives near 4.7 s and lets go near 25.7 s.](Projects/Action Potential Oscillator/neuropulse-faust-sweep.wav)
- [Share of neurons firing together vs. coupling, plus spectrograms of the Faust render and the June Python one.](Projects/Action Potential Oscillator/faust-vs-python.png)
- [NeuroPulse v0.2: one feedback loop per neuron, crowd adds up in a single step, compiles on Faust 2.88.](Projects/Action Potential Oscillator/neuropulse.dsp)
- [Render wrapper: drives the coupling with a sweep and puts out audio, the average spike signal, and K.](Projects/Action Potential Oscillator/faust-render/neuropulse_render.dsp)
- [Small offline C++ wrapper that writes raw frames, with parameters set from the command line.](Projects/Action Potential Oscillator/faust-render/arch.cpp)
- [Renders the sweep, writes the WAV, draws the comparison figure.](Projects/Action Potential Oscillator/faust-render/render_sweep.py)
- [RNBO codebox generated by faust2rnbo. Unverified: not yet opened in Max.](Projects/Action Potential Oscillator/rnbo/neuropulse.codebox)
- [June handoff, now marked closed with what actually happened.](Projects/Action Potential Oscillator/neuropulse-mac-compile-handoff.md)

_Faust crowd, 32 neurons · 'together' = largest share of the crowd spiking at the same instant_
| seconds | coupling K | together | what you hear |
| --- | --- | --- | --- |
| 0–3 | 0.0016 | 0.25 | buzzy smear |
| 6–9 | 0.0080 | 0.72 | tone forming, still rough |
| 13–17 | 0.0149 | 0.94 | clean locked tone near 116 Hz |
| 21–24 | 0.0080 | 0.74 | same as on the way up |
| 27–30 | 0.0016 | 0.23 | back to smear |

_Left rough:_ The RNBO codebox is unverified: no Max patch around it (py2max is missing), and it uses fixed parameters instead of the signal-rate inputs the design calls for. The 116 Hz pitch pull is a guess, not tested. I haven't yet measured where spike shape stops mattering to the sound. The June signal-flow SVG is now out of date.

_Next moves named:_ Wrap the codebox in a Max patch (install py2max or patch by hand), switch its fixed parameters to signal-rate inputs, and hand you a demo with what to open and what to listen for. · Find where spike shape stops mattering: swap the shaped spike for a bare pulse at the same coupling and compare the locked tones. · Test the pitch pull: widen the rate spread and see whether the locked pitch follows the fastest neuron.
<sub>`apo-steward-011` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-25T20-55-14-04-00" -->
### 2026-09-25 — Plan agreed: drawn from the board's grants

Loudon asked for a plan on 2026-09-25. Neither the entry's Four Stages (the built instrument's design) nor the Gen~ development plan (its build spec) held moves still ahead; the moves come from his grants on the board — Faust for the crowd (apo-steward-002), compile first (apo-steward-004), compile, render and compare against the Python render (apo-steward-009, 2026-06-25) — and the forward vector he confirmed on 2026-06-03, which names the H90 via RNBO. The Faust engine does not compile yet (stack overflow in eval, checked 2026-09-25).
<sub>`plan-2026-09-25T20-55-14-04-00` · plan agreed · agreed 2026-09-25T20:55:14-04:00 · written by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="apo-steward-009" -->
### 2026-06-23 — cycle 4 — You have one population audition. Where should I take the next cycle — Faust port, deeper Python, or H90/RNBO?
> still working · audition shipped · steward leans FAUST-FIRST (closes the open Mac-compile handoff)

Recap: Action Potential Oscillator's Stages 1–4 (single neuron, Gen~) shipped in March. Cycle 3 wrote neuropulse.dsp (a Faust population draft) and a Mac-compile handoff, because the Linux sandbox couldn't run Faust. This Mac session does not have Faust installed either, so I sidestepped: I built the population layer in Python and rendered a 30s audition (see apo-steward-008). The forward_vector's question — 'where does Hodgkin-Huxley detail stop mattering sonically' — is now testable by ear for the first time. Three reasonable next cycles, none obviously dominant: (1) install Faust + compile neuropulse.dsp so the production path is unblocked; (2) push the Python further (HH gating, raster plot, chimera states) since iteration is fast there; (3) jump to the H90 port via RNBO so the instrument becomes playable on hardware. My lean is (1) because cycle 3 explicitly left that handoff open, but if your ear says the Python sounds wrong I should fix the audition before chasing the port.

**Artifacts:**
- [neuropulse-population-audition.html](Projects/Action Potential Oscillator/neuropulse-population-audition.html)
- [neuropulse-signalflow-fixed.svg](Projects/Action Potential Oscillator/neuropulse-signalflow-fixed.svg)
<sub>`apo-steward-009` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="apo-steward-008" -->
### 2026-06-23 — cycle 4 — Population-dynamics audition rendered: 32 coupled LIF neurons, K swept 0→1→0 over 30s.
> Stages 1–4 already shipped · this is the forward-vector's named next output (N-neuron Kuramoto-coupled population, where coupling itself becomes timbre) · rendered in Python (Mac sandbox has no Faust yet)

The forward_vector reaches past the single-neuron proof toward 'a population-dynamics instrument of N Kuramoto-coupled neurons, where individual spike shape averages out and coupling itself becomes timbre.' So I built it. Thirty seconds of N=32 leaky integrate-and-fire neurons (mean τ=12ms, 18% heterogeneity, mean rate ~110 Hz, 10% spread), coupled via a mean-field Kuramoto term that nudges each cell's effective drive by K·sin(mean_φ − φᵢ). K rides a slow triangle 0 → 1 → 0 across the file. The audible payoff lives in K ∈ [0.05, 0.3]: the incoherent crowd should snap into a phase-locked drone, then unlock as K falls. Each spike is a shaped AP (fast Na rise + slower K fall + hyperpolarization tail), so the timbre lives in the spike shape *and* in how many neurons fire together. This is a Python audition, not the Faust port — but it's the first time the project has heard its own population layer.

**Artifacts:**
- [N=32 coupled LIF neurons, K swept 0→1→0 over 30s — listen for the lock-in around K ∈ [0.05, 0.3].](Projects/Action Potential Oscillator/neuropulse-population-audition.wav)
- [The render script — every parameter (N, τ-spread, K curve, spike shape) is one constant at the top.](Projects/Action Potential Oscillator/population_audition.py)
<sub>`apo-steward-008` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
