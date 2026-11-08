"""
vital_corpus.py — the structural half of the Vital Synth Profile, mined from
every .vital preset on this Mac (~/Music/Vital, factory plus packs).

Vital presets are plain JSON: {author, comments, macro1..4, preset_style,
synth_version, settings{...}}. `settings` holds ~775 scalar parameters plus four
structured blocks: `wavetables` (per-oscillator keyframed tables), `lfos`
(drawn shapes), `modulations` (the matrix: [{source, destination}], with depth
etc. in scalar `modulation_N_amount`, `_bipolar`, `_power`...), and `sample`.

Writes profile-draft/vital_corpus_stats_v0.1.json:
  - per scalar parameter: count, min, p10/p20/p40/p60/p80/p90, max, distinct
  - modulation census: source counts, destination counts, top source→destination
  - effect usage (which *_on switches are lit), oscillator/filter usage
  - parameters_when_section_on: the same, counting only presets where that
    parameter's section is switched on (a disabled filter sits at its default
    and would drag every band toward it)
These are usage bands — how designers set things — not perception bands.
The rendered measurements (vital_measure.py) are the first step toward perception.
"""
import glob, json, os, collections
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "profile-draft", "vital_corpus_stats_v0.1.json")
CORPUS = os.path.expanduser("~/Music/Vital")


def presets():
    for f in sorted(glob.glob(os.path.join(CORPUS, "**", "*.vital"), recursive=True)):
        try:
            yield f, json.load(open(f))
        except Exception:
            continue


def section_of(key, settings):
    """the longest prefix P with a P_on switch in this preset, e.g. filter_1_cutoff -> filter_1"""
    parts = key.split("_")
    for n in range(len(parts) - 1, 0, -1):
        p = "_".join(parts[:n])
        if p + "_on" in settings and key != p + "_on":
            return p
    return None


def stats(v):
    a = np.array(v)
    q = np.percentile(a, [10, 20, 40, 60, 80, 90])
    d = {"count": len(a), "min": a.min(), "max": a.max(),
         "p10": q[0], "p20": q[1], "p40": q[2], "p60": q[3], "p80": q[4], "p90": q[5],
         "distinct": int(len(np.unique(a)))}
    return {k: (round(float(v), 6) if isinstance(v, (float, np.floating)) else v) for k, v in d.items()}


def main():
    vals = collections.defaultdict(list)
    vals_on = collections.defaultdict(list)  # only where the parameter's section is switched on
    src, dst, pair = collections.Counter(), collections.Counter(), collections.Counter()
    nmods, packs, files = [], collections.Counter(), 0
    for f, p in presets():
        files += 1
        packs[os.path.relpath(f, CORPUS).split(os.sep)[0]] += 1
        s = p.get("settings", {})
        for k, v in s.items():
            if isinstance(v, (int, float)):
                vals[k].append(float(v))
                sec = section_of(k, s)
                if sec is None or s.get(sec + "_on", 0) > 0.5:
                    vals_on[k].append(float(v))
        live = 0
        for i, m in enumerate(s.get("modulations", []), 1):
            a, b = m.get("source", ""), m.get("destination", "")
            if not a or not b:
                continue
            live += 1
            src[a] += 1; dst[b] += 1; pair[(a, b)] += 1
        nmods.append(live)

    params = {k: stats(v) for k, v in sorted(vals.items())}
    params_on = {k: stats(v) for k, v in sorted(vals_on.items()) if len(v) != len(vals[k]) and len(v) >= 10}

    on = {k[:-3]: round(float(np.mean(np.array(v) > 0.5)), 3) for k, v in vals.items() if k.endswith("_on")}
    out = {
        "schema_version": "0.1",
        "synth": "Vital",
        "synth_version_observed": "1.5.5 (plugin); corpus files mostly 1.0.x",
        "corpus": {"files": files, "packs": dict(packs.most_common())},
        "section_usage_share_on": dict(sorted(on.items(), key=lambda kv: -kv[1])),
        "modulation": {
            "live_routings_per_preset": {"median": float(np.median(nmods)), "p90": float(np.percentile(nmods, 90)), "max": int(max(nmods))},
            "sources": dict(src.most_common()),
            "destinations_top40": dict(dst.most_common(40)),
            "pairs_top40": [{"source": a, "destination": b, "count": c} for (a, b), c in pair.most_common(40)],
        },
        "parameters": params,
        "parameters_when_section_on": params_on,
    }
    json.dump(out, open(OUT, "w"), indent=1)
    print(f"{files} presets · {len(params)} scalar params · median {np.median(nmods)} live routings · -> {OUT}")


if __name__ == "__main__":
    main()
