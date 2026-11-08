#!/usr/bin/env python3
"""A voice that reads only partial-tables.json, checked against the browser instrument.

This is the Live device's engine written in Python, line for line the logic
device-spec.md asks the patch for: no Bessel functions, no mode search, just
the tables, the mallet, the strike and pickup points, the angle of i.
It checks:
  1 the tables hold the instrument's modes: same pitches, same loudness, for
    the seven presets and 40 random strike points (instrument.html's own
    build(), run in node, is the reference)
  2 the disk's radial lookup (linear interpolation) costs how much accuracy
  3 the voice budget: how many oscillators a voice needs before a strike
    stops changing (error of the rendered strike vs the full set, in dB)
  4 a fixed output gain: the device cannot read a strike's peak before it
    plays it, as the browser does, so how far apart do the presets land if it
    scales by the partials' own loudness instead
  5 rendered strikes from the table voice match instrument.html's render()
Writes table-voice-checks.txt beside this script, and table-voice-tour.wav:
the seven presets struck by the table voice, at the budget check 3 picks, with the fixed gain check 4 measures.
"""
import json, os, re, subprocess, time, wave
import numpy as np
from scipy import special

HERE = os.path.dirname(os.path.abspath(__file__))
PROOFS = os.path.join(HERE, "..", "proofs")
T = json.load(open(os.path.join(HERE, "partial-tables.json")))
html = open(os.path.join(PROOFS, "instrument.html")).read()
core = re.search(r'<script id="core">(.*?)</script>', html, re.S).group(1)
lines, ok_all = [], True
P = lambda s: (print(s), lines.append(s))
SR, F1 = 48000, 220.0
DEFAULTS = {"line": (0.23, 0.37), "square": ([0.23, 0.31], [0.37, 0.71]), "disk": ([0.42, 0.3], [0.63, 2.2])}
PRESETS = [("string", "wave", "line", None), ("box (a line)", "schr", "line", None),
           ("square drum", "wave", "square", None), ("square box", "schr", "square", None),
           ("round drum", "wave", "disk", None), ("round box", "schr", "disk", None),
           ("round drum, dead centre", "wave", "disk", [0, 0])]


def node(js):
    r = subprocess.run(["node", "-e", core + "\n" + js], capture_output=True, text=True)
    if r.returncode: raise SystemExit(r.stderr[-2000:])
    return json.loads(r.stdout)


# ---------------------------------------------------------------- the voice
def radial(row, r, exact=False):
    if exact:
        j = row["krel"] * T["disk"]["k1"]
        norm2 = (np.pi if row["m"] == 0 else np.pi / 2) * special.jv(row["m"] + 1, j) ** 2
        return special.jv(row["m"], j * r) / np.sqrt(norm2)
    R, N = row["radial"], T["disk"]["radial_n"]
    x = min(max(r, 0.0), 1.0) * (N - 1); i = min(int(x), N - 2); f = x - i
    return R[i] * (1 - f) + R[i + 1] * f


def phi(shape, row, q, exact=False):
    if shape == "line": return np.sqrt(2) * np.sin(row["n"] * np.pi * q)
    if shape == "square": return 2 * np.sin(row["m"] * np.pi * q[0]) * np.sin(row["n"] * np.pi * q[1])
    return None


def voice(shape, eq, S, Pk, sigma, budget=None, exact=False):
    """-> list of (ratio, amplitude), loudest `budget` of them, sorted by ratio"""
    acc = {}
    for row in T[shape]["rows"]:
        kr = row["krel"]
        g = np.exp(-(kr * sigma) ** 2 / 2)
        if shape == "disk":
            if S[0] > 1 or Pk[0] > 1: a = 0.0
            else: a = radial(row, S[0], exact) * radial(row, Pk[0], exact) * np.cos(row["m"] * (S[1] - Pk[1]))
        else:
            a = phi(shape, row, S) * phi(shape, row, Pk)
        ratio = kr if eq == "wave" else kr * kr
        if F1 * ratio > 18000: continue
        s = acc.setdefault(row["slot"], [ratio, 0.0]); s[1] += g * a
    parts = sorted(acc.values())
    amax = max(abs(a) for _, a in parts) or 1
    parts = [p for p in parts if abs(p[1]) > 1e-5 * amax]
    if budget: parts = sorted(sorted(parts, key=lambda p: -abs(p[1]))[:budget])
    return parts


def render(parts, f1, theta_deg, dur=None):
    th = np.radians(theta_deg); ct, st = np.cos(th), np.sin(th)
    w1 = 2 * np.pi * f1
    ring = np.log(1e4) / (w1 * st)
    n = int((min(4.0, ring + 0.02) if dur is None else dur) * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for ratio, a in parts:
        w = w1 * ratio
        if w * ct / (2 * np.pi) >= 0.45 * SR: continue
        y += a * np.exp(-w * st * t) * np.cos(w * ct * t)
    k = int(0.002 * SR); y[:k] *= np.arange(k) / k
    return y


def db(x): return 20 * np.log10(max(x, 1e-300))


# ---------------------------------------------------------------- 1
P("== check 1: the tables hold the instrument's modes (instrument.html build() as reference) ==")
rng = np.random.default_rng(7)
cases = [(lab, eq, sh, S or DEFAULTS[sh][0], DEFAULTS[sh][1], 0.25) for lab, eq, sh, S in PRESETS]
for i in range(40):
    sh = ["line", "square", "disk"][i % 3]; eq = ["wave", "schr"][i % 2]
    S = float(rng.uniform(.02, .98)) if sh == "line" else ([float(v) for v in rng.uniform(.02, .98, 2)] if sh == "square"
        else [float(np.sqrt(rng.uniform(0, .96))), float(rng.uniform(0, 2 * np.pi))])
    cases.append((f"random {i}", eq, sh, S, DEFAULTS[sh][1], float(rng.uniform(0.05, 0.6))))
ref = node("console.log(JSON.stringify(" + json.dumps([[c[2], c[1], c[3], c[4], c[5]] for c in cases])
           + ".map(([sh,eq,S,P,s]) => build(sh,eq,S,P,s).partials.map(p => [p.ratio, p.a]))));")
worst_r = worst_a = 0; worst_n = 0
for c, rp in zip(cases, ref):
    mine = voice(c[2], c[1], c[3], c[4], c[5], exact=True)
    amax = max(abs(a) for _, a in rp)
    big = lambda ps: [p for p in ps if abs(p[1]) > 1e-4 * amax]
    A, B = big(mine), big(rp)
    worst_n = max(worst_n, abs(len(A) - len(B)))
    if len(A) == len(B):
        worst_r = max(worst_r, max(abs(a[0] - b[0]) / b[0] for a, b in zip(A, B)))
        worst_a = max(worst_a, max(abs(a[1] - b[1]) for a, b in zip(A, B)) / amax)
    if c[0] in [p[0] for p in PRESETS]:
        P(f"  {c[0]:25s} {len(B):4d} partials above -80 dB · table voice {len(A):4d}")
good = worst_n == 0 and worst_r < 1e-9 and worst_a < 1e-6
ok_all &= good
P(f"  47 strikes (7 presets + 40 random points, mallets 0.05-0.6): partial count mismatch {worst_n}, "
  f"pitch diff {worst_r:.0e}, loudness diff {worst_a:.0e} of the loudest" + ("   PASS" if good else "   FAIL"))

# ---------------------------------------------------------------- 2
P("== check 2: the disk's radial lookup, linear interpolation on 257 points ==")
errs = []
for c in cases:
    if c[2] != "disk": continue
    ex = dict(voice("disk", c[1], c[3], c[4], c[5], exact=True)); lu = dict(voice("disk", c[1], c[3], c[4], c[5]))
    amax = max(abs(v) for v in ex.values())
    errs.append(max(abs(ex[k] - lu.get(k, 0)) for k in ex) / amax)
good = max(errs) < 3e-3
ok_all &= good
P(f"  {len(errs)} disk strikes: worst partial off by {max(errs):.1e} of the loudest ({db(max(errs)):.0f} dB)"
  + ("   PASS" if good else "   FAIL"))

# ---------------------------------------------------------------- 3
P("== check 3: the voice budget: strike error vs the full set, keeping only the N loudest partials ==")
budgets = [16, 32, 48, 64, 96, 128]
P("  " + f"{'':25s}" + "".join(f"{'N=' + str(b):>8s}" for b in budgets) + "   (dB, rendered strike, theta 0.03°, first 1.5 s)")
worst = {b: -999 for b in budgets}
for lab, eq, sh, S in PRESETS:
    S = S or DEFAULTS[sh][0]
    full = voice(sh, eq, S, DEFAULTS[sh][1], 0.25)
    yf = render(full, F1, 0.03, 1.5)
    row = []
    for b in budgets:
        yb = render(voice(sh, eq, S, DEFAULTS[sh][1], 0.25, budget=b), F1, 0.03, 1.5)
        e = db(np.sqrt(np.mean((yb - yf) ** 2)) / np.sqrt(np.mean(yf ** 2)))
        row.append(e)
        worst[b] = max(worst[b], e)
    P(f"  {lab:25s}" + "".join(f"{e:8.0f}" if e > -200 else f"{'exact':>8s}" for e in row) + f"   of {len(full)}")
BUDGET = next((b for b in budgets if worst[b] < -40), None)
good = BUDGET is not None
ok_all &= good
P(f"  smallest budget that keeps every preset within -40 dB of the full set: {BUDGET} oscillators "
  f"(64 leaves the square drum at {worst[64]:.0f} dB)" + ("   PASS" if good else "   FAIL"))

# ---------------------------------------------------------------- 4
P("== check 4: a fixed output gain: scale by 1 / sqrt(sum a^2) and see where the presets' peaks land ==")
pk = []
for lab, eq, sh, S in PRESETS:
    S = S or DEFAULTS[sh][0]
    ps = voice(sh, eq, S, DEFAULTS[sh][1], 0.25, budget=BUDGET)
    y = render(ps, F1, 0.03, 1.0)
    rms_norm = np.sqrt(sum(a * a for _, a in ps))
    l1_norm = sum(abs(a) for _, a in ps)
    pk.append((lab, db(np.max(np.abs(y)) / rms_norm), db(np.max(np.abs(y)) / l1_norm)))
spread_rms = max(p[1] for p in pk) - min(p[1] for p in pk)
spread_l1 = max(p[2] for p in pk) - min(p[2] for p in pk)
for lab, a, b in pk: P(f"  {lab:25s} peak {a:+5.1f} dB over sqrt(sum a^2) · {b:+5.1f} dB over sum |a|")
P(f"  spread across presets: {spread_rms:.1f} dB with sqrt(sum a^2), {spread_l1:.1f} dB with sum |a|; "
  f"sum |a| never clips (it bounds the peak), sqrt(sum a^2) keeps loudness closer")

# ---------------------------------------------------------------- 5
P("== check 5: rendered strikes, table voice vs instrument.html render() ==")
worst = 0
for lab, eq, sh, S in PRESETS[2:6]:
    S = S or DEFAULTS[sh][0]
    js = (f"const b = build({json.dumps(sh)}, {json.dumps(eq)}, {json.dumps(S)}, {json.dumps(DEFAULTS[sh][1])}, 0.25);"
          f"const y = render(b.partials, 220, 0.3, {SR}); console.log(JSON.stringify(Array.from(y.slice(0, {SR // 4}))));")
    yr = np.array(node(js))
    ym = render(voice(sh, eq, S, DEFAULTS[sh][1], 0.25), F1, 0.3, 0.25)[:len(yr)]
    e = np.max(np.abs(ym - yr)) / np.max(np.abs(yr)); worst = max(worst, e)
    P(f"  {lab:25s} theta 0.3°, first 0.25 s: worst sample off by {e:.0e} of the peak")
good = worst < 1e-3
ok_all &= good
P(f"  (the browser stops each partial at -80 dB; the voice runs it on)" + ("   PASS" if good else "   FAIL"))

# ---------------------------------------------------------------- cost
t0 = time.perf_counter()
for _ in range(20): voice("square", "wave", [0.3, 0.6], DEFAULTS["square"][1], 0.25, budget=BUDGET)
P(f"== cost: re-reading the square's 482 rows for one new strike point: {(time.perf_counter() - t0) / 20 * 1e3:.1f} ms in Python ==")
P("  ALL PASS" if ok_all else "  SOME FAILED")
open(os.path.join(HERE, "table-voice-checks.txt"), "w").write("\n".join(lines) + "\n")

# ---------------------------------------------------------------- tour
gap = np.zeros(int(0.35 * SR)); out = []
for lab, eq, sh, S in PRESETS:
    S = S or DEFAULTS[sh][0]
    ps = voice(sh, eq, S, DEFAULTS[sh][1], 0.25, budget=BUDGET)
    y = render(ps, F1, 0.03, 2.4)
    y *= 0.3 / sum(abs(a) for _, a in ps)          # the sum |a| gain the spec proposes: no peak-reading, no clip
    r = int(0.6 * SR); y[-r:] *= np.linspace(1, 0, r)
    out += [y, gap]
y = np.concatenate(out); y *= 0.89 / np.max(np.abs(y))
with wave.open(os.path.join(HERE, "table-voice-tour.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(y, -1, 1) * 32767).astype("<i2").tobytes())
print("wrote table-voice-checks.txt, table-voice-tour.wav")
