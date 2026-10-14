---
title: "Inharmonic Wavetable Synthesis — scroll"
born: 2026-09-23
links:
  - target: "[[Inharmonic Wavetable Synthesis]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Inharmonic Wavetable Synthesis's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Inharmonic Wavetable Synthesis — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Inharmonic Wavetable Synthesis]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-14T13:08:41.435Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 9 · last ran 2026-10-14 (today)
- **Plan:** none agreed yet — the work leans on the forward vector · **a proposed revision is waiting on you**
- **Waiting on you:** 2 open asks
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-14 (today) — When a bell or bar becomes Wavetable B, does its k-th mode go in slot k, or in the harmonic slot it's nearest? (`inharmonic-wavetable-synthesis-steward-021`)
- **Last commit touching this project:** 2026-10-14 `6c71a2d2` — steward(Inharmonic Wavetable Synthesis): cycle 8 — SPINNING UP. HOME: [Inharmonic Wavetable Synthesis](obsidian://open?vau…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Inharmonic Wavetable Synthesis is the synth where two wavetables do two jobs. Wavetable A sets how loud each partial is. Wavetable B sets how far each partial sits from its harmonic place, in cents, so a flat line is pure harmony and every bend is a material. Both walls already play together in renders and in a browser study. A proposed plan is still waiting on your yes. Its first step is a small library of bends measured from real recordings. Last cycle measured one low piano note and found the bend doesn't relax over the note; the upper partials just go quiet. This cycle fills the first shelf. Six more Grand Piano notes from Live's Core Library run up the keyboard, and a second tracker ha…

### Open asks

- `inharmonic-wavetable-synthesis-steward-015` — proposed plan revision: a first plan for the instrument · posted 2026-10-14 · options: adopt · keep
- `inharmonic-wavetable-synthesis-steward-021` — how a bell or bar is filed into Wavetable B · posted 2026-10-14 · options: RANK · NEAREST · BOTH

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
<!-- scroll:entry id="inharmonic-wavetable-synthesis-steward-021" -->
### 2026-10-14 — cycle 9 — When a bell or bar becomes Wavetable B, does its k-th mode go in slot k, or in the harmonic slot it's nearest?
> still working · library shelf shipped · steward leans RANK

Catch-up: this synth bends each partial off its harmonic place by a measured amount. A piano has a harmonic ladder, so its bend files itself. A bell, a bar or a bowl has modes, so I had to pick a filing rule. I used rank: the k-th mode goes in slot k. That makes a bell's bend travel. On the organ, every organ partial lands on a bell mode, and that's what 09-bell-choir-measured.wav plays. The cost is huge bends (a tight bell sits 1000 to 1700 cents flat), and a tuned marimba looks bent when it's really sparse. The other rule puts each mode in its nearest harmonic slot. The bends stay small (the vibraphone's are 0 to 19 cents) and the gaps go silent. It reads more honestly on the flat-line display, but it travels less. Play 08-vibraphone-two-filings.wav (rank first, then nearest). The project keeps moving either way. I'll keep using rank until you say otherwise.

**Artifacts:**
- [rank filing first, then nearest-harmonic filing.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/08-vibraphone-two-filings.wav)
- [what rank filing makes possible: the organ wearing a real bell.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/09-bell-choir-measured.wav)
- [the four objects, rank-filed.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/library-sheet.png)
- [piano-low-A1-trajectory.png](Projects/Inharmonic Wavetable Synthesis/trajectory-library/piano-low-A1-trajectory.png)
- [04-chord-real-bend-pushed.wav](Projects/Inharmonic Wavetable Synthesis/trajectory-library/04-chord-real-bend-pushed.wav)
- [03-organ-flat-real-june.wav](Projects/Inharmonic Wavetable Synthesis/trajectory-library/03-organ-flat-real-june.wav)
- [02-real-piano-two-walls-bend-off.wav](Projects/Inharmonic Wavetable Synthesis/trajectory-library/02-real-piano-two-walls-bend-off.wav)
- [01-real-piano-two-walls.wav](Projects/Inharmonic Wavetable Synthesis/trajectory-library/01-real-piano-two-walls.wav)
<sub>`inharmonic-wavetable-synthesis-steward-021` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="inharmonic-wavetable-synthesis-steward-020" -->
### 2026-10-14 — cycle 9 — The library's first shelf: seven piano strings from low A to F#6, plus a real bell, vibraphone, marimba and singing bowl, all playable.
> shipped · 11 measured trajectories, 5 renders, study menu grows · steward leans rank filing

**The piano across the keyboard.** The same tracker as last cycle now ran on A1, A2, A3, A4, A5, C6 and F#6. I taught it to stop below the top of the audible range, because a stiff treble string runs out of room after 10 to 30 partials. String stiffness (B) climbs about 3x per octave from A2 upward: 4.7e-5 at 55 Hz, 7.4e-4 at A4, 5.0e-3 at F#6. D7 gave only six partials, so it gets a fit but no trajectory. In every register the bend still holds through the note. B moves less than ±5% from frame to frame (±11% at F#6, where few partials are left). So last cycle's finding wasn't a quirk of one bass string. The entry's guess for a bass piano (B 0.001 to 0.002) is where this piano sits around A5 and C6, more than an octave above middle C.

**Things with no ladder.** A bell has modes, not harmonics. [track_modes.py](obsidian://open?vault=The%20Palace&file=Projects/Inharmonic%20Wavetable%20Synthesis/trajectory-library/track_modes.py) counts a peak as a mode only if it stands 40 dB proud just after the strike and is still ringing in the same place 0.4 s later. Then it files the k-th mode into slot k and measures its bend against k times the lowest mode. Slots above the last mode are kept silent rather than invented. What it found: the bell (1042 Hz) has 24 modes packed tight, mostly 1000 to 1700 cents flat of the harmonic slots. The vibraphone is the bar's 1 : 4 : 9.9 plus near-harmonic resonator partials. The marimba is 1 : 3 : 4 : 10.5. The singing bowl has a pure octave, then modes at 5.35, 5.74 and 8.34/8.37 times the lowest. That last pair is a split mode 10 Hz apart, and it's the bowl's wobble.

**What to open, in order:**
1. **05-organ-wears-the-keyboard.wav**: one organ note (A2) struck seven times, wearing each string's measured bend from bass to treble. Same timbre and pitch, seven stiffnesses. The treble strings' bends are carried on by the fit past where they were measured, so the last three get bell-like.
2. **06-library-rebuilt.wav**: bell, vibraphone, marimba, bowl, each rebuilt from its own two measured walls. This checks the tracker against the originals in Live.
3. **07-library-on-the-organ.wav**: the organ (A3) struck four times, wearing each object's bend.
4. **08-vibraphone-two-filings.wav**: the open question below. The vibraphone filed in rank order, then filed by nearest harmonic.
5. **09-bell-choir-measured.wav**: A major on the organ wearing the real bell. It's the entry's 'alien bell choir', built from a measured bell instead of Bessel zeros.
6. **keyboard-stiffness.png** and **library-sheet.png**: the numbers behind all of it.
7. **dual-wavetable-instrument.html**: six new materials in the Wavetable B menu.

**Artifacts:**
- [one organ note wearing seven measured piano strings, bass to treble.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/05-organ-wears-the-keyboard.wav)
- [bell, vibraphone, marimba, bowl rebuilt from their own measured walls.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/06-library-rebuilt.wav)
- [the organ struck wearing each of the four objects' bends.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/07-library-on-the-organ.wav)
- [vibraphone on the organ: rank filing, then nearest-harmonic filing.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/08-vibraphone-two-filings.wav)
- [A major on the organ wearing the measured bell.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/09-bell-choir-measured.wav)
- [B across the keyboard, each string's bend, and the heard bend over time.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/keyboard-stiffness.png)
- [the four modal objects as Wavetable B, rank-filed.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/library-sheet.png)
- [measured trajectory, piano A2 (110 Hz).](Projects/Inharmonic Wavetable Synthesis/trajectory-library/piano-A2.wtb.json)
- [measured trajectory, piano A3 (221 Hz).](Projects/Inharmonic Wavetable Synthesis/trajectory-library/piano-A3.wtb.json)
- [measured trajectory, piano A4 (443 Hz).](Projects/Inharmonic Wavetable Synthesis/trajectory-library/piano-A4.wtb.json)
- [measured trajectory, piano A5 (885 Hz).](Projects/Inharmonic Wavetable Synthesis/trajectory-library/piano-A5.wtb.json)
- [measured trajectory, piano C6 (1053 Hz).](Projects/Inharmonic Wavetable Synthesis/trajectory-library/piano-C6.wtb.json)
- [measured trajectory, piano F#6 (1492 Hz).](Projects/Inharmonic Wavetable Synthesis/trajectory-library/piano-Fs6.wtb.json)
- [measured modes, Brooklyn bell, rank-filed.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/bell-brooklyn-C6.wtb.json)
- [measured modes, vibraphone C4, rank-filed.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/vibraphone-C4.wtb.json)
- [measured modes, marimba C3, rank-filed.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/marimba-C3.wtb.json)
- [measured modes, singing bowl D, rank-filed.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/singing-bowl-D4.wtb.json)
- [the modal tracker: picks ringing modes, files the k-th into slot k.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/track_modes.py)
- [piano tracker, now stops below the top of the audible range for treble strings.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/track_partials.py)
- [tracks the keyboard and rebuilds every render and figure above.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/render_library.py)
- [playable study with six new measured materials in the menu.](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/dual-wavetable-instrument.html)
- [study source: new menu options, and silent slots above an object's last mode.](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/dual-wavetable-instrument.template.html)
- [study data carrying the new trajectories.](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/dual-data.json)
- [folds the library shelf into the study.](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/build_dual.py)

_string stiffness across the keyboard, Core Library Grand Piano, forte_
| note | fundamental (fit) | B | B spread over the note | partials measured |
| --- | --- | --- | --- | --- |
| A1 | 55.1 Hz | 4.7e-5 | ±2% | 46 of 64 |
| A2 | 110.3 Hz | 8.3e-5 | ±2% | 46 of 64 |
| A3 | 221.0 Hz | 2.7e-4 | ±6% | 42 of 62 |
| A4 | 442.8 Hz | 7.4e-4 | ±4% | 23 of 33 |
| A5 | 885.4 Hz | 2.3e-3 | ±4% | 12 of 17 |
| C6 | 1053 Hz | 2.9e-3 | ±4% | 11 of 14 |
| F#6 | 1492 Hz | 5.0e-3 | ±11% | 7 of 10 |
| D7 | 2352 Hz | 1.0e-2 | fit only | 5 of 6 |

_Left rough:_ I can't hear, so every sound claim here is a measurement. The mode picker's thresholds are tuned by eye on these four sources and may pick noise or miss modes on others. I haven't confirmed whether the vibraphone's near-harmonic partials are its resonator or the recording. The treble strings in 05 are carried far past where they were measured. I only syntax-checked the study's new menu entries, not play-tested them.

_Next moves named:_ Settle the filing rule for bells and bars (the ask beside this post), then fill the last library gaps: a tubular-style bell with a deep hum, and a guitar string. · With the shelf in hand, start the next move on the proposed plan: the dual engine as an RNBO codebox~ Max for Live device, with the library loadable as Wavetable B. It stays unverified until you open it.
<sub>`inharmonic-wavetable-synthesis-steward-020` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="inharmonic-wavetable-synthesis-steward-018" -->
### 2026-10-14 — cycle 8 — My entry's piano numbers are about 20 times too big, and its 'settling piano' settles in loudness, not in bend.
> measured on one real low-A recording · proposes an entry fix for an elder · steward leans correct it

**claim:** The entry says Piano (Bass) has B ≈ 0.001 to 0.002 settling over about 200 ms, and its 'settling piano' sound flattens the Wavetable B curve over 500 ms. A real recorded low A (55 Hz, Live Core Library Grand Piano, forte) measures B = 4.67e-5, steady within ±2% from the strike to 3.8 s. The whole pitch drifts down only about 1 cent over 8 s. The heard bend halves because the upper partials go quiet, not because they move.
**target entries:** Inharmonic Wavetable Synthesis · Piano String Inharmonicity
**evidence:** Projects/Inharmonic Wavetable Synthesis/trajectory-library/piano-low-A1.wtb.json and piano-low-A1-trajectory.png (posted as inharmonic-wavetable-synthesis-steward-017).
**confidence:** high for this note; one recording, so treble strings may differ
**proposed change:** In the Physical Trajectory Library list, change Piano (Bass) to something like 'B ≈ 5e-5 at A1, near-constant; the settling is the upper partials fading'. Reword 'The settling piano' to say the real string's bend holds steady, the settling heard is the loudness wall dimming where the bend is largest, and a bend that relaxes over time is a designed, impossible gesture. The entry's Cube section already says the two walls are projections of one string, and this measurement backs that. Leave it to an elder to word and land.

**Artifacts:**
- [the measurement behind this flag.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/piano-low-A1-trajectory.png)
<sub>`inharmonic-wavetable-synthesis-steward-018` · FLAG on FLAGS</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="inharmonic-wavetable-synthesis-steward-017" -->
### 2026-10-14 — cycle 8 — First real trajectory: I tracked a recorded low piano A into Wavetable B. Its bend doesn't settle. What fades is the upper partials.
> shipped · one recording tracked, four renders, the study gains it · steward leans high piano + bowl next

**What I built.** [track_partials.py](obsidian://open?vault=The%20Palace&file=Projects/Inharmonic%20Wavetable%20Synthesis/trajectory-library/track_partials.py) reads a recording in place and finds partials 1 to 8. It fits the string-stiffness law to them, uses the fit to predict where the next partials will be, and climbs to 64 that way. Then it measures every partial in 16 frames, log-spaced from 0.03 s to 8 s. A partial counts only if it stands 12 dB above the noise and the analysis window can pin it to better than about 5 cents. At 55 Hz that throws out partial 1, so partial 1 takes the fit's value.

**What it found.** The fit gives f0 = 55.14 Hz and B = 4.67e-5. The measured partials sit on that curve to within about half a cent: partial 16 is 10 cents sharp, partial 32 is 40, partial 64 is 152. B frame by frame is 4.73 to 4.88e-5 from the strike to 3.8 s. That's flat within ±2%, so the bend doesn't settle. The whole pitch drifts down about 1 cent over 8 s, and that's all the settling the frequencies do. Our June 'settling piano' started at B = 9e-4, 19 times stiffer, and relaxed toward 7e-5. The heard bend (each partial's bend weighted by its loudness) does halve, from 4.5 cents to about 2. That happens because the high partials go dark first, not because they move. So the settling lives in the cube's interior: the loudness wall dims exactly where the bend is largest. The entry predicted this when it said a piano's amplitudes and bends are two projections of one struck string. The loudness wall also has dark bands near partials 25, 33 and 41. They're probably the hammer's strike point cancelling every 8th mode or so. I haven't confirmed that.

**What to open, in order:**
1. **01-real-piano-two-walls.wav**: the piano rebuilt from its own two walls, measured levels and measured bend.
2. **02-real-piano-two-walls-bend-off.wav**: the same with B depth 0. A/B it against 01. Partial 40 sits at 2285.9 Hz in 01 and at the harmonic 2205.7 Hz in 02, 62 cents apart.
3. **03-organ-flat-real-june.wav**: the organ wall struck three times, with the flat line, then the real piano bend, then the June guess (at the 0.3 depth cycle 7 used). The real bend should sound much subtler than the guess.
4. **04-chord-real-bend-pushed.wav**: an A major chord on the organ wall wearing the real bend. B depth rises from 0 to 3 over 14 s, past what this string really does.
5. **piano-low-A1-trajectory.png**: the measured bend against the flat line and the June curve, B over time, and the loudness wall with the heard bend drawn over it.
6. **dual-wavetable-instrument.html**: the playable study now has 'real piano, low A (measured)' in its trajectory menu.

**Artifacts:**
- [the low piano A rebuilt from its own measured levels and bend.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/01-real-piano-two-walls.wav)
- [the same with the bend off; A/B against 01.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/02-real-piano-two-walls-bend-off.wav)
- [organ wall struck three times: flat, real piano bend, June guess.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/03-organ-flat-real-june.wav)
- [A major on the organ, real bend pushed from depth 0 to 3.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/04-chord-real-bend-pushed.wav)
- [measured bend vs the flat line, B over time, the loudness wall and the heard bend.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/piano-low-A1-trajectory.png)
- [the trajectory: 16 frames x 64 partials of cents, a live-partial mask, and the matching loudness wall.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/piano-low-A1.wtb.json)
- [the tracker: recording in, Wavetable B and A frames out (/usr/local/bin/python3).](Projects/Inharmonic Wavetable Synthesis/trajectory-library/track_partials.py)
- [rebuilds the four renders and the figure from the trajectory.](Projects/Inharmonic Wavetable Synthesis/trajectory-library/render_piano_low.py)
- [the playable study, now with 'real piano, low A (measured)' in the trajectory menu.](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/dual-wavetable-instrument.html)
- [study source with the new menu option.](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/dual-wavetable-instrument.template.html)
- [study data, now carrying the measured trajectory.](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/dual-data.json)
- [cycle-7 engine; now folds in the measured trajectory when it exists.](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/build_dual.py)

_cents off harmonic at the attack: measured low piano A vs. the June hand-made guess_
| partial | measured (fit) | June guess ×1 | June guess ×0.3 (as played in cycle 7) |
| --- | --- | --- | --- |
| 8 | 2.6 | 48.5 | 14.5 |
| 16 | 10.3 | 179.5 | 53.8 |
| 32 | 40.4 | 565.4 | 169.6 |
| 64 | 151.5 | 1337.1 | 401.1 |

_Left rough:_ This is one note at one loudness, and I can't hear, so every sound claim is a measurement. The 'no settling' result may not hold for treble strings or a ff hit. The hammer-node reading of the dark bands is a guess. The source audio stays in Live's library and isn't copied into the palace, and I didn't play-test the study's new option beyond a syntax check.

_Next moves named:_ Run the same tracker on a high piano note (Core Library C5 or F#5) and on the singing bowl (Core Library 'Bowl Swell B1'). Treble strings should be much stiffer, and the bowl will test the tracker on a sound with no harmonic ladder. · If the bend really is fixed, give Strike mode in the study a real-piano setting where the bend stays put and only the loudness wall decays. That is the true piano gesture, and the lesson can show it.
<sub>`inharmonic-wavetable-synthesis-steward-017` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="inharmonic-wavetable-synthesis-steward-015" -->
### 2026-10-14 — cycle 7 — This project has never had an agreed plan. Here is one: trajectory library, then a Live device, then the lesson.
> still working · both walls now play · steward leans adopt

Quick catch-up: this is the synth where one wavetable sets how loud each partial is and a second sets how far each partial bends off harmony, with a flat line meaning pure harmony. As of today both walls play together: a real organ table from Generative Wavetable Libraries against a piano and a bell trajectory, in renders and in a playable study on the board. The project has run for six months with no agreed path, and that left the June scanner-or-FFT question hanging. It's moot now, since both are built. The plan below follows the entry's own forward path and puts the next build in Live, as you asked on 2026-09-25. The cost is that the drawn-curve-versus-function-families editor question waits until after the lesson. If you'd rather a different order, KEEP and tell me.

**Artifacts:**
- [settling-landscape.svg](Projects/Inharmonic Wavetable Synthesis/faust-prototype/multi-frame-wtb/settling-landscape.svg)
- [settling-piano-plausible.wav](Projects/Inharmonic Wavetable Synthesis/faust-prototype/multi-frame-wtb/settling-piano-plausible.wav)
- [settling-ABC.wav](Projects/Inharmonic Wavetable Synthesis/faust-prototype/multi-frame-wtb/settling-ABC.wav)
- [settling-frozen-attack.wav](Projects/Inharmonic Wavetable Synthesis/faust-prototype/multi-frame-wtb/settling-frozen-attack.wav)
- [settling-piano.wav](Projects/Inharmonic Wavetable Synthesis/faust-prototype/multi-frame-wtb/settling-piano.wav)
- [settling-flat-baseline.wav](Projects/Inharmonic Wavetable Synthesis/faust-prototype/multi-frame-wtb/settling-flat-baseline.wav)
- [Inharmonic Wavetable Synthesis — icon.png](Projects/Inharmonic Wavetable Synthesis/Inharmonic Wavetable Synthesis — icon.png)
- [Inharmonic Wavetable Synthesis — hero.png](Projects/Inharmonic Wavetable Synthesis/Inharmonic Wavetable Synthesis — hero.png)
<sub>`inharmonic-wavetable-synthesis-steward-015` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="inharmonic-wavetable-synthesis-steward-014" -->
### 2026-10-14 — cycle 7 — Both walls play at once now: a real organ wavetable sets the partial levels, physics bends their pitches, and you can play it in the board.
> shipped · four renders, a cube picture, a playable study · steward leans trajectory-library next

Until now Wavetable A was four hand-typed profiles. The entry makes a bigger claim: any wavetable becomes an amplitude template once you FFT it. So I took the sibling project's AKWF organ chain (142 frames x 2048 samples), took bins 1 to 64 of every frame, and ran them through the additive engine. Wavetable B gets two trajectories. The piano one is the June B-coefficient schedule, extended to 64 partials. The bell one puts partial n on the nth zero of the Bessel J0 function, the modes of a circular membrane: partial 2 sits 239 cents sharp and partial 64 sits 456 cents sharp, and over 16 frames they ease back to flat.

What to open, in order:
1. **01-amplitude-wall-alone.wav**: B depth 0, so there is no bend, and the position in the organ table sweeps 0 to 1 over 10 s. This proves the amplitude wall comes from a real table. The spectral centroid climbs from 184 Hz to 990 Hz, round organ to nasal organ.
2. **02-organ-struck-piano-settling.wav**: three strikes at three organ positions, with the piano trajectory at B depth 0.3.
3. **03-organ-bell-dissolving.wav**: the entry's 'crystal morph', heard for the first time. I measured partial 2 at 252.5 Hz at the attack (the bell position) and at 220.0 Hz after 5 s (the harmonic position).
4. **04-two-clocks-chord.wav**: an A major chord for 18 s. The organ position creeps forward while the bell bend and B depth each ride a slow LFO, so the chord should pass from clear to rough and back.
5. **dual-wavetable-instrument.html**: the playable study, made in the board. It draws the glowing line from the entry: the bend is cents, the glow and thickness are the organ's level for each partial, and the faint lines are every stored frame. Strike or Hold, four notes plus the chord (keys a s d f g), and drift, LFO and breathe toggles. Each section has a ◇ review pin.

cube-walls.png shows the two walls side by side, plus the path the chord takes across the floor of the cube.

**Artifacts:**
- [the playable study: two walls, one glowing line, strike or hold.](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/dual-wavetable-instrument.html)
- [no bend; the organ table sweeps, proving Wavetable A comes from a real table.](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/01-amplitude-wall-alone.wav)
- [three organ timbres, each struck with the piano string settling.](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/02-organ-struck-piano-settling.wav)
- [a membrane bell whose partials ease back onto the flat line over 4 s.](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/03-organ-bell-dissolving.wav)
- [A major chord, two clocks: clear, rough, clear.](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/04-two-clocks-chord.wav)
- [the amplitude wall, the inharmonicity wall, and the chord's path across the floor.](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/cube-walls.png)
- [one script rebuilds everything here (/usr/local/bin/python3).](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/build_dual.py)
- [48 organ frames and both B trajectories, the data the study plays.](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/dual-data.json)
- [the study's source; build_dual.py splices the data into it.](Projects/Inharmonic Wavetable Synthesis/dual-wavetable/dual-wavetable-instrument.template.html)

_what I measured, not what I heard_
| render | check | result |
| --- | --- | --- |
| 01 amplitude wall | spectral centroid, 1 s steps | 184 Hz rising to 990 Hz |
| 03 bell dissolving | partial 2 peak at 0.1 s | 252.5 Hz (bell position 252.4) |
| 03 bell dissolving | partial 2 peak at 5.0 s | 220.0 Hz (harmonic) |
| all four | NaN / clipping | clean, peak normalised to 0.89 |

_Left rough:_ I can't hear, so every sound claim is a measurement, not a listen. The study's audio (64 Web Audio oscillators per voice) is untested beyond a headless screenshot of the drawing. The rough-then-clear chord is a prediction for your ears to check. The bell wall is almost flat across partial number, so the dissolve lives in time, not shape.

_Next moves named:_ Build a small library of trajectories from real recordings: track the partials of 3-5 sounds (low and high piano, a bell, a vibraphone, a singing bowl) into Wavetable B frames and play each against the organ wall. · Port the dual engine to an RNBO codebox~ device through the Shop's RNBO smith, so you can play it inside Live; it stays unverified until you open it.
<sub>`inharmonic-wavetable-synthesis-steward-014` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="backfill-2026-09-23" -->
### 2026-09-23 — backfilled from the bundle

No steward has posted a made thing for this project yet, so the trail opens with what the bundle already holds (17 media files, newest first):

- [2026-05-04-bending-the-line.wav](Projects/Inharmonic Wavetable Synthesis/proofs/2026-05-04-bending-the-line.wav) · 2026-09-23
- [2026-05-04-bending-the-line-v2.wav](Projects/Inharmonic Wavetable Synthesis/proofs/2026-05-04-bending-the-line-v2.wav) · 2026-09-23
- [2026-05-04-bending-spectra.png](Projects/Inharmonic Wavetable Synthesis/proofs/2026-05-04-bending-spectra.png) · 2026-09-23
- [2026-05-04-bending-spectra-v2.png](Projects/Inharmonic Wavetable Synthesis/proofs/2026-05-04-bending-spectra-v2.png) · 2026-09-23
- [settling-piano.wav](Projects/Inharmonic Wavetable Synthesis/faust-prototype/multi-frame-wtb/settling-piano.wav) · 2026-09-23
- [settling-piano-plausible.wav](Projects/Inharmonic Wavetable Synthesis/faust-prototype/multi-frame-wtb/settling-piano-plausible.wav) · 2026-09-23
- [settling-frozen-attack.wav](Projects/Inharmonic Wavetable Synthesis/faust-prototype/multi-frame-wtb/settling-frozen-attack.wav) · 2026-09-23
- [settling-landscape.svg](Projects/Inharmonic Wavetable Synthesis/faust-prototype/multi-frame-wtb/settling-landscape.svg) · 2026-09-23
- [settling-line-explorer.html](Projects/Inharmonic Wavetable Synthesis/faust-prototype/multi-frame-wtb/settling-line-explorer.html) · 2026-09-23
- [settling-line-triptych.png](Projects/Inharmonic Wavetable Synthesis/faust-prototype/multi-frame-wtb/settling-line-triptych.png) · 2026-09-23
- [settling-ABC.wav](Projects/Inharmonic Wavetable Synthesis/faust-prototype/multi-frame-wtb/settling-ABC.wav) · 2026-09-23
- [settling-flat-baseline.wav](Projects/Inharmonic Wavetable Synthesis/faust-prototype/multi-frame-wtb/settling-flat-baseline.wav) · 2026-09-23
- [pass5-inverse-impossible-material.wav](Projects/Inharmonic Wavetable Synthesis/faust-prototype/audition/pass5-inverse-impossible-material.wav) · 2026-09-23
- [pass4-stochastic-vocal-fracture.wav](Projects/Inharmonic Wavetable Synthesis/faust-prototype/audition/pass4-stochastic-vocal-fracture.wav) · 2026-09-23
- [pass3-bessel-bell.wav](Projects/Inharmonic Wavetable Synthesis/faust-prototype/audition/pass3-bessel-bell.wav) · 2026-09-23
- [pass2-piano-stretch.wav](Projects/Inharmonic Wavetable Synthesis/faust-prototype/audition/pass2-piano-stretch.wav) · 2026-09-23
- [pass1-flat-harmonic-baseline.wav](Projects/Inharmonic Wavetable Synthesis/faust-prototype/audition/pass1-flat-harmonic-baseline.wav) · 2026-09-23
<sub>backfill · scroll born 2026-09-23</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
