"""paths.py — what the audio thread must do without the helper.

Each input is a sung-like tone (a vowel-ish stack with vibrato) in phrases.
`gate` and `sent` must match the sketch exactly: the same phrases opened and
closed on the same block, the same ones handed off. A click shorter than
0.2 s is let go; a 9 s held note is cut at 8 s and sent.
"""
import numpy as np

SR = 44100


def sung(t, starts_lens, f0=220.0, level=0.25):
    x = np.zeros_like(t)
    for s, l in starts_lens:
        on = (t >= s) & (t < s + l)
        tt = t[on] - s
        ph = 2 * np.pi * f0 * tt + 0.6 * np.sin(2 * np.pi * 5.5 * tt)
        env = np.minimum(1.0, np.minimum(tt, l - tt) / 0.03)
        x[on] = level * env * (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph))
    return x


def two_phrases(t, sr):
    x = sung(t, [(0.5, 1.6), (3.0, 1.2)])
    return np.stack([x, 0.8 * x])


def click_and_long(t, sr):
    x = sung(t, [(0.3, 0.08), (1.0, 9.0)], f0=180.0)
    return np.stack([x, x])


PATHS = [
    dict(name="two-phrases", secs=5.0, inputs=two_phrases,
         values={"dry": lambda t: -6.0 + 6.0 * np.sin(t), "gate": -45.0},
         gate=dict(exact_until=None, behaviour=[
             dict(probe="gate", window=0.05, mean_tol=1e-9, std_tol=1e-9),
             dict(probe="sent", window=0.05, mean_tol=1e-9, std_tol=1e-9)])),
    dict(name="click-and-long", secs=11.0, inputs=click_and_long,
         values={"gate": -40.0},
         gate=dict(exact_until=None, behaviour=[
             dict(probe="gate", window=0.05, mean_tol=1e-9, std_tol=1e-9),
             dict(probe="sent", window=0.05, mean_tol=1e-9, std_tol=1e-9)])),
]
