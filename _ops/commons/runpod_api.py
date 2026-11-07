"""Runpod — the one place in code that knows Runpod's API.

Every palace script that talks to Runpod goes through here: the hosts, the version, the
request and response shapes, the user-agent, the pod proxy URL, log streaming, worker
scaling. When Runpod changes, change this file (and the runbook) — no other caller spells
a Runpod URL or a Runpod field name.

  The process, the gotchas and the why live in one page:
  Shop/RunPod GPU Backend/RunPod GPU Backend — runbook.md   ([[RunPod GPU Backend — runbook]])

Two layers:

  Runpod(...)          the v2 client — list_pods, get_pod, create_pod, terminate_pod,
                       pod_logs, wait_http, set_workers, endpoint_health, gpu_catalog.
  Runpod.legacy(...)   the v1 shim — takes the v1 paths and bodies the older orchestrators
                       were written against (`POST /pods` with imageName/gpuTypeIds/…,
                       `PATCH /endpoints/{id}` with workersMax) and answers in v1 shapes
                       (a bare pod list, `desiredStatus`), so those callers keep working on v2.

Errors are loud. A refused call never reads as "no pods": list_pods raises RunpodError,
and legacy("GET", "/pods") raises on 401/403 — the silent-empty list is how the reaper
went blind under the WAF (runbook § Incidents, 2026-11-04).

Checked against Runpod's v2 OpenAPI (https://api.runpod.io/v2/openapi.json) on 2026-11-04.
Proof: `python3 _ops/commons/test_runpod_api.py` (offline) and `--live` (read-only calls).
"""
from __future__ import annotations

import json
import socket
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Iterator

API_BASE = "https://api.runpod.io/v2"          # REST v2. v1 (rest.runpod.io/v1) retires 2026-11-15.
SERVERLESS_BASE = "https://api.runpod.ai/v2"   # serverless job runtime: /run, /runsync, /status, /health
# v2 accepted Python's default user-agent on 2026-11-04; the pod proxy and v1 did not (Cloudflare 1010).
# Sent on every request anyway: it costs nothing and the WAF has moved before.
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")

# v1 create fields with no v2 equivalent. Dropped with a note on stderr, never silently.
_V1_DROPPED = ("gpuTypePriority", "dataCenterPriority", "supportPublicIp", "interruptible",
               "countryCodes", "computeType", "containerRegistryAuthId", "volumeKey")


def proxy_url(pod_id: str, port: int) -> str:
    """The public HTTPS proxy for a pod's exposed `<port>/http`."""
    return f"https://{pod_id}-{port}.proxy.runpod.net"


def _ctx():
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl._create_unverified_context()


def _note(msg: str) -> None:
    print(f"[runpod] {msg}", file=sys.stderr, flush=True)


class RunpodError(RuntimeError):
    def __init__(self, status: int, detail: str, path: str = ""):
        super().__init__(f"Runpod {status} on {path}: {detail}")
        self.status, self.detail, self.path = status, detail, path


# ── shape translation (pure, unit-tested) ────────────────────────────────────

def normalize_pod(p: dict) -> dict:
    """A v2 pod, plus the v1 names older callers read (desiredStatus, imageName, machine.gpuTypeId)."""
    if not isinstance(p, dict):
        return p
    p = dict(p)
    p.setdefault("desiredStatus", p.get("status"))
    p.setdefault("imageName", p.get("image"))
    gpu = p.get("gpu") or {}
    if gpu.get("id"):
        p.setdefault("machine", {}).setdefault("gpuTypeId", gpu["id"])
    return p


def v1_create_to_v2(body: dict) -> tuple[dict, list[str]]:
    """A v1 PodCreateInput → (v2 CreatePodRequest without gpu.id, the GPU ids to try in order).

    v2 takes one GPU type per create; the caller walks the list (create_pod_fallback)."""
    b = dict(body)
    out: dict = {"name": b.pop("name")}
    if "imageName" in b:
        out["image"] = b.pop("imageName")
    if "templateId" in b:
        out["templateId"] = b.pop("templateId")
    gpu_ids = list(b.pop("gpuTypeIds", []) or [])
    if "gpuTypeId" in b:
        gpu_ids.insert(0, b.pop("gpuTypeId"))
    gpu = {"count": b.pop("gpuCount", 1)}
    for v1, v2 in (("allowedCudaVersions", "allowedCudaVersions"), ("minCudaVersion", "minCudaVersion"),
                   ("minRAMPerGPU", "minRamPerGpu"), ("minVCPUPerGPU", "minVcpuCountPerGpu")):
        if b.get(v1) is not None:
            gpu[v2] = b.pop(v1)
        b.pop(v1, None)
    out["gpu"] = gpu
    for v1, v2 in (("containerDiskInGb", "disk"), ("dockerStartCmd", "cmd"),
                   ("dockerEntrypoint", "entrypoint"), ("cloudType", "cloud"),
                   ("ports", "ports"), ("env", "env"), ("dataCenterIds", "dataCenterIds")):
        if b.get(v1) is not None:
            out[v2] = b.pop(v1)
        b.pop(v1, None)
    if isinstance(out.get("env"), list):              # v1 once took [{"key":..,"value":..}]
        out["env"] = {e["key"]: e["value"] for e in out["env"]}
    mount_path = b.pop("volumeMountPath", None) or "/workspace"
    mounts: dict = {}
    if b.get("networkVolumeId"):
        mounts["network"] = [{"volumeId": b.pop("networkVolumeId"), "path": mount_path}]
    elif b.get("volumeInGb"):
        mounts["persistent"] = {"size": b.pop("volumeInGb"), "path": mount_path}
    b.pop("networkVolumeId", None); b.pop("volumeInGb", None)
    if mounts:
        out["mounts"] = mounts
    dropped = [k for k in _V1_DROPPED if k in b]
    for k in dropped:
        b.pop(k)
    if dropped:
        _note(f"v1 create fields with no v2 equivalent, dropped: {dropped}")
    if b:
        raise ValueError(f"v1 create fields this shim doesn't know: {sorted(b)} — teach runpod_api.py")
    return out, gpu_ids


def _is_capacity(status: int, detail: str) -> bool:
    d = (detail or "").lower()
    return status in (400, 409, 422) and any(w in d for w in ("capacity", "available", "instances", "no machine"))


# ── the client ───────────────────────────────────────────────────────────────

class Runpod:
    def __init__(self, api_key: str | None = None, config_path: str | Path | None = None):
        if api_key:
            self.key = api_key
        else:
            from .runpod_config import runpod_config_path   # the one place that knows where the key lives
            cfg = Path(config_path) if config_path else runpod_config_path()
            self.key = json.load(open(cfg))["api_key"]
        self._ctx = _ctx()

    # transport ---------------------------------------------------------------
    def request(self, method: str, path: str, body=None, timeout: int = 60, base: str = API_BASE,
                query: dict | None = None):
        """One HTTP call → (data, status). Never raises on an HTTP error; data carries `_error`."""
        url = base + path + ("?" + urllib.parse.urlencode(query) if query else "")
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(url, data=data, method=method, headers={
            "Authorization": f"Bearer {self.key}", "Content-Type": "application/json", "User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=timeout, context=self._ctx) as r:
                b = r.read()
                return (json.loads(b) if b else {}), r.status
        except urllib.error.HTTPError as e:
            raw = e.read().decode(errors="replace")[:600]
            try:
                j = json.loads(raw)
                detail = j.get("detail") or j.get("title") or raw
            except Exception:
                detail = raw
            return {"_error": raw, "detail": detail}, e.code

    def call(self, method: str, path: str, body=None, ok=(200, 201, 204), retries: int = 3, **kw):
        """Strict call: retries 429/5xx, raises RunpodError on anything not in `ok`."""
        for i in range(retries):
            d, code = self.request(method, path, body, **kw)
            if code in ok:
                return d
            if code == 429 or code >= 500:
                time.sleep(3 * (i + 1))
                continue
            break
        raise RunpodError(code, (d or {}).get("detail", ""), path)

    # pods --------------------------------------------------------------------
    def list_pods(self) -> list[dict]:
        """Every pod on the account, all pages, normalized. Raises rather than return a false empty."""
        pods, cursor = [], None
        while True:
            q = {"cursor": cursor} if cursor else None
            d = self.call("GET", "/pods", query=q, ok=(200,))
            pods += [normalize_pod(p) for p in d.get("pods", [])]
            pg = d.get("pagination") or {}
            if not pg.get("hasNextPage"):
                return pods
            cursor = pg.get("nextCursor")

    def get_pod(self, pod_id: str) -> dict | None:
        d, code = self.request("GET", f"/pods/{pod_id}")
        if code == 404:
            return None
        if code != 200:
            raise RunpodError(code, d.get("detail", ""), f"/pods/{pod_id}")
        return normalize_pod(d)

    def create_pod(self, body: dict):
        """One v2 create attempt → (data, status). No retry: a 5xx may still have made the pod."""
        d, code = self.request("POST", "/pods", body)
        return (normalize_pod(d) if code in (200, 201) else d), code

    def create_pod_fallback(self, body: dict, gpu_ids: list[str]):
        """Try each GPU type in order; move on only on a capacity refusal. → (data, status)."""
        d, code = {"detail": "no GPU types given"}, 400
        for g in gpu_ids or [None]:
            b = json.loads(json.dumps(body))
            if g:
                b.setdefault("gpu", {})["id"] = g
            d, code = self.create_pod(b)
            if code in (200, 201):
                return d, code
            if not _is_capacity(code, d.get("detail", "")):
                return d, code                      # a real error, or a 5xx the caller must recover from
            _note(f"no capacity for {g!r} [{code}] — next GPU type")
        return d, code

    def terminate_pod(self, pod_id: str) -> bool:
        """Terminate; True when the pod is gone or already was."""
        _, code = self.request("DELETE", f"/pods/{pod_id}")
        return code in (200, 204, 404)

    def pod_action(self, pod_id: str, action: str):
        """start | stop | restart | terminate → (data, status)."""
        return self.request("POST", f"/pods/{pod_id}/action", {"action": action})

    def pod_logs(self, pod_id: str, source: str | None = None, tail: int = 100,
                 follow: bool = False, max_seconds: float = 60, idle_seconds: float = 6) -> Iterator[dict]:
        """Container/system log lines, as dicts {ts, source, line}.

        follow=False reads the backfill (`tail` lines) and stops once the stream goes quiet for
        `idle_seconds`; follow=True keeps reading until `max_seconds`. Source: container | system."""
        q = {"tail": tail}
        if source:
            q["source"] = source
        url = f"{API_BASE}/pods/{pod_id}/logs?" + urllib.parse.urlencode(q)
        req = urllib.request.Request(url, headers={
            "Authorization": f"Bearer {self.key}", "Accept": "text/event-stream", "User-Agent": UA})
        deadline = time.time() + max_seconds
        try:
            resp = urllib.request.urlopen(req, timeout=idle_seconds, context=self._ctx)
        except urllib.error.HTTPError as e:
            raise RunpodError(e.code, e.read().decode(errors="replace")[:300], f"/pods/{pod_id}/logs")
        with resp:
            while time.time() < deadline:
                try:
                    raw = resp.readline()
                except (socket.timeout, TimeoutError):
                    if follow:
                        continue
                    return
                if not raw:
                    return
                line = raw.decode(errors="replace").rstrip("\n")
                if not line.startswith("data:"):
                    continue
                payload = line[5:].strip()
                try:
                    yield json.loads(payload)
                except Exception:
                    yield {"ts": None, "source": source, "line": payload}

    def wait_http(self, pod_id: str, port: int, path: str = "/", timeout: float = 1800,
                  every: float = 10, on_wait=None) -> bool:
        """Poll the pod's proxy until `path` answers 200. RUNNING is not ready; this is.

        Gives up early if the pod lands in EXITED/ERROR/TERMINATED. on_wait(elapsed, pod) is
        called each miss, for progress or to tail logs."""
        url = proxy_url(pod_id, port) + path
        t0 = time.time()
        while time.time() - t0 < timeout:
            try:
                req = urllib.request.Request(url, headers={"User-Agent": UA})
                with urllib.request.urlopen(req, timeout=10, context=self._ctx) as r:
                    if r.status == 200:
                        return True
            except Exception:
                pass
            pod = self.get_pod(pod_id)
            if pod is None or pod.get("status") in ("EXITED", "ERROR", "TERMINATED"):
                _note(f"pod {pod_id} is {pod and pod.get('status') or 'gone'} — not waiting")
                return False
            if on_wait:
                on_wait(int(time.time() - t0), pod)
            time.sleep(every)
        return False

    def gpu_catalog(self, **filters) -> dict:
        """GET /catalog/gpus — types, prices, availability, CUDA versions per type."""
        return self.call("GET", "/catalog/gpus", query=filters or None, ok=(200,))

    def available_gpus(self, cloud: str = "SECURE", min_cuda: str | None = None, count: int = 1,
                       min_mem: int = 0, max_mem: int = 10_000, product: str = "POD") -> list[dict]:
        """GPU types with stock right now for this cloud and CUDA floor, cheapest first.

        Ask before renting: a create against a type with no stock only fails, slowly."""
        q = {"product": product, "include": "AVAILABILITY", "cloud": cloud, "count": count}
        if min_cuda:
            q["minCudaVersion"] = min_cuda
        out = [g for g in self.gpu_catalog(**q).get("gpus", [])
               if g.get("availability") not in (None, "NONE") and min_mem <= g.get("memory", 0) <= max_mem]
        return sorted(out, key=lambda g: (g.get("price") or {}).get(cloud.lower()) or 1e9)

    # serverless --------------------------------------------------------------
    def set_workers(self, endpoint_id: str, max_workers: int, min_workers: int = 0) -> int:
        """Scale a serverless endpoint. Keeps its other worker settings (idleTimeout) as they are."""
        cur = self.call("GET", f"/serverless/{endpoint_id}", ok=(200,)).get("workers") or {}
        workers = {**cur, "min": min_workers, "max": max_workers}
        self.call("PATCH", f"/serverless/{endpoint_id}", {"workers": workers}, ok=(200,))
        # Read it back: a 2xx is not proof the scale took. v1's PATCH answered 2xx and
        # changed nothing from about 2026-11-05, so jobs queued against max 0 (runbook § Incidents).
        got = (self.call("GET", f"/serverless/{endpoint_id}", ok=(200,)).get("workers") or {})
        if got.get("max") != max_workers or got.get("min") != min_workers:
            raise RunpodError(200, f"scale did not take: asked min {min_workers} max {max_workers}, endpoint reads {got}",
                              f"/serverless/{endpoint_id}")
        return max_workers

    def endpoint_health(self, endpoint_id: str) -> dict:
        return self.call("GET", f"/{endpoint_id}/health", base=SERVERLESS_BASE, ok=(200,))

    # the v1 shim -------------------------------------------------------------
    def legacy(self, method: str, path: str, body=None, timeout: int = 60):
        """v1 path + body in, v1-shaped (data, status) out — served by v2."""
        parts = [p for p in path.split("/") if p]
        if parts[:1] == ["pods"]:
            if method == "GET" and len(parts) == 1:
                try:
                    return self.list_pods(), 200
                except RunpodError as e:
                    if e.status in (401, 403):           # a refusal must never read as "no pods"
                        raise
                    return {"_error": e.detail}, e.status
            if method == "GET" and len(parts) == 2:
                d, code = self.request("GET", path, timeout=timeout)
                return (normalize_pod(d) if code == 200 else d), code
            if method == "POST" and len(parts) == 1:
                v2, gpus = v1_create_to_v2(body or {})
                return self.create_pod_fallback(v2, gpus)
            if method == "DELETE" and len(parts) == 2:
                return self.request("DELETE", path, timeout=timeout)
            if method == "POST" and len(parts) == 3 and parts[2] in ("start", "stop", "restart", "terminate"):
                return self.pod_action(parts[1], parts[2])
        if parts[:1] == ["endpoints"] and method == "PATCH" and len(parts) == 2:
            b = body or {}
            try:
                self.set_workers(parts[1], b.get("workersMax"), b.get("workersMin", 0))
                return {}, 200
            except RunpodError as e:
                return {"_error": e.detail}, e.status
        raise NotImplementedError(f"runpod_api.legacy has no v1→v2 mapping for {method} {path} — add one")
