"""Pack a folder with pack_wavetable.py and with the browser port (packer.js
via node), then compare: frame order, centroids, and each frame's difference."""
import json, subprocess, sys, tempfile, importlib.util
from pathlib import Path
import numpy as np
from scipy.io import wavfile

HERE = Path(__file__).parent
PY = HERE.parents[1] / "Generative Wavetable Libraries/akwf-import-pipeline/pack_wavetable.py"
spec = importlib.util.spec_from_file_location("pw", PY); pw = importlib.util.module_from_spec(spec); spec.loader.exec_module(pw)

def run(folder):
    folder = Path(folder)
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        import contextlib, io
        with contextlib.redirect_stdout(io.StringIO()):
            py_out = pw.build_wavetable(folder, td / "py", 1024)
        js_out = td / "js.wav"
        subprocess.run(["node", str(HERE / "pack_folder.cjs"), str(folder), str(js_out)], check=True, capture_output=True)
        _, a = wavfile.read(py_out); _, b = wavfile.read(js_out)
        meta = json.loads((td / "js.json").read_text())
    # Python order, recovered the same way the script makes it
    recs = []
    for p in sorted(q for q in folder.iterdir() if q.suffix.lower() == ".wav"):
        c = pw.resample_cycle(pw.read_mono_float(p), 1024)
        recs.append((pw.spectral_centroid(c, 44100), p.stem))
    recs.sort(key=lambda r: r[0])
    py_order = [s for _, s in recs]; js_order = meta["frameNames"]
    same = sum(x == y for x, y in zip(py_order, js_order))
    F = len(js_order)
    A = a.reshape(-1, 1024); B = b.reshape(-1, 1024)
    # compare frame by frame matched on name
    idx = {s: i for i, s in enumerate(py_order)}
    errs = []
    for j, s in enumerate(js_order):
        d = A[idx[s]] - B[j]
        errs.append(20 * np.log10(np.sqrt(np.mean(d**2)) / max(np.sqrt(np.mean(A[idx[s]]**2)), 1e-12) + 1e-20))
    cents = np.array([c for c, _ in recs]); jc = np.array(sorted(meta["centroids"]))
    # rank swaps: adjacent pairs ordered differently
    pos = {s: i for i, s in enumerate(py_order)}
    swaps = sum(1 for x, y in zip(js_order, js_order[1:]) if pos[x] > pos[y])
    return dict(folder=folder.name, frames=F, same_position=same, adjacent_swaps=swaps,
                median_frame_diff_db=float(np.median(errs)), worst_frame_diff_db=float(np.max(errs)),
                worst_centroid_diff_hz=float(np.max(np.abs(cents - jc))), js_ms=meta["ms"])

if __name__ == "__main__":
    rows = [run(f) for f in sys.argv[1:]]
    for r in rows: print(r)
    (HERE / "compare.json").write_text(json.dumps(rows, indent=1))
