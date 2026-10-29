---
title: "Cycle 5 Explorer — Context"
born: 2026-10-28
links:
  - target: "[[Cycle 5 Explorer]]"
    type: connects-to
    label: context-of
  - target: "[[Drafting Table Design System]]"
    type: connects-to
    label: tokens-worn
forward_vector: "I hold what the Cycle 5 Explorer entry left out: the core model in full, the notation dialects, the colour mapping onto Drafting Table's tokens, what the Illustrator original could not do and what was decided about it, the design tensions, and the open questions. I grow when the page's shape changes."
---

# Cycle 5 Explorer — Context

What the entry left out, and why the page is shaped as it is. The entry is [[Cycle 5 Explorer]]; the page is `Projects/Cycle 5 Explorer/cycle5-explorer.html`; the theory tests are `tests/theory.test.mjs` (26 checks). The build conversation, Loudon's narration of the original board, and the stills are kept as they arrived under `workshop/import/` (`docs/conversation.md`, `docs/original-video-transcript.md`, `docs/original/`, `docs/screenshots/` for the chalkboard first version). The original board, whole, is `original-full-board.png` beside this file.

## The core model

Read this before touching the theory code. Everything is a position on the **line of fifths**, an integer `k`: `… −1 = F, 0 = C, 1 = G, 2 = D … 6 = F♯, 7 = C♯, −2 = B♭ …`

- **`spell(k)`**: letter = `"FCGDAEB"[(k+1) mod 7]`, accidentals = `floor((k+1)/7)`, negative for flats. This is Loudon's "spiral": spelling is never chosen from a list of twelve, so enharmonics are always right (F♯ in G, not G♭; G𝄫 and F𝄪 at the extremes).
- **A key is a seven-note window** `[L, L+6]` on the line. `L` is the window's Lydian slot.
- **The mode** `m` (0 Lydian … 6 Locrian, bright to dark) picks the tonic: `T = L + m`.
- **Degrees** are fifths distances from the tonic, `d = k − T`. Scale step = `4d mod 7`; accidental = `floor((d+1)/7)`. So `d = 6` is ♯4 and `d = −6` is ♭5, which is the ♯4/♭5 problem from the video solved.
- **Chord-tone labels** map step to 1 9 3 11 5 13 7, so `d = 6` above a root is ♯11.
- **Chord quality by window slot**, in fifths order: maj7, maj7, 7, –7, –7, –7, –7(♭5).
- **Tonic range** C♭ to C♯ (`−7 ≤ T ≤ 7`), as on Loudon's jig.

**Two independent controls**, the two dials of the original:

1. The note ring slides the window: change key, mode fixed.
2. The degree ring changes the mode. A header toggle decides what is held: **same notes** (relative; `L` fixed, tonic moves) or **same tonic** (parallel; tonic fixed, window slides; this is modal interchange).

**Chords** are stored as `{ d, src }`: root distance from the tonic plus the source mode (`"c"` for the current mode). So progressions transpose when the key changes and borrowed chords keep their source. `resolve()` turns that into root, tones, chord scale, tensions and avoid notes. **Avoid notes** by the Berklee rule: a non-chord tone a half step above a chord tone.

**Wheel slots:** twelve, 30° apart. Slots 0 to 6 are the key in fifths order, with the Lydian slot at −30° so the Ionian tonic sits at the top. Slots 7 to 11 are the five outside notes, each labelled with its degree and the nearest mode it can be borrowed from (`outside()`).

## Notation dialects

| | maj7 | dom7 | min7 | half-dim |
|---|---|---|---|---|
| Berklee | maj7 | 7 | –7 | –7(♭5) |
| Jazz shorthand | Δ7 | 7 | –7 | ø7 |
| Lead sheet | maj7 | 7 | m7 | m7♭5 |
| Classical | IM7; case shows quality: ii7, viiø7 | | | |

Berklee Roman numerals are uppercase with the quality suffix (II–7, VII–7(♭5)). Tensions in parentheses, ascending: Cmaj7(9, 13). Unconfirmed by Loudon; the title block says so.

## The colour code, mapped onto Drafting Table

Loudon, from the video: "the colors are all important… I'm okay with those colors changing if they have to, but I want them to represent what they represent." Five categories, one token each, the same on both grounds. The tokens are the canonical ones from `_ops/drafting-table/design-system/colors_and_type.css`; no hex was invented.

| Category | On the board | Token | Paper | Phosphor |
|---|---|---|---|---|
| Notes | white | `--ink` | #1a1916 | #33ff66 |
| Degrees | tan | `--source-assumed` (ASSUMED amber) | #a8730a | #ffb000 |
| Functions (Roman numerals) | light green | `--source-datasheet` (DATASHEET blue) | #2b5fb0 | #4f8cff |
| Qualities (maj7, –7 …) | dark green | `--cat-2` | #3a7d2c | #6bd45a |
| Modes | reddish | `--cat-5` | #b3356b | #ff6fae |
| The sounding chord | — | `--accent` | #c8261a | #33ff66 |

The page declares them as `--note`, `--degree`, `--function`, `--quality`, `--mode`, each resolving to the token above.

**The one hue that changed.** Functions were light green on the board and qualities dark green. The palette has one green a word can be set in (`cat-2`, which is also `ok`), and on Phosphor the ink itself is green, so two greens beside the notes would not have read. Qualities kept the dark green, because they sit small and close to the mode names where the board had them; functions took the blue. The meaning is still fixed, which is what Loudon asked for; the hue is not what he drew. He can swap the two if the numerals want to stay green.

The provenance reading of those tokens (ASSUMED, DATASHEET) is not meant here; on this page they are category colours. A legend could say so if it ever confuses.

## What the Illustrator original could not do, and what was decided

Problems named in the video: rotating text skewed, so labels should stay upright; degrees need to run from ♯4 to ♭5 with the mode; enharmonics (G major showed G♭, A showed flats; notes behave like a spiral down to double flats and up to double sharps); the grids were too small.

| Question | Decision |
|---|---|
| Platform | A single HTML page with Web Audio. No build, no dependencies. |
| Look | Chalkboard spirit for the first version; Loudon said it would be restyled to his palace system. The coordinating session chose Drafting Table on 2026-10-28, since the page is a tool. |
| What turns | The rings on the cycle-5 wheel: "they all move together." |
| What is locked | Function stays locked to the mode; the key shifts around. |
| Grids | Keep all three, bigger. Their value: you see only one note change between rows. |
| Scope | Push past the original's limits: a teaching space with visuals and sound, given to students afterward. |
| Language | Must translate between traditional notation and Berklee / Real Book language. |
| Dragging | The state updates while dragging, not on release (Loudon, 2026-10-28 00:27; fixed in the second version). |

Interaction behaviours settled and kept through the redress: the rings commit a state change each 30° passed, and only the leftover angle animates; resistance at the range ends; labels counter-rotated to stay upright; tap a function to select and play, a note to play it, a mode name to go there; the one changed note outlined with an arrow in the same-tonic Scale Tones grid; keyboard ←/→ key, ↑/↓ mode, 1–7 chords, S scale, D drone, T same notes / same tonic, N notation, Space progression. The redress added P for the ground.

## The dress, and its tensions

- **Drafting Table, not Loudon Live.** Loudon's build conversation says "it will eventually be styled like my loudon live system in the palace" (2026-10-27 21:43). The coordinating session chose Drafting Table on 2026-10-28, reading the page as an instrument panel, the workshop's dress, under the rule in [[Drafting Table Design System]] § Which dress. The tension is real and is held here rather than hidden: if Loudon wants the public channel's dress when he hands the page to students, the tokens are in one block at the top of the file and the five category variables are the only thing the page's colour rests on.
- **Tokens inlined, not linked.** The Maker's rule is to link the canonical CSS; the page copies the token block verbatim instead, with a comment saying so, because it is one file that opens from disk and inside the rich face. Bring it level by hand when `tokens.json` changes.
- **Noto Music.** Mono everywhere is the grammar, but JetBrains Mono does not carry 𝄫, 𝄪 or 𝄞. Noto Music is loaded from Google Fonts as the second face in the music stack, for those glyphs only. It is a font, not a library, so it is not a shelf item; if it fails, the system's symbols render instead.
- **The hub is the scope.** "The scope is always lit": the one dark window on the paper sheet is the hub, which shows the sounding chord as a shape in `scope-trace` with the root in `scope-trace-2`.
- **The sounding chord is the accent**, on the note ring (rings around its tones) and in the grids (the selected cell, the changed note). Nothing else is red on Paper except the title block's status line.
- **Hatch, don't tint**: the outside sector and the current-mode wedge are 45° hatching; the tonic cells in the grids too.
- **Motion**: 120 ms linear on a ring's leftover angle and the window on the strip, `steps()` on the range-end shake, none under `prefers-reduced-motion`.
- **DT controls not inlined.** `dt-controls.js` is 25 KB and built around `ParamSpec`; the page's segments, buttons and readout follow the bundle's grammar (inverted selected segment, slab buttons, hairline readout) in their own CSS instead.
- **No review kit on the page**. If it is reviewed in context rather than in a session, add one note per panel ([[Review Layer]]).

## Open questions

- Same notes or same tonic as the default when it opens in class?
- Do the four dialects match Berklee practice exactly (–7(♭5) against –7♭5, parentheses on tensions, uppercase numerals)? Real Book alternates (C6, C–6, sus) are not there.
- Does the feel vocabulary per mode match how Loudon teaches emotion to mode? He may want to edit it in the page.
- Roadmap, in the order the import listed it: secondary dominants and II–V of each diatonic chord, tritone subs; harmonic and melodic minor as alternate windows; a bass and voice-leading view; MIDI out for Ableton; song examples per mode; **presentation mode** (bigger type, inspector hidden) for projecting; an animated version of the jigs beyond the strip.
- Should the functions go back to green and the qualities take the blue?
- [[Rational Hearing]] was being built in parallel on 2026-10-28; its page did not exist when this one was written, and the link rests on the coordinating session's word that it is a sibling.

## Dropped links, and why

[[Creative Coach]] was in the import's note; the page is about content and an object, not the coaching relation that entry is about, so the link was forced and is left out. [[Logarithmic Interface Scaling]] was offered; no control on the page maps pitch continuously (the tempo slider is linear bpm), so it is not here. [[Hilaritas Generator]] is linked `connects-to`, not `exemplifies`: the page has a tool that extends, a cross-domain moment (integer arithmetic as the harmony engine) and, with build-from-clicks, a thing to make, but no reflecting surface, no question asked afterward.
