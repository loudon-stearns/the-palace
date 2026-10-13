// codebox_mirror.mjs — run a codebox~ file's own text as JavaScript, and
// hold it against the browser engine sample by sample.
//
//   node codebox_mirror.mjs [codebox] [surface-name ...]
//
// Why: none of the codeboxes in this folder has been opened in Max, so
// until Loudon assembles a patch the only ears they have are ours. The
// codebox dialect is close enough to JavaScript that a small transpiler
// can run the file as written: @param and @state become variables,
// peek("tablebuf", i, 0) reads the same Float32 surface the browser
// plays, out1 is the sample. Then the heterodyne tour is rendered twice,
// once by Hopf/hopf-control-surface.html's engine and once by the
// codebox, and the two are subtracted.
//
// What a match proves: the codebox's ARITHMETIC is the browser's — the
// scan, the lock search, the coupling, the heterodyne, the crossfade.
// What it does not prove: that RNBO compiles the file, that its
// buffer~ holds the catalog surface in the same orientation, or that it
// sounds right in Max. Those still need Loudon to open it.
//
// Two known differences are removed before comparing: the browser
// soft-clips its output (tanh) and the codebox does not, so the clip is
// cut out of the browser's source here; and the browser smooths base and
// gain, which both tours hold still.
//
// Two tours. The heterodyne tour (24 s) should match to the bit. The
// hands tour (bend 3-8 s, shear 8-13 s, stir 13-18 s, all together from
// 18 s) should match to the bit through bend and shear; stir is built
// differently on purpose (the browser precomputes the slope field, the
// codebox takes finite differences through its own lookup), so there the
// difference is reported, not expected to vanish.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SR = 48000;
const cbPath = path.join(here, process.argv[2] || 'torus_2d_hopf.codebox');
const names = process.argv.slice(3).length ? process.argv.slice(3) : ['15 · Penrose Lattice', '14 · Knot Shadow', '10 · Membrane'];
const SLOPE = { '15 · Penrose Lattice': 41.0, '14 · Knot Shadow': 26.2, '10 · Membrane': 14.5 };
const HETROW = { '15 · Penrose Lattice': 0.25, '14 · Knot Shadow': 0.3505859375, '10 · Membrane': 0.111328125 };

const html = fs.readFileSync(path.join(here, '../Hopf/hopf-control-surface.html'), 'utf8');
// The browser engine with its output soft-clip taken out (the codebox has none).
const engineSrc = html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const CLIP = 'out[i] = Math.tanh(this.dcY * s.gain * 1.4) / 1.4;';
if (!engineSrc.includes(CLIP)) throw new Error('browser soft-clip line moved; update CLIP');
const HTE = new Function(engineSrc.replace(CLIP, 'out[i] = this.dcY * s.gain;') + '\nreturn HTE;')();

// ---- the transpiler: codebox text -> a factory of per-sample machines
function transpile(src) {
  src = src.replace(/\/\/.*$/gm, '');
  const decl = [], names = [];
  src = src.replace(/^@param\s*\(\{[^}]*\}\)\s*(\w+)\s*=\s*([^;]+);/gm, (_, n, v) => { decl.push(`let ${n} = ${v};`); names.push(n); return ''; });
  src = src.replace(/^@state\s+(\w+)\s*=\s*([^;]+);/gm, (_, n, v) => { decl.push(`let ${n} = ${v};`); names.push(n); return ''; });
  const consts = []; src = src.replace(/^const\s+[^;]+;/gm, m => { consts.push(m); return ''; });
  const fns = []; src = src.replace(/^function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?^\}/gm, m => { fns.push(m); return ''; });
  const body = src.trim();
  const code = `
    const floor = Math.floor, abs = Math.abs, sin = Math.sin, cos = Math.cos, exp = Math.exp, tanh = (x) => Math.tanh(x);
    const samplerate = sr;
    function peek(name, i, ch) { return tab[i]; }
    ${consts.join('\n')}
    ${decl.join('\n')}
    ${fns.join('\n')}
    return {
      set(k, v) { switch (k) { ${names.map(n => `case '${n}': ${n} = v; break;`).join(' ')} default: throw new Error('no ' + k); } },
      get(k) { switch (k) { ${names.map(n => `case '${n}': return ${n};`).join(' ')} } },
      tick() { let out1 = 0; ${body}
        return out1; }
    };`;
  return new Function('tab', 'sr', code);
}
const make = transpile(fs.readFileSync(cbPath, 'utf8'));

// browser targets -> codebox params
const P = { base: 'baseHz', h: 'height', lon: 'longitude', K: 'coupling', bX: 'bendX', bY: 'bendY', shear: 'shear', stir: 'stir', het: 'het' };
const S = { h: 'hS', lon: 'lonS', K: 'kS', bX: 'bXS', bY: 'bYS', shear: 'shS', stir: 'stS', het: 'hetS' };

function renderBoth(W, hetRow, dur, gesture, override, slopeMax = 41) {
  const eng = new HTE.Engine(SR); eng.W = W;
  const cb = make(W, SR);
  const g0 = Object.assign(gesture(0), override);
  Object.assign(eng.t, g0, { gain: 1 }); Object.assign(eng.s, g0, { gain: 1 });
  for (const k in P) if (k in g0) cb.set(P[k], g0[k]);
  for (const k in S) if (k in g0) cb.set(S[k], g0[k]);
  cb.set('gain', 1); cb.set('hetRow', hetRow); cb.set('slopeMax', slopeMax);
  const n = Math.round(SR * dur), a = new Float32Array(n), b = new Float32Array(n), BLK = 64;
  for (let i = 0; i < n; i += BLK) {
    const g = Object.assign(gesture(i / SR), override); Object.assign(eng.t, g);
    for (const k in P) if (k in g) cb.set(P[k], g[k]);
    const m = Math.min(BLK, n - i);
    eng.process(a.subarray(i, i + m), m);
    for (let j = 0; j < m; j++) b[i + j] = cb.tick();
  }
  return { browser: a, codebox: b };
}

const rms = (x, s, e) => { let q = 0; for (let i = s; i < e; i++) q += x[i] * x[i]; return Math.sqrt(q / (e - s)); };
const dB = (r) => (20 * Math.log10(r + 1e-15)).toFixed(1);
const report = {};
for (const name of names) {
  const W = HTE.makeSurface(name), row = HETROW[name] ?? 0.25;
  const withV = renderBoth(W, row, 24, HTE.hetTour, {});
  const without = renderBoth(W, row, 24, HTE.hetTour, { het: 0 });
  let maxD = 0, pk = 0;
  for (let i = 0; i < withV.browser.length; i++) { maxD = Math.max(maxD, Math.abs(withV.browser[i] - withV.codebox[i])); pk = Math.max(pk, Math.abs(withV.browser[i])); }
  const diff = withV.browser.map((v, i) => v - withV.codebox[i]);
  const voice = withV.codebox.map((v, i) => v - without.codebox[i]);
  const lv = [[3, 4], [10, 11], [21, 22]].map(([s, e]) => dB(rms(voice, s * SR, e * SR) / rms(without.codebox, s * SR, e * SR)));
  report[name] = { hetRow: row, max_abs_diff: maxD, peak: pk, diff_vs_signal_dB: dB(rms(diff, 0, diff.length) / rms(withV.browser, 0, diff.length)), codebox_voice_dB: lv };
  console.log(`${name}  hetRow ${row}`);
  console.log(`  browser vs codebox, whole 24 s tour: max |difference| ${maxD.toExponential(2)} (peak ${pk.toFixed(3)}), difference ${report[name].diff_vs_signal_dB} dB under the signal`);
  console.log(`  the codebox's own voice vs tone: locked ${lv[0]} dB · open near 3:2 ${lv[1]} dB · locked again ${lv[2]} dB`);

  // the hands tour, segment by segment
  const h = renderBoth(W, row, 24, HTE.handsTour, {}, SLOPE[name] ?? 41);
  const hd = h.browser.map((v, i) => v - h.codebox[i]);
  const seg = [['bare', 0, 3], ['bend', 3, 8], ['shear', 8, 13], ['stir', 13, 18], ['all four', 18, 24]].map(([lab, s, e]) => {
    let m = 0; for (let i = s * SR; i < e * SR; i++) m = Math.max(m, Math.abs(hd[i]));
    return { segment: lab, max_abs_diff: m, diff_vs_signal_dB: dB(rms(hd, s * SR, e * SR) / rms(h.browser, s * SR, e * SR)) };
  });
  report[name].hands_tour = seg;
  console.log('  hands tour, browser vs codebox: ' + seg.map(x => `${x.segment} ${x.max_abs_diff === 0 ? 'bit-exact' : x.diff_vs_signal_dB + ' dB'}`).join(' · '));
}
fs.writeFileSync(path.join(here, 'codebox_mirror_report.json'), JSON.stringify(report, null, 2) + '\n');
