// title: Photonic Time Crystals — proof — rich checks
// born: 2026-11-03
// links: [[Photonic Time Crystals]] connects-to · checks-for
// forward_vector: I re-run, in Node, every claim the two made pieces of Photonic Time Crystals print: I pull the engine
//   script out of each piece (id="pt-engine", id="pt-core", id="pm-engine") and hold it to the numbers it shows. The gap
//   in momentum: the stack's decay per cell against the Yee grid's growth per period, the gap's wave numbers all held at
//   half the breathing rate, no wave number feeding another, the backward partner, and the heard pitch landing between
//   two modes. The mirror in time: order, pitch, length and level of each return, and the mixing rule against a Yee grid.
//   A change that breaks a claim fails here.
//   Run: node "Photonic Time Crystals/Photonic Time Crystals — proof — rich checks.mjs"
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
let fails = 0;
const ok = (c, what, got) => { console.log((c ? '  ok   ' : '  FAIL ') + what + (got !== undefined ? '  — ' + got : '')); if (!c) fails++; };
function script(piece, id, names) {
  const html = readFileSync(join(HERE, `Photonic Time Crystals — rich — ${piece}.html`), 'utf8');
  const m = html.match(new RegExp(`<script id="${id}"[^>]*>([\\s\\S]*?)</script>`)); if (!m) throw new Error(`no ${id} in ${piece}`);
  return vm.runInNewContext(m[1] + `\n({${names.join(',')}})`, { Math, Float32Array, Float64Array });
}

console.log('a gap in momentum');
{
  const E = script('a gap in momentum', 'pt-engine', ['stackRead', 'mathieuRate', 'gapEdges', 'Ring', 'gridMultipliers']);
  for (const m of [0.05, 0.1, 0.2]) {
    const ns = []; for (let n = 52; n <= 76; n++) ns.push(n);
    const T = E.gridMultipliers(64 * 128, 128, m, ns);
    let wST = 0, cST = 0, wSM = 0, det = 0, lock = 0, inT = [], inS = [];
    ns.forEach((n, j) => {
      const nu = n / 64, s = E.stackRead(nu, m), g = T[j].grow > 1e-9 ? T[j].grow : 0;
      wST = Math.max(wST, Math.abs(s.decay - g)); if (n === 64) cST = Math.abs(s.decay - g); wSM = Math.max(wSM, Math.abs(s.decay - E.mathieuRate(nu, m))); det = Math.max(det, Math.abs(T[j].det - 1));
      if (g > 0) { inT.push(n); lock = Math.max(lock, Math.abs(T[j].turn - 1)); }
      if (s.gap) inS.push(n);
    });
    ok(wSM < 1e-6, `m = ${m}: stack decay per cell = Mathieu`, wSM.toExponential(1));
    ok(cST < 1e-4, `m = ${m}: at the centre, stack decay per cell = Yee grid growth per period`, cST.toExponential(1));
    ok(wST < 5e-3, `m = ${m}: across the gap, within 5e-3 (worst at an edge, where the rate climbs steeply)`, wST.toExponential(1));
    ok(det < 1e-10, `m = ${m}: the grid's one-period map keeps area (|det M| = 1)`, det.toExponential(1));
    ok(inT.length >= 1 && lock < 1e-9, `m = ${m}: every wave number in the gap turns by exactly π a period (frequency Ω/2)`, inT.length + ' wave numbers, worst ' + lock.toExponential(1));
    ok(inT.join() === inS.join(), `m = ${m}: the same ν are in the gap in time (wave numbers) and in space (frequencies)`, inT.map((n) => (n / 64).toFixed(4)).join(' '));
  }
  const ed = E.gapEdges(0.1);
  ok(Math.abs(ed[0] - 0.9530) < 2e-4 && Math.abs(ed[1] - 1.0533) < 2e-4, 'm = 0.1: gap from ν = 0.9530 to 1.0533', ed.map((x) => x.toFixed(4)).join('–'));
  ok(Math.abs(E.mathieuRate(1, 0.1) - 0.15690) < 1e-4, 'm = 0.1: growth per period at the centre 0.1569', E.mathieuRate(1, 0.1).toFixed(5));
  // no wave number feeds another: one seeded, all others stay at round-off
  {
    const r = new E.Ring(1024, 32, 0.1); r.seedForward(32, 1); for (let s = 0; s < 32 * 30; s++) r.step();
    const me = Math.hypot(...r.mode(32).slice(0, 2)); let other = 0; for (let n = 1; n < 100; n++) if (n !== 32) other = Math.max(other, Math.hypot(...r.mode(n).slice(0, 2)));
    ok(other / me < 1e-10, 'step 3: thirty periods, the seeded wave number grows, no other wave number appears', 'largest other ' + (other / me).toExponential(1) + ' of it');
  }
  // the backward partner: in the gap it grows to meet the forward wave; outside it stays bounded
  {
    const run = (n) => { const r = new E.Ring(1024, 32, 0.1); r.seedForward(n, 1); const h = [r.split(n)]; for (let p = 0; p < 30; p++) { for (let s = 0; s < 32; s++) r.step(); h.push(r.split(n)); } return h; };
    const a = run(32), b = run(27), last = a[30], tot = (o) => Math.hypot(o.F, o.B);
    ok(a[0].B < 2e-3 && Math.abs(last.B / last.F - 1) < 0.01, 'step 3, ν = 1: starts forward only; after 30 periods the backward wave matches it', 'B/F ' + (a[0].B / a[0].F).toExponential(1) + ' → ' + (last.B / last.F).toFixed(4));
    const g = Math.log(tot(a[30]) / tot(a[20])) / 10;
    ok(Math.abs(g - 0.1569) < 0.005, 'step 3, ν = 1: grows 0.157 a period over periods 20–30', g.toFixed(4));
    ok(Math.max(...b.map(tot)) < 2, 'step 3, ν = 0.84: bounded for 30 periods', Math.max(...b.map(tot)).toFixed(3));
  }
  // the sound: the same core the worklet runs
  {
    const C = script('a gap in momentum', 'pt-core', ['PTCRing']), SR = 48000;
    const zc = (y, a, b) => { let first = -1, last = -1, n = 0; for (let i = a + 1; i < b; i++) if (y[i - 1] < 0 && y[i] >= 0) { const x = i - 1 + y[i - 1] / (y[i - 1] - y[i]); if (first < 0) first = x; last = x; n++; } return (n - 1) / (last - first) * SR; };
    const hear = (fp, m, secs) => { const r = new C.PTCRing(SR, 480, 2.5, 7); r.m = m; r.fp = fp; const out = new Float64Array(SR * secs), b = new Float64Array(128); let peakModes = null; for (let k = 0; k < out.length / 128; k++) { r.block(b, 128); out.set(b, k * 128); if (k === Math.round(1.0 * SR / 128)) { peakModes = []; for (let i = 160; i < 195; i++) peakModes.push([(i + 1) * 2.5, r.amp(i)]); } } return { out, r, peakModes }; };
    const A = hear(882.5, 0.012, 4), hz = zc(A.out, SR * 3, SR * 4);
    ok(Math.abs(hz - 441.25) < 0.05, 'step 4: pump 882.5 Hz, the pitch heard is half the pump, 441.25 Hz, between the modes at 440 and 442.5', hz.toFixed(3) + ' Hz');
    const grown = A.peakModes.filter(([, a]) => a > 1e-5).map(([f]) => f);
    ok(grown.length >= 2 && grown.every((f) => Math.abs(f - 441.25) < 10), 'step 4: at 1 s, more than one mode near half the pump has grown past −100 dB, none far from it', grown.join(', ') + ' Hz');
    const Q = hear(880, 0.003, 2); let pk = 0; for (let i = SR; i < 2 * SR; i++) pk = Math.max(pk, Math.abs(Q.out[i]));
    ok(pk < 1e-4, 'step 4: below the loss (m = 0.003 < 2ζ) nothing grows', 'peak ' + pk.toExponential(1));
    const B = hear(1000, 0.012, 3), hz2 = zc(B.out, SR * 2, SR * 3);
    ok(Math.abs(hz2 - 500) < 0.05, 'step 4: pump 1000 Hz, heard 500 Hz', hz2.toFixed(3) + ' Hz');
  }
}

console.log('a mirror in time');
{
  const E = script('a mirror in time', 'pm-engine', ['NOTES', 'phrase', 'timeMirror', 'wallEcho', 'reverseBuffer', 'slabRule', 'zcHz', 'rms', 'orderScore', 'yeeJump']);
  const SR = 48000, p = E.phrase(SR), tJ = Math.round(1.45 * SR), held = E.NOTES[3];
  const meas = (kind, n2, tau) => {
    let y, c = 1, lagS = tJ - p.length;
    if (kind === 'rev') { y = E.reverseBuffer(p); lagS = 0; } else if (kind === 'jump') { y = E.timeMirror(p, tJ, [[0, n2]], Math.round((1.4 * n2 + 0.3) * SR)); c = 1 / n2; } else y = E.timeMirror(p, tJ, [[0, 2], [tau * 1e-3 * SR, 1]], Math.round(1.7 * SR));
    const sOf = (tp) => (p.length - 1 - tp * SR + lagS) / c, hz = E.zcHz(y, Math.round(sOf(held[0] + held[2] - 0.1)), Math.round(sOf(held[0] + 0.15)), SR), o = E.orderScore(y, sOf((p.length - 1) / SR), 1 / c, p);
    let end = y.length - 1; while (end > 0 && Math.abs(y[end]) < 1e-4) end--; let beg = 0; while (beg < end && Math.abs(y[beg]) < 1e-4) beg++;
    return { hz, o, len: (end - beg) / SR, level: 20 * Math.log10(E.rms(y, beg, end) / E.rms(p, 0, p.length)) };
  };
  const w = E.wallEcho(p, Math.round(0.8 * SR), Math.round(3.4 * SR)), ow = E.orderScore(w, 2 * 0.8 * SR, 1, p);
  ok(Math.abs(ow.fwd) > 0.999 && Math.abs(ow.rev) < 0.1, 'step 1: the wall keeps the order', 'forward ' + Math.abs(ow.fwd).toFixed(3) + ', reversed ' + Math.abs(ow.rev).toFixed(3));
  const rv = meas('rev'); ok(Math.abs(rv.o.rev) > 0.999 && Math.abs(rv.hz - 440) < 0.01 && Math.abs(rv.level) < 0.01, 'reverse buffer: reversed, A4 at 440, same level', rv.hz.toFixed(2) + ' Hz');
  for (const n2 of [1.5, 2, 3]) {
    const m = meas('jump', n2), rule = 20 * Math.log10(Math.abs((1 - n2) / (2 * n2 * n2)));
    ok(Math.abs(m.o.rev) > 0.999 && Math.abs(m.o.fwd) < 0.1, `step 2, n₂ = ${n2}: reversed`, Math.abs(m.o.rev).toFixed(4));
    ok(Math.abs(m.hz - 440 / n2) < 0.05, `step 2, n₂ = ${n2}: A4 returns at 440/n₂`, m.hz.toFixed(3) + ' Hz');
    ok(Math.abs(m.len - 1.4 * n2) < 0.01, `step 2, n₂ = ${n2}: length × n₂`, m.len.toFixed(3) + ' s');
    ok(Math.abs(m.level - rule) < 0.05, `step 2, n₂ = ${n2}: level = 20 log |n₁(n₁ − n₂)/(2n₂²)|`, m.level.toFixed(2) + ' dB against ' + rule.toFixed(2));
  }
  const sl = meas('slab', 2, 1);
  ok(Math.abs(sl.hz - 440) < 0.05 && Math.abs(sl.o.rev) > 0.6 && Math.abs(sl.o.fwd) < 0.1, 'step 3, τ = 1 ms: reversed, A4 at its own pitch', sl.hz.toFixed(3) + ' Hz, reversed ' + Math.abs(sl.o.rev).toFixed(3));
  let worst = 0; const tauS = 1e-3 * SR;
  for (let f = 250; f <= 5000; f += 250) { const len = Math.round(0.08 * SR), q = new Float64Array(len); for (let i = 0; i < len; i++) q[i] = Math.sin(2 * Math.PI * f * i / SR) * Math.min(1, i / 400, (len - i) / 400); const out = E.timeMirror(q, len + 10, [[0, 2], [tauS, 1]], len + 400); worst = Math.max(worst, Math.abs(E.rms(out, 600, len - 600) / E.rms(q, 600, len - 600) - E.slabRule(f / SR, 2, tauS))); }
  ok(worst < 0.01, 'step 3: the engine tone by tone sits on |r(f)| = ½|n₂ − 1/n₂| |sin(2πfτ/n₂)|', worst.toExponential(1));
  for (const n2 of [1.5, 2, 3]) {
    const r = E.yeeJump(40, [[100, n2]]);
    ok(Math.abs(r.back - Math.abs((1 - n2) / 2)) / Math.abs((1 - n2) / 2) < 0.005, `Yee grid, n₂ = ${n2}: backward D = |1 − n₂/n₁|/2`, r.back.toFixed(5));
    ok(Math.abs(r.freq - 1 / n2) / (1 / n2) < 0.005, `Yee grid, n₂ = ${n2}: its frequency × n₁/n₂`, r.freq.toFixed(5));
  }
  for (const lam of [20, 30, 60]) { const r = E.yeeJump(lam, [[100, 2], [120, 1]], { N: 5000, x0: 3000, w: 250, probe: 10, steps: 2520 }), rule = E.slabRule(1 / lam, 2, 10); ok(Math.abs(r.back - rule) / rule < 0.01, `Yee grid, there and back, λ = ${lam}: |r| = the rule`, r.back.toFixed(4) + ' against ' + rule.toFixed(4)); }
}

console.log(fails ? `${fails} FAILED` : 'all claims hold');
process.exit(fails ? 1 : 0);
