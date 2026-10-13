#!/usr/bin/env python3
"""
BLUELINE Session 11 — labelled CONTACT SHEET for a range of tool renders.

Loudon steers by looking at renders: the full-size PNGs are the real signal, this sheet is the map
of the range so he can name a pick. Each tile carries the label you give it. An optional --note fills
a spare cell with the settings every tile shares.

  python3 contact_sheet.py --out out/guide/contact_sheet.png --cols 4 \
      --note "frame-5 defaults: chop · spray arc · punch 0.6 · density 0.45" \
      out/guide/gw_0.14.png="gw 0.14 (control)" out/guide/gw_0.20.png="gw 0.20" ...

Needs Pillow (system python3). Pattern adopted from
blender-handdrawn/followups/rig-openpose/multi_contact_sheet.py.
"""
import argparse
from PIL import Image, ImageDraw, ImageFont

p = argparse.ArgumentParser()
p.add_argument("--out", required=True)
p.add_argument("--cols", type=int, default=4)
p.add_argument("--tile", type=int, default=500, help="tile width in px")
p.add_argument("--title", default="")
p.add_argument("--note", default="")
p.add_argument("items", nargs="+", help="path=label")
a = p.parse_args()

def font(sz):
    try: return ImageFont.load_default(size=sz)
    except TypeError: return ImageFont.load_default()

F_LAB, F_TITLE, F_NOTE = font(24), font(30), font(22)
LAB_H, GAP, INK, PAPER, RULE = 40, 14, (20, 20, 24), (255, 255, 255), (200, 200, 205)

tiles = []
for it in a.items:
    path, _, label = it.partition("=")
    im = Image.open(path).convert("RGB")
    im = im.resize((a.tile, round(im.height * a.tile / im.width)), Image.LANCZOS)
    t = Image.new("RGB", (a.tile, im.height + LAB_H), PAPER)
    t.paste(im, (0, LAB_H))
    d = ImageDraw.Draw(t)
    d.text((10, 8), label or path, fill=INK, font=F_LAB)
    d.rectangle([0, LAB_H, a.tile - 1, t.height - 1], outline=RULE, width=2)
    tiles.append(t)

th = max(t.height for t in tiles)
n = len(tiles) + (1 if a.note else 0)
rows = -(-n // a.cols)
top = 56 if a.title else GAP
W = a.cols * a.tile + (a.cols + 1) * GAP
H = top + rows * th + rows * GAP
sheet = Image.new("RGB", (W, H), (236, 236, 240))
d = ImageDraw.Draw(sheet)
if a.title:
    d.text((GAP, 14), a.title, fill=INK, font=F_TITLE)
for i, t in enumerate(tiles):
    x = GAP + (i % a.cols) * (a.tile + GAP); y = top + (i // a.cols) * (th + GAP)
    sheet.paste(t, (x, y))
if a.note:
    i = len(tiles); x = GAP + (i % a.cols) * (a.tile + GAP); y = top + (i // a.cols) * (th + GAP)
    d.rectangle([x, y, x + a.tile - 1, y + th - 1], fill=PAPER, outline=RULE, width=2)
    yy = y + 16
    for line in a.note.split("\\n"):
        d.text((x + 14, yy), line, fill=INK, font=F_NOTE); yy += 32
sheet.save(a.out)
print("wrote", a.out, sheet.size)
