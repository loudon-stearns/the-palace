"""Contact sheet for the split-way test: the four finished pieces, labelled. Needs pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
HERE = Path(__file__).parent
CELLS = [("split.png", "SPLIT: FLUX.3 Klein plate + drawn SVG diagram"), ("drawn.png", "ALL DRAWN: SVG from code"),
         ("whole-klein.png", "ALL GENERATED: FLUX.3 Klein"), ("whole-krea.png", "ALL GENERATED: FLUX.1 Krea-dev (the pin)")]
w, h, pad, lab = 672, 384, 24, 34
f = ImageFont.truetype("/Library/Fonts/JetBrainsMono-Bold.ttf", 15)
sheet = Image.new("RGB", (2 * w + 3 * pad, 2 * (h + lab) + 3 * pad), "#f0eee5"); d = ImageDraw.Draw(sheet)
for i, (fn, label) in enumerate(CELLS):
    x, y = pad + (i % 2) * (w + pad), pad + (i // 2) * (h + lab + pad)
    d.text((x, y + 6), label, font=f, fill="#1a1916")
    sheet.paste(Image.open(HERE / fn).convert("RGB").resize((w, h), Image.LANCZOS), (x, y + lab))
    d.rectangle([x - 1, y + lab - 1, x + w, y + lab + h], outline="#b8b09a")
sheet.save(HERE / "compare.jpg", quality=86); print("compare.jpg", (HERE / "compare.jpg").stat().st_size)
