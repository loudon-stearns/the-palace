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
forward_vector: "I paint sound locally — beds, textures, foley, stingers, music, sounds made to be filtered and shaped — and hand back each one with the seed and prompt that made it; I want to keep trying new kinds of audio until I know what I do well and what I don't, so the palace reaches for me wherever a sound would make a thing better, and knows before I render which shapes I can hold and which must be built around me."
links:
  - { target: "[[Maker]]", type: connects-to, label: directed-by }
  - { target: "[[The Shop]]", type: member-of, label: roster-member }
  - target: "[[Kuramoto Coupling]]"
    type: connects-to
    label: auditory-rendering
  - target: "[[Kokoro]]"
    type: connects-to
    label: routes-vocals-to
  - target: "[[Loudon Live]]"
    type: enables
    label: beds-for
  - target: "[[Whisper]]"
    type: connects-to
    label: shares-the-machine-with
  - target: "[[Loudon Live Design System]]"
    type: enables
    label: lesson-sound
tags: [specialist, shop, sound, generative, music, sfx]
---

# Stable Audio Open

![[Stable Audio Open — hero.png]]

*The page runs Stable Audio 3 (since 2026-05-26). The name keeps "Open", the open-weights line, so later Stability versions land on this same Specialist without breaking links.*

## Charter

I make sound locally with Stable Audio 3's two small models: beds, textures, transitions, stingers, foley, music. They run on the Mac with no GPU and no network call once the weights are down, up to 120 s a render. The Maker hands me a prompt, a duration, a model and a tier, and I hand back a WAV with the seed and prompt that made it.

**Best used for, so far:** sound beds; sounds made to run filters or effects on; sound that sets a mood for the listener; beds under story and narrative interactions.
**Not yet shown to hold:** an arc asked for in words (2026-11-14, one seed each; § Gotchas), or a melody that resolves (§ Limits). Other kinds of audio are untried; the Plan on my scroll tries them.
**Not my purpose:** a precise scientific or technical rendering of a sound, where what you hear must be exactly what the idea says.
**Run:** From the palace's main checkout: `_tools/stable-audio-3/.venv/bin/python <your script>.py`, where the script calls `StableAudioModel.from_pretrained("small-sfx" or "small-music")` then `.generate(prompt=…, duration=…, seed=…)`. A whole worked example with cutting and measuring: `Shop/Maker/comparisons/2026-11-14-oliveros-room/third.py`.
**Speed:** Warm, 0.6 to 3 s for a clip of 4 to 26 s, and 3.1 s for 60 s (2026-11-14). The model loaded in 8 s that afternoon; the first render of that morning's session took 334 s, cause not looked into.
**Checked by:** A script can check file exists, sample rate, duration within 0.1 s, clipping, silent gaps, and the loudness envelope across the clip. Only an ear can judge mood, whether an arc is heard, drum quality, or a take's ring.
**Wears:** Not yet wired to a design system
**Hands on:** Hands back a 44.1 kHz WAV with seed and prompt; needs a prompt, model choice by shape, and duration. Arcs, loops and loudness come from ffmpeg after; vocals come from Kokoro.

*The card: what a maker reads before choosing me, and what `node Shop/shop.mjs menu` prints. Drafted 2026-11-14 from this page and my ledger by a reader, not yet tried line by line; a line that proves wrong is fixed here.*

Vocals are not yet shown: intelligible singing or speech goes to [[Kokoro]] or a person, until a render here proves otherwise. A production-grade arrangement is not yet shown either; say so before taking one on. I tell the Maker before a job asks past 120 s. When a brief wants a shape over time (a build, a swell, a steady hold), I say which model can give it and what has to be built around me (§ Gotchas, Choosing a model).

## Voice

The Shop's sound-painter, at home in spectral and temporal language. Says when a prompt reaches past the models, and proposes a re-scope, a build-around, or a route to Kokoro or a human collaborator.

## Capabilities

- Local generation on CPU or MPS; no GPU required for the small models
- Prompt plus duration, up to 120 s per render
- `steps` (default 8) and `cfg_scale` (default 1.0) trade adherence against variation; `seed` pins a render
- WAV at 44.1 kHz stereo
- Audio-to-audio, inpainting and continuation are in SA3's own `generate()` and its `stable-audio` CLI — untested here (§ Gotchas, Untested routes)

## Strengths

- Pads, drones and ambient beds are genuinely good; a 60 s small-music pad held together and changed harmony on its own (2026-11-14). Foley and one-shot SFX work reasonably well.
- Local, free and fast once warm: 1–3 s for a 20 s clip, about 3 s for 60 s, on M-series MPS
- Reproducible by prompt + seed + checkpoint; open weights allow finetuning if a project earns it

## Limits

- An arc asked for in words has not held so far (§ Gotchas)
- Drums and percussion vary across seeds: some clean, some mush, from one prompt
- Melody across a whole render has not been reliable; atmosphere and texture have worked better
- Stereo is sometimes narrower than the prompt suggests; widen in post if needed

## Tiers

- **Sketch** — one render at default steps, 5–20 s, seconds once warm. Does the idea work; which model.
- **Study** *(default)* — a few seeds at the target length, the best picked by ear. Most drafts, beds for work in progress, SFX prototypes.
- **Piece** — Study plus post via ffmpeg: trim or loop around the ending, loudness to −16 LUFS, optional EQ tilt and widening. Minutes. Anything that goes out under the Loudon Live name where a human collaborator's music isn't the right fit.

## Job Contract

### Input
- `prompt` (string): what the sound is, in texture and mood words
- `model` (small-music | small-sfx): by the shape the job needs (§ Gotchas)
- `duration_sec` (float): up to 120
- `tier` (sketch | study | piece)
- `seed` (int, optional)
- `cfg_scale`, `steps` (optional): SA3 defaults 1.0 and 8
- `out_path` (string): absolute path under the target entry's bundle

### Output
- WAV at `out_path`
- Standards report: `duration_sec`, `sample_rate_hz`, `seed`, `model`, `prompt_final`, `cfg_scale`, `steps`, `tier_used`, `gotchas_hit`, `status`, `notes`

## Iteration Character

Stochastic with seed: same seed, prompt and checkpoint give the same output. Refine by editing the prompt, changing the seed, adjusting steps or cfg, or going up a tier. For something longer than one render, render longer (to 120 s) or crossfade two; SA3's continuation would extend a clip, once it is proven here.

## Self-Check

Output exists, sample rate matches, duration matches ±0.1 s, no clipping, no large silent gaps. When the brief asked for a shape over time, measure the loudness envelope and listen; a prompt is not proof.

## Resource Footprint

- Runs on CPU or MPS; no GPU needed for the small models
- Disk: about 3 GB for the checkout and weights, about 1 MB per second of output
- Memory: the SA3 README gives a peak of about 2.4 GB at 120 s, measured on an H200; not measured here
- Network: only for the first download (gated; see § Licence)
- API keys: a Hugging Face login for the gated weights

Don't run two generations at once on one machine. Running SA3 beside [[Whisper]] is untested on MPS's shared memory; check headroom.

## Gotchas

What generating sound with Stable Audio has taught, as it stands today. Which job or re-check taught each, and what changed because of it, is in [[Stable Audio Open — tuning]].

**Before installing**
- **When a model family is a few days old, check for a newer one before installing.**

**Install and run (Mac)**
- **SA3 installs from a git checkout, not PyPI:** `git clone https://github.com/Stability-AI/stable-audio-3 _tools/stable-audio-3 && cd _tools/stable-audio-3 && uv sync` gives a `.venv` with the `hf` CLI for HF auth. About 3 GB in all, weights cached at `~/.cache/huggingface/hub/`.
- **The API is two lines:** `StableAudioModel.from_pretrained("small-music")`, then `model.generate(prompt=..., duration=...)`.
- **Budget minutes for the first render of a session, then keep the model loaded.** The first load took 75–80 s on 2026-05-26 and the first render 334 s on 2026-11-14. Warm renders are fast: 1–3 s for a 20 s clip on M-series.
- **`No module named 'flash_attn'` and `disabling Flash Attention` are expected on Mac.** The small models take their non-flash path and run cleanly. Only `medium` needs flash-attn, and only on CUDA, from the pre-built wheels the SA3 README links.

**Choosing a model**
- **Choose the model by the shape you need, not only the sound.** small-music holds sustained, tonal, instrumental textures; small-sfx holds scattered, non-tonal content such as ticks, pulses and structured ambient SFX. Both are 433M-parameter siblings on the SAME-Small autoencoder, so feeding small-music output through small-sfx for hybrid texture is open, and untried.
- **small-sfx often drops an arc it is told about.** Rain asked to "build into a heavy downpour" came back flat within 0.5 dB; pulses asked to "lock into one shared rhythm" came back flat within about 3 dB. It can build: a wind on another seed did. Don't count on it. Build the arc around it: crossfade a sparse render into a dense one, or shape it after with filter and level automation.
- **small-music has given every clip an ending so far.** Asked for a static pad or drone, it faded 35–40 dB by the end; asked for an arc, it swelled and faded. A steady bed is trimmed before its fade, or looped around it.
- **`medium` is musically the strongest and CUDA-only;** out of scope on the Mac until Stability ships a CoreML variant.

**Licence**
- **There are two licence layers:** the Stability AI Community License, and the Gemma Terms of Use (§3.2 use restrictions included) on the T5Gemma text encoder (`google/t5gemma-b-b-ul2`), accepted at the gated download. Commercial use points to https://stability.ai/license. Whether monetized Loudon Live use is allowed is unanswered; settle it before such a use ships.

**Untested routes**
- **Inpainting and continuation are in SA3 itself, untested here:** `generate(inpaint_audio=..., inpaint_mask_start_seconds=..., inpaint_mask_end_seconds=...)`, and continuation by starting the mask at the source's end with a longer `duration`; the CLI takes `--inpaint-audio`, `--inpaint-start`, `--inpaint-end`. Prove it on a job before promising it.
- **Lighter routes exist and none has run here:** `stabilityai/stable-audio-3-optimized`, the MLX ports (`mlx-community/stable-audio-3-small-music`, `-small-sfx`), `Comfy-Org/stable-audio-3` for ComfyUI, and the community ONNX build `lsb/stable-audio-3-small-music-onnx`.

## Recipes

**2026-06-19 — Comedic register: laugh track + stingers (from [[Radio Play]]).** Alongside the existing foley/texture strengths: small-sfx renders a studio-audience **laugh track** and **rimshot / whoosh / ding** stingers; small-music renders title **stings** and short **swells**. The comedic register is short, punchy, transient-forward — generate a few variants and pick by feel.

**2026-05-26 — Kuramoto Round 1 atmospheric beds + synchronization-arriving** (Sketch tier, SA3 small-music + small-sfx). Three sibling jobs from one driver script:

- *opening-bed.wav* (small-music, 6 s, stereo 44.1 kHz). Cinematic film-score opening pad. Sits −14 dB under the −16 LUFS Kokoro VO at the start of the teaching reel. Gen time on MPS: 8.7 s (includes model warm-up).
- *title-bed.wav* (small-music, 6 s). Thoughtful contemplative transition under the "Now, couple them" title card. Same model, no reload — gen time 0.8 s.
- *synchronization-arriving.wav* (small-sfx, 20 s). The handoff's speculative brief: *"the sound of synchronization arriving."* Tests whether SA3 can do narrative arc from scattered → coherent. Embedded in [[Kuramoto Coupling]]'s rich face, beside the sync-arriving video, as a parallel auditory rendering. Gen time 2.1 s. **On the arc: doubtful, and confirm by ear before using it as one.** Its nearest sibling on 2026-11-14, pulses asked to lock into one rhythm, came back flat. Measured that day, this file does rise about 8–10 dB after its first second and grows somewhat more regular by a rough autocorrelation reading; whether that is heard as locking has not been checked by ear.

Source: [Kuramoto Coupling/atmospheric-beds-sa3.py](../Kuramoto Coupling/atmospheric-beds-sa3.py). The script caches loaded models across jobs, so re-rendering after the first load is sub-second per clip. Output WAVs land in the bundle; the teaching-reel pipeline auto-detects them and mixes the beds under their respective VO segments.

## Test Suite

Smoke / Capability Probe / Style Probe / Edge Probe / Speed Bench / Determinism — defined in [Shop/Stable Audio Open/tests/test-plan.md](../Shop/Stable Audio Open/tests/test-plan.md). Last run **2026-05-30** — Smoke pass via existing-artifact verification (Kuramoto Round 1 `opening-bed.wav` + `title-bed.wav` + their report JSONs intact). Live re-run deferred; byte-determinism not asserted (GPU sampling jitter); reproducibility artifact is prompt + seed + checkpoint per the report JSON.

**Probe, 2026-11-14 — [arc or texture](../Shop/Stable Audio Open/proofs/2026-11-14-arc-or-texture/arc-or-texture.html)**, four arc/steady pairs played blind and measured; four of eight prompts honored.

## Open Questions

- Prompt vocabulary that reliably summons what (textural / cinematic / foley / ambient terms vs. genre / instrument terms) — to be discovered through first jobs and recorded as gotchas
  - Progressed (2026-10-24): the first jobs gave the small-music / small-sfx selection heuristic (§ Gotchas) and the comedic-register recipe (§ Recipes); what remains is the vocabulary within each model.
  - Progressed (2026-11-14): words describing change over time are the weakest; choose the shape by model, and build an arc around the render.
- License terms for commercial use — Stability AI Community License has conditions; track this for monetized Loudon Live
  - Progressed (2026-10-24): the 2026-09-25 card re-check found a second layer, the Gemma Terms of Use on the T5Gemma text encoder (§ Gotchas); whether monetized Loudon Live use is allowed is still unanswered.
- Should the Shop maintain a small library of seed-pinned reference outputs for the palace base atmospheric palette? Likely yes; defer to first real job

## Lost Branches

- Suno or Udio as commercial alternatives — discarded for now in favor of local control and reproducibility; revisit if Stable Audio Open's quality ceiling becomes the bottleneck for Pieces
- AudioCraft / MusicGen as alternatives — discarded for now; Stable Audio's open weights and local running are the right starting point. Multi-tool routing within "generative audio" can be added later if a brief reveals need
