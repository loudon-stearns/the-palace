# Let the crystal ring — every phonon mode a resonator, its ring time from physics

Built 2026-10-14 (steward cycle 12). The plan's third move. Until now every
crystal voice added sine waves and gave them a decay chosen by taste
(`decay / (1 + 0.15 k)`). Here each mode is a two-pole resonator tuned to the
mode, struck by a short pulse, and **how long it rings comes from the
crystal's Raman line width**:

    Q   = Raman line position / Raman line width     (no units)
    tau = Q / (pi * f)                               (seconds to 1/e)

Q has no units, so it survives the move from terahertz to audio untouched: a
mode rings for about Q/pi cycles at whatever pitch you play it. Higher modes
die sooner in seconds simply because they are higher. That replaces the taste
rule with physics.

## Open it

| file | what it is | open with |
|---|---|---|
| `crystal-rings.maxpat` | eight voices, crystal menu, hardness / lifetime / release / rolloff / level | Max 9 (RNBO 1.4) |
| `Crystal Synthesizer Rings 0.1.amxd` | the same rnbo~ as a Max for Live instrument | a MIDI track in Live 12 |
| `ring_tour.wav` + `ring_tour.svg` | each palette mineral struck at A2 then A4, physics lifetimes | any player |
| `strike_vs_ring.wav` | per mineral: the summer proof strike, then the physics ring | any player |
| `hardness.wav` | one ruby A3, strike pulse 0.1, 0.5, 2, 5, 20 ms | any player |

Controls: **hardness** (ms) is the strike pulse length, short = bright.
**lifetime** multiplies every Q: 1 is the physics, 8 turns the knocks into
bells while keeping which modes outlast which. **release** is a damper after
key up (8 s default, so it barely touches the ring). **rolloff** is the strike
amplitude step between modes (0.70, as in the proofs).

## What the physics says (and where it argues with our predictions)

At lifetime 1, A2 (from `ring-findings.json`):

| crystal | Q source | Q | cycles to 1/e | to -60 dB at A2 | energy left after 0.5 s |
|---|---|---|---|---|---|
| Diamond | measured | 807 | 257 | 16.1 s | 38% |
| Ruby | estimated | 120 | 38 | 2.4 s | 4.4% |
| Amethyst | measured | 62 | 20 | 1.2 s | 0.3% |
| Topaz | estimated | 58 | 18 | 1.2 s | 0.2% |
| Emerald | estimated | 57 | 18 | 1.1 s | 0.2% |
| Labradorite | estimated | 30 | 10 | 0.6 s | 0.0% |
| Fluorite | measured (powder) | 27 | 9 | 0.5 s | 0.0% |

- **Diamond is the only bell.** Everything else is a knock or a short chime.
  The proofs gave every mineral the same 5.5 s ring; physics does not.
- **Labradorite is not "bell-like and alien".** Its wide partials are real, but
  with Q 30 its top mode (17.5x) is gone in about 5 ms: a dull knock with a
  bright tick on the front. The entry's triclinic hypothesis predicted chaotic,
  bell-like decay. The ring says otherwise, if the estimated width holds.
- **Amethyst's soft mode (1.62) dies first**: Q 17 against 62 for its
  neighbours, so the phase-transition remnant is a flicker at the attack.

## Checks (Node; nothing here has run in Max)

`check_rings.py` -> `ring-findings.json` and the three WAVs:
- the codebox against a closed-form numpy reference (`R^n sin((n+1)w)`
  convolved with the strike): 3e-8 of peak while the voice sounds. The
  reported 4e-5 to 7e-5 is the voice switching itself off at -80 dB, which the
  reference does not do.
- late-tail ring time against `Q / (pi f)`: within 0.4% for five minerals,
  1.1% for diamond and 2.2% for ruby (close modes beating against the lowest
  one bend the fit).
- twelve notes into eight voices: four steals, largest step at a note-on 0.063
  of peak against 0.058 elsewhere, every voice frees itself once silent.
- an eight-note full-velocity cluster at level 0.5: 0.54 to 0.88 peak. The
  voice gain is 0.3 (not the poly voice's 0.6) because every mode starts in
  phase, so strikes stack.

`draw_tour.py` -> `ring_tour.svg`. `make_ring_patch.py` rebuilds the maxpat
and the amxd. `ring-render.mjs` is `../crystal-on-the-road/poly-render.mjs`
with the controls renamed.

## Not verified

- **The line widths.** Two are values I found (diamond 1.65 cm^-1; quartz's
  464 line, 7.5 cm^-1). Fluorite's 12 cm^-1 is from a powder standard and is
  probably too wide. Ruby, emerald, topaz, labradorite and the quartz soft
  mode are my estimates. Every one is in `linewidths.json` with its status.
  Finding real room-temperature widths per mode is the next research job.
- One Q per mineral, from its strongest line, is given to every mode. Real
  modes each have their own width.
- Nobody has opened the patch or the device.
- Changing the crystal while a note rings retunes the ringing filters, so a
  diamond tail turns into a fluorite tail and dies fast. That may be a
  feature. It is how the tour's diamond A2 ends.
