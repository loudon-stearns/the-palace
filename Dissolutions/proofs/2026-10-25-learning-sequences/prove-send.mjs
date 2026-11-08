// prove-send.mjs — prove the six sequences' Send to STIGMERGY against a STUB board, never the live :5173.
//
//   node prove-send.mjs <root> [shots-dir]
//
// <root> is a palace tree that holds both these sequences and main's _ops/loudon-eval/answers.js.
// Until this branch lands, build one from the merge without merging:
//   T=$(git merge-tree --write-tree main HEAD); git archive $T _ops/loudon-eval Dissolutions/proofs | tar -x -C <root>
// It runs the owner's answers server (_ops/loudon-eval/eval-server.mjs) with --root <root> and --app
// pointed at a stub that answers 201, or 500 when told to, and drives each sequence in headless
// Chromium: Send is off in flight; a double click makes one post; the post is a human_eval on entry
// Dissolutions with the sequence as task and one answer per noted step; a note typed in flight stays
// and goes in the next send; a landed send clears its boxes and storage and says so; a failed send
// keeps every note and says why; with every box empty nothing posts. It writes nothing but screenshots.
// Pattern: the answers-back session's kit-proof.mjs (2026-11-07).
import http from 'node:http';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const OWNER = '/Users/loudonstearns/Documents/The Palace';
const ROOT = process.argv[2], SHOTS = process.argv[3];
const require = createRequire(OWNER + '/_ops/stigmergy/app/package.json');
const { chromium } = require('playwright');
const SEQ = ['the-table-that-travels', 'the-shadow-that-locks', 'the-circles-shadow', 'one-field-two-hands', 'the-equation-read-backward', 'the-lattice-read-back'];

const posts = []; let mode = 'ok';
const stub = http.createServer((req, res) => { let b = ''; req.on('data', (d) => (b += d)); req.on('end', () => {
  if (req.url === '/api/persistent' && req.method === 'POST') posts.push(JSON.parse(b));
  setTimeout(() => {
    if (mode === 'fail') { res.writeHead(500, { 'Content-Type': 'application/json' }); res.end('{"error":"stub board refused"}'); }
    else { res.writeHead(201, { 'Content-Type': 'application/json' }); res.end('{"ok":true}'); }
  }, 900); }); }).listen(0, '127.0.0.1');
await new Promise((r) => stub.on('listening', r));
const PORT = 8297;
const srv = spawn('node', [OWNER + '/_ops/loudon-eval/eval-server.mjs', '--root', ROOT, '--port', String(PORT), '--app', `http://127.0.0.1:${stub.address().port}`]);
let log = ''; srv.stdout.on('data', (d) => (log += d)); srv.stderr.on('data', (d) => (log += d));
await new Promise((r) => setTimeout(r, 1200));

let fails = 0, crashed = null;
const check = (n, ok, x = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${x ? '  (' + x + ')' : ''}`); if (!ok) fails++; };
const browser = await chromium.launch();
try {
  for (const slug of SEQ) {
    console.log(`\n── ${slug}`);
    mode = 'ok';
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
    const errs = []; page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error' && !(mode === 'fail' && /status of 500/.test(m.text()))) errs.push(m.text()); });
    const url = `http://127.0.0.1:${PORT}/Dissolutions/proofs/2026-10-25-learning-sequences/${slug}.html`;
    await page.goto(url); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForTimeout(400);
    const note = (i, v) => page.evaluate(([i, v]) => { const t = document.querySelector(`section.step[data-step="${i}"] [data-note]`); t.value = v; t.dispatchEvent(new Event('input')); }, [i, v]);
    await note(0, 'step one note'); await note(1, 'step two note');
    await page.evaluate(() => window.__seq.go(window.__seq.count - 1));
    const n0 = posts.length;
    await page.click('#send'); await page.click('#send', { force: true }).catch(() => {});
    const inflight = await page.$eval('#send', (b) => b.disabled && b.textContent === 'Sending…');
    // a note typed while the send is in flight
    await page.evaluate(() => { const t = document.querySelector('section.step[data-step="0"] [data-note]'); t.value = 'typed in flight'; t.dispatchEvent(new Event('input')); });
    await page.waitForFunction(() => !document.getElementById('send').disabled, null, { timeout: 5000 });
    const afterFirst = posts.length - n0;
    await page.click('#send'); await page.waitForTimeout(200); // a later click: one note left, so a second, separate send
    await page.waitForFunction(() => !document.getElementById('send').disabled, null, { timeout: 5000 });
    check('Send is off while in flight', inflight);
    const mine = posts.slice(n0);
    check('two fast clicks make one post', afterFirst === 1, `${afterFirst} post after the double click; ${mine.length} in all after a later, separate send`);
    const p = mine[0]?.payload || {};
    const ans = p.answers || {};
    check('it lands as a review note on Dissolutions, task = the sequence', p.kind === 'human_eval' && p.entry === 'Dissolutions' && p.task === slug,
      JSON.stringify({ kind: p.kind, entry: p.entry, task: p.task }));
    check('it carries each noted step, and the readable digest', Object.keys(ans).length === 2 && /step one note/.test(JSON.stringify(ans)) && /step two note/.test(p.overall?.note || ''),
      `${Object.keys(ans).join(' | ')}`);
    const p2 = mine[1]?.payload || {};
    check('the note typed in flight stayed, and went in the next send alone', Object.keys(p2.answers || {}).length === 1 && /typed in flight/.test(JSON.stringify(p2.answers)), JSON.stringify(p2.answers));
    const st = await page.evaluate(() => ({ v: [...document.querySelectorAll('[data-note]')].map((t) => t.value).join(''), said: document.getElementById('copied').textContent, stored: Object.keys(JSON.parse(localStorage.getItem(Object.keys(localStorage)[0]) || '{}')).length }));
    check('after it lands: boxes cleared, storage empty, the page says it went', st.v === '' && st.stored === 0 && /^Sent to STIGMERGY — 1 note/.test(st.said), st.said.slice(0, 90));
    if (SHOTS && slug === SEQ[0]) await page.screenshot({ path: `${SHOTS}/send-landed.png` });
    // a failed send keeps every note
    mode = 'fail';
    await note(2, 'kept on failure');
    const n1 = posts.length;
    await page.click('#send'); await page.waitForFunction(() => !document.getElementById('send').disabled, null, { timeout: 5000 });
    const f = await page.evaluate(() => ({ v: document.querySelector('section.step[data-step="2"] [data-note]').value, said: document.getElementById('copied').textContent }));
    check('a failed send keeps the note and says why', f.v === 'kept on failure' && /^Not sent — your notes are kept\. The board said 500/.test(f.said), `${posts.length - n1} reached the stub · “${f.said.slice(0, 80)}”`);
    if (SHOTS && slug === SEQ[0]) await page.screenshot({ path: `${SHOTS}/send-failed.png` });
    // empty: nothing posts
    await page.evaluate(() => { document.querySelectorAll('[data-note]').forEach((t) => { t.value = ''; t.dispatchEvent(new Event('input')); }); });
    const n2 = posts.length; await page.click('#send'); await page.waitForTimeout(300);
    check('with every box empty, Send posts nothing and says so', posts.length === n2 && /^Nothing to send yet/.test(await page.$eval('#copied', (e) => e.textContent)));
    check('no page errors (the 500 the stub was told to give is not one)', errs.length === 0, errs.slice(0, 2).join(' | '));
    await page.close();
  }
} catch (e) { crashed = e; } finally {
  await browser.close(); srv.kill(); stub.close();
  console.log(crashed ? `\nCRASHED: ${crashed.message.split('\n')[0]}` : fails ? `\n${fails} FAIL\nserver log:\n${log.slice(-600)}` : '\nall PASS');
}
