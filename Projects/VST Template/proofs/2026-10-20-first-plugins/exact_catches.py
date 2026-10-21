# Does the sample-exact gate catch the errors the behaviour gate can't?
import importlib.util, json, subprocess, sys
from pathlib import Path
import numpy as np
root = Path(sys.argv[1]); work = Path(sys.argv[2])
spec = importlib.util.spec_from_file_location("verify", root.parents[1] / "machinery/tools/verify.py"); V = importlib.util.module_from_spec(spec); spec.loader.exec_module(V)
paths = V.load_module(root / "reference/paths.py", "paths")
harness = V.find_harness(root); table = json.loads(subprocess.run([str(harness), "params"], capture_output=True, text=True).stdout)
ids = [p["id"] for p in table["params"]]; sr = 44100
for name in ("ride-breathe", "ride-string-bar"):
    path = [p for p in paths.PATHS if p["name"] == name][0]
    n = int(2.0 * sr); steps = int(round(path["secs"] * sr)); t = np.arange(steps) / sr
    cache = sorted((root / "out/cache").glob(f"{name}-*.npz"), key=lambda p: p.stat().st_mtime)[-1]
    ref = np.load(cache)["out"][0, :n]; pk = np.abs(np.load(cache)["out"]).max()
    for sid, f in (("K", 1.0), ("K", 1.02), ("K", 1.005), ("B", 1.05), ("B", 1.01), ("inertia", 1.10)):
        rows = V.param_rows(table, path, t)[:, :n].copy(); rows[ids.index(sid)] *= f
        out = V.run_harness(harness, "engine", rows, sr, None, [], table, work)["out"][0]
        print(f"{name:16s} {sid} x{f:<6g} first 2 s: max diff {np.abs(out - ref).max() / pk:.1e} of peak")
