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
| `per_mode.py` | the plugin's per-mode Q table, the middle of each bracket; writes `per_mode.json`, `.wav`, `.svg` |

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

## Wired: one Q per mode (cycle 16, 2026-11-14)

`per_mode.py` takes the geometric middle of each mode's bracket and writes the table
the plugin's three engines now carry (`kQM` in `plugin/src/Algorithm.h`, `QM` in
`reference/sketch.py` and `ui/crystal_engine.js`). `per_mode.wav` strikes each
mineral at A2 twice, as the plugin was (one Q) and as it is (one per mode);
`per_mode.svg` draws every mode's ring before and after.

**A width, not a Q, sets the ring.** Q = line / width, and a mode plays at a pitch
in proportion to its line, so tau = Q / (pi f) is the same for every mode of one
width. One Q per crystal made each mode higher up die sooner than the physics says.
Per mode, the upper partials hold as long as the lower ones: ruby's top mode goes
1.2 → 2.0 s, emerald's 0.3 → 0.6, amethyst's 0.15 → 0.34.

| crystal | ring before | ring now |
|---|---|---|
| Diamond | 16.1 s | 20.7 s |
| Fluorite | 0.5 | 0.8 |
| Emerald | 1.1 | 0.6 |
| Ruby (estimated) | 2.4 | 2.0 |
| Amethyst | 1.2 | 0.3 |
| Topaz | 1.2 | 0.7 |
| Labradorite | 0.6 | 0.9 |

Diamond is still the only bell, 10× the next. Amethyst lost most of its ring: its
128 cm⁻¹ line is 7–8 cm⁻¹ wide, Q 17, so the long low drone the flat Q gave it was
my estimate's, not quartz's.

Ruby's widths are still unread. One more source this cycle: Thapa et al.,
*Raman scattering in single-crystal sapphire at elevated temperatures* (Appl. Opt.
56, 8598, 2017; read whole, OSTI 1406891). It gives the 379 and 418 widths only in a
figure, and its spectrometer resolves 5.33 cm⁻¹, so it can't narrow a line below
that. Ruby stays at my 2.5–6 cm⁻¹ bracket, marked estimated in the code.

The two hypothesis slots (tetragonal, monoclinic) have no mineral and keep Q 100.
`check/check_engine.py` and `./plugin.sh verify` pass on the new table; the built
plugin is not installed yet (Live was open).
