"""Particle Synthesis · 2026-11-11 · past 1024, as a picture and as sound.
Reads the report and the raw renders the harness leaves in /tmp/ps9. Writes the four rain clips at matched loudness,
one file that plays them in a row (256 → 1024 → 4096 → 16384 slots), and the figure. Run with /usr/local/bin/python3."""
import json, numpy as np, matplotlib, wave
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.signal import spectrogram
from scipy.stats import kurtosis
SR, B = 48000, 1024
R = json.load(open("2026-11-11-past-1024-report.json"))
NS = [e["n"] for e in R["ear"]]

def wav(name, x):
    x = np.clip(np.round(x * 32767), -32768, 32767).astype("<i2")
    with wave.open(name, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())

clips, stats = {}, []
for e in R["ear"]:
    a = np.fromfile(f"/tmp/ps9/ear-{e['n']}.f32", dtype="<f4").reshape(-1, 2).astype(np.float64)
    steady = a[int(5 * SR):int(8 * SR)]
    rms = np.sqrt(np.mean(steady ** 2))
    a = a * (0.08 / rms)                      # matched loudness over the steady last 3 s
    clips[e["n"]] = a
    m = steady[:, 0]
    f, t, S = spectrogram(m, SR, nperseg=2048, noverlap=1024)
    P = S.mean(axis=1)
    cen = float((f * P).sum() / P.sum())
    env = np.sqrt(np.convolve(m ** 2, np.ones(480) / 480, mode="valid"))[::480]   # 10 ms loudness
    stats.append({"n": e["n"], "raw_rms": float(rms), "kurtosis": float(kurtosis(m, fisher=False)),
                  "loudness_spread_db": float(20 * np.log10(np.percentile(env, 90) / max(np.percentile(env, 10), 1e-12))),
                  "centroid_hz": cen, "landings_per_s": None})
for s in stats:
    e = next(x for x in R["ear"] if x["n"] == s["n"])
    s["landings"] = e["strikes"]; s["meetings"] = e["meetings"]
peak = max(np.abs(c).max() for c in clips.values())
g = 0.89 / peak
for n, c in clips.items():
    wav(f"2026-11-11-past-1024-rain-{n}.wav", c * g)
gap = np.zeros((int(0.6 * SR), 2))
wav("2026-11-11-past-1024-rain-sweep.wav", np.concatenate(sum([[clips[n] * g, gap] for n in NS], [])))
R["ear_stats"] = stats
json.dump(R, open("2026-11-11-past-1024-report.json", "w"), indent=2)
for s in stats: print({k: (round(v, 3) if isinstance(v, float) else v) for k, v in s.items()})

# ---- figure
fig = plt.figure(figsize=(13, 9.4), facecolor="#0e1116")
gs = fig.add_gridspec(3, 4, height_ratios=[1.25, 1.0, 1.6], hspace=0.55, wspace=0.18)
def style(ax):
    ax.set_facecolor("#0a0d11"); ax.tick_params(colors="#8b8f98", labelsize=8)
    for s in ax.spines.values(): s.set_color("#2a313b")
txt = "#e6e1d6"
ax = fig.add_subplot(gs[0, :2]); style(ax)
cost = [c for c in R["cost"] if "error" not in c]
for col, cl, lab in [(1, "#e9a75a", "grains meet (every pair checked)"), (0, "#7fd3e6", "grains pass through")]:
    pts = [(c["n"], c["share_of_realtime"]) for c in cost if c["collide"] == col]
    ax.plot([p[0] for p in pts], [p[1] for p in pts], "o-", color=cl, label=lab)
ax.axhline(1, color="#c9a2f0", lw=1, ls="--"); ax.text(1100, 1.15, "a block takes as long as it plays", color="#c9a2f0", fontsize=8)
ax.set_xscale("log", base=2); ax.set_yscale("log"); ax.set_xlabel("grains (slots)", color="#8b8f98", fontsize=8)
ax.set_ylabel("time to compute ÷ time it plays", color="#8b8f98", fontsize=8)
ax.legend(fontsize=8, facecolor="#0a0d11", edgecolor="#2a313b", labelcolor=txt)
ax.set_title("where the GPU runs out (Apple M-series, Metal, 1024-sample blocks)", color=txt, fontsize=9, loc="left")
ax = fig.add_subplot(gs[0, 2:]); style(ax)
cols = {256: "#5b6170", 1024: "#7fd3e6", 4096: "#e9a75a", 16384: "#c9a2f0"}
for e in R["ear"]:
    f = np.array(e["flying_per_block"]); ax.plot((np.arange(len(f)) + 1) * B / SR, f, color=cols[e["n"]], label=f"{e['n']} slots")
ax.set_yscale("log"); ax.set_xlabel("seconds", color="#8b8f98", fontsize=8); ax.set_ylabel("grains in the air", color="#8b8f98", fontsize=8)
ax.legend(fontsize=8, facecolor="#0a0d11", edgecolor="#2a313b", labelcolor=txt, loc="lower right")
ax.set_title("the same thickening rain: how many grains the slots let fly", color=txt, fontsize=9, loc="left")
ax = fig.add_subplot(gs[1, :]); style(ax)
labels = [f"{s['n']} slots" for s in stats]
land = [s["landings"] / 8 for s in stats]; meet = [s["meetings"] / 8 for s in stats]
xx = np.arange(len(stats))
ax.bar(xx - 0.2, land, 0.4, color="#7fd3e6", label="landings on the ice, per second")
ax.bar(xx + 0.2, meet, 0.4, color="#e9a75a", label="meetings in the air, per second")
ax.set_xticks(xx); ax.set_xticklabels(labels, color=txt); ax.set_yscale("log")
ax.legend(fontsize=8, facecolor="#0a0d11", edgecolor="#2a313b", labelcolor=txt)
ax.set_title("what the slots change: with few, grains are taken back mid-flight and never land; the meetings barely move", color=txt, fontsize=9, loc="left")
for k, n in enumerate(NS):
    ax = fig.add_subplot(gs[2, k]); style(ax)
    m = clips[n][:, 0]
    f, t, S = spectrogram(m, SR, nperseg=1024, noverlap=768)
    ax.pcolormesh(t, f / 1000, 10 * np.log10(S + 1e-14), shading="auto", cmap="magma", vmin=-110, vmax=-40)
    ax.set_ylim(0, 16); ax.set_xlabel("seconds", color="#8b8f98", fontsize=8)
    if k == 0: ax.set_ylabel("kHz", color="#8b8f98", fontsize=8)
    s = stats[k]
    ax.set_title(f"{n} slots · peaky {s['kurtosis']:.0f} · spread {s['loudness_spread_db']:.0f} dB", color=txt, fontsize=8, loc="left")
fig.text(0.01, 0.005, "the rain clips at matched loudness; 'peaky' is the kurtosis of the waveform (3 = steady noise), 'spread' the gap between loud and quiet 10 ms moments",
         color="#8b8f98", fontsize=8)
fig.savefig("2026-11-11-past-1024.png", dpi=110, facecolor=fig.get_facecolor(), bbox_inches="tight")

# ---- the landings alone (meetings off), and the widened mouth: matched loudness, same measures
def measure(a):
    m = a[int(5 * SR):int(8 * SR), 0]
    f, t, S = spectrogram(m, SR, nperseg=2048, noverlap=1024); P = S.mean(axis=1)
    env = np.sqrt(np.convolve(m ** 2, np.ones(480) / 480, mode="valid"))[::480]
    return {"kurtosis": round(float(kurtosis(m, fisher=False)), 2), "centroid_hz": round(float((f * P).sum() / P.sum())),
            "loudness_spread_db": round(float(20 * np.log10(np.percentile(env, 90) / max(np.percentile(env, 10), 1e-12))), 1),
            "raw_rms": round(float(np.sqrt(np.mean(a[int(5 * SR):int(8 * SR)] ** 2))), 3)}
extra = {}
for key, tag in [("ear_off", "off"), ("ear_mouth", "mouth")]:
    rows = []
    for e in R.get(key, []):
        a = np.fromfile(f"/tmp/ps9/ear-{tag}-{e['n']}.f32", dtype="<f4").reshape(-1, 2).astype(np.float64)
        if np.sqrt(np.mean(a[int(5 * SR):] ** 2)) < 1e-6:   # nothing lands: every grain is taken back before it reaches the ice
            rows.append({"n": e["n"], "silent_in_last_3s": True}); print(tag, rows[-1]); continue
        st = measure(a); a = a * (0.08 / st["raw_rms"])
        wav(f"2026-11-11-past-1024-rain-{tag}-{e['n']}.wav", a * g)
        rows.append({"n": e["n"], **st}); print(tag, rows[-1])
    extra[key + "_stats"] = rows
R.update(extra)
json.dump(R, open("2026-11-11-past-1024-report.json", "w"), indent=2)
