"""
Semantic Delay — where an echo's seconds go (Stage 1.5 follow-up)
=================================================================

The helper proof measured RTF ~2.0-2.3 per phrase over the socket, worse than
the 1.65 from April. That matters live: an echo can only land on time if the
conversion finishes inside the delay, so the shortest honest delay is about
(phrase length x RTF). This bench splits one conversion into its parts and
tries the two cheap levers:

  * a shorter reference-singer clip (the model re-reads the whole prompt on
    every call, so a 10.7 s prompt costs on every echo), and
  * fewer diffusion steps (32 -> 16).

Uses the helper's own backend class, so the numbers are the helper's numbers.
Run in the soulx env:  ~/miniconda3/envs/soulx/bin/python stage15_latency_bench.py
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "daemon"))
OUT = HERE / "demo" / "stage15-real-daemon"

import librosa  # noqa: E402
import soundfile as sf  # noqa: E402
from soulx_backend import SoulXBackend, MODEL_SR, resample  # noqa: E402

SOULX = Path.home() / "Documents/soulx/SoulX-Singer"
HOST_SR = 44100


def main() -> None:
    be = SoulXBackend(SOULX)
    be.load()
    full, _ = librosa.load(str(SOULX / "example/audio/music.mp3"), sr=HOST_SR)
    phrase = full[int(14.0 * HOST_SR): int(18.5 * HOST_SR)].astype(np.float32)
    prompt, _ = librosa.load(str(SOULX / "example/audio/zh_prompt.mp3"), sr=HOST_SR)
    sec = len(phrase) / HOST_SR

    # warm-up (first MPS call compiles kernels)
    p24, pf0 = be.prepare_prompt(prompt[: int(4 * HOST_SR)], HOST_SR)
    be.convert(phrase, HOST_SR, HOST_SR, p24, pf0, {"n_steps": 8})

    # the parts
    t = time.monotonic(); src = resample(phrase, HOST_SR, MODEL_SR); t_rs = time.monotonic() - t
    t = time.monotonic(); be.extract_f0(src); t_f0 = time.monotonic() - t

    rows = []
    for prompt_sec in (10.7, 5.0, 3.0):
        p24, pf0 = be.prepare_prompt(prompt[: int(prompt_sec * HOST_SR)], HOST_SR)
        for n_steps in (32, 16):
            t = time.monotonic()
            r = be.convert(phrase, HOST_SR, HOST_SR, p24, pf0, {"n_steps": n_steps})
            wall = time.monotonic() - t
            y = np.frombuffer(r["audio_out"], dtype="<f4")
            tag = f"prompt{prompt_sec:g}s-steps{n_steps}"
            sf.write(OUT / f"bench-{tag}.wav", y, HOST_SR)
            rows.append({"prompt_sec": prompt_sec, "n_steps": n_steps,
                         "seconds": round(wall, 2), "rtf": round(wall / sec, 2),
                         "shortest_live_delay_for_8s_phrase": round(8.0 * wall / sec, 1),
                         "file": f"bench-{tag}.wav"})
            print(rows[-1], flush=True)

    report = {"phrase_seconds": round(sec, 2), "device": be.device,
              "resample_s": round(t_rs, 3), "rmvpe_s": round(t_f0, 3), "rows": rows}
    (OUT / "stage15-latency-bench.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
