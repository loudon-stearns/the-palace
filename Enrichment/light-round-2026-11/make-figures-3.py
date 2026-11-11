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


def feet(y, *paras, size=12, width=112, col=INK3):
    """Footer for the remakes of 2026-11-11: each paragraph is wrapped once, at 12 units, so no line is left with two orphan words."""
    out, k = [], 0
    for p in paras:
        for l in textwrap.wrap(p, width): out.append(text(40, y + (size + 6) * k, l, size, col)); k += 1
        y += 5
    return "".join(out)


def cap(x, y, s, size=12, col=INK2, anchor="start", weight=400, width=40, lh=None):
    """A short label wrapped to a few lines."""
    return "".join(text(x, y + (lh or size + 4) * i, l, size, col, anchor, weight) for i, l in enumerate(textwrap.wrap(s, width)))


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
    """Remade after the challenge: the hammer is held above the bench with its face on the nail, the broken one lies on the
    bench with its handle snapped and still joined, and the borrowed avatar is gone. No leak."""
    def scene(ox, tool, nail, broken):
        nx = ox + (290 if broken else 150)
        g = f'<rect x="{ox}" y="300" width="340" height="26" fill="{FILL}" stroke="{INK}" stroke-opacity="{max(nail, 0.35)}"/>'
        g += f'<rect x="{nx-2.5}" y="262" width="5" height="40" fill="{INK}" fill-opacity="{nail}"/><rect x="{nx-10.5}" y="258" width="21" height="5" fill="{INK}" fill-opacity="{nail}"/>'
        if not broken:   # head upright over the nail, face down on it; the handle runs off to the right and a little up, all above the bench
            g += f'<g opacity="{tool}"><rect x="{nx-17}" y="194" width="34" height="62" fill="{INK}"/><rect x="{nx+15}" y="212" width="170" height="14" fill="{INK}" transform="rotate(-9 {nx+15} 219)"/></g>'
        else:            # lying on the bench: head on its face, the handle snapped and sagging to the board, still joined at the break
            hx = ox + 60; g += f'<g opacity="{tool}"><rect x="{hx-17}" y="238" width="34" height="62" fill="{INK}"/><rect x="{hx+15}" y="256" width="84" height="14" fill="{INK}"/>'
            g += f'<rect x="{hx+97}" y="256" width="92" height="14" fill="{INK}" transform="rotate(20 {hx+97} 263)"/>'
            g += f'<path d="M{hx+91},250 l5,9 l-7,5 l8,5 l-5,9" fill="none" stroke="{RED}" stroke-width="2.6"/></g>' + text(hx + 96, 238, "snapped", 12, RED, "middle")
        return g
    out = [head("YOU DO NOT SEE THE HAMMER"), T(60, 100, "WORKING"), text(60, 120, "ready-to-hand: you notice the nail going in", 12, INK3), scene(60, 0.13, 1.0, False),
           T(520, 100, "BROKEN", RED), text(520, 120, "present-at-hand: an object staring back", 12, INK3), scene(520, 1.0, 0.18, True),
           text(210, 348, "the nail", 12, INK2, "middle"), text(580, 348, "the hammer", 12, INK2, "middle"),
           f'<line x1="460" y1="84" x2="460" y2="352" stroke="{RULE}"/>']
    out.append(feet(384, "In use “you don't notice the hammer, you notice the nail going in”; it becomes an object “only when it breaks”.",
                    "The fading is my way of drawing it. The page's claim is about two ways a tool can be, not about eyesight."))
    write("Martin Heidegger — you do not see the hammer.svg", "".join(out), 432)


# 3 ── George Nakashima: the crack is kept ──────────────────────────────────
def butterfly():
    """Remade after the challenge: the split runs with the grain, in from one end, and the keys sit across it with their own
    grain across the board's. A second, smaller split is left without a key, for the page's point that he chose. No leak."""
    g = lambda x, k=0.0: 5 * math.sin(x / 70) + 2.2 * math.sin(x / 23 + k * 0.6)        # one shared wander, so every grain line runs the same way
    out = [head("THE CRACK IS KEPT"), f'<path d="M90,120 C200,96 380,104 500,112 C640,120 760,100 840,128 L850,330 C720,352 560,338 430,344 C300,350 180,336 84,340 Z" fill="#d8c9a3" stroke="{INK}" stroke-width="1.6"/>']
    for k in range(13):
        if k == 6: continue                                                         # the crack takes this line's place
        y = 132 + k * 16; out.append('<path d="M' + " L".join(f"{x},{y + g(x, k):.1f}" for x in range(96, 843, 12)) + '" fill="none" stroke="#8a7347" stroke-width="0.8" stroke-opacity="0.7"/>')
    yc = lambda x: 228 + g(x, 6); x0, x1 = 470, 845; wd = lambda x: 10 * (x - x0) / (x1 - x0)
    out.append('<path d="M' + " L".join(f"{x},{yc(x):.1f}" for x in range(96, x0 + 1, 12)) + '" fill="none" stroke="#8a7347" stroke-width="0.8" stroke-opacity="0.7"/>')
    xs = list(range(x0, x1 + 1, 15))
    out.append('<path d="M' + " L".join(f"{x},{yc(x) - wd(x)/2:.1f}" for x in xs) + " L" + " L".join(f"{x},{yc(x) + wd(x)/2:.1f}" for x in reversed(xs)) + f' Z" fill="{INK}" stroke="{INK}" stroke-width="1"/>')
    out.append(f'<path d="M{x1-1},{yc(x1) - 5.5:.1f} L{x1+8},{yc(x1) - 7:.1f} L{x1+8},{yc(x1) + 7:.1f} L{x1-1},{yc(x1) + 5.5:.1f} Z" fill="{PAPER}"/>')   # the split is open at the end of the board
    for cx in (610, 745):                                                           # bowties stood across the split: wide ends above and below it, waist on it
        cy = yc(cx); out.append(f'<path d="M{cx-24},{cy-40:.1f} L{cx+24},{cy-40:.1f} L{cx+9},{cy:.1f} L{cx+24},{cy+40:.1f} L{cx-24},{cy+40:.1f} L{cx-9},{cy:.1f} Z" fill="#5b3d24" stroke="{INK}" stroke-width="1.4"/>')
        out += [f'<line x1="{cx+d}" y1="{cy-37:.1f}" x2="{cx+d}" y2="{cy+37:.1f}" stroke="#d8c9a3" stroke-width="0.7" stroke-opacity="0.55"/>' for d in (-5, 0, 5)]
    yk = lambda x: 132 + 2 * 16 + g(x, 2) + 8                                       # a short check at the other end, between two grain lines, left alone
    out.append('<path d="M' + " L".join(f"{x},{yk(x):.1f}" for x in range(88, 191, 12)) + f'" fill="none" stroke="{INK}" stroke-width="2"/>')
    def lab(x, y, s, anchor="start"):                                               # a label on a plate of the board's own colour, so no grain line strikes it
        w = len(s) * 7.25 + 10; rx = x - 5 if anchor == "start" else x - w + 5
        return f'<rect x="{rx:.0f}" y="{y-13}" width="{w:.0f}" height="18" fill="#d8c9a3"/>' + text(x, y, s, 12, INK, anchor)
    out += [lab(520, 150, "keys set across the split, left showing"), lab(456, yc(440) + 4, "the split runs with the grain", "end"), lab(204, yk(190) + 4, "this split got no key"),
            feet(380, "When a board split, Nakashima “didn't hide the crack”. He cut a bowtie-shaped inlay across it and left it visible: “proof of the repair, not a cover for it”.",
                 "Further down, the page says who “decided which split earned a butterfly joint and exactly where it sat”. He did.",
                 "A drawing, not one of his tables. The slab, both splits and the places of the keys are mine.")]
    write("George Nakashima — the crack is kept.svg", "".join(out), 470)


# 4 ── Andy Goldsworthy: to the very edge of its collapse ───────────────────
def collapse():
    """Remade after the challenge: the ground runs under everything that lands on it, the base stone stays where it was laid,
    the fallen stones come to rest on the ground or on each other, and the label holds for 3.8 seconds. The stack itself is
    unchanged (the challenger's sum found it at its tipping point). 24-second loop: up to 10 s, standing to 15 s, down by 18 s."""
    N = 9; D = 24.0; GY = 392; css = []; out = [head("TO THE VERY EDGE OF ITS COLLAPSE"), f'<line x1="60" y1="{GY}" x2="900" y2="{GY}" stroke="{INK}" stroke-width="1.5"/>']
    # where each stone ends up: (centre x, tilt in degrees, centre y or None for "lying on the ground"). Set by hand, not simulated.
    REST = [(None, 0, None), (505, 14, None), (604, -6, None), (694, 5, None), (775, -9, None), (848, 4, None), (651, 12, 357), (737, -14, 360), (813, -10, 362)]
    lean = 0
    for i in range(N):
        w, h = 120 - i * 9, 30 - i * 1.2; lean += 3 + i * 2.6; x = 400 + lean; y = 392 - (i + 1) * 31; cy = y + h / 2
        tx, rot, ty = REST[i]; a = math.radians(rot)
        if tx is None: fx = fy = 0.0
        else: fx = tx - x; fy = (ty if ty is not None else GY - math.hypot(w / 2 * math.sin(a), h / 2 * math.cos(a))) - cy
        t_in = 3 + i * 4.5; end = f"transform:translate({fx:.0f}px,{fy:.1f}px) rotate({rot}deg)"
        css.append(f"@keyframes s{i}{{0%,{t_in}%{{opacity:0;transform:translate(0,-26px)}}{t_in+3.5}%,62%{{opacity:1;transform:translate(0,0)}}"
                   f"{66 + i*0.5:.1f}%{{opacity:1;transform:translate({fx*0.3:.0f}px,{fy*0.12:.1f}px) rotate({rot*0.3:.0f}deg)}}75%,91%{{opacity:1;{end}}}97%,100%{{opacity:0;{end}}}}}"
                   f".s{i}{{animation:s{i} {D}s ease-in-out infinite;transform-box:fill-box;transform-origin:center;opacity:0}}")
        out.append(f'<ellipse class="s{i}" cx="{x:.0f}" cy="{cy:.0f}" rx="{w/2:.0f}" ry="{h/2:.0f}" fill="{["#8d8a80","#a09c90","#77746b"][i%3]}" stroke="{INK}" stroke-width="1.3"/>')
    css.append(f"@keyframes lab{{0%,43%{{opacity:0}}46%,62%{{opacity:1}}65%,100%{{opacity:0}}}}.lab{{animation:lab {D}s linear infinite;opacity:0}}")
    out += [text(690, 150, "the balance point", 17, RED, "middle", 700, 'class="lab"'), text(690, 174, "is the piece", 17, RED, "middle", 700, 'class="lab"'),
            feet(424, "Nine stones go up, each a little further out than the last. The stack holds at the point where one more would bring it down. Then it comes down.",
                 "The page: “the real work is the change”. A drawing of that arc, from made to gone, moved by hand and not simulated. Not one of his works.")]
    write("Andy Goldsworthy — to the very edge of its collapse.svg", "".join(out), 496, "".join(css))


# 5 ── Reflective Practice: twelve and three ────────────────────────────────
def scale():
    """Remade after the challenge: every mechanism is named on its own weight, in the page's order, and the sixteenth,
    the Audition Gate, sits on the pivot, where a balance keeps a thing that belongs to neither side."""
    ON = ["Closing Well", "Weave", "Return", "Spore Check", "Revival", "Harvest", "Review Layer", "forward_vector revision", "Debrief Reel", "Walk", "Drift and Consolidation", "Concierge's curator"]
    IN = ["Dialectic", "Concierge's scout", "Oblique Portrait"]
    out = [head("TWELVE, THREE, AND ONE ON THE BORDER")]; cx, cy = 460, 126; a = math.radians(8); arm = 265; BW, BH = 162, 25
    lx, ly = cx - arm * math.cos(a), cy + arm * math.sin(a); rx, ry = cx + arm * math.cos(a), cy - arm * math.sin(a)
    out += [f'<path d="M{cx-24},372 L{cx},{cy} L{cx+24},372 Z" fill="{INK}"/>', f'<line x1="{lx:.0f}" y1="{ly:.0f}" x2="{rx:.0f}" y2="{ry:.0f}" stroke="{INK}" stroke-width="5"/>',
            f'<rect x="{cx-6}" y="{cy-16}" width="12" height="16" fill="{INK}"/>']
    def brick(x, y, s, fill, ink): return f'<rect x="{x:.0f}" y="{y:.0f}" width="{BW}" height="{BH-3}" fill="{fill}" stroke="{INK}" stroke-width="1"/>' + text(x + BW / 2, y + 15, s, 11, ink, "middle", 700)
    out += [brick(cx - BW / 2, cy - 16 - (BH - 3), "Audition Gate", PAPER, INK), text(cx - BW / 2 - 10, cy - 24, "“sits on the border”", 12, INK3, "end")]
    for (px, py, names, cols, lab, sub, col) in ((lx, ly, ON, 2, "ON ACTION", "twelve: looking back once the work is done", INK), (rx, ry, IN, 1, "IN ACTION", "three: while the work can still change", RED)):
        rows = -(-len(names) // cols); cw = cols * BW + (cols + 1) * 3; ch = rows * BH + 3; x0 = px - cw / 2; y0 = py + 46
        out += [f'<path d="M{x0:.0f},{y0:.0f} L{px:.0f},{py:.0f} L{x0+cw:.0f},{y0:.0f}" fill="none" stroke="{INK}" stroke-width="1.4"/>',
                f'<path d="M{x0:.0f},{y0:.0f} L{x0:.0f},{y0+ch:.0f} L{x0+cw:.0f},{y0+ch:.0f} L{x0+cw:.0f},{y0:.0f}" fill="none" stroke="{INK}" stroke-width="2.4"/>', f'<circle cx="{px:.0f}" cy="{py:.0f}" r="4" fill="{INK}"/>']
        for i, nm in enumerate(names):
            r, c = divmod(i, cols); out.append(brick(x0 + 3 + c * (BW + 3), y0 + 3 + r * BH, nm, col, PAPER))
        out += [text(px, y0 + ch + 24, lab, 13, col, "middle", 700, 'letter-spacing="2"'), text(px, y0 + ch + 42, sub, 12, INK3, "middle")]
    out.append(feet(442, "“Sort the palace's own machinery by Schön's two modes and it leans hard to one side.” Names and sort are the page's.",
                    "The page says the sort was made in one session and has not been re-audited. The balance is my picture: it gives every mechanism the same weight, and the page weighs none of them.", width=118))
    write("Reflective Practice — twelve and three.svg", "".join(out), 508)


# 6 ── The Remembering Page: a mood, a direction ────────────────────────────
def direction():
    """Remade after the challenge: the page's own vector is drawn in both panels. One pull leaves it where it was; several
    that agree let the page propose a turn, drawn beside the ghost of where it pointed. No leak: 'forward vector' is the page's own term."""
    out = [head("A MOOD, A DIRECTION")]
    def arr(x, y, ang, col, w=2, ln=110, dash=""): a = math.radians(ang); return arrow(x, y, x + ln * math.cos(a), y - ln * math.sin(a), col, w, dash)
    dot = lambda x, y: f'<circle cx="{x}" cy="{y}" r="7" fill="{INK}"/>' + text(x, y + 28, "the page", 12, INK2, "middle")
    # one dialogue: the vector, and one pull beside it
    out += [T(60, 100, "ONE DIALOGUE"), text(60, 120, "a mood: the forward vector stays", 12, INK3), arr(150, 300, 75, INK, 4, 150), dot(150, 300), text(204, 158, "its forward vector", 12, INK),
            arr(250, 290, 20, INK3, 1.6, 110, "5 4"), text(250, 312, "one pull, once", 12, INK3)]
    # several that agree: the ghost of the old vector, three pulls, and the turn the page proposes
    out += [T(500, 100, "SEVERAL THAT AGREE", RED), text(500, 120, "a direction: the page proposes a turn", 12, INK3), arr(570, 300, 75, RULE, 3, 150, "6 5"), text(604, 142, "where it pointed", 12, INK3),
            f'<path d="M{570 + 70*math.cos(math.radians(72)):.1f},{300 - 70*math.sin(math.radians(72)):.1f} A70,70 0 0 1 {570 + 70*math.cos(math.radians(46)):.1f},{300 - 70*math.sin(math.radians(46)):.1f}" fill="none" stroke="{RED}" stroke-width="1.4"/>',
            arr(570, 300, 42, RED, 4, 150), dot(570, 300), text(690, 190, "the turn it proposes", 12, RED)]
    for i, d in enumerate((20, 26, 15)): out.append(arr(704, 310 - i * 36, d, INK3, 1.6, 110, "5 4"))
    out += [text(704, 334, "the same pull, three times", 12, INK3), f'<line x1="440" y1="84" x2="440" y2="336" stroke="{RULE}"/>',
            feet(372, "“One dialogue is a mood; three consistent ones are a direction.” A page proposes a change to its forward vector, and it is applied only when the same change shows up across several remembered encounters.",
                 "“The human decides when the molt is real”, and the page says how many encounters count “isn't known yet”. The arrows and their angles are mine and measure nothing.")]
    write("The Remembering Page — a mood, a direction.svg", "".join(out), 458)


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
    """Remade after the challenge: every string on both cards is the page's own, from its table of tone exemplars and its
    Origin section. No avatar and no leak: the 'Trickster page' of the sentence is the four-card inbox, not the Trickster entry."""
    AMBER, CYAN = "#e0a030", "#1f7f8f"
    out = [head("THE SAME CARD, TWICE"), T(40, 92, "PROTOCOL REGISTER, SHOWN TO A PERSON"), T(480, 92, "NATURAL REGISTER, SAME MESSAGE", RED)]
    # left: the wire's words on the skin, as the page says the first build had them
    out += [f'<rect x="40" y="106" width="400" height="184" fill="{PAPER}" stroke="{INK}" stroke-width="1.4"/>',
            f'<rect x="56" y="122" width="84" height="24" fill="none" stroke="{INK}" stroke-width="1.2"/>', text(98, 138, "BLOCKING", 12, INK, "middle", 700),
            text(56, 176, "RESOURCE_REQUEST · resource: sensory_audition_gate", 12, INK2), text(56, 198, "re: torus-steward-008", 12, INK2),
            text(56, 220, "blocking · listening gate · steward leans …", 12, INK3),
            f'<rect x="56" y="244" width="132" height="30" fill="none" stroke="{INK}" stroke-width="1.2"/>', text(122, 263, "RESOURCE_GRANT", 12, INK, "middle", 700)]
    # right: the same message in the natural register, each string from the right-hand column of the page's table
    out += [f'<rect x="480" y="106" width="400" height="184" fill="{PAPER}" stroke="{RED}" stroke-width="1.8"/>',
            f'<rect x="496" y="122" width="206" height="24" fill="none" stroke="{RED}" stroke-width="1.2"/>', text(599, 138, "STEWARD PAUSED · YOUR EARS", 12, RED, "middle", 700),
            f'<rect x="728" y="122" width="136" height="24" rx="12" fill="none" stroke="{CYAN}" stroke-width="1.2"/>', text(796, 138, "torus-steward-008", 11, CYAN, "middle"),
            cap(496, 174, "did the five rendered audition passes survive your ears?", 13, INK, weight=700, width=44, lh=18),
            cap(496, 216, "the steward stopped working until your ears confirm the smallest engine survives", 12, INK2, width=50, lh=17),
            f'<rect x="496" y="246" width="124" height="30" fill="{AMBER}" stroke="{INK}" stroke-width="1"/>', text(558, 266, "▶ FILE LEAN", 12, INK, "middle", 700)]
    for (x, secs, col) in ((40, 60, INK), (480, 3, RED)):
        out += [f'<rect x="{x}" y="310" width="{secs/60*400:.0f}" height="18" fill="{col}"/>', text(x, 348, f"~{secs} seconds for four cards", 12, col)]
    out.append(feet(384, "The page: “a four-card session that took ~60 seconds with jargon-laden text collapses to ~3 seconds when the surface speaks human and the steward's recommended option is one click away.”",
                    "Every string on both cards is the page's, from its table and its Origin section. The two layouts are mine; neither is a screenshot of the real page."))
    write("Speak Like a Person, Log Like a Protocol — the same card, twice.svg", "".join(out), 464)


# 9 ── No Mind Checks Itself: the same hole twice ───────────────────────────
def cheese():
    """Remade after the challenge: one slice repeated is owned as the maker's turn on the model, the right panel has two
    labelled slices and says a catch is likely, not certain, and the Latent Error avatar is gone. Leak, in words: Latent Error."""
    out = [head("THE SAME HOLE TWICE")]
    def slices(ox, holes, passes):
        g = ""
        for i, hy in enumerate(holes):
            x = ox + i * 90; g += f'<rect x="{x}" y="130" width="26" height="190" fill="{FILL}" stroke="{INK}" stroke-width="1.3"/><rect x="{x-1}" y="{hy-13}" width="28" height="26" fill="{PAPER}" stroke="{INK}" stroke-width="1.3"/>'
        y = holes[0]; g += arrow(ox - 60, y, ox + (len(holes) - 1) * 90 + 80, y, RED, 2) if passes else arrow(ox - 60, y, ox + 86, y, RED, 2) + f'<path d="M{ox+84},{y-9} l14,18 M{ox+98},{y-9} l-14,18" stroke="{RED}" stroke-width="2.4"/>'
        return g
    under = lambda ox, names: "".join(text(ox + 13 + i * 90, 344, n, 12, INK2, "middle") for i, n in enumerate(names))
    out += [T(40, 100, "CHECKING YOUR OWN WORK", RED), text(40, 120, "one mind: the same hole every time", 12, INK3), slices(110, [215, 215, 215], True), under(110, ["make", "review", "review again"]),
            text(40, 200, "an error", 12, RED), text(444, 240, "gets through", 12, RED, "end"),
            T(500, 100, "A CHECKER FROM OUTSIDE"), text(500, 120, "a different mind, different holes", 12, INK3), slices(590, [215, 165], False), under(590, ["make", "someone else"]),
            text(520, 200, "an error", 12, RED), text(724, 212, "caught", 12, RED), text(724, 230, "likely, not certain", 12, INK3),
            f'<line x1="470" y1="84" x2="470" y2="350" stroke="{RULE}"/>',
            feet(380, "Three passes by one mind are one layer drawn three times, so the holes line up. In the page's words, “the same blind spot signs off on itself”.",
                 "One slice repeated is my turn on the Swiss cheese model that Latent Error holds, where layers differ and fail when their holes align. The page calls its own claim “a strongly-recurring pattern, not a proven law”.", width=118)]
    write("No Mind Checks Itself — the same hole twice.svg", "".join(out), 452)


# 10 ── Iain McGilchrist: two ways of attending ─────────────────────────────
def attention():
    """Remade after the challenge: the broad panel is no longer a blur. All eighty-four are sharp and in their places, and the
    one page the narrow panel lifts out is shown there with its real typed links to the others in the field. 'Beholding'
    is gone; the labels are the page's words. Leak, in words: Pauline Oliveros's focal and global attention."""
    from PIL import ImageDraw
    titles = sorted(NODES, key=str.lower)[40:124]; cols, Tn = 12, 66; rows = 7; focus = 44; at = {t: i for i, t in enumerate(titles)}
    mid = lambda i: ((i % cols) * Tn + Tn // 2, (i // cols) * Tn + Tn // 2)
    links = sorted({at[e["target"] if e["source"] == titles[focus] else e["source"]] for e in EDGES if titles[focus] in (e["source"], e["target"]) and e["source"] in at and e["target"] in at})
    def field(mode):
        im = Image.new("RGB", (cols * Tn, rows * Tn), rgb(PAPER)); d = ImageDraw.Draw(im)
        for i, t in enumerate(titles):
            r, c = divmod(i, cols)
            if mode == "narrow" and i != focus: d.rectangle([c * Tn + 4, r * Tn + 4, c * Tn + Tn - 5, r * Tn + Tn - 5], outline=rgb(RULE))
            else: im.paste(icon(t, Tn - 8), (c * Tn + 4, r * Tn + 4))
        if mode == "broad":
            for j in links: d.line([mid(focus), mid(j)], fill=rgb(RED), width=4); r, c = divmod(j, cols); d.rectangle([c * Tn + 2, r * Tn + 2, c * Tn + Tn - 3, r * Tn + Tn - 3], outline=rgb(RED), width=3)
            r, c = divmod(focus, cols); im.paste(icon(titles[focus], Tn - 8), (c * Tn + 4, r * Tn + 4))
        r, c = divmod(focus, cols); d.rectangle([c * Tn + 1, r * Tn + 1, c * Tn + Tn - 2, r * Tn + Tn - 2], outline=rgb(RED), width=4)
        return im
    s = Sheet(930, "Two ways of attending", "The same eighty-four pages, attended to twice. The red frame is the same page both times.")
    for i, (mode, lab, sub) in enumerate((("narrow", "NARROW, GRASPING", "one thing lifted out: “decontextualized”"), ("broad", "BROAD, OPEN", "“the living whole in context”: all sharp, all in place"))):
        x = 80 + i * 870; s.paste(field(mode), (x, 200), frame=INK); s.text((x, 690), lab, 28, RED if i == 0 else INK, bold=True); s.text((x, 732), sub, 23, INK3)
    for k, l in enumerate(("McGilchrist's question: “what kind of attention are you paying to this?” The two panels are my picture of his two answers.",
                           f"The pages are an alphabetical slice of the palace. The red lines are that page's {len(links)} typed links within it (map of {MAPDATE}).")):
        s.text((80, 810 + k * 36), l, 22, INK3)
    s.save("Iain McGilchrist — two ways of attending.png")


# 11 ── Registry Pattern: cables that point nowhere ─────────────────────────
def cables():
    """Remade after the challenge: outputs sit on a module's right edge and inputs on its left, so a cable crosses only the gap
    between two modules and strikes no label; the loose cables end short of the invented names they were sent to. No leak."""
    out = [head("CABLES THAT POINT NOWHERE")]; MW, GAP, MY = 104, 50, 146; R = [MY + 56, MY + 94, MY + 132]
    def mod(x, name, ins, outs):
        g = f'<rect x="{x}" y="{MY}" width="{MW}" height="156" fill="{FILL}" stroke="{INK}" stroke-width="1.4"/>' + text(x + MW / 2, MY + 24, name, 13, INK, "middle", 700)
        for r, p in ins: g += f'<circle cx="{x+18}" cy="{R[r]}" r="8" fill="{PAPER}" stroke="{INK}" stroke-width="1.6"/>' + text(x + 32, R[r] + 4, p, 11, INK2)
        for r, p in outs: g += f'<circle cx="{x+MW-18}" cy="{R[r]}" r="8" fill="{PAPER}" stroke="{INK}" stroke-width="1.6"/>' + text(x + MW - 32, R[r] + 4, p, 11, INK2, "end")
        return g
    for ox, good in ((40, False), (490, True)):
        X = [ox + i * (MW + GAP) for i in range(3)]
        out += [mod(X[0], "VCO", [(1, "V/OCT")], [(0, "SAW")]), mod(X[1], "VCF", [(0, "IN"), (2, "CUTOFF")], [(1, "OUT")]), mod(X[2], "VCA", [(0, "IN"), (1, "CV")], [(2, "OUT")])]
        for k, (a, ra, rb, name) in enumerate(((0, 0, 0, "FILTER_INPUT ?"), (1, 1, 0, "AMP_AUDIO ?"))):
            x1, y1 = X[a] + MW - 18, R[ra]; gx = X[a] + MW + GAP / 2
            if good:
                x2, y2 = X[a + 1] + 18, R[rb]; out.append(f'<path d="M{x1},{y1} C{gx},{y1+30} {gx},{y2+30} {x2},{y2}" fill="none" stroke="{INK}" stroke-width="3.4" stroke-linecap="round"/><circle cx="{x1}" cy="{y1}" r="4" fill="{INK}"/><circle cx="{x2}" cy="{y2}" r="4" fill="{INK}"/>')
            else:
                out.append(f'<path d="M{x1},{y1} C{gx+6},{y1} {gx},{y1+50} {gx},324" fill="none" stroke="{RED}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="7 6"/><circle cx="{x1}" cy="{y1}" r="4" fill="{RED}"/><circle cx="{gx}" cy="328" r="5" fill="{PAPER}" stroke="{RED}" stroke-width="2"/>')
                out.append(text(gx, 354, name, 12, RED, "middle", 700))
    out += [T(40, 100, "WITHOUT A REGISTRY", RED), text(40, 120, "the patch loads; its cables name ports that do not exist", 12, INK3), T(490, 100, "WITH ONE"), text(490, 120, "only what exists can be written", 12, INK3),
            f'<line x1="470" y1="84" x2="470" y2="360" stroke="{RULE}"/>',
            feet(392, "Without a registry, a model writing a patch “will invent port names, module slugs, and parameter IDs that don't exist. The patch loads — but cables point nowhere.”",
                 "The modules, their ports and the two invented names are my examples. The page lists none.")]
    write("Registry Pattern — cables that point nowhere.svg", "".join(out), 454)


# 12 ── Drift and Consolidation: the sawtooth ───────────────────────────────
def sawtooth():
    """Remade after the challenge: the dashed line now climbs at the teeth's own slope, no line strikes a label, and the inset
    is the page's own drift number for one real steward (drift-gwl.json, from count-drift-gwl.py) in place of the voice's
    em-dash count. Leak: Generative Wavetable Libraries, whose footer carries the marker and points back to this page."""
    out = [head("THE SAWTOOTH")]; x0, x1, yb = 60, 450, 320; n = 4; w = (x1 - x0) / n; H = 80; slope = H / w; pts = [(x0, yb)]
    for k in range(n): pts += [(x0 + (k + 1) * w, yb - H), (x0 + (k + 1) * w, yb - 6)]
    ux = x0 + w + (yb - H - 142) / slope                                            # where the untracked line, carried on at the same slope, reaches y = 142
    out += [T(60, 100, "THE SHAPE"), text(60, 120, "the gap between log and entry", 12, INK3),
            f'<line x1="{x0}" y1="{yb}" x2="{x1}" y2="{yb}" stroke="{RULE}"/>', f'<line x1="{x0 + w + 40:.0f}" y1="{yb-H}" x2="{x1}" y2="{yb-H}" stroke="{RULE}" stroke-dasharray="2 4"/>',
            '<path d="M' + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + f'" fill="none" stroke="{INK}" stroke-width="2.4"/>',
            arrow(x0 + w, yb - H, ux, 142, RED, 2, "6 5"), text(ux + 12, 150, "untracked: it only climbs", 12, RED),
            text(x1, yb - H - 9, "folded: it stays in a band", 12, INK2, "end"),
            text(x0 + w / 2, yb + 20, "drift", 12, INK2, "middle"), f'<line x1="{x0 + 2*w:.1f}" y1="{yb+3}" x2="{x0 + 2*w:.1f}" y2="{yb+9}" stroke="{INK2}"/>', text(x0 + 2 * w, yb + 24, "consolidate", 12, INK2, "middle"), text(x1, yb + 20, "time", 12, INK3, "end")]
    d = json.load(open(os.path.join(HERE, "drift-gwl.json"))); P = d["points"]; px0, px1 = 566, 866; c0, c1 = P[0]["cycle"], P[-1]["cycle"]; top = max(p["drift"] for p in P)
    X = lambda c: px0 + (c - c0) / (c1 - c0) * (px1 - px0); Y = lambda v: yb - v * 14
    fold = next(p for p in P if p.get("fold")); peak = max(p["drift"] for p in P if p["cycle"] == fold["cycle"])
    out += [T(540, 100, "ONE REAL STEWARD", RED), text(540, 120, "cycles since its entry was last consolidated", 12, INK3), f'<line x1="{px0}" y1="{yb}" x2="{px1}" y2="{yb}" stroke="{RULE}"/>']
    for v in (0, peak, top): out += [f'<line x1="{px0-6}" y1="{Y(v)}" x2="{px1}" y2="{Y(v)}" stroke="{RULE}" stroke-dasharray="2 4"/>' if v else "", text(px0 - 10, Y(v) + 4, str(v), 12, INK2, "end")]
    out += ['<path d="M' + " L".join(f"{X(p['cycle']):.1f},{Y(p['drift']):.1f}" for p in P) + f'" fill="none" stroke="{RED}" stroke-width="2.2"/>'] + [f'<circle cx="{X(p["cycle"]):.1f}" cy="{Y(p["drift"]):.1f}" r="3" fill="{PAPER}" stroke="{RED}" stroke-width="1.6"/>' for p in P]
    for c, anchor, date in ((c0, "start", "27 May"), (fold["cycle"], "middle", "folded 7 June"), (c1, "end", "28 Oct 2026")):
        out += [text(X(c), yb + 20, f"cycle {c}", 12, INK2, anchor), text(X(c), yb + 36, date, 12, INK3, anchor)]
    out += [text(X(c1), Y(top) - 12, "11, and no fold yet", 12, RED, "end", 700), f'<line x1="500" y1="84" x2="500" y2="350" stroke="{RULE}"/>',
            feet(392, "“The bug is never drift. The bug is unbounded, untracked drift”. Left, my sketch of that. Right, the page's own number for Generative Wavetable Libraries: one fold, then eleven cycles with none.",
                 "The page says the number is “shown, not acted on”. Counted from the steward's history and the two cycles its entry's footer has named; spaced by cycle, not by day.")]
    write("Drift and Consolidation — the sawtooth.svg", "".join(out), 476)


# 13 ── The Multilinear Self: one thing, three true shadows ─────────────────
def shadows():
    """Remade after the challenge: the solid is one that really casts these three shadows (a round base rising to a straight
    ridge), drawn in one oblique projection with its shadows computed from it, the triangle upright; and the three rooms are
    the page's own, from its projection roster. Leak: Hyperdimensional Prism, which the page names in so many words."""
    out = [head("ONE THING, THREE TRUE SHADOWS")]
    out += [f'<path d="M150,330 L460,400 L770,330 L460,270 Z" fill="{FILL}" stroke="{RULE}"/>', f'<path d="M150,330 L150,120 L460,70 L460,270 Z" fill="#e6e3d7" stroke="{RULE}"/>', f'<path d="M770,330 L770,120 L460,70 L460,270 Z" fill="#ebe8dd" stroke="{RULE}"/>']
    L = math.hypot(310, 60); ua, ub = (-310 / L, 60 / L), (310 / L, 60 / L)             # the floor's two edges, per unit; up is straight up
    S = lambda a, b, z: (460 + a * ua[0] + b * ub[0], 270 + a * ua[1] + b * ub[1] - z)   # world (along the left wall, along the right wall, height) to the sheet
    path = lambda pts, close=True: "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + (" Z" if close else "")
    R, Hh, z0, a0, b0 = 48, 112, 64, 172, 172; ring = [(a0 + R * math.cos(t), b0 + R * math.sin(t)) for t in [k * math.pi / 30 for k in range(60)]]
    sh = f'fill="{INK}" fill-opacity="0.3"'
    out += [f'<path d="{path([S(a, b, 0) for a, b in ring])}" {sh}/>',                                                        # from above: the round base
            f'<path d="{path([S(a0 - R, 0, z0), S(a0 + R, 0, z0), S(a0 + R, 0, z0 + Hh), S(a0 - R, 0, z0 + Hh)])}" {sh}/>',    # along the ridge's length: a rectangle
            f'<path d="{path([S(0, b0 - R, z0), S(0, b0 + R, z0), S(0, b0, z0 + Hh)])}" {sh}/>']                                # end on to the ridge: a triangle, upright
    base = [S(a, b, z0) for a, b in ring]; r1, r2 = S(a0 - R, b0, z0 + Hh), S(a0 + R, b0, z0 + Hh)
    def hull(P):
        P = sorted(set((round(x, 2), round(y, 2)) for x, y in P)); cr = lambda o, a, b: (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); lo, up = [], []
        for p in P:
            while len(lo) >= 2 and cr(lo[-2], lo[-1], p) <= 0: lo.pop()
            lo.append(p)
        for p in reversed(P):
            while len(up) >= 2 and cr(up[-2], up[-1], p) <= 0: up.pop()
            up.append(p)
        return lo[:-1] + up[:-1]
    out.append(f'<path d="{path(hull(base + [r1, r2]))}" fill="{RED}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round"/>')
    for t in [k * math.pi / 8 for k in range(1, 8)]:                                    # the near side's rulings, each from the base straight up to the ridge
        a, b = a0 + R * math.cos(t), b0 + R * math.sin(t); out.append(f'<path d="{path([S(a, b, z0), S(a, b0, z0 + Hh)], False)}" stroke="{INK}" stroke-width="0.7" stroke-opacity="0.45"/>')
    out += [f'<path d="{path([S(a0 + R * math.cos(t), b0 + R * math.sin(t), z0) for t in [k * math.pi / 30 for k in range(31)]], False)}" fill="none" stroke="{INK}" stroke-width="1.4"/>',
            f'<path d="{path([r1, r2], False)}" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>']
    fx, fy = S(a0, b0, 0)
    for x, shape, name, room in ((200, "a rectangle", "Professor Compressor", "dynamics · DSP · deep dives"), (460, "a circle", "Loud'n Live", "the channel · public teaching"), (720, "a triangle", "Sonic Sensei", "mentorship · the craft · the long game")):
        out += [text(x, 428, shape, 13, INK, "middle", 700), text(x, 446, name, 12, INK2, "middle"), text(x, 462, room, 11, INK3, "middle")]
    out.append(text(fx, (base[15][1] + fy - R * ub[1] * 1.414) / 2 + 5, "the whole self", 13, RED, "middle", 700))      # in the clear floor between the solid and its shadow
    out.append(feet(496, "“Each name is a projection of it — a real shadow the whole self casts into a particular room.” “Honest, just partial.”",
                    "One solid, a round base rising to a straight ridge, casts all three. The names and rooms are three of the six on the page's roster; which shape goes with which name means nothing.", width=120))
    write("The Multilinear Self — one thing, three true shadows.svg", "".join(out), 560)


# 14 ── Julia Cameron: a week of mornings ───────────────────────────────────
def mornings():
    """Remade after the challenge as a different picture: one morning's three pages side by side, each drawn from the page's own
    sentence about it. The Daily Page's avatar is gone (the two pages do not link or name each other). No leak. The file is
    renamed; the first version, 'a week of mornings', is left in the workshop as it was."""
    r = np.random.default_rng(1992); out = [head("ONE MORNING, THREE PAGES")]; PW, PH, PY = 220, 262, 84
    def scribble(x, y, wd, jit, col=INK3, sw=1.1):
        return f'<polyline points="' + " ".join(f"{x + j*5:.0f},{y + r.normal(0, jit):.1f}" for j in range(int(wd // 5) + 1)) + f'" fill="none" stroke="{col}" stroke-width="{sw}"/>'
    for p, (x, title, says) in enumerate(((60, "PAGE ONE", "“complaint and to-do-list noise”"), (350, "PAGE TWO", "“goes deeper”"), (640, "PAGE THREE", "“tends to show up on page three”"))):
        out.append(f'<rect x="{x}" y="{PY}" width="{PW}" height="{PH}" fill="#faf8f1" stroke="{INK}" stroke-width="1.3"/>')
        if p == 0:      # crowded: short broken runs, a to-do list with boxes, things struck out
            for k in range(19):
                y = PY + 20 + k * 12.6
                if 6 <= k <= 11: out += [f'<rect x="{x+18}" y="{y-5:.1f}" width="7" height="7" fill="none" stroke="{INK2}" stroke-width="1"/>', scribble(x + 32, y, r.integers(60, 150), 2.2, INK2)]
                else:
                    a = r.integers(70, 120); out += [scribble(x + 16, y, a, 2.6, INK2, 1.3), scribble(x + 26 + a, y, PW - 44 - a, 2.6, INK2, 1.3)]
                if k in (2, 14): out.append(f'<line x1="{x+14}" y1="{y+1:.1f}" x2="{x+150}" y2="{y-1:.1f}" stroke="{INK}" stroke-width="1.6"/>')
        elif p == 1:    # steadier, whole lines
            for k in range(14): out.append(scribble(x + 18, PY + 24 + k * 17, PW - 36 - (r.integers(20, 90) if k % 4 == 3 else 0), 1.5))
        else:           # open: fewer lines, more room, and one of them the thing that was under the rest
            for k in range(10): out.append(scribble(x + 20, PY + 28 + k * 23.5, PW - 40 - (70 if k in (5, 9) else 0), 1.0, RED if k == 7 else INK3, 2.2 if k == 7 else 1.1))
        out += [T(x, PY + PH + 26, title, RED if p == 2 else INK), text(x, PY + PH + 46, says, 12, INK3)]
    out.append(feet(PY + PH + 80, "“Page one is usually complaint and to-do-list noise. Page two goes deeper. The insight, when it comes, tends to show up on page three, after the surface has been cleared off it.”",
                    "The scribbles say nothing. How each page looks, and the red line on the third, are my drawing of that sentence."))
    write("Julia Cameron — one morning, three pages.svg", "".join(out), PY + PH + 150)


ALL = [gates, hammer, butterfly, collapse, scale, direction, worktree, cards, cheese, attention, cables, sawtooth, shadows, mornings]
if __name__ == "__main__":
    want = sys.argv[1:]
    for f in ALL:
        if not want or f.__name__ in want: print("→", f.__name__, f())
