# Furniture fan-out — census

518 tracked HTML files (`git ls-files`, less node_modules, .claude, _tools and the design-system folders), read 2026-11-03 by `census.py`, before the fan-out touched them. One row per file is in `census.json`; the full table is below the summary.

## Summary

| | count |
|---|---|
| dress · own | 357 |
| dress · Loudon Live | 117 |
| dress · Drafting Table | 20 |
| dress · Loudon Live (inline tokens) | 13 |
| dress · STIGMERGY | 10 |
| dress · Drafting Table (inline tokens) | 1 |
| tokens · own | 382 |
| tokens · inline | 126 |
| tokens · linked | 10 |
| ground · dark | 469 |
| ground · light | 48 |
| ground · ? | 1 |
| rich-face pieces | 235 |
| fragments (no `<html>`, no `<head>`) | 0 |
| in an entry bundle with an avatar | 472 |
| in an entry bundle, no avatar yet | 31 |
| no entry | 15 |
| dark with no `color-scheme` | 454 of 469 |
| pages with an OS-dressed range | 182 |
| pages with an OS-dressed textarea | 35 |
| pages with an OS-dressed select | 36 |
| pages with an OS-dressed check | 17 |
| pages with an OS-dressed number | 3 |
| pages with an OS-dressed details | 14 |
| pages with an OS-dressed scroller | 103 |
| pages with a `<button>` (the sheet's bare-button rule reaches it) | 443 |
| `outline: none` with no `:focus-visible` | 132 |
| animated, no `prefers-reduced-motion` | 368 of 395 |
| tab icon | 0 |
| `theme-color` | 0 |
| `<html>` without `lang` | 11 |
| head-less HTML5 pages (no `<html>` tag, so no `lang`) | 46 |

## Every file

Dress: LL = Loudon Live, DT = Drafting Table, STIG = STIGMERGY; `(i)` = tokens inline, not linked. Ground: d dark, l light. Furniture, only where the page does not dress it itself: r range, t textarea, s select, c check/radio, n number, d details, o an overflow scroller with the OS scrollbar. Flags: ✗f outline hidden with no focus-visible, ✗m animates with no reduced-motion, ✓cs has color-scheme, ✓i has a tab icon, ✗L no lang (an `<html>` without it, or a head-less page with no `<html>` tag).

| file | dress | ground | rich | entry avatar | furniture | flags |
|---|---|---|---|---|---|---|
| `1D Wavetable Scanning/1D Wavetable Scanning — rich — switch or scan.html` | LL · graphite | d | ✓ | ✓ | r3 | ✗m |
| `1D Wavetable Scanning/1D Wavetable Scanning — rich — which order is brightness.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Adopt the Craft, Author the Seam/proofs/2026-10-19-hand-the-groove-to-a-machine/hand-the-groove-to-a-machine-2.html` | LL · graphite | d |  | ✓ | r3 | ✗m |
| `Adopt the Craft, Author the Seam/proofs/2026-10-19-hand-the-groove-to-a-machine/hand-the-groove-to-a-machine.html` | LL · graphite | d |  | ✓ | r3 | ✗m |
| `Boundary-Crossing Instruments/Boundary-Crossing Instruments — rich — ratio and slope.html` | LL · graphite | d | ✓ | ✓ | r5 | ✗m |
| `Chebyshev is Fourier/Chebyshev is Fourier — rich — nodes on the circle.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Chebyshev is Fourier/Chebyshev is Fourier — rich — selection rules.html` | LL · graphite | d | ✓ | ✓ |  | ✗m |
| `Chebyshev is Fourier/Chebyshev is Fourier — rich — the drive.html` | LL · graphite | d | ✓ | ✓ | r3 | ✗m |
| `Closing Well/Closing Well — diagram — close-sequence.html` | own | l |  | ✓ |  |  |
| `Closing Well/proofs/2026-10-15-two-readers/two-readers.html` | own | d |  | ✓ |  | ✗m |
| `ControlNet as Topology/ControlNet as Topology — rich — rough to fine.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `ControlNet as Topology/ControlNet as Topology — rich — the landscape.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Cross-Domain Resonances/Compression ↔ Intimacy/Compression ↔ Intimacy — rich — does distance narrow a voice.html` | LL · graphite | d | ✓ | ✓ | o1 | ✗f ✗m |
| `Cross-Domain Resonances/Compression ↔ Intimacy/Compression ↔ Intimacy — rich — four knobs and the guard.html` | LL · graphite | d | ✓ | ✓ | o1 | ✗f ✗m |
| `Cross-Domain Resonances/Compression ↔ Intimacy/Compression ↔ Intimacy — rich — where is the singer.html` | LL · graphite | d | ✓ | ✓ | o1 | ✗f ✗m |
| `Cross-Domain Resonances/Quantization ↔ Precision vs Flow/Quantization ↔ Precision vs Flow — rich — mistake or feel.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Cross-Domain Resonances/Quantization ↔ Precision vs Flow/Quantization ↔ Precision vs Flow — rich — swing and template.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Cross-Domain Resonances/Quantization ↔ Precision vs Flow/Quantization ↔ Precision vs Flow — rich — the four tracks.html` | own | d | ✓ | ✓ | t1 | ✗f ✗m |
| `Cross-Domain Resonances/Quantization ↔ Precision vs Flow/Quantization ↔ Precision vs Flow — rich — to what resolution.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Cross-Domain Resonances/Reverb ↔ Space-Time/Reverb ↔ Space-Time — rich — a delay becomes a place.html` | own | d | ✓ | ✓ |  | ✗f |
| `Cross-Domain Resonances/Reverb ↔ Space-Time/Reverb ↔ Space-Time — rich — one clap, one room.html` | own | d | ✓ | ✓ |  | ✗f |
| `Cross-Domain Resonances/Reverb ↔ Space-Time/Reverb ↔ Space-Time — rich — sitting in a box.html` | own | d | ✓ | ✓ |  | ✗f |
| `Cross-Domain Resonances/Reverb ↔ Space-Time/Reverb ↔ Space-Time — rich — where are you.html` | own | d | ✓ | ✓ |  | ✗f |
| `Cross-Domain Resonances/Saturation ↔ Richness/Saturation ↔ Richness — rich — four versions, blind.html` | LL · graphite | d | ✓ | ✓ | s1 | ✗m |
| `Cross-Domain Resonances/Saturation ↔ Richness/Saturation ↔ Richness — rich — the bend and the lean.html` | LL · graphite | d | ✓ | ✓ | r3 | ✗m |
| `Cross-Domain Resonances/Sidechain ↔ Conversation/Sidechain ↔ Conversation — rich — mud into dialogue.html` | LL · graphite | d | ✓ | ✓ | r5 | ✗m |
| `Cross-Domain Resonances/Sidechain ↔ Conversation/Sidechain ↔ Conversation — rich — under the kick.html` | LL · graphite | d | ✓ | ✓ | r1 | ✗m |
| `Cross-Domain Resonances/Sidechain ↔ Conversation/Sidechain ↔ Conversation — rich — who yields when.html` | LL · graphite | d | ✓ | ✓ | r5 | ✗m |
| `Cross-Domain Resonances/Synthesis ↔ Emergence/Synthesis ↔ Emergence — rich — predicted beside measured.html` | own | d | ✓ | ✓ |  | ✗m |
| `Cross-Domain Resonances/Synthesis ↔ Emergence/Synthesis ↔ Emergence — rich — two sines.html` | own | d | ✓ | ✓ |  |  |
| `DSP in Looping Dimensions/DSP in Looping Dimensions — rich — listen longer.html` | own | d | ✓ | ✓ |  | ✗f |
| `DSP in Looping Dimensions/DSP in Looping Dimensions — rich — snap or slide.html` | own | d | ✓ | ✓ |  | ✗f |
| `DSP in Looping Dimensions/DSP in Looping Dimensions — rich — two combs.html` | own | d | ✓ | ✓ |  | ✗f |
| `Differential Equations/Differential Equations — rich — one step at a time.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Differential Equations/Differential Equations — rich — three regimes.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Dispersion Table/Dispersion Table — rich — the table and the loop.html` | LL · graphite | d | ✓ | ✓ | r1 | ✗m |
| `Dispersion Table/Dispersion Table — rich — the warp knob.html` | LL · graphite | d | ✓ | ✓ | r5 | ✗m |
| `Dispersion Table/Dispersion Table — rich — two knobs, one loop.html` | LL · graphite | d | ✓ | ✓ | r3 | ✗m |
| `Dispersion Table/Dispersion Table — rich — where the partials land.html` | LL · graphite | d | ✓ | ✓ | r5 | ✗m |
| `Dispersion/Dispersion — rich — the recipe, built.html` | LL · graphite | d | ✓ | ✓ | r4 | ✗m |
| `Dispersion/Dispersion — rich — what spreads, and which way.html` | LL · graphite | d | ✓ | ✓ | r3 | ✗m |
| `Dissolutions/Dissolutions — rich — the seam.html` | LL · graphite | d | ✓ | ✓ | r3 | ✗m |
| `Dissolutions/proofs/2026-10-18-one-curve-three-doorways/one-curve-three-doorways-2.html` | LL · graphite | d |  | ✓ | r4 | ✗m |
| `Dissolutions/proofs/2026-10-18-one-curve-three-doorways/one-curve-three-doorways.html` | LL · graphite | d |  | ✓ | r3 | ✗m |
| `Dissolutions/proofs/2026-10-20-one-field-two-hands/one-field-two-hands.html` | LL · graphite | d |  | ✓ | r5 | ✗m |
| `Dissolutions/proofs/2026-10-20-the-circles-shadow/the-circles-shadow.html` | LL · graphite | d |  | ✓ | r2 | ✗m |
| `Dissolutions/proofs/2026-10-20-the-equation-read-backward/the-equation-read-backward.html` | LL · graphite | d |  | ✓ | r3 | ✗m |
| `Dissolutions/proofs/2026-10-20-the-lattice-read-back/the-lattice-read-back.html` | LL · graphite | d |  | ✓ | r4 | ✗m |
| `Dissolutions/proofs/2026-10-20-the-shadow-that-locks/the-shadow-that-locks.html` | LL · graphite | d |  | ✓ | r3 | ✗m |
| `Dissolutions/proofs/2026-10-20-the-table-that-travels/the-table-that-travels.html` | LL · graphite | d |  | ✓ | r2 | ✗m |
| `Exponential Decay Curvature/Exponential Decay Curvature — rich — curvature is timbre.html` | LL · graphite | d | ✓ | ✓ | r3 | ✗m |
| `Exponential Decay Curvature/Exponential Decay Curvature — rich — the RC contour.html` | LL · graphite | d | ✓ | ✓ | r1 | ✗m |
| `Exponential Decay Curvature/Exponential Decay Curvature — rich — the heard rise.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Exponential Decay Curvature/Exponential Decay Curvature — rich — the straight line.html` | LL · graphite | d | ✓ | ✓ | r3 | ✗m |
| `FM Synthesis/FM Synthesis — rich — algorithms.html` | own | d | ✓ | entry, no avatar |  |  |
| `FM Synthesis/FM Synthesis — rich — feedback.html` | own | d | ✓ | entry, no avatar |  |  |
| `FM Synthesis/FM Synthesis — rich — index.html` | own | d | ✓ | entry, no avatar |  | ✗m |
| `FM Synthesis/FM Synthesis — rich — ratios.html` | own | d | ✓ | entry, no avatar |  | ✗m |
| `FM Synthesis/FM Synthesis — rich — staged patch.html` | DT | l | ✓ | entry, no avatar | r1 | ✗m |
| `Flocking/Flocking — rich — the threshold.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Flocking/Flocking — rich — three rules.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Flocking/flocking-d3-interactive-cobalt.html` | LL · cobalt-grid | d |  | ✓ | r4 c2 |  |
| `Flocking/flocking-d3-interactive-control.html` | own | d |  | ✓ | r4 c2 |  |
| `Flocking/flocking-observable-plot-analytical.html` | own | d |  | ✓ |  |  |
| `Flocking/flocking-observable-plot-graphite.html` | LL · graphite | d |  | ✓ |  |  |
| `Flocking/flocking-p5-expressive-strobe.html` | LL · strobe | d |  | ✓ |  |  |
| `Flocking/flocking-p5-expressive.html` | own | d |  | ✓ |  |  |
| `Floquet Theory/Floquet Theory — rich — same equation twice.html` | own | d | ✓ | ✓ | r7 o1 | ✗m |
| `Floquet Theory/Floquet Theory — rich — standing on a shake.html` | own | d | ✓ | ✓ | r3 o1 | ✗m |
| `Floquet Theory/Floquet Theory — rich — three ways out.html` | own | d | ✓ | ✓ | r7 o1 | ✗m |
| `GenAI Camera/GenAI Camera — rich — depth auto-range.html` | own | d | ✓ | ✓ |  | ✗f |
| `GenAI Camera/GenAI Camera — rich — segment or inpaint.html` | own | d | ✓ | ✓ |  | ✗f |
| `GenAI Camera/GenAI Camera — rich — the costume dial.html` | own | d | ✓ | ✓ |  | ✗f |
| `GenAI Camera/GenAI Camera — rich — thin plate, thick plate.html` | own | d | ✓ | ✓ |  | ✗f |
| `GenAI Camera/GenAI Camera — scroll.html` | own | d |  | ✓ |  | ✗m ✗L |
| `GenAI Camera/index.html` | own | l |  | ✓ |  | ✗L |
| `GenAI Camera/live.html` | own | d |  | ✓ |  | ✗m ✗L |
| `Granular Synthesis/Granular Synthesis — rich — atom and material.html` | own | d | ✓ | ✓ |  | ✗f |
| `Granular Synthesis/Granular Synthesis — rich — capture.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Granular Synthesis/Granular Synthesis — rich — three regimes.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Graphic Storytelling/Graphic Storytelling — rich — time is space.html` | own | d | ✓ | ✓ | t1 | ✗f |
| `Graphic Storytelling/proofs/2026-10-28-daily-page/2026-10-28-color-hold.html` | own | d |  | ✓ | s1 | ✗m |
| `Graphic Storytelling/proofs/2026-10-28-daily-page/2026-10-29-one-strip-six-stories.html` | own | d |  | ✓ | s1 | ✗m |
| `Hand-Drawn 3D Look/Hand-Drawn 3D Look — rich — one config away.html` | own | d | ✓ | ✓ | r2 o1 | ✗m |
| `Hand-Drawn 3D Look/Hand-Drawn 3D Look — rich — the boil, measured.html` | own | d | ✓ | ✓ | r4 | ✗m |
| `Hand-Drawn 3D Look/Hand-Drawn 3D Look — rich — the seam is a redraw.html` | own | d | ✓ | ✓ | r3 o1 | ✗m |
| `Harmonicity and Inharmonicity/Harmonicity and Inharmonicity — rich — frustration.html` | LL · graphite | d | ✓ | ✓ | r3 | ✗m |
| `Harmonicity and Inharmonicity/Harmonicity and Inharmonicity — rich — six against forty.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Kuramoto Coupling/Kuramoto Coupling — rich — ensemble.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Kuramoto Coupling/Kuramoto Coupling — rich — stubbornness.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Kuramoto Coupling/Kuramoto Coupling — rich — waveform-locking.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Kuramoto Coupling/two-oscillators-coupling-explorer-audio.html` | own | d |  | ✓ | r5 | ✗m |
| `Kuramoto Coupling/two-phasors-coupling-explorer.html` | own | d |  | ✓ | r3 |  |
| `Latent Error/Latent Error — rich — holes that line up.html` | LL · graphite | d | ✓ | ✓ | r4 o1 | ✗m |
| `Latent Error/Latent Error — rich — the room that settles short.html` | LL · graphite | d | ✓ | ✓ | r5 c1 o1 | ✗m |
| `Linear Predictive Coding/Linear Predictive Coding — rich — how much is left over.html` | own | d | ✓ | ✓ | r4 | ✗m |
| `Linear Predictive Coding/Linear Predictive Coding — rich — the residual swap.html` | own | d | ✓ | ✓ | r2 o1 | ✗m |
| `Logarithmic Interface Scaling/Logarithmic Interface Scaling — rich — cutoff by ear.html` | LL · graphite | d | ✓ | ✓ |  | ✗m |
| `Logarithmic Interface Scaling/Logarithmic Interface Scaling — rich — double and halve.html` | LL · graphite | d | ✓ | ✓ |  | ✗m |
| `Logarithmic Interface Scaling/Logarithmic Interface Scaling — rich — the symmetry test.html` | LL · graphite | d | ✓ | ✓ |  | ✗m |
| `Mathieu Equation/Mathieu Equation — rich — breathing spring.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Mathieu Equation/Mathieu Equation — rich — strutt walk.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Mathieu Equation/Mathieu Equation — rich — two tongues.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Modes of Collaboration/Oblique Portrait/oblique-portrait-dossier-2026-03.html` | own | l |  | ✓ |  |  |
| `Move the Ink, Don't Redraw It/Move the Ink, Don't Redraw It — rich — move it or redraw it.html` | own | d | ✓ | ✓ |  | ✗m |
| `Move the Ink, Don't Redraw It/Move the Ink, Don't Redraw It — rich — one grain.html` | own | d | ✓ | ✓ |  | ✗m |
| `Move the Ink, Don't Redraw It/Move the Ink, Don't Redraw It — rich — where the warp folds.html` | own | d | ✓ | ✓ |  | ✗m |
| `Ohm's Law/Ohm's Law — rich — four rooms.html` | LL · graphite | d | ✓ | ✓ | o1 | ✗f ✗m |
| `Ohm's Law/Ohm's Law — rich — lock one.html` | LL · graphite | d | ✓ | ✓ |  | ✗f ✗m |
| `Palace development/Agent Wellbeing/Agent Wellbeing — rich — blind sort walked up.html` | LL · graphite | d | ✓ | ✓ |  | ✗m |
| `Palace development/Agent Wellbeing/Agent Wellbeing — rich — five dials one lamp.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Palace development/Agent Wellbeing/Agent Wellbeing — rich — the one number.html` | LL · graphite | d | ✓ | ✓ |  | ✗m |
| `Palace development/Agent Wellbeing/proofs/2026-11-02-blind-sort/blind-sort.html` | own | d |  | ✓ | t5 o1 |  |
| `Palace development/Agent Wellbeing/proofs/2026-11-02-blind-sort/rough.tpl.html` | own | d |  | ✓ | t1 o1 |  |
| `Palace development/Agent Wellbeing/rich-checks/blind-sort.tpl.html` | LL · graphite | d |  | ✓ |  | ✗m |
| `Palace development/Agent Wellbeing/rich-checks/five-dials.tpl.html` | LL · graphite | d |  | ✓ | r2 | ✗m |
| `Palace development/Agent Wellbeing/rich-checks/one-number.tpl.html` | LL · graphite | d |  | ✓ |  | ✗m |
| `Palace development/Lossy Compression with Intent Alignment/Lossy Compression with Intent Alignment — rich — same bits, two decoders.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Palace development/Lossy Compression with Intent Alignment/Lossy Compression with Intent Alignment — rich — same bits, two pictures.html` | LL · graphite | d | ✓ | ✓ |  | ✗m |
| `Palace development/Lossy Compression with Intent Alignment/Lossy Compression with Intent Alignment — rich — the type and the label.html` | LL · graphite | d | ✓ | ✓ |  | ✗m |
| `Palace development/Loudon Live Design System/workshop/rough — broadcast glitch and blueprint.html` | own | d |  | ✓ |  |  |
| `Palace development/Loudon Live Design System/workshop/rough — constructed title.html` | own | d |  | ✓ |  |  |
| `Palace development/Loudon Live Design System/workshop/rough — cyberpunk edm.html` | own | d |  | ✓ |  |  |
| `Palace development/Loudon Live Design System/workshop/rough — drafting lettering specimen.html` | own | d |  | ✓ |  |  |
| `Palace development/Loudon Live Design System/workshop/rough — how far toward stigmergy.html` | own | d |  | ✓ |  |  |
| `Palace development/Loudon Live Design System/workshop/rough — night signal.html` | own | d |  | ✓ |  |  |
| `Palace development/Loudon Live Design System/workshop/rough — the drafting hand.html` | own | d |  | ✓ |  |  |
| `Palace development/Loudon Live Design System/workshop/rough — the ruled hand.html` | own | d |  | ✓ |  |  |
| `Palace development/Palace as Context Injection System/Palace as Context Injection System — rich — the order test.html` | DT (i) | l | ✓ | ✓ | r1 |  |
| `Palace development/Palace as Context Injection System/Palace as Context Injection System — rich — two levers.html` | DT · paper | l | ✓ | ✓ | r1 | ✗m |
| `Palace development/Palace as Context Injection System/proofs/2026-10-20-birth-stack/birth-stack-reader.html` | own | d |  | ✓ | t1 d2 o1 |  |
| `Palace development/Palace as Context Injection System/proofs/2026-10-20-birth-stack/reader.tpl.html` | own | d |  | ✓ | t1 d2 o1 |  |
| `Palace development/Palace as Context Injection System/proofs/2026-10-21-floor-review/who-wakes-here.html` | DT · paper | l |  | ✓ | o1 | ✓cs |
| `Palace development/Two Batons, One Board/Two Batons, One Board — diagram — baton-and-steward.html` | own | l |  | ✓ |  |  |
| `Parametric Resonance/Parametric Resonance — rich — the pumped swing.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Parametric Resonance/Parametric Resonance — rich — the threshold heard.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Parametric Resonance/Parametric Resonance — rich — with the ring, against it.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `People/Brian Eno/Brian Eno — rich — loops of different lengths.html` | own | d | ✓ | ✓ | o1 | ✗f |
| `People/Brian Eno/Brian Eno — rich — the frame, counted.html` | own | d | ✓ | ✓ |  | ✗f |
| `Phase Reduction/Phase Reduction — rich — the kick that stays.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Phase Reduction/Phase Reduction — rich — the shadow beside the pair.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Phase Reduction/Phase Reduction — rich — two clocks on one beam.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Photonic Time Crystals/Photonic Time Crystals — rich — a gap in momentum.html` | own | d | ✓ | ✓ | r8 o1 | ✗m |
| `Photonic Time Crystals/Photonic Time Crystals — rich — a mirror in time.html` | own | d | ✓ | ✓ | r3 o1 | ✗m |
| `Playful Interface Design/Playful Interface Design — rich — legible before lovely.html` | LL · graphite | d | ✓ | ✓ | r3 | ✗m |
| `Progressive Staging/Progressive Staging — rich — the leak at its stop.html` | LL · graphite | d | ✓ | ✓ | r3 | ✗m |
| `Projects/2D Torus Wavetable Synthesizer/2D Torus Wavetable Synthesizer — rich — surfaces and morphs.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/2D Torus Wavetable Synthesizer/2D Torus Wavetable Synthesizer — rich — the RMS dip.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/2D Torus Wavetable Synthesizer/2D Torus Wavetable Synthesizer — rich — the ratio gate.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/2D Torus Wavetable Synthesizer/Hopf/hopf-control-surface.html` | LL · graphite | d |  | ✓ | r10 t4 s1 | ✗m |
| `Projects/2D Torus Wavetable Synthesizer/Instruments/singer.html` | LL · graphite | d |  | ✓ | r13 s1 | ✗m |
| `Projects/2D Torus Wavetable Synthesizer/Instruments/singer.template.html` | LL · graphite | d |  | ✓ | r13 s1 | ✗m |
| `Projects/2D Torus Wavetable Synthesizer/proofs/etude-ab/etude-ab.html` | own | d |  | ✓ |  | ✗m |
| `Projects/2D Torus Wavetable Synthesizer/proofs/etude-ab/etude_ab_template.html` | own | d |  | ✓ |  | ✗m |
| `Projects/2D Torus Wavetable Synthesizer/proofs/journey-map/journey-map.html` | own | d |  | ✓ |  | ✗m |
| `Projects/2D Torus Wavetable Synthesizer/proofs/journey-map/journey_map_template.html` | own | d |  | ✓ |  | ✗m |
| `Projects/2D Torus Wavetable Synthesizer/proofs/voicing-atlas/voicing-atlas.html` | LL · graphite | d |  | ✓ | r2 t3 n2 o1 | ✗m |
| `Projects/Action Potential Oscillator/Action Potential Oscillator — rich — crowd.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Action Potential Oscillator/Action Potential Oscillator — rich — four stages.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Action Potential Oscillator/neuron_oscillator.html` | own | d |  | ✓ | r8 o1 |  |
| `Projects/Action Potential Oscillator/neuropulse-population-audition.html` | own | d |  | ✓ | r6 | ✗m ✗L |
| `Projects/BLUELINE/proofs/animatic/animatic.html` | own | d |  | ✓ |  | ✗m |
| `Projects/BLUELINE/proofs/blender-fire/renders/layers/compare.html` | own | d |  | ✓ |  | ✗L |
| `Projects/BLUELINE/proofs/blender-fire/renders/proof/decomposition-proof.html` | own | d |  | ✓ |  | ✗L |
| `Projects/BLUELINE/proofs/blender-gallery/gallery.html` | own | d |  | ✓ |  |  |
| `Projects/BLUELINE/proofs/blender-handdrawn/followups/rig-openpose/_proofs_template.html` | LL · graphite | d |  | ✓ |  |  |
| `Projects/BLUELINE/proofs/blender-handdrawn/followups/rig-openpose/figure_rig_deposit.html` | LL · graphite | d |  | ✓ | o1 |  |
| `Projects/BLUELINE/proofs/blender-handdrawn/followups/rig-openpose/figure_rig_hands.html` | LL · graphite | d |  | ✓ |  |  |
| `Projects/BLUELINE/proofs/blender-handdrawn/followups/rig-openpose/figure_rig_proofs.html` | LL · graphite | d |  | ✓ |  |  |
| `Projects/BLUELINE/proofs/blender-handdrawn/presentation.html` | LL · graphite | d |  | ✓ | o1 | ✗f ✗m |
| `Projects/BLUELINE/proofs/blueline-m1-m4-lesson.html` | LL · graphite | d |  | ✓ |  | ✗f ✗m |
| `Projects/BLUELINE/proofs/embedded-motion/embedded-motion.html` | own | d |  | ✓ | c1 | ✗m |
| `Projects/BLUELINE/proofs/m0-previz/previz.html` | own | d |  | ✓ |  | ✗m |
| `Projects/BLUELINE/proofs/m1-animatic/m1-animatic.html` | own | d |  | ✓ |  | ✗m |
| `Projects/BLUELINE/proofs/m2-motion-comic/m2-beat-test.html` | own | d |  | ✓ |  | ✗m |
| `Projects/BLUELINE/proofs/m2-motion-comic/m2-motion-comic.html` | own | d |  | ✓ |  | ✗m |
| `Projects/BLUELINE/proofs/seam-a-roundtrip/roundtrip.html` | own | d |  | ✓ |  |  |
| `Projects/BLUELINE/proofs/session-2-staging/index.html` | own | d |  | ✓ |  | ✗L |
| `Projects/BLUELINE/proofs/session-2-staging/threejs/stager.html` | own | d |  | ✓ |  | ✗m |
| `Projects/BLUELINE/proofs/session-3-flowfield/index.html` | own | d |  | ✓ |  | ✗L |
| `Projects/BLUELINE/proofs/session-3-flowfield/legs/particles.html` | own | d |  | ✓ |  | ✗m |
| `Projects/BLUELINE/proofs/session-4-figure-flow/legs/particles.html` | own | d |  | ✓ | r5 c2 | ✗m ✗L |
| `Projects/BLUELINE/proofs/style-lock/taste-breeder.html` | LL · graphite | d |  | ✓ |  | ✗m |
| `Projects/BLUELINE/proofs/text-layer/balloons-genai/contact.html` | own | d |  | ✓ |  | ✗L |
| `Projects/BLUELINE/proofs/text-layer/contact-sheet.html` | own | d |  | ✓ |  | ✗L |
| `Projects/BLUELINE/proofs/text-layer/fonts/font-sampler.html` | own | d |  | ✓ |  | ✗L |
| `Projects/BLUELINE/proofs/text-layer/text-on-black.html` | own | d |  | ✓ |  | ✗m |
| `Projects/BLUELINE/proofs/track-II-lora/grade/rate.html` | own | d |  | ✓ | c2 |  |
| `Projects/BLUELINE/proofs/track-III-clock/clock_client.html` | own | d |  | ✓ |  |  |
| `Projects/BLUELINE/proofs/track-VI-elemental-motion/debrief.html` | LL · graphite | d |  | ✓ | o1 | ✗m |
| `Projects/BLUELINE/proofs/track-VI-elemental-motion/experiments.html` | own | d |  | ✓ |  |  |
| `Projects/BLUELINE/proofs/track-VI-elemental-motion/gallery.html` | own | d |  | ✓ |  | ✗L |
| `Projects/BLUELINE/proofs/visual-language-console/visual-language-console-v0.html` | own | d |  | ✓ |  | ✗L |
| `Projects/BLUELINE/staging-skeleton/skeleton-demo.html` | own | d |  | ✓ |  |  |
| `Projects/Bayesian Granular Synthesizer/Bayesian Granular Synthesizer — rich — equal energy.html` | own | d | ✓ | ✓ | r3 | ✗m |
| `Projects/Bayesian Granular Synthesizer/Bayesian Granular Synthesizer — rich — one e, many grains.html` | own | d | ✓ | ✓ | r3 | ✗m |
| `Projects/Bayesian Granular Synthesizer/Bayesian Granular Synthesizer — rich — prior to belief.html` | own | d | ✓ | ✓ | r2 | ✗m |
| `Projects/Bayesian Granular Synthesizer/belief-cloud-face.html` | DT · graphite | d |  | ✓ | o1 | ✗m |
| `Projects/Bayesian Granular Synthesizer/belief-helix.html` | own | d |  | ✓ | r5 | ✗m |
| `Projects/Bayesian Granular Synthesizer/belief-instrument.html` | own | d |  | ✓ | r10 | ✗m |
| `Projects/Bayesian Granular Synthesizer/belief-instrument.template.html` | own | d |  | ✓ | r10 | ✗m |
| `Projects/Bayesian Granular Synthesizer/plugin/ui/belief-helix.template.html` | own | d |  | ✓ | r5 | ✗m |
| `Projects/Bessel Functions in Synthesis/Bessel Functions in Synthesis — rich — carrier null.html` | own | d | ✓ | ✓ |  | ✗m |
| `Projects/Bessel Functions in Synthesis/Bessel Functions in Synthesis — rich — drum head.html` | own | d | ✓ | ✓ |  |  |
| `Projects/Bessel Functions in Synthesis/Bessel Functions in Synthesis — rich — order as a knob.html` | own | d | ✓ | ✓ |  |  |
| `Projects/Blood Compressor/Blood Compressor — rich — attack floor.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Projects/Blood Compressor/Blood Compressor — rich — the stressed body.html` | LL · graphite | d | ✓ | ✓ | r4 | ✗m |
| `Projects/Blood Compressor/blood-compressor-face.html` | DT · graphite | d |  | ✓ | o1 | ✗m |
| `Projects/Blood Compressor/stage2-vessel-prototype-v2.html` | own | d |  | ✓ | r7 | ✗m |
| `Projects/Blood Compressor/stage2-vessel-prototype-v3.html` | own | d |  | ✓ | r8 | ✗m |
| `Projects/Blood Compressor/stage2-vessel-prototype.html` | own | d |  | ✓ | r6 | ✗m |
| `Projects/Blood Compressor/vis05-baroreceptors-firing.html` | own | d |  | ✓ | r2 | ✗m ✗L |
| `Projects/Categorizing Inharmonicity/Categorizing Inharmonicity — rich — phase loop.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Categorizing Inharmonicity/Categorizing Inharmonicity — rich — threshold.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Compressor Design/Compressor Design — rich — one ring two clocks.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Projects/Compressor Design/Compressor Design — rich — the knee in the spectrum.html` | LL · graphite | d | ✓ | ✓ | r3 | ✗m |
| `Projects/Compressor Design/Compressor Design — rich — the window you can hear.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Projects/Crystal Synthesizer/Crystal Sonification Reference/Crystal Sonification Reference — rich — crystal to glass.html` | own | d | ✓ | entry, no avatar | o1 | ✗f ✗m |
| `Projects/Crystal Synthesizer/Crystal Sonification Reference/Crystal Sonification Reference — rich — only ratios.html` | own | d | ✓ | entry, no avatar | o1 | ✗f ✗m |
| `Projects/Crystal Synthesizer/Crystal Sonification Reference/Crystal Sonification Reference — rich — the intervals named.html` | own | d | ✓ | entry, no avatar | o1 | ✗f ✗m |
| `Projects/Crystal Synthesizer/Crystal Sonification Reference/Crystal Sonification Reference — rich — where is the physics.html` | own | d | ✓ | entry, no avatar | o1 | ✗f ✗m |
| `Projects/Crystal Synthesizer/Crystal Synthesizer — rich — strike the seven.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Crystal Synthesizer/Crystal Synthesizer — rich — which phonons are fast.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Crystal Synthesizer/crystal-synthesizer-face.html` | DT · graphite | d |  | ✓ | o1 | ✗m |
| `Projects/Crystal Synthesizer/dispersion-filter/beryl_birefringence_plot.html` | own | d |  | ✓ |  | ✗L |
| `Projects/Crystal Synthesizer/proofs-menu.html` | own | d |  | ✓ |  |  |
| `Projects/Crystal Synthesizer/session-1-interactive.html` | own | d |  | ✓ |  | ✗f ✗m |
| `Projects/Cycle 5 Explorer/Cycle 5 Explorer — rich — the window.html` | own | l | ✓ | entry, no avatar | o1 |  |
| `Projects/Cycle 5 Explorer/class/class-run-sheet.html` | own | l |  | entry, no avatar |  |  |
| `Projects/Cycle 5 Explorer/cycle5-explorer.html` | DT · paper | l |  | entry, no avatar | r2 o1 | ✓cs |
| `Projects/Cycle 5 Explorer/import/src/artifact-body.html` | own | d |  | entry, no avatar | r2 o1 | ✓cs ✗L |
| `Projects/Cycle 5 Explorer/import/src/index.html` | own | d |  | entry, no avatar | r2 o1 | ✓cs |
| `Projects/Cycle 5 Explorer/review/review-sheet.html` | own | l |  | entry, no avatar |  |  |
| `Projects/Floquet Time-Modulated Loops/Floquet Time-Modulated Loops — rich — multipliers.html` | own | d | ✓ | ✓ | r6 | ✗m |
| `Projects/Floquet Time-Modulated Loops/Floquet Time-Modulated Loops — rich — sideband ladder.html` | own | d | ✓ | ✓ | r2 | ✗m |
| `Projects/Floquet Time-Modulated Loops/Floquet Time-Modulated Loops — rich — strutt map.html` | own | d | ✓ | ✓ | r4 | ✗m |
| `Projects/Floquet Time-Modulated Loops/Floquet Time-Modulated Loops — rich — threshold.html` | own | d | ✓ | ✓ | r3 | ✗m |
| `Projects/Floquet Time-Modulated Loops/interactives/02_mathieu_simulator.html` | own | d |  | ✓ | d2 o1 | ✗f |
| `Projects/Floquet Time-Modulated Loops/interactives/03_pumped_swing.html` | own | d |  | ✓ | d1 o1 | ✗f ✗m |
| `Projects/Floquet Time-Modulated Loops/interactives/06_strutt_explorer.html` | own | d |  | ✓ | d1 o1 |  |
| `Projects/Floquet Time-Modulated Loops/interactives/09_multiplier_visualizer.html` | own | d |  | ✓ | d1 o1 | ✗f |
| `Projects/Floquet Time-Modulated Loops/interactives/15_kapitza_pendulum.html` | own | d |  | ✓ | d1 o1 | ✗f ✗m |
| `Projects/Frequency-Time Duality/proofs/2026-05-04-delay-time-axis-v2.html` | own | d |  | ✓ | r5 | ✓cs |
| `Projects/Frequency-Time Duality/proofs/2026-05-04-mod-rate-sweep.html` | own | d |  | ✓ | r2 | ✓cs |
| `Projects/Frequency-Time Duality/proofs/2026-10-13-the-flip-three-axes.html` | LL · graphite | d |  | ✓ | s2 | ✗m |
| `Projects/Generative Audio Devices/pdl-renderer/PDL Renderer.html` | own | d |  | ✓ | t1 |  |
| `Projects/Generative Audio Devices/proofs/2026-10-26-ready-to-play/rack-layouts.html` | own | d |  | ✓ |  | ✗L |
| `Projects/Generative Preset Development/Generative Preset Development — rich — where the fences sit.html` | own | d | ✓ | ✓ |  | ✗m |
| `Projects/Generative Preset Development/ableton-wavetable/audition-kit/ear-sheet.html` | own | d |  | ✓ | t1 s1 | ✗f |
| `Projects/Generative Preset Development/ableton-wavetable/descriptions/preset-descriptions.html` | own | d |  | ✓ | d9 o1 | ✗L |
| `Projects/Generative Preset Development/ableton-wavetable/ear_sheet_template.html` | own | d |  | ✓ | t1 s1 | ✗f |
| `Projects/Generative Sample Libraries/ai-source-probe/compare.dry-run.html` | own | d |  | ✓ | d2 | ✗L |
| `Projects/Generative Sample Libraries/ai-source-probe/compare.html` | own | d |  | ✓ | d4 | ✗L |
| `Projects/Generative Sample Libraries/ai-source-probe/compare.prompt-shape.html` | own | d |  | ✓ | d5 | ✗L |
| `Projects/Generative Sample Libraries/ai-source-probe/report.mock.html` | own | l |  | ✓ |  | ✗L |
| `Projects/Generative Wavetable Libraries/Generative Wavetable Libraries — rich — brighter all the way.html` | LL (i) | d | ✓ | ✓ | r2 | ✗m |
| `Projects/Generative Wavetable Libraries/Generative Wavetable Libraries — rich — line up or not.html` | LL (i) | d | ✓ | ✓ | r3 | ✗m |
| `Projects/Generative Wavetable Libraries/Generative Wavetable Libraries — rich — the crystal knob.html` | LL (i) | d | ✓ | ✓ | r2 | ✗m |
| `Projects/Haptic Handwheel/Haptic Handwheel — rich — a stiff spring down a wire.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Haptic Handwheel/Haptic Handwheel — rich — the struck spring.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Haptic Handwheel/Haptic Handwheel — rich — two parts or one.html` | own | d | ✓ | ✓ |  | ✗m |
| `Projects/Haptic Handwheel/firmware/box-day.html` | own | l |  | ✓ | r1 s1 c12 o1 | ✗m |
| `Projects/Haptic Handwheel/firmware/box_day_template.html` | own | l |  | ✓ | r1 s1 c12 o1 | ✗m |
| `Projects/Haptic Handwheel/proofs/feel-lab/feel-lab.html` | LL · graphite | d |  | ✓ | t6 s4 | ✗m |
| `Projects/Haptic Handwheel/proofs/feel-lab/feel_lab_template.html` | LL · graphite | d |  | ✓ | t6 s4 | ✗m |
| `Projects/Inharmonic Wavetable Synthesis/Inharmonic Wavetable Synthesis — rich — bend the line.html` | own | d | ✓ | ✓ |  |  |
| `Projects/Inharmonic Wavetable Synthesis/Inharmonic Wavetable Synthesis — rich — the bundle of lines.html` | own | d | ✓ | ✓ |  |  |
| `Projects/Inharmonic Wavetable Synthesis/Inharmonic Wavetable Synthesis — rich — two ways to settle.html` | own | d | ✓ | ✓ |  | ✗m |
| `Projects/Inharmonic Wavetable Synthesis/coupling-edge/coupling-edge-instrument.html` | own | d |  | ✓ | r21 t8 s7 | ✗m |
| `Projects/Inharmonic Wavetable Synthesis/dual-wavetable/dual-wavetable-instrument.html` | own | d |  | ✓ | r5 t5 s1 c3 | ✗m |
| `Projects/Inharmonic Wavetable Synthesis/dual-wavetable/dual-wavetable-instrument.template.html` | own | d |  | ✓ | r5 t5 s1 c3 | ✗m |
| `Projects/Inharmonic Wavetable Synthesis/faust-prototype/multi-frame-wtb/settling-line-explorer.html` | own | d |  | ✓ | r2 | ✗m ✗L |
| `Projects/Loudon Live/Archive/Loudon Live — Curriculum Map — priority guide 2026-05-04.html` | own | d |  | ✓ |  | ✓cs |
| `Projects/Loudon Live/proofs/the-logo-heard.html` | own | d |  | ✓ | r6 t3 | ✗m |
| `Projects/Meadows and Music — Leverage Points/exercise_reflection_tool.html` | own | l |  | ✓ |  | ✗f ✗m |
| `Projects/Meadows and an Artist's Career/Meadows and an Artist's Career — sketch — self-diagnostic.html` | own | d |  | ✓ | n2 d1 | ✗m |
| `Projects/Meadows and an Artist's Career/leverage-case-studies.html` | own | l |  | ✓ | t1 | ✗L |
| `Projects/Meadows and an Artist's Career/leverage-diagnostic-v2.html` | own | l |  | ✓ | t1 | ✗L |
| `Projects/Meadows and an Artist's Career/leverage-diagnostic-v3.html` | own | l |  | ✓ | t1 | ✗m ✗L |
| `Projects/Meadows and an Artist's Career/leverage-diagnostic-v4.html` | own | l |  | ✓ | s2 | ✗m ✗L |
| `Projects/Meadows and an Artist's Career/leverage-diagnostic-v5.html` | own | l |  | ✓ | s3 d1 | ✗m ✗L |
| `Projects/Meadows and an Artist's Career/leverage-diagnostic-worksheet.html` | own | l |  | ✓ |  | ✗L |
| `Projects/Meadows and an Artist's Career/leverage-engagement-map.html` | own | l |  | ✓ |  | ✗L |
| `Projects/Metric Modulation/Metric Modulation — rich — the anchor, blind.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Metric Modulation/Metric Modulation — rich — the same hits, a new beat.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Metric Modulation/Metric Modulation — rich — there and back.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Murmuration/Murmuration — rich — blind pair.html` | own | d | ✓ | ✓ |  | ✗m |
| `Projects/Murmuration/Murmuration — rich — one plane.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Murmuration/Murmuration — rich — the knee.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Murmuration/Murmuration.html` | LL · strobe | d |  | ✓ | r9 s2 o1 | ✗f ✗m |
| `Projects/Murmuration/ceiling-test.html` | own | d |  | ✓ | t1 | ✗m |
| `Projects/Murmuration/ceiling/ceiling-test.template.html` | own | d |  | ✓ | t1 | ✗m |
| `Projects/Murmuration/murmuration-3d.html` | own | d |  | ✓ | r2 s3 | ✗m |
| `Projects/Murmuration/three-d/murmuration-3d.template.html` | own | d |  | ✓ | r2 s3 | ✗m |
| `Projects/Neural Granular Synthesis/Neural Granular Synthesis — rich — crowd-size ladder.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Neural Granular Synthesis/Neural Granular Synthesis — rich — lock attack.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Neural Granular Synthesis/crowd-instrument.html` | own | d |  | ✓ | r8 | ✗m |
| `Projects/Neural Granular Synthesis/raster-plot-explorer.html` | own | d |  | ✓ | r6 s1 | ✗m |
| `Projects/Neural Granular Synthesis/synchrony-sonifier.html` | own | d |  | ✓ | r5 | ✗m |
| `Projects/Particle Synthesis/Particle Synthesis — rich — one click, one law.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Projects/Particle Synthesis/Particle Synthesis — rich — thrown, or on a spring.html` | LL · graphite | d | ✓ | ✓ | r4 | ✗m |
| `Projects/Particle Synthesis/Particle Synthesis — rich — which way the colours run.html` | LL · graphite | d | ✓ | ✓ |  | ✗m |
| `Projects/Particle Synthesis/proofs/2026-05-04-particle-grain-cloud-v2.html` | own | d |  | ✓ | r7 s1 | ✗m ✓cs |
| `Projects/Particle Synthesis/proofs/2026-05-04-particle-grain-cloud.html` | own | d |  | ✓ | r7 s1 | ✗m ✓cs |
| `Projects/Particle Synthesis/proofs/2026-06-08-dispersion-prism.html` | own | d |  | ✓ | r6 s1 o1 | ✗m ✓cs |
| `Projects/Particle Synthesis/proofs/2026-09-23-particle-synthesis-lesson.html` | LL · graphite | d |  | ✓ | r11 o1 | ✗f ✗m |
| `Projects/Particle Synthesis/proofs/2026-10-22-gpu-fountain.html` | own | d |  | ✓ | r6 | ✗m |
| `Projects/Particle Synthesis/proofs/2026-10-22-gpu-grains-meet.html` | own | d |  | ✓ | r5 | ✗m |
| `Projects/Phoneme Choir/Phoneme Choir — rich — same word, four voices.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Projects/Phoneme Choir/Phoneme Choir — rich — the spelling is the prompt.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Projects/Piano String Inharmonicity/Piano String Inharmonicity — rich — bend or fret.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Piano String Inharmonicity/Piano String Inharmonicity — rich — click through the string.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Piano String Inharmonicity/Piano String Inharmonicity — rich — stretch.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Piano String Inharmonicity/proofs/2026-05-04-B-slider.html` | own | d |  | ✓ | r5 | ✓cs |
| `Projects/Piano String Inharmonicity/string-bending-inharmonicity.html` | own | d |  | ✓ | r4 o1 |  |
| `Projects/Portamento and Physical Pitch Modeling/Portamento and Physical Pitch Modeling — rich — critical glide walked up.html` | LL · graphite | d | ✓ | ✓ | r3 | ✗m |
| `Projects/Portamento and Physical Pitch Modeling/Portamento and Physical Pitch Modeling — rich — overshoot walked up.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Projects/Portamento and Physical Pitch Modeling/curated-ear-set/paired-exercises.html` | own | d |  | ✓ |  | ✗m |
| `Projects/Portamento and Physical Pitch Modeling/curated-ear-set/quiz.html` | own | d |  | ✓ | s1 | ✗m |
| `Projects/Portamento and Physical Pitch Modeling/curated-ear-set/single-session-reel.html` | own | d |  | ✓ | d9 | ✗f |
| `Projects/Portamento and Physical Pitch Modeling/multi-mode/loudness-listening.html` | LL · graphite | d |  | ✓ |  |  |
| `Projects/Portamento and Physical Pitch Modeling/multi-mode/mode-locking-listening.html` | LL · graphite | d |  | ✓ |  |  |
| `Projects/Portamento and Physical Pitch Modeling/portamento-tool-01.html` | own | d |  | ✓ |  | ✗f ✗m |
| `Projects/Portamento and Physical Pitch Modeling/portamento-tool-02.html` | own | d |  | ✓ |  | ✗f ✗m |
| `Projects/Portamento and Physical Pitch Modeling/portamento-tool-03.html` | own | d |  | ✓ |  | ✗f ✗m |
| `Projects/Portamento and Physical Pitch Modeling/portamento-tool-04.html` | own | d |  | ✓ |  | ✗f ✗m |
| `Projects/Portamento and Physical Pitch Modeling/portamento-tool-05.html` | own | d |  | ✓ | o1 | ✗f ✗m |
| `Projects/Portamento and Physical Pitch Modeling/portamento-tool-06.html` | own | d |  | ✓ |  | ✗f ✗m |
| `Projects/Portamento and Physical Pitch Modeling/portamento-tool-07.html` | own | d |  | ✓ |  | ✗f ✗m |
| `Projects/Portamento and Physical Pitch Modeling/portamento-tool-08.html` | own | d |  | ✓ | o1 | ✗f ✗m |
| `Projects/Portamento and Physical Pitch Modeling/portamento-tool-09.html` | own | d |  | ✓ |  | ✗f ✗m |
| `Projects/Portamento and Physical Pitch Modeling/portamento-tool-10.html` | own | d |  | ✓ |  | ✗f ✗m |
| `Projects/Portamento and Physical Pitch Modeling/threshold/overshoot-threshold.html` | own | d |  | ✓ | t1 |  |
| `Projects/Portamento and Physical Pitch Modeling/zeta-over-time/page_template.html` | own | l |  | ✓ |  | ✗m ✗L |
| `Projects/Portamento and Physical Pitch Modeling/zeta-over-time/zeta-over-time.html` | own | l |  | ✓ |  | ✗m ✗L |
| `Projects/Project Stewardship System/Archive/2026-05-04 Proof Showcase v2.html` | own | d |  | ✓ |  | ✗f ✗m ✓cs |
| `Projects/Project Stewardship System/Archive/2026-05-04 Proof Showcase.html` | own | d |  | ✓ |  | ✗f ✗m ✓cs |
| `Projects/Project Stewardship System/fleet/Stewardship Health.html` | STIG | l |  | ✓ | o1 | ✗f ✗m ✓cs |
| `Projects/Project Stewardship System/fleet/dashboard.template.html` | LL (i) | l |  | ✓ | o1 | ✗m ✓cs |
| `Projects/Project Stewardship System/proofs/2026-10-21-listening-queue/index.html` | own | d |  | ✓ | t1 | ✗m |
| `Projects/Quantum Synthesizer/Quantum Synthesizer — rich — two ears.html` | own | d | ✓ | ✓ | r2 o1 | ✗m |
| `Projects/Quantum Synthesizer/proofs/double-well-explorer.html` | LL · graphite | d |  | ✓ | r2 t7 | ✗m |
| `Projects/Quantum Synthesizer/proofs/double_well_template.html` | LL · graphite | d |  | ✓ | r2 t7 | ✗m |
| `Projects/Quantum Synthesizer/proofs/instrument.html` | LL · graphite | d |  | ✓ | r3 t1 | ✗m |
| `Projects/Quantum Synthesizer/proofs/pendulum-slider.html` | LL · graphite | d |  | ✓ | r2 t1 | ✗m |
| `Projects/Quantum Synthesizer/proofs/well-morph-explorer.html` | LL · graphite | d |  | ✓ | r2 t5 | ✗m |
| `Projects/Quantum Synthesizer/proofs/well_morph_template.html` | LL · graphite | d |  | ✓ | r2 t5 | ✗m |
| `Projects/Quantum Synthesizer/quantum-synthesizer-demo-01.html` | own | d |  | ✓ | r6 | ✗m ✗L |
| `Projects/Rational Hearing/Rational Hearing — rich — the miss, blind.html` | own | l | ✓ | entry, no avatar |  | ✗m |
| `Projects/Rational Hearing/back-row/back-row-report.html` | own | l |  | entry, no avatar |  |  |
| `Projects/Rational Hearing/back-row/rational-hearing-projector-draft.html` | DT · paper | l |  | entry, no avatar | o1 | ✓cs |
| `Projects/Rational Hearing/import/src/index.html` | own | l |  | entry, no avatar | o1 | ✓cs |
| `Projects/Rational Hearing/import/src/rational-hearing.artifact.html` | own | l |  | entry, no avatar | o1 | ✓cs ✗L |
| `Projects/Rational Hearing/rational-hearing.html` | DT · paper | l |  | entry, no avatar | o1 | ✓cs |
| `Projects/Retrospective Delay/Retrospective Delay — rich — phrase or taps.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Retrospective Delay/Retrospective Delay — rich — the tape.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Retrospective Delay/plugin/proofs/seance-table.html` | own | d |  | ✓ |  | ✗L |
| `Projects/Retrospective Delay/plugin/proofs/speed-table.html` | own | d |  | ✓ |  | ✗L |
| `Projects/Retrospective Delay/stage-1/assets/witness-diagram.html` | own | d |  | ✓ | r2 |  |
| `Projects/Retrospective Delay/stage-5-portal/portal-web.html` | LL · graphite | d |  | ✓ | r2 n2 o1 | ✗f ✗m |
| `Projects/Semantic Delay/Semantic Delay — rich — how long a delay.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Semantic Delay/Semantic Delay — rich — what the knob holds.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Semantic Delay/standalone/demo/listening-sheet.html` | own | l |  | ✓ |  | ✗L |
| `Projects/Semantic Webcam/01-live-stigmergy-cam.html` | own | d |  | ✓ | r3 | ✗m ✗L |
| `Projects/Semantic Webcam/02-word-flock-cam.html` | own | d |  | ✓ | r5 | ✗m ✗L |
| `Projects/Semantic Webcam/03-character-multiply-cam.html` | own | d |  | ✓ | r4 | ✗m ✗L |
| `Projects/Semantic Webcam/04-grammar-fit-cam.html` | own | d |  | ✓ | r4 | ✗m ✗L |
| `Projects/Semantic Webcam/05-tonal-word-cam.html` | own | d |  | ✓ | r5 | ✗m ✗L |
| `Projects/Semantic Webcam/06-true-features-cam.html` | own | d |  | ✓ | r5 | ✗m ✗L |
| `Projects/Semantic Webcam/07-anatomy-cam.html` | own | d |  | ✓ | r5 | ✗m ✗L |
| `Projects/Semantic Webcam/08-tonal-bench.html` | own | d |  | ✓ |  |  |
| `Projects/Semantic Webcam/09-reactive-cam.html` | own | d |  | ✓ | r5 | ✗m ✗L |
| `Projects/Semantic Webcam/10-sitting-cam.html` | own | d |  | ✓ | r17 o1 | ✗m ✗L |
| `Projects/Semantic Webcam/Semantic Webcam — rich — legibility band.html` | own | d | ✓ | ✓ | r2 s2 | ✗m |
| `Projects/Semantic Webcam/Semantic Webcam — rich — the ramp.html` | own | d | ✓ | ✓ | r7 s2 | ✗m |
| `Projects/Semantic Webcam/semantic-webcam-deck.html` | own | d |  | ✓ |  | ✗m ✗L |
| `Projects/Shepard Tone Synthesizer/Shepard Tone Synthesizer — rich — the free seam.html` | own | d | ✓ | ✓ |  |  |
| `Projects/Shepard Tone Synthesizer/Shepard Tone Synthesizer — rich — the still drone.html` | own | d | ✓ | ✓ |  |  |
| `Projects/Shepard Tone Synthesizer/plugin/demo/2026-11-03-editor-mock.html` | DT · graphite | d |  | ✓ | o1 | ✗m |
| `Projects/Shepard Tone Synthesizer/session-1-interactive.html` | own | d |  | ✓ |  | ✗m |
| `Projects/Shepard Tone Synthesizer/session-2-interactive.html` | own | d |  | ✓ | r2 | ✗m |
| `Projects/Shepard Tone Synthesizer/session-3-interactive.html` | LL (i) | d |  | ✓ | r4 o1 | ✗f ✗m |
| `Projects/Shepard Tone Synthesizer/session-4-interactive.html` | LL (i) | d |  | ✓ | r4 | ✗m |
| `Projects/Shimmer Cloud/Shimmer Cloud — rich — how many.html` | own | d | ✓ | ✓ |  | ✗m |
| `Projects/Shimmer Cloud/Shimmer Cloud — rich — white light.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Projects/Shimmer Cloud/proofs/2026-10-21-listening.html` | LL (i) | d |  | ✓ | c15 o1 | ✗m |
| `Projects/Shimmer Cloud/proofs/2026-10-22-interval-listening.html` | LL (i) | d |  | ✓ | c15 o1 | ✗m |
| `Projects/Shimmer Cloud/proofs/2026-10-22-pushed-listening.html` | LL (i) | d |  | ✓ | c19 o1 | ✗m |
| `Projects/Slime Mold Delay/Slime Mold Delay — rich — eat and starve.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Projects/Slime Mold Delay/Slime Mold Delay — rich — roads that compete.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Projects/Slime Mold Delay/slime-mold-flow-dish.html` | own | d |  | ✓ | r8 s4 o1 | ✗m |
| `Projects/Slime Mold Delay/slime-mold-growth-explorer.html` | own | d |  | ✓ | r9 o1 | ✗m ✗L |
| `Projects/Slime Mold Delay/slime-mold-live-growth.html` | own | d |  | ✓ | r5 | ✗m ✗L |
| `Projects/Slime Mold Delay/slime-mold-webaudio-bench.html` | own | d |  | ✓ | r3 | ✗m ✗L |
| `Projects/Slime Mold Delay/visual-prototype/index.html` | own | d |  | ✓ | r12 o1 |  |
| `Projects/Synth Templates/workshop/picker.html` | DT · paper | l |  | entry, no avatar | t1 |  |
| `Projects/Synth Templates/workshop/site/index.html` | DT · paper | l |  | entry, no avatar | r2 t3 s1 c1 |  |
| `Projects/Talking Keyboard/Talking Keyboard — rich — 88 keys.html` | LL · graphite | d | ✓ | ✓ |  | ✗m |
| `Projects/Talking Keyboard/Talking Keyboard — rich — the next variant.html` | LL · graphite | d | ✓ | ✓ |  | ✗m |
| `Projects/Talking Keyboard/Talking Keyboard — rich — three spellings of A.html` | LL · graphite | d | ✓ | ✓ |  | ✗m |
| `Projects/Talking Keyboard/proofs/2026-05-04-velocity-language-madlib-v2.html` | own | d |  | ✓ | o1 | ✗m ✓cs |
| `Projects/Talking Keyboard/proofs/2026-05-04-velocity-language-madlib.html` | own | d |  | ✓ | o1 | ✗m ✓cs |
| `Projects/The Gallery/The Gallery — sketch — timeline.html` | DT · paper | l |  | entry, no avatar |  |  |
| `Projects/Tract Mirror/Tract Mirror — rich — junction to mirror.html` | own | d | ✓ | ✓ | r4 | ✗m |
| `Projects/Tract Mirror/artifacts/the-mirror/index.html` | LL · graphite | d |  | ✓ | o1 | ✗f ✗m |
| `Projects/Tract Mirror/plugin/gui/index.html` | LL · graphite | d |  | ✓ |  | ✗f ✗m |
| `Projects/VST Template/machinery/ui/editor.html` | LL · graphite | d |  | ✓ | o1 | ✗m |
| `Projects/VST Template/proofs/2026-10-28-crt/crystal-synthesizer-crt.html` | DT · graphite | d |  | ✓ | o1 | ✗m |
| `Projects/VST Template/proofs/2026-10-28-crt/simple-synth-crt.html` | DT · graphite | d |  | ✓ | o1 | ✗m |
| `Projects/VST Template/proofs/2026-10-28-loom/frustration-loom.html` | DT · graphite | d |  | ✓ | o1 | ✗m |
| `Projects/Wallpaper Groups/Wallpaper Groups — rich — one tile.html` | own | d | ✓ | ✓ |  | ✗m |
| `Projects/Wallpaper Groups/Wallpaper Groups — rich — rhythm on a strip.html` | own | d | ✓ | ✓ |  | ✗m |
| `Projects/Wallpaper Groups/Wallpaper Groups — rich — which turns fit.html` | own | d | ✓ | ✓ |  | ✗m |
| `Projects/Wallpaper Groups/proofs/2026-05-04-animated-explorer-v2.html` | own | d |  | ✓ | r2 c1 | ✗m ✓cs |
| `Projects/Wallpaper Groups/recipe-p2/recipe-p2 — rich — the break and the clave.html` | own | d | ✓ | entry, no avatar |  | ✗m |
| `Projects/Wallpaper Groups/recipe-p2/recipe-p2 — rich — the recipe cooked.html` | own | d | ✓ | entry, no avatar |  | ✗m |
| `Projects/Waveguide Synthesizer/Waveguide Synthesizer — rich — karplus-strong walked up.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Projects/Waveguide Synthesizer/Waveguide Synthesizer — rich — two travelling waves.html` | LL · graphite | d | ✓ | ✓ | r1 | ✗m |
| `Projects/Waveguide Synthesizer/offline-v1.2/screen-replay.html` | own | d |  | ✓ |  | ✗m |
| `Projects/Waveguide Synthesizer/sketch-karplus-strong/index.html` | own | d |  | ✓ | r4 | ✗m |
| `Projects/Waveguide Synthesizer/study-v0-bidirectional/index.html` | own | d |  | ✓ | r5 | ✗m |
| `Projects/Waveguide Synthesizer/study-v1-one-string/index.html` | own | d |  | ✓ | r6 | ✗m |
| `Projects/Waveguide Synthesizer/study-v1.1-in-tune/index.html` | own | d |  | ✓ | r7 | ✗m |
| `Projects/Waveguide Synthesizer/study-v1.10-the-overtones-run-sharp/index.html` | own | d |  | ✓ | o1 | ✗m |
| `Projects/Waveguide Synthesizer/study-v1.11-the-bow-lets-go/index.html` | own | d |  | ✓ | o1 | ✗m |
| `Projects/Waveguide Synthesizer/study-v1.12-the-lesson/index.html` | own | d |  | ✓ | o1 | ✗m |
| `Projects/Waveguide Synthesizer/study-v1.13-the-hair-holds-at-half/index.html` | own | d |  | ✓ | o1 | ✗m |
| `Projects/Waveguide Synthesizer/study-v1.2-strobe/index.html` | own | d |  | ✓ | r8 | ✗m |
| `Projects/Waveguide Synthesizer/study-v1.3-audible/index.html` | own | d |  | ✓ | r8 o1 | ✗m |
| `Projects/Waveguide Synthesizer/study-v1.4-bow/index.html` | own | d |  | ✓ | r11 o1 | ✗m |
| `Projects/Waveguide Synthesizer/study-v1.5-even-stiffness/index.html` | own | d |  | ✓ | r11 o1 | ✗m |
| `Projects/Waveguide Synthesizer/study-v1.6-every-slider-shows/index.html` | own | d |  | ✓ | r11 o1 | ✗m |
| `Projects/Waveguide Synthesizer/study-v1.7-walk-the-links/index.html` | own | d |  | ✓ | r12 o1 | ✗m |
| `Projects/Waveguide Synthesizer/study-v1.8-the-body/index.html` | own | d |  | ✓ | o1 | ✗m |
| `Projects/Waveguide Synthesizer/study-v1.9-the-bow-grips/index.html` | own | d |  | ✓ | o1 | ✗m |
| `Projects/Wavetable Scanner/wavetable_scanner.html` | LL · crt | d |  | ✓ | r5 s1 | ✗m |
| `Quadratic Interpolation in DSP/Quadratic Interpolation in DSP — rich — the joints.html` | LL (i) | d | ✓ | ✓ | r2 | ✗m |
| `Quadratic Interpolation in DSP/Quadratic Interpolation in DSP — rich — the peak between bins.html` | LL (i) | d | ✓ | ✓ | r2 | ✗m |
| `Quadratic Interpolation in DSP/Quadratic Interpolation in DSP — rich — the table read.html` | LL (i) | d | ✓ | ✓ | r1 | ✗m |
| `Radio Play/Radio Play — rich — audio first, picture last.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Radio Play/Radio Play — rich — timing is the performance.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Radio Play/radio-play-deck.html` | own | d |  | ✓ |  | ✗m ✗L |
| `Rank-N Lattice Analysis/Rank-N Lattice Analysis — rich — how many clocks.html` | own | d | ✓ | ✓ |  | ✗f |
| `Rank-N Lattice Analysis/Rank-N Lattice Analysis — rich — read both ways.html` | own | d | ✓ | ✓ |  | ✗f |
| `Remnants in Depth/Remnants in Depth — rich — flat and in depth.html` | own | d | ✓ | ✓ | r5 | ✗m |
| `Remnants in Depth/Remnants in Depth — rich — the white square.html` | own | d | ✓ | ✓ |  | ✗m |
| `Resonance and Damping/Resonance and Damping — rich — loss per trip.html` | own | d | ✓ | entry, no avatar |  | ✗f ✗m |
| `Resonance and Damping/Resonance and Damping — rich — three rulers.html` | own | d | ✓ | entry, no avatar |  | ✗f ✗m |
| `Resonance and Damping/Resonance and Damping — rich — who keeps time.html` | own | d | ✓ | entry, no avatar |  | ✗f ✗m |
| `Resonance and Damping/Resonance and Damping — sketch — q-step-by-step.html` | DT · paper | l |  | entry, no avatar | r12 | ✗m |
| `Resonance and Damping/Resonance and Damping — sketch — q-you-can-hear.html` | DT · paper | l |  | entry, no avatar | r4 | ✗m |
| `STIGMERGY/Archive/STIGMERGY v2.0 — recent features presentation.html` | STIG | d |  | ✓ |  | ✗m |
| `STIGMERGY/proofs/2026-11-01-find-the-ask/find-the-ask.html` | STIG | d |  | ✓ | t1 | ✗f ✗m |
| `SUBSTRATE/SUBSTRATE — rich — anatomy.html` | DT | ? | ✓ | ✓ |  | ✗m ✓cs |
| `Shop/Lettering/Lettering — rich — blind test of the seven voices.html` | own | d | ✓ | ✓ |  |  |
| `Shop/Lettering/Lettering — rich — mechanical font or hand.html` | own | d | ✓ | ✓ |  | ✗f |
| `Shop/Lettering/Lettering — rich — one word through the pipeline.html` | own | d | ✓ | ✓ |  |  |
| `Shop/Lettering/Lettering — rich — the void on a light field.html` | own | d | ✓ | ✓ |  | ✗f |
| `Shop/RunPod GPU Backend/proofs/flux/flux_gallery.html` | own | d |  | ✓ |  |  |
| `Shop/RunPod GPU Backend/proofs/sdxl/index.html` | own | d |  | ✓ |  |  |
| `Shop/Web Audio Worklet/Web Audio Worklet — rich — the splice.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Shop/Web Audio Worklet/Web Audio Worklet — rich — two places.html` | own | d | ✓ | ✓ | o1 | ✗m |
| `Signal-Rate CV Architecture/Signal-Rate CV Architecture — rich — the leak on a jack.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Signal-Rate CV Architecture/Signal-Rate CV Architecture — rich — the zero guard.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `State Machine/State Machine — rich — four problems.html` | own | d | ✓ | ✓ | o1 | ✗f ✗m |
| `Synthesis Topologies/Synthesis Topologies — rich — one loop, two instruments.html` | LL · graphite | d | ✓ | ✓ | r3 | ✗m |
| `Synthesis Topologies/Synthesis Topologies — rich — vibrato into sidebands.html` | LL · graphite | d | ✓ | ✓ | r5 | ✗m |
| `The 2.5D Paper Stack/The 2.5D Paper Stack — rich — reveal and break.html` | own | d | ✓ | ✓ | r5 |  |
| `The 2.5D Paper Stack/The 2.5D Paper Stack — rich — the balloon.html` | own | d | ✓ | ✓ | r3 o1 |  |
| `The 2.5D Paper Stack/The 2.5D Paper Stack — rich — the cut.html` | own | d | ✓ | ✓ | r7 o1 |  |
| `The Aftermath Frame/The Aftermath Frame — rich — a swing is a rotation.html` | own | l | ✓ | ✓ |  | ✗f |
| `The Aftermath Frame/The Aftermath Frame — rich — the gain and the motion.html` | own | l | ✓ | ✓ |  | ✗f |
| `The Curve Is the Material/The Curve Is the Material — rich — two morphs.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `The Flow Field is the Spine/The Flow Field is the Spine — rich — around a body.html` | own | d | ✓ | ✓ |  | ✗m |
| `The Flow Field is the Spine/The Flow Field is the Spine — rich — one field, three legs.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `The Lens/The Lens — any-page-through-any-page mockup.html` | own | d |  | ✓ | o1 | ✗m |
| `The Lens/The Lens — philosopher refraction+confrontation mockup.html` | own | d |  | ✓ | o1 | ✗m |
| `The Lens/The Lens — rich — move the glass.html` | own | d | ✓ | ✓ |  | ✗m |
| `The Lens/The Lens — rich — nearest on the graph.html` | own | d | ✓ | ✓ | s1 | ✗m |
| `The Lens/proofs/2026-10-23-daily-page/careful-or-bold.html` | own | l |  | ✓ | t1 |  |
| `The Lens/proofs/2026-10-23-daily-page/name-the-glass.html` | DT · paper | l |  | ✓ | s1 |  |
| `The Metaphor Stretch/The Metaphor Stretch — rich — four choices.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `The Metaphor Stretch/The Metaphor Stretch — rich — which part is the crystal.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Three Kinds of Warp/Three Kinds of Warp — rich — obstruction.html` | own | d | ✓ | ✓ |  |  |
| `Three Kinds of Warp/Three Kinds of Warp — rich — piano.html` | own | d | ✓ | ✓ |  |  |
| `Three Kinds of Warp/Three Kinds of Warp — rich — typology.html` | own | d | ✓ | ✓ |  | ✗m |
| `Typography as Meaning/Typography as Meaning — rich — the function, counted.html` | own | l | ✓ | ✓ | s1 |  |
| `Typography as Meaning/Typography as Meaning — rich — the grammar, blind.html` | own | l | ✓ | ✓ | s1 |  |
| `Typography as Meaning/proofs/2026-10-22-daily-page/conversation-ladder.html` | own | l |  | ✓ |  |  |
| `Typography as Meaning/proofs/2026-10-22-daily-page/whos-talking.html` | own | l |  | ✓ | t1 s2 c1 |  |
| `Volterra Kernels and the Torus/Volterra Kernels and the Torus — rich — one field, two readers.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Volterra Kernels and the Torus/Volterra Kernels and the Torus — rich — the diagonal and off it.html` | own | d | ✓ | ✓ |  | ✗f ✗m |
| `Wavetable Oscillator/Wavetable Oscillator — rich — a bell on the grid.html` | LL · graphite | d | ✓ | ✓ | r4 | ✗m |
| `Wavetable Oscillator/Wavetable Oscillator — rich — one cycle, two ways.html` | LL · graphite | d | ✓ | ✓ | r3 | ✗m |
| `Wavetable Oscillator/Wavetable Oscillator — rich — position as a second clock.html` | LL · graphite | d | ✓ | ✓ | r4 | ✗m |
| `Wavetable Oscillator/Wavetable Oscillator — rich — reading between samples.html` | LL · graphite | d | ✓ | ✓ | r2 | ✗m |
| `Wavetable Space as Torus/Wavetable Space as Torus — rich — one twist or many.html` | own | d | ✓ | ✓ |  | ✗m |
| `Wavetable Space as Torus/Wavetable Space as Torus — rich — one winding three speeds.html` | own | d | ✓ | ✓ |  | ✗m |
| `Wavetable Space as Torus/Wavetable Space as Torus — rich — which knot.html` | own | d | ✓ | ✓ |  | ✗m |
| `_ops/Harvest Ceremony/Archive/oblique-harvest-final.html` | own | d |  | ✓ | o1 | ✗f ✗m |
| `_ops/Harvest Ceremony/Archive/oblique-harvest-round2.html` | own | d |  | ✓ | o1 | ✗f ✗m |
| `_ops/Harvest Ceremony/Archive/oblique-harvest.html` | own | d |  | ✓ | o1 | ✗f ✗m |
| `_ops/Harvest Ceremony/inbox/Environments That Hold.html` | LL (i) | d |  | ✓ | o1 | ✗L |
| `_ops/loudon-eval/rate.html` | own | d |  | — | c2 |  |
| `_ops/maps/palace-map-2026-03-27.html` | own | d |  | — | o1 | ✗f ✗m |
| `_ops/rich-face/rich.html` | LL · graphite | d |  | — |  | ✗f |
| `_ops/stigmergy/about/index.html` | STIG | d |  | — | o1 | ✗m |
| `_ops/stigmergy/app/index.html` | STIG | l |  | — |  | ✗L |
| `_ops/stigmergy/app/mockups/log-git-state.html` | STIG | d |  | — | o1 | ✗L |
| `_ops/stigmergy/app/mockups/quote-marks.html` | STIG | d |  | — |  | ✗m |
| `_ops/stigmergy/app/public/trickster-assets/slime-mold/index.html` | STIG | d |  | — | r12 o1 |  |
| `_ops/stigmergy/app/public/trickster-assets/witness/witness-diagram.html` | STIG | d |  | — | r2 |  |
| `_ops/stigmergy/merleau-entry-agent-prototype.html` | STIG | d |  | — |  | ✗f ✓cs |
| `_ops/swarm/experiments/palace-gnn-2026-08-26/palace-gnn.html` | own | d |  | — | o1 | ✗L |
| `_ops/swarm/experiments/palace-gnn-2026-08-26/template.html` | own | d |  | — | o1 | ✗L |
| `_ops/swarm/sessions/multi-lens-weave-2026-07-06/multi-lens-weave-report.html` | LL · graphite | d |  | — |  |  |
| `_ops/swarm/sessions/weave-2026-09-24/report.html` | LL · graphite | d |  | — | o1 |  |
| `_ops/swarm/sessions/weave-2026-10-24/report.html` | LL · graphite | d |  | — | o1 |  |
