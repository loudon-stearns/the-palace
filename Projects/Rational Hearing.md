---
title: "Rational Hearing"
type: project
status: active
pillars: [creation, tools, philosophy, practice]
born: 2026-10
stage: sprout
confidence: working
energy: high
hook_quality: 9
who_leads: loudon
links:
  - target: "[[FOUR PILLARS]]"
    type: exemplifies
    label: learned-through-music-tech
  - target: "[[Hilaritas Generator]]"
    type: exemplifies
    label: four-primitives-checked
  - target: "[[Drafting Table Design System]]"
    type: connects-to
    label: dress
  - target: "[[Harmonicity and Inharmonicity]]"
    type: connects-to
    label: consonance-heard
  - target: "[[Inharmonic Wavetable Synthesis]]"
    type: connects-to
    label: the-flat-line-is-this-ladder
  - target: "[[DSP in Looping Dimensions]]"
    type: connects-to
    label: rational-ratios-lock
  - target: "[[Frequency-Time Duality]]"
    type: connects-to
    label: the-rhythm-of-a-fifth
  - target: "[[Kuramoto Coupling]]"
    type: connects-to
    label: consonance-as-coherence
  - target: "[[Portamento and Physical Pitch Modeling]]"
    type: connects-to
    label: sibling-ear-set
  - target: "[[Cycle 5 Explorer]]"
    type: connects-to
    label: sibling-teaching-page
forward_vector: "I am page one of a lecture, the sheet Loudon keeps up on the projector while he talks and students write on printed copies of me, and I want to be played, not read: tap a partial and hear it, tap an edge of my ladder and hear the ratio the handout only drew. I want to survive the projector test from the back row and the print test with a pen in the margin, and I want my later pages, the seventh harmonic, the tritone's several faces, the cents lecture, to grow from me only once Loudon has taught from me and said what landed."
---

# Rational Hearing

![[Rational Hearing — hero.png]]

> musical intervals are ratios

Loudon's one-page teaching handout on intervals as whole-number ratios, limited to **5-limit** harmony (primes 2, 3, 5), rebuilt as a page you can play. It is a lecture backdrop: it stays up across a few lectures while students take notes on printed copies, and Loudon supplies the explanation out loud. So it gives him anchors to point at and sound, not paragraphs to read.

![[rational-hearing-handout-v1.jpeg]]

## The idea in one breath

Every interval is already inside a single note. Neighbouring partials of the harmonic series give the intervals in order of consonance: 2:1 the octave, 3:2 the fifth, 4:3 the fourth, 5:4 and 6:5 the thirds, and on up to 16:15. The same ratio can be seen as multiples of a frequency, as divisions of a string, as fractions of a tube, and as harmonics in a spectrum. Equal temperament divides the octave into twelve equal ratios, so it misses every one of these except the octave. The printed sheet shows that miss as the small offset between each ratio bar and its piano key; the page draws the offset to scale and lets you hear it.

## The page

`Projects/Rational Hearing/rational-hearing.html`, one file, no build. Three interactions, all from the handout's layout:

- **The ladder is live.** The handout's zigzag of partials 1, 2, 3, 4, 5, 6, 8, 9, 15, 16. Tap a number to switch that partial on in a sixteen-sine drone; tap an edge label (`P5`, `-3`, `M7`) to hear just that pair, and the edge lights. The readout gives the reduced ratio in big numerals, the interval's name and class, `n × f = Hz` for each partial, and the size in cents. The spectrum under it is the same sixteen partials as bars at 1/√n. "Climb the series" adds one every 0.7 s.
- **One ratio, two bodies.** Any interval chip animates a string vibrating in p and q loops beside two tubes 1/p and 1/q of a full length, both moving at their true ratio, slowed so the fundamental takes 2.4 s per cycle.
- **Just against equal.** The handout's bottom row: solid bars at the just ratio, dashed lines at the twelve equal steps, the deviation in cents under each. Magnify ×5 for the back of the room. Tapping a column plays the just dyad, then the tempered one.

Loudon's notation holds throughout: `U` unison · `-2` 16/15 · `M2` 9/8 · `-3` 6/5 · `M3` 5/4 · `P4` 4/3 · `T.T.` 64/45 · `P5` 3/2 · `-6` 8/5 · `M6` 5/3 · `-7` 16/9 · `M7` 15/8 · `0` octave 2/1. Consonance groups as on the sheet: **Perfect** 0 P5 P4 · **Imperfect** M6 M3 -3 -6 · **Dissonant** M2 M7 -7 -2.

The page wears the [[Drafting Table Design System]]: Paper by default, since it is a lecture sheet and a printed handout, Phosphor by a button for a dark projection room. The consonance classes borrow the drafter's provenance scale (Perfect in DESIGN ink, Imperfect in DATASHEET blue, Dissonant in ASSUMED amber); the piano's twelve steps are drawn in DATASHEET blue because they are read from the instrument, not chosen; the one red thing is what is sounding. A Projector button enlarges the numerals and hides the ledes; the print stylesheet drops the controls and leaves a ruled column on the right for notes. The two typos on the printed v1 ("Intervas", "temperment") are fixed in the page text.

## Pillars

- **Creation:** hearing the ratio. Toggle partials, solo a pair, climb the series.
- **Tools:** Web Audio additive drone, canvas standing waves, an SVG ladder, and the dress itself.
- **Philosophy:** the Pythagorean thread, where number becomes sound; consonance as simplicity of ratio; temperament as a deliberate compromise.
- **Practice:** a page Loudon teaches *from*, across several lectures, with students writing on paper copies.

Held against [[Hilaritas Generator]]'s four primitives: a real thing to make (the drone you build partial by partial, which can sound ugly), a tool that extends (hearing a 15:16 you could never sing), a cross-domain moment (one ratio as string, tube and spectrum), and a reflecting surface (the printed margin, and the question after class). The fourth is the thinnest; it is Loudon's to ask.

## Neighbours

The palace had no page on just intonation, the harmonic series or interval hearing before this one, so its neighbours are the pages that assume the harmonic series and stretch away from it. [[Harmonicity and Inharmonicity]] asks whether perceived consonance is literally the absence of coupling frustration; this page is where a student hears consonance at all. [[Inharmonic Wavetable Synthesis]] draws the harmonic series as the flat line every physical material deviates from, and carries Sethares' point that an instrument's physics implies its scale; this page is the flat line, played. [[DSP in Looping Dimensions]] says loops at rational ratios phase-lock to a harmonic series, which is the same arithmetic in a different body. [[Frequency-Time Duality]] answers Loudon's question "what is the rhythm of a perfect fifth?" with three against two; that is 3:2 slowed below 20 Hz. [[Kuramoto Coupling]] is the palace's own reading of why simple ratios lock. [[Portamento and Physical Pitch Modeling]] keeps the palace's one other ear-training set. [[Cycle 5 Explorer]] is the sibling teaching page, built in parallel.

## Threads for later pages

Page one only. Held back on purpose, and in the handout's own order:

- The 7th harmonic, skipped silently between 6 and 8 on the ladder: 7/4 is about 31 ¢ below the ET minor seventh, the note the piano cannot play. It opens 7-limit and microtonal material. Frame "7-limit in raga practice" as one interpretation; the classic 22-shruti tables are usually given as 5-limit and scholars debate the point.
- The tritone's several just forms (64/45, 45/32, 7/5). On the sheet it sits in the table but not on the ladder.
- The cents-deviation lecture.

## Forward Vectors

*See YAML `forward_vector`.*

Open: the projector test from the back row, the print test with a pen, and whether the just-vs-equal A/B playback stays on page one or moves to the cents lecture. The open items in full are on the scroll; what the entry left out, the math table and the design tensions, is in [[Rational Hearing — Context]].
