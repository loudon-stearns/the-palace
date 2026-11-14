---
title: "The Shop — sketch — the hand's pages"
born: 2026-11-14
links:
  - target: "[[The Shop]]"
    type: connects-to
    label: "sketch-for"
  - target: "[[The Shop — sketch — discovery design]]"
    type: connects-to
    label: "part-of"
forward_vector: "I hold two Specialist pages in draft, for the making a maker does in its own code, until Loudon rules on their names and number; then each is born as a real page with its own ledger and I go to the Archive."
---

# The hand's pages — two drafts

Drafts for Loudon, 2026-11-14. Neither is a page yet. Two calls are his: the names, and whether the hand gets one page per material, as drafted here, or one page.

Loudon, 2026-11-14: "I am curious if 'hand built' is really just another needed specialist, like a general purpose sound creator or general purpose svg creator, because even when you are building by hand you can get better at that, right, a ledger could still be useful, and there are some specifics about how we make things here that might help focus your hand built."

Why one page per material: the two lists below share almost nothing. Why it might be one page: the maker is the same, and a sound and its picture are often drawn from the same arrays in one run. The bench already lets a job name both in its chain.

Almost every line below was learned by the light round's maker, the hook pilot's makers, or today's comparisons, and is recorded in [[The Shop — sketch — discovery walk 2026-11-14]]. Where a line is mine, it says so.

---

## Draft one — Sound from Code

*type: specialist · medium: sound · tool: numpy, or the Web Audio API rendered offline · status: alive from birth, since seventy-odd pieces already exist*

### Charter

I make sound by writing it: a sample at a time, from numbers. Tones, pulses, hums, sweeps, clocks, bells built from partials, and any sound that is a measurement you listen to, where what is heard must be exactly what the numbers say. I am also the editor: I cut, place, pan, gate and mix what other Specialists hand me.

I refuse a sound that would have been recorded. A room, rain, a footstep, a bird: those go to [[Stable Audio Open]], one thing at a time, and come back to me to be cut and placed. Loudon, on a room I synthesized whole: it "sounds like 'musique contrete' a collection of precise crafted sounds assembled together". The room made his way he called "the best of the group".

**Best used for, so far:** a tone, a pulse, a hum, a clock, a tuned cue; a measurement you listen to; and cutting, placing and mixing sounds other Specialists made. Sixteen light-round sounds, SUBSTRATE's bed and cues, and the edit of the third Oliveros room.
**Not yet shown to hold:** a room, weather or an object, synthesized (2026-11-14: "filtered noise with sine blips does not read as a room", its maker's words); a singing voice (a buzz through two formants, unheard); nine drips from one drop without sounding repeated (Loudon's open question).
**Not my purpose:** anything that would have been recorded; speech; music with a performance in it.
**Run:** your own script. The kept helpers are in `Enrichment/light-round-2026-11/make-sounds-2.py` (kick, snare, hat, tone, pluck, reverb, gate, filt, env, save); a whole worked edit is `Shop/Maker/comparisons/2026-11-14-oliveros-room/third.py`. Name me in a job's chain as `hand: …` and run it with `node Shop/shop.mjs run`.
**Speed:** a second or less for a piece; the wait is the maker's thinking.
**Checked by:** a script can check everything about me, which is my use and my trap: level, peak, frequency, onset times, left against right. Only an ear can say whether it reads as what it is named.
**Wears:** nothing; a sound has no skin. Its picture wears the [[Drafting Table Design System]] (see Drawn SVG).
**Hands on:** I take single clean events and beds from Stable Audio Open and a voice from [[Kokoro]]; I hand on a mixed file, and the arrays it was made from, so its picture can be drawn from the same numbers.

### House rules a maker meets here and nowhere else

- **The house numbers.** −16 LUFS integrated and −1 dBTP for a finished mix; 48 kHz stereo; narration at 24 kHz mono (`Shop/Maker.md` § House Standards). A maker who goes around the Maker never sees these.
- **Measure the file you saved, not the array you built.** Audition Gate failed here: the level was measured before the save step scaled it.
- **One seed per piece.** A shared random stream made a whole batch reproducible only in one order.
- **Two identical sources left and right are mono to the ear.** Loudon's correction on Leibniz's clocks: give each side its own timbre.
- **A resonant filter boosts.** A caption that said otherwise was false.
- **Fade every edge.** Two milliseconds in and twelve out is what SUBSTRATE's cues use.
- **A ringing thing is chosen for its ring.** Choosing a take by its sharp start picked a 0.06 s click for a bell.
- **Reuse the helpers.** "So the fourth maker doesn't write a fourth kick drum."
- **wav in the workshop, m4a in the bundle**: `afconvert -f m4af -d aac -b 160000 in.wav out.m4a`.
- **Say nobody has heard it until somebody has.**

### What its ledger would open with

The light round's sixteen sounds, unheard. The hum Loudon found too loud. His question about variations for a repeated sound. The pane audio bug of the Daily Page's item 107, which was a cost of this route and was filed where no sound-maker looks.

---

## Draft two — Drawn SVG

*type: specialist · medium: image · tool: SVG written from a script · status: alive from birth*

### Charter

I draw by writing the drawing: shapes, lines and text placed by a script, from data the script holds. A diagram, a lane chart of a sound, a count drawn from the palace's own records, a small figure beside one sentence. I am exact and I am legible, and I am never a photograph.

I refuse what would have been photographed or painted; that goes to [[FLUX (Hugging Face)]] or [[ComfyUI]]. I refuse a chart a reader should explore; that is [[Observable Plot]] or [[D3.js]]. A figure with real mathematics set in it is [[LaTeX]]'s.

**Best used for, so far:** a small exact picture beside one sentence; the picture of a sound, drawn from the same arrays as the sound; a count from the palace's own files. About fifty light-round figures and every sound's picture.
**Not yet shown to hold:** animation that plays everywhere (SMIL played in one preview; the rich face is untested); anything a reader would call an illustration. *This second clause is my reading, not a recorded failure.*
**Not my purpose:** photographs, textures, moods; charts to explore; typeset mathematics.
**Run:** your own script. The kept helpers are in `Enrichment/light-round-2026-11/lib.py` and `make-sound-images.py` (head, text, axis, lanes, write). A small whole example is the picture step at the end of `Shop/Maker/comparisons/2026-11-14-oliveros-room/third.py`.
**Speed:** instant.
**Checked by:** a script can check that it parses, that no text overflows its box, that a count matches its source. Only an eye can say whether it is clear at the size it is shown.
**Wears:** the [[Drafting Table Design System]]. Today by copied values (`lib.py` line 10: paper, three inks, rule, red, fill, and a monospace stack), not by linking the system's tokens. *Whether those values still match the system I have not checked.*
**Hands on:** I take arrays from Sound from Code and numbers from the palace's files; I hand on an SVG, and a PNG through `sips` when a page needs one.

### House rules a maker meets here and nowhere else

- **Look at it at the size it will be shown.** Most layout faults in the light round were text overflowing or overlapping at band width.
- **Escape `&` and `<` in every title and label.** Invalid SVG shipped once.
- **Parse frontmatter with a YAML reader, not a pattern,** when a figure counts pages. A naive parser was off by one.
- **A count names its source file and its date, in the figure.**
- **A caption states the claim, not a description of the picture**, and says what is real and what is a choice. Nearly every fault the challengers found was a caption claiming more than the piece shows.
- **Do not draw a second diagram of a sentence that is already a diagram's caption.**
- **SVG to PNG:** `sips -s format png in.svg --out out.png`. The dvisvgm route from PDF is broken on this Mac.

### What its ledger would open with

The challenge's tally by kind of fault, from the light round. Which animation plays in the rich face, once someone tests it.

---

## What I would not do

Make a third page for "raw Web Audio by hand". The Maker's repaired routing now sends that into a [[Tone.js]] job or to [[Web Audio Worklet]], and both have starters since today.
