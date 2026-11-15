"""
Kokoro reads the one sentence of the beats teaching clip, 2026-11-15.
Copied from Shop/Kokoro/proofs/2026-11-14-card-check/card-check.py (its Run line), with TEXT and VOICE changed,
and one addition: it keeps Kokoro's own word timings so Manim can cue to them (narration as the clock).
Loudness is NOT normalized here; ffmpeg does that once, on the joined clip (join.sh).
Run: ~/.venvs/kokoro/bin/python narrate.py
"""
import json, time
from pathlib import Path
import numpy as np, soundfile as sf

OUT = Path(__file__).parent; SR = 24_000; VOICE = "af_heart"
TEXT = ("Add two waves a little apart in pitch, and their sum swells and fades: "
        "it beats exactly as often as their frequencies differ.")
rec = {"made": "2026-11-15", "voice": VOICE, "text": TEXT, "words": []}
t = time.time()
from kokoro import KPipeline
pipe = KPipeline(lang_code="a"); rec["load_sec"] = round(time.time() - t, 1)
t = time.time(); chunks = []; offset = 0.0
for res in pipe(TEXT, voice=VOICE, speed=1.0):
    a = res.audio.detach().cpu().numpy() if hasattr(res.audio, "detach") else np.asarray(res.audio)
    for tok in (res.tokens or []):
        if tok.start_ts is not None:
            rec["words"].append({"w": tok.text, "start": round(offset + tok.start_ts, 3), "end": round(offset + (tok.end_ts or tok.start_ts), 3)})
    chunks.append(a.astype(np.float32)); offset += len(a) / SR
x = np.concatenate(chunks); rec["render_sec"] = round(time.time() - t, 2); rec["audio_sec"] = round(len(x) / SR, 3)
sf.write(OUT / "narration-raw.wav", x, SR)
(OUT / "narration.json").write_text(json.dumps(rec, indent=2) + "\n"); print(json.dumps(rec, indent=1))
