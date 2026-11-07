---
title: "RunPod GPU Backend — runbook"
born: 2026-11-04
links:
  - target: "[[RunPod GPU Backend]]"
    type: connects-to
    label: runbook-of
forward_vector: "I am the palace's one place of Runpod truth — how we rent, watch and release Runpod GPUs, what Runpod is today, and every trap we've paid for — kept current so no other page has to restate any of it."
---

# RunPod GPU Backend — runbook

The one place for how the palace works with Runpod. Every other page that touches Runpod points here and restates nothing. **Runpod changes often; this page and one file of code change with it.**

- **Code:** `_ops/commons/runpod_api.py` is the only file that knows Runpod's hosts, version, request shapes and quirks. Pods go through `RunpodPodProvider` (`_ops/commons/providers/runpod_pod.py`), serverless worker scaling through `EndpointWorkers` (`_ops/commons/endpoint.py`). No script spells a Runpod URL.
- **Why and which surface:** serverless vs pod, the FLUX craft, model routing stay on [[RunPod GPU Backend]] itself — they change when *we* change, not when Runpod does.

## When Runpod changes something

1. `python3 _ops/commons/test_runpod_api.py --live` — read-only, spends nothing; it names the surface that moved.
2. Fix it in `runpod_api.py`, and nowhere else.
3. Update **Runpod today** below, and add a dated line to **Incidents** if it cost us anything.
4. If a fix had to touch another file, that file was speaking Runpod directly — move what it said into `runpod_api.py`.
5. `git grep -nE "rest\.runpod\.io|api\.runpod\.(io|ai)" -- '*.py' '*.mjs' '*.js'` should name only `runpod_api.py`, and the serverless job runners on `api.runpod.ai` (below).

## Runpod today (checked 2026-11-04)

Items marked *(docs)* come from Runpod's documentation and weren't exercised here; the rest were tested against the live API that day.


- **REST v2** at `https://api.runpod.io/v2`, schema at `/v2/openapi.json`. **v1 (`rest.runpod.io/v1`) retires 2026-11-15.** List responses are wrapped (`{"pods": [...], "pagination": {...}}`); lifecycle is `POST /v2/pods/{id}/action` (`start | stop | restart | terminate`) or `DELETE /v2/pods/{id}`; serverless config is `/v2/serverless/{id}` with `workers: {min, max, idleTimeout}`. Source: [docs.runpod.io/api-reference-v2/migrate-from-v1](https://docs.runpod.io/api-reference-v2/migrate-from-v1).
- **Serverless jobs** (`https://api.runpod.ai/v2/<endpoint>/run | runsync | status | health`) are a separate runtime API, not part of the v1 retirement. `runpod_api.SERVERLESS_BASE`; `serverless-client.py` and the BLUELINE / Studio runners call it.
- **Logs are readable.** `GET /v2/pods/{id}/logs` streams server-sent events `{ts, source, line}` (`source=container|system`, `tail` up to 5000). `provider.logs(pod)`. The Runpod console shows the same under Pods → Logs.
- **One GPU type per create** in v2 (`gpu.id`). `runpod_api` walks our ordered list, moving on only when Runpod says there's no capacity.
- **A catalog says what has stock.** `GET /v2/catalog/gpus?include=AVAILABILITY&product=POD&cloud=…&minCudaVersion=…`. `rp.available_gpus(cloud, min_cuda)` returns types with stock, cheapest first. Ask before renting.
- **CUDA:** `gpu.minCudaVersion` is a floor (hosts report up to 13.4 today); `gpu.allowedCudaVersions` is an exact set and silently shuts out newer hosts. Use the floor.
- **Status:** `PROVISIONING → STARTING → RUNNING → EXITED | ERROR | TERMINATED`. RUNNING means the container started, not that your server answers.
- **No auto-terminate** *(docs)*. No TTL, no idle timeout on pods (runpodctl's `--terminate-after` was never enforced and is gone). Serverless has `idleTimeout`.
- **Account spend cap** $80/hour by default *(docs)*.
- **Also on offer** *(docs)*: Public Endpoints (stock FLUX Dev at $0.02/megapixel, nothing to deploy — worth weighing against our own endpoint for plain renders); load-balancer serverless endpoints that can run a stock image like `vllm/vllm-openai` (5.5-minute request cap); the official `runpod-workers/worker-vllm` (bundled vLLM 0.32 on 2026-11-03); the Python SDK `runpod` 2.x; an MCP server (`@runpod/mcp-server`, or hosted at mcp.runpod.io). None of these is wired into the palace yet.
- **User-agent:** v2 and `api.runpod.ai` accepted Python's default user-agent on 2026-11-04; v1 and the pod proxy (`<pod>-<port>.proxy.runpod.net`) answer it with Cloudflare 403 / error 1010. `runpod_api.UA` is sent on every call anyway. Diagnose any 403 with a read-only GET, default UA against browser UA, before suspecting the key.

## Keys and config

The API key and the FLUX endpoint id live in `Shop/RunPod GPU Backend/studio/config.json`, gitignored twice (`studio/.gitignore` and the root `.gitignore`). Nothing spells that path: readers ask `_ops/commons/runpod_config.py`, which also finds the primary checkout's copy from a worktree. `Runpod()` with no key does this for you. Never write a key into a palace file. Endpoint `iy3ybd7qjl2trj` is the palace-FLUX ComfyUI serverless worker (`flux1-dev-fp8.safetensors`). Drive it with `serverless-client.py` → `RunPodEndpoint(endpoint_id, api_key).run({"workflow": <comfy API json>})`; `EndpointWorkers` scales it, so no manual dashboard scale-up. SDXL can ride it only if its models are staged on the shared volume (unconfirmed — the Studio launcher uses FLUX only).

## Renting a pod

```python
from commons.providers.runpod_pod import RunpodPodProvider
prov = RunpodPodProvider(steward="<your page>")
gpus = prov.rp.available_gpus(cloud="SECURE", min_cuda="12.6", min_mem=24, max_mem=48)
pod = prov.create({"base": "<project>-<job>", "image": "<image:pinned-tag>",
                   "gpuTypeIds": [g["id"] for g in gpus[:4]], "cloudType": "SECURE",
                   "minCudaVersion": "12.6", "containerDiskInGb": 40, "ports": ["8188/http"],
                   "dockerStartCmd": [...]})
try:
    ok = prov.wait_http(pod, 8188, "/system_stats", timeout=1800,
                        on_wait=lambda el, p: [print(e["line"]) for e in prov.logs(p["id"], tail=50, max_seconds=5)])
    ...
finally:
    prov.terminate(pod)
```

Then reap: `python3 -m commons reap --self --force` (from `_ops/`). Worked examples: `Projects/BLUELINE/proofs/m3-warped-noise/m3_pod_orchestrator.py` (ComfyUI on a network volume), `Shop/Shopkeeper/probes/lightonocr-3/lightonocr_pod.py` (vLLM, logs, a watchdog).

- **Pin the image tag** and read its CUDA requirement before choosing the floor (`NVIDIA_REQUIRE_CUDA` in the image config). A moving `:latest` can change CUDA under you.
- **`dockerStartCmd` is the CMD.** If the image has an ENTRYPOINT (vLLM's is `vllm serve`), pass only its arguments. `bash -c …` there becomes an argument to the entrypoint and the container dies. Override the entrypoint (`dockerEntrypoint`) only when you mean to.
- **Name every pod by agent.** The provider names it `<base>--<slug>` (`_ops/commons/identity.py`, slug from `$COMMONS_AGENT_SLUG` → `$RUNPOD_AGENT_SLUG` → worktree name → host). Guards, culls, terminates and reaps only ever touch your own slug. Proof: `python3 _ops/runpod/test_multi_agent.py`. Why: [[assume multi-agent]]. Serverless endpoints are shared managed infrastructure and need no slug.
- **Contention, not destruction:** an optional capacity lease over the board (`RUNPOD_LEASE=1`, `_ops/runpod/gpu_lease.py`; `RUNPOD_LEASE_STRICT=1` to serialize) flags two agents reaching for the account at once. Advisory; namespacing already prevents the kills.
- **A create can fail and still make a pod.** After any non-2xx, the provider looks for your pod by name before retrying, and culls extras. The error code is not proof the side effect didn't happen.
- **A clean exit isn't a clean account.** Reap your namespace after every run, success or failure. A killed orchestrator's `finally` never runs.
- **Backstop the teardown.** There's no TTL, so a pod outlives a dead script. A detached local watchdog that terminates by id after N minutes (see the LightOnOCR probe) is the cheap insurance.
- **Ready means your server answers.** `wait_http` polls the proxy and gives up early if the pod lands in EXITED or ERROR. Pods can boot then die (RUNNING for ~2 min, then the container exits) — read the logs, don't guess.

## Hard-won (pods and serverless)

- **Match the image's VRAM to the GPU pool.** FLUX-dev full precision (~24GB) OOMs a 24GB card and the worker silently takes no jobs; fp8 fits 24GB. SDXL fits anything.
- **Set a CUDA floor** on every pod and endpoint, or workers land on old-driver hosts and die at init (`cuda>=…` prestart-hook error, "OCI runtime create failed").
- **Broaden the GPU pool** (many types, not one) to beat throttling.
- **Be patient through the first cold pull** — worker images are 19–35GB; recycling a worker mid-extract restarts the download. A long `IN_QUEUE` is not a wedge.
- **flashboot off** for very large images (it left workers in a flapping restored state).
- **Container disk must hold the image** — a 35GB image needs ~80GB container disk, not 30GB.
- **Stage big models to the container disk, then background-copy to the network volume.** The volume is fast to read, slow to write; downloading a 10GB checkpoint to it before launch blows the readiness timeout. A `>size` check rejects half-written partials.
- **Pull ~10GB checkpoints with `aria2c -x16 -s16`.** Single-stream `wget` from Hugging Face to a pod is unreliable at that size.
- **Raise the readiness timeout for FLUX cold pulls** (~30 min), and amortize a boot over many jobs per pod. When a host is just slow, retry on a *fresh* host rather than recycling the same one mid-pull.
- **Verify one frame before batching.** The failed img2img movie ran all 30 frames before anyone looked.
- **Serverless worker scaling is shared.** One endpoint has one `workers.max`; `EndpointWorkers` ref-counts renderers on the board so it parks to 0 only when the last leaves. Park the endpoint after a batch — it bills while workers are up.
- **Serverless cold start** is ~250s for FLUX, then ~15–30s per image.
- **macOS framework Python 3.14:** HTTPS to `api.runpod.ai` dies `CERTIFICATE_VERIFY_FAILED` without `export SSL_CERT_FILE=$(python3 -c 'import certifi;print(certifi.where())')` (`runpod_api` falls back to certifi itself; `serverless-client.py` doesn't use `runpod_api` and has no such fallback); loading the hyphenated `serverless-client.py` via `spec_from_file_location` must set `sys.modules[name] = mod` before `exec_module`.
- **Multipart upload to a pod's ComfyUI** is most reliable through `curl`; the proxy resets large bodies (`Projects/BLUELINE/proofs/new-story/pod_backend.py`).

## Incidents

- **2026-06-23** — a create retry loop read flaky 500s as "no capacity" and leaked 11 running pods (~$6/hr). Fix: recover by name before retrying.
- **2026-07-02** — two agents on one account culled each other's pods by a shared name. Fix: per-agent pod names, scoped sweeps (`_ops/runpod/CALLER-AUDIT.md`).
- **2026-09-24** — a face batch died on a bare 403 that looked like a bad key: the WAF refused Python's user-agent on v1. Fix: a browser UA — but it missed the pod provider.
- **2026-11-04** — the pod provider had been sending no user-agent: every v1 call 403'd and `list_all()` read the refusal as "no pods", so the reaper and every BLUELINE pod orchestrator were blind. Same day: v1's 2026-11-15 retirement found. Fix: all Runpod calls moved to `runpod_api.py` on v2, a refused list now raises, and `test_runpod_api.py --live` checks the surface. Three LightOnOCR-3 pods had failed on our own config (a model id that doesn't exist, a 2024 vLLM that can't load Qwen3.5, a CUDA-13 image on old-driver Community hosts) — invisible until v2's logs (`Shop/Shopkeeper/probes/lightonocr-3/lightonocr-3-probe-notes.md`, cycles 9–15).
- **2026-11-07** — face renders had been dead since about 2026-11-05 and nothing said so: v1's endpoint `PATCH` answered 2xx and changed nothing, so `regen_one.py` logged `workersMax=1` while the endpoint stayed at max 0, and each job sat `IN_QUEUE` with `/health` reading all zeros (a real stock shortage reads `throttled`, a cold pull `initializing`). The v2 move (`e4cdef4a`) fixed the write. Fix: `set_workers` reads the scale back and raises when it didn't take. Found by STIGMERGY's hero, three failed renders, diagnosed with the Shopkeeper session.

## Pages that point here

[[RunPod GPU Backend]] · [[LoRA Trainer]] · [[Hero and Avatar Maker]] · [[Maker]] (host-class row) · [[The Commons]] · [[BLUELINE — Render Backend]].

Not yet pointed here, and still carrying some Runpod detail of their own — fold them in as they're next touched: `Shop/RunPod GPU Backend/backend-design.md` (the serverless design), `Shop/RunPod GPU Backend/studio/README.md`, `Projects/BLUELINE/render-backend/README.md`, `Projects/BLUELINE/proofs/track-II-lora/TRAIN.md`, [[BLUELINE — toolbox]] (pinned images, by design). Dated records that keep their own account: [[Frame Designer]]'s 2026-06-23 field notes, `_ops/runpod/CALLER-AUDIT.md`, the LightOnOCR-3 probe notes.
