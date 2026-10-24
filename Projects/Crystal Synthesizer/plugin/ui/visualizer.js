// visualizer.js — Crystal Synthesizer's picture for the CRT: light through fog.
//
// The entry asked for this in February: "3D accurate slowly rotating wireframe
// diagram with the chemical letters below. Light through fog shining through the
// wireframe and being dispersed and modulated by the rotating crystals." So:
//
//  - The unit cell of the chosen mineral turns slowly in a fogged room, drawn to
//    its real axis ratios and angles (diamond's cube with its four inner atoms,
//    ruby's tall hexagonal cell, labradorite's skewed triclinic box).
//  - A white beam comes in from the left, along the direction you are looking
//    through the crystal. The dashed line through the cell is its optic axis; the
//    Axis angle knob tilts it against the beam. Turning the crystal about the beam
//    changes nothing, as in optics, so the cell spins about the beam.
//  - What leaves on the right is the sound. Each phonon mode is one coloured ray,
//    lit by that mode's energy (probes m0..m8), and the rays fan by the mineral's
//    dispersion times Fire: red the fundamental, violet the highest mode. Fire
//    delays the higher modes, so a strike lights the fan red first, violet last.
//  - Birefringence doubles everything. The extraordinary rays leave beside the
//    ordinary ones and a ghost of the cell stands beside the cell, offset by the
//    split; along the optic axis, or in a cubic mineral, the ghost folds back in.
//  - Every strike rings the lattice: atoms shiver in the patterns of the modes
//    that are sounding, and a ring of light leaves the cell.
//  - Below, the chemistry in letters, and the numbers the sound is made from.
//
// Contract with the editor (the CRT move on VST Template):
//   CrystalScope.mount(el)                    draws into el (window.editorScreen)
//   CrystalScope.frame(probes, params[, dt])  probes: Algorithm.h kProbes order;
//                                             params: { id: value } by parameter id
// Nothing else is read; nothing is fetched.
const CrystalScope = (() => {
  const V = 8, K = 9;
  const RATIOS = [
    [1.00, 1.32, 1.48, 1.57, 1.65], [1.00, 1.00, 1.35, 1.47, 1.69, 2.48], [1.00, 1.28, 1.41, 1.70, 1.85, 2.00],
    [1.00, 1.23, 1.47, 1.68, 2.13, 2.30, 3.33], [1.00, 1.10, 1.14, 1.19, 1.52, 1.70, 1.98],
    [1.00, 1.62, 2.07, 2.77, 3.13, 3.63, 5.45, 6.21, 8.32], [1.00, 1.45, 1.91, 2.37, 2.96, 3.68, 4.80, 6.05],
    [1.00, 1.37, 1.71, 1.94, 2.23, 2.61], [1.00, 1.83, 3.17, 4.67, 7.00, 9.50, 13.3, 17.5],
  ];
  const QS = [807, 27, 100, 57, 120, 62, 58, 100, 30];
  const DN = [0.0, 0.0, 0.059, 0.006, 0.008, 0.009, 0.010, 0.006, 0.009];
  const DISP = [0.044, 0.007, 0.039, 0.014, 0.018, 0.013, 0.014, 0.012, 0.012];
  // name, formula, system · group, cell (a b c α β γ, Å and degrees), shape, gem colour, atoms
  const MIN = [
    { name: "Diamond", f: "C", sys: "cubic · Fd3̄m", cell: [3.567, 3.567, 3.567, 90, 90, 90], shape: "box", col: [205, 225, 255], basis: "diamond", n: 2.417 },
    { name: "Fluorite", f: "CaF₂", sys: "cubic · Fm3̄m", cell: [5.463, 5.463, 5.463, 90, 90, 90], shape: "box", col: [170, 120, 255], basis: "fluorite", n: 1.434 },
    { name: "Tetragonal", f: "ZrSiO₄", sys: "tetragonal · I4₁/amd · zircon's optics · hypothesis", cell: [6.607, 6.607, 5.982, 90, 90, 90], shape: "box", col: [255, 190, 110], basis: "body", n: 1.93 },
    { name: "Emerald", f: "Be₃Al₂Si₆O₁₈", sys: "hexagonal · P6/mcc", cell: [9.21, 9.21, 9.19, 90, 90, 120], shape: "hex", col: [80, 230, 150], basis: "ring", n: 1.57 },
    { name: "Ruby", f: "Al₂O₃ : Cr³⁺", sys: "trigonal · R3̄c", cell: [4.759, 4.759, 12.99, 90, 90, 120], shape: "hex", col: [255, 70, 95], basis: "layers", n: 1.76 },
    { name: "Amethyst", f: "SiO₂ : Fe³⁺", sys: "trigonal · P3₁21", cell: [4.913, 4.913, 5.405, 90, 90, 120], shape: "hex", col: [190, 110, 255], basis: "screw", n: 1.544 },
    { name: "Topaz", f: "Al₂SiO₄(F,OH)₂", sys: "orthorhombic · Pbnm", cell: [4.65, 8.80, 8.39, 90, 90, 90], shape: "box", col: [255, 170, 80], basis: "faces", n: 1.62 },
    { name: "Monoclinic", f: "KAlSi₃O₈", sys: "monoclinic · C2/m · orthoclase's optics · hypothesis", cell: [8.56, 12.96, 7.21, 90, 116.0, 90], shape: "box", col: [255, 215, 185], basis: "ccentred", n: 1.52 },
    { name: "Labradorite", f: "(Ca,Na)(Al,Si)₄O₈", sys: "triclinic · C1̄", cell: [8.17, 12.86, 7.11, 93.5, 116.1, 90.2], shape: "box", col: [140, 160, 170], basis: "none", n: 1.56 },
  ];
  const NOTE = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

  let el = null, cv = null, cx = null, W = 0, H = 0, dpr = 1;
  let t = 0, spin = 0, twist = 0, last = performance.now();
  let built = -1, cell = null;
  const motes = [];
  const rings = [];
  const lastAge = new Float64Array(V).fill(1e9);
  let rng = 24681357;
  const rnd = () => { rng = (rng * 1664525 + 1013904223) >>> 0; return rng / 4294967296; };

  // ── geometry ───────────────────────────────────────────────────────────────
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

  function build(c) {
    const m = MIN[c], [a, b, cc, al, be, ga] = m.cell, d = Math.PI / 180;
    let verts = [], edges = [], faces = [], atoms = [];
    if (m.shape === "hex") {
      // hexagonal prism: six-sided, c up its middle (the optic axis)
      for (let z = 0; z < 2; z++) for (let k = 0; k < 6; k++) {
        const th = k * Math.PI / 3;
        verts.push([a * Math.cos(th), a * Math.sin(th), (z - 0.5) * cc]);
      }
      for (let k = 0; k < 6; k++) {
        edges.push([k, (k + 1) % 6], [6 + k, 6 + (k + 1) % 6], [k, 6 + k]);
        faces.push([k, (k + 1) % 6, 6 + (k + 1) % 6, 6 + k]);
      }
      faces.push([0, 1, 2, 3, 4, 5], [11, 10, 9, 8, 7, 6]);
      verts.forEach(p => atoms.push({ p, s: 1, kind: 0 }));
      atoms.push({ p: [0, 0, -0.5 * cc], s: 1, kind: 0 }, { p: [0, 0, 0.5 * cc], s: 1, kind: 0 });
      const lay = m.basis === "layers" ? 6 : m.basis === "screw" ? 9 : 4;
      for (let i = 0; i < lay; i++) {
        const u = (i + 0.5) / lay, th = (m.basis === "screw" ? i * 2 * Math.PI / 3 : i * Math.PI / 3) + 0.4;
        const r = m.basis === "ring" ? 0.55 * a : 0.42 * a;
        atoms.push({ p: [r * Math.cos(th), r * Math.sin(th), (u - 0.5) * cc], s: 0.75, kind: 1 });
      }
    } else {
      // the parallelepiped from a, b, c and the three angles, c the optic axis
      const A = [a, 0, 0], B = [b * Math.cos(ga * d), b * Math.sin(ga * d), 0];
      const cx_ = Math.cos(be * d), cy_ = (Math.cos(al * d) - Math.cos(be * d) * Math.cos(ga * d)) / Math.sin(ga * d);
      const C = [cc * cx_, cc * cy_, cc * Math.sqrt(Math.max(0, 1 - cx_ * cx_ - cy_ * cy_))];
      const at = (u, v, w) => add(add(mul(A, u), mul(B, v)), mul(C, w));
      for (let i = 0; i < 8; i++) verts.push(at(i & 1, (i >> 1) & 1, (i >> 2) & 1));
      edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
      faces = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]];
      verts.forEach(p => atoms.push({ p, s: 1, kind: 0 }));
      const put = (u, v, w, s, kind) => atoms.push({ p: at(u, v, w), s, kind });
      const fcc = () => [[.5, .5, 0], [.5, .5, 1], [.5, 0, .5], [.5, 1, .5], [0, .5, .5], [1, .5, .5]].forEach(q => put(...q, 1, 0));
      if (m.basis === "diamond") { fcc(); [[.25, .25, .25], [.75, .75, .25], [.75, .25, .75], [.25, .75, .75]].forEach(q => put(...q, 0.9, 1)); }
      if (m.basis === "fluorite") { fcc(); for (let i = 0; i < 8; i++) put(i & 1 ? .75 : .25, i & 2 ? .75 : .25, i & 4 ? .75 : .25, 0.6, 1); }
      if (m.basis === "body") { put(.5, .5, .5, 1.1, 1); put(.5, 0, .25, .6, 2); put(0, .5, .75, .6, 2); put(1, .5, .75, .6, 2); put(.5, 1, .25, .6, 2); }
      if (m.basis === "faces") [[.5, .5, 0], [.5, .5, 1], [.25, .3, .5], [.75, .7, .5], [.2, .8, .25], [.8, .2, .75]].forEach((q, i) => put(...q, i < 2 ? 1 : .7, i < 2 ? 0 : 1));
      if (m.basis === "ccentred") { put(.5, .5, 0, 1, 0); put(.5, .5, 1, 1, 0); put(.3, .2, .35, .7, 1); put(.7, .8, .65, .7, 1); put(.2, .6, .7, .6, 2); }
    }
    // centre it, scale its largest reach to 1, and keep c (local z) as the optic axis
    const cen = mul(verts.reduce(add, [0, 0, 0]), 1 / verts.length);
    verts = verts.map(p => sub(p, cen));
    atoms.forEach(o => { o.p = sub(o.p, cen); });
    const reach = Math.max(...verts.map(p => Math.hypot(p[0], p[1], p[2])));
    verts = verts.map(p => mul(p, 1 / reach));
    atoms.forEach((o, i) => { o.p = mul(o.p, 1 / reach); o.ph = i * 2.399; o.ax = i % 3; });
    const zs = verts.map(p => p[2]);
    cell = { verts, edges, faces, atoms, axis: [Math.min(...zs) * 1.6, Math.max(...zs) * 1.6] };
    built = c;
  }

  // local crystal frame → world. World: x along the beam, y up, z toward you.
  function orient(p, theta) {
    // the cell turns slowly about its own c axis, so its faces catch the light
    const ct = Math.cos(twist), st = Math.sin(twist);
    let x = p[0] * ct - p[1] * st, y = p[0] * st + p[1] * ct, z = p[2];
    // c (local z) onto the beam (world x); local x → world y, local y → world z
    let X = z, Y = x, Z = y;
    // tilt the optic axis off the beam by the axis angle (in the x-y plane)
    const c1 = Math.cos(theta), s1 = Math.sin(theta);
    const X2 = X * c1 - Y * s1, Y2 = X * s1 + Y * c1;
    // spin the whole about the beam: in optics this changes nothing, and here neither
    const c2 = Math.cos(spin), s2 = Math.sin(spin);
    return [X2, Y2 * c2 - Z * s2, Y2 * s2 + Z * c2];
  }

  // camera: three-quarter view, a little above
  const YAW = -0.5, PITCH = 0.2, DIST = 4.6;
  function project(p) {
    const cy = Math.cos(YAW), sy = Math.sin(YAW);
    const x = p[0] * cy + p[2] * sy, z0 = -p[0] * sy + p[2] * cy;
    const cp = Math.cos(PITCH), sp = Math.sin(PITCH);
    const y = p[1] * cp - z0 * sp, z = p[1] * sp + z0 * cp;
    const s = Math.min(W, H * 1.45) * 0.62 / (DIST - z);
    return [W * 0.46 + x * s, H * 0.43 - y * s, s, z];
  }

  // ── colour ─────────────────────────────────────────────────────────────────
  function spectral(u) {          // 0 red → 1 violet
    const h = 0 + 275 * u;
    const f = n => { const k = (n + h / 60) % 6; return 1 - Math.max(0, Math.min(k, 4 - k, 1)); };
    return [255 * f(5), 255 * f(3), 255 * f(1)];
  }
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.max(0, Math.min(1, a)).toFixed(3)})`;

  // ── mount ──────────────────────────────────────────────────────────────────
  function mount(target) {
    el = target;
    cv = document.createElement("canvas");
    cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(cv);
    cx = cv.getContext("2d");
    const fit = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, el.clientWidth); H = Math.max(1, el.clientHeight);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    };
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(el);
    addEventListener("resize", fit);
    for (let i = 0; i < 420; i++) motes.push({ p: [rnd() * 6 - 3, rnd() * 3 - 1.5, rnd() * 3 - 1.5], v: [(rnd() - 0.5) * 0.02, (rnd() - 0.4) * 0.015, (rnd() - 0.5) * 0.02], s: 0.4 + rnd() * 1.2 });
  }

  // distance from point p to segment a→b (3D)
  function segDist(p, a, b) {
    const ab = sub(b, a), ap = sub(p, a);
    const u = Math.max(0, Math.min(1, dot(ap, ab) / (dot(ab, ab) || 1)));
    return Math.hypot(...sub(ap, mul(ab, u)));
  }

  // ── one frame ──────────────────────────────────────────────────────────────
  function frame(probes, params, dtIn) {
    if (!cx) return;
    const now = performance.now();
    const dt = dtIn != null ? dtIn : Math.min(0.1, (now - last) / 1000); last = now;
    t += dt; spin += dt * 0.11; twist += dt * 0.07;
    const c = Math.min(8, Math.max(0, Math.round(params.crystal != null ? params.crystal : 4)));
    if (c !== built) build(c);
    const m = MIN[c], ratios = RATIOS[c];
    const theta = (params.angle != null ? params.angle : 90) * Math.PI / 180;
    const fire = params.fire != null ? params.fire : 40;
    const split = probes[0] || 0;
    const modeE = Array.from({ length: K }, (_, k) => probes[1 + 3 * V + k] || 0);
    let total = 0;
    const voices = [];
    for (let i = 0; i < V; i++) {
      const hz = probes[1 + 3 * i], amp = probes[2 + 3 * i], age = probes[3 + 3 * i];
      if (hz > 0) { voices.push({ hz, amp, age }); total += amp; }
      if (hz > 0 && age < lastAge[i] - 1e-6) rings.push({ r: 0, a: Math.min(1, 0.3 + 2.5 * amp), hz });
      lastAge[i] = hz > 0 ? age : 1e9;
    }
    const glow = Math.min(1, Math.sqrt(total * 3));

    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.globalCompositeOperation = "source-over";
    const bg = cx.createRadialGradient(W * 0.46, H * 0.43, 0, W * 0.46, H * 0.43, Math.max(W, H) * 0.75);
    bg.addColorStop(0, `rgba(${14 + 18 * glow | 0},${16 + 14 * glow | 0},${26 + 20 * glow | 0},1)`);
    bg.addColorStop(1, "rgba(3,4,8,1)");
    cx.fillStyle = bg; cx.fillRect(0, 0, W, H);

    // where light goes: the beam in, and one ray per mode out, fanned by dispersion
    const ent = [-1.05, 0, 0], ext = [1.05, 0, 0];
    const lmax = Math.log2(ratios[ratios.length - 1]) || 1;
    const fan = (0.06 + 0.55 * Math.sqrt(fire / 400)) * (DISP[c] / 0.044);
    const dev = (m.n - 1) * 0.22;
    const sep = split > 0 ? 0.08 + 0.55 * Math.sqrt(split / 0.06) : 0;
    const ray = (k, e) => {
      const r = ratios[k], ang = -dev - fan * Math.log2(r) * 1.6;
      const dir = [Math.cos(ang), Math.sin(ang), 0];
      const off = e ? [0, sep * 0.35, -sep] : [0, 0, 0];
      const a = add(ext, mul(off, 0.25)), b = add(add(ext, mul(dir, 4.2)), off);
      return [a, b, ratios.length > 1 ? Math.log2(r) / lmax : 0];
    };
    const segs = [[[-6, 0, 0], ent, 0.25 + 0.75 * glow, [255, 250, 240]]];
    const emax = Math.max(1e-9, ...modeE);
    for (let k = 0; k < ratios.length; k++) {
      const lvl = Math.min(1, Math.sqrt(modeE[k] * 4)) ;
      for (let e = 0; e < (split > 0 ? 2 : 1); e++) {
        const [a, b, u] = ray(k, e);
        segs.push([a, b, lvl * (e ? 0.8 : 1), spectral(u), e]);
      }
    }

    // fog: motes drift and glow where a beam passes through them
    cx.globalCompositeOperation = "lighter";
    for (const mo of motes) {
      mo.p = add(mo.p, mul(mo.v, dt * 6));
      for (let a = 0; a < 3; a++) { const lim = a === 0 ? 3 : 1.5; if (mo.p[a] > lim) mo.p[a] -= 2 * lim; if (mo.p[a] < -lim) mo.p[a] += 2 * lim; }
      let lit = 0.035, col = [150, 160, 200];
      for (const [a, b, lv, cc] of segs) {
        if (lv < 0.01) continue;
        const dd = segDist(mo.p, a, b), w = lv * Math.exp(-dd * dd / 0.02);
        if (w > lit) { lit = w; col = cc; }
      }
      const q = project(mo.p);
      if (q[3] > DIST - 0.3) continue;
      cx.fillStyle = rgba(col, lit * 0.8);
      cx.beginPath(); cx.arc(q[0], q[1], mo.s * q[2] * 0.012 + 0.4, 0, 6.283); cx.fill();
    }

    // the beams themselves, as soft glowing lines
    const line = (a, b, lv, col, wide, dash) => {
      const p = project(a), q = project(b);
      cx.setLineDash(dash ? [3, 5] : []);
      for (const [w, al] of [[wide * 7, 0.07], [wide * 2.6, 0.22], [wide, 0.85]]) {
        cx.strokeStyle = rgba(col, al * lv); cx.lineWidth = w;
        cx.beginPath(); cx.moveTo(p[0], p[1]); cx.lineTo(q[0], q[1]); cx.stroke();
      }
      cx.setLineDash([]);
    };
    for (const [a, b, lv, col, e] of segs) if (lv > 0.005) line(a, b, e === 1 ? lv * 0.7 : lv, col, e === 1 ? 1.0 : 1.6, false);

    // the cell: faces tinted by the gem, then its ghost (the extraordinary image), then the wire
    const moving = modeE.map(x => Math.min(1, Math.sqrt(x / emax) * Math.min(1, total * 6)));
    const shiver = (o) => {
      let d = [0, 0, 0];
      for (let k = 0; k < ratios.length; k++) {
        if (moving[k] < 0.01) continue;
        const w = 2 * Math.PI * (1.3 + 0.9 * ratios[k]) * t + o.ph * (k + 1);
        d[(o.ax + k) % 3] += 0.035 * moving[k] * Math.sin(w) * (k % 2 ? -1 : 1);
      }
      return add(o.p, d);
    };
    const draw = (shift, ghost) => {
      const W3 = cell.verts.map(p => add(orient(p, theta), shift));
      const P2 = W3.map(project);
      const view = [Math.sin(YAW), 0.2, Math.cos(YAW)];
      const order = cell.faces.map((f, i) => [f.reduce((s, j) => s + P2[j][3], 0) / f.length, i]).sort((x, y) => x[0] - y[0]);
      for (const [, i] of order) {
        const f = cell.faces[i];
        const nrm = norm(cross(sub(W3[f[1]], W3[f[0]]), sub(W3[f[2]], W3[f[0]])));
        const facing = Math.abs(dot(nrm, view));
        let col = m.col, al = (ghost ? 0.04 : 0.08) + 0.12 * glow * facing;
        if (c === 8) {   // labradorescence: a flash of blue-green-gold when a face turns just so
          const sheen = Math.pow(Math.max(0, Math.sin(facing * 9 + twist * 3)), 6);
          col = spectral(0.2 + 0.5 * facing); al += (ghost ? 0.12 : 0.32) * sheen;
        }
        cx.fillStyle = rgba(col, al);
        cx.beginPath(); f.forEach((j, n) => n ? cx.lineTo(P2[j][0], P2[j][1]) : cx.moveTo(P2[j][0], P2[j][1])); cx.closePath(); cx.fill();
      }
      for (const [i, j] of cell.edges) {
        const a = P2[i], b = P2[j], dz = (a[3] + b[3]) / 2;
        cx.strokeStyle = rgba(ghost ? [255, 255, 255] : m.col.map(x => x * 0.5 + 128), (ghost ? 0.22 : 0.6 + 0.35 * glow) * (0.65 + 0.35 * (dz + 1) / 2));
        cx.lineWidth = ghost ? 0.8 : 1.3;
        cx.setLineDash(ghost ? [2, 3] : []);
        cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke();
      }
      cx.setLineDash([]);
      if (ghost) return;
      const pts = cell.atoms.map(o => { const q = project(add(orient(shiver(o), theta), shift)); return [q, o]; }).sort((x, y) => x[0][3] - y[0][3]);
      for (const [q, o] of pts) {
        const r = Math.max(1.2, q[2] * 0.028 * o.s);
        const base = o.kind === 0 ? m.col : o.kind === 1 ? [235, 240, 255] : [255, 220, 150];
        const g = cx.createRadialGradient(q[0], q[1], 0, q[0], q[1], r * 3);
        g.addColorStop(0, rgba([255, 255, 255], 0.75 + 0.25 * glow));
        g.addColorStop(0.3, rgba(base, 0.55 + 0.4 * glow));
        g.addColorStop(1, rgba(base, 0));
        cx.fillStyle = g; cx.beginPath(); cx.arc(q[0], q[1], r * 3, 0, 6.283); cx.fill();
      }
    };
    cx.globalCompositeOperation = "lighter";
    if (split > 0) draw([0, sep * 0.18, -sep * 0.5], true);
    draw([0, 0, 0], false);

    // the optic axis, dashed, through the cell
    const ax0 = project(orient([0, 0, cell.axis[0]], theta)), ax1 = project(orient([0, 0, cell.axis[1]], theta));
    cx.setLineDash([5, 4]); cx.strokeStyle = "rgba(255,236,180,0.45)"; cx.lineWidth = 1;
    cx.beginPath(); cx.moveTo(ax0[0], ax0[1]); cx.lineTo(ax1[0], ax1[1]); cx.stroke(); cx.setLineDash([]);
    cx.fillStyle = "rgba(255,236,180,0.55)"; cx.font = "9px 'JetBrains Mono', ui-monospace, monospace";
    cx.fillText("optic axis", ax1[0] + 4, ax1[1] - 3);

    // a ring of light leaves the cell at every strike
    const o = project([0, 0, 0]);
    for (let i = rings.length - 1; i >= 0; i--) {
      const rg = rings[i]; rg.r += dt * 1.8; rg.a *= Math.exp(-dt * 2.6);
      if (rg.a < 0.02) { rings.splice(i, 1); continue; }
      cx.strokeStyle = rgba(m.col.map(x => x * 0.4 + 150), rg.a * 0.6); cx.lineWidth = 1.2;
      cx.beginPath(); cx.ellipse(o[0], o[1], rg.r * o[2] * 0.9, rg.r * o[2] * 0.42, -0.2, 0, 6.283); cx.stroke();
    }

    // below: the chemistry in letters, and the numbers the sound is made from
    cx.globalCompositeOperation = "source-over";
    const mono = "'JetBrains Mono', ui-monospace, monospace";
    const big = Math.max(16, Math.min(40, W * 0.055));
    cx.textAlign = "center";
    cx.fillStyle = rgba(m.col.map(x => x * 0.5 + 128), 0.92);
    cx.font = `300 ${big}px 'Inter', 'Helvetica Neue', sans-serif`;
    cx.fillText(m.f, W * 0.46, H * 0.84);
    cx.font = `${Math.max(9, big * 0.3)}px ${mono}`;
    cx.fillStyle = "rgba(200,208,235,0.72)";
    cx.fillText(`${m.name.toUpperCase()} · ${m.sys}`, W * 0.46, H * 0.84 + big * 0.62);
    const cents = split > 0 ? (1200 * Math.log2(1 + split)).toFixed(1) + " ¢ between the rays" : (DN[c] > 0 ? "one ray: on the axis" : "one ray: isotropic");
    const lf = (params.lifetime || 1) * QS[c];
    cx.fillStyle = "rgba(160,170,205,0.6)";
    cx.fillText(`Q ${Math.round(lf)} · Δn ${DN[c].toFixed(3)} · dispersion ${DISP[c].toFixed(3)} · ${cents}`, W * 0.46, H * 0.84 + big * 1.1);
    // the ringing notes, top right, brightest the loudest
    cx.textAlign = "right";
    voices.sort((a, b) => a.hz - b.hz).forEach((vo, i) => {
      const midi = Math.round(69 + 12 * Math.log2(vo.hz / 440));
      cx.fillStyle = rgba([230, 235, 255], 0.25 + 0.75 * Math.min(1, Math.sqrt(vo.amp * 8)));
      cx.fillText(NOTE[(midi % 12 + 12) % 12] + (Math.floor(midi / 12) - 1), W - 14, 22 + i * 13);
    });
    cx.textAlign = "left";
    // the spectrum's key on the far right of the fan: which colour is which mode
    for (let k = 0; k < ratios.length; k++) {
      const [, b, u] = ray(k, 0), q = project(b);
      if (q[0] > W - 8 || q[1] < 8 || q[1] > H * 0.74) continue;
      cx.fillStyle = rgba(spectral(u), 0.35 + 0.6 * Math.min(1, Math.sqrt(modeE[k] * 4)));
      cx.fillText(ratios[k].toFixed(2), q[0] + 4, q[1] + 3);
    }
  }

  return { mount, frame, MIN };
})();
if (typeof module !== "undefined") module.exports = CrystalScope;
