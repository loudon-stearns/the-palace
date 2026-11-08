"""preview.py — the dish on a page of its own, playing a 30-second performance in sync.

Plays a performance through the plugin's own processor (the harness's 'plugin' mode, the
same code Live runs), keeps its probes at 480 a second the way the plugin sends them to
the CRT, and writes one standalone HTML page: ui/visualizer.js driven by those probes,
with the performance's sound inline, so the picture and the echoes play together.

    python3 ui/preview.py            -> proofs/dish-performance.html, proofs/dish-performance.wav
    python3 ui/preview.py --shots    also photographs five moments with headless Chrome

The performance, on the Five flakes dish with the knobs at their defaults:
  0-9 s    bass plucks. The mold covers the agar as a mesh; after its six-second grace the
           flow carves it down to the roads that carry the bass.
  9-18 s   the music moves to the middle (300 and 750 Hz): the bass roads let go, tips go out.
  18-24 s  the highs (1.9 and 4.7 kHz) take over.
  24-30 s  every band at once, while Feed sinks from eating to starving: the colony thins.
"""
import base64
import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
PLUG = HERE.parent
sys.path.insert(0, str(PLUG / "reference"))
import sketch                                    # noqa: E402

SR, SECS, FEED = 44100, 30.0, 480
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
HARNESS = PLUG / "build/SlimeMoldDelayHarness_artefacts/Release/SlimeMoldDelayHarness"
STORY = [(0, "bass plucks: the mold covers the agar as a mesh"),
         (6.5, "the grace ends: the flow carves the mesh down to roads"),
         (9, "the music moves to the middle: the bass roads let go, tips go out"),
         (18, "the highs take over"),
         (24, "every band at once, while Feed sinks toward starving")]
SHOTS = [3.0, 8.0, 15.0, 22.0, 29.0]


def pluck(t, start, f, amp=0.28, decay=4.0):
    x = np.zeros_like(t)
    m = t >= start
    tt = t[m] - start
    ph = (f * tt) % 1.0
    saw = sum(np.sin(2 * np.pi * k * f * tt) / k for k in range(1, 6))
    x[m] = amp * np.exp(-tt * decay) * saw * 0.6
    return x


def performance():
    steps = int(SR * SECS)
    t = np.arange(steps) / SR
    x = np.zeros(steps)
    ev = []
    ev += [(s, [110.0, 98.0, 130.8, 82.4][i % 4]) for i, s in enumerate(np.arange(0.0, 9.0, 0.5))]
    ev += [(s, [293.7, 740.0, 349.2, 659.3][i % 4]) for i, s in enumerate(np.arange(9.0, 18.0, 0.45))]
    ev += [(s, [1975.5, 4698.6, 1760.0, 3951.1][i % 4]) for i, s in enumerate(np.arange(18.0, 24.0, 0.4))]
    ev += [(s + 0.011 * k, f) for s in np.arange(24.0, 30.0, 0.75) for k, f in enumerate([110.0, 293.7, 740.0, 1975.5, 4698.6])]
    for st, f in ev:
        x += pluck(t, st, f, amp=0.18 if st >= 24.0 else 0.28)
    inputs = np.vstack([x * 0.8, x * 1.0]).astype(np.float32)
    vals = {p: np.full(steps, d) for p, d in
            dict(feed=1.0, flow=0.9, clock=1.0, budget=2.4, dish=0, cover=0, regen=1.0, dry=0.3, wet=1.0).items()}
    vals["feed"] = np.where(t < 24.0, 1.0, 1.0 - 0.75 * np.clip((t - 24.0) / 5.0, 0, 1))
    return steps, t, inputs, vals


def run():
    steps, t, inputs, vals = performance()
    rows = np.vstack([vals[p] for p in sketch.PARAM_IDS]).astype(np.float64)
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        rows.tofile(tmp / "paths.f64")
        inputs.tofile(tmp / "in.f32")
        subprocess.run([str(HARNESS), "plugin", str(steps), str(SR), str(tmp / "paths.f64"), str(tmp / "out.bin"), str(tmp / "in.f32")],
                       check=True, capture_output=True)
        raw = (tmp / "out.bin").read_bytes()
    out = np.frombuffer(raw[:4 * 2 * steps], dtype=np.float32).reshape(2, steps)
    probes = np.frombuffer(raw[4 * 2 * steps:], dtype=np.float64).reshape(len(sketch.PROBES), steps)
    return steps, t, inputs, vals, out, probes


def write_wav(path, x):
    y = np.clip(x.T, -1, 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((y * 32767).astype("<i2").tobytes())


def main():
    shots = "--shots" in sys.argv
    proofs = PLUG / "proofs"
    proofs.mkdir(exist_ok=True)
    steps, t, inputs, vals, out, probes = run()
    wav = proofs / "dish-performance.wav"
    write_wav(wav, out)
    m4a = Path(tempfile.mkdtemp()) / "perf.m4a"
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "160000", str(wav), str(m4a)], check=True)
    audio = base64.b64encode(m4a.read_bytes()).decode()
    every = int(round(SR / FEED))
    idx = np.arange(every - 1, steps, every)
    peak = np.array([np.abs(out[0, max(0, i - every + 1):i + 1]).max() for i in idx])
    frames = np.vstack([probes[:, idx], peak[None, :]]).T
    params = [dict(feed=round(float(vals["feed"][i]), 3)) for i in idx[::8]]
    data = dict(rate=FEED, frames=np.round(frames, 5).tolist(), params=params, story=STORY, secs=SECS)
    vis = (HERE / "visualizer.js").read_text()
    page = PAGE.replace("/*VIS*/", vis).replace("/*DATA*/", json.dumps(data, separators=(",", ":"))).replace("AUDIO64", audio)
    html = proofs / "dish-performance.html"
    html.write_text(page)
    print(f"wrote {html} ({html.stat().st_size / 1e6:.1f} MB) and {wav}")
    report = dict(secs=SECS, peak_dbfs=float(20 * np.log10(np.abs(out).max() + 1e-12)),
                  tubes_at={f"{s:g}s": int(probes[sketch.PROBES.index("tubes"), int(s * SR)]) for s in [0, 3, 6, 7, 9, 12, 15, 18, 21, 24, 27, 29.9]},
                  used_at={f"{s:g}s": round(float(probes[sketch.PROBES.index("used"), int(s * SR)]), 2) for s in [0, 6, 7, 9, 15, 21, 24, 29.9]})
    (proofs / "dish-performance-report.json").write_text(json.dumps(report, indent=1))
    print(json.dumps(report))
    if shots:
        for s in SHOTS:
            png = proofs / f"dish-{s:04.1f}s.png"
            subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=960,600",
                            "--virtual-time-budget=60000", f"--screenshot={png}", f"file://{html}#t={s}"],
                           check=True, capture_output=True)
            print("shot", png)


PAGE = r"""<!doctype html>
<html><head><meta charset="utf-8"><title>Slime Mold Delay — the dish, playing</title>
<style>
html,body{margin:0;height:100%;background:#050606;color:#cfe;font:12px "JetBrains Mono",ui-monospace,monospace}
#wrap{position:absolute;inset:0 0 44px 0}
#screen{position:absolute;inset:0;overflow:hidden}
#bar{position:absolute;left:0;right:0;bottom:0;height:44px;display:flex;align-items:center;gap:14px;padding:0 14px;border-top:1px solid #1d2a24}
button{background:#0f1814;color:#7cffb2;border:1px solid #2c4a3a;font:inherit;padding:6px 12px;cursor:pointer}
#story{color:#d8c79c}
#t{color:#7cffb2;min-width:52px}
</style></head><body>
<div id="wrap"><div id="screen"></div></div>
<div id="bar"><button id="play">▸ play</button><span id="t">0.0 s</span><span id="story"></span></div>
<audio id="au" src="data:audio/mp4;base64,AUDIO64"></audio>
<script>
/*VIS*/
const DATA = /*DATA*/;
const el = document.getElementById("screen"), au = document.getElementById("au");
window.editorProbes = { names: [], p: [], out: 0, h: [], rate: DATA.rate };
SlimeDish.mount(el, { get: () => 1, set() {}, begin() {}, end() {} });
let shown = 0;
function at(sec, dt) {
  const n = Math.min(DATA.frames.length, Math.floor(sec * DATA.rate));
  const h = DATA.frames.slice(shown, n); shown = n;
  const f = DATA.frames[Math.max(0, n - 1)];
  window.editorProbes.h = h.length ? h : [f];
  window.editorProbes.p = f; window.editorProbes.out = h.length ? Math.max(...h.map(r => r[r.length - 1])) : 0;
  const pr = DATA.params[Math.min(DATA.params.length - 1, Math.floor(n / 8))];
  SlimeDish.frame(f, { feed: pr.feed, flow: 0.9, dish: 0 }, dt);
  document.getElementById("t").textContent = sec.toFixed(1) + " s";
  let s = DATA.story[0][1]; for (const [t0, txt] of DATA.story) if (sec >= t0) s = txt;
  document.getElementById("story").textContent = s;
}
const m = location.hash.match(/t=([\d.]+)/);
if (m) {                                   // a still: replay up to that moment
  const T = +m[1];
  for (let s = 0; s <= T; s += 1 / 60) at(s, 1 / 60);
} else {
  let last = performance.now();
  at(0, 0);
  setInterval(() => {
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (au.paused && au.currentTime === 0) return;
    if (au.currentTime < shown / DATA.rate - 0.05) { shown = 0; }
    at(au.currentTime, au.paused ? 0 : dt);
  }, 1000 / 60);
  document.getElementById("play").onclick = () => { au.paused ? au.play() : au.pause(); };
}
</script></body></html>
"""

if __name__ == "__main__":
    main()
