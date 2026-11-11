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
rng = np.random.default_rng(1988)                       # the year of the cistern (the bell still draws from this one)


def own(seed):
    """A generator of the piece's own, and the shared helpers' generator reseeded with it, so a piece rebuilds the same alone or in a full run."""
    s2.rng = np.random.default_rng(seed + 1); return np.random.default_rng(seed)


def measure(name):
    """Read a saved wav back: (left, right) as floats, measured after the save helper's scaling and fade."""
    import wave
    with wave.open(os.path.join(HERE, name)) as w: a = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float64) / 32767
    a = a.reshape(-1, 2); return a[:, 0], a[:, 1]


db = lambda v: 20 * math.log10(max(float(v), 1e-9))
rms = lambda x: math.sqrt(float(np.mean(np.asarray(x, dtype=np.float64) ** 2)))


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
            + text(cx - r * 1.42 - 20, cy + 4, "left ear: 220 Hz", 12, INK2, "end") + text(cx - r * 1.42 - 20, cy + 22, "moves it side to side", 11, INK3, "end")
            + text(cx + r * 1.42 + 20, cy + 4, "right ear: 330 Hz", 12, INK2) + text(cx + r * 1.42 + 20, cy + 22, "moves it up and down", 11, INK3)
            + feet(492, "Three loops one way and two the other: the shape is the interval. The right ear is a sixteenth of a hertz sharp, so the figure turns. It passes through the same shape every eight seconds; a whole turn takes sixteen.",
                   "A flat two-tone cousin of the channel's mark, not the mark itself: the mark runs three frequencies, 3:4:6, in three dimensions. The sound and the picture are the same two numbers.")[0])
    write("Loudon Live — the trace, heard — picture.svg", body, 545)
    # measured on the saved file: each ear's frequency by a fit of phase against time, and the frames' return
    L, R = measure("Loudon Live — the trace, heard.wav"); out = {"seconds": len(L) / SR}
    for nm, x, f0 in (("left_hz", L, 220.0), ("right_hz", R, 330.0)):
        seg = x[SR:15 * SR]; tt = np.arange(len(seg)) / SR; ph = np.unwrap(np.angle(np.cumsum((seg * np.exp(-2j * np.pi * f0 * tt)).reshape(-1, SR // 10), axis=1)[:, -1]))
        out[nm] = round(f0 + float(np.polyfit(np.arange(len(ph)) * 0.1, ph, 1)[0]) / (2 * np.pi), 4)
    out["rms_db"] = (round(db(rms(L)), 1), round(db(rms(R)), 1)); pts = lambda k: sorted(frames[k][1:].split(" L")[:-1])     # the closing point repeats the first; the shape is the set of points, whatever order it is drawn in
    out["frame1_same_shape_as_frame13"] = pts(1) == pts(13); out["frame1_same_shape_as_frame7"] = pts(1) == pts(7)   # 8 s apart: the same; 4 s apart: its mirror image
    return out


# 2 ── Pauline Oliveros: one point, then the whole sphere ───────────────────
def listening():
    """Leak: John Cage, whom her page's links say she contradicts: one of the sounds in the room is a prepared string like the one in the sound on his page."""
    rng = own(1932)                                             # her own generator: the year she was born
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
            feet(340, "The same room both times. First attention closes on the drip and everything else falls away; then it opens and nothing is left out.", "A synthesized room, not a recording. In the first half the other sounds are turned down fifty times, which is the maker's stand-in for not attending. The second half also has a little reverb the first lacks.")[0]]
    write("Pauline Oliveros — one point, then the whole sphere — picture.svg", "".join(out), 376)
    # measured on the saved file: how far the hum drops in the first half, the level of each half, and the drips counted in each
    Lm, Rm = measure("Pauline Oliveros — one point, then the whole sphere.wav"); m = Lm + Rm; a, b = slice(int(1 * SR), int(11 * SR)), slice(int(14 * SR), int(24 * SR))
    humband = filt(m, "band", (50, 70)); dripband = np.abs(filt(m, "band", (1200, 2200), 4)); e = np.convolve(dripband, np.ones(441) / 441, mode="same")
    hop = int(0.05 * SR); e50 = e[:len(e) // hop * hop].reshape(-1, hop).max(axis=1); thr = 0.35 * e50.max()       # 50 ms peaks; a drip is a rise through 35 percent of the loudest
    def drips(lo, hi):
        on = e50[int(lo / 0.05):int(hi / 0.05)] > thr; return [round(lo + 0.05 * (i + 1), 2) for i in np.flatnonzero(on[1:] & ~on[:-1])] + ([lo] if on[0] else [])
    return {"seconds": len(m) / SR, "hum_first_vs_second_db": round(db(rms(humband[a])) - db(rms(humband[b])), 1), "first_half_rms_db": round(db(rms(m[a] / 2)), 1), "second_half_rms_db": round(db(rms(m[b] / 2)), 1),
            "drips_first_half": len(drips(0, 11.5)), "drips_second_half": len(drips(13.0, 26.0)), "drips_between": len(drips(11.5, 13.0))}


# 3 ── The Drift: placed, then let go ───────────────────────────────────────
def drift():
    """Leak: Granular Synthesis and Particle Synthesis, the page's own two examples, and Whitehead's grain from the first batch."""
    rng = own(369)                                              # its own generator, so the count of loose grains is the same alone or in a full run
    total = 24.0; n = int(total * SR); L = np.zeros(n); R = np.zeros(n); placed, loose = [], []
    def grain(f, d=0.07):
        m = int(d * SR); tt = np.arange(m) / SR; return np.hanning(m) * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt))
    scale = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33]; pat = [0, 2, 4, 7, 4, 2, 5, 3]
    for i in range(72):                                         # the fortress: every grain a decision, on a grid, in a pattern
        at = 0.4 + i * 0.125; f = scale[pat[i % 8]] * (2 if (i // 16) % 2 else 1); g = grain(f); pan = 0.3 + 0.4 * ((i % 8) / 7)
        add(L, g, at, 0.5 * (1 - pan)); add(R, g, at, 0.5 * pan); placed.append((at, f))
    PL, PR = L, R; L = np.zeros(n); R = np.zeros(n)             # the placed half is kept apart so the two halves can be levelled against each other
    # the Drift: forty particles dropped in a box with gravity; a grain sounds only when one strikes the floor or a wall
    P = 40; x = rng.uniform(0.05, 0.95, P); y = rng.uniform(0.5, 1.0, P); vx = rng.normal(0, 0.25, P); vy = np.zeros(P); dt = 0.004; t0 = 10.3
    for step in range(int(11.5 / dt)):
        vy -= 2.2 * dt; x += vx * dt; y += vy * dt; now = t0 + step * dt
        for k in np.where(y < 0)[0]:
            sp = abs(vy[k]); y[k] = 0; vy[k] = -vy[k] * 0.78
            if sp > 0.06:
                f = 220 * 2 ** (x[k] * 1.5); g = grain(f, 0.05 + 0.04 * rng.random()); a = min(1, sp / 1.6) * 0.6
                add(L, g, now, a * (1 - x[k])); add(R, g, now, a * x[k]); loose.append((now, f, a))
        for k in np.where((x < 0) | (x > 1))[0]: x[k] = np.clip(x[k], 0, 1); vx[k] = -vx[k] * 0.9
    total = round(loose[-1][0] + 0.9, 1); n = int(total * SR)   # end soon after the last grain: no long silent tail
    kp = 0.8 / max(np.abs(PL).max(), np.abs(PR).max()); kl = 1.0 / max(np.abs(L).max(), np.abs(R).max())   # the placed half peaks at 0.8 of the loose half's peak
    save("The Drift — placed, then let go.wav", np.stack([PL * kp + L * kl, PR * kp + R * kl], axis=1)[:n])
    x0, x1 = 60, 880; X = lambda s: x0 + s / total * (x1 - x0); Y = lambda f: 300 - math.log2(f / 220) * 68
    out = [head("PLACED, THEN LET GO"), axis(x0, x1, 312, total, 4)]
    out += [f'<circle cx="{X(a):.1f}" cy="{Y(f):.1f}" r="2.8" fill="{INK}"/>' for a, f in placed]
    out += [f'<circle cx="{X(a):.1f}" cy="{Y(f):.1f}" r="{1.5 + 3*v:.1f}" fill="{RED}" fill-opacity="0.55"/>' for a, f, v in loose]
    mid = (t0 + 0.7 + total) / 2
    out += [text(X(4.9), 84, "THE FORTRESS", 12, INK, "middle", 700, 'letter-spacing="2"'), text(X(4.9), 101, f"{len(placed)} grains, every one decided", 11.5, INK3, "middle"),
            text(X(mid), 84, "THE DRIFT", 12, RED, "middle", 700, 'letter-spacing="2"'), text(X(mid), 101, f"forty particles dropped; {len(loose)} grains nobody placed", 11.5, INK3, "middle"),
            feet(356, "Left, a pattern laid on a grid. Right, a box, some gravity, and a grain each time something lands on the floor: the rules were chosen, the notes were not.",
                 "The grains crowd together and fade as the particles come to rest. Height is pitch; a red dot's size is how hard it landed. A landing slower than a set speed makes no grain, and that cut-off sets the count.")[0]]
    write("The Drift — placed, then let go — picture.svg", "".join(out), 392)
    # measured on the saved file, and counted from the run
    Lm, Rm = measure("The Drift — placed, then let go.wav"); m = (Lm + Rm) / 2; cutp = int(10.0 * SR); a, b = m[:cutp], m[int(t0 * SR):]
    ons = np.flatnonzero(np.abs(a) > 0.02); pk = []; e = np.abs(a)
    for i in range(len(placed)): s0 = int((placed[i][0]) * SR); pk.append(s0 + int(np.argmax(e[s0:s0 + int(0.07 * SR)])))
    per_s = [sum(1 for t_, _, _ in loose if s_ <= t_ < s_ + 1) for s_ in range(10, int(total) + 1)]; half = len(loose) // 2
    return {"seconds": round(len(m) / SR, 2), "placed": len(placed), "placed_peaks_found": int(sum(e[p] > 0.05 for p in pk)), "placed_step_s": round(float(np.median(np.diff(pk))) / SR, 4), "loose": len(loose),
            "loose_first": round(loose[0][0], 2), "loose_last": round(loose[-1][0], 2), "loose_per_second_from_10s": per_s,
            "mean_loudness_first_half_of_grains": round(float(np.mean([v for _, _, v in loose[:half]])), 3), "mean_loudness_second_half": round(float(np.mean([v for _, _, v in loose[half:]])), 3),
            "placed_peak_db": round(db(max(np.abs(Lm[:cutp]).max(), np.abs(Rm[:cutp]).max())), 1), "loose_peak_db": round(db(max(np.abs(Lm[int(t0 * SR):]).max(), np.abs(Rm[int(t0 * SR):]).max())), 1),
            "placed_rms_db": round(db(rms(a)), 1), "loose_rms_db": round(db(rms(b)), 1), "silent_tail_s": round((len(m) - np.flatnonzero(np.abs(m) > 0.001)[-1]) / SR, 2)}


# 4 ── Trickster: the corner that disappears ────────────────────────────────
def knee():
    """Leak: Compressor Design, where the palace's soft knee lives. The page calls it 'trickster mathematics'."""
    # Remade after challenge F. The drums sat almost wholly above the knee, so the two takes never differed by 1 dB. Now one tone swells
    # steadily from -48 dB to full level, 8 dB a second, so it spends three seconds crossing the knee's whole width. No randomness in this piece.
    own(1956); rise, hold = 6.0, 0.6; n = int((rise + hold) * SR); t = np.arange(n) / SR
    car = sum(a * np.sin(2 * np.pi * 110.0 * h * t) for h, a in ((1, 1.0), (2, 0.5), (3, 0.33), (4, 0.25))); car /= np.abs(car).max()
    lvl = np.minimum(0.0, -48.0 + 48.0 * t / rise); x = car * 10 ** (lvl / 20); x[-int(0.15 * SR):] *= np.linspace(1, 0, int(0.15 * SR)); T, ratio = -24.0, 8.0
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
    lead = np.zeros(int(0.05 * SR))                             # 50 ms of silence first, so the save helper's 20 ms fade-in touches neither take
    save("Trickster — the corner that disappears.wav", np.concatenate([lead, hard / pk, gap, lead, soft / pk]))
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
    # measured on the saved file: each take's level in 100 ms steps, how fast it is rising either side of the threshold, and where the two takes part
    Lm, _ = measure("Trickster — the corner that disappears.wav"); h0 = len(lead); s0 = h0 + n + len(gap) + len(lead); w = int(0.1 * SR); k = n // w
    lv = lambda st: np.array([db(rms(Lm[st + i * w: st + (i + 1) * w])) for i in range(k)]); H, Sf = lv(h0), lv(s0); tc = (np.arange(k) + 0.5) * 0.1; d = Sf - H
    slope = lambda y, a, b: round(float(np.polyfit(tc[(tc > a) & (tc < b)], y[(tc > a) & (tc < b)], 1)[0]), 2)
    return {"seconds": round(len(Lm) / SR, 2), "take_s": round(n / SR, 2), "threshold_crossed_at_s": rise * (T + 48) / 48,
            "hard_rise_db_per_s": {"1.0-2.9s": slope(H, 1.0, 2.9), "3.1-5.9s": slope(H, 3.1, 5.9)}, "soft_rise_db_per_s": {"0.2-1.4s": slope(Sf, 0.2, 1.4), "1.6-2.9s": slope(Sf, 1.6, 2.9), "3.1-4.4s": slope(Sf, 3.1, 4.4), "4.7-5.9s": slope(Sf, 4.7, 5.9)},
            "largest_gap_soft_minus_hard_db": round(float(d.min()), 2), "at_s": round(float(tc[np.argmin(d)]), 2), "gap_before_1.4s_db": round(float(np.abs(d[tc < 1.4]).max()), 2), "gap_after_4.7s_db": round(float(np.abs(d[tc > 4.7]).max()), 2),
            "seconds_more_than_1db_apart": round(0.1 * int((d < -1).sum()), 1), "first_100ms_db": (round(float(H[0]), 1), round(float(Sf[0]), 1)), "end_level_db": (round(float(H[int(6.2 / 0.1)]), 1), round(float(Sf[int(6.2 / 0.1)]), 1)),
            "deepest_gain_reduction_db": (round(float(gh.min()), 1), round(float(gs.min()), 1))}


# 5 ── Shunryu Suzuki: few, then many ───────────────────────────────────────
def bell():
    """Leak: Harmonicity and Inharmonicity. A bell's partials are not a tidy ladder; every one of them is a possibility."""
    # Kept piece, sound unchanged. One line added in the remake pass: the shared generator is put back to the state it had when this bell was
    # first built in a full run (after the Oliveros and Trickster pieces had drawn from it), so the reverb is the same alone or in any run.
    s2.rng = np.random.default_rng(1973); [s2.pluck(185.0, 3.0, 0.6, 0.994) for _ in range(2)]; s2.reverb(np.zeros(int(26 * SR)), 2.4); [s2.kick() for _ in range(8)]; [s2.snare() for _ in range(4)]; [s2.hat() for _ in range(16)]
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
    gapn = int(0.8 * SR); save("Audition Gate — both pass the spec.wav", np.concatenate([dead, np.zeros(gapn), alive]) * 0.86)
    # Remade after challenge F: the three numbers are now read off the saved file, after the save helper's scaling and fade, not off the arrays before it.
    Lm, _ = measure("Audition Gate — both pass the spec.wav"); seg = {"dead": Lm[:n], "alive": Lm[n + gapn: 2 * n + gapn]}
    def sounding(s): on = np.flatnonzero(np.abs(s) > 10 ** (-60 / 20)); return (on[-1] - on[0] + 1) / SR
    m = {k: (pitch(s), 20 * math.log10(rms(s)), sounding(s)) for k, s in seg.items()}
    out = [head("BOTH PASS THE SPEC")]; x0, x1 = 330, 880
    for i, (k, s, col) in enumerate((("dead", dead, INK), ("alive", alive, RED))):
        yc = 150 + i * 150; p, l, d = m[k]
        out += [text(40, yc - 34, "FIRST" if i == 0 else "SECOND", 12, col, weight=700, extra='letter-spacing="2"'),
                text(40, yc - 12, f"pitch   {p:6.1f} Hz   ✓", 11, INK2), text(40, yc + 6, f"level   {l:6.1f} dB   ✓", 11, INK2), text(40, yc + 24, f"length  {d:6.1f} s    ✓", 11, INK2),
                f'<line x1="{x0}" y1="{yc}" x2="{x1}" y2="{yc}" stroke="{RULE}" stroke-width="0.5"/>', envpath(env(s, 0.02), x0, x1, yc, 52, dur, col, step=0.02)]
    out += [feet(372, "Two notes with the same measured pitch, level and length. The numbers on the left were read off the saved sound file, and they agree.", "One of them is a patch nobody touched. Which one is not in these three numbers. The traces on the right are each note's loudness over time, and they do show it.")[0]]
    write("Audition Gate — both pass the spec — picture.svg", "".join(out), 408)
    # what the three numbers hide, measured on the saved file in quarter-second windows
    def hidden(s):
        q = int(0.25 * SR); wins = [s[i:i + q] for i in range(q, len(s) - 2 * q + 1, q)]; lev = [20 * math.log10(rms(w_)) for w_ in wins]; cen = []
        for w_ in wins: S_ = np.abs(np.fft.rfft(w_ * np.hanning(len(w_)))); fr = np.fft.rfftfreq(len(w_), 1 / SR); cen.append(float((S_ * fr).sum() / S_.sum()))
        return {"level_swing_db": round(max(lev) - min(lev), 1), "brightness_hz": (round(min(cen)), round(max(cen)))}
    return {k: {"pitch_hz": round(v[0], 2), "level_db": round(v[1], 2), "sounding_s": round(v[2], 3), **hidden(seg[k])} for k, v in m.items()}


ALL = [lissajous, listening, drift, knee, bell, audition]
if __name__ == "__main__":
    want = sys.argv[1:]
    for f in ALL:
        if not want or f.__name__ in want: print("→", f.__name__, f())
