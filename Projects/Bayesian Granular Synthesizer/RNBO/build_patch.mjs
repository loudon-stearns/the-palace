// Builds belief-cloud.maxpat: a Max patch holding one rnbo~ that is the
// whole believing cloud — [notein] into the notes-in codebox, the shared
// note table, and belief-cloud.codebox in a codebox~ — plus a keyboard,
// a MIDI input, the prior switch, a belief meter and a quiet dac.
//   node RNBO/build_patch.mjs
// Box formats adopted from Projects/Action Potential Oscillator/rnbo/
// make_maxpat.py (copied there from the RNBO 1.4 help patchers) and the
// graph helper idea from the 2D Torus build_ab_patch.mjs.
// UNVERIFIED: written without Max. Nothing here has been opened yet.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFileSync(path.join(here, f), 'utf8').replace(/\n/g, '\r\n');
const appversion = { major: 9, minor: 0, revision: 0, architecture: 'x64', modernui: 1 };

function graph() {
  const boxes = [], lines = [];
  const add = (b) => { boxes.push({ box: { fontsize: 12.0, ...b } }); return b.id; };
  const obj = (id, text, x, y, w, ins, outs, extra = {}) =>
    add({ id, maxclass: 'newobj', text, numinlets: ins, numoutlets: outs, outlettype: Array(outs).fill(''), patching_rect: [x, y, w, 22.0], ...extra });
  const note = (id, text, x, y, w = 400, h = 20) => add({ id, maxclass: 'comment', text, patching_rect: [x, y, w, h], linecount: Math.max(1, Math.ceil(text.length * 7 / w)) });
  const msg = (id, text, x, y, w = 60) => add({ id, maxclass: 'message', text, numinlets: 2, numoutlets: 1, outlettype: [''], patching_rect: [x, y, w, 22.0] });
  const wire = (a, ao, b, bi = 0) => lines.push({ patchline: { source: [a, ao], destination: [b, bi] } });
  return { boxes, lines, add, obj, note, msg, wire };
}

// ---- inside the rnbo~ -------------------------------------------------
const I = graph();
I.note('c-in', 'MIDI arrives here. notein sends velocity, then pitch; notes-in stamps each press into the table "held".', 20, 10, 640);
I.obj('notein', 'notein', 20, 40, 70, 1, 3, { rnbo_classname: 'notein', outlettype: ['', '', ''] });
I.add({ id: 'notes', maxclass: 'codebox', code: read('notes-in.codebox'), fontname: '<Monospaced>',
  numinlets: 2, numoutlets: 1, outlettype: [''], patching_rect: [20.0, 80.0, 520.0, 160.0], rnbo_classname: 'codebox' });
I.wire('notein', 0, 'notes', 0); I.wire('notein', 1, 'notes', 1);
I.obj('held', 'data held 128', 560, 80, 110, 1, 2, { rnbo_classname: 'data' });
I.obj('prior', 'data prior 630', 560, 110, 110, 1, 2, { rnbo_classname: 'data' });
I.note('c-data', 'the shared tables, found by name from inside both codeboxes. "prior" is for a painted prior (priorShape 2).', 680, 80, 300, 60);
I.add({ id: 'cb', maxclass: 'codebox~', code: read('belief-cloud.codebox'), fontname: '<Monospaced>',
  numinlets: 1, numoutlets: 3, outlettype: ['signal', 'signal', 'signal'], patching_rect: [20.0, 260.0, 760.0, 560.0], rnbo_classname: 'codebox~' });
const outs = [['out-1', 'out~ 1', 'left'], ['out-2', 'out~ 2', 'right'], ['out-3', 'out~ 3', 'belief focus 0..1']];
outs.forEach(([id, text, comment], i) => {
  I.obj(id, text, 20 + 260 * i, 840, 50, 1, 0, { rnbo_classname: 'out~', rnbo_extra_attributes: { comment, meta: '' } });
  I.wire('cb', i, id, 0);
});
const inner = { fileversion: 1, appversion, classnamespace: 'rnbo', rect: [80.0, 80.0, 1000.0, 900.0],
  default_fontname: 'Lato', gridsize: [15.0, 15.0], title: 'belief-cloud', boxes: I.boxes, lines: I.lines };

// ---- the Max patch ----------------------------------------------------
const G = graph();
G.add({ id: 'title', maxclass: 'comment', fontsize: 18.0, patching_rect: [20.0, 10.0, 900.0, 27.0],
  text: 'The believing cloud. Hold a chord and keep holding: the clicks condense into it.' });
G.note('c-how', 'Play the keyboard below, or any MIDI keyboard (midiin). Turn the dac on. If the rnbo~ will not compile, read the UNVERIFIED SEAMS at the top of the codebox~.', 20, 40, 900);
G.add({ id: 'kb', maxclass: 'kslider', mode: 1, numinlets: 2, numoutlets: 2, outlettype: ['int', 'int'], parameter_enable: 0,
  patching_rect: [20.0, 80.0, 336.0, 53.0], offset: 36, range: 60 });
G.note('c-kb', 'polyphonic keyboard: click a key to hold it, click again to let go', 370, 95, 300);
G.obj('pk', 'pack i i', 20, 140, 60, 2, 1);
G.obj('mf', 'midiformat', 20, 165, 80, 7, 1, { outlettype: ['int'] });
G.wire('kb', 1, 'pk', 1); G.wire('kb', 0, 'pk', 0); G.wire('pk', 0, 'mf', 0);
G.obj('midiin', 'midiin', 120, 165, 55, 1, 1, { outlettype: ['int'] });
G.msg('flat', 'priorShape 0', 400, 150, 90); G.msg('penta', 'priorShape 1', 500, 150, 90); G.msg('paint', 'priorShape 2', 600, 150, 90);
G.note('c-prior', 'the prior: flat · A-minor-pentatonic hills · the painted "prior" table', 400, 125, 400);
const knobs = [['doubt', 0.25], ['tauFocus', 1.6], ['tauOff', 1.4], ['rate', 160], ['nMax', 128]];
knobs.forEach(([name, val], i) => {
  const x = 20 + 120 * i;
  G.note(`k-l-${i}`, name, x, 190, 110);
  G.obj(`k-lm-${i}`, `loadmess ${val}`, x, 212, 100, 1, 1);
  G.add({ id: `k-f-${i}`, maxclass: 'flonum', format: 6, numinlets: 1, numoutlets: 2, outlettype: ['', 'bang'], parameter_enable: 0, patching_rect: [x, 240.0, 70.0, 22.0] });
  G.obj(`k-p-${i}`, `prepend ${name}`, x, 268, 110, 1, 1);
  G.wire(`k-lm-${i}`, 0, `k-f-${i}`); G.wire(`k-f-${i}`, 0, `k-p-${i}`); G.wire(`k-p-${i}`, 0, 'rnbo');
});
G.add({ id: 'rnbo', maxclass: 'newobj', text: 'rnbo~ @title belief-cloud', numinlets: 1, numoutlets: 4,
  outlettype: ['signal', 'signal', 'signal', 'list'], patching_rect: [20.0, 320.0, 600.0, 22.0], rnboattrcache: {},
  rnboversion: '1.4.0', autosave: 1, saved_object_attributes: { optimization: 'O1', parameter_enable: 1 },
  varname: 'belief-cloud', patcher: inner });
for (const s of ['mf', 'midiin', 'flat', 'penta', 'paint']) G.wire(s, 0, 'rnbo');
G.obj('gl', '*~ 0.3', 20, 370, 55, 2, 1, { outlettype: ['signal'] });
G.obj('gr', '*~ 0.3', 90, 370, 55, 2, 1, { outlettype: ['signal'] });
G.wire('rnbo', 0, 'gl'); G.wire('rnbo', 1, 'gr');
G.add({ id: 'dac', maxclass: 'ezdac~', numinlets: 2, numoutlets: 0, patching_rect: [20.0, 410.0, 45.0, 45.0] });
G.wire('gl', 0, 'dac', 0); G.wire('gr', 0, 'dac', 1);
G.obj('snap', 'snapshot~ 50', 300, 370, 90, 2, 1, { outlettype: ['float'] });
G.add({ id: 'focus', maxclass: 'flonum', format: 6, numinlets: 1, numoutlets: 2, outlettype: ['', 'bang'], parameter_enable: 0, patching_rect: [300.0, 400.0, 70.0, 22.0] });
G.add({ id: 'slider', maxclass: 'slider', size: 1.0, floatoutput: 1, numinlets: 1, numoutlets: 1, outlettype: [''], parameter_enable: 0, patching_rect: [380.0, 400.0, 200.0, 20.0], orientation: 1 });
G.wire('rnbo', 2, 'snap'); G.wire('snap', 0, 'focus'); G.wire('snap', 0, 'slider');
G.note('c-focus', 'belief focus: 0 with nothing held, ~0.92 once a chord is believed', 300, 430, 400);
G.note('c-cmp', 'Reference: RNBO/codebox-take.wav is this codebox\'s own output through the same 42-second take as chord-belief.wav.', 20, 470, 700);

const patcher = { patcher: { fileversion: 1, appversion, classnamespace: 'box', rect: [60.0, 60.0, 960.0, 560.0],
  default_fontname: 'Lato', gridsize: [15.0, 15.0], boxes: G.boxes, lines: G.lines } };
fs.writeFileSync(path.join(here, 'belief-cloud.maxpat'), JSON.stringify(patcher, null, '\t'));
console.log(`belief-cloud.maxpat: ${G.boxes.length} boxes outside, ${I.boxes.length} inside the rnbo~`);
