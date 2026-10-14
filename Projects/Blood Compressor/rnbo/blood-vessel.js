// blood-vessel.js — the artery inside the Blood Compressor device (v0.1, 2026-10-14)
//
// The same three panels as the browser vessel (../stage2-vessel-prototype-v3.html),
// redrawn with mgraphics so they can live in a Max for Live device:
//   pressure lane   blood pressure in (white), pressure past the vessel (red),
//                   overpressure shaded, the amber systolic line you can drag
//   transfer curve  in -> out, with a white dot where the blood is right now
//   the vessel      its opening along x is the gain over the last 5 s; now is the
//                   right edge; baroreceptors in the wall light amber while the
//                   pressure is over and flash white the moment it crosses
//
// Written for [v8ui] (Max 9) but kept to plain ES5 and the core mgraphics calls
// so the same file also loads in [jsui]. No gradients, no set_dash: dashes are
// drawn by hand, so nothing here leans on a call that one engine lacks.
//
// INLET (one, messages):
//   meters <pressure dB> <squeeze dB> <baroreceptors 0|1>   ~30 times a second,
//          from three snapshot~ of rnbo~'s meter outlets. Each one is a frame.
//   threshold <dB> | ratio <x> | knee <dB> | bypass <0|1>     the dial values
//   (any other param name is accepted and ignored, so the dials can fan out
//   to this box and to rnbo~ from the same prepend.)
// OUTLET 0: a float, the new threshold in dB, while you drag the amber line.
//           Wire it into the threshold live.dial, which then drives rnbo~.
//
// UNVERIFIED in Max: rnbo/check-vessel.mjs runs this file in Node against a mock
// mgraphics (renders to SVG) and checks the drag round trip and the curve.

inlets = 1;
outlets = 1;
mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

var HIST = 150;              // frames kept; ~5 s at 30 frames a second
var DB_MIN = -60, DB_MAX = 3; // pressure lane range
var CMIN = -60;              // transfer curve range (to 0 dB)

var P = { threshold: -20, ratio: 4, knee: 6, bypass: 0 };
var detH = [], outH = [], grH = [], thH = [];
for (var i0 = 0; i0 < HIST; i0++) { detH.push(-120); outH.push(-120); grH.push(0); thH.push(-20); }
var nowDet = -120, nowGr = 0, nowBaro = 0, wasOver = 0, baroFlash = 0;
var frame = 0;
var lane = { x: 0, y: 0, w: 1, h: 1 };
var dragging = 0;

// ---- colours: the browser page's palette ------------------------------------
var C = {
    panel: [0.063, 0.063, 0.094], line: [0.110, 0.110, 0.149],
    ink: [0.910, 0.910, 0.941], blood: [0.784, 0.145, 0.298],
    bloodDk: [0.478, 0.094, 0.188], wall: [0.545, 0.290, 0.369],
    baro: [0.961, 0.757, 0.424]
};
function col(c, a) { mgraphics.set_source_rgba(c[0], c[1], c[2], a === undefined ? 1 : a); }

// ---- the static curve: identical maths to blood-compressor.codebox ----------
function curve(x, T, R, K) {
    R = Math.max(1, R); K = Math.max(0, K);
    var lo = T - K / 2, hi = T + K / 2;
    if (K <= 0 || x <= lo) { return x > T ? T + (x - T) / R : x; }
    if (x >= hi) { return T + (x - T) / R; }
    var s = (x - lo) / K, y0 = lo, y1 = T + (K / 2) / R, m0 = K, m1 = K / R;
    var s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * y0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * y1 + (s3 - s2) * m1;
}

// ---- messages -----------------------------------------------------------------
function meters(det, gr, baro) {
    nowDet = det; nowGr = P.bypass >= 0.5 ? 0 : gr; nowBaro = baro >= 0.5 ? 1 : 0;
    detH.push(nowDet); detH.shift();
    outH.push(nowDet + nowGr); outH.shift();
    grH.push(nowGr); grH.shift();
    thH.push(P.threshold); thH.shift();
    if (nowBaro && !wasOver) baroFlash = 1;   // the moment the body notices
    wasOver = nowBaro;
    baroFlash = Math.max(0, baroFlash - 0.2); // ~150 ms white flash at 30 fps
    frame++;
    mgraphics.redraw();
}
function threshold(v) { P.threshold = v; mgraphics.redraw(); }
function ratio(v) { P.ratio = v; mgraphics.redraw(); }
function knee(v) { P.knee = v; mgraphics.redraw(); }
function bypass(v) { P.bypass = v; mgraphics.redraw(); }
function anything() { /* attack, release, makeup, rmsTime: the vessel doesn't draw them */ }
function bang() { mgraphics.redraw(); }

// ---- geometry -----------------------------------------------------------------
function dbToY(db) { db = Math.max(DB_MIN, Math.min(DB_MAX, db)); return lane.y + lane.h * (1 - (db - DB_MIN) / (DB_MAX - DB_MIN)); }
function yToDb(y) { return DB_MAX - (y - lane.y) / lane.h * (DB_MAX - DB_MIN); }
function layout(w, h) {
    var pad = 4;
    var topH = Math.round(h * 0.5) - pad;
    var cS = Math.min(topH, Math.round(w * 0.24));
    lane = { x: pad, y: pad, w: w - cS - pad * 3, h: topH };
    return { pad: pad, topH: topH, cS: cS, cX: lane.x + lane.w + pad, cY: pad };
}

// ---- drawing helpers ----------------------------------------------------------
function hline(x0, x1, y) { mgraphics.move_to(x0, y); mgraphics.line_to(x1, y); mgraphics.stroke(); }
function dashed(x0, y0, x1, y1, on, off) {
    var dx = x1 - x0, dy = y1 - y0, L = Math.sqrt(dx * dx + dy * dy);
    if (L <= 0) return;
    for (var t = 0; t < L; t += on + off) {
        var e = Math.min(L, t + on);
        mgraphics.move_to(x0 + dx * t / L, y0 + dy * t / L);
        mgraphics.line_to(x0 + dx * e / L, y0 + dy * e / L);
    }
    mgraphics.stroke();
}
function dot(x, y, r) { mgraphics.arc(x, y, r, 0, Math.PI * 2); mgraphics.fill(); }
function label(x, y, s) { mgraphics.move_to(x, y); mgraphics.show_text(s); }

// ---- paint --------------------------------------------------------------------
function paint() {
    var sz = mgraphics.size, w = sz[0], h = sz[1];
    var g = layout(w, h);
    mgraphics.select_font_face("Arial");
    mgraphics.set_font_size(8);
    mgraphics.set_line_width(1);

    col(C.panel); mgraphics.rectangle(0, 0, w, h); mgraphics.fill();

    // ---- PANEL 1: pressure lane ----
    col(C.line); mgraphics.rectangle(lane.x, lane.y, lane.w, lane.h); mgraphics.stroke();
    for (var db = 0; db > DB_MIN; db -= 12) {
        col(C.ink, 0.12); hline(lane.x, lane.x + lane.w, dbToY(db));
        col(C.ink, 0.4); label(lane.x + 2, dbToY(db) + 8, db + " dB");
    }
    var step = lane.w / (HIST - 1), i;
    // overpressure: between the threshold and the input trace, where the input is above it
    col(C.blood, 0.35);
    for (i = 0; i < HIST - 1; i++) {
        var t = thH[i];
        if (detH[i] > t || detH[i + 1] > t) {
            var xa = lane.x + i * step, xb = xa + step, ty = dbToY(t);
            mgraphics.move_to(xa, ty);
            mgraphics.line_to(xa, dbToY(Math.max(detH[i], t)));
            mgraphics.line_to(xb, dbToY(Math.max(detH[i + 1], t)));
            mgraphics.line_to(xb, ty);
            mgraphics.close_path(); mgraphics.fill();
        }
    }
    trace(detH, C.ink, 1, 0.8);
    trace(outH, C.blood, 1.6, 1);
    if (P.knee > 0) {
        col(C.baro, 0.07);
        var ky = dbToY(P.threshold + P.knee / 2);
        mgraphics.rectangle(lane.x, ky, lane.w, dbToY(P.threshold - P.knee / 2) - ky); mgraphics.fill();
    }
    var thY = dbToY(P.threshold);
    col(C.baro); mgraphics.set_line_width(dragging ? 2.5 : 1.5);
    dashed(lane.x, thY, lane.x + lane.w, thY, 6, 3);
    mgraphics.set_line_width(1);
    dot(lane.x + lane.w - 6, thY, 4);
    label(Math.max(lane.x + 2, lane.x + lane.w - 150), thY - 4, "SYSTOLIC " + P.threshold.toFixed(1) + " dB  drag me");

    // ---- PANEL 2: transfer curve ----
    var cX = g.cX, cY = g.cY, cS = g.cS;
    function mX(d) { return cX + cS * (Math.max(CMIN, Math.min(0, d)) - CMIN) / (0 - CMIN); }
    function mY(d) { return cY + cS * (1 - (Math.max(CMIN, Math.min(0, d)) - CMIN) / (0 - CMIN)); }
    col(C.line); mgraphics.rectangle(cX, cY, cS, cS); mgraphics.stroke();
    col(C.ink, 0.2); mgraphics.move_to(mX(CMIN), mY(CMIN)); mgraphics.line_to(mX(0), mY(0)); mgraphics.stroke();
    col(C.blood); mgraphics.set_line_width(1.6);
    for (var d = CMIN; d <= 0; d += 0.5) {
        var cx = mX(d), cyy = mY(curve(d, P.threshold, P.ratio, P.knee));
        if (d === CMIN) mgraphics.move_to(cx, cyy); else mgraphics.line_to(cx, cyy);
    }
    mgraphics.stroke(); mgraphics.set_line_width(1);
    col(C.baro); dashed(mX(P.threshold), cY, mX(P.threshold), cY + cS, 3, 2);
    if (nowDet > CMIN) { col([1, 1, 1]); dot(mX(nowDet), mY(nowDet + nowGr), 2.5); }
    col(C.ink, 0.55); label(cX + 2, cY + cS - 3, P.ratio.toFixed(1) + ":1  knee " + P.knee.toFixed(0));

    // ---- PANEL 3: the vessel ----
    var vTop = g.topH + g.pad * 2 + 2, vH = h - vTop - g.pad;
    var cyv = vTop + vH / 2 + 2, baseR = vH * 0.32;
    var x0 = lane.x, x1 = w - g.pad;
    function rAt(k) { return baseR * (0.18 + 0.82 * Math.pow(10, grH[k] / 20)); } // width IS the gain
    function xAt(k) { return x0 + (x1 - x0) * k / (HIST - 1); }
    col(C.wall, 0.18); mgraphics.rectangle(x0, cyv - baseR - 8, x1 - x0, 2 * baseR + 16); mgraphics.fill();
    // walls thicken as the smooth muscle contracts
    col(C.wall);
    wallBand(-1, xAt, rAt, cyv, baseR + 4);
    wallBand(1, xAt, rAt, cyv, baseR + 4);
    // lumen: dark rim, bright core (two passes stand in for the browser's gradient)
    col(C.bloodDk); lumen(xAt, rAt, cyv, 1.0);
    col(C.blood); lumen(xAt, rAt, cyv, 0.6);
    // corpuscles ride the lumen
    col([1, 0.80, 0.84], 0.55);
    for (var k = 0; k < 24; k++) {
        var ph = (frame / 30 * 0.12 + k / 24) % 1;
        var ik = Math.min(HIST - 1, Math.floor(ph * (HIST - 1)));
        dot(xAt(ik), cyv + Math.sin(k * 2.7) * rAt(ik) * 0.7, 1.4);
    }
    // eight baroreceptors in the wall: amber while over, white flash at the crossing
    var over = nowBaro && P.bypass < 0.5;
    for (k = 0; k < 8; k++) {
        var ib = Math.round((k + 0.5) / 8 * (HIST - 1)), bx = xAt(ib);
        var rr = 2 + (over ? 1 : 0) + 2 * baroFlash;
        if (baroFlash > 0) col([1, 1, 1], 0.5 + 0.5 * baroFlash); else col(C.baro, over ? 0.85 : 0.22);
        dot(bx, cyv - rAt(ib) - 2, rr);
        dot(bx, cyv + rAt(ib) + 2, rr);
    }
    col(C.ink, 0.55);
    label(x0 + 2, vTop + 6, "vessel  width = gain, last 5 s  constriction " + nowGr.toFixed(1) + " dB" + (P.bypass >= 0.5 ? "  (bypassed)" : ""));
    label(x1 - 22, h - 3, "now");
}
function trace(arr, c, lw, a) {
    var step = lane.w / (HIST - 1);
    col(c, a); mgraphics.set_line_width(lw);
    for (var i = 0; i < HIST; i++) {
        var x = lane.x + i * step, y = dbToY(arr[i]);
        if (i) mgraphics.line_to(x, y); else mgraphics.move_to(x, y);
    }
    mgraphics.stroke(); mgraphics.set_line_width(1);
}
function wallBand(sign, xAt, rAt, cy, outer) {
    var i;
    for (i = 0; i < HIST; i++) { if (i) mgraphics.line_to(xAt(i), cy + sign * outer); else mgraphics.move_to(xAt(i), cy + sign * outer); }
    for (i = HIST - 1; i >= 0; i--) mgraphics.line_to(xAt(i), cy + sign * rAt(i));
    mgraphics.close_path(); mgraphics.fill();
}
function lumen(xAt, rAt, cy, f) {
    var i;
    for (i = 0; i < HIST; i++) { if (i) mgraphics.line_to(xAt(i), cy - rAt(i) * f); else mgraphics.move_to(xAt(i), cy - rAt(i) * f); }
    for (i = HIST - 1; i >= 0; i--) mgraphics.line_to(xAt(i), cy + rAt(i) * f);
    mgraphics.close_path(); mgraphics.fill();
}

// ---- drag the systolic line ---------------------------------------------------
function setFromY(y) {
    var v = Math.max(-60, Math.min(0, Math.round(yToDb(y) * 2) / 2));
    P.threshold = v;
    outlet(0, v);
    mgraphics.redraw();
}
function onclick(x, y) {
    if (x >= lane.x && x <= lane.x + lane.w && y >= lane.y - 4 && y <= lane.y + lane.h + 4) { dragging = 1; setFromY(y); }
}
function ondrag(x, y, but) {
    if (!but) { dragging = 0; mgraphics.redraw(); return; }
    if (dragging) setFromY(y);
}
