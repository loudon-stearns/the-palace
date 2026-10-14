// ---- v1.10: even stiffness, made visible: the overtone ladder ----
// The worklet works out where this loop really puts each overtone (the
// frequency at which a trip round the loop takes exactly n of its periods)
// and listens at each one, at the pickup, ten or so times a second. The
// ladder draws both: a dashed rung where a perfectly flexible string would
// put overtone n (n times the note), and an amber bar where this string
// puts it, as tall as it is ringing now. Stiffness slides the bars right of
// their rungs, the high ones furthest: the overtones run sharp.
//   stiffness  -> how far the bars lean off the dashed grid.
//   pitch      -> nothing on the ladder: the same stiffness leans the same
//                 cents at every note, which is the point of v1.5.
//   brightness -> how fast the high bars fall after a pluck.
const lcv = $('ladderCv'), lgx = lcv.getContext('2d');
let ladder = null, ladLev = null;             // ladder: { f0, freqs[], cents[] }; ladLev: shown dB per bar
function ladderWords(c8) {
  if (c8 === null) return 'pluck the string (click it), and watch its overtones';
  if (c8 < 3) return 'harmonic: each overtone on its dashed rung, like gut or nylon';
  if (c8 < 25) return 'a little stiff: the high overtones lean sharp, like a piano’s middle';
  if (c8 < 120) return 'stiff: the overtones pull apart, like a piano’s outer octaves';
  return 'very stiff: no longer a series. a struck metal bar, toward a bell';
}
function drawLadder(dt) {
  const W = lcv.width, H = lcv.height, f = fl('ladder');
  lgx.clearRect(0, 0, W, H);
  const lv = latestLadder;
  $('ladder').classList.toggle('lit', f > 0.05);
  if (!ladder) { $('ladder').classList.toggle('idle', f < 0.05); return; }
  const M = ladder.freqs.length, f0 = ladder.f0;
  if (!ladLev || ladLev.length !== M) ladLev = new Float32Array(M).fill(-90);
  for (let i = 0; i < M; i++) {
    const t = lv && lv.db.length === M ? lv.db[i] : -90;
    ladLev[i] = t > ladLev[i] ? t : Math.max(t, ladLev[i] - 30 * dt);    // rise at once, fall at 30 dB a second, so a pluck can be read after it dies
  }
  const on = ladLev.some(d => d > -90);
  $('ladder').classList.toggle('idle', !on && f < 0.05);
  const i8 = Math.min(8, M) - 1;
  $('ladderState').textContent = on || f > 0.05 ? ladderWords(i8 >= 1 ? ladder.cents[i8] : 0) : ladderWords(null);
  const L = 14, R = W - 14, T = 8, B = H - 64;
  const fmax = Math.max(ladder.freqs[M - 1], M * f0) * 1.04;
  const xf = (hz) => L + (R - L) * hz / fmax;
  lgx.font = '20px ui-monospace, Menlo, monospace'; lgx.textBaseline = 'middle'; lgx.textAlign = 'center';
  // the dashed rungs: a perfectly flexible string, overtone n at n x the note
  lgx.setLineDash([6, 6]); lgx.lineWidth = 2;
  for (let n = 1; n <= M; n++) {
    lgx.strokeStyle = 'rgba(207,211,216,' + (0.28 + 0.2 * f) + ')';
    const x = xf(n * f0); lgx.beginPath(); lgx.moveTo(x, T); lgx.lineTo(x, B); lgx.stroke();
  }
  lgx.setLineDash([]);
  lgx.strokeStyle = '#2a323b'; lgx.beginPath(); lgx.moveTo(L, B); lgx.lineTo(R, B); lgx.stroke();
  // the bars: where this string puts each overtone, as tall as it rings
  // heights are relative to the loudest overtone now, 48 dB from top to floor,
  // so the ladder reads at any loudness; a stub always marks where each sits
  let top = -90; for (let i = 0; i < M; i++) top = Math.max(top, ladLev[i]);
  const bw = Math.max(5, Math.min(14, 0.5 * (R - L) * f0 / fmax));
  for (let i = 0; i < M; i++) {
    const n = i + 1, x = xf(ladder.freqs[i]), xr = xf(n * f0);
    const u = top > -80 ? Math.max(0, Math.min(1, (ladLev[i] - top + 48) / 48)) : 0;
    const h = (B - T) * Math.max(0.1, u);
    // the lean: a slanted line from the top of the dashed rung down to the
    // bar's foot, so each bar is tied to the place it left
    if (x - xr > 2) {
      lgx.strokeStyle = 'rgba(255,176,112,' + (0.45 + 0.45 * f) + ')'; lgx.lineWidth = 2;
      lgx.beginPath(); lgx.moveTo(xr, T); lgx.lineTo(x, B); lgx.stroke();
    }
    lgx.fillStyle = f > 0.05 ? '#ffb070' : '#e8b84a';
    lgx.globalAlpha = 0.5 + 0.5 * u;
    lgx.fillRect(x - bw / 2, B - h, bw, h); lgx.globalAlpha = 1;
  }
  // labels: the overtone number under its rung, and how sharp it runs
  // (a label too close to the last one drawn is skipped, so a squeezed ladder stays legible)
  let lastN = -1e9, lastC = -1e9;
  for (const n of [1, 2, 4, 8, 16]) {
    if (n > M) break;
    if (xf(n * f0) - lastN > 26) { lgx.fillStyle = 'rgba(207,211,216,0.6)'; lgx.fillText(String(n), xf(n * f0), B + 26); lastN = xf(n * f0); }
    if (n > 1 && xf(ladder.freqs[n - 1]) - lastC > 84) {
      const c = ladder.cents[n - 1]; lastC = xf(ladder.freqs[n - 1]);
      lgx.fillStyle = Math.abs(c) < 3 ? 'rgba(207,211,216,0.45)' : (f > 0.05 ? '#ffb070' : '#e8b84a');
      lgx.fillText((c >= 0 ? '+' : '−') + (Math.abs(c) < 9.5 ? Math.abs(c).toFixed(1) : Math.round(Math.abs(c))) + '¢',
        Math.min(R - 30, Math.max(L + 30, xf(ladder.freqs[n - 1]))), B + 50);
    }
  }
  lgx.textAlign = 'left';
}
