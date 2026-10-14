# Builds grip-sheet.png from stills.mjs's photographs: four bow settings, then
# one slowed-down frame with the hair holding and one with it letting go.
# usage: python3 contact_sheet.py
import json
from PIL import Image, ImageDraw, ImageFont
d = json.load(open('stills.json'))
cyc = d['cycle_frames']
hold = next(i for i, c in enumerate(cyc) if c['holding'] and 0.4 < c['phase'] < 0.7)
slip = next(i for i, c in enumerate(cyc) if not c['holding'])
says = {o['name']: o['chart_says'].split(':')[0] for o in d['out']}
tiles = [
  ('still-default.png', 'default · ' + says['default']),
  ('still-light-force.png', 'bow force 0.20 · ' + says['light-force']),
  ('still-heavy-force.png', 'bow force 1.00 · ' + says['heavy-force']),
  ('still-near-bridge.png', 'bow position 0.93 · ' + says['near-bridge']),
  (f'frames/cycle-{hold:02d}.png', 'slowed, 6 s a cycle · the hair holds (amber dot)'),
  (f'frames/cycle-{slip:02d}.png', 'slowed · corner at the bow: it lets go (spark)'),
]
TW, TH = 470, 330
sheet = Image.new('RGB', (TW * 2 + 30, (TH + 34) * 3 + 20), (11, 13, 16))
dr = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 15)
except Exception: font = ImageFont.load_default()
for k, (f, cap) in enumerate(tiles):
    im = Image.open(f).convert('RGB').crop((340, 0, 1280, 660)).resize((TW, TH), Image.LANCZOS)
    x, y = 10 + (k % 2) * (TW + 10), 10 + (k // 2) * (TH + 34)
    sheet.paste(im, (x, y)); dr.text((x + 4, y + TH + 8), cap, fill=(232, 184, 74), font=font)
sheet.save('grip-sheet.png'); print('ok', hold, slip)
