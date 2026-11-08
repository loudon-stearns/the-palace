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
