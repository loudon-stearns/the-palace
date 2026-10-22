#!/usr/bin/env python3
"""build_face.py — Belief Cloud's whole face, in VST Template's own editor, before the
template can build it.

  python3 plugin/ui/build_face.py            →  belief-cloud-face.html in the bundle
  python3 plugin/ui/build_face.py --shot     →  and belief-cloud-face.png (headless Chrome)
  python3 plugin/ui/build_face.py --fit      →  and ui.py's fit test at the plugin.json sizes

It does what `ui.py mock` does — the template's editor.html, dressed in Drafting Table,
drawn from the parameter table — but the table comes from check/engine_check (the
JUCE-free harness stand-in, since no Harness can be built here yet), and the CRT is
not colour bars: the page runs the engine (ui/belief_cloud.js) and feeds the belief
helix (ui/visualizer.js) the probe frame and the parameter values once a frame,
which is what the CRT feed will do in the plugin. The helix paints the prior back
through the editor's own parameter relays (BINDINGS), so the Prior C … B knobs move
as you paint. In the plugin a host sends the notes; here the page takes computer
keys, Web MIDI, and a looping demo.
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
  if (!glass || typeof BINDINGS === "undefined" || !BINDINGS.has("pc_b")) return setTimeout(go, 30);
  const SR = 44100, cloud = new BC.Cloud(SR), v = Float64Array.from(BC.DEFAULTS), P = BC.P;
  const B = id => BINDINGS.get(id);
  const read = () => { BC.IDS.forEach((id, i) => { const b = B(id); if (b) v[i] = b.get(); }); return v; };
  const params = () => { const q = {}; BC.IDS.forEach((id, i) => q[id] = v[i]); return q; };
  const setP = (id, x) => { const b = B(id); if (b) b.set(x); };
  cloud.reset(read());
  BeliefHelix.mount(glass, { set: setP, begin: id => B(id) && B(id).begin(), end: id => B(id) && B(id).end() });

  // the mock's stand-in for the host: a small strip on the glass, gone in the plugin
  // (the editor stretches every child of the glass to fill it, so the strip undoes that)
  const bar = document.createElement("div");
  bar.style.cssText = "position:absolute;inset:auto;width:auto;height:auto;left:12px;top:10px;display:flex;gap:6px;align-items:center;z-index:2;white-space:nowrap;" +
    "font:10px/1 'JetBrains Mono',ui-monospace,monospace;color:rgba(184,191,232,.65);pointer-events:auto";
  const btn = t => { const b = document.createElement("button"); b.textContent = t;
    b.style.cssText = "background:rgba(10,12,22,.7);color:#d9def8;border:1px solid #2f3452;border-radius:3px;padding:3px 6px;font:inherit;cursor:pointer"; return b; };
  const sound = btn("sound on"), demoB = btn("demo ■");
  const hint = document.createElement("span"); hint.textContent = "keys A–K · paint the floor";
  bar.append(sound, demoB, hint); glass.append(bar);

  const held = new Set();
  const on = (m, vel = 0.8) => { if (held.has(m)) return; held.add(m); cloud.noteOn(m, vel); };
  const off = m => { if (!held.has(m)) return; held.delete(m); cloud.noteOff(m); };
  const KB = "awsedftgyhujk";
  addEventListener("keydown", e => { if (e.repeat || e.metaKey || e.ctrlKey) return; const k = KB.indexOf(e.key); if (k >= 0) { stopDemo(); on(60 + k); } });
  addEventListener("keyup", e => { const k = KB.indexOf(e.key); if (k >= 0) off(60 + k); });
  if (navigator.requestMIDIAccess) navigator.requestMIDIAccess().then(acc => {
    for (const inp of acc.inputs.values()) inp.onmidimessage = ev => {
      const [s, n, vel] = ev.data, c = s & 0xf0;
      if (c === 0x90 && vel > 0) { stopDemo(); on(n, vel / 127); } else if (c === 0x80 || c === 0x90) off(n);
    };
  }).catch(() => {});

  // the demo: the 36-second chord-belief take, looping; its pentatonic prior is painted
  // through the knobs, so you can watch Prior C … B move
  const PENTA = [1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0];
  const penta = yes => {
    PENTA.forEach((x, k) => setP(BC.IDS[P.pc_c + k], yes ? x : 1));
    setP("register", yes ? 57 : 64); setP("register_width", yes ? 1.5 : 8);
    setP("prior_shape", yes ? 1 : 0); setP("prior_tone", yes ? 0.7 : 0);
  };
  let demo = true, demoT = 0, step = 0;
  const SCRIPT = [
    [3, () => [60, 64, 67].forEach(m => on(m, 0.85))],
    [11, () => { off(67); on(69, 0.75); }],
    [17, () => [...held].forEach(off)],
    [21, () => penta(true)],
    [27, () => { on(45, 0.9); on(52, 0.7); }],
    [34, () => [...held].forEach(off)],
    [36, () => { penta(false); demoT = 0; step = 0; }],
  ];
  function stopDemo() { if (!demo) return; demo = false; demoB.textContent = "demo ▸"; [...held].forEach(off); }
  demoB.onclick = () => { if (demo) stopDemo(); else { demo = true; demoT = 0; step = 0; demoB.textContent = "demo ■"; } };
  const advance = dt => { if (!demo) return; demoT += dt; while (step < SCRIPT.length && demoT >= SCRIPT[step][0]) SCRIPT[step++][1](); };

  let actx = null;
  const run = (n, L, R) => { read(); for (let i = 0; i < n; i++) { const o = cloud.step(v); if (L) { L[i] = o[0]; R[i] = o[1]; } } };
  sound.onclick = () => {
    if (actx) { actx.close(); actx = null; sound.textContent = "sound on"; return; }
    actx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SR });
    const node = actx.createScriptProcessor(1024, 0, 2);   // not a worklet: the board's sandbox can't load one
    node.onaudioprocess = e => { const L = e.outputBuffer.getChannelData(0), R = e.outputBuffer.getChannelData(1); advance(L.length / SR); run(L.length, L, R); };
    node.connect(actx.destination); sound.textContent = "sound off";
  };
  let last = performance.now();
  const tick = t => {
    const dt = Math.min(0.1, (t - last) / 1000); last = t;
    if (!actx) { advance(dt); run(Math.round(dt * SR)); }
    BeliefHelix.frame(cloud.readProbes(), params());
    requestAnimationFrame(tick);
  };
  const jump = +new URLSearchParams(location.search).get("t");   // for pictures: ?t=SECONDS
  if (jump > 0) for (let x = 0; x < jump; x += 1 / 60) { advance(1 / 60); run(Math.round(SR / 60)); BeliefHelix.frame(cloud.readProbes(), params(), 1 / 60); }
  requestAnimationFrame(tick);
})();
"""


def table():
    exe = PLUGIN / "check/engine_check"
    if not exe.exists():
        subprocess.run([sys.executable, str(PLUGIN / "check/check_engine.py")], check=True)
    t = json.loads(subprocess.run([str(exe), "params"], check=True, capture_output=True, text=True).stdout)
    for p in t["params"]:
        p.setdefault("automatable", True)
    return t


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shot", action="store_true")
    ap.add_argument("--fit", action="store_true")
    ap.add_argument("--t", type=float, default=30.0, help="--shot: seconds into the demo")
    a = ap.parse_args()

    pj, ui_ = ui.ui_block(PLUGIN)
    info = dict(name=pj["name"], version=pj["version"], company=pj["company"], params=table()["params"], ui=ui_)
    html = ui.page(ui_, info)
    # Drafting Table's knob and fader draw their first value from spec.def whenever no
    # o.value is passed, so a bound control shows its default, not the parameter's value,
    # each time the editor is built (dt-controls.js, knob and fader: "o.value == null ?
    # spec.def : (o.binding ? ...)"). The page patches its own inlined copy so the knobs
    # follow the painted prior; the fix for the house is proposed, not made here.
    bug = "o.value == null ? spec.def : (o.binding ? o.binding.get() : o.value)"
    fix = "o.binding ? o.binding.get() : (o.value == null ? spec.def : o.value)"
    print("patched dt-controls first-value reads:", html.count(bug))
    html = html.replace(bug, fix)
    eng = (HERE / "belief_cloud.js").read_text().split("/*ENGINE-START*/")[1].split("/*ENGINE-END*/")[0]
    vis = (HERE / "visualizer.js").read_text()
    extra = "<script>\n" + ui.inline_js(eng + "\n" + vis + "\n" + GLUE) + "\n</script>\n"
    html = html.replace("</body>", extra + "</body>")
    out = BUNDLE / "belief-cloud-face.html"
    out.write_text(html)
    print("wrote", out, len(html), "bytes")

    if a.shot:
        w, h = ui_["width"], ui_["height"]
        png = BUNDLE / "belief-cloud-face.png"
        png.unlink(missing_ok=True)
        ui.chrome(["--force-device-scale-factor=2", f"--window-size={w},{h}", "--virtual-time-budget=3000",
                   f"--screenshot={png}", out.resolve().as_uri() + f"?t={a.t}"])
        print("wrote", png if png.exists() else "(no picture)")
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
