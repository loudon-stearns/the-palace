#!/usr/bin/env python3
"""Light round 2026-11 — one picture for each sound, drawn from what the sound actually did.
Run after make-sounds.py (it reads sound-traces.json and the wavs): python3 make-sound-images.py"""
import json, os, wave, math
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PAPER, INK, INK2, INK3, RULE, RED, FILL = "#f0eee5", "#1a1916", "#3a3a35", "#6a6862", "#b8b09a", "#c8261a", "#dcd9ca"
FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace\""
T = json.load(open(os.path.join(HERE, "sound-traces.json")))
W = 920


def write(name, body, h):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {h}" width="{W}" height="{h}" {FONT}>'
           f'<rect width="{W}" height="{h}" fill="{PAPER}"/>{body}</svg>')
    open(os.path.join(HERE, name), "w").write(svg); print(name, f"{len(svg)/1024:.0f} KB")


def text(x, y, s, size=12, fill=INK2, anchor="start", weight=400, extra=""):
    return f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" {extra}>{s}</text>'


def head(s):
    return text(40, 40, s, 14, INK, weight=700, extra='letter-spacing="3"')


def load(name):
    w = wave.open(os.path.join(HERE, name))
    return np.frombuffer(w.readframes(w.getnframes()), "<i2").reshape(-1, 2) / 32768, w.getframerate()


def axis(x0, x1, y, t0, t1, step=2):
    g = f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="{RULE}" stroke-width="1"/>'
    t = math.ceil(t0 / step) * step
    while t <= t1 + 1e-6:
        x = x0 + (t - t0) / (t1 - t0) * (x1 - x0)
        g += f'<line x1="{x:.1f}" y1="{y}" x2="{x:.1f}" y2="{y+5}" stroke="{RULE}"/>' + text(x, y + 18, f"{t:g}s", 10, INK3, "middle")
        t += step
    return g


# ── Leibniz ─────────────────────────────────────────────────────────────────
def leibniz():
    d = T["leibniz"]; H = 330; yl, yr = 130, 230
    out = [head("TWO CLOCKS")]
    def tock(x): return f'<rect x="{x-3:.1f}" y="{yl-22}" width="6" height="44" fill="{INK}"/>'
    def tick(x): return f'<line x1="{x:.1f}" y1="{yr-22}" x2="{x:.1f}" y2="{yr+22}" stroke="{RED}" stroke-width="1.6"/>'
    # panel one: set once
    a0, a1 = 130, 440; sx = lambda t: a0 + t / 10.3 * (a1 - a0)
    for t in d["set_once"]: out += [tock(sx(t)), tick(sx(t))]
    out += [text((a0 + a1) / 2, 76, "SET ONCE", 12, INK, "middle", 700, 'letter-spacing="2"'),
            text((a0 + a1) / 2, yl + 54, "nothing joins them", 11, INK3, "middle"), axis(a0, a1, 276, 0, 10.3)]
    # panel two: wired
    b0, b1 = 500, 880; wx = lambda t: b0 + (t - 12) / 11.6 * (b1 - b0)
    L, R, K = d["wired_left"], d["wired_right"], d["wire"]
    for t, k in zip(L, K):                       # the wire: each tock tied to the nearest tick, thicker as it tightens
        r = min(R, key=lambda q: abs(q - t))
        out.append(f'<line x1="{wx(t):.1f}" y1="{yl+22}" x2="{wx(r):.1f}" y2="{yr-22}" stroke="{INK3}" stroke-width="{0.3 + 0.42*k:.2f}"/>')
    for t in L: out.append(tock(wx(t)))
    for t in R: out.append(tick(wx(t)))
    out += [text((b0 + b1) / 2, 76, "WIRED", 12, INK, "middle", 700, 'letter-spacing="2"'), axis(b0, b1, 276, 12, 23.6),
            text(b0, 306, "slack: they drift", 11, INK3), text(b1, 306, "taut: they tick as one", 11, INK3, "end")]
    out += [text(40, yl + 4, "left ear", 11, INK2), text(40, yl + 18, "wood", 10, INK3),
            text(40, yr + 4, "right ear", 11, RED), text(40, yr + 18, "metal", 10, INK3)]
    write("Leibniz — two clocks, no wire — picture.svg", "".join(out), H)


# ── Endosymbiosis ───────────────────────────────────────────────────────────
def endo():
    d = T["endosymbiosis"]; H = 340; x0, x1, y0, y1 = 90, 880, 285, 80
    t, a, b = np.array(d["t"]), np.array(d["host"]), np.array(d["guest"])
    lo, hi = 160.0, 175.0
    X = lambda v: x0 + v / 20 * (x1 - x0); Y = lambda f: y0 + (np.clip(f, lo, hi) - lo) / (hi - lo) * (y1 - y0)
    path = lambda f: "M" + " L".join(f"{X(u):.1f},{Y(v):.1f}" for u, v in zip(t, f))
    locked = t[np.argmax(np.abs(a - b) < 0.5)]
    out = [head("TWO RHYTHMS, THEN ONE"), axis(x0, x1, y0 + 12, 0, 20)]
    for f in (164, 171):
        out.append(f'<line x1="{x0}" y1="{Y(f):.1f}" x2="{x1}" y2="{Y(f):.1f}" stroke="{RULE}" stroke-width="0.7" stroke-dasharray="2 5"/>')
    out += [text(x0 - 8, Y(171) + 4, "171 Hz", 10, INK3, "end"), text(x0 - 8, Y(164) + 4, "164 Hz", 10, INK3, "end")]
    out.append(f'<path d="{path(b)}" fill="none" stroke="{RED}" stroke-width="2"/>')
    out.append(f'<path d="{path(a)}" fill="none" stroke="{INK}" stroke-width="2"/>')
    out += [text(X(0.3), Y(171) - 10, "the guest", 11, RED), text(X(0.3), Y(164) + 20, "the host", 11, INK),
            f'<line x1="{X(4):.1f}" y1="{y1-6}" x2="{X(4):.1f}" y2="{y0}" stroke="{INK3}" stroke-width="0.7" stroke-dasharray="3 3"/>',
            text(X(4) + 6, y1 + 4, "they begin to feel each other", 11, INK3),
            f'<line x1="{X(locked):.1f}" y1="{y1-6}" x2="{X(locked):.1f}" y2="{y0}" stroke="{INK3}" stroke-width="0.7" stroke-dasharray="3 3"/>',
            text(X(locked) + 6, y1 + 4, f"locked: one pitch, {a[-1]:.1f} Hz, neither's own", 11, INK3)]
    write("Endosymbiosis — two rhythms become one — picture.svg", "".join(out), H)
    return float(locked), float(a[-1])


# ── Two Batons ──────────────────────────────────────────────────────────────
def batons():
    x, sr = load("Two Batons, One Board — an impulse, then the impulse looped.wav"); m = x[:, 0]
    H = 300; x0, x1, yc, amp = 60, 880, 165, 78
    cols = x1 - x0; n = len(m) // cols
    out = [head("AN IMPULSE, THEN THE IMPULSE LOOPED"), axis(x0, x1, 262, 0, 20),
           f'<line x1="{x0}" y1="{yc}" x2="{x1}" y2="{yc}" stroke="{RULE}" stroke-width="0.7"/>']
    for c in range(cols):
        seg = m[c * n:(c + 1) * n]; hi_, lo_ = seg.max(), seg.min()
        if hi_ - lo_ > 0.004:
            t = c * n / sr
            out.append(f'<line x1="{x0+c}" y1="{yc - hi_/0.84*amp:.1f}" x2="{x0+c}" y2="{yc - lo_/0.84*amp:.1f}" stroke="{INK if t < 4.9 else RED}" stroke-width="1.2"/>')
    X = lambda t: x0 + t / 20 * cols
    out += [text(X(0.5), 70, "a baton", 12, INK, "middle", 700), text(X(0.5), 86, "one crossing, then gone", 10, INK3, "middle"),
            text(X(5), 70, "a steward", 12, RED, weight=700), text(X(5), 86, "each pass catches the last, changes it a little, drops it back", 10, INK3)]
    write("Two Batons, One Board — an impulse, then the impulse looped — picture.svg", "".join(out), H)


# ── Whitehead ───────────────────────────────────────────────────────────────
def whitehead():
    g = T["whitehead"]["grains"]; H = 340; x0, x1 = 60, 880
    rng = np.random.default_rng(1929)                                  # Process and Reality
    X = lambda t: x0 + t / 22 * (x1 - x0)
    Y = lambda f: 262 - math.log2(f / 293.66) * 150                      # the D at the bottom, its octave at the top
    out = [head("ONE OCCASION, THEN THE SOCIETY"), axis(x0, x1, 292, 0, 22)]
    for t, f, pan in g:
        out.append(f'<circle cx="{X(t):.1f}" cy="{Y(f) + rng.normal(0, 4):.1f}" r="2.6" fill="{INK}" fill-opacity="{0.9 if t < 9 else 0.34}"/>')
    out += [text(X(0.6), Y(293.66) - 26, "one grain", 11, RED, "middle"), text(X(0.6), Y(293.66) - 12, "alone", 10, INK3, "middle"),
            text(x1, Y(293.66) + 22, "the note", 10, INK3, "end"), text(x1, Y(293.66 * 1.5) - 22, "a fifth above", 10, INK3, "end"),
            text(x1, Y(293.66 * 2) - 22, "an octave above", 10, INK3, "end"),
            text(X(15.5), 70, f"{len(g):,} grains, none longer than a tenth of a second", 11, INK3, "middle")]
    write("Whitehead — one occasion, then the society — picture.svg", "".join(out), H)
    return len(g)


# ── Synthesis Notes: the block and the cut, as a spectrogram ────────────────
def marble():
    import matplotlib; matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.colors import LinearSegmentedColormap
    x, sr = load("Synthesis Notes (Loudon) — marble, then the chisel.wav"); m = x[:, 0]
    plt.rcParams["font.family"] = ["Menlo", "monospace"]
    fig = plt.figure(figsize=(9.2, 3.6), dpi=200, facecolor=PAPER); ax = fig.add_axes([0.065, 0.14, 0.915, 0.70], facecolor=PAPER)
    cmap = LinearSegmentedColormap.from_list("ink", [PAPER, "#b9b4a3", INK2, INK])
    ax.specgram(m, NFFT=4096, Fs=sr, noverlap=3584, cmap=cmap, vmin=-112, vmax=-38)
    ax.set_ylim(0, 7000); ax.set_xlim(0, 16)
    ax.axvline(5, color=RED, lw=1, ls=(0, (4, 3)))
    ax.text(2.5, 7250, "THE BLOCK", ha="center", fontsize=9, color=INK, fontweight="bold")
    ax.text(10.5, 7250, "THE CHISEL", ha="center", fontsize=9, color=RED, fontweight="bold")
    ax.text(2.5, 6350, "every harmonic of a low E", ha="center", fontsize=7, color=INK, bbox=dict(facecolor=PAPER, edgecolor="none", pad=2.5))
    ax.text(15.8, 6350, "what is white here was cut away", ha="right", fontsize=7, color=INK, bbox=dict(facecolor=PAPER, edgecolor="none", pad=2.5))
    ax.set_yticks([0, 2000, 4000, 6000]); ax.set_yticklabels(["0", "2k", "4k", "6k Hz"], fontsize=7, color=INK3)
    ax.set_xticks(range(0, 17, 2)); ax.set_xticklabels([f"{t}s" for t in range(0, 17, 2)], fontsize=7, color=INK3)
    ax.tick_params(color=RULE, length=3)
    for s in ax.spines.values(): s.set_color(RULE)
    fig.text(0.04, 0.925, "M A R B L E ,   T H E N   T H E   C H I S E L", fontsize=10.5, color=INK, fontweight="bold")
    fig.savefig(os.path.join(HERE, "Synthesis Notes (Loudon) — marble, then the chisel — picture.png"), facecolor=PAPER); print("marble png")


if __name__ == "__main__":
    leibniz(); print(endo()); batons(); print(whitehead()); marble()
