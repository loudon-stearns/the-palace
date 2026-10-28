// visualizer.js — Simple Synth's picture for the CRT: the stone and the chisel.
//
// Subtractive synthesis is carving. The oscillator hands over a block of stone, every
// harmonic it has, and the filter cuts away what you don't want to hear. So:
//
//  - Each harmonic of the note stands as a stalk at its frequency, on a log scale from
//    20 Hz to 20 kHz. Its full height, drawn faint, is what the wave gives (saw: every
//    harmonic at 1/n; square: the odd ones at 1/n; triangle: the odd ones at 1/n²; sine:
//    one). The bright part is what is left after the filter: the stone, carved.
//  - The chisel is the amber curve: the filter's response at this moment, the same
//    state-variable low-pass Algorithm.h runs, with its resonant bump at the cutoff.
//    The filter envelope and key tracking move it, so you watch the chisel sweep.
//  - The amplifier lights the stone: the stalks grow and fade with the amp envelope.
//  - What was carved a moment ago recedes into the screen, one row per frame, so a
//    sweep leaves a landscape behind it.
//
// It is the template's worked example of a visualizer: one object, mount and frame,
// drawing on a 2D canvas. Stewards' pictures may be far stranger.
//
// Contract with the editor (VST Template machinery/ui/editor.html, § the CRT's picture):
//   SimpleSynthScope.mount(el)                 draws into el (window.editorScreen)
//   SimpleSynthScope.frame(probes, params, dt) probes: [freq, cutoff, amp_env] (kProbes);
//                                              params: { id: value }, a menu as its index
// Nothing else is read; nothing is fetched.
const SimpleSynthScope = (() => {
  const ROWS = 56, MAXH = 160, LO = Math.log(20), HI = Math.log(20000);
  const NOTE = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  const WAVES = ["saw", "square", "triangle", "sine"];
  const PHOS = [124, 255, 178], AMBER = [255, 179, 71];
  let el = null, cv = null, g = null, W = 0, H = 0, dpr = 1;
  const rows = [];   // newest first: { f0, amps: Float32Array (dB, carved) }
  let now = { f0: 0, fc: 1000, env: 0, k: 1.4, wave: 0, src: new Float32Array(MAXH), cut: new Float32Array(MAXH), n: 0 };

  const xOf = f => (Math.log(Math.max(20, Math.min(20000, f))) - LO) / (HI - LO);
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const db = a => 20 * Math.log10(Math.max(1e-6, a));

  function source(n, wave) {   // a harmonic's amplitude in the oscillator's wave
    if (wave === 3) return n === 1 ? 1 : 0;
    if (wave === 0) return 1 / n;
    if (n % 2 === 0) return 0;
    return wave === 1 ? 1 / n : 1 / (n * n);
  }
  function filter(f, fc, k) {   // |H| of the SVF low-pass: 1 / sqrt((1 - w²)² + (k w)²)
    const w = f / fc;
    return 1 / Math.sqrt((1 - w * w) * (1 - w * w) + (k * w) * (k * w));
  }
  function noteName(f) {
    if (!(f > 0)) return "—";
    const m = Math.round(69 + 12 * Math.log2(f / 440));
    return NOTE[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
  }
  function hz(f) { return f >= 1000 ? (f / 1000).toFixed(2) + " kHz" : f.toFixed(1) + " Hz"; }

  function mount(target) {
    el = target;
    cv = document.createElement("canvas");
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
  }

  function frame(probes, params) {
    params = params || {};
    const f0 = probes[0] || 0, fc = probes[1] || params.cutoff || 1000, env = probes[2] || 0;
    const wave = Math.round(params.wave || 0), k = 2 - 1.95 * (params.resonance !== undefined ? params.resonance : 0.3);
    const n = f0 > 0 ? Math.min(MAXH, Math.floor(20000 / f0)) : 0;
    const src = new Float32Array(MAXH), cut = new Float32Array(MAXH);
    for (let h = 1; h <= n; ++h) {
      const s = source(h, wave);
      src[h - 1] = s * env;
      cut[h - 1] = s * env * filter(h * f0, fc, k);
    }
    now = { f0, fc, env, k, wave, src, cut, n };
    rows.unshift({ f0, n, cut: Float32Array.from(cut) });
    if (rows.length > ROWS) rows.pop();
    draw();
  }

  // the floor: rows recede toward a vanishing point above the centre
  function project(x, age, level) {   // x 0..1, age 0..1 (0 the front), level 0..1 above the floor
    const depth = Math.pow(age, 0.85), shrink = 1 - 0.5 * depth;
    const left = W * 0.06, width = W * 0.88;
    const X = W / 2 + (left + x * width - W / 2) * shrink;
    const base = H * (0.82 - 0.5 * depth);
    return [X, base - level * H * 0.5 * shrink];
  }
  const levelOf = a => Math.max(0, (db(a) + 60) / 60);   // −60 dB on the floor, 0 dB at the top

  function draw() {
    if (!g || !W || !H) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = "#020604"; g.fillRect(0, 0, W, H);

    // the floor's grid: a line at every decade, from the front to the back
    g.lineWidth = 1;
    for (const f of [100, 1000, 10000]) {
      const [x0, y0] = project(xOf(f), 0, 0), [x1, y1] = project(xOf(f), 1, 0);
      g.strokeStyle = rgba(PHOS, 0.08); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      g.fillStyle = rgba(PHOS, 0.35); g.font = `${Math.max(9, H * 0.032)}px "JetBrains Mono", monospace`;
      g.fillText(f >= 1000 ? f / 1000 + "k" : String(f), x0 + 3, y0 + H * 0.05);
    }

    // the landscape the chisel left: older rows, back to front
    for (let r = rows.length - 1; r >= 1; --r) {
      const row = rows[r], age = r / ROWS;
      if (!row.n) continue;
      g.strokeStyle = rgba(PHOS, 0.5 * (1 - age) * (1 - age));
      g.beginPath();
      for (let h = 1; h <= row.n; ++h) {
        const [x, y] = project(xOf(h * row.f0), age, levelOf(row.cut[h - 1]));
        h === 1 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    }

    // the stone: each harmonic's full height, faint, and what is left of it, bright
    const stalk = Math.max(1, W / 500);
    for (let h = 1; h <= now.n; ++h) {
      const x = xOf(h * now.f0);
      const [bx, by] = project(x, 0, 0);
      const [, sy] = project(x, 0, levelOf(now.src[h - 1]));
      const [, cy] = project(x, 0, levelOf(now.cut[h - 1]));
      if (now.src[h - 1] > 0) { g.strokeStyle = rgba(PHOS, 0.16); g.lineWidth = stalk; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx, sy); g.stroke(); }
      if (now.cut[h - 1] > 0) {
        g.strokeStyle = rgba(PHOS, 0.95); g.lineWidth = stalk * 1.6;
        g.shadowColor = rgba(PHOS, 0.8); g.shadowBlur = 6;
        g.beginPath(); g.moveTo(bx, by); g.lineTo(bx, Math.min(by, cy)); g.stroke();
        g.shadowBlur = 0;
      }
    }

    // the chisel: the filter's response across the whole range, at 0 dB a full stalk
    g.strokeStyle = rgba(AMBER, 0.9); g.lineWidth = 1.5; g.setLineDash([5, 4]);
    g.beginPath();
    for (let i = 0; i <= 200; ++i) {
      const x = i / 200, f = Math.exp(LO + x * (HI - LO));
      const [px, py] = project(x, 0, Math.min(1.25, levelOf(filter(f, now.fc, now.k))));
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.stroke(); g.setLineDash([]);
    const [cx, cy] = project(xOf(now.fc), 0, 0);
    g.fillStyle = rgba(AMBER, 0.9); g.beginPath(); g.arc(cx, cy, 3, 0, 2 * Math.PI); g.fill();

    // what it is: the note, the cutoff, the amplifier
    const fs = Math.max(10, H * 0.045);
    g.font = `${fs}px "JetBrains Mono", monospace`;
    g.fillStyle = rgba(PHOS, 0.9);
    g.fillText(now.env > 1e-4 ? `${noteName(now.f0)}  ${hz(now.f0)}` : "rest", W * 0.05, fs * 1.6);
    g.fillStyle = rgba(PHOS, 0.55);
    g.fillText(`${WAVES[now.wave] || ""} · amp ${now.env.toFixed(2)}`, W * 0.05, fs * 2.9);
    g.fillStyle = rgba(AMBER, 0.85);
    const t = `chisel ${hz(now.fc)}`;
    g.fillText(t, W * 0.95 - g.measureText(t).width, fs * 1.6);
  }

  return { mount, frame };
})();
if (typeof module !== "undefined") module.exports = SimpleSynthScope;
