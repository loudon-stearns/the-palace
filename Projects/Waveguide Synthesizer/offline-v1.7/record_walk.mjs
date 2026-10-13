// Opens study v1.7 in Chrome, presses "walk the links", and records the whole
// walk: the screen as video, and the page's own audio output (tapped from the
// waveguide node with a MediaRecorder), then muxes them into walk-the-links.mp4.
// Also photographs the middle of every step for a contact sheet, and records
// any page errors.
// usage: node record_walk.mjs   (needs Google Chrome, ffmpeg, the stigmergy app's playwright)
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { execFileSync } from 'node:child_process';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const PAGE = path.join(HERE, '..', 'study-v1.7-walk-the-links', 'index.html');
const srv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(fs.readFileSync(PAGE)); }).listen(5898);
const VID = path.join(HERE, 'video-tmp'); fs.rmSync(VID, { recursive: true, force: true });
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 1100, height: 680 }, recordVideo: { dir: VID, size: { width: 1100, height: 680 } } });
const pg = await ctx.newPage(); const errors = []; pg.on('pageerror', e => errors.push(e.message));
await pg.goto('http://localhost:5898/'); await pg.waitForTimeout(1200);
await pg.click('#gateBtn').catch(() => {}); await pg.waitForTimeout(600);
const t0 = Date.now();
await pg.evaluate(() => {
  const dest = audioCtx.createMediaStreamDestination(); wgNode.connect(dest);
  window.__chunks = []; window.__rec = new MediaRecorder(dest.stream, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 160000 });
  window.__rec.ondataavailable = e => window.__chunks.push(e.data); window.__rec.start();
});
const lead = (Date.now() - t0) / 1000;
await pg.mouse.move(1050, 650);
await pg.evaluate(() => walkStart());
const STEPS = await pg.evaluate(() => WALK.length), STEP = await pg.evaluate(() => STEP_S);
const shots = [], meters = [], WHO = [];
const SHOTS = path.join(HERE, 'frames'); fs.mkdirSync(SHOTS, { recursive: true });
// follow the page's own step counter, so photos and meters stay on the right step
let cur = 0, pk = -99, shot = false;
while (true) {
  await pg.waitForTimeout(100);
  const st = await pg.evaluate(() => walk ? { i: walk.i, t: walk.t, who: $('walkWho').textContent, db: 20 * Math.log10(meterPeak + 1e-9) } : null);
  if (!st || st.i !== cur) { meters.push({ step: cur + 1, who: WHO[cur], peak_dbfs: +pk.toFixed(1) }); pk = -99; shot = false; if (!st) break; cur = st.i; }
  WHO[cur] = st.who; pk = Math.max(pk, st.db);
  if (!shot && st.t > 5.4) {               // late in the sweep: the slider near its far end
    const f = path.join(SHOTS, `step-${String(cur + 1).padStart(2, '0')}.png`);
    await pg.screenshot({ path: f }); shots.push(path.relative(HERE, f)); shot = true;
  }
}
await pg.waitForTimeout(500);
const walkingAfter = await pg.evaluate(() => !!walk);
const b64 = await pg.evaluate(() => new Promise(res => { __rec.onstop = async () => {
  const buf = await new Blob(__chunks, { type: 'audio/webm' }).arrayBuffer();
  let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
  res(btoa(s)); }; __rec.stop(); }));
const audioWebm = path.join(HERE, 'walk-audio.webm'); fs.writeFileSync(audioWebm, Buffer.from(b64, 'base64'));
const audioStart = (await pg.evaluate(() => performance.now())) ; // unused, kept for debugging
await ctx.close(); await b.close(); srv.close();
const vfile = path.join(VID, fs.readdirSync(VID).find(f => f.endsWith('.webm')));
// the video starts at page creation; the audio starts after the gate click. Offset the audio to match.
const vidLead = 1.8 + lead;
const WAV = path.join(HERE, 'walk-the-links.wav'), MP4 = path.join(HERE, 'walk-the-links.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', audioWebm, '-ar', '48000', '-ac', '1', WAV]);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', vfile, '-itsoffset', String(vidLead), '-i', WAV,
  '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', MP4]);
fs.rmSync(VID, { recursive: true, force: true }); fs.rmSync(audioWebm);
const out = { errors, meters, shots, walking_after_end: walkingAfter };
fs.writeFileSync(path.join(HERE, 'walk-record.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
