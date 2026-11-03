---
title: "Photonic Time Crystals — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Photonic Time Crystals]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record of Photonic Time Crystals' first rich face: every piece judged, every number recomputed by code that shares nothing with the pieces, and every citation checked against the web, so the maker's remake and Loudon's yes rest on what was verified."
---

# Photonic Time Crystals — rich — challenge

Proposal round, 2026-11-03. Challenger: claude-opus-5-5. Maker's commit: `ec10ef33`. The verdicts: **3 keep, 1 remake, 0 retire.**

## The pieces

### Photonic Time Crystals (the opening) · gathered · *same equation, read twice* — **keep**

- **Test or decoration?** A test. It puts "crystals are Bloch in space; time-modulated systems are Floquet in time" through the simplest case, two methods that share no code, and it could have come out otherwise.
- **Faithful?** Yes. The caption's numbers (edges within 2 × 10⁻⁷; the half trace equals cos kπ inside the bands; k is Im μ) match the Floquet Theory manifest's own caption on main.
- **Walks up?** Yes. Its own challenger judged that on its home page.
- **Landed version?** Yes. The file is byte-identical to main: last touched by `72f72181`, merged in `d7c627d8`, kept by its challenger. Its section on Floquet Theory is still `status: proposal`, which the caption says.

### The basic structure · made · *a gap in momentum* — **keep, with notes**

- **Test or decoration?** A test, and the best kind: it finds something the text lacks. The space side (a thin-layer stack) and the time side (a Yee grid) share no code. Each could have drifted from the Mathieu reference, and the bold verdict in step 5 flips to "They disagree somewhere" if they do.
- **Faithful?** Yes, and it says plainly where it disagrees with the text ("The page says frequencies; measured, it is a momentum gap"). That disagreement is filed as an offer, not written into the text. The literature agrees with the piece (offers, below).
- **Walks up?** Yes. One wave alone, then a crystal in space, a crystal in time, the gap heard, and the test last.
- **Notes for the maker (none blocks landing):**
  1. *Conform's play-silent warning stands as keep-with-note.* On the rich server, step 4 → "pump between two modes" started the context (`running`) and the readout said "You hear 441.25 Hz." The sound is there; conform's click just can't reach step 4.
  2. *State step 5's pass rule on the page, before the table.* The rule lives only in code: stack against Mathieu within 2 × 10⁻⁴, grid against Mathieu within 5 × 10⁻³. The prediction is already stated up front; the tolerance isn't.
  3. *"The gap heard" can fail, and that is worth showing.* I ran the piece's own sound core next to a control: two unlocked sines at 440 and 442.5 Hz. The control reads 442.25 Hz on the maker's 1-second zero-crossing check, which fails its 0.05 Hz tolerance. On the worklet's quarter-second windows it reads 442.56 Hz, wandering by up to 1.31 Hz. A 4-second spectrum shows two lines, and the envelope beats by 14.3 dB. The piece gives one line at 441.25 Hz, with an envelope flat to 0.1 dB. One optional fix: a "two free modes" button, so the reader can hear what locking rules out.
  4. *At steady state, one mode sings.* At 8 s with the pump at 882.5 Hz, the 440 Hz mode stands at 0.080 and the 442.5 Hz mode at 8 × 10⁻⁷. Pump depletion lets one winner through. "They all sing at one pitch" holds while they grow, and the readout already handles the single-mode case.
  5. *Taste:* the subtitle gives away the test's result before step 1.
- **Runs clean:** console empty, no context before a click, the context suspended when the page was hidden, sound stops when the step changes, nothing external beyond Google Fonts, nothing licensed.

### Why this matters for audio · gathered · *the threshold, heard* — **keep, with a note**

- **Test or decoration?** A test of the felt claim. It measures the threshold against 4ζ, and its own page found 0.0240002 at ζ = 0.006.
- **Faithful?** Yes. One note: its threshold 4ζ is in Parametric Resonance's ε (stiffness ω₀²(1 + ε cos Ωt)). The gap piece just above writes the stiffness as 1 + 2m cos, so there the same threshold reads m = 2ζ (its step 4 says "m ≤ 2ζ = 0.004"). A clause in this caption, "4ζ in its ε, which is 2m in the piece above", would stop a reader from seeing two thresholds.
- **Walks up?** Yes. Four steps, judged on its home page.
- **Landed version?** Yes. The file is byte-identical to main: last touched by `2155231d`, merged in `04b5fe25`. Its challenger's remake changed only its caption on its home page (`180d7bde` did not touch the file).

### Open Questions · made · *a mirror in time* — **remake**

- **Test or decoration?** Half a test. The Yee grid check is real. It can fail, and it agrees within 0.4 % in the face. The trial the open question asks for is not: the page asks whether the time-crystal mechanism is "perceptually distinct from a digital reverse-buffer". The piece tests it only against a *plain* reverse buffer, which loses by construction (it doesn't transpose and doesn't comb). The piece's own step 2 says "Like tape played backward at 0.50 speed." So I built the strongest digital null and compared:
  - single jump vs a reverse buffer, varispeeded ×n₁/n₂, at gain r_E (my own windowed-sinc resampler): residual **−85.7, −86.7, −85.7 dB** at n₂ = 1.5, 2, 3.
  - there-and-back (n₂ = 2, τ = 1 ms) vs a reverse buffer through two taps of ±0.375, 1.000 ms apart: residual **−318 dB**, an exact match.
  - single jump vs the plain reverse buffer at the same gain: residual 0.0 dB, nothing alike.

  So in this ideal line (lossless, dispersionless, instant jumps) a time mirror *is* a reverse buffer with varispeed, or a reverse buffer through a comb. The ear can tell it from a plain reverse buffer, but not from those.
- **Faithful?** The step 4 verdict, "a reverse buffer is neither, and the ear can tell", answers a narrower question than the page asks. The Open Questions offer would carry "distinct by ear" home into the text. The bold headlines in steps 2 and 4 ("Reversed, lower, longer.", "Not only a reverse.") are hard-coded, so they cannot come out otherwise.
- **Walks up?** Yes. Wall, single jump, there and back, then the test.
- **The remake, exactly:**
  1. In step 4, add two players beside the reverse buffer: *reverse + varispeed* (×n₁/n₂, gain r_E) and *reverse + comb* (two taps ±(n₂/n₁ − n₁/n₂)/4, 2τn₁/n₂ apart). Measure each against the time mirror (residual in dB) in the table.
  2. Before the trial, state the verdict rule. For example: "distinct" if no digital chain of reverse, varispeed and comb comes within −40 dB. Make the bold headlines in steps 2 and 4 depend on the measurement.
  3. Re-word the answer to what the sketch shows. Distinct from a plain reverse buffer; in the ideal line, reproducible by one with varispeed (one jump) or a comb (there and back). What could give a physical time mirror its own sound lies outside this ideal: finite rise time (Moussa et al. switch in about 3 ns), dispersion, and gain in a crystal's momentum gap. Say so in the note.
  4. Update the Open Questions offer to match: drop "so the two are distinct by ear" and say what the null showed.
- **Runs clean:** console empty, no context before a click, one buffer at a time, stops on step change.

## Checks run

- **Maker's proof** (`Photonic Time Crystals — proof — rich checks.mjs`): all claims hold, 2.4 s.
- **conform**: errors 0, warnings 1 (play-silent on *a gap in momentum*; sound confirmed on step 4 as above). The earlier file-local warnings are gone, since the commit tracks the pieces.
- **fingerprint**: all four sections in step (6a81fc85b373, cbd7379bcf38, 3eb87b83f509, 7ab7ea762602).
- **Rich server** on the worktree: four frames, four proposal chips, console empty. The one "Lost its place" match is the renderer's hidden template span, not a stranded piece. Step 4 of the gap piece reported 441.25 Hz; step 4 of the mirror piece printed 220.00 Hz, 2.80 s, −18.1 dB, Yee 0.4994 / 0.4995.
- **Hidden hush** on the gap piece: running → suspended on a simulated hide (the same method `check-hidden-hush.mjs` uses).
- **Tuning ledger**: the run line is there and in the ledger's format: `- run · 2026-11-03 · v2.7 with the proposal-round settings · Photonic Time Crystals · nothing new`.
- **My own recompute** (Python, scipy and mpmath; no code shared with the pieces): scratch scripts `recompute.py`, `hill.py`, `tongues.py`, `audio.mjs`, `nulls.mjs`. These are workshop and were not committed.

## The offers

1. **The basic structure: momentum gap — confirmed.** Sinusoidal form, y″ + ν²(1 + 2m cos 2s)y = 0. At m = 0.1 the growth per period at the centre is **0.156896**: from DOP853 at rtol 1e-13, and the same to seven digits from a Hill (Fourier) matrix. The maker's 0.15690 matches. The maker used the sinusoidal form too (the stack's `cos 2s`, the ring's `cos Ωt`, the worklet's `cos(ph)`). A square wave of the same m would give 0.19958. The gap runs from ν = 0.95298 to 1.05327 (maker 0.9530–1.0533). Every ν in it has half-trace below −1 (−1.0123 at the centre), so the larger multiplier is negative real. That is a turn of exactly π, which puts every mode at Ω/2. This is an identity of the first gap; the grid's 3 × 10⁻¹⁶ confirms the grid obeys it. The literature agrees: Zurita-Sánchez et al. 2009 report forbidden wave-vector gaps (their abstract, via OSTI), and Lustig, Sharabi and Segev (Optica 5, 1390, 2018) describe bands gapped in momentum, not frequency (from a search summary; I did not read the paper).
2. **What they do: one interface reflects every frequency — confirmed.** With D and B continuous: ω₂/ω₁ = n₁/n₂, r_D = (n₁ − n₂)/(2n₁), r_E = n₁(n₁ − n₂)/(2n₂²) = −0.125 at n₂ = 2 (−18.06 dB, the largest a rising index gives, at n₂/n₁ = 2). My own Yee grid (Courant 0.4, a different layout) gives backward D 0.24954 / 0.49923 / 0.99836 at n₂ = 1.5 / 2 / 3, against 0.25 / 0.5 / 1, within 1.8 × 10⁻³. On the web, Moussa et al.'s eq. (1) is R = Z₂(Z₂ − Z₁)/(2Z₁²). With Z ∝ 1/n that is the same expression, and their switch from 50 to 25 Ω is exactly n₂/n₁ = 2. Morgenthaler 1958 exists (IRE Trans. MTT 6, 167–172); I did not read its coefficient. Mendonça was not checked.
3. **Open Questions: measured partial answer — numbers confirmed, conclusion disputed.** 220.00 Hz, 2.80 s and −18.06 dB hold. The comb algebra is exact (|r| = ½|x − 1/x||sin φ| to 6 × 10⁻¹⁷), with the first notch at 1 kHz for τ = 1 ms. But "a reverse buffer does neither, so the two are distinct by ear" holds only against a plain reverse buffer. With varispeed it matches to −86 dB, and with a two-tap comb to −318 dB (see the remake).
4. **How they're made: 2:1, and slow modulation opens no gap — confirmed for a sinusoid, form-dependent.** The four numbers are tongues 1–4: the peaks sit at ν = 1.0008, 2.0017, 3.0021, 4.0027, with the pump at 2ω/n. Peak growth per pump period, sinusoidal, from mpmath at 30 digits: m = 0.05 gives **0.0786, 0.00786, 0.000747, 0.0000700** (maker 0.079, 0.0079, 0.00075, 0.00006; the fourth is about 15 % low). m = 0.01 gives **0.0157, 0.000314, 5.96 × 10⁻⁶** (maker's third is 5.2 × 10⁻⁶, about 13 % low). "Tenfold per tongue" holds at m = 0.05 only (ratios 10.0, 10.5, 10.7). At m = 0.01 it is about fiftyfold. For a square wave it fails outright: at m = 0.05 the tongues give 0.100, 0.0157, 0.0976, 0.0311, because the odd tongues stay first-order. The offer should name the sinusoid. Its real reason is that a slow modulation has no Fourier content at 2ω. The 1 PHz figure for 500 THz light is right.
5. **A timeline — partly confirmed, and the page is wrong in one place neither caught.**
   - *2022 time-reflection:* the maker is right. It was Moussa, Xu, Yin, Galiffi, Ra'di and Alù: arXiv 2208.07236 (submitted 1 Aug 2022), Nature Physics 19, 863–868 (June 2023), with a temporal Fabry–Pérot from a pair of interfaces. I found no source for a Caloz-group observation. But **both the page and the offer say "microwave", and the paper's signals are 30–70 MHz** (RF), with a switch rise time of about 3 ns.
   - *2009 "J. Lukens et al.":* not confirmed by me either; no source found. A Technion (Segev group) paper, which I know only from a search summary and did not read, credits the 2009 proposal to Halevi. **Zurita-Sánchez, Halevi and Cervantes-González, Phys. Rev. A 79, 053821 (2009)** is confirmed: the title, authors, DOI 10.1103/PhysRevA.79.053821, and an abstract naming forbidden wave-vector gaps.
   - *Wang et al. 2023:* confirmed, and experimental. Science Advances 9(14), eadg7541, 5 Apr 2023, by X. Wang, Mirmoosa, Asadchy, Rockstuhl, Fan and Tretyakov: a microwave metasurface, with exponential amplification in the momentum gap.
   - *Where the page is wrong and neither caught it:* "2018–2020: first experimental demonstrations". A k gap was measured in 2015, by Reyes-Ayona and Halevi in a dynamic microwave transmission line (Appl. Phys. Lett. 107, 2015, DOI 10.1063/1.4928659). Time reflection was observed for water waves in 2016 (Bacot, Labousse, Eddi, Fink and Fort, Nature Physics; it is ref. 22 in Moussa et al., who say time interfaces had "so far been observed only for water waves").
   - Sources: https://arxiv.org/abs/2208.07236 · https://par.nsf.gov/servlets/purl/10432278 (full text: eq. 1, 30–70 MHz, ~3 ns, 50 → 25 Ω, ref. 22) · https://www.osti.gov/scitech/biblio/21313097 · https://research.aalto.fi/en/publications/metasurface-based-realization-of-photonic-time-crystals/ · https://bvbvf1.bib-bvb.de/vufind/PrimoRecord/cdi_osti_scitechconnect_22489133 · https://phsites.technion.ac.il/publications/msegev/Lustig_optica-5-11-1390_2018.pdf · https://dspace.mit.edu/handle/1721.1/152080

## The face as a whole

It makes the page's idea felt, not just busy, and it does one better: it corrects the idea. The gap piece turns "the same exponential structure, pointing in dual directions" into a number two unrelated methods agree on, then shows the axis turning, so a reader hears a band of wave numbers collapse onto one pitch. The two gathered pieces sit where they should: the duality checked at the top, the crack felt before the hook names it. The mirror piece is the weak joint. Its physics is right and its Yee check is honest, but it answers the page's question against a straw reverse buffer when its own step 2 had already named the stronger one. One round fixes it, and the fixed version is the more interesting answer: in the ideal, a time mirror is a reverse buffer with varispeed. Whatever makes it its own sound has to come from the parts the ideal throws away.
