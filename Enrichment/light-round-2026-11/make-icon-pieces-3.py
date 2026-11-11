#!/usr/bin/env python3
"""Light round 2026-11, third batch — ten pieces built from the palace's heroes, avatars and its own records.
Run from this folder: python3 make-icon-pieces-3.py [name ...]"""
import collections, json, math, os, re, subprocess, sys
import numpy as np
from PIL import Image, ImageOps, ImageDraw
from lib import *

links = collections.defaultdict(list)
for e in EDGES: links[e["source"]].append((e["target"], e["type"], True)); links[e["target"]].append((e["source"], e["type"], False))


def has(a, b, typ): return any(t == b and ty == typ for t, ty, _ in links[a])


# 1 ── Stoicism: three teachers, three tools ────────────────────────────────
def stoa():
    s = Sheet(1120, "Three teachers, three tools", "Stoicism as the palace holds it: the people who taught it, and the moves it left behind."); S = 250
    T = [("Seneca", "the statesman"), ("Epictetus", "born a slave"), ("Marcus Aurelius", "the emperor")]; xs = [330, 795, 1260]
    for (t, sub), x in zip(T, xs):
        s.paste(icon(t, S), (x, 200), frame=INK, width=3); s.text((x + S / 2, 200 + S + 12), t, 24, INK, "ma", True); s.text((x + S / 2, 200 + S + 44), sub, 20, INK3, "ma")
    s.line([(xs[1] + S + 14, 325), (xs[2] - 14, 325)], INK, 3); s.line([(xs[2] - 30, 313), (xs[2] - 14, 325), (xs[2] - 30, 337)], INK, 3)
    s.text(((xs[1] + S + xs[2]) / 2, 286), "kept his words", 19, INK2, "ma"); s.text(((xs[1] + S + xs[2]) / 2, 340), "beside his bed", 19, INK2, "ma")
    if has("Seneca", "Epictetus", "contradicts"):
        s.line([(xs[0] + S + 14, 325), (xs[1] - 14, 325)], RED, 3); s.text(((xs[0] + S + xs[1]) / 2, 290), "contradicts", 19, RED, "ma", True)
    tools = [("The Dichotomy of Control", "what is yours to move"), ("The View From Above", "change altitude"), ("The Four Virtues", "what a good choice passes")]
    for (t, sub), x in zip(tools, xs):
        s.line([(x + S / 2, 200 + S + 80), (x + S / 2, 640)], RULE, 2)
        s.paste(icon(t, 200), (x + 25, 640), frame=INK); s.text((x + S / 2, 852), t, 22, INK, "ma", True); s.text((x + S / 2, 882), sub, 19, INK3, "ma")
    s.text((80, 590), "THE MOVES", 22, RED, bold=True); s.text((80, 200), "THE PEOPLE", 22, RED, bold=True)
    s.foot("Epictetus wrote nothing; Marcus kept a copy of his student's notes beside his bed on campaign, as the page tells it.",
           f"The red tie is a 'contradicts' link in the map build of {MAPDATE}. The one-line glosses under each avatar are mine.")
    s.save("Stoicism — three teachers, three tools.png")


# 2 ── Metaphor as Coupling Medium: ten bridges ─────────────────────────────
def bridges():
    br = sorted(t for t in NODES if "↔" in t); s = Sheet(200 + len(br) * 118 + 70, f"{len(br)} bridges", "Each of the palace's cross-domain pages is one metaphor holding two worlds in step.")
    for i, t in enumerate(br):
        a, b = [x.strip() for x in t.split("↔")]; y = 190 + i * 118; cx = 920
        s.text((cx - 90, y + 50), a, 30, INK, "rm", True); s.text((cx + 90, y + 50), b, 30, INK, "lm", True)
        s.line([(cx - 80, y + 50), (cx - 54, y + 50)], RED, 4); s.line([(cx + 54, y + 50), (cx + 80, y + 50)], RED, 4)
        s.paste(icon(t, 100), (cx - 50, y), frame=RED, width=3)
    s.foot(f"The {len(br)} pages in Cross-Domain Resonances, each wearing its own avatar between the two things it couples.")
    s.save("Metaphor as Coupling Medium — ten bridges.png")
    return br


# 3 ── Source Library: the shelf ────────────────────────────────────────────
def shelf():
    mem = sorted({t for t, ty, out in links["Source Library"] if not out} | {t for t, n in NODES.items() if n["type"] == "source"})
    mem = [t for t in mem if asset(t, "hero")]; sw, sh = 54, 640
    s = Sheet(960, "The shelf", f"{len(mem)} sources, each shown as the spine of its own hero.")
    x = (1840 - len(mem) * (sw + 4)) // 2
    for t in mem:
        h = Image.open(asset(t, "hero")).convert("RGB"); h = h.resize((round(h.width * sh / h.height), sh), Image.LANCZOS)
        cx = h.width // 2; s.paste(h.crop((cx - sw // 2, 0, cx + sw // 2, sh)), (x, 200), frame=INK, width=1)
        x += sw + 4
    s.d.rectangle([60, 200 + sh + 2, 1780, 200 + sh + 6], fill=rgb(INK))
    s.foot("Every page linked into Source Library, plus the pages of type 'source', in alphabetical order.", f"Each spine is a strip cut from the middle of that page's hero. Map build of {MAPDATE}.")
    s.save("Source Library — the shelf.png")
    return len(mem)


# 4 ── Project Stewardship System: waiting on an ear ────────────────────────
def ears():
    total, unheard, unopened = 121, 87, 19                     # the page's own numbers, from fleet reading 1 (2026-10-16)
    s = Sheet(760, "Waiting on an ear", "121 notes the stewards left saying 'this is still rough'. What each one is waiting for:"); c = 62
    ear = icon("Pauline Oliveros", c - 8)                       # her avatar is an ear
    for i in range(total):
        r, col = divmod(i, 27); x, y = 80 + col * c, 200 + r * c
        if i < unheard: s.paste(ear, (x, y), frame=RED, width=2)
        elif i < unheard + unopened: s.d.rectangle([x, y, x + c - 9, y + c - 9], outline=rgb(INK), width=3); s.text((x + (c - 8) / 2, y + (c - 8) / 2), "open", 14, INK2, "mm")
        else: s.d.rectangle([x, y, x + c - 9, y + c - 9], outline=rgb(RULE), width=2)
    y = 200 + 5 * c + 10
    s.text((80, y), f"{unheard} — nobody has listened to it yet", 24, RED, bold=True); s.text((80, y + 36), f"{unopened} — nobody has opened it in Max, Live or a browser", 24, INK, bold=True)
    s.text((80, y + 72), f"{total - unheard - unopened} — something else", 24, INK3)
    s.foot("Counts from the page, which reports the fleet reading of 2026-10-16; they are a month old. The ear is Pauline Oliveros's avatar.")
    s.save("Project Stewardship System — waiting on an ear.png")


# 5 ── BBS Blackboard: nothing is ever erased ───────────────────────────────
def board():
    rows = []
    for l in open(os.path.join(ROOT, "_ops/swarm/persistent/blackboard.jsonl")):
        try: o = json.loads(l); rows.append((str(o.get("ts", ""))[:10], o.get("type") or "?"))
        except ValueError: pass
    rows.sort(); pal = {"BROADCAST": INK3, "REPLY": "#2b5fb0", "RESOURCE_REQUEST": RED, "RESOURCE_GRANT": "#3a7d2c", "FLAG": "#a8730a", "PROOF": "#6a47b8", "RETRACT": INK}
    cols, c = 70, 24; nrows = math.ceil(len(rows) / cols); s = Sheet(210 + nrows * c + 190, "Nothing is ever erased", f"Every message on the palace's blackboard, in the order it was written: {len(rows):,} of them.")
    last = None
    for i, (d, ty) in enumerate(rows):
        r, col = divmod(i, cols); x, y = 150 + col * c, 200 + r * c
        s.d.rectangle([x, y, x + c - 5, y + c - 5], fill=rgb(pal.get(ty, RULE)))
        if d[:7] != last and col < cols: s.text((140, y + 9), d[:7], 17, INK2, "rm"); last = d[:7]
    y = 200 + nrows * c + 24; x = 150; cnt = collections.Counter(t for _, t in rows)
    for ty, n in cnt.most_common(7):
        s.d.rectangle([x, y, x + 20, y + 20], fill=rgb(pal.get(ty, RULE))); lab = f"{ty.lower().replace('_', ' ')} {n}"; s.text((x + 28, y - 1), lab, 19, INK2); x += 50 + 11.5 * len(lab)
    s.foot("One square per message; only its date and type were read, never its words. The month label marks where each month begins.",
           f"Read from the live board on 2026-11-10. A retraction is a new black square: the thing it retracts is still there above it.")
    s.save("BBS Blackboard — nothing is ever erased.png")
    return len(rows), dict(cnt)


# 6 ── Baton Ceremony: batons in the air ────────────────────────────────────
def batons():
    out = subprocess.run(["node", "_ops/stigmergy/list-handoffs.mjs"], cwd=ROOT, capture_output=True, text=True).stdout
    out = re.sub(r"\x1b\[[0-9;]*m", "", out); cards = re.findall(r"^● (.+?)\s+\[(\S+) · (.+?)\]", out, re.M)
    def weeks(a):
        m = re.match(r"(\d+)([dwmh])", a); return (int(m[1]) * {"h": 1 / 168, "d": 1 / 7, "w": 1, "m": 4.3}[m[2]]) if m else 0
    cards.sort(key=lambda c: -weeks(c[1])); S = 150
    s = Sheet(790, "Batons in the air", f"The {len(cards)} handoffs open on the board today, oldest first. Each is a move somebody packed and nobody has caught.")
    for i, (title, age, page) in enumerate(cards):
        r, col = divmod(i, 10); x, y = 80 + col * 170, 200 + r * 235; t = title if title in NODES else page
        old = weeks(age) >= 3
        s.paste(icon(t, S), (x, y), frame=RED if old else INK, width=4 if old else 2)
        s.text((x + S / 2, y + S + 10), age, 22, RED if old else INK, "ma", True); s.text((x + S / 2, y + S + 38), short(title, 13), 17, INK3, "ma")
    s.foot("Read from the board's own handoff list on 2026-11-10. Red: three weeks or more in the air. An open baton is not yet a fumble;",
           "the ceremony's word 'fumble' is for a baton that was claimed and then never closed.")
    s.save("Baton Ceremony — batons in the air.png")
    return cards


# 7 ── Epictetus: against the room ──────────────────────────────────────────
def epictetus():
    c = "Epictetus"; ring = [(t, ty, o) for t, ty, o in links[c] if ty != "connects-to"]
    ring.sort(key=lambda r: (r[1] != "contradicts", r[1], r[0])); n = len(ring)
    s = Sheet(1420, "Against the room", "Epictetus and every page that holds a named link with him."); cx, cy, S = 920, 740, 140
    for i, (t, ty, o) in enumerate(ring):
        a = -math.pi / 2 + 2 * math.pi * i / n; x, y = cx + 500 * math.cos(a), cy + 480 * math.sin(a); red = ty == "contradicts"
        s.line([(cx, cy), (x, y)], RED if red else INK3, 4 if red else 2)
        mx, my = cx + 290 * math.cos(a), cy + 280 * math.sin(a); tw = s.d.textlength(ty, font=font(17, True))
        s.d.rectangle([mx - tw / 2 - 6, my - 13, mx + tw / 2 + 6, my + 13], fill=rgb(PAPER)); s.text((mx, my), ty, 17, RED if red else INK3, "mm", True)
        s.paste(icon(t, S), (x - S / 2, y - S / 2), frame=RED if red else INK, width=3 if red else 2); s.text((x, y + S / 2 + 8), short(t, 16), 17, INK2, "ma")
    s.paste(icon(c, 240), (cx - 120, cy - 120), frame=INK, width=4)
    k = sum(1 for r in ring if r[1] == "contradicts")
    q = collections.Counter(); [q.update([a, b]) for a, b in ((e["source"], e["target"]) for e in EDGES if e["type"] == "contradicts")]
    rank = [t for t, _ in q.most_common() if NODES[t]["type"] == "person"]; top = rank[0] == c and q[rank[0]] > q[rank[1]]
    s.foot(f"{k} of his {n} named links are 'contradicts'" + (": more quarrels than any other person in the palace." if top else f" (the most among the people is {rank[0]}, with {q[rank[0]]}).") + f" Map build of {MAPDATE}.",
           "He was owned, lame, and exiled, and taught that none of it could touch what was his. The room has objections.")
    s.save("Epictetus — against the room.png")
    return k, n


# 8 ── Douglas Hofstadter: a strange loop ───────────────────────────────────
def droste():
    src = Image.open(asset("Douglas Hofstadter", "hero")).convert("RGB"); W0 = 1680; img = src.resize((W0, round(src.height * W0 / src.width)), Image.LANCZOS)
    out = img.copy(); k = 0.42; fx, fy = 0.52, 0.5                     # each copy sits inside the last, a little off-centre
    for depth in range(7):
        w, h = round(out.width * k), round(out.height * k); small = out.resize((w, h), Image.LANCZOS)
        framed = ImageOps.expand(small, border=3, fill=rgb(PAPER)); nxt = img.copy()
        nxt.paste(framed, (round(img.width * fx - w / 2), round(img.height * fy - h / 2))); out = nxt
    s = Sheet(out.height + 330, "A strange loop", "The picture at the top of Hofstadter's page, hung inside itself.")
    s.paste(out, (80, 180), frame=INK, width=3)
    s.foot("His hero, pasted into its own middle seven times over. Follow it inward and you never reach a picture that is not this picture:",
           "'a paradoxical level-crossing feedback loop'. A picture of self-reference, not of a self.")
    s.save("Douglas Hofstadter — a strange loop.png")


# 9 ── Pages as Agents: every page is asleep until it is read ───────────────
def asleep():
    titles = sorted(NODES, key=str.lower); cols, T = 23, 76; rows = math.ceil(len(titles) / cols)
    s = Sheet(200 + rows * T + 110, "Asleep until read", f"All {len(titles)} pages. One of them is awake, because you are reading it.")
    for i, t in enumerate(titles):
        r, c = divmod(i, cols); x, y = 46 + c * T, 190 + r * T; me = t == "Pages as Agents"
        s.paste(icon(t, T - 8, dim=not me), (x, y), frame=RED if me else None, width=5)
    s.foot("Every avatar in the palace, greyed, except this page's own. The page's claim is that loading any one of them wakes it;",
           f"which one is lit depends only on which one you opened. Map build of {MAPDATE}.")
    s.save("Pages as Agents — asleep until read.png")


# 10 ── Martin Buber: the between ───────────────────────────────────────────
def between():
    ic = Image.open(asset("Martin Buber", "icon")).convert("RGB").resize((620, 620), Image.LANCZOS)
    s = Sheet(1010, "The between", "Buber's avatar is two faces and the shape that is neither of them.")
    for i, (x, lab, sub) in enumerate(((110, "I — IT", "look at the faces: two things, each with an edge, facing a gap"), (1110, "I — THOU", "look at the gap: one shape, and it belongs to neither face"))):
        im = ic.copy()
        if i == 1:
            a = np.asarray(im).astype(np.float32); lum = a.mean(axis=2, keepdims=True); mask = (lum > 150).astype(np.float32)   # the light middle shape
            red = np.array(rgb(RED), dtype=np.float32); a = a * (1 - 0.55 * mask) + red * 0.55 * mask; im = Image.fromarray(a.astype(np.uint8))
        s.paste(im, (x, 190), frame=INK, width=3); s.text((x, 830), lab, 28, RED if i else INK, bold=True); s.text((x, 870), sub, 20, INK3)
    s.text((920, 500), "same picture", 22, INK3, "mm")
    s.foot("The right-hand copy tints the avatar's light region red and changes nothing else. Reading the vase as 'the between'",
           "is mine; the page says the meeting 'belongs to neither party; it happens in the space between them'.")
    s.save("Martin Buber — the between.png")


ALL = [stoa, bridges, shelf, ears, board, batons, epictetus, droste, asleep, between]
if __name__ == "__main__":
    want = sys.argv[1:]
    for f in ALL:
        if not want or f.__name__ in want: print("→", f.__name__, str(f())[:400])
