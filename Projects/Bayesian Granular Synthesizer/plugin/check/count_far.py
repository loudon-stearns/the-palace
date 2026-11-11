#!/usr/bin/env python3
"""count_far.py — the far hush counted grain by grain, through the sketch: every grain born
while C E G is believed (4–8 s of render_hush.py's phrase), its energy (amplitude² × length),
and whether it landed more than a semitone from every held note. Prints the far grains'
share of the energy and their loudest peak, with the hush off and at its 18 dB default."""
import importlib.util
import math
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("sketch", HERE / "reference" / "sketch.py")
sk = importlib.util.module_from_spec(spec); spec.loader.exec_module(sk)
SR, HELD = 44100, [60, 64, 67]

for hush in (0.0, 18.0):
    table = {"doubt": 0.25, "time_to_believe": 1.6, "press": 0.08, "let_go": 1.4, "forget": 0.7, "velocity": 0.3,
             "width_start": 120.0, "width_floor": 5.0, "near": 35.0, "rate": 160.0, "shortest": 4.0, "longest": 128.0,
             "spread": 0.7, "level": -2.0, "prior_shape": 0.0, "prior_tone": 0.0, "hill_width": 20.0, "register": 64.0,
             "register_width": 8.0, "far_hush": hush, "doubt": 0.35}
    for pc in sk.PRIOR_IDS[4:]: table[pc] = 1.0
    cloud = sk.Cloud(SR, table)
    grains = []
    orig = cloud.spawn
    def spawn(v, c=cloud):
        n = c.nv
        orig(v)
        if c.nv > n:
            k = c.nv - 1
            amp = math.hypot(c.v_l[k], c.v_r[k])
            grains.append((c.sample, c.grain_note, amp, amp * amp * c.v_len[k]))
    cloud.spawn = spawn
    cloud.note_on(60, 105 / 127); cloud.note_on(64, 105 / 127); cloud.note_on(67, 105 / 127)
    for i in range(int(8 * SR)):
        cloud.sample = i
        cloud.step(table)
    g = [x for x in grains if x[0] >= 4 * SR]
    far = [x for x in g if min(abs(x[1] - h) for h in HELD) > 1.0]
    e_far, e_all = sum(x[3] for x in far), sum(x[3] for x in g)
    print(f"hush {hush:>4} dB: {len(g)} grains in 4 s, {len(far)} far ({len(far)/4:.0f}/s) · far energy "
          f"{100*e_far/e_all:.1f} % · loudest far peak {20*math.log10(max(x[2] for x in far)):.1f} dB · "
          f"median far peak {20*math.log10(np.median([x[2] for x in far])):.1f} dB · median near peak "
          f"{20*math.log10(np.median([x[2] for x in g if x not in far])):.1f} dB")
