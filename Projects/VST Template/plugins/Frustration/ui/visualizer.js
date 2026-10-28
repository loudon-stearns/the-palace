// visualizer.js — Frustration's picture for the CRT: the loom.
//
// One tone of N partials shares a single fundamental. N outside voices sit on the plain
// harmonic series and each pulls on its own partial. Stretch B bends the partials off
// the whole numbers, so they cannot all be where their voices want them at once. That
// is the frustration, and the loom draws it:
//
//  - Along the top hang the voices, one peg per harmonic, at k·f0 (each with the small
//    detune Algorithm.h gives it, DET below, so the picture and the sound agree).
//  - Along the bottom runs the tone: one rod, every partial fixed to it at r_k·fundamental,
//    where r_k = k·sqrt((1 + B·k²) / pin). It is one rod: when the fundamental moves, every
//    partial moves with it. That is why the voices fight.
//  - A thread runs from each peg to its partial. The model's own lock test decides how it
//    is drawn: voice k can hold partial k while their mismatch |r_k·fundamental − w_k| is
//    under the coupling K (Hz). Held, the thread is taut and green, brighter the easier
//    the hold. Slipping, it is amber and sways at the slip rate, sqrt(mismatch² − K²),
//    slowed for the eye (3 Hz at most; the real slip can run to hundreds). Past 4 kHz of
//    mismatch the model's gate lets go entirely, and the thread is cut.
//  - Underneath, the fundamental itself over the last three seconds, around the pitch you
//    set, with the band the pad's map calls the edge (±0.5 Hz of wobble, the standard
//    deviation over 2 s, the same measure edgemap.py drew the backdrop from). Under it
//    the tone holds; over it the tone is tearing.
//
// What the picture computes itself (the mismatches, the threads) comes from the live
// fundamental and the knobs, not from the voices' true phases, which the plugin does not
// send. The lock test is exact for the model's equation; the sway is a drawing of it.
//
// Contract with the editor (VST Template machinery/ui/editor.html, § the CRT's picture):
//   FrustrationLoom.mount(el)                 draws into el (window.editorScreen)
//   FrustrationLoom.frame(probes, params, dt) probes: [fundamental] (kProbes);
//                                             params: { id: value }, a menu as its index
// Reads window.editorProbes.h (every frame since the last event) for the wobble when the
// plugin sends it. Nothing is fetched.
const FrustrationLoom = (() => {
  const DET = [1.0010008, 1.0031777, 1.0022055, 0.9978017, 0.9984013, 1.0029884, 0.9960421, 1.0025698, 1.0023766, 0.9997435, 0.9984243, 0.9982274, 0.9980390, 0.9995606, 1.0000364, 1.0004280, 1.0039640, 1.0023413, 1.0009774, 1.0039117, 0.9977225, 0.9972817, 1.0009003, 0.9963515, 0.9962854, 1.0001191, 0.9997296, 1.0033373, 1.0010338, 1.0001129, 0.9999750, 0.9979801, 0.9960944, 0.9975392, 1.0015363, 0.9976049, 0.9989563, 0.9960299, 1.0026404, 0.9972357, 0.9981408, 1.0030427, 1.0000783, 1.0027772, 1.0011177, 1.0019342, 0.9967320, 1.0003292, 1.0000622, 1.0029707, 0.9988901, 1.0007855, 0.9964740, 0.9991011, 0.9985843, 0.9972016, 1.0025307, 0.9990356, 1.0038300, 1.0007199, 1.0008405, 1.0011040, 1.0014116, 0.9972063, 0.9995225, 0.9979165, 0.9992200, 0.9967736, 1.0037426, 0.9977200, 1.0013741, 0.9984034, 1.0029926, 1.0012977, 0.9970529, 1.0027606, 1.0035596, 1.0032313, 1.0005578, 0.9971637, 0.9975397, 1.0034232, 1.0004186, 0.9974444, 1.0030725, 1.0011326, 1.0005576, 0.9990103, 0.9992876, 0.9979159, 0.9963045, 1.0030098, 0.9997418, 1.0003811, 0.9985773, 1.0020106];
  const NS = [40, 64, 96], EDGE = 0.5, SPAN = 3.0, WIN = 2.0;
  const PHOS = [124, 255, 178], AMBER = [255, 179, 71], RED = [255, 96, 80], INK = [190, 205, 196];
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  let el = null, cv = null, g = null, W = 0, H = 0, dpr = 1;
  const sway = new Float64Array(96);           // each slipping thread's drawn phase, in turns
  const hist = [];                             // { t, v }: the fundamental, newest last
  let clock = 0, lastF = 0;

  function mount(target) {
    el = target;
    cv = document.createElement("canvas");
    el.append(cv);
    g = cv.getContext("2d");
    const fit = () => {
      dpr = window.devicePixelRatio || 1;
      W = el.clientWidth; H = el.clientHeight;
      if (!W || !H) return;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = "#000"; g.fillRect(0, 0, W, H);
    };
    new ResizeObserver(fit).observe(el);
    fit();
  }

  function listen(probes, dt) {   // keep the fundamental's last few seconds
    const ev = window.editorProbes, h = ev && Array.isArray(ev.h) ? ev.h : null;
    if (h && h.length && ev.rate > 0) {
      for (const f of h) { clock += 1 / ev.rate; hist.push({ t: clock, v: +f[0] }); }
    } else { clock += dt; hist.push({ t: clock, v: +probes[0] }); }
    while (hist.length && hist[0].t < clock - SPAN) hist.shift();
  }
  function wobble() {             // standard deviation over the last 2 s, as edgemap.py measures it
    let n = 0, s = 0, s2 = 0;
    for (const { t, v } of hist) if (t >= clock - WIN && isFinite(v)) { n++; s += v; s2 += v * v; }
    if (n < 2) return { mean: lastF, sd: 0 };
    const m = s / n;
    return { mean: m, sd: Math.sqrt(Math.max(0, s2 / n - m * m)) };
  }

  function frame(probes, params, dt) {
    if (!g || !W || !H) return;
    const F = +probes[0] || params.f0 || 110;
    lastF = F;
    listen(probes, dt);
    const N = NS[Math.max(0, Math.min(2, Math.round(params.partials || 0)))];
    const B = +params.B, K = Math.max(0, +params.K), f0 = +params.f0 || 110;
    const denom = params.pinned > 0.5 ? 1 + B : 1;
    const amp = k => params.source >= 0.5 ? (1 / k) * Math.min(1, 4 / k) : Math.pow(k, -0.7);

    // phosphor: the last frames fade instead of vanishing, so a slipping thread leaves a smear
    g.globalCompositeOperation = "source-over";
    g.fillStyle = "rgba(0,0,0,0.32)"; g.fillRect(0, 0, W, H);

    const m = Math.max(10, W * 0.04), top = Math.max(16, H * 0.1), bot = H * 0.62;
    g.fillStyle = "#000"; g.fillRect(0, 0, W, top - 1); g.fillRect(0, bot + 6, W, H);   // the words and the trace keep no afterglow
    const span = N + 1.5;                                    // harmonics across the glass
    const X = h => m + (h - 0.25) / span * (W - 2 * m);
    const fs = Math.max(9, Math.min(12, H * 0.035));
    g.font = `${fs}px "JetBrains Mono", ui-monospace, monospace`;

    // the voices' pegs and the tone's rod
    g.strokeStyle = rgba(INK, 0.35); g.lineWidth = 1;
    g.beginPath(); g.moveTo(X(0.5), top); g.lineTo(X(N + 0.5), top); g.stroke();
    let held = 0, cut = 0, lastX = X(1);
    g.globalCompositeOperation = "lighter";
    for (let k = 1; k <= N; ++k) {
      const r = k * Math.sqrt((1 + B * k * k) / denom);
      const w = k * f0 * DET[k - 1];
      const beat = r * F - w, ab = Math.abs(beat);
      const gate = Math.max(0, Math.min(1, (4000 - ab) / 1000));
      const xt = X(k * DET[k - 1]), xb = X(r * F / f0), a = amp(k);
      const weight = 0.55 + 0.45 * Math.min(1, a * 2.2);
      if (xb < W + 40) lastX = Math.max(lastX, Math.min(W - m, xb));
      if (gate <= 0) {                                       // the gate has let go: the thread is cut
        cut++;
        g.strokeStyle = rgba(RED, 0.35); g.setLineDash([2, 3]);
        g.beginPath(); g.moveTo(xt, top); g.lineTo(xt + (xb > xt ? 6 : -6), top + (bot - top) * 0.25); g.stroke();
        g.setLineDash([]);
        continue;
      }
      if (ab <= K) {                                          // held: taut, brighter the easier
        held++; sway[k - 1] = 0;
        const ease = K > 0 ? 1 - ab / K : 0;
        g.strokeStyle = rgba(PHOS, (0.25 + 0.65 * ease) * weight * gate);
        g.lineWidth = 1 + 0.8 * ease;
        g.beginPath(); g.moveTo(xt, top); g.lineTo(xb, bot); g.stroke();
      } else {                                                // slipping: sways at the slip rate, slowed
        const slip = Math.sqrt(ab * ab - K * K);
        sway[k - 1] = (sway[k - 1] + dt * 3 * Math.tanh(slip / 40)) % 1;
        const bow = Math.min(18, 2 + 4 * Math.log10(1 + slip)) * Math.sin(2 * Math.PI * sway[k - 1]);
        g.strokeStyle = rgba(AMBER, (0.3 + 0.4 * Math.min(1, slip / 200)) * weight * gate);
        g.lineWidth = 1;
        g.beginPath(); g.moveTo(xt, top);
        g.quadraticCurveTo((xt + xb) / 2 + bow, (top + bot) / 2, xb, bot); g.stroke();
      }
      g.fillStyle = rgba(PHOS, 0.25 + 0.6 * Math.min(1, a * 2));   // where the partial sits on the rod
      g.beginPath(); g.arc(xb, bot, 1 + 2.2 * Math.min(1, a * 1.6), 0, 2 * Math.PI); g.fill();
    }
    g.globalCompositeOperation = "source-over";
    for (let k = 1; k <= N; ++k) {                            // pegs over the threads
      g.fillStyle = rgba(INK, 0.7); g.fillRect(X(k * DET[k - 1]) - 1, top - 3, 2, 3);
    }
    g.strokeStyle = rgba(PHOS, 0.8); g.lineWidth = 2;        // the rod: one fundamental for all of them
    g.beginPath(); g.moveTo(X(0.5), bot + 3); g.lineTo(lastX, bot + 3); g.stroke();
    g.fillStyle = rgba(INK, 0.55);
    g.fillText("the voices · k·f0", X(0.5), top - 6);
    g.fillText("the tone · one rod", X(0.5), bot + 3 + fs + 2);

    // the fundamental, over the last three seconds
    const { mean, sd } = wobble();
    const y0 = H * 0.76, y1 = H - Math.max(14, fs * 1.8), mid = (y0 + y1) / 2;
    const range = Math.max(1.5 * EDGE, 3 * sd, 0.2);
    const Y = v => mid - (v - mean) / range * (y1 - y0) / 2;
    const Tx = t => X(0.5) + (t - (clock - SPAN)) / SPAN * (X(N + 0.5) - X(0.5));
    g.fillStyle = rgba(INK, 0.06);                            // the held band: ±0.5 Hz around the mean
    const bandH = Math.min(y1 - y0, EDGE / range * (y1 - y0));
    g.fillRect(X(0.5), mid - bandH / 2, X(N + 0.5) - X(0.5), bandH);
    const tearing = sd > EDGE;
    g.strokeStyle = rgba(tearing ? AMBER : PHOS, 0.9); g.lineWidth = 1.25;
    g.beginPath();
    let first = true;
    for (const { t, v } of hist) {
      if (!isFinite(v)) continue;
      const x = Tx(t), y = Math.max(y0 - 6, Math.min(y1 + 6, Y(v)));
      if (first) { g.moveTo(x, y); first = false; } else g.lineTo(x, y);
    }
    g.stroke();

    const live = N - cut;
    const word = tearing ? "TEARING" : "HELD";
    g.fillStyle = rgba(tearing ? AMBER : PHOS, 0.95);
    const label = `${word}  ±${sd < 0.01 ? sd.toFixed(3) : sd.toFixed(2)} Hz`;
    g.fillText(label, X(N + 0.5) - g.measureText(label).width, y1 + fs + 2);
    g.fillStyle = rgba(INK, 0.7);
    g.fillText(`${F.toFixed(2)} Hz · ${held}/${live} threads held${cut ? ` · ${cut} cut` : ""}`, X(0.5), y1 + fs + 2);
  }

  return { mount, frame };
})();
