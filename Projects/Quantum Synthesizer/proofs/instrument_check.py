#!/usr/bin/env python3
"""Check instrument.html's in-browser physics against scipy and the earlier proofs.

Pulls the <script id="core"> block out of the page, runs it in node, and checks:
  1 its Bessel functions and Bessel-zero table against scipy
  2 every circle mode is unit-normalised over the disk (numerical integral),
    and how far drum.py's normalisation was off
  3 the seven presets' ladders (first partials, and loudness of every partial)
    against an independent numpy/scipy construction, and their ladders
    against the ratios drum-checks.txt read from drum.wav's sound
  4 its 'does it repeat?' test gives the same verdicts drum.py's
    autocorrelation found
  5 a rendered strike: pitch = 220 cos(theta), every partial's damping ratio
    = sin(theta) (fitted from the samples), and render time per strike
Writes instrument-checks.txt beside this script.
Run with /usr/local/bin/python3 (numpy + scipy) and node.
"""
import json, os, re, subprocess, time
import numpy as np
from scipy import special

HERE = os.path.dirname(os.path.abspath(__file__))
html = open(os.path.join(HERE, "instrument.html")).read()
core = re.search(r'<script id="core">(.*?)</script>', html, re.S).group(1)
lines = []
P = lambda s: (print(s), lines.append(s))
ok_all = True


def node(js):
    r = subprocess.run(["node", "-e", core + "\n" + js], capture_output=True, text=True)
    if r.returncode: raise SystemExit(r.stderr[-2000:])
    return json.loads(r.stdout)


# ----------------------------------------------------------------------
P("== check 1: Bessel functions and zeros vs scipy ==")
xs = np.linspace(0, 44, 89).tolist()
got = node(f"console.log(JSON.stringify([0,1,2,5,10,20,36].map(m => {xs}.map(x => besselJ(m, x)))));")
err = max(np.max(np.abs(np.array(g) - special.jv(m, xs))) for m, g in zip([0, 1, 2, 5, 10, 20, 36], got))
jz = node("console.log(JSON.stringify(JZ));")
zerr = max(np.max(np.abs(np.array(v) - special.jn_zeros(int(m), len(v)))) for m, v in jz.items())
nz = sum(len(v) for v in jz.values())
good = err < 1e-12 and zerr < 1e-9
ok_all &= good
P(f"  J_m(x), m = 0..36, x = 0..44: max error {err:.1e}   zero table: {nz} zeros, m = 0..{max(map(int, jz))}, max error {zerr:.1e}"
  + ("   PASS" if good else "   FAIL"))

# ----------------------------------------------------------------------
P("== check 2: every circle mode has unit energy over the disk ==")
NRr, NPh = 4000, 256
r = (np.arange(NRr) + 0.5) / NRr
ph = 2 * np.pi * np.arange(NPh) / NPh
modes = node("console.log(JSON.stringify(modeList('disk').map(m => [m.m, m.k, m.norm2])));")
pick = [md for md in modes if (md[0], round(md[1], 3)) in {(0, 2.405), (1, 3.832), (3, 6.380), (0, 5.520), (7, 11.086)}]
worst = 0
for m, k, norm2 in pick:
    ang = np.cos(m * ph)
    integ = (special.jv(m, k * r)**2 * r).sum() / NRr * (ang**2).sum() * 2 * np.pi / NPh / norm2
    old = (special.jv(m, k * r)**2 * r).sum() / NRr * (ang**2).sum() * 2 * np.pi / NPh / (np.pi * special.jv(m + 1, k)**2)
    worst = max(worst, abs(integ - 1))
    P(f"  m = {m}, j = {k:7.4f}: energy with this page's norm {integ:.6f}   with drum.py's norm {old:.6f}")
good = worst < 1e-4
ok_all &= good
P("  drum.py divided every m > 0 mode by pi J_{m+1}^2 where the true integral is (pi/2) J_{m+1}^2, so in drum.wav"
  "\n  the round drum's and round box's non-round partials came out half as loud (-6 dB) as they should."
  "\n  Their pitches, and every ladder and repeat verdict, are unaffected." + ("   PASS" if good else "   FAIL"))

# ----------------------------------------------------------------------
P("== check 3: the seven presets vs an independent build, and vs the ladders read from drum.wav ==")
DEF = {"line": (0.23, 0.37), "square": ((0.23, 0.31), (0.37, 0.71)), "disk": ((0.42, 0.3), (0.63, 2.2))}
PRE = [("string", "wave", "line", None), ("box (a line)", "schr", "line", None),
       ("square drum", "wave", "square", None), ("square box", "schr", "square", None),
       ("round drum", "wave", "disk", None), ("round box", "schr", "disk", None),
       ("round drum, dead centre", "wave", "disk", (0.0, 0.0))]
DRUMWAV = {"string": [1, 2, 3, 4, 5, 6], "box (a line)": [1, 4, 9], "square drum": [1, 2, 2.55, 2.915, 3.606, 3.808],
           "square box": [1, 2.5, 4, 5, 6.5, 8.5], "round drum": [1, 1.593, 2.136, 2.653, 3.647, 5.131],
           "round box": [1, 2.539, 4.561, 5.269, 7.039, 8.511], "round drum, dead centre": [1, 2.295, 3.598, 4.903, 6.209, 7.515]}
calls = []
for name, eq, shape, S in PRE:
    s, p = DEF[shape]
    calls.append(dict(name=name, eq=eq, shape=shape, S=list(S) if S else (list(s) if shape != "line" else s), P=list(p) if shape != "line" else p))
res = node(f"""const C = {json.dumps(calls)};
console.log(JSON.stringify(C.map(c => {{ const b = build(c.shape, c.eq, c.S, c.P, 0.25);
  const rp = repeats(b.partials); return {{ r: b.partials.map(p => p.ratio), a: b.partials.map(p => p.a), rep: rp }}; }})));""")


def independent(eq, shape, S, Pk, sigma=0.25):
    out = []
    if shape == "line":
        for n in range(1, 60):
            out.append((np.pi * n, 2 * np.sin(n * np.pi * S) * np.sin(n * np.pi * Pk)))
    elif shape == "square":
        for m in range(1, 40):
            for n in range(1, 40):
                out.append((np.pi * np.hypot(m, n), 4 * np.sin(m * np.pi * S[0]) * np.sin(n * np.pi * S[1])
                            * np.sin(m * np.pi * Pk[0]) * np.sin(n * np.pi * Pk[1])))
    else:
        for m in range(0, 60):
            for j in special.jn_zeros(m, 30):
                if j > 2.404825557695773 * 18 + 1e-9:
                    break
                # cos and sin twins added explicitly, each normalised by a numerical-quadrature-free closed form
                N2 = (np.pi if m == 0 else np.pi / 2) * special.jv(m + 1, j)**2
                twins = [np.cos] if m == 0 else [np.cos, np.sin]
                a = sum(special.jv(m, j * S[0]) * t(m * S[1]) * special.jv(m, j * Pk[0]) * t(m * Pk[1]) for t in twins) / N2
                out.append((j, a))
    k1 = min(k for k, _ in out)
    d = {}
    for k, a in out:
        kr = k / k1
        if kr > 18: continue
        ratio = kr if eq == "wave" else kr**2
        if 220 * ratio > 18000: continue
        key = round(ratio, 9)
        d[key] = d.get(key, 0) + a * np.exp(-(kr * sigma)**2 / 2)
    rs = np.array(sorted(d)); a = np.array([d[k] for k in rs])
    keep = np.abs(a) > 1e-5 * np.abs(a).max()
    return rs[keep], a[keep]


REP_WANT = {"string": 1.0, "box (a line)": 1.0, "square drum": None, "square box": 0.5,
            "round drum": None, "round box": None, "round drum, dead centre": None}
rep_ok = True
for c, out in zip(calls, res):
    rs, a = independent(c["eq"], c["shape"], c["S"], c["P"])
    jr, ja = np.array(out["r"]), np.array(out["a"])
    same_n = len(rs) == len(jr)
    er = np.max(np.abs(jr - rs)) if same_n else np.inf
    ea = np.max(np.abs(ja / np.abs(ja).max() - a / np.abs(a).max())) if same_n else np.inf
    # the ladder drum-checks.txt read from the sound: the strongest peaks, a subset of our partials
    want = DRUMWAV[c["name"]]
    miss = max(min(abs(jr - w)) for w in want)
    good = same_n and er < 1e-9 and ea < 1e-9 and miss < 2e-3
    ok_all &= good
    rp = out["rep"]
    rep_txt = f"repeats {220 * rp['rate']:.1f}/s" if rp else "never repeats"
    want_rep = REP_WANT[c["name"]]
    rok = (rp is None and want_rep is None) or (rp is not None and want_rep is not None and abs(rp["rate"] - want_rep) < 1e-9)
    rep_ok &= rok
    P(f"  {c['name']:24s} {len(jr):4d} partials · ratios diff {er:.0e} · loudness diff {ea:.0e} · drum.wav peaks found within {miss:.4f}"
      f" · {rep_txt}" + ("   PASS" if good else "   FAIL"))
P("== check 4: 'does it repeat?' gives drum.py's autocorrelation verdicts ==")
P("  string 220/s · box 220/s · square drum never · square box 110/s · round drum never · round box never · centre never"
  + ("   PASS" if rep_ok else "   FAIL"))
ok_all &= rep_ok

# ----------------------------------------------------------------------
P("== check 5: a rendered strike: pitch 220 cos(theta), damping ratio sin(theta) on every partial ==")
SR = 44100
from scipy.signal import hilbert


def fit_decay(y, sr):
    """a lone damped partial: slope of the log of its Hilbert envelope (edges and fades trimmed)."""
    env = np.abs(hilbert(y))
    t = np.arange(len(y)) / sr
    sel = (t > 0.01) & (t < t[-1] - 0.85) & (env > env.max() * 1e-3)
    return -np.polyfit(t[sel], np.log(env[sel]), 1)[0]


good5 = True
for (name, eq, shape, S), th in [(PRE[2], 0.1), (PRE[3], 0.03), (PRE[5], 0.3)]:
    c = next(c for c in calls if c["name"] == name)
    out = node(f"""const b = build('{shape}', '{eq}', {json.dumps(c['S'])}, {json.dumps(c['P'])}, 0.25);
const t0 = Date.now(); const y = render(b.partials, 220, {th}, {SR}); const ms = Date.now() - t0;
const loud = b.partials.map((p, i) => [Math.abs(p.a), i]).sort((u, v) => v[0] - u[0]).slice(0, 4).map(u => u[1]).sort((u, v) => u - v);
const lone = loud.map(i => Array.from(render([{{ ratio: b.partials[i].ratio, a: 1 }}], 220, {th}, {SR}, 1.5)));
console.log(JSON.stringify({{ ms, y: Array.from(y.slice(0, {SR})), r: loud.map(i => b.partials[i].ratio), lone }}));""")
    y = np.array(out["y"]); thr = np.radians(th)
    zetas = [fit_decay(np.array(l), SR) / (2 * np.pi * 220 * r) for r, l in zip(out["r"], out["lone"])]
    # the lone partials' pitch, and the full strike's lowest partial, from the spectrum
    def peak(x, lo, hi):
        Y = np.abs(np.fft.rfft(x * np.hanning(len(x)), 1 << 22)); fr = np.fft.rfftfreq(1 << 22, 1 / SR)
        band = (fr > lo) & (fr < hi); return fr[band][np.argmax(Y[band])]
    f_low = peak(y, 200, 240)
    f_lone = [peak(np.array(l)[:SR // 2], 220 * r * 0.98, 220 * r * 1.02) for r, l in zip(out["r"], out["lone"])]
    ferr = max(abs(f - 220 * r * np.cos(thr)) for f, r in zip(f_lone, out["r"]))
    g = all(abs(z / np.sin(thr) - 1) < 0.01 for z in zetas) and abs(f_low - 220 * np.cos(thr)) < 0.05 and ferr < 0.1
    good5 &= g
    P(f"  {name:12s} θ = {th:4}°: lowest partial in the strike {f_low:.3f} Hz (want {220 * np.cos(thr):.3f}) · the four loudest partials"
      f" ({', '.join(f'{r:.3f}' for r in out['r'])}) rendered alone: pitch within {ferr:.3f} Hz, damping ratios "
      + ", ".join(f"{z:.6f}" for z in zetas) + f" (want {np.sin(thr):.6f}) · whole strike rendered in {out['ms']} ms"
      + ("   PASS" if g else "   FAIL"))
ok_all &= good5
P("  ALL PASS" if ok_all else "  SOMETHING FAILED")
open(os.path.join(HERE, "instrument-checks.txt"), "w").write("\n".join(lines) + "\n")
