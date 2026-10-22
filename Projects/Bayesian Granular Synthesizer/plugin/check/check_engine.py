#!/usr/bin/env python3
"""check_engine.py — the template's exact gate, run from this bundle.

VST Template cannot yet build a plugin whose folder sits in a steward's bundle,
so its harness can't be built here. This builds check/engine_check (Algorithm.h
with no JUCE) and runs every path in reference/paths.py through the sketch and
the engine, with the template's own verify.py helpers, sample for sample.

  python3 check/check_engine.py [--quick SECS] [--only NAME,...]

Renders land in out/<path>-{sketch,engine}.wav and out/check-report.json.
"""
import argparse
import importlib.util
import json
import subprocess
import sys
import time
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parents[1]
MACH = HERE.parents[1] / "VST Template" / "machinery"
NODE = True   # also hold ui/belief_cloud.js (the sketch page's engine) to the sketch


def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quick", type=float)
    ap.add_argument("--only")
    a = ap.parse_args()
    exe = HERE / "check" / "engine_check"
    subprocess.run(["clang++", "-std=c++17", "-O2", "-I", str(HERE / "src"), "-I", str(MACH / "src"),
                    str(HERE / "check" / "engine_check.cpp"), "-o", str(exe)], check=True)
    verify = load(MACH / "tools" / "verify.py", "verify")
    sketch = load(HERE / "reference" / "sketch.py", "sketch")
    paths_mod = load(HERE / "reference" / "paths.py", "paths")
    sr = paths_mod.SR
    table = json.loads(subprocess.run([str(exe), "params"], check=True, capture_output=True, text=True).stdout)
    work = HERE / "out"
    work.mkdir(exist_ok=True)
    paths = paths_mod.PATHS
    if a.only:
        paths = [p for p in paths if p["name"] in a.only.split(",")]
    if a.quick:
        paths = [dict(p, secs=min(p["secs"], a.quick)) for p in paths]
    results, ok_all = [], True
    for p in paths:
        steps = int(round(p["secs"] * sr))
        t = np.arange(steps) / sr
        rows = verify.param_rows(table, p, t)
        notes = verify.note_events(p, sr)
        t0 = time.time()
        ref = sketch.render({q["id"]: rows[j] for j, q in enumerate(table["params"])}, sr, None, notes)
        ts = time.time() - t0
        t0 = time.time()
        eng = verify.run_harness(exe, "engine", rows, sr, None, notes, table, work)
        te = time.time() - t0
        js = verify.run_harness(HERE / "check" / "js_engine.sh", "engine", rows, sr, None, notes, table, work) if NODE else None
        verify.write_wav(work / f"{p['name']}-sketch.wav", ref["out"], sr)
        verify.write_wav(work / f"{p['name']}-engine.wav", eng["out"], sr)
        peak = float(np.abs(ref["out"]).max()) or 1.0
        err = float(np.abs(eng["out"] - ref["out"]).max() / peak)
        perr = {k: float(np.abs(eng["probes"][k] - ref["probes"][k]).max()) for k in ("voices", "mean_cycles", "grain_note")}
        rms = float(np.sqrt((ref["out"] ** 2).mean()))
        ok = err <= 1e-6 and all(v <= 1e-9 for v in perr.values())
        js_err = float(np.abs(js["out"] - ref["out"]).max() / peak) if js else None
        if js:
            ok &= js_err <= 1e-6
        ok_all &= ok
        rec = dict(name=p["name"], secs=p["secs"], max_err_of_peak=err, probe_err=perr, peak=peak, rms=rms,
                   max_voices=int(ref["probes"]["voices"].max()), sketch_s=round(ts, 1), engine_s=round(te, 2), js_err_of_peak=js_err, passed=ok)
        results.append(rec)
        print(f"{p['name']:<14} engine = sketch to {err:.2g} of peak · probes {max(perr.values()):.2g} · "
              f"js {js_err:.2g} · peak {20*np.log10(peak):.1f} dBFS · voices ≤{rec['max_voices']} · sketch {ts:.0f} s, engine {te:.2f} s  "
              f"{'PASS' if ok else 'FAIL'}")
    (work / "check-report.json").write_text(json.dumps(dict(passed=ok_all, sr=sr, paths=results), indent=1))
    sys.exit(0 if ok_all else 1)


if __name__ == "__main__":
    main()
