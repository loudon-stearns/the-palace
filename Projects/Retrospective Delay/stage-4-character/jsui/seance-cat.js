// seance-cat.js — JSUI character for Retrospective Delay
// Three inputs, each one fact from the gen~ device (../face/face.genexpr):
//   set_gain  f   the knob as you HEAR it (gen~ out3, slewed)    -> which pose
//   presence  f   is anything on the tape at the read head (out4) -> ectoplasm
//   holding   f   is the tape keeping the past right now (out5)   -> the candle
// A bare float still sets the gain, so the old one-knob wiring keeps working.
//
// Three gorey-ink pose plates crossfade across the gain range:
//   gain 0.00–0.25  dormant    (curled, sleeping)
//   gain 0.25–0.75  awakening  (rising, reaching)
//   gain 0.75–1.00  triumphant (arms out, stars in eyes)
// Pose plates are the greenlit gorey-ink refined renders: opaque pen-and-ink
// on parchment, 1024². Ectoplasm and candle are drawn live on top.
// Drop in a [jsui] box, @rect 0 0 240 240. Mirrored in ../face/face_model.py,
// which films it; change one, change the other.

inlets = 1;
outlets = 1;
mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

var gain = 0.0;
var tapeLevel = 0.0;   // presence
var keeping = 0.0;     // holding
var t = 0;             // ectoplasm clock

// Pose plates — Max searches the patcher's folder + the file-preferences
// search path. The PNGs sit beside this .js file.
var poseDormant    = new Image("pose-dormant.png");
var poseAwakening  = new Image("pose-awakening.png");
var poseTriumphant = new Image("pose-triumphant.png");

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

function set_gain(v) { gain = clamp01(v); mgraphics.redraw(); }
function msg_float(v) { set_gain(v); }
function presence(v) { tapeLevel = clamp01(v); }
function holding(v) { keeping = clamp01(v); }
function bang() { mgraphics.redraw(); }

function ss(edge0, edge1, x) {
    var u = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return u * u * (3 - 2 * u);
}

function paint() {
    t += 0.04;
    var w = box.rect[2] - box.rect[0];
    var h = box.rect[3] - box.rect[1];

    mgraphics.set_source_rgb(0.86, 0.82, 0.72);
    mgraphics.rectangle(0, 0, w, h);
    mgraphics.fill();

    var wAwa = ss(0.15, 0.40, gain) * (1 - ss(0.60, 0.85, gain));
    var wTri = ss(0.60, 0.85, gain);

    // Painter's order: the plate fading IN goes on top of the one fading out.
    drawPose(poseDormant,    w, h, 1.0);
    if (wAwa + wTri > 0.005) drawPose(poseAwakening,  w, h, Math.min(1, wAwa + wTri));
    if (wTri > 0.005)        drawPose(poseTriumphant, w, h, wTri);

    // Lights-down vignette: heavy while the ghost is dormant.
    drawVignette(w, h, 0.55 * (1 - gain));

    // Ectoplasm is what is ON THE TAPE, not where the knob is. Drawn over the
    // vignette, so a sleeping cat still has wisps around it: the past is kept,
    // just not summoned. Knob up over an empty tape: the cat reaches, nothing comes.
    var ecto = tapeLevel * (0.35 + 0.65 * Math.max(wAwa, wTri));
    if (ecto > 0.01) drawEctoplasm(w, h, ecto);

    if (keeping > 0.02) drawCandle(w, h, keeping);
    else drawCandle(w, h, 0);
}

// Max's mgraphics ignores the source colour for image_surface_draw, so an
// alpha set with set_source_rgba does nothing. set_source_surface +
// paint_with_alpha is the path that actually blends.
function drawPose(img, w, h, a) {
    if (!img) return;
    a = clamp01(a);
    if (a <= 0.004) return;
    var iw = img.size[0], ih = img.size[1];
    mgraphics.save();
    mgraphics.rectangle(0, 0, w, h);
    mgraphics.clip();
    mgraphics.scale(w / iw, h / ih);   // plates are square; box should be too
    mgraphics.set_source_surface(img, 0, 0);
    mgraphics.paint_with_alpha(a);
    mgraphics.restore();
}

function strand(w, h, i) {
    var cx = w * 0.5, cy = h * 0.55;
    var phase = t + i * 1.2566;
    var r = w * (0.16 + 0.035 * i);
    mgraphics.move_to(cx + Math.cos(phase) * r, cy + Math.sin(phase) * r * 0.6);
    mgraphics.curve_to(cx, cy - h * 0.15, cx + w * 0.10, cy - h * 0.05,
                       cx + Math.cos(phase + 1.2) * r * 1.3, cy + Math.sin(phase + 1.2) * r * 0.6);
}

function drawEctoplasm(w, h, a) {
    // Pale bone, not neon — cyan is a palace never. Two passes, wide and faint
    // then narrow and bright: a glow without a blur.
    for (var i = 0; i < 5; i++) {
        strand(w, h, i);
        mgraphics.set_source_rgba(0.93, 0.90, 0.82, 0.18 * a);
        mgraphics.set_line_width(14 * w / 360);
        mgraphics.stroke();
        strand(w, h, i);
        mgraphics.set_source_rgba(0.96, 0.94, 0.88, 0.75 * a);
        mgraphics.set_line_width(3 * w / 360);
        mgraphics.stroke();
    }
}

// The candle: lit while the tape is keeping the past, out while it listens to you.
function drawCandle(w, h, a) {
    var bx = w * 0.08, by = h * 0.80;
    mgraphics.rectangle(bx, by, w * 0.022, h * 0.10);
    mgraphics.set_source_rgb(0.87, 0.82, 0.72);
    mgraphics.fill_preserve();
    mgraphics.set_source_rgb(0.12, 0.10, 0.09);
    mgraphics.set_line_width(1);
    mgraphics.stroke();
    if (a <= 0) return;
    var fl = 1 + 0.12 * Math.sin(t * 7.3) + 0.06 * Math.sin(t * 13.1);
    var fx = bx + w * 0.011, fy = by - h * 0.03 * fl;
    var rw = w * 0.010, rh = h * 0.025 * fl;
    mgraphics.set_source_rgba(0.94, 0.75, 0.35, 0.24 * a);
    mgraphics.ellipse(fx - rw * 3, fy - rh * 2, rw * 6, rh * 4);
    mgraphics.fill();
    mgraphics.set_source_rgba(0.96, 0.77, 0.38, a);
    mgraphics.ellipse(fx - rw, fy - rh, rw * 2, rh * 2);
    mgraphics.fill();
}

function drawVignette(w, h, a) {
    if (a <= 0.01) return;
    mgraphics.set_source_rgba(0.06, 0.05, 0.08, a);
    mgraphics.rectangle(0, 0, w, h);
    mgraphics.fill();
}

// animate while anything is alive: a summoned ghost, a kept tape, a lit candle
var animTask = new Task(function() {
    if (gain > 0.01 || tapeLevel > 0.01 || keeping > 0.02) mgraphics.redraw();
}, this);
animTask.interval = 33;
animTask.repeat(-1);
