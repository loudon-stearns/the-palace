// The chase room's core: a show on GoButton's TIMECODE track, sent down a cable, read by GoButton's
// reader, and chased by three desks. Pure: give it the LTC library and the settings, it gives back
// the wire, what the reader named and when, what every desk did, and when every cue fired.
// The page runs it in the browser; check.mjs runs the same text in Node.
//
// Everything about LTC itself is ltc.js, GoButton's specification: the runs and their Pre-Rolls
// (runs, split), the encoder, the reader. What is modelled here is only the desk: how many frames in a
// row it waits for before it trusts the clock (trust), how long it runs on alone when the clock goes
// quiet (freewheel), and whether it adds the frame every reader is late (present).
function chaseShow(L, o) {
  const SR = o.sampleRate || 48000, RATE = L.RATES['30'], FRAME = SR / 30, SPB = 0.5; // 120 bpm
  const secondsAt = (beat) => beat * SPB;

  // 1. the TIMECODE track: clips named as GoButton names them, in beats
  const clips = [];
  let t = 0.5;
  const clip = (len, name) => { clips.push({ start: t / SPB, end: (t + len) / SPB, name }); t += len; };
  if (o.preRoll > 0) clip(o.preRoll, 'Pre-Roll');
  clip(6, '01:00:00:00');
  if (o.betweenPreRoll > 0) clip(o.betweenPreRoll, 'Pre-Roll');
  clip(4, '02:00:00:00');
  const length = Math.round((t + 0.5) * SR);
  const { runs } = L.runs(clips, secondsAt, RATE);

  // 2. the wire: each run's encoder, from its first count to its last; silence between
  const y = new Float32Array(length), playing = new Int32Array(length).fill(-1), startOf = new Map();
  for (const run of runs) {
    const a = Math.round(secondsAt(run.start) * SR), b = Math.min(length, Math.round(secondsAt(run.end) * SR));
    const s = L.split(run.from), e = L.newEncoder(RATE, SR, s.frame, s.phase);
    for (let i = a; i < b; i++) {
      if (!startOf.has(e.frame)) startOf.set(e.frame, i);
      playing[i] = e.frame;
      y[i] = 0.5 * L.encodeSample(e);
    }
  }
  const song1 = runs[0], at1 = (tcText) => Math.round((secondsAt(song1.clipStart) + (L.toFrames(L.parse(tcText), RATE) - song1.zero) / 30) * SR);
  // the fault, placed at 01:00:03:00 on the wire
  const faultAt = at1('01:00:03:00');
  if (o.fault === 'stop') {
    // the show stops at 01:00:03:00 and the operator goes straight to the next song
    const next = Math.round(secondsAt(runs[1].start) * SR);
    y.fill(0, faultAt, next); playing.fill(-1, faultAt, next);
    for (const [f, i] of startOf) if (i >= faultAt && i < next) startOf.delete(f);
  } else if (o.fault && o.fault.startsWith('dropout')) {
    const len = Math.round((o.fault === 'dropout-1s' ? 30 : Number(o.fault.split('-')[1])) * FRAME);
    y.fill(0, faultAt, faultAt + len);
  }
  // the standard's soft edge, 25 µs
  const k = 1 - Math.exp(-2.2 / (25e-6 * SR)); let z = 0;
  for (let i = 0; i < length; i++) y[i] = (z += k * (y[i] - z));

  // 3. the reader: GoButton's, every sample; with check, a frame counts only when it follows the last
  const d = L.newDecoder(SR), named = [];
  let prev = null;
  for (let i = 0; i < length; i++) {
    const tc = L.decodeSample(d, y[i]);
    if (!tc) continue;
    const n = L.toFrames(tc, RATE), follows = prev !== null && n === prev + 1;
    prev = n;
    if (o.check && !follows) continue;
    named.push({ at: i, n, text: L.text(tc) });
  }

  // 4. the desks
  const cues = [
    { name: 'house to black', n: L.toFrames(L.parse('01:00:00:00'), RATE) },
    { name: 'song 1, the hit', n: L.toFrames(L.parse('01:00:03:10'), RATE) },
    { name: 'song 2, its look', n: L.toFrames(L.parse('02:00:00:00'), RATE) },
  ];
  const desks = o.desks.map((desk) => {
    const s = { mode: 'waiting', time: 0, run: 0, last: null, lastAt: -1e9, fwFrom: 0 };
    const states = [], fired = [];   // states: [{ from, mode }], fired: [{ cue, at }]
    const setMode = (i, m) => { if (s.mode !== m || !states.length) { s.mode = m; states.push({ from: i, mode: m }); } };
    setMode(0, 'waiting');
    const shown = new Float32Array(Math.ceil(length / 160));  // the desk's time every 160 samples, -1 when it has none
    let ev = 0;
    for (let i = 0; i < length; i++) {
      const before = s.time, running = s.mode === 'locked' || s.mode === 'freewheel';
      if (running) s.time += 1 / FRAME;
      while (ev < named.length && named[ev].at === i) {
        const e = named[ev++];
        s.run = s.last !== null && e.n === s.last + 1 && i - s.lastAt < 2.5 * FRAME ? s.run + 1 : 1;
        s.last = e.n; s.lastAt = i;
        if (s.run >= desk.trust) {
          const target = e.n + (desk.present ? 1 : 0);
          if (!running || Math.abs(s.time - target) > 0.5) {
            // a lock, or a jump: the desk takes the new time and fires the cue it should already be in
            const from = running ? s.time : -Infinity;
            s.time = target;
            for (const c of cues) if (c.n <= target && c.n > from && target - c.n < 300 && !fired.some((f) => f.cue === c.name)) fired.push({ cue: c.name, at: i, jumped: true });
          } else s.time = target;
          setMode(i, 'locked');
        } else if (s.mode === 'waiting' || s.mode === 'lost') setMode(i, 'locking');
      }
      if (s.mode === 'locked' && i - s.lastAt > 1.5 * FRAME) { setMode(i, 'freewheel'); s.fwFrom = i; }
      if (s.mode === 'freewheel' && i - s.fwFrom > desk.freewheel * FRAME) setMode(i, 'lost');
      if (running && (s.mode === 'locked' || s.mode === 'freewheel')) {
        for (const c of cues) if (before < c.n && s.time >= c.n && !fired.some((f) => f.cue === c.name)) fired.push({ cue: c.name, at: i });
      }
      if (i % 160 === 0) shown[i / 160] = (s.mode === 'locked' || s.mode === 'freewheel' || s.mode === 'lost') ? s.time : -1;
    }
    const report = cues.map((c) => {
      const f = fired.find((x) => x.cue === c.name), wire = startOf.get(c.n);
      if (!f) return { cue: c.name, verdict: wire === undefined ? 'never played, never fired' : 'missed', late: null };
      if (wire === undefined || playing[f.at] < 0) return { cue: c.name, verdict: 'fired, but the show had stopped', late: null, at: f.at };
      const late = Math.round((f.at - wire) / FRAME);
      return { cue: c.name, verdict: late <= 0 ? 'on time' : late === 1 ? '1 frame late' : late + ' frames late', late, at: f.at };
    });
    return { name: desk.name, states, fired, report, shown };
  });
  return { SR, FRAME, length, y, playing, runs, clips, named, desks, cues, faultAt, text: (n) => L.text(L.fromFrames(n, RATE)) };
}
if (typeof module === 'object' && module.exports) module.exports = { chaseShow };
