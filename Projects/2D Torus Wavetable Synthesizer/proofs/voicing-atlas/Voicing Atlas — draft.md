---
title: Voicing Atlas — draft
born: 2026-10-13
---
# Voicing Atlas — draft

*A proposed section for [[2D Torus Wavetable Synthesizer — catalog — wavetables]], drafted by the steward, cycle 15. Not canon until an elder lands it.*

## The lesson it writes down

Writing Étude No. 2 taught one thing over and over: on this instrument a note is not baseHz. Park a surface on a lock and it puts its energy on some harmonics and not others. The pitch you hear is the loudest of those, and turning longitude can move it. The atlas measures this for all thirteen playable catalog surfaces on every lock the Hopf codebox can choose: every a:b with a and b up to 5, plus the pole.

## How a ripple becomes a partial

Lock a:b sits at height (a − b)/(a + b). The two scan rates become b·f0 and a·f0, where

  f0 = 2 · baseHz / (a + b)
  (locked fundamental) = 2 × (base rate) / (lock top + lock bottom)

A surface ripple that cycles m times along x and n times along y sounds at harmonic

  h = | m · b + n · a |
  (harmonic it lands on) = | (ripples along x) × (lock bottom) + (ripples along y) × (lock top) |

Ripples whose h is zero stand still on the closed orbit, and the codebox's DC blocker removes them. When several ripples land on the same h, they add with a phase that depends on longitude. That's why longitude re-voices some surfaces and only changes the colour of others.

## The table

Each cell gives the loudest harmonic, its share of the energy (averaged over longitude), and the pitch as a multiple of baseHz. The pole is the plain 1D synth (height −1): longitude picks a row, and the harmonic counts from the x rate, 2·baseHz.

| surface | pole | 1:1 | 1:2 | 2:1 | 2:3 | 3:2 | 1:3 | 3:1 |
|---|---|---|---|---|---|---|---|---|
| Sine Cycle Sweep | h6 · 7% · ×12 | h8 · 7% · ×8 | h12 · 3% · ×8 | h2 · 6% · ×1.33 | h23 · 2% · ×9.2 | h10 · 3% · ×4 | h13 · 2% · ×6.5 | h2 · 5% · ×1 |
| Partial Stack | h1 · 70% · ×2 | h1 · 69% · ×1 | h2 · 69% · ×1.33 | h1 · 69% · ×0.67 | h3 · 68% · ×1.2 | h2 · 68% · ×0.8 | h3 · 68% · ×1.5 | h1 · 69% · ×0.5 |
| Duty Cycle | h1 · 61% · ×2 | h1 · 48% · ×1 | h2 · 43% · ×1.33 | h1 · 42% · ×0.67 | h3 · 41% · ×1.2 | h2 · 41% · ×0.8 | h3 · 42% · ×1.5 | h1 · 41% · ×0.5 |
| Sine + 3rd | h1 · 81% · ×2 | h1 · 80% · ×1 | h2 · 79% · ×1.33 | h1 · 80% · ×0.67 | h3 · 78% · ×1.2 | h2 · 79% · ×0.8 | h3 · 78% · ×1.5 | h1 · 79% · ×0.5 |
| Membrane | h1 · 67% · ×2 | h2 · 39% · ×2 | h3 · 34% · ×2 | h3 · 34% · ×2 | h1 · 31% · ×0.4 | h1 · 31% · ×0.4 | h4 · 28% · ×2 | h4 · 28% · ×2 |
| Chladni Ghost | h3 · 48% · ×6 | h8 · 48% · ×8 | h7 · 24% · ×4.67 | h7 · 24% · ×4.67 | h9 · 24% · ×3.6 | h9 · 24% · ×3.6 | h12 · 24% · ×6 | h12 · 24% · ×6 |
| Theta | h1 · 97% · ×2 | h1 · 84% · ×1 | h1 · 48% · ×0.67 | h1 · 48% · ×0.67 | h2 · 37% · ×0.8 | h2 · 37% · ×0.8 | h1 · 37% · ×0.5 | h1 · 37% · ×0.5 |
| Stiff String | h1 · 69% · ×2 | h1 · 68% · ×1 | h2 · 68% · ×1.33 | h1 · 68% · ×0.67 | h3 · 68% · ×1.2 | h2 · 68% · ×0.8 | h3 · 68% · ×1.5 | h1 · 68% · ×0.5 |
| Knot Shadow | h2 · 78% · ×4 | h1 · 78% · ×1 | h1 · 78% · ×0.67 | h4 · 78% · ×2.67 | h13 · 100% · ×5.2 | h5 · 78% · ×2 | h3 · 78% · ×1.5 | h7 · 78% · ×3.5 |
| Penrose | h3 · 40% · ×6 | h7 · 20% · ×7 | h4 · 20% · ×2.67 | h17 · 20% · ×11.3 | h11 · 20% · ×4.4 | h36 · 50% · ×14.4 | h33 · 40% · ×16.5 | h27 · 40% · ×13.5 |
| Kuramoto Bloom | h2 · 32% · ×4 | h2 · 46% · ×2 | h5 · 18% · ×3.33 | h4 · 28% · ×2.67 | h8 · 15% · ×3.2 | h6 · 22% · ×2.4 | h2 · 25% · ×1 | h2 · 25% · ×1 |
| Matérn Field | h1 · 91% · ×2 | h1 · 47% · ×1 | h3 · 39% · ×2 | h1 · 40% · ×0.67 | h5 · 37% · ×2 | h5 · 37% · ×2 | h4 · 38% · ×2 | h4 · 38% · ×2 |
| Fisher Ridge | h1 · 71% · ×2 | h1 · 52% · ×1 | h1 · 37% · ×0.67 | h1 · 32% · ×0.67 | h1 · 25% · ×0.4 | h1 · 20% · ×0.4 | h2 · 32% · ×1 | h2 · 28% · ×1 |

All 19 locks and the per-longitude detail are in `voicing_atlas.json` and the playable `voicing-atlas.html` beside this draft.

## What it says, in plain words

- **The four utility tables, plus Stiff String, follow the x rate.** They are 1D waveforms stacked along y, so on any lock a:b their loudest partial is harmonic b, and the pitch is the x scan rate itself. They have no "voicing" to learn.
- **Knot Shadow is one ripple carrying 78% of the energy, on every lock.** Longitude never moves its loudest partial, only the colour around it. On 2:3 it is a pure sine on harmonic 13 (5.2 × baseHz), whatever the longitude: every other ripple lands on h = 0 there and disappears. On 1:1 it is 78% fundamental, not the 88% the first Étude notes recorded.
- **Penrose is five equal plane waves, so every lock makes a five-note chord on fixed harmonics.** No longitude can make it pure.
- **Membrane, Chladni Ghost, Theta and Fisher Ridge are re-voiced by longitude.** Membrane on 1:1 is 50% fundamental at longitude 0 and 89% on the octave at longitude 0.5. The first draft of the Étude ran its kick at longitude 0.1, where the fundamental is about 13%, and that is why it sounded like a tom. The atlas would have pointed at longitude 0.
- **Longitude can turn some surfaces into near sines.** The purest voicings found: Knot Shadow 2:3, 100% on h13 · Theta 1:1 at longitude 0.5, 99% on h2 · Chladni Ghost 1:1 at longitude 0.6875, 97% on h8 · Sine + 3rd 2:1 at 0.6875, 92% on h1 · Fisher Ridge 1:2 at 0.22, 91% on h2 · Membrane 1:1 at 0.5, 89% on h2. That is a whistle register hiding in surfaces otherwise known for clouds.

## How it was checked

`check_against_codebox.mjs` runs `RNBO/torus_2d_hopf.codebox` as written, parks it on a lock at a given longitude, lets the coupling settle, and measures harmonics 1–64. On Knot Shadow 1:1 and 3:2, Membrane 1:1, Penrose 1:2, Theta 1:1 and Kuramoto Bloom 1:1 at longitude 0, and Membrane and Chladni Ghost at longitude 0.25, the codebox and the atlas agree to the percent on every harmonic. What it ignores: the bilinear lookup's gentle low-pass and anything past Nyquist, both of which depend on baseHz.

Rebuild: `python3 Tools/voicing_atlas.py`, then `node proofs/voicing-atlas/check_against_codebox.mjs`.
