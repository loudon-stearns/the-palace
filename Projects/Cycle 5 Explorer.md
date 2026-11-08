---
title: "Cycle 5 Explorer"
type: project
status: active
pillars: [creation, tools, philosophy, practice]
born: 2026-10
stage: sprout
confidence: working
energy: high
hook_quality: 8
beauty: 7
who_leads: loudon
forward_vector: "I am a decoder ring for harmony, and I want to be the page Loudon pulls up when he teaches it and the page a student keeps afterward. I want every panel on me to be seen as one thing, a seven-note window sliding along the line of fifths, so that modal interchange stops being a chapter and becomes a drag of a ring. My spelling is right down to G𝄫 and F𝄪, my dialects are not yet confirmed as Berklee's, and I want to be judged in a classroom, out loud, before I grow secondary dominants, minor windows and a projection mode."
links:
  - target: "[[FOUR PILLARS]]"
    type: exemplifies
    label: one-structure-cast-many-ways
  - target: "[[Objects to Think With]]"
    type: exemplifies
    label: the-window-made-handleable
  - target: "[[Playful Interface Design]]"
    type: exemplifies
    label: the-decoder-ring-is-the-explanation
  - target: "[[Hilaritas Generator]]"
    type: connects-to
    label: three-of-four-primitives
  - target: "[[Drafting Table Design System]]"
    type: connects-to
    label: dress
  - target: "[[Shepard Tone Synthesizer]]"
    type: connects-to
    label: the-fifths-cycle-it-asked-for
  - target: "[[Harmonicity and Inharmonicity]]"
    type: connects-to
    label: the-grammar-above-the-spectrum
  - target: "[[Inharmonic Wavetable Synthesis]]"
    type: contrasts-with
    label: scale-from-the-spectrum-vs-scale-from-the-line
  - target: "[[Cycle 5 Explorer — Context]]"
    type: spawned
    label: the-model-in-full
---

# Cycle 5 Explorer

![[Cycle 5 Explorer — hero.png]]

A decoder ring for harmony. Turn the rings, hear the change.

A teaching space Loudon pulls up when teaching harmony, and a thing a student can keep afterward. It began as one large Illustrator document he built for a class, three days of work that stopped where Illustrator stopped: rotated text skewed, the degree labels could not run from ♯4 to ♭5, and G major showed G♭ instead of F♯. On 2026-10-27 he handed Claude a thirteen-minute narration of that board and said the interaction he built "was based on the limits I had at the time." The rebuild is a single web page with sound, and it keeps everything the board had while fixing what it could not do.

The original:

![[original-full-board.png]]

The page: `Projects/Cycle 5 Explorer/cycle5-explorer.html`. Open it in a browser; nothing to install. Paper by default for the handout and the classroom, Phosphor for a dark projection room.

## The one idea underneath

Every key is a **seven-note window sliding along the line of fifths**, and every panel is a view of that one window.

- **Move the window** (drag the note ring): change key, C♭ to C♯.
- **Move the tonic inside the window** (drag the degree ring): change mode, bright to dark. Lydian, Ionian, Mixolydian, Dorian, Aeolian, Phrygian, Locrian.
- **Hold the tonic and slide the window**: parallel modes, which is modal interchange. A header switch decides what a mode change keeps: the same notes (relative) or the same tonic (parallel).
- Each step darker lowers exactly one note. The grids make that visible; the sound makes it audible.

Spelling follows what Loudon called the spiral. A note's name comes from its position on the line of fifths, an integer, never from a list of twelve. So F♯ not G♭ in G, ♯4 in Lydian and ♭5 in Locrian, down to G𝄫 and up to F𝄪 at the edges. The core model is in [[Cycle 5 Explorer — Context]].

## What is on the page

The **wheel**: a note ring and a degree ring you drag, with mode names and chord qualities fixed outside them. The state commits each time a ring passes a slot, so spellings, grids and the strip move while the finger is still down, and the ring pushes back at the ends of its range. Labels stay upright. The five notes outside the key sit in a hatched sector, each labelled with its degree and the nearest mode it can be borrowed from, so modal interchange is visible on the dial. The hub is a small lit scope showing the sounding chord as a shape.

The **inspector**: tonic and mode, a feel word, a bright-to-dark meter, the scale with degrees, the key signature, the one note that changes a step brighter or darker, and the selected chord in four dialects side by side: Berklee (D–7, VII–7(♭5)), jazz shorthand (Δ7, ø7), lead sheet (m7, m7♭5) and classical (ii7, viiø7), with chord tones, tensions, avoid notes by the Berklee half-step rule, the chord scale, and a treble staff.

The **three grids** from the board, bigger: Scale Tones, Chord Function and Chord Tones. The first two switch between same-tonic (the modal interchange chart) and same-notes (relative) views. Every cell plays.

**Progressions** stored as functions, so turning the key ring transposes them: diatonic presets that follow the mode, borrowed ones that keep their colour on any tonic, and build-from-clicks. The **line of fifths** strip under the hood, which is Loudon's jig in motion. Five **guided moments** for class, and keyboard shortcuts for a projector.

## What it connects

Emotion to mode, mode to the cycle of fifths, the cycle to traditional progressions, modes to each other, scale degrees to chord tones to chord scales, all of it to modal interchange, and the whole to the translation between traditional notation and Berklee or Real Book language. One structure, cast several ways; the student sees that the five panels are one thing ([[FOUR PILLARS]]).

It is an object to think with in Papert's sense: the window, an abstraction, given a body a hand can turn ([[Objects to Think With]]). The decoder ring is the explanation, not a panel of controls with an explanation beside it ([[Playful Interface Design]]). It stands beside [[Rational Hearing]], built the same day, as a second harmony instrument; and it answers a question the [[Shepard Tone Synthesizer]] left open, what a cycle other than the octave would be to loop on. [[Harmonicity and Inharmonicity]] holds the layer under this one, the spectrum; this page is the grammar above it, and [[Inharmonic Wavetable Synthesis]] argues the other way round, that the instrument's physics implies its scale. Both are true here.

## The dress

Drafting Table, by the coordinating session's decision on 2026-10-28: the page is a tool, an instrument panel, so it wears the workshop's dress rather than the public channel's ([[Drafting Table Design System]]). The colour code from the video keeps fixed meaning on both grounds; the mapping onto the tokens, and the one hue that had to change, are in the Context. The title block reads SKETCH until the dialects are confirmed.

## Open with Loudon

- Which default for class: same notes, or same tonic?
- Do the four dialects match Berklee practice exactly: –7(♭5) against –7♭5, tensions in parentheses, uppercase Roman numerals?
- Does the feel word per mode match how he teaches emotion to mode?
- Which of the roadmap's moves comes first: secondary dominants and tritone subs, harmonic and melodic minor as other windows, a bass and voice-leading view, MIDI out for Ableton, or presentation mode?

The plan is on the scroll. The build conversation, the transcript of the original video and the stills are kept under `Projects/Cycle 5 Explorer/import/`.

## Forward Vectors

*See YAML `forward_vector`.*
