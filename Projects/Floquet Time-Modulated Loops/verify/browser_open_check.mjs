// Open a play page in headless Chrome, press its first play button, and report
// every uncaught exception and console error, plus a screenshot.
// usage: node verify/browser_open_check.mjs "<page.html>" out.png
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
const [page, shot] = process.argv.slice(2);
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9300 + Math.floor(Math.random() * 500);
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, '--autoplay-policy=no-user-gesture-required',
  '--window-size=1400,1000', `--user-data-dir=${mkdtempSync(tmpdir() + '/floq-')}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let tgt;
for (let i = 0; i < 50 && !tgt; i++) { await sleep(200); try { tgt = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); } catch {} }
const ws = new WebSocket(tgt.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(); const errs = [];
ws.onmessage = e => { const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errs.push('exception: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) errs.push(m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description).join(' '));
};
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Runtime.enable'); await send('Page.enable');
await send('Page.navigate', { url: 'file://' + resolve(page) }); await sleep(2500);
const ev = async expr => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result?.value;
const buttons = await ev(`[...document.querySelectorAll('button')].map(b=>b.textContent.trim()).slice(0,20)`);
const clicked = await ev(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>/play|start|listen|▶/i.test(b.textContent));if(!b)return null;b.click();return b.textContent.trim();})()`);
await sleep(3000);
const canvases = await ev(`[...document.querySelectorAll('canvas')].map(c=>{try{const d=c.getContext('2d')?.getImageData(0,0,c.width,c.height).data;if(!d)return 'webgl';let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return Math.round(100*n/(d.length/4))+'% painted';}catch(e){return 'unreadable'}})`);
const audio = await ev(`(()=>{const w=window;for(const k of Object.keys(w)){const v=w[k];if(v&&v.constructor&&/AudioContext/.test(v.constructor.name))return k+':'+v.state}return 'no global AudioContext found'})()`);
const s = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(shot, Buffer.from(s.data, 'base64'));
console.log(JSON.stringify({ page, buttons, clicked, canvases, audio, errors: errs }, null, 1));
ws.close(); proc.kill();
