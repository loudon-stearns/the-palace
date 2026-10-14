"""
Semantic Delay — Stage 4 on the real model (Mac-side proof)
===========================================================

The first time an echo actually changes voice, and the first time the coupling
knob is heard on the real model instead of a buzzy stand-in.

What it does, in order:
  1. Cut one sung phrase from the SoulX example vocal (music.mp3, 0.6–7.0 s).
  2. RMVPE the phrase -> its F0 contour on the model's 20 ms grid (hop 480 @ 24 kHz).
  3. For K in (1.0, 0.5, 0.0): run `coupling.couple()` on that contour, so each
     echo gets its own target F0 — locked to the melody, half-coupled, or free
     (drifting onto the pentatonic grid that best fits the phrase).
  4. Hand each coupled contour to SoulX-Singer-SVC as `gt_f0`, with a reference
     singer as the prompt. The model keeps the phrase's words and timing and
     sings them on the coupled contour, in the reference singer's voice.
  5. RMVPE each output again and measure how far it sits from the source melody
     (semitones) and from the contour it was asked to sing — the check that the
     model obeys the knob rather than ignoring it.
  6. Lay the dry phrase and the three echoes on one timeline (the delay demo),
     and plot the contours.

Run from anywhere, in the soulx env:
  ~/miniconda3/envs/soulx/bin/python stage4_real_svc_coupling.py

It does not touch the daemon (the RPC contract is untouched). It loads the
model directly, the way the Stage 1.5 handoff says the daemon will.
"""

from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path

os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")

import numpy as np

HERE = Path(__file__).resolve().parent
SOULX = Path.home() / "Documents/soulx/SoulX-Singer"
OUT = HERE / "demo" / "stage4-real"
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(SOULX))

import librosa  # noqa: E402
import soundfile as sf  # noqa: E402
import torch  # noqa: E402

from coupling import Spirit, couple, coupling_error_semitones  # noqa: E402
from f0 import f0_to_midi  # noqa: E402

SR = 24000
HOP = 480                 # 20 ms — the model's frame grid
HOP_SEC = HOP / SR
PHRASE = (0.6, 7.0)       # seconds into music.mp3
DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"
PENTA = (0, 3, 5, 7, 10)


def best_pentatonic_root(f0_hz: np.ndarray) -> int:
    """Pick the minor-pentatonic root (pitch class) the phrase sits on best."""
    m = f0_to_midi(f0_hz)
    m = m[np.isfinite(m)]
    best, best_err = 0, 1e9
    for root in range(12):
        pc = (m - root) % 12.0
        cands = np.array(PENTA + (12,), dtype=float)
        err = np.mean(np.min(np.abs(pc[:, None] - cands[None, :]), axis=1))
        if err < best_err:
            best, best_err = root, err
    return best


def rmvpe(extractor, audio: np.ndarray, sr: int) -> np.ndarray:
    a16 = librosa.resample(audio.astype(np.float32), orig_sr=sr, target_sr=16000)
    f16 = extractor.model.infer_from_audio(a16, thred=extractor.thred)
    return extractor.interpolate_f0(
        f16, original_length=a16.shape[-1], original_sr=16000,
        target_sr=SR, hop_size=HOP, max_duration=300,
    ).astype(np.float32)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    os.chdir(SOULX)  # the soulx code resolves some paths relative to its root

    from preprocess.tools.f0_extraction import F0Extractor
    from soulxsinger.utils.file_utils import load_config
    from cli.inference_svc import build_model

    # --- source phrase -------------------------------------------------------
    full, _ = librosa.load(str(SOULX / "example/audio/music.mp3"), sr=SR)
    src = full[int(PHRASE[0] * SR): int(PHRASE[1] * SR)].astype(np.float32)
    n_frames = int(np.ceil(len(src) / HOP))

    extractor = F0Extractor(
        str(SOULX / "pretrained_models/SoulX-Singer-Preprocess/rmvpe/rmvpe.pt"),
        device="cpu", verbose=False,
    )
    src_f0 = rmvpe(extractor, src, SR)[:n_frames]
    src_mid = f0_to_midi(src_f0)
    center = float(np.nanmedian(src_mid))
    root_pc = best_pentatonic_root(src_f0)
    root_midi = int(12 * np.floor((center - root_pc) / 12) + root_pc)

    # --- reference singer (the spirit's voice) -------------------------------
    prompt, _ = librosa.load(str(SOULX / "example/audio/zh_prompt.mp3"), sr=SR)
    prompt = prompt.astype(np.float32)
    prompt_f0 = np.load(SOULX / "example/audio/zh_prompt_f0.npy").astype(np.float32)

    # --- model ---------------------------------------------------------------
    config = load_config(str(SOULX / "soulxsinger/config/soulxsinger.yaml"))
    t0 = time.time()
    model = build_model(str(SOULX / "pretrained_models/SoulX-Singer/model-svc.pt"),
                        config, device=DEVICE)
    load_s = time.time() - t0

    spirit = Spirit(name="huehuecoyotl", center_midi=center, drift_semitones=3.0,
                    vibrato_semitones=0.4, seed=7, scale=PENTA, scale_root_midi=root_midi)

    pt_wav = torch.from_numpy(prompt).unsqueeze(0).to(DEVICE)
    gt_wav = torch.from_numpy(src).unsqueeze(0).to(DEVICE)
    pt_f0_t = torch.from_numpy(prompt_f0).float().unsqueeze(0).to(DEVICE)

    rows, echoes, contours = [], {}, {"source": src_f0.tolist()}
    for K in (1.0, 0.5, 0.0):
        tgt = couple(src_f0, spirit, K, hop_sec=HOP_SEC)
        gt_f0_t = torch.from_numpy(tgt).float().unsqueeze(0).to(DEVICE)
        t1 = time.time()
        with torch.no_grad():
            gen, shift = model.infer(pt_wav=pt_wav, gt_wav=gt_wav, pt_f0=pt_f0_t,
                                     gt_f0=gt_f0_t, auto_shift=True, pitch_shift=0,
                                     n_steps=32, cfg=3.0)
        wall = time.time() - t1
        y = gen.squeeze().float().cpu().numpy()
        sung = rmvpe(extractor, y, SR)
        m = min(len(sung), len(tgt))
        # The model applies its auto pitch shift on top of the requested contour,
        # so compare the sung line against the request shifted by the same amount.
        tgt_shifted = (tgt * (2.0 ** (shift / 12.0))).astype(np.float32)
        src_shifted = (src_f0 * (2.0 ** (shift / 12.0))).astype(np.float32)
        rows.append({
            "K": K,
            "asked_vs_source_st": round(coupling_error_semitones(src_f0, tgt), 2),
            "sung_vs_asked_st": round(coupling_error_semitones(tgt_shifted[:m], sung[:m]), 2),
            "sung_vs_source_st": round(coupling_error_semitones(src_shifted[:m], sung[:m]), 2),
            "auto_shift_st": int(shift),
            "seconds": round(wall, 1),
            "rtf": round(wall / (len(src) / SR), 2),
        })
        echoes[K] = y
        contours[f"K={K}"] = tgt.tolist()
        contours[f"K={K} sung"] = sung.tolist()
        sf.write(OUT / f"echo-K{K:.1f}.wav", y, SR)
        print(rows[-1], flush=True)

    # --- the delay timeline: dry, then three echoes, each a phrase later -----
    gap = int(0.6 * SR)
    peak = max(np.max(np.abs(src)), *(np.max(np.abs(e)) for e in echoes.values()))
    parts = [src / peak * 0.8]
    for K in (1.0, 0.5, 0.0):
        parts += [np.zeros(gap, np.float32), echoes[K] / peak * 0.8]
    sf.write(OUT / "stage4-real-coupling-delay.wav", np.concatenate(parts).astype(np.float32), SR)

    # --- contour plot --------------------------------------------------------
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig, axes = plt.subplots(3, 1, figsize=(11, 7.5), sharex=True, facecolor="#f6f1e7")
    t = np.arange(n_frames) * HOP_SEC
    for ax, r in zip(axes, rows):
        K = r["K"]
        ax.set_facecolor("#f6f1e7")
        ax.plot(t, f0_to_midi(src_f0) + r["auto_shift_st"], color="#9a9184", lw=1.4,
                label="source melody (shifted to the singer's range)")
        tg = np.array(contours[f"K={K}"]); ax.plot(t[:len(tg)], f0_to_midi(tg) + r["auto_shift_st"],
                                                   color="#1f4e79", lw=1.8, label="asked to sing")
        sg = np.array(contours[f"K={K} sung"]); ts = np.arange(len(sg)) * HOP_SEC
        ax.plot(ts, f0_to_midi(sg), color="#c0392b", lw=1.0, alpha=0.85, label="what the model sang")
        ax.set_ylabel("MIDI pitch")
        ax.set_title(f"coupling K = {K}  ·  sung {r['sung_vs_source_st']} st from the source melody",
                     loc="left", fontsize=10)
        for s in ("top", "right"):
            ax.spines[s].set_visible(False)
    axes[0].legend(loc="upper right", fontsize=8, frameon=False)
    axes[-1].set_xlabel("seconds")
    fig.suptitle("Semantic Delay — one knob between following the melody and wandering",
                 x=0.01, ha="left", fontsize=12)
    fig.tight_layout()
    fig.savefig(OUT / "stage4-real-coupling-contours.png", dpi=130)

    report = {
        "phrase": {"file": "SoulX example music.mp3", "seconds": list(PHRASE)},
        "prompt": "SoulX example zh_prompt.mp3",
        "device": DEVICE, "torch": torch.__version__, "model_load_s": round(load_s, 1),
        "pentatonic_root_midi": root_midi, "source_center_midi": round(center, 2),
        "rows": rows,
    }
    (OUT / "stage4-real-report.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
