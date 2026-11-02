# Joins the four stills shoot_3d.mjs takes into one plate, 3d-plate.png. Run with /usr/local/bin/python3.
import os
from PIL import Image, ImageDraw, ImageFont
here = os.path.dirname(os.path.abspath(__file__)); up = os.path.join(here, "..")
names = [("3d-melted.png", "5 s · melted (φ 0.17): birds skim low, every heading — grains click"),
         ("3d-ordered.png", "21 s · ordering (φ 0.70): the flock lifts into one sheet — grains sing"),
         ("3d-strike.png", "22.9 s · a strike (ring): 35 birds alarmed, the sheet tears"),
         ("3d-density.png", "33 s · the pad (φ 0.91): pillars = cells, one hue = one pitch class")]
cw, ch = 1000, 760; s = 0.62; tw, th = int(cw * s), int(ch * s)
out = Image.new("RGB", (tw * 2, (th + 34) * 2), (11, 13, 18)); d = ImageDraw.Draw(out)
f = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 14)
for k, (n, cap) in enumerate(names):
    im = Image.open(os.path.join(up, n)).convert("RGB").crop((280, 0, 1280, 760)).resize((tw, th), Image.LANCZOS)
    x, y = (k % 2) * tw, (k // 2) * (th + 34)
    out.paste(im, (x, y)); d.text((x + 10, y + th + 9), cap, fill=(220, 218, 210), font=f)
    os.remove(os.path.join(up, n))
out.save(os.path.join(up, "3d-plate.png")); print(out.size)
