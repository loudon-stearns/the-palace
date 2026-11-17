#!/usr/bin/env python3
"""Walk Ceremony — one step of a walk (the remake).

From Walk Ceremony, follow its one typed link to The Cooperation Path; there, draw every typed link out,
grouped by type, and beside each type the attention it asks for: from this page where the page gives it,
from SCHEMA's link table (§4) where it does not, each named as borrowed.

The links are read from the Palace Map full build of 2026-11-16 (built at f2c1efdb; its link table is
copied here as palace-map-full-2026-11-16.tsv), and checked against The Cooperation Path's frontmatter
at the same commit. The single count line under the picture comes from the same table.

No randomness: nothing to seed. Run from here: python3 make-step.py
"""
import base64, collections, io, json, os, re, subprocess, sys
import yaml
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
TSV = os.path.join(HERE, "palace-map-full-2026-11-16.tsv")
COMMIT, MAPDATE = "f2c1efdb", "2026-11-16"
START, STEP = "Walk Ceremony", "The Cooperation Path"
NAME = "Walk Ceremony — one step of a walk"
PATHS = {"Walk Ceremony": "_ops/Walk Ceremony", "1 from 2": "Projects/1 from 2"}   # bundles not at the root

PAPER, INK, INK2, INK3, RULE, RED, FILL = "#f0eee5", "#1a1916", "#3a3a35", "#6a6862", "#b8b09a", "#c8261a", "#dcd9ca"
FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace\""

# The attention each type asks for. Every phrase is an exact substring of its source.
ATTENTION = {
    "connects-to": (["with curiosity", "rather than", "expectation"], "this page"),          # Walk Ceremony.md, How to Walk
    "deepens": (["the target is", "the ground"], "SCHEMA"),                                  # SCHEMA.md §4, deepens row
    "spawned": (["traceable lineage"], "SCHEMA"),                                            # SCHEMA.md §4, spawned row
}
SOURCES = {"this page": "_ops/Walk Ceremony.md", "SCHEMA": "SCHEMA.md"}


def links():
    rows = [l.rstrip("\n").split("\t") for l in open(TSV, encoding="utf-8")][1:]
    first = [(r[1], r[2]) for r in rows if r[0] == START]
    out = [(r[1], r[2]) for r in rows if r[0] == STEP]
    # check against the page itself at the same commit
    t = subprocess.run(["git", "-C", ROOT, "show", f"{COMMIT}:{STEP}.md"], capture_output=True, text=True).stdout
    fm = yaml.safe_load(re.match(r"^---\n(.*?)\n---", t, re.S).group(1))
    own = [(l["type"], l["target"].strip("[]")) for l in fm["links"]]
    if sorted(own) != sorted(out): sys.exit(f"map and page disagree: {own} / {out}")
    for k, (lines, src) in ATTENTION.items():           # every phrase must be in its source, as written
        body = re.sub(r"\s+", " ", open(os.path.join(ROOT, SOURCES[src])).read())
        if " ".join(lines) not in body: sys.exit(f"not in {src}: {' '.join(lines)}")
    c = collections.Counter(r[1] for r in rows)
    return first, out, c, len(rows)


def icon(title, px=128):
    b = PATHS.get(title, title)
    im = Image.open(os.path.join(ROOT, b, f"{title} — icon.png")).convert("RGB").resize((px, px), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def text(x, y, s, size=14, fill=INK2, anchor="start", weight=400, extra=""):
    return f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" {extra}>{s}</text>'


def img(title, x, y, s):
    return (f'<image href="{icon(title)}" x="{x}" y="{y}" width="{s}" height="{s}"/>'
            f'<rect x="{x}" y="{y}" width="{s}" height="{s}" fill="none" stroke="{RULE}"/>')


W = 920
def draw(first, out, c, total):
    o = [text(40, 44, "ONE STEP OF A WALK", 17, INK, weight=700, extra='letter-spacing="3"')]
    # the step: Walk Ceremony → its one typed link → The Cooperation Path
    (t0, _), = first
    yc = 300
    o += [img(START, 40, yc - 36, 72), text(76, yc + 58, "Walk Ceremony", 13, INK2, "middle"),
          f'<line x1="118" y1="{yc}" x2="214" y2="{yc}" stroke="{INK}" stroke-width="1.6"/>',
          f'<path d="M214 {yc-5} L224 {yc} L214 {yc+5} Z" fill="{INK}"/>',
          text(171, yc - 10, t0, 12, INK2, "middle"), text(171, yc + 20, "its only link", 11, INK3, "middle", extra='font-style="italic"'),
          img(STEP, 230, yc - 52, 104), text(282, yc + 76, "The Cooperation", 14, INK, "middle", 700),
          text(282, yc + 94, "Path", 14, INK, "middle", 700)]
    # the ways out, grouped by type in the order the page gives them
    order = [t for t in ATTENTION if any(k == t for k, _ in out)]
    rows, y, groups = [], 104, []
    for t in order:
        g0 = y
        for k, tg in out:
            if k == t: rows.append((tg, y)); y += 46
        groups.append((t, g0, y - 46)); y += 22
    XI, XN, XA = 470, 516, 760
    for tg, yy in rows:
        k = next(k for k, x in out if x == tg)
        o.append(f'<line x1="334" y1="{yc}" x2="{XI}" y2="{yy+18}" stroke="{INK if k != "connects-to" else INK3}" stroke-width="{1.6 if k != "connects-to" else 1}"/>')
        o += [img(tg, XI, yy, 36), text(XN, yy + 23, tg, 14, INK, weight=700)]
    for t, a, b in groups:
        lines, src = ATTENTION[t]
        top, bot = a + 2, b + 34
        o.append(f'<path d="M{XA-12} {top} h6 V{bot} h-6" fill="none" stroke="{RULE}" stroke-width="1.4"/>')
        mid = (top + bot) / 2 - (len(lines) + 1) * 8
        o.append(text(XA, mid + 8, t, 14, INK, weight=700))
        for i, s in enumerate(lines):
            o.append(text(XA, mid + 27 + i * 17, s, 13, INK2, extra='font-style="italic"'))
        o.append(text(XA, mid + 27 + len(lines) * 17, f"— {src}", 11, INK3))
    y += 18
    o += [f'<line x1="40" y1="{y}" x2="880" y2="{y}" stroke="{RULE}"/>',
          text(40, y + 26, f"Across the palace, {c['connects-to']:,} of {total:,} typed links are connects-to.", 14, INK2),
          text(40, y + 48, f"Palace Map, {MAPDATE}", 11, INK3)]
    H = y + 66
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" {FONT}>'
            f'<rect width="{W}" height="{H}" fill="{PAPER}"/>{"".join(o)}</svg>'), H


def raster(svg_path, png_path, h, scale=2):
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    html = os.path.join(HERE, "_raster-step.html")
    open(html, "w").write(f'<html><body style="margin:0;background:{PAPER}"><img src="{os.path.basename(svg_path)}" '
                          f'style="width:{W}px;height:{h}px;display:block"></body></html>')
    subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--force-device-scale-factor={scale}",
                    f"--window-size={W},{h}", f"--screenshot={png_path}", "file://" + html], check=True, capture_output=True)
    os.unlink(html)


if __name__ == "__main__":
    first, out, c, total = links()
    if len(first) != 1: sys.exit(f"{START} has {len(first)} typed links, not one")
    svg, h = draw(first, out, c, total)
    sp, pp = os.path.join(HERE, NAME + ".svg"), os.path.join(HERE, NAME + ".png")
    open(sp, "w").write(svg); raster(sp, pp, h)
    rec = {"source": f"palace-map-full-{MAPDATE}.tsv (copied here), built at {COMMIT}; checked against {STEP}.md at {COMMIT}",
           "first_step": first, "ways_out": out, "by_type_here": dict(collections.Counter(k for k, _ in out)),
           "palace_connects_to": c["connects-to"], "palace_total": total, "height": h}
    json.dump(rec, open(os.path.join(HERE, "step.json"), "w"), indent=1, ensure_ascii=False)
    print(json.dumps(rec, indent=1, ensure_ascii=False))
