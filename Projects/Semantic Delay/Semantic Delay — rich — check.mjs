// title: Semantic Delay — rich — check
// born: 2026-11-03
// links: [[Semantic Delay]] (connects-to · rich-face-workshop) · checks "Semantic Delay — rich — what the knob holds.html" and "— how long a delay.html"
// forward_vector: I run both walks' engines in Node against the measurement they read and the plugin code they describe,
//   so a change to a take, the knob or the plugin's timing that breaks a step's claim fails here first.
// Run: python3 "Projects/Semantic Delay/Semantic Delay — rich — measure.py" && node "Projects/Semantic Delay/Semantic Delay — rich — check.mjs"
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const engine = name => {
  const html = readFileSync(join(here, `Semantic Delay — rich — ${name}.html`), 'utf8');
  const mod = { exports: {} };
  new Function('module', html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1])(mod); // exactly as the page runs it
  return mod.exports;
};
const M = JSON.parse(readFileSync(join(here, 'Semantic Delay — rich — measure.json'), 'utf8'));
let fails = 0;
const ok = (cond, what, got) => { console.log((cond ? '  ok   ' : '  FAIL ') + what + (got !== undefined ? '  →  ' + got : '')); if (!cond) fails++; };
const f2 = v => (+v).toFixed(2);

console.log('the data each walk carries');
for (const [name, part] of [['what the knob holds', 'knob'], ['how long a delay', 'delay']]) {
  const html = readFileSync(join(here, `Semantic Delay — rich — ${name}.html`), 'utf8');
  const inline = html.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/)[1];
  ok(JSON.stringify(JSON.parse(inline)) === JSON.stringify(M[part]), `${name}: its data block is measure.json's "${part}", unchanged`);
}

console.log('what the knob holds — the takes and the knob against what each step says');
{
  const A = engine('what the knob holds'), k = M.knob, e = k.echoes;
  ok(Math.abs(e['1.0'].melody_st - e['1.0'].melody_st_rmvpe) <= 0.1, 'step 2 · the sandbox tracker agrees with RMVPE on the K = 1 echo', `${e['1.0'].melody_st} vs ${e['1.0'].melody_st_rmvpe} st`);
  ok(e['1.0'].melody_st < e['0.5'].melody_st && e['0.5'].melody_st < e['0.0'].melody_st, 'step 3 · the melody moves further as K falls', `${e['1.0'].melody_st}, ${e['0.5'].melody_st}, ${e['0.0'].melody_st} st`);
  for (const K of ['1.0', '0.5', '0.0']) ok(Math.abs(e[K].melody_st - e[K].melody_st_rmvpe) <= 0.15, `step 3 · K = ${K}: tracker within 0.15 st of RMVPE`, `${e[K].melody_st} vs ${e[K].melody_st_rmvpe}`);
  ok(['1.0', '0.5', '0.0'].every(K => e[K].rhythm_best_lag_ms === 0), 'step 4 · every echo lines up with your phrase best at 0 ms');
  const rs = ['1.0', '0.5', '0.0'].map(K => e[K].rhythm_r);
  ok(Math.max(...rs) - Math.min(...rs) <= 0.03, 'step 4 · rhythm agreement with yours is the same at every K', rs.join(', '));
  ok(Object.values(k.echo_vs_echo_r).every(r => r >= 0.9), 'step 4 · the three echoes share one rhythm (r ≥ 0.9)', Object.values(k.echo_vs_echo_r).join(', '));
  ok(['1.0', '0.5', '0.0'].every(K => e[K].rhythm_r_shift_120ms < 0.6 * e[K].rhythm_r), 'step 4 · shifting an echo 120 ms loses most of the agreement, so r measures timing', ['1.0', '0.5', '0.0'].map(K => e[K].rhythm_r_shift_120ms).join(', '));
  const sw = k.sweep;
  ok(sw.every((p, i) => i === 0 || p[1] <= sw[i - 1][1] + 0.02), 'step 4 · the knob\'s swept distance only falls as K rises');
  ok(A.offLine(sw) <= 0.25 && Math.abs(A.offLine(sw) - k.sweep_max_off_line_st) < 0.002, 'step 4 · it never strays far from a straight line (the engine agrees with the measure)', `${f2(A.offLine(sw))} st`);
  ok(Math.abs(A.at(sw, 0) - k.sweep_rmvpe_check['0.0']) <= 0.2 && Math.abs(A.at(sw, 0.5) - k.sweep_rmvpe_check['0.5']) <= 0.2, 'step 4 · the sweep\'s asked distances match the 14 October run at K = 0 and 0.5', `${f2(A.at(sw, 0))}/${k.sweep_rmvpe_check['0.0']}, ${f2(A.at(sw, 0.5))}/${k.sweep_rmvpe_check['0.5']}`);
  ok(A.slide(1, 1) === 0 && A.slide(1.5, 1) === 0 && A.slide(0.99, 1) > 0, 'step 4 · Kuramoto: two oscillators lock at K = |Δω| and stay locked above it');
  const v0 = sw[0][1], knob = x => A.at(sw, x) / v0, kura = x => A.slide(2 * x, 1);
  ok(A.bend(kura) > 10 * A.bend(knob), 'step 4 · Kuramoto has a knee the knob does not', `sharpest bend ${f2(A.bend(kura))} vs ${f2(A.bend(knob))}`);
  ok(A.settle(1, 64, 60) === 64 && A.settle(0, 64, 60) === 60 && A.settle(0.5, 64, 60) === 62, 'step 4 · the knob settles on a blend, K of the way to your melody');
  const code = readFileSync(join(here, 'standalone/coupling.py'), 'utf8');
  ok(/state \+= a \* \(K \* \(coast\[i\] - state\) \+ \(1\.0 - K\) \* \(free\[i\] - state\)\)/.test(code), 'step 3 · the rule shown is the one in coupling.py');
}

console.log('how long a delay — the plugin\'s timing against what each step says');
{
  const B = engine('how long a delay'), d = M.delay;
  const alg = readFileSync(join(here, 'plugin/src/Algorithm.h'), 'utf8');
  ok(/kHangoverSec\s*=\s*0\.30/.test(alg) && /kMaxPhraseSec\s*=\s*8\.0/.test(alg) && B.HANG === 0.3 && B.MAXL === 8, 'step 1 · the gate is 0.3 s and a phrase is cut at 8 s, as in Algorithm.h');
  ok(/const int64_t due = s\.end \+ \(int64_t\) \(i \+ 1\) \* s\.delay;/.test(alg), 'step 3 · the plugin counts the delay from the phrase\'s end');
  ok(/s\.end\s*=\s*now \+ 1;/.test(alg.slice(alg.indexOf('void close'))), 'step 3 · and the end is the moment the gate closes');
  for (const s of d.speeds) {
    ok(Math.abs(B.work(4, s.rtf) - s.delay_for_4s_phrase) < 1e-3 && Math.abs(B.work(8, s.rtf) - s.delay_for_8s_phrase) < 1e-3 && Math.abs(B.longest(s.rtf, 8) - s.longest_phrase_for_8s) < 1e-3,
      `step 5 · ${s.rtf.toFixed(2)} (${s.label}): the engine and the measure agree`, `8 s carries ${f2(B.longest(s.rtf, 8))} s`);
  }
  const rt = B.schedule(d.realtime.echoes.map(e => ({ close: e.close, sent: e.sent, rtf: e.rtf, due: e.due })));
  ok(rt.every((j, i) => Math.abs(j.ready - d.realtime.echoes[i].ready_model) < 1e-3), 'step 4 · the engine\'s schedule matches the measure\'s for the plugin run');
  ok(rt.every(j => j.late === 0) && d.realtime.echoes.every(e => e.late_reported === 0 && Math.abs(e.started - e.due) < 1e-6), 'step 4 · the plugin run: every echo ready before due, and the plugin started each on time', rt.map(j => f2(j.due - j.ready)).join(', ') + ' s to spare');
  const off = B.schedule(d.offline.phrases.map(p => ({ close: p.close, sent: p.sent, rtf: p.rtf, due: p.due })));
  ok(off.every((j, i) => Math.abs(j.late - d.offline.phrases[i].late_live) < 1e-3 && j.late > 0), 'step 4 · the offline run at 8 s would have been late live', off.map(j => f2(j.late)).join(', ') + ' s');
  ok(d.offline.phrases.every(p => Math.abs(p.echo_heard_at - p.due) < 0.35), 'step 4 · the offline file plays each echo where it was due', d.offline.phrases.map(p => `${p.echo_heard_at}/${p.due}`).join(', '));
  const pc = d.page_claim;
  ok(B.onTime(pc.phrase, pc.rtf, pc.delay), 'step 5 · the page: a 4 s phrase at 1.65 fits an 8 s delay', `${f2(B.work(pc.phrase, pc.rtf))} s of work`);
  ok(!B.onTime(8, pc.rtf, pc.delay) && B.longest(pc.rtf, pc.delay) < 5, 'step 5 · but an 8 s delay at 1.65 does not carry the plugin\'s longest phrase', `carries ${f2(B.longest(pc.rtf, pc.delay))} s of 8`);
  ok(Math.abs(B.heardAfter(4, 8) - 12.3) < 1e-9, 'step 3 · a 4 s phrase at an 8 s delay is heard 12.3 s after its first word');
}

console.log(fails ? `\n${fails} failed` : '\nall passed');
process.exit(fails ? 1 : 0);
