#!/usr/bin/env python3
"""check_engine.py — the template's exact gate, run from this bundle.

VST Template cannot yet build a plugin whose folder sits in a steward's bundle, so
its harness can't be built here. This builds check/engine_check (Algorithm.h with no
JUCE, the same command line as the template's Harness) and runs every path in
reference/paths.py through the sketch, the C++ engine and ui/crystal_engine.js (the
face page's engine), with the template's own verify.py helpers, sample for sample.

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


def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--quick", type=float)
    ap.add_argument("--only")
    ap.add_argument("--no-js", action="store_true")
    a = ap.parse_args()
    exe = HERE / "check" / "engine_check"
    subprocess.run(["clang++", "-std=c++17", "-O2", "-I", str(HERE / "src"), "-I", str(MACH / "src"),
                    str(HERE / "check" / "engine_check.cpp"), "-o", str(exe)], check=True)
    verify = load(MACH / "tools" / "verify.py", "verify")
    sketch = load(HERE / "reference" / "sketch.py", "sketch")
    paths_mod = load(HERE / "reference" / "paths.py", "paths")
    sr = paths_mod.SR
    table = json.loads(subprocess.run([str(exe), "params"], check=True, capture_output=True, text=True).stdout)
    assert [p["id"] for p in table["params"]] == sketch.IDS, "sketch IDS and Algorithm.h kParams disagree"
    assert table["probes"] == sketch.probe_names(), "sketch probes and Algorithm.h kProbes disagree"
    work = HERE / "out"
    work.mkdir(exist_ok=True)
    paths = paths_mod.PATHS
    if a.only:
        paths = [p for p in paths if p["name"] in a.only.split(",")]
    if a.quick:
        paths = [dict(p, secs=min(p["secs"], a.quick)) for p in paths]
    js_exe = HERE / "check" / "js_engine.sh"
    use_js = not a.no_js and (HERE / "ui" / "crystal_engine.js").exists()
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
        js = verify.run_harness(js_exe, "engine", rows, sr, None, notes, table, work) if use_js else None
        verify.write_wav(work / f"{p['name']}-sketch.wav", ref["out"], sr)
        verify.write_wav(work / f"{p['name']}-engine.wav", eng["out"], sr)
        peak = float(np.abs(ref["out"]).max()) or 1.0
        err = float(np.abs(eng["out"] - ref["out"]).max() / peak)
        perr = max(float(np.abs(eng["probes"][k] - ref["probes"][k]).max() / (np.abs(ref["probes"][k]).max() or 1.0))
                   for k in table["probes"])
        js_err = float(np.abs(js["out"] - ref["out"]).max() / peak) if js else None
        js_perr = max(float(np.abs(js["probes"][k] - ref["probes"][k]).max() / (np.abs(ref["probes"][k]).max() or 1.0))
                      for k in table["probes"]) if js else None
        ok = err <= 1e-6 and perr <= 1e-6 and (js is None or (js_err <= 1e-6 and js_perr <= 1e-6))
        ok_all &= ok
        lr = float(np.abs(ref["out"][0] - ref["out"][1]).max() / peak)
        voices = max(int((ref["probes"][f"v{i}_hz"] > 0).sum() > 0) for i in range(8))
        busy = int(max(sum((ref["probes"][f"v{i}_hz"][s] > 0) for i in range(8)) for s in range(0, steps, 441)))
        rec = dict(name=p["name"], secs=p["secs"], max_err_of_peak=err, probe_err=perr, js_err_of_peak=js_err,
                   js_probe_err=js_perr, peak_dbfs=20 * np.log10(peak), left_right_differ=lr, max_voices=busy,
                   sketch_s=round(ts, 1), engine_s=round(te, 3), passed=ok)
        results.append(rec)
        jtxt = f"js {js_err:.2g}" if js else "js —"
        print(f"{p['name']:<20} engine = sketch to {err:.2g} of peak · probes {perr:.2g} · {jtxt} · "
              f"peak {rec['peak_dbfs']:.1f} dBFS · L≠R {lr:.2f} · voices ≤{busy} · sketch {ts:.0f} s  {'PASS' if ok else 'FAIL'}")
    (work / "check-report.json").write_text(json.dumps(dict(passed=ok_all, sr=sr, paths=results), indent=1))
    sys.exit(0 if ok_all else 1)


if __name__ == "__main__":
    main()
