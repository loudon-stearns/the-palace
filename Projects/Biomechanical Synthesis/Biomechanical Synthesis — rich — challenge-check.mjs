// Biomechanical Synthesis — rich — challenge-check.mjs
// born: 2026-11-04 · the challenger's own route over the negative-space engine: what the T1 measure tracks,
// and whether inhibition makes the ensemble rhythm syncopated by measures other than per-voice LHL summed.
// Reads only. node "Projects/Biomechanical Synthesis/Biomechanical Synthesis — rich — challenge-check.mjs"
import { readFileSync } from 'node:fs'; import { join, dirname } from 'node:path'; import { fileURLToPath } from 'node:url'; import vm from 'node:vm';
const HERE = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(HERE, 'Biomechanical Synthesis — rich — negative space.html'), 'utf8');
const src = html.match(/<script id="bms-net">([\s\S]*?)<\/script>/)[1];
const E = { Math, Float64Array, Uint8Array, Object, JSON }; vm.createContext(E); vm.runInContext(src + '\nthis.X=NET;', E); const N = E.X;
const opt = (g) => ({ leak: .85, g, slots: 512, warm: 64 });
const period = (p) => { const idx = []; for (let t = 0; t < p.length; t++) if (p[t]) idx.push(t); if (idx.length < 2) return 0; return (idx.at(-1) - idx[0]) / (idx.length - 1); };
const metrical = (p) => { const P = period(p); return P > 0 && Math.abs(P - Math.round(P)) < 1e-9 && 16 % Math.round(P) === 0 ? 1 : 0; };
// fraction of onsets on the off-beat sixteenths (weight -4): a plain offbeat share, no LHL
const offShare = (p) => { let o = 0, c = 0; for (let t = 0; t < p.length; t++) if (p[t]) { c++; if (N.W[t % 16] === -4) o++; } return c ? o / c : 0; };
function regime(lo, hi, seed) {
  const r = N.rng(seed); const acc = { unionS: [0, 0], perOn: [0, 0], onsets: [0, 0], metr: [0, 0], off: [0, 0], distinct: [0, 0], uUp: 0, uDn: 0, poUp: 0, poDn: 0, offUp: 0, offDn: 0, voicesSilenced: 0 };
  const M = 200;
  for (let k = 0; k < M; k++) {
    const w = [0, 0, 0].map(() => lo + (hi - lo) * r());
    const A = N.run(w, opt(.5)).on, B = N.run(w, opt(0)).on;
    const arms = [A, B].map((on) => { const u = N.union(on); const cnt = on.reduce((s, p) => s + N.count(p), 0);
      const S = on.reduce((s, p) => s + N.syncopation(p), 0);
      return { uS: N.syncopation(u), po: S / (cnt / 32), cnt, metr: on.reduce((s, p) => s + metrical(p), 0) / on.length, off: offShare(u), distinct: new Set(on.map((p) => period(p).toFixed(3))).size, silent: on.filter((p) => N.count(p) === 0).length }; });
    arms.forEach((a, i) => { acc.unionS[i] += a.uS / M; acc.perOn[i] += a.po / M; acc.onsets[i] += a.cnt / M; acc.metr[i] += a.metr / M; acc.off[i] += a.off / M; acc.distinct[i] += a.distinct / M; });
    const d = arms[0].uS - arms[1].uS; if (d > 1e-9) acc.uUp++; else if (d < -1e-9) acc.uDn++;
    const e = arms[0].po - arms[1].po; if (e > 1e-9) acc.poUp++; else if (e < -1e-9) acc.poDn++;
    const f = arms[0].off - arms[1].off; if (f > 1e-9) acc.offUp++; else if (f < -1e-9) acc.offDn++;
    acc.voicesSilenced += arms[0].silent;
  }
  return acc;
}
for (const [lo, hi] of [[0.18, 0.9], [1, 2]]) {
  const a = regime(lo, hi, 20261104), f = (v) => v.map((x) => x.toFixed(2)).join(' inh / none ');
  console.log(`drives ${lo}-${hi}:`);
  console.log(`  onsets per bar, all voices: ${f(a.onsets.map(x=>x/32))}`);
  console.log(`  LHL on the union (one composite rhythm): ${f(a.unionS)}  rises ${a.uUp} falls ${a.uDn}`);
  console.log(`  LHL per voice per onset: ${f(a.perOn)}  rises ${a.poUp} falls ${a.poDn}`);
  console.log(`  share of union onsets on off-beat 16ths: ${f(a.off)}  rises ${a.offUp} falls ${a.offDn}`);
  console.log(`  share of voices with a period dividing the bar: ${f(a.metr)}`);
  console.log(`  distinct voice periods (of 3): ${f(a.distinct)} · voices silenced entirely by inhibition: ${a.voicesSilenced} of 600`);
}
// two faces, step 5: a reader who has read the rule (shown before try 1, and in the caption) and copies try 1 on try 3
{ const h = readFileSync(join(HERE, 'Biomechanical Synthesis — rich — two faces.html'), 'utf8'); const s2 = h.match(/<script id="bms-comp">([\s\S]*?)<\/script>/)[1];
  const E2 = { Math, Float64Array, Uint8Array, Object, JSON }; vm.createContext(E2); vm.runInContext(s2 + '\nthis.X=COMP;', E2); const C = E2.X; const r = C.rng(7);
  const U = () => { const s = {}; for (const k in C.RANGE) { const [a, b] = C.RANGE[k]; s[k] = k === 'threshold' ? a + (b - a) * r() : a * Math.pow(b / a, r()); } return s; };
  let hit = 0, T = 20000; for (let i = 0; i < T; i++) { const a = U(), b = U(); if (C.verdict(i % 2 ? 'ABA' : 'BAB', [a, b, { ...a }]).faceMoved) hit++; }
  console.log(`two faces, step 5: a reader who copies try 1 on try 3, face unused: "face moved" in ${(hit / T).toFixed(4)} (chance 0.333)`);
  // step 4: the pulse counter takes P, which body() computes from the input before the wall; attack is not an argument to pulses()
  const x = C.loop(48000), base = { threshold: -24, ratio: 4, release: 150 };
  const P5 = C.body(x, C.toBody({ ...base, attack: 5 }), 48000, false).P, P200 = C.body(x, C.toBody({ ...base, attack: 200 }), 48000, false).P;
  let same = true; for (let i = 0; i < P5.length; i++) if (P5[i] !== P200[i]) { same = false; break; }
  console.log(`two faces, step 4: the pressure series the pulse is counted on is bit-identical at attack 5 and 200 ms: ${same}`); }
