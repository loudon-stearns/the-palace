# Étude No. 2 — "One Sphere, Told Whole"

Loudon on No. 1: the sections read as a story, each with its own mood, so tell the whole story. Give some sections a clear tempo and groove, and wherever the pitch jumps, use motif, repetition, sequence and variation. This is that piece, 110 s. It follows the same rule as No. 1. Every voice is `RNBO/torus_2d_hopf.codebox` running from its own text on a catalog WAV, the score is only knob moves, and only the mix happens outside the codebox. The drums are the codebox too.

| voice | surface | how it is voiced | pan |
|---|---|---|---|
| Penrose | Penrose Lattice | 1D point (an A4 sine), then a pad on the 1:2 lock | left |
| Knot Shadow | Knot Shadow | the melody, on 1:1, where it sounds its fundamental | right |
| Kick | Membrane | baseHz dropping 170 → 48 Hz in a quarter second | centre |
| Hat | Chladni Ghost | far off every ratio at 900 Hz, stir up, 70 ms gates | right |
| Drone | Membrane | 55 Hz, carries the hands | centre |

**The motif.** A C E D: scale steps 0 3 7 5, rhythm 1 · ½ · ½ · 2 beats, one bar.

**I. One point (0–14 s, free time).** The 1D synth plays the motif twice, rubato, the second time slower, and holds the last note.
**Staircase (14–28 s).** The sphere rises off the pole and steps through the locks 1:5, 1:4, 1:3, 2:5 and lands on 1:2. The last four steps fall one per bar at 100 BPM, so you hear the tempo arrive before the drums do.
**II. The knot (28–57 s, 100 BPM).** The kick plays beats 1, the and of 2, and 3, with a pickup every fourth bar. The Penrose pad ducks on each kick. The hat comes in on the offbeats at bar 3. At bar 5 the Knot Shadow states the motif, repeats it, sequences it up a fourth and then a fifth, comes home, steps down a tone, and cadences.
**Let go, in time (57–66 s).** The melody holds the tonic. Both voices drop their coupling and move their height off the ratio by exactly the amount that makes the dead line turn on the beat: Knot Shadow in eighth notes (3.333 Hz measured), Penrose in quarter notes (1.667 Hz measured). For four bars the mistuning plays the groove. Both are grabbed back on the downbeat.
**III. The hands (66–86 s, half time).** The kick goes to half time and the Membrane drone enters. Bend swings once per bar, shear snaps on beats 2 and 4 as a backbeat, and stir swells across four bars. The melody plays the motif at half speed, sequences it up a fourth, inverts it an octave up, then cadences home.
**IV. Let go together (86–95 s).** The kicks spread out (85.6, 87.0, 88.8, 91.4 s) and the tempo dissolves. All three pitched voices let go at once at different slip rates (Penrose 4.9 Hz, Knot Shadow 8.8 Hz, Drone 3.3 Hz).
**Coda (95–110 s).** All three are grabbed back. Penrose plays the motif slowly once more on the pad, then height and baseHz glide back to the start, so it ends on the opening A4 sine.

**What voicing taught.** Each surface on each lock sounds some partials and not others, so a note is written as the partial that actually sounds. Penrose is exactly five equal plane waves at (11,0), (−3,±10) and (±9,−6), so any lock turns it into a five-note chord on fixed harmonics. On 1:2 those are harmonics 4, 12, 16 and 24 of f0, an open fifth chord, plus 22, the one blue note. On 1:1 Knot Shadow is 88% fundamental, but on 3:2 (where No. 1 had it) it is almost a pure sine on the 5th harmonic.

Re-render: `node render_etude_2.mjs`, then the two commands in its header.
