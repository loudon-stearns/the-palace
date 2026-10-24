// visualizer.js — Blood Compressor's picture for the CRT: inside the artery.
//
// You are inside the vessel, looking downstream. Every ring of the wall is one
// moment of the compressor: the newest is born at the glass and travels away into
// the dark, so a beat's pressure wave rolls off down the tube the way a pulse
// runs down an arm.
//
//   the wall        a ring's radius is the pressure that got past the vessel
//                   (detector level + the squeeze): wide is loud, narrow is held
//   the ghost       a pale wire ring where the wall would have been with no reflex
//                   (the detector level alone); the gap is the gain reduction
//   the sleeve      amber dashes at the systolic line (threshold). A ghost past
//                   the sleeve is overpressure, and that stretch of wall flushes hot
//   the muscle      where the vessel is squeezing, circular smooth-muscle bands
//                   tighten round the wall, darker the deeper the squeeze
//   the sensors     a crown of baroreceptors on the wall near you; they flare while
//                   the reflex asks for reduction and fire nerve sparks down the wall
//   the blood       biconcave cells, carried downstream at a speed set by the flow
//                   that got through; they crowd inward when the vessel narrows
//   the inset       the in-to-out curve, with the moment's dot on it
//
// The body (cycle 11), read from the parameters and the breath probe:
//   sympathetic     a stressed body: the plasma runs hotter and the muscle stripes
//                   stay drawn tight even between beats
//   vessel age      the wall goes lumpy and yellow plaque gathers on it
//   heart-rate var  the whole tube swells and narrows with the breath (probe 5)
//
// Contract with the editor (the CRT move on VST Template):
//   BloodVessel.mount(el)                 draws into el (window.editorScreen); sizes itself
//   BloodVessel.frame(probes, params[, dt])  probes: Algorithm.h kProbes order
//                                         [pressure, target, squeeze, reflex, breath];
//                                         params: { id: value } for the parameter table
// Nothing else is read; nothing is fetched. Canvas 2D, so the board's sandbox runs it.
const BloodVessel = (() => {
  const N = 64, SEG = 40, DZ = 0.16, Z0 = 0.42, RATE = 60;   // rings, segments per ring, ring spacing, nearest depth, rings per second
  const hist = [];                 // newest first: { p, sq, rf, th, out }
  let cv, cx, el, W = 0, H = 0, dpr = 1, f = 1;
  let acc = 0, simT = 0, last = performance.now(), born = 0;   // born: rings made so far, so each ring keeps its own shape as it travels
  let lastProbes = [-120, 0, 0, 0, 0], lastParams = {};
  const cells = [], sparks = [];
  let seed = 1234567;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const wob = new Float32Array(SEG * 7);   // fixed organic unevenness of the wall
  for (let i = 0; i < wob.length; i++) wob[i] = rnd() * 2 - 1;
  for (let i = 0; i < 170; i++) cells.push({ th: rnd() * 6.283, rho: Math.sqrt(rnd()) * 0.82, z: Z0 + rnd() * N * DZ, spin: rnd() * 6.283, ds: (rnd() - 0.5) * 2, sz: 0.85 + rnd() * 0.3 });

  const lvl = db => Math.max(0, Math.min(1.08, (db + 60) / 60));
  const rad = db => 0.42 + 0.78 * lvl(db);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  function mount(target) {
    el = target;
    cv = document.createElement("canvas");
    cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.append(cv);
    cx = cv.getContext("2d");
    const size = () => {
      dpr = window.devicePixelRatio || 1;
      W = el.clientWidth; H = el.clientHeight;
      cv.width = Math.max(1, Math.round(W * dpr)); cv.height = Math.max(1, Math.round(H * dpr));
      f = Math.min(W, H) * 0.62;
    };
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(size).observe(el);
    size();
    for (let i = 0; i < N + 2; i++) hist.push({ p: -60, sq: 0, rf: 0, th: -20, out: -60, br: 0, sy: 0, ag: 0 });
  }

  // the tube bends: its centre drifts sideways with depth, zero at the glass
  function centre(z) {
    const a = simT * 0.21, b = simT * 0.17;
    return [0.55 * (Math.sin(0.19 * z + a) - Math.sin(a)) * Math.min(1, z / 3),
            0.38 * (Math.cos(0.23 * z + b) - Math.cos(b)) * Math.min(1, z / 3) - 0.04 * z];
  }
  let camX = 0, camY = 0, jolt = 0;
  function proj(x, y, z) { return [W / 2 + (x - camX) * f / z, H / 2 + (y - camY) * f / z]; }

  function frame(probes, params, dtIn) {
    const now = performance.now();
    const dt = dtIn != null ? dtIn : Math.min(0.1, (now - last) / 1000);
    last = now; simT += dt;
    lastProbes = probes; lastParams = params || {};
    const [p, target, sq, rf] = probes, br = probes[4] || 0;
    const sy = lastParams.sympathetic || 0, ag = lastParams.age || 0;
    // the sleeve sits where the wall really answers: stress lowers it, the breath moves it
    const th = (lastParams.threshold != null ? lastParams.threshold : -20) - 12 * sy + 3 * br;
    acc += dt * RATE;
    while (acc >= 1) {
      acc -= 1;
      if (rf > 0.5 && hist[0].rf < 0.5) for (let k = 0; k < 10; k++) sparks.push({ a: k / 10 * 6.283 + rnd() * 0.3, z: Z0 + 5 * DZ, life: 1 });
      hist.unshift({ p, sq, rf, th, out: p + sq, tg: target, br, sy, ag }); born++;
      if (hist.length > N + 2) hist.pop();
    }
    jolt = jolt * Math.exp(-dt * 6) + Math.max(0, lvl(p) - lvl(hist[3] ? hist[3].p : p)) * 0.6;
    camX = 0.05 * Math.sin(simT * 0.7) + jolt * 0.05 * Math.sin(simT * 31);
    camY = 0.04 * Math.cos(simT * 0.53) + jolt * 0.06;
    draw(dt);
  }

  function ringPts(k, r, z, wobAmt) {
    const [ox, oy] = centre(z), pts = new Array(SEG);
    const w0 = (((born - k) * 3) % (wob.length - SEG) + (wob.length - SEG)) % (wob.length - SEG);
    for (let j = 0; j < SEG; j++) {
      const a = j / SEG * 6.2832, rr = r * (1 + wobAmt * wob[w0 + j]);
      pts[j] = proj(ox + rr * Math.cos(a), oy + rr * Math.sin(a) * 0.92, z);
    }
    return pts;
  }

  function draw(dt) {
    if (!cx || !W) return;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // the deep: a dark plasma, faintly lit by the pressure arriving
    const pNow = hist[0].p, g0 = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
    const syNow = hist[0].sy || 0;
    g0.addColorStop(0, `rgb(${30 + 40 * lvl(pNow) + 45 * syNow | 0},${4 + 6 * syNow | 0},10)`); g0.addColorStop(1, "#050002");
    cx.fillStyle = g0; cx.fillRect(0, 0, W, H);

    const frac = acc;   // 0..1: how far the newest ring has drifted from the glass
    const zOf = k => Z0 + (k + frac) * DZ;
    // rings back to front; cells and sparks binned into their bands
    const bins = Array.from({ length: N }, () => []);
    for (const c of cells) {
      c.z += dt * (0.5 + 5.5 * Math.pow(10, Math.min(0, hist[0].out) / 20)) * 0.6;
      c.spin += dt * c.ds; c.th += dt * 0.05 * c.ds;
      if (c.z > Z0 + (N - 1) * DZ) { c.z = Z0 + rnd() * DZ * 2; c.rho = Math.sqrt(rnd()) * 0.82; c.th = rnd() * 6.283; }
      const k = Math.floor((c.z - Z0) / DZ - frac);
      if (k >= 0 && k < N - 1) bins[k].push(c);
    }
    for (const s of sparks) { s.z += dt * 2.2; s.life -= dt * 0.55; }
    for (let i = sparks.length - 1; i >= 0; i--) if (sparks[i].life <= 0) sparks.splice(i, 1);

    let nearPts = null;
    let ptsB = null;
    for (let k = N - 2; k >= 0; k--) {
      const A = hist[k], B = hist[k + 1];
      const zA = zOf(k), zB = zOf(k + 1);
      const fog = Math.pow(1 - k / N, 1.6);
      const rA = rad(A.out) * (1 + 0.05 * A.br), rB = rad(B.out) * (1 + 0.05 * B.br);   // the breath swells the tube
      const ag = A.ag || 0, sy = A.sy || 0;
      const pa = ringPts(k, rA, zA, 0.035 + 0.07 * ag), pb = ptsB || ringPts(k + 1, rB, zB, 0.035 + 0.07 * (B.ag || 0));
      const w0 = (((born - k) * 3) % (wob.length - SEG) + (wob.length - SEG)) % (wob.length - SEG);
      const over = clamp((A.p - A.th) / 12, 0, 1);       // overpressure: ghost past the sleeve
      const tens = clamp(-A.sq / 18, 0, 1);              // how hard the muscle is squeezing
      const band = (k % 2 === 0) ? 1 : 0.82 - 0.3 * tens - 0.3 * sy; // smooth-muscle rings tighten into stripes; stress keeps them drawn
      for (let j = 0; j < SEG; j++) {
        const j2 = (j + 1) % SEG, a = (j + 0.5) / SEG * 6.2832;
        const light = 0.55 + 0.45 * Math.max(0, -Math.sin(a) * 0.8 + Math.cos(a + 0.6) * 0.3);   // lit from above
        const L = fog * light * band * (0.55 + 0.6 * lvl(A.out));   // a beat is a bright band rolling away
        const r = (150 + 85 * over) * L + 10, gg = (18 + 34 * over * over) * L, bb = (34 + 26 * over + 10 * (1 - tens)) * L;   // overpressure flushes hot pink
        // plaque: where the wall bulges most, an old vessel gathers yellow
        const pl = ag > 0 ? clamp((wob[w0 + j] - (1 - 1.3 * ag)) * 3, 0, 1) * ag : 0;
        const R2 = r + (200 * L + 20 - r) * pl, G2 = gg + (165 * L + 10 - gg) * pl, B2 = bb + (80 * L - bb) * pl;
        cx.fillStyle = `rgb(${R2 | 0},${G2 | 0},${B2 | 0})`;
        cx.beginPath(); cx.moveTo(pa[j][0], pa[j][1]); cx.lineTo(pa[j2][0], pa[j2][1]); cx.lineTo(pb[j2][0], pb[j2][1]); cx.lineTo(pb[j][0], pb[j][1]); cx.closePath(); cx.fill();
      }
      // capillary threads along the wall, every fourth segment
      if (k % 2 === 0) {
        cx.strokeStyle = `rgba(255,120,140,${0.10 * fog})`; cx.lineWidth = 1;
        cx.beginPath(); for (let j = 0; j < SEG; j += 4) { cx.moveTo(pa[j][0], pa[j][1]); cx.lineTo(pb[j][0], pb[j][1]); } cx.stroke();
      }
      // the muscle band: a dark tight line round the ring, as deep as the squeeze
      if (tens > 0.02 && k % 2 === 0) {
        cx.strokeStyle = `rgba(20,0,6,${0.55 * tens * fog + 0.1})`; cx.lineWidth = Math.max(1, 3 * tens * f / zA / 60);
        cx.beginPath(); pa.forEach((q, j) => j ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1])); cx.closePath(); cx.stroke();
      }
      // the ghost: where the wall would be with no reflex
      if (k % 2 === 0 && A.p - A.out > 0.3) {
        const g = ringPts(k, rad(A.p), zA, 0);
        cx.strokeStyle = `rgba(235,225,255,${0.38 * fog})`; cx.lineWidth = 1; cx.setLineDash([]);
        cx.beginPath(); g.forEach((q, j) => j ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1])); cx.closePath(); cx.stroke();
      }
      // the sleeve: the systolic line, amber dashes every fourth ring
      if (k % 4 === 0) {
        const s = ringPts(k, rad(A.th), zA, 0);
        cx.strokeStyle = `rgba(255,184,74,${(0.28 + 0.6 * over) * fog})`; cx.lineWidth = over > 0 ? 1.6 : 1;
        cx.setLineDash([4, 5]);
        cx.beginPath(); s.forEach((q, j) => j ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1])); cx.closePath(); cx.stroke();
        cx.setLineDash([]);
      }
      // blood in this band
      for (const c of bins[k]) drawCell(c, rA, fog);
      // nerve sparks travelling down the wall
      for (const s of sparks) {
        if (s.z < zA || s.z >= zB) continue;
        const [ox, oy] = centre(s.z), rr = rA * 0.98, q = proj(ox + rr * Math.cos(s.a), oy + rr * Math.sin(s.a) * 0.92, s.z);
        cx.fillStyle = `rgba(255,214,120,${s.life * fog})`;
        cx.beginPath(); cx.arc(q[0], q[1], Math.max(1, 5 * f / s.z / 200), 0, 6.283); cx.fill();
      }
      ptsB = pa;
      if (k === 5) nearPts = { pa, zA, rA };
    }
    // the baroreceptors: a crown of sensors on the wall near the glass
    if (nearPts) {
      const on = lastProbes[3] > 0.5, [ox, oy] = centre(nearPts.zA);
      for (let i = 0; i < 10; i++) {
        const a = i / 10 * 6.2832 + 0.15, rr = nearPts.rA * 0.97;
        const q = proj(ox + rr * Math.cos(a), oy + rr * Math.sin(a) * 0.92, nearPts.zA);
        const s = Math.max(2, 0.05 * f / nearPts.zA);
        if (on) { const gl = cx.createRadialGradient(q[0], q[1], 0, q[0], q[1], s * 3.2); gl.addColorStop(0, "rgba(255,200,90,.75)"); gl.addColorStop(1, "rgba(255,160,40,0)"); cx.fillStyle = gl; cx.beginPath(); cx.arc(q[0], q[1], s * 3.2, 0, 6.283); cx.fill(); }
        cx.fillStyle = on ? "#ffd27a" : "#5a1b28"; cx.strokeStyle = on ? "#fff1cf" : "#8a3446"; cx.lineWidth = 1;
        cx.beginPath(); cx.arc(q[0], q[1], s, 0, 6.283); cx.fill(); cx.stroke();
      }
    }
    hud();
  }

  function drawCell(c, rWall, fog) {
    const [ox, oy] = centre(c.z), rr = c.rho * rWall;
    const q = proj(ox + rr * Math.cos(c.th), oy + rr * Math.sin(c.th) * 0.92, c.z);
    if (c.z < Z0 + 3 * DZ) return;                  // too close to the glass: let it pass out of view
    const s = Math.min(c.sz * 0.07 * f / c.z, f * 0.06);
    if (s < 0.6) return;
    const tilt = Math.abs(Math.cos(c.spin));
    cx.save(); cx.translate(q[0], q[1]); cx.rotate(c.spin * 0.5);
    cx.fillStyle = `rgba(${200 * fog + 30 | 0},${20 * fog | 0},${34 * fog | 0},0.95)`;
    cx.beginPath(); cx.ellipse(0, 0, s, s * (0.3 + 0.7 * tilt), 0, 0, 6.283); cx.fill();
    if (tilt > 0.35) {   // the biconcave dimple
      cx.fillStyle = `rgba(${90 * fog | 0},0,${12 * fog | 0},0.75)`;
      cx.beginPath(); cx.ellipse(0, 0, s * 0.45, s * 0.45 * (0.3 + 0.7 * tilt), 0, 0, 6.283); cx.fill();
    }
    cx.restore();
  }

  function hud() {
    const [p, , sq, rf] = lastProbes, P = lastParams;
    // the curve the wall is really following: the body moves the line and stiffens the wall
    const th0 = P.threshold != null ? P.threshold : -20;
    const th = th0 - 12 * (P.sympathetic || 0) + 3 * (lastProbes[4] || 0);
    const R = (P.ratio || 4) * (1 + (P.age || 0)), K = (P.knee != null ? P.knee : 6) * (1 - 0.8 * (P.age || 0));
    cx.font = "10px 'JetBrains Mono', ui-monospace, monospace"; cx.textBaseline = "top";
    const line = (t, x, y, c) => { cx.fillStyle = c; cx.fillText(t, x, y); };
    const x0 = 14, y0 = H - 46;
    cx.fillStyle = "rgba(8,0,3,.55)"; cx.fillRect(x0 - 6, y0 - 19, 210, 59);
    const sy = P.sympathetic || 0, ag = P.age || 0, hv = P.hrv || 0, br = lastProbes[4] || 0;
    if (sy || ag || hv) line(`BODY stress ${sy.toFixed(2)} · age ${ag.toFixed(2)} · breath ${br >= 0 ? "+" : ""}${br.toFixed(2)}`, x0, y0 - 13, "rgba(255,220,170,.75)");
    line(`SYSTOLIC ${th.toFixed(1)} dB`, x0, y0, "rgba(255,184,74,.9)");
    line(`PRESSURE ${Math.max(-99, p).toFixed(1)} dB`, x0, y0 + 13, "rgba(235,225,255,.75)");
    line(`SQUEEZE  ${sq.toFixed(1)} dB`, x0, y0 + 26, "rgba(255,120,140,.9)");
    line(rf > 0.5 ? "● REFLEX" : "○ reflex", x0 + 132, y0, rf > 0.5 ? "#ffd27a" : "rgba(255,210,122,.4)");
    // the in-to-out curve, small, bottom right
    const S = Math.min(86, H * 0.22), bx = W - S - 14, by = H - S - 14;
    cx.fillStyle = "rgba(8,0,3,.55)"; cx.fillRect(bx, by, S, S);
    cx.strokeStyle = "rgba(255,255,255,.12)"; cx.lineWidth = 1; cx.strokeRect(bx + 0.5, by + 0.5, S, S);
    const X = d => bx + (d + 60) / 60 * S, Y = d => by + S - (d + 60) / 60 * S;
    cx.strokeStyle = "rgba(255,184,74,.5)"; cx.setLineDash([2, 3]); cx.beginPath(); cx.moveTo(X(th), by); cx.lineTo(X(th), by + S); cx.stroke(); cx.setLineDash([]);
    cx.strokeStyle = "#ff5a78"; cx.lineWidth = 1.4; cx.beginPath();
    for (let d = -60; d <= 0; d += 1) { const o = curveDb(d, th, R, K); d === -60 ? cx.moveTo(X(d), Y(o)) : cx.lineTo(X(d), Y(o)); }
    cx.stroke();
    const pd = clamp(p, -60, 0);
    cx.fillStyle = "#fff"; cx.beginPath(); cx.arc(X(pd), Y(clamp(pd + sq, -60, 0)), 2.6, 0, 6.283); cx.fill();
    line("in → out", bx + 4, by + 4, "rgba(255,255,255,.4)");
  }
  function curveDb(x, T, R, K) {
    const lo = T - K / 2, hi = T + K / 2;
    if (K <= 0 || x <= lo) return x > T ? T + (x - T) / R : x;
    if (x >= hi) return T + (x - T) / R;
    const s = (x - lo) / K, y0 = lo, y1 = T + (K / 2) / R, m0 = K, m1 = K / R, s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * y0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * y1 + (s3 - s2) * m1;
  }

  return { mount, frame };
})();
if (typeof module !== "undefined") module.exports = BloodVessel;
