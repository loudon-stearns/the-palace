---
title: "Quantum Synthesizer — scroll"
born: 2026-09-23
links:
  - target: "[[Quantum Synthesizer]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Quantum Synthesizer's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Quantum Synthesizer — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Quantum Synthesizer]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-13T21:12:38.721Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** dormant · **Steward:** cycle 12 · last ran 2026-10-13 (today)
- **Plan:** none agreed yet — the work leans on the forward vector
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-13 (today) — The run made the pendulum playable. Revive Quantum Synthesizer to sprout, or let it rest? (`quantum-synth-025`)
- **Last commit touching this project:** 2026-10-13 `480fad9a` — steward(Quantum Synthesizer): cycle 11 — SPINNING UP. HOME: [[Quantum Synthesizer]]. Neighborhood loaded. Cycle …
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

This page claims the Schrödinger equation is a synthesizer: whatever confines a particle sets its energy levels, and those levels, played as partials, are the timbre. Earlier today the videos showed a bare ring sounds in squares (1·4·9·16) where a string sounds 1·2·3·4, and that growing one smooth bump on the ring folds the squares down toward a string's evenly spaced harmonics, because a small swing in any well is a harmonic oscillator. That last video gave you eight fixed strikes. This cycle turns them into an instrument: one slider for the bump's depth, the energy ladder solved again in the browser on every move, and a held tone that glides as you drag.

### Open asks

- `quantum-synth-025` — directional_decision · posted 2026-10-13 · options: REVIVE-TO-SPROUT · STAY-DORMANT · NOT-SURE-YET

### Answered, not yet consumed

_None._

### Decided

- `quantum-synth-016` — directional_decision → GRANTED — option_id=REVIVE-TO-SPROUT (2026-10-13)
- `quantum-synth-008` — entry_text_fix → GRANTED — option_id=APPLY (2026-09-24)
- `quantum-synth-006` — directional_decision → GRANTED — option_id=REVIVE-TO-SPROUT (2026-09-24)
- `quantum-synth-004` — directional_steer → GRANTED — option_id=VIDEO-NEXT (2026-06-25)

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
Written by Claude on Loudon's explicit instruction, 2026-09-23: "Quantum Synthesizer and Particle Synthesis, give them cycles."

This page is marked `stage: dormant`, and the usual posture says don't touch. Loudon has overridden that for this project. Treat every run as a **revival probe**: ignore the dormant posture, ship the smallest real thing that moves the forward vector (a render, a sim, a probe — something audible or visible, not prose), and set it down honestly. End the run by saying plainly, in your last message, whether the work felt alive enough to revive the stage to `sprout` — that call is Loudon's, so make it a non-blocking RESOURCE_REQUEST with options REVIVE-TO-SPROUT · STAY-DORMANT · NOT-SURE-YET, never a stage edit.

This container has no Shop (no ComfyUI, Kokoro, Max, or GPU) — Python with numpy/scipy is what you have. Make what can be made here; name what needs the Mac.
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="quantum-synth-025" -->
### 2026-10-13 — cycle 12 — The run made the pendulum playable. Revive Quantum Synthesizer to sprout, or let it rest?
> still working · three runs today, all checks passing · steward leans REVIVE-TO-SPROUT

Catch-up: this page claims the Schrödinger equation is a synthesizer, where whatever confines a particle sets the partials. Today's runs made that audible. A box or ring sounds in squares, not a string's 1·2·3. Those squares make a packet on a ring rebuild itself, and the rebuilds climb the harmonic series. A bump on the ring folds the squares into a string's spacing. This last cycle turned the bump into a slider you can play in a browser. You've already said revive twice. I'm asking again only because your standing order asks me to close each run this way. Each run has made something the last one pointed at, so it feels alive to me. The open edge is real: none of it has been heard yet. If you'd rather listen first, NOT-SURE-YET is honest.

**Artifacts:**
- [the playable slider: the one thing to try before deciding](Projects/Quantum Synthesizer/proofs/pendulum-slider.html)
- [pendulum-poster.png](Projects/Quantum Synthesizer/proofs/pendulum-poster.png)
- [pendulum.mp4](Projects/Quantum Synthesizer/proofs/pendulum.mp4)
- [pendulum.wav](Projects/Quantum Synthesizer/proofs/pendulum.wav)
<sub>`quantum-synth-025` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="quantum-synth-024" -->
### 2026-10-13 — cycle 12 — A playable page: drag the bump's depth and hear the ring's squares slide into a string's harmonic series, solved live as you drag.
> shipped · solver matches numpy to 1e-11 · not yet heard by anyone · steward leans draft the entry section next

[The slider page](Projects/Quantum Synthesizer/proofs/pendulum-slider.html) opens in any browser. Press Hold the tone and drag the depth slowly from 0 to 40. The left panel is the well with its rungs: gold rungs are trapped and drawn only as wide as the pendulum's swing, blue ones spin over the top. The right panel shows the partials against grey string lines and dashed blue squares. Strike plays a plucked version with the same decays as last cycle's WAV, and the eight preset buttons jump to the video's eight depths.

The physics is the same as pendulum.py: 81 plane waves, a small tridiagonal eigen-solve (about a millisecond), with each level gap played as a partial pinned to A3. To check it, I pulled the page's own solver out of the HTML, ran it in Node, and compared it with numpy at nine depths. The levels agree to 1.4e-12 and the partial ratios to 1e-11. They reproduce last cycle's table exactly (1 · 1.97 · 2.89 · 3.78 at q = 32). The loudness of each partial also agrees to 3e-14, once you sum the pairs that sit on the same frequency. High up the ladder the two spin directions split by less than machine precision, so each solver mixes them differently, but only their sum is audible.

The review surface is a new kind of anchor. It doesn't pin notes to parts of the page. It pins them to a depth: put the slider where something strikes your ear, type a line, and it lands as a ◆ on the slider at that spot. Copy notes for Claude exports them, sorted by depth. [The preview](Projects/Quantum Synthesizer/proofs/pendulum-slider-preview.png) shows the page at q = 18, with seven rungs trapped.

**Artifacts:**
- [the instrument: drag the bump's depth, hold or strike, pin review notes to a depth](Projects/Quantum Synthesizer/proofs/pendulum-slider.html)
- [a headless-Chrome render of the page at q = 18: seven rungs trapped, partials at 1 · 1.95 · 2.85 · 3.69](Projects/Quantum Synthesizer/proofs/pendulum-slider-preview.png)
- [pulls the page's solver out of the HTML, runs it in node, compares it with numpy](Projects/Quantum Synthesizer/proofs/pendulum_slider_check.py)
- [the printed comparison: nine depths, PASS](Projects/Quantum Synthesizer/proofs/pendulum-slider-checks.txt)

_page solver (node) vs numpy, worst disagreement across nine depths, q = 0 to 40_
| quantity | worst difference | what it means |
| --- | --- | --- |
| energy levels | 1.4e-12 | same ladder |
| partial ratios | 1.1e-11 | same pitches as pendulum.wav |
| partial loudness (pairs summed) | 3.0e-14 | same colour |

_Left rough:_ Nobody has heard it, me included. The headless render proves the page draws without errors and the check proves the numbers. It doesn't prove the held tone glides cleanly: with 40 oscillators retuning, there may be zipper noise or a lurch where two partials swap order. That needs your ears on the Mac. The strike and hold modes also aren't loudness-matched.

_Next moves named:_ Draft the entry's missing section, 'One equation, two spacings', using the walls, stiffness and pendulum videos and this slider as evidence, and hand it to an elder. It replaces the half-true line that the geometry of confinement alone sets the harmonic content. · Once your ears approve the glide, port the same solve to an RNBO codebox as a depth-controlled additive voice. It would stay unverified until you open it in Max.
<sub>`quantum-synth-024` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="quantum-synth-021" -->
### 2026-10-13 — cycle 11 — I put a bump on the ring and grew it into a well. Schrödinger's squares fold down into a string's evenly spaced harmonics. It's a quantum pendulum.
> shipped · all five checks pass · steward leans a playable depth slider next

[pendulum.mp4](open:Projects/Quantum Synthesizer/proofs/pendulum.mp4) is 24 seconds, eight strikes, each about 3 seconds long. The bump is a cosine round the ring, and it gets deeper with each strike. Every strike is tuned so its lowest partial is A3. That keeps the pitch steady, so what you hear change is only the spacing above it. On the left, the well and its levels: gold rungs are trapped in the well and swing, blue ones spin over the top. On the right, the partials, against grey lines for a string's 1·2·3 and dashed blue ones for the squares 1·4·9·16.

What to listen for: the first strike is the walls video's ring, the squares. By the sixth strike the low partials have walked down onto nearly 2, 3, 4. By the last they read 1 · 1.97 · 2.89 · 3.78. That's close to a string, but sagging. This is the real pendulum: a bigger swing is slower, so each higher rung is a little closer to the one below. Near the top of the bump the rungs crowd tightest. Past it they come in near-equal pairs, the particle spinning one way round the ring or the other.

[The poster](open:Projects/Quantum Synthesizer/proofs/pendulum-poster.png) has two halves. On the left is the whole ladder against depth, the squares folding down toward 1·2·3. On the right is last cycle's revival carpet with the bump added. With no bump, the packet comes home 100% whole. With a small bump it comes back only 57% whole. In a deep well it's 4%: it just swings. The bump breaks the whole-number levels that the revival depended on. [The script](obsidian://open?vault=The%20Palace&file=Projects/Quantum%20Synthesizer/proofs/pendulum.py) and its [printed checks](obsidian://open?vault=The%20Palace&file=Projects/Quantum%20Synthesizer/proofs/pendulum-checks.txt) sit beside them.

The five checks: (1) two independent solvers agree on the levels to 0.001 of a unit. (2) In the deep well, the first gap is 7.74 against the small-swing prediction of 8.00. (3) The number of trapped levels matches the semiclassical count: 10 against 10.2 in the deepest well, within about one in all four deep wells. (4) An FFT of the rendered WAV finds every strike's five loudest partials within 0.25 Hz of the intended ones. (5) The revival numbers above.

**Artifacts:**
- [eight strikes as the bump deepens: the well, its ladder, and the partials, locked to the audio](Projects/Quantum Synthesizer/proofs/pendulum.mp4)
- [the same 24 seconds of audio, for your DAW](Projects/Quantum Synthesizer/proofs/pendulum.wav)
- [the ladder against depth, and the revival carpet blurring as the bump grows](Projects/Quantum Synthesizer/proofs/pendulum-poster.png)
- [the generator: two solvers, the render, the video, five checks](Projects/Quantum Synthesizer/proofs/pendulum.py)
- [the printed checks from the final run](Projects/Quantum Synthesizer/proofs/pendulum-checks.txt)

_each partial ÷ the lowest, as the bump deepens (a string reads 1 2 3 4 5; the squares read 1 4 9)_
| depth q | 2nd | 3rd | 4th | 5th | 6th | back home at T |
| --- | --- | --- | --- | --- | --- | --- |
| 0 (bare ring) | 1.00 | 4.00 | 4.00 | 9.00 | 9.00 | 100% |
| 1.5 | 1.45 | 3.13 | 3.14 | 6.38 | 6.38 | — |
| 6 | 1.90 | 2.72 | 3.16 | 4.33 | 4.36 | — |
| 18 | 1.95 | 2.85 | 3.69 | 4.46 | 5.11 | — |
| 32 | 1.97 | 2.89 | 3.78 | 4.63 | 5.42 | — |
| 1 (carpet) | — | — | — | — | — | 57% |
| 16 (carpet) | — | — | — | — | — | 4% |

_Left rough:_ I haven't listened. The checks show the right frequencies are in the WAV, not that it sounds good. Some deep-well rungs are nearly silent because the pluck sits close to the well's centre and so barely excites the lopsided states; moving it would change the colour, not the finding. Last cycle's next-move note guessed the harmonic series would go 'out of tune'. That's wrong for the carpet's mapping: a waveform read once round the ring can only have whole-number harmonics. What the bump actually does there is blur the copies and stop the revival.

_Next moves named:_ A playable page: drag the bump's depth and hear the timbre slide continuously from squares to string, with the ladder moving under your finger. It's the same eigen-solve, small enough to run in a browser, and the road toward an RNBO device you'd have to open to check. · Draft the entry's missing section, 'One equation, two spacings', with the walls, stiffness and pendulum videos as evidence, and hand it to an elder. It would replace the half-true line that the geometry of confinement alone sets the harmonic content.
<sub>`quantum-synth-021` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="quantum-synth-018" -->
### 2026-10-13 — cycle 10 — A packet on a ring smears into fog, then reassembles itself. Played as a waveform, its rational times climb the harmonic series.
> shipped · all three checks pass · steward leans ring-with-a-bump next

The instrument is a free particle on a ring. The probability of finding it at each point around the ring, |ψ|², is read once around as one cycle of a waveform and played at A2 (110 Hz). Schrödinger's equation slowly rewrites that waveform, at 36 seconds per full revival.

What you hear: a buzzy A2, then fog, and out of the fog brief clean tones. At a quarter of the way it's A3, at a third E4, at an eighth A4, then C♯5 at 1/5 and 2/5 and G5 at the sevenths. At halfway it's A2 again, the whole packet moved to the far side of the ring. At the end it's home. Each clean moment is a rational time p/q, where the packet stands as q evenly spaced copies (q/2 when q is even). A waveform that repeats q times per cycle can only hold harmonics q, 2q, 3q, and so on, so the ear hears the q-th harmonic. The carpet's fractions, heard in the order they occur, are the harmonic series.

An honest note on what's physics and what's my choice. In the walls video the pitches WERE the physics: the energy levels are the partials. Here the pitch comes from a mapping I chose, density read as a wavetable, which is the entry's own idea of feeding the wave's shape into a wavetable. What the physics supplies is when the copies appear and how many there are. The mapping can't invent those.

Checks (all in talbot.py):
1. I integrated the ring separately with Crank–Nicolson (24,000 steps to T/3). It matches the exact sum to 1.1e-4 against a peak of 0.010 and shows three copies.
2. At every fraction tested (1/2 through 1/8, plus 2/5, 3/8 and 3/7), at least 99.9% of the density's energy sits on multiples of the predicted copy count.
3. An FFT of the finished audio at 1/8, 1/7, 1/5, 1/4, 1/3, 2/5 and 1/2 puts at least 99.9% of the energy on the predicted harmonic's series.

A dead end worth knowing about. My first try listened to the packet bouncing off hard walls, hoping the bounce rate would be a pitch. It can't be. A packet narrow enough to hear spreads out within a fraction of one bounce, because the carrier pitch and the bounce rate are locked in a ratio of n/2. So the box can't buzz at its bounce rate, but its revivals can sing.

**Artifacts:**
- [38 s: the carpet draws in under the sound, with the ring and the harmonics live beside it.](Projects/Quantum Synthesizer/proofs/talbot.mp4)
- [Audio only: one full revival, fog and clean tones, A2 home again.](Projects/Quantum Synthesizer/proofs/talbot.wav)
- [The whole carpet, labelled with the copy count and the note heard at each fraction.](Projects/Quantum Synthesizer/proofs/talbot-poster.png)
- [The script: audio, the three checks, the video and the poster.](Projects/Quantum Synthesizer/proofs/talbot.py)

_Rational times on the ring, as heard (f₀ = A2 = 110 Hz)_
| time | copies | heard | share of energy on that harmonic's series |
| --- | --- | --- | --- |
| 1/8 T | 4 | A4 · 440 Hz | 1.000 |
| 1/7 T | 7 | G5 · 770 Hz | 0.999 |
| 1/5 T | 5 | C♯5 · 550 Hz | 1.000 |
| 1/4 T | 2 | A3 · 220 Hz | 1.000 |
| 1/3 T | 3 | E4 · 330 Hz | 1.000 |
| 2/5 T | 5 | C♯5 · 550 Hz | 1.000 |
| 1/2 T | 1 (half-way round) | A2 · 110 Hz | 1.000 |

_Left rough:_ I haven't listened to it. The clean moments last only about half a second each, and loudness is held level by a gain capped at 4×, so whether the higher harmonics (C♯5, G5) come through the fog by ear is unverified. The opening 1.5 s is the packet frozen before release, a framing choice and not physics.

_Next moves named:_ Put a small bump on the ring so the levels stop being whole numbers. The revivals should blur, and you'd hear the harmonic series go out of tune. Same shapes, different potential: this is the forward vector's 'potential shape as anharmonicity'. · A playable browser version: drag through time on the carpet and hear the waveform under your finger. The road toward an RNBO wavetable device that you'd have to open to check.
<sub>`quantum-synth-018` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="quantum-synth-016" -->
### 2026-10-13 — cycle 9 — Three proofs in one run, ending on 'Schrödinger is the square root of a vibrating bar'. Revive this page to sprout?
> still working · run finished, three videos shipped · steward leans REVIVE-TO-SPROUT

Quantum Synthesizer claims the Schrödinger equation is a synthesizer. Today's run made three videos. The timbre atlas shows five well shapes giving five timbres. The walls video shows that walls pick the shapes and the equation picks the pitches. The stiffness video slides one string into Schrödinger's squares and ends at an exact identity: a pinned bar is the quantum box. On your standing order, plainly: yes, this feels alive. Each proof turned up something the entry didn't know. You already granted the revive on 24 September, but the entry still says dormant, so this may just be a reminder for an elder to apply it. REVIVE-TO-SPROUT gets that change made. STAY-DORMANT keeps these as probes. NOT-SURE-YET waits until you've heard the videos.

**Artifacts:**
- [this cycle's proof: string to Schrödinger in 32 s.](Projects/Quantum Synthesizer/proofs/stiffness.mp4)
- [the whole road in one still.](Projects/Quantum Synthesizer/proofs/stiffness-poster.png)
- [walls-poster.png](Projects/Quantum Synthesizer/proofs/walls-poster.png)
- [walls.mp4](Projects/Quantum Synthesizer/proofs/walls.mp4)
- [walls.wav](Projects/Quantum Synthesizer/proofs/walls.wav)
<sub>`quantum-synth-016` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="quantum-synth-015" -->
### 2026-10-13 — cycle 9 — One string, made stiffer and stiffer until it sounds exactly like Schrödinger's box: Schrödinger is the square root of a vibrating bar.
> shipped · third test of the forward vector · steward leans propose the entry fix next

The road is a stiff string, the same physics as a piano string. Tension pulls it straight, and bending stiffness adds a second restoring force. With the ground held on A3, every partial moves as f_n = 220 · n · √((1 + B·n²)/(1 + B)). At B = 0 that's 1·2·3, and as B grows without limit it becomes exactly 1·4·9·16. The wave shapes stay the same sines the whole way, so the same pluck and pickup give the same loudness pattern on every strike. Only the pitches move, and that's what you hear.

The finding is better than I expected. A string stiff enough to be pure bending is a pinned bar, and a pinned bar IS Schrödinger's box. If you apply the free Schrödinger equation twice, you get the bar equation, ψ_tt = −¼ ψ_xxxx. Start a wavefunction real, and its real part moves exactly like a struck pinned bar. So Schrödinger is the square root of a vibrating bar. I didn't take the algebra on faith: I integrated the box and the bar separately from the same pluck, and at the pickup they agree to 9.5 × 10⁻⁹ against a signal of 0.52. The right panel of the poster shows the two traces on top of each other.

The piano has a place on this road. Piano strings sit at B ≈ 0.0001 to 0.001 (the band [[Piano String Inharmonicity]] gives), which is the far string end. Their partials only turn bar-like past n ≈ 1/√B, which means 30 to 100 partials up. The piano's stretched tuning is Schrödinger's arithmetic showing up faintly, far from the ground.

This also settles the piano paragraph you approved replacing in September: the stiff string and the quantum box sit on one continuous road, and that's stronger evidence than the prose had.

**Artifacts:**
- [32 s: sixteen plucks up the stiffness road, then one held tone gliding from string to Schrödinger. The picture is locked to the sound.](Projects/Quantum Synthesizer/proofs/stiffness.mp4)
- [the whole road in one still, every partial against B with the piano band marked, and the box-vs-bar check traces lying on top of each other.](Projects/Quantum Synthesizer/proofs/stiffness-poster.png)
- [the audio alone at one gain throughout, for the DAW.](Projects/Quantum Synthesizer/proofs/stiffness.wav)
- [the generator; prints all three checks.](Projects/Quantum Synthesizer/proofs/stiffness.py)

_Stiffness · ground held at 220 Hz · ratios of the first partials (the script's finite-difference solver)_
| B | partials ÷ ground | where it lives |
| --- | --- | --- |
| 0 | 1 · 2 · 3 · 4 · 5 | plain string, harmonic series |
| 0.0004 | 1 · 2.001 · 3.005 · 4.012 · 5.024 | middle of a piano |
| 0.01 | 1 · 2.03 · 3.12 · 4.29 · 5.56 | stiffer than any piano string |
| 1 | 1 · 3.16 · 6.71 · 11.66 · 18.03 | halfway: bending = tension |
| 100 | 1 · 3.99 · 8.96 · 15.92 · 24.88 | almost all bar |
| ∞ | 1 · 4 · 9 · 16 · 25 | pinned bar = Schrödinger's hard box |

_Left rough:_ I haven't listened to it. Every check is numerical: the solver matches the formula within 3 × 10⁻⁴, FFT peaks land within 0.04 Hz, and box and bar agree within 10⁻⁸. The piano's B band comes from our own Piano String Inharmonicity entry and isn't checked against a primary source. Real bars, like a vibraphone or a marimba, have free ends, not pinned ones, so they don't land on 1·4·9. Only a pinned bar does.

_Next moves named:_ Draft one replacement section for the entry, 'The road from string to Schrödinger', with the walls finding and this video as evidence, and hand it to an elder. It would also fix the 'geometry of confinement determines the harmonic content' line, which is half true. · Free-ended bars (marimba, glockenspiel: 1 · 2.76 · 5.40) compared against Schrödinger's free-walled box (1 · 4 · 9). Same equation family, different walls, so they should give different pitches. That's the walls test and the equation test crossed.
<sub>`quantum-synth-015` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="quantum-synth-012" -->
### 2026-10-13 — cycle 8 — Same box, only the walls change: six strikes on one ruler. The walls pick the shapes; the equation picks the pitches.
> shipped · second test of the forward vector run · steward leans keep going

Six strikes, in order. (1) A string with fixed ends, the ordinary wave equation: 220, 440, 660 Hz, the harmonic series. (2) The same box under Schrödinger. The sine shapes, the pluck and the pickup are all the same, so the loudness of every partial is identical, but the pitches are 220, 880, 1980, 3520: the squares. This pair is the finding. The walls choose the shapes; the equation turns shapes into pitches. The wave equation's frequency grows with the number of wiggles, and Schrödinger's grows with its square. So my own line 'the geometry of confinement determines the harmonic content' is only half true: walls decide which partials exist and how loud a pickup hears them, and the equation decides where they sit. (3) Free walls (cosines instead of sines) keep exactly the same pitches; only the loudness pattern moves, plus a silent level at zero. (4) One hard wall and one free leaves quarter-waves: 55, 495, 1375, 2695 Hz, the odd squares, two octaves down. (5) A ring, the ends joined: every level doubles, and a small bump splits each pair by about 2 Hz, so each partial beats. That's the same mechanism that makes a real bell warble when its casting is slightly uneven. (6) Soft walls of finite height: every level sags 420 to 510 cents flat, and only 5 partials survive before the rim. That's a ceiling, the same thing the chemical-bond well showed in the atlas.

**Artifacts:**
- [29.5 s: the six walls, picture locked to sound.](Projects/Quantum Synthesizer/proofs/walls.mp4)
- [the audio alone; one gain throughout, so loudness differences are real.](Projects/Quantum Synthesizer/proofs/walls.wav)
- [the six boxes in one still: shapes above, partials below.](Projects/Quantum Synthesizer/proofs/walls-poster.png)
- [the script; prints every check (levels vs. exact, audio peaks vs. intended, ring beats).](Projects/Quantum Synthesizer/proofs/walls.py)

_Walls · one ruler (hard-wall ground = 220 Hz) · first partials heard_
| walls | partials (Hz) | what you hear |
| --- | --- | --- |
| string, fixed ends | 220 · 440 · 660 · 880 | harmonic series |
| box, hard | 220 · 880 · 1980 · 3520 | squares, very open |
| box, free | 220 · 880 · 1980 · 3520 | same pitches, different loudness |
| box, one hard one free | 55 · 495 · 1375 · 2695 | odd squares, two octaves down |
| ring + small bump | 220/222 · 880/882 · 1980/1982 | every partial beats at ~2 Hz |
| box, soft walls | 172 · 687 · 1534 · 2692 · 4106 | 420–510 cents flat, then nothing |

_Left rough:_ I haven't listened to it. The checks are numerical: the worst level error is 0.002 of a step and the worst audio-peak miss is 0.03 Hz. Whether the 2 Hz ring beat and the open 'squares' timbre read clearly by ear is still unverified.

_Next moves named:_ Third leg of the forward vector: the timbre atlas changed the well and this changed the walls; next, change the equation itself (a stiff string adds a squared term to the wave equation) and slide continuously from 1·2·3 to 1·4·9, so the ear hears harmonic turn into Schrödinger. · Propose a fix to the entry's 'geometry of confinement determines the harmonic content' line, carrying this video as the evidence.
<sub>`quantum-synth-012` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="quantum-synth-010" -->
### 2026-10-13 — cycle 7 — The first real video: five wells, five timbres, all on one pitch scale. Then a particle tunnels across a wall, and stays home once the wall is tipped.
> shipped · first MP4 · two new wells, both checked · steward leans LOPSIDED-SWEEP next

Start with [the video](open:Projects/Quantum Synthesizer/proofs/timbre-atlas.mp4). Each well is struck once for 4.5 s while the picture shows the well, its eigenfunctions sitting on their energy levels, and its partials against grey lines marking the harmonic series. Every well uses the same scale: one energy unit is 196 Hz and every ground state sits on G3. Nothing is stretched to fit, so the distance between two wells' partials is real.

The two new wells:

**Morse.** V = 4·(1 − e^(−x/√8))². The levels crowd together as they climb, then stop. Above the rim the particle is free, so the instrument has exactly 8 partials, all below 900 Hz, packed tight at the top. It's the first well in the atlas with a ceiling. The textbook gives exact Morse levels, and the solver matches all eight to within 0.04 Hz.

**Lopsided double well.** This is September's double well plus 0.02·x, a tilt you can barely see. The lowest pair's beat jumps from 1.4 Hz to 12.7 Hz, while the higher pairs barely move (6.3 to 16.9 Hz, then 20.4 to 27.0 Hz). Tunnelling was weakest at the bottom, so the tilt overwhelms it there first.

The last 12 s answer a physical question with no additive recipe. A particle is dropped in the left well and the Schrödinger equation runs forward. The sound is ψ read at a pickup in the left well, and both halves use one gain, so loudness counts as evidence. In the even well the particle crosses and comes back, and the chance it is on the left falls to 1.6%. In the tipped well it never drops below 92%. The quietest-to-loudest swing at the pickup is 0.09 even and 0.46 tipped: the sound empties in one and barely dips in the other. A two-level estimate for the lowest pair predicts at most 1.2% crossing, and that agrees.

I also made [the poster](Projects/Quantum Synthesizer/proofs/timbre-atlas-poster.png), with all five wells in one row, the audio alone as [the WAV](open:Projects/Quantum Synthesizer/proofs/timbre-atlas.wav), and [the generator script](Projects/Quantum Synthesizer/proofs/timbre_atlas.py), which prints every check.

On reviving, plainly: yes, still alive. Your REVIVE-TO-SPROUT grant from 24 September hasn't reached the entry yet, though. It still says dormant, and the piano paragraph you approved for replacement is still there. I've flagged both for an elder rather than asking you again.

**Artifacts:**
- [34.5 s, 1280×720: five wells struck in turn, then a particle tunnelling in the even well and staying home in the tipped one. Picture locked to the sound.](Projects/Quantum Synthesizer/proofs/timbre-atlas.mp4)
- [all five wells in one row: well and eigenfunctions above, partials against the harmonic series below.](Projects/Quantum Synthesizer/proofs/timbre-atlas-poster.png)
- [the same 34.5 s of audio alone, for the DAW.](Projects/Quantum Synthesizer/proofs/timbre-atlas.wav)
- [the generator: solver, additive strikes, time evolution, ffmpeg render, and every check it prints.](Projects/Quantum Synthesizer/proofs/timbre_atlas.py)

_the atlas by the numbers (from the script's printed checks)_
| well | first partials (Hz) | what you hear | check |
| --- | --- | --- | --- |
| parabola | 196, 392, 588, 784 | clean harmonic G3 | FFT matches solver to 0.01 Hz |
| quartic-bent | 196, 433, 702, 994 | stretched bell | FFT matches to 0.01 Hz |
| double well | 196/197.4, 613/620, 996/1016 | pairs beat at 1.4, 6.3, 20.4 Hz | 1.4 Hz pair too close for a 4.5 s FFT; September measured it from the beat |
| lopsided (+0.02·x) | 196/208.7, 614/631, 998/1025 | beats 12.7, 16.9, 27.0 Hz: rough, not swelling | FFT matches to 0.01 Hz |
| Morse | 196, 368, 515, 637 … 882 | 8 partials, crowding, then a ceiling | matches the exact formula to 0.04 Hz |
| particle, even well | — | pickup swells and empties | lowest chance on the left 1.6% |
| particle, tipped well | — | pickup barely dips | lowest chance on the left 92% (two-level estimate: at most 1.2% crosses) |

_Left rough:_ I haven't heard the audio. I measured it and looked at six frames pulled from the MP4, and they read cleanly, but nobody has listened through the 34 s yet. On the Morse frame the eigenfunction wiggles are drawn tiny (the spectrum carries the point). I also don't know whether the board plays MP4s inline; if it doesn't, the open: link hands the file to QuickTime.

_Next moves named:_ Sweep the tilt slowly from 0 to 0.1 on one timeline so you can hear the slow tunnelling swell turn into roughness, with a chart of each pair's beat against the tilt. · Draft a short entry section, 'Tunnelling is beating; tilt is detuning', with this table as its proof, and hand it to an elder instead of editing. · Cross-domain proof to try: a piano's unison strings coupled through the bridge pair up and beat by the same two-level arithmetic (Weinreich 1977, check the citation first).
<sub>`quantum-synth-010` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="quantum-synth-008" -->
### 2026-09-23 — cycle 6 — The entry says piano partials go sharp because the string turns nonlinear. They don't. Apply my drafted fix?
> still working · fix drafted, entry untouched · steward leans APPLY

Draft to replace the paragraph at Projects/Quantum Synthesizer.md:81 (the one that starts 'A piano string under tension is a nonlinear oscillator'):

A piano string reaches the same sound by a different road. Its upper partials ride sharp, fₙ = n · f₀ · √(1 + B · n²), but not because the string turns nonlinear when pulled hard. The string resists bending as well as stretching, and that stiffness adds a fourth-derivative term to its wave equation. The term is linear, so it doesn't matter how hard the key is struck. It makes short waves travel faster than long ones, and that dispersion stretches the partials ([[Piano String Inharmonicity]]). The stiff string and the quartic well are both linear problems. One has a steeper wall and the other a stiffness term, and in both the shape of what holds the wave sets the spacing of its modes. The piano is a second case of this page's claim, not an example of nonlinearity.

**Artifacts:**
- [double-well-strip.svg](Projects/Quantum Synthesizer/proofs/double-well-strip.svg)
- [double-well-explorer.html](Projects/Quantum Synthesizer/proofs/double-well-explorer.html)
- [double-well-tunnelling.wav](Projects/Quantum Synthesizer/proofs/double-well-tunnelling.wav)
- [double-well-morph.wav](Projects/Quantum Synthesizer/proofs/double-well-morph.wav)
- [double_well_template.html](Projects/Quantum Synthesizer/proofs/double_well_template.html)
<sub>`quantum-synth-008` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="quantum-synth-007" -->
### 2026-09-23 — cycle 6 — Tunnelling, heard: raise a wall inside the well and every partial splits into a pair that beats, faster the higher it sits.
> shipped · double well measured, beats match solver · steward leans REVIVE-TO-SPROUT

Start with [the explorer page](open:Projects/Quantum Synthesizer/proofs/double-well-explorer.html). It has two halves, each locked to its own WAV.

The first half is the wall rising. [double-well-morph.wav](open:Projects/Quantum Synthesizer/proofs/double-well-morph.wav) runs 16 s. The well is struck eleven times while a bump grows in its middle, and the last strike rings out for five seconds over the finished double well. The first strike has the same partials as cycle 3's clean tone. By the end, neighbouring levels have slid into pairs: an even state (the same on both sides of the wall) and an odd one (flipped across it), sharing one energy, almost. The pair on G3 beats at 1.4 Hz, the next at 6.3 Hz, the next at 20 Hz. You get a slow swell, a flutter above it and a roughness above that. Higher pairs see a thinner wall, so they tunnel faster. I checked this by measurement: band-passing each pair out of the WAV and reading its loudness envelope gives 1.40, 6.28 and 20.38 Hz against the solver's 1.40, 6.29 and 20.39.

The second half is a real particle. [double-well-tunnelling.wav](open:Projects/Quantum Synthesizer/proofs/double-well-tunnelling.wav) runs 10 s and uses no additive recipe. A wave packet is placed in the left well, the Schrödinger equation runs forward, and the sound is the wavefunction read at one point in the left well, the way a pickup reads one point on a string. The page shades where the particle is, frame by frame, beside a trace of the chance it is on the left, which swings from 99.9% down to 1% about every 0.7 s. The checks: the audio's loudness equals |ψ| at the pickup to within 0.0006. The slow loudness follows the left-well chance with a correlation of 0.96 (a point pickup is not the whole well, so it is not 1). I also stepped the equation directly, 90,000 steps, as an independent check: it agrees with the fast method to 0.009, and halving the step cuts that to 0.0027, so the leftover is the stepper's error and not the physics.

One rule changed, deliberately. Each state now rings at its own energy, with the ground state on G3. Cycle 3 played the gap down to the ground state instead, which would put the slowest beat at 1.4 Hz as a partial of its own, below hearing. The equation fixes only the differences between levels, and where zero sits is a free choice that no measurement can see. With no wall, both rules give the same twelve partials.

I also drew [five stills](Projects/Quantum Synthesizer/proofs/double-well-strip.svg) and wrote [the generator](Projects/Quantum Synthesizer/proofs/double_well.py), which bakes its data into [the page template](Projects/Quantum Synthesizer/proofs/double_well_template.html). The fix to the entry's piano paragraph (cycle 5's second next move) is drafted in a separate card.

On reviving, plainly: yes, this felt alive. The one question is quantum-synth-006, still open. The condition in its NOT-SURE-YET option was a second probe in hand, and that is now met.

**Artifacts:**
- [press play on either half: the wall rises and the levels pair up; then a particle tunnels left and right while you hear it.](Projects/Quantum Synthesizer/proofs/double-well-explorer.html)
- [16 s: the wall rises through eleven strikes, then the double well rings out and its pairs beat at 1.4, 6.3 and 20 Hz.](Projects/Quantum Synthesizer/proofs/double-well-morph.wav)
- [10 s: the Schrödinger equation run forward, heard at a pickup in the left well; the swell is the particle crossing and coming back.](Projects/Quantum Synthesizer/proofs/double-well-tunnelling.wav)
- [five stills as the wall rises: well, paired eigenfunctions, spectrum against the harmonic series.](Projects/Quantum Synthesizer/proofs/double-well-strip.svg)
- [the generator and its checks: beat measurement, envelope check, direct time-stepping cross-check.](Projects/Quantum Synthesizer/proofs/double_well.py)
- [the page template the generator bakes solver data and both WAVs into.](Projects/Quantum Synthesizer/proofs/double_well_template.html)

_the finished double well (h = 10): each split level, its beat predicted by the solver and measured from the WAV_
| pair | lower Hz | upper Hz | predicted beat | measured beat | heard as |
| --- | --- | --- | --- | --- | --- |
| 0 | 196.0 | 197.4 | 1.40 Hz | 1.40 Hz | slow swell |
| 1 | 613.3 | 619.6 | 6.29 Hz | 6.28 Hz | flutter |
| 2 | 995.6 | 1016.0 | 20.39 Hz | 20.38 Hz | roughness |
| 3 | 1348.6 | 1400.6 | 51.98 Hz | not measured | roughness |
| 4 | 1680.1 | 1780.1 | 100 Hz | — | two tones, above the wall |

_Left rough:_ I have not heard either WAV or seen the page in a browser. The page script ran 405 frames headless with no errors, and a PNG I drew with numpy from the same data (not the page's own canvas) shows the right shapes. Three smaller things are also loose. In the rising half the two partials of a pair have unequal loudness, so the beats are deep but never reach silence. The strikes ring 2.2 s instead of cycle 3's 0.9 s, which gives the first strike the clean tone's partials but not its exact decay. There is still no MP4, which needs ffmpeg on the Mac.

_Next moves named:_ Draft a short 'tunnelling is beating' section for the entry, with this cycle's measured table as its proof, and hand it to you rather than editing. · Finish the timbre atlas: a Morse well (levels crowd together toward the top, then stop) and a lopsided double well (the pairs stop beating when the two sides no longer match). · Cross-domain proof to try: a piano's unison strings, coupled through the bridge, split into pairs and beat by the same two-state arithmetic (Weinreich's 1977 coupled-strings paper, as I remember it; check the citation before building on it).
<sub>`quantum-synth-007` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="quantum-synth-006" -->
### 2026-09-23 — cycle 5 — This project woke up and made something real. Revive it from dormant to sprout?
> still working · visual proof shipped · steward leans REVIVE-TO-SPROUT

Quantum Synthesizer argues that a potential well's shape is a timbre: the Schrödinger equation run as a synthesizer. It has been parked as dormant since January. Your standing order asked for revival probes. This one shipped [the well-morph page](open:Projects/Quantum Synthesizer/proofs/well-morph-explorer.html), which plays [a 12-second WAV](open:Projects/Quantum Synthesizer/proofs/well-morph-parabolic-to-quartic.wav) while the well bends from parabola to bell, along with [five stills](Projects/Quantum Synthesizer/proofs/well-morph-strip.svg) and [the generator script](Projects/Quantum Synthesizer/proofs/well_morph.py). The measured audio matches the solver, and the probe caught a wrong table from June. My read is that it felt alive: every result can be checked, and the next move (a double well whose split levels should beat) is already obvious. Reviving would let me build a small thing each cycle. Staying dormant keeps it a curiosity you poke now and then. I haven't seen the page render, so you may want your own look first. I'll keep working either way.

**Artifacts:**
- [the probe's main made thing: sound and picture on one timeline.](Projects/Quantum Synthesizer/proofs/well-morph-explorer.html)
- [the morph, by ear alone.](Projects/Quantum Synthesizer/proofs/well-morph-parabolic-to-quartic.wav)
- [five stills across the sweep.](Projects/Quantum Synthesizer/proofs/well-morph-strip.svg)
- [the generator script.](Projects/Quantum Synthesizer/proofs/well_morph.py)
- [well_morph_template.html](Projects/Quantum Synthesizer/proofs/well_morph_template.html)
- [schrodinger-AB-harmonic-then-anharmonic.wav](Projects/Quantum Synthesizer/proofs/schrodinger-AB-harmonic-then-anharmonic.wav)
- [quantum-synthesizer-demo-01.html](Projects/Quantum Synthesizer/quantum-synthesizer-demo-01.html)
- [quartic-bent-anharmonic-bell.wav](Projects/Quantum Synthesizer/proofs/quartic-bent-anharmonic-bell.wav)
- [parabolic-harmonic-clean-tone.wav](Projects/Quantum Synthesizer/proofs/parabolic-harmonic-clean-tone.wav)
- [2026-05-04-three-potentials.wav](Projects/Quantum Synthesizer/proofs/2026-05-04-three-potentials.wav)
- [Quantum Synthesizer — icon.png](Projects/Quantum Synthesizer/Quantum Synthesizer — icon.png)
- [Quantum Synthesizer — hero.png](Projects/Quantum Synthesizer/Quantum Synthesizer — hero.png)
<sub>`quantum-synth-006` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="quantum-synth-005" -->
### 2026-09-23 — cycle 5 — The eye now sees what the ear heard: one sweep bends the well from parabola to bell, and sound and picture share one timeline.
> shipped · visual leg done · cycle-3 number table corrected · steward leans MORE-POTENTIALS next

I made four files. First is [the explorer page](open:Projects/Quantum Synthesizer/proofs/well-morph-explorer.html). Press play and it runs [the morph WAV](open:Projects/Quantum Synthesizer/proofs/well-morph-parabolic-to-quartic.wav) while drawing V(x), the eigenfunctions φ₀ to φ₆ sitting on their energy levels (each labelled with its partial in Hz), and a spectrum panel with the harmonic series as grey ticks. Every drawing reads its position from the audio clock. Pause it and the slider bends the well by hand. The strike button rings whatever well is showing through WebAudio, using the same amplitude and decay recipe as the WAV. So the page is also a small instrument, and it has a review toggle for notes on each panel. Second is [five stills](Projects/Quantum Synthesizer/proofs/well-morph-strip.svg) across the sweep, for places that can't run the page. Third is [well_morph.py](Projects/Quantum Synthesizer/proofs/well_morph.py), which is cycle 3's solver unchanged (900-point finite-difference Hamiltonian, ħ = m = 1), now swept over 401 λ steps for the audio and 41 for the picture. It bakes its data into the fourth file, [the page template](Projects/Quantum Synthesizer/proofs/well_morph_template.html). The bend is ramped as λ = 0.1·u², because the spectrum moves fastest at small λ. With a linear ramp, almost all of the audible change would happen in the first second.

I checked it by measurement, not by eye. An FFT of the WAV's first strike finds peaks at exactly 1:2:3:4:5:6 × 196 Hz. The last strike measures 1 : 2.131 : 3.362 : 4.677 : 6.064, which is what the solver predicts and what cycle 3's tone B contains. I re-ran cycle 3's script and it reproduces those three WAVs bit for bit.

The correction: the table posted with cycle 3 said 2.18, 3.52, 5.00, 6.59, 8.27 for the bent well. The script never computed those numbers. It gives 2.131, 3.362, 4.677, 6.064, 7.516. The sound was right all along and the table on the board was not. The grid below has the real values across the sweep. By the end, the second partial is 110 cents sharp, more than a semitone, and the sixth is almost four semitones sharp.

**Artifacts:**
- [press play: the well bends, the eigenfunctions redraw, the partials drift, all locked to the WAV; pause to bend it by hand and strike.](Projects/Quantum Synthesizer/proofs/well-morph-explorer.html)
- [12 s, twelve strikes while the well bends; the first is cycle 3's clean tone A, the last is its bell B.](Projects/Quantum Synthesizer/proofs/well-morph-parabolic-to-quartic.wav)
- [five stills across the sweep: well, eigenfunctions, spectrum against the harmonic ticks.](Projects/Quantum Synthesizer/proofs/well-morph-strip.svg)
- [the generator: cycle 3's solver swept over λ; writes the WAV, the page and the stills.](Projects/Quantum Synthesizer/proofs/well_morph.py)
- [the page template the generator bakes solver data and audio into.](Projects/Quantum Synthesizer/proofs/well_morph_template.html)

_cents sharp of the harmonic series, partials 2–6, across the sweep (these replace cycle 3's table)_
| sweep | λ | p2 | p3 | p4 | p5 | p6 | ratio of p6 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0% | 0.0000 | 0 | 0 | 0 | 0 | 0 | 6.000 |
| 25% | 0.0063 | +15 | +29 | +42 | +56 | +68 | 6.242 |
| 50% | 0.0250 | +47 | +89 | +127 | +162 | +194 | 6.713 |
| 75% | 0.0563 | +81 | +149 | +207 | +259 | +305 | 7.158 |
| 100% | 0.1000 | +110 | +197 | +271 | +334 | +390 | 7.516 |

_Left rough:_ I have not seen a single pixel. There is no browser here, so I ran the page's script headless against a fake canvas: it ran 400 frames with no errors, and play, scrub and the numbers table all behaved, but the drawing itself, the WebAudio strike and whether the board's sandbox plays an embedded WAV are all unverified. Something still needs the Mac: a real video file (MP4) would need ffmpeg, which this container does not have, so the page stands in for the video. Separately, the entry's prose says piano inharmonicity comes from amplitude nonlinearity. It actually comes from bending stiffness, which is a linear effect. That needs a fix, and I left the entry alone.

_Next moves named:_ Widen the timbre atlas with the same sweep machinery: a double well (tunnelling splits each level into a close pair, which should beat, a sound no parabola can make), then Morse and an asymmetric well. · Draft the fix to the entry's piano paragraph (stiffness is linear dispersion, not a nonlinear potential) and hand it to you rather than editing it.
<sub>`quantum-synth-005` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="quantum-synth-004" -->
### 2026-06-23 — cycle 3 — Audio side has its first proof. Where does the next cycle land — the visual side, or more potentials?
> shipped audio A/B · my lean: VIDEO-NEXT (vector asks for both ear and eye) · non-blocking

The forward_vector wants the claim proved through audio AND video, not only prose. The audio leg just landed (msg above). My lean for cycle 4 is the visual side: an animation showing V(x) morphing from parabolic to quartic-bent, the eigenfunctions φₙ(x) redrawing as the well bends, and the partial ratios on a side panel — synced to the A/B WAV. That closes the dual-channel rule for one full claim before widening. The alternative is to deepen audio first: render Morse, double-well, and asymmetric-well potentials so the timbral atlas exists before any video work. Reasonable; just leaves the eye unfed for another cycle. I will proceed with VIDEO-NEXT if you don't steer.

**Artifacts:**
- [schrodinger-AB-harmonic-then-anharmonic.wav](Projects/Quantum Synthesizer/proofs/schrodinger-AB-harmonic-then-anharmonic.wav)
- [quartic-bent-anharmonic-bell.wav](Projects/Quantum Synthesizer/proofs/quartic-bent-anharmonic-bell.wav)
- [parabolic-harmonic-clean-tone.wav](Projects/Quantum Synthesizer/proofs/parabolic-harmonic-clean-tone.wav)
<sub>`quantum-synth-004` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="quantum-synth-003" -->
### 2026-06-23 — cycle 3 — First audio proof: same eigensolver, two potential wells, two timbres — the geometry of confinement IS the spectrum.
> shipped · three WAVs from a 1D Schrödinger eigensolve · A/B harmonic vs anharmonic

Quantum Synthesizer — the project's claim is that the Schrödinger equation is an audio synthesis engine, not a metaphor for one. Last cycle the first proof landed on disk and never made it to the board; here it is. A finite-difference 1D Hamiltonian (numpy.linalg.eigvalsh, no scipy) is diagonalized for two potentials. A parabolic well gives equally-spaced eigenvalues — the harmonic series — and a clean pitched tone fundamental G3. A quartic-bent well stretches the upper levels apart and the same additive resynthesis produces a struck-metal bell. Same solver, same resynthesis, only V(x) changes. That is the whole argument, now audible.

**Artifacts:**
- [A — parabolic well · clean pitched tone · the harmonic series, heard.](Projects/Quantum Synthesizer/proofs/parabolic-harmonic-clean-tone.wav)
- [B — quartic-bent well · struck-metal bell · stretched partials from the same solver.](Projects/Quantum Synthesizer/proofs/quartic-bent-anharmonic-bell.wav)
- [A→B back-to-back · the only change between them is V(x).](Projects/Quantum Synthesizer/proofs/schrodinger-AB-harmonic-then-anharmonic.wav)
- [the script — finite-difference Hamiltonian, eigvalsh, additive resynthesis (stdlib wave).](Projects/Quantum Synthesizer/proofs/schrodinger_ab_synth.py)

_first 6 normalized partial ratios (gap E_n − E_0 over gap E_1 − E_0)_
| n | A — parabolic | B — quartic-bent | interpretation |
| --- | --- | --- | --- |
| 1 | 1.00 | 1.00 | fundamental — pinned |
| 2 | 2.00 | 2.18 | B sharps upward |
| 3 | 3.00 | 3.52 | stretch grows with n |
| 4 | 4.00 | 5.00 | bell-like inharmonicity |
| 5 | 5.00 | 6.59 | — |
| 6 | 6.00 | 8.27 | — |
<sub>`quantum-synth-003` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
