"""
title: Hand-Drawn 3D Look — rich — make sheets
born: 2026-11-03
links: [[Hand-Drawn 3D Look]] connects-to · rich-face workshop · [[BLUELINE]] reads · blender-handdrawn proofs
forward_vector: I cut the grey sheets the rich face's three pieces load, and I measure them first, in scipy, so
  each piece's own engine has a reference it did not write. The seam's plates and redraws come from BLUELINE's
  blender-handdrawn proofs (git ignores them; I read them from the palace that has them); the line knobs and
  the boil come from "Hand-Drawn 3D Look — rich — render plates.py".

Run from the palace root:
  python3 -I "Hand-Drawn 3D Look/Hand-Drawn 3D Look — rich — make sheets.py" <proofs dir> <render plates out dir>
  <proofs dir> is Projects/BLUELINE/proofs/blender-handdrawn in a palace that has its renders.
Writes Hand-Drawn 3D Look/sheets/{seam,lines,boil}/*.png and sheets/sheets.json.
"""
import json, os, sys, itertools
import numpy as np
from PIL import Image
from scipy import ndimage as nd

PROOFS, RAW = sys.argv[1], sys.argv[2]
OUT = os.path.join("Hand-Drawn 3D Look", "sheets")
for d in ("seam", "lines", "boil"):
    os.makedirs(os.path.join(OUT, d), exist_ok=True)


def grey(path, size=None):
    im = Image.open(path).convert("RGBA")
    bg = Image.new("RGBA", im.size, "white"); bg.alpha_composite(im)
    g = bg.convert("L")
    if size and g.size != size:
        g = g.resize(size, Image.BILINEAR)
    return g


def save(img, rel):
    img.save(os.path.join(OUT, rel), optimize=True)
    return np.asarray(img, dtype=np.float64) / 255.0


meta = {"made": "2026-11-03", "by": "Hand-Drawn 3D Look — rich — make sheets.py"}

# ---------------------------------------------------------------- the seam
SW, SH = 416, 520
R = 4
SHIFTS = [(17, 31), (-23, 29), (19, -27), (-29, -21)]


def edges(a):
    b = nd.gaussian_filter(a, 1.2, mode="reflect", truncate=4.0)
    g = np.hypot(nd.sobel(b, 1, mode="reflect"), nd.sobel(b, 0, mode="reflect")) / 8.0
    return g > 0.06


seam_src = [
    ("plate", "blender/city_toon.png", "the Blender plate (EEVEE toon + Freestyle)", None),
    ("lines", "blender/city_ink.png", "the Freestyle line pass, the Canny ControlNet's input", None),
    ("d072", "stylized/city_from_toon.png", "denoise 0.72 · canny 0.85", dict(denoise=0.72, canny=0.85, end=0.85, seed=2211)),
    ("d090", "stylized/city_push_d90_cn50.png", "denoise 0.90 · canny 0.55 to 55 %", dict(denoise=0.90, canny=0.55, end=0.55, seed=2211)),
    ("d095", "stylized/city_push_d95_cn40.png", "denoise 0.95 · canny 0.42 to 50 %", dict(denoise=0.95, canny=0.42, end=0.50, seed=7)),
]
SEEDS = [11, 88, 222, 1337, 4242, 9001, 55555, 70707]
for s in SEEDS:
    seam_src.append((f"seed{s:05d}", f"stylized/variation/var_seed_{s:05d}.png", f"seed {s} · denoise 0.95 · canny 0.42 to 50 %",
                     dict(denoise=0.95, canny=0.42, end=0.50, seed=s)))
arrs = {}
for key, rel, label, _ in seam_src:
    arrs[key] = save(grey(os.path.join(PROOFS, rel), (SW, SH)), f"seam/{key}.png")
plate = arrs["plate"]; pe = edges(plate)
dp = nd.distance_transform_edt(~pe)
pb = nd.gaussian_filter(plate, 1.0, mode="reflect", truncate=4.0)
seam = {"size": [SW, SH], "r": R, "shifts": SHIFTS, "plate_edge_px": int(pe.sum()), "items": []}
for key, rel, label, settings in seam_src:
    if key == "lines":
        seam["items"].append(dict(key=key, file=f"seam/{key}.png", source=rel, label=label)); continue
    o = arrs[key]; e = edges(o); de = nd.distance_transform_edt(~e)
    held = float((de[pe] <= R).mean())
    chance = float(np.mean([(de[np.roll(np.roll(pe, a, 0), b, 1)] <= R).mean() for a, b in SHIFTS]))
    new = float((dp[e] > R).mean()) if e.any() else 0.0
    ob = nd.gaussian_filter(o, 1.0, mode="reflect", truncate=4.0)
    changed = float((np.abs(ob - pb) > 0.25).mean())
    seam["items"].append(dict(key=key, file=f"seam/{key}.png", source=rel, label=label, settings=settings,
                              ref=dict(held=held, chance=chance, new=new, changed=changed, edge_px=int(e.sum()))))
meta["seam"] = seam

# ---------------------------------------------------------------- the line knobs
names = ["plain"] + ["c%dn%ds%dp%d" % k for k in itertools.product((0, 1), repeat=4)]
la = {}
for n in names:
    la[n] = save(grey(os.path.join(RAW, "lines", n + ".png")), f"lines/{n}.png")
plain_ink = la["plain"] < 0.5
dpl = nd.distance_transform_edt(~plain_ink)
lines = {"size": list(la["plain"].shape[::-1]), "items": []}
for n in names:
    ink = la[n] < 0.5
    lines["items"].append(dict(key=n, file=f"lines/{n}.png",
                               ref=dict(ink_px=int(ink.sum()), weight=float(ink.sum() / plain_ink.sum()),
                                        stray=float(dpl[ink].mean()), off3=float((dpl[ink] > 3).mean()),
                                        off12=float((dpl[ink] > 12).mean()))))
meta["lines"] = lines

# ---------------------------------------------------------------- the boil
BW = 512
ba = {}


def bsave(src, key):
    ba[key] = save(grey(src, (BW, BW)), f"boil/{key}.png")


for i in range(1, 13):
    bsave(os.path.join(RAW, "boil/on", f"frame_{i:04d}.png"), f"on_{i:02d}")
    bsave(os.path.join(RAW, "boil/off", f"frame_{i:04d}.png"), f"off_{i:02d}")
for s in range(1, 6):
    bsave(os.path.join(RAW, f"boil/twos{s}", "still.png"), f"twos_{s}")
    bsave(os.path.join(RAW, "boil/ones", f"render_{s}.png"), f"ones_{s}")
bsave(os.path.join(RAW, "boil/single5", "frame_0005.png"), "single5")
bsave(os.path.join(RAW, "boil/single5_sn0", "frame_0005.png"), "single5_sn0")
bsave(os.path.join(RAW, "boil/seq_sn0", "frame_0005.png"), "seq5_sn0")


def changed(a, b):
    return float((np.abs(np.round(a * 255) - np.round(b * 255)) > 32).mean())


def raw_changed(pa, pb):  # at full resolution, on the RGBA renders, for the record
    x = np.asarray(Image.open(pa), dtype=int); y = np.asarray(Image.open(pb), dtype=int)
    return float((np.abs(x - y).max(-1) > 32).mean()), bool((x == y).all())


boil = {"size": [BW, BW], "threshold": 32, "ref": {}, "full_res": {}}
r = boil["ref"]
r["clip_on"] = [changed(ba[f"on_{i:02d}"], ba[f"on_{i + 1:02d}"]) for i in range(1, 12)]
r["clip_off"] = [changed(ba[f"off_{i:02d}"], ba[f"off_{i + 1:02d}"]) for i in range(1, 12)]
r["on_vs_off"] = [changed(ba[f"on_{i:02d}"], ba[f"off_{i:02d}"]) for i in range(1, 13)]
r["twos_steps"] = [changed(ba[f"twos_{s}"], ba[f"twos_{s + 1}"]) for s in range(1, 5)]
r["ones_steps"] = [changed(ba[f"ones_{s}"], ba[f"ones_{s + 1}"]) for s in range(1, 5)]
r["single5_vs_seq5"] = changed(ba["single5"], ba["on_05"])
r["single5_vs_seq5_sn0"] = changed(ba["single5_sn0"], ba["seq5_sn0"])
f = boil["full_res"]
f["on_vs_on2"] = [raw_changed(os.path.join(RAW, "boil/on", f"frame_{i:04d}.png"), os.path.join(RAW, "boil/on2", f"frame_{i:04d}.png")) for i in range(1, 13)]
f["single5_vs_seq5"] = raw_changed(os.path.join(RAW, "boil/single5/frame_0005.png"), os.path.join(RAW, "boil/on/frame_0005.png"))
f["single5_vs_seq5_sn0"] = raw_changed(os.path.join(RAW, "boil/single5_sn0/frame_0005.png"), os.path.join(RAW, "boil/seq_sn0/frame_0005.png"))
f["ones_steps"] = [raw_changed(os.path.join(RAW, "boil/ones", f"render_{s}.png"), os.path.join(RAW, "boil/ones", f"render_{s + 1}.png")) for s in range(1, 5)]
f["twos_steps"] = [raw_changed(os.path.join(RAW, f"boil/twos{s}/still.png"), os.path.join(RAW, f"boil/twos{s + 1}/still.png")) for s in range(1, 5)]
f["clip_on"] = [raw_changed(os.path.join(RAW, "boil/on", f"frame_{i:04d}.png"), os.path.join(RAW, "boil/on", f"frame_{i + 1:04d}.png")) for i in range(1, 12)]
f["on_vs_off"] = [raw_changed(os.path.join(RAW, "boil/on", f"frame_{i:04d}.png"), os.path.join(RAW, "boil/off", f"frame_{i:04d}.png")) for i in range(1, 13)]
meta["boil"] = boil

json.dump(meta, open(os.path.join(OUT, "sheets.json"), "w"), indent=1)
print(json.dumps({k: (v if k != "seam" else [(i["key"], i.get("ref")) for i in v["items"]]) for k, v in meta.items() if k in ("seam", "boil")}, indent=1)[:6000])
for it in lines["items"]:
    print(it["key"], "weight %.2f stray %.2f off3 %.3f off12 %.4f" % (it["ref"]["weight"], it["ref"]["stray"], it["ref"]["off3"], it["ref"]["off12"]))
