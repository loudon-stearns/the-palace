#!/usr/bin/env python3
"""verify.py — template machinery: check the plugin against its numpy sketch.
Don't edit per plugin; the paths and their gates live in reference/paths.py.

  python3 tools/verify.py <plugin dir> [--quick SECS] [--only NAME,NAME] [--no-cache]

For every path in reference/paths.py, three renders:
  sketch  reference/sketch.py (cached in out/cache until sketch.py or paths.py changes)
  engine  the harness runs Algorithm::step() with the same per-sample values
  plugin  the harness runs the real processBlock, automation landing once a 64-sample block
then the path's gates compare them. Renders land in out/ as wav for listening,
out/report.json holds every number. Exit 0 only when every gate passed.
Needs numpy and a built harness (plugin.sh build).
"""
import argparse
import hashlib
import importlib.util
import json
import subprocess
import sys
import time
import wave
from pathlib import Path

import numpy as np


def load_module(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def find_harness(root):
    found = [p for p in (root / "build").glob("*Harness_artefacts/**/*Harness") if p.is_file()]
    if not found:
        sys.exit("no harness built: run ./plugin.sh build first")
    return max(found, key=lambda p: p.stat().st_mtime)


def param_rows(table, path, t):
    rows = []
    for p in table["params"]:
        x = path.get("values", {}).get(p["id"], p["default"])
        if isinstance(x, str):
            x = p["choices"].split("|").index(x)
        if callable(x):
            x = x(t)
        rows.append(np.broadcast_to(np.asarray(x, dtype=np.float64), t.shape))
    return np.ascontiguousarray(np.stack(rows))


def run_harness(exe, mode, rows, sr, inputs, table, work):
    steps = rows.shape[1]
    pf, of = work / f"_{mode}.f64", work / f"_{mode}.bin"
    rows.astype("<f8").tofile(pf)
    args = [str(exe), mode, str(steps), repr(float(sr)), str(pf), str(of)]
    if inputs is not None:
        inf = work / f"_{mode}_in.f32"
        np.ascontiguousarray(inputs, dtype="<f4").tofile(inf)
        args.append(str(inf))
    subprocess.run(args, check=True)
    raw = of.read_bytes()
    n_out, names = table["outputs"], table["probes"]
    split = 4 * n_out * steps
    out = np.frombuffer(raw[:split], "<f4").reshape(n_out, steps).astype(np.float64)
    probes = np.frombuffer(raw[split:], "<f8").reshape(len(names), steps)
    return dict(out=out, probes={name: probes[j] for j, name in enumerate(names)})


def write_wav(path, out, sr):
    x = np.atleast_2d(out)
    x = np.vstack([x, x]) if x.shape[0] == 1 else x[:2]
    pcm = (np.clip(x.T, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(int(sr))
        w.writeframes(pcm.tobytes())


def windows(x, w, start=0):
    n = (len(x) - start) // w
    return x[start:start + n * w].reshape(n, w)


def db(x):
    return 20 * np.log10(np.maximum(x, 1e-6))


def check_path(path, table, sketch, harness, sr, work, cache, use_cache):
    secs = path["secs"]
    steps = int(round(secs * sr))
    t = np.arange(steps) / sr
    rows = param_rows(table, path, t)
    inputs = path["inputs"](t, sr) if "inputs" in path else None
    gate = path.get("gate", {})
    rec = dict(name=path["name"], secs=secs, gates=[])
    print(f"\n{path['name']} ({secs:g} s)")

    # 1. the sketch, cached
    key = hashlib.sha1(cache["source"] + f"{path['name']}|{steps}|{sr}".encode()).hexdigest()[:16]
    cf = work / "cache" / f"{path['name']}-{key}.npz"
    if use_cache and cf.exists():
        z = np.load(cf)
        ref = dict(out=z["out"], probes={k[6:]: z[k] for k in z.files if k.startswith("probe_")})
        print("  sketch     cached")
    else:
        t0 = time.time()
        v = {p["id"]: rows[j] for j, p in enumerate(table["params"])}
        ref = sketch.render(v, sr, inputs)
        ref = dict(out=np.atleast_2d(np.asarray(ref["out"], dtype=np.float64)),
                   probes={k: np.asarray(a, dtype=np.float64) for k, a in ref.get("probes", {}).items()})
        cf.parent.mkdir(parents=True, exist_ok=True)
        np.savez(cf, out=ref["out"], **{f"probe_{k}": a for k, a in ref["probes"].items()})
        print(f"  sketch     rendered in {time.time() - t0:.1f} s")

    # 2 and 3. the engine and the real plugin
    eng = run_harness(harness, "engine", rows, sr, inputs, table, work)
    plug = run_harness(harness, "plugin", rows, sr, inputs, table, work)
    for tag, r in (("sketch", ref), ("engine", eng), ("plugin", plug)):
        write_wav(work / f"{path['name']}-{tag}.wav", r["out"], sr)

    def verdict(kind, ok, text, **nums):
        rec["gates"].append(dict(gate=kind, passed=bool(ok), text=text, **nums))
        print(f"  {kind:<10} {text:<74} {'PASS' if ok else 'FAIL'}")
        return ok

    ok = True
    peak = float(np.abs(ref["out"]).max()) or 1.0

    # exact: engine against sketch, sample for sample
    until = gate.get("exact_until", None)
    n = steps if until is None else min(steps, int(round(until * sr)))
    if n > 0:
        tol = gate.get("tol", 1e-6)
        d = np.abs(eng["out"][:, :n] - ref["out"][:, :n]).max(axis=0) / peak
        err = float(d.max())
        over = np.nonzero(d > tol)[0]
        where = f", first past it at {over[0] / sr:.3f} s" if len(over) else ""
        ok &= verdict("exact", err <= tol, f"engine = sketch to {err:.2g} of peak over {n / sr:g} s (tol {tol:g}){where}",
                      max_err=err, seconds=n / sr, tol=tol)

    # behaviour: windowed mean and spread of a probe, where samples can't match
    for b in gate.get("behaviour", []):
        w = int(round(b["window"] * sr))
        start = int(round(b.get("after", 0.0) * sr))
        rw = windows(ref["probes"][b["probe"]], w, start)
        for tag, r in (("engine", eng), ("plugin", plug)):
            xw = windows(r["probes"][b["probe"]], w, start)
            dm = float(np.abs(xw.mean(1) - rw.mean(1)).max())
            ds = float(np.abs(xw.std(1) - rw.std(1)).max())
            good = dm <= b["mean_tol"] and ds <= b["std_tol"]
            ok &= verdict("behaviour", good,
                          f"{tag} {b['probe']}, {b['window']:g} s windows from {b.get('after', 0):g} s: "
                          f"mean within {dm:.3g} (tol {b['mean_tol']:g}), spread within {ds:.3g} (tol {b['std_tol']:g})",
                          source=tag, probe=b["probe"], max_mean_diff=dm, max_std_diff=ds,
                          mean_tol=b["mean_tol"], std_tol=b["std_tol"])

    # plugin: the smoothed, block-automated processor keeps the sketch's loudness
    w = int(0.25 * sr)
    rr = np.sqrt((windows(ref["out"][0], w) ** 2).mean(1))
    pr = np.sqrt((windows(plug["out"][0], w) ** 2).mean(1))
    loud = rr > 10 ** (-60 / 20)
    dl = float(np.abs(db(pr[loud]) - db(rr[loud])).max()) if loud.any() else 0.0
    tol_db = gate.get("plugin_rms_db", 0.5)
    ok &= verdict("plugin", dl <= tol_db, f"loudness of each 0.25 s within {dl:.3g} dB of the sketch (tol {tol_db:g})",
                  max_db_diff=dl, tol_db=tol_db)

    # sanity: finite, no clipping, not silent
    for tag, r in (("engine", eng), ("plugin", plug)):
        x = r["out"]
        fin = bool(np.isfinite(x).all())
        pk = float(np.abs(x).max()) if fin else float("inf")
        rms = float(np.sqrt((x ** 2).mean())) if fin else 0.0
        ok &= verdict("sanity", fin and pk <= 1.0 and rms > 1e-4,
                      f"{tag} finite={fin}, peak {db(pk):.1f} dBFS, rms {db(rms):.1f} dBFS",
                      source=tag, peak=pk, rms=rms, finite=fin)

    rec["passed"] = bool(ok)
    return rec


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("plugin_dir")
    ap.add_argument("--quick", type=float, help="cut every path to this many seconds")
    ap.add_argument("--only", help="comma-separated path names")
    ap.add_argument("--no-cache", action="store_true")
    a = ap.parse_args()

    root = Path(a.plugin_dir).resolve()
    harness = find_harness(root)
    table = json.loads(subprocess.run([str(harness), "params"], check=True, capture_output=True, text=True).stdout)
    ref_dir = root / "reference"
    sketch = load_module(ref_dir / "sketch.py", "sketch")
    paths_mod = load_module(ref_dir / "paths.py", "paths")
    sr = getattr(paths_mod, "SR", 44100)
    cache = dict(source=(ref_dir / "sketch.py").read_bytes() + (ref_dir / "paths.py").read_bytes())

    work = root / "out"
    work.mkdir(exist_ok=True)
    paths = paths_mod.PATHS
    if a.only:
        keep = set(a.only.split(","))
        paths = [p for p in paths if p["name"] in keep]
    if a.quick:
        paths = [dict(p, secs=min(p["secs"], a.quick)) for p in paths]

    print(f"{table['name']}: {len(table['params'])} parameters, {len(paths)} paths, {sr} Hz, harness {harness.relative_to(root)}")
    results = [check_path(p, table, sketch, harness, sr, work, cache, not a.no_cache) for p in paths]
    passed = all(r["passed"] for r in results)
    report = dict(plugin=table["name"], sr=sr, quick=a.quick, passed=passed, paths=results)
    (work / "report.json").write_text(json.dumps(report, indent=1))
    print(f"\n{'ALL GATES PASSED' if passed else 'SOME GATES FAILED'}  (numbers in out/report.json, renders in out/)")
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
