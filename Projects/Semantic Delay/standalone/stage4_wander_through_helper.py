"""
Semantic Delay — the melody knob through the helper (Stage 4 on RPC v0.2)
=========================================================================

Two cycles ago the knob was heard on the real model in a standalone script.
Last cycle the real model went behind the helper. This proof joins them: the
playable instrument asks the helper, over the socket, for one conversion per
echo, each with its own knob setting — echo 1 sings your melody (k = 1),
echo 2 half follows it (k = 0.5), echo 3 wanders onto the scale the phrase
sits on (k = 0). Each repeat drifts further from what you sang: the dub
feedback train, with the spirit loosening its grip a little more each time.

In order:
  1. A 44.1 kHz input: one 4.5 s sung phrase from the SoulX example vocal.
  2. Start the helper with `--backend soulx` on a private socket and prompts
     folder; wait for the model; register the reference singer over the wire.
  3. Run the instrument offline with `tap_coupling=[1, 0.5, 0]` and an 11 s
     delay (at today's settings a conversion costs ~2.2 s per sung second, so
     a 4.5 s phrase needs ~10 s; the offline timing replays the helper's own
     measured compute, so an echo that would be late live is skipped here too).
  4. Measure each echo: RMVPE what came back and compare it with the source
     melody (after the model's own octave/key shift) and with the contour the
     knob asked for; timbre distance to the source and to the singer.
  5. Picture: the contours per echo, and the timeline.

Run on the Mac, in the soulx env (~2 minutes: model load + three conversions):
  ~/miniconda3/envs/soulx/bin/python stage4_wander_through_helper.py
"""

from __future__ import annotations

import json
import os
import sys
import tempfile
import time
from pathlib import Path

os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")

import numpy as np

HERE = Path(__file__).resolve().parent
DAEMON = HERE.parent / "daemon"
SOULX = Path.home() / "Documents/soulx/SoulX-Singer"
OUT = HERE / "demo" / "stage4-through-helper"
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(DAEMON))

import librosa  # noqa: E402
import soundfile as sf  # noqa: E402

from client import DaemonClient  # noqa: E402
from audio_io import WavFileSink, WavFileSource, f32_to_bytes  # noqa: E402
from coupling import couple_phrase, coupling_error_semitones  # noqa: E402
from f0 import f0_to_midi  # noqa: E402
import instrument  # noqa: E402
from stage15_real_daemon import fade, mfcc_mean, start_helper, wait_hello  # noqa: E402

HOST_SR = 44100
SR24, HOP = 24000, 480
PHRASE = (14.0, 18.5)
DELAY = 11.0
KS = [1.0, 0.5, 0.0]
PROMPT_ID = "spirit.huehuecoyotl.v1"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    rundir = Path(tempfile.mkdtemp(prefix="sd-wander-"))
    log_path = OUT / "helper.log"
    log_path.write_text("")

    full, _ = librosa.load(str(SOULX / "example/audio/music.mp3"), sr=HOST_SR)
    src = fade(full[int(PHRASE[0] * HOST_SR): int(PHRASE[1] * HOST_SR)], HOST_SR)
    dry = np.concatenate([np.zeros(int(0.5 * HOST_SR), np.float32), src,
                          np.zeros(int(0.5 * HOST_SR), np.float32)]).astype(np.float32)
    in_wav = OUT / "input-one-phrase-44k.wav"
    sf.write(in_wav, dry, HOST_SR, subtype="PCM_16")
    prompt, _ = librosa.load(str(SOULX / "example/audio/zh_prompt.mp3"), sr=HOST_SR)

    sock = rundir / "daemon.sock"
    proc = start_helper(rundir, log_path)
    report: dict = {}
    results = []
    try:
        t0 = time.monotonic()
        h = wait_hello(sock, want_loaded=True)
        report["hello"] = {"build": h["build"], "protocol_version": h["protocol_version"],
                           "features": h.get("features"), "device": h["model"]["device"],
                           "seconds_to_ready": round(time.monotonic() - t0, 1)}
        print("hello:", report["hello"], flush=True)
        with DaemonClient(sock) as c:
            c.prompts_register(PROMPT_ID, "Huehuecoyotl (SoulX example singer)",
                               f32_to_bytes(prompt.astype(np.float32)), HOST_SR)

        conv = instrument.PhraseConverter(sock, PROMPT_ID, HOST_SR)
        orig = conv._client.convert

        def recording_convert(*a, **k):
            r = orig(*a, **k)
            results.append((k.get("coupling"), r))
            print(f"  echo k={k.get('coupling', {}).get('k')}: rtf {r.rtf}, "
                  f"report {r.coupling}", flush=True)
            return r
        conv._client.convert = recording_convert

        out_wav = OUT / "wander-through-helper-delay.wav"
        sink = WavFileSink(out_wav, HOST_SR)
        t1 = time.monotonic()
        try:
            stats = instrument.run(WavFileSource(in_wav, 512), sink, conv, delay_sec=DELAY,
                                   dry_gain=0.8, wet_gain=0.9, tap_coupling=KS, tail_sec=1.0)
        finally:
            conv.close()
            sink.close()
        report["instrument"] = {"phrases": stats["phrases"], "delay_sec": DELAY,
                                "late": stats["late"], "echoes": stats["echoes"],
                                "wall_seconds": round(time.monotonic() - t1, 1)}
        with DaemonClient(sock) as c:
            c.shutdown()
        proc.wait(timeout=30)
    finally:
        if proc.poll() is None:
            proc.terminate()

    # --- measure, with RMVPE on the CPU (the helper is gone) ---------------
    sys.path.insert(0, str(SOULX))
    cwd = os.getcwd()
    os.chdir(SOULX)
    from preprocess.tools.f0_extraction import F0Extractor
    ex = F0Extractor(str(SOULX / "pretrained_models/SoulX-Singer-Preprocess/rmvpe/rmvpe.pt"),
                     device="cpu", verbose=False)
    os.chdir(cwd)

    def rmvpe(y, sr):
        a24 = librosa.resample(np.asarray(y, np.float32), orig_sr=sr, target_sr=SR24)
        a16 = librosa.resample(a24, orig_sr=SR24, target_sr=16000)
        f16 = ex.model.infer_from_audio(a16, thred=ex.thred)
        f = ex.interpolate_f0(f16, original_length=a16.shape[-1], original_sr=16000,
                              target_sr=SR24, hop_size=HOP, max_duration=300)
        return np.asarray(f, np.float32)[: int(np.ceil(len(a24) / HOP))]

    src_f0 = rmvpe(src, HOST_SR)
    p_m, s_m = mfcc_mean(prompt, HOST_SR), mfcc_mean(src, HOST_SR)
    rows, curves = [], []
    for (spec, r) in results:
        wet = np.frombuffer(r.audio_out, dtype="<f4")
        k = spec["k"]
        sf.write(OUT / f"echo-k{k:.1f}.wav", wet, r.sample_rate)
        # Rebuild what the helper asked the model to sing (same code, same seed),
        # so the plot can show it; the helper's own number is in r.coupling.
        asked, _ = couple_phrase(src_f0, k, hop_sec=HOP / SR24, seed=spec["seed"])
        sung = rmvpe(wet, r.sample_rate)
        m = min(len(sung), len(asked), len(src_f0))
        shift = 2.0 ** (r.applied_pitch_shift / 12.0)
        w_m = mfcc_mean(wet, r.sample_rate)
        rows.append({
            "k": k, "rtf": r.rtf, "auto_shift_st": r.applied_pitch_shift,
            "asked_vs_source_st (helper)": (r.coupling or {}).get("asked_vs_source_st"),
            "sung_vs_asked_st": round(coupling_error_semitones(asked[:m] * shift, sung[:m]), 2),
            "sung_vs_source_st": round(coupling_error_semitones(src_f0[:m] * shift, sung[:m]), 2),
            "timbre_to_source": round(float(np.linalg.norm(w_m - s_m)), 1),
            "timbre_to_singer": round(float(np.linalg.norm(w_m - p_m)), 1),
        })
        curves.append((k, r.applied_pitch_shift, asked, sung))
        print(rows[-1], flush=True)
    report["echoes_measured"] = rows
    report["source_to_singer_timbre"] = round(float(np.linalg.norm(s_m - p_m)), 1)

    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig = plt.figure(figsize=(12, 8.6), facecolor="#f6f1e7")
    gs = fig.add_gridspec(4, 1, height_ratios=[1, 1, 1, 0.9])
    t = np.arange(len(src_f0)) * HOP / SR24
    for i, (k, sh, asked, sung) in enumerate(curves):
        ax = fig.add_subplot(gs[i])
        ax.set_facecolor("#f6f1e7")
        ax.plot(t, f0_to_midi(src_f0) + sh, color="#9a9184", lw=1.4, label="your melody (in the singer's key)")
        ax.plot(t[: len(asked)], f0_to_midi(asked) + sh, color="#1f4e79", lw=1.8, label="what the knob asked for")
        ts = np.arange(len(sung)) * HOP / SR24
        ax.plot(ts, f0_to_midi(sung), color="#c0392b", lw=1.0, alpha=0.85, label="what came back from the helper")
        ax.set_ylabel("MIDI")
        ax.set_title(f"echo {i + 1} · k = {k} · sung {rows[i]['sung_vs_source_st']} st from your melody",
                     loc="left", fontsize=10)
        for s_ in ("top", "right"):
            ax.spines[s_].set_visible(False)
        if i == 0:
            ax.legend(loc="upper right", fontsize=8, frameon=False)
    ax = fig.add_subplot(gs[3])
    ax.set_facecolor("#f6f1e7")
    y, _ = sf.read(OUT / "wander-through-helper-delay.wav", dtype="float32")
    ax.plot(np.arange(len(y)) / HOST_SR, y, color="#9a9184", lw=0.4)
    end = stats["phrase_ends"][0] / HOST_SR
    ax.axvspan(end - (PHRASE[1] - PHRASE[0]) - 0.3, end, color="#1f4e79", alpha=0.12)
    ax.text(end - (PHRASE[1] - PHRASE[0]), 0.9, "you", fontsize=8, color="#1f4e79",
            transform=ax.get_xaxis_transform())
    for i, e in enumerate(stats["echoes"]):
        s0 = e["due_sec"]
        ax.axvspan(s0, s0 + (PHRASE[1] - PHRASE[0]), color="#c0392b", alpha=0.08 if e["late"] else 0.15)
        ax.text(s0 + 0.1, 0.9, f"echo {i + 1}, k={e['k']}" + (" (late, skipped)" if e["late"] else ""),
                fontsize=8, color="#c0392b", transform=ax.get_xaxis_transform())
    ax.set_yticks([])
    ax.set_xlabel("seconds")
    for s_ in ("top", "right", "left"):
        ax.spines[s_].set_visible(False)
    fig.suptitle(f"Semantic Delay — each echo loosens its grip on the melody "
                 f"(through the helper, {DELAY:.0f} s delay)", x=0.01, ha="left", fontsize=12)
    fig.tight_layout()
    fig.savefig(OUT / "wander-through-helper.png", dpi=130)

    (OUT / "wander-through-helper-report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
