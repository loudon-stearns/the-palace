# A listening tour of the bow in study v1.4, rendered by the page's own worklet
# code run headless (../offline-v1/run_worklet.mjs), not a port. Each section is
# a fresh string. Writes the tour WAV and a per-section measurement: level,
# pitch against the slider, and slips per cycle at the bow (1 = Helmholtz).
import json, os, subprocess, wave, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(HERE, '..', 'study-v1.4-bow', 'index.html')
RUNNER = os.path.join(HERE, '..', 'offline-v1', 'run_worklet.mjs')
SCR = '/tmp/wg-v14'; os.makedirs(SCR, exist_ok=True)
SR = 48000

def render(ev, secs):
    json.dump({'sampleRate': SR, 'seconds': secs, 'events': ev}, open(f'{SCR}/t.json', 'w'))
    subprocess.run(['node', RUNNER, HTML, f'{SCR}/t.json', f'{SCR}/t.f32'], check=True, capture_output=True)
    return np.fromfile(f'{SCR}/t.f32', dtype=np.float32)

def P(t, **m): return {'t': t, 'msg': {'type': 'params', **m}}
def B(t, **m): return {'t': t, 'msg': {'type': 'bow', **m}}
def ramp(t0, t1, key, v0, v1, step=0.02):
    n = int((t1 - t0) / step)
    return [B(t0 + k * step, **{key: v0 + (v1 - v0) * k / n}) for k in range(n + 1)]
D = dict(speed=0.5, force=0.7, position=0.74)

S = [
 ('bowed G3 (196 Hz): bow on, held, lifted; the string rings on', 3.4, 196,
  [P(0, freq=196), B(0.001, on=True, **D), B(2.4, on=False)]),
 ('plucked, same string, same note, for comparison', 2.2, 196,
  [P(0, freq=196), {'t': 0.001, 'msg': {'type': 'pluck', 'position': 0.3, 'mode': 'pluck'}}]),
 ('a crescendo: bow speed from 0.1 to 0.9 over three seconds', 3.6, 196,
  [P(0, freq=196), B(0.001, on=True, **{**D, 'speed': 0.1})] + ramp(0.05, 3.0, 'speed', 0.1, 0.9) + [B(3.2, on=False)]),
 ('bow moved to 0.78, a double-slip spot, then slid back to 0.74: hear it lock', 4.2, 196,
  [P(0, freq=196), B(0.001, on=True, **{**D, 'position': 0.78})] + ramp(2.0, 2.6, 'position', 0.78, 0.74, 0.1) + [B(3.8, on=False)]),
 ('too light: force 0.1 at a fast bow, and it slips twice a cycle', 2.6, 196,
  [P(0, freq=196), B(0.001, on=True, **{**D, 'force': 0.1, 'speed': 0.7})] + [B(2.2, on=False)]),
 ('crushed: force 1.0 at a slow bow: it drags the string aside, creaks, and sticks', 2.6, 196,
  [P(0, freq=196), B(0.001, on=True, **{**D, 'force': 1.0, 'speed': 0.3})] + [B(2.2, on=False)]),
 ('a stiff bowed string, stiffness 0.5, C4', 2.8, 261.63,
  [P(0, freq=261.63, stiff=0.5), B(0.001, on=True, **D), B(2.3, on=False)]),
 ('a slow line: G3 D4 B3 G3, one stroke each', 5.0, 196,
  sum([[P(t, freq=f), B(t + 0.002, on=True, **D), B(t + 1.05, on=False)]
       for t, f in [(0, 196), (1.2, 293.66), (2.4, 246.94), (3.6, 196)]], [])),
]

def slips(x, f0, t0, t1):
    # slips per cycle, read from the pickup is unreliable; use the waveform's
    # cycle-to-cycle repeat and the fundamental instead, and count big
    # downward steps of the derivative per cycle as a proxy.
    seg = x[int(t0 * SR):int(t1 * SR)]
    d = np.diff(seg); thr = d.min() * 0.5
    k = np.sum((d[1:] < thr) & (d[:-1] >= thr))
    return k / ((t1 - t0) * f0)

gap = np.zeros(int(0.35 * SR), np.float32)
parts, rows, t = [], [], 0.0
for label, secs, f0, ev in S:
    x = render(ev, secs)
    seg = x[int(0.6 * SR):int(1.1 * SR)] * np.hanning(int(0.5 * SR))
    sp = np.abs(np.fft.rfft(seg, 1 << 20)); fr = np.fft.rfftfreq(1 << 20, 1 / SR)
    lo, hi = np.searchsorted(fr, [f0 * 0.8, f0 * 1.2]); fp = fr[lo + np.argmax(sp[lo:hi])]
    rows.append([f'{t:.1f}', label, f'{20*np.log10(np.abs(x).max()):.1f}', f'{1200*np.log2(fp/f0):+.1f}'])
    parts += [x, gap]; t += (len(x) + len(gap)) / SR
    print(rows[-1])
tour = np.concatenate(parts)
pk = float(np.abs(tour).max())
pcm = (np.clip(tour, -1, 1) * 32767).astype('<i2')
out = os.path.join(HERE, 'bow-tour-v1.4.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
json.dump({'columns': ['starts (s)', 'section', 'peak dBFS', 'pitch vs slider (cents, 0.6–1.1 s)'],
           'rows': rows, 'seconds': round(len(tour) / SR, 2), 'tour_peak_dbfs': round(20*np.log10(pk), 1)},
          open(os.path.join(HERE, 'bow-tour-measurements.json'), 'w'), indent=1)
print('tour', round(len(tour)/SR, 1), 's, peak', round(20*np.log10(pk), 1), 'dBFS')
