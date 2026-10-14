"""The third reading, measured. For each of the four strikes in the gesture étude, and for each
take: how far the sound swells (dB over the half second before the strike), when it peaks, how
long until it settles back within 1 dB, how much the pitch blooms (pitch-class entropy, bits),
and what the flock did (order φ dip, how many boids caught the alarm, when φ came back).
The point of the table: one identical click, four different responses — an envelope you would
otherwise have to author, here grown from the flock's state at the moment of the strike.
Draws ../gesture.png.
    /usr/local/bin/python3 analyse_gesture.py  → gesture_analysis.json"""
import wave, json, numpy as np
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

def load(p):
    w = wave.open(p); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2).astype(float) / 32768
    return a.mean(1), w.getframerate()
def rms_db(x, sr, hop=0.05, win=0.4):
    h, n = int(hop * sr), int(win * sr); t, v = [], []
    for s in range(0, len(x) - n, h): t.append((s + n / 2) / sr); v.append(10 * np.log10(np.mean(x[s:s + n] ** 2) + 1e-10))
    return np.array(t), np.array(v)
def entropy(x, sr, win=8192, hop=0.05):
    f = np.fft.rfftfreq(win, 1 / sr); m = (f > 50) & (f < 1000); pc = (np.round(12 * np.log2(f[m] / 110)) % 12).astype(int); t, v = [], []
    for s in range(0, len(x) - win, int(hop * sr)):
        P = np.abs(np.fft.rfft(x[s:s + win] * np.hanning(win))) ** 2 + 1e-12
        c = np.bincount(pc, weights=P[m], minlength=12); c /= c.sum(); t.append((s + win / 2) / sr); v.append(float(-(c * np.log2(c + 1e-12)).sum()))
    return np.array(t), np.array(v)

TAKES = {"density": "startle wave · density pad", "density-flinch": "first-build flinch · density pad", "place": "startle wave · place grains"}
res, curves = {}, {}
for key in TAKES:
    x, sr = load(f"../gesture-{key}.wav"); tr = json.load(open(f"gesture_trace-{key}.json"))
    T = np.array([r["t"] for r in tr["trace"]]); phi = np.array([r["phi"] for r in tr["trace"]]); al = np.array([r["alarm"] for r in tr["trace"]]); na = np.array([r["alarmed"] for r in tr["trace"]])
    tr_, db = rms_db(x, sr); te, H = entropy(x, sr)
    sm = db
    rows = []; strikes = tr["strikes"]
    for i, s in enumerate(strikes):
        t0 = s["t"]; t1 = min(t0 + 3.0, strikes[i + 1]["t"] if i + 1 < len(strikes) else 29.4)
        pre = sm[(tr_ > t0 - 0.5) & (tr_ < t0)].mean(); win = (tr_ >= t0) & (tr_ < t1)
        k = np.argmax(sm[win]); peak = sm[win][k] - pre; tpk = tr_[win][k] - t0
        after = np.where(win & (tr_ > t0 + tpk) & (np.abs(sm - pre) < 1.0))[0]; settle = round(float(tr_[after[0]] - t0), 2) if len(after) else None
        hpre = H[(te > t0 - 0.5) & (te < t0)].mean(); hw = (te >= t0) & (te < t1)
        pw = (T >= t0) & (T < (strikes[i + 1]["t"] if i + 1 < len(strikes) else 29.4)); ppre = phi[(T > t0 - 0.5) & (T < t0)].mean(); kk = np.argmin(phi[pw])
        back = np.where(pw & (T > T[pw][kk]) & (phi > ppre - 0.05))[0]
        rows.append({"strike": s["id"], "t": t0, "phiBefore": round(float(ppre), 2), "phiMin": round(float(phi[pw][kk]), 2),
                     "phiBackAfter": round(float(T[back[0]] - t0), 2) if len(back) else None, "boidsReached": int(na[pw].max()),
                     "swellDb": round(float(peak), 1), "peakAfter": round(float(tpk), 2), "settleAfter": settle,
                     "pitchBloomBits": round(float(H[hw].max() - hpre), 2)})
        curves.setdefault(key, []).append((tr_[win] - t0, sm[win] - pre))
    res[key] = {"label": TAKES[key], "strikes": rows}
    print(TAKES[key]); [print("  ", r) for r in rows]
    res[key]["series"] = {"t": T.tolist(), "phi": phi.tolist(), "alarm": al.tolist(), "db_t": tr_.tolist(), "db": sm.tolist()}
json.dump({k: {kk: vv for kk, vv in v.items() if kk != "series"} for k, v in res.items()}, open("gesture_analysis.json", "w"), indent=1)

# ---- gesture.png ---------------------------------------------------------------------------
BG, INK, DIM, AMBER, INDIGO, TEAL, ROSE = "#0b0b0d", "#e7e7ea", "#8a8a93", "#f2b134", "#6366f1", "#33e0c8", "#f472b6"
plt.rcParams.update({"figure.facecolor": BG, "axes.facecolor": "#06060a", "axes.edgecolor": "#2a2a32", "text.color": INK,
                     "axes.labelcolor": DIM, "xtick.color": DIM, "ytick.color": DIM, "font.family": "monospace", "font.size": 9})
fig = plt.figure(figsize=(10, 9.6)); gs = fig.add_gridspec(3, 4, height_ratios=[1, 1, 1.05], hspace=0.55, wspace=0.28)
a1 = fig.add_subplot(gs[0, :]); a2 = fig.add_subplot(gs[1, :], sharex=a1)
w, fl = res["density"]["series"], res["density-flinch"]["series"]
TITLE = "Same four clicks through the density pad (level, 0.4 s window)"
a1.plot(fl["db_t"], fl["db"], color=INDIGO, lw=1, label="first-build flinch")
a1.plot(w["db_t"], w["db"], color=ROSE, lw=1.6, label="startle wave")
a1.set_ylabel("pad level, dB"); a1.set_title(TITLE, color=INK, loc="left", fontsize=11)
a1.legend(loc="lower right", frameon=False, fontsize=8)
a2.plot(fl["t"], fl["phi"], color=INDIGO, lw=1, label="φ, first-build flinch")
a2.plot(w["t"], w["phi"], color=TEAL, lw=1.6, label="φ, startle wave")
a2.fill_between(w["t"], 0, np.array(w["alarm"]), color=ROSE, alpha=.35, lw=0, label="mean alarm, startle wave")
a2.set_ylim(0, 1.02); a2.set_ylabel("order φ · alarm"); a2.set_xlabel("seconds")
a2.axvspan(18, 22, color=AMBER, alpha=.06); a2.text(18.2, 0.04, "Disorder eased up to the knee", color=AMBER, fontsize=7.5)
a2.legend(loc="lower left", frameon=False, fontsize=7.5, ncol=3)
for ax in (a1, a2):
    for s in json.load(open("gesture_trace-density.json"))["strikes"]:
        ax.axvline(s["t"], color=INK, lw=.6, alpha=.35);
        if ax is a1: ax.text(s["t"] + 0.15, ax.get_ylim()[1] - 1.2, s["id"], color=INK, fontsize=9)
names = {"A": "A · ordered, centre", "B": "B · ordered, upper left", "C": "C · same spot, mid-regather", "D": "D · near the knee"}
for i, sid in enumerate("ABCD"):
    ax = fig.add_subplot(gs[2, i])
    for key, col, lw in [("density-flinch", INDIGO, 1), ("place", AMBER, 1), ("density", ROSE, 1.6)]:
        t, v = curves[key][i]; ax.plot(t, v, color=col, lw=lw)
    ax.axhline(0, color=DIM, lw=.5); ax.set_xlim(0, 3); ax.set_ylim(-6, 9); ax.set_title(names[sid], color=INK, fontsize=8.5, loc="left")
    ax.set_xlabel("s after click")
    if i == 0: ax.set_ylabel("level vs before, dB")
fig.text(0.5, 0.045, "each click's swell, aligned to the click — rose: startle wave, pad · amber: startle wave, place grains · indigo: flinch, pad",
         color=DIM, fontsize=8, ha="center")
fig.savefig("../gesture.png", dpi=130, facecolor=BG, bbox_inches="tight")
