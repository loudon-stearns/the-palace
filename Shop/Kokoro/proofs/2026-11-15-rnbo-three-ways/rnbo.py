"""RNBO, three ways, 2026-11-15. The card's open test: "RNBO said the way Loudon says it (I spell it R-N-B-O)".
One sentence in af_bella (the Study default), with RNBO left alone (letter by letter, as misaki reads it) and with two
IPA overrides, "ren-bo" and "rin-bo". Each is loudnormed to -16 LUFS / -1 dBTP in two passes. The plain one is rendered
twice and the two arrays compared, for the card's other open test, byte-identical output.
A maker who knows a better way to fix a pronunciation uses it and leaves the comparison here.
Run: ~/.venvs/kokoro/bin/python rnbo.py"""
import hashlib, json, re, subprocess, time
from pathlib import Path
import numpy as np, soundfile as sf
OUT = Path(__file__).parent; SR = 24_000; VOICE = "af_bella"
SAY = {"letters": "RNBO", "ren-bo": "[RNBO](/ɹˈɛnbO/)", "rin-bo": "[RNBO](/ɹˈɪnbO/)"}
TEXT = "The patch is written in {r}, then exported from {r} to a plugin."
t = time.time(); from kokoro import KPipeline; pipe = KPipeline(lang_code="a"); rec = {"made": "2026-11-15", "voice": VOICE, "load_sec": round(time.time() - t, 1), "takes": {}}
def render(text):
    t = time.time(); ch = []; ph = []
    for _g, p, a in pipe(text, voice=VOICE, speed=1.0):
        ch.append((a.detach().cpu().numpy() if hasattr(a, "detach") else np.asarray(a)).astype(np.float32)); ph.append(p)
    return np.concatenate(ch), ph, round(time.time() - t, 2)
def loudnorm(raw, out):
    p1 = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(raw), "-af", "loudnorm=I=-16:TP=-1:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", p1).group(0))
    af = (f"loudnorm=I=-16:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json")
    p2 = subprocess.run(["ffmpeg", "-hide_banner", "-y", "-i", str(raw), "-af", af, "-ar", str(SR), str(out)], capture_output=True, text=True).stderr
    n = json.loads(re.findall(r"\{[^{}]*\"output_i\"[^{}]*\}", p2)[-1]); return float(n["output_i"]), float(n["output_tp"])
for k, r in SAY.items():
    x, ph, g = render(TEXT.format(r=r)); raw = OUT / f"_{k}.wav"; norm = OUT / f"rnbo-{k}.wav"; sf.write(raw, x, SR); lufs, tp = loudnorm(raw, norm)
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "64000", str(norm), str(norm.with_suffix(".m4a"))], check=True); norm.unlink()
    rec["takes"][k] = {"text": TEXT.format(r=r), "phonemes": ph, "render_sec": g, "audio_sec": round(len(x) / SR, 2), "lufs": lufs, "true_peak_dbtp": tp}
    if k == "letters":
        y, _, _ = render(TEXT.format(r=r)); same_len = len(y) == len(x)
        rec["determinism"] = {"same_length": same_len, "byte_identical": bool(same_len and np.array_equal(x, y)),
                              "max_abs_diff": float(np.abs(x - y).max()) if same_len else None,
                              "sha256": [hashlib.sha256(x.tobytes()).hexdigest()[:16], hashlib.sha256(y.tobytes()).hexdigest()[:16]]}
    raw.unlink(); print(k, rec["takes"][k], flush=True)
rec["heard_by"] = "nobody yet"; (OUT / "report.json").write_text(json.dumps(rec, indent=2, ensure_ascii=False) + "\n"); print(json.dumps(rec.get("determinism")))
