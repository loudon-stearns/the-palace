"""paths.py — THE TEST PATHS: parameter moves rendered through both the sketch
and the plugin, and what each must pass.

Each path:
  name    file-safe name; renders land in out/<name>-{sketch,engine,plugin}.wav
  secs    length in seconds (at SR)
  values  parameter id -> a constant, or a function of t (seconds, an array)
          returning one value per sample. Choice parameters may be given by
          label ("64") or index. Anything left out sits at its default.
  inputs  (effects only) function of (t, sr) -> (kInputs, steps) array
  gate    what must hold (every key optional):
    exact_until  seconds of sample-for-sample match between sketch and engine
                 (None = the whole path; 0 = don't check samples)
    tol          largest allowed difference, as a fraction of the sketch's peak
                 (default 1e-6)
    behaviour    list of probe checks, for where samples can't match:
                 dict(probe=, window=seconds, mean_tol=, std_tol=, after=seconds)
                 compares each window's mean and spread of the probe
    plugin_rms_db  the real plugin (smoothed, block-wise automation) must keep
                 each 0.25 s window's loudness within this many dB of the
                 sketch's (default 0.5)
"""
import numpy as np

SR = 44100

PATHS = [
    dict(name="glide", secs=3.0,
         values={"freq": lambda t: 110.0 * 2.0 ** t, "level": -12.0},
         gate=dict(exact_until=None)),
    dict(name="swell", secs=2.0,
         values={"freq": 330.0, "level": lambda t: -40.0 + 15.0 * t},
         gate=dict(exact_until=None)),
]
