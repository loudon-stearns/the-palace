"""Draws pushed.png: the phrase through four clouds, and each cloud struck by one click."""
from pathlib import Path
import numpy as np, soundfile as sf
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import importlib.util
HERE = Path(__file__).parent; B = HERE.parent.parent
spec = importlib.util.spec_from_file_location("rp", HERE / "render_pushed.py"); rp = importlib.util.module_from_spec(spec); spec.loader.exec_module(rp)
spec = importlib.util.spec_from_file_location("lens", B / "03_dispersion_cloud" / "lens.py"); lens = importlib.util.module_from_spec(spec); spec.loader.exec_module(lens)

def spec_db(x, sr, win=512, hop=96):
    m = x.mean(axis=1) if x.ndim > 1 else x
    w = np.hanning(win); S = np.array([np.abs(np.fft.rfft(m[i:i+win]*w)) for i in range(0, len(m)-win, hop)]).T
    S = 20*np.log10(S/S.max()+1e-6); return S, hop/sr
sr = 24000
phr = [("the phrase, dry", sf.read(str(B/"dry.wav"))[0]),
       ("May: canonical dispersion", sf.read(str(B/"03_dispersion_cloud/variations/25_loudon_canonical_pure.wav"))[0]),
       ("pushed: highs late", sf.read(str(HERE/"takes/p1_dispersion.wav"))[0]),
       ("pushed: highs early", sf.read(str(HERE/"takes/w_early.wav"))[0])]
click = np.zeros(1200); click[0] = 1
clk = [None,
       lens.dispersion_cloud(click, sr, n_droplets=600, dispersion_max_ms=20., dispersion_min_ms=4., exponent_mean=2., exponent_spread=.3, time_spread_ms=350., amp_jitter=0, tail_seconds=.3),
       rp.cloud(click, sr, **rp.STRONG, amp_jitter=0, tail_s=.3),
       rp.cloud(click, sr, **rp.STRONG, highs_late_share=0., amp_jitter=0, tail_s=.3)]
plt.rcParams.update({"font.size": 9, "text.color": "#c8c8d8", "axes.labelcolor": "#8a8aa0", "xtick.color": "#8a8aa0", "ytick.color": "#8a8aa0", "axes.edgecolor": "#4a4a5e"})
fig, ax = plt.subplots(2, 4, figsize=(13, 5.6), facecolor="#0a0a0f", gridspec_kw={"height_ratios": [1, 1]})
for j, (t, x) in enumerate(phr):
    S, dt = spec_db(x, sr); a = ax[0, j]; a.set_facecolor("#0a0a0f")
    a.imshow(S, origin="lower", aspect="auto", cmap="magma", vmin=-70, vmax=0, extent=[0, S.shape[1]*dt, 0, sr/2000])
    a.set_xlim(0, 3.2); a.set_ylim(0, 10); a.set_title(t, fontsize=10); a.set_xlabel("seconds")
    if j == 0: a.set_ylabel("the phrase · kHz")
    a = ax[1, j]; a.set_facecolor("#0a0a0f")
    if clk[j] is None:
        a.axis("off"); a.text(0.05, 0.5, "below: each cloud struck\nby a single click —\nthe shape of the cloud\nitself, with no phrase\nin the way", transform=a.transAxes, fontsize=10, color="#8a8aa0", va="center")
        continue
    S, dt = spec_db(clk[j], sr, win=256, hop=48)
    a.imshow(S, origin="lower", aspect="auto", cmap="magma", vmin=-60, vmax=0, extent=[0, S.shape[1]*dt, 0, sr/2000])
    a.set_xlim(0, 0.8); a.set_ylim(0, 10); a.set_xlabel("seconds after the click")
    if j == 1: a.set_ylabel("one click · kHz")
fig.tight_layout(); fig.savefig(HERE/"pushed.png", dpi=110, facecolor=fig.get_facecolor())
print("ok")
