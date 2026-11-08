"""paths.py — what Neural Granular must pass (the template's paths.py says what
each gate key means). Most paths run a crowd of 64 so the Python sketch stays
quick; one runs the default 128."""
import numpy as np

SR = 44100

PATHS = [
    # one held C3 while tightness climbs through the lock point (1.0 with no pacemakers):
    # hiss, then the crowd snapping into a tone
    dict(name="lock-sweep", secs=4.0,
         values=dict(size=1, life=0.0, tight=lambda t: 0.5 * t),
         notes=[(0.0, 3.8, 48, 110)],
         gate=dict(exact_until=None, plugin_rms_db=1.5)),
    # tight held past the bare lock point while the pacemaker share rises, moving the lock away
    dict(name="life-rises", secs=3.0,
         values=dict(size=1, tight=1.6, life=lambda t: 0.2 * t),
         notes=[(0.0, 2.9, 45, 100)],
         gate=dict(exact_until=None)),
    # The plugin smooths tightness and lumpiness and lands automation once per 64-sample
    # block. A crowd near its lock point is sensitive to when a move lands, so the
    # plugin's crowd reaches the same lock a few milliseconds apart from the sketch's:
    # up to 1.06 dB in a quarter second (measured 2026-11-07, the phrase path). These paths allow 1.5 dB.
    # a phrase with glide, lumpiness swept from even to lumpy, the spike widening
    dict(name="phrase-lump-width", secs=3.0,
         values=dict(size=1, tight=1.1, life=0.1, glide=0.12,
                     lump=lambda t: t / 3.0, width=lambda t: 0.6 * (4.0 ** (t / 3.0))),
         notes=[(0.0, 0.7, 43, 100), (0.6, 0.9, 50, 70), (1.4, 0.6, 55, 120), (2.0, 0.9, 47, 90)],
         gate=dict(exact_until=None, plugin_rms_db=1.5)),
    # the default crowd of 128 with even level off: the lock is also a swell
    dict(name="swell-128", secs=2.0,
         values=dict(even=0, spread=0.2, tight=lambda t: 0.4 + 0.6 * t),
         notes=[(0.0, 1.9, 52, 127)],
         gate=dict(exact_until=None, plugin_rms_db=1.5)),
]
