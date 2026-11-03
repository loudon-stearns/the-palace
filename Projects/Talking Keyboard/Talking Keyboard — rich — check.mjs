// title: Talking Keyboard — rich — check
// born: 2026-11-03
// links: [[Talking Keyboard]] (connects-to · rich-face-workshop) · checks the three pieces listed in [[Talking Keyboard — rich.json]]
// forward_vector: I run each piece's own engine, pulled out of its page, in Node against the files it plays and the record
//   the renders left, and I hold every number a piece states to what I find. Run from the palace root:
//     node "Projects/Talking Keyboard/Talking Keyboard — rich — check.mjs"
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const BUILD = join(ROOT, '_ops/sample-libraries/talking-keyboard');
const R = JSON.parse(readFileSync(join(HERE, 'rich-face/renders.json'), 'utf8'));
let fails = 0, passes = 0;
const ok = (cond, what) => { if (cond) passes++; else fails++; console.log(`${cond ? 'ok  ' : 'FAIL'}  ${what}`); };

function engine(file, names) {
  const html = readFileSync(join(HERE, file), 'utf8');
  const src = html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
  return new Function(`${src}; return { ${names.join(', ')} };`)();
}
const wav = (E, p) => { const b = readFileSync(p); return E.parseWav(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };
const sameSamples = (a, b) => a.x.length === b.x.length && a.x.every((v, i) => v === b.x[i]);

// ---- three spellings of A ----
{
  console.log('\nthree spellings of A');
  const E = engine('Talking Keyboard — rich — three spellings of A.html', ['parseWav', 'vowelPath', 'readVowel']);
  const read = (p) => { const w = wav(E, p); return E.readVowel(E.vowelPath(w.x, w.sr)); };
  const truth = { A: 'uh', ay: 'eye', eigh: 'ay' };
  for (const v of R.voices) for (const k of Object.keys(truth)) { const r = read(join(HERE, 'rich-face', R.lesson[k].files[v])); ok(r.heard === truth[k], `meter reads “${R.lesson[k].text}” in ${v} as ${truth[k]} (got ${r.heard}; ${r.ms} ms, F2 ${r.f2a}→${r.f2b})`); }
  for (const l of [1, 2, 3, 4]) { const r = read(join(BUILD, `samples/kokoro_A4_v${l}.wav`)); ok(r.heard === 'ay', `meter reads the shipped kokoro_A4_v${l}.wav as ay (got ${r.heard})`); }
  for (const k of ['ate', 'ace', 'A-dot']) { const r = read(join(HERE, 'rich-face', R.audition[k].files.af_heart)); ok(r.heard === 'ay', `meter reads audition “${R.audition[k].text}” as ay (got ${r.heard})`); }
  const ay = wav(E, join(HERE, 'rich-face', R.lesson.ay.files.af_heart));
  for (const k of ['aye', 'ey']) ok(sameSamples(ay, wav(E, join(HERE, 'rich-face', R.audition[k].files.af_heart))), `“${k} four” is “ay four”, sample for sample`);
  ok(!sameSamples(ay, wav(E, join(HERE, 'rich-face', R.audition.ate.files.af_heart))), '“ate four” is not');
  const strict = (ipa) => ipa.split(' ')[0] === R.probe.A, seven = { ...R.audition, ay: R.lesson.ay, eigh: R.lesson.eigh };
  const passing = Object.keys(seven).filter((k) => strict(seven[k].ipa));
  ok(passing.length === 1 && passing[0] === 'eigh' && !strict(R.lesson.A.ipa), `strict check (A word exactly ${R.probe.A}) passes ${passing.join(', ')} of the seven, and not the spec’s A`);
  const html = readFileSync(join(HERE, 'Talking Keyboard — rich — three spellings of A.html'), 'utf8');
  ok(!/could not have done is pick/.test(html) && /passes eigh alone/.test(html), 'the found text says the strict check picks eigh, not that it could not choose');
  ok(/^ɐ /.test(R.lesson.A.ipa) && /^ˈaɪ /.test(R.lesson.ay.ipa) && /^ˈeɪ /.test(R.lesson.eigh.ipa), `front end: A → ${R.lesson.A.ipa}, ay → ${R.lesson.ay.ipa}, eigh → ${R.lesson.eigh.ipa}`);
  ok(R.probe.A === 'ˈeɪ', `front end on “A” alone: ${R.probe.A}`);
  ok(['ate', 'ace', 'A-dot'].every((k) => /ˈeɪ/.test(R.audition[k].ipa)) && ['aye', 'ey'].every((k) => R.audition[k].ipa === R.lesson.ay.ipa), 'four audition rows reach eɪ; aye and ey write the same phonemes as ay');
  const V = R.verify;
  ok(V && V.files === 352 && V.rows.every((r) => r.same_length) && V.worst_lsb <= 2, `all ${V?.files} shipped files re-render from generate.py’s text, same length, worst ${V?.worst_lsb} sixteen-bit steps (the pieces say within 2)`);
  const aRows = V.rows.filter((r) => /^As?\d$/.test(r.stem));
  ok(aRows.length === 64 && aRows.every((r) => /^ˈeɪ /.test(r.ipa)), `all ${aRows.length} A and A# files are handed /ˈeɪ/`);
  ok(V.rows.every((r) => !r.ipa.includes('ɐ')), 'no shipped file is handed the article ɐ');
}

// ---- 88 keys ----
{
  console.log('\n88 keys');
  const E = engine('Talking Keyboard — rich — 88 keys.html', ['parseSfz', 'regionFor', 'stemOf', 'layerOf', 'velGain', 'BUGS', 'plant', 'expectedPresses', 'LOW', 'HIGH', 'N', 'layerOfVel']);
  const text = readFileSync(join(BUILD, 'talking_keyboard.sfz'), 'utf8'), map = E.parseSfz(text);
  ok(map.regions.length === 352, `the SFZ has ${map.regions.length} regions`);
  ok(map.regions.every((r) => r.lokey === r.hikey && r.hikey === r.pitch_keycenter), 'every region is one key, with pitch_keycenter on that key: nothing is retuned');
  ok(map.regions.every((r) => r.sample === `samples/kokoro_${E.stemOf(r.lokey)}_v${E.layerOf(r)}.wav`), 'every region’s file names its own key, by generate.py’s naming');
  ok(map.regions.every((r) => existsSync(join(BUILD, r.sample))), 'every file a region names exists');
  let tiles = true, layersOk = true;
  for (let k = E.LOW; k <= E.HIGH; k++) for (let v = 1; v <= 127; v++) {
    const hits = map.regions.filter((r) => k >= r.lokey && k <= r.hikey && v >= r.lovel && v <= r.hivel);
    if (hits.length !== 1) tiles = false; else if (E.layerOf(hits[0]) !== E.layerOfVel(v)) layersOk = false;
  }
  ok(tiles, 'every key and velocity 1 to 127 reaches exactly one region');
  ok(layersOk, 'the page’s velocity layers (1–32, 33–64, 65–96, 97–127) are the SFZ’s');
  ok(map.group.ampeg_release === '0.05' && !/loop_mode/.test(text), `the group fades ${map.group.ampeg_release} s after key up and no loop_mode is set (so no_loop: a tap cuts the word)`);
  ok(Math.abs(20 * Math.log10(E.velGain(127))) < 1e-9 && Math.abs(20 * Math.log10(E.velGain(16)) - 40 * Math.log10(16 / 127)) < 1e-9, 'velocity gain is 20·log10((v/127)²) dB');
  // the bugs: the keys each one touches
  let seed = 7; const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (const kind of Object.keys(E.BUGS)) {
    const b = E.plant(kind, rand); let touched = 0, inRange = true;
    for (let k = E.LOW; k <= E.HIGH; k++) { let any = false; for (const v of [16, 48, 80, 112]) { const [k2, v2] = E.BUGS[kind].map(k, v, b); if (k2 < E.LOW || k2 > E.HIGH) inRange = false; if (E.regionFor(map, k2, v2) !== E.regionFor(map, k, v)) any = true; } if (any) touched++; }
    ok(inRange && touched === E.BUGS[kind].touches(), `${E.BUGS[kind].name}: touches ${touched} keys (the page says ${E.BUGS[kind].touches()}), stays on the keyboard`);
  }
  ok('none' in E.BUGS && Object.keys(E.BUGS).length === 5, 'a clean map is one of five plants, so a swap cannot be named by elimination');
  // E[presses] = (N+1)/(k+1), by simulation: distinct keys in a random order
  for (const k of [2, 88]) {
    let sum = 0; const T = 200000;
    for (let t = 0; t < T; t++) { const keys = Array.from({ length: E.N }, (_, i) => i); for (let i = keys.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [keys[i], keys[j]] = [keys[j], keys[i]]; } sum += keys.findIndex((x) => x < k) + 1; }
    const sim = sum / T; ok(Math.abs(sim - E.expectedPresses(k)) / E.expectedPresses(k) < 0.01, `k = ${k}: (N+1)/(k+1) = ${E.expectedPresses(k).toFixed(2)}, simulated ${sim.toFixed(2)}`);
  }
}

// ---- the next variant ----
{
  console.log('\nthe next variant');
  const E = engine('Talking Keyboard — rich — the next variant.html', ['parseWav', 'meantOk', 'voicePitch', 'keyHz', 'retune']);
  const count = (vk, lang) => R.variants[vk].keys.filter((k, i) => E.meantOk(k.ipa, lang, i)).length;
  ok(count('solfege', 'en') === 1 && E.meantOk(R.variants.solfege.keys[3].ipa, 'en', 3), `solfège as written: ${count('solfege', 'en')} of 7 the syllable meant (only fa): ${R.variants.solfege.keys.map((k) => k.ipa.split(' ')[0]).join(' ')}`);
  ok(count('respelt', 'en') === 7, `respelt: ${count('respelt', 'en')} of 7`);
  ok(count('italian', 'it') === 7, `Italian “do quattro”: ${count('italian', 'it')} of 7 (the page says all seven)`);
  ok(count('french', 'fr') === 6 && !E.meantOk(R.variants.french.keys[0].ipa, 'fr', 0) && R.variants.french.keys[0].ipa.includes('(en)'), `French “do quatre”: ${count('french', 'fr')} of 7; C is handed ${R.variants.french.keys[0].ipa}`);
  const lens = R.variants.french.keys.map((k) => { const w = wav(E, join(HERE, 'rich-face', k.file)); return Math.round(w.x.length / w.sr * 1000); });
  ok(lens[0] > Math.max(...lens.slice(1)) + 200, `French C runs ${lens[0]} ms, the other six ${Math.min(...lens.slice(1))} to ${Math.max(...lens.slice(1))} ms`);
  for (const l of [1, 2, 3, 4]) {
    const ps = [1, 2, 3, 4, 5, 6, 7].map((o) => { const w = wav(E, join(BUILD, `samples/kokoro_C${o}_v${l}.wav`)); return E.voicePitch(w.x, w.sr); });
    const lo = Math.min(...ps), hi = Math.max(...ps);
    ok(hi / lo < 1.3 && E.keyHz(96) / E.keyHz(24) === 64, `layer ${l}: the voice speaks at ${lo} to ${hi} Hz across C1 to C7 (×${(hi / lo).toFixed(2)}) while the keys span ×64`);
  }
  ok(E.retune(24) === 1 / 8 && E.retune(96) === 8 && E.retune(60) === 1, 'the retuned arm plays C1 at 1/8 speed, C4 as rendered, C7 at 8×');
  { const html = readFileSync(join(HERE, 'Talking Keyboard — rich — the next variant.html'), 'utf8'); ok(!/total, not partial/.test(html) && /demonstration/.test(html) && /letter still checks/.test(html), 'step 4 calls the pitch-class arm a demonstration and says the letter still checks'); }
  ok(Math.abs(E.keyHz(24) - 32.7) < 0.05 && Math.abs(E.keyHz(96) - 2093) < 0.5, `C1 = ${E.keyHz(24).toFixed(2)} Hz, C7 = ${E.keyHz(96).toFixed(1)} Hz`);
}

console.log(`\n${passes} ok, ${fails} failed`);
process.exit(fails ? 1 : 0);
