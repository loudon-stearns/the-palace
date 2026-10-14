#!/usr/bin/env python3
"""Render instrument-tour.wav with instrument.html's own engine (run in node), so
the tour is exactly what the page plays. Three phrases of the same five notes:
  1 square drum, then square box: same shape, the equation flipped (theta 0.03 deg)
  2 round box at theta 0.01, 0.1 and 1 deg: the angle of i from bell to knock to click
  3 round drum struck dead centre, then off centre
Writes instrument-tour.wav (mono, 44.1 kHz) beside this script."""
import json, os, re, subprocess, wave
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
core = re.search(r'<script id="core">(.*?)</script>', open(os.path.join(HERE, "instrument.html")).read(), re.S).group(1)
SR = 44100
D = {"square": ([0.23, 0.31], [0.37, 0.71]), "disk": ([0.42, 0.3], [0.63, 2.2])}
PHRASE = [0, 4, 7, 12, 7]          # semitones above A3: a broken major arpeggio
STEP = 0.42
PARTS = [  # (label, eq, shape, strike, theta)
    ("square drum", "wave", "square", None, 0.03), ("square box", "schr", "square", None, 0.03),
    ("round box 0.01°", "schr", "disk", None, 0.01), ("round box 0.1°", "schr", "disk", None, 0.1),
    ("round box 1°", "schr", "disk", None, 1.0),
    ("round drum, dead centre", "wave", "disk", [0, 0], 0.03), ("round drum", "wave", "disk", None, 0.03)]
jobs = [dict(eq=e, shape=s, S=S or D[s][0], P=D[s][1], th=t) for _, e, s, S, t in PARTS]
js = core + f"""
const J = {json.dumps(jobs)};
console.log(JSON.stringify(J.map(j => {{ const b = build(j.shape, j.eq, j.S, j.P, 0.25);
  return {json.dumps(PHRASE)}.map(s => {{ const y = render(b.partials, 220 * Math.pow(2, s / 12), j.th, {SR}, 2.5);
    let pk = 0; for (const v of y) pk = Math.max(pk, Math.abs(v)); return Array.from(y, v => v / pk); }}); }})));"""
out = json.loads(subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True).stdout)
total = int(SR * (0.3 + len(PARTS) * (len(PHRASE) * STEP + 2.2)))
mix = np.zeros(total); t = 0.3; marks = []
for (label, *_), notes in zip(PARTS, out):
    marks.append(f"{t:5.1f} s  {label}")
    for i, y in enumerate(notes):
        a = int((t + i * STEP) * SR); y = np.array(y)
        mix[a:a + len(y)] += 0.35 * y[:total - a]
    t += len(PHRASE) * STEP + 2.2
mix = mix[:int((t - 1.0) * SR)]
fade = int(0.5 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
mix *= 0.8 / np.abs(mix).max()
with wave.open(os.path.join(HERE, "instrument-tour.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print(f"wrote instrument-tour.wav ({len(mix) / SR:.1f} s)"); print("\n".join(marks))
