#!/usr/bin/env python3
"""LightOnOCR-3 probe — one pod, watched with its own logs, always torn down.

The fourth try, and the first on Runpod v2 through the Shop's one Runpod module
(_ops/commons/runpod_api.py; process in [[RunPod GPU Backend — runbook]]). The first three
failed on my own config, not Runpod: a model id that doesn't exist, a 2024 vLLM that can't load
Qwen3.5, and CUDA-13 images landing on older-driver hosts. This one:

  - asks the catalog which GPUs have stock under a CUDA >= 13.0 floor, Community then Secure
  - keeps the vLLM image's own `vllm serve` entrypoint and passes only the model args
  - streams the pod's container + system logs into out/boot.log while it waits for /health
  - runs each image in inputs/ through both prompt modes, saves out/<image>.<mode>.md
  - terminates in `finally`, and a detached watchdog terminates it at WATCHDOG_S regardless

  python3 lightonocr_pod.py            # the run
  python3 lightonocr_pod.py --dry-run  # print the create request and the GPU pick, rent nothing
"""
import base64
import json
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[3] / "_ops"))
from commons.providers.runpod_pod import RunpodPodProvider   # noqa: E402
from commons.runpod_api import UA, proxy_url, _ctx           # noqa: E402

MODEL = "lightonai/LightOnOCR-3-0.8B"
IMAGE = "vllm/vllm-openai:v0.33.0"           # needs CUDA >= 13.0 (NVIDIA_REQUIRE_CUDA in the image)
MIN_CUDA = "13.0"
PORT = 8000
BOOT_TIMEOUT_S = 20 * 60
WATCHDOG_S = 30 * 60
OUT = HERE / "out"
PROMPTS = {"transcribe": "", "grounding": "grounding"}


def spec(cloud, gpu_ids):
    return {"base": "shopkeeper-ocr", "image": IMAGE, "gpuTypeIds": gpu_ids, "cloudType": cloud,
            "minCudaVersion": MIN_CUDA, "containerDiskInGb": 40, "ports": [f"{PORT}/http"],
            "dockerStartCmd": [MODEL, "--port", str(PORT), "--trust-remote-code", "--max-model-len", "8192",
                               "--default-chat-template-kwargs", '{"enable_thinking": false}'],
            "max_tries": 2, "delay": 10}


def pick(prov):
    for cloud in ("COMMUNITY", "SECURE"):
        gpus = prov.rp.available_gpus(cloud=cloud, min_cuda=MIN_CUDA, min_mem=16, max_mem=48)
        if gpus:
            return cloud, [g["id"] for g in gpus[:4]], gpus[0]
    return None, [], None


def watchdog(pid):
    """A detached process that terminates the pod after WATCHDOG_S, even if this script dies."""
    code = (f"import sys,time;sys.path.insert(0,{str(HERE.parents[3] / '_ops')!r});time.sleep({WATCHDOG_S});"
            f"from commons.runpod_api import Runpod;print('watchdog terminate',Runpod().terminate_pod({pid!r}))")
    return subprocess.Popen([sys.executable, "-c", code], stdout=open(OUT / "watchdog.log", "w"),
                            stderr=subprocess.STDOUT, start_new_session=True)


def ocr(pid, img: Path, prompt: str) -> str:
    content = [{"type": "image_url", "image_url": {"url": "data:image/png;base64," + base64.b64encode(img.read_bytes()).decode()}}]
    if prompt:
        content.append({"type": "text", "text": prompt})
    body = {"model": MODEL, "messages": [{"role": "user", "content": content}],
            "max_tokens": 4096, "temperature": 0.2, "top_p": 0.9}
    req = urllib.request.Request(proxy_url(pid, PORT) + "/v1/chat/completions", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "User-Agent": UA})
    with urllib.request.urlopen(req, timeout=300, context=_ctx()) as r:
        return json.loads(r.read())["choices"][0]["message"]["content"]


def main():
    OUT.mkdir(exist_ok=True)
    prov = RunpodPodProvider(steward="Shopkeeper")
    cloud, gpu_ids, cheapest = pick(prov)
    if not cloud:
        sys.exit("no GPU type has stock under a CUDA >= 13.0 floor in either cloud — nothing rented")
    price = (cheapest.get("price") or {}).get(cloud.lower())
    print(f"[pick] {cloud} {gpu_ids} (cheapest ${price}/hr)")
    if "--dry-run" in sys.argv:
        print(json.dumps(spec(cloud, gpu_ids), indent=2)); return

    t0, seen, pid, dog = time.time(), set(), None, None
    log = open(OUT / "boot.log", "w")

    def drain(*_):
        try:
            for e in prov.logs(pid, tail=500, max_seconds=8, idle_seconds=3):
                k = (e.get("ts"), e.get("line"))
                if k not in seen:
                    seen.add(k); log.write(f"{e.get('ts')} [{e.get('source')}] {e.get('line')}\n"); log.flush()
                    print(f"  | {e.get('line')}"[:200])
        except Exception as ex:
            print(f"  (logs: {type(ex).__name__}: {str(ex)[:120]})")

    try:
        r = prov.create(spec(cloud, gpu_ids)); pid = r.id
        (OUT / "pod_id").write_text(pid); dog = watchdog(pid)
        print(f"[pod] {pid} created; watchdog pid {dog.pid} terminates it at {WATCHDOG_S // 60} min")

        def tick(el, pod):
            print(f"[wait] {el}s status={pod.get('status')} gpu={(pod.get('gpu') or {}).get('id')}"); drain()
        ready = prov.wait_http(pid, PORT, "/health", timeout=BOOT_TIMEOUT_S, every=20, on_wait=tick)
        drain()
        print(f"[ready] {ready} after {int(time.time() - t0)}s")
        if not ready:
            return
        for img in sorted((HERE / "inputs").glob("*.png")):
            for mode, prompt in PROMPTS.items():
                s = time.time(); text = ocr(pid, img, prompt)
                (OUT / f"{img.stem}.{mode}.md").write_text(text)
                print(f"[ocr] {img.name} {mode}: {len(text)} chars in {time.time() - s:.1f}s")
    finally:
        if pid:
            print(f"[terminate] {pid} -> {prov.terminate(pid)}")
        if dog:
            dog.kill()
        mins = (time.time() - t0) / 60
        print(f"[cost] ~{mins:.1f} min up, ~${(price or 0) * mins / 60:.2f} at ${price}/hr")
        log.close()


if __name__ == "__main__":
    main()
