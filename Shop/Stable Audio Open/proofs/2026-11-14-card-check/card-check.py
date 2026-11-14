"""
Card check, 2026-11-14: does Stable Audio Open hand back stereo? (tuning item 13 found ten small-sfx takes mono.)
Four 10 s renders, one seed each: small-music and small-sfx, each with a plain prompt and one that asks for width.
Measures left/right correlation and side/mid level on each, times the load and the renders, keeps one as m4a.

Run, from the palace's main checkout:
  _tools/stable-audio-3/.venv/bin/python "Shop/Stable Audio Open/proofs/2026-11-14-card-check/card-check.py"
"""
import json, subprocess, time
from pathlib import Path
import numpy as np, torch, torchaudio
from stable_audio_3 import StableAudioModel

OUT = Path(__file__).parent; SR = 44_100; DUR = 10; SEED = 7
JOBS = [
    ("small-music", "plain", "a warm sustained synth pad, slow, soft"),
    ("small-music", "wide",  "a warm sustained synth pad, slow, soft, very wide stereo, sound moving left and right"),
    ("small-sfx",   "plain", "light rain on leaves"),
    ("small-sfx",   "wide",  "light rain on leaves, wide stereo field, drops on the far left and far right"),
]
rec = {"made": "2026-11-14", "seed": SEED, "duration_sec": DUR, "takes": []}
models = {}
for name, kind, prompt in JOBS:
    if name not in models:
        t = time.time(); models[name] = StableAudioModel.from_pretrained(name); rec[f"load_sec_{name}"] = round(time.time() - t, 1)
    t = time.time(); a = models[name].generate(prompt=prompt, duration=DUR, seed=SEED); g = round(time.time() - t, 2)
    a = a[0] if a.dim() == 3 else a; x = a.detach().cpu().float().numpy()
    L, R = x[0], x[1] if x.shape[0] > 1 else x[0]
    corr = float(np.corrcoef(L, R)[0, 1]); mid, side = (L + R) / 2, (L - R) / 2
    sm = 20 * np.log10((np.sqrt(np.mean(side ** 2)) + 1e-12) / (np.sqrt(np.mean(mid ** 2)) + 1e-12))
    take = {"model": name, "kind": kind, "prompt": prompt, "channels": int(x.shape[0]), "samples": int(x.shape[1]),
            "lr_correlation": round(corr, 3), "side_over_mid_db": round(float(sm), 1), "gen_sec": g}
    rec["takes"].append(take); print(json.dumps(take), flush=True)
    if (name, kind) == ("small-music", "wide"):
        wav = OUT / "small-music — wide pad.wav"; torchaudio.save(str(wav), torch.from_numpy(x[:, : DUR * SR]), SR)
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "160000", str(wav), str(wav.with_suffix(".m4a"))], check=True); wav.unlink()
(OUT / "report.json").write_text(json.dumps(rec, indent=2) + "\n")
print(json.dumps({k: v for k, v in rec.items() if k.startswith("load")}))
