"""
Semantic Delay — Standalone instrument (Stage 2)
================================================

The first playable moment of the Phase 1 plan. Wires the pieces together:

    AudioSource -> PhraseSegmenter -> [daemon.convert over the wire] ->
    DelayEngine (scheduled playback) -> AudioSink

Conversion runs on a **background worker thread** (PhraseConverter) so the
audio loop is never blocked on daemon IPC — the same thread split the VST will
use at Stage 5. Scheduling is by absolute sample index (phrase end + delay), so
a conversion that finishes any time before its scheduled playback sample still
lands in the right place; with the Stage-1 pass-through stub (RTF≈0) that is
always true, and with the real model a delay of several seconds covers the
RTF≈1.65 conversion cost measured at Stage 0.

Two modes share one loop:
  * Offline: `--input file.wav --output out.wav`. Runs anywhere, no hardware.
    This is what the end-to-end test drives against the stub daemon.
  * Live:    `--input mic --output speaker`. Needs sounddevice (Mac path).

Connects to a running daemon (RPC v0.1). Start the daemon first:
    python ../daemon/semantic_delay_daemon.py
"""

from __future__ import annotations

import argparse
import queue
import sys
import threading
import time
from pathlib import Path
from dataclasses import dataclass
from typing import List, Optional, Tuple

import numpy as np

# Import the reference client from the sibling daemon bundle.
_DAEMON_DIR = Path(__file__).resolve().parent.parent / "daemon"
if str(_DAEMON_DIR) not in sys.path:
    sys.path.insert(0, str(_DAEMON_DIR))
from client import DaemonClient  # noqa: E402

from audio_io import (  # noqa: E402
    AudioSink,
    AudioSource,
    LiveMicSource,
    LiveSpeakerSink,
    WavFileSink,
    WavFileSource,
    bytes_to_f32,
    f32_to_bytes,
    read_wav_mono,
)
from delay_engine import DelayEngine  # noqa: E402
from segmenter import Phrase, PhraseSegmenter  # noqa: E402


@dataclass
class Job:
    """One conversion: a phrase, which echo of it this is, and the knob for it."""
    phrase: Phrase
    tap: int = 0                       # 0 = first echo
    coupling: Optional[dict] = None    # RPC v0.2 options.coupling, or None
    start_sample: int = 0              # where this echo is due on the timeline


@dataclass
class Done:
    job: Job
    wet: np.ndarray
    rtf: float
    wall_clock_ms: int
    coupling: Optional[dict]


class PhraseConverter:
    """Sends jobs to the daemon on a worker thread; results drained in order.

    `submit(job)` enqueues a conversion; the worker takes them oldest first.
    `drain_ready()` returns finished `Done`s in the order they were made.

    Why oldest first and not soonest-due first (tried 2026-10-14 against the
    slow stub, test_late_and_wander_offline.py case D): when the helper is
    overloaded, soonest-due interleaves two phrases' echoes and makes both
    late, a domino. Oldest first finishes one phrase's whole echo train and
    lets the next phrase drop out, which at least sounds like a busy tape
    machine. The better policy, skipping a job before spending compute on it
    when it can no longer land, needs the timeline clock in the worker; that
    belongs to the plugin's scheduler.
    `outstanding` counts in-flight work; `earliest_due()` is the soonest
    timeline sample any in-flight echo is due at, so the offline loop knows
    when it must wait instead of rendering past it.
    """

    def __init__(self, sock_path: Path, prompt_id: str, sample_rate: int,
                 *, n_steps: int = 32, cfg: float = 3.0):
        self._client = DaemonClient(sock_path)
        self._client.connect()
        self.prompt_id = prompt_id
        self.sample_rate = sample_rate
        self.n_steps = n_steps
        self.cfg = cfg
        self._in: "queue.Queue[Optional[Job]]" = queue.Queue()
        self._out: "queue.Queue[Done]" = queue.Queue()
        self._pending: List[Job] = []
        self._lock = threading.Lock()
        self._thread = threading.Thread(target=self._run, name="phrase-converter",
                                        daemon=True)
        self._thread.start()

    def hello(self) -> dict:
        return self._client.hello()

    def _convert(self, job: Job):
        return self._client.convert(
            self.prompt_id, f32_to_bytes(job.phrase.audio), self.sample_rate,
            n_steps=self.n_steps, cfg=self.cfg, coupling=job.coupling,
        )

    def _run(self) -> None:
        while True:
            job = self._in.get()
            if job is None:
                return
            r = self._convert(job)
            self._out.put(Done(job, bytes_to_f32(r.audio_out), r.rtf,
                               r.wall_clock_ms, r.coupling))

    def submit(self, job: "Job | Phrase") -> None:
        if isinstance(job, Phrase):  # the v0.1 call shape still works
            job = Job(job)
        with self._lock:
            self._pending.append(job)
        self._in.put(job)

    def drain_ready(self) -> List[Done]:
        ready: List[Done] = []
        while True:
            try:
                item = self._out.get_nowait()
            except queue.Empty:
                break
            ready.append(item)
            with self._lock:  # by identity: a Job holds arrays, so == is ambiguous
                self._pending = [j for j in self._pending if j is not item.job]
        return ready

    @property
    def outstanding(self) -> int:
        with self._lock:
            return len(self._pending)

    def earliest_due(self) -> Optional[int]:
        with self._lock:
            return min((j.start_sample for j in self._pending), default=None)

    def close(self) -> None:
        self._in.put(None)
        self._thread.join(timeout=2.0)
        self._client.close()


def tap_jobs(ph: Phrase, delay_samples: int, tap_coupling: Optional[List[float]],
             taps: int, seed: int = 7) -> List[Job]:
    """The conversions one phrase needs.

    No per-tap knob: one conversion; the delay line repeats it (the v0.1
    behaviour). With `tap_coupling` = [k0, k1, ...]: one conversion per echo,
    each with its own k, so the repeats can drift further from the melody one
    after another. That costs one conversion per echo. For one phrase alone the
    budget per echo is unchanged (echo n is not due until n delays later), but
    under steady singing each phrase now costs echoes x RTF x its length of
    compute, and that has to fit before the next phrase arrives.
    """
    if not tap_coupling:
        return [Job(ph, 0, None, ph.end_sample + delay_samples)]
    return [Job(ph, i, {"k": float(k), "seed": seed + i},
                ph.end_sample + (i + 1) * delay_samples)
            for i, k in enumerate(tap_coupling)]


def run(
    source: AudioSource,
    sink: AudioSink,
    converter: PhraseConverter,
    *,
    delay_sec: float = 1.0,
    dry_gain: float = 0.7,
    wet_gain: float = 0.9,
    feedback: float = 0.0,
    taps: int = 1,
    tap_coupling: Optional[List[float]] = None,
    threshold_db: float = -45.0,
    realtime: bool = False,
    tail_sec: float = 2.0,
    wait_rtf: float = 3.0,
    verbose: bool = True,
) -> dict:
    """Drive one instrument session. Returns a stats dict.

    Timing is honest in both modes. Live, an echo is ready when it comes back.
    Offline, the loop runs faster than real time, so it replays the helper's
    own measured compute time on a simulated serial queue: an echo is ready at
    max(phrase end, previous echo ready) + its wall-clock compute. Either way
    an echo that would be ready after its due moment is skipped, not clipped
    (`late` in the stats), so an offline render sounds the way the same
    settings would play live.
    """
    sr = source.sample_rate
    bs = source.block_size
    delay_samples = round(delay_sec * sr)
    seg = PhraseSegmenter(sr, bs, threshold_db=threshold_db)
    engine = DelayEngine(sr)
    if tap_coupling:
        taps = len(tap_coupling)

    n_phrases = 0
    phrase_ends: List[int] = []
    phrase_lens: List[int] = []
    echoes: List[dict] = []
    block_period = bs / sr
    sim_free = 0  # offline: the sample at which the simulated helper is next free

    def schedule_ready() -> None:
        nonlocal sim_free
        for d in converter.drain_ready():
            job = d.job
            if realtime:
                ready = engine.cursor
            else:
                ready = max(sim_free, job.phrase.end_sample) + round(d.wall_clock_ms * sr / 1000)
                sim_free = ready
            if job.coupling is None:
                res = engine.schedule_phrase(
                    d.wet, job.start_sample, wet_gain=wet_gain, feedback=feedback,
                    taps=taps, delay_samples=delay_samples, not_before=ready)
            else:
                # Per-echo mode: feedback still sets how each repeat decays;
                # with no feedback every echo plays at full wet level.
                g = wet_gain * (feedback ** job.tap if feedback > 0 else 1.0)
                res = engine.schedule_phrase(d.wet, job.start_sample, wet_gain=g,
                                             not_before=ready)
            echoes.append({
                "phrase": phrase_ends.index(job.phrase.end_sample) + 1,
                "tap": job.tap + 1,
                "k": None if job.coupling is None else job.coupling["k"],
                "due_sec": round(job.start_sample / sr, 2),
                "ready_sec": round(ready / sr, 2),
                "late": res["skipped"] > 0 and res["scheduled"] == 0,
                "rtf": d.rtf,
                "asked_vs_source_st": (d.coupling or {}).get("asked_vs_source_st"),
            })

    def submit(ph: Phrase) -> None:
        nonlocal n_phrases
        n_phrases += 1
        phrase_ends.append(ph.end_sample)
        phrase_lens.append(len(ph.audio))
        for job in tap_jobs(ph, delay_samples, tap_coupling, taps):
            converter.submit(job)
        if verbose:
            print(f"  phrase {n_phrases}: {len(ph.audio)/sr:.2f}s "
                  f"@ end={ph.end_sample/sr:.2f}s rms={ph.rms_db:.1f}dBFS")

    sung_sec = 0.0
    for block in source.blocks():
        t0 = time.monotonic()
        for ph in seg.push(block):
            submit(ph)
        schedule_ready()
        if not realtime:
            # Offline: never render past an echo that is still being made.
            while True:
                due = converter.earliest_due()
                if due is None or due >= engine.cursor + bs:
                    break
                time.sleep(0.01)
                schedule_ready()
        wet_block = engine.render(bs)
        sink.write(block * dry_gain + wet_block)
        if realtime:
            elapsed = time.monotonic() - t0
            if elapsed < block_period:
                time.sleep(block_period - elapsed)

    # Input ended: flush the open phrase, wait for the tail of conversions,
    # then drain the delay line so trailing echoes are not truncated.
    for ph in seg.finish():
        submit(ph)
    # With the real model a phrase costs ~2 s of compute per second of audio
    # through the helper (2026-10-14, M1 Max), one job at a time, so wait in
    # proportion to what is still in flight, not a fixed 5 s.
    sung_sec = sum(phrase_lens) / sr * max(1, len(tap_coupling or [None]))
    deadline = time.monotonic() + max(5.0, wait_rtf * sung_sec + 30.0)
    while converter.outstanding > 0 and time.monotonic() < deadline:
        schedule_ready()
        time.sleep(0.01)
    schedule_ready()

    tail_blocks = round(tail_sec * sr / bs)
    drained = 0
    while (engine.pending() or drained < tail_blocks):
        sink.write(engine.render(bs))
        drained += 1
        if drained > tail_blocks and not engine.pending():
            break

    return {"phrases": n_phrases, "delay_samples": delay_samples,
            "out_cursor": engine.cursor, "phrase_ends": phrase_ends,
            "echoes": echoes, "late": sum(1 for e in echoes if e["late"])}


def _build_io(args) -> Tuple[AudioSource, AudioSink, int]:
    if args.input == "mic":
        source: AudioSource = LiveMicSource(args.sample_rate, args.block_size)
        sr = args.sample_rate
    else:
        source = WavFileSource(Path(args.input), args.block_size)
        sr = source.sample_rate
    if args.output == "speaker":
        sink: AudioSink = LiveSpeakerSink(sr, args.block_size)
    else:
        sink = WavFileSink(Path(args.output), sr)
    return source, sink, sr


def main(argv: Optional[List[str]] = None) -> int:
    p = argparse.ArgumentParser(description="Semantic Delay standalone instrument (Stage 2)")
    p.add_argument("--input", default="mic", help="'mic' or a WAV path")
    p.add_argument("--output", default="speaker", help="'speaker' or a WAV path")
    p.add_argument("--sock", type=Path,
                   default=Path(f"/tmp/semantic-delay-{__import__('os').getuid()}/daemon.sock"))
    p.add_argument("--prompt", default="spirit.huehuecoyotl.v1",
                   help="registered prompt_id to convert through")
    p.add_argument("--prompt-wav", type=Path, default=None,
                   help="optional WAV to register under --prompt before running")
    p.add_argument("--delay", type=float, default=1.0, help="delay time in seconds")
    p.add_argument("--feedback", type=float, default=0.0, help="0..1 echo regeneration")
    p.add_argument("--taps", type=int, default=1, help="number of feedback taps")
    p.add_argument("--tap-coupling", default=None,
                   help="melody knob per echo, e.g. '1,0.5,0': echo 1 sings your melody, "
                        "echo 2 half follows, echo 3 wanders (RPC v0.2; one conversion per echo)")
    p.add_argument("--dry", type=float, default=0.7)
    p.add_argument("--wet", type=float, default=0.9)
    p.add_argument("--threshold-db", type=float, default=-45.0)
    p.add_argument("--block-size", type=int, default=512)
    p.add_argument("--sample-rate", type=int, default=48000, help="live mic rate")
    args = p.parse_args(argv)

    source, sink, sr = _build_io(args)
    converter = PhraseConverter(args.sock, args.prompt, sr)
    info = converter.hello()
    print(f"daemon: {info.get('build')} model.loaded={info['model']['loaded']}")

    if args.prompt_wav is not None:
        pcm, p_sr = read_wav_mono(args.prompt_wav)
        converter._client.prompts_register(args.prompt, args.prompt, f32_to_bytes(pcm), p_sr)
        print(f"registered prompt {args.prompt} from {args.prompt_wav}")

    realtime = (args.input == "mic" or args.output == "speaker")
    try:
        stats = run(source, sink, converter,
                    delay_sec=args.delay, dry_gain=args.dry, wet_gain=args.wet,
                    feedback=args.feedback, taps=args.taps,
                    tap_coupling=([float(x) for x in args.tap_coupling.split(",")]
                                  if args.tap_coupling else None),
                    threshold_db=args.threshold_db, realtime=realtime)
    finally:
        converter.close()
        sink.close()
    print(f"done: {stats}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
