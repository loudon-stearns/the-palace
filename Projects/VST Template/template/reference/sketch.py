"""sketch.py — THE NUMPY SKETCH, and the reference the plugin is checked against.

The contract verify.py relies on:

  render(v, sr, inputs=None) -> dict(out=..., probes=...)
      v       parameter id -> float64 array, one value per sample, in natural
              units (Choice and Toggle as their index). Every parameter in
              Algorithm.h is present.
      inputs  (kInputs, steps) float array for an effect, else None.
      out     (kOutputs, steps) array: what the plugin should output.
      probes  probe name -> (steps,) array, for every probe in Algorithm.h.

  constants() -> dict(name -> 1-D array)       (optional)
      Numbers the sketch draws at random (detunings, starting phases). They are
      written into src/Constants.h, so the plugin starts exactly where the
      sketch does. Leave it out if there are none.

Write the loop the way the C++ will run it, one sample at a time, in the same
order of operations. Then the two match sample for sample wherever the model
is not chaotic.

The example: a plain sine with a pitch and a level, the same as the example
Algorithm.h.
"""
import numpy as np


def render(v, sr, inputs=None):
    freq, level = v["freq"], v["level"]
    steps = len(freq)
    out = np.zeros((1, steps))
    phase_probe = np.zeros(steps)
    phase = 0.0
    for i in range(steps):
        out[0, i] = 10.0 ** (level[i] / 20.0) * np.sin(2.0 * np.pi * phase)
        phase += freq[i] / sr
        phase -= np.floor(phase)
        phase_probe[i] = phase
    return dict(out=out, probes={"phase": phase_probe})
