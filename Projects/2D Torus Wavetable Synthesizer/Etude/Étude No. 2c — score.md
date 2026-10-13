# Étude No. 2, third draft — "In the Threshold"

The second draft ([[Étude No. 2b — score]]) went too far toward the grid: straight 4/4, every note dead on time, every pitch flat. Loudon asked for the voice-and-violin end in the melodies, a swung and non-European beat in the rhythms, tempo that slides like No. 1's, and to play in the threshold between the abstract and the rigid. The ending was his favorite, so it stays exactly as it was. Same rule as before: every voice is `RNBO/torus_2d_hopf.codebox` running from its own text, the score is only knob moves, and only the mix happens outside the codebox. 155 s.

**Time.** The piece is now in 12/8. A beat is a dotted quarter split into three eighths, and those three eighths are uneven: short, medium, long (0.31 · 0.335 · 0.355 of the beat), like the stretched triplets of Malian jembe drumming. The motif A C E D keeps its short-long shape as 3 · 2 · 1 · 6 eighths, so it swings by itself. Time runs through a tempo curve instead of a fixed BPM:

| section | what the tempo does |
|---|---|
| I, one point (0–14 s) | free, as before |
| staircase (14–28 s) | speeds up from 50 to 80 beats a minute, so the lock steps come faster and the groove arrives inside them |
| II, the knot, bars 1–12 | steady 80, swung |
| let go, bars 13–16 | slows to 56, then speeds back up to catch bar 17 |
| III, the hands, bars 17–24 | 80, leaning back to 70 at the end |
| B, the answer, bars 25–32 | breathes: each two-bar phrase pushes to 76–79, then relaxes to 65–67; slows to 62 into the let-go |
| IV and the coda | free time, unchanged from the second draft |

**The beat.** A two-tone bell on Chladni Ghost plays the West African 12/8 bell pattern (x.x.xx.x.x.x), low bell on the downbeat. A shaker (Chladni again, higher) plays every eighth, loudest on the beat, then the long third eighth, then the short one. The kick walks the four beats against the bell with a push on the "and" of two. Under the hands it goes half time in 3+3+2. In the B section the bell drops out and the kick turns into a frame drum: low on one, soft on three, a pickup. Drum hits get a few milliseconds of seeded push and pull.

**The singing.** Every melodic voice now slides into tied notes, with a longer slide on a leap of a fourth or more, the way a violinist shifts. It scoops up from 40 cents flat into a detached note, and lets a vibrato bloom about a quarter second into any long note. Vibrato is an LFO on baseHz, which in a patch is a `[cycle~]` into `[param baseHz]`. Depths run from 10 cents in the coda to 32 cents on the whistle's reach. Rates are 5.3–6.1 Hz, drifting a little.

**The let-go follows the tempo.** With coupling at zero the dead lines slip at a rate set by the height offset, so the score writes the offset from the tempo every half beat. The Knot Shadow slips at eighth notes and Penrose at beats, all the way down the ritardando and back up.

**Small composition changes.** In bar 10 the motif gets a turn (A C E F E D, down a tone). In B the melody's answers climb as a sequence of chord tones over the moving pad: A C E over F, then E G B over C, then G B D over G. Before, all three answers were A C E.

**Checked from the render and the stems:**
- Let-go slip rates, wanted vs. measured. Knot Shadow: 3.775 / 3.778 Hz at 75 BPM, 2.875 / 2.877 at the slowest point (57.5), 3.625 / 3.622 on the way back. Penrose matches at every beat to within 0.002 Hz.
- The whistle's held G: 788 Hz, vibrato 26.5 cents half peak-to-peak at 6.2 Hz.
- The reed under the hands scoops 207 → 220 Hz into its A, and the leap C → E passes through 279 Hz mid-slide.
- No non-finite samples in any voice.

None of this has been heard by anyone yet.

Re-render: `node render_etude_2c.mjs`, then `python3 etude_spectrogram_2c.py $TMPDIR/etude_two_c_mono.wav etude_two_c_threshold.png` and `afconvert -f m4af -d aac -b 256000 etude_two_c_threshold.wav etude_two_c_threshold.m4a`. The earlier drafts' files are untouched.
