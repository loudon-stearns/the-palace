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


def footw(s, *lines, width=130):
    """A local footer for the remakes: wraps at 130 characters so nothing runs off the 1,840 px sheet."""
    import textwrap
    ws = [w for l in lines for w in textwrap.wrap(l, width)]
    for i, w in enumerate(ws): s.d.text((80, s.h - 48 - 30 * (len(ws) - 1 - i)), w, font=font(21), fill=rgb(INK3))
    return len(ws)


# 1 ── Stoicism: three teachers, three tools ────────────────────────────────
def stoa():
    # Remade after challenge E: each discipline sits under the teacher the page ties it to, and only those two ties are drawn.
    s = Sheet(1150, "Three teachers, three tools", "Which teacher the page ties to which of its three disciplines."); S = 250
    T = [("Seneca", "a statesman"), ("Epictetus", "a slave"), ("Marcus Aurelius", "an emperor")]; xs = [330, 795, 1260]
    for (t, sub), x in zip(T, xs):
        s.paste(icon(t, S), (x, 200), frame=INK, width=3); s.text((x + S / 2, 200 + S + 12), t, 24, INK, "ma", True); s.text((x + S / 2, 200 + S + 46), sub, 22, INK3, "ma")
    mid = (xs[1] + S + xs[2]) / 2                                # between Epictetus and Marcus: the copy by the bed, and the contradiction
    s.line([(xs[1] + S + 14, 262), (xs[2] - 14, 262)], INK, 3); s.line([(xs[2] - 30, 250), (xs[2] - 14, 262), (xs[2] - 30, 274)], INK, 3)
    s.text((mid, 222), "kept his words", 22, INK2, "ma"); s.text((mid, 272), "beside his bed", 22, INK2, "ma")
    ties = [(a, b) for a, b in (("Seneca", "Epictetus"), ("Epictetus", "Marcus Aurelius")) if has(a, b, "contradicts")]
    for a, b in ties:
        i = [t for t, _ in T].index(a); y = 325 if i == 0 else 392
        s.line([(xs[i] + S + 14, y), (xs[i + 1] - 14, y)], RED, 3); s.text(((xs[i] + S + xs[i + 1]) / 2, y + (-36 if i == 0 else 8)), "contradicts", 22, RED, "ma", True)
    tools = [("The Four Virtues", "wisdom, justice, courage, temperance", None),
             ("The Dichotomy of Control", "some things are up to us", ("discovered the fortress,", "the seed of this")),
             ("The View From Above", "the empire itself looks small", ("practices", "looking down"))]
    for (t, sub, why), x in zip(tools, xs):
        if why:
            s.line([(x + S / 2, 200 + S + 88), (x + S / 2, 660)], INK, 3)
            s.text((x + S / 2 + 18, 566), why[0], 22, INK2); s.text((x + S / 2 + 18, 596), why[1], 22, INK2)
        else:
            s.text((x + S / 2, 566), "the page names", 22, INK3, "ma"); s.text((x + S / 2, 596), "no one teacher", 22, INK3, "ma")
        s.paste(icon(t, 200), (x + 25, 660), frame=INK); s.text((x + S / 2, 872), t, 24, INK, "ma", True); s.text((x + S / 2, 906), sub, 21, INK3, "ma")
    s.text((80, 200), "THE", 22, RED, bold=True); s.text((80, 228), "PEOPLE", 22, RED, bold=True); s.text((80, 660), "THE", 22, RED, bold=True); s.text((80, 688), "DISCIPLINES", 22, RED, bold=True)
    footw(s, "Each gloss under a name is the page's own wording. The two black rules are the page's ties: the fortress Epictetus discovered is 'the seed of' the dichotomy, and 'Marcus practices looking down'.",
          f"The two red ties are 'contradicts' links in the map build of {MAPDATE}. They are declared on the people's pages, not in this page's text.")
    s.save("Stoicism — three teachers, three tools.png")
    return ties


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
    """Remade after challenge E: the page's own role list, 36 names, each a lettered spine; a name with no page is a blank spine."""
    body = open(os.path.join(ROOT, "Source Library.md")).read().split("## Organization by Role")[1].split("## How Sources Connect")[0]
    short_role = {"Systems Thinkers": "SYSTEMS", "Philosophers of Practice": "PRACTICE", "Musicians & Sound Thinkers": "SOUND", "Artists & Makers": "MAKERS",
                  "Writers on Craft & Creativity": "WRITERS", "Filmmakers": "FILM", "Scientists & Classical Sources": "SCIENCE"}
    groups = []
    for l in body.splitlines():
        if l.startswith("### "): groups.append((l[4:].strip(), []))
        m = re.match(r"- \*+(.+?)\*+", l)
        if m: groups[-1][1].append(m.group(1).split(",")[0].strip("* "))
    names = [n for _, g in groups for n in g]; paged = [n for n in names if n in NODES and os.path.exists(os.path.join(ROOT, NODES[n]["path"]))]
    assert len(paged) == sum(os.path.exists(os.path.join(ROOT, "People", n + ".md")) for n in names)      # counted a second way, from the People folder
    sw, gap, ggap, sh, top, strip = 40, 4, 26, 510, 190, 170
    s = Sheet(920, "The shelf", f"The {len(names)} names in the page's role list. {len(paged)} have a page in the palace; {len(names) - len(paged)} are still only a name.")
    x = (1840 - (len(names) * (sw + gap) - gap + (len(groups) - 1) * ggap)) // 2
    def spine_label(name, col, bold):
        f = font(22, bold); w = int(s.d.textlength(name, font=f)) + 8; im = Image.new("RGB", (w, 30), rgb(PAPER)); ImageDraw.Draw(im).text((4, 15), name, font=f, fill=rgb(col), anchor="lm")
        return im.rotate(270, expand=True)
    for role, g in groups:
        x0 = x
        for n in g:
            has_page = n in paged
            if has_page:
                h = Image.open(asset(n, "hero")).convert("RGB"); h = h.resize((round(h.width * strip / h.height), strip), Image.LANCZOS); cx = h.width // 2
                s.im.paste(h.crop((cx - sw // 2, 0, cx + sw // 2, strip)), (x, top)); s.d.line([(x, top + strip), (x + sw - 1, top + strip)], fill=rgb(INK), width=2)
                s.d.rectangle([x - 1, top - 1, x + sw, top + sh], outline=rgb(INK), width=2)
            else:
                for yy in range(top, top + sh, 14):                                   # a dashed outline: the place is kept, the book is not there
                    s.d.line([(x - 1, yy), (x - 1, min(top + sh, yy + 7))], fill=rgb(INK3), width=2); s.d.line([(x + sw, yy), (x + sw, min(top + sh, yy + 7))], fill=rgb(INK3), width=2)
                s.d.line([(x - 1, top - 1), (x + sw, top - 1)], fill=rgb(INK3), width=2)
            lab = spine_label(n, INK if has_page else INK3, has_page); s.im.paste(lab, (x + (sw - lab.width) // 2, top + strip + 16))
            x += sw + gap
        x1 = x - gap; k = sum(n in paged for n in g)
        s.text(((x0 + x1) / 2, top + sh + 24), short_role[role], 21, INK, "ma", True); s.text(((x0 + x1) / 2, top + sh + 54), f"{k} of {len(g)}", 22, RED if k < len(g) else INK2, "ma", True)
        x += ggap - gap
    s.d.rectangle([60, top + sh + 2, 1780, top + sh + 7], fill=rgb(INK))
    footw(s, "Each spine is one bullet of 'Organization by Role', in the page's order. A solid spine carries a strip cut from the middle of that page's hero; a dashed one has no page yet.",
          f"Map build of {MAPDATE}. The shelf labels shorten the page's seven headings. The red counts are the shelves with gaps.")
    s.save("Source Library — the shelf.png")
    return len(names), len(paged), [(short_role[r], sum(n in paged for n in g), len(g)) for r, g in groups]


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
    """Remade after challenge E: squares in true time order. Reads only each line's `ts` and `type`; no message text is read, kept or drawn."""
    import datetime
    UTC = datetime.timezone.utc; cut = datetime.datetime(2026, 11, 11, tzinfo=UTC); rows = []
    for l in open(os.path.join(ROOT, "_ops/swarm/persistent/blackboard.jsonl")):
        if not l.strip(): continue
        try: o = json.loads(l)
        except ValueError: continue
        ts, ty = o.get("ts"), o.get("type") or "?"; del o
        try: t = datetime.datetime.fromisoformat(str(ts).replace("Z", "+00:00")).astimezone(UTC)   # the board mixes -04:00 and Z stamps
        except ValueError: continue
        if t < cut: rows.append((t, ty))
    rows.sort(key=lambda r: r[0])
    pal = {"BROADCAST": RULE, "REPLY": "#2b5fb0", "RESOURCE_REQUEST": RED, "RESOURCE_GRANT": "#3a7d2c", "FLAG": "#d08a00", "PROOF": "#6a47b8", "RETRACT": INK, "SESSION_INIT": "#17a3a3", "SESSION_CLOSE": "#17a3a3"}
    cols, c = 70, 23; nrows = math.ceil(len(rows) / cols); top = 200
    s = Sheet(top + nrows * c + 300, "Appended, never edited", f"The {len(rows):,} messages on the palace's blackboard since it was re-seeded on 2026-06-16, in the order of their time stamps.")
    marks = collections.OrderedDict()
    for i, (t, ty) in enumerate(rows):
        r, col = divmod(i, cols); x, y = 190 + col * c, top + r * c
        s.d.rectangle([x, y, x + c - 5, y + c - 5], fill=rgb(pal.get(ty, FILL)))
        m = t.strftime("%b")
        if m not in [v for vs in marks.values() for v in vs]:
            marks.setdefault(r, []).append(m); s.d.rectangle([x - 4, y - 2, x - 2, y + c - 3], fill=rgb(INK))      # a black bar where a month begins
    for r, ms in marks.items(): s.text((176, top + r * c + 9), ", ".join(ms), 21, INK2, "rm")
    cnt = collections.Counter(t for _, t in rows); y = top + nrows * c + 26; x = 190
    for k, (ty, n) in enumerate(cnt.most_common()):
        lab = f"{ty.lower().replace('_', ' ')} {n:,}"; w = 34 + s.d.textlength(lab, font=font(21)) + 40
        if x + w > 1800: x = 190; y += 36
        s.d.rectangle([x, y, x + 22, y + 22], fill=rgb(pal.get(ty, FILL))); s.text((x + 32, y - 1), lab, 21, INK2); x += w
    footw(s, "One square per message. Only each message's time and kind were read, never its words. Read 2026-11-11, messages stamped before that day (UTC). The colours are the maker's.",
          f"The {cnt['RETRACT']} black squares are retractions. A retraction is a new message; the challenger found all {cnt['RETRACT']} retracted messages still on the board. 'Never edited' is the page's rule for agents. Git shows the file itself re-seeded on 2026-06-16, one malformed line removed on 2026-07-08, and 54 lines rewritten on 2026-09-25.")
    s.save("BBS Blackboard — nothing is ever erased.png")
    return len(rows), dict(cnt), {r: m for r, m in marks.items()}


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
    """Remade after challenge E: all ten links drawn, each with the name its page gives it; the tie with Heidegger said plainly."""
    import textwrap
    c = "Epictetus"; mine = [(e["target"], e["type"], e.get("label") or "", True) for e in EDGES if e["source"] == c] + [(e["source"], e["type"], e.get("label") or "", False) for e in EDGES if e["target"] == c]
    assert len(mine) == len(links[c])                                                         # counted a second way, from the adjacency built at the top
    red = [m for m in mine if m[1] == "contradicts"]; rest = [m for m in mine if m[1] != "contradicts"]
    red.sort(key=lambda m: (m[0] != "Marcus Aurelius", not m[3], m[0])); rest.sort(key=lambda m: (m[1] != "connects-to", m[1], m[0]))
    rowsn = max(len(red), len(rest)); S, pitch, top = 130, 185, 215; cx, cy = 920, top + ((rowsn - 1) * pitch + S) / 2
    s = Sheet(top + (rowsn - 1) * pitch + S + 215, "Pressed from five sides", f"Epictetus and all {len(mine)} of his links. {len(red)} are contradictions, each named here as its link names it.")
    s.text((1350, 172), f"CONTRADICTS · {len(red)}", 22, RED, "ra", True); s.text((490, 172), f"EVERY OTHER LINK · {len(rest)}", 22, INK, "la", True)
    for side, col in ((rest, 0), (red, 1)):
        for k, (t, ty, lab, out) in enumerate(side):
            y = top + k * pitch; ix = 1220 if col else 490; isred = ty == "contradicts"
            s.line([(cx, cy), (ix + S / 2, y + S / 2)], RED if isred else INK3, 4 if isred else 2)
    for side, col in ((rest, 0), (red, 1)):
        for k, (t, ty, lab, out) in enumerate(side):
            y = top + k * pitch; ix = 1220 if col else 490; isred = ty == "contradicts"; tx, an = (ix + S + 22, "la") if col else (ix - 22, "ra")
            s.paste(icon(t, S), (ix, y), frame=RED if isred else INK, width=4 if isred else 2)
            s.text((tx, y - 4), t, 23, INK, an, True)
            s.text((tx, y + 28), ty if out else f"{ty}, from {t.split()[0]}'s page", 21, RED if isred else INK3, an)
            for n, w in enumerate(textwrap.wrap(lab.replace("-", " "), 30)): s.text((tx, y + 58 + 28 * n), w, 21, INK2, an)
    s.paste(icon(c, 260), (cx - 130, cy - 130), frame=INK, width=4)
    q = collections.Counter(); [q.update([e["source"], e["target"]]) for e in EDGES if e["type"] == "contradicts"]
    people = [t for t in NODES if NODES[t]["type"] == "person"]; level = sorted(t for t in people if t != c and q[t] == q[c]); more = [t for t in people if q[t] > q[c]]
    rank = ("No other person page has as many." if not level and not more else
            f"Among the {len(people)} person pages only {' and '.join(level)} has as many." if level and not more else f"{' and '.join(more)} has more.")
    footw(s, f"All {len(mine)} links that touch Epictetus in the map build of {MAPDATE}; none left out. {len(red)} of {len(mine)} are 'contradicts'. {rank}",
          "The small words under each name are the link's label, hyphens taken out. The page's text names only Marcus among the five; three more are in its links and Seneca's is on Seneca's page. Left and right, and the order down each side, are the maker's.")
    s.save("Epictetus — against the room.png")
    return len(red), len(mine), level, more


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
    """Remade after challenge E: the I-It / I-Thou labels are gone (the page never ties its two modes to this picture); the tint is owned as the maker's act."""
    ic = Image.open(asset("Martin Buber", "icon")).convert("RGB").resize((620, 620), Image.LANCZOS)
    s = Sheet(1040, "The between", "'The meeting belongs to neither party; it happens in the space between them.'")
    for i, (x, lab) in enumerate(((110, "the avatar, untouched"), (1110, "the light between, tinted red"))):
        im = ic.copy()
        if i == 1:
            a = np.asarray(im).astype(np.float32); lum = a.mean(axis=2, keepdims=True); mask = (lum > 150).astype(np.float32)   # the light middle shape
            red = np.array(rgb(RED), dtype=np.float32); a = a * (1 - 0.55 * mask) + red * 0.55 * mask; im = Image.fromarray(a.astype(np.uint8))
        s.paste(im, (x, 190), frame=INK, width=3); s.text((x + 310, 828), lab, 24, RED if i else INK, "ma", True)
    s.text((920, 500), "same picture", 22, INK3, "mm")
    footw(s, "Only the tint differs: every pixel lighter than a set level is blended 55 percent toward red. The avatar was drawn to a brief that asks for 'a bright vertical GAP of light held between them'.",
          "The tint is the maker's. It gives the between an edge and makes it a thing. The page says the meeting 'relapses into a thing the instant you try' to store it.")
    s.save("Martin Buber — the between.png")


ALL = [stoa, bridges, shelf, ears, board, batons, epictetus, droste, asleep, between]
if __name__ == "__main__":
    want = sys.argv[1:]
    for f in ALL:
        if not want or f.__name__ in want: print("→", f.__name__, str(f())[:400])
