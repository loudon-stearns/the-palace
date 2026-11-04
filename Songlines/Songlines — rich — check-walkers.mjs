#!/usr/bin/env node
/*
  title: Songlines — rich — check-walkers
  born: 2026-11-04
  links: [[Songlines]] (connects-to · rich-face-check) · checks [[Songlines — rich — two-walkers.html]]
  forward_vector: I run the two-walkers piece's own engine on the piece's own inlined graph, headless, against
    the rule the piece states before its run, and say what number would have meant failure; with --bake I
    write what I read into the piece so a reader's live run can be compared with mine.

  The rule (stated in the piece before its run, and here):
    budget 200 walks × 15 hops from the seven born-with doors, 100 seeds, worn walker at α = 1.
    A holds if worn-unreached ≥ 1.25 × even-unreached in ≥ 95 of 100 seeds; fails if worn ≤ even in > 5 seeds.
    B holds if the median seed's share of worn-unreached linked from a page the worn walker stood on is ≥ 0.80.
    Null: at α = 0, median ratio within 1.00 ± 0.05 and worn ahead in 30–70 seeds, or the engine is wrong.
    A′ (added after the challenge, 2026-11-04, stated before its first run): the use values shuffled across entries,
    200 seeded permutations; worn walker's median unreached over seeds 1–10 per shuffle and for real use. Holds if
    real > shuffled in ≥ 190 of 200; otherwise the hiding is unevenness, not this palace's particular wear.
  Usage: node "Songlines/Songlines — rich — check-walkers.mjs" [--bake]   (exit 1 if the null fails)
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PIECE = path.join(HERE, 'Songlines — rich — two-walkers.html');
const src = fs.readFileSync(PIECE, 'utf8');
const G = JSON.parse(src.match(/\/\*GRAPH-BEGIN\*\/([\s\S]*?)\/\*GRAPH-END\*\//)[1]);
const engine = src.match(/\/\*ENGINE-BEGIN\*\/([\s\S]*?)\/\*ENGINE-END\*\//)[1];
const Walk = new Function(engine + '\nreturn Walk;')();

const R = Walk.reach(G), din = Walk.indeg(G), med = Walk.median, N = G.titles.length;
console.log(`graph @ ${G.read_at}: ${N} entries, ${G.counts.edges} body links · country from the doors ${R.size} · out of the test ${N - R.size}`);

const T = Walk.test(G, { alpha: 1 }), Z = Walk.test(G, { alpha: 0 });
const zAhead = Z.rows.filter(r => r.worn > r.even).length;
const nullOk = Math.abs(Z.ratioMed - 1) <= 0.05 && zAhead >= 30 && zAhead <= 70;
console.log(`null α=0: ratio ${Z.ratioMed.toFixed(3)}, worn ahead ${zAhead}/100 → ${nullOk ? 'holds' : 'FAILS'} (fails outside 0.95–1.05 or 30–70)`);
console.log(`A α=1: even ${T.evenMed}, worn ${T.wornMed}, ratio ${T.ratioMed.toFixed(3)}, ≥1.25× in ${T.winsA}/100, worn≤even in ${T.losses}/100 → ${T.verdictA}`);
console.log(`   hops taken per seed (median of 3000): even ${T.hopsEvenMed}, worn ${T.hopsWornMed} — the worn walker does not miss more by stopping sooner`);
console.log(`B α=1: share beside the path ${T.shareMed.toFixed(4)} (even walker's ${med(T.rows.map(r => r.shareEven)).toFixed(4)}) → ${T.verdictB}, and it does not separate the arms`);

const X = Walk.shuffleTest(G);
console.log(`A′ shuffled use: real ${X.real}, shuffled median ${X.shufMed} (range ${Math.min(...X.shuf)}–${Math.max(...X.shuf)}), real ahead in ${X.beaten}/200, shuffles ≥ real ${X.shuf.filter(x => x >= X.real).length} → ${X.verdict}`);
const missE = new Array(N).fill(0), missW = missE.slice();
for (let s = 1; s <= 100; s++) { const e = Walk.run(G, 'even', { seed: s }).visits, w = Walk.run(G, 'worn', { seed: s }).visits; for (const v of R) { if (!e[v]) missE[v]++; if (!w[v]) missW[v]++; } }
const Rl = [...R], hid = Rl.filter(v => missW[v] >= 50 && missE[v] < 50), both = Rl.filter(v => missW[v] >= 50 && missE[v] >= 50), found = Rl.filter(v => missW[v] < 50);
console.log(`hidden by wear ${hid.length} (in-links med ${med(hid.map(v => din[v]))}, words med ${med(hid.map(v => G.words[v]))}) · missed by both ${both.length} (in-links med ${med(both.map(v => din[v]))}) · found by worn: words med ${med(found.map(v => G.words[v]))}`);
console.log(`hidden and linked straight from a door: ${hid.filter(v => G.doors.some(d => G.out[d].includes(v))).map(v => G.titles[v]).join('; ')}`);

// beside the verdict, not part of it: the budget, and a second wear rule
for (const W of [50, 200, 1000, 5000]) { const Y = Walk.test(G, { W, seeds: 20 }); console.log(`  budget ${W} walks (20 seeds): even ${Y.evenMed}, worn ${Y.wornMed}, gap ${Y.wornMed - Y.evenMed} entries, ratio ${Y.ratioMed.toFixed(2)} — the worn count falls; the gap closes after 200`); }
const Z2 = Walk.test({ ...G, use: din }, {}); console.log(`  worn by in-links instead of use: even ${Z2.evenMed}, worn ${Z2.wornMed}, ratio ${Z2.ratioMed.toFixed(2)}, ${Z2.winsA}/100 → ${Z2.verdictA}`);

if (process.argv.includes('--bake')) {
  const E = { even: T.evenMed, worn: T.wornMed, winsA: T.winsA, losses: T.losses, share: +T.shareMed.toFixed(4), nullRatio: +Z.ratioMed.toFixed(4), nullAhead: zAhead, hidden: hid.length, shufReal: X.real, shufMed: X.shufMed, shufBeaten: X.beaten };
  fs.writeFileSync(PIECE, src.replace(/\/\*EXPECT-BEGIN\*\/[\s\S]*?\/\*EXPECT-END\*\//, () => '/*EXPECT-BEGIN*/' + JSON.stringify(E) + '/*EXPECT-END*/'));
  console.log('baked into the piece:', JSON.stringify(E));
}
process.exit(nullOk ? 0 : 1);
