"""
title: Linear Predictive Coding — rich — the phrase (recipe)
born: 2026-11-03
parent: [[Linear Predictive Coding]] · rich face, proposal round 2026-11
forward_vector: I am how the spoken phrase the rich face analyses was made, so anyone can make it
  again: one sentence from the page's own quotes, said by Kokoro (open weights, Apache-2.0) in the
  af_heart voice the palace already publishes on Kuramoto Coupling's face, written at 16 kHz mono.

Run:  ~/.venvs/kokoro/bin/python "Linear Predictive Coding — rich — the phrase.py"
Then: ffmpeg resamples Kokoro's 24 kHz to 16 kHz, 16-bit, and trims to the speech.
"""
import subprocess, sys
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro import KPipeline

HERE = Path(__file__).parent
TEXT = "The residual is where the soul hides."
OUT = HERE / "Linear Predictive Coding — rich — the phrase.wav"
TMP = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "_phrase_24k.wav"

pipe = KPipeline(lang_code="a")
audio = np.concatenate([np.asarray(a) for _, _, a in pipe(TEXT, voice="af_heart", speed=0.92)])
# trim leading/trailing silence at -50 dB of peak, keep 60 ms either side
pk = np.max(np.abs(audio)); on = np.where(np.abs(audio) > pk * 10 ** (-50 / 20))[0]
a, b = max(0, on[0] - 1440), min(len(audio), on[-1] + 1440)
sf.write(TMP, audio[a:b] / pk * 0.89, 24000, subtype="FLOAT")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(TMP), "-ar", "16000", "-ac", "1",
                "-sample_fmt", "s16", str(OUT)], check=True)
if TMP.parent == HERE: TMP.unlink()
print(OUT, sf.info(OUT).duration, "s")
