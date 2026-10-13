#!/usr/bin/env python3
"""
Ladder — what do the creation and annihilation operators actually do to the sound?
==================================================================================
The entry says a-dagger "adds one overtone" and a "removes one", and that
measurement collapse is "the resonant filter". This script plays each move on
the harmonic oscillator  E_n = n + 1/2  (omega <-> 220 Hz) through TWO listeners:

  CLOCK     Re psi(x0, t). Hears the phase turning. Each rung is one sine at
            (n + 1/2) * 220 Hz = 110, 330, 550 ... : the odd harmonics of 110.
            The zero-point 1/2 is what makes them odd. But a global phase is
            not physical, so nothing in the world can hear this listener.
  DETECTOR  |psi(x0, t)|^2, the probability at one place: what a measurement
            could actually register. It hears only DIFFERENCES of rungs, so
            only whole multiples of 220 Hz, and a single rung is dead silent:
            a stationary state is stationary.

Moves, probe at x0 = 1.0, each played clock then detector:
  1 ground state |0>          4 coherent state |alpha>, alpha = 2.2
  2 a-dagger climbs 0 -> 5    5 a|alpha>        (remove one quantum)
  3 (|0> + |1>)/sqrt 2        6 a-dagger|alpha> (add one quantum)
                              7 measure energy  -> collapses to |4>

Writes beside this script:
  ladder.wav          ~36 s
  ladder.mp4          the same audio, packet drawn slowed down, ladder and spectrum
  ladder-poster.png   the seven moves, both listeners, in one still
  ladder-checks.txt   the printed checks
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
FW = 220.0                   # omega <-> 220 Hz
N = 60                       # truncated Fock basis
X0 = 1.0                     # probe point
ALPHA = 2.2
SEGDUR, GAP = 2.2, 0.35
LOG = io.StringIO()


def say(*a):
    s = " ".join(str(x) for x in a)
    print(s); LOG.write(s + "\n")


def hermite_fns(x, nmax):
    out = np.zeros((nmax + 1, len(x)))
    out[0] = np.pi**-0.25 * np.exp(-x * x / 2)
    out[1] = np.sqrt(2) * x * out[0]
    for n in range(2, nmax + 1):
        out[n] = np.sqrt(2 / n) * x * out[n - 1] - np.sqrt((n - 1) / n) * out[n - 2]
    return out


ok = True
A = np.diag(np.sqrt(np.arange(1, N)), 1)        # annihilation: a|n> = sqrt(n)|n-1>
AD = A.T                                          # creation
nn_ = np.arange(N)
E = nn_ + 0.5
PHI0 = hermite_fns(np.array([X0]), N - 1)[:, 0]


def fock(n):
    v = np.zeros(N); v[n] = 1.0; return v


def unit(v):
    return v / np.linalg.norm(v)


lgf = np.cumsum(np.log(np.maximum(nn_, 1)))       # log n!
COH = np.exp(-ALPHA**2 / 2 + nn_ * np.log(ALPHA) - 0.5 * lgf)


def signals(c, dur):
    t = np.arange(int(dur * SR)) / SR
    ph = np.exp(-1j * 2 * np.pi * FW * np.outer(E, t))
    psi = (c * PHI0) @ ph
    return t, np.real(psi), np.abs(psi)**2


def peaks(sig, thr_db=-40):
    w = np.hanning(len(sig)); S = np.abs(np.fft.rfft(sig * w))
    f = np.fft.rfftfreq(len(sig), 1 / SR)
    if S.max() == 0:
        return f, S, []
    m = S / S.max()
    pk = [i for i in range(1, len(m) - 1) if m[i] > m[i - 1] and m[i] >= m[i + 1] and 20 * np.log10(m[i] + 1e-30) > thr_db]
    return f, S, [(f[i], m[i]) for i in pk]


# ======================================================================
say("== check 1: a-dagger moves the state up ONE rung; the clock hears one new pitch, not one more ==")
for n in range(5):
    v = AD @ fock(n)
    exact = np.allclose(v, np.sqrt(n + 1) * fock(n + 1))
    _, clk, _ = signals(unit(v), 1.0)
    _, _, pk = peaks(clk)
    say(f"  a†|{n}> = sqrt({n + 1})|{n + 1}>: {exact}   clock partials above -40 dB: "
        + ", ".join(f"{p:.0f} Hz" for p, _ in pk) + f"   (want {(n + 1.5) * FW:.0f})")
    ok &= exact and len(pk) == 1 and abs(pk[0][0] - (n + 1.5) * FW) < 2

say("== check 2: a single rung is silent to the detector (relative wobble of |psi(x0,t)|^2) ==")
for n in range(6):
    _, _, d = signals(fock(n), 0.5)
    rel = d.std() / d.mean()
    say(f"  |{n}>  wobble {rel:.1e}")
    ok &= rel < 1e-9

say("== check 3: two rungs beat at their DIFFERENCE ==")
_, clk, d = signals(unit(fock(0) + fock(1)), 1.0)
_, _, pc = peaks(clk); _, _, pd = peaks(d - d.mean())
say("  clock: " + ", ".join(f"{p:.0f}" for p, _ in pc) + " Hz   detector: " + ", ".join(f"{p:.0f}" for p, _ in pd) + " Hz")
ok &= len(pd) == 1 and abs(pd[0][0] - FW) < 2

say(f"== check 4: coherent state alpha = {ALPHA}: clock = odd multiples of 110, detector = whole multiples of 220 ==")
say(f"  truncation: norm^2 = {np.sum(COH**2):.12f}")
_, clk, d = signals(COH, 1.0)
_, _, pc = peaks(clk); _, _, pd = peaks(d - d.mean())
odd = all(abs(p / 110 - round(p / 110)) < 0.02 and round(p / 110) % 2 == 1 for p, _ in pc)
whole = all(abs(p / FW - round(p / FW)) < 0.01 for p, _ in pd)
say("  clock    (×110 Hz): " + ", ".join(f"{p / 110:.2f}" for p, _ in pc) + f"   all odd: {odd}")
say("  detector (×220 Hz): " + ", ".join(f"{p / FW:.2f}" for p, _ in pd) + f"   all whole: {whole}")
ok &= odd and whole

say("== check 5: REMOVE a quantum from |alpha> (apply a): nothing changes ==")
ca = unit(A @ COH)
fid = (ca @ COH)**2
_, _, d1 = signals(COH, 1.0); _, _, d2 = signals(ca, 1.0)
say(f"  a|alpha> = alpha|alpha>: fidelity {fid:.12f}   detector waveform max difference {np.max(np.abs(d1 - d2)) / np.max(np.abs(d1 - d1.mean())):.1e} of its swing")
ok &= fid > 1 - 1e-10

say("== check 6: ADD a quantum to |alpha> (apply a-dagger): the sound does change, but not by one overtone ==")
cad = unit(AD @ COH)
fid2 = (cad @ COH)**2
say(f"  fidelity {fid2:.6f} (theory alpha^2/(alpha^2+1) = {ALPHA**2 / (ALPHA**2 + 1):.6f})")
_, _, d3 = signals(cad, 1.0)
_, _, p1 = peaks(d1 - d1.mean()); _, _, p3 = peaks(d3 - d3.mean())
say(f"  detector partials above -40 dB: |alpha> {len(p1)}, a†|alpha> {len(p3)}")
for k in range(1, 6):
    a1 = next((m for p, m in p1 if abs(p - k * FW) < 3), 0); a3 = next((m for p, m in p3 if abs(p - k * FW) < 3), 0)
    say(f"    {k}×220 Hz   |alpha> {20 * np.log10(a1 + 1e-12):6.1f} dB   a†|alpha> {20 * np.log10(a3 + 1e-12):6.1f} dB")
ok &= abs(fid2 - ALPHA**2 / (ALPHA**2 + 1)) < 1e-6

say("== check 7: measuring the energy picks one rung, with Poisson odds; the detector then goes silent ==")
P = COH**2
say("  P(n): " + "  ".join(f"{n}:{P[n]:.3f}" for n in range(10)) + f"   most likely n = {np.argmax(P)}")
NC = int(np.argmax(P))
ok &= NC == 4
say("  PASS" if ok else "  FAIL")

# ======================================================================
# audio
# ======================================================================
MOVES = [
    ("ground state |0⟩", "c", fock(0)),
    ("a† climbs the ladder: |0⟩ → |5⟩", "stair", None),
    ("two rungs: (|0⟩ + |1⟩)/√2", "c", unit(fock(0) + fock(1))),
    (f"coherent state |α⟩, α = {ALPHA}", "c", COH),
    ("remove a quantum: a|α⟩", "c", ca),
    ("add a quantum: a†|α⟩", "c", cad),
    (f"measure the energy → |{NC}⟩", "c", fock(NC)),
]


def fade(x, ms=12):
    k = int(ms * SR / 1000); r = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, k))
    x = x.copy(); x[:k] *= r; x[-k:] *= r[::-1]; return x


def render(mv, listener):
    name, kind, c = mv
    if kind == "stair":
        parts, states = [], []
        for n in range(6):
            _, clk, d = signals(fock(n), SEGDUR / 6 * 2)
            s = clk if listener == "clock" else d - d.mean()
            parts.append(fade(s, 8)); states.append(fock(n))
        return np.concatenate(parts), states
    _, clk, d = signals(c, SEGDUR)
    return (clk if listener == "clock" else d - d.mean()), [c]


SEG, chunks, tcur = [], [], 0.0
for mi, mv in enumerate(MOVES):
    for listener in ("clock", "detector"):
        s, states = render(mv, listener)
        pk = np.max(np.abs(s))
        silent = pk < 1e-9 * (1 + np.max(np.abs(signals(states[0], 0.05)[2])))
        s = np.zeros_like(s) if silent else fade(0.45 * s / pk)
        dur = len(s) / SR
        if silent:
            pks = [[]] * len(states)
        else:                                             # one spectrum per step, so the stair shows its single rung
            L_ = len(s) // len(states)
            pks = [peaks(s[i * L_:(i + 1) * L_])[2] for i in range(len(states))]
        SEG.append(dict(t0=tcur, t1=tcur + dur, move=mi, name=mv[0], listener=listener, states=states,
                        silent=silent, steps=pks, peaks=pks[-1]))
        chunks += [s, np.zeros(int(GAP * SR))]
        tcur += dur + GAP
    chunks.append(np.zeros(int(0.3 * SR))); tcur += 0.3
audio = np.concatenate(chunks)
TOTAL = len(audio) / SR
WAV = os.path.join(HERE, "ladder.wav")
with wave.open(WAV, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())
say(f"wrote ladder.wav ({TOTAL:.1f} s)")
for sg in SEG:
    say(f"  {sg['t0']:5.1f}s  {sg['listener']:8s}  {sg['name']:34s}  "
        + ("silent" if sg['silent'] else " | ".join(f"{len(st)} partial(s): " + ", ".join(f"{p:.0f}" for p, _ in st[:8]) for st in sg['steps'])))

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
xs = np.linspace(-6, 6, 600)
PHI_S = hermite_fns(xs, N - 1)
FMAX = 2600


def style(ax):
    for sp in ax.spines.values():
        sp.set_color(BORDER)
    ax.tick_params(length=3)


def density(c, tau):
    return np.abs((c * np.exp(-1j * E * tau)) @ PHI_S)**2


def spec(ax, sg, col, k=-1):
    pk = sg["steps"][k]
    if sg["silent"]:
        ax.text(0.5, 0.5, "silence", transform=ax.transAxes, ha="center", va="center", color=FG3, fontsize=12)
    else:
        ax.vlines([p for p, _ in pk], 0, [m for _, m in pk], color=col, lw=2.2)
    ax.set_xlim(0, FMAX); ax.set_ylim(0, 1.1); ax.set_yticks([])


# ---- poster ----
fig, axs = plt.subplots(len(MOVES), 4, figsize=(16, 13), gridspec_kw={"width_ratios": [1.1, 0.5, 1, 1]})
fig.subplots_adjust(left=0.13, right=0.98, top=0.88, bottom=0.05, hspace=0.45, wspace=0.15)
fig.text(0.05, 0.95, "Ladder — what a† and a do to the sound", fontsize=24, family=[SERIF, "DejaVu Serif"], color=FG1)
fig.text(0.05, 0.915, "clock = Re ψ(x₀,t): the phase turning, odd multiples of 110 Hz, unobservable  ·  "
         "detector = |ψ(x₀,t)|²: what a measurement registers, differences only, multiples of 220 Hz", fontsize=10, color=FG3)
for mi, mv in enumerate(MOVES):
    sc = [s for s in SEG if s["move"] == mi]
    c = mv[2] if mv[2] is not None else fock(5)
    a0, a1, a2, a3 = axs[mi]
    for a in axs[mi]:
        style(a)
    for k in range(5):
        a0.plot(xs, density(c, 2 * np.pi * k / 5) + 0 * k, color=INFO, lw=0.8, alpha=0.25 + 0.15 * k)
    a0.axvline(X0, color=ACC, lw=0.8, ls=":"); a0.set_xlim(-5, 5); a0.set_yticks([])
    occ = c**2                                          # the stair row shows where it ends: |5>
    a1.bar(nn_[:12], occ[:12], color=FG2, width=0.7); a1.set_xlim(-0.6, 11.6); a1.set_yticks([])
    spec(a2, sc[0], FG2); spec(a3, sc[1], ACC)
    fig.text(0.01, a0.get_position().y0 + 0.02, mv[0], fontsize=9, color=FG1, wrap=True)
    if mi < len(MOVES) - 1:
        for a in axs[mi]:
            a.set_xticklabels([])
axs[0, 0].set_title("|ψ(x)|² over one swing · probe dotted", fontsize=9, color=FG2)
axs[0, 1].set_title("rungs |cₙ|²", fontsize=9, color=FG2)
axs[0, 2].set_title("clock (unobservable)", fontsize=9, color=FG2)
axs[0, 3].set_title("detector (observable)", fontsize=9, color=FG2)
axs[-1, 1].set_xlabel("n"); axs[-1, 2].set_xlabel("Hz"); axs[-1, 3].set_xlabel("Hz")
fig.savefig(os.path.join(HERE, "ladder-poster.png"), facecolor=BG); plt.close(fig)
say("wrote ladder-poster.png")

# ---- video ----
W_PX, H_PX = 1280, 720
fig = plt.figure(figsize=(W_PX / 100, H_PX / 100), dpi=100)
ax_x = fig.add_axes([0.05, 0.30, 0.38, 0.46]); ax_n = fig.add_axes([0.46, 0.30, 0.16, 0.46])
ax_f = fig.add_axes([0.66, 0.30, 0.31, 0.46]); ax_t = fig.add_axes([0.05, 0.08, 0.92, 0.10])
for a in (ax_x, ax_n, ax_f, ax_t):
    style(a)
t_title = fig.text(0.05, 0.91, "", fontsize=22, family=[SERIF, "DejaVu Serif"], color=FG1)
t_sub = fig.text(0.05, 0.85, "", fontsize=11, color=ACC)
fig.text(0.05, 0.79, "|ψ(x,t)|², slowed ~350× · probe x₀ dotted", fontsize=9, color=FG3)
fig.text(0.46, 0.79, "rungs |cₙ|²", fontsize=9, color=FG3)
fig.text(0.66, 0.79, "measured spectrum of what you hear (Hz)", fontsize=9, color=FG3)
for sg in SEG:
    ax_t.axvspan(sg["t0"], sg["t1"], color=FG4 if sg["listener"] == "clock" else ACC, alpha=0.35, lw=0)
for mi in range(len(MOVES)):
    t0 = [s for s in SEG if s["move"] == mi][0]["t0"]
    ax_t.text(t0, 1.08, str(mi + 1), transform=ax_t.get_xaxis_transform(), fontsize=8, color=FG2)
ax_t.set_xlim(0, TOTAL); ax_t.set_yticks([]); ax_t.set_xlabel("seconds · grey: clock (the phase, unobservable) · gold: detector (what a measurement hears)")
head = ax_t.axvline(0, color=FG1, lw=1.4)
SUB = {"clock": "listening to the CLOCK — Re ψ at the probe: the phase turning, which nothing physical can hear",
       "detector": "listening to the DETECTOR — |ψ|² at the probe: only differences between rungs make sound"}
line, = ax_x.plot([], [], color=INFO, lw=1.6)
ax_x.axvline(X0, color=ACC, lw=0.9, ls=":"); ax_x.set_xlim(-5.5, 5.5); ax_x.set_ylim(0, 0.75); ax_x.set_yticks([])
cur = None
MP4 = os.path.join(HERE, "ladder.mp4")
cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
       "-s", f"{W_PX}x{H_PX}", "-r", str(FPS), "-i", "-", "-i", WAV,
       "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23", "-preset", "medium",
       "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", MP4]
proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
n_frames = int(TOTAL * FPS)
for jf in range(n_frames):
    tt = jf / FPS
    sg = next((s for s in SEG if s["t0"] <= tt < s["t1"] + GAP + 0.3), SEG[-1])
    k = min(int((tt - sg["t0"]) / (sg["t1"] - sg["t0"]) * len(sg["states"])), len(sg["states"]) - 1)
    c = sg["states"][max(k, 0)]
    if (id(sg), k) != cur:
        cur = (id(sg), k)
        ax_n.cla(); style(ax_n); ax_n.bar(nn_[:12], c[:12]**2, color=FG2, width=0.7)
        ax_n.set_xlim(-0.6, 11.6); ax_n.set_ylim(0, 1.05); ax_n.set_yticks([]); ax_n.set_xlabel("n")
        ax_f.cla(); style(ax_f); spec(ax_f, sg, FG2 if sg["listener"] == "clock" else ACC, max(k, 0))
        t_title.set_text(f"{sg['move'] + 1} · {sg['name']}")
        t_sub.set_text(SUB[sg["listener"]])
    line.set_data(xs, density(c, 2 * np.pi * (tt - sg["t0"]) / 1.6))
    head.set_xdata([tt, tt])
    fig.canvas.draw()
    proc.stdin.write(np.asarray(fig.canvas.buffer_rgba())[:, :, :3].tobytes())
proc.stdin.close(); proc.wait()
say(f"wrote ladder.mp4 ({n_frames} frames)")

with open(os.path.join(HERE, "ladder-checks.txt"), "w") as fh:
    fh.write(LOG.getvalue())
sys.exit(0 if ok else 1)
