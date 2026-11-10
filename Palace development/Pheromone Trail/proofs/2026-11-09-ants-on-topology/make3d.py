#!/usr/bin/env python3
"""Make src-3d.html from src.html: the same data and the same ants, on a sheet of
paper seen in perspective. Where pages were visited lately the paper is pushed up
and lit; the trails float above it as a hologram.

Usage: python3 make3d.py   (then: python3 inline.py src-3d.html ants-relief.html)
Only the camera, the drawing and the pointer change. The walk logic is src.html's.
"""
import os, re
here = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(here, 'src.html'), encoding='utf-8').read()

def cut(a, b, new, keep_b=True):
    global s
    i = s.index(a); j = s.index(b, i)
    s = s[:i] + new + (s[j:] if keep_b else s[j + len(b):])
def rep(a, b):
    global s
    assert s.count(a) == 1, (a, s.count(a)); s = s.replace(a, b)

CAMERA = r'''// ---- camera: a sheet of paper on a dark desk, seen from above and to one side ----
let W = 0, H = 0, dpr = 1, F = 900, CX = 0, CY = 0, lastTouch = -1e9, lastDraw = 0;
const cam = { az: -.42, el: .7, dist: 4000, tx: 0, ty: 0 };
let ext = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9 };
for (const n of NODES) { ext.x0 = Math.min(ext.x0, n.x - n.r); ext.x1 = Math.max(ext.x1, n.x + n.r); ext.y0 = Math.min(ext.y0, n.y - n.r); ext.y1 = Math.max(ext.y1, n.y + n.r); }
const MARGIN = 190, X0 = ext.x0 - MARGIN, X1 = ext.x1 + MARGIN, Y0 = ext.y0 - MARGIN, Y1 = ext.y1 + MARGIN;
const GX = 78, GY = 52, VX = GX + 1, VY = GY + 1, CW = (X1 - X0) / GX, CH = (Y1 - Y0) / GY;
const hT = new Float32Array(VX * VY), hC = new Float32Array(VX * VY), hV = new Float32Array(VX * VY);
const PXa = new Float32Array(VX * VY), PYa = new Float32Array(VX * VY);
const HEIGHT = 150, HMAX = 300, SIG = 2.1, HOLO = 230;
let panelsHidden = false, snapRelief = true;
let ca = 1, sa = 0, ce = 1, se = 0;
const P = [0, 0, 0, 0];                                   // screen x, screen y, px per world unit, depth
function proj(x, y, z) {
  const dx = x - cam.tx, dy = y - cam.ty, xr = dx * ca - dy * sa, yr = dx * sa + dy * ca;
  const depth = cam.dist - yr * ce - z * se, sc = F / Math.max(80, depth);
  P[0] = CX + xr * sc; P[1] = CY - (-yr * se + z * ce) * sc; P[2] = sc; P[3] = depth; return P;
}
function hAt(x, y) {
  const fx = Math.max(0, Math.min(GX - .001, (x - X0) / CW)), fy = Math.max(0, Math.min(GY - .001, (y - Y0) / CH));
  const i = fx | 0, j = fy | 0, u = fx - i, v = fy - j, k = j * VX + i;
  return (hC[k] * (1 - u) + hC[k + 1] * u) * (1 - v) + (hC[k + VX] * (1 - u) + hC[k + VX + 1] * u) * v;
}
function fit() {
  const wide = W > 1100 && !panelsHidden;
  F = H * 1.25; CX = wide ? (W + 400) / 2 : W / 2; CY = H * .5;
  const aw = wide ? W - 430 : W - 20;
  cam.dist = Math.max((X1 - X0) * F / (aw * .98), (Y1 - Y0) * F / (H * 1.0));
  cam.tx = (X0 + X1) / 2; cam.ty = (Y0 + Y1) / 2;
}
function resetCam() { cam.az = -.42; cam.el = .7; fit(); }
function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr; fit(); drawHist();
}
// the paper is pushed up under every page that was visited lately, and it springs
function relief(dt) {
  hT.fill(0);
  for (let n = 0; n < N; n++) {
    if (!shown[n]) continue;
    const nd = NODES[n], h = Math.min(1.7, decay(heatV[n], heatT[n], simT) / 2.2), amp = (.04 + h) * HEIGHT * .8;
    const gx = (nd.x - X0) / CW, gy = (nd.y - Y0) / CH;
    const i0 = Math.max(0, Math.floor(gx - 5)), i1 = Math.min(GX, Math.ceil(gx + 5)), j0 = Math.max(0, Math.floor(gy - 5)), j1 = Math.min(GY, Math.ceil(gy + 5));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const d2 = (i - gx) * (i - gx) + (j - gy) * (j - gy); hT[j * VX + i] += amp * Math.exp(-d2 / (2 * SIG * SIG)); }
  }
  for (let k = 0; k < hT.length; k++) {
    const t = HMAX * Math.tanh(hT[k] / HMAX);
    if (snapRelief) { hC[k] = t; hV[k] = 0; continue; }
    hV[k] += ((t - hC[k]) * 70 - hV[k] * 6.5) * dt; hC[k] += hV[k] * dt;
  }
  snapRelief = false;
}

'''

DRAW = r'''// ---- draw ----------------------------------------------------------------------
const backOut = u => { const c = 2.2; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const scrX = new Float32Array(N), scrY = new Float32Array(N), scrR = new Float32Array(N);
function drape(A, B, lift, pieces) {                       // a line laid over the relief, or floated above it
  for (let q = 0; q <= pieces; q++) {
    const x = A.x + (B.x - A.x) * q / pieces, y = A.y + (B.y - A.y) * q / pieces;
    proj(x, y, hAt(x, y) + lift); q ? g.lineTo(P[0], P[1]) : g.moveTo(P[0], P[1]);
  }
}
function draw(now) {
  const dt = Math.min(.05, (now - lastDraw) / 1000) || .016; lastDraw = now;
  if (playing && now - lastTouch > 5000) cam.az += .03 * dt;       // the desk turns slowly when left alone
  ca = Math.cos(cam.az); sa = Math.sin(cam.az); ce = Math.cos(cam.el); se = Math.sin(cam.el);
  relief(dt);
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = '#0d0b08'; g.fillRect(0, 0, W, H);
  for (let j = 0; j < VY; j++) for (let i = 0; i < VX; i++) { const k = j * VX + i; proj(X0 + i * CW, Y0 + j * CH, hC[k]); PXa[k] = P[0]; PYa[k] = P[1]; }
  // the paper, far cells first. Lifted paper catches the light.
  const jd = ca >= 0, id = sa >= 0;
  g.lineWidth = .6; g.strokeStyle = 'rgba(26,25,22,.16)'; g.lineJoin = 'round';
  for (let jj = 0; jj < GY; jj++) {
    const j = jd ? jj : GY - 1 - jj;
    for (let ii = 0; ii < GX; ii++) {
      const i = id ? ii : GX - 1 - ii, k = j * VX + i;
      const a = hC[k], b = hC[k + 1], c = hC[k + VX], d = hC[k + VX + 1];
      const lit = Math.min(1, Math.max(0, (a + b + c + d) * .25 / HEIGHT));
      const sh = Math.max(.62, Math.min(1.4, 1 + 1.25 * ((b + d - a - c) / (2 * CW) + (c + d - a - b) / (2 * CH))));
      const br = (.3 + .4 * lit) * sh;
      g.fillStyle = 'rgb(' + Math.min(255, 240 * br | 0) + ',' + Math.min(255, 237 * br | 0) + ',' + Math.min(255, 226 * br | 0) + ')';
      g.beginPath(); g.moveTo(PXa[k], PYa[k]); g.lineTo(PXa[k + 1], PYa[k + 1]); g.lineTo(PXa[k + VX + 1], PYa[k + VX + 1]); g.lineTo(PXa[k + VX], PYa[k + VX]); g.closePath(); g.fill(); g.stroke();
    }
  }
  // the sheet's frame, in ink, one cell in from the edge
  g.strokeStyle = 'rgba(26,25,22,.7)'; g.lineWidth = 1.6; g.beginPath();
  for (let i = 1; i < GX; i++) { const k = VX + i; i === 1 ? g.moveTo(PXa[k], PYa[k]) : g.lineTo(PXa[k], PYa[k]); }
  for (let j = 1; j < GY; j++) { const k = j * VX + GX - 1; g.lineTo(PXa[k], PYa[k]); }
  for (let i = GX - 1; i >= 1; i--) { const k = (GY - 1) * VX + i; g.lineTo(PXa[k], PYa[k]); }
  for (let j = GY - 1; j >= 1; j--) { const k = j * VX + 1; g.lineTo(PXa[k], PYa[k]); }
  g.stroke();
  // the typed links, drawn on the paper in ink
  g.lineWidth = .8; g.strokeStyle = 'rgba(20,18,14,.2)'; g.beginPath();
  const fresh = [];
  for (const p of pairOf.values()) {
    if (p.born > simT) continue;
    drape(NODES[p.a], NODES[p.b], 1, 4);
    if (simT - p.born < 1.2 && playing) fresh.push(p);
  }
  g.stroke();
  // the trails, worn into the paper
  g.lineCap = 'round';
  const live = [];
  for (const [kk, tr] of trails) {
    const v = decay(tr.v, tr.t, simT);
    if (v < .06) { if (tau !== Infinity && v < .01) trails.delete(kk); continue; }
    const A = NODES[tr.a], B = NODES[tr.b], st = Math.log2(1 + v), on = linkedAt(kk, simT);
    proj((A.x + B.x) / 2, (A.y + B.y) / 2, 0); const w = Math.min(11, 1 + 1.9 * st) * Math.max(.6, Math.min(1.8, P[2] * 3.4));
    g.lineWidth = w; g.strokeStyle = 'rgba(20,18,14,' + Math.min(.6, .14 + .12 * st) + ')';
    g.setLineDash(on ? [] : [w * 1.1, w * 1.7]);
    g.beginPath(); drape(A, B, 1, 4); g.stroke();
    live.push([A, B, st, on, w]);
  }
  g.setLineDash([]);
  // the nest: a hole in the sheet
  g.fillStyle = '#060504'; g.beginPath();
  for (let q = 0; q <= 28; q++) { const t = q / 28 * 6.2832; proj(Math.cos(t) * NEST_R * 1.7, Math.sin(t) * NEST_R * 1.7, hAt(0, 0) + 1); q ? g.lineTo(P[0], P[1]) : g.moveTo(P[0], P[1]); }
  g.fill();
  for (let r = 0; r < 3; r++) {
    g.strokeStyle = 'rgba(20,18,14,' + (.6 - r * .17 + nestPulse * .3) + ')'; g.lineWidth = 1.4; g.beginPath();
    const rr = NEST_R * (1.9 + r * .45) + Math.sin(now / 400 + r) * 3 + nestPulse * 12;
    for (let q = 0; q <= 28; q++) { const t = q / 28 * 6.2832; proj(Math.cos(t) * rr, Math.sin(t) * rr, hAt(0, 0) + 1); q ? g.lineTo(P[0], P[1]) : g.moveTo(P[0], P[1]); }
    g.stroke();
  }
  proj(0, 0, hAt(0, 0)); const nX = P[0], nY = P[1];
  g.textAlign = 'center'; g.fillStyle = '#f3ead8'; g.font = '800 12px system-ui'; g.fillText('NEST', nX, nY + 1); g.font = '600 10px ui-monospace, Menlo, monospace'; g.fillStyle = '#a39a86'; g.fillText('main', nX, nY + 13);
  // the ants, in ink, on the paper
  for (const a of ants) {
    if (a.delay > 0) continue;
    proj(a.x + Math.cos(a.a) * 24, a.y + Math.sin(a.a) * 24, hAt(a.x + Math.cos(a.a) * 24, a.y + Math.sin(a.a) * 24)); const hx = P[0], hy = P[1];
    proj(a.x, a.y, hAt(a.x, a.y) + 2);
    drawAnt(g, P[0], P[1], Math.atan2(hy - P[1], hx - P[0]), a.step, Math.max(.55, Math.min(1.8, P[2] * 3.3)), a.carry, true);
  }
  // the pages stand on the paper like pins, far ones first
  const order = [];
  for (let i = 0; i < N; i++) { scrR[i] = 0; if (!shown[i]) continue; const n = NODES[i]; proj(n.x, n.y, hAt(n.x, n.y)); order.push([P[3], i, P[0], P[1], P[2]]); }
  order.sort((a, b) => b[0] - a[0]);
  const labels = [], beams = [];
  for (const [, i, X, Y, sc] of order) {
    if (X < -50 || Y < -80 || X > W + 50 || Y > H + 50) continue;
    const n = NODES[i], age = (now - popAt[i]) / 650, pop = age >= 1 ? 1 : Math.max(0, backOut(Math.max(0, age)));
    const h = Math.min(1, decay(heatV[i], heatT[i], simT) / 2.5);
    const r = Math.max(4.5, n.r * 1.3 * sc) * pop * (1 + .12 * h), cy = Y - r * 1.15;
    g.strokeStyle = 'rgba(20,18,14,.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(X, Y); g.lineTo(X, cy); g.stroke();
    if (h > .03) { g.fillStyle = 'rgba(255,246,222,' + (.4 * h) + ')'; g.beginPath(); g.arc(X, cy, r + 3 + 5 * h, 0, 6.283); g.fill(); }
    g.globalAlpha = .55 + .45 * h;
    if (n.icon && sheetReady) g.drawImage(sheet, (i % META.cols) * META.cell, Math.floor(i / META.cols) * META.cell, META.cell, META.cell, X - r, cy - r, r * 2, r * 2);
    else { g.fillStyle = '#3a3227'; g.beginPath(); g.arc(X, cy, r, 0, 6.283); g.fill(); g.fillStyle = '#f3ead8'; g.font = '700 ' + Math.max(8, r) + 'px system-ui'; g.fillText(n.id[0], X, cy + r * .35); }
    g.globalAlpha = 1;
    g.strokeStyle = 'rgba(20,18,14,.8)'; g.lineWidth = 1; g.beginPath(); g.arc(X, cy, r, 0, 6.283); g.stroke();
    scrX[i] = X; scrY[i] = cy; scrR[i] = r;
    if (h > .2) beams.push([n, h, X, cy]);
    if (labelUntil[i] > now || i === hover) labels.push([n.id, X, cy + r + 14, true]);
  }
  // the hologram: the same trails, as light, floating above the sheet
  const flick = .86 + .14 * Math.sin(now / 61) * Math.sin(now / 173);
  g.globalCompositeOperation = 'lighter';
  g.strokeStyle = 'rgba(95,208,200,' + (.16 * flick) + ')'; g.lineWidth = 1; g.beginPath();   // its frame, and four corner beams
  const cs = [[X0 + CW, Y0 + CH], [X1 - CW, Y0 + CH], [X1 - CW, Y1 - CH], [X0 + CW, Y1 - CH]];
  cs.forEach(([x, y], q) => { proj(x, y, HOLO); q ? g.lineTo(P[0], P[1]) : g.moveTo(P[0], P[1]); }); g.closePath();
  for (const [x, y] of cs) { proj(x, y, 0); g.moveTo(P[0], P[1]); proj(x, y, HOLO); g.lineTo(P[0], P[1]); }
  g.stroke();
  for (const [n, h, X, cy] of beams) {                       // a beam from each warm page up to its light
    proj(n.x, n.y, hAt(n.x, n.y) + HOLO);
    const gr = g.createLinearGradient(X, cy, P[0], P[1]); gr.addColorStop(0, 'rgba(255,246,222,0)'); gr.addColorStop(1, 'rgba(160,240,232,' + (.5 * h * flick) + ')');
    g.strokeStyle = gr; g.lineWidth = 1.2; g.beginPath(); g.moveTo(X, cy); g.lineTo(P[0], P[1]); g.stroke();
    g.fillStyle = 'rgba(190,250,244,' + (.75 * h * flick) + ')'; g.beginPath(); g.arc(P[0], P[1], 1.5 + 2.5 * h, 0, 6.283); g.fill();
  }
  for (const [A, B, st, on, w] of live) {
    const al = Math.min(.95, .3 + .2 * st) * flick, col = on ? '95,225,214,' : '255,170,60,';
    g.setLineDash(on ? [] : [w * 1.1, w * 1.7]);
    g.strokeStyle = 'rgba(' + col + (al * .22) + ')'; g.lineWidth = w * 3.2; g.beginPath(); drape(A, B, HOLO, 3); g.stroke();
    g.strokeStyle = 'rgba(' + col + al + ')'; g.lineWidth = Math.max(1, w * .8); g.beginPath(); drape(A, B, HOLO, 3); g.stroke();
  }
  g.setLineDash([]);
  for (const p of fresh) {                                   // a link being drawn, this last day: a flash of light
    const u = 1 - (simT - p.born) / 1.2;
    g.strokeStyle = 'rgba(200,255,250,' + (.6 * u) + ')'; g.lineWidth = 1.4; g.beginPath(); drape(NODES[p.a], NODES[p.b], HOLO, 3); g.stroke();
  }
  if (flash && now < flash.until) {
    const u = .5 + .5 * Math.sin(now / 110);
    g.strokeStyle = 'rgba(255,214,140,' + (.5 + .5 * u) + ')'; g.lineWidth = 3 + 3 * u; g.setLineDash([8, 8]);
    g.beginPath(); drape(NODES[flash.a], NODES[flash.b], HOLO, 3); g.stroke(); g.setLineDash([]);
    labelUntil[flash.a] = labelUntil[flash.b] = now + 100;
  }
  g.globalCompositeOperation = 'source-over';
  // names
  g.textAlign = 'center';
  for (const [name, x, y] of labels) {
    g.font = '700 13px system-ui';
    const w = g.measureText(name).width + 10;
    g.fillStyle = 'rgba(13,11,8,.85)'; g.fillRect(x - w / 2, y - 11, w, 16);
    g.fillStyle = '#f3ead8'; g.fillText(name, x, y + 1);
  }
}
function drawAnt(g, x, y, ang, stepv, s, carry, ink) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  const w = Math.sin(stepv * .9) * 2.2, body = ink ? '#14110c' : '#f3ead8';
  g.strokeStyle = body; g.lineWidth = 1; g.beginPath();
  for (const d of [-1, 1]) { g.moveTo(-1, 0); g.lineTo(-4 + w * d, 5 * d); g.moveTo(1, 0); g.lineTo(1 - w * d, 5.5 * d); g.moveTo(3, 0); g.lineTo(6 + w * d, 4.5 * d); }
  g.moveTo(6, 0); g.lineTo(10, -3); g.moveTo(6, 0); g.lineTo(10, 3); g.stroke();
  g.fillStyle = body;
  g.beginPath(); g.ellipse(-4, 0, 3.4, 2.4, 0, 0, 6.283); g.fill();
  g.beginPath(); g.ellipse(1, 0, 2, 1.5, 0, 0, 6.283); g.fill();
  g.beginPath(); g.arc(5, 0, 1.8, 0, 6.283); g.fill();
  if (carry) { g.fillStyle = '#ffb648'; g.beginPath(); g.arc(8.8, 0, 2.7, 0, 6.283); g.fill(); }
  g.restore();
}

'''

POINTER = r'''let hover = -1, dragging = null;
function pick(mx, my) {
  let best = -1, bd = 1e9;
  for (let i = 0; i < N; i++) { if (!scrR[i]) continue; const dx = scrX[i] - mx, dy = scrY[i] - my, r = Math.max(8, scrR[i]) + 3, d = dx * dx + dy * dy; if (d < r * r && d < bd) { bd = d; best = i; } }
  return best;
}
cv.addEventListener('pointerdown', e => { dragging = { x: e.clientX, y: e.clientY, az: cam.az, el: cam.el, tx: cam.tx, ty: cam.ty, pan: e.shiftKey || e.button === 2 }; cv.setPointerCapture(e.pointerId); cv.classList.add('drag'); lastTouch = performance.now(); });
cv.addEventListener('pointermove', e => {
  if (dragging) {
    lastTouch = performance.now(); $('tip').style.display = 'none';
    const dx = e.clientX - dragging.x, dy = e.clientY - dragging.y;
    if (dragging.pan) { const s0 = F / cam.dist, xr = -dx / s0, yr = -dy / s0 / Math.max(.25, se); cam.tx = dragging.tx + xr * ca + yr * sa; cam.ty = dragging.ty - xr * sa + yr * ca; }
    else { cam.az = dragging.az + dx * .006; cam.el = Math.max(.2, Math.min(1.5, dragging.el + dy * .005)); }
    return;
  }
  hover = pick(e.clientX, e.clientY);
  const tip = $('tip');
  if (hover < 0) { tip.style.display = 'none'; return; }
  const n = NODES[hover], vt = visitTimes[hover]; let v = 0; while (v < vt.length && vt[v] <= simT) v++;
  const last = v ? simT - vt[v - 1] : null;
  tip.innerHTML = '<b>' + n.id + '</b><span>' + n.type + ' · born ' + fmtDate(n.born) + '<br>' + v + ' commits so far' + (last === null ? '' : ' · last ' + (last < 1 ? 'today' : Math.floor(last) + ' days ago')) + '</span>';
  tip.style.display = 'block';
  tip.style.left = Math.min(W - 270, e.clientX + 14) + 'px'; tip.style.top = Math.min(H - 90, e.clientY + 14) + 'px';
});
cv.addEventListener('pointerup', () => { dragging = null; cv.classList.remove('drag'); });
cv.addEventListener('pointerleave', () => { hover = -1; $('tip').style.display = 'none'; });
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('wheel', e => { e.preventDefault(); lastTouch = performance.now(); cam.dist = Math.max(500, Math.min(14000, cam.dist * Math.exp(e.deltaY * .0015))); }, { passive: false });
cv.addEventListener('dblclick', resetCam);
'''

cut('// ---- camera ---', '// ---- step ---', CAMERA)
cut('// ---- draw ---', '// ---- the timeline ---', DRAW)
cut('let hover = -1, dragging = null;', "addEventListener('resize', resize);", POINTER)

rep('<title>Ants on the Topology · Pheromone Trail · a rough</title>', '<title>Ants on the Topology, in relief · Pheromone Trail · a rough</title>')
rep('<h1>Every ant is a commit.<br><em>The trails are what they left.</em></h1>', '<h1>Every ant is a commit.<br><em>Where they walk, the paper rises.</em></h1>')
rep('<span><b>Teal line = ants walking a typed link.</b> Thicker means more ants, more lately.</span>', '<span><b>Teal light = ants walking a typed link.</b> Thicker means more ants, more lately. The light floats above the ink it was drawn from.</span>')
rep('<span><b>Amber dashes = no link there.</b> Two pages worked together anyway: a desire path.</span>', '<span><b>Amber dashes = no link there.</b> Two pages worked together anyway: a desire path.</span></div>\n    <div><span class="sw dot"></span><span><b>Raised, lit paper = pages visited lately.</b> Flat and dim has gone cold.</span></div>\n    <div style="color:var(--dim)"><span class="sw" style="border:0"></span><span>Drag to turn the sheet. Shift-drag to slide it. Scroll to come closer.</span>')
rep('<div><span class="sw dot"></span><span><b>Bright page = visited lately.</b> A dim one has gone cold.</span></div>\n', '')
rep("$('fit').onclick = fit;", "$('fit').onclick = resetCam;")
rep('k: cam.k }', 'd: cam.dist }')
rep('for (let i = 0; i < N; i++) { shown[i] = NODES[i].born <= simT ? 1 : 0; popAt[i] = -1e12; labelUntil[i] = 0; }', 'for (let i = 0; i < N; i++) { shown[i] = NODES[i].born <= simT ? 1 : 0; popAt[i] = -1e12; labelUntil[i] = 0; }\n  snapRelief = true;')
rep('<button id="fit">fit</button>', '<button id="fit">reset view</button>')
open(os.path.join(here, 'src-3d.html'), 'w', encoding='utf-8').write(s)
print('src-3d.html', len(s))
