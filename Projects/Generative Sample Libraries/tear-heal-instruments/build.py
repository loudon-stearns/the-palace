#!/usr/bin/env python3
"""Build the tear-and-heal instruments from the frustration model.

    cd "Projects/Generative Sample Libraries/tear-heal-instruments"
    python3 -m venv .venv && .venv/bin/pip install -r requirements.txt   # once
    .venv/bin/python build.py audition     # lowest and highest key of every patch, all layers
    .venv/bin/python build.py all          # the whole collection
    .venv/bin/python build.py all --patch heal --patch voices

Every sample is regenerated from this folder's code: nothing here is edited
by hand, and the WAVs (gitignored) can be thrown away and remade. For each
key of a patch:

  1. Find the key's edge: the largest held stretch B that does not tear at
     this pitch, partial count and coupling (engine.find_edge, a bisection).
     Cached in edges.json, so a rebuild only bisects keys it has not seen.
  2. Render each velocity layer as one strike: the stretch thrown to the
     layer's peak and decaying back to the patch's rest (a fraction of the
     edge), coupling fixed. Read the model's own pitch trace for where the
     note settles, how deep and long it tore, and when it healed.
  3. Loop the sustain after the heal: whole periods of the settled partial 1,
     the crossfade baked into the WAV, the points in the SFZ, the .dspreset
     and the WAV's smpl chunk. Set the loop body to one level for every
     sample of the patch, fade the first 3 ms in, and file the sample under
     its key with the tune that corrects where it actually settled.
  4. Write the SFZ, the DecentSampler preset and its .dslibrary, then check
     them from disk: the two maps agree, every key held 12 s through the
     player shows no click or pump at the wraps, every sample's loop body
     measures on pitch once its tune is applied, and the pitch check is shown
     failing on a sample deliberately filed 25 cents wrong.

Writes into audition/ or instruments/, one folder per patch, plus notes.json
(every number per sample) and check.json beside each instrument.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import engine  # noqa: E402
import sampler  # noqa: E402
from patches import LAYERS, PATCHES, K_AT_110, STEP, Patch, key_hz, note_name  # noqa: E402

SR = engine.SR
RMS_TARGET_DB = -18.0     # every loop body sits here; velocity scales it in the sampler
FADE_IN = 0.003           # s: the strike starts at full level; this only stops the click
LOOP_SEC = 2.0
HOLD_CHECK = 12.0
EDGES = HERE / "edges.json"


# ---------------------------------------------------------------- the per-key physics

def sim_patch(p: Patch) -> Patch:
    return PATCHES[p.renders_from] if p.renders_from else p


def edge_key(p: Patch, key: int) -> str:
    p = sim_patch(p)
    return f"{p.source}|N{p.partials(key)}|{'pinned' if p.pinned else 'free'}|{note_name(key)}"


def _edge_job(args):
    name, key = args
    p = PATCHES[name]
    f0 = key_hz(key)
    t0 = time.time()
    e = engine.find_edge(f0, p.partials(key), K_AT_110 * engine.clock(f0), p.pinned, p.source)
    e["seconds"] = round(time.time() - t0, 1)
    return edge_key(p, key), e


def strike_path(p: Patch, key: int, layer: int, edge_B: float, secs: float) -> tuple[np.ndarray, dict]:
    t = np.arange(int(secs * SR)) / SR
    rest = p.rest * edge_B
    peak = p.throws[layer] if p.pinned else p.throws[layer] * edge_B
    tau = p.tau_at(key)
    return rest + (peak - rest) * np.exp(-t / tau), {
        "rest_B": float(f"{rest:.4g}"), "peak_B": float(f"{peak:.4g}"), "tau_s": round(tau, 4)}


def render_secs(key: int) -> float:
    c = max(1.0, 1.0 / engine.clock(key_hz(key)))
    return 6.0 + 4.0 * (c - 1.0)


def clear(chk: dict) -> bool:
    """A seam the build prefers: inside the check's limits with room to spare,
    so no sample ships a hair under the line. A seam that only meets the
    limits is the fallback."""
    return chk["seam_ok"] and chk["worst_click_db"] < 4.5 and chk["worst_level_step_db"] < 1.0


def _note_job(args):
    """Simulate one strike once, and write it for every patch that shares the
    simulation (heal and voices are the same strike, mixed differently)."""
    sim_name, key, layer, out_names, edge_B, root = args
    p = PATCHES[sim_name]
    f0 = key_hz(key)
    ck = engine.clock(f0)
    secs = render_secs(key)
    B, path = strike_path(p, key, layer, edge_B, secs)
    K = np.full(len(B), K_AT_110 * ck)
    t0 = time.time()
    tone, vox, F = engine.simulate(f0, p.partials(key), B, K, p.pinned, p.source)
    shp = engine.shape(F, B, p.pinned, f0, ck, tail_s=1.5 * max(1.0, 1.0 / ck))
    sim_s = round(time.time() - t0, 2)
    f1 = f0 * 2 ** (shp["settled_cents"] / 1200)
    tune = -int(round(shp["settled_cents"]))
    # the locked sustain's own partials: r_n at the rest stretch, times the settled rate of theta
    start = int((shp["heal_s"] + 0.3 / ck) * SR)
    c = engine.setup(f0, p.partials(key), p.source)
    pn, Br = c["n"], B[-1]
    r = pn * np.sqrt((1 + Br * pn * pn) / ((1 + Br) if p.pinned else 1.0))
    fr = r * float(F[start:].mean())
    rows = []
    for name in out_names:
        q = PATCHES[name]
        y = tone + q.voices * vox
        g = c["amp"] * np.clip((19000.0 - fr) / 3000.0, 0, 1)
        wt = g ** 2 * (1 + q.voices ** 2)          # the voices sit on the same partials once locked
        # the best few seams, each tried through a 12 s hold until one shows no click and no pump
        tried = []
        for rank, lp in enumerate(sampler.find_loops(y, f1, start, LOOP_SEC, partials=(fr[wt > 0], wt[wt > 0]))):
            z = sampler.bake_crossfade(y, lp["loop_start"], lp["loop_end"])[:lp["loop_end"] + 1]
            s, e = lp["loop_start"], lp["loop_end"] + 1
            z = z * (10 ** (RMS_TARGET_DB / 20) / math.sqrt(float(np.mean(z[s:e] ** 2))))
            zq = np.round(z * 32767.0) / 32767.0                    # what the 16-bit file will hold
            chk = sampler.seam_check(*sampler.hold_looped(zq, s, lp["loop_end"], HOLD_CHECK))
            tried.append((dict(lp, candidate_rank=rank), z, chk))
            if clear(chk):
                break
        lp, y, chk = next((x for x in tried if clear(x[2])),
                          next((x for x in tried if x[2]["seam_ok"]), tried[0]))
        lp["candidates_tried"] = len(tried)
        s, e = lp["loop_start"], lp["loop_end"] + 1
        n = int(FADE_IN * SR)
        y[:n] *= 0.5 - 0.5 * np.cos(np.linspace(0, math.pi, n))
        fname = f"{q.name}_{note_name(key)}_{LAYERS[layer][0]}.wav"
        out = Path(root) / q.name / "samples" / fname
        out.parent.mkdir(parents=True, exist_ok=True)
        sampler.write_wav_smpl(out, y, key, s, lp["loop_end"])
        assert sampler.read_smpl(out) == (s, lp["loop_end"])
        rows.append({"patch": q.name, "sample": fname, "key": note_name(key), "midi": key,
                     "layer": LAYERS[layer][0], "f0_hz": round(f0, 3),
                     "partials": p.partials(key), "K_hz": round(K_AT_110 * ck, 3),
                     "edge_B": edge_B, **path, **shp, "tune": tune,
                     "peak_dbfs": round(20 * math.log10(float(np.abs(y).max()) + 1e-12), 2),
                     **lp, "seconds": round(len(y) / SR, 2), "sim_s": sim_s})
    # the pitch trace, thinned, for the demos' figure (not written to notes.json)
    tt, cc = engine.track(F, B, p.pinned, f0, ck)
    k = max(1, len(tt) // 1200)
    for r in rows:
        r["_trace"] = (tt[::k].round(4).tolist(), cc[::k].round(2).tolist())
    return rows


# ---------------------------------------------------------------- one instrument's files

def zones(roots: list[int]) -> dict[int, tuple[int, int]]:
    """Each root plays itself and the keys up to halfway to its neighbours;
    the outermost roots reach STEP semitones past the range."""
    out = {}
    for i, k in enumerate(roots):
        lo = k - STEP if i == 0 else k - (STEP - 1) // 2
        hi = k + STEP if i == len(roots) - 1 else k + STEP // 2
        out[k] = (lo, hi)
    return out


def write_instrument(p: Patch, rows: list[dict], folder: Path, label: str) -> dict:
    roots = sorted({r["midi"] for r in rows})
    z = zones(roots) if label == "collection" else {k: (k - 1, k + 1) for k in roots}
    glob = {"loop_mode": "loop_continuous", "ampeg_attack": 0.002,
            "ampeg_release": p.release, "amp_veltrack": 60}
    groups = []
    for li, (lname, lovel, hivel) in enumerate(LAYERS):
        regs = []
        for r in sorted((r for r in rows if r["layer"] == lname), key=lambda r: r["midi"]):
            lo, hi = z[r["midi"]]
            regs.append({"sample": r["sample"], "lokey": lo, "hikey": hi,
                         "pitch_keycenter": r["midi"], "tune": r["tune"],
                         "loop_start": r["loop_start"], "loop_end": r["loop_end"]})
        throw = (f"thrown to B = {p.throws[li]:g}" if p.pinned
                 else f"thrown {p.throws[li]:g}x past the key's edge")
        groups.append((f"{lname}: {throw}, decaying with tau {p.tau:g} s at 110 Hz",
                       {"lovel": lovel, "hivel": hivel}, regs))
    head = [f"{p.title} — tear-and-heal instruments, Generative Sample Libraries ({label})",
            "built by build.py from the frustration model (engine.py); nothing here is edited by hand",
            f"{p.blurb}",
            f"sustain rests at {p.rest:g} of each key's own edge (bisected per key, edges.json);"
            " velocity is strike depth",
            "loops: after the heal, a length where the stretched partials come back into phase (or whole periods of"
            f" partial 1), {int(sampler.XFADE * 1000)} ms crossfade baked into the WAV; same points in each WAV's smpl chunk",
            "tune = the cents that bring where each strike settled back to its key"]
    sfz = folder / f"{p.title}.sfz"
    sampler.write_sfz(sfz, head, glob, groups)
    ds = folder / f"{p.title}.dspreset"
    sampler.write_dspreset(ds, p.title, p.blurb, glob, groups)
    lib = sampler.pack_dslibrary(ds, [r["sample"] for r in rows])
    return check_instrument(p, folder, sfz, ds, lib)


def check_instrument(p: Patch, folder: Path, sfz: Path, ds: Path, lib: Path) -> dict:
    import zipfile
    glob, regions = sampler.parse_sfz(sfz)
    ds_regions = sampler.parse_dspreset(ds)
    sfz_map = sorted((r["sample"], r["lokey"], r["hikey"], r["pitch_keycenter"], r["tune"],
                      r["lovel"], r["hivel"], r["loop_start"], r["loop_end"]) for r in regions)
    ds_map = sorted((r["sample"], r["lokey"], r["hikey"], r["pitch_keycenter"], r["tune"],
                     r["lovel"], r["hivel"], r["loop_start"], r["loop_end"]) for r in ds_regions)
    with zipfile.ZipFile(lib) as zf:
        names = set(zf.namelist())
    missing = [r["sample"] for r in regions if f"Samples/{r['sample']}" not in names]
    cache, per = {}, []
    for r in regions:
        y = cache.setdefault(r["sample"], sampler.read_wav(folder / "samples" / r["sample"]))
        assert sampler.read_smpl(folder / "samples" / r["sample"]) == (r["loop_start"], r["loop_end"])
        key, vel = r["pitch_keycenter"], (r["lovel"] + r["hivel"]) // 2
        out, wraps = sampler.play(folder, glob, regions, key, vel, HOLD_CHECK, cache)
        seam = sampler.seam_check(out[:int(HOLD_CHECK * SR)], wraps)
        body = y[r["loop_start"]:r["loop_end"] + 1]
        want = key_hz(key)
        hz = sampler.measure_hz(body, want * 2 ** (-r["tune"] / 1200))
        err = 1200 * math.log2(hz * 2 ** (r["tune"] / 1200) / want)
        per.append({"sample": r["sample"], **seam, "cents_err_after_tune": round(err, 2),
                    "on_pitch": bool(abs(err) < 3.0)})
    # the pitch check must be able to fail: file one sample 25 cents wrong and measure it again
    r0 = regions[len(regions) // 2]
    y0 = cache[r0["sample"]][r0["loop_start"]:r0["loop_end"] + 1]
    bad_tune = r0["tune"] + 25
    hz = sampler.measure_hz(y0, key_hz(r0["pitch_keycenter"]) * 2 ** (-r0["tune"] / 1200))
    bad_err = 1200 * math.log2(hz * 2 ** (bad_tune / 1200) / key_hz(r0["pitch_keycenter"]))
    out = {"instrument": p.title, "samples": len(regions),
           "maps_agree_sfz_dspreset": sfz_map == ds_map,
           "samples_missing_from_dslibrary": missing,
           "dslibrary_bytes": lib.stat().st_size,
           "on_pitch": sum(x["on_pitch"] for x in per),
           "worst_cents_err": max(abs(x["cents_err_after_tune"]) for x in per),
           "seams_clean_12s_hold": sum(x["seam_ok"] for x in per),
           "worst_click_db": max(x["worst_click_db"] for x in per),
           "worst_level_step_db": max(x["worst_level_step_db"] for x in per),
           "limits": {"cents": 3.0, "click_db": sampler.CLICK_LIMIT_DB,
                      "level_step_db": sampler.STEP_LIMIT_DB, "hold_s": HOLD_CHECK},
           "check_can_fail": {"sample": r0["sample"], "filed_wrong_by_cents": 25,
                              "measured_err": round(bad_err, 2), "caught": bool(abs(bad_err) >= 3.0)},
           "per_sample": per}
    (folder / "check.json").write_text(json.dumps(out, indent=1) + "\n")
    return out


# ---------------------------------------------------------------- the run

def build(which: str, names: list[str], workers: int) -> dict:
    root = HERE / ("audition" if which == "audition" else "instruments")
    patches = [PATCHES[n] for n in names]
    keys = {p.name: ([p.lo, p.hi] if which == "audition" else p.roots()) for p in patches}
    cache = json.loads(EDGES.read_text()) if EDGES.exists() else {}
    jobs = sorted({(sim_patch(p).name, k) for p in patches for k in keys[p.name]
                   if edge_key(p, k) not in cache})
    t0 = time.time()
    with ProcessPoolExecutor(workers) as ex:
        for k, e in ex.map(_edge_job, jobs):
            cache[k] = e
            print(f"edge {k}: B = {e['edge_B']:.3g} ({e['seconds']} s)", flush=True)
    EDGES.write_text(json.dumps(dict(sorted(cache.items())), indent=1) + "\n")
    print(f"edges: {len(jobs)} bisected in {time.time() - t0:.0f} s", flush=True)

    # one job per (simulation, key, layer), naming every patch that shares it
    sims: dict[tuple, list[str]] = {}
    for p in patches:
        for k in keys[p.name]:
            for li in range(len(LAYERS)):
                sims.setdefault((sim_patch(p).name, k, li), []).append(p.name)
    note_jobs = [(s, k, li, outs, cache[edge_key(PATCHES[s], k)]["edge_B"], str(root))
                 for (s, k, li), outs in sorted(sims.items())]
    t1 = time.time()
    rows = []
    with ProcessPoolExecutor(workers) as ex:
        for rs in ex.map(_note_job, note_jobs):
            for r in rs:
                rows.append(r)
                print(f"{r['sample']}: dip {r['dip_cents']} c, healed {r['heal_s']} s, "
                      f"sustain wobble {r['sustain_wobble_cents']} c, tune {r['tune']}", flush=True)
    print(f"notes: {len(rows)} written in {time.time() - t1:.0f} s", flush=True)

    summary = {}
    for p in patches:
        mine = [r for r in rows if r["patch"] == p.name]
        folder = root / p.name
        folder.mkdir(parents=True, exist_ok=True)
        (folder / "notes.json").write_text(json.dumps(
            [{k: v for k, v in r.items() if not k.startswith("_")}
             for r in sorted(mine, key=lambda r: (r["midi"], r["layer"]))], indent=1) + "\n")
        chk = write_instrument(p, mine, folder, "audition" if which == "audition" else "collection")
        summary[p.name] = {k: v for k, v in chk.items() if k != "per_sample"}
        print(json.dumps(summary[p.name]), flush=True)
    return {"rows": rows, "summary": summary, "root": root}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("which", choices=["audition", "all"])
    ap.add_argument("--patch", action="append", choices=list(PATCHES))
    ap.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 2) - 1))
    a = ap.parse_args()
    res = build(a.which, a.patch or list(PATCHES), a.workers)
    import demos
    demos.make(a.which, res)


if __name__ == "__main__":
    main()
