"""Whisper's rare-words proof, 2026-11-15: the same Kokoro sentence read back by each speech-to-text route this Mac has,
scored against the script. Routes: openai-whisper base (the page's), and mlx-whisper large-v3-turbo (the newer route found
on 2026-11-15) when its venv exists. Word error rate is computed after lower-casing and stripping punctuation.
A maker with a better route adds it here and leaves the comparison. Run: python3 read-back.py"""
import json, re, subprocess, time, os
from pathlib import Path
OUT = Path(__file__).parent; AUDIO = OUT / "rare-words.m4a"; REF = (OUT / "rare-words.txt").read_text().strip()
RARE = ["kuramoto", "entrains", "kokoro", "whisper", "rnbo"]
def words(s): return re.sub(r"[^a-z0-9& ]", " ", s.lower()).split()
def wer(ref, hyp):
    r, h = words(ref), words(hyp); d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        p, d[0] = d[0], i
        for j in range(1, len(h) + 1): p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (r[i - 1] != h[j - 1]))
    return round(d[len(h)] / len(r), 3)
rec = {"made": "2026-11-15", "script": REF, "routes": {}}
t = time.time(); subprocess.run(["whisper", str(AUDIO), "--model", "base", "--language", "en", "--output_format", "json", "--output_dir", str(OUT / "_base"), "--fp16", "False"], check=True, capture_output=True)
hyp = json.loads((OUT / "_base" / "rare-words.json").read_text())["text"].strip()
rec["routes"]["openai-whisper base"] = {"text": hyp, "sec": round(time.time() - t, 1)}
subprocess.run(["rm", "-rf", str(OUT / "_base")])
mlx = Path.home() / ".venvs/mlx-whisper/bin/python"
if mlx.exists():
    for model in ("mlx-community/whisper-large-v3-turbo",):
        t = time.time(); r = subprocess.run([str(mlx), "-c", f"import mlx_whisper,json;print(json.dumps(mlx_whisper.transcribe({str(AUDIO)!r},path_or_hf_repo={model!r},language='en')['text']))"], capture_output=True, text=True, env={**os.environ, "HF_HUB_DISABLE_XET": "1"})
        if r.returncode == 0: rec["routes"]["mlx-whisper " + model.split("/")[-1]] = {"text": json.loads(r.stdout.strip().splitlines()[-1]).strip(), "sec": round(time.time() - t, 1), "note": "includes model load"}
        else: rec["routes"]["mlx-whisper " + model.split("/")[-1]] = {"error": r.stderr[-400:]}
for k, v in rec["routes"].items():
    if "text" in v:
        hw = words(v["text"]); v["wer"] = wer(REF, v["text"]); v["rare_words_heard"] = {w: (w in hw) for w in RARE}
(OUT / "report.json").write_text(json.dumps(rec, indent=2) + "\n"); print(json.dumps(rec, indent=2))
