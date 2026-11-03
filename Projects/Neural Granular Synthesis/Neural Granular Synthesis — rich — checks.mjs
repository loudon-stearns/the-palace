#!/usr/bin/env node
/*
  title: Neural Granular Synthesis — rich — checks
  born: 2026-11-03
  links: [[Neural Granular Synthesis]] (connects-to · rich-face-checks) · listed beside [[Neural Granular Synthesis — rich.json]]
  forward_vector: I re-run, headless, the claims the rich face's made pieces make, on the pieces' own engine
    code pulled out of their HTML, and print the numbers their steps and the manifest's offers quote.

  node "Neural Granular Synthesis — rich — checks.mjs" [ladder|attack|all] [--quick]

  ladder  the crowd-size ladder: gappiness by crowd size at drift / near lock / locked, three crowds each,
          against a phase-scrambled steady-noise floor (render_crowd_size.py's texture_floor), and against
          the steward's crowd-size-table.json. Also: the one-grain cycle count, and grains a second.
  attack  the lock's attack: settled core synchrony across tightness for life 0 / 50 % × lumpiness 0 / 1
          on the piece's own engine (crowd_engine.js's Crowd + render_lumpiness.js's lumpy crowd), the
          half-lock point and the 0.3 → 0.7 width, against the steward's lumpiness.json; and the edge
          1/(1 − life).
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = 'Neural Granular Synthesis';
const which = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'all';
const QUICK = process.argv.includes('--quick');

function engineOf(file, names) {
  const html = fs.readFileSync(path.join(HERE, `${ENTRY} — rich — ${file}.html`), 'utf8');
  const m = html.match(/\/\* ENGINE:START[\s\S]*?\/\* ENGINE:END \*\//);
  if (!m) throw new Error('no ENGINE block in ' + file);
  return new Function(m[0] + '\nreturn {' + names.join(',') + '};')();
}

// ── radix-2 FFT, in place ──
function fft(re, im, inv) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const a = (inv ? 2 : -2) * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) { const ur = re[i + k], ui = im[i + k], xr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, xi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + xr; im[i + k] = ui + xi; re[i + k + len / 2] = ur - xr; im[i + k + len / 2] = ui - xi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } }
  if (inv) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}
function mulberry(seed) { let s = seed >>> 0; return () => { let t = (s += 0x6D2B79F5); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// steady noise with the same long-term spectrum: keep |X(f)|, scramble the phases (Hermitian, so the result is real)
function scramble(y, seed) {
  const n = y.length, re = Float64Array.from(y), im = new Float64Array(n), r = mulberry(seed * 101 + 7);
  fft(re, im, false);
  for (let k = 1; k < n / 2; k++) { const m = Math.hypot(re[k], im[k]), a = 2 * Math.PI * r(); re[k] = m * Math.cos(a); im[k] = m * Math.sin(a); re[n - k] = re[k]; im[n - k] = -im[k]; }
  im[0] = 0; im[n / 2] = 0;
  fft(re, im, true); return re;
}
const gapOf = (G, SR, y) => { const g = G(SR, Math.floor(y.length / Math.round(0.01 * SR))); for (const v of y) g.push(v); return g.value(); };

function ladder() {
  const { GrainCrowd, Gappiness } = engineOf('crowd-size ladder', ['GrainCrowd', 'Gappiness']);
  const SR = 48000, LEN = 1 << 18;           // 5.46 s at 48 kHz, a power of two for the floor's FFT (the steward recorded 4 s)
  const NS = QUICK ? [4, 32, 512] : [4, 8, 16, 32, 64, 128, 256, 512];
  const KS = [['drift', 0], ['near', 0.2], ['locked', 1.6]];
  const SEEDS = QUICK ? [3] : [3, 11, 29];
  const table = JSON.parse(fs.readFileSync(path.join(HERE, 'crowd-size-table.json'), 'utf8'));
  const name = { drift: 'DRIFT', near: 'LOOSE', locked: 'LOCKED' };
  const rows = [];
  console.log('\nLADDER · gappiness (10 ms frames, std/mean) · mean of ' + SEEDS.length + ' crowds · 6 s warm, then 5.46 s');
  console.log('coupling  N     r      grains/s  gap    floor  gap÷floor | steward: gap  floor  ratio');
  for (const [c, K] of KS) for (const N of NS) {
    const acc = [];
    for (const seed of SEEDS) {
      const e = GrainCrowd(SR); Object.assign(e.P, { N, K, seed, grainMs: 90 }); e.build(); e.warm(6.0);
      const y = new Float32Array(LEN); let spikes = 0, rs = 0, rk = 0;
      for (let k = 0; k < LEN; k += 480) { const b = y.subarray(k, Math.min(LEN, k + 480)); e.render(b, b.length, () => spikes++); rs += e.r(); rk++; }
      const g = gapOf(Gappiness, SR, y), f = gapOf(Gappiness, SR, scramble(y, seed));
      acc.push([rs / rk, spikes / (LEN / SR), g, f]);
    }
    const m = acc[0].map((_, j) => acc.reduce((a, x) => a + x[j], 0) / acc.length);
    const st = table.find(t => t.coupling === name[c] && t.N === N);
    rows.push({ coupling: c, K, N, r: +m[0].toFixed(3), grains_per_s: +m[1].toFixed(1), gap: +m[2].toFixed(3), floor: +m[3].toFixed(3), ratio: +(m[2] / m[3]).toFixed(2), steward: st && { gap: st.gappiness, floor: st.floor_gap, ratio: +(st.gappiness / st.floor_gap).toFixed(2) } });
    console.log(`${c.padEnd(8)} ${String(N).padStart(4)}  ${m[0].toFixed(3)}  ${m[1].toFixed(1).padStart(7)}  ${m[2].toFixed(3)}  ${m[3].toFixed(3)}  ${(m[2] / m[3]).toFixed(2).padStart(5)}    |          ${st ? st.gappiness.toFixed(3) + '  ' + st.floor_gap.toFixed(3) + '  ' + (st.gappiness / st.floor_gap).toFixed(2) : '–'}`);
  }
  // claims the piece's words make
  const get = (c, N) => rows.find(r => r.coupling === c && r.N === N);
  const fails = [];
  const lockedAll = rows.filter(r => r.coupling === 'locked');
  if (!lockedAll.every(r => r.ratio > 3)) fails.push('locked crowd came near the floor at some size');
  if (get('drift', 512) && get('drift', 512).ratio > 1.15) fails.push('drift at 512 not within 15% of the floor');
  if (get('drift', 4) && get('drift', 4).ratio < 1.8) fails.push('drift at 4 not clearly grainy');
  const g32 = get('drift', 32); if (g32 && Math.abs(g32.grains_per_s - 190) > 25) fails.push('32 neurons not about 190 grains/s');
  console.log('cycles of 330 Hz in one grain: 90 ms → ' + (0.09 * 330).toFixed(1) + ', 3 ms → ' + (0.003 * 330).toFixed(2));
  console.log(fails.length ? 'LADDER CLAIMS FAIL: ' + fails.join('; ') : 'ladder claims hold: drift reaches the floor, locked never does at any size');
  return { rows, fails };
}

function attack() {
  const { Crowd, LumpyCrowd } = engineOf('lock attack', ['Crowd', 'LumpyCrowd']);
  // the piece's Crowd is crowd_engine.js's, byte for byte between its markers
  const src = fs.readFileSync(path.join(HERE, 'crowd_engine.js'), 'utf8');
  const body = src.slice(src.indexOf('/*ENGINE-START*/') + 16, src.indexOf('/*ENGINE-END*/')).trim();
  const piece = fs.readFileSync(path.join(HERE, `${ENTRY} — rich — lock attack.html`), 'utf8');
  const same = piece.includes(body);
  console.log('\nATTACK · the piece carries crowd_engine.js byte for byte: ' + (same ? 'yes' : 'NO'));
  const SR = 24000, N = 512, SEEDS = QUICK ? [3] : [3, 5, 9];
  const FR = [0.8, 0.85, 0.9, 0.95, 0.975, 1.0, 1.025, 1.05, 1.1, 1.2];
  const st = JSON.parse(fs.readFileSync(path.join(HERE, 'lumpiness.json'), 'utf8'));
  function settle(L, p, f, seed) { const c = new LumpyCrowd(SR); c.configure(N, p, L, seed); c.T = f / (1 - p);
    const b = new Float32Array(480); let a = 0, n = 0; for (let k = 0; k < (SR * 4) / 480; k++) { c.process(b, 480); if (k > (SR * 2) / 480) { a += c.rCore; n++; } } return a / n; }
  const cross = (fr, r, y) => { for (let i = 1; i < r.length; i++) if (r[i - 1] < y && r[i] >= y) return fr[i - 1] + ((y - r[i - 1]) / (r[i] - r[i - 1])) * (fr[i] - fr[i - 1]); return null; };
  const out = [];
  console.log('\nATTACK · core synchrony settled 4 s (last 2 s averaged) · 512 neurons · mean of ' + SEEDS.length + ' crowds');
  console.log('life lump | r at 0.8 … 1.2 of the edge                               | half-lock  width | steward: half  width');
  for (const p of [0, 0.5]) for (const L of [0, 1]) {
    const per = SEEDS.map(s => FR.map(f => settle(L, p, f, s)));
    const r = FR.map((_, j) => per.reduce((a, x) => a + x[j], 0) / per.length);
    const lo = cross(FR, r, 0.3), hi = cross(FR, r, 0.7), mid = cross(FR, r, 0.5);
    const s = st.rows.find(x => x.p === p && x.L === L);
    const row = { p, L, r: r.map(x => +x.toFixed(3)), half: mid && +mid.toFixed(3), width: lo && hi ? +(hi - lo).toFixed(3) : null, steward: s && { half: s.half_lock, width: s.width_30_70 } };
    out.push(row);
    console.log(`${String(p).padEnd(4)} ${String(L).padEnd(4)} | ${row.r.map(x => x.toFixed(2)).join(' ')} | ${String(row.half).padEnd(9)}  ${String(row.width).padEnd(5)} | ${s ? s.half_lock + '  ' + s.width_30_70 : '–'}`);
  }
  const W = (p, L) => out.find(o => o.p === p && o.L === L).width;
  // the piece's own measurement: a finer grid near the edge, each crowd's width read on its own
  const FRF = [0.8, 0.85, ...Array.from({ length: 17 }, (_, i) => +(0.9 + i * 0.0125).toFixed(4)), 1.2];
  const crossF = (r, y) => { for (let i = 1; i < r.length; i++) if (r[i - 1] < y && r[i] >= y) return FRF[i - 1] + ((y - r[i - 1]) / (r[i] - r[i - 1])) * (FRF[i] - FRF[i - 1]); return null; };
  const per = {};
  console.log('\nATTACK · each crowd on its own, the piece\'s finer grid (' + FRF.length + ' tightnesses) · width 0.3 → 0.7 · half-lock');
  for (const p of [0, 0.5]) for (const L of [0, 1]) {
    const seeds = L ? (QUICK ? [3] : [3, 5, 9]) : [3];
    per[p + '|' + L] = seeds.map(sd => { const r = FRF.map(f => settle(L, p, f, sd)); const lo = crossF(r, 0.3), hi = crossF(r, 0.7);
      let jump = 0; for (let i = 3; i < FRF.length - 1; i++) jump = Math.max(jump, r[i] - r[i - 1]);
      return { seed: sd, r: r.map(x => +x.toFixed(3)), half: crossF(r, 0.5) && +crossF(r, 0.5).toFixed(3), width: lo != null && hi != null ? +(hi - lo).toFixed(3) : null, jump: +jump.toFixed(3), below: +((r[0] + r[1] + r[2]) / 3).toFixed(3) }; });
    console.log(`life ${p} lump ${L}: ` + per[p + '|' + L].map(c => `crowd ${c.seed}: below ${c.below} jump ${c.jump} width ${c.width} half ${c.half}×`).join(' · '));
  }
  const med = k => { const w = per[k].map(c => c.width).filter(v => v != null).sort((a, b) => a - b); return w[w.length >> 1]; };
  const fails = same ? [] : ['the piece’s engine differs from crowd_engine.js'];
  if (!(W(0, 1) > 2.5 * W(0, 0))) fails.push('lumpiness did not widen the mean-of-3 lock at life 0');
  if (!(W(0.5, 1) > 2.5 * W(0.5, 0))) fails.push('lumpiness did not widen the mean-of-3 lock at life 50%');
  if (!(Math.abs(W(0.5, 0) - W(0, 0)) < 0.005)) fails.push('on the steward’s grid, pacemakers changed the even crowd’s width');
  const J = k => per[k].map(c => c.jump);
  if (!(Math.min(...J('0|0'), ...J('0.5|0')) > 0.3)) fails.push('an even crowd did not snap (a jump over 0.3 in one 1.25% step)');
  if (!(per['0.5|0'][0].below > 2 * per['0|0'][0].below)) fails.push('pacemakers did not lift the even crowd below the lock');
  if (!(Math.max(...per['0|1'].map(c => c.below)) > 1.5 * per['0|0'][0].below)) fails.push('a lumpy crowd did not agree early');
  if (!(med('0|1') > 1.4 * med('0|0'))) fails.push('one lumpy crowd (life 0) is not softer than the even crowd');
  if (!(med('0.5|1') > 1.2 * med('0|1'))) fails.push('pacemakers did not soften a lumpy crowd further');
  for (const o of out) if (!(o.half > 0.93 && o.half < 1.02)) fails.push(`half-lock at life ${o.p} lump ${o.L} is ${o.half}×, not near the edge 1/(1 − life)`);
  console.log(`median single-crowd width: even ${med('0|0')} / ${med('0.5|0')} (life 0 / 50%), lumpy ${med('0|1')} / ${med('0.5|1')}`);
  console.log(fails.length ? 'ATTACK CLAIMS FAIL: ' + fails.join('; ') : 'attack claims hold: an even crowd snaps at any life (pacemakers raise its floor); lumpy crowds agree early and are softer; in a lumpy crowd pacemakers soften it further; the edge sits at 1/(1 − life)');
  out.push({ per_crowd_fine_grid: per, grid: FRF });
  return { rows: out, fails };
}

const res = {};
if (which === 'ladder' || which === 'all') res.ladder = ladder();
if (which === 'attack' || which === 'all') res.attack = attack();
const out = path.join(HERE, `${ENTRY} — rich — checks.json`);
const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : {};
fs.writeFileSync(out, JSON.stringify({ ...prev, ...res, ran: new Date().toISOString().slice(0, 10), quick: QUICK }, null, 1));
const bad = Object.values(res).some(r => r.fails.length);
process.exit(bad ? 1 : 0);
