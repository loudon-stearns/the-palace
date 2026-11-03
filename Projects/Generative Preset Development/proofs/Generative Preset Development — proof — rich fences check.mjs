// title: Generative Preset Development — proof — rich fences check
// born: 2026-11-03
// links: [[Generative Preset Development]] (connects-to, proof-for-the-rich-face)
// forward_vector: I re-check, headless, that the rich piece bakes exactly what the rich-fences proofs measured,
//   that both answer keys, their chance and their no-listen arms are what the piece says, that its scoring
//   passes its nulls, and that the files it plays have the timing it assumes. Remade after the challenge.
// usage: node "<this>" "<piece.html>" "<bake.json>" "<rich-face dir>"
import fs from 'node:fs';
const [piecePath, bakePath, mediaDir] = process.argv.slice(2);
const html = fs.readFileSync(piecePath, 'utf8');
const bake = JSON.parse(fs.readFileSync(bakePath, 'utf8'));
const L = new Function(html.slice(html.indexOf('const L = {'), html.indexOf('const KEYNAME')) + '; return L;')();
const { agree, verdictOf } = new Function(html.match(/const agree = [^\n]+/)[0] + '\n' + html.match(/const verdictOf = [^\n]+/)[0] + '\nreturn { agree, verdictOf };')();
let fail = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fail++; };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
for (const fam of ['cutoff', 'attack']) {
  const d = L[fam], b = bake[fam], n = d.fence_names.length;
  ok(d.N === b.N && d.value.every((v, i) => Math.abs(v - b.rungs[i].value) < 1e-9), `${fam}: rung values match the bake`);
  ok(d.feature.every((v, i) => Math.abs(v - b.rungs[i].feature) < 1e-9), `${fam}: features match the bake`);
  ok(d.gain_db.every((v, i) => Math.abs(v - b.rungs[i].gain_db) < 1e-9) && d.lufs.every((v, i) => Math.abs(v - b.rungs[i].lufs) < 1e-9), `${fam}: loudness and gains match the bake`);
  ok(same(d.fence_names, b.fence_names) && d.bands.length === n + 1, `${fam}: fences ${d.fence_names}`);
  for (const k of ['generator', 'fifths']) ok(same(d.keys[k].fences, b.keys[k].fences), `${fam}: ${k} key ${d.keys[k].fences} matches the bake`);
  ok(same(Object.values(d.arms), Object.values(b.arms)), `${fam}: no-listen arms match the bake`);
  // chance and confirmability, recomputed by enumeration in JS
  const combos = []; const rec = (start, acc) => { if (acc.length === n) { combos.push(acc); return; } for (let r = start; r < d.N; r++) rec(r, [...acc, r]); }; rec(1, []);
  ok(combos.length === d.placements, `${fam}: ${combos.length} ordered placements`);
  for (const k of ['generator', 'fifths']) {
    const key = d.keys[k], dist = combos.map(c => agree(c, key.fences));
    const all = dist.filter(x => x === n).length / combos.length, partly = dist.filter(x => x >= 2 && x < n).length / combos.length;
    ok(Math.abs(all - key.chance_all) < 5e-5 && Math.abs(partly - key.chance_partly) < 5e-5, `${fam}/${k}: chance full ${all.toFixed(4)}, partly ${partly.toFixed(4)}`);
    const bottomBest = Math.max(...combos.filter(c => c[n - 1] <= Math.max(n, Math.floor(d.N / 3) + 1)).map(c => agree(c, key.fences)));
    const conf = Object.values(d.arms).every(f => agree(f, key.fences) < n) && bottomBest < n;
    ok(conf === key.confirmable, `${fam}/${k}: confirmable ${conf} (best crowded-low guess ${bottomBest} of ${n})`);
    ok(agree(key.fences, key.fences) === n && agree(key.fences.map(x => x + 2), key.fences) === 0, `${fam}/${k}: null, the key scores ${n} against itself and 0 two rungs off`);
  }
  ok(verdictOf(n, n, true).startsWith('it sits') && verdictOf(n, n, false).startsWith('full agreement, which'), `${fam}: a refute-only key never reads "sits"`);
  // the file the piece plays
  const buf = fs.readFileSync(`${mediaDir}/ladder-${fam}-mono.wav`);
  const dataIdx = buf.indexOf('data'), bytes = buf.readUInt32LE(dataIdx + 4), fmt = buf.readUInt16LE(20), ch = buf.readUInt16LE(22), sr = buf.readUInt32LE(24), bits = buf.readUInt16LE(34);
  const frames = bytes / (ch * bits / 8);
  ok(fmt === 3 && ch === 1 && sr === 44100 && bits === 32, `${fam}: mono float32 at 44.1 kHz`);
  ok(Math.abs(frames / 44100 - d.N * d.stride_s) < d.N / 44100, `${fam}: ${frames} frames = ${d.N} rungs x ${d.stride_s} s`);
  ok(d.rung_s < d.stride_s && buf.length < 25 * 1024 * 1024, `${fam}: rungs don't overlap; ${(buf.length / 1048576).toFixed(1)} MB, under 25 MB`);
}
console.log(fail ? `${fail} failed` : 'all passed');
process.exit(fail ? 1 : 0);
