# Cycle 5 Explorer — project context for Claude Code (frozen import; was CLAUDE.md)

An interactive harmony teaching space: a cycle-of-fifths "decoder ring" with linked grids, sound, and notation translation. Loudon (former Berklee professor, founder of the LMPD program at Berklee NYC) originally designed it as a static Illustrator document for a class. This is the rebuild as a single web page, started with Claude on 2026-10-27.

**Purpose (in Loudon's words, paraphrased):** a page he pulls up when teaching harmony, an interactive teaching space with visuals and sound, and something he can offer students afterward as a gift. It connects emotion → mode → cycle of fifths → traditional progressions → relationships between modes → scale degrees vs chord tones and chord scales → modal interchange, and translates between traditional notation and Berklee / Real Book jazz harmonic language.

**Future styling:** it will eventually be restyled to match Loudon's "Loudon Live" design system in the palace. All colors and fonts are tokens in the `:root` block at the top of the `<style>`; restyle there.

## Files

- `src/index.html` — standalone page; open it directly in a browser. This is the file to develop.
- `src/artifact-body.html` — the same page without `<!doctype>/<html>/<head>/<body>`, which is the format the claude.ai Artifact publisher wants (it wraps the skeleton itself). Keep the two in sync, or regenerate the body from `index.html` by stripping the wrapper lines.
- `tests/theory.test.mjs` — Node test of the theory core (spelling, degrees, chord symbols, tensions/avoids, borrowing). Run `node tests/theory.test.mjs`.
- `docs/design-spec.md` — what was built, why, and the decisions made with Loudon.
- `docs/conversation.md` — the build conversation.
- `docs/original-video-transcript.md` — Loudon's narration of the original Illustrator version (the spec it grew from).
- `docs/original/` — stills from the original; `docs/screenshots/` — v1 of the rebuild.

No build step, no dependencies. Fonts load from Google Fonts (Kalam, Atkinson Hyperlegible, IBM Plex Mono, Noto Music). Audio is Web Audio, synthesized in-page.

## The core model (read this before touching theory code)

Everything is a position on the **line of fifths**, an integer `k`:
`… -1 = F, 0 = C, 1 = G, 2 = D … 6 = F♯, 7 = C♯, -2 = B♭ …`

- `spell(k)`: letter = `"FCGDAEB"[(k+1) mod 7]`, accidentals = `floor((k+1)/7)` (negative = flats). This is Loudon's "spiral": spelling is never chosen from a 12-note list, so enharmonics are always correct (F♯ in G, not G♭; G𝄫 and F𝄪 at the extremes).
- A key is a **7-note window** `[L, L+6]` on the line. `L` = the window's Lydian slot.
- The mode `m` (0 Lydian … 6 Locrian, bright → dark) picks the tonic: `T = L + m`.
- Degrees are fifths distances from the tonic, `d = k − T`. Scale step = `4d mod 7`, accidental = `floor((d+1)/7)`. So `d = 6` is ♯4 and `d = −6` is ♭5; this solves the ♯4/♭5 problem Loudon flagged in the video.
- Chord-tone labels map step → 1 9 3 11 5 13 7 (e.g. `d = 6` above a root is ♯11).
- Chord quality by window slot (fifths order): maj7, maj7, 7, –7, –7, –7, –7(♭5).
- Tonic range: C♭ to C♯ (`−7 ≤ T ≤ 7`), as in Loudon's original jig.

**Two independent controls, which are the two dials in the original:**
1. Note ring = slide the window (change key), mode fixed.
2. Degree/function ring = change mode. A header toggle decides what's held: **same notes** (relative, L fixed, tonic moves) or **same tonic** (parallel, tonic fixed, window slides; this is modal interchange).

**Chords** are stored as `{ d, src }`: root distance from tonic, plus source mode (`"c"` = current mode). So progressions transpose when the key changes. Borrowed chords keep their source mode. `resolve()` turns that into root, tones, chord scale, tensions, and avoid notes.

**Avoid notes** (Berklee rule): a non-chord tone a half step above a chord tone.

**Wheel slots:** 12 slots, 30° apart. Slots 0–6 = the key in fifths order (Lydian slot at −30°, so the tonic of Ionian is at top). Slots 7–11 = the five outside notes. Each one is labeled with its degree and **the nearest mode it can be borrowed from** (`outside()`), so modal interchange is visible on the dial.

## Notation dialects

| | maj7 | dom7 | min7 | half-dim |
|---|---|---|---|---|
| Berklee | maj7 | 7 | –7 | –7(♭5) |
| Jazz shorthand | Δ7 | 7 | –7 | ø7 |
| Lead sheet | maj7 | 7 | m7 | m7♭5 |
| Classical | IM7 (roman), case shows quality: ii7, viiø7 | | | |

Berklee Roman numerals are always uppercase with quality suffix (II–7, VII–7(♭5)). Tensions are written in parentheses, ascending: Cmaj7(9, 13). **Open question for Loudon:** confirm these match how he writes at Berklee.

## Color code (fixed meaning; Loudon was explicit about this)

- Modes: red/rose (`--mode`)
- Qualities: dark green (`--quality`)
- Functions (Roman numerals): light green (`--function`)
- Degrees: tan (`--degree`)
- Notes: white/chalk (`--chalk`)

Hues may change in a restyle, but each category keeps one consistent color everywhere.

## Interaction behaviors already settled

- Rings update the state **while dragging**: each 30° passed commits a state change, so spellings, grids and the strip update live. The ring only animates the leftover angle. Resistance at the range ends.
- Labels stay upright as rings rotate (counter-rotated with `calc(var(--rot) * -1)`).
- Tap a function → select and play that chord. Tap a note → play it. Tap a mode name → go to that mode.
- In the Scale Tones grid (same-tonic view) the one note that changes between rows is outlined, with an arrow.
- Keyboard: ←/→ key by fifths, ↑/↓ brighter/darker, 1–7 chords, S scale, D drone, T same notes/same tonic, N notation, Space play progression.

## Roadmap / ideas not yet built

- Restyle to the Loudon Live design system (palace).
- Confirm Berklee spelling conventions with Loudon; possibly add Real Book alt symbols (e.g. C6, C–6, sus).
- Secondary dominants / II–V of each diatonic chord; tritone subs.
- Harmonic minor and melodic minor families as alternate "windows".
- Bass + voice-leading view for progressions; MIDI out (Web MIDI) for use with Ableton.
- Emotion vocabulary per mode, editable by the teacher; song examples per mode.
- Presentation mode (bigger type, hide the inspector) for projecting in class.
- Animated version of Loudon's "jigs" (the sliding sharps/flats strips). Partly done as the line-of-fifths strip.

## Working conventions

- Keep it a single self-contained HTML file unless there's a strong reason to split.
- Run `node tests/theory.test.mjs` after any change to the theory core. Add cases for new chord types.
- Respect `prefers-reduced-motion`; keep the page working at phone width (no horizontal scroll).
- The claude.ai Artifact URL for the live version: https://claude.ai/artifact/BHCGoSk5HJpY5pqSAa9iuu (private to Loudon until shared).
