#!/usr/bin/env node
// Synth Templates — rich — check: re-checks what "which knobs are which" claims, on its own engine, in headless Chromium.
//
// usage (from the palace root): node "Projects/Synth Templates/Synth Templates — rich — check.mjs" [--bake <out.json>]
//
//   1. the inlined voice.js and compare.js are the workshop's own, byte for byte (sha256 against workshop/site/)
//   2. the inlined card and vocabulary equal cards/house-bass.yaml and vocabulary.yaml (parsed with the app's js-yaml)
//   3. the piece's engine, run again, gives the baked table: every verdict the same, every number within its grain
//   4. both checks hold on both clips: the untouched sound rendered twice reads kept with every number unchanged; noise reads lost on meter A (meter B's count is printed and held to the baked one)
//   5. the blind trials: no matched clip peaks at or past 0 dBFS (the RMS match itself is printed as an identity: the gain is computed from the RMS it is read against)
//   6. the chance figures the piece states, printed as arithmetic (not a check): P(5 or 6 of 6 at even odds) = 7/64, both arms (7/64)^2
//   7. the offer about playDemo: the site's Play the default, given this card, schedules eight notes 60 ms long, not four 121 ms long
// Exits 1 on any failure. --bake writes the engine's table for the piece's BAKED constant (the maker's step, not a check).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let ROOT = HERE; while (!fs.existsSync(path.join(ROOT, '_ops')) && path.dirname(ROOT) !== ROOT) ROOT = path.dirname(ROOT);
const req = createRequire(path.join(ROOT, '_ops/stigmergy/app/package.json'));
const { chromium } = req('playwright');
const yaml = req('js-yaml');
const PIECE = path.join(HERE, 'Synth Templates — rich — which knobs are which.html');
const W = path.join(HERE, 'workshop');
const args = process.argv.slice(2); const bakeTo = args.includes('--bake') ? args[args.indexOf('--bake') + 1] : null;
let fails = 0; const ok = (cond, what) => { console.log((cond ? 'ok    ' : 'FAIL  ') + what); if (!cond) fails++; };

const html = fs.readFileSync(PIECE, 'utf8'); const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const scripts = [...html.matchAll(/<script>\n([\s\S]*?)\n<\/script>/g)].map(m => m[1]);
const voiceRaw = fs.readFileSync(path.join(W, 'site/voice.js'), 'utf8'), compareRaw = fs.readFileSync(path.join(W, 'site/compare.js'), 'utf8');
ok(scripts[0] === voiceRaw.replace(/\n$/, ''), `inlined voice.js is workshop/site/voice.js (sha256 ${sha(voiceRaw).slice(0, 12)})`);
ok(scripts[1] === compareRaw.replace(/\n$/, ''), `inlined compare.js is workshop/site/compare.js (sha256 ${sha(compareRaw).slice(0, 12)})`);

const browser = await chromium.launch(); const page = await browser.newPage(); const errors = [];
page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(pathToFileURL(PIECE).href);
const card = yaml.load(fs.readFileSync(path.join(W, 'cards/house-bass.yaml'), 'utf8')), vocab = yaml.load(fs.readFileSync(path.join(W, 'vocabulary.yaml'), 'utf8'));
const inl = await page.evaluate(() => ({ card: STPiece.CARD, vocab: STPiece.VOCAB }));
ok(JSON.stringify(inl.card) === JSON.stringify(card), 'inlined card equals cards/house-bass.yaml');
ok(JSON.stringify(inl.vocab) === JSON.stringify(vocab), 'inlined vocabulary equals vocabulary.yaml');

const out = await page.evaluate(async () => {
  const res = await STPiece.measureAll(); const T = STPiece.tally(res);
  // the blind trials' clips, matched as step 5 matches them
  const ref = await STPiece.render(JSON.parse(JSON.stringify(STPiece.CARD)), 'trial'); const match = [];
  for (const id of ['cutoff', 'famount', 'fdecay', 'subeq', 'adecay', 'arel', 'fsusfull', 'saw', 'resnone', 'fatt', 'aatt', 'asus']){
    const m = STPiece.MOVES.find(x => x.id === id); const c = JSON.parse(JSON.stringify(STPiece.CARD)); m.set(c); const r = await STPiece.render(c, 'trial');
    const g = Math.pow(10, (ref.F.rms_dbfs - r.F.rms_dbfs) / 20); const ch = [r.buf.getChannelData(0).map(x => x * g), r.buf.getChannelData(1).map(x => x * g)];
    const tr = SynthCompare.trimLead(ch, -50, 240); const F = SynthCompare.analyse(tr.ch, 48000, null);
    match.push({ id, gain_db: 20 * Math.log10(g), rms: F.rms_dbfs, ref: ref.F.rms_dbfs, peak: F.peak_dbfs }); }
  return { res, T, match };
});
// 7: reproduce readPattern's reading from the voice's own source, with no copy of its logic: run playDemo on a context whose noteOn calls we can see
const demo = await page.evaluate(() => {
  const src = document.querySelectorAll('script')[0].textContent; const calls = [];
  const patched = src.replace('function noteOn(c, midi, vel, id, when){', 'function noteOn(c, midi, vel, id, when){ globalThis.__calls && globalThis.__calls.push({ id, t: when, kind: "on" });')
                     .replace('function noteOff(id, when){', 'function noteOff(id, when){ globalThis.__calls && globalThis.__calls.push({ id, t: when, kind: "off" });');
  globalThis.__calls = calls; const keep = globalThis.SynthVoice; (0, eval)(patched); const V2 = globalThis.SynthVoice; globalThis.SynthVoice = keep;
  V2.setVocab(STPiece.VOCAB); V2.useContext(new OfflineAudioContext(2, 48000, 48000), true);
  V2.playDemo(JSON.parse(JSON.stringify(STPiece.CARD))); globalThis.__calls = null;
  const ons = calls.filter(c => c.kind === 'on'), offs = Object.fromEntries(calls.filter(c => c.kind === 'off').map(c => [c.id, c.t]));
  return ons.map(c => ({ t: c.t - ons[0].t, len: offs[c.id] - c.t }));
});
await browser.close();
ok(errors.length === 0, 'the piece loads with no script error' + (errors.length ? ': ' + errors.join(' | ') : ''));

if (bakeTo){ fs.writeFileSync(bakeTo, JSON.stringify(out.res)); console.log('baked → ' + bakeTo); }
const B = await (async () => { const m = html.match(/const BAKED = (.*);\n/); return m && m[1] !== 'null' ? JSON.parse(m[1]) : null; })();
if (B){
  const grain = (f, v) => f === 'level' ? 0.1 : f === 'bright' ? Math.abs(v) * 0.01 : 0.005; let worst = '';
  let same = true; for (const cl of ['bar', 'held']) for (const [id, r] of Object.entries(out.res.clips[cl].rows)){ const b = B.clips[cl].rows[id];
    if (JSON.stringify(r.A) !== JSON.stringify(b.A) || JSON.stringify(r.B) !== JSON.stringify(b.B)) { same = false; worst += ` ${cl}/${id} verdict`; }
    for (const f of ['level', 'bright', 'rise', 'tail']) if (Math.abs(r.feat[f] - b.feat[f]) > grain(f, b.feat[f])) { same = false; worst += ` ${cl}/${id}/${f}`; } }
  ok(same, 'the engine run again gives the baked table' + worst);
} else ok(!!bakeTo, 'the piece carries a baked table');
for (const cl of ['bar', 'held']){ const k = out.T[cl].checks; ok(k.nullA && k.nullB, `${cl}: the untouched sound rendered twice reads kept, every number unchanged`); ok(k.noiseA, `${cl}: meter A reads noise in place of the square as lost on ${k.noise.A} of ${k.noise.seeds} seeds`);
  console.log(`      ${cl}: meter B reads it lost on ${k.noise.B} of ${k.noise.seeds} seeds; its wave reading: ${[...new Set(k.noise.wave)].join('/')}`);
  if (B) ok(JSON.stringify(B.clips[cl].noise) === JSON.stringify(out.res.clips[cl].noise), `${cl}: the noise control reproduces the baked counts`); }
for (const cl of ['bar', 'held']) for (const k of ['A', 'B']){ const z = out.T[cl][k]; console.log(`      ${cl} · meter ${k}: agrees on ${z.agree} of 16 (taste kept ${z.taste[0]}/${z.taste[1]}, essential lost ${z.ess[0]}/${z.ess[1]})`); }
const fsb = out.res.clips.bar.rows.fsusfull, fsh = out.res.clips.held.rows.fsusfull;
console.log(`      the card's A/B, filter sustain → full: bar A [${fsb.A.join('; ')}] B [${fsb.B.join('; ')}] · held A [${fsh.A.join('; ')}] B [${fsh.B.join('; ')}]`);
console.log(`      filter-sustain reading: bar ${out.res.clips.bar.baseFs} → ${fsb.fs} · held ${out.res.clips.held.baseFs} → ${fsh.fs}`);
const mm = out.match; console.log('id    blind trials, an identity printed for the reader, not a check: the gain is computed from the same RMS it is then read against, so it lands on the untouched RMS by construction (worst ' + Math.max(...mm.map(m => Math.abs(m.rms - m.ref))).toFixed(3) + ' dB; only a re-trim at -50 dBFS can move it)');
ok(mm.every(m => m.peak < 0), 'blind trials: no matched clip peaks past 0 dBFS (fails on any matched peak at or above 0 dBFS; a quiet move raised to match could clip) ; highest ' + Math.max(...mm.map(m => m.peak)).toFixed(2) + ' dBFS; gains ' + mm.map(m => m.id + ' ' + m.gain_db.toFixed(1)).join(', ') + ' dB)');
const C6 = (k) => [1, 6, 15, 20, 15, 6, 1][k]; const p56 = (C6(5) + C6(6)) / 64; console.log(`id    chance, arithmetic printed for the reader, not a check: 5 or 6 of 6 at even odds = ${p56.toFixed(4)} (7/64), both arms ${(p56 * p56).toFixed(4)}`);
const beat = 60 / card.render.tempo;
console.log('      playDemo on this card schedules ' + demo.length + ' notes: ' + demo.map(d => (d.t / beat * 4).toFixed(0) + '/16 ' + Math.round(d.len * 1000) + ' ms').join(', '));
ok(demo.length === 8 && demo.every(d => Math.abs(d.len - beat / 8) < 1e-6), `the offer holds: Play the default plays eight notes ${Math.round(beat / 8 * 1000)} ms long on the off-sixteenths; the card writes four, ${Math.round(beat / 4 * 1000)} ms long, on the off-eighths`);
console.log(fails ? `${fails} failed` : 'all passed'); process.exit(fails ? 1 : 0);
