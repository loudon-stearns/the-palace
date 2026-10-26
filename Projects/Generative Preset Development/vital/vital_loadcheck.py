"""Load every .vital on this Mac into the hosted plugin and confirm it reads back.
Writes profile-draft/vital_loadcheck.json. ~0.3 s per preset."""
import glob, json, os, sys, time
import pedalboard
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import vital_host as vh
p = pedalboard.load_plugin(vh.VST)
fs = sorted(glob.glob(os.path.expanduser("~/Music/Vital/**/*.vital"), recursive=True))
bad, t0 = [], time.time()
for f in fs:
    try: vh.load(p, open(f).read())
    except Exception as e: bad.append({"file": os.path.relpath(f, os.path.expanduser("~/Music/Vital")), "error": str(e)[:80]})
out = {"presets": len(fs), "loaded": len(fs) - len(bad), "failed": bad, "seconds": round(time.time() - t0)}
json.dump(out, open(os.path.join(HERE, "profile-draft", "vital_loadcheck.json"), "w"), indent=1)
print(out["presets"], "loaded", out["loaded"], "in", out["seconds"], "s")
