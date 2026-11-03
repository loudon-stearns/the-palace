---
title: "Volterra Kernels and the Torus — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Volterra Kernels and the Torus]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's record of this page's first rich face: two pieces kept, the page's load-bearing sentence found wrong in the sense any audio reader takes it, and the five offers checked against numbers I worked myself, so Loudon can approve or revise without redoing the sums."
---

# Challenge — Volterra Kernels and the Torus, rich face, proposal round

Challenger: claude-opus-5-5, 2026-11-03. Maker's commit `3f204e42`. The `.md` is untouched by that commit (`git diff HEAD~1 -- "Volterra Kernels and the Torus.md"` is empty).

## The verdicts

**the diagonal and off it** (The precedent and the diagonal) — **keep.**

1. *Test or decoration?* A test, and the strongest kind: it was built to check "preserves harmonic generation but discards intermodulation", and it came out against the text. On the diagonal the intermodulation is there, 6.02 dB above the harmonics. If the sentence were right, the readout would have shown it.
2. *Faithful?* It disagrees with the text, openly. The sub-head frames the test as a question ("What does the diagonal throw away?") and the finding goes to Loudon as offer 1, not into the `.md`. That is how the brief says a disagreement should travel. Its equations are right: y = g ∗ x² on the diagonal, H₂(f₁, f₂) = G(f₁ + f₂), the sum product at A²·|cos π(f₂ − f₁)D| and the difference at A²·|cos π(f₁ + f₂)D|.
3. *Walks up?* Yes, by the book ([[Progressive Staging]] § Inside One Piece): harmonics alone (a static curve), intermodulation alone (two signals multiplied), memory alone (one sine times its past, where nothing changes but the offset), then the three together in the two-tone test. Each concept appears once on its own before the test.

Note, not a remake: the test hint says that gliding brings the difference product back. It does at +25 and +75 Hz, but at +150 Hz it nulls again, because 1050 Hz × 3.33 ms is 3.5 cycles. "Comes and goes" would be exact.

**one field, two readers** (Cross-Domain Resonance) — **keep.**

1. *Test or decoration?* A test. The first four steps build the surface the section asks for: a point, two phasors, a signal and its own past, then one button. The last step asks the question the section's monism invites: are the two readers one reader? Mostly no. It could have come out either way, and the ridge field and the lowered input level show that it does.
2. *Faithful?* It reads the field the way the page's Processing bullet does, by the input's values (x(t), x(t − D)), and not by lags, as the Volterra definition does. Its equations say so, and they name the amplitude-to-place map it chose (inverse cosine) as the piece's own choice. Its claim that the readers meet exactly is new, not the page's, and it is carried as offer 4. It changes no number in the text.
3. *Walks up?* Yes: one place, one path, one input, one toggle, then the test.

One fix to make in passing. The input step's hint says that at D = 0 "the two readers agree and the reader rides the quarter's diagonal, the Hammerstein slice of **the next section**." The piece sits in Cross-Domain Resonance, the page's last section, so the diagonal section comes *before* it. The hint also uses "the two readers" for u and v, which is the piece's own name for synth and effect. Suggested: "at D = 0 both coordinates read the same sample and the reader rides the quarter's diagonal, the Hammerstein slice of *The precedent and the diagonal*."

## Checks run, and what they returned

- `node "Volterra Kernels and the Torus/Rich face checks/check-pieces.mjs"`: all pass, at 48 and 44.1 kHz.
- `node _ops/rich-face/conform.mjs "Volterra Kernels and the Torus"`: 2 pages, 1 rich face, introduced 2, **errors 0, warnings 0**, browser pass at 760 and 1130 px. (The maker's two warnings were about uncommitted files; the commit cleared them.)
- `node _ops/rich-face/fingerprint.mjs "Volterra Kernels and the Torus"`: both made sections are *in step* (`bad67f0bf99a`, `fd549dc609b8`).
- Served with `rich-server.mjs --detach` on 8852, loaded `?entry=Volterra Kernels and the Torus` in headless Chromium, and both pieces framed from 8853. Two *proposal · 2026-11-03* chips showed, and the head said the round is not yet approved. I walked each piece to its last step and pressed play.
  - Diagonal on: "sum product +6.0 dB re the harmonics · difference product +6.0 dB · harmonics −19.9 and −19.9 dB".
  - Off: "sum product gone · difference product gone".
  - The two-readers meter on a·b: "below −150 dB re the synth · the same signal, sample for sample".
  - **Console clean.** No page errors.
  - Stopped with `--stop 8852`.
- Sound starts only on a click: neither piece creates an `AudioContext` before `start()`, and `start()` is bound to the play button. Hush on a hidden tab is left to the kit; I did not re-run `check-hidden-hush.mjs`, which is a kit-wide check. Neither piece loads any file but Google Fonts. Nothing licensed. Every file is tracked.
- I recomputed the numbers independently in numpy on continuous fields, without the pieces' tables or worklets. The two scripts are `/private/tmp/claude-501/-Users-loudonstearns-Documents-The-Palace/760c17df-bd3c-4a69-bd21-f5bca695db4f/scratchpad/volterra-ch/indep.py` and `fields.py`, kept in the scratchpad and not committed.

## The load-bearing sentence, worked from the series

The page says the diagonal slice "is equivalent to a Hammerstein structure — a static nonlinearity followed by a filter — which preserves harmonic generation but discards intermodulation."

A diagonal second-order kernel is h₂(τ₁, τ₂) = g(τ₁)·δ(τ₁ − τ₂). Put it in the series and the double integral collapses to y(t) = ∫ g(τ)·x(t − τ)² dτ. That is the input squared, then filtered: a Hammerstein. Feed it two tones, x = A cos ω₁t + A cos ω₂t. The square of a sum has a cross term, so x² holds 2A²·cos ω₁t·cos ω₂t, which is A² at ω₁ + ω₂ and A² at ω₁ − ω₂. Each harmonic is A²/2. In the frequency domain, H₂(f₁, f₂) = ∫ g(τ)·e^(−j2π(f₁ + f₂)τ) dτ = G(f₁ + f₂).

**So the diagonal does not discard intermodulation.** It keeps it at twice the harmonics' amplitude: 20·log₁₀ 2 = 6.02 dB. At A = 0.45 I get the sum and difference at −13.87 dB and both harmonics at −19.89 dB, the maker's figures exactly. Through a 3-tap filter g, the sum product comes out at A²·|G(750 Hz)| and 2f₁ at (A²/2)·|G(600 Hz)|, both matching to 10⁻⁴. A static nonlinearity making intermodulation is the most ordinary fact in audio: it is what a two-tone IMD test measures on a memoryless clipper.

**What the diagonal really gives up** is the freedom to weight a product by the pair that made it. H₂ depends only on f₁ + f₂, where the product lands. A notch after the curve can't tell the f₁ + f₂ sum product from a 2f₁ harmonic at the same frequency. In the time domain, the same loss means no products of *different* past samples, x(t − τ₁)·x(t − τ₂) with τ₁ ≠ τ₂. This is what the textbooks mean when they say a Hammerstein model cannot capture "nonlinear memory", or memory inside the nonlinearity. In the PA-linearization literature, that shows up as IMD that depends on the tone spacing, not just on where the product lands. The maker's offer 1 says this correctly.

**What the page may have meant.** The page sets up its own trap a section earlier. "What a Volterra kernel is" glosses the second kernel as "capturing quadratic interactions (**intermodulation between pairs of past samples**)." On that private meaning, cross-lag products, the sentence is true: the diagonal keeps only products of a sample with itself. On the meaning any audio reader brings, sum and difference tones, it is false. So offer 1 should also take the gloss. Write "products of pairs of past samples" there, or the corrected sentence will still sit beside a definition that seems to back the old one. The maker named the Forward Vectors line and the Artifact paragraph as followers, but not this gloss.

## The offers

1. **The diagonal keeps intermodulation (claim-change). Confirmed**, with one addition: the gloss above. The figures:
   - On the diagonal: IM −13.87 dB, harmonics −19.89 dB, 6.02 dB apart. The closed form and the worklet agree.
   - Off it, at D = 3.33 ms: the sum product's null is at **D = 1/(2Δf)**, half a period of the *difference* frequency (150 Hz). It is not a period of the sum. The two cross terms that land on f₁ + f₂ carry phases ω₁D and ω₂D, and they cancel when (ω₂ − ω₁)D = π. That also means one full period of f₁ (300 Hz) and 1.5 periods of f₂ (450 Hz). The sum's own frequency sets the *difference* product's null, |cos π(f₁ + f₂)D|, and 750 Hz × 3.33 ms = 2.5 cycles. So at this lag both products vanish together, a coincidence the piece names in its hint.
   - Off-diagonal results: in double precision the sum is at −298 dB and the difference at −284 dB. In the worklet's float32 output, −100.9 / −96.7 dB at 48 / 44.1 kHz, which is the float32 floor. The harmonics hold at −19.89 dB for every D.
   - The glide moves both tones and keeps the spacing, so the sum's null holds analytically. I get −295 to −299 dB at +25, +75 and +150 Hz.
   - The notch figures (−14.7 dB through, 2f₁ at −97.6 dB) come from the maker's run on the worklet. I re-ran that check and got the same numbers, and the logic follows from G(f₁ + f₂).
2. **A diagonal-only series is a parallel Hammerstein (no-claim-edit). Confirmed.** Diagonal kernels at every order give y = Σₙ gₙ ∗ xⁿ, one filter per power branch. One curve then one filter is the special case where all the gₙ share a shape. For a single order the page's "a Hammerstein" is already exact, so "parallel" matters only when the sentence means the whole series. It is worth the word.
3. **Read by values, the field is not the kernel; its polynomial coefficients are (claim-change). Confirmed, with two precisions and one finding that bears on the page's opening claim.**
   - Precision one. Any field read as y = G(x(t), x(t − D)) expands as Σ a_jk·x(t)ʲ·x(t − D)ᵏ. That is a Volterra series whose kernels are spikes at the lags {0, D}, weighted by the monomial coefficients a_jk. The page's three namings of the input-read really are three different things.
   - Precision two. The proposed "the one grid of coefficients is the synth's partial table and the effect's kernel" is loose. The Chebyshev grid c_jk is the synth's partial table. The kernel's weights are that grid re-expanded into monomials (T₂ = 2x² − 1 feeds orders 0 and 2), so one grid *determines* both but they are not the same numbers. The piece's own equation says it right: "a Volterra term of order up to j + k".
   - The finding the face doesn't play. There is a third reading, the one the page's definition actually describes: the stored table used *as* h₂, its axes taken as lags, y = Σᵢ Σⱼ T[i, j]·x(t − i)·x(t − j). Read that way, the field literally is the kernel. Its bifrequency response sampled on the grid (m/L, n/L) equals L² × the 2D Fourier coefficient c_mn, the synth's partial at m·f₁ + n·f₂. I checked one entry numerically on a random 64 × 64 table: −0.003631 + 0.013348j on both sides. So the page's "same object" holds word for word in exactly this reading: the synth's partial table and the effect's H₂ are one 2D Fourier transform, sampled. Neither piece plays a lag reader. That is a candidate for the next round, and perhaps the strongest support the page's headline has.
4. **The readers meet at a full-scale sine at 1 : 1 (claim-change). Confirmed, with the condition corrected.** On continuous fields I get effect − synth at −319 (a·b), −311 (tanh) and −255 dB (Chebyshev), which is machine precision. The ridge gives +2.2 dB. The Chebyshev field at input level 0.9 gives −9.6 dB, and at 0.7, −3.4 dB. All match the maker's −267 to −297 / +2.2 / −9.6 / −3.4.
   - Two corrections to the proposed wording. The condition is that the field is the same mirrored across each axis, a function of the two amplitudes alone, as the piece's equation says. It is not that the field is a polynomial: tanh passes the test and is not a polynomial. And "a quarter of the torus" belongs to the inverse-cosine map the piece chose. A linear map would sweep a whole axis. What holds for any single-valued amplitude map is the other half: there and back, never winding.
5. **A ring modulator as built is the half reading (claim-change). Confirmed, with a caveat.** On a·b with u = arccos(x)/2π, the field gives cos 2πu = x exactly, so the half reader is x(t)·cos 2πf₂t. I reproduce 110 and 330 Hz at 0.45 each with 220 Hz at about 10⁻¹⁶. The caveat: a classic hardware ring modulator multiplies two *external* signals. That is a two-input Volterra cross-kernel, input-read on both axes but by two different signals, and it fits the page's single-input series no better. The offer is right for a ring mod with its own carrier oscillator, which is the common build. The page's "simplest input-read special case" is best read as x(t)·x(t − D), as the maker proposes.

## The face as a whole

The face makes the idea felt and is not busy. Each piece earns its place by testing something, and both tests found something the text does not yet say. The diagonal piece is the more important one, because it catches the page's own load-bearing sentence. Its walk lets you hear harmonics, then intermodulation, then memory, each alone, before you meet the claim. The two-readers piece gives the section the toggle it asks for, and then is honest that the monism is narrower than the prose: one field, yes, but the two readers share a sound only on a full-scale sine and a mirrored field. Together they push the page toward a sharper version of its own thesis. The one thing the face leaves on the table is the lag reader, the reading in which the table really is the kernel. An agent can't hear the mix. Levels and musicality are unheard, as the maker said.
