# The coupling edge — workshop

Oscillators and modulators that live at the edge where a stretched, pulled tone stops holding and tears, made from the 2026-10-17 frustration sweeps (`Harmonicity and Inharmonicity/proofs/2026-10-17-frustration-sweeps/`, read-only here). Commissioned by the baton of 2026-10-17; made 2026-10-20.

**Open `coupling-edge-instrument.html`** and press start. It is one self-contained page: the sweeps' toy model runs live in an AudioWorklet, with the same random detuning the renders used. It holds a stretch just under the edge on any note, and every section asks one question and says, under it, what was measured.

The model is a toy. One tone's partials hang off one phase and are pulled by outside voices tuned to the plain harmonic series. Trust the shapes and the directions, not the exact values. I can't hear, so every sound claim here is a measurement.

## What is here

| file | what it is |
|---|---|
| `coupling-edge-instrument.html` | the instrument: engine (`const WORKLET`), shared helpers (`// COMMON`), data and edge table folded in, the page |
| `edge-lab.mjs` | runs the page's own worklet in Node; everything below goes through it |
| `edge-data.mjs` | folds the seeds, the measured piano and the four modal objects (`../trajectory-library/*.wtb.json`) into the page |
| `seed_streams.py` → `seed-streams.json` | numpy's seed-7 and seed-11 draws, so the page detunes its voices exactly as `ride.py` did |
| `measure-edge.mjs` → `edge-table.json` | the edge, bisected for 364 settings, folded into the page |
| `check-coupling-edge.mjs` → `answers.json` | 20 claims re-run headless on the page's engine, PASS/FAIL, with the numbers |
| `reference/ride_reference.py` → `ride-reference.json` | a copy of `ride.py`'s loop, for the port check |
| `render-proofs.mjs` → `renders.json`, `figure-data.json` | ten renders and what each measured |
| `plot_coupling_edge.py` → `coupling-edge.png` | the figure |

## Regenerate

```
python3 seed_streams.py          # only if the seeds are lost
node edge-data.mjs               # data block into the page
node measure-edge.mjs            # ~10 min on 8 cores; edge block into the page
node check-coupling-edge.mjs     # ~4 min; must print "all PASS"
node render-proofs.mjs           # ~3 min; renders/*.wav
python3 plot_coupling_edge.py
```

Python is the Mac's own `python3` with numpy, scipy and matplotlib, already installed; nothing was installed for this. Node needs no packages.

**On this Mac only:** `renders/*.wav` (gitignored under `Projects/**/*.wav`). `render-proofs.mjs` remakes them exactly; `renders.json` records what each one measured.

## Choices the frozen model did not make

- **Nearest pairing** (`pairing: 1`): each partial is pulled by whichever voice is nearest. A partial stretched past every voice is pulled by nothing. Clamping it onto the top voice made the bar's high partials yank the tone off its pitch.
- **The duo** (`partner: 1`): two tones, each partial paired with the other tone's nearest partial, both ways. Only nearly coincident partials pull: full weight within an eighth of the lower fundamental, none past a quarter. Each tone's pitch is held only by its own summed pull, so without this window the two slide into unison.
- **Loudness-following coupling** (`gamma`): partial n couples at K × (its level ÷ the loudest level)^γ, the same weight on both sides of the pair.
- **Control rate**: stretch, coupling and the far-pull gates update every 16 samples, not every sample. The port check measures what that costs.
- **The edge across pitch**: with coupling scaled to pitch, the model runs on a faster or slower clock. Measured on the tone's own clock (windows scaled by 110 / f₀, wobble in cents), the edge is the same from E1 to A4, so one table serves every note. The page shows wobble in cents for that reason.
