// codebox_mirror.mjs — run crowd.codebox's own text as JavaScript and hold
// it against crowd_engine.js (the board instrument's engine), sample by
// sample; then render an audition made by the codebox itself.
//
//   node RNBO/codebox_mirror.mjs
//
// The transpiler is adopted from the 2D Torus Wavetable Synthesizer's
// RNBO/codebox_transpile.mjs (same idea: @param and @state become
// variables, const and function stay, the rest is the per-sample tick),
// extended for what this codebox uses: Fixed*Array state, PI, in1 and
// three outlets.
//
// Before comparing, the browser engine is given the codebox's spreads
// (natural rates, starting phases and pacemaker roles from the R3
// sequence instead of its seeded generator), so both run the same crowd.
// Known, harmless differences: the browser stores the spike and the
// accumulator in float32, the codebox in float64; the browser soft-clips
// with Math.tanh, the codebox with the same curve written out.
//
// What a match proves: the codebox's arithmetic is the board
// instrument's. What it does not prove: that RNBO compiles it, its CPU
// cost in Live, or how it sounds through Max. Those need Loudon.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { Crowd } = require(path.join(here, '..', 'crowd_engine.js'));

export function transpile(src) {
  src = src.replace(/\/\/.*$/gm, '');
  const decl = [], names = [];
  src = src.replace(/^@param\s*\(\{[^}]*\}\)\s*(\w+)\s*=\s*([^;]+);/gm, (_, n, v) => { decl.push(`let ${n} = ${v};`); names.push(n); return ''; });
  src = src.replace(/^@state\s+(\w+)\s*=\s*([^;]+);/gm, (_, n, v) => { decl.push(`let ${n} = ${v};`); names.push(n); return ''; });
  const consts = []; src = src.replace(/^const\s+[^;]+;/gm, m => { consts.push(m); return ''; });
  const fns = []; src = src.replace(/^function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?^\}/gm, m => { fns.push(m); return ''; });
  const body = src.trim();
  const code = `
    const floor = Math.floor, abs = Math.abs, sin = Math.sin, cos = Math.cos, exp = Math.exp, sqrt = Math.sqrt,
          pow = Math.pow, min = Math.min, max = Math.max, PI = Math.PI,
          clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);
    const FixedFloat64Array = Float64Array;
    const samplerate = sr;
    ${consts.join('\n')}
    ${decl.join('\n')}
    ${fns.join('\n')}
    let in1 = 0, out1 = 0, out2 = 0, out3 = 0;
    return {
      params: ${JSON.stringify(names)},
      set(k, v) { switch (k) { ${names.map(n => `case '${n}': ${n} = v; break;`).join(' ')} default: throw new Error('no ' + k); } },
      get(k) { switch (k) { ${names.map(n => `case '${n}': return ${n};`).join(' ')} } },
      tick(x = 0) { in1 = x; ${body}
        return out1; },
      outs() { return [out1, out2, out3]; }
    };`;
  return new Function('sr', code);
}

// the browser engine, handed the codebox's crowd
const fract = (x) => x - Math.floor(x);
class R3Crowd extends Crowd {
  setN(n) {
    super.setN(n);
    this.pu = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      this.jit[i] = 2 * fract(0.5 + i * 0.8191725133961645) - 1;
      this.pu[i] = fract(0.5 + i * 0.6710436067037893);
      this.th[i] = 2 * Math.PI * fract(0.5 + i * 0.5497004779019703);
      this.c[i] = Math.cos(this.th[i]); this.sn[i] = Math.sin(this.th[i]);
    }
    this.setP(this.p);
  }
  setP(p) { this.p = p; if (!this.pu) return; const m = Math.floor(p * this.N + 0.5); for (let i = 0; i < this.N; i++) { let r = 0; for (let j = 0; j < this.N; j++) if (this.pu[j] < this.pu[i]) r++; this.listen[i] = r < m ? 0 : 1; } this.lastPh = null; }
}

const SR = 48000;
const make = transpile(fs.readFileSync(path.join(here, 'crowd.codebox'), 'utf8'));

// The tour: the same walk as cycle 12's one-take (crowd-gesture.wav),
// keyframes [seconds, tight, life].
const KF = [[0, 0, 0], [4, 0, 0], [10, 1.4, 0], [13, 3.14, 0], [17, 3.14, 0], [21, 3.14, 0.12], [25, 3.14, 0.12],
            [29, 5.5, 0.55], [33, 5.5, 0.55], [37, 1.9, 0.68], [40, 1.9, 0.68], [43, 3.14, 0.12]];
const PHRASE = [[43, 110], [44, 130.81], [45, 146.83], [46, 164.81], [47.5, 146.83], [48.5, 110]];
const at = (t) => { let i = 0; while (i < KF.length - 2 && KF[i + 1][0] <= t) i++;
  const a = KF[i], b = KF[i + 1], f = Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0] || 1)));
  return { T: a[1] + (b[1] - a[1]) * f, p: a[2] + (b[2] - a[2]) * f }; };

function tour(dur, N) {
  const eng = new R3Crowd(SR); eng.setN(N);
  const cb = make(SR); cb.set('crowd', N); cb.set('velocity', 1); cb.set('envVal', 1);
  const n = SR * dur, a = new Float32Array(n), b = new Float32Array(n), sync = [], B = 480;
  const t0 = process.hrtime.bigint(); let cbNs = 0n;
  for (let s = 0; s < n; s += B) {
    const t = s / SR, k = at(t); let f = 110; for (const [pt, hz] of PHRASE) if (t >= pt) f = hz;
    eng.T = k.T; eng.F0 = f; if (Math.abs(eng.p - k.p) > 0.002) eng.setP(k.p);
    cb.set('tight', k.T); cb.set('freq', f); cb.set('life', eng.p);
    const m = Math.min(B, n - s); eng.process(a.subarray(s, s + m), m);
    const c0 = process.hrtime.bigint();
    for (let j = 0; j < m; j++) b[s + j] = cb.tick();
    cbNs += process.hrtime.bigint() - c0;
    sync.push([+t.toFixed(2), +cb.outs()[2].toFixed(3), +k.T.toFixed(3), +eng.p.toFixed(3)]);
  }
  return { a, b, sync, cbRealtime: Number(cbNs) / 1e9 / dur };
}

const rms = (x) => { let q = 0; for (const v of x) q += v * v; return Math.sqrt(q / x.length); };
const report = {};
for (const N of [128, 512]) {
  const dur = N === 128 ? 51 : 12;
  const { a, b, sync, cbRealtime } = tour(dur, N);
  let maxD = 0; const d = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) { d[i] = a[i] - b[i]; maxD = Math.max(maxD, Math.abs(d[i])); }
  report[N] = { seconds: dur, max_abs_diff: maxD, diff_under_signal_dB: +(20 * Math.log10(rms(d) / rms(a) + 1e-15)).toFixed(1),
                codebox_js_cost_x_realtime: +cbRealtime.toFixed(3) };
  console.log(`N=${N}  ${dur}s tour: max |browser − codebox| ${maxD.toExponential(2)}, ${report[N].diff_under_signal_dB} dB under the signal; transpiled codebox runs at ${cbRealtime.toFixed(2)}× realtime in node`);
  if (N === 128) {
    // the codebox's own voice, the same take as crowd-gesture.wav
    const fade = SR * 0.5; for (let i = 0; i < fade; i++) b[b.length - 1 - i] *= i / fade;
    const pcm = Buffer.alloc(44 + b.length * 2);
    pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + b.length * 2, 4); pcm.write('WAVEfmt ', 8);
    pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(SR, 24);
    pcm.writeUInt32LE(SR * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(b.length * 2, 40);
    for (let i = 0; i < b.length; i++) pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, b[i] * 0.9)) * 32767), 44 + i * 2);
    fs.writeFileSync(path.join(here, 'crowd-codebox-take.wav'), pcm);
    report[N].synchrony_trace = sync.filter((_, i) => i % 10 === 0);
  }
}
fs.writeFileSync(path.join(here, 'codebox_mirror_report.json'), JSON.stringify(report) + '\n');
