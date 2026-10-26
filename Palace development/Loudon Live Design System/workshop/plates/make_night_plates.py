#!/usr/bin/env python3
"""Night plates for the third look: rain on dark glass, the city out of focus behind it.

The deepest layer only, and blurred in the page, so nothing in it reads as a mark;
the anti-text clause still rides every prompt (neon signs bring lettering).

  _tools/ComfyUI/venv/bin/python plates/make_night_plates.py          # n01 ... n04
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_plates as mp

mp.NEG = ("text, letters, words, signs, signage, kanji, logo, watermark, signature, numbers, "
          "people, person, face, car, sharp buildings, daylight, 3d render, CGI, cartoon")
PROMPTS = [
    "rain streaming down a dark window at night, out of focus magenta and cyan neon city lights behind the glass, heavy water droplets and rivulets, gritty film grain, moody, very dark",
    "close-up of a wet windshield at night in heavy rain, bokeh of hot pink, electric blue and amber neon lights, smeared reflections, grainy, cinematic, dark",
    "dirty rain-soaked glass at night, blurred neon glow in violet and acid green, condensation, grime and streaks on the glass, film grain, dark and moody",
    "night rain on a scratched dirty window, deep shadows, distant blurred magenta and cyan neon, fog and haze, droplets catching light, grainy, very dark",
]

for i, p in enumerate(PROMPTS, 1):
    pid_seed = 2026102590 + i
    import json, time, uuid
    pid = json.loads(mp.req("/prompt", {"prompt": mp.graph(p, pid_seed), "client_id": str(uuid.uuid4())}))["prompt_id"]
    t0 = time.time()
    while True:
        h = json.loads(mp.req(f"/history/{pid}"))
        if pid in h and h[pid].get("outputs"):
            break
        time.sleep(2)
    img = h[pid]["outputs"]["7"]["images"][0]
    out = os.path.join(mp.HERE, f"night-n{i:02d}.png")
    open(out, "wb").write(mp.req(f"/view?filename={img['filename']}&subfolder={img['subfolder']}&type={img['type']}"))
    mp.record(out, h[pid])
    print(f"night n{i:02d}  {time.time() - t0:5.1f}s", flush=True)
