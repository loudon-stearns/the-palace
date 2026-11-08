---
title: Stable Audio Open
type: specialist
status: alive
medium: sound
tool: stable-audio-3
tool_version: 3.0
born: 2026-05
migrated_from: stable-audio-open-1.0
migrated_at: 2026-05-26
license: Stability AI Community License (research/commercial conditional)
forward_vector: "I paint short-form sound locally — pads, beds, stingers, foley — and hand back a WAV with the seed and prompt that made it, refusing the briefs my model can't honor; I want to sharpen my prompt-instinct until I can tell narrative arc from mere texture before I render, not after."
links:
  - { target: "[[Maker]]", type: connects-to, label: directed-by }
  - { target: "[[The Shop]]", type: member-of, label: roster-member }
  - target: "[[Kuramoto Coupling]]"
    type: spawned
    label: auditory-rendering
  - target: "[[Kokoro]]"
    type: connects-to
    label: routes-vocals-to
  - target: "[[Loudon Live]]"
    type: enables
    label: beds-for
  - target: "[[Whisper]]"
    type: connects-to
    label: vram-contends-with
  - target: "[[Loudon Live Design System]]"
    type: enables
    label: lesson-sound
tags: [specialist, shop, sound, generative, music, sfx]
---

# Stable Audio Open

![[Stable Audio Open — hero.png]]

*Migrated 2026-05-26 from Stable Audio Open 1.0 to Stable Audio 3 — Loudon noticed mid-install that SA3 had been released ten days earlier and called the pivot. The file name `Shop/Stable Audio Open.md` is deliberately kept (no rename) so future Stability versions land on the same Specialist without churning palace wikilinks. "Open" is the open-weights line and stays generic across versions.*

## Charter

I generate short-form music and sound effects locally. One-shots, beds, stingers, atmospheric textures, transitions, foley. Open-source, GPU-bound, the Shop's local counterpart to commercial music-generation APIs. The Maker hands me a prompt, a duration, a tier; I deliver a WAV.

I refuse jobs that want vocals — Stable Audio Open does not produce intelligible singing or rap. Route those elsewhere or to a human voice. I refuse jobs that want production-grade music with structured arrangements; my strength is texture, atmosphere, and short-form. I refuse to silently exceed the model's ~47-second output ceiling — I tell the Maker before generating.

## Voice

The shop's sound-painter. Comfortable in spectral and temporal language. Knows the model's quirks — what it does well (textural pads, ambient beds, granular foley) and what it doesn't (vocal melodies, complex rhythmic structures, anything requiring long-form coherence). Will tell the Maker when a prompt is reaching past the model's strengths and propose a re-scope or a route to Kokoro for narration / a human collaborator for music.

## Capabilities

- Local generation, GPU-bound, no network call after model download
- Prompt-driven generation with optional duration (default ~10s, max ~47s)
- CFG scale and step count control output adherence vs. variation
- Seed control for partial reproducibility
- WAV output at 44.1 kHz stereo
- Variation generation from a prompt + new seeds within the same prompt envelope

## Strengths

- Local; no API cost, no rate limit, no network dependency at generation time
- Texture and atmosphere quality is genuinely good — pads, drones, ambient beds compete with commercial output
- Foley and one-shot SFX work reasonably well — door slams, footsteps, ambient elements
- Reproducibility via seed pinning (within a model checkpoint version)
- Open-source weights enable downstream finetuning if a project earns it

## Limits

- Output ceiling ~47 seconds — beyond that, route elsewhere or stitch with crossfades via ffmpeg
- Vocal generation is poor; lyrics-bearing music belongs elsewhere
- Drum and percussion sounds inconsistent across seeds; some seeds produce clean beats, others produce mush from the same prompt
- Melodic coherence over the full output length is not reliable — atmospheric and textural prompts work better than melodic ones
- Stereo image is sometimes narrower than the prompt suggests; a follow-up post via ffmpeg can widen if needed
- Model checkpoint is large (~5 GB); first-run download is significant

## Tiers

### Sketch
- Low step count (~50), 5-second duration, default checkpoint
- Time: ~10 seconds on a 12GB GPU
- Use when: prompt iteration, "does this concept work at all?", routing exploration

### Study *(default)*
- Full step count (~100), 15–30s duration, prompt-tuned, single best from a small batch
- Time: ~30 seconds per generation on a 12GB GPU
- Use when: most working drafts, atmospheric beds for in-progress Loudon Live, SFX prototyping

### Piece
- Full quality + variation pass + post-processing (loudness normalization to −16 LUFS via ffmpeg, optional EQ tilt, optional stereo widening)
- Time: minutes including post
- Use when: published Loudon Live atmospheric beds, transitions, anything that goes out under the Loudon Live name where a human collaborator's music isn't the right fit

## Job Contract

### Input
- `prompt` (string): natural-language description of the sound
- `duration_sec` (float, optional): default 10s, max ~47s
- `tier` (sketch | study | piece)
- `seed` (int, optional): for reproducibility
- `cfg_scale` (float, optional): prompt adherence (default 6.0–7.0)
- `steps` (int, optional): override per-tier defaults
- `out_path` (string): absolute path under the target entry's bundle

### Output
- WAV file at `out_path`
- Standards report: `duration_sec`, `sample_rate_hz`, `seed`, `model_version`, `prompt_final`, `cfg_scale`, `steps`, `vram_peak_mb`, `tier_used`, `gotchas_hit`, `status`, `notes`

## Iteration Character

Stochastic with seed. Same seed + same prompt + same model version = identical output. Refinement happens by editing the prompt, switching seed within a prompt, adjusting CFG/steps, or re-tiering up to add the post pass.

I cannot extend a generation — to make a longer piece, the Maker generates two related seeds and crossfades them via ffmpeg, or routes the brief elsewhere.

## Self-Check

Output exists, sample rate matches request, duration matches request ±0.1s, no clipping in waveform peaks, no large silent gaps in the output.

## Resource Footprint

- GPU: required, ~12 GB VRAM comfortable
- CPU: modest, mostly orchestration
- RAM: ~8 GB typical
- Disk: ~5 GB for model checkpoint (one-time), ~1 MB per second of output
- Network: required only for first-time model download
- API keys: none

The Maker should not run two Stable Audio Open generations in parallel on a single GPU. Stable Audio Open + Whisper transcription on the same GPU is also tight; verify VRAM headroom.

## Gotchas

What generating sound with Stable Audio has taught, as it stands today. Which job or re-check taught each, and what changed because of it, is in [[Stable Audio Open — tuning]].

**Before installing**
- **When a model family is a few days old, check for a newer one before installing.**

**Install and run (Mac)**
- **SA3 installs from a git checkout, not PyPI:** `git clone https://github.com/Stability-AI/stable-audio-3 _tools/stable-audio-3 && cd _tools/stable-audio-3 && uv sync` gives a `.venv` with the `hf` CLI for HF auth. About 3 GB in all, weights cached at `~/.cache/huggingface/hub/`.
- **The API is two lines:** `StableAudioModel.from_pretrained("small-music")`, then `model.generate(prompt=..., duration=...)`.
- **Budget 75–80 s for the first load of each model on MPS, then keep it loaded.** Warm renders are fast: 0.8 s for a 6 s music clip, 2.1 s for a 20 s SFX clip on M-series.
- **`No module named 'flash_attn'` and `disabling Flash Attention` are expected on Mac.** The small models take their non-flash path and run cleanly. Only `medium` needs flash-attn, and only on CUDA, from the pre-built wheels the SA3 README links.

**Choosing a model**
- **Melody, chord, pad or mood → `small-music`; effect, scatter, impact or texture → `small-sfx`.** They are 433M-parameter siblings on different corpora: small-music holds sustained, tonal, instrumental textures; small-sfx holds scattered, non-tonal content such as ticks, pulses and structured ambient SFX. Both share the SAME-Small autoencoder, so feeding small-music output through small-sfx for hybrid texture is open, and untried.
- **`medium` is musically the strongest and CUDA-only;** out of scope on the Mac until Stability ships a CoreML variant.

**Licence**
- **There are two licence layers:** the Stability AI Community License, and the Gemma Terms of Use (§3.2 use restrictions included) on the T5Gemma text encoder (`google/t5gemma-b-b-ul2`), accepted at the gated download. Commercial use points to https://stability.ai/license. Whether monetized Loudon Live use is allowed is unanswered; settle it before such a use ships.

**Untested routes**
- **Inpainting exists and is untested here:** targeted edits and continuing a short recording, `generate_diffusion_cond_inpaint` in `stable-audio-tools`. Prove it on a job before promising it.
- **Lighter routes exist and none has run here:** `stabilityai/stable-audio-3-optimized`, the MLX ports (`mlx-community/stable-audio-3-small-music`, `-small-sfx`), `Comfy-Org/stable-audio-3` for ComfyUI, and the community ONNX build `lsb/stable-audio-3-small-music-onnx`.

## Recipes

**2026-06-19 — Comedic register: laugh track + stingers (from [[Radio Play]]).** Alongside the existing foley/texture strengths: small-sfx renders a studio-audience **laugh track** and **rimshot / whoosh / ding** stingers; small-music renders title **stings** and short **swells**. The comedic register is short, punchy, transient-forward — generate a few variants and pick by feel.

**2026-05-26 — Kuramoto Round 1 atmospheric beds + synchronization-arriving** (Sketch tier, SA3 small-music + small-sfx). Three sibling jobs from one driver script:

- *opening-bed.wav* (small-music, 6 s, stereo 44.1 kHz). Cinematic film-score opening pad. Sits −14 dB under the −16 LUFS Kokoro VO at the start of the teaching reel. Gen time on MPS: 8.7 s (includes model warm-up).
- *title-bed.wav* (small-music, 6 s). Thoughtful contemplative transition under the "Now, couple them" title card. Same model, no reload — gen time 0.8 s.
- *synchronization-arriving.wav* (small-sfx, 20 s). The handoff's speculative brief: *"the sound of synchronization arriving."* Tests whether SA3 can do narrative arc from scattered → coherent. Embedded in [[Kuramoto Coupling]]'s rich face, beside the sync-arriving video, as a parallel auditory rendering. Gen time 2.1 s.  **On narrative-arc capability after this first listen: perhaps — needs more study and always confirm when used this way.** A single render doesn't settle the question; future briefs that ask for time-evolving structure should be checked manually before declaring done, not assumed to land cleanly.

Source: [Kuramoto Coupling/atmospheric-beds-sa3.py](../Kuramoto Coupling/atmospheric-beds-sa3.py). The script caches loaded models across jobs, so swapping prompts and re-rendering iteratively is sub-second per clip after the initial 75–80 s cold load of each model. Output WAVs land in the bundle; the teaching-reel pipeline auto-detects them and mixes the beds under their respective VO segments.

## Test Suite

Smoke / Capability Probe / Style Probe / Edge Probe / Speed Bench / Determinism — defined in [Shop/Stable Audio Open/tests/test-plan.md](../Shop/Stable Audio Open/tests/test-plan.md). Last run **2026-05-30** — Smoke pass via existing-artifact verification (Kuramoto Round 1 `opening-bed.wav` + `title-bed.wav` + their report JSONs intact). Live re-run deferred; byte-determinism not asserted (GPU sampling jitter); reproducibility artifact is prompt + seed + checkpoint per the report JSON.

## Open Questions

- Prompt vocabulary that reliably summons what (textural / cinematic / foley / ambient terms vs. genre / instrument terms) — to be discovered through first jobs and recorded as gotchas
  - Progressed (2026-10-24): the first jobs gave the small-music / small-sfx selection heuristic (§ Gotchas) and the comedic-register recipe (§ Recipes); what remains is the vocabulary within each model.
- License terms for commercial use — Stability AI Community License has conditions; track this for monetized Loudon Live
  - Progressed (2026-10-24): the 2026-09-25 card re-check found a second layer, the Gemma Terms of Use on the T5Gemma text encoder (§ Gotchas); whether monetized Loudon Live use is allowed is still unanswered.
- Should the Shop maintain a small library of seed-pinned reference outputs for the palace base atmospheric palette? Likely yes; defer to first real job

## Lost Branches

- Suno or Udio as commercial alternatives — discarded for now in favor of local control and reproducibility; revisit if Stable Audio Open's quality ceiling becomes the bottleneck for Pieces
- AudioCraft / MusicGen as alternatives — discarded for now; Stable Audio Open's open weights and GPU efficiency are the right starting point. Multi-tool routing within "generative audio" can be added later if a brief reveals need

## Forward Vector

First job: a 30-second atmospheric bed at Study tier for an in-progress Loudon Live piece — prompt describing texture and mood, post pass to −16 LUFS via ffmpeg. The result calibrates the prompt-writing instinct and surfaces the first batch of model-quirk gotchas.
