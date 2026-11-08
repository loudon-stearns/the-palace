// visualizer.js — Neural Granular's picture for the CRT: the crowd tunnel.
//
// The page's teaching tool is the raster plot: one row per neuron, a dot at every spike,
// and the crowd's agreement shows as vertical stripes. This is that plot rolled into a
// tube and looked down from inside.
//
//  - The newest ring, at the mouth of the tunnel, is the crowd now. Every neuron sits
//    on it at its phase, measured from the crowd's own mean phase, so the top of the
//    ring is the moment of agreement. Followers glow phosphor green; pacemakers, who
//    ignore the pull, glow amber.
//  - Each frame the ring is pushed one step back into the glass. A scattered crowd
//    leaves a tube of snow. A locked crowd leaves one bright filament running down the
//    top of the tunnel. Just under the lock, the surge (cycle 16) shows as the filament
//    forming, fraying and forming again.
//  - In the middle, the soma: its size is the crowd's agreement, its brightness the
//    firing and the amplifier. A needle from it points at the mean phase, as long as
//    the agreement is strong (the Kuramoto order parameter, drawn).
//  - Drag on the glass: left and right is Tightness, up and down is Life. A drag is
//    the knob moving, with automation.
//
// Contract with the editor (VST Template machinery/ui/editor.html, § the CRT's picture):
//   NeuralGranularTunnel.mount(el, hooks)      draws into el; hooks { get, set, begin, end } by id
//   NeuralGranularTunnel.frame(probes, params) probes in kProbes order: sync, core, f0, env, fire,
//                                              f00..f23 (followers), p00..p23 (pacemakers)
// Nothing else is read; nothing is fetched.
const NeuralGranularTunnel = (() => {
  const BINS = 24, ROWS = 72, SIZES = [32, 64, 128, 256];
  const PHOS = [124, 255, 178], AMBER = [255, 179, 71], INK = [200, 255, 225];
  const NOTE = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  let el = null, cv = null, g = null, W = 0, H = 0, dpr = 1, hooks = null;
  const rows = [];   // newest first: { f: Float32Array(BINS), p: Float32Array(BINS), env }
  let now = { sync: 0, core: 0, f0: 0, env: 0, fire: 0, n: 128, tight: 0.8, life: 0.2 };
  let t = 0, drag = null, seed = 1;

  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  function noteName(f) {
    if (!(f > 0)) return "—";
    const m = Math.round(69 + 12 * Math.log2(f / 440));
    return NOTE[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
  }

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

    // drag: x is tightness (0..3), y is life (0.75 at the top, 0 at the bottom)
    const at = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
    cv.addEventListener("pointerdown", e => {
      if (!hooks) return;
      cv.setPointerCapture(e.pointerId);
      const [x, y] = at(e);
      drag = { x, y, tight: hooks.get("tight") ?? now.tight, life: hooks.get("life") ?? now.life };
      hooks.begin("tight"); hooks.begin("life");
    });
    cv.addEventListener("pointermove", e => {
      if (!drag) return;
      const [x, y] = at(e);
      hooks.set("tight", Math.max(0, Math.min(3, drag.tight + (x - drag.x) * 3)));
      hooks.set("life", Math.max(0, Math.min(0.75, drag.life - (y - drag.y) * 0.75)));
    });
    const up = () => { if (!drag) return; drag = null; hooks.end("tight"); hooks.end("life"); };
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
  }

  function frame(probes, params, dt) {
    params = params || {};
    probes = probes || [];
    t += dt || 1 / 60;
    now = {
      sync: probes[0] || 0, core: probes[1] || 0, f0: probes[2] || 0, env: probes[3] || 0, fire: probes[4] || 0,
      n: SIZES[Math.round(params.size ?? 2)] || 128,
      tight: params.tight ?? 0.8, life: params.life ?? 0.2,
    };
    const f = new Float32Array(BINS), p = new Float32Array(BINS);
    for (let b = 0; b < BINS; ++b) { f[b] = probes[5 + b] || 0; p[b] = probes[5 + BINS + b] || 0; }
    rows.unshift({ f, p, env: now.env });
    if (rows.length > ROWS) rows.pop();
    draw();
  }

  // the tunnel: a ring at depth k shrinks toward a vanishing point that orbits slowly,
  // so the tube is seen a little from the side and reads as a solid
  function ringAt(k) {
    const depth = k / ROWS, s = 1 / (1 + depth * 5.5);
    const vx = W * 0.5 + Math.sin(t * 0.13) * W * 0.16, vy = H * 0.47 + Math.cos(t * 0.11) * H * 0.12;
    const cx = W * 0.5 + (vx - W * 0.5) * (1 - s), cy = H * 0.52 + (vy - H * 0.52) * (1 - s);
    const R = Math.min(W, H) * 0.36 * s;
    return { cx, cy, R, s, depth };
  }
  const angle = b => -Math.PI / 2 + ((b + 0.5) / BINS) * 2 * Math.PI;

  function draw() {
    if (!g || !W || !H) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.globalCompositeOperation = "source-over";
    g.fillStyle = "#020604"; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "lighter";

    const lit = 0.25 + 0.75 * now.env;   // the crowd runs between notes: shown dim, not dark

    // the tube's ribs: a faint ring every twelfth row
    g.lineWidth = 1;
    for (let k = ROWS - 1; k >= 0; k -= 12) {
      const r = ringAt(k);
      g.strokeStyle = rgba(PHOS, 0.05 * (1 - r.depth));
      g.beginPath(); g.ellipse(r.cx, r.cy, r.R, r.R, 0, 0, 2 * Math.PI); g.stroke();
    }

    // history, back to front: one blob per bin, as bright as the share of the crowd in it
    for (let k = rows.length - 1; k >= 1; --k) {
      const row = rows[k], r = ringAt(k), fade = (1 - r.depth) * (0.25 + 0.75 * row.env) * 0.9;
      for (let b = 0; b < BINS; ++b) {
        const a = angle(b), x = r.cx + Math.cos(a) * r.R, y = r.cy + Math.sin(a) * r.R;
        const sz = Math.max(0.8, 3.2 * r.s * (W / 900));
        if (row.f[b] > 0.004) {
          g.fillStyle = rgba(PHOS, Math.min(1, row.f[b] * 9) * fade);
          g.fillRect(x - sz, y - sz, 2 * sz, 2 * sz);
        }
        if (row.p[b] > 0.004) {
          g.fillStyle = rgba(AMBER, Math.min(1, row.p[b] * 9) * fade);
          g.fillRect(x - sz * 0.7, y - sz * 0.7, 1.4 * sz, 1.4 * sz);
        }
      }
    }

    // the mouth: every neuron as its own spark, scattered inside its bin
    if (rows.length) {
      const row = rows[0], r = ringAt(0);
      seed = 7;
      for (let b = 0; b < BINS; ++b) {
        for (const [share, col, big] of [[row.f[b], PHOS, 2.4], [row.p[b], AMBER, 2.0]]) {
          const count = Math.round(share * now.n);
          for (let i = 0; i < count; ++i) {
            const a = angle(b) + (rnd() - 0.5) * (2 * Math.PI / BINS);
            const rr = r.R * (1 + (rnd() - 0.5) * 0.05);
            const x = r.cx + Math.cos(a) * rr, y = r.cy + Math.sin(a) * rr;
            const gr = g.createRadialGradient(x, y, 0, x, y, big * 3);
            gr.addColorStop(0, rgba(col, 0.9 * lit)); gr.addColorStop(1, rgba(col, 0));
            g.fillStyle = gr; g.fillRect(x - big * 3, y - big * 3, big * 6, big * 6);
          }
        }
      }

      // the soma, and the needle: the order parameter, drawn
      const sr = r.R * (0.08 + 0.22 * now.sync);
      const glow = Math.min(1, 0.2 + 0.5 * now.fire * now.sync + 0.4 * now.env);
      const gr = g.createRadialGradient(r.cx, r.cy, 0, r.cx, r.cy, sr * 2.2);
      gr.addColorStop(0, rgba(INK, 0.55 * glow)); gr.addColorStop(0.45, rgba(PHOS, 0.25 * glow)); gr.addColorStop(1, rgba(PHOS, 0));
      g.fillStyle = gr; g.beginPath(); g.arc(r.cx, r.cy, sr * 2.2, 0, 2 * Math.PI); g.fill();
      g.strokeStyle = rgba(INK, 0.35 + 0.5 * now.sync); g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(r.cx, r.cy); g.lineTo(r.cx, r.cy - r.R * now.sync); g.stroke();
    }

    // readouts, in the dress's mono
    g.globalCompositeOperation = "source-over";
    const fs = Math.max(10, Math.min(14, H * 0.03));
    g.font = `${fs}px "JetBrains Mono", ui-monospace, monospace`;
    const lockAt = 1 / Math.max(0.25, 1 - now.life);
    const state = now.core > 0.7 ? "LOCKED" : now.core > 0.35 ? "SURGING" : "SCATTERED";
    g.fillStyle = rgba(PHOS, 0.75);
    g.fillText(`CROWD ${now.n}   ${noteName(now.f0)}  ${now.f0 > 0 ? now.f0.toFixed(1) + " Hz" : ""}`, fs, fs * 1.6);
    g.fillText(`agreement ${now.sync.toFixed(2)}   followers ${now.core.toFixed(2)}`, fs, fs * 3.0);
    g.fillStyle = rgba(now.core > 0.7 ? INK : PHOS, now.core > 0.7 ? 0.95 : 0.55);
    g.fillText(state, W - fs * 7.2, fs * 1.6);
    g.fillStyle = rgba(PHOS, 0.5);
    g.fillText(`tightness ${now.tight.toFixed(2)}  ·  locks at ${lockAt.toFixed(2)}`, fs, H - fs * 2.4);
    g.fillStyle = rgba(AMBER, 0.6);
    g.fillText(`life ${(100 * now.life).toFixed(0)}% pacemakers`, fs, H - fs);
    g.fillStyle = rgba(PHOS, 0.3);
    g.fillText("drag: ←→ tightness  ↑↓ life", W - fs * 17, H - fs);
  }

  return { mount, frame };
})();
