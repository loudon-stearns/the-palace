# Matplotlib card check, 2026-11-14: a Bode plot (magnitude and phase) of an RBJ biquad low-pass,
# fc = 1 kHz, Q = 2, fs = 48 kHz, wearing palace.mplstyle (Graphite, generated from the design tokens).
# Run from the palace root:  python3 "Shop/Matplotlib/proofs/2026-11-14-card-check/bode-card-check.py"
from pathlib import Path
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = Path(__file__).resolve().parent
plt.style.use(HERE.parents[1] / "palace.mplstyle")

fs, fc, Q = 48000.0, 1000.0, 2.0
w0 = 2 * np.pi * fc / fs; alpha = np.sin(w0) / (2 * Q); c = np.cos(w0)
b = np.array([(1 - c) / 2, 1 - c, (1 - c) / 2]); a = np.array([1 + alpha, -2 * c, 1 - alpha])
f = np.logspace(1, np.log10(0.99 * fs / 2), 800)  # the zero sits exactly at Nyquist
z = np.exp(-1j * 2 * np.pi * f / fs)
H = (b[0] + b[1] * z + b[2] * z**2) / (a[0] + a[1] * z + a[2] * z**2)

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(6.4, 4.8), dpi=150, sharex=True, layout="constrained")
ax1.semilogx(f, 20 * np.log10(np.abs(H)))
ax1.set_ylabel("Magnitude (decibels)"); ax1.set_ylim(-60, 12)
ax1.set_title("Biquad low-pass, fc = 1 kHz, Q = 2")
ax2.semilogx(f, np.degrees(np.unwrap(np.angle(H))), color=plt.rcParams["axes.prop_cycle"].by_key()["color"][2])
ax2.set_ylabel("Phase (degrees)"); ax2.set_xlabel("Frequency (hertz)")
for ext in ("png", "svg"):
    fig.savefig(HERE / f"bode-card-check.{ext}", metadata={"Software": None} if ext == "png" else {"Date": None})
print("wrote bode-card-check.png and .svg")
