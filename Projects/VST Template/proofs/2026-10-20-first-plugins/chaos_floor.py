# How far apart do correct implementations drift at the edge, and would a gate set above that catch a wrong port?
import importlib.util, json, subprocess, sys
from pathlib import Path
import numpy as np
root = Path(sys.argv[1]); name = sys.argv[2]
spec = importlib.util.spec_from_file_location("verify", root.parents[1] / "machinery/tools/verify.py"); V = importlib.util.module_from_spec(spec); spec.loader.exec_module(V)
paths = V.load_module(root / "reference/paths.py", "paths"); path = [p for p in paths.PATHS if p["name"] == name][0]
harness = V.find_harness(root); table = json.loads(subprocess.run([str(harness), "params"], capture_output=True, text=True).stdout)
sr = 44100; steps = int(round(path["secs"] * sr)); t = np.arange(steps) / sr
cache = sorted((root / "out/cache").glob(f"{name}-*.npz"), key=lambda p: p.stat().st_mtime)[-1]
ref = np.load(cache)["probe_fundamental"]
work = Path(sys.argv[3]); work.mkdir(exist_ok=True)
ids = [p["id"] for p in table["params"]]
def stats(x, w, start):
    xw = V.windows(x, w, start); return xw.mean(1), xw.std(1)
def run(label, scale_id=None, factor=1.0, mode="engine"):
    rows = V.param_rows(table, path, t).copy()
    if scale_id: rows[ids.index(scale_id)] *= factor
    r = V.run_harness(harness, mode, rows, sr, None, [], table, work)
    return label, r["probes"]["fundamental"]
runs = [run("engine (correct)"), run("plugin (correct)", mode="plugin"), run("K +2%", "K", 1.02), run("K +5%", "K", 1.05), run("K -5%", "K", 0.95), run("B +5%", "B", 1.05), run("inertia +10%", "inertia", 1.10)]
after = path["gate"].get("exact_until") or 0
for win in (0.5, 1.0, 2.0):
    w = int(win * sr); s = int(after * sr); rm, rs = stats(ref, w, s)
    print(f"-- {name}: {win:g} s windows from {after:g} s; max |diff| from the sketch in window mean, spread (Hz); and the 95th percentile")
    for label, f in runs:
        m, sd = stats(f, w, s); dm, ds = np.abs(m - rm), np.abs(sd - rs)
        print(f"   {label:18s} mean {dm.max():6.2f} (p95 {np.percentile(dm, 95):5.2f})   spread {ds.max():6.2f} (p95 {np.percentile(ds, 95):5.2f})")
print("sketch fundamental: range %.1f-%.1f Hz, window spread up to %.2f Hz" % (ref.min(), ref.max(), stats(ref, int(0.5*sr), 0)[1].max()))
