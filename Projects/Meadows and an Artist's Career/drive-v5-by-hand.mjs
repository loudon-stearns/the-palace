// drive-v5-by-hand.mjs — use the v5 journaling worksheet the way a person would, with no ?demo= fill-in.
// Real mouse clicks and real typed text (Chrome DevTools Protocol input events) for every textarea, the
// "sit with this rung" toggles, Save, and Clear everything (its confirm dialog included). The rung dropdowns are the
// one exception: a native <select> popup can't be clicked headless, so each is focused, then set and sent a change event.
// Then it reloads the page to check the writing survived, saves, and checks the saved text.
// Run: node drive-v5-by-hand.mjs  → prints a pass/fail table, writes drive-v5-by-hand-report.txt and two screenshots.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PAGE = pathToFileURL(join(HERE, 'leverage-diagnostic-v5.html')).href;
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9333 + Math.floor(Math.random() * 400);
const prof = mkdtempSync(join(tmpdir(), 'meadows-v5-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`,
  '--window-size=1200,1400', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let ws, seq = 0; const waiting = new Map(), listeners = [];
async function connect() {
  for (let i = 0; i < 50; i++) {
    try { const t = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const p = t.find(x => x.type === 'page'); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); break; } } catch {}
    await sleep(200);
  }
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  ws.addEventListener('message', e => { const m = JSON.parse(e.data);
    if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } else listeners.forEach(f => f(m)); });
}
const send = (method, params = {}) => new Promise(r => { const id = ++seq; waiting.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const js = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;

async function load(url) { await send('Page.navigate', { url }); await sleep(1500); }
async function center(sel) {
  return js(`(()=>{const e=document.querySelector(${JSON.stringify(sel)}); if(!e) return null; e.scrollIntoView({block:'center'});
    const r=e.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+Math.min(r.height/2,12)};})()`);
}
async function click(sel) {
  const c = await center(sel); if (!c) throw new Error('no element ' + sel); await sleep(60);
  for (const type of ['mousePressed', 'mouseReleased'])
    await send('Input.dispatchMouseEvent', { type, x: c.x, y: c.y, button: 'left', clickCount: 1 });
  await sleep(80);
}
async function type(sel, text) { await click(sel); await send('Input.insertText', { text }); await sleep(60); }
async function pick(sel, value) {
  await click(sel);
  await js(`(()=>{const e=document.querySelector(${JSON.stringify(sel)}); e.value=${JSON.stringify(String(value))};
    e.dispatchEvent(new Event('change',{bubbles:true}));})()`); await sleep(60);
}
async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeFileSync(join(HERE, name), Buffer.from(r.result.data, 'base64'));
}

// a made-up working musician's ten, written the way a person writes — not the page's own demo sentences
const TEN = [
  ["Bought a second synth because the first one felt stale.", 12],
  ["Raised my mixing rate from $150 to $200 a song.", 12],
  ["Kept two months of rent in a separate account before quitting the bar gig.", 11],
  ["Started taking only mixing clients who also want lessons, so the two feed each other.", 10],
  ["Moved from one album every two years to a single every six weeks.", 9],
  ["Told my bandmate he can call me out when I book three nights in a row.", 8],
  ["Asked the last five clients where they heard about me; four said the same podcast.", 6],
  ["Said no to scoring an ad for a company I don't trust.", 5],
  ["Let the workshop I run on the side become the thing I introduce myself by.", 4],
  ["Wrote down that the work is for the people in the room, not the playlist.", 3],
];
const JOURNAL = { 12: "The synth was a way to feel new without having to write anything new. It worked for a week.",
                  3: "My career is for… making rooms where people listen hard. That one is mine; the playlist one was my old manager's." };

const checks = []; const ok = (name, pass, note = '') => checks.push([pass ? 'PASS' : 'FAIL', name, note]);
let dialogSeen = '';

try {
  await connect();
  await send('Page.enable'); await send('Runtime.enable');
  listeners.push(m => { if (m.method === 'Page.javascriptDialogOpening') { dialogSeen = m.params.message;
    send('Page.handleJavaScriptDialog', { accept: true }); } });
  await load(PAGE);
  ok('page opens with no ?demo= and an empty ten', (await js(`document.querySelectorAll('#decs textarea').length`)) === 10 &&
     (await js(`[...document.querySelectorAll('#decs textarea')].every(t=>!t.value)`)), 'fresh browser profile');

  for (let i = 0; i < TEN.length; i++) await type(`#decs textarea[data-dec="${i}"]`, TEN[i][0]);
  ok('ten sentences typed by keyboard land in the boxes', await js(`[...document.querySelectorAll('#decs textarea')].filter(t=>t.value.trim()).length`) === 10);
  ok('the exercise stays locked until the ten are filed', await js(`document.getElementById('climb').classList.contains('locked')`));

  for (let i = 0; i < TEN.length; i++) await pick(`#decs select[data-decr="${i}"]`, TEN[i][1]);
  ok('filing all ten unlocks the exercise', !(await js(`document.getElementById('climb').classList.contains('locked')`)));
  ok('my own sentence shows beside rung 12', (await js(`document.getElementById('mine-12').textContent`) || '').includes('second synth'));
  ok('rung 9 counter reads 1', (await js(`document.getElementById('n-9').textContent`)) === '1');

  for (const [r, t] of Object.entries(JOURNAL)) {
    await click(`#sit-${r} > summary`);
    const ta = `#sit-${r} textarea`;
    ok(`clicking "sit with this rung" opens rung ${r}`, await js(`document.getElementById('sit-${r}').open`));
    await type(ta, t);
    ok(`rung ${r} marks itself written`, ((await js(`document.getElementById('w-${r}').textContent`)) || '').includes('written'));
  }
  await type('#rSurprise', "I filed the podcast question at 6 and it felt like the most useful thing I did all year.");
  await type('#rFeel', "Lighter than I expected. Two of the ten are knobs, and only two.");

  const lowAsk = await js(`document.getElementById('lowAsk').textContent`);
  ok('step 1 names my lowest rung and quotes my sentences', /rung 12/.test(lowAsk) && /second synth/.test(lowAsk), lowAsk.slice(0, 90) + '…');
  ok('with two decisions on the lowest rung, step 1 leaves the choice to me', (await js(`document.getElementById('exLow').value`)) === '');
  await type('#exLow', 'Bought a second synth because the first one felt stale, and the one before that too.');
  await type('#exUp', "A rule: no new gear until the last piece has been on three finished tracks.");
  await pick('#exUpRung', 5);
  await type('#exAct', "Write the rule on the studio door and tell my bandmate.");
  await shot('drive-v5-by-hand-filled.png');

  await load(PAGE);   // the page should remember everything typed, from this browser's storage
  ok('after reload, all ten sentences come back', await js(`[...document.querySelectorAll('#decs textarea')].filter(t=>t.value.trim()).length`) === 10);
  ok('after reload, the rung 3 journal entry comes back', ((await js(`document.querySelector('#sit-3 textarea').value`)) || '').includes('rooms where people listen'));
  ok('after reload, the feeling line comes back', ((await js(`document.getElementById('rFeel').value`)) || '').startsWith('Lighter'));

  await click('#save');
  const out = await js(`document.getElementById('out').value`) || '';
  ok('Save shows the saved text', out.startsWith('MEADOWS LEVERAGE DIAGNOSTIC'));
  ok('saved text keeps the old per-rung lines (all 12)', (out.match(/^ {0,2}\d{1,2}  [#.]/mg) || []).length === 12);
  ok('saved reading keeps its paragraphs apart', !/[a-z]\.[A-Z]/.test(out.split('MY TEN')[0]));
  ok('saved text carries my ten in my own words', out.includes('[rung 10] Started taking only mixing clients'));
  ok('saved text carries both journal entries with their questions', out.includes('rung 12 · Constants') && out.includes('rung 3 · Goals'));
  ok('saved text carries the feeling and the move', out.includes('how I feel, having looked: Lighter') && out.includes('my move one band up (rung 5)'));
  ok('save note reports what happened', ((await js(`document.getElementById('exhint').textContent`)) || '').includes('nothing left your machine'));
  writeFileSync(join(HERE, 'drive-v5-by-hand-saved.txt'), out);
  await shot('drive-v5-by-hand-saved.png');

  await click('#reset');
  ok('Clear everything asks first', /cannot be undone/.test(dialogSeen), dialogSeen);
  ok('after clearing, the ten are empty', await js(`[...document.querySelectorAll('#decs textarea')].every(t=>!t.value)`));
} catch (e) { ok('the run itself', false, String(e)); }
finally { try { ws?.close(); } catch {} chrome.kill(); }

const rep = checks.map(c => c.join(' · ')).join('\n');
const pass = checks.filter(c => c[0] === 'PASS').length;
const head = `drive-v5-by-hand · ${new Date().toISOString()} · ${pass}/${checks.length} passed\n`;
writeFileSync(join(HERE, 'drive-v5-by-hand-report.txt'), head + rep + '\n');
console.log(head + rep);
