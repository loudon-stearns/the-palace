"""paths.py — Retrospective Delay's test paths: a phrase played into one measure of
tape, then silence, through both the sketch and the plugin.

Each path is a small performance: play, stop, summon the ghost, re-lag it, play over
it, change the tempo under it. The model is not chaotic, so every path must match the
sketch sample for sample from start to finish.
"""
import numpy as np

SR = 44100


def pluck(t, start, f, dur=0.35, amp=0.25):
    u = t - start
    on = (u >= 0) & (u < dur)
    env = np.where(on, np.minimum(1.0, u / 0.003) * np.exp(-u * 9.0), 0.0)
    return amp * env * (np.sin(2 * np.pi * f * u) + 0.3 * np.sin(4 * np.pi * f * u))


def phrase(starts_notes, pan=0.3):
    """starts_notes: [(start s, midi)]; returns inputs(t, sr) -> (2, steps)."""
    def fn(t, sr):
        x = np.zeros_like(t)
        for i, (s, m) in enumerate(starts_notes):
            x += pluck(t, s, 440.0 * 2.0 ** ((m - 69) / 12.0))
        l = x * (1.0 - pan * 0.5)
        r = np.roll(x, 37) * (1.0 + pan * 0.5) * 0.8      # a little width, so the sides differ
        return np.stack([l, r])
    return fn


# 120 bpm: one measure is 2 s. The phrase fills the first measure, then you stop.
ONE_BAR = [(0.0, 62), (0.25, 65), (0.5, 69), (0.75, 72), (1.0, 70), (1.25, 69), (1.5, 65)]


def ramp(points):
    ts, vs = zip(*points)
    return lambda t: np.interp(t, ts, vs)


PATHS = [
    # Play one bar, stop; the tape holds it. Summon it up over a second, dismiss, summon.
    dict(name="summon", secs=10.0,
         values={"gain": ramp([(0, 0), (2.5, 0), (3.5, 0.85), (6.5, 0.85), (7.5, 0), (8.5, 0.6)]),
                 "lag": "half", "bpm": 120.0},
         inputs=phrase(ONE_BAR),
         # Summon's 20 ms smoothing trails a ramp; where the ramp leaves or reaches zero
         # (2.5 s, 7.5 s) the ghost is so quiet that the trail reads as up to 1.8 dB in a
         # quarter second. Every other window is within 0.4 dB. Measured 2026-11-03.
         gate=dict(exact_until=None, plugin_rms_db=2.0)),
    # The ghost held at full; re-lag it twice. Two heads crossfade, so no click.
    dict(name="relag", secs=9.0,
         values={"gain": 0.8,
                 "lag": lambda t: np.where(t < 4.37, 1, np.where(t < 6.61, 0, 2)),
                 "bpm": 120.0},
         inputs=phrase(ONE_BAR),
         gate=dict(exact_until=None)),
    # Play over the ghost: the tape listens again and the new phrase overwrites the old.
    dict(name="overwrite", secs=9.0,
         values={"gain": 0.8, "lag": "whole", "bpm": 120.0, "dry": 0},
         inputs=phrase(ONE_BAR + [(4.6, 74), (4.85, 72), (5.1, 69)]),
         gate=dict(exact_until=None)),
    # The tempo slides under a held ghost: the measure shrinks and the heads follow.
    dict(name="tempo", secs=8.0,
         values={"gain": 0.8, "lag": "half", "bpm": lambda t: np.where(t < 4.0, 120.0, 150.0)},
         inputs=phrase(ONE_BAR),
         gate=dict(exact_until=None)),
]
