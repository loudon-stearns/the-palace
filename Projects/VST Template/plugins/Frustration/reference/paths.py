"""paths.py — what the Frustration plugin must pass.

The first three are ride.py's renders, the fourth is ride_warm.py's breathe at
N = 64, and the last walks the knobs ride.py kept fixed. See the template's
reference/paths.py for what each gate key means.

Two kinds of gate, measured on 2026-10-20 before the tolerances were set:

- **Sample-exact, wherever the tone is not tearing.** This is the proof of the
  port. It is sharp: a coupling 0.5 % off shows up at 0.15 of peak within two
  seconds, against a tolerance of 1e-6 and a measured fit of about 5e-8.
- **Behaviour, once a path crosses the edge.** There the model amplifies the
  last bit of rounding, and two correct implementations part within a second or
  two. In half-second windows their fundamentals then differ by up to 1.4 Hz in
  mean and spread (sketch, engine and plugin, all correct). Coupling 2 or 5 %
  off, stretch 5 % off or inertia 10 % off fell inside that same scatter. So
  this gate, at 2 Hz, shows only that the plugin stays in the same regime as the
  sketch: torn where it tears, held where it holds. It cannot see a
  few-percent error; the exact stretch before it can.
"""
import numpy as np

SR = 44100


def logsine(lo, hi, per):
    return lambda t: np.exp(np.log(lo) + (np.log(hi) - np.log(lo)) * (0.5 - 0.5 * np.cos(2 * np.pi * t / per)))


def regime(after):
    return [dict(probe="fundamental", window=0.5, after=after, mean_tol=2.0, std_tol=2.0)]


BRIGHT40 = dict(source="bright", partials="40", pinned=0, voices=0.0)
BS64 = (40.0 / 64) ** 3   # ride_warm.py: stretch scaled so the path straddles a 64-partial tone's edge

PATHS = [
    dict(name="ride-breathe", secs=48.0,
         values=dict(BRIGHT40, B=logsine(4e-6, 8e-5, 12.0), K=6.0),
         gate=dict(exact_until=2.0, behaviour=regime(2.0))),
    dict(name="ride-coupling", secs=40.0,
         values=dict(BRIGHT40, B=2.5e-5, K=lambda t: 2 + 16 * (0.5 - 0.5 * np.cos(2 * np.pi * t / 20.0))),
         gate=dict(exact_until=1.0, behaviour=regime(1.0))),
    dict(name="ride-string-bar", secs=40.0,
         values=dict(BRIGHT40, pinned=1, B=logsine(0.01, 30.0, 20.0), K=1.0),
         gate=dict(exact_until=None)),
    dict(name="breathe-warm-64", secs=24.0,
         values=dict(source="warm", partials="64", B=lambda t: logsine(4e-6, 8e-5, 12.0)(t) * BS64, K=6.0),
         gate=dict(exact_until=1.0, behaviour=regime(1.0))),
    # pitch, inertia, voices and level all move; the tone stays under the edge
    # (an early run parted at 4.85 s, which wrapping the sketch's phases cured)
    dict(name="knobs", secs=6.0,
         values=dict(BRIGHT40, B=4e-6, K=6.0,
                     f0=lambda t: 110.0 * 2.0 ** (t / 6.0),
                     inertia=lambda t: np.exp(np.log(10.0) * t / 6.0),
                     voices=lambda t: np.clip(t / 3.0 - 0.5, 0, 1),
                     level=lambda t: -12.0 + t),
         gate=dict(exact_until=None)),
]
