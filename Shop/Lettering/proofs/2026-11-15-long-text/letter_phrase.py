#!/usr/bin/env python3
"""
Lettering, 2026-11-15: probe "long legible text" with a three-word phrase, old route against new.

  old  (ComfyUI server up on 127.0.0.1:8188, Shop/ComfyUI's Run line):
       _tools/ComfyUI/venv/bin/python "Shop/Lettering/proofs/2026-11-15-long-text/letter_phrase.py" sdxl
       -> BLUELINE's render_text.py, skeleton mode (Bangers skeleton + canny-locked SDXL, Study tier,
          1216x832, 36 steps), one seed, into this folder.
  new  (no local weights; a free Hugging Face Space, no token sent):
       python3 "Shop/Lettering/proofs/2026-11-15-long-text/letter_phrase.py" zimage
       python3 "Shop/Lettering/proofs/2026-11-15-long-text/letter_phrase.py" qwen
       -> the same words and the same prompt, free-hand (no skeleton), to see whether a 2025-26 model
          spells it on its own.

The probe voice is added in memory; text-prompts.json is not touched. Written 2026-11-15. A maker
who can do better another way does so, and leaves the comparison on the scroll.
"""
import importlib.util, json, os, shutil, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
BENCH = os.path.abspath(os.path.join(HERE, "..", "..", "..", "..", "Projects", "BLUELINE", "proofs", "text-layer"))
PROBE = {
    "id": "probe-dontletgo", "voice": "probe", "type": "dialogue", "source": "a falling climber's partner",
    "diegesis": "diegetic", "addressee": "the one slipping", "emotion": "desperate pleading, grip failing",
    "words": "DON'T LET GO", "font": "Bangers",
    "positive": "the words \"DON'T LET GO\" cried out in desperate pleading, three short hand-lettered words "
                "straining and stretching as if held by a slipping grip, strokes fraying and dripping at their "
                "ends, bone-white ink struck hard",
}
SEED = 1111


def spec():
    return json.load(open(os.path.join(BENCH, "text-prompts.json")))


def full_prompt():
    return f'{PROBE["positive"]}, {spec()["style_suffix"]}'


def sdxl():
    s = importlib.util.spec_from_file_location("render_text", os.path.join(BENCH, "render_text.py"))
    rt = importlib.util.module_from_spec(s); sys.argv = [sys.argv[0]]; s.loader.exec_module(rt)
    for k in ("OUT", "SKEL", "DESAT"):
        d = os.path.join(HERE, k.lower()); os.makedirs(d, exist_ok=True); setattr(rt, k, d)
    rt.contact_sheet = lambda *_: None
    rt.SPEC["prompts"].append(PROBE)
    t0 = time.time(); rt.main({PROBE["id"]}, 1, "skeleton", 0.78)
    return {"engine": "sdxl+canny skeleton (local, MPS)", "seconds": round(time.time() - t0, 1),
            "out": f"out/{PROBE['id']}_skeleton_s{SEED}.png", "skeleton": f"skel/{PROBE['id']}.png"}


def space(name):
    os.environ["HF_HUB_DISABLE_IMPLICIT_TOKEN"] = "1"  # send no token, spend nothing
    from gradio_client import Client
    os.makedirs(os.path.join(HERE, "out"), exist_ok=True)
    t0 = time.time()
    if name == "zimage":
        c = Client("Tongyi-MAI/Z-Image-Turbo", verbose=False)
        imgs, used, _ = c.predict(full_prompt(), "1248x832 ( 3:2 )", SEED, 8, 3.0, False, [], api_name="/generate")
        src = imgs[0]["image"] if isinstance(imgs[0].get("image"), str) else imgs[0]["image"]["path"]
        meta = {"engine": "Z-Image-Turbo (HF Space Tongyi-MAI/Z-Image-Turbo, 8 steps)", "seed_used": used}
    else:
        c = Client("Qwen/Qwen-Image", verbose=False)
        res, used = c.predict(full_prompt(), SEED, False, "3:2", 4.0, 50, False, api_name="/infer")
        src = res if isinstance(res, str) else res["path"]
        meta = {"engine": "Qwen-Image (HF Space Qwen/Qwen-Image, 50 steps, prompt_enhance off)", "seed_used": used}
    dest = os.path.join(HERE, "out", f"{PROBE['id']}_{name}_s{SEED}{os.path.splitext(src)[1] or '.png'}")
    shutil.copy(src, dest)
    meta.update({"seconds_incl_queue": round(time.time() - t0, 1), "out": os.path.relpath(dest, HERE)})
    return meta


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "sdxl"
    r = sdxl() if which == "sdxl" else space(which)
    r.update({"words": PROBE["words"], "prompt": full_prompt(), "seed": SEED, "date": "2026-11-15"})
    mpath = os.path.join(HERE, "measured.json")
    m = json.load(open(mpath)) if os.path.exists(mpath) else {}
    m[which] = r
    json.dump(m, open(mpath, "w"), indent=2)
    print(json.dumps(r, indent=2))
