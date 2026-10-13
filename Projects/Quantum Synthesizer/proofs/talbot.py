#!/usr/bin/env python3
"""
Talbot — the carpet that sings the harmonic series
==================================================
Cycle 8 (walls.py) heard Schrodinger's box sound 1, 4, 9, 16. Cycle 9
(stiffness.py) showed why: Schrodinger is the square root of a bar. This
script follows the consequence. Every level is a whole number of quanta
(k squared), so every phase comes home at the same instant: a packet let go
on a ring smears into fog and then rebuilds itself exactly, once per
revival time T. In between, at every rational time t = (p/q) T, it comes
back as q (or q/2) perfect copies, evenly spaced. The picture of this is
the quantum Talbot carpet.

The instrument: a free particle on a ring,

    i psi_t = -(1/2) psi_xx        ring of length 1, levels E_k ~ k^2

and the ring's probability density |psi(x, t)|^2, read once around, is one
cycle of a waveform, played at A2 (110 Hz). Schrodinger evolution slowly
rewrites the waveform. When the density holds q evenly spaced copies, the
waveform repeats q times per cycle, so only harmonics q, 2q, 3q ... survive
and the ear hears the q-th harmonic. The carpet's rational times are heard
as the harmonic series, in Farey order.

Honest framing: cycle 8's pitches were the physics (eigenvalues ARE the
partials). Here the pitch comes from a mapping choice, density-as-wavetable
(the entry's own "feed the spatial structure into a wavetable"). What the
physics supplies is the timing and the copy counts, which the mapping
cannot invent.

Writes beside this script:
  talbot.wav          one full revival in 36 s (plus the packet held 1.5 s)
  talbot.mp4          the same audio with the carpet drawn in under it
  talbot-poster.png   the whole carpet, with the copy count at each fraction
and prints the checks:
  1. Crank-Nicolson integration of the ring vs. the exact sum at t = T/3
  2. copy count / harmonic purity of the density at the rational times
  3. FFT of the rendered audio at those times: energy on multiples of q

numpy + scipy + matplotlib + ffmpeg.
"""
import os, subprocess, wave
from fractions import Fraction
import numpy as np
import scipy.sparse as sp
from scipy.sparse.linalg import splu
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.colors import LinearSegmentedColormap

HERE = os.path.dirname(os.path.abspath(__file__))
SR, FPS = 44100, 30
F0 = 110.0                        # one trip round the ring = one cycle of A2
S = 0.035                         # packet width (ring length 1)
K = 60                            # momentum modes kept (|k| <= K); psi_k ~ 1e-80 by then
H = 64                            # harmonics of the waveform kept (7 kHz at A2)
M = 512                           # points round the ring
REV_S = 36.0                      # seconds of audio per revival time T
HOLD_S = 1.5                      # the packet held still before release
T0, T1 = -0.0, 1.03               # revival-time span played after the hold
CTRL = 2000                       # control rate for the harmonic amplitudes (Hz)

k = np.arange(-K, K + 1)
PSI0K = np.exp(-(2 * np.pi * k * S)**2 / 2)
PSI0K /= np.linalg.norm(PSI0K)


def psi_k(t):
    """exact: each mode turns at k^2; t in units of the revival time T"""
    return PSI0K * np.exp(-2j * np.pi * k * k * t)


def density(t):
    full = np.zeros(M, complex)
    full[k % M] = psi_k(t)
    return np.abs(np.fft.ifft(full) * M)**2 / M


def harmonics(t):
    """complex amplitude of harmonics 1..H of the density, read as one cycle"""
    d = density(t)
    return np.fft.rfft(d - d.mean())[1:H + 1] / M


NAMES = {1: "A2", 2: "A3", 3: "E4", 4: "A4", 5: "C♯5", 6: "E5", 7: "G5", 8: "A5", 9: "B5", 10: "C♯6"}


def copies(fr):
    """copy count of the density at t = p/q (known from the Gauss sums; checked below)"""
    q = fr.denominator
    return q if q % 2 else q // 2


FRACS = sorted({Fraction(p, q) for q in range(1, 9) for p in range(0, q + 1)})

# ======================================================================
# audio
# ======================================================================
n_ctrl = int(round((T1 - T0) * REV_S * CTRL)) + 1
t_ctrl = T0 + np.arange(n_ctrl) / (REV_S * CTRL)
C = np.array([harmonics(t) for t in t_ctrl])              # n_ctrl x H
rms = np.sqrt(2 * np.sum(np.abs(C)**2, axis=1))
REF = np.median(rms)
gain = np.minimum(REF / np.maximum(rms, 1e-12), 4.0)      # hold loudness level (cap x4)
gain = np.convolve(gain, np.ones(41) / 41, mode="same")
gain[:20], gain[-20:] = gain[20], gain[-21]

n_aud = int(round((T1 - T0) * REV_S * SR))
ta = np.arange(n_aud) / SR
tc = np.arange(n_ctrl) / CTRL
hh = np.arange(1, H + 1)
body = np.zeros(n_aud)
for j, h in enumerate(hh):
    if F0 * h > 15000:
        break
    re = np.interp(ta, tc, C[:, j].real)
    im = np.interp(ta, tc, C[:, j].imag)
    body += 2 * (re * np.cos(2 * np.pi * F0 * h * ta) - im * np.sin(2 * np.pi * F0 * h * ta))
body *= np.interp(ta, tc, gain)

C_hold = harmonics(T0)
th = np.arange(int(HOLD_S * SR)) / SR
hold = np.zeros(th.size)
for j, h in enumerate(hh):
    hold += 2 * np.real(C_hold[j] * np.exp(2j * np.pi * F0 * h * th))
hold *= gain[0]

audio = np.concatenate([hold, body])
audio *= np.minimum(np.arange(audio.size) / (0.01 * SR), 1)
audio *= np.minimum((audio.size - np.arange(audio.size)) / (0.6 * SR), 1)
audio *= 0.85 / np.abs(audio).max()
TOTAL = audio.size / SR
WAV = os.path.join(HERE, "talbot.wav")
with wave.open(WAV, "wb") as wv:
    wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())
print(f"wrote {WAV} ({TOTAL:.1f} s)")


def t_of(sec):
    """audio seconds -> revival time"""
    return T0 if sec < HOLD_S else T0 + (sec - HOLD_S) / REV_S


def sec_of(t):
    return HOLD_S + (t - T0) * REV_S


# ======================================================================
# checks
# ======================================================================
print("== check 1: Crank-Nicolson on the ring vs. the exact mode sum, t = T/3 ==")
NG = 512
dx = 1.0 / NG
xg = np.arange(NG) * dx
lap = sp.diags([np.ones(NG - 1), -2 * np.ones(NG), np.ones(NG - 1)], [-1, 0, 1], format="lil")
lap[0, NG - 1] = lap[NG - 1, 0] = 1
lap = (lap / dx**2).tocsc()
# levels must turn at 2*pi*k^2 per T:  i psi_t = -(1/2)(1/(2 pi^2))... -> psi_t = (i/(2 pi)) psi_xx
alpha = 1j / (2 * np.pi)
psi = np.zeros(NG, complex)
full = np.zeros(NG, complex); full[k % NG] = PSI0K
psi = np.fft.ifft(full) * NG
steps = 24000
dt = (1 / 3) / steps
I = sp.identity(NG, format="csc")
lu = splu((I - 0.5 * dt * alpha * lap).tocsc())
Bm = (I + 0.5 * dt * alpha * lap).tocsc()
for _ in range(steps):
    psi = lu.solve(Bm @ psi)
d_cn = np.abs(psi)**2 / NG
d_ex = density(1 / 3) if NG == M else None
print(f"  max |density_CN - density_exact| = {np.max(np.abs(d_cn - d_ex)):.2e}  (peak {d_ex.max():.3f});"
      f" CN copies seen: {np.sum((d_cn > 0.5 * d_cn.max()) & (d_cn >= np.roll(d_cn, 1)) & (d_cn >= np.roll(d_cn, -1)))}")
CN_X, CN_D, EX_D = xg, d_cn, d_ex

print("== check 2: the density at the rational times ==")
for fr in [Fraction(1, q) for q in range(1, 9)] + [Fraction(2, 5), Fraction(3, 8), Fraction(3, 7)]:
    a2 = np.abs(harmonics(float(fr)))**2
    c = copies(fr)
    print(f"  t = {str(fr):>4} T: expect {c} copies; energy on multiples of {c}: {a2[c - 1::c].sum() / a2.sum():.4f};"
          f" loudest harmonic {np.argmax(a2) + 1}")

print("== check 3: FFT of the rendered audio at the rational times ==")
for fr in [Fraction(1, 8), Fraction(1, 7), Fraction(1, 5), Fraction(1, 4), Fraction(1, 3), Fraction(2, 5), Fraction(1, 2)]:
    i0 = int(sec_of(float(fr)) * SR)
    w = audio[i0 - 2205:i0 + 2205] * np.hanning(4410)
    sp_ = np.abs(np.fft.rfft(w, 1 << 16))**2
    fr_ = np.fft.rfftfreq(1 << 16, 1 / SR)
    e = np.array([sp_[np.abs(fr_ - F0 * h) < 12].sum() for h in range(1, 41)])
    c = copies(fr)
    print(f"  t = {str(fr):>4} T  ({sec_of(float(fr)):5.2f} s): energy on harmonics of {c}·A2 = {e[c - 1::c].sum() / e.sum():.3f};"
          f" heard pitch {NAMES.get(c, c)} ({F0 * c:.0f} Hz)")

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

ROWS = 1400
T_ROWS = np.linspace(T0, T1, ROWS)
CARPET = np.array([density(t) for t in T_ROWS])
VMAX = np.percentile(CARPET, 99.7)
XS = np.arange(M) / M


def near(t, tol=0.0075):
    for fr in FRACS:
        if abs(t - float(fr)) < tol and (fr.denominator <= 8):
            return fr
    return None


W_PX, H_PX, DPI = 1280, 720, 100
fig = plt.figure(figsize=(W_PX / DPI, H_PX / DPI), dpi=DPI)
ax_c = fig.add_axes([0.05, 0.16, 0.36, 0.62])
ax_r = fig.add_axes([0.44, 0.16, 0.24, 0.62], projection="polar")
ax_h = fig.add_axes([0.72, 0.16, 0.25, 0.62])
ax_t = fig.add_axes([0.05, 0.05, 0.92, 0.045])

for ax in (ax_c, ax_h):
    for s_ in ax.spines.values():
        s_.set_color(BORDER)
    ax.tick_params(length=3)

# carpet: ring position across, time down
ax_c.imshow(CARPET, aspect="auto", cmap=CMAP, vmin=0, vmax=VMAX, origin="upper",
            extent=[0, 1, T1, T0], interpolation="bilinear")
veil = ax_c.add_patch(plt.Rectangle((0, T0), 1, T1 - T0, fc=BG, alpha=0.72, lw=0))
play = ax_c.axhline(T0, color=ACC, lw=1.0)
ax_c.set_xlim(0, 1); ax_c.set_ylim(T1, T0)
ax_c.set_xticks([0, 0.5, 1]); ax_c.set_xticklabels(["0", "round the ring", "1"], fontsize=8)
yt = [Fraction(0), Fraction(1, 8), Fraction(1, 4), Fraction(1, 3), Fraction(1, 2), Fraction(2, 3), Fraction(3, 4), Fraction(1)]
ax_c.set_yticks([float(f) for f in yt]); ax_c.set_yticklabels([f"{f}T" if f not in (0, 1) else ("0" if f == 0 else "T") for f in yt], fontsize=8)
ax_c.set_title("the carpet: |ψ|² round the ring, time running down", fontsize=9, color=FG3, loc="left")

# ring
TH = np.append(XS, 1.0) * 2 * np.pi
ax_r.set_facecolor(EL1)
ax_r.set_xticks([]); ax_r.set_yticks([]); ax_r.spines["polar"].set_color(BORDER)
ax_r.set_ylim(0, 1.9)
ax_r.plot(TH, np.ones_like(TH), color=FG4, lw=0.8)
DMAX0 = density(0).max()
ring_line, = ax_r.plot(TH, np.ones_like(TH), color=ACC, lw=1.6)
ax_r.set_title("the ring now — and the waveform you hear", fontsize=9, color=FG3, loc="left", pad=12)

# harmonic bars
NB = 24
bars = ax_h.bar(np.arange(1, NB + 1), np.zeros(NB), width=0.7, color=FG1)
ax_h.set_xlim(0.3, NB + 0.7); ax_h.set_ylim(0, 1.08); ax_h.set_yticks([])
ax_h.set_xticks([1, 2, 3, 4, 5, 6, 7, 8, 12, 16, 24]); ax_h.tick_params(labelsize=8)
ax_h.set_title("what the ear gets: harmonics of A2 (110 Hz)", fontsize=9, color=FG3, loc="left")

# timeline marks
ax_t.set_xlim(0, TOTAL); ax_t.set_ylim(0, 1); ax_t.axis("off")
ax_t.add_patch(plt.Rectangle((0, 0.15), TOTAL, 0.7, fc=EL1, ec=BORDER, lw=0.8))
ax_t.add_patch(plt.Rectangle((0, 0.15), HOLD_S, 0.7, fc="#22222e", ec=BORDER, lw=0.8))
for fr in FRACS:
    if fr.denominator <= 8 and T0 <= float(fr) <= T1:
        x = sec_of(float(fr))
        ax_t.plot([x, x], [0.15, 0.85], color=ACC if fr.denominator <= 4 else FG4, lw=0.8)
        if fr.denominator <= 5:
            ax_t.text(x, 1.05, str(fr) if fr not in (0, 1) else ("0" if fr == 0 else "T"),
                      fontsize=7, color=FG3, ha="center", va="bottom")
t_line = ax_t.axvline(0, color=ACC, lw=1.4)


def header(sec, t):
    fig.texts.clear()
    fig.text(0.05, 0.945, "QUANTUM SYNTHESIZER · TALBOT", fontsize=9, color=FG3)
    fr = near(t)
    if sec < HOLD_S:
        name, line, tag = "The packet, held", "One bump on the ring. Played once round per cycle, it's a buzzy A2.", "BEFORE RELEASE"
    elif fr is not None and fr in (0, 1):
        name, line, tag = ("Released" if fr == 0 else "Home again"), \
            ("Every level turns at its own rate, k² …" if fr == 0 else "Every phase came home at once. The packet is whole: A2 again."), \
            ("t = 0" if fr == 0 else "t = T")
    elif fr is not None:
        c = copies(fr)
        what = "one copy, moved half-way round" if c == 1 else f"{c} copies, evenly spaced"
        name = f"t = {fr} T"
        line = f"{what[0].upper() + what[1:]} — the waveform repeats {c}× → harmonic {c}, {NAMES.get(c, '')}." if c > 1 \
            else "One copy, moved half-way round — the same waveform, the same A2."
        tag = f"{c} COPIES" if c > 1 else "MIRROR"
    else:
        name, line, tag = "Fog", "Between the rational times the copies overlap. No single pitch.", f"t = {t:.3f} T"
    fig.text(0.05, 0.875, name, fontsize=26, color=FG1, family=SERIF)
    fig.text(0.05, 0.825, line, fontsize=15, color=FG2, family=SERIF, style="italic")
    fig.text(0.97, 0.945, tag, fontsize=9, color=ACC, ha="right")
    fig.text(0.97, 0.895, "i ∂ψ/∂t = −½ ∂²ψ/∂x²   on a ring", fontsize=11, color=FG1, ha="right")
    fig.text(0.97, 0.86, "levels go as k² — whole numbers, so every phase comes home at T",
             fontsize=8, color=FG3, ha="right")


def frame(sec):
    t = t_of(sec)
    header(sec, t)
    veil.set_y(t); veil.set_height(T1 - t)
    play.set_ydata([t, t])
    d = density(t)
    r = 1 + 0.8 * d / DMAX0
    ring_line.set_ydata(np.append(r, r[0]))
    a = np.abs(harmonics(t))[:NB]
    a = a / max(a.max(), 1e-12)
    fr = near(t)
    c = copies(fr) if (fr is not None and sec >= HOLD_S) else (1 if sec < HOLD_S else None)
    for j, b in enumerate(bars):
        b.set_height(a[j])
        b.set_color(ACC if (c is not None and (j + 1) % c == 0) else FG3)
    t_line.set_xdata([sec, sec])


def grab():
    fig.canvas.draw()
    return np.asarray(fig.canvas.buffer_rgba())[:, :, :3].tobytes()


MP4 = os.path.join(HERE, "talbot.mp4")
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

# ---- poster: the whole carpet, labelled -------------------------------
pf = plt.figure(figsize=(16, 7.2), dpi=110)
a1 = pf.add_axes([0.05, 0.10, 0.42, 0.76])
a2 = pf.add_axes([0.62, 0.10, 0.35, 0.76])
for ax in (a1, a2):
    for s_ in ax.spines.values():
        s_.set_color(BORDER)
a1.imshow(CARPET[(T_ROWS >= 0) & (T_ROWS <= 1)], aspect="auto", cmap=CMAP, vmin=0, vmax=VMAX,
          origin="upper", extent=[0, 1, 1, 0], interpolation="bilinear")
for fr in FRACS:
    if 0 < fr < 1 and fr.denominator <= 8:
        c = copies(fr)
        a1.text(1.01, float(fr), f"{fr} → {c}×  {NAMES.get(c, '')}", fontsize=7,
                color=ACC if fr.denominator <= 4 else FG3, va="center", transform=a1.get_yaxis_transform())
a1.set_xticks([0, 1]); a1.set_yticks([0, 1]); a1.set_yticklabels(["0", "T"])
a1.set_xlabel("round the ring"); a1.set_title("one revival of a packet on a ring", fontsize=10, color=FG2, loc="left")
# right: how pure the pitch is over time = share of energy on the best q
purity_t = np.linspace(0, 1, 2400)
best = np.zeros_like(purity_t)
pur = np.zeros_like(purity_t)
for i, t in enumerate(purity_t):
    a2_ = np.abs(harmonics(t))**2
    sc = [(a2_[q - 1::q].sum() / a2_.sum(), q) for q in range(2, 9)]   # q = 1 is trivially true
    ok = [q for v, q in sc if v > 0.95]
    best[i] = max(ok) if ok else np.nan
    pur[i] = max(v for v, q in sc if q == best[i]) if ok else np.nan
a2.scatter(purity_t, best, s=4, color=ACC)
for tw in (0, 0.5, 1):
    a2.plot(tw, 1, "o", color=INFO, ms=7)
a2.text(0.5, 1.35, "whole packet (t = 0, ½T moved half-way, T)", fontsize=8, color=INFO, ha="center")
a2.set_xlim(-0.02, 1.02); a2.set_ylim(0.5, 8.7)
a2.set_yticks(range(1, 9)); a2.set_yticklabels([f"{q} · {NAMES[q]}" for q in range(1, 9)], fontsize=8)
a2.set_xticks([0, 1 / 8, 1 / 4, 1 / 3, 1 / 2, 2 / 3, 3 / 4, 1]); a2.set_xticklabels(["0", "1/8", "1/4", "1/3", "1/2", "2/3", "3/4", "T"])
a2.set_title("when the waveform repeats q× (≥95% of energy on harmonics of q, q ≥ 2)", fontsize=10, color=FG2, loc="left")
a2.set_xlabel("time (gaps = fog: no single repeat)")
pf.text(0.05, 0.93, "QUANTUM SYNTHESIZER · TALBOT — the carpet's rational times, heard as the harmonic series",
        fontsize=12, color=FG1)
PNG = os.path.join(HERE, "talbot-poster.png")
pf.savefig(PNG, facecolor=BG)
print(f"wrote {PNG}")
