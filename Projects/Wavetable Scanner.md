---
title: Wavetable Scanner
type: project
status: active
pillars:
  - creation
  - tools
born: 2026-05
stage: growing
forward_vector: "I am the single-cycle morph laboratory — load any wavetable, see its frames as a 3D landscape, sweep Position to morph through them, switch between tables to compare libraries. I want to grow into a browser-side packer that absorbs the work [[pack_wavetable.py]] currently does outside the browser, so any folder of single-cycle WAVs becomes a centroid-sorted morphable table without leaving the page — that move earns my Sketch → Study transition and turns me into a self-contained tool Loudon can use across the rest of his AKWF library."
links:
  - target: "[[Shop/Web Audio Worklet]]"
    type: connects-to
    label: dsp-specialist
  - target: "[[Shop/Three.js]]"
    type: connects-to
    label: visualizer-specialist
  - target: "[[Shop/Maker]]"
    type: connects-to
    label: directed-by
  - target: "[[2D Torus Wavetable Synthesizer]]"
    type: mirrors
    label: lower-dimensional-cousin
  - target: "[[Waveguide Synthesizer]]"
    type: mirrors
    label: geometry-is-the-data
  - target: "[[Progressive Staging]]"
    type: exemplifies
    label: sketch-study-piece-is-staging
  - target: "[[Generative Wavetable Libraries]]"
    type: connects-to
    label: borrows-its-packer
tags: [artifact, synthesis, wavetable, dsp, web]
---

# Wavetable Scanner

![[Wavetable Scanner — hero.png]]

A browser-deployable single-cycle wavetable morph laboratory. Load a wavetable, see all its frames as a 3D ridge-landscape (each frame a `BufferGeometry` line, brightest at the back under a centroid sort), hold a sustained tone, and scan the cursor across the table to morph through the frames. The artifact tests two things at once: whether `pack_wavetable.py`'s centroid-sorted output actually morphs well in a real synth, and whether the pattern of *audio reads the same Float32Array the renderer reads* keeps the picture and the sound aligned through the morph.

The body of patterns this surfaces — that the morph is a 2D linear interpolation, that frame ordering carries the axis's meaning, that scanner instruments want drone-by-default — is its own entry: [[1D Wavetable Scanning]]. This entry holds the artifact, the tiers, and the build history.

## Cascade resolution

The page wears the [[Loudon Live Design System]], CRT skin, with no deviations. Its mechanical floor: single-cycle frames at 1024 samples, 44.1 kHz stereo out, joint-normalized to about −0.09 dBFS.

The brief was *"create a simple HTML wavetable synthesizer that can view these wavetables in a beautiful 3D visualizer, and I can play a note and scan through them individually and I can switch between them."* The Maker's routing was unambiguous: custom wavetable DSP → [[Shop/Web Audio Worklet]] (the per-sample `process()` loop is the differentiator); 3D visualizer whose geometry IS the data → [[Shop/Three.js]] (raw r128, single-file Sketch path). Two Specialists in concert, with the worklet owning DSP and Three.js owning render.

## Specialists

- **[[Shop/Web Audio Worklet]]** — custom wavetable lookup DSP, delivered as a Blob-URL worklet (single-file deployment), with smooth gate, linear inter-frame blend, and per-sample frame-pair interpolation. Pre-loaded with five baked wavetables (two synthesised classics plus the three AKWF tables generated earlier in the session); accepts arbitrary mono WAV uploads whose length is a multiple of 1024.
- **[[Shop/Three.js]]** — raw r128 from CDN, single-file, `OrbitControls` for the camera. Each frame is a `BufferGeometry` line laid out along Z (back = high-index = brightest under centroid sort). A translucent plane plus a brighter "current waveform" line track the scan position; the line's vertex Y coordinates run the same `(a + fr*(b−a))` math the worklet uses, reading the same `Float32Array`. The audio and the picture cannot drift — they're the same arithmetic on the same numbers.

## Tiers

### Sketch *(shipped — 2026-05-31)*

Single HTML file, raw r128 CDN, Blob-URL worklet, desktop Chrome primary. Embedded data: two synthesised classics (sine→tri→saw→square→bell · sine→saw) plus three AKWF tables from the session (centroid-sorted 6-frame · saw→bitreduced 2-frame · 4-frame test). Drag-and-drop file upload accepts any mono WAV whose length is a multiple of 1024 samples. Controls: wavetable selector, Position scan, Pitch (40–880 Hz), Master, LFO sweep of Position, Mode (Drone | Key-gated), chromatic A3→A4 trigger row. HUD reports table, current frame name + blend fraction, note name + cent offset, audio state.

Headless verification: both the worklet body and the main app script pass `node --check` (with `${FRAME_LEN}` substituted to the literal constant — the worklet-template-literal hides interpolations from a standalone parse, per [[Shop/Web Audio Worklet]] §Gotchas 2026-05-30). In-browser audible confirmation belongs to whoever opens it first — the Sketch-tier bar.

Bundle: `Projects/Wavetable Scanner/wavetable_scanner.html` (entry bundle per SCHEMA §8 — owned files live in the entry's bundle, sibling to the .md, with the artifact's CSS link reaching two folders up to the canonical `colors_and_type.css`). Standalone sibling at session-outputs scope kept available for users who want a portable copy with tokens inlined.

#### Sketch round 2 — Drone default fix (same day)

First Sketch shipped key-gated; the user opened it, hit Engage, swept Position, heard nothing. The brief was "play a note and scan through" — for a *scanner* the sustained tone is the *condition*, not the trigger. Fix: flip `gateTarget` to 1 in the constructor (drone-by-default), add a Mode toggle to expose the key-gated variant, restyle the chromatic row so sharps read darker than naturals (the row reads as a keyboard at a glance), update the HUD's audio label to call out the active mode. This pattern is now a deposited gotcha (Web Audio Worklet 2026-05-31) and the distinguishing question lives in [[1D Wavetable Scanning]] §Default gate.

### Study *(earned-by criteria — not yet built)*

- Cross-browser desktop verification (Firefox + Safari) — Chrome-only is the Sketch bar.
- Frame-size autodetection on file upload (currently the user must bring 1024-sample-frame WAVs; non-multiples are refused with a toast). The natural reach is porting `pack_wavetable.py`'s tile-and-trim resampler to JS so the browser becomes the packer too.
- A second oscillator and an amp envelope. The current voice is a single-osc sustain — adequate for the scanner brief but not for any composition-shaped use.
- Direct-manipulation in the 3D scene: raycast the cursor plane so dragging it across the scene drives Position. This is the load-bearing capability for the [[Waveguide Synthesizer]] pattern at scanner scale.
- Mobile audio-unlock + touch-orbit handling.
- A standards report and test-plan stub at `Projects/Wavetable Scanner/tests/test-plan.md`.

### Piece *(earned-by criteria — not yet built)*

- Voice-count profiling on real hardware (here voice count is fixed at one, so this collapses to a per-table CPU profile + draw-call budget on the visualizer).
- `OfflineAudioContext` render of a representative scan as a short demo audio.
- Recipe entry written into both Specialist entries (a pair, since this is a paired-Specialist job).
- Maker review.
- Loudon Live publication-ready chrome (footer signature already in place, but a Loudon Live publication move would also need a dedicated header card and an OBS-ready alt).

## Gotchas seen on this build

The full build-time record is [[Wavetable Scanner — gotchas]] (`Projects/Wavetable Scanner/Wavetable Scanner — gotchas.md`); each gotcha was also deposited into the relevant Specialist entry on 2026-05-31. The one that changed the design: a scanner drones by default. The first Sketch shipped key-gated, and sweeping Position heard nothing ([[1D Wavetable Scanning]]).

## Open questions

- Should the Sketch-tier build auto-sort by centroid on file upload, or preserve the file's authored order? The Sketch ships (b) — preserve authored order. The Study tier could expose a "Sort by centroid" toggle that surfaces the current sort state in the HUD, so the user always knows whether the spatial cue is meaningful or merely file-order. Tension named in [[1D Wavetable Scanning]] §Frame ordering.
- Where does the 2D scanner sibling live — inside this project (as a higher tier), or as a separate `2D Wavetable Scanner` project that emerges-from this one and connects to the existing [[2D Torus Wavetable Synthesizer]]? Lean toward separate; the operating model shifts from linear to bilinear blend and the visualization grammar changes from stacked ridges to a surface mesh.
- The artifact has a standalone copy (`outputs/wavetable_scanner.html`, tokens inlined) and a palace-resident copy (`Projects/Wavetable Scanner/wavetable_scanner.html`, tokens linked). Keeping both in sync is a manual move so far. Threshold for automating the dual-emission (or just retiring the standalone in favour of always-palace-resident): TBD.

## Forward vector

Next session's most-likely-shape move: spike the JS port of `pack_wavetable.py`'s resampler and centroid analysis, so the user can drag a folder of arbitrary single-cycle WAVs onto the artifact and get a centroid-sorted morphable table in the browser without leaving the page. That earns the Sketch → Study transition the entry's tier ladder names, and threads the 2026-05-31 work into a single self-contained tool the user can use for the rest of their AKWF library.
