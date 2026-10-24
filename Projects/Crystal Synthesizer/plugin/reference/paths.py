"""paths.py — what Crystal Synthesizer must pass. Nothing here is random or chaotic,
so the engine must match the sketch sample for sample on every path (the
template's paths.py says what each gate key means). Each path exercises one term."""
import numpy as np

SR = 44100

PATHS = [
    # ruby at the defaults: a chord, the birefringent pair beating, fire fanning each strike
    dict(name="ruby-chord", secs=2.5,
         notes=[(0.05, 1.2, 57, 100), (0.05, 1.2, 61, 90), (0.05, 1.2, 64, 80), (1.3, 0.6, 69, 127)],
         gate=dict(exact_until=None)),
    # diamond, the only bell: cubic, so the axis angle does nothing; a wide fire fan
    dict(name="diamond-fire", secs=2.5,
         values=dict(crystal="Diamond", fire=300.0, hardness=0.3),
         notes=[(0.0, 2.0, 45, 110), (0.6, 1.0, 69, 60)],
         gate=dict(exact_until=None)),
    # zircon's optics (tetragonal slot, dn 0.059) while the crystal turns from the
    # axis to across it: the extraordinary ray retunes while it rings
    dict(name="turning", secs=2.5,
         values=dict(crystal="Tetragonal", lifetime=4.0, angle=lambda t: 90.0 * np.clip(t / 2.0, 0.0, 1.0),
                     spread=lambda t: np.where(t < 1.5, 1.0, 4.0)),
         notes=[(0.0, 2.4, 52, 100)],
         gate=dict(exact_until=None)),
    # labradorite's wide partials; lifetime, rolloff, width and level move; velocity sets hardness
    dict(name="labradorite-sweeps", secs=2.5,
         values=dict(crystal="Labradorite", lifetime=lambda t: 0.5 * 20.0 ** (t / 2.5),
                     rolloff=lambda t: 0.5 + 0.2 * t, width=lambda t: t / 2.5, level=lambda t: -12.0 + 4.0 * t,
                     vel_bright=1.0),
         notes=[(0.0, 0.3, 48, 30), (0.5, 0.3, 48, 127), (1.0, 1.4, 55, 90)],
         gate=dict(exact_until=None)),
    # twelve quick notes into eight voices: stealing with its 3 ms fade, a retrigger of a
    # ringing note, a crystal change while ringing, and a short release
    dict(name="crowded", secs=2.5,
         values=dict(crystal=lambda t: np.where(t < 1.2, 5.0, 3.0), release=0.3, lifetime=3.0),
         notes=[(0.08 * k, 0.4, 60 + (k * 5) % 17, 70 + 4 * k) for k in range(12)] + [(1.3, 0.5, 60, 100), (1.32, 0.5, 60, 100)],
         gate=dict(exact_until=None)),
]
