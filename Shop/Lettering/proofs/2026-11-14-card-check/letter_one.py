#!/usr/bin/env python3
"""
Lettering — render one voice from BLUELINE's text-prompts.json into THIS folder, leaving the
bench's out/, skel/, desat/ and contact-sheet.html untouched.

  <comfy venv>/python letter_one.py --only shout-no [--seeds 1] [--mode skeleton|stylize|free] [--out DIR]

It imports the bench renderer (Projects/BLUELINE/proofs/text-layer/render_text.py), points its
output folders here, and turns off the contact-sheet rebuild. Same arguments as the bench.
The ComfyUI server must be up on 127.0.0.1:8188 (see Shop/ComfyUI/ComfyUI — local-install.md).
stylize needs the skeleton render first, in the same --out.

Written 2026-11-14 for the Lettering card check.
"""
import argparse, importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
BENCH = os.path.abspath(os.path.join(HERE, "..", "..", "..", "..", "Projects", "BLUELINE", "proofs", "text-layer"))
ap = argparse.ArgumentParser()
ap.add_argument("--only", required=True); ap.add_argument("--seeds", type=int, default=1)
ap.add_argument("--mode", choices=["skeleton", "free", "stylize"], default="skeleton")
ap.add_argument("--denoise", type=float, default=0.78); ap.add_argument("--out", default=HERE)
a = ap.parse_args()
spec = importlib.util.spec_from_file_location("render_text", os.path.join(BENCH, "render_text.py"))
rt = importlib.util.module_from_spec(spec); sys.argv = [sys.argv[0]]; spec.loader.exec_module(rt)
for k in ("OUT", "SKEL", "DESAT"):
    d = os.path.join(a.out, k.lower()); os.makedirs(d, exist_ok=True); setattr(rt, k, d)
rt.contact_sheet = lambda *_: None
rt.main(set(a.only.split(",")), a.seeds, a.mode, a.denoise)
