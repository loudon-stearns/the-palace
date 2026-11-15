#!/usr/bin/env python3
"""
Contact sheet: rows of labelled tiles on Drafting Table paper, written as one PNG.

  python sheet.py OUT.png --title "..." --row "label=path" "label=path" --row ...

Each --row is one line of tiles at the same height. Paper colours are the house's
(Drafting Table: ground #f0eee5, ink #1a1916, ink-3 #6a6862, rule #b8b09a, red #c8261a);
the layout is this script's, and a maker who can lay it out better does so.
Written 2026-11-15 for the image Specialists' test proofs.
"""
import argparse, os
from PIL import Image, ImageDraw, ImageFont

GROUND, INK, INK3, RULE, RED = "#f0eee5", "#1a1916", "#6a6862", "#b8b09a", "#c8261a"


def font(size):
    for p in (os.path.expanduser("~/Library/Fonts/JetBrainsMono-Regular.ttf"),
              "/Library/Fonts/JetBrainsMono-Regular.ttf", "/System/Library/Fonts/Menlo.ttc"):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def make(out, title, rows, width=1560, tile_h=None, note=None):
    pad, gap, lab = 24, 14, 22
    f_t, f_l = font(20), font(14)
    rows_im = [[(l, Image.open(p).convert("RGB")) for l, p in r] for r in rows]
    blocks = []
    for r in rows_im:
        # fit the row to the width at one height
        ar = sum(im.width / im.height for _, im in r)
        h = int((width - 2 * pad - gap * (len(r) - 1)) / ar)
        if tile_h:
            h = min(h, tile_h)
        blocks.append((h, [(l, im.resize((max(1, round(im.width * h / im.height)), h), Image.LANCZOS)) for l, im in r]))
    H = pad + 34 + sum(h + lab + gap + 6 for h, _ in blocks) + (26 if note else 0) + pad
    sh = Image.new("RGB", (width, H), GROUND)
    d = ImageDraw.Draw(sh)
    d.text((pad, pad), title, font=f_t, fill=INK)
    d.line((pad, pad + 30, width - pad, pad + 30), fill=RULE, width=1)
    y = pad + 40
    for h, r in blocks:
        x = pad
        for l, im in r:
            red = l.startswith("!")
            d.text((x, y), l.lstrip("!"), font=f_l, fill=RED if red else INK3)
            sh.paste(im, (x, y + lab))
            d.rectangle((x - 1, y + lab - 1, x + im.width, y + lab + h), outline=RULE)
            x += im.width + gap
        y += h + lab + gap + 6
    if note:
        d.text((pad, y), note, font=f_l, fill=INK3)
    sh.save(out, optimize=True)
    return sh.size


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("out"); ap.add_argument("--title", required=True)
    ap.add_argument("--row", nargs="+", action="append", required=True)
    ap.add_argument("--note"); ap.add_argument("--width", type=int, default=1560)
    a = ap.parse_args()
    print(make(a.out, a.title, [[t.split("=", 1) for t in r] for r in a.row], a.width, note=a.note))
