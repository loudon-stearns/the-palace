"""Second pass: the first take's drip ran about four onsets a second and faded 9 dB; its room rose 8 dB at 15 s.
Generation costs seconds, so take several seeds and choose by measurement, as a maker who cannot hear must.
Chosen: the drip nearest one onset a second with the flattest level; the room with the flattest level."""
import json, time, numpy as np, torch
from stable_audio_3 import StableAudioModel
SR, TOTAL = 44_100, 26
P = {"drip": "slow water drip, one single drop falling into water every second, silence between the drops, close and dry, no rain, no stream",
     "room": "room tone, quiet interior with an open window, soft steady rain outside, faint electrical hum, occasional distant bird, constant level, no change"}
def stats(x):
    n = int(0.02 * SR); m = len(x) // n; e = np.sqrt((x[:m*n].reshape(m, n) ** 2).mean(1)); d = 20 * np.log10(e + 1e-9)
    thr = np.median(d) + 12; on = sum(1 for i in range(1, len(d)) if d[i] > thr and d[i-1] <= thr)
    q = [float(20 * np.log10(np.sqrt((s ** 2).mean()) + 1e-9)) for s in np.array_split(x, 4)]
    return on, round(max(q) - min(q), 1)
m = StableAudioModel.from_pretrained("small-sfx"); out = []
for k, prompt in P.items():
    for seed in (1932, 1933, 1934, 1935):
        t = time.time(); a = m.generate(prompt=prompt, duration=TOTAL, seed=seed); g = time.time() - t
        a = a[0] if a.dim() == 3 else a; a = a.detach().cpu().float().numpy(); a = a / (np.abs(a).max() + 1e-9)
        on, spread = stats(a.mean(0)); corr = float(np.corrcoef(a[0], a[1])[0, 1])
        np.save(f"take-{k}-{seed}.npy", a.astype(np.float32))
        out.append({"source": k, "seed": seed, "onsets": on, "quarter_spread_db": spread, "lr_corr": round(corr, 2), "gen_sec": round(g, 2)})
        print(out[-1], flush=True)
json.dump({"prompts": P, "takes": out}, open("takes.json", "w"), indent=2)
