"""Draw the gentle resonator's loudness map (measured, ratio x q) with the first-order
tongue edges over it, and the centred level law. Reads gentle_map.json and gentle_report.json."""
import os, json
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
here = os.path.dirname(os.path.abspath(__file__))
M = json.load(open(os.path.join(here, "gentle_map.json"))); R = json.load(open(os.path.join(here, "gentle_report.json")))
plt.rcParams.update({"figure.facecolor": "#14161a", "axes.facecolor": "#14161a", "text.color": "#e8e4dc",
    "axes.labelcolor": "#e8e4dc", "xtick.color": "#a9a59c", "ytick.color": "#a9a59c", "axes.edgecolor": "#55524c", "font.size": 10})
fig, ax = plt.subplots(1, 2, figsize=(13, 4.8), gridspec_kw={"width_ratios": [1.5, 1]})
r = np.array(M["ratios"]); q = np.array(M["qs"]); E = np.array(M["E"])
lv = 10 * np.log10(np.maximum(E, 1e-6))
im = ax[0].pcolormesh(r, q, lv, shading="nearest", cmap="magma", vmin=-40, vmax=0)
qq = np.linspace(0.05, 1, 200); z = 0.025; w = np.sqrt(np.maximum(qq ** 2 - 4 * z * z, 0))
ax[0].plot(2 - w, qq, color="#7fc4a0", lw=1.2, ls="--", label="first-order tongue edge")
ax[0].plot(2 + w, qq, color="#7fc4a0", lw=1.2, ls="--")
ax[0].set_xlim(1.49, 2.51); ax[0].set_xlabel("pump rate ÷ resonator frequency"); ax[0].set_ylabel("pump depth q")
ax[0].set_title("measured loudness of the ring (dB of energy) — the Strutt tongue, heard as level", fontsize=10)
ax[0].legend(loc="upper right", fontsize=8, facecolor="#14161a", edgecolor="#55524c")
fig.colorbar(im, ax=ax[0], label="dB")
L = R["level_law"]; ax[1].plot([p["q"] for p in L], [p["E_theory"] for p in L], color="#7fc4a0", lw=1.5, label="law: E = (q/2 − ζ) / g")
ax[1].plot([p["q"] for p in L], [p["E_measured"] for p in L], "o", color="#e0a040", label="measured, centred")
ax[1].axvline(0.05, color="#a9a59c", ls=":", lw=1); ax[1].text(0.06, 0.85, "threshold 2ζ", color="#a9a59c", fontsize=8)
ax[1].set_xlabel("pump depth q"); ax[1].set_ylabel("ring energy E"); ax[1].set_title("the level follows the pump", fontsize=10)
ax[1].legend(fontsize=8, facecolor="#14161a", edgecolor="#55524c")
fig.tight_layout(); fig.savefig(os.path.join(here, "gentle_map.png"), dpi=130)
print("wrote gentle_map.png")
