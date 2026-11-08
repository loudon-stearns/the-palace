"""paths.py — what Wavetable Scanner must pass. Nothing here is chaotic, so every path must match
the reference (the browser synth's engine, sketch.py) sample for sample.

At 48 kHz a 16-sample mark falls every 1/3000 s, so every note time here is a multiple of
1/3000 s and every moving parameter is held still within each 16 samples (q() below)."""
import numpy as np

SR = 48000


def q(f):
    """a moving value, held within each 16-sample block, as the JS engine takes it"""
    return lambda t: f(np.floor(np.round(t * SR) / 16) * 16 / SR)   # round first: t * SR lands a hair under a whole sample


CHORD = [(0.0, 1.5, 48, 100), (0.0, 1.5, 55, 90), (0.0, 1.5, 60, 110), (0.0, 1.5, 64, 80)]

PATHS = [
    # the FM chain, held chord, Position swept front to back by hand: the morph in motion
    dict(name="fm-sweep", secs=3.0,
         values=dict(table="fm chain", unison="3", detune=12.0, cutoff=9000.0, reso=0.2, a_release=0.5,
                     position=q(lambda t: np.minimum(1.0, t / 2.0))),
         notes=[(0.0, 2.25, 48, 100), (0.0, 2.25, 60, 100), (0.0, 2.25, 67, 100)],
         gate=dict(exact_until=None)),
    # the cello table, polyphonic, the mod envelope scanning and the filter envelope opening
    dict(name="cello-envelopes", secs=3.0,
         values=dict(table="cello", env_to_pos=0.8, m_attack=0.3, m_decay=0.6, m_sustain=0.2,
                     cutoff=1200.0, env_to_cutoff=2.0, reso=0.4, keytrack=0.5, a_attack=0.05, a_release=0.6),
         notes=CHORD + [(1.75, 0.75, 43, 127)],
         gate=dict(exact_until=None)),
    # the classics, a triangle LFO scanning while a sine LFO wobbles the cutoff; seven unison copies
    dict(name="classics-lfo", secs=3.0,
         values=dict(table="classics", position=0.5, lfo_wave="triangle", lfo_rate=1.5, lfo_to_pos=1.0,
                     lfo2_rate=3.0, lfo2_to_cutoff=1.0, cutoff=2500.0, unison="7", detune=25.0, spread=1.0),
         notes=[(0.0, 2.5, 45, 100)],
         gate=dict(exact_until=None)),
    # legato with glide, transposed down an octave, then a high note to exercise the band limiting
    dict(name="legato-glide-high", secs=3.0,
         values=dict(table="fm chain", mode="legato", glide=0.12, transpose=-12.0, position=0.35),
         notes=[(0.0, 1.0, 60, 100), (0.5, 1.0, 67, 100), (1.25, 0.5, 72, 100), (2.0, 0.75, 108, 100)],
         gate=dict(exact_until=None)),
    # nine notes into eight voices: the oldest is stolen
    dict(name="voice-steal", secs=2.5,
         values=dict(table="cello", position=0.6, a_release=1.0),
         notes=[(k * 0.125, 2.0 - k * 0.125, 40 + 3 * k, 90) for k in range(9)],
         gate=dict(exact_until=None)),
]
