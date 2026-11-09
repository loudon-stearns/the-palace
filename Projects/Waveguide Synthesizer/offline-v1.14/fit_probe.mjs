// Opens a study page in Chrome on the stand-in speaker clock at several short
// screens, walks the lesson's seven stops, photographs each, and measures what
// the lesson card covers: the slider panel, the overtone ladder, the grip chart,
// the stop's own slider, and the string (seven points along it).
// usage: node fit_probe.mjs <study-folder> <tag>
import { chromium } from '../../../_ops/stigmergy/app/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const PAGE = path.join(HERE, '..', process.argv[2], 'index.html'); const TAG = process.argv[3];
const srv = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html' }); r.end(fs.readFileSync(PAGE)); }).listen(5941);
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const SIZES = [[1280, 600], [1024, 560], [844, 390], [640, 480], [480, 480]];
fs.mkdirSync(path.join(HERE, 'frames'), { recursive: true });
const res = { errors: [], sizes: [] };
for (const [w, h] of SIZES) {
  const pg = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await pg.addInitScript({ path: path.join(HERE, 'fake_audio_clock.js') });
  pg.on('pageerror', e => res.errors.push(w + 'x' + h + ': ' + e.message));
  await pg.goto('http://localhost:5941/'); await pg.waitForTimeout(1000);
  await pg.click('#gateBtn'); await pg.waitForTimeout(400);
  await pg.keyboard.press('l'); await pg.waitForTimeout(500);
  const stops = [];
  for (let i = 0; i < 7; i++) {
    await pg.evaluate((i) => lessonGo(i), i); await pg.waitForTimeout(i === 5 ? 1400 : 700);
    const m = await pg.evaluate(() => {
      const R = (el) => { if (!el) return null; const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return null; const r = el.getBoundingClientRect(); return r.width ? r : null; };
      const ov = (a, b) => a && b ? Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)) : 0;
      const L = R($('lesson')); const st = LESSON[lesson.i];
      const f = st.id ? R($(st.id).closest('label')) : null; const ui = R($('ui'));
      const pts = [0, 0.05, 0.25, 0.5, 0.75, 0.95, 1].map(u => { const v = new THREE.Vector3(-STRING_LEN / 2 + u * STRING_LEN, 0, 0).project(camera);
        return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight }; });
      const inR = (p, r) => r && p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom;
      const lad = R($('ladder')), grp = R($('grip')); const covered = pts.filter(p => inR(p, L) || inR(p, ui) || inR(p, lad) || inR(p, grp)).length;
      const offscreen = pts.filter(p => p.x < 0 || p.x > innerWidth || p.y < 0 || p.y > innerHeight).length;
      const nav = R(document.querySelector('#lesson .nav'));
      return { stop: st.name, card: L && [Math.round(L.left), Math.round(L.top), Math.round(L.width), Math.round(L.height)],
        card_offscreen: L ? (L.top < 0 || L.bottom > innerHeight + 1 || L.left < 0 || L.right > innerWidth + 1) : null,
        nav_visible: !!nav && nav.bottom <= innerHeight && nav.top >= 0,
        on_ui: Math.round(ov(L, ui)), on_ladder: Math.round(ov(L, R($('ladder')))), on_grip: Math.round(ov(L, R($('grip')))),
        on_slider: f ? Math.round(ov(L, f)) : 0, slider_in_view: f ? (f.top >= (ui ? ui.top : 0) && f.bottom <= (ui ? ui.bottom : innerHeight)) : null,
        string_pts_covered: covered, string_pts_offscreen: offscreen };
    });
    await pg.screenshot({ path: path.join(HERE, 'frames', `${TAG}-${w}x${h}-${i + 1}-${m.stop}.png`) });
    stops.push(m);
  }
  res.sizes.push({ size: w + 'x' + h, stops });
  await pg.close();
}
await b.close(); srv.close();
fs.writeFileSync(path.join(HERE, `fit-${TAG}.json`), JSON.stringify(res, null, 1));
for (const s of res.sizes) { console.log(s.size); for (const m of s.stops) console.log('  ', JSON.stringify(m)); }
console.log('errors', res.errors);
