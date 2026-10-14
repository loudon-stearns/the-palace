---
title: "Portamento and Physical Pitch Modeling — scroll"
born: 2026-09-23
links:
  - target: "[[Portamento and Physical Pitch Modeling]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Portamento and Physical Pitch Modeling's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Portamento and Physical Pitch Modeling — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Portamento and Physical Pitch Modeling]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-14T13:49:55.239Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** mature · **Steward:** cycle 9 · last ran 2026-10-14 (today)
- **Plan:** none agreed yet — the work leans on the forward vector
- **Waiting on you:** nothing
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-14 (today) — My entry's Kuramoto paragraph puts the coupling in the wrong instrument. Locking belongs to bowed and sung tones, not to a free string. (`portamento-steward-018`)
- **Last commit touching this project:** 2026-09-26 `5b8a1564` — ops(frontmatter): strip retired activation_count/last_activated from 244 entries — v1.26
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Portamento and Physical Pitch Modeling treats pitch as a damped spring settling on a note. The three ways it can settle are overdamped (eases in), critically damped (arrives clean) and underdamped (overshoots and rings back). The ear-training set and a six-clip single-session reel shipped in June. In August you picked MULTI-MODE: take the model from one gliding pitch to a whole family of partials, and render how the timbre moves during a glide. A first pass from September sat unposted in the workshop. Its slide-versus-bend contrast holds up, but its coupling did nothing: the 'locked' and 'uncoupled' glides have the same partials to within 0.3 cents, because the pull was about 1 rad/s agains…

### Open asks

_None — nothing is waiting on you._

### Answered, not yet consumed

_None._

### Decided

- `portamento-steward-015` — directional_decision → GRANTED — option_id=MULTI-MODE (2026-08-26)

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
<!-- scroll:entry id="portamento-steward-018" -->
### 2026-10-14 — cycle 9 — My entry's Kuramoto paragraph puts the coupling in the wrong instrument. Locking belongs to bowed and sung tones, not to a free string.
> finding · entry edit proposed, not made · steward leans adopt

**target entries:** Portamento and Physical Pitch Modeling · Kuramoto Coupling
**claim:** The Kuramoto Coupling Perspective section of [Portamento and Physical Pitch Modeling](obsidian://open?vault=The%20Palace&file=Portamento%20and%20Physical%20Pitch%20Modeling) says a sliding string's modes 'chase each other' as weakly coupled Kuramoto oscillators. Today's build says the coupling lives somewhere else. A free, plucked string's modes don't lock: they ring at their own stretched frequencies. Locking is what a self-sustained instrument does (bow, voice, reed). Its excitation pulls each partial onto an exact harmonic while the pull beats the stiffness detuning (Fletcher 1978). That is the Adler, two-oscillator Kuramoto equation, and a glide moves partials across its threshold. Sliding unlocks them from the top down. Raising tension pulls them back in. An underdamped overshoot makes one slip and catch. The September model, which put Kuramoto coupling on a plain glide, produced no measurable effect (0.3 cents). Proposed replacement for the section's middle paragraph: 'A plucked string's modes ring free at their own stretched frequencies. A bowed or sung tone locks them: the excitation pulls each partial onto an exact multiple of the fundamental for as long as that pull beats the stiffness detuning. A glide moves the detuning, so it moves partials into and out of lock. Sliding unlocks them from the top down, raising tension pulls them back in, and an underdamped overshoot makes one slip and catch, so the ring-back is heard in the timbre as well as the pitch.' Evidence: [mode-locking.png](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/figures/mode-locking.png) and the pair on [the listening page](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/mode-locking-listening.html).
**confidence:** high for the model's logic and the September null; the size of the effect in real bowed strings is untested against recordings

**Artifacts:**
- [Partials in and out of lock across five glides.](Projects/Portamento and Physical Pitch Modeling/multi-mode/figures/mode-locking.png)
- [Hear the overshoot pair.](Projects/Portamento and Physical Pitch Modeling/multi-mode/mode-locking-listening.html)
<sub>`portamento-steward-018` · FLAG on FLAGS</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="portamento-steward-017" -->
### 2026-10-14 — cycle 9 — A bowed string's ring-back is a timbre event too: on the overshoot one partial slips out of lock and catches again. A critically damped arrival never slips.
> shipped · multi-mode pass 2 with a listening pair · steward leans fold the pair into the ear-training reel next

**The physics.** A stiff string's own resonances are stretched: partial n sits at n·f1·√(1+B·n²). A plucked string rings right there, slightly sharp of the harmonic series. A bowed string, a voice or a reed is self-sustained. Its excitation keeps pulling every partial back onto an exact multiple of the fundamental, as long as that pull beats the stretch (Fletcher 1978, mode locking in inharmonic instruments). For each partial that is two-oscillator Kuramoto, the Adler equation below. A glide changes the stretch, so a glide moves partials in and out of lock.

**What the five clips show.** (1) Plucked, sliding up an octave: nothing locks, and the top partial ends 82 cents sharp. (2) The same slide bowed: it starts with 4 partials locked, then partial 4 lets go at 0.60 s and partial 3 at 0.75 s, from the top down. Sliding shortens the string, and the stretch grows as pitch cubed. (3) The same octave by tension, like a peg turn while bowing: the stretch now falls as pitch rises, so a beating 4th partial is pulled into lock at 0.76 s and the tone clears. Slide and peg cover the same interval with opposite timbre journeys. (4) and (5) are the pair. Both are bowed and both land on E4 (330 Hz). The underdamped one (ζ 0.2) overshoots to 400 Hz, so partial 3 lets go from 0.82 to 1.31 s and again from 1.93 to 2.31 s on the second ring. The critically damped one never passes the note, and partial 3 never comes loose.

**Why it matters for the teaching.** Until now the regimes were told apart by pitch alone. This gives the underdamped regime a second cue, texture right after the arrival, and that is how a real bowed or sung overshoot sounds. Take the pair on [the listening page](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/mode-locking-listening.html), or play [B, underdamped](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/locking-04-bow-overshoot.wav) against [A, critically damped](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/locking-05-bow-critical.wav). The whole picture is [mode-locking.png](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/figures/mode-locking.png).

**Artifacts:**
- [Listening page: three clips, the by-ear pair with a reveal, and both figures.](Projects/Portamento and Physical Pitch Modeling/multi-mode/mode-locking-listening.html)
- [Plucked slide: nothing locks, the top drifts sharp.](Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/locking-01-pluck-slide.wav)
- [Bowed slide: partials break loose from the top down.](Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/locking-02-bow-slide.wav)
- [Bowed peg turn: a beating partial is pulled into lock.](Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/locking-03-bow-peg.wav)
- [Pair B, underdamped: partial 3 slips on the overshoot and catches.](Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/locking-04-bow-overshoot.wav)
- [Pair A, critically damped: the same note, no slip.](Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/locking-05-bow-critical.wav)
- [Each partial's distance from the harmonic series, and how many stay locked, for all five clips.](Projects/Portamento and Physical Pitch Modeling/multi-mode/figures/mode-locking.png)
- [Partials 3–5 for the pair: partial 3 smears through the overshoot and stays clean in the critical arrival.](Projects/Portamento and Physical Pitch Modeling/multi-mode/figures/overshoot-pair-spectrogram.png)
- [The model and renderer, with the diagnosis of the September null in its header.](Projects/Portamento and Physical Pitch Modeling/multi-mode/mode_locking.py)
- [Every parameter and every number quoted here.](Projects/Portamento and Physical Pitch Modeling/multi-mode/locking-manifest.json)

_Five clips · 10 partials · 'locked' = detuning inside the locking range_
| clip | glide | partials locked start → end | what changes |
| --- | --- | --- | --- |
| 1 plucked slide | G3→G4, ζ 1 | 0 → 0 | top drifts 82 cents sharp |
| 2 bowed slide | G3→G4, ζ 1 | 4 → 2 | partial 4 lets go 0.60 s, partial 3 at 0.75 s |
| 3 bowed peg turn | G3→G4 by tension | 3 → 4 | partial 4 pulled into lock 0.76 s |
| 4 bowed, underdamped | G3→E4, ζ 0.2, peak 400 Hz | 5 → 3 (dips to 2) | partial 3 slips 0.82–1.31 s and 1.93–2.31 s |
| 5 bowed, critically damped | G3→E4, ζ 1 | 5 → 3 | partial 3 never slips |

_Left rough:_ Nobody has listened yet, and the slip is subtle: one partial at a third of the fundamental's level. I exaggerated the stiffness and gave every partial the same locking range so the lock boundary falls mid-spectrum where a glide can move it. That leaves partials 5–10 free the whole time, which a real bow wouldn't do. Pluck and bow have the same sustained loudness (no pluck decay, no bow noise). The September renders stay on disk as they were.

_Next moves named:_ Fold the underdamped/critically damped pair into the single-session ear-training reel as a second-round item, so 'texture after the arrival' becomes a cue students are taught to hear. · Make the locking range depend on loudness (a harder bow locks more) and render a crescendo through a fixed glide. The tone should fuse as it gets louder: dynamics heard as timbre. · Put the model on a sung glide: fixed formants plus partials locked to the voice. That is the entry's vocal-tract question, now that locking is in hand.
<sub>`portamento-steward-017` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="portamento-steward-015" -->
### 2026-06-23 — cycle 7 — Reel is on the board. Which sub-vector wants the next cycle?
> still working · 6-clip single-session reel shipped · I lean REAL-RECORDINGS

The forward vector has two unfinished arcs left. (1) REAL-RECORDINGS — the model-fitter exists with validation against synthetic targets, but it has never been pointed at real audio (a vocalist's slide, a cello portamento, a bell strike). Fitting ζ and ω_n to real recordings would tell us where the second-order model actually holds and where it breaks — and the model-vs-real wavelet overlay would be the strongest teaching artifact in the set. (2) PROGRESSIVE-CURRICULUM — wrap the reel + paired-exercises + quiz into one sequenced Loudon Live session page with voiceover script and reveal pacing baked in; ship-ready as a teaching deliverable, not just a tool. (3) MULTI-MODE — extend the model to the coupled-modes case (string with inharmonicity, bell with multiple satellite modes) and render the audible timbre evolution during a glide. I lean REAL-RECORDINGS because the model is currently unfalsified — and a model that has never met a real recording is the project's biggest pedagogy gap. The reel will run fine until you hear it; if no preference, I take REAL-RECORDINGS next.

**Artifacts:**
- [the shipped reel.](Projects/Portamento and Physical Pitch Modeling/curated-ear-set/single-session-reel.html)
- [fit_validation.png](Projects/Portamento and Physical Pitch Modeling/model-fitter/fit_validation.png)
<sub>`portamento-steward-015` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="portamento-steward-014" -->
### 2026-06-23 — cycle 7 — A 15-minute, 6-clip ear-training reel — the regimes in one sitting.
> shipped · single-session reel built from the curated 12 · ready to audition

Catch-up: Portamento and Physical Pitch Modeling treats pitch as a second-order damped oscillator — overdamped (smooth surrender), critically damped (purposeful arrival), underdamped (overshoot and ring-back). The curated ear set (12 clips, 4 per regime, with spectrograms, quiz.html, and paired-exercises.html) has been on disk for weeks. The entry's forward vector asks for something the 12-clip set is too long for: a single-session exercise where a student walks away identifying the regime by ear. This cycle ships exactly that — a 6-clip reel sequenced easy → harder, with reveal-after-listen for each clip and a closing score-band note.

Round one is unambiguous (trombone / synth glide / bell). Round two sharpens (theremin, controlled guitar release, fast electric bend with vibrato). The hardest boundary — overdamped vs critically damped, both without ring — is the one the round-two acoustic-vs-electric guitar pair is designed to drill.

**Artifacts:**
- [the reel — open in the board to take it in place.](Projects/Portamento and Physical Pitch Modeling/curated-ear-set/single-session-reel.html)
- [01 — trombone, overdamped.](Projects/Portamento and Physical Pitch Modeling/curated-ear-set/audio/01-overdamped.wav)
- [02 — synth glide, critically damped.](Projects/Portamento and Physical Pitch Modeling/curated-ear-set/audio/05-critically-damped.wav)
- [03 — bell, underdamped.](Projects/Portamento and Physical Pitch Modeling/curated-ear-set/audio/09-underdamped.wav)
- [04 — theremin, overdamped.](Projects/Portamento and Physical Pitch Modeling/curated-ear-set/audio/02-overdamped.wav)
- [05 — guitar bend release, critically damped.](Projects/Portamento and Physical Pitch Modeling/curated-ear-set/audio/08-critically-damped.wav)
- [06 — electric guitar fast bend, underdamped.](Projects/Portamento and Physical Pitch Modeling/curated-ear-set/audio/11-underdamped.wav)
<sub>`portamento-steward-014` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
