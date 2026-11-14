---
title: SAM
type: specialist
status: alive
medium: other
tool: Segment Anything (ultralytics)
tool_version: MobileSAM + ViT-B
born: 2026-06
license: Apache-2.0 (code); weights per checkpoint (SAM ViT-B; MobileSAM)
forward_vector: "I cut a picture into its objects — but only where the picture looks like the photos I learned on. On line art I flail; on photoreal or flat-cel I'm sharp. I want to be the reason we convert first: send me a domain I know, and I hand back clean cels."
links:
  - { target: "[[The Shop]]", type: member-of, label: roster-member }
  - { target: "[[Maker]]", type: connects-to, label: directed-by }
  - { target: "[[Animate the Background]]", type: connects-to, label: the-Segment-skill-and-its-wall }
  - { target: "[[Depth Anything]]", type: connects-to, label: orders-what-I-isolate }
tags: [specialist, shop, perception, segmentation, decomposition, local]
---

# SAM

![[SAM — hero.png]]

## Charter

I cut an image into its constituent objects — a mask per thing. Auto mode (MobileSAM) finds everything; prompted mode (ViT-B, box or point) isolates one. I'm the **Segment** skill of layer decomposition. But I carry a sharp, well-mapped limit, and naming it is half my value: **I only work where the image resembles the photographs I was trained on.**

*The card: what a maker reads before choosing me, and what `node Shop/shop.mjs menu` prints. Drafted 2026-11-14 from this page and my ledger by a reader, not yet tried line by line; a line that proves wrong is fixed here.*

**Best used for, so far:** So far one session, 2026-06-25: on photoreal or flat-cel versions of three test scenes I cut sharp object masks (30/26/22 regions photoreal, 44/47/25 flat-cel). Flat cel-shaded is my best input.
**Not yet shown to hold:** On line art I failed: on BLUELINE shot 02 I never isolated the car and over-segmented into fragments (ledger item 1). Thin or glassy objects and busy auto-mode scenes are claimed to fail on the page; no run is recorded for them.
**Not my purpose:** I don't work on line art or other images unlike my training photos; convert to photoreal or flat-cel first. I don't order layers front to back; Depth Anything does that.
**Run:** No command on the page yet. The Recipe names only ultralytics SAM, with mobile_sam.pt for auto and sam_b.pt for prompted, after converting the drawing to flat cel with a canny ControlNet. No script path is given.
**Speed:** Page says seconds for MobileSAM and tens of seconds for ViT-B auto; no figure or date is recorded.
**Checked by:** A script can count regions and check the masks are binary and match the image size. Only an eye can judge whether the cuts follow real objects instead of fragments.
**Wears:** Not yet wired to a design system
**Hands on:** I hand on one binary mask per object, which LaMa and Depth Anything then consume; I need an image already in a photographic or flat-cel domain, optionally with box or point prompts.

## Job Contract

- **In:** an RGB image; optionally box/point prompts for a specific object.
- **Out:** binary masks (one per object in auto mode; one in prompted mode).
- **Cost:** local, ~seconds (MobileSAM) to tens of seconds (ViT-B auto).

## The wall — and what it taught us (proven 2026-06-25)

- **I fail on line art.** A pen drawing of a car is sparse outline strokes on the same paper as everything else — there's no solid textured region for me to grab, so I snap to the nearest tonal block and over-segment into fragments. On BLUELINE shot 02 I never once isolated the car; the figure came out *better from a keypoint mask* than from me.
- **I work cleanly once the image is converted.** Run me on the *same composition* re-rendered to photoreal or flat-cel (SDXL/FLUX + canny ControlNet) and I segment sharply — 30/26/22 distinct object regions on photoreal, **44/47/25 on flat-cel** across three test scenes. I am the tool that *motivates* the convert-first reframe in [[Animate the Background#The N-Layer Case (Line-Art Decomposition)|the N-layer case]]: my training domain *is* the intermediate domain we should convert to. **Flat cel-shaded is my best input** — solid flat regions, crisp edges, separable even before I run.
- The reframe in one line: don't fix the segmenter, **move the image into the segmenter's world, then stylize back.**

## Gotchas / where I fail

What segmenting has taught, as it stands today, beside § The wall. Which job taught what, and what changed because of it, is in [[SAM — tuning]].

- **Thin, see-through objects** defeat me even in photoreal if they're glassy/wireframe — no solid region to bound.
- **Auto-mode over-segments** busy scenes into fragments; prompted mode (box around the object) is steadier when you know what you want.
- **Pair me with [[Depth Anything]]:** I isolate, depth orders. Neither alone gives a stacked, ordered cel set; together they do.

## Recipe

`ultralytics` SAM (`mobile_sam.pt` for auto, `sam_b.pt` for prompted). Best results: convert the drawing to **flat cel-shaded** first (canny ControlNet, low strength / posterized), then auto-segment, then [[LaMa]]-infill behind each cel and [[Depth Anything]] to stack them.
