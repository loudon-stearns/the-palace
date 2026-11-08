#!/usr/bin/env python3
"""Turn the aged-paper plates into cyanotype grounds, plus a contact sheet.

A plate is used only as a tone map: its luminance, normalised per plate, moves the
cerulean lighter or darker (folds, foxing, fibre, a stain), and a little of its warmth
is kept so a coffee ring still reads brown. Nothing in a plate carries a mark.

  _tools/ComfyUI/venv/bin/python plates/tint_plates.py
"""
import glob, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
GROUND = np.array([30, 92, 136], dtype=np.float32)     # cyanotype, darker than Loudon's reference print, on his word (2026-10-25)
SPREAD = np.array([14, 18, 18], dtype=np.float32)    # how far one standard deviation moves each channel
LOW_KEEP = 0.3                                       # share of the large-scale blotching kept
WARM = 0.35                                          # share of the paper's own warmth kept

for path in sorted(glob.glob(os.path.join(HERE, "plate-*.png"))):
    rgb = np.asarray(Image.open(path).convert("RGB"), dtype=np.float32)
    lum = rgb @ np.array([.299, .587, .114], dtype=np.float32)
    # the reference-guided plates carry big patches from the tiled start image; keep the
    # fine texture (fibre, rings, creases) whole and only a third of the large blotches
    low = np.asarray(Image.fromarray(np.clip(lum, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(70)), dtype=np.float32)
    lum = (lum - low) + LOW_KEEP * (low - low.mean()) + low.mean()
    z = (lum - lum.mean()) / (lum.std() + 1e-6)
    z = np.clip(z, -3, 3)[..., None]
    warmth = (rgb[..., 0] - rgb[..., 2]) - np.median(rgb[..., 0] - rgb[..., 2])   # stains are warmer than the sheet
    out = GROUND + SPREAD * z
    stain = WARM * np.clip(warmth, 0, None)
    out[..., 0] += stain * .25            # a coffee ring on cyanotype goes olive-brown:
    out[..., 1] -= stain * .35            # less blue and green, a touch more red
    out[..., 2] -= stain * .9
    img = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
    name = os.path.basename(path).replace("plate-", "cyan-").replace(".png", ".jpg")
    img.save(os.path.join(HERE, name), quality=86)
    print("tinted", name)

# contact sheet: each plate raw above, cyanotype below, four to a row
grounds = sorted(glob.glob(os.path.join(HERE, "cyan-*.jpg")))
tw, th, cols = 448, 256, 4
rows = (len(grounds) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (tw + 10) + 10, rows * (th * 2 + 30) + 10), (17, 17, 20))
d = ImageDraw.Draw(sheet)
for k, g in enumerate(grounds):
    raw = g.replace("cyan-", "plate-").replace(".jpg", ".png")
    x, y = 10 + (k % cols) * (tw + 10), 10 + (k // cols) * (th * 2 + 30)
    sheet.paste(Image.open(raw).convert("RGB").resize((tw, th)), (x, y))
    sheet.paste(Image.open(g).resize((tw, th)), (x, y + th + 4))
    d.text((x + 6, y + 6), os.path.basename(raw)[6:-4], fill=(255, 255, 255))
sheet.save(os.path.join(HERE, "contact-sheet.jpg"), quality=85)
print("contact-sheet.jpg")
