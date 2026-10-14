"""
Semantic Delay — Stage 1.5 proof: the real model behind the helper
==================================================================

Last cycle the model ran in a standalone script. This proof runs it the way the
plugin will: the helper process holds SoulX-Singer-SVC, and the playable Python
instrument talks to it over the RPC v0.1 socket, unchanged.

In order:
  1. Build a 44.1 kHz input: two sung phrases from the SoulX example vocal
     with a gap between them (44.1 kHz on purpose — the helper must do all
     the resampling, per the standing order).
  2. Start the helper with `--backend soulx` on a private socket and prompts
     folder (so it never collides with another session's helper).
  3. Wait for `hello` to say the model is loaded, and on which device.
  4. Register the reference singer over the wire (44.1 kHz too). The helper
     resamples it, runs RMVPE, and writes a real WAV + .f0.npy pair.
  5. Run the instrument offline: segment -> convert over the socket ->
     scheduled 8 s delay -> WAV. Every echo comes back in the other voice.
  6. Shut the helper down, start it again, and check the singer is still
     listed (the registry rehydrates real pairs from disk).
  7. Measure: the RTF the helper reports, and how much nearer each echo's
     timbre sits to the reference singer than to the source.

Run on the Mac, in the soulx env (about 90 s, most of it the model load and
two conversions):
  ~/miniconda3/envs/soulx/bin/python stage15_real_daemon.py
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
DAEMON = HERE.parent / "daemon"
SOULX = Path.home() / "Documents/soulx/SoulX-Singer"
OUT = HERE / "demo" / "stage15-real-daemon"
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(DAEMON))

import librosa  # noqa: E402
import soundfile as sf  # noqa: E402

from client import DaemonClient  # noqa: E402
from audio_io import WavFileSink, WavFileSource, f32_to_bytes  # noqa: E402
import instrument  # noqa: E402

HOST_SR = 44100
DELAY = 8.0                              # the honest minimum at RTF ~1.65
PHRASES = [(0.6, 7.0), (14.0, 18.5)]     # seconds into music.mp3
GAP = 2.0
PROMPT_ID = "spirit.huehuecoyotl.v1"


def fade(x: np.ndarray, sr: int, ms: float = 20.0) -> np.ndarray:
    n = int(sr * ms / 1000)
    x = x.copy()
    ramp = np.linspace(0, 1, n, dtype=np.float32)
    x[:n] *= ramp
    x[-n:] *= ramp[::-1]
    return x


def mfcc_mean(y: np.ndarray, sr: int) -> np.ndarray:
    m = librosa.feature.mfcc(y=y.astype(np.float32), sr=sr, n_mfcc=20)
    return m[1:].mean(axis=1)  # drop c0 (loudness)


def start_helper(rundir: Path, log_path: Path) -> subprocess.Popen:
    cmd = [sys.executable, str(DAEMON / "semantic_delay_daemon.py"),
           "--backend", "soulx",
           "--sock", str(rundir / "daemon.sock"),
           "--pidfile", str(rundir / "daemon.pid"),
           "--prompts-dir", str(rundir / "prompts")]
    return subprocess.Popen(cmd, stdout=open(log_path, "a"), stderr=subprocess.STDOUT)


def wait_hello(sock: Path, want_loaded: bool, timeout: float = 180.0) -> dict:
    t0 = time.monotonic()
    while time.monotonic() - t0 < timeout:
        try:
            with DaemonClient(sock) as c:
                h = c.hello()
            if h["model"]["loaded"] or not want_loaded:
                return h
        except (FileNotFoundError, ConnectionRefusedError):
            pass
        time.sleep(0.5)
    raise TimeoutError("helper never came up")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    rundir = Path(tempfile.mkdtemp(prefix="sd-stage15-"))
    log_path = OUT / "helper.log"
    log_path.write_text("")

    # 1. input -------------------------------------------------------------
    full, _ = librosa.load(str(SOULX / "example/audio/music.mp3"), sr=HOST_SR)
    parts = [np.zeros(int(0.5 * HOST_SR), np.float32)]
    for i, (a, b) in enumerate(PHRASES):
        parts.append(fade(full[int(a * HOST_SR): int(b * HOST_SR)], HOST_SR))
        parts.append(np.zeros(int((GAP if i < len(PHRASES) - 1 else 0.3) * HOST_SR), np.float32))
    dry = np.concatenate(parts).astype(np.float32)
    in_wav = OUT / "input-two-phrases-44k.wav"
    sf.write(in_wav, dry, HOST_SR, subtype="PCM_16")

    prompt, _ = librosa.load(str(SOULX / "example/audio/zh_prompt.mp3"), sr=HOST_SR)

    # 2-4. helper up, singer registered ------------------------------------
    sock = rundir / "daemon.sock"
    proc = start_helper(rundir, log_path)
    report: dict = {}
    try:
        t0 = time.monotonic()
        h = wait_hello(sock, want_loaded=True)
        report["hello"] = {"build": h["build"], "device": h["model"]["device"],
                           "loaded": h["model"]["loaded"],
                           "seconds_to_ready": round(time.monotonic() - t0, 1)}
        print("hello:", report["hello"], flush=True)
        with DaemonClient(sock) as c:
            reg = c.prompts_register(PROMPT_ID, "Huehuecoyotl (SoulX example singer)",
                                     f32_to_bytes(prompt.astype(np.float32)), HOST_SR)
        report["register"] = {k: reg.get(k) for k in ("prompt_id", "duration_sec", "f0_cached")}
        stored = Path(reg["stored_at"])
        report["register"]["stored_wav_sr"] = sf.info(str(stored)).samplerate
        report["register"]["f0_frames"] = int(np.load(stored.with_suffix(".f0.npy")).size)
        print("register:", report["register"], flush=True)

        # 5. the instrument, offline, over the socket ----------------------
        results = []
        conv = instrument.PhraseConverter(sock, PROMPT_ID, HOST_SR)
        orig = conv._client.convert

        def recording_convert(*a, **k):
            r = orig(*a, **k)
            results.append(r)
            return r
        conv._client.convert = recording_convert

        out_wav = OUT / "stage15-real-daemon-delay.wav"
        source = WavFileSource(in_wav, 512)
        sink = WavFileSink(out_wav, HOST_SR)
        t1 = time.monotonic()
        try:
            stats = instrument.run(source, sink, conv, delay_sec=DELAY, dry_gain=0.8,
                                   wet_gain=0.9, feedback=0.0, taps=1, tail_sec=1.0)
        finally:
            conv.close()
            sink.close()
        report["instrument"] = {"phrases": stats["phrases"], "delay_sec": DELAY,
                                "wall_seconds": round(time.monotonic() - t1, 1)}
        with DaemonClient(sock) as c:
            c.shutdown()
        proc.wait(timeout=30)

        # 6. restart: does the singer survive? ------------------------------
        proc = start_helper(rundir, log_path)
        h2 = wait_hello(sock, want_loaded=False, timeout=60)
        with DaemonClient(sock) as c:
            listed = c.prompts_list()["prompts"]
            c.shutdown()
        proc.wait(timeout=30)
        report["restart"] = {"prompt_count": h2["prompt_count"],
                             "listed": [{"id": p["id"], "duration_sec": p["duration_sec"],
                                         "f0_cached": p["f0_cached"]} for p in listed]}
        print("restart:", report["restart"], flush=True)
    finally:
        if proc.poll() is None:
            proc.terminate()

    # 7. measure ---------------------------------------------------------------
    p_m = mfcc_mean(prompt, HOST_SR)
    rows = []
    for i, ((a, b), r) in enumerate(zip(PHRASES, results)):
        src = full[int(a * HOST_SR): int(b * HOST_SR)]
        wet = np.frombuffer(r.audio_out, dtype="<f4")
        sf.write(OUT / f"echo-{i + 1}.wav", wet, r.sample_rate)
        s_m, w_m = mfcc_mean(src, HOST_SR), mfcc_mean(wet, r.sample_rate)
        d_src = float(np.linalg.norm(w_m - s_m))
        d_pr = float(np.linalg.norm(w_m - p_m))
        src_to_pr = float(np.linalg.norm(s_m - p_m))
        rows.append({"phrase": i + 1, "seconds_in": round(b - a, 2),
                     "returned_sr": r.sample_rate,
                     "seconds_out": round(len(wet) / r.sample_rate, 2),
                     "rtf": r.rtf, "applied_shift_st": r.applied_pitch_shift,
                     "timbre_dist_echo_to_source": round(d_src, 1),
                     "timbre_dist_echo_to_singer": round(d_pr, 1),
                     "timbre_dist_source_to_singer": round(src_to_pr, 1)})
    report["echoes"] = rows

    # Timeline picture: where each dry phrase and each echo sits.
    y, _ = sf.read(OUT / "stage15-real-daemon-delay.wav", dtype="float32")
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig, ax = plt.subplots(figsize=(12, 3.2), facecolor="#f6f1e7")
    ax.set_facecolor("#f6f1e7")
    t = np.arange(len(y)) / HOST_SR
    ax.plot(t, y, color="#9a9184", lw=0.4)
    ends = stats["phrase_ends"]
    for i, ((a, b), e) in enumerate(zip(PHRASES, ends)):
        start = e / HOST_SR - (b - a) - 0.3
        ax.axvspan(start, e / HOST_SR, color="#1f4e79", alpha=0.12)
        ax.text(start + 0.1, 0.92, f"you, phrase {i + 1}", fontsize=8, color="#1f4e79",
                transform=ax.get_xaxis_transform())
        es = e / HOST_SR + DELAY
        ax.axvspan(es, es + rows[i]["seconds_out"], color="#c0392b", alpha=0.14)
        ax.text(es + 0.1, 0.92, f"echo {i + 1}, other singer · rtf {rows[i]['rtf']:.2f}",
                fontsize=8, color="#c0392b", transform=ax.get_xaxis_transform())
    ax.set_xlabel("seconds")
    ax.set_yticks([])
    for s in ("top", "right", "left"):
        ax.spines[s].set_visible(False)
    ax.set_title("Semantic Delay — the helper holds the real model; the instrument's echoes change voice "
                 f"({DELAY:.0f} s delay, 44.1 kHz host)", loc="left", fontsize=10)
    fig.tight_layout()
    fig.savefig(OUT / "stage15-real-daemon-timeline.png", dpi=130)

    (OUT / "stage15-real-daemon-report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
