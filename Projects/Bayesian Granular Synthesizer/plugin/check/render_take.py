#!/usr/bin/env python3
"""render_take.py — the demo performance of belief-helix.html, rendered through the
C++ engine (check/engine_check, i.e. Algorithm.h), so you hear what the plugin plays.

  python3 check/render_take.py   →  ../belief-cloud-take.wav and out/take-levels.json

0–3 s flat prior, nothing held · 3–11 s C E G · 11–17 s A minor (G gives way to A)
17–21 s let go · 21–27 s A-minor-pentatonic prior with prior tone 0.7, nothing held
27–34 s low A and E over that prior · 34–36 s let go.
"""
import importlib.util
import json
import subprocess
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parents[1]
MACH = HERE.parents[1] / "VST Template" / "machinery"
spec = importlib.util.spec_from_file_location("verify", MACH / "tools" / "verify.py")
verify = importlib.util.module_from_spec(spec); spec.loader.exec_module(verify)

SR = 44100
PENTA = [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0]
IDS = ["pc_c", "pc_cs", "pc_d", "pc_ds", "pc_e", "pc_f", "pc_fs", "pc_g", "pc_gs", "pc_a", "pc_as", "pc_b"]
painted = lambda t: (t >= 21.0) & (t < 36.0)
values = dict(prior_shape=lambda t: np.where(painted(t), 1.0, 0.0), prior_tone=lambda t: np.where(painted(t), 0.7, 0.0),
              register=lambda t: np.where(painted(t), 57.0, 64.0), register_width=lambda t: np.where(painted(t), 1.5, 8.0))
for k, pid in enumerate(IDS):
    values[pid] = (lambda x: (lambda t: np.where(painted(t), float(x), 1.0)))(PENTA[k])
path = dict(name="take", secs=36.0, values=values,
            notes=[(3, 14, 60, 108), (3, 14, 64, 108), (3, 8, 67, 108), (11, 6, 69, 95), (27, 7, 45, 114), (27, 7, 52, 89)])

exe = HERE / "check" / "engine_check"
table = json.loads(subprocess.run([str(exe), "params"], check=True, capture_output=True, text=True).stdout)
t = np.arange(int(path["secs"] * SR)) / SR
rows = verify.param_rows(table, path, t)
work = HERE / "out"; work.mkdir(exist_ok=True)
r = verify.run_harness(exe, "engine", rows, SR, None, verify.note_events(path, SR), table, work)
verify.write_wav(HERE.parent / "belief-cloud-take.wav", r["out"], SR)
segs = [("flat prior, nothing held", 0, 3), ("C E G", 3, 11), ("A minor", 11, 17), ("let go", 17, 21),
        ("painted prior, nothing held", 21, 27), ("low A + E over it", 27, 34)]
rep = []
for name, a, b in segs:
    x = r["out"][:, int(a * SR):int(b * SR)]
    sl = slice(int(a * SR), int(b * SR))
    rep.append(dict(moment=name, rms_db=round(float(20 * np.log10(np.sqrt((x ** 2).mean()))), 1),
                    peak_db=round(float(20 * np.log10(np.abs(x).max())), 1),
                    mean_grain_cycles=round(float(r["probes"]["mean_cycles"][sl].mean()), 1),
                    doubt_share=round(float(r["probes"]["prior_share"][sl].mean()), 2),
                    max_voices=int(r["probes"]["voices"][sl].max())))
(work / "take-levels.json").write_text(json.dumps(rep, indent=1))
for row in rep: print(row)
