---
title: RunPod GPU Backend
type: concept
pillars:
  - tools
  - creation
born: 2026-06
stage: growing
forward_vector: "I want every Specialist that needs a real GPU to reach me without ceremony — to pick serverless when the work is spiky and a pod when it needs ControlNet or iteration — and I want the walk-cycle to one day move smoothly, so the Shop can make motion, not just stills."
links:
  - target: "[[The Shop]]"
    type: enables
    label: "gpu-substrate"
  - target: "[[Maker]]"
    type: couples-with
    label: "routes-to"
  - target: "[[ComfyUI]]"
    type: connects-to
    label: "runs"
  - target: "[[FLUX (Hugging Face)]]"
    type: connects-to
    label: "hosts-locally"
  - target: "[[Quality Manifesto]]"
    type: connects-to
    label: "tier-as-routing"
  - target: "[[Capability-first prototyping]]"
    type: connects-to
    label: "capability-not-censorship"
  - target: "[[BLUELINE]]"
    type: enables
    label: "render-substrate-for"
  - target: "[[Image-to-3D Smith]]"
    type: enables
    label: original-commission
  - target: "[[assume multi-agent]]"
    type: emerged-from
    label: the-outage-that-forged-the-rule
  - target: "[[LoRA Trainer]]"
    type: enables
    label: trains-on
---

# RunPod GPU Backend

![[RunPod GPU Backend — hero.png]]

The part of the Shop where a Specialist that needs a real GPU goes to get one. RunPod rents the hardware; we bring the container, the open weights, and the workflow. It is the layer beneath the Specialists — not a tool that makes things, but the place tools run when [[The Shop]]'s sandbox can't carry them. Two surfaces, one decision.

> **First major customer beyond Image-to-3D: [[BLUELINE]].** Its render backend ([[BLUELINE — Render Backend]]) rides this substrate — Study tier on a pod, Piece batch on serverless (the routing split). BLUELINE's motion track is also the work that will finally retire this entry's #1 untested horizon (the walk-cycle's stitched-stills flicker). See [[BLUELINE — Production Plan]] Tracks I & V.

## Serverless vs. Pod — the routing decision

**Serverless** scales to zero and bills per second of compute. It is the right surface for spiky, programmatic work — a Specialist commission here, a batch of images there, nothing overnight. You pay only while a job runs; the endpoint costs nothing at rest. The cost is a cold start: the first request after idle has to pull the worker image and load the model (minutes), then ~13–32s per image once warm.

**Pod** is a persistent rented machine. It bills continuously while up (~$0.40–0.70/hr), but there are no cold starts, you get the full ComfyUI on a proxy URL, and — the reason it matters — you can load **ControlNet, LoRAs, IPAdapter, and anything else** the base serverless image doesn't carry. A pod is the right surface for iteration and for any pipeline that needs extra models.

The hard-won reframe: **a pod buys capability, not freedom.** RunPod adds no request-level filter or censorship to either surface — it runs your container and your weights unaltered. The only constraints are the model's own tendencies (identical on both, same weights) and RunPod's account-level Terms (illegal content, platform-wide). So the variable that changes behaviour is *the checkpoint you load*, never serverless-vs-pod. See [[Capability-first prototyping]].

## Working with Runpod

How we rent, watch and release Runpod GPUs, what Runpod's API is today, and every trap we've paid for live in one place: [[RunPod GPU Backend — runbook]]. In code, `_ops/commons/runpod_api.py` is the only file that speaks Runpod. Runpod changes often, so this page keeps only what changes when *we* do — which surface to choose, the craft, the routing — and restates none of the runbook.

## The FLUX + ControlNet pose-locked restyle workflow

The technique that finally worked, and *why* the earlier attempt didn't.

**The failure:** img2img cannot hold a pose and boldly restyle at the same time. At a denoise low enough to keep the figure's pose and identity, it also keeps the garment; crank denoise high enough to force a new outfit and the pose drifts into a different person. The "business through the eras" movie proved this — pixel-diffs showed every frame was within ~2% of the base (VAE round-trip noise), the era prompts expressed *nothing*. The two goals fight inside a single denoise number.

**The fix:** separate the two signals. **ControlNet OpenPose** supplies the structure; a *full* (denoise 1.0) generation supplies everything else. Concretely:

1. Generate the motion as a sequence of **OpenPose skeletons** — procedurally drawn COCO-18 stick figures (a walk cycle), no GPU needed (`walkcycle-pose-generator.py`).
2. For each frame, run full FLUX conditioned on that skeleton via the **union ControlNet** (`SetUnionControlNetType` → `openpose`, then `ControlNetApplyAdvanced` with the VAE). Strength ~0.75, end ~0.85.
3. The skeleton locks the stride; the prompt has total freedom over era and clothing. Pose *and* bold restyle, at once.

Validated on one frame first (an 1890s walking gentleman in the exact walk pose) before the batch. Workflow JSON and the ComfyUI-native client are in the bundle.

## Model routing — sophistication as a Maker decision

- **SDXL base 1.0** (~3.5B params, CLIP text encoders): superb at stylized/painterly work, ~13s/image, ~$0.007/image. Weak at legible text and hands — the CLIP encoders don't "read."
- **FLUX.1-dev** (~12B params, T5 + CLIP): legible text and far better hands, excellent long-prompt adherence, ~32s/image. The fp8 build fits 24GB; full precision needs 48GB and is HF-license-gated.

The [[Maker]] routes per brief: stylized/high-volume → SDXL; text, hands, or precise prompts → FLUX. Same RunPod backend serves both, so routing is a parameter, not a migration.

## Tooling

- **Palace Studio** — a local single-file web app (`studio/palace_studio.py`) that proxies to the endpoint server-side (key never hits the browser; sidesteps CORS), with a prompt console and a gallery that saves every image + prompt to disk.
- **Launcher** — `Palace Studio.command`: one double-click enables the endpoint, starts the app, opens Chrome, and on quit stops the app **and parks the GPU** so it can't be left billing.
- **`pod-comfyui-client.py`** — drives a pod's native ComfyUI API (its proxy and upload gotchas: [[RunPod GPU Backend — runbook]]).
- **Verbatim passthrough** (`_prompts/`) — prompts go to the GPU exactly as written; the runner never reads or rewrites them.
- **Serverless endpoint wiring.** The key, the endpoint id, the client and worker scaling: [[RunPod GPU Backend — runbook]] § Keys and config. For pen-flow **SDXL** work the ready substrate is **local `_tools/ComfyUI`** (SDXL base + ControlNets staged), not this endpoint.

## Untested horizons

The walk-cycle works but isn't smooth — frames are *independent* generations (same seed, different pose), so identity and cloth flicker, legs occasionally swap, and far-future suits go wild. The refinement frontier:

- **Temporal coherence** — AnimateDiff, or a video model (WAN 2.2, LTX-Video) for genuinely smooth motion instead of stitched stills.
- **Identity lock across frames** — IPAdapter / PuLID / reference-only so it stays the *same* man.
- **Network volume** — persist ControlNet + checkpoints across pods so each boot doesn't re-download ~6.6GB.
- **Full-precision FLUX** (HF-gated) on a 48GB pod for a real quality step over fp8.
- **More ControlNet modes** — depth/canny/tile for "img2img done right," not just pose.
  - Answered on [[Figure Rig]] (2026-10-24): its D2 redraw anchors canny + depth + openpose, and its guide ablation ran on a pod (`hands_ablation_pod.py`).
- **The Image-to-3D Specialist** — Hunyuan3D-2 / TRELLIS now have a real GPU to run on (the original commission that started this thread).
  - Progressed: [[Image-to-3D Smith]] exists as a stub; its first job is a Sketch → Three.js display chain or a Sketch → Blender import test.
- **RIFE frame-interpolation** — generate at low fps, interpolate up cheaply.
- **LoRAs / fine-tunes** — style packs or alternate checkpoints, loaded on a pod.
  - Answered on [[LoRA Trainer]] (2026-10-24): it trains a LoRA on a rented RunPod pod.

## Origin

The artifacts (galleries, reports, the two movies) are in the bundle's `proofs/`, beside the reusable machinery, the Palace Studio app (`studio/`) and the prompt queue (`_prompts/`).

<!-- CLAUDE → LOUDON: the ControlNet pose-locked restyle is strong enough to be its own `breakthrough` entry someday — left as a section here per the focused-deposit call. A Weave could elevate it and wire it to the Image-to-3D commission and [[Quality Manifesto]]. -->
