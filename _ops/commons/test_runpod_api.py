#!/usr/bin/env python3
"""runpod_api gate — the one place that knows Runpod still knows it.

Offline (default): the v1→v2 translation, the GPU fallback walk, and the loud-failure rules,
against a mocked transport. No network. Exit 0 = pass.

  python3 _ops/commons/test_runpod_api.py           # offline
  python3 _ops/commons/test_runpod_api.py --live    # + read-only calls to the real account

--live spends nothing and changes nothing: it lists pods, reads the GPU catalog and the
FLUX endpoint's health, and asks for a nonexistent pod's logs. Run it when Runpod changes
something, or when anything Runpod starts failing — it says which surface moved.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from commons import runpod_api as R                               # noqa: E402

checks = []


def check(desc, cond):
    checks.append((desc, cond))
    print(("  PASS " if cond else "  FAIL ") + desc)


def offline():
    # The track-VI body: network volume, GPU list, start command.
    v1 = {"name": "blueline-tVI-layers", "imageName": "runpod/worker-comfyui:5.8.4-flux1-dev-fp8",
          "gpuTypeIds": ["G1", "G2"], "gpuCount": 1, "networkVolumeId": "vol1",
          "volumeMountPath": "/workspace", "ports": ["8188/http", "22/tcp"],
          "containerDiskInGb": 25, "dockerStartCmd": ["bash", "-c", "echo"]}
    v2, gpus = R.v1_create_to_v2(v1)
    check("v1 create → v2: image, disk, cmd, ports",
          v2["image"].startswith("runpod/") and v2["disk"] == 25 and v2["cmd"][0] == "bash"
          and v2["ports"] == ["8188/http", "22/tcp"])
    check("v1 network volume → mounts.network", v2["mounts"] == {"network": [{"volumeId": "vol1", "path": "/workspace"}]})
    check("GPU list comes back in order, gpu.id left for the walk", gpus == ["G1", "G2"] and "id" not in v2["gpu"])
    v2b, _ = R.v1_create_to_v2({"name": "x", "imageName": "i", "minCudaVersion": "13.0",
                                "dockerEntrypoint": [], "cloudType": "COMMUNITY", "env": {"A": "1"}})
    check("CUDA floor, entrypoint, cloud, env carried",
          v2b["gpu"]["minCudaVersion"] == "13.0" and v2b["entrypoint"] == [] and v2b["cloud"] == "COMMUNITY"
          and v2b["env"] == {"A": "1"})
    try:
        R.v1_create_to_v2({"name": "x", "imageName": "i", "someNewField": 1})
        check("an unknown v1 field is refused, not dropped", False)
    except ValueError:
        check("an unknown v1 field is refused, not dropped", True)

    p = R.normalize_pod({"id": "p", "status": "RUNNING", "image": "img", "gpu": {"id": "G"}})
    check("normalize_pod adds desiredStatus / imageName / machine.gpuTypeId",
          p["desiredStatus"] == "RUNNING" and p["imageName"] == "img" and p["machine"]["gpuTypeId"] == "G")

    rp = R.Runpod(api_key="test")
    tried = []

    def fake_create(body):
        tried.append(body["gpu"]["id"])
        if body["gpu"]["id"] == "G1":
            return {"detail": "There are no longer any instances available with the requested specifications"}, 400
        return {"id": "pod9", "status": "PROVISIONING"}, 201
    rp.create_pod = fake_create
    d, code = rp.create_pod_fallback({"name": "x", "gpu": {"count": 1}}, ["G1", "G2", "G3"])
    check("capacity refusal walks to the next GPU and stops at the first success",
          code == 201 and d["id"] == "pod9" and tried == ["G1", "G2"])

    tried.clear()
    rp.create_pod = lambda body: (tried.append(1) or ({"detail": "internal"}, 500))
    _, code = rp.create_pod_fallback({"name": "x", "gpu": {}}, ["G1", "G2"])
    check("a 5xx stops the walk (the pod may exist — the caller recovers by name)", code == 500 and len(tried) == 1)

    rp2 = R.Runpod(api_key="test")
    rp2.request = lambda *a, **k: ({"detail": "error code: 1010"}, 403)
    try:
        rp2.legacy("GET", "/pods")
        check("a refused pod list raises, never reads as no pods", False)
    except R.RunpodError as e:
        check("a refused pod list raises, never reads as no pods", e.status == 403)

    pages = iter([({"pods": [{"id": "a", "status": "RUNNING"}], "pagination": {"hasNextPage": True, "nextCursor": "c"}}, 200),
                  ({"pods": [{"id": "b", "status": "EXITED"}], "pagination": {"hasNextPage": False}}, 200)])
    rp3 = R.Runpod(api_key="test")
    rp3.request = lambda *a, **k: next(pages)
    d, code = rp3.legacy("GET", "/pods")
    check("legacy GET /pods walks every page and answers a bare v1 list",
          code == 200 and [x["id"] for x in d] == ["a", "b"] and d[1]["desiredStatus"] == "EXITED")
    try:
        rp3.legacy("GET", "/templates")
        check("an unmapped v1 path is refused by name", False)
    except NotImplementedError:
        check("an unmapped v1 path is refused by name", True)

    # set_workers reads the scale back: a 2xx PATCH that changed nothing raises.
    for took, label in ((True, "a scale that took returns"), (False, "a 2xx scale that did not take raises")):
        state = {"workers": {"min": 0, "max": 0, "idleTimeout": 5}}
        def fake(method, path, body=None, ok=(200,), **k):
            if method == "PATCH" and took: state["workers"] = dict(body["workers"])
            return dict(state)
        rp4 = R.Runpod(api_key="test"); rp4.call = fake
        try:
            ok_ = rp4.set_workers("ep", 1) == 1 and took
        except R.RunpodError:
            ok_ = not took
        check(f"set_workers: {label}", ok_)


def live():
    import json
    from commons.runpod_config import runpod_config_path
    rp = R.Runpod()
    try:
        pods = rp.list_pods()
        check(f"live: v2 pod list answers ({len(pods)} pod(s))", isinstance(pods, list))
    except R.RunpodError as e:
        check(f"live: v2 pod list answers — {e}", False)
    try:
        g = rp.gpu_catalog().get("gpus", [])
        check(f"live: GPU catalog answers ({len(g)} types)", len(g) > 0)
    except R.RunpodError as e:
        check(f"live: GPU catalog answers — {e}", False)
    ep = json.load(open(runpod_config_path())).get("endpoint_id")
    if ep:
        try:
            h = rp.endpoint_health(ep)
            check("live: serverless health answers", "workers" in h)
            w = rp.call("GET", f"/serverless/{ep}", ok=(200,)).get("workers", {})
            check(f"live: endpoint workers readable ({w})", "max" in w)
        except R.RunpodError as e:
            check(f"live: serverless answers — {e}", False)
    try:
        list(rp.pod_logs("no-such-pod", max_seconds=5))
        check("live: logs route exists (404 for a missing pod)", False)
    except R.RunpodError as e:
        check(f"live: logs route exists (got {e.status} for a missing pod)", e.status == 404)


def main():
    offline()
    if "--live" in sys.argv:
        live()
    failed = [d for d, ok in checks if not ok]
    print(f"\n{'ALL PASS' if not failed else 'FAIL'} — {len(checks) - len(failed)}/{len(checks)} checks")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
