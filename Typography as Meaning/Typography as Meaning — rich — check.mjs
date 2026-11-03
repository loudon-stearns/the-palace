// Typography as Meaning — rich — check. Workshop for [[Typography as Meaning]]'s rich face (listed in [[Typography as Meaning — rich.json]]).
// Runs each made piece's own engine (its <script id="engine"> block) against the claims the piece makes; checks that
// the function piece's grammar is still whos-talking.html's own, word for word; and recounts the forms an independent
// way, from the drawing's own geometry rather than the piece's form description.
// node "Typography as Meaning/Typography as Meaning — rich — check.mjs"   → prints each check; exits 1 on a failure.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const read = f => readFileSync(join(here, f), 'utf8');
const engine = (file, names) => {
  const src = read(file).match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
  const C = vm.createContext({ Math, JSON, Object, Set, Map, Array });
  vm.runInContext(src + '\n;globalThis.X = { ' + names.join(', ') + ' };', C);
  return C.X;
};
let fails = 0;
const check = (name, ok, detail = '') => { console.log((ok ? 'pass  ' : 'FAIL  ') + name + (detail ? '  · ' + detail : '')); if (!ok) fails++; };

// ---------- the function piece ----------
const FN = 'Typography as Meaning — rich — the function, counted.html';
const F = engine(FN, ['OPTS', 'letter', 'letterEmotionFirst', 'formOf', 'key', 'count', 'feelingsKept', 'differs', 'everyAnswer']);

// the grammar is the proof's own
const proof = read('proofs/2026-10-22-daily-page/whos-talking.html'), mine = read(FN);
const grab = (s, re) => (s.match(re) || [''])[0];
const reOpts = /const OPTS=\{[\s\S]*?\n\};/, reLetter = /function letter\(s\)\{[\s\S]*?\n\}/;
check('OPTS is whos-talking.html\'s, character for character', grab(proof, reOpts) !== '' && grab(proof, reOpts) === grab(mine, reOpts));
check('letter() is whos-talking.html\'s, character for character', grab(proof, reLetter) !== '' && grab(proof, reLetter) === grab(mine, reLetter));

check('120 answer-sets', F.everyAnswer().length === 120);
const same = F.everyAnswer().every(s => F.key(F.formOf(F.letter(s), 'ruler')) === F.key(F.formOf(F.letter(s), 'ruler')));
check('a function: the same answers draw the same form', same);

const ru = F.count('ruler'), eye = F.count('eye'), ns = F.count('nosize');
check('95 forms to a ruler', ru.forms === 95, ru.forms);
check('80 forms to the eye', eye.forms === 80, eye.forms);
check('58 forms without size', ns.forms === 58, ns.forms);
check('58 answer-sets with a form of their own, 22 shared forms (to the eye)', eye.unique === 58 && eye.shared === 22, eye.unique + ' / ' + eye.shared);
check('inside or outside reads back 120 / 120 under every reading', [ru, eye, ns].every(c => c.back.diegesis === 120));
check('to whom: 120 to a ruler, 80 to the eye', ru.back.addressee === 120 && eye.back.addressee === 80, ru.back.addressee + ', ' + eye.back.addressee);
check('who speaks: 106 to the eye, 100 without size', eye.back.source === 106 && ns.back.source === 100);
check('the feeling: 96 to the eye, 55 without size', eye.back.emotion === 96 && ns.back.emotion === 55);
check('a radio to B: five feelings look five ways to the eye, three without size', F.feelingsKept('radio', 'eye') === 5 && F.feelingsKept('radio', 'nosize') === 3);
check('A to B keeps all five feelings even without size', F.feelingsKept('A', 'nosize') === 5);
check('the narrator inside the story: five feelings make two forms', F.feelingsKept('narrator', 'eye') === 2);
const R = { source: 'radio', diegesis: 'in', addressee: 'B', emotion: 'calm' }, RM = { ...R, emotion: 'menace' }, M = { ...RM, source: 'A' };
const d1 = F.differs(F.formOf(F.letter(R), 'ruler'), F.formOf(F.letter(RM), 'ruler'));
check('source first: a menacing radio differs from a calm one only in size', d1.length === 1 && d1[0] === 'size', d1.join());
check('source first: and the sizes are 24 and 30 px', F.letter(R).size === 24 && F.letter(RM).size === 30);
const d2 = F.differs(F.formOf(F.letter(M), 'ruler'), F.formOf(F.letterEmotionFirst(RM), 'ruler'));
check('emotion first: a menacing radio differs from menace from A only in tail and place', d2.join() === 'tail,place', d2.join());
check('emotion first changes nothing the page\'s order draws when no clash (A, calm)', F.key(F.formOf(F.letter({ ...R, source: 'A' }), 'ruler')) === F.key(F.formOf(F.letterEmotionFirst({ ...R, source: 'A' }), 'ruler')));

// independent recount: the drawing's own arithmetic (draw() in whos-talking.html), with a stand-in text width per face
const W = { Marker: .62, Bangers: .45, Shadows: .5, Caveat: .42, Creepster: .58, SpecialElite: .6, Anton: .48 };
function geometry(r, merge2px) {
  const fs = r.size, txt = r.caps ? r.text.toUpperCase() : r.text.toLowerCase(), tw = txt.length * fs * W[r.font] * (r.italic ? 1.02 : 1);
  let w = Math.max(tw + 46, 90), h = fs * 1.9 + 16, cx, cy;
  if (r.where === 'margin') { w = Math.max(tw + 30, 80); h = fs * 1.5 + 8; cx = r.source === 'narrator' ? 120 + w / 2 - 50 : 320; cy = 30; if (r.to === 'us') cy = 32; }
  else if (r.to === 'self') { cx = r.source === 'radio' ? 540 : 150; cy = 118; w *= .95; }
  else if (r.to === 'us') { cx = r.source === 'radio' ? 500 : 250; cy = 62; w *= 1.1; h *= 1.1; }
  else { cx = r.source === 'radio' ? 470 : 330; cy = r.source === 'radio' ? 130 : 120; }
  if (r.where === 'margin' && r.to === 'self') cx = 200;
  if (merge2px && cy === 32) cy = 30;
  const mouth = r.tail ? (r.source === 'radio' ? 'radio' : 'A') : '-';
  return [r.shape, r.font, r.caps, r.italic ? 1 : 0, r.tremor ? 1 : 0, r.trail ? 1 : 0, mouth, r.where === 'frame' && r.to === 'us' ? 1 : 0, cx.toFixed(2), cy, w.toFixed(2), h.toFixed(2)].join('|');
}
const g1 = new Set(F.everyAnswer().map(s => geometry(F.letter(s), false))), g2 = new Set(F.everyAnswer().map(s => geometry(F.letter(s), true)));
check('recounted from the drawing\'s geometry: 95 to a ruler', g1.size === 95, g1.size);
check('recounted from the drawing\'s geometry: 80 once the 2 px shift is merged', g2.size === 80, g2.size);

// ---------- the grammar piece ----------
const G = engine('Typography as Meaning — rich — the grammar, blind.html', ['ORDER_STEPS', 'SHAPES', 'MEANINGS', 'pairsAgree', 'chanceOrder', 'scoreShapes', 'chanceShapes']);
for (const [k, S] of Object.entries(G.ORDER_STEPS)) {
  const t = S.items.map(i => i.truth).sort((a, b) => a - b).join();
  check(`${k}: the grammar's order is a full ranking`, t === S.items.map((_, i) => i).join());
  const truth = id => S.items.find(x => x.id === id).truth, ids = S.items.slice().sort((a, b) => a.truth - b.truth).map(i => i.id);
  const all = G.pairsAgree(ids, truth), none = G.pairsAgree(ids.slice().reverse(), truth);
  check(`${k}: the grammar's own order scores every pair, its reverse none`, all.ok === all.all && none.ok === 0, `${all.ok}/${all.all}`);
  // brute: the mean over every order is half the pairs
  const perms = a => a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map(p => [x, ...p]));
  const P = perms(ids), mean = P.reduce((a, p) => a + G.pairsAgree(p, truth).ok, 0) / P.length, perfect = P.filter(p => G.pairsAgree(p, truth).ok === all.all).length;
  const c = G.chanceOrder(ids.length);
  check(`${k}: chance figures match a count over all ${P.length} orders`, mean === c.meanPairs && P.length / perfect === c.oneIn, `mean ${mean}, 1 in ${P.length / perfect}`);
}
check('weight step: only the weight differs', new Set(G.ORDER_STEPS.weight.items.map(i => i.fam + i.size + i.text)).size === 1);
check('case step: only the case differs', new Set(G.ORDER_STEPS.case.items.map(i => i.fam + i.size + i.weight + i.text.toLowerCase())).size === 1);
check('seven outlines, seven distinct meanings', G.SHAPES.length === 7 && new Set(G.MEANINGS).size === 7);
check('naming every outline the grammar\'s way scores 7', G.scoreShapes(Object.fromEntries(G.SHAPES.map(s => [s.id, s.means]))) === 7);
check('naming at random gets 1 of 7 on average', G.chanceShapes.mean === 1);

console.log(fails ? `\n${fails} check(s) failed` : '\nall checks pass');
process.exit(fails ? 1 : 0);
