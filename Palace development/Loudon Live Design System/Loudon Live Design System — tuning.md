---
title: "Loudon Live Design System — tuning"
born: 2026-10-25
links:
  - target: "[[Loudon Live Design System]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am what making looks for Loud'n Live has taught: a line for every look session and a numbered lesson for each thing one showed, so the next session reads me first and starts where the last one finished."
ledger: tuning
standards:
  for: "what each look session taught: how to run one, what Loudon's taste asks for, how plates are made and recorded, and the mechanics that cost time"
  run: "one look session: Loudon and a working session making or reworking a look for Loud'n Live, from the first rough to the canon landing"
  line: "- run · <date> · <what the session made> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid"
  writes: "the run itself, in the commit that records it"
  merge: union
  kept: git
  trim: never
---

# Loudon Live Design System — tuning

What making looks taught the [[Loudon Live Design System]]. Read the tail before a look session starts; the recipe in `_ops/loudon-live/design-system/SKILL.md` § Making a new look points here. Lessons are numbered and grouped by run date, newest last. The calls themselves, in Loudon's words, are in the workshop README's Decisions (`workshop/README.md` in this bundle); the made things are on [[Loudon Live Design System — scroll]].

## From the look rethink — 2026-10-25

The session made three looks for Loud'n Live (Worn Broadcast `3c817503`, Cyanotype `9a7f3d18`, Night Signal `42dc4091`), retired "no cyan", and closed the 2026-10-14 baton as partial (`876d2054`).

### How to run a look session

1. **Ask for a reference at the open.** Ask two things before drawing: "what's close to the feel?" and "what is the look you keep seeing elsewhere?" A reference Loudon brought moved the work further than any number of roughs: the Moreux cyanotype for colour and paper, and two images of drafted lettering for the title. Roughs that started from a reference landed sooner.
2. **First rough: one card at several distances.** Draw the same stream card at three or four distances toward the source (A today, B grammar only, C louder, D past a rule). Loudon picks a distance faster than he answers a question about one, and he usually picks the furthest and asks for more.
3. **Record his calls as they come.** Keep his words verbatim in the workshop README's "Decisions so far". Every canon landing then needs only to quote that list, and none of it was reconstructed afterwards.
4. **Build the standalone from the start.** A look ships as one self-contained 1920 × 1080 HTML file:
   - a header comment that is its spec (palette, type, texture, motion)
   - fields filled from the URL, for an OBS browser source
   - a fit-to-window scale on a wrapper, with any shake or transform on the card inside it

   Rough on that same frame, and the landing step becomes a copy. The builders `build_look_cyanotype.py` and `build_look_night.py` show the lift.
5. **A look is complete, not a skin.** Palette, type, texture and motion travel together. The six house skins remain the public channel's default for everything that isn't Loud'n Live.

### What his taste taught

6. **"Safe and clean" is the usual first note.** Each direction needed at least one push: dirtier, layered, more glow, stronger rain, more texture. Start one notch dirtier than seems right.
7. **Layering beats choosing.** Night Signal won by folding three directions into one card: sidechain pump, the 303, neon, plus Worn Broadcast's grime. When he likes parts of several roughs, offer the stack.
8. **Music references he responds to:**
   - a sidechain pump on everything
   - a 303 filter sweep with its step pattern
   - a synth panel of knobs over keys, tilted toward the player
   - a stereo vectorscope
   - a BPM clock with a drop every eight bars

   Tie every moving thing to one clock (`?bpm=`).
9. **Hand-drawn means a skilled hand.** Wobbly lines, a hand font with mixed case, and filter-made stains read childish and "digital". A drafter rules straight lines and letters in proper capitals. The human shows in the process instead: guidelines left in, an erased old name, a rubbed-out first try, a revision table, a checker's red pencil.
10. **Drafting type:**
    - The lettering is Josefin Sans at normal tracking. Architects Daughter and Patrick Hand SC were rejected, and so was wide tracking.
    - Big titles are a thin-pen outline, with construction lines and a width dimension under each letter.
    - A specimen page that sets the real title lines in five or six faces settles a type question in one look.

### Generated plates

11. **The paper is an image; the drawing stays vector.** Generated pixels are only a ground, a tone map or a backdrop. Every word and line sits on top as text, so nothing generated carries a mark.
12. **Local SDXL first.** `_tools/ComfyUI`, `sd_xl_base_1.0.safetensors`, about 100 s a plate on the Mac, no cost.
    - Good at blank aged paper and at rain on glass with neon bokeh.
    - "Blueprint" in a prompt makes it draw a plan, so say "paper".
    - Wear weights above about 1.2 make giant objects (a coffee ring became a paper hoop). 1.15 works.
13. **Image to image from a reference's blank paper gives the right material.** Denoise 0.55 worked.
    - Tiling strips of a photo into a start image leaves bands. Take them out with a high-pass in the tint step (blur 70 px, keep 30% of the low frequencies), or start from one larger clean region.
    - `tint_plates.py` maps any plate onto any ground colour by its luminance, and keeps a stain slightly brown.
14. **Provenance at generation time, not after.**
    - Write the model, checkpoint, seed, denoise, init source and prompt beside each plate. The scripts now write a `<plate>.json` sidecar.
    - ComfyUI's `/history` lives only in the running server's memory. It happened to still be up when 0.55 had to be verified. It won't be next time.
    - Say whether a reference was used as a style guide or as pixels.
    - **A reference photo is cited by link only, never committed** (Loudon, 2026-10-25: "don't include the photo, just the link to where I got it from"). ComfyUI keeps its own copy of any uploaded init image in `_tools/ComfyUI/input/`. Remove it with the rest.

### Mechanics that cost time

15. **Container units can't size a container's own text.** `cqw` on a container's own `font-size` or padding resolves against the next container up. Size the children.
16. **The browser pane can't open everything from disk.** It renders local files as static `data:` snapshots, so relative assets fail, and a page over about 1 MB fails to open at all. Serve the workshop folder with a small static server for any rough with images.
17. **Canvas phosphor trails:** fading by painting a translucent ground leaves ghost residue (8-bit rounding). Draw the trail as segments with falling alpha instead.
18. **Glow that reads as glow** is a bloom pass: blur a half-resolution copy of the instrument canvas at two radii, and screen it over the original.
19. **The Concierge and amendments:** a message sent while it is committing becomes a second commit. Wait for its report before sending a correction.

- run · 2026-10-25 · the look rethink: Worn Broadcast, Cyanotype and Night Signal, "no cyan" retired · taught items 1–19
