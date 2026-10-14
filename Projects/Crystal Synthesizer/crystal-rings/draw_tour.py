#!/usr/bin/env python3
"""
draw_tour.py — picture of ring_tour.wav: each palette mineral struck at A2 and
then A4 with the physics lifetimes (Q from Raman line widths). Log-frequency
spectrogram, numpy only; adapted from ../playable-crystal/draw_sweep.py.
Out: ring_tour.svg
"""
import base64, os, struct, wave, zlib
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SLOTS = ["Diamond", "Fluorite", "Emerald", "Ruby", "Amethyst", "Topaz", "Labradorite"]
STARTS = []
_t = 0.0
for _n in SLOTS:
    STARTS.append(_t)
    _t += (3.2 if _n == "Diamond" else 1.6) * 2 + 0.6

with wave.open(os.path.join(HERE, "ring_tour.wav")) as w:
    sr = w.getframerate()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768

NFFT, HOP = 4096, 256
win = np.hanning(NFFT)
frames = range(0, len(x) - NFFT, HOP)
S = np.array([np.abs(np.fft.rfft(x[i:i + NFFT] * win)) for i in frames]).T
freqs = np.fft.rfftfreq(NFFT, 1 / sr)

W, H = 1140, 360
f_lo, f_hi = 80.0, 4000.0
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
       f'<text x="12" y="24" fill="#e6e6e6" font-size="15" font-weight="600">Each mineral struck at A2, then A4, ringing for as long as '
       f'its Raman line width says (80 Hz to 4 kHz, log)</text>',
       f'<image x="{left}" y="{top}" width="{W}" height="{H}" '
       f'href="data:image/png;base64,{base64.b64encode(png).decode()}"/>']
for k, name in enumerate(SLOTS):
    xs = left + STARTS[k] / dur * W
    svg.append(f'<line x1="{xs:.1f}" y1="{top}" x2="{xs:.1f}" y2="{top + H}" stroke="#ffffff" stroke-opacity="0.25"/>')
    svg.append(f'<text x="{xs + 4:.1f}" y="{top + H + 18}" fill="#e6e6e6" font-size="12">{name}</text>')
for f in (110, 220, 440, 880, 1760, 3520):
    yy = top + np.argmin(np.abs(rows - f))
    svg.append(f'<text x="{W - 6}" y="{yy + 4}" fill="#9a9a9a" font-size="10" text-anchor="end">{f} Hz</text>')
svg.append(f'<text x="12" y="{top + H + 44}" fill="#9a9a9a" font-size="11">Q = line position / line width; two minerals measured (diamond, '
           f'quartz), the rest estimated, see linewidths.json. Rendered by crystal-ring-voice.codebox in Node.</text>')
svg.append("</svg>")
open(os.path.join(HERE, "ring_tour.svg"), "w").write("".join(svg))
print("wrote ring_tour.svg")
