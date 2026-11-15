"""Noise-fault probe, 2026-11-15: what narrows Stable Audio's noise and low fidelity?
Three sounds (a footstep on stone, a stone hall's room tone, a soft pad), one seed each, rendered with the defaults and
then with one change at a time: more steps, another sampler, more guidance, and a clean-up pass after. Then the ceiling:
a clean sound made by hand, sent through the model's own autoencoder (SAME-Small) and back, with no generation at all.
Every file is measured on what was saved (measure.py). A maker who can do better another way does so and leaves the comparison here.
Run from any checkout: <main>/_tools/stable-audio-3/.venv/bin/python render.py"""
import json, subprocess, sys, time
from pathlib import Path
import numpy as np, torch, torchaudio
from stable_audio_3 import StableAudioModel
sys.path.insert(0, str(Path(__file__).parent)); from measure import measure, SR
OUT = Path(__file__).parent
SOUNDS = {  # name: (model, prompt, seconds, seed)
  "step": ("small-sfx", "a single soft footstep on a stone floor, close, then silence", 4, 1703),
  "hall": ("small-sfx", "the quiet air inside a large empty stone hall at night, soft low room tone, steady", 10, 1703),
  "pad":  ("small-music", "a warm sustained synth pad, slow, soft", 10, 7),
}
VARIANTS = {  # name: generate() keyword arguments, one change from the default each
  "a-default":   {},
  "b-steps32":   {"steps": 32},
  "c-euler32":   {"steps": 32, "sampler_type": "euler"},
  "d-dpmpp32":   {"steps": 32, "sampler_type": "dpmpp"},
  "e-cfg3":      {"cfg_scale": 3.0},
}
def save(name, x):
    x = np.asarray(x, dtype=np.float32); x = x[None] if x.ndim == 1 else x
    wav = OUT / f"{name}.wav"; torchaudio.save(str(wav), torch.from_numpy(x), SR)
    y, _ = torchaudio.load(str(wav)); m = measure(y.numpy())                     # measured on the saved file
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "192000", str(wav), str(wav.with_suffix(".m4a"))], check=True)
    return wav, m
def cleanup(wav, name):
    out = OUT / f"{name}.wav"   # ffmpeg's FFT denoiser, tracking the noise floor, then nothing else
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-af", "afftdn=nr=18:nf=-60:tn=1", str(out)], check=True)
    y, _ = torchaudio.load(str(out)); m = measure(y.numpy())
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "192000", str(out), str(out.with_suffix(".m4a"))], check=True); return out, m
rec = {"made": "2026-11-15", "device": "mps (M1 Max, 32 GB)", "sounds": {}, "ceiling": {}}; models = {}; wavs = []
for s, (model, prompt, dur, seed) in SOUNDS.items():
    if model not in models:
        t = time.time(); models[model] = StableAudioModel.from_pretrained(model); rec[f"load_sec_{model}"] = round(time.time() - t, 1)
    rec["sounds"][s] = {"model": model, "prompt": prompt, "seconds": dur, "seed": seed, "variants": {}}
    for v, kw in VARIANTS.items():
        t = time.time(); a = models[model].generate(prompt=prompt, duration=dur, seed=seed, **kw); g = round(time.time() - t, 2)
        a = (a[0] if a.dim() == 3 else a).detach().cpu().float().numpy()[:, : int(dur * SR)]
        wav, m = save(f"{s}-{v}", a); wavs.append(wav)
        rec["sounds"][s]["variants"][v] = {"settings": kw or "steps 8, cfg 1.0, pingpong (the defaults)", "gen_sec": g, **m}; print(s, v, g, m, flush=True)
    wav, m = cleanup(OUT / f"{s}-a-default.wav", f"{s}-f-cleanup"); wavs.append(wav)
    rec["sounds"][s]["variants"]["f-cleanup"] = {"settings": "the default render, then ffmpeg afftdn=nr=18:nf=-60:tn=1", **m}; print(s, "cleanup", m, flush=True)
# the ceiling: the hand's clean SUBSTRATE sounds through SAME-Small and back, no diffusion
same = models["small-sfx"].model.pretransform
HAND = Path(__file__).parents[3] / "Maker/comparisons/2026-11-14-substrate-sounds"
for cue in ("step", "bed"):
    tmp = OUT / f"_in-{cue}.wav"; subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16@44100", str(HAND / f"substrate-sounds — hand — {cue}.m4a"), str(tmp)], check=True)
    x, sr = torchaudio.load(str(tmp)); tmp.unlink(); x = x.repeat(2, 1) if x.shape[0] == 1 else x
    pad = (-x.shape[1]) % 4096; xp = torch.nn.functional.pad(x, (0, pad))[None].to(models["small-sfx"].device)
    with torch.inference_mode(): y = same.decode(same.encode(xp)).float().cpu()[0, :, : x.shape[1]].numpy()
    w0, m0 = save(f"ceiling-{cue}-hand", x.numpy()); w1, m1 = save(f"ceiling-{cue}-through-same-small", y); wavs += [w0, w1]
    err = y - x.numpy(); snr = 10 * np.log10((x.numpy() ** 2).sum() / ((err ** 2).sum() + 1e-20))
    rec["ceiling"][cue] = {"hand": m0, "through_same_small": m1, "reconstruction_snr_db": round(float(snr), 1)}; print("ceiling", cue, round(float(snr), 1), m0, m1, flush=True)
for w in wavs: w.unlink(missing_ok=True)
(OUT / "report.json").write_text(json.dumps(rec, indent=2) + "\n")
