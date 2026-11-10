"""Draws swell.png: the click struck through the lens (the cloud's shape), then the phrase and the chord through it."""
from pathlib import Path
import numpy as np, soundfile as sf
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from render_swell import lead_lens, tail_lens, env_db, LEAD, TAIL, LEAD_S, SR
HERE = Path(__file__).parent
sr = SR
plt.rcParams.update({"font.size": 9, "text.color": "#c8c8d8", "axes.labelcolor": "#8a8aa0", "xtick.color": "#8a8aa0", "ytick.color": "#8a8aa0", "axes.edgecolor": "#4a4a5e"})
fig, ax = plt.subplots(1, 3, figsize=(15, 3.8), facecolor="#0a0a0f", gridspec_kw={"width_ratios": [1.1, 1, 1]})
click = np.zeros(int(0.05 * sr)); click[0] = 1.0
P = int(LEAD_S * sr)
for (lk, col, lab) in ((LEAD, "#e8b04a", "swell, highs first"), ({**LEAD, "highs_late_share": 0.0}, "#6aa8e8", "swell, lows first")):
    w = np.vstack([lead_lens(click, sr, LEAD_S, seed=23, **lk)[:P], tail_lens(click, sr, seed=11, **TAIL)])
    e, hop = env_db(w, sr)
    ax[0].plot(np.arange(len(e)) * hop - LEAD_S, e, color=col, lw=1.2, label=lab)
ax[0].axvline(0, color="#ffffff", lw=0.8, ls=":"); ax[0].text(0.08, -5, "the click", fontsize=8)
ax[0].set_xlim(-2.2, 8); ax[0].set_ylim(-60, 2); ax[0].set_xlabel("seconds from the click"); ax[0].set_ylabel("dB")
ax[0].set_title("one click through the lens: the swell, then the tail", fontsize=10); ax[0].legend(frameon=False, fontsize=8)
def spec_db(x, win=1024, hop=128):
    m = x.mean(axis=1) if x.ndim > 1 else x
    w = np.hanning(win); S = np.array([np.abs(np.fft.rfft(m[i:i+win]*w)) for i in range(0, len(m)-win, hop)]).T
    return 20*np.log10(S/S.max()+1e-6), hop
for a, (t, n) in zip(ax[1:], (("the phrase, swell and tail", "p_both"), ("the chord, swell and tail", "c_both"))):
    x, _ = sf.read(str(HERE / "takes" / f"{n}.wav")); S, hop = spec_db(x)
    a.imshow(S, origin="lower", aspect="auto", cmap="magma", vmin=-75, vmax=0, extent=[-LEAD_S, S.shape[1]*hop/sr - LEAD_S, 0, sr/2000])
    a.axvline(0, color="#ffffff", lw=0.8, ls=":")
    a.set_xlim(-2, 8); a.set_ylim(0, 8); a.set_title(t, fontsize=10); a.set_xlabel("seconds from the dry's onset"); a.set_ylabel("kHz")
for a in ax: a.set_facecolor("#0a0a0f")
fig.tight_layout(); fig.savefig(HERE / "swell.png", dpi=110, facecolor=fig.get_facecolor())
