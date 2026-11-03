#!/usr/bin/env python3
# title: GenAI Camera — rich — build
# born: 2026-11-03
# links: [[GenAI Camera]] (connects-to · rich-face-workshop) · builds the overlays under rich-face/ and the measured numbers inside the four pieces listed in [[GenAI Camera — rich.json]]
# forward_vector: I turn the bundle's tracked renders into the thin overlays the rich-face pieces lay over them (a body's outline, the ink counted beyond it, a skeleton with its black taken out, the pixels a composite changed) and write the reference numbers from checks.py into each piece's baked block, so a piece shows the same thing in a sandboxed public frame that cannot read pixels. No model runs. Run: python3 "GenAI Camera — rich — build.py"
import json, os, re, importlib.util
import numpy as np
from PIL import Image, ImageFilter, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('checks', os.path.join(HERE, 'GenAI Camera — rich — checks.py'))
C = importlib.util.module_from_spec(spec); spec.loader.exec_module(C)
OUT = os.path.join(HERE, 'rich-face'); os.makedirs(OUT, exist_ok=True)
AMBER = (232, 184, 74)

def edge_of(mask):
    m = Image.fromarray((mask * 255).astype(np.uint8))
    return np.array(ImageChops.difference(m.filter(ImageFilter.MaxFilter(3)), m.filter(ImageFilter.MinFilter(3)))) > 0

def rgba(h, w): return np.zeros((h, w, 4), np.uint8)

# 1 · the costume dial: cell 0 the body's outline, cells 1–6 the light ink counted beyond it
for name, f in (('sorceress', 'render_021.png'), ('barbarian', 'render_022.png')):
    a = C.L(Image.open(C.R(f)))
    body = C.cell(a, 2) > 40
    band = C.maxf(body, 9)
    sp = rgba(C.CH, C.CW * 7)
    e = edge_of(body); sp[:, :C.CW][e] = (*AMBER, 255)
    for k in range(6):
        c = C.cell(a, 3 + k)
        bg = float(np.median(np.concatenate([c[:8].ravel(), c[-8:].ravel(), c[8:-8, :8].ravel(), c[8:-8, -8:].ravel()])))
        cnt = (c > max(128, bg + 60)) & ~band
        sl = sp[:, C.CW * (k + 1):C.CW * (k + 2)]; sl[cnt] = (*AMBER, 200)
    Image.fromarray(sp, 'RGBA').save(os.path.join(OUT, f'dial-{name}.png'), optimize=True)

# 2 · skeletons with their black taken out: row 0 the pose check's thin and thick (341×480),
#     row 1 the barbarian sweeps' plates, thin (render_019) and thick (render_022) (379×430)
sk = rgba(480 + 430, 758)
pc = np.array(Image.open(C.R('render_020.png')).convert('RGB'))
for r in range(2):
    y = 40 + r * 520; cell = pc[y:y + 480, 10:10 + 341]; m = cell.max(-1) > 60
    sl = sk[:480, r * 341:(r + 1) * 341]; sl[m, :3] = cell[m]; sl[m, 3] = 255
for k, f in enumerate(('render_019.png', 'render_022.png')):
    cell = C.cell(np.array(Image.open(C.R(f)).convert('RGB')), 1); m = cell.max(-1) > 60
    sl = sk[480:, k * 379:(k + 1) * 379]; sl[m, :3] = cell[m]; sl[m, 3] = 255
Image.fromarray(sk, 'RGBA').save(os.path.join(OUT, 'pose-skeletons.png'), optimize=True)

# 3 · the depth passes, each body's own range stretched to the whole of 0–255, side by side
st = []
for f in ('render_005_depth.png', 'render_008_depth.png'):
    a = C.L(Image.open(C.R(f))); m = a > 3; interior = C.minf(m, 9); v = a[interior]
    lo, hi = int(v.min()), int(v.max())
    s = np.clip((a - lo) * 255.0 / (hi - lo), 0, 255); s[~m] = 0
    st.append(s.astype(np.uint8))
Image.fromarray(np.concatenate(st, axis=1), 'L').save(os.path.join(OUT, 'autorange-stretched.png'), optimize=True)

# 4 · the shootout: rows are the segment's changed pixels, the inpaint's, then the barbarian's region
alpha_b = np.array(Image.open(C.R('render_022_beauty.png')).split()[-1]) > 127
alpha_s = np.array(Image.open(C.R('render_021_beauty.png')).split()[-1]) > 127
reg_b = C.maxf(C.maxf(alpha_b, 81), 33); reg_s = C.maxf(C.maxf(alpha_s, 81), 33)
base = np.array(Image.open(os.path.join(OUT, 'shootout-inpaint-base.png')).convert('RGB')).astype(int)
H, W = reg_b.shape; so = rgba(H * 3, W)
for k, f in enumerate(('render_012.png', 'render_013.png')):
    x = np.array(Image.open(C.R(f)).convert('RGB')).astype(int)
    ch = (np.abs(x - base).max(-1) > 24) & ~reg_s
    so[k * H:(k + 1) * H][ch] = (*AMBER, 170)
    so[k * H:(k + 1) * H][reg_s] = (138, 138, 160, 70)
e = C.maxf(edge_of(reg_b), 3); so[2 * H:][e] = (255, 255, 255, 235)
Image.fromarray(so, 'RGBA').save(os.path.join(OUT, 'shootout-overlays.png'), optimize=True)

# the numbers, into each piece's baked block
baked = json.dumps(C.out, separators=(',', ':'))
for fn in os.listdir(HERE):
    if fn.startswith('GenAI Camera — rich — ') and fn.endswith('.html'):
        p = os.path.join(HERE, fn); s = open(p, encoding='utf-8').read()
        s2 = re.sub(r'(<script id="baked" type="application/json">)[\s\S]*?(</script>)', lambda m: m.group(1) + baked + m.group(2), s)
        if s2 != s: open(p, 'w', encoding='utf-8').write(s2); print('baked →', fn)
for fn in sorted(os.listdir(OUT)): print(f'{os.path.getsize(os.path.join(OUT, fn)):>9}  rich-face/{fn}')
