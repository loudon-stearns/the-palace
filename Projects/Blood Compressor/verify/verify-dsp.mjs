// Runs the DSP block of stage2-vessel-prototype-v3.html, as written, in Node,
// and checks that the threshold does what it says. Writes findings.json,
// threshold-steps.wav, and threshold-steps.svg next to this file.
// Usage: node verify-dsp.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, '..', 'stage2-vessel-prototype-v3.html'), 'utf8');
const src = html.match(/<script id="dsp">([\s\S]*?)<\/script>/)[1];
const sandbox = { module: { exports: null }, Math, Float32Array };
vm.runInNewContext(src, sandbox);
const BC = sandbox.module.exports;
const SR = 48000;
const out = {};

// ---- A. steady sine: measured gain reduction vs the static curve, across thresholds
function steady(thr, ratio, knee, peakDb){
  const c = new BC.Compressor(SR); Object.assign(c.p, { th:thr, ra:ratio, kn:knee, at:20, re:200 });
  const amp = Math.pow(10, peakDb/20);
  let ph = 0, det = 0;
  for (let i = 0; i < SR*1.5; i++){ ph += 2*Math.PI*440/SR; c.processSample(amp*Math.sin(ph)); }
  // average over the last 0.1 s
  let g = 0, d = 0, n = SR*0.1;
  for (let i = 0; i < n; i++){ ph += 2*Math.PI*440/SR; c.processSample(amp*Math.sin(ph)); g += c.last.gr; d += c.last.det; }
  g /= n; d /= n;
  const expected = Math.min(0, c.curve(d) - d);
  return { thr, det:+d.toFixed(2), measured:+g.toFixed(2), expected:+expected.toFixed(2) };
}
out.steadySine = [];
for (let t = 0; t >= -54; t -= 6) out.steadySine.push(steady(t, 4, 0, -12));
out.steadySineKnee = [-6,-9,-12,-15,-18].map(t => steady(t, 4, 6, -12));
out.maxSteadyError = Math.max(...out.steadySine.concat(out.steadySineKnee).map(r => Math.abs(r.measured - r.expected)));

// knee: curve continuity and slope check
{
  const c = new BC.Compressor(SR); Object.assign(c.p, { th:-20, ra:4, kn:12 });
  let maxJump = 0, monotone = true, prev = c.curve(-60);
  for (let x = -60; x <= 0; x += 0.01){ const y = c.curve(x); if (y < prev - 1e-9) monotone = false; maxJump = Math.max(maxJump, Math.abs(y - prev)); prev = y; }
  const slope = (x) => (c.curve(x + 1e-4) - c.curve(x - 1e-4))/2e-4;
  out.kneeCheck = { monotone, maxStepPer0_01dB:+maxJump.toFixed(4), slopeAtKneeStart:+slope(-26).toFixed(3), slopeAtKneeEnd:+slope(-14).toFixed(3) };
}

// ---- B. the heartbeat: how much of each beat gets clamped, per threshold
function beatRun(thr, seconds = 5){
  const c = new BC.Compressor(SR); Object.assign(c.p, { th:thr, ra:4, kn:6, at:60, re:450 });
  const hb = new BC.Heartbeat(SR);
  for (let i = 0; i < SR*1; i++) c.processSample(hb.next());
  let over = 0, squeezing = 0, minG = 0, maxDet = -200, minDet = 200, n = SR*seconds;
  for (let i = 0; i < n; i++){
    c.processSample(hb.next());
    if (c.last.det > thr) over++;
    if (c.last.gr < -0.5) squeezing++;
    minG = Math.min(minG, c.last.gr); maxDet = Math.max(maxDet, c.last.det); minDet = Math.min(minDet, c.last.det);
  }
  return { thr, pctTimeOverThreshold:+(100*over/n).toFixed(1), pctTimeConstricted:+(100*squeezing/n).toFixed(1),
           deepestConstrictionDb:+minG.toFixed(1), loudestPressureDb:+maxDet.toFixed(1), quietestPressureDb:+minDet.toFixed(1) };
}
out.heartbeat = [0,-6,-12,-18,-24,-30,-36,-42].map(t => beatRun(t));

// ---- C. reflex timing: step from -40 to -6 dBFS with threshold -20
function reflex(atk){
  const c = new BC.Compressor(SR); Object.assign(c.p, { th:-20, ra:4, kn:0, at:atk, re:400 });
  let ph = 0; const lo = Math.pow(10,-40/20), hi = Math.pow(10,-6/20);
  for (let i = 0; i < SR*0.5; i++){ ph += 2*Math.PI*440/SR; c.processSample(lo*Math.sin(ph)); }
  let tCross = null, t63 = null; const final = -10.5; // (-6 - -20)*(1/4 - 1)
  for (let i = 0; i < SR*2; i++){
    ph += 2*Math.PI*440/SR; c.processSample(hi*Math.sin(ph));
    if (tCross === null && c.last.det > -20) tCross = i;
    if (t63 === null && c.last.gr < 0.632*final) t63 = i;
  }
  return { attackMs:atk, detectorCrossesAtMs:+(1000*tCross/SR).toFixed(1), reaches63pctAtMs:+(1000*t63/SR).toFixed(1),
           reflexAfterCrossingMs:+(1000*(t63 - tCross)/SR).toFixed(1) };
}
out.reflex = [5, 20, 60, 200].map(reflex);

// ---- D. the entry's 50-sample RMS window vs 10 ms, on the 110 Hz heartbeat tone
function ripple(rmsMs){
  const c = new BC.Compressor(SR); Object.assign(c.p, { rmsMs, th:0 });
  let ph = 0, mx = -200, mn = 200;
  for (let i = 0; i < SR; i++){ ph += 2*Math.PI*110/SR; c.processSample(0.5*Math.sin(ph)); if (i > SR*0.5){ mx = Math.max(mx, c.last.det); mn = Math.min(mn, c.last.det); } }
  return { rmsWindow: rmsMs < 2 ? '50 samples (~1 ms)' : rmsMs + ' ms', detectorRippleDb:+(mx - mn).toFixed(2) };
}
out.rmsRipple = [50/48, 10].map(ripple);

// ---- E. audition: the heartbeat with the threshold stepping down every 4 s
const steps = [0, -10, -20, -30, -40];
const segS = 4, N = SR*segS*steps.length;
const c = new BC.Compressor(SR); Object.assign(c.p, { ra:6, kn:6, at:40, re:350 });
const hb = new BC.Heartbeat(SR);
const audio = new Float32Array(N);
const env = { det:[], gr:[], th:[] }; const dec = SR/100;
for (let i = 0; i < N; i++){
  c.p.th = steps[Math.floor(i/(SR*segS))];
  audio[i] = c.processSample(hb.next());
  if (i % dec === 0){ env.det.push(c.last.det); env.gr.push(c.last.gr); env.th.push(c.p.th); }
}
// short fades at the edges
for (let i = 0; i < 480; i++){ audio[i] *= i/480; audio[N-1-i] *= i/480; }
const wav = Buffer.alloc(44 + N*2);
wav.write('RIFF',0); wav.writeUInt32LE(36 + N*2,4); wav.write('WAVE',8); wav.write('fmt ',12);
wav.writeUInt32LE(16,16); wav.writeUInt16LE(1,20); wav.writeUInt16LE(1,22); wav.writeUInt32LE(SR,24);
wav.writeUInt32LE(SR*2,28); wav.writeUInt16LE(2,32); wav.writeUInt16LE(16,34); wav.write('data',36); wav.writeUInt32LE(N*2,40);
for (let i = 0; i < N; i++) wav.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(audio[i]*32767))), 44 + i*2);
fs.writeFileSync(path.join(here, 'threshold-steps.wav'), wav);
out.audition = steps.map((t, k) => {
  const a = k*segS*100 + 100, b = (k+1)*segS*100;
  const g = env.gr.slice(a, b), d = env.det.slice(a, b);
  return { threshold:t, seconds:`${k*segS}–${(k+1)*segS}`, peakPressureDb:+Math.max(...d).toFixed(1),
           deepestConstrictionDb:+Math.min(...g).toFixed(1), pctConstricted:+(100*g.filter(x => x < -0.5).length/g.length).toFixed(0) };
});

// ---- the figure, as SVG (no matplotlib on this Mac)
const Wd = 1000, Ht = 460, L = 60, R = 20, T1 = 30, H1 = 230, T2 = 300, H2 = 130;
const nP = env.det.length;
const X = i => L + (Wd - L - R) * i/(nP - 1);
const Y1 = db => T1 + H1*(1 - (Math.max(-60, Math.min(3, db)) + 60)/63);
const Y2 = g => T2 + H2*(-Math.max(-24, g)/24);
const poly = (arr, f) => arr.map((v, i) => `${X(i).toFixed(1)},${f(v).toFixed(1)}`).join(' ');
let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wd} ${Ht}" font-family="JetBrains Mono, monospace" font-size="11">
<rect width="${Wd}" height="${Ht}" fill="#0B0B10"/>
<text x="${L}" y="18" fill="#E8E8F0">pressure in (white) · systolic threshold (amber) · pressure past the vessel (red)</text>`;
for (const db of [0,-12,-24,-36,-48,-60]) svg += `<line x1="${L}" x2="${Wd-R}" y1="${Y1(db)}" y2="${Y1(db)}" stroke="#E8E8F0" stroke-opacity=".12"/><text x="8" y="${Y1(db)+4}" fill="#E8E8F0" fill-opacity=".5">${db} dB</text>`;
svg += `<polyline fill="none" stroke="#E8E8F0" stroke-opacity=".8" stroke-width="1.2" points="${poly(env.det, Y1)}"/>`;
svg += `<polyline fill="none" stroke="#C8254C" stroke-width="1.6" points="${poly(env.det.map((d,i) => d + env.gr[i]), Y1)}"/>`;
svg += `<polyline fill="none" stroke="#F5C16C" stroke-width="2" stroke-dasharray="6 4" points="${poly(env.th, Y1)}"/>`;
svg += `<text x="${L}" y="${T2-10}" fill="#E8E8F0">vessel constriction (gain reduction, dB) — deeper = narrower</text>`;
for (const g of [0,-12,-24]) svg += `<line x1="${L}" x2="${Wd-R}" y1="${Y2(g)}" y2="${Y2(g)}" stroke="#E8E8F0" stroke-opacity=".12"/><text x="8" y="${Y2(g)+4}" fill="#E8E8F0" fill-opacity=".5">${g} dB</text>`;
svg += `<polygon fill="#8B4A5E" fill-opacity=".6" points="${X(0)},${Y2(0)} ${poly(env.gr, Y2)} ${X(nP-1)},${Y2(0)}"/>`;
svg += `<polyline fill="none" stroke="#C8254C" stroke-width="1.4" points="${poly(env.gr, Y2)}"/>`;
steps.forEach((t, k) => { svg += `<text x="${X(k*segS*100)+6}" y="${Ht-8}" fill="#F5C16C">${k*segS}s · threshold ${t} dB</text>`; });
svg += `</svg>`;
fs.writeFileSync(path.join(here, 'threshold-steps.svg'), svg);

fs.writeFileSync(path.join(here, 'findings.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
