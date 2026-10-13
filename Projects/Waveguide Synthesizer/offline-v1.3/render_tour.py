# A listening tour of study v1.3, rendered by the page's own worklet code run
# headless (../offline-v1/run_worklet.mjs) — not a port. Each section is a fresh
# string; the sections are joined with a short silence. Writes the tour WAV and
# a per-section measurement (peak level, the lowest strong partial, and how far
# the first partials sit from a harmonic series).
import json, os, subprocess, wave, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(HERE, '..', 'study-v1.3-audible', 'index.html')
RUNNER = os.path.join(HERE, '..', 'offline-v1', 'run_worklet.mjs')
SCR = '/tmp/wg-v13'; os.makedirs(SCR, exist_ok=True)
SR = 48000

def section(freq, pos, mode, secs, stiff=0.0, bright=0.55, bridge=0.985, nut=0.995, notes=None, damp_at=None):
    ev = [{'t': 0, 'msg': {'type': 'params', 'freq': freq, 'bright': bright, 'bridge': bridge, 'nut': nut, 'stiff': stiff}}]
    for (t, f) in (notes or [(0, freq)]):
        if t > 0:
            ev += [{'t': t - 0.06, 'msg': {'type': 'damp', 'on': True}},
                   {'t': t - 0.005, 'msg': {'type': 'damp', 'on': False}},
                   {'t': t - 0.004, 'msg': {'type': 'params', 'freq': f}}]
        ev.append({'t': t, 'msg': {'type': 'pluck', 'position': pos, 'mode': mode}})
    if damp_at: ev.append({'t': damp_at, 'msg': {'type': 'damp', 'on': True}})
    sc, of = f'{SCR}/s.json', f'{SCR}/s.f32'
    json.dump({'sampleRate': SR, 'seconds': secs, 'events': ev}, open(sc, 'w'))
    subprocess.run(['node', RUNNER, HTML, sc, of], check=True, capture_output=True)
    return np.fromfile(of, dtype=np.float32)

def partials(x, f0, n=10):
    # the first n spectral peaks (0.5 s from 20 ms in), each the tallest bin in a
    # window walked up from the previous peak, so stretched partials are followed
    seg = x[int(0.02 * SR): int(0.52 * SR)] * np.hanning(int(0.5 * SR))
    spec = np.abs(np.fft.rfft(seg, 1 << 20)); fr = np.fft.rfftfreq(1 << 20, 1 / SR)
    out, prev = [], 0.0
    for k in range(1, n + 1):
        guess = prev + (out[0] if out else f0)
        lo, hi = np.searchsorted(fr, [guess - 0.4 * f0, guess + 0.4 * f0])
        prev = fr[lo + np.argmax(spec[lo:hi])]; out.append(prev)
    return np.array(out)

S = [  # (label, kwargs)
    ('pluck G3 (196 Hz) near the nut end', dict(freq=196, pos=0.3, mode='pluck', secs=3.0)),
    ('same note, plucked right by the bridge: thin', dict(freq=196, pos=0.93, mode='pluck', secs=3.0)),
    ('strike instead of pluck', dict(freq=196, pos=0.3, mode='strike', secs=3.0)),
    ('dark: brightness 0.15', dict(freq=196, pos=0.3, mode='pluck', secs=3.0, bright=0.15)),
    ('stiff string, G3 (196 Hz), stiffness 0.75', dict(freq=196, pos=0.2, mode='pluck', secs=3.5, stiff=0.75, bridge=0.995)),
    ('very stiff, C4 (262 Hz), stiffness 1.0, struck: a bar', dict(freq=261.63, pos=0.13, mode='strike', secs=3.5, stiff=1.0, bridge=0.997, bright=0.9)),
    ('same stiffness 1.0, low E2 (82 Hz): barely stretched', dict(freq=82.41, pos=0.13, mode='strike', secs=3.0, stiff=1.0, bridge=0.997, bright=0.9)),
    ('four notes, damped between: G3 B3 D4 G4', dict(freq=196, pos=0.3, mode='pluck', secs=3.6,
        notes=[(0, 196), (0.6, 246.94), (1.2, 293.66), (1.8, 392)], damp_at=3.3)),
]
gap = np.zeros(int(0.35 * SR), np.float32)
parts, rows, t = [], [], 0.0
for label, kw in S:
    x = section(**kw)
    f0 = kw['freq']
    p = partials(x, f0)
    stretch = (p / (np.arange(1, 11) * p[0]) - 1) * 1200   # cents each partial sits above k × the first
    rows.append([f'{t:.1f}', label, f'{20*np.log10(np.abs(x).max()):.1f}',
                 f'{p[0]:.1f}', f'{1200*np.log2(p[0]/f0):+.1f}', f'{stretch[9]:+.0f}'])
    parts += [x, gap]; t += (len(x) + len(gap)) / SR
tour = np.concatenate(parts)
pk = float(np.abs(tour).max())
pcm = (np.clip(tour, -1, 1) * 32767).astype('<i2')
out = os.path.join(HERE, 'listening-tour-v1.3.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
json.dump({'columns': ['starts (s)', 'section', 'peak dBFS', 'first partial (Hz)', 'vs slider (cents)', '10th partial above 10× first (cents)'],
           'rows': rows, 'seconds': round(len(tour) / SR, 2), 'tour_peak_dbfs': round(20*np.log10(pk), 1)},
          open(os.path.join(HERE, 'tour-measurements.json'), 'w'), indent=1)
for r in rows: print(' | '.join(r))
print('tour', round(len(tour)/SR,1), 's, peak', round(20*np.log10(pk),1), 'dBFS')
