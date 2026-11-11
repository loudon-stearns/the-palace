#!/usr/bin/env python3
"""Light round 2026-11, second batch — five more sounds, each with a picture drawn from what the sound did.
Run from this folder: python3 make-sounds-2.py [name ...]
Everything is synthesized here; no samples. Where a neighbouring page leaks in, the function says which."""
import json, math, os, secrets, sys, wave
import numpy as np
from scipy.signal import lfilter, butter, fftconvolve

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(1973)
PAPER, INK, INK2, INK3, RULE, RED, FILL = "#f0eee5", "#1a1916", "#3a3a35", "#6a6862", "#b8b09a", "#c8261a", "#dcd9ca"
FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace\""
W = 920


# ── sound helpers ───────────────────────────────────────────────────────────
def save(name, x):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1: x = np.stack([x, x], axis=1)
    x = x / max(1e-9, np.max(np.abs(x))) * 0.86
    f = int(0.02 * SR); x[:f] *= np.linspace(0, 1, f)[:, None]; x[-f:] *= np.linspace(1, 0, f)[:, None]
    with wave.open(os.path.join(HERE, name), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype("<i2").tobytes())
    print(f"{name}: {len(x)/SR:.1f}s")


def add(buf, snd, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(snd)); buf[i:j] += gain * snd[: j - i]


def filt(x, kind, hz, order=2):
    b, a = butter(order, np.asarray(hz) / (SR / 2), kind); return lfilter(b, a, x)


def kick(dur=0.45, f0=120, f1=44):
    t = np.arange(int(dur * SR)) / SR; f = f1 + (f0 - f1) * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.5) + 0.25 * rng.standard_normal(len(t)) * np.exp(-t * 300)


def snare(dur=0.22):
    t = np.arange(int(dur * SR)) / SR
    return filt(rng.standard_normal(len(t)), "high", 1400) * np.exp(-t * 26) * 0.7 + 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 34)


def hat(dur=0.05):
    t = np.arange(int(dur * SR)) / SR; return filt(rng.standard_normal(len(t)), "high", 7000) * np.exp(-t * 90) * 0.35


def tone(freq, dur, harm=(1, 0.5, 0.33, 0.25, 0.2), attack=0.006, decay=3.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(a * np.sin(2 * np.pi * freq * (k + 1) * t) for k, a in enumerate(harm) if freq * (k + 1) < SR / 2.2)
    return x * np.minimum(1, t / attack) * np.exp(-t * decay) * np.minimum(1, (dur - t) / 0.01)


def pluck(freq, dur, bright=0.5, damp=0.996):
    """Karplus-Strong string: a burst of noise fed round a delay line."""
    n = int(dur * SR); N = int(round(SR / freq)); x = np.zeros(n); x[:N] = filt(rng.uniform(-1, 1, N), "low", 800 + 9000 * bright, 1)
    a = np.zeros(N + 2); a[0] = 1; a[N] = -0.5 * damp; a[N + 1] = -0.5 * damp
    return lfilter([1], a, x)


def reverb(x, seconds=2.2, wet=1.0):
    n = int(seconds * SR); t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t * 6.9 / seconds); ir = filt(ir, "low", 5000, 1); ir[: int(0.012 * SR)] *= 0.2
    return fftconvolve(x, ir / np.sqrt((ir ** 2).sum()))[: len(x)] * wet


def echo(x, delay, fb=0.6, lp=2200):
    """A feedback delay with a low-pass in the loop: every return is a little duller than the last."""
    d = int(delay * SR); y = np.zeros(len(x)); b, a = butter(1, lp / (SR / 2)); zi = np.zeros(1)
    for s in range(0, len(x), d):
        blk = x[s:s + d].copy()
        if s >= d:
            prev, zi = lfilter(b, a, y[s - d:s - d + len(blk)], zi=zi); blk += fb * prev
        y[s:s + len(blk)] = blk
    return y - x                                     # the returns only


def gate(n, spans, ramp=0.012):
    g = np.zeros(n)
    for a, b in spans: g[int(a * SR):int(b * SR)] = 1
    k = int(ramp * SR); return np.convolve(g, np.ones(k) / k, mode="same")


def env(x, hop=0.01):
    h = int(hop * SR); m = len(x) // h; return np.abs(x[: m * h]).reshape(m, h).max(axis=1)


# ── picture helpers ─────────────────────────────────────────────────────────
def write(name, body, h):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {h}" width="{W}" height="{h}" {FONT}>'
           f'<rect width="{W}" height="{h}" fill="{PAPER}"/>{body}</svg>')
    open(os.path.join(HERE, name), "w").write(svg); print(name, f"{len(svg)/1024:.0f} KB")


def text(x, y, s, size=12, fill=INK2, anchor="start", weight=400, extra=""):
    return f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" {extra}>{s}</text>'


def head(s): return text(40, 40, s, 14, INK, weight=700, extra='letter-spacing="3"')


def axis(x0, x1, y, total, step=2, unit="s", scale=1.0):
    g = f'<line x1="{x0}" y1="{y}" x2="{x1}" y2="{y}" stroke="{RULE}"/>'; t = 0
    while t <= total / scale + 1e-6:
        x = x0 + t * scale / total * (x1 - x0)
        g += f'<line x1="{x:.1f}" y1="{y}" x2="{x:.1f}" y2="{y+5}" stroke="{RULE}"/>' + text(x, y + 18, f"{t:g}{unit}", 10, INK3, "middle"); t += step
    return g


def envpath(e, x0, x1, yc, amp, total, color, mirror=True, opacity=1.0, step=0.01):
    xs = x0 + np.arange(len(e)) * step / total * (x1 - x0); e = e / max(1e-9, e.max()) if False else e
    top = " ".join(f"{x:.1f},{yc - v * amp:.1f}" for x, v in zip(xs, e))
    bot = " ".join(f"{x:.1f},{yc + (v * amp if mirror else 0):.1f}" for x, v in zip(xs[::-1], e[::-1]))
    return f'<polygon points="{top} {bot}" fill="{color}" fill-opacity="{opacity}"/>'


def lanes(rows, x0, x1, y0, total, rowh=30):
    """rows: (label, envelope, color). One lane per part; ink where it sounds, paper where it was pulled."""
    out = []
    for i, (label, e, color) in enumerate(rows):
        yc = y0 + i * rowh
        out += [text(x0 - 10, yc + 4, label, 11, INK2, "end"), f'<line x1="{x0}" y1="{yc}" x2="{x1}" y2="{yc}" stroke="{RULE}" stroke-width="0.5"/>',
                envpath(np.repeat((e[: len(e) // 4 * 4].reshape(-1, 4).max(axis=1)) / max(1e-9, e.max()), 1), x0, x1, yc, rowh * 0.42, total, color, step=0.04)]
    return "".join(out)


# 1 ── Dub Lineage: the engineer plays ──────────────────────────────────────
def dub():
    """Leak: Retrospective Delay, the neighbour that 'inherits this lineage': delay as memory. When a part is pulled,
    the echo goes on remembering it."""
    beat = 60 / 74; bar = 4 * beat; bars = 8; total = bars * bar + 4.0; n = int(total * SR)
    st = {k: np.zeros(n) for k in ("kick", "rim", "hat", "bass", "skank", "melodica")}
    Am, Dm = (220.0, 261.63, 329.63), (146.83 * 2, 174.61 * 2, 220.0 * 2)
    for b in range(bars):
        t0 = b * bar; ch = Am if b % 2 == 0 else Dm; root = 55.0 if b % 2 == 0 else 73.42
        add(st["kick"], kick(), t0 + 2 * beat)                                  # one drop: the kick on three
        add(st["rim"], snare(0.12), t0 + 2 * beat, 0.8)
        for e in range(8): add(st["hat"], hat(), t0 + e * beat / 2, 1.0 if e % 2 else 0.5)
        for at, f, d in ((0, root, 0.9), (1.5, root, 0.4), (2, root * 1.5, 0.5), (3, root * 1.335, 0.45), (3.5, root, 0.4)):
            add(st["bass"], filt(tone(f, d * beat * 1.6, (1, 0.6, 0.25, 0.1), 0.01, 2.2), "low", 320), t0 + at * beat, 1.3)
        for off in (0.5, 1.5, 2.5, 3.5):                                        # the skank, on every offbeat
            add(st["skank"], sum(tone(f, 0.16, (1, 0.5, 0.5, 0.3, 0.3, 0.2), 0.003, 16) for f in ch), t0 + off * beat, 0.5)
    for b, notes in ((0, ((0, 659.26, 1.5), (2, 587.33, 0.5), (2.5, 523.25, 1.3))), (1, ((0.5, 587.33, 1.0), (2, 440.0, 1.8))),
                     (5, ((0, 659.26, 0.7), (1, 783.99, 0.7))), (7, ((0, 659.26, 1.5), (2, 587.33, 0.5), (2.5, 523.25, 1.4)))):
        for at, f, d in notes: add(st["melodica"], tone(f, d * beat, (1, 0.7, 0.5, 0.4, 0.2, 0.15), 0.03, 0.8), b * bar + at * beat, 0.5)
    B = lambda a, b_: (a * bar, b_ * bar)
    on = {"kick": [B(0, 3.5), B(5, 6), B(7, 8)], "rim": [B(0, 3.6), B(7, 8)], "hat": [B(0, 2), B(6, 8)], "bass": [B(0, 6), B(7, 8)],
          "skank": [B(0, 2), B(6, 8)], "melodica": [B(0, 2), B(5, 5.5), B(7, 8)]}
    g = {k: gate(n, v) for k, v in on.items()}
    send = 0.9 * st["rim"] * gate(n, [B(3.4, 3.6), B(7.4, 7.6)]) + 0.8 * st["melodica"] * gate(n, [B(5, 5.5), B(7.5, 8)]) + 0.7 * st["skank"] * gate(n, [B(6.8, 7.0)])
    ret = filt(echo(send, 0.75 * beat, 0.68), "high", 240)
    parts = {k: st[k] * g[k] for k in st}; mix = sum(parts.values()) + 1.1 * ret
    L = mix + 0.25 * np.roll(ret, int(0.011 * SR)); R = mix - 0.25 * np.roll(ret, int(0.011 * SR)) + 0.5 * ret
    save("Dub Lineage — the engineer plays.wav", np.stack([L, R], axis=1))
    x0, x1 = 110, 880; rows = [(k, env(parts[k]), INK) for k in ("melodica", "skank", "hat", "rim", "kick", "bass")] + [("the echo", env(ret), RED)]
    out = [head("THE ENGINEER PLAYS"), lanes(rows, x0, x1, 96, total, 30)]
    for b in range(bars + 1):
        x = x0 + b * bar / total * (x1 - x0); out.append(f'<line x1="{x:.1f}" y1="74" x2="{x:.1f}" y2="290" stroke="{RULE}" stroke-width="0.5" stroke-dasharray="2 4"/>')
        if b < bars: out.append(text(x + 4, 72, f"bar {b+1}", 9, INK3))
    out += [text(x0, 322, "Blank lane: a fader pulled. Red: what the echo still remembers of a part after it is gone.", 11, INK3)]
    write("Dub Lineage — the engineer plays — picture.svg", "".join(out), 340)


# 2 ── Cooking ↔ Mixing: you cannot un-salt it ──────────────────────────────
def salt():
    phrase = [(0.0, 196.0), (0.45, 246.94), (0.9, 293.66), (1.35, 392.0), (2.0, 329.63), (2.45, 293.66), (2.9, 196.0)]
    n = int(5.0 * SR); dry = np.zeros(n)
    for at, f in phrase: add(dry, pluck(f, 1.6, 0.7, 0.990), at)
    dry /= np.abs(dry).max()
    wet = 0.55 * dry + 1.6 * reverb(dry, 2.6); wet /= np.abs(wet).max()
    e = np.repeat(env(wet), int(0.01 * SR))[:n]; e = np.pad(e, (0, n - len(e)))
    g = np.clip((e - 0.34) / 0.08, 0, 1); k = int(0.01 * SR); g = np.convolve(g, np.ones(k) / k, mode="same")
    back = wet * g; back /= max(1e-9, np.abs(back).max())                 # the attempt: a gate that shuts whenever the level drops
    gap = np.zeros(int(0.9 * SR)); save("Cooking ↔ Mixing — you cannot un-salt it.wav", np.concatenate([dry, gap, wet, gap, back]))
    out = [head("YOU CANNOT UN-SALT IT")]; x0, x1 = 150, 880
    for i, (label, sub, sig, color) in enumerate((("dry", "the dish before", dry, INK), ("reverb added", "the salt goes in", wet, INK), ("taken back out", "the attempt", back, RED))):
        yc = 110 + i * 92
        out += [text(40, yc - 2, label, 12, color, weight=700), text(40, yc + 14, sub, 10, INK3),
                f'<line x1="{x0}" y1="{yc}" x2="{x1}" y2="{yc}" stroke="{RULE}" stroke-width="0.5"/>', envpath(env(sig), x0, x1, yc, 36, 5.0, color)]
    out += [axis(x0, x1, 350, 5.0, 1), text(40, 386, "The gate cuts the tails off, but every note it lets through is still smeared.", 11, INK3),
            text(40, 404, "The dry phrase is not in there to recover.", 11, INK3)]
    write("Cooking ↔ Mixing — you cannot un-salt it — picture.svg", "".join(out), 420)


# 3 ── Rick Rubin: clear away what hides it ─────────────────────────────────
def rubin():
    """Leak: Dub Lineage (subtraction is composition), but where dub plays the faders, Rubin only ever takes away."""
    beat = 60 / 88; bar = 4 * beat; bars = 11; total = bars * bar + 2.5; n = int(total * SR)
    st = {k: np.zeros(n) for k in ("shaker", "arpeggio", "pad", "second guitar", "drums", "bass", "the guitar", "the voice")}
    prog = [(110.0, (220.0, 261.63, 329.63)), (87.31, (174.61, 220.0, 261.63)), (130.81, (261.63, 329.63, 392.0)), (98.0, (196.0, 246.94, 293.66))]
    tune = [(0, 659.26, 1.5), (1.5, 587.33, 0.5), (2, 523.25, 2), (4, 523.25, 1), (5, 440.0, 1), (6, 523.25, 2), (8, 659.26, 1.5), (9.5, 783.99, 0.5), (10, 659.26, 2), (12, 587.33, 3.5)]
    for b in range(bars):
        t0 = b * bar; root, ch = prog[b % 4]
        for e in range(16): add(st["shaker"], hat(0.03), t0 + e * beat / 4, 0.5 if e % 4 else 0.9)
        for e in range(8): add(st["arpeggio"], tone(ch[e % 3] * 2, 0.22, (1, 0.3, 0.1), 0.004, 9), t0 + e * beat / 2, 0.35)
        add(st["pad"], filt(sum(tone(f, bar, (1, 0.6, 0.4, 0.3, 0.2), 0.4, 0.15) for f in ch), "low", 1200), t0, 0.35)
        for off in (0, 1.5, 2.5, 3): add(st["second guitar"], sum(pluck(f * 2, 0.5, 0.9, 0.97) for f in ch), t0 + off * beat, 0.25)
        for off in (0, 2.5): add(st["drums"], kick(), t0 + off * beat)
        for off in (1, 3): add(st["drums"], snare(), t0 + off * beat, 0.8)
        for off in (0, 1.5, 2, 3.5): add(st["bass"], filt(tone(root, beat * 0.9, (1, 0.5, 0.3), 0.01, 2.5), "low", 300), t0 + off * beat, 1.1)
        for i, f in enumerate(ch): add(st["the guitar"], pluck(f, bar * 1.1, 0.45, 0.995), t0 + i * 0.03, 0.5)
        add(st["the guitar"], pluck(ch[1], bar * 0.5, 0.45, 0.995), t0 + 2 * beat, 0.4)
    for b0 in (0, 4, 8):                                                        # the voice: a sung vowel, two formants over a buzz
        for at, f, d in tune:
            if b0 * bar + at * beat > bars * bar - beat: continue
            m = int(d * beat * SR); t = np.arange(m) / SR; vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.25)
            buzz = sum(np.sin(2 * np.pi * (f / 2) * h * np.cumsum(vib) / SR) / h for h in range(1, 24))
            v = (filt(buzz, "band", (600, 1000)) + 0.6 * filt(buzz, "band", (1000, 1500))) * np.minimum(1, t / 0.06) * np.minimum(1, (d * beat - t) / 0.12)
            add(st["the voice"], v, b0 * bar + at * beat, 0.9)
    leave = {"shaker": 2, "arpeggio": 3, "pad": 4, "second guitar": 5, "drums": 6, "bass": 7}    # the bar each layer is taken away at
    parts = {k: st[k] * gate(n, [(0, leave.get(k, 99) * bar)], 0.05) for k in st}
    for k in parts: parts[k] /= max(1e-9, np.abs(st[k]).max())
    lev = {"shaker": 0.55, "arpeggio": 0.5, "pad": 0.5, "second guitar": 0.8, "drums": 1.0, "bass": 0.7, "the guitar": 0.28, "the voice": 0.22}   # remade: the six sit well over the two
    mix = sum(parts[k] * lev[k] for k in parts); mix += 0.12 * reverb(parts["the voice"] * lev["the voice"] + parts["the guitar"] * 0.4, 1.8)
    save("Rick Rubin — clear away what hides it.wav", np.tanh(mix * 0.9))
    x0, x1 = 130, 880; rows = [(k, env(parts[k]), RED if k.startswith("the ") else INK) for k in st]
    out = [head("CLEAR AWAY WHAT HIDES IT"), lanes(rows, x0, x1, 92, total, 28)]
    for b in range(bars + 1):
        x = x0 + b * bar / total * (x1 - x0); out.append(f'<line x1="{x:.1f}" y1="72" x2="{x:.1f}" y2="302" stroke="{RULE}" stroke-width="0.5" stroke-dasharray="2 4"/>')
    out.append(text(x0, 334, "Nothing is added after the first bar. One layer leaves at a time. The song in red was there from the start.", 11, INK3))
    write("Rick Rubin — clear away what hides it — picture.svg", "".join(out), 352)


# 4 ── John Cage: the coins decide ──────────────────────────────────────────
def cage():
    """Sixteen sounds. For each, three coins are thrown six times, as for the I Ching; the six lines choose the sound.
    The throws were made once, from the operating system's random source, and are kept in cage-throws.json: unedited."""
    f = os.path.join(HERE, "cage-throws.json")
    if not os.path.exists(f):
        json.dump([[[secrets.randbelow(2) for _ in range(3)] for _ in range(6)] for _ in range(16)], open(f, "w"))
    throws = json.load(open(f))
    gamut = [None, 130.81, 185.0, 233.08, None, 311.13, 415.3, 587.33]          # eight places in the gamut; two of them are silence
    durs = [0.45, 0.9, 1.4, 2.2]; t = 0.4; ev = []
    buf = np.zeros(int(60 * SR))
    for ev_throws in throws:
        lines = [2 * 3 + sum(c) for c in ev_throws]                             # tails 2, heads 3: each line sums to 6, 7, 8 or 9
        yang = [l in (7, 9) for l in lines]; changing = [l in (6, 9) for l in lines]
        pitch = gamut[yang[0] * 4 + yang[1] * 2 + yang[2]]; dur = durs[yang[3] * 2 + yang[4]]; loud = 1.0 if yang[5] else 0.45
        prepared = sum(changing) >= 2                                          # two or more changing lines: the string is 'prepared'
        if pitch:
            s = pluck(pitch, dur + 1.2, 0.6, 0.994)
            if prepared:
                tt = np.arange(len(s)) / SR; s = s * (0.5 + 0.5 * np.sin(2 * np.pi * pitch * 2.76 * tt)) + 0.4 * filt(rng.standard_normal(len(s)), "band", (1800, 2600)) * np.exp(-tt * 40)
            add(buf, s / np.abs(s).max(), t, loud)
        ev.append({"t": round(t, 3), "lines": lines, "pitch": pitch, "dur": dur, "loud": loud, "prepared": bool(prepared)}); t += dur
    total = t + 2.0; buf = buf[: int(total * SR)]; buf = buf + 0.2 * reverb(buf, 1.6)
    save("John Cage — the coins decide.wav", buf)
    x0, x1 = 60, 880; X = lambda s: x0 + s / total * (x1 - x0)
    out = [head("THE COINS DECIDE")]
    for e in ev:
        x = X(e["t"]); w = max(16, X(e["t"] + e["dur"]) - x - 6); lw = min(w, 30)
        for i, l in enumerate(e["lines"]):                                      # the hexagram, first throw at the bottom
            y = 150 - i * 11; c = RED if l in (6, 9) else INK
            if l in (7, 9): out.append(f'<line x1="{x:.1f}" y1="{y}" x2="{x+lw:.1f}" y2="{y}" stroke="{c}" stroke-width="4"/>')
            else: out.append(f'<line x1="{x:.1f}" y1="{y}" x2="{x+lw*0.4:.1f}" y2="{y}" stroke="{c}" stroke-width="4"/><line x1="{x+lw*0.6:.1f}" y1="{y}" x2="{x+lw:.1f}" y2="{y}" stroke="{c}" stroke-width="4"/>')
        if e["pitch"]:
            y = 300 - math.log2(e["pitch"] / 130.81) * 48
            out.append(f'<rect x="{x:.1f}" y="{y-5:.1f}" width="{w:.1f}" height="10" fill="{RED if e["prepared"] else INK}" fill-opacity="{1.0 if e["loud"] == 1 else 0.45}"/>')
        else:
            out.append(f'<rect x="{x:.1f}" y="188" width="{w:.1f}" height="124" fill="none" stroke="{RULE}" stroke-dasharray="3 4"/>')
            out.append(text(x + w / 2, 254, "silence", 9, INK3, "middle"))
    silent = sum(1 for e in ev if not e["pitch"])
    out += [text(40, 78, "the throws", 11, INK2), text(40, 182, "what they chose", 11, INK2), axis(x0, x1, 330, total, 4),
            text(40, 372, "Six lines per sound, three coins per line. A red line is a changing line; a red note is a prepared string.", 11, INK3),
            text(40, 390, f"{silent} of the 16 came up silence. Thrown once, from the computer's own random source, and kept as thrown.", 11, INK3)]
    write("John Cage — the coins decide — picture.svg", "".join(out), 404)
    return silent


# 5 ── Kick Drum ↔ Foundation: who was there first ──────────────────────────
def foundation():
    """Leak: Sidechain ↔ Conversation, the sibling bridge: in the second mix the bass steps back each time the kick speaks."""
    beat = 60 / 100; bar = 4 * beat; bars = 4; n = int(bars * bar * SR); t = np.arange(n) / SR
    k = np.zeros(n); b = np.zeros(n); p = np.zeros(n); h = np.zeros(n)
    for i in range(bars * 4): add(k, kick(0.5, 110, 46), i * beat)
    roots = [55.0, 55.0, 65.41, 49.0]
    for i in range(bars * 8):                                                   # a sustained eighth-note bass, right where the kick lives
        add(b, tone(roots[(i // 8) % 4], beat / 2 * 0.98, (1, 0.7, 0.3, 0.15), 0.008, 0.6), i * beat / 2)
    for i in range(bars): add(p, sum(tone(f, bar, (1, 0.6, 0.5, 0.3, 0.2), 0.3, 0.1) for f in (110.0, 164.81, 220.0, 261.63, 329.63)), i * bar, 0.2)
    for i in range(bars * 8): add(h, hat(), i * beat / 2 + (beat / 4 if i % 2 else 0), 0.6)
    k /= np.abs(k).max(); b /= np.abs(b).max(); p /= np.abs(p).max()
    # Mix one: melody and chords first, bass full, then the kick squeezed into what room is left (thinned, so it only clicks)
    k1 = 0.5 * filt(k, "high", 110); b1 = 0.9 * b; p1 = 0.7 * p
    # Mix two: the kick first, whole. The bass ducks under each hit and the chords give up their low end.
    duck = 1 - 0.85 * np.exp(-((t % beat)) * 9); k2 = 1.0 * k; b2 = 0.8 * b * duck; p2 = 0.55 * filt(p, "high", 260)
    m1 = k1 + b1 + p1 + 0.5 * h; m2 = k2 + b2 + p2 + 0.5 * h; gap = np.zeros(int(1.0 * SR))
    peak = max(np.abs(m1).max(), np.abs(m2).max()); save("Kick Drum ↔ Foundation — who was there first.wav", np.concatenate([m1 / peak, gap, m2 / peak]))
    low = lambda x: env(filt(x, "low", 140, 4)); x0, x1 = 270, 880; total = bar * 2; cut = int(total / 0.01)
    out = [head("WHO WAS THERE FIRST")]
    for i, (label, sub, kk, bb) in enumerate((("chords first", "kick squeezed in last", k1, b1), ("kick first", "everything else built round it", k2, b2))):
        yb = 180 + i * 130; ek, eb = low(kk)[:cut], low(bb)[:cut]
        out += [text(40, yb - 62, label, 12, INK, weight=700), text(40, yb - 46, sub, 10, INK3),
                f'<line x1="{x0}" y1="{yb}" x2="{x1}" y2="{yb}" stroke="{RULE}"/>',
                envpath(eb, x0, x1, yb, 86, total, INK, mirror=False, opacity=0.8), envpath(ek, x0, x1, yb, 86, total, RED, mirror=False, opacity=0.8)]
    out += [text(x1, 76, "below 140 Hz, two bars · red: the kick · black: the bass", 10, INK3, "end"),
            text(40, 350, "Up top the kick has no room and barely shows. Below, the bass steps back each time the kick speaks.", 11, INK3)]
    write("Kick Drum ↔ Foundation — who was there first — picture.svg", "".join(out), 366)


ALL = [dub, salt, rubin, cage, foundation]
if __name__ == "__main__":
    want = sys.argv[1:]
    for f in ALL:
        if not want or f.__name__ in want: print("→", f.__name__, f())
