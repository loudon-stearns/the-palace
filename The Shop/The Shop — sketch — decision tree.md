---
title: "The Shop — sketch — decision tree"
born: 2026-11-14
links:
  - target: "[[The Shop]]"
    type: connects-to
    label: "sketch-for"
  - target: "[[Maker]]"
    type: connects-to
    label: "proposed-for"
  - target: "[[BLUELINE — Production Pipeline]]"
    type: connects-to
    label: "drawn-from"
  - target: "[[The Shop — sketch — discovery design]]"
    type: connects-to
    label: "part-of"
forward_vector: "I am a draft of the one decision tree the Shop works by, for Loudon to cut or adopt. If he adopts it, it goes onto the Maker in place of most of the hand-written routing, and I go to the Archive."
---

# Choose, collect, edit — a decision tree for the Shop

A draft for Loudon, 2026-11-14. Not on the [[Maker]]; it goes there only on his yes.

Loudon, 2026-11-14: "choose each tool for what it does best, then collect and edit together. We were doing very similar processes in blueline. Same kind of decision-tree."

## The move

A made thing is rarely one tool's work. So the question is never "which tool makes this piece?" It is asked once per part:

1. **Break the piece into parts.** A room is a drip, a bell, rain and a hum. A page figure is a curve, its labels and a photograph behind it. A hook is an instrument, a bed and a panel.
2. **For each part, ask what kind of thing it is**, and take the branch below.
3. **Collect** the parts, each with what made it.
4. **Edit them together.** The editor is a Specialist too: the hand, ffmpeg, a page's own code.
5. **Name the seams.** Where one part's output becomes another's input, say what crosses.

The Maker's routing today is keyed by the deliverable: "narration → Kokoro", "math content → Manim". The tree is keyed by the part. That is the whole change.

## The tree

What stands behind each line is marked: **heard** or **seen** means Loudon judged it, **run** means it has been made here at least once, **guess** means nobody has tried it.

### A sound

- **Would it have been recorded?** A room, weather, an object struck, an animal, a texture. → [[Stable Audio Open]], one thing at a time, then cut it and place it by hand. *Heard: the third Oliveros room, "the best of the group".*
- **Is it plainly synthesized, or a measurement you listen to?** A tone, a pulse, a hum, a sweep, a clock. → the hand, from code. *Heard, as the hum in that room; "too loud", which was the hand's setting.*
- **Is it a voice saying words?** → [[Kokoro]]. *Run; the Study voice has been rendered and not heard.* A voice singing: nothing in the Shop does it yet.
- **Is it speech that exists and needs a word or a delivery changed?** → [[AuK]]. *Run once, unheard.*
- **Does it need a shape over time, a count, a rate, an arc?** Do not ask a generator for it in words. Generate the material and let the hand place it. *Run and measured: nine drips placed 1.27 s apart where the model alone gave forty to sixty-nine.*
- **Is it an instrument someone will play?** In a browser: [[Tone.js]] for ready-made voices, [[Web Audio Worklet]] when the DSP is the point. In Live: [[Ableton Session Writer]]. In Rack: [[VCV Patch Generator]]. *Run.*
- **The editor:** the hand cuts, places, pans and mixes; [[ffmpeg]] joins, converts and sets loudness; [[Whisper]] reads speech back to check it.

### A picture

- **Would it have been photographed or painted?** A scene, a texture, a mood, a plate. → [[FLUX (Hugging Face)]] for the look in one call, [[ComfyUI]] when a pose, a palette or a composition must be held. *Seen once: the Shop header comparison, 2026-05-30.*
- **Is it a figure in a pose, seen from a chosen camera?** → block it in [[Blender]] with [[Figure Rig]], then render through ComfyUI. *Run: BLUELINE.*
- **Is it numbers?** → [[Matplotlib]] for a still, [[Observable Plot]] or [[D3.js]] when the reader should touch it. *Run.*
- **Is it a structure: boxes, arrows, states?** → [[Mermaid]]. *Run.*
- **Is it exact: a curve with its mathematics, a diagram to typeset, a part with dimensions?** → [[LaTeX]] for the figure, [[CAD Drafter]] for the part. *Run as probes; nine TikZ figures were made around the LaTeX page on 2026-11-09.*
- **Is it a word that must be an image?** → [[Lettering]]. *Run: BLUELINE's seven voices.*
- **Does an existing picture need taking apart?** Its depth: [[Depth Anything]]. An object cut out: [[SAM]]. A hole filled: [[LaMa]]. *Run once each, on one BLUELINE shot.*
- **The editor:** the hand composes, in SVG or a page; Blender composites where depth matters.
- *Guess, by Loudon's split for sound:* generate what would have been photographed, draw what is a diagram, and edit the two together. Nobody has tried a picture that way outside BLUELINE.

### Something that moves

- **Does it move by a rule you can write down?** Mathematics: [[Manim CE]]. A sketch that answers the mouse: [[p5.js]]. Geometry in three dimensions: [[Three.js]]. *Run.*
- **Is it titles, cards, an interface walking through steps?** → [[Remotion]]. *Run once, silent.*
- **Is it a recording of the screen or a performance?** → [[OBS]], which Loudon operates. *Run.*
- **The editor:** [[ffmpeg]] for the cut and the mux.

### A playable piece

It has two layers, and each is decided apart.

- **Its materials**, a bed, a cue, a panel, a source sound, are sounds and pictures. Take them through the branches above.
- **Its instrument** is code in the reader's browser. Start from the rich-face kit's starter, not a blank file. *Run: six starters made on 2026-11-14 pass the kit's checker.*

## Seams

BLUELINE names its joins: "A conditioned pipeline has seams exactly where the downstream stops being a human" ([[BLUELINE — Production Pipeline]] § The two seams). Its pipeline is a table of stages, one tool each, and the seams are where the work is.

The same holds at this size. In the Oliveros room the seam was between the generator and the hand: what crosses is one clean event in a short clip, and the lesson was to choose a take for its ring and not only for its sharp start. Each Specialist's card has a **Hands on** line for this: what it gives the next tool, and what it needs from the one before.

## Three rules that ride with the tree

- **When you expect the Shop to do worse, make both and keep the comparison.** A few per round, chosen when the work is proposed. His ear or eye decides, and the verdict goes onto the card.
- **A Sketch you run yourself; a Study or a Piece goes to the Maker.**
- **A thing a maker cannot check is said so.** What a script can measure and what only an ear or an eye can judge is the card's **Checked by** line.

## What I do not know

- Whether the picture branch holds. It is Loudon's sound split carried across by analogy, plus what BLUELINE shows for figures.
- Whether the tree should print from the cards, so it cannot drift, or be written by hand as judgement. The menu already prints each Specialist's need. This page adds the questions between them.
- What sings.
