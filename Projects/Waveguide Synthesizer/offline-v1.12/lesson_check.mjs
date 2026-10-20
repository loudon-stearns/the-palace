// Opens study v1.12 in Chrome on the stand-in speaker clock, takes the lesson
// the way a learner would: real mouse clicks on the string, real drags on each
// stop's slider, 'next' between stops, 'show me' once on the stiffness stop.
// Records the screen and the engine's own output, photographs each stop before
// and after the hand, and logs whether each stop ticked itself off.
// usage: node lesson_check.mjs   (needs Google Chrome, ffmpeg, the stigmergy app's playwright)
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { execFileSync } from 'node:child_process';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const PAGE = path.join(HERE, '..', 'study-v1.12-the-lesson', 'index.html');
const srv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(fs.readFileSync(PAGE)); }).listen(5925);
const VID = path.join(HERE, 'video-tmp'); fs.rmSync(VID, { recursive: true, force: true });
const SHOTS = path.join(HERE, 'frames'); fs.mkdirSync(SHOTS, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: VID, size: { width: 1280, height: 720 } } });
const pg = await ctx.newPage(); const tPage = Date.now();
const errors = []; pg.on('pageerror', e => errors.push(e.message));
await pg.addInitScript({ path: path.join(HERE, 'fake_audio_clock.js') });
await pg.goto('http://localhost:5925/'); await pg.waitForTimeout(1200);
await pg.click('#gateBtn').catch(() => {}); await pg.waitForTimeout(600);
await pg.evaluate(() => { window.__fakeRec = []; });
const tRec = Date.now();
await pg.keyboard.press('l'); await pg.waitForTimeout(400);
const W = (ms) => pg.waitForTimeout(ms);
const state = () => pg.evaluate(() => ({ i: lesson && lesson.i, done: lesson ? [...lesson.done] : null, who: $('lsWho').textContent,
  got: $('lsGot').textContent, mode: view.mode, bowing, ready: $('lsNext').classList.contains('ready'),
  focus: [...document.querySelectorAll('#sliders label.focus')].map(l => l.querySelector('input').id),
  db: 20 * Math.log10(meterPeak + 1e-9), grip: $('gripState').textContent }));
async function stringXY(u) {   // screen point of position u along the string
  return pg.evaluate((u) => { const v = new THREE.Vector3(-STRING_LEN / 2 + u * STRING_LEN, 0, 0).project(camera);
    return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight }; }, u);
}
async function drag(id, a, z, ms = 5000, pauses = []) {   // a, z in 0..1 along the slider's track
  const r = await pg.locator('#' + id).boundingBox();
  const y = r.y + r.height / 2, X = (f) => r.x + 6 + f * (r.width - 12);
  await pg.mouse.move(X(a), y); await pg.mouse.down();
  const N = 50;
  for (let k = 1; k <= N; k++) { await pg.mouse.move(X(a + (z - a) * k / N), y); await W(ms / N); if (pauses.includes(k)) await W(1500); }
  await pg.mouse.up();
}
const log = []; let pk;
async function stop(name, act) {
  const s0 = await state(); await W(1500);
  await pg.screenshot({ path: path.join(SHOTS, `${name}-a.png`) });
  const t0 = Date.now(); let peak = -99;
  const poll = setInterval(async () => { try { peak = Math.max(peak, (await state()).db); } catch {} }, 250);
  await act();
  await W(1200);
  await pg.screenshot({ path: path.join(SHOTS, `${name}-b.png`) });
  clearInterval(poll);
  const s1 = await state();
  log.push({ stop: name, card: s0.who, focus: s0.focus, mode: s0.mode, bowing_on_entry: s0.bowing, ticked: s1.done.includes(s0.i), next_lit: s1.ready, got: s1.got, chart_said: s1.grip, peak_dbfs: +peak.toFixed(1), seconds: (Date.now() - t0) / 1000 });
  await pg.click('#lsNext'); await W(500);
}
await stop('pluck', async () => {
  let p = await stringXY(0.5); await pg.mouse.click(p.x, p.y); await W(6500);
  p = await stringXY(0.1); await pg.mouse.click(p.x, p.y); await W(6500);
});
await stop('reflection', async () => { await pg.keyboard.press('Space'); await W(800); await drag('slow', 0.1, 0.95, 6000); await W(5000); });
await stop('loss', async () => { for (const [a, z] of [[1, 0.66], [0.66, 0.33], [0.33, 0]]) { await drag('bright', a, z, 1500); await pg.keyboard.press('Space'); await W(1600); } });
await stop('pitch', async () => { await drag('freq', 0.06, 0.95, 7000); });
await stop('stiffness', async () => {
  await pg.click('#lsShow'); await W(7800);
  const showTicked = (await state()).ready; log.push({ note: 'show me on stiffness ticked the stop?', value: showTicked });
  for (const [a, z] of [[0, 0.4], [0.4, 0.75], [0.75, 1]]) { await drag('stiff', a, z, 1500); await pg.keyboard.press('Space'); await W(1600); }
});
await stop('bow', async () => { await drag('bfrc', 0.15, 1.0, 9000, [8, 30, 48]); const s = await state(); log.push({ note: 'bow still on after letting go of the slider?', value: s.bowing }); });
await stop('body', async () => { await drag('body', 0, 1, 7000); });
const end = await pg.evaluate(() => ({ lesson_open: !!lesson, card_shown: $('lesson').style.display, bowing }));
await W(400);
const n = await pg.evaluate(() => __fakeRec.length);
const chunks = [];
for (let i = 0; i < n; i += 200) chunks.push(...await pg.evaluate(([a, z]) => __fakeRec.slice(a, z).map(x => Array.from(x)), [i, Math.min(n, i + 200)]));
await ctx.close(); await b.close(); srv.close();
const flat = new Float32Array(chunks.length * chunks[0].length); chunks.forEach((c, i) => flat.set(c, i * c.length));
const WAV = path.join(HERE, 'lesson-run.wav'), MP4 = path.join(HERE, 'lesson-run.mp4');
const buf = Buffer.alloc(44 + flat.length * 2);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + flat.length * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(48000, 24); buf.writeUInt32LE(96000, 28);
buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(flat.length * 2, 40);
for (let i = 0; i < flat.length; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, flat[i])) * 32767), 44 + 2 * i);
fs.writeFileSync(WAV, buf);
const vfile = path.join(VID, fs.readdirSync(VID).find(f => f.endsWith('.webm')));
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', vfile, '-itsoffset', String((tRec - tPage) / 1000), '-i', WAV,
  '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', MP4]);
fs.rmSync(VID, { recursive: true, force: true });
const out = { errors, audio_seconds: +(flat.length / 48000).toFixed(1), stops: log, after_finish: end };
fs.writeFileSync(path.join(HERE, 'lesson-check.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
