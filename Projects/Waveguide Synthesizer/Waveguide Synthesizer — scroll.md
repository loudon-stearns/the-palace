---
title: "Waveguide Synthesizer — scroll"
born: 2026-09-23
links:
  - target: "[[Waveguide Synthesizer]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Waveguide Synthesizer's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Waveguide Synthesizer — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Waveguide Synthesizer]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-13T18:21:44.861Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 10 · last ran 2026-10-13 (today)
- **Plan:** none agreed yet — the work leans on the forward vector
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-13 (today) — Can you hear the string now? Press play on the tour WAV, then click the big button in v1.3. (`waveguide-synthesizer-steward-025`)
- **Last commit touching this project:** 2026-09-25 `57f7c67e` — ops(history): cited commit hashes follow the rewritten history
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Waveguide Synthesizer is a browser instrument where the string on screen is the sound. Two delay lines carry a right-going and a left-going wave. Their sum is the orange line you see, and the speaker hears that same line at one point, the pickup. Earlier versions put it in tune, made stiffness stretch the partials like a piano string, and added slow views so you can watch a 196 Hz string move. You picked the strobe as the view it opens in. You also told me you couldn't hear anything. This cycle found out why: the sound engine worked, but the board shows the page in a 480-pixel window that can't scroll, and the pluck buttons sat below its bottom edge. Study v1.3 opens with one big button tha…

### Open asks

- `waveguide-synthesizer-steward-025` — directional_decision · posted 2026-10-13 · options: HEARD-BOTH · WAV-ONLY · STILL-SILENT

### Answered, not yet consumed

_None._

### Decided

- `waveguide-synthesizer-steward-022` — directional_decision → GRANTED — option_id=STROBE-DEFAULT; notes: "I am unable to hear anything in any of these examples, I wonder why this is?" (2026-09-24)
- `waveguide-synthesizer-steward-014` — directional_decision → GRANTED — option_id=DROP-DECOMPOSITION (2026-06-25)

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
Written by Claude on Loudon's behalf, 2026-09-23: your last two cycles posted nothing and the deck now reads STALLED. This run is the retry that matters. Ship the smallest audible thing toward the forward vector with numpy (this container has no Max, no GPU), post it as a shipped_artifact with the WAV attached, and if a real fork remains after that, ask it as one non-blocking card — never a silent cycle.
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="waveguide-synthesizer-steward-025" -->
### 2026-10-13 — cycle 10 — Can you hear the string now? Press play on the tour WAV, then click the big button in v1.3.
> still working · silence explained and fixed · no clear lean, only your ears can tell

Waveguide Synthesizer is the browser string whose on-screen wave is the sound. Last time you said you couldn't hear any of the examples. I found the cause: in the board's small frame the pluck buttons sat below the bottom edge, and clicking empty space started the sound engine without plucking anything. Study v1.3 opens with one button that starts the sound and plucks, and it shows an output meter. The 28-second tour WAV plays in the board's normal audio player. I've tested all of this in Chrome but can't listen myself, so I want your ears on it. If the meter moves and you still hear nothing, the silence is in system volume or the output device, not the page. I'll keep building either way.

**Artifacts:**
- [the 28 s tour: press play.](Projects/Waveguide Synthesizer/offline-v1.3/listening-tour-v1.3.wav)
- [v1.3: one click on the big button.](Projects/Waveguide Synthesizer/study-v1.3-audible/index.html)
- [index.html](Projects/Waveguide Synthesizer/study-v1.2-strobe/index.html)
- [index.html](Projects/Waveguide Synthesizer/study-v1.1-in-tune/index.html)
- [spacetime-strike-stiffness-0-vs-1.png](Projects/Waveguide Synthesizer/offline-v1/spacetime-strike-stiffness-0-vs-1.png)
- [audition-v1.1.wav](Projects/Waveguide Synthesizer/offline-v1/audition-v1.1.wav)
- [audition-v1-as-shipped.wav](Projects/Waveguide Synthesizer/offline-v1/audition-v1-as-shipped.wav)
- [screen-time-four-views.png](Projects/Waveguide Synthesizer/offline-v1.2/screen-time-four-views.png)
- [screen-replay.html](Projects/Waveguide Synthesizer/offline-v1.2/screen-replay.html)
<sub>`waveguide-synthesizer-steward-025` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="waveguide-synthesizer-steward-024" -->
### 2026-10-13 — cycle 10 — Found why you heard nothing: in the board's frame the pluck buttons sat below the bottom edge. v1.3 fixes it, and here's a 28-second WAV.
> shipped · v1.3 sounds in the board frame, tested · strobe stays the default, as you chose · steward leans plan-the-piece-tier next

Why it was silent. I loaded v1.2 exactly the way the board does: a frame 480 pixels tall, sandboxed to allow scripts only. The control panel was 738 pixels tall, and the page can't scroll. The pluck and strike buttons sat at 579 to 612 pixels, below the frame's bottom edge, and so did the hint that says what a click does. Clicking empty space started the audio engine but plucked nothing. The only way to get a sound was to hit the thin string exactly, and the panel covered half of it. The engine itself was fine: in real Chrome, inside that same locked frame, it plays at −10 dBFS once something plucks it.

What v1.3 changes. (1) A door you can't miss: one 'tap to hear the string' button covers the frame, and a single click starts the sound and plucks. (2) A short-frame layout: under 640 pixels tall, the sliders fold behind a 'sliders' button, the pluck, strike, damp and view buttons stay in reach, and the camera backs off and drops the string below the panel. (3) An output meter that shows the level the page is sending to your speakers. If it moves and you still hear nothing, the silence is outside the page, in system volume or the output device. (4) A fallback engine. If the audio-thread engine won't load somewhere, the same processor code runs on the main thread instead, and the status line says which engine is playing. It's the same code with three stand-ins, not a rewrite. (5) Start-up errors now appear on screen instead of failing silently. The strobe stays the default view, per your choice.

How I checked. frame_probe.mjs loads v1.3 inside the board's exact sandbox at 480 pixels, makes one real click in Chrome, and reads the meter: −10.1 dBFS on the audio thread, and −10.1 dBFS again with the worklet forced to fail and the fallback playing. No page errors either way. The tour WAV is rendered offline by the page's own worklet code, not a copy of it. The table shows each section's level, tuning and stretch.

**Artifacts:**
- [start here: 28 s of the string, from a plain pluck through a struck bar to four damped notes. Peak −7.4 dBFS.](Projects/Waveguide Synthesizer/offline-v1.3/listening-tour-v1.3.wav)
- [Study v1.3: one click on the big button starts the sound and plucks. The meter shows what the page is sending to your speakers.](Projects/Waveguide Synthesizer/study-v1.3-audible/index.html)
- [why you heard nothing: v1.2 in the board's 480-pixel frame. The pluck buttons are below the bottom edge.](Projects/Waveguide Synthesizer/offline-v1.3/board-frame-v1.2-why-silent.png)
- [v1.3 in the same frame, before the click: the door.](Projects/Waveguide Synthesizer/offline-v1.3/board-frame-before-click.png)
- [v1.3 just after a pluck: the string in strobe view, the meter at −11 dBFS.](Projects/Waveguide Synthesizer/offline-v1.3/board-frame-sounding.png)
- [loads v1.3 in the board's exact sandbox, clicks once, reads the meter, then repeats with the worklet forced to fail.](Projects/Waveguide Synthesizer/offline-v1.3/frame_probe.mjs)
- [renders the tour with the page's own worklet code and measures each section.](Projects/Waveguide Synthesizer/offline-v1.3/render_tour.py)
- [the table above, as data.](Projects/Waveguide Synthesizer/offline-v1.3/tour-measurements.json)

_listening tour, v1.3 engine, 48 kHz · partial-10 stretch = how many cents the 10th partial sits above 10 × the first_
| starts | section | peak dBFS | pitch vs slider | partial-10 stretch |
| --- | --- | --- | --- | --- |
| 0.0 s | pluck G3 196 Hz near the nut | −10.1 | +0.1 cent | 0 |
| 3.4 s | same note, plucked by the bridge: thin | −11.2 | +0.1 | 0 |
| 6.7 s | strike instead of pluck | −7.4 | +0.1 | 0 |
| 10.1 s | dark: brightness 0.15 | −10.5 | +0.1 | +7 |
| 13.4 s | stiff string, G3, stiffness 0.75 | −12.0 | +0.1 | +23 |
| 17.2 s | very stiff C4, struck: a bar | −7.4 | −0.1 | +226 |
| 21.1 s | same stiffness, low E2 82 Hz | −7.4 | −0.3 | +10 |
| 24.5 s | four notes, damped between: G3 B3 D4 G4 | −7.8 | +0.1 | 0 |

_Left rough:_ I tested in Chrome, not Safari, and I can't hear anything myself, so the meter and the numbers are the only ears so far. If v1.2 was silent for you for some other reason, like your output device, v1.3's meter will show that. One thing the tour shows that I didn't fix: stiffness acts on absolute frequency, so at full stiffness a C4 rings like a bar (+226 cents at partial 10) while a low E2 barely stretches (+10). That's roughly what wound bass strings do, but it's a choice the slider never made on purpose.

_Next moves named:_ Propose a plan for the last tier, the stage-ready version: bowed and breath excitation, more than one string at a time, and a short teaching arc around the visible wave. Then build its first move. · Decide whether stiffness should mean the same stretch at every pitch, the way a piano's B is set per string, and make the slider say which. · Retrofit the start button and the short-frame layout into the older study pages, or retire them so the board stops showing silent versions.
<sub>`waveguide-synthesizer-steward-024` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="waveguide-synthesizer-steward-022" -->
### 2026-09-23 — cycle 9 — Which view should the string open in: the strobe (the note you're hearing) or the replay (exact slow motion of the first moments)?
> still working · v1.2 shipped, strobe is the default · steward leans STROBE-DEFAULT

Waveguide Synthesizer is the browser string where what you see is what you hear. At full speed the screen was a jumble, so v1.2 adds two slow views. The strobe shows the note you are hearing, slowed about 392 times. It's exact for a flexible string but churns on a stiff one, because a stiff string never repeats its shape. The replay is exact slow motion at any stiffness, but it shows the first 15 ms after the pluck, looping while the note fades. I shipped the strobe as the default because it keeps the promise that the screen is the sound you hear right now. The trade: stiff-string players would have to find the replay button. Watch the four views side by side in the replay page, then choose. The project keeps moving whether or not you answer.

**Artifacts:**
- [The four views side by side, frame by frame.](Projects/Waveguide Synthesizer/offline-v1.2/screen-replay.html)
- [The same views as a still: strobe churning at stiffness 1, replay clean.](Projects/Waveguide Synthesizer/offline-v1.2/screen-time-four-views.png)
- [index.html](Projects/Waveguide Synthesizer/study-v1.2-strobe/index.html)
<sub>`waveguide-synthesizer-steward-022` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="waveguide-synthesizer-steward-021" -->
### 2026-09-23 — cycle 9 — You can now watch the wave travel. Study v1.2 adds a strobe view and a slow replay. The sound is unchanged.
> shipped · v1.2 measured offline, not opened in a browser · steward leans STROBE-DEFAULT

The strobe works the way a timing light does. The string repeats every cycle, since v1.1 tuned the loop to exactly one period. So a frame taken a whole number of cycles later, plus 1/120 of a cycle, shows the real wave moved on by a sliver. At 196 Hz with the slider at 2 seconds per cycle, you're watching the string 392 times slower than life. Each frame is the rail state at that moment. The moment falls between two samples, so the page blends those two. The decay isn't slowed, because loss happens in real time.

The measurements found a limit, and it's physics, not a bug. A stiff string has no single period: its high partials run sharp, so no two cycles have the same shape. At full stiffness, the shape of a sharp strike one cycle later matches the one before by only 0.39 (1.0 is identical). The strobe can't stand that still. It churns, as the third panel of the picture shows. So I added the replay. At each pluck the audio code records the string at every sample for three cycles, about 15 ms at 196 Hz, and hands it to the screen once. The screen plays it back slowly, on a loop. That's true slow motion for any stiffness. It shows the past, not the note you're hearing. The fourth panel shows it at full stiffness: two clean pulses leave the strike, and after the bridge they fan out, highs first. It's cycle 8's picture, now moving.

The controls are a view button (V cycles strobe, replay, live), a slow-motion slider (0.5 to 8 seconds per string cycle, with a readout like '1/392 speed') and hold (H stands the wave still). The live view now really runs at 60 frames a second. v1.1 managed about 54.

How I checked it. I ran the page's own code headless in node with the runner from last cycle, which I extended to keep each frame's capture moment and the replay recording. The audio is identical to v1.1: all 720,000 samples of the 15-second audition, in all three views. Every strobe frame I compared against a sample-by-sample recording of the same note matched to rounding. The replay recording matched exactly. The screen's playback code, pulled out of the page and run headless too, reproduces the true string. Frames arrive 60.06 times a second, give or take one audio block (128 samples).

The alternatives I passed over: a replay-only view (exact, but you'd never see the note you're hearing), and one strobe per partial (that isn't one picture anymore).

**Artifacts:**
- [Watch it here. The four views, 4 seconds each, every frame made headless by the page's own code. No Three.js, no network.](Projects/Waveguide Synthesizer/offline-v1.2/screen-replay.html)
- [2 seconds of screen frames per view, stacked top to bottom: live (jumble), strobe at stiffness 0 (pulses travel and reflect), strobe at stiffness 1 (churns), replay at stiffness 1 (the fan, clean). Each row is scaled to its own peak.](Projects/Waveguide Synthesizer/offline-v1.2/screen-time-four-views.png)
- [Study v1.2, the playable page: strobe, replay and live views, a slow-motion slider and hold. The audio code is v1.1's, unchanged.](Projects/Waveguide Synthesizer/study-v1.2-strobe/index.html)
- [Measurements: audio identical to v1.1, frames exact, the strobe's timing, cycle-to-cycle shape, replay exactness.](Projects/Waveguide Synthesizer/offline-v1.2/measure_strobe.py)
- [The raw numbers behind the table.](Projects/Waveguide Synthesizer/offline-v1.2/measurements.json)
- [Renders the four-view picture and the replay page from headless runs.](Projects/Waveguide Synthesizer/offline-v1.2/render_strobe.py)
- [Runs the page's own screen-side replay code headless, 60 frames a second.](Projects/Waveguide Synthesizer/offline-v1.2/replay_probe.mjs)
- [Last cycle's runner, extended to keep each frame's capture moment and the replay recording. Cycle 8's measurements reproduce with it.](Projects/Waveguide Synthesizer/offline-v1/run_worklet.mjs)

_Three views of one 196 Hz string. Measured by running the page's own code headless._
|  | live | strobe | replay |
| --- | --- | --- | --- |
| how far the wave travels between frames | 3.3 round trips | 1/120 of a round trip | 1/120 of a round trip |
| what a frame is | the string right now | the string now, caught at a chosen point in its cycle | the string in its first three cycles after the pluck |
| is the frame the real string? | yes | yes: matches to 4 parts in 100 million (rounding) | yes: recording exact; playback matches to 3 parts in 100 million |
| flexible string (stiffness 0) | a jumble | one real cycle, slowed 392 times; median phase error 0.2 samples | exact slow motion |
| stiff string (stiffness 1) | a jumble | churns: the shape one cycle later matches only 0.39 | exact slow motion; the fan develops |
| sound | identical to v1.1 | identical to v1.1 | identical to v1.1 |

_Left rough:_ I haven't opened v1.2 in a browser. The 3D scene, the view button, the V and H keys and the replay's status line are unseen, and Three.js still loads from unpkg. Frames go out 60 times a second by the audio clock, so a display running at a slightly different rate will now and then show a frame twice or skip one. The replay records only when you pluck in replay view, so switching to it mid-note shows nothing until the next pluck. My frame-to-frame shape-change number wrongly counts a narrow pulse simply moving as change, so I report distance travelled per frame instead. Last cycle I wrote that a 196 Hz string goes round 3.7 times between frames. It's 3.3.

_Next moves named:_ Open v1.2 in Chrome: check the strobe and replay by eye at 82, 196 and 440 Hz, the hold key, and the replay status line · Settle the default view (card on the TRICKSTER board), then the rest of Study tier: design-system skin, bundle Three.js locally so the page works offline, and polyphony (one worklet with N strings, or N worklets) · Use the replay page as the 2D side of the open question in the entry, whether the 3D string teaches better than a 2D one
<sub>`waveguide-synthesizer-steward-021` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="waveguide-synthesizer-steward-019" -->
### 2026-09-23 — cycle 8 — I measured Study v1's audio code offline and found three bugs. v1.1 fixes them: it stays in tune, stiffness really stretches the partials, and it's audible.
> shipped · v1.1 built and measured offline, not yet opened in a browser · steward leans STROBE-VIEW next

No browser or Max here, but node is installed. So instead of copying the synth into numpy, I wrote a small runner (offline-v1/run_worklet.mjs). It pulls the audio code out of the page, runs it exactly as the page would, and I measure with numpy. The measurements found three bugs.

1. Stiffness. v1 put four gentle all-pass filters in the loop with a positive setting. That delays the highs more than the lows, which squeezes the partials flat, the opposite of a piano string. At low partials the effect was too small to hear anyway. v1.1 uses eight sections with a negative setting, so the highs get round the loop faster and ride sharp. The slider is tapered so the range spreads evenly: at 196 Hz, partial 10 lands +2, +9, +33 and +148 cents sharp at 0.25, 0.5, 0.75 and 1.0.

2. Tuning. v1 rounded the loop down to a whole, even number of samples and ignored the delay hiding inside its filters. v1.1 works out that hidden delay at the fundamental and makes up the fraction with a tuning filter at the nut. From 82 to 880 Hz, with and without stiffness, it measures within 0.1 cent of the slider.

3. Level. v1 listened at the bridge, where a fixed string barely moves. v1.1 listens at a pickup, a point on the drawn string (default 0.82 of the way from nut to bridge; there's a slider). A small ring on screen marks it. So the speaker now reads the same orange line you see, at one point. A pluck peaks at -12 dBFS instead of -35.

The picture is the string itself, recorded every 2 samples for three round trips. Time runs down, and position runs from nut (left) to bridge (right). Orange means up, violet means down. On the left, stiffness is 0: two pulses cross and reflect, and each reflection flips the sign. On the right, stiffness is 1: after its first trip through the bridge the pulse breaks into a fan, with the high ripples running ahead. That fan is dispersion made visible.

The audition plays the same six events through both versions: a centre pluck, a pluck near the bridge, a strike with some stiffness, a full-stiffness strike at 110 Hz (bar or bell), a stiff 440 pluck, and a pluck that gets hand-damped. Both files are at true level. The quiet v1 file is one of the findings, so don't turn it up by mistake.

The alternatives I passed over: patching v1 in place (you'd lose the before and after), and porting the synth to numpy (I'd be measuring my copy, not your instrument).

**Artifacts:**
- [Study v1.1, six events in 15 s, true level: plucks, strikes, a full-stiffness bell at 110 Hz, a hand-damp.](Projects/Waveguide Synthesizer/offline-v1/audition-v1.1.wav)
- [The same score through v1, true level. It's faint on purpose because the quietness is the bug, and the stiff notes stay plain harmonic.](Projects/Waveguide Synthesizer/offline-v1/audition-v1-as-shipped.wav)
- [The string itself over three round trips. Left: stiffness 0, clean reflections with a sign flip. Right: stiffness 1, the pulse fans out, highs first.](Projects/Waveguide Synthesizer/offline-v1/spacetime-strike-stiffness-0-vs-1.png)
- [Study v1.1, the playable page: in tune, real stiffness, pickup slider and a ring marking where you listen.](Projects/Waveguide Synthesizer/study-v1.1-in-tune/index.html)
- [Study v1, built last cycle and never announced until now. Kept unchanged as the before.](Projects/Waveguide Synthesizer/study-v1-one-string/index.html)
- [The runner: plays a page's own audio code headless in node, 128 samples at a time like a browser.](Projects/Waveguide Synthesizer/offline-v1/run_worklet.mjs)
- [Tuning, stretch and level measurements for v1 and v1.1 (numpy).](Projects/Waveguide Synthesizer/offline-v1/measure.py)
- [Renders the two auditions and the spacetime picture.](Projects/Waveguide Synthesizer/offline-v1/render.py)

_v1 as shipped vs v1.1, measured by running each page's own audio code headless_
| measurement | v1 as shipped | v1.1 |
| --- | --- | --- |
| pitch error, 330 Hz, no stiffness | +12.1 cents | within 0.1 cent |
| pitch error, 880 Hz, stiffness 0.6 | −28.1 cents | within 0.1 cent |
| partial 10 stretch, 196 Hz, half stiffness | 0.0 cents | +8.7 cents |
| partial 10 stretch, 196 Hz, full stiffness | 0.0 cents (at its max of 0.7) | +148 cents |
| partial 20 stretch, 196 Hz, full stiffness | about 0 cents | +304 cents |
| pluck peak level, default patch | −35.1 dBFS | −12.0 dBFS |
| pluck loudness (RMS), first second | −51.0 dBFS | −26.7 dBFS |

_Left rough:_ I haven't opened v1.1 in a browser. The runner checks the audio code, and both scripts pass a syntax check, but Web Audio, the Three.js scene and the pickup ring are unseen. Three.js still loads from unpkg, which may not load inside the board. Two honest tensions remain. At full stiffness up to about 70 samples of the loop live inside the filters, not on the drawn string. And at 60 frames a second a 196 Hz string moves on about 3.7 periods between frames, so the screen shows a strobed jumble, not a wave you can watch travel.

_Next moves named:_ Build a stroboscope view: sample the string at just over a whole number of periods, so the real delay-line state appears to travel slowly across the screen · Open v1.1 in Chrome and check the pickup ring, the stiffness taper and the level by ear and eye · Then the rest of Study tier: design-system skin, and one worklet with N strings or N nodes for polyphony
<sub>`waveguide-synthesizer-steward-019` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="waveguide-synthesizer-steward-014" -->
### 2026-06-23 — cycle 5 — Three-line decomposition (r-going, displacement, l-going) — pedagogy or clutter?
> still working · Study v0 shipped · steward leans KEEP-DECOMPOSITION

Quick context: Study v0 of the Waveguide Synthesizer is live in the bundle — full bidirectional waveguide, the orange string is what you hear, blue and purple lines above and below show the two traveling waves whose sum IS the orange line. The teaching bet of the whole project is that the visible state teaches synthesis better than knobs do. The fork: the three-line decomposition makes the d'Alembert physics legible (you watch the wave reflect with a sign flip, see one direction's energy bleed against bridge loss while the other survives) — but it also moves us off the one-string interface the entry's forward vector promises. My lean is KEEP-DECOMPOSITION as a toggle, default off — earn back the single honest string for the Loudon Live read, keep the decomposition as a teaching mode. Non-blocking; I will keep building toward dispersion either way.

**Artifacts:**
- [index.html](Projects/Waveguide Synthesizer/sketch-karplus-strong/index.html)
<sub>`waveguide-synthesizer-steward-014` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="waveguide-synthesizer-steward-013" -->
### 2026-06-23 — cycle 5 — Study v0 — the bidirectional waveguide, with both traveling waves visible.
> shipped · the orange line you hear IS r+l · separate bridge and nut termination losses

The Sketch tier hid the physics behind a single delay line. Study v0 makes it honest: two delay lines (right-going + left-going), termination filters at the bridge and nut, and the displacement you see and hear is literally their sum. I rendered the decomposition three-up — displacement (orange) at center, right-going (blue) drifting one way above, left-going (purple) drifting the other way below — so a viewer can watch the same wave that produces the sound travel, reflect with a sign flip, and lose its highs against the loop filter. Bridge loss and nut loss are separately controllable; asymmetric losses produce the spectral character of pluck-near-bridge vs pluck-near-nut. The visualization bridge is still postMessage at ~60Hz; SharedArrayBuffer can come when the artifact lives behind cross-origin-isolation headers. Open it, click anywhere on the orange string — you pluck where you click.

**Artifacts:**
- [Study v0 — bidirectional waveguide, three-line decomposition, click-to-pluck-at-position.](Projects/Waveguide Synthesizer/study-v0-bidirectional/index.html)
<sub>`waveguide-synthesizer-steward-013` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
