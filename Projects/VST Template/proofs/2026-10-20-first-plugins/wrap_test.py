# ride-string-bar: is the late 3e-6 drift the sketch's unwrapped phases losing precision?
import importlib.util, json, subprocess, sys
from pathlib import Path
import numpy as np
root = Path(sys.argv[1]); work = Path(sys.argv[2]); secs = 21.0
spec = importlib.util.spec_from_file_location("verify", root.parents[1] / "machinery/tools/verify.py"); V = importlib.util.module_from_spec(spec); spec.loader.exec_module(V)
S = V.load_module(root / "reference/sketch.py", "sketch"); paths = V.load_module(root / "reference/paths.py", "paths")
path = dict([p for p in paths.PATHS if p["name"] == "ride-string-bar"][0], secs=secs)
harness = V.find_harness(root); table = json.loads(subprocess.run([str(harness), "params"], capture_output=True, text=True).stdout)
sr = 44100; steps = int(secs * sr); t = np.arange(steps) / sr; rows = V.param_rows(table, path, t)
v = {p["id"]: rows[j] for j, p in enumerate(table["params"])}
# the sketch's loop with one change: wrap the phases each sample, as Algorithm.h does
src = Path(root / "reference/sketch.py").read_text().replace("        Fp = dth\n", "        p -= np.floor(p)\n        ph -= np.floor(ph)\n        Fp = dth\n")
ns = {}; exec(compile(src, "sketch_wrapped", "exec"), ns)
wrapped = ns["render"](v, sr)["out"][0]
cache = sorted((root / "out/cache").glob("ride-string-bar-*.npz"), key=lambda p: p.stat().st_mtime)[-1]
unwrapped = np.load(cache)["out"][0, :steps]; pk = np.abs(unwrapped).max()
eng = V.run_harness(harness, "engine", rows, sr, None, [], table, work)["out"][0]
print(f"engine vs unwrapped sketch: {np.abs(eng - unwrapped).max() / pk:.1e} of peak")
print(f"engine vs wrapped sketch:   {np.abs(eng - wrapped).max() / pk:.1e} of peak")
print(f"wrapped vs unwrapped sketch: {np.abs(wrapped - unwrapped).max() / pk:.1e} of peak")
