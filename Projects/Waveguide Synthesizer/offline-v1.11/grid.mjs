import { variant, bowAt } from './sweep.mjs';
const cfg = JSON.parse(process.argv[2] || '{"Fscale":1,"Flo":0.05,"Fhi":20,"v0":0.1,"r":0.4}');
const src = variant(cfg);
const forces = [0.3, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
console.log('pos  ideal | ' + forces.join('      '));
for (const position of [0.55, 0.6, 0.66, 0.74, 0.8, 0.85, 0.9, 0.93]) {
  const cells = forces.map(force => { const r = bowAt(src, { position, force, sec: 1.2 }); return `${String(r.hold_pct).padStart(3)}/${r.lets}${r.periodic < 0.95 ? '~' : ' '}`; });
  console.log(position.toFixed(2), ' ', Math.round(100 * position), ' |', cells.join(' '));
}
