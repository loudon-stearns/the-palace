#!/usr/bin/env python3
"""render_take.py — a walk through the palette, rendered through the C++ engine
(check/engine_check, i.e. Algorithm.h), so you hear what the plugin plays.

  python3 check/render_take.py   →  ../crystal-synthesizer-take.wav and out/take-levels.json

0–6 s   ruby, an A major arpeggio, the crystal turning from across its axis (90°)
        to along it (0°): the two rays' slow beating stops as they fold into one
6–12 s  diamond, A2 and A3, fire 260 ms: each strike fans red to violet over ~190 ms
12–18 s zircon's optics (tetragonal slot), lifetime 3, birefringence ×1 → ×16
18–24 s labradorite, low E, fire 150, lifetime 2
24–30 s emerald, lifetime 4, birefringence ×6: a chorus out of the stone
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
seg = lambda t, a, b: (t >= a) & (t < b)
pick = lambda t, xs: np.select([seg(t, 6 * i, 6 * i + 6) for i in range(5)], xs, xs[-1])
values = dict(
    crystal=lambda t: pick(t, [4, 0, 2, 8, 3]),
    angle=lambda t: np.where(t < 6, 90 * np.clip(1 - (t - 1) / 4, 0, 1), np.where(seg(t, 18, 24), 60, 90)),
    fire=lambda t: pick(t, [40, 260, 60, 150, 80]),
    lifetime=lambda t: pick(t, [1, 1, 3, 2, 4]),
    spread=lambda t: np.where(seg(t, 12, 18), 2 ** (4 * np.clip((t - 12) / 5, 0, 1)), np.where(t >= 24, 6, 1)),
)
notes = []
for k in range(6):                                  # ruby: the arpeggio, again and again while it turns
    for j, n in enumerate([57, 61, 64, 69]):
        notes.append((k * 1.0 + j * 0.12, 0.8, n, 90 - 6 * j))
notes += [(6.2, 2.6, 45, 115), (8.6, 3.0, 57, 80), (9.8, 2.0, 64, 70)]
notes += [(12.1 + 1.6 * k + 0.3 * j, 1.4, n, 85) for k in range(3) for j, n in enumerate([52, 59, 64])]
notes += [(18.1, 1.2, 40, 115), (19.0, 1.0, 47, 90), (20.2, 2.5, 52, 100), (22.0, 1.5, 59, 75)]
notes += [(24.1 + 0.3 * j, 4.5 - 0.3 * j, n, 80) for j, n in enumerate([55, 59, 62, 67, 71])]
path = dict(name="take", secs=30.0, values=values, notes=notes)

exe = HERE / "check" / "engine_check"
table = json.loads(subprocess.run([str(exe), "params"], check=True, capture_output=True, text=True).stdout)
t = np.arange(int(path["secs"] * SR)) / SR
rows = verify.param_rows(table, path, t)
work = HERE / "out"; work.mkdir(exist_ok=True)
r = verify.run_harness(exe, "engine", rows, SR, None, verify.note_events(path, SR), table, work)
verify.write_wav(HERE.parent / "crystal-synthesizer-take.wav", r["out"], SR)
rep = []
for name, a in [("ruby turning to its axis", 0), ("diamond with fire", 6), ("zircon's split widening", 12),
                ("labradorite", 18), ("emerald chorus", 24)]:
    x = r["out"][:, int(a * SR):int((a + 6) * SR)]
    rep.append(dict(moment=name, rms_db=round(float(20 * np.log10(np.sqrt((x ** 2).mean()))), 1),
                    peak_db=round(float(20 * np.log10(np.abs(x).max())), 1),
                    side_db=round(float(20 * np.log10(np.sqrt(((x[0] - x[1]) ** 2).mean() / 4) + 1e-12)), 1)))
(work / "take-levels.json").write_text(json.dumps(rep, indent=1))
for row in rep: print(row)
