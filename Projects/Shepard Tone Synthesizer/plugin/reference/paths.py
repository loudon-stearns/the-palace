"""paths.py — what Shepard Tone must pass. Nothing here is chaotic, so every
path must match the sketch sample for sample (VST Template's template/paths.py
says what each gate key means)."""
import numpy as np

SR = 44100

PATHS = [
    # the staircase by hand: a chromatic scale up two octaves, legato, glide on.
    # The same twelve steps twice should sound like one octave climbed twice.
    dict(name="staircase", secs=6.5,
         notes=[(0.25 * j, 0.27, 48 + j, 100) for j in range(25)],
         gate=dict(exact_until=None)),
    # one held note while the climb runs up then down: the Risset glissando
    dict(name="endless-climb", secs=6.0,
         values=dict(climb=lambda t: np.where(t < 3.0, 4.0, -6.0)),
         notes=[(0.0, 5.5, 60, 100)],
         gate=dict(exact_until=None)),
    # the window moves and narrows under a held sine stack
    dict(name="window-sweep", secs=4.0,
         values=dict(wave="sine", center=lambda t: 120.0 * (12.0 ** (t / 4.0)),
                     width=lambda t: 2.5 - 0.45 * t),
         notes=[(0.0, 3.6, 57, 100)],
         gate=dict(exact_until=None)),
    # break it, both ways: drift on a slow glide, then the cutoff from the note
    dict(name="break-drift", secs=4.0,
         values=dict(glide=0.8, drift=0.6),
         notes=[(0.0, 1.5, 48, 100), (1.4, 1.5, 55, 100), (2.8, 1.0, 67, 100)],
         gate=dict(exact_until=None)),
    dict(name="break-track-note", secs=5.0,
         values=dict(track_note=1.0, tone=8.0, resonance=0.5, climb=3.0),
         notes=[(0.0, 4.5, 60, 100)],
         gate=dict(exact_until=None)),
]
