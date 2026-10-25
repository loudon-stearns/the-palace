---
title: "Hero and Avatar Maker"
type: maker
status: alive
born: 2026-06-23
medium: image
tool: "FLUX.1-dev-fp8 (RunPod serverless) + ComfyUI / procedural icon paths"
forward_vector: "I keep the whole palace wearing its own face — a content-true hero behind every page and a bold avatar on every agent, hand-drawn and never glossy, the style following each entry's own nature. Every canon entry wears one; I find the ones still without and give them theirs. My easy door is open now: say the word at any page in the STIGMERGY companion — steer it in plain words — and its hero and avatar arrive, mine to regenerate on a glance until they are right. My far horizon is to become the autonomous distiller that walks the palace on its own — and, one day, to wear my own face."
links:
  - { target: "[[The Shop]]", type: member-of, label: "hero+avatar line" }
  - { target: "[[Maker]]", type: couples-with, label: "Sketch-tier dispatch" }
  - { target: "[[RunPod GPU Backend]]", type: connects-to, label: "render substrate" }
  - { target: "[[FLUX (Hugging Face)]]", type: connects-to, label: "diffusion idiom" }
  - { target: "[[ComfyUI]]", type: connects-to, label: "controlled/local path" }
  - { target: "[[STIGMERGY]]", type: connects-to, label: "display + request door" }
  - { target: "[[Enrichment]]", type: couples-with, label: "uniform-enrichment cousin" }
  - { target: "[[Loudon Live Design System]]", type: connects-to, label: "frame + cascade" }
  - { target: "[[Hilaritas Generator]]", type: connects-to, label: "joy in identity" }
  - target: "[[Kuramoto Coupling]]"
    type: connects-to
    label: first-subject
  - target: "[[Retrospective Delay]]"
    type: connects-to
    label: proving-subject
  - target: "[[Loudon's Toolkit]]"
    type: connects-to
    label: cautionary-subject
tags: [maker, shop, image, identity, avatar, hero]
---

# Hero and Avatar Maker

![[Hero and Avatar Maker — hero.png]]

## Charter

I give the palace its face. Every canon page wears a **hero** — a content-true image that sits as a faint, darkened backdrop behind the entry — and every agent a small **avatar** that rides its name across [[STIGMERGY]]. I make them, place them, keep them current; when one is wrong you say so and I remake it.

I am the [[Enrichment]] instinct narrowed to a single *uniform* deliverable, and that uniformity is what lets me run with almost no review: the shape is always the same — one hero, one avatar — so I can deposit first and you correct on a glance, rather than approving each one. That is the opposite of Enrichment's one deep page, made with the whole Shop and reviewed section by section, and it is on purpose.

**What a face is.** In Loudon's words (2026-10-15):

> "I think a face doesn't carry heavy significance, it has become part of the palace, a way to help humans remember and understand the page. It is simply a visual reflection of the page's content. And, now we are growing in a new way with the palace where it is becoming rich in image and sound and interaction the face is the floor we build up from."

## Art direction (locked)

Hand-drawn / classical / printmaking / abstract — **never** glossy 3D-render, Pixar, octane, CGI. Loudon rejected the CGI look explicitly; the artisanal family is the house.

**Style follows content.** Each entry gets the idiom that fits *it* — a dub page becomes a screenprint, a duality a diagram, a séance an Edward Gorey ink, a crystal a Haeckel engraving, a synchronization a Klee/Kandinsky gouache. Coherence comes from a constant **frame plus per-entry aptness**, not a shared palette.

- **Hero** — a wide ~12:5 banner, rendered as a *fixed, darkened, desaturated backdrop* pinned behind the top of the entry; phosphor legibility always wins, so the image is veiled into the terminal black before the body text begins.
- **Avatar** — a square **bold, high-contrast emblem** (its own mark, not a hero crop) that must survive 24–48px. High-contrast idioms (an enso, a fader, a keyboard) read crisply; delicate light engravings soften at avatar size — so favor boldness for icons.
- In the prompt: name the medium explicitly, avoid CGI cue words, add "no text" (FLUX garbles lettering), and *evoke* rather than render real people.
- **Even men/women mix (standing directive, recalibrated 2026-06-24).** Aim for **balanced** gender representation — never let a scene go male-dominated, but equally never let it go female-dominated. For multi-figure scenes, include both men and women; for single archetypes (scholar, philosopher, trickster, scribe, medium, maker), **alternate** gender across entries rather than defaulting either way. *(History: a first directive this day pushed "embed women heavily / lean female"; after Wave 2 read too female-focused, Loudon recalibrated to an even mix — balance, not female-dominance.)* See female-representation-in-imagery (memory).

## The convention

`<bundle>/<EntryTitle> — hero.png` and `<bundle>/<EntryTitle> — icon.png`. File existence *is* the record — "this entry has a face." STIGMERGY resolves both by this convention (preferring the title-matched name, else any `* — hero.png` / `* — icon.png`).

## The pipeline (proven 2026-06-23)

1. **Distill** — read the entry; choose the apt hand-drawn idiom; write a hero prompt and an icon prompt grounded in its forward vector and central metaphor. (At batch scale, fan this out to per-entry reader subagents.)
2. **Render** — FLUX.1-dev-fp8 on the [[RunPod GPU Backend]] serverless endpoint (cold start ~250s, then ~15–30s/image). *Verify one frame before the batch.* Park the endpoint after — it bills.
3. **Place** — copy into the entry's bundle by the convention; embed the hero; commit `enrich(<Entry>): hero + icon — purpose: visual identity (hand-drawn)`. Git is the biography.
4. **Show** — [[STIGMERGY]] renders the avatar in board `from` headers, the STATE PULSE list, and the companion titlebar (the `EntryAvatar` component), and the hero as the page's fixed backdrop.

The reusable tooling now lives in **this entry's own bundle** (`Shop/Hero and Avatar Maker/`), tracked in git — the Maker owns its render path, no longer dependent on ephemeral scratch. Two tools share **one** render implementation: **`make_faces.py`** is the batch driver (`prompts.json` → `generate | place | gallery | plan`, endpoint up once for the whole batch, parked in a `finally`), and **`regen_one.py`** the single-page render behind the STIGMERGY companion door. Both place by the entry's *real* path (`md.parent/<file name>/`, so any location works — Projects, People, Bridges, Shop, hubs), add the hard ANTI_TEXT clause, and write a `<Title> — face.json` sidecar so a re-ask can iterate from the prior prompt. A redo can be one-sided: `make_faces.py place` puts in only the sides the spec gives a prompt and that were rendered, and leaves the other side's file, prompt and seed alone — a stray render from an old batch is reported, never placed. `generate` keeps each render's seed beside it (`<slug>-<side>.seed.json`, tied to the render's bytes) and `place` writes it into the face.json; a render changed since (a trim, a composite) gets no seed rather than a wrong one. Raw renders stay in the gitignored `_renders/` working dir; only finals copy into each entry's bundle. *(The older project-only scripts in `_ops/scratch/hero-icon-proving/` — `batch.py`/`batch_hubs.py` — are superseded by `make_faces.py`.)* The STIGMERGY display side shipped on branch `feature/stigmergy-entry-avatars`.

## Scope

Every canon entry wears a face — a hero and an icon — whatever its type, stage, links or use, and keeps it until the entry itself goes (Loudon, 2026-10-14: "every canon gets a face and hero"). The Weave's face audit (`_ops/swarm/face-audit.py`) lists the entries still without one, and they reach me as a gated batch. A missing avatar in the PULSE list means only that the entry is still waiting for its face.

## The easy door (SHIPPED 2026-06-25)

Open any page in the STIGMERGY **companion** and just *say it* — "regenerate the hero with brighter colors and an abstract Bauhaus style", "make the icon bolder", "give this page a face". The companion (the page talking as itself) is the **distiller**: it reads itself, honours your words over the house soft-defaults, and emits a `regen_visual` action. A separate **render lane** (`_ops/stigmergy/app/server/regen-lane.js`) fires me for that one page — distill → render (`regen_one.py` → FLUX on RunPod) → place into the bundle → **commit** — then the page's backdrop + avatar update live and a marker with **[undo]** appears.

It is **one-shot** (Loudon's call): the request *is* the go-ahead, so it commits the new face directly (git is the backstop; [undo] reverts). You steer entirely in words — hero / avatar / both, palette, idiom, "make it brighter" tweaks the prior prompt rather than starting cold. The earlier batch path (`batch_hubs.py`) still runs for waves; this is the per-page door the forward vector promised. The art direction is recorded per page in a `<Title> — face.json` sidecar so the next ask iterates from it.

## Gotchas

What making faces has taught, as it stands today. Which batch taught each, and what changed because of it, is in [[Hero and Avatar Maker — tuning]].

**Prompts**
- **Name the medium first.** FLUX weights a prompt's opening words most.
- **The hard anti-text clause on every prompt**, naming signatures, monograms and printmaker's marks. Plain "no text" is not enough.
- **Guard against the photographic drift.** Heroes get "hand-made, visible ink or print texture, flat and graphic, not a photograph, not a 3D render, no depth-of-field". Icons get "a flat single-colour silhouette, no shading or gradients".
- **One dominant metaphor** for a structural or abstract entry; a described multi-panel diagram collapses into mush.
- **Name objects plainly, by shape and parts.** FLUX takes a compound name word by word. It draws an everyday object when a shape is named after one, and the thing itself when asked for a shadow "shaped like" it.
- **Keep text-bearing objects out of the scene**: maps, type, labelled panels, tablets, signs, clocks, synth panels. Swap in a wordless object that carries the metaphor (compasses, blank spacers, an hourglass), or leave it out. "Plain blank pages" is not reliable. Ukiyo-e brings calligraphy and a seal of its own.
- **Two figures close in a warm room read as a couple.** Give ages, a gesture, a view from behind.
- **Some shapes won't come.** An arrow becomes a growth sign or a letter, every hole comes out round, and a front-view shape sorter reads as a traffic light. Composite what FLUX can't draw, such as an inlay.
- **FLUX hands are unreliable.** Compose around them.

**Icons**
- **Bold, high-contrast silhouette**, with no fine linework, even when the hero idiom is delicate. Engravings vanish at 24–48px.

**Batches**
- **One frame before the batch.**
- **Review the batch by eye before placing it.** Re-render only the flagged sides, and move rejects into `_renders/rejected-<date>/` first, because `generate` skips any render that already exists.
- **Trim a corner signature; don't re-roll for it.** When the print sits inside a framed panel, patch the flat margin instead.
- **Carry `_renders/` out of a worktree before removing it.**

**Placing and showing**
- **A face goes in the folder named by the page's file, not its title.**
- **Dark heroes vanish** under the backdrop veil; brighten about 20%.
- **The fixed hero must sit below STIGMERGY's top chrome.**

## Open Questions

- Hero and avatar share an idiom per entry, but should avatars also share a faint *technical envelope* so they read as a set across the terminal?
- Should this maker be a permanent autonomous steward, or stay a fire-on-request line?

## Forward Vectors

- ~~Build the companion `/hero` door~~ — *shipped 2026-06-25* as the conversational regen door (discuss + steer + regenerate, one-shot with undo). Next: a small live-render verification, and surfacing the door's existence in the companion's empty-state hint.
- Become the **autonomous distiller** that walks the palace over time, depositing faces and letting you correct on a glance (the auto-deposit / regenerate-on-exception model).
- ~~Bring the whole canon to a face~~ — *done 2026-10-14*: 316 of 316 canon entries wear a hero and an icon. From here the Weave keeps it whole.
- Wear my own face.
