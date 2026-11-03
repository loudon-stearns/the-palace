// Graphic Storytelling — rich — check. Workshop.
// Runs the time-is-space piece's own engine (its <script id="engine"> block) against what the piece claims of itself:
// the five layouts' geometry, the blind schedule, and the verdict on made-up hands, including hands that should fail the claim.
// node "Graphic Storytelling/Graphic Storytelling — rich — check.mjs"   → prints each check, exits 1 on a failure.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const piece = readFileSync(join(here, 'Graphic Storytelling — rich — time is space.html'), 'utf8');
const src = piece.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const C = vm.createContext({});
vm.runInContext(src + '\n;globalThis.X = { P, G, EXTRA, LAYOUTS, STORIES, geometry, geoOf, rng, schedule, analyse, BAND };', C);
const X = C.X;

let fails = 0;
const check = (name, ok, detail = '') => { console.log((ok ? 'pass  ' : 'FAIL  ') + name + (detail ? '  · ' + detail : '')); if (!ok) fails++; };
const near = (a, b) => Math.abs(a - b) < 1e-9;

// 1. geometry: the wide panel and the wide gutter add the same length along the line; the tall panel the same area across it
const g = Object.fromEntries(X.LAYOUTS.map((l) => [l.key, X.geoOf(l.key)]));
const area = (p) => p.w * p.h;
check('wide panel adds 102 px along the line', near(g.wide.width - g.plain.width, X.EXTRA) && near(X.EXTRA, 102), `${g.wide.width - g.plain.width}`);
check('wide gutter adds the same 102 px along the line', near(g.gutter.width - g.plain.width, X.EXTRA));
check('narrow panel takes 0.35 of a panel off the line', near(g.plain.width - g.narrow.width, 0.35 * X.P));
check('tall panel adds nothing along the line', near(g.tall.width, g.plain.width));
check('tall panel adds the same area as the wide one', near(area(g.tall.panels[1]), area(g.wide.panels[1])), `${area(g.tall.panels[1])} = ${area(g.wide.panels[1])}`);
check('every layout stands on one ground line (the middle panel’s bottom is the row’s)', X.LAYOUTS.every((l) => near(g[l.key].panels[1].y + g[l.key].panels[1].h, X.P)));
check('the first and last panels never change', X.LAYOUTS.every((l) => { const [a, , c] = g[l.key].panels; return a.w === X.P && a.h === X.P && c.w === X.P && c.h === X.P && near(c.x - (g[l.key].panels[1].x + g[l.key].panels[1].w), X.LAYOUTS.find((m) => m.key === l.key).g2); }));
check('the narrow middle panel is wide enough for every middle drawing (110 px of content)', g.narrow.panels[1].w >= 110, `${g.narrow.panels[1].w.toFixed(1)} px`);

// 2. the schedule: every story in every layout once, no story or layout twice running, scales 0.9–1.1
let okAll = true, okAdj = true, okScale = true;
for (let seed = 1; seed <= 2000; seed++) {
  const o = X.schedule(X.rng(seed));
  const keys = new Set(o.map((t) => t.story + '|' + t.layout));
  if (o.length !== 15 || keys.size !== 15) okAll = false;
  if (!o.every((t, i) => i === 0 || (t.story !== o[i - 1].story && t.layout !== o[i - 1].layout))) okAdj = false;
  if (!o.every((t) => t.scale >= 0.9 && t.scale <= 1.1)) okScale = false;
}
check('2000 shuffles: every story in every layout exactly once', okAll);
check('2000 shuffles: no story and no layout twice running', okAdj);
check('2000 shuffles: every strip drawn at a scale from 0.9 to 1.1', okScale);

// 3. the verdict on made-up hands
const base = { door: 2.0, kettle: 3.5, bus: 2.6 };
const hands = (f) => X.STORIES.flatMap((s) => X.LAYOUTS.map((l) => ({ story: s.key, layout: l.key, hold: base[s.key] * f(l, s) })));
const claim = { plain: 1, wide: 1.45, gutter: 1.3, narrow: 0.75, tall: 1.02 };
let A = X.analyse(hands((l) => claim[l.key]));
check('a reader who follows the claim: wide and gutter longer, narrow shorter, tall unclear', A.by.wide.out === 'longer' && A.by.gutter.out === 'longer' && A.by.narrow.out === 'shorter' && A.by.tall.out === 'mixed');
check('… and the verdict says both halves held', /^Both halves/.test(A.verdict[0]) && /looks like the line/.test(A.verdict[2]));

const sizeHand = (l) => (l.w2 * l.h2) / (X.P * X.P);        // holds that follow the middle panel's area
A = X.analyse(hands(sizeHand));
check('a reader who answers size: the tall control comes out longer and the verdict says size, not the line', A.by.tall.out === 'longer' && A.verdict.some((v) => /may be size/.test(v)));
check('… and the wide gutter, which adds no panel area, does not come out longer', A.by.gutter.out !== 'longer' && /split them/.test(A.verdict[0]));

A = X.analyse(hands(() => 1));
check('a reader the layout never moves: every row unclear, and the verdict says the claim did not show', A.rows.every((r) => r.out === 'mixed') && /^Neither held/.test(A.verdict[0]) && /not drawn as space/.test(A.verdict[0]));

A = X.analyse(hands((l, s) => (l.key === 'wide' ? 1.4 : l.key === 'gutter' ? (s.key === 'door' ? 1.3 : 0.95) : 1)));
check('wide alone longer: the verdict splits the sentence and names the gutter as unclear', A.by.wide.out === 'longer' && A.by.gutter.out === 'mixed' && /The wider panel lasted longer.*wider gutter came out not clearly/.test(A.verdict[0]));

// 4. the chance line: with no effect and a hand's own scatter, "longer in all three" comes up at most one run in eight
const r = X.rng(7); const gauss = () => { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };
let longer = 0; const N = 20000;
for (let k = 0; k < N; k++) if (X.analyse(hands(() => Math.exp(0.25 * gauss()))).by.wide.out === 'longer') longer++;
check('null hands (25 % scatter): wide comes out "longer" at most 1 in 8', longer / N <= 1 / 8, `${(longer / N).toFixed(4)} of ${N}`);
let longer0 = 0;
for (let k = 0; k < N; k++) if (X.analyse(hands(() => Math.exp(0.01 * gauss()))).by.wide.out === 'longer') longer0++;
check('null hands (1 % scatter): the tenth band keeps it at zero', longer0 === 0, `${longer0} of ${N}`);

// 5. the verdict never contradicts the table, over random hands
let agree = true;
for (let k = 0; k < 3000; k++) {
  const a = X.analyse(hands(() => Math.exp(0.35 * gauss())));
  const v = a.verdict.join(' ');
  if (/^Both halves/.test(v) && !(a.by.wide.out === 'longer' && a.by.gutter.out === 'longer')) agree = false;
  if (/^Neither held/.test(v) && (a.by.wide.out === 'longer' || a.by.gutter.out === 'longer')) agree = false;
  if (/went the other way, shorter in all three/.test(v) !== (a.by.narrow.out === 'shorter')) agree = false;
  if (/may be size/.test(v) !== (a.by.tall.out === 'longer')) agree = false;
}
check('3000 random runs: every verdict line agrees with the table', agree);

console.log(fails ? `\n${fails} failed` : '\nall pass');
process.exit(fails ? 1 : 0);
