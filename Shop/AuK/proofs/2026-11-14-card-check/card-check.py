"""
Card check, 2026-11-14: one call to the free tencent/AuK Space (ZeroGPU). gradio_client sends the locally saved Hugging Face
login by default, so this call ran on Loudon's free quota, not anonymously; nothing was paid.
The call: a word swap on 13.5 s of
Kokoro speech (af_bella, from Kokoro's card check), then Whisper base reads the edit back.

Run, from the palace's main checkout, with any Python that has gradio_client (Homebrew python3 has 2.5.0):
  python3 "Shop/AuK/proofs/2026-11-14-card-check/card-check.py"
"""
import json, shutil, subprocess, tempfile, time
from pathlib import Path
from gradio_client import Client, handle_file

OUT = Path(__file__).parent
SRC = Path("Shop/Kokoro/proofs/2026-11-14-card-check/af_bella — study.m4a")
INSTRUCTION = "Replace the word 'small' with the word 'large', keep everything else the same."
tmp = Path(tempfile.mkdtemp()); wav = tmp / "source.wav"
subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(SRC), str(wav)], check=True)
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)], capture_output=True, text=True).stdout)
t = time.time()
out = Client("tencent/AuK", verbose=False).predict(False, "AuK (Base)", handle_file(str(wav)), INSTRUCTION, round(dur, 2), 32, 2.0, 42, api_name="/run_generate_with_pe")
call = round(time.time() - t, 1)
edit = tmp / "edit.wav"; shutil.copy(out, edit)
subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "64000", str(edit), str(OUT / "word swap — small to large.m4a")], check=True)
subprocess.run(["whisper", str(edit), "--model", "base", "--language", "en", "--output_format", "txt", "--output_dir", str(tmp), "--fp16", "False"], capture_output=True)
heard = (tmp / "edit.txt").read_text().strip()
edur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(edit)], capture_output=True, text=True).stdout)
rec = {"made": "2026-11-14", "space": "tencent/AuK", "token": "gradio_client default: the locally saved HF login", "source": str(SRC), "source_sec": round(dur, 2), "instruction": INSTRUCTION,
       "use_pe": False, "variant": "AuK (Base)", "gen_seconds": round(dur, 2), "nfe": 32, "cfg": 2.0, "seed": 42,
       "call_sec_incl_upload_and_queue": call, "edit_sec": round(edur, 2), "whisper_base_heard": heard}
(OUT / "report.json").write_text(json.dumps(rec, indent=2) + "\n"); print(json.dumps(rec, indent=2))
