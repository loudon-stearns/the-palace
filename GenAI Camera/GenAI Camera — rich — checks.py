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
                     'outside': round(float((light & ~band).sum() / body.sum()), 3)})
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
reg_b = maxf(maxf(alpha_b, 81), 33)      # the shootout's MaxFilter(81), then VAEEncodeForInpaint's grow_mask_by 16
reg_s = maxf(maxf(alpha_s, 81), 33)
base = np.array(Image.open(os.path.join(HERE, 'rich-face', 'shootout-inpaint-base.png')).convert('RGB')).astype(int)
seg = {}
for name, f in (('segment', 'render_012.png'), ('inpaint', 'render_013.png')):
    x = np.array(Image.open(R(f)).convert('RGB')).astype(int)
    ch = (np.abs(x - base).max(-1) > 24) & ~reg_s
    seg[name] = {'changed_frac': round(float(ch.sum() / (~reg_s).sum()), 3),
                 'inside_region': round(float((ch & reg_b).sum() / ch.sum()), 3)}
# the seam: mean horizontal luma step across the region's edge, the inpaint against its base
lb = L(Image.open(os.path.join(HERE, 'rich-face', 'shootout-inpaint-base.png'))).astype(float)
l13 = L(Image.open(R('render_013.png'))).astype(float)
edge = reg_b[:, 1:] != reg_b[:, :-1]
seg['seam'] = {'inpaint': round(float(np.abs(np.diff(l13, axis=1))[edge].mean()), 2),
               'base': round(float(np.abs(np.diff(lb, axis=1))[edge].mean()), 2),
               'frame_mean_inpaint': round(float(np.abs(np.diff(l13, axis=1)).mean()), 2)}
seg['region_frac'] = round(float(reg_b.mean()), 3)
out['shootout'] = seg

if __name__ == '__main__':
    if '--json' in sys.argv:
        print(json.dumps(out))
    else:
        show = json.loads(json.dumps(out))
        for k in show['autorange'].values(): k.pop('hist')
        print(json.dumps(show, indent=1))
