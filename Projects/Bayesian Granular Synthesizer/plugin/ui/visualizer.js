// visualizer.js — Belief Cloud's picture for the CRT: the belief helix.
//
// Pitch is drawn as a helix, one turn per octave, so every C stands above every
// other C and a chord's notes line up in columns. What the cloud believes is
// light on the strand. Doubt is fog in the tube. Held notes are evidence: the fog
// is pulled out of the air onto the strand, the light there pinches to a bead as
// conviction grows, and the floor's twelve-sided chroma dial draws the chord the
// cloud is coming to believe — the hypothesis, as a shape.
//
// Grains are drawn from the same belief the engine samples, rebuilt here from the
// streamed probes and the parameters: short grains fly off as cyan sparks (the
// clicks), long grains sit on the strand as gold beads that ride it (the tones).
// The engine's own latest grain flashes as a ring.
//
// Contract with the editor (the CRT move on VST Template):
//   BeliefHelix.mount(el[, hooks])      draws into el (window.editorScreen); sizes itself
//   BeliefHelix.frame(probes, params[, dt])  probes: Algorithm.h kProbes order (array);
//                                       params: { id: value } for the parameter table
// Nothing else is read; nothing is fetched.
//
// The prior is painted on the floor dial. With hooks { set(id, v), begin(id), end(id) }
// (the editor's parameter relays), a drag on the dial pulls each pitch class's spoke
// in or out, and that is the Prior C … Prior B knobs moving: the painted belief is
// the parameters, never a second state. Sweep round the dial to draw a scale; the
// camera holds still while you paint. A double-click flattens it again. Painting
// on a flat-shaped prior (Prior shape 0) turns Prior shape up to 1 first, or the
// paint would do nothing.
const BeliefHelix = (() => {
  const LO = 33, HI = 96, B = 630, MAX_NOTES = 16;
  const NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  const PC_IDS = ["pc_c", "pc_cs", "pc_d", "pc_ds", "pc_e", "pc_f", "pc_fs", "pc_g", "pc_gs", "pc_a", "pc_as", "pc_b"];
  let cv, cx, W = 0, H = 0, dpr = 1, el = null;
  let last = performance.now(), simT = 0, orbit = 0.6;
  const prior = new Float64Array(B), cdf = new Float64Array(B), tone = new Float64Array(B), dens = new Float64Array(B), warm = new Float64Array(B);
  let priorKey = "", priorSum = 1;
  const sparks = [], beads = [], rings = [];
  const motes = [];
  let hooks = null, painting = false, hoverPc = -1, dial = null, lastQ = null, touched = new Set();
  let lastGrain = NaN, chroma = new Float64Array(12), chromaShown = new Float64Array(12);
  let rng = 987654321;
  const rnd = () => { rng = (rng * 1664525 + 1013904223) >>> 0; return rng / 4294967296; };
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());

  // ---- geometry: pitch → helix point (world units)
  const TURN = 2 * Math.PI / 12, RAD = 1.0, RISE = 0.40;          // per semitone, radius, height per octave
  function helix(m, r = RAD) {
    const a = (m - 60) * TURN - Math.PI / 2;                        // C at the front
    return [r * Math.cos(a), (m - 64.5) / 12 * RISE + 0.18, r * Math.sin(a)];
  }
  // camera: slow orbit, a little above
  let cam = { yaw: 0, pitch: 0.32, dist: 4.3, f: 1 };
  function project(p) {
    const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
    let x = p[0] * cy - p[2] * sy, z = p[0] * sy + p[2] * cy, y = p[1];
    const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    const y2 = y * cp - z * sp, z2 = y * sp + z * cp;
    const zz = z2 + cam.dist;
    const s = cam.f / zz;
    return [W / 2 + x * s, H * 0.53 - y2 * s, s, zz];
  }

  function mount(target, h) {
    el = target; hooks = h || null;
    cv = document.createElement("canvas");
    cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.appendChild(cv);
    cx = cv.getContext("2d");
    for (let i = 0; i < 520; i++) motes.push(newMote());
    const fit = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = el.clientWidth; H = el.clientHeight;
      cv.width = Math.max(1, W * dpr); cv.height = Math.max(1, H * dpr);
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cam.f = Math.min(W, H) * 1.18 + Math.max(0, W - H) * 0.12;
    };
    fit();
    if (hooks) paintable();
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(fit).observe(el);
    window.addEventListener("resize", fit);
  }

  function newMote() {
    const a = rnd() * 2 * Math.PI, r = 0.2 + 1.5 * Math.sqrt(rnd()), y = (rnd() - 0.5) * 2.6 + 0.15;
    return { home: [r * Math.cos(a), y, r * Math.sin(a)], p: [r * Math.cos(a), y, r * Math.sin(a)], tgt: -1, seed: rnd() * 100, pull: 0 };
  }

  // ---- the prior, rebuilt by the painter's rule (= Algorithm.h buildPrior)
  function buildPrior(q) {
    const key = [q.prior_shape, q.hill_width, q.register, q.register_width, ...PC_IDS.map(k => q[k])].join(",");
    if (key === priorKey) return;
    priorKey = key;
    let a = 0, mx = 0;
    for (let i = 0; i < B; i++) {
      const m = LO + (i + 0.5) * 10 / 100;
      let h = 0.02; const base = Math.floor(m) - LO;
      for (let k = Math.max(0, base - 3); k <= Math.min(63, base + 3); k++) {
        const dist = m - (LO + k);
        if (Math.abs(dist) < 3) { const d = dist * 100 / q.hill_width; h += q[PC_IDS[(LO + k) % 12]] * Math.exp(-0.5 * d * d); }
      }
      const r = (m - q.register) / (12 * q.register_width);
      const p = Math.exp(-0.5 * r * r) * ((1 - q.prior_shape) + q.prior_shape * h);
      prior[i] = p; a += p; cdf[i] = a; if (p > mx) mx = p;
    }
    priorSum = a; const mean = a / B;
    for (let i = 0; i < B; i++) tone[i] = mx > mean * 1.05 ? Math.max(0, Math.min(1, (prior[i] - mean) / (mx - mean))) : 0;
  }

  // ---- read one frame of probes into notes
  function readNotes(pr, q) {
    const lw = Math.log(q.width_start), lf = Math.log(q.width_floor), out = [];
    for (let j = 0; j < MAX_NOTES; j++) {
      const b = 5 + 3 * j, m = pr[b];
      if (m < 0) continue;
      const w = pr[b + 1], c = pr[b + 2];
      out.push({ m, w, c, sig: Math.exp(lw - c * (lw - lf)) });
    }
    return out;
  }

  // a grain drawn from the belief, as the engine draws one
  function drawGrain(notes, q, Z) {
    let u = rnd() * Z, m;
    if (u < q.doubt || !notes.length) {
      const t = rnd() * priorSum; let a = 0, b = B - 1;
      while (a < b) { const c = (a + b) >> 1; if (cdf[c] < t) a = c + 1; else b = c; }
      m = LO + (a + rnd()) / 10;
    } else {
      u -= q.doubt; let pick = notes[notes.length - 1];
      for (const n of notes) { if (u < n.w) { pick = n; break; } u -= n.w; }
      m = pick.m + gauss() * pick.sig / 100;
    }
    let best = 0;
    for (const n of notes) { const d = (m - n.m) * 100 / q.near; const g = Math.exp(-0.5 * d * d) * n.w * n.c; if (g > best) best = g; }
    const bi = Math.floor((m - LO) * 10);
    if (bi >= 0 && bi < B) best = Math.max(best, q.prior_tone * tone[bi]);
    const cycles = q.shortest * Math.pow(q.longest / q.shortest, best);
    return { m, cycles, tonal: best };
  }

  function frame(pr, q, dtGiven) {
    if (!cx || !W) return;
    const now = performance.now(), dt = dtGiven ?? Math.min(0.05, (now - last) / 1000); last = now;
    simT += dt; const time = simT;
    lastQ = q;
    buildPrior(q);
    const notes = readNotes(pr, q);
    let sumW = 0; for (const n of notes) sumW += n.w;
    const Z = q.doubt + sumW, share = q.doubt / Z;
    let belief = 0; for (const n of notes) belief = Math.max(belief, n.w * n.c);

    // posterior density per bin, and how much of it is conviction (warmth)
    const pm = share / priorSum;
    for (let i = 0; i < B; i++) { dens[i] = prior[i] * pm; warm[i] = q.prior_tone * tone[i] * 0.6; }
    for (const n of notes) {
      const sm = n.sig / 100, a = (n.w / Z) * 0.1 / (sm * Math.sqrt(2 * Math.PI));
      const i0 = Math.max(0, Math.floor((n.m - 5 * sm - LO) * 10)), i1 = Math.min(B - 1, Math.ceil((n.m + 5 * sm - LO) * 10));
      for (let i = i0; i <= i1; i++) {
        const d = (LO + (i + 0.5) / 10 - n.m) / sm, g = a * Math.exp(-0.5 * d * d);
        dens[i] += g; warm[i] = Math.max(warm[i], n.c * Math.min(1, g / (dens[i] + 1e-9)));
      }
    }

    // camera drifts; it slows as the cloud comes to believe, as if leaning in
    if (!painting) orbit += dt * (0.16 - 0.1 * belief);
    cam.yaw = orbit; cam.pitch = 0.52 + 0.06 * Math.sin(time * 0.13); cam.dist = 5.0 - 0.45 * belief;

    // ---- ground
    cx.globalCompositeOperation = "source-over";
    const bg = cx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.5, Math.max(W, H) * 0.75);
    bg.addColorStop(0, `rgb(${14 + 10 * belief | 0},${12 + 6 * belief | 0},${30 - 8 * belief | 0})`);
    bg.addColorStop(1, "rgb(2,2,6)");
    cx.fillStyle = bg; cx.fillRect(0, 0, W, H);
    cx.globalCompositeOperation = "lighter";

    drawFloor(notes, q, share, dt);

    // ---- fog: motes drift; belief pulls them onto the strand at the believed notes
    const pull = 1 - share;
    for (const mo of motes) {
      if (mo.tgt >= 0 && (mo.tgt >= notes.length || rnd() < dt * 0.15)) mo.tgt = -1;
      if (mo.tgt < 0 && notes.length && rnd() < dt * 1.5 * pull) {
        let u = rnd() * sumW, k = 0; for (; k < notes.length - 1; k++) { if (u < notes[k].w) break; u -= notes[k].w; } mo.tgt = k;
      }
      let target;
      if (mo.tgt >= 0) {
        const n = notes[mo.tgt];
        target = helix(n.m + gauss() * n.sig / 100 * 0.3, RAD + (1 - n.c) * 0.25 * Math.sin(mo.seed));
        mo.pull += (n.c * n.w - mo.pull) * dt * 1.2;
      } else { target = mo.home; mo.pull += (0 - mo.pull) * dt * 0.8; }
      const k = dt * (mo.tgt >= 0 ? 1.4 : 0.35);
      for (let d = 0; d < 3; d++) mo.p[d] += (target[d] - mo.p[d]) * k + Math.sin(time * 0.3 + mo.seed + d * 2) * dt * 0.05;
      const s = project(mo.p);
      const a = (0.05 + 0.5 * share) * (0.35 + 0.65 * (1 - mo.pull)) + mo.pull * 0.5;
      const hue = mo.pull > 0.25 ? `255,${185 + 50 * mo.pull | 0},${120 - 40 * mo.pull | 0}` : "130,145,255";
      cx.fillStyle = `rgba(${hue},${Math.min(0.6, a * 0.55)})`;
      const r = Math.max(0.5, s[2] * 0.0035 * (1 + 0.6 * mo.pull));
      cx.beginPath(); cx.arc(s[0], s[1], r, 0, 6.2832); cx.fill();
    }

    // ---- the strand: belief as light along the helix
    let maxD = 1e-9; for (let i = 0; i < B; i++) if (dens[i] > maxD) maxD = dens[i];
    const flat = 1 / B;
    cx.lineCap = "round";
    let prev = project(helix(LO));
    for (let i = 0; i < B; i++) {
      const cur = project(helix(LO + (i + 1) / 10));
      const lvl = Math.min(1, Math.sqrt(dens[i] / (flat * 8)));            // relative to a flat belief
      const wv = warm[i], depth = Math.max(0.25, Math.min(1, 3.4 / cur[3] - 0.25));
      const r = 120 + 135 * wv, g = 150 + 70 * wv, bl = 255 - 150 * wv;
      cx.strokeStyle = `rgba(${r | 0},${g | 0},${bl | 0},${(0.09 + 0.3 * lvl) * depth})`;
      cx.lineWidth = Math.max(0.7, (1 + 10 * lvl * lvl) * cur[2] * 0.004);
      cx.beginPath(); cx.moveTo(prev[0], prev[1]); cx.lineTo(cur[0], cur[1]); cx.stroke();
      if (lvl > 0.25) {
        cx.strokeStyle = `rgba(255,${235 - 30 * wv | 0},${200 - 80 * wv | 0},${0.5 * lvl * depth})`;
        cx.lineWidth = Math.max(0.6, 1.2 * cur[2] * 0.004);
        cx.beginPath(); cx.moveTo(prev[0], prev[1]); cx.lineTo(cur[0], cur[1]); cx.stroke();
      }
      prev = cur;
    }

    // ---- grains drawn from the belief
    let n = q.rate * dt * 1.4; const count = Math.floor(n) + (rnd() < n % 1 ? 1 : 0);
    for (let k = 0; k < Math.min(count, 60); k++) {
      const g = drawGrain(notes, q, Z);
      if (g.m < LO - 1 || g.m > HI + 1) continue;
      const tl = Math.log(g.cycles / q.shortest) / Math.log(q.longest / q.shortest);
      const f = 440 * Math.pow(2, (g.m - 69) / 12), secs = g.cycles / f;
      if (tl < 0.45) {
        const p = helix(g.m), out = [p[0], 0, p[2]], sp = 0.25 + 0.9 * rnd() * (1 - tl);
        sparks.push({ p, q: p.slice(), v: [out[0] * sp + gauss() * 0.25, gauss() * 0.3, out[2] * sp + gauss() * 0.25], life: 0, max: 0.25 + 0.35 * rnd(), t: tl });
      } else {
        beads.push({ m: g.m, life: 0, max: Math.min(2.2, Math.max(0.35, secs * 2.5)), t: tl });
      }
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.life += dt;
      if (s.life > s.max) { sparks.splice(i, 1); continue; }
      for (let d = 0; d < 3; d++) { s.p[d] += s.v[d] * dt; s.q[d] += (s.p[d] - s.q[d]) * Math.min(1, dt * 14); }
      const a0 = project(s.q), a1 = project(s.p), k = 1 - s.life / s.max;
      cx.strokeStyle = `rgba(160,225,255,${0.75 * k})`; cx.lineWidth = Math.max(0.6, a1[2] * 0.0022);
      cx.beginPath(); cx.moveTo(a0[0], a0[1]); cx.lineTo(a1[0] + 0.5, a1[1] + 0.5); cx.stroke();
    }
    if (sparks.length > 900) sparks.splice(0, sparks.length - 900);
    for (let i = beads.length - 1; i >= 0; i--) {
      const b = beads[i]; b.life += dt;
      if (b.life > b.max) { beads.splice(i, 1); continue; }
      const k = Math.sin(Math.PI * b.life / b.max);
      const ride = b.m + 0.06 * Math.sin(b.life * 9 + b.m);
      const s = project(helix(ride)), r = (1.2 + 3.5 * b.t) * s[2] * 0.0011 * (0.4 + 0.6 * k);
      const g = cx.createRadialGradient(s[0], s[1], 0, s[0], s[1], r * 3);
      g.addColorStop(0, `rgba(255,236,190,${0.32 * k})`); g.addColorStop(0.3, `rgba(255,180,80,${0.14 * k})`); g.addColorStop(1, "rgba(255,150,40,0)");
      cx.fillStyle = g; cx.beginPath(); cx.arc(s[0], s[1], r * 3, 0, 2 * Math.PI); cx.fill();
    }
    if (beads.length > 700) beads.splice(0, beads.length - 700);

    // ---- the engine's own latest grain: a ring
    const gn = pr[3];
    if (gn !== lastGrain && gn > 0) { rings.push({ m: gn, life: 0, t: Math.log(pr[4] / q.shortest) / Math.log(q.longest / q.shortest) }); lastGrain = gn; }
    for (let i = rings.length - 1; i >= 0; i--) {
      const rg = rings[i]; rg.life += dt;
      if (rg.life > 0.6) { rings.splice(i, 1); continue; }
      const s = project(helix(rg.m)), k = 1 - rg.life / 0.6;
      cx.strokeStyle = rg.t > 0.45 ? `rgba(255,220,150,${0.6 * k})` : `rgba(160,235,255,${0.6 * k})`;
      cx.lineWidth = 1;
      cx.beginPath(); cx.arc(s[0], s[1], (4 + 30 * rg.life) * s[2] * 0.0012, 0, 2 * Math.PI); cx.stroke();
    }

    // ---- plumb lines: from each believed note down to its pitch class on the floor
    for (const nn of notes) {
      const k = nn.w * nn.c; if (k < 0.05) continue;
      const top = project(helix(nn.m)), base = helix(nn.m); base[1] = -1.2;
      const bot = project([base[0] * 1.15 * (0.12 + 0.88 * Math.min(1, chromaShown[((Math.round(nn.m) % 12) + 12) % 12])), base[1], base[2] * 1.15 * (0.12 + 0.88 * Math.min(1, chromaShown[((Math.round(nn.m) % 12) + 12) % 12]))]);
      const gr = cx.createLinearGradient(top[0], top[1], bot[0], bot[1]);
      gr.addColorStop(0, `rgba(255,210,140,${0.35 * k})`); gr.addColorStop(1, "rgba(255,210,140,0.02)");
      cx.strokeStyle = gr; cx.lineWidth = 1;
      cx.beginPath(); cx.moveTo(top[0], top[1]); cx.lineTo(bot[0], bot[1]); cx.stroke();
    }

    // ---- caption: the measure in words
    cx.globalCompositeOperation = "source-over";
    cx.font = `${Math.max(9, Math.min(12, W / 60))}px "JetBrains Mono", ui-monospace, monospace`;
    cx.fillStyle = "rgba(170,180,230,0.55)";
    cx.fillText(`doubt ${(share * 100).toFixed(0)}%`, 12, H - 14);
    const said = notes.filter(nn => nn.w * nn.c > 0.4).map(nn => NAMES[((Math.round(nn.m) % 12) + 12) % 12]);
    const uniq = [...new Set(said)];
    cx.fillStyle = "rgba(255,215,150,0.7)";
    cx.textAlign = "right";
    cx.fillText(uniq.length ? `believes ${uniq.join(" ")}` : (notes.length ? "listening…" : "no evidence"), W - 12, H - 14);
    cx.textAlign = "left";
  }

  // the floor: a twelve-sided chroma dial; the hypothesis is the shape drawn on it
  function drawFloor(notes, q, share, dt) {
    const Y = -1.2, R = 1.15;
    // belief per pitch class: notes by weight × conviction, plus the prior's lean
    chroma.fill(0);
    let pcPrior = new Float64Array(12), ps = 0;
    for (let i = 0; i < B; i++) { const pc = Math.round(LO + (i + 0.5) / 10) % 12; pcPrior[pc] += prior[i]; ps += prior[i]; }
    for (let c = 0; c < 12; c++) chroma[c] = share * pcPrior[c] / ps * 2.2;
    for (const n of notes) chroma[((Math.round(n.m) % 12) + 12) % 12] += (1 - share) * n.w * (0.25 + 0.75 * n.c);
    for (let c = 0; c < 12; c++) chromaShown[c] += (Math.min(1.2, chroma[c]) - chromaShown[c]) * Math.min(1, dt * 6);
    const pts = [];
    for (let c = 0; c < 12; c++) {
      const a = c * TURN - Math.PI / 2, rr = R * (0.12 + 0.88 * Math.min(1, chromaShown[c]));
      pts.push(project([rr * Math.cos(a), Y, rr * Math.sin(a)]));
      const tick0 = project([R * Math.cos(a), Y, R * Math.sin(a)]), tick1 = project([R * 1.08 * Math.cos(a), Y, R * 1.08 * Math.sin(a)]);
      cx.strokeStyle = "rgba(120,130,220,0.25)"; cx.lineWidth = 1;
      cx.beginPath(); cx.moveTo(tick0[0], tick0[1]); cx.lineTo(tick1[0], tick1[1]); cx.stroke();
      const lab = project([R * 1.2 * Math.cos(a), Y, R * 1.2 * Math.sin(a)]);
      cx.fillStyle = `rgba(150,160,230,${0.25 + 0.5 * Math.min(1, chromaShown[c])})`;
      cx.font = `${Math.max(8, lab[2] * 0.012)}px "JetBrains Mono", ui-monospace, monospace`;
      cx.textAlign = "center"; cx.fillText(NAMES[c], lab[0], lab[1] + 3); cx.textAlign = "left";
    }
    // the rim
    cx.strokeStyle = "rgba(110,120,210,0.18)"; cx.beginPath();
    for (let k = 0; k <= 72; k++) { const a = k / 72 * 2 * Math.PI, s = project([R * Math.cos(a), Y, R * Math.sin(a)]); k ? cx.lineTo(s[0], s[1]) : cx.moveTo(s[0], s[1]); }
    cx.stroke();
    // the painter's handles: each pitch class's own prior weight, on its spoke
    const c0 = project([0, Y, 0]), rims = [];
    for (let c = 0; c < 12; c++) { const a = c * TURN - Math.PI / 2; rims.push(project([R * Math.cos(a), Y, R * Math.sin(a)])); }
    dial = { c0, rims };
    if (hooks) {
      const shaped = q.prior_shape > 0.001, near = painting || hoverPc >= 0;
      cx.strokeStyle = `rgba(232,180,106,${near ? 0.5 : 0.16})`; cx.lineWidth = 1; cx.beginPath();
      for (let c = 0; c <= 12; c++) {
        const k = c % 12, t = 0.12 + 0.88 * q[PC_IDS[k]], r = rims[k];
        const x = c0[0] + (r[0] - c0[0]) * t, y = c0[1] + (r[1] - c0[1]) * t;
        c ? cx.lineTo(x, y) : cx.moveTo(x, y);
      }
      cx.stroke();
      for (let c = 0; c < 12; c++) {
        const t = 0.12 + 0.88 * q[PC_IDS[c]], r = rims[c];
        const x = c0[0] + (r[0] - c0[0]) * t, y = c0[1] + (r[1] - c0[1]) * t, hot = c === hoverPc;
        cx.fillStyle = `rgba(255,215,154,${hot ? 0.95 : near ? 0.6 : shaped ? 0.32 : 0.18})`;
        cx.beginPath(); cx.arc(x, y, hot ? 4 : 2.6, 0, 2 * Math.PI); cx.fill();
      }
      if (near) {
        cx.fillStyle = "rgba(255,215,154,0.7)"; cx.font = `10px "JetBrains Mono", ui-monospace, monospace`; cx.textAlign = "center";
        const lab = hoverPc >= 0 ? `prior ${NAMES[hoverPc]} ${(q[PC_IDS[hoverPc]] * 100).toFixed(0)}%` : "painting the prior";
        cx.fillText(lab + (shaped ? "" : " · shape off"), c0[0], c0[1] + Math.max(18, (rims[0][1] - c0[1]) * 0.15) + 2);
        cx.textAlign = "left";
      }
    }
    // the hypothesis
    const conv = 1 - share;
    cx.fillStyle = `rgba(255,${170 + 50 * conv | 0},${110 - 40 * conv | 0},${0.05 + 0.18 * conv})`;
    cx.strokeStyle = `rgba(255,220,160,${0.2 + 0.5 * conv})`; cx.lineWidth = 1.2;
    cx.beginPath(); pts.forEach((s, k) => k ? cx.lineTo(s[0], s[1]) : cx.moveTo(s[0], s[1])); cx.closePath(); cx.fill(); cx.stroke();
  }

  // ---- painting the prior on the dial: the pointer finds the nearest spoke, and how far
  // out along it sets that pitch class's weight (the handle sits at 0.12 + 0.88·weight)
  function spokeAt(ev) {
    if (!dial) return null;
    const r = cv.getBoundingClientRect(), px = ev.clientX - r.left, py = ev.clientY - r.top, { c0, rims } = dial;
    let best = null;
    for (let c = 0; c < 12; c++) {
      const vx = rims[c][0] - c0[0], vy = rims[c][1] - c0[1], L2 = vx * vx + vy * vy;
      if (L2 < 1) continue;
      const t = ((px - c0[0]) * vx + (py - c0[1]) * vy) / L2;
      const d = Math.hypot(px - (c0[0] + vx * t), py - (c0[1] + vy * t)) / Math.sqrt(L2);   // in spoke lengths
      if (t > -0.15 && t < 1.45 && (!best || d < best.d)) best = { c, t, d };
    }
    return best && best.d < 0.6 ? best : null;
  }
  function paintable() {
    const set = (c, t) => {
      const id = PC_IDS[c];
      if (!touched.has(id)) { touched.add(id); hooks.begin && hooks.begin(id); }
      hooks.set(id, Math.max(0, Math.min(1, (t - 0.12) / 0.88)));
    };
    cv.style.touchAction = "none";
    cv.addEventListener("pointermove", ev => {
      const s = spokeAt(ev);
      if (painting) { if (s) set(s.c, s.t); }
      hoverPc = s ? s.c : -1;
      cv.style.cursor = s || painting ? "crosshair" : "";
    });
    cv.addEventListener("pointerleave", () => { if (!painting) hoverPc = -1; });
    cv.addEventListener("pointerdown", ev => {
      const s = spokeAt(ev);
      if (!s) return;
      painting = true; cv.setPointerCapture(ev.pointerId);
      if (lastQ && lastQ.prior_shape <= 0.001) { hooks.begin && hooks.begin("prior_shape"); hooks.set("prior_shape", 1); hooks.end && hooks.end("prior_shape"); }
      set(s.c, s.t);
    });
    const up = ev => {
      if (!painting) return;
      painting = false; try { cv.releasePointerCapture(ev.pointerId); } catch (e) {}
      touched.forEach(id => hooks.end && hooks.end(id)); touched.clear();
    };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    cv.addEventListener("dblclick", ev => {
      if (!spokeAt(ev)) return;
      PC_IDS.forEach(id => { hooks.begin && hooks.begin(id); hooks.set(id, 1); hooks.end && hooks.end(id); });
    });
  }

  return { mount, frame };
})();
if (typeof window !== "undefined") window.BeliefHelix = BeliefHelix;
