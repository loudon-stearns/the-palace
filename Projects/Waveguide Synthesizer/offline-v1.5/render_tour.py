# The listening tour for v1.5: the same stiffness setting played up the range,
# first through v1.4, then through v1.5. Rendered by each page's own worklet,
# headless (../offline-v1/run_worklet.mjs). Writes even-stiffness-tour.wav.
import json, os, wave, numpy as np
from measure_v15 import render, V14, V15, SR, HERE
NOTES = [82.41, 164.81, 329.63, 440.0, 659.25]           # E2 E3 E4 A4 E5
def note(html, f, stiff):
    ev = [{'t': 0, 'msg': {'type': 'params', 'freq': f, 'stiff': stiff, 'bright': 0.7}},
          {'t': 0.001, 'msg': {'type': 'pluck', 'position': 0.13, 'mode': 'strike'}}]
    x = render(html, ev, 1.3); fade = np.ones_like(x); fade[-int(0.15*SR):] = np.linspace(1, 0, int(0.15*SR))
    return x * fade
gap = lambda s: np.zeros(int(s*SR), np.float32)
sections = [('v1.4, stiffness 0.67, E2 E3 E4 A4 E5', V14, 0.67),
            ('v1.5, stiffness 0.67, the same five notes', V15, 0.67),
            ('v1.5, stiffness 0, every note harmonic', V15, 0.0),
            ('v1.5, stiffness 0.83, bell-like at every pitch', V15, 0.83)]
parts, rows, t = [], [], 0.0
for label, html, st in sections:
    rows.append([f'{t:.1f}', label]); 
    for f in NOTES:
        x = note(html, f, st); parts += [x, gap(0.1)]; t += (len(x) + int(0.1*SR)) / SR
    parts.append(gap(0.8)); t += 0.8
tour = np.concatenate(parts); pk = float(np.abs(tour).max())
with wave.open(os.path.join(HERE, 'even-stiffness-tour.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(tour, -1, 1)*32767).astype('<i2').tobytes())
json.dump({'sections': rows, 'seconds': round(len(tour)/SR, 1), 'peak_dbfs': round(20*np.log10(pk), 1)},
          open(os.path.join(HERE, 'tour-sections.json'), 'w'), indent=1)
print(rows, round(len(tour)/SR, 1), 's, peak', round(20*np.log10(pk), 1))
