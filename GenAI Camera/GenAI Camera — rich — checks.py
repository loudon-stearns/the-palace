#!/usr/bin/env python3
# title: GenAI Camera — rich — checks (reference)
# born: 2026-11-03
# links: [[GenAI Camera]] (connects-to · rich-face-workshop) · re-measures what the four made pieces listed in [[GenAI Camera — rich.json]] measure
# forward_vector: I measure, from the bundle's own tracked renders and with PIL rather than a browser, every number the four rich-face pieces compute in their canvases, so a challenger or a re-tune can check them by a second route. No model runs. Run: python3 "GenAI Camera — rich — checks.py" [--json]
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
R = lambda f: os.path.join(HERE, 'renders', f)

def L(img):  # PIL's own luma, the same integer formula the pieces use
    return np.array(img.convert('L')).astype(int)

def maxf(mask, size):
    return np.array(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(size))) > 127

def minf(mask, size):
    return np.array(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(size))) > 127

out = {}

# ── the costume dial: render_021 (sorceress), render_022 (barbarian); depth_sweep.py's sheet layout ──
CW, CH, PAD, LAB, HDR = 379, 430, 10, 34, 26
def cell(a, i):
    r, c = divmod(i, 3); x = PAD + c * (CW + PAD); y = HDR + PAD + LAB + r * (CH + LAB + PAD)
    return a[y:y + CH, x:x + CW]
STEPS = [0.0, 0.15, 0.30, 0.45, 0.60, 0.80]
# what the cloth count sets aside, in cell pixels (after the challenge, 2026-11-03): the cell's 8-px margin,
# where the paper's own edge shows as a light line; the sorceress's hair and hood, above her shoulders
# (y 100) and above her right arm (shoulder 222,100 to wrist 269,155) where the hair streams; the
# barbarian's sword, the strip right of x 270
YY, XX = np.mgrid[0:CH, 0:CW]
MARGIN = (YY < 8) | (YY >= CH - 8) | (XX < 8) | (XX >= CW - 8)
ASIDE = {'sorceress': MARGIN | (YY < 100) | ((XX > 222) & (YY < 100 + (XX - 222) * 55 / 47)),
         'barbarian': MARGIN | (XX > 270)}
dial = {}
for name, f in (('sorceress', 'render_021.png'), ('barbarian', 'render_022.png')):
    a = L(Image.open(R(f)))
    body = cell(a, 2) > 40
    band = maxf(body, 9)
    rows = []
    for k, s in enumerate(STEPS):
        c = cell(a, 3 + k)
        bg = float(np.median(np.concatenate([c[:8].ravel(), c[-8:].ravel(), c[8:-8, :8].ravel(), c[8:-8, -8:].ravel()])))
        light = c > max(128, bg + 60)
        rows.append({'depth': s, 'bg': bg,
                     'outside': round(float((light & ~band).sum() / body.sum()), 3),
                     'cloth': round(float((light & ~band & ~ASIDE[name]).sum() / body.sum()), 4)})
    dial[name] = {'body_px': int(body.sum()), 'steps': rows}
out['dial'] = dial

# ── thin plate, thick plate ──
plates = {}
for name, f in (('thin', 'render_020_thin_plate.png'), ('thick', 'render_020_thick_plate.png')):
    p = np.array(Image.open(R(f)).convert('RGB')).max(-1) > 60
    plates[name] = int(p.sum())
plates['ratio'] = round(plates['thick'] / plates['thin'], 2)
out['plates'] = plates

# ── depth auto-range: render_005 (fixed 1.2 bu range) vs render_008 (auto-range) ──
ar = {}
for name, f in (('before', 'render_005_depth.png'), ('after', 'render_008_depth.png')):
    a = L(Image.open(R(f)))
    interior = minf(a > 3, 9)
    v = a[interior]
    ar[name] = {'hist': np.bincount(v, minlength=256).tolist(), 'interior_px': int(interior.sum()), 'min': int(v.min()), 'max': int(v.max()),
                'p5': int(np.percentile(v, 5, method='lower')), 'p95': int(np.percentile(v, 95, method='lower')),
                'span_frac': round(float((v.max() - v.min()) / 255), 3),
                'p5_95_frac': round(float((np.percentile(v, 95, method='lower') - np.percentile(v, 5, method='lower')) / 255), 3)}
out['autorange'] = ar

# ── segment or inpaint: the barbarian's region, against the base it was painted into ──
alpha_b = np.array(Image.open(R('render_022_beauty.png')).split()[-1]) > 127
alpha_s = np.array(Image.open(R('render_021_beauty.png')).split()[-1]) > 127
# the shootout's MaxFilter(81), then VAEEncodeForInpaint's grow: grow_mask_by 16 is a 16-px kernel with
# padding 8 (_tools/ComfyUI/nodes.py:411-414), about 8 px each way, so MaxFilter(17)
r81_b = maxf(alpha_b, 81)
reg_b = maxf(r81_b, 17)
reg_s = maxf(maxf(alpha_s, 81), 17)
base = np.array(Image.open(os.path.join(HERE, 'rich-face', 'shootout-inpaint-base.png')).convert('RGB')).astype(int)
seg = {}
for name, f in (('segment', 'render_012.png'), ('inpaint', 'render_013.png')):
    x = np.array(Image.open(R(f)).convert('RGB')).astype(int)
    ch = (np.abs(x - base).max(-1) > 24) & ~reg_s
    seg[name] = {'changed_frac': round(float(ch.sum() / (~reg_s).sum()), 3),
                 'inside_region': round(float((ch & reg_b).sum() / ch.sum()), 3)}
# the fall-off: mean |luma change| of the inpaint against its base, inside the 81-px region and in
# 4-px rings out from it (the node's own grow ends 8 px out), the sorceress's region set aside
dl = np.abs(L(Image.open(R('render_013.png'))) - L(Image.open(os.path.join(HERE, 'rich-face', 'shootout-inpaint-base.png'))))
prev, rings = r81_b, []
for k in range(5):
    nxt = maxf(prev, 9); ring = nxt & ~prev & ~reg_s; rings.append(round(float(dl[ring].mean()), 1)); prev = nxt
seg['falloff'] = {'inside': round(float(dl[r81_b & ~reg_s].mean()), 1), 'rings': rings}
seg['region_frac'] = round(float(reg_b.mean()), 3)
out['shootout'] = seg

if __name__ == '__main__':
    if '--json' in sys.argv:
        print(json.dumps(out))
    else:
        show = json.loads(json.dumps(out))
        for k in show['autorange'].values(): k.pop('hist')
        print(json.dumps(show, indent=1))
