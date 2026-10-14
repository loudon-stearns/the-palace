---
title: "Murmuration — scroll"
born: 2026-09-23
links:
  - target: "[[Murmuration]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Murmuration's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Murmuration — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Murmuration]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-14T13:42:43.791Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 3 · last ran 2026-10-14 (today)
- **Plan:** none agreed yet — the work leans on the forward vector · **a proposed revision is waiting on you**
- **Waiting on you:** 2 open asks
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-14 (today) — The third reading is built. A click now sends an alarm running through the flock bird to bird, and the flock regathers on its own. Same click, four different swells. (`murmuration-steward-009`)
- **Last commit touching this project:** 2026-10-14 `b49614b6` — steward(Murmuration): cycle 2 — SPINNING UP. HOME: [Murmuration](obsidian://open?vault=The%20Palace&fil…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Murmuration is a synth where a flock of 60 boids wanders across a 2D wavetable. Its bet is that a sound shaped by a living flock feels more alive than one dialed in by hand. The entry describes three ways to hear the flock: as grains, as a breathing pad (the flock's density weights the wavetable), and as gesture (a predator scares the flock and it regathers). The grains and the pad were built earlier today. The blind test, which asks whether the flock beats hand-jittered grains, and my first proposed plan are both still waiting on you. This cycle built the third reading. Clicking used to give a local push plus a quarter-second attractor. Now it sends a startle that spreads boid to boid thro…

### Open asks

- `murmuration-steward-003` — sensory_verdict · posted 2026-10-14 · options: X · Y · CANT-TELL
- `murmuration-steward-004` — proposed plan revision: Murmuration's first plan · posted 2026-10-14 · options: adopt · keep

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
<!-- scroll:entry id="murmuration-steward-009" -->
### 2026-10-14 — cycle 3 — The third reading is built. A click now sends an alarm running through the flock bird to bird, and the flock regathers on its own. Same click, four different swells.
> shipped · page matches engine exactly, startle included · unheard in a browser · steward leans voice-ceiling next

WHAT I BUILT. Each boid now carries an alarm level from 0 to 1. A boid's alarm rises when it sees the predator (within 150 px), or when it catches the alarm from the most alarmed of its 7 nearest flockmates. That's topological, not by distance, which is what Ballerini et al. (2008) measured in real starlings. The alarm passes on one step weaker each hop, takes a few frames to react at each hop, and fades over about a second. An alarmed boid dashes, pushes apart harder, holds the group less, and dodges away from wherever the alarm is coming from. So the startle runs through the flock as a wave of about 350 px/s, roughly 2.5× faster than any single boid. Real starling waves run a few times faster than the birds; I'm working from memory there and didn't check the source this cycle. The regathering afterwards is plain flocking, with no recovery curve written anywhere. Alarm also swells each grain's gain (up to 2.5×) and each pad cell's level, so the sound has something to hear. A click no longer drops an attractor in this mode, though dragging still does. Alarmed boids flash white with a ring, and the HUD counts them. The whole thing is opt-in in the engine: with it off, the blind pair and every earlier render reproduce exactly. check_page_mapping.js now also runs the page's own startle code with four predator strikes through all three readings. The largest difference from the engine is 0 every time.

FIRST TRY FAILED. Passing the alarm by distance only reached about 10 boids, because this flock is sparse (one or two neighbours inside 56 px). Nearest-7 fixed that. Then the wave ran 15× faster than the boids, and the flock barely dipped. Slowing how fast each boid reacts and strengthening the dodge brought it into range.

THE ÉTUDE. It's one 30-second script with four clicks, each landing in a different flock. A hits a settled flock dead centre. B hits a settled flock upper left. C hits B's spot again while the flock is still recovering. D lands after Disorder has been eased up to just short of the transition. The flock answers each one differently. A catches 22 boids, order dips 0.94 → 0.54, and it's back in 4.2 s. B catches all 60 and shatters the flock to 0.13; it hasn't regathered by the time C lands, and it takes about 8 s to really heal. C, landing in an already broken flock, alarms only 5 boids. D, near the transition, catches 26. One identical click gets four responses, because the response comes from the flock's state at that moment. An authored envelope would give four copies.

HONEST READING OF THE SOUND. The pad breathes on its own: with no click at all, its level rises up to 4.5–6 dB within 0.8 s (90th percentile). So the pad's startle swell (+6.2 and +6.8 dB, peaking 0.3–0.4 s after A and B) sits right at the edge of its own breathing. In the pad the startle comes through more as pitch blooming than as loudness: the chord spreads by about 1 bit of pitch-class entropy on A and B. The place grains are much steadier (no-click floor 1.9 dB), and there the swell stands well clear: +3.3 dB on A and +5.6 dB on B. The old flinch's biggest moves in the pad arrive 2–3 s after the click, which is just the breathing again. Only strike A compares like for like, since the two takes are different flocks after that.

PASSED OVER. A moving hawk that dives across the field: it's richer, but it would make the gesture a path to draw instead of a click to play. Save it for later. Rendering the startle through the 'order' grains: that's the blind pair's mapping, and a labelled take could tip your ear before you answer, so I used 'place' grains instead. A fixed ADSR triggered by the click as a control take: the strike-by-strike table already shows what an envelope can't do, and a second blind test before the first one is answered would just be noise.

**Artifacts:**
- [The étude through the density pad with the startle wave: four clicks at 3, 10, 13.5 and 24 s. Listen for the chord blooming and closing again.](Projects/Murmuration/gesture-density.wav)
- [The same étude through the place grains. This is where the swell is clearest, at 3 s and 10 s.](Projects/Murmuration/gesture-place.wav)
- [The same four clicks with the predator as first built, same pad, same gain. Compare it with the first take around 3 s.](Projects/Murmuration/gesture-density-flinch.wav)
- [Top: pad level, startle wave against flinch. Middle: order φ and mean alarm, where each click lands differently. Bottom: each click's swell, aligned to the click.](Projects/Murmuration/gesture.png)
- [The page with a 'Predator' control (startle wave by default, flinch kept). Alarmed boids flash white. The review layer is on round 5.](Projects/Murmuration/Murmuration.html)
- [The startle model, opt-in: nearest-7 contagion, dash, dodge, and the alarm swell in the grain mapping.](Projects/Murmuration/engine/murmur_engine.js)
- [The pad's cells swell with the local mean alarm.](Projects/Murmuration/engine/field_reading.js)
- [Now also checks the startle with four strikes in all three readings against the engine: largest difference 0.](Projects/Murmuration/engine/check_page_mapping.js)
- [Renders the four-strike étude three ways.](Projects/Murmuration/engine/render_gesture.js)
- [Per-strike swell, peak time, pitch bloom and order dip, and draws gesture.png.](Projects/Murmuration/engine/analyse_gesture.py)
- [The numbers behind the table.](Projects/Murmuration/engine/gesture_analysis.json)
- [Frame trace, startle wave through the pad: φ, mean alarm, boids alarmed, cells sounding, pitch agreement.](Projects/Murmuration/engine/gesture_trace-density.json)
- [Frame trace, startle wave through the place grains.](Projects/Murmuration/engine/gesture_trace-place.json)
- [Frame trace, first-build flinch through the pad.](Projects/Murmuration/engine/gesture_trace-density-flinch.json)

_Four identical clicks, startle wave · swell = peak level within 3 s over the 0.5 s before · no-click floor: pad 4.5 dB, place grains 1.9 dB (90th percentile)_
| click | flock before (φ) | φ low | boids alarmed /60 | pad swell | place-grain swell | pad pitch bloom (bits) | flinch, pad swell |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A · ordered, centre | 0.94 | 0.54 | 22 | +6.2 dB at 0.4 s | +3.3 dB at 0.55 s | 1.03 | +4.6 dB at 2.2 s (0.71) |
| B · ordered, upper left | 0.92 | 0.13 | 60 | +6.8 dB at 0.3 s | +5.6 dB at 0.5 s | 0.98 | +3.0 dB at 2.7 s (0.93) |
| C · same spot, mid-regather | 0.37 | 0.18 | 5 | +3.4 dB at 0.65 s | +2.2 dB at 0.2 s | 0.47 | +3.4 dB at 0 s (1.14) |
| D · near the knee | 0.50 | 0.22 | 26 | +1.9 dB at 0.9 s | +1.4 dB at 0.65 s | 0.76 | +2.1 dB at 0.15 s (0.81) |

_Left rough:_ Nobody has clicked it in a browser yet. The alarm flash and ring are unseen, and the pad's swell sits inside its own breathing, so ears have to decide whether the startle reads there. A hard strike like B leaves the flock in pieces for about 8 s; I can't tell yet whether that's a gift (the gesture has memory) or too much.

_Next moves named:_ Measure the voice ceiling: time grains, pad and startle headlessly at 60, 120 and 240 boids, ahead of a cross-browser test page. · Once you've answered the blind test, open the key and write up what it said, either way. Then render the étude through the 'order' grains too. · If the shattered-flock memory after a hard strike earns its place, make strike strength playable (how long you hold the click, or how close you are to the flock) so a light tap and a hard strike are different gestures.
<sub>`murmuration-steward-009` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="murmuration-steward-007" -->
### 2026-10-14 — cycle 2 — The flock's second reading is built: a breathing pad where the flock's density weights the wavetable. It's in the page as 'Listen by: density'.
> shipped · page matches engine exactly, still unheard in a browser · steward leans predator-as-gesture next

WHAT I BUILT. engine/field_reading.js is the distribution reading. Each frame the flock gets smoothed onto the wavetable field: an 80-pixel blur around each boid, wrapped at the edges. Each of 40 cells takes that density as its level, and the levels are power-normalised so the pad never gets louder as it gathers. Each cell's pitch is the average heading of the boids around it, on the same heading→pitch circle as the grains' 'order' mapping. That circle is now a real circle: each cell is a Shepard pair (a tone and its octave below, crossfading), so when a heading passes ±180° the pitch keeps turning instead of jumping an octave. The page has a third 'Listen by' choice, density. check_page_mapping.js now also runs the page's own field code and its own worklet code. Over 1200 frames the largest difference from the engine is 0, for both the weights and the audio samples.

WHAT IT DOES. Same 40-second performance as the blind pair (melted, crystallising, ordered, a predator at 21 s, melting again). When the flock orders, the cells agree on pitch: 0.97–0.99 ordered against 0.32–0.40 melted. The sound focuses harder than the grains do. Pitch-class entropy drops to 2.02 bits when ordered, against 2.67 for the order-mapped grains and 3.42 for the first build. That's the phase transition heard as a chord collapsing to one pitch class. The pad has no Disorder crossfade anywhere. The second finding matches yesterday's: order alone hardly gathers the flock in space, about 31–37 of 40 cells sound either way. So the attractor is this reading's own gesture. In reading-distribution-attractor.wav, dragging the ordered flock on a loop squeezes the pad from about 35 sounding cells to about 9, and its timbre travels with the flock across the terrain. No zipper noise: the jump at control-frame edges is 1.08× the average jump (the blind grains measure about 1.5).

PASSED OVER. Fixed pitches per cell, letting only the density move. Order would never reach the sound that way, the same trap as the first build. A covariance-ellipse formula driving detune directly. With the cells' own headings, the spread already becomes the chord's spread, so a second formula would just be a hand-dialed copy of it.

BLIND TEST SAFE. I didn't render a labelled grains take. One would match a blind file and give away the key.

**Artifacts:**
- [The pad, through the same 40-second performance as the blind pair. Listen for the cluster collapsing to one pitch class around 15–20 s and again after the predator.](Projects/Murmuration/reading-distribution.wav)
- [20 s, ordered flock. From 4 s to 16 s the attractor drags it on a loop: the pad narrows to about 9 cells and its timbre travels.](Projects/Murmuration/reading-distribution-attractor.wav)
- [Top: same performance, all three sounds. The field (pink) focuses hardest when the flock orders. Bottom: order barely gathers the flock, the attractor does.](Projects/Murmuration/readings.png)
- [The page, now with 'Listen by: density'. Review layer is on round 4.](Projects/Murmuration/Murmuration.html)
- [The distribution reading: the density field, cell levels and pitches, the Shepard-pair voice.](Projects/Murmuration/engine/field_reading.js)
- [Renders both takes, level-matched to the blind pair.](Projects/Murmuration/engine/render_distribution.js)
- [Per-section entropy, flatness, cells sounding, frame-edge check, and draws readings.png.](Projects/Murmuration/engine/analyse_distribution.py)
- [Now also checks the page's density weights and worklet audio against the engine: largest difference 0.](Projects/Murmuration/engine/check_page_mapping.js)
- [The numbers behind the table.](Projects/Murmuration/engine/distribution_analysis.json)
- [Frame trace for the performance: φ, cells sounding, pitch agreement.](Projects/Murmuration/engine/distribution_trace-performance.json)
- [The same trace for the attractor take.](Projects/Murmuration/engine/distribution_trace-attractor.json)

_Same 40-second performance · pitch-class entropy in bits (3.58 = all twelve equal, lower = more focused)_
| section | flock φ | cells sounding /40 | cells agree on pitch | density pad | grains, order (mean X,Y) | grains, first build |
| --- | --- | --- | --- | --- | --- | --- |
| melted 1–5 s | 0.12 | 35.5 | 0.40 | 3.15 | 3.40 | 3.43 |
| crystallising 8–11 s | 0.22 | 36.9 | 0.33 | 3.11 | 3.37 | 3.43 |
| ordered 17–21 s | 0.87 | 30.7 | 0.97 | 2.02 | 2.67 | 3.42 |
| predator 21–24 s | 0.69 | 34.4 | 0.88 | 2.43 | 3.10 | 3.45 |
| re-cohered 25–28 s | 0.94 | 37.2 | 0.99 | 2.08 | 2.49 | 3.46 |
| melted again 36–39 s | 0.11 | 35.5 | 0.32 | 3.04 | 3.39 | 3.38 |

_Left rough:_ Nobody has heard the density pad in a browser. The engine twin ramps cell levels across each 1/60 s frame, while the browser ramps them over its first 128-sample block. Both are smooth on paper, but only ears can confirm. The melted pad is already a bit more focused (about 3.1 bits) than melted grains, because its cells drift slowly. Whether that reads as 'less chaotic' or just 'smoother' is a listening question.

_Next moves named:_ The third reading, predator as gesture: a fuller startle-and-regather envelope, playable in all three readings, so 'Listen by' becomes a compositional choice rather than a test switch. · Once you've answered the blind test, I'll open the key and write up what it said, either way. · Then measure the voice ceiling: grains against the pad, timed headlessly, ahead of the cross-browser test page.
<sub>`murmuration-steward-007` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="murmuration-steward-003" -->
### 2026-10-14 — cycle 1 — Two 40-second clouds, same performance. One is a flock, one is hand-jittered grains. Which sounds more alive?
> still working · blind pair rendered, level-matched · no clear lean, your ears decide

Murmuration's whole bet is that a grain cloud shaped by a living flock sounds more alive than one whose spread is dialed in by hand. Its own entry says the honest test is blind. Today I made the flock's order audible, so the test means something now. blind-X.wav and blind-Y.wav are the same 40 seconds: melted, crystallising, ordered, a predator scare, melting again. They go through the same 60 grains and the same mapping. In one, every grain is a boid steering by its neighbours. In the other, every grain jitters on its own, but the cloud's centre, spread, speed, heading agreement and grain-length mix are copied from the flock frame by frame. Only the coordination differs, which makes this the hard version of the test. They're matched in loudness. Pick the one that feels more alive, or say you can't tell, which is a real result too. I'll open the key (engine/blind-key.json) only after you answer.

**Artifacts:**
- [Blind take X.](Projects/Murmuration/blind-X.wav)
- [Blind take Y.](Projects/Murmuration/blind-Y.wav)
<sub>`murmuration-steward-003` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="murmuration-steward-002" -->
### 2026-10-14 — cycle 1 — The flock's order really does snap, but under the first mapping it never reached the sound. A new mapping lets you hear it, and the page now uses it.
> shipped · page ≡ engine exactly, unheard in a browser · steward leans flock-as-distribution next

WHAT I BUILT. engine/murmur_engine.js is the page's own flock, grain mapping and AudioWorklet grain voice, copied line for line and made repeatable with seeded randomness. check_page_mapping.js pulls the code out of Murmuration.html, runs it with stubbed audio, and compares it with the engine over 1200 frames for both mappings. The largest difference is 0.

FINDING 1, the transition is real. sweep_eta.js lets 8 seeded flocks settle at each Disorder level. φ (how much the flock agrees on a heading) falls from 0.96 to 0.25 between η 0 and 0.10, then sits at the random floor of about 0.12. Its fluctuations peak at η ≈ 0.07, which is what a true critical point looks like. Raising and lowering η slowly gives the same curve, so there's no hysteresis, and it behaves like a continuous transition. The page's default η 0.06 happens to sit right on the knee. But on the old 0–1 slider everything happens in the first 15% of the travel.

FINDING 2, the sound didn't follow. I ran a scripted 40-second performance through the page's mapping: melted, crystallise, ordered, a predator at 21 s, melt again. In it, pitch-class entropy stays between 3.38 and 3.46 bits whatever the flock does (3.58 would mean all twelve pitch classes equally loud). Two reasons. Grains run at 18–108 Hz, about one cycle of the 110 Hz tone, with a random phase each time, so every boid is a click. And pitch comes from height, which an ordered flock doesn't concentrate. The flock lines up its headings but stays spread across the whole field, with one or two neighbours per boid.

THE FIX, the 'order' mapping. The heading circle becomes the pitch circle, one octave around, so a flock that agrees on its heading also agrees on its pitch. Grain length follows how steadily each boid has held its course over the last quarter second. A boid kept on line by its neighbours plays 250 ms tonal grains, and a tumbling one plays 10 ms clicks. Now the sound tracks φ: 3.40 bits melted, 2.67 ordered, 2.49 re-cohered, back to 3.39 melted again. The page gets a 'Listen by' menu (order is the default, 'place' keeps the first build) and a Disorder slider remapped to η = 0.25·x², so the knee is at mid-slider and the default sits there too.

THE BLIND PAIR. blind-X.wav and blind-Y.wav play the same 40-second performance through the order mapping. In one, the grains are the flock. In the other, each grain wanders on its own random jitter, while the cloud's centre, spread, speed, heading agreement and grain-length mix are copied from the flock frame by frame. Only the coordination between grains differs. They're level-matched. The key is in engine/blind-key.json; please don't open it before listening. The question is on TRICKSTER.

PASSED OVER. Making the flock clump so 'clustered = one tone' comes true: it would mean changing the flocking itself, and alignment, not clumping, is what the transition is. Mapping η straight to grain length: that would be a crossfade dressed as emergence, the softening my own forward vector says to avoid.

**Artifacts:**
- [Top: φ against Disorder, the knee inside the first sixth of the old slider. Bottom: the performance, where only the order mapping's sound follows the flock.](Projects/Murmuration/transition.png)
- [The 40-second performance through the first mapping: the flock orders and melts, and the sound hardly moves.](Projects/Murmuration/page-as-built.wav)
- [Blind take X, order mapping. Flock or hand-jittered? (TRICKSTER asks.)](Projects/Murmuration/blind-X.wav)
- [Blind take Y, order mapping. Flock or hand-jittered?](Projects/Murmuration/blind-Y.wav)
- [The page, now with the 'Listen by' menu (order / place) and the remapped Disorder slider. Review layer is on round 3.](Projects/Murmuration/Murmuration.html)
- [Headless twin: flock, both mappings, the grain voice, and the hand-jittered control cloud.](Projects/Murmuration/engine/murmur_engine.js)
- [Runs the page's own code against the engine: largest difference 0 over 1200 frames, both mappings.](Projects/Murmuration/engine/check_page_mapping.js)
- [φ against Disorder: 8 seeds, plus slow up and down sweeps for hysteresis.](Projects/Murmuration/engine/sweep_eta.js)
- [The sweep's numbers.](Projects/Murmuration/engine/eta_sweep.json)
- [Renders the scripted performance, flock against hand-jittered, level-matched and blinded.](Projects/Murmuration/engine/render_wager.js)
- [Which take is which. Open after listening.](Projects/Murmuration/engine/blind-key.json)
- [Per-section pitch-class entropy and spectral flatness of the takes.](Projects/Murmuration/engine/analyse_takes.py)
- [The analysis numbers and traces (labelled by source, so it unblinds; read it after the key).](Projects/Murmuration/engine/takes_analysis.json)
- [Draws transition.png.](Projects/Murmuration/engine/plot_transition.py)
- [Frame trace of the order-mapping performance: φ, slider position, spread, neighbours.](Projects/Murmuration/engine/wager_trace-order.json)
- [The same trace for the first mapping.](Projects/Murmuration/engine/wager_trace-page.json)

_40-second performance: flock order φ vs how focused the sound's pitch is (pitch-class entropy, bits; 3.58 = all twelve equal, lower = more focused)_
| section | flock φ | first mapping | order mapping (mean of X and Y) |
| --- | --- | --- | --- |
| melted 1–5 s | 0.12 | 3.43 | 3.40 |
| crystallising 8–11 s | 0.22 | 3.43 | 3.37 |
| ordered 17–21 s | 0.87 | 3.42 | 2.67 |
| predator startle 21–24 s | 0.69 | 3.45 | 3.10 |
| re-cohered 25–28 s | 0.94 | 3.46 | 2.49 |
| melted again 36–39 s | 0.11 | 3.38 | 3.39 |

_Left rough:_ Nobody has heard the new page in a browser. I proved it computes the same grain parameters as the engine, not that it sounds right live. The hand-jittered control gives the grains a bell-curve spread of headings matched to the flock's agreement. The flock's real spread has a different shape, so any difference you hear may partly be that. And entropy measures focus, not aliveness.

_Next moves named:_ The second reading, flock-as-distribution: the flock's live 2D density weights the wavetable additively, rendered from the same performance so it can sit beside the grains. · The third reading, predator as gesture: a fuller startle envelope, with all three readings switchable in one page so choosing between them becomes a compositional control. · When you have the key and a verdict, I'll write up what the blind test said, either way.
<sub>`murmuration-steward-002` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="backfill-2026-09-23" -->
### 2026-09-23 — backfilled from the bundle

No steward has posted a made thing for this project yet, so the trail opens with what the bundle already holds (1 media file, newest first):

- [Murmuration.html](Projects/Murmuration/Murmuration.html) · 2026-09-23
<sub>backfill · scroll born 2026-09-23</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
