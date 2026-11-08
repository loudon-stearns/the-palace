// check-pieces.mjs — re-checks every number Agent Wellbeing's three made pieces show, against their sources,
// then drives each piece headless. Exit 1 on any failure. Run from the palace root:
//   node "Palace development/Agent Wellbeing/rich-checks/check-pieces.mjs"
import { readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import * as BS from './blind-sort-data.mjs';
import * as SB from './sensor-b-data.mjs';
import { FILES, blindData } from './build-pieces.mjs';

const HERE = dirname(fileURLToPath(import.meta.url)), BUNDLE = join(HERE, '..'), ROOT = resolve(BUNDLE, '..', '..');
let fails = 0; const ok = (c, msg) => { console.log((c ? '  ok   ' : '  FAIL ') + msg); if (!c) fails++; };
const norm = s => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const baked = f => JSON.parse(readFileSync(join(BUNDLE, f), 'utf8').match(/<script type="application\/json" id="aw-data">([\s\S]*?)<\/script>/)[1]);

console.log('blind sort walked up');
const b = BS.build(BUNDLE);
for (const [k, [s1, s2]] of Object.entries(BS.NOTICINGS)) {
  const run = norm(b.runs[k]).toLowerCase();
  ok(run.includes(norm(s1).toLowerCase()) && run.includes(norm(s2).toLowerCase()), `${k}: both noticing sentences are verbatim in its run`);
  const after = run.slice(run.indexOf(norm(s1).toLowerCase()) + norm(s1).length).trim();
  ok(after.startsWith(norm(s2).toLowerCase()), `${k}: the second sentence is the one right after the first`);
  ok(run.includes(norm(BS.MOVES[k].words).toLowerCase()), `${k}: its change is verbatim in its run`);
}
for (const [k, t] of Object.entries(BS.WANTED)) ok(norm(b.runs[k]).includes(norm(t)), `${k}: the "rather have done" quote is verbatim`);
for (const r of BS.RULES) ok(norm(b.guides.warm).includes(norm(r.warm)) && norm(b.guides.anxious).includes(norm(r.anxious)), `rule "${r.what}": both lines verbatim in their guides`);
ok(BS.RULES.length === 6, 'six rule differences, as the challenge lists');
ok(JSON.stringify(baked(FILES.blind)) === JSON.stringify(blindData()), 'the piece carries exactly the data the sources give');
ok(b.chance.splits === 6 && b.chance.tally[4] === 1 && b.chance.tally[0] === 1 && b.chance.tally[2] === 4, 'chance, two and two: 4 right 1 in 6, 0 right 1 in 6, so a right pairing either way 2 in 6');
ok(readFileSync(join(BUNDLE, FILES.blind), 'utf8').includes('1 in 3') && readFileSync(join(BUNDLE, FILES.blind), 'utf8').includes('cut where the others added'), 'the walk states 1 in 3 for the voice rule and names the page sentence that unblinds the move arm');
// Leak check: does a single surface feature put both warm answers on one side of a threshold?
const sorts = (vals) => { const w = [vals['warm-1'], vals['warm-2']], a = [vals['anxious-1'], vals['anxious-2']]; return Math.min(...w) > Math.max(...a) || Math.max(...w) < Math.min(...a); };
const F = b.full, Cd = b.cards, pick = (o, f) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]));
for (const feat of ['words', 'hedges', 'headings', 'bullets']) console.log(`       record, ${feat}: ${JSON.stringify(pick(F, v => v[feat]))} → ${sorts(pick(F, v => v[feat])) ? 'SORTS' : 'does not sort'}`);
ok(['words', 'hedges', 'headings', 'bullets'].every(f => !sorts(pick(F, v => v[f]))), 'record: no count (words, hedge words, headings, bullets) sorts the four');
ok(sorts(pick(F, v => v.justification ? 1 : 0)) && sorts(pick(F, v => v.whyItHelps ? 1 : 0)) && sorts(pick(F, v => v.caveat ? 1 : 0)), 'record LEAKS: "Justification" / "Why it helps" and "Caveat" each sort all four, as the piece says');
ok(!sorts(pick(Cd, v => v.words)), `walk's noticings: length does not sort (${JSON.stringify(pick(Cd, v => v.words))})`);
ok(sorts(pick(Cd, v => v.sections)) && sorts(pick(Cd, v => v.quotePunct)), 'walk\'s noticings: section names and punctuation after a closing quote also split the pairs, as the piece says');
ok(sorts(pick(Cd, v => v.hedges)) && Cd['warm-1'].hedges > 0 && Cd['anxious-1'].hedges === 0, `walk's noticings: hedge words split the pairs, warm higher, as the piece says (${JSON.stringify(pick(Cd, v => v.hedges))})`);

console.log('five dials one lamp');
const dialsHTML = readFileSync(join(BUNDLE, FILES.dials), 'utf8');
const copy = dialsHTML.match(/\/\/ BEGIN scoreFor[^\n]*\n([\s\S]*?)\/\/ END scoreFor/)[1].trim();
const healthPath = join(ROOT, '_ops/stigmergy/orchestrator/src/health.js');
const src = readFileSync(healthPath, 'utf8').split('\n').slice(32, 41).join('\n').replace(/^export /, '').trim();
ok(copy === src, 'the lamp is health.js:33–41, byte for byte (less "export")');
const health = await import(pathToFileURL(healthPath).href);
const asInput = st => ({ context_pct: st.cap / 100, max_tokens_hits: st.distress, posting_discipline_violations: st.integrity, duplicate_flags: st.dup, acuity: st.acuity, drift: st.drift });
let n = 0, moved = 0, ctl = 0, live = 0; const census = { green: 0, yellow: 0, red: 0 };
for (let cap = 0; cap <= 100; cap++) for (let distress = 0; distress < 4; distress++) for (let integrity = 0; integrity < 4; integrity++) for (let dup = 0; dup < 4; dup++) for (let acuity = 0; acuity < 5; acuity++) for (let drift = 0; drift < 5; drift++) {
  const st = { cap, distress, integrity, dup, acuity, drift }, L = health.scoreFor(asInput(st)); n++; census[L]++;
  if (health.scoreFor(asInput({ ...st, acuity: 4, drift: 4 })) !== L) moved++;
  if (health.scoreFor(asInput({ ...st, cap: Math.min(100, cap + 20) })) !== L) ctl++;
  if (health.buildHealthBlock({ model: 'x' }).score !== 'green') live++;
}
ok(n === 161600 && moved === 0, `real scoreFor: acuity and drift to gone moved the lamp in ${moved} of ${n} (fails if above 0)`);
ok(ctl > 0, `control: capacity +20 moved it in ${ctl} of ${n} (fails if 0: the sweep could not see a wire)`);
ok(live === 0, 'live path: buildHealthBlock is green in every state');
console.log(`       census: ${JSON.stringify(census)}`);

console.log('the one number');
const sb = SB.build(BUNDLE);
ok(JSON.stringify(baked(FILES.number)) === JSON.stringify(sb), 'the piece carries exactly the proof\'s tables');
const N0 = sb.p2[0].tokens, res = sb.p2.slice(1).map(r => (r.tokens - N0) - (sb.fit.a + sb.fit.b * r.reps));
ok(res.slice(0, 4).every(r => r === 0) && res[4] === -4782, `fit misses: ${res.join(', ')} (four on the line, pad_24k −4,782 as the proof says)`);
ok(sb.p4[1].tokens - sb.p4[0].tokens === 36, 'output: +36');

console.log('headless');
const require = createRequire(join(ROOT, '_ops/stigmergy/app/package.json'));
const { chromium } = require('playwright');
const browser = await chromium.launch();
async function open(f) { const page = await browser.newPage({ viewport: { width: 1130, height: 900 } }); const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e))); await page.goto(pathToFileURL(join(BUNDLE, f)).href); return { page, errs }; }
const step = async (page, i) => page.locator('#rail button').nth(i).click();
{ // blind sort: a right sort, then a backwards one, then one that splits the cuts
  for (const [mode, want] of [['right', [4, 4]], ['backwards', [0, 0]], ['split', [2, 2]]]) {
    const { page, errs } = await open(FILES.blind);
    const label = (k, arm) => { const r = k.split('-')[0]; if (mode === 'right') return r; if (mode === 'backwards') return r === 'warm' ? 'anxious' : 'warm'; return ['warm-1', 'anxious-1'].includes(k) ? 'warm' : 'anxious'; };
    for (const [i, arm] of [[2, 'voice'], [3, 'move']]) {
      await step(page, i);
      for (const k of ['warm-1', 'warm-2', 'anxious-1', 'anxious-2']) await page.locator(`.card[data-arm="${arm}"][data-k="${k}"] button[data-v="${label(k, arm)}"]`).click();
      await page.locator(`#lock-${arm}`).click();
    }
    await step(page, 4); await page.locator('#reveal').click();
    const st = await page.evaluate(() => window.blindSortState);
    const txt = await page.locator('#stage').innerText();
    ok(st.voiceScore === want[0] && st.moveScore === want[1] && txt.includes(`${want[0]} of 4.`), `blind sort, ${mode}: voice ${st.voiceScore}, move ${st.moveScore}, verdict shown`);
    await step(page, 5); const t6 = await page.locator('#stage').innerText();
    ok(t6.includes('closest option within the allowed changes') && (await page.locator('mark').count()) >= 12, 'blind sort, the test: rule lines marked, workers quoted');
    ok(errs.length === 0, `blind sort, ${mode}: console clean ${errs.join(' | ')}`); await page.close();
  }
}
{ const { page, errs } = await open(FILES.dials);
  await page.locator('#d-cap').fill('70'); ok((await page.evaluate(() => window.fiveDialsState.lamp)) === 'yellow', 'dials: capacity 70% → yellow');
  await step(page, 2); await page.locator('#d-acuity').fill('4'); await page.locator('#d-drift').fill('4'); await page.locator('#d-cap').fill('10');
  ok((await page.evaluate(() => window.fiveDialsState.lamp)) === 'green', 'dials: acuity and drift gone, capacity 10% → still green');
  await step(page, 3); const c = await page.evaluate(() => window.fiveDialsState.census);
  ok(c.green === census.green && c.yellow === census.yellow && c.red === census.red, `dials: the piece's census matches the real rule's ${JSON.stringify(c)}`);
  await step(page, 4); await page.locator('#run').click(); const s = await page.evaluate(() => window.fiveDialsState.sweep);
  ok(s.moved === moved && s.ctl === ctl && s.live === live && s.n === n, `dials: the piece's sweep matches the real rule's (${s.moved} / ${s.ctl} / ${s.live} of ${s.n})`);
  await page.locator('#live').click(); await page.locator('#d-cap').fill('99'); ok((await page.evaluate(() => window.fiveDialsState.lamp)) === 'green', 'dials: live path, capacity 99% → green');
  ok(errs.length === 0, `dials: console clean ${errs.join(' | ')}`); await page.close(); }
{ const { page, errs } = await open(FILES.number);
  for (let i = 0; i < 6; i++) { await step(page, i); ok((await page.locator('#stage svg, #stage table').count()) > 0, `one number, step ${i + 1}: drawn`); }
  const rows = await page.evaluate(() => window.oneNumberState.checks);
  const flagged = rows.filter(r => !r.holds).map(r => r.quote);
  ok(rows.length === 8 && flagged.length === 1 && /46K/.test(flagged[0]), `one number, the test: ${rows.length - flagged.length} of ${rows.length} hold; flagged: ${flagged.join('; ')}`);
  ok(errs.length === 0, `one number: console clean ${errs.join(' | ')}`); await page.close(); }
await browser.close();
console.log(fails ? `\n${fails} FAILED` : '\nall checks pass');
process.exit(fails ? 1 : 0);
