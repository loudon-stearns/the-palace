"""
comb_patterns.py — pump at 3x the loop rate and the noise picks the timbre.

Gain pumped at ratio 3, eps 0.1, from a -80 dB noise floor, 2.5 s per seed,
seeds 3..6 back to back. Three gain peaks per trip mean three slots for pulses;
which slots fill, and with which signs, is decided by the noise that seeded them.
Writes comb_e_three_slots_four_seeds.wav, and the last trip of each run for the figure.
"""
import numpy as np, json
from scipy.io import wavfile
src = open("comb_render.py").read(); g = {}; exec(src[:src.index("ramp = lambda")], g)
run, FS, F0, L = g["run"], g["FS"], g["F0"], g["L"]
f = np.fft.rfftfreq(FS, 1 / FS); outs = []; trips = []; rep = {}
for s in (3, 4, 5, 6):
    x = run(2.5, lambda t: 0.1 * np.ones_like(t), lambda t: 3 * np.ones_like(t), seed=s)
    X = np.abs(np.fft.rfft(x[-FS:] * np.hanning(FS))); t = X.max()
    rep[f"seed{s}"] = {f"h{k}": round(float(20 * np.log10(X[np.argmin(abs(f - k * F0)) - 3: np.argmin(abs(f - k * F0)) + 4].max() / t)), 1) for k in range(1, 7)}
    trips.append(x[-2 * (L + 1):].copy())
    fade = int(0.01 * FS); x = x.copy(); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    outs.append(x / np.abs(x).max() * 0.89)
    print(s, rep[f"seed{s}"], flush=True)
wavfile.write("comb_e_three_slots_four_seeds.wav", FS, (np.concatenate(outs) * 32767).astype(np.int16))
np.save("comb_patterns_trips.npy", np.array(trips)); json.dump(rep, open("comb_patterns.json", "w"), indent=1)
