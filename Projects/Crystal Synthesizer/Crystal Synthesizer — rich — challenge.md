---
title: "Crystal Synthesizer — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Crystal Synthesizer]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the fresh-eyes vetting of Crystal Synthesizer's proposed rich face: every piece judged for test, fidelity and walk-up, every offer recomputed, so Loudon reads a face that has already been argued with."
---

# Crystal Synthesizer — rich — challenge

Challenger, proposal round, 2026-11-03, on the maker's commit 7abf79ef in the worktree `enrich/crystal-synthesizer`. Judged from the page, the pieces and the commit body; I did not make this face.

**Tally: 14 keep, 1 remake, 0 retire.**

## The pieces

### The Physical Reality: Crystals as Resonators

**`Crystal Synthesizer — rich — which phonons are fast.html` · keep.**
1. *Test or decoration?* A test, and the best on the face. The section's sentence says long waves are slow. The piece builds a chain from the section's own ω(k) and sends a click through it; had the sentence been right, the highs would arrive first. They arrive last.
2. *Faithful?* The equation is the page's (`Crystal Synthesizer.md:57`), cut to one axis, and the piece says so. It quotes the sentence it tests word for word, marked "as printed when this piece was made", so a fixed sentence won't strand it. Its last step says the text has it backwards. That is the piece disagreeing with the text: it is offer 1, not a reason to hold the piece. It even offers the one reading under which the sentence is true ("slowly shaking", the curve's height).
3. *Walks up?* Yes. The curve alone, with each mode's pitch; then its slope as the pulse's speed; then the click. Changing step stops the sound. A headless walk of all three steps created no audio context until a play button was pressed, and logged no errors.

### Bravais Lattice Taxonomy: Seven into Fourteen into 230

**`Crystal Synthesizer — rich — strike the seven.html` · remake (wording only, one round).**
1. *Test or decoration?* A test. The plugin's engine (byte-identical to `plugin/ui/crystal_engine.js`, check A0) strikes nine crystals beside the page's hypotheses, and the reader marks each one held or failed. Step 4 puts the least certain hypothesis, triclinic, through both rings, and the outcome depends on the ring, not on the piece. The rows with no mineral behind them say "tests nothing", which is honest.
2. *Faithful?* The numbers are. I re-ran every one. The quotes are not quite. `HYP` (html lines 252–260) claims "the page's hypothesis … in its own words", and its ellipses drop the testable clauses:
   - **orthorhombic** drops "three distinct mode groups with wider spacing" (`Crystal Synthesizer.md:79`). That is the most falsifiable part of the prediction, and the clause offer 3 is about. Topaz's eight partials sit evenly from 1.00 to 6.05, so a reader shown the whole sentence might well mark it failed. The quote should carry it.
   - **trigonal** drops "without full birefringent doubling" (`:85`), the thing that tells trigonal from hexagonal in the page's own terms.
   - Quote every hypothesis whole. Each is one line.

   Two smaller wording fixes go in the same round:
   - Step 2's preset "diamond · 1.00 / 1.32" sits under a slider labelled "how far symmetry splits the pair". Diamond's 1.00 and 1.32 are two different modes, not one mode split by symmetry. Label it as an interval ("far apart they are an interval", which the step's own text says).
   - Step 4 labels the summer ring "5.5 s for every mineral" and then prints "diamond rings 38.0 s". Both are right: 5.5 s is the time constant and 38.0 s is the T60, 5.5 × ln 1000. Say which is which.
3. *Walks up?* Yes. One mode, then two modes fused or split (Δr 0 returns step 1 exactly, check A2), then nine at once, then the test. It is silent until a click, and changing step stops the sound.

**`playable-crystal/one_strike_nine_lattices.wav` · keep.** A record, the "before": the summer bank, the lattice changing under one held note. The caption names the ring as taste-chosen, and it matches `playable-crystal/README.md:55` (stepped every 2 s; the file is 19.0 s).

**`triclinic-proof/symmetry_arc_AB.wav` · keep.** The summer half of the step-4 test, captioned as that.

**`crystal-rings/strike_vs_ring.wav` · keep.** The ring study's result. The caption keeps its condition ("if the estimated widths hold"), as `crystal-rings/README.md:47-50` does.

### The Optical-Sonic Bridge

**`birefringence-proof/05_birefringence_arc.wav` · keep.** The nearest thing here to a test of "two refractive indices … two sound speeds": neither family alone beats, and their sum does. 8.8 Hz = 220 × (1.14 − 1.10), as `birefringence-proof/README.md:17,53` says. The caption doesn't claim the split is acoustic anisotropy.

**`dispersion-filter/beryl_c_axis.wav` · keep, with a note.** I measured 12 kHz arriving at 600 ms (a Gaussian band peak). But 600 ms is the render's shared delay cap (`MAX_DELAY = 0.60`, `render_anisotropic_beryl.py:85`), so the c-axis highs are pinned at the cap. "The most smear" is partly the cap. In a later round the caption could say what the diamond click's caption already says: the same bounded 1 − v_g stand-in, capped at 600 ms.

**`dispersion-filter/beryl_basal_plane.wav` · keep.** Measured 12 kHz at 244 ms, against the caption's "about 240".

**`dispersion-filter/01_dry_click.wav` · keep.** The control: every band arrives within 1 ms.

**`dispersion-filter/02_dispersed_click.wav` · keep.** Measured 4 kHz at 29 ms, 8 kHz at 127 ms, 12 kHz at 353 ms and 16 kHz at 600 ms: a rising sweep, as the caption says. (The bundle's own README calls it "downward-falling", `dispersion-filter/README.md:56`. The README is wrong and the caption is right.) The caption is honest that this delay is the bounded stand-in, not L / v_g.

### What the Instrument Would Be

**`crystal-rings/hardness.wav` · keep.** Option 2 built and heard. The pulse lengths match `crystal-rings/README.md:25`.

**`dispersion-filter/03_dispersion_sweep.wav` · keep.** Option 3 heard. Eight strikes spread over the first 60% of a 3 s file (`render_dispersion.py:261-264`), so they overlap. The caption doesn't say otherwise.

### Mineral Palette

**`charts/comparative_all_crystals.png` · keep, with a note.** The caption's "highest symmetry at the top" holds at the ends. Between them, ruby (trigonal) sits above emerald (hexagonal), and topaz (orthorhombic) above amethyst (trigonal). "Roughly" would make it exact. The rest is true to the chart: diamond within an octave, labradorite out to 17.5 (4.1 octaves), obsidian a continuous band.

### Open Questions

**`crystal-synthesizer-face.html` · keep, with a note.** The conform error is real and should stand for now. The keys play without MIDI, and the caption tells the reader so. One thing in the maker's account is off. The manifest gives this piece `"contract": {}`, which says it needs nothing, while it calls `requestMIDIAccess`. Under conform's rule a pre-contract piece only warns on an undeclared need (`conform.mjs:112-113, 497`), so it is the empty contract that makes this an error. The truthful contract is `{"needs": "midi"}`. It is still an error, but the right one: `grant-missing` (`conform.mjs:123, 513`), which is exactly the yes only Loudon gives in `grants.json`. That is a one-line manifest change plus a question for Loudon, not a remake.

**`rich-face/crystal-synthesizer-take.wav` · keep.** Tracked, 30.0 s stereo, copied under `rich-face/` so the public face has it. The plugin heard, beside the performer question.

## The checks

- `conform.mjs "Crystal Synthesizer"`: both made pieces introduced, 0 errors and 0 warnings. The plugin face is errored: 1 error (need-undeclared, midi) and 1 warning (sandbox-blocked MIDI).
- `fingerprint.mjs`: all six sections with pieces are in step.
- `rich-checks/check-rich-pieces.mjs`: 32 of 32 pass, the same numbers as the maker's commit. Running it rewrote `findings.json` with a new timestamp, so I restored it from git.
- I recomputed offer 1 independently, in Python, on a real mass-spring chain (K = m = a = 1, velocity Verlet, 4000 atoms) with a Gaussian packet at ka and its energy centroid tracked. Measured packet speed against cos(ka/2):

  | ka | measured | cos(ka/2) |
  |---|---|---|
  | π/4 | 0.9239 | 0.9239 |
  | π/2 | 0.7075 | 0.7071 |
  | 3π/4 | 0.3831 | 0.3827 |
  | π − 0.1 | 0.0500 | 0.0500 |

  The closed form gives arrivals of 120.1, 120.9, 138.6, 205.8 and 344.8 ms for 250 Hz, 1, 4, 6.5 and 7.5 kHz. The piece measures 342.1 ms at 7.5 kHz, where its 1% band straddles a steep part of the curve. At the zone boundary the phase velocity is 2/π = 0.637 (0.647 at π − 0.05).
- The face, served by `rich-server.mjs` and loaded headless at 1400 px and scrolled through: all 15 figures render, the chart loads, and the made pieces report heights of 868 and 881 px. The two made pieces log nothing. The plugin face logs a JUCE placeholder warning and the MIDI permissions-policy error. The wav requests show `ERR_ABORTED` from metadata preload, but every strip shows its duration, and a direct fetch returns 200.
- Not verified: nothing heard. Hush on a hidden tab I left to conform's browser pass, which found nothing; I did not test it separately.

## The offers

1. **Physical Reality, "long waves slow, short waves fast" is reversed: confirmed.** v_g = dω/dk = a√(K/m)·cos(ka/2): the speed of sound at small k, falling to 0 at the zone boundary. Independent chain above. Phase velocity falls too, from 1 to 2/π. The steepness at small k is the sound speed; impedance is that times the density. **One sharpening:** this holds on the acoustic branch, the one the page's equation describes. Optical branches, which the page names for diamond and for fluorite's LO-TO gap (`:72`), are nearly flat near k = 0, so their long waves are the slow ones. A rewrite should scope "long waves travel fastest" to the acoustic branch, or to this chain.
2. **Fourteen Bravais lattices from centring, not glide and screw: confirmed.** The 14 come from combining the lattice systems with centring types (P, C, I, F) (Wikipedia, *Bravais lattice*). The 230 come from the 32 point groups on the 14 lattices plus screw axes and glide planes, 73 of them symmorphic (Wikipedia, *Space group*). **One more, from the same reading:** the page heads its fifth system "Trigonal (Rhombohedral)" (`:84`) and lists quartz, P3₁21, whose lattice is hexagonal (hP), not rhombohedral. Ruby, R-3c, is rhombohedral. The seven crystal systems and the seven lattice systems differ in exactly this place, so the same rewrite can carry it.
3. **Orthorhombic, four Raman families against three mode groups: confirmed.** The point group mmm (D2h) has four Raman-active irreducible representations, Ag, B1g, B2g and B3g, so the page's family list (`:78`) is right and its hypothesis's "three distinct mode groups" (`:79`) disagrees with it. Which count changes is Loudon's call. The piece's quote should carry the clause either way (remake note above).
4. **The refractive index gives phase velocity, not group velocity: confirmed.** v_p = c/n, and c/v_g = n + ω dn/dω (Wikipedia, *Group velocity*). The acoustic half of `:107` stands. The bridge holds slope to slope: n(ω) with its slope against ω(k) with its slope.

## The face as a whole

The face makes the page's idea felt more than it decorates it, and twice it argues back. The phonon walk is the strongest piece here: three steps and one question, and the answer runs against the printed sentence, by a mechanism you can hear and an independent simulation confirms. "Strike the seven" does what the Bravais section says the instrument exists for: it puts each hypothesis to the instrument and hands the verdict to the reader. Its step 4 carries the ring study's real finding, that the triclinic "bell" was the summer ring's taste talking. The gathered proofs sit by their claims and are captioned without overclaiming. The Bridge section is the busiest, with five strips, but they come as a control and its dispersion plus one stone in two directions, which is the section's argument in order. What keeps this from being whole is small: three hypothesis quotes cut down to their safest words, on the one piece whose test is the reader's own judgment.
