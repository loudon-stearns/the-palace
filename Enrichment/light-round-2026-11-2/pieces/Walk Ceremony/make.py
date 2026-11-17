#!/usr/bin/env python3
"""Walk Ceremony — every door in the palace.

One mark for every typed link written in the frontmatter of the palace's entries, grouped by the link's
type, split by whether the Walk Ceremony page says what attention that type asks for.

The count, pinned: the Palace Map full build of 2026-11-16 (built at commit f2c1efdb; its link table is
copied here as palace-map-full-2026-11-16.tsv, 2,496 links on 333 entries). Counted a second way: every
one of those 333 entries' frontmatter read as YAML at the same commit (git show f2c1efdb:<path>). That
read finds 2,497: the one extra is a link in `1 from 2` whose target is a web address, not a page, which
the map rightly leaves out. The script checks both and stops if they disagree any other way.

No randomness: the layout is fixed by the counts, so there is no seed to keep.
Run from the palace root or from here: python3 make.py
"""
import collections, json, os, re, subprocess, sys
import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
TSV = os.path.join(HERE, "palace-map-full-2026-11-16.tsv")
MAPJSON = os.path.join(ROOT, "_ops/maps/palace-map-full-2026-11-16.json")   # for the entry list; may be gone later
COMMIT, MAPDATE = "f2c1efdb", "2026-11-16"
NAME = "Walk Ceremony — every door in the palace"

PAPER, INK, INK2, INK3, RULE, RED, FILL = "#f0eee5", "#1a1916", "#3a3a35", "#6a6862", "#b8b09a", "#c8261a", "#dcd9ca"
FONT = "font-family=\"'JetBrains Mono','IBM Plex Mono',ui-monospace,Menlo,monospace\""

# What the page says each type asks for: exact substrings of "How to Walk" (Walk Ceremony.md).
PAGE = {
    "connects-to": "follow it with curiosity",
    "mirrors": "hold two things together",
    "enables": "what becomes possible here",
    "couples-with": "how these two things move together",
}
# One line leaks in from the Jewel (JEWEL.md): "a contradiction asks you to keep both true".
JEWEL = {"contradicts": "keep both true  (the Jewel)"}


# ── the count, two ways ─────────────────────────────────────────────────────
def count_map():
    rows = [l.rstrip("\n").split("\t") for l in open(TSV, encoding="utf-8")][1:]
    return collections.Counter(r[1] for r in rows), len(rows), rows


def count_yaml():
    nodes = json.load(open(MAPJSON))["nodes"]
    c, n, urls = collections.Counter(), 0, []
    for node in nodes:
        t = subprocess.run(["git", "-C", ROOT, "show", f"{COMMIT}:{node['path']}"], capture_output=True, text=True).stdout
        m = re.match(r"^---\n(.*?)\n---", t, re.S)
        fm = yaml.safe_load(m.group(1)) if m else {}
        for l in (fm or {}).get("links") or []:
            if not isinstance(l, dict): continue
            tg = str(l.get("target"))
            if tg.startswith("http"): urls.append((node["id"], l.get("type"))); continue
            c[l.get("type")] += 1; n += 1
    return c, n, urls, len(nodes)


# ── drawing ─────────────────────────────────────────────────────────────────
W = 920
def text(x, y, s, size=13, fill=INK2, anchor="start", weight=400, extra=""):
    return f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" {extra}>{s}</text>'


X0, X1, CW, CH, DW, DH = 368, 880, 8, 13, 5, 9      # door field, cell and door sizes
PER = (X1 - X0) // CW                                # doors per row


def door(x, y, style):
    if style == "open":                              # connects-to, "the most open": an outlined door
        return f'<rect x="{x+.5:.1f}" y="{y+.5:.1f}" width="{DW-1}" height="{DH-1}" fill="none" stroke="{INK}" stroke-width="1"/>'
    fill = {"ink": INK, "grey": "#a9a493"}[style]
    return f'<rect x="{x}" y="{y}" width="{DW}" height="{DH}" fill="{fill}"/>'


def group(y, name, n, words, style, sub=None):
    out = [text(40, y + 11, name, 15, INK if style != "grey" else INK2, weight=700),
           text(X0 - 14, y + 11, f"{n:,}", 15, INK if style != "grey" else INK2, "end", 700)]
    if words: out.append(text(40, y + 30, words, 13, INK3 if style == "grey" else INK2, extra='font-style="italic"'))
    for i in range(n):
        out.append(door(X0 + (i % PER) * CW, y + (i // PER) * CH, style))
    rows = -(-n // PER)
    return out, y + max(rows * CH, 40 if words else 22) + 12


def draw(c, total, entries):
    named = [t for t in ("connects-to", "mirrors", "enables", "couples-with")]
    rest = [t for t, _ in c.most_common() if t not in named]
    nn, nr = sum(c[t] for t in named), sum(c[t] for t in rest)
    out = [text(40, 44, "EVERY DOOR IN THE PALACE", 17, INK, weight=700, extra='letter-spacing="3"'),
           text(40, 70, f"one mark for each typed link: {total:,} on {entries} entries, Palace Map {MAPDATE}", 13, INK3)]
    y = 112
    out += [text(40, y, f"THE PAGE SAYS WHAT ATTENTION TO BRING", 13, INK, weight=700, extra='letter-spacing="1.5"'),
            text(X1, y, f"{nn:,} · {100*nn/total:.0f}%", 13, INK, "end", 700),
            f'<line x1="40" y1="{y+8}" x2="{X1}" y2="{y+8}" stroke="{RULE}"/>']
    y += 24
    for t in named:
        g, y = group(y, t, c[t], PAGE[t], "open" if t == "connects-to" else "ink"); out += g
    y += 18
    out += [text(40, y, f"THE PAGE NAMES NO ATTENTION", 13, INK, weight=700, extra='letter-spacing="1.5"'),
            text(X1, y, f"{nr:,} · {100*nr/total:.0f}%", 13, INK, "end", 700),
            f'<line x1="40" y1="{y+8}" x2="{X1}" y2="{y+8}" stroke="{RULE}"/>']
    y += 24
    small = [t for t in rest if c[t] < 5]
    for t in rest:
        if t in small: continue
        g, y = group(y, t, c[t], JEWEL.get(t), "grey"); out += g
    if small:
        g, y = group(y, " · ".join(small), sum(c[t] for t in small), None, "grey"); out += g
    y += 14
    out.append(text(40, y, "outlined: connects-to, which the page calls the most open", 12, INK3))
    H = y + 26
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" {FONT}>'
           f'<rect width="{W}" height="{H}" fill="{PAPER}"/>{"".join(out)}</svg>')
    return svg, H


def raster(svg_path, png_path, h, scale=2):
    chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    html = os.path.join(HERE, "_raster.html")
    open(html, "w").write(f'<html><body style="margin:0;background:{PAPER}"><img src="{os.path.basename(svg_path)}" '
                          f'style="width:{W}px;height:{h}px;display:block"></body></html>')
    subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--force-device-scale-factor={scale}",
                    f"--window-size={W},{h}", f"--screenshot={png_path}", "file://" + html], check=True, capture_output=True)
    os.unlink(html)


if __name__ == "__main__":
    cm, nm, rows = count_map()
    cy, ny, urls, entries = count_yaml()
    print(f"map table: {nm} links · YAML at {COMMIT}: {ny} links to pages, plus {len(urls)} to web addresses {urls}")
    if cm != cy or nm != ny:
        sys.exit(f"the two counts disagree: {cm - cy} / {cy - cm}")
    svg, h = draw(cm, nm, entries)
    sp, pp = os.path.join(HERE, NAME + ".svg"), os.path.join(HERE, NAME + ".png")
    open(sp, "w").write(svg)
    raster(sp, pp, h)
    named = sum(cm[t] for t in PAGE)
    counts = {"source": f"_ops/maps/palace-map-full-{MAPDATE}.tsv (copied here), map built at {COMMIT}",
              "second_way": f"frontmatter of the same {entries} entries read as YAML at {COMMIT}",
              "web_address_links_left_out": len(urls), "total": nm, "entries": entries,
              "by_type": dict(cm.most_common()), "page_names_with_attention": named,
              "page_names_no_attention": nm - named,
              "three_with_a_question": sum(cm[t] for t in ("mirrors", "enables", "couples-with"))}
    json.dump(counts, open(os.path.join(HERE, "counts.json"), "w"), indent=1, ensure_ascii=False)
    print(json.dumps(counts, indent=1, ensure_ascii=False)); print("height", h)
