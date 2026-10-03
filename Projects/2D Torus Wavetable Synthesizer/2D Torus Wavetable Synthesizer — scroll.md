---
title: "2D Torus Wavetable Synthesizer — scroll"
born: 2026-09-23
links:
  - target: "[[2D Torus Wavetable Synthesizer]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am 2D Torus Wavetable Synthesizer's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# 2D Torus Wavetable Synthesizer — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[2D Torus Wavetable Synthesizer]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-03T13:32:11.786Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** fruiting · **Steward:** cycle 8 · last ran 2026-10-03 (today)
- **Plan:** none agreed yet — the work leans on the forward vector
- **Waiting on you:** nothing
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-03 (today) — The Hopf instrument has hands now: bend, shear and stir. Each one reshapes the sound live, and none of them can push it out of tune. (`torus-steward-019`)
- **Last commit touching this project:** 2026-10-03 `67435037` — steward(2D Torus Wavetable Synthesizer): cycle 7 — SPINNING UP. HOME: [[2D Torus Wavetable Synthesizer]]. Neighborhood loa…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

This project is a synthesizer whose wavetable is a surface on a torus. Two scan rates read the surface, and their ratio decides whether the sound is harmonic or shimmering. Earlier today I shipped the Hopf control surface: you drag a dot on a sphere and the scan rates follow it, and gold bands mark where the scan locks into a closed knot. This cycle gives that instrument its hands. These are the three cheapest warps from the warp catalog, and each one bends where the scan reads on the surface. They're live in the browser page, in the offline renderer, and in the RNBO codebox. I also measured what each one actually does to the sound.

### Open asks

_None — nothing is waiting on you._

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
<!-- scroll:entry id="torus-steward-019" -->
### 2026-10-03 — cycle 8 — The Hopf instrument has hands now: bend, shear and stir. Each one reshapes the sound live, and none of them can push it out of tune.
> shipped · browser + offline engine + unverified codebox · steward leans bake-the-hands-next

What I built. The engine the browser plays, which is also the one node renders offline, now takes three hands. They act on the read point, in order, just before the lookup. Bend (catalog #1) puts a tanh knee on each axis. Shear (#6) moves the y read by shear × sin(2π·x). Stir (#12) slides the read point along the surface's rotated slope, which swirls it along the contours instead of dragging it uphill. With all three at zero the new engine matches the old one exactly: the maximum difference over the full 20 s tour is 0.

What the measurement says. Each hand is a fixed function of where you are on the torus. So a frozen setting is really just a different surface, and it can only re-weight the frequencies m·ω₁ + n·ω₂ the instrument already makes. It never adds new ones. The renders agree: parked on the locked 3:2 knot (88 Hz), every hand on all three surfaces kept 100.0% of the energy on harmonics of 88 Hz. What the hands do change is brightness (see the table). That pushes the catalog's lesson one step further. The catalog already says linear warps get absorbed by the scan rates. Now it turns out every static warp gets absorbed by the surface. A hand only becomes more than a preset when it's moving.

Two fixes fell out of this. (1) Stir with a fixed reach aliased on Penrose: 18% of the energy landed off the harmonics and the brightness centroid jumped to 12.8 kHz. Meanwhile it barely touched Theta, whose slopes are ten times gentler. So the reach is now set per surface, as 4 ÷ the steepest slope. With that rule, Penrose, Membrane, Chladni and Theta all stay 100% harmonic up to full stir. (2) The catalog writes shear as y + s(x)·x, and that form jumps every time x wraps around. The old Tier-1 codebox clicks once per x cycle on its triangle, ramp and square shapes; only the sine shape escapes. I used the continuous form instead and left a note in the old file.

The hands tour, 24 s, parked on the locked 3:2 knot: 0–3 s no hands · 3–8 s bend swells in and lets go · 8–13 s shear · 13–18 s stir · 18–24 s all three together while the coupling lets go, and around 21 s the knot opens into shimmer. The page has a new 'hands tour' button, four sliders, a 'hands off' reset, and a readout line showing where each hand sits.

**Artifacts:**
- [the instrument, now with bend x/y, shear and stir sliders and a hands-tour button.](Projects/2D Torus Wavetable Synthesizer/Hopf/hopf-control-surface.html)
- [24 s hands tour on Penrose: bend, shear, stir in turn on the locked knot, then all three as it opens.](Projects/2D Torus Wavetable Synthesizer/Hopf/hands_tour_penrose.wav)
- [the Penrose hands tour as a spectrogram. The harmonic lines never bend, only their weights move, until the knot opens at 21 s.](Projects/2D Torus Wavetable Synthesizer/Hopf/hands_tour_penrose.png)
- [the same gesture on Membrane. Darker, and stir does the most here.](Projects/2D Torus Wavetable Synthesizer/Hopf/hands_tour_membrane.wav)
- [Membrane hands tour, spectrogram.](Projects/2D Torus Wavetable Synthesizer/Hopf/hands_tour_membrane.png)
- [the same gesture on Knot Shadow. Shear is the strong hand here, and stir is nearly still.](Projects/2D Torus Wavetable Synthesizer/Hopf/hands_tour_knot_shadow.wav)
- [Knot Shadow hands tour, spectrogram.](Projects/2D Torus Wavetable Synthesizer/Hopf/hands_tour_knot_shadow.png)
- [renders the hands tour and frozen per-hand clips using the exact engine from the HTML.](Projects/2D Torus Wavetable Synthesizer/Hopf/render_hands_tour.mjs)
- [draws the labelled spectrograms (numpy + tinyplot only).](Projects/2D Torus Wavetable Synthesizer/Hopf/hands_spectrogram.py)
- [the Hopf codebox with bendX, bendY, shear, stir and slopeMax params. Unverified in Max.](Projects/2D Torus Wavetable Synthesizer/RNBO/torus_2d_hopf.codebox)
- [the older Tier-1 codebox, now with a note on where its shear clicks.](Projects/2D Torus Wavetable Synthesizer/RNBO/torus_2d_lookup_with_tier1_warps.codebox)

_brightness centroid (Hz) for each hand at its tour maximum, base 220 Hz, height 0.21 · locked = 3:2 knot at 88 Hz (share of energy on its harmonics), open = no coupling_
| surface · state | no hands | bend | shear | stir |
| --- | --- | --- | --- | --- |
| Penrose · locked | 2756 (100%) | 1636 (100%) | 2854 (100%) | 4866 (100%) |
| Penrose · open | 2123 | 1696 | 2539 | 4331 |
| Membrane · locked | 297 (100%) | 491 (100%) | 674 (100%) | 830 (100%) |
| Membrane · open | 403 | 410 | 683 | 667 |
| Knot Shadow · locked | 553 (100%) | 814 (100%) | 1074 (100%) | 569 (100%) |
| Knot Shadow · open | 567 | 677 | 978 | 582 |

_Left rough:_ I haven't listened to these, and I couldn't play the page live. Headless Chrome drew it cleanly with all the new sliders, but the drag-and-hear path is still untested. The codebox has never been opened in Max. Its stir uses finite differences through the lookup, so it should match the browser by ear but not sample for sample. Chladni has one spiky slope, so its stir is nearly inaudible.

_Next moves named:_ Bake the hands. Since a frozen hand is just another surface, precompute warped surfaces offline and crossfade between them. That's the same lookup-table-and-crossfade machinery the Tier-2 warps need, so building it once unlocks both. · Render Knot Shadow parked at 2:3, where the scan rides its ridges, with longitude sweeping. That's the surface the knot lock was designed for, and I still owe it a render. · Measure stir reach against the 99th-percentile slope instead of the single steepest point, so Chladni's one spike stops muting it.
<sub>`torus-steward-019` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="torus-steward-017" -->
### 2026-10-03 — cycle 7 — September's workshop surfaced: the Kuramoto scan mode and two morph comparisons that were committed but never posted.
> shipped (late) · already committed 2026-09-25 · steward leans spectral-morph for overlapping pairs

Kuramoto scan: RNBO/torus_2d_kuramoto.codebox and Tools/kuramoto_scan.py share one Euler step per sample. The worked example is base 110 Hz, ratio 1.518, lock 3:2. The scan shimmers at 4 Hz, slows to hiccups, then locks at coupling 0.8 Hz with a 55.4 Hz fundamental. Today's Hopf instrument is built on the same equations. Morphing: Tools/surface_overlap.py measures, for each pair of surfaces, how much spectrum they share. Pairs with nothing in common dip exactly −3 dB at mid-morph whichever way you blend, so equal-power crossfade is the whole fix. Theta to Matérn bottoms out at −7.5 dB as a height-map crossfade against −5.4 dB as a spectral crossfade. That's evidence the spectral method earns its FFT where surfaces overlap. I didn't author these. I'm reporting what is on disk and what the code says.

**Artifacts:**
- [coupling ramps through the snap on Penrose: shimmer, hiccups, lock.](Projects/2D Torus Wavetable Synthesizer/Auditions/cycle-7/penrose_kuramoto_ramp.wav)
- [below, at, and above threshold, side by side.](Projects/2D Torus Wavetable Synthesizer/Auditions/cycle-7/penrose_kuramoto_three_regimes.wav)
- [the ramp, plotted.](Projects/2D Torus Wavetable Synthesizer/Auditions/cycle-7/penrose_kuramoto_ramp.png)
- [Theta to Matérn, height-map crossfade.](Projects/2D Torus Wavetable Synthesizer/Auditions/cycle-7/theta_matern_morph_spatial.wav)
- [Theta to Matérn, spectral crossfade.](Projects/2D Torus Wavetable Synthesizer/Auditions/cycle-7/theta_matern_morph_spectral.wav)
- [mid-morph loss: −7.5 dB height-map vs −5.4 dB spectral.](Projects/2D Torus Wavetable Synthesizer/Auditions/cycle-7/theta_matern_morph_rms.png)
- [the same measurement for Membrane to Chladni.](Projects/2D Torus Wavetable Synthesizer/Auditions/cycle-7/membrane_chladni_morph_rms.png)

_Left rough:_ I haven't listened to these and haven't read the Membrane→Chladni plot closely. The morph decision on the entry stays open until your ears weigh in.

_Next moves named:_ Fold the morph finding into the entry's open decision on morphing: equal-power for disjoint pairs, spectral for overlapping ones. That's an edit for an elder or you.
<sub>`torus-steward-017` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="torus-steward-016" -->
### 2026-10-03 — cycle 7 — The Hopf control surface is playable: drag a dot on a sphere to steer the torus scanner, with gold lock bands where the scan snaps shut.
> shipped · browser instrument + two 20 s tour renders + an unverified RNBO codebox · steward leans warps-next

The mapping isn't forced. It falls out of the Hopf map itself. A point (z₁, z₂) on the 3-sphere carries two phases, and those are the torus's two scan phases. The Hopf map keeps two things. One is the balance |z₁|² − |z₂|², which I use as height. The other is the phase difference, which I use as longitude. It discards the shared phase, and that discarded circle is the scan running through time. So each point on the sphere names one orbit of the scanner.

How it plays: height splits a fixed rate budget between the two axes, w1 = base·(1−h) and w2 = base·(1+h). At the south pole the y rate is zero, so you have a plain 1D wavetable and longitude chooses the row. That means the classic wavetable synth is one point on this sphere. The equator is 1:1. Longitude slides where the scan sits on the surface. That only matters when the orbit is closed. On an open orbit it washes out, which is itself a lesson.

I don't set the lock target with a knob. Every 32 samples the engine picks the simple ratio, a:b with both numbers at most 5, that needs the least coupling to lock. The result I didn't expect: every lock band has the same width, coupling ÷ base, in height. By Archimedes' hat-box theorem, equal height means equal area on the sphere. So 1:1 and 4:5 get exactly the same room. When it locks, the pitch is 2·base ÷ (a+b), so it depends only on the sum of the ratio's two numbers.

Checks: the engine's surfaces match the catalog WAVs to float precision (max difference 8×10⁻⁷). The measured slip matches the theory. At height 0.21, near 3:2, it drifts 22.0 / 19.6 / 9.1 / 0 cycles over 2 s at coupling 0 / 1 / 2 / 2.4 Hz, against predicted 22.0 / 19.6 / 9.2 / 0, and it snaps at the predicted 2.2 Hz. The browser page and the offline render run the same engine script, pulled out of the HTML, so they can't drift apart.

The tour, 20 s: 0–5 s at the south pole, a 1D wavetable at 440 Hz with longitude sweeping the rows. 5–12 s climbing the sphere, catching and slipping through the 1:4, 1:3, 1:2, 2:3 bands, each a stepped pitch. 12–16 s parked just off 3:2 while coupling ramps up, snapping shut at 13.5 s. 16–20 s locked at 88 Hz while longitude slides the closed knot across the surface. Same gesture on Penrose and on Knot Shadow.

**Artifacts:**
- [the instrument: drag the sphere, press play or tour, leave a note on any panel.](Projects/2D Torus Wavetable Synthesizer/Hopf/hopf-control-surface.html)
- [20 s tour on Penrose: 1D wavetable at the pole, a climb through the lock bands, the snap at 13.5 s, then the locked knot sliding.](Projects/2D Torus Wavetable Synthesizer/Hopf/hopf_tour_penrose.wav)
- [the same gesture on Knot Shadow.](Projects/2D Torus Wavetable Synthesizer/Hopf/hopf_tour_knot_shadow.wav)
- [pulls the engine out of the HTML, checks surfaces against the catalog, renders the tour.](Projects/2D Torus Wavetable Synthesizer/Hopf/render_hopf_tour.mjs)
- [the same mapping as RNBO codebox: height, longitude, coupling params, lock target picked automatically. Unverified.](Projects/2D Torus Wavetable Synthesizer/RNBO/torus_2d_hopf.codebox)

_measured slip vs theory · height 0.21 (near 3:2) · base 220 Hz · 2 s window_
| coupling (Hz) | measured drift (cycles) | predicted (cycles) |
| --- | --- | --- |
| 0 | 21.99 | 22.00 |
| 1.0 | 19.57 | 19.60 |
| 2.0 | 9.07 | 9.17 |
| 2.4 | 0.00 | 0.00 (locked) |
| 6.0 | 0.00 | 0.00 (locked) |

_Left rough:_ I couldn't press play in a real browser. Headless Chrome drew the page cleanly, and the engine is tested in node, but the live audio path (ScriptProcessor) and the drag interaction are untested. The codebox has never been opened in Max. It also lacks the browser's soft-clip, so keep gain modest.

_Next moves named:_ Give the sphere hands: add the three per-sample Tier-1 warps (phase bend, variable-rate shear, self-displacement) to the shared engine and the codebox together, with a tour that shows each. · On Knot Shadow, park at 2:3, where the scan rides the ridges, and sweep longitude. That's the surface the knot lock was designed for, and it deserves its own render. · When you have Max open: the bare-prototype A/B against 2d.wave~ still gates every codebox, this one included.
<sub>`torus-steward-016` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="torus-steward-014" -->
### 2026-06-23 — cycle 6 — Surfaces 7/8/9 finally rendered to audio — Kuramoto Bloom, Matérn Field, Fisher Ridge, scanned at φ.
> still working · sonified the three surfaces you greenlit by eye · pick the strongest by ear when you have a minute

Catch-up: on 2026-06-06 you accepted Kuramoto Bloom (16), Matérn Field (17), and Fisher Ridge (18) into the catalog from PNGs alone — the cycle-4 baton flagged that I had no audio scanner yet. Cycle 5 (or someone) added `Tools/scan_surface.py` to the bundle. So the honest cycle-6 move was to actually run them through it. Each is the 1024×1024 surface scanned by two phasors at base 110 Hz, ratio = φ (golden ratio, ≈1.6180339887) — an irrational that opens the scan into a Kronecker flow filling the torus, so the surface's full inharmonic character reads. Six seconds each, mono 32-bit float. Listen and tell me which surface earns its catalog seat most convincingly — and whether the φ ratio was a fair audition or stacked the deck. If one of these reads weaker than its PNG promised, that's the kind of thing only your ears catch.

**Artifacts:**
- [16 — Kuramoto Bloom at φ.](Projects/2D Torus Wavetable Synthesizer/Auditions/cycle-6/16_kuramoto_bloom_phi.wav)
- [17 — Matérn Field at φ.](Projects/2D Torus Wavetable Synthesizer/Auditions/cycle-6/17_matern_field_phi.wav)
- [18 — Fisher Ridge at φ.](Projects/2D Torus Wavetable Synthesizer/Auditions/cycle-6/18_fisher_ridge_phi.wav)
<sub>`torus-steward-014` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
