"""paths.py — the test paths for Slime Mold Delay: what plays into the dish, the knob
moves, and what each must pass.

Every path is sample-exact (engine = sketch to 1e-6 of peak) for its whole length: the
dish's decisions depend only on the input's band levels and the knobs, so the sketch and
the plugin grow the same dish, tube for tube, and the network's sound follows.

  moves    the cycle-8 demo, heard as a plugin: bass plucks for 7 s, then the music moves
           up to the highs. The mesh holds for its 6 s grace, carves down to roads, and
           the bass roads let go once the highs take over.
  starve   Feed low, Clock at 3x and a tight budget: the dish thins hard and fast, many
           ticks per 30 Hz frame, roads pulling back.
  ring     the Ring dish, Regen high, Flow speed gliding 0.5 -> 2 dish/s (the echoes
           rise in pitch as the streaming speeds up), and Cover again at 5 s laying a
           second mesh over the carved roads.
  scatter  the Scatter dish (its flakes placed by the dish's own random draw), a chord of
           every band at once.
"""
import numpy as np

SR = 44100


def pluck(t, start, f, amp=0.3, decay=5.0):
    x = np.zeros_like(t)
    m = t >= start
    tt = t[m] - start
    x[m] = amp * np.exp(-tt * decay) * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt))
    return x


def music(events, pan=0.25):
    """events: [(start s, Hz)]; returns inputs(t, sr) -> (2, steps)."""
    def fn(t, sr):
        x = np.zeros_like(t)
        for st, f in events:
            x += pluck(t, st, f)
        return np.vstack([x * (1 - pan), x * (1 + pan)]) * 0.8
    return fn


def every(step, start, stop, hz):
    return [(s, hz[i % len(hz)]) for i, s in enumerate(np.arange(start, stop, step))]


MOVES = every(0.5, 0.0, 7.0, [110.0, 98.0, 130.8]) + every(0.5, 7.0, 14.0, [1760.0, 2093.0, 1568.0])
CHORD = [(s + 0.013 * k, f) for s, _ in every(0.8, 0.0, 8.0, [0]) for k, f in enumerate([110.0, 293.7, 740.0, 1975.5, 4698.6])]

PATHS = [
    dict(name="moves", secs=14.0, inputs=music(MOVES),
         values={},
         gate=dict(exact_until=None)),
    dict(name="starve", secs=8.0, inputs=music(every(0.4, 0.0, 8.0, [110.0, 740.0, 1975.5])),
         values={"feed": 0.15, "clock": 3.0, "budget": 1.2},
         gate=dict(exact_until=None)),
    dict(name="ring", secs=10.0, inputs=music(every(0.45, 0.0, 10.0, [293.7, 740.0, 110.0])),
         values={"dish": 1, "regen": 1.4, "flow": lambda t: 0.5 * 4.0 ** (t / 10.0),
                 "cover": lambda t: (t >= 5.0).astype(float)},
         gate=dict(exact_until=None)),
    dict(name="scatter", secs=8.0, inputs=music(CHORD),
         values={"dish": 2, "dry": 0.0},
         gate=dict(exact_until=None)),
]
