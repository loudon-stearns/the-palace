#!/usr/bin/env python3
"""
Lettering — rich face plates and measures.
  born: 2026-11-03 · links: [[Lettering]] (workshop for its rich face)
  forward_vector: I turn BLUELINE's text-layer proofs into small plates the rich face can show, and I measure
  the two things the pieces test — how much of the font's outline each stage still draws, and how lit the field
  is around the knocked-out word. Re-run me from the palace root; I write plates/ and plates/measures.json.

  python3 "Shop/Lettering/plates/make-plates.py"

Sources (all tracked by git):
  Projects/BLUELINE/proofs/text-layer/{skel,skel-preview,desat,out}/ at HEAD — the Chalkduster-era proofs (28e9adaa)
  the same folders at 4e863210 — the Impact-era proofs, read with `git show` (mechanical skeleton, firm canny)
"""
import io, json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

ROOT = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True,
                      cwd=os.path.dirname(os.path.abspath(__file__))).stdout.strip()
TL = "Projects/BLUELINE/proofs/text-layer"
OUT = os.path.join(ROOT, "Shop/Lettering/plates")
IMPACT_REV = "4e863210"
IDS = ["ascension", "shout-no", "whisper-stay", "sfx-thoom", "dying-toolate", "lyric-burning", "thought-real"]
W, H = 760, 520          # plate size (the proofs are 1216 x 832, the same aspect)
FRAG = 300               # fragment plate side

def head(rel):  return Image.open(os.path.join(ROOT, TL, rel))
def hist(rel):  return Image.open(io.BytesIO(subprocess.run(["git", "show", f"{IMPACT_REV}:{TL}/{rel}"],
                                   capture_output=True, cwd=ROOT, check=True).stdout))
def save(img, name, size=(W, H)):
    img.convert("RGB").resize(size, Image.LANCZOS).save(os.path.join(OUT, name), "WEBP", quality=80, method=6)
def lum(img):   return np.asarray(img.convert("L"), dtype=np.float64) / 255.0

# ---- canny, after ComfyUI's Canny node (kornia): gaussian 5x5 sigma 1, normalized sobel, NMS, hysteresis 0.1/0.3
def canny(g, low=0.1, high=0.3):
    b = ndi.gaussian_filter(g, 1.0, truncate=2.0)
    kx = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], float) / 8.0
    gx = ndi.convolve(b, kx); gy = ndi.convolve(b, kx.T)
    mag = np.hypot(gx, gy); ang = (np.rad2deg(np.arctan2(gy, gx)) + 180) % 180
    q = np.round(ang / 45).astype(int) % 4
    off = {0: (0, 1), 1: (1, 1), 2: (1, 0), 3: (1, -1)}
    keep = np.zeros_like(mag, bool)
    for k, (dy, dx) in off.items():
        n1 = np.roll(np.roll(mag, dy, 0), dx, 1); n2 = np.roll(np.roll(mag, -dy, 0), -dx, 1)
        keep |= (q == k) & (mag >= n1) & (mag >= n2)
    nms = np.where(keep, mag, 0)
    strong = nms >= high; weak = nms >= low
    lab, n = ndi.label(weak, structure=np.ones((3, 3)))
    hit = np.unique(lab[strong]); return np.isin(lab, hit[hit > 0])

# ---- outline held: of the font's outline (canny of the skeleton), the share where the image still has an edge
#      in the same place running the same way (gradients at sigma 2 within 25 degrees, |cos| > 0.9, and the
#      image's edge at least its median strength). Contrast-blind on purpose: a grey letter on black counts as
#      much as a white one. Chance: the same outline slid to eight places it doesn't belong, averaged.
def _g(x):
    b = ndi.gaussian_filter(x, 2.0); return ndi.sobel(b, 1), ndi.sobel(b, 0)
def outline_held(img_g, skel_g, outline):
    ix, iy = _g(img_g); sx, sy = _g(skel_g); ms = np.hypot(sx, sy) + 1e-9
    floor = np.percentile(np.hypot(ix, iy), 50)
    def score(dy=0, dx=0):
        IX = np.roll(np.roll(ix, -dy, 0), -dx, 1); IY = np.roll(np.roll(iy, -dy, 0), -dx, 1); MI = np.hypot(IX, IY) + 1e-9
        ok = (np.abs(IX * sx + IY * sy) / (MI * ms) > 0.9) & (MI > floor); return ok[outline].mean()
    shifts = [(0, 180), (0, -180), (140, 0), (-140, 0), (120, 220), (-120, -220), (120, -220), (-120, 220)]
    return round(float(score()), 3), round(float(np.mean([score(dy, dx) for dy, dx in shifts])), 3)

# ---- the void's field: the knockout's own mask (skeleton, MaxFilter 5), then the ring 3–15 px outside it
def void_field(neg, skel):
    m = np.asarray(skel.convert("L").resize(neg.size).filter(ImageFilter.MaxFilter(5))) > 127
    ring = ndi.binary_dilation(m, iterations=15) & ~ndi.binary_dilation(m, iterations=3)
    L = lum(neg); return round(float(L[ring].mean()), 3), round(float((L[ring] > 0.35).mean()), 3)

# ---- fragments: one letter's square, cut from the same place in every stage of one voice
PICK = {  # (which component, in reading order) — chosen so the fragment holds about one letter
    "ascension": 3, "shout-no": 1, "whisper-stay": 2, "sfx-thoom": 2, "dying-toolate": 4, "lyric-burning": 2, "thought-real": -2,
}
def letter_box(skel_img, idx):
    a = np.asarray(skel_img.convert("L")) > 128
    lab, n = ndi.label(ndi.binary_dilation(a, iterations=4))
    boxes = [s for s in ndi.find_objects(lab) if (s[0].stop - s[0].start) * (s[1].stop - s[1].start) > 1500]
    boxes.sort(key=lambda s: ((s[0].start + s[0].stop) // 220, s[1].start))   # rows, then left to right
    s = boxes[idx]; cy = (s[0].start + s[0].stop) / 2; cx = (s[1].start + s[1].stop) / 2
    side = 1.25 * max(s[0].stop - s[0].start, s[1].stop - s[1].start)
    return (cx, cy, side, len(boxes))
def cut(img, box):
    cx, cy, side, _ = box; h = side / 2
    return img.crop((int(cx - h), int(cy - h), int(cx + h), int(cy + h))).resize((FRAG, FRAG), Image.LANCZOS)

# the font round: the same letter the ink fragment holds, set alone in the voice's own font (text-prompts.json)
FONTS = {"ascension": "NewRocker", "shout-no": "Bangers", "whisper-stay": "ShadowsIntoLight", "sfx-thoom": "Frijole",
         "dying-toolate": "Nosifer", "lyric-burning": "MetalMania", "thought-real": "SpecialElite"}
LETTER = {"ascension": "E", "shout-no": "O", "whisper-stay": "a", "sfx-thoom": "O", "dying-toolate": "a", "lyric-burning": "R", "thought-real": "a"}
def glyph(font, ch):
    from PIL import ImageDraw, ImageFont
    big = Image.new("L", (900, 900), 0); d = ImageDraw.Draw(big)
    f = ImageFont.truetype(os.path.join(ROOT, TL, "fonts/lib", font + ".ttf"), 520)
    d.text((450, 450), ch, font=f, fill=255, anchor="mm")
    x0, y0, x1, y1 = big.getbbox(); side = 1.3 * max(x1 - x0, y1 - y0); cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    return big.crop((int(cx - side / 2), int(cy - side / 2), int(cx + side / 2), int(cy + side / 2))).resize((FRAG, FRAG), Image.LANCZOS).convert("RGB")

def main():
    os.makedirs(OUT, exist_ok=True)
    meas = {"made": "2026-11-03", "sources": {"chalkduster_era": "HEAD (28e9adaa)", "impact_era": IMPACT_REV},
            "method": {"outline_held": "[score, chance] — of the skeleton's canny outline, the share where the image has an edge in the same place running the same way (sigma 2 gradients, |cos| > 0.9, at least the image's median edge strength); chance = the outline slid to 8 wrong places",
                       "void_field": "the negspace image's mean luminance (0–1) in a ring 3–15 px outside the knockout mask, and the share of that ring brighter than 0.35"},
            "voices": {}}
    rng = np.random.default_rng(1111); order = list(rng.permutation(len(IDS)))
    for i in IDS:
        sk = head(f"skel/{i}.png"); pv = head(f"skel-preview/{i}.png")
        photo = head(f"out/{i}_skeleton_s1111.png"); de = head(f"desat/{i}_s1111.png")
        ink = head(f"out/{i}_stylize_s1111.png"); neg = head(f"out/{i}_negspace_s1111.png")
        isk = hist(f"skel/{i}.png"); iph = hist(f"out/{i}_skeleton_s1111.png"); iink = hist(f"out/{i}_stylize_s1111.png")
        edges = canny(lum(sk))
        save(pv, f"{i}-font.webp"); save(sk, f"{i}-skeleton.webp")
        save(Image.fromarray((ndi.binary_dilation(edges, iterations=1) * 255).astype(np.uint8)), f"{i}-canny.webp")  # drawn 3 px wide so it survives the downsize
        save(photo, f"{i}-photoreal.webp"); save(de, f"{i}-desat.webp"); save(ink, f"{i}-ink.webp"); save(neg, f"{i}-void.webp")
        save(isk, f"{i}-impact-skeleton.webp"); save(iph, f"{i}-impact-photoreal.webp"); save(iink, f"{i}-impact-ink.webp")
        iedges = canny(lum(isk))
        v = {"canny_px": int(edges.sum()),
             "outline_held": {"photoreal": outline_held(lum(photo), lum(sk), edges), "ink": outline_held(lum(ink), lum(sk), edges)},
             "impact_outline_held": {"photoreal": outline_held(lum(iph), lum(isk), iedges), "ink": outline_held(lum(iink), lum(isk), iedges)},
             "void_field": void_field(neg, sk)}
        # fragments: ink (the full pipeline) and font (the per-voice skeleton the page names)
        n = order[IDS.index(i)] + 1
        b1 = letter_box(sk, PICK[i])
        cut(ink, b1).convert("RGB").save(os.path.join(OUT, f"frag-ink-{n}.webp"), "WEBP", quality=82, method=6)
        glyph(FONTS[i], LETTER[i]).save(os.path.join(OUT, f"frag-font-{n}.webp"), "WEBP", quality=82, method=6)
        v["fragment"] = {"n": int(n), "letter": LETTER[i], "font": FONTS[i], "ink_box": [round(x) for x in b1[:3]], "components": b1[3]}
        meas["voices"][i] = v
        print(i, json.dumps(v))
    # the blind test's first steps use the older, Impact-era "too late" — not one of the plates the test shows
    old = hist("out/dying-toolate_stylize_s1111.png"); save(old, "intro-toolate-impact-ink.webp")
    oldsk = hist("skel/dying-toolate.png"); cut(old, letter_box(oldsk, 4)).convert("RGB").save(os.path.join(OUT, "intro-toolate-impact-frag.webp"), "WEBP", quality=82, method=6)
    th = head("skel/sfx-thoom.png")
    meas["free_thoom"] = {"what": "out/sfx-thoom_s1111.png, --mode free (no skeleton, no lock), same prompt and seed, against the THOOM skeleton",
                          "outline_held": outline_held(lum(head("out/sfx-thoom_s1111.png")), lum(th), canny(lum(th)))}
    print("free thoom", meas["free_thoom"]["outline_held"])
    json.dump(meas, open(os.path.join(OUT, "measures.json"), "w"), indent=1)

if __name__ == "__main__":
    main()
