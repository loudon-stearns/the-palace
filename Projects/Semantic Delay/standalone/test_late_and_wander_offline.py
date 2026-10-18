"""
Semantic Delay — late echoes and per-echo knobs, offline against a slow stub
=============================================================================

The real model takes about 2 s of compute per second of sung audio through the
helper (2026-10-14, M1 Max). This test rehearses that timing with no model: the
stub helper is started with `--stub-rtf 2.0`, so it sleeps as long as the model
would and hands the audio back unchanged. The instrument's offline mode replays
those measured compute times on a simulated serial queue, so what it renders is
what the same settings would play live.

Four cases, one tone-burst phrase each unless noted (phrase ~0.91 s with the
segmenter's hangover, so one conversion costs ~1.8 s):

  A  delay 2.5 s, one conversion, feedback train of 2 -> both echoes land.
  B  delay 1.2 s (shorter than the conversion) -> echo 1 is skipped whole,
     not clipped; echoes 2 and 3 of the feedback train still land.
  C  per-echo knob [1, 0.5, 0], delay 2.5 s -> three conversions, all land,
     each reporting its own k.
  D  the same per-echo knob with two phrases 1.2 s apart -> the second
     phrase's echoes queue behind the first's six conversions and are late.
     Per-echo knobs multiply the work: each phrase costs (echoes x RTF x
     length) of compute, and that has to fit before the next phrase arrives.

Run:  python test_late_and_wander_offline.py
"""

from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
DAEMON_DIR = HERE.parent / "daemon"
sys.path.insert(0, str(DAEMON_DIR))
sys.path.insert(0, str(HERE))

from audio_io import WavFileSink, WavFileSource, f32_to_bytes, read_wav_mono, write_wav_mono  # noqa: E402
from client import DaemonClient  # noqa: E402
import instrument  # noqa: E402
from test_stage2_offline import _energy_in_window, _wait_for_daemon  # noqa: E402

SR = 48000
STUB_RTF = 2.0


def make_input(path: Path, bursts: list[float], total: float) -> None:
    audio = np.zeros(int(total * SR), np.float32)
    t = np.arange(int(0.6 * SR)) / SR
    tone = 0.3 * np.sin(2 * np.pi * 220.0 * t).astype(np.float32)
    for b in bursts:
        audio[int(b * SR): int(b * SR) + len(tone)] += tone
    write_wav_mono(path, audio, SR)


def render(sock: Path, td: Path, name: str, bursts: list[float], **kw):
    in_wav, out_wav = td / f"{name}-in.wav", td / f"{name}-out.wav"
    make_input(in_wav, bursts, total=bursts[-1] + 1.5)
    conv = instrument.PhraseConverter(sock, "spirit.test.v1", SR)
    sink = WavFileSink(out_wav, SR)
    try:
        stats = instrument.run(WavFileSource(in_wav, 512), sink, conv, dry_gain=0.0,
                               wet_gain=0.9, realtime=False, verbose=False, tail_sec=0.5, **kw)
    finally:
        conv.close()
        sink.close()
    out, _ = read_wav_mono(out_wav)
    return stats, out


def window(out, start_s, length=0.6):
    return _energy_in_window(out, SR, start_s + 0.05, start_s + length)


def main() -> int:
    fails: list[str] = []

    def check(cond: bool, label: str) -> None:
        print(f"  {'PASS' if cond else 'FAIL'}  {label}")
        if not cond:
            fails.append(label)

    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        sock = td / "daemon.sock"
        proc = subprocess.Popen(
            [sys.executable, str(DAEMON_DIR / "semantic_delay_daemon.py"),
             "--sock", str(sock), "--pidfile", str(td / "daemon.pid"),
             "--prompts-dir", str(td / "prompts"), "--log-level", "WARNING",
             "--stub-rtf", str(STUB_RTF)],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            _wait_for_daemon(sock)
            with DaemonClient(sock) as c:
                c.prompts_register("spirit.test.v1", "Test", f32_to_bytes(np.zeros(SR, np.float32)), SR)

            print("A  delay longer than the conversion")
            st, out = render(sock, td, "A", [0.5], delay_sec=2.5, feedback=0.5, taps=2)
            end = st["phrase_ends"][0] / SR
            check(st["late"] == 0, f"no echo late (got {st['late']})")
            check(window(out, end + 2.5) > 0.05, "echo 1 lands at phrase end + 2.5 s")
            check(window(out, end + 5.0) > 0.03, "echo 2 lands at phrase end + 5.0 s")

            print("B  delay shorter than the conversion")
            st, out = render(sock, td, "B", [0.5], delay_sec=1.2, feedback=0.5, taps=3)
            end = st["phrase_ends"][0] / SR
            check(_energy_in_window(out, SR, end + 1.2, end + 2.35) < 1e-4,
                  "echo 1 is skipped whole: nothing plays in its slot, not even its tail")
            check(window(out, end + 2.4) > 0.03, "echo 2 of the feedback train still lands")
            check(window(out, end + 3.6) > 0.015, "echo 3 still lands")

            print("C  a knob per echo, one phrase")
            st, out = render(sock, td, "C", [0.5], delay_sec=2.5, tap_coupling=[1.0, 0.5, 0.0])
            end = st["phrase_ends"][0] / SR
            check(len(st["echoes"]) == 3, f"three conversions (got {len(st['echoes'])})")
            check([e["k"] for e in st["echoes"]] == [1.0, 0.5, 0.0], "each echo carries its own k")
            check(st["late"] == 0, f"all three land (late {st['late']})")
            check(all(window(out, end + 2.5 * i) > 0.05 for i in (1, 2, 3)),
                  "echoes at +2.5, +5.0, +7.5 s")

            print("D  a knob per echo, two phrases close together")
            st, out = render(sock, td, "D", [0.5, 1.7], delay_sec=2.5, tap_coupling=[1.0, 0.5, 0.0])
            late = [(e["phrase"], e["tap"]) for e in st["echoes"] if e["late"]]
            check(all(not e["late"] for e in st["echoes"] if e["phrase"] == 1),
                  "phrase 1's three echoes land")
            check(len(late) > 0 and all(p == 2 for p, _ in late),
                  f"phrase 2 has late echoes, skipped not clipped (late: {late})")
            for e in st["echoes"]:
                print(f"     phrase {e['phrase']} echo {e['tap']} k={e['k']}: due {e['due_sec']} s, "
                      f"ready {e['ready_sec']} s{'  LATE' if e['late'] else ''}")
        finally:
            try:
                with DaemonClient(sock) as c:
                    c.shutdown()
            except Exception:
                pass
            try:
                proc.wait(timeout=5)
            except Exception:
                proc.kill()

    print(f"\n  {'PASS' if not fails else 'FAIL'} — {len(fails)} failures")
    return 1 if fails else 0


if __name__ == "__main__":
    raise SystemExit(main())
