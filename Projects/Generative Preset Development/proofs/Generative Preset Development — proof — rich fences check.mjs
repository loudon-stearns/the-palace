// title: Generative Preset Development — proof — rich fences check
// born: 2026-11-03
// links: [[Generative Preset Development]] (connects-to, proof-for-the-rich-face)
// forward_vector: I re-check, headless, that the rich piece bakes exactly what the rich-fences proof measured,
//   that its scoring passes its nulls, and that the files it plays have the timing it assumes.
// usage: node "<this>" "<piece.html>" "<bake.json>" "<rich-face dir>"
// usage: node "<this>" "<piece.html>" "<bake.json>" "<rich-face dir>"
import fs from 'node:fs';
const [piecePath, bakePath, mediaDir] = process.argv.slice(2);
const html = fs.readFileSync(piecePath, 'utf8');
const bake = JSON.parse(fs.readFileSync(bakePath, 'utf8'));
const src = html.slice(html.indexOf('const L = {'), html.indexOf('const hz ='));
const L = new Function(src + '; return L;')();
const agreeSrc = html.match(/const agree = [^\n]+/)[0], verdictSrc = html.match(/const verdictOf = [^\n]+/)[0];
const { agree, verdictOf } = new Function(agreeSrc + '\n' + verdictSrc + '\nreturn { agree, verdictOf };')();
let fail = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fail++; };
for (const fam of ['cutoff', 'attack']) {
  const d = L[fam], b = bake[fam];
  ok(d.N === b.N && d.value.every((v, i) => Math.abs(v - b.rungs[i].value) < 1e-9), `${fam}: rung values match the bake`);
  ok(d.feature.every((v, i) => Math.abs(v - b.rungs[i].feature) < 1e-9), `${fam}: features match the bake`);
  ok(d.gain_db.every((v, i) => Math.abs(v - b.rungs[i].gain_db) < 1e-9) && d.lufs.every((v, i) => Math.abs(v - b.rungs[i].lufs) < 1e-9), `${fam}: loudness and gains match the bake`);
  // the proposal, recomputed from the splits with corpus_bands.band_for's rule (value < split is the lower band)
  const first = s => d.value.findIndex(v => v >= s - 1e-9);
  ok(JSON.stringify(d.splits.map(first)) === JSON.stringify(d.proposal), `${fam}: proposal ${d.proposal} = first rung at or above each split`);
  // chance, recomputed by enumeration in JS
  let n = 0, n4 = 0, n3 = 0;
  for (let a = 1; a < d.N; a++) for (let b2 = a; b2 < d.N; b2++) for (let c = b2; c < d.N; c++) for (let e = c; e < d.N; e++) {
    n++; const k = agree([a, b2, c, e], d.proposal); if (k === 4) n4++; if (k >= 3) n3++;
  }
  ok(n === d.placements && Math.abs(n4 / n - d.chance4) < 5e-5 && Math.abs(n3 / n - d.chance3) < 5e-5, `${fam}: chance ${n} placements, all four ${(n4 / n).toFixed(4)}, three+ ${(n3 / n).toFixed(4)}`);
  // nulls: the proposal placed by ear must score 4 and "sit"; a fence two rungs off must not count
  ok(agree(d.proposal, d.proposal) === 4 && verdictOf(4).startsWith('the project'), `${fam}: null, the proposal against itself scores 4 of 4`);
  ok(agree(d.proposal.map(x => x + 2), d.proposal) === 0, `${fam}: every fence two rungs high scores 0 (would read 4 if the tolerance leaked)`);
  // the file the piece plays: its length and timing
  const buf = fs.readFileSync(`${mediaDir}/ladder-${fam}-mono.wav`);
  const dataIdx = buf.indexOf('data'), bytes = buf.readUInt32LE(dataIdx + 4), fmt = buf.readUInt16LE(20), ch = buf.readUInt16LE(22), sr = buf.readUInt32LE(24), bits = buf.readUInt16LE(34);
  const frames = bytes / (ch * bits / 8);
  ok(fmt === 3 && ch === 1 && sr === 44100 && bits === 32, `${fam}: mono float32 at 44.1 kHz`);
  ok(Math.abs(frames / 44100 - d.N * d.stride_s) < 1 / 44100 * d.N, `${fam}: ${frames} frames = ${d.N} rungs x ${d.stride_s} s`);
  ok(d.rung_s < d.stride_s, `${fam}: a rung (${d.rung_s} s) ends before the next begins (${d.stride_s} s)`);
  ok(buf.length < 25 * 1024 * 1024, `${fam}: ${(buf.length / 1048576).toFixed(1)} MB, under the public build's 25 MB`);
}
console.log(fail ? `${fail} failed` : 'all passed');
process.exit(fail ? 1 : 0);
