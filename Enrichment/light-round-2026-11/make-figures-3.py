#!/usr/bin/env python3
"""Light round 2026-11, third batch — fourteen diagrams and loops.
Run from this folder: python3 make-figures-3.py [name ...]   Helpers come from make-figures-2.py and lib.py."""
import importlib.util, json, math, os, sys
import numpy as np
from PIL import Image, ImageFilter
from lib import *

spec = importlib.util.spec_from_file_location("f2", os.path.join(HERE, "make-figures-2.py")); f2 = importlib.util.module_from_spec(spec); spec.loader.exec_module(f2)
write, text, head, av, box, arrow, embed = f2.write, f2.text, f2.head, f2.av, f2.box, f2.arrow, f2.embed
rng = np.random.default_rng(1964)
L2 = lambda s: f' letter-spacing="2"'
T = lambda x, y, s, col=INK: text(x, y, s, 12, col, weight=700, extra='letter-spacing="2"')
import textwrap
foot = lambda y, *ls: "".join(text(40, y + 17 * i, l, 11, INK3) for i, l in enumerate(w for l in ls for w in textwrap.wrap(l, 124)))


# 1 ── The Four Virtues: four gates ─────────────────────────────────────────
def gates():
    """Leak: The Dichotomy of Control (the outcome lies past the last gate, outside your reach) and Closing Well on the justice gate."""
    out = [head("FOUR GATES")]; G = [("WISDOM", "see what it", "actually requires"), ("JUSTICE", "give each", "their due"), ("COURAGE", "say the", "hard thing"), ("TEMPERANCE", "know when", "it is enough")]
    out.append(f'<circle cx="70" cy="210" r="9" fill="{RED}"/>' + text(70, 244, "a choice", 10, INK2, "middle"))
    for i, (g, a, b) in enumerate(G):
        x = 150 + i * 150
        out += [f'<rect x="{x}" y="130" width="14" height="160" fill="{INK}"/><rect x="{x+86}" y="130" width="14" height="160" fill="{INK}"/><rect x="{x}" y="118" width="100" height="14" fill="{INK}"/>',
                text(x + 50, 106, g, 11, INK, "middle", 700), text(x + 50, 312, a, 10, INK3, "middle"), text(x + 50, 326, b, 10, INK3, "middle")]
    out.append(av("Closing Well", 150 + 150 + 30, 150, 40, INK3))
    out += [arrow(84, 210, 730, 210, RED, 2), f'<line x1="750" y1="110" x2="750" y2="330" stroke="{RULE}" stroke-dasharray="4 4"/>',
            f'<rect x="780" y="170" width="90" height="80" fill="none" stroke="{RULE}" stroke-dasharray="3 4"/>', text(825, 206, "how it", 11, INK3, "middle"), text(825, 222, "turns out", 11, INK3, "middle"),
            text(825, 270, "not yours", 10, INK3, "middle"), text(750, 348, "the edge of what is up to you", 10, INK3, "middle")]
    out.append(foot(376, "A choice that passes all four is a good one whatever happens next; the outcome is drawn past the line because it is past your reach.",
                    "The gloss under each gate is mine, shortened from the page. The small avatar on Justice is Closing Well: the honest handoff."))
    write("The Four Virtues — four gates.svg", "".join(out), 434)


# 2 ── Martin Heidegger: you do not see the hammer ──────────────────────────
def hammer():
    """Leak: Merleau-Ponty, whose avatar is a hand: the tool the hand has taken in."""
    def scene(ox, tool, nail, broken):
        g = f'<rect x="{ox}" y="300" width="340" height="26" fill="{FILL}" stroke="{INK}" stroke-opacity="{nail}"/>'
        g += f'<rect x="{ox+166}" y="262" width="5" height="40" fill="{INK}" fill-opacity="{nail}"/><rect x="{ox+158}" y="258" width="21" height="5" fill="{INK}" fill-opacity="{nail}"/>'
        if not broken:
            g += f'<g transform="rotate(-28 {ox+170} 250)" opacity="{tool}"><rect x="{ox+150}" y="196" width="70" height="34" fill="{INK}"/><rect x="{ox+178}" y="230" width="13" height="150" fill="{INK}"/></g>'
        else:
            g += f'<g opacity="{tool}"><rect x="{ox+40}" y="266" width="70" height="34" fill="{INK}"/><rect x="{ox+68}" y="212" width="13" height="56" fill="{INK}" transform="rotate(24 {ox+74} 266)"/>'
            g += f'<path d="M{ox+200},300 l12,-74 l13,0 l-10,74 Z" fill="{INK}"/><path d="M{ox+210},224 l4,-12 l5,9 l5,-11 l2,14" fill="none" stroke="{RED}" stroke-width="2"/></g>'
        return g
    out = [head("YOU DO NOT SEE THE HAMMER"), T(60, 100, "WORKING"), text(60, 118, "you notice the nail going in", 11, INK3), scene(60, 0.13, 1.0, False),
           T(520, 100, "BROKEN", RED), text(520, 118, "now you notice the hammer", 11, INK3), scene(520, 1.0, 0.18, True), av("Merleau-Ponty", 60, 150, 46, INK3),
           f'<line x1="460" y1="84" x2="460" y2="340" stroke="{RULE}"/>']
    out.append(foot(366, "The same hammer, drawn as attention sees it. In use it goes transparent and the work is all there is; it shows up only when it fails.",
                    "The hand in the corner is Merleau-Ponty's avatar: his page says the same of any tool the hand has taken in."))
    write("Martin Heidegger — you do not see the hammer.svg", "".join(out), 404)


# 3 ── George Nakashima: the crack is kept ──────────────────────────────────
def butterfly():
    """Leak: Dovetail Joint ↔ Counterpoint, the palace's page on two parts that hold by their difference."""
    out = [head("THE CRACK IS KEPT"), f'<path d="M90,120 C200,96 380,104 500,112 C640,120 760,100 840,128 L850,330 C720,352 560,338 430,344 C300,350 180,336 84,340 Z" fill="#d8c9a3" stroke="{INK}" stroke-width="1.6"/>']
    for k in range(13):
        y = 132 + k * 16; out.append(f'<path d="M96,{y} C240,{y-10+3*math.sin(k)} 420,{y+12*math.cos(k*1.3)} 600,{y-4} S780,{y+8} 842,{y+2}" fill="none" stroke="#8a7347" stroke-width="0.8" stroke-opacity="0.7"/>')
    crack = [(470, 108)] + [(470 + 14 * math.sin(i * 1.7) + i * 1.2, 108 + i * 24) for i in range(1, 10)] + [(482, 346)]
    out.append(f'<path d="M' + " L".join(f"{x:.1f},{y:.1f}" for x, y in crack) + f'" fill="none" stroke="{INK}" stroke-width="3.2"/>')
    for cy in (176, 276):
        cx = 474 + (cy - 108) * 0.03; out.append(f'<path d="M{cx-44},{cy-20} L{cx},{cy-9} L{cx+44},{cy-20} L{cx+44},{cy+20} L{cx},{cy+9} L{cx-44},{cy+20} Z" fill="{RED}" stroke="{INK}" stroke-width="1.4"/>')
    out += [text(560, 180, "a butterfly key, let into both sides", 11, INK2), av("Dovetail Joint ↔ Counterpoint", 770, 262, 54, INK3),
            foot(376, "He did not cut the crack out or fill it. He left it showing and set keys across it, so the board holds because of the join, not in spite of the split.",
                 "A drawing, not one of his tables. The avatar in the corner is Dovetail Joint ↔ Counterpoint.")]
    write("George Nakashima — the crack is kept.svg", "".join(out), 440)


# 4 ── Andy Goldsworthy: to the very edge of its collapse ───────────────────
def collapse():
    N = 9; D = 20.0; css = []; out = [head("TO THE VERY EDGE OF ITS COLLAPSE"), f'<line x1="200" y1="392" x2="720" y2="392" stroke="{INK}" stroke-width="1.5"/>']
    lean = 0
    for i in range(N):
        w, h = 120 - i * 9, 30 - i * 1.2; lean += 3 + i * 2.6; x = 400 + lean; y = 392 - (i + 1) * 31
        t_in = 4 + i * 6; fx, fy, rot = 60 + i * 34, 392 - y - h + rng.uniform(-4, 4), 20 + i * 14
        css.append(f"@keyframes s{i}{{0%,{t_in}%{{opacity:0;transform:translate(0,-26px)}}{t_in+4}%,62%{{opacity:1;transform:translate(0,0)}}"
                   f"{66 + i*0.6:.1f}%{{opacity:1;transform:translate({fx*0.25:.0f}px,{fy*0.1:.0f}px) rotate({rot*0.2:.0f}deg)}}76%,90%{{opacity:1;transform:translate({fx}px,{fy:.0f}px) rotate({rot}deg)}}97%,100%{{opacity:0;transform:translate({fx}px,{fy:.0f}px) rotate({rot}deg)}}}}"
                   f".s{i}{{animation:s{i} {D}s ease-in-out infinite;transform-box:fill-box;transform-origin:center;opacity:0}}")
        out.append(f'<ellipse class="s{i}" cx="{x:.0f}" cy="{y + h/2:.0f}" rx="{w/2:.0f}" ry="{h/2:.0f}" fill="{["#8d8a80","#a09c90","#77746b"][i%3]}" stroke="{INK}" stroke-width="1.3"/>')
    css.append("@keyframes lab{0%,52%{opacity:0}56%,62%{opacity:1}66%,100%{opacity:0}}.lab{animation:lab 20s linear infinite;opacity:0}")
    out += [text(660, 150, "here", 12, RED, "middle", 700, 'class="lab"'), text(660, 168, "this is the piece", 11, RED, "middle", extra='class="lab"'),
            foot(420, "Nine stones go up, each a little further out than the last. It holds for a breath at the point where one more would bring it down. Then it comes down.",
                 "His words: 'the real work is the change'. A drawing of the arc, made to gone; not one of his works.")]
    write("Andy Goldsworthy — to the very edge of its collapse.svg", "".join(out), 490, "".join(css))


# 5 ── Reflective Practice: twelve and three ────────────────────────────────
def scale():
    out = [head("TWELVE AND THREE")]; cx, cy = 460, 150; tilt = 11; a = math.radians(tilt); arm = 290
    lx, ly = cx - arm * math.cos(a), cy + arm * math.sin(a); rx, ry = cx + arm * math.cos(a), cy - arm * math.sin(a)
    out += [f'<line x1="{lx:.0f}" y1="{ly:.0f}" x2="{rx:.0f}" y2="{ry:.0f}" stroke="{INK}" stroke-width="4"/>', f'<path d="M{cx-22},330 L{cx},{cy} L{cx+22},330 Z" fill="{INK}"/>', f'<circle cx="{cx}" cy="{cy}" r="7" fill="{PAPER}" stroke="{INK}" stroke-width="2"/>']
    for (px, py, n, lab, col) in ((lx, ly, 12, "ON ACTION", INK), (rx, ry, 3, "IN ACTION", RED)):
        out += [f'<line x1="{px:.0f}" y1="{py:.0f}" x2="{px-70:.0f}" y2="{py+86:.0f}" stroke="{INK}"/><line x1="{px:.0f}" y1="{py:.0f}" x2="{px+70:.0f}" y2="{py+86:.0f}" stroke="{INK}"/>',
                f'<line x1="{px-84:.0f}" y1="{py+86:.0f}" x2="{px+84:.0f}" y2="{py+86:.0f}" stroke="{INK}" stroke-width="3"/>']
        for i in range(n):
            r, c = divmod(i, 6); out.append(f'<rect x="{px - 66 + c*22:.0f}" y="{py + 64 - r*22:.0f}" width="19" height="19" fill="{col}"/>')
        out += [text(px, py + 112, lab, 12, col, "middle", 700, 'letter-spacing="2"'), text(px, py + 130, f"{n} mechanisms", 11, INK3, "middle"),
                text(px, py + 146, "looking back afterwards" if n == 12 else "noticing while it happens", 10, INK3, "middle")]
    out.append(foot(376, "Sort the palace's own machinery by Schön's two modes and it leans hard to one side: twelve ways of reflecting after the fact, three during.",
                    "The counts are the page's, and the page says its sort has not been re-audited. Each square is one mechanism."))
    write("Reflective Practice — twelve and three.svg", "".join(out), 440)


# 6 ── The Remembering Page: a mood, a direction ────────────────────────────
def direction():
    """Leak: Entry Conatus. What moves is the page's forward vector."""
    out = [head("A MOOD, A DIRECTION")]
    def arr(x, y, ang, col, w=2, ln=110): a = math.radians(ang); return arrow(x, y, x + ln * math.cos(a), y - ln * math.sin(a), col, w)
    out += [T(60, 100, "ONE DIALOGUE"), text(60, 118, "it pulled this way, once", 11, INK3), arr(130, 250, 62, INK3), f'<circle cx="130" cy="250" r="5" fill="{INK}"/>', text(130, 290, "the forward vector stays", 10, INK3, "middle"),
            T(360, 100, "THREE THAT AGREE", RED), text(360, 118, "the same pull, across separate encounters", 11, INK3)]
    for i, d in enumerate((24, 31, 19)): out += [arr(400 + i * 34, 262 - i * 6, d, INK3), f'<circle cx="{400 + i*34}" cy="{262 - i*6}" r="4" fill="{INK}"/>']
    out += [arrow(560, 240, 640, 240, INK, 1.4, "4 4"), arr(700, 262, 25, RED, 4, 150), f'<circle cx="700" cy="262" r="6" fill="{RED}"/>', text(775, 290, "now the vector moves", 10, RED, "middle"),
            f'<line x1="320" y1="84" x2="320" y2="310" stroke="{RULE}"/>',
            foot(340, "'One dialogue is a mood; three consistent ones are a direction.' A page changes what it wants only when the same change shows up in several",
                 "remembered encounters. The dot is the page; the arrow is its forward vector, the thing Entry Conatus says must lean somewhere.")]
    write("The Remembering Page — a mood, a direction.svg", "".join(out), 410)


# 7 ── Worktree Practice: the floor moved ───────────────────────────────────
def worktree():
    """Leak: How the Palace Commits. Both panels end at its one door."""
    out = [head("THE FLOOR MOVED")]
    def branch(x, y, name, col=INK, dots=3, extra=None):
        g = f'<line x1="{x}" y1="{y}" x2="{x+210}" y2="{y}" stroke="{col}" stroke-width="2.4"/>' + text(x - 8, y + 4, name, 10, col, "end")
        for k in range(dots): g += f'<circle cx="{x+30+k*44}" cy="{y}" r="5" fill="{PAPER}" stroke="{col}" stroke-width="1.6"/>'
        if extra: g += f'<circle cx="{x+30+dots*44}" cy="{y}" r="6" fill="{extra}"/>'
        return g
    def who(x, y, n, col=INK): return f'<circle cx="{x}" cy="{y-24}" r="7" fill="{col}"/><path d="M{x-10},{y} q10,-24 20,0 Z" fill="{col}"/>' + text(x, y + 16, n, 10, col, "middle")
    out += [T(60, 100, "ONE SHARED FLOOR", RED), text(60, 118, "two sessions in the same checkout", 11, INK3), f'<rect x="60" y="140" width="360" height="180" fill="none" stroke="{RULE}"/>',
            branch(180, 190, "branch A", INK, 3), branch(180, 250, "branch B", INK, 2, RED), who(96, 190, "session 1"), who(96, 280, "session 2"),
            f'<path d="M110,270 C140,262 150,256 172,252" fill="none" stroke="{INK3}" stroke-dasharray="3 3"/>', text(150, 296, "switches the checkout to B", 10, INK3),
            f'<path d="M110,182 C200,150 320,205 {180+30+2*44},243" fill="none" stroke="{RED}" stroke-width="1.6"/>', text(300, 168, "1's commit lands on B", 10, RED),
            T(520, 100, "A FLOOR EACH"), text(520, 118, "one worktree per session", 11, INK3)]
    for i, (n, b) in enumerate((("session 1", "branch A"), ("session 2", "branch B"))):
        y = 150 + i * 92; out += [f'<rect x="520" y="{y}" width="340" height="74" fill="none" stroke="{RULE}"/>', who(552, y + 46, n), branch(650, y + 38, b, INK, 3, INK)]
    out += [f'<line x1="470" y1="84" x2="470" y2="340" stroke="{RULE}"/>',
            foot(366, "Born 2026-06-16, the page says, after one agent switched the shared checkout's branch out from under another and a commit landed on the wrong branch.",
                 "The fix is a floor each. A schematic of that one failure, not a record of the commits involved.")]
    write("Worktree Practice — the floor moved.svg", "".join(out), 430)


# 8 ── Speak Like a Person, Log Like a Protocol: the same card twice ────────
def cards():
    """Leak: Trickster, the page whose inbox made the case; its avatar sits on the cards."""
    out = [head("THE SAME CARD, TWICE")]
    out += [f'<rect x="60" y="100" width="380" height="150" fill="{PAPER}" stroke="{INK}" stroke-width="1.4"/>', av("Trickster", 72, 112, 30, INK3),
            text(112, 130, "RESOURCE_REQUEST · re: wf_31a9", 11, INK2), text(76, 160, "scope=enrich tier=sketch n=3", 11, INK3), text(76, 178, "grant? {budget: 60K, verify: none}", 11, INK3),
            text(76, 196, "see state.json §pending[2]", 11, INK3), text(76, 232, "[GRANT] [DENY] [DEFER] [AMEND]", 11, INK2),
            f'<rect x="480" y="100" width="380" height="150" fill="{PAPER}" stroke="{RED}" stroke-width="1.8"/>', av("Trickster", 492, 112, 30, INK3),
            text(532, 130, "The Lens wants to make three pieces.", 12, INK, weight=700), text(496, 162, "Small ones, about an hour's work.", 11, INK2), text(496, 180, "I'd say yes.", 11, INK2),
            f'<rect x="496" y="206" width="90" height="28" fill="{RED}"/>', text(541, 225, "Yes", 12, PAPER, "middle", 700), text(600, 225, "or tell me otherwise", 11, INK3)]
    for (x, secs, col) in ((60, 60, INK), (480, 3, RED)):
        out += [f'<rect x="{x}" y="276" width="{secs/60*380:.0f}" height="18" fill="{col}"/>', text(x, 312, f"about {secs} seconds for four cards", 11, col)]
    out.append(foot(340, "The page's finding: a four-card session that took about a minute in protocol-speak took about three seconds once the surface spoke human.",
                    "The work did not change and the wire did not change. Both cards are mock-ups of mine to show the difference; neither is a real card."))
    write("Speak Like a Person, Log Like a Protocol — the same card, twice.svg", "".join(out), 400)


# 9 ── No Mind Checks Itself: the same hole twice ───────────────────────────
def cheese():
    """Leak: Latent Error, whose Swiss cheese model this is; its avatar marks the picture."""
    out = [head("THE SAME HOLE TWICE")]
    def slices(ox, holes, passes):
        g = ""
        for i, hy in enumerate(holes):
            x = ox + i * 90; g += f'<rect x="{x}" y="130" width="26" height="190" fill="{FILL}" stroke="{INK}" stroke-width="1.3"/><rect x="{x-1}" y="{hy-13}" width="28" height="26" fill="{PAPER}" stroke="{INK}" stroke-width="1.3"/>'
        y = holes[0]; g += arrow(ox - 60, y, ox + (len(holes) - 1) * 90 + 80, y, RED, 2) if passes else arrow(ox - 60, y, ox + 86, y, RED, 2) + f'<path d="M{ox+84},{y-9} l14,18 M{ox+98},{y-9} l-14,18" stroke="{RED}" stroke-width="2.4"/>'
        return g
    out += [T(60, 100, "CHECKING YOUR OWN WORK", RED), text(60, 118, "maker and checker share one blind spot", 11, INK3), slices(130, [215, 215, 215], True), text(130, 344, "make", 10, INK3), text(210, 344, "review", 10, INK3), text(296, 344, "review again", 10, INK3),
            text(395, 198, "the error", 10, RED), text(395, 212, "walks through", 10, RED),
            T(520, 100, "A CHECKER FROM OUTSIDE"), text(520, 118, "different mind, different holes", 11, INK3), slices(590, [215, 165, 270], False), text(590, 344, "make", 10, INK3), text(672, 344, "someone else", 10, INK3),
            av("Latent Error", 800, 250, 50, INK3), f'<line x1="480" y1="84" x2="480" y2="350" stroke="{RULE}"/>',
            foot(376, "Three passes by the same mind are one layer drawn three times: the holes line up. The checker has to sit outside the system that made the error.",
                 "James Reason's Swiss cheese model, which the page takes from Latent Error. That page's avatar is in the corner.")]
    write("No Mind Checks Itself — the same hole twice.svg", "".join(out), 440)


# 10 ── Iain McGilchrist: two ways of attending ─────────────────────────────
def attention():
    """Leak: Pauline Oliveros's focal and global attention, the same split heard instead of seen."""
    titles = sorted(NODES, key=str.lower)[40:124]; cols, Tn = 12, 66; rows = 7; focus = 44
    def field(mode):
        im = Image.new("RGB", (cols * Tn, rows * Tn), rgb(PAPER))
        for i, t in enumerate(titles):
            r, c = divmod(i, cols)
            if mode == "narrow" and i != focus: ImageDraw.Draw(im).rectangle([c * Tn + 4, r * Tn + 4, c * Tn + Tn - 5, r * Tn + Tn - 5], outline=rgb(RULE))
            else: im.paste(icon(t, Tn - 8), (c * Tn + 4, r * Tn + 4))
        return im if mode == "narrow" else im.filter(ImageFilter.GaussianBlur(2.2))
    from PIL import ImageDraw
    s = Sheet(900, "Two ways of attending", "The same eighty-four pages, attended to twice.")
    for i, (mode, lab, sub) in enumerate((("narrow", "GRASPING", "one thing, sharp, lifted out of everything it belongs to"), ("broad", "BEHOLDING", "all of it at once, nothing sharp, nothing missing"))):
        x = 80 + i * 870; s.paste(field(mode), (x, 200), frame=INK); s.text((x, 690), lab, 26, RED if i == 0 else INK, bold=True); s.text((x, 728), sub, 20, INK3)
    s.foot("His question is 'what kind of attention are you paying to this?'. The two panels are my picture of his two answers.",
           "Avatars are a slice of the palace in alphabetical order. Pauline Oliveros's page makes the same split by ear: focal, and global.")
    s.save("Iain McGilchrist — two ways of attending.png")


# 11 ── Registry Pattern: cables that point nowhere ─────────────────────────
def cables():
    out = [head("CABLES THAT POINT NOWHERE")]
    def mod(x, y, name, ports):
        g = f'<rect x="{x}" y="{y}" width="92" height="150" fill="{FILL}" stroke="{INK}" stroke-width="1.4"/>' + text(x + 46, y + 18, name, 10, INK, "middle", 700)
        for i, p in enumerate(ports): g += f'<circle cx="{x+46}" cy="{y+50+i*38}" r="8" fill="{PAPER}" stroke="{INK}" stroke-width="1.6"/>' + text(x + 46, y + 72 + i * 38, p, 8, INK3, "middle")
        return g
    def cable(x1, y1, x2, y2, col=INK, dash=""): return f'<path d="M{x1},{y1} C{x1},{y1+70} {x2},{y2+70} {x2},{y2}" fill="none" stroke="{col}" stroke-width="3" stroke-linecap="round" {f"stroke-dasharray={chr(34)}{dash}{chr(34)}" if dash else ""}/>'
    for ox, good in ((60, False), (500, True)):
        out += [mod(ox, 140, "VCO", ["SAW", "V/OCT", "PWM"]), mod(ox + 130, 140, "VCF", ["IN", "CUTOFF", "OUT"]), mod(ox + 260, 140, "VCA", ["IN", "CV", "OUT"])]
        if good: out += [cable(ox + 46, 190, ox + 176, 190, INK), cable(ox + 176, 266, ox + 306, 190, INK)]
        else:
            out += [cable(ox + 46, 190, ox + 150, 330, RED, "5 4"), text(ox + 150, 346, "“FILTER_INPUT”?", 9, RED, "middle"), cable(ox + 176, 266, ox + 290, 330, RED, "5 4"), text(ox + 290, 346, "“AMP_AUDIO”?", 9, RED, "middle")]
    out += [T(60, 100, "WITHOUT A REGISTRY", RED), text(60, 118, "the patch loads; the ports it names do not exist", 11, INK3), T(500, 100, "WITH ONE"), text(500, 118, "only names that are really there can be chosen", 11, INK3),
            f'<line x1="470" y1="84" x2="470" y2="350" stroke="{RULE}"/>',
            foot(380, "A language model writing a patch will invent port names that sound right. The patch opens and plays silence.",
                 "A registry narrows what it may write to what exists. The modules and port names are illustrative, not from a real plugin.")]
    write("Registry Pattern — cables that point nowhere.svg", "".join(out), 418)


# 12 ── Drift and Consolidation: the sawtooth ───────────────────────────────
def sawtooth():
    """Leak: The Palace Voice. The inset is that page's own drift, counted from git for the first batch."""
    out = [head("THE SAWTOOTH")]; x0, x1, yb = 70, 560, 320; n = 5; w = (x1 - x0) / n; pts = [(x0, yb)]
    for k in range(n): pts += [(x0 + (k + 1) * w, yb - 96), (x0 + (k + 1) * w, yb - 8)]
    out += [f'<line x1="{x0}" y1="{yb}" x2="{x1}" y2="{yb}" stroke="{RULE}"/>', f'<path d="M' + " L".join(f"{x:.0f},{y:.0f}" for x, y in pts) + f'" fill="none" stroke="{INK}" stroke-width="2.4"/>',
            f'<path d="M{x0},{yb} L{x1},{yb-230}" fill="none" stroke="{RED}" stroke-width="2" stroke-dasharray="6 5"/>', text(x1 - 150, yb - 200, "untracked: it only climbs", 11, RED, "end"),
            text(x0 + w * 0.5, yb - 62, "drift", 11, INK2, "middle"), text(x0 + w + 6, yb - 46, "consolidate", 11, INK2), text(x0, yb + 20, "time", 10, INK3), text(x0 - 8, yb - 96, "gap", 10, INK3, "end")]
    d = json.load(open(os.path.join(HERE, "voice-history-canon.json"))); ix, iy, iw, ih = 630, 120, 240, 150; v = [r["emdash_per_k"] for r in d]; lo, hi = min(v) - 1, max(v) + 1
    P = [(ix + i / (len(v) - 1) * iw, iy + ih - (a - lo) / (hi - lo) * ih) for i, a in enumerate(v)]
    out += [f'<rect x="{ix-14}" y="{iy-30}" width="{iw+28}" height="{ih+70}" fill="none" stroke="{RULE}"/>', text(ix, iy - 12, "ONE REAL TOOTH", 11, INK, weight=700, extra='letter-spacing="2"'),
            f'<path d="M' + " L".join(f"{x:.1f},{y:.1f}" for x, y in P) + f'" fill="none" stroke="{RED}" stroke-width="2.2"/>'] + [f'<circle cx="{x:.1f}" cy="{y:.1f}" r="3" fill="{PAPER}" stroke="{RED}" stroke-width="1.6"/>' for x, y in P]
    out += [text(ix, iy + ih + 18, "em-dashes per thousand words,", 10, INK3), text(ix, iy + ih + 32, "March to November 2026", 10, INK3), av("The Palace Voice", ix + iw - 34, iy + ih + 2, 34, INK3)]
    out.append(foot(366, "'The bug is never drift. The bug is unbounded, untracked drift.' Drift that gets consolidated makes a sawtooth and stays in a band.",
                    "The left side is a schematic. The inset is counted from the palace's git history with the voice linter: the climb is clear; the pull back has only begun."))
    write("Drift and Consolidation — the sawtooth.svg", "".join(out), 436)


# 13 ── The Multilinear Self: one thing, three true shadows ─────────────────
def shadows():
    """Leak: Hyperdimensional Prism. The page says the self 'is the Hyperdimensional Prism turned on the person who made it'."""
    out = [head("ONE THING, THREE TRUE SHADOWS")]; cx, cy = 460, 230
    out += [f'<path d="M150,330 L460,400 L770,330 L460,270 Z" fill="{FILL}" stroke="{RULE}"/>', f'<path d="M150,330 L150,120 L460,70 L460,270 Z" fill="#e6e3d7" stroke="{RULE}"/>', f'<path d="M770,330 L770,120 L460,70 L460,270 Z" fill="#ebe8dd" stroke="{RULE}"/>']
    out += [f'<ellipse cx="460" cy="338" rx="58" ry="20" fill="{INK}" fill-opacity="0.32"/>', f'<path d="M250,150 l76,-13 l0,118 l-76,13 Z" fill="{INK}" fill-opacity="0.32"/>', f'<path d="M620,166 l56,32 l-56,84 Z" fill="{INK}" fill-opacity="0.32"/>']
    out += [f'<ellipse cx="{cx}" cy="{cy+44}" rx="42" ry="14" fill="{RED}" stroke="{INK}" stroke-width="1.4"/><path d="M{cx-42},{cy+44} L{cx},{cy-70} L{cx+42},{cy+44}" fill="{RED}" stroke="{INK}" stroke-width="1.4"/>',
            f'<path d="M{cx-42},{cy+44} L{cx-42},{cy-40} L{cx},{cy-70} L{cx+42},{cy-40} L{cx+42},{cy+44}" fill="none" stroke="{INK}" stroke-width="1" stroke-dasharray="3 3"/>']
    out += [text(288, 292, "a rectangle", 11, INK2, "middle"), text(288, 308, "the educator's room", 10, INK3, "middle"), text(648, 306, "a triangle", 11, INK2, "middle"), text(648, 322, "the musician's room", 10, INK3, "middle"),
            text(460, 376, "a circle", 11, INK2, "middle"), text(460, 392, "the technologist's room", 10, INK3, "middle"), text(cx + 60, cy - 50, "the whole thing", 11, RED)]
    out.append(foot(430, "No wall shows the solid, and no shadow is a lie. 'Each name is a projection of it: a real shadow the whole self casts into a particular room.'",
                    "The three rooms are named from the Jewel's line on Loudon, 'musician, educator, creative technologist'; pairing each with a shape is arbitrary."))
    write("The Multilinear Self — one thing, three true shadows.svg", "".join(out), 510)


# 14 ── Julia Cameron: a week of mornings ───────────────────────────────────
def mornings():
    """Leak: The Daily Page, the palace's own morning practice; its avatar closes the row."""
    out = [head("A WEEK OF MORNINGS")]; days = "Mon Tue Wed Thu Fri Sat Sun".split()
    for d in range(7):
        x = 60 + d * 104; out.append(text(x + 40, 100, days[d], 11, INK2, "middle"))
        for p in range(3):
            px, py = x + p * 7, 116 + p * 7; out.append(f'<rect x="{px}" y="{py}" width="70" height="92" fill="{PAPER}" stroke="{INK}" stroke-width="1.1"/>')
        for k in range(8):
            y = 116 + 14 + 22 + k * 9; pts = " ".join(f"{x + 14 + 6 + j*4:.0f},{y + rng.normal(0, 1.5):.1f}" for j in range(int(rng.integers(9, 15))))
            out.append(f'<polyline points="{pts}" fill="none" stroke="{INK3}" stroke-width="1"/>')
    out += [av("The Daily Page", 60 + 7 * 104 + 6, 126, 78, RED), text(60 + 7 * 104 + 45, 224, "and the palace's", 10, RED, "middle"), text(60 + 7 * 104 + 45, 238, "own morning", 10, RED, "middle"),
            foot(270, "Pages written by hand, first thing, every day, to nobody. Not good pages: pages. Her claim is that what is missing is rarely talent and usually these.",
                 "The scribbles stand for writing and say nothing. The last square is The Daily Page's avatar: the palace keeps a morning of its own.")]
    write("Julia Cameron — a week of mornings.svg", "".join(out), 330)


ALL = [gates, hammer, butterfly, collapse, scale, direction, worktree, cards, cheese, attention, cables, sawtooth, shadows, mornings]
if __name__ == "__main__":
    want = sys.argv[1:]
    for f in ALL:
        if not want or f.__name__ in want: print("→", f.__name__, f())
