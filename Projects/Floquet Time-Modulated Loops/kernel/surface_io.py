"""Read a 2D Torus surface WAV (mono float32, 1024 x 1024) as S[row, col].
col = position inside one wavetable cycle (the axis an oscillator scans fast),
row = which cycle (the slow, morph axis)."""
import numpy as np, struct
from pathlib import Path
WT = Path(__file__).resolve().parents[2] / "2D Torus Wavetable Synthesizer" / "Wavetables"

def load_surface(stem):
    b = (WT / f"{stem}.wav").read_bytes()
    i = 12
    while i < len(b):
        cid, size = b[i:i+4], struct.unpack('<I', b[i+4:i+8])[0]
        if cid == b'data':
            x = np.frombuffer(b[i+8:i+8+size], dtype='<f4').astype(np.float64)
            return x.reshape(1024, 1024)
        i += 8 + size + (size & 1)
    raise ValueError(stem)
