// visualizer.js — Action Potential's picture for the CRT: the axon.
//
// The crowd is drawn as one nerve fibre seen in 3D, turning slowly. Each ring of the
// membrane is one neuron, slowest at the far end, fastest at the near end. A ring's
// girth is its membrane voltage: it pinches in the undershoot, swells as it charges,
// and bulges at the spike. Its colour is the ion that is moving: the charge in amber,
// the Na⁺ rise in orange, the K⁺ fall in blue, the recovery in violet. As a ring
// fires, sodium sparks rush in through the membrane and potassium sparks fly out.
//
// The neurons fire 100 times a second and more, far too fast to draw. What moves
// slowly is where each neuron sits in its cycle against the crowd's, and that is what
// the plugin sends (c00..c31). The screen plays it back in slow motion: one virtual
// cycle every two seconds or so, each ring shown at its own lead or lag. A locked crowd
// is one membrane breathing as one, with the fastest neurons (near end) a hair ahead,
// so the beat runs down the fibre the way the fastest member pulls the rest. A
// scattered crowd is a restless, shimmering membrane. The shape of the swell is the
// real waveform, simulated here from the knobs at the note's pitch, so damping makes
// every ring wobble, a deeper undershoot pinches it, and at high notes the spike fills
// more of the cycle.
//
// Crowd = 1 is the single neuron: the rings become moments instead of neurons, and
// the fibre is the action potential itself, sculpted along the tube and scrolling.
//
// Drag on the glass: left and right is Coupling, up and down is Rate spread.
//
// Contract with the editor (VST Template machinery/ui/editor.html, § the CRT's picture):
//   ActionPotentialAxon.mount(el, hooks)            hooks { get, set, begin, end } by id
//   ActionPotentialAxon.frame(probes, params, dt)   probes: sync, mf, f0, env, c00..c31
// Nothing else is read; nothing is fetched.
const ActionPotentialAxon = (() => {
  const SHOW = 32, SIZES = [1, 8, 16, 32, 64], SEG = 44, SKIN = 12, SLOW = 0.45;
  const CHG = [255, 205, 90], NA = [255, 128, 40], KC = [70, 160, 255], HYP = [175, 110, 255], INK = [235, 240, 255];
  const NOTE = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  let el = null, cv = null, g = null, W = 0, H = 0, dpr = 1, hooks = null;
  let t = 0, phi = 0, drag = null;
  let now = { sync: 0, mf: 0, f0: 110, env: 0, d: 32, couple: 0.006, spread: 0.1 };
  let rel = new Float32Array(SHOW), lastPh = new Int8Array(SHOW).fill(-1);
  let tpl = { v: new Float32Array([0.5]), q: new Uint8Array([0]), rest: 0.2 }, tplKey = "";
  const sparks = [];

  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const fract = x => x - Math.floor(x);
  function noteName(f) {
    if (!(f > 0)) return "—";
    const m = Math.round(69 + 12 * Math.log2(f / 440));
    return NOTE[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
  }

  // One period of a single Stage-4 neuron at this pitch, from firing to firing: the
  // engine's own step (threshold 1, no spread), so the shape on screen is the sound's.
  function buildTemplate(P, f0) {
    const sr = 44100, L = Math.max(2, P.leak * 0.001 * sr), a = 1 - 1 / L, period = sr / Math.max(1, f0);
    const spikeS = Math.max(2, P.spike * 0.001 * sr), riseS = Math.max(1, spikeS * P.rise);
    const fallS = Math.max(1, spikeS - riseS), refrS = Math.max(1, P.refr * 0.001 * sr);
    const peak = P.peak, hyp = P.hyp, damp = P.damp, span = peak - hyp, thr = 1;
    let V = 0, ph = 0, ti = 0, vel = 0, elp = 0, v0 = 0, fires = 0;
    const v = [], q = [];
    for (let n = 0; n < 40000 && fires < 3; ++n) {
      let nV, nph, nvel = 0;
      if (ph === 0) {
        const m = Math.max(1, period - (elp - ti) - 0.5), c = Math.pow(a, m);
        const cvv = V * a + (thr - v0 * c) / (L * (1 - c));
        if (cvv >= thr) { nV = thr; nph = 1; } else { nV = cvv; nph = 0; }
      } else if (ph === 1) { nV = Math.min(peak, V + (peak - thr) / riseS); nph = ti + 1 >= riseS ? 2 : 1; }
      else if (ph === 2) { nV = Math.max(hyp, V + (hyp - peak) / fallS); nph = ti + 1 >= fallS ? 3 : 2; }
      else {
        const k = 1 / L, rv = vel + (-k * V - damp * 2 * Math.sqrt(k) * vel);
        nV = V + rv; nph = ti + 1 >= refrS && V > hyp * 0.3 ? 0 : 3; if (nph === 3) nvel = rv;
      }
      const fired = ph === 0 && nph === 1;
      ti = nph !== ph ? 0 : ti + 1; vel = nvel; elp = fired ? 0 : elp + 1;
      if (ph === 3 && nph === 0) v0 = nV;
      V = nV; ph = nph;
      if (fired) ++fires;
      if (fires === 2 || (fires === 3 && v.length === 0)) { v.push((nV - hyp) / span); q.push(nph); }
    }
    if (!v.length) { v.push(0.5); q.push(0); }
    tpl = { v: Float32Array.from(v), q: Uint8Array.from(q), rest: -hyp / span };
  }
  const sample = u => { const i = Math.min(tpl.v.length - 1, Math.floor(fract(u) * tpl.v.length)); return [tpl.v[i], tpl.q[i]]; };

  function mount(target, h) {
    el = target; hooks = h || null;
    cv = document.createElement("canvas");
    cv.style.cssText = "width:100%;height:100%;display:block;cursor:crosshair;touch-action:none";
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
    fit();

    const at = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
    cv.addEventListener("pointerdown", e => {
      if (!hooks) return;
      cv.setPointerCapture(e.pointerId);
      const [x, y] = at(e);
      drag = { x, y, couple: hooks.get("couple") ?? now.couple, spread: hooks.get("spread") ?? now.spread };
      hooks.begin("couple"); hooks.begin("spread");
    });
    cv.addEventListener("pointermove", e => {
      if (!drag) return;
      const [x, y] = at(e);
      hooks.set("couple", Math.max(0, Math.min(0.04, drag.couple + (x - drag.x) * 0.04)));
      hooks.set("spread", Math.max(0, Math.min(0.5, drag.spread - (y - drag.y) * 0.5)));
    });
    const up = () => { if (!drag) return; drag = null; hooks.end("couple"); hooks.end("spread"); };
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
  }

  function frame(probes, params, dt) {
    params = params || {}; probes = probes || [];
    dt = Math.min(0.1, dt || 1 / 60);
    t += dt; phi = fract(phi + SLOW * dt);
    const n = SIZES[Math.round(params.size ?? 3)] || 32;
    now = {
      sync: probes[0] || 0, mf: probes[1] || 0, f0: probes[2] || 110, env: probes[3] || 0,
      n, d: Math.min(n, SHOW), couple: params.couple ?? 0.006, spread: params.spread ?? 0.1,
    };
    const P = {
      leak: params.leak ?? 5, spike: params.spike ?? 1, rise: params.rise ?? 0.3, peak: params.peak ?? 1.5,
      hyp: params.hyp ?? -0.2, damp: params.damp ?? 0.3, refr: params.refr ?? 1.5,
    };
    const key = [P.leak, P.spike, P.rise, P.peak, P.hyp, P.damp, P.refr].map(x => x.toPrecision(3)).join(",") + "|" + Math.round(now.f0 * 4);
    if (key !== tplKey) { tplKey = key; buildTemplate(P, now.f0); }

    // each shown neuron's lead or lag against the crowd's circular mean
    let sx = 0, sy = 0;
    for (let k = 0; k < now.d; ++k) { const a = 2 * Math.PI * (probes[4 + k] || 0); sx += Math.cos(a); sy += Math.sin(a); }
    const psi = Math.atan2(sy, sx) / (2 * Math.PI);
    for (let k = 0; k < now.d; ++k) rel[k] = fract((probes[4 + k] || 0) - psi);

    // sparks: Na⁺ in as a ring starts its rise, K⁺ out as it starts its fall
    const rings = now.d === 1 ? SHOW : now.d;
    for (let k = 0; k < rings; ++k) {
      const [, q] = sample(ringU(k));
      if (q !== lastPh[k] && lastPh[k] !== -1 && (q === 1 || q === 2) && sparks.length < 900) {
        const count = now.d === 1 ? 3 : 9;
        for (let j = 0; j < count; ++j)
          sparks.push({ k, a: Math.random() * 2 * Math.PI, r: q === 1 ? 1.9 : 1.0, vr: q === 1 ? -2.2 : 1.6, life: 1, na: q === 1 });
      }
      lastPh[k] = q;
    }
    for (let i = sparks.length - 1; i >= 0; --i) {
      const s = sparks[i];
      s.r += s.vr * dt * 0.6; s.life -= dt * 1.4; s.a += dt * 0.3;
      if (s.life <= 0 || s.r < 0.15) sparks.splice(i, 1);
    }
    draw();
  }

  // where on the template ring k sits now: its neuron's lag, or, for the single neuron,
  // a moment further back along the fibre
  function ringU(k) {
    return now.d === 1 ? phi - (SHOW - 1 - k) / SHOW : phi + rel[k];
  }

  // a point on the fibre, turned and put in perspective
  function proj(x, y, z) {
    const yaw = 0.62 + 0.32 * Math.sin(t * 0.07), tilt = 0.34 + 0.1 * Math.sin(t * 0.053);
    const cy = Math.cos(yaw), sy = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt);
    const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
    const y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
    const F = Math.min(W * 0.9, H * 1.6), s = F / (4.4 + z2);
    return [W * 0.5 + x1 * s, H * 0.53 - y2 * s, z2, s];
  }

  function ringColour(v, q) {
    if (q === 1) return NA;
    if (q === 2) return KC;
    if (q === 3) return HYP;
    const m = Math.max(0, Math.min(1, (v - tpl.rest) / Math.max(0.05, 0.75 - tpl.rest)));
    return [Math.round(110 + (CHG[0] - 110) * m), Math.round(150 + (CHG[1] - 150) * m), Math.round(190 + (CHG[2] - 190) * m)];
  }

  function draw() {
    if (!g || !W || !H) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.globalCompositeOperation = "source-over";
    const bg = g.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    bg.addColorStop(0, "#0d0816"); bg.addColorStop(1, "#020104");
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "lighter";

    const lit = 0.3 + 0.7 * now.env;
    const rings = now.d === 1 ? SHOW : now.d;
    const L = 1.7, xs = k => rings === 1 ? 0 : -L + (2 * L * k) / (rings - 1);
    const rad = v => 0.16 + 0.42 * Math.max(-0.1, v);

    // every ring's points, once
    const R = [];
    for (let k = 0; k < rings; ++k) {
      const [v, q] = sample(ringU(k)), r = rad(v), x = xs(k), pts = [];
      for (let j = 0; j <= SEG; ++j) {
        const a = (j / SEG) * 2 * Math.PI, y = Math.cos(a) * r, z = Math.sin(a) * r;
        pts.push(proj(x, y, z));
      }
      R.push({ k, v, q, r, x, pts, zc: proj(x, 0, 0)[2], col: ringColour(v, q) });
    }

    // the skin: lines along the fibre joining neighbouring rings
    g.lineWidth = 1;
    for (let s = 0; s < SKIN; ++s) { const j = Math.round((s * SEG) / SKIN);
      g.beginPath();
      for (let k = 0; k < R.length; ++k) { const p = R[k].pts[j]; k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }
      g.strokeStyle = rgba([150, 130, 210], 0.07 * lit); g.stroke();
    }

    // the rings, far to near: a wide soft stroke, then a fine bright one, the far side dimmer
    const order = R.slice().sort((a, b) => b.zc - a.zc);
    for (const ring of order) {
      const glow = ring.q === 1 || ring.q === 2 ? 1 : 0.55;
      for (let j = 0; j < SEG; ++j) {
        const p = ring.pts[j], p2 = ring.pts[j + 1];
        const face = 0.45 + 0.55 * Math.max(0, Math.min(1, (ring.zc - p[2]) / (ring.r * 1.1) * 0.5 + 0.5));
        g.strokeStyle = rgba(ring.col, 0.07 * glow * face * lit);
        g.lineWidth = 7; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p2[0], p2[1]); g.stroke();
        g.strokeStyle = rgba(ring.col, 0.85 * glow * face * lit);
        g.lineWidth = 1.4; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p2[0], p2[1]); g.stroke();
      }
    }

    // the sparks: sodium in, potassium out
    for (const s of sparks) {
      const ring = R[s.k]; if (!ring) continue;
      const rr = rad(ring.v) * s.r, p = proj(ring.x, Math.cos(s.a) * rr, Math.sin(s.a) * rr);
      const sz = Math.max(1, 0.035 * p[3]);
      g.fillStyle = rgba(s.na ? NA : KC, 0.9 * s.life * lit);
      g.fillRect(p[0] - sz / 2, p[1] - sz / 2, sz, sz);
    }

    // the agreement, as a halo along the fibre's axis
    const a0 = proj(-L, 0, 0), a1 = proj(L, 0, 0);
    const lg = g.createLinearGradient(a0[0], a0[1], a1[0], a1[1]);
    lg.addColorStop(0, rgba(INK, 0)); lg.addColorStop(0.5, rgba(INK, 0.22 * now.sync * lit)); lg.addColorStop(1, rgba(INK, 0));
    g.strokeStyle = lg; g.lineWidth = 2 + 10 * now.sync * now.sync;
    g.beginPath(); g.moveTo(a0[0], a0[1]); g.lineTo(a1[0], a1[1]); g.stroke();

    // readouts
    g.globalCompositeOperation = "source-over";
    const fs = Math.max(10, Math.min(14, H * 0.03));
    g.font = `${fs}px "JetBrains Mono", ui-monospace, monospace`;
    const state = now.d === 1 ? "ONE NEURON" : now.sync > 0.85 ? "LOCKED" : now.sync > 0.4 ? "PULLING IN" : "SCATTERED";
    g.fillStyle = rgba(INK, 0.75);
    g.fillText(`CROWD ${now.n}   ${noteName(now.f0)}  ${now.f0.toFixed(1)} Hz`, fs, fs * 1.6);
    if (now.d > 1) g.fillText(`agreement ${now.sync.toFixed(2)}`, fs, fs * 3.0);
    g.fillStyle = rgba(now.sync > 0.85 || now.d === 1 ? INK : CHG, 0.85);
    g.fillText(state, W - fs * (state.length * 0.62 + 1.2), fs * 1.6);
    g.fillStyle = rgba(INK, 0.5);
    g.fillText(`coupling ${now.couple.toFixed(4)}   spread ${now.spread.toFixed(2)}`, fs, H - fs * 2.4);
    let x = fs;
    for (const [c, s] of [[CHG, "charge "], [NA, "Na⁺ in "], [KC, "K⁺ out "], [HYP, "recovery"]]) {
      g.fillStyle = rgba(c, 0.8); g.fillText(s, x, H - fs); x += g.measureText(s + " ").width;
    }
    g.fillStyle = rgba(INK, 0.3);
    const hint = "slow motion · drag: ←→ coupling  ↑↓ spread";
    g.fillText(hint, W - g.measureText(hint).width - fs, fs * 3.0);
  }

  return { mount, frame };
})();
