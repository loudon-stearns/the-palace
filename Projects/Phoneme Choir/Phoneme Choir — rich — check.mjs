// title: Phoneme Choir — rich — check
// born: 2026-11-03
// links: [[Phoneme Choir]] (connects-to · rich-face-check) · checks "Phoneme Choir — rich — same word, four voices.html" and "… — the spelling is the prompt.html"
// forward_vector: I run each piece's own engine, pulled out of its page, in Node, over the build's 352 samples and the renders in rich-face/, and hold it to offsets.json, to the SFZ, and to every number the pieces and the section text state. Run me after any change to a piece: node "Projects/Phoneme Choir/Phoneme Choir — rich — check.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const BUILD = path.join(root, '_ops', 'sample-libraries', 'phoneme-choir');
function load(file, blocks, names) {
  const html = fs.readFileSync(path.join(here, file), 'utf8');
  const block = (id) => html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`))[1];
  return new Function(blocks.map(block).join('\n') + `; return { ${names.join(', ')} };`)();
}
const wav = (E, p) => { const b = fs.readFileSync(p); return E.parseWav(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };
let fails = 0;
const ok = (cond, what) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${what}`); if (!cond) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// ---- same word, four voices ----
{
  const A = load('Phoneme Choir — rich — same word, four voices.html', ['bank', 'engine'], ['PAD', 'ALL88', 'parseWav', 'rms5', 'onsetSample', 'offsetSample', 'loudSample', 'measure', 'lagMs', 'spread', 'median']);
  const offsets = JSON.parse(fs.readFileSync(path.join(BUILD, 'offsets.json'), 'utf8'));
  const sfz = fs.readFileSync(path.join(BUILD, 'phoneme_choir.sfz'), 'utf8');
  const regions = [...sfz.matchAll(/sample=samples\/(\S+) lokey=(\d+) .*?lovel=(\d+) .*?offset=(\d+)/g)].map((m) => ({ f: m[1], key: +m[2], lovel: +m[3], off: +m[4] }));
  ok(regions.length === 352, `the SFZ has 352 regions (${regions.length})`);
  const M = new Map();
  let exact = 0, worst = 0, cushion = true, lengths = true;
  for (const r of regions) {
    const { x, sr } = wav(A, path.join(BUILD, 'samples', r.f)), m = A.measure(x, sr), o = offsets[r.f];
    M.set(r.f, { ...m, name: r.f });
    if (m.onset === o.onset_sample && m.offset === o.offset_sample) exact++;
    worst = Math.max(worst, Math.abs(m.onset - o.onset_sample));
    if (o.offset_sample !== o.onset_sample + 24 || r.off !== o.offset_sample) cushion = false;
    if (x.length !== o.total_samples) lengths = false;
  }
  ok(exact >= 347, `the page's onset rule gives offsets.json's onset and offset exactly for ${exact} of 352 files`);
  ok(worst <= 3, `and every other file within ${worst} samples (${(worst / 24).toFixed(3)} ms): the build measured the float render, the page reads the 16-bit WAV`);
  ok(cushion, 'every SFZ offset is offsets.json’s, and every offset is the onset plus 24 samples (1 ms on into the sound)');
  ok(lengths, 'every WAV is as long as offsets.json says');
  const onsMs = regions.map((r) => offsets[r.f].onset_sample / 24);
  ok(Math.round(Math.min(...onsMs)) === 23 && Math.round(Math.max(...onsMs)) === 218 && Math.round(A.median(onsMs)) === 55, `onsets run ${Math.min(...onsMs).toFixed(1)} to ${Math.max(...onsMs).toFixed(1)} ms, median ${A.median(onsMs).toFixed(1)} (the page: 23 to 218, median 55)`);
  const knockIs = offsets['phon_036_knock_bf_isabella.wav'].onset_sample / 24, knockPuck = offsets['phon_036_knock_am_puck.wav'].onset_sample / 24;
  ok(Math.round(knockIs) === 138 && Math.round(knockPuck) === 31, `knock: bf_isabella ${knockIs.toFixed(2)} ms, am_puck ${knockPuck.toFixed(2)} ms (the page: 138 and 31)`);
  // the pad is the SFZ's own mapping, and its knock row is the build's audition
  let padOk = true;
  for (const p of A.PAD) { const L = regions.filter((r) => r.key === p.key).sort((a, b) => a.lovel - b.lovel).map((r) => r.f); if (JSON.stringify(L) !== JSON.stringify(p.files)) padOk = false; }
  ok(padOk, 'the pad’s twelve keys and their four layers are phoneme_choir.sfz’s, key for key and layer for layer');
  const aud = [...fs.readFileSync(path.join(BUILD, 'audition.sfz'), 'utf8').matchAll(/sample=samples\/(\S+)/g)].map((m) => m[1]);
  ok(JSON.stringify(aud) === JSON.stringify(A.PAD.find((p) => p.w === 'knock').files), 'steps 3 and 4 play the four files audition.sfz loaded on G♯3, in its layer order');
  // across all 88 keys: a key's four voices, how far apart they get loud, trim off and on
  const byKey = new Map(); for (const r of regions) { if (!byKey.has(r.key)) byKey.set(r.key, []); byKey.get(r.key).push(M.get(r.f)); }
  const at = (under) => { const off = [], on = [], rows = []; for (const [key, L] of byKey) { const a = L.map((m) => A.lagMs(m, under, false)), b = L.map((m) => A.lagMs(m, under, true)); off.push(A.spread(a)); on.push(A.spread(b)); rows.push({ key, w: L[0].name.split('_')[2], on: b, sOff: A.spread(a), sOn: A.spread(b) }); } return { off: A.median(off), on: A.median(on), rows }; };
  const r10 = at(10), r20 = at(20), r15 = at(15);
  console.log(`     median spread across a key’s four voices: 10 dB ${r10.off.toFixed(1)} → ${r10.on.toFixed(1)} ms · 15 dB ${r15.off.toFixed(1)} → ${r15.on.toFixed(1)} · 20 dB ${r20.off.toFixed(1)} → ${r20.on.toFixed(1)}`);
  ok(near(r10.off, A.ALL88.at10.off, 0.05) && near(r10.on, A.ALL88.at10.on, 0.05), `at 10 dB under: ${r10.off.toFixed(1)} → ${r10.on.toFixed(1)} ms (the piece states ${A.ALL88.at10.off} → ${A.ALL88.at10.on})`);
  ok(near(r20.off, A.ALL88.at20.off, 0.05) && near(r20.on, A.ALL88.at20.on, 0.05), `at 20 dB under: ${r20.off.toFixed(1)} → ${r20.on.toFixed(1)} ms (the piece states ${A.ALL88.at20.off} → ${A.ALL88.at20.on})`);
  const tight = r10.rows.filter((r) => r.sOn <= 10);
  ok(tight.length === A.ALL88.tight10 && tight.some((r) => r.w === 'knock'), `at 10 dB, ${tight.length} keys land within 10 ms with the trim (${tight.map((r) => r.w).join(', ')}), knock among them`);
  const kn = r10.rows.find((r) => r.w === 'knock');
  ok(near(kn.sOff, 110, 1) && near(kn.sOn, 4, 1), `knock at 10 dB: ${kn.sOff.toFixed(1)} ms apart untrimmed, ${kn.sOn.toFixed(1)} trimmed`);
  for (const w of ['slap', 'zoom', 'tap']) { const r = r10.rows.find((q) => q.w === w); ok(r.sOn >= 50 && r.sOn <= 100.5, `${w} at 10 dB, trimmed: ${r.on.map((v) => v.toFixed(0)).join('/')} ms, ${r.sOn.toFixed(1)} apart (the piece: up to 100 ms later in one voice than another)`); }
}

// ---- the spelling is the prompt ----
{
  const B = load('Phoneme Choir — rich — the spelling is the prompt.html', ['engine'], ['parseWav', 'levelDb', 'dips', 'flutter', 'TRILL_RUN', 'withFlutter', 'FLUTTER', 'stressParts', 'vowelCount']);
  const R = JSON.parse(fs.readFileSync(path.join(here, 'rich-face', 'renders.json'), 'utf8'));
  const sp = R.spellings;
  ok(!sp.brrrrahhh.ipa.includes('r') && sp.brrrrahhh.ipa.includes('ɹ'), `brrrrahhh → /${sp.brrrrahhh.ipa}/: the English approximant ɹ only, no trill symbol r`);
  ok(JSON.stringify(B.stressParts(sp.brrrrahhh.ipa)) === JSON.stringify(['b', 'iː', 'ɑːɹɹ', 'ɑːɹɹ', 'ɑːɹɹ', 'ɑː']) && B.vowelCount(sp.brrrrahhh.ipa) === 5, 'split at its stress marks: b · iː · ɑːɹɹ · ɑːɹɹ · ɑːɹɹ · ɑː, five vowels (B, R, R, R, rah)');
  ok(sp.b.ipa === 'bˈiː' && sp.r.ipa === 'ˈɑːɹ', `a letter alone: b → /${sp.b.ipa}/, r → /${sp.r.ipa}/`);
  const six = ['brah', 'vrrrrah', 'rrrrah', 'brrah', 'rraaaaah', 'burrrrrah'];
  const withTrill = six.filter((k) => sp[k].ipa.includes('r'));
  ok(withTrill.length === 1 && withTrill[0] === 'burrrrrah' && (sp.burrrrrah.ipa.match(/r/g) || []).length === 1, `of the six, only burrrrrah’s phonemes carry the trill symbol, once (/${sp.burrrrrah.ipa}/)`);
  ok((sp.ssssss.ipa.match(/ɛs/g) || []).length === 6 && (sp.fffff.ipa.match(/ɛf/g) || []).length === 5, `ssssss → six “ess” (/${sp.ssssss.ipa}/), fffff → five “eff”`);
  ok(sp.ahhh.ipa === 'ˈɑː', `ahhh → /${sp.ahhh.ipa}/: one vowel, not spelled out and not held (uuuuh → /${sp.uuuuh.ipa}/)`);
  const run = (file) => B.flutter(...Object.values(wav(B, path.join(here, 'rich-face', file)))).taps;
  const spellRuns = [], doorRuns = [];
  for (const v of R.voices) {
    for (const k of Object.keys(sp)) if (sp[k].files[v]) spellRuns.push({ k, v, t: run(sp[k].files[v]) });
    for (const d of Object.keys(R.phonemes)) doorRuns.push({ d, v, t: run(R.phonemes[d].files[v]) });
  }
  console.log('     runs, spellings: ' + spellRuns.map((r) => `${r.k}/${r.v} ${r.t}`).join(' · '));
  console.log('     runs, phonemes:  ' + doorRuns.map((r) => `${r.d}/${r.v} ${r.t}`).join(' · '));
  ok(spellRuns.every((r) => r.t < B.TRILL_RUN), `no spelling render reaches a run of ${B.TRILL_RUN} (longest ${Math.max(...spellRuns.map((r) => r.t))})`);
  ok(doorRuns.every((r) => r.t < 2), `no phoneme render reaches even two dips in a row (longest ${Math.max(...doorRuns.map((r) => r.t))})`);
  const chance = Math.max(...spellRuns.filter((r) => r.k === 'ssssss').map((r) => r.t));
  ok(chance === 2, `ssssss, with no r in it, makes ${chance} in a row: two can come by chance`);
  for (const v of R.voices) {
    const { x, sr } = wav(B, path.join(here, 'rich-face', sp.brah.files[v]));
    const f = (rate) => B.flutter(B.withFlutter(x, sr, rate, B.FLUTTER.depth, B.FLUTTER.t0, B.FLUTTER.t1), sr);
    const r = [10, 25, 28, 32].map(f);
    ok(r[2].taps >= 5 && near(r[2].rate, 28, 2), `${v}: the modelled flutter at 28 a second reads ${r[2].taps} dips in a row at ${r[2].rate.toFixed(1)} a second`);
    ok(r[1].taps >= B.TRILL_RUN && r[3].taps >= B.TRILL_RUN, `${v}: at 25 and 32 a second it reads ${r[1].taps} and ${r[3].taps}`);
    ok(r[0].taps < B.TRILL_RUN, `${v}: at 10 a second, a wobble, it reads ${r[0].taps}: not a flutter`);
    ok(f(4).taps < B.TRILL_RUN, `${v}: brah as spoken and at 4 a second read under ${B.TRILL_RUN}`);
  }
}

console.log(fails ? `\n${fails} failed` : '\nall pass');
process.exit(fails ? 1 : 0);
