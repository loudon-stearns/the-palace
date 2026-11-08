# title: Generative Preset Development — proof — rich fences keys
# born: 2026-11-03
# links: [[Generative Preset Development]] (connects-to, proof-for-the-rich-face)
# forward_vector: I add the answer keys to the rich-fences bake after the challenge: the Vital generator's own
#   hand-placed bands (generate_vital.BANDS) and the corpus-fifths rule corpus_bands.py uses for Wavetable,
#   applied to Vital's corpus, each mapped to rungs and scored for chance, "partly", and every no-listen arm.
# usage: python3 -I "<this>" "<bundle>/vital" "<bake.json, read and rewritten>"
import json, sys, math, itertools
VITAL, BAKE = sys.argv[1:3]
sys.path.insert(0, VITAL)
import generate_vital as gv
b = json.load(open(BAKE))

def hz(st): return 440 * 2 ** ((st - 69) / 12)
def agree(a, k): return sum(abs(x - y) <= 1 for x, y in zip(a, k))

FENCES = {"cutoff": ["dark", "warm", "open", "bright"], "attack": ["punchy", "soft", "swell"]}
for fam, F in b.items():
    vals = [r["value"] for r in F["rungs"]]; feat = [r["feature"] for r in F["rungs"]]; N = len(vals)
    human = [hz(v) for v in vals] if fam == "cutoff" else [v ** 4 for v in vals]
    first = lambda xs, s: next(i for i, x in enumerate(xs) if x >= s - 1e-12)
    names = FENCES[fam]; n = len(names)
    # the Vital generator's bands: each band begins at its low edge (generate_vital.py BANDS), in Hz or seconds
    gen = [first(human, gv.BANDS[fam][w][0]) for w in names]
    # the corpus fifths, by the corpus_bands.py rule (value < split is the lower band): cutoff's four splits;
    # attack's p20 (punchy), p60 (soft), p80 (swell), the splits that open those three names in its five
    sp = F["splits"]; fif_splits = sp if fam == "cutoff" else [sp[0], sp[2], sp[3]]
    fif = [first(vals, s) for s in fif_splits]
    v0, v1 = vals[0], vals[-1]; g0, g1 = feat[0], feat[-1]
    arms = {
        "even in knob number": [first(vals, v0 + k * (v1 - v0) / (n + 1)) for k in range(1, n + 1)],
        "even in the measure": [first(feat, g0 * (g1 / g0) ** (k / (n + 1))) for k in range(1, n + 1)],
        "bottom of the ladder": list(range(1, n + 1)),
    }
    combos = list(itertools.combinations_with_replacement(range(1, N), n))
    keys = {}
    for kname, key in (("generator", gen), ("fifths", fif)):
        dist = [agree(c, key) for c in combos]
        # the best any placement crowded into the bottom third of the ladder can do: a guess with no listening
        bottom_best = max(agree(c, key) for c in combos if c[-1] <= max(n, N // 3 + 1))
        keys[kname] = dict(fences=key, chance_all=round(sum(d == n for d in dist) / len(combos), 4),
                           chance_partly=round(sum(2 <= d < n for d in dist) / len(combos), 4),
                           arms={a: agree(f, key) for a, f in arms.items()}, bottom_best=bottom_best,
                           confirmable=all(agree(f, key) < n for f in arms.values()) and bottom_best < n)
    # widths of the generator's bands, in octaves of the measure, between band low edges (interpolated on the ladder)
    def at(x):  # measure at a human value, log-log interpolation along the rungs
        for i in range(N - 1):
            a, c = human[i], human[i + 1]
            if a <= x <= c and a > 0:
                t = math.log(x / a) / math.log(c / a); return math.exp(math.log(feat[i]) + t * (math.log(feat[i + 1]) - math.log(feat[i])))
        return None
    lows = [gv.BANDS[fam][w][0] for w in names]; highs = [gv.BANDS[fam][w][1] for w in names]
    F["keys"] = keys; F["fence_names"] = names; F["arms"] = arms; F["placements_n"] = len(combos)
    F["generator_bands"] = {w: gv.BANDS[fam][w] for w in names}
    F["generator_measure_at_edges"] = [[round(at(l), 4) if at(l) else None, round(at(h), 4) if at(h) else None] for l, h in zip(lows, highs)]
    print(fam, "gen", gen, "fifths", fif, "arms", arms)
    for k, v in keys.items(): print("  ", k, v)
    print("   generator measure at band edges", F["generator_measure_at_edges"])
json.dump(b, open(BAKE, "w"), indent=1)
