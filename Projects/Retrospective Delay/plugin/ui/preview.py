"""preview.py — the séance table on a page of its own, playing a performance in sync.

Runs a 16-second performance through reference/sketch.py (the sound the plugin is
checked against), keeps its probes at 480 a second the way the plugin sends them, and
writes one standalone HTML page: the CRT picture (ui/visualizer.js) driven by those
probes, with the performance's audio inline so picture and sound play together.

    python3 ui/preview.py                     -> proofs/seance-table.html, proofs/seance-performance.wav
    python3 ui/preview.py --shots             also photographs four moments with headless Chrome
    python3 ui/preview.py --speed [--shots]   the Speed performance instead -> proofs/speed-table.html

The performance: play one bar and stop (the tape holds it); summon the ghost; re-lag it
to a quarter, then a whole bar; play a new phrase over it (the tape listens again and
overwrites); dismiss it; summon it once more.
"""
import base64
import io
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
PLUG = HERE.parent
sys.path.insert(0, str(PLUG / "reference"))
import sketch                                    # noqa: E402
from paths import ONE_BAR, phrase                # noqa: E402

SR, SECS, FEED = 44100, 16.0, 480
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def speed_performance():
    """Play one bar and stop; summon it; slow it to half (an octave down); turn it round
    (backwards); race it at double; let it stall; bring it home to 1, onto the beat."""
    steps = int(SR * SECS)
    t = np.arange(steps) / SR
    gain = np.interp(t, [0, 2.2, 3.0, 16], [0, 0, 0.85, 0.85])
    speed = np.interp(t, [0, 4.4, 4.9, 7.0, 7.5, 10.0, 10.4, 12.2, 12.8, 13.5, 14.0, 16],
                         [1, 1, 0.5, 0.5, -1, -1, 2, 2, 0, 0, 1, 1])
    x = phrase(ONE_BAR)(t, SR)
    v = dict(gain=gain, lag=np.ones(steps), bpm=np.full(steps, 120.0), thresh=np.full(steps, -50.0),
             dry=np.ones(steps), speed=speed)
    r = sketch.render(v, SR, x)
    return r["out"], r["probes"], x


def performance():
    steps = int(SR * SECS)
    t = np.arange(steps) / SR
    gain = np.interp(t, [0, 2.2, 3.2, 10.6, 11.4, 12.4, 13.4], [0, 0, 0.9, 0.9, 0, 0, 0.7])
    lag = np.where(t < 5.3, 1, np.where(t < 7.7, 0, 2)).astype(float)
    later = [(s + 8.6, m) for s, m in [(0.0, 74), (0.25, 72), (0.5, 69), (0.75, 67), (1.0, 65), (1.5, 62)]]
    x = phrase(ONE_BAR + later)(t, SR)
    v = dict(gain=gain, lag=lag, bpm=np.full(steps, 120.0), thresh=np.full(steps, -50.0), dry=np.ones(steps))
    r = sketch.render(v, SR, x)
    return r["out"], r["probes"], x


def wav_bytes(y, sr):
    mono = y.mean(axis=0)
    mono = mono / max(1e-9, np.abs(mono).max()) * 0.9
    step = 2                                           # 22.05 kHz is plenty for the page
    pcm = (np.clip(mono[::step], -1, 1) * 32767).astype("<i2")
    buf = io.BytesIO()
    with wave.open(buf, "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(sr // step); f.writeframes(pcm.tobytes())
    return buf.getvalue(), mono


def main():
    sp = "--speed" in sys.argv
    out, pr, _ = speed_performance() if sp else performance()
    stem = "speed" if sp else "seance"
    names = ["knob", "presence", "holding", "head", "lag", "level", "ghost", "speed"]
    hop = SR // FEED
    frames = [[round(float(pr[n][i]), 5) for n in names] + [0.0] for i in range(hop - 1, len(pr["knob"]), hop)]
    audio, mono = wav_bytes(out, SR)
    proofs = PLUG / "proofs"
    proofs.mkdir(exist_ok=True)
    with wave.open(str(proofs / f"{stem}-performance.wav"), "wb") as f:
        pcm = (np.clip(out.T, -1, 1) * 32767).astype("<i2")
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
    vis = (HERE / "visualizer.js").read_text()
    page = PAGE.replace("/*VIS*/", vis).replace("/*FRAMES*/", json.dumps(frames, separators=(",", ":"))) \
               .replace("/*AUDIO*/", base64.b64encode(audio).decode())
    (proofs / f"{stem}-table.html").write_text(page)
    print(f"{len(frames)} probe frames, {len(page) // 1024} KB -> {proofs / f'{stem}-table.html'}")
    if "--shots" in sys.argv:
        for t in ((3.6, 6.0, 8.6, 11.2, 15.0) if sp else (1.2, 4.0, 8.2, 9.4, 12.0)):
            png = proofs / f"{stem}-table-{t:04.1f}s.png"
            subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2",
                            "--window-size=760,440", "--virtual-time-budget=4000", f"--screenshot={png}",
                            f"file://{proofs / f'{stem}-table.html'}?t={t}"], capture_output=True, timeout=90)
            print("shot", png.name, png.exists())


PAGE = r"""<!doctype html><html><head><meta charset="utf-8"><title>Retrospective Delay — the séance table</title>
<style>html,body{margin:0;height:100%;background:#000;color:#bcd;font:12px ui-monospace,Menlo,monospace}
#glass{position:absolute;inset:0 0 34px 0}#bar{position:absolute;left:0;right:0;bottom:0;height:34px;display:flex;gap:10px;align-items:center;padding:0 10px}
button{background:#111;color:#7cffb2;border:1px solid #355;padding:4px 10px;font:inherit;cursor:pointer}</style></head>
<body><div id="glass"></div><div id="bar"><button id="play">▶ play the performance</button><span id="t"></span>
<span style="opacity:.6">— drag up and down on the table to turn Summon by hand once it ends</span></div>
<audio id="au" src="data:audio/wav;base64,/*AUDIO*/"></audio>
<script>/*VIS*/
const FRAMES = /*FRAMES*/, FEED = 480, PER = 8;
const q = new URLSearchParams(location.search), still = q.has("t") ? +q.get("t") : null;
let manual = null;   // after the performance, the hand on the table
const hooks = { get: id => manual ?? 0, set: (id, v) => { manual = v; }, begin() {}, end() {} };
window.editorProbes = { names: [], p: [], out: 0, h: [], rate: FEED };
SeanceTable.mount(document.getElementById("glass"), hooks);
const au = document.getElementById("au"), tEl = document.getElementById("t");
let i = 0, last = performance.now();
function step(to) {
  const h = [];
  while (i < to && i < FRAMES.length) h.push(FRAMES[i++]);
  if (!h.length) h.push(FRAMES[Math.min(i, FRAMES.length) - 1]);
  const p = h[h.length - 1].slice();
  if (manual !== null && (au.paused || au.ended)) p[0] = manual, p[6] = manual * 0.05;
  window.editorProbes.h = h; window.editorProbes.p = p;
  const lagi = p[4] < 0.375 ? 0 : p[4] < 0.75 ? 1 : 2;
  const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
  SeanceTable.frame(p, { bpm: 120, lag: lagi }, dt);
  tEl.textContent = (i / FEED).toFixed(1) + " s";
}
if (still !== null) {   // a photograph: run up to t, a frame at a time
  const end = Math.round(still * FEED);
  i = 0; for (let k = PER; k <= end; k += PER) { last = performance.now() - 1000 / 60; step(k); }
} else {
  document.getElementById("play").onclick = () => { i = 0; manual = null; au.currentTime = 0; au.play(); };
  setInterval(() => {
    if (!au.paused && !au.ended) step(Math.floor(au.currentTime * FEED));
    else step(i < FRAMES.length ? i + PER : i);
  }, 1000 / 60);
}
</script></body></html>"""

if __name__ == "__main__":
    main()
