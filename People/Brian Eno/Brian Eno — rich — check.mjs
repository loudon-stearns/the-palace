// Brian Eno — rich — check. Workshop for [[Brian Eno]]'s rich face (listed in [[Brian Eno — rich.json]]).
// Runs each piece's own engine (its <script id="engine"> block) against the claims the piece makes, and the
// loops piece's returns against an independent search: a sweep over every start, not the piece's own scan.
// node "People/Brian Eno/Brian Eno — rich — check.mjs"   → prints each check and the numbers the faces show; exits 1 on a failure.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const engine = (file, names) => {
  const src = readFileSync(join(here, file), 'utf8').match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
  const C = vm.createContext({ Math, BigInt, Number });
  vm.runInContext(src + '\n;globalThis.X = { ' + names.join(', ') + ' };', C);
  return C.X;
};
const A = engine('Brian Eno — rich — loops of different lengths.html', ['G', 'period', 'nearReturn', 'startsIn', 'human']);
const B = engine('Brian Eno — rich — the frame, counted.html', ['G', 'MENU', 'q', 'frameTally', 'frameQ', 'hourStarts', 'startsPerHour', 'H', 'account', 'coin', 'origin']);

let fails = 0;
const check = (name, ok, detail = '') => { console.log((ok ? 'pass  ' : 'FAIL  ') + name + (detail ? '  · ' + detail : '')); if (!ok) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// ---------- the loops piece ----------
const ENO = [376, 414, 479], EVEN = [128, 192, 256, 384], NUDGE = [128, 192, 256, 385];
check('the lengths Eno gave are 23.5, 25.875, 29.9375 s', ENO.map(l => l / 16).join() === '23.5,25.875,29.9375');
check('4 s and 6 s come back after 12 s', A.period([64, 96]) === 192n);
check('4 s and 8 s come back after 8 s: different lengths, no drift', A.period([64, 128]) === 128n);
check('23.5 s and 25.875 s come back exactly after 81.1 min', A.period([376, 414]) === 77832n, (77832 / 16 / 60).toFixed(2) + ' min');
const Teno = Number(A.period(ENO)) / 16;
check('Eno\'s three come back exactly after 26.97 days', A.period(ENO) === 37281528n, (Teno / 86400).toFixed(4) + ' days');
check('8, 12, 16, 24 s come back after 48 s', A.period(EVEN) === 768n);
check('nudging 24 s by a sixteenth sends the exact return to 5.13 hours', A.period(NUDGE) === 295680n, (295680 / 16 / 3600).toFixed(3) + ' h');

// independent: the first moment after 0 at which every loop starts at once, found by walking the starts
function firstAllTogether(lens, limit16) {
  const next = lens.map(l => l);
  while (true) {
    const m = Math.max(...next); if (m > limit16) return null;
    let all = true;
    for (let i = 0; i < lens.length; i++) { while (next[i] < m) next[i] += lens[i]; if (next[i] !== m) all = false; }
    if (all) return m;
  }
}
check('walking every start: Eno\'s three first start together again at the lcm', firstAllTogether(ENO, 4e7) === 37281528);
check('walking every start: the four even lengths first start together at 48 s', firstAllTogether(EVEN, 1e6) === 768);

// independent: sweep the merged starts of every loop for the first cluster after 0 with one start from each
// loop, all within eps; report the longest loop's start in it (the piece reports that turn too)
function sweep(lens, eps, limit16) {
  const M = Math.max(...lens), iM = lens.indexOf(M);
  for (let t = M; t <= limit16; t += M) {
    // every loop needs a start s with max(s, t) - min(s, t) small; try all combinations of the starts near t
    const cand = lens.map((l, i) => { if (i === iM) return [t]; const k = Math.floor(t / l); return [k * l, (k + 1) * l, (k - 1) * l].filter(s => s > 0 && Math.abs(s - t) <= eps); });
    if (cand.some(c => c.length === 0)) continue;
    let best = Infinity;
    const rec = (i, lo, hi) => { if (i === lens.length) { best = Math.min(best, hi - lo); return; } for (const s of cand[i]) rec(i + 1, Math.min(lo, s), Math.max(hi, s)); };
    rec(0, Infinity, -Infinity);
    if (best <= eps) return t;
  }
  return null;
}
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
let agree = 0, total = 0, differ = [];
for (let k = 0; k < 300; k++) {
  const n = 2 + Math.floor(rnd() * 3), lens = Array.from({ length: n }, () => 32 + Math.floor(rnd() * 160)), eps = Math.floor(rnd() * 3);
  const CAP = 2e5, lim = Math.min(Number(A.period(lens)), CAP * Math.max(...lens));
  const a = A.nearReturn(lens, eps, CAP), b = sweep(lens, eps, lim);
  total++; if (a === b) agree++; else differ.push(lens.join('/') + ' ε' + eps + ': ' + a + ' vs ' + b);
}
check('the piece\'s return-to-within-ε agrees with an independent sweep on 300 random sets', agree === total, agree + '/' + total + (differ.length ? ' · ' + differ.slice(0, 3).join(' ; ') : ''));

const nr = (lens, e) => { const t = A.nearReturn(lens, e); return t == null ? null : t / 16; };
const rows = [['four even', EVEN], ['the four, one nudged', NUDGE], ['Eno\'s three', ENO]];
console.log('\n  set                       exact            ε=1/16 s         ε=1/8 s          ε=1/4 s');
for (const [name, l] of rows) console.log('  ' + name.padEnd(26) + A.human(Number(A.period(l)) / 16).padEnd(17) + [1, 2, 4].map(e => A.human(nr(l, e)).padEnd(17)).join(''));
console.log('');
check('to within 1/8 s, the nudged four still come round at 48.125 s, two turns of the long loop', nr(NUDGE, 2) === 48.125);
check('to within 1/16 s, the nudged four come round later than 48 s', nr(NUDGE, 1) > 48, A.human(nr(NUDGE, 1)));
check('to within 1/8 s, Eno\'s three come round after about 50.6 hours', near(nr(ENO, 2) / 3600, 50.636, 0.01), (nr(ENO, 2) / 3600).toFixed(3) + ' h');
check('to within 1/16 s, after about 235 hours; to within 1/4 s, about 7.5 hours', near(nr(ENO, 1) / 3600, 235.117, 0.01) && near(nr(ENO, 4) / 3600, 7.468, 0.01));
check('every ear return comes no later than the exact one', rows.every(([, l]) => [1, 2, 4].every(e => nr(l, e) <= Number(A.period(l)) / 16)));
const st = A.startsIn([64, 96], 0, 24); // 4 s and 6 s over 24 s
check('startsIn lists every start in order: 4 s and 6 s over 24 s give 6 + 4 starts', st.length === 10 && st.every((s, i) => i === 0 || s.t >= st[i - 1].t));

// ---------- the frame piece ----------
check('the length menu holds 609 options, 2 s to 40 s in sixteenths', B.MENU.lengths === 609);
check('one length is about 9.25 questions', near(B.q(B.MENU.lengths), 9.2504, 1e-3), B.q(609).toFixed(4));
const F3 = { lens: ENO.slice(), notes: [62, 66, 69], snd: 0 };
const want3 = Math.log2(7) + 3 * (Math.log2(609) + Math.log2(25)) + Math.log2(3);
check('a three-loop frame is 2.81 + 3 × (9.25 + 4.64) + 1.58 = 46.07 questions, row by row', near(B.frameQ(F3), want3, 1e-9) && B.frameTally(F3).length === 8, B.frameQ(F3).toFixed(2));
const brute = lens => lens.reduce((a, l) => { let c = 0; for (let n = 0; n * l / 16 < 3600; n++) c++; return a + c; }, 0);
check('starts in an hour: the count, the list and a brute count agree', B.startsPerHour(ENO) === B.hourStarts(ENO).length && B.hourStarts(ENO).length === brute(ENO), B.startsPerHour(ENO) + ' starts');
check('every start in the hour is n × its loop\'s length, and nothing else', B.hourStarts(ENO).every(s => { const o = B.origin(F3, s); return o.t === s.t16 / 16 && s.t16 === s.n * ENO[s.loop]; }));
check('H(1) = 0, H(0.5) = 1, H(0.9) ≈ 0.469', B.H(1) === 0 && B.H(0.5) === 1 && near(B.H(0.9), 0.469, 1e-3));
const a1 = B.account(F3, 1, 1);
check('with no coin the machine decides nothing: share 0', a1.sys === 0 && a1.share === 0 && a1.passesAt === Infinity);
const a5 = B.account(F3, 0.5, 1);
check('with a fair coin the machine decides one question a start', a5.sys === a5.n, a5.n + ' questions in the hour; share ' + (100 * a5.share).toFixed(1) + '%; passes the frame after ' + a5.passesAt.toFixed(1) + ' s');
const a9 = B.account(F3, 0.9, 16);
console.log('        at p = 0.9 with 16 takes: coin ' + a9.sys.toFixed(1) + ' vs you ' + a9.you.toFixed(1) + ', share ' + (100 * a9.share).toFixed(1) + '%, passes at ' + (a9.passesAt / 60).toFixed(1) + ' min');
// the moment the coin passes the person, found by stepping time, not by the formula
const rate = ENO.reduce((s, l) => s + 16 / l, 0);
let tPass = 0; while (tPass * rate * B.H(0.5) < a5.you) tPass += 0.01;
check('the crossing time matches a step-by-step count', near(tPass, a5.passesAt, 0.02), tPass.toFixed(2) + ' s');
const draws = []; for (let i = 0; i < 7; i++) for (let n = 0; n < 4000; n++) draws.push(B.coin(1, i, n));
const frac = p => draws.filter(x => x < p).length / draws.length;
check('the coin is fair enough: the share under p lands near p', [0.5, 0.7, 0.9].every(p => near(frac(p), p, 0.012)), [0.5, 0.7, 0.9].map(p => frac(p).toFixed(3)).join(' / '));
check('the coin falls the same way for the same loop, turn and throw', B.coin(3, 2, 17) === B.coin(3, 2, 17) && B.coin(3, 2, 17) !== B.coin(4, 2, 17));

console.log(fails ? '\n' + fails + ' failed' : '\nall pass');
process.exit(fails ? 1 : 0);
