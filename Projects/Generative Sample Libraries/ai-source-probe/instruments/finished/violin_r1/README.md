# MusicGen Violin — redo round 1 (cycle 38)

The finished violin (`../violin/`) with three keys re-asked of the model: A#3, C4 and C5,
the three the measurements liked least. Every other key plays the same sample as before.

- **ab.wav**: A#3, C4, C5, each held 4 s, shipped build first and then this one.
- **phrase.wav**: the same scale and eight-bar tune as `../violin/phrase.wav`. Play them back to back.
  The tune is in C, so C4 and C5 come round often.
- **To play it:** drag `MusicGen Violin.dslibrary` onto DecentSampler. If the shipped one is loaded too,
  rename one of them; they share a name.
- **redo.json**: where each key's new sample came from, and every fresh take's grade.

Not verified: nobody has heard either build yet. C4's new sample is 10 cents sharp at its own key
(inside the 20 c limit; the shipped build's worst key was 2.4 c).
