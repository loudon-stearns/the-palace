"""Writes findings.json from the takes already rendered (render_swell.py was stopped before its click test),
then runs the click test. Same measures as render_swell.main()."""
import json, time
import numpy as np, soundfile as sf
from render_swell import HERE, BUNDLE, TAKES, LEAD, TAIL, LEAD_S, env_db, click_test, struck_chord
dry, sr = sf.read(str(BUNDLE / "dry.wav"))
lens = {"phrase": len(dry), "chord": len(struck_chord(sr))}
report = {"takes": {}, "click": {}}
for name, (inp, lk, tk) in TAKES.items():
    y, _ = sf.read(str(HERE / "takes" / f"{name}.wav"))
    e, hop = env_db(y, sr)
    report["takes"][name] = {"input": inp, "seconds": round(len(y) / sr, 2),
        "hangs_past_dry_end_s_-30dB": round(max(0.0, float((np.nonzero(e > -30)[0][-1] + 1) * hop - LEAD_S - lens[inp] / sr)), 2)}
    print(name, report["takes"][name], flush=True)
for name, (lk, tk) in {"highs_first": (LEAD, TAIL), "lows_first": ({**LEAD, "highs_late_share": 0.0}, TAIL)}.items():
    t0 = time.time()
    report["click"][name] = click_test(sr, LEAD_S, {**lk, "seed": 23}, {**tk, "seed": 11})
    print("click", name, report["click"][name], round(time.time() - t0, 1), "s", flush=True)
report["settings"] = {"lead_s": LEAD_S, "lead": LEAD, "tail": TAIL, "cloud": "600 lenses per pass, 150–600 ms, highs late"}
(HERE / "findings.json").write_text(json.dumps(report, indent=2))
