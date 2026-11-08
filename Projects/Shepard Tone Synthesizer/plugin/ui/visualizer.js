// visualizer.js — Shepard Tone's picture for the CRT: Escher's staircase, seen two ways.
//
// Roger Shepard drew pitch as a helix: once round the circle is one octave (the pitch
// class, the chroma), and height is which octave. The ten voices of this instrument
// are ten beads on that helix, an octave apart, one above the other. The helix is cut
// into treads, one per semitone, so it is a staircase: ten turns of twelve steps.
//
//  - The lamp is the window: a band of amber light at the height of `center`, `width`
//    octaves tall. It lights the treads it passes and the beads inside it. A bead's
//    brightness is exactly that voice's loudness in the sound.
//  - The camera breathes between two views. From the SIDE the staircase is what the
//    physics is: finite, ten turns, a floor and a ceiling, and you can see the top bead
//    drop to the floor when it wraps (a red seam flashes). From ABOVE every turn lies
//    on one circle of twelve steps: Escher's Ascending and Descending, the staircase
//    that climbs forever and arrives where it began. That view is what the ear hears.
//  - Each bead leaves a short trail, so a glide or a climb draws its own path.
//  - Drag up or down on the glass to move the lamp: that is the Window knob, with
//    automation and undo. Drag sideways to turn the staircase by hand.
//
// Contract with the editor (VST Template machinery/ui/editor.html, § the CRT's picture):
//   ShepardStair.mount(el, hooks)            draws into el; hooks { get, set, begin, end }
//   ShepardStair.frame(probes, params, dt)   probes: [env, climb_pos, s0..s9] (kProbes);
//                                            params: { id: value }
// Nothing is fetched.
const ShepardStair = (() => {
  const N = 10, LO = 12, TRAIL = 26;
  const NOTE = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  const PHOS = [124, 255, 178], AMBER = [255, 179, 71], RED = [255, 84, 84];
  let el = null, cv = null, g = null, W = 0, H = 0, dpr = 1, hooks = null;
  let t = 0, yaw = 0.6, yawHand = 0, tilt = 0.3;
  const voices = Array.from({ length: N }, () => ({ s: 60, trail: [], flash: 0, from: null }));
  let env = 0, center = 440, width = 1.4, climb = 0, wrapFlash = 0, played = null;

  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a))})`;
  const octOf = s => (s - LO) / 12;                         // height on the stair, 0..10
  const centerOct = () => Math.log2(center / 440) + (69 - LO) / 12;
  const lampAt = oct => Math.exp(-((oct - centerOct()) ** 2) / (2 * width * width));

  // a point on the stair: pitch s → (angle, height); then the camera
  function world(s, r) {
    const a = 2 * Math.PI * (s - LO) / 12, y = octOf(s) - N / 2;
    return [r * Math.cos(a), y, r * Math.sin(a)];
  }
  function project(p) {
    const cy = Math.cos(yaw + yawHand), sy = Math.sin(yaw + yawHand);
    let x = p[0] * cy - p[2] * sy, z = p[0] * sy + p[2] * cy, y = p[1] * 0.42;
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const y2 = y * ct - z * st, z2 = y * st + z * ct;
    const d = 9 / (9 + z2);
    const sc = Math.min(W, H) * 0.30;
    return [W / 2 + x * sc * d, H * 0.53 - y2 * sc * d, d, z2];
  }

  function mount(target, h) {
    el = target; hooks = h || null;
    cv = document.createElement("canvas");
    cv.style.cssText = "width:100%;height:100%;display:block;cursor:ns-resize";
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
    let drag = null;
    cv.addEventListener("pointerdown", e => {
      cv.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, y: e.clientY, c: center, yaw: yawHand };
      if (hooks) hooks.begin("center");
    });
    cv.addEventListener("pointermove", e => {
      if (!drag) return;
      yawHand = drag.yaw + (e.clientX - drag.x) * 0.01;
      const c = Math.max(80, Math.min(2000, drag.c * Math.pow(2, -(e.clientY - drag.y) / (H * 0.12))));
      center = c;
      if (hooks) hooks.set("center", c);
    });
    const up = () => { if (drag && hooks) hooks.end("center"); drag = null; };
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
  }

  function frame(probes, params, dt) {
    params = params || {}; dt = dt || 1 / 60;
    t += dt;
    env = probes[0] || 0;
    center = params.center || center;
    width = params.width || width;
    climb = params.climb || 0;
    // the camera breathes: 14 s from the side to above and back, and turns slowly
    tilt = 0.18 + 1.22 * (0.5 - 0.5 * Math.cos(2 * Math.PI * t / 14));
    yaw += dt * 0.12;
    let loud = -1, best = 0;
    for (let k = 0; k < N; ++k) {
      const s = probes[2 + k], v = voices[k];
      if (!(s > 0)) continue;
      if (v.trail.length && s - v.trail[0] < -60) {      // dropped to the floor: the wrap
        v.flash = 1; v.from = v.trail[0]; wrapFlash = 1; v.trail = [];
      }
      v.s = s;
      v.trail.unshift(s);
      if (v.trail.length > TRAIL) v.trail.pop();
      v.flash = Math.max(0, v.flash - dt * 1.6);
      const l = lampAt(octOf(s));
      if (l > best) { best = l; loud = s; }
    }
    wrapFlash = Math.max(0, wrapFlash - dt * 1.6);
    played = loud;
    draw();
  }

  function draw() {
    if (!g || !W || !H) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = "#020604"; g.fillRect(0, 0, W, H);
    const R = 1.5;
    const above = (tilt - 0.18) / 1.22;   // 0 side, 1 above

    // the lamp: a glowing ring at the window's height, and its band's edges
    const co = centerOct();
    for (const [off, a] of [[0, 0.5], [-width, 0.12], [width, 0.12]]) {
      const oct = co + off;
      if (oct < 0 || oct > N) continue;
      g.strokeStyle = rgba(AMBER, a * (1 - 0.6 * above)); g.lineWidth = off ? 1 : 2;
      g.setLineDash(off ? [3, 5] : []);
      g.beginPath();
      for (let i = 0; i <= 72; ++i) {
        const s = LO + oct * 12 + i / 6;
        const w = world(s, R * 1.18); w[1] = oct - N / 2;
        const [x, y] = project(w);
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    }
    g.setLineDash([]);

    // the staircase: 120 treads and their risers, lit by the lamp
    const segs = [];
    for (let j = 0; j < 12 * N; ++j) {
      const s = LO + j, lit = lampAt(octOf(s + 0.5));
      const a = project(world(s, R)), b = project(world(s + 1, R));
      const yTop = octOf(s) - N / 2;
      const a2 = project([R * Math.cos(2 * Math.PI * (j + 1) / 12), yTop + 1 / 12, R * Math.sin(2 * Math.PI * (j + 1) / 12)]);
      // tread: flat from a to (b at a's height); riser: up to b
      const bFlat = project([R * Math.cos(2 * Math.PI * (j + 1) / 12), yTop, R * Math.sin(2 * Math.PI * (j + 1) / 12)]);
      segs.push({ z: (a[3] + b[3]) / 2, a, bFlat, b: a2, lit });
    }
    segs.sort((p, q) => q.z - p.z);
    for (const sg of segs) {
      const depth = Math.max(0.25, Math.min(1, sg.a[2]));
      const base = 0.07 + 0.25 * above;   // from above every turn overlaps into one bright circle
      g.strokeStyle = sg.lit > 0.02 ? rgba(AMBER, (0.08 + 0.7 * sg.lit) * depth) : rgba(PHOS, base * depth);
      g.lineWidth = 1 + 1.6 * sg.lit;
      g.beginPath(); g.moveTo(sg.a[0], sg.a[1]); g.lineTo(sg.bFlat[0], sg.bFlat[1]); g.lineTo(sg.b[0], sg.b[1]); g.stroke();
    }

    // the seam: where a voice drops from the ceiling to the floor
    for (const v of voices) {
      if (v.flash <= 0 || v.from === null) continue;
      const p = project(world(v.from, R)), q = project(world(v.s, R));
      g.strokeStyle = rgba(RED, 0.8 * v.flash); g.lineWidth = 1.5; g.setLineDash([4, 4]);
      g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); g.setLineDash([]);
    }

    // the voices: beads with trails, as bright as they are loud
    for (const v of voices) {
      const lit = lampAt(octOf(v.s)) * (0.25 + 0.75 * env);
      for (let i = v.trail.length - 1; i >= 1; --i) {
        const p = project(world(v.trail[i], R)), q = project(world(v.trail[i - 1], R));
        g.strokeStyle = rgba(PHOS, lit * 0.6 * (1 - i / TRAIL)); g.lineWidth = 2;
        g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke();
      }
      const [x, y, d] = project(world(v.s, R));
      const r = (2 + 7 * lit) * d;
      g.shadowColor = rgba(v.flash > 0 ? RED : PHOS, 0.9); g.shadowBlur = 4 + 18 * lit;
      g.fillStyle = v.flash > 0.05 ? rgba(RED, 0.5 + 0.5 * v.flash) : rgba(PHOS, 0.18 + 0.82 * lit);
      g.beginPath(); g.arc(x, y, r, 0, 2 * Math.PI); g.fill();
      g.shadowBlur = 0;
    }

    // what it is
    const fs = Math.max(10, Math.min(H * 0.042, W * 0.026));
    g.font = `${fs}px "JetBrains Mono", monospace`;
    g.fillStyle = rgba(PHOS, 0.9);
    const pc = played !== null && played > 0 ? NOTE[((Math.round(played) % 12) + 12) % 12] : "—";
    g.fillText(env > 1e-3 ? `${pc} · all octaves` : "rest", W * 0.04, fs * 1.6);
    g.fillStyle = rgba(AMBER, 0.85);
    const lamp = `${center >= 1000 ? (center / 1000).toFixed(2) + " kHz" : Math.round(center) + " Hz"} · ${width.toFixed(1)} oct`;
    g.fillText(lamp, W * 0.96 - g.measureText(lamp).width, fs * 1.6);
    if (climb) {
      const c = `climb ${climb > 0 ? "+" : ""}${climb.toFixed(1)} st/s`;
      g.fillStyle = rgba(PHOS, 0.6); g.fillText(c, W * 0.96 - g.measureText(c).width, fs * 2.9);
    }
    g.fillStyle = rgba(PHOS, 0.45);
    const cap = above > 0.6 ? "from above: endless"
              : above < 0.4 ? "from the side: finite"
              : "";
    if (cap) g.fillText(cap, W * 0.04, H - fs * 0.9);
    if (wrapFlash > 0) {
      g.fillStyle = rgba(RED, wrapFlash);
      const w = "wrap";
      g.fillText(w, W * 0.96 - g.measureText(w).width, H - fs * 0.9);
    }
  }

  return { mount, frame };
})();
if (typeof module !== "undefined") module.exports = ShepardStair;
