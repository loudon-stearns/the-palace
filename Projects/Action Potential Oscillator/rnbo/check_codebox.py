"""
Check the hand-written RNBO codebox against the Faust crowd, then render the
CV phrase demo.

Needs: node; the Faust renderer built in DOUBLE precision (the codebox runs in
doubles, as RNBO does):
  cd ../faust-render
  faust -double -a arch.cpp -i neuropulse_render.dsp -o /tmp/apo-render-d.cpp
  c++ -O2 -std=c++17 -I/opt/homebrew/include /tmp/apo-render-d.cpp -o /tmp/np_render_d
and numpy + scipy + matplotlib.

Out (bundle root): neuropulse-codebox-phrase.wav, codebox-vs-faust.png
"""
import subprocess, numpy as np
from scipy.io import wavfile
from scipy.signal import spectrogram
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

SR, DUR, KMAX = 48000, 30.0, 0.016

def run(cmd):
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout,
                         dtype=np.float32).reshape(-1, 3).astype(float)

cb = run(["node", "codebox-harness.mjs", "neuropulse-crowd.codebox", str(DUR), str(SR), str(KMAX)])
fa = run(["/tmp/np_render_d", str(DUR), str(SR), "sweep_mode=1", f"K_max={KMAX}",
          "hold_in_s=0", f"ramp_s={DUR}"])
diff = np.abs(cb[:, 0] * 0.4 - fa[:, 0])     # Faust applies gain 0.4 inside; the codebox leaves it outside
print(f"largest audio difference over {len(diff)} samples: {diff.max():.2e}")
print(f"synchrony output identical: {np.array_equal(cb[:, 1], fa[:, 1])}")

ph = run(["node", "codebox-harness.mjs", "neuropulse-crowd.codebox", "24", str(SR), "0.02", "phrase"])
audio = ph[:, 0] / np.max(np.abs(ph[:, 0])) * 0.85
fade = int(0.02 * SR); audio[:fade] *= np.linspace(0, 1, fade); audio[-fade:] *= np.linspace(1, 0, fade)
wavfile.write("../neuropulse-codebox-phrase.wav", SR, (audio * 32767).astype(np.int16))

win = SR // 8
def together(mf):
    n = len(mf) // win
    return (np.arange(n) + 0.5) * win / SR, np.array([mf[i*win:(i+1)*win].max() for i in range(n)])

fig, ax = plt.subplots(3, 1, figsize=(11, 9.5))
t1, g1 = together(cb[:, 1]); t2, g2 = together(fa[:, 1])
ax[0].plot(t2, g2, color="#2471a3", lw=5, alpha=0.45, label="Faust crowd (double precision)")
ax[0].plot(t1, g1, color="#c0392b", lw=1.4, label="hand-written RNBO codebox (run in Node)")
ax[0].set_ylim(0, 1.05); ax[0].set_ylabel("together (0–1)")
ax[0].set_title(f"Same 30 s coupling sweep, 32 neurons — largest sample difference {diff.max():.1e}")
ax[0].legend(loc="upper left")

f, t, S = spectrogram(audio, fs=SR, nperseg=8192, noverlap=7168)
keep = f < 1500
ax[1].pcolormesh(t, f[keep], 10*np.log10(S[keep] + 1e-12), shading="auto", cmap="magma",
                 vmin=10*np.log10(S.max()) - 70)
ax[1].set_ylabel("Hz")
ax[1].set_title("CV phrase demo: A2 C3 E3 D3, coupling breathing at 0.2 Hz, spread widening")
tp, gp = together(ph[:, 1])
ax[2].plot(tp, gp, color="#c0392b", lw=1.6, label="synchrony output (out2)")
ax2b = ax[2].twinx(); ax2b.plot(np.arange(len(ph)) / SR, ph[:, 2], color="#555", ls="--", lw=1, label="coupling K (in2)")
ax[2].set_ylim(0, 1.05); ax[2].set_ylabel("together (0–1)"); ax2b.set_ylabel("K")
ax[2].set_xlabel("seconds"); ax[2].legend(loc="upper left"); ax2b.legend(loc="upper right")
plt.tight_layout(); plt.savefig("../codebox-vs-faust.png", dpi=105)

for k in range(12):
    m = (tp >= 2*k) & (tp < 2*k + 2)
    print(f"note {k:>2} ({2*k:>2}-{2*k+2:<2}s) peak together {gp[m].max():.2f}")
