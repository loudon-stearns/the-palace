"""
title: Remnants in Depth — rich — make sheets
born: 2026-11-03
links: [[Remnants in Depth]] connects-to · rich-face workshop · reads "Remnants in Depth — rich — render plates.py"
forward_vector: I turn the Blender plates into the small grey sheets the rich face's two pieces play, and I measure
  them with numpy and scipy, so the pieces' own engines have numbers to agree with. I also fit the metaball to the
  BLUELINE mark (fit), and I run blob_synth.py twice against two opposite signatures to see whether the analysis
  really sets its knobs (knobs).

Run from the palace root, python3 with numpy, scipy and Pillow:
  python3 "Remnants in Depth/Remnants in Depth — rich — make sheets.py" fit
  python3 "Remnants in Depth/Remnants in Depth — rich — make sheets.py" sheets $OUT
  python3 "Remnants in Depth/Remnants in Depth — rich — make sheets.py" knobs
"""
import json, os, sys, hashlib, tempfile, glob, shutil
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

B = "Remnants in Depth"
SH = os.path.join(B, "sheets")
BENCH = "Projects/BLUELINE/proofs/blender-handdrawn"
MARK = os.path.join(BENCH, "followups/flowfield-spatter/synth/synth_001.png")


def fit():
    """Cover the mark with discs, biggest first, each centred on the deepest ink not yet covered."""
    a = np.asarray(Image.open(MARK))[..., 3] > 127
    H, W = a.shape
    dt = ndi.distance_transform_edt(a)
    yy, xx = np.mgrid[0:H, 0:W]
    cov = np.zeros_like(a); balls = []
    while len(balls) < 400:
        cand = np.where(a & ~cov, dt, 0); i = int(np.argmax(cand)); r = float(cand.flat[i])
        if r < 1.5: break
        y, x = divmod(i, W); balls.append((x, y, r))
        cov |= (xx - x) ** 2 + (yy - y) ** 2 <= r * r
    json.dump(dict(src=MARK.split("/proofs/")[1], size=[W, H],
                   balls=[[int(x), int(y), round(r, 2)] for x, y, r in balls]),
              open(os.path.join(SH, "mark-balls.json"), "w"))
    print(len(balls), "balls")


# ---- the measures; the pieces' engines do the same, and the checks hold them to these numbers
def dark(a, t=128): return a < t
def dil(m, k): return ndi.binary_dilation(m, iterations=k) if k else m          # 4-neighbour cross, as the engine
def ero(m, k): return ndi.binary_erosion(m, iterations=k) if k else m
def iou(a, b):
    u = (a | b).sum(); return float((a & b).sum() / u) if u else 0.0
def parts(m): return int(ndi.label(m)[1])                                       # 4-connected, as the engine


def grey_on_white(path):
    im = np.asarray(Image.open(path).convert("RGBA")).astype(float)
    a = im[..., 3] / 255.0
    return np.clip(np.round(im[..., :3].mean(-1) * a + 255 * (1 - a)), 0, 255).astype(np.uint8)


def comp_measures(G):
    """G: name -> grey array. Lines kept in each quad's empty corners, the quad's edge ring, B's occlusion."""
    lines = dark(G["ref"]); out = {}
    for tag in ("L1_blend", "L1_dith", "L2_blend", "L2_dith", "L2_blend_raw", "L2_blend_repeat", "L2_blend_raw_repeat"):
        if tag not in G: continue
        T = G[tag]; td = dark(T); r = {}
        for k in ("A", "B"):
            Q, I = dark(G["quad" + k]), dark(G["ink" + k])
            corners = Q & ~dil(I, 2)
            base = int((lines & corners).sum()); kept = int((lines & corners & td).sum())
            ring = dil(Q, 3) & ~ero(Q, 3) & ~dil(I, 3) & ~dil(lines, 2)
            d = np.abs(T.astype(int) - G["ref"].astype(int))[ring]
            r[k] = dict(corner_lines=base, kept=kept, kept_share=kept / base if base else 1.0,
                        ring_px=int(ring.sum()), ring_moved=int((d > 4).sum()), ring_max=int(d.max()))
        QB = dark(G["quadB"])
        vis = td & ~lines & QB; truth = dark(G["truthB"]) & QB & ~lines
        r["B_visible"] = int(vis.sum()); r["B_truth"] = int(truth.sum()); r["B_xor"] = int((vis ^ truth).sum())
        r["lines_lost"] = int((lines & ~td).sum())
        out[tag] = r
    out["lines_total"] = int(lines.sum())
    out["B_hidden_share"] = 1 - float(dark(G["truthB"]).sum() / dark(G["inkB"]).sum())
    out["L1_blend_vs_L1_dith"] = int((np.abs(G["L1_blend"].astype(int) - G["L1_dith"].astype(int)) > 4).sum()) if "L1_blend" in G else None
    return out


def overlap_measures(G):
    """The overlap case: near card M's empty square over B, which a building mostly hides. Leak = ink the
    composite shows that a plain depth test (B alone, M alone, each with the buildings) does not, a pixel's
    antialiasing allowed either side."""
    if "OV_blend" not in G: return None
    lines = dark(G["ref"]); truth = dark(G["truthB"]) | dark(G["truthM"]); QM = dark(G["quadM"])
    out = {}
    for tag in ("OV_blend", "OV_dith"):
        T = dark(G[tag]); leak = T & ~dil(lines, 1) & ~dil(truth, 1)
        cols = np.where(leak.any(0))[0]
        out[tag] = dict(leak=int(leak.sum()), in_square=int((leak & dil(QM, 2)).sum()),
                        last_col=int(cols.max()) if len(cols) else None, missing=int((truth & ~T).sum()))
    xs = np.where(QM.any(0))[0]; out["quadM_right"] = int(xs.max())
    return out


def sheets(OUT):
    os.makedirs(os.path.join(SH, "orbit"), exist_ok=True); os.makedirs(os.path.join(SH, "comp"), exist_ok=True)
    meta = {"orbit": json.load(open(os.path.join(OUT, "orbit", "orbit.json"))),
            "comp": json.load(open(os.path.join(OUT, "comp", "comp.json")))}
    # orbit: crop 264 x 264 round the mark, grey on white
    ox, oy, S = 124, 124, 264
    O = {}
    for th in meta["orbit"]["angles"]:
        for k in ("card_face", "card_fixed", "glob_ink", "glob_lit"):
            g = grey_on_white(os.path.join(OUT, "orbit", f"{k}_{th:02d}.png"))[oy:oy + S, ox:ox + S]
            Image.fromarray(g, "L").save(os.path.join(SH, "orbit", f"{k}_{th:02d}.png"), optimize=True)
            O[(k, th)] = g
    ty, TH = 176, 160
    T = []
    for i in range(len(meta["orbit"]["truck"])):
        g = grey_on_white(os.path.join(OUT, "orbit", f"truck_{i}.png"))[ty:ty + TH]
        Image.fromarray(g, "L").save(os.path.join(SH, "orbit", f"truck_{i}.png"), optimize=True)
        cen = {}
        for nm in ("near", "far"):
            m = dark(grey_on_white(os.path.join(OUT, "orbit", f"truck_{i}_{nm}.png"))[ty:ty + TH])
            cen[nm] = dict(x=float(ndi.center_of_mass(m)[1]), ink=int(m.sum()))
        T.append(cen)
    front = O[("card_face", 0)] < 200
    rows = []
    for th in meta["orbit"]["angles"]:
        row = {"angle": th}
        for k in ("card_face", "card_fixed", "glob_ink", "glob_lit"):
            s = O[(k, th)] < 200
            row[k] = dict(iou=iou(s, front), parts=parts(s), ink=int(s.sum()))
        rows.append(row)
    o = meta["orbit"]; f_px = o["lens"] / o["sensor"] * o["width"]
    meta["orbit"].update(crop=[ox, oy, S, S], truck_crop=[0, ty, o["width"], TH], f_px=f_px, rows=rows, truck_centroids=T,
                         silhouette="grey below 200 on white", note="IoU against card_face at 0, the drawn mark; parts are 4-connected")
    # comp: one crop holding both billboards and the street between
    cx, cy, CW, CH = 150, 140, 780, 340
    names = ["ref", "L1_blend", "L1_dith", "L2_blend", "L2_dith", "L2_blend_raw", "L2_blend_repeat", "L2_blend_raw_repeat",
             "inkA", "quadA", "inkB", "quadB", "truthB", "OV_blend", "OV_dith", "quadM", "truthM"]
    G = {}; FULL = {}
    for n in names:
        p = os.path.join(OUT, "comp", n + ".png")
        if not os.path.exists(p): continue
        full = np.asarray(Image.open(p).convert("L")); FULL[n] = full
        G[n] = full[cy:cy + CH, cx:cx + CW].copy()
        Image.fromarray(G[n], "L").save(os.path.join(SH, "comp", n + ".png"), optimize=True)
    ys, xs = np.where(dark(G["quadA"]))
    meta["comp"].update(crop=[cx, cy, CW, CH], quadA_in_crop=[int(xs.min()) - 20, int(ys.min()) - 20, 240, 240], measures=comp_measures(G), full_res=comp_measures(FULL),
                        overlap=overlap_measures(G), overlap_full_res=overlap_measures(FULL),
                        rules=dict(dark="grey below 128", corners="quad minus the ink grown 2 px",
                                   ring="3 px either side of the quad's edge, minus the ink grown 3 px and the lines grown 2 px",
                                   moved="differs from the plain street by more than 4 of 255",
                                   leak="ink the composite shows outside the lines and the truth (each grown 1 px)"))
    json.dump(meta, open(os.path.join(SH, "sheets.json"), "w"), indent=1)
    print(json.dumps(meta["comp"]["measures"], indent=1)[:3000])
    for r in rows: print(r["angle"], {k: round(v["iou"], 3) for k, v in r.items() if k != "angle"}, {k: v["parts"] for k, v in r.items() if k != "angle"})


def knobs():
    """Does the measured circularity reach blob_synth.py? Run it twice, against two opposite signatures."""
    src = open(os.path.join(BENCH, "scripts", "blob_synth.py")).read()
    digests = {}
    for tag, circ in (("round", dict(mean=0.99, p10=0.95)), ("ragged", dict(mean=0.30, p10=0.10))):
        d = tempfile.mkdtemp(prefix="rid-knobs-")
        json.dump({"circularity": circ}, open(os.path.join(d, "blob-character.json"), "w"))
        code = src.replace('ROOT = "/Users/loudonstearns/Documents/The Palace/Projects/BLUELINE/proofs/blender-handdrawn"', "ROOT = %r" % d)
        code = code.replace('LIB = os.path.join(ROOT, "blob-library")', "LIB = ROOT")
        exec(compile(code, "blob_synth.py", "exec"), {"__name__": "knobs"})
        h = hashlib.sha256()
        for p in sorted(glob.glob(os.path.join(d, "synth", "synth_*.png"))): h.update(open(p, "rb").read())
        digests[tag] = dict(circularity=circ, files=len(glob.glob(os.path.join(d, "synth", "synth_*.png"))), sha256=h.hexdigest()[:16])
        shutil.rmtree(d)
    digests["identical"] = digests["round"]["sha256"] == digests["ragged"]["sha256"]
    meta = json.load(open(os.path.join(SH, "sheets.json"))); meta["knobs"] = digests
    json.dump(meta, open(os.path.join(SH, "sheets.json"), "w"), indent=1)
    print(json.dumps(digests, indent=1))
    return digests


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "fit": fit()
    elif cmd == "sheets": sheets(sys.argv[2])
    elif cmd == "knobs": knobs()
