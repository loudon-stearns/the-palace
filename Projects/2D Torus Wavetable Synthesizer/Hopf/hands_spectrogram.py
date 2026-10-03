#!/usr/bin/env python3
"""hands_spectrogram.py — spectrogram of a hands-tour render, with the
four sections labelled. numpy + Tools/tinyplot.py only.

    python3 Hopf/hands_spectrogram.py Hopf/hands_tour_penrose.wav Hopf/hands_tour_penrose.png
"""
import os, struct, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'Tools'))
from tinyplot import text, line, write_png

src, dst = sys.argv[1], sys.argv[2]
b = open(src, 'rb').read(); i = b.find(b'data'); n = struct.unpack('<I', b[i + 4:i + 8])[0]
x = np.frombuffer(b[i + 8:i + 8 + n], dtype='<f4').astype(float); SR = 48000
H, NF, FMAX = 256, 4096, 8000.0
frames = np.arange(0, len(x) - NF, H)
win = np.hanning(NF)
S = np.array([np.abs(np.fft.rfft(x[f:f + NF] * win)) for f in frames]).T
freqs = np.fft.rfftfreq(NF, 1 / SR)
S = S[freqs <= FMAX]
db = 20 * np.log10(S / S.max() + 1e-9); db = np.clip((db + 70) / 70, 0, 1)

PW, PH, L, T = 960, 360, 60, 40
cols = np.linspace(0, db.shape[1] - 1, PW).astype(int)
rows = np.linspace(db.shape[0] - 1, 0, PH).astype(int)
v = db[np.ix_(rows, cols)]
img = np.zeros((PH + T + 40, PW + L + 20, 3), np.uint8); img[:] = (10, 10, 15)
img[T:T + PH, L:L + PW, 0] = (10 + 222 * v ** 1.5).astype(np.uint8)
img[T:T + PH, L:L + PW, 1] = (10 + 174 * v ** 1.8).astype(np.uint8)
img[T:T + PH, L:L + PW, 2] = (15 + 59 * v ** 3).astype(np.uint8)
dur = len(x) / SR
for t, lab in [(0, 'BARE 3:2'), (3, 'BEND'), (8, 'SHEAR'), (13, 'STIR'), (18, 'ALL THREE, KNOT OPENS')]:
    px = L + int(PW * t / dur)
    if t: line(img, (px, T), (px, T + PH), (138, 138, 160))
    text(img, px + 4, T - 14, lab, (200, 200, 216))
for f in (0, 2000, 4000, 6000, 8000):
    py = T + PH - int(PH * f / FMAX); text(img, 4, max(T, py - 7), f'{f // 1000}K', (138, 138, 160))
for s in range(0, int(dur) + 1, 4):
    text(img, L + int(PW * s / dur) - 4, T + PH + 8, f'{s}S', (138, 138, 160))
write_png(dst, img)
print('wrote', dst)
