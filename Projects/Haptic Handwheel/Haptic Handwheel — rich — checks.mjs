#!/usr/bin/env node
/*
  title: Haptic Handwheel — rich — checks
  born: 2026-11-03
  links: [[Haptic Handwheel]] (connects-to · rich-face-checks) · checks "Haptic Handwheel — rich — two parts or one.html", "… — the struck spring.html" and "… — a stiff spring down a wire.html"
  forward_vector: I re-run every claim the three made pieces of the rich face show, on the engines inside
    those pieces (pulled out of their own HTML, never a copy), and I check that each piece's engine is still
    the steward's feel_engine.js letter for letter, so a change to either that breaks a claim fails here. I
    print the numbers the manifest's offers quote.

  usage: node "Projects/Haptic Handwheel/Haptic Handwheel — rich — checks.mjs"
*/
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENTRY = 'Haptic Handwheel';
const read = (what) => readFileSync(join(HERE, `${ENTRY} — rich — ${what}.html`), 'utf8');
const between = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error('marker missing: ' + a); return src.slice(i, j + b.length); };
const STEWARD = readFileSync(join(HERE, 'proofs/feel-lab/feel_engine.js'), 'utf8').replace(/\n$/, '');
const RESULTS = JSON.parse(readFileSync(join(HERE, 'proofs/feel-lab/feel_lab_results.json'), 'utf8'));

let fails = 0;
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails++; };
const load = (src, names) => new Function(between(src, '/* ENGINE:START', '/* ENGINE:END */') + '\n' + between(src, '/* SETUP:START', '/* SETUP:END */') + `\nreturn { ${names} };`)();

const pieces = { two: read('two parts or one'), struck: read('the struck spring'), delay: read('a stiff spring down a wire') };
console.log('\nthe engine in each piece');
for (const [name, src] of Object.entries(pieces)) {
  const block = between(src, '/* ENGINE:START', '/* ENGINE:END */');
  const body = block.slice(block.indexOf('*/') + 3, block.lastIndexOf('/* ENGINE:END */') - 1);
  ok(body === STEWARD, `${name}: the engine is proofs/feel-lab/feel_engine.js, letter for letter`);
  ok(!src.includes('rich:' + 'hush'), `${name}: leaves hushing to the kit (never names its message)`);
  ok(!/new\s+(window\.)?AudioContext[^]*?\)/.test(src.slice(0, src.indexOf('function soundOn') > 0 ? src.indexOf('function soundOn') : src.length)), `${name}: makes no audio context outside its click handler`);
}

// ─────────────────────────────── the struck spring ───────────────────────────────
console.log('\nthe struck spring — "a spring wobbles at one rate all the way down, and a pendulum quickens as it settles"');
const S = load(pieces.struck, 'STRUCK, struckKnob, rateMeter, strike, rateSummary, makeEngine, FEELS, BRAKES');
const pct = (x) => (x >= 0 ? '+' : '') + (x * 100).toFixed(1) + '%';
const rows = [];
for (const ideal of [false, true]) for (const pull of [0.3, 0.5, 1.0, 2.0, S.STRUCK.maxPull]) {
  const trim = ideal ? 0 : 2;   // as the piece: on the pretend motor the last two half swings are where friction catches the knob
  const sp = S.rateSummary(S.strike('spring', pull, ideal, 4), trim), pe = S.rateSummary(S.strike('pendulum', pull, ideal, 4), trim);
  rows.push({ ideal, pull, sp, pe });
  console.log(`         ${ideal ? 'ideal knob    ' : 'pretend motor '} pull ${pull.toFixed(1)} rad · spring ${sp ? sp.first.toFixed(2) + '→' + sp.last.toFixed(2) + ' Hz (' + pct(sp.change) + ', ' + sp.halves + ' half swings, end dip ' + pct(sp.endDip) + ')' : 'no wobble'} · pendulum ${pe ? pe.first.toFixed(2) + '→' + pe.last.toFixed(2) + ' Hz (' + pct(pe.change) + ', ' + pe.halves + ', end dip ' + pct(pe.endDip) + ')' : 'no wobble'}`);
}
const MP = S.STRUCK.maxPull, r3 = rows.find(r => !r.ideal && r.pull === MP), r3i = rows.find(r => r.ideal && r.pull === MP);
ok(Math.abs(0.085 * MP) <= 0.2 && 0.085 * (MP + 0.1) > 0.2, `the strike stops at ${MP} rad, just inside where the 0.2 N·m torque cap would clip the spring (2.35 rad)`);
ok(Math.abs(r3.sp.change) < 0.03, `pretend motor, ${MP} rad: the spring keeps one rate within 3% (${pct(r3.sp.change)}), friction's end dip aside (${pct(r3.sp.endDip)})`);
ok(r3.pe.change > 0.1, `pretend motor, ${MP} rad: the pendulum quickens by more than 10% (${pct(r3.pe.change)})`);
ok(Math.abs(r3i.sp.change) < 0.01 && r3i.pe.change > 0.2, `ideal knob, ${MP} rad: spring within 1% (${pct(r3i.sp.change)}), pendulum up more than 20% (${pct(r3i.pe.change)})`);
{ const e = S.makeEngine({ semisPerTurn: 6, basePitch: 57, tauC: 0, quantize: false }); e.setFeel(S.FEELS.struck({ law: 'spring' })); e.s.th = 3; e.s.lastSensedTh = 3; e.s.sensedTh = 3;
  const m = S.rateMeter(); m.reset(e); for (let i = 0; i < 4 * 48000; i++) { e.step(); m.feed(e); }
  console.log(`         for the record: struck from 3 rad (the renders' pull), the ideal spring's first half swing runs ${m.dots[0].hz.toFixed(2)} Hz, against ${m.dots[3].hz.toFixed(2)} once inside the cap`); }
const small = rows.find(r => r.ideal && r.pull === 0.3);
ok(small.pe.change < 0.02, `ideal knob, 0.3 rad: the pendulum quickens by under 2% (${pct(small.pe.change)}): only a big swing tells the laws apart`);
const tiny = rows.find(r => !r.ideal && r.pull === 0.3);
ok(!tiny.sp && !tiny.pe, 'pretend motor, 0.3 rad: friction stops both within a swing, so there is no rate to compare');
// against the steward's renders (struck_spring.wav, struck_pendulum.wav: full-cycle rates)
const stewSp = RESULTS.struck.spring, stewPe = RESULTS.struck.pendulum;
console.log(`         the steward's struck renders, for comparison (full-cycle rates, a ramped pull to 3 rad, smooth friction): spring ${stewSp[0].hz} → ${stewSp[stewSp.length - 1].hz} Hz, pendulum ${stewPe[0].hz} → ${stewPe[stewPe.length - 1].hz} Hz`);
{ const e = S.struckKnob('spring', true); const f0 = Math.sqrt(0.085 / e.J) / (2 * Math.PI);
  ok(Math.abs(r3i.sp.first - f0) / f0 < 0.01, `the spring's rate is the closed form's f₀ = (1/2π)√(k/J) = ${f0.toFixed(3)} Hz (measured ${r3i.sp.first.toFixed(3)})`); }
// the finger and the brakes damp the wobble
{ const count = (bMotor, finger) => { const e = S.struckKnob('spring', false, bMotor); e.s.th = MP; e.s.lastSensedTh = MP; e.s.sensedTh = MP; e.s.brake = finger || 0; const m = S.rateMeter(); m.reset(e); for (let i = 0; i < 4 * 48000; i++) { e.step(); m.feed(e); } return m.dots.length; };
  const c = S.BRAKES.map(b => count(b.b)), f = count(undefined, S.STRUCK.finger);
  console.log(`         half swings after a ${MP} rad pull: brakes ${S.BRAKES.map((b, i) => b.id + ' ' + c[i]).join(', ')} · finger on from the start ${f}`);
  ok(c[0] > c[1] && c[1] >= c[2] && f < c[0], 'the motor\'s brake guesses and a finger each take swings away'); }

// ─────────────────────────────── a stiff spring down a wire ───────────────────────────────
console.log('\na stiff spring down a wire — "delay makes a stiff spring unstable. Soft feels can cross a cable."');
const D = load(pieces.delay, 'LANES, RESCUE_B, BRAKE_LOW, NEEDS, nudge, lateBy, kEdge, verdictFor, makeEngine, FEELS, BRAKES, KX, TY, mapCell');
// the map the last step draws: every cell, against the closed form, away from the edge itself
for (const [hand, extraB, name] of [[false, 0, 'hands off'], [true, 0, 'gripped'], [false, D.RESCUE_B, 'damping on the device']]) {
  let agree = 0, far = 0, all = 0; const t0 = Date.now();
  for (let j = 0; j < D.TY.rows; j++) for (let i = 0; i < D.KX.cols; i++) {
    const K = D.KX.lo * Math.pow(D.KX.hi / D.KX.lo, (i + 0.5) / D.KX.cols), ms = D.TY.lo * Math.pow(D.TY.hi / D.TY.lo, (j + 0.5) / D.TY.rows);
    const edge = (1e-4 + extraB + (hand ? 0.0032 : 0)) / (ms / 1000), g = D.mapCell(K, ms, hand, extraB); all++;
    if (Math.abs(Math.log(K / edge)) > Math.log(1.3)) { far++; if (g === (K > edge)) agree++; } }
  console.log(`         map, ${name}: ${agree} of ${far} cells away from the edge agree with the closed form (${all} cells, ${Date.now() - t0} ms in node)`);
  ok(agree === far, `the map's cells (${name}) match the closed form everywhere but within 30% of the edge`); }
// the engine's edge against the closed form, by bisection, on each lane, hands off and held
for (const L of D.LANES) for (const hand of [false, true]) {
  let lo = 1e-4, hi = 50, sim = Infinity; if (D.nudge(hi, L.loopHz, L.delayMs, hand, 0).grows) { for (let i = 0; i < 18; i++) { const mid = Math.sqrt(lo * hi); if (D.nudge(mid, L.loopHz, L.delayMs, hand, 0).grows) hi = mid; else lo = mid; } sim = Math.sqrt(lo * hi); }
  const th = D.kEdge(L.loopHz, L.delayMs, hand, 0), stew = RESULTS.stability.stab.find(r => r.lane === L.id && r.cap === 'light' && r.hand === (hand ? 'gripped' : 'hands off'));
  const capped = sim > 49;
  console.log(`         ${L.id.padEnd(11)} ${hand ? 'held     ' : 'hands off'} edge ${capped ? '> 50' : sim.toFixed(4)} · closed form ${th.toFixed(4)} · steward (96 kHz) ${stew.kmax.toFixed(4)}`);
  // a 10 kHz loop is only about five 48 kHz physics steps long, so its zero-order hold strays furthest from the closed form there (the steward's 96 kHz sweep: 11%)
  const tol = L.id === 'device-10k' ? 0.3 : 0.12;
  if (!capped) ok(Math.abs(sim - th) / th < tol && Math.abs(sim - stew.kmax) / stew.kmax < tol, `${L.id} ${hand ? 'held' : 'hands off'}: the piece's edge is within ${tol * 100}% of the closed form and of the steward's sweep`);
  else ok(stew.kmax >= 49.9, `${L.id} ${hand ? 'held' : 'hands off'}: past 50 N·m/rad, as the steward's sweep found`);
}
// every feel on every lane, against the steward's verdict table
const NAMEMAP = ['soft centring spring (pitch-wheel return)', 'struck spring, light cap (6 Hz wobble)', 'haptic filtering (knob follows a melody)', 'string bend, near full bend (~1 rad)', 'frets, 24 per turn, 0.03 N·m pull', 'an end stop / wall'];
let agree = 0, total = 0;
D.NEEDS.forEach((n, i) => { const stew = RESULTS.verdicts.find(v => v.feel === NAMEMAP[i]); const mine = D.LANES.map(L => D.verdictFor(n.K, L, 0));
  D.LANES.forEach((L, j) => { total++; if (stew[L.id] === mine[j]) agree++; else console.log(`         differs: ${n.feel} on ${L.id}: piece "${mine[j]}", steward "${stew[L.id]}"`); }); });
ok(agree === total, `the piece's verdict table agrees with the steward's feel_lab_results.json, ${agree} of ${total} cells`);
// the soft feel over a cable: the page's "Soft feels can cross a cable"
{ const soft = D.NEEDS[0].K, usb = D.LANES[2], audio = D.LANES[3];
  const a = D.nudge(soft, usb.loopHz, usb.delayMs, false, 0), b = D.nudge(soft, audio.loopHz, audio.delayMs, false, 0);
  const c = D.nudge(soft, usb.loopHz, usb.delayMs, false, D.RESCUE_B), d = D.nudge(soft, usb.loopHz, usb.delayMs, false, D.BRAKE_LOW - 1e-4);
  const e2 = D.nudge(soft, audio.loopHz, audio.delayMs, false, D.RESCUE_B), f = D.nudge(soft, usb.loopHz, usb.delayMs, true, 0);
  console.log(`         pitch-wheel return (0.03) hands off: USB ×${a.ratio.toFixed(2)}, audio line ×${b.ratio.toFixed(2)} (last fifth ÷ first) · closed-form edge USB ${D.kEdge(usb.loopHz, usb.delayMs, false, 0).toFixed(4)}, audio ${D.kEdge(audio.loopHz, audio.delayMs, false, 0).toFixed(4)}`);
  console.log(`         with the device's 0.002: USB ×${c.ratio.toFixed(3)}, audio ×${e2.ratio.toFixed(3)} · with the motor's brake (low guess): USB ×${d.ratio.toFixed(3)} · held: USB ×${f.ratio.toFixed(3)}`);
  ok(a.grows && b.grows, 'the softest feel on the page grows over USB and over an audio line with no hand and no local damping');
  ok(!c.grows && !d.grows && !e2.grows && !f.grows, 'it crosses calmly with damping kept on the device, with the motor\'s own brake, or held'); }

// ─────────────────────────────── two parts or one ───────────────────────────────
console.log('\ntwo parts or one — "the motor both senses and pushes, and what the synth is doing comes back through the thing already in the hand"');
const T = load(pieces.two, 'HHW, plainKnob, motorKnob, centsOff, settle, makeEngine, FEELS');
// the knob let go from rest where the player left it, some cents off the target (the steward's let-go test)
let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
function tryLand(make, iv, aimCents) {
  const e = make(); const target = T.HHW.basePitch + iv, th = (iv + aimCents / 100) / T.HHW.semisPerTurn * 2 * Math.PI;
  e.s.th = th; e.s.lastSensedTh = th; e.s.sensedTh = th; e.s.hand = false; T.settle(e, 2.5); return T.centsOff(e, target);
}
const N = 80; const plain = [], motor = [], aims = [];
for (let k = 0; k < N; k++) { const iv = [2, 3, 4, 5, 7, 9, 10, 12][k % 8], aim = (rnd() * 2 - 1) * 45; aims.push(aim); plain.push(tryLand(T.plainKnob, iv, aim)); motor.push(tryLand(T.motorKnob, iv, aim)); }
const within = (a, c) => a.filter(x => Math.abs(x) <= c).length, med = (a) => { const s = a.map(Math.abs).sort((x, y) => x - y); return s[s.length >> 1]; };
console.log(`         ${N} let-gos left within ±45 cents of the target: plain knob lands within 10 ¢ ${within(plain, 10)}/${N} (median miss ${med(plain).toFixed(1)} ¢), motor knob ${within(motor, 10)}/${N} (median ${med(motor).toFixed(1)} ¢, worst ${Math.max(...motor.map(Math.abs)).toFixed(1)} ¢)`);
ok(within(motor, 10) === N, 'the motor knob, let go within 45 cents of a note, lands on that note within 10 cents every time');
ok(Math.abs(med(plain) - med(aims)) < 1, `the plain knob stays where it was let go (median miss ${med(plain).toFixed(1)} ¢ against an aim error of ${med(aims).toFixed(1)} ¢)`);
{ const far = []; for (let k = 0; k < 40; k++) far.push(tryLand(T.motorKnob, 5, 55 + rnd() * 40));
  ok(far.every(c => Math.abs(c - 100) < 10), 'left past the ridge (55 to 95 cents off), the motor lands a whole note away: it can only miss by a note'); }
// the notches: dragged slowly by a fingertip, where does the knob spend its time?
{ const share = (make) => { const e = make(); e.s.hand = true; let near = 0; const n = Math.round(3 * e.P.fs);
    for (let i = 0; i < n; i++) { e.s.handTarget = (i / n) * (6 / 24) * 2 * Math.PI; e.step(); const c = (e.pitch() - Math.round(e.pitch())) * 100; if (Math.abs(c) <= 15) near++; } return near / n; };
  const sp = share(T.plainKnob), sm = share(T.motorKnob);
  console.log(`         dragged slowly up six semitones: time within 15 cents of a note, plain knob ${(sp * 100).toFixed(0)}%, motor knob ${(sm * 100).toFixed(0)}%`);
  ok(sm > 0.6 && sp < 0.4, 'dragged, the motor knob holds at the notes (the notches you count); the plain knob passes through evenly'); }
// the push the fingertip feels while dragging across the frets
{ const e = T.motorKnob(); e.s.hand = true; let mx = 0; const n = Math.round(2 * e.P.fs);
  for (let i = 0; i < n; i++) { e.s.handTarget = (i / n) * (6 / 24) * 2 * Math.PI; e.step(); mx = Math.max(mx, Math.abs(e.s.tauHand)); }
  console.log(`         dragging slowly up six semitones: the largest push on the fingertip ${(mx * 1000).toFixed(1)} mN·m`);
  ok(mx > 0.025 && mx < 0.045, 'the push the band shows is the frets\' 30 mN·m pull plus the ridge push, give or take'); }

console.log(fails ? `\n${fails} check(s) failed` : '\nall checks pass');
process.exit(fails ? 1 : 0);
