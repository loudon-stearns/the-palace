---
title: "The Flow Field is the Spine"
type: concept
pillars: [tools, creation, philosophy]
born: 2026-06-13
stage: growing
confidence: working
energy: high
links:
  - target: "[[Blocked, Not Prompted]]"
    type: couples-with
    label: geometry-first-siblings
  - target: "[[Flocking]]"
    type: connects-to
    label: both-are-vector-fields
  - target: "[[Go-with-the-Flow]]"
    type: connects-to
    label: published-precedent
  - target: "[[BLUELINE — Motion and Flow]]"
    type: connects-to
    label: unified-motion-home
  - target: "[[The Aftermath Frame]]"
    type: spawned
    label: spine-extended-into-time
  - target: "[[Move the Ink, Don't Redraw It]]"
    type: couples-with
    label: field-is-the-geometry
  - target: "[[The 2.5D Paper Stack]]"
    type: connects-to
    label: composites-around
tags: [concept, flow-field, simulation, motion, blueline, seed]
---

# The Flow Field is the Spine

![[The Flow Field is the Spine — hero.png]]

**One authored vector field, rendered at three resolutions of reality.**

A single-*source* field is the heart of [[BLUELINE]] — the same quantity expressed three ways (and a panel composites a **stack** of such fields; see § Single-source, not single-field, below):

1. **Drawn** — graphic speed lines, in the comic register.
2. **Steers** — dense per-frame motion conditioning of the render.
3. **Simulated** — a volumetric medium (dust, disturbed air, spray, debris, refraction), in the cinema register.

The field has **two lifetimes**: it is both guidance the diffusion *eats* and geometry the compositor *keeps*. It survives into the final frame. **The arrow becomes the wind** — the motion indicator is not discarded in the final cut, it is *promoted* from notation to physics, driven by the same source. Promotion, not abandonment.

## The bet, stated honestly

The **strong claim** is that one *untouched* field serves all three legs. The **likely-true claim** is one shared source plus a per-leg transfer function (speed-line stylization, motion-vector scaling, sim velocity). Both are real wins; the strong version is the one to try to *falsify*. This is [[BLUELINE]]'s #1 risk — the spine spike (Claude Code job, Session 3) is designed to break the strong claim, not flatter it.

There is published reason for optimism: [[Go-with-the-Flow]] (CVPR 2025) makes video diffusion motion-controllable by warping noise with optical-flow fields and gets camera control, object-motion control, and motion transfer *from one flow source*. That de-risks the hardest leg — flow as dense motion conditioning — before the spike even runs.

**Spike result (2026-06-13, [[BLUELINE — Claude Code Job]] Session 3):** the strong claim is **falsified**, the likely-true claim **holds** — and the residual cost is *small*. One field array was read **untouched** by all three legs (drawn speed-lines, dense-motion/noise-warp, particle sim); each leg added only a **thin per-leg transfer** — a scalar magnitude scale plus a seeding/format choice — never a re-authoring of the field. The field's structure (its vortices and drift) is the shared, expensive thing; the per-leg work is a scalar. So the spine is real and load-bearing in its shared-source-plus-mapping form. Evidence: `Projects/BLUELINE/proofs/session-3-flowfield/` (`CONTACT-SHEET-one-field-three-resolutions.png`). The recipe: § The recipe, below.

## Now it flows around a character (Session 4, 2026-07-02)

The Session-3 field was character-*blind* — drift plus hand-placed vortices, nothing knew a figure stood in the wind. Session 4 makes it **character-aware**, coupling the spine to the posed-mannequin work: the figure's silhouette becomes a **solid obstacle**, and a single pressure-projection (Poisson solve, no-flux at the body) bends the field tangent to it — streamlines **part around** the head/torso/crouched legs, **compress past the shoulders/hips**, **stagnate** on the windward chest, and **shed a counter-rotating wake** downwind. The same untouched `flow-field.json` then feeds both proven registers: comic **speed-lines** wrap the body, and a **dust sim** piles bright on the windward edge and swirls into the wake. Crucially the coupling adds a stage to the *field author* (mask → projection → wake), **not** to each leg — so the spine's shared-source claim survives the obstacle. This is the two-lifetimes promotion made literal: *the arrow becomes the wind, and now the wind knows the body is there.* Evidence: `Projects/BLUELINE/proofs/session-4-figure-flow/` (`CONTACT-SHEET-one-field-around-a-character.png`). The recipe's steps: § The recipe, below.

## The render-noise sub-claim is retired (M3–M3.7, 2026-06-18/19)

One reading of the **Steers** leg was literal: *warp the diffusion noise* along the flow so the render
itself carries the motion ([[Go-with-the-Flow]]'s mechanism). That sub-claim was tested exhaustively and
**retired**. Even with a correct whiteness-preserving warp, flow-warped noise **never beat seed-lock** at
the render — not on a single staged jump swept 48→483 px (M3.6, statistically tied), and not on a
cumulative 6-frame sequence (M3.7, seed-lock's adjacent-frame coherence 0.858 vs the warped chain's
0.809). Seed-lock is already near-ceiling at the pose deltas BLUELINE uses, leaving no headroom. **Design
rule, load-bearing:** the storyboard→render path rides **seed-lock + identity + depth + img2img**; do not
invest in flow-warped noise there. The spine is **not** disproven — it lost only the "move the noise"
leg. It stays the **compositional/FX spine**: the drawn speed-lines, the character-aware dust, the
comic-register scroll, and — via [[Move the Ink, Don't Redraw It]] — the geometry that *warps the ink*
(where deterministic displacement beats per-frame AI, boil 0.15 vs 1.50). Full accounting and the next
coupling (pose → field → clock): [[BLUELINE — Motion and Flow]]. Evidence: `Projects/BLUELINE/proofs/m3-warped-noise/`.

## Why it's a spine and not a feature

A spine is what the rest hangs off. Because all three resolutions sample the *same* field, the comic and the cinema stay in register automatically — the speed line in panel three and the dust plume in the hyperreal expansion are literally the same arrow at different fidelities. Coherence is structural, not curated. This is the deep kinship with [[Flocking]]: a vector field over space, read by many consumers, producing coordinated behavior from one source.

## Single-source, not single-field (reframed 2026-07-09)

Loudon relaxed the singular reading: **one field per panel is over-restrictive.** Re-read what the spine actually bought — **single-source coherence**, the three legs agreeing because they derive from one source. The prize was coherence, never singularity of *number*. So the discipline is **one source per motion**, and a panel carries a **stack** of fields — a global wind, a figure-attached wake, a beat-keyed impact burst, an ambient drift — each single-source, each rendered across the three registers, composited like buses on a mixer. The doctrine was already violated in practice: the **Swing Solver** ([[The Aftermath Frame]]) ships a second, non-curl field-source. Pluralizing just lets the spine tell the truth. Coherence stays structural *within* each field; composition is the freedom *between* them. The stack lives at the panel — home: [[BLUELINE — Motion and Flow]] and [[BLUELINE — The Page]] § file structure.

<!-- CLAUDE → LOUDON: should the lead paragraph foreground shared-source-plus-mapping over "one untouched field"? "The bet" carries the spike's result; your framing is left as written. -->

## The recipe

How the field is made and read, as the spikes built it. The code is in `Projects/BLUELINE/proofs/session-3-flowfield/` and `session-4-figure-flow/`.

**The one rule.** Author one field, render it three ways, and never re-author it per leg. Each leg only scales it and seeds it.

**The source.** One divergence-free field, the curl of a scalar potential ψ (a laminar drift plus Gaussian vortices):

> **(vx, vy) = (∂ψ/∂y, −∂ψ/∂x)**
>
> the horizontal velocity = how fast the potential changes going up; the vertical velocity = minus how fast it changes going across

It is sampled to a grid and exported as `flow-field.json`, and every leg reads that file untouched (`field.py`).

**Around a figure.** A field-author stage before the legs, so the shared-source rule is untouched (Session 4's `field.py`):

1. **Mask.** Gate the filled depth plate with the dilated OpenPose skeleton as a locator, so the floor and the props drop out and only the body remains, as a solid silhouette.
2. **Project.** Zero the velocity inside the solid, then one Poisson solve, **∇²p = ∇·v** (the pressure's curvature = how much the flow spreads), with no flux through the body and the top and bottom walls and an open inlet and outlet, and set **v = v − ∇p** (the velocity minus the pressure's slope).
3. **Wake.** Seed a counter-rotating vortex pair just behind the lee edge, before the projection.

The output is still one `flow-field.json`, now carrying a `solid` mask.

**The three legs, and the only thing each adds.**

| Leg | Register | How | Its per-leg transfer |
|---|---|---|---|
| Drawn | comic | integrate streamlines into tapered speed lines | seed grid · step length · magnitude to width taper |
| Steers | render conditioning | a dense motion map (HSV); the noise-warp half is retired, above | one scalar, `dt_px` (magnitude to pixels a frame) |
| Simulated | cinema | advect particles by the field | velocity scale · `dt` · re-seed on exit |

**The sim engine.** Three.js authors and previews in real time; Blender bakes the hero render offline. The same `flow-field.json` drives both, so the hand-off loses nothing (`legs/particles.html`, `legs/blender_particles.py`).

## Open

- How much does the velocity scale (`dt_px`) need re-tuning per shot, against once per project? The spike used one set of scalars; stability across shots is untested.
- A field that changes in time. The spike's field is static, and "rushing by" was a static field with advected particles. A field that evolves per beat is the next escalation: [[BLUELINE — Motion and Flow]] § Edge 2.
- When does the recipe become a skill? Once the coupling holds across several real shots.
