# Étude No. 2, fourth draft — "Two Grooves"

The third draft ([[Étude No. 2c — score]]) moved through rubato, groove and rubato, but it had only one groove, which it played at two speeds. This draft gives the hands section (bars 17–24) a beat of its own. Everything else is the third draft, note for note: the 12/8 knot section with its West African bell, the slowdown in the let-go, the B theme that breathes, and the free-time ending. Same rule as always: every voice is `RNBO/torus_2d_hopf.codebox` running from its own text, and the score is only knob moves. 158 s.

**The aksak.** The hands are now in 7/8, grouped 2+2+3, the limping meter of Bulgarian rachenitsa and Turkish aksak. Each old 12/8 hands bar becomes two 7/8 bars, 14 eighths instead of 12. The eighth note keeps its speed across the change, so you hear the groove change shape while the tempo stays put. Played straight, the long beat would be 1.5 short beats. Here it is 1.4, a little early, the way dancers lean into it. The section is about 4 beats (3 s) longer than in the third draft.

**The motif fits the meter.** A C E D, as 2 · 2 · 3 · 7 eighths, fills exactly one pair of 7/8 bars. The long E lands on the long beat and D takes the whole next bar. So the hands sing call and answer:

| bars | the reed sings |
|---|---|
| 17 · 18 | the motif A C E D · its retrograde D E C A |
| 19 · 20 | the same pair, up a fourth |
| 21 · 22 | the motif inverted an octave up · a falling answer A G F E |
| 23 · 24 | the cadence D C B A · A held |

**The beat re-cuts itself.** The kick plays low on each 7/8 downbeat, leans on each long beat, and ghosts the second short beat in every other bar. A pickup closes every fourth bar. The bell drops the 12/8 standard pattern for x.xx x.. in each 7/8, low on the downbeats and accented on the long beat. The shaker accents where each group starts. The Membrane drone's shear kicks and its bend turns now land on the long beats.

**Checked from the render and the stems:**
- Kick gaps in the hands: 0.50 · 0.50 · 0.70 s, repeating. That is short, short, long at 1.4×, at 80 beats a minute (an eighth is 0.25 s).
- The reed's first pair of 7/8 bars, measured: A 220 → C 262 → E 330 → D 294 Hz.
- The let-go slip rates are unchanged from the third draft, still matching the tempo to within 0.003 Hz.
- No non-finite samples in any voice.

Nobody has listened to it yet. The aksak is my reading of Balkan practice, written from the meter and not checked against a recording.

Re-render: `node render_etude_2d.mjs`, then `python3 etude_spectrogram_2d.py $TMPDIR/etude_two_d_mono.wav etude_two_d_two_grooves.png` and `afconvert -f m4af -d aac -b 256000 etude_two_d_two_grooves.wav etude_two_d_two_grooves.m4a`. Earlier drafts' files are untouched.
