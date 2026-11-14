"""The Shop's side. Stable Audio Open makes each sound that would have been recorded, four seeds each; the hand chooses a take
by measurement, cuts it to the length the hook gives that cue, and sets it to the level the hook plays its own at.
  bed: four seeds, keep the flattest, then fold the tail over the head so sixteen seconds loop without a seam.
  a cue: four seeds, keep the take whose onset stands furthest above what came before it, cut from the onset."""
import json, sys, subprocess, time
from pathlib import Path
import numpy as np, torch, torchaudio
from stable_audio_3 import StableAudioModel
OUT = Path(__file__).parent; SR = 44_100; SEEDS = (1703, 1704, 1705, 1706)     # 1703 is the seed the hook's own bed uses
BED = "the quiet air inside a large empty stone hall at night, soft low room tone, steady"
CUES = {  # name: (prompt, the hook's length for this cue in seconds, the hook's peak level for it)
  "step":   ("a single soft footstep on a stone floor, close, then silence", 0.22),
  "glass":  ("a single soft knock on a large pane of glass, a low ring, then silence", 2.2),
  "ground": ("a single heavy low thud on packed earth, then silence", 2.0),
  "grains": ("a handful of dry sand grains scattering across a hard floor, brief, then silence", 1.0),
}
def db(x): return float(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9))
def env(x, w=0.005):
    n = int(w * SR); m = len(x) // n; return np.sqrt((x[:m * n].reshape(m, n) ** 2).mean(1)), n
def gen(m, prompt, dur, seed):
    t = time.time(); a = m.generate(prompt=prompt, duration=dur, seed=seed); a = a[0] if a.dim() == 3 else a
    return a.detach().cpu().float().numpy().mean(0), round(time.time() - t, 2)
def hand_peak(name):
    tmp = OUT / f"_peak-{name}.wav"      # torchaudio here cannot read m4a, so go back through afconvert
    subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16", str(OUT / f"substrate-sounds — hand — {name}.m4a"), str(tmp)], check=True)
    a, _ = torchaudio.load(str(tmp)); tmp.unlink(); return float(a.abs().max())
def save(name, x, rec):
    wav = OUT / f"shop-{name}.wav"; torchaudio.save(str(wav), torch.from_numpy(x.astype(np.float32))[None], SR)
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "128000", str(wav), str(OUT / f"substrate-sounds — shop — {name}.m4a")], check=True); wav.unlink()
    p = OUT / "takes.json"; all_ = json.loads(p.read_text()) if p.exists() else {}; all_[name] = rec; p.write_text(json.dumps(all_, indent=2, ensure_ascii=False) + "\n")
which = sys.argv[1]; m = StableAudioModel.from_pretrained("small-sfx"); takes = []; best = None
if which == "bed":
    for s in SEEDS:
        x, g = gen(m, BED, 20, s); q = [db(p) for p in np.array_split(x[: 20 * SR], 4)]; spread = round(max(q) - min(q), 1)
        takes.append({"seed": s, "quarter_spread_db": spread, "gen_sec": g})
        if best is None or spread < best[1]: best = (x, spread, s)
    x = best[0][: 20 * SR]; n = 16 * SR; f = 4 * SR; ramp = np.linspace(0, 1, f)
    loop = x[:n].copy(); loop[:f] = x[:f] * ramp + x[n:n + f] * (1 - ramp)          # the last four seconds fade out under the first four fading in
    loop *= hand_peak("bed") / (np.abs(loop).max() + 1e-9)
    seam = float(abs(loop[-1] - loop[0])); save("bed", loop, {"prompt": BED, "chosen_seed": best[2], "chosen_by": "flattest level across quarters", "takes": takes, "loop": "16 s, a 4 s crossfade folds the tail over the head", "step_at_the_seam": round(seam, 4)})
else:
    prompt, length = CUES[which]
    for s in SEEDS:
        x, g = gen(m, prompt, 4, s); e, n = env(x); p = int(e.argmax()); a = p
        while a > 0 and p - a < 10 and e[a - 1] > e[p] * 0.05: a -= 1
        before = e[max(0, a - 60):a]; iso = float(20 * np.log10(e[p] / (np.median(before) + 1e-6))) if len(before) else 0.0
        tail = x[a * n: a * n + int(length * SR)]; ring = db(tail[len(tail) // 2:]) - db(tail[: len(tail) // 2]) if len(tail) > 100 else 0.0
        takes.append({"seed": s, "onset_sec": round(a * n / SR, 2), "isolation_db": round(iso, 1), "second_half_vs_first_db": round(ring, 1), "gen_sec": g})
        if len(tail) >= int(length * SR) * 0.9 and (best is None or iso > best[1]): best = (tail.copy(), iso, s)
    c = best[0]; fi, fo = int(.002 * SR), min(len(c) // 4, int(.03 * SR)); c[:fi] *= np.linspace(0, 1, fi); c[-fo:] *= np.linspace(1, 0, fo)
    c *= hand_peak(which) / (np.abs(c).max() + 1e-9)
    save(which, c, {"prompt": prompt, "chosen_seed": best[2], "chosen_by": "the onset furthest above the 0.3 s before it, among takes long enough to fill the cue", "cut_sec": length, "takes": takes})
print(which, "chosen seed", best[2], takes)
