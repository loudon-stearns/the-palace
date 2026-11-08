// title: Synthesis ↔ Emergence — rich — checks
// born: 2026-11-03
// links: [[Synthesis ↔ Emergence]] connects-to · rich-face-check · re-runs the claims of the two made pieces
// forward_vector: I pull ENGINE_SRC out of each piece and run it in Node against every claim its steps and
//   captions make, so a challenger can see the numbers without trusting the page. I change when a piece does.
// usage: node "Cross-Domain Resonances/Synthesis ↔ Emergence/Synthesis ↔ Emergence — rich — checks.mjs"
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const src = f => readFileSync(join(here, `Synthesis ↔ Emergence — rich — ${f}.html`), 'utf8').match(/const ENGINE_SRC = String\.raw`([\s\S]*?)`;/)[1];
const A = new Function(src('two sines') + '; return { TwoSines, measure };')();
const B = new Function(src('predicted beside measured') + '; return { Voice, predictPair, measurePair, predictLoop, measureLoop, repeatsLoop, gap, twins, twinAverages, exponent };')();
let fails = 0;
const ok = (cond, line) => { console.log((cond ? 'ok   ' : 'FAIL ') + line); if (!cond) fails++; };
const within = (parts, db = -40) => { const top = Math.max(...parts.map(p => p.a)); return parts.filter(p => 20 * Math.log10(p.a / top) > db); };

console.log('— two sines');
const one = (mode, I = 0, fm = 200) => within(A.measure(mode, 400, fm, I).parts).map(p => p.f);
ok(JSON.stringify(one('carrier')) === '[400]', 'carrier alone: one partial, 400 Hz → ' + one('carrier'));
ok(JSON.stringify(one('mod')) === '[200]', 'modulator alone: one partial, 200 Hz → ' + one('mod'));
ok(JSON.stringify(one('sum')) === '[200,400]', 'added: two partials, 200 and 400 → ' + one('sum'));
ok(JSON.stringify(one('fm', 0)) === '[400]', 'FM at depth 0: one partial, the carrier; the modulator is not heard → ' + one('fm', 0));
ok(one('fm', 1).join(',') === '200,400,600,800,1000', 'FM depth 1: new partials neither sine had → ' + one('fm', 1).join(', '));
{
  let minShare = 1, notFull = [];
  for (let I = 0.05; I <= 5.0001; I += 0.05) {
    const m = A.measure('fm', 400, 200, I), pr = within(m.parts), hi = Math.max(...pr.map(p => p.f / 200));
    minShare = Math.min(minShare, m.share); if (pr.length !== hi) notFull.push(I.toFixed(2) + ':' + pr.length + '/' + hi);
  }
  ok(minShare > 0.9999, '400 : 200, depth 0.05 to 5: the 200 Hz grid holds ' + (100 * minShare).toFixed(4) + ' % of the power at worst');
  console.log('     depths where a grid slot under the top one is below −40 dB: ' + (notFull.join(' ') || 'none'));
  const m5 = A.measure('fm', 400, 200, 5), p5 = within(m5.parts);
  ok(p5.length === 10 && Math.max(...p5.map(p => p.f)) === 2000, '400 : 200, depth 5: all ten slots of 200 Hz to 2000 Hz filled → ' + p5.map(p => p.f / 200).join(','));
  const s5 = A.measure('fm', 400, 560, 5), q5 = within(s5.parts), ks = q5.map(p => p.f / 80);
  ok(s5.grid === 80 && q5.length === 11 && Math.max(...ks) === 37 && Math.min(...q5.map(p => p.f)) === 160, '400 : 560, depth 5, to 3 kHz as drawn: grid 80 Hz, ' + q5.length + ' of the first ' + Math.max(...ks) + ' slots, lowest ' + Math.min(...q5.map(p => p.f)) + ' Hz');
  const q1 = within(A.measure('fm', 400, 560, 1).parts).map(p => p.f / 80);
  console.log('     400 : 560, depth 1: slots ' + q1.join(',') + ' (' + q1.length + ' of ' + Math.max(...q1) + ')');
}

console.log('— predicted beside measured');
{
  let worst = 0, at = 0;
  for (let I = 0; I <= 5.0001; I += 0.01) { const g = B.gap(B.measurePair(400, 200, I), B.predictPair(400, 200, I)); if (g.worst > worst) { worst = g.worst; at = I; } }
  ok(worst < 0.01, 'the pair, depth 0 to 5 by 0.01: Bessel prediction vs measured, worst ' + worst.toExponential(2) + ' dB (at ' + at.toFixed(2) + ')');
  const rows = [];
  let maxUnder1 = 0;
  for (const b of [0.2, 0.4, 0.6, 0.8, 0.9, 1.0, 1.1, 1.2, 1.25, 1.3, 1.5, 2, 2.5, 3, Math.PI, 3.5]) {
    const m = B.measureLoop(b), g = B.gap(m.amp, B.predictLoop(b)); rows.push(b.toFixed(3) + ': ' + g.rms.toFixed(2) + ' rms / ' + g.worst.toFixed(1) + ' worst (h' + g.at + ') · repeats ' + (100 * m.repeats).toFixed(2) + ' %');
    if (b <= 1) maxUnder1 = Math.max(maxUnder1, g.rms);
  }
  rows.forEach(r => console.log('     β ' + r));
  ok(maxUnder1 <= 1.5, 'the loop, β ≤ 1: Kapteyn/Bessel series within ' + maxUnder1.toFixed(2) + ' dB rms of the sound (192 kHz)');
  const g15 = B.gap(B.measureLoop(1.5).amp, B.predictLoop(1.5)), g2 = B.gap(B.measureLoop(2).amp, B.predictLoop(2)), gpi = B.gap(B.measureLoop(Math.PI).amp, B.predictLoop(Math.PI));
  ok(g15.rms > 5 && g2.rms > 5 && gpi.rms > 5, 'past 1 the series fails: rms gap ' + g15.rms.toFixed(1) + ' dB at 1.5, ' + g2.rms.toFixed(1) + ' at 2, ' + gpi.rms.toFixed(1) + ' at π');
  let minRep = 1; for (let b = 0; b <= 3.9001; b += 0.01) minRep = Math.min(minRep, B.repeatsLoop(b));
  ok(minRep > 0.999, 'the loop repeats every cycle up to β 3.90 (48 kHz): worst ' + (100 * minRep).toFixed(3) + ' %');
  ok(B.repeatsLoop(4.4) < 0.5, 'at β 4.4 it does not: ' + (100 * B.repeatsLoop(4.4)).toFixed(1) + ' % repeats');
  // the jump: largest step between two samples at 192 kHz, a smooth wave's is about 2π·200/192000 ≈ 0.0065 times its slope
  const jump = b => { const v = new B.Voice(192000); v.set({ kind: 'loop', f: 200, beta: b, snap: true }); for (let i = 0; i < 96000; i++) v.step(); let p = v.step(), mx = 0; for (let i = 0; i < 9600; i++) { const y = v.step(); mx = Math.max(mx, Math.abs(y - p)); p = y; } return mx; };
  console.log('     largest sample-to-sample step at 192 kHz: β 0.8 ' + jump(0.8).toFixed(3) + ', β 1.0 ' + jump(1).toFixed(3) + ', β 1.5 ' + jump(1.5).toFixed(3) + ', β 2 ' + jump(2).toFixed(3) + ', β π ' + jump(Math.PI).toFixed(3));
  let shrink = true, bad = []; for (let b = 0.05; b <= 3.851; b += 0.05) { const t = B.twins('loop', b); if (t.part !== null || t.tail > 1e-12) { shrink = false; bad.push(b.toFixed(2)); } }
  ok(shrink, 'twins, β 0.05 to 3.85: the billionth shrinks under 1e-12 and stays there, over 1 s' + (bad.length ? ' — not at ' + bad.join(' ') : ''));
  // The edge, by the Lyapunov exponent (the piece's exponent()), not by twins: twins can re-merge below the last
  // bit of a double while the loop is still chaotic.
  let maxNeg = -Infinity; for (let i = 5; i <= 390; i++) maxNeg = Math.max(maxNeg, B.exponent(i / 100));
  ok(maxNeg < 0, 'the DX7 loop, β 0.05 to 3.90 by 0.01: exponent negative everywhere (largest ' + maxNeg.toFixed(3) + ' per sample)');
  let firstPos = null; for (let i = 390; i <= 420; i++) if (B.exponent(i / 100) > 0) { firstPos = i / 100; break; }
  ok(firstPos !== null && firstPos >= 3.91 && firstPos <= 3.95, 'first positive exponent at β ' + firstPos + ' (the DX7\'s feedback ' + (7 + Math.log2(firstPos / Math.PI)).toFixed(2) + ')');
  const mixed = []; for (let i = 390; i <= 410; i++) mixed.push((i / 100).toFixed(2) + ':' + B.exponent(i / 100).toFixed(3)); console.log('     the band: ' + mixed.join(' '));
  let notPos = []; for (let i = 410; i <= 480; i++) if (B.exponent(i / 100) <= 0) notPos.push(i / 100);
  ok(!notPos.length, 'β 4.10 to 4.80 by 0.01: exponent positive everywhere (the DX7\'s feedback 7.38 up)' + (notPos.length ? ' — not at ' + notPos.join(' ') : ''));
  for (const b of [3.95, 4.05, 4.25]) { const t = B.twins('loop', b); console.log('     β ' + b + ': exponent ' + B.exponent(b).toFixed(3) + ', repeats ' + (100 * B.repeatsLoop(b)).toFixed(1) + ' %, twins ' + (t.apart ? 'apart' : t.part !== null ? 'part then merge by ' + Math.ceil(t.lastApart) + ' ms' : 'never part')); }
  let pFirst = null; for (let i = 200; i <= 300; i++) if (B.exponent(i / 100, false) > 0) { pFirst = i / 100; break; }
  ok(pFirst !== null && pFirst >= 2.3 && pFirst <= 2.6, 'the plain one-sample loop: first positive exponent at β ' + pFirst + ' (the DX7\'s feedback ' + (7 + Math.log2(pFirst / Math.PI)).toFixed(2) + ')');
  let pNot = []; for (let i = 260; i <= 480; i += 2) if (B.exponent(i / 100, false) <= 0) pNot.push(i / 100);
  ok(!pNot.length, 'the plain loop, β 2.6 to 4.8: exponent positive everywhere' + (pNot.length ? ' — not at ' + pNot.join(' ') : ''));
  const pr7 = B.repeatsLoop(Math.PI, false);
  ok(pr7 > 0.7 && pr7 < 0.85, 'the plain loop at β π (feedback 7): ' + (100 * pr7).toFixed(1) + ' % repeats, exponent +' + B.exponent(Math.PI, false).toFixed(3));
  const t44 = B.twins('loop', 4.4), pr = B.twins('pair', 5);
  ok(t44.apart && t44.part < 10 && B.exponent(4.4) > 0, 'β 4.4: exponent +' + B.exponent(4.4).toFixed(3) + ', twins part after ' + (t44.part && t44.part.toFixed(2)) + ' ms and are apart (' + t44.tail.toFixed(2) + ') a second later');
  for (const b of [4.2, 4.4, 4.6]) { const av = B.twinAverages(b); const dr = Math.abs(av.a.rms / av.b.rms - 1), db = Math.abs(av.a.bright / av.b.bright - 1); ok(dr < 0.02 && db < 0.03, 'β ' + b + ': 4-second averages agree, loudness ' + av.a.rms.toFixed(3) + ' / ' + av.b.rms.toFixed(3) + ', brightness ' + Math.round(av.a.bright) + ' / ' + Math.round(av.b.bright) + ' Hz'); }
}
console.log(fails ? fails + ' failed' : 'all passed');
process.exit(fails ? 1 : 0);
