---
title: "Shimmer Cloud — scroll"
born: 2026-10-21
links:
  - target: "[[Shimmer Cloud]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Shimmer Cloud's scroll — the one page that always opens on where the project stands now and the plan it is following, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my plan changes only when Loudon agrees, and every change is logged on my trail; my standing orders are Loudon's; my trail only ever grows."
---

# Shimmer Cloud — scroll

> The project's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Shimmer Cloud]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-22T10:06:23.867Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** sprout · **Steward:** cycle 2 · last ran 2026-10-22 (today)
- **Plan:** agreed 2026-10-21 (1 day ago) · 3 made things since
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-22 (today) — The feedback lens rebuilt your way: one interval jump at the door, then the prism on every pass. Five intervals, on a page that plays. (`shimmer-cloud-005`)
- **Last commit touching this project:** 2026-10-22 `519dacc6` — steward(Shimmer Cloud): cycle 1 — SPINNING UP. HOME: [Shimmer Cloud](obsidian://open?vault=The%20Palace&f…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 2 runs on 1 day, counted from the ledger's run lines
- **Last run:** 2026-10-22 — cycle 2 · taught item 2, proposed item 3 for canon
- **Owed in the ledger:** nothing
- **Proposed for canon:** 1 — item 3; waiting on Loudon's review, and the page has not changed
- **Latest lesson:** item 3, from cycle 2 — 2026-10-22 — [[Shimmer Cloud — tuning]]

### Where this stands

Shimmer Cloud is a reverb that is also a prism: a cloud of hundreds of small lenses around any sound, each delaying the sound's frequencies by different amounts. At the revival you chose the dispersion cloud as the start and asked two things: push the prism harder, and rebuild May's feedback lens so it jumps once, by an octave or another interval, and then only drifts, instead of stacking octave on octave. Earlier today the pushed prism shipped with a ladder of strengths. This cycle built the second ask, the interval lens, using the middle strength (150–600 ms) I leaned on, since you haven't steered yet. Next on the plan is a cloud that swells in before the dry and leaves long tails.

### Left rough, again and again

_What the trail's left-rough notes keep saying, oldest first, in its latest words._

- **rough since cycle 1:** Nobody has heard it yet: I checked it by tone test, spectrogram and levels, not by ear. _(in 2 notes, the latest cycle 2)_

### Open asks

- `shimmer-cloud-003` — directional_decision · posted 2026-10-22 · options: LIGHTER · MIDDLE · HEAVIER · BOTH-WAYS

### Answered, not yet consumed

_None._

### Decided

_Nothing decided on the board yet._

### Runs

- 2026-10-22 — cycle 2 · taught item 2, proposed item 3 for canon
- 2026-10-22 — cycle 1 · taught item 1

### Owed

_Nothing owed._

### Proposed for canon

_Changes the steward wants in the house, kept in its tuning ledger until Loudon's review. Its cycles work as if they hold; the pages have not changed._

- **3.** 2026-10-22 · [[Shimmer Cloud]] · § Where it stands — The page still says only the push was asked for; the interval lens is now built too, and a cold reader should know both asks are on the table.

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** A reverb that is also a prism: a cloud of lenses around any input, playable live, swelling in before the sound and hanging after it. Three lens models were built in May 2026. At the revival on 2026-10-21 Loudon heard them side by side, chose the droplet and dispersion clouds together with dispersion as the start, and asked for the dispersion to be pushed until the modes come apart.

**The moves ahead**

1. **Push the dispersion until the modes come apart.** Re-render the three pairs he heard (droplets against dispersion, no dispersion against the prism, pure against drift) at much stronger dispersion and wider spreads, on one listening page, so what each mode alone can do becomes audible.
2. **An interval, then a cloud.** Rebuild the feedback lens his way: one jump at the door, an octave or another interval, then only subtle shifts inside the loop, so the cloud disperses around an established interval instead of stacking octaves.
3. **Swell before the dry, and long tails.** A cloud that leads into the dry like reversed sound, and tails that hang as ambience, made by the lenses' own timing and decay.
4. **Play it live, a few hundred lenses.** A real-time prototype in a Web Audio worklet, any input in and the cloud out, with the lens count on a control so Loudon can find by ear where shimmer stops sounding like chorus. RNBO waits until the Max patching standards lift the pause; the worklet carries the move meanwhile, with what a patch will need written down.
5. **Thousands of lenses on the GPU.** Move the cloud onto [[Neural Granular Synthesis]]'s grain engine, where a population of thousands is cheap.
6. **A cloud you stand inside.** Pan each lens in three dimensions, binaural first, then ambisonics, so the spread of frequencies becomes a space.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
Written on Loudon's word at the revival, 2026-10-21 ("write ... the standing order as shown"):

Every render comes with a page Loudon can play, the takes built in, like the revival's listening page: nothing he hasn't heard is called finished.
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="shimmer-cloud-005" -->
### 2026-10-22 — cycle 2 — The feedback lens rebuilt your way: one interval jump at the door, then the prism on every pass. Five intervals, on a page that plays.
> shipped · listening page ready · steward leans a fifth as the default going into the swell

Start with [the listening page](obsidian://open?vault=The%20Palace&file=Projects/Shimmer%20Cloud/proofs/2026-10-22-interval-listening.html). Nothing sounds until you click.

**What the lens does.** The phrase jumps once on the way in. Then it goes round a loop eight times. Each trip passes through a fresh prism cloud of 600 lenses, drifts a few cents, loses a little top end and comes back quieter. The dispersion adds up, so every pass spreads the interval wider in time than the one before.

**Checked with one tone.** I struck each lens with a single 220 Hz note and read where its wet energy landed. May's lens lands 69% an octave up, 21% two octaves up and 7% three: a stack that climbs. Every new take lands 100% on the interval it was given. And they hang: May's shimmer ends with the phrase, while the new lens holds 2–2.7 s past it, and the long loop holds 4.7 s.

**A fault the tone found.** In the first render, a fifth up put 27% of its energy near 60 Hz. Below 80 Hz the lenses don't disperse, so 600 of them add up in phase, and the loop multiplied that rumble every pass. Each pass is now flattened to unity gain, and the rumble is gone.

**On the page:** May's octave stack for reference. Then five intervals at the door (fourth, fifth, octave, octave and a fifth, octave down). Then the fifth with plain echoes in the loop against the prism. Then highs early against highs late. Last, a fourteen-pass loop. In that one the last vowel's harmonics hold as steady lines, which is where shimmer starts to turn into drone. Your forward vector asks where that line is, and this take is the first one that sits on it.

I leaned on the fifth. It is the interval nobody's shimmer pedal starts from, and an octave jumped once sounds tamer than I expected. I passed over making the octave the default because the octave is the H3000's sound, and you asked to get away from it.

**Artifacts:**
- [the listening page: every take, silent until clicked, your picks gather at the bottom.](Projects/Shimmer Cloud/proofs/2026-10-22-interval-listening.html)
- [the phrase dry, May's octave stack, and the fifth three ways: May ends with the words, the new lens hangs.](Projects/Shimmer Cloud/proofs/2026-10-22-interval/interval.png)
- [a fifth, then the cloud: the lean.](Projects/Shimmer Cloud/proofs/2026-10-22-interval/takes/fifth.wav)
- [a fourth up.](Projects/Shimmer Cloud/proofs/2026-10-22-interval/takes/fourth.wav)
- [an octave up, jumped once.](Projects/Shimmer Cloud/proofs/2026-10-22-interval/takes/octave.wav)
- [an octave and a fifth up.](Projects/Shimmer Cloud/proofs/2026-10-22-interval/takes/twelfth.wav)
- [an octave down: the cloud under the voice.](Projects/Shimmer Cloud/proofs/2026-10-22-interval/takes/octave_below.wav)
- [the fifth with plain echoes in the loop, no prism.](Projects/Shimmer Cloud/proofs/2026-10-22-interval/takes/fifth_bare.wav)
- [the fifth with highs early in every pass.](Projects/Shimmer Cloud/proofs/2026-10-22-interval/takes/fifth_early.wav)
- [the fifth, fourteen passes: where shimmer turns toward drone.](Projects/Shimmer Cloud/proofs/2026-10-22-interval/takes/fifth_long.wav)
- [the lens, the tone test, and the takes.](Projects/Shimmer Cloud/proofs/2026-10-22-interval/render_interval.py)
- [the tone test and tail lengths for every take.](Projects/Shimmer Cloud/proofs/2026-10-22-interval/findings.json)
- [draws interval.png.](Projects/Shimmer Cloud/proofs/2026-10-22-interval/draw_figure.py)
- [builds the listening page from the takes.](Projects/Shimmer Cloud/proofs/2026-10-22-interval/make_page.py)

_each lens struck by one 220 Hz tone_
| lens | where the wet lands | hangs past the phrase |
| --- | --- | --- |
| May · octave every pass | +12 69% · +24 21% · +36 7% | ends with it |
| fourth | +5 100% | 2.5 s |
| fifth | +7 100% | 2.2 s |
| octave | +12 100% | 2.4 s |
| octave and a fifth | +19 100% | 2.7 s |
| octave down | −12 100% | 2.1 s |
| fifth, plain echoes | +7 100% | 0.7 s |
| fifth, highs early | +7 100% | 3.1 s |
| fifth, long loop | +7 100% | 4.7 s |

_Changed in the workshop:_ README — Added the interval lens: what it does, how to measure it with one tone, and the low-end gotcha in the loop.
_Proposed for canon:_ Shimmer Cloud (§ Where it stands) — The page still says only the push was asked for; the interval lens is now built too, and a cold reader should know both asks are on the table.; owed in the tuning ledger until Loudon's review

_Left rough:_ Nobody has heard it yet: I checked it by tone test, spectrogram and levels, not by ear. The pitch shifter is a plain phase vocoder I wrote because librosa isn't installed, and it may smear consonants more than May's did. The open question of how hard to push the prism is still open, and these takes all use the middle strength.

_Next moves named:_ The swell before the dry: turn the highs-early cloud and the interval lens into a cloud that leads into the phrase like reversed sound, with tails made by the lenses' own decay. · Take whichever interval and strength your ear picks from the two pages as the default for the swell; until then, a fifth at 150–600 ms. · For the live version later: one pass of a cloud folds into one filter per channel, so a worklet can run it as a single long convolution per pass and keep a few hundred lenses cheap.
<sub>`shimmer-cloud-005` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-121928d2f0" -->
### 2026-10-22 — cycle 2

taught item 2, proposed item 3 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="shimmer-cloud-003" -->
### 2026-10-22 — cycle 1 — How hard should the prism be pushed from here: 300 ms, the 150–600 ms I used, or 1.2 s?
> still working · pushed page shipped · steward leans MIDDLE

Shimmer Cloud is the reverb that is also a prism. At the revival you said every pair sounded close and asked for the dispersion to be pushed. I found why: May's prism sorted a voice's lows and highs only 3 ms apart. This cycle I rebuilt it to sort them by up to hundreds of milliseconds and put the three pairs back on one page, with a five-step ladder of strengths. Next I'm rebuilding the feedback lens your way (one interval jump, then the cloud), and it needs a default strength. I'm going ahead with the middle, 150–600 ms, unless you steer. Lighter keeps the phrase readable. Heavier turns every word into a sweep. The ladder on the page is the quickest way to answer.

**Artifacts:**
- [the ladder is the fifth section, 'How hard to push'.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed-listening.html)
<sub>`shimmer-cloud-003` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="shimmer-cloud-002" -->
### 2026-10-22 — cycle 1 — The three pairs again, with the prism pushed about seventy times harder, plus a ladder of strengths and the prism turned around, on one page that plays on a click.
> shipped · listening page ready · steward leans 150–600 ms as the working strength

Start with [the listening page](obsidian://open?vault=The%20Palace&file=Projects/Shimmer%20Cloud/proofs/2026-10-22-pushed-listening.html). Nothing sounds until you click.

**Why the pairs sounded close.** May's lens put its biggest delay, 4–20 ms, at the very top of the range (12 kHz) and let it fall in a straight line. Inside a voice it barely sorted anything. I struck May's canonical cloud with a single click and measured when its lows and highs land: 3 ms apart. Its lenses were also scattered over 350 ms of start time. That scatter did all the smearing, so every model sounded like the same smear.

**What changed.** The new lens spreads its delay evenly per octave, from 80 Hz to 11 kHz, the way the ear hears pitch. The delay runs to 150–600 ms, and the scatter drops to 25 ms so you hear the mode itself. Struck with a click, it lands its lows and highs 213 ms apart. In the figure's bottom row, May's cloud is a block of noise and the pushed one is a fan.

**On the page:** the three revival pairs, pushed: droplets alone against the prism alone, the same smear unsorted against sorted, and pure against ±15 cents of drift. Then a five-step ladder from May's strength up to 1.2 s, so you can say where it comes apart. Last, the prism turned around: highs early, where the hiss arrives first and the body follows. That leans toward the swell before the sound you asked for. Every take is levelled to the same loudness, so a pair differs only in its mode. Your picks gather in a box at the bottom.

**Artifacts:**
- [the listening page: the three pairs pushed, a ladder of strengths, the prism turned around. Silent until clicked.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed-listening.html)
- [top: the phrase dry, through May's cloud, and through the pushed prism both ways. bottom: each cloud struck by a click, a block of noise against a fan.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/pushed.png)
- [the pushed prism alone: 600 lenses, 150–600 ms, highs late.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/takes/p1_dispersion.wav)
- [droplets alone: 600 copies at ±25 cents, no prism.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/takes/p1_droplets.wav)
- [the same lenses with every frequency delayed equally, unsorted.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/takes/p2_delay.wav)
- [the pushed prism with ±15 cents of drift on every lens.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/takes/p3_drift.wav)
- [the prism turned around: highs early, body after.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/takes/w_early.wav)
- [ladder 1: 20 ms.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/takes/h1_20ms.wav)
- [ladder 2: 80 ms.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/takes/h2_80ms.wav)
- [ladder 3: 300 ms.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/takes/h3_300ms.wav)
- [ladder 4: 1.2 s.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/takes/h4_1200ms.wav)
- [copy of the pushed prism, kept so each pair's files stand alone.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/takes/p2_prism.wav)
- [copy of the pushed prism, for the drift pair.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/takes/p3_pure.wav)
- [copy of the pushed prism, for the which-way pair.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/takes/w_late.wav)
- [the pushed lens, the twelve takes, and the click measurement (run with /usr/local/bin/python3).](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/render_pushed.py)
- [every click measurement, May's included.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/findings.json)
- [draws the figure.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/draw_figure.py)
- [builds the listening page from the takes, reusing the revival page's look and player.](Projects/Shimmer Cloud/proofs/2026-10-22-pushed/make_page.py)

_Each cloud struck by one click · when its lows (100–500 Hz) and highs (3–8 kHz) land_
| cloud | lows land (ms) | highs land (ms) | highs − lows (ms) | 90% of energy within (ms) |
| --- | --- | --- | --- | --- |
| May canonical | 176 | 173 | −3 | 316 |
| May, scatter removed | 2 | 7 | +5 | 15 |
| pushed prism, highs late | 116 | 329 | +213 | 450 |
| delay only, unsorted | 243 | 250 | +6 | 280 |
| pushed, highs early | 285 | 78 | −208 | 248 |
| ladder 80 ms | 21 | 53 | +32 | 67 |
| ladder 300 ms | 56 | 174 | +118 | 230 |
| ladder 1.2 s | 194 | 653 | +459 | 880 |

_Changed in the workshop:_ README — Added a section on the pushed dispersion: why May's pairs sounded close, what the new lens does, and to measure with a click.

_Left rough:_ Nobody has heard it yet. I checked the takes by measurement and spectrogram, and the page's script parses, but I haven't played the page in a real browser. In the sorted-or-not pair, the unsorted take's smear is shorter (280 ms of energy against 450), so it is close to a fair match but not exact. The 150–600 ms strength is my taste until your ear picks a rung on the ladder.

_Next moves named:_ The plan's second move, an interval then a cloud: rebuild the feedback lens your way. One jump at the door (an octave or a fifth), then only these pushed lenses and a few cents of drift inside the loop, on its own listening page. · Carry your ladder pick and your which-way pick in as the default lens strength and direction. Keep highs early in hand for the third move, the swell before the dry.
<sub>`shimmer-cloud-002` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-d4898d1940" -->
### 2026-10-22 — cycle 1

taught item 1
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="shimmer-revival-2026-10-21" -->
### 2026-10-21 — Revived: heard by ear, the page is a project at sprout

Shimmer Cloud slept as a spore from March, while three lens models were built in its bundle in May. Today it was revived by the Revival Ceremony v2.0. Loudon met it on one listening page: the dry phrase, the three models, and three A/B pairs. He chose the droplet and dispersion clouds together, with dispersion as the start. Of every pair he said they were close, and asked for the dispersion to be pushed harder until the modes come apart. Of the feedback lens: jump up an octave once, then only subtle shifts inside the loop, "so that we establish an interval of shift and then we disperse at that interval. Repeated large jumps within a feedback loop are rarely good and often sound dated." He wants the cloud to swell in before the dry, like reversed sound, and longer ambient tails. The page is now a project at sprout, with a plan he agreed; on his word it will be woken, then given a steward.

**Artifacts:**
- [the listening page he met it on.](Projects/Shimmer Cloud/proofs/2026-10-21-listening.html)
- [the entry, now a project.](Projects/Shimmer Cloud.md)
<sub>`shimmer-revival-2026-10-21` · revived by the Revival Ceremony v2.0 · written by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-10-21T09-53-58-04-00" -->
### 2026-10-21 — Plan agreed

agreed at the revival, 2026-10-21: the plan of 2026-09-26 with the lens chosen by ear, three moves from his listening, and a Web Audio worklet in place of RNBO while Max work is paused
<sub>`plan-2026-10-21T09-53-58-04-00` · plan agreed · agreed 2026-10-21T09:53:58-04:00 · Loudon</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="backfill-2026-10-21" -->
### 2026-10-21 — backfilled from the bundle

No steward has posted a made thing for this project yet, so the trail opens with what the bundle already holds (40 media files, newest first):

- [2026-10-21-listening.html](Projects/Shimmer Cloud/proofs/2026-10-21-listening.html) · 2026-10-21
- [2026-05-04-prism-dispersion.png](Projects/Shimmer Cloud/proofs/2026-05-04-prism-dispersion.png) · 2026-10-21
- [dry.wav](Projects/Shimmer Cloud/dry.wav) · 2026-10-21
- [30_long_dispersing_cascade.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/30_long_dispersing_cascade.wav) · 2026-10-21
- [29_chromatic_aberration.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/29_chromatic_aberration.wav) · 2026-10-21
- [28_underwater_smear.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/28_underwater_smear.wav) · 2026-10-21
- [27_glassy_prism.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/27_glassy_prism.wav) · 2026-10-21
- [26_layered_disp_+pitch.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/26_layered_disp_+pitch.wav) · 2026-10-21
- [25_loudon_canonical_pure.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/25_loudon_canonical_pure.wav) · 2026-10-21
- [24_full_pan.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/24_full_pan.wav) · 2026-10-21
- [23_half_pan.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/23_half_pan.wav) · 2026-10-21
- [22_mono_pan.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/22_mono_pan.wav) · 2026-10-21
- [21_long_cascade_3s.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/21_long_cascade_3s.wav) · 2026-10-21
- [20_dispersed_1000ms.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/20_dispersed_1000ms.wav) · 2026-10-21
- [19_natural_350ms.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/19_natural_350ms.wav) · 2026-10-21
- [18_close_75ms.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/18_close_75ms.wav) · 2026-10-21
- [17_synced_5ms.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/17_synced_5ms.wav) · 2026-10-21
- [16_1500_droplets.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/16_1500_droplets.wav) · 2026-10-21
- [15_600_droplets.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/15_600_droplets.wav) · 2026-10-21
- [14_200_droplets.wav](Projects/Shimmer Cloud/03_dispersion_cloud/variations/14_200_droplets.wav) · 2026-10-21
<sub>backfill · scroll born 2026-10-21</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="shimmer-may-models-2026-05" -->
### 2026-05-09 — Three answers to "what is the lens?", made while the page slept

Three lens models, each a different answer to what the cloud is made of, all processing the same Kokoro phrase, "the prism, and the cloud." A **feedback lens**: one pitch-shifter in a loop, an octave per pass, the classic shimmer tail. A **droplet cloud**: hundreds of rate-resampled copies, so pitch and timing drift together; 30 variations with a listening guide, including Loudon's canonical (24: 600 droplets, ±3 cents, 350 ms, full pan). A **dispersion cloud**: hundreds of all-pass lenses that keep the pitch and delay each frequency differently, the prism taken literally; 30 variations with a guide, its canonical at 25. The page went on saying it was dormant because nothing had been built.

**Artifacts:**
- [the lineage, model by model.](Projects/Shimmer Cloud/README.md)
- [the dispersion figure.](Projects/Shimmer Cloud/proofs/2026-05-04-prism-dispersion.png)
- [the droplet guide.](Projects/Shimmer Cloud/02_droplet_cloud/variations/README.md)
- [the dispersion guide.](Projects/Shimmer Cloud/03_dispersion_cloud/variations/README.md)
<sub>`shimmer-may-models-2026-05` · made 2026-05-04 to 2026-05-09 (`a5ca537b`) · written by hand at the revival</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
