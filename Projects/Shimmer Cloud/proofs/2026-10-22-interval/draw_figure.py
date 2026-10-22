"""Draws interval.png: the phrase dry, May's octave stack, and the new lens three ways."""
from pathlib import Path
import numpy as np, soundfile as sf
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
HERE = Path(__file__).parent; B = HERE.parent.parent
def spec_db(x, win=1024, hop=128):
    m = x.mean(axis=1) if x.ndim > 1 else x
    w = np.hanning(win); S = np.array([np.abs(np.fft.rfft(m[i:i+win]*w)) for i in range(0, len(m)-win, hop)]).T
    return 20*np.log10(S/S.max()+1e-6), hop
sr = 24000
rows = [("the phrase, dry", B/"dry.wav"), ("May: an octave each pass", B/"01_feedback_lens/wet.wav"),
        ("a fifth, then the cloud", HERE/"takes/fifth.wav"), ("a fifth, no cloud in the loop", HERE/"takes/fifth_bare.wav"),
        ("a fifth, long loop", HERE/"takes/fifth_long.wav")]
plt.rcParams.update({"font.size": 9, "text.color": "#c8c8d8", "axes.labelcolor": "#8a8aa0", "xtick.color": "#8a8aa0", "ytick.color": "#8a8aa0", "axes.edgecolor": "#4a4a5e"})
fig, ax = plt.subplots(1, 5, figsize=(15, 3.6), facecolor="#0a0a0f", sharey=True)
for a, (t, p) in zip(ax, rows):
    x, _ = sf.read(str(p)); S, hop = spec_db(x)
    a.set_facecolor("#0a0a0f")
    a.imshow(S, origin="lower", aspect="auto", cmap="magma", vmin=-75, vmax=0, extent=[0, S.shape[1]*hop/sr, 0, sr/2000])
    a.set_xlim(0, 6); a.set_ylim(0, 6); a.set_title(t, fontsize=10); a.set_xlabel("seconds")
ax[0].set_ylabel("kHz")
fig.tight_layout(); fig.savefig(HERE/"interval.png", dpi=110, facecolor=fig.get_facecolor())
