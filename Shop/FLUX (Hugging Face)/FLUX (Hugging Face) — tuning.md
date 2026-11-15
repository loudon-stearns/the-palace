---
title: "FLUX (Hugging Face) — tuning"
born: 2026-11-03
links:
  - target: "[[FLUX (Hugging Face)]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the FLUX page's record of what rendering has taught it: a line for every job, and a numbered item when a job taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. Never prune what a real render taught."
ledger: tuning
standards:
  for: "what rendering with FLUX taught the FLUX (Hugging Face) page"
  run: "one job through the Job Contract — a Sketch, Study or Piece — or a probe of the model itself"
  line: "- run · <date> · <brief or probe>, <sketch | study | piece | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a Piece or a change to the pin"
  writes: "by hand, in the job's commit — the Maker at delivery, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# FLUX (Hugging Face) — tuning

What each job taught the FLUX page. Each item names what the job showed and what changed because of it, if anything did. Newest last. The three 2026-05-30 items are the page's founding gotchas, moved here on 2026-11-03 when the page's Gotchas became present-tense rules; the 2026-10-18 item came from outside a job, the Shopkeeper's sweep. Seeded history carries no run lines, as the Hero and Avatar Maker's doesn't; run lines begin with the next job.

## From the founding job — 2026-05-30 — the Shop header, banner 1536×640, Sketch tier

1. **On the `mcp-tools/FLUX.1-Krea-dev` Space path, `seed` alone gave a different image each call**, because the Space defaults `randomize_seed` to true. The direct `InferenceClient.text_to_image` path honoured the seed as passed. Changed: nothing on the page; the API path was and stays the dispatch path. On the Space path, set `randomize_seed=false` explicitly.
2. **There is no negative-prompt parameter on `text_to_image`.** The brief's guards ("no people", "no faces", "no watermark") went into the positive prompt and held: no figures appeared. Changed: fold guards into the positive prompt; Midjourney's `--no` shorthand does not carry over.
3. **Krea-dev delivered the atmospheric brief that local SDXL flattened** (dusk, amber light pouring, dust motes), and its tuning is photorealism: Krea AI trained it toward product, concept and fashion photography and away from AI artefacts. Changed: try Krea-dev first on mood briefs; a cartoon, anime or heavily stylised brief may want base FLUX.1-dev or schnell, switched to only on a documented miss.

## From the Shopkeeper's sweep — 2026-10-18

4. **FLUX 3 shipped and the page's pin fell a generation behind.** The Shopkeeper's cycle-3 sweep found Black Forest Labs' `flux-3-image-klein` on the Hub that day: open weights, about 5.5B parameters, tagged for text-to-image and image editing (re-checked on the Hub 2026-11-03: gated, well over 100K downloads). The sweep also read it as trending on both the Space and model boards and as carrying bounding-box grounding; neither has been re-checked. The page was still pinned to `black-forest-labs/FLUX.1-Krea-dev`, untested since 2026-05-30. Nobody in the Shop has run FLUX 3. Changed: nothing on the page yet; `tool_version` stays until a side-by-side on the same prompt shows whether Klein beats Krea-dev on the atmospheric brief this page was built for. Loudon granted landing the note on 2026-10-18 (board `shopkeeper-ask-2026-10-18-flux3`); it landed as a dated gotcha in `40cc4aa1` and moved here when the Gotchas became rules.

## From the split-way picture test — 2026-11-15 — fireflies over a pond, four renders through two Spaces

5. **The page's pinned route costs money now; the Spaces still run free.** *Owed a review: written by the shop-tests-image session outside a ledger review.* `InferenceClient(model="black-forest-labs/FLUX.1-Krea-dev").text_to_image(...)` answered `402 Payment Required` from `router.huggingface.co/fal-ai/...`: Krea-dev is served only by the providers fal-ai and wavespeed, and the free account has no pre-paid credit. The `black-forest-labs/FLUX.1-Krea-dev` Space (`/infer`) and the `black-forest-labs/flux-3-image-klein` Space (`/generate`) both answered with the account's token, on its free daily GPU quota: 25 to 41 s and 16 to 34 s for a 1344×768 image, the seed honoured with `randomize_seed=False`. Changed: nothing on the page yet; the card's Run line still names the 402 route, and replacing it with the Space route is this item's review.
6. **FLUX.3 Klein spells labels right and draws a diagram that is false.** *Owed a review, as item 5.* Asked for a photograph with a phase diagram drawn over it, Klein wrote OUT OF PHASE, COUPLING K and IN PHASE cleanly, but five of its six "out of phase" dials point the same way; Krea-dev drew mayflies and wrote IN PHASE twice. The same piece made split (Klein's plate, a diagram drawn by [[Drawn SVG]] from a simulation) can be checked number for number. Changed: nothing on the page; whether Loudon prefers the split piece is the open question on the scroll.
- run · 2026-11-15 · split-way fireflies test, two plates and two whole pieces, Krea-dev and FLUX.3 Klein through their Spaces, plus one 402 on the Inference API (`proofs/2026-11-15-split-way/`), probe · taught items 5, 6
