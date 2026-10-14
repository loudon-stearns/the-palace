# Étude No. 2, fifth draft — "The Hero's Journey"

Loudon on the fourth draft ([[Étude No. 2d — score]]): the grooves and melodies are growing the right way. Don't resolve every section's melody, and let some of them end as a question. Bring back the weirder sounds of the first version. Clicking around the voicing atlas in rhythm is a musical gesture, so use it. Explore counterpoint and non-tonal sound design. And build the whole song as a walk through the hero's journey, with every sound and harmony chosen for the feeling it carries.

So this draft is a longer piece, 4:27, in twelve chapters. It follows the same rule as every draft: each voice is `RNBO/torus_2d_hopf.codebox` running from its own text on a catalog surface, the score is only knob moves, and only the mix happens outside the codebox.

## The cast

| character | voice | why this sound |
|---|---|---|
| the hero | Penrose, born at the pole, where it is the plain 1D synth | the ordinary world is the one-dimensional wavetable; the journey is the climb up the sphere. Its name is the motif A C E D |
| the mentor | Knot Shadow on 3:2, a near-pure whistle | wise and clean; it teaches the motif upside down |
| the ally | Knot Shadow on 1:1, the reed | the singer of the grooves, as in earlier drafts |
| the guardian | Chladni Ghost, off every ratio, stirred and sheared | a metal growl at the door |
| the trickster | Matérn Field, clicked through the atlas | on almost every lock it sounds the same pitch (A4, measured 439.5 Hz on every click) but a different set of undertones, so each click changes its face and never its name |
| the stair | Stiff String, clicked through the atlas | on every lock it sounds its x scan rate, baseHz × (1 − height), so its locks form a scale (below) |
| the shadow | Fisher Ridge, off every ratio, low, stirred and bent | the ordeal |
| the drums | Sine Cycle Sweep kick, Chladni bell and shaker, Membrane drone | as in the earlier drafts |

**The Farey scale.** The voicing atlas showed that Stiff String puts 65–71% of its energy on one partial at every lock, and that partial is the x scan rate. So stepping through the locks plays a scale built from the fractions 2b/(a+b). That's nineteen notes, some close to tonal pitches and some far from them. At baseHz 220 they run 73, 88, 110, 126, 147, 165, 176, 189, 196, 220, 244, 251, 264, 275, 293, 315, 330, 352, 368 Hz. The surprise: the hero's motif is already inside it. A C E D falls on locks 1:1, 2:3, 1:3, 1:2, and only the C is off, 15 cents sharp. The stair uses this twice. In the cave it is a strange scale going down. At the resurrection it is the motif heard from inside that strange scale.

## The journey

| chapter | time | what happens | the feeling |
|---|---|---|---|
| 1 · the ordinary world | 0:00 | the hero alone at the pole, singing its motif twice in free time | home, small, untroubled |
| 2 · the call | 0:14 | the mentor whistles E C♯ A from just off its ratio, so its dead line slips at about 2 Hz, faint and far off. The hero climbs three locks, unsure, the steps coming faster | something distant pulling |
| 3 · refusal | 0:25 | coupling lets go. The hero slides back down to the pole through every ratio in between, the irrational smear of No. 1. Then it tries the motif and stops on E | fear, a half-step back |
| 4 · the mentor | 0:37 | a two-voice canon in free time. The mentor sings the motif inverted (E C♯ A B), then a turning line. The hero copies it two beats later and an octave and a fifth lower, then moves against it. It ends on E over G♯ | being taught; the question left open |
| 5 · the threshold | 0:52 | the guardian growls and swells. The tempo arrives, speeding up from 46 to 80, and the hero climbs the staircase for real, one lock a bar, landing on 1:2 | the door, and going through it |
| 6 · tests, allies, enemies | 1:08 | the 12/8 groove with the bell and stretched eighths. The reed's ostinato with its variations. In each gap of the bell pattern the trickster clicks to a new lock, cycling five locks against twelve eighths so its colours never line up with the bar. The phrase stops on B | busy, bright, slightly unsettled |
| 7 · the inmost cave | 1:44 | the let-go. The tempo slides down from 80 to 40 and does not come back. The reed holds B, a question, slipping at the eighth note as the tempo falls. The stair clicks down the Farey scale one lock a beat, 293 → 73 Hz | descending, the light going |
| 8 · the ordeal | 2:01 | free time. The shadow rises, churning. The reed is torn through the atlas in leaps from 55 to 1145 Hz, the gaps shrinking and then stretching like a stumble. The hero's dead line slows toward stillness. Then 1.6 s of true silence (−117 dBFS) | death and the void |
| 9 · the reward | 2:30 | a coupling snap: the hero is grabbed back onto 1:2, and the 7/8 aksak hands arrive (2+2+3). The reed sings call and answer. The trickster now clicks on every group start, so the limp itself gets a colour. The cadence stops on B, not A | rebirth, a strange new energy |
| 10 · the road back | 2:57 | 12/8 again, speeding up from 80 to 96. The stair runs a six-note cell up the Farey scale, one rung higher each bar. The reed and the mentor chase the motif. First the mentor follows a beat behind, an octave up. Then it follows an eighth behind, upside down. Then both climb in contrary motion and don't land | pursuit, rising pressure |
| 11 · resurrection | 3:19 | every pitched voice lets go at once and is stirred for four seconds, then all are grabbed together. The motif sounds in three-voice counterpoint: the reed as written, the mentor upside down a beat later, and the stair's bass playing it inside the Farey scale at half speed (measured 110, 132, 165, 147 Hz). The pad moves to D. The reed stops on E, the mentor on B | everything at stake, then a new whole |
| 12 · the return | 3:34 | the breathing B theme from the third draft, then the ending you liked, its shape unchanged: let go together, the coda home to the 1D point. Beside it, faint and an octave up, the stair plays A C E D in its strange scale | home, but changed: the elixir |

## Questions left open, on purpose

These phrases end off the tonic: the refusal (on E), the mentor's canon (E over G♯), the tests (B), the cave (the reed held on B), the reward (B), the road back (climbing, no landing) and the resurrection (E and B over a D pad). The only arrival on A is the very end, which you said you liked.

## Checked from the render and the stems

- The stair in the cave, measured on each held lock: 293, 275, 264, 252, 245, 220, 195, 189, 176, 166, 147, 126, 110, 88, 73 Hz.
- The stair's bass at the resurrection: 1:1 → 110 Hz, 2:3 → 132, 1:3 → 166, 1:2 → 147. That's A C E D.
- The trickster: the dominant pitch is 439.5 Hz after every click; only the colour changes.
- The ordeal's leaps, measured: 1144, 56, 954, 63, 514, 98, 880, 252 Hz…
- The silence before the reward: −117 dBFS for 1.6 s.
- No non-finite samples in any of the eleven voices. Every knob write lands in time order (checked with an instrumented copy of the script).

Nobody has listened yet. I chose the feelings in the table, and they are a plan, not a result. The weird chapters (refusal, threshold, ordeal) are the most likely to be too long or too loud. The threshold growl is a dense stack of harmonics, and it may need taming.

Re-render: `node render_etude_2e.mjs`, then `python3 etude_spectrogram_2e.py $TMPDIR/etude_two_e_mono.wav etude_two_e_heros_journey.png` and `afconvert -f m4af -d aac -b 256000 etude_two_e_heros_journey.wav etude_two_e_heros_journey.m4a`. `STEMS=1` also writes each voice's stem to `$TMPDIR`. The earlier drafts' files are untouched.
