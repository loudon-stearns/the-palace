#!/usr/bin/env python3
"""het_spectrogram.py — spectrogram of a heterodyne-tour render, sections
labelled, with the predicted slip rate (Adler) drawn over it as dots.
numpy + Tools/tinyplot.py only.

    python3 het_spectrogram.py het_tour_penrose_voice.wav het_tour_penrose_track.txt out.png [fmax]
"""
import os, struct, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'Tools'))
from tinyplot import text, line, write_png

src, trk, dst = sys.argv[1], sys.argv[2], sys.argv[3]
FMAX = float(sys.argv[4]) if len(sys.argv) > 4 else 400.0
b = open(src, 'rb').read(); i = b.find(b'data'); n = struct.unpack('<I', b[i + 4:i + 8])[0]
x = np.frombuffer(b[i + 8:i + 8 + n], dtype='<f4').astype(float); SR = 48000
H, NF = 256, 16384 if FMAX <= 1000 else 4096
frames = np.arange(0, len(x) - NF, H)
win = np.hanning(NF)
S = np.array([np.abs(np.fft.rfft(x[f:f + NF] * win)) for f in frames]).T
freqs = np.fft.rfftfreq(NF, 1 / SR)
S = S[freqs <= FMAX]
db = 20 * np.log10(S / S.max() + 1e-9); db = np.clip((db + 60) / 60, 0, 1)

PW, PH, L, T = 960, 360, 60, 40
dur = len(x) / SR
cols = np.linspace(0, db.shape[1] - 1, PW).astype(int)
rows = np.linspace(db.shape[0] - 1, 0, PH).astype(int)
v = db[np.ix_(rows, cols)]
img = np.zeros((PH + T + 40, PW + L + 20, 3), np.uint8); img[:] = (10, 10, 15)
img[T:T + PH, L:L + PW, 0] = (10 + 222 * v ** 1.5).astype(np.uint8)
img[T:T + PH, L:L + PW, 1] = (10 + 174 * v ** 1.8).astype(np.uint8)
img[T:T + PH, L:L + PW, 2] = (15 + 59 * v ** 3).astype(np.uint8)
# frames are centred NF/2 samples late: shift the time axis to match
t0 = NF / 2 / SR; span = (len(frames) * H) / SR
def px_of(t): return L + int(PW * (t - t0) / span)
for ln in open(trk).read().split('\n')[1:]:
    if not ln.strip(): continue
    t, _, p, _ = ln.split('\t'); t, p = float(t), float(p)
    if t0 <= t <= t0 + span and 0 < p < FMAX:
        X, Y = px_of(t), T + PH - int(PH * p / FMAX)
        img[Y - 1:Y + 2, X - 1:X + 2] = (139, 220, 255)
for t, lab in [(0, 'VOICE IN'), (4, 'LET GO'), (8, 'GLIDE THRU 3:2'), (16, 'GRAB'), (20, 'VOICE OUT')]:
    px = max(L, px_of(t))
    if t: line(img, (px, T), (px, T + PH), (138, 138, 160))
    text(img, px + 4, T - 14, lab, (200, 200, 216))
step = 100 if FMAX <= 500 else 1000
for f in range(0, int(FMAX) + 1, step):
    py = T + PH - int(PH * f / FMAX); text(img, 4, max(T, py - 7), str(f), (138, 138, 160))
for s in range(0, int(dur) + 1, 4):
    text(img, px_of(s) - 4, T + PH + 8, f'{s}S', (138, 138, 160))
write_png(dst, img)
print('wrote', dst)
