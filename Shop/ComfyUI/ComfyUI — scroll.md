---
title: "ComfyUI — scroll"
born: 2026-11-15
links:
  - target: "[[ComfyUI]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am ComfyUI's scroll — the page's front door, opening on where it stands now and the plan it is following, then reading down through what was made from it, newest first. My top is regenerated whenever anyone looks; my plan changes only when Loudon agrees; my standing orders are Loudon's; my trail only ever grows."
---

# ComfyUI — scroll

> The page's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. The entry [[ComfyUI]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-11-15T13:58:16.603Z from the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the page is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** alive · **Stage:** — · **Steward:** none — this page has no permanent steward yet
- **Plan:** none agreed yet — the next run works from what the ledger owes and the forward vector
- **Runs:** 2 runs on 2 days, counted from the ledger's run lines
- **Last run:** 2026-11-14 — card check: the fireflies workflow at 768×512, 20 steps, seeds 7, 8, 7, sketch · taught items 4, 5
- **Owed in the ledger:** 5 — items 4, 5, 6, 7, 8; the next run's tail read picks them up first
- **Latest lesson:** item 8, Carried home on 2026-11-14 — from the Loudon Live Design System's look rethink of 2026-10-25, generated plates — [[ComfyUI — tuning]]

### Runs

- 2026-11-14 — card check: the fireflies workflow at 768×512, 20 steps, seeds 7, 8, 7, sketch · taught items 4, 5
- 2026-05-26 — the fireflies pond, sketch · taught items 1, 2

### Owed

- **4.** A same-seed rerun on this Mac's MPS was not byte-identical. The fireflies workflow at 768×512, 20 steps, seed 7, run twice in one server (with a seed-8 render between, so the sa…
- **5.** An identical workflow sent twice to one server comes back with no image. ComfyUI answers from its cache: "Prompt executed in 0.00 seconds", and `/history` holds a completed prom…
- **6.** Local SDXL first, for grounds. `_tools/ComfyUI` with `sd_xl_base_1.0.safetensors` made a plate in about 100 s on the Mac, at no cost. It is good at blank aged paper and at rain …
- **7.** Image to image from a reference's blank paper gives the right material; denoise 0.55 worked. Tiling strips of a photo into a start image leaves bands; take them out with a high-…
- **8.** Write provenance at generation time, not after. Write the model, checkpoint, seed, denoise, init source and prompt beside each plate, as a `<plate>.json` sidecar. ComfyUI's `/hi…

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this page — never regenerated. A steward, if the page ever has one, reads it every cycle before anything else._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="tests-2026-11-15" -->
### 2026-11-15 — The test list

- **Byte-identical reruns.** Proof 2026-11-15: yes from a fresh model, not on a warm one after another render; claims reworded.
- **The same on other models, samplers, a ControlNet graph.** Open.
- **Study and Piece tiers; IP-Adapter; Flux Dev; a LoRA.** Open.
- **ComfyUI 0.45 against 0.22** (the install is six months old). Open: an upgrade is a write to the main checkout's tools, Loudon's call.
- **Mood-first atmosphere against FLUX.** Lost 2026-05-30; FLUX.3 Klein now has a ComfyUI build, so the rematch could run here.
<sub>test list · shop-tests-image session · a maker who finds a better test runs it</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="test-2026-11-15-determinism" -->
### 2026-11-15 — Byte-exact, earned back with one condition

Loudon ruled that my page claimed byte-exact reruns with no run behind them. The run: the card's SDXL workflow, one seed, rendered again and again. From a freshly loaded model, every render was the same file to the byte, the same file as yesterday's first render. After a different render on the warm model, the same seed came back looking the same but differing in three quarters of its pixels, by a little, and that warm result was itself the same every time. The `--deterministic` flag changed nothing; on the CPU everything matched. The page now says exactly that, and how to get a byte-exact rerun: clear the server's cache first.

**Nobody has seen these but an agent checking the layout.** The question for your eye: do the fresh and the warm render look like the same picture to you, and is "the same to the eye" enough, or does a byte-exact rerun matter?

**Artifacts:**
- [fresh, warm, CPU, and the difference amplified](<Shop/ComfyUI/proofs/2026-11-15-determinism/side-by-side.png>)
- [what was measured, every hash](<Shop/ComfyUI/proofs/2026-11-15-determinism/measured.json>)

<sub>test proof, 2026-11-15 · ComfyUI 0.22.0, SDXL, MPS and CPU, determinism.py beside the files · server stopped after · ledger item 9 · shop-tests-image session's agent</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-1ffce71426" -->
### 2026-11-14 — card check: the fireflies workflow at 768×512, 20 steps, seeds 7, 8, 7, sketch

taught items 4, 5
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-47f5a2f4b7" -->
### 2026-05-26 — the fireflies pond, sketch

taught items 1, 2
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
