---
title: "Harmonicity and Inharmonicity — scroll"
born: 2026-10-17
links:
  - target: "[[Harmonicity and Inharmonicity]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Harmonicity and Inharmonicity's scroll: the page that opens on where the idea stands, then reads down through everything made to test it, newest first, so anyone can hear the edge between a tone that holds and a tone that tears, and learn to find it themselves. My top is regenerated whenever anyone looks; my plan changes only when Loudon agrees; my standing orders are his; my trail only ever grows."
---

# Harmonicity and Inharmonicity — scroll

> The page's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. The entry [[Harmonicity and Inharmonicity]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

_Not generated yet. This zone belongs to the machine and fills itself in the first time anyone looks._

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon: he writes it here, or it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this page. Never regenerated; it holds until he revokes it._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="daily-2026-10-17-field-guide" -->
### 2026-10-17 — Field guide to the edge: how to find the threshold, hold it, and play it

Start here. Everything below was one evening's work on the Daily Page, chasing a single question: when a tone's partials stretch away from whole-number ratios and outside voices pull on them, where does the tone stop holding together, and what is it like right there? The answer is a boundary you can hear, find and play. The field guide sets out the five knobs (stretch, coupling, inertia, partial count, pinning), the regions they open up (frozen, alive, edge, torn, released, over-coupled), a recipe for finding the edge (sweep slowly on a log scale, listen to the tone alone, bisect), and ways to stay there and move around it: ride coupling, breathe across the edge, brake with inertia, pin for a string-to-bar morph. Loudon heard it as a design rule: instruments built on this should live at the thresholds.

**Honest frame.** It is a toy model: one tone whose partials hang off a single phase, pulled by fixed outside voices tuned to the plain harmonic series. Trust the directions and the shapes. The exact numbers depend on the model's choices (how the back-pull is scaled, how far-apart pulls fade) and moved when those choices moved.

**Artifacts:**
- [the field guide: knobs, regions, how to find the edge, how to stay there, gestures, source and register](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/field-guide.md)
- [the edge map, where to look first](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/edgemap.png)

<sub>Daily Page, 2026-10-17 · field guide · toy model, numbers model-dependent</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="daily-2026-10-17-bass" -->
### 2026-10-17 — The bass versions: the same edge, played on a slower clock

The same warm tone moved down to E1 (about 41 Hz, 96 partials), with coupling scaled to pitch so the physics stays the same and only the clock slows. The edge is still there. The shimmer and the tears unfold about 2.7 times more slowly, which makes the bass the easiest place to hear the moment a tone gives way. The breathing ride was stretched to a 20 s period to match. The gestures kept their timing in seconds, so relative to the bass tone's own slow clock they hit harder and faster.

**What to listen for** (tone alone first):
- *Breathing, 60 s:* the stretch peaks at about 10, 30 and 50 s. Listen for the colour turning over on the way up, the pitch giving way near each peak, and the tone healing on the way down.
- *Gestures, 34 s:* quick modulation 0–10 s, strikes 10–21 s, step sequence 21–34 s. The strikes are the clearest: each one is a drop in pitch and a recovery.

**Artifacts:**
- [breathing across the edge, bass, tone alone](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-breathe-bass-alone.m4a)
- [breathing across the edge, bass, with the voices](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-breathe-bass.m4a)
- [breathing, bass: pitch, stretch and coupling over time](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-breathe-bass.png)
- [gestures, bass, tone alone](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/gestures-bass-alone.m4a)
- [gestures, bass, with the voices](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/gestures-bass.m4a)
- [gestures, bass: the plot](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/gestures-bass.png)

<sub>Made with `ride_warm.py` and `gestures_warm.py` run at F0 = 41.2 Hz, N = 96. The bass renders came from small one-off copies of those scripts, which are not kept: the breathing period was lengthened to 20 s, and the gestures read `ride_warm.py`'s render. The 2.7× is the pitch ratio, 110 / 41.2, which sets the clock when coupling scales with pitch. It was not measured separately.</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="daily-2026-10-17-warm" -->
### 2026-10-17 — The warm re-voicing: the same rides on a softer tone

The early renders used a bright tone that made the effect hard to hear. This re-voicing keeps the physics and changes only the source: 64 partials by the script's default, rolled off steeply (about −12 dB per octave above the fourth), each starting at a random phase so the waveform is soft rather than a buzzy spike. Every stretch path is rescaled so it still straddles this tone's edge, because the edge moves with partial count. The rides and gestures below have warm versions here, and the warm tone is the one to play first.

**What to listen for:** the same timings as the originals below. Breathing: stretch peaks at 6, 18, 30 and 42 s. Coupling: tightest at 10 and 30 s, loosest at 0, 20 and 40 s. String ↔ bar: bar at 10 and 30 s, string at 0, 20 and 40 s. Gestures: 0–10 / 10–21 / 21–34 s.

**Artifacts:**
- [breathing, warm, tone alone](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-breathe-warm-alone.m4a) · [with voices](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-breathe-warm.m4a) · [plot](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-breathe-warm.png)
- [coupling as the knob, warm, tone alone](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-coupling-warm-alone.m4a) · [with voices](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-coupling-warm.m4a) · [plot](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-coupling-warm.png)
- [string ↔ bar, warm, tone alone](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-string-bar-warm-alone.m4a) · [with voices](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-string-bar-warm.m4a) · [plot](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-string-bar-warm.png)
- [gestures, warm, tone alone](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/gestures-warm-alone.m4a) · [with voices](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/gestures-warm.m4a) · [plot](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/gestures-warm.png)
- [ride_warm.py](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride_warm.py) · [gestures_warm.py](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/gestures_warm.py)

<sub>The three warm rides were rendered in parallel from one-off copies of `ride_warm.py`, one ride each; those copies are not kept, and `ride_warm.py` renders all three.</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="daily-2026-10-17-gestures" -->
### 2026-10-17 — Gestures at the edge: quick, percussive, sequenced

Three ways to play the threshold in one 34 s file, on the 40-partial tone with coupling at 6 Hz, which puts the edge near B = 1.8e-5. This is where the edge stops being a curiosity and starts being an instrument. A wobble across it gives a flutter. A strike past it gives a pitch drop and recovery that comes from the physics, with no envelope drawn. A sequence that steps across it plays the boundary as a rhythm.

**What to listen for** (tone alone first):
- **0–10 s, quick modulation:** the stretch wobbles three times a second between 6e-6 and 6e-5, back and forth across the edge. A fluttering, half-torn texture: the tone never quite relocks.
- **10–21 s, percussive:** every 1.25 s a strike throws the stretch to 3e-4, well past the edge, and it decays back (τ ≈ 0.25 s). Each strike tears, then heals, much like a drum's pitch envelope.
- **21–34 s, sequenced:** an 8-step pattern, 0.375 s a step, through frozen, alive, edge and torn. Only the steps above the edge tear, so the pattern is heard as a rhythm of holding and breaking.

**Artifacts:**
- [gestures, tone alone](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/gestures-alone.m4a)
- [gestures, with the voices](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/gestures.m4a)
- [gestures: pitch, stretch and coupling over time](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/gestures.png)
- [gestures.py](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/gestures.py)

<sub>Bright source (partials at n^−0.7); the warm and bass versions are above.</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="daily-2026-10-17-rides" -->
### 2026-10-17 — Riding the edge: breathe, coupling, string ↔ bar

After the one-way sweeps, three renders that move through the thresholds on purpose. The same 40-partial model, but stretch and coupling follow designed paths. Two things came out of it. First, coupling is the cleaner performance knob: hold the stretch just past the edge and coupling alone decides whether the tone locks or tears. Second, a pinned tone with almost no coupling turns stretch into a pure timbre morph, string to bar and back, with its pitch held steady. Loudon heard the pinned renders as raw material: beautiful oscillators and modulators.

**What to listen for** (tone alone first):
- **Breathe, 48 s:** coupling 6 Hz. The stretch swings on a log curve between 4e-6 and 8e-5, peaking at 6, 18, 30 and 42 s. A tear-and-heal phrase every 12 s.
- **Coupling, 40 s:** the stretch held at 2.5e-5, just past the edge. Coupling swings 2 → 18 → 2 Hz twice, tightest at 10 and 30 s. The tone locks near the top of each swing and tears near 0, 20 and 40 s.
- **String ↔ bar, 40 s:** partial 1 pinned, coupling 1 Hz. The stretch glides between 0.01 (string) and 30 (bar): bar at 10 and 30 s, string at 0, 20 and 40 s. The pitch holds and the colour travels.

**Artifacts:**
- [breathe, tone alone](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-breathe-alone.m4a) · [with voices](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-breathe.m4a) · [plot](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-breathe.png)
- [coupling, tone alone](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-coupling-alone.m4a) · [with voices](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-coupling.m4a) · [plot](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-coupling.png)
- [string ↔ bar, tone alone](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-string-bar-alone.m4a) · [with voices](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-string-bar.m4a) · [plot](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride-string-bar.png)
- [ride.py](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/ride.py)

<sub>The dotted line on each stretch plot marks the edge from the map, 1.8e-5 at K = 6 Hz.</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="daily-2026-10-17-edgemap" -->
### 2026-10-17 — The edge map: where the tone holds and where it tears

The sweeps showed one path through the space. The map shows the whole of it: 7 coupling strengths (1 to 25 Hz) against 33 stretches (1e-8 to 1, a quarter decade apart), each cell held for 4 s, its wobble measured over the last 2 s. There are four panels: 6 partials and 40, unpinned and pinned. The edge is where the wobble first passes 0.5 Hz.

**What it shows:**
- **The top partials set the edge.** At K = 6 Hz a 6-partial tone first tears at B ≈ 3e-3; a 40-partial tone at B ≈ 1.8e-5, roughly 180 times sooner. Stretch bites the top partial roughly as B·n³, so the more partials, the sooner. A pure n³ rule would predict about 300 times; this model gives between 130 and 180, depending on the run.
- **More coupling moves the edge out.** With 40 partials the first tear moves from 1e-5 at K = 1 Hz to 5.6e-5 at K = 16 Hz.
- **Released.** Far enough out the 40-partial tone stops wobbling again: its upper partials have moved too far from their voices to be gripped.
- **Over-coupled.** At K = 25 Hz the 40-partial tone wobbles even when harmonic: pull that strong shoves anything around.
- **Pinning barely moves the edge.** Pinned and unpinned tear at the same stretch, or one grid step apart. The map measures only how steady the pitch is, so it can't show the bar the pinned tone becomes; the pinned sweep below does.

**Artifacts:**
- [the edge map, four panels](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/edgemap.png)
- [edgemap.json: wobble and mean pitch for every cell, and the first tear for each coupling](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/edgemap.json)
- [edgemap.py](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/edgemap.py)

<sub>Far pulls fade here when a partial sits more than 3–4 kHz from its voice; back-pull scaled to the 6-partial run. The 0.5 Hz threshold and the 4 s hold are choices, and the edge values move with them.</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="daily-2026-10-17-sweeppin" -->
### 2026-10-17 — The pinned sweep: string to bar, and periodic again

The same 4× sweep, but with partial 1 held fixed while the rest stretch. The tone passes the edge at about the same place (B ≈ 1.6e-5, 13.3 s) and tears. Then, instead of flying off, it relocks and settles on the stiff-bar series: partials at 1, 4, 9, 16, 25 times the first. The waveform repeats again. That separates two questions the page had run together: whether a spectrum repeats, and whether its partials agree with a harmonic ensemble pulling on them. The bar's spectrum repeats, but its partials don't agree with the voices. Loudon heard these pinned renders as the most promising for instruments: beautiful oscillators and modulators.

**What to listen for** (tone alone first):
- **0–13 s:** frozen, then alive. The colour starts moving while the pitch holds.
- **~13 s:** the edge.
- **16–24 s:** torn. The pitch wobbles and dives to about 84 Hz at 24 s.
- **28–32 s:** relocked. The wobble falls under 1 Hz and the pitch climbs back to about 109 Hz.
- **32–52 s:** the bar arrives. Partials 2–5 move from 2.73, 5.44, 9.2, 14.0 to 4, 9, 16, 25. By 52 s the waveform repeats almost exactly (shape 0.98).
- **52–120 s:** a steady bar tone, 12 partials audible, pitch at 109.4 Hz.

**Artifacts:**
- [pinned sweep, tone alone, 2 min](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweeppin-singer-alone.m4a)
- [pinned sweep, with the voices](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweeppin-with-voices.m4a)
- [pinned sweep: pitch, wobble, ratios and shape over time](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweeppin.png)
- [sweeppin-report.json](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweeppin-report.json) · [sweeppin.py](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweeppin.py)

<sub>This run brought in the distance-based fade of far pulls, beyond 3–4 kHz, which the map and the rides kept. Its dive (to about 84 Hz) is shallower than the unpinned 4× sweep's (about 70 Hz), but the pinning and the fade changed in the same run, so the two cannot be separated from these renders.</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="daily-2026-10-17-sweep4x" -->
### 2026-10-17 — The 4× sweep: all the way out, and released

The two-minute sweep with the stretch doubling four times as fast, so it runs from harmonic, through the edge and the tear, to stretches no real object has. It shows the far end: once the partials are stretched far enough, nothing can grip them and the tone goes free. Its partials climb past hearing one by one until only the voices are left.

**What to listen for** (tone alone first):
- **0–13 s:** frozen, then alive.
- **~13.5 s:** the edge (B ≈ 1.7e-5).
- **16–28 s:** torn. The wobble rises to 3–6 Hz and the pulse dives to about 70 Hz at 24 s.
- **28–40 s:** released. The pull loses its grip, the wobble drops under 1 Hz by 40 s, and the partials thin out (40 audible → 5).
- **~52 s on:** the stretched partials have all left hearing. In the mixed file only the voices remain.

**Artifacts:**
- [4× sweep, tone alone, 2 min](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep4x-singer-alone.m4a)
- [4× sweep, with the voices](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep4x-with-voices.m4a)
- [4× sweep: the plot](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep4x.png)
- [sweep4x-report.json](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep4x-report.json) · [sweep4x.py](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep4x.py)

<sub>The "fundamental" panel shows the tone's pulse (the rate of its one shared phase), not partial 1. Unpinned, partial 1 sits at √(1+B) times the pulse. The two agree until B is large and then part: at 32 s the pulse is 102 Hz and partial 1 is 121 Hz. Far pulls fade only near 19 kHz in this run.</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="daily-2026-10-17-sweep120" -->
### 2026-10-17 — The two-minute sweep: the long tear, and the way out

The 40-partial sweep stretched to two minutes, with the stretch doubling at the same steady rate past where the one-minute sweep stopped. It goes on through the tear and out the other side. This is the run that showed the two exits. A tone can hold against the pull by being stubborn (inertia, heard in the five scenes), or escape it by being so different that the voices can no longer reach its partials.

**What to listen for** (tone alone first):
- **0–4 s:** harmonic hold.
- **~42 s:** the edge (B ≈ 1.7e-5).
- **56–92 s:** torn and sinking. The pulse sags from 105 to about 55 Hz and the wobble grows to 3–5 Hz.
- **98–120 s:** the way out. The partials climb past hearing (40 → 15 audible) and the pulse returns towards 100 Hz.

**Artifacts:**
- [two-minute sweep, tone alone](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep120-singer-alone.m4a)
- [two-minute sweep, with the voices](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep120-with-voices.m4a)
- [two-minute sweep: the plot](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep120.png)
- [sweep120-report.json](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep120-report.json) · [sweep120.py](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep120.py)

<sub>The deep dive to about 55 Hz belongs to this run's choices: far pulls fade only near 19 kHz. The later runs fade pulls more than 3–4 kHz apart and dive less. How deep the tone sinks depends on the model; that it sinks does not.</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="daily-2026-10-17-sweep40" -->
### 2026-10-17 — The 40-partial sweep: the edge comes much sooner, and frays

The slow sweep again, now with 40 partials and 40 voices, run on a log scale (equal time per doubling of stretch) because the edge for a tall spectrum sits at a far smaller stretch. Two findings. The edge arrives at B ≈ 1.7e-5, more than a hundred times sooner than for six partials. And instead of snapping, the tone frays: the wobble creeps up over several seconds rather than breaking at once. Few voices snap; many fray.

**What to listen for** (tone alone first):
- **0–4 s:** harmonic hold.
- **4–40 s:** alive. The colour moves (shape falls from 0.99 to 0.80) while the pitch barely sags (109.9 → 109.5 Hz).
- **~42 s:** the edge.
- **44–60 s:** fraying. The wobble grows from 0.6 to 2 Hz and the pitch slides to 105 Hz.

**Artifacts:**
- [40-partial sweep, tone alone, 1 min](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep40-singer-alone.m4a)
- [40-partial sweep, with the voices](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep40-with-voices.m4a)
- [40-partial sweep: the plot](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep40.png)
- [sweep40-report.json](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep40-report.json) · [sweep40.py](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep40.py)

<sub>Brighter source (n^−0.7) so the top partials are audible. Back-pull scaled to match the 6-partial run's total.</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="daily-2026-10-17-sweep6" -->
### 2026-10-17 — The slow 6-partial sweep: frozen, alive, then the snap

One slow sweep of stretch from zero to past the break, 48 s, on the six-partial tone from the five scenes. The stretch rises as the square of time, so it lingers at the bottom, where the life is. This is the run that turned "frustration" from a failure into a strain. For most of the sweep the tone holds its pitch, sagging slowly (110 → 107.3 Hz), while its colour turns over. Then, at 40.75 s, it snaps.

**What to listen for** (tone alone first):
- **0–40 s:** alive. The pitch holds with almost no wobble (0.01–0.02 Hz) and drifts slowly flat, the light tone bargaining by sagging. The gap between partial 6 and its voice grows to about 24 Hz.
- **40.75 s:** the break (B ≈ 0.0022).
- **41–48 s:** torn. The wobble jumps to over 2 Hz.

**Artifacts:**
- [6-partial sweep, tone alone](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep-singer-alone.m4a)
- [6-partial sweep, with the voices](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep-with-voices.m4a)
- [6-partial sweep: the plot](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep.png)
- [sweep-report.json](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep-report.json) · [sweep.py](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/sweep.py)

<sub>Each partial keeps its own phase here, so the stretch can move smoothly without clicks. The morning's guess was that the edge comes where the top partial's mismatch passes the coupling (6 Hz). The tone in fact held to a mismatch of about 24 Hz, so that guess was too simple.</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="daily-2026-10-17-five-scenes" -->
### 2026-10-17 — Five scenes: the first test of frustrated coupling

The morning's first rough, and the experiment the woken page asked for unprompted. One tone of six partials, pulled by six outside voices tuned near the plain harmonic series (coupling 6 Hz), heard at four stretches and then once more as a heavy master. It confirmed the page's asymmetry: a heavy tone holds even at bell-wide stretch, while a light one is dragged. It also corrected the page. A mildly stretched tone does not fight. It settles a touch flat, holds its pitch, and its colour shimmers: a strain, not a failure. Loudon caught it by ear. Scene 2, slightly stretched, sounded more alive than the harmonic scene 1.

**What to listen for** (each scene 6 s, with 0.6 s of silence between):
- **0 s, harmonic:** locks at 110 Hz, no wander. Steady and a little dead.
- **6.6 s, piano-ish stretch (B = 0.0004):** still locked, no wander, but about 0.5 Hz flat. Listen for the shimmer.
- **13.2 s, strong stretch (B = 0.004):** wanders ±4.4 Hz, about 4 Hz flat.
- **19.8 s, bell-wide (B = 0.02):** wanders ±12.8 Hz, dragged about 18 Hz flat. A patterned tug, not chaos.
- **26.4 s, bell-wide, heavy master (inertia 60):** holds within 0.8 Hz. Stubbornness is one way out.

**Artifacts:**
- [five scenes, tone and voices together](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/frustration-five-scenes.m4a)
- [the pulse in each scene](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/frustration-fundamental.png)
- [frustration-report.json](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/frustration-report.json) · [frustration.py](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/frustration.py) · [plot.py](Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/plot.py)

<sub>No tone-alone file for this one; the mix is about 0.6 tone to 0.35 voices. The "fundamental" panels show the tone's pulse, not partial 1; at these stretches the two differ by at most 1%. The one-phase model fits self-sustained tones (bowed, voiced, reed), not a plucked string whose modes ring freely.</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
