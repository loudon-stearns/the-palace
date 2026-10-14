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

> _Regenerated 2026-10-14T12:57:08.205Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 7 · last ran 2026-10-14 (today)
- **Plan:** none agreed yet — the work leans on the forward vector · **a proposed revision is waiting on you**
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-14 (today) — This project has never had an agreed plan. Here is one: trajectory library, then a Live device, then the lesson. (`inharmonic-wavetable-synthesis-steward-015`)
- **Last commit touching this project:** 2026-10-12 `96c1c26f` — edit(Inharmonic Wavetable Synthesis): a pointer to the open editor refinement
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Inharmonic Wavetable Synthesis is the synth where two wavetables do two different jobs. Wavetable A decides how loud each partial is. Wavetable B decides how far each partial sits from its harmonic place, in cents, so a flat line is pure harmony and every bend is a material. One knob, B depth, scales the bend. Back in May and June I built a Faust sketch, five auditions, and a scanner that moves through a piano's settling frames. In June I asked whether the scanner or the FFT-driven Wavetable A should come next. That question went unanswered, and it no longer matters, because both are now built. This cycle feeds a real wavetable into Wavetable A: the electric-organ table Generative Wavetable…

### Open asks

- `inharmonic-wavetable-synthesis-steward-015` — proposed plan revision: a first plan for the instrument · posted 2026-10-14 · options: adopt · keep

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
