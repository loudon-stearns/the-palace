# Listening — the first probe toward v2

The next version of Tract Mirror learns to speak by listening: sing into it, and it sings back
with your tract shape. This folder holds the first probe of that idea: hear a vowel, find a tube
that makes it, and sing that tube back through the reference engine.

Run: `~/.venvs/palace-vital/bin/python listen.py` (about 4 minutes). It writes
`listen-results.json`, `heard-areas.npz`, `tubes-heard.png` and two replay WAVs (local only).

## What it found (2026-11-05)

1. **The instrument sings its vowels flat of their targets.** `vowels.json` was fitted, and every
   gate since then was measured, with the one-pole lowpass on the reflected lip wave switched OFF.
   The audio path (the Python renders and `TractEngine.cpp`, `radiationLowpass = 0.75`) has it ON.
   That lowers every formant: /e/ F1 is 458 Hz as sung against its 530 target, schwa's is
   469 against 501. `sung_formants()` is the exact as-sung model (the state matrix plus one state
   for the lowpass). It agrees with FFT peaks of the rendered impulse response to a few Hz.
2. **Fitting to what was heard works.** For each of 12 vowels the fitter finds a tube whose
   as-sung F1–F3 match the heard formants to within 1%. That includes six from two macOS voices
   Tract Mirror didn't make. It isn't told the vowel; it starts from every mouth sketch it knows
   and keeps the best fit.
3. **The ear is the weak link.** Ordinary LPC formant picking at 110 Hz hears F1 3–18% low on
   the vowels whose truth is known. F2 and F3 come within about 1–5%.
4. **The mirror read backwards (Wakita: LPC reflection coefficients taken directly as tube
   junctions) is beautiful and too fragile on its own.** On the tube's own echo it recovers
   schwa within 1.5 dB of shape. On sung audio it loses F1 to the losses at the ends of the
   tube, and on Samantha's shorter tract it fails outright. It is a good starting point for the
   fitter, not a replacement for it.
5. **Same formants, different tube.** The fitted /e/ is a narrow pipe, and the true /e/ is wide
   in the middle (11.9 dB apart in shape), yet both sing the same F1–F3. Three formants don't
   determine a tube. A listener needs a prior on what mouths look like.

## The ear, second pass (2026-11-17, cycle 3)

Run: `ear.py` (about 4 minutes), then `singalong.py` (about 12 minutes on 10 cores).

6. **Better formant pickers made the ear worse, not better.** Envelope LPC (a line through the
   harmonic tops) and a lattice fitted to the tops (Itakura-Saito, k = tanh θ) both heard F1
   further off than plain LPC (`ear-results.json`, `ear-errors.png`). The tube's own F1 peak
   sits on its pole to within 1%, so the pull comes from the glottal source, which no picker models.
7. **Singing along fixes it.** `singalong.py` computes the exact harmonic spectrum Tract Mirror would
   sing for a candidate tube at the heard pitch (Rosenberg pulse × as-sung state-space transfer ×
   lip radiation; it matches a real render to 0.06–0.2 dB), then reshapes the tube until the
   harmonics match. Twelve tubes at four pitches, mean F1 error: 0.1% at G2 and D3, 0.4% at A3,
   3.1% at E4. Plain LPC: 14%, 7%, 9%, 17%. The two misses are /u/ and /i/ at E4, where F1
   (about 250 Hz) sits below the 330 Hz fundamental and no harmonic touches it.
8. **The harmonics pin down the mouth, not just the vowel.** Mean shape error is 0.85–0.98 dB at
   the two low pitches (cycle 1's formant fit was off by up to 11.9 dB on /e/), and rises to about 4 dB at E4.
9. **The macOS voices are not a fair test of it.** Their steady part is about 0.23 s of speech with
   gliding pitch; the pitch finder reads Daniel at 364 Hz, and the fits land nowhere sensible
   (Samantha /a/ at F1 96 Hz). A sustained sung vowel is the input this ear needs next.
   Read harmonics by band energy, not peak height: vibrato smears a high harmonic's peak.
