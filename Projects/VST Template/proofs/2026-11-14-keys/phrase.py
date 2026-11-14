"""phrase.py — a 20 s phrase through the real Frustration processor on its default patch
(play = keys), for the ear: short notes that stay whole, a long note the gesture carries
into the tear, the release that lets it settle, then a held low note under the orbit.
Writes phrase.wav and phrase-route.json (B, K and the wobble every 50 ms) beside itself.

  python3 proofs/2026-11-14-keys/phrase.py
"""
import json
import sys
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "machinery" / "tools"))
import verify  # noqa: E402

SR, SECS = 48000, 20.0
NOTES = [(0.0, 0.35, 45, 90), (0.5, 0.35, 52, 80), (1.0, 0.35, 57, 100), (1.5, 0.35, 52, 70),   # short: the gesture barely begins; the orbit alone brushes the edge
         (2.2, 5.0, 45, 110),                                                                  # long: the gesture slides into the tear
         (9.0, 0.4, 57, 90), (9.5, 0.4, 55, 90), (10.0, 0.4, 52, 90),
         (11.0, 7.5, 33, 100)]                                                                 # low and held: the orbit alone

plugin = ROOT / "plugins" / "Frustration"
exe = verify.find_harness(plugin)
table = json.loads(verify.subprocess.run([str(exe), "params"], check=True, capture_output=True, text=True).stdout)
t = np.arange(int(SR * SECS)) / SR
rows = verify.param_rows(table, {}, t)
notes = verify.note_events({"notes": NOTES}, SR)
r = verify.run_harness(exe, "plugin", rows, SR, None, notes, table, HERE)
for f in HERE.glob("_plugin*"):
    f.unlink()
verify.write_wav(HERE / "phrase.wav", r["out"], SR)

pr, hop = r["probes"], SR // 20
fund_less = pr["fundamental"] - pr["f0"]
route = []
for k in range(len(t) // hop):
    a, b = k * hop, (k + 1) * hop
    w = fund_less[max(0, b - 2 * SR):b]
    route.append(dict(t=round(k / 20, 2), B=float(f"{pr['B'][b - 1]:.4g}"), K=round(float(pr["K"][b - 1]), 3),
                      amp=round(float(pr["amp"][b - 1]), 3), wobble=round(float(w.std()), 3)))
(HERE / "phrase-route.json").write_text(json.dumps(route))
x = r["out"][0]
print(f"phrase.wav: {SECS:g} s, peak {20 * np.log10(np.abs(x).max()):.1f} dBFS")
for s in (1.0, 3.0, 5.0, 7.0, 8.5, 12.0, 16.0):
    e = route[int(s * 20)]
    print(f"  {s:4.1f} s  B {e['B']:.3g}  K {e['K']:5.2f}  amp {e['amp']:.2f}  wobble over 2 s {e['wobble']:.2f} Hz")
