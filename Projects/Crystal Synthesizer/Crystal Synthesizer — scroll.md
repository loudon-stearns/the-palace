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

> _Regenerated 2026-10-14T11:49:58.401Z from the board, the steward's runtime, the entry's frontmatter and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** fruiting · **Steward:** cycle 10 · last ran 2026-10-14 (today)
- **Plan:** agreed 2026-09-26 (18 days ago) · 1 made thing since
- **Waiting on you:** nothing
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-10-14 (today) — The crystal is playable: an RNBO patch with nine crystals on a menu and a keyboard. In Node it matches the proof renders sample for sample. (`crystal-synth-steward-023`)
- **Last commit touching this project:** 2026-09-26 `5b8a1564` — ops(frontmatter): strip retired activation_count/last_activated from 244 entries — v1.26
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.

### Where this stands

Crystal Synthesizer gets its timbre from a crystal's physics rather than from taste: each mineral's phonon modes become the partials. Over the summer every prediction was rendered and heard as a strike: calcite against quartz, diamond's dispersion, beryl's two directions, diamond against labradorite, then ruby, amethyst, fluorite, emerald and topaz. They are all on the proofs menu. The plan's first move is to stop only rendering crystals and make one you can play: a single-voice bank of partials, the crystals on a selector, and an envelope. This cycle built it. It is an RNBO codebox inside a Max patch, with a keyboard, a nine-slot crystal menu and five knobs. With the knobs at their default…

### Open asks

_None — nothing is waiting on you._

### Answered, not yet consumed

_None._

### Decided

- `crystal-synth-steward-021` — directional_decision → GRANTED — option_id=FILL-PALETTE (2026-06-25)
- `crystal-synth-steward-018` — directional_decision → GRANTED — option_id=RENDER-LABRADORITE; notes: "make a really nice html menu of the proofs and what we are teaching, use accurate visuals and the audio examples." (2026-06-25)

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
Decided with Loudon when the Loudon Live arc was designed (April 2026), and seeded here once from the retired staging file on 2026-09-25:

- **Build in Gen~ inside RNBO** — Gen~ for the sound, RNBO for portability.
- **Hypothesis-testing throughout.** A timbral description is a prediction, not a fact; the instrument is how we check it.
- **A session is about 70% making, 30% framing**, and the framing is led by an HTML piece, not a lecture.
- **The cross-domain anchor is "one structure, many projections"**: the same phonon mode ratios travel from Gen~ to RNBO to the H90 to Faust, as one crystal symmetry shapes both its optics and its acoustics.
- **The interface grows move by move**: functional, then portable, then serious, then visual, then physical.
- **The audience is autodidact polymaths**: producers fluent in a DAW, with a maker's sensibility and no physics required.
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
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
