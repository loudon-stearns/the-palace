// Runs the same senses through the JS feel engine and compares with the C++ core.
//   clang++ -std=c++17 -Wall -O2 test_core.cpp -o test_core && ./test_core > core.csv && node compare.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, '../../proofs/feel-lab/feel_engine.js'), 'utf8');
const { makeEngine, FEELS } = new Function(src + '\nreturn { makeEngine, FEELS };')();
const e = makeEngine({});
const js = {
  frets: FEELS.frets({ kick: 0.006 }), string: FEELS.string(), struck: FEELS.struck(), pendulum: FEELS.struck({ law: 'pendulum' }),
  follow: Object.assign(FEELS.follow(), { target: () => 0.785 }), turntable: FEELS.turntable({ ffB: 1e-4, ffC: 0.003 }), centre: FEELS.centre(),
};
const rows = fs.readFileSync(path.join(here, 'core.csv'), 'utf8').trim().split('\n').slice(1);
const worst = {};
for (const r of rows) {
  const [name, th, om, tau] = r.split(','); const t = +th, w = +om;
  let ref;
  if (name === 'walls') ref = -0.03 * t - (t > 1 ? 3 * (t - 1) : t < -1 ? 3 * (t + 1) : 0);
  else { e.s.sensedTh = t; e.s.sensedOm = w; ref = js[name].torque(e, 1e-3); }
  const err = Math.abs(ref - +tau);
  worst[name] = Math.max(worst[name] || 0, err);
}
console.log(JSON.stringify(worst, null, 1));
const bad = Object.entries(worst).filter(([, v]) => v > 1e-5);
console.log(bad.length ? 'MISMATCH ' + bad.map(b => b[0]).join(' ') : 'C++ core matches the JS feel engine (all within 1e-5 N·m)');
process.exit(bad.length ? 1 : 0);
