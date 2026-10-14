# The crystal on the road — polyphonic, in RNBO, Max for Live and Faust

Built 2026-10-14 (steward cycle 11). The plan's second move: take the playable
crystal from `../playable-crystal/` (one voice) and carry the same structure into
more materials. Every material here is checked against the summer's proof
renders, so "one structure, many projections" is a measured claim, not a slogan.

## Open it

| file | what it is | open with |
|---|---|---|
| `crystal-poly.maxpat` | eight voices, one crystal menu, five number boxes, kslider + MIDI keyboard | Max 9 (RNBO 1.4) |
| `Crystal Synthesizer 0.1.amxd` | the same rnbo~ as a Max for Live **instrument**: live.menu for the crystal, five live.dials | drop on a MIDI track in Live 12 |
| `faust/crystal.dsp` | the voice written in Faust | Faust IDE, or `faust2caqt -midi -nvoices 8` |
| `faust/crystal-faust-rnbo.maxpat` | a second RNBO patch, generated from `crystal.dsp` by `faust2rnbo -midi -nvoices 8` | Max 9 |

Listen for: the same A-minor chord on **Ruby** and then **Labradorite**. The
roughness numbers predict Ruby's chord fights itself and Labradorite's sits
cleanly — the opposite of what "most alien lattice" suggests.

## How the RNBO patch is built

The controls (`crystal attack decay release rolloff level`) are `[param]`
objects at the top of the rnbo~ patcher, outside the voices, so the export has
one knob each with a plain name. They reach the voices as signals. Inside
`[p @polyphony 8 @title voice]`: `notein -> mtof -> sig~` and
`velocity -> / 127. -> sig~` feed `crystal-voice.codebox`; its second outlet goes
to 1 when the voice is silent, and `[edge~] -> [voice]` mutes it so RNBO can give
the voice to the next note. After the voices: `*~ 0.3` for headroom, then level.

`crystal-voice.codebox` is `../playable-crystal/crystal-bank.codebox` with the
controls moved to inlets, level moved out, and a voice called silent at -80 dB.

## Checks (Node + a compiled Faust renderer; nothing here has run in Max)

`check_poly.py` -> `poly-findings.json`, `crystal_chords.wav`:
- one voice vs the mono codebox: 5e-8; vs the proofs: 5e-8 (float32 rounding)
- the mono patch's note-stack bug (hold A2, add E3, lift A2 -> E3 cut) is gone:
  E3 keeps 70% of its loudness through the lift, against 0.7% in the mono patch
- twelve notes into eight voices: four steals, no steal click (largest step at a
  note-on 0.12 of peak vs 0.18 elsewhere), every voice mutes once silent
- an eight-note full-velocity cluster peaks at 0.93 at level 0.5
- between-note roughness of an A-minor triad (Sethares model): Labradorite
  1.13, harmonic tone 1.36, Amethyst 2.05, Topaz 2.22, Diamond 2.88,
  Emerald 2.95, Fluorite 3.34, Ruby 4.17

`faust/check_faust.py` -> `faust/faust-findings.json`: the Faust voice against
the proofs, 3.6e-8 to 5.2e-8; against the codebox, 1.1e-8 to 3.3e-8.

The poly renderer (`poly-render.mjs`) models RNBO's documented MIDI voice
allocation (next free voice, steal the oldest); RNBO's own order may differ.

## Rebuild

- `python3 make_poly_patch.py` rewrites the maxpat and the amxd from the codebox.
- `faust2rnbo` needs Python's `py2max` at its 2023 layout (`py2max.core` with
  `add_rnbo`); the current PyPI release (0.6.0) does not import. A scratch clone
  of github.com/shakfu/py2max at the parent of commit `e586c04`, plus a one-line
  `py2max/py2max.py` containing `from .core import *`, on `PYTHONPATH`, works.

## Not verified

Nobody has opened either patch or the device. The H90 leg of this move is not
started: I could not find an export route from RNBO to the H90 on this machine,
and I have not checked whether one exists.
