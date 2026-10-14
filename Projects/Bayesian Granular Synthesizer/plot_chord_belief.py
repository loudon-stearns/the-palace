"""The belief-gram for chord-belief.wav: the pitch posterior over time (top),
and the two numbers that say how far the cloud has come to believe (bottom):
the share of grains still drawn from the prior, and the mean grain length.
Also prints how much of the audio's energy sits within 15 cents of the held notes.
    /usr/local/bin/python3 plot_chord_belief.py"""
import json, wave
import numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

BG, INK, DIM, AMBER, INDIGO, TEAL = "#0b0b0d", "#e7e7ea", "#8a8a93", "#f2b134", "#6366f1", "#33e0c8"
plt.rcParams.update({"figure.facecolor": BG, "axes.facecolor": "#06060a", "axes.edgecolor": "#2a2a32",
                     "text.color": INK, "axes.labelcolor": DIM, "xtick.color": DIM, "ytick.color": DIM,
                     "font.family": "monospace", "font.size": 9})

j = json.load(open("chord-belief.json")); tr = j["trace"]
P = np.fromfile("posterior.f32", dtype=np.float32).reshape(-1, j["bins"])
t = np.array([r["t"] for r in tr])
lo, bc = j["lo"], j["binCents"] / 100
fig, ax = plt.subplots(2, 1, figsize=(11, 6.6), sharex=True, gridspec_kw={"height_ratios": [2.4, 1]})
img = np.log10(P.T + 1e-6)
ax[0].imshow(img, origin="lower", aspect="auto", cmap="magma", vmin=-5, vmax=-0.3,
             extent=[0, j["dur"], lo, lo + j["bins"] * bc])
names = {45: "A2", 52: "E3", 57: "A3", 60: "C4", 64: "E4", 67: "G4"}
ax[0].set_yticks(list(names)); ax[0].set_yticklabels(list(names.values()))
ax[0].set_ylim(40, 80); ax[0].set_ylabel("pitch")
ax[0].set_title("Bayesian Granular Synthesizer — the cloud's belief over pitch, 42 s (log density)", color=INK, loc="left", fontsize=10)
for k, (t0, lab) in enumerate(j["labels"]):
    for a in ax: a.axvline(t0, color="#2a2a32", lw=0.8)
    ax[0].text(t0 + 0.2, 79.4 - 1.6 * (k % 2), lab, color=INK, fontsize=7.5, va="top",
               bbox=dict(facecolor=BG, edgecolor="none", alpha=0.75, pad=1.5))
ax[1].plot(t, [r["priorShare"] for r in tr], color=INDIGO, lw=1.4, label="share of grains drawn from the prior")
ax2 = ax[1].twinx(); ax2.plot(t, [r["meanCycles"] for r in tr], color=AMBER, lw=1.4, label="mean grain length (cycles)")
ax2.set_yscale("log", base=2); ax2.set_yticks([4, 16, 64, 128]); ax2.set_yticklabels(["4", "16", "64", "128"]); ax2.tick_params(colors=AMBER)
ax[1].set_ylim(0, 1.05); ax[1].set_ylabel("prior share", color=INDIGO); ax[1].set_xlabel("seconds")
ax[1].legend(loc="upper left", fontsize=7.5, frameon=False); ax2.legend(loc="upper right", fontsize=7.5, frameon=False)
fig.tight_layout(); fig.savefig("chord-belief.png", dpi=130)

# how much energy has gathered onto the held notes (fundamentals, ±15 cents)
w = wave.open("chord-belief.wav"); sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2).mean(1) / 32768
def share(a, b, notes):
    seg = x[int(a * sr):int(b * sr)]; S = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))) ** 2
    f = np.fft.rfftfreq(len(seg), 1 / sr); m = np.zeros_like(f, bool)
    for n in notes:
        f0 = 440 * 2 ** ((n - 69) / 12); m |= (f > f0 * 2 ** (-15 / 1200)) & (f < f0 * 2 ** (15 / 1200))
    return S[m].sum() / S.sum()
rows = [("flat prior, nothing held", 1, 4, [60, 64, 67]), ("C E G, first second", 4, 5, [60, 64, 67]),
        ("C E G, settled", 11, 14, [60, 64, 67]), ("A minor, settled", 19, 22, [57, 60, 64]),
        ("painted prior, nothing held", 30, 34, [45, 52]), ("low A + E, settled", 39, 41.4, [45, 52])]
out = [(r[0], round(share(r[1], r[2], r[3]), 3)) for r in rows]
for r in out: print(r)
json.dump(out, open("note-energy.json", "w"))
