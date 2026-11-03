// title: ControlNet as Topology — rich — checks
// born: 2026-11-03
// links: [[ControlNet as Topology]] (connects-to · rich-face-workshop) · re-checks the two made pieces listed in [[ControlNet as Topology — rich.json]]
// forward_vector: I re-run every number the two made pieces and the manifest's offers state, on each piece's own engine (its <script id="engine">), so a challenger or a re-tune can check them without a browser. Run: node "ControlNet as Topology — rich — checks.mjs" (about fifteen seconds).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const html = (what) => readFileSync(join(here, `ControlNet as Topology — rich — ${what}.html`), 'utf8');
const block = (src, id) => src.match(new RegExp(`<script id="${id}">([\\s\\S]*?)<\\/script>`))[1];
const pct = (v) => (100 * (v || 0)).toFixed(1) + '%';

// ── the landscape ──
{ const E = new Function(`${block(html('the landscape'), 'engine')}; return { BASE, PROMPT, cond, mix, canyon, carve, rng, tally, valleyOf, captureAt, sigmaAt, startStep, DGRID, LGRID };`)();
  const N = 2000, from0 = (n) => Array.from({ length: n }, () => ({ x: 0, y: 0 })), COND = E.cond(E.BASE, E.PROMPT);
  const far = E.canyon(-0.05, -0.02, 69 * Math.PI / 180), near = E.canyon(-0.30, 0.25, 52 * Math.PI / 180), INIT = E.BASE.find((k) => k.name === 'dog').m;
  console.log('the landscape');
  // step 2: does the fog leave only the deepest basin?
  const t = E.tally(E.BASE, E.carve({ base: E.BASE }, from0(N), 0, E.rng(1)));
  for (const k of E.BASE) console.log(`  ${k.name.padEnd(10)} depth E ${(-E.mix(E.BASE, k.m[0], k.m[1], 0).logp).toFixed(2).padStart(6)} · share of images ${pct(k.w).padStart(6)} · balls ${pct(t[k.name]).padStart(6)}`);
  console.log(`  between ${pct(t.between)}`);
  // step 3: CFG never lands a ball where no valley was
  const all = [...E.BASE, ...far];
  console.log(`  base energy at the canyon's place ${(-E.mix(E.BASE, far[0].m[0], far[0].m[1], 0).logp).toFixed(2)} (valleys ${E.BASE.map((k) => (-E.mix(E.BASE, k.m[0], k.m[1], 0).logp).toFixed(2)).join(', ')})`);
  for (const w of [0, 1, 3, 7, 12]) { const B = E.carve({ base: E.BASE, cond: COND, cfg: w }, from0(N), 0, E.rng(2)), tt = E.tally(all, B); console.log(`  CFG w ${String(w).padStart(2)}: lion valleys ${pct((tt.lion || 0) + (tt.lioness || 0))}, where no valley was ${pct(tt.canyon)}`); }
  // step 4: the canyon's weight
  for (const lam of [0.5, 1, 2, 3, 4, 8, 12]) { const B = E.carve({ base: E.BASE, cn: far, lam }, from0(N), 0, E.rng(3)); console.log(`  ControlNet λ ${String(lam).padStart(4)}: in the canyon ${pct(E.tally(all, B).canyon)}`); }
  // step 5: denoise × weight from the init, both canyon places, 100 balls a square, the piece's own seeds
  for (const [name, cn] of [['far', far], ['beside', near]]) {
    console.log(`  canyon ${name} the init (${Math.hypot(cn[0].m[0] - INIT[0], cn[0].m[1] - INIT[1]).toFixed(2)} away): rows denoise, columns λ ${E.LGRID.join(' ')}`);
    E.DGRID.forEach((d, i) => console.log(`    d ${d.toFixed(1)} σ0 ${E.sigmaAt(E.startStep(d)).toFixed(3).padStart(5)}  ${E.LGRID.map((l, j) => String(Math.round(100 * E.captureAt(E.BASE, cn, INIT, d, l, 100, 1000 + 37 * i + j))).padStart(4)).join('')}`)); }
}

// ── rough to fine ──
{ const src = html('rough to fine'); const E = new Function(`${block(src, 'images')}; ${block(src, 'engine')}; return { IMG, N, standardise, spectrum, slope, sigmaAt, decided, whiteImage };`)();
  const px = (k) => Uint8Array.from(Buffer.from(E.IMG[k], 'base64')), PS = Array.from({ length: 101 }, (_, i) => i / 100);
  console.log('\nrough to fine');
  for (const [name, x] of [['hero', E.standardise(px('hero'))], ['render 003', E.standardise(px('render'))], ['control', E.standardise(E.whiteImage(5))]]) {
    const sp = E.spectrum(x), at = (p) => E.decided(sp.P, E.sigmaAt(p)), climbs = PS.every((p, i) => i === 0 || at(p) >= at(PS[i - 1]));
    console.log(`  ${name.padEnd(10)} slope ${E.slope(sp.P).toFixed(2)} · decided at 10% ${at(0.1)}, 25% ${at(0.25)}, 50% ${at(0.5)}, 75% ${at(0.75)} · first ${Math.round(100 * PS.find((p) => at(p) > 0))}% · all ${Math.round(100 * PS.find((p) => at(p) >= E.N / 2))}% · never falls ${climbs}`); }
}
