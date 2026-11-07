"""ladder.py — hear and see crowd size on the plugin's own engine.

Builds run.cpp, then for crowds 32..1024 holds C3 for 5 s just under the lock
(life 0.2, tightness 0.97 of the lock point = 1.21), Even level on, and joins the
last 4 s of each into one ladder, smallest crowd first. Also draws crowd-size.png:
the crowd's agreement over time for every size, at three tightnesses.
    /usr/local/bin/python3 ladder.py      (after measure.py, which it reads for the lower panel)
"""
import numpy as np, subprocess, wave, json, pathlib
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
here = pathlib.Path(__file__).parent; SR = 44100; SIZES = [32, 64, 128, 256, 512, 1024]
M = here / "../../../../VST Template/machinery/src"
subprocess.run(["c++", "-O2", "-std=c++17", "-I", str(here), "-I", str(M), str(here / "run.cpp"), "-o", "/tmp/ngcrowd"], check=True)
def play(idx, tight, sec, even=1):
    p = f"/tmp/ngc/l_{idx}_{tight:.3f}_{even}"
    subprocess.run(["/tmp/ngcrowd", str(idx), str(tight), "0.2", str(even), str(sec), p], check=True)
    return np.fromfile(p + ".audio.f32", np.float32), np.fromfile(p + ".r.f32", np.float32)
pathlib.Path("/tmp/ngc").mkdir(exist_ok=True)
lock = 1.25; rungs = []; fade = int(0.08 * SR)
for i in range(6):
    x, _ = play(i, 0.97 * lock, 5)
    x = x[SR:].copy(); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    rungs += [x, np.zeros(int(0.35 * SR), np.float32)]
y = np.concatenate(rungs); y *= 0.89 / np.abs(y).max()
with wave.open(str(here / "crowd-ladder-edge.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((y * 32767).astype("<i2").tobytes())
fig, ax = plt.subplots(4, 1, figsize=(11, 10), gridspec_kw=dict(height_ratios=[1, 1, 1, 1.2]))
fig.patch.set_facecolor("#0b0f0c")
cols = plt.cm.viridis(np.linspace(0.1, 0.95, 6))
for a, ratio, name in zip(ax[:3], (0.85, 0.97, 1.3), ("well under the lock (0.85)", "just under the lock (0.97)", "locked (1.3)")):
    for i in range(6):
        _, r = play(i, ratio * lock, 7, 0)
        t = np.arange(len(r)) * 32 / SR
        a.plot(t, r, color=cols[i], lw=0.8, label=f"{SIZES[i]}")
    a.set_ylim(0, 1); a.set_xlim(0, 7); a.set_title(f"agreement r over 7 s, {name}", color="#cfe", fontsize=10, loc="left")
for a in ax:
    a.set_facecolor("#0b0f0c"); a.tick_params(colors="#8a9"); [s.set_color("#334") for s in a.spines.values()]
ax[0].legend(ncol=6, fontsize=8, facecolor="#0b0f0c", labelcolor="#cfe", loc="upper left", title="crowd", title_fontsize=8)
rows = json.load(open(here / "crowd-size-engine.json"))
for ratio, ls in ((0.6, ":"), (0.95, "--"), (1.1, "-")):
    pts = [d for d in rows if d["life"] == 0.2 and d["ratio"] == ratio]
    ax[3].plot([d["N"] for d in pts], [d["r_sd"] for d in pts], ls, color="#9fd", marker="o", label=f"{ratio} of the lock")
ax[3].set_xscale("log", base=2); ax[3].set_xticks(SIZES); ax[3].set_xticklabels(SIZES)
ax[3].set_title("how much the agreement wanders (std of r), life 0.2", color="#cfe", fontsize=10, loc="left")
ax[3].legend(fontsize=8, facecolor="#0b0f0c", labelcolor="#cfe"); ax[3].set_xlabel("crowd size", color="#8a9")
plt.tight_layout(); plt.savefig(here / "crowd-size.png", dpi=110, facecolor=fig.get_facecolor())
print("wrote crowd-ladder-edge.wav", len(y) / SR, "s, crowd-size.png")
