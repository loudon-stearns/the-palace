"""sketch.py — Wavetable Scanner's reference. Not numpy this time: the reference is the browser
synth's own engine (synth/wt-synth.js) and its morph (packer/packer.js), run in Node by
ref_render.cjs. That is the instrument that already plays in Chrome, Firefox and WebKit, so the
plugin is checked against the thing itself rather than a third copy of it.

The JS engine works in blocks and sets its slow values (the table's octave, the filter, the
unison spread) every 16 samples; ref_render.cjs renders in 16-sample blocks and takes each
parameter at the start of a block, and Algorithm.h keeps a 16-sample counter to match. So the
paths keep every move on 16-sample marks (paths.py says how). Needs node on the PATH.
"""
import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
B = 16
IDS = ["table", "position", "lfo_wave", "lfo_rate", "lfo_to_pos", "env_to_pos", "unison", "detune", "spread",
       "cutoff", "reso", "env_to_cutoff", "keytrack", "lfo2_rate", "lfo2_to_cutoff",
       "a_attack", "a_decay", "a_sustain", "a_release", "m_attack", "m_decay", "m_sustain", "m_release",
       "mode", "glide", "transpose", "velocity", "gain"]


def render(v, sr, inputs=None, notes=()):
    steps = len(v["gain"])
    starts = np.arange(0, steps, B)
    rows = np.stack([np.asarray(v[k], dtype="<f8")[starts] for k in IDS])
    for s, on, n, vel in notes:
        assert s % B == 0, f"note event at sample {s} is off the 16-sample marks"
    with tempfile.TemporaryDirectory() as d:
        d = Path(d)
        rows.astype("<f8").tofile(d / "rows.f64")
        (d / "job.json").write_text(json.dumps(dict(sr=sr, steps=steps, ids=IDS, rows=str(d / "rows.f64"),
                                                    events=[[int(s), bool(on), int(n), int(vel)] for s, on, n, vel in notes])))
        subprocess.run(["node", str(HERE / "ref_render.cjs"), str(d / "job.json"), str(d / "out.f32")], check=True)
        out = np.fromfile(d / "out.f32", "<f4").astype(np.float64).reshape(2, steps)
    return dict(out=out, probes={})
