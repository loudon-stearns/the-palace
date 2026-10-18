"""
Semantic Delay — SoulX-Singer-SVC backend for the daemon (Stage 1.5)
====================================================================

The real model behind the helper. The daemon imports this module only when it
is started with `--backend soulx`; the stub backend stays stdlib-only so the
RPC conformance tests run anywhere.

Everything here runs on the daemon's single inference thread (RPC §7), except
`extract_f0`, which the prompt registry calls from a thread-pool worker. RMVPE
runs on the CPU, so it never touches the MPS context the model owns.

The three Apple-Silicon patches from Stage 0 (April 2026):
  1. F0 arrays are cast `.float()` before `.to(device)` — MPS has no float64.
     Done here, in `convert`.
  2. The vocoder runs on the CPU — MPS has no complex arithmetic. This one
     lives in the SoulX working copy itself
     (`soulxsinger/models/soulxsinger_svc.py:330`, `self.vocoder.cpu()(...)`);
     `load()` checks it is still there and refuses to start on MPS without it.
  3. `PYTORCH_ENABLE_MPS_FALLBACK=1` — set below, before torch is imported.

Wire shape is untouched: `convert` returns exactly the dict the stub returned,
plus (RPC v0.2) an optional `coupling` report when the caller set the knob.

RPC v0.2 (2026-10-14): `options.coupling = {"k": 0..1, ...}` bends the phrase's
own pitch contour before the model sings it — k = 1 sings the melody, k = 0
lets the echo wander onto the scale the phrase sits on. The knob lives in
`../standalone/coupling.py`, shared with the proofs so the helper and the
instrument never disagree about what a setting means.
"""

from __future__ import annotations

import os

os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")  # patch 3

import sys
import threading
import time
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import numpy as np

MODEL_SR = 24000
HOP = 480  # the model's 20 ms frame grid at 24 kHz

DEFAULT_SOULX = Path.home() / "Documents" / "soulx" / "SoulX-Singer"

_STANDALONE = Path(__file__).resolve().parent.parent / "standalone"


def apply_coupling(tgt_f0: np.ndarray, spec: Any) -> Tuple[np.ndarray, Optional[Dict[str, Any]]]:
    """RPC v0.2 `options.coupling` -> (the contour the model is asked to sing, report).

    `spec` is None (no knob: sing the phrase's own pitch, the v0.1 behaviour)
    or a dict with `k` in [0, 1] and optional `seed`, `scale`,
    `drift_semitones`, `vibrato_semitones`. Raises ValueError on a bad spec.
    """
    if spec is None:
        return tgt_f0, None
    if not isinstance(spec, dict) or "k" not in spec:
        raise ValueError("options.coupling must be an object with a numeric k")
    k = float(spec["k"])
    if not (0.0 <= k <= 1.0):
        raise ValueError(f"options.coupling.k must be in [0, 1], got {k}")
    if str(_STANDALONE) not in sys.path:
        sys.path.insert(0, str(_STANDALONE))
    from coupling import couple_phrase
    scale = spec.get("scale")
    if scale is not None:
        scale = tuple(int(x) % 12 for x in scale)
        if not scale:
            raise ValueError("options.coupling.scale must not be empty")
    tap, report = couple_phrase(
        tgt_f0, k, hop_sec=HOP / MODEL_SR,
        seed=int(spec.get("seed", 7)), scale=scale,
        drift_semitones=float(spec.get("drift_semitones", 3.0)),
        vibrato_semitones=float(spec.get("vibrato_semitones", 0.4)))
    return np.asarray(tap, np.float32), report


def resample(audio: np.ndarray, sr_in: int, sr_out: int) -> np.ndarray:
    """All resampling lives in the helper (standing order)."""
    audio = np.asarray(audio, dtype=np.float32)
    if sr_in == sr_out or audio.size == 0:
        return audio
    import librosa
    return librosa.resample(audio, orig_sr=sr_in, target_sr=sr_out).astype(np.float32)


class SoulXBackend:
    """Holds SoulX-Singer-SVC and RMVPE. One instance per daemon."""

    name = "soulx"

    def __init__(self, soulx_root: Path = DEFAULT_SOULX, device: Optional[str] = None,
                 n_steps_default: int = 32, cfg_default: float = 3.0):
        self.root = Path(soulx_root).expanduser().resolve()
        self.requested_device = device
        self.device = "unloaded"
        self.model = None
        self.extractor = None
        self.n_steps_default = n_steps_default
        self.cfg_default = cfg_default
        self.load_seconds: Optional[float] = None
        self.warmup_seconds: Optional[float] = None
        self._f0_lock = threading.Lock()  # RMVPE is not re-entrant

    # -- load ---------------------------------------------------------------

    def _import_root(self) -> None:
        if not self.root.is_dir():
            raise FileNotFoundError(f"SoulX-Singer working copy not found at {self.root}")
        if str(self.root) not in sys.path:
            sys.path.insert(0, str(self.root))

    def load_f0(self) -> None:
        """Load RMVPE only (cheap; the registry needs it before the model is up)."""
        if self.extractor is not None:
            return
        self._import_root()
        cwd = os.getcwd()
        os.chdir(self.root)  # soulx resolves a few paths relative to its root
        try:
            from preprocess.tools.f0_extraction import F0Extractor
            self.extractor = F0Extractor(
                str(self.root / "pretrained_models/SoulX-Singer-Preprocess/rmvpe/rmvpe.pt"),
                device="cpu", verbose=False,
            )
        finally:
            os.chdir(cwd)

    def load(self) -> None:
        """Load the model once. Call from the inference thread only."""
        import torch

        self._import_root()
        device = self.requested_device or ("mps" if torch.backends.mps.is_available()
                                           else "cuda" if torch.cuda.is_available() else "cpu")
        if device == "mps":
            svc_src = (self.root / "soulxsinger/models/soulxsinger_svc.py").read_text()
            if "self.vocoder.cpu()" not in svc_src:  # patch 2 guard
                raise RuntimeError(
                    "the vocoder-on-CPU patch is missing from the SoulX working copy "
                    "(soulxsinger/models/soulxsinger_svc.py, the istFFT call site); "
                    "MPS cannot run the vocoder's complex arithmetic")
        t0 = time.monotonic()
        self.load_f0()
        cwd = os.getcwd()
        os.chdir(self.root)
        try:
            from soulxsinger.utils.file_utils import load_config
            from cli.inference_svc import build_model
            config = load_config(str(self.root / "soulxsinger/config/soulxsinger.yaml"))
            self.model = build_model(
                str(self.root / "pretrained_models/SoulX-Singer/model-svc.pt"),
                config, device=device)
        finally:
            os.chdir(cwd)
        self.device = device
        self.load_seconds = time.monotonic() - t0
        self.warmup_seconds = self._warm_up()

    def _warm_up(self) -> float:
        """One throwaway conversion on a synthetic tone, before `hello` says ready.

        Measured 2026-10-14 through the helper: the first conversion after a
        load ran ~20% slower (RTF 2.41 against 1.98 for the next two), which
        made the first echo of a session miss an 11 s delay that every later
        echo met. Paying that cost at startup keeps it off the first phrase.
        No RMVPE needed: the tone's pitch is known.
        """
        import torch
        t0 = time.monotonic()
        n = MODEL_SR  # 1 s
        t = np.arange(n, dtype=np.float32) / MODEL_SR
        tone = (0.2 * np.sin(2 * np.pi * 220.0 * t)).astype(np.float32)
        f0 = np.full(int(np.ceil(n / HOP)), 220.0, np.float32)
        dev = self.device
        wav = torch.from_numpy(tone).unsqueeze(0).to(dev)
        f0t = torch.from_numpy(f0).float().unsqueeze(0).to(dev)
        with torch.no_grad():
            self.model.infer(pt_wav=wav, gt_wav=wav, pt_f0=f0t, gt_f0=f0t,
                             auto_shift=False, pitch_shift=0,
                             n_steps=self.n_steps_default, cfg=self.cfg_default)
        return round(time.monotonic() - t0, 2)

    # -- pitch --------------------------------------------------------------

    def extract_f0(self, audio_24k: np.ndarray) -> np.ndarray:
        """RMVPE on 24 kHz audio -> Hz per 20 ms frame, 0.0 unvoiced."""
        self.load_f0()
        import librosa
        a = np.asarray(audio_24k, dtype=np.float32)
        n_frames = int(np.ceil(len(a) / HOP))
        a16 = librosa.resample(a, orig_sr=MODEL_SR, target_sr=16000)
        with self._f0_lock:
            f16 = self.extractor.model.infer_from_audio(a16, thred=self.extractor.thred)
            f0 = self.extractor.interpolate_f0(
                f16, original_length=a16.shape[-1], original_sr=16000,
                target_sr=MODEL_SR, hop_size=HOP, max_duration=300)
        f0 = np.asarray(f0, dtype=np.float32)[:n_frames]
        if len(f0) < n_frames:
            f0 = np.pad(f0, (0, n_frames - len(f0)))
        return f0

    def prepare_prompt(self, pcm: np.ndarray, sample_rate: int) -> Tuple[np.ndarray, np.ndarray]:
        """Reference-singer audio at any rate -> (24 kHz audio, its F0)."""
        a = resample(pcm, sample_rate, MODEL_SR)
        return a, self.extract_f0(a)

    # -- convert ------------------------------------------------------------

    def convert(self, audio_in: np.ndarray, input_sr: int, output_sr: int,
                prompt_pcm_24k: np.ndarray, prompt_f0: np.ndarray,
                options: Dict[str, Any]) -> Dict[str, Any]:
        """The six steps the stub's docstring promised. Returns the stub's dict shape."""
        import torch

        if self.model is None:
            raise RuntimeError("model not loaded")
        t0 = time.monotonic()
        src = resample(audio_in, input_sr, MODEL_SR)                      # 1
        tgt_f0 = self.extract_f0(src)                                     # 2
        if not np.any(tgt_f0 > 0):
            # Nothing sung (breath, click, spoken unvoiced consonant run):
            # the model has no pitch to follow. Return silence of equal length
            # rather than an error, so the delay line keeps its timing.
            out = np.zeros(int(round(len(audio_in) * output_sr / input_sr)), np.float32)
            wall = time.monotonic() - t0
            return self._result(out, output_sr, 0, wall, len(audio_in) / input_sr,
                                note="unvoiced phrase; returned silence")

        tgt_f0, coupling_report = apply_coupling(tgt_f0, options.get("coupling"))  # v0.2

        dev = self.device
        pt_wav = torch.from_numpy(np.ascontiguousarray(prompt_pcm_24k, np.float32)).unsqueeze(0).to(dev)
        gt_wav = torch.from_numpy(np.ascontiguousarray(src, np.float32)).unsqueeze(0).to(dev)
        pt_f0 = torch.from_numpy(np.asarray(prompt_f0)).float().unsqueeze(0).to(dev)   # patch 1
        gt_f0 = torch.from_numpy(tgt_f0).float().unsqueeze(0).to(dev)                  # patch 1

        n_steps = int(options.get("n_steps") or self.n_steps_default)
        cfg = float(options.get("cfg") if options.get("cfg") is not None else self.cfg_default)
        auto_shift = bool(options.get("auto_shift", True))
        pitch_shift = int(options.get("pitch_shift") or 0)

        with torch.no_grad():                                             # 3 + 4
            gen, applied = self.model.infer(
                pt_wav=pt_wav, gt_wav=gt_wav, pt_f0=pt_f0, gt_f0=gt_f0,
                auto_shift=auto_shift, pitch_shift=pitch_shift,
                n_steps=n_steps, cfg=cfg)
        y = gen.squeeze().float().cpu().numpy()
        out = resample(y, MODEL_SR, output_sr)                            # 5
        wall = time.monotonic() - t0
        r = self._result(out, output_sr, int(applied), wall, len(audio_in) / input_sr)  # 6
        if coupling_report is not None:
            r["coupling"] = coupling_report
        return r

    @staticmethod
    def _result(out: np.ndarray, sr: int, shift: int, wall: float, in_sec: float,
                note: Optional[str] = None) -> Dict[str, Any]:
        r = {
            "audio_out": np.asarray(out, dtype="<f4").tobytes(),
            "output_sample_rate": sr,
            "applied_pitch_shift": shift,
            "wall_clock_ms": int(wall * 1000),
            "rtf": round(wall / max(in_sec, 1e-6), 3),
        }
        if note:
            r["note"] = note
        return r
