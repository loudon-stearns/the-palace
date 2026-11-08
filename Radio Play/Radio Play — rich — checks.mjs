// title: Radio Play — rich — checks (the pieces' engines, headless)
// born: 2026-11-03
// parent: [[Radio Play]] · rich face, proposal round 2026-11
// forward_vector: I open both made pieces in headless Chromium, on their own stems, and check that what
//   they compute agrees with what "Radio Play — rich — checks.py" measured on its own: the blind pair
//   differs only by its held beat, a laugh under the punchline buries it by the same decibels, the bed
//   meters the same distance under the voices, the plan's times are build_audio.py's, and the film's
//   numbers the picture piece prints are the measured ones.
// Run: node "Radio Play/Radio Play — rich — checks.mjs"   (exit 1 on any failed check)
import { createServer } from 'node:http';
import { readFileSync, statSync, createReadStream } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findChromium } from '../_ops/rich-face/conform.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const M = JSON.parse(readFileSync(join(HERE, 'Radio Play — rich — checks.json'), 'utf8'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.wav': 'audio/wav', '.mp4': 'video/mp4', '.m4a': 'audio/mp4', '.json': 'application/json' };

const server = createServer((req, res) => {
  const p = join(HERE, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(HERE)) { res.writeHead(403); return res.end(); }
  let st; try { st = statSync(p); } catch { res.writeHead(404); return res.end(); }
  const type = TYPES[extname(p)] || 'application/octet-stream', range = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
  if (range) { const a = +range[1], b = range[2] ? +range[2] : st.size - 1;
    res.writeHead(206, { 'content-type': type, 'content-range': `bytes ${a}-${b}/${st.size}`, 'accept-ranges': 'bytes', 'content-length': b - a + 1 }); return createReadStream(p, { start: a, end: b }).pipe(res); }
  res.writeHead(200, { 'content-type': type, 'content-length': st.size, 'accept-ranges': 'bytes' }); createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

const { chromium, why } = findChromium();
if (!chromium) { console.error('no Chromium:', why); process.exit(2); }
const browser = await chromium.launch();
const results = []; let failed = 0;
const check = (name, ok, got) => { results.push({ name, ok, got }); if (!ok) failed++; console.log((ok ? 'ok   ' : 'FAIL ') + name + '  ' + JSON.stringify(got)); };

async function open(file) {
  const page = await browser.newPage(); const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); }); page.on('pageerror', e => errors.push(String(e)));
  await page.goto(base + encodeURIComponent(file)); await page.waitForFunction(() => window.__rp, null, { timeout: 30000 });
  return { page, errors };
}

// ── timing is the performance
{
  const { page, errors } = await open('Radio Play — rich — timing is the performance.html');
  for (let n = 1; n <= 5; n++) await page.evaluate(n => window.__rp.goTo(n), n);
  const pair = await page.evaluate(() => window.__rp.S.pair.check);
  check('blind pair: the three turns that stay are the same samples in A and B', pair.maxHead === 0, pair.maxHead);
  check('blind pair: the punchline and laugh that move are the same samples, moved', pair.maxTail === 0 && Math.abs(pair.lagMs) < 1e-6, pair);
  const shop = await page.evaluate(() => window.__rp.SHOP);
  check('blind pair: they differ by the held beat less the rushed one', Math.abs(pair.diffMs - (shop.gaps[2] - 0.1) * 1000) < 0.05, pair.diffMs);
  const sp = await page.evaluate(() => window.__rp.SPEECH);
  const worst = Math.max(...Object.entries(M.takes).filter(([n]) => sp[n]).map(([n, t]) => Math.max(Math.abs(sp[n].on - t.first_word_s), Math.abs(sp[n].off - t.last_word_end_s)) * 1000));
  check('where the words are in each take: piece vs checks.py, within 3 ms', worst < 3, +worst.toFixed(2) + ' ms worst');
  const H = M.heard, hw = Math.max(Math.abs(shop.beat - H.s1_beat.heard_s[0]), ...shop.gaps.map((g, i) => Math.abs(g - H.s4_exchange.heard_s[i])), Math.abs(shop.laughAfter - H.s4_laugh_after_last_word_s)) * 1000;
  check('the Shop\'s cut as heard: piece vs checks.py, within 5 ms', hw < 5, { beat: +shop.beat.toFixed(3), gaps: shop.gaps.map(g => +g.toFixed(3)), laugh: +shop.laughAfter.toFixed(3), worst_ms: +hw.toFixed(2) });
  check('blind pair: no render clips', pair.peak < 1, pair.peak);
  const under = await page.evaluate(() => { const R = window.__rp, n = R.BUF[R.T.f2.file].length; return R.powDb('f2', R.V_VO, 0, n) - R.powDb('laugh', R.V_LAUGH, 0, n); });
  check('laugh under the punchline, stereo as the Shop mixed it: whole take, piece vs checks.py', Math.abs(under - M.laugh.under.voice_over_laugh_db) < 0.15, { piece: +under.toFixed(2), python: M.laugh.under.voice_over_laugh_db });
  const step4 = await page.evaluate(() => { const R = window.__rp; R.S.laugh = R.on('f2') - R.off('f2'); R.goTo(3); R.goTo(4); return document.querySelector('.rp-read').textContent; });
  const shown = parseFloat((/the line is ([+\-−]?[\d.]+) dB/.exec(step4) || [])[1]);
  check('step 4, laughter laid on the first word: the dB it shows vs checks.py', Math.abs(shown - M.laugh.under.spoken_voice_over_laugh_db) < 0.15, { shown, python: M.laugh.under.spoken_voice_over_laugh_db, text: step4.slice(0, 160) });
  const peaks = await page.evaluate(() => { const R = window.__rp; let m = 0; for (const p of [0, 0.5, 1, 2, 3]) { const r = R.render(R.exchange(R.SHOP.gaps.map(g => g * p), -1.8)); m = Math.max(m, r.x.reduce((a, v) => Math.max(a, Math.abs(v)), 0)); } return m; });
  check('the exchange never clips, laugh under or not', peaks < 1, peaks);
  check('no console errors', errors.length === 0, errors);
  await page.close();
}

// ── audio first, picture last
{
  const { page, errors } = await open('Radio Play — rich — audio first, picture last.html');
  const onsets = await page.evaluate(() => window.__rp.PLAN.ev.filter(e => e.lane === 'voice').map(e => e.at));
  check('the plan\'s line times are build_audio.py\'s', onsets.every((t, i) => Math.abs(t - M.s2.line_onsets_s[i]) < 0.002), onsets.map(t => +t.toFixed(3)));
  for (let n = 1; n <= 3; n++) await page.evaluate(n => window.__rp.goTo(n), n);
  const meter = await page.evaluate(() => window.__rp.S.meter);
  check('balance: the bed under the voices, piece meter vs the Shop\'s own ffmpeg chain', Math.abs(meter.gap - M.s2_balance.bed_under_voice_lu) < 0.3, { piece: +meter.gap.toFixed(2), shop_chain: M.s2_balance.bed_under_voice_lu });
  const master = 20 * Math.log10(1.6);
  check('balance: the voices\' loudness, piece meter vs ffmpeg (after the piece\'s master gain)', Math.abs(meter.lv - (M.s2_balance.chain_voice_lufs + master)) < 0.3, { piece: +meter.lv.toFixed(2), shop_chain_plus_master: +(M.s2_balance.chain_voice_lufs + master).toFixed(2) });
  const copied = await page.evaluate(() => window.__rp.MEASURED);
  const same = ['segments', 'film', 'joins', 'loudness', 's2', 's2_balance', 'heard', 'laugh'].every(k => JSON.stringify(copied[k]) === JSON.stringify(M[k]));
  check('the numbers the picture step prints are checks.json\'s', same, same);
  await page.evaluate(() => window.__rp.goTo(4));
  const dur = await page.evaluate(() => new Promise(r => { const v = document.querySelector('video'); if (v.readyState >= 1) r(v.duration); else v.addEventListener('loadedmetadata', () => r(v.duration)); setTimeout(() => r(null), 15000); }));
  check('the film loads beside the piece', dur && Math.abs(dur - 152.2) < 0.1, dur);
  const peak = await page.evaluate(() => { const R = window.__rp; const x = R.mix(R.PLAN.ev, R.PLAN.end, ['voice', 'bed', 'laugh']); return x.reduce((a, v) => Math.max(a, Math.abs(v)), 0); });
  check('the rebuilt mix does not clip at the Shop\'s levels', peak < 1, peak);
  check('no console errors', errors.length === 0, errors);
  await page.close();
}

await browser.close(); server.close();
console.log(failed ? `${failed} failed` : 'all checks pass');
process.exit(failed ? 1 : 0);
