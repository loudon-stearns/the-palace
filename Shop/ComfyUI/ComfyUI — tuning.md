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

## From the card check — 2026-11-14 — the fireflies workflow at 768×512, Sketch tier

4. **A same-seed rerun on this Mac's MPS was not byte-identical.** The fireflies workflow at 768×512, 20 steps, seed 7, run twice in one server (with a seed-8 render between, so the sampler re-ran): the two PNGs match by eye, but 76% of pixels differ, by at most 63 levels and 0.7 on average, and the sha256s differ. The PNGs carry only the `prompt` text chunk, so the difference is in the pixels. Changed: the card lists byte-identical reruns under Not yet shown, and the Test Suite records the failed byte check. The page's byte-exact claims (frontmatter `forward_vector`, Charter, Capabilities, Strengths, Iteration Character, the Determinism paragraph) stand until the review, which should decide whether they say "the same image to the eye" on MPS. Whether a CUDA host or a deterministic-algorithms flag gives byte-exact output is untested. Proof: `proofs/2026-11-14-card-check/` (`rerun-side-by-side.png`, the reports). Owed a review: written by the card-check session, outside a ledger review.
5. **An identical workflow sent twice to one server comes back with no image.** ComfyUI answers from its cache: "Prompt executed in 0.00 seconds", and `/history` holds a completed prompt with empty outputs, so a driver that takes the first image crashes (`StopIteration` here). Changed: `comfy_run.py` checks for it and says to change an input or restart the server. Proposed for § Gotchas › Polling at the review. Owed a review: written by the card-check session, outside a ledger review.
- run · 2026-11-14 · card check: the fireflies workflow at 768×512, 20 steps, seeds 7, 8, 7, sketch · taught items 4, 5

## Carried home on 2026-11-14 — from the Loudon Live Design System's look rethink of 2026-10-25, generated plates

These three are ComfyUI recipes the Design System learned while making its paper plates. They sit in [[Loudon Live Design System — tuning]] items 12–14, in its words; they are carried here so the page that runs the renders can read them. That ledger is left as it was.

6. **Local SDXL first, for grounds.** `_tools/ComfyUI` with `sd_xl_base_1.0.safetensors` made a plate in about 100 s on the Mac, at no cost. It is good at blank aged paper and at rain on glass with neon bokeh. "Blueprint" in a prompt makes it draw a plan, so say "paper". Wear weights above about 1.2 made giant objects (a coffee ring became a paper hoop); 1.15 worked. Changed: nothing on this page yet. Owed a review: carried by the card-check session on 2026-11-14 from [[Loudon Live Design System — tuning]] item 12.
7. **Image to image from a reference's blank paper gives the right material; denoise 0.55 worked.** Tiling strips of a photo into a start image leaves bands; take them out with a high-pass in the tint step (blur 70 px, keep 30% of the low frequencies), or start from one larger clean region. Changed: nothing on this page yet. Owed a review: carried on 2026-11-14 from [[Loudon Live Design System — tuning]] item 13.
8. **Write provenance at generation time, not after.** Write the model, checkpoint, seed, denoise, init source and prompt beside each plate, as a `<plate>.json` sidecar. ComfyUI's `/history` lives only in the running server's memory; it happened to still be up when denoise 0.55 had to be verified, and it won't be next time. Say whether a reference was used as a style guide or as pixels. A reference photo is cited by link only, never committed (Loudon, 2026-10-25), and ComfyUI keeps its own copy of any uploaded init image in `_tools/ComfyUI/input/`: remove it with the rest. Changed: `comfy_run.py` writes a report beside each PNG, which covers seed, size and workflow hash but not an init source or denoise. Owed a review: carried on 2026-11-14 from [[Loudon Live Design System — tuning]] item 14.
