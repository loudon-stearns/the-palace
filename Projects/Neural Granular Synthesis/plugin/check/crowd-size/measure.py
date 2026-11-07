"""measure.py — read the dumps run.cpp left in /tmp/ngc and say what crowd size does.

For each life (0.2, 0.5), tightness as a fraction of the lock point, and crowd 32..1024:
  r      mean agreement over the last 4 s (of 7)
  r_sd   how much the agreement wanders
  surge  dB swing of loudness (Even level off): std of 10 ms RMS in dB
  rate   the main rate of that swing, Hz (0.3-30 Hz)
Writes crowd-size-engine.json.
"""
import numpy as np, json, glob, os
SR = 44100; SIZES = [32, 64, 128, 256, 512, 1024]
rows = []
for f in sorted(glob.glob("/tmp/ngc/m_*.audio.f32")):
    _, life, ratio, idx = os.path.basename(f)[:-len(".audio.f32")].split("_")
    x = np.fromfile(f, np.float32)[3 * SR:]
    r = np.fromfile(f.replace("audio", "r"), np.float32)[3 * SR // 32:]
    hop = SR // 100
    rms = np.sqrt(np.mean(x[: len(x) // hop * hop].reshape(-1, hop) ** 2, 1)) + 1e-9
    db = 20 * np.log10(rms)
    d = db - db.mean()
    spec = np.abs(np.fft.rfft(d * np.hanning(len(d))))
    fr = np.fft.rfftfreq(len(d), 1 / 100)
    band = (fr > 0.3) & (fr < 30)
    rows.append(dict(life=float(life), ratio=float(ratio), N=SIZES[int(idx)],
                     r=round(float(r.mean()), 3), r_sd=round(float(r.std()), 3),
                     surge_db=round(float(d.std()), 2),
                     rate_hz=round(float(fr[band][spec[band].argmax()]), 1)))
rows.sort(key=lambda d: (d["life"], d["ratio"], d["N"]))
json.dump(rows, open("crowd-size-engine.json", "w"), indent=1)
for life in (0.2, 0.5):
    print(f"\nlife {life}  (lock at tightness {1/(1-life):.2f})")
    print("ratio  " + "".join(f"{n:>17}" for n in SIZES))
    for ratio in (0.6, 0.85, 0.95, 1.0, 1.1, 1.6):
        cells = [d for d in rows if d["life"] == life and d["ratio"] == ratio]
        print(f"{ratio:<6} " + "".join(f"  r{c['r']:.2f}±{c['r_sd']:.2f} {c['surge_db']:4.1f}dB" for c in cells))
