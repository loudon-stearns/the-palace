# LightOnOCR-3 on Runpod — a proposal

Written 2026-11-04, cycle 6, at Loudon's request on the 2026-11-04 OCR-direction card ("Give me a
proposal for using Runpod for this task"). Not run yet — this is the plan, costed out, waiting on a
go/no-go because it spends real money, which my standing orders say I don't do without asking.

## Why Runpod and not the sandbox or a mac handoff

Cycle 5 pinned the actual wall: `lightonai/LightOnOCR-3-4B` has no free serverless Inference API route
at all. The README's only two paths are loading the weights locally in bf16 via `transformers>=5.5.4`,
or serving it with vLLM — both need a real GPU underneath them, not a smarter sandbox call. A mac
handoff doesn't fix that either, since the Mac has no GPU suited to a 4B-parameter vision-language model.
Runpod is the honest path: rent the GPU for the few minutes the probe actually needs, then let it go.

## The plan

1. **Spin up a Runpod pod** — Community Cloud, a single RTX A5000 or 4090 (24GB VRAM covers the 4B model
   in bf16 with headroom), the `runpod/pytorch` base template. On-demand pricing on these tiers runs
   roughly $0.30–$0.45/hr as of this read.
2. **Install and serve** — `pip install vllm`, then `vllm serve lightonai/LightOnOCR-3-4B` (or the
   `transformers` fallback if vLLM's chat template needs coaxing for this model). This step is the
   slowest part — model download plus server boot, maybe 8–12 minutes on a fast pod disk.
3. **Run the probe** — feed it the two vendor showcase images already pulled into this bundle
   (`examples/docs-table.png`, `examples/annual-report-table.png`) plus my own synthetic test page, and
   capture the Markdown output for all three.
4. **Judge it** — compare the output against the known ground truth of my synthetic page (I built it, so
   I know exactly what the heading/paragraph/table should read as) and eyeball the two vendor images for
   layout fidelity.
5. **Terminate the pod immediately** after capturing output — Runpod bills by the minute, and there is no
   reason to let it idle.

## Honest cost

- **Time:** roughly 20–30 minutes of pod-up time end to end, most of it the model download and server
  boot, not the inference itself.
- **Money:** at $0.30–$0.45/hr, a 30-minute session costs on the order of **$0.15–$0.25**. I'd set a
  hard stop at $1.00 — if setup drags past that, I kill the pod and report what blocked it rather than
  let it run.
- **License:** apache-2.0, no catch there.
- **Standing risk:** this is the first paid-GPU spend I've asked for since the Viggle no in September.
  That rule was "no paid-GPU probe without a brief" — this isn't a brief, it's a standing Roster gap
  (OCR, zero coverage) that's now stalled four cycles running on sandbox limits alone. I think that
  clears the bar, but it's exactly the kind of call that should come back to Loudon rather than me
  deciding my own exception.

## What I'd bring back

Either: real transcribed Markdown from all three test images, with my read on whether the layout
grounding is good enough to propose LightOnOCR-3 as a stub Specialist — or, if something in the vLLM
serve step breaks, an honest account of where it broke and what the pod cost before I killed it.

## My read

I'd spend the ~$0.25. It's a small, bounded cost against a real multi-cycle gap, and it's the only
remaining path that hasn't already failed. But it's real money against a standing "ask first" rule, so
I'm asking rather than just doing it.
