#!/usr/bin/env python3
"""
ComfyUI determinism probe, 2026-11-15: is a same-seed rerun byte-identical, and under which
launch configuration?

For each configuration it starts its own ComfyUI server on 127.0.0.1:8188, renders the
fireflies workflow at one seed N times (clearing the server's node cache between renders with
POST /free, so the sampler really re-runs), stops the server, and compares the PNGs and their
decoded pixels. Results go to measured.json beside this script.

  <comfy venv>/python "Shop/ComfyUI/proofs/2026-11-15-determinism/determinism.py" [--configs mps,mps_det,cpu]

Run from the palace root (main checkout or a worktree: _tools/ComfyUI is found in the main
checkout either way). Port 8188 must be free. Written 2026-11-15. A maker who can probe this
better another way does so, and leaves the comparison on the scroll.
"""
import argparse, hashlib, json, os, signal, subprocess, sys, time, urllib.request
from pathlib import Path
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = Path(subprocess.run(["git", "-C", str(HERE), "rev-parse", "--path-format=absolute", "--git-common-dir"],
                           capture_output=True, text=True).stdout.strip()).parent
COMFY = ROOT / "_tools" / "ComfyUI"
PY = COMFY / "venv" / "bin" / "python"
WORKTREE = Path(subprocess.run(["git", "-C", str(HERE), "rev-parse", "--show-toplevel"], capture_output=True, text=True).stdout.strip())
RUNNER = WORKTREE / "Shop/ComfyUI/proofs/2026-11-14-card-check/comfy_run.py"
WF = WORKTREE / "Kuramoto Coupling/fireflies-pond-workflow.json"
HOST = "127.0.0.1:8188"
BASE = ["--listen", "127.0.0.1", "--port", "8188"]
CONFIGS = {
    # the card's Run line, as of 2026-11-14
    "mps":     dict(flags=["--highvram", "--use-split-cross-attention"], w=768, h=512, steps=20, n=3),
    # the same plus torch.use_deterministic_algorithms(True, warn_only=True)
    "mps_det": dict(flags=["--highvram", "--use-split-cross-attention", "--deterministic"], w=768, h=512, steps=20, n=3),
    # everything on the CPU (fp32), small and short so it fits in minutes
    # yesterday's pattern: seed 7, then a seed-8 render with the model kept warm, then seed 7 again (no /free)
    "mps_warm": dict(flags=["--highvram", "--use-split-cross-attention"], w=768, h=512, steps=20, n=2, between="seed8"),
    "mps_det_warm": dict(flags=["--highvram", "--use-split-cross-attention", "--deterministic"], w=768, h=512, steps=20, n=2, between="seed8"),
    "cpu":     dict(flags=["--cpu", "--deterministic"], w=512, h=512, steps=6, n=2),
    "cpu_nodet": dict(flags=["--cpu"], w=512, h=512, steps=6, n=2),
    # the warm pattern on the CPU: is the warm-model drift an MPS thing?
    "cpu_warm": dict(flags=["--cpu", "--deterministic"], w=512, h=512, steps=6, n=2, between="seed8"),
}


def call(path, data=None):
    req = urllib.request.Request(f"http://{HOST}{path}", data=data, method="POST" if data else "GET",
                                 headers={"Content-Type": "application/json"} if data else {})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def wait_up(proc, limit=180):
    t0 = time.time()
    while time.time() - t0 < limit:
        if proc.poll() is not None:
            raise RuntimeError("server exited early")
        try:
            call("/system_stats"); return time.time() - t0
        except Exception:
            time.sleep(1)
    raise TimeoutError("server did not come up")


def compare(a, b):
    A = np.asarray(Image.open(a).convert("RGB")).astype(np.int16)
    B = np.asarray(Image.open(b).convert("RGB")).astype(np.int16)
    d = np.abs(A - B)
    return {"a": a.name, "b": b.name,
            "sha_equal": hashlib.sha256(a.read_bytes()).hexdigest() == hashlib.sha256(b.read_bytes()).hexdigest(),
            "pixels_equal": bool((d == 0).all()),
            "max_abs_diff": int(d.max()), "mean_abs_diff": round(float(d.mean()), 4),
            "pct_pixels_differing": round(100 * float((d.max(axis=2) > 0).mean()), 2)}


def run_config(name, cfg, seed, outdir):
    log = open(outdir / f"server-{name}.log", "w")
    db = f"sqlite:///{outdir.parent / ('.' + name + '.db')}"  # own db, so no lock fight; deleted after
    proc = subprocess.Popen([str(PY), str(COMFY / "main.py"), *BASE, *cfg["flags"], "--database-url", db],
                            cwd=str(COMFY), stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
    res = {"between_renders": cfg.get("between", "free"), "flags": cfg["flags"], "width": cfg["w"], "height": cfg["h"], "steps": cfg["steps"], "seed": seed, "renders": []}
    try:
        res["server_up_sec"] = round(wait_up(proc), 1)
        for i in range(cfg["n"]):
            out = outdir / f"{name}-run{i + 1}.png"
            t0 = time.time()
            r = subprocess.run([str(PY), str(RUNNER), "--workflow", str(WF), "--out", str(out), "--seed", str(seed),
                                "--width", str(cfg["w"]), "--height", str(cfg["h"]), "--steps", str(cfg["steps"]),
                                "--timeout", "900"], capture_output=True, text=True)
            rep = json.loads(out.with_suffix(".report.json").read_text()) if r.returncode == 0 else {"error": r.stderr[-400:]}
            rep["wall_sec"] = round(time.time() - t0, 1)
            res["renders"].append(rep); print(name, i + 1, rep.get("sha256", rep.get("error")), rep["wall_sec"], flush=True)
            if r.returncode != 0:
                break
            if i == cfg["n"] - 1:
                break
            if cfg.get("between") == "seed8":
                # a different seed between keeps the loaded model and the cache, so the next seed-7 re-samples warm
                o8 = outdir / f"{name}-between-seed8.png"
                subprocess.run([str(PY), str(RUNNER), "--workflow", str(WF), "--out", str(o8), "--seed", str(seed + 1),
                                "--width", str(cfg["w"]), "--height", str(cfg["h"]), "--steps", str(cfg["steps"])], capture_output=True)
            else:
                # clear the node cache so the next identical prompt really re-samples; ComfyUI then
                # re-runs the checkpoint loader too, so each render starts from a freshly loaded model
                call("/free", json.dumps({"unload_models": False, "free_memory": True}).encode())
                time.sleep(12)  # the worker reads the flag on its next idle tick (<=10 s after a render)
        imgs = [outdir / f"{name}-run{i + 1}.png" for i in range(len(res["renders"])) if "sha256" in res["renders"][i]]
        res["pairs"] = [compare(imgs[0], b) for b in imgs[1:]]
        if len(imgs) > 2:
            res["pairs"].append(compare(imgs[1], imgs[2]))
    finally:
        os.killpg(proc.pid, signal.SIGTERM)
        try:
            proc.wait(20)
        except subprocess.TimeoutExpired:
            os.killpg(proc.pid, signal.SIGKILL); proc.wait()
        log.close()
        for p in outdir.parent.glob("." + name + ".db*"):
            p.unlink()
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--configs", default="mps,mps_det,cpu")
    ap.add_argument("--seed", type=int, default=7)
    a = ap.parse_args()
    outdir = HERE / "renders"; outdir.mkdir(exist_ok=True)
    mpath = HERE / "measured.json"
    measured = json.loads(mpath.read_text()) if mpath.exists() else {}
    measured.setdefault("date", "2026-11-15"); measured.setdefault("configs", {})
    for name in a.configs.split(","):
        measured["configs"][name] = run_config(name, CONFIGS[name], a.seed, outdir)
        mpath.write_text(json.dumps(measured, indent=2) + "\n")
    # across configurations at the same size: does --deterministic change the MPS image itself?
    r = outdir
    if (r / "mps-run1.png").exists() and (r / "mps_det-run1.png").exists():
        measured["cross"] = [compare(r / "mps-run1.png", r / "mps_det-run1.png")]
        mpath.write_text(json.dumps(measured, indent=2) + "\n")
    print(json.dumps(measured, indent=1))


if __name__ == "__main__":
    sys.exit(main())
