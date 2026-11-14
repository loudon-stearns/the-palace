"""
The third room — Loudon's split, 2026-11-14: "use stable to generate pieces that would be 'sampled'
and by hand for sounds that are clearly 'synthesized'".

Stable Audio Open makes each sampled thing on its own: one drop, a bird call, a far bell, a low string, a bed of rain.
The hand keeps the mains hum (plainly synthesized), cuts one event out of each take, and places, pans, gates and mixes
them at the hand's own times (make-sounds-3.py, listening()).

Run: _tools/stable-audio-3/.venv/bin/python third.py
"""
import hashlib, json, subprocess, time
from pathlib import Path
import numpy as np, torch, torchaudio
from stable_audio_3 import StableAudioModel
OUT = Path(__file__).parent; SR, TOTAL = 44_100, 26.0; N = int(TOTAL * SR)
SEEDS = (1932, 1933, 1934, 1935)
EVENTS = {  # name: (prompt, clip seconds, longest cut kept, level, pan)
  "a drip":            ("a single drop of water falling into a full sink, one drop, close microphone, then silence", 4, 0.7, 0.50, 0.50),
  "a bird":            ("one small songbird, a single short call, outdoors, then silence", 4, 0.9, 0.30, 0.85),
  "a far bell":        ("one single strike of a distant church bell, far away, ringing out slowly, nothing else", 8, 5.0, 0.36, 0.20),
  "a prepared string": ("one single low piano string plucked by hand inside the piano, muted and buzzing, ringing out, nothing else", 6, 3.0, 0.42, 0.70),
}
RAIN = "steady rain at a constant even intensity"   # the wording that came back flat within 0.5 dB on 2026-11-14 (ledger item 7); the first wording here varied 7 to 17 dB
TIMES = {"a drip": [round(x, 3) for x in np.arange(0.6, TOTAL - 1, 1.3)], "a bird": [2.2, 7.9, 13.4, 16.1, 20.3, 23.0],
         "a far bell": [4.5, 15.0, 22.0], "a prepared string": [9.0, 18.5]}

def env(x, w=0.005):
    n = int(w * SR); m = len(x) // n; return np.sqrt((x[:m * n].reshape(m, n) ** 2).mean(1)), n
def cut(x, longest):
    """The loudest event in a take: back to its onset, forward until it has died or `longest` seconds. Returns (clip, isolation dB)."""
    e, n = env(x); p = int(e.argmax()); a = p
    while a > 0 and p - a < 10 and e[a - 1] > e[p] * 0.05: a -= 1
    b = p
    while b < len(e) - 1 and (b - a) * n < longest * SR and e[b:b + 10].max() > e[p] * 0.01: b += 1
    before = e[max(0, a - 60):a]; iso = 20 * np.log10(e[p] / (np.median(before) + 1e-6)) if len(before) else 0.0
    c = x[max(0, a * n - 220):b * n].copy(); f = min(len(c) // 4, int(0.03 * SR)); c[:220] *= np.linspace(0, 1, 220) if len(c) > 220 else 1; c[-f:] *= np.linspace(1, 0, f)
    return c / (np.abs(c).max() + 1e-9), float(iso)
def gate(start, end, ramp):
    t = np.arange(N) / SR; up = np.clip((t - start) / ramp + 1, 0, 1) if start > 0 else np.ones(N)
    return np.minimum(up, np.clip((end - t) / ramp + 1, 0, 1))
def db(x): return round(float(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)), 1)
def gen(m, prompt, dur, seed):
    t = time.time(); a = m.generate(prompt=prompt, duration=dur, seed=seed); g = time.time() - t
    a = a[0] if a.dim() == 3 else a; return a.detach().cpu().float().numpy().mean(0), round(g, 2)

m = StableAudioModel.from_pretrained("small-sfx"); rec = {"events": {}, "rain": {}}; clips = {}
for name, (prompt, dur, longest, level, pan) in EVENTS.items():
    best = None; takes = []
    for s in SEEDS:
        x, g = gen(m, prompt, dur, s); c, iso = cut(x, longest)
        takes.append({"seed": s, "cut_sec": round(len(c) / SR, 2), "isolation_db": round(iso, 1), "gen_sec": g})
        if len(c) / SR < 0.3 * longest and longest >= 3: continue          # a ringing thing cut to a click is not the thing (first run: the bell came back 0.06 s)
        if best is None or iso > best[1]: best = (c, iso, s)
    clips[name] = best[0]; rec["events"][name] = {"prompt": prompt, "chosen_seed": best[2], "chosen_by": "the cut whose onset stands furthest above the 0.3 s before it", "takes": takes}
    print(name, rec["events"][name]["chosen_seed"], takes, flush=True)
best = None; takes = []
for s in SEEDS + (41,):
    x, g = gen(m, RAIN, int(TOTAL), s); x = x[:N] if len(x) >= N else np.pad(x, (0, N - len(x)))
    q = [db(p) for p in np.array_split(x, 4)]; spread = round(max(q) - min(q), 1); takes.append({"seed": s, "quarter_spread_db": spread, "gen_sec": g})
    if best is None or spread < best[1]: best = (x, spread, s)
rain = best[0] / (np.abs(best[0]).max() + 1e-9); rec["rain"] = {"prompt": RAIN, "chosen_seed": best[2], "chosen_by": "the flattest level across quarters", "takes": takes}
print("rain", best[2], takes, flush=True)

rng = np.random.default_rng(1932)   # her year, as the hand's
t = np.arange(N) / SR
parts = {k: np.zeros(N) for k in EVENTS}; placed = {}
for name, (_, _, _, level, _) in EVENTS.items():
    placed[name] = []
    for at in TIMES[name]:
        at2 = at + (0.08 * rng.standard_normal() if name == "a drip" else 0.0); lv = level * (1 + 0.12 * rng.standard_normal() if name == "a drip" else 1)
        i = int(at2 * SR); c = clips[name][: max(0, N - i)]; parts[name][i:i + len(c)] += c * lv; placed[name].append(round(at2, 3))
parts["rain"] = rain * 0.16 * (1 + 0.3 * np.sin(2 * np.pi * 0.11 * t))
parts["mains hum"] = sum(np.sin(2 * np.pi * 60 * h * t) / h ** 1.5 for h in (1, 2, 3, 5)) * 0.05     # by hand: plainly synthesized
pans = {**{k: v[4] for k, v in EVENTS.items()}, "rain": 0.5, "mains hum": 0.35}
focal, glob = gate(0, 11.5, 0.4), gate(13.0, TOTAL + 1, 0.6)
L = np.zeros(N); R = np.zeros(N); heard = {}
for k, x in parts.items():
    y = x * (focal * (1.0 if k == "a drip" else 0.02) + glob); heard[k] = y
    L += y * np.cos(pans[k] * np.pi / 2); R += y * np.sin(pans[k] * np.pi / 2)
R += np.roll(heard["rain"], 331) * 0.5 - heard["rain"] * np.sin(0.5 * np.pi / 2) * 0.5; L *= 1.0     # the rain a little wider than one point
mix = np.stack([L, R]); mix *= 10 ** (-1 / 20) / np.abs(mix).max()
wav = OUT / "third — one point, then the whole sphere.wav"; torchaudio.save(str(wav), torch.from_numpy(mix.astype(np.float32)), SR)
saved, _ = torchaudio.load(str(wav)); S = saved.numpy(); s = S.mean(0)          # measured on the saved file
e, n = env(s[: int(11 * SR)], 0.01); d = 20 * np.log10(e + 1e-9); thr = d.max() - 18
on = [i * n / SR for i in range(1, len(d)) if d[i] > thr and d[i - 1] <= thr]; on = [o for j, o in enumerate(on) if j == 0 or o - on[j - 1] > 0.4]
gaps = np.diff(on)
subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "160000", str(wav), str(wav.with_suffix(".m4a"))], check=True); wav.unlink()

# the picture, from the same arrays
PAPER, INK, INK3, RULE, RED = "#f0eee5", "#1a1916", "#6a6862", "#b8b09a", "#c8261a"
FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace\""
W, H, x0, x1 = 960, 372, 170, 880; X = lambda sec: x0 + sec / TOTAL * (x1 - x0)
rows = ["a far bell", "a bird", "a prepared string", "rain", "mains hum", "a drip"]; made = {"mains hum": "by hand"}
o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="{PAPER}"/>',
     f'<text x="40" y="44" {FONT} font-size="16" font-weight="700" fill="{INK}" letter-spacing="2">ONE POINT, THEN THE WHOLE SPHERE</text>',
     f'<text x="{X(5.7):.0f}" y="80" {FONT} font-size="12" font-weight="700" fill="{RED}" text-anchor="middle" letter-spacing="2">FOCAL</text>',
     f'<text x="{X(19.5):.0f}" y="80" {FONT} font-size="12" font-weight="700" fill="{INK}" text-anchor="middle" letter-spacing="2">GLOBAL</text>',
     f'<line x1="{X(12.2):.1f}" y1="70" x2="{X(12.2):.1f}" y2="290" stroke="{RULE}" stroke-dasharray="3 4"/>']
for r, k in enumerate(rows):
    y = 110 + r * 32; col = RED if k == "a drip" else INK; ee, nn = env(heard[k], 0.05); ee = ee / (max(np.abs(parts[k]).max(), 1e-9) * 0.7)
    o.append(f'<text x="{x0 - 12}" y="{y + 4}" {FONT} font-size="12" fill="{col}" text-anchor="end">{k}</text><line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="{RULE}" stroke-width="0.5"/>')
    pts = [f"{X(i * nn / SR):.1f},{y - min(12, v * 12):.1f}" for i, v in enumerate(ee)] + [f"{X(i * nn / SR):.1f},{y + min(12, v * 12):.1f}" for i, v in reversed(list(enumerate(ee)))]
    o.append(f'<polygon points="{" ".join(pts)}" fill="{col}" opacity="0.85"/>')
for sec in range(0, 27, 4): o.append(f'<text x="{X(sec):.0f}" y="312" {FONT} font-size="11" fill="{INK3}" text-anchor="middle">{sec}s</text>')
o.append(f'<text x="40" y="340" {FONT} font-size="12" fill="{INK}">The same room both times. Attention closes on the drip; then it opens and nothing is left out.</text>')
o.append(f'<text x="40" y="358" {FONT} font-size="11" fill="{INK3}">Drip, bird, bell, string and rain generated one at a time by Stable Audio Open; the hum, the cutting and the placing by hand.</text></svg>')
(OUT / "third — one point, then the whole sphere — picture.svg").write_text("".join(o))

rec.update({"made": "2026-11-14", "chain": ["Stable Audio Open (stable-audio-3 3.0, small-sfx): five sampled things, four seeds each", "one event cut from each chosen take, by hand (cut())", "mains hum synthesized by hand", "placed, panned, gated and mixed by hand at the hand piece's own times"],
  "placed_at_sec": placed, "pans": pans,
  "measured_on_saved_file": {"focal_half_rms_db": db(s[1 * SR:11 * SR]), "global_half_rms_db": db(s[14 * SR:24 * SR]), "peak_dbfs": round(float(20 * np.log10(np.abs(S).max())), 1),
     "lr_correlation": round(float(np.corrcoef(S[0], S[1])[0, 1]), 2), "drips_found_in_first_11s": len(on), "drip_gap_sec_mean": round(float(gaps.mean()), 2) if len(gaps) else None, "drip_gap_sec_sd": round(float(gaps.std()), 2) if len(gaps) else None},
  "sha256": {p.name: hashlib.sha256(p.read_bytes()).hexdigest()[:16] for p in sorted(OUT.glob("third*"))}, "heard_by": "nobody yet"})
(OUT / "third-report.json").write_text(json.dumps(rec, indent=2, ensure_ascii=False) + "\n")
print(json.dumps(rec["measured_on_saved_file"]), rec["sha256"])
