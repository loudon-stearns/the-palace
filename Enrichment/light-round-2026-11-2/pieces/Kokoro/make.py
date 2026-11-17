"""
Kokoro, light round 2 — "Put commas around a bare variable letter."

One sentence from the Kuramoto paragraph Kokoro first narrated (2026-05-26), read two ways:
  bare    — "The coupling constant K is phrasing density and rhythmic clarity."   (as the 2026-05-26 take had it)
  commas  — "The coupling constant, K, is phrasing density and rhythmic clarity." (as the page writes the fix)

1. Survey: each sentence in four voices x ten torch seeds (1..10). For every take, the quiet runs around K are
   found from Kokoro's own word timings: 10 ms RMS frames, in dB below the take's loudest frame, at three
   cutoffs (-35, -40, -45 dB). "Before K" is the longest quiet run that ends between the middle of "constant"
   and K's loudest frame; "after K" the longest that starts between K's loudest frame and the middle of "is".
   A gap counts at 50 ms or longer.
2. The piece: af_heart (the voice of the 2026-05-26 take). The rule, fixed before any render: the seed whose
   commas take has its before-K gap (at -40 dB) nearest the median of the ten; the bare take of the same seed.
   Joined: 0.5 s, bare, 1.2 s, commas, 0.6 s. Two-pass ffmpeg loudnorm on the joined file, once, so the two
   halves keep their level against each other. 24 kHz mono (narration, per the house numbers). m4a by afconvert.
3. Measured on the saved m4a, decoded: length, sample peak, true peak, integrated loudness, each half's loudness,
   and the gaps again at the three cutoffs, at the word times shifted to where each take was placed.
4. A second route: the 2026-05-26 takes themselves, read from git (a94481f0 without commas, 36d1ae66 with them).
5. The picture, drawn from the decoded m4a and the word timings.

Run from the palace root:
  ~/.venvs/kokoro/bin/python "Enrichment/light-round-2026-11-2/pieces/Kokoro/make.py"
"""
import hashlib, io, json, re, subprocess, time
from pathlib import Path
import numpy as np, soundfile as sf, torch

OUT = Path(__file__).parent
ROOT = OUT.parents[3]
SR = 24_000
TEXT = {"bare": "The coupling constant K is phrasing density and rhythmic clarity.",
        "commas": "The coupling constant, K, is phrasing density and rhythmic clarity."}
VOICES = ["af_heart", "af_bella", "am_michael", "am_adam"]
SEEDS = list(range(1, 11))
PIECE_VOICE = "af_heart"
CUTS = (-35, -40, -45)
MIN_GAP = 0.05
LEAD, MID, TAIL = 0.5, 1.2, 0.6
FR = 0.01


def frames_db(x):
    n = int(FR * SR); m = len(x) // n
    db = 20 * np.log10(np.sqrt((x[:m * n].astype(np.float64).reshape(m, n) ** 2).mean(1)) + 1e-9)
    return db - db.max()


def runs(q):
    out, st = [], None
    for i, v in enumerate(list(q) + [False]):
        if v and st is None: st = i
        if not v and st is not None: out.append((st * FR, i * FR)); st = None
    return out


def gaps(x, words, cut):
    """words: {'constant':(s,e),'K':(s,e),'is':(s,e)} in seconds on x's own clock."""
    db = frames_db(x)
    k0, k1 = words["K"]; kpk = (int(k0 / FR) + int(np.argmax(db[int(k0 / FR):int(k1 / FR) + 1]))) * FR
    cmid = sum(words["constant"]) / 2; imid = sum(words["is"]) / 2
    rr = runs(db < cut)
    before = [b - a for a, b in rr if cmid < b <= kpk + FR]
    after = [b - a for a, b in rr if kpk <= a < imid]
    return {"before_ms": round(1000 * max(before, default=0)), "after_ms": round(1000 * max(after, default=0)), "k_peak_s": round(kpk, 3)}


def render(pipe, text, voice, seed):
    torch.manual_seed(seed)
    parts, words, off = [], {}, 0.0
    for r in pipe(text, voice=voice, speed=1.0):
        a = r.audio.detach().cpu().numpy() if hasattr(r.audio, "detach") else np.asarray(r.audio)
        for t in (r.tokens or []):
            if t.text in ("constant", "K", "is") and t.start_ts is not None and t.text not in words:
                words[t.text] = (round(off + t.start_ts, 4), round(off + t.end_ts, 4))
        parts.append(a.astype(np.float32)); off += len(a) / SR
    return np.concatenate(parts), words, None


def ff_lufs_tp(path, start=None, end=None):
    af = "ebur128=peak=true"
    if start is not None: af = f"atrim={start}:{end},asetpts=PTS-STARTPTS," + af
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", af, "-f", "null", "-"], capture_output=True, text=True).stderr
    tail = r[r.rfind("Summary"):]
    return float(tail.split("I:")[1].split("LUFS")[0]), float(tail.split("Peak:")[1].split("dBFS")[0])


rec = {"made": time.strftime("%Y-%m-%d"), "text": TEXT, "voices": VOICES, "seeds": SEEDS, "speed": 1.0,
       "detector": {"frame_ms": 10, "relative_to": "the take's loudest 10 ms frame", "cutoffs_db": list(CUTS), "gap_counts_from_ms": 50,
                    "before_K": "longest quiet run ending between the middle of 'constant' and K's loudest frame",
                    "after_K": "longest quiet run starting between K's loudest frame and the middle of 'is'"}}
t = time.time()
from kokoro import KPipeline
import kokoro
pipe = KPipeline(lang_code="a"); rec["kokoro"] = kokoro.__version__; rec["torch"] = torch.__version__; rec["load_sec"] = round(time.time() - t, 1)

# 1. survey
survey, keep = [], {}
for v in VOICES:
    for s in SEEDS:
        for k, text in TEXT.items():
            x, w, _ = render(pipe, text, v, s)
            row = {"voice": v, "seed": s, "text": k, "sec": round(len(x) / SR, 3), "words": w,
                   "gaps": {str(c): gaps(x, w, c) for c in CUTS}}
            survey.append(row)
            if v == PIECE_VOICE: keep[(k, s)] = (x, w)
# determinism inside one process: the same seed twice
x1, _, _ = render(pipe, TEXT["bare"], PIECE_VOICE, 1)
rec["same_seed_twice_max_abs_diff"] = float(np.abs(x1 - keep[("bare", 1)][0]).max())
(OUT / "survey.json").write_text(json.dumps(survey, indent=1) + "\n")


def tally(rows, side, cut="-40"):
    vals = [r["gaps"][cut][side] for r in rows]
    return {"n": len(vals), "with_gap": sum(v >= MIN_GAP * 1000 for v in vals), "min_ms": min(vals), "median_ms": float(np.median(vals)), "max_ms": max(vals)}


summary = {}
for v in VOICES + ["all"]:
    for k in TEXT:
        rows = [r for r in survey if r["text"] == k and (v == "all" or r["voice"] == v)]
        summary[f"{v} / {k}"] = {c: {"before_K": tally(rows, "before_ms", str(c)), "after_K": tally(rows, "after_ms", str(c))} for c in CUTS}
rec["survey_summary"] = summary
rec["takes_differ_in_length_across_seeds"] = {f"{v} / {k}": sorted({r["sec"] for r in survey if r["voice"] == v and r["text"] == k}) for v in VOICES for k in TEXT}

# 2. choose the piece's takes by the rule written above
cm = [r for r in survey if r["voice"] == PIECE_VOICE and r["text"] == "commas"]
med = float(np.median([r["gaps"]["-40"]["before_ms"] for r in cm]))
pick = min(cm, key=lambda r: (abs(r["gaps"]["-40"]["before_ms"] - med), r["seed"]))["seed"]
rec["piece"] = {"voice": PIECE_VOICE, "seed": pick, "chosen_by": f"commas take whose before-K gap at -40 dB is nearest the median of ten ({med:.0f} ms), lowest seed on a tie; bare take of the same seed"}
xb, wb = keep[("bare", pick)]; xc, wc = keep[("commas", pick)]
z = lambda s: np.zeros(int(round(s * SR)), np.float32)
joined = np.concatenate([z(LEAD), xb, z(MID), xc, z(TAIL)])
bare_at, comma_at = LEAD, LEAD + len(xb) / SR + MID
raw = OUT / "_raw.wav"; sf.write(raw, joined, SR)
p1 = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(raw), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", p1).group(0))
af = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json")
norm = OUT / "_norm.wav"
p2 = subprocess.run(["ffmpeg", "-hide_banner", "-y", "-i", str(raw), "-af", af, "-ar", str(SR), "-ac", "1", str(norm)], capture_output=True, text=True).stderr
n2 = json.loads(re.findall(r"\{[^{}]*\"output_i\"[^{}]*\}", p2)[-1])
rec["loudnorm"] = {"raw_lufs": float(m["input_i"]), "raw_tp": float(m["input_tp"]), "mode": n2.get("normalization_type"), "target": "I=-16, TP=-1.5 (asked 0.5 dB under the house ceiling, for the AAC encode)"}
xn, _ = sf.read(norm); rec["gaps_after_loudnorm_before_encode"] = {
    "bare": gaps(xn[int(bare_at * SR):int((bare_at + len(xb) / SR) * SR)], wb, -40),
    "commas": gaps(xn[int(comma_at * SR):int((comma_at + len(xc) / SR) * SR)], wc, -40),
    "raw_takes": {"bare": gaps(xb, wb, -40), "commas": gaps(xc, wc, -40)}}
m4a = OUT / "two-commas.m4a"
subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "64000", str(norm), str(m4a)], check=True)
raw.unlink(); norm.unlink()

# 3. measure the saved m4a
dec = OUT / "_dec.wav"; subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(m4a), str(dec)], check=True)
y, ysr = sf.read(dec); dec.unlink()
if y.ndim > 1: y = y.mean(1)
assert ysr == SR, ysr
# afconvert's AAC adds priming at the start; find it by cross-correlating the bare take's onset
lag_n = 4096; seg = joined[: int((LEAD + 1.0) * SR)]
cc = [float(np.dot(y[l:l + len(seg)], seg)) for l in range(0, lag_n)]
lag = int(np.argmax(cc)) / SR
lb = (bare_at, bare_at + len(xb) / SR); lc = (comma_at, comma_at + len(xc) / SR)
I, TP = ff_lufs_tp(m4a); Ib, _ = ff_lufs_tp(m4a, lb[0] + lag, lb[1] + lag); Ic, _ = ff_lufs_tp(m4a, lc[0] + lag, lc[1] + lag)
shift = lambda w, at: {k: (a + at + lag, b + at + lag) for k, (a, b) in w.items()}


def gaps_on(y, w, cut):  # the same detector, but relative to the whole saved file's loudest frame within each half
    return gaps(y, w, cut)


half = lambda a, b: y[int((a + lag) * SR):int((b + lag) * SR)]
yb, yc = half(*lb), half(*lc)
wb0 = {k: (a, b) for k, (a, b) in wb.items()}; wc0 = {k: (a, b) for k, (a, b) in wc.items()}
rec["measured_on_saved_file"] = {
    "file": m4a.name, "measured_on": "the m4a, decoded by ffmpeg", "sample_rate_hz": ysr, "channels": 1,
    "length_sec": round(len(y) / SR, 3), "encoder_lag_sec": round(lag, 4),
    "sample_peak_dbfs": round(float(20 * np.log10(np.abs(y).max())), 2), "true_peak_dbtp": TP, "integrated_lufs": I,
    "bare_half_lufs": Ib, "commas_half_lufs": Ic,
    "bare_at_sec": [round(lb[0] + lag, 3), round(lb[1] + lag, 3)], "commas_at_sec": [round(lc[0] + lag, 3), round(lc[1] + lag, 3)],
    "gaps_bare": {str(c): gaps_on(yb, wb0, c) for c in CUTS}, "gaps_commas": {str(c): gaps_on(yc, wc0, c) for c in CUTS}}

# 4. the 2026-05-26 takes, from git. Word times for the final sentence: the bare take's own Whisper read
#    (Kuramoto Coupling/speech-rhythm-and-groove-narration-study.json, made from that take); the commas take has none,
#    so its quiet runs are listed for the whole last sentence and counted, not placed against K.
hist = {}
wj = json.loads(subprocess.run(["git", "show", "a94481f0:Kuramoto Coupling/speech-rhythm-and-groove-narration-study.json"], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
last = wj["segments"][-1]; ww = {x["word"].strip(): (x["start"], x["end"]) for x in last["words"]}
for commit, label in (("a94481f0", "bare (2026-05-26, before the review)"), ("36d1ae66", "commas (2026-05-26, after the review)")):
    b = subprocess.run(["git", "show", f"{commit}:Kuramoto Coupling/speech-rhythm-and-groove-narration-study.wav"], cwd=ROOT, capture_output=True, check=True).stdout
    h, hsr = sf.read(io.BytesIO(b)); h = h.mean(1) if h.ndim > 1 else h
    db = frames_db(h)
    rr = [(round(a, 2), round(bb, 2)) for a, bb in runs(db < -40) if bb - a >= MIN_GAP]
    # the last sentence begins after the last quiet run of 400 ms or more before the final 5 s
    starts = [bb for a, bb in rr if bb - a >= 0.4 and bb < len(h) / hsr - 3]
    s0 = starts[-1]
    hist[label] = {"commit": commit, "sec": round(len(h) / hsr, 2), "last_sentence_from_sec": s0,
                   "quiet_runs_50ms_in_first_2s_of_last_sentence": [r for r in rr if s0 < r[0] < s0 + 2.0]}
hist["bare (2026-05-26, before the review)"]["whisper_words"] = {k: ww[k] for k in ("constant", "k", "is", "phrasing") if k in ww}
rec["second_route_2026_05_26"] = hist

# 5. the picture, from the decoded m4a halves and the word timings
PAPER, INK, INK3, RULE, RED, FILL = "#f0eee5", "#1a1916", "#6a6862", "#b8b09a", "#c8261a", "#dcd9ca"
FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace\""
W, H, x0, x1 = 1000, 560, 60, 960
T0, T1 = 0.25, 2.55                      # the stretch drawn: "The coupling constant K is phrasing"
X = lambda s: x0 + (s - T0) / (T1 - T0) * (x1 - x0)
FLOOR = -60.0
o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="{PAPER}"/>',
     f'<text x="{x0}" y="46" {FONT} font-size="21" font-weight="700" fill="{INK}" letter-spacing="2">TWO COMMAS, ONE MORE PAUSE</text>',
     f'<text x="{x0}" y="74" {FONT} font-size="15" fill="{INK3}">one sentence read twice by Kokoro; shaded: 50 ms or more, 40 dB under the loudest (dashed)</text>']
S = rec["summary_for_picture"] = {
    "bare_before": summary["all / bare"][-40]["before_K"], "commas_before": summary["all / commas"][-40]["before_K"]}
lanes = [('without commas: "…constant K is…"', yb, wb0, INK, 250, "gaps_bare"), ('with commas: "…constant, K, is…"', yc, wc0, RED, 440, "gaps_commas")]
for label, x, w, col, base, gk in lanes:
    db = np.maximum(frames_db(x), FLOOR); hgt = 110
    yy = lambda d: base - (d - FLOOR) / -FLOOR * hgt
    ts = [i * FR for i in range(len(db))]
    pts = [(X(t), yy(d)) for t, d in zip(ts, db) if T0 <= t <= T1]
    poly = f"{pts[0][0]:.1f},{base} " + " ".join(f"{a:.1f},{b:.1f}" for a, b in pts) + f" {pts[-1][0]:.1f},{base}"
    # quiet runs >= 50 ms between "constant" and "is"
    g = rec["measured_on_saved_file"][gk]["-40"]
    for a, b in runs(frames_db(x) < -40):
        if b - a >= MIN_GAP and w["constant"][0] < b and a < w["is"][1]:
            o.append(f'<rect x="{X(a):.1f}" y="{base - hgt}" width="{X(b) - X(a):.1f}" height="{hgt}" fill="{FILL}"/>')
            o.append(f'<text x="{(X(a) + X(b)) / 2:.1f}" y="{base - hgt - 8}" {FONT} font-size="16" font-weight="700" fill="{col}" text-anchor="middle">{round(1000 * (b - a))} ms</text>')
    o.append(f'<line x1="{x0}" y1="{yy(-40):.1f}" x2="{x1}" y2="{yy(-40):.1f}" stroke="{RULE}" stroke-width="1" stroke-dasharray="3 4"/>')
    o.append(f'<polygon points="{poly}" fill="{col}" opacity="0.85"/>')
    o.append(f'<line x1="{x0}" y1="{base}" x2="{x1}" y2="{base}" stroke="{RULE}" stroke-width="1"/>')
    o.append(f'<text x="{x0}" y="{base - hgt - 34}" {FONT} font-size="18" font-weight="700" fill="{col}">{label}</text>')
    for word in ("constant", "K", "is"):
        a, b = w[word]
        o.append(f'<text x="{(X(a) + X(b)) / 2:.1f}" y="{base + 22}" {FONT} font-size="16" fill="{INK}" text-anchor="middle">{word}</text>')
        o.append(f'<line x1="{X(a):.1f}" y1="{base + 4}" x2="{X(a):.1f}" y2="{base + 10}" stroke="{INK3}" stroke-width="1"/>')
cb, cc_ = S["bare_before"], S["commas_before"]
o.append(f'<text x="{x0}" y="{H - 46}" {FONT} font-size="15" fill="{INK}">A pause before K, 50 ms or longer: {cb["with_gap"]} of {cb["n"]} takes without commas, {cc_["with_gap"]} of {cc_["n"]} with them.</text>')
o.append(f'<text x="{x0}" y="{H - 22}" {FONT} font-size="13" fill="{INK3}">Kokoro {rec["kokoro"]}: four voices, ten seeds each; a seed moved no pause by more than 10 ms. Drawn: {PIECE_VOICE}, seed {pick}.</text></svg>')
svg = OUT / "two-commas-picture.svg"; svg.write_text("".join(o))
html = OUT / "_picture.html"; html.write_text(f'<html><body style="margin:0">{svg.read_text()}</body></html>')
subprocess.run(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu", "--hide-scrollbars",
                f"--window-size={W},{H}", f"--screenshot={OUT / 'two-commas-picture.png'}", html.as_uri()], check=True, capture_output=True)
html.unlink()

rec["sha256"] = {p.name: hashlib.sha256(p.read_bytes()).hexdigest()[:16] for p in sorted(OUT.glob("two-commas*"))}
rec["heard_by"] = None
(OUT / "report.json").write_text(json.dumps(rec, indent=2, ensure_ascii=False, default=str) + "\n")
print(json.dumps({k: rec[k] for k in ("piece", "measured_on_saved_file", "second_route_2026_05_26", "same_seed_twice_max_abs_diff")}, indent=1, default=str))
print(json.dumps({k: {c: v for c, v in d.items() if c == -40} for k, d in summary.items()}, indent=0))
