"""paths.py — what Action Potential must pass (the template's paths.py says what
each gate key means). Crowds of 8 and 16 keep the Python sketch quick; one path
runs the default 32, one the single neuron."""
import numpy as np

SR = 44100

PATHS = [
    # one held A2 while coupling climbs through the lock: a scattered crowd pulling into one tone
    dict(name="lock-sweep", secs=4.0,
         values=dict(size="16", spread=0.1, couple=lambda t: 0.005 * t),
         notes=[(0.0, 3.8, 45, 110)],
         gate=dict(exact_until=None, plugin_rms_db=1.5)),
    # the single neuron (Crowd = 1): the recovery's damping swept from ringing to smooth,
    # the undershoot deepening, over a phrase with glide
    dict(name="one-neuron", secs=3.0,
         values=dict(size="1", glide=0.08, damp=lambda t: 0.05 * (40.0 ** (t / 3.0)),
                     hyp=lambda t: -0.1 - 0.2 * t),
         notes=[(0.0, 0.8, 40, 100), (0.7, 0.9, 47, 80), (1.5, 0.6, 52, 120), (2.1, 0.8, 43, 90)],
         gate=dict(exact_until=None)),
    # eight neurons, locked, while the spike itself changes: longer, a slower Na rise,
    # a higher peak, a longer refractory time
    dict(name="spike-shape", secs=3.0,
         values=dict(size="8", couple=0.02, spike=lambda t: 0.4 * (8.0 ** (t / 3.0)),
                     rise=lambda t: 0.15 + 0.2 * t, peak=lambda t: 1.2 + 0.4 * t,
                     refr=lambda t: 1.0 + 2.0 * t),
         notes=[(0.0, 2.9, 38, 100)],
         gate=dict(exact_until=None, plugin_rms_db=1.5)),
    # The plugin smooths its knobs and lands automation once per 64-sample block, so a
    # crowd crossing its lock gets there a few milliseconds apart from the sketch's. With
    # even level off that shows as loudness: 1.53 dB in the quarter second at 1.0 s, where
    # the swell crosses the lock (measured 2026-11-09; the engine itself matches to 4e-8).
    # This path allows 2 dB; the others keep 1.5 or 0.5.
    # the default crowd of 32 with even level off, the leak and threshold spreads widening
    # as coupling rises: the lock is also a swell
    dict(name="swell-32", secs=2.0,
         values=dict(even=0, spread=0.15, couple=lambda t: 0.004 + 0.008 * t,
                     leakspread=lambda t: 0.1 * t, thrspread=lambda t: 0.05 * t),
         notes=[(0.0, 1.9, 50, 127)],
         gate=dict(exact_until=None, plugin_rms_db=2.0)),
]
