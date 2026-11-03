// title: Playful Interface Design — rich — check
// born: 2026-11-03
// links: [[Playful Interface Design]] (connects-to · rich-face-check) · checks "Playful Interface Design — rich — legible before lovely.html"
// forward_vector: I re-run, in Node, every number the legible-before-lovely piece states: that its engine is the
//   Blood Compressor prototype's byte for byte, that each threshold puts the deepest squeeze on its bin, that the
//   twenty-four looks are balanced, what each amount of juice does to the drawn opening, how a reader who measured
//   only the narrowest drawn width would score, and the chance numbers behind the rule. Run:
//   node "Playful Interface Design/Playful Interface Design — rich — check.mjs"
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path'; import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const page = fs.readFileSync(path.join(here, 'Playful Interface Design — rich — legible before lovely.html'), 'utf8');
const proto = fs.readFileSync(path.join(root, 'Projects/Blood Compressor/stage2-vessel-prototype-v3.html'), 'utf8');
const block = (src, id) => { const m = src.match(new RegExp('<script id="' + id + '">([\\s\\S]*?)</script>')); if (!m) throw new Error('no script ' + id); return m[1]; };

let fails = 0;
const ok = (cond, what) => { console.log((cond ? 'PASS ' : 'FAIL ') + what); if (!cond) fails++; };

// 1. the engine is the prototype's, unchanged
ok(block(page, 'dsp') === block(proto, 'dsp'), 'engine: the page\'s dsp script is byte-identical to stage2-vessel-prototype-v3.html\'s');

const ctx = { module: {} }; vm.createContext(ctx);
vm.runInContext(block(page, 'dsp'), ctx); ctx.BC = ctx.module.exports;
ctx.module = {}; vm.runInContext(block(page, 'pid-core'), ctx);
const K = ctx.module.exports, { PID } = K;

// 2. the piece leaves hushing to the kit: it never names the kit's hush message
ok(!page.includes('rich' + ':hush') && !page.includes('rich' + ':height'), 'kit: the page never names the kit\'s hush or height messages, so the kit does both');

// 3. each threshold puts the deepest squeeze (over the last two beats, after 6 s) on its bin's target
const beat = 60 / 72;
for (const inDb of PID.INPUTS) PID.BINS.forEach((B, b) => {
  const s = new K.PidSim(PID.TH[String(inDb)][b], inDb, PID.SR); s.run(6);
  const deep = s.deepest(2 * beat);
  ok(Math.abs(deep - B.target) <= 0.4 && K.pidBinOf(deep) === b, `threshold: input ${inDb} dB, bin "${B.label}", th ${PID.TH[String(inDb)][b]} dB → deepest ${deep.toFixed(2)} dB (target ${B.target})`);
});

// 4. the same at 44.1 kHz, where sound may run (the walk's engine is rebuilt at the context's rate)
{ const s = new K.PidSim(PID.TH['0'][2], 0, 44100); s.run(6); const d = s.deepest(2 * beat); ok(Math.abs(d - 7) <= 0.5, `rate: at 44.1 kHz the "fair amount" setting gives ${d.toFixed(2)} dB`); }

// 5. the twenty-four looks: eight per amount, every bin twice, loud and soft once each
const T = K.pidTrials();
ok(T.length === 24, 'looks: 24');
for (const L of PID.LEVELS){ const t = T.filter(x => x.level === L.id); ok(t.length === 8 && PID.BINS.every((B, b) => t.filter(x => x.bin === b).map(x => x.inDb).sort().join() === '-6,0'), `looks: ${L.id} has 8, each bin once loud and once soft`); }

// 6. the opening is the gain; the amounts of juice are what the steps say
ok(Math.abs(K.pidOpen(6) - 0.501) < 0.001 && Math.abs(K.pidOpen(12) - 0.251) < 0.001, `opening: 6 dB → ${K.pidOpen(6).toFixed(3)}, 12 dB → ${K.pidOpen(12).toFixed(3)}`);
const lv = Object.fromEntries(PID.LEVELS.map(L => [L.id, [K.pidMeaning(L.j), K.pidDecor(L.j)]]));
ok(lv.none.join() === '0,0' && lv.middle.join() === '1,0' && lv.heavy.join() === '1,1', `juice: none m,d = ${lv.none}; middle = ${lv.middle}; most = ${lv.heavy}`);

// 7. share of the drawn opening's change the gain accounts for, per amount, per squeeze
console.log('\nshare of the drawn opening\'s change that the gain accounts for (r², five seconds of history):');
console.log('  bin            input   none    middle  most');
for (const [b, B] of PID.BINS.entries()) for (const inDb of PID.INPUTS){
  const s = new K.PidSim(PID.TH[String(inDb)][b], inDb, PID.SR); s.run(6);
  const f = j => { const v = s.share(j); return v == null ? '  —   ' : (v * 100).toFixed(1).padStart(5) + '%'; };
  console.log('  ' + B.label.padEnd(14) + String(inDb).padStart(4) + '   ' + f(0) + '  ' + f(0.45) + '  ' + f(1));
  if (b > 0){ ok(s.share(0) > 0.999 && s.share(0.45) > 0.999, `share: ${B.label}, input ${inDb}: none and middle 100%`); }
}

// 8. a reader who measures only the narrowest drawn opening in the look, and picks the bin whose opening is nearest (in log)
const binOpen = PID.BINS.map(B => K.pidOpen(B.target));
function idealRead(trial){
  const s = new K.PidSim(trial.th, trial.inDb, PID.SR); s.run(5); s.run(PID.LOOK_S);
  let mn = Infinity; const n0 = PID.HIST - Math.round(PID.LOOK_S * PID.HZ);
  for (let i = n0; i < PID.HIST; i++){ const w = K.pidDrawn(s.gr[i], s.det[i], trial.j); if (w < mn) mn = w; }
  let best = 0, bd = Infinity; binOpen.forEach((o, k) => { const e = Math.abs(Math.log(mn / o)); if (e < bd){ bd = e; best = k; } });
  return { mn, best };
}
const ideal = {}; for (const L of PID.LEVELS) ideal[L.id] = 0;
console.log('\nthe narrowest-width reader, look by look:');
for (const t of T){ const r = idealRead(t); if (r.best === t.bin) ideal[t.level]++; console.log(`  ${t.level.padEnd(6)} bin ${t.bin} input ${String(t.inDb).padStart(2)}: narrowest ${r.mn.toFixed(3)} → reads bin ${r.best}${r.best === t.bin ? '' : '  (wrong)'}`); }
console.log(`  right: none ${ideal.none}/8 · middle ${ideal.middle}/8 · most ${ideal.heavy}/8`);
ok(ideal.none === 8 && ideal.middle === 8 && ideal.heavy === 7 && page.includes('seven of eight at the most'), 'narrowest-width reader: 8 of 8 at none and at the middle, 7 of 8 at the most, as the reveal says');
{ const w = T.filter(t => t.level === 'heavy' && t.bin > 0).map(t => { const a = idealRead(t).mn, b = idealRead({ ...t, j: 0 }).mn; return a / b; });
  const lo = Math.min(...w), hi = Math.max(...w); console.log(`  the pump widens the narrowest point by ${((lo - 1) * 100).toFixed(1)}% to ${((hi - 1) * 100).toFixed(1)}%`);
  ok(Math.round((lo - 1) * 100) === 18 && Math.round((hi - 1) * 100) === 25 && page.includes('18 to 25%'), 'reveal text: the pump widens the narrowest point 18 to 25%'); }

// 9. the rule's numbers
const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
const pmf = (n, p) => Array.from({ length: n + 1 }, (_, k) => C(n, k) * p ** k * (1 - p) ** (n - k));
const atLeast = (n, p, k) => pmf(n, p).slice(k).reduce((a, b) => a + b, 0);
const diffAtLeast = (n, p, t) => { const a = pmf(n, p); let s = 0; for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) if (i - j >= t) s += a[i] * a[j]; return s; };
const g5 = atLeast(8, 0.25, 5), fa75 = diffAtLeast(8, 0.75, 3), fa50 = diffAtLeast(8, 0.5, 3), fa25 = diffAtLeast(8, 0.25, 3);
console.log(`\nrule: a guesser reads 5+ of 8 with p = ${(g5 * 100).toFixed(2)}%; two equal amounts differ by 3+ with p = ${(fa75 * 100).toFixed(1)}% at 6 of 8, ${(fa50 * 100).toFixed(1)}% at 4 of 8, ${(fa25 * 100).toFixed(1)}% at 2 of 8`);
ok(page.includes('2.7%') && Math.abs(g5 - 0.027) < 0.0005, 'rule text: 2.7% for a guesser reaching 5 of 8');
ok(page.includes('7% at 6 of 8') && Math.round(fa75 * 100) === 7, 'rule text: 7% at 6 of 8');
ok(page.includes('10.5% at 4 of 8') && (fa50 * 100).toFixed(1) === '10.5', 'rule text: 10.5% at 4 of 8');

// 10. the verdict function does what the rule says
const sc = (n, m, h) => ({ none: { right: n }, middle: { right: m }, heavy: { right: h } });
const v1 = K.pidVerdict(sc(7, 7, 3)), v2 = K.pidVerdict(sc(4, 7, 5)), v3 = K.pidVerdict(sc(7, 6, 6)), v4 = K.pidVerdict(sc(2, 4, 8));
ok(v1.past === 'call' && v1.top === 'same' && v1.legible, 'verdict: 7,7,3 → past the middle called; none and middle the same');
ok(v2.past === 'leans' && v2.top === 'call', 'verdict: 4,7,5 → leans; top of the U called');
ok(v3.past === 'same' && v3.top === 'same', 'verdict: 7,6,6 → the same both ways');
ok(v4.past === 'reverse' && !v4.legible, 'verdict: 2,4,8 → reversed; middle not better than a guess');

// 11. scoring
const tr = K.pidTrials(), ans = {}; tr.forEach(t => { ans[t.id] = t.level === 'heavy' ? Math.min(3, t.bin + 1) : t.bin; });
const s = K.pidScore(tr, ans);
ok(s.none.right === 8 && s.middle.right === 8 && s.heavy.right === 2 && s.heavy.one === 6, `score: all right at none and middle, one bin high at most → most ${s.heavy.right} right, ${s.heavy.one} off by one`);

console.log(fails ? `\n${fails} FAILED` : '\nall PASS');
process.exit(fails ? 1 : 0);
