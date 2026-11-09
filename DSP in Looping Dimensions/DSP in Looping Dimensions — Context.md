---
title: "DSP in Looping Dimensions — Context"
born: 2026-11-09
links:
  - target: "[[DSP in Looping Dimensions]]"
    type: connects-to
    label: context-of
forward_vector: "I hold why DSP in Looping Dimensions is shaped as it is — which of its old claims fell and why, what was cut and where it went, and the decision the page now carries — so the next worker reads the reasons instead of re-deriving them, and I grow only when the page's shape changes."
---

# DSP in Looping Dimensions — Context

This is the memory behind [[DSP in Looping Dimensions]]. The page was rewritten on 2026-11-09 (deposit D-2026-11-09-DSPLOOP), from a Daily Page sit that began on 2026-11-05 and from the page's first rich face. Its earlier wording is in git.

## Why the three frames became four meetings

The old page said one fact showed up in three frames: scanning, kernel design and feedback. Two of the three did not hold.

- **Frame 2, combs.** It said two coupled combs at an irrational ratio give "exactly the same spectral signature" as a torus scan. The face's challenge worked the transfer functions (`DSP in Looping Dimensions — rich — challenge.md`, offers 1 and 3). A comb is linear, and a linear system cannot make a frequency its input lacks, so two combs keep each loop's own series. Their lattice is real, but it lies in time: the echoes land on every j·T₁ + k·T₂. Whether the lattice lands in frequency or in time depends on where the multiplying happens. That is the page's rhyme with [[Frequency-Time Duality]], now exact.
- **Frame 3, coupled plucks.** It said coupled Karplus-Strong loops pass from bell to string at a bifurcation. The snap-or-slide piece and the challenge's pole count found that loops which ring down only slide. A snap needs loops that keep themselves going: the 2026-11-05 rough (now in `DSP in Looping Dimensions/proofs/2026-11-05-sustained/`) and the 2D Torus scan's coupled phasors (cycle 7) both show one.

So the page is now organized around one question, where the loops meet, and four moves: read together, in a row, bent, and pushing back. The six offers the face held are taken into the text.

## The decision the page carries

**There are two kinds of inharmonicity.** *Lattice* inharmonicity comes from multiplying loops (FM, ring modulation, the torus scan, Floquet pumping). *Eigen*-inharmonicity comes from a medium's own resonances (stiff strings, membranes, dispersive loops). A lattice can approximate a piano's stretch but does not make it; a bent loop or a loop per partial does. The page holds this as its hinge. Several siblings still blur the line in places: [[Categorizing Inharmonicity]] (an all-pass outside a loop), [[Wavetable Space as Torus]] (a fixed ratio said to "lock"; higher genus for "more frequencies"), [[Floquet Time-Modulated Loops]] (a three-rate lattice not measured), [[Three Kinds of Warp]] (the all-pass tail as type 3), [[Waveguide Synthesizer]] ("same physics"), [[2D Torus Wavetable Synthesizer]] (the Stiff String surface), and [[Rank-N Lattice Analysis]] (a piano or bell "needs N ≥ 2" generators). Those are theirs to change.

One question is left open on purpose: whether a twisted path on the torus, each loop's speed set by where the other is, bends the lattice or only finds new generators. [[Three Kinds of Warp]] says type 3 bends it. Nothing has been built and heard that settles it.

## What was cut, and where it went

- **The frontier detail.** The Bohigas–Giannoni–Schmit conjecture for higher-genus spectra, Maass forms on hyperbolic surfaces, and the Peter–Weyl basis indexed by spin j = 0, ½, 1, … for SU(2), with its spinor-valued tables. None of this territory has been entered, so one plain line per geometry is enough until a session enters it. Selberg's trace formula and the Bolza surface stayed, as names. The Möbius loop is new: unlike the others, it is already in every inverting feedback loop.
- **The cross-domain section.** Crystallography, MRI k-space and cosmology made one point three times: a T³ table is a triply periodic field. That point is now one line under § What it does excellently. "A way of making crystals audible" went with it, because nothing on the page or its face has yet scanned a crystal.
- **"Discrete".** It stays, in the spectral sense: the lines are single, though dense once two rates are irrational (challenge, offer 5).

## The figures

Each of the nine sections has a figure, drawn in TikZ and pgfplots per [[Technical Diagram Standard]]. The `.tex`, the rendered `.svg`, the data and the scripts that write it all live in `figures/`. A subfolder, because sixty-eight source files at the bundle's root would bury its faces and memory. Embeds resolve by filename either way ([[Image Embedding Standard]] leaves the folder question open "until one hurts").

The interactive half — a piece per section — is the rich face's work, and its sections still sit under the old headings until [[Enrichment]] re-keys them.
