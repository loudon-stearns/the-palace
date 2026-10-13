#!/usr/bin/env python3
"""
Walls — boundary conditions as harmonic content
===============================================
The forward vector of [[Quantum Synthesizer]] names two tests: potential
shape as anharmonicity (cycles 3-7, the timbre atlas) and boundary
conditions as harmonic content. This script runs the second one.

Same box, length L = 1. Nothing inside it. Only the walls change.

  1. string, fixed ends      the ordinary wave equation, for comparison.
                             Partials 1, 2, 3, 4 ... the harmonic series.
  2. box, hard walls         the Schrodinger equation, same box, same sine
                             shapes, same pluck, same pickup. Partials
                             1, 4, 9, 16 ... the squares.
  3. box, free walls         the wave may lean on the wall but not pass it.
                             Different shapes (cosines), the SAME pitches
                             as hard walls, plus one silent level at zero.
  4. box, one hard, one free odd squares, two octaves down: 1, 9, 25, 49
                             in quarter units. Half the partials vanish.
  5. ring                    the ends joined (circumference 2L, so the
                             pitches match the box). Every level is a pair.
                             A tiny bump splits each pair and they beat —
                             the same thing that makes a real bell warble.
  6. soft walls              the walls lowered to a finite height. Every
                             level sags flat (420-510 cents), and past the rim
                             there are no more partials: a ceiling.

The finding the string-vs-box pair makes plain: the walls pick the SHAPES
(sines, cosines, half-sines), but it is the equation that turns shapes into
pitches. The wave equation's frequency grows with the number of wiggles;
the Schrodinger equation's grows with its square. So "boundary conditions
are harmonic content" is half true: walls decide which partials exist and
how loud a pickup hears them; the equation decides where they sit.

One ruler for every segment: the hard-wall box's lowest level = A3, 220 Hz,
   f = 220 Hz * E / E_ref,   E_ref = pi^2 / 2
and every segment uses the same pluck (a narrow bump at x = 0.23) and the
same pickup (x = 0.37), so the loudness of each partial is
   a_n = <pluck | phi_n> * phi_n(pickup)
— the walls change that too, which you can hear.

Writes beside this script:
  walls.wav          six strikes
  walls.mp4          the same audio with the picture locked to it, 1280x720, 30 fps
  walls-poster.png   the six boxes as one still
and prints the checks (solver vs exact levels, FFT peaks vs intended, ring beats).

numpy + scipy + matplotlib + ffmpeg.
"""
import os, subprocess, wave
import numpy as np
from scipy.linalg import eigh
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager

HERE = os.path.dirname(os.path.abspath(__file__))
SR, FPS = 44100, 30
F0 = 220.0
E_REF = np.pi**2 / 2
F_MAX = 15000.0
N = 1200                      # grid cells across the box
X_PLUCK, W_PLUCK, X_PICK = 0.23, 0.03, 0.37
K = 14                        # levels to solve


def lap(n, dx, left, right, periodic=False):
    """Cell-centred second difference with ghost-point walls.
    'fixed' : psi = 0 at the wall (ghost = -inside) -> diag -3
    'free'  : psi' = 0 at the wall (ghost = +inside) -> diag -1"""
    D = (np.diag(-2 * np.ones(n)) + np.diag(np.ones(n - 1), 1) + np.diag(np.ones(n - 1), -1))
    if periodic:
        D[0, -1] = D[-1, 0] = 1
    else:
        D[0, 0] = -3 if left == "fixed" else -1
        D[-1, -1] = -3 if right == "fixed" else -1
    return D / dx**2


def solve_box(left, right, length=1.0, V=None, periodic=False):
    dx = length / N
    x = (np.arange(N) + 0.5) * dx
    H = -0.5 * lap(N, dx, left, right, periodic)
    if V is not None:
        H += np.diag(V(x))
    E, U = eigh(H, subset_by_index=(0, K - 1))
    U = U / np.sqrt(dx)
    return x, E, U


def solve_soft(V0):
    """Finite well: V = 0 on [0,1], V0 outside, hard edges far away."""
    lo, hi, n = -0.6, 1.6, int(2.2 * N)
    dx = (hi - lo) / n
    x = lo + (np.arange(n) + 0.5) * dx
    V = np.where((x >= 0) & (x <= 1), 0.0, V0)
    H = -0.5 * lap(n, dx, "fixed", "fixed") + np.diag(V)
    E, U = eigh(H, subset_by_index=(0, K - 1))
    keep = E < V0
    return x, E[keep], U[:, keep] / np.sqrt(dx), V


def pluck(x):
    p = np.exp(-(x - X_PLUCK)**2 / (2 * W_PLUCK**2))
    return p


def amps(x, U):
    dx = x[1] - x[0]
    c = U.T @ pluck(x) * dx
    ip = int(np.argmin(np.abs(x - X_PICK)))
    return c * U[ip]


SEGS = []

# 1 + 2: the box with hard walls; the string shares its shapes and its pluck
x, E, U = solve_box("fixed", "fixed")
a = amps(x, U)
n = np.arange(1, K + 1)
SEGS.append(dict(key="string", name="A string, fixed ends", tag="the wave equation",
                 x=x, U=U, levels=n.astype(float), f=F0 * n, a=a, walls=("fixed", "fixed"),
                 sym="∂²y/∂t² = c² ∂²y/∂x²", words="acceleration = tension × curvature",
                 line="The one you know. One more wiggle, one more step up: 1, 2, 3, 4."))
SEGS.append(dict(key="hard", name="Box, hard walls", tag="squares",
                 x=x, U=U, levels=E / E_REF, f=F0 * E / E_REF, a=a, walls=("fixed", "fixed"),
                 sym="iħ ∂ψ/∂t = −(ħ²/2m) ∂²ψ/∂x²", words="i × ħ × rate of change = −(ħ²/2m) × curvature",
                 line="Same shapes, same pluck. Schrödinger squares the steps: 1, 4, 9, 16."))
E_HARD = E.copy()

x, E, U = solve_box("free", "free")
SEGS.append(dict(key="free", name="Box, free walls", tag="same pitches",
                 x=x, U=U, levels=E / E_REF, f=F0 * E / E_REF, a=amps(x, U), walls=("free", "free"),
                 sym="ψ′ = 0 at both walls", words="slope of ψ = 0 at both walls",
                 line="Cosines instead of sines. The pitches don't move; the loudness does."))
E_FREE = E.copy()

x, E, U = solve_box("fixed", "free")
SEGS.append(dict(key="mixed", name="Box, one hard wall, one free", tag="odd squares",
                 x=x, U=U, levels=E / E_REF, f=F0 * E / E_REF, a=amps(x, U), walls=("fixed", "free"),
                 sym="ψ = 0 left,  ψ′ = 0 right", words="ψ = 0 at the left wall, slope = 0 at the right",
                 line="Quarter-waves. Two octaves down, and only the odd squares: 1, 9, 25, 49."))
E_MIXED = E.copy()

BUMP_H, BUMP_X, BUMP_W = 0.9, 0.5, 0.02
x, E, U = solve_box(None, None, length=2.0, periodic=True,
                    V=lambda x: BUMP_H * np.exp(-(x - BUMP_X)**2 / (2 * BUMP_W**2)))
SEGS.append(dict(key="ring", name="A ring", tag="pairs",
                 x=x, U=U, levels=E / E_REF, f=F0 * E / E_REF, a=amps(x, U), walls=("ring", "ring"),
                 sym="ψ(0) = ψ(2L),  plus a small bump", words="the two ends are the same place",
                 line="No walls at all. Every level doubles; a tiny bump splits each pair, and it beats."))
E_RING = E.copy()

V0 = 120.0
x, E, U, Vsoft = solve_soft(V0)
SEGS.append(dict(key="soft", name="Box, soft walls", tag="ceiling",
                 x=x, U=U, levels=E / E_REF, f=F0 * E / E_REF, a=amps(x, U), walls=("soft", "soft"),
                 V=Vsoft, V0=V0,
                 sym=f"V = 0 inside,  V = {V0:.0f} outside", words="walls of finite height",
                 line=f"Lower the walls. Every level sags a major third flat; past the rim, only {E.size} partials."))
E_SOFT = E.copy()

for s in SEGS:
    keep = (s["f"] > 1.0) & (s["f"] < F_MAX)          # free walls' zero level is silent: drop it
    s["keep"] = keep

# ======================================================================
# audio
# ======================================================================
SEG_T = {"ring": 7.0}
DEF_T = 4.5


def tau(k):
    return 2.4 / (1 + 0.25 * k)


def strike(s):
    dur = SEG_T.get(s["key"], DEF_T)
    nn = int(dur * SR)
    t = np.arange(nn) / SR
    out = np.zeros(nn)
    for k, (fk, ak) in enumerate(zip(s["f"][s["keep"]], s["a"][s["keep"]])):
        env = np.exp(-t / (tau(k) * (1.8 if s["key"] == "ring" else 1.0))) * np.minimum(t / 0.004, 1.0)
        out += ak * env * np.sin(2 * np.pi * fk * t)
    return out * np.minimum((nn - np.arange(nn)) / (0.04 * SR), 1.0)


parts = [strike(s) for s in SEGS]
g = 0.85 / max(np.abs(p).max() for p in parts)       # ONE gain: loudness is evidence
parts = [p * g for p in parts]
STARTS = np.cumsum([0] + [p.size / SR for p in parts])
audio = np.concatenate(parts)
TOTAL = audio.size / SR

WAV = os.path.join(HERE, "walls.wav")
with wave.open(WAV, "wb") as wv:
    wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())

# ======================================================================
# checks
# ======================================================================
print("== checks ==")
nn = np.arange(1, 9)
print(f"  hard   E/E_ref {np.round(E_HARD[:8] / E_REF, 4)}  exact n^2; worst {np.max(np.abs(E_HARD[:8] / E_REF - nn**2)):.4f}")
print(f"  free   E/E_ref {np.round(E_FREE[:8] / E_REF, 4)}  exact (n-1)^2; worst {np.max(np.abs(E_FREE[:8] / E_REF - (nn - 1)**2)):.4f}")
print(f"  mixed  E/E_ref {np.round(E_MIXED[:8] / E_REF, 4)}  exact (2n-1)^2/4; worst {np.max(np.abs(E_MIXED[:8] / E_REF - (2 * nn - 1)**2 / 4)):.4f}")
print(f"  ring   E/E_ref {np.round(E_RING[:9] / E_REF, 4)}")
pairs = (E_RING[2::2][:5] - E_RING[1::2][:5]) / E_REF * F0
print(f"  ring   beat of each pair (Hz): {np.round(pairs, 2)}")
print(f"  soft   E/E_ref {np.round(E_SOFT / E_REF, 4)}  ({E_SOFT.size} bound; hard-wall would be n^2)")
print(f"  soft   flat by (cents) {np.round(1200 * np.log2((E_SOFT / E_REF) / np.arange(1, E_SOFT.size + 1)**2), 1)}")
for s, p in zip(SEGS, parts):
    spec = np.abs(np.fft.rfft(p * np.hanning(p.size), 4 * p.size))
    fr = np.fft.rfftfreq(4 * p.size, 1 / SR)
    fs, aa = s["f"][s["keep"]], s["a"][s["keep"]]
    loud = fs[np.abs(aa) > 0.05 * np.abs(aa).max()][:6]
    if s["key"] == "ring":
        loud = loud[:2]
    errs = []
    for fk in loud:
        m = (fr > fk - 1.5) & (fr < fk + 1.5)
        errs.append(abs(fr[m][np.argmax(spec[m])] - fk))
    rel = np.abs(aa) / np.abs(aa).max()
    print(f"  {s['key']:6s} partials (Hz) {np.round(fs[:7], 1)}  rel. loudness {np.round(rel[:7], 2)}  FFT miss {max(errs):.2f} Hz")

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
ACC, INFO = "#e8b84a", "#4a8fff"
plt.rcParams.update({"font.family": MONO, "text.color": FG2, "axes.labelcolor": FG3,
                     "xtick.color": FG3, "ytick.color": FG3, "axes.edgecolor": BORDER,
                     "axes.facecolor": EL1, "figure.facecolor": BG, "font.size": 10})

W_PX, H_PX, DPI = 1280, 720, 100
fig = plt.figure(figsize=(W_PX / DPI, H_PX / DPI), dpi=DPI)
ax_w = fig.add_axes([0.05, 0.20, 0.40, 0.56])
ax_s = fig.add_axes([0.52, 0.20, 0.45, 0.56])
ax_t = fig.add_axes([0.05, 0.06, 0.92, 0.05])
N_SHOW = 6
SHORT = ["string", "hard", "free", "one-free", "ring", "soft"]


def style(ax):
    for sp in ax.spines.values():
        sp.set_color(BORDER)
    ax.tick_params(length=3)


def header(s):
    fig.texts.clear()
    fig.text(0.05, 0.94, "QUANTUM SYNTHESIZER · WALLS", fontsize=9, color=FG3)
    fig.text(0.05, 0.875, s["name"], fontsize=26, color=FG1, family=SERIF)
    fig.text(0.97, 0.94, s["tag"].upper(), fontsize=9, color=ACC, ha="right")
    fig.text(0.97, 0.895, s["sym"], fontsize=11, color=FG1, ha="right")
    fig.text(0.97, 0.86, s["words"], fontsize=9, color=FG3, ha="right")
    fig.text(0.05, 0.815, s["line"], fontsize=15, color=FG2, family=SERIF, style="italic")


def wall(ax, xpos, kind, y0, y1, side):
    if kind == "fixed":
        ax.plot([xpos, xpos], [y0, y1], color=FG1, lw=3.2, solid_capstyle="butt")
        for yy in np.linspace(y0, y1, 14):
            d = -0.035 if side == "L" else 0.035
            ax.plot([xpos, xpos + d], [yy, yy - 0.5], color=FG3, lw=0.8)
    elif kind == "free":
        ax.plot([xpos, xpos], [y0, y1], color=FG3, lw=1.2, ls=(0, (2, 3)))
    elif kind == "ring":
        ax.annotate("", xy=(xpos, y1 - 0.2), xytext=(xpos, y0 + 0.2),
                    arrowprops=dict(arrowstyle="-", color=INFO, lw=1, ls=(0, (1, 3))))


def mode_band(s, k):
    """Rows for drawing: one per mode, stacked evenly (energy grows too fast to plot to scale)."""
    return k * 1.0


def draw_box(s, env):
    ax_w.clear(); style(ax_w)
    x, U = s["x"], s["U"]
    idx = np.where(s["keep"] | (s["f"] <= 1.0))[0][:N_SHOW]
    lo, hi = (0, 2) if s["key"] == "ring" else ((-0.35, 1.35) if s["key"] == "soft" else (0, 1))
    m = (x >= lo) & (x <= hi)
    for row, k in enumerate(idx):
        e = env[k] if env is not None else 1.0
        sc = 0.36 / np.abs(U[m, k]).max()
        col = ACC if row == 0 else (INFO if s["key"] == "ring" and row % 2 == 0 else FG1)
        y = row
        ax_w.axhline(y, color=FG4, lw=0.5)
        ax_w.plot(x[m], y + sc * U[m, k], color=col, lw=1.1, alpha=0.25 + 0.75 * e)
        lab = f"{s['levels'][k]:.2f}" if s["key"] in ("soft", "ring") else f"{s['levels'][k]:.0f}"
        ax_w.text(hi + 0.02 * (hi - lo), y, lab, fontsize=8, color=FG3, va="center")
    top = len(idx) - 0.4
    if s["key"] == "soft":
        ax_w.fill_between([lo, 0], -0.6, top, color=FG4, alpha=0.35, lw=0)
        ax_w.fill_between([1, hi], -0.6, top, color=FG4, alpha=0.35, lw=0)
        ax_w.text(lo + 0.02, top - 0.25, "wall, finite", fontsize=8, color=FG3)
    elif s["key"] == "ring":
        ax_w.axvline(BUMP_X, color=INFO, lw=0.8, ls=(0, (2, 2)))
        ax_w.text(BUMP_X, top - 0.2, "bump", fontsize=8, color=INFO, ha="center")
        ax_w.text(0.02, top - 0.2, "← joined →", fontsize=8, color=INFO)
        ax_w.text(1.98, top - 0.2, "← joined →", fontsize=8, color=INFO, ha="right")
    else:
        wall(ax_w, 0, s["walls"][0], -0.5, top, "L")
        wall(ax_w, 1, s["walls"][1], -0.5, top, "R")
    pk = X_PICK
    ax_w.axvline(pk, color=INFO, lw=0.8, ls=(0, (3, 3)), alpha=0.6)
    ax_w.axvline(X_PLUCK, color=ACC, lw=0.8, ls=(0, (3, 3)), alpha=0.6)
    ax_w.text(X_PLUCK, -0.85, "pluck ", fontsize=7, color=ACC, ha="right")
    ax_w.text(pk, -0.85, " pickup", fontsize=7, color=INFO, ha="left")
    ax_w.set_xlim(lo - 0.06 * (hi - lo), hi + 0.12 * (hi - lo)); ax_w.set_ylim(-1.0, top + 0.1)
    ax_w.set_yticks([]); ax_w.set_xlabel("position in the box")
    ax_w.set_title("the shapes the walls allow · right: pitch in A3 units", fontsize=9, color=FG3, loc="left")


def draw_spectrum(s, env):
    ax_s.clear(); style(ax_s)
    for h in range(1, 40):
        ax_s.axvline(F0 * h, color=FG4, lw=0.6, zorder=0)
    amax = np.abs(SEGS[0]["a"]).max()
    for k in np.where(s["keep"])[0]:
        a = abs(s["a"][k]) / amax * (env[k] if env is not None else 1.0)
        row = np.searchsorted(np.where(s["keep"])[0], k)
        col = ACC if row == 0 else (INFO if s["key"] == "ring" and row % 2 == 1 else FG1)
        ax_s.plot([s["f"][k], s["f"][k]], [0, a], color=col, lw=2.0, solid_capstyle="butt")
        ax_s.plot(s["f"][k], a, "o", color=col, ms=3)
    ax_s.set_xlim(0, 8200); ax_s.set_ylim(0, 1.15); ax_s.set_yticks([])
    ax_s.set_xlabel("frequency (Hz) · grey: the harmonic series on A3")
    ax_s.set_title("what the pickup hears", fontsize=9, color=FG3, loc="left")


def timeline(t):
    ax_t.clear(); ax_t.set_xlim(0, TOTAL); ax_t.set_ylim(0, 1); ax_t.axis("off")
    for i, lab in enumerate(SHORT):
        a, b = STARTS[i], STARTS[i + 1]
        on = a <= t < b
        ax_t.add_patch(plt.Rectangle((a + 0.05, 0.1), b - a - 0.1, 0.8,
                                     fc="#22222e" if on else EL1, ec=ACC if on else BORDER, lw=0.8))
        ax_t.text((a + b) / 2, 0.5, lab, ha="center", va="center", fontsize=8, color=FG1 if on else FG3)
    ax_t.axvline(t, color=ACC, lw=1.2)


def env_at(s, tl):
    k = np.arange(len(s["f"]))
    rank = np.cumsum(s["keep"]) - 1
    return np.exp(-tl / (tau(np.maximum(rank, 0)) * (1.8 if s["key"] == "ring" else 1.0))) * min(tl / 0.004, 1.0)


def frame(t):
    i = min(int(np.searchsorted(STARTS, t, side="right") - 1), len(SEGS) - 1)
    s, tl = SEGS[i], t - STARTS[i]
    header(s)
    e = env_at(s, tl)
    draw_box(s, e); draw_spectrum(s, e); timeline(t)


def grab():
    fig.canvas.draw()
    return np.asarray(fig.canvas.buffer_rgba())[:, :, :3].tobytes()


MP4 = os.path.join(HERE, "walls.mp4")
n_frames = int(np.ceil(TOTAL * FPS))
cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
       "-s", f"{W_PX}x{H_PX}", "-r", str(FPS), "-i", "-", "-i", WAV,
       "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23", "-preset", "medium",
       "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", MP4]
proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
for j in range(n_frames):
    frame(j / FPS)
    proc.stdin.write(grab())
proc.stdin.close(); proc.wait()
print(f"wrote {MP4} ({n_frames} frames, {TOTAL:.1f} s)")

# ---- poster: one still, the six boxes at the strike --------------------
frame(STARTS[1] + 0.3)
PNG = os.path.join(HERE, "walls-poster.png")
pf, axs = plt.subplots(2, 6, figsize=(18, 6.4), dpi=110)
pf.patch.set_facecolor(BG)
for j, s in enumerate(SEGS):
    a1, a2 = axs[0, j], axs[1, j]
    for a in (a1, a2):
        style(a); a.set_facecolor(EL1)
    x, U = s["x"], s["U"]
    idx = np.where(s["keep"] | (s["f"] <= 1.0))[0][:N_SHOW]
    lo, hi = (0, 2) if s["key"] == "ring" else ((-0.35, 1.35) if s["key"] == "soft" else (0, 1))
    m = (x >= lo) & (x <= hi)
    for row, k in enumerate(idx):
        sc = 0.36 / np.abs(U[m, k]).max()
        a1.plot(x[m], row + sc * U[m, k], color=ACC if row == 0 else FG1, lw=0.8)
    a1.set_title(s["name"], color=FG1, fontsize=12, family=SERIF)
    a1.set_xticks([]); a1.set_yticks([])
    for h in range(1, 40):
        a2.axvline(F0 * h, color=FG4, lw=0.5)
    amax = np.abs(SEGS[0]["a"]).max()
    for k in np.where(s["keep"])[0]:
        a2.plot([s["f"][k]] * 2, [0, abs(s["a"][k]) / amax], color=FG1, lw=1.4)
    a2.set_xlim(0, 8200); a2.set_ylim(0, 1.15); a2.set_yticks([])
    a2.set_xlabel(s["tag"], color=ACC)
pf.suptitle("Walls · same box, only the walls change · one ruler: hard-wall ground = A3 (220 Hz) · grey: the harmonic series",
            color=FG3, fontsize=10, family=MONO)
pf.tight_layout(rect=(0, 0, 1, 0.95))
pf.savefig(PNG, facecolor=BG)
print(f"wrote {PNG}")
