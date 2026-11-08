"""Pack AKWF folders with the browser packer (packer.js via node) three ways —
centroid, family chain, family chain smoothed (sigma 1) — and score each table
with Generative Wavetable Libraries' own yardsticks: timbre jumps between
neighbours, morph dips, whether Position still means brighter, and the sweep
buzz (energy 4-15 Hz off the harmonics). Writes chain_check.json and three
audition sweeps per folder via render_sweep.cjs.

    /usr/local/bin/python3 chain_check.py"""
import json, subprocess, sys
from pathlib import Path
import numpy as np, soundfile as sf
HERE = Path(__file__).parent
GWL = HERE.parents[1] / "Generative Wavetable Libraries"
sys.path.insert(0, str(GWL / "akwf-scale-up-fmsynth")); sys.path.insert(0, str(GWL / "loop-smoothing"))
import scale_up as su                      # noqa: E402
from smooth_tables import offnote_db       # noqa: E402
AKWF = Path.home() / "Desktop/AKWF"
OUT = HERE / "chain"; OUT.mkdir(exist_ok=True)
WAYS = [("centroid", "centroid", 0), ("chain", "chain", 0), ("chain_smooth", "chain", 1)]

def pack(folder, order, smooth, out):
    subprocess.run(["node", str(HERE / "pack_folder.cjs"), str(folder), str(out), order, str(smooth)],
                   check=True, capture_output=True)
    t, _ = sf.read(out); return t.reshape(-1, 1024), json.loads(out.with_suffix(".json").read_text())

report = {}
for name in ["AKWF_fmsynth", "AKWF_eorgan", "AKWF_cello"]:
    tag = name.split("_", 1)[1]; r = report[name] = {}
    base, _ = pack(AKWF / name, "file", 0, OUT / f"{tag}_file.wav")
    X = su.timbre_features(base); D = su.pairwise(X)       # distances in file order
    cents = np.array([su.spectral_centroid(c, su.SR) for c in base])
    stems = json.loads((OUT / f"{tag}_file.json").read_text())["frameNames"]; pos = {s: i for i, s in enumerate(stems)}
    walk = su.walk_order(D, start=int(np.argmin(cents)))
    rel_far = float(np.percentile([D[a, b] for a, b in zip(walk[:-1], walk[1:])], 90))
    for key, order, sm in WAYS:
        frames, meta = pack(AKWF / name, order, sm, OUT / f"{tag}_{key}.wav")
        o = np.array([pos[s] for s in meta["frameNames"]])
        steps = np.array([D[a, b] for a, b in zip(o[:-1], o[1:])])
        st = {"frames": len(o), "far_steps": int((steps > rel_far).sum()), "mean_step": round(float(steps.mean()), 1),
              "max_step": round(float(steps.max()), 1),
              "worst_dip_db": round(float(su.morph_dips_db(frames).min()), 1),
              "brighter_as_position_rises": round(su.rank_corr(np.arange(len(o)), cents[o]), 2),
              "buzz_db": round(offnote_db(np.array([su.resample_cycle(f, 2048) for f in frames])), 1)}
        if meta.get("families"):
            fa = meta["families"]; st["families"] = [f"{n} ({fa['of'].count(i)})" for i, n in enumerate(fa["names"])]
        r[key] = st
        subprocess.run(["node", str(HERE / "render_sweep.cjs"), str(OUT / f"{tag}_{key}.wav"),
                        str(OUT / f"sweep_{tag}_{key}.wav"), "20", "110"], check=True, capture_output=True)
    r["far_step_yardstick"] = round(rel_far, 1)
    (OUT / f"{tag}_file.wav").unlink(); (OUT / f"{tag}_file.json").unlink()
    print(name, json.dumps(r, indent=1))
(HERE / "chain_check.json").write_text(json.dumps(report, indent=2))
