"""
Stable Audio Open, light round 2 — "A rate or a count asked for in words is not held either."

Two halves, one model (small-sfx):
  asked   — the page's own drip prompt (Shop/Maker/comparisons/2026-11-14-oliveros-room/report.json),
            seed 1935, the seed that page's selection picked as nearest one onset a second. Rendered 26 s,
            as on 2026-11-14, so the whole take can be counted against the page's "40 to 69"; its first 10 s is heard.
  placed  — one drop asked for alone (third.py's prompt), four seeds, cut by third.py's rule (the cut whose onset
            stands furthest above the 0.3 s before it), and placed by hand once a second for 10 s.
Joined with 1 s of silence. Each half normalised to -1 dBFS sample peak, then the whole lowered until the m4a is under -1 dBTP. Mono, as small-sfx gives.
The picture is drawn from the same arrays the sound was made from; onsets are counted on the saved file
by the page's own detector (takes.py stats(): 20 ms windows, crossings at median + 12 dB) and a second way.

Run from this folder: "../../../../_tools/stable-audio-3/.venv/bin/python" make.py
"""
import hashlib, json, subprocess, time
from pathlib import Path
import numpy as np, torch, torchaudio
from stable_audio_3 import StableAudioModel

OUT = Path(__file__).parent; SR = 44_100; LANE = 10.0; GAP = 1.0
ASKED = "slow water drip, one single drop falling into water every second, silence between the drops, close and dry, no rain, no stream"
ASKED_SEED, ASKED_DUR = 1935, 26
ONE = "a single drop of water falling into a full sink, one drop, close microphone, then silence"
ONE_SEEDS, ONE_DUR, LONGEST = (1932, 1933, 1934, 1935), 4, 0.7
TIMES = [0.5 + k for k in range(10)]           # once a second, exactly: the rate the prompt asked for


def gen(m, prompt, dur, seed):
    t = time.time(); a = m.generate(prompt=prompt, duration=dur, seed=seed); g = time.time() - t
    a = a[0] if a.dim() == 3 else a; a = a.detach().cpu().float().numpy()
    return a, round(g, 2)


def env(x, w=0.005):
    n = int(w * SR); m = len(x) // n; return np.sqrt((x[:m * n].reshape(m, n) ** 2).mean(1)), n


def cut(x, longest):   # third.py's cut(), unchanged
    e, n = env(x); p = int(e.argmax()); a = p
    while a > 0 and p - a < 10 and e[a - 1] > e[p] * 0.05: a -= 1
    b = p
    while b < len(e) - 1 and (b - a) * n < longest * SR and e[b:b + 10].max() > e[p] * 0.01: b += 1
    before = e[max(0, a - 60):a]; iso = 20 * np.log10(e[p] / (np.median(before) + 1e-6)) if len(before) else 0.0
    c = x[max(0, a * n - 220):b * n].copy(); f = min(len(c) // 4, int(0.03 * SR)); c[:220] *= np.linspace(0, 1, 220) if len(c) > 220 else 1; c[-f:] *= np.linspace(1, 0, f)
    return c / (np.abs(c).max() + 1e-9), float(iso)


def page_onsets(x, w=0.02):    # takes.py stats(): the detector behind the page's "40 to 69 onsets" (20 ms windows)
    n = int(w * SR); m = len(x) // n; e = np.sqrt((x[:m * n].reshape(m, n) ** 2).mean(1)); d = 20 * np.log10(e + 1e-9)
    thr = np.median(d) + 12
    return [i * n / SR for i in range(1, len(d)) if d[i] > thr and d[i - 1] <= thr]


def second_count(x):   # the second way: the same rule at 10 ms and 40 ms windows. A clean drop counts once at every
    return {f"{int(w * 1000)}ms": len(page_onsets(x, w)) for w in (0.01, 0.02, 0.04)}   # window; a smear does not


def true_peak(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(r[r.rfind("True peak"):].split("Peak:")[1].split("dBFS")[0])


def lufs(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    tail = r[r.rfind("Summary"):]
    return float(tail.split("I:")[1].split("LUFS")[0])


m = StableAudioModel.from_pretrained("small-sfx")
rec = {"made": time.strftime("%Y-%m-%d"), "model": "stable-audio-3 small-sfx, steps 8, cfg 1.0 (defaults)"}

# the asked half
a, g = gen(m, ASKED, ASKED_DUR, ASKED_SEED); whole = a.mean(0)
np.save(OUT / "take-asked-1935.npy", a.astype(np.float32))
rec["asked"] = {"prompt": ASKED, "seed": ASKED_SEED, "duration_sec": ASKED_DUR, "gen_sec": g,
                "lr_corr": round(float(np.corrcoef(a[0], a[1])[0, 1]), 3),
                "page_detector_onsets_whole_26s": len(page_onsets(whole)),
                "on_2026_11_14_same_seed": 40}
asked = whole[: int(LANE * SR)]; asked = asked / (np.abs(asked).max() + 1e-9) * 10 ** (-1 / 20)

# the placed half
best = None; takes = []
for s in ONE_SEEDS:
    x, g = gen(m, ONE, ONE_DUR, s); x = x.mean(0); np.save(OUT / f"take-one-drop-{s}.npy", x.astype(np.float32))
    c, iso = cut(x, LONGEST); takes.append({"seed": s, "cut_sec": round(len(c) / SR, 3), "isolation_db": round(iso, 1), "gen_sec": g})
    if best is None or iso > best[1]: best = (c, iso, s)
drop = best[0]; N = int(LANE * SR); placed = np.zeros(N)
for at in TIMES:
    i = int(at * SR); c = drop[: N - i]; placed[i:i + len(c)] += c
placed = placed / (np.abs(placed).max() + 1e-9) * 10 ** (-1 / 20)
rec["placed"] = {"prompt": ONE, "seeds": list(ONE_SEEDS), "takes": takes, "chosen_seed": best[2],
                 "chosen_by": "the cut whose onset stands furthest above the 0.3 s before it (third.py)",
                 "placed_at_sec": TIMES, "same_drop_every_time": True}

# join, save, measure on the saved file
mono = np.concatenate([asked, np.zeros(int(GAP * SR)), placed]).astype(np.float32)
wav = OUT / "one-drop-a-second.wav"; m4a = wav.with_suffix(".m4a")
TP_CEILING = -1.0   # the house number for a finished mix, -1 dBTP (Sound from Code, § the house numbers; Maker § House Standards)
first_tp = None
for _ in range(4):  # the challenger measured -0.1 dBTP at -1 dBFS sample peak: lower the whole file until the m4a sits under the ceiling
    torchaudio.save(str(wav), torch.from_numpy(np.stack([mono, mono])), SR)
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "160000", str(wav), str(m4a)], check=True)
    tp = true_peak(m4a); first_tp = tp if first_tp is None else first_tp
    if tp <= TP_CEILING - 0.2: break
    mono = (mono * 10 ** ((TP_CEILING - 0.5 - tp) / 20)).astype(np.float32)
wav.unlink()
dec = OUT / "_decoded.wav"; subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(m4a), str(dec)], check=True)   # measure what is placed: the m4a
S, sr = torchaudio.load(str(dec)); dec.unlink(); s = S.numpy().mean(0); assert sr == SR
A = s[: int(LANE * SR)]; P = s[int((LANE + GAP) * SR):]
pa, pp = page_onsets(A), page_onsets(P)
rec["measured_on_saved_file"] = {
    "length_sec": round(len(s) / SR, 3), "peak_dbfs": round(float(20 * np.log10(np.abs(S.numpy()).max())), 2),
    "integrated_lufs": lufs(m4a), "true_peak_dbtp": true_peak(m4a), "true_peak_before_lowering_dbtp": first_tp,
    "measured_on": "the m4a, decoded",
    "asked_first_10s": {"page_detector_onsets": len(pa), "by_window": second_count(A),
                        "gap_sec_min": round(float(np.diff(pa).min()), 3), "gap_sec_max": round(float(np.diff(pa).max()), 3)},
    "placed_10s": {"page_detector_onsets": len(pp), "by_window": second_count(P),
                   "gap_sec_mean": round(float(np.diff(pp).mean()), 3), "gap_sec_sd": round(float(np.diff(pp).std()), 3)},
    "page_detector_times_asked": [round(t, 2) for t in pa], "page_detector_times_placed": [round(t, 2) for t in pp]}

# the picture, from the same arrays (the saved file's halves, and the onsets found on them)
PAPER, INK, INK3, RULE, RED = "#f0eee5", "#1a1916", "#6a6862", "#b8b09a", "#c8261a"
FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace\""
W, H, x0, x1 = 1000, 460, 70, 950; X = lambda sec: x0 + sec / LANE * (x1 - x0)
o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="{PAPER}"/>',
     f'<text x="{x0}" y="48" {FONT} font-size="20" font-weight="700" fill="{INK}" letter-spacing="2">ONE DROP A SECOND</text>']
for sec in range(0, 11):
    o.append(f'<line x1="{X(sec):.1f}" y1="104" x2="{X(sec):.1f}" y2="390" stroke="{RULE}" stroke-width="{1.2 if sec in (0, 10) else 0.7}" stroke-dasharray="{"" if sec in (0, 10) else "3 4"}"/>')
    o.append(f'<text x="{X(sec):.0f}" y="412" {FONT} font-size="14" fill="{INK3}" text-anchor="middle">{sec}s</text>')
lanes = [("asked in words", A, pa, INK, 165, f"{len(pa)} onsets"), ("one drop, placed by hand", P, pp, RED, 320, f"{len(pp)} onsets, 1 s apart")]
for label, x, ons, col, y, count in lanes:
    e, n = env(x, 0.01); e = e / (e.max() + 1e-9)
    pts = [f"{X(i * n / SR):.1f},{y - v * 46:.1f}" for i, v in enumerate(e)] + [f"{X(i * n / SR):.1f},{y + v * 46:.1f}" for i, v in reversed(list(enumerate(e)))]
    o.append(f'<polygon points="{" ".join(pts)}" fill="{col}" opacity="0.8"/>')
    o += [f'<line x1="{X(t):.1f}" y1="{y + 52}" x2="{X(t):.1f}" y2="{y + 62}" stroke="{col}" stroke-width="2"/>' for t in ons]
    o.append(f'<rect x="{x0 - 2}" y="{y - 80}" width="{x1 - x0 + 4}" height="24" fill="{PAPER}"/>')
    o.append(f'<text x="{x0}" y="{y - 62}" {FONT} font-size="17" font-weight="700" fill="{col}">{label}</text>')
    o.append(f'<text x="{x1}" y="{y - 62}" {FONT} font-size="17" fill="{col}" text-anchor="end">{count}</text>')
o.append(f'<text x="{x0}" y="444" {FONT} font-size="13" fill="{INK3}">Both from Stable Audio Open, small-sfx. Ticks: onsets by the page\'s own detector, on the saved file.</text></svg>')
svg = OUT / "one-drop-a-second-picture.svg"; svg.write_text("".join(o))
html = OUT / "_picture.html"; html.write_text(f'<html><body style="margin:0">{svg.read_text()}</body></html>')
subprocess.run(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu", "--hide-scrollbars",
                f"--window-size={W},{H}", f"--screenshot={OUT / 'one-drop-a-second-picture.png'}", html.as_uri()], check=True, capture_output=True)
html.unlink()

rec["sha256"] = {p.name: hashlib.sha256(p.read_bytes()).hexdigest()[:16] for p in sorted(OUT.glob("one-drop-a-second*"))}
rec["heard_by"] = None
(OUT / "report.json").write_text(json.dumps(rec, indent=2, ensure_ascii=False) + "\n")
print(json.dumps(rec, indent=1))
