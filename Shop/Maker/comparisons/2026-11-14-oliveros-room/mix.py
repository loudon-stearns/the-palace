"""Build the Shop side from the chosen takes. Same shape as the hand's: focal 0-11.5 s, global from 13 s, others fifty times down while focal."""
import hashlib, json, subprocess, sys
from pathlib import Path
import numpy as np, torch, torchaudio
OUT = Path(__file__).parent; SR, TOTAL = 44_100, 26
DRIP, ROOM = int(sys.argv[1]), int(sys.argv[2])
def fit(a): n = TOTAL * SR; return a[:, :n] if a.shape[1] >= n else np.pad(a, ((0, 0), (0, n - a.shape[1])))
def gate(n, start, end, ramp):
    t = np.arange(n) / SR; up = np.clip((t - start) / ramp + 1, 0, 1) if start > 0 else np.ones(n)
    return np.minimum(up, np.clip((end - t) / ramp + 1, 0, 1))
def db(x): return round(float(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)), 1)
drip, room = fit(np.load(OUT / f"take-drip-{DRIP}.npy")), fit(np.load(OUT / f"take-room-{ROOM}.npy"))
n = TOTAL * SR; focal, glob = gate(n, 0, 11.5, 0.4), gate(n, 13.0, TOTAL + 1, 0.6)
mix = drip * (focal + glob) * 0.8 + room * (focal * 0.02 + glob) * 0.8
mix = mix * (10 ** (-1 / 20) / np.abs(mix).max())
def write(name, a):
    wav = OUT / f"{name}.wav"; torchaudio.save(str(wav), torch.from_numpy(a.astype(np.float32)), SR)
    s, _ = torchaudio.load(str(wav)); s = s.numpy().mean(0)
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "160000", str(wav), str(wav.with_suffix(".m4a"))], check=True); wav.unlink()
    return s
s = write("shop — one point, then the whole sphere", mix); write("source — drip", drip); write("source — room", room)
takes = json.load(open(OUT / "takes.json"))
report = {"made": "2026-11-14", "chain": ["Stable Audio Open (stable-audio-3 3.0, small-sfx, steps 8, cfg 1.0)", "chosen by measurement from four seeds each (takes.py)", "gated and mixed by hand (mix.py)"],
  "prompts": takes["prompts"], "chosen": {"drip_seed": DRIP, "room_seed": ROOM}, "takes": takes["takes"],
  "first_take": "seed 1932 with the first prompts (make.py): the drip ran about four onsets a second and fell 9 dB across the clip; the room rose 8 dB at 15 s. Set aside.",
  "measured_on_saved_file": {"focal_half_rms_db": db(s[1*SR:11*SR]), "global_half_rms_db": db(s[14*SR:24*SR]), "peak_dbfs": round(float(20 * np.log10(np.abs(s).max())), 1)},
  "stereo": "every take came back with left and right identical (correlation 1.00): the Shop side is mono; the hand's side pans its sources",
  "sha256": {p.name: hashlib.sha256(p.read_bytes()).hexdigest()[:16] for p in sorted(OUT.glob("*.m4a"))},
  "heard_by": "nobody yet"}
(OUT / "report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n"); print(report["measured_on_saved_file"], report["sha256"])
