"""Run lightonai/LightOnOCR-3-0.8B locally on a Mac (transformers+MPS or mlx-vlm) on one page; measure CER.
usage: python -I run_local.py {transformers|mlx} PAGE.png OUT_DIR"""
import sys, os, json, time, re, html, platform
backend, page, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
MID = "lightonai/LightOnOCR-3-0.8B"
truth = json.load(open(page.rsplit(".", 1)[0] + "_truth.json"))
t0 = time.time()
if backend == "transformers":
    import torch
    from transformers import AutoProcessor, Qwen3_5ForConditionalGeneration
    dev = "mps" if torch.backends.mps.is_available() else "cpu"
    model = Qwen3_5ForConditionalGeneration.from_pretrained(MID, dtype=torch.bfloat16).to(dev)
    proc = AutoProcessor.from_pretrained(MID)
    t_load = time.time() - t0
    conv = [{"role": "user", "content": [{"type": "image", "path": page}]}]
    inp = proc.apply_chat_template(conv, add_generation_prompt=True, tokenize=True, return_dict=True,
                                   return_tensors="pt", enable_thinking=False).to(dev)
    t1 = time.time()
    out = model.generate(**inp, max_new_tokens=1024, do_sample=False)
    gen = out[0, inp["input_ids"].shape[1]:]
    text = proc.decode(gen, skip_special_tokens=True); ntok = len(gen)
    t_gen = time.time() - t1; extra = {"device": dev, "torch": torch.__version__}
else:
    from mlx_vlm import load, generate
    from mlx_vlm.prompt_utils import apply_chat_template
    model, proc = load(MID); t_load = time.time() - t0
    prompt = apply_chat_template(proc, model.config, "", num_images=1, enable_thinking=False)
    t1 = time.time()
    r = generate(model, proc, prompt, image=[page], max_tokens=1024, temperature=0.0, verbose=False)
    text = r.text if hasattr(r, "text") else str(r); ntok = getattr(r, "generation_tokens", None)
    t_gen = time.time() - t1; extra = {"device": "mlx-metal"}
open(os.path.join(outdir, f"output_{backend}.md"), "w").write(text)
def norm(s):
    s = html.unescape(re.sub(r"<[^>]+>", " ", s)); s = re.sub(r"[#*|`_]", " ", s)
    return re.sub(r"\s+", " ", s).strip()
def lev(a, b):
    p = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        c = [i]
        for j, cb in enumerate(b, 1): c.append(min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (ca != cb)))
        p = c
    return p[-1]
ref = norm(truth["title"] + " " + truth["paragraph"] + " " + " ".join(" ".join(r) for r in truth["table"]))
hyp = norm(text)
cells = [c for r in truth["table"] for c in r]
res = {"date": "2026-11-15", "model": MID, "backend": backend, **extra, "machine": "Apple M1 Max, 32 GB",
       "python": platform.python_version(), "prompt": "\"\" (transcribe mode)", "decoding": "greedy, max_new_tokens 1024",
       "load_s": round(t_load, 1), "generate_s": round(t_gen, 1), "output_tokens": ntok,
       "cer": round(lev(hyp, ref) / len(ref), 4), "ref_chars": len(ref),
       "table_cells_found": sum(c in text for c in cells), "table_cells_total": len(cells),
       "table_as_html": "<table" in text, "note": "CER on whitespace-normalised text with markdown/HTML markup stripped; first run includes weight download in load_s"}
json.dump(res, open(os.path.join(outdir, f"measured_{backend}.json"), "w"), indent=1); print(json.dumps(res, indent=1)); print("----"); print(text)
