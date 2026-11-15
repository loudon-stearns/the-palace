#!/usr/bin/env python3
"""
A labelled side-by-side sheet on the Drafting Table's paper: ground #f0eee5, ink #1a1916,
ink-3 #6a6862, engineering red #c8261a, JetBrains Mono (Menlo if it is not installed).

  python sheet.py --out SHEET.png --title "..." [--note "..."] --cell PATH "LABEL" [--cell ...]
         [--diff A B GAIN "LABEL"]   # a difference image |A-B| * GAIN, in red on paper
         [--cols N] [--cell-w 560]

Saved as an 8-bit palette PNG if that keeps it under ~1.5 MB. Written 2026-11-15; copied into
each 2026-11-15 image proof folder so each folder stands alone.
"""
import argparse, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

GROUND, INK, INK3, RED = (0xf0, 0xee, 0xe5), (0x1a, 0x19, 0x16), (0x6a, 0x68, 0x62), (0xc8, 0x26, 0x1a)


def font(size, bold=False):
    for p in [os.path.expanduser(f"~/Library/Fonts/JetBrainsMono-{'Bold' if bold else 'Regular'}.ttf"),
              "/Library/Fonts/JetBrainsMono-Regular.ttf", "/System/Library/Fonts/Menlo.ttc"]:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def diff_img(a, b, gain):
    A = np.asarray(Image.open(a).convert("RGB")).astype(np.int16)
    B = np.asarray(Image.open(b).convert("RGB")).astype(np.int16)
    d = np.clip(np.abs(A - B).max(axis=2) * gain, 0, 255).astype(np.float32) / 255.0
    g, r = np.array(GROUND, np.float32), np.array(RED, np.float32)
    out = g[None, None, :] * (1 - d[..., None]) + r[None, None, :] * d[..., None]
    return Image.fromarray(out.astype(np.uint8))


def wrap(draw, text, f, width):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=f) <= width: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True); ap.add_argument("--title", required=True); ap.add_argument("--note", default="")
    ap.add_argument("--cell", nargs=2, action="append", default=[], metavar=("PATH", "LABEL"))
    ap.add_argument("--diff", nargs=4, action="append", default=[], metavar=("A", "B", "GAIN", "LABEL"))
    ap.add_argument("--cols", type=int, default=0); ap.add_argument("--cell-w", type=int, default=560)
    a = ap.parse_args()
    cells = [(Image.open(p).convert("RGB"), lab) for p, lab in a.cell]
    cells += [(diff_img(x, y, float(g)), lab) for x, y, g, lab in a.diff]
    cols = a.cols or len(cells)
    W, pad, lab_h = a.cell_w, 24, 64
    ims = [(im.resize((W, round(im.height * W / im.width)), Image.LANCZOS), lab) for im, lab in cells]
    ch = max(im.height for im, _ in ims)
    rows = (len(ims) + cols - 1) // cols
    ft, fl, fn = font(26, True), font(16), font(15)
    tmp = ImageDraw.Draw(Image.new("RGB", (10, 10)))
    sheet_w = pad + cols * (W + pad)
    note = wrap(tmp, a.note, fn, sheet_w - 2 * pad) if a.note else []
    head = pad + 40 + len(note) * 22 + 12
    H = head + rows * (ch + lab_h + pad) + pad
    S = Image.new("RGB", (sheet_w, H), GROUND); d = ImageDraw.Draw(S)
    d.text((pad, pad), a.title, font=ft, fill=INK)
    y = pad + 40
    for ln in note:
        d.text((pad, y), ln, font=fn, fill=INK3); y += 22
    d.line([(pad, head - 6), (sheet_w - pad, head - 6)], fill=INK, width=1)
    for i, (im, lab) in enumerate(ims):
        r, c = divmod(i, cols)
        x, yy = pad + c * (W + pad), head + 8 + r * (ch + lab_h + pad)
        S.paste(im, (x, yy)); d.rectangle([x - 1, yy - 1, x + im.width, yy + im.height], outline=INK)
        ly = yy + im.height + 8
        red = lab.startswith("!")  # a label starting "!" is drawn in engineering red
        for ln in wrap(d, lab.lstrip("!"), fl, W)[:3]:
            d.text((x, ly), ln, font=fl, fill=RED if red else INK); ly += 20
    S.save(a.out, optimize=True)
    if os.path.getsize(a.out) > 1_500_000:
        S.quantize(256, method=Image.Quantize.MEDIANCUT).save(a.out, optimize=True)
    print(a.out, S.size, os.path.getsize(a.out))


if __name__ == "__main__":
    main()
