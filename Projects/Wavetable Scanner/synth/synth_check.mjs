// Drives wavetable_synth.html in Chrome, Firefox and WebKit: engage, play the page keys and the
// computer keys, feed raw MIDI bytes through the page's own handler (note on/off, mod wheel, CC74,
// pitch bend), switch tables, pack a folder through the file input, and measure that sound comes out
// and that the mod wheel moves Position. Photographs each browser with a chord held.
// usage: node synth_check.mjs   (uses the stigmergy app's playwright, as study_check.mjs does)
import { chromium, firefox, webkit } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const ROOT = path.resolve(HERE, '../../..');
const srv = http.createServer((q, r) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!fs.existsSync(p)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': p.endsWith('.css') ? 'text/css' : p.endsWith('.png') ? 'image/png' : 'text/html' }); r.end(fs.readFileSync(p));
}).listen(5913);
const URL_ = 'http://localhost:5913/Projects/Wavetable%20Scanner/wavetable_synth.html';
const AK = path.join(os.homedir(), 'Desktop/AKWF/AKWF_eorgan');
const rms = `(() => { const a = new Float32Array(2048); window.__an.getFloatTimeDomainData(a); let s = 0; for (const x of a) s += x * x; return Math.sqrt(s / a.length); })()`;
const out = {};
for (const [name, type] of [['chrome', chromium], ['firefox', firefox], ['webkit', webkit]]) {
  const r = { errors: [] };
  const browser = await type.launch({ args: name === 'chrome' ? ['--autoplay-policy=no-user-gesture-required'] : [] });
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 1100 } });
  if (name === 'chrome') await ctx.grantPermissions(['midi']).catch(() => {});
  const page = await ctx.newPage();
  page.on('pageerror', e => r.errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') r.errors.push(m.text()); });
  await page.goto(URL_); await page.click('#engage'); await page.waitForFunction(() => window.__synth, null, { timeout: 10000 });
  await page.evaluate(() => { window.__an = window.__synth.ac.createAnalyser(); window.__an.fftSize = 2048; window.__synth.node.connect(window.__an); });
  r.sampleRate = await page.evaluate(() => window.__synth.ac.sampleRate);
  await page.waitForTimeout(300); r.silence_rms = +(await page.evaluate(rms)).toFixed(4);
  // a page key, pressed and held
  const key = page.locator('.keys .k[data-n="60"]'); const bb = await key.boundingBox();
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height - 10); await page.mouse.down(); await page.waitForTimeout(400);
  r.page_key_rms = +(await page.evaluate(rms)).toFixed(4); await page.mouse.up(); await page.waitForTimeout(600);
  // the computer keys: a C major triad
  for (const k of 'adg') await page.keyboard.down(k);
  await page.waitForTimeout(400); r.computer_keys_sounding = await page.evaluate(() => window.__synth.sounding.slice().sort());
  r.computer_keys_rms = +(await page.evaluate(rms)).toFixed(4);
  for (const k of 'adg') await page.keyboard.up(k);
  await page.waitForTimeout(800);
  // raw MIDI bytes through the page's own handler
  await page.evaluate(() => { onMidi({ data: [0x90, 57, 110] }); onMidi({ data: [0x90, 64, 110] }); onMidi({ data: [0xb0, 1, 0] }); });
  await page.waitForTimeout(250); r.pos_wheel_0 = +(await page.evaluate(() => window.__synth.pos)).toFixed(3);
  await page.evaluate(() => onMidi({ data: [0xb0, 1, 127] })); await page.waitForTimeout(250);
  r.pos_wheel_127 = +(await page.evaluate(() => window.__synth.pos)).toFixed(3);
  await page.evaluate(() => onMidi({ data: [0xb0, 1, 64] })); await page.waitForTimeout(250);
  r.pos_wheel_64 = +(await page.evaluate(() => window.__synth.pos)).toFixed(3);
  await page.evaluate(() => { onMidi({ data: [0xb0, 74, 40] }); onMidi({ data: [0xe0, 0, 127] }); });
  await page.waitForTimeout(200); r.cc74_cutoff_hz = Math.round(await page.evaluate(() => window.__synth.params.cutoff));
  r.midi_rms = +(await page.evaluate(rms)).toFixed(4);
  await page.screenshot({ path: path.join(HERE, `shot-synth-${name}.png`), fullPage: false });
  await page.evaluate(() => { onMidi({ data: [0x80, 57, 0] }); onMidi({ data: [0x90, 64, 0] }); onMidi({ data: [0xe0, 0, 64] }); onMidi({ data: [0xb0, 1, 0] }); });
  await page.waitForTimeout(2500); r.after_release_sounding = await page.evaluate(() => window.__synth.sounding.length);
  // switch to the 122-frame table, then pack a folder of organ cycles through the folder input
  await page.selectOption('#cTable', '2'); await page.evaluate(() => window.__synth.noteOn(48, 100)); await page.waitForTimeout(300);
  r.fm_table_rms = +(await page.evaluate(rms)).toFixed(4); await page.evaluate(() => window.__synth.noteOff(48));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eorgan40-'));   // the folder input wants a folder: the first 40 organ cycles
  fs.readdirSync(AK).filter(n => n.endsWith('.wav')).slice(0, 40).forEach(n => fs.copyFileSync(path.join(AK, n), path.join(dir, n)));
  await page.locator('#cDir').setInputFiles(dir).catch(e => r.errors.push('setInputFiles: ' + e.message.split('\n')[0]));
  await page.waitForTimeout(800);
  r.packed_label = await page.evaluate(() => document.querySelector('#cTable').selectedOptions[0].textContent);
  await page.evaluate(() => window.__synth.noteOn(52, 100)); await page.waitForTimeout(300);
  r.packed_rms = +(await page.evaluate(rms)).toFixed(4);
  out[name] = r; await browser.close();
  console.log(name, JSON.stringify(r));
}
srv.close();
fs.writeFileSync(path.join(HERE, 'synth_check.json'), JSON.stringify(out, null, 1));
