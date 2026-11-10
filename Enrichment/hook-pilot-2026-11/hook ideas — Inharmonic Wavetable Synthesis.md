---
title: "hook ideas — Inharmonic Wavetable Synthesis"
born: 2026-11-10
links:
  - target: "[[Enrichment]]"
    type: connects-to
    label: "workshop-of"
  - target: "[[Inharmonic Wavetable Synthesis]]"
    type: connects-to
    label: "hook-ideas-for"
forward_vector: "I hold four idea reports on how [[Inharmonic Wavetable Synthesis]]'s rich face might open, each from one way of looking, parked as they came back so a maker can read them; I am workshop, not a plan."
---

# Hook ideas — Inharmonic Wavetable Synthesis

These are unverified idea reports from read-only agents that could not see or hear anything; outside facts in them are unchecked.

---

## Ring walk

*Agent `af353016dbeb52f03`, 2026-11-10; taken from its handback.*

Hook ideas for the rich face of Inharmonic Wavetable Synthesis. Read-only; nothing written or built. Two limits up front: I could not open the pieces in a browser or hear any audio, so everything about what they look and sound like is read from source and captions; and I did not summon the Concierge, since this was a dispatched read-only job with no way to spawn one.

Root for all paths: /Users/loudonstearns/Documents/The Palace/

## 1. What a reader meets today

Three five-step walks (bend the line, two ways to settle, the bundle of lines), each a panel of charts with sliders and a readout, beside fifteen gathered renders and two older studies. Worth keeping: the measurements, which are honest and sharp (the bank of sines plays the table back to 2 × 10⁻¹³; the measured bell sits on neither the bow nor the Bessel positions; a real string's bend does not settle), and the fact that step 4 of "bend the line" already lets you drag a curve by hand (`Projects/Inharmonic Wavetable Synthesis/Inharmonic Wavetable Synthesis — rich.json:44`, `… — rich — bend the line.html:227`).

## 2. Three hooks

### A. The ruled line

**In a sentence:** "Try to rule a straight line with your finger. You can't, and the sound tells you exactly how you missed."

**The crossing.** The page's flat line met Agnes Martin, who sits two hops out in the ring.
- `People/Agnes Martin.md:56`: "A hand-ruled line is never perfectly straight; draw the same grid a thousand times and no two lines fall the same... and that hair is where the life is. The grid holds still so the drift can be seen; take it away and the difference vanishes into noise."
- `Projects/Inharmonic Wavetable Synthesis.md:58` (forward vector): "putting a horizontal line in front of you and showing you what happens when you bend it."
- `Projects/Inharmonic Wavetable Synthesis.md:142`: "You cannot look at the flat horizontal line and miss its meaning."

Martin's sentence is the page's idea said by a painter: a still grid is what makes drift visible. It is also, nearly word for word, what Loudon asked for in his note.

**First five seconds.** A pale canvas with a faint pencil grid of vertical lines: the harmonic series, ruled and still. One instruction: "rule a line, left to right." You drag. A tone sounds as you go. Wherever your hand wobbles, the bright mark for that partial slides off its pencil line, and the tone picks up a clang at that height. A steady hand sounds like an organ; a shaky one sounds like struck metal. Lift, and your line stays. Then one button: "let a piano string try." The measured A2 string rules its own line over yours, and it isn't straight either.

**Hook or proof?** The hook is the proof. It is step 4 of "bend the line" moved to the front and given a reason to exist. The current steps 1 and 2 (the table rebuilt as sines, the readout at zero) become the science that follows: "here is what a perfectly straight line is, measured." Step 5's measured materials become "other hands": the string, the bell, the bowl each rule a line. "Two ways to settle" and "the bundle" follow unchanged as: what happens to a ruled line over time, and what happens when several hands rule at once.

**Loudon's note.** Answers it directly. The pencil grid is his ghosted columns; the bright marks leave them. See the finding under section 4: this is also a small, separable fix to the existing piece.

**Caption a stranger needs:** "The faint lines are where a perfectly harmonic tone keeps its partials. The bright marks are where your line put them. Up is sharp, down is flat. The scale from hand wobble to cents is chosen by us, not measured."

**Honest risk.** A hand's wobble is random scatter, and the page's neighbour says no real material behaves that way (`The Curve Is the Material.md:54`: "No physical material behaves this way"). So the hook teaches the flat line well and teaches materials badly unless the "let a string try" beat lands right after. Second risk: the cents-per-pixel scale decides whether your line sounds like a shimmer or a mess, and that is a taste call to be made by ear, which I can't. Third: without the Martin grid and the "you can't" challenge, this collapses back into a draw-a-curve panel, which is a chart.

### B. The rope

**In a sentence:** "A tone is a rope of thirty-two strands. Pull on it and watch where it frays, then pull until it tears."

**The crossing.** The page's own picture of unison met the frustration findings next door.
- `Projects/Inharmonic Wavetable Synthesis.md:180`: "The bundle braids tightly at the left and fans outward at the right."
- `Harmonicity and Inharmonicity.md:39`: partials are "rigidly enslaved to one degree of freedom."
- `Harmonicity and Inharmonicity.md:57-59`: "frozen → alive → edge → torn → released"; "The top partials set the edge"; "Few voices snap; many fray."
- `Projects/Inharmonic Wavetable Synthesis.md:218`: "the bend fights the pull."

Braid, fan, fray, snap, tear: both pages were already describing a rope without naming it. That is read, not invented; the word "rope" is mine.

**First five seconds.** A taut rope across the screen, humming one warm note. You grab its right end and pull down. The strands at the far end separate first and the tone starts to shimmer. Keep pulling: the fray runs leftward toward your hand, then the rope lets go, strands spring apart, and the one note breaks into several. Let go and it winds back. A second grip, offered later, is how hard the strands hold each other (coupling).

**Hook or proof?** It stands in front. Behind it sit the two pieces that hold the real measurements: "the bundle of lines" (strands as unison voices) and the gathered coupling-edge study (`Projects/Inharmonic Wavetable Synthesis/coupling-edge/coupling-edge-instrument.html`), whose worklet already runs the tear live, so the sound engine need not be written again (`coupling-edge/README.md:5`).

**Loudon's note.** Partly. Strands visibly leave their places, which is the motion he wants to see. It does not fix the spectrum panel in "bend the line."

**Caption a stranger needs:** "Each strand is one partial of the tone. Pulling stretches them away from whole-number spacing. The rope holds while the strands can still agree on one pitch. This is a toy model of a bowed or sung tone; a plucked string or a struck bell does not tear this way."

**Honest risk.** The largest of the three. The rope fuses two different things: unison voices spread along τ_B, and one tone's partials held by one phase. It has to pick one (I would pick the second) or it misleads. The page's braid-and-fan sentence is itself under an open correction: the fan follows the curve's height, not its slope, and measured strings barely fan at all (`… — rich.json:405`, `:411`). The tear applies only to self-sustained tones (`Harmonicity and Inharmonicity.md:51`) and the model is a toy ("trust the shapes, not the values", `Projects/Inharmonic Wavetable Synthesis.md:218`). A drawn rope with physics that looks right is also the most expensive of the three to build, and the easiest to turn into decoration.

### C. The wrong ladder

**In a sentence:** "Climb a ladder one rung at a time and you hear a bugle call; swap the ladder for a bell's and the same climb comes out bent."

**The crossing.** The relation label on the ring did the work here.
- Ring, line 21: `Rational Hearing  connects-to  Inharmonic Wavetable Synthesis  (the-flat-line-is-this-ladder)`.
- `Projects/Rational Hearing.md:83`: "this page is the flat line, played."
- `Projects/Rational Hearing.md:64`: "'Climb the series' adds one every 0.7 s."
- `Auditory Illusions.md:65`: pitch is "a pattern the brain reads, the period the harmonics share."
- `Projects/Inharmonic Wavetable Synthesis.md:267`: "The instrument's physics implies its scale."

Rational Hearing already built the ladder of evenly placed rungs and a way to climb it. This page is what happens when a material moves the rungs.

**First five seconds.** Two ladders side by side. The left one is drawn in faint pencil with even rungs. The right one is solid and belongs to a material you pick: piano string, bell, marimba bar, singing bowl, all from the measured library in `Projects/Inharmonic Wavetable Synthesis/trajectory-library/`. Press climb. A small figure goes up both at once, one rung every 0.7 s, and each rung sounds as it is stepped on, the pencil ladder in one ear and the material's in the other (or alternating). On the string the two climbers stay together for a while and then one pulls ahead. On the bell they part on the second rung. At the top, all rungs sound together: the pencil ladder is one note, the bell's is a clang.

**Hook or proof?** It stands in front, but it is close to a proof: the rung positions are the measured curves that step 5 of "bend the line" already holds (`… — rich — bend the line.html:130`). "Bend the line" then follows as "now move the rungs yourself."

**Loudon's note.** Answers it by a different route: the ghost ladder is the harmonic series held still, and the solid rungs sit off it. Hearing partials one at a time also makes their movement audible, which a chord can hide. That last claim is my inference from general psychoacoustics, not something measured in the palace.

**Caption a stranger needs:** "Each rung is one partial. The pencil ladder is the harmonic series. The solid ladder is where this object's partials were measured. Bell and bar modes are filed by rank, the k-th mode on rung k; that filing is a choice."

**Honest risk.** It is the nearest of the three to "a nicer chart": two columns of lines with a figure on them. What saves it, if anything, is the climb in time and the two-ear comparison, and I can't judge by ear whether a few cents on a low piano string is audible rung by rung. The measured A2 string is only 28 cents sharp at partial 20 (`… — rich.json:399`), so the piano ladder may look and sound almost straight, which is true and may read as a dud next to the bell. The filing question for bells (rank or nearest, `Inharmonic Wavetable Synthesis — Context.md:32`) changes which rung is which and must be said on the face.

## 3. The one I would make

The ruled line, because it is the page's own forward vector turned into a dare, it is already half built as step 4 of the existing walk, and it answers Loudon's note in the same stroke.

## 4. For the next maker

- Loudon's note has a plain cause in the code, and the fix is separable from any hook. In `… — rich — bend the line.html:437` the bright yellow bars are drawn only at the harmonic positions, with height taken from the energy at that bin; energy off the grid is a thin orange trace (`:435-436`). So the yellow bars can never move, only shrink, which is exactly the "filter moving over stable harmonics" he saw. The piece already knows each partial's true ratio (`cur.rat`, `:426`), so yellow bars can be drawn there with the grid as ghosts.
- On this page the measurements have overtaken the prose: the "settling piano" is a designed gesture and bells are not Bessel (`Inharmonic Wavetable Synthesis — Context.md:30`, `… — rich.json:393`, `:417`). A hook built from the page's sentences instead of its library would be vivid and wrong. More generally, the two best finds here came from a relation label and a person page, not from the DSP neighbours, which mostly offered more charts.

---

## Latent

*Agent `ad4a8ff542f6bb071`, 2026-11-10; taken from its handback.*

Hook search for the rich face of Inharmonic Wavetable Synthesis, by the latent method. Read-only; nothing written. I could not run, see or hear any piece, so every claim about how a hook would feel or sound is inferred. I did not summon the Concierge: I have no spawn tool, and nothing here reaches the house.

## 1. The harvest

- **Verbs.** The prose describes something held under tension that wants to go back: bow, bend, relax, settle, tug, pull, grip, hold, tear, "goes home". The partials are written as creatures with an address: they "walk off" the grid, "leave" it, are "filed" in "slots". A third, quieter verb is "wearing": the organ wears a piano, a chord wears a bell.
- **Body.** An arm holding a green branch or a drawn bow, and a fingertip on a taut line, which is the hero image: a woman touching a horizontal line, ink rising and dripping where it is disturbed, the line thin and straight beyond her finger.
- **The assumed seat.** An analyst's bench. The reader has read Three Kinds of Warp, knows what an FFT and a cent are, wants to verify, and looks before listening. Their hand is for "next step" and "play"; drawing arrives at step four of five. The bend stays where you put it, which is the opposite of what the verbs say.

Where the verbs are:
- `/Users/loudonstearns/Documents/The Palace/Projects/Inharmonic Wavetable Synthesis.md`: "upward-bowing curve" (94), "the curve relaxing toward the flat harmonic baseline" (96), "each voice tugs the shared phase", "stops holding and tears" (218), "gripped by whichever voice is nearest" (221).
- `/Users/loudonstearns/Documents/The Palace/Projects/Inharmonic Wavetable Synthesis/Inharmonic Wavetable Synthesis — rich — bend the line.html`: "At D = 0 every line goes home" (227), "That one line leaves the grid" (226). The seat is at 97 (opens on Three Kinds of Warp), 114 and 118 (a dB spectrum with an energy readout), 127–128 (play, next step).
- `/Users/loudonstearns/Documents/The Palace/Projects/Inharmonic Wavetable Synthesis/Inharmonic Wavetable Synthesis — rich.json`: "the peaks walk off it" (52), "each wearing June's designed piano trajectory" (123), "wearing the measured Brooklyn bell" (355).

## 2. Hook ideas

### A. Hold it bent

- **What a person would say.** "It only stays wrong while I hold it. Let go and it snaps back into one note."
- **Where it was hiding.**
  - The verbs above. The face lets a bend sit still, but the prose says "relaxing", "settling" and "goes home".
  - The hero's fingertip on the line, and the forward vector: "putting a horizontal line in front of you and showing you what happens when you bend it" (page, 58).
  - The spring comes from an unlinked rhyme. `/Users/loudonstearns/Documents/The Palace/Projects/Portamento and Physical Pitch Modeling.md` line 39 has the overshoot and ring-back, and line 53 has "a family of coupled glides". The missing link (my inference): this page's partials go home instantly, and that page says nothing arrives instantly.
- **First five seconds.**
  - A taut line with 32 faint posts on it, one per harmonic.
  - Touch it and a clear tone starts.
  - Pull, and the line bows under the finger, stiffer the further you go. Bright dots leave their posts and the tone turns to struck metal, beating.
  - Let go. The dots fly back, overshoot, ring and settle, and the tone twangs into focus.
- **Loudon's open note.** This carries it: the posts are his ghosted columns, and the bright partials are the things that move.
- **Second beat.** Choose "real piano string" and let go. It does not come home. That is the measured finding (Context, 30: "After the attack the bend holds still").
- **Hook or proof.** It stands in front of the proof and sets up "two ways to settle".
- **Caption.** "Each dot is one overtone. Each post is where it sits in a perfectly harmonic tone. Pull the line and the overtones leave their posts. The spring back is our toy. A real piano string never lets go."
- **Risk.**
  - The spring-home is the page's own disproven gesture, so without the second beat the hook teaches the wrong physics.
  - It sits near round one's "ruled line": both put a finger on a line. This one is about tension and release, not wobble.
  - It is still a graph you drag.

### B. Find it in the dark

- **What a person would say.** "I couldn't see anything. I just dragged until the clang turned into a note."
- **Where it was hiding.**
  - Page, 142: "You cannot look at the flat horizontal line and miss its meaning". That sentence assumes eyes.
  - rich.json, 185, on the plugin: "The centre screen, where the glowing line is meant to be, is still dark."
  - `/Users/loudonstearns/Documents/The Palace/Latent Error.md` line 112: "you've assumed vision".
- **First five seconds.**
  - A black panel and a rough, shimmering clang.
  - Drag sideways. It gets rougher one way and calmer the other.
  - Hunt for the place where the beating stops and the cloud fuses into one pitch. Stop there.
  - The screen lights and shows what you found by ear: a flat line, or how far off you landed, in cents.
- **Hook or proof.** The hook is the proof. It tests whether harmony can be heard as a place. It also puts the page's first open question (299, the threshold below which a bend is inaudible) to the reader's own ear.
- **Caption.** "This sound is 32 overtones knocked out of place. Drag until it sounds like one note. Then we'll show you what you did."
- **Risk.**
  - One axis in the dark is a fader with the chart removed.
  - Whether fusion is easy to find by ear I cannot tell.
  - A string-sized bend of a few cents may be unfindable. That would be an honest result, but a flat first experience.

### C. Coats

- **What a person would say.** "Same chord, and I just put a bell on it."
- **Where it was hiding.**
  - The captions' unnoticed verb "wearing" (rich.json, 123 and 355).
  - The bundle file `trajectory-library/05-organ-wears-the-keyboard.wav`.
  - Page, 239: "Every combination is a new instrument."
- **First five seconds.**
  - A plain organ chord is already sounding.
  - A rail of coats hangs beside it, each a measured curve from the trajectory library: piano, bell, vibraphone, marimba, bowl.
  - Drag one onto the chord. The colour stays and the bones change.
  - Pull it half off for half the bend.
- **Hook or proof.** It stands in front of the proof.
- **Caption.** "The chord's colour is one table. The coat is another: where each overtone sits, measured from a real object."
- **Risk.** It is a preset menu in costume, and the weakest of the three. The measured piano coats sit a few cents off the line and may sound like nothing. Only the bell and bowl would land.

## 3. Which I would make

**A, Hold it bent.** It makes sound on first touch whatever the listener's ear, it answers Loudon's open note directly, and its second beat hands the reader straight to the face's best test. B is the stranger idea and the cheaper to build, if he wants one further from a chart.

## 4. On the method

- **What it found that neighbors would not.** The verb harvest and the assumed seat did the work. The face contradicts its own prose: the words say the bend wants to return, and the piece lets it sit. The eyes-first assumption only shows when you read the face as a failure report.
- **A diagnosis from the Shepard rhyme.** Loudon's misreading, stable harmonics with a filter moving over them, is almost word for word how a Shepard tone works (`/Users/loudonstearns/Documents/The Palace/Projects/Shepard Tone Synthesizer.md`, 67), so the spectrum is drawing the wrong instrument. That gave no hook. I did not read the spectrum's drawing code, so how the peaks render is unconfirmed.
- **Where it wasted time.** The Context and the challenge file are nearly all numbers and gave one image between them. The hero only repeated the forward vector's gesture. The top of the rhymes list is close kin, not surprise.

---

## Random room

*Agent `aa28edbcd9bccd86d`, 2026-11-10; taken from its handback.*

# Hook ideas for Inharmonic Wavetable Synthesis — the oblique draw

Read-only; nothing written. I could not run, see or hear any piece; every sound described below is predicted, not heard. I had no tool to summon the Concierge, so I went straight to the job.

**What the reader meets today** (`/Users/loudonstearns/Documents/The Palace/Projects/Inharmonic Wavetable Synthesis/Inharmonic Wavetable Synthesis — rich.json`): three made pieces, each "a walk in five steps" with back / play / next buttons (`… — rich — bend the line.html:126-128`, and the same in the other two), beside gathered renders, plots and two steward studies. Every made piece opens on a measurement (rich.json:44, 116, 240). None opens on anything outside the technical.

## 1. The three rooms

**The Drift** (`/Users/loudonstearns/Documents/The Palace/The Drift.md`) — crossed, twice.
- "The self is not built. It is what happens when you stop building" (The Drift.md:55), and its instrument question, "whether an instrument can be designed for drift rather than control" (:44). On my page the hand always bends the line. The Drift turns the hand over: the straight line is what you hold, and the bend is what the material does when you stop.
- "the cook whose blade never dulls because it follows the gaps" (:59). My page says a timbre's physics implies its scale (Inharmonic Wavetable Synthesis.md:267) and that bell chords put consonance in the wrong places (:124). The gaps are the scale; a blade is a way to find them by feel.

**2D Torus Wavetable Synthesizer** (`/Users/loudonstearns/Documents/The Palace/Projects/2D Torus Wavetable Synthesizer.md`) — crossed, but inside the cluster. "Rational ratio: the scan path closes… Irrational ratio: … it never closes, and over time it covers the torus densely" (:82-83). A harmonic tone is a shape that comes back to its start every cycle; bend one partial and the shape stops closing.

**Action Potential Oscillator** (`/Users/loudonstearns/Documents/The Palace/Projects/Action Potential Oscillator.md`) — nothing. Two rhymes, neither a hook. "A homogeneous population locks to a trivial state; a heterogeneous population diversifies" (:117) gives one voice becoming a crowd, which is the first round's rope again. "Spike duration is fixed in biology; at high oscillator frequencies it occupies increasing fractions of the cycle" (:53) rhymes with stiffness biting harder the higher the partial, but it is a sentence, not something a hand does. I stopped there rather than force it.

## 2. Hook ideas

### A. The cook's blade
- **What a person would say:** "Drag the knife up through the note — it grinds where it hits bone and slides where there's a gap, and when I swapped the string for a bell the gaps moved."
- **Crossing:** Zhuangzi's cook (The Drift.md:59) meets the page's Philosophy pillar, "the instrument's physics implies its scale" (IWS.md:267).
- **First five seconds:** A held tone hangs on screen as a column of bright joints, its partials. Your pointer is a blade, a second note of the same timbre. Drag it upward. Where the two sets of partials nearly collide, the blade shudders, throws sparks, and the sound is a rough buzz. Where they line up or clear each other, it drops through clean and the sound goes still. On the flat line the clean places are the octave, the fifth, the fourth. One tap changes the carcass to the measured bell, and the fifth now grinds.
- **Hook or proof:** The hook is the proof. It tests a claim that no piece on the face tests today; the manifest has no section for the lesson design at all.
- **Caption:** "The blade is a second note. It grinds where its overtones nearly collide with the held note's and slips where they meet or miss. Those slips are the intervals that sound good on this material. Change the material and they move."
- **Honest risk:** The grind has to be real beating between two sounding tones, not a drawn effect, and I cannot hear whether the slips are sharp enough to feel as gaps. With few partials they may be mushy. A computed roughness score behind the sparks would be a model (Sethares's, from my own knowledge, not read in the palace), and must be labelled as one. The measured bell is filed by rank (rich.json:79), which affects which gaps appear.
- **Would the ring have caught it?** The physics, yes: Harmonicity and Inharmonicity is a one-hop neighbor and Cycle 5 Explorer is tied "scale-from-the-spectrum-vs-scale-from-the-line" (ring file line 18). I did not open either. A ring walk would most likely have delivered it as a dissonance curve, a chart. The blade and the delight in following gaps came from The Drift. The ring file's two-hop list is cut off after "Dissolutions", so I cannot say whether The Drift is in it; Deleuze is, so The Drift is at most three hops out.

### B. Let go
- **What a person would say:** "I thought I'd be bending it. Turns out I was the one holding it straight."
- **Crossing:** "It is what happens when you stop building" (The Drift.md:55) and "forcing vs letting" (:36, :81), against the page's own measured correction: a real string's bend holds steady, and settling to flat "is a designed gesture no string makes" (rich.json:393).
- **First five seconds:** Press and hold anywhere. A taut glowing line is pinned flat under your finger and a clean, organ-plain tone sounds. Lift. The right end of the line springs up into the material's own curve and the tone turns glassy or clangs. Press again and it is pulled straight. Pick piano wire, bell or bowl; each rests in a different shape.
- **Hook or proof:** It stands in front of "bend the line", and sets up the claim-change waiting in the manifest: flat is the held state, not where a material rests.
- **Caption:** "Hold, and every overtone is pulled onto the even ladder. Let go, and each goes where this material puts it. The straight line is something you hold, not something a string settles to."
- **Honest risk:** On the measured piano the release may be nearly inaudible; the heard bend at A2 is about two cents (rich.json:116). The bell will be dramatic, but under rank filing the "held" bell is a different note, so the release is a big lurch. The tempting gloss that holding is bowing is only true for bowed strings and winds, and is my inference, not the palace's; the caption should say holding is the synth's depth at zero. Underneath, it is the depth knob with the gesture turned over, so it must not grow a fader. It also sits near the first round's ruled line: both say straightness takes effort. Here the shape that appears is the material's, not the hand's wobble.
- **Would the ring have caught it?** No. Every ring neighbor treats the flat line as home and bending as the act. The reversal came from the Drift's refusal of cultivation.

### C. The shape that won't come home
- **What a person would say:** "It drew the same knot over and over until I nudged one overtone. Then it never landed on itself again."
- **Crossing:** the closed cable curve against the path that never closes (2D Torus Wavetable Synthesizer.md:82-83), and step one of the existing piece, where a one-cycle table can only put energy on the harmonic lines (rich.json:44).
- **First five seconds:** A bright thread winds round a ring, drawing one cycle of the tone as a closed figure, retraced exactly each turn. Pull one bead, a partial, off its place. The figure stops closing; each turn lands a little off the last, and the thread smears into a slowly turning band. You hear a slow shimmer.
- **Hook or proof:** The hook is the proof, in picture form, of what "bend the line" measures in its first two steps.
- **Caption:** "A harmonic tone repeats exactly, so its shape closes. Move one overtone off the ladder and it never repeats. The smear is that overtone drifting against the rest."
- **Honest risk:** It is close to an oscilloscope. If the thread reads as a scope trace it is a chart with one fader, the very thing to suspect. One bent partial may give a wobble too slow to hear in five seconds. It could be read as claiming a torus on a page that has none.
- **Would the ring have caught it?** Yes. The Torus is a one-hop neighbor (ring line 4), and so is Wavetable Space as Torus (line 24). The first round did not report it, but that is a miss in the walk, not something chance earned.

## 3. Which I would make

The cook's blade: it is the only one where the hand meets resistance, it proves a claim the face leaves untested, and its image is the palace's own. Let go is the cheaper build and would make a good five-second opener in front of "bend the line" if the blade proves too much for one round.

## 4. On the method

Chance gave a philosopher's room to a dry instrument page, and both strong finds came from it, including a reversal (the flat line as the held thing) that the ring's physics pages argue against by habit. One draw landed on a direct neighbor and one two hops out inside the same synthesis cluster; the neighbor gave a find the ring already owned and the other gave nothing new, so two of three tickets were spent inside the cluster, the same waste Swarm Weave's first oblique run recorded (`/Users/loudonstearns/Documents/The Palace/Projects/Swarm Weave.md:290-291`). A draw forced across the tool/philosophy seam, its Bridge lens (:294-296), would likely have paid on all three.

---

## An artist visits

*Agent `a0856aa9717fde6ba`, 2026-11-10; taken from its handback.*

# Eno and Cage visit the face of Inharmonic Wavetable Synthesis

Read-only; nothing written. Two things to know first. I could not summon the Concierge (no spawn tool in this dispatch). And I did not run, see or hear any piece: everything about the present face is read from source and manifest, and everything about how a hook would sound is a guess.

**What the face is today (read).** It opens on "Bend the flat line", a five-step walk with back / play / next. The first thing a reader meets is a paragraph about Three Kinds of Warp and a spectrum labelled "the grid lines are the harmonic series" (`/Users/loudonstearns/Documents/The Palace/Projects/Inharmonic Wavetable Synthesis/Inharmonic Wavetable Synthesis — rich — bend the line.html`:96-97, 114, 126-128). The other two made pieces are also "a walk in five steps" (`… — rich.json`:115, 239). By Loudon's test the face has no hook: it starts on the proof. I took his open note on the spectrum from your brief; I did not find it in a file.

Neither artist is linked from the page (frontmatter, `Projects/Inharmonic Wavetable Synthesis.md`:16-57), so nothing below could have come from the map neighbours.

---

## 1. Each visitor's question, turned on this face

**Eno.** The face is three results, each walked in five fixed steps. What if it opened as a room already running under one rule, and the reader came to the steps only after it had surprised them? (`/Users/loudonstearns/Documents/The Palace/People/Brian Eno.md`:80, "What if you designed the rules instead of the result"; :76, "He'd rather make a room than a song.")

**Cage.** Whose choice is the flat line, yours or the string's? The face calls zero home ("at depth 0 every line goes home", `… — rich.json`:44), but its own measurements say no string or bell lives there. (`/Users/loudonstearns/Documents/The Palace/People/John Cage.md`:72, "Whose choice is this — yours, or the thing's?"; :66, "how little of me can be in this?")

---

## 2. The hooks

### Eno — "Loops that never come round"

**What a person would say:** "It's the same few loops; I made them slightly the wrong lengths and now it never repeats."

**The move that made it:** `People/Brian Eno.md`:74 — "*Music for Airports* is tape loops of different lengths drifting out of phase — he set the lengths, the room made the piece."

**The idea (inferred, mine, not on any page):** a partial is a loop. On the flat line every loop's length divides the first one's, so the whole pattern comes round together every lap, forever. Bend one off the line and its loop no longer fits; it slips against the others and the pattern never returns. Slowed far down, an inharmonic tone is Music for Airports. Sped back up, the slipping is the bell.

**First five seconds:** the room is already running, slowed so each partial is a soft note that sounds once per lap of its own loop. You see ghost columns at 1, 2, 3 … with a bright column standing on each, flashing as its loop comes round. Flat, they flash in a strict lattice, like a music box. The hand drags one thing, the bend. The bright columns slide right, off their ghosts, and the flashes stop lining up. The second control is speed: wind it up and the rhythm becomes a tone.

**Hook or proof:** it stands in front, and the speed dial is the bridge. At full speed it is the same sine bank the first walk measures.

**Loudon's note:** answered. The ghosts never move and nothing sweeps over them; only the bright partials leave.

**Caption a stranger needs:** "Each light is one partial, slowed down until you can count it. On the grey columns they all come round together. Off them, they never do. Speed it up and that is what a bell is."

**Honest risk:**
- At piano-sized bends nothing happens in five seconds. A partial 30 cents sharp runs about 1.7 % fast and needs roughly 57 laps to slip one whole lap (my arithmetic). The room only moves quickly at bell-sized bends, so it would have to open on the measured bell (modes 1, 1.135, 1.451, 2.178, `… — rich — challenge.md`:31) or an exaggerated curve, and say so.
- "As ignorable as it is interesting" (`Brian Eno.md`:76) is close to the opposite of a hook. A room may be pleasant and not grab.
- His blind spot: "'the system did it' quietly credits the system for *his* selecting" (`Brian Eno.md`:84). Which loops, which pitches, what speed, which bell are all the maker's taste, and that is why it will sound good. The face should name those choices, not say the rule made the music.

### Cage — "Throw the screws in"

**What a person would say:** "I threw six coins at an organ note and got a gong I'd never have picked."

**The moves that made it:** `People/John Cage.md`:62 — "he laid screws and bolts and weather-stripping between the strings of a piano and found the *prepared piano* — a whole gamelan hiding inside one instrument." And :66 — "throw the coins, consult the *I Ching*, accept the result without editing." The page already has the slot for it: "A random scatter pattern gives stochastic inharmonicity" (`Inharmonic Wavetable Synthesis.md`:94).

**First five seconds:** one plain held tone, bright columns standing on their ghosts. One control: throw. Screws fall across the columns. Each one that lands knocks its bright partial off its ghost by an amount the coins chose, and the tone turns into a gong, a pot lid, a small gamelan. There is no slider and no undo. You can only throw again or lift them all out.

**What he would refuse:** the words "wrong" and "home", and the readout that scores zero as the good answer. His page gives him the standing: Schoenberg told him harmony "would be a wall he could never pass through", and "he went around it instead" (`John Cage.md`:60). This page asks "What is harmony? A flat line" (`Inharmonic Wavetable Synthesis.md`:261). He is the visitor who never lived on that line. "No silence" (`John Cage.md`:66) asks the same of zero: is there anything between the lines when the readout says nothing? The face measured the rebuilt table at 2 × 10⁻¹³ (`… — rich.json`:44), which is small but not nothing. He would show it.

**Hook or proof:** mostly in front. It can become a proof with one honest addition (inferred): keep every throw, and lay the measured bell and bowl beside them. Do the coins ever throw a bell? Probably not, and that is the page's claim that a material's curve is not noise, tested by chance.

**Loudon's note:** answered most directly of the three. The ghost columns are the idea of harmony; the bright ones are the thing, visibly knocked off them by something that landed.

**Caption a stranger needs:** "The grey columns are where a perfect string's overtones would sit. Each screw pushes one overtone off its column. The coins chose where. Nobody tuned this."

**Honest risk:**
- Unedited chance means the first throw may be mush, and the first five seconds are not guaranteed.
- A real screw also damps, buzzes and splits a string. This one only moves pitch. Say that on the face.
- I joined two periods of his work: the preparations were chosen by ear, and the coins came later (`John Cage.md`:86, "the same man with his ego in, then out"). The join is mine.
- His blind spot: "'no intention' became his most fiercely held intention" (`John Cage.md`:76). How far a screw can push, and how many fall, is the maker's taste hidden in the dice. And a face where every throw is equally music "has quietly surrendered the ability to say why one piece is better than another", which is hard on a page whose point is that a piano is one curve and a bell another.

### Third — "Leave it" (the difference dissolves, partly)

**What a person would say:** "It kept changing until I said stop, and what I stopped on turned out to be nearest a marimba."

**Where it comes from:** the third meeting's yield, in the coordinator's words: "*a person willing to stop* … *in a room that trusts*", and "evasion is the refusal to stop" (`/Users/loudonstearns/Documents/The Palace/Modes of Collaboration/Dialectic/Dialectic — dialectic — eno-cage-walk-into-lateral-access.md`:84). Those voices were cast by the palace. I take the finding, not the lines, as Eno's.

**First five seconds:** one press to start the sound. Then the bright partials wander off their ghost columns by themselves, a slow chance walk, and the tone goes from organ toward metal. The hand does one thing, once: stop. The line freezes. That frozen line is a frame of Wavetable B, and the face says which measured material in the library it sits nearest and how far away, or that nothing in the library is near. "Let go" sends every partial home, which is the existing walk's step 4.

**Hook or proof:** the hook hands the proof its material. The walks below would run on the line you stopped on.

**Loudon's note:** answered, the same picture as Cage's.

**Caption a stranger needs:** "The overtones are drifting off their columns by chance. Stop when you like what you hear. That shape is the instrument."

**Honest risk:** a drift slow enough to choose from is too slow to grab in five seconds; fast enough to grab is hard to stop on. It carries both blind spots at once: the maker's taste sets the walk's speed and range, and the reader's "nearest material" is a ranking chance cannot justify. It is also the least playful of the three. It is a wait, not a throw.

---

## 3. Where they disagree, and which side I would build on

Eno would choose the frame so the first five seconds sound good: taste in the loops, chance only in how they drift. Cage would refuse to choose and let the first throw be ugly: chance in the sound, taste hidden in how far the dice may reach. One says the face must sound good or no one stays; the other says "sounds good" is the flat line again.

I would build on Cage's. The hand acts in the first second, the picture is the one Loudon asked for, and the prepared piano is a real thing a stranger can imagine. Eno's loops is the better second piece: it explains why a bent tone never repeats, which the throw cannot.

---

## 4. On the method

**What it found:** things that are in the visitors' lives and not in the page's neighbourhood. The prepared piano as a physical Wavetable B. The man told harmony was a wall, set in front of a page that calls harmony a line. Tape loops as partials, which gives a reason, not only an image. The "Where he can't see" sections were worth more than the questions; each one turned straight into a line the face should print about what the maker chose.

**Where it wasted time:** the Lateral Access walk is about memory and trust and gave one usable thing, the stop. The mode's voice-act step is closed for a living man, so Eno's visit was thinner than Cage's. Both are sound-process artists, so all three hooks are "start it and listen": the method gave procedures, not pictures, and may compare poorly with the first round on image.

Files read: `/Users/loudonstearns/Documents/The Palace/Enrichment/Enrichment — scroll.md` (Standing Orders, :47-49), `/Users/loudonstearns/Documents/The Palace/Enrichment.md`:80, `/Users/loudonstearns/Documents/The Palace/Palace development/Pheromone Trail/proofs/2026-11-09-ants-on-topology/src.html`:64-110, `/Users/loudonstearns/Documents/The Palace/Modes of Collaboration/Philosopher Visits the Entry.md`, and the page, manifest, challenge and person pages cited above. `Modes of Collaboration.md` § Sharpen or dissolve I read as loaded in my birth context.
