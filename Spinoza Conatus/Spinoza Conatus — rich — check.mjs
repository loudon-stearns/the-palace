#!/usr/bin/env node
// Spinoza Conatus — rich — check: runs the two pieces' own cores in Node and reads their claims back.
// born: 2026-11-03 · links: [[Spinoza Conatus]] (connects-to · rich-face-check)
// forward_vector: I re-measure what the two pieces tell a reader, from their own code, so a change to either shows here first.
// Run: node "Spinoza Conatus/Spinoza Conatus — rich — check.mjs"   (exits 1 on any failure)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
function core(file, id, name){
  const html = readFileSync(join(here, file), 'utf8');
  const m = html.match(new RegExp('<script id="' + id + '">([\\s\\S]*?)</script>'));
  if (!m) throw new Error('no core ' + id + ' in ' + file);
  const box = { module: { exports: null } }; vm.createContext(box); vm.runInContext(m[1], box);
  return box.module.exports || box[name];
}
let fails = 0;
function ok(cond, what, num){ console.log((cond ? 'ok   ' : 'FAIL ') + what + (num !== undefined ? '  ' + num : '')); if (!cond) fails++; }

// ---------- three things pushed ----------
const P = core('Spinoza Conatus — rich — three things pushed.html', 'persist-core', 'PERSIST');
console.log('three things pushed');
const once = ['rock', 'bowl', 'keeper'].map(k => P.pushOnce(k, 2));
ok(once[0].x > 1, 'rock, pushed once, stops away from its place and stays', once[0].x.toFixed(4));
ok(Math.abs(once[1].x) < 1e-3 && once[1].effort === 0, 'bowl, pushed once, returns and spends nothing', once[1].x.toExponential(2));
ok(Math.abs(once[2].x) < 1e-3 && once[2].effort > 0, 'keeper, pushed once, returns and spends effort', once[2].effort.toFixed(3));
const t = P.test(), rows = t.rows;
ok(rows[0].v > 0.8 && rows[0].x > 20, 'rock under a steady push slides on (x after 30 s, speed F/c = 0.833)', rows[0].x.toFixed(2) + ' at ' + rows[0].v.toFixed(3));
ok(Math.abs(rows[1].x - 0.5) < 1e-3, 'bowl under F = 1 sits at F/k = 0.5', rows[1].x.toFixed(6));
ok(rows[2].pass && Math.abs(rows[2].x) < 0.005, 'keeper under F = 1 holds within the rule (|x| < 0.005)', rows[2].x.toExponential(2) + ', pushing back ' + rows[2].held.toFixed(3));
ok(!rows[3].pass && Math.abs(rows[3].x - 1 / 6) < 1e-3, 'control: keeper with no memory fails the rule, at F/(k + Kp) = 0.1667', rows[3].x.toFixed(4));
ok(!rows[4].pass && Math.abs(rows[4].x - 0.25) < 1e-3, 'keeper pushed past its power gives way to (F − U)/k = 0.25', rows[4].x.toFixed(4));
ok(t.distinctionReal, 'the page\'s line is real in the model, and the rule could fail (the control fails it)');
// the null: the rule must also fail a keeper so weak in memory it can't come home in 30 s
P.P.Ki = 0.05; const weak = P.lean('keeper', 1); P.P.Ki = 6;
ok(Math.abs(weak.x) >= 0.005, 'null: a keeper with almost no memory (Ki = 0.05) fails the rule', weak.x.toFixed(4));

// ---------- five voices coupled ----------
const K = core('Spinoza Conatus — rich — five voices coupled.html', 'kura-core', 'KURA');
console.log('five voices coupled');
const kc = K.kc({}) / K.TAU, kca = K.kc(K.ANCHOR) / K.TAU;
ok(Math.abs(kc - K.KC_HZ) < 0.02, 'even lock point, re-measured, matches the piece\'s 7.85 Hz', kc.toFixed(3));
ok(Math.abs(kca - K.KC_ANCHOR_HZ) < 0.02, 'anchor lock point, re-measured, matches the piece\'s 9.32 Hz', kca.toFixed(3));
const T = K.test();
const mean = K.NAT.reduce((a, b) => a + b, 0) / 5;
T.forEach(r => console.log('     ' + r.arm.padEnd(12) + (r.mult + '×').padStart(6) + '  locked ' + String(r.locked).padEnd(5) + ' pitch ' + (220 + r.omega).toFixed(4) + '  nearest ' + K.NAMES[r.who] + ' ' + r.nearest.toFixed(4) + '  spread ' + r.spread.toFixed(2) + '°  r ' + r.r.toFixed(3) + '  most moved ' + r.mostMoved.toFixed(3)));
const even = T.filter(r => r.arm === 'even'), anc = T.filter(r => r.arm !== 'even');
ok(!even[0].locked && !anc[0].locked, 'below the lock (0.5×) neither crowd locks: too little, nothing cooperates');
ok(even.slice(1).every(r => r.locked && !r.dominates && Math.abs(r.omega - mean) < 1e-6), 'even crowd: locked at every K from 1.05× to 20×, pitch on the mean (220.4), no voice dominates', even.slice(1).map(r => (220 + r.omega).toFixed(6)).join(' '));
ok(anc.slice(1).every(r => r.locked && r.dominates && K.NAMES[r.who] === 'E'), 'control: anchored crowd locked at E\'s own 226 Hz at every K past its lock, the rule reads domination', anc.slice(1).map(r => (220 + r.omega).toFixed(6)).join(' '));
ok(even[4].same && !even[1].same, 'even crowd: sameness grows with K (spread under 5° at 20×, not at 1.05×)', even[1].spread.toFixed(2) + '° → ' + even[4].spread.toFixed(2) + '°');
const lead2 = even[2].lead, order = [0, 1, 2, 3, 4].sort((a, b) => lead2[a] - lead2[b]).join('');
ok(order === '01234', 'leads at 2× in the order of the voices\' own pitches (A lowest … E highest)', lead2.map(v => v.toFixed(1)).join(' '));
ok(Math.abs(even[2].run[0] - K.NAT[0] - 4.4) < 1e-3 && Math.abs(K.NAT[4] - even[2].run[4] - 5.6) < 1e-3, 'in the even lock A is moved 4.40 Hz up and E 5.60 Hz down: sounding pitch overridden', (even[2].run[0] - K.NAT[0]).toFixed(4) + ' / ' + (even[2].run[4] - K.NAT[4]).toFixed(4));
// let go: lock, then K = 0 and measure. This cannot fail: a voice's own pitch is a constant of the equation.
const s = K.make(); s.K = K.TAU * 2 * K.KC_HZ; for (let i = 0; i < 20000; i++) K.step(s, 1 / 1000);
const back = K.measure({ K: 0, th: s.th, settle: 0.001, win: 5 });
ok(back.run.every((f, i) => Math.abs(f - K.NAT[i]) < 1e-9), 'let go: every voice back on its own pitch (holds by construction, cannot fail)', Math.max(...back.run.map((f, i) => Math.abs(f - K.NAT[i]))).toExponential(1));
// the step the sound uses: the same lock at the audio rate
const audio = K.measure({ K: K.TAU * 2 * K.KC_HZ, dt: 1 / 48000, settle: 6, win: 3 });
ok(audio.locked && Math.abs(audio.omega - even[2].omega) < 1e-4, 'at the worklet\'s rate (1/48000 s) the even crowd locks at the same pitch', (220 + audio.omega).toFixed(5));
const anc48 = K.measure(Object.assign({ K: K.TAU * 2 * K.KC_ANCHOR_HZ, dt: 1 / 48000, settle: 6, win: 3 }, K.ANCHOR));
ok(anc48.locked && Math.abs(anc48.omega - 6) < 1e-4, 'at the worklet\'s rate the anchored crowd locks on E', (220 + anc48.omega).toFixed(5));
// what the listener gets: RMS of the played signal, apart and at twice the lock
const q = K.playedRms({ K: 0 }), l = K.playedRms({ K: K.TAU * 2 * K.KC_HZ });
const qs = K.playedRmsSampled({ K: 0 }), ls = K.playedRmsSampled({ K: K.TAU * 2 * K.KC_HZ });
ok(Math.abs(20 * Math.log10(q / qs)) < 0.1 && Math.abs(20 * Math.log10(l / ls)) < 0.1, 'the page\'s level from phases agrees with the sum sampled at 48 kHz within 0.1 dB', (20 * Math.log10(q / qs)).toFixed(3) + ' / ' + (20 * Math.log10(l / ls)).toFixed(3) + ' dB');
console.log('     played RMS apart ' + (20 * Math.log10(q)).toFixed(2) + ' dBFS, at 2× lock ' + (20 * Math.log10(l)).toFixed(2) + ' dBFS');
ok(l / q > 1.5, 'the whole is louder locked than apart, measured on the played signal', (20 * Math.log10(l / q)).toFixed(2) + ' dB');
ok(l * Math.SQRT2 <= K.GAIN + 1e-9, 'the loudest the sum can reach (0.22 peak) stays under the guard limiter\'s −6 dBFS threshold', (20 * Math.log10(K.GAIN)).toFixed(1) + ' dBFS peak');
// the page's own finding about anchors: stubbornness without pull doesn't land the crowd
const weakAnchor = K.measure({ K: K.TAU * 2 * K.KC_ANCHOR_HZ, recv: [1,1,1,1,0], send: [1,1,1,1,1] });
ok(!weakAnchor.locked, 'an anchor that listens to no one but pulls no harder (K_send = 1) does not lock the crowd at 2× (Kuramoto page § Stubbornness)', weakAnchor.run.map(f => (220 + f).toFixed(2)).join(' '));

console.log(fails ? fails + ' failed' : 'all passed');
process.exit(fails ? 1 : 0);
