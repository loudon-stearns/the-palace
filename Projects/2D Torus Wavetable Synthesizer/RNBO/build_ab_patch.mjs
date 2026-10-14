// Builds torus-ab.maxpat — the A/B harness README — RNBO Prototype asks
// for, already wired: the codebox against Max's own [2d.wave~], on one
// buffer, with the difference metered. UNVERIFIED: written without Max.
// Pattern adopted from Projects/Haptic Handwheel/max/build_host_patch.mjs.
//   node build_ab_patch.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const wavDir = path.resolve(here, '../Wavetables');
const appversion = { major: 8, minor: 6, revision: 0, architecture: 'x64', modernui: 1 };

function graph() {
  const boxes = [], lines = []; let n = 0;
  const obj = (text, x, y, ins, outs, w = 0, extra = {}) => {
    const id = `obj-${++n}`;
    const mc = extra.maxclass || 'newobj';
    const box = { id, maxclass: mc, numinlets: ins, numoutlets: outs,
      outlettype: extra.outlettype || Array(outs).fill(''), patching_rect: [x, y, w || Math.max(40, text.length * 7 + 16), extra.h || 22] };
    if (['newobj', 'message', 'comment'].includes(mc)) box.text = text;
    for (const k of ['maxclass', 'outlettype', 'h']) delete extra[k];
    Object.assign(box, extra); boxes.push({ box }); return id;
  };
  const wire = (a, ao, b, bi = 0) => lines.push({ patchline: { source: [a, ao], destination: [b, bi] } });
  return { boxes, lines, obj, wire,
    msg: (t, x, y, w) => obj(t, x, y, 2, 1, w, { maxclass: 'message' }),
    note: (t, x, y, w = 300) => obj(t, x, y, 1, 0, w, { maxclass: 'comment', linecount: Math.ceil(t.length * 7 / w) }),
    sig: (t, x, y, ins, outs = 1, w) => obj(t, x, y, ins, outs, w, { outlettype: Array(outs).fill('signal') }),
    flo: (x, y, w = 70) => obj('', x, y, 1, 2, w, { maxclass: 'flonum', outlettype: ['', 'bang'], format: 6 }) };
}

// an rnbo~ whose inside is one codebox~, its signal inputs, one out~ and
// the buffer~ that binds to the parent's tablebuf
function rnbo(G, file, x, y, ins) {
  const R = graph();
  const code = fs.readFileSync(path.join(here, file), 'utf8');
  R.note(`${file} — pasted verbatim. If this rnbo~ will not compile, make a fresh rnbo~, drop in a codebox~ and paste the file.`, 20, 10, 520);
  R.obj('buffer~ tablebuf', 20, 50, 1, 2, 120, { outlettype: ['', ''] });
  R.note('binds to the parent patch\'s buffer~ tablebuf', 150, 50, 300);
  const inl = Array.from({ length: ins }, (_, i) => R.sig(`in~ ${i + 1}`, 20 + i * 120, 90, 1));
  const cb = R.obj('', 20, 130, Math.max(1, ins), 1, 520, { maxclass: 'codebox~', outlettype: ['signal'], h: 300,
    code, fontface: 0, fontname: '<Monospaced>', fontsize: 12 });
  inl.forEach((id, i) => R.wire(id, 0, cb, i));
  const out = R.obj('out~ 1', 20, 450, 1, 0, 60);
  R.wire(cb, 0, out);
  return G.obj('rnbo~', x, y, Math.max(1, ins), 2, 70, { outlettype: ['signal', 'list'],
    patcher: { fileversion: 1, appversion, classnamespace: 'rnbo', rect: [100, 100, 600, 520],
      default_fontsize: 12, default_fontface: 0, default_fontname: 'Arial', boxes: R.boxes, lines: R.lines } });
}

const G = graph(); const { obj, wire, msg, note, sig, flo } = G;

note('2D TORUS WAVETABLE — the codebox against 2d.wave~. Built without Max: nothing here has been opened yet. Set the engine to 48 kHz, vector 64.', 20, 10, 900);

// ── 1 · the surface ─────────────────────────────────────────────
note('1 · the surface. Penrose loads on open; click another to swap. Every path reads this one buffer.', 20, 50, 560);
const pen = path.join(wavDir, '15_penrose_lattice.wav');
const buf = obj(`buffer~ tablebuf "${pen}"`, 20, 80, 1, 2, 300, { outlettype: ['float', 'bang'] });
const comb = obj(`combine "${wavDir}/" s .wav @triggers 1`, 340, 160, 3, 1, 300);
const repl = obj('prepend replace', 650, 160, 2, 1, 110);
wire(comb, 0, repl); wire(repl, 0, buf);
['10_membrane', '11_chladni_ghost', '12_theta_surface', '13_stiff_string', '14_knot_shadow', '15_penrose_lattice',
 '16_kuramoto_bloom', '17_matern_field', '18_fisher_ridge'].forEach((s, i) =>
  wire(msg(s, 340 + (i % 3) * 150, 80 + Math.floor(i / 3) * 26, 140), 0, comb, 1));
const info = obj('info~ tablebuf', 20, 110, 1, 9, 100);
const frames = flo(20, 140, 90);
note('← should read 1048576 frames', 115, 140, 200);
wire(buf, 1, info); wire(info, 6, frames);

// ── 2 · the knobs and the four tests ────────────────────────────
note('2 · the four tests from the README, in order. Each sets base Hz and ratio. Reset puts the shared phasors at 0.', 20, 180, 700);
const tests = [['220 0', 'static row'], ['0.5 1000', 'static column'], ['220 1.5', 'closed orbit'], ['220 1.500625', 'shimmer']];
const unp = obj('unpack f f', 20, 240, 1, 2, 80, { outlettype: ['float', 'float'] });
tests.forEach(([t, label], i) => { const m = msg(t, 20 + i * 110, 210, 100); note(label, 20 + i * 110, 232, 100); wire(m, 0, unp); });
const base = flo(20, 270); const ratio = flo(120, 270);
note('base Hz · ratio', 200, 270, 120);
wire(unp, 0, base); wire(unp, 1, ratio);
const reset = msg('0', 470, 210, 30); note('reset', 505, 210, 50);
note('on open: shimmer, gain 1 →', 420, 270, 180);
const pak = obj('pak f f', 20, 305, 2, 1, 60);
const f2 = obj('expr $f1 * $f2', 20, 335, 2, 1, 100);
wire(base, 0, pak, 0); wire(ratio, 0, pak, 1); wire(pak, 0, f2);
const lb = obj('loadbang', 600, 270, 1, 1, 70, { outlettype: ['bang'] });
const init = msg('220 1.500625', 600, 300, 100);
wire(lb, 0, init); wire(init, 0, unp);

// ── 3 · the two phasors, shared ─────────────────────────────────
const ph1 = sig('phasor~', 20, 380, 2, 1, 70), ph2 = sig('phasor~', 130, 380, 2, 1, 70);
wire(base, 0, ph1); wire(f2, 0, ph2); wire(reset, 0, ph1, 1); wire(reset, 0, ph2, 1);
note('x phase · y phase — the same two signals feed path B and path A2', 220, 380, 380);

// ── path B: Max's own 2d.wave~ ──────────────────────────────────
const wave = sig('2d.wave~ tablebuf @rows 1024', 20, 430, 4, 1, 200);
wire(ph1, 0, wave, 0); wire(ph2, 0, wave, 1);
note('B · 2d.wave~ (the reference). If it ignores @rows, set its rows to 1024 by hand. Force linear interpolation if it offers a choice.', 230, 430, 440);

// ── path A2: the codebox, fed the shared phasors ────────────────
const a2 = rnbo(G, 'torus_2d_lookup_extphase.codebox', 20, 480, 2);
wire(ph1, 0, a2, 0); wire(ph2, 0, a2, 1);
note('A2 · the codebox lookup, fed the same phases. This is the real test: only the surface reading can differ.', 100, 480, 560);

// ── path A1: the codebox as written, counting its own phase ─────
const a1 = rnbo(G, 'torus_2d_lookup.codebox', 20, 530, 0);
const pb = obj('prepend baseHz', 20, 560, 2, 1, 110), pr = obj('prepend ratio', 140, 560, 2, 1, 100);
wire(base, 0, pb); wire(ratio, 0, pr); wire(pb, 0, a1); wire(pr, 0, a1);
const g1 = msg('gain 1', 260, 560, 60); wire(lb, 0, g1); wire(g1, 0, a1);
note('A1 · the codebox as written, its own phase counter (gain 1 so it matches B). The one you will play.', 100, 530, 560);

// ── 4 · the difference meters ───────────────────────────────────
note('4 · A − B, peak in dB. The pass bar is below −100. Read null_fingerprints.json for what any other number means.', 20, 610, 700);
function meter(a, label, x) {
  const d = sig('-~', x, 640, 2, 1, 40); wire(a, 0, d, 0); wire(wave, 0, d, 1);
  const pk = obj('peakamp~ 250', x, 670, 2, 1, 100, { outlettype: ['float'] });
  const db = obj('atodb', x, 700, 1, 1, 50, { outlettype: ['float'] });
  const f = flo(x, 730, 90);
  note(label, x + 95, 730, 220);
  wire(d, 0, pk); wire(pk, 0, db); wire(db, 0, f);
  return d;
}
const d2 = meter(a2, 'A2 − B: is the lookup right?', 20);
const d1 = meter(a1, 'A1 − B: do the phase counters agree too?', 360);
const scope = obj('', 20, 770, 2, 0, 300, { maxclass: 'scope~', h: 120 });
wire(d2, 0, scope);
const mag = sig('*~ 1000', 340, 770, 2, 1, 60); wire(d2, 0, mag);
note('the A2 − B error on a scope, and ×1000 so you can hear it', 410, 770, 300);

// ── 5 · listen ──────────────────────────────────────────────────
note('5 · listen: 1 A1 codebox · 2 A2 codebox on shared phases · 3 B 2d.wave~ · 4 the error ×1000. Toggle 1 and 3 while it plays.', 20, 910, 760);
const pick = obj('', 20, 940, 1, 3, 200, { maxclass: 'umenu', outlettype: ['int', '', ''],
  items: ['A1 codebox', ',', 'A2 codebox, shared phases', ',', 'B 2d.wave~', ',', 'error x1000'] });
const plus = obj('+ 1', 230, 940, 2, 1, 40);
const sel = sig('selector~ 4 3', 20, 975, 5, 1, 100);
wire(pick, 0, plus); wire(plus, 0, sel, 0);
wire(a1, 0, sel, 1); wire(a2, 0, sel, 2); wire(wave, 0, sel, 3); wire(mag, 0, sel, 4);
const vol = sig('*~ 0.25', 20, 1005, 2, 1, 60);
const dac = obj('', 20, 1040, 2, 0, 45, { maxclass: 'ezdac~' });
wire(sel, 0, vol); wire(vol, 0, dac, 0); wire(vol, 0, dac, 1);
note('starts quiet (×0.25) — the surfaces are full-scale', 90, 1005, 300);

const patcher = { patcher: { fileversion: 1, appversion, classnamespace: 'box', rect: [60, 60, 980, 1100],
  bglocked: 0, openinpresentation: 0, default_fontsize: 12, default_fontface: 0, default_fontname: 'Arial',
  gridonopen: 1, gridsize: [15, 15], boxes: G.boxes, lines: G.lines } };
fs.writeFileSync(path.join(here, 'torus-ab.maxpat'), JSON.stringify(patcher, null, '\t'));
console.log(`${G.boxes.length} boxes, ${G.lines.length} lines`);
