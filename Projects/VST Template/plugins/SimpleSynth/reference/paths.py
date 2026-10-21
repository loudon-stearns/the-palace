"""paths.py — what Simple Synth must pass. Nothing here is chaotic, so every
path must match the sketch sample for sample (the template's paths.py says
what each gate key means)."""
import numpy as np

SR = 44100

PATHS = [
    # four plucked notes on the default patch: saw, filter envelope, a little vibrato
    dict(name="melody", secs=3.5,
         notes=[(0.0, 0.4, 48, 100), (0.5, 0.4, 52, 80), (1.0, 0.4, 55, 110), (1.5, 1.0, 60, 127)],
         gate=dict(exact_until=None)),
    # one held note while the cutoff sweeps up through a resonant square. The
    # plugin smooths cutoff over 20 ms; on a sweep of 1.7 octaves a second past
    # sharp resonant peaks that lag moves a quarter second's loudness by up to
    # about 0.7 dB (measured 2026-10-20), so this path allows 1.5 dB
    dict(name="filter-sweep", secs=4.0,
         values=dict(wave="square", resonance=0.85, filter_env=0.0, vib_depth=0.0,
                     cutoff=lambda t: 80.0 * (100.0 ** (t / 4.0))),
         notes=[(0.0, 3.6, 45, 100)],
         gate=dict(exact_until=None, plugin_rms_db=1.5)),
    # pitch envelope and vibrato; a note held under another (last-note priority,
    # back to the held note without a retrigger), then a fresh note
    dict(name="pitch-vibrato-legato", secs=3.5,
         values=dict(wave="triangle", pitch_env=12.0, pitch_decay=0.08, vib_depth=40.0, vib_rate=6.0),
         notes=[(0.0, 2.0, 50, 100), (0.5, 0.5, 62, 90), (2.2, 0.8, 57, 100)],
         gate=dict(exact_until=None)),
    # each waveform for a second
    dict(name="waves", secs=4.0,
         values=dict(wave=lambda t: np.floor(t), filter_env=1.0, cutoff=3000.0),
         notes=[(k, 0.8, 48, 100) for k in range(4)],
         gate=dict(exact_until=None)),
    # slow envelopes, soft velocity, keyboard tracking at full
    dict(name="envelopes", secs=3.0,
         values=dict(a_attack=0.5, a_release=1.0, f_attack=0.3, f_decay=0.8, filter_env=4.0, key_track=1.0),
         notes=[(0.0, 1.5, 36, 64)],
         gate=dict(exact_until=None)),
]
