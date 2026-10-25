#!/usr/bin/env python3
"""Blank blueprint paper plates for the hand-drafted Loud'n Live look (rough 5's F).

The paper is the only generated layer: the drawing and every word stay vector on
top, so nothing here may carry a mark. Local SDXL on ComfyUI (free), one plate
first, then the batch.

  _tools/ComfyUI/venv/bin/python plates/make_plates.py --only 1     # one plate, look at it
  _tools/ComfyUI/venv/bin/python plates/make_plates.py              # all eight
  _tools/ComfyUI/venv/bin/python plates/make_plates.py --init plates/reference/cyanotype-paper-init.png --denoise .6
      # img2img from Loudon's reference print's blank paper (2026-10-25): plate-r01 ... r08

Needs ComfyUI running on 127.0.0.1:8188 (_tools/ComfyUI/main.py).
"""
import argparse, json, os, time, urllib.request, uuid

HOST = os.environ.get("COMFY_HOST", "127.0.0.1:8188")
HERE = os.path.dirname(os.path.abspath(__file__))
CKPT = "sd_xl_base_1.0.safetensors"

# Medium first (the Hero and Avatar Maker's lesson); a flat scan, never a photo of a desk.
# SDXL draws a "blueprint" as a drawing, so the plate is plain aged paper; the page
# tints it navy and uses it only as a tone map under the vector sheet.
BASE = ("flat scan of a blank sheet of old drafting paper, ")
TAIL = (", top-down, filling the whole frame, even light, fine visible paper fibre, matte, nothing printed on it")
WEAR = [  # ComfyUI weights (phrase:1.15) so the wear isn't drowned by "blank"
    "(folded in quarters:1.15), (sharp crease lines crossing at the centre:1.15)",
    "(a small faint brown coffee cup ring stain:1.15) near the lower left",
    "(foxing spots:1.15), (sun-faded edges:1.15)",
    "(eraser abrasion patches:1.15), (smudged graphite haze:1.15)",
    "(a small torn corner:1.15), (two strips of yellowed tape residue:1.15)",
    "(folded in quarters with sharp crease lines:1.15), (a small faint coffee cup ring stain:1.15)",
    "(uneven sun-faded exposure:1.15), (a few dried water spots:1.15)",
    "(folded in quarters:1.15), (light foxing:1.1), (a faint coffee cup ring:1.15), (eraser haze:1.1)",
]
NEG = ("text, letters, numbers, words, writing, handwriting, signature, watermark, logo, stamp, "
       "drawing, diagram, plan, schematic, grid, lines, ruler, pencil, pen, "
       "3d render, CGI, glossy, photo of a desk, table, wood, hands, perspective, shadow, frame, border, vignette, "
       "white margin, paper edge, torn edge, deckle edge, patches, squares, rectangles, collage, quilt, map, aerial view, city")


REF_BASE = "flat scan of a blank sheet of old cyanotype blueprint paper, deep prussian blue, "
REF_NEG = ", building, architecture, windows, facade"


def graph(prompt, seed, init=None, denoise=1.0):
    return {
        "1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": CKPT}},
        "2": {"class_type": "CLIPTextEncode", "inputs": {"text": prompt, "clip": ["1", 1]}},
        "3": {"class_type": "CLIPTextEncode", "inputs": {"text": NEG + (REF_NEG if init else ""), "clip": ["1", 1]}},
        "4": ({"class_type": "EmptyLatentImage", "inputs": {"width": 1344, "height": 768, "batch_size": 1}} if not init else
              {"class_type": "VAEEncode", "inputs": {"pixels": ["8", 0], "vae": ["1", 2]}}),
        "5": {"class_type": "KSampler", "inputs": {"model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0],
              "latent_image": ["4", 0], "seed": seed, "steps": 30, "cfg": 6.0,
              "sampler_name": "dpmpp_2m", "scheduler": "karras", "denoise": denoise}},
        "6": {"class_type": "VAEDecode", "inputs": {"samples": ["5", 0], "vae": ["1", 2]}},
        "7": {"class_type": "SaveImage", "inputs": {"images": ["6", 0], "filename_prefix": "ll-plate"}},
        **({"8": {"class_type": "LoadImage", "inputs": {"image": init}}} if init else {}),
    }


def req(path, data=None):
    r = urllib.request.Request(f"http://{HOST}{path}", data=json.dumps(data).encode() if data else None,
                               headers={"Content-Type": "application/json"} if data else {})
    with urllib.request.urlopen(r, timeout=60) as f:
        return f.read()


def upload(path):
    """Put the start image in ComfyUI's input folder (multipart, stdlib only)."""
    b = uuid.uuid4().hex
    name = os.path.basename(path)
    body = (f"--{b}\r\nContent-Disposition: form-data; name=\"image\"; filename=\"{name}\"\r\n"
            f"Content-Type: image/png\r\n\r\n").encode() + open(path, "rb").read() + \
           f"\r\n--{b}\r\nContent-Disposition: form-data; name=\"overwrite\"\r\n\r\ntrue\r\n--{b}--\r\n".encode()
    r = urllib.request.Request(f"http://{HOST}/upload/image", data=body, headers={"Content-Type": f"multipart/form-data; boundary={b}"})
    with urllib.request.urlopen(r, timeout=60) as f:
        return json.loads(f.read())["name"]


def render(i, init=None, denoise=1.0):
    prompt = (REF_BASE if init else BASE) + WEAR[i - 1] + TAIL
    seed = 2026102500 + i
    pid = json.loads(req("/prompt", {"prompt": graph(prompt, seed, init, denoise), "client_id": str(uuid.uuid4())}))["prompt_id"]
    t0 = time.time()
    while True:
        h = json.loads(req(f"/history/{pid}"))
        if pid in h and h[pid].get("outputs"):
            break
        if time.time() - t0 > 900:
            raise TimeoutError(f"plate {i} took too long")
        time.sleep(2)
    img = h[pid]["outputs"]["7"]["images"][0]
    q = f"/view?filename={img['filename']}&subfolder={img['subfolder']}&type={img['type']}"
    out = os.path.join(HERE, f"plate-{'r' if init else ''}{i:02d}.png")
    with open(out, "wb") as f:
        f.write(req(q))
    print(f"plate {'r' if init else ''}{i:02d}  {time.time() - t0:5.1f}s  seed {seed}  {WEAR[i - 1]}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", type=int)
    ap.add_argument("--init")
    ap.add_argument("--denoise", type=float, default=1.0)
    a = ap.parse_args()
    init = upload(a.init) if a.init else None
    for i in ([a.only] if a.only else range(1, len(WEAR) + 1)):
        render(i, init, a.denoise if init else 1.0)
