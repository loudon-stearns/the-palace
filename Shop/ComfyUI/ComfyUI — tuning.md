---
title: "ComfyUI — tuning"
born: 2026-11-08
links:
  - target: "[[ComfyUI]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the ComfyUI page's record of what rendering locally has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real render taught."
ledger: tuning
standards:
  for: "what rendering with ComfyUI taught the ComfyUI page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — or a probe of the install itself"
  line: "- run · <date> · <brief or probe>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a change to the install"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# ComfyUI — tuning

What each job taught the ComfyUI page. Each item names what the job showed and what changed because of it, if anything did. Newest last. Items 1 and 2 are the page's two dated gotchas, moved here on 2026-11-08 when the page's Gotchas became present-tense rules; the 2026-05-26 run line is the date the page's `last_tested` kept. Item 3 came from a job dispatched through [[Blender]], whose report holds it; it is recorded here because the rule it taught is ComfyUI's. The undated community watch-list stays on the page until a job hits one.

## From the first local job — 2026-05-26 — the fireflies pond, Sketch tier

1. **The install path on Mac arm64 held:** a `_tools/ComfyUI/` checkout, a Python 3.12 venv, `pip install -r requirements.txt`, and the SDXL checkpoint (~6.9 GB) in `models/checkpoints/`. Torch 2.12.0 picked up MPS by itself (`torch.backends.mps.is_available()` True), with no Metal-specific install. The server started with `python main.py --listen 127.0.0.1 --port 8188` and `system_stats` reported `device: mps / type: mps`. Disk after the first model: ~8 GB (venv 1 GB, source 200 MB, SDXL 6.9 GB). Changed: the wrapped tool became reachable from the Maker's dispatch path. The rebuild manifest later went to [[ComfyUI — local-install]].
2. **The first render after starting the server sat "queued" for ~100 s** before the history endpoint showed any progress, then finished in ~10 s more: the MPS model load. Changed: the poll loop treats a long queued state as normal, with a 10-minute timeout for a first-render SDXL at 30 steps / 1216×832 on MPS. `Kuramoto Coupling/fireflies-pond-render.py` is the reference driver.
- run · 2026-05-26 · the fireflies pond, sketch · taught items 1, 2

## From Blender's conditioning keystone — 2026-06-13

3. **SDXL with three ControlNets on MPS thrashed at ~50 s/it** with the default launch, because weights were offloaded between steps. Restarting with `--highvram --use-split-cross-attention` brought it to ~15 s/it. Changed: [[ComfyUI — local-install]] § Launch makes the flags part of the launch line; the full benchmark is in `Shop/Blender/tests/gotchas-2026-06-13.md` and [[Blender — tuning]] item 7.
