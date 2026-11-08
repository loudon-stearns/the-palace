// title: Portamento and Physical Pitch Modeling — rich — check
// born: 2026-11-03
// links: [[Portamento and Physical Pitch Modeling]] (connects-to · rich-face-check) · checks the two made pieces in [[Portamento and Physical Pitch Modeling — rich.json]]
// forward_vector: I run each made piece's own engine, lifted out of its page, in Node, against the numbers the piece shows and the page's sentences it tests: how much of the jump a critically damped glide has covered at 2/ωₙ, when it really reaches 95%, how big an underdamped glide's first swing is, and on which side of the note it peaks. I exit 1 if a claim the piece makes fails, so a change to a piece that breaks its claim is caught.
// run: node "Projects/Portamento and Physical Pitch Modeling/Portamento and Physical Pitch Modeling — rich — check.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const engine = (file, names) => {
  const html = fs.readFileSync(path.join(here, file), 'utf8');
  const m = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`no engine script in ${file}`);
  return new Function(m[1] + `; return { ${names.join(', ')} };`)();
};
let failed = 0;
const ok = (cond, what) => { console.log(`${cond ? 'pass' : 'FAIL'} · ${what}`); if (!cond) failed++; };

// ---- the critically damped glide, walked up ----
const A = engine('Portamento and Physical Pitch Modeling — rich — critical glide walked up.html', ['glide', 'firstOrder', 'integrate', 'coveredAt', 'settleTime', 'cents']);
{
  // the closed form the pieces draw and play is the page's equation: it agrees with RK4 on the equation itself
  for (const zeta of [0.3, 1, 1.6]) {
    const wn = 8, dt = 1 / 8000, c = A.integrate(zeta, wn, 220, 330, 2, dt);
    let worst = 0; for (let i = 0; i < c.length; i += 40) worst = Math.max(worst, Math.abs(c[i] - A.glide(zeta, wn, 220, 330, i * dt)));
    ok(worst < 1e-6, `ζ ${zeta}: the closed form matches the integrated equation (worst ${worst.toExponential(1)} Hz)`);
  }
  const rows = [];
  for (const wn of [4, 8, 30]) {
    const dt = (1 / 4000) / (wn / 8), c = A.integrate(1, wn, 220, 330, 14 / wn, dt);   // as the page measures it
    const at = [1, 2, 3].map((k) => A.coveredAt(c, dt, k / wn, 220, 330));
    const t95 = A.settleTime(c, dt, 220, 330, 0.95) * wn, t98 = A.settleTime(c, dt, 220, 330, 0.98) * wn;
    rows.push({ 'ωₙ rad/s': wn, 'at 1/ωₙ': +(100 * at[0]).toFixed(2), 'at 2/ωₙ': +(100 * at[1]).toFixed(2), 'at 3/ωₙ': +(100 * at[2]).toFixed(2), '95% at (×1/ωₙ)': +t95.toFixed(3), '98% at (×1/ωₙ)': +t98.toFixed(3) });
    ok(Math.abs(at[1] - (1 - 3 * Math.exp(-2))) < 2e-4, `ωₙ ${wn}: at 2/ωₙ the glide has covered ${(100 * at[1]).toFixed(1)}% (1 − 3e⁻² = 59.4%), not ~95%`);
    ok(Math.abs(at[0] - 0.2642) < 2e-4 && Math.abs(at[2] - 0.8009) < 2e-4, `ωₙ ${wn}: 26.4% at 1/ωₙ and 80.1% at 3/ωₙ, the same at every ωₙ`);
    ok(Math.abs(t95 - 4.744) < 0.005, `ωₙ ${wn}: 95% of the jump is done at ${t95.toFixed(3)}/ωₙ`);
    ok(Math.abs(t98 - 5.834) < 0.005, `ωₙ ${wn}: 98% at ${t98.toFixed(3)}/ωₙ`);
  }
  console.table(rows);
  ok(Math.abs((1 - Math.exp(-3)) - 0.9502) < 1e-4, 'step 1’s first-order glide reaches 95.0% at 3τ: where "three time constants to 95%" holds');
  const f2 = 220 + (1 - 3 * Math.exp(-2)) * 110, f95 = 330 - 0.05 * 110;
  console.log(`  cut short at 2/ωₙ: last leap ${A.cents(330, f2).toFixed(1)} cents · at the 95% point: ${A.cents(330, f95).toFixed(1)} cents`);
  ok(A.cents(330, f2) > 200 && A.cents(330, f95) < 30, 'the cut at 2/ωₙ leaves a leap over two semitones; the cut at 95% under 30 cents');
}

// ---- the overshoot, walked up ----
const B = engine('Portamento and Physical Pitch Modeling — rich — overshoot walked up.html', ['glide', 'integrate', 'firstTurn', 'swingShare', 'pageFmax', 'mirrorFmax', 'cents']);
{
  const WN = 12, DT = 1 / 8000, rows = [];
  for (const [f0, ft] of [[220, 330], [330, 220]]) for (const zeta of [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.9]) {
    const c = B.integrate(zeta, WN, f0, ft, 3, DT), turn = B.firstTurn(c, DT, ft), share = (turn.f - ft) / (ft - f0);
    const page = B.pageFmax(zeta, f0, ft), mirror = B.mirrorFmax(zeta, f0, ft), wd = WN * Math.sqrt(1 - zeta * zeta);
    const pageBetween = page > Math.min(f0, ft) && page < Math.max(f0, ft);
    rows.push({ dir: f0 < ft ? 'up' : 'down', ζ: zeta, 'measured peak Hz': +turn.f.toFixed(3), 'mirrored Hz': +mirror.toFixed(3), 'page f_max Hz': +page.toFixed(3), 'swing %': +(100 * share).toFixed(2), 'e^(−πζ/√(1−ζ²)) %': +(100 * B.swingShare(zeta)).toFixed(2), 'cents past': +Math.abs(B.cents(turn.f, ft)).toFixed(1) });
    ok(Math.abs(share - B.swingShare(zeta)) < 1e-5, `${f0}→${ft}, ζ ${zeta}: the swing is e^(−πζ/√(1−ζ²)) of the jump (${(100 * share).toFixed(2)}%)`);
    ok(Math.abs(turn.t - Math.PI / wd) < 5e-4, `${f0}→${ft}, ζ ${zeta}: the peak comes at π/ω_d`);
    ok(Math.abs(turn.f - mirror) < 0.01 && Math.sign(turn.f - ft) === Math.sign(ft - f0), `${f0}→${ft}, ζ ${zeta}: the peak lies past the note, at f_target − (f₀ − f_target)·e^(…)`);
    ok(pageBetween, `${f0}→${ft}, ζ ${zeta}: the page's f_max (${page.toFixed(1)} Hz) falls between the start and the note, a pitch the glide crosses once`);
  }
  console.table(rows);
  for (const zeta of [1, 1.6]) { const c = B.integrate(zeta, 12, 220, 330, 3, DT); ok(B.firstTurn(c, DT, 330) === null, `ζ ${zeta}: no turn, the glide never passes the note`); }
  ok(Math.abs(100 * B.swingShare(0.3) - 37.2) < 0.05, `ζ 0.3: the swing is ${(100 * B.swingShare(0.3)).toFixed(1)}% (the page says ~36%)`);
  ok(Math.abs(100 * B.swingShare(0.7) - 4.6) < 0.05, `ζ 0.7: the swing is ${(100 * B.swingShare(0.7)).toFixed(1)}% (the page says ~5%)`);
  // the bundle's own render already peaks on the far side: multi-mode/locking-manifest.json, bow-overshoot
  const lock = JSON.parse(fs.readFileSync(path.join(here, 'multi-mode', 'locking-manifest.json'), 'utf8')).find((e) => e.name === 'bow-overshoot');
  const mir = B.mirrorFmax(lock.zeta, lock.f0, lock.ft), pg = B.pageFmax(lock.zeta, lock.f0, lock.ft);
  ok(Math.abs(lock.peak_f1_hz - mir) < 0.1, `the bundle's bow-overshoot render (ζ ${lock.zeta}, ${lock.f0}→${lock.ft}) peaked at ${lock.peak_f1_hz} Hz: the mirrored value is ${mir.toFixed(1)}, the page's f_max ${pg.toFixed(1)}`);
}

console.log(failed ? `\n${failed} failed` : '\nall pass');
process.exit(failed ? 1 : 0);
