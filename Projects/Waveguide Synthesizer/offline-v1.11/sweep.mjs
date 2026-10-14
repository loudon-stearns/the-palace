import { loadSrc, engine, summarize, periodicity, rms } from './bow_lab.mjs';
const base = loadSrc('../study-v1.10-the-overtones-run-sharp/index.html');
const OLD = `        const slip = vBowMax * this.bowEnv - vIn;
        const g = Math.min(1, Math.pow(Math.abs(slip * slope) + 0.75, -4));
        this.bowOff += slip * g;`;
if (!base.includes(OLD)) throw 'no anchor';
export function variant(cfg) {
  if (cfg.base) return base;
  const NEW = `        const vb = vBowMax * this.bowEnv, A = vb - vIn, aA = Math.abs(A), sA = A < 0 ? -1 : 1;
        const Fm = ${cfg.Fscale} * Math.pow(0.26 / Math.max(0.04, Math.min(this.bowPos, 1 - this.bowPos)), ${cfg.bexp||0}) * vRef * Math.pow(${cfg.Fhi / cfg.Flo}, this.bowForce) * ${cfg.Flo} * this.bowEnv, v0 = ${cfg.v0} * vRef, rr = ${cfg.r};
        const Ap = aA - Fm * rr, C = Fm * (1 - rr), disc = (v0 - Ap) * (v0 - Ap) + 4 * v0 * (Ap - C);
        const xs = disc >= 0 ? 0.5 * (Ap - v0 + Math.sqrt(disc)) : -1;
        let dl, slip, g;
        if ((this.bowSlipping && xs > 0) || aA > Fm) { dl = sA * Fm * (rr + (1 - rr) * v0 / (v0 + Math.max(0, xs))); slip = sA * Math.max(0, xs); g = Math.min(0.97, aA > 0 ? Math.abs(dl) / aA : 0); this.bowSlipping = true; }
        else { dl = A; slip = 0; g = 1; this.bowSlipping = false; }
        this.bowOff += dl;`;
  return base.replace(OLD, NEW);
}
export function bowAt(src, o) {
  const p = engine(src); p.send({ type: 'params', freq: o.freq || 196 }); p.send({ type: 'view', mode: 'strobe' });
  p.send({ type: 'bow', on: true, speed: o.speed ?? 0.5, force: o.force ?? 0.7, position: o.position ?? 0.74 });
  const x = p.run(o.sec || 1.5); const t = p.posts.filter(m => m.type === 'bowtrace').pop();
  return { ...o, ...summarize(t), periodic: periodicity(x, o.freq || 196), dB: +rms(x).toFixed(1), x, t };
}
if (process.argv[1] && process.argv[1].endsWith("sweep.mjs")) {
  const cfg = JSON.parse(process.argv[2] || '{"Fscale":1,"Flo":0.05,"Fhi":20,"v0":0.1,"r":0.4}');
  const src = variant(cfg); const rows = [];
  for (const position of [0.5, 0.6, 0.74, 0.85, 0.93]) rows.push(bowAt(src, { sweep: 'pos', position }));
  for (const force of [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1.0]) rows.push(bowAt(src, { sweep: 'force', force }));
  for (const speed of [0.1, 1.0]) rows.push(bowAt(src, { sweep: 'speed', speed }));
  for (const freq of [82, 440, 659]) rows.push(bowAt(src, { sweep: 'pitch', freq }));
  console.table(rows.map(({ x, t, ...r }) => r));
}
