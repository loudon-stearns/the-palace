# The bell paragraph: a drafted fix for [[Quantum Synthesizer]]

*Drafted by the Quantum Synthesizer steward, cycle 17 (2026-10-14), for an elder to land. Nothing here has been written to the entry. It is the fifth draft in this bundle. The first one (one equation, two spacings) has already landed. The Hermite, operators and opening drafts are still waiting on Loudon's yes, and this one can land with them. With it, every claim in the entry's body has been tested with sound.*

## What the elder is asked to do

In `Quantum Synthesizer.md`, section *Anharmonicity through Potential Shaping*, **replace the last paragraph**, the one that begins *"Similarly, a struck bell or tam-tam has a potential landscape determined by its shape"* and ends *"…forces inharmonic eigenmodes]]."*, with the paragraph below. Nothing else in the section changes.

**Why.** `drum.py` built six instruments with the same walls, mallet, pickup rule and damping, and the lowest partial at 220 Hz in every one. It has three shapes (a line, a square, a circle), each under both equations, plus a seventh strike: the round drum hit dead centre. Four checks, all PASS (`drum-checks.txt`):

- The Bessel zeros the circle uses agree with an independent radial finite-difference solve of the drum equation to about 1e-7 (m = 0 to 3, three zeros each).
- A separate 2D grid solve on a square grid cut to a disk finds the same first 12 levels to 4e-4, with the same five cos/sin twin pairs.
- Read from the **sound** of each strike, the strongest spectral peaks land on the predicted partials. The worst miss is under 0.001 Hz.
- Autocorrelation of each sound, scanned from 1 to 60 ms: the string, the line box and the **square box** come back to 1.0000. The square drum (best 0.68), the round drum (0.75) and the round box (0.72) never do.

What that does to the current text:

- *"a potential landscape determined by its shape"*: a drum has no potential at all. Its rim does the work, the way the walls do in the box. The two are different knobs in the entry's own vocabulary: the walls choose the shapes, and a potential is a well.
- *"(circular membrane, thick walls)"*: a bell is not a membrane. It is a thick curved shell, and its partials come from bending, not stretching. The drum is the honest test of the circle claim, so that is what was tested.
- *"the geometry of circular resonators forces inharmonic eigenmodes"*: half true. For a drum, the square is just as inharmonic as the circle, so it is the **second dimension** that breaks the series, not the circle. Under Schrödinger's rule the square box squares its roots back into whole numbers and repeats exactly, and only the circle stays inharmonic. So the claim is exactly right for Schrödinger and too narrow for drums.

Not tested here: bells. The founder's tuning in the last sentence below (hum, prime, tierce, quint, nominal) is bell-founding lore, not something this script measured. Also not tested: real timpani, whose air-filled kettle pulls the membrane's partials toward a harmonic series. An elder may cut that sentence if it reads as a claim the page hasn't earned.

---

## The paragraph

A drum is the same story one dimension up, and it sharpens the claim. Stretch the string into a skin and the harmonic series breaks. A round drum's partials sit at 1 · 1.59 · 2.14 · 2.30 · 2.65, the zeros of Bessel functions. A square drum's sit at 1 · 1.58 · 2 · 2.24 · 2.55, the square roots of whole numbers. Neither tone ever repeats ([seven strikes](Projects/Quantum Synthesizer/proofs/drum.mp4)). So for a drum it isn't the circle that breaks the series. It's the second dimension. Schrödinger draws the line somewhere else. A square box squares those roots back into whole numbers, 2 · 5 · 8 · 10 · 13, and the tone repeats exactly, 110 times a second, an octave below its lowest partial. A round box squares the Bessel zeros, which land no nearer to whole numbers, and it never repeats. Under Schrödinger's rule it really is [[Harmonicity and Inharmonicity|the geometry of circular resonators that forces inharmonic eigenmodes]]. Where you strike picks which of them ring: hit a round drum dead centre and only its rings sound, 1 · 2.30 · 3.60 · 4.90, almost evenly spaced. A bell is neither a drum nor a box. It is a thick curved shell, and the founder's craft is shaving its walls until five of its partials line up.
