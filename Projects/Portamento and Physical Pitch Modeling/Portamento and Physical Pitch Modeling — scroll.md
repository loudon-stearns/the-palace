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

> _Regenerated 2026-10-14T13:58:13.854Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** mature · **Steward:** cycle 11 · last ran 2026-10-14 (today)
- **Plan:** none agreed yet — the work leans on the forward vector
- **Waiting on you:** nothing
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-14 (today) — Correction to my own last cycle: a soft bow's overshoot slip is about one slow beat, likely inaudible. Whether a partial counts as locked isn't enough to say whether you can hear the slip. (`portamento-steward-024`)
- **Last commit touching this project:** 2026-10-14 `b1079ec3` — steward(Portamento and Physical Pitch Modeling): cycle 10 — SPINNING UP. HOME: [Portamento and Physical Pitch Modeling](obsidian://…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Portamento and Physical Pitch Modeling treats pitch as a damped spring settling on a note. It can settle in three ways: overdamped (eases in), critically damped (arrives clean) or underdamped (overshoots and rings back). In June the project shipped an ear-training set and a 15-minute single-session reel that teaches the three by pitch. In August you picked MULTI-MODE, which takes the model from one gliding pitch to a whole family of partials. Earlier today I showed that on a bowed string an overshoot makes one overtone slip out of tune and catch again, and that the bow's strength decides which one. This cycle turns that into teaching. The reel now has a third round of three listening pairs,…

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
<!-- scroll:entry id="portamento-steward-024" -->
### 2026-10-14 — cycle 11 — Correction to my own last cycle: a soft bow's overshoot slip is about one slow beat, likely inaudible. Whether a partial counts as locked isn't enough to say whether you can hear the slip.
> proof · corrects pass 3's lean · steward leans keep the firm bow

Last cycle I said the soft bow shows the slip best, because it puts the slipping partial low and loud (partial 2, −6 dB). I based that on whether the partial was in or out of lock, which is a yes/no test. It doesn't tell you how far the partial actually drifts. Just past the threshold the Adler equation slips in slow single pulses, so the soft-bow partial drifts at most 1.9 Hz off its octave (0.3%) and makes 1.2 beats in total. The medium bow from earlier today (partial 3) reaches 0.75% and makes 2.2 beats. So the 'slips and catches' heard in both earlier listening pages is real in the model but probably below hearing. The firm bow is where it gets large: 2% and about 12 beats. My earlier entry proposal ([steward-018](obsidian://open?vault=The%20Palace&file=Portamento%20and%20Physical%20Pitch%20Modeling)) still holds, with one qualifier an elder should carry if it lands: the slip is audible only when the bow is strong enough to push the slip high and fast. The sweep is in [timbre-manifest.json](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/timbre-manifest.json) under bow_sweep.

**Artifacts:**
- [The bow sweep and the audio-domain drift check.](Projects/Portamento and Physical Pitch Modeling/multi-mode/timbre-manifest.json)
<sub>`portamento-steward-024` · PROOF on WEAVE</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="portamento-steward-023" -->
### 2026-10-14 — cycle 11 — The ear-training reel has a third round: three pairs that teach you to hear an overshoot in a bowed string's tone colour, including one where the pitch gives you nothing.
> shipped · reel round three + 4 clips + figure · steward leans voice glide next

**What changed in the reel.** [The single-session reel](open:Projects/Portamento and Physical Pitch Modeling/curated-ear-set/single-session-reel.html) keeps its six clips and gains *Round three — hear the arrival in the tone colour*. All three pairs use the same bowed string and the same bow, G3 up to E4.

- **Pair 07:** critically damped against underdamped. You can answer this by pitch, and then the reveal sends you back for the second cue: as the underdamped pitch crests, the top of the tone flutters.
- **Pair 08:** this is the one that matters. Both clips follow the [identical underdamped pitch path](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/timbre-01-firm-underdamped.wav), sample for sample. In the [control](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/timbre-04-underdamped-held.wav) the slipping overtone is held in tune by force. The slip is the only difference, so a student who hears the fray is hearing the overshoot in the timbre alone.
- **Pair 09:** [overdamped](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/timbre-03-firm-overdamped.wav) against [critically damped](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/timbre-02-firm-critical.wav). Neither one slips, and the reveal says so. The tone colour picks out the underdamped arrival and can't help beyond that, so this pair teaches where the cue stops working. To tell these two apart you go back to the approach: critical gets within a semitone 0.6 s after it starts moving, overdamped takes 1.3 s.

**Why a firm bow, not the soft one I leaned toward last cycle.** I measured what the ear would actually hear, which is the slipping overtone going out of tune and beating, and swept bow strength (table). With a soft bow, partial 2 drifts 0.3% at most and makes about one beat in total. That is very likely too small to hear, so last cycle's lean was wrong. With a firm bow (15 Hz locking range), partial 5 goes 2% out of tune and beats about 12 times across three crests: eight on the first, three on the second, one on the third. The [figure](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/figures/timbre-round.png) shows the beats as spikes. I read them straight from the rendered audio with a heterodyne, so the measurement is of the files, not the model. The control's overtone drifts 0.01 Hz, and the critically damped and overdamped clips stay under 0.3 Hz.

The renderer is [timbre_round.py](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/timbre_round.py), with every number in [timbre-manifest.json](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/timbre-manifest.json).

**Artifacts:**
- [The reel, now with round three: three listening pairs with reveals.](Projects/Portamento and Physical Pitch Modeling/curated-ear-set/single-session-reel.html)
- [Underdamped, firm bow: partial 5 beats as the pitch crests.](Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/timbre-01-firm-underdamped.wav)
- [Critically damped, firm bow: nothing slips.](Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/timbre-02-firm-critical.wav)
- [Overdamped, firm bow: nothing slips, slower approach.](Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/timbre-03-firm-overdamped.wav)
- [Control: the same pitch path as the underdamped clip, with partial 5 held in tune.](Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/timbre-04-underdamped-held.wav)
- [The three arrivals, when partial 5 is out of lock, and its beats measured from the audio.](Projects/Portamento and Physical Pitch Modeling/multi-mode/figures/timbre-round.png)
- [Renderer: bow sweep, four clips, audio-domain check.](Projects/Portamento and Physical Pitch Modeling/multi-mode/timbre_round.py)
- [Every parameter, the sweep and the measured drift.](Projects/Portamento and Physical Pitch Modeling/multi-mode/timbre-manifest.json)

_Which overtone slips on the overshoot (G3→E4, ζ 0.2), by bow strength. Measured from the model._
| bow (locking range) | slipping partial | its level | worst out-of-tune | beats in total |
| --- | --- | --- | --- | --- |
| 1 Hz (soft) | 2 | −6 dB | 0.29% | 1.2 |
| 3.4 Hz (medium) | 3 | −9.5 dB | 0.75% | 2.2 |
| 10 Hz | 4 | −12 dB | 1.45% | 2.1 |
| 15 Hz (firm, chosen) | 5 | −14 dB | 2.04% | 12.2 |
| 20 Hz | 5 | −14 dB | 2.29% | 4.1 |
| 30 Hz (loud) | 6 | −15.6 dB | 3.11% | 10.1 |

_Left rough:_ Nobody has listened yet, so whether pair 08's flutter is audible is untested. The slipping overtone sits 14 dB down, and 2% is near the published thresholds for hearing a single mistuned harmonic; I'm recalling those (Moore and colleagues, 1980s) from memory and haven't checked them. The round only covers the firm bow.

_Next moves named:_ Put the model on a sung glide: fixed formants with the partials locked to the voice. This is the entry's open question about the vocal tract, and a voice's overshoot is the one students already know by ear. · If pair 08 turns out inaudible, raise the slipping overtone's level or use the loud bow (3% out of tune, 10 beats) and re-render the round. That's one script constant.
<sub>`portamento-steward-023` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="portamento-steward-021" -->
### 2026-10-14 — cycle 10 — Cross-check: the new script rebuilds last cycle's medium-bow overshoot to within a hundredth of a second.
> proof · pass 3 agrees with pass 2 · steward leans keep building on it

I rebuilt the medium-bow overshoot (locking range 3.4 Hz, G3 to E4, ζ 0.2) inside loudness_locking.py. Partial 3 lets go and catches at 0.82, 1.31, 1.93 and 2.30 s. Pass 2 had 0.82, 1.31, 1.93 and 2.31 s. The bow-force study therefore extends the earlier model without changing anything underneath it. The numbers are in [loudness-manifest.json](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/loudness-manifest.json) and [locking-manifest.json](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/locking-manifest.json).

**Artifacts:**
- [Pass 3 numbers, including the medium-bow check.](Projects/Portamento and Physical Pitch Modeling/multi-mode/loudness-manifest.json)
<sub>`portamento-steward-021` · PROOF on WEAVE</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="portamento-steward-020" -->
### 2026-10-14 — cycle 10 — A harder bow holds more partials in tune, so a crescendo fuses the tone. A louder overshoot still slips, just higher in the tone and more briefly.
> shipped · multi-mode pass 3, five clips + listening page · steward leans fold the soft-bow pair into the ear-training reel next

**The change.** Last pass, every bowed clip had one fixed pull holding its partials in line. That pull comes from the bow, and a harder bow pulls harder, so now it follows bow force. It rises from 0.5 Hz at pianissimo to 30 Hz at fortissimo, along a curve I chose myself (Fletcher 1978 doesn't give one). The string and pitch model are the same as last time.

**The crescendo pair.** Both clips are a held E4 with the identical crescendo, −24 dB up to full, matched level for level. In [B](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/loudness-01-crescendo-bow.wav) the hold follows the bow. Partials 2 through 6 lock one at a time from the bottom up (1.36, 2.13, 2.63, 3.06, 3.56 s), and by the top the waveform almost repeats itself: 0.96 match a hundred cycles later. In [A, the control](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/loudness-02-crescendo-control.wav) the hold stays frozen at its pianissimo value. Nothing new locks, and the match at full volume is only 0.79. Loudness is the same in both, so the difference you hear is the tone fusing.

**The overshoot at three bow strengths** (G3 to E4, ζ 0.2, level-matched). Soft bow: [partial 2 slips](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/loudness-03-overshoot-soft.wav) on both rings, at −6 dB. Medium: [partial 3 slips](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/loudness-04-overshoot-medium.wav). It matches last cycle's clip to within a hundredth of a second, which checks the new script. Loud: [only partial 6 slips](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/loudness-05-overshoot-loud.wav), at −15.6 dB, once, from 0.84 to 1.27 s. A louder bow doesn't erase the overshoot's texture cue. It pushes it up the tone onto a weaker partial and makes it shorter. For teaching, that means the cue should be taught with a soft bow. Everything is on [the listening page](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/loudness-listening.html), with the figure [loudness-locking.png](open:Projects/Portamento and Physical Pitch Modeling/multi-mode/figures/loudness-locking.png).

**Artifacts:**
- [Listening page: the crescendo pair with a reveal, the three overshoots, and the figure.](Projects/Portamento and Physical Pitch Modeling/multi-mode/loudness-listening.html)
- [Crescendo where the hold follows the bow: the tone fuses as it swells.](Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/loudness-01-crescendo-bow.wav)
- [Control: same loudness curve, hold frozen at pianissimo, still shimmering at the top.](Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/loudness-02-crescendo-control.wav)
- [Soft-bow overshoot: partial 2 slips on both rings.](Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/loudness-03-overshoot-soft.wav)
- [Medium-bow overshoot: partial 3 slips, matching last cycle's clip.](Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/loudness-04-overshoot-medium.wav)
- [Loud-bow overshoot: only partial 6 slips, once.](Projects/Portamento and Physical Pitch Modeling/multi-mode/audio/loudness-05-overshoot-loud.wav)
- [The rising hold crossing each partial's detuning, the crescendo against its control, and the overshoot at three bow strengths.](Projects/Portamento and Physical Pitch Modeling/multi-mode/figures/loudness-locking.png)
- [The renderer; it reuses mode_locking.py's pitch model and string.](Projects/Portamento and Physical Pitch Modeling/multi-mode/loudness_locking.py)
- [Every parameter and every number quoted here.](Projects/Portamento and Physical Pitch Modeling/multi-mode/loudness-manifest.json)

_Five clips · 10 partials · same string as pass 2_
| clip | bow | what locks or slips | slipping partial's level |
| --- | --- | --- | --- |
| 1 held E4, crescendo | follows the bow, 0.5 → 30 Hz | partials 2–6 lock in turn, 1.36–3.56 s | — |
| 2 held E4, crescendo (control) | frozen at 0.5 Hz | nothing new locks | — |
| 3 overshoot | soft, 1 Hz | partial 2 slips 0.82–1.31 and 1.93–2.31 s | −6 dB |
| 4 overshoot | medium, 3.4 Hz | partial 3 slips 0.82–1.31 and 1.93–2.30 s | −9.5 dB |
| 5 overshoot | loud, 30 Hz | partial 6 slips once, 0.84–1.27 s | −15.6 dB |

_Left rough:_ Nobody has listened yet, and the 0.96 vs 0.79 waveform match is a stand-in for what the ear hears. The curve from bow force to locking range is my choice, and the stiffness is still exaggerated, so partials 7–10 stay free even at fortissimo. Spectrum brightness doesn't change with bow force, by design, so fusion is the only thing that changes.

_Next moves named:_ Fold the soft-bow overshoot pair (soft underdamped against a soft critically damped arrival) into the single-session ear-training reel as a third round, 'listen to the tone colour after the arrival', since the soft bow exposes the cue best. · Put the model on a sung glide: fixed formants with partials locked to the voice. That is the entry's question about the vocal tract.
<sub>`portamento-steward-020` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

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
