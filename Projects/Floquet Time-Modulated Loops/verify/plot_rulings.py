"""Draw the two calls: four damping sweeps (level over time, expected crack marked)
and the three saturations (spectrum at q 0.6). Reads the WAVs mathieu_mirror.mjs wrote."""
import os, json
import numpy as np
from scipy.io import wavfile
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
here = os.path.dirname(os.path.abspath(__file__)); aud = os.path.join(here, "..", "audio", "rulings")
R = json.load(open(os.path.join(here, "mirror_report.json")))
plt.rcParams.update({"figure.facecolor": "#14161a", "axes.facecolor": "#14161a", "text.color": "#e8e4dc",
    "axes.labelcolor": "#e8e4dc", "xtick.color": "#a9a59c", "ytick.color": "#a9a59c", "axes.edgecolor": "#55524c", "font.size": 10})
fig, ax = plt.subplots(1, 2, figsize=(13, 4.6))
sr, a = wavfile.read(os.path.join(aud, "call1_damping_four_sweeps.wav")); seg = 6 * sr; gap = int(0.6 * sr)
cols = ["#e0a040", "#d06a4a", "#7fc4a0", "#7aa6e0"]
for j, z in enumerate([0, 0.0125, 0.025, 0.05]):
    s = a[j * (seg + gap): j * (seg + gap) + seg]; w = sr // 50
    lv = 20 * np.log10(np.sqrt(np.convolve(s ** 2, np.ones(w) / w, "valid"))[::w] + 1e-12)
    q = np.linspace(0, 0.3, len(lv))
    ax[0].plot(q, lv, color=cols[j], lw=1.4, label=f"ζ = {z}  (threshold q = {2*z:.3f})")
    if z: ax[0].axvline(2 * z, color=cols[j], ls=":", lw=1)
ax[0].set_xlabel("pump depth q (swept 0 → 0.3 over 6 s)"); ax[0].set_ylabel("level, dB (each sweep, 20 ms)")
ax[0].set_title("Call 1 — how much damping: the crack moves to q = 2ζ"); ax[0].legend(frameon=False, fontsize=9)
sr, b = wavfile.read(os.path.join(aud, "call2_saturation_three_ways.wav")); seg = 6 * sr; gap = int(0.8 * sr)
for j, (k, c) in enumerate(zip(["build", "gentle", "stiff"], ["#d06a4a", "#7fc4a0", "#7aa6e0"])):
    s = b[j * (seg + gap) + 5 * sr: j * (seg + gap) + 6 * sr] * np.hanning(sr)
    S = np.abs(np.fft.rfft(s)); f = np.fft.rfftfreq(sr, 1 / sr); S = 20 * np.log10(S / S.max() + 1e-9)
    lab = {"build": "build: clip the state, tanh out", "gentle": "gentle: damping grows with energy", "stiff": "stiff: spring stiffens"}[k]
    ax[1].plot(f, S, color=c, lw=1, label=lab, alpha=0.9)
for h in [1, 3, 5, 7]: ax[1].axvline(220 * h, color="#55524c", ls=":", lw=0.8)
ax[1].set_xlim(0, 1800); ax[1].set_ylim(-90, 3); ax[1].set_xlabel("Hz  (dotted: 220, 660, 1100, 1540 — the ladder 220 ± n·440)")
ax[1].set_ylabel("dB re peak"); ax[1].set_title("Call 2 — how to stop the growth, at q = 0.6"); ax[1].legend(frameon=False, fontsize=9)
fig.tight_layout(); fig.savefig(os.path.join(aud, "two_calls.png"), dpi=130)
print("wrote two_calls.png")
