"""
run_echo_test.py — the plugin's code, live against the helper, in real time.

Builds tests/echo_through_helper.cpp (the plugin's own Algorithm.h and
HelperLink.h, no JUCE), starts the helper on a private socket, registers the
reference singer, and plays the two-phrase input through the plugin's audio
thread at the speed of a sound card. Every echo the plugin plays is logged:
when it was due, when it started, how late. Then the output is measured and
pictured.

  ~/miniconda3/envs/soulx/bin/python run_echo_test.py --backend stub    # seconds, no model
  ~/miniconda3/envs/soulx/bin/python run_echo_test.py --backend soulx   # the real model, ~2 min
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")

import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent
PLUGIN = HERE.parent
BUNDLE = PLUGIN.parent
STANDALONE = BUNDLE / "standalone"
sys.path.insert(0, str(STANDALONE))
sys.path.insert(0, str(BUNDLE / "daemon"))

from client import DaemonClient  # noqa: E402
from audio_io import f32_to_bytes  # noqa: E402
from stage15_real_daemon import start_helper, wait_hello  # noqa: E402

SR = 44100
INPUT = STANDALONE / "demo/stage15-real-daemon/input-two-phrases-44k.wav"
SINGER = Path.home() / "Documents/soulx/SoulX-Singer/example/audio/zh_prompt.mp3"
PROMPT_ID = "spirit.huehuecoyotl.v1"
MACHINERY_SRC = BUNDLE.parent / "VST Template/machinery/src"


def build(binary: Path) -> None:
    subprocess.run(["clang++", "-std=c++20", "-O2", f"-I{PLUGIN / 'src'}", f"-I{MACHINERY_SRC}",
                    str(HERE / "echo_through_helper.cpp"), "-o", str(binary)], check=True)


def picture(dry: np.ndarray, out: np.ndarray, rep: dict, path: Path) -> None:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    t_out = np.arange(len(out)) / SR
    fig, ax = plt.subplots(2, 1, figsize=(12, 5), sharex=True)
    ax[0].plot(np.arange(len(dry)) / SR, dry, lw=0.4, color="#555")
    ax[0].set_title("what went in (two sung phrases)", loc="left", fontsize=10)
    ax[1].plot(t_out, out, lw=0.4, color="#1f6f8b")
    for e in rep["echoes"]:
        ax[1].axvline(e["due_s"], color="#999", ls="--", lw=0.8)
        c = "#c0392b" if e["late_s"] > 0.01 else "#27ae60"
        ax[1].axvspan(e["start_s"], e["start_s"] + e["len_s"], color=c, alpha=0.12)
        ax[1].text(e["start_s"], 0.9 * np.abs(out).max(), f"p{e['phrase']} r{e['repeat']}"
                   + (f"\n+{e['late_s']:.1f} s late" if e["late_s"] > 0.01 else "\non time"), fontsize=7, va="top")
    ax[1].set_title("what the plugin played (dry + echoes; dashed = when each echo was due)", loc="left", fontsize=10)
    ax[1].set_xlabel("seconds")
    fig.tight_layout()
    fig.savefig(path, dpi=130)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--backend", choices=("stub", "soulx"), default="stub")
    ap.add_argument("--delay", type=float, default=12.0)
    ap.add_argument("--repeats", type=int, default=2)
    ap.add_argument("--hold", type=float, default=1.0)
    ap.add_argument("--letgo", type=float, default=0.5)
    ap.add_argument("--steps", type=int, default=16)
    a = ap.parse_args()

    out_dir = PLUGIN / "proofs" / f"echo-through-helper-{a.backend}"
    out_dir.mkdir(parents=True, exist_ok=True)
    work = Path(tempfile.mkdtemp(prefix="sd-plugin-"))
    binary = work / "echo_through_helper"
    build(binary)

    dry, sr = sf.read(str(INPUT), dtype="float32")
    assert sr == SR
    dry.astype("<f4").tofile(work / "in.f32")

    log = out_dir / "helper.log"
    log.write_text("")
    sock = work / "daemon.sock"
    cmd = [sys.executable, str(BUNDLE / "daemon/semantic_delay_daemon.py"), "--backend", a.backend,
           "--sock", str(sock), "--pidfile", str(work / "daemon.pid"), "--prompts-dir", str(work / "prompts")]
    proc = subprocess.Popen(cmd, stdout=open(log, "a"), stderr=subprocess.STDOUT)
    try:
        t0 = time.monotonic()
        h = wait_hello(sock, want_loaded=(a.backend == "soulx"))
        ready = time.monotonic() - t0
        import librosa
        singer, _ = librosa.load(str(SINGER), sr=SR)
        with DaemonClient(sock) as c:
            c.prompts_register(PROMPT_ID, "Huehuecoyotl (SoulX example singer)",
                               f32_to_bytes(singer.astype(np.float32)), SR)

        env = dict(os.environ, SEMANTIC_DELAY_SOCK=str(sock))
        t1 = time.monotonic()
        r = subprocess.run([str(binary), str(work / "in.f32"), str(SR), str(work / "out.f32"),
                            str(a.delay), str(a.repeats), str(a.hold), str(a.letgo), str(a.steps), "0"],
                           env=env, capture_output=True, text=True, check=True)
        wall = time.monotonic() - t1
        rep = json.loads(r.stdout)
        with DaemonClient(sock) as c:
            c.shutdown()
        proc.wait(timeout=30)
    finally:
        if proc.poll() is None:
            proc.kill()

    out = np.fromfile(work / "out.f32", dtype="<f4").reshape(-1, 2)
    peak = float(np.abs(out).max())
    mono = out[:, 0] / max(peak, 1.0)
    sf.write(out_dir / "plugin-output.wav", out / max(peak, 1.0), SR, subtype="PCM_16")
    picture(dry, mono, rep, out_dir / "timeline.png")

    rep.update(backend=a.backend, device=h["model"].get("device"), helper_ready_s=round(ready, 1),
               run_wall_s=round(wall, 1), delay_s=a.delay, repeats=a.repeats, hold=a.hold,
               letgo=a.letgo, steps=a.steps, output_peak=round(peak, 3),
               finite=bool(np.isfinite(out).all()))
    (out_dir / "report.json").write_text(json.dumps(rep, indent=2))
    print(json.dumps(rep, indent=2))


if __name__ == "__main__":
    main()
