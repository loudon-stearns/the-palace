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

> _Regenerated 2026-10-14T11:44:41.946Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** sprout · **Steward:** cycle 9 · last ran 2026-10-14 (today)
- **Plan:** none agreed yet — the work leans on the forward vector · **a proposed revision is waiting on you**
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-14 (today) — The Max for Live device now draws the beating vessel beside its dials, with a draggable systolic line, and the compressor is stereo-linked. (`blood-compressor-020`)
- **Last commit touching this project:** 2026-10-14 `df766a0d` — steward(Blood Compressor): cycle 8 — SPINNING UP. HOME: [Blood Compressor](obsidian://open?vault=The%20Palac…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Blood Compressor is a compressor dressed as the body. Threshold is the systolic pressure that triggers the reflex, ratio is how stiff the vessel wall is, attack is the baroreceptor reflex delay, and release is the smooth muscle relaxing. Earlier today the browser vessel was fixed: one hand-built compressor drives both its sound and its picture. That compressor was then carried into an RNBO codebox that matches the browser sample for sample. This cycle the picture followed it into Max. The device, Blood Compressor 0.2, has its eight dials on the left and the same three panels as the browser on the right: the pressure lane with the amber systolic line you can drag, the in-to-out curve, and th…

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
<!-- scroll:entry id="blood-compressor-020" -->
### 2026-10-14 — cycle 9 — The Max for Live device now draws the beating vessel beside its dials, with a draggable systolic line, and the compressor is stereo-linked.
> shipped · maths and drawing proven in Node · Max files unopened · steward leans open-the-device-next

**The vessel in the device.** [blood-vessel.js](open:Projects/Blood Compressor/rnbo/blood-vessel.js) is a v8ui drawing, 380 by 160. It redraws the browser's three panels with Max's own drawing calls. The pressure lane shows blood pressure in (white), pressure past the vessel (red), the overpressure shaded, and the amber systolic line. Drag that line and it turns the threshold dial. The small curve panel puts a white dot where the blood is right now. Along the bottom is the artery: its opening is the gain over the last five seconds, and eight baroreceptors in the wall light amber while the pressure is over and flash white at the crossing. It uses only fourteen basic drawing calls, with no gradients and no dash patterns, so the same file should also load in the older jsui.

**How I checked it without Max.** [check-vessel.mjs](open:Projects/Blood Compressor/rnbo/check-vessel.mjs) runs the drawing file in Node against a stand-in for Max's drawing engine that records every call into an SVG, and it throws on any call it doesn't know. It feeds the drawing the way the device does: the codebox runs on the heartbeat, and every 33 ms three snapshot~ objects read pressure, squeeze and the baroreceptor flag. The two frames above show what came out. At **-20 dB** the vessel breathes gently and the deepest squeeze is 5.4 dB. At **-36 dB** it pinches on every lub and dub, down to 15.5 dB. Sampling every 33 ms misses almost nothing: the deepest squeeze the vessel saw was within 0.01 dB of the true one. Dragging the line returns the threshold exactly at 0, -12, -20.5, -36, -54 and -60 dB, and a click outside the lane changes nothing. The curve matches the browser page's curve to 0 dB across 48 combinations of threshold, ratio and knee. Numbers: [vessel-findings.json](open:Projects/Blood Compressor/rnbo/vessel-findings.json).

**Stereo link.** [blood-compressor.codebox](open:Projects/Blood Compressor/rnbo/blood-compressor.codebox) v0.2 takes left and right. Each sample, the detector uses the larger of the two high-passed squares, and the same squeeze goes to both sides, so the stereo image holds still. With the same signal on both inputs it is the mono compressor exactly: every earlier check still passes at 3e-15 or below. I tested it with the heartbeat on one side and the same heartbeat 12 dB down on the other, then swapped them. The squeeze followed the louder side with zero difference from mono, and the two sides' gains agreed to 2e-16. See [check-findings.json](open:Projects/Blood Compressor/rnbo/check-findings.json).

**What to open.** [Blood Compressor 0.2.amxd](open:Projects/Blood Compressor/rnbo/Blood Compressor 0.2.amxd?reveal): drop it on an audio track and drag the amber line down. If you want to try it in Max first, [blood-compressor-test.maxpat](open:Projects/Blood Compressor/rnbo/blood-compressor-test.maxpat) has the heartbeat feeding both sides, number boxes for every control, and the vessel. Turn on the dac. Both files are written by [make_patch.py](open:Projects/Blood Compressor/rnbo/make_patch.py) and pass a wiring check: every patch cord lands on a real inlet and outlet.

**Passed over.** I could have drawn the vessel in jsui with gradients to match the browser exactly. I kept to the calls both engines share, because a drawing that loads beats a prettier one that might not. A two-tone lumen stands in for the gradient.

**Artifacts:**
- [the device's vessel drawing at -36 dB: pinching on every beat, squeeze down to 15.5 dB (rendered in Node from blood-vessel.js)](Projects/Blood Compressor/rnbo/vessel-threshold-36.png)
- [the same drawing at -20 dB: a gentle breath, 5.4 dB at its deepest](Projects/Blood Compressor/rnbo/vessel-threshold-20.png)
- [the v8ui drawing: three panels and the draggable systolic line](Projects/Blood Compressor/rnbo/blood-vessel.js)
- [the Max for Live audio effect, stereo-linked, dials plus vessel (unopened)](Projects/Blood Compressor/rnbo/Blood Compressor 0.2.amxd)
- [the Max test patch: heartbeat into both sides, vessel drawn live (unopened)](Projects/Blood Compressor/rnbo/blood-compressor-test.maxpat)
- [the compressor, v0.2: stereo link, mono-identical](Projects/Blood Compressor/rnbo/blood-compressor.codebox)
- [writes both Max files from the codebox sources](Projects/Blood Compressor/rnbo/make_patch.py)
- [runs the drawing in Node against a mock of Max's drawing engine](Projects/Blood Compressor/rnbo/check-vessel.mjs)
- [drag round trip, curve match, calls used, squeeze seen vs true](Projects/Blood Compressor/rnbo/vessel-findings.json)
- [the -36 dB frame as the mock recorded it](Projects/Blood Compressor/rnbo/vessel-threshold-36.svg)
- [the -20 dB frame as the mock recorded it](Projects/Blood Compressor/rnbo/vessel-threshold-20.svg)
- [the Node shim, now two inputs and five outputs](Projects/Blood Compressor/rnbo/codebox-harness.mjs)
- [browser vs codebox sample check, plus the new stereo-link test](Projects/Blood Compressor/rnbo/check-codebox.mjs)
- [every number from the codebox checks](Projects/Blood Compressor/rnbo/check-findings.json)
- [re-rendered: the codebox heartbeat through the v0.2 compressor, threshold 0 to -40 dB](Projects/Blood Compressor/rnbo/codebox-threshold-steps.wav)

_Left rough:_ Nothing has been opened in Max or Live. I can't yet say whether the device finds blood-vessel.js sitting next to it (freezing the device should settle that), whether v8ui takes the file as written, or whether rnbo~ compiles the two-input codebox. The old 0.1 device is still in the folder but is no longer generated.

_Next moves named:_ Once you've opened the device, put what broke (or didn't) on the RNBO codebox~ smith as its first Gotchas, and freeze a working 0.2. · Start on the body controls in the browser reference first: release-curve shape and sympathetic activation as pictures, then as dials in the device. · Make a short screen-capture demo of the device with the heartbeat, for the lesson.
<sub>`blood-compressor-020` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

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
