// check-rich-pieces.mjs — re-checks, headless, every number the Crystal Synthesizer's two made rich-face
// pieces show, on the pieces' own code (the blocks between their ENGINE and CHECK markers).
//
//   node "Projects/Crystal Synthesizer/rich-checks/check-rich-pieces.mjs"
//
// Writes rich-checks/findings.json beside itself and exits 1 if any check fails.
// Born 2026-11-03, Enrichment's proposal round. Part of [[Crystal Synthesizer]]'s rich face.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const BUNDLE = join(HERE, '..');
const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${detail}`); };
const block = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b); if (i < 0 || j < 0) throw new Error(`no ${a}`); return src.slice(i + a.length, j); };

// ── Strike the seven ────────────────────────────────────────────────────────
{
  const src = readFileSync(join(BUNDLE, 'Crystal Synthesizer — rich — strike the seven.html'), 'utf8');
  const plugin = readFileSync(join(BUNDLE, 'plugin/ui/crystal_engine.js'), 'utf8');
  const eng = block(src, '/*ENGINE-START*/', '/*ENGINE-END*/');
  check('A0 engine is the plugin’s, verbatim', eng === block(plugin, '/*ENGINE-START*/', '/*ENGINE-END*/'), `${eng.length} chars`);
  const { CE, CS } = new Function(eng + block(src, '/*CHECK-START*/', '/*CHECK-END*/') + '; return { CE, CS };')();

  // Step 1: one mode, its ring read off the render against tau = Q/(pi f).
  for (const Q of [30, 120, 807]) {
    const want = CS.t60(Q, CS.A2), got = CS.tailT60([CS.ringModes([{ r: 1, Q, amp: 1 }], CS.A2, Math.min(20, want * 1.4 + 0.5))], 0.01);
    check(`A1 one mode Q ${Q}: T60`, Math.abs(got / want - 1) < 0.02, `formula ${want.toFixed(3)} s · render ${got.toFixed(3)} s`);
  }
  // Step 2: split 0 is step 1 again; Δr 0.04 beats at 4.4 Hz.
  {
    const one = CS.ringModes([{ r: 1, Q: 120, amp: 1 }], CS.A2, 2), two = CS.ringModes([{ r: 1, Q: 120, amp: 0.5 }, { r: 1, Q: 120, amp: 0.5 }], CS.A2, 2);
    let d = 0, p = 0; for (let i = 0; i < one.length; i++) { d = Math.max(d, Math.abs(one[i] - two[i])); p = Math.max(p, Math.abs(one[i])); }
    check('A2 split 0 is step 1', d / p < 1e-6, `largest difference ${(d / p).toExponential(1)} of peak`);
    const x = CS.ringModes([{ r: 1, Q: 120, amp: 0.5 }, { r: 1.04, Q: 120, amp: 0.5 }], CS.A2, 3);
    const env = CS.envDb([x], 0.005);             // the beat as dips in the 5 ms envelope
    const dips = []; for (let j = 2; j < env.length - 2; j++) if (env[j] < env[j - 1] && env[j] <= env[j + 1] && env[j] < env[j - 2] - 6 && env[j] < env[j + 2] - 6) dips.push(j * 0.005);
    const per = (dips.at(-1) - dips[0]) / (dips.length - 1);
    check('A3 Δr 0.04 at A2 beats 4.4 Hz', Math.abs(1 / per - 4.4) < 0.15, `${dips.length} dips, ${(1 / per).toFixed(2)} Hz`);
  }
  // Step 3: each crystal's ring, read off the plugin engine's own render, against the column it prints.
  const rows = [];
  for (const row of CS.ROWS) {
    const c = row.c, m = CS.measures(c, false), mx = CS.measures(c, true);
    const ch = CS.physicsStrike(c, { dur: Math.min(20, m.ring * 1.3 + 0.5) });
    const got = CS.tailT60(ch, 0.01);
    rows.push({ crystal: CS.NAMES[c], system: row.sys, guess: !!row.guess, pitches: m.unique, modes: m.modes, span_oct: +m.span.toFixed(2), ring_s: +m.ring.toFixed(2), ring_render_s: +got.toFixed(2), Q: m.q,
      closest_pair: m.pair && { ratios: [m.pair.lo, m.pair.hi], beat_hz: +m.pair.hz.toFixed(2), beats_before_gone: +m.pair.beats.toFixed(1) },
      two_rays: mx.rays && { cents: +mx.rays.cents.toFixed(1), hz: +mx.rays.hz.toFixed(2), beats_before_gone: +mx.rays.beats.toFixed(2) } });
    // A crystal whose lowest mode is not its longest ring (amethyst's soft mode dies first, but every
    // other mode is higher too) still has its tail set by the lowest mode.
    check(`A4 ${CS.NAMES[c]} (${row.sys}) ring`, Math.abs(got / m.ring - 1) < 0.05, `printed ${m.ring.toFixed(2)} s · plugin render ${got.toFixed(2)} s`);
  }
  // Across the axis: diamond is one ray (no side signal), ruby two.
  {
    const [L, R] = CS.physicsStrike(0, { across: true, dur: 1 }); let side = 0; for (let i = 0; i < L.length; i++) side = Math.max(side, Math.abs(L[i] - R[i]));
    check('A5 diamond across the axis is one ray', side === 0, `largest L−R ${side}`);
    const [L2, R2] = CS.physicsStrike(4, { across: true, dur: 1 }); let s2 = 0; for (let i = 0; i < L2.length; i++) s2 = Math.max(s2, Math.abs(L2[i] - R2[i]));
    check('A6 ruby across the axis is two rays', s2 > 1e-3, `largest L−R ${s2.toFixed(4)}`);
  }
  // Step 4: the test. Summer ring vs physics ring, diamond and labradorite.
  const t = {};
  for (const [k, ch] of [['summer diamond', [CS.summerStrike(CE.RATIOS[0], CS.A2, 8)]], ['summer labradorite', [CS.summerStrike(CE.RATIOS[8], CS.A2, 8)]],
    ['physics diamond', CS.physicsStrike(0)], ['physics labradorite', CS.physicsStrike(8)]]) t[k] = +(100 * CS.energyAfter(ch, 0.5)).toFixed(2);
  check('A7 summer ring: labradorite keeps ringing past 0.5 s', t['summer labradorite'] > 50, `${t['summer labradorite']}% of its energy after 0.5 s (diamond ${t['summer diamond']}%)`);
  check('A8 physics ring: labradorite is gone by 0.5 s, diamond is not', t['physics labradorite'] < 0.5 && t['physics diamond'] > 30, `labradorite ${t['physics labradorite']}% · diamond ${t['physics diamond']}%`);
  const topTau = CS.tau(CS.LABRADORITE_LINE / CS.LABRADORITE_WIDTH, CS.A2 * 17.5);
  check('A9 labradorite’s top partial falls to 1/e in about 5 ms', Math.abs(topTau * 1000 - 4.9) < 0.3, `${(topTau * 1000).toFixed(2)} ms at ${(CS.A2 * 17.5).toFixed(0)} Hz`);
  const bellWidth = CS.LABRADORITE_LINE / 807;
  check('A10 the width that would ring like diamond', Math.abs(bellWidth - 0.63) < 0.01, `${bellWidth.toFixed(3)} cm⁻¹, ${(CS.LABRADORITE_WIDTH / bellWidth).toFixed(0)}× narrower than the estimate`);
  results.push({ name: 'strike the seven · table', ok: true, detail: rows, energy_after_half_second_pct: t });
}

// ── Which phonons are fast ──────────────────────────────────────────────────
try {
  const src = readFileSync(join(BUNDLE, 'Crystal Synthesizer — rich — which phonons are fast.html'), 'utf8');
  const { PH } = new Function(block(src, '/*CHECK-START*/', '/*CHECK-END*/') + '; return { PH };')();
  // The slope of the curve is the group velocity the piece draws.
  let worst = 0;
  for (let i = 1; i < 200; i++) { const ka = Math.PI * i / 200, h = 1e-6; const num = (PH.omega(ka + h) - PH.omega(ka - h)) / (2 * h); worst = Math.max(worst, Math.abs(num - PH.vg(ka))); }
  check('B1 v_g is the slope of ω(k)', worst < 1e-6, `largest gap ${worst.toExponential(1)}`);
  check('B2 long waves are the fast ones', PH.vg(0.05) > PH.vg(Math.PI / 2) && PH.vg(Math.PI / 2) > PH.vg(Math.PI - 0.05) && PH.vp(0.05) > PH.vp(Math.PI - 0.05),
    `v_g/v₀ at ka 0.05, π/2, π−0.05: ${PH.vg(0.05).toFixed(3)}, ${PH.vg(Math.PI / 2).toFixed(3)}, ${PH.vg(Math.PI - 0.05).toFixed(3)} · phase velocity ${PH.vp(0.05).toFixed(3)} → ${PH.vp(Math.PI - 0.05).toFixed(3)}`);
  const dry = PH.click(false), wet = PH.click(true);
  // The chain is all-pass inside its band: the magnitude spectrum is unchanged.
  const md = PH.mag(dry), mw = PH.mag(wet); let mm = 0, mt = 0; for (let i = 0; i < md.length; i++) { mm = Math.max(mm, Math.abs(md[i] - mw[i])); mt = Math.max(mt, md[i]); }
  check('B3 the chain changes when, not how loud', mm / mt < 1e-6, `largest magnitude difference ${(mm / mt).toExponential(1)} of peak`);
  const arr = [];
  for (const f of [250, 1000, 4000, 6500, 7500]) {
    const got = PH.arrival(wet, f), want = PH.tArrive(f), d = PH.arrival(dry, f);
    arr.push({ f, predicted_ms: +(want * 1000).toFixed(1), measured_ms: +(got * 1000).toFixed(1), dry_ms: +(d * 1000).toFixed(1) });
    check(`B4 ${f} Hz arrives on time`, Math.abs(got - want) < 0.006, `predicted ${(want * 1000).toFixed(1)} ms · measured ${(got * 1000).toFixed(1)} ms · dry ${(d * 1000).toFixed(1)} ms`);
  }
  check('B5 lows first, highs last', arr.every((a, i) => i === 0 || a.measured_ms > arr[i - 1].measured_ms), arr.map((a) => `${a.f} Hz ${a.measured_ms} ms`).join(' · '));
  results.push({ name: 'which phonons are fast · arrivals', ok: true, detail: arr });
} catch (e) { check('B piece loads', false, String(e.message || e)); }

writeFileSync(join(HERE, 'findings.json'), JSON.stringify({ run: new Date().toISOString(), results }, null, 1) + '\n');
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length} of ${results.length} passed`);
process.exit(failed.length ? 1 : 0);
