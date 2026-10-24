#!/usr/bin/env python3
"""build_face.py — Blood Compressor's whole face, in VST Template's own editor, before
the template can build it. Made from Belief Cloud's (Bayesian Granular Synthesizer).

  python3 plugin/ui/build_face.py            →  blood-compressor-face.html in the bundle
  python3 plugin/ui/build_face.py --shot     →  and blood-compressor-face.png (headless Chrome)
  python3 plugin/ui/build_face.py --fit      →  and ui.py's fit test at the plugin.json sizes

It does what `ui.py mock` does — the template's editor.html, dressed in Drafting Table on
Phosphor, drawn from the parameter table — but the table comes from check/engine_check
(the JUCE-free harness stand-in), and the CRT is not colour bars: the page runs the
engine (ui/blood_compressor.js, held to the sketch by check/check_engine.py) on a
heartbeat or a drum loop and feeds the artery (ui/visualizer.js) the probe frame and
the parameter values once a frame, which is what the CRT feed will do in the plugin.
In the plugin the host sends the audio; here a small strip on the glass picks it.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PLUGIN = HERE.parent
BUNDLE = PLUGIN.parent
TEMPLATE = BUNDLE.parent / "VST Template"
sys.path.insert(0, str(TEMPLATE / "machinery/tools"))
import ui  # noqa: E402  (VST Template's ui.py)

GLUE = r"""
(function go() {
  const glass = window.editorScreen;
  if (!glass || typeof BINDINGS === "undefined" || !BINDINGS.has("bypass")) return setTimeout(go, 30);
  const SR = 44100, comp = new BCE.Compressor(SR), v = Float64Array.from(BCE.DEFAULTS);
  const read = () => { BCE.IDS.forEach((id, i) => { const b = BINDINGS.get(id); if (b) v[i] = b.get(); }); return v; };
  const params = () => { const q = {}; BCE.IDS.forEach((id, i) => q[id] = v[i]); return q; };
  BloodVessel.mount(glass);

  // two sources, the same as the check's paths: the vessel's heartbeat and a plain beat
  let n = 0, ph = 0, src = "heart", seed = 7;
  const noise = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2147483648 - 1; };
  function heart() {
    const t = n / SR, T = 60 / 72, u = t % T;
    const lub = u < 0.012 ? u / 0.012 : Math.exp(-(u - 0.012) / 0.07), w = u - 0.30;
    const dub = w < 0 ? 0 : (w < 0.010 ? w / 0.010 : Math.exp(-(w - 0.010) / 0.05));
    ph += 2 * Math.PI * 110 / SR; if (ph > 2 * Math.PI) ph -= 2 * Math.PI;
    const x = Math.min(1, 0.025 + 0.72 * lub + 0.40 * dub) * (Math.sin(ph) + 0.5 * Math.sin(2 * ph) + 0.25 * Math.sin(3 * ph)) / 1.45;
    return [x, x];
  }
  let kph = 0;
  function drums() {
    const t = n / SR, beat = 0.6, pos = t % (4 * beat), nz = noise();
    let k = 0, s = 0;
    for (const b of [0, 2]) { const u = pos - b * beat; if (u >= 0 && u < 2 * beat) { kph += 2 * Math.PI * (45 + 90 * Math.exp(-u / 0.03)) / SR; k += Math.exp(-u / 0.25) * Math.sin(kph); } }
    for (const b of [1, 3]) { const u = pos - b * beat; if (u >= 0 && u < beat * 1.5) s += Math.exp(-u / 0.12) * (0.6 * nz + 0.4 * Math.sin(2 * Math.PI * 190 * t)); }
    const h = Math.exp(-((t % (beat / 2)) / 0.02)) * nz * 0.25, x = 0.7 * k + 0.45 * s + h;
    return [x, 0.92 * x];
  }
  const run = (count, L, R) => {
    read();
    for (let i = 0; i < count; i++, n++) {
      const [a, b] = src === "heart" ? heart() : drums();
      const o = comp.step(v, a, b);
      if (L) { L[i] = o[0]; R[i] = o[1]; }
    }
  };

  // the mock's stand-in for the host: a small strip on the glass, gone in the plugin
  // (the editor stretches every child of the glass to fill it, so the strip undoes that)
  const bar = document.createElement("div");
  bar.style.cssText = "position:absolute;inset:auto;width:auto;height:auto;left:12px;top:10px;display:flex;gap:6px;align-items:center;z-index:2;white-space:nowrap;" +
    "font:10px/1 'JetBrains Mono',ui-monospace,monospace;color:rgba(255,200,210,.6);pointer-events:auto";
  const btn = t => { const b = document.createElement("button"); b.textContent = t;
    b.style.cssText = "background:rgba(20,0,6,.7);color:#ffd9df;border:1px solid #5a1b28;border-radius:3px;padding:3px 6px;font:inherit;cursor:pointer"; return b; };
  const sound = btn("sound on"), heartB = btn("● heart"), drumB = btn("○ drums");
  const hint = document.createElement("span"); hint.textContent = "the host's audio stands in here";
  bar.append(sound, heartB, drumB, hint); glass.append(bar);
  const pick = s => { src = s; heartB.textContent = (s === "heart" ? "● " : "○ ") + "heart"; drumB.textContent = (s === "drums" ? "● " : "○ ") + "drums"; };
  heartB.onclick = () => pick("heart"); drumB.onclick = () => pick("drums");
  const q = new URLSearchParams(location.search);
  if (q.get("src") === "drums") pick("drums");

  let actx = null;
  sound.onclick = () => {
    if (actx) { actx.close(); actx = null; sound.textContent = "sound on"; return; }
    actx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SR });
    const node = actx.createScriptProcessor(1024, 0, 2);   // not a worklet: the board's sandbox can't load one
    node.onaudioprocess = e => run(e.outputBuffer.length, e.outputBuffer.getChannelData(0), e.outputBuffer.getChannelData(1));
    node.connect(actx.destination); sound.textContent = "sound off";
  };
  let last = performance.now();
  const tick = t => {
    const dt = Math.min(0.1, (t - last) / 1000); last = t;
    if (!actx) run(Math.round(dt * SR));
    BloodVessel.frame(comp.probes, params(), dt);
    requestAnimationFrame(tick);
  };
  const jump = +q.get("t");   // for pictures: ?t=SECONDS of music before the first frame
  if (jump > 0) for (let x = 0; x < jump; x += 1 / 60) { run(Math.round(SR / 60)); BloodVessel.frame(comp.probes, params(), 1 / 60); }
  requestAnimationFrame(tick);
})();
"""


def table():
    exe = PLUGIN / "check/engine_check"
    if not exe.exists():
        subprocess.run([sys.executable, str(PLUGIN / "check/check_engine.py"), "--quick", "0.2"], check=True)
    t = json.loads(subprocess.run([str(exe), "params"], check=True, capture_output=True, text=True).stdout)
    for p in t["params"]:
        p.setdefault("automatable", True)
    return t


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shot", action="store_true")
    ap.add_argument("--fit", action="store_true")
    ap.add_argument("--t", type=float, default=4.0, help="--shot: seconds of music before the picture")
    ap.add_argument("--src", default="heart", help="--shot: heart or drums")
    ap.add_argument("--set", action="append", default=[], help="--shot: id=value, a knob's starting value")
    a = ap.parse_args()

    pj, ui_ = ui.ui_block(PLUGIN)
    params = table()["params"]
    for s in a.set:
        k, val = s.split("=", 1)
        next(p for p in params if p["id"] == k)["mock"] = float(val)
    info = dict(name=pj["name"], version=pj["version"], company=pj["company"], params=params, ui=ui_)
    html = ui.page(ui_, info)
    # Drafting Table's knob draws its first value from spec.def, not the binding, each time
    # the editor is built (found by Belief Cloud, 2026-10-22; the fix for the house is in its
    # tuning ledger). The page patches its own inlined copy.
    bug = "o.value == null ? spec.def : (o.binding ? o.binding.get() : o.value)"
    fix = "o.binding ? o.binding.get() : (o.value == null ? spec.def : o.value)"
    print("patched dt-controls first-value reads:", html.count(bug))
    html = html.replace(bug, fix)
    eng = (HERE / "blood_compressor.js").read_text().split("/*ENGINE-START*/")[1].split("/*ENGINE-END*/")[0]
    vis = (HERE / "visualizer.js").read_text().split('if (typeof module')[0]
    extra = "<script>\n" + ui.inline_js(eng + "\n" + vis + "\n" + GLUE) + "\n</script>\n"
    html = html.replace("</body>", extra + "</body>")
    out = BUNDLE / "blood-compressor-face.html"
    out.write_text(html)
    print("wrote", out.relative_to(BUNDLE.parent.parent), len(html), "bytes")

    if a.shot:
        w, h = ui_["width"], ui_["height"]
        tag = "" if a.src == "heart" and not a.set else "-" + a.src + "".join("-" + s.replace("=", "") for s in a.set)
        png = BUNDLE / f"blood-compressor-face{tag}.png"
        png.unlink(missing_ok=True)
        ui.chrome(["--force-device-scale-factor=2", f"--window-size={w},{h}", "--virtual-time-budget=3000",
                   f"--screenshot={png}", out.resolve().as_uri() + f"?t={a.t}&src={a.src}"])
        print("wrote", png.name if png.exists() else "(no picture)")
    if a.fit:
        bad = 0
        for size in [f"{ui_['min'][0]}x{ui_['min'][1]}", f"{ui_['width']}x{ui_['height']}", f"{ui_['max'][0]}x{ui_['max'][1]}"]:
            probe = out.with_name(".fit-probe.html")
            probe.write_text(html.replace("</body>", ui.FIT_PROBE + "</body>"))
            dx, dy = ui.fit(probe, size)
            probe.unlink()
            print(f"fit {size}: {'fits' if dx == 0 and dy == 0 else f'overflows {dx} across, {dy} down'}")
            bad |= dx > 0 or dy > 0
        sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
