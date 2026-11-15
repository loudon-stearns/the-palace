# lesson — the first twenty minutes

`first-twenty-minutes.html` is the lesson's opening walk, one page, six stops, every stop playable in the browser (WebAudio, 24 partials at 220 Hz):

1. **A flat line** — the harmonic series drawn as the flat line, played as a soft saw.
2. **Bend it** — drag or slide the stiffness B in fₙ = n·f₀·√(1 + B·n²) and hear one note stop being one note.
3. **A real piano** — the measured bends of piano A2 and C6 from `../trajectory-library/`, dots for what was measured and the fitted curve, both played at 220 Hz so only the bend differs.
4. **A bell** — the measured bell modes filed Rank or Nearest, with a bend slider to flatten them; the same switch Bent Line has.
5. **The line decides the scale** — Sethares' roughness curve for the current timbre, unison to 1500¢; the octave valley moves sharp as the line bends. Click the curve to hear any interval.
6. **Your turn** — "How do you feel?" and a note box that stays in the browser.

Edit `first-twenty-minutes.template.html`, then run `python3 build_lesson.py`; it inlines the trajectory data and prints the octave numbers the page computes. `?stop=5&b5=1` (and `?stop=4&filing=nearest&bend=0`) open a stop in a set state, which is how the pictures in `shots/` were taken with headless Chrome.

Measured 2026-11-15 (24-partial 1/n saw at 220 Hz): the smoothest octave sits at 1200¢ flat, 1202¢ at B = 0.0005, 1205¢ at 0.002, 1208¢ at piano C6's fitted 0.0029, 1220¢ at 0.008 and 1261¢ at 0.025. Real piano stiffness only moves it a few cents, so stop 5's slider runs to 0.025, past any string, to make the slide visible.

Not checked: nobody has listened to it, and it has been run only in headless Chrome (drawing, not sound).
