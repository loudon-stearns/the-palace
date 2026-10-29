# Cycle 5 Explorer: design spec

## Where it came from

The original was a large Illustrator document Loudon built for a class (see `original/` and `original-video-transcript.md`). Its parts:

- **The dial**, "a big decoder ring for harmony and modes." Rings for degree, note, function, quality and mode. Layers: cycle-5 labels, modes and quality stay still; *Rotate Degrees* turns to change mode; the notes ring turns to change key.
- **Scale Tones grid**: the modes Lydian → Locrian, bright → dark, against the notes in fifths order (shown twice side by side).
- **Chord Function grid**: Roman numerals for every mode, grouped major / minor / diminished.
- **Chord Tones grid**: each diatonic chord with its tones and tensions (1 5 9 13 3 7 ♯11 in fifths order).
- **Function bars**: highlight rows that slide up and down as the mode changes.
- **Jigs**: horizontal and vertical sharps/flats strips from G♭♭ to F𝄪 that Loudon used to build the thing. Not meant for students, but he'd like them shown in motion "if you can make them look cool."

Problems Illustrator couldn't solve, all named in the video:
1. Rotating text skewed; labels should stay upright.
2. ♯4 vs ♭5: degree labels need to run from ♯4 to ♭5 depending on mode.
3. Enharmonics: G major showed G♭ instead of F♯, and A showed flats instead of sharps. Notes behave like a spiral; flats go down to double flats and sharps up to double sharps.
4. Grids were too small.

## Decisions made with Loudon

| Question | Decision |
|---|---|
| Platform | Web page (single HTML file, Web Audio). |
| Look | Chalkboard spirit for v1; will be restyled to Loudon Live (palace) later. |
| What turns | The rings on the cycle-5 wheel. "They all move together." |
| What's locked | Function stays locked to the mode; key shifts around. |
| Grids | Keep all of them, bigger. Their value: you see only one note change between rows. |
| Scope | Push past the original's limits. A teaching space with visuals and sound, given to students afterward. Add features that help. |
| Language | Must translate between traditional notation and Berklee / Real Book jazz language. |
| Dragging | The state must update *while* dragging, not on release (fixed in v2). |

Colors keep a fixed meaning (from the video): modes reddish, qualities dark green, functions light green, degrees tan, notes white.

## What v2 contains

- **Wheel**: note ring (key, C♭–C♯) and degree/function ring (mode) are draggable, with live state updates, snapping, and resistance at the ends. Fixed ring: mode names and qualities. Upright labels. Five outside notes are shaded, each labeled with its degree and the mode it's borrowed from. The selected chord appears as a polygon in the hub.
- **Same notes / Same tonic** toggle for what a mode change preserves (relative vs parallel).
- **Inspector**: tonic and mode, a feel word, a bright→dark meter, the scale with degrees, alterations vs major, key signature (theoretical keys flagged), the one note that changes to go a step brighter or darker, scale / tonic chord / drone buttons.
- **Selected chord panel**: symbol and Roman numeral in four dialects side by side, chord tones and tensions with avoid notes, chord scale, Berklee symbol with tensions, classical name, and a treble staff (chord or scale) with key signature.
- **Grids**: Scale Tones, Chord Function and Chord Tones. The first two switch between same-tonic (parallel; modal interchange chart) and same-notes (relative) views. Changed notes are outlined with ↓/↑. Every cell is clickable and audible.
- **Progressions**: diatonic and borrowed presets, build-from-clicks, play/loop/tempo. Stored as functions, so they transpose.
- **Line of fifths strip**: the animated 7-note window, tonic range bracket, degrees and chord tones under each note. Click to set the tonic.
- **Guided moments**: bright→dark, same notes new home, around the cycle, borrow one chord, walk the keys.
- **Keyboard shortcuts** for projector use.

## Open questions for Loudon

- Is "same notes" the right default when opening in class, or "same tonic"?
- Do the four notation dialects match Berklee practice exactly? (e.g. –7(♭5) vs –7♭5, parentheses on tensions, uppercase Roman numerals)
- Does the "feel" vocabulary per mode match how he teaches emotion → mode?
- Which features from the roadmap in `CLAUDE.md` matter most next?
