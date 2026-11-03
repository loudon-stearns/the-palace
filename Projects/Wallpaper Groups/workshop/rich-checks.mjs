// rich-checks.mjs — re-checks the claims Wallpaper Groups' rich-face pieces make, on the pieces'
// own engines (the code between ENGINE-START and ENGINE-END in each piece), headless.
//
//   node "Projects/Wallpaper Groups/workshop/rich-checks.mjs"
//
// Each check prints what it measured and PASS or FAIL against the claim. Exit 1 on any FAIL.
// A FINDING line is a measured disagreement with the entry's text, carried to the manifest's offers.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const bundle = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = (piece) => readFileSync(join(bundle, `Wallpaper Groups — rich — ${piece}.html`), 'utf8');
const block = (piece) => { const m = html(piece).match(/\/\*ENGINE-START\*\/([\s\S]*?)\/\*ENGINE-END\*\//); if (!m) throw new Error(`no engine in ${piece}`); return m[1]; };
const engine = (piece, names) => new Function(`${block(piece)}\nreturn { ${names.join(', ')} };`)();
let fails = 0;
const say = (ok, what, detail) => { if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}${detail ? `\n      ${detail}` : ''}`); };
const finding = (what) => console.log(`FINDING  ${what}`);
const near = (a, b, e = 1e-9) => Math.abs(a - b) < e;

// ───────────── the group engine: one tile and which turns fit ─────────────
console.log('— the seventeen (one tile · which turns fit) —');
say(block('one tile') === block('which turns fit'), 'the two pattern pieces carry the same engine, byte for byte');
const G = engine('one tile', ['GROUPS', 'LATTICES', 'fracOps', 'cartOps', 'profile', 'textBin', 'copies', 'det', 'twoCos', 'turnFits', 'landing', 'fiveFold', 'pentagonsAround']);
say(G.GROUPS.length === 17 && new Set(G.GROUPS.map((g) => g.id)).size === 17, `seventeen groups, seventeen names`, G.GROUPS.map((g) => g.id).join(' '));
let iso = true;
for (const g of G.GROUPS) for (const o of G.cartOps(g)) { const M = o.M, a = M[0][0] * M[0][0] + M[1][0] * M[1][0], b = M[0][1] * M[0][1] + M[1][1] * M[1][1], c = M[0][0] * M[0][1] + M[1][0] * M[1][1]; if (!near(a, 1) || !near(b, 1) || !near(c, 0)) iso = false; }
say(iso, 'every operation is an isometry on the lattice its group is drawn on');
// closure modulo the lattice (and the centring vector, for cm and cmm)
let closed = true; const bad = [];
for (const g of G.GROUPS) {
  const ops = G.fracOps(g), p = [0.1234, 0.3141];
  const act = (o, q) => [o.m[0][0] * q[0] + o.m[0][1] * q[1] + o.t[0], o.m[1][0] * q[0] + o.m[1][1] * q[1] + o.t[1]];
  const frac = (q) => q.map((v) => v - Math.floor(v + 1e-9));
  const orbit = ops.map((o) => frac(act(o, p)));
  for (const a of ops) for (const b of ops) { const q = frac(act(a, act(b, p))); if (!orbit.some((r) => near(r[0], q[0], 1e-7) && near(r[1], q[1], 1e-7))) { closed = false; bad.push(g.id); } }
}
say(closed, 'each group is closed: any two operations compose to a third, up to a lattice slide', bad.length ? `open: ${[...new Set(bad)].join(' ')}` : '');
const order = G.GROUPS.map((g) => G.profile(g).perCell);
say(JSON.stringify(order) === JSON.stringify([1, 2, 2, 2, 4, 4, 4, 4, 8, 4, 8, 8, 3, 6, 6, 6, 12]), 'copies of the tile per cell match the International Tables', order.join(' '));
const sig = G.GROUPS.map((g) => { const p = G.profile(g); return [p.turn, p.mirrors, p.glides, p.mirrorAlongShort].join('/'); });
say(new Set(sig).size === 17, 'the seventeen are seventeen different groups (turn, mirrors, glides, mirror direction)', sig.join('  '));
const byTurn = [1, 2, 3, 4, 6].map((k) => G.GROUPS.filter((g) => G.profile(g).turn === k).length);
say(JSON.stringify(byTurn) === '[4,5,3,3,2]', `by highest turn (none, ½, ⅓, ¼, ⅙): ${byTurn.join(', ')}`);
const kinds = ['translation only', 'translation and reflection', 'translation and rotation', 'rotation with reflection or glide'];
const byKind = kinds.map((k) => G.GROUPS.filter((g) => G.textBin(G.profile(g)) === k).length);
const members = kinds.map((k) => G.GROUPS.filter((g) => G.textBin(G.profile(g)) === k).map((g) => g.id).join(' '));
say(JSON.stringify(byKind) === '[1,3,4,9]' && byKind.reduce((a, b) => a + b) === 17, `by the section's four kinds: ${byKind.join(', ')}`, members.join(' | '));
finding(`the section lists 4, 5, 3, 5; its own kinds count ${byKind.join(', ')}; its numbers are the split by highest turn ${byTurn.join(', ')} with two bins merged, quarter + sixth or third + sixth, which the count can't tell apart`);
// the kaleidoscope sentence: turn the tile, which copies turn with it
const refl = G.GROUPS.filter((g) => G.cartOps(g).some((o) => G.det(o.M) < 0));
const half = refl.every((g) => { const ops = G.cartOps(g); return 2 * ops.filter((o) => G.det(o.M) < 0).length === ops.length; });
say(refl.length === 12 && half, `groups with a mirror or glide: ${refl.length}; in each exactly half the copies are reflected`);
let counter = true, still = true;
for (const g of G.GROUPS) {
  const A = G.copies(g, 0, 1), B = G.copies(g, 0.3, 1);
  A.list.forEach((a, i) => {
    const b = B.list[i], angA = Math.atan2(a.M[1][0], a.M[0][0]), angB = Math.atan2(b.M[1][0], b.M[0][0]);
    let d = angB - angA; d = Math.atan2(Math.sin(d), Math.cos(d));
    if (!near(d, a.flip ? -0.3 : 0.3, 1e-9)) counter = false;
    if (!near(a.c[0], b.c[0]) || !near(a.c[1], b.c[1])) still = false;
  });
}
say(counter, 'turn the tile by 0.3 rad: every unreflected copy turns +0.3, every reflected copy −0.3');
say(still, 'and no copy moves: the pattern as a whole does not turn, its centres stay put');
finding('the kaleidoscope sentence ("the entire pattern rotates in lockstep") holds for the 5 groups with no reflection; in the other 12, a kaleidoscope among them, half the copies turn the other way');
// the crystallographic restriction
const fits = [...Array(12)].map((_, i) => i + 1).filter(G.turnFits);
say(JSON.stringify(fits) === '[1,2,3,4,6]', `turns n with 2·cos(360°/n) whole, n = 1…12: ${fits.join(', ')}`);
const land = (lat, n) => { const L = G.landing(lat, n, 3.2); return `${L.hit}/${L.all}`; };
const sq = [2, 3, 4, 5, 6, 7, 8].map((n) => land('square', n)), hx = [2, 3, 4, 5, 6, 7, 8].map((n) => land('hex', n));
say(sq[0] === '37/37' && sq[2] === '37/37' && [1, 3, 4, 5, 6].every((i) => sq[i] === '1/37') && hx[0] === '37/37' && hx[1] === '37/37' && hx[4] === '37/37' && [2, 3, 5, 6].every((i) => hx[i] === '1/37'),
  'points landing on points under a 360°/n turn, n = 2…8', `square ${sq.join(' ')} · hexagonal ${hx.join(' ')}`);
const five = [1, 2, 3].map((m) => G.fiveFold(m).dmin), phi = (1 + Math.sqrt(5)) / 2;
say(near(five[0], phi ** -2, 1e-9) && near(five[1], phi ** -3, 1e-9) && near(five[2], phi ** -4, 1e-9), `closing a set under a fifth-turn, shortest step: ${five.map((v) => v.toFixed(4)).join(', ')} (φ⁻², φ⁻³, φ⁻⁴)`);
say(G.pentagonsAround(3) === 36 && G.pentagonsAround(4) === -72, 'regular pentagons at one corner: three leave 36°, four overlap 72°');

// ───────────── rhythm on a strip ─────────────
console.log('— rhythm on a strip —');
const R = engine('rhythm on a strip', ['frieze', 'fillHalf', 'same', 'shift', 'turnLands', 'kfold', 'layCells', 'symmetries']);
const row = (n, hits) => Array.from({ length: n }, (_, i) => (hits.includes(i) ? 1 : 0));
const ks = R.frieze([row(16, [0, 8]), row(16, [4, 12])]);
say(ks.id === 'p2mg' && ks.G, `kick-snare-kick-snare (low on 1 and 3, high on 2 and 4) is ${ks.id}: it has a glide, one beat along with the voices swapped`);
finding('the glide the section places on a quarter-note hi-hat lives in its kick-snare-kick-snare: slide a beat, swap low for high');
let oneSame = true;
for (let m = 0; m < 256; m++) { const P = [row(16, [...Array(8)].map((_, i) => i).filter((i) => (m >> i) & 1))]; if (!R.same(R.fillHalf(P, 'backwards'), R.fillHalf(P, 'half-turn'))) oneSame = false; }
say(oneSame, 'one voice: backwards and half-turn make the same loop, all 256 first halves');
const cell = [row(16, [0, 1, 5]), row(16, [3])];
const fills = ['repeat', 'backwards', 'half-turn', 'glide'].map((h) => `${h} → ${R.frieze(R.fillHalf(cell, h)).id}`);
say(fills.join(', ') === 'repeat → p1, backwards → p1m1, half-turn → p2, glide → p11g', 'two voices, a cell with no symmetry of its own: each fill makes its own frieze group', fills.join(', '));
const seen = new Set(); let seed = 7; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
for (let t = 0; t < 20000; t++) { const n = [4, 6, 8][t % 3], a = row(n, [...Array(n)].map((_, i) => i).filter(() => rnd() < 0.4)), b = rnd() < 0.15 ? a.slice() : row(n, [...Array(n)].map((_, i) => i).filter(() => rnd() < 0.4)); seen.add(R.frieze([a, b]).id); }
say(seen.size === 7, `random two-voice loops reach exactly the seven frieze groups`, [...seen].sort().join(' '));
finding('a two-voice loop is a frieze group, one of 7, not a wallpaper group, one of 17');
const rp2 = R.fillHalf(cell, 'repeat'), rp2one = R.fillHalf([row(16, [0, 1, 3])], 'repeat');
say(R.frieze(rp2).id === 'p1' && !R.frieze(rp2).R && R.frieze(rp2one).id === 'p1', "recipe-p2's rule, n → n + 8, is a slide: on a cell with no symmetry of its own it makes p1, no half-turn");
say(!R.turnLands(16, 5) && R.turnLands(15, 5) && R.turnLands(20, 5), 'a fifth of a turn lands on steps in 15 and 20 steps, not in 16');
const c16 = [row(16, [0, 1]), row(16, [2])], g3 = R.layCells(c16, 5, 3), o4 = R.layCells(c16, 5, 4);
say(g3.gap === 1 && !R.kfold(g3.P, 5) && o4.overlap === 4 && !R.kfold(o4.P, 5), `16 steps, five cells: of 3 leave a ${g3.gap}-step gap, of 4 overlap by ${o4.overlap}; neither is five-fold`);
const c20 = [row(20, [0, 1, 3]), row(20, [2])], L20 = R.layCells(c20, 5, 4), c15 = [row(15, [0, 1]), row(15, [2])], L15 = R.layCells(c15, 5, 3);
say(L20.gap === 0 && L20.overlap === 0 && R.kfold(L20.P, 5) && L15.gap === 0 && L15.overlap === 0 && R.kfold(L15.P, 5), '20 steps (cells of 4) and 15 steps (cells of 3): no gap, no overlap, five-fold');
finding('"a drum pattern cannot both tile the timeline perfectly and exhibit 5-fold rotational symmetry" holds on a 16-step grid and fails on 15 or 20 steps (and off the grid: quintuplets)');
// the World Music section's Ewe bell, as listed: accents at 1, 3, 5, 6, 8, 10, 12 of 12
const bellHits = [1, 3, 5, 6, 8, 10, 12].map((v) => v - 1), bell = [row(12, bellHits)];
const euclid = (k, n) => [...Array(k)].map((_, j) => Math.floor((j * n) / k));
const isRot = (A, Bset, n) => A.length === Bset.length && [...Array(n)].some((_, s) => A.every((a) => Bset.includes((a + s) % n)));
say(bellHits.length === 7 && isRot(euclid(7, 12), bellHits, 12) && !isRot(euclid(5, 12), bellHits, 12) && !R.kfold(bell, 3),
  `the listed Ewe bell has ${bellHits.length} onsets: it is E(7,12) turned, not E(5,12), and a third of a turn (4 steps) does not land it on itself`);
const anyK = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].every((k) => { const n = 2 * k, P = R.layCells([row(n, [0]), row(n, [1])], k, 2).P; return R.kfold(P, k); });
say(anyK, 'every k from 2 to 12 fits a loop of 2k steps: on a timeline no turn is forbidden');

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
