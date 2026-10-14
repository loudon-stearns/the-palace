# The playable crystal — first build of "make a playable crystal in Max"

Built 2026-10-14 (steward cycle 10). The first move on the plan: a monophonic
partial bank with the crystals on a selector and an envelope, so the timbre each
lattice predicts can be *played*, not only rendered. Per the standing order it is
RNBO (codebox~ inside rnbo~), so the same source can travel to M4L / VST / the
H90 / web on the next move.

## Open it

1. Open `crystal-bank.maxpat` in Max 9 (RNBO 1.4).
2. Turn on the ezdac~. Pick a crystal from the menu. Click the keyboard, or play
   a MIDI keyboard (the patch listens on `notein`).
3. Hold one key and step the menu: the same strike keeps ringing while the
   lattice under it changes.

## Listen for

- **Ruby** — a slow 4 Hz beating near the root: the 1.10 / 1.14 doublet.
- **Fluorite** — five low modes, a gap, then one lone high mode at 2.48.
- **Labradorite** — four octaves of partials that never settle into a chord.
- **Diamond vs. Labradorite** — the two poles of the symmetry arc, now under your fingers.

## The selector

| slot | crystal | system | source |
|---|---|---|---|
| 0 | Diamond | cubic | palette |
| 1 | Fluorite | cubic | palette |
| 2 | Tetragonal | — | April session-1 hypothesis table |
| 3 | Emerald | hexagonal | palette |
| 4 | Ruby | trigonal | palette |
| 5 | Amethyst | trigonal | palette |
| 6 | Topaz | orthorhombic | palette |
| 7 | Monoclinic | — | April session-1 hypothesis table |
| 8 | Labradorite | triclinic | palette |

## Why trust it before Max has opened it

`check_crystal_bank.py` runs the codebox in Node (harness adopted from Blood
Compressor) and holds A2 for six seconds on each palette mineral, then compares
against `additive_strike()` imported from `../palette-strikes/render_palette.py`.
Largest difference: about 5e-8 on a -1..1 scale (float32 rounding) — the
playable crystal *is* the proofs' crystal at the default knobs. Results in
`findings.json`. A restrike click found in the first draft was fixed with a 3 ms
fade, and the check confirms the restrike steps are now smaller than ordinary
waveform steps.

## Files

- `crystal-bank.codebox` — the DSP (rnboscript)
- `crystal-bank.maxpat` — the playable patch (rebuild with `make_patch.py`)
- `codebox-harness.mjs`, `render-score.mjs`, `check_crystal_bank.py` — the Node check
- `crystal_keyboard_tour.wav` — the same phrase on all nine slots
- `one_strike_nine_lattices.wav` / `.svg` — one strike, the selector stepped every 2 s (`draw_sweep.py`)

## Not verified

Nobody has opened the patch in Max. It should compile; it has not been heard
through RNBO. Mono note handling is last-note-wins with no note stack: lifting an
older key while a newer one is held releases the newer one.
