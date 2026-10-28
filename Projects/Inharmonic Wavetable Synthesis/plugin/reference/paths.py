"""paths.py — what Bent Line must pass. Nothing here is random or chaotic, so the
engine must match the sketch sample for sample on every path (VST Template's
paths.py says what each gate key means). Each path exercises one term."""
import numpy as np

SR = 44100

PATHS = [
    # the granted switch: the same bell, struck under Rank, then under Nearest
    dict(name="bell-filings", secs=3.0,
         values=dict(material="Bell", filing=lambda t: np.where(t < 1.5, 0.0, 1.0), decay=4.0),
         notes=[(0.0, 1.3, 57, 100), (1.5, 1.3, 57, 100)],
         gate=dict(exact_until=None)),
    # the bend knob swept from the flat line to twice the real piano, on a chord, the organ wall drifting
    dict(name="bend-sweep", secs=3.0,
         values=dict(material="Piano A2", bend=lambda t: 2.0 * t / 3.0, apos=lambda t: 0.4 + 0.1 * t, decay=6.0),
         notes=[(0.0, 2.8, 45, 100), (0.0, 2.8, 52, 90), (0.0, 2.8, 61, 80)],
         gate=dict(exact_until=None)),
    # the vibraphone wearing its own measured levels, its clock run at double speed
    dict(name="own-walls", secs=2.5,
         values=dict(material="Vibraphone", wall="Own", speed=2.0, decay=30.0),
         notes=[(0.0, 2.2, 60, 110), (0.8, 1.4, 67, 70)],
         gate=dict(exact_until=None)),
    # the bowl filed nearest, its bend scanned by hand (the organ wall held: with only seven slots sounding,
    # its lumpy frames make a 20 ms knob lag read as 0.7 dB, so the A sweep rides on the piano path)
    dict(name="manual-scan", secs=2.5,
         values=dict(material="Singing bowl", filing="Nearest", clock="Manual",
                     bpos=lambda t: t / 2.5, apos=0.35, level=lambda t: -18.0 + 4.0 * t),
         notes=[(0.0, 2.3, 50, 100)],
         gate=dict(exact_until=None)),
    # twelve quick notes into eight voices: stealing, a retrigger, a material change while ringing
    dict(name="crowded", secs=2.5,
         values=dict(material=lambda t: np.where(t < 1.2, 2.0, 5.0), release=0.2, decay=1.5),
         notes=[(0.08 * k, 0.4, 55 + (k * 5) % 17, 70 + 4 * k) for k in range(12)] + [(1.3, 0.5, 60, 100), (1.32, 0.5, 60, 100)],
         gate=dict(exact_until=None)),
]
