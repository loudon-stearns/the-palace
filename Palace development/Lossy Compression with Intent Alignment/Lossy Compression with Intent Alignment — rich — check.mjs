// Lossy Compression with Intent Alignment — rich — check.mjs
// born: 2026-11-03 · checks [[Lossy Compression with Intent Alignment]]'s three rich-face pieces: "same bits, two decoders",
// "same bits, two pictures" and "the type and the label"
// forward_vector: I re-run, headless, every claim the three pieces make about their own engines and about the sections they serve:
// that the transforms are what they say and lose nothing; that both decoders read the same bits and never more than the rate allows;
// that the draw's error is twice the average's on the cymbal and the textures, as the theorem says, and that this band can fail;
// that the meter prefers the average and the band levels prefer the draw at every rate; that the loudness match holds; that the
// numbers baked into the pages are the numbers the cores make; and that every link the label piece shows is in the palace, with
// its counts recounted. What a listener hears and what a reader sees I cannot check.
//
//   node "Palace development/Lossy Compression with Intent Alignment/Lossy Compression with Intent Alignment — rich — check.mjs"
//
// It pulls each page's core <script id="…"> out of the HTML, runs it in a Node sandbox, and compares against what is written
// here on its own. PASS/FAIL per claim, INFO for numbers worth reading, DRIFT when the palace's links have moved since the page
// was made (not a failure: the counts are dated). Exits 1 on any FAIL. Reads only; writes nothing.

import { readFileSync, lstatSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = execSync('git rev-parse --show-toplevel', { cwd: HERE }).toString().trim();
const page = (what) => readFileSync(join(HERE, `Lossy Compression with Intent Alignment — rich — ${what}.html`), 'utf8');
const core = (what, id, name) => {
  const m = page(what).match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`));
  if (!m) throw new Error(`no <script id="${id}"> in ${what}`);
  const E = { Math, Float64Array, Float32Array, Int32Array, JSON, Number, String, Object, Array, Set, Map, isFinite, Infinity };
  vm.createContext(E); vm.runInContext(m[1] + `\nthis.${name} = ${name};`, E); return E[name];
};
let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const info = (name, detail) => console.log(`INFO  ${name}  (${detail})`);
const drift = (name, detail) => console.log(`DRIFT ${name}  (${detail})`);
const dB = (v) => 10 * Math.log10(v);

// ── same bits, two decoders ─────────────────────────────────────────────────────────────────────────────
console.log('— same bits, two decoders');
const RD = core('same bits, two decoders', 'rd-core', 'RD');
{
  const x = RD.cymbal(), C = RD.mdct(x);
  let d = 0; for (const f of [0, 7, 141, 281]) { const s = RD.mdctSlow(x, f); for (let k = 0; k < RD.M; k++) d = Math.max(d, Math.abs(s[k] - C[f * RD.M + k])); }
  check('the fast MDCT is the sum written out', d < 1e-9, `largest difference over four frames ${d.toExponential(1)}`);
  const pr = dB(RD.mse(x, RD.imdct(C)) / RD.power(x));
  check('the transform alone loses nothing (wrapped round the loop)', pr < -200, `reconstruction error ${pr.toFixed(0)} dB`);
  check('both sources at −20 LUFS', Math.abs(RD.kLoud(x) + 20) < 0.01 && Math.abs(RD.kLoud(RD.tone()) + 20) < 0.01, `cymbal ${RD.kLoud(x).toFixed(3)}, tone ${RD.kLoud(RD.tone()).toFixed(3)}`);
  for (const b of [1, 3, 8]) { const y = RD.pcm(x, b), L = new Set(Array.from(y, (v) => v.toFixed(9))).size; check(`step 1: ${b} bits a sample is at most 2^${b} values`, L <= (1 << b), `${L} distinct values; rate ${b * 48} kbps`); }
  const htmlSweep = JSON.parse(page('same bits, two decoders').match(/const SWEEP = (\{.*?\});/)[1]);
  const fresh = {};
  for (const name of ['cymbal', 'tone']) {
    const xs = RD[name](), Cs = RD.mdct(xs); fresh[name] = [];
    for (const k of [16, 24, 32, 40, 48, 56, 64, 80, 96, 128]) {
      const r = RD.render(xs, Cs, k); fresh[name].push([k, +r.snrA.toFixed(2), +r.snrB.toFixed(2)]);
      const budget = Math.floor(k * 1000 * RD.M / RD.RATE) * RD.FRAMES;
      if (name === 'cymbal') {
        check(`${name} ${k} kbps: bits spent within the budget, and nearly all of it`, r.bs.bitsUsed <= budget && r.bs.bitsUsed > 0.99 * budget, `${r.bs.bitsUsed} of ${budget}`);
        check(`${name} ${k} kbps: the draw's error is twice the average's (1.9 to 2.1)`, r.ratio > 1.9 && r.ratio < 2.1, `ratio ${r.ratio.toFixed(3)}`);
        check(`${name} ${k} kbps: the meter prefers the average, as decoded and as heard`, r.snrA > r.snrB && r.snrAh > r.snrBh, `as decoded ${r.snrA.toFixed(2)} vs ${r.snrB.toFixed(2)} dB; as heard ${r.snrAh.toFixed(2)} vs ${r.snrBh.toFixed(2)} dB`);
        check(`${name} ${k} kbps: the level gap prefers the draw`, r.gapB < r.gapA && r.gapBh < r.gapAh, `average ${(100 * r.gapA).toFixed(0)} %, draw ${(100 * r.gapB).toFixed(0)} %`);
      } else info(`${name} ${k} kbps`, `SNR average ${r.snrA.toFixed(2)}, draw ${r.snrB.toFixed(2)} dB · ratio ${r.ratio.toFixed(2)} (over 2: a tone is not the noise the draw assumes) · bits ${r.bs.kbpsUsed.toFixed(1)} kbps`);
      if (k === 32 || k === 64 || k === 128) {
        const L0 = RD.kLoud(xs); let pk = 0; for (const v of [...r.ah, ...r.bh]) pk = Math.max(pk, Math.abs(v));
        check(`${name} ${k} kbps: both decodings matched to the original's loudness, and under full scale after the 0.8 master`, Math.abs(RD.kLoud(r.ah) - L0) < 0.05 && Math.abs(RD.kLoud(r.bh) - L0) < 0.05 && pk * 0.8 < 1, `average ${RD.kLoud(r.ah).toFixed(3)}, draw ${RD.kLoud(r.bh).toFixed(3)}, original ${L0.toFixed(3)} LUFS; peak ${(pk * 0.8).toFixed(2)}`);
      }
    }
  }
  check('the error curve baked into the page is the one the core makes', JSON.stringify(fresh) === JSON.stringify(htmlSweep), JSON.stringify(fresh) === JSON.stringify(htmlSweep) ? 'every point to 0.01 dB' : 'differs: re-bake SWEEP');
  // the decoder works out the same allocation as the encoder, from the levels alone
  { const bs = RD.encode(C, 32); let same = true; for (let f = 0; f < RD.FRAMES && same; f++) { const sig2 = new Float64Array(RD.NB); for (let b = 0; b < RD.NB; b++) sig2[b] = RD.levelSig2(bs.lev[f * RD.NB + b]); const al = RD.allocate(sig2, bs.perFrame - RD.NB * 5); for (let b = 0; b < RD.NB && same; b++) for (let j = 0; j < RD.EDGES[b + 1] - RD.EDGES[b]; j++) if (bs.nbits[f * RD.M + RD.EDGES[b] + j] !== al.base[b] + (j < al.extra[b] ? 1 : 0)) same = false; }
    check('the decoder works out the encoder’s allocation from the levels, so it costs no bits', same, 'every frame, every coefficient'); }
  // nulls: the same decoder twice, and a draw from the wrong level. The band 1.9 to 2.1 must be able to fail.
  { const bs = RD.encode(C, 32), a1 = RD.imdct(RD.decode(bs, 'mean')), a2 = RD.imdct(RD.decode(bs, 'mean')), base = RD.mse(x, a1);
    check('null: the average decoded twice is the same signal', RD.mse(a1, a2) === 0, `difference ${RD.mse(a1, a2)}`);
    const CB = RD.decode(bs, 'draw', 9), CA = RD.decode(bs, 'mean'), wrong = CB.map((v, i) => CA[i] + 1.5 * (v - CA[i])), rw = RD.mse(x, RD.imdct(wrong)) / base;
    check('null: a draw spread 1.5 times too wide leaves the band (so the band can fail)', rw > 2.1, `ratio ${rw.toFixed(3)}; failure would have been a ratio inside 1.9 to 2.1`); }
  const sw = fresh.cymbal, a32 = sw.find((p) => p[0] === 32)[1]; let meet = null; for (let i = 1; i < sw.length; i++) if (sw[i - 1][2] < a32 && sw[i][2] >= a32) meet = sw[i - 1][0] + (sw[i][0] - sw[i - 1][0]) * (a32 - sw[i - 1][2]) / (sw[i][2] - sw[i - 1][2]);
  info('the rate the draw needs to match the average’s error at 32 kbps', `${meet.toFixed(1)} kbps, about ${(meet / 32).toFixed(2)} times`);
  const r32 = RD.render(x, C, 32); info('cymbal 32 kbps', `coefficients with no bits ${(100 * r32.zeroShare).toFixed(1)} % · the average sits ${(-20 * Math.log10(r32.ga)).toFixed(2)} dB under the original as decoded · as heard: average ${r32.snrAh.toFixed(2)}, draw ${r32.snrBh.toFixed(2)} dB`);
  check('the blind rule: 7 or 8 of 8 for a named side is 9/256', (8 + 1) / 256 === 9 / 256 && Math.round(256 / 9) === 28, '1 in 28');
}

// ── same bits, two pictures ────────────────────────────────────────────────────────────────────────────
console.log('— same bits, two pictures');
const IM = core('same bits, two pictures', 'im-core', 'IM');
{
  for (let i = 0; i < IM.TEXTURES.length; i++) {
    const t = IM.TEXTURES[i], x = t.make(), C = IM.dct2(x, false), pr = IM.mse(x, IM.dct2(C, true));
    check(`${t.name}: the DCT alone loses nothing`, pr < 1e-18, `error ${pr.toExponential(1)}`);
    for (const bpp of [0.35, 0.5, 1]) {
      const r = IM.render(x, C, bpp), budget = Math.floor(bpp * 256) * (IM.W * IM.H / 256);
      check(`${t.name} ${bpp} bpp: within the budget`, r.bs.bitsUsed <= budget && r.bs.bitsUsed > 0.98 * budget, `${r.bs.bitsUsed} of ${budget}`);
      check(`${t.name} ${bpp} bpp: the meter prefers the average`, r.psnrA > r.psnrB, `PSNR ${r.psnrA.toFixed(2)} vs ${r.psnrB.toFixed(2)} dB`);
      check(`${t.name} ${bpp} bpp: the draw's error near twice the average's (1.6 to 2.3)`, r.ratio > 1.6 && r.ratio < 2.3, `ratio ${r.ratio.toFixed(2)}`);
      const filled = r.bandB.filter((v, b) => Math.abs(v) < 1.5).length, lost = r.bandA.filter((v) => v < -3).length;
      info(`${t.name} ${bpp} bpp`, `draw within 1.5 dB of the original in ${filled} of ${IM.NB} bands · the average more than 3 dB down in ${lost}`);
    }
  }
}

// ── the type and the label ─────────────────────────────────────────────────────────────────────────────
console.log('— the type and the label');
{
  const D = JSON.parse(page('the type and the label').match(/<script id="ld-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  // the count, written here on its own: every entry is a tracked .md outside _ops/ and dot-folders, not a symlink, whose frontmatter has a type
  const require = createRequire(join(ROOT, '_ops/stigmergy/package.json')); const yaml = require('js-yaml');
  const files = execSync('git -c core.quotepath=off ls-files -z -- "*.md"', { cwd: ROOT }).toString().split('\0').filter(Boolean).filter((f) => !f.startsWith('_ops/') && !f.startsWith('.') && !lstatSync(join(ROOT, f)).isSymbolicLink());
  const fms = new Map();
  for (const f of files) { const t = readFileSync(join(ROOT, f), 'utf8'), m = t.match(/^---\n([\s\S]*?)\n---/); if (!m) continue; let fm; try { fm = yaml.load(m[1]); } catch { continue; } if (fm && fm.type) fms.set(basename(f, '.md'), fm); }
  const links = []; for (const [s, fm] of fms) for (const l of (Array.isArray(fm.links) ? fm.links : [])) { if (!l || typeof l.target !== 'string') continue; const t = l.target.replace(/^\[\[|\]\]$/g, '').split('|')[0].split('#')[0]; if (fms.has(t) && t !== s) links.push({ s, t, ty: l.type || null, lb: l.label || null }); }
  const has = (s, t, ty, lb) => links.some((l) => l.s === s && l.t === t && (ty === undefined || l.ty === ty) && (lb === undefined || l.lb === lb));
  const tc = {}; for (const l of links) tc[l.ty] = (tc[l.ty] || 0) + 1;
  const lab = links.filter((l) => l.lb), lc = {}; for (const l of lab) lc[l.lb] = (lc[l.lb] || 0) + 1;
  const now = { N: links.length, labelled: lab.length, distinct: Object.keys(lc).length, once: Object.values(lc).filter((v) => v === 1).length, spawned: tc.spawned, midwifed: links.filter((l) => l.ty === 'spawned' && l.lb === 'midwifed').length };
  const same = Object.keys(now).every((k) => now[k] === D[k]);
  (same ? (n, d) => check(n, true, d) : drift)(`the counts baked in (commit ${D.counted}) are the palace's now`, Object.keys(now).map((k) => `${k} ${D[k]}${now[k] === D[k] ? '' : ' → ' + now[k]}`).join(', '));
  for (const w of D.walk) check(`the walk's link is real: ${w.s} → ${w.ty} · ${w.lb} → ${w.t}`, has(w.s, w.t, w.ty, w.lb), 'found in the frontmatter');
  const rll = readFileSync(join(ROOT, 'Palace development/Resonant Link Labels.md'), 'utf8');
  check('the quoted Origin line is in Resonant Link Labels', rll.includes('It came out of [[Lossy Compression with Intent Alignment]]: links should carry soft labels, not only hard types.'), 'Palace development/Resonant Link Labels.md § Origin');
  const sch = readFileSync(join(ROOT, 'SCHEMA.md'), 'utf8');
  check('the quoted spawned row is SCHEMA’s', sch.includes('| `spawned` | directed A→B | A directly produced B as output | For traceable lineage: this session produced this entry. |'), 'SCHEMA.md, the link-type table');
  let real = 0, dec = 0, leaks = 0, self = 0;
  const words = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9 -]/g, ' ').split(/[\s-]+/).filter((w) => w.length >= 4);
  for (const p of D.pool) { if (has(p.s, p.t, p.ty, p.lb)) real++; dec += p.d.filter((t) => has(p.s, t)).length; const tw = new Set(words(p.t).map((w) => w.slice(0, 5))); if (words(p.lb).some((w) => tw.has(w.slice(0, 5)))) leaks++; if (p.s === 'Lossy Compression with Intent Alignment') self++; }
  check('every link in the rebuild pool is real', real === D.pool.length, `${real} of ${D.pool.length}`);
  check('every decoy is a page the source really links to', dec === 3 * D.pool.length, `${dec} of ${3 * D.pool.length}`);
  check('no pool label spells its target', leaks === 0, `${leaks} share a five-letter stem with the target's title`);
  check('this page’s own links are not in the pool', self === 0, `${self}`);
  check('every pool trial is from a different page', new Set(D.pool.map((p) => p.s)).size === D.pool.length, `${new Set(D.pool.map((p) => p.s)).size} sources`);
  let p5 = 0; const C = (a, b) => { let c = 1; for (let i = 1; i <= b; i++) c = c * (a - b + i) / i; return c; }; for (let k = 5; k <= 8; k++) p5 += C(8, k) * 0.25 ** k * 0.75 ** (8 - k);
  check('the rebuild rule: 5 or more of 8 by guessing is 1789/65536', Math.abs(p5 - 1789 / 65536) < 1e-12 && Math.round(1 / p5) === 37, `${p5.toFixed(4)}, 1 in ${Math.round(1 / p5)}`);
  info('bits', `spawned ${Math.log2(D.N / D.spawned).toFixed(2)}, spawned · midwifed ${Math.log2(D.N / D.midwifed).toFixed(2)}; over labelled links, type ${D.meanBitsType}, type and label ${D.meanBitsBoth}`);
}
console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
