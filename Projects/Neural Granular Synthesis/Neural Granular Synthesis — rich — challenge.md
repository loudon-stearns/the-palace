---
title: "Neural Granular Synthesis — rich — challenge"
born: 2026-11-03
links:
  - target: "[[Neural Granular Synthesis]]"
    type: connects-to
    label: challenge-of
forward_vector: "I am the challenger's reading of this page's proposed rich face, piece by piece and offer by offer, with the numbers re-run on the steward's own engines as well as the face's ports, so Loudon can see which findings rest on this round's pieces and which on the steward's earlier work."
---

# Challenge — Neural Granular Synthesis's rich face, proposal round 2026-11-03

Read against the page as it stands in the worktree (`Projects/Neural Granular Synthesis.md`), the manifest, every piece's source, the steward's originals in the bundle, and the maker's commit body (ef340f60). I didn't make any of this. Verdicts: **16 keep, 1 remake, 0 retire.**

## The ports

Both made pieces claim to be ports of the steward's engines. I checked both against the originals.

- **The crowd-size ladder** (`render_crowd_size.py` + `kernel_lib.py`'s flat ring). Line for line the model is the same: rates 6 Hz ± 18% uniform, K scaled by the mean angular rate, the mean-field pull written as `K·Im(conj Z·e^{iθ})`, a 1 ms step, a wrap past 2π fires, a 90 ms sin² grain with three harmonics at a pitch drawn 3.5 semitones (std) around 330 Hz, gappiness as std ÷ mean of 10 ms RMS frames, the floor by phase scrambling. What differs: its own random numbers (pitches and rates from one stream instead of numpy's two), and 5.46 s recorded instead of 4 s. So it matches statistically, as the maker says, not sample for sample. I re-ran the steward's Python as it stands and it reproduces `crowd-size-table.json` exactly. Port against original, gappiness ÷ floor, mean of the same three seeds: drift 2.02 / 2.17 at 4, 1.24 / 1.38 at 16, 1.19 / 1.21 at 32, 1.08 / 1.12 at 64, 1.07 / 1.04 at 512; locked 5.17–6.05 / 5.26–6.26. The port sits a little lower at small sizes, inside the original's spread between seeds (at 16: 1.26, 1.35, 1.52).
- **The lock attack** (`crowd_engine.js` + `render_lumpiness.js`). The Crowd class is byte for byte the same (`checks.mjs` confirms it, and I read it). The LumpyCrowd adds one thing, a raster rank recomputed after the nudge, which changes the drawing and not the dynamics. Reproduces `lumpiness.json` to the third decimal at all four corners (half-lock and width identical).

## The pieces

### Neural Granular Synthesis (the opening)

**crowd-gesture.wav** — keep. Gathered. It doesn't test anything. It makes the opening paragraph's arc audible, noisy whispers to a stable tone and back, played on the population's knobs, and the caption matches cycle 12 (snap near 8.5 s, the phrase A C D E D A, 128 neurons, which is the engine's default).

**crowd-gesture.png** — keep. The meters under the take. You need them to follow what the knobs did. The caption is accurate.

### The Core Insight

**…rich — crowd-size ladder.html** — **remake**, one sentence. It is a test. Step 4 could have shown a locked crowd fusing at large N, and it shows that it doesn't. It walks up: one grain with a grain-length slider (30 cycles at 90 ms, a click at 3 ms), then four, then the uncoupled ladder with the meter, then lock it and climb again. Each step is one idea, the step change stops the sound, and the rail stays open. It is faithful to the text and names the condition the text doesn't. The fault is in `verdict()` (line 381): *"the steward's crowds and this page's headless run … came within about a fifth of the floor at 16 to 32 neurons and within a tenth from 64."* The steward's crowds didn't. They read 1.37× at 16, 1.21× at 32, 1.12× at 64, and first came within a tenth at 256 (1.09×). The sentence gives the steward the port's numbers. The fix is to split it: *"the steward's crowds came within about a fifth of the floor at 32 and within about a tenth from 128 to 256; this page's headless run, at 16 to 32 and from 64. Three crowds each, so the rung moves by one either way."* Nothing else needs to change.

**crowd-size-stability.png** — keep. The steward's measurement behind the walk. The caption matches cycle 7 and the table: brightness at its floor by about 16, the locked crowd at 1.35–1.44.

### Architecture: Shader-Parallel Neuron Population

**crowd-instrument.html** — keep. Gathered, pre-contract, and conform passes it. It is the persistent population the section describes, playable, so it shows rather than tests. That still earns its place, because the section's claim is about what to build and this is the build. The caption is accurate, "no lumpiness knob yet" included: `grep -ci lump` finds 0.

### Population-Level Parameters

**…rich — lock attack.html** — keep, with a note. It is a test, and it comes out partly against the text, which is the best kind. It walks up: tightness alone (a switch at 1), pacemakers (the edge moves to 1/(1 − p)), lumpiness, then the test on four crowds, each lumpy one measured three times, reading both width and the biggest single jump. In the browser the in-page measurement of the lumpy, no-pacemaker crowd took 22.7 s and printed exactly what the headless check prints (jumps 0.46 · 0.15 · 0.29, widths 0.038 · 0.090 · 0.060, half-lock 0.968 · 0.919 · 1.035). The note: step 3 says flatly that a lumpy crowd *"arrives at the tone gradually"* before the test has qualified it. "Can arrive gradually" would keep step 3 from asserting what step 4 then partly undoes. That is wording, not a fault.

**rich-face/lumpiness-attack.wav** — keep. Byte-identical to the owner's ignored original, and tracked where it sits now. The caption's timings check out: 0.8 + 0.35·t/7 crosses 1 at t = 4 s, and the passes start at 0, 9.6 and 19.2 s. It plays seed 3 at half pacemakers, which on the walk's own measure arrives softly (jump 0.149), so "swimming in" is honest for this take.

**lumpiness.png** — keep. The caption says the walk finds part of the averaged softness is crowds locking at different places. That is the offer's finding stated in a caption, not the text's claim, and I confirmed it (below).

### Statistical Mechanics: The Mathematics of Emergence

**timbre-map.png** — keep, with a note. It tests "these statistics are … the real control surface" with 136 measured crowds. The caption could carry the steward's own caveat from cycle 8: the collapse onto coupling ÷ spread is built into this model, *"a confirmation, not a discovery."*

**timbre-walk.wav** — keep. The times match cycle 8 (snap about 4.7 s, dissolve about 19 s, release about 32 s).

### The Raster Plot as Pedagogical Tool

**raster-plot-explorer.html** — keep. A test you run yourself. The section names three patterns and the explorer makes a fourth, the chimera. The caption's claim, that the wave reads global r 0.00 while every neighbourhood is locked, I re-ran (below). It has no AudioContext, so "it draws; it doesn't sound" is true.

**raster-four-regimes.png** — keep. Accurate. The chimera is the regime the section doesn't name.

**four-regimes.wav** — keep. Accurate to cycle 6.

### Open Questions

**pacemaker-ladder.wav** — keep, with a note. The caption's *"10 cents of pitch wobble at 5%"* names a share the recording doesn't play. Its rungs are 0, 0.1, 0.2, 0.35, 0.5 and 0.65. From cycle 9's table, "13 cents at 10%, 21 at 20%" quotes rungs you can hear.

**rich-face/surge-before-lock.wav** — keep. Byte-identical to the owner's original, and the caption matches cycle 16.

**surge-before-lock.png** — keep. The swing of 0.05 / 0.08 / 0.16 matches cycle 16's table (0.051 / 0.084 / 0.159).

**crowd-size-ladder.wav** — keep. The recorded answer to the minimum-population question, and it points to the walk that lets you climb it.

## Checks run

- `conform.mjs "Neural Granular Synthesis"`: 4 pages, introduced 2, pre-contract 2, **errors 0, warnings 0**, browser pass at 760 and 1130 px.
- `fingerprint.mjs`: every section with pieces reads **in step**.
- The face on a leased rich-server, driven in headless Chromium (Playwright): **17 figures, 17 proposal chips, nothing in Lost its place, no missing-file boxes, console clean** (no errors or warnings, no page errors). **No AudioContext in any of the five frames before a click.** The ladder at step 4, locked, 512, played and read "grains a second 3093 · r 1.00 · above the floor". The attack, lumpy with no pacemakers, played a ramp. With both playing, a hide in every frame took each context from `running` to `suspended`.
- Every gathered file the manifest names is tracked. The two copied WAVs are byte-identical to the owner's originals. Nothing comes from Splice.
- The maker's `checks.mjs all`, run on a scratch copy so `checks.json` in the bundle wasn't rewritten: 1 min 59 s, every number the commit and the offers quote reproduced, both claim blocks pass.
- The steward's `render_crowd_size.py`, re-run as it stands at N = 4, 16, 32, 64, 512 (three seeds): `crowd-size-table.json` reproduced exactly.
- Ten lumpy crowds per life on the steward's own `crowd_engine.js` + `render_lumpiness.js` (not the piece's copy), on the piece's finer grid.
- The traveling wave from `kernel_lib.py` at three seeds, with global r and local r at four windows.
- `timbre-map.json` read against offers 3 and 6, which rest on it.

## The offers

**Which rest on this face's pieces, and which on the steward's earlier numbers.** Offers 1 and 2 rest on this round's pieces, re-run by the maker and again by me. Offers 4 and 5 were re-run by the maker, outside `checks.mjs` and not saved in `checks.json` for 4, and by me. **Offers 3 and 6 rest wholly on the steward's cycle 8 (`timbre-map.json`), not re-run by the maker or by me.** I only read them against that data.

1. **The Core Insight: confirmed in shape, three numbers disputed.** 90 ms at 330 Hz is 29.7 cycles, so a grain that long has a pitch, and the page's "no discernible pitch" holds only for a grain a few cycles long. Confirmed. Disputed: (a) the locked range is **5.2–6.1×**, not 5.4–6.1×. The port reads 5.17 at N = 8, and the original 5.26–6.26. (b) "Within a fifth at 16–32" rests on the port's draw at 16 (1.24×). The original reads 1.38× at 16 (seeds 1.26–1.52), so the robust statement is "from about 32". (c) "Within a tenth from 64": the port reads 1.08×, the original 1.12×, which first comes within a tenth at 256. "About an eighth from 64" holds for both. The proposed wording ("a few dozen") survives all three.
2. **Population-Level Parameters: confirmed, and sharpened.** Every number reproduces exactly, because this engine is deterministic for a given seed. I ran ten lumpy crowds per life on the steward's own engine. **No pacemakers:** jumps 0.13–0.46. Two of ten jump 0.46, as hard as the even crowd (0.458), and four of ten jump 0.29 or more. Median jump about 0.17. Each crowd locks at its own place, 0.92–1.04× the edge. **Every single crowd's 0.3 → 0.7 width (0.016–0.090) is below the averaged 0.111.** The coarser grid isn't the cause: the three crowds read on the steward's own grid give 0.036, 0.093 and 0.058. So the averaged width does measure partly the scatter between crowds. **Half pacemakers:** jumps 0.07–0.17, widths 0.08–0.15, so they reliably arrive softly. Is the page's line wrong, or does 0.111 measure something else? Both, in parts. "An evenly spread crowd locks like a switch" holds, at any pacemaker share. "A lumpy one starts agreeing early" holds (0.12–0.27 below the lock, against 0.07). "And arrives softly" holds on the median but not reliably without pacemakers. "This, not the pacemaker share, sets how hard the lock hits" is wrong even by the steward's own averaged numbers (0.111 → 0.173). Cycle 15 itself said *"pacemakers do soften the lock, but only in a lumpy crowd."* One small omission: "widths 0.10–0.12" with half pacemakers leaves out crowd 5, whose width is undefined because it already agrees above 0.3 at 0.8× (the softest of the three, not a missing one). The proposed wording stands.
3. **Population-Level Parameters, threshold variance: holds against the steward's data; not re-run.** In `timbre-map.json` every spread from 0.02 to 0.40 drifts at K = 0 (r 0.07–0.09), and each first passes r 0.5 at the first grid point past 4σ/π. So "low variance = synchronized firing" is wrong as written. Two things the offer should carry: σ here is a rate spread standing in for threshold variance, which cycle 8 calls *"argued, not tested"*; and the narrowest uncoupled crowd already has pitch clarity 0.85 at r 0.07. Low variance buys a clear pitch without any synchrony, and that strengthens the offer.
4. **Statistical Mechanics: confirmed, with a condition.** Re-run on `kernel_lib`'s traveling wave (128 neurons, 30 s settle, three seeds): global r 0.002–0.018, local r 0.91–0.95 at a 0.02 window and 0.98–0.99 at 0.01. Local r depends on the window, though: 0.71–0.79 at 0.04, and **0.25–0.39 at `kernel_lib`'s default 0.08**. "Local coherence tells them apart" needs a window narrower than one arm of the wave, a third of the ring here. The wave is also seeded (a q = 3 twist at the start), not grown from random phases. **Does the section use global r as its measure?** Yes. It names the synchrony index as "the Kuramoto order parameter, r", which is by definition the mean over the whole crowd, and it reads 0 as "incoherent", which is exactly what a wave falsifies. The page's own raster section names diagonal bands, so the page already holds both halves of this. The offer is real.
5. **Open Questions, minimum population: confirmed; it depends on r.** It rests on the ladder re-run (offer 1) and on cycle 7. The near-lock crowd (K 0.2) adds a third point the offer leaves out: it reaches 1.14–1.17× only at 512 (port and original). So the dependence on r is graded, not two-valued. The offer's "about 100–400 grains a second" takes its low end from the port's 16 rung. On the original it is about 190–380 (32–64 neurons). "Brightness settles by about 16" is the steward's number, not re-run.
6. **Open Questions, threshold variance and coupling timbre: holds against the steward's data; not re-run.** The lock goes dark at every spread (326–395 Hz at the first locked step), which confirms "760 → 330". "Brightens toward 700 Hz as coupling rises" holds only for narrow spreads within the swept K: the brightest locked crowd is 748 Hz at σ 0.02, 702 at 0.05, 519 at 0.2, 354 at 0.4. It is one curve in coupling ÷ spread, and the sweep ran out of K first. The wording should say "as coupling ÷ spread rises".

## Against the Action Potential Oscillator face

Its crowd piece (landed, `Action Potential Oscillator — rich — crowd.html`, and its Population Dynamics offer) runs a different engine, neuropulse.dsp: 32 integrate-and-fire neurons coupled through the share of the crowd spiking. It finds that the locked crowd keeps its spike's shape and darkens 48–57%, and calls coupling "like a lowpass". Nothing here contradicts it. Both faces say locking makes the crowd one voice that keeps its member's shape. This face's ladder says it as "a crowd that fires together is one big grain", and the timbre map shows the darkening at the lock (765 → 326 Hz at σ 0.2). One tension worth a line on that side: AP measured at a single coupling, 3× its half-lock. This face's map shows brightness climbing back past the lock as coupling rises (326 → 519 Hz at σ 0.2, still below the unlocked 765). So "lowpass" is true against the scattered crowd, and more coupling opens it again.

## The face as a whole

It makes the page's idea felt, and it pushes back on it. The two walks share a structure that is the page's own claim turned into a question: the population makes the sound, but only in a certain state. The ladder shows a crowd steady only while it keeps its own time. The attack shows the lock's shape set partly by how the crowd samples itself and partly by its pacemakers, not by one knob alone. Between them they show the lock doing two different things at two scales: at six grains a second it makes a pulse, at 110 Hz a pitch. That is the clearest thing a reader could take from the page, and no step says it in one breath. The gathered records are well chosen and honestly captioned. Seventeen figures is a lot, but each sits beside the line it serves, and none is filler. What I couldn't check, and neither could the maker: how any of it sounds. Whether the floor and the pulse read to the ear as the meters say is Loudon's.
