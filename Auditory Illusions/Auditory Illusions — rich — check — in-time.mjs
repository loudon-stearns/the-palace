// ---
// title: Auditory Illusions — rich — check — in-time
// born: 2026-11-08
// links: [[Auditory Illusions]] connects-to · checks-the-in-time-pieces · [[Auditory Illusions — rich — the risset rhythm]] connects-to · checks ·
//   [[Auditory Illusions — rich — click into pitch]] connects-to · checks
// forward_vector: I re-run the numbers the two "In time" pieces stand on, on their own engines pulled out of the pages:
//   the Risset rhythm's layer ratios, its loop, its window levels and the seam's continuity; the click dial's mapping,
//   the wheel, the level law, the lamp's cap and screen limit, and the blind trial's plan and verdict rule. I cannot
//   hear or see: whether the seam is heard, where taps turn to tone, and when a lamp looks steady are the reader's.
// ---
// Run: node "Auditory Illusions/Auditory Illusions — rich — check — in-time.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const engine = (file, names) => {
  const html = fs.readFileSync(path.join(here, file), 'utf8');
  const src = html.match(/const ENGINE_SRC = String\.raw`([\s\S]*?)`;/)[1];
  return new Function(src + '; return {' + names.join(',') + '};')();
};
let pass = 0, fail = 0;
const check = (piece, claim, ok, detail) => { (ok ? pass++ : fail++); console.log(`${ok ? 'ok  ' : 'FAIL'}  ${piece} · ${claim}${detail ? '  (' + detail + ')' : ''}`); };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const dB = g => 20 * Math.log10(g);

// ───────── the Risset rhythm ─────────
{
  const P = 'risset';
  const E = engine('Auditory Illusions — rich — the risset rhythm.html', ['N', 'B0', 'N0', 'T', 'CUT', 'UP', 'frac', 'rate', 'bpm', 'win', 'weights', 'power', 'level', 'BEATS', 'events', 'voices', 'SEAM_TOL', 'chance', 'SEAM_LO', 'SEAM_HI', 'chanceMid', 'ARM_TRIALS', 'BAR', 'atLeast']);
  const { N, B0, N0, T } = E;
  check(P, 'five layers, the slowest at 22.5 BPM, the cycle 6·ln2/B0', N === 5 && near(E.bpm(0), 22.5, 1e-12) && near(T, 6 * Math.LN2 / 0.375, 1e-12), `T = ${T.toFixed(4)} s`);
  check(P, 'the slowest layer plays a whole number of beats per cycle (so the seam lands on a beat of every layer)', Number.isInteger(B0 * T / Math.LN2) && E.BEATS[0].length === 6, `B0·T/ln2 = ${(B0 * T / Math.LN2).toFixed(12)}`);
  let worst = 0;
  for (let i = 0; i < 200; i++) { const ph = i / 200; for (let k = 0; k < N - 1; k++) worst = Math.max(worst, Math.abs(E.rate(k + 1 + ph) / E.rate(k + ph) - 2)); }
  check(P, 'each layer is exactly double the tempo of the one below, at every φ', worst < 1e-12, `worst |ratio − 2| = ${worst.toExponential(1)}`);
  check(P, 'every layer doubles over one cycle', near(E.rate(1) / E.rate(0), 2, 1e-12) && near(E.bpm(N) , 720, 1e-9), `range ${E.bpm(0)}–${E.bpm(N)} BPM`);
  let s1 = [Infinity, -Infinity], s2 = [Infinity, -Infinity];
  for (let i = 0; i < 1000; i++) { const ph = i / 1000, w = E.weights(ph, 1, false), a = w.reduce((x, y) => x + y, 0), b = w.reduce((x, y) => x + y * y, 0); s1 = [Math.min(s1[0], a), Math.max(s1[1], a)]; s2 = [Math.min(s2[0], b), Math.max(s2[1], b)]; }
  check(P, 'the page’s bell: Σw = 2.5 and Σw² = 1.875 at every moment of the loop (no swell from the window)', near(s1[0], 2.5, 1e-12) && near(s1[1], 2.5, 1e-12) && near(s2[0], 1.875, 1e-12) && near(s2[1], 1.875, 1e-12), `Σw ${s1[0].toFixed(6)}–${s1[1].toFixed(6)}, Σw² ${s2[0].toFixed(6)}–${s2[1].toFixed(6)}`);
  const lv0 = [0, 1, 2, 3, 4].map(k => E.level(k, 0, 1, false)), lvh = [0, 1, 2, 3, 4].map(k => E.level(k + 0.5, 0.5, 1, false));
  console.log('      levels at φ = 0, layers 1..5 (dB re full scale): ' + lv0.map(g => g > 0 ? dB(g).toFixed(1) : '−∞').join('  ') + '\n      levels at φ = 0.5, layers 1..5: ' + lvh.map(g => dB(g).toFixed(1)).join('  '));
  check(P, 'window levels at φ = 0: silent, −12.0, −3.6, −3.6, −12.0 dB; the loudest beat is −2.7 dB (1/√1.875)', lv0[0] === 0 && near(dB(lv0[1]), -11.95, 0.05) && near(dB(lv0[2]), -3.6, 0.05) && near(dB(lv0[3]), dB(lv0[2]), 1e-9) && near(dB(lvh[2]), -2.73, 0.01), `${dB(lv0[1]).toFixed(2)} · ${dB(lv0[2]).toFixed(2)} · peak ${dB(lvh[2]).toFixed(2)}`);
  const eps = 1e-9;
  check(P, 'at the seam the top layer is silent leaving and the new bottom one silent arriving', E.win(N - eps, 1, false) < 1e-15 && E.win(0, 1, false) === 0);
  let lvlJump = 0; for (let k = 0; k < N - 1; k++) lvlJump = Math.max(lvlJump, Math.abs(E.level(k + 1 - eps, 1 - eps, 1, false) - E.level(k + 1, 0, 1, false)));
  check(P, 'every layer’s level is continuous across the seam (layer k leaving = layer k+1 arriving)', lvlJump < 1e-6, `largest step ${lvlJump.toExponential(1)}`);
  // beat stream continuity: layer k in cycle c, then layer k+1 in cycle c+1, is one accelerating stream
  let cont = 0;
  for (let k = 0; k < N - 1; k++) {
    const M = Math.pow(2, k) * N0, a = E.BEATS[k].map(u => u), b = E.BEATS[k + 1].map(u => T + u), merged = a.concat(b);
    merged.forEach((t, j) => { cont = Math.max(cont, Math.abs(t - T * Math.log2(1 + j / M))); });
  }
  check(P, 'each layer’s beats run on into the next layer’s after the seam as one accelerating stream: t_j = T·log2(1 + j/M) across it', cont < 1e-9, `largest gap from the formula ${cont.toExponential(1)} s`);
  const ev = E.events(0, T, 0, false);
  check(P, 'one cycle holds 6 + 12 + 24 + 48 + 96 = 186 beats', ev.length === 186, `${ev.length}`);
  const loud = E.events(0, 3 * T, 1, false).reduce((m, e) => Math.max(m, e.g), 0);
  check(P, 'loudest layer runs 90 to 180 BPM (x = 2 + φ), the window centre 127.3 BPM', near(E.bpm(2), 90, 1e-9) && near(E.bpm(3), 180, 1e-9) && near(E.bpm(2.5), 127.28, 0.01), `centre ${E.bpm(2.5).toFixed(2)} BPM; loudest beat level ${loud.toFixed(3)}`);
  const cutBeats = E.events(T * 0.5, T * 1.5, 1, true);
  const before = cutBeats.filter(e => e.t < T), after = cutBeats.filter(e => e.t >= T);
  const ivB = before[before.length - 1].t - before[before.length - 2].t, ivA = after[1].t - after[0].t;
  check(P, 'crossfade stopped: one layer only, from 90 to 180 BPM, and at the seam its tempo halves', cutBeats.every(e => e.x >= 2 && e.x < 3 && e.g === 1) && near(60 / ivB, 180, 6) && near(60 / ivA, 90, 3), `last interval before ${ivB.toFixed(3)} s (${(60 / ivB).toFixed(1)} BPM), first after ${ivA.toFixed(3)} s (${(60 / ivA).toFixed(1)} BPM)`);
  const flat = [0.2, 1.2, 2.2, 3.2, 4.2].map(x => E.level(x, 0.2, 0, false));
  check(P, 'window opened flat (p = 0): every layer at 1/√5, −7.0 dB', flat.every(g => near(dB(g), -6.99, 0.01)), dB(flat[0]).toFixed(2) + ' dB');
  const V = E.voices(0), V2 = E.voices(T * 0.999);
  check(P, 'the pitch version: the same rates × 128, sines from 48 to 1536 Hz, one voice wrapping at a time', E.UP === 128 && near(E.UP * E.rate(0), 48, 1e-9) && near(E.UP * E.rate(N), 1536, 1e-9) && V.map(v => v.x).join() === '0,1,2,3,4' && V2[4].x > 4.99);
  check(P, 'blind trial: a press at a random moment of the loop hits ±1 s of the seam 18 % of the time', near(E.chance(), 2 / T, 1e-12) && Math.round(100 * E.chance()) === 18, (100 * E.chance()).toFixed(1) + ' %');
  // the strategy the challenger found: the seam is drawn in 15–85 % of the loop, so pressing mid-loop every time does better
  let best = 0; for (let i = 0; i <= 1000; i++) { const tp = i / 1000 * T, lo = E.SEAM_LO * T, hi = E.SEAM_HI * T; best = Math.max(best, Math.max(0, Math.min(hi, tp + 1) - Math.max(lo, tp - 1)) / (hi - lo)); }
  check(P, 'blind trial: the best a non-listener can do (one fixed press time) is 25.8 %, the chance the page now states as 26 %', near(best, E.chanceMid(), 1e-3) && Math.round(100 * E.chanceMid()) === 26, `best fixed press ${(100 * best).toFixed(1)} %, stated ${(100 * E.chanceMid()).toFixed(1)} %`);
  const tail26 = E.atLeast(E.BAR, E.ARM_TRIALS, E.chanceMid()), tail18 = E.atLeast(E.BAR, E.ARM_TRIALS, E.chance());
  check(P, 'the verdict bar, 6 or more hits of 10, is reached by a non-listener 2.3 % of the time (0.4 % pressing at random)', E.BAR === 6 && E.ARM_TRIALS === 10 && near(tail26, 0.023, 0.001) && near(tail18, 0.004, 0.001), `${(100 * tail26).toFixed(2)} % · ${(100 * tail18).toFixed(2)} %`);
  const html = fs.readFileSync(path.join(here, 'Auditory Illusions — rich — the risset rhythm.html'), 'utf8');
  const cd = html.match(/function countdown\(\)[^\n]*/)[0];
  check(P, 'no clock shows during a trial (the curtain says only listening / pressed)', !/currentTime - tr\.a0/.test(cd) && /'listening'/.test(cd));
}

// ───────── click into pitch ─────────
{
  const P = 'click';
  const E = engine('Auditory Illusions — rich — click into pitch.html', ['R_MIN', 'R_MAX', 'rateOf', 'posOf', 'PER_TURN', 'GEAR', 'TAU', 'turnsPerSec', 'handRate', 'coast', 'clickGain', 'CLICK_TAU', 'FLASH_CAP', 'screenLimit', 'lampMode', 'note', 'PAGE', 'BANDS', 'PER_BAND', 'CATCH', 'TRIAL_S', 'plan', 'crossing', 'verdict', 'READ_MIN', 'readable', 'lampLevel']);
  check(P, 'the dial maps 0 → 2, ½ → 20, 1 → 200 clicks a second (2·100^p, log scale)', E.rateOf(0) === 2 && near(E.rateOf(0.5), 20, 1e-12) && near(E.rateOf(1), 200, 1e-12), `${E.rateOf(0)} · ${E.rateOf(0.5)} · ${E.rateOf(1)}`);
  let inv = 0, mono = true, prev = 0;
  for (let i = 0; i <= 1000; i++) { const p = i / 1000, r = E.rateOf(p); inv = Math.max(inv, Math.abs(E.posOf(r) - p)); if (r <= prev) mono = false; prev = r; }
  check(P, 'the dial is monotonic, every half of its travel is ×10, and posOf undoes rateOf', mono && inv < 1e-12 && near(E.rateOf(0.75) / E.rateOf(0.25), 10, 1e-9), `worst inverse error ${inv.toExponential(1)}`);
  check(P, 'the dial’s slider (0..1000) starts at 151: 4.0 clicks a second', near(E.rateOf(0.151), 4.0, 0.01), E.rateOf(0.151).toFixed(3));
  check(P, 'the dial clamps outside 0..1', E.rateOf(-1) === 2 && near(E.rateOf(2), 200, 1e-12));
  check(P, 'the wheel: 40 clicks a turn, 5 turns a second at 200; a hand at 2.5 turns a second, geared ×2, reaches 200', E.turnsPerSec(200) === 5 && E.handRate(2.5) === 200 && E.handRate(-1) === 80);
  const half = E.TAU * Math.LN2, sweep = E.TAU * Math.log(100), mud = E.TAU * Math.log(50 / 20);
  check(P, 'coasting: speed halves every 4.16 s; 200 → 2 takes 27.6 s; the page’s zone 50 → 20 takes 5.5 s', near(E.coast(100, half), 50, 1e-9) && E.coast(2.1, 10) === 2, `${half.toFixed(2)} s · ${sweep.toFixed(1)} s · ${mud.toFixed(1)} s`);
  let pw = 0; for (const r of [2, 5, 20, 37, 120, 200]) pw = Math.max(pw, Math.abs(r * E.clickGain(r) ** 2 - 2));
  check(P, 'level law: each click’s gain is √(2/r), so rate × gain² stays 2 (power level); one click at 200 is −20 dB', pw < 1e-12 && near(dB(E.clickGain(200)), -20, 1e-9), `click at 20/s ${dB(E.clickGain(20)).toFixed(1)} dB, at 200/s ${dB(E.clickGain(200)).toFixed(1)} dB`);
  // the scheduler's arithmetic, as the page runs it: next += 1/r
  let t = 0; const times = []; while (t < 1 - 1e-9) { times.push(t); t += 1 / 37; }
  const iv = times.slice(1).map((x, i) => x - times[i]);
  check(P, 'at a steady rate the clicks fall exactly 1/r apart (37/s → 27.03 ms)', iv.every(d => near(d, 1 / 37, 1e-12)) && times.length === 37, `${(1000 * iv[0]).toFixed(2)} ms, ${times.length} clicks in 1 s`);
  const corner = 1 / (2 * Math.PI * E.CLICK_TAU);
  check(P, 'each click is a one-pole impulse, corner 1.33 kHz: its spectrum is level through every rate on the dial', near(corner, 1326, 1), corner.toFixed(0) + ' Hz');
  check(P, 'the lamp: at most 3 flashes a second unless the reader chooses more', E.FLASH_CAP === 3 && E.lampMode(3, false, 60) === 'flash' && E.lampMode(3.01, false, 60) === 'held' && E.lampMode(200, false, 60) === 'held');
  check(P, 'on a 60 Hz screen the lamp turns to the screen’s steady average at 29.4 a second (98 % of 60/2); on 120 Hz at 58.8', E.screenLimit(60) === 30 && E.lampMode(29.39, true, 60) === 'flash' && E.lampMode(29.4, true, 60) === 'screen' && E.lampMode(58.7, true, 120) === 'flash' && E.lampMode(58.8, true, 120) === 'screen');
  const n1 = E.note(41.2034), n2 = E.note(195.998), n3 = E.note(440);
  check(P, 'note names: 41.2 Hz is E1, 196 Hz is G3, 440 Hz is A4', n1.name === 'E1' && n2.name === 'G3' && n3.name === 'A4' && n3.cents === 0, `${n1.name} ${n1.cents} ¢ · ${n2.name} ${n2.cents} ¢`);
  check(P, 'the page’s numbers as the piece states them: taps below 20, pitch past 30 to 50', E.PAGE.taps === 20 && E.PAGE.toneLo === 30 && E.PAGE.toneHi === 50);
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pl = E.plan(rnd);
  const perBand = E.BANDS.map(b => pl.filter(x => x.band === b).length), inBand = pl.every(x => x.katch || (x.r >= x.band[0] && x.r < x.band[1]));
  check(P, 'the blind plan: 20 bursts of 1.2 s, three in each of six bands from 4 to 180, two catch trials at 3 and 190', pl.length === 20 && perBand.every(c => c === 3) && inBand && pl.filter(x => x.katch).map(x => x.r).sort((a, b) => a - b).join() === '3,190' && E.TRIAL_S === 1.2);
  const listener = sw => E.plan(rnd).filter(x => !x.katch).map(x => ({ r: x.r, tone: x.r > sw }));
  const v12 = E.verdict(E.crossing(listener(12))), v30 = E.crossing(listener(30)), v80 = E.verdict(E.crossing(listener(80)));
  check(P, 'the verdict rule: a listener who switches at 12 comes out below the page, at 30 inside it, at 80 above it', v12 === 'below' && E.verdict(v30) === 'inside' && v30.agree === 1 && v80 === 'above', `switch at 30 found at ${v30.r.toFixed(1)}`);
  // the lamp on a 60 Hz screen: the old one-frame square against the sine the page now draws. 10 s of frames (a whole
  // number of cycles at each rate, so a plain DFT has no leakage); the largest line below the rate, against the rate's own.
  const shimmer = (lvl, r) => {
    const n = 600, x = []; for (let i = 0; i < n; i++) x.push(lvl((i / 60 * r) % 1));
    const mean = x.reduce((a, b) => a + b, 0) / n, amp = f => { let re = 0, im = 0; for (let i = 0; i < n; i++) { re += (x[i] - mean) * Math.cos(2 * Math.PI * f * i / 60); im -= (x[i] - mean) * Math.sin(2 * Math.PI * f * i / 60); } return Math.hypot(re, im); };
    const fund = amp(r); let worst = 0, at = 0; for (let k = 1; k < 10 * (r - 0.5); k++) { const f = k / 10, a = amp(f); if (a > worst) { worst = a; at = f; } }
    return { dB: worst > 1e-9 * fund ? dB(worst / fund) : -Infinity, at: at };
  };
  const square = ph => (ph < 0.5 ? 1 : 0);
  const rows = [12.5, 17, 19, 21, 22, 25, 29].map(r => ({ r: r, sq: shimmer(square, r), sn: shimmer(E.lampLevel, r) }));
  console.log('      lamp at 60 frames a second, largest false line below the rate, re the rate’s own: ' + rows.map(o => `${o.r}/s square ${o.sq.dB.toFixed(1)} dB at ${o.sq.at} Hz, sine ${o.sn.dB === -Infinity ? 'none' : o.sn.dB.toFixed(1) + ' dB'}`).join(' · '));
  check(P, 'the old square lamp shimmered (−9.5 dB at 17, 19, 21, 22/s); the sine lamp the page now draws has no false line below the rate up to 29/s', rows.filter(o => [17, 19, 21, 22].includes(o.r)).every(o => near(o.sq.dB, -9.5, 0.6)) && rows.every(o => o.sn.dB < -200), 'sine: none above −200 dB');
  check(P, 'the sine lamp is brightest on each click and darkest half a period later', E.lampLevel(0) === 1 && near(E.lampLevel(0.5), 0, 1e-15));
  const vc = { inside: 0, below: 0, above: 0 }; let read = 0; const NS = 20000;
  for (let i = 0; i < NS; i++) { const ans = E.plan(rnd).filter(x => !x.katch).map(x => ({ r: x.r, tone: rnd() < 0.5 })); const c = E.crossing(ans); vc[E.verdict(c)]++; if (E.readable(c, ans.length)) read++; }
  console.log(`      coin-flipping listener, ${NS} runs: inside ${(100 * vc.inside / NS).toFixed(1)} %, below ${(100 * vc.below / NS).toFixed(1)} %, above ${(100 * vc.above / NS).toFixed(1)} %, split explains ≥ ${E.READ_MIN} of 18 in ${(100 * read / NS).toFixed(2)} %`);
  check(P, 'the page’s stated lean holds: random answers come out inside 20–50 about 19 % and against about 81 %; ≥ 16 of 18 about 0.9 %', near(vc.inside / NS, 0.19, 0.02) && near(read / NS, 0.009, 0.003) && E.READ_MIN === 16, `${(100 * vc.inside / NS).toFixed(1)} % · ${(100 * read / NS).toFixed(2)} %`);
  let agreeSum = 0; for (let i = 0; i < 2000; i++) agreeSum += E.crossing(E.plan(rnd).filter(x => !x.katch).map(x => ({ r: x.r, tone: rnd() < 0.5 }))).agree;
  console.log(`      a coin-flipping listener: the best split still "explains" ${(100 * agreeSum / 2000).toFixed(0)} % of 18 answers on average (so agreement alone proves little; the catch trials and the band table carry the weight)`);
  check(P, 'a coin-flipping listener’s best split explains well under 100 % (so a clean split is not handed out)', agreeSum / 2000 < 0.8, `${(100 * agreeSum / 2000).toFixed(1)} %`);
}

console.log(`\n${pass} ok, ${fail} failed. What no number here can say: whether the Risset seam is heard, where taps turn to tone for a given ear, and when the lamp looks steady to a given eye.`);
process.exit(fail ? 1 : 0);
