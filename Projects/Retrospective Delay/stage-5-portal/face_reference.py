"""Write the face model's run of the séance performance to raw float64 files,
so portal_mirror.mjs can hold the RNBO codebox against it sample for sample.

    ~/ComfyUI-Installs/ComfyUI/standalone-env/bin/python face_reference.py <outdir>

Writes x.f64 (input), gain.f64, lag.f64 and outs.f64 (5 x N, row-major),
all from ../stage-4-character/face/face_model.py, unchanged.
"""
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "stage-4-character" / "face"))
from face_model import face, GAIN_POINTS, LAG_EVENTS  # noqa: E402
from seance_model import ramp  # noqa: E402
from grammar_model import lag_track, performance_input  # noqa: E402

out = Path(sys.argv[1])
out.mkdir(parents=True, exist_ok=True)
x = performance_input()
gain = ramp(len(x), GAIN_POINTS)
lags = lag_track(len(x), LAG_EVENTS)
outs = face(x, gain, lags)
for name, arr in (("x", x), ("gain", gain), ("lag", lags), ("outs", outs)):
    np.ascontiguousarray(arr, dtype="<f8").tofile(out / f"{name}.f64")
print(f"face reference: {len(x)} samples -> {out}")
