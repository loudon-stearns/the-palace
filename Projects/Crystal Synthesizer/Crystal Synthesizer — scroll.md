---
title: "Crystal Synthesizer — scroll"
born: 2026-09-23
links:
  - target: "[[Crystal Synthesizer]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Crystal Synthesizer's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Crystal Synthesizer — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Crystal Synthesizer]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-10-24T15:26:53.462Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** fruiting · **Steward:** cycle 13 · last ran 2026-10-24 (today)
- **Plan:** agreed 2026-09-26 (28 days ago) · 6 made things since · **a proposed revision is waiting on you**
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-24 (today) — Rewrite my plan around the VST you asked for: ringing crystal plugin first, then real line widths, then the full prism? (`crystal-synth-steward-032`)
- **Last commit touching this project:** 2026-10-21 `ca454ba2` — edit(nine steward scrolls): a standing order on Loudon's yes of 2026-10-21: make it a product, a VST prototype on the VST Template with a CRT visualizer drawn from the instrument's own metaphor; Max work stays set aside, perhaps later as teaching tools
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 1 run on 1 day, counted from the ledger's run lines
- **Last run:** 2026-10-24 — cycle 13 · proposed item 1 for canon
- **Owed in the ledger:** nothing
- **Proposed for canon:** 1 — item 1; waiting on Loudon's review, and the page has not changed
- **Latest lesson:** item 1, from cycle 13 — 2026-10-24 — [[Crystal Synthesizer — tuning]]

### Where this stands

Crystal Synthesizer gets its timbre from a crystal's physics rather than from taste: each mineral's phonon modes become the partials. Over the summer every mineral was rendered as a strike. On 2026-10-14 the crystal learned to ring: each mode became a resonator whose ring time comes from the mineral's Raman line width, and only diamond turned out to be a bell. On 2026-10-21 you said to make it a product, a VST to play in Live. This cycle I ported the ringing crystal into the VST Template's shape: a numpy sketch, the C++ Algorithm.h the template builds, and the face in the template's own editor. Two optical properties the summer proofs rendered as separate files are now knobs. Axis angle is…

### Left rough, again and again

_What the trail's left-rough notes keep saying, oldest first, in its latest words._

- **rough since cycle 10:** Nobody has listened to the take or played the face yet. _(in 4 notes, the latest cycle 13)_
- **rough since cycle 12:** Most line widths are still my estimates. _(in 2 notes, the latest cycle 13)_

### Open asks

- `crystal-synth-steward-032` — proposed plan revision: the plan becomes the VST · posted 2026-10-24 · options: adopt · keep

### Answered, not yet consumed

_None._

### Decided

- `crystal-synth-steward-029` — H90 to H9000 or plugin → GRANTED — option_id=keep (2026-10-15)
- `crystal-synth-steward-021` — directional_decision → GRANTED — option_id=FILL-PALETTE (2026-06-25)
- `crystal-synth-steward-018` — directional_decision → GRANTED — option_id=RENDER-LABRADORITE; notes: "make a really nice html menu of the proofs and what we are teaching, use accurate visuals and the audio examples." (2026-06-25)

### Runs

- 2026-10-24 — cycle 13 · proposed item 1 for canon

### Owed

_Nothing owed._

### Proposed for canon

_Changes the steward wants in the house, kept in its tuning ledger until Loudon's review. Its cycles work as if they hold; the pages have not changed._

- **1.** 2026-10-24 · [[Crystal Synthesizer]] · § Forward Vectors, first bullet (the Gen~ oscillator bank) — Max work is set aside and the Gen~ bullet points at a path the standing order of 2026-10-21 replaced.

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
**Where this is going.** An instrument whose timbre is chosen by crystal physics rather than by taste, built in five moves, each one testing a prediction the one before it made. Any move can happen in public as a [[Loudon Live]] build. The predictions have already been heard as renders: calcite against quartz, diamond's dispersion, beryl's two directions, diamond against labradorite, and a strike for every other mineral in the palette, all on the proofs menu. Next comes the instrument that lets anyone play them.

**The moves ahead**

1. **Make a playable crystal in Max.** A monophonic Gen~ partial bank with the seven crystal systems on a selector and an envelope, so the timbre each lattice predicts can be played, not only rendered. Its April session design is archived in [[Crystal Synthesizer — spec — Loudon Live sessions]].
2. **Take it on the road.** Make it polyphonic, wrap it in RNBO, export it to the Eventide H90, and open the Faust path: one structure carried across four materials, the way one crystal symmetry shapes both its light and its sound.
3. **Let the crystal ring.** Each phonon mode becomes a resonant filter whose Q comes from the mode's lifetime, struck by an impulse, so decay becomes something the physics sets. The interface starts in earnest here, with the open question of what gesture "strikes" a crystal.
4. **Build the prism in time.** A dispersion filter from the real phonon dispersion relation, so frequencies arrive at different times the way a prism spreads colors in space, shipped as a VST whose interface shows the crystal. It wants its own interface design session first.
5. **Hear a real mineral** (stretch). Load a chosen mineral's measured structure from the Crystallography Open Database and play the sound it makes. This is the ground truth that confirms or corrects what the first move predicted. It may need a physics collaborator.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
- **Max work is paused until we have Max patching standards** (Loudon, 2026-10-16). Make no new Max patcher, gen~ or RNBO codebox, or Max for Live device, and don't edit the ones already made. Carry the Max moves in other tools meanwhile, and write down what each patch will need. This holds over anything below and over the Plan until Loudon lifts it.

Decided with Loudon when the Loudon Live arc was designed (April 2026), and seeded here once from the retired staging file on 2026-09-25:

- **Build in Gen~ inside RNBO** — Gen~ for the sound, RNBO for portability.
- **Hypothesis-testing throughout.** A timbral description is a prediction, not a fact; the instrument is how we check it.
- **A session is about 70% making, 30% framing**, and the framing is led by an HTML piece, not a lecture.
- **The cross-domain anchor is "one structure, many projections"**: the same phonon mode ratios travel from Gen~ to RNBO to the H90 to Faust, as one crystal symmetry shapes both its optics and its acoustics.
- **The interface grows move by move**: functional, then portable, then serious, then visual, then physical.
- **The audience is autodidact polymaths**: producers fluent in a DAW, with a maker's sensibility and no physics required.

**2026-10-21 — make it a product: a VST to play in Ableton.** Your next work is a usable VST prototype built with the [[VST Template]] system, something Loudon can play in Live. Keep the controls in the template's interface. The centre of the face is a "CRT" holding a visualizer of your own: beautiful, 3D welcome, drawn deeply from this instrument's metaphor or what is unique about it, never a generic scope. Get playful; make it uniquely weird and stunning. Max work stays set aside: your Max, RNBO and Max for Live files wait, and may come back later as teaching tools; the product comes first. Until the template has its CRT and can build a plugin inside your bundle, port the sound to the template's sketch-and-Algorithm shape in your workshop and sketch the visualizer as a web page there, fed by the values the plugin will stream. Propose the change to your Plan as a plan_revision with what you made. — Loudon: "lets make them products now."
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="crystal-synth-steward-032" -->
### 2026-10-24 — cycle 13 — Rewrite my plan around the VST you asked for: ringing crystal plugin first, then real line widths, then the full prism?
> still working · plugin ported, waiting on the template · steward leans adopt

You agreed my plan in September, and it still runs through Max: a Gen~ instrument, then RNBO and the H90. On 2026-10-21 you set Max aside and asked for a product, a VST to play in Live, and asked me to propose a new plan alongside what I made. Today I made it. The ringing crystal is ported to the template's shape, it matches its reference to float rounding, and its face and visualizer work in the template's editor. The revised plan keeps my two later moves, the prism in time and a real mineral from the crystal database. It folds 'let the crystal ring' into the plugin and keeps the Max, RNBO and H90 work as teaching tools for later. I'll keep building whichever way you answer.

**Artifacts:**
- [the evidence: the plugin's face, playable.](Projects/Crystal Synthesizer/crystal-synthesizer-face.html)
- [what the ported engine sounds like, five minerals.](Projects/Crystal Synthesizer/crystal-synthesizer-take.wav)
- [session-1-interactive.html](Projects/Crystal Synthesizer/session-1-interactive.html)
- [ring_tour.svg](Projects/Crystal Synthesizer/crystal-rings/ring_tour.svg)
- [hardness.wav](Projects/Crystal Synthesizer/crystal-rings/hardness.wav)
- [strike_vs_ring.wav](Projects/Crystal Synthesizer/crystal-rings/strike_vs_ring.wav)
- [ring_tour.wav](Projects/Crystal Synthesizer/crystal-rings/ring_tour.wav)
<sub>`crystal-synth-steward-032` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="crystal-synth-steward-031" -->
### 2026-10-24 — cycle 13 — I'm a plugin now, in the template's shape: eight struck crystals with the axis angle and fire on the heroes, and light through fog in the CRT.
> shipped · three engines agree to 6e-8 · waiting on the template's build · steward leans adopt the VST plan

The face is [crystal-synthesizer-face.html](Projects/Crystal Synthesizer/crystal-synthesizer-face.html). Press 'sound on' and it plays a demo walking six minerals, or you can play it from keys A to K or a MIDI keyboard. The page sits in the template's own Drafting Table editor, with the CRT fed once a frame by the JavaScript engine, the way the plugin's live feed will feed it.

What changed from the rings device: eight voices in one engine, stereo, and two knobs taken from the optics.

- **Axis angle** turns the crystal against the light. Every mode becomes an ordinary and an extraordinary resonator, and the extraordinary one is tuned up by the mineral's real birefringence times sin² of the angle. Along the optic axis the two agree, and across it they part. Ruby's rays are 13.8 cents apart at the physics setting, which comes out as a slow natural chorus. Diamond and fluorite are cubic, so they stay one ray at every angle. In the take, diamond's left and right channels are identical (no side signal at all), which is what the optics predicts.
- **Fire** is dispersion as time. Each mode's strike arrives later by fire × (the mineral's dispersion ÷ diamond's) × log₂ of its ratio, so higher modes land later. Diamond fans widest, fluorite barely at all.

In the CRT, the unit cell is drawn to its real cell lengths and angles and turns slowly in fog. A white beam comes in from the left, and one colored ray per phonon mode goes out to the right, lit by that mode's energy. With fire up, a strike lights the fan red first and violet last. When the crystal is birefringent, the extraordinary rays leave beside the ordinary ones and a dashed ghost of the cell stands beside it. The dashed line is the optic axis, tilted by the Axis angle knob. Below the cell are the chemical formula, the space group, and the numbers the sound is made from.

The check: check_engine.py runs five paths through the sketch, the C++ engine and the JavaScript engine. Each path exercises one part: a ruby chord, diamond with a wide fire, zircon turning while it rings, labradorite with knobs sweeping, and twelve notes into eight voices. All five match to 3–6 × 10⁻⁸ of peak, and every probe to 10⁻¹⁵. The twelve controls fit the editor at 980×640, 1100×700 and 1800×1100.

**Artifacts:**
- [the whole face: the template's editor with the crystal in the CRT. Press sound on, play keys A–K or MIDI.](Projects/Crystal Synthesizer/crystal-synthesizer-face.html)
- [the face on emerald, birefringence ×6: the rainbow fan and the ghost cell.](Projects/Crystal Synthesizer/crystal-synthesizer-face.png)
- [diamond with fire 260 ms: the widest fan, one ray, no ghost.](Projects/Crystal Synthesizer/vst-face/face-diamond.png)
- [ruby, its tall hexagonal cell, rays doubled 13 cents apart.](Projects/Crystal Synthesizer/vst-face/face-ruby.png)
- [labradorite's skewed triclinic box catching its sheen.](Projects/Crystal Synthesizer/vst-face/face-labradorite.png)
- [emerald mid-chord.](Projects/Crystal Synthesizer/vst-face/face-emerald.png)
- [30 s through the C++ engine: ruby turning, diamond's fire, zircon's split, labradorite, emerald.](Projects/Crystal Synthesizer/crystal-synthesizer-take.wav)
- [what the plugin is, the check, the CRT contract, and what to do when the template is ready.](Projects/Crystal Synthesizer/plugin/README.md)
- [name, code Crys, instrument, CRT on.](Projects/Crystal Synthesizer/plugin/plugin.json)
- [the port: 12 parameters, stereo, 34 probes.](Projects/Crystal Synthesizer/plugin/src/Algorithm.h)
- [the numpy sketch, the reference.](Projects/Crystal Synthesizer/plugin/reference/sketch.py)
- [five test paths, each exercising one term.](Projects/Crystal Synthesizer/plugin/reference/paths.py)
- [the exact gate: sketch vs C++ vs JavaScript.](Projects/Crystal Synthesizer/plugin/check/check_engine.py)
- [the JUCE-free harness stand-in.](Projects/Crystal Synthesizer/plugin/check/engine_check.cpp)
- [drives the JavaScript engine like the harness.](Projects/Crystal Synthesizer/plugin/check/js_engine.cjs)
- [its launcher.](Projects/Crystal Synthesizer/plugin/check/js_engine.sh)
- [renders the take.](Projects/Crystal Synthesizer/plugin/check/render_take.py)
- [the gate's numbers.](Projects/Crystal Synthesizer/plugin/out/check-report.json)
- [the take's levels.](Projects/Crystal Synthesizer/plugin/out/take-levels.json)
- [light through fog: CrystalScope.mount / frame.](Projects/Crystal Synthesizer/plugin/ui/visualizer.js)
- [the engine in JavaScript, for the face page.](Projects/Crystal Synthesizer/plugin/ui/crystal_engine.js)
- [builds the face and photographs it.](Projects/Crystal Synthesizer/plugin/ui/build_face.py)

_the five minerals in the take, rendered through the C++ engine (six seconds each)_
| moment | what moves | loudness (RMS dB) | side signal (dB) |
| --- | --- | --- | --- |
| ruby turning to its axis | angle 90° → 0°: the pair folds into one | -25.4 | -37.7 |
| diamond with fire | fire 260 ms: a red-to-violet fan per strike | -23.4 | -240 (cubic: one ray, exactly mono) |
| zircon's optics, tetragonal slot | birefringence ×1 → ×16 | -26.3 | -31.1 |
| labradorite | fire 150, lifetime 2 | -32.8 | -47.2 |
| emerald | birefringence ×6, lifetime 4 | -31.2 | -36.1 |

_Changed in the workshop:_ README — the plugin folder's own map: what it is, the check, the CRT feed, the steps once the template can build.
_Proposed for canon:_ Crystal Synthesizer (§ Forward Vectors, first bullet (the Gen~ oscillator bank)) — Max work is set aside and the Gen~ bullet points at a path the standing order of 2026-10-21 replaced.; owed in the tuning ledger until Loudon's review

_Left rough:_ Nobody has listened to the take or played the face yet. It is not a VST yet: the template still can't build a plugin in my folder, so pluginval, auval and Live are untested and the CPU is untimed. Most line widths are still my estimates.

_Next moves named:_ When the template can build in a steward's bundle, run plugin.sh all here, then load Crystal Synthesizer in Live. · Research real room-temperature Raman widths per mode, so each mode gets its own Q instead of one per mineral. · Give Fire its full form: the real phonon dispersion curve as an all-pass stage after the bank, the plan's prism in time.
<sub>`crystal-synth-steward-031` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-adddd283bf" -->
### 2026-10-24 — cycle 13

proposed item 1 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="crystal-synth-steward-029" -->
### 2026-10-14 — cycle 12 — RNBO can export to the Eventide H9000 but not the H90. Should the road move aim at the H9000 or a plugin instead?
> still working · H90 has no RNBO export · steward leans adopt

Catch-up: Crystal Synthesizer is the instrument whose timbre comes from a crystal's physics. Today it became playable, then polyphonic in RNBO, Max for Live and Faust. This cycle it started ringing, with each mode's decay set by the mineral's Raman line width. The plan's second move, taking it on the road, says to export it to the Eventide H90. I checked, and that route doesn't exist yet. Cycling '74 and Eventide ship RNBO export for the H9000 rack. For the H90, Eventide has only said it is 'considering' it, with no commitment. I propose that the hardware leg aims at the H9000 if you can reach one, and otherwise at a VST3/AU plugin from RNBO or Faust, with the H90 kept as a wish for when Eventide supports it. Nothing else in the plan changes. If you keep the plan as it is, the H90 leg just stays open.

**Artifacts:**
- [crystal_chords.wav](Projects/Crystal Synthesizer/crystal-on-the-road/crystal_chords.wav)
- [crystal-block-diagram.svg](Projects/Crystal Synthesizer/crystal-on-the-road/faust/crystal-block-diagram.svg)
<sub>`crystal-synth-steward-029` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="crystal-synth-steward-028" -->
### 2026-10-14 — cycle 12 — The crystal rings now. Each mode is a resonator whose ring time comes from the mineral's Raman line width, and only diamond turns out to be a bell.
> shipped · ringing voice checked in Node, unopened in Max · steward leans find real line widths next

**What I built.** [crystal-ring-voice.codebox](obsidian://open?vault=The%20Palace&file=Projects/Crystal%20Synthesizer/crystal-rings/crystal-ring-voice.codebox) has nine two-pole resonators, one per mode, struck by a raised-cosine pulse. It drops into the same eight-voice RNBO frame as last cycle: [crystal-rings.maxpat](open:Projects/Crystal Synthesizer/crystal-rings/crystal-rings.maxpat) for Max and [Crystal Synthesizer Rings 0.1.amxd](open:Projects/Crystal Synthesizer/crystal-rings/Crystal Synthesizer Rings 0.1.amxd) for Live. The knobs are crystal, hardness (how long the strike pulse is; short is bright), lifetime (multiplies every ring time; 1 is the physics), release and level.

**Why the line width is the right number.** A Raman line's position divided by its width is a Q, and a Q has no units. So it survives the move from terahertz to audio untouched: a mode rings for about Q/π cycles at whatever pitch you play it. Higher modes die sooner in seconds just because they're higher. That replaces the summer's taste rule, where every mode shared one decay knob and got 15% shorter per step up. The sources are in [linewidths.json](obsidian://open?vault=The%20Palace&file=Projects/Crystal%20Synthesizer/crystal-rings/linewidths.json).

**What it says (table).** Diamond (Q 807, measured) rings 16 s to silence at A2. Ruby is a 2.4 s chime. Everything else is gone in about a second. The summer renders gave every mineral the same long ring, and physics doesn't. It also argues with the entry's triclinic prediction. Labradorite was meant to be bell-like and alien. At Q 30, its 17.5× top mode lasts about 5 ms, so it comes out as a dull knock with a bright tick on the front. Amethyst's soft mode, the leftover of quartz's phase change, dies before its neighbours do and only flickers in the attack. You can see all of this in [ring_tour.svg](obsidian://open?vault=The%20Palace&file=Projects/Crystal%20Synthesizer/crystal-rings/ring_tour.svg) and hear it in [ring_tour.wav](open:Projects/Crystal Synthesizer/crystal-rings/ring_tour.wav). [strike_vs_ring.wav](open:Projects/Crystal Synthesizer/crystal-rings/strike_vs_ring.wav) puts the summer strike and the physics ring side by side for each mineral. [hardness.wav](open:Projects/Crystal Synthesizer/crystal-rings/hardness.wav) is one ruby note struck from 0.1 ms to 20 ms.

**Checks** ([check_rings.py](obsidian://open?vault=The%20Palace&file=Projects/Crystal%20Synthesizer/crystal-rings/check_rings.py)). Against a closed-form reference, the codebox matches to 3e-8 while it sounds. The measured ring times land within 0.4% of Q/(πf) for five minerals, 1.1% for diamond and 2.2% for ruby. Twelve notes into eight voices gave four steals and no click. An eight-note cluster peaks at 0.88 at most.

**Off the main line.** RNBO export exists for the Eventide H9000 but not the H90, so the plan's second move can't reach the H90 as written. I've asked about that separately.

**Artifacts:**
- [spectrogram: each mineral struck at A2 then A4 at its physics ring time.](Projects/Crystal Synthesizer/crystal-rings/ring_tour.svg)
- [the tour itself, 33 s.](Projects/Crystal Synthesizer/crystal-rings/ring_tour.wav)
- [per mineral: the summer's additive strike, then the physics ring.](Projects/Crystal Synthesizer/crystal-rings/strike_vs_ring.wav)
- [one ruby A3, struck with a 0.1, 0.5, 2, 5 and 20 ms pulse.](Projects/Crystal Synthesizer/crystal-rings/hardness.wav)
- [the ringing crystal for Max 9: eight voices, crystal menu, five controls.](Projects/Crystal Synthesizer/crystal-rings/crystal-rings.maxpat)
- [the same, as a Max for Live instrument.](Projects/Crystal Synthesizer/crystal-rings/Crystal Synthesizer Rings 0.1.amxd)
- [one voice: nine resonators, Q from the line widths, a raised-cosine strike.](Projects/Crystal Synthesizer/crystal-rings/crystal-ring-voice.codebox)
- [Q per mineral with its source and status (measured, estimated, placeholder).](Projects/Crystal Synthesizer/crystal-rings/linewidths.json)
- [reference match, ring-time check, stealing, headroom, the demos.](Projects/Crystal Synthesizer/crystal-rings/check_rings.py)
- [the numbers from those checks.](Projects/Crystal Synthesizer/crystal-rings/ring-findings.json)
- [eight codebox voices in Node; last cycle's renderer with the controls renamed.](Projects/Crystal Synthesizer/crystal-rings/ring-render.mjs)
- [rebuilds the maxpat and the amxd from the codebox.](Projects/Crystal Synthesizer/crystal-rings/make_ring_patch.py)
- [draws the spectrogram.](Projects/Crystal Synthesizer/crystal-rings/draw_tour.py)
- [what to open, what the physics says, what isn't verified.](Projects/Crystal Synthesizer/crystal-rings/README.md)

_Physics ring times at A2 (lifetime 1)_
| crystal | Q source | Q | cycles to 1/e | to -60 dB at A2 | energy left after 0.5 s |
| --- | --- | --- | --- | --- | --- |
| Diamond | measured | 807 | 257 | 16.1 s | 38% |
| Ruby | estimated | 120 | 38 | 2.4 s | 4.4% |
| Amethyst | measured | 62 | 20 | 1.2 s | 0.3% |
| Topaz | estimated | 58 | 18 | 1.2 s | 0.2% |
| Emerald | estimated | 57 | 18 | 1.1 s | 0.2% |
| Labradorite | estimated | 30 | 10 | 0.6 s | 0.0% |
| Fluorite | measured (powder) | 27 | 9 | 0.5 s | 0.0% |

_Left rough:_ Only two line widths are values I found, diamond's and quartz's 464 line. Fluorite's comes from a powder standard and is probably too wide, and ruby, emerald, topaz, labradorite and the quartz soft mode are my estimates, so 'only diamond is a bell' holds only if the estimates do. Each mineral gives one Q to all of its modes. Nobody has opened the patch or the device. The plan's second move, taking it on the road, still has its H90 and Faust-plugin parts open.

_Next moves named:_ Replace the estimated line widths with measured room-temperature values, one per mode where papers give them (RRUFF spectra are a likely source). That turns 'only diamond is a bell' from an estimate into a measured result. · Open Crystal Synthesizer Rings 0.1.amxd in Live and play Diamond and then Labradorite at lifetime 1 and at 8. Whatever breaks becomes a Gotcha for the RNBO codebox~ smith. · The interface question this move opens: what gesture strikes a crystal? Hardness and velocity are the first two candidates.
<sub>`crystal-synth-steward-028` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="crystal-synth-steward-025" -->
### 2026-10-14 — cycle 11 — The crystal plays chords now: eight voices in RNBO, a Max for Live instrument, and a Faust version. All three match the proofs.
> shipped · unverified in Max and Live · steward leans open-the-amxd-then-H90

**What I built.** [crystal-voice.codebox](obsidian://open?vault=The%20Palace&file=Projects/Crystal%20Synthesizer/crystal-on-the-road/crystal-voice.codebox) is the one-voice codebox with three changes. The controls now come in through inlets, level is applied after the voices are mixed, and each voice reports when it has gone silent so RNBO can hand it to the next note. Eight copies run inside `[p @polyphony 8]`. The knobs sit outside the voices, so the device has one knob called crystal, not eight. [crystal-poly.maxpat](open:Projects/Crystal Synthesizer/crystal-on-the-road/crystal-poly.maxpat) is for Max. [Crystal Synthesizer 0.1.amxd](open:Projects/Crystal Synthesizer/crystal-on-the-road/Crystal Synthesizer 0.1.amxd) is the same RNBO patch as a Live instrument, with a crystal menu and five dials. Its file header is copied from Live 12's own Max Instrument.

**The Faust version.** [crystal.dsp](obsidian://open?vault=The%20Palace&file=Projects/Crystal%20Synthesizer/crystal-on-the-road/faust/crystal.dsp) is the same strike written a second way. I compiled it to a small renderer and compared it with the proofs: the largest difference is 5e-8. Then `faust2rnbo` turned the same file into a second, independent 8-voice RNBO patch, [crystal-faust-rnbo.maxpat](open:Projects/Crystal Synthesizer/crystal-on-the-road/faust/crystal-faust-rnbo.maxpat). When you open them, the two RNBO routes should sound the same.

**What the checks found** ([check_poly.py](obsidian://open?vault=The%20Palace&file=Projects/Crystal%20Synthesizer/crystal-on-the-road/check_poly.py)). The bug from last cycle is gone: hold A2, add E3, lift A2, and E3 keeps ringing. The one-voice patch cut E3 instead. I sent twelve notes into eight voices. Four voices were stolen without a click, and every voice muted once it went quiet. Eight full-velocity notes peak at 0.93.

**One surprise.** Playing chords asks a question the single strikes couldn't: which crystals can take a chord? I scored the same A-minor triad on each mineral for how much the notes clash with each other, using Sethares' roughness model (table). Labradorite, which we predicted would be the most alien lattice, makes the smoothest chord, smoother even than a plain harmonic tone. Its partials are spread so wide that the notes rarely collide. Ruby, Fluorite and Diamond pack their partials tightly, so they fight. Hear it in [crystal_chords.wav](open:Projects/Crystal Synthesizer/crystal-on-the-road/crystal_chords.wav): A minor, F, C, G on each palette mineral in turn. This is the model's prediction. Your ears are the test.

**Artifacts:**
- [A minor, F, C, G on each palette mineral in turn, eight voices, 50 s.](Projects/Crystal Synthesizer/crystal-on-the-road/crystal_chords.wav)
- [the Max for Live instrument: crystal menu, five dials, eight voices.](Projects/Crystal Synthesizer/crystal-on-the-road/Crystal Synthesizer 0.1.amxd)
- [the polyphonic patch for Max 9: kslider or a MIDI keyboard.](Projects/Crystal Synthesizer/crystal-on-the-road/crystal-poly.maxpat)
- [one voice: the one-voice codebox with inlets and a silence flag.](Projects/Crystal Synthesizer/crystal-on-the-road/crystal-voice.codebox)
- [the same voice in Faust; matches the proofs to 5e-8.](Projects/Crystal Synthesizer/crystal-on-the-road/faust/crystal.dsp)
- [a second RNBO patch, generated from crystal.dsp by faust2rnbo, 8 voices.](Projects/Crystal Synthesizer/crystal-on-the-road/faust/crystal-faust-rnbo.maxpat)
- [Faust's block diagram of the voice (top level).](Projects/Crystal Synthesizer/crystal-on-the-road/faust/crystal-block-diagram.svg)
- [the small renderer the Faust check compiles.](Projects/Crystal Synthesizer/crystal-on-the-road/faust/render-arch.cpp)
- [compares the Faust voice with the proofs and the codebox.](Projects/Crystal Synthesizer/crystal-on-the-road/faust/check_faust.py)
- [the numbers from that check.](Projects/Crystal Synthesizer/crystal-on-the-road/faust/faust-findings.json)
- [the polyphony checks: match, note stack, stealing, headroom, chord clash.](Projects/Crystal Synthesizer/crystal-on-the-road/check_poly.py)
- [runs eight codebox voices in Node with RNBO-style voice allocation.](Projects/Crystal Synthesizer/crystal-on-the-road/poly-render.mjs)
- [the numbers from the polyphony checks.](Projects/Crystal Synthesizer/crystal-on-the-road/poly-findings.json)
- [rebuilds the maxpat and the amxd from the codebox.](Projects/Crystal Synthesizer/crystal-on-the-road/make_poly_patch.py)
- [what to open, what to listen for, what isn't verified, how to rebuild.](Projects/Crystal Synthesizer/crystal-on-the-road/README.md)

_How much an A-minor triad (A2 C3 E3) clashes between its notes, Sethares roughness model, partial amplitudes 0.7^k. Higher means more clash._
| crystal | system | clash between notes | open fifth |
| --- | --- | --- | --- |
| Labradorite | triclinic | 1.13 | 0.35 |
| harmonic tone (yardstick) | — | 1.36 | 0.31 |
| Amethyst | trigonal | 2.05 | 0.57 |
| Topaz | orthorhombic | 2.22 | 0.62 |
| Diamond | cubic | 2.88 | 0.62 |
| Emerald | hexagonal | 2.95 | 0.81 |
| Fluorite | cubic | 3.34 | 0.80 |
| Ruby | trigonal | 4.17 | 0.98 |

_Left rough:_ Nobody has opened the patch, the Live device or the Faust-made patch, so all three are unverified. My Node model of RNBO's voice allocation may pick voices in a different order than RNBO does. A released voice stays busy until it drops below -80 dB, so a long release holds voices for a while. The H90 leg hasn't started. The chord-clash ranking is a model's prediction, not something anyone has heard.

_Next moves named:_ Open Crystal Synthesizer 0.1.amxd on a MIDI track in Live 12. Play the same chord on Ruby, then Labradorite, and see whether your ears agree with the clash ranking. Whatever breaks becomes the RNBO smith's first Gotcha. · Finish taking it on the road: look for a real export route to the Eventide H90, and build the Faust version as a plugin. · Then the plan's third move, letting the crystal ring: each phonon mode becomes a resonant filter that a strike excites, with a decay set by the mode's lifetime.
<sub>`crystal-synth-steward-025` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="crystal-synth-steward-023" -->
### 2026-10-14 — cycle 10 — The crystal is playable: an RNBO patch with nine crystals on a menu and a keyboard. In Node it matches the proof renders sample for sample.
> shipped · unverified in Max · steward leans open-it-then-go-polyphonic

What I built: [the codebox](obsidian://open?vault=The%20Palace&file=Projects/Crystal%20Synthesizer/playable-crystal/crystal-bank.codebox) and [the patch](open:Projects/Crystal Synthesizer/playable-crystal/crystal-bank.maxpat). The menu has nine slots, ordered from most to least symmetric. Seven are the measured palette minerals. Two, tetragonal and monoclinic, still use the April hypothesis tables, so every one of the seven crystal systems has a slot. The knobs are attack, decay, release, rolloff and level, and each is an RNBO parameter that will become a knob when this exports.

I did not write a new engine. The codebox reuses the proofs' strike: the same phase seeds, the same 0.70 drop in loudness from one mode to the next, and the same rule that higher modes die faster. So the instrument tests the same predictions the renders did. To check that, I ran the codebox in Node, using the harness Blood Compressor built today, against the proofs' own code imported directly. The table shows the result. The only additions are what a keyboard needs: a gate, a release, velocity, and a menu that is read while the note sounds. Change crystals while a note rings and the strike keeps ringing on the new lattice without a click.

One fix came from measuring. The first draft cut a ringing note to zero when you struck a new one, which is a click. It now fades the old note over 3 ms first. The largest jump between samples at a restrike is 0.054 of peak, against 0.109 anywhere else.

To hear it in place: [crystal_keyboard_tour.wav](open:Projects/Crystal Synthesizer/playable-crystal/crystal_keyboard_tour.wav) plays A2 C3 E3 A3 and then a held A2 on all nine slots. [one_strike_nine_lattices.wav](open:Projects/Crystal Synthesizer/playable-crystal/one_strike_nine_lattices.wav) is one strike while the menu moves every two seconds, and the spectrogram shows the partials rearranging under the same ring. In Max, listen for ruby's slow 4 Hz beating, fluorite's lone high mode after a gap, and labradorite never settling into a chord.

I chose nine slots, seven minerals plus two hypotheses, over the April plan's seven abstract lattice tables. That keeps the instrument tied to what was actually rendered and heard. The alternative is only seven slots, one per system, all hypothetical. If you'd rather have that, it's a one-line change in the ratio table.

**Artifacts:**
- [the playable patch: keyboard, nine-crystal menu, five knobs, rnbo~ inside. Open in Max 9.](Projects/Crystal Synthesizer/playable-crystal/crystal-bank.maxpat)
- [the DSP: one held note equals the proofs' strike at the default knobs.](Projects/Crystal Synthesizer/playable-crystal/crystal-bank.codebox)
- [the same short phrase on all nine slots, 40 s.](Projects/Crystal Synthesizer/playable-crystal/crystal_keyboard_tour.wav)
- [one A2 strike while the menu steps through all nine crystals, 19 s.](Projects/Crystal Synthesizer/playable-crystal/one_strike_nine_lattices.wav)
- [spectrogram of that sweep: the partials rearranging under one ring.](Projects/Crystal Synthesizer/playable-crystal/one_strike_nine_lattices.svg)
- [what to open, what to play, what to listen for, and what isn't verified.](Projects/Crystal Synthesizer/playable-crystal/README.md)
- [the null test and demo renders, run in Node.](Projects/Crystal Synthesizer/playable-crystal/check_crystal_bank.py)
- [the numbers from that check.](Projects/Crystal Synthesizer/playable-crystal/findings.json)
- [plays the codebox from a score in Node.](Projects/Crystal Synthesizer/playable-crystal/render-score.mjs)
- [the codebox harness, copied unchanged from Blood Compressor.](Projects/Crystal Synthesizer/playable-crystal/codebox-harness.mjs)
- [rebuilds the maxpat from the codebox.](Projects/Crystal Synthesizer/playable-crystal/make_patch.py)
- [draws the spectrogram.](Projects/Crystal Synthesizer/playable-crystal/draw_sweep.py)

_Null test: the codebox (in Node) against the proofs' additive_strike(), A2 held 6 s, both peak-normalised_
| mineral | system | largest difference |
| --- | --- | --- |
| Diamond | cubic Fd-3m | 4.7e-08 |
| Fluorite | cubic Fm-3m | 5.2e-08 |
| Emerald | hexagonal P6/mcc | 4.8e-08 |
| Ruby | trigonal R-3c | 4.1e-08 |
| Amethyst | trigonal P3121 | 5.0e-08 |
| Topaz | orthorhombic Pbnm | 3.6e-08 |
| Labradorite | triclinic C-1 | 5.1e-08 |

_Left rough:_ Nobody has opened the patch in Max, so it should compile but hasn't been heard through RNBO. Note handling is single-voice and last-note-wins with no note stack, so lifting an older key while a newer one is held releases the newer one. Obsidian, the non-crystal, still has no voice.

_Next moves named:_ Open crystal-bank.maxpat in Max and play it. Whatever breaks becomes the first Gotcha for the RNBO codebox~ smith. · Start the plan's second move, taking it on the road: a polyphonic version of the same codebox, checked in Node the same way, then exported to Max for Live.
<sub>`crystal-synth-steward-023` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-26T09-21-34-04-00" -->
### 2026-09-26 — Plan revised: the moves are builds, not sessions

Loudon, 2026-09-26: Loudon Live is no longer a scaffolded curriculum of staged sessions; it is his whole public self, building slowly, and any move can happen in public as a build. The moves themselves are unchanged. Only the framing that made each move a session was loosened, and the April session designs were archived (still readable at the same link).

The plan it replaced said:

> built in five moves that are also five [[Loudon Live]] sessions, each one testing a prediction the one before it made.
>
> The first session; its design is in [[Crystal Synthesizer — spec — Loudon Live sessions]].
<sub>`plan-2026-09-26T09-21-34-04-00` · plan revised · agreed 2026-09-26T09:21:34-04:00 · written by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-2026-09-25T20-42-23-04-00" -->
### 2026-09-25 — Plan agreed: carried over from the retired staging file

Carried over on 2026-09-25 from the retired staging file, when Loudon asked that every plan fold into its scroll (SCHEMA v1.25). The arc is the one agreed with him in April 2026, unchanged in substance: each stage is renamed by what it does, and where the work stands is written in. The staging file's decisions became Standing Orders; its session designs became [[Crystal Synthesizer — spec — Loudon Live sessions]].
<sub>`plan-2026-09-25T20-42-23-04-00` · plan agreed · agreed 2026-09-25T20:42:23-04:00 · carried over by an elder on Loudon's word</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="crystal-synth-steward-020" -->
### 2026-06-25 — cycle 8 — Hypothesis arc closes — diamond and labradorite, same synth, same strike, only the symmetry changes.
> shipped · triclinic A/B render + a proofs menu indexing all four crystal proofs to date.

Catch-up — Crystal Synthesizer is a project that makes the optical properties of crystals audible by deriving partials from real phonon mode structure. Cycle 6 produced the diamond dispersion proof (a click smeared by an isotropic cubic lattice). Cycle 7 produced the anisotropic beryl proof (one crystal, two dispersion laws, depending on direction). Both confirmed by ear. The home entry's load-bearing claim, though, is more general than dispersion: it says symmetry itself determines timbral character. The cleanest test of that is the negative pole — triclinic labradorite, the lowest-symmetry crystal in the mineral palette, where every partial is unique and nothing organises them. This cycle's grant was to render that test before any Gen~ work.

What shipped — a pure additive synth (no filters, no dispersion, only sinusoids) struck on A2 and decayed with one envelope. Two voicings of the same engine. Diamond gets 5 partials packed into r_n 1.00–1.65, spanning less than one octave. Labradorite gets 8 partials spanning r_n 1.00–17.5, a 10.6× wider spread covering more than four octaves with no symmetry-related intervals. The diamond strike sits tight, bright, compressed. The labradorite strike rings bell-like but the bell is one you have never heard, because the partials never fold back into a chord.

The proofs-menu.html is the teaching surface — every proof to date in one place: calcite-vs-quartz (paired-partial beating, the haiku claim), the diamond dispersion filter, the beryl birefringent pair, and now the diamond/labradorite symmetry pole comparison. Inline players, partial tables, SVG of the partial spectrum, a final table that lays the hypothesis arc out as four named claims and their verdicts. The instrument it points to is Stage 1 of the staging arc.

**Artifacts:**
- [the proofs menu — every audio proof and teaching note in one place.](Projects/Crystal Synthesizer/proofs-menu.html)
- [diamond · 5 partials packed into 0.72 octaves · the cubic signature.](Projects/Crystal Synthesizer/triclinic-proof/diamond_strike.wav)
- [labradorite · 8 partials spread across 4.13 octaves · the triclinic signature.](Projects/Crystal Synthesizer/triclinic-proof/labradorite_strike.wav)
- [diamond then labradorite back to back · only the partial ratios differ.](Projects/Crystal Synthesizer/triclinic-proof/symmetry_arc_AB.wav)
- [diamond partial spectrum on a log frequency axis.](Projects/Crystal Synthesizer/triclinic-proof/diamond_strike.svg)
- [labradorite partial spectrum on a log frequency axis.](Projects/Crystal Synthesizer/triclinic-proof/labradorite_strike.svg)
- [the render script — numpy-only additive synth, partials straight from the Crystal Sonification Reference.](Projects/Crystal Synthesizer/triclinic-proof/render_labradorite.py)

_the symmetry signature, measured_
| crystal | system | unique partials | ratio range | span |
| --- | --- | --- | --- | --- |
| Diamond | cubic Fd-3m | 5 | 1.00 → 1.65 | 0.72 octaves |
| Labradorite | triclinic C-1 | 8 | 1.00 → 17.5 | 4.13 octaves |
<sub>`crystal-synth-steward-020` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="crystal-synth-steward-018" -->
### 2026-06-23 — cycle 7 — Three proof batches in; which way does Stage 1 ripen — Gen~ patch, or one more hypothesis test?
> still working · steward leans BUILD-GENPATCH · non-blocking

Stage 1's hypothesis arc has three of seven Bravais systems audibly tested (cubic implied via baseline, hexagonal via beryl, the dispersion behavior). The arc could ripen two ways: (a) leave hypothesis testing and start the actual Gen~ monophonic patch (Stage 1's named deliverable per the staging doc — a playable Max instrument, not a render farm), or (b) render one more decisive proof — triclinic labradorite, the most uncertain prediction ("chaotic, bell-like, unresolvable into intervals") — before committing to the patch. I lean (a): the patch is the actual Stage 1 product; further auditions are diminishing returns and the labradorite hypothesis is better tested *in* the instrument once we have one. But the triclinic case is the most scientifically interesting one, and rendering it now would close the prediction set before Gen~ work begins.

**Artifacts:**
- [Crystal Synthesizer — icon.png](Projects/Crystal Synthesizer/Crystal Synthesizer — icon.png)
- [Crystal Synthesizer — hero.png](Projects/Crystal Synthesizer/Crystal Synthesizer — hero.png)
- [beryl_birefringence_plot.html](Projects/Crystal Synthesizer/dispersion-filter/beryl_birefringence_plot.html)
- [beryl_birefringent_pair.wav](Projects/Crystal Synthesizer/dispersion-filter/beryl_birefringent_pair.wav)
- [beryl_basal_plane.wav](Projects/Crystal Synthesizer/dispersion-filter/beryl_basal_plane.wav)
- [beryl_c_axis.wav](Projects/Crystal Synthesizer/dispersion-filter/beryl_c_axis.wav)
- [beryl_dry_click.wav](Projects/Crystal Synthesizer/dispersion-filter/beryl_dry_click.wav)
<sub>`crystal-synth-steward-018` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="crystal-synth-steward-017" -->
### 2026-06-23 — cycle 7 — Stage 1 proof arc consolidated — cubic partial, birefringent pair, anisotropic dispersion, ready for your ear.
> still working · 3 proof batches rendered across cycles 4–6 · hero+icon landed

Spinning up. HOME: Crystal Synthesizer. Catch-up: this project is the synthesizer whose timbre is chosen by crystal physics, not by design. Stage 1 (monophonic Gen~ partial bank) is the proof-of-hypothesis stage — does each Bravais system actually sound the way we predicted? Cycles 4–6 rendered three independent proof batches: a birefringence pair (ordinary vs extraordinary axis), an anisotropic dispersion render for beryl (c-axis vs basal plane), and a dispersion-filter click sweep. Loudon's hand-drawn hero and icon arrived 2026-06-22 (commit 0590acd) — the project now has visual identity. Cycle 7 ships the consolidated audition: the four artifacts that, heard together, tell the Stage 1 story. Nothing blocking; this is the made thing.

**Artifacts:**
- [the project's hand-drawn identity (Haeckel-engraving idiom).](Crystal Synthesizer — hero.png)
- [birefringence arc — ordinary→extraordinary→sum (the doubled shimmer hypothesis).](Projects/Crystal Synthesizer/birefringence-proof/05_birefringence_arc.wav)
- [beryl c-axis vs basal plane — the same click, two propagation directions.](Projects/Crystal Synthesizer/dispersion-filter/beryl_birefringent_pair.wav)
- [dispersion sweep — frequencies arrive at different times, the prism-in-time.](Projects/Crystal Synthesizer/dispersion-filter/03_dispersion_sweep.wav)
- [beryl dispersion curves — ordinary vs extraordinary, visualized.](Projects/Crystal Synthesizer/dispersion-filter/beryl_birefringence_plot.html)
<sub>`crystal-synth-steward-017` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
