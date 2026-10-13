#!/usr/bin/env python3
"""
Pendulum — a bump on the ring turns Schrodinger's squares into a string
=======================================================================
Cycle 8 (walls.py): Schrodinger's box sounds 1, 4, 9, 16 where a string
sounds 1, 2, 3, 4. Cycle 10 (talbot.py): because those levels are whole
numbers, a packet on a ring falls apart and rebuilds itself exactly. This
script puts a bump on the ring and grows it into a deep well. That is the
forward vector's other test, potential shape as anharmonicity, run on the
same ring.

    i psi_t = -(1/2) psi_xx + V0 cos(2 pi x)      ring of length 1

This is the quantum pendulum (Mathieu's equation). The well's floor is at
x = 1/2. Two regimes share one ladder:

  * levels trapped low in the well swing like a pendulum through small
    angles. A small swing is a harmonic oscillator, so these levels come
    out EVENLY spaced: 1, 2, 3, 4 ... the string's harmonic series.
  * levels high above the bump spin round the ring like a free rotor:
    still the squares.
  * between them sits the separatrix (the pendulum just reaching the top).
    A classical pendulum that barely makes it over the top takes forever,
    so the levels crowd together there.

One knob, the depth q = V0 / (2 pi^2), in the units where the bare ring's
levels are k^2. Eight strikes, q = 0 to 32.

Mapping, the same one walls.py used: each level gap above the ground state
is a partial, and each strike is tuned so its first gap is A3 (220 Hz).
So the pitch is fixed and only the SPACING changes. That keeps the test
fair, because the ear hears the timbre change and not a melody.
    f_n = 220 Hz * (E_n - E_0) / (E_1 - E_0)
    a_n = <pluck | phi_n> * phi_n(pickup)     pluck at x = 0.40, pickup at 0.46

Writes beside this script:
  pendulum.wav          eight strikes, the well deepening
  pendulum.mp4          the same audio with the well, its ladder and the partials
  pendulum-poster.png   the ladder against depth, and the revival carpet blurring
and prints the checks:
  1. momentum-basis solver vs. an independent finite-difference solver
  2. deep well: the bottom gaps against the harmonic-oscillator spacing
  3. the crowding sits at the separatrix
  4. FFT of the rendered audio vs. the intended partials
  5. revival fidelity |<psi(T)|psi(0)>|^2 as the bump grows

numpy + matplotlib + ffmpeg (scipy not needed).
"""
import os, subprocess, wave
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.colors import LinearSegmentedColormap

HERE = os.path.dirname(os.path.abspath(__file__))
SR, FPS = 44100, 30
F0 = 220.0
K = 90                                   # plane waves |k| <= K
k = np.arange(-K, K + 1)
M = 512                                  # grid points round the ring
X = np.arange(M) / M
QS = [0.0, 0.5, 1.5, 3.0, 6.0, 10.0, 18.0, 32.0]
STRIKE_S = 3.0
PLUCK, PW, PICK = 0.40, 0.022, 0.46
NPART = 40                               # partials kept per strike


def solve(q):
    """levels in units of 2 pi^2 (bare ring: k^2) and eigenvectors in the plane-wave basis"""
    H = np.diag(k.astype(float)**2)
    off = np.full(2 * K, q / 2)           # V0 cos(2 pi x) couples k <-> k +- 1 with V0/2
    H += np.diag(off, 1) + np.diag(off, -1)
    E, U = np.linalg.eigh(H)
    return E, U


def on_grid(U):
    """eigenvectors as functions round the ring (columns), normalised so sum |phi|^2 / M = 1"""
    full = np.zeros((M, U.shape[1]), complex)
    full[k % M] = U
    return np.fft.ifft(full, axis=0) * M


def ring_dist(a, b):
    d = np.abs(a - b) % 1
    return np.minimum(d, 1 - d)


PL = np.exp(-ring_dist(X, PLUCK)**2 / (2 * PW**2))
PL /= np.sqrt(np.mean(PL**2))
iPICK = int(round(PICK * M))


def strike_data(q):
    E, U = solve(q)
    phi = on_grid(U[:, :NPART + 1])
    c = (phi.conj() * PL[:, None]).mean(axis=0)
    a = np.real(c * phi[iPICK])[1:]
    gaps = E[1:NPART + 1] - E[0]
    f = F0 * gaps / gaps[0]
    return dict(q=q, E=E, U=U, phi=phi, gaps=gaps, f=f, a=a)


S = [strike_data(q) for q in QS]

# ======================================================================
# audio
# ======================================================================
n1 = int(STRIKE_S * SR)
t1 = np.arange(n1) / SR
audio = []
for s in S:
    y = np.zeros(n1)
    amax = np.abs(s["a"]).max()
    for f, a in zip(s["f"], s["a"]):
        if f > 15000 or abs(a) < 1e-4 * amax:
            continue
        tau = 1.6 * (F0 / f)**0.45
        y += a * np.exp(-t1 / tau) * np.sin(2 * np.pi * f * t1)
    y *= np.minimum(t1 / 0.003, 1)
    y *= np.minimum((n1 - np.arange(n1)) / (0.05 * SR), 1)
    y /= np.sqrt(np.mean(y[: SR // 2]**2)) + 1e-12
    audio.append(y)
audio = np.concatenate(audio)
audio *= 0.85 / np.abs(audio).max()
TOTAL = audio.size / SR
WAV = os.path.join(HERE, "pendulum.wav")
with wave.open(WAV, "wb") as wv:
    wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())
print(f"wrote {WAV} ({TOTAL:.1f} s)")

# ======================================================================
# checks
# ======================================================================
print("== check 1: plane-wave solver vs. finite differences (q = 10, first 12 levels) ==")
NG = 2048
xg = np.arange(NG) / NG
dx = 1 / NG
q = 10.0
V0 = q * 2 * np.pi**2
L = (np.diag(-2 * np.ones(NG)) + np.diag(np.ones(NG - 1), 1) + np.diag(np.ones(NG - 1), -1))
L[0, -1] = L[-1, 0] = 1
Hfd = -0.5 * L / dx**2 + np.diag(V0 * np.cos(2 * np.pi * xg))
Efd = np.linalg.eigvalsh(Hfd)[:12] / (2 * np.pi**2)
Epw = solve(q)[0][:12]
print(f"  max |E_pw - E_fd| = {np.max(np.abs(Epw - Efd)):.2e}  (levels span {Epw[0]:.2f} .. {Epw[11]:.2f})")

print("== check 2: deep well (q = 32): bottom gaps vs. a harmonic oscillator ==")
s = S[-1]
w_ho = np.sqrt(2 * s["q"])                # small-swing spacing omega = 2 pi sqrt(V0), in units of 2 pi^2
print(f"  harmonic-oscillator spacing predicts {w_ho:.3f};  measured first gap {s['gaps'][0]:.3f}")
print("  gap_n / gap_1 :", " ".join(f"{r:.3f}" for r in s["gaps"][:8] / s["gaps"][0]),
      "  (a string would read 1 2 3 4 5 6 7 8)")

print("== check 3: the rungs shrink toward the top, then pair up ==")
for s in S[4:]:
    E = s["E"]
    top = s["q"]                           # top of the bump, units of 2 pi^2
    n_sc = 4 * np.sqrt(2 * s["q"]) / np.pi # semiclassical count under the top: (1/2pi) loop-integral p dx
    trapped = int(np.sum(E < top))
    print(f"  q = {s['q']:>4}: {trapped:2d} levels under the top (semiclassical {n_sc:.1f});"
          f" successive gaps {' '.join(f'{g:.2f}' for g in np.diff(E[:trapped + 5]))}")
print("  (gaps fall as the swing widens; past the top they come in near-equal pairs, the rotor spinning either way)")

print("== check 4: FFT of the rendered audio vs. intended partials ==")
for i, s in enumerate(S):
    seg = audio[i * n1 + int(0.05 * SR): i * n1 + int(0.05 * SR) + 32768] * np.hanning(32768)
    sp = np.abs(np.fft.rfft(seg, 1 << 18))
    fr = np.fft.rfftfreq(1 << 18, 1 / SR)
    order = np.argsort(-np.abs(s["a"]))
    want = [s["f"][j] for j in order if s["f"][j] < 5000][:5]
    errs = []
    for f in want:
        win = np.abs(fr - f) < 6
        errs.append(abs(fr[win][np.argmax(sp[win])] - f))
    print(f"  q = {s['q']:>4}: five loudest partials found within {max(errs):.2f} Hz;"
          f" ratios {' '.join(f'{r:.2f}' for r in s['f'][:6] / F0)}")

print("== check 5: does the packet come home at the bare ring's revival time? ==")
CARPET_QS = [0.0, 1.0, 16.0]


def evolve_grid(q, ts, x0=0.25, w=0.035):
    E, U = solve(q)
    full = np.zeros(M, complex)
    full[k % M] = np.exp(-(2 * np.pi * k * w)**2 / 2) * np.exp(-2j * np.pi * k * x0)
    psik = full[k % M]; psik /= np.linalg.norm(psik)
    c = U.conj().T @ psik
    out = []
    for t in ts:
        pk = U @ (c * np.exp(-2j * np.pi * E * t))
        f2 = np.zeros(M, complex); f2[k % M] = pk
        out.append(np.fft.ifft(f2) * M)
    return np.array(out), psik, U, c, E


FID = {}
for q in CARPET_QS:
    _, psik, U, c, E = evolve_grid(q, [0.0])
    pT = U @ (c * np.exp(-2j * np.pi * E * 1.0))
    FID[q] = abs(np.vdot(psik, pT))**2
    print(f"  q = {q:>4}: |<psi(T)|psi(0)>|^2 = {FID[q]:.4f}")

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
CMAP = LinearSegmentedColormap.from_list("carpet", [BG, "#16264a", INFO, "#bcd2ff", ACC])

LINES = {
    0.0: ("The bare ring", "No bump. Gaps 1 · 4 · 9 — Schrödinger's squares, as in the walls video."),
    0.5: ("A small bump", "Each pair of levels splits a little. Still roughly squares."),
    1.5: ("The bump grows", "The bottom of the ladder starts to even out."),
    3.0: ("A shallow well", "Two levels caught under the bump. Squares above them."),
    6.0: ("Trapped", "Low rungs swing in the well, near-even. Above the top, the rotor."),
    10.0: ("Deeper", "Rungs close up as the swing nears the top, then pair off above it."),
    18.0: ("A pendulum", "1 · 1.95 · 2.85 · 3.69 — near a string's 1 · 2 · 3 · 4, from Schrödinger."),
    32.0: ("A deep pendulum", "1 · 1.97 · 2.89 · 3.78 — a string, slightly flat: big swings are slower."),
}

W_PX, H_PX, DPI = 1280, 720, 100
fig = plt.figure(figsize=(W_PX / DPI, H_PX / DPI), dpi=DPI)
ax_w = fig.add_axes([0.05, 0.21, 0.30, 0.57])
ax_p = fig.add_axes([0.42, 0.21, 0.55, 0.57])
ax_t = fig.add_axes([0.05, 0.05, 0.92, 0.045])
RMAX = 16


def draw_static(i):
    s = S[i]
    for ax in (ax_w, ax_p):
        ax.cla()
        for sp_ in ax.spines.values():
            sp_.set_color(BORDER)
    # well with level lines (energies in units; show up to a window)
    q_ = s["q"]
    V = q_ * np.cos(2 * np.pi * X)
    E = s["E"]
    lo = min(E[0], -q_) - 0.04 * max(q_, 6)
    hi = max(q_ + 0.6 * max(q_, 6), E[0] + 30)
    ax_w.plot(X, V, color=FG2, lw=1.4)
    ax_w.fill_between(X, V, lo, color="#1b1b26")
    for n, e in enumerate(E[:60]):
        if e > hi:
            break
        trapped = e < q_
        ax_w.plot([0, 1], [e, e], color=ACC if trapped else INFO, lw=0.9 if n < NPART + 1 else 0.4,
                  alpha=0.95 if trapped else 0.6)
    if q_ > 0:
        ax_w.axhline(q_, color=FG4, lw=0.8, ls=(0, (3, 3)))
        ax_w.text(0.02, q_, " top of the bump", fontsize=7, color=FG3, va="bottom")
    ax_w.set_xlim(0, 1); ax_w.set_ylim(lo, hi)
    ax_w.set_xticks([0, 0.5, 1]); ax_w.set_xticklabels(["0", "round the ring", "1"], fontsize=8)
    ax_w.set_yticks([])
    ax_w.set_title("the well and its levels  (gold: swinging · blue: spinning)", fontsize=9, color=FG3, loc="left")
    # partials as ratio to the first gap
    r = s["f"] / F0
    a = np.abs(s["a"]); a = a / a.max()
    for h in range(1, RMAX + 1):
        ax_p.axvline(h, color=FG4, lw=0.5, zorder=0)
    for sq in (1, 4, 9, 16):
        ax_p.axvline(sq, color=INFO, lw=0.8, ls=(0, (2, 3)), alpha=0.6, zorder=0)
    E_ = s["E"]
    for rr, aa, n in zip(r, a, range(1, NPART + 1)):
        if rr > RMAX + 0.5:
            continue
        col = ACC if E_[n] < q_ else INFO
        ax_p.plot([rr, rr], [0, max(aa, 0.015)], color=col, lw=2.6, solid_capstyle="butt")
    ax_p.set_xlim(0.4, RMAX + 0.6); ax_p.set_ylim(0, 1.1); ax_p.set_yticks([])
    ax_p.set_xticks(range(1, RMAX + 1)); ax_p.tick_params(labelsize=8)
    ax_p.set_xlabel("partial ÷ lowest partial   (grey: string 1·2·3…   blue dashed: squares 1·4·9·16)", fontsize=8)
    ax_p.set_title("what the ear gets: every strike tuned so its lowest partial is A3", fontsize=9, color=FG3, loc="left")
    fig.texts.clear()
    name, line = LINES[s["q"]]
    fig.text(0.05, 0.945, "QUANTUM SYNTHESIZER · PENDULUM", fontsize=9, color=FG3)
    fig.text(0.05, 0.875, name, fontsize=26, color=FG1, family=SERIF)
    fig.text(0.05, 0.825, line, fontsize=15, color=FG2, family=SERIF, style="italic")
    fig.text(0.97, 0.945, f"DEPTH q = {s['q']:g}   ·   STRIKE {i + 1} / {len(S)}", fontsize=9, color=ACC, ha="right")
    fig.text(0.97, 0.895, "i ∂ψ/∂t = −½ ∂²ψ/∂x² + V₀ cos 2πx", fontsize=11, color=FG1, ha="right")
    fig.text(0.97, 0.86, "the quantum pendulum — Mathieu's equation on the ring", fontsize=8, color=FG3, ha="right")


ax_t.set_xlim(0, TOTAL); ax_t.set_ylim(0, 1); ax_t.axis("off")
ax_t.add_patch(plt.Rectangle((0, 0.15), TOTAL, 0.7, fc=EL1, ec=BORDER, lw=0.8))
for i, s in enumerate(S):
    ax_t.plot([i * STRIKE_S] * 2, [0.15, 0.85], color=FG4, lw=0.8)
    ax_t.text(i * STRIKE_S + 0.08, 1.05, f"q {s['q']:g}", fontsize=7, color=FG3, va="bottom")
t_line = ax_t.axvline(0, color=ACC, lw=1.4)

MP4 = os.path.join(HERE, "pendulum.mp4")
cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
       "-s", f"{W_PX}x{H_PX}", "-r", str(FPS), "-i", "-", "-i", WAV,
       "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23", "-preset", "medium",
       "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", MP4]
proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
n_frames = int(np.ceil(TOTAL * FPS))
cur = -1
for jf in range(n_frames):
    sec = jf / FPS
    i = min(int(sec // STRIKE_S), len(S) - 1)
    if i != cur:
        draw_static(i); cur = i
    t_line.set_xdata([sec, sec])
    fig.canvas.draw()
    proc.stdin.write(np.asarray(fig.canvas.buffer_rgba())[:, :, :3].tobytes())
proc.stdin.close(); proc.wait()
print(f"wrote {MP4} ({n_frames} frames, {TOTAL:.1f} s)")

# ---- poster ------------------------------------------------------------
pf = plt.figure(figsize=(16, 8), dpi=110)
a1 = pf.add_axes([0.05, 0.10, 0.40, 0.76])
for sp_ in a1.spines.values():
    sp_.set_color(BORDER)
qq = np.linspace(0, 32, 400)
R = np.array([(lambda E: (E[1:13] - E[0]) / (E[1] - E[0]))(solve(q_)[0]) for q_ in qq])
for j in range(R.shape[1]):
    a1.plot(qq, R[:, j], color=FG2, lw=1.0)
for h in range(1, 13):
    a1.axhline(h, color=FG4, lw=0.5, zorder=0)
for sq in (4, 9):
    a1.text(0.3, sq, "  square", fontsize=7, color=INFO, va="bottom")
a1.set_ylim(0, 12.5); a1.set_xlim(0, 32)
a1.set_yticks(range(1, 13))
a1.set_xlabel("depth of the bump  q = V₀ / 2π²")
a1.set_ylabel("each partial ÷ the lowest")
a1.set_title("the ladder as the bump deepens: the squares fold down toward 1 · 2 · 3 …", fontsize=10, color=FG2, loc="left")

ts = np.linspace(0, 1.0, 700)
for j, q_ in enumerate(CARPET_QS):
    ax = pf.add_axes([0.52 + j * 0.155, 0.10, 0.14, 0.76])
    psi, *_ = evolve_grid(q_, ts)
    D = np.abs(psi)**2
    ax.imshow(D, aspect="auto", cmap=CMAP, vmin=0, vmax=np.percentile(D, 99.7), origin="upper",
              extent=[0, 1, 1, 0], interpolation="bilinear")
    ax.set_xticks([]); ax.set_yticks([0, 0.5, 1] if j == 0 else [])
    if j == 0:
        ax.set_yticklabels(["0", "½T", "T"])
    ax.set_title(f"q = {q_:g}\nback at T: {FID[q_] * 100:.0f}%", fontsize=9, color=FG2)
    for sp_ in ax.spines.values():
        sp_.set_color(BORDER)
pf.text(0.52, 0.035, "cycle 10's Talbot carpet with the bump: copies blur, the packet stops coming home; deep, it just swings",
        fontsize=8, color=FG3)
pf.text(0.05, 0.93, "QUANTUM SYNTHESIZER · PENDULUM — one bump on the ring, from Schrödinger's squares to a string's harmonics",
        fontsize=12, color=FG1)
PNG = os.path.join(HERE, "pendulum-poster.png")
pf.savefig(PNG, facecolor=BG)
print(f"wrote {PNG}")
