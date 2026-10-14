#!/usr/bin/env python3
"""
Wick — the angle of i
=====================
The entry's opening claims, tested with sound:

  "The imaginary unit i forces oscillation. Remove it, and you have exponential
   growth or decay ... This is exactly the structure of a resonant filter: a
   second-order system with complex conjugate poles ... The Schrodinger
   equation is the infinite-dimensional version of an RLC resonant circuit."

Instead of removing i, this script TURNS it. Rotate the time axis by an angle
theta (physicists call the 90-degree turn a Wick rotation):

      d(psi)/dt = -i * e^(-i*theta) * H * psi

  theta = 0     Schrodinger. Every level rings forever.
  theta = 90    the heat equation. No ringing at all; every level just fades,
                the high ones fastest, until only the ground state's shape is left.

Each level n then evolves as exp(-i E_n t cos(theta)) * exp(-E_n t sin(theta)):
a resonator pole at distance E_n from the origin, turned theta away from the
imaginary axis. In filter language its DAMPING RATIO is sin(theta) — the same
for every level. So one knob, the angle of i, sets the damping of the whole
bank at once, and every partial rings for the same number of its own cycles:
a constant-Q bell, whose high partials die n^2 times sooner than the
fundamental because they are n^2 times faster.

Same box, pluck and pickup as walls.py (hard walls, ground level = 220 Hz,
pluck bump at x = 0.23, pickup at x = 0.37), first 9 levels (the 10th is above
Nyquist). Two ears, as in ladder.py:
  CLOCK     Re psi at the pickup — the phase turning (unobservable).
  DETECTOR  |psi|^2 at the pickup — what a measurement registers.

Checks:
  1 the PDE, integrated directly in rotated time (Crank-Nicolson on a grid),
    matches the modal formula
  2 from the clock's SOUND alone (matrix-pencil pole fit), every partial's
    damping ratio equals sin(theta)
  3 the detector hears differences of levels but decays at their SUMS:
    the beat between levels 1 and 2 sits at 3*220*cos(theta) Hz and dies at
    (1+4)*E_1*sin(theta) — so its damping ratio is about (5/3) sin(theta), not sin(theta)
  4 at theta = 90 the clock never crosses zero: no pitch

Writes beside this script: wick.wav, wick.mp4, wick-poster.png, wick-checks.txt
numpy + matplotlib + ffmpeg (no scipy).
"""
import os, io, sys, subprocess, wave
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager

HERE = os.path.dirname(os.path.abspath(__file__))
SR, FPS = 44100, 30
F1 = 220.0
W1 = 2 * np.pi * F1                     # ground-level angular frequency, rad/s
K = 9                                   # levels kept: 9*9*220 = 17820 Hz < Nyquist
X_PLUCK, W_PLUCK, X_PICK = 0.23, 0.03, 0.37
LOG = io.StringIO()


def say(*a):
    s = " ".join(str(x) for x in a)
    print(s); LOG.write(s + "\n")


n_ = np.arange(1, K + 1)
E = n_**2.0                              # in units of E_1


def phi(n, x):
    return np.sqrt(2) * np.sin(np.pi * np.outer(n, x))


xg = np.linspace(0, 1, 4001)
pl = np.exp(-(xg - X_PLUCK)**2 / (2 * W_PLUCK**2))
pl /= np.sqrt(np.trapezoid(pl**2, xg))
C = np.trapezoid(phi(n_, xg) * pl, xg, axis=1)          # pluck in the level basis
C /= np.linalg.norm(C)
PICK = phi(n_, np.array([X_PICK]))[:, 0]


def modal(theta, t, c=C, at=PICK):
    """psi at the pickup over time t (seconds), rotated by theta (radians)."""
    rot = np.exp(-1j * theta)
    return (c * at) @ np.exp(-1j * W1 * np.outer(E, t) * rot)


def ears(theta, t):
    psi = modal(theta, t)
    return np.real(psi), np.abs(psi)**2


ok = True

# ----------------------------------------------------------------------
say("== check 1: integrate the rotated equation directly (Crank-Nicolson), compare to the modal formula ==")
NG = 1200
xi = np.linspace(0, 1, NG + 2)[1:-1]; h = xi[1] - xi[0]
psi0 = (C @ phi(n_, xi))                                  # the K-level pluck on the grid
# H = -(1/pi^2) d2/dx2 so that H sin(n pi x) = n^2 sin(n pi x); time in units of 1/W1
lam = 1.0 / (np.pi**2 * h**2)
Hm = lam * (2 * np.eye(NG) - np.eye(NG, k=1) - np.eye(NG, k=-1))
TAU, SQ = 0.5, 16                                         # 2^16 Crank-Nicolson steps
for deg in (0.0, 30.0, 90.0):
    th = np.radians(deg); g = -1j * np.exp(-1j * th)      # d psi/dtau = g H psi
    dt = TAU / 2**SQ
    I = np.eye(NG)
    P = np.linalg.solve(I - (g * dt / 2) * Hm, I + (g * dt / 2) * Hm)
    for _ in range(SQ):
        P = P @ P
    v = P @ psi0.astype(complex)
    ref = (C * np.exp(g * E * TAU)) @ phi(n_, xi)
    err = np.linalg.norm(v - ref) / np.linalg.norm(psi0)
    say(f"  theta = {deg:4.0f} deg   after t = {TAU}/omega_1, 2^{SQ} steps: grid vs formula, relative error {err:.1e}"
        f"   (norm left {np.linalg.norm(v) / np.linalg.norm(psi0):.4f})")
    ok &= err < 2e-3

# ----------------------------------------------------------------------
say("== check 2: fit poles to the clock's SOUND; damping ratio of every partial should equal sin(theta) ==")


def pencil(y, M, L=None):
    """matrix-pencil estimate of M complex exponentials in y; returns s = log(z)*SR."""
    N = len(y); L = L or N // 3
    Y = np.array([y[i:i + L + 1] for i in range(N - L)])
    U, s, Vh = np.linalg.svd(Y, full_matrices=False)
    V = Vh[:M].conj().T
    V1, V2 = V[:-1], V[1:]
    z = np.linalg.eigvals(np.linalg.pinv(V1) @ V2)
    return np.log(z) * SR


rows = []
for deg in (0.1, 1.0, 5.0, 30.0):
    th = np.radians(deg)
    t = np.arange(900) / SR
    clk, _ = ears(th, t)
    s = pencil(clk, 2 * K)
    s = s[np.imag(s) > 1]                                  # one of each conjugate pair
    s = s[np.argsort(np.abs(s))]
    zeta = -np.real(s) / np.abs(s)
    fhat = np.abs(s) / (2 * np.pi * F1)                    # natural freq in units of 220 Hz
    good = np.allclose(fhat[:5], E[:5], rtol=2e-3) and np.allclose(zeta[:5], np.sin(th), rtol=2e-2, atol=2e-5)
    ok &= good
    say(f"  theta = {deg:5.1f} deg  sin(theta) = {np.sin(th):.5f}   fitted damping ratios, levels 1-5: "
        + ", ".join(f"{z:.5f}" for z in zeta[:5])
        + f"   pitches (x220 Hz): " + ", ".join(f"{f * np.cos(th):.3f}" for f in fhat[:5])
        + ("   PASS" if good else "   FAIL"))
    rows.append((deg, np.sin(th), zeta[:5]))

# ----------------------------------------------------------------------
say("== check 3: the detector beats at DIFFERENCES but dies at SUMS ==")
for deg in (1.0, 5.0):
    th = np.radians(deg)
    # isolate the 1-2 beat by plucking only levels 1 and 2
    c2 = np.zeros(K); c2[:2] = C[:2]; c2 /= np.linalg.norm(c2)
    t = np.arange(4000) / SR
    d = np.abs(modal(th, t, c=c2))**2
    s = pencil(d - 0, 5)
    s = s[np.imag(s) > 1]
    want_f = 3 * F1 * np.cos(th); want_sig = 5 * W1 * np.sin(th)
    got_f = np.imag(s[0]) / (2 * np.pi); got_sig = -np.real(s[0])
    z = got_sig / np.abs(s[0])
    good = abs(got_f - want_f) < 0.5 and abs(got_sig / want_sig - 1) < 1e-3
    ok &= good
    say(f"  theta = {deg:3.0f} deg   beat {got_f:7.2f} Hz (want {want_f:.2f})   decay {got_sig:7.2f}/s (want {want_sig:.2f})"
        f"   damping ratio {z:.4f} = {z / np.sin(th):.3f} x sin(theta)" + ("   PASS" if good else "   FAIL"))

# ----------------------------------------------------------------------
say("== check 4: at theta = 90 deg the clock never oscillates ==")
t = np.arange(1, 4000) / SR
clk, d = ears(np.pi / 2, t)
zc = int(np.sum(np.diff(np.sign(clk)) != 0))
turns = int(np.sum(np.diff(np.sign(np.diff(d))) != 0))
say(f"  zero crossings of the clock in 90 ms: {zc}   (pitch: none)   detector turning points: {turns} (the bump spreads to the pickup, then fades: a thud)")
ok &= zc <= 1
say("  ALL PASS" if ok else "  SOME FAIL")

# ======================================================================
# audio: one strike per angle, clock then detector
# ======================================================================
if os.environ.get('CHECKS_ONLY'):
    sys.exit(0 if ok else 1)
ANGLES = [0.0, 0.01, 0.03, 0.1, 0.3, 1.0, 5.0, 30.0, 90.0]
SEGDUR, GAP = 2.4, 0.3


def fade_in_out(x, a_ms=3, r_ms=40):
    a = int(a_ms * SR / 1000); r = int(r_ms * SR / 1000)
    x = x.copy(); x[:a] *= np.linspace(0, 1, a); x[-r:] *= np.linspace(1, 0, r); return x


SEG, chunks, tc = [], [], 0.0


def seg_dur(deg):
    # long enough to hear the whole ring (10 e-folds of the fundamental), never under 0.6 s
    if deg == 0 or deg == 90:
        return SEGDUR if deg == 0 else 0.6
    return float(np.clip(10 / (W1 * np.sin(np.radians(deg))), 0.6, SEGDUR))


for deg in ANGLES:
    th = np.radians(deg)
    dur = seg_dur(deg)
    t = np.arange(int(dur * SR)) / SR
    clk, d = ears(th, t)
    for ear, s in (("clock", clk), ("detector", d - d[-1])):
        s = s - (s.mean() if deg == 0 and ear == "detector" else 0)
        pk = np.max(np.abs(s)); s = fade_in_out(0.5 * s / pk)
        SEG.append(dict(deg=deg, ear=ear, t0=tc, t1=tc + dur, dur=dur, sig=s))
        chunks += [s, np.zeros(int(GAP * SR))]; tc += dur + GAP
audio = np.concatenate(chunks)
TOTAL = len(audio) / SR
WAV = os.path.join(HERE, "wick.wav")
with wave.open(WAV, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())
say(f"wrote wick.wav ({TOTAL:.1f} s): " + ", ".join(f"{a:g}°" for a in ANGLES) + ", each clock then detector")
for deg in ANGLES:
    th = np.radians(deg)
    if deg == 90:
        say(f"  {deg:5g}°  no pitch: every level fades, ground state last (e-fold {1e3 / (W1):.2f} ms)"); continue
    tau1 = 1 / (W1 * np.sin(th)) if deg > 0 else np.inf
    say(f"  {deg:5g}°  damping ratio {np.sin(th):.5f}   fundamental {F1 * np.cos(th):6.1f} Hz rings {('forever' if deg == 0 else f'{tau1 * 1e3:8.1f} ms')}"
        f"   9th level {('forever' if deg == 0 else f'{tau1 / 81 * 1e3:6.2f} ms')}")

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
plt.rcParams.update({"font.family": [MONO, "DejaVu Sans Mono"], "text.color": FG2, "axes.labelcolor": FG3,
                     "xtick.color": FG3, "ytick.color": FG3, "axes.edgecolor": BORDER,
                     "axes.facecolor": EL1, "figure.facecolor": BG, "font.size": 10})


def style(ax):
    for sp in ax.spines.values():
        sp.set_color(BORDER)
    ax.tick_params(length=3)


def splane(ax, deg, hi=None):
    """poles of levels 1..6 drawn at radius n (so they fit), turned by theta."""
    th = np.radians(deg)
    ax.axvline(0, color=FG4, lw=0.8); ax.axhline(0, color=FG4, lw=0.8)
    for n in range(1, 7):
        r = n
        a = np.linspace(np.pi / 2, np.pi, 50)
        ax.plot(r * np.cos(a), r * np.sin(a), color=FG4, lw=0.5)
        x, y = -r * np.sin(th), r * np.cos(th)
        ax.plot([x, x], [y, -y], "x", color=ACC, ms=7, mew=1.6)
    ax.plot([0, -6.6 * np.sin(th)], [0, 6.6 * np.cos(th)], color=INFO, lw=0.9, ls=":")
    ax.set_xlim(-6.8, 1.2); ax.set_ylim(-6.8, 6.8); ax.set_aspect("equal")
    ax.set_xticks([]); ax.set_yticks([])
    ax.text(-6.6, 6.0, f"θ = {deg:g}°", color=FG1, fontsize=11)
    ax.text(-6.6, -6.4, f"damping ratio sin θ = {np.sin(th):.4g}", color=FG3, fontsize=8)


def spec_img(sig):
    nfft, hop = 1024, 32
    w = np.hanning(nfft)
    fr = [np.abs(np.fft.rfft(sig[i:i + nfft] * w)) for i in range(0, len(sig) - nfft, hop)]
    S = 20 * np.log10(np.array(fr).T + 1e-9)
    return S - S.max()


# ---- poster: one row per angle, s-plane | clock spectrogram | detector spectrogram ----
PA = [0.0, 0.01, 0.03, 0.1, 0.3, 1.0, 90.0]
fig, axs = plt.subplots(len(PA), 3, figsize=(15, 3.0 * len(PA)), gridspec_kw=dict(width_ratios=[0.6, 1, 1]))
fig.subplots_adjust(left=0.04, right=0.98, top=0.93, bottom=0.04, hspace=0.25, wspace=0.12)
fig.text(0.04, 0.965, "The angle of i: turn the time axis and every partial gets the same damping ratio",
         fontsize=22, family=[SERIF, "DejaVu Serif"], color=FG1)
fig.text(0.04, 0.945, "dψ/dt = −i·e^(−iθ)·Hψ   ·   θ = 0 Schrödinger (rings forever)   ·   θ = 90° heat equation (no pitch)   ·"
         "   box, hard walls, ground level 220 Hz", fontsize=10, color=FG3)
for i, deg in enumerate(PA):
    a0, a1, a2 = axs[i]
    for a in axs[i]:
        style(a)
    splane(a0, deg)
    sg = {s["ear"]: s for s in SEG if s["deg"] == deg}
    for a, ear, col in ((a1, "clock", "magma"), (a2, "detector", "magma")):
        S = spec_img(sg[ear]["sig"])
        a.imshow(S, origin="lower", aspect="auto", cmap=col, vmin=-70, vmax=0,
                 extent=[0, sg[ear]["dur"], 0, SR / 2 / 1000])
        a.set_ylim(0, 18); a.set_ylabel("kHz")
        a.set_xlim(0, sg[ear]["dur"] if deg in (0.0, 90.0) else min(sg[ear]["dur"], 12 / (W1 * np.sin(np.radians(deg)))))
        if i == len(PA) - 1:
            a.set_xlabel("seconds")
axs[0, 0].set_title("poles of levels 1-6 (radius ∝ n)", fontsize=9, color=FG2)
axs[0, 1].set_title("clock  Re ψ  (the phase turning; unobservable)", fontsize=9, color=FG2)
axs[0, 2].set_title("detector  |ψ|²  (what a measurement hears)", fontsize=9, color=FG2)
fig.savefig(os.path.join(HERE, "wick-poster.png"), facecolor=BG, dpi=90); plt.close(fig)
say("wrote wick-poster.png")

# ---- video ----
W_PX, H_PX = 1280, 720
fig = plt.figure(figsize=(W_PX / 100, H_PX / 100), dpi=100)
ax_s = fig.add_axes([0.03, 0.24, 0.27, 0.52])
ax_x = fig.add_axes([0.34, 0.50, 0.30, 0.26])
ax_w = fig.add_axes([0.34, 0.24, 0.30, 0.20])
ax_f = fig.add_axes([0.68, 0.24, 0.29, 0.52])
ax_t = fig.add_axes([0.03, 0.07, 0.94, 0.08])
for a in (ax_s, ax_x, ax_w, ax_f, ax_t):
    style(a)
t_title = fig.text(0.03, 0.90, "", fontsize=24, family=[SERIF, "DejaVu Serif"], color=FG1)
t_sub = fig.text(0.03, 0.84, "", fontsize=11, color=ACC)
fig.text(0.34, 0.775, "|ψ(x,t)|² in the box, slowed · pickup dotted", fontsize=9, color=FG3)
fig.text(0.34, 0.455, "what you hear (whole strike)", fontsize=9, color=FG3)
fig.text(0.68, 0.775, "spectrogram of this strike · playhead", fontsize=9, color=FG3)
for sg in SEG:
    ax_t.axvspan(sg["t0"], sg["t1"], color=FG4 if sg["ear"] == "clock" else ACC, alpha=0.35, lw=0)
for deg in ANGLES:
    t0 = [s for s in SEG if s["deg"] == deg][0]["t0"]
    ax_t.text(t0, 1.1, f"{deg:g}°", transform=ax_t.get_xaxis_transform(), fontsize=8, color=FG2)
ax_t.set_xlim(0, TOTAL); ax_t.set_yticks([])
ax_t.set_xlabel("seconds · grey: clock (the phase, unobservable) · gold: detector (what a measurement hears)")
head = ax_t.axvline(0, color=FG1, lw=1.4)
xs = np.linspace(0, 1, 400); PHX = phi(n_, xs)
line, = ax_x.plot([], [], color=INFO, lw=1.6)
ax_x.axvline(X_PICK, color=ACC, lw=0.9, ls=":"); ax_x.set_xlim(0, 1); ax_x.set_yticks([]); ax_x.set_xticks([])
SUB = {"clock": "CLOCK — Re ψ at the pickup: the phase turning, which nothing physical can hear",
       "detector": "DETECTOR — |ψ|² at the pickup: beats at differences of levels, dying at their sums"}
cur, fhead, whead = None, None, None
MP4 = os.path.join(HERE, "wick.mp4")
cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
       "-s", f"{W_PX}x{H_PX}", "-r", str(FPS), "-i", "-", "-i", WAV,
       "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23", "-preset", "medium",
       "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", MP4]
proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
n_frames = int(TOTAL * FPS)
SLOW = 1 / 400                                           # physics seconds per video second
for jf in range(n_frames):
    tt = jf / FPS
    sg = next((s for s in SEG if s["t0"] <= tt < s["t1"] + GAP), SEG[-1])
    if id(sg) != cur:
        cur = id(sg)
        th = np.radians(sg["deg"])
        ax_s.cla(); style(ax_s); splane(ax_s, sg["deg"])
        ax_w.cla(); style(ax_w); tw = np.arange(len(sg["sig"])) / SR
        ax_w.plot(tw, sg["sig"], color=FG2 if sg["ear"] == "clock" else ACC, lw=0.3)
        ax_w.set_xlim(0, sg["dur"]); ax_w.set_ylim(-0.55, 0.55); ax_w.set_yticks([])
        whead = ax_w.axvline(0, color=FG1, lw=1)
        ax_f.cla(); style(ax_f)
        ax_f.imshow(spec_img(sg["sig"]), origin="lower", aspect="auto", cmap="magma", vmin=-70, vmax=0,
                    extent=[0, sg["dur"], 0, SR / 2 / 1000])
        ax_f.set_ylim(0, 18); ax_f.set_ylabel("kHz"); ax_f.set_xlabel("s")
        fhead = ax_f.axvline(0, color=FG1, lw=1)
        word = {0.0: "Schrödinger: rings forever", 90.0: "the heat equation: no pitch at all"}.get(sg["deg"], "")
        t_title.set_text(f"θ = {sg['deg']:g}°" + (f"  ·  {word}" if word else f"  ·  every partial damped at ratio {np.sin(th):.4g}"))
        t_sub.set_text(SUB[sg["ear"]])
    loc = min(max(tt - sg["t0"], 0), sg["dur"])
    tph = loc * SLOW
    psi = (C * np.exp(-1j * W1 * E * tph * np.exp(-1j * th))) @ PHX
    line.set_data(xs, np.abs(psi)**2)
    ax_x.set_ylim(0, 12)
    whead.set_xdata([loc, loc]); fhead.set_xdata([loc, loc]); head.set_xdata([tt, tt])
    fig.canvas.draw()
    proc.stdin.write(np.asarray(fig.canvas.buffer_rgba())[:, :, :3].tobytes())
proc.stdin.close(); proc.wait()
say(f"wrote wick.mp4 ({n_frames} frames)")

with open(os.path.join(HERE, "wick-checks.txt"), "w") as fh:
    fh.write(LOG.getvalue())
sys.exit(0 if ok else 1)
