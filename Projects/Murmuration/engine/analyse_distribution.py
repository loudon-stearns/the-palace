"""The second reading, measured beside the first. Per section of the 40-second performance:
pitch-class entropy of the audio (bits; 0 = one pitch class, 3.58 = all twelve equal) and
spectral flatness, for the flock-as-distribution take — set against the grains under the
first mapping and the grains under the order mapping (mean of blind X and Y, so it stays
blind). Also a zipper check at the control-frame boundaries.
Draws ../readings.png.
    /usr/local/bin/python3 analyse_distribution.py  → distribution_analysis.json"""
import wave, json, numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
# same sections and measures as analyse_takes.py (copied: importing it would re-run it)
SEGS = {"melted": (1, 5), "crossing": (8, 11), "ordered": (17, 21), "startle": (21, 24), "re-cohered": (25, 28), "melted again": (36, 39)}
def load(p):
    w = wave.open(p); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2).astype(float) / 32768
    return a.mean(1), w.getframerate()
def frames(x, sr, a, b, win=16384):
    f = np.fft.rfftfreq(win, 1 / sr); m = (f > 50) & (f < 1000); pc = (np.round(12 * np.log2(f[m] / 110)) % 12).astype(int)
    H, FL = [], []
    for s in range(int(a * sr), int(b * sr) - win, sr // 10):
        P = np.abs(np.fft.rfft(x[s:s + win] * np.hanning(win))) ** 2 + 1e-12
        c = np.bincount(pc, weights=P[m], minlength=12); c /= c.sum(); H.append(-(c * np.log2(c + 1e-12)).sum())
        Q = P[(f > 50) & (f < 4000)]; FL.append(np.exp(np.mean(np.log(Q))) / np.mean(Q))
    return float(np.mean(H)), float(np.mean(FL))
def entropy_trace(x, sr, win=16384):
    f = np.fft.rfftfreq(win, 1 / sr); m = (f > 50) & (f < 1000); pc = (np.round(12 * np.log2(f[m] / 110)) % 12).astype(int); out = []
    for s in range(0, len(x) - win, sr // 20):
        P = np.abs(np.fft.rfft(x[s:s + win] * np.hanning(win))) ** 2 + 1e-12
        c = np.bincount(pc, weights=P[m], minlength=12); c /= c.sum(); out.append([(s + win / 2) / sr, float(-(c * np.log2(c + 1e-12)).sum())])
    return out

def clicks(x, spf=800):
    # zipper check: mean jump at the 60 fps control-frame boundaries against the mean jump
    # everywhere (≈1 = no step at frame edges). The blind grains measure ≈1.5 on this.
    a = np.abs(np.diff(x)); return round(float(a[np.arange(spf - 1, len(a), spf)].mean() / a.mean()), 3)

res = {}
x, sr = load("../reading-distribution.wav"); tr = json.load(open("distribution_trace-performance.json"))
rows = []
for k, (a, b) in SEGS.items():
    H, FL = frames(x, sr, a, b); sel = [r for r in tr if a <= r["t"] < b]
    rows.append({"section": k, "phi": round(float(np.mean([r["phi"] for r in sel])), 2), "pcEntropy": round(H, 2), "flatness": round(FL, 4),
                 "cellsSounding": round(float(np.mean([r["cells"] for r in sel])), 1), "pitchAgree": round(float(np.mean([r["pitchAgree"] for r in sel])), 2)})
res["performance"] = {"sections": rows, "trace": entropy_trace(x, sr), "clickRatio": clicks(x)}
xa, _ = load("../reading-distribution-attractor.wav"); ta = json.load(open("distribution_trace-attractor.json"))
res["attractor"] = {"trace": entropy_trace(xa, sr), "clickRatio": clicks(xa),
                    "windows": [{"t": s, "cells": round(float(np.mean([r["cells"] for r in ta if abs(r["t"] - s) < 1])), 1)} for s in (2, 6, 10, 14, 18)]}
prev = json.load(open("takes_analysis.json"))
for i, r in enumerate(rows):
    pg = prev["page/flock"]["sections"][i]["pcEntropy"]; od = (prev["order/flock"]["sections"][i]["pcEntropy"] + prev["order/authored"]["sections"][i]["pcEntropy"]) / 2
    r["grainsFirstMapping"] = pg; r["grainsOrderMeanXY"] = round(od, 2)
    print(f"{r['section']:13s} φ{r['phi']:.2f}  cells {r['cellsSounding']:4.1f}  agree {r['pitchAgree']:.2f}  H dist {r['pcEntropy']:.2f}  | grains first {pg:.2f}  order(X+Y)/2 {od:.2f}  flat {r['flatness']:.3f}")
print("frame-edge jump ratio (1 = none):", res["performance"]["clickRatio"], res["attractor"]["clickRatio"])
json.dump(res, open("distribution_analysis.json", "w"))

# ---- readings.png --------------------------------------------------------------------
BG, INK, DIM, AMBER, INDIGO, TEAL, ROSE = "#0b0b0d", "#e7e7ea", "#8a8a93", "#f2b134", "#6366f1", "#33e0c8", "#f472b6"
plt.rcParams.update({"figure.facecolor": BG, "axes.facecolor": "#06060a", "axes.edgecolor": "#2a2a32", "text.color": INK,
                     "axes.labelcolor": DIM, "xtick.color": DIM, "ytick.color": DIM, "font.family": "monospace", "font.size": 9})
fig, (a1, a2) = plt.subplots(2, 1, figsize=(10, 9.2), gridspec_kw={"height_ratios": [1.25, 1]})
keep = lambda a: a[(a[:, 0] > 0.6) & (a[:, 0] < 38.8)]
k = 7; sm = lambda y: np.convolve(y, np.ones(k) / k, mode="same")
t = np.array([r["t"] for r in tr]); a1.plot(t, [r["phi"] for r in tr], color=TEAL, lw=1.6, label="flock order φ (left axis)")
a1.plot(t, [r["pitchAgree"] for r in tr], color=ROSE, lw=1, ls="--", label="field: how much the sounding cells agree on pitch")
a1.set_ylim(0, 1.02); a1.set_ylabel("φ  ·  pitch agreement"); a1.set_xlabel("seconds")
b = a1.twinx(); b.set_ylabel("pitch-class entropy, bits (lower = more focused)", color=DIM)
pg = keep(np.array(prev["page/flock"]["trace"])); ox = keep(np.array(prev["order/flock"]["trace"])); oa = keep(np.array(prev["order/authored"]["trace"]))
dd = keep(np.array(res["performance"]["trace"]))
b.plot(pg[k:-k, 0], sm(pg[:, 1])[k:-k], color=INDIGO, lw=1.2, label="grains, first mapping")
b.plot(ox[k:-k, 0], sm((ox[:, 1] + oa[:, 1]) / 2)[k:-k], color=AMBER, lw=1.4, label="grains, order mapping (mean X,Y)")
b.plot(dd[k:-k, 0], sm(dd[:, 1])[k:-k], color=ROSE, lw=2, label="field (flock-as-distribution)")
b.set_ylim(1.2, 3.6); b.tick_params(colors=DIM)
for x0, lab in [(2.5, "melted"), (9.5, "crystallise"), (17, "ordered"), (21, "predator"), (31.5, "melt")]: a1.text(x0, 1.0, lab, color=DIM, fontsize=8, va="top")
a1.axvline(21, color=INK, lw=.6, alpha=.4)
h1, l1 = a1.get_legend_handles_labels(); h2, l2 = b.get_legend_handles_labels(); a1.legend(h1 + h2, l1 + l2, loc="upper center", bbox_to_anchor=(0.5, -0.13), frameon=False, fontsize=7.5, ncol=3)
a1.set_title("Same performance, second reading: the field hears the flock's order as pitch", color=INK, loc="left", fontsize=11)
ta_t = np.array([r["t"] for r in ta])
a2.plot(t, [r["cells"] for r in tr], color=DIM, lw=1, label="performance: cells sounding (of 40)")
a2.plot(ta_t, [r["cells"] for r in ta], color=ROSE, lw=1.8, label="attractor take: cells sounding (of 40)")
a2.axvspan(4, 16, color=ROSE, alpha=.07); a2.text(4.3, 3, "attractor drags the flock on a loop", color=ROSE, fontsize=8)
a2.set_ylim(0, 41); a2.set_xlim(0, 40); a2.set_ylabel("cells sounding (participation ratio)"); a2.set_xlabel("seconds")
a2.legend(loc="lower right", frameon=False, fontsize=8)
a2.set_title("…and it hears where the flock is: order barely gathers it, the attractor does", color=INK, loc="left", fontsize=11)
fig.tight_layout(); fig.savefig("../readings.png", dpi=130, facecolor=BG)
