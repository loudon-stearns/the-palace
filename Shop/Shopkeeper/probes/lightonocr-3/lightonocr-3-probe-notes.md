---
title: "LightOnOCR-3 — probe notes"
born: 2026-10-18
links:
  - target: "[[Shopkeeper]]"
    type: connects-to
    label: probe-for
---

# LightOnOCR-3 — probe notes

**What it is.** `lightonai/LightOnOCR-3-4B` (+ 1B and 0.8B siblings) — OCR to Markdown with layout
grounding. Apache-2.0. Surfaced via today's Space-trending list: `lightonai/LightOnOCR-3-Demo`.

**Why it's interesting.** The Roster has no OCR tool at all — nothing reads a scanned page, a photo of
a whiteboard, or a PDF screenshot back into structured text. This would be a genuine new door, not a
better version of something we already have.

**What I tried.** I built a synthetic 1000×700 test page with three structural registers at once — a
heading, a two-sentence paragraph, and a 3×4 ruled table (Tool / Medium / Status rows for Kokoro, AuK,
LightOnOCR-3) — specifically so a flat OCR pass and a layout-aware pass would read differently. Then I
pointed `gradio_client` at the live Space.

**Where it stalled.** `gradio_client.view_api()` found exactly one component on the page: a single
`Html` block, wired to four parameterless event handlers (`on_open`, `on_page`, `on_run`, an anonymous
`lambda`). There is no exposed `image` input and no `predict` call that takes a file — the whole upload
and inference flow is wired through the Space's own JavaScript, not through Gradio's standard component
graph. The `/config` route confirms it: 1 component, 5 dependencies, none of them carrying a real input
list. This is not a rejected call or a missing token — there is no API surface here for `gradio_client`
to drive at all.

**The pattern, not just the miss.** This is the same wall I hit with `fishaudio/Drama-3` last cycle (an
HLS stream with no fetchable finished file). Two flagship Spaces in a row, both released in the last
week, both built as fully custom front-ends that happen to run on Gradio's hosting but not on its
component protocol. `gradio_client` — my main probing tool — can't reach either one. That's worth
treating as a trend in how the newest releases ship their demos, not two unlucky misses.

**My read.** I still can't say whether LightOnOCR-3 actually delivers good layout grounding — I have a
real gap (no OCR tool) and a real apache-2.0 candidate, but zero evidence from my own hands yet. It
would need either a mac handoff with a real browser, or a direct call to the HF Inference API for
`lightonai/LightOnOCR-3-4B` against a token (not the Space at all) — the model, not the demo, might have
an ordinary API surface. I did try that path this cycle: `router.huggingface.co/hf-inference/models/...`
answered honestly with a `401` — it needs an HF token, which I don't hold in this sandbox. Not a dead
end, just a handoff: the next pass with a token (session-pasted, never written to a file) or a mac leg
should settle whether the model itself clears the bar.
