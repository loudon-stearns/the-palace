#!/usr/bin/env python3
"""Light round 2026-11, third batch — six more sounds, each with a picture drawn from what the sound did.
Run from this folder: python3 make-sounds-3.py [name ...]   Helpers come from make-sounds-2.py."""
import importlib.util, math, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("s2", os.path.join(HERE, "make-sounds-2.py")); s2 = importlib.util.module_from_spec(spec); spec.loader.exec_module(s2)
SR, save, add, filt, kick, snare, hat, tone, pluck, reverb, gate, env = s2.SR, s2.save, s2.add, s2.filt, s2.kick, s2.snare, s2.hat, s2.tone, s2.pluck, s2.reverb, s2.gate, s2.env
import textwrap
_write, text, head, axis, envpath, lanes = s2.write, s2.text, s2.head, s2.axis, s2.envpath, s2.lanes


def feet(y, *ls):
    ws = [w for l in ls for w in textwrap.wrap(l, 124)]
    return "".join(text(40, y + 17 * i, w, 11, s2.INK3) for i, w in enumerate(ws)), y + 17 * len(ws) + 8


def write(name, body, h):
    _write(name, body, h + 34)   # room for a wrapped third line
PAPER, INK, INK2, INK3, RULE, RED, FILL = s2.PAPER, s2.INK, s2.INK2, s2.INK3, s2.RULE, s2.RED, s2.FILL
rng = np.random.default_rng(1988)                       # the year of the cistern


# 1 ── Loudon Live: the trace, heard ────────────────────────────────────────
def lissajous():
    """Leak: Rational Hearing. The figure is a ratio you can hear: three against two is a perfect fifth."""
    total = 16.0; t = np.arange(int(total * SR)) / SR; fx, fy = 220.0, 330.0 + 0.0625   # the fifth, a sixteenth of a hertz wide, so the figure turns once
    e = np.minimum(1, t / 0.5) * np.minimum(1, (total - t) / 1.5)
    L = np.sin(2 * np.pi * fx * t) * e; R = np.sin(2 * np.pi * fy * t) * e
    save("Loudon Live — the trace, heard.wav", np.stack([L, R], axis=1))
    cx, cy, r = 460, 250, 150; frames = []
    for k in range(25):
        ph = 2 * np.pi * k / 24; u = np.linspace(0, 2 * np.pi, 241)
        frames.append("M" + " L".join(f"{cx + r*math.sin(2*a):.1f},{cy - r*math.sin(3*a + ph):.1f}" for a in u))
    body = (head("THE TRACE, HEARD") + f'<circle cx="{cx}" cy="{cy}" r="{r*1.42:.0f}" fill="#050a06" stroke="{INK}" stroke-width="1.5"/>'
            + f'<path d="{frames[0]}" fill="none" stroke="#33ff66" stroke-width="2.2" stroke-linejoin="round"><animate attributeName="d" dur="16s" repeatCount="indefinite" values="{";".join(frames)}"/></path>'
            + text(cx - r * 1.42 - 20, cy + 4, "left ear: 220 Hz", 11, INK2, "end") + text(cx - r * 1.42 - 20, cy + 20, "moves it side to side", 10, INK3, "end")
            + text(cx + r * 1.42 + 20, cy + 4, "right ear: 330 Hz", 11, INK2) + text(cx + r * 1.42 + 20, cy + 20, "moves it up and down", 10, INK3)
            + feet(492, "Three loops one way and two the other: the shape is the interval. The right ear is a sixteenth of a hertz sharp,", "which is why the figure turns over once in sixteen seconds. The sound and the picture are the same two numbers.")[0])
    write("Loudon Live — the trace, heard — picture.svg", body, 528)


# 2 ── Pauline Oliveros: one point, then the whole sphere ───────────────────
def listening():
    """Leak: John Cage, whom the map says she contradicts: one of the sounds in the room is a prepared string from his piece."""
    total = 26.0; n = int(total * SR); t = np.arange(n) / SR
    rain = filt(rng.standard_normal(n), "band", (1500, 6000)) * 0.10 * (1 + 0.3 * np.sin(2 * np.pi * 0.11 * t))
    hum = sum(np.sin(2 * np.pi * 60 * h * t) / h ** 1.5 for h in (1, 2, 3, 5)) * 0.10
    drip = np.zeros(n); bird = np.zeros(n); bell = np.zeros(n); string = np.zeros(n)
    for at in np.arange(0.6, total - 1, 1.3): add(drip, tone(1650 + 120 * rng.standard_normal(), 0.18, (1, 0.3), 0.002, 22), at + 0.08 * rng.standard_normal(), 0.5)
    for at in (2.2, 7.9, 13.4, 16.1, 20.3, 23.0):
        for k in range(4):
            m = int(0.09 * SR); tt = np.arange(m) / SR; add(bird, np.sin(2 * np.pi * (3200 + 2600 * tt / 0.09) * tt) * np.hanning(m), at + k * 0.13, 0.22)
    for at in (4.5, 15.0, 22.0): add(bell, sum(tone(f, 5.0, (1,), 0.004, 0.9) * a for f, a in ((392, 1), (392 * 2.76, 0.5), (392 * 5.4, 0.25))), at, 0.3)
    for at in (9.0, 18.5):
        s = pluck(185.0, 3.0, 0.6, 0.994); tt = np.arange(len(s)) / SR; add(string, s * (0.5 + 0.5 * np.sin(2 * np.pi * 185 * 2.76 * tt)), at, 0.5)
    parts = {"rain": rain, "mains hum": hum, "a bird": bird, "a far bell": bell, "a prepared string": string, "a drip": drip}
    focal = gate(n, [(0, 11.5)], 0.4); glob = gate(n, [(13.0, total)], 0.6)
    L = np.zeros(n); R = np.zeros(n); pans = {"rain": 0.5, "mains hum": 0.35, "a bird": 0.85, "a far bell": 0.2, "a prepared string": 0.7, "a drip": 0.5}; heard = {}
    for k, x in parts.items():
        g = (focal * (1.0 if k == "a drip" else 0.02) + glob * 1.0); y = x * g; heard[k] = y
        L += y * (1 - pans[k]) * (1 if k == "a drip" else 1.4); R += y * pans[k] * (1 if k == "a drip" else 1.4)
    wet = reverb(L + R, 2.4) * 0.12 * glob
    save("Pauline Oliveros — one point, then the whole sphere.wav", np.stack([L + wet, R + np.roll(wet, 400)], axis=1))
    x0, x1 = 150, 880; rows = [(k, env(heard[k]) + 1e-4, RED if k == "a drip" else INK) for k in ("a far bell", "a bird", "a prepared string", "rain", "mains hum", "a drip")]
    out = [head("ONE POINT, THEN THE WHOLE SPHERE"), lanes(rows, x0, x1, 110, total, 32), axis(x0, x1, 296, total, 4)]
    X = lambda s: x0 + s / total * (x1 - x0)
    out += [text(X(5.7), 80, "FOCAL", 12, RED, "middle", 700, 'letter-spacing="2"'), text(X(19.5), 80, "GLOBAL", 12, INK, "middle", 700, 'letter-spacing="2"'),
            f'<line x1="{X(12.2):.1f}" y1="70" x2="{X(12.2):.1f}" y2="290" stroke="{RULE}" stroke-dasharray="3 4"/>',
            feet(340, "The same room both times. First attention closes on the drip and everything else falls away; then it opens and nothing is left out.", "A synthesized room, not a recording. In the first half the other sounds are turned down forty times, which is my stand-in for not attending.")[0]]
    write("Pauline Oliveros — one point, then the whole sphere — picture.svg", "".join(out), 376)


# 3 ── The Drift: placed, then let go ───────────────────────────────────────
def drift():
    """Leak: Granular Synthesis and Particle Synthesis, the page's own two examples, and Whitehead's grain from the first batch."""
    total = 24.0; n = int(total * SR); L = np.zeros(n); R = np.zeros(n); placed, loose = [], []
    def grain(f, d=0.07):
        m = int(d * SR); tt = np.arange(m) / SR; return np.hanning(m) * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt))
    scale = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33]; pat = [0, 2, 4, 7, 4, 2, 5, 3]
    for i in range(72):                                         # the fortress: every grain a decision, on a grid, in a pattern
        at = 0.4 + i * 0.125; f = scale[pat[i % 8]] * (2 if (i // 16) % 2 else 1); g = grain(f); pan = 0.3 + 0.4 * ((i % 8) / 7)
        add(L, g, at, 0.5 * (1 - pan)); add(R, g, at, 0.5 * pan); placed.append((at, f))
    # the Drift: forty particles dropped in a box with gravity; a grain sounds only when one strikes the floor or a wall
    P = 40; x = rng.uniform(0.05, 0.95, P); y = rng.uniform(0.5, 1.0, P); vx = rng.normal(0, 0.25, P); vy = np.zeros(P); dt = 0.004; t0 = 11.5
    for step in range(int(11.5 / dt)):
        vy -= 2.2 * dt; x += vx * dt; y += vy * dt; now = t0 + step * dt
        for k in np.where(y < 0)[0]:
            sp = abs(vy[k]); y[k] = 0; vy[k] = -vy[k] * 0.78
            if sp > 0.06:
                f = 220 * 2 ** (x[k] * 1.5); g = grain(f, 0.05 + 0.04 * rng.random()); a = min(1, sp / 1.6) * 0.6
                add(L, g, now, a * (1 - x[k])); add(R, g, now, a * x[k]); loose.append((now, f, a))
        for k in np.where((x < 0) | (x > 1))[0]: x[k] = np.clip(x[k], 0, 1); vx[k] = -vx[k] * 0.9
    save("The Drift — placed, then let go.wav", np.stack([L, R], axis=1))
    x0, x1 = 60, 880; X = lambda s: x0 + s / total * (x1 - x0); Y = lambda f: 300 - math.log2(f / 220) * 68
    out = [head("PLACED, THEN LET GO"), axis(x0, x1, 312, total, 4)]
    out += [f'<circle cx="{X(a):.1f}" cy="{Y(f):.1f}" r="2.8" fill="{INK}"/>' for a, f in placed]
    out += [f'<circle cx="{X(a):.1f}" cy="{Y(f):.1f}" r="{1.5 + 3*v:.1f}" fill="{RED}" fill-opacity="0.55"/>' for a, f, v in loose]
    out += [text(X(5), 84, "THE FORTRESS", 12, INK, "middle", 700, 'letter-spacing="2"'), text(X(5), 100, "seventy-two grains, every one decided", 10, INK3, "middle"),
            text(X(17.5), 84, "THE DRIFT", 12, RED, "middle", 700, 'letter-spacing="2"'), text(X(17.5), 100, f"forty particles dropped; {len(loose)} grains nobody placed", 10, INK3, "middle"),
            feet(356, "Left, a pattern laid on a grid. Right, a box, some gravity, and a grain each time something lands: the rules were chosen,", "the notes were not. It thins out by itself as the particles come to rest.")[0]]
    write("The Drift — placed, then let go — picture.svg", "".join(out), 392)
    return len(loose)


# 4 ── Trickster: the corner that disappears ────────────────────────────────
def knee():
    """Leak: Compressor Design, where the palace's soft knee lives. The page calls it 'trickster mathematics'."""
    beat = 60 / 96; bars = 2; n = int(bars * 4 * beat * SR); x = np.zeros(n)
    for b in range(bars * 4): add(x, kick(), b * beat, 1.0 if b % 2 == 0 else 0.45)
    for b in range(bars * 2): add(x, snare(), (b * 2 + 1) * beat, 0.7)
    for e in range(bars * 8): add(x, hat(), e * beat / 2, 0.3 + 0.5 * (e % 3 == 0))
    for b in range(bars): add(x, filt(tone(55.0, 4 * beat, (1, 0.6, 0.3), 0.02, 0.3), "low", 300), b * 4 * beat, 0.5)
    x /= np.abs(x).max(); T, ratio = -24.0, 8.0
    def curve(db, W):
        over = db - T
        if W == 0: return np.where(over > 0, T + over / ratio, db)
        return np.where(2 * over < -W, db, np.where(2 * over > W, T + over / ratio, db + (1 / ratio - 1) * (over + W / 2) ** 2 / (2 * W)))
    def comp(sig, W):
        lev = np.zeros(len(sig)); e = 0.0; a, r = math.exp(-1 / (0.004 * SR)), math.exp(-1 / (0.09 * SR)); ab = np.abs(sig)
        for i in range(len(sig)):
            e = a * e + (1 - a) * ab[i] if ab[i] > e else r * e + (1 - r) * ab[i]; lev[i] = e
        db = 20 * np.log10(np.maximum(lev, 1e-6)); g = curve(db, W) - db; return sig * 10 ** (g / 20), g
    hard, gh = comp(x, 0.0); soft, gs = comp(x, 24.0); gap = np.zeros(int(0.8 * SR)); pk = max(np.abs(hard).max(), np.abs(soft).max())
    save("Trickster — the corner that disappears.wav", np.concatenate([hard / pk, gap, soft / pk]))
    out = [head("THE CORNER THAT DISAPPEARS")]; d = np.linspace(-60, 0, 121)
    for i, (W, lab, col) in enumerate(((0.0, "HARD KNEE", INK), (24.0, "SOFT KNEE", RED))):
        ox = 110 + i * 420; S = 250; P = lambda a, b: (ox + (a + 60) / 60 * S, 380 - (b + 60) / 60 * S)
        out += [f'<rect x="{ox}" y="130" width="{S}" height="{S}" fill="none" stroke="{RULE}"/>', f'<line x1="{ox}" y1="380" x2="{ox+S}" y2="130" stroke="{RULE}" stroke-dasharray="3 4"/>',
                f'<path d="M' + " L".join(f"{P(a, b)[0]:.1f},{P(a, b)[1]:.1f}" for a, b in zip(d, curve(d, W))) + f'" fill="none" stroke="{col}" stroke-width="2.6"/>',
                text(ox + S / 2, 110, lab, 12, col, "middle", 700, 'letter-spacing="2"'), text(ox + S / 2, 400, "level in", 10, INK3, "middle"),
                f'<circle cx="{P(T, T)[0]:.1f}" cy="{P(T, T)[1]:.1f}" r="4" fill="{PAPER}" stroke="{INK}" stroke-width="1.4"/>', text(P(T, T)[0] + 8, P(T, T)[1] + 16, "threshold", 10, INK3)]
        out.append(text(ox - 10, 255, "out", 10, INK3, "end"))
    out += [feet(440, "The same rule on both sides: above the threshold, eight decibels in buys one out. On the left you can point at where it starts.", "On the right the boundary is still there, in the same place, and you cannot find it. The sound plays the hard knee first.")[0]]
    write("Trickster — the corner that disappears — picture.svg", "".join(out), 476)
    return float(gh.min()), float(gs.min())


# 5 ── Shunryu Suzuki: few, then many ───────────────────────────────────────
def bell():
    """Leak: Harmonicity and Inharmonicity. A bell's partials are not a tidy ladder; every one of them is a possibility."""
    f0 = 196.0; ratios = [0.5, 1.0, 1.183, 1.506, 2.0, 2.514, 2.662, 3.011, 4.166, 5.433, 6.796]; amps = [0.5, 1, 0.8, 0.6, 0.7, 0.4, 0.35, 0.3, 0.25, 0.18, 0.12]
    def strike(idx, dur):
        t = np.arange(int(dur * SR)) / SR; y = np.zeros(len(t))
        for k in idx: y += amps[k] * np.sin(2 * np.pi * f0 * ratios[k] * t + k) * np.exp(-t * (0.35 + 0.22 * ratios[k]))
        return y * np.minimum(1, t / 0.003)
    expert = strike([1], 7.0); beginner = strike(range(len(ratios)), 13.0); n = int(22 * SR); buf = np.zeros(n)
    add(buf, expert / np.abs(expert).max(), 0.3, 0.5); add(buf, beginner / np.abs(beginner).max(), 8.3, 0.9); buf = buf + 0.15 * reverb(buf, 3.0)
    save("Shunryu Suzuki — few, then many.wav", buf)
    x0, x1 = 110, 880; X = lambda s: x0 + s / 22 * (x1 - x0); Y = lambda r: 304 - math.log2(r / 0.5) * 44
    out = [head("FEW, THEN MANY"), axis(x0, x1, 322, 22, 4)]
    def bar(at, k, col):
        life = 4.6 / (0.35 + 0.22 * ratios[k]); return f'<line x1="{X(at):.1f}" y1="{Y(ratios[k]):.1f}" x2="{X(min(22, at + life)):.1f}" y2="{Y(ratios[k]):.1f}" stroke="{col}" stroke-width="{1 + 4*amps[k]:.1f}" stroke-linecap="round" stroke-opacity="0.85"/>'
    out.append(bar(0.3, 1, INK)); out += [bar(8.3, k, RED) for k in range(len(ratios))]
    out += [text(X(3.5), 84, "THE EXPERT'S MIND", 12, INK, "middle", 700, 'letter-spacing="2"'), text(X(3.5), 100, "one partial: the note, and nothing else", 10, INK3, "middle"),
            text(X(14.5), 84, "THE BEGINNER'S MIND", 12, RED, "middle", 700, 'letter-spacing="2"'), text(X(14.5), 100, "the same strike, with all eleven left in", 10, INK3, "middle"),
            text(x0 - 10, Y(1.0) + 4, "the note", 10, INK3, "end"),
            feet(364, "One bell, struck twice. Each line is one partial and how long it rings; the higher ones die first. Nothing was added the second time.", "The first strike is what was left after someone decided which partial was the note. The partial ratios are a typical bell's, not a measured one.")[0]]
    write("Shunryu Suzuki — few, then many — picture.svg", "".join(out), 400)


# 6 ── Audition Gate: both pass the spec ────────────────────────────────────
def audition():
    """Leak: Generative Audio Devices, whose word for the first sound is 'structurally correct and audibly inert'."""
    dur, f = 5.0, 110.0; n = int(dur * SR); t = np.arange(n) / SR
    saw = sum(np.sin(2 * np.pi * f * h * t) / h for h in range(1, 60)); dead = filt(saw, "low", 1600)
    vib = f * (1 + 0.004 * np.sin(2 * np.pi * 4.6 * t) * np.minimum(1, t / 1.2)); ph = 2 * np.pi * np.cumsum(vib) / SR
    raw = sum(np.sin(ph * h) / h for h in range(1, 60)); cut = 500 + 2400 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.31 * t - 1.2)) ** 1.5
    alive = np.zeros(n); lo = bd = 0.0
    for i in range(n):
        fc = 2 * math.sin(math.pi * cut[i] / SR); lo += fc * bd; bd += fc * (raw[i] - lo - 0.5 * bd); alive[i] = lo
    alive *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.5 * t)
    for s in (dead, alive):
        e = int(0.03 * SR); s[:e] *= np.linspace(0, 1, e); s[-e:] *= np.linspace(1, 0, e)
    rms = lambda s: math.sqrt(float((s ** 2).mean())); alive *= rms(dead) / rms(alive); pk = max(np.abs(dead).max(), np.abs(alive).max()); dead /= pk; alive /= pk
    def pitch(s):
        S = np.abs(np.fft.rfft(s * np.hanning(len(s)))); fr = np.fft.rfftfreq(len(s), 1 / SR); band = (fr > 80) & (fr < 140); return float(fr[band][np.argmax(S[band])])
    m = {k: (pitch(s), 20 * math.log10(rms(s)), len(s) / SR) for k, s in (("dead", dead), ("alive", alive))}
    save("Audition Gate — both pass the spec.wav", np.concatenate([dead, np.zeros(int(0.8 * SR)), alive]) * 0.86)
    out = [head("BOTH PASS THE SPEC")]; x0, x1 = 330, 880
    for i, (k, s, col) in enumerate((("dead", dead, INK), ("alive", alive, RED))):
        yc = 150 + i * 150; p, l, d = m[k]
        out += [text(40, yc - 34, "FIRST" if i == 0 else "SECOND", 12, col, weight=700, extra='letter-spacing="2"'),
                text(40, yc - 12, f"pitch   {p:6.1f} Hz   ✓", 11, INK2), text(40, yc + 6, f"level   {l:6.1f} dB   ✓", 11, INK2), text(40, yc + 24, f"length  {d:6.1f} s    ✓", 11, INK2),
                f'<line x1="{x0}" y1="{yc}" x2="{x1}" y2="{yc}" stroke="{RULE}" stroke-width="0.5"/>', envpath(env(s, 0.02), x0, x1, yc, 52, dur, col, step=0.02)]
    out += [feet(372, "Two notes with the same measured pitch, level and length. The numbers on the left were read off the audio, and they agree.", "One of them is a patch nobody touched. Which one is not in the numbers.")[0]]
    write("Audition Gate — both pass the spec — picture.svg", "".join(out), 408)
    return m


ALL = [lissajous, listening, drift, knee, bell, audition]
if __name__ == "__main__":
    want = sys.argv[1:]
    for f in ALL:
        if not want or f.__name__ in want: print("→", f.__name__, f())
