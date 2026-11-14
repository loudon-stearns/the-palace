# Line widths, bracketed — does "only diamond is a bell" survive?

Built 2026-11-14 (steward cycle 15), on the adopted plan's second move: give every
mode its own ring, from measured room-temperature Raman line widths. Cycle 12's
finding, that diamond is the only bell, rested on one Q per crystal, mostly
estimated. This folder asks how much of that finding the estimates were carrying.

| file | what it is |
|---|---|
| `modes.json` | every mode the plugin plays, with its line, what kind of mode it is, and the width its source gives (or the range, or nothing) |
| `bracket.py` | strikes each mineral at the widest and narrowest lines its sources allow; writes the three below |
| `bracket.json` | ring times, the Q ranges per mode, the verdict and the stress test |
| `bracket.wav` | at A2, each mineral twice: shortest plausible ring, then longest (diamond's long one is cut at 6 s) |
| `bracket.svg` | the ranges on one log axis, with the plugin's ring today marked |

## What the search found

- **Most of the plugin's modes are not Raman lines.** Diamond's first four, fluorite's
  five of six and all eight of labradorite's are zone-boundary or infrared phonons,
  or approximate picks from a dense spectrum. No Raman width exists to look up for
  them. Their lifetimes would come from neutron scattering or first-principles
  phonon calculations. So "one measured width per mode" can't be done from Raman
  alone; the plan's wording should say so.
- **Sourced widths this cycle:** beryl/emerald's 686 line, 9–12 cm⁻¹; quartz 464,
  7–8; topaz, 2–10 below 700 cm⁻¹ and up to 30 above 800; plagioclase's main line,
  7–20 (albite 7.9, anorthite 10.7). Diamond 1.0–1.65 and fluorite's powder 12 from
  cycle 12. All of them came through search summaries; I read none of the papers
  whole.
- **Ruby's widths are in print and I couldn't reach them:** *Temperature dependence
  of the Raman lines of α-Al₂O₃*, Solid State Communications (1968), 77–1200 K
  (sciencedirect 003810986890152X), and Appl. Opt. 56, 8598 (2017), from which OSTI
  returned HTTP 429. The sapphire-fiber letter (OSTI 1258656) says its own widths
  are instrument-broadened.

## What the bracket says (A2, rolloff 0.7, ring = until 60 dB down)

| crystal | modes with a sourced width | not Raman lines | ring, widest lines | plugin today | ring, narrowest | if unsourced lines are 4× narrower |
|---|---|---|---|---|---|---|
| Diamond | 1 of 5 | 4 | 8.1 s | 16.1 s | 53.3 s | 64.4 s |
| Fluorite | 1 of 6 | 5 | 0.3 | 0.5 | 2.6 | 3.0 |
| Emerald | 1 of 7 | 0 | 0.5 | 1.1 | 0.7 | 3.0 |
| Ruby | 0 of 7 | 0 | 1.3 | 2.4 | 3.0 | **12.1** |
| Amethyst | 2 of 9 | 0 | 0.3 | 1.2 | 0.4 | 2.6 |
| Topaz | 8 of 8 | 0 | 0.3 | 1.2 | 1.5 | 1.5 |
| Labradorite | 0 of 8 | 8 | 0.3 | 0.6 | 2.9 | 2.9 |

- **It holds on what's sourced.** Diamond's shortest ring (8.1 s) is 2.7 times
  ruby's longest (3.0 s), the next longest of all.
- **Ruby is the hinge.** If ruby's unread lines are a quarter as wide as my guess,
  ruby rings 12 s and becomes a second bell. Every other mineral stays a knock
  under that stress. One paper decides it.
- **One Q per crystal overstates the low modes** of emerald and amethyst, if their
  low lines are as wide in cm⁻¹ as the anchor line. A line the same width at a lower
  position has a lower Q. The plugin's ring is inside the bracket only if those
  low lines are narrower than the anchor. Quartz's 128 mode was measured by Pine &
  Tannenwald (Phys. Rev. 178, 1424, 1969) and is the test case.
- **Labradorite stays a knock** at every width the plagioclase literature allows
  (0.3–2.9 s), so the triclinic finding holds whatever its widths are.

## The rules for a mode with no number

- A Raman line whose width I couldn't read gets the crystal's anchor width range,
  applied to its own position: Q = line / width.
- Not a Raman line: half to double the anchor's Q range.
- The stress column lets every unsourced line be up to four times narrower than
  the anchor's narrowest.

## Not done

The plugin is unchanged. Its Q table (`plugin/src/Algorithm.h` `kQ`, and
`reference/sketch.py`) moves to a per-mode table once ruby's widths are read.
That is one array per crystal and a rerun of `check/check_engine.py`.
