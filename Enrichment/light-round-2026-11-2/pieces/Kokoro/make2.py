"""
Kokoro, light round 2 — the remake, after the challenge (challenge.md). The sound is not re-made: two-commas.m4a stands.

Three parts:
  may     — the two 2026-05-26 takes Loudon reviewed, from git (a94481f0 without commas, 36d1ae66 with them), re-rendered
            with today's Kokoro from their own scripts' text, voice and chunking (af_heart, speed 1.0, 0.25 s between
            chunks), aligned to the git files by their 10 ms envelopes, so Kokoro's own word timings can be laid on the
            takes that were heard. The detector then runs on the git files themselves.
  letters — is the quiet before K partly the K? The same comma test with other letters: voiceless stops (K, T, P),
            voiced stops (B, D), and letters said from a vowel (X, N, M, S, F), in two sentences, four voices, seed 1
            (a seed moves no timing: make.py's survey). Also Kokoro's planned time for each comma token.
  picture — two-commas-picture-2: the same two lanes, drawn from two-commas.m4a and the word timings in survey.json,
            with the quiet after K marked as in both reads and the evidence stated as four voices of one sentence.

Run from this folder: ~/.venvs/kokoro/bin/python make2.py
The detector is make.py's: 10 ms frames, dB under the loudest frame of the stretch measured, quiet at -40 dB, a run counts
from 50 ms. Before the letter: the longest run ending between the middle of the word before and the letter's loudest
frame. After: the longest starting between the letter's loudest frame and the middle of the word after.
"""
import io, json, subprocess
from pathlib import Path
import numpy as np, soundfile as sf, torch

OUT = Path(__file__).parent; ROOT = OUT.parents[3]; SR = 24_000; FR = 0.01; MIN = 0.05
VOICES = ["af_heart", "af_bella", "am_michael", "am_adam"]


def frames_db(x):
    n = int(FR * SR); m = len(x) // n
    db = 20 * np.log10(np.sqrt((x[:m * n].astype(np.float64).reshape(m, n) ** 2).mean(1)) + 1e-9)
    return db - db.max()


def runs(q):
    out, st = [], None
    for i, v in enumerate(list(q) + [False]):
        if v and st is None: st = i
        if not v and st is not None: out.append((round(st * FR, 2), round(i * FR, 2))); st = None
    return out


def gaps(x, prev, letter, nxt, cut=-40):
    db = frames_db(x); k0, k1 = letter
    kpk = (int(k0 / FR) + int(np.argmax(db[int(k0 / FR):int(k1 / FR) + 1]))) * FR
    pmid, nmid = sum(prev) / 2, sum(nxt) / 2
    rr = runs(db < cut)
    b = [e - s for s, e in rr if pmid < e <= kpk + FR]; a = [e - s for s, e in rr if kpk <= s < nmid]
    return {"before_ms": round(1000 * max(b, default=0)), "after_ms": round(1000 * max(a, default=0)),
            "quiet_runs_50ms_from_prev_to_next": [r for r in rr if r[1] - r[0] >= MIN and pmid < r[1] and r[0] < nmid]}


from kokoro import KPipeline
import kokoro
pipe = KPipeline(lang_code="a")
rec = {"kokoro": kokoro.__version__, "detector": "make.py's, at -40 dB, 50 ms"}


def render_tokens(text, voice, seed=1, chunk_gap=0.0):
    torch.manual_seed(seed); parts, toks, off = [], [], 0.0
    for r in pipe(text, voice=voice, speed=1.0):
        a = r.audio.detach().cpu().numpy() if hasattr(r.audio, "detach") else np.asarray(r.audio)
        toks += [(t.text, off + t.start_ts, off + t.end_ts) for t in (r.tokens or []) if t.start_ts is not None]
        parts.append(a.astype(np.float32)); off += len(a) / SR
        if chunk_gap: parts.append(np.zeros(int(SR * chunk_gap), np.float32)); off += chunk_gap
    if chunk_gap: parts.pop(); off -= chunk_gap
    return np.concatenate(parts), toks


# ---- may
MAY = {"bare": ("a94481f0", "The coupling constant K is phrasing density and rhythmic clarity.", "Kuramoto coupling. "),
       "commas": ("36d1ae66", "The coupling constant, K, is phrasing density and rhythmic clarity.", "[Kuramoto](/kˌuɹəmˈOtO/) coupling. ")}
HEAD = ("When a speaker's phrases fall into a groove with a listener's attention cycles, "
        "comprehension increases and the interaction feels effortless. This is ")
MID = ("The listener's attention has a natural frequency, related to working memory refresh rate, "
       "approximately four to eight hertz in the theta band, and a well-paced speaker entrains to it. "
       "In music, groove is the condition where the rhythmic information density "
       "matches the listener's coupled attention oscillators. A drummer who drags or rushes is detuning the coupling. ")
may = {}
for k, (commit, last, kura) in MAY.items():
    text = HEAD + kura + MID + last
    x, toks = render_tokens(text, "af_heart", chunk_gap=0.25)
    b = subprocess.run(["git", "show", f"{commit}:Kuramoto Coupling/speech-rhythm-and-groove-narration-study.wav"], cwd=ROOT, capture_output=True, check=True).stdout
    h, hsr = sf.read(io.BytesIO(b)); h = h.mean(1) if h.ndim > 1 else h; assert hsr == SR
    ex, eh = frames_db(x), frames_db(h)
    lin = lambda d: 10 ** (d / 20)
    def pair(L):  # rerender frame i sits at git frame i + L
        i0 = max(0, -L); n = min(len(ex) - i0, len(eh) - (i0 + L))
        return lin(ex[i0:i0 + n]), lin(eh[i0 + L:i0 + L + n])
    L = max(range(-100, 101), key=lambda L: np.corrcoef(*pair(L))[0, 1])
    corr = float(np.corrcoef(*pair(L))[0, 1]); lag = L * FR
    # the last "constant", "K", "is" in the paragraph, on the git file's clock
    idx = max(i for i, t in enumerate(toks) if t[0] == "K")
    pos = lambda name, start: next(t for t in toks[start:] if t[0] == name)
    c = [t for t in toks[:idx] if t[0] == "constant"][-1]; kk = toks[idx]; iz = pos("is", idx)
    s0 = max(0.0, c[1] - 1.0 + lag); s1 = iz[2] + 1.0 + lag
    sl = h[int(s0 * SR):int(s1 * SR)]
    sh = lambda t: (t[1] + lag - s0, t[2] + lag - s0)
    g = gaps(sl, sh(c), sh(kk), sh(iz))
    g["quiet_runs_50ms_from_prev_to_next"] = [(round(a + s0, 2), round(e + s0, 2)) for a, e in g["quiet_runs_50ms_from_prev_to_next"]]
    may[k] = {"commit": commit, "git_sec": round(len(h) / SR, 3), "rerender_sec": round(len(x) / SR, 3), "lag_sec": round(lag, 2),
              "envelope_corr_linear_10ms": round(corr, 4),
              "words_on_git_clock": {n: (round(t[1] + lag, 3), round(t[2] + lag, 3)) for n, t in (("constant", c), ("K", kk), ("is", iz))},
              "commas_planned": [(round(t[1] + lag, 3), round(t[2] + lag, 3)) for t in toks[idx - 2:idx + 3] if t[0] == ","],
              "gaps_on_git_file": g, "measured_on": "the git file, the last sentence's stretch from 1 s before 'constant' to 1 s after 'is'"}
rec["may"] = may

# ---- letters
FRAMES = {"constant": ("The coupling constant{c} {L}{c} is phrasing density and rhythmic clarity.", "constant", "is"),
          "value": ("Then the value{c} {L}{c} grows over time.", "value", "grows")}
LETTERS = {"K": "voiceless stop", "T": "voiceless stop", "P": "voiceless stop", "B": "voiced stop", "D": "voiced stop",
           "X": "from a vowel", "N": "from a vowel", "M": "from a vowel", "S": "from a vowel", "F": "from a vowel"}
rows = []
for fname, (tmpl, prev, nxt) in FRAMES.items():
    for Lt, kind in LETTERS.items():
        for v in VOICES:
            row = {"frame": fname, "letter": Lt, "kind": kind, "voice": v}
            for mode, c in (("bare", ""), ("commas", ",")):
                x, toks = render_tokens(tmpl.format(c=c, L=Lt), v)
                li = next((i for i, t in enumerate(toks) if t[0] == Lt), None)
                if li is None: row[mode] = {"error": "letter not a token", "tokens": [t[0] for t in toks]}; continue
                p = [t for t in toks[:li] if t[0] == prev][-1]; n = next(t for t in toks[li:] if t[0] == nxt)
                g = gaps(x, p[1:], toks[li][1:], n[1:]); g.pop("quiet_runs_50ms_from_prev_to_next")
                g["planned_comma_ms"] = [round(1000 * (t[2] - t[1])) for t in toks[li - 1:li + 2] if t[0] == ","]
                row[mode] = g
            rows.append(row)
rec["letters"] = rows
summ = {}
for fname in FRAMES:
    for Lt, kind in LETTERS.items():
        rr = [r for r in rows if r["frame"] == fname and r["letter"] == Lt and "before_ms" in r["commas"] and "before_ms" in r["bare"]]
        summ[f"{fname} / {Lt}"] = {"kind": kind, "voices": len(rr),
                                   "bare_before_50": sum(r["bare"]["before_ms"] >= 50 for r in rr),
                                   "commas_before_50": sum(r["commas"]["before_ms"] >= 50 for r in rr),
                                   "commas_before_ms": [r["commas"]["before_ms"] for r in rr], "bare_before_ms": [r["bare"]["before_ms"] for r in rr],
                                   "after_ms_bare_to_commas": [(r["bare"]["after_ms"], r["commas"]["after_ms"]) for r in rr],
                                   "planned_comma_ms": [r["commas"]["planned_comma_ms"] for r in rr]}
rec["letters_summary"] = summ
(OUT / "report-2.json").write_text(json.dumps(rec, indent=1, ensure_ascii=False) + "\n")
print(json.dumps(rec["may"], indent=1, ensure_ascii=False))
for k, v in summ.items(): print(k, v["kind"], "before>=50 bare", v["bare_before_50"], "commas", v["commas_before_50"], "of", v["voices"], "| commas before", v["commas_before_ms"], "| bare before", v["bare_before_ms"], "| after", v["after_ms_bare_to_commas"], "| planned", v["planned_comma_ms"])

# ---- picture: drawn from the saved m4a and the word timings Kokoro gave for those two takes
R1 = json.loads((OUT / "report.json").read_text()); M1 = R1["measured_on_saved_file"]
SV = json.loads((OUT / "survey.json").read_text()); seed = R1["piece"]["seed"]
W1 = {r["text"]: r["words"] for r in SV if r["voice"] == R1["piece"]["voice"] and r["seed"] == seed}
dec = OUT / "_dec2.wav"; subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(OUT / "two-commas.m4a"), str(dec)], check=True)
y, ysr = sf.read(dec); dec.unlink(); y = y.mean(1) if y.ndim > 1 else y; assert ysr == SR
half = lambda ab: y[int(ab[0] * SR):int(ab[1] * SR)]
yb, yc = half(M1["bare_at_sec"]), half(M1["commas_at_sec"])
S1 = R1["survey_summary"]; per = {v: S1[f"{v} / commas"]["-40"]["before_K"] for v in VOICES}
nb = sum(S1[f"{v} / bare"]["-40"]["before_K"]["with_gap"] > 0 for v in VOICES); nc = sum(per[v]["with_gap"] > 0 for v in VOICES)
PAPER, INK, INK3, RULE, RED, FILL = "#f0eee5", "#1a1916", "#6a6862", "#b8b09a", "#c8261a", "#dcd9ca"
FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace\""
W, H, x0, x1 = 1000, 640, 60, 960; T0, T1 = 0.25, 2.55; FLOOR = -60.0; hgt = 110
X = lambda s: x0 + (s - T0) / (T1 - T0) * (x1 - x0)
o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="{PAPER}"/>',
     f'<text x="{x0}" y="46" {FONT} font-size="21" font-weight="700" fill="{INK}" letter-spacing="2">TWO COMMAS, A QUIET BEFORE K</text>',
     f'<text x="{x0}" y="74" {FONT} font-size="15" fill="{INK3}">Shaded: quiet of 50 ms or more, 40 dB down (dashed) on this file; counts are on raw takes.</text>']
lanes = [('without commas: "…constant K is…"', yb, W1["bare"], INK, 285, "bare"), ('with commas: "…constant, K, is…"', yc, W1["commas"], RED, 505, "commas")]
for label, x, w, col, base, key in lanes:
    db = frames_db(x); yy = lambda d: base - (max(d, FLOOR) - FLOOR) / -FLOOR * hgt
    k0, k1 = w["K"]; kpk = (int(k0 / FR) + int(np.argmax(db[int(k0 / FR):int(k1 / FR) + 1]))) * FR
    for a, b in runs(db < -40):
        if b - a >= MIN and sum(w["constant"]) / 2 < b and a < sum(w["is"]) / 2:
            side = "before K" if b <= kpk + FR else "after K"
            new = key == "commas" and side == "before K"
            note = "only with commas" if new else "in both reads"
            o.append(f'<rect x="{X(a):.1f}" y="{base - hgt}" width="{X(b) - X(a):.1f}" height="{hgt}" fill="{FILL}"' + (f' stroke="{RED}" stroke-width="2.5"' if new else '') + '/>')
            o.append(f'<text x="{(X(a) + X(b)) / 2:.1f}" y="{base - hgt - 8}" {FONT} font-size="17" font-weight="700" fill="{RED if new else INK3}" text-anchor="middle">{round(1000 * (b - a))} ms</text>')
            o.append(f'<text x="{(X(a) + X(b)) / 2:.1f}" y="{base - hgt - 28}" {FONT} font-size="14" fill="{RED if new else INK3}" text-anchor="middle">{note}</text>')
    pts = [(X(i * FR), yy(d)) for i, d in enumerate(db) if T0 <= i * FR <= T1]
    o.append(f'<line x1="{x0}" y1="{yy(-40):.1f}" x2="{x1}" y2="{yy(-40):.1f}" stroke="{RULE}" stroke-width="1" stroke-dasharray="3 4"/>')
    o.append(f'<polygon points="{pts[0][0]:.1f},{base} ' + " ".join(f"{a:.1f},{b:.1f}" for a, b in pts) + f' {pts[-1][0]:.1f},{base}" fill="{col}" opacity="0.85"/>')
    o.append(f'<line x1="{x0}" y1="{base}" x2="{x1}" y2="{base}" stroke="{RULE}" stroke-width="1"/>')
    o.append(f'<text x="{x0}" y="{base - hgt - 56}" {FONT} font-size="18" font-weight="700" fill="{col}">{label}</text>')
    for word in ("constant", "K", "is"):
        a, b = w[word]
        o.append(f'<text x="{(X(a) + X(b)) / 2:.1f}" y="{base + 22}" {FONT} font-size="16" fill="{INK}" text-anchor="middle">{word}</text>')
        o.append(f'<line x1="{X(a):.1f}" y1="{base + 4}" x2="{X(a):.1f}" y2="{base + 10}" stroke="{INK3}" stroke-width="1"/>')
o.append(f'<text x="{x0}" y="{H - 62}" {FONT} font-size="16" fill="{INK}">Four voices, this sentence: a quiet before K with commas in {nc} of 4,</text>')
o.append(f'<text x="{x0}" y="{H - 40}" {FONT} font-size="16" fill="{INK}">without in {nb} of 4. One voice sits at the 50 ms line.</text>')
o.append(f'<text x="{x0}" y="{H - 16}" {FONT} font-size="13" fill="{INK3}">Not just K\'s own stop: of ten letters tried here, commas gave a quiet before 27 of 40, without 9.</text></svg>')
svg = OUT / "two-commas-picture-2.svg"; svg.write_text("".join(o))
html = OUT / "_picture2.html"; html.write_text(f'<html><body style="margin:0">{svg.read_text()}</body></html>')
subprocess.run(["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "--headless=new", "--disable-gpu", "--hide-scrollbars",
                f"--window-size={W},{H}", f"--screenshot={OUT / 'two-commas-picture-2.png'}", html.as_uri()], check=True, capture_output=True)
html.unlink()
rec["picture_2"] = {"drawn_from": "two-commas.m4a decoded, survey.json word timings for the piece's takes", "voices_with_quiet_before_K": {"commas": nc, "bare": nb}}
(OUT / "report-2.json").write_text(json.dumps(rec, indent=1, ensure_ascii=False) + "\n")
