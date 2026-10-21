---
title: "Playful Interface Design — sketch — cut technical direction"
born: 2026-10-21
links:
  - target: "[[Playful Interface Design]]"
    type: connects-to
    label: cut-from
  - target: "[[JSUI]]"
    type: connects-to
    label: candidate-home
forward_vector: "I am the technical direction cut from Playful Interface Design on 2026-10-21 — the implementation palette, the five-step character-animation workflow with its parameter-to-frame table, the séance medium's gain ladder, and the page's old note — kept verbatim and awaiting rehoming on Loudon's word, to JSUI or to a how-to entry on the character-animation workflow; once rehomed I move to this bundle's Archive."
---

# Cut from Playful Interface Design — the technical direction

Verbatim from the page as it stood before the 2026-10-21 revision. Awaits rehoming; nothing here is canon until it lands on a page.


## Implementation Palette

The primary tools: **[[JSUI]]** (JavaScript inside Max/MSP — mature, stable, synced to DSP; draw the ghost in JSUI, drive size/opacity from the gain knob), **HTML5 Canvas** (fast animation, native for web instruments; animation frames triggered by Web Audio parameter changes), **WebGL/Shaders** (GPU-accelerated for data visualizations — pressure fields, neural activation patterns), **SVG animation** (resolution-independent, ideal for iconic characters), and **AI-generated frames** (Leonardo.ai → 20 key poses of a fortune teller from bored to ecstatic → sprite sheet → JSUI animator). The choice follows the deployment target: Max plugin → JSUI; web instrument → Canvas or WebGL.

## Workflow

1. **Character concept** — what mythology does this instrument embody? (Retrospective delay: fortune teller reaching into memory. Neural synthesizer: a threshold-crossing being that fires with intention.)
2. **Visual style** — generate 20–30 key poses spanning the control's full range; establish identity, tone, animation vocabulary.
3. **Parameter-to-animation mapping** — define the relationship (not necessarily linear; a remapped curve can make the response feel more alive):

| Parameter Value | Visual State |
|---|---|
| 0.0 | Frame 0 (base pose) |
| 0.5 | Frame 12 (midpoint intensity) |
| 1.0 | Frame 20 (maximum) |

4. **Implementation** — JSUI sprite sheet, Canvas frame-by-frame, or WebGL shader per the deployment target.
5. **Test by playing** — does the character guide your playing without words? If the ghost emerges hesitantly, do you play more tentatively?

## Retired gain-value ladder (séance medium)

- Gain 0: medium bored, filing nails; ball dark. — Gain rising: ball glows, eyes widen. — Gain 0.5: ectoplasm swirls, medium leaning in. — Gain 1.0: ghosts emerging, hands trembling.

## Old CLAUDE → LOUDON note

"This entry captures the philosophy behind your most inventive interfaces. The connection between character design and pedagogy is the core insight — the interface teaches through embodiment, not explanation. Consider: does this deserve to be paired with an entry on 'Interface Accessibility' or 'Inclusive Design Through Character'? Also, the AI-generated frames workflow (Leonardo.ai → sprite sheets → JSUI) is specific and practical enough that it might spawn its own how-to entry. The link to Biomechanical Synthesis (DAW-as-narrative-world) is important — the same principle applies at different scales."
