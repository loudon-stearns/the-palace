# MusicGen Flute — finished, with redo round 1 (cycle 39)

The flute given the violin's whole pass (Loudon, `gsl-steward-077`: "give the flute the same pass").
`../flute/` is the finishing pass alone: every loop body at one level, the model's first breath
pulled down, velocity on loudness and brightness. This folder is that build with three keys
re-asked of the model: G4, C#4 and C#5, the three the measurements liked least. Every other key
plays the same sample as `../flute/`.

- **ab.wav**: G4, C#4, C#5, each held 4 s, the finished build first and then this one.
- **phrase.wav**: the two-octave scale and the eight-bar tune, in C5. Play it against `../flute/phrase.wav`.
- **held.wav**: low, middle and high keys held.
- **To play it:** drag `MusicGen Flute.dslibrary` onto DecentSampler, or load `MusicGen Flute.sfz` in sforzando.
- **redo.json**: where each key's new sample came from, and every fresh take's grade.

Why these three: G4's take swelled 11.6 dB into its loop; the finishing pass could lift its
opening only 8 dB, and the lift made its loop pump (3.4 dB at the seam, limit 1.5), so the
finished build had one seam that failed. C#4 had to be moved most of any key (+4.3 dB) and
clicked nearest the limit (4.75 of 6 dB). C#5 faded *down* into its loop by 2.6 dB, and its first
breath had to be cut 6.8 dB.

Not verified: nobody has heard either build. C#4's new take still needed the full 8 dB lift
before its loop, and its swell is a little worse than before (2.2 → 2.9 dB).
