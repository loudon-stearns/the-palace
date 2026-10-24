#!/usr/bin/env python3
"""render_take.py — the attack lesson, rendered through the C++ engine (check/engine_check)
into ../blood-compressor-attack-lesson.wav. Four sections of two bars each on the check's
drum loop (100 bpm, 4.8 s a section):

  0.0–4.8   bypass: the beat as it arrives
  4.8–9.6   attack at its floor, 5 ms: the reflex with no time to notice; the kick's
            front is clamped with the rest, and the beat goes flat
  9.6–14.4  attack 80 ms: the body notices, then acts; the kick's front gets through
            before the vessel closes, so the punch comes back
  14.4–19.2 attack 80 ms, release 40 ms: the muscle lets go before the next hit lands,
            and the vessel breathes with the beat (pumping)

Threshold -36 dB, ratio 10, no makeup. Each section is then brought to the same
loudness (-27 dBFS RMS, a 10 ms ramp between) so the ear compares shape, not level;
-27 leaves room for the peaks, which this compressor lets through by design: the
5 ms nerve delay means the front of every hit has passed before the vessel closes.
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
sr, sec = paths.SR, 4.8
t = np.arange(int(4 * sec * sr)) / sr
s = np.minimum(3, (t // sec).astype(int))
p = dict(name="attack-lesson", values={
    "bypass": (s == 0).astype(float),
    "threshold": -36.0, "ratio": 10.0, "makeup": 0.0,
    "attack": np.where(s == 1, 0.005, 0.08),
    "release": np.where(s == 3, 0.04, 0.3),
})
p["values"] = {k: (lambda t, a=v: a) if isinstance(v, np.ndarray) else v for k, v in p["values"].items()}
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
eng["out"] = raw * gain
verify.write_wav(HERE.parent / "blood-compressor-attack-lesson.wav", eng["out"], sr)
print(f"loudest peak after matching: {20 * np.log10(np.abs(eng['out']).max()):.1f} dBFS")
for k, name in enumerate(["bypass", "attack 5 ms", "attack 80 ms", "attack 80 ms, release 40 ms"]):
    m = s == k
    o = raw[0][m]
    rms = 20 * np.log10(np.sqrt((o ** 2).mean()))
    pk = 20 * np.log10(np.abs(o).max())
    print(f"{name:<28} rms {rms:6.1f} dBFS · peak {pk:5.1f} · crest {pk - rms:4.1f} dB · squeeze mean {sq[m].mean():6.1f}, deepest {sq[m].min():6.1f} dB")
