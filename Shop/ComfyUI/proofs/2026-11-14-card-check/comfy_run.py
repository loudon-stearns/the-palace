#!/usr/bin/env python3
"""
ComfyUI — run one API-format workflow JSON against a local server and save the image.

The generic driver the card's Run line names. It queues the workflow, polls, pulls the
image back through the server's /view endpoint (so it works from any worktree, with no
path into _tools/), and writes a small standards report beside the PNG.

  <comfy venv>/python comfy_run.py --workflow WF.json --out OUT.png \
      [--seed N] [--width W --height H] [--steps N] [--prompt "..."] [--host 127.0.0.1:8188]

Overrides touch the first KSampler (seed, steps), the first EmptyLatentImage (width,
height) and the KSampler's positive CLIPTextEncode (prompt). Keys starting "_" (comments)
are dropped before queueing. Server first:
  _tools/ComfyUI/venv/bin/python _tools/ComfyUI/main.py --listen 127.0.0.1 --port 8188 \
      --highvram --use-split-cross-attention

Written 2026-11-14 for the ComfyUI card check; see README.md beside it.
"""
import argparse, hashlib, json, sys, time, urllib.parse, urllib.request
from pathlib import Path


def call(host, path, data=None):
    req = urllib.request.Request(f"http://{host}{path}", data=data, method="POST" if data else "GET",
                                 headers={"Content-Type": "application/json"} if data else {})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def first(wf, cls):
    return next((k for k, v in wf.items() if v.get("class_type") == cls), None)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workflow", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--seed", type=int)
    ap.add_argument("--width", type=int)
    ap.add_argument("--height", type=int)
    ap.add_argument("--steps", type=int)
    ap.add_argument("--prompt")
    ap.add_argument("--host", default="127.0.0.1:8188")
    ap.add_argument("--timeout", type=int, default=600, help="a first SDXL render on MPS can sit ~100 s queued")
    a = ap.parse_args()

    wf = {k: v for k, v in json.loads(Path(a.workflow).read_text()).items() if not k.startswith("_")}
    ks, lat = first(wf, "KSampler"), first(wf, "EmptyLatentImage")
    if ks:
        if a.seed is not None: wf[ks]["inputs"]["seed"] = a.seed
        if a.steps is not None: wf[ks]["inputs"]["steps"] = a.steps
        if a.prompt is not None: wf[wf[ks]["inputs"]["positive"][0]]["inputs"]["text"] = a.prompt
    if lat:
        if a.width: wf[lat]["inputs"]["width"] = a.width
        if a.height: wf[lat]["inputs"]["height"] = a.height

    t0 = time.time()
    pid = json.loads(call(a.host, "/prompt", json.dumps({"prompt": wf}).encode()))["prompt_id"]
    while True:
        if time.time() - t0 > a.timeout:
            print("timed out", file=sys.stderr); return 1
        h = json.loads(call(a.host, f"/history/{urllib.parse.quote(pid)}")).get(pid)
        if h and h.get("status", {}).get("completed"): break
        if h and h.get("status", {}).get("status_str") == "error":
            print("ComfyUI error:", json.dumps(h["status"])[:400], file=sys.stderr); return 1
        time.sleep(1)
    img = next((i for o in h["outputs"].values() for i in o.get("images", [])), None)
    if img is None:
        # An identical workflow already ran in this server's lifetime: ComfyUI serves it from
        # cache in ~0 s and the history carries no image. Seen 2026-11-14.
        print("no image in the history: this exact workflow already ran in this server, so ComfyUI "
              "cached it. Change any input (seed, prompt, size) or restart the server.", file=sys.stderr)
        return 2
    q = urllib.parse.urlencode({"filename": img["filename"], "subfolder": img.get("subfolder", ""),
                                "type": img.get("type", "output")})
    data = call(a.host, "/view?" + q)
    out = Path(a.out); out.parent.mkdir(parents=True, exist_ok=True); out.write_bytes(data)
    stats = json.loads(call(a.host, "/system_stats"))
    report = {
        "out": out.name, "sha256": hashlib.sha256(data).hexdigest(),
        "render_time_sec": round(time.time() - t0, 1),
        "seed": wf[ks]["inputs"]["seed"] if ks else None, "steps": wf[ks]["inputs"]["steps"] if ks else None,
        "width": wf[lat]["inputs"]["width"] if lat else None, "height": wf[lat]["inputs"]["height"] if lat else None,
        "workflow": str(a.workflow), "comfyui_version": stats["system"].get("comfyui_version"),
        "device": stats["devices"][0]["type"] if stats.get("devices") else None,
        "workflow_hash": hashlib.sha256(json.dumps(wf, sort_keys=True).encode()).hexdigest()[:16],
        "status": "ok",
    }
    out.with_suffix(".report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
