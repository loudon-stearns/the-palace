"""paths.py — the test paths for Blood Compressor: parameter moves and input signals
rendered through the sketch and the engine (and the face's JavaScript engine), and
what each must pass. Shape: VST Template's template/reference/paths.py.

The compressor is not chaotic, so every path is gated sample for sample over its
whole length. Each path exercises one term while every other stays still enough to
see it.
"""
import numpy as np

SR = 44100


def heartbeat(t, sr):
    """The browser vessel's heartbeat: lub then dub at 72 bpm on a 110 Hz tone with two
    overtones over a quiet diastolic hum. Peaks near -3 dBFS, dub near -8, hum near -34."""
    T = 60.0 / 72.0
    u = t % T
    lub = np.where(u < 0.012, u / 0.012, np.exp(-(u - 0.012) / 0.07))
    w = u - 0.30
    dub = np.where(w < 0, 0.0, np.where(w < 0.010, w / 0.010, np.exp(-(w - 0.010) / 0.05)))
    env = np.minimum(1.0, 0.025 + 0.72 * lub + 0.40 * dub)
    ph = 2 * np.pi * 110.0 * t
    tone = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)) / 1.45
    x = env * tone
    return np.vstack([x, x])


def drums(t, sr, swing=0.0):
    """A plain beat at 100 bpm: kick on 1 and 3, snare on 2 and 4, eighth hats.
    Noise from a fixed seed, so every run hears the same snare."""
    rng = np.random.default_rng(7)
    noise = rng.uniform(-1, 1, len(t))
    beat = 60.0 / 100.0
    pos = t % (4 * beat)
    k = np.zeros_like(t)
    for b in (0, 2):
        u = pos - b * beat
        on = u >= 0
        f = 45 + 90 * np.exp(-np.maximum(u, 0) / 0.03)
        ph = 2 * np.pi * np.cumsum(f) / sr
        k += np.where(on, np.exp(-np.maximum(u, 0) / 0.25) * np.sin(ph), 0)
    s = np.zeros_like(t)
    for b in (1, 3):
        u = pos - b * beat
        s += np.where(u >= 0, np.exp(-np.maximum(u, 0) / 0.12), 0) * (0.6 * noise + 0.4 * np.sin(2 * np.pi * 190 * t))
    h = np.where(True, np.exp(-((t % (beat / 2)) / 0.02)), 0) * noise * 0.25
    x = 0.7 * k + 0.45 * s + h
    return np.vstack([x, 0.92 * x])


def bass_and_hats(t, sr):
    """A 41 Hz sub bass in two-beat bursts under quiet hats: what the sidechain
    high-pass is for."""
    rng = np.random.default_rng(11)
    noise = rng.uniform(-1, 1, len(t))
    on = ((t % 1.2) < 0.6).astype(float)
    sub = 0.8 * on * np.sin(2 * np.pi * 41.2 * t)
    hats = 0.12 * np.exp(-((t % 0.15) / 0.015)) * noise
    x = sub + hats
    return np.vstack([x, x])


def left_bursts(t, sr):
    """Left: loud bursts of a 220 Hz tone. Right: a quiet steady 330 Hz tone.
    With the stereo link the right side must duck when the left bursts."""
    on = ((t % 1.0) < 0.4).astype(float)
    L = 0.9 * on * np.sin(2 * np.pi * 220 * t)
    R = 0.1 * np.sin(2 * np.pi * 330 * t)
    return np.vstack([L, R])


PATHS = [
    dict(name="threshold-sweep", secs=8.0, inputs=heartbeat,
         values={"threshold": lambda t: -50.0 + 45.0 * t / 8.0, "ratio": 8.0},
         gate=dict(exact_until=None)),
    dict(name="attack-sweep", secs=8.0, inputs=drums,
         values={"threshold": -30.0, "ratio": 10.0, "attack": lambda t: 0.005 * (60.0 ** (t / 8.0))},
         gate=dict(exact_until=None)),
    dict(name="release-sweep", secs=8.0, inputs=drums,
         values={"threshold": -30.0, "ratio": 10.0, "release": lambda t: 0.02 * (100.0 ** (t / 8.0))},
         gate=dict(exact_until=None)),
    dict(name="knee", secs=6.0, inputs=heartbeat,
         values={"threshold": -14.0, "ratio": 20.0, "knee": lambda t: 24.0 * t / 6.0},
         gate=dict(exact_until=None)),
    dict(name="stereo-link", secs=4.0, inputs=left_bursts,
         values={"threshold": -24.0, "ratio": 6.0, "attack": 0.01, "release": 0.15},
         gate=dict(exact_until=None)),
    dict(name="sidechain-hpf", secs=7.2, inputs=bass_and_hats,
         values={"threshold": -30.0, "ratio": 8.0, "sc_hpf": lambda t: 1.0 * (500.0 ** (t / 7.2))},
         gate=dict(exact_until=None)),
    dict(name="detector-makeup-bypass", secs=6.0, inputs=drums,
         values={"threshold": -28.0, "ratio": 4.0, "detector": lambda t: 0.001 * (100.0 ** (t / 6.0)),
                 "makeup": lambda t: 2.0 * t, "bypass": lambda t: ((t > 2.0) & (t < 3.0)).astype(float)},
         gate=dict(exact_until=None)),
]
