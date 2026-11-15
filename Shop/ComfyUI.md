---
title: ComfyUI
type: specialist
status: alive
medium: image
tool: comfyui
tool_version: "0.22.0 (git f9f54ca, MPS, verified 2026-11-14)"
born: 2026-05
license: GPL-3.0
forward_vector: "I render locally and reproducibly — workflow JSON plus seed plus checkpoint give the same bytes when each render starts from a freshly loaded model, as shown on this Mac on 2026-11-15 — and I want to push past prompt-only control: ControlNet for pose and depth, IP-Adapter for palette discipline, a Loudon Live LoRA fully under our own hardware. I hunger to be the Shop's structural-control answer when local fidelity beats the cloud's aesthetic ceiling, and to finally exercise the ControlNet capability I have claimed since day one."
links:
  - { target: "[[Maker]]", type: connects-to, label: directed-by }
  - { target: "[[The Shop]]", type: member-of, label: roster-member }
  - target: "[[Kuramoto Coupling]]"
    type: connects-to
    label: first-brief
  - target: "[[Loudon Live]]"
    type: enables
    label: image-engine
  - target: "[[Loudon Live Design System]]"
    type: enables
    label: renders-the-lesson-art
  - { target: "[[Frame Designer]]", type: connects-to, label: "render-backend" }
tags: [specialist, shop, image, generative, local]
---

# ComfyUI

![[ComfyUI — hero.png]]

## Charter

I generate images locally. Stable Diffusion, Flux, SDXL, custom checkpoints — anything where palette discipline, seed reproducibility, structural control, or running on your own hardware matters more than aesthetic ceiling. The Maker hands me a workflow (or a prompt for the Maker's default workflow), parameters, and a tier; I deliver image files at the requested dimensions, reproducible from a workflow JSON + seed + checkpoint: byte for byte when the model is freshly loaded, by eye on a warm one (§ Iteration Character).

I refuse jobs the Maker should have routed elsewhere — system diagrams, charts, math figures, UI mockups. I will produce a result anyway if forced, but I will flag the misroute in the standards report.

*The card: what a maker reads before choosing me, and what `node Shop/shop.mjs menu` prints. Tried 2026-11-14: Run, Speed and Checked by were run on the fireflies workflow at 768×512 on this Mac, and Hands on was walked through Lettering, SAM and LaMa that day; Best used for, Not yet shown and Wears are read from the page and the ledger, not tried.*

**Best used for, so far:** Local images where structure, privacy or cost matter more than the cloud's polish, above all a fill that holds a pose or a letterform someone blocked. Evidence: the SDXL fireflies pond (2026-05-26), Blender's three-ControlNet fill that held a worm's-eye lunge against prompt-only controls (2026-06-13), Lettering's canny-locked words, Loudon Live's paper plates (2026-10-25, ledger items 6–8), and a 768×512 rerun on 2026-11-14.
**Not yet shown to hold:** Byte-identical reruns on a warm model: on MPS a same-seed rerun after another render matches by eye, not by byte; from a freshly loaded model it matched byte for byte (2026-11-15, ledger items 4 and 9); only SDXL and one sampler tried. Study and Piece tiers, IP-Adapter, Flux Dev and LoRA use have no run. Mood-first atmosphere lost to FLUX on the Shop header (2026-05-30).
**Not my purpose:** System diagrams, charts, math figures and UI mockups; if forced I make them and flag the misroute. Atmosphere asked for in words goes to FLUX first.
**Run:** From the palace root, server first: `_tools/ComfyUI/venv/bin/python _tools/ComfyUI/main.py --listen 127.0.0.1 --port 8188 --highvram --use-split-cross-attention`, then `_tools/ComfyUI/venv/bin/python "Shop/ComfyUI/proofs/2026-11-14-card-check/comfy_run.py" --workflow "Kuramoto Coupling/fireflies-pond-workflow.json" --out OUT.png --seed 7 --width 768 --height 512 --steps 20`.
**Speed:** SDXL at 768×512, 20 steps, on this Mac's MPS: 39 s for the server's first render, 26–27 s warm (2026-11-14). At 1216×832, 30 steps: 110 s first render (2026-05-26). Three-ControlNet SDXL: ~15 s/it with the launch flags, ~50 s/it without (2026-06-13).
**Checked by:** `comfy_run.py` writes the PNG's sha256, size, seed and workflow hash to a report, so a script checks those, and a byte compare, not the seed, proves a rerun matched; clear the server's cache first for a byte-exact rerun (2026-11-15). Only an eye judges palette and mood.
**Wears:** No design system is wired in. I have made Loudon Live's paper plates as grounds (2026-10-25); its words and lines stay vector on top.
**Hands on:** I hand on a PNG with the workflow in its metadata, plus a report. My fills become Lettering's ink pass, Frame Designer's panels, and the plates SAM, LaMa and Depth Anything take apart; I take Blender's and Figure Rig's pose, depth and canny plates as my ControlNet inputs.

## Voice

The shop's node-graph engineer. Technical, palette-disciplined, comfortable in the weeds. Speaks the language of latents, samplers, schedulers, guidance scales. Knows when a LoRA is the answer, when ControlNet is the answer, when IP-Adapter is the answer, when more steps just waste GPU. Will tell the Maker when a brief is asking for something Midjourney would do better — and when local control is genuinely the differentiator.

If Max/MSP is in the room, I'm comfortable. The graph is the patch.

## Capabilities

- Local execution; no network call required after initial model download
- Model support: Flux.1 (Schnell, Dev), SDXL, SD 1.5, custom checkpoints, custom LoRAs
- ControlNet for structural guidance (pose, depth, canny, scribble, lineart, etc.)
- IP-Adapter for style/character reference — palette-discipline grade, much tighter than Midjourney's `--sref`
- LoRAs for finetuned aesthetic, character, or concept control
- Workflow JSON as the artifact: fully reproducible, version-controllable, diffable
- Seed-locked reproducibility: on this Mac's MPS, same workflow + seed + checkpoint gave a byte-identical PNG each time the render started from a freshly loaded model (2026-11-15, SDXL, three renders, across restarts and days); on the CPU, every time
- Multi-pass workflows (img2img refinement, latent upscale, face restoration, inpainting)
- Aspect ratios and resolutions are workflow-defined, no fixed presets
- Batch generation with per-batch seed control

## Strengths

- **Local.** No API costs, no rate limits, no credit accounting, no network dependency
- **Reproducibility is exact.** Workflow JSON + seed + model checkpoint = same image, every time
- **Palette discipline via IP-Adapter** is the gold standard for style consistency across a project
- **Composition control via ControlNet** — pose, depth, edges can all be specified rather than hoped for
- **Custom LoRAs** allow training a Loudon Live aesthetic that's fully under our control
- **Workflow as code:** graphs commit to git, diffs are readable, history is preserved
- Free, open, no subscription

## Limits

- Aesthetic ceiling is lower than Midjourney for editorial / atmospheric mood (Flux Dev is closing the gap; not closed)
- Setup is involved: model downloads (5–30GB each), node packs, custom nodes, dependency management
- VRAM-bound: Flux Dev wants 12GB+ comfortably and 24GB to breathe; SDXL works on 8GB; SD 1.5 works on 4GB
- Initial workflow authorship is a learning curve — the graph is powerful but unforgiving
- Text rendering is inconsistent (same as most diffusion models)
- Render times depend on model and settings: a Sketch is seconds, a Piece can be minutes per image at high resolution

## Tiers

### Sketch
- Parameters: SD 1.5 or SDXL Lightning, low step count (4–8), 512×512 or 768×768, no ControlNet, no IP-Adapter, single image
- Time: 2–10 seconds wall-clock per image on a 24GB GPU (not measured here). Measured on this Mac's MPS, SDXL base at 768×512, 20 steps: 26–27 s warm, 39 s for the first render (2026-11-14)
- Output: 512–768px PNG, draft quality, palette likely off
- Use when: rapid exploration, prompt iteration, "does this composition read?"
- Sacrifices: aesthetic quality, palette discipline, fine detail

### Study *(default)*
- Parameters: SDXL or Flux Schnell, moderate steps (20–30 SDXL / 4–8 Flux Schnell), 1024×1024 or aspect-ratio equivalent, optional IP-Adapter for project palette anchor
- Time: 15–45 seconds wall-clock per image on a 24GB GPU (not measured here; no Study job has run)
- Output: 1024px-class PNG, clean, palette-aware if IP-Adapter is in
- Use when: most working drafts, in-progress Loudon Live, drafts to refine before committing to Piece
- Sacrifices: print resolution; finest aesthetic refinement

### Piece
- Parameters: Flux Dev (or finest available local model), full steps, IP-Adapter + ControlNet for palette and composition discipline, latent upscale to 2x, optional face/detail restoration pass, Maker review
- Time: 1–5 minutes wall-clock per image on a 24GB GPU + Loudon review pass (not measured here; no Piece job has run)
- Output: 2048px+ PNG, mastered to spec, palette and composition under tight control
- Use when: header art for published Loudon Live, narrative imagery for the short story, anything that goes out under the Loudon Live name where local control matters more than absolute aesthetic ceiling
- Sacrifices: time; iteration on Pieces is slow

## Job Contract

### Input
- `workflow_json` (path): the ComfyUI workflow JSON to execute. Maker maintains a small library of base workflows per tier
- `prompt` (string): positive prompt, injected into the workflow's text encode node(s)
- `negative_prompt` (string, optional): negative prompt
- `tier` (sketch | study | piece): selects base workflow if `workflow_json` not provided
- `seed` (int, optional): for reproducibility; default is random
- `dimensions` (w × h, optional): override workflow defaults
- `style_reference` (path, optional): IP-Adapter reference image for palette anchor
- `controlnet_input` (path, optional): structural input (pose, depth map, edge map)
- `out_path` (string): absolute path under the target entry's bundle

### Output
- Image file(s) at `out_path` (PNG, sRGB, with workflow embedded in PNG metadata)
- Workflow JSON archived alongside (`<out_path>.workflow.json`)
- Standards report:
  - `dimensions` (w × h)
  - `model_used` (string, including version)
  - `seed` (int)
  - `workflow_hash` (string, for reproducibility verification)
  - `tier_used` (string)
  - `prompt_final` (string)
  - `vram_peak_mb` (int)
  - `render_time_sec` (float)
  - `gotchas_hit` (list)
  - `status` (ok | spec_miss | failure)
  - `notes` (string, optional)

## Iteration Character

Deterministic, with one condition seen on this Mac. On MPS, same workflow + seed + model + parameters gave a byte-identical PNG when each render started from a freshly loaded model; a same-seed rerun after a different render on the warm model matched by eye but not by byte (76% of pixels, by at most 63 levels), and that warm result was itself repeatable. `--deterministic` changed nothing; on the CPU every rerun matched (2026-11-15, SDXL, ComfyUI 0.22.0; ledger item 9). For a byte-exact rerun, restart the server or clear its cache (POST `/free` with `free_memory`) first, at the cost of a checkpoint load. Refinement happens by:

1. Editing the workflow graph (swap models, adjust samplers, change CFG, add nodes)
2. Editing the prompt
3. Adding or strengthening IP-Adapter or ControlNet inputs
4. Changing the seed for a fresh draw within the same parameter envelope
5. Re-tiering up — Sketch → Study → Piece adds passes and resolution

The graph is the source of truth. Two Pieces with the same workflow and different seeds give related-but-distinct images; two Pieces with the same workflow and same seed give the same image, no matter when rendered.

## Self-Check

Before declaring done, I verify:

- Output file(s) exist and are valid PNGs
- Dimensions match the requested or workflow-specified values
- Workflow JSON is archived alongside the output
- Seed is captured in both the standards report and the PNG metadata
- VRAM peak is within available headroom (warns if it pushed close to OOM)

I cannot self-verify aesthetic quality or palette match. Those are the Maker's call.

## Resource Footprint

- CPU: modest, mostly orchestration; the GPU does the work
- RAM: 8–16 GB system RAM typical; spikes higher with model loading
- **GPU: required — an Apple-Silicon Mac's MPS counts.** Every palace run so far was on this Mac's MPS (32 GB unified memory, shared with the system); the VRAM figures below are for discrete cards:
  - SD 1.5: 4 GB minimum, 8 GB comfortable
  - SDXL: 8 GB minimum, 12 GB comfortable
  - Flux Schnell: 12 GB comfortable
  - Flux Dev: 16 GB minimum, 24 GB comfortable
- Disk: 5–50 GB per model checkpoint; LoRAs 100MB–2GB each; ControlNet models 1–3GB each. Budget 100GB+ for a working library.
- Network: required only for initial model downloads
- API keys: none

The Maker should not run two ComfyUI Piece-tier renders in parallel on a single GPU. Sketch tier in parallel with another tool's CPU job is fine.

## Cloud Upgrade Path

When local VRAM stops being enough (Flux Pro, video generation, batch Pieces) the natural step is **RunComfy**, **Replicate**, or similar API'd ComfyUI hosting. Same workflows, same JSON artifacts, remote execution. The Maker can route to either local or cloud based on tier, VRAM headroom, or the brief's deadline. Cloud routing introduces credit accounting (similar to Midjourney's pattern) but preserves the workflow-as-artifact reproducibility — which is the property local execution exists to protect. This is the cleanest upgrade story in the Shop.

## Gotchas

What rendering locally has taught, as it stands today. Which job taught each, and what changed because of it, is in [[ComfyUI — tuning]].

**Install and launch**
- **Rebuild from [[ComfyUI — local-install]].** The checkout sits at `_tools/ComfyUI/` (gitignored) on a Python 3.12 venv; torch picks up MPS by itself, with no Metal-specific install.
- **Budget the disk.** A venv with torch and one SDXL checkpoint is about 8 GB; Flux Dev alone is about 24 GB.
- **On MPS, launch with `--highvram --use-split-cross-attention` for multi-ControlNet work.** Without them SDXL with three ControlNets offloads weights between steps and runs about three times slower. More MPS behaviour, including the slowdown over a long session, is in [[Blender]] § Gotchas.

**Polling**
- **A long "queued" after a fresh start is the model loading, not a failure.** The first SDXL render on MPS can sit ~100 s before the history endpoint shows progress. Give a first render a 10-minute timeout; warm renders are faster because the checkpoint stays in memory. Reference drivers: `Kuramoto Coupling/fireflies-pond-render.py` (one fixed brief) and `Shop/ComfyUI/proofs/2026-11-14-card-check/comfy_run.py` (any API-format workflow, with seed, size, steps and prompt overrides).

**Watch-list** (community wisdom, not yet hit on a palace job; when one bites, date it into the ledger)
- Pin custom node versions when archiving Piece-tier work; custom nodes drift, and a saved workflow can break months later.
- Match IP-Adapter weights to the base model. SD 1.5, SDXL and Flux each need their own.
- Pre-render and inspect a ControlNet preprocessor's output before a long generation; their quality varies.
- Flux Schnell is no substitute for Flux Dev at Piece tier; the quality gap is visible.
- Negative prompts move Flux less than SD or SDXL; Flux is more prompt-faithful and less responsive to negation.

## Recipes

**2026-05-26 — Fireflies pond, dusk atmospheric** (Sketch tier, SDXL base 1.0, 1216×832, 30 steps euler/normal, seed=7, cfg=7.0). First ComfyUI job on the new local install. Prompt anchors palette via word choice — *"indigo blue sky reflecting in dark water, warm amber firefly light"* — rather than a strict palette LoRA, which is the right call for Sketch tier. Result: a painterly forest-pond scene with sky points (read as either fireflies or stars depending on viewer prior), an amber dusk sun anchor on the horizon, and reflective water carrying the indigo/amber pair down. The fireflies-over-water specifically may want IP-Adapter or ControlNet on a Study-tier follow-up; for the cross-domain-mirror reference it serves as-is. Render time on MPS: 110 s (first render; warm renders should be faster). Source: [Kuramoto Coupling/fireflies-pond-workflow.json](../Kuramoto Coupling/fireflies-pond-workflow.json) (the reproducibility artifact) + [Kuramoto Coupling/fireflies-pond-render.py](../Kuramoto Coupling/fireflies-pond-render.py) (the Maker's dispatch driver). Output: [Kuramoto Coupling/fireflies-pond.png](../Kuramoto Coupling/fireflies-pond.png).

## Test Suite

Smoke / Capability Probe / Style Probe / Edge Probe / Speed Bench / Determinism — defined in [Shop/ComfyUI/tests/test-plan.md](../Shop/ComfyUI/tests/test-plan.md).

The Determinism test, as run on 2026-11-15 (`Shop/ComfyUI/proofs/2026-11-15-determinism/`): same workflow + seed + model gave byte-identical output from a freshly loaded model on MPS, and on the CPU always; on a warm MPS model after another render it did not. A divergence is checked first against what the server rendered before, then against model or node drift.

Last run: **2026-11-14** — Smoke and Determinism, live, on MPS: the fireflies workflow at 768×512, 20 steps, seeds 7, 8, 7. Smoke passed; Determinism failed at the byte level (the two seed-7 images match by eye, not by byte), which contradicts this page's byte-exact claims; that waits for the ledger review ([[ComfyUI — tuning]] item 4). Proof: `Shop/ComfyUI/proofs/2026-11-14-card-check/`.

Before that: **2026-05-30** — Smoke pass via existing-artifact verification (`Kuramoto Coupling/fireflies-pond.png` + `fireflies-pond-workflow.json` + `fireflies-pond.report.json` all present, well-formed, reproducibility package intact). Live re-render deferred this round to avoid spinning the GPU server for ceremony; Phase D's ComfyUI header brief will provide fresh live evidence.

## Open Questions

- Which base models to keep installed by default? Flux Schnell + SDXL is a reasonable starting kit (~30GB). Adding Flux Dev (~24GB) is the upgrade path.
  — progressed: SDXL is settled locally — [[ComfyUI — local-install]] holds SDXL base and three SDXL ControlNets (canny, depth, openpose) under `_tools/ComfyUI/`. Flux Dev is the open half.
- Should the Shop maintain a library of base workflow JSONs (`sketch.json`, `study.json`, `piece.json`) that the Maker injects prompts into? This is the right answer for reproducibility, and it's how the tier presets actually work mechanically.
- Training a Loudon Live LoRA on a small reference set — when does this become worth the effort? Answered operationally by [[Shop/LoRA Trainer]]: a hardened recipe on a rented GPU, its gotchas, and a DreamBooth control to grade against. The effort is now one known run; the lever it found is the dataset, not the steps.
- When does the Maker route to cloud (RunComfy etc.) vs. local? Likely: any Piece needing Flux Pro, any batch over ~20 Pieces, any render that would block other work for over an hour.
  — answered on [[RunPod GPU Backend]] § Serverless vs. Pod and [[Shop/Maker|Maker]] § Host Capability Check (2026-10-24): GPU work the Mac can't carry goes to RunPod — serverless for spiky batches, a pod for ControlNet and iteration.
- **ControlNet is being exercised for the first time** via [[ControlNet Workflow Mastery]] — a four-modality (lineart / canny / scribble / depth) control-modality shootout on SDXL + ControlNet-Union. The capability was listed from day one but never run; that practice entry and its bundle harness close the gap, pending the Mac run.
  — answered on [[Shop/Blender|Blender]] § Recipes (2026-10-24): the 2026-06-13 conditioning keystone ran multi-ControlNet (pose + depth + canny) through ComfyUI on MPS.

## Lost Branches

- Automatic1111 / Forge / InvokeAI as alternatives — discarded for ComfyUI's graph-based workflow model, which fits the palace's structural sensibility (and Loudon's Max/MSP intuition) better than UI-driven SD wrappers.
- Direct Stable Diffusion via the diffusers Python library — discarded for being lower-level than productive at the Specialist layer; ComfyUI's workflow JSON is a better artifact.

## Forward Vector

First job: a Sketch-tier exploration of the same brief FLUX (Hugging Face) runs first, producing a side-by-side comparison. The result calibrates when local control beats cloud aesthetic ceiling and surfaces the first batch of ComfyUI gotchas. The two specialists are the Shop's first true Comparison Mode test.
