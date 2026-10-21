---
title: "Neural Granular Synthesis — scroll"
born: 2026-09-23
links:
  - target: "[[Neural Granular Synthesis]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Neural Granular Synthesis's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Neural Granular Synthesis — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Neural Granular Synthesis]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-18T10:27:44.995Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 16 · last ran 2026-10-18 (today)
- **Plan:** none agreed yet — the next run works from what the ledger owes and the forward vector
- **Waiting on you:** nothing
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-18 (today) — The jitter below the lock was never the meter. Just short of locking, the crowd surges toward agreement, and the pacemakers cause it. (`ngs-steward-027`)
- **Last commit touching this project:** 2026-10-18 `91addc1c` — steward(Neural Granular Synthesis): cycle 15 — SPINNING UP. HOME: [Neural Granular Synthesis](obsidian://open?vault=Th…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 2 runs on 1 day, counted from the ledger's run lines
- **Last run:** 2026-10-18 — cycle 16 · taught item 2
- **Owed in the ledger:** nothing
- **Latest lesson:** item 2, from cycle 16 — 2026-10-18 — [[Neural Granular Synthesis — tuning]]

### Where this stands

Neural Granular Synthesis plays a crowd of neurons, and how much they agree is the timbre. Tightness is how hard they pull on each other, life is the share of pacemakers that ignore the pull, and lumpiness (added last cycle) is how unevenly the crowd is spread. Past the lock point, hiss snaps into a tone. Since cycle 13 I'd left one question open: the evenly spread crowd's synchrony jumps around below the lock, and I didn't know if the 10 ms meter was causing that or the neurons were. This cycle settled it. The meter is honest. The crowd really does surge, and the pacemakers drive it.

### Left rough, again and again

_What the trail's left-rough notes keep saying, oldest first, in its latest words._

- **rough since cycle 6:** Nobody has listened yet, so whether the surge reads as 'alive' or as an unsteady level is still an open ear question. _(in 7 notes, the latest cycle 16)_
- **rough since cycle 7:** I also haven't tested the lumpiness knob; _(in 4 notes, the latest cycle 14)_
- **rough since cycle 12:** FixedFloat64Array state, floating-point array indexes and a 512-step loop inside the per-sample tick all match the RNBO docs as I read them, but they are unverified until Max accepts the file. _(in 2 notes, the latest cycle 13)_
- **rough since cycle 12:** The evenly spread crowd at 50% pacemakers locks early, at 0.95×. _(in 2 notes, the latest cycle 13)_
- **rough since cycle 13:** The audition's even pass looks noisy below the lock point in the trace, and I haven't checked whether that's the 10 ms meter or the crowd itself. _(in 2 notes, the latest cycle 15)_
- **rough since cycle 14:** The fixed codebox is still uncompiled, and recounting the pacemakers at 512 neurons could still click when you turn the crowd knob. _(in 2 notes, the latest cycle 15)_
- **rough since cycle 14:** The codebox has no lumpiness, and its audition steps still say life sets the attack: Max work is paused, so I left it alone. _(in 3 notes, the latest cycle 16)_

### Open asks

_None — nothing is waiting on you._

### Answered, not yet consumed

_None._

### Decided

- `ngs-steward-009` — directional_decision → GRANTED — option_id=DEEPEN-RASTER (2026-06-25)

### Runs

- 2026-10-18 — cycle 16 · taught item 2
- 2026-10-18 — cycle 15 · taught item 1

### Owed

_Nothing owed._

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._

**2026-10-21 — make it a product: a VST to play in Ableton.** Your next work is a usable VST prototype built with the [[VST Template]] system, something Loudon can play in Live. Keep the controls in the template's interface. The centre of the face is a "CRT" holding a visualizer of your own: beautiful, 3D welcome, drawn deeply from this instrument's metaphor or what is unique about it, never a generic scope. Get playful; make it uniquely weird and stunning. Max work stays set aside: your Max, RNBO and Max for Live files wait, and may come back later as teaching tools; the product comes first. Until the template has its CRT and can build a plugin inside your bundle, port the sound to the template's sketch-and-Algorithm shape in your workshop and sketch the visualizer as a web page there, fed by the values the plugin will stream. Propose the change to your Plan as a plan_revision with what you made. — Loudon: "lets make them products now."
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="ngs-steward-027" -->
### 2026-10-18 — cycle 16 — The jitter below the lock was never the meter. Just short of locking, the crowd surges toward agreement, and the pacemakers cause it.
> shipped · meter cleared, surge measured and rendered · steward leans: listen to the surge next

I read the crowd's synchrony at every sample (24,000 a second) on 512 neurons, at fixed tightness just under the lock, and compared three readings of the same run: the raw per-sample value, the 10 ms snapshot the meter shows, and a 10 ms average. All three swing by the same amount, and none of the wobble is faster than 50 Hz, so the meter isn't folding fast motion into noise. The swings are slow, one to six surges a second, and they come from the pacemakers. In an even crowd with no pacemakers, synchrony sits near chance with a swing of 0.05. At 20% pacemakers the swing is 0.08, and at half it's 0.16, with spikes up to 0.65–0.8, nearly locked, before it falls back. The free-running pacemakers keep sweeping past the core and briefly drag it into agreement. You can hear it: in the audition, with the level-rider on, the loudness swings more than twice as much with half pacemakers (0.26 against 0.11). This also explains a note I'd carried since cycle 12, that the even crowd at 50% pacemakers locks early at 0.95×: the surges reach the lock before the steady state would. I wrote the first part of an answer into the open question on my page about pacemakers and liveliness.

**Artifacts:**
- [Left: the even crowd held at 0.9× of its lock point at three pacemaker shares; half pacemakers lunge toward a lock and fall back. Right: the swing grows with pacemaker share.](Projects/Neural Granular Synthesis/surge-before-lock.png)
- [13 s audition: the even crowd held just under the lock, 6 s with no pacemakers, then 6 s with half. Listen for the surges in the second half.](Projects/Neural Granular Synthesis/surge-before-lock.wav)
- [Every row and the 1 kHz synchrony traces with their spectra, for 0/20/50% pacemakers, even and lumpy, at 0.85×, 0.9× and 0.95×.](Projects/Neural Granular Synthesis/meter-noise.json)
- [The probe: per-sample synchrony versus the meter's snapshot, plus the audition render.](Projects/Neural Granular Synthesis/probe_meter_noise.js)
- [Draws the plate from meter-noise.json.](Projects/Neural Granular Synthesis/plot_surge.py)

_Swing of core synchrony (std. dev.) at 0.9× of the lock point · 512 neurons · per-sample = 10 ms snapshot = 10 ms average in every row_
| pacemakers | even crowd: mean r | even crowd: swing | lumpy crowd: swing | chance level |
| --- | --- | --- | --- | --- |
| 0% | 0.067 | 0.051 | 0.076 | 0.039 |
| 20% | 0.123 | 0.084 | 0.099 | 0.044 |
| 50% | 0.192 | 0.159 | 0.161 | 0.055 |

_Changed the page:_ Neural Granular Synthesis — Added the first measured answer to the open question on pacemakers and liveliness: just under the lock, pacemakers make the crowd surge.

_Left rough:_ Nobody has listened yet, so whether the surge reads as 'alive' or as an unsteady level is still an open ear question. The codebox has no lumpiness, and its audition steps still say life sets the attack: Max work is paused, so I left it alone.

_Next moves named:_ Put a 'surge' readout in the crowd instrument (how much synchrony swings over the last second), so the pre-lock liveliness can be seen and played, not only measured offline. · Test whether the surge rate follows the pacemakers' spread of rates. If it does, pacemaker spread becomes a tempo knob for the breathing. · For the RNBO build once Max standards exist: the meter needs no change, since a 10 ms snapshot is honest for this crowd; lumpiness and the pacemaker headcount are the two things the codebox still lacks.
<sub>`ngs-steward-027` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-fd7f9aaebf" -->
### 2026-10-18 — cycle 16

taught item 2
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="ngs-steward-025" -->
### 2026-10-18 — cycle 15 — Lumpiness is now a knob. It sets how hard the lock hits, from a switch to a slow arrival, and moves the lock point only about 3%.
> shipped · third knob measured, spec updated · steward leans give it a gentler curve next

**WHAT THE KNOB IS.** Each neuron has a place in the crowd's spread of natural rates, and a starting phase. At lumpiness 0 those places are evenly spaced, the way the codebox does it. Lumpiness adds a random nudge to each place, scaled by the knob, and wraps the result back into range. The wrap matters. The crowd's overall spread stays uniform at every setting, so theory's lock point shouldn't move. Only how evenly the crowd covers that spread changes. At lumpiness 1 the crowd is as random as the one on the board.

**WHAT IT DOES.** I swept tightness from 0.8× to 1.2× the lock point. That's 4 lumpiness settings × 2 lives × 3 random crowds, each settled for 4 seconds. In the table, 'width' is how far you have to turn tightness, as a share of the lock point, to go from loose (synchrony 0.3) to locked (0.7). With no pacemakers the width grows from 0.025 to 0.111. With half pacemakers it grows from 0.024 to 0.173. So pacemakers do soften the lock, but only in a lumpy crowd. On their own they don't change the attack at all. The cost: the half-lock point slides from 0.99× to 0.96× of the lock point.

**WHAT IT MEANS FOR PLAYING.** Each knob now has one clear job. Tightness says where you are relative to the lock. Life moves the lock point and makes the tone breathe. Lumpiness sets the attack. One catch: the knob is front-loaded. With no pacemakers, the width more than doubles by lumpiness 0.25 (0.025 to 0.064), and with half pacemakers it gets nearly all the way (0.134 of 0.173). A playable knob should spend more of its travel near zero, probably by squaring it.

**LISTEN.** In [lumpiness-attack.wav](open:Projects/Neural Granular Synthesis/lumpiness-attack.wav), three 9-second passes at half pacemakers and 512 neurons ramp tightness from 0.8× to 1.15× the lock point. The ramp crosses the lock point at 4 seconds. The first pass is even (lumpiness 0), the second half lumpy (0.5), the third fully lumpy (1). The even crowd should stay hiss and then snap to a tone at about 4.2 s. The lumpy ones should start pulling together before 3 s and swim in. The right panel of [lumpiness.png](open:Projects/Neural Granular Synthesis/lumpiness.png) traces their synchrony over time.

**PAGE EDITS.** The spec gets a new section on lumpiness, with the equation written in symbols and in words and the numbers above, plus a row in the table of how the knobs combine. My entry's list of population controls gains lumpiness, and the pacemaker line now says what pacemakers actually do.

**Artifacts:**
- [29 s: three ramps through the lock point at half pacemakers, at lumpiness 0, 0.5 and 1.](Projects/Neural Granular Synthesis/lumpiness-attack.wav)
- [Lock curves at life 0% and 50% for four lumpiness settings, plus the audition's synchrony over time.](Projects/Neural Granular Synthesis/lumpiness.png)
- [The lumpy crowd, the 8 × 10 × 3 sweep, and the audition render.](Projects/Neural Granular Synthesis/render_lumpiness.js)
- [Draws the plate.](Projects/Neural Granular Synthesis/plot_lumpiness.py)
- [Sweep data: synchrony for every setting, how much it varies across crowds, half-lock point, width.](Projects/Neural Granular Synthesis/lumpiness.json)
- [The audition's synchrony every 0.1 s.](Projects/Neural Granular Synthesis/lumpiness-trace.json)

_512 neurons · width = how far tightness turns (share of the lock point) for synchrony to go from 0.3 to 0.7 · mean of 3 crowds_
| life | lumpiness | synchrony at 0.9× | synchrony at 0.975× | synchrony at 1.0× | half-lock at | width |
| --- | --- | --- | --- | --- | --- | --- |
| 0 % | 0 | 0.09 | 0.12 | 0.62 | 0.994× | 0.025 |
| 0 % | 0.25 | 0.19 | 0.47 | 0.62 | 0.980× | 0.064 |
| 0 % | 0.5 | 0.25 | 0.54 | 0.61 | 0.968× | 0.095 |
| 0 % | 1 | 0.27 | 0.62 | 0.66 | 0.963× | 0.111 |
| 50 % | 0 | 0.21 | 0.30 | 0.81 | 0.985× | 0.024 |
| 50 % | 0.25 | 0.34 | 0.51 | 0.67 | 0.973× | 0.134 |
| 50 % | 0.5 | 0.31 | 0.52 | 0.61 | 0.972× | 0.138 |
| 50 % | 1 | 0.37 | 0.54 | 0.65 | 0.965× | 0.173 |

_Changed the page:_ Neural Granular Synthesis — spec — control-vocabulary-math — New section on lumpiness (equation in symbols and words, measured widths) plus a row in the table of how the knobs combine. The spec had no knob for how sharp the lock is.
_Changed the page:_ Neural Granular Synthesis — Added lumpiness to the population controls and corrected the pacemaker line: pacemakers move the lock point; lumpiness sets the attack.

_Left rough:_ Nobody has listened yet. The audition's even pass looks noisy below the lock point in the trace, and I haven't checked whether that's the 10 ms meter or the crowd itself. The codebox has no lumpiness, and its audition steps still say life sets the attack: Max work is paused, so I left it alone. The fixed codebox is still uncompiled, and recounting the pacemakers at 512 neurons could still click when you turn the crowd knob.

_Next moves named:_ Give lumpiness a gentler curve (try λ², or λ³ if that isn't enough) and re-sweep so the width climbs evenly across the knob. Then put it in the browser instrument (crowd-instrument.html) so it can be played. · For the codebox once Max opens up: lumpiness needs one seeded random number per neuron, generated once, and the nudge applied to the rate and starting phase when the crowd or lumpiness knob moves, never per sample. Its audition steps also need the corrected line that life moves the lock point and lumpiness sets the attack. · Check whether the 3% early shift can be cancelled by scaling tightness with lumpiness, so the lock point holds still while the attack changes.
<sub>`ngs-steward-025` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-3479448a8f" -->
### 2026-10-18 — cycle 15

taught item 1
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="ngs-steward-023" -->
### 2026-10-13 — cycle 14 — The codebox picked the wrong number of pacemakers, and that's fixed. Fixing it showed the soft lock comes from a lumpy crowd, not from life.
> shipped · codebox fixed, still matches the board · steward leans give lumpiness its own knob

THE BUG. The codebox made every neuron whose role number fell under `life` a pacemaker. With 128 neurons at life 0.5 that gives 59 pacemakers, not 64. More followers means an earlier lock, so the crowd locked 8% early. That was last cycle's open puzzle. The followers' natural rates were never bunched: their spread is 0.574–0.579 under both rules, against 0.577 for a perfectly even spread. Now `life` picks exactly round(life × crowd size) pacemakers, taking the lowest role numbers first. Pacemaker sets still nest. Ranks are recounted only when the crowd knob moves, not on every sample. After the fix, the lock point I computed lands within 1% of theory for every crowd and life (table below). The codebox still matches the board engine: 135 dB under the signal at 128 neurons and 123 dB under at 512. I re-rendered crowd-codebox-take.wav from the fixed file.

THE FIND. I re-swept the edge with evenly spread crowds under the fixed rule (edge-headcount.png, right two panels). At 512 evenly spread neurons with no pacemakers, synchrony sits at 0.08 at 0.95× the edge and jumps to 0.62 at 1.0×. With 68% pacemakers it is 0.32 at 0.95× and 0.78 at 1.0×. So the lock is a switch at any life. The softening I reported comes from lumpiness: random rates and phases add noise to the crowd's shared pull, and pacemakers add more noise only when the crowd is small or random. Life still moves the edge exactly as theory says. What it doesn't do is set how soft the attack is.

WHY IT MATTERS FOR PLAYING. A soft attack is a nice thing to play with, but it shouldn't be a side effect of how the crowd happened to be seeded. I lean toward a third knob, lumpiness: a controlled amount of random scatter in the natural rates, laid over the even spread. Then tightness says where the lock is, life says where the edge sits and how much the tone breathes, and lumpiness says how hard the lock hits.

**Artifacts:**
- [four crowds: random crowds lock softly, evenly spread ones with the fixed headcount lock like a switch at every life.](Projects/Neural Granular Synthesis/edge-headcount.png)
- [the codebox with the pacemaker headcount fixed (exactly round(life·N), ranks recounted only when crowd moves).](Projects/Neural Granular Synthesis/RNBO/crowd.codebox)
- [the 51 s walk re-rendered by the fixed codebox.](Projects/Neural Granular Synthesis/RNBO/crowd-codebox-take.wav)
- [mirror check, with the board engine given the same fixed headcount.](Projects/Neural Granular Synthesis/RNBO/codebox_mirror.mjs)
- [match: −135 dB at 128 neurons, −123 dB at 512.](Projects/Neural Granular Synthesis/RNBO/codebox_mirror_report.json)
- [the diagnosis (headcount, follower rates, computed lock point) and the re-sweep.](Projects/Neural Granular Synthesis/render_edge_headcount.js)
- [diagnosis table and sweep data.](Projects/Neural Granular Synthesis/edge-headcount.json)
- [draws the plate.](Projects/Neural Granular Synthesis/plot_edge_headcount.py)
- [last cycle's sweep, updated to the fixed rule so it can be re-run like for like.](Projects/Neural Granular Synthesis/render_edge_crowds.js)

_Evenly spread crowd: pacemakers chosen, and the computed lock point ÷ theory's 1/(1 − life)_
| crowd | life | old rule: pacemakers | old: lock ÷ theory | fixed: pacemakers | fixed: lock ÷ theory | random crowds: lock ÷ theory |
| --- | --- | --- | --- | --- | --- | --- |
| 128 | 30 % | 36 | 0.973 | 38 | 0.991 | 1.000 |
| 128 | 50 % | 59 | 0.918 | 64 | 0.995 | 0.991 |
| 128 | 68 % | 86 | 0.968 | 87 | 0.990 | 0.978 |
| 512 | 50 % | 252 | 0.982 | 256 | 0.997 | 0.990 |
| 512 | 68 % | 345 | 0.978 | 348 | 0.995 | 0.994 |

_Left rough:_ The fixed codebox is still uncompiled. Recounting ranks at 512 neurons costs about 262,000 comparisons in the one sample where the crowd knob moves, which could click while you turn that knob in Max. I also haven't tested the lumpiness knob; I only inferred it from this sweep. The project's spec and the codebox's audition steps (step 5) still say life sets the attack, and that's now wrong. The spec is yours or an elder's to change.

_Next moves named:_ Build the lumpiness knob: random rate scatter over the even spread, swept against the edge, to show it controls how hard the lock hits without moving the edge. · Correct the codebox's audition steps and propose the spec correction (life moves the edge and makes the tone breathe; lumpiness sets the attack). · Still waiting on you, whenever you like: paste crowd.codebox into an rnbo~ and tell me what Max says.
<sub>`ngs-steward-023` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="ngs-steward-021" -->
### 2026-10-13 — cycle 13 — About half of last cycle's 'pacemakers soften the lock' was just a small crowd. A narrower softening survives at 512 neurons.
> shipped · 512-neuron edge sweep · steward leans the finding is real but smaller

I swept tightness around the predicted edge for three crowds. The first is 128 random neurons, cycle 12's crowd, rerun. The second is 512 random neurons. The third is 128 evenly spread neurons, the crowd crowd.codebox uses. Each sweep ran at four pacemaker shares.

WHAT CHANGED. Far below the edge, at 0.6× and 0.8×, most of the extra synchrony that pacemakers seemed to cause disappears in the big crowd. At 0.8× with 68% pacemakers it falls from 0.64 at 128 neurons to 0.36 at 512. That part was a small crowd's random agreement.

WHAT SURVIVED. Just under the edge, at 0.9× and 0.95×, pacemakers still make the crowd start to lock early. At 512 neurons with none, synchrony is 0.22 at 0.9×. With 68% it is 0.57. Above the edge every crowd agrees. So life still softens the attack of the lock, over a window of about the last tenth of the knob rather than the last half.

A SIDE FIND. The evenly spread 128-neuron crowd switches more sharply than the 512 random one: 0.24 to 0.80 across the last 5% with no pacemakers. Spreading the neurons evenly makes a small crowd behave like a much bigger one. That is good news for CPU in the codebox.

**Artifacts:**
- [three crowds side by side: the far-below-edge lift shrinks at 512; the near-edge softening stays.](Projects/Neural Granular Synthesis/edge-crowds.png)
- [the sweep.](Projects/Neural Granular Synthesis/render_edge_crowds.js)
- [sweep data.](Projects/Neural Granular Synthesis/edge-crowds.json)
- [draws the plate.](Projects/Neural Granular Synthesis/plot_edge_crowds.py)

_Core synchrony at tightness ÷ predicted edge, no pacemakers vs 68 %_
| crowd | life | 0.6× | 0.8× | 0.9× | 0.95× | 1.0× | 1.1× |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 128 random | 0 % | 0.17 | 0.24 | 0.31 | 0.40 | 0.64 | 0.87 |
| 128 random | 68 % | 0.43 | 0.64 | 0.76 | 0.79 | 0.84 | 0.89 |
| 512 random | 0 % | 0.08 | 0.13 | 0.22 | 0.45 | 0.82 | 0.88 |
| 512 random | 68 % | 0.19 | 0.36 | 0.57 | 0.65 | 0.78 | 0.88 |
| 128 evenly spread | 0 % | 0.10 | 0.14 | 0.17 | 0.24 | 0.80 | 0.88 |
| 128 evenly spread | 68 % | 0.26 | 0.39 | 0.50 | 0.63 | 0.79 | 0.88 |

_Left rough:_ The evenly spread crowd at 50% pacemakers locks early, at 0.95×. I think that's because the pacemakers aren't chosen independently of the natural rates, so the followers' rates come out bunched, but I haven't checked. Three random crowds per point also means the 512 numbers still wobble by a few hundredths.

_Next moves named:_ Check whether the evenly spread crowd's pacemaker choice skews the followers' rates, and fix the sequence if it does, before the codebox is played in earnest. · Fold the corrected finding into the project's spec: life sets how sharp the attack of the lock is, over the last tenth of tightness.
<sub>`ngs-steward-021` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="ngs-steward-020" -->
### 2026-10-13 — cycle 13 — The crowd now exists as an RNBO codebox, up to 512 neurons, and it matches the board instrument sample for sample. Next step is opening it in Max.
> shipped · codebox + mirror check + its own one-take · steward leans you open it in Max next

WHAT I MADE. RNBO/crowd.codebox is a single codebox~ holding up to 512 neurons. Its knobs belong to the population: tight (1 is the lock edge), life (the pacemaker share), spread (how much the neurons disagree), crowd (how many neurons) and width (spike width, which behaves like a formant). It also has keyboard params (freq, glide, gate, velocity, attack, release) and a drive inlet, so outside audio can push every neuron. out1/out2 carry the sound. out3 carries the crowd's synchrony from 0 to 1, for a meter. The wiring list is at the top of the file.

ONE DELIBERATE CHANGE. The browser uses a seeded random generator to give each neuron its natural rate, starting phase and pacemaker role. The codebox uses three evenly interleaved number sequences instead. That leaves no random generator to port. Turning the crowd knob also never reshuffles anyone: it admits or dismisses neurons from a crowd that is already evenly spread.

HOW I CHECKED IT. RNBO/codebox_mirror.mjs runs the codebox file's own text as JavaScript. It gives the board's engine the same crowd, then subtracts the two over cycle 12's whole 51-second walk. The difference sits 135 dB under the signal at 128 neurons and 123 dB under at 512. That is the gap between 32-bit and 64-bit storage, nothing more. The transpiler is adopted from the 2D Torus project's RNBO folder. crowd-codebox-take.wav is that walk played by the codebox itself.

TO TRY IT. Make an rnbo~ and paste the file into a codebox~. Add [out~ 1] [out~ 2] and turn on audio: you should hear hiss. Raise tight past 1 and it snaps into a tone. Raise life to about 0.12 and the tone breathes. The audition steps are at the bottom of the file.

**Artifacts:**
- [the crowd as one RNBO codebox~; wiring at the top, audition order at the bottom.](Projects/Neural Granular Synthesis/RNBO/crowd.codebox)
- [51 s, played by the codebox's own arithmetic: hiss → lock → frozen → living → wide vibrato → breaking → A C D E D A.](Projects/Neural Granular Synthesis/RNBO/crowd-codebox-take.wav)
- [runs the codebox text as JavaScript and subtracts it from the board engine.](Projects/Neural Granular Synthesis/RNBO/codebox_mirror.mjs)
- [the match numbers and a synchrony trace.](Projects/Neural Granular Synthesis/RNBO/codebox_mirror_report.json)

_codebox vs board engine, same crowd, same walk_
| neurons | seconds | largest sample difference | difference under the signal |
| --- | --- | --- | --- |
| 128 | 51 | 6.4e-7 | −135 dB |
| 512 | 12 | 1.0e-6 | −123 dB |

_Left rough:_ Nobody has compiled it. FixedFloat64Array state, floating-point array indexes and a 512-step loop inside the per-sample tick all match the RNBO docs as I read them, but they are unverified until Max accepts the file. I don't know what it costs in Live either. The JavaScript copy runs 128 neurons at 0.15× realtime and 512 at 0.58×, and compiled C++ should do better, but that is a guess.

_Next moves named:_ You paste crowd.codebox into an rnbo~ and tell me what Max says; every error becomes a Gotcha on the RNBO codebox~ smith. · Once it compiles, wrap it as a Max for Live instrument with tight and life as the two big dials.
<sub>`ngs-steward-020` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="ngs-steward-019" -->
### 2026-10-13 — cycle 12 — The crowd is playable now. Two knobs, tightness and life, plus a keyboard. Pacemakers turn the lock from a switch into a crossfade.
> shipped · instrument, one-take recording, edge sweep · steward leans toward bringing the crowd into Max/RNBO next

THE INSTRUMENT (crowd-instrument.html). You don't play neurons. You play the crowd. A pad sets tightness (coupling measured in units of the crowd's disorder) across and life (the share of pacemakers) up. Its shading comes from last month's clarity map, and a teal line marks where theory says the tone breaks: tightness = 1/(1 − life). Below the pad, a live raster (one row per neuron) and a phase wheel show the stripes form. Keys A–K play notes and Z/X change octave. There are also knobs for disorder, crowd size (4–512), and spike width, which acts like a formant. It runs the same engine as the standalone crowd_engine.js, and I checked that the two copies are identical. Headless, it costs about 5% of one core.

THE ONE-TAKE (crowd-gesture.wav, 51 s). It moves from hiss, across the edge (it snaps at about 8.5 s), to a dead-still tone. Pacemakers fade in until the tone breathes, then it widens into heavy vibrato. Next, tightness drops under the edge and the core comes apart. It comes back to a living tone and plays A C D E D A on it. crowd-gesture.png shows the meters under the sound.

THE FIND (edge-softening.png). Tightness was swept around the predicted edge at four pacemaker shares, with three crowds each. The edge stays where theory says. Its shape changes. With no pacemakers, synchrony jumps from 0.40 to 0.84 within 10% of the line. At 68% pacemakers it climbs steadily from 0.35 at half the edge. For playing, that means life also sets how sharp the attack is when you lock the crowd.

**Artifacts:**
- [the playable crowd: pad, keys, raster, phase wheel. Press start.](Projects/Neural Granular Synthesis/crowd-instrument.html)
- [51 s in one take: hiss → lock → frozen → living → wide vibrato → breaking → a short phrase.](Projects/Neural Granular Synthesis/crowd-gesture.wav)
- [tightness, life, synchrony and wobble under the take.](Projects/Neural Granular Synthesis/crowd-gesture.png)
- [the edge stays put but softens: a switch with no pacemakers, a crossfade at two-thirds.](Projects/Neural Granular Synthesis/edge-softening.png)
- [the engine, shared by the page and the renders.](Projects/Neural Granular Synthesis/crowd_engine.js)
- [renders the one-take and its meter trace.](Projects/Neural Granular Synthesis/render_crowd_gesture.js)
- [meter trace every 10 ms.](Projects/Neural Granular Synthesis/crowd-gesture.json)
- [the edge sweep.](Projects/Neural Granular Synthesis/render_edge_softening.js)
- [sweep data.](Projects/Neural Granular Synthesis/edge-softening.json)
- [draws both plots.](Projects/Neural Granular Synthesis/plot_crowd_gesture.py)

_Core synchrony vs tightness ÷ predicted edge · 128 neurons · mean of 3 crowds_
| life | 0.6× | 0.8× | 0.95× | 1.0× | 1.05× | 1.2× |
| --- | --- | --- | --- | --- | --- | --- |
| 0 % | 0.17 | 0.24 | 0.40 | 0.64 | 0.84 | 0.90 |
| 30 % | 0.21 | 0.35 | 0.60 | 0.79 | 0.86 | 0.91 |
| 50 % | 0.27 | 0.44 | 0.69 | 0.79 | 0.85 | 0.90 |
| 68 % | 0.43 | 0.64 | 0.79 | 0.84 | 0.86 | 0.92 |

_Left rough:_ I haven't heard the instrument in a real browser. I only ran its engine headless and checked the page script for syntax, so audio, the pad and the raster are unverified until you press start. Some of the softening is probably just a small crowd: at 68% pacemakers only 41 neurons are still following, so the background synchrony is higher. A 512-neuron sweep would separate that effect from the softening.

_Next moves named:_ Run the 512-neuron edge sweep so the true softening is separate from the small-crowd effect. · Bring the crowd into a Gen~/RNBO codebox so it can be played in Live. It would be unverified until you open it.
<sub>`ngs-steward-019` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="ngs-steward-017" -->
### 2026-09-24 — cycle 9 — A locked crowd is a dead-still tone. Making 5–20% of the neurons pacemakers gives it life, and it stays a tone until about two-thirds are pacemakers.
> shipped · all four open questions now have a measured answer · steward leans build the playable instrument next

The setup: the same 128-neuron crowd at a rate spread of 0.10. A share p of the neurons are pacemakers. They fire at their own rate and don't listen to the crowd, but the crowd still hears them. I swept p from 0 to 0.7 against coupling from 0 to 0.8, which makes 153 crowds with 2 s of audio each. On top of last cycle's timbre measures I added two kinds of movement a listener would call life: pitch wobble (how much the locked core's pitch moves, in cents) and loudness wobble (how much the level breathes).

1. **With no pacemakers, a locked crowd is frozen.** Pitch wobble is exactly 0 cents and loudness wobble is 0.2%. Every period repeats the one before, so it is the most mechanical sound this model can make.

2. **A few pacemakers bring it to life and cost almost nothing in clarity.** At K 0.4, 5% pacemakers give 10 cents of wobble (5 of it slow drift you would hear as vibrato), and pitch clarity stays at 0.98. At 20% it's 21 cents and clarity is 0.93. The pacemakers beat against the locked core and put a halo of sidebands around each harmonic (panel F). Harmonicity drops from 1.0 to about 0.5 because the halo lands off the exact harmonics. The pitch is still clear: that is chorus, not noise.

3. **The tone breaks where theory says.** Pacemakers only thin out the pull, so the locking edge should move from 4·spread/π to that value ÷ (1 − p). It does, across the whole grid (dashed line, panels A–B). At K 0.4 the predicted break is p ≈ 0.68. Clarity holds at 0.85 or above up to p = 0.5 and falls to 0.40 at p = 0.7.

4. **The surprise: coupling turns the life up too.** Past the edge, wobble grows with coupling, not only with p (panel C). The tighter the core listens, the more closely it follows the pacemakers' random pull. At p = 0.6, wobble goes from about 20 cents near the edge to about 55 at K 0.8. So coupling isn't only a switch and a brightness control. With pacemakers in the crowd, it is also the vibrato depth.

5. **Last cycle's lag isn't real.** I ramped coupling up and back down at three speeds (4, 16 and 64 s each way) over six different random crowds. Locking and releasing happen at the same coupling within 0.006 at every speed, which is smaller than the spread between crowds. The crowd has no memory. The 0.24 / 0.21 gap I reported came from reading one crowd's trace by eye.

**pacemaker-ladder.wav**, 25 s: six rungs at K 0.4, each 3.6 s long, one every 4.2 s, levelled so you hear texture and not volume. The rungs are p = 0 (still), 0.1, 0.2, 0.35, 0.5 and 0.65 (on the edge).

The design reading: an instrument wants two knobs, coupling per unit of disorder (the tone and its brightness) and pacemaker share (its life). The full map of the second one is panel C.

**Artifacts:**
- [the pacemaker map: the core's synchrony, clarity, pitch and loudness wobble over pacemaker share × coupling; the K 0.4 slice; the halo; and the lag test.](Projects/Neural Granular Synthesis/pacemakers.png)
- [25 s, six rungs at K 0.4: pacemaker share 0 (still) → 0.1 → 0.2 → 0.35 → 0.5 → 0.65 (on the edge).](Projects/Neural Granular Synthesis/pacemaker-ladder.wav)
- [every measured crowd plus the lag-test numbers.](Projects/Neural Granular Synthesis/pacemakers.json)
- [the script; it reuses cycle 8's spike shape and timbre measures.](Projects/Neural Granular Synthesis/render_pacemakers.py)

_At coupling K 0.4, spread 0.10 — what pacemakers do_
| pacemaker share | pitch clarity | pitch wobble (cents) | slow drift (cents) | loudness wobble | brightness (Hz) |
| --- | --- | --- | --- | --- | --- |
| 0 | 0.995 | 0.0 | 0.0 | 0.2% | 519 |
| 0.05 | 0.976 | 10.4 | 5.0 | 1.7% | 509 |
| 0.10 | 0.967 | 13.0 | 7.1 | 1.9% | 493 |
| 0.20 | 0.931 | 20.6 | 11.6 | 3.4% | 470 |
| 0.40 | 0.902 | 24.0 | 10.5 | 8.2% | 419 |
| 0.60 | 0.675 | 31.4 | 17.1 | 10.2% | 479 |
| 0.70 | 0.396 | 30.0 | 17.5 | 9.7% | 633 |

_Left rough:_ I haven't listened to the ladder. 'Alive' is my label for measured wobble, and whether 10 cents sounds like life or like a bad tuning is for your ears. Everything is one crowd (seed 7) at one spread (0.10). The pacemakers use the same rate spread as the rest of the crowd, and I didn't test pacemakers that are faster, slower or noisier. The harmonicity measure is strict (±3 Hz), so it reads the halo as off-harmonic even when the pitch is clear. Scripts in this folder need /usr/local/bin/python3; the Homebrew python3 has no matplotlib.

_Next moves named:_ Build the playable instrument: put the audio-rate crowd into the synchrony sonifier with two sliders, coupling per disorder and pacemaker share, so the snap, the filter and the life can be played live · Propose folding the four measured answers into the entry's Open Questions: minimum crowd, coupling as switch then filter, the K ÷ spread collapse, and pacemakers as life (the orchestrator or Loudon writes that) · Test pacemakers that differ from the crowd (faster, slower, noisier) to see whether pacemaker character sets vibrato rate as well as depth
<sub>`ngs-steward-017` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="ngs-steward-015" -->
### 2026-09-24 — cycle 8 — I moved the crowd up to audio rate and mapped its timbre: coupling snaps it into a tone, then opens it like a filter, and only coupling ÷ spread matters.
> shipped · both open timbre questions answered by measurement · steward leans fold into the entry next

The setup: 128 phase-neurons with natural rates spread evenly ±σ around 110 Hz. σ stands in for threshold variance, because a neuron with a lower threshold fires faster. Coupling K runs from 0 to 0.8 across 17 steps, and σ takes 8 values from 0.02 to 0.40, for 136 crowds in all. Each crowd gets 1 s of audio after warm-up. I measured four things: synchrony r, harmonicity (share of energy within ±3 Hz of the harmonics), pitch clarity (autocorrelation peak) and brightness (spectral centroid).

What came out:

1. **Coupling is a switch, and the switch sits where theory says.** For an even spread of rates, Kuramoto theory puts the locking point at K = 4σ/π. Across every spread the crowd flips at that line, within one grid step (heatmaps A–C, dashed line). Below it there is no pitch at all: harmonicity sits around 0.03–0.2 and clarity around 0.1–0.2, a buzzy smear. Just past it, both are close to 1, a clean tone at 110 Hz. The flip is abrupt, not a slow fade.

2. **Past the switch, coupling works like a filter cutoff.** This is the part I didn't expect. At the moment of locking the tone goes dark: brightness falls from about 760 Hz to about 330 Hz. The locked crowd still has some phase spread, so its high harmonics cancel. Raise coupling further and the crowd tightens, the high harmonics come back, and brightness climbs toward 700 Hz (heatmap D, spectra in E). So yes, coupling lines up with a timbre dimension, and it is brightness, but only on the locked side.

3. **Threshold variance doesn't pick a region; it moves the edge.** Plotted against K ÷ σ, every spread lies on a single curve, for synchrony and for brightness (panel F). σ = 0.1 at K = 0.4 and σ = 0.2 at K = 0.8 give the same 519 Hz. For this model that is what the math predicts (only the ratio enters the locked state), and the measurement confirms it to the hertz. The design consequence is that an instrument needs one knob, coupling per unit of disorder, not two.

4. Locking also makes the crowd 7 to 20 dB louder, because 128 spikes arriving together add up instead of averaging out. The WAV levels this out so you hear the timbre change, not a volume jump.

**timbre-walk.wav**, 36 s, three continuous walks:
- 0–12 s: coupling rises at σ = 0.18. The smear snaps into a dark tone at about 4.7 s, then brightens.
- 12.8–24.8 s: coupling held at 0.3 while the spread widens. The tone holds, then dissolves at about 19 s.
- 25.6–35.6 s: coupling falls again. The tone releases at about 32 s.

Panel G shows r under each walk, so you can follow along.

This is the page's forward vector with a measurement under it: the crowd's coherence is the control surface, and here it is a single number.

**Artifacts:**
- [A–D: synchrony, harmonicity, pitch clarity and brightness over coupling × spread, with the theory edge K = 4σ/π dashed. E: spectra crossing the edge. F: everything collapses onto K ÷ spread. G: r under each audio walk.](Projects/Neural Granular Synthesis/timbre-map.png)
- [36 s, loudness-levelled: coupling up (snap at ~4.7 s), spread widened (dissolves at ~19 s), coupling back down (releases at ~32 s).](Projects/Neural Granular Synthesis/timbre-walk.wav)
- [All 136 measured crowds: r, pitch, harmonicity, clarity, brightness, loudness.](Projects/Neural Granular Synthesis/timbre-map.json)
- [The script. Simulates all 136 crowds at once at 48 kHz, ~80 s to run.](Projects/Neural Granular Synthesis/render_timbre_map.py)

_Spread σ = 0.20 crossing its edge (theory: K_c ≈ 0.25)_
| K | r | harmonicity | pitch clarity | brightness (Hz) | loudness (dB) |
| --- | --- | --- | --- | --- | --- |
| 0.0 | 0.08 | 0.03 | 0.12 | 765 | 3.5 |
| 0.2 | 0.19 | 0.09 | 0.15 | 720 | 4.0 |
| 0.25 | 0.48 | 0.47 | 0.57 | 571 | 4.1 |
| 0.3 | 0.90 | 0.99 | 0.99 | 326 | 10.5 |
| 0.4 | 0.95 | 0.99 | 0.99 | 354 | 14.4 |
| 0.8 | 0.99 | 1.00 | 0.99 | 519 | 20.6 |

_Left rough:_ No one has listened to the walk yet; the numbers are measured, the ear check is still yours. σ is a rate spread standing in for threshold variance, and these are phase neurons, not threshold neurons, so the stand-in is argued, not tested. The grid is one seed with an even spread, and the K ÷ σ collapse is exact because of how this model is built, so it is a confirmation, not a discovery. The walks show a small lag, locking near K 0.24 on the way up and releasing near 0.21 on the way down, and I can't yet tell real hysteresis from ramp speed. There are small clicks at the walk boundaries, visible as spikes in panel G.

_Next moves named:_ Put the audio-rate crowd into the synchrony sonifier with a single 'coupling per disorder' slider, so the snap and the filter-opening can be played live · Test whether the lag is real: slow the ramp down tenfold and see if the gap between locking at 0.24 and releasing at 0.21 survives · Take the last open question, pacemaker proportion and liveliness: add a fraction of neurons that ignore coupling and hear whether they keep the locked tone alive · Propose folding the three measured answers (minimum crowd, coupling as switch then filter, the K ÷ spread collapse) into the entry's Open Questions
<sub>`ngs-steward-015` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="ngs-steward-013" -->
### 2026-09-24 — cycle 7 — I measured how many neurons a steady timbre needs: about 32 when the crowd drifts, and no number at all when it locks.
> shipped · minimum-crowd question answered by measurement · steward leans fold the answer into the entry

I gave every neuron its own 90 ms grain at its own pitch, spread about 3.5 semitones around 330 Hz, and grew the crowd from 4 to 512 at three couplings: drifting (K=0), near the locking point (K=0.2) and fully locked (K=1.6). Each point is averaged over three seeds. Two things came out.

First, brightness is not what sets the minimum. The average pitch of whoever fired does settle the way counting statistics predict, like 1/√N (40 cents of wobble at N=4, 4.6 at N=512). But the brightness you actually hear hits a floor by about N=16. That floor is the fizz of steady noise with the same spectrum. I checked by scrambling the phases of each render into pure noise and measuring that too. After N≈16, more neurons make no audible difference to brightness.

Second, gappiness sets the minimum: can you still hear separate grains? A drifting crowd comes within about 10% of the steady-noise level at N≈32, which is roughly 190 grains per second. A locked crowd stays at about 1.4, five to six times the floor, at every size from 4 to 512. When 512 neurons fire on one beat they act like one big grain pulsing at 6 Hz. The near-locking crowd sits in between and still hasn't reached the floor at 512.

So my open question had a hidden variable. The minimum crowd isn't a fixed number; it depends on r. Synchrony shrinks the number of independent voices, so coupling is a density control as well as a pitch-fusion control. That is the page's claim that coherence is the real control surface, now shown with measurements.

The ladder WAV plays 8 rungs of drift (N=4 up to 512), then 8 rungs of locked, 3 s each at matched loudness, so what you hear change is steadiness, not volume.

**Artifacts:**
- [Panel A: brightness heard, pitch of who fired, and the noise floor. Panel B: gappiness by coupling. Bottom: drift and locked rasters at N = 8, 32, 128, 512.](Projects/Neural Granular Synthesis/crowd-size-stability.png)
- [56 s: drift ladder N=4→512, then locked ladder N=4→512, matched loudness per rung.](Projects/Neural Granular Synthesis/crowd-size-ladder.wav)
- [Every measured number, all 24 settings.](Projects/Neural Granular Synthesis/crowd-size-table.json)
- [The measurement script. Reuses kernel_lib's ring population, ~30 s to run.](Projects/Neural Granular Synthesis/render_crowd_size.py)

_Gappiness by crowd size (10 ms envelope, std/mean · steady-noise floor ≈ 0.23–0.28 · mean of 3 seeds)_
| N | drift | near locking | locked | drift brightness heard (cents) | mean pitch of who fired (cents) |
| --- | --- | --- | --- | --- | --- |
| 4 | 0.61 | 0.90 | 1.39 | 51.7 | 40.4 |
| 16 | 0.32 | 0.53 | 1.43 | 41.5 | 26.6 |
| 32 | 0.27 | 0.52 | 1.37 | 43.1 | 21.2 |
| 128 | 0.25 | 0.31 | 1.35 | 38.5 | 10.9 |
| 512 | 0.25 | 0.28 | 1.40 | 37.1 | 4.6 |

_Left rough:_ I haven't listened to the ladder myself. The 'can't hear it' lines are rough rules of thumb, not tested thresholds. Everything was measured at one firing rate (6 Hz) and one grain length (90 ms); the ~32 figure should scale with rate × grain length, but I haven't swept either. The entry's open question isn't updated yet: that is a house change, so I'm proposing it rather than making it.

_Next moves named:_ Propose an entry edit: answer 'What is the minimum population size?' with 'about 32 at 6 Hz / 90 ms when drifting, no size when locked; the minimum depends on r' (for the orchestrator or Loudon to write) · Sweep firing rate and grain length to test whether the knee sits at a fixed grain overlap (grains sounding at once), which would give a general rule instead of one number · Add an 'effective crowd size' readout to the raster explorer, so the live control shows how many independent voices the crowd really has as coupling rises
<sub>`ngs-steward-013` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="ngs-steward-011" -->
### 2026-09-24 — cycle 6 — The raster explorer now makes traveling waves and chimeras, where one crowd is half locked and half drifting. It comes with a four-panel still and a stereo audition.
> shipped · DEEPEN-RASTER done · steward leans MIN-POP next, heard through the ring-as-stereo idea

The old model had every neuron hearing the average of all the others. That can only make stripes (locked) or scatter (drifting). A wave needs a direction and a chimera needs neighbours, so the old model could never reach either one. I swapped in a ring with a coupling kernel and a phase lag (Kuramoto-Sakaguchi). The old model is the special case where the kernel is flat and the lag is zero, so nothing earlier breaks.

Three things I found by measuring:
1. **Global r lies about the wave.** A traveling wave reads r = 0.00, the same as pure drift, while every neuron is locked to its neighbours (local r 0.93). So I added a second meter: a strip down the right edge of the raster showing local coherence for each neuron. The regime pill now reads both meters. Full strip means lock, empty means drift, full strip with global r near zero means a wave, and half-and-half means a chimera.
2. **A chimera has to be seeded, then settled.** It never appears on its own from random starting phases, and full lock is always a competing outcome. The chimera preset seeds a coherent bump and quietly runs 30 simulated seconds before showing you anything.
3. **Step size decides whether the chimera survives.** At a 4 ms simulation step the chimera slid into full lock within seconds. That was the explorer's live step at 60 fps. At 2 ms it holds: after the 30 s settle it was still 38% locked and 62% drifting following another 60 s of live running. The step is now pinned at 2 ms.

The audio idea: **the ring is the stereo field.** Each neuron is panned by its position on the ring, and each spike fires a grain whose detune grows as that neuron's local coherence falls. The wave's spikes sweep across the speakers. The chimera puts its locked patch to the left and its drifting cloud to the right.

**Artifacts:**
- [the explorer, now with drift / lock / traveling wave / chimera presets, kernel and lag controls, and a local-coherence strip. Hit chimera, wait a beat while it settles, and watch the amber rows hold while the indigo rows slip.](Projects/Neural Granular Synthesis/raster-plot-explorer.html)
- [the four regimes side by side, each raster with its local-coherence profile down the ring. The chimera's split profile is its fingerprint.](Projects/Neural Granular Synthesis/raster-four-regimes.png)
- [31 s stereo, about 7 s per regime in the order drift, lock, wave, chimera. Headphones help: the ring is the stereo field.](Projects/Neural Granular Synthesis/four-regimes.wav)
- [the renderer behind the still and the WAV (run it with /usr/local/bin/python3; the Homebrew Python has no matplotlib).](Projects/Neural Granular Synthesis/render_four_regimes.py)
- [the ring-population core, adopted from the earlier half-finished run and now checked against all four regimes.](Projects/Neural Granular Synthesis/kernel_lib.py)

_Four regimes · N = 128 on a ring · measured after a 30 s settle_
| regime | kernel | lag α | global r | local r (min–max) | what it should sound like |
| --- | --- | --- | --- | --- | --- |
| drift | flat | 0 | 0.11 | 0.03–0.74 | a cloud of unrelated firings, no pitch centre |
| mean-field lock | flat | 0 | 1.00 | 1.00–1.00 | one fused tone, the whole crowd on one beat |
| traveling wave | narrow | 0 | 0.00 | 0.92–0.95 | fused pitch, but the spikes sweep across the speakers |
| chimera | exponential | 1.457 | 0.65 | 0.17–1.00 | in tune on one side, smeared on the other, from one population |

_Left rough:_ I have not listened to four-regimes.wav. By measurement, the chimera's locked left side is more in tune than its drifting right side (59% vs 49% of the energy near 220 Hz), but the split is mild, and onset timing may be masking the pitch difference. I also only ran the explorer headless under Node, not in a real browser, so the ~1 s pause while the chimera settles is estimated, not observed.

_Next moves named:_ MIN-POP, now answerable along two axes: sweep N (8 to 128) and find where each regime stops holding. Chimeras are known to be fragile at small N, so 'how few neurons before the crowd stops being a crowd' gets a sharper answer. · Sharpen the chimera's sound so the locked half and the drifting half are unmistakable by ear. Detune should dominate over onset jitter, and the drifting side might get a darker grain. · PERF-MAP after that: put K and the lag α on a controller. The lag is the new expressive knob, because sweeping it moves the crowd between lock and chimera.
<sub>`ngs-steward-011` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="ngs-steward-009" -->
### 2026-06-23 — cycle 4 — Synchrony sweep is on the board. Which sub-vector wants the next cycle?
> still working · sonifier + sweep both shipped · I lean perf-map but will take any steer

The sonify-r arc has two shipped surfaces now (interactive + fixed-render). Three live sub-vectors from the entry's open questions: (1) PERF-MAP — wrap the sonifier's K and σ_threshold onto a hardware controller layout so the population becomes playable rather than auditioned; this is the cleanest next move toward 'crowd's coherence as the primary control surface.' (2) DEEPEN-RASTER — extend the raster sim with traveling-wave and chimera-state presets (partial synchrony — half locked, half drifting), which would expose a whole new region of timbre space. (3) MIN-POP — answer the 'minimum population size for perceptually stable timbre' open question by rendering an N-sweep audition (N=4, 8, 16, 32, 64, 96) at fixed K. I lean PERF-MAP because playability is what would carry NGS into Loudon Live; if no preference, I'll take that next.

**Artifacts:**
- [synchrony-sonifier.html](Projects/Neural Granular Synthesis/synchrony-sonifier.html)
<sub>`ngs-steward-009` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="ngs-steward-008" -->
### 2026-06-23 — cycle 4 — Shipped synchrony-sweep.wav — the audible counterpart to raster-three-regimes.png, 24 s of K climbing 0 → 2·K_c.
> sonify-r was granted · interactive sonifier already shipped Jun 8 · this is the fixed audition for the DAW

Quick catch-up: Neural Granular Synthesis is the shader-parallel population engine where the crowd's coherence (Kuramoto's r) is the timbre control surface. Last cycle I shipped control-vocabulary-math.md and raster-plot-explorer.html. Loudon then granted sonify-r and (between then and now) synchrony-sonifier.html landed — an interactive piece that lets him drive K by hand and hear the crowd fuse. This cycle I added the missing offline twin: synchrony-sweep.wav, a 24-second render of N=96 grain-voices walking K from 0 to 2·K_c, written by render_synchrony_sweep.py. It uses the cycle-3 K-nondimensionalization so K_c lands mid-sweep — the first half is incoherent wash, the back half snaps to a fused harmonic tone. Drop it into Ableton, scrub it, hear the lock arrive.

**Artifacts:**
- [24 s render — K climbs 0 → 2·K_c · listen for the fusion at the midpoint.](Projects/Neural Granular Synthesis/synchrony-sweep.wav)
- [the offline renderer — same detune-collapse + onset-alignment cues as synchrony-sonifier.html.](Projects/Neural Granular Synthesis/render_synchrony_sweep.py)
<sub>`ngs-steward-008` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
