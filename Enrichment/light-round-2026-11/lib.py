"""Light round 2026-11 — shared helpers for the second batch: the palace map, each page's icon and hero,
the Drafting Table paper inks, and a small PIL sheet for pieces built from icons."""
import json, os, re, functools, glob
from PIL import Image, ImageDraw, ImageFont, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MAPFILE = os.path.join(ROOT, "_ops/maps/palace-map-full-2026-11-09.json")
MAPDATE = "2026-11-09"
PAPER, INK, INK2, INK3, RULE, RED, FILL = "#f0eee5", "#1a1916", "#3a3a35", "#6a6862", "#b8b09a", "#c8261a", "#dcd9ca"
rgb = lambda h: tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
MAP = json.load(open(MAPFILE))
NODES = {n["id"]: n for n in MAP["nodes"]}
EDGES = [e for e in MAP["edges"] if e["source"] in NODES and e["target"] in NODES and e["source"] != e["target"]]


def asset(title, kind):
    n = NODES.get(title)
    if not n: return None
    base = os.path.join(ROOT, n["path"][:-3]); t = os.path.basename(base)
    f = os.path.join(base, f"{t} — {kind}.png")
    if os.path.exists(f): return f
    alt = sorted(glob.glob(os.path.join(glob.escape(base), f"* — {kind}.png")))   # a bundle whose image carries a longer name
    return alt[0] if alt else None


@functools.lru_cache(maxsize=None)
def icon(title, size, dim=False):
    f = asset(title, "icon")
    if f: im = Image.open(f).convert("RGB").resize((size, size), Image.LANCZOS)
    elif asset(title, "hero"):                      # no avatar yet: the middle of its hero stands in
        h = Image.open(asset(title, "hero")).convert("RGB"); m = h.height
        im = h.crop(((h.width - m) // 2, 0, (h.width + m) // 2, m)).resize((size, size), Image.LANCZOS)
    else:
        im = Image.new("RGB", (size, size), rgb(FILL)); d = ImageDraw.Draw(im)
        d.text((size / 2, size / 2), "".join(w[0] for w in title.split()[:3]), font=font(max(9, size // 4), True), fill=rgb(INK3), anchor="mm")
    if dim: im = Image.blend(ImageOps.grayscale(im).convert("RGB"), Image.new("RGB", (size, size), rgb(PAPER)), 0.74)
    return im


def hero(title, width):
    im = Image.open(asset(title, "hero")).convert("RGB")
    return im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)


def font(size, bold=False):
    try: return ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", size, index=1 if bold else 0)
    except OSError: return ImageFont.load_default()


def frontmatter(title, n=6000):
    try: return open(os.path.join(ROOT, NODES[title]["path"])).read(n)
    except OSError: return ""


class Sheet:
    """A paper sheet at 2x (1840 px wide) with a letterspaced head, like the first batch's figures."""
    def __init__(self, h, head, sub=None, w=1840):
        self.im = Image.new("RGB", (w, h), rgb(PAPER)); self.d = ImageDraw.Draw(self.im); self.w, self.h = w, h
        self.d.text((80, 62), "  ".join(head.upper()) if False else " ".join(head.upper()), font=font(30, True), fill=rgb(INK))
        if sub: self.d.text((80, 110), sub, font=font(23), fill=rgb(INK3))

    def text(self, xy, s, size=22, fill=INK2, anchor="la", bold=False):
        self.d.text(xy, s, font=font(size, bold), fill=rgb(fill), anchor=anchor)

    def paste(self, im, xy, frame=None, width=2):
        self.im.paste(im, (int(xy[0]), int(xy[1])))
        if frame: self.d.rectangle([xy[0] - width, xy[1] - width, xy[0] + im.width + width - 1, xy[1] + im.height + width - 1], outline=rgb(frame), width=width)

    def line(self, pts, fill=INK, width=2):
        self.d.line(pts, fill=rgb(fill), width=width)

    def foot(self, s, s2=None):
        self.d.text((80, self.h - (78 if s2 else 50)), s, font=font(21), fill=rgb(INK3))
        if s2: self.d.text((80, self.h - 48), s2, font=font(21), fill=rgb(INK3))

    def save(self, name):
        self.im.save(os.path.join(HERE, name), optimize=True)
        print(name, f"{os.path.getsize(os.path.join(HERE, name))/1024:.0f} KB")


def short(title, n=18):
    return title if len(title) <= n else title[: n - 1] + "…"
