# Étude No. 2, second draft — "Told Whole, With an Answer"

The first draft ([[Étude No. 2 — score]]) told the whole story with one idea, the motif A C E D. This draft makes two changes and keeps everything else. It is 130 s and follows the same rule: every voice is `RNBO/torus_2d_hopf.codebox` running from its own text on a catalog WAV, the score is only knob moves, and only the mix happens outside the codebox.

**1. A real kick.** In the first draft the kick was Membrane on the 1:1 lock. Measured, Membrane on 1:1 puts its energy on harmonics 2 to 4 (12, 22, 32 and 23 percent), so a kick tuned to 48 Hz actually sounded at 100–200 Hz, which is a tom. The new kick is the plain 1D synth (height −1) on the Sine Cycle Sweep surface, whose first row is one pure sine. Its pitch drops 150 → 64 → 46 Hz. The click comes from the surface too: longitude flicks up to row 0.18, about four cycles per row, and falls back to zero in 12 ms, so the attack is a fast downward glide through harmonics. Measured on a kick in the new section: 87% of the energy is below 100 Hz, 9% from 100 to 250 Hz, 3% above.

**2. A B section, bars 25–32 (85.6–104.8 s).** This is a second character that answers the motif. Everything after it moves back eight bars.

| | the motif (A) | the answer (B) |
|---|---|---|
| notes | A C E D, leaps | E F G A G, steps |
| shape | climbs, then falls back | rises and holds |
| rhythm | short-long (1 · ½ · ½ · 2) | long-short (1½ · ½ · 1 · 1 · 4), two bars |
| key | A minor | C major |
| voice | Knot Shadow on 1:1, reedy, the fundamental | Knot Shadow on 3:2, a near-pure whistle on the 5th harmonic, pitch = 2·baseHz |

In the B section the pad moves for the first time in the piece. Its roots are F, C, G and E, two bars each, then home to A. The whistle sings B over F, then a step lower over C, then reaching up to C6 over G. In each gap the melody answers with the head of the motif (A C E). In bars 31–32 the whistle holds a high E while the melody takes back the whole motif, once on A and once a fifth up on the dominant, E G B A. Then everyone lets go together. The whistle lets go too, slipping at 6.5 Hz. The drums go plain: a kick on 1 and 3 with a pickup every other bar, and straight eighth-note hats. The Membrane drone sits out and comes back for the let-go.

**Checked from the stems:** whistle 659, 698, 784, 880, 784 Hz (E F G A G) and 784 → 1046 Hz in the reaching phrase. Pad roots 174.7 (F), 261.5 (C), 195.9 (G), 164.8 (E). Melody answers 220, 261.5, 329.6, and the dominant motif 329.6, 391.8, 494.0, 440.2. Slip rates are unchanged from the first draft: Knot Shadow 3.333 Hz and Penrose 1.667 Hz in the in-time let-go.

Re-render: `node render_etude_2b.mjs`, then `python3 etude_spectrogram_2b.py $TMPDIR/etude_two_b_mono.wav etude_two_b_with_answer.png` and `afconvert -f m4af -d aac -b 256000 etude_two_b_with_answer.wav etude_two_b_with_answer.m4a`. The first draft's files are untouched.
