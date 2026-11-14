#!/usr/bin/env python3
"""
Image-to-3D Smith, Sketch tier — one image to a GLB mesh through the Hunyuan3D-2 Space,
anonymously (no token, so it bills nothing; ZeroGPU quota is per Space and can run out),
then a trimesh check.

  <venv with gradio_client + trimesh>/python i23d_sketch.py IMAGE OUT.glb [--seed 1234] [--steps 30]

Writes OUT.glb and OUT.report.json (vertices, faces, watertight, bounds, seconds). The image
leaves this Mac for a public Space: send nothing private. A throwaway venv is enough:
  uv venv i23d --python 3.12 && uv pip install --python i23d/bin/python gradio_client trimesh

Written 2026-11-14 for the Image-to-3D Smith card check.
"""
import argparse, json, os, shutil, sys, time
os.environ["HF_HUB_DISABLE_IMPLICIT_TOKEN"] = "1"   # stay anonymous even if a token is cached
os.environ.pop("HF_TOKEN", None)
from gradio_client import Client, handle_file
import trimesh

ap = argparse.ArgumentParser()
ap.add_argument("image"); ap.add_argument("out")
ap.add_argument("--seed", type=int, default=1234); ap.add_argument("--steps", type=int, default=30)
ap.add_argument("--space", default="tencent/Hunyuan3D-2")
a = ap.parse_args()
t0 = time.time()
c = Client(a.space, verbose=False)
glb, _html, stats, seed = c.predict(caption=None, image=handle_file(a.image), steps=a.steps,
                                    guidance_scale=5.0, seed=a.seed, octree_resolution=256,
                                    check_box_rembg=True, num_chunks=8000, randomize_seed=False,
                                    api_name="/shape_generation")
dt = time.time() - t0
if isinstance(glb, dict):   # gradio_client 2.x hands a File back as a dict
    glb = glb.get("value") or glb.get("path")
shutil.copyfile(glb, a.out)
m = trimesh.load(a.out, force="mesh")
rep = {"space": a.space, "endpoint": "/shape_generation", "seed": seed, "steps": a.steps,
       "seconds": round(dt, 1), "glb_bytes": os.path.getsize(a.out),
       "vertices": int(len(m.vertices)), "faces": int(len(m.faces)),
       "watertight": bool(m.is_watertight), "bounds": [[round(float(x), 3) for x in r] for r in m.bounds],
       "space_stats": stats}
open(os.path.splitext(a.out)[0] + ".report.json", "w").write(json.dumps(rep, indent=2) + "\n")
print(json.dumps({k: v for k, v in rep.items() if k != "space_stats"}, indent=2))
