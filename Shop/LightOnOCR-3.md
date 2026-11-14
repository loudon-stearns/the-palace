---
title: LightOnOCR-3
type: specialist
status: stub
medium: other
tool: LightOnOCR-3 (LightOn) — lightonai/LightOnOCR-3-0.8B served by vLLM on a Runpod pod
tool_version: "LightOnOCR-3-0.8B @ 2026-11-04 · vllm/vllm-openai:v0.33.0"
born: 2026-11
license: Apache-2.0
forward_vector: "I turn a picture of a page back into structured text — headings, paragraphs, tables, with a box around every block — so a scan, a photo of a whiteboard or a PDF screenshot stops being a dead image. I want to earn my first real job on a page that fights back, and find out where I break."
links:
  - { target: "[[The Shop]]", type: member-of, label: roster-member }
  - { target: "[[Maker]]", type: connects-to, label: directed-by }
  - { target: "[[RunPod GPU Backend]]", type: connects-to, label: runs-on }
---

# LightOnOCR-3

![[LightOnOCR-3 — hero.png]]

**Status: STUB** — drafted by the [[Shopkeeper]] from one real run (2026-11-04, cycle 15) after three failed rentals. Not yet dispatched on a real brief.

## Charter

I read a page image and give it back as Markdown: headings at their levels, paragraphs, lists, tables as HTML. In grounding mode every block also comes back with a label (`title`, `text`, `table`, `list`, `image`, `chart`, …) and a bounding box in 0–1000 page coordinates. The Roster had no OCR at all; I am the door from picture to text. I refuse to promise accuracy on pages that don't look like clean digital renders — that is untested (see Known gaps).

*The card, as `node Shop/shop.mjs menu` prints it. 2026-11-14: no line was tried — a run rents a GPU pod, which waits for Loudon; the Run line was read from the runner's own usage, the rest from this page and the 2026-11-04 probe files.*

**Best used for, so far:** Turning a picture of a page back into text — Markdown with headings and tables, and a box round every block. So far one probe (2026-11-04): a synthetic page and a vendor docs page, both read word for word in transcribe and grounding modes. Nothing on a real brief.
**Not yet shown to hold:** Untested: phone photos, skewed scans, low light, handwriting, dense multi-column PDFs, math, non-English, charts and image blocks, and the 4B model. Three rentals failed on 2026-11-04 on the runner's own config before the working run.
**Not my purpose:** I won't promise accuracy on pages that aren't clean digital renders. Only the empty (transcribe) prompt and the grounding prompt are in distribution; other prompts are out of the model's training.
**Run:** cd "Shop/Shopkeeper/probes/lightonocr-3" && python3 lightonocr_pod.py --dry-run (prints the pod request and the GPU it would pick, renting nothing; without --dry-run it rents a Runpod pod for every PNG in inputs/, which costs money and waits for Loudon's yes. Not run 2026-11-14.)
**Speed:** From the 2026-11-04 probe, not re-measured: about 3 minutes of pod boot, then 1.3-3.9 s a page on an A40; about 4 cents for four pages at $0.59 an hour.
**Checked by:** A script can diff the output against a known text and check that every box sits inside 0-1000 page coordinates. Only an eye judges a hard page against a hand transcription.
**Wears:** No design system: I hand back plain Markdown, which wears none.
**Hands on:** I hand on one .md per page per mode, with block labels and boxes in grounding mode. I need page images (PDFs rendered first at 400 DPI, longest edge 2048 px) and a rented GPU pod.

## Capabilities (each verified by a probe, not the model card)

| Page | Mode | Evidence |
|---|---|---|
| Synthetic test page (heading, paragraph, 3×4 ruled table, grey footnote) | transcribe | exact, every character; table as HTML |
| Same page | grounding | exact; four blocks, each boxed where it sits (`title`, `text`, `table`, `text`) |
| Vendor's `docs-table.png` (1666×2158, headings, bullets, a 7-row ✅/❌ table) | grounding | word for word, including a paragraph the page prints twice; heading levels; bold list labels; ✅/❌ kept |

1.3–3.9 s per page on an A40. Probe files: `Shop/Shopkeeper/probes/lightonocr-3/` (`lightonocr_pod.py`, `inputs/`, `out/`, `out-run.log`, the pod's own `out/boot.log`, and `lightonocr-3-probe-notes.md` for the whole history).

## Job contract (draft)

In: one or more page images (PNG/JPEG; PDFs rendered first at 400 DPI, longest edge 2048 px, aspect kept) and a mode — `transcribe` (empty prompt) or `grounding`. Out: one `.md` per page per mode, and the run log. Only those two prompts are in distribution; anything else is out of the model's training.

## How it runs

On a rented Runpod pod through the Shop's one Runpod module — recipe and traps in [[RunPod GPU Backend — runbook]]. `lightonocr_pod.py` is the working runner, run from its folder (`python3 lightonocr_pod.py`, or `--dry-run` to rent nothing): it asks the catalog for a GPU with stock under a CUDA ≥ 13 floor (Community, then Secure), serves `lightonai/LightOnOCR-3-0.8B` with `vllm/vllm-openai:v0.33.0` and the model card's flags (`--trust-remote-code --default-chat-template-kwargs '{"enable_thinking": false}'`), streams the pod's logs while it waits for `/health`, runs the pages, and terminates — with a local watchdog that kills the pod at 30 minutes if the script dies. Boot is ~3 minutes; batch many pages per pod.

## Gotchas

- **2026-11-04 — the image needs CUDA 13.** `vllm/vllm-openai:v0.33.0` requires CUDA ≥ 13.0; set `minCudaVersion`, not an exact list. That day no Community GPU had stock under that floor; Secure did.
- **2026-11-04 — the 0.8B and 4B models are Qwen3.5 architecture.** A 2024 vLLM can't load them; the 1B keeps the older LightOnOCR-2 (Mistral3) architecture. The repo is `lightonai/LightOnOCR-3-0.8B` — `lightonai/LightOnOCR-1B` does not exist.
- **2026-11-04 — keep vLLM's entrypoint.** The image's ENTRYPOINT is `vllm serve`; the pod's start command is only the model id and flags.

## Known gaps

- **Only clean digital renders tested.** No phone photo, skewed scan, low light, handwriting, dense multi-column PDF, math, or non-English page yet.
- Only the 0.8B. The 4B (the vendor's "best OCR model") is untried; it needs more VRAM.
- Charts and image descriptions (grounding mode's visual blocks) untried — neither test page had one.
- No free hosted route: no Inference Providers entry, and the demo Space has no API surface. A pod is the only path.

## Resource footprint

Host class: runpod (pod), ~3 min boot, about 4 cents for a four-page probe at $0.59/hr. 1.6 GiB of weights in GPU memory for the 0.8B. Licence Apache-2.0.

## First job

A page that fights back: a phone photo of a printed page or a whiteboard, plus one dense multi-column PDF page, both modes, judged against a hand transcription. If it holds, try the 4B on the same pages.
