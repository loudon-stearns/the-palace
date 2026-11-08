"""smoothing.png: the dial (buzz vs how much of the sound changes), and a close
look at the 3rd harmonic of the FM chain's sweep, shipped vs smoothed."""
import json
from pathlib import Path
import numpy as np, soundfile as sf
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
HERE = Path(__file__).resolve().parent
r = json.loads((HERE / "smoothing.json").read_text())
fig, ax = plt.subplots(1, 3, figsize=(15, 4.6))
cols = {"akwf_fmsynth_family_chain": "#c0563a", "akwf_eorgan_family_chain": "#3a7bc0", "ai_cycles_family_chain": "#5a9a4a"}
for k, v in r["tables"].items():
    d = v["blur_dial"]
    ax[0].plot([x["sigma"] for x in d], [x["offnote_db"] for x in d], "o-", c=cols[k], label=k.replace("_family_chain", ""))
ax[0].axvline(r["sigma"], c="k", ls=":", lw=1); ax[0].set_xlabel("blur across neighbouring frames (sigma, frames)")
ax[0].set_ylabel("buzz: energy 4-15 Hz off the harmonics (dB re on-note)"); ax[0].legend(); ax[0].set_title("the dial")
x, sr = sf.read(HERE / "tables/akwf_fmsynth_family_chain_AB_shipped_then_smooth.wav")
half = (len(x) - sr) // 2
for i, (seg, ttl) in enumerate([(x[:half], "shipped"), (x[half + sr:], "smoothed, sigma 1")]):
    n = 8192; hop = 1024
    S = np.array([np.abs(np.fft.rfft(seg[s:s + n] * np.hanning(n))) for s in range(0, len(seg) - n, hop)]).T
    f = np.fft.rfftfreq(n, 1 / sr); m = (f > 290) & (f < 370)
    ax[i + 1].imshow(20 * np.log10(S[m] / S.max() + 1e-9), aspect="auto", origin="lower", vmin=-90, vmax=-20,
                     extent=[0, len(seg) / sr, f[m][0], f[m][-1]], cmap="magma")
    ax[i + 1].set_title(f"330 Hz harmonic, FM chain sweep: {ttl}"); ax[i + 1].set_xlabel("seconds"); ax[i + 1].set_ylabel("Hz")
fig.tight_layout(); fig.savefig(HERE / "smoothing.png", dpi=110)
