#!/usr/bin/env python3
"""Contact sheet of the exported cycles: 2048 (gold) over 256 (blue)."""
import wave
import matplotlib
import numpy as np

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

POS = ["pos0p00", "pos0p21", "pos0p40", "pos0p60", "pos0p79", "pos1p00"]
SETS = [("crystal", ["cubic", "hexagonal", "tetragonal", "rhombohedral",
                     "orthorhombic", "monoclinic", "triclinic"]),
        ("floquet", POS), ("shepard", POS)]


def load(path):
    w = wave.open(path)
    return np.frombuffer(w.readframes(w.getnframes()), "<i2") / 32767


def label(name):
    return "position " + name[3:].replace("p", ".") if name.startswith("pos") else name


fig, ax = plt.subplots(3, 7, figsize=(16, 6.2), facecolor="#14161a")
for r, (s, names) in enumerate(SETS):
    for c in range(7):
        a = ax[r][c]
        a.set_facecolor("#14161a"); a.set_xticks([]); a.set_yticks([])
        for sp in a.spines.values():
            sp.set_color("#2a2e35")
        if c >= len(names):
            a.axis("off"); continue
        for n, col, lw in [(2048, "#e8c070", 1.4), (256, "#6fb3d2", 0.9)]:
            y = load(f"cycles/{n}/{s}_{names[c]}_{n}.wav")
            a.plot(np.linspace(0, 1, len(y)), y, color=col, lw=lw, alpha=0.9)
        a.set_ylim(-1.05, 1.05)
        a.set_title(f"{s} · {label(names[c])}", color="#c9ccd1", fontsize=8.5)
fig.suptitle("single cycles · gold 2048 samples · blue 256 (band-limited)", color="#e6e6e6", fontsize=11)
plt.tight_layout()
plt.savefig("single_cycles_contact_sheet.png", dpi=110, facecolor="#14161a")
