// Haptic Handwheel — feel engine.
// One knob: a motor that senses and pushes, a cap, a hand. Plain script, no
// imports, so the same text runs inlined in feel-lab.html and in node
// (render_feel_lab.mjs loads it with new Function). Nothing here has met
// hardware. Every number marked ASSUMED is a guess waiting for a bench.

function makeEngine(opts) {
  const P = Object.assign({
    fs: 48000,          // physics steps per second
    loopHz: 10000,      // how often the feel is computed (device loop)
    delayMs: 0,         // extra transport delay between sensing and pushing
    capMass: 0.040,     // kg; light 80 mm printed cap (Loudon leans light)
    capR: 0.040,        // m; cap radius
    Jrotor: 3e-5,       // kg·m²; ASSUMED rotor inertia, GM5208 figure not found
    bMotor: 1e-4,       // N·m·s/rad; ASSUMED viscous loss of motor + bearings
    tauC: 0.003,        // N·m; ASSUMED dry friction + cogging floor
    tauMax: 0.2,        // N·m; firmware clamp (motor rated 0.18–0.25)
    handK: 0.48,        // N·m/rad; ASSUMED fingertip grip (~300 N/m at the rim)
    handB: 0.0032,      // N·m·s/rad; ASSUMED fingertip damping (~2 N·s/m at the rim)
    quantize: true,     // 14-bit encoder, AS5048A
    semisPerTurn: 24,   // pitch range of one full turn
    basePitch: 45,      // MIDI note at angle 0 (A2)
  }, opts || {});

  const J = P.Jrotor + 0.5 * P.capMass * P.capR * P.capR;
  const dt = 1 / P.fs;
  const q = (2 * Math.PI) / 16384;
  const s = {
    th: 0, om: 0, t: 0,
    hand: false, handTarget: 0, brake: 0, // brake = finger friction, N·m·s/rad
    extTorque: 0,                         // scripted extra push (a flick)
    tauHeld: 0, tauFeel: 0, tauHand: 0,
    sensedTh: 0, sensedOm: 0, lastSensedTh: 0,
    nextTick: 0, queue: [],
  };
  const eng = { P, J, s, feel: null };

  eng.setFeel = (f) => { eng.feel = f; if (f && f.reset) f.reset(eng); };
  eng.pitch = () => P.basePitch + (s.th / (2 * Math.PI)) * P.semisPerTurn;

  eng.step = () => {
    // the device loop: sense, compute the feel, send it down the (maybe slow) wire
    if (s.t >= s.nextTick) {
      const Tl = 1 / P.loopHz;
      const th = P.quantize ? Math.round(s.th / q) * q : s.th;
      const omRaw = (th - s.lastSensedTh) / Tl;
      s.sensedOm += 0.25 * (omRaw - s.sensedOm); // light smoothing of a noisy difference
      s.lastSensedTh = th; s.sensedTh = th;
      let tau = eng.feel ? eng.feel.torque(eng, Tl) : 0;
      tau = Math.max(-P.tauMax, Math.min(P.tauMax, tau));
      s.tauFeel = tau;
      s.queue.push([s.t + P.delayMs / 1000, tau]);
      s.nextTick += Tl;
    }
    while (s.queue.length && s.queue[0][0] <= s.t) s.tauHeld = s.queue.shift()[1];

    s.tauHand = (s.hand ? P.handK * (s.handTarget - s.th) - P.handB * s.om : 0) - s.brake * s.om;
    const tauLoss = -P.bMotor * s.om - P.tauC * Math.tanh(s.om / 0.05);
    s.om += ((s.tauHeld + s.tauHand + tauLoss + s.extTorque) / J) * dt;
    s.th += s.om * dt;
    s.t += dt;
  };
  return eng;
}

// ── The feels. Each returns torque from what the device senses; some keep
// their own state (a melody, a platter, an LFO). Sound comes from voice().

const TAU = 2 * Math.PI;

const FEELS = {
  // Pitch you can lean on: a pull toward the nearest in-tune semitone.
  frets: (o) => Object.assign({
    name: 'frets', peak: 0.03, damp: 0.0,
    torque(e) {
      const sp = e.P.semisPerTurn / TAU; // semitones per radian
      return -this.peak * Math.sin(TAU * sp * e.s.sensedTh) - this.damp * e.s.sensedOm;
    },
    voice: (e) => ({ midi: e.pitch(), amp: 0.5 }),
  }, o),

  // A string that stiffens as it bends; pitch rises with tension.
  string: (o) => Object.assign({
    name: 'string', k1: 0.04, k3: 0.25,
    torque(e) { const x = e.s.sensedTh; return -(this.k1 * x + this.k3 * x * x * x); },
    // tension ~ k1 x + k3 x³; pitch ~ √tension: two semitones at a full ~1 rad bend
    voice(e) {
      const x = Math.abs(e.s.th);
      const tens = 1 + (this.k1 * x + this.k3 * x * x * x) / 0.12;
      return { midi: 52 + 6 * Math.log2(tens), amp: 0.5 };
    },
  }, o),

  // The modulation, played into the hand: an LFO pushes, a soft spring centres.
  lfo: (o) => Object.assign({
    name: 'lfo', rate: 3, amp: 0.02, k: 0.08,
    torque(e) { return this.amp * Math.sin(TAU * this.rate * e.s.t) - this.k * e.s.sensedTh; },
    voice(e) { return { midi: 57 + 0.5 * Math.sin(TAU * this.rate * e.s.t), amp: 0.5 }; },
  }, o),

  // The pitch itself: the note the synth plays, pushed into the cap as torque.
  pitch: (o) => Object.assign({
    name: 'pitch', midi: 55, amp: 0.005, k: 0.03,
    hz() { return 440 * Math.pow(2, (this.midi - 69) / 12); },
    torque(e) { return this.amp * Math.sin(TAU * this.hz() * e.s.t) - this.k * e.s.sensedTh; },
    voice(e) { return { midi: this.midi, amp: 0.5 }; },
  }, o),

  // The lock: the knob sets an LFO's rate; beat clicks are pushed into the hand.
  // Near a synced rate the rate is pulled in (a magnet in log-rate) and the LFO's
  // phase is pulled toward the beat (Kuramoto, one oscillator pulled by a clock).
  lock: (o) => Object.assign({
    name: 'lock', bpm: 100, lfoAmp: 0.015, clickAmp: 0.05, clickMs: 6,
    magnet: 0.02, couple: 1.5, phi: 0, clicks: [],
    reset() { this.phi = 0; this.clicks = []; this.lastBeat = -1; },
    beatHz() { return this.bpm / 60; },
    // 1 turn = 4 octaves of rate, centred on the beat rate
    rate(th) { return this.beatHz() * Math.pow(2, (th / TAU) * 4); },
    torque(e, Tl) {
      const th = e.s.sensedTh, oct = (th / TAU) * 4;
      // magnet toward whole octaves of the beat rate (×¼ … ×4)
      const magnet = -this.magnet * Math.sin(TAU * oct);
      let r = this.rate(th);
      const beatPh = e.s.t * this.beatHz();
      const ratio = Math.round(r / this.beatHz() * 4) / 4 || 0.25; // nearest synced multiple
      const target = beatPh * ratio;
      this.phi += Tl * (r + this.couple * Math.sin(TAU * (target - this.phi)));
      let tau = this.lfoAmp * Math.sin(TAU * this.phi) + magnet;
      const b = Math.floor(beatPh);
      if (b !== this.lastBeat) { this.lastBeat = b; this.clicks.push(this.phi % 1); if (this.clicks.length > 24) this.clicks.shift(); }
      if (beatPh - b < (this.clickMs / 1000) * this.beatHz()) tau += this.clickAmp * Math.sin(Math.PI * (beatPh - b) / ((this.clickMs / 1000) * this.beatHz()));
      return tau;
    },
    voice(e) {
      const beatPh = e.s.t * this.beatHz(), fr = beatPh - Math.floor(beatPh);
      return { midi: 57, amp: 0.35 * (0.55 + 0.45 * Math.sin(TAU * this.phi)), click: fr < 0.02 ? 1 - fr / 0.02 : 0 };
    },
  }, o),

  // Haptic filtering: the knob turns itself to each note of a melody; the hand
  // can brake it (slower glide) or wiggle it (vibrato). Sound follows the knob.
  follow: (o) => Object.assign({
    name: 'follow', k: 0.25, damp: 0.004, notes: [0, 3, 7, 5, 3, 10, 7, 12], secPerNote: 0.6,
    target(e) {
      const i = Math.floor(e.s.t / this.secPerNote) % this.notes.length;
      return (this.notes[i] / e.P.semisPerTurn) * TAU;
    },
    torque(e) { return this.k * (this.target(e) - e.s.sensedTh) - this.damp * e.s.sensedOm; },
    voice: (e) => ({ midi: e.pitch(), amp: 0.5 }),
  }, o),

  // The struck spring: strike it, let it wobble down into pitch, damp with a finger.
  // 'spring' rings at one rate all the way down; 'pendulum' (sin law) starts slow
  // at a big swing and quickens as it settles.
  struck: (o) => Object.assign({
    name: 'struck', law: 'spring', k: 0.085, damp: 0, rest: 0,
    torque(e) {
      const x = e.s.sensedTh - this.rest;
      const f = this.law === 'pendulum' ? Math.sin(x) : x;
      return -this.k * f - this.damp * e.s.sensedOm;
    },
    voice: (e) => ({ midi: e.pitch(), amp: 0.5 }),
  }, o),

  // The turntable: the motor holds 33⅓ rpm with a capped torque; the hand brakes.
  turntable: (o) => Object.assign({
    name: 'turntable', rpm: 100 / 3, kv: 0.01, cap: 0.06,
    omega() { return (this.rpm / 60) * TAU; },
    torque(e) { return Math.max(-this.cap, Math.min(this.cap, this.kv * (this.omega() - e.s.sensedOm))); },
    voice(e) { return { rate: e.s.om / this.omega(), amp: 0.5 }; },
  }, o),
};
