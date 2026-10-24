#!/usr/bin/env python3
"""render_body.py — the body take, rendered through the C++ engine (check/engine_check)
into ../blood-compressor-body-take.wav. Four sections of six seconds on the check's
drum loop (100 bpm), the same compressor under each (threshold -30 dB, ratio 4, attack
60 ms, release 300 ms, knee 6 dB), with one body control turned all the way up:

  0–6    at rest: every body control at zero, the compressor as it was in cycle 10
  6–12   stressed (sympathetic 1): the systolic line 12 dB lower, a reflex twice as
         fast, a muscle that lets go four times as fast; the beat is held harder and
         the vessel pumps with it
  12–18  old (vessel age 1): ratio 8 where it was 4, a knee with a fifth of its give;
         the wall cinches instead of yielding
  18–24  breathing (heart-rate variability 1): the set point moves +-3 dB with a
         0.25 Hz breath and a 0.1 Hz Mayer wave, so the squeeze swells and ebbs
         across the bars

Each section is matched to -27 dBFS RMS (a 10 ms ramp between, room left for the peaks
this compressor lets through) so the ear hears the
shape the body gives the beat, not how much quieter it made it.
"""
import importlib.util
import json
import subprocess
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parents[1]
MACH = HERE.parents[1] / "VST Template" / "machinery"


def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


verify = load(MACH / "tools" / "verify.py", "verify")
paths = load(HERE / "reference" / "paths.py", "paths")
exe = HERE / "check" / "engine_check"
table = json.loads(subprocess.run([str(exe), "params"], check=True, capture_output=True, text=True).stdout)
sr, sec = paths.SR, 6.0
t = np.arange(int(4 * sec * sr)) / sr
s = np.minimum(3, (t // sec).astype(int))
vals = {"threshold": -30.0, "ratio": 4.0, "attack": 0.06, "release": 0.3, "knee": 6.0,
        "sympathetic": (s == 1).astype(float), "age": (s == 2).astype(float), "hrv": (s == 3).astype(float)}
p = dict(name="body-take", values={k: (lambda t, a=v: a) if isinstance(v, np.ndarray) else v for k, v in vals.items()})
rows = verify.param_rows(table, p, t)
inputs = paths.drums(t, sr).astype(np.float32).astype(np.float64)
work = HERE / "out"
work.mkdir(exist_ok=True)
eng = verify.run_harness(exe, "engine", rows, sr, inputs, (), table, work)
sq = eng["probes"]["squeeze"]
raw = eng["out"].copy()
gain = np.zeros(len(t))
for k in range(4):
    m = s == k
    gain[m] = 10 ** (-27 / 20) / np.sqrt((raw[:, m] ** 2).mean())
ramp = int(0.01 * sr)
gain = np.convolve(np.pad(gain, (ramp, ramp), mode="edge"), np.ones(ramp) / ramp, mode="same")[ramp:-ramp]
verify.write_wav(HERE.parent / "blood-compressor-body-take.wav", raw * gain, sr)
print(f"loudest peak after matching: {20 * np.log10(np.abs(raw * gain).max()):.1f} dBFS")
rows_out = []
for k, name in enumerate(["at rest", "stressed (sympathetic 1)", "old (vessel age 1)", "breathing (hrv 1)"]):
    m = s == k
    o = raw[0][m]
    rms = 20 * np.log10(np.sqrt((o ** 2).mean()))
    pk = 20 * np.log10(np.abs(o).max())
    # how much the squeeze swells and ebbs bar to bar: the spread of its mean over each half bar
    w = int(1.2 * sr)                     # half a bar: two beats, kick and snare
    bars = sq[m][: (m.sum() // w) * w].reshape(-1, w).mean(axis=1)
    rows_out.append([name, f"{rms:.1f}", f"{pk - rms:.1f}", f"{sq[m].mean():.1f}", f"{sq[m].min():.1f}", f"{bars.max() - bars.min():.1f}"])
    print(f"{name:<26} rms {rms:6.1f} dBFS · crest {pk - rms:4.1f} dB · squeeze mean {sq[m].mean():6.1f}, deepest {sq[m].min():6.1f} dB · beat-to-beat swing {bars.max() - bars.min():.1f} dB")
(work / "body-take.json").write_text(json.dumps(rows_out, indent=1))
