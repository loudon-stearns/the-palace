"""paths.py — what Belief Cloud must pass. Every random draw is shared, so the
engine must match the sketch sample for sample on every path (the template's
paths.py says what each gate key means)."""
import numpy as np

SR = 44100
A_MINOR_PENTATONIC = dict(pc_c=1.0, pc_cs=0.0, pc_d=1.0, pc_ds=0.0, pc_e=1.0, pc_f=0.0,
                          pc_fs=0.0, pc_g=1.0, pc_gs=0.0, pc_a=1.0, pc_as=0.0, pc_b=0.0)

PATHS = [
    # the flat prior's clicks, then C E G comes to be believed, then G gives way to A
    dict(name="chord-belief", secs=5.0,
         notes=[(0.8, 3.4, 60, 100), (0.8, 3.4, 64, 100), (0.8, 2.2, 67, 100), (3.0, 1.2, 69, 90)],
         gate=dict(exact_until=None)),
    # a painted A-minor-pentatonic prior that hums on its own (prior tone), then low A and E
    dict(name="painted-prior", secs=4.0,
         values=dict(prior_shape=1.0, prior_tone=0.7, register=57.0, register_width=1.5, **A_MINOR_PENTATONIC),
         notes=[(2.0, 2.0, 45, 110), (2.0, 2.0, 52, 90)],
         gate=dict(exact_until=None)),
    # doubt and grain rate sweep while a soft and a hard note are held: velocity sets belief
    dict(name="sweeps", secs=4.0,
         values=dict(doubt=lambda t: 0.05 * 40.0 ** (t / 4.0), rate=lambda t: 60.0 * 6.0 ** (t / 4.0),
                     time_to_believe=0.4, velocity=1.0, spread=lambda t: t / 4.0,
                     prior_shape=lambda t: np.where(t < 2.0, 0.0, 0.6)),
         notes=[(0.2, 3.6, 55, 30), (0.2, 3.6, 62, 127)],
         gate=dict(exact_until=None)),
    # twenty quick notes with a long let-go: more than sixteen beliefs, so slots are evicted
    dict(name="crowded", secs=3.0,
         values=dict(let_go=8.0, press=0.02),
         notes=[(0.1 * k, 0.12, 48 + (k * 7) % 24, 60 + 3 * k) for k in range(20)],
         gate=dict(exact_until=None)),
]
