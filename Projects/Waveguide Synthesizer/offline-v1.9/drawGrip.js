// ---- v1.9: the bow, made visible ----
// The worklet cuts one string cycle into 96 slices on the strobe's own phase
// clock and keeps, for each, the string's true speed at the bow point and how
// fully the hair is gripping there. The chart draws that cycle; a cursor marks
// the instant the string on screen is showing, so the dot on the string, the
// chart's cursor and the corner arriving at the bow all agree.
//   bow speed    -> the dashed line on the chart: the speed the hair drags at.
//   bow force    -> the grip window on the friction curve: how far the string
//                   can stray from the bow's speed and still be held.
//   bow position -> where the bow sits, and so when in the cycle the corner
//                   reaches it.
const gcv = $('gripCv'), gx = gcv.getContext('2d'), lead = $('lead'), lx = lead.getContext('2d');
let gripAt = 1, gripCursor = 0;
function gripSummary(t) {
  const N = t.grip.length; let hold = 0, lets = 0;
  for (let i = 0; i < N; i++) { const h = t.grip[i] >= 0.98; if (h) hold++; if (!h && t.grip[(i + N - 1) % N] >= 0.98) lets++; }
  return { holdPct: Math.round(100 * hold / N), lets };
}
function gripWords(t, sm) {
  if (t.env < 0.6) return bowing ? 'the bow is settling in' : 'the bow is lifting off';
  if (sm.lets === 0 && sm.holdPct > 95) return 'pinned: the hair never lets go. too much force: the string under the bow cannot move';
  if (sm.lets === 0) return 'skating: the hair never catches the string';
  if (sm.lets === 1) return 'singing: the hair holds ' + sm.holdPct + '% of each cycle, lets go once';
  return 'breaking up: the hair lets go ' + sm.lets + ' times a cycle';
}
// speed axis: above zero linear (the bow's own speeds), below zero squashed,
// because the string flies back up to ~18 times faster than the bow drags it
const vy = (v, top, mid, bot) => v >= 0 ? mid - (mid - top) * Math.min(1, v / 1.25) : mid + (bot - mid) * Math.min(1, Math.sqrt(-v / 18));
function drawGrip(bx, byTop, dt) {
  const t = latestBow, W = gcv.width, H = gcv.height;
  const on = !!t && view.mode !== 'replay';
  $('grip').classList.toggle('idle', !on);
  gx.clearRect(0, 0, W, H);
  const live = view.mode === 'live';
  gripCursor = live ? clockPhase : latestPhase;
  const N = t ? t.grip.length : 96, ci = Math.min(N - 1, Math.floor(gripCursor * N));
  gripAt = on ? t.grip[ci] : 1;
  // the contact dot on the string
  gripDot.visible = spark.visible = on;
  if (on) {
    const hold = gripAt >= 0.98;
    gripDot.position.set(bx, byTop, 0.02);
    gripDot.scale.setScalar(hold ? 1 : 0.45);
    gripMat.color.set(hold ? 0xffb070 : 0x5a2010);
    sparkMat.opacity = hold ? 0 : 0.95;
    const sl = Math.min(0.35, 0.06 + 0.02 * Math.abs(t.vel[ci] / Math.max(1e-6, t.bowV)));
    spark.scale.y = sl; spark.position.set(bx, byTop - sl / 2, 0.02);
    bowMat.emissive.copy(WARM).multiplyScalar((hold ? 0.55 : 0.05) + 0.6 * fl('bow'));
  }
  const L = 92, R = W - 12, S0 = 10, S1 = 32, P0 = 46, P1 = 222, F0 = 246, F1 = H - 30;
  gx.font = '20px ui-monospace, Menlo, monospace'; gx.textBaseline = 'middle';
  gx.fillStyle = 'rgba(207,211,216,0.7)';
  gx.fillText('hair', 4, (S0 + S1) / 2);
  gx.fillText('string', 4, (P0 + P1) / 2 - 12); gx.fillText('speed', 4, (P0 + P1) / 2 + 12);
  gx.fillText('grip', 4, (F0 + F1) / 2);
  if (!t) { $('gripState').textContent = 'hold B to bow, and watch the hair catch and let go'; drawLead(bx, byTop, false); return; }
  const sm = gripSummary(t);
  $('gripState').textContent = view.mode === 'replay' ? 'the chart follows the strobe and live views' : gripWords(t, sm);
  const xAt = (i) => L + (R - L) * i / N;
  // strip: amber where the hair holds, dark where it slips
  const fs = fl('gSlip');
  for (let i = 0; i < N; i++) {
    const h = t.grip[i] >= 0.98;
    gx.fillStyle = h ? 'rgba(232,184,74,' + (0.55 + 0.4 * fs) + ')' : (fs > 0.05 ? 'rgba(255,241,200,' + (0.25 + 0.6 * fs) + ')' : '#3a1a12');
    gx.fillRect(xAt(i), S0, (R - L) / N + 0.6, S1 - S0);
  }
  // the string's speed at the bow over one cycle, against the bow's own
  const y0 = P0 + (P1 - P0) * 0.42;
  gx.strokeStyle = '#2a323b'; gx.lineWidth = 2; gx.beginPath(); gx.moveTo(L, y0); gx.lineTo(R, y0); gx.stroke();
  gx.fillStyle = 'rgba(207,211,216,0.5)'; gx.fillText('still', R - 52, y0 + 14);
  gx.fillText('flies back', L + 4, P1 - 8);
  const ySp = vy(t.bowV, P0, y0, P1), fsp = fl('gSpeed');
  gx.setLineDash([10, 8]); gx.strokeStyle = fsp > 0.05 ? '#ffb070' : 'rgba(232,184,74,0.85)'; gx.lineWidth = 2 + 3 * fsp;
  gx.beginPath(); gx.moveTo(L, ySp); gx.lineTo(R, ySp); gx.stroke(); gx.setLineDash([]);
  gx.fillStyle = fsp > 0.05 ? '#ffb070' : '#e8b84a'; gx.fillText('bow speed', R - 118, Math.max(P0 + 4, ySp - 14));
  gx.strokeStyle = '#' + stringMat.color.getHexString(); gx.lineWidth = 3; gx.beginPath();
  for (let i = 0; i < N; i++) { const yy = vy(t.vel[i], P0, y0, P1); if (i) gx.lineTo(xAt(i + 0.5), yy); else gx.moveTo(xAt(0.5), yy); }
  gx.stroke();
  // cursor: the instant the string on screen is showing
  const cx = L + (R - L) * gripCursor;
  gx.strokeStyle = 'rgba(241,230,212,0.9)'; gx.lineWidth = 2; gx.beginPath(); gx.moveTo(cx, S0 - 4); gx.lineTo(cx, P1); gx.stroke();
  // friction: how fully the hair grips (up) against how far the string's
  // speed strays from the bow's (right, log). The force sets the window.
  const xs = (u) => L + (R - L) * (Math.log10(u) + 2) / 5;           // 0.01 .. 1000
  const win = 0.25 / t.slopeRef, fw = fl('gWindow');
  gx.fillStyle = 'rgba(232,184,74,' + (0.13 + 0.35 * fw) + ')';
  gx.fillRect(L, F0, Math.max(0, Math.min(R, xs(Math.max(0.01, win))) - L), F1 - F0);
  gx.strokeStyle = '#e8e2d4'; gx.lineWidth = 2; gx.beginPath();
  for (let k = 0; k <= 120; k++) {
    const u = Math.pow(10, -2 + 5 * k / 120), g = Math.min(1, Math.pow(u * t.slopeRef + 0.75, -4));
    const xx = xs(u), yy = F1 - (F1 - F0) * g; if (k) gx.lineTo(xx, yy); else gx.moveTo(xx, yy);
  }
  gx.stroke();
  const us = Math.min(1000, Math.max(0.01, Math.abs(t.slip[ci]))), gd = Math.min(1, Math.pow(us * t.slopeRef + 0.75, -4));
  gx.fillStyle = gripAt >= 0.98 ? '#ffb070' : '#fff1c8';
  gx.beginPath(); gx.arc(xs(us), F1 - (F1 - F0) * gd, 7, 0, 2 * Math.PI); gx.fill();
  gx.fillStyle = 'rgba(207,211,216,0.6)';
  gx.fillText('holds', L + 6, F0 + 12); gx.fillText('mismatch →', R - 136, F1 + 16);
  gx.fillStyle = fw > 0.05 ? '#ffb070' : 'rgba(232,184,74,0.85)';
  gx.fillText('grip window (force)', L + 6, F1 + 16);
  drawLead(bx, byTop, true);
}
// a thread from the chart to the point where hair meets string
function drawLead(bx, by, on) {
  const W = window.innerWidth, H = window.innerHeight, dpr = window.devicePixelRatio || 1;
  if (lead.width !== Math.round(W * dpr) || lead.height !== Math.round(H * dpr)) {
    lead.width = Math.round(W * dpr); lead.height = Math.round(H * dpr); lead.style.width = W + 'px'; lead.style.height = H + 'px'; }
  lx.setTransform(dpr, 0, 0, dpr, 0, 0); lx.clearRect(0, 0, W, H);
  if (!on) return;
  const v = new THREE.Vector3(bx, by, 0).project(camera);
  const px = (v.x + 1) / 2 * W, py = (1 - v.y) / 2 * H;
  const box = $('grip').getBoundingClientRect();
  lx.strokeStyle = gripAt >= 0.98 ? 'rgba(232,184,74,0.6)' : 'rgba(255,241,200,0.4)'; lx.lineWidth = 1; lx.setLineDash([3, 4]);
  lx.beginPath(); lx.moveTo(box.left + 20, box.bottom); lx.lineTo(px, py - 8); lx.stroke(); lx.setLineDash([]);
}
