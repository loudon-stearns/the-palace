"""The test sentence for Whisper's rare-words proof, 2026-11-15, read by Kokoro af_bella with no pronunciation overrides,
so every rare word is said the way Kokoro says it unaided. Run: ~/.venvs/kokoro/bin/python speak.py"""
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro import KPipeline
TEXT = ("Kuramoto coupling entrains the oscillators until they move as one. "
        "Kokoro reads the script aloud, and Whisper writes it back down. "
        "The patch is written in RNBO, then exported to a plugin.")
OUT = Path(__file__).parent; pipe = KPipeline(lang_code="a")
x = np.concatenate([a.detach().cpu().numpy() for _g, _p, a in pipe(TEXT, voice="af_bella", speed=1.0)])
sf.write(OUT / "rare-words.wav", x, 24_000); (OUT / "rare-words.txt").write_text(TEXT + "\n")
# then: afconvert -f m4af -d aac -b 64000 rare-words.wav rare-words.m4a; the m4a is what read-back.py reads, and the wav is deleted
