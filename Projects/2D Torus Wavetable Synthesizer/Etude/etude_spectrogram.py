#!/usr/bin/env python3
"""etude_spectrogram.py — spectrogram of Étude No. 1 with its four
movements labelled, plus a per-window peak table so the score can be
checked against what the codebox actually played. numpy + Tools/tinyplot.py.

    python3 etude_spectrogram.py $TMPDIR/etude_one_sphere_mono.wav etude_one_sphere.png
"""
import os, struct, sys, json
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'Tools'))
from tinyplot import text, line, write_png

src, dst = sys.argv[1], sys.argv[2]
FMAX = 700.0
b = open(src, 'rb').read(); i = b.find(b'data'); n = struct.unpack('<I', b[i + 4:i + 8])[0]
x = np.frombuffer(b[i + 8:i + 8 + n], dtype='<f4').astype(float); SR = 48000
H, NF = 1024, 16384
frames = np.arange(0, len(x) - NF, H)
win = np.hanning(NF)
S = np.array([np.abs(np.fft.rfft(x[f:f + NF] * win)) for f in frames]).T
freqs = np.fft.rfftfreq(NF, 1 / SR)
S = S[freqs <= FMAX]
db = 20 * np.log10(S / S.max() + 1e-9); db = np.clip((db + 60) / 60, 0, 1)

PW, PH, L, T = 1200, 420, 60, 40
cols = np.linspace(0, db.shape[1] - 1, PW).astype(int)
rows = np.linspace(db.shape[0] - 1, 0, PH).astype(int)
v = db[np.ix_(rows, cols)]
img = np.zeros((PH + T + 40, PW + L + 20, 3), np.uint8); img[:] = (10, 10, 15)
img[T:T + PH, L:L + PW, 0] = (10 + 222 * v ** 1.5).astype(np.uint8)
img[T:T + PH, L:L + PW, 1] = (10 + 174 * v ** 1.8).astype(np.uint8)
img[T:T + PH, L:L + PW, 2] = (15 + 59 * v ** 3).astype(np.uint8)
t0 = NF / 2 / SR; span = (len(frames) * H) / SR
def px_of(t): return L + int(PW * (t - t0) / span)
for t, lab in [(0, 'I ONE POINT'), (12, 'STAIRCASE'), (30, 'II KNOT'), (44, 'LET GO'), (56, 'GRAB'),
               (62, 'III HANDS'), (84, 'IV'), (93, 'GRAB')]:
    px = max(L, px_of(t))
    if t: line(img, (px, T), (px, T + PH), (138, 138, 160))
    text(img, px + 4, T - 14, lab, (200, 200, 216))
for f in range(0, int(FMAX) + 1, 100):
    py = T + PH - int(PH * f / FMAX); text(img, 4, max(T, py - 7), str(f), (138, 138, 160))
for s in range(0, 101, 10):
    text(img, px_of(s) - 4, T + PH + 8, f'{s}S', (138, 138, 160))
write_png(dst, img)

# peaks at named moments: the three strongest spectral peaks under 400 Hz
def peaks(t):
    a = int(t * SR); seg = x[a:a + 32768] * np.hanning(32768)
    s = np.abs(np.fft.rfft(seg)); f = np.fft.rfftfreq(32768, 1 / SR)
    m = (f > 20) & (f < 400); s, f = s[m], f[m]
    idx = [k for k in range(1, len(s) - 1) if s[k] > s[k - 1] and s[k] >= s[k + 1]]
    idx = sorted(idx, key=lambda k: -s[k])[:3]
    return [round(float(f[k]), 1) for k in sorted(idx)]
out = {t: peaks(t) for t in [5, 36, 50, 60, 76, 88, 97]}
print(json.dumps(out))
print('wrote', dst)
