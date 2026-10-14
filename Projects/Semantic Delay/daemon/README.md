# Semantic Delay — Daemon (Stage 1)

The out-of-process Python inference daemon that hosts SoulX-Singer-SVC and
exposes it to the future VST3 plugin (and, sooner, the Stage 2 standalone
instrument).

This folder is **Stage 1 of the [Semantic Delay Phase 1
plan](../../Semantic%20Delay.md#phase-1-plan--svc--vst-2026-04-20)**.

## What's here

- `RPC-v0.1.md` — the wire protocol and call-surface spec. **The stable contract.**
  Plugin work, daemon work, and Stage 2 standalone work all conform to this
  document. Versioned from v0.1 so the inevitable v0.2 additions (streaming
  blobs, `pcm_s16le`, multi-encoding advertisement in `hello`) don't break
  callers.
- `semantic_delay_daemon.py` — the runnable daemon skeleton. Stdlib-only. Real
  socket, real framing, real dispatcher, real prompt registry. **Model
  inference is stubbed** — `convert` returns input unchanged with RTF=0 — so
  Stage 2 can integrate against a live socket before SoulX is wired in.
- `client.py` — the reference sync client. Stage 2 imports `DaemonClient`
  directly; the VST re-implements the same framing in C++.

## Stage 1.5 — the real model is in (2026-10-14)

`soulx_backend.py` holds SoulX-Singer-SVC and RMVPE. Start the helper with it,
in the soulx env on the Mac:

```bash
~/miniconda3/envs/soulx/bin/python semantic_delay_daemon.py --backend soulx
```

`hello` reports `loaded: false` for ~14 s while the model loads, then the real
device (`mps` on the M1 Max). `prompts.register` now resamples the singer to
24 kHz, runs RMVPE, and writes a real WAV + `.f0.npy` pair, which `scan_disk`
brings back on the next start. `convert` does the voice swap; all resampling
stays in the helper. The wire is unchanged: RPC v0.1 still holds, and the
default `--backend stub` keeps the pass-through so the conformance tests run
anywhere, stdlib only.

The three April patches: F0 cast to float32 before it goes to the GPU (in the
backend); vocoder on the CPU (in the SoulX working copy, checked at load);
`PYTORCH_ENABLE_MPS_FALLBACK=1` (set by the backend before torch loads).

Skeleton-era prompts (raw bytes, empty F0, e.g. the three `spirit.*.v1` files
in `~/.local/share/semantic-delay/prompts/`) are skipped with a warning under
the real backend; re-register those singers to bring them back.

Proof: `../standalone/stage15_real_daemon.py`. Latency levers:
`../standalone/stage15_latency_bench.py`.

## What was missing at Stage 1 (now done)

Each TODO in `semantic_delay_daemon.py` is tagged "Stage 1.5". The list:

1. **Model load.** Import `SoulXSingerSVC`, apply the MPS patches Stage 0
   discovered (`.float()` cast on F0, vocoder pinned to CPU,
   `PYTORCH_ENABLE_MPS_FALLBACK=1`), load `model-svc.pt`. Hold the model on
   the inference worker only.
2. **Real `convert`.** Resample input to 24 kHz, run RMVPE on the target,
   load prompt PCM + cached F0, call `model.infer(...)`, resample back to
   `output_sample_rate`.
3. **Real `prompts.register`.** Decode WAV (the v0.1 contract is raw float32
   bytes so this is just metadata + resampling), run RMVPE for F0, persist
   both the resampled PCM and the `.f0.npy` to the prompts directory.
4. **F0 metadata.** Fill `duration_sec` and `f0_cached` from real audio
   inspection rather than byte arithmetic.

## Run the skeleton (no model, no PyTorch)

```bash
python semantic_delay_daemon.py --log-level DEBUG
```

In another shell:

```python
from pathlib import Path
from client import DaemonClient

with DaemonClient(Path("/tmp/semantic-delay-$(id -u)/daemon.sock")) as c:
    print(c.hello())
    print(c.prompts_list())
```

The skeleton accepts connections immediately. `convert` returns input
unchanged until the Stage 1.5 model wiring lands.

## Non-goals for Stage 1

- **No plugin code.** JUCE/VST3 work starts at Stage 5.
- **No standalone instrument.** That's Stage 2, and it's the first caller of
  this daemon over the wire.
- **No DAW transport sync.** Stage 6.
- **No streaming.** v0.1 is one-shot phrases; long-phrase streaming is v0.2.
