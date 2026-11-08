// visualizer.js — Wavetable Scanner's picture for the plugin's CRT: the table as a landscape.
// (Written from visualizer.src.js by tools/make_tables.py, which bakes the tables in.)
//
// Every frame of the table is a ridge, laid back into the screen in table order: the first
// frame nearest, the last at the back. Each ridge is filled below in the glass's black, so a
// nearer ridge hides what is behind it and the table reads as terrain. The bright amber line
// is the frame playing now, read between its two neighbours at the scan's Position, the way
// the browser scanner draws it; the faint plane under it is the cut through the landscape.
//
// Position comes from the plugin's probe, so the line moves with the LFO and the mod envelope,
// not only with the knob. Drag up and down on the picture (or along the depth of the
// landscape) and Position moves: the drag is the knob, with automation and undo.
//
// The ridges are the raw frames, 128 points each. The engine plays the morphed table (the
// in-between frames built in the spectrum), so between two ridges the line is a plain blend
// of their drawings: a picture of where the scan is, not a scope of the sound.
//
// Contract with the editor (VST Template machinery/ui/editor.html, § the CRT's picture):
//   WavetableScannerView.mount(el, hooks)          hooks { get, set, begin, end } by parameter id
//   WavetableScannerView.frame(probes, params, dt) probes: [position, voices, folder]; params by id
//
// Table 3 to 10 are the folder slots (src/UserTables.h). The picture doesn't have their
// frames, so a filled slot is drawn as level ground with the scan still moving across it,
// and an empty slot draws the fm chain, which is what it plays.
const WavetableScannerView = (() => {
  const TABLES = %%TABLES%%;
  const PTS = 128, MAXRIDGES = 56;
  const PHOS = [124, 255, 178], AMBER = [255, 179, 71];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const decoded = TABLES.map(t => {
    const bin = atob(t.data), f = new Float32Array(bin.length);
    for (let i = 0; i < bin.length; i++) { const b = bin.charCodeAt(i); f[i] = (b > 127 ? b - 256 : b) / 127; }
    return { label: t.label, frames: t.frames, data: f };
  });
  let el = null, cv = null, g = null, hooks = null, W = 0, H = 0, dpr = 1;
  let tab = 0, pos = 0, voices = 0, folder = 0, dragging = false;
  const FLAT = { label: "", frames: 24, data: new Float32Array(24 * PTS) };

  // the camera: depth d in 0..1 (front to back), x in 0..1, amplitude y in −1..1
  function project(x, d, y) {
    const s = 1 / (1 + 1.6 * d);                       // farther is smaller
    const cx = W / 2, horizon = H * 0.24, ground = H * 0.80;
    const baseY = horizon + (ground - horizon) * s;     // the ridge's floor rises toward the horizon
    const width = W * 0.86 * s;
    return [cx + (x - 0.5) * width, baseY - y * H * 0.16 * s];
  }

  function ridge(t, f) {
    const out = new Float32Array(PTS), base = f * PTS;
    for (let i = 0; i < PTS; i++) out[i] = t.data[base + i];
    return out;
  }
  function between(t, p) {
    const fp = p * (t.frames - 1), a = Math.floor(fp), b = Math.min(t.frames - 1, a + 1), w = fp - a;
    const out = new Float32Array(PTS);
    for (let i = 0; i < PTS; i++) out[i] = t.data[a * PTS + i] * (1 - w) + t.data[b * PTS + i] * w;
    return out;
  }
  function path(ys, d) {
    g.beginPath();
    for (let i = 0; i < PTS; i++) { const [x, y] = project(i / (PTS - 1), d, ys[i]); i ? g.lineTo(x, y) : g.moveTo(x, y); }
  }
  function floorTo(d) { const [x1, y1] = project(1, d, 0), [x0, y0] = project(0, d, 0); g.lineTo(x1, y1 + 2); g.lineTo(x0, y0 + 2); g.closePath(); }

  function draw() {
    if (!g || !W) return;
    let t = decoded[tab] || decoded[0], label = t.label.toUpperCase() + ` · ${t.frames} FRAMES`;
    if (tab >= decoded.length) {
      const slot = `FOLDER ${tab - decoded.length + 1}`;
      if (folder < 0) { t = decoded[2]; label = `${slot} · EMPTY · PLAYING THE FM CHAIN`; }
      else { t = FLAT; label = `${slot} · YOUR TABLE · ITS SHAPE ISN'T DRAWN HERE YET`; }
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const n = Math.min(MAXRIDGES, t.frames), cut = pos;
    // back to front; a ridge is drawn bright when it sits near the scan
    const picks = [];
    for (let j = 0; j < n; j++) picks.push(n === 1 ? 0 : Math.round(j * (t.frames - 1) / (n - 1)));
    let cursorDrawn = false;
    for (let j = picks.length - 1; j >= -1; j--) {
      const f = j >= 0 ? picks[j] : -1, d = j >= 0 ? (t.frames > 1 ? f / (t.frames - 1) : 0) : -1;
      if (!cursorDrawn && (j < 0 || d < cut)) {           // the cut sits between the ridges behind and before it
        cursorDrawn = true;
        const ys = between(t, cut);
        g.fillStyle = rgba(AMBER, 0.07);
        g.beginPath();
        const [ax, ay] = project(0, cut, 1.15), [bx, by] = project(1, cut, 1.15), [cx2, cy2] = project(1, cut, -1.15), [dx, dy] = project(0, cut, -1.15);
        g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(cx2, cy2); g.lineTo(dx, dy); g.closePath(); g.fill();
        path(ys, cut); g.strokeStyle = rgba(AMBER, voices > 0 ? 1 : 0.7); g.lineWidth = 2.2;
        g.shadowColor = rgba(AMBER, 0.8); g.shadowBlur = voices > 0 ? 10 : 4; g.stroke(); g.shadowBlur = 0;
      }
      if (j < 0) break;
      const ys = ridge(t, f);
      path(ys, d); floorTo(d); g.fillStyle = "rgba(4,10,7,0.92)"; g.fill();
      path(ys, d);
      const near = Math.max(0, 1 - Math.abs(d - cut) * 6);
      g.strokeStyle = rgba(PHOS, 0.28 + 0.5 * near * (voices > 0 ? 1 : 0.6) + 0.25 * (1 - d));
      g.lineWidth = 1 + near; g.stroke();
    }
    // the readout
    const fr = cut * (t.frames - 1);
    g.font = "11px ui-monospace, Menlo, monospace"; g.fillStyle = rgba(PHOS, 0.85); g.textBaseline = "top";
    g.fillText(label, 12, 10);
    g.textBaseline = "bottom";
    g.fillText(`POSITION ${cut.toFixed(3)} · ${t === FLAT ? "" : `FRAME ${fr.toFixed(1)} · `} ${voices} ${voices === 1 ? "VOICE" : "VOICES"}`, 12, H - 10);
    g.textAlign = "right"; g.textBaseline = "top"; g.fillStyle = rgba(PHOS, 0.45);
    g.fillText("DRAG UP AND DOWN TO SCAN", W - 12, 10);
    g.textAlign = "left";
  }

  // a drag up (into the screen) moves Position toward the back of the table
  function posFromY(clientY) {
    const r = cv.getBoundingClientRect(), y = clientY - r.top;
    const yFront = project(0, 0, 0)[1], yBack = project(0, 1, 0)[1];
    return Math.min(1, Math.max(0, (yFront - y) / (yFront - yBack)));
  }

  function mount(target, h) {
    el = target; hooks = h || null;
    cv = document.createElement("canvas");
    cv.style.cssText = "width:100%;height:100%;display:block;cursor:ns-resize;touch-action:none";
    el.append(cv);
    g = cv.getContext("2d");
    const fit = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = el.clientWidth; H = el.clientHeight;
      if (!W || !H) return;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      draw();
    };
    if (window.ResizeObserver) new ResizeObserver(fit).observe(el);
    window.addEventListener("resize", fit);
    fit();
    cv.addEventListener("pointerdown", e => {
      if (!hooks) return;
      dragging = true; cv.setPointerCapture(e.pointerId); hooks.begin("position");
      pos = posFromY(e.clientY); hooks.set("position", pos); draw();
    });
    cv.addEventListener("pointermove", e => { if (dragging) { pos = posFromY(e.clientY); hooks.set("position", pos); draw(); } });
    const up = () => { if (dragging) { dragging = false; hooks.end("position"); } };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  }

  function frame(probes, params) {
    params = params || {};
    tab = Math.max(0, Math.min(decoded.length + 7, Math.round(params.table || 0)));
    folder = Math.round((probes && probes[2]) || 0);
    voices = Math.round((probes && probes[1]) || 0);
    if (!dragging) {
      const p = probes && Number.isFinite(probes[0]) && voices > 0 ? probes[0] : params.position;
      pos = Number.isFinite(p) ? p : 0;
    }
    if (!W && el) { W = el.clientWidth; H = el.clientHeight; if (W) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); } }
    draw();
  }

  return { mount, frame };
})();
