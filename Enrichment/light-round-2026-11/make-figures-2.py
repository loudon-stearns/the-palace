#!/usr/bin/env python3
"""Light round 2026-11, second batch — eleven diagrams, loops and charts.
Run from this folder: python3 make-figures-2.py [name ...]   (voice needs count-voice-history.py run first)
Where a neighbouring page leaks into a figure, its avatar is drawn in and the function says why."""
import base64, collections, io, json, math, os, re, sys
import numpy as np
from PIL import Image
from lib import *

FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace\""
W = 920


def write(name, body, h, style="", w=W, vb=None):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="{vb or f"0 0 {w} {h}"}" width="{w}" height="{h}" {FONT}>'
           f'<style>{style}</style><rect x="-5000" y="-5000" width="20000" height="20000" fill="{PAPER}"/>{body}</svg>')
    open(os.path.join(HERE, name), "w").write(svg); print(name, f"{len(svg)/1024:.0f} KB")


def text(x, y, s, size=12, fill=INK2, anchor="start", weight=400, extra=""):
    s = s.replace("&", "&amp;")
    return f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" {extra}>{s}</text>'


def head(s, sub=None):
    return text(40, 40, s, 14, INK, weight=700, extra='letter-spacing="3"') + (text(40, 60, sub, 12, INK3) if sub else "")


def embed(im, x, y, w, h=None, fmt="PNG", extra=""):
    b = io.BytesIO(); im.save(b, fmt, **({"quality": 82} if fmt == "JPEG" else {}))
    return f'<image x="{x:.1f}" y="{y:.1f}" width="{w}" height="{h or w}" href="data:image/{fmt.lower()};base64,{base64.b64encode(b.getvalue()).decode()}" {extra}/>'


def av(title, x, y, size, frame=INK):
    return embed(icon(title, size * 2), x, y, size) + f'<rect x="{x}" y="{y}" width="{size}" height="{size}" fill="none" stroke="{frame}" stroke-width="1.2"/>'


def box(x, y, w, h, label, sub=None, stroke=INK, fill=PAPER, bold=True):
    g = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="1.4"/>' + text(x + w / 2, y + h / 2 + (0 if sub else 4), label, 11, stroke if stroke != RULE else INK2, "middle", 700 if bold else 400)
    return g + (text(x + w / 2, y + h / 2 + 16, sub, 9, INK3, "middle") if sub else "")


def arrow(x1, y1, x2, y2, color=INK, w=1.4, dash=""):
    a = math.atan2(y2 - y1, x2 - x1); hx, hy = x2 - 9 * math.cos(a), y2 - 9 * math.sin(a)
    p = f"{x2:.1f},{y2:.1f} {hx - 4*math.sin(a):.1f},{hy + 4*math.cos(a):.1f} {hx + 4*math.sin(a):.1f},{hy - 4*math.cos(a):.1f}"
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{hx:.1f}" y2="{hy:.1f}" stroke="{color}" stroke-width="{w}" {f"stroke-dasharray={chr(34)}{dash}{chr(34)}" if dash else ""}/><polygon points="{p}" fill="{color}"/>'


# 1 ── Simondon: a bag of parts, or one part doing several jobs ─────────────
def simondon():
    """Leak: Haptic Handwheel, the crossing Palace Philosophies tells: 'one part to move, one to read', until the motor does both."""
    out = [head("A BAG OF PARTS, OR ONE PART DOING SEVERAL JOBS")]
    out += [text(40, 100, "ABSTRACT", 12, INK, weight=700, extra='letter-spacing="2"'), text(40, 118, "each part does one job, and they are bolted together", 11, INK3)]
    parts = [("a knob", "to turn"), ("a sensor", "to read it"), ("a light", "to show it"), ("a buzzer", "to push back")]
    for i, (a, b) in enumerate(parts):
        x = 40 + i * 104; out.append(box(x, 150, 92, 70, a, b))
        if i: out.append(f'<line x1="{x-12}" y1="185" x2="{x}" y2="185" stroke="{INK3}" stroke-width="3" stroke-dasharray="2 2"/>')
    out.append(text(40, 256, "four parts · four jobs · three joints to fail", 11, INK3))
    out += [text(500, 100, "CONCRETE", 12, RED, weight=700, extra='letter-spacing="2"'), text(500, 118, "one part serves several functions at once", 11, INK3)]
    cx, cy = 680, 215; out.append(av("Haptic Handwheel", cx - 55, cy - 55, 110, RED))
    for k, (lab, ang) in enumerate((("turns", 215), ("reads the turn", 325), ("shows the state", 35), ("pushes back", 145))):
        a = math.radians(ang); x, y = cx + 112 * math.cos(a), cy - 96 * math.sin(a)
        out.append(arrow(x, y, cx + 64 * math.cos(a), cy - 62 * math.sin(a), RED)); out.append(text(x + (12 if math.cos(a) > 0 else -12), y + 4, lab, 11, INK2, "start" if math.cos(a) > 0 else "end"))
    out.append(text(500, 340, "one motor · four jobs · the hand never leaves it", 11, INK3))
    out.append(f'<line x1="470" y1="84" x2="470" y2="350" stroke="{RULE}"/>')
    out.append(text(40, 386, "The right-hand part wears the Haptic Handwheel's own avatar: the palace's worked case of Simondon's idea.", 11, INK3))
    write("Simondon — a bag of parts, or one part doing several jobs.svg", "".join(out), 404)


# 2 ── How the Palace Commits: one door in, one gate out ────────────────────
def road():
    """Leak: the Sentry stands at the gate (its avatar), and Worktree Practice supplies the many branches."""
    out = [head("ONE DOOR IN, ONE GATE OUT")]
    for i, lab in enumerate(("a session's branch", "another session's branch", "a steward's branch", "a cloud session's branch")):
        y = 96 + i * 46; out += [box(40, y, 190, 32, lab, stroke=INK3, bold=False), f'<path d="M230,{y+16} C285,{y+16} 285,181 330,181" fill="none" stroke="{INK3}" stroke-width="1.3"/>']
    out += [text(135, 290, "many hands, each on its own branch", 10, INK3, "middle")]
    out += [f'<rect x="330" y="120" width="74" height="122" fill="{PAPER}" stroke="{INK}" stroke-width="2.2"/><circle cx="392" cy="182" r="3" fill="{INK}"/>',
            text(367, 110, "THE DOOR", 11, INK, "middle", 700), text(367, 262, "one lock,", 10, INK3, "middle"), text(367, 276, "one writer at a time", 10, INK3, "middle")]
    out += [arrow(404, 181, 470, 181, INK, 2), f'<line x1="470" y1="181" x2="668" y2="181" stroke="{INK}" stroke-width="7"/>',
            text(569, 166, "MAIN", 11, INK, "middle", 700), text(569, 204, "one honest history", 10, INK3, "middle")]
    for k in range(7): out.append(f'<circle cx="{486 + k*28}" cy="181" r="5.5" fill="{PAPER}" stroke="{INK}" stroke-width="1.6"/>')
    out += [f'<line x1="690" y1="118" x2="690" y2="244" stroke="{RED}" stroke-width="5"/>', av("Sentry", 668, 196 - 14, 44, RED),
            text(690, 108, "THE GATE", 11, RED, "middle", 700), text(690, 262, "the Sentry checks;", 10, INK3, "middle"), text(690, 276, "only Loudon's word opens it", 10, RED, "middle")]
    out += [arrow(716, 150, 800, 150, RED, 2, "5 4"), box(804, 128, 84, 44, "GitHub", "the world", stroke=INK3)]
    out.append(text(40, 326, "Everything left of the gate stays on this Mac. Nothing crosses it but one commit he was shown, sent on his say.", 11, INK3))
    write("How the Palace Commits — one door in, one gate out.svg", "".join(out), 344)


# 3 ── The Reader's Context Window: where the eye has to go ─────────────────
def eye():
    out = [head("WHERE THE EYE HAS TO GO")]
    def panel(x0, order, title, color):
        g = [text(x0, 96, title, 12, color, weight=700, extra='letter-spacing="2"')]; y = 116; pos = {}
        for kind in order:
            h = {"q": 44, "c": 150, "a": 66}[kind]; lab = {"q": "the question", "c": "context", "a": "the answers"}[kind]
            g.append(f'<rect x="{x0}" y="{y}" width="330" height="{h}" fill="{FILL if kind == "c" else PAPER}" stroke="{INK}" stroke-width="{1.8 if kind != "c" else 1}"/>')
            for k in range(int((h - 26) / 12)): g.append(f'<line x1="{x0+14}" y1="{y+28+k*12}" x2="{x0+250 - (k%3)*30}" y2="{y+28+k*12}" stroke="{RULE}" stroke-width="2"/>')
            g.append(text(x0 + 14, y + 18, lab, 11, INK, weight=700)); pos[kind] = y + h / 2; y += h + 10
        return g, pos
    g, p = panel(60, "qca", "CONTEXT WEDGED IN", RED); out += g; x = 420
    out += [f'<path d="M{x},{p["q"]} C{x+50},{p["q"]} {x+50},{p["c"]} {x},{p["c"]} C{x+70},{p["c"]} {x+70},{p["a"]} {x},{p["a"]} C{x+96},{p["a"]} {x+96},{p["q"]} {x+6},{p["q"]+8} C{x+60},{p["q"]+30} {x+60},{p["a"]-20} {x+6},{p["a"]-8}" fill="none" stroke="{RED}" stroke-width="1.8"/>',
            text(60, 420, "ask · wade through · answers · back up for the ask · down again", 10, INK3)]
    g, p = panel(520, "cqa", "CONTEXT ABOVE", INK); out += g; x = 870
    out += [arrow(x, p["c"] - 40, x, p["a"] + 20, INK, 1.8), text(520, 420, "read down once", 10, INK3)]
    out.append(f'<line x1="490" y1="84" x2="490" y2="424" stroke="{RULE}"/>')
    out.append(text(40, 452, "The same three blocks. The page's rule: context above the question, never between the question and its answers.", 11, INK3))
    write("The Reader's Context Window — where the eye has to go.svg", "".join(out), 470)


# 4 ── James Turrell: it is moving ──────────────────────────────────────────
def turrell():
    """Leak: Seneca, whom the map says he contradicts, and whose avatar is an hourglass: the only clock in the picture."""
    c0, c1 = "#f2b28a", "#3b4f8c"
    style = (f"@keyframes sky{{0%{{fill:{c0}}}100%{{fill:{c1}}}}}.sky{{animation:sky 90s linear infinite alternate}}"
             "@keyframes bar{0%{width:0}100%{width:520px}}.bar{animation:bar 90s linear infinite alternate}")
    out = [head("IT IS MOVING"), f'<rect class="sky" x="200" y="90" width="520" height="330" fill="{c0}"/>',
           f'<rect x="200" y="90" width="520" height="330" fill="none" stroke="{INK}" stroke-width="1.5"/>',
           f'<rect x="200" y="436" width="520" height="3" fill="{RULE}"/><rect class="bar" x="200" y="436" width="0" height="3" fill="{RED}"/>',
           f'<rect x="60" y="90" width="90" height="150" fill="{c0}" stroke="{INK}"/>', text(105, 258, "where it began", 10, INK3, "middle"),
           f'<rect x="770" y="90" width="90" height="150" fill="{c1}" stroke="{INK}"/>', text(815, 258, "where it is going", 10, INK3, "middle"),
           av("Seneca", 793, 330, 44, INK3), text(815, 392, "ninety seconds", 10, INK3, "middle"), text(815, 406, "each way", 10, INK3, "middle"),
           text(40, 474, "Watch the window and nothing happens. Look away, look back, and it has changed. The two swatches never move.", 11, INK3)]
    write("James Turrell — it is moving.svg", "".join(out), 492, style)


# 5 ── The View From Above: the concern, now a speck ────────────────────────
def above():
    """Leak: Palace Map. Palace Philosophies says 'the view from above is the Palace Map', so the zoom ends on the whole palace."""
    titles = sorted(NODES, key=lambda t: t.lower()); cols = 23; T = 64; rows = math.ceil(len(titles) / cols)
    sheet = Image.new("RGB", (cols * T, rows * T), rgb(PAPER))
    for i, t in enumerate(titles): sheet.paste(icon(t, T - 6), ((i % cols) * T + 3, (i // cols) * T + 3))
    k = titles.index("The Dichotomy of Control") if False else titles.index("Stoicism"); cx, cy = (k % cols) * T, (k // cols) * T
    Wd, Hd = cols * T, rows * T; pad = 30; full = f"{-pad} {-pad - 60} {Wd + 2*pad} {Hd + 2*pad + 130}"
    r = (Hd + 2 * pad + 130) / (Wd + 2 * pad); zw = T * 1.5; near = f"{cx + T/2 - zw/2:.1f} {cy + T/2 - zw*r/2:.1f} {zw:.1f} {zw*r:.1f}"
    mid = f"{cx + T/2 - 220:.1f} {cy + T/2 - 220*r:.1f} 440 {440*r:.1f}"
    anim = (f'<animate attributeName="viewBox" dur="18s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.14;0.42;0.7;0.94;1" '
            f'keySplines="0 0 1 1;0.4 0 0.6 1;0.4 0 0.6 1;0 0 1 1;0.4 0 0.2 1" values="{near};{near};{mid};{full};{full};{near}"/>')
    body = (anim + embed(sheet, 0, 0, Wd, Hd, "JPEG") + f'<rect x="{cx+1}" y="{cy+1}" width="{T-2}" height="{T-2}" fill="none" stroke="{RED}" stroke-width="3"/>'
            + f'<text x="0" y="-34" font-size="30" font-weight="700" letter-spacing="6" fill="{INK}">THE CONCERN, NOW A SPECK</text>'
            + f'<text x="0" y="{Hd + 40}" font-size="21" fill="{INK3}">One page fills the frame, the way a worry does. Then the room, then the whole palace: {len(titles)} pages.</text>'
            + f'<text x="0" y="{Hd + 68}" font-size="21" fill="{INK3}">The red square has not moved. It is Stoicism, where this move comes from.</text>'
            + f'<text x="0" y="{Hd + 96}" font-size="21" fill="{INK3}">Avatars in alphabetical order, map build of {MAPDATE}.</text>')
    write("The View From Above — the concern, now a speck.svg", body, round(W * r), vb=near)


# 6 ── Donella Meadows: the bathtub ─────────────────────────────────────────
def bathtub():
    """A real little simulation: a tub you fill toward a line, where the tap answers your hand a few seconds late."""
    def run(gain, delay=4.0, T=60, dt=0.05):
        n = int(T / dt); k = int(delay / dt); level = np.zeros(n); want = 0.7
        for i in range(1, n):
            seen = level[i - 1 - k] if i - 1 - k >= 0 else 0.0                 # what your hand acted on, four seconds ago
            flow = float(np.clip(gain * (want - seen), -0.25, 0.25))            # the tap, and the drain, have a top speed
            level[i] = min(1.2, max(0.0, level[i - 1] + flow * dt))
        return level
    x0, x1, yb, yt = 120, 880, 330, 96; X = lambda t: x0 + t / 60 * (x1 - x0); Y = lambda v: yb - v / 1.1 * (yb - yt)
    out = [head("THE BATHTUB"), f'<line x1="{x0}" y1="{Y(0)}" x2="{x1}" y2="{Y(0)}" stroke="{RULE}"/>',
           f'<line x1="{x0}" y1="{Y(0.7):.1f}" x2="{x1}" y2="{Y(0.7):.1f}" stroke="{INK3}" stroke-dasharray="3 4"/>', text(x0 - 8, Y(0.7) + 4, "where you want it", 10, INK3, "end"),
           f'<line x1="{x0}" y1="{Y(1.0):.1f}" x2="{x1}" y2="{Y(1.0):.1f}" stroke="{RED}" stroke-width="1.5"/>', text(x0 - 8, Y(1.0) + 4, "the rim", 10, RED, "end"),
           text(x0 - 8, Y(0) + 4, "empty", 10, INK3, "end")]
    res = {}
    for name, gain, color, wd in (("patient", 0.08, INK, 2.2), ("yanking the taps", 0.9, RED, 2.2)):
        lv = run(gain); res[name] = float(lv.max()); t = np.arange(len(lv)) * 0.05
        out.append(f'<path d="M' + " L".join(f"{X(a):.1f},{Y(b):.1f}" for a, b in zip(t[::4], lv[::4])) + f'" fill="none" stroke="{color}" stroke-width="{wd}"/>')
    over = res["yanking the taps"] >= 1.0
    out += [text(x1, Y(0.7) + 18, "patient: small turns, then wait", 11, INK, "end"), text(x1, 78, "yanking the taps" + (": over the rim, onto the floor, and back to empty" if over else ""), 11, RED, "end")]
    for t in range(0, 61, 10): out += [f'<line x1="{X(t):.1f}" y1="{yb}" x2="{X(t):.1f}" y2="{yb+5}" stroke="{RULE}"/>', text(X(t), yb + 18, f"{t}s", 10, INK3, "middle")]
    out.append(text(40, 372, "Same tub, same tap, same four-second lag between your hand and the water. Only how hard you turn it differs.", 11, INK3))
    out.append(text(40, 390, "A small simulation written for this figure, not a measurement. You can't set the level, only the flow, and the flow answers late.", 11, INK3))
    write("Donella Meadows — the bathtub.svg", "".join(out), 408)
    return res


# 7 ── p5.js: veil, don't clear ─────────────────────────────────────────────
def veil():
    """Leak: Flocking, the page's own first job here. The same seed-7 flock, drawn two ways."""
    r = np.random.default_rng(7); n = 90; Wp, Hp = 860, 560
    pos = r.uniform(0, 1, (n, 2)) * (Wp, Hp); vel = r.normal(0, 1, (n, 2)); vel = vel / np.linalg.norm(vel, axis=1)[:, None] * 3.2
    paper = np.array(rgb(PAPER), dtype=np.float32); canv = np.tile(paper, (Hp, Wp, 1)).copy(); last = None
    def stamp(img, p, v):
        for (x, y), (vx, vy) in zip(p, v):
            hue = (math.atan2(vy, vx) + math.pi) / (2 * math.pi); col = np.array([200 - 160 * hue, 38 + 60 * hue, 26 + 150 * hue], dtype=np.float32)
            xi, yi = int(x) % Wp, int(y) % Hp; img[max(0, yi - 2):yi + 3, max(0, xi - 2):xi + 3] = col
    for f in range(260):
        d = pos[None] - pos[:, None]; d -= np.round(d / (Wp, Hp)) * (Wp, Hp); dist = np.linalg.norm(d, axis=2) + 1e-9; near = (dist < 70) & (dist > 0)
        coh = (d * near[..., None]).sum(1) / np.maximum(1, near.sum(1))[:, None]; ali = (vel[None] * near[..., None]).sum(1) / np.maximum(1, near.sum(1))[:, None]
        close = dist < 22; sep = -(d / dist[..., None] ** 2 * close[..., None]).sum(1)
        vel += 0.004 * coh + 0.05 * (ali - vel) + 1.6 * sep; vel = vel / np.linalg.norm(vel, axis=1)[:, None] * 3.2; pos = (pos + vel) % (Wp, Hp)
        canv += (paper - canv) * (14 / 255)                                   # the veil: one low-alpha wash of the ground, every frame
        stamp(canv, pos, vel)
    clear = np.tile(paper, (Hp, Wp, 1)).copy(); stamp(clear, pos, vel)         # cleared: only the last frame survives
    s = Sheet(900, "Veil, don't clear", "One flock, frame 260, drawn two ways.")
    for i, (img, lab, sub) in enumerate(((clear, "background() every frame", "where they are"), (canv, "a 14-alpha veil every frame", "where they are, and where they have been"))):
        x = 60 + i * 880; s.paste(Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)), (x, 190), frame=INK)
        s.text((x, 190 + Hp + 14), lab, 23, RED if i else INK, bold=True); s.text((x, 190 + Hp + 46), sub, 20, INK3)
    s.foot("A boids flock, seed 7, as on the Flocking page; colour is heading. Simulated here in numpy, not rendered in p5.")
    s.save("p5.js — veil, don't clear.png")


# 8 ── Tree of Thoughts: a chain cannot go back ─────────────────────────────
def tree():
    out = [head("A CHAIN CANNOT GO BACK")]
    def node(x, y, kind="o"):
        c = {"o": INK, "x": INK3, "win": RED}[kind]
        g = f'<circle cx="{x}" cy="{y}" r="9" fill="{PAPER if kind != "win" else RED}" stroke="{c}" stroke-width="1.8"/>'
        if kind == "x": g += f'<path d="M{x-4},{y-4} L{x+4},{y+4} M{x+4},{y-4} L{x-4},{y+4}" stroke="{INK3}" stroke-width="1.6"/>'
        return g
    out += [text(60, 96, "CHAIN OF THOUGHT", 12, INK, weight=700, extra='letter-spacing="2"'), text(60, 114, "one path, each step built on the last", 11, INK3)]
    xs = [90 + i * 70 for i in range(5)]
    for i in range(4): out.append(arrow(xs[i] + 10, 200, xs[i + 1] - 11, 200, INK))
    for i, x in enumerate(xs): out.append(node(x, 200, "x" if i == 4 else "o"))
    out += [text(xs[4], 232, "wrong,", 10, INK3, "middle"), text(xs[4], 246, "and no way back", 10, INK3, "middle"), text(xs[1], 176, "the slip was here", 10, RED, "middle"),
            f'<line x1="{xs[1]}" y1="181" x2="{xs[1]}" y2="189" stroke="{RED}"/>']
    ox = 490; out += [text(ox, 96, "TREE OF THOUGHTS", 12, RED, weight=700, extra='letter-spacing="2"'), text(ox, 114, "several continuations, scored, and the weak ones dropped", 11, INK3)]
    L = {0: [(ox + 20, 220)], 1: [(ox + 110, 150), (ox + 110, 220), (ox + 110, 290)], 2: [(ox + 200, 120), (ox + 200, 180), (ox + 200, 260), (ox + 200, 320)], 3: [(ox + 290, 230), (ox + 290, 290)], 4: [(ox + 380, 230)]}
    E = [((0, 0), (1, 0), 0), ((0, 0), (1, 1), 0), ((0, 0), (1, 2), 1), ((1, 0), (2, 0), 0), ((1, 0), (2, 1), 0), ((1, 2), (2, 2), 1), ((1, 2), (2, 3), 0), ((2, 2), (3, 0), 1), ((2, 2), (3, 1), 0), ((3, 0), (4, 0), 1)]
    for (a, b, win) in E:
        (x1, y1), (x2, y2) = L[a[0]][a[1]], L[b[0]][b[1]]; out.append(f'<line x1="{x1+9}" y1="{y1}" x2="{x2-9}" y2="{y2}" stroke="{RED if win else INK3}" stroke-width="{2.2 if win else 1.2}"/>')
    dead = {(2, 0), (2, 1), (1, 1), (2, 3), (3, 1)}; win = {(0, 0), (1, 2), (2, 2), (3, 0)}
    for lv, pts in L.items():
        for i, (x, y) in enumerate(pts): out.append(node(x, y, "x" if (lv, i) in dead else ("win" if (lv, i) == (4, 0) else "o")))
    out.append(f'<path d="M{ox+192},{126} C{ox+150},{138} {ox+50},{140} {ox+24},{206}" fill="none" stroke="{INK}" stroke-width="1.3" stroke-dasharray="4 4"/>')
    out += [arrow(ox + 27, 196, ox + 23, 209, INK), text(ox + 52, 150, "backtrack", 10, INK2, "middle"), text(ox + 380, 258, "found", 10, RED, "middle")]
    out.append(f'<line x1="440" y1="84" x2="440" y2="340" stroke="{RULE}"/>')
    out.append(text(40, 372, "Same problem, same first step. The chain cannot revisit its second thought; the tree can, and does.", 11, INK3))
    write("Tree of Thoughts — a chain cannot go back.svg", "".join(out), 390)


# 9 ── The Palace Voice: the dial that drifted ──────────────────────────────
def voice():
    """Leak: Drift and Consolidation. 'The bug is never drift', only drift nobody is tracking; here is the drift, and the day it got a gate."""
    d = json.load(open(os.path.join(HERE, "voice-history.json")))
    x0, x1, yb, yt = 100, 790, 330, 100; X = lambda i: x0 + i / (len(d) - 1) * (x1 - x0); Y = lambda v: yb - (v - 10) / 15 * (yb - yt)
    out = [head("THE DIAL THAT DRIFTED")]
    for v in (10, 15, 20, 25): out += [f'<line x1="{x0}" y1="{Y(v)}" x2="{x1}" y2="{Y(v)}" stroke="{RULE}" stroke-width="0.6"/>', text(x0 - 8, Y(v) + 4, str(v), 10, INK3, "end")]
    names = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()
    for i, r in enumerate(d): out.append(text(X(i), yb + 20, names[int(r["month"][5:]) - 1], 10, INK3, "middle"))
    g = [i for i, r in enumerate(d) if r["month"] == "2026-08"][0]
    out += [f'<line x1="{X(g)}" y1="{yt-10}" x2="{X(g)}" y2="{yb}" stroke="{INK}" stroke-dasharray="4 4"/>', text(X(g) + 6, yt - 2, "August: the dial is named, and given a gate", 10, INK2)]
    for key, color, lab in (("emdash_per_k", RED, "em-dashes"), ("bold_per_k", INK, "bold")):
        pts = [(X(i), Y(r[key])) for i, r in enumerate(d)]
        out.append(f'<path d="M' + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + f'" fill="none" stroke="{color}" stroke-width="2.2"/>')
        for x, y in pts: out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3.5" fill="{PAPER}" stroke="{color}" stroke-width="1.8"/>')
        out.append(text(pts[-1][0] + 8, pts[-1][1] + 4, lab, 11, color, weight=700))
    e = [r["emdash_per_k"] for r in d]; b = [r["bold_per_k"] for r in d]
    out += [text(x0 - 60, yt - 18, "per thousand words", 10, INK3),
            text(40, 376, f"Em-dashes climbed {e[0]:.0f} to {max(e):.0f} per thousand words by midsummer ({(max(e)/e[0]-1):.0%}), then fell to {e[-1]:.0f} once the gate was in.", 11, INK3),
            text(40, 394, f"Bold did not rise in this count ({b[0]:.0f} to {b[-1]:.0f}). The page's 41 and 53 percent were measured some other way;", 11, INK3),
            text(40, 412, "this is every .md file, month by month, from git.", 11, INK3)]
    write("The Palace Voice — the dial that drifted.svg", "".join(out), 430)
    return e, b


# 10 ── Entry Conatus: how the pages begin their wish ───────────────────────
def verbs():
    c = collections.Counter(); n = 0; ex = {}
    for t in NODES:
        m = re.search(r'^forward_vector:\s*["\']?(.+)', frontmatter(t, 8000), re.M)
        if not m: continue
        s = m.group(1).strip(); n += 1; w = re.findall(r"[A-Za-z']+", s)[:6]
        if not w: continue
        key = " ".join(w[:3]).lower() if w[0].lower() == "i" else ("As a palace citizen …" if w[0].lower() == "as" else w[0].lower() + " …")
        key = {"i want to": "I want to …", "i am the": "I am …", "i am a": "I am …", "i am not": "I am …"}.get(key, ("I " + w[1].lower() + " …") if w[0].lower() == "i" and len(w) > 1 else key)
        c[key] += 1; ex.setdefault(key, t)
    top = c.most_common(12); stasis = ("I am …", "I remain …", "I stay …", "I continue …")
    x0 = 220; mx = top[0][1]; out = [head("HOW THE PAGES BEGIN THEIR WISH")]
    for i, (k, v) in enumerate(top):
        y = 96 + i * 24; col = RED if k in stasis else INK
        out += [text(x0 - 10, y + 12, k, 11, col, "end", 700 if k in stasis else 400), f'<rect x="{x0}" y="{y}" width="{v / mx * 560:.1f}" height="16" fill="{col}"/>', text(x0 + v / mx * 560 + 8, y + 12, str(v), 11, INK2)]
    rest = n - sum(v for _, v in top)
    out += [text(40, 96 + 12 * 24 + 22, f"The first words of {n} forward vectors, map build of {MAPDATE}. {rest} begin some other way.", 11, INK3),
            text(40, 96 + 12 * 24 + 40, "Red: the opening the page calls a stasis-verb, 'I am [static description]'. A count of openings, not a judgment of each page.", 11, INK3)]
    write("Entry Conatus — how the pages begin their wish.svg", "".join(out), 96 + 12 * 24 + 58)
    return n, top


# 11 ── Resonant Link Labels: every link, and whether it says how ───────────
def labels():
    order = [t for t, _ in collections.Counter(e["type"] for e in EDGES).most_common()]
    pal = dict(zip(order, [INK3, "#2b5fb0", "#6a47b8", "#3a7d2c", "#a8730a", "#b3356b", "#c8261a", "#1a1916", "#3a3a35", "#b83a26", "#6a6862", "#a8730a"]))
    cols, c = 83, 9.6; out = [head("EVERY LINK, AND WHETHER IT SAYS HOW")]; i = 0; lab = 0
    for t in order:
        for e in sorted((e for e in EDGES if e["type"] == t), key=lambda e: not e.get("label")):
            x = 60 + (i % cols) * c; y = 90 + (i // cols) * c; has = bool(e.get("label")); lab += has
            out.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="7.6" height="7.6" fill="{pal[t] if has else PAPER}" stroke="{pal[t]}" stroke-width="0.9"/>'); i += 1
    y = 90 + (i // cols + 1) * c + 22; x = 60
    for t in order:
        cnt = sum(1 for e in EDGES if e["type"] == t); w = 30 + 6.7 * len(f"{t} {cnt}")
        if x + w > 880: x = 60; y += 20
        out += [f'<rect x="{x}" y="{y-9}" width="9" height="9" fill="{pal[t]}"/>', text(x + 14, y, f"{t} {cnt}", 10, INK2)]; x += w
    out += [text(40, y + 34, f"One square is one link between two pages: {len(EDGES):,} of them. Filled: it carries a label saying how the two meet ({lab / len(EDGES):.0%}).", 11, INK3),
            text(40, y + 52, f"Hollow: it only says that they do. Map build of {MAPDATE}.", 11, INK3)]
    write("Resonant Link Labels — every link, and whether it says how.svg", "".join(out), y + 70)
    return lab, len(EDGES)


ALL = [simondon, road, eye, turrell, above, bathtub, veil, tree, voice, verbs, labels]
if __name__ == "__main__":
    want = sys.argv[1:]
    for f in ALL:
        if not want or f.__name__ in want: print("→", f.__name__, f())
