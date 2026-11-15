"""The noise-fault probe's last arm, 2026-11-15: the same three prompts and seeds through the medium model (1.4B, SAME-Large
decoder), which the PyTorch route will not run on a Mac, through Stability's own MLX port (_tools/stable-audio-3/optimized/mlx).
Defaults: 8 steps, cfg 1.0, the DiT in fp16 and the decoder in fp32. Medium is trained for music; the step and the hall ask it
for sound effects anyway, to hear what the bigger decoder alone does. Measured with measure.py, written into report.json.
Run from any checkout: <main>/_tools/stable-audio-3/.venv/bin/python medium.py"""
import json, subprocess, sys, time
from pathlib import Path
import torchaudio
sys.path.insert(0, str(Path(__file__).parent)); from measure import measure
OUT = Path(__file__).parent; MLX = Path(subprocess.run(["git", "rev-parse", "--git-common-dir"], capture_output=True, text=True, cwd=OUT).stdout.strip()).parent / "_tools/stable-audio-3/optimized/mlx"
rec = json.loads((OUT / "report.json").read_text())
for s, d in rec["sounds"].items():
    wav = OUT / f"{s}-g-medium.wav"; t = time.time()
    subprocess.run([str(MLX / ".venv/bin/python"), "scripts/sa3_mlx.py", "--prompt", d["prompt"], "--dit", "medium", "--decoder", "same-l",
                    "--seconds", str(d["seconds"]), "--seed", str(d["seed"]), "--out", str(wav)], cwd=MLX, check=True, capture_output=True,
                   env={"PATH": "/usr/bin:/bin:/opt/homebrew/bin", "HOME": str(Path.home()), "HF_HUB_DISABLE_XET": "1"})
    g = round(time.time() - t, 1); y, sr = torchaudio.load(str(wav)); m = measure(y.numpy()[:, : int(d["seconds"] * 44_100)])
    d["variants"]["g-medium"] = {"settings": "medium (1.4B) + SAME-L decoder, MLX port, steps 8, cfg 1.0, DiT fp16", "gen_sec_incl_load": g, "channels": int(y.shape[0]), "sample_rate": sr, **m}
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "192000", str(wav), str(wav.with_suffix(".m4a"))], check=True); wav.unlink(); print(s, g, m, flush=True)
(OUT / "report.json").write_text(json.dumps(rec, indent=2) + "\n")
