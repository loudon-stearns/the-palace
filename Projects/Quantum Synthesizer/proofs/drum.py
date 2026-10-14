#!/usr/bin/env python3
"""
Drum — is it the circle, or the second dimension?
=================================================
The entry's last unchecked claim, tested with sound:

  "a struck bell or tam-tam has a potential landscape determined by its shape
   (circular membrane, thick walls). This produces Bessel function modes with
   inharmonic spacing. The sound is inharmonic not because the bell is
   'imperfect,' but because the geometry of circular resonators forces
   inharmonic eigenmodes."

Six instruments, one table: three shapes (a line, a square, a circle) under the
two equations the entry already plays against each other.

                 wave equation (string / drum)     Schrodinger (box)
  pitch rule     f grows WITH k                    f grows with k SQUARED
  line           string   1 2 3 4                  box      1 4 9 16
  square         drum     sqrt(m^2+n^2)            box      m^2+n^2
  circle         drum     Bessel zeros j_mn        box      j_mn^2

Same walls (hard, Dirichlet), same felt mallet (partial amplitude rolled off by
exp(-(k/k1)^2 sigma^2/2), sigma = 0.25), same pickup rule (mode shape at the
strike times mode shape at the pickup), same constant-Q damping for every
partial (ratio 0.0005, the turned-i bell from wick.py at about 0.03 deg). The
lowest partial of every instrument is 220 Hz. The only thing that changes is
the ladder. Plus a seventh strike: the round drum hit dead centre.

Checks (drum-checks.txt):
  1 the Bessel zeros the circle uses agree with an independent radial
    finite-difference solve of the drum equation, m = 0..3, three zeros each
  2 an independent 2D finite-difference solve on a square grid cut to a disk
    finds the same first 12 eigenvalues, with the same pairs (cos / sin twins)
  3 from the SOUND of each strike, the strongest spectral peaks land on the
    predicted partials, and their ratios are the ladder in the table
  4 which tones repeat: the autocorrelation of each sound, scanned over
    1-60 ms. A periodic tone comes back to 1.0000; an inharmonic one never does.

Writes beside this script: drum.wav, drum.mp4, drum-poster.png, drum-checks.txt
Run with /usr/local/bin/python3 (numpy + scipy + matplotlib) and ffmpeg.
"""
import os, io, sys, subprocess, wave
import numpy as np
from scipy import special
import scipy.sparse as sp
from scipy.sparse.linalg import eigsh
from scipy.linalg import eigh_tridiagonal
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager

HERE = os.path.dirname(os.path.abspath(__file__))
SR, FPS = 44100, 30
F1 = 220.0
ZETA = 0.0005
SIGMA = 0.25
FMAX = 18000.0
KREL_MAX = 18.0
LOG = io.StringIO()


def say(*a):
    s = " ".join(str(x) for x in a)
    print(s); LOG.write(s + "\n")


# ======================================================================
# the modes of each shape: wavenumber k, shape function, norm
# ======================================================================
def line_modes():
    n = np.arange(1, 60)
    return [dict(k=np.pi * j, kind="line", n=j) for j in n]


def square_modes():
    out = []
    for m in range(1, 40):
        for n in range(1, 40):
            out.append(dict(k=np.pi * np.hypot(m, n), kind="square", m=m, n=n))
    return out


JZ = {m: special.jn_zeros(m, 30) for m in range(0, 60)}


def disk_modes():
    out = []
    for m in range(0, 60):
        for i, j in enumerate(JZ[m]):
            out.append(dict(k=j, kind="disk", m=m, n=i + 1, trig="cos"))
            if m > 0:
                out.append(dict(k=j, kind="disk", m=m, n=i + 1, trig="sin"))
    return out


def shape(md, P):
    """mode shape at points P (line: x array; square: (x, y); disk: (r, phi)), unit-normalised."""
    if md["kind"] == "line":
        return np.sqrt(2) * np.sin(md["n"] * np.pi * P)
    if md["kind"] == "square":
        x, y = P
        return 2 * np.sin(md["m"] * np.pi * x) * np.sin(md["n"] * np.pi * y)
    r, ph = P
    m, j = md["m"], md["k"]
    ang = np.cos(m * ph) if md["trig"] == "cos" else np.sin(m * ph)
    N = np.sqrt(np.pi) * abs(special.jv(m + 1, j))            # integral over the unit disk of J_m^2 cos^2 = pi J_{m+1}^2
    return special.jv(m, j * r) * ang / N * np.where(r <= 1, 1.0, 0.0)


SHAPES = {"line": (line_modes(), 0.23, 0.37),
          "square": (square_modes(), (0.23, 0.31), (0.37, 0.71)),
          "disk": (disk_modes(), (0.42, 0.3), (0.63, 2.2)),
          "disk-centre": (None, (0.0, 0.0), (0.63, 2.2))}

INSTR = [  # key, shape, equation, name
    ("string", "line", "wave", "string"),
    ("box", "line", "schr", "box (Schrödinger, a line)"),
    ("sqdrum", "square", "wave", "square drum"),
    ("sqbox", "square", "schr", "square box (Schrödinger)"),
    ("rddrum", "disk", "wave", "round drum"),
    ("rdbox", "disk", "schr", "round box (Schrödinger)"),
    ("centre", "disk-centre", "wave", "round drum, struck dead centre"),
]


def build(shp, eq):
    modes, S, Pk = SHAPES[shp]
    if modes is None:
        modes = SHAPES["disk"][0]
    k1 = min(md["k"] for md in modes)
    out = []
    for md in modes:
        kr = md["k"] / k1
        if kr > KREL_MAX:
            continue
        f = F1 * (kr if eq == "wave" else kr**2)
        if f > FMAX:
            continue
        c = float(shape(md, np.array(S) if shp != "line" else S)) * np.exp(-(kr * SIGMA)**2 / 2)
        a = c * float(shape(md, np.array(Pk) if shp != "line" else Pk))
        out.append(dict(md, kr=kr, f=f, c=c, a=a))
    A = max(abs(o["a"]) for o in out)
    out = [o for o in out if abs(o["a"]) > 1e-5 * A or abs(o["c"]) > 1e-5]
    return out


MODES = {key: build(shp, eq) for key, shp, eq, _ in INSTR}
ok = True

# ======================================================================
say("== check 1: Bessel zeros vs an independent radial finite-difference solve of the drum equation ==")
NR = 6000
h = 1.0 / NR
ri = (np.arange(NR) + 0.5) * h
rf = np.arange(NR + 1) * h                       # faces; rf[0] = 0 closes the centre
for m in range(4):
    # -(1/r)(r u')' + m^2/r^2 u = lam u, u(1) = 0 (ghost u_{N} = -u_{N-1}), symmetrised by sqrt(r)
    main = (rf[1:] + rf[:-1]) / h**2 + m**2 / ri
    main[-1] += rf[-1] / h**2                    # Dirichlet ghost at the rim
    off = -rf[1:-1] / h**2
    w = np.sqrt(ri)
    d = main / ri
    e = off / (w[1:] * w[:-1])
    lam = eigh_tridiagonal(d, e, select="i", select_range=(0, 2), eigvals_only=True)
    got = np.sqrt(lam); want = JZ[m][:3]
    err = np.max(np.abs(got / want - 1))
    good = err < 1e-4
    ok &= good
    say(f"  m = {m}   FD: " + ", ".join(f"{g:.5f}" for g in got) + "   Bessel zeros: "
        + ", ".join(f"{w_:.5f}" for w_ in want) + f"   max rel err {err:.1e}" + ("   PASS" if good else "   FAIL"))

# ======================================================================
say("== check 2: 2D finite differences on a square grid cut to a disk: same first 12 levels, same pairs ==")
G = 241
xs_ = np.linspace(-1, 1, G); hh = xs_[1] - xs_[0]
X, Y = np.meshgrid(xs_, xs_, indexing="ij")
inside = (X**2 + Y**2) < 1 - 1e-12
idx = -np.ones(inside.shape, int); idx[inside] = np.arange(inside.sum())
rows_, cols_, vals_ = [], [], []
for (i, j) in zip(*np.nonzero(inside)):
    p = idx[i, j]
    rows_.append(p); cols_.append(p); vals_.append(4 / hh**2)
    for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        q = idx[i + di, j + dj]
        if q >= 0:
            rows_.append(p); cols_.append(q); vals_.append(-1 / hh**2)
L = sp.csr_matrix((vals_, (rows_, cols_)), shape=(inside.sum(),) * 2)
lam2 = np.sort(eigsh(L, k=12, sigma=0, which="LM", return_eigenvectors=False))
ref = np.sort(np.array([md["k"] for md in SHAPES["disk"][0]]))[:12]**2
r_fd, r_b = np.sqrt(lam2 / lam2[0]), np.sqrt(ref / ref[0])
err2 = np.max(np.abs(r_fd / r_b - 1))
pairs_fd = np.sum(np.abs(np.diff(lam2) / lam2[1:]) < 2e-3)
pairs_b = np.sum(np.abs(np.diff(ref)) < 1e-9)
good = err2 < 0.01 and pairs_fd == pairs_b
ok &= good
say(f"  grid {G}x{G}, {inside.sum()} points inside")
say("  pitch ratios, grid:   " + ", ".join(f"{v:.3f}" for v in r_fd))
say("  pitch ratios, Bessel: " + ", ".join(f"{v:.3f}" for v in r_b))
say(f"  max rel err {err2:.1e} (the grid's staircase rim)   twin pairs: grid {pairs_fd}, Bessel {pairs_b}"
    + ("   PASS" if good else "   FAIL"))

# ======================================================================
# audio
# ======================================================================
SEGDUR, GAP = 2.6, 0.4


def render(key, dur, zeta=ZETA):
    t = np.arange(int(dur * SR)) / SR
    x = np.zeros_like(t)
    for o in MODES[key]:
        w = 2 * np.pi * o["f"]
        x += o["a"] * np.cos(w * t) * np.exp(-zeta * w * t)
    return x


def fade(x, a_ms=2, r_ms=60):
    a = int(a_ms * SR / 1000); r = int(r_ms * SR / 1000)
    x = x.copy(); x[:a] *= np.linspace(0, 1, a); x[-r:] *= np.linspace(1, 0, r); return x


SEG, chunks, tc = [], [np.zeros(int(0.3 * SR))], 0.3
for key, shp, eq, name in INSTR:
    s = render(key, SEGDUR)
    s = fade(0.5 * s / np.max(np.abs(s)))
    SEG.append(dict(key=key, shp=shp, eq=eq, name=name, t0=tc, t1=tc + SEGDUR, sig=s))
    chunks += [s, np.zeros(int(GAP * SR))]; tc += SEGDUR + GAP
audio = np.concatenate(chunks)
TOTAL = len(audio) / SR
WAV = os.path.join(HERE, "drum.wav")
with wave.open(WAV, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())

# ======================================================================
say("== check 3: from the SOUND of each strike, the strongest peaks sit on the predicted partials ==")
LADDER = {}
for sg in SEG:
    x = sg["sig"][:int(2.0 * SR)]
    nfft = 1 << 20
    X_ = np.abs(np.fft.rfft(x * np.hanning(len(x)), nfft))
    fr = np.arange(len(X_)) * SR / nfft
    dB = 20 * np.log10(X_ / X_.max() + 1e-12)
    pk = np.nonzero((dB[1:-1] > dB[:-2]) & (dB[1:-1] >= dB[2:]) & (dB[1:-1] > -50))[0] + 1
    # a real partial is the loudest thing within +-4 Hz (drops the window's side lobes)
    nb = int(4 * nfft / SR)
    pk = np.array([p for p in pk if dB[p] >= dB[max(p - nb, 0):p + nb + 1].max()])
    # parabolic refine
    a_, b_, c_ = dB[pk - 1], dB[pk], dB[pk + 1]
    fpk = (pk + 0.5 * (a_ - c_) / (a_ - 2 * b_ + c_)) * SR / nfft
    strongest = fpk[np.argsort(-dB[pk])][:6]
    strongest.sort()
    pred = np.unique(np.round([o["f"] for o in MODES[sg["key"]]], 6))
    miss = np.array([np.min(np.abs(pred - f)) for f in strongest])
    good = np.all(miss < 0.5)
    ok &= good
    lad = strongest / F1
    LADDER[sg["key"]] = lad
    say(f"  {sg['name']:32s} peaks ÷ 220 Hz: " + "  ".join(f"{v:.3f}" for v in lad)
        + f"   worst miss {miss.max():.3f} Hz" + ("   PASS" if good else "   FAIL"))

# ======================================================================
say("== check 4: which tones repeat? autocorrelation of each sound, scanned 1-60 ms ==")
PER = {}
T = np.arange(1e-3, 60e-3, 1e-6)
want_periodic = {"string": True, "box": True, "sqdrum": False, "sqbox": True, "rddrum": False, "rdbox": False, "centre": False}
for key, shp, eq, name in INSTR:
    f = np.array([o["f"] for o in MODES[key]]); a2 = np.array([o["a"] for o in MODES[key]])**2
    # merge twins first (same frequency adds amplitudes, not powers)
    uf, inv = np.unique(np.round(f, 6), return_inverse=True)
    amp = np.zeros(len(uf)); np.add.at(amp, inv, np.array([o["a"] for o in MODES[key]]))
    R = np.zeros_like(T)
    for fi, ai in zip(uf, amp):
        R += ai**2 * np.cos(2 * np.pi * fi * T)
    R /= np.sum(amp**2)
    hit = np.nonzero(R > 0.9999)[0]
    j = hit[0] + int(np.argmax(R[hit[0]:hit[0] + 200])) if len(hit) else np.argmax(R)   # top of the FIRST return
    periodic = R[j] > 0.9999
    good = periodic == want_periodic[key]
    ok &= good
    PER[key] = (R[j], T[j], periodic)
    say(f"  {name:32s} best return {R[j]:.5f} at {T[j] * 1e3:7.3f} ms"
        + (f"  → repeats {1 / T[j]:.1f} times a second" if periodic else "  → never repeats")
        + ("   PASS" if good else "   FAIL"))
say("  ALL PASS" if ok else "  SOME FAIL")
say(f"wrote drum.wav ({TOTAL:.1f} s): " + " · ".join(s["name"] for s in SEG))
for key, shp, eq, name in INSTR:
    say(f"  {name:32s} {len(MODES[key]):4d} modes in the render")

# ======================================================================
# picture
# ======================================================================
for p in ("~/Library/Fonts/JetBrainsMono-Regular.ttf", "~/Library/Fonts/CormorantGaramond[wght].ttf"):
    p = os.path.expanduser(p)
    if os.path.exists(p):
        font_manager.fontManager.addfont(p)
MONO = "JetBrains Mono" if any(f.name == "JetBrains Mono" for f in font_manager.fontManager.ttflist) else "monospace"
SERIF = "Cormorant Garamond" if any(f.name == "Cormorant Garamond" for f in font_manager.fontManager.ttflist) else "serif"
BG, EL1, BORDER = "#0a0a0f", "#12121a", "#4a4a5e"
FG1, FG2, FG3, FG4 = "#e8e8f0", "#c8c8d8", "#8a8aa0", "#4a4a5a"
ACC, INFO, OK, BAD = "#e8b84a", "#4a8fff", "#6fcf8f", "#e06a6a"
plt.rcParams.update({"font.family": [MONO, "DejaVu Sans Mono"], "text.color": FG2, "axes.labelcolor": FG3,
                     "xtick.color": FG3, "ytick.color": FG3, "axes.edgecolor": BORDER,
                     "axes.facecolor": EL1, "figure.facecolor": BG, "font.size": 10})


def style(ax):
    for sp_ in ax.spines.values():
        sp_.set_color(BORDER)
    ax.tick_params(length=3)


def ladder(ax, key, xmax=10):
    style(ax)
    val, Tb, periodic = PER[key]
    f = np.array([o["f"] for o in MODES[key]]) / F1
    uf, inv = np.unique(np.round(f, 6), return_inverse=True)
    amp = np.zeros(len(uf)); np.add.at(amp, inv, np.array([o["a"] for o in MODES[key]]))
    dB = 20 * np.log10(np.abs(amp) / np.abs(amp).max() + 1e-12)
    keep = (uf <= xmax) & (dB > -60)
    if periodic:
        step = 1 / (Tb * F1)
        for g in np.arange(step, xmax + 1e-9, step):
            ax.axvline(g, color=OK, lw=0.6, alpha=0.35)
    else:
        for g in range(1, xmax + 1):
            ax.axvline(g, color=FG4, lw=0.6, ls=":")
    ax.vlines(uf[keep], -60, dB[keep], color=ACC, lw=1.6)
    ax.plot(uf[keep], dB[keep], "o", color=ACC, ms=3)
    ax.set_xlim(0, xmax + 0.3); ax.set_ylim(-60, 4)
    ax.set_yticks([]); ax.set_xticks(range(0, xmax + 1))
    word = (f"repeats {1 / Tb:.0f}×/s" if periodic else f"never repeats (best return {val:.2f})")
    ax.text(0.98, 0.92, word, transform=ax.transAxes, ha="right", fontsize=9, color=OK if periodic else BAD)


fig, axs = plt.subplots(2, 3, figsize=(16, 7.4))
fig.subplots_adjust(left=0.09, right=0.98, top=0.81, bottom=0.15, hspace=0.42, wspace=0.12)
fig.text(0.04, 0.94, "Is it the circle, or the second dimension?", fontsize=26,
         family=[SERIF, "DejaVu Serif"], color=FG1)
fig.text(0.04, 0.865, "Same walls, same mallet, same damping, lowest partial 220 Hz in every cell · stems: partials in units of the lowest, height in dB\n"
         "green lines: multiples of the rate the tone repeats at · dotted: whole numbers, for reference only", fontsize=9.5, color=FG3)
COLS = [("line", "a line"), ("square", "a square"), ("disk", "a circle")]
ROWS = [("wave", "wave equation\n(string · drum)\npitch ∝ k"), ("schr", "Schrödinger\n(box)\npitch ∝ k²")]
KEYS = {("wave", "line"): "string", ("schr", "line"): "box", ("wave", "square"): "sqdrum",
        ("schr", "square"): "sqbox", ("wave", "disk"): "rddrum", ("schr", "disk"): "rdbox"}
for i, (eq, rl) in enumerate(ROWS):
    for j, (shp, cl) in enumerate(COLS):
        ax = axs[i, j]
        ladder(ax, KEYS[(eq, shp)])
        lad = np.unique(np.round([o["f"] / F1 for o in MODES[KEYS[(eq, shp)]]], 6))
        ax.set_title(f"{cl}  ·  " + " · ".join(f"{v:.2f}" for v in lad[:5]), fontsize=10, color=FG2, loc="left")
        if j == 0:
            ax.text(-0.2, 0.5, rl, transform=ax.transAxes, ha="center", va="center", fontsize=10, color=FG1)
        if i == 1:
            ax.set_xlabel("partial ÷ lowest partial")
fig.text(0.04, 0.02, "The drums break the harmonic series in both shapes: for a drum, it is the second dimension that does it.\n"
         "Schrödinger squares the square's roots back into whole numbers (it repeats, an octave below its lowest partial). "
         "Only the circle stays inharmonic under both rules.", fontsize=10, color=ACC)
fig.savefig(os.path.join(HERE, "drum-poster.png"), facecolor=BG, dpi=90); plt.close(fig)
say("wrote drum-poster.png")

# ---- video ----
GRID = 121
gx = np.linspace(0, 1, GRID)
SQX, SQY = np.meshgrid(gx, gx, indexing="ij")
dx_ = np.linspace(-1, 1, GRID)
DX, DY = np.meshgrid(dx_, dx_, indexing="ij")
DR, DPH = np.hypot(DX, DY), np.arctan2(DY, DX)
LX = np.linspace(0, 1, 400)


def field_basis(key, shp):
    md = MODES[key]
    keep = [o for o in md if abs(o["c"]) > 1e-4]
    if shp == "line":
        B = np.array([shape(o, LX) for o in keep])
    elif shp == "square":
        B = np.array([shape(o, (SQX, SQY)) for o in keep])
    else:
        B = np.array([shape(o, (DR, DPH)) for o in keep])
    return np.array([o["c"] for o in keep]), np.array([o["f"] for o in keep]), B


from matplotlib.colors import LinearSegmentedColormap
DIV = LinearSegmentedColormap.from_list("div", [INFO, EL1, ACC])
DIV.set_bad(BG)
W_PX, H_PX = 1280, 720
fig = plt.figure(figsize=(W_PX / 100, H_PX / 100), dpi=100)
ax_x = fig.add_axes([0.03, 0.22, 0.27, 0.52])
ax_l = fig.add_axes([0.34, 0.50, 0.30, 0.24])
ax_w = fig.add_axes([0.34, 0.22, 0.30, 0.20])
ax_f = fig.add_axes([0.68, 0.22, 0.29, 0.52])
ax_t = fig.add_axes([0.03, 0.06, 0.94, 0.07])
for a in (ax_x, ax_l, ax_w, ax_f, ax_t):
    style(a)
t_title = fig.text(0.03, 0.89, "", fontsize=24, family=[SERIF, "DejaVu Serif"], color=FG1)
t_sub = fig.text(0.03, 0.83, "", fontsize=11, color=ACC)
fig.text(0.03, 0.755, "the struck surface, slowed", fontsize=9, color=FG3)
fig.text(0.34, 0.755, "the ladder: partials ÷ lowest, dB", fontsize=9, color=FG3)
fig.text(0.34, 0.435, "what you hear", fontsize=9, color=FG3)
fig.text(0.68, 0.755, "spectrogram of this strike · playhead", fontsize=9, color=FG3)
for sg in SEG:
    ax_t.axvspan(sg["t0"], sg["t1"], color=FG4 if sg["eq"] == "wave" else ACC, alpha=0.35, lw=0)
    ax_t.text(sg["t0"], 1.12, sg["name"].split(" (")[0], transform=ax_t.get_xaxis_transform(), fontsize=7.5, color=FG2)
ax_t.set_xlim(0, TOTAL); ax_t.set_yticks([])
ax_t.set_xlabel("seconds · grey: wave equation (string, drums) · gold: Schrödinger (boxes)")
head = ax_t.axvline(0, color=FG1, lw=1.4)


def spec_img(sig):
    nfft, hop = 2048, 128
    w = np.hanning(nfft)
    fr = [np.abs(np.fft.rfft(sig[i:i + nfft] * w)) for i in range(0, len(sig) - nfft, hop)]
    S = 20 * np.log10(np.array(fr).T + 1e-9)
    return S - S.max()


SUB = {"string": "1 · 2 · 3 · 4 — the harmonic series; the tone repeats 220 times a second",
       "box": "1 · 4 · 9 · 16 — the squares; still whole numbers, still repeats",
       "sqdrum": "1 · 1.58 · 2 · 2.24 · 2.55 — square roots of whole numbers; never repeats",
       "sqbox": "squared back to whole numbers: repeats 110 times a second, an octave under its lowest partial",
       "rddrum": "1 · 1.59 · 2.14 · 2.30 · 2.65 — the Bessel zeros; never repeats",
       "rdbox": "the Bessel zeros squared; still never repeats — here the circle really is the cause",
       "centre": "struck at the centre only the round rings sound: 1 · 2.30 · 3.60 · 4.90"}
MP4 = os.path.join(HERE, "drum.mp4")
cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
       "-s", f"{W_PX}x{H_PX}", "-r", str(FPS), "-i", "-", "-i", WAV,
       "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23", "-preset", "medium",
       "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", MP4]
proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
n_frames = int(TOTAL * FPS)
cur, img, line, whead, fhead, basis = None, None, None, None, None, None
for jf in range(n_frames):
    tt = jf / FPS
    sg = next((s for s in SEG if s["t0"] - 0.3 <= tt < s["t1"] + GAP), SEG[-1])
    if sg["key"] != cur:
        cur = sg["key"]
        shp = sg["shp"] if sg["shp"] != "disk-centre" else "disk"
        basis = field_basis(cur, shp)
        ax_x.cla(); style(ax_x); ax_x.set_xticks([]); ax_x.set_yticks([])
        if shp == "line":
            line, = ax_x.plot([], [], color=INFO, lw=1.8)
            ax_x.set_xlim(0, 1); ax_x.set_ylim(-1.1, 1.1); img = None
        else:
            img = ax_x.imshow(np.zeros((GRID, GRID)), origin="lower", cmap=DIV, vmin=-1, vmax=1,
                              extent=[0, 1, 0, 1] if shp == "square" else [-1, 1, -1, 1], interpolation="bilinear")
            if shp == "disk":
                th_ = np.linspace(0, 2 * np.pi, 200); ax_x.plot(np.cos(th_), np.sin(th_), color=FG3, lw=0.8)
            ax_x.set_aspect("equal")
        ax_l.cla(); ladder(ax_l, cur)
        ax_w.cla(); style(ax_w); tw = np.arange(len(sg["sig"])) / SR
        ax_w.plot(tw, sg["sig"], color=FG2 if sg["eq"] == "wave" else ACC, lw=0.3)
        ax_w.set_xlim(0, SEGDUR); ax_w.set_ylim(-0.55, 0.55); ax_w.set_yticks([])
        whead = ax_w.axvline(0, color=FG1, lw=1)
        ax_f.cla(); style(ax_f)
        ax_f.imshow(spec_img(sg["sig"]), origin="lower", aspect="auto", cmap="magma", vmin=-70, vmax=0,
                    extent=[0, SEGDUR, 0, SR / 2 / 1000])
        ax_f.set_ylim(0, 10); ax_f.set_ylabel("kHz"); ax_f.set_xlabel("s")
        fhead = ax_f.axvline(0, color=FG1, lw=1)
        t_title.set_text(sg["name"])
        t_sub.set_text(SUB[cur])
        scale = None
    loc = min(max(tt - sg["t0"], 0), SEGDUR)
    c, f, B = basis
    ph = (f / F1) * 2 * np.pi * loc / 1.5
    amp = c * np.cos(ph) * np.exp(-ZETA * 2 * np.pi * f * loc)     # the same decay the audio has at this instant
    u = np.tensordot(amp, B, axes=1)
    scale = np.max(np.abs(u)) + 1e-12                               # shape, not loudness: renormalised every frame
    if shp == "disk":
        u = np.where(DR <= 1, u, np.nan)
    if img is None:
        line.set_data(LX, u / scale)
    else:
        img.set_data((u / scale).T)
    whead.set_xdata([loc, loc]); fhead.set_xdata([loc, loc]); head.set_xdata([tt, tt])
    fig.canvas.draw()
    proc.stdin.write(np.asarray(fig.canvas.buffer_rgba())[:, :, :3].tobytes())
proc.stdin.close(); proc.wait()
say(f"wrote drum.mp4 ({n_frames} frames)")

with open(os.path.join(HERE, "drum-checks.txt"), "w") as fh:
    fh.write(LOG.getvalue())
sys.exit(0 if ok else 1)
