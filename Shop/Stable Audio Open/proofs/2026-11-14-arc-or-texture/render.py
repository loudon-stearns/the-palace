"""
Arc or Texture? — the Daily Page rough for Stable Audio Open, 2026-11-14.

Tests the page's forward vector: can SA3 small render a narrative arc, or only
texture? Four matched pairs (same model, same seed, same length): one prompt
asks for a clear change over time, its twin asks for the same sound held steady.
Plus a practice pair (labelled in the rough) and one 60 s render past the
page's stated ~47 s ceiling.

Each clip is also measured: loudness (RMS dB) and brightness (spectral
centroid) in the first and last quarter, so the ear can be checked against
the numbers.
"""
from __future__ import annotations
import json, subprocess, sys, time
from pathlib import Path
import numpy as np
import torch, torchaudio
from stable_audio_3 import StableAudioModel

OUT = Path(__file__).parent
SR = 44_100
SEC = 20

PAIRS = [
  # (id, model, seed, arc prompt, steady prompt)
  ("practice", "small-sfx", 11,
   "wind that begins as a faint whisper and grows steadily into a howling storm, clear build from quiet to loud",
   "wind blowing at a constant moderate strength, steady and unchanging throughout"),
  ("pulses", "small-sfx", 23,
   "scattered ticking pulses at slightly different rates that gradually pull together and lock into one shared rhythm, clear arc from chaos to order",
   "scattered ticking pulses at slightly different rates, steady texture, unchanging throughout"),
  ("pad", "small-music", 37,
   "warm synthesizer pad that starts almost silent, slowly swells to a full bright climax, then fades away",
   "warm synthesizer pad held at a constant level, static and unchanging"),
  ("rain", "small-sfx", 41,
   "rain that begins as a few scattered drops and builds into a heavy downpour",
   "steady rain at a constant even intensity"),
  ("drone", "small-music", 53,
   "low dark drone that slowly brightens and rises into high shimmering tones",
   "low dark drone, static, no change"),
]
LONG = ("long", "small-music", 61, 60,
   "ambient pad that slowly evolves over a minute, starting dark and low, opening into bright airy tones by the end")


def measure(a: np.ndarray) -> dict:
    mono = a.mean(axis=0)
    n = len(mono); q = n // 4
    def seg(x):
        rms = 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
        spec = np.abs(np.fft.rfft(x * np.hanning(len(x))))
        f = np.fft.rfftfreq(len(x), 1 / SR)
        cen = float((spec * f).sum() / (spec.sum() + 1e-9))
        return round(float(rms), 1), round(cen)
    r0, c0 = seg(mono[:q]); r1, c1 = seg(mono[-q:])
    # envelope in 20 frames for a tiny sparkline
    frames = np.array_split(mono, 20)
    env = [round(float(20 * np.log10(np.sqrt(np.mean(f ** 2)) + 1e-9)), 1) for f in frames]
    return {"rms_first": r0, "rms_last": r1, "rms_change_db": round(r1 - r0, 1),
            "centroid_first": c0, "centroid_last": c1,
            "centroid_ratio": round(c1 / max(c0, 1), 2), "envelope_db": env}


def save(audio, slug):
    if audio.dim() == 3: audio = audio[0]
    a = audio.detach().cpu().float()
    peak = a.abs().max().item()
    if peak > 0: a = a * (10 ** (-1 / 20) / peak)
    wav = OUT / f"{slug}.wav"
    torchaudio.save(str(wav), a, SR)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-ac", "1",
                    "-b:a", "96k", str(OUT / f"{slug}.mp3")], check=True)
    wav.unlink()
    return a.numpy()


def main():
    dev = "mps" if torch.backends.mps.is_available() else "cpu"
    models, report = {}, []
    def model(mid):
        if mid not in models:
            t = time.time(); models[mid] = StableAudioModel.from_pretrained(mid)
            print(f"loaded {mid} in {time.time()-t:.1f}s", flush=True)
        return models[mid]
    jobs = []
    for pid, mid, seed, arc, steady in PAIRS:
        jobs.append((f"{pid}-arc", mid, seed, SEC, arc, "arc", pid))
        jobs.append((f"{pid}-steady", mid, seed, SEC, steady, "steady", pid))
    jobs.append((LONG[0], LONG[1], LONG[2], LONG[3], LONG[4], "arc", "long"))
    for slug, mid, seed, dur, prompt, asked, pid in jobs:
        m = model(mid); t = time.time()
        audio = m.generate(prompt=prompt, duration=dur, seed=seed)
        g = time.time() - t
        a = save(audio, slug)
        rec = {"slug": slug, "pair": pid, "asked": asked, "model": mid, "seed": seed,
               "duration_sec": round(a.shape[-1] / SR, 2), "prompt": prompt,
               "gen_sec": round(g, 2), "device": dev, **measure(a)}
        report.append(rec)
        print(f"{slug}: {rec['duration_sec']}s gen {g:.1f}s  dB {rec['rms_change_db']:+}  bright x{rec['centroid_ratio']}", flush=True)
    (OUT / "report.json").write_text(json.dumps(report, indent=2) + "\n")
    return 0

if __name__ == "__main__":
    sys.exit(main())
