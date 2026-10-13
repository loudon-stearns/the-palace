# Étude No. 1 — "One Sphere"

A test piece for the prototype, about 100 s long. Each of the three voices is `RNBO/torus_2d_hopf.codebox` running from its own text on a catalog WAV, the same file a `[buffer~ tablebuf]` would hold. The score is just knob moves, the kind a Max patch would send: breakpoints read every 32 samples, linear in between. Only the mix (pan, sum, one normalising gain) happens outside the codebox.

| voice | surface | baseHz | pan | enters |
|---|---|---|---|---|
| I | Penrose Lattice | 110 | left | 0 s |
| II | Knot Shadow | 165 | right | 30 s |
| III | Membrane | 55 | centre | 58 s |

**I. One point (0–12 s).** Penrose at height −1. The y rate is zero, so this is a plain 1D wavetable synth, and longitude walks it through the surface's rows.
**Staircase (12–30 s).** Height rises from −1 to 0. The coupling holds at 3 Hz, so the pitch climbs in locked steps (1:4, 1:3, 2:5, 1:2, 3:5, 2:3, 3:4, 4:5) instead of gliding, and lands on 1:1 at 110 Hz.
**II. The knot (30–62 s).** Knot Shadow enters already locked at 3:2. Its dead-line voice (het) is up, and Penrose's comes in at 34 s. Both let go at 44–46 s: coupling falls to about 0.3 Hz while the heights wander off the ratio, and the dead lines sing the mistuning. At 56–58 s the coupling grabs them back, Penrose onto 3:2 at 88 Hz.
**III. The hands (62–84 s).** Membrane enters as a low 55 Hz drone, then gets bend (66–74 s), shear (66–78 s) and stir (70–90 s).
**IV. Let go together (84–94 s).** All three drop the coupling and nudge their heights off the ratio at the same moment, then are grabbed at 93–94 s and fade out.

**What a "let go" has to be.** On the exact ratio, nothing needs coupling to stay locked, so dropping the coupling alone changes nothing. The first render's coda proved it: the spectrogram didn't move. So every let-go is two moves together: coupling down, height off the ratio.

Re-render: `node render_etude.mjs`, then the two commands in its header.
