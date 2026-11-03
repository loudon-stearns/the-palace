// visualizer.js — Retrospective Delay's picture for the CRT: the séance table.
//
// The device is a séance: one measure of tape, always listening, and one knob that
// summons the last phrase back from the dead. So the screen is a round table seen from
// a chair, lit by one candle:
//
//  - The measure is the ring round the table's edge, four beats marked like a spirit
//    board. The write head is the planchette, circling at the tempo with a candle on it.
//  - What you play is laid on the ring as you play it: a column of light at each slot,
//    as tall as you were loud. Fresh ink is warm amber. While you play, the tape listens
//    and the planchette's flame burns orange; stop, and the tape HOLDS (silence keeps):
//    the flame goes blue and still, and the ring stops being re-inked, so the last
//    measure stands there, cooling to violet as it waits.
//  - The read head trails the planchette by the lag (a quarter, half or whole measure);
//    the faint arc between them on the table is the lag itself.
//  - Summon lifts the ghost. Above the table hangs a second ring, the same measure, as
//    high and as bright as the knob is turned. Ectoplasm rises from the read head to it,
//    as thick as the ghost is loud. At zero the ghost ring lies flat and dark on the
//    table and the cat at the table's edge is asleep; turned up, its eyes open; near the
//    top, it is all stars.
//  - Drag up or down anywhere on the screen to turn Summon: lifting your hand raises the
//    ghost. It is the knob moving, with automation and undo.
//
// Everything drawn comes from the plugin's probes: knob, presence, holding, head, lag,
// level, ghost (Algorithm.h kProbes). The ring is rebuilt here from the head position,
// the input level and whether the tape is listening, read at every probe frame (about
// 480 a second, window.editorProbes.h), so it is a picture of the tape's loudness, not
// the tape itself.
//
// Contract with the editor (VST Template machinery/ui/editor.html, § the CRT's picture):
//   SeanceTable.mount(el, hooks)             draws into el (window.editorScreen)
//   SeanceTable.frame(probes, params, dt)    probes in kProbes order; params { id: value }
// Nothing is fetched.
const SeanceTable = (() => {
  const N = 360, TILT = 0.36, LAGNAME = ["¼", "½", "1"];
  const AMBER = [255, 179, 71], VIOLET = [176, 140, 255], PHOS = [124, 255, 178], ECTO = [214, 255, 236];
  const BLUE = [120, 170, 255], WOOD = [34, 22, 18], INK = [190, 205, 196];
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  let el = null, cv = null, g = null, W = 0, H = 0, dpr = 1, hooks = null;
  const amp = new Float32Array(N), age = new Float32Array(N).fill(99);
  let lastSlot = -1, time = 0, flick = 0;
  let now = { knob: 0, presence: 0, holding: 1, head: 0, lag: 0.5, level: 0, ghost: 0, bpm: 120 };
  const motes = [];      // ectoplasm: { a (angle), y (0 table .. 1 ghost ring), s (size), life }
  const stars = [];

  // ── the scene: table plane y = 0; a point (angle, radius, height) to the screen ──
  let cx = 0, cy = 0, R = 1;
  function P(a, r, y) {    // a: turns, 0 = beat one at the far side, clockwise as seen from above
    const th = a * 2 * Math.PI;
    return [cx + Math.sin(th) * r * R, cy - Math.cos(th) * r * R * TILT - y * R];
  }
  const depth = a => Math.cos(a * 2 * Math.PI);   // 1 = far side, -1 = near side

  function mount(target, hk) {
    el = target; hooks = hk || null;
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
    // lift your hand to raise the ghost
    let drag = null;
    cv.addEventListener("pointerdown", e => {
      if (!hooks) return;
      drag = { y: e.clientY, v: +hooks.get("gain") || 0 };
      cv.setPointerCapture(e.pointerId); hooks.begin("gain");
    });
    cv.addEventListener("pointermove", e => {
      if (!drag) return;
      const v = Math.max(0, Math.min(1, drag.v + (drag.y - e.clientY) / Math.max(120, H * 0.8)));
      hooks.set("gain", v);
    });
    const up = () => { if (drag) { drag = null; hooks.end("gain"); } };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  }

  // ── the tape as the picture knows it: ink laid at the head while the tape listens ──
  function ink(f) {
    const head = f[3], holding = f[2], level = f[5];
    const s = Math.min(N - 1, Math.max(0, Math.floor(head * N)));
    if (lastSlot < 0) lastSlot = s;
    let k = lastSlot, steps = 0;
    const span = (s - lastSlot + N) % N;
    if (span < N / 2) {
      while (k !== s && steps++ < N) {
        k = (k + 1) % N;
        if (holding < 0.5) { amp[k] = Math.min(1, Math.pow(level / 0.3, 1.4)); age[k] = 0; }
      }
    }
    lastSlot = s;
  }

  function frame(probes, params, dt) {
    dt = dt || 1 / 60; time += dt;
    params = params || {};
    const ev = window.editorProbes || {};
    const hist = ev.h && ev.h.length ? ev.h : [probes];
    for (const f of hist) if (f && f.length >= 7) ink(f);
    for (let i = 0; i < N; ++i) age[i] += dt;
    const p = probes || [];
    now = { knob: +p[0] || 0, presence: +p[1] || 0, holding: p[2] === undefined ? 1 : +p[2], head: +p[3] || 0,
            lag: +p[4] || 0.5, level: +p[5] || 0, ghost: +p[6] || 0, bpm: +params.bpm || 120, lagi: Math.round(params.lag || 0) };
    // ectoplasm rises from the read head, as thick as the ghost is loud
    const born = Math.min(6, now.ghost * 40 + now.knob * now.presence * 1.5);
    for (let i = 0; i < born; ++i) if (Math.random() < born / 6)
      motes.push({ a: now.head - now.lag + (Math.random() - 0.5) * 0.01, y: 0, s: 0.5 + Math.random(), life: 1, sw: Math.random() * 6.28 });
    for (const m of motes) { m.y += dt * (0.5 + now.knob * 0.7); m.a += dt * 0.05 * Math.sin(time * 1.3 + m.sw); m.life -= dt * 0.55; }
    while (motes.length && (motes[0].life <= 0 || motes[0].y > 1.15)) motes.shift();
    if (motes.length > 600) motes.splice(0, motes.length - 600);
    if (now.knob > 0.8 && Math.random() < (now.knob - 0.8) * 3)
      stars.push({ x: Math.random(), y: Math.random() * 0.55, life: 1 });
    for (const s of stars) s.life -= dt * 0.7;
    while (stars.length && stars[0].life <= 0) stars.shift();
    flick = 0.85 + 0.15 * Math.sin(time * 23) * Math.sin(time * 7.1);
    draw();
  }

  function ringPath(r, y) {
    g.beginPath();
    for (let i = 0; i <= 96; ++i) { const [x, yy] = P(i / 96, r, y); i ? g.lineTo(x, yy) : g.moveTo(x, yy); }
  }

  function bars(r, y, lift, alpha, ghostRing) {
    // back half first, then the front, so near columns cover far ones
    const order = [];
    for (let i = 0; i < N; ++i) order.push(i);
    order.sort((a, b) => depth(b / N) - depth(a / N));
    g.lineCap = "round";
    const readA = now.head - now.lag;
    for (const i of order) {
      const v = amp[i]; if (v < 0.01) continue;
      const a = (i + 0.5) / N;
      let c = mix(AMBER, VIOLET, Math.min(1, age[i] / (480 / now.bpm)));
      let al = alpha * (0.35 + 0.65 * v);
      if (ghostRing) {
        c = mix(VIOLET, ECTO, 0.5);
        const d = Math.abs(((a - readA) % 1 + 1.5) % 1 - 0.5);       // distance from the read head, in turns
        al *= 0.25 + 0.75 * Math.exp(-d * d / 0.0012);
      }
      const [x0, y0] = P(a, r, y), [x1, y1] = P(a, r, y + v * lift);
      g.strokeStyle = rgba(c, al);
      g.lineWidth = Math.max(1, R * 0.011 * (1.15 - 0.3 * depth(a)));
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
  }

  function cat(x, y, s, wake) {
    // a small Gorey cat in silhouette at the table's near edge; its eyes are the knob
    g.fillStyle = "#050405";
    g.beginPath(); g.ellipse(x, y, s * 0.55, s * 0.62, 0, Math.PI, 0); g.lineTo(x + s * 0.55, y); g.closePath(); g.fill();   // body
    g.beginPath(); g.arc(x, y - s * 0.72, s * 0.3, 0, Math.PI * 2); g.fill();                                                // head
    for (const sgn of [-1, 1]) {                                                                                             // ears
      g.beginPath(); g.moveTo(x + sgn * s * 0.26, y - s * 0.8); g.lineTo(x + sgn * s * 0.22, y - s * 1.1); g.lineTo(x + sgn * s * 0.06, y - s * 0.97); g.closePath(); g.fill();
    }
    g.strokeStyle = "#050405"; g.lineWidth = s * 0.08; g.lineCap = "round";                                                  // tail
    g.beginPath(); g.moveTo(x + s * 0.5, y - s * 0.05); g.quadraticCurveTo(x + s * 1.0, y - s * 0.1, x + s * 0.85, y - s * (0.55 + 0.35 * wake)); g.stroke();
    for (const sgn of [-1, 1]) {
      const ex = x + sgn * s * 0.12, ey = y - s * 0.74;
      if (wake < 0.04) { g.strokeStyle = rgba(INK, 0.35); g.lineWidth = 1; g.beginPath(); g.moveTo(ex - s * 0.06, ey); g.lineTo(ex + s * 0.06, ey); g.stroke(); continue; }
      g.fillStyle = rgba(mix(PHOS, ECTO, wake), 0.4 + 0.6 * wake);
      g.beginPath(); g.ellipse(ex, ey, s * 0.06, s * 0.065 * Math.min(1, wake * 2.5), 0, 0, Math.PI * 2); g.fill();
    }
    if (wake < 0.04) {   // asleep
      g.fillStyle = rgba(INK, 0.35); g.font = `italic ${Math.round(s * 0.28)}px Georgia, serif`;
      g.fillText("z", x + s * 0.35, y - s * 1.05 - Math.sin(time * 1.5) * s * 0.05);
      g.fillText("z", x + s * 0.5, y - s * 1.3 - Math.sin(time * 1.5 + 1) * s * 0.05);
    }
  }

  function draw() {
    if (!g || !W || !H) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const k = now.knob, hold = now.holding > 0.5;
    R = Math.min(W * 0.4, H * 0.7);
    cx = W / 2; cy = H * 0.64;
    // the room
    const bg = g.createRadialGradient(cx, cy, R * 0.1, cx, cy - R * 0.3, Math.max(W, H));
    bg.addColorStop(0, rgba(mix([14, 10, 20], [36, 20, 52], k), 1)); bg.addColorStop(1, "#020103");
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    for (const s of stars) {
      g.fillStyle = rgba(ECTO, s.life * 0.9);
      const sx = s.x * W, sy = s.y * H, r = 1 + 2 * s.life;
      g.fillRect(sx - r, sy - 0.5, 2 * r, 1); g.fillRect(sx - 0.5, sy - r, 1, 2 * r);
    }
    // the table top
    ringPath(1.08, 0); g.closePath();
    const tg = g.createRadialGradient(cx, cy, 0, cx, cy, R * 1.1);
    tg.addColorStop(0, rgba(mix(WOOD, [70, 44, 30], 0.6 * flick), 1)); tg.addColorStop(1, rgba(WOOD, 1));
    g.fillStyle = tg; g.fill();
    g.strokeStyle = rgba(INK, 0.25); g.lineWidth = 1; g.stroke();
    // the measure: the ring and its four beats
    ringPath(1.0, 0); g.strokeStyle = rgba(INK, 0.3); g.stroke();
    ringPath(0.92, 0); g.strokeStyle = rgba(INK, 0.12); g.stroke();
    g.font = `${Math.max(10, Math.round(R * 0.07))}px Georgia, serif`; g.textAlign = "center"; g.textBaseline = "middle";
    ["I", "II", "III", "IV"].forEach((t, i) => {
      const [x, y] = P(i / 4, 0.84, 0);
      g.fillStyle = rgba(INK, 0.25 + 0.2 * (Math.floor(now.head * 4) === i ? 1 : 0)); g.fillText(t, x, y);
    });
    // the lag: an arc on the table from the read head to the planchette
    g.strokeStyle = rgba(VIOLET, 0.2 + 0.4 * k); g.lineWidth = 2;
    g.beginPath();
    const a0 = now.head - now.lag, steps = 48;
    for (let i = 0; i <= steps; ++i) { const [x, y] = P(a0 + now.lag * i / steps, 0.72, 0); i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
    { const [x, y] = P(a0 + now.lag / 2, 0.62, 0); g.fillStyle = rgba(VIOLET, 0.35 + 0.4 * k); g.fillText(LAGNAME[now.lagi] || "", x, y); }
    // the tape, on the table
    bars(1.0, 0, 0.32, 1.0, false);
    // the ghost ring, lifted by the knob
    const gy = 0.05 + 0.5 * k;
    if (k > 0.005) {
      ringPath(0.6, gy); g.strokeStyle = rgba(ECTO, 0.15 * k); g.lineWidth = 1; g.stroke();
      bars(0.6, gy, 0.2, Math.min(1, k * 1.3), true);
    }
    // ectoplasm: from the read head on the table up to the same place on the ghost ring
    g.globalCompositeOperation = "lighter";
    for (const m of motes) {
      const t = Math.min(1, m.y), r = 1.0 + (0.6 - 1.0) * t;
      const [x, y] = P(m.a, r, t * gy + Math.sin(t * Math.PI) * 0.08);
      const rad = R * 0.02 * m.s * (0.6 + t);
      const grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, rgba(ECTO, 0.35 * m.life * (0.3 + k))); grd.addColorStop(1, rgba(VIOLET, 0));
      g.fillStyle = grd; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
    }
    // the read head's glow on the table
    { const [x, y] = P(a0, 1.0, 0), rad = R * (0.04 + 0.12 * now.ghost * 4 + 0.03 * k);
      const grd = g.createRadialGradient(x, y, 0, x, y, rad);
      grd.addColorStop(0, rgba(ECTO, 0.2 + 0.6 * k)); grd.addColorStop(1, rgba(VIOLET, 0));
      g.fillStyle = grd; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill(); }
    g.globalCompositeOperation = "source-over";
    // the planchette and its candle: orange while the tape listens, blue and still while it holds
    { const [x, y] = P(now.head, 1.0, 0), s = R * 0.05;
      g.fillStyle = "#c9b79a"; g.strokeStyle = "#2a1d14"; g.lineWidth = 1;
      g.beginPath(); g.ellipse(x, y, s, s * TILT * 1.6, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = "#e9e2d0"; g.fillRect(x - s * 0.12, y - s * 0.9, s * 0.24, s * 0.9);
      const fl = hold ? 1 : flick, fc = hold ? BLUE : AMBER, fh = s * (hold ? 0.55 : 0.6 + 0.6 * Math.min(1, now.level * 6)) * fl;
      g.globalCompositeOperation = "lighter";
      const grd = g.createRadialGradient(x, y - s * 0.9 - fh * 0.4, 0, x, y - s * 0.9 - fh * 0.4, s * 2.2);
      grd.addColorStop(0, rgba(fc, 0.5)); grd.addColorStop(1, rgba(fc, 0));
      g.fillStyle = grd; g.beginPath(); g.arc(x, y - s * 0.9 - fh * 0.4, s * 2.2, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = "source-over";
      g.fillStyle = rgba(mix(fc, [255, 255, 240], 0.45), 0.95);
      g.beginPath(); g.ellipse(x, y - s * 0.9 - fh * 0.5, s * 0.14, fh * 0.5, 0, 0, Math.PI * 2); g.fill(); }
    // the cat at the near edge, its eyes the knob
    cat(cx - R * 0.78, cy + R * TILT * 1.02, R * 0.16, k);
    // the words, small
    g.textAlign = "left"; g.textBaseline = "top";
    g.font = `${Math.max(9, Math.round(H * 0.035))}px ui-monospace, Menlo, monospace`;
    g.fillStyle = rgba(hold ? BLUE : AMBER, 0.75);
    const ix = Math.max(10, W * 0.04), iy = Math.max(8, H * 0.05);
    g.fillText(hold ? "HOLDING · silence keeps" : "LISTENING", ix, iy);
    g.fillStyle = rgba(INK, 0.45);
    g.fillText(`${Math.round(now.bpm)} bpm · lag ${LAGNAME[now.lagi] || ""} · summon ${Math.round(k * 100)}%`, ix, iy + H * 0.05);
    g.textAlign = "right";
    g.fillText(k < 0.04 ? "dormant" : k < 0.8 ? "awakening" : "triumphant", W - ix, iy);
  }

  return { mount, frame };
})();
