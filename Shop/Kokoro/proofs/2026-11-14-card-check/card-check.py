"""
Card check, 2026-11-14: one short Study-tier render with af_bella (the Study default, never rendered before),
a text that carries "RNBO" unoverridden and "Kuramoto" with its IPA override, then two-pass ffmpeg loudnorm
to -16 LUFS / -1 dBTP. Prints how misaki reads RNBO, times the load and the render, keeps an m4a.

Run, from the palace's main checkout:
  ~/.venvs/kokoro/bin/python "Shop/Kokoro/proofs/2026-11-14-card-check/card-check.py"
"""
import json, re, subprocess, time
from pathlib import Path
import numpy as np, soundfile as sf

OUT = Path(__file__).parent; SR = 24_000; VOICE = "af_bella"
TEXT = ("This is a short check of the Kokoro voice called Bella. "
        "The patch runs in RNBO, inside Max. "
        "The model it sounds out is called [Kuramoto](/kˌuɹəmˈOtO/) coupling, and its coupling constant, K, is small.")
rec = {"made": "2026-11-14", "voice": VOICE, "text": TEXT}
t = time.time()
from kokoro import KPipeline
from misaki import en
pipe = KPipeline(lang_code="a"); rec["load_sec"] = round(time.time() - t, 1)
rec["misaki_reads"] = {w: en.G2P()(w)[0] for w in ("RNBO", "Kuramoto")}
t = time.time(); chunks = []
for _g, ph, audio in pipe(TEXT, voice=VOICE, speed=1.0):
    a = audio.detach().cpu().numpy() if hasattr(audio, "detach") else np.asarray(audio)
    chunks += [a.astype(np.float32), np.zeros(int(0.25 * SR), np.float32)]
    rec.setdefault("phonemes", []).append(ph)
x = np.concatenate(chunks[:-1]); rec["render_sec"] = round(time.time() - t, 2); rec["audio_sec"] = round(len(x) / SR, 2)
raw = OUT / "raw.wav"; sf.write(raw, x, SR)
p1 = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(raw), "-af", "loudnorm=I=-16:TP=-1:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", p1).group(0))
af = (f"loudnorm=I=-16:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json")
p2 = subprocess.run(["ffmpeg", "-hide_banner", "-y", "-i", str(raw), "-af", af, "-ar", str(SR), str(OUT / "norm.wav")], capture_output=True, text=True).stderr
n = json.loads(re.findall(r"\{[^{}]*\"output_i\"[^{}]*\}", p2)[-1])
rec.update({"raw_lufs": float(m["input_i"]), "out_lufs": float(n["output_i"]), "out_tp_dbtp": float(n["output_tp"])})
rec["status"] = "ok" if abs(rec["out_lufs"] + 16) <= 0.5 and rec["out_tp_dbtp"] <= -0.9 else "spec_miss"
subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "64000", str(OUT / "norm.wav"), str(OUT / "af_bella — study.m4a")], check=True)
raw.unlink(); (OUT / "norm.wav").unlink()
(OUT / "report.json").write_text(json.dumps(rec, indent=2, ensure_ascii=False) + "\n"); print(json.dumps(rec, indent=2, ensure_ascii=False))
