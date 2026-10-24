#!/usr/bin/env python3
"""build_face.py — Crystal Synthesizer's whole face, in VST Template's own editor,
before the template can build it.

  python3 plugin/ui/build_face.py            →  crystal-synthesizer-face.html in the bundle
  python3 plugin/ui/build_face.py --shot     →  and crystal-synthesizer-face.png (headless Chrome)
  python3 plugin/ui/build_face.py --fit      →  and ui.py's fit test at the plugin.json sizes

It does what `ui.py mock` does (the template's editor.html, dressed in Drafting
Table, drawn from the parameter table), but the table comes from check/engine_check
(the JUCE-free harness stand-in), and the CRT is not colour bars: the page runs the
engine (ui/crystal_engine.js) and feeds the crystal (ui/visualizer.js) the probe
frame and the parameter values once a frame, which is what the CRT feed will do in
the plugin. In the plugin a host sends the notes; here the page takes computer keys,
Web MIDI, and a looping demo that walks the palette.
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
  if (!glass || typeof BINDINGS === "undefined" || !BINDINGS.has("level")) return setTimeout(go, 30);
  const SR = 44100, eng = new CE.Engine(SR), v = Float64Array.from(CE.DEFAULTS);
  const B = id => BINDINGS.get(id);
  const read = () => { CE.IDS.forEach((id, i) => { const b = B(id); if (b) v[i] = b.get(); }); return v; };
  const params = () => { const q = {}; CE.IDS.forEach((id, i) => q[id] = v[i]); return q; };
  const setP = (id, x) => { const b = B(id); if (b) b.set(x); };
  read();
  CrystalScope.mount(glass);

  // the mock's stand-in for the host: a small strip on the glass, gone in the plugin
  const bar = document.createElement("div");
  bar.style.cssText = "position:absolute;inset:auto;width:auto;height:auto;left:12px;top:10px;display:flex;gap:6px;align-items:center;z-index:2;white-space:nowrap;" +
    "font:10px/1 'JetBrains Mono',ui-monospace,monospace;color:rgba(184,191,232,.65);pointer-events:auto";
  const btn = t => { const b = document.createElement("button"); b.textContent = t;
    b.style.cssText = "background:rgba(10,12,22,.7);color:#d9def8;border:1px solid #2f3452;border-radius:3px;padding:3px 6px;font:inherit;cursor:pointer"; return b; };
  const sound = btn("sound on"), demoB = btn("demo ■");
  const hint = document.createElement("span"); hint.textContent = "keys A–K (Z X octave) · MIDI";
  bar.append(sound, demoB, hint); glass.append(bar);

  const held = new Set();
  const on = (m, vel = 0.8) => { held.add(m); eng.noteOn(m, vel); };
  const off = m => { if (!held.has(m)) return; held.delete(m); eng.noteOff(m); };
  const KB = "awsedftgyhujk"; let oct = 0;
  addEventListener("keydown", e => {
    if (e.repeat || e.metaKey || e.ctrlKey) return;
    if (e.key === "z") oct = Math.max(-3, oct - 1); if (e.key === "x") oct = Math.min(2, oct + 1);
    const k = KB.indexOf(e.key); if (k >= 0) { stopDemo(); on(57 + 12 * oct + k, 0.85); }
  });
  addEventListener("keyup", e => { const k = KB.indexOf(e.key); if (k >= 0) off(57 + 12 * oct + k); });
  if (navigator.requestMIDIAccess) navigator.requestMIDIAccess().then(acc => {
    for (const inp of acc.inputs.values()) inp.onmidimessage = ev => {
      const [s, n, vel] = ev.data, c = s & 0xf0;
      if (c === 0x90 && vel > 0) { stopDemo(); on(n, vel / 127); } else if (c === 0x80 || c === 0x90) off(n);
    };
  }).catch(() => {});

  // the demo: one phrase per mineral, with the knob that mineral teaches moving
  const arp = (notes, gap, vel, len) => notes.map((n, i) => [i * gap, () => { on(n, vel); setTimeout(() => off(n), len * 1000); }]);
  const SCENES = [
    { c: 4, set: { angle: 90, fire: 40, lifetime: 1, spread: 1 }, notes: arp([57, 61, 64, 69], 0.35, 0.8, 1.2), len: 5,
      move: u => ({ angle: 90 * (1 - u) }) },                                  // ruby: turn to the axis, the pair folds into one
    { c: 0, set: { angle: 90, fire: 260, lifetime: 1, spread: 1 }, notes: arp([45, 57], 1.2, 0.95, 3), len: 6 },   // diamond: the bell, fanned
    { c: 2, set: { angle: 90, fire: 60, lifetime: 3, spread: 1 }, notes: arp([52, 59, 64], 0.5, 0.8, 2), len: 5,
      move: u => ({ spread: Math.pow(2, 4 * u) }) },                           // zircon's optics, the split widening
    { c: 5, set: { angle: 70, fire: 40, lifetime: 2, spread: 1 }, notes: arp([50, 57, 62, 66, 69], 0.25, 0.75, 1), len: 4 },
    { c: 8, set: { angle: 60, fire: 150, lifetime: 2, spread: 1 }, notes: arp([40, 47, 52], 0.6, 0.9, 1.5), len: 5 },
    { c: 3, set: { angle: 90, fire: 80, lifetime: 4, spread: 6 }, notes: arp([55, 59, 62, 67, 71], 0.3, 0.7, 2), len: 6 },
  ];
  let demo = true, demoT = 0, scene = -1, events = [], ev = 0;
  const startScene = i => {
    scene = i % SCENES.length; const s = SCENES[scene];
    setP("crystal", s.c); for (const k in s.set) setP(k, s.set[k]);
    events = s.notes; ev = 0; demoT = 0;
  };
  function stopDemo() { if (!demo) return; demo = false; demoB.textContent = "demo ▸"; [...held].forEach(off); }
  demoB.onclick = () => { if (demo) stopDemo(); else { demo = true; demoB.textContent = "demo ■"; startScene(0); } };
  const advance = dt => {
    if (!demo) return;
    if (scene < 0) startScene(0);
    demoT += dt;
    while (ev < events.length && demoT >= events[ev][0]) events[ev++][1]();
    const s = SCENES[scene];
    if (s.move) { const q = s.move(Math.min(1, demoT / s.len)); for (const k in q) setP(k, q[k]); }
    if (demoT >= s.len) startScene(scene + 1);
  };

  let actx = null;
  const run = (n, L, R) => { read(); for (let i = 0; i < n; i++) { const o = eng.step(v); if (L) { L[i] = o[0]; R[i] = o[1]; } } };
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
    CrystalScope.frame(eng.readProbes(), params());
    requestAnimationFrame(tick);
  };
  const q = new URLSearchParams(location.search), jump = +q.get("t");   // for pictures: ?t=SECONDS
  if (jump > 0) for (let x = 0; x < jump; x += 1 / 60) { advance(1 / 60); run(Math.round(SR / 60)); CrystalScope.frame(eng.readProbes(), params(), 1 / 60); }
  requestAnimationFrame(tick);
})();
"""


def table():
    exe = PLUGIN / "check/engine_check"
    if not exe.exists():
        subprocess.run([sys.executable, str(PLUGIN / "check/check_engine.py"), "--quick", "0.1"], check=True)
    t = json.loads(subprocess.run([str(exe), "params"], check=True, capture_output=True, text=True).stdout)
    for p in t["params"]:
        p.setdefault("automatable", True)
    return t


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--shot", action="store_true")
    ap.add_argument("--fit", action="store_true")
    ap.add_argument("--t", type=float, default=1.6, help="--shot: seconds into the demo")
    ap.add_argument("--out", default="crystal-synthesizer-face")
    a = ap.parse_args()

    pj, ui_ = ui.ui_block(PLUGIN)
    info = dict(name=pj["name"], version=pj["version"], company=pj["company"], params=table()["params"], ui=ui_)
    html = ui.page(ui_, info)
    # Drafting Table's knob and fader draw their first value from spec.def (Belief
    # Cloud found it; its tuning ledger holds the fix for the house). The demo moves
    # knobs through the bindings, so patch the inlined copy the same way.
    bug = "o.value == null ? spec.def : (o.binding ? o.binding.get() : o.value)"
    fix = "o.binding ? o.binding.get() : (o.value == null ? spec.def : o.value)"
    print("patched dt-controls first-value reads:", html.count(bug))
    html = html.replace(bug, fix)
    eng = (HERE / "crystal_engine.js").read_text().split("/*ENGINE-START*/")[1].split("/*ENGINE-END*/")[0]
    vis = (HERE / "visualizer.js").read_text().replace('if (typeof module !== "undefined") module.exports = CrystalScope;', "")
    extra = "<script>\n" + ui.inline_js(eng + "\n" + vis + "\n" + GLUE) + "\n</script>\n"
    html = html.replace("</body>", extra + "</body>")
    out = BUNDLE / f"{a.out}.html"
    out.write_text(html)
    print("wrote", out, len(html), "bytes")

    if a.shot:
        w, h = ui_["width"], ui_["height"]
        png = BUNDLE / f"{a.out}.png"
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
