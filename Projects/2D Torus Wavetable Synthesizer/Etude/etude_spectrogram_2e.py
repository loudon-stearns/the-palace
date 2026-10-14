#!/usr/bin/env python3
"""etude_spectrogram.py — spectrogram of Étude No. 2 (fifth draft, "The Hero's Journey") with its
sections labelled, plus a per-window peak table so the score can be
checked against what the codebox actually played. numpy + Tools/tinyplot.py.

    python3 etude_spectrogram.py $TMPDIR/etude_two_e_mono.wav etude_two_e_heros_journey.png
"""
import os, struct, sys, json
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'Tools'))
from tinyplot import text, line, write_png

src, dst = sys.argv[1], sys.argv[2]
FMAX = 1200.0
b = open(src, 'rb').read(); i = b.find(b'data'); n = struct.unpack('<I', b[i + 4:i + 8])[0]
x = np.frombuffer(b[i + 8:i + 8 + n], dtype='<f4').astype(float); SR = 48000
H, NF = 1024, 16384
frames = np.arange(0, len(x) - NF, H)
win = np.hanning(NF)
S = np.array([np.abs(np.fft.rfft(x[f:f + NF] * win)) for f in frames]).T
freqs = np.fft.rfftfreq(NF, 1 / SR)
S = S[freqs <= FMAX]
db = 20 * np.log10(S / S.max() + 1e-9); db = np.clip((db + 60) / 60, 0, 1)

PW, PH, L, T = 1400, 440, 60, 48
cols = np.linspace(0, db.shape[1] - 1, PW).astype(int)
rows = np.linspace(db.shape[0] - 1, 0, PH).astype(int)
v = db[np.ix_(rows, cols)]
img = np.zeros((PH + T + 40, PW + L + 20, 3), np.uint8); img[:] = (10, 10, 15)
img[T:T + PH, L:L + PW, 0] = (10 + 222 * v ** 1.5).astype(np.uint8)
img[T:T + PH, L:L + PW, 1] = (10 + 174 * v ** 1.8).astype(np.uint8)
img[T:T + PH, L:L + PW, 2] = (15 + 59 * v ** 3).astype(np.uint8)
t0 = NF / 2 / SR; span = (len(frames) * H) / SR
def px_of(t): return L + int(PW * (t - t0) / span)
SECTIONS = json.load(open(os.path.join(os.path.dirname(__file__), 'etude_two_e_locks.json')))['sections']
for t, lab in SECTIONS:
    px = max(L, px_of(t))
    if t: line(img, (px, T), (px, T + PH), (138, 138, 160))
    text(img, px + 4, T - 14 - 12 * (SECTIONS.index([t, lab]) % 2) + 4, lab, (200, 200, 216))
for f in range(0, int(FMAX) + 1, 100):
    py = T + PH - int(PH * f / FMAX); text(img, 4, max(T, py - 7), str(f), (138, 138, 160))
for s in range(0, int(len(x) / SR) + 1, 10):
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
out = {round(t + 1.5, 1): peaks(t + 1.5) for t, _ in SECTIONS}
print(json.dumps(out))
print('wrote', dst)
