#!/usr/bin/env python3
"""
Stiffness — the slide from string to Schrodinger
================================================
Cycle 8 (walls.py) found that the walls pick the SHAPES but the equation
picks the PITCHES: a string with fixed ends sounds 1, 2, 3, 4; Schrodinger's
hard box, with the very same sine shapes, sounds 1, 4, 9, 16. This script
slides continuously from one to the other by changing only the equation.

The road between them is a stiff string, pinned at both ends:

    y_tt = c^2 y_xx  -  kappa^2 y_xxxx
    acceleration = tension x curvature  -  stiffness x curvature-of-curvature

Its modes are the same sines at every stiffness, so the pluck and the pickup
hear the same loudness pattern the whole way. Only the pitches move:

    f_n = f0 * n * sqrt(1 + B n^2) / sqrt(1 + B)      (ground held on A3)
        = f0 * n * sqrt((1 - lam) + lam n^2),   lam = B / (1 + B)

B = 0 is a plain string (n). B -> infinity is a pinned bar, pure bending
(n^2). And the pinned bar IS Schrodinger's box: apply the free Schrodinger
equation twice,

    i psi_t = -(1/2) psi_xx   =>   psi_tt = -(1/4) psi_xxxx,

which is the bar equation. The real part of a wavefunction that starts real
moves exactly like a struck pinned bar. Schrodinger is the square root of a
vibrating bar. A piano (B ~ 1e-4 to 1e-3, per [[Piano String Inharmonicity]])
sits near the string end of this road: its partials turn bar-like only past
n ~ 1/sqrt(B), which is 30 to 100 partials up.

Writes beside this script:
  stiffness.wav         16 plucks up the stiffness road, then one held glide
  stiffness.mp4         the same audio with the picture locked to it
  stiffness-poster.png  the whole road as one still: every partial vs. B
and prints the checks:
  1. finite-difference stiff string vs. the formula, at several B
  2. Schrodinger box and pinned bar integrated separately from the same
     pluck: Re(psi) at the pickup vs. the bar's displacement
  3. FFT peaks of the plucks vs. intended

numpy + scipy + matplotlib + ffmpeg.
"""
import os, subprocess, wave
import numpy as np
from scipy.linalg import eigh
from scipy.integrate import solve_ivp
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager

HERE = os.path.dirname(os.path.abspath(__file__))
SR, FPS = 44100, 30
F0 = 220.0
NP = 12                                   # partials
X_PLUCK, W_PLUCK, X_PICK = 0.23, 0.03, 0.37   # same pluck and pickup as walls.py
F_FADE, F_MAX = 12000.0, 15500.0
n = np.arange(1, NP + 1)

# loudness of each sine mode: same pluck, same pickup, every B (the shapes never change)
A = (np.sqrt(2) * W_PLUCK * np.sqrt(2 * np.pi) * np.sin(n * np.pi * X_PLUCK)
     * np.exp(-(n * np.pi * W_PLUCK)**2 / 2)) * np.sqrt(2) * np.sin(n * np.pi * X_PICK)


def ratios(B):
    if np.isinf(B):
        return n.astype(float)**2
    return n * np.sqrt((1 + B * n**2) / (1 + B))


def ratios_lam(lam):
    return n * np.sqrt((1 - lam) + lam * n**2)


def tau(k):
    return 2.4 / (1 + 0.25 * k)


def gate(f):
    return np.clip((F_MAX - f) / (F_MAX - F_FADE), 0, 1)


# ======================================================================
# audio: 16 plucks up the road, then one held glide
# ======================================================================
B_STEPS = [0.0] + list(np.logspace(-4, 3, 14)) + [np.inf]
PLUCK_T = 1.5
GLIDE_T = 8.0


def pluck(B, dur):
    t = np.arange(int(dur * SR)) / SR
    out = np.zeros_like(t)
    for k, (r, a) in enumerate(zip(ratios(B), A)):
        f = F0 * r
        out += a * gate(f) * np.exp(-t / tau(k)) * np.minimum(t / 0.004, 1) * np.sin(2 * np.pi * f * t)
    return out * np.minimum((t.size - np.arange(t.size)) / (0.03 * SR), 1)


def glide(dur):
    """String to Schrodinger in one held tone: lam 0 -> 1 with a hold at each end."""
    t = np.arange(int(dur * SR)) / SR
    u = np.clip((t - 1.0) / (dur - 2.5), 0, 1)
    lam = u * u * (3 - 2 * u)
    out = np.zeros_like(t)
    for k, a in enumerate(A):
        f = F0 * n[k] * np.sqrt((1 - lam) + lam * n[k]**2)
        ph = 2 * np.pi * np.cumsum(f) / SR
        out += a * gate(f) * np.exp(-t / (4 * tau(k))) * np.sin(ph)
    env = np.minimum(t / 0.004, 1) * np.minimum((t.size - np.arange(t.size)) / (0.4 * SR), 1)
    return out * env, lam


parts = [pluck(B, PLUCK_T) for B in B_STEPS]
g_tail, LAM_GLIDE = glide(GLIDE_T)
parts.append(g_tail)
g = 0.85 / max(np.abs(p).max() for p in parts)       # one gain throughout
parts = [p * g for p in parts]
STARTS = np.cumsum([0] + [p.size / SR for p in parts])
audio = np.concatenate(parts)
TOTAL = audio.size / SR
WAV = os.path.join(HERE, "stiffness.wav")
with wave.open(WAV, "wb") as wv:
    wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())

# ======================================================================
# checks
# ======================================================================
print("== check 1: finite-difference stiff string vs. formula ==")
NG = 400
dx = 1.0 / (NG + 1)
D2 = (np.diag(-2 * np.ones(NG)) + np.diag(np.ones(NG - 1), 1) + np.diag(np.ones(NG - 1), -1)) / dx**2
D4 = D2 @ D2                              # pinned: y = 0 and y'' = 0 at both ends
for B in (0.0, 4e-4, 1e-2, 1.0, 100.0):
    # c^2 = 1/pi^2, kappa^2 = B/pi^4  ->  omega_n^2 = n^2 + B n^4  (in units of the B=0 ground)
    K = -D2 / np.pi**2 + (B / np.pi**4) * D4
    w = np.sqrt(eigh(K, eigvals_only=True, subset_by_index=(0, 7)))
    r = w / w[0]
    exact = ratios(B)[:8]
    print(f"  B={B:<8g} ratios {np.round(r, 3)}  worst rel. miss {np.max(np.abs(r / exact - 1)):.2e}")
for B in (1e-4, 4e-4, 1e-3):
    print(f"  piano B={B:g}: partials turn bar-like past n ~ 1/sqrt(B) = {1/np.sqrt(B):.0f};"
          f" 12th partial sharp by {1200*np.log2(np.sqrt(1+B*144)):.0f} cents (ground not re-tuned)")

print("== check 2: Schrodinger box vs. pinned bar, integrated separately ==")
NS = 80
dxs = 1.0 / (NS + 1)
xs = np.arange(1, NS + 1) * dxs
L2 = (np.diag(-2 * np.ones(NS)) + np.diag(np.ones(NS - 1), 1) + np.diag(np.ones(NS - 1), -1)) / dxs**2
L4 = L2 @ L2
p0 = np.exp(-(xs - X_PLUCK)**2 / (2 * 0.06**2))      # wider pluck so the coarse grid resolves it
ip = int(np.argmin(np.abs(xs - X_PICK)))
T_END = 2 * (2 / np.pi**2) * 2                       # two periods of the ground level
tt = np.linspace(0, T_END, 400)
# Schrodinger: i psi_t = -(1/2) L2 psi  ->  psi_t = (i/2) L2 psi, split into real/imag
def schro(t, z):
    re, im = z[:NS], z[NS:]
    return np.concatenate([-0.5 * L2 @ im, 0.5 * L2 @ re])
s1 = solve_ivp(schro, (0, T_END), np.concatenate([p0, 0 * p0]), t_eval=tt, rtol=1e-10, atol=1e-12, method="DOP853")
# bar: y_tt = -(1/4) L4 y, starting at rest
def bar(t, z):
    y, v = z[:NS], z[NS:]
    return np.concatenate([v, -0.25 * L4 @ y])
s2 = solve_ivp(bar, (0, T_END), np.concatenate([p0, 0 * p0]), t_eval=tt, rtol=1e-10, atol=1e-12, method="DOP853")
re_psi, y_bar = s1.y[ip], s2.y[ip]
print(f"  pickup over two ground periods: max |Re psi - y_bar| = {np.max(np.abs(re_psi - y_bar)):.2e}"
      f"  (signal peak {np.max(np.abs(re_psi)):.3f})")
CHECK_T, CHECK_RE, CHECK_BAR = tt, re_psi, y_bar

print("== check 3: FFT peaks vs. intended ==")
worst = 0
for B, p in zip(B_STEPS, parts[:-1]):
    spec = np.abs(np.fft.rfft(p * np.hanning(p.size), 8 * p.size))
    fr = np.fft.rfftfreq(8 * p.size, 1 / SR)
    fs = F0 * ratios(B)
    loud = fs[(np.abs(A) > 0.08 * np.abs(A).max()) & (fs < F_FADE)][:5]
    for fk in loud:
        m = (fr > fk - 3) & (fr < fk + 3)
        worst = max(worst, abs(fr[m][np.argmax(spec[m])] - fk))
print(f"  worst FFT miss over all plucks: {worst:.3f} Hz")
print(f"  relative loudness of the partials (same at every B): {np.round(np.abs(A) / np.abs(A).max(), 2)}")

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

# the road, drawn on lam = B/(1+B) so string (0) and bar (1) both fit
LAM_AX = np.linspace(0, 1, 600)**4      # even steps on the warped axis
CURVES = np.array([ratios_lam(l) for l in LAM_AX])
PIANO = (1e-4 / (1 + 1e-4), 1e-3 / (1 + 1e-3))
LAM_TICKS = [0, 1e-4 / 1.0001, 1e-3 / 1.001, 0.01 / 1.01, 0.1 / 1.1, 0.5, 1]
LAM_LABS = ["0", "1e-4", "1e-3", "0.01", "0.1", "1", "∞"]


def lam_of(B):
    return 1.0 if np.isinf(B) else B / (1 + B)


def lam_axis(l):
    """warp lam so the piano corner isn't crushed against zero"""
    return np.sqrt(np.sqrt(l))


W_PX, H_PX, DPI = 1280, 720, 100
fig = plt.figure(figsize=(W_PX / DPI, H_PX / DPI), dpi=DPI)
ax_r = fig.add_axes([0.05, 0.20, 0.40, 0.56])
ax_s = fig.add_axes([0.52, 0.20, 0.45, 0.56])
ax_t = fig.add_axes([0.05, 0.06, 0.92, 0.05])


def style(ax):
    for sp in ax.spines.values():
        sp.set_color(BORDER)
    ax.tick_params(length=3)


def draw_road(ax, lam_now=None, big=False):
    ax.clear(); style(ax)
    X = lam_axis(LAM_AX)
    lo, hi = lam_axis(np.array(PIANO))
    ax.axvspan(lo, hi, color=ACC, alpha=0.12, lw=0)
    ax.text((lo + hi) / 2, 1.08 * NP**2, "pianos", fontsize=8, color=ACC, ha="center", va="bottom")
    for k in range(NP):
        c = ACC if k == 0 else FG1
        ax.plot(X, CURVES[:, k], color=c, lw=1.0, alpha=0.75)
        ax.text(1.01, (k + 1)**2, f"{(k + 1)**2}", fontsize=7, color=INFO, va="center")
        if k < 8 or k == NP - 1:
            ax.text(-0.01, k + 1, f"{k + 1}", fontsize=7, color=FG3, va="center", ha="right")
    ax.set_yscale("log"); ax.set_ylim(0.85, 1.6 * NP**2); ax.set_xlim(0, 1)
    ax.set_yticks([])
    ax.set_xticks(lam_axis(np.array(LAM_TICKS))); ax.set_xticklabels(LAM_LABS, fontsize=8)
    ax.set_xlabel("stiffness B  ·  left labels: string 1·2·3 … right: squares 1·4·9 …")
    if lam_now is not None:
        xn = lam_axis(lam_now)
        ax.axvline(xn, color=ACC, lw=1.2)
        r = ratios_lam(lam_now)
        ax.plot([xn] * NP, r, "o", color=ACC, ms=4)
    ax.set_title("every partial, as pitch over the ground, along the road", fontsize=9, color=FG3, loc="left")


def draw_spec(lam_now, env):
    ax_s.clear(); style(ax_s)
    for h in range(1, 72):
        ax_s.axvline(F0 * h, color=FG4, lw=0.6, zorder=0)
    for h in range(1, 9):
        ax_s.axvline(F0 * h * h, color=INFO, lw=0.8, ls=(0, (2, 3)), alpha=0.55, zorder=0)
    fs = F0 * ratios_lam(lam_now)
    amax = np.abs(A).max()
    for k, (f, a) in enumerate(zip(fs, A)):
        h = abs(a) / amax * env[k] * gate(f)
        col = ACC if k == 0 else FG1
        ax_s.plot([f, f], [0, h], color=col, lw=2.0, solid_capstyle="butt")
        ax_s.plot(f, h, "o", color=col, ms=3)
    ax_s.set_xlim(0, 14500); ax_s.set_ylim(0, 1.15); ax_s.set_yticks([])
    ax_s.set_xlabel("frequency (Hz) · grey: harmonic series on A3 · blue dashes: the squares")
    ax_s.set_title("what the pickup hears · same loudness pattern at every B", fontsize=9, color=FG3, loc="left")


SEG_NAMES = [("B = 0", "A plain string", "The harmonic series. Tension alone pulls it straight.")]
for B in B_STEPS[1:-1]:
    if B < 1e-3 * 1.01:
        line = "Piano country. The low partials barely move; the top ones start to ride sharp."
    elif B < 0.1:
        line = "Stiffer than any piano string. The upper partials are leaving the grey lines."
    elif B < 3:
        line = "Halfway: bending and tension share the restoring force."
    else:
        line = "Mostly bar now. The partials are settling onto the blue dashes."
    SEG_NAMES.append((f"B = {B:.3g}", "A stiff string", line))
SEG_NAMES.append(("B = ∞", "A pinned bar = Schrödinger's box",
                  "Pure bending. 1, 4, 9, 16: the same pitches as the hard-walled box."))
SEG_NAMES.append(("glide", "The whole road, held", "One tone, string to Schrödinger. Nothing changes but the equation."))


def header(i, lam_now):
    fig.texts.clear()
    tag, name, line = SEG_NAMES[i]
    fig.text(0.05, 0.94, "QUANTUM SYNTHESIZER · STIFFNESS", fontsize=9, color=FG3)
    fig.text(0.05, 0.875, name, fontsize=26, color=FG1, family=SERIF)
    fig.text(0.97, 0.94, tag.upper() if i < len(SEG_NAMES) - 1 else f"B/(1+B) = {lam_now:.2f}", fontsize=9, color=ACC, ha="right")
    fig.text(0.97, 0.895, "∂²y/∂t² = c² ∂²y/∂x² − κ² ∂⁴y/∂x⁴", fontsize=11, color=FG1, ha="right")
    fig.text(0.97, 0.86, "acceleration = tension × curvature − stiffness × curvature of curvature",
             fontsize=8, color=FG3, ha="right")
    fig.text(0.05, 0.815, line, fontsize=15, color=FG2, family=SERIF, style="italic")


def timeline(t):
    ax_t.clear(); ax_t.set_xlim(0, TOTAL); ax_t.set_ylim(0, 1); ax_t.axis("off")
    for i in range(len(parts)):
        a, b = STARTS[i], STARTS[i + 1]
        on = a <= t < b
        ax_t.add_patch(plt.Rectangle((a + 0.04, 0.1), b - a - 0.08, 0.8,
                                     fc="#22222e" if on else EL1, ec=ACC if on else BORDER, lw=0.8))
    ax_t.text(STARTS[0] + 0.75, 0.5, "string", ha="center", va="center", fontsize=7, color=FG3)
    ax_t.text(STARTS[15] + 0.75, 0.5, "bar", ha="center", va="center", fontsize=7, color=FG3)
    ax_t.text((STARTS[16] + STARTS[17]) / 2, 0.5, "the whole road, held", ha="center", va="center", fontsize=8, color=FG3)
    ax_t.axvline(t, color=ACC, lw=1.2)


def frame(t):
    i = min(int(np.searchsorted(STARTS, t, side="right") - 1), len(parts) - 1)
    tl = t - STARTS[i]
    if i < len(B_STEPS):
        lam_now = lam_of(B_STEPS[i])
        env = np.exp(-tl / tau(np.arange(NP))) * min(tl / 0.004, 1)
    else:
        j = min(int(tl * SR), LAM_GLIDE.size - 1)
        lam_now = float(LAM_GLIDE[j])
        env = np.exp(-tl / (4 * tau(np.arange(NP))))
    header(i, lam_now)
    draw_road(ax_r, lam_now)
    draw_spec(lam_now, env)
    timeline(t)


def grab():
    fig.canvas.draw()
    return np.asarray(fig.canvas.buffer_rgba())[:, :, :3].tobytes()


MP4 = os.path.join(HERE, "stiffness.mp4")
n_frames = int(np.ceil(TOTAL * FPS))
cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
       "-s", f"{W_PX}x{H_PX}", "-r", str(FPS), "-i", "-", "-i", WAV,
       "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23", "-preset", "medium",
       "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", MP4]
proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
for jf in range(n_frames):
    frame(jf / FPS)
    proc.stdin.write(grab())
proc.stdin.close(); proc.wait()
print(f"wrote {MP4} ({n_frames} frames, {TOTAL:.1f} s)")

# ---- poster: the road, plus the square-root check --------------------
pf = plt.figure(figsize=(16, 6.4), dpi=110)
a1 = pf.add_axes([0.05, 0.14, 0.52, 0.72])
a2 = pf.add_axes([0.64, 0.14, 0.33, 0.72])
draw_road(a1)
a1.set_title("String → Schrödinger: every partial of one pinned string as stiffness grows (ground held on A3)",
             fontsize=10, color=FG2, loc="left")
style(a2)
a2.plot(CHECK_T, CHECK_RE, color=INFO, lw=2.6, label="Re ψ, Schrödinger box")
a2.plot(CHECK_T, CHECK_BAR, color=ACC, lw=1.0, ls=(0, (4, 3)), label="pinned bar, displacement")
a2.set_xlabel("time (two ground periods)"); a2.set_yticks([])
a2.set_title("integrated separately, same pluck, same pickup", fontsize=10, color=FG2, loc="left")
a2.legend(frameon=False, fontsize=9, labelcolor=FG2, loc="upper right")
pf.text(0.05, 0.93, "QUANTUM SYNTHESIZER · STIFFNESS — Schrödinger is the square root of a vibrating bar",
        fontsize=12, color=FG1)
PNG = os.path.join(HERE, "stiffness-poster.png")
pf.savefig(PNG, facecolor=BG)
print(f"wrote {PNG}")
