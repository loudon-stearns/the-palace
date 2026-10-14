---
title: "Blood Compressor — scroll"
born: 2026-09-23
links:
  - target: "[[Blood Compressor]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Blood Compressor's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Blood Compressor — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Blood Compressor]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-14T11:40:30.316Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** sprout · **Steward:** cycle 8 · last ran 2026-10-14 (today)
- **Plan:** none agreed yet — the work leans on the forward vector · **a proposed revision is waiting on you**
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-14 (today) — The browser vessel's compressor now lives in an RNBO codebox. It matches the browser sample for sample, and there's a Max test patch and a Max for Live device. (`blood-compressor-018`)
- **Last commit touching this project:** 2026-10-14 `da7919f9` — steward(Blood Compressor): cycle 7 — SPINNING UP. HOME: [Blood Compressor](obsidian://open?vault=The%20Palac…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Blood Compressor is a compressor dressed as the body: threshold is the systolic pressure that triggers the reflex, ratio is how stiff the vessel wall is, attack is the baroreceptor reflex delay, release is the smooth muscle relaxing. Earlier today I fixed the browser prototype. One hand-built compressor now drives both its sound and its picture, and the threshold works and is measured. This cycle I carried that exact compressor into Max. I rewrote it as an RNBO codebox, checked it in Node against the browser version at every sample, and wrapped it two ways: a test patch where the heartbeat runs through it, and a Max for Live audio effect with a dial for each control. The maths is proven. Th…

### Open asks

- `blood-compressor-016` — proposed plan revision: a first agreed plan for Blood Compressor · posted 2026-10-14 · options: adopt · keep

### Answered, not yet consumed

_None._

### Decided

- `blood-compressor-012` — directional_redirect → GRANTED — (no option_id); notes: "I am having trouble with the interactive blood vessel, the threshold parameter doesn't seem to be working properly, lets get this diagram really working great." (2026-06-24)

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
<!-- scroll:entry id="blood-compressor-018" -->
### 2026-10-14 — cycle 8 — The browser vessel's compressor now lives in an RNBO codebox. It matches the browser sample for sample, and there's a Max test patch and a Max for Live device.
> shipped · maths checked in Node, Max files unverified · steward leans draw the vessel inside Max next

**What's new.** The compressor that drives the [browser vessel](open:Projects/Blood Compressor/stage2-vessel-prototype-v3.html) is now [blood-compressor.codebox](open:Projects/Blood Compressor/rnbo/blood-compressor.codebox). It follows the browser version line for line: 80 Hz high-pass on the detector, RMS detector, cubic soft knee, a fixed 5 ms nerve delay, then attack and release. Every control is an RNBO parameter: threshold, ratio, knee, attack, release, makeup, detector time and bypass. Besides the audio it puts out three meter signals: **pressure** (detector level in dB), **squeeze** (gain change in dB) and **baroreceptors** (1 while pressure is past the knee). Those meters will feed the vessel drawing in Max. The lub-dub test source is its own small codebox, [heartbeat.codebox](open:Projects/Blood Compressor/rnbo/heartbeat.codebox).

**Is it the same compressor?** [check-codebox.mjs](open:Projects/Blood Compressor/rnbo/check-codebox.mjs) runs the browser page's own DSP block and the codebox side by side on the same input. It uses two tests at three sample rates. The first is the heartbeat with the threshold stepping from 0 to -40 dB. The second is noise bursts with every control, bypass included, re-randomised twice a second across its full range. Against the browser code holding its delay in doubles, as RNBO does, the largest audio difference is 3e-15. That's rounding noise. The baroreceptor flag never disagrees once. Against the page exactly as written, which stores its delay line in 32-bit floats, the gap grows to 5e-9, about 166 dB down. The heartbeat codebox matches the page's heartbeat within 5e-6 over a full minute, which is about -106 dB. Every number is in [check-findings.json](open:Projects/Blood Compressor/rnbo/check-findings.json).

**Listen.** [codebox-threshold-steps.wav](open:Projects/Blood Compressor/rnbo/codebox-threshold-steps.wav) is the codebox heartbeat through the codebox compressor, with the threshold stepping 0, -10, -20, -30 and -40 dB every 4 s. Deepest squeeze per step is 0, 0.6, 5.4, 11.5 and 18.4 dB, at the new 300 ms default release. This is what the Max patch should sound like.

**The Max files.** [make_patch.py](open:Projects/Blood Compressor/rnbo/make_patch.py) writes both straight from the codebox sources. [blood-compressor-test.maxpat](open:Projects/Blood Compressor/rnbo/blood-compressor-test.maxpat): the heartbeat rnbo~ feeds the compressor rnbo~. There's a number box for each control, a live readout of pressure, squeeze and baroreceptors, and a scope showing the squeeze over time. Turn on the dac and drag the threshold down. [Blood Compressor 0.1.amxd](open:Projects/Blood Compressor/rnbo/Blood Compressor 0.1.amxd?reveal) is a Max for Live audio effect. It runs plugin~ into the same rnbo~ and out to plugout~, with eight live.dials and the meters in its device view. Drop it on an audio track.

**A call I made on my own lean.** The plan I proposed this morning, still waiting on you, says a gen~ codebox. I used an RNBO codebox instead. It's the same kind of code, but one source can also export to VST/AU, which is the plan's last move. It also reuses the checking harness Action Potential Oscillator built. I passed over gen~ because it would have meant writing the compressor a second time for the plugin.

**Artifacts:**
- [The compressor as an RNBO codebox: eight parameters, audio plus pressure, squeeze and baroreceptor outputs.](Projects/Blood Compressor/rnbo/blood-compressor.codebox)
- [The lub-dub test source as its own codebox.](Projects/Blood Compressor/rnbo/heartbeat.codebox)
- [Max test patch: heartbeat through the compressor, number boxes, live meters, squeeze scope. Unverified.](Projects/Blood Compressor/rnbo/blood-compressor-test.maxpat)
- [Max for Live audio effect, eight live.dials, mono. Unverified.](Projects/Blood Compressor/rnbo/Blood Compressor 0.1.amxd)
- [The codebox's own sound: heartbeat with the threshold stepping 0 to -40 dB every 4 s.](Projects/Blood Compressor/rnbo/codebox-threshold-steps.wav)
- [Runs the browser DSP and the codebox side by side and compares every sample.](Projects/Blood Compressor/rnbo/check-codebox.mjs)
- [Loads a codebox into Node (adapted from Action Potential Oscillator's, now with @param support).](Projects/Blood Compressor/rnbo/codebox-harness.mjs)
- [Writes the .maxpat and .amxd from the codebox sources.](Projects/Blood Compressor/rnbo/make_patch.py)
- [Every number in this post.](Projects/Blood Compressor/rnbo/check-findings.json)

_codebox vs the browser compressor, largest difference over 20 s_
| browser reference | sample rate | test | audio | squeeze dB | baroreceptor disagreements |
| --- | --- | --- | --- | --- | --- |
| delay in doubles | 48 kHz | heartbeat, threshold steps | 1.1e-16 | 3.6e-15 | 0 |
| delay in doubles | 48 kHz | noise, all controls randomised | 8.9e-16 | 7.1e-15 | 0 |
| delay in doubles | 44.1 kHz | noise, all controls randomised | 2.7e-15 | 1.4e-14 | 0 |
| delay in doubles | 96 kHz | noise, all controls randomised | 6.7e-16 | 1.1e-14 | 0 |
| page as written (32-bit delay) | 48 kHz | noise, all controls randomised | 4.8e-9 | 4.3e-8 | 0 |
| page as written (32-bit delay) | 44.1 kHz | noise, all controls randomised | 5.6e-10 | 1.1e-7 | 0 |

_Left rough:_ Neither Max file has been opened in Max or Live, so whether rnbo~ compiles the codebox and whether the live.dials load is untested. The device is mono: it sums left and right and sends the same squeezed signal to both sides, with no stereo link yet. Inside the device the meters are bare number boxes. The vessel drawing comes next.

_Next moves named:_ Draw the artery inside the device (v8ui), fed by the pressure, squeeze and baroreceptor outputs, with the same three panels as the browser. · Make the device stereo: one detector on the louder of left and right, the same squeeze on both. · Once you've opened the patch, put what broke (or didn't) on the RNBO codebox~ smith as its first Gotchas.
<sub>`blood-compressor-018` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="blood-compressor-016" -->
### 2026-10-14 — cycle 7 — Blood Compressor has no agreed plan yet. Here's one: browser reference, then Max, then the body controls, the lesson and the plugin.
> still working · vessel v3 shipped · steward leans adopt

Blood Compressor teaches compression as the body: threshold as systolic pressure, attack as the baroreceptor reflex. Today the browser vessel finally works. One hand-built compressor drives the sound and the picture, and the threshold is exact to 0.04 dB. The project has never had an agreed plan, only the entry's five stages. I'd like to adopt one, with a single change of order. The browser version becomes the reference that everything else is checked against, the way the Action Potential crowd was checked between Faust and RNBO. The Max build has to match it sample for sample before it counts. It costs one extra step, and it means a Max device I can't open still arrives with proof that its maths is right. I'll keep building toward the Max port whether or not you answer.

**Artifacts:**
- [stage2-vessel-prototype-v2.html](Projects/Blood Compressor/stage2-vessel-prototype-v2.html)
<sub>`blood-compressor-016` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="blood-compressor-015" -->
### 2026-10-14 — cycle 7 — My entry's 50-sample RMS window makes the detector wobble 5.6 dB on a 110 Hz tone. I propose 10 ms instead.
> finding · entry edit proposed, not made · steward leans adopt

**claim:** The DSP Architecture section of [Blood Compressor](obsidian://open?vault=The%20Palace&file=Blood%20Compressor) says the detector is 'RMS over a 50-sample window'. At 48 kHz that's about 1 ms, shorter than one cycle of any tone below 1 kHz. Measured with the v3 compressor on a 110 Hz tone, the detector swings 5.63 dB within each cycle at 50 samples and 0.63 dB at 10 ms. That swing would make the vessel flutter and the gain buzz. Proposed replacement for item 1: 'Detector: RMS with a ~10 ms time constant (mimics the baroreceptor's integration; short enough to catch a heartbeat's attack, long enough not to ride individual waveform cycles).' A second, smaller note for the same section: because of the 5 ms nerve delay plus the detector's rise, the fastest reflex is about 15 ms from crossing the threshold to 63% of the squeeze (measured 14.9 ms at the 5 ms attack minimum, and 71.5 ms at 60 ms attack). That's the body's reaction time made measurable, and worth a sentence in Pedagogical Framing.
**target entries:** Blood Compressor
**confidence:** high

**Artifacts:**
- [rmsRipple and reflex blocks hold the numbers.](Projects/Blood Compressor/verify/findings.json)
<sub>`blood-compressor-015` · FLAG on FLAGS</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="blood-compressor-014" -->
### 2026-10-14 — cycle 7 — The vessel's threshold works now. One hand-built compressor drives both the sound and the picture, and you can drag the systolic line itself.
> shipped · threshold fixed and measured · steward leans carry this compressor into Max next

**Why the threshold felt broken.** In the June prototype the test signal never dropped below the default threshold, so the vessel sat clamped all the time and moving the slider barely changed anything. The threshold marker was also drawn on the gain-reduction gauge, a different scale from the signal, so you never saw the signal cross it. A September draft (v2) added a pressure lane but still had two truths: the browser's built-in compressor made the sound while a separate estimate drove the picture.

**What v3 is.** Open [the vessel prototype](open:Projects/Blood Compressor/stage2-vessel-prototype-v3.html). The compressor follows the entry's design: an 80 Hz high-pass on the detector, an RMS detector, a soft knee shaped as a cubic curve, a fixed 5 ms nerve delay, then attack and release. It's written by hand and runs per sample. With the sound off, the same code runs on the same heartbeat in step with the clock, so the diagram is always live. The test source is now a real lub-dub at 72 bpm, with peaks near -7 dB and a quiet hum near -36 dB between beats, so where you set the threshold decides how much of each beat gets squeezed. Three panels. **The pressure lane** shows blood pressure in (white), pressure past the vessel (red), and overpressure shaded where the input rises above the amber systolic line, which you can drag. **The transfer curve** is next to it. **The vessel** shows the last five seconds: its width at each point is the gain at that moment, with now at the right edge. Half the gain means half the opening, so each lub and dub pinches it and you watch it relax open again. Eight baroreceptors along the wall glow amber while pressure is over and flash white at the moment of crossing.

**How I checked it.** [verify-dsp.mjs](open:Projects/Blood Compressor/verify/verify-dsp.mjs) pulls the compressor code out of the HTML page and runs it in Node. On a steady tone, the gain reduction matches the threshold curve within 0.04 dB at every threshold from 0 to -54 dB. The knee is smooth and never runs backwards. On the heartbeat, deepest squeeze goes 0, 1.4, 4.4, 8.0, 11.8, 15.9 and 20.3 dB as the threshold drops from -6 to -42 dB. Headless Chrome loaded the page and drew it at [threshold -8](open:Projects/Blood Compressor/verify/v3-threshold-8.png) and [threshold -36](open:Projects/Blood Compressor/verify/v3-threshold-36.png). At -36 the vessel never fully reopens between beats.

**Listen.** [threshold-steps.wav](open:Projects/Blood Compressor/verify/threshold-steps.wav) is 20 s of heartbeat with the threshold stepping 0, -10, -20, -30, -40 every 4 s. The beats flatten step by step, and by the end the quiet hum between beats has dropped as well, because a 350 ms release can't reopen the vessel in the 0.8 s between beats. The figure is [threshold-steps.png](open:Projects/Blood Compressor/verify/threshold-steps.png).

**Two calls I made on my own lean.** The RMS window is 10 ms, not the entry's 50 samples. I measured why and flagged it separately. I lowered the default release from 450 to 300 ms so the vessel visibly breathes: it opens about 4.6 dB between beats instead of 4.1.

**Artifacts:**
- [The vessel, v3: one compressor drives the sound and the picture. Drag the amber line. It runs with the sound off.](Projects/Blood Compressor/stage2-vessel-prototype-v3.html)
- [20 s of heartbeat, threshold stepping 0 → -40 dB every 4 s.](Projects/Blood Compressor/verify/threshold-steps.wav)
- [Pressure in, threshold and pressure out above; vessel squeeze below, for the same 20 s.](Projects/Blood Compressor/verify/threshold-steps.png)
- [The same figure as vector.](Projects/Blood Compressor/verify/threshold-steps.svg)
- [Headless Chrome screenshot at threshold -8 dB: the vessel barely moves.](Projects/Blood Compressor/verify/v3-threshold-8.png)
- [Headless Chrome screenshot at threshold -36 dB: deep pinches, never fully open.](Projects/Blood Compressor/verify/v3-threshold-36.png)
- [Runs the page's own compressor code in Node: threshold accuracy, knee, reflex timing, RMS ripple, audition and figure.](Projects/Blood Compressor/verify/verify-dsp.mjs)
- [How far the vessel reopens between beats at five release times.](Projects/Blood Compressor/verify/breathing.mjs)
- [Every number in this post.](Projects/Blood Compressor/verify/findings.json)
- [Breathing depth per release time.](Projects/Blood Compressor/verify/breathing.json)

_The threshold on the heartbeat · ratio 4:1, knee 6 dB, attack 60 ms, release 450 ms_
| threshold | share of time over the line | deepest squeeze | what the vessel does |
| --- | --- | --- | --- |
| -6 dB | 0% | 0 dB | wide open |
| -12 dB | 7% | 1.4 dB | lub tips just over the line, a flicker |
| -18 dB | 21% | 4.4 dB | both beats pinch it |
| -24 dB | 35% | 8.0 dB | clear pulse, never quite fully open |
| -30 dB | 52% | 11.8 dB | deep pinches, slow recovery |
| -36 dB | 95% | 15.9 dB | constricted almost all the time |
| -42 dB | 100% | 20.3 dB | clamped tight, even the hum |

_Left rough:_ I haven't heard the audio path in a live browser. The sound runs on the old ScriptProcessor, which can click when the tab is busy; an AudioWorklet is the cleaner home. The release-curve shape and the three extra body controls (sympathetic activation, heart-rate variability, vessel age) aren't in yet. v1 and v2 are still in the folder, and v3 replaces both.

_Next moves named:_ Carry this exact compressor into a gen~ codebox inside a Max for Live device, check it sample for sample against the JS version the way Action Potential Oscillator did, and hand you a demo marked unverified until you open it. · Add the release-curve shape and the three body controls to the browser vessel, so each one has a picture before it has a knob in Max.
<sub>`blood-compressor-014` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="blood-compressor-012" -->
### 2026-06-23 — cycle 5 — The vessel prototype shipped — three instinct calls I made; redirect me if any read wrong.
> non-blocking · I keep moving while you decide

Stage 2 starter is live (see blood-compressor-011). Three calls I made by lean rather than by asking: (1) I used the browser's built-in DynamicsCompressorNode instead of authoring a custom feed-forward detector — fast to ship, but the 'biology-inspired choices' in the entry (RMS detector, soft-knee cubic, minimum 5ms attack) are not yet in the DSP path; the GUI claims them, the audio doesn't. (2) The vessel narrows symmetrically top and bottom; the spec implies an asymmetric inner-wall constriction would read more like real vasoconstriction, but symmetric was simpler and the gauge already carries the asymmetric data. (3) No heart-pulse audio (the 'should it be a feature' open question from the entry). Default-off felt right for a prototype. None of this blocks my next cycle — I lean toward authoring the custom DSP next so the audio matches the mythology. Tell me if a different fork wants attention first.

**Artifacts:**
- [vis05-baroreceptors-firing.html](Projects/Blood Compressor/vis05-baroreceptors-firing.html)
<sub>`blood-compressor-012` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="blood-compressor-011" -->
### 2026-06-23 — cycle 5 — Stage 2 vessel prototype is playable — Web Audio compressor wired to a narrowing-artery GUI.
> shipped · spec-faithful palette · pending: ears on the seed (010)

A single self-contained HTML that runs a real DynamicsCompressorNode with the five canonical params mapped to cardiovascular variables, drives the wobbling-blood vessel narrowing from live compressor.reduction, and fires the three baroreceptor clusters in amber when GR exceeds 0.5 dB. Source toggles between a sine-pulse (clean compression read) and noise-bursts (transient handling). Palette per the visuals spec — no greens, no chrome. This is the device the forward_vector named.

**Artifacts:**
- [drag the threshold down and watch the vessel cinch; the baroreceptors light at the moment of constriction.](Projects/Blood Compressor/stage2-vessel-prototype.html)
<sub>`blood-compressor-011` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
