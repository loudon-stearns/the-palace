"""Render a known page (paragraph + small table) to PNG and write its ground truth."""
import sys, json
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]
PARA = ("The harbor lights came on one by one as the fog rolled in from the bay. "
        "Mira counted seventeen boats before the last ferry left at 9:45, and she "
        "wrote each name in a small notebook with a green cover.")
TITLE = "Harbor Log, Week 46"
ROWS = [["Boat", "Arrived", "Crew"], ["Northwind", "06:10", "4"], ["Saltmarsh", "07:25", "2"], ["Blue Heron", "08:40", "6"]]
W, H = 1240, 1754  # A4 at 150 DPI
img = Image.new("RGB", (W, H), "white"); d = ImageDraw.Draw(img)
def font(sz):
    for p in ["/System/Library/Fonts/Supplemental/Arial.ttf", "/Library/Fonts/Arial.ttf", "/System/Library/Fonts/Helvetica.ttc"]:
        try: return ImageFont.truetype(p, sz)
        except OSError: pass
    return ImageFont.load_default()
ft, fb = font(44), font(28)
d.text((100, 100), TITLE, fill="black", font=ft)
# wrap paragraph
words, lines, cur = PARA.split(), [], ""
for w in words:
    t = (cur + " " + w).strip()
    if d.textlength(t, font=fb) > W - 200: lines.append(cur); cur = w
    else: cur = t
lines.append(cur)
y = 200
for ln in lines: d.text((100, y), ln, fill="black", font=fb); y += 42
y += 40; cw, rh = 300, 56
for r, row in enumerate(ROWS):
    for c, cell in enumerate(row):
        x0, y0 = 100 + c * cw, y + r * rh
        d.rectangle([x0, y0, x0 + cw, y0 + rh], outline="black", width=2)
        d.text((x0 + 14, y0 + 12), cell, fill="black", font=fb)
img.save(out)
json.dump({"title": TITLE, "paragraph": PARA, "table": ROWS}, open(out.rsplit(".", 1)[0] + "_truth.json", "w"), indent=1)
