#!/usr/bin/env python3
"""
Round trip — string to Schrodinger and back, in one held tone
=============================================================
Two earlier proofs walked two different roads between the same two ladders:

  * stiffness.py: stiffen a string until it is a pinned bar. The partials
    climb from the string's 1, 2, 3, 4 to Schrodinger's squares 1, 4, 9, 16.
        f_n = f0 * n * sqrt((1 - lam) + lam * n^2)      lam = B / (1 + B)
  * pendulum.py: put a cosine bump on Schrodinger's ring and deepen it.
    The squares fold back down toward 1, 2, 3, 4, because a small swing in
    any well is a harmonic oscillator.
        i psi_t = -(1/2) psi_xx + V0 cos(2 pi x),   q = V0 / (2 pi^2)

This script joins them end to end so the ear hears the loop: string ->
squares (by changing the EQUATION: wave equation -> bending -> Schrodinger)
-> string again (by changing the WELL, Schrodinger held fixed). Two ways to
the same two spacings. That is the claim of the entry section drafted beside
this script, "One equation, two spacings".

The tone is held, pitch pinned: the lowest partial is A3 (220 Hz) the whole
way, so only the spacing above it moves.

Loudness: one law throughout, the stiffness proof's pluck/pickup weights A_n
on the box. At the seam the box's partial n becomes the ring's pair at the
same pitch (+k and -k, spinning both ways), each oscillator taking A_n / 2
and starting at the box partial's phase, so the seam is sample-continuous.
That loudness law is a CHOICE on the ring leg (not the ring's own pluck);
it keeps the comparison fair, so only the spacing changes.

Writes beside this script:
  round-trip.wav          21 s held tone
  round-trip.mp4          the same audio, the two roads drawn as one, a playhead
  round-trip-poster.png   the loop in one still
  round-trip-checks.txt   the printed checks
numpy + scipy + matplotlib + ffmpeg.
"""
import os, subprocess, wave, sys, io
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager

HERE = os.path.dirname(os.path.abspath(__file__))
SR, FPS = 44100, 30
F0 = 220.0
NP = 12                                   # box partials (leg A)
NR = 2 * NP                               # ring partials (leg B): each box partial is a +-k pair
F_FADE, F_MAX = 12000.0, 15500.0
Q_END = 32.0
n = np.arange(1, NP + 1)

# same pluck / pickup weights as stiffness.py and walls.py
X_PLUCK, W_PLUCK, X_PICK = 0.23, 0.03, 0.37
A = (np.sqrt(2) * W_PLUCK * np.sqrt(2 * np.pi) * np.sin(n * np.pi * X_PLUCK)
     * np.exp(-(n * np.pi * W_PLUCK)**2 / 2)) * np.sqrt(2) * np.sin(n * np.pi * X_PICK)

LOG = io.StringIO()


def say(*a):
    s = " ".join(str(x) for x in a)
    print(s); LOG.write(s + "\n")


def gate(f):
    return np.clip((F_MAX - f) / (F_MAX - F_FADE), 0, 1)


def ratios_lam(lam):
    return n * np.sqrt((1 - lam) + lam * n**2)


def ring_ratios(q, K=40):
    """level gaps above the ground, over the first gap (bare ring: k^2 -> 1,1,4,4,9,9...)"""
    k = np.arange(-K, K + 1)
    H = np.diag(k.astype(float)**2)
    off = np.full(2 * K, q / 2)
    H += np.diag(off, 1) + np.diag(off, -1)
    E = np.linalg.eigvalsh(H)
    g = E[1:NR + 1] - E[0]
    return g / g[0]


# ======================================================================
# timeline
# ======================================================================
T_HOLD0, T_A, T_SEAM, T_B, T_HOLD1, T_REL = 1.5, 8.0, 1.5, 8.0, 1.5, 0.5
tA0 = T_HOLD0
tA1 = tA0 + T_A
tB0 = tA1 + T_SEAM
tB1 = tB0 + T_B
TOTAL = tB1 + T_HOLD1 + T_REL
N = int(TOTAL * SR)
t = np.arange(N) / SR
iSEAM = int(tB0 * SR)                     # leg B oscillators take over here


def smooth(u):
    u = np.clip(u, 0, 1)
    return u * u * (3 - 2 * u)


lam_t = smooth((t - tA0) / T_A)
uB = smooth((t - tB0) / T_B)
q_t = Q_END * uB**3                       # most of the fold happens at small q; spend time there

# ring ladder on a q grid, interpolated per sample
QG = Q_END * np.linspace(0, 1, 1201)**3
RG = np.array([ring_ratios(q) for q in QG])        # (len(QG), NR)

# ======================================================================
# audio
# ======================================================================
audio = np.zeros(N)
# leg A: 12 oscillators, string -> squares, run up to the seam
fA = F0 * n[None, :] * np.sqrt((1 - lam_t[:iSEAM, None]) + lam_t[:iSEAM, None] * n[None, :]**2)
phA = 2 * np.pi * np.cumsum(fA, axis=0) / SR
audio[:iSEAM] = (A[None, :] * gate(fA) * np.sin(phA)).sum(axis=1)
ph_seam = phA[-1] + 2 * np.pi * fA[-1] / SR            # phase each box partial would have at iSEAM

# leg B: 24 oscillators, pairs (2n-1, 2n) start on box partial n's pitch and phase
fB = np.empty((N - iSEAM, NR))
for j in range(NR):
    fB[:, j] = F0 * np.interp(q_t[iSEAM:], QG, RG[:, j])
phB = 2 * np.pi * (np.cumsum(fB, axis=0) - fB[0]) / SR + np.repeat(ph_seam, 2)[None, :]
aB = np.repeat(A / 2, 2)
audio[iSEAM:] = (aB[None, :] * gate(fB) * np.sin(phB)).sum(axis=1)

env = np.minimum(t / 0.02, 1) * np.minimum((N - np.arange(N)) / (T_REL * SR), 1)
audio *= env
audio *= 0.85 / np.abs(audio).max()
WAV = os.path.join(HERE, "round-trip.wav")
with wave.open(WAV, "wb") as wv:
    wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())
say(f"wrote round-trip.wav ({TOTAL:.1f} s)")

# ======================================================================
# checks
# ======================================================================


def peaks_near(t0, t1, want, tol=6.0):
    seg = audio[int(t0 * SR):int(t1 * SR)]
    w = np.hanning(seg.size)
    S = np.abs(np.fft.rfft(seg * w, 16 * seg.size))
    fr = np.fft.rfftfreq(16 * seg.size, 1 / SR)
    got = []
    for f in want:
        m = (fr > f - tol) & (fr < f + tol)
        got.append(fr[m][np.argmax(S[m])])
    return np.array(got)


say("== check 1: the three ends of the trip, FFT of the held audio vs. intended (Hz) ==")
ok = True
ends = [("string (start)", 0.3, tA0 - 0.05, F0 * n[:5]),
        ("squares (seam)", tA1 + 0.1, tB0 - 0.05, F0 * n[:4]**2),
        ("pendulum (end)", tB1 + 0.1, tB1 + T_HOLD1 - 0.05, F0 * RG[-1][:5])]
for name, a, b, want in ends:
    got = peaks_near(a, b, want)
    miss = np.abs(got - want).max()
    ok &= miss < 0.5
    say(f"  {name:16s} want {' '.join(f'{w:7.1f}' for w in want)}")
    say(f"  {'':16s} got  {' '.join(f'{g:7.1f}' for g in got)}   worst miss {miss:.3f} Hz")

say("== check 2: the bump road's far end matches pendulum.py's table (q = 32) ==")
r40 = ring_ratios(Q_END, 40)
r90 = ring_ratios(Q_END, 90)
say(f"  K=40 (this script): {' '.join(f'{x:.2f}' for x in r40[:6])}")
say(f"  K=90 (pendulum.py): {' '.join(f'{x:.2f}' for x in r90[:6])}")
say(f"  pendulum table   : 1.00 1.97 2.89 3.78 4.63 5.42   (K40 vs K90 worst diff {np.abs(r40 - r90).max():.1e})")
ok &= np.abs(r40 - r90).max() < 1e-9 and abs(r40[1] - 1.97) < 0.006

say("== check 3: the two roads meet — bare ring ladder vs. pinned-bar ladder ==")
r0 = ring_ratios(0.0)
pairs = r0.reshape(NP, 2)
say(f"  ring pairs at q=0 : {' '.join(f'{p[0]:.0f}/{p[1]:.0f}' for p in pairs[:6])}")
say(f"  bar at lam=1      : {' '.join(f'{x:.0f}' for x in ratios_lam(1.0)[:6])}")
seam_diff = np.abs(pairs - ratios_lam(1.0)[:, None]).max()
say(f"  worst difference {seam_diff:.1e}")
ok &= seam_diff < 1e-9

say("== check 4: the seam is continuous (no click) ==")
d = np.abs(np.diff(audio))
around = d[iSEAM - 50:iSEAM + 50].max()
typical = np.percentile(d[int((tA1 + 0.1) * SR):iSEAM - 100], 99.9)
say(f"  largest sample step at the seam {around:.4f} · 99.9th pct of the held squares just before {typical:.4f}")
ok &= around <= 1.05 * d[int((tA1 + 0.1) * SR):iSEAM].max()

say("== check 5: how close each end gets to a string (partials 2..5 ÷ 1, distinct pitches) ==")
say(f"  start, the string : {' '.join(f'{x:.2f}' for x in ratios_lam(0)[1:5])}")
say(f"  seam, the squares : {' '.join(f'{x:.2f}' for x in ratios_lam(1)[1:5])}")
say(f"  end, the pendulum : {' '.join(f'{x:.2f}' for x in RG[-1][1:5])}   (sags: a bigger swing is slower)")
say("  PASS" if ok else "  FAIL")

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

# curves along the timeline (decimated)
TD = np.linspace(0, TOTAL, 1400)
lamD = smooth((TD - tA0) / T_A)
qD = Q_END * smooth((TD - tB0) / T_B)**3
legA = TD < tB0
curA = np.array([ratios_lam(l) for l in lamD[legA]])
curB = np.stack([np.interp(qD[~legA], QG, RG[:, j]) for j in range(NR)], axis=1)
YMAX = 30.0


def style(ax):
    for sp in ax.spines.values():
        sp.set_color(BORDER)
    ax.tick_params(length=3)


def draw_road(ax):
    style(ax)
    for h in range(1, int(YMAX) + 1):
        ax.axhline(h, color=FG4, lw=0.5, zorder=0)
    for s in range(1, 6):
        ax.axhline(s * s, color=INFO, lw=0.8, ls=(0, (4, 3)), alpha=0.7, zorder=0)
    for zone, a, b in (("A", tA0, tA1), ("B", tB0, tB1)):
        ax.axvspan(a, b, color=FG4, alpha=0.18, lw=0)
    for k in range(NP):
        ax.plot(TD[legA], curA[:, k], color=ACC if k == 0 else FG1, lw=1.0, alpha=0.8)
    for j in range(NR):
        ax.plot(TD[~legA], curB[:, j], color=ACC if j == 0 else FG1, lw=1.0, alpha=0.8)
    ax.set_yscale("log"); ax.set_ylim(0.9, YMAX); ax.set_xlim(0, TOTAL)
    ax.set_yticks([1, 2, 3, 4, 5, 9, 16, 25]); ax.set_yticklabels(["1", "2", "3", "4", "5", "9", "16", "25"])
    ax.minorticks_off()
    ax.set_ylabel("partial ÷ lowest")
    ax.set_xlabel("seconds")
    tr = ax.get_xaxis_transform()
    ax.text(tA0 / 2, 1.015, "string\n1·2·3", ha="center", va="bottom", fontsize=8, color=FG2, transform=tr)
    ax.text((tA0 + tA1) / 2, 1.015, "change the EQUATION\nstiffen: wave eq → bar = Schrödinger²", ha="center", va="bottom", fontsize=8, color=FG2, transform=tr)
    ax.text((tA1 + tB0) / 2, 1.015, "squares\n1·4·9", ha="center", va="bottom", fontsize=8, color=INFO, transform=tr)
    ax.text((tB0 + tB1) / 2, 1.015, "change the WELL\ndeepen a bump on the ring", ha="center", va="bottom", fontsize=8, color=FG2, transform=tr)
    ax.text((tB1 + TOTAL) / 2, 1.015, "pendulum\n≈1·2·3", ha="center", va="bottom", fontsize=8, color=FG2, transform=tr)


W_PX, H_PX, DPI = 1280, 720, 100


def header(fig, sub):
    fig.text(0.05, 0.93, "One equation, two spacings — the round trip", fontsize=22, family=SERIF, color=FG1)
    fig.text(0.05, 0.885, sub, fontsize=10, color=FG3)


# poster
fig = plt.figure(figsize=(W_PX / DPI, H_PX / DPI), dpi=DPI)
ax = fig.add_axes([0.07, 0.13, 0.90, 0.66])
draw_road(ax)
header(fig, "one held tone, lowest partial pinned at A3 · grey lines: a string's 1·2·3 · dashed blue: Schrödinger's 1·4·9")
fig.text(0.05, 0.03, "left road: stiffness.py (wave equation → pinned bar, whose square root is Schrödinger) · "
         "right road: pendulum.py (Schrödinger held fixed, cos bump q 0→32)", fontsize=8, color=FG4)
PNG = os.path.join(HERE, "round-trip-poster.png")
fig.savefig(PNG, facecolor=BG)
plt.close(fig)
say("wrote round-trip-poster.png")

# video: the same chart, a playhead, and a live partial strip
fig = plt.figure(figsize=(W_PX / DPI, H_PX / DPI), dpi=DPI)
ax = fig.add_axes([0.07, 0.36, 0.90, 0.43])
ax_s = fig.add_axes([0.07, 0.08, 0.90, 0.18])
draw_road(ax)
ax.set_xlabel("")
header(fig, "listen to the spacing above the gold line: it climbs to the squares, then folds back")
head = ax.axvline(0, color=ACC, lw=1.4)
dots, = ax.plot([], [], "o", color=ACC, ms=4)
style(ax_s)
for h in range(1, 40):
    ax_s.axvline(F0 * h, color=FG4, lw=0.5, zorder=0)
for s in range(1, 6):
    ax_s.axvline(F0 * s * s, color=INFO, lw=0.8, ls=(0, (4, 3)), alpha=0.7, zorder=0)
ax_s.set_xlim(0, 6000); ax_s.set_ylim(0, 1.1); ax_s.set_yticks([])
ax_s.set_xlabel("Hz  ·  partials now (height = loudness)")
stems = ax_s.vlines([], 0, [], color=ACC, lw=2)
amax = np.abs(A).max()


def now(tt):
    i = min(int(tt * SR), N - 1)
    if i < iSEAM:
        f, a = fA[i], A
    else:
        f, a = fB[i - iSEAM], aB
    return f, np.abs(a) * gate(f) / amax


MP4 = os.path.join(HERE, "round-trip.mp4")
cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
       "-s", f"{W_PX}x{H_PX}", "-r", str(FPS), "-i", "-", "-i", WAV,
       "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23", "-preset", "medium",
       "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", MP4]
proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
n_frames = int(TOTAL * FPS)
for jf in range(n_frames):
    tt = jf / FPS
    f, a = now(tt)
    head.set_xdata([tt, tt])
    vis = f < F0 * YMAX
    dots.set_data(np.full(vis.sum(), tt), f[vis] / F0)
    stems.set_segments([[(fi, 0), (fi, ai)] for fi, ai in zip(f, a) if fi < 6000 and ai > 0.002])
    fig.canvas.draw()
    proc.stdin.write(np.asarray(fig.canvas.buffer_rgba())[:, :, :3].tobytes())
proc.stdin.close(); proc.wait()
say(f"wrote round-trip.mp4 ({n_frames} frames)")

with open(os.path.join(HERE, "round-trip-checks.txt"), "w") as fh:
    fh.write(LOG.getvalue())
sys.exit(0 if ok else 1)
