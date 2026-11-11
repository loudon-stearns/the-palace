#!/usr/bin/env python3
"""Light round 2026-11, second batch — fourteen pieces built from the palace's own heroes and avatars.
Run from this folder: python3 make-icon-pieces.py [name ...]   (no names = all)
Every count and link is read from the map build named in lib.py; nothing here is drawn by hand."""
import math, os, re, subprocess, sys, io, collections
import numpy as np
from PIL import Image, ImageDraw, ImageOps
from lib import *

deg = collections.Counter()
for e in EDGES: deg[e["target"]] += 1


# 1 ── Hero and Avatar Maker: what survives at 24 pixels ────────────────────
def avatar_sizes():
    """Remade after the challenge: the whole hero is shrunk (no hidden crop), and nothing is called 'actual size'."""
    page = "Crystal Synthesizer"
    s = Sheet(1250, "What survives at 24 pixels", f"{page}'s hero and its avatar, each shrunk and then blown back up so you can see what is left.")
    h = hero(page, 800); s.paste(h, (80, 190), frame=INK); s.text((80, 190 + h.height + 14), "the hero, whole", 22, INK, bold=True)
    ic = icon(page, 340); s.paste(ic, (80, 660), frame=INK); s.text((440, 660), "the avatar", 22, INK, bold=True)
    full = Image.open(asset(page, "hero")).convert("RGB"); av = Image.open(asset(page, "icon")).convert("RGB")
    for col, px in enumerate((48, 24)):
        x = 1000 + col * 400
        small = full.resize((px, max(1, round(full.height * px / full.width))), Image.LANCZOS)
        big = small.resize((360, round(360 * small.height / small.width)), Image.NEAREST); s.paste(big, (x, 190), frame=INK)
        s.text((x, 190 + big.height + 12), f"shrunk to {px} px wide,", 20, INK3); s.text((x, 190 + big.height + 38), "then enlarged", 20, INK3)
        a = av.resize((px, px), Image.LANCZOS).resize((360, 360), Image.NEAREST); s.paste(a, (x, 660), frame=INK)
        s.text((x, 660 + 372), f"shrunk to {px} px, then enlarged", 20, INK3)
    s.foot("Both are the palace's real files, shrunk whole and enlarged pixel for pixel. The avatar's fine rays are gone at 24;",
           "its ring and its red stone are still there. The page's rule is about exactly that: linework vanishes, silhouette holds.")
    s.save("Hero and Avatar Maker — what survives at 24 pixels.png")


# 2 ── Leibniz: every jewel reflects every other ────────────────────────────
def mosaic():
    titles = [t for t in NODES if asset(t, "icon") and t != "Leibniz"]   # everyone but him
    T = 28; tiles = [np.asarray(icon(t, T), dtype=np.float32) for t in titles]
    means = np.array([t.mean(axis=(0, 1)) for t in tiles])
    src = Image.open(asset("Leibniz", "hero")).convert("RGB"); cols = 66; rows = round(cols * src.height / src.width)
    small = np.asarray(src.resize((cols, rows), Image.LANCZOS), dtype=np.float32)
    out = Image.new("RGB", (cols * T, rows * T)); rng = np.random.default_rng(1714); used = set()
    for r in range(rows):
        for c in range(cols):
            d = ((means - small[r, c]) ** 2).sum(axis=1)
            k = int(rng.choice(np.argsort(d)[:5]))            # one of the five nearest in colour, so no tile repeats in a block
            used.add(k)
            tile = tiles[k]                                       # the avatar as it is: no tint, no softening (the challenge showed it reads without)
            out.paste(Image.fromarray(np.clip(tile, 0, 255).astype(np.uint8)), (c * T, r * T))
    s = Sheet(out.height + 300, "Every jewel reflects every other", "The picture at the top of Leibniz's page, made of the palace's other pages.")
    s.paste(out, (0, 170))
    s.foot(f"{cols * rows:,} tiles drawn from {len(used)} of the palace's {len(titles)} avatars, each chosen only for how light or dark it is.",
           "Nothing is tinted. Step back and it is his page; step in and it is everyone else's.")
    s.save("Leibniz — every jewel reflects every other.png")
    return len(used)


# 3 ── Identity Molting: cast skins ─────────────────────────────────────────
def skins():
    pages = [("STIGMERGY", "STIGMERGY"), ("The Lens", "The Lens"), ("FOUR PILLARS", "FOUR PILLARS")]   # each wore its first face for weeks or months, then changed it in place
    s = Sheet(190 + 3 * 400 + 110, "Cast skins", "Three pages that wore one face, then grew another. The old one is still whole, in git.")
    for i, (path, t) in enumerate(pages):
        f = f"{path}/{t} — hero.png"
        hs = subprocess.run(["git", "log", "--reverse", "--format=%h %ad", "--date=short", "--", f], cwd=ROOT, capture_output=True, text=True).stdout.split("\n")
        h0, d0 = hs[0].split(); d1 = hs[-2].split()[1]
        old = Image.open(io.BytesIO(subprocess.run(["git", "show", f"{h0}:{f}"], cwd=ROOT, capture_output=True).stdout)).convert("RGB")
        w = 780; old = old.resize((w, round(old.height * w / old.width)), Image.LANCZOS); new = hero(t, w); y = 190 + i * 400
        s.paste(Image.blend(old, Image.new("RGB", old.size, rgb(PAPER)), 0.28), (80, y), frame=RULE)
        s.paste(new, (980, y), frame=INK)
        s.line([(880, y + 165), (960, y + 165)], INK3, 2); s.line([(946, y + 155), (960, y + 165), (946, y + 175)], INK3, 2)
        s.text((80, y + old.height + 12), f"{t} · shed · first worn {d0}", 20, INK3)
        s.text((980, y + new.height + 12), f"worn now · since {d1}", 20, INK2)
    s.foot("Old faces read from the palace's git history; the dates are the commits that set each hero.",
           "Calling a replaced hero a cast skin is my analogy: the page's sentence is about a person's public archive.")
    s.save("Identity Molting — cast skins.png")


# 4 ── Mixture of Experts: who gets called ──────────────────────────────────
def experts():
    order = sorted(NODES, key=lambda t: (-deg[t], t)); total = sum(deg.values())
    W = 1840; x, y, rowh = 80, 190, 0; s = Sheet(2300, "Who gets called", "Every page, sized by how many other pages link to it.")
    for t in order:
        side = int(22 + 17 * math.sqrt(deg[t]))
        if x + side > W - 80: x, y, rowh = 80, y + rowh + 8, 0
        s.paste(icon(t, side), (x, y)); x += side + 8; rowh = max(rowh, side)
    y += rowh + 40
    top = order[:10]; share = sum(deg[t] for t in top) / total; none = sum(1 for t in order if deg[t] == 0)
    s.text((80, y), f"The ten largest take {share:.0%} of all {total:,} links. {none} pages have no typed link pointing at them.", 24, INK)
    s.text((80, y + 36), "Largest: " + ", ".join(f"{t} ({deg[t]})" for t in order[:5]) + ".", 21, INK3)
    s.text((80, y + 68), f"Typed links between pages, map build of {MAPDATE}. This is the shape the page warns of, not yet the thing: its 'collapse' is one or two experts doing all the work, and the top two here take {(deg[order[0]] + deg[order[1]]) / total:.0%}.", 21, INK3)
    s.im = s.im.crop((0, 0, W, y + 130)); s.save("Mixture of Experts — who gets called.png")
    return round(share, 3), none


# 5 ── The Fortress and the Threshold: four poles ───────────────────────────
def poles():
    """Remade after the challenge: no line runs through a centre mark, and the words say only what the page says."""
    P = {"Stoicism": ((920, 230), "THE FORTRESS"), "Confucianism": ((1400, 660), "THE THRESHOLD"),
         "Spinoza Conatus": ((920, 1090), "THE STRIVING"), "The Drift": ((440, 660), "NO ARCHITECTURE")}
    s = Sheet(1640, "Four poles", "The fortress and the threshold, the striving between them, and a fourth this page has only begun to hold."); S = 290
    pairs = {(e["source"], e["target"]) for e in EDGES if e["type"] == "contradicts"}; drawn = []
    for a in P:
        for b in P:
            if (a, b) in pairs:
                (ax, ay), (bx, by) = P[a][0], P[b][0]; s.line([(ax, ay + S // 2), (bx, by + S // 2)], RED, 4); drawn.append((a, b))
    for t, ((x, y), name) in P.items():
        s.paste(icon(t, S), (x - S // 2, y), frame=INK, width=3); s.text((x, y + S + 14), name, 24, INK, "ma", True); s.text((x, y + S + 48), t, 21, INK3, "ma")
    s.paste(icon("The Fortress and the Threshold", 130), (80, 190), frame=INK); s.text((226, 214), "this page", 21, INK2); s.text((226, 244), "names the first two", 19, INK3)
    s.foot(f"Each red line is a real 'contradicts' link in the map build of {MAPDATE}: {len(drawn)} among these four. Only the Drift contradicts the striving.",
           "'The striving' and 'no architecture' paraphrase the page. Palace Philosophies calls the site a quadruple; this page says the fourth is not yet on its map.")
    s.save("The Fortress and the Threshold — four poles.png")
    return drawn


# 6 ── Excellent Adventure: who you can bring into the room ─────────────────
def guests():
    """Remade after the challenge: the years are read from each page's own frontmatter, and names are not cut."""
    import yaml
    people = [t for t, n in NODES.items() if n["type"] == "person"]; born = {}
    for t in people:
        fm = frontmatter(t, 20000); y = yaml.safe_load(fm.split("\n---")[0].lstrip("-")).get("born_year")
        born[t] = y
    tie = {"Agnes Martin": .1, "John Cage": .7, "Douglas Hofstadter": .1, "Annie Dillard": .3, "Julia Cameron": .2, "Brian Eno": .4}   # same-year pairs, by birthday
    order = sorted((t for t in people if born[t] is not None), key=lambda t: born[t] + tie.get(t, 0)); missing = [t for t in people if born[t] is None]
    show = lambda t: ("c. 600 BCE?" if t == "Lao Tzu" else f"{-born[t]} BCE" if born[t] < 0 else str(born[t]))
    s = Sheet(1190, "Who you can bring into the room", f"The {len(people)} people the palace has a page for, in the order they were born. Pull up a chair.")
    S, per = 170, 9
    for i, t in enumerate(order):
        r, c = divmod(i, per); x = 80 + c * 190; y = 200 + r * 300
        s.paste(icon(t, S), (x, y), frame=INK); s.text((x + S // 2, y + S + 10), show(t), 21, RED, "ma", True)
        w = t.split(); a = " ".join(w[:-1]) if len(t) > 14 and len(w) > 1 else t; b = w[-1] if a != t else ""
        s.text((x + S // 2, y + S + 38), a, 17, INK3, "ma"); s.text((x + S // 2, y + S + 60), b, 17, INK3, "ma")
    i = len(order); r, c = divmod(i, per); x = 80 + c * 190; y = 200 + r * 300
    s.d.rectangle([x, y, x + S, y + S], outline=rgb(RED), width=3); s.text((x + S // 2, y + S // 2), "you", 30, RED, "mm", True); s.text((x + S // 2, y + S + 10), "now", 21, RED, "ma", True)
    s.foot("Birth years are each page's own. Lao Tzu's is traditional and uncertain, which his page does not mark.",
           "These are the guests who have a page. The mode invites any figure, event or tradition: a place to start, not the limit." + (f" No year: {missing}." if missing else ""))
    s.save("Excellent Adventure — who you can bring into the room.png")
    return {t: born[t] for t in order[:4]}, missing


# 7 ── Dialectic: every contradiction in the palace ─────────────────────────
def contradictions():
    """Remade after the challenge: the subhead says what a 'contradicts' link is, and the names are whole."""
    pairs = [(e["source"], e["target"]) for e in EDGES if e["type"] == "contradicts"]
    cols, S, cw, ch = 4, 140, 430, 232; rows = math.ceil(len(pairs) / cols)
    s = Sheet(200 + rows * ch + 110, "Every contradiction in the palace", f"{len(pairs)} pairs the map holds in contradiction, both kept.")
    for i, (a, b) in enumerate(pairs):
        r, c = divmod(i, cols); x = 80 + c * cw; y = 190 + r * ch
        s.paste(icon(a, S), (x, y), frame=INK); s.paste(icon(b, S), (x + S + 50, y), frame=INK); s.text((x + S + 25, y + S // 2), "≠", 36, RED, "mm", True)
        s.text((x + S // 2, y + S + 8), short(a, 15), 16, INK3, "ma"); s.text((x + S + 50 + S // 2, y + S + 8), short(b, 15), 16, INK3, "ma")
    s.foot(f"Every 'contradicts' link between two pages in the map build of {MAPDATE}. One page declares each; here it means a tension worth keeping, not an error.",
           "Palace Philosophies: 'Contradictions are dispatchable as Dialectics.' The pairs of people and traditions are the ones ready to be put in a room.")
    s.save("Dialectic — every contradiction in the palace.png")
    return len(pairs)


# 8 ── Hyperdimensional Prism: where the pillars cross ──────────────────────
def pillars():
    """Remade after the challenge: frontmatter is read as YAML (the first parser missed a page), and this page is marked."""
    import yaml
    order = ["creation", "tools", "philosophy", "practice"]; groups = collections.defaultdict(list); none = []
    for t in NODES:
        try: fm = yaml.safe_load(frontmatter(t, 40000).split("\n---")[0].lstrip("-")) or {}
        except Exception: fm = {}
        ps = fm.get("pillars") or []; ps = [str(p).lower() for p in (ps if isinstance(ps, list) else [ps])]
        key = tuple(p for p in order if p in ps)
        (groups[key].append(t) if key else none.append(t))
    me = "Hyperdimensional Prism"
    s = Sheet(3000, "Four shadows of one thing", "Every page, sorted by which of the four pillars it names. The red frame is this page."); y = 190; S = 44
    for k in (4, 3, 2, 1):
        keys = sorted((g for g in groups if len(g) == k), key=lambda g: -len(groups[g]))
        s.text((80, y), {4: "ALL FOUR", 3: "THREE", 2: "TWO", 1: "ONE"}[k] + f"  ·  {sum(len(groups[g]) for g in keys)} pages", 24, RED if k == 4 else INK, bold=True); y += 44
        for g in keys:
            s.text((80, y + 10), " + ".join(g), 19, INK3); x = 620
            for t in sorted(groups[g]):
                if x + S > 1760: x = 620; y += S + 5
                s.paste(icon(t, S), (x, y), frame=RED if t == me else None, width=4); x += S + 5
            s.text((1770, y + 10), str(len(groups[g])), 19, INK2, "la"); y += S + 16
        y += 22
    all4 = len(groups.get(tuple(order), [])); kinds = collections.Counter(NODES[t]["type"] for t in none)
    s.text((80, y), f"{all4} pages name all four. {len(none)} name none ({', '.join(f'{v} {k}s' for k, v in kinds.most_common())}), which the schema does not ask of them.", 21, INK3)
    s.text((80, y + 30), f"A census of how each page's author tagged it, read from frontmatter on 2026-11-10. It shows the tagging, not whether the tags are right.", 21, INK3)
    s.im = s.im.crop((0, 0, 1840, y + 90)); s.save("Hyperdimensional Prism — four shadows of one thing.png")
    return all4, len(none), {" + ".join(k): len(v) for k, v in groups.items()}, [k for k, v in groups.items() if me in v]


# 9 ── Four Pillars of Enchanted Agency: what a page wants at each age ──────
def stages():
    table = [("seed", "Creation", "I want to come fully into being"), ("sprout", "Tools (enabling)", "I want to connect"),
             ("growing", "Tools + Philosophy", "I want to act, and be a good citizen"), ("mature", "Philosophy", "I want to stay current"),
             ("fruiting", "Creation, again", "I want to generate offspring"), ("dormant", "Practice", "I want to state my revival needs")]
    by = collections.defaultdict(list)
    for t, n in NODES.items(): by[n["stage"]].append(t)
    s = Sheet(1180, "What a page wants at each age", "The six stages of a page's life, with the pages living each one today.")
    cx, cy, R = 920, 1010, 760
    pts = []
    for i, (st, pillar, want) in enumerate(table):
        a = math.radians(168 - i * 31.2); x, y = cx + R * math.cos(a), cy - R * math.sin(a); pts.append((x, y))
    s.line(pts, RULE, 3)
    for (x, y), (st, pillar, want) in zip(pts, table):
        ts = sorted(by[st], key=lambda t: -deg[t])[:9]; S = 58
        s.d.rectangle([x - 97, y - 97, x + 93, y + 93], fill=rgb(PAPER))
        for j, t in enumerate(ts):
            r, c = divmod(j, 3); s.paste(icon(t, S), (x - 93 + c * 62, y - 93 + r * 62))
        s.d.rectangle([x - 97, y - 97, x + 93, y + 93], outline=rgb(INK), width=2)
        s.text((x, y + 104), st.upper(), 23, INK, "ma", True); s.text((x, y + 134), f"{len(by[st])} pages", 20, RED, "ma", True)
        s.text((x, y + 162), pillar, 18, INK2, "ma"); s.text((x, y + 186), f"“{want}”", 16, INK3, "ma")
    other = sum(len(v) for k, v in by.items() if k not in [t[0] for t in table])
    s.foot(f"Stage, pillar and wish are the page's own table, the wishes shortened. Counts and avatars from the map build of {MAPDATE}: up to nine",
           f"per stage, most-linked first. {other} pages sit outside the six (foundational, composting, or no stage).")
    s.save("Four Pillars of Enchanted Agency — what a page wants at each age.png")
    return {k: len(v) for k, v in by.items()}


# 10 ── Revival Ceremony: the sleepers ──────────────────────────────────────
def sleepers():
    asleep = sorted(t for t, n in NODES.items() if n["stage"] in ("dormant", "composting") or n["type"] == "spore")
    w = 400; s = Sheet(760, "The sleepers", f"The {len(asleep)} pages asleep in the palace today. Only one rite wakes them.")
    for i, t in enumerate(asleep):
        x = 80 + i * (w + 26); h = hero(t, w) if asset(t, "hero") else icon(t, w)
        h = Image.blend(ImageOps.grayscale(h).convert("RGB"), Image.new("RGB", h.size, rgb(PAPER)), 0.45)
        s.paste(h, (x, 200), frame=RULE)
        s.text((x, 200 + h.height + 14), t, 22, INK, bold=True)
        n = NODES[t]; s.text((x, 200 + h.height + 46), f"{n['type']} · {n['stage'] or 'no stage'}", 19, INK3)
        s.text((x, 200 + h.height + 74), f"last used {n.get('last_used') or 'not in 90 days'}", 19, INK3)
    s.text((80, 560), "Four ways in, and nothing else:", 22, INK, bold=True)
    for i, d in enumerate(("Loudon says “revive”", "a Spore Check decides it", "a Daily Page morning decides it", "he grants a steward's request")):
        x = 80 + i * 426; s.d.rectangle([x, 600, x + 400, 660], outline=rgb(RED), width=2); s.text((x + 200, 630), d, 20, INK2, "mm")
    s.foot(f"Asleep means stage dormant or composting, or type spore, per the rite's own precondition. Map build of {MAPDATE}.")
    s.save("Revival Ceremony — the sleepers.png")
    return asleep


# 11 ── Songlines: one line, sung ───────────────────────────────────────────
def songline():
    import networkx as nx
    G = nx.Graph()
    for e in EDGES:
        if e["type"] != "connects-to": G.add_edge(e["source"], e["target"], type=e["type"], src=e["source"])
    comp = G.subgraph(max(nx.connected_components(G), key=len))
    ecc = nx.eccentricity(comp); a = max(ecc, key=lambda t: (ecc[t], t))
    far = nx.single_source_shortest_path(comp, a); b = max(far, key=lambda t: (len(far[t]), t)); path = far[b]
    S = 170; n = len(path); s = Sheet(820, "One line, sung", f"The longest shortest walk in the palace: {n - 1} steps, each one a named link.")
    xs = [110 + i * (1620 - S) / (n - 1) for i in range(n)]
    ys = [330 + 110 * math.sin(i * 1.25) for i in range(n)]
    for i in range(n - 1):
        s.line([(xs[i] + S / 2, ys[i] + S / 2), (xs[i + 1] + S / 2, ys[i + 1] + S / 2)], RED, 4)
    verbs = []
    for i, t in enumerate(path):
        s.paste(icon(t, S), (xs[i], ys[i]), frame=INK, width=3)
        s.text((xs[i] + S / 2, ys[i] + S + 12), short(t, 15), 18, INK2, "ma")
        if i < n - 1:
            ed = G[t][path[i + 1]]; fwd = ed["src"] == t; verbs.append((ed["type"], fwd))
            s.text(((xs[i] + xs[i + 1]) / 2 + S / 2, min(ys[i], ys[i + 1]) - 34), ed["type"] + (" →" if fwd else " ←"), 18, RED, "ma", True)
    s.foot("Named links only; bare 'connects-to' links were left out, so every step says how two pages meet.",
           f"From {path[0]} to {path[-1]}. An arrow shows which page declares the link. Map build of {MAPDATE}.")
    s.save("Songlines — one line, sung.png")
    return path, verbs


# 12 ── Christopher Alexander: a city is not a tree ─────────────────────────
def lattice():
    hubs = ["Kuramoto Coupling", "Spinoza Conatus", "STIGMERGY"]
    nb = {h: {(e["source"] if e["target"] == h else e["target"]) for e in EDGES if h in (e["source"], e["target"])} - set(hubs) for h in hubs}
    allp = sorted(set().union(*nb.values()), key=lambda t: -deg[t]); multi = [t for t in allp if sum(t in nb[h] for h in hubs) > 1]
    pick = (multi[:10] + [t for t in allp if t not in multi][:8])
    S, HS = 78, 150; s = Sheet(1120, "A palace is not a tree", "The same three hubs and the same eighteen pages, filed two ways.")
    for panel, x0 in enumerate((80, 960)):
        hx = [x0 + 130 + i * 270 for i in range(3)]; hy = 250
        px = [x0 + 6 + (i % 9) * 88 for i in range(18)]; py = [660 + (i // 9) * 150 for i in range(18)]
        order = sorted(pick, key=lambda t: [h for h in hubs if t in nb[h]][0]) if panel == 0 else pick
        for i, t in enumerate(order):
            parents = [h for h in hubs if t in nb[h]]; use = parents[:1] if panel == 0 else parents
            for h in use:
                s.line([(hx[hubs.index(h)], hy + HS), (px[i] + S / 2, py[i])], RED if (panel == 1 and len(parents) > 1) else INK3, 2)
        for i, t in enumerate(order): s.paste(icon(t, S), (px[i], py[i]), frame=INK)
        for i, h in enumerate(hubs):
            s.paste(icon(h, HS), (hx[i] - HS // 2, hy), frame=INK, width=3); s.text((hx[i], hy - 30), short(h, 17), 19, INK2, "ma")
        s.text((x0, 190 - 10), "AS A TREE" if panel == 0 else "AS IT IS", 24, INK if panel == 0 else RED, bold=True)
        s.text((x0 + 200, 190 - 6), "every page under one parent" if panel == 0 else "red: a page that belongs to more than one", 19, INK3)
    s.line([(920, 180), (920, 960)], RULE, 2)
    s.foot(f"The right-hand links are all real: each joins a page to a hub in the map build of {MAPDATE}. The left is the same pages with every",
           f"tie but one thrown away, which is what filing does. {len(multi)} of these hubs' neighbours touch more than one of them.")
    s.save("Christopher Alexander — a palace is not a tree.png")
    return len(multi)


# 13 ── Weave Ceremony: the quiet ones ──────────────────────────────────────
def quiet():
    """Remade after the challenge as the page's own category: 'Isolated entries — entries no one links to.'"""
    iso = sorted(t for t in NODES if deg[t] == 0); S = 170; per = 9; rows = math.ceil(len(iso) / per)
    s = Sheet(200 + rows * 270 + 110, "No one links here", f"The {len(iso)} pages no other page points to. Each may be a root, or may be forgotten.")
    for i, t in enumerate(iso):
        r, c = divmod(i, per); x = 80 + c * 190; y = 200 + r * 270
        s.paste(icon(t, S), (x, y), frame=INK); s.text((x + S // 2, y + S + 10), short(t, 15), 17, INK2, "ma")
        s.text((x + S // 2, y + S + 36), f"{NODES[t]['outbound_count']} out", 17, RED, "ma", True)
    s.foot(f"No typed link from another page in the map build of {MAPDATE}. Every one of them links outward, so the palace has no orphans by the page's meaning.",
           "Being unlinked is not being unused: some of these are read every session. The number under each is how many pages it points to.")
    s.save("Weave Ceremony — no one links here.png")
    return iso


# 14 ── Whitehead: a page is built of what it takes up ──────────────────────
def prehension():
    c = "Whitehead"; out = [(e["target"], e["type"]) for e in EDGES if e["source"] == c]; inn = [(e["source"], e["type"]) for e in EDGES if e["target"] == c]
    s = Sheet(1500, "A page is built of what it takes up", "Whitehead's own page, and every page in the map it holds a link with."); cx, cy = 920, 780; S = 130
    ring = [(t, ty, True) for t, ty in out] + [(t, ty, False) for t, ty in inn]; n = len(ring)
    for i, (t, ty, o) in enumerate(ring):
        a = -math.pi / 2 + 2 * math.pi * i / n; x, y = cx + 520 * math.cos(a), cy + 520 * math.sin(a)
        s.line([(cx, cy), (x, y)], RED if o else INK3, 3)
        mx, my = cx + 310 * math.cos(a), cy + 310 * math.sin(a)
        tw = s.d.textlength(ty, font=font(17, True)); s.d.rectangle([mx - tw / 2 - 6, my - 13, mx + tw / 2 + 6, my + 13], fill=rgb(PAPER))
        s.text((mx, my), ty, 17, RED if o else INK3, "mm", True)
        s.paste(icon(t, S), (x - S / 2, y - S / 2), frame=INK); s.text((x, y + S / 2 + 8), short(t, 16), 17, INK2, "ma")
    h = icon(c, 230); s.paste(h, (cx - 115, cy - 115), frame=INK, width=4)
    s.foot(f"Red: the {len(out)} of its seven declared links that land on a page in the map, what it takes up. Grey: the {len(inn)} pages that take it up in turn.",
           f"Take the ring away and there is nothing left for the middle to mean. Map build of {MAPDATE}.")
    s.save("Whitehead — a page is built of what it takes up.png")
    return len(out), len(inn)


ALL = [avatar_sizes, mosaic, skins, experts, poles, guests, contradictions, pillars, stages, sleepers, songline, lattice, quiet, prehension]
if __name__ == "__main__":
    want = sys.argv[1:]
    for f in ALL:
        if not want or f.__name__ in want: print("→", f.__name__, f())
