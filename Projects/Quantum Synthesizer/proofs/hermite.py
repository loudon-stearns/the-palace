#!/usr/bin/env python3
"""
Hermite — what does an eigenstate with n nodes actually sound like?
==================================================================
The entry's Hermite-Gaussian paragraph says: read |phi_n(x)|^2 as an
amplitude distribution across frequency, and the n nodes tell you how many
partials are present: phi_0 = pure fundamental, phi_n = fundamental plus n
harmonics. This script tests that claim three ways, on the harmonic
oscillator  i psi_t = -(1/2) psi_xx + (1/2) x^2 psi,  levels E_n = n + 1/2.

  A. THE PHYSICS. Let the stationary state phi_n evolve (finite-difference
     Hamiltonian, exact exponential) and listen at one point. A stationary
     state oscillates at ONE frequency, E_n. One partial, whatever n is.
     Pitch: hbar*omega <-> 220 Hz, so f = 220 (n + 1/2) = 110, 330, 550 ...
  B. THE ENTRY'S READING. Lay |phi_n|^2 across a harmonic comb (x in
     [-4.5, 4.5] onto partials 1..24). You hear n + 1 lumps, i.e. formants.
     How many PARTIALS that is depends on how wide you chose the comb.
  C. THE WAVETABLE. Play one cycle of phi_n(x), x in [-L, L], as a
     waveform. Hermite functions are their own Fourier transforms
     (F phi_n = (-i)^n phi_n), so the spectrum of this wave has exactly
     the shape |phi_n|: the n nodes in space become n holes in the spectrum.
     "The spatial structure IS the spectral structure" is literally true
     here, and nowhere else in the three readings.

All three play on the same 110 Hz floor so only the spectrum moves.

Writes beside this script:
  hermite.wav          ~34 s: for n = 0..5, A then B then C
  hermite.mp4          the same audio with the shape and the measured spectrum
  hermite-poster.png   the three readings for n = 0..5 in one still
  hermite-checks.txt   the printed checks
numpy + matplotlib + ffmpeg.
"""
import os, subprocess, wave, sys, io
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager

HERE = os.path.dirname(os.path.abspath(__file__))
SR, FPS = 44100, 30
F0 = 110.0
NMAX = 5
L = 10.0                    # wavetable window [-L, L]
KMAX = 48                   # harmonics kept for C
LOG = io.StringIO()


def say(*a):
    s = " ".join(str(x) for x in a)
    print(s); LOG.write(s + "\n")


def hermite_fns(x, nmax):
    """normalized Hermite functions phi_0..phi_nmax by the stable recurrence"""
    out = np.zeros((nmax + 1, len(x)))
    out[0] = np.pi**-0.25 * np.exp(-x * x / 2)
    if nmax >= 1:
        out[1] = np.sqrt(2) * x * out[0]
    for n in range(2, nmax + 1):
        out[n] = np.sqrt(2 / n) * x * out[n - 1] - np.sqrt((n - 1) / n) * out[n - 2]
    return out


ok = True

# ======================================================================
# A. the physics: evolve phi_n, listen at one point
# ======================================================================
say("== check 1: a stationary state sings one frequency (evolve phi_n, probe at x0 = 0.7) ==")
NG, XG = 1600, 12.0
xg = np.linspace(-XG, XG, NG); dx = xg[1] - xg[0]
H = np.diag(1 / dx**2 + 0.5 * xg**2) + np.diag(np.full(NG - 1, -0.5 / dx**2), 1) + np.diag(np.full(NG - 1, -0.5 / dx**2), -1)
lam, vec = np.linalg.eigh(H)
lam, vec = lam[:61], vec[:, :61]
PHI_G = hermite_fns(xg, NMAX)
i0 = np.argmin(np.abs(xg - 0.7))
TT = 400.0; NT = 8192
t = np.linspace(0, TT, NT, endpoint=False)
for nn in range(NMAX + 1):
    c = vec.T @ (PHI_G[nn] * np.sqrt(dx))              # expand in numerical eigenstates
    sig = np.real((vec[i0] * c) @ np.exp(-1j * np.outer(lam, t)))
    S = np.abs(np.fft.rfft(sig * np.hanning(NT)))**2
    w = 2 * np.pi * np.fft.rfftfreq(NT, TT / NT)
    pk = np.argmax(S)
    near = np.abs(w - w[pk]) <= 3 * (w[1] - w[0])
    frac = S[near].sum() / S.sum()
    say(f"  n={nn}  peak at E={w[pk]:.3f} (want {nn + 0.5:.1f})  energy in that one peak {100 * frac:.3f}%"
        f"  overlap with eigenstate {nn}: {100 * c[nn]**2:.4f}%")
    ok &= abs(w[pk] - (nn + 0.5)) < 0.02 and frac > 0.999

# ======================================================================
# C. the wavetable: spectrum of one cycle of phi_n is |phi_n| again
# ======================================================================
say("== check 2: wavetable spectrum vs. the self-dual prediction |c_k| = sqrt(2 pi)/(2L) |phi_n(pi k / L)| ==")
NW = 8192
xw = np.linspace(-L, L, NW, endpoint=False)
PHI_W = hermite_fns(xw, NMAX)
k = np.arange(0, KMAX + 1)
PRED = np.sqrt(2 * np.pi) / (2 * L) * np.abs(hermite_fns(np.pi * k / L, NMAX))
CW = np.zeros((NMAX + 1, KMAX + 1))
for nn in range(NMAX + 1):
    cc = np.fft.fft(PHI_W[nn]) / NW
    CW[nn] = np.abs(cc[:KMAX + 1])
    err = np.max(np.abs(CW[nn] - PRED[nn])) / PRED[nn].max()
    say(f"  n={nn}  worst miss {err:.1e} of the tallest partial")
    ok &= err < 1e-6
CW[:, 0] = 0.0                                          # drop DC (we only hear k >= 1)


def count_db(a, db=-40):
    a = a / a.max()
    return int(np.sum(a > 10**(db / 20)))


# ======================================================================
# B. the entry's reading: |phi_n|^2 laid across partials 1..24
# ======================================================================
KB = 24
xb = np.linspace(-4.5, 4.5, KB)
CB = hermite_fns(xb, NMAX)**2

say("== check 3: count what the entry promised (n nodes -> n + 1 partials) ==")
say("   n | A: partials | B: lumps  B: partials>-40dB | C: partials>-40dB  holes k>0 (want n//2) | promised")
for nn in range(NMAX + 1):
    b = CB[nn]
    lumps = int(np.sum((b[1:-1] > b[:-2]) & (b[1:-1] > b[2:])))
    cw = CW[nn, 1:]
    dips = int(np.sum((cw[1:-1] < cw[:-2]) & (cw[1:-1] < cw[2:]) & (cw[1:-1] > 0) &
                      (np.arange(2, KMAX) < L * (np.sqrt(2 * nn + 1) + 1) / np.pi)))
    say(f"   {nn} |      1      |    {lumps}             {count_db(b):2d}         |"
        f"        {count_db(cw):2d}             {dips}       |    {nn + 1}")
    ok &= lumps == nn + 1 and dips == nn // 2
say("  reading A: always one partial. B: n + 1 lumps, but the partial count is the comb width,")
say("  not the state. C: the spectrum widens like sqrt(2n + 1) and carries the nodes as holes:")
say("  the spectrum is phi_n mirrored about 0 Hz, so k > 0 shows half the nodes; an odd n's centre node is the missing DC.")
say("  PASS" if ok else "  FAIL")

# ======================================================================
# audio
# ======================================================================
T_A, T_B, T_C, GAP, REST = 1.4, 1.9, 1.9, 0.18, 0.45
F_TOP = 16000.0


def tone(freqs, amps, dur, phases=None):
    n = int(dur * SR); tt = np.arange(n) / SR
    keep = freqs < F_TOP
    freqs, amps = freqs[keep], amps[keep]
    ph = np.zeros_like(freqs) if phases is None else phases[keep]
    y = (amps[:, None] * np.sin(2 * np.pi * freqs[:, None] * tt + ph[:, None])).sum(0)
    env = np.minimum(1, np.minimum(tt / 0.02, (dur - tt) / 0.12))
    y = y * np.clip(env, 0, 1) * (1 - 0.25 * tt / dur)
    return y / (np.max(np.abs(y)) + 1e-12) * 0.6


SEG = []   # (t0, t1, n, reading, freqs, amps)
pieces, tcur = [], 0.0
for nn in range(NMAX + 1):
    fa = np.array([F0 * (2 * nn + 1)]); aa = np.array([1.0])
    fb = F0 * np.arange(1, KB + 1); ab = CB[nn] / CB[nn].max()
    fc = F0 * k[1:]; ac = CW[nn, 1:] / CW[nn, 1:].max()
    # wavetable phases: even n cosine, odd n sine (the real-valued phi_n's own symmetry)
    pc = np.full(len(fc), np.pi / 2 if nn % 2 == 0 else 0.0)
    for rd, (f, a, d, p) in zip("ABC", [(fa, aa, T_A, None), (fb, ab, T_B, None), (fc, ac, T_C, pc)]):
        y = tone(f, a, d, p)
        SEG.append((tcur, tcur + d, nn, rd, f, a))
        pieces += [y, np.zeros(int(GAP * SR))]
        tcur += d + GAP
    pieces.append(np.zeros(int(REST * SR))); tcur += REST
audio = np.concatenate(pieces)
TOTAL = len(audio) / SR
WAV = os.path.join(HERE, "hermite.wav")
with wave.open(WAV, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())
say(f"wrote hermite.wav ({TOTAL:.1f} s)")

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
NAME = {"A": "A · the physics: one state, one pitch",
        "B": "B · the entry's reading: |φₙ|² laid across the partials",
        "C": "C · the wavetable: φₙ as one cycle — its spectrum is φₙ again"}
xs = np.linspace(-6, 6, 1200)
PHI_S = hermite_fns(xs, NMAX)
kf = np.linspace(0, KMAX, 2000)
ENV_C = np.abs(hermite_fns(np.pi * kf / L, NMAX))


def style(ax):
    for sp in ax.spines.values():
        sp.set_color(BORDER)
    ax.tick_params(length=3)


# ---- poster: rows n, columns A B C ----
fig, axs = plt.subplots(NMAX + 1, 4, figsize=(16, 11), gridspec_kw={"width_ratios": [1, 0.55, 1.1, 1.3]})
fig.subplots_adjust(left=0.05, right=0.98, top=0.86, bottom=0.05, hspace=0.35, wspace=0.18)
fig.text(0.05, 0.94, "Hermite — what an eigenstate with n nodes sounds like", fontsize=24, family=[SERIF, "DejaVu Serif"], color=FG1)
fig.text(0.05, 0.905, "the shape φₙ  ·  A: the physics (one pitch)  ·  B: the entry's |φₙ|² comb (n+1 lumps)"
         "  ·  C: φₙ as a wavetable — Fourier turns φₙ into φₙ, nodes become holes", fontsize=10, color=FG3)
for nn in range(NMAX + 1):
    a0, a1, a2, a3 = axs[nn]
    for a in axs[nn]:
        style(a); a.set_yticks([])
    a0.fill_between(xs, PHI_S[nn]**2 * 1.6, color=INFO, alpha=0.18, lw=0)
    a0.plot(xs, PHI_S[nn], color=FG1, lw=1.2); a0.axhline(0, color=FG4, lw=0.5)
    a0.set_ylabel(f"n={nn}", rotation=0, labelpad=18, color=FG2); a0.set_xlim(-6, 6)
    a1.vlines([2 * nn + 1], 0, 1, color=ACC, lw=2.5); a1.set_xlim(0, 12); a1.set_ylim(0, 1.1)
    a2.vlines(np.arange(1, KB + 1), 0, CB[nn] / CB[nn].max(), color=ACC, lw=2); a2.set_xlim(0, KB + 1); a2.set_ylim(0, 1.1)
    m = CW[nn, 1:].max()
    a3.plot(kf, ENV_C[nn] * np.sqrt(2 * np.pi) / (2 * L) / m, color=INFO, lw=0.9, alpha=0.8)
    a3.vlines(k[1:], 0, CW[nn, 1:] / m, color=ACC, lw=2); a3.set_xlim(0, 30); a3.set_ylim(0, 1.1)
    if nn < NMAX:
        for a in axs[nn]:
            a.set_xticklabels([])
axs[0, 0].set_title("the shape φₙ(x), |φₙ|² shaded", fontsize=9, color=FG2)
axs[0, 1].set_title("A · physics", fontsize=9, color=FG2)
axs[0, 2].set_title("B · entry's comb", fontsize=9, color=FG2)
axs[0, 3].set_title("C · wavetable (blue: |φₙ| itself)", fontsize=9, color=FG2)
axs[-1, 1].set_xlabel("× 110 Hz"); axs[-1, 2].set_xlabel("partial"); axs[-1, 3].set_xlabel("partial")
PNG = os.path.join(HERE, "hermite-poster.png")
fig.savefig(PNG, facecolor=BG); plt.close(fig)
say("wrote hermite-poster.png")

# ---- video: one frame per segment, playhead strip below ----
W_PX, H_PX = 1280, 720
fig = plt.figure(figsize=(W_PX / 100, H_PX / 100), dpi=100)
ax_x = fig.add_axes([0.06, 0.30, 0.36, 0.48]); ax_f = fig.add_axes([0.50, 0.30, 0.46, 0.48])
ax_t = fig.add_axes([0.06, 0.08, 0.90, 0.10])
for a in (ax_x, ax_f, ax_t):
    style(a)
t_title = fig.text(0.06, 0.92, "", fontsize=22, family=[SERIF, "DejaVu Serif"], color=FG1)
t_sub = fig.text(0.06, 0.86, "", fontsize=11, color=ACC)
fig.text(0.06, 0.81, "shape in space", fontsize=9, color=FG3)
fig.text(0.50, 0.81, "measured spectrum of what you hear (× 110 Hz)", fontsize=9, color=FG3)
for (s0, s1, nn, rd, f, a) in SEG:
    ax_t.axvspan(s0, s1, color={"A": FG4, "B": INFO, "C": ACC}[rd], alpha=0.35, lw=0)
for nn in range(NMAX + 1):
    s0 = [s for s in SEG if s[2] == nn][0][0]
    ax_t.text(s0, 1.08, f"n={nn}", transform=ax_t.get_xaxis_transform(), fontsize=8, color=FG2)
ax_t.set_xlim(0, TOTAL); ax_t.set_yticks([]); ax_t.set_xlabel("seconds · grey A physics · blue B entry's comb · gold C wavetable")
head = ax_t.axvline(0, color=FG1, lw=1.4)


def draw_seg(sg):
    s0, s1, nn, rd, f, a = sg
    ax_x.cla(); ax_f.cla(); style(ax_x); style(ax_f)
    ax_x.fill_between(xs, PHI_S[nn]**2 * 1.6, color=INFO, alpha=0.2, lw=0)
    ax_x.plot(xs, PHI_S[nn], color=FG1, lw=1.5); ax_x.axhline(0, color=FG4, lw=0.5)
    ax_x.set_xlim(-6, 6); ax_x.set_ylim(-0.9, 1.05); ax_x.set_yticks([])
    ax_x.text(0.02, 0.95, f"{nn} node{'s' if nn != 1 else ''}", transform=ax_x.transAxes, color=FG2, va="top")
    r = f / F0
    ax_f.vlines(r, 0, a, color=ACC, lw=2.5)
    if rd == "C":
        ax_f.plot(kf, ENV_C[nn] * np.sqrt(2 * np.pi) / (2 * L) / CW[nn, 1:].max(), color=INFO, lw=1.0)
    ax_f.set_xlim(0, 26); ax_f.set_ylim(0, 1.12); ax_f.set_yticks([])
    cnt = count_db(a)
    ax_f.text(0.98, 0.95, f"{cnt} partial{'s' if cnt != 1 else ''} above −40 dB", transform=ax_f.transAxes,
              ha="right", va="top", color=FG2)
    t_title.set_text(f"φ{'₀₁₂₃₄₅'[nn]} — the eigenstate with {nn} node{'s' if nn != 1 else ''}")
    t_sub.set_text(NAME[rd])
    fig.canvas.draw()


MP4 = os.path.join(HERE, "hermite.mp4")
cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
       "-s", f"{W_PX}x{H_PX}", "-r", str(FPS), "-i", "-", "-i", WAV,
       "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23", "-preset", "medium",
       "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", MP4]
proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
n_frames = int(TOTAL * FPS); cur = None
for jf in range(n_frames):
    tt = jf / FPS
    sg = next((s for s in SEG if s[0] <= tt < s[1] + GAP + REST), SEG[-1])
    if sg is not cur:
        draw_seg(sg); cur = sg
    head.set_xdata([tt, tt])
    fig.canvas.draw()
    proc.stdin.write(np.asarray(fig.canvas.buffer_rgba())[:, :, :3].tobytes())
proc.stdin.close(); proc.wait()
say(f"wrote hermite.mp4 ({n_frames} frames)")

with open(os.path.join(HERE, "hermite-checks.txt"), "w") as fh:
    fh.write(LOG.getvalue())
sys.exit(0 if ok else 1)
