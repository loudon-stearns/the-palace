// visualizer.js — Slime Mold Delay's picture for the CRT: the petri dish, seen at a tilt.
//
// What you are looking at is the delay itself, not a scope of its output.
//
//  - The dish is the plugin's dish: a glass dish of dark agar, tilted toward you. The five
//    oat flakes are the five bands of your sound, labelled by the band they eat, and they
//    swell as their band plays. The red dye spot near the middle is the listener.
//  - Every yellow filament is a tube of the mold, and so a delay line. Its thickness is the
//    tube's thickness in the flow law, raised off the agar so the roads stand up like veins.
//  - The beads that stream along a tube travel at the plugin's Flow speed, in the direction
//    the cytoplasm flows. A bead takes exactly as long to cross a tube as the echo does, so
//    you are watching the sound move through the network.
//  - Thin pale threads wandering off the roads are the tips, out looking for food the mold
//    doesn't reach yet.
//  - When a tube dies it leaves a brown smear on the agar for a while. A real plasmodium
//    leaves the same slime trail, and avoids it: the colony's memory is outside its body.
//  - Drag up or down anywhere on the screen to feed or starve the colony (the Feed knob).
//
// Contract with the editor (VST Template machinery/ui/editor.html, § the CRT's picture):
//   SlimeDish.mount(el, hooks)          draws into el (window.editorScreen); hooks move Feed
//   SlimeDish.frame(probes, params, dt) probes in kProbes order; params { id: value }
// It also reads window.editorProbes.h (every frame since the last call, about 480 a second)
// and .out (the output's peak). Each frame carries four tube slots (the group named by the
// probe "group"), so the table of tubes refreshes about four times a second. Nothing is fetched.
const SlimeDish = (() => {
  const TMAX = 288, GROUP = 4, NB = 5;
  const BAND = ["120 Hz", "300 Hz", "750 Hz", "1.9 kHz", "4.7 kHz"];
  const SINK = [0.52, 0.46];
  function scatter() {
    let st = 11;
    const rng = () => { st = st + 0x6D2B79F5 | 0; let t = Math.imul(st ^ st >>> 15, 1 | st);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const pts = [], d = (x, y, a, b) => Math.sqrt((x - a) * (x - a) + (y - b) * (y - b));
    while (pts.length < 5) {
      const x = 0.12 + 0.76 * rng(), y = 0.12 + 0.76 * rng();
      if (d(x, y, 0.5, 0.5) > 0.38 || d(x, y, SINK[0], SINK[1]) < 0.15) continue;
      if (pts.some(([a, b]) => d(x, y, a, b) < 0.15)) continue;
      pts.push([x, y]);
    }
    return pts;
  }
  const LAYOUTS = [
    [[0.10, 0.30], [0.18, 0.76], [0.86, 0.22], [0.92, 0.66], [0.55, 0.90]].map(([x, y]) => [0.5 + (x - 0.5) * 0.9, 0.5 + (y - 0.5) * 0.9]),
    [0, 1, 2, 3, 4].map(k => [0.5 + 0.36 * Math.cos(-Math.PI / 2 + k * 2 * Math.PI / 5), 0.5 + 0.36 * Math.sin(-Math.PI / 2 + k * 2 * Math.PI / 5)]),
    scatter(),   // the dish's own random draw (mulberry32, seed 11), the same as Algorithm.h
  ];
  const IDX = { lv: 0, tip: 5, tubes: 11, used: 12, group: 13, g: 14 };

  let el = null, cv = null, g = null, hooks = null, W = 0, H = 0, dpr = 1;
  let agar = null;                             // the agar's texture, drawn once per size
  const tubes = Array.from({ length: TMAX }, () => ({ live: false, ax: 0, ay: 0, bx: 0, by: 0, d: 0, q: 0, ph: Math.random(), seen: 0 }));
  const ghosts = [];                           // dead tubes: { ax, ay, bx, by, d, age }
  const tips = [[], [], []];                   // trails of the exploring tips
  const lv = new Float32Array(NB);
  const flakeAt = Array.from({ length: NB }, () => null);
  let nTubes = 0, used = 0, out = 0, drink = [], clock = 0, drag = null, lastLayout = -1;

  // ---- the camera: the dish plane tilted toward you, a little perspective ------------
  const TILT = 0.92;                           // radians from straight down
  function project(x, y, h = 0) {
    const X = (x - 0.5), Z = (y - 0.5), cz = Math.cos(TILT), sz = Math.sin(TILT);
    const depth = 2.6 - Z * sz;                // far side (small y) is farther away
    const s = Math.min(W * 0.95, H * 1.55) * 1.8 / depth;
    return [W / 2 + X * s, H * 0.5 + (Z * cz - h) * s, s];
  }

  function mount(target, hk) {
    el = target; hooks = hk || null;
    cv = document.createElement("canvas");
    cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;cursor:ns-resize";
    el.append(cv);
    g = cv.getContext("2d");
    cv.addEventListener("pointerdown", e => {
      if (!hooks) return;
      drag = { y: e.clientY, v: +hooks.get("feed") || 0 };
      cv.setPointerCapture(e.pointerId); hooks.begin("feed");
    });
    cv.addEventListener("pointermove", e => {
      if (!drag) return;
      const v = Math.max(0, Math.min(1, drag.v + (drag.y - e.clientY) / 150));
      hooks.set("feed", v);
    });
    const up = () => { if (drag) { drag = null; hooks.end("feed"); } };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  }

  function fit() {
    const w = el.clientWidth, h = el.clientHeight, r = window.devicePixelRatio || 1;
    if (w === W && h === H && r === dpr && agar) return;
    W = w; H = h; dpr = r;
    cv.width = Math.max(1, Math.round(W * dpr)); cv.height = Math.max(1, Math.round(H * dpr));
    agar = makeAgar();
  }

  // ---- the agar: a dark amber gel with grain, drawn once into an offscreen canvas ----
  function makeAgar() {
    const o = document.createElement("canvas");
    o.width = cv.width; o.height = cv.height;
    const a = o.getContext("2d");
    a.setTransform(dpr, 0, 0, dpr, 0, 0);
    ellipse(a, 0.5, 0.5, 0.47);
    const [cx, cy, s] = project(0.5, 0.5);
    const gr = a.createRadialGradient(cx, cy - s * 0.1, s * 0.02, cx, cy, s * 0.55);
    gr.addColorStop(0, "#3a2810"); gr.addColorStop(0.6, "#22170a"); gr.addColorStop(1, "#0d0904");
    a.fillStyle = gr; a.fill();
    a.save(); a.clip();
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 2600; i++) {             // grain: specks and faint swirls in the gel
      const x = 0.03 + rnd() * 0.94, y = 0.03 + rnd() * 0.94;
      const [px, py, ps] = project(x, y);
      a.fillStyle = `rgba(${rnd() < 0.5 ? "255,220,150" : "0,0,0"},${0.03 + rnd() * 0.05})`;
      a.beginPath(); a.ellipse(px, py, ps * 0.004 * (1 + rnd() * 2), ps * 0.0025 * (1 + rnd()), 0, 0, 7); a.fill();
    }
    a.restore();
    return o;
  }

  function ellipse(c, x, y, r) {               // a circle on the dish plane, as the camera sees it
    c.beginPath();
    for (let i = 0; i <= 72; i++) {
      const t = i / 72 * Math.PI * 2;
      const [px, py] = project(x + r * Math.cos(t), y + r * Math.sin(t));
      i ? c.lineTo(px, py) : c.moveTo(px, py);
    }
    c.closePath();
  }

  // ---- reading the probes ---------------------------------------------------------
  function take(f) {
    for (let k = 0; k < NB; k++) lv[k] = f[IDX.lv + k];
    nTubes = f[IDX.tubes]; used = f[IDX.used];
    for (let i = 0; i < 3; i++) {
      const x = f[IDX.tip + 2 * i], y = f[IDX.tip + 2 * i + 1], tr = tips[i];
      if (x < 0) { tr.length = 0; continue; }
      const last = tr[tr.length - 1];
      if (last && Math.hypot(last[0] - x, last[1] - y) > 0.08) tr.length = 0;   // a new tip
      if (!last || last[0] !== x || last[1] !== y) tr.push([x, y]);
      if (tr.length > 40) tr.shift();
    }
    const grp = f[IDX.group] | 0;
    for (let s = 0; s < GROUP; s++) {
      const t = tubes[grp * GROUP + s], o = IDX.g + s * 6, d = f[o + 4];
      if (d < 0) {
        if (t.live) ghosts.push({ ax: t.ax, ay: t.ay, bx: t.bx, by: t.by, d: Math.max(0.05, t.dmax || t.d), age: 0 });
        t.live = false; continue;
      }
      if (t.live && (t.ax !== f[o] || t.bx !== f[o + 2] || t.ay !== f[o + 1])) {   // the slot holds a new tube
        ghosts.push({ ax: t.ax, ay: t.ay, bx: t.bx, by: t.by, d: Math.max(0.05, t.dmax || t.d), age: 0 });
        t.dmax = 0;
      }
      t.live = true; t.ax = f[o]; t.ay = f[o + 1]; t.bx = f[o + 2]; t.by = f[o + 3]; t.d = d; t.q = f[o + 5];
      t.dmax = Math.max(t.dmax || 0, d);
    }
  }

  function flakes(layout) {
    if (layout !== lastLayout) {               // a new dish: forget the old one
      lastLayout = layout;
      for (const t of tubes) t.live = false;
      ghosts.length = 0;
      for (let k = 0; k < NB; k++) flakeAt[k] = LAYOUTS[layout] ? LAYOUTS[layout][k] : null;
    }
  }

  // ---- drawing ----------------------------------------------------------------------
  function tube(t, alpha) {
    const [ax, ay, sa] = project(t.ax, t.ay), [bx, by, sb] = project(t.bx, t.by);
    const s = (sa + sb) / 2, wdt = Math.max(0.7, s * (0.0035 + 0.022 * Math.sqrt(Math.max(0, t.d))));
    const lift = s * 0.004 * Math.min(1, t.d * 2);
    g.lineCap = "round";
    g.strokeStyle = `rgba(0,0,0,${0.45 * alpha})`; g.lineWidth = wdt * 1.3;             // shadow on the agar
    g.beginPath(); g.moveTo(ax + lift, ay + lift * 1.6); g.lineTo(bx + lift, by + lift * 1.6); g.stroke();
    g.strokeStyle = `rgba(214,160,28,${alpha})`; g.lineWidth = wdt;                      // the tube wall
    g.beginPath(); g.moveTo(ax, ay - lift); g.lineTo(bx, by - lift); g.stroke();
    g.strokeStyle = `rgba(255,236,140,${0.75 * alpha})`; g.lineWidth = Math.max(0.5, wdt * 0.38);   // the lit core
    g.beginPath(); g.moveTo(ax - wdt * 0.12, ay - lift - wdt * 0.18); g.lineTo(bx - wdt * 0.12, by - lift - wdt * 0.18); g.stroke();
    return [ax, ay - lift, bx, by - lift, wdt];
  }

  function beads(t, seg, speed, dt, glow) {
    const L = Math.hypot(t.bx - t.ax, t.by - t.ay);
    if (L < 1e-6 || Math.abs(t.q) < 1e-4) return;
    t.ph = (t.ph + dt * speed / L) % 1;                    // one crossing = one echo time
    const dir = t.q > 0 ? 1 : -1, n = Math.max(1, Math.round(L / 0.06));
    const [ax, ay, bx, by, wdt] = seg;
    const a = Math.min(1, 0.25 + Math.abs(t.q) * 1.6) * glow;
    for (let k = 0; k < n; k++) {
      let u = (t.ph + k / n) % 1; if (dir < 0) u = 1 - u;
      const x = ax + (bx - ax) * u, y = ay + (by - ay) * u, r = Math.max(1.2, wdt * 0.75);
      const gr = g.createRadialGradient(x, y, 0, x, y, r * 2.6);
      gr.addColorStop(0, `rgba(255,255,220,${a})`); gr.addColorStop(0.35, `rgba(255,215,80,${a * 0.55})`); gr.addColorStop(1, "rgba(255,200,40,0)");
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 2.6, 0, 7); g.fill();
    }
  }

  function flake(k, x, y, level) {
    const [px, py, s] = project(x, y, 0.004);
    const sw = 1 + Math.min(1.2, level * 7);
    const glow = g.createRadialGradient(px, py, 0, px, py, s * 0.07 * sw);
    glow.addColorStop(0, `rgba(255,214,90,${Math.min(0.75, level * 5)})`); glow.addColorStop(1, "rgba(255,214,90,0)");
    g.fillStyle = glow; g.beginPath(); g.arc(px, py, s * 0.07 * sw, 0, 7); g.fill();
    g.save(); g.translate(px, py); g.rotate(0.6 + k * 1.3); g.scale(1, Math.cos(TILT) * 1.6);
    g.fillStyle = "rgba(0,0,0,0.5)"; g.beginPath(); g.ellipse(2, 3, s * 0.03, s * 0.019, 0, 0, 7); g.fill();
    const fg = g.createLinearGradient(-s * 0.03, -s * 0.02, s * 0.03, s * 0.02);
    fg.addColorStop(0, "#f6ead0"); fg.addColorStop(1, "#b79b6a");
    g.fillStyle = fg; g.beginPath(); g.ellipse(0, 0, s * 0.03, s * 0.019, 0, 0, 7); g.fill();
    g.strokeStyle = "rgba(120,90,50,0.6)"; g.lineWidth = 0.8;
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(-s * 0.022, i * s * 0.006); g.lineTo(s * 0.022, i * s * 0.005); g.stroke(); }
    g.restore();
    g.font = `${Math.max(9, Math.round(s * 0.024))}px "JetBrains Mono", ui-monospace, monospace`;
    g.fillStyle = `rgba(246,234,208,${0.45 + Math.min(0.5, level * 4)})`; g.textAlign = "center";
    g.fillText(BAND[k], px, py + s * 0.055);
  }

  function listener() {
    const [px, py, s] = project(SINK[0], SINK[1], 0.002);
    for (const d of drink) {                    // the listener drinks: rings spread when sound arrives
      const r = s * (0.02 + d.age * 0.09), a = Math.max(0, 0.5 * (1 - d.age / 1.4) * d.a);
      g.strokeStyle = `rgba(230,60,60,${a})`; g.lineWidth = 1.2;
      g.beginPath(); g.ellipse(px, py, r, r * Math.cos(TILT) * 1.15, 0, 0, 7); g.stroke();
    }
    const gr = g.createRadialGradient(px, py, 0, px, py, s * 0.045);
    gr.addColorStop(0, "rgba(255,90,80,0.95)"); gr.addColorStop(0.5, "rgba(180,20,30,0.8)"); gr.addColorStop(1, "rgba(120,0,10,0)");
    g.fillStyle = gr; g.beginPath(); g.ellipse(px, py, s * 0.045, s * 0.045 * Math.cos(TILT) * 1.2, 0, 0, 7); g.fill();
  }

  function frame(probes, params, dt) {
    if (!g) return;
    fit();
    const P = window.editorProbes || {};
    const hist = P.h && P.h.length ? P.h : [probes];
    for (const f of hist) take(f);
    out = P.out || 0;
    clock += dt;
    const layout = (params && params.dish | 0) || 0;
    flakes(layout);
    const speed = (params && +params.flow) || 0.9, feed = params ? +params.feed : 1;

    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // the bench and the dish
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#07090a"); bg.addColorStop(1, "#141210");
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.save(); g.translate(0, H * 0.025); ellipse(g, 0.5, 0.5, 0.5); g.fillStyle = "rgba(0,0,0,0.55)"; g.fill(); g.restore();
    ellipse(g, 0.5, 0.5, 0.495); g.fillStyle = "rgba(170,200,210,0.08)"; g.fill();
    g.drawImage(agar, 0, 0, W, H);

    g.save(); ellipse(g, 0.5, 0.5, 0.47); g.clip();
    // slime trails: where tubes died
    for (let i = ghosts.length - 1; i >= 0; i--) {
      const gh = ghosts[i]; gh.age += dt;
      if (gh.age > 9) { ghosts.splice(i, 1); continue; }
      const [ax, ay, s] = project(gh.ax, gh.ay), [bx, by] = project(gh.bx, gh.by);
      g.strokeStyle = `rgba(120,86,30,${0.35 * (1 - gh.age / 9)})`;
      g.lineWidth = Math.max(1, s * (0.006 + 0.02 * Math.sqrt(gh.d))); g.lineCap = "round";
      g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
    }
    // the mold, far side first
    const live = tubes.filter(t => t.live).sort((a, b) => (a.ay + a.by) - (b.ay + b.by));
    const glow = 0.45 + Math.min(0.55, out * 2.2);
    const segs = live.map(t => tube(t, 0.55 + 0.45 * Math.min(1, t.d * 3)));
    g.globalCompositeOperation = "lighter";
    live.forEach((t, i) => beads(t, segs[i], speed, dt, glow));
    g.globalCompositeOperation = "source-over";
    // tips: pale threads out on their own
    for (const tr of tips) if (tr.length > 1) {
      g.lineCap = "round";
      for (let i = 1; i < tr.length; i++) {
        const [ax, ay] = project(tr[i - 1][0], tr[i - 1][1]), [bx, by] = project(tr[i][0], tr[i][1]);
        g.strokeStyle = `rgba(255,240,170,${0.12 + 0.6 * i / tr.length})`; g.lineWidth = 1 + 1.5 * i / tr.length;
        g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
      }
      const [hx, hy, hs] = project(tr[tr.length - 1][0], tr[tr.length - 1][1]);
      const hg = g.createRadialGradient(hx, hy, 0, hx, hy, hs * 0.018);
      hg.addColorStop(0, "rgba(255,250,210,0.9)"); hg.addColorStop(1, "rgba(255,230,120,0)");
      g.fillStyle = hg; g.beginPath(); g.arc(hx, hy, hs * 0.018, 0, 7); g.fill();
    }
    g.restore();

    if (out > 0.08 && (!drink.length || drink[drink.length - 1].age > 0.18)) drink.push({ age: 0, a: Math.min(1, out * 2) });
    for (const d of drink) d.age += dt;
    drink = drink.filter(d => d.age < 1.4);
    for (let k = 0; k < NB; k++) if (flakeAt[k]) flake(k, flakeAt[k][0], flakeAt[k][1], lv[k]);
    listener();

    // the glass: rim and a highlight across the near side
    ellipse(g, 0.5, 0.5, 0.485); g.strokeStyle = "rgba(200,225,235,0.22)"; g.lineWidth = 2; g.stroke();
    ellipse(g, 0.5, 0.5, 0.5); g.strokeStyle = "rgba(220,240,250,0.35)"; g.lineWidth = 1.2; g.stroke();
    g.save(); ellipse(g, 0.5, 0.5, 0.5); g.clip();
    const [hx, hy, hs] = project(0.28, 0.2);
    const sh = g.createRadialGradient(hx, hy, 0, hx, hy, hs * 0.35);
    sh.addColorStop(0, "rgba(255,255,255,0.07)"); sh.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = sh; g.fillRect(0, 0, W, H); g.restore();

    // the readout, small, in the corner of the bench
    g.font = `${Math.max(9, Math.round(H * 0.028))}px "JetBrains Mono", ui-monospace, monospace`;
    g.textAlign = "left"; g.fillStyle = "rgba(246,234,208,0.55)";
    const state = feed > 0.66 ? "eating" : feed < 0.33 ? "starving" : "grazing";
    g.fillText(`${nTubes | 0} tubes · ${used.toFixed(2)} of road · ${tips.filter(t => t.length).length} tips out`, 12, H - 12);
    g.textAlign = "right";
    g.fillText(`${state} · ${speed.toFixed(2)} dish/s`, W - 12, H - 12);
  }

  return { mount, frame };
})();
