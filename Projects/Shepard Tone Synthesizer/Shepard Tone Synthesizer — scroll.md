---
title: "Shepard Tone Synthesizer — scroll"
born: 2026-09-23
links:
  - target: "[[Shepard Tone Synthesizer]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Shepard Tone Synthesizer's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Shepard Tone Synthesizer — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Shepard Tone Synthesizer]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-18T10:00:06.624Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 10 · last ran 2026-10-18 (today)
- **Plan:** agreed 2026-09-26 (22 days ago) · 1 made thing since
- **Waiting on you:** nothing
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-18 (today) — The glide is built and measured. With one shared glide the octaves agree to 0.0 cents; give each voice its own and they split by 32 to 1006 cents. (`shepard-steward-026`)
- **Last commit touching this project:** 2026-10-16 `929de8c5` — edit(Standing Orders): five scrolls whose Plans lead into Max carry Loudon's pause at the top of their orders
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 1 run on 1 day, counted from the ledger's run lines
- **Last run:** 2026-10-18 — cycle 10 · taught item 1
- **Owed in the ledger:** nothing
- **Latest lesson:** item 1, from cycle 10 — 2026-10-18 — [[Shepard Tone Synthesizer — tuning]]

### Where this stands

The Shepard Tone Synthesizer is a teaching instrument that reveals the endless-staircase illusion one layer at a time, after Escher's impossible staircase. The first two layers are done: a still drone that the ear hears as one note across seven octaves, and a stepping climb with the seam deliberately shown. In June you chose the glide as the next layer: every octave slides together, so the pitch moves smoothly instead of in steps. The question is why the octaves must move as one. Six glide renders from September were never posted. This cycle measured that question directly, built a version you can play in the browser, wrote the matching theory section on my page, and wrote down what the Gen…

### Open asks

_None — nothing is waiting on you._

### Answered, not yet consumed

_None._

### Decided

- `shepard-steward-024` — next_stage_direction → GRANTED — option_id=STAGE-3 (2026-06-25)
- `shepard-steward-022` — stage2_seed_audition_gate → GRANTED — option_id=APPROVE (2026-06-25)

### Runs

- 2026-10-18 — cycle 10 · taught item 1

### Owed

_Nothing owed._

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** A teaching instrument that reveals the endless-staircase illusion one layer at a time, from a rack anyone can build in Ableton to a plugin that tests the illusion outside equal temperament. Any move can happen in public as a [[Loudon Live]] build. What exists so far are proofs, not the builds: the illusion as rendered drones (twelve of them), and the mechanism as a browser prototype with rendered variants that climb in discrete steps and leave the wrap seam audible. The Ableton rack and the Max patch those two moves are designed around haven't been built yet. They are the steward's to make and demo; making Ableton and Max assets reliably is a skill the palace is still growing, so the proofs carry the idea while the builds catch up. Loudon chose the glide as the next move on 2026-06-25, and six glide renders followed on 2026-09-15, not yet posted to the board.

**The moves ahead**

1. **The glide.** In Gen~, every octave slides together as one voice at signal rate, so the pitch moves continuously instead of in steps, and the move asks why moving in lockstep keeps the illusion alive. The first renders include one where the voices drift out of sync, which is where the illusion breaks. Neighbor: [[Portamento and Physical Pitch Modeling]].
2. **The timbre.** Give each voice its own key-tracked bandpass filter in Gen~, so the color changes across the octave stack, and hear what that does to the illusion. Neighbor: [[Piano String Inharmonicity]].
3. **The portal.** Export to VST/AU through RNBO, then try the illusion outside equal temperament with microtuning. Neighbors: [[Kuramoto Coupling]], and the octave-equivalence theory in [[Shepard Tone Synthesizer]].

The April session designs, including the two moves whose proofs are behind us, are archived: [[Shepard Tone Synthesizer — spec — Loudon Live sessions]].
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
- **Max work is paused until we have Max patching standards** (Loudon, 2026-10-16). Make no new Max patcher, gen~ or RNBO codebox, or Max for Live device, and don't edit the ones already made. Carry the Max moves in other tools meanwhile, and write down what each patch will need. This holds over anything below and over the Plan until Loudon lifts it.

Decided with Loudon when the Loudon Live arc was designed (April 2026), and seeded here once from the retired staging file on 2026-09-25:

- **The cross-domain anchor is Escher's impossible staircase**: a finite system, infinite perceived motion. Escher leads the framing.
- **A session is about 85% making, 15% framing.**
- **The audience is autodidact polymaths**: producers fluent in a DAW. The first session needs no Max, no code and no synthesis theory.
- **This is the curriculum's most accessible door**, with zero prerequisites.
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="shepard-steward-026" -->
### 2026-10-18 — cycle 10 — The glide is built and measured. With one shared glide the octaves agree to 0.0 cents; give each voice its own and they split by 32 to 1006 cents.
> shipped · six measured clips, playable browser glide, theory section, Gen~ notes · steward leans the timbre move next

**Start here:** [the playable glide](open:Projects/Shepard Tone Synthesizer/session-3-interactive.html). Press start, then play C, E, G, C on the keys (or A, D, G, A on your keyboard) and keep climbing. The circle shows every octave as a dot on one spoke. Raise 'drift' and the spoke fans out, and the readout gives the split in cents. Try 'Hz slew' for the common patching mistake, and 'endless up' with drift for the surprise below. The review layer is on, so you can leave notes against each section.

**What I measured.** I rendered one climbing phrase (C E G C′ E′ G′ C″, 0.8 s a note) six ways and tracked, sample by sample, how far the audible octaves disagree about which note they're playing. A, one shared glide on pitch: 0.0 cents. B to D, each voice with its own glide time, ±15 %, ±40 % and ±80 % across the stack: up to 32, 93 and 217 cents. E, each oscillator ramping at 150 Hz per second: up to 1006 cents, because the low voices land almost at once and the high ones crawl. F, one shared glide run on Hz instead of pitch: 0.0 cents. The glide's curve changes, but a single smoother keeps every ratio. So the curve is a free choice, but sharing one glide is not. That answers my page's old Design Challenge 4.

**The surprise.** I expected mismatched glide times to smear only the moves between notes. On an endless climb they never heal. Each voice trails the moving target by its own glide time, so the octaves stay mistuned for as long as the climb lasts. The formula predicts 16.2 cents at 2 st/s with ±30 % drift, and the engine measures 16.2.

**Checks.** The browser engine and the Python renderer are separate code. On the lockstep phrase their outputs correlate at 0.9999999992, and on clip C they agree to 0.1 cent.

**The September renders**, posted at last: the glide at 0, 120, 450 and 1200 ms, a broken out-of-sync glide, and a long endless glissando. They're in the artifacts below.

**Artifacts:**
- [The playable glide: keys, glide time, drift, Hz slew, endless up and down, the pitch-class circle. Review layer on.](Projects/Shepard Tone Synthesizer/session-3-interactive.html)
- [The stack climbing two octaves; each voice's error under drift and under Hz slew; the disagreement for all six clips.](Projects/Shepard Tone Synthesizer/proofs/2026-10-18-stage3-glide-fusion.png)
- [A · one shared glide: one note sliding up forever.](Projects/Shepard Tone Synthesizer/proofs/2026-10-18-stage3-A-lockstep.wav)
- [B · ±15 % drift: up to 32 cents apart.](Projects/Shepard Tone Synthesizer/proofs/2026-10-18-stage3-B-drift-015.wav)
- [C · ±40 % drift: up to 93 cents apart.](Projects/Shepard Tone Synthesizer/proofs/2026-10-18-stage3-C-drift-040.wav)
- [D · ±80 % drift: up to 217 cents apart.](Projects/Shepard Tone Synthesizer/proofs/2026-10-18-stage3-D-drift-080.wav)
- [E · the patching mistake: every oscillator ramps at 150 Hz/s.](Projects/Shepard Tone Synthesizer/proofs/2026-10-18-stage3-E-hz-slew.wav)
- [F · one shared glide on Hz: a different curve, still one note.](Projects/Shepard Tone Synthesizer/proofs/2026-10-18-stage3-F-shared-in-hz.wav)
- [Renders and measures all six; writes the figure and manifest.](Projects/Shepard Tone Synthesizer/proofs/stage3_glide_proof.py)
- [Every parameter and every number quoted here.](Projects/Shepard Tone Synthesizer/proofs/2026-10-18-stage3-manifest.json)
- [September · no glide: the steps, for reference.](Projects/Shepard Tone Synthesizer/proofs/2026-09-15-stage3-glide-step-0ms.wav)
- [September · 120 ms glide.](Projects/Shepard Tone Synthesizer/proofs/2026-09-15-stage3-glide-120ms.wav)
- [September · 450 ms glide.](Projects/Shepard Tone Synthesizer/proofs/2026-09-15-stage3-glide-450ms.wav)
- [September · 1200 ms glide.](Projects/Shepard Tone Synthesizer/proofs/2026-09-15-stage3-glide-1200ms.wav)
- [September · voices out of sync: where the illusion breaks.](Projects/Shepard Tone Synthesizer/proofs/2026-09-15-stage3-broken-async-450ms.wav)
- [September · the endless glissando.](Projects/Shepard Tone Synthesizer/proofs/2026-09-15-stage3-endless-glissando.wav)

_The same climbing phrase, six ways to glide · worst disagreement among audible octaves (louder than −20 dB)_
| clip | how it glides | worst disagreement | time over 10 cents (of 5.6 s) |
| --- | --- | --- | --- |
| A | one shared glide on pitch | 0.0 ¢ | 0 s |
| B | own glide time per voice, ±15 % | 32 ¢ | 4.7 s |
| C | own glide time per voice, ±40 % | 93 ¢ | 4.8 s |
| D | own glide time per voice, ±80 % | 217 ¢ | 4.8 s |
| E | each oscillator ramps 150 Hz/s | 1006 ¢ | 4.8 s |
| F | one shared glide on Hz | 0.0 ¢ | 0 s |

_Changed the page:_ Shepard Tone Synthesizer — Added Theory § Stage 3 (why the stack must glide as one, with the measurements and the endless-climb formula) and marked Design Challenge 4 answered.
_Changed the page:_ Shepard Tone Synthesizer — spec — the glide build — New bundle spec: signal flow, parameters, the two measured failure modes, and the checks a gen~ glide must pass, written down while Max is paused.

_Left rough:_ Nobody has heard any of it, me included. The splits are measured, but whether 32 cents of drift reads as broken to your ear is untested, and the 10-cent line is my choice, not a measured hearing threshold. The browser engine was tested headless in Node; the page itself (drawing, buttons, and whether its audio runs inside the board's sandboxed frame) has not been opened in a real browser.

_Next moves named:_ The timbre move: give each octave its own key-tracked bandpass filter, in Python and in the browser glide, and measure what it does to the illusion. My guess is that it pulls the window's centre with the filter, so the stack starts to sound like it's going somewhere. · When Max is unpaused: build the glide in gen~ from the spec, and null it against the lockstep clip (A).
<sub>`shepard-steward-026` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-c0b4cf198d" -->
### 2026-10-18 — cycle 10

taught item 1
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-26T09-21-34-04-00" -->
### 2026-09-26 — Plan revised: the moves are builds, not sessions

Loudon, 2026-09-26: Loudon Live is no longer a scaffolded curriculum of staged sessions; it is his whole public self, building slowly, and any move can happen in public as a build. The moves themselves are unchanged. Only the framing that made each move a session was loosened, and the April session designs were archived (still readable at the same link).

The plan it replaced said:

> Each move is also a [[Loudon Live]] session. What exists so far are proofs, not the session builds:
>
> The Ableton rack and the Max patch those two sessions are designed around
>
> and the session asks why moving in lockstep
>
> Session designs, including the two moves whose proofs are behind us: [[Shepard Tone Synthesizer — spec — Loudon Live sessions]].
<sub>`plan-2026-09-26T09-21-34-04-00` · plan revised · agreed 2026-09-26T09:21:34-04:00 · written by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-25T20-51-08-04-00" -->
### 2026-09-25 — Plan agreed: carried over from the retired staging file

Carried over on 2026-09-25 from the retired staging file, when Loudon asked that every plan fold into its scroll (SCHEMA v1.25). The arc is the one agreed with him in April 2026, unchanged in substance: the two moves with proofs behind them are named in the opening, the three ahead are the moves, each renamed by what it does. The environment ladder stands (Loudon, 2026-09-25): proofs can be in any tool, and the Ableton, Max, Gen~ and RNBO builds are the steward's to make and demo as that skill grows. Project-wide decisions became Standing Orders; the session choices and the 2026-06-05 step-and-show grants went to [[Shepard Tone Synthesizer — spec — Loudon Live sessions]].
<sub>`plan-2026-09-25T20-51-08-04-00` · plan agreed · agreed 2026-09-25T20:51:08-04:00 · carried over by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="shepard-steward-024" -->
### 2026-06-25 — cycle 8 — Stage 2 is shipped. Lean into Stage 3 (the glide) next, or sit with Stage 2 first?
> still working · six variants + prototype on the board · I lean STAGE-3

The Stage 2 variant batch and interactive prototype are both posted (shepard-steward-023). The staging plan's Stage 3 is The Glide — monophonic portamento across the whole stack, the move that lets Stage 2's discrete steps become a continuous climb and exposes the all-voices-glide-as-a-unit problem from the home entry. It's the natural next reveal and the staging plan already marks it Gen~ territory. I lean into it: next cycle I'd render a Python-only glide-stack prototype (no Gen~ yet — just a portamento-rate sweep showing why glide-per-voice breaks the illusion and glide-as-a-unit preserves it) and post an audition seed. The alternatives are: refine Stage 2 first (the descending pair may want seam-dip tuning if your ear doesn't read endless descent), or detour to draft the paired Octave Equivalence Stage 2 theory section before moving on. This is not blocking — if you don't answer, I'll start Stage 3 next cycle.

**Artifacts:**
- [Shepard Tone Synthesizer — icon.png](Projects/Shepard Tone Synthesizer/Shepard Tone Synthesizer — icon.png)
- [Shepard Tone Synthesizer — hero.png](Projects/Shepard Tone Synthesizer/Shepard Tone Synthesizer — hero.png)
- [2026-06-23-stage2-step-ascent-seed.wav](Projects/Shepard Tone Synthesizer/proofs/2026-06-23-stage2-step-ascent-seed.wav)
<sub>`shepard-steward-024` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="shepard-steward-023" -->
### 2026-06-25 — cycle 8 — Stage 2 variant batch + interactive prototype shipped

Catch-up: I'm the steward for the Shepard Tone Synthesizer, a teaching instrument built as a progressive reveal of the infinite-ascent illusion. Stage 1 (the still drone) shipped earlier; Stage 2 adds discrete pitch-class steps with the wrap seam deliberately lit — Escher's staircase with one edge visible. Last cycle I asked Loudon to audition a 12-second seed (shepard-steward-022); he granted APPROVE — seed reads, render the variant batch and the interactive prototype.

Shipped this cycle: six Stage 2 variants sweeping the two parameters that matter for teaching — step rate (slow 1000ms vs fast 180ms, so the climb-then-wrap rhythm is felt at two tempos) and step size (semitone, whole tone, minor third), plus the descending pair (semitone and whole-tone falls — the Risset-style endless descent the home entry's open question #5 gestures at). The interactive HTML prototype is alive: arrow keys step, spacebar toggles auto-step, the canvas renders the nine voices with the audible window in gold and a red flash on the wrap. That prototype is the Stage 2 deliverable in [[Shepard Tone Synthesizer — Staging]] — it carries the session.

What I couldn't verify this cycle: I rendered but did not listen — the perceptual claim that the descending variants read as endless descent (vs. just falling drone fragments) rests on math and the prior seed's APPROVE, not my own ear. If the descending pair reads weakly, the seam-dip parameter may need tuning. Stage 3 (the glide — monophonic portamento across the whole stack) is the obvious next move; I'll lean into it next cycle unless redirected.

**Artifacts:**
- [rate variant — 1000 ms per step; the climb breathes; the wrap is unmissable.](Projects/Shepard Tone Synthesizer/proofs/2026-06-25-stage2-rate-slow-1000ms.wav)
- [rate variant — 180 ms per step; the staircase blurs toward a glissando but stays discrete.](Projects/Shepard Tone Synthesizer/proofs/2026-06-25-stage2-rate-fast-180ms.wav)
- [step-size variant — whole tones; the climb arrives faster and the modal color shifts.](Projects/Shepard Tone Synthesizer/proofs/2026-06-25-stage2-step-wholetone-2st.wav)
- [step-size variant — minor thirds; four steps per octave, the diminished outline shows through.](Projects/Shepard Tone Synthesizer/proofs/2026-06-25-stage2-step-minorthird-3st.wav)
- [descending — the Risset move; same recipe, sign flipped.](Projects/Shepard Tone Synthesizer/proofs/2026-06-25-stage2-descending-semitone.wav)
- [descending — whole-tone fall; arrives faster, seam exposed at the bottom edge.](Projects/Shepard Tone Synthesizer/proofs/2026-06-25-stage2-descending-wholetone.wav)
- [Stage 2 interactive prototype — arrow keys step, spacebar auto-steps, wrap seam flashes red.](Projects/Shepard Tone Synthesizer/session-2-interactive.html)
- [renderer — render_stage2() drove the whole batch; parameters in ShepardStage2Params.](Projects/Shepard Tone Synthesizer/shepard_synth.py)
<sub>`shepard-steward-023` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="shepard-steward-022" -->
### 2026-06-23 — cycle 7 — Does the Stage 2 seed read as endless ascent with the seam clearly heard at each wrap?
> paused on your ears · 12s seed rendered · steward leans APPROVE

Shepard Tone Synthesizer · Stage 2 (`The Mechanism`). Stage 1 (static drone) shipped; cycle 6 finished the drone batch. This cycle added the Stage 2 ascent renderer with the grants you already gave (ASCENT-FIRST + STEP-AND-SHOW): chromatic semitone steps, fixed envelope, 60 ms seam dip on every wrap. The seed is 24 steps × 0.5 s = 12 s starting at C, so the wrap seams land near 6 s and 12 s. Before I render variants (step size, step duration, descending counterpart) or build the Stage 2 browser prototype on top of these parameters, I want your ears on the seed. APPROVE greenlights the variant batch + HTML prototype. ADJUST — name the parameter that is off (step rate, seam dip depth/length, envelope sigma) and I re-audition. REJECT — wrong framing; redirect.

**Artifacts:**
- [Stage 2 seed (12 s) — chromatic ascent, two exposed wrap seams.](Projects/Shepard Tone Synthesizer/proofs/2026-06-23-stage2-step-ascent-seed.wav)
- [session-2-interactive.html](Projects/Shepard Tone Synthesizer/session-2-interactive.html)
<sub>`shepard-steward-022` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="shepard-steward-021" -->
### 2026-06-23 — cycle 7 — Stage 2 audition seed — discrete-step ascent with exposed wrap seam

Stage 2 (`The Mechanism`) now has a renderer. `render_stage2()` walks the pitch class up one semitone every 0.5 s for 24 steps (two full chromatic cycles), holding the Stage 1 Gaussian-in-log2 envelope fixed. STEP-AND-SHOW is implemented as a 60 ms amplitude dip applied to the start of every segment where the pitch class wraps past 11 back to 0 — the Escher seam, momentarily lit. Twelve-second audition seed rendered. The full batch (parameter-sweep variants, longer durations, descending counterpart, Stage 2 HTML prototype mirroring `session-1-interactive.html`) is gated on your ear: I want APPROVE before I commit any more renders or build the browser visualization on top of these parameters.

**Artifacts:**
- [Stage 2 seed: chromatic step ascent, two wrap seams briefly exposed (~6 s and ~12 s).](Projects/Shepard Tone Synthesizer/proofs/2026-06-23-stage2-step-ascent-seed.wav)
- [render_stage2() — discrete-step ascent + seam dip.](Projects/Shepard Tone Synthesizer/shepard_synth.py)
<sub>`shepard-steward-021` · PROOF on WEAVE</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
