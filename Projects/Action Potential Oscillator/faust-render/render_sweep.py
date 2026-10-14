"""
Render the Faust NeuroPulse crowd through a coupling sweep and set it beside
the June Python audition.

Build the renderer first (Faust 2.88 + clang on the Mac):
  faust -a arch.cpp -i neuropulse_render.dsp -o render.cpp
  c++ -O2 -std=c++17 -I/opt/homebrew/include render.cpp -o /tmp/np_render
Then:  python3 render_sweep.py
Out:   neuropulse-faust-sweep.wav, faust-vs-python.png
"""
import subprocess, numpy as np
from scipy.io import wavfile
from scipy.signal import spectrogram
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

SR, DUR, KMAX = 48000, 30.0, 0.016
raw = subprocess.run(["/tmp/np_render", str(DUR), str(SR), "sweep_mode=1",
                      f"K_max={KMAX}", "hold_in_s=0", f"ramp_s={DUR}"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32).reshape(-1, 3)
audio, mf, K = x[:, 0].astype(float), x[:, 1], x[:, 2]
audio = audio / np.max(np.abs(audio)) * 0.85
fade = int(0.02 * SR); audio[:fade] *= np.linspace(0, 1, fade); audio[-fade:] *= np.linspace(1, 0, fade)
wavfile.write("../neuropulse-faust-sweep.wav", SR, (audio * 32767).astype(np.int16))

# "together": the largest share of the crowd caught spiking in the same instant,
# per 250 ms window (0.03 = everyone on their own, 1.0 = all 32 at once)
win = SR // 4
nwin = len(mf) // win
tw = (np.arange(nwin) + 0.5) * win / SR
together = np.array([mf[i*win:(i+1)*win].max() for i in range(nwin)])
Kw = np.array([K[i*win:(i+1)*win].mean() for i in range(nwin)])

py_sr, py = wavfile.read("../neuropulse-population-audition.wav")
py = py.astype(float) / 32768

fig, ax = plt.subplots(3, 1, figsize=(11, 9), sharex=True)
ax[0].plot(tw, together, color="#c0392b", lw=2, label="share of the crowd spiking together")
ax0b = ax[0].twinx(); ax0b.plot(tw, Kw, color="#555", ls="--", label="coupling K")
ax0b.set_ylabel("coupling K"); ax[0].set_ylabel("together (0–1)"); ax[0].set_ylim(0, 1.05)
ax[0].set_title("Faust NeuroPulse, 32 neurons — coupling rises 0 → 0.016 → 0 over 30 s")
ax[0].legend(loc="upper left"); ax0b.legend(loc="upper right")
for a, sig, sr, title in [(ax[1], audio, SR, "Faust render (this cycle)"),
                          (ax[2], py, py_sr, "Python audition (June)")]:
    f, t, S = spectrogram(sig, fs=sr, nperseg=8192, noverlap=6144)
    keep = f < 1500
    a.pcolormesh(t, f[keep], 10*np.log10(S[keep] + 1e-12), shading="auto", cmap="magma",
                 vmin=10*np.log10(S.max()) - 70)
    a.set_ylabel("Hz"); a.set_title(title)
ax[2].set_xlabel("seconds")
plt.tight_layout(); plt.savefig("../faust-vs-python.png", dpi=110)

for lo, hi in [(0, 3), (6, 9), (13, 17), (21, 24), (27, 30)]:
    m = (tw >= lo) & (tw < hi)
    print(f"{lo:>2}-{hi:<2}s  K≈{Kw[m].mean():.4f}  together≈{together[m].mean():.2f}")
