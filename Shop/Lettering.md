---
title: "Lettering"
type: specialist
status: alive
medium: image
tool: "ComfyUI SDXL + ControlNet-canny (render_text.py)"
tool_version: "sd_xl_base_1.0 · controlnet-canny-sdxl"
born: 2026-06
forward_vector: "Hand me words plus who-says-them-how-to-whom, and I render the letterform that means it — I author the legible skeleton, let diffusion supply the emotional material, and leave the font black when the void speaks louder. Proven on BLUELINE's seven voices; I want to harden my pipeline into named recipes, grow a vector-letterer for long legible text, and learn placement so I letter into the frame, not just onto black."
links:
  - target: "[[The Shop]]"
    type: member-of
  - target: "[[BLUELINE]]"
    type: emerged-from
    label: proving-ground
  - target: "[[Frame Designer]]"
    type: connects-to
    label: letters-what-it-draws
  - target: "[[Typography as Meaning]]"
    type: exemplifies
  - target: "[[Blocked, Not Prompted]]"
    type: exemplifies
    label: for-text
  - target: "[[BLUELINE — Text Layer]]"
    type: connects-to
    label: the-spec
  - target: "[[Steer the Generator]]"
    type: exemplifies
    label: control-not-prompt
  - target: "[[Graphic Storytelling]]"
    type: enables
    label: letters-the-voices
  - target: "[[Maker]]"
    type: connects-to
    label: directed-by
---

# Lettering — *the emotional-text renderer*

![[Lettering — hero.png]]

The [[The Shop|Shop]] citizen that renders **short, high-impact words as imagery** where the *letterform carries the feeling* — the register a font can't reach. Sibling to [[Frame Designer]]: it letters what the frame draws. Realizes [[Typography as Meaning]]; grown on [[BLUELINE — Text Layer|BLUELINE's text layer]]. (Long, legible text stays the future **vector letterer's** job — see Forward Vectors.)

## Charter

Given a word and its emotional/source metadata, produce a letterform image — on black, in the locked house idiom — whose *substance* (font, material, treatment, negative space) means what the word means. Legible by construction, expressive by diffusion.

*The card: what a maker reads before choosing me, and what `node Shop/shop.mjs menu` prints. Tried 2026-11-14: Run, Speed and Checked by, by rendering "NO" once at the Study tier on this Mac; Best used for, Not yet shown, Not my purpose, Wears and Hands on are read from the page and BLUELINE's bench, not tried.*

**Best used for, so far:** A short word that has to carry a feeling as an image: a shout, a whisper, a sound effect, a title. Evidence: BLUELINE's seven voices (2026-06-24, plates in my bundle, NO, too late and BURNING among them), and a legible canny-locked "NO" rendered again on 2026-11-14.
**Not yet shown to hold:** Long legible text, named recipes a brief can call by tier, a vector letterer, a legibility judge, and placement beyond one mode (anchored in Blender, 2026-07-01). The full Piece chain, photoreal to ink to negative space, was not rerun on 2026-11-14.
**Not my purpose:** Captions and narration, anything longer than a few words: SDXL cannot spell free-hand, so they wait for a vector letterer. Body text set in a font stays the page's own type.
**Run:** With the ComfyUI server up (Shop/ComfyUI's Run line), from the palace root: `_tools/ComfyUI/venv/bin/python "Shop/Lettering/proofs/2026-11-14-card-check/letter_one.py" --only shout-no --seeds 1 --out OUT_DIR`; `--mode stylize` after that gives the ink pass and its negative-space variant. Voice ids are in `Projects/BLUELINE/proofs/text-layer/text-prompts.json`.
**Speed:** One word, Study tier (skeleton + canny SDXL, 1216×832, 36 steps) on this Mac's MPS: 185 s on a warm server (2026-11-14). The skeleton itself is instant on the CPU.
**Checked by:** A script checks the render finished and the image exists at 1216×832. Only an eye judges whether the word is legible and means what it says; the legibility judge is still a forward vector.
**Wears:** No design system is wired in. I letter in BLUELINE's locked pen-flow ink idiom, on black.
**Hands on:** I hand on a word as an image on black, in the house idiom, with an optional negative-space variant: Frame Designer places it in a panel or a balloon, and Blender anchors it to a mouth keypoint. I take a word with its type, source, emotion, addressee, diegesis and beat, and I lean on ComfyUI to render.

## Job Contract

```
in:  (words, type, source, emotion, addressee, diegesis, beat)
out: text image  (on black · locked idiom · optional negative-space variant)
```

## The pipeline (its working wisdom)

1. **Skeleton** — a *hand-drawn* font carries the source before any pixel: Nosifer **bleeds** the dying woman's *too late*; Bangers **shouts** the hero's *NO*; New Rocker is gothic-monumental for a title. A wide font library + sampler makes the choice (`fetch_fonts.py`, `font_sampler.py`).
2. **Canny-lock** — *[[Blocked, Not Prompted]], for text*: the skeleton is the pose, the material is the render. Diffusion fills the letters; it cannot spell them away.
3. **Photoreal → ink (rich-first / stylize-last)** — render rich material (flame/blood/ember), desaturate (its values carry the form), `img2img ~0.85` to the locked pen-flow ink — canny still holding the letters on *every* pass. Same discipline as the boards.
4. **Negative-space knockout** (optional, never forced) — leave the font black; the word becomes the void the energy flows around. Strongest on a light energy field.

## Tiers

- **Sketch** — skeleton + sampler only (CPU, instant): pick the font, see the word.
- **Study** — skeleton+canny photoreal (1 render): the material register.
- **Piece** — full rich-first→ink (+ optional negspace): the house idiom.

## Gotchas (hard-won)

- **Don't feed the photoreal `gesture` into the ink prompt** — it names the photoreal material (fire/blood/embers) and re-injects it; BURNING stayed on fire until dropped.
- **Mechanical fonts dominate** — use *hand-drawn* skeletons and a **loose** canny on the stylize pass (released ~45%) so the letters go organic, not a traced outline.
- **Negative-space sings only on a light energy field**; on a dark field the black word vanishes.
- **SDXL can't spell free-hand** — keep words short; generate-many-select; the skeleton is the legibility floor.

## Resource Footprint

Local ComfyUI SDXL, ~150–200 s/word on MPS (Study/Piece); one Study word measured 185 s on 2026-11-14 ([[Lettering — tuning]]). Skeletons, sampler, and the knockout are CPU-only and instant.

## Bench

`Projects/BLUELINE/proofs/text-layer/` holds the renderer, its prompts, the font library and sampler, the seven-voice proof suite and the balloon bench. Run inside that folder, `<comfy venv>/python render_text.py` takes `--only <ids>` (comma-separated voice ids from `text-prompts.json`: ascension, shout-no, whisper-stay, sfx-thoom, dying-toolate, lyric-burning, thought-real), `--seeds N` (default 2), `--mode skeleton | free | stylize` (default skeleton; stylize needs the skeleton render first) and `--denoise` (stylize only, default 0.78). With no arguments it renders all seven voices at two seeds each. It writes into the bench's own `out/`, `skel/` and `desat/` and rebuilds `contact-sheet.html`, so for a job that belongs to another page use `Shop/Lettering/proofs/2026-11-14-card-check/letter_one.py`, which runs the same renderer with the same arguments into a folder you name. The balloon bench, `balloon_genai.py`, imports the catalog `balloon_lib.py` from `Projects/BLUELINE/proofs/blender-handdrawn/followups/rig-openpose/`.

## Forward Vectors

- **Harden the modes into named Shop recipes** so a brief dispatches a tier, not a script.
- **Grow the vector letterer** — the deterministic sibling for long legible captions/narration (where diffusion's spelling can't go).
- **Learn placement** — letter *into the frame* (tail to a mouth keypoint) and *into the margin* (the author's voice), per [[Typography as Meaning]]. *Placement mode #1 (anchor in Blender) proven 2026-07-01 — see [[BLUELINE — Text Layer]].*
- **Cross the balloon (opened 2026-07-01).** Diffusion need not stop at the letterform. Style the **container** (torn-ink/cotton box), **clip** or **free** the word from its bounds, or make the bubble a **window into the speaker's mind** — a generated atmosphere as subtext behind crisp words. Widens "text as a guide for gen-AI" from the letterform to the whole balloon. Bench: `balloon_genai.py` (crosses `render_text.py` with the balloon catalog `balloon_lib.py`); the four modes live in [[BLUELINE — Text Layer]] § Balloon × gen-AI.
- **A visual legibility judge** — so the bench can reject a mangled word without a human eye.
