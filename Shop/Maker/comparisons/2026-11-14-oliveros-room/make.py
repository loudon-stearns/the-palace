"""
Hand against Shop — the Pauline Oliveros room, 2026-11-14.

The hand's piece (Enrichment/light-round-2026-11/make-sounds-3.py, listening())
synthesizes a room from noise, sines and plucks, then plays it twice: attention
closed on one drip (everything else turned down fifty times), then opened.

This side keeps that shape exactly and changes only the materials: Stable Audio
Open makes the drip and the room, and the hand does the gating. A chain:
  Stable Audio Open (small-sfx) -> two sources -> gate and mix by hand.

Same length (26 s), same seed (1932, the hand's), same gate times and depths.
Run: _tools/stable-audio-3/.venv/bin/python make.py
"""
from __future__ import annotations
import hashlib, json, subprocess, sys, time
from pathlib import Path
import numpy as np
import torch, torchaudio
from stable_audio_3 import StableAudioModel

OUT = Path(__file__).parent
SR, TOTAL, SEED, MODEL = 44_100, 26, 1932, "small-sfx"
SOURCES = {
  "drip": "a single tap dripping slowly into a metal sink, close microphone, one clear drip about every second, dry, nothing else, steady and unchanging throughout",
  "room": "a quiet room with the window open, light rain outside, a low electrical hum, a small bird calling now and then, a distant bell, steady ambience, unchanging throughout",
}

def ramp_gate(n, start, end, ramp, floor):
    """1.0 inside [start, end], `floor` outside, linear ramps of `ramp` seconds."""
    t = np.arange(n) / SR
    up = np.clip((t - start) / ramp + 1, 0, 1) if start > 0 else np.ones(n)
    down = np.clip((end - t) / ramp + 1, 0, 1)
    g = np.minimum(up, down)
    return floor + (1 - floor) * g

def db(x): return round(float(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)), 1)

def main():
    dev = "mps" if torch.backends.mps.is_available() else "cpu"
    t = time.time(); m = StableAudioModel.from_pretrained(MODEL); load = time.time() - t
    src, rec = {}, {}
    for k, prompt in SOURCES.items():
        t = time.time(); a = m.generate(prompt=prompt, duration=TOTAL, seed=SEED); g = time.time() - t
        if a.dim() == 3: a = a[0]
        a = a.detach().cpu().float().numpy()
        a = a / (np.abs(a).max() + 1e-9)
        n = TOTAL * SR; a = a[:, :n] if a.shape[1] >= n else np.pad(a, ((0, 0), (0, n - a.shape[1])))
        src[k] = a; rec[k] = {"prompt": prompt, "gen_sec": round(g, 2)}
        torchaudio.save(str(OUT / f"source-{k}.wav"), torch.from_numpy(a), SR)
    n = TOTAL * SR
    # the hand's gates: focal 0-11.5 s (ramp 0.4), global from 13.0 s (ramp 0.6); others at 0.02 while focal
    focal = ramp_gate(n, 0, 11.5, 0.4, 0.0); glob = ramp_gate(n, 13.0, TOTAL + 1, 0.6, 0.0)
    drip = src["drip"] * (focal + glob) * 0.8
    room = src["room"] * (focal * 0.02 + glob) * 0.8
    mix = drip + room; mix = mix * (10 ** (-1 / 20) / np.abs(mix).max())
    wav = OUT / "shop — one point, then the whole sphere.wav"
    torchaudio.save(str(wav), torch.from_numpy(mix.astype(np.float32)), SR)
    # measured on the saved file, not the array
    saved, _ = torchaudio.load(str(wav)); s = saved.numpy().mean(axis=0)
    a, b = slice(1 * SR, 11 * SR), slice(14 * SR, 24 * SR)
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "160000", str(wav), str(wav.with_suffix(".m4a"))], check=True)
    report = {
      "made": "2026-11-14", "chain": ["Stable Audio Open (stable-audio-3, small-sfx)", "gate and mix by hand (this script)"],
      "model": MODEL, "seed": SEED, "device": dev, "load_sec": round(load, 1), "sources": rec,
      "measured_on_saved_file": {"focal_half_rms_db": db(s[a]), "global_half_rms_db": db(s[b]), "peak_dbfs": round(float(20 * np.log10(np.abs(s).max())), 1)},
      "sha256": {p.name: hashlib.sha256(p.read_bytes()).hexdigest()[:16] for p in sorted(OUT.glob("*.wav")) + sorted(OUT.glob("*.m4a"))},
      "heard_by": "nobody yet",
    }
    (OUT / "report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps(report, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    sys.exit(main())
