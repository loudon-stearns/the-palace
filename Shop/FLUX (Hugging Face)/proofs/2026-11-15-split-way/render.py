"""FLUX, 2026-11-15 — the split-way picture test, generated half.
Renders through Hugging Face: the two Spaces (ZeroGPU, on the account's free daily quota,
the token is sent so the account's quota is used, not the anonymous one) and, once, the
Inference API path the page was pinned to, to see whether a call is still free.

  <venv with gradio_client, huggingface_hub, pillow>/bin/python render.py [job ...]

A maker who can do this better another way does so, and leaves the comparison on the scroll."""
import json, sys, time, shutil, os
from pathlib import Path

HERE = Path(__file__).parent
SEED = 1975
W, H = 1344, 768

PLATE = ("a photograph of fireflies over a still pond at dusk, long exposure, dark treeline on the far bank, "
         "the last blue light in the sky, many small warm yellow points of light above the water and their "
         "reflections, reeds in the foreground, quiet, no people, no text")
WHOLE = ("an explainer image about fireflies falling into synchrony: a photograph of fireflies over a still pond at "
         "dusk, with a clean diagram drawn over it in thin cream ink: five small circles each with an arrow showing a "
         "firefly's phase, scattered on the left labelled 'OUT OF PHASE', all pointing the same way on the right "
         "labelled 'IN PHASE', a curved arrow between them labelled 'COUPLING K', small monospace labels")

JOBS = {
    "plate-krea":  ("space", "black-forest-labs/FLUX.1-Krea-dev", PLATE),
    "plate-klein": ("space", "black-forest-labs/flux-3-image-klein", PLATE),
    "whole-krea":  ("space", "black-forest-labs/FLUX.1-Krea-dev", WHOLE),
    "whole-klein": ("space", "black-forest-labs/flux-3-image-klein", WHOLE),
    "plate-krea-api": ("api", "black-forest-labs/FLUX.1-Krea-dev", PLATE),
}


def run(name):
    how, model, prompt = JOBS[name]
    t = time.time(); rec = {"job": name, "route": how, "model": model, "seed": SEED, "width": W, "height": H, "prompt": prompt}
    try:
        if how == "api":
            from huggingface_hub import InferenceClient
            img = InferenceClient(model=model).text_to_image(prompt=prompt, seed=SEED, width=W, height=H,
                                                             guidance_scale=4.5, num_inference_steps=28)
            img.save(HERE / f"{name}.png")
        else:
            from gradio_client import Client
            from huggingface_hub import get_token
            c = Client(model, verbose=False, token=get_token())
            if "klein" in model:
                out = c.predict(prompt=prompt, input_images=[], mode_choice="Distilled (16 steps)", seed=SEED,
                                randomize_seed=False, width=W, height=H, num_inference_steps=16,
                                guidance_scale=1.0, prompt_upsampling=False, api_name="/generate")
                path = out[0]; rec["returned_seed"] = out[1]
            else:
                out = c.predict(prompt=prompt, seed=SEED, randomize_seed=False, width=W, height=H,
                                guidance_scale=4.5, num_inference_steps=28, api_name="/infer")
                path = out[0]["path"] if isinstance(out[0], dict) else out[0]; rec["returned_seed"] = out[1]
            from PIL import Image
            Image.open(path).convert("RGB").save(HERE / f"{name}.png")
        rec["status"] = "ok"; rec["bytes"] = (HERE / f"{name}.png").stat().st_size
    except Exception as e:
        rec["status"] = f"failed: {type(e).__name__}: {str(e)[:400]}"
    rec["seconds"] = round(time.time() - t, 1)
    print(json.dumps({k: v for k, v in rec.items() if k != "prompt"}))
    return rec


if __name__ == "__main__":
    names = sys.argv[1:] or list(JOBS)
    log = HERE / "renders.json"
    done = json.loads(log.read_text()) if log.exists() else []
    for n in names:
        done.append(run(n)); log.write_text(json.dumps(done, indent=1) + "\n")
