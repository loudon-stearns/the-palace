#!/usr/bin/env python3
"""
Timbre Atlas — five wells, one ruler, one video
===============================================
Cycles 3, 5 and 6 of [[Quantum Synthesizer]] heard three potential wells one
at a time: a parabola rings a clean harmonic tone, a quartic-bent well rings
a bell, a double well splits every level into a pair that beats. This script
puts them side by side on one ruler and adds the two wells the atlas was
missing:

  * a Morse well, V = D (1 - e^(-a x))^2 — the shape of a chemical bond. Its
    levels crowd together as they climb and then STOP: past the rim the
    particle is free, so the instrument has only a handful of partials and
    a ceiling. Exact levels are known, E_n = (n + 1/2) - (n + 1/2)^2 / (4 D)
    (with a = 1/sqrt(2D) so the bottom has the parabola's curvature), and
    the solver is checked against them.
  * a lopsided double well — cycle 6's double well tipped by a hair, + 0.02 x.
    The pairs come apart, the lowest pair most of all (12.7 Hz instead of
    1.4 Hz), because its tunnelling was the weakest thing in the well and the
    tilt outweighs it.

Then a coda asks the lopsided well a physical question, with no additive
recipe: drop a particle in the left well and run the Schrodinger equation.
In the symmetric well it tunnels across and comes back (cycle 6). In the
lopsided well it mostly stays home. The sound is psi read at a pickup in the
left well, so in the symmetric well it swells and empties, and in the
lopsided well it hardly does.

One ruler, every well: one energy unit (the parabola's spacing) = 196 Hz,
and each well's ground state sits on G3:

    f_n = 196 Hz * (E_n - E_0 + 1)

This is cycle 6's rule. Cycle 3 stretched each well so its first gap was an
octave; here the wells are NOT normalised, so how far apart their partials
sit is part of what you hear.

Writes beside this script:
  timbre-atlas.wav         34.5 s: five strikes (4.5 s each) then the coda (two 6 s halves)
  timbre-atlas.mp4         the same audio with the picture locked to it, 1280x720, 30 fps
  timbre-atlas-poster.png  the five wells as one still
and prints the checks (FFT peaks vs solver, Morse vs exact, tunnelling transfer).

numpy + scipy + matplotlib + ffmpeg.
"""
import io, os, subprocess, wave
import numpy as np
from scipy.linalg import eigh_tridiagonal
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager

HERE = os.path.dirname(os.path.abspath(__file__))
SR, FPS = 44100, 30
BASE = 196.0

# ---- one grid for every well (Morse needs the long right side) ----------
N_GRID, XL, XR = 3000, -10.0, 30.0
X = np.linspace(XL, XR, N_GRID)
DX = X[1] - X[0]
OFF = -0.5 / DX**2 * np.ones(N_GRID - 1)


def solve(V, k):
    E, U = eigh_tridiagonal(1.0 / DX**2 + V, OFF, select="i", select_range=(0, k - 1))
    U = U / np.sqrt(DX)
    # sign convention: each eigenfunction starts positive on its left lobe
    for n in range(k):
        i = np.argmax(np.abs(U[:, n]) > 0.05 * np.abs(U[:, n]).max())
        if U[i, n] < 0:
            U[:, n] *= -1
    return E, U


MORSE_D = 4.0
MORSE_A = 1 / np.sqrt(2 * MORSE_D)      # bottom curvature matches the parabola
TILT = 0.02

WELLS = [
    dict(key="parabola", name="Parabola", tag="harmonic",
         V=0.5 * X**2, xlim=(-6, 6),
         sym="V(x) = ½x²", words="potential = ½ × position²",
         line="Evenly spaced levels. The harmonic series, a clean G3."),
    dict(key="quartic", name="Quartic-bent", tag="stretched",
         V=0.5 * X**2 + 0.1 * X**4, xlim=(-4, 4),
         sym="V(x) = ½x² + 0.1·x⁴", words="potential = ½ × position² + 0.1 × position⁴",
         line="Steeper walls push the upper levels apart. A bell."),
    dict(key="double", name="Double well", tag="paired",
         V=0.5 * X**2 + 10 * np.exp(-2 * X**2), xlim=(-6, 6),
         sym="V(x) = ½x² + 10·e^(−2x²)", words="potential = ½ × position² + 10 × e^(−2 × position²)",
         line="A wall in the middle. Tunnelling splits each level into a pair that beats."),
    dict(key="lopsided", name="Lopsided double well", tag="detuned",
         V=0.5 * X**2 + 10 * np.exp(-2 * X**2) + TILT * X, xlim=(-6, 6),
         sym="V(x) = ½x² + 10·e^(−2x²) + 0.02·x", words="potential = … + 0.02 × position",
         line="Tip it by a hair. The pairs come apart, the lowest most of all."),
    dict(key="morse", name="Morse well", tag="ceiling",
         V=MORSE_D * (1 - np.exp(-MORSE_A * X))**2, xlim=(-3.5, 22),
         sym="V(x) = 4·(1 − e^(−x/√8))²", words="potential = depth × (1 − e^(−position / √8))²",
         line="A chemical bond. Levels crowd together, then stop: only 8 partials."),
]
N_LEV = 12
for w in WELLS:
    E, U = solve(w["V"], N_LEV)
    if w["key"] == "morse":
        nb = int(np.sum(E < MORSE_D))            # bound states only; above the rim is free
        E, U = E[:nb], U[:, :nb]
    w["E"], w["U"] = E, U
    w["f"] = BASE * (E - E[0] + 1.0)


def amp(k):
    return 1.0 / (k + 1) ** 0.9


def tau(k):
    return 2.2 / (1 + 0.35 * k)


# ======================================================================
# audio — part 1: the atlas (additive, one strike per well)
# ======================================================================
SEG = 4.5
SEG_N = int(SEG * SR)


def strike(f, dur_n):
    t = np.arange(dur_n) / SR
    out = np.zeros(dur_n)
    for k, fk in enumerate(f):
        env = np.exp(-t / tau(k)) * np.minimum(t / 0.005, 1.0)
        out += amp(k) * env * np.sin(2 * np.pi * fk * t)
    fade = np.minimum((dur_n - np.arange(dur_n)) / (0.04 * SR), 1.0)
    return out * fade


atlas = np.concatenate([strike(w["f"], SEG_N) for w in WELLS])
atlas *= 0.85 / np.max(np.abs(atlas))

# ======================================================================
# audio — part 2: the coda (real time evolution, heard at a pickup)
# ======================================================================
CODA = 6.0
CODA_N = int(CODA * SR)
X0, W0, X_PICK, N_EXP, TAU_T = -2.3, 0.62, -1.9, 40, 4.0    # cycle 6's packet and pickup
IP = int(np.argmin(np.abs(X - X_PICK)))
LEFT = X < 0


def packet():
    p = np.exp(-(X - X0)**2 / (2 * W0**2))
    return p / np.sqrt(np.sum(p**2) * DX)


def tau_t(n):
    return TAU_T / (1 + 0.5 * (n // 2))


def evolve(V):
    E, U = solve(V, N_EXP)
    c = U.T @ packet() * DX
    w = 2 * np.pi * BASE * (E - E[0] + 1.0)
    return dict(E=E, U=U, c=c, w=w)


def pickup_signal(ev):
    t = np.arange(CODA_N) / SR
    z = np.zeros(CODA_N, complex)
    for n in range(N_EXP):
        z += ev["U"][IP, n] * ev["c"][n] * np.exp(-1j * ev["w"][n] * t - t / tau_t(n))
    return np.real(z) * np.minimum(t / 0.004, 1.0) * np.minimum((CODA_N - np.arange(CODA_N)) / (0.04 * SR), 1.0)


def p_left(ev, t):
    """P(particle in left well), undamped, slow terms only (audio-rate cross
    terms average away inside one video frame)."""
    M = (ev["U"][LEFT].T @ ev["U"][LEFT]) * DX
    E, c = ev["E"], ev["c"]
    P = np.zeros_like(t)
    for m in range(N_EXP):
        for n in range(N_EXP):
            if abs(E[m] - E[n]) * BASE > 80:
                continue
            P += M[m, n] * c[m] * c[n] * np.cos(2 * np.pi * BASE * (E[m] - E[n]) * t)
    return P / np.sum(c**2)


EV_SYM = evolve(WELLS[2]["V"])
EV_LOP = evolve(WELLS[3]["V"])
coda_sym, coda_lop = pickup_signal(EV_SYM), pickup_signal(EV_LOP)
g = 0.85 / max(np.abs(coda_sym).max(), np.abs(coda_lop).max())    # ONE gain: loudness is evidence
coda = np.concatenate([coda_sym * g, coda_lop * g])

audio = np.concatenate([atlas, coda])
TOTAL = audio.size / SR


def write_wav(path, x):
    with wave.open(path, "wb") as wv:
        wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR)
        wv.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


WAV = os.path.join(HERE, "timbre-atlas.wav")
write_wav(WAV, audio)

# ======================================================================
# checks
# ======================================================================
print("== checks ==")
# 1. FFT of each atlas segment against the solver
for i, w in enumerate(WELLS):
    seg = atlas[i * SEG_N:(i + 1) * SEG_N]
    spec = np.abs(np.fft.rfft(seg * np.hanning(seg.size), 8 * seg.size))
    fr = np.fft.rfftfreq(8 * seg.size, 1 / SR)
    errs = []
    for fk in w["f"][:8]:
        m = (fr > fk - 3) & (fr < fk + 3)
        errs.append(abs(fr[m][np.argmax(spec[m])] - fk))
    w["fft_err"] = max(errs)
    print(f"  {w['key']:9s} partials {np.round(w['f'][:8], 1)}  max FFT miss over first 8: {max(errs):.2f} Hz")
# 2. Morse against the exact formula
mw = WELLS[4]
n = np.arange(mw["E"].size)
E_exact = (n + 0.5) - (n + 0.5)**2 / (4 * MORSE_D)
MORSE_ERR = np.max(np.abs(mw["E"] - E_exact)) * BASE
print(f"  morse     bound states {mw['E'].size} (exact formula: {int(np.floor(np.sqrt(2*MORSE_D)/MORSE_A - 0.5)) + 1}); "
      f"worst level vs exact: {MORSE_ERR:.3f} Hz")
# 3. beats of the lowest pair, symmetric vs lopsided
for key in ("double", "lopsided"):
    f = next(w for w in WELLS if w["key"] == key)["f"]
    print(f"  {key:9s} pair gaps (Hz): {np.round(f[1::2][:4] - f[0::2][:4], 2)}")
# 4. how far does the particle get?
t_dense = np.linspace(0, CODA, 6001)
PL_SYM, PL_LOP = p_left(EV_SYM, t_dense), p_left(EV_LOP, t_dense)
print(f"  coda      P(left) minimum over {CODA:.0f} s: symmetric {PL_SYM.min():.3f}, lopsided {PL_LOP.min():.3f}")
# two-state prediction for the lowest pair alone: max transfer = gap_sym^2 / gap_lop^2
gs = WELLS[2]["f"][1] - WELLS[2]["f"][0]
gl = WELLS[3]["f"][1] - WELLS[3]["f"][0]
print(f"  coda      two-state prediction, lowest pair: max transfer {gs**2 / gl**2:.3f}")
rms = lambda x: np.sqrt(np.mean(x**2))
tt = np.arange(CODA_N) / SR
q = lambda x, a, b: rms(x[(tt >= a) & (tt < b)])
print(f"  coda      pickup loudness swing (rms of quietest/loudest 50 ms window, first 3 s): "
      f"symmetric {min(q(coda_sym, a, a+.05) for a in np.arange(0, 3, .05)) / max(q(coda_sym, a, a+.05) for a in np.arange(0, 3, .05)):.3f}, "
      f"lopsided {min(q(coda_lop, a, a+.05) for a in np.arange(0, 3, .05)) / max(q(coda_lop, a, a+.05) for a in np.arange(0, 3, .05)):.3f}")

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
ax_w = fig.add_axes([0.05, 0.20, 0.42, 0.56])
ax_s = fig.add_axes([0.53, 0.20, 0.44, 0.56])
ax_t = fig.add_axes([0.05, 0.06, 0.92, 0.05])

SEGS = [(i * SEG, (i + 1) * SEG, w["name"]) for i, w in enumerate(WELLS)] + \
       [(5 * SEG, 5 * SEG + CODA, "particle · even"), (5 * SEG + CODA, TOTAL, "particle · tipped")]


def timeline(t):
    ax_t.clear(); ax_t.set_xlim(0, TOTAL); ax_t.set_ylim(0, 1); ax_t.axis("off")
    for a, b, lab in SEGS:
        on = a <= t < b
        ax_t.add_patch(plt.Rectangle((a + 0.05, 0.1), b - a - 0.1, 0.8,
                                     fc=EL1 if not on else "#22222e", ec=ACC if on else BORDER, lw=0.8))
        ax_t.text((a + b) / 2, 0.5, lab, ha="center", va="center", fontsize=8, color=FG1 if on else FG3)
    ax_t.axvline(t, color=ACC, lw=1.2)


def header(title, tag, sym, words, line):
    fig.texts.clear()
    fig.text(0.05, 0.94, "QUANTUM SYNTHESIZER · TIMBRE ATLAS", fontsize=9, color=FG3)
    fig.text(0.05, 0.875, title, fontsize=26, color=FG1, family=SERIF)
    fig.text(0.97, 0.94, tag.upper(), fontsize=9, color=ACC, ha="right")
    fig.text(0.97, 0.895, sym, fontsize=11, color=FG1, ha="right")
    fig.text(0.97, 0.86, words, fontsize=9, color=FG3, ha="right")
    fig.text(0.05, 0.815, line, fontsize=15, color=FG2, family=SERIF, style="italic")


def style(ax):
    for s in ax.spines.values():
        s.set_color(BORDER)
    ax.tick_params(length=3)


def draw_well(w, env, xl=None):
    ax_w.clear(); style(ax_w)
    E, U, V = w["E"], w["U"], w["V"]
    xl = xl or w["xlim"]
    top = E[-1] + 0.9 * (E[-1] - E[0]) / max(len(E) - 1, 1) + 0.6
    if w["key"] == "morse":
        top = MORSE_D * 1.25
    m = (X >= xl[0]) & (X <= xl[1])
    ax_w.fill_between(X[m], V[m], top + 5, color=FG4, alpha=0.25, lw=0)
    ax_w.plot(X[m], V[m], color=FG2, lw=1.4)
    if w["key"] == "morse":
        ax_w.axhline(MORSE_D, color=FG3, lw=0.8, ls=(0, (4, 3)))
        ax_w.text(xl[1] - 0.3, MORSE_D + 0.08, "rim · free above", ha="right", fontsize=8, color=FG3)
    spacing = np.min(np.diff(E[::2])) if w["key"] in ("double", "lopsided") else np.min(np.diff(E))
    scale = 0.42 * spacing / np.abs(U[m]).max()
    for k in range(len(E)):
        e = env[k] if env is not None else 1.0
        col = ACC if k == 0 else (INFO if w["key"] in ("double", "lopsided") and k % 2 else FG1)
        ax_w.axhline(E[k], color=FG4, lw=0.5)
        ax_w.plot(X[m], E[k] + scale * U[m, k], color=col, lw=1.0, alpha=0.25 + 0.75 * e)
    ax_w.set_xlim(*xl); ax_w.set_ylim(min(0, V[m].min()) - 0.2, top)
    ax_w.set_xlabel("position x"); ax_w.set_ylabel("energy")
    ax_w.set_title("the well and its eigenfunctions", fontsize=9, color=FG3, loc="left")


def draw_spectrum(w, env):
    ax_s.clear(); style(ax_s)
    for h in range(1, 21):
        ax_s.axvline(BASE * h, color=FG4, lw=0.7, zorder=0)
    f = w["f"]
    for k, fk in enumerate(f):
        a = amp(k) * (env[k] if env is not None else 1.0)
        col = ACC if k == 0 else (INFO if w["key"] in ("double", "lopsided") and k % 2 else FG1)
        ax_s.plot([fk, fk], [0, a], color=col, lw=2.0, solid_capstyle="butt")
        ax_s.plot(fk, a, "o", color=col, ms=3)
    ax_s.set_xlim(100, 4000); ax_s.set_ylim(0, 1.08)
    ax_s.set_xlabel("frequency (Hz) · grey lines: the harmonic series on G3")
    ax_s.set_ylabel("loudness")
    ax_s.set_title("the partials, one per level", fontsize=9, color=FG3, loc="left")
    ax_s.set_yticks([])


def draw_coda(ev, w, t_local, PL, label):
    ax_w.clear(); style(ax_w)
    E, V = w["E"], w["V"]
    xl = (-4.5, 4.5); m = (X >= xl[0]) & (X <= xl[1])
    psi = ev["U"] @ (ev["c"] * np.exp(-1j * 2 * np.pi * BASE * (ev["E"] - ev["E"][0]) * t_local))
    dens = np.abs(psi)**2
    ax_w.fill_between(X[m], V[m], 14, color=FG4, alpha=0.25, lw=0)
    ax_w.plot(X[m], V[m], color=FG2, lw=1.4)
    base = 0.0
    ax_w.fill_between(X[m], base, base + 6.0 * dens[m], color=ACC, alpha=0.55, lw=0)
    ax_w.axvline(X_PICK, color=INFO, lw=1, ls=(0, (3, 3)))
    ax_w.text(X_PICK, 12.8, "pickup", color=INFO, fontsize=8, ha="center")
    ax_w.set_xlim(*xl); ax_w.set_ylim(-0.2, 13.5)
    ax_w.set_xlabel("position x"); ax_w.set_ylabel("energy  ·  amber: where the particle is")
    ax_w.set_title(label, fontsize=9, color=FG3, loc="left")
    ax_s.clear(); style(ax_s)
    i = int(t_local / CODA * (PL.size - 1))
    ax_s.plot(t_dense[:i + 1], PL[:i + 1], color=ACC, lw=1.2)
    ax_s.axhline(0.5, color=FG4, lw=0.7)
    ax_s.set_xlim(0, CODA); ax_s.set_ylim(-0.02, 1.02)
    ax_s.set_xlabel("time (s)"); ax_s.set_ylabel("chance it is in the left well")
    ax_s.set_title("does it cross?", fontsize=9, color=FG3, loc="left")


def env_at(w, t_local):
    k = np.arange(len(w["f"]))
    return np.exp(-t_local / tau(k)) * min(t_local / 0.005, 1.0)


def frame(t):
    i = int(t // SEG)
    if i < len(WELLS):
        w, tl = WELLS[i], t - i * SEG
        header(w["name"], w["tag"], w["sym"], w["words"], w["line"])
        draw_well(w, env_at(w, tl)); draw_spectrum(w, env_at(w, tl))
    else:
        tc = t - 5 * SEG
        if tc < CODA:
            header("A particle, even well", "tunnels",
                   "iħ ∂ψ/∂t = Ĥψ", "i × ħ × rate of change of ψ = energy operator acting on ψ",
                   "Dropped on the left, it crosses the wall and comes back. Hear it swell and empty.")
            draw_coda(EV_SYM, WELLS[2], tc, PL_SYM, "the double well, run forward in time")
        else:
            tc -= CODA
            header("A particle, tipped well", "stays home",
                   "iħ ∂ψ/∂t = Ĥψ", "i × ħ × rate of change of ψ = energy operator acting on ψ",
                   "Tipped by 0.02, the far side no longer matches. It barely leaves.")
            draw_coda(EV_LOP, WELLS[3], tc, PL_LOP, "the lopsided well, same particle, same start")
    timeline(t)


def grab():
    fig.canvas.draw()
    return np.asarray(fig.canvas.buffer_rgba())[:, :, :3].tobytes()


MP4 = os.path.join(HERE, "timbre-atlas.mp4")
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

# ---- poster: the five wells at the strike, one row ---------------------
pf, axs = plt.subplots(2, 5, figsize=(16, 6.4), dpi=110)
pf.patch.set_facecolor(BG)
for j, w in enumerate(WELLS):
    a1, a2 = axs[0, j], axs[1, j]
    for a in (a1, a2):
        style(a); a.set_facecolor(EL1)
    E, U, V = w["E"], w["U"], w["V"]
    xl = w["xlim"]; m = (X >= xl[0]) & (X <= xl[1])
    top = MORSE_D * 1.25 if w["key"] == "morse" else E[-1] + 1.2
    a1.plot(X[m], V[m], color=FG2, lw=1.2)
    sp = np.min(np.diff(E[::2])) if w["key"] in ("double", "lopsided") else np.min(np.diff(E))
    sc = 0.42 * sp / np.abs(U[m]).max()
    for k in range(len(E)):
        col = ACC if k == 0 else (INFO if w["key"] in ("double", "lopsided") and k % 2 else FG1)
        a1.plot(X[m], E[k] + sc * U[m, k], color=col, lw=0.8)
    a1.set_xlim(*xl); a1.set_ylim(min(0, V[m].min()) - 0.2, top)
    a1.set_title(w["name"], color=FG1, fontsize=12, family=SERIF)
    a1.set_xticks([]); a1.set_yticks([])
    for h in range(1, 21):
        a2.axvline(BASE * h, color=FG4, lw=0.6)
    for k, fk in enumerate(w["f"]):
        col = ACC if k == 0 else (INFO if w["key"] in ("double", "lopsided") and k % 2 else FG1)
        a2.plot([fk, fk], [0, amp(k)], color=col, lw=1.6)
    a2.set_xlim(100, 4000); a2.set_ylim(0, 1.08); a2.set_yticks([])
    a2.set_xlabel(w["tag"], color=ACC)
pf.suptitle("Timbre atlas · one ruler: 1 energy unit = 196 Hz, every ground state on G3 · grey: the harmonic series",
            color=FG3, fontsize=10, family=MONO)
pf.tight_layout(rect=(0, 0, 1, 0.95))
PNG = os.path.join(HERE, "timbre-atlas-poster.png")
pf.savefig(PNG, facecolor=BG)
print(f"wrote {PNG}")
