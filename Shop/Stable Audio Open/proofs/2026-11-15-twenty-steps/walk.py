"""Twenty steps for a walk, 2026-11-15. Loudon, 2026-11-15: "I'd be curious in the future, as we have said before to make
20 step variations and see how we could work with them in a "walk"".
small-sfx makes a footstep on stone 24 times, one seed each (defaults: 8 steps, cfg 1, pingpong). The hand cuts the step out
of each take (back to its onset, forward until it dies), keeps the twenty that stand cleanest above what precedes them,
and places them as a walk: one step every 0.54 s or so, a little early or late, a little louder or softer, a little left
or right as the feet alternate. Then the same walk again, every placement identical, with the first kept step in all twenty
places. So the two files differ only in whether the steps differ.
Run from any checkout: <main>/_tools/stable-audio-3/.venv/bin/python walk.py"""
import json, subprocess, time
from pathlib import Path
import numpy as np, torch, torchaudio
from stable_audio_3 import StableAudioModel
OUT = Path(__file__).parent; SR = 44_100
PROMPT = "a single footstep on a stone floor, close, then silence"
SEEDS = range(2001, 2025); KEEP = 20
def env(x, w=0.005):
    n = int(w * SR); m = len(x) // n; return np.sqrt((x[:m * n].reshape(m, n) ** 2).mean(1)), n
def cut(x, longest=0.6):
    e, n = env(x); p = int(e.argmax()); a = p
    while a > 0 and p - a < 10 and e[a - 1] > e[p] * 0.05: a -= 1
    b = p
    while b < len(e) - 1 and (b - a) * n < longest * SR and e[b:b + 10].max() > e[p] * 0.01: b += 1
    before = e[max(0, a - 60):a]; iso = 20 * np.log10(e[p] / (np.median(before) + 1e-6)) if len(before) else 0.0
    c = x[max(0, a * n - 88):b * n].copy(); fi, fo = 88, min(len(c) // 4, int(0.012 * SR))
    c[:fi] *= np.linspace(0, 1, fi); c[-fo:] *= np.linspace(1, 0, fo)
    return c / (np.abs(c).max() + 1e-9), float(iso)
t = time.time(); m = StableAudioModel.from_pretrained("small-sfx"); load = round(time.time() - t, 1)
takes = []
for s in SEEDS:
    t = time.time(); a = m.generate(prompt=PROMPT, duration=3, seed=s); g = round(time.time() - t, 2)
    x = (a[0] if a.dim() == 3 else a).detach().cpu().float().numpy().mean(0); c, iso = cut(x)
    takes.append({"seed": s, "clip": c, "cut_sec": round(len(c) / SR, 3), "isolation_db": round(iso, 1), "gen_sec": g}); print(s, takes[-1]["cut_sec"], round(iso, 1), g, flush=True)
ok = [k for k in takes if 0.08 <= k["cut_sec"] <= 0.6]
kept = sorted(ok, key=lambda k: -k["isolation_db"])[:KEEP]; kept.sort(key=lambda k: k["seed"])
# how different are the twenty? correlation of their log spectra, pairwise (1.0 = the same colour of sound)
def spec(c):
    S = np.abs(np.fft.rfft(np.pad(c, (0, max(0, 8192 - len(c))))[:8192] * np.hanning(8192))) ** 2
    b = np.add.reduceat(S, np.unique(np.geomspace(1, 4096, 40).astype(int))); return np.log10(b + 1e-12)
P = np.array([spec(k["clip"]) for k in kept]); C = np.corrcoef(P); off = C[~np.eye(len(kept), dtype=bool)]
# the walk: placements drawn once, used for both files
rng = np.random.default_rng(1703); n = KEEP; gap = 0.54
at = 0.4 + np.arange(n) * gap + rng.normal(0, 0.012, n); lv = 10 ** (rng.normal(0, 1.5, n) / 20) * 0.7
pan = 0.5 + np.where(np.arange(n) % 2 == 0, -0.12, 0.12) + rng.normal(0, 0.02, n)
N = int((at[-1] + 1.2) * SR)
def place(clips):
    L = np.zeros(N); R = np.zeros(N)
    for i, c in enumerate(clips):
        j = int(at[i] * SR); y = c[: N - j] * lv[i]; L[j:j + len(y)] += y * np.cos(pan[i] * np.pi / 2); R[j:j + len(y)] += y * np.sin(pan[i] * np.pi / 2)
    return np.stack([L, R])
walks = {"walk-twenty-steps": place([k["clip"] for k in kept]), "walk-one-step-repeated": place([kept[0]["clip"]] * n)}
g = 10 ** (-1 / 20) / max(np.abs(w).max() for w in walks.values())       # one gain for both, so they sit at the same level
rec = {"made": "2026-11-15", "prompt": PROMPT, "model": "small-sfx", "settings": "steps 8, cfg 1.0, pingpong (defaults)", "load_sec": load,
       "takes": [{k: v for k, v in t_.items() if k != "clip"} for t_ in takes], "kept_seeds": [k["seed"] for k in kept],
       "repeated_seed": kept[0]["seed"], "kept_by": "cut between 0.08 and 0.6 s, then the twenty whose onset stands furthest above the 0.3 s before it",
       "spectral_correlation_between_kept_steps": {"min": round(float(off.min()), 3), "median": round(float(np.median(off)), 3), "max": round(float(off.max()), 3)},
       "placement": {"step_at_sec": [round(float(v), 3) for v in at], "level": [round(float(v), 3) for v in lv], "pan_0_left_1_right": [round(float(v), 3) for v in pan]}, "files": {}}
for name, w in walks.items():
    wav = OUT / f"{name}.wav"; torchaudio.save(str(wav), torch.from_numpy((w * g).astype(np.float32)), SR)
    y, _ = torchaudio.load(str(wav)); y = y.numpy()
    rec["files"][name + ".m4a"] = {"seconds": round(y.shape[1] / SR, 2), "peak_dbfs": round(float(20 * np.log10(np.abs(y).max())), 2), "rms_dbfs": round(float(20 * np.log10(np.sqrt((y ** 2).mean()))), 1)}
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "192000", str(wav), str(wav.with_suffix(".m4a"))], check=True); wav.unlink()
rec["heard_by"] = "nobody yet"
(OUT / "report.json").write_text(json.dumps(rec, indent=2) + "\n"); print(json.dumps({k: rec[k] for k in ("kept_seeds", "spectral_correlation_between_kept_steps", "files")}))
