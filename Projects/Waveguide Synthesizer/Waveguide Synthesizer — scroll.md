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

> _Regenerated 2026-10-14T01:13:09.288Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 17 · last ran 2026-10-14 (today)
- **Plan:** agreed 2026-10-13 (today) · 3 made things since
- **Waiting on you:** nothing
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-13 (today) — Study v1.10: an overtone ladder shows each overtone running sharp as the string stiffens, and it matches the sound to a quarter of a cent. (`waveguide-synthesizer-steward-041`)
- **Last commit touching this project:** 2026-10-13 `b3de3535` — steward(Waveguide Synthesizer): cycle 16 — SPINNING UP. HOME: [[Waveguide Synthesizer]]. Neighborhood loaded. Cycl…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Waveguide Synthesizer is the browser string whose on-screen wave is the sound: two delay lines carry a right-going and a left-going wave, and their sum is the string you see and hear. It can be plucked, struck and bowed, and it sits on a soundboard. You set the order: first make every slider visibly change the picture, then the body, then the bow, then even stiffness, then a guided teaching walk. The picture, the body and the bow are done. This cycle is stiffness. Stiffness already sounded right and meant the same at every pitch, but all you could see was the string getting thicker. Now an overtone ladder in the top right shows why a stiff string sounds like a piano or a struck bar: each ov…

### Open asks

_None — nothing is waiting on you._

### Answered, not yet consumed

_None._

### Decided

- `waveguide-synthesizer-steward-033` — your order, written down as the plan → GRANTED — option_id=adopt (2026-10-13)
- `waveguide-synthesizer-steward-028` — a plan for the stage-ready string → GRANTED — (no option_id); notes: "Start by really mastering this imagery, it is fantastic, but we need to make very clear visual changes with each slider. For instance if the nut changed visual when I moved "nut loss" I woudl make the very clear connection of which of the two shapes was the nut.. Take this same logic throughout the interface, making really clear connections between faders and the image is the first step, before adding more features. Then, body, then bow, then even stiffness then teaching." (2026-10-13)
- `waveguide-synthesizer-steward-025` — directional_decision → GRANTED — option_id=HEARD-BOTH (2026-10-13)
- `waveguide-synthesizer-steward-022` — directional_decision → GRANTED — option_id=STROBE-DEFAULT; notes: "I am unable to hear anything in any of these examples, I wonder why this is?" (2026-09-24)
- `waveguide-synthesizer-steward-014` — directional_decision → GRANTED — option_id=DROP-DECOMPOSITION (2026-06-25)

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
Where this is going: a stage-ready browser string whose picture IS the sound, where every control you touch changes something you can see, used to teach how a plucked or bowed string works.

1. Master the picture. Every slider makes a clear, visible change to the thing it names (nut loss changes the nut, pitch changes the bead count of the delay line, and so on), and touching a slider lights up its object. First version shipped as study v1.6; refine it until Loudon says every link reads.
2. The body. A soundboard under the bridge, drawn so you can see it take energy from the string and colour the tone; the bridge becomes the door between string and body.
3. The bow, made visible. The bow already sings; make its stick-and-slip, its force and its speed readable in the picture as clearly as the ends now are.
4. Even stiffness, made visible. Stiffness already means the same at every pitch; show the overtones running sharp so you can see why a stiff string sounds like a piano or a bell.
5. Teaching. A guided walk through the string: pluck, reflection, loss, pitch, stiffness, bow, body, each step one slider and one thing to watch and hear.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
Written by Claude on Loudon's behalf, 2026-09-23: your last two cycles posted nothing and the deck now reads STALLED. This run is the retry that matters. Ship the smallest audible thing toward the forward vector with numpy (this container has no Max, no GPU), post it as a shipped_artifact with the WAV attached, and if a real fork remains after that, ask it as one non-blocking card — never a silent cycle.
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="waveguide-synthesizer-steward-041" -->
### 2026-10-13 — cycle 17 — Study v1.10: an overtone ladder shows each overtone running sharp as the string stiffens, and it matches the sound to a quarter of a cent.
> shipped · the stiffness step in your order · steward leans fix the bow physics, then teaching

**What's new in [study v1.10](obsidian://open?vault=The%20Palace&file=Projects/Waveguide%20Synthesizer/study-v1.10-the-overtones-run-sharp/index.html):**

- **The overtone ladder, top right, titled 'what the ring hears'.** Each dashed rung marks where a perfectly flexible string would put an overtone: 2, 3, 4… times the note. Each amber bar marks where *this* string puts it, as tall as it is ringing at the pickup right now. When the string is stiff, a slanted line runs from the top of each rung to its bar's foot, so you can see how far each overtone has moved. Under the bars is how sharp overtones 2, 4, 8 and 16 run, in cents.
- **The stiffness slider now lights the ladder** as well as the string's thickness. Drag it and the bars fan out to the right, the high ones furthest. At 0 they sit on their rungs. At 0.4 overtone 16 is 35 ¢ sharp. At 0.7 it is 245 ¢ sharp. At 1.0 it is more than an octave out.
- **One line of words says what you're hearing:** *harmonic, like gut or nylon* · *a little stiff, like a piano's middle* · *stiff, like a piano's outer octaves* · *very stiff: no longer a series, a struck metal bar, toward a bell*.
- **The bars are measured, not drawn from a formula.** The engine works out where its loop really rings each overtone: the frequency at which one trip round the loop takes exactly that many periods. Then it listens at each of those frequencies, at the pickup, in short six-cycle windows. So the ladder shows what the filter actually achieved. That differs from the textbook rule at stiffness 1.0, and also at stiffness 0, where every overtone sits 1 to 2 ¢ sharp because of the loop's own small stretch.
- **The walk has thirteen steps now.** The stiffness step points at the ladder. A new step holds stiffness at 0.70 while the note climbs two octaves, from C3 to C5. The ladder keeps its shape, because one wire of one thickness bends its overtones by the same cents at every pitch. That is v1.5's even stiffness, finally visible.

**How I checked it:** I ran the page's own engine headless in Node at four notes and four stiffnesses. For each, I took the audio and found every overtone's real peak with a fine FFT. Every bar loud enough to measure is within 0.26 ¢ of the peak in the sound, and at most notes within 0.05 ¢ (ladder-vs-sound.json). Then I photographed the ladder at five settings and recorded the whole walk in Chrome, picture and sound. There were no page errors, and every step peaked between −17.5 and −6.2 dBFS. The recording caught one bug, which is fixed: during the pitch sweep the ladder went dark. That turned out to be true to the string rather than a ladder fault. Between replucks the string's own sound dies within about a second at higher notes, and the soundboard rings on after it. So the bars now fall at 30 dB a second instead of 60, slow enough to read after a pluck.

**Passed over:** drawing the stretch on the string itself (a stiff string's strobe picture already can't stand still, and the replay view shows the high ripples running ahead). A cents-against-overtone curve was the other option, but it's more abstract. Rungs against bars can be read without knowing what a cent is.

**Artifacts:**
- [study v1.10, playable: click to start, pluck the string, then drag stiffness and watch the ladder top right.](Projects/Waveguide Synthesizer/study-v1.10-the-overtones-run-sharp/index.html)
- [the whole thirteen-step walk, picture and sound, 98 s. Steps 6 and 7 (from about 0:38) are the stiffness steps.](Projects/Waveguide Synthesizer/offline-v1.10/stiff-walk.mp4)
- [the ladder at G3 with stiffness 0, 0.4, 0.7 and 1.0, then C5 at 0.7: the same lean two octaves up.](Projects/Waveguide Synthesizer/offline-v1.10/ladder-sheet.png)
- [G3 plucked at stiffness 0, 0.4, 0.7, 1.0 (2 s each), then C3 to C5 at 0.7, from the page's own engine.](Projects/Waveguide Synthesizer/offline-v1.10/stiffness-tour.wav)
- [the walk's sound alone, as the engine produced it.](Projects/Waveguide Synthesizer/offline-v1.10/stiff-walk.wav)
- [walk step 6, stiffness near full: the bars fan out off their rungs.](Projects/Waveguide Synthesizer/offline-v1.10/frames/step-06.png)
- [walk step 7, C5 at stiffness 0.70: the ladder keeps the shape it had at C3.](Projects/Waveguide Synthesizer/offline-v1.10/frames/step-07.png)
- [stiffness 0: every bar on its rung.](Projects/Waveguide Synthesizer/offline-v1.10/still-s0.png)
- [stiffness 0.4: the top overtones lean.](Projects/Waveguide Synthesizer/offline-v1.10/still-s04.png)
- [stiffness 0.7: the overtones pull apart.](Projects/Waveguide Synthesizer/offline-v1.10/still-s07.png)
- [stiffness 1.0: no longer a series.](Projects/Waveguide Synthesizer/offline-v1.10/still-s10.png)
- [C5 at 0.7, for comparison with G3 at 0.7.](Projects/Waveguide Synthesizer/offline-v1.10/still-c5-s07.png)
- [runs the engine headless at 4 notes × 4 stiffnesses, records what the ladder was told, renders the tour.](Projects/Waveguide Synthesizer/offline-v1.10/ladder_probe.mjs)
- [where the ladder put each overtone, and its levels.](Projects/Waveguide Synthesizer/offline-v1.10/ladder-probe.json)
- [finds each overtone's real peak in the audio and compares it with the ladder's bar.](Projects/Waveguide Synthesizer/offline-v1.10/measure_ladder.py)
- [the check: ladder cents against sound cents, and the worst miss per setting.](Projects/Waveguide Synthesizer/offline-v1.10/ladder-vs-sound.json)
- [what plays when in the tour, and its peak.](Projects/Waveguide Synthesizer/offline-v1.10/stiffness-tour.json)
- [photographs the ladder at five settings in Chrome.](Projects/Waveguide Synthesizer/offline-v1.10/stills.mjs)
- [no page errors; what the ladder and the slider said at each setting.](Projects/Waveguide Synthesizer/offline-v1.10/stills.json)
- [the walk recorder, carried over from v1.9.](Projects/Waveguide Synthesizer/offline-v1.10/record_walk.mjs)
- [no page errors; each step's peak.](Projects/Waveguide Synthesizer/offline-v1.10/walk-record.json)
- [the stand-in speaker clock, reused from v1.9.](Projects/Waveguide Synthesizer/offline-v1.10/fake_audio_clock.js)
- [applies every v1.10 change onto the v1.9 page, engine and picture.](Projects/Waveguide Synthesizer/offline-v1.10/patch_page.py)
- [the ladder's drawing code that patch_page.py inserts.](Projects/Waveguide Synthesizer/offline-v1.10/drawLadder.js)

_How sharp each overtone runs, in cents: the ladder's number, checked against the sound (offline-v1.10/ladder-vs-sound.json)_
| setting | overtone 2 | overtone 4 | overtone 8 | overtone 16 | worst bar vs sound |
| --- | --- | --- | --- | --- | --- |
| G3 · stiffness 0 | +1.0 | +1.2 | +1.4 | +1.6 | 0.00 ¢ |
| G3 · 0.4 | +1.4 | +3.3 | +9.8 | +35 | 0.01 ¢ |
| G3 · 0.7 | +4.2 | +17 | +67 | +245 | 0.01 ¢ |
| G3 · 1.0 | +25 | +122 | +476 | +1195 | 0.01 ¢ |
| C5 · 0.7 | +4.2 | +17 | +67 | +227 | 0.05 ¢ |
| C3 · 1.0 | +25 | +123 | +478 | +1195 | 0.26 ¢ |

_Left rough:_ At stiffness 1.0 the filter overshoots the stiff-string rule at G3: overtone 8 is +476 ¢ against the rule's +420. The ladder shows the overshoot honestly, and the slider's own note already warns that the note strays, but the sound isn't what the rule asks for. Between replucks in the walk, the string goes quiet within about a second at higher notes while the soundboard keeps ringing, which may mean the board's tail is too long. I haven't judged that by ear. I didn't hear any of this through speakers: I reused last cycle's stand-in clock for the Chrome recordings rather than testing the audio device again. The bow physics the grip chart exposed last cycle (the slip should track bow position, and a too-heavy bow should crunch instead of pinning) is still unfixed. I took the next step in your order instead.

_Next moves named:_ Your eyes on walk steps 6 and 7 (from about 0:38 in stiff-walk.mp4): do the bars leaving their rungs make 'the overtones run sharp' read at a glance? · Next cycle: fix the bow physics the grip chart exposed (slip that tracks bow position, a smoother plateau, a heavy bow that breaks away), so the bow is honest before the teaching walk puts it on stage. · Then the last step in the plan: the guided teaching walk (pluck, reflection, loss, pitch, stiffness, bow, body), each step one slider, one thing to watch and one thing to hear.
<sub>`waveguide-synthesizer-steward-041` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="waveguide-synthesizer-steward-039" -->
### 2026-10-13 — cycle 16 — Study v1.9: you can see the bow grip. A dot where hair meets string, and a chart of one cycle, show it catch, drag and let go.
> shipped · the bow step in your order · steward leans watch the walk's last four steps

**What's new in [study v1.9](obsidian://open?vault=The%20Palace&file=Projects/Waveguide%20Synthesizer/study-v1.9-the-bow-grips/index.html):**

- **A dot where hair meets string.** It's amber and full while the hair holds the string. The instant the hair lets go, it shrinks to a dark bead with a white spark. It runs on the same slowed clock as the string, so you see it let go exactly when the sharp corner arrives at the bow.
- **The bow's grip chart,** in the empty space under the nut, joined to the bow by a dotted thread. It shows one string cycle, with a cursor at the moment the screen is showing. The top strip is the hair: amber where it holds, dark where it slips. The middle is the string's real speed at the bow point against a dashed line for the bow's own speed. While the hair holds, the string rides that line; when it lets go, the string flies back. The bottom is the friction curve: how hard the hair grips against how far the string's speed has strayed from the bow's.
- **Each bow slider now changes one thing on the chart.** Bow speed raises the dashed line. Bow force widens the amber grip window on the friction curve. Bow position moves where the slip lands. Touch or hover a slider and its mark lights up, the same way the nut and bridge do.
- **The chart puts the result in words:** *singing* (lets go once a cycle), *breaking up* (two or three times), *skating* (never catches), or *pinned* (never lets go).
- **The walk has twelve steps now.** The bow steps point at the chart, and a new last step slows one catch and one release right down.

**What it shows (table).** At the default setting the hair holds 90% of the cycle and lets go once. That is the Helmholtz motion every bowed string makes when it sings. At light force it holds only 67% and slips back at a steady speed: the clean square wave from the textbooks. At full force the string under the bow stops moving. The page says so instead of pretending the string sings.

**Fixed along the way:** moving from a pinned step to the next one used to crack at full scale. Now the walk quiets the string between bow steps, and lifting a pinned bow quiets it too. Every step of the recorded walk now peaks between −17.5 and −4.4 dBFS.

**How I checked it:** I ran the page's own engine headless in Node for the numbers and the grip tour. I recorded the whole walk in Chrome, picture and sound, with no page errors. One honest wrinkle: this Mac's audio device wouldn't render for any Chrome tonight (even a bare test tone's clock sat at zero). So the browser recordings ran the page's own engine on the main thread, kept in real time by a stand-in clock, and took the sound straight from the engine's output. The DSP is the page's. Only the path to the speakers was faked.

**Artifacts:**
- [the whole twelve-step walk, picture and sound, 91 s. Watch from step 9 (about 1:00): the bow steps and the slowed catch at the end.](Projects/Waveguide Synthesizer/offline-v1.9/bow-walk.mp4)
- [study v1.9, playable: click to start, hold B to bow, then move the three bow sliders and watch the chart.](Projects/Waveguide Synthesizer/study-v1.9-the-bow-grips/index.html)
- [six frames: default, light force, full force, near the bridge, then one slowed frame holding and one letting go.](Projects/Waveguide Synthesizer/offline-v1.9/grip-sheet.png)
- [the five bow settings in the table, 2.5 s each, from the page's own engine.](Projects/Waveguide Synthesizer/offline-v1.9/grip-tour.wav)
- [the walk's sound alone, as the engine produced it.](Projects/Waveguide Synthesizer/offline-v1.9/bow-walk.wav)
- [walk step 11, bow force near full: the grip window fills the friction curve.](Projects/Waveguide Synthesizer/offline-v1.9/frames/step-11.png)
- [walk step 12, the catch and release slowed down.](Projects/Waveguide Synthesizer/offline-v1.9/frames/step-12.png)
- [light force: the square-wave slip, ride then fall back.](Projects/Waveguide Synthesizer/offline-v1.9/still-light-force.png)
- [full force: pinned, the hair never lets go.](Projects/Waveguide Synthesizer/offline-v1.9/still-heavy-force.png)
- [runs the engine headless and reads back the grip trace across every bow slider.](Projects/Waveguide Synthesizer/offline-v1.9/grip_probe.mjs)
- [what the probe measured, with the traces.](Projects/Waveguide Synthesizer/offline-v1.9/grip-probe.json)
- [renders the grip tour and its numbers.](Projects/Waveguide Synthesizer/offline-v1.9/grip_tour.mjs)
- [the table above, as the script wrote it.](Projects/Waveguide Synthesizer/offline-v1.9/grip-tour.json)
- [the walk recorder, carried over from v1.8, now on the stand-in clock.](Projects/Waveguide Synthesizer/offline-v1.9/record_walk.mjs)
- [no page errors; each step's peak.](Projects/Waveguide Synthesizer/offline-v1.9/walk-record.json)
- [photographs five bow settings and a slowed run of frames.](Projects/Waveguide Synthesizer/offline-v1.9/stills.mjs)
- [what the chart said at each setting.](Projects/Waveguide Synthesizer/offline-v1.9/stills.json)
- [the stand-in speaker clock used because the audio device wouldn't render.](Projects/Waveguide Synthesizer/offline-v1.9/fake_audio_clock.js)
- [builds the six-frame sheet.](Projects/Waveguide Synthesizer/offline-v1.9/contact_sheet.py)
- [applies the page-side changes onto v1.8.](Projects/Waveguide Synthesizer/offline-v1.9/patch_page.py)
- [the chart, dot and thread code that patch_page.py inserts.](Projects/Waveguide Synthesizer/offline-v1.9/drawGrip.js)

_G3 bowed, measured from the page's own engine (offline-v1.9/grip-tour.json)_
| bow setting | chart says | hair holds | lets go per cycle | peak dBFS |
| --- | --- | --- | --- | --- |
| default (speed 0.5, force 0.7, at 0.74) | singing | 90% | 1 | −5.7 |
| light force 0.2 | singing, slow square wave | 67% | 1 | −24.1 |
| full force 1.0 | pinned | 100% | 0 | −9.5 |
| near the bridge 0.93 | singing | 88% | 1 | −7.7 |
| fast bow 1.0 | breaking up (wavers) | 89% | 2 | −6.7 |

_Left rough:_ The chart shows something the textbook says should be different. The equation above says the slip should shrink as the bow moves toward the bridge (40% of the cycle at 0.6, 7% at 0.93). This model slips about 9–18% wherever the bow sits, so bow position doesn't change the slip the way it should. The plateau also ripples a lot (the string's speed swings between about 0.3 and 2.3 times the bow's while the hair holds). And a pinned string has no point where its own pull breaks the hair free, so it gets dragged further and further off its rest line. Lifting the bow now quiets it rather than cracking, but that is a guard, not physics. At a fast bow the chart wavers between 'singing' and 'breaking up'. I couldn't hear any of this through speakers tonight.

_Next moves named:_ Your eyes on the walk from step 9: does the dot and chart make the catch-and-release read as clearly as the nut and bridge do? · Then fix what the chart exposed, still inside the bow step: tune the friction so the slip tracks bow position (the d/L rule), smooth the plateau, and add breakaway so a too-heavy bow crunches instead of pinning. The chart will show each fix working.
<sub>`waveguide-synthesizer-steward-039` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-waveguide-synthesizer-steward-033" -->
### 2026-10-13 — Plan agreed: I've written your note as the plan: picture first, then body, bow, even stiffness, teaching. Adopt it so I build along it?

The waveguide string is tuned and can be plucked, struck and bowed, and stiffness now means the same at every pitch. Last cycle I proposed a plan. You answered with a note instead of choosing an option, so the board still shows no agreed plan. Your note set the order: make every slider visibly change the picture first, then the body, then the bow, then even stiffness, then teaching. The bow and even stiffness already work, so I've read those steps as making each one visible and teachable in the same way, not building it again. The first step shipped this cycle as v1.6. Adopting this makes your order the plan of record. If I've misread the bow and stiffness steps, choose 'keep' and tell me.
<sub>`plan-waveguide-synthesizer-steward-033` · plan agreed · agreed 2026-10-13T21:42:53.227Z · proposed by Waveguide Synthesizer's steward (`waveguide-synthesizer-steward-033`), adopted by Loudon (`resp-mv77j2uj-q5eww1`)</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="waveguide-synthesizer-steward-037" -->
### 2026-10-13 — cycle 15 — Study v1.8: the string has a body. What the bridge takes from the string now goes down a post into a soundboard you can see ripple and hear.
> shipped · the body, the next step in your order · steward leans watch the walk video

**What's new in [study v1.8](obsidian://open?vault=The%20Palace&file=Projects/Waveguide%20Synthesizer/study-v1.8-the-body/index.html):**

- **A soundboard under the bridge, and a post joining them.** The board is a plate that ripples in the shapes of its own twelve modes. Each ripple is as big as the audio engine says that mode is ringing right now. Each one turns on the same slowed clock as the string, so a mode five times the note's frequency turns five times per turn of the clock hand.
- **Bridge loss now feeds the board, visibly and audibly.** A rigid bridge (1.000) leaves the post a dark hairline and the board still; its label reads *gets nothing: rigid bridge*. Soften the bridge and the post thickens and glows, the board heaves, and the note gets shorter, louder and woodier. The board's label gives the share of energy it receives on each bounce. Nothing is invented here: the energy the string loses at the bridge is exactly the energy the board gets.
- **A new slider, body size, which changes the board's size.** At 0 there is no board and you hear the bare wire, which is v1.7's sound exactly. A small board sits high, from about 170 Hz, and sounds boxy. A big one reaches down to about 50 Hz and booms.
- **The walk has eleven steps now.** The bridge step runs from hard to soft, so you watch the post and board light up. A new step grows the board from nothing. The caption box moved to the empty lower-left so it no longer covers the board.
- **Two leftovers from last cycle are fixed.** The sliders now wear the house dress (graphite track, amber thumb), and the bow's arrow stays inside the frame at full speed.

**How I checked it:** I ran the page's own audio engine headless in Node to set the board's level. At the default settings the board and the string sit within about a decibel of each other: −28.2 vs −27.2 dB RMS on a G3 pluck. Then I recorded the whole walk in Chrome, picture and sound together. There were no page errors. Every step peaked between −13.5 and −4.8 dBFS, so nothing went silent and nothing clipped.

**Artifacts:**
- [the whole eleven-step walk recorded in Chrome, picture and sound, 85 seconds. Watch this first: steps 2 and 3 are the new body.](Projects/Waveguide Synthesizer/offline-v1.8/body-walk.mp4)
- [study v1.8, playable: click to start the sound, then pluck, bow (B), or press walk the links (W).](Projects/Waveguide Synthesizer/study-v1.8-the-body/index.html)
- [the body's two links side by side: rigid vs soft bridge (top), small vs big board (bottom).](Projects/Waveguide Synthesizer/offline-v1.8/body-links-sheet.png)
- [six G3 plucks, bridge from rigid to soft: longer and thinner, then shorter and woodier as the board takes more.](Projects/Waveguide Synthesizer/offline-v1.8/bridge-feeds-body.wav)
- [five G3 plucks, body size 0, 0.25, 0.5, 0.75, 1: bare wire, boxy, guitar, deep.](Projects/Waveguide Synthesizer/offline-v1.8/body-size-tour.wav)
- [a bowed G3 with no board, a middle board, and a big board.](Projects/Waveguide Synthesizer/offline-v1.8/bowed-with-body.wav)
- [the walk's sound alone, as the page sent it to the speakers.](Projects/Waveguide Synthesizer/offline-v1.8/body-walk.wav)
- [walk step 2, bridge loss near its softest: the fat glowing post.](Projects/Waveguide Synthesizer/offline-v1.8/frames/step-02.png)
- [walk step 3, body size near full: the big board.](Projects/Waveguide Synthesizer/offline-v1.8/frames/step-03.png)
- [the headless renderer: runs the page's own engine in Node, measures levels and ring times, writes the three WAVs.](Projects/Waveguide Synthesizer/offline-v1.8/body_render.mjs)
- [every level and ring time the renderer measured.](Projects/Waveguide Synthesizer/offline-v1.8/body-levels.json)
- [the walk recorder, carried over from v1.7 and pointed at v1.8.](Projects/Waveguide Synthesizer/offline-v1.8/record_walk.mjs)
- [what the recorder measured: no errors, the peak of each step.](Projects/Waveguide Synthesizer/offline-v1.8/walk-record.json)
- [photographs the board in five states in Chrome, for the contact sheet.](Projects/Waveguide Synthesizer/offline-v1.8/stills.mjs)
- [the five states: meter level, how much the board moved, how hard the post was driven.](Projects/Waveguide Synthesizer/offline-v1.8/stills.json)

_G3 pluck, from the headless render: the board's size and the bridge's softness, heard as level and ring time_
| body size | bridge loss | peak (dBFS) | rings for (s) |
| --- | --- | --- | --- |
| 0 (no board) | 0.985 | −9.6 | 1.08 |
| 0.5 | 1.000 (rigid) | −14.7 | 2.98 |
| 0.5 | 0.985 (default) | −10.3 | 1.04 |
| 0.5 | 0.960 | −7.3 | 0.48 |
| 0.5 | 0.900 (soft) | −4.4 | 0.20 |
| 1.0 (big board) | 0.985 | −13.0 | 1.16 |

_Left rough:_ The board is a generic guitar-like plate. Its twelve modes come from a hand-made table, not from measuring a real instrument, so 'guitar-sized' means a plausible guitar, not a specific one. The board's ripples are its true modes at their true levels, but with a soft bridge the pluck dies in a fifth of a second, so in stills the board is often caught nearly flat; the video shows it better. High notes (A4 and up) get less body, about 12 dB under the string, because few of their partials land on the board's modes. That is real behaviour, but you may want more. And I still haven't heard your read on last cycle's walk, so the picture step stays open to your notes.

_Next moves named:_ Your eyes and ears on the body-walk video: tell me if the post-and-board link lands as clearly as the nut and bridge did, and whether the board sounds like wood or like a filter. · Then the bow, the next step in your order: making the stick-and-slip of the bow visible at the bow point, so you see it catch and let go, the way the board now shows where the energy goes.
<sub>`waveguide-synthesizer-steward-037` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="waveguide-synthesizer-steward-035" -->
### 2026-10-13 — cycle 14 — Study v1.7: press 'walk the links' and the page moves each slider for you, end to end, while the string plays, saying what to watch and hear.
> shipped · still mastering the picture, before the body · steward leans watch the video first

**What's new in [study v1.7](obsidian://open?vault=The%20Palace&file=Projects/Waveguide%20Synthesizer/study-v1.7-walk-the-links/index.html):**

- **Walk the links (button, or W).** Ten steps, about 7.5 seconds each. The page resets the string, moves one slider slowly from one end to the other while the string keeps sounding (re-plucked, or bowed for the three bow sliders), lights up that slider's name in the panel, and puts a caption under the string: what to watch, and what to listen for. It starts with your own example, nut loss: *'watch the post on the left harden from soft swollen felt into lit steel. listen: the note rings longer.'* Touch any slider and the walk stops and hands control back to you. Nothing is staged: the walk moves the same sliders your hand would.
- **Slow motion has an object now: a clock above the string.** One turn of the hand is one string cycle as you see it. Slow the motion and the hand slows with the wave. Hold, and it stops. The label says what the sound never does: only the picture slows.
- **The dark end of brightness is a deep ember now,** not the salmon-red of v1.6. The glow is turned down at the dark end so it no longer washes the red out.
- The slider panel scrolls, so the bow-position and slow-motion sliders are reachable on a short screen, and the walk scrolls each slider into view as it moves.

**How I checked it:** I recorded the whole walk in Chrome, video plus the page's own sound tapped straight off the waveguide, and muxed them into one clip. No page errors. Sound peaked between −15 and −5 dBFS on every step, so nothing went silent and nothing clipped. The audio engine is v1.6's, unchanged.

**Artifacts:**
- [the whole walk recorded in Chrome, picture and sound together, 77 seconds. Watch this one first.](Projects/Waveguide Synthesizer/offline-v1.7/walk-the-links.mp4)
- [study v1.7, playable: click to start the sound, then press 'walk the links' or W.](Projects/Waveguide Synthesizer/study-v1.7-walk-the-links/index.html)
- [one frame from late in each of the ten steps, slider near its far end.](Projects/Waveguide Synthesizer/offline-v1.7/walk-contact-sheet.png)
- [the walk's sound alone, as the page sent it to the speakers.](Projects/Waveguide Synthesizer/offline-v1.7/walk-the-links.wav)
- [the recorder: runs the walk in Chrome, taps the audio, muxes the clip, logs errors and meters.](Projects/Waveguide Synthesizer/offline-v1.7/record_walk.mjs)
- [what the recorder measured: no errors, the peak of each step.](Projects/Waveguide Synthesizer/offline-v1.7/walk-record.json)
- [step 1, nut loss: the nut hardened to lit steel.](Projects/Waveguide Synthesizer/offline-v1.7/frames/step-01.png)
- [step 2, bridge loss.](Projects/Waveguide Synthesizer/offline-v1.7/frames/step-02.png)
- [step 3, pitch: the beads thinned out at a high note.](Projects/Waveguide Synthesizer/offline-v1.7/frames/step-03.png)
- [step 4, brightness: white-hot.](Projects/Waveguide Synthesizer/offline-v1.7/frames/step-04.png)
- [step 5, stiffness: wire swollen to rod.](Projects/Waveguide Synthesizer/offline-v1.7/frames/step-05.png)
- [step 6, pickup: the ring slid along.](Projects/Waveguide Synthesizer/offline-v1.7/frames/step-06.png)
- [step 7, slow motion: the clock lit, hand slowed.](Projects/Waveguide Synthesizer/offline-v1.7/frames/step-07.png)
- [step 8, bow position.](Projects/Waveguide Synthesizer/offline-v1.7/frames/step-08.png)
- [step 9, bow speed: the long arrow.](Projects/Waveguide Synthesizer/offline-v1.7/frames/step-09.png)
- [step 10, bow force: the wide, glowing bow.](Projects/Waveguide Synthesizer/offline-v1.7/frames/step-10.png)

_the walk, step by step: the slider and its object, and the loudest moment of each step_
| step | slider → what moves | peak |
| --- | --- | --- |
| 1 | nut loss → the steel post, left | −9.2 dBFS |
| 2 | bridge loss → the brass block, right | −6.6 |
| 3 | pitch → the beads (one per sample) | −7.1 |
| 4 | brightness → the string's colour | −6.6 |
| 5 | stiffness → the string's thickness | −10.9 |
| 6 | pickup → the ring | −7.8 |
| 7 | slow motion → the clock | −9.6 |
| 8 | bow position → where the bow sits | −15.0 |
| 9 | bow speed → the arrow's length | −11.0 |
| 10 | bow force → the bow's width and glow | −4.8 |

_Left rough:_ In a few photos the plucked string looks nearly flat. That's the slow-motion strobe catching it as it swings through its rest line, not a fault, but it means some frames sell the link less well than the video does. At full bow speed the arrow pokes out of the top of the frame. The sliders are still the browser's default blue, not the house dress. And I've only checked it with a recording; I can't know whether the captions read well at that speed until you watch it.

_Next moves named:_ Your eyes on the walk video: tell me which links still don't land, and I'll strengthen those first. I'll also keep the arrow inside the frame and skin the sliders in the house dress. · Then the body, which your note puts next: a soundboard under the bridge, drawn so you can see it take energy from the string.
<sub>`waveguide-synthesizer-steward-035` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="waveguide-synthesizer-steward-033" -->
### 2026-10-13 — cycle 13 — I've written your note as the plan: picture first, then body, bow, even stiffness, teaching. Adopt it so I build along it?
> still working · the picture step is shipped as v1.6 · steward leans adopt

The waveguide string is tuned and can be plucked, struck and bowed, and stiffness now means the same at every pitch. Last cycle I proposed a plan. You answered with a note instead of choosing an option, so the board still shows no agreed plan. Your note set the order: make every slider visibly change the picture first, then the body, then the bow, then even stiffness, then teaching. The bow and even stiffness already work, so I've read those steps as making each one visible and teachable in the same way, not building it again. The first step shipped this cycle as v1.6. Adopting this makes your order the plan of record. If I've misread the bow and stiffness steps, choose 'keep' and tell me.

**Artifacts:**
- [board-frame-stiffness.png](Projects/Waveguide Synthesizer/offline-v1.5/board-frame-stiffness.png)
- [index.html](Projects/Waveguide Synthesizer/study-v1.5-even-stiffness/index.html)
- [even-stiffness-tour.wav](Projects/Waveguide Synthesizer/offline-v1.5/even-stiffness-tour.wav)
- [stretch-by-pitch.png](Projects/Waveguide Synthesizer/offline-v1.5/stretch-by-pitch.png)
<sub>`waveguide-synthesizer-steward-033` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="waveguide-synthesizer-steward-032" -->
### 2026-10-13 — cycle 13 — Study v1.6: every slider now visibly changes the thing it names. Move nut loss and the nut goes soft and dim; hover a slider and its object lights up.
> shipped · sound unchanged from v1.5, all nine sliders now visible · steward leans body next

What each slider now does to the picture (the sound is exactly v1.5's):

- **pitch → the beads.** The string carries one bead per sample of its delay line, and a label reads the note and the count (G3: about 117 samples each way). Low notes are a dense string of beads; at 880 Hz you can count them, 27 of them. That makes the core waveguide idea visible: fewer samples in the loop means a higher note.
- **brightness → the string's colour.** Ember red when dark, white-hot when bright. And you can watch the dark string go still much sooner, because the loop filter eats its energy.
- **bridge loss → the brass block. nut loss → the steel post.** At 1.000 the end is tall, crisp, opaque and lit: it gives every bit of energy back. Toward 0.900 it squats, swells, dims, turns half see-through and grows a dark halo, like felt soaking the wave up. Each end is labelled by name, with what it keeps per bounce ('nut · keeps 99.5% each bounce').
- **stiffness → thickness.** A thin wire becomes a fat rod, which is also the physics: a thicker string is a stiffer one.
- **pickup → the labelled ring. bow position → where the bow sits. bow speed → the bow's arrow,** short to long, creeping while you bow. **bow force → the bow's width and glow.**

To link a slider to its object, hover a slider's name (or drag it), and the thing it drives flares warm and its label brightens. Each slider's name now also says what it moves ('nut loss · the steel post, left'). Two fixes made the picture readable. On a wide screen the string now sits beside the slider panel, which used to hide the nut. And a bowed string, which the bow holds far off its rest line, no longer flies off the screen: the drawing shrinks to fit and says so ('height drawn at 76% to fit the frame').

Checked in Chrome. Each slider was set to its low end and then its high end, with a fresh pluck or a held bow for every photo; that's the contact sheet. The page throws no errors, and the same pluck reads −9.6 dBFS on v1.5 and v1.6, so the sound didn't move.

**Artifacts:**
- [Study v1.6: play it here; hover any slider's name and watch what lights up.](Projects/Waveguide Synthesizer/study-v1.6-every-slider-shows/index.html)
- [Contact sheet: every slider at its low end (left) and high end (right).](Projects/Waveguide Synthesizer/offline-v1.6/every-slider-shows.png)
- [Hovering 'nut loss': the steel post on the left glows.](Projects/Waveguide Synthesizer/offline-v1.6/board-frame-hover-nut.png)
- [Drives each slider end to end in Chrome, photographs it, and compares the output level with v1.5.](Projects/Waveguide Synthesizer/offline-v1.6/slider_sheet.mjs)
- [Lays those photos out as the contact sheet.](Projects/Waveguide Synthesizer/offline-v1.6/contact_sheet.mjs)
- [The run: meters for v1.5 and v1.6, every shot taken, no errors.](Projects/Waveguide Synthesizer/offline-v1.6/slider-sheet.json)

_Each slider and what it now changes in the picture_
| slider | what moves on screen | low end | high end |
| --- | --- | --- | --- |
| pitch | beads, one per sample | 60 Hz: a dense bead line | 880 Hz: 27 beads you can count |
| brightness | string colour | ember red, dies fast | white-hot, rings |
| bridge loss | brass block, right | squat, dim, haloed: soaks | tall, lit: gives it all back |
| nut loss | steel post, left | squat, dim, haloed | tall, lit |
| stiffness | string thickness | wire | rod |
| pickup | labelled ring | near the nut | near the bridge |
| bow speed | bow arrow length | short | long |
| bow force | bow width and glow | thin, faint (the bow skates) | wide, bright |
| bow position | where the bow sits | mid-string | near the bridge |

_Left rough:_ I've only checked this with screenshots. I haven't seen it move at full speed, and I can't tell whether the flare on hover is strong enough when you're actually playing. The 'slow motion' slider is the one control that still has no object in the scene, because it's a viewing control, not part of the string. The brightness colour at the dark end reads salmon-red in screenshots rather than a deep ember.

_Next moves named:_ Your eyes on v1.6: tell me which links still don't read, and I'll strengthen those first. · Then the body, as your note orders it: a soundboard the bridge sits on, drawn so you can see it take energy from the string.
<sub>`waveguide-synthesizer-steward-032` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="waveguide-synthesizer-steward-030" -->
### 2026-10-13 — cycle 12 — Stiffness now means the same at every pitch: at slider 0.67, partial 8 runs about 54 cents sharp from E2 to E5. Before, it ran 2 cents sharp at E2 and 640 at E5.
> shipped · Study v1.5 · even stiffness · steward leans four strings next

What was wrong. The stretch came from eight identical filter sections with one fixed setting. Their effect depends on how many samples one trip round the string takes, so a short (high) string got hit far harder than a long one. At slider 0.67, partial 8 ran 2.4 cents sharp at E2, 16 at G3, 134 at A4 and 641 at E5: about a 260-fold spread. Across the full range it was worse, around 800-fold.

What v1.5 does. The slider now sets the inharmonicity B that piano tuners use. The law it asks for is the stiff-string one, and it doesn't depend on pitch. Each time you change the note, the engine designs the filter for that note. It tries between 1 and 64 sections, finds the setting for each that keeps partials 2 through N (up to 6 kHz) closest to the law, and keeps whichever count lands closest. Each candidate is checked by arithmetic on the loop's delay, with no rendering. One design takes about a millisecond, and each one is kept, so dragging back over a setting costs nothing. The slider runs a decade every third of its travel. 0.33 is a hair of stretch (about 5 cents on partial 8), 0.67 is a clearly stretched piano-like string (54 cents), and 1.0 is past any piano, into bars and bells. The label under the slider now says what you asked for in those terms.

Two side effects. Stiffness 0 now cancels the slight stretch the loop's own brightness filter puts on high notes, so zero means harmonic at every pitch: A5 went from 16 cents sharp on partial 8 to 4. And where a note can't reach what you asked (bass notes at the top of the slider run out of filter), the label says how far that note strays from the law instead of pretending.

Checked. All of this was measured from renders of the page's own engine code, not a copy: the table and the chart, with fundamentals within 0.01 cents of the slider at every pitch. In Chrome, inside the board's exact frame at 480 pixels tall, I did a full slider drag, six pitch and stiffness combinations, and a strike, with no page errors. That ran on the audio-thread engine and again with it forced off. The bow still sings and stays bounded with any stiffness at G3, E2 and E5.

**Artifacts:**
- [31 s. E2 E3 E4 A4 E5 struck at stiffness 0.67, first through v1.4 (low notes plain, top notes clanging), then v1.5 (one even stretch), then v1.5 at 0 (all harmonic), then at 0.83 (bell-like all the way up).](Projects/Waveguide Synthesizer/offline-v1.5/even-stiffness-tour.wav)
- [Same slider, every pitch. Dotted lines climb about a hundredfold up the range (v1.4); solid lines stay flat on the law (v1.5).](Projects/Waveguide Synthesizer/offline-v1.5/stretch-by-pitch.png)
- [Study v1.5, the playable page: click once, open the sliders, move stiffness and play notes up and down.](Projects/Waveguide Synthesizer/study-v1.5-even-stiffness/index.html)
- [The page in the board's frame, with the new stiffness label reading 'partial 8 +54 ¢, any pitch'.](Projects/Waveguide Synthesizer/offline-v1.5/board-frame-stiffness.png)
- [The measurements behind the chart: four stiffness settings, ten pitches, both versions.](Projects/Waveguide Synthesizer/offline-v1.5/stretch-by-pitch.json)
- [Browser check: labels, levels and errors, on both engines.](Projects/Waveguide Synthesizer/offline-v1.5/frame-probe.json)
- [Where each section of the tour starts.](Projects/Waveguide Synthesizer/offline-v1.5/tour-sections.json)
- [Renders struck notes through each page's engine and finds partials in the spectrum.](Projects/Waveguide Synthesizer/offline-v1.5/measure_v15.py)
- [Renders the listening tour.](Projects/Waveguide Synthesizer/offline-v1.5/render_tour.py)
- [Draws the chart.](Projects/Waveguide Synthesizer/offline-v1.5/plot_stretch.py)
- [v1.4's loop as arithmetic. It's how I first measured the 800-fold spread.](Projects/Waveguide Synthesizer/offline-v1.5/loop_model.py)
- [Reads what the engine designs for each pitch and stiffness, and how long it takes.](Projects/Waveguide Synthesizer/offline-v1.5/probe_design.mjs)
- [The Chrome check in the board's sandbox.](Projects/Waveguide Synthesizer/offline-v1.5/frame_probe.mjs)

_partial 8, cents sharp of 8 × f0, slider at 0.67 (the law asks +54 at every pitch)_
| note | v1.4 | v1.5 |
| --- | --- | --- |
| E2 | +2.4 | +57 |
| A2 | +4.0 | +57 |
| G3 | +16 | +57 |
| C4 | +34 | +56 |
| A4 | +134 | +53 |
| E5 | +641 | +54 |
| A5 | +978 | +46 |

_Left rough:_ I can't listen, so whether 0.67 sounds like a piano or a wire with a cold is your call on the tour. Bass notes at the very top of the slider stray up to 80 cents from the law; the label says so, but more sections would only buy so much. A bowed stiff string reads about 7 to 10 cents sharp, because the bow pulls the partials partly back into line (real bowed strings do some of this too; I haven't checked how much). A design takes up to 2 ms on the audio thread the first time a setting is visited, so a fast first drag could click.

_Next moves named:_ Four strings tuned in fifths (G D A E) in one engine, played from the keyboard and drawn side by side. That's the next step in the proposed plan, and it answers the page's question about how to do more than one note at once. · If the first-drag click shows up, move the design off the audio thread and hand the result over. · A live dot on the Schelleng map, carried into the teaching walk.
<sub>`waveguide-synthesizer-steward-030` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="waveguide-synthesizer-steward-028" -->
### 2026-10-13 — cycle 11 — Shall this be the plan for the stage-ready version: bow, even stiffness, four strings, a body, a teaching walk, then the stage question?
> still working · bow shipped in v1.4 · steward leans adopt

Waveguide Synthesizer is the browser string whose on-screen wave is the sound. It has no agreed plan; I've been working from the page's own aim. The working instrument exists now: a tuned string you can pluck, strike, stiffen, watch slowly, and as of this cycle bow. What's left is the stage-ready version, and it has six steps, so a plan would help. The bow came first because it's the clearest proof yet of the project's bet: the corner you see running round the string is the stick-slip you hear. The other steps are what the page itself names as open questions: how many strings, what body, does 3D teach better, does it earn a stage. Breath and tubes stay out until there's a reason. Adopting it changes nothing today; I keep building in this order. If you keep the current plan, I keep following the page's aim one step at a time.

**Artifacts:**
- [board-frame-v1.2-why-silent.png](Projects/Waveguide Synthesizer/offline-v1.3/board-frame-v1.2-why-silent.png)
- [board-frame-sounding.png](Projects/Waveguide Synthesizer/offline-v1.3/board-frame-sounding.png)
- [board-frame-before-click.png](Projects/Waveguide Synthesizer/offline-v1.3/board-frame-before-click.png)
- [listening-tour-v1.3.wav](Projects/Waveguide Synthesizer/offline-v1.3/listening-tour-v1.3.wav)
- [index.html](Projects/Waveguide Synthesizer/study-v1.3-audible/index.html)
<sub>`waveguide-synthesizer-steward-028` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="waveguide-synthesizer-steward-027" -->
### 2026-10-13 — cycle 11 — The string can be bowed now. Hold B and it sings, and on screen one sharp corner runs round the string once a cycle: the bow catching and letting go.
> shipped · v1.4 bows, checked in the board's frame · steward leans propose-the-plan next

How the bow works. The rails carry displacement, but a bow acts on velocity: friction depends on how fast the string slides under the hair. So at the bow point, each sample, the engine reads the speed of each wave arriving, asks a friction curve how hard the hair grips at that slip speed, and pushes the difference into both waves leaving. Near zero slip the hair grips and the string rides with the bow. Past a threshold it lets go and the string flies back. That catch-and-release, once a cycle, is Helmholtz motion. The proof is the second image: at the defaults the bow point rides at exactly the bow's speed for 74.7% of each cycle, and theory says 74%, the bow's position along the string.

What you can find with the sliders. Bow speed against force gives Schelleng's diagram, which every string player knows by feel. Too light and fast, the bow skates or slips twice a cycle (a breathy surface sound). Too heavy and slow, it drags the string aside and sticks. In between is a wide band where it sings, and the band tilts the way the textbook says: bow faster and you need more force. Bow position matters too. Near simple fractions of the string (a fifth, a sixth, a seventh of the way from the bridge) the single slip breaks into two. That is real violin physics, made sharper here because the bow point snaps to whole samples. I set the defaults (speed 0.5, force 0.7, position 0.74) where it sings at all eight test pitches, E2 to E5.

What the bow forced me to fix underneath. (1) The ends now hold perfectly still at zero frequency. Before, they let a sliver of steady push leak through, and a bowed string crept off its rest line without limit. (2) The rails are double precision, because a held bow leaves large, exactly cancelling offsets on them. (3) Sliding the bow mid-note carries those offsets along, and a note change rebuilds the rails from the string's current shape. Before I fixed those two, either move blew the output up to +60 dBFS. (4) A 10 Hz DC blocker and a soft safety limiter on the output. The limiter is exactly linear below −6 dBFS, so plucks pass through it untouched. Plucks against v1.3: same pitch to the measurement's limit, same level within 0.2 dB, about 5% longer ring.

Checked in Chrome inside the board's exact sandbox at 480 pixels tall. One click on the door plucks at −10 dBFS. Holding the bow button reaches −15.8 dBFS, and so does holding B. Both work again with the audio-thread engine forced to fail. No page errors.

**Artifacts:**
- [start here: 29 s through the bow, from a held G3 and a pluck of the same note to a crescendo, the bow locking into a single slip, too light, crushed, a stiff string, and a four-note line.](Projects/Waveguide Synthesizer/offline-v1.4/bow-tour-v1.4.wav)
- [Study v1.4: click the door, then hold 'bow' or the B key. The pale bar is the bow; open 'sliders' for speed, force and position.](Projects/Waveguide Synthesizer/study-v1.4-bow/index.html)
- [v1.4 in the board's 480-pixel frame while the bow is held: the Helmholtz corner at the bow, strobe view.](Projects/Waveguide Synthesizer/offline-v1.4/board-frame-bowing.png)
- [the proof: the string at 8 moments of a cycle; the bow point riding the bow's speed for 74.7% of each cycle (theory: 74%), then flying back; and what the pickup hears.](Projects/Waveguide Synthesizer/offline-v1.4/bow-helmholtz-check.png)
- [where the bow sings: speed against force (skates, slips twice, sings, raucous, stuck), and position against pitch, with the double-slip bands near 1/5, 1/6 and 1/7 of the string.](Projects/Waveguide Synthesizer/offline-v1.4/schelleng-map.png)
- [renders the tour through the page's own worklet code, headless, and measures each section.](Projects/Waveguide Synthesizer/offline-v1.4/render_bow_tour.py)
- [the table below, as data.](Projects/Waveguide Synthesizer/offline-v1.4/bow-tour-measurements.json)
- [sorts 187 bowed notes into Schelleng's regions by what the bow point does.](Projects/Waveguide Synthesizer/offline-v1.4/schelleng_map.mjs)
- [the speed-against-force map, as data.](Projects/Waveguide Synthesizer/offline-v1.4/schelleng-map.json)
- [counts slips a cycle at 8 pitches across 23 bow positions.](Projects/Waveguide Synthesizer/offline-v1.4/position_map.mjs)
- [the position-against-pitch map, as data.](Projects/Waveguide Synthesizer/offline-v1.4/position-map.json)
- [draws both maps.](Projects/Waveguide Synthesizer/offline-v1.4/schelleng_plot.py)
- [watches the bowed string every 4th sample and draws the proof image.](Projects/Waveguide Synthesizer/offline-v1.4/bow_shape.py)
- [plucks and strikes through v1.3 and v1.4 side by side: did the changes underneath change the pluck?](Projects/Waveguide Synthesizer/offline-v1.4/pluck_vs_v13.py)
- [the answer: same pitch, level within 0.2 dB, about 5% longer ring.](Projects/Waveguide Synthesizer/offline-v1.4/pluck-vs-v1.3.json)
- [loads v1.4 in the board's exact sandbox in Chrome, clicks the door, holds the bow and the B key, reads the meter, screenshots.](Projects/Waveguide Synthesizer/offline-v1.4/frame_probe.mjs)

_the bow tour, v1.4 engine, 48 kHz · peak includes the first instant of each stroke_
| starts | section | peak dBFS | pitch vs slider (cents) |
| --- | --- | --- | --- |
| 0.0 s | bowed G3 196 Hz: held, lifted, rings on | −5.6 | +1.7 |
| 3.8 s | plucked, same note, for comparison | −10.0 | +0.1 |
| 6.3 s | crescendo: bow speed 0.1 → 0.9 | −5.7 | +1.7 |
| 10.2 s | bow at 0.78 (slips 3–4 times a cycle), slid to 0.74: locks to one | −5.6 | +1.3 |
| 14.8 s | too light: force 0.1, fast bow, slips twice | −29.6 | +1.3 |
| 17.8 s | crushed: force 1.0, slow bow, drags, creaks, sticks | −0.4 | −1.5 |
| 20.7 s | stiff bowed string, stiffness 0.5, C4 | −2.7 | +5.0 |
| 23.8 s | a line: G3 D4 B3 G3, one stroke each | −4.7 | +1.7 |

_Left rough:_ I can't listen. The ear on this is still the meter and the measurements, and the tour is the first real test of whether the bow sounds like a bow or a buzzing wire. A held bow settles about 9 dB quieter than a pluck's first instant (around −20 dBFS once it settles), so turn up a little for it. The bowed string leans visibly to one side on screen. Real bowed strings do too, but less than this. And the crushed section's first instant is a thump the safety limiter catches.

_Next moves named:_ Propose the plan for the stage-ready version: the bow (this cycle), one stiffness that means the same stretch at every pitch, four strings, a body, a guided teaching walk, and the stage-or-test-bed question. The plan is asked in a separate card. · Put a live dot on the Schelleng map inside the page, so you can watch where your bow sits while you play. · Make stiffness mean the same stretch at every pitch, the way a piano's is set string by string, and label the slider.
<sub>`waveguide-synthesizer-steward-027` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

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
