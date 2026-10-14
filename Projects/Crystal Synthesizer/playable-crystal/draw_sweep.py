#!/usr/bin/env python3
"""
draw_sweep.py — picture of one_strike_nine_lattices.wav: one A2 strike, the
selector stepped through all nine crystals two seconds apart. A log-frequency
spectrogram (numpy only, PNG written by hand, wrapped in an SVG so the crystal
names can sit over their slots). Out: one_strike_nine_lattices.svg
"""
import base64, os, struct, wave, zlib
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SLOTS = ["Diamond", "Fluorite", "Tetragonal?", "Emerald", "Ruby",
         "Amethyst", "Topaz", "Monoclinic?", "Labradorite"]

with wave.open(os.path.join(HERE, "one_strike_nine_lattices.wav")) as w:
    sr = w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768

NFFT, HOP = 16384, 1024
win = np.hanning(NFFT)
frames = range(0, len(x) - NFFT, HOP)
S = np.array([np.abs(np.fft.rfft(x[i:i + NFFT] * win)) for i in frames]).T
freqs = np.fft.rfftfreq(NFFT, 1 / sr)

W, H = 1140, 360
f_lo, f_hi = 80.0, 2400.0
rows = np.geomspace(f_hi, f_lo, H)
img = np.empty((H, S.shape[1]))
for r, f in enumerate(rows):
    img[r] = S[np.argmin(np.abs(freqs - f))]
db = 20 * np.log10(img + 1e-9)
db = np.clip((db - (db.max() - 70)) / 70, 0, 1)
cols = np.linspace(0, db.shape[1] - 1, W).astype(int)
db = db[:, cols]

# a dark-to-amber ramp (house dress: near-black ground, warm light)
r = np.clip(db * 1.6, 0, 1); g = np.clip(db * 1.2 - 0.15, 0, 1); b = np.clip(db * 0.6 - 0.2, 0, 1)
rgb = (np.stack([r, g, b], -1) * 255).astype(np.uint8)
raw = b"".join(b"\x00" + row.tobytes() for row in rgb)
def chunk(t, d): return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
png = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 2, 0, 0, 0))
       + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))

dur = len(x) / sr
top, left = 40, 0
svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H + 80}" '
       f'style="background:#0f0f0f;font-family:Manrope,system-ui,sans-serif">',
       f'<text x="12" y="24" fill="#e6e6e6" font-size="15" font-weight="600">One A2 strike, '
       f'the selector stepped every 2 s: the same ring, nine lattices (80 Hz to 2.4 kHz, log)</text>',
       f'<image x="{left}" y="{top}" width="{W}" height="{H}" '
       f'href="data:image/png;base64,{base64.b64encode(png).decode()}"/>']
for k, name in enumerate(SLOTS):
    xs = left + (2.0 * k) / dur * W
    svg.append(f'<line x1="{xs:.1f}" y1="{top}" x2="{xs:.1f}" y2="{top + H}" stroke="#ffffff" stroke-opacity="0.25"/>')
    svg.append(f'<text x="{xs + 4:.1f}" y="{top + H + 18}" fill="#e6e6e6" font-size="12">{name}</text>')
for f in (110, 220, 440, 880, 1760):
    yy = top + np.argmin(np.abs(rows - f))
    svg.append(f'<text x="{W - 6}" y="{yy + 4}" fill="#9a9a9a" font-size="10" text-anchor="end">{f} Hz</text>')
svg.append(f'<text x="12" y="{top + H + 44}" fill="#9a9a9a" font-size="11">Hypothesis slots (?) use the April '
           f'session-1 tables, not a measured mineral. Rendered by crystal-bank.codebox in Node.</text>')
svg.append("</svg>")
open(os.path.join(HERE, "one_strike_nine_lattices.svg"), "w").write("".join(svg))
print("wrote one_strike_nine_lattices.svg")
