// Opens study v1.10 (adapted from offline-v1.8) in Chrome, presses "walk the
// links", and records the whole walk: the screen as video, and the page's own
// engine output. On 2026-10-14 this machine's audio device would not render,
// so the page runs on fake_audio_clock.js: its own main-thread engine, driven
// in real time, with every output block it computes kept and written as the
// WAV. Muxes them into stiff-walk.mp4; photographs late in every step; logs errors.
// usage: node record_walk.mjs   (needs Google Chrome, ffmpeg, the stigmergy app's playwright)
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { execFileSync } from 'node:child_process';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const PAGE = path.join(HERE, '..', 'study-v1.10-the-overtones-run-sharp', 'index.html');
const srv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(fs.readFileSync(PAGE)); }).listen(5914);
const VID = path.join(HERE, 'video-tmp'); fs.rmSync(VID, { recursive: true, force: true });
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: VID, size: { width: 1280, height: 720 } } });
const pg = await ctx.newPage(); const tPage = Date.now();
const errors = []; pg.on('pageerror', e => errors.push(e.message));
await pg.addInitScript({ path: path.join(HERE, 'fake_audio_clock.js') });
await pg.goto('http://localhost:5914/'); await pg.waitForTimeout(1200);
await pg.click('#gateBtn').catch(() => {}); await pg.waitForTimeout(600);
await pg.mouse.move(1270, 710);
await pg.evaluate(() => { window.__fakeRec = []; });
const tRec = Date.now();
await pg.evaluate(() => walkStart());
const SHOTS = path.join(HERE, 'frames'); fs.mkdirSync(SHOTS, { recursive: true });
let cur = 0, pk = -99, shot = false; const meters = [], shots = [], WHO = [];
while (true) {
  await pg.waitForTimeout(100);
  const st = await pg.evaluate(() => walk ? { i: walk.i, t: walk.t, who: $('walkWho').textContent, db: 20 * Math.log10(meterPeak + 1e-9), grip: $('gripState').textContent } : null);
  if (!st || st.i !== cur) { meters.push({ step: cur + 1, who: WHO[cur], peak_dbfs: +pk.toFixed(1), chart_said: WHO['g' + cur] }); pk = -99; shot = false; if (!st) break; cur = st.i; }
  WHO[cur] = st.who; WHO['g' + cur] = st.grip; pk = Math.max(pk, st.db);
  if (!shot && st.t > 5.4) {
    const f = path.join(SHOTS, `step-${String(cur + 1).padStart(2, '0')}.png`);
    await pg.screenshot({ path: f }); shots.push(path.relative(HERE, f)); shot = true;
  }
}
await pg.waitForTimeout(400);
const n = await pg.evaluate(() => __fakeRec.length);
const chunks = [];
for (let i = 0; i < n; i += 200) chunks.push(...await pg.evaluate(([a, z]) => __fakeRec.slice(a, z).map(x => Array.from(x)), [i, Math.min(n, i + 200)]));
await ctx.close(); await b.close(); srv.close();
const flat = new Float32Array(chunks.length * chunks[0].length); chunks.forEach((c, i) => flat.set(c, i * c.length));
const WAV = path.join(HERE, 'stiff-walk.wav'), MP4 = path.join(HERE, 'stiff-walk.mp4');
const buf = Buffer.alloc(44 + flat.length * 2);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + flat.length * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(48000, 24); buf.writeUInt32LE(96000, 28);
buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(flat.length * 2, 40);
for (let i = 0; i < flat.length; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, flat[i])) * 32767), 44 + 2 * i);
fs.writeFileSync(WAV, buf);
const vfile = path.join(VID, fs.readdirSync(VID).find(f => f.endsWith('.webm')));
const lead = (tRec - tPage) / 1000;
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', vfile, '-itsoffset', String(lead), '-i', WAV,
  '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', MP4]);
fs.rmSync(VID, { recursive: true, force: true });
const out = { errors, audio_seconds: +(flat.length / 48000).toFixed(1), video_lead_s: lead, meters, shots };
fs.writeFileSync(path.join(HERE, 'walk-record.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
