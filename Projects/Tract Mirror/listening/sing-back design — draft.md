# Sing-in, sing-back — a first design for Tract Mirror's listening version

*Draft from the steward, cycle 3, 2026-11-17. A workshop draft, not an entry. It is where the plan's last move ("learn to speak by listening") would go, written from what three probes measured. Nothing here touches the plugin.*

## What it does, in one breath

You sing a vowel into Tract Mirror. It listens, finds the tube that would sing that sound, draws it, and sings it back on the keyboard. Sing five vowels and you have your own vowel pad; play it and it is your mouth shape at any pitch.

## What the probes settled

1. **The ear sings along, it doesn't pick formants.** Plain LPC hears F1 3–18% low because the glottal pulse drags the low end. Better pickers made it worse (ear.py). The ear that works computes the exact harmonic spectrum Tract Mirror itself would sing for a candidate tube at the heard pitch, and reshapes the tube until the harmonics match (singalong.py). The source is inside the model, so its pull cancels.
2. **The harmonics pin down the mouth, not only the vowel.** Three formants can come from very different tubes (cycle 1's /e/: 11.9 dB of shape apart). Twenty-odd harmonic levels carry more: on /e/ at 110 Hz the sing-along ear recovered the tube within 0.2 dB of shape. Across twelve tubes at four pitches, F1 comes back within 0.1–0.4% from G2 to A3 and shape within about 1 dB at the low pitches. The high voice is the hard case: at E4 the comb is sparse, shape comes back about 4 dB loose, and a vowel whose F1 sits below the sung pitch (/u/, /i/) can't be heard at all, since no harmonic touches it.
3. **The mirror read backwards is a starting guess, not the answer.** Reflection coefficients taken straight from LPC (Wakita) are beautiful on a clean echo and fragile on a sung vowel. Useful as a seed when it lands; not trusted alone.
4. **Gate on the audio path.** Every fit is scored on the as-sung model, lip filter on (tuning item 1).

## The shape of the feature

- **Capture.** One button, "listen": record up to 2 seconds, keep the steadiest half (the probe's `steady_part`), find f0.
- **Hear.** Harmonic levels up to 4.5 kHz, band energy not peak height (vibrato smears peaks). Fit with a free gain and a free spectral slope, because your source is not Tract Mirror's pulse.
- **Show while it hears.** The 3D tube morphs from the uniform tube toward the fit as the optimizer runs. The fit *is* the picture: every step it takes is a tube on screen. This is the objects-to-think-with moment: you watch your own mouth being found.
- **Keep.** The heard tube goes into a user slot on the XY pad, beside the six built-ins. Same 64-point area format as vowels.json, so the engine needs nothing new to sing it.
- **Sing back.** Played at any pitch from the keyboard. The tube stays; the source is Tract Mirror's.

## Where it runs

The fit is about 40 seconds per vowel in Python across seven starting mouths. In the plugin it has to be a background job off the audio thread, and faster: start from the nearest of the six vowels only (one start, not seven), fit 19 cosine terms with an analytic gradient instead of finite differences. A few seconds is fine for a "listen" button. Real-time tracking of a sung line is a later, different thing.

## What waits on what

- **The Max pause doesn't touch this.** It is JUCE and C++, not Max.
- **The vowel refit comes first.** If the refit goes in, user tubes and built-in tubes are scored the same way. If not, they disagree by up to 14% on F1, and a heard vowel would sound brighter than its built-in neighbour.
- **Your real voice is the missing test.** Every good number so far is Tract Mirror hearing itself. On the two macOS voices the sing-along ear fails, but those clips are a quarter second of gliding speech, not a held vowel, so they don't say much either way. A recording of you singing a-e-i-o-u at a comfortable pitch, and one higher, is the next input the ear needs.

## Open

- Does a fitted tube *look* like a mouth? It matches the sound; the picture is only as anatomical as the prior allows.
- Nasal and breathy vowels are outside the model (no side branch, no noise fit).
- Tract length: Samantha's shorter tract broke the mirror read backwards. The sing-along ear may want tract length as a fitted parameter.
