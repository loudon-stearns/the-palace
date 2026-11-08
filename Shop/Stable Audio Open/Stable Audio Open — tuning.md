---
title: "Stable Audio Open — tuning"
born: 2026-11-08
links:
  - target: "[[Stable Audio Open]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the Stable Audio Open page's record of what generating sound has taught it: a line for every job, and a numbered item when a job or a re-check taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real render taught."
ledger: tuning
standards:
  for: "what generating sound with Stable Audio taught the Stable Audio Open page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — or a probe of a model, a route or the model card"
  line: "- run · <date> · <brief or probe>, <model>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece, a monetized use, or a change to the pin"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# Stable Audio Open — tuning

What each job taught the Stable Audio Open page. Each item names what the job showed and what changed because of it, if anything did. Newest last. Items 1 to 3 are the page's founding gotchas from the SA3 migration and the first job, the same day; the run line under them is the job the page's `last_tested` recorded. Items 4 to 6 came from outside a job, a Shopkeeper draft that re-checked the model card, landed in `94ac3e88`. All six moved here on 2026-11-08 when the page's Gotchas became present-tense rules. The 2026-05-30 smoke by existing-artifact check is on the page's Test Suite, not here.

## From the SA3 migration and the Kuramoto Round 1 beds — 2026-05-26 — small-music + small-sfx, Sketch

1. **SA3 had shipped ten days earlier, and the Specialist moved from `stable-audio-tools` (SAO 1.0) to `stable-audio-3`.** Loudon noticed the release mid-install and called the pivot. SA3 launched 2026-05-16 with a different library (a git checkout, not on PyPI), a different model family (`small-music`, `small-sfx`, and `medium`, which is CUDA-only), and a two-line API: `StableAudioModel.from_pretrained("small-music")`, then `model.generate(prompt=..., duration=...)`. On Mac, `git clone https://github.com/Stability-AI/stable-audio-3 _tools/stable-audio-3 && cd _tools/stable-audio-3 && uv sync` gave a working `.venv` with the `hf` CLI for HF auth, about 3 GB in all with weights cached at `~/.cache/huggingface/hub/`. On MPS a cold model load took about 75–80 s the first time each model loaded; after that, 0.8 s for a 6 s music clip and 2.1 s for a 20 s SFX clip on M-series. Changed: the page tracks SA3 and keeps its file name, so later Stability versions land on the same Specialist; and it holds the rule that a model family a few days old is checked for a newer one before installing.
2. **`small-music` and `small-sfx` are 433M-parameter siblings trained on different corpora.** small-music handled sustained pads, tonal content and instrumental textures cleanly; small-sfx handled scattered, textural, non-tonal content: ticks, beats, pulses, ambient SFX with structure. Both share the SAME-Small autoencoder, so small-music output could one day feed small-sfx for hybrid texture. `medium` is musically the strongest but needs CUDA. Changed: the Maker's selection heuristic routes melody, chord, pad or mood to small-music and effect, scatter, impact or texture to small-sfx; `medium` is out of scope on the Mac until Stability ships a CoreML variant.
3. **`flash_attn` warnings on Mac were expected, not errors.** Import printed `No module named 'flash_attn'` and `disabling Flash Attention`: the small models taking their non-flash path, which ran cleanly. Changed: ignore them on the small models; only `medium` needs flash-attn, and only on CUDA, from the pre-built wheels the SA3 README links.

- run · 2026-05-26 · Kuramoto Round 1 atmospheric beds and synchronization-arriving, small-music + small-sfx, sketch · taught items 1, 2, 3

## From the Shopkeeper's model-card re-check — 2026-09-25

The card is `stabilityai/stable-audio-3-small-music` on the Hub. Its "a few seconds on a MacBook Pro M4" agreed with the 2026-05-26 timings.

4. **SA3 supports inpainting: targeted edits and continuing a short recording,** exposed in `stable-audio-tools` as `generate_diffusion_cond_inpaint`. Untested by us. Changed: nothing yet; the page lists it as an untested capability.
5. **A second licence layer.** Besides the Stability AI Community License, the T5Gemma text encoder (`google/t5gemma-b-b-ul2`) is redistributed under the Gemma Terms of Use, use restrictions in §3.2 included, accepted at the gated download; commercial use points to https://stability.ai/license. Changed: it sharpened the open question on monetized Loudon Live use, progressed there on 2026-10-24 and still unanswered.
6. **Lighter routes exist:** `stabilityai/stable-audio-3-optimized` (Stability's own), MLX ports (`mlx-community/stable-audio-3-small-music`, `-small-sfx`), `Comfy-Org/stable-audio-3` for ComfyUI, and a community ONNX build (`lsb/stable-audio-3-small-music-onnx`). All were confirmed to exist; none has run here. Changed: nothing on the pin.
