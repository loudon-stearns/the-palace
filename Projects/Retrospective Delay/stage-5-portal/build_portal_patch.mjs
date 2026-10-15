// Builds portal.maxpat: a Max patch holding one rnbo~ that is the whole
// Retrospective Delay — [in~ 1] into portal.codebox in a codebox~, two
// out~ for the plugin's stereo pair, and the face's three facts sent out
// through outports — plus an input, the knob, the lag choice, the tempo,
// and three readouts where the cat will listen.
//   node build_portal_patch.mjs
// Box formats and the graph helper adopted from Projects/Bayesian Granular
// Synthesizer/RNBO/build_patch.mjs (itself from the RNBO 1.4 help patchers).
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
I.note('c-in', 'One input. The codebox holds the tape itself: no buffer~, no transport, nothing a plugin host or the H9000 has to supply but audio and a tempo.', 20, 10, 700, 40);
I.obj('in1', 'in~ 1', 20, 60, 50, 0, 1, { rnbo_classname: 'in~', outlettype: ['signal'], rnbo_extra_attributes: { comment: 'audio in', meta: '' } });
I.add({ id: 'cb', maxclass: 'codebox~', code: read('portal.codebox'), fontname: '<Monospaced>',
  numinlets: 1, numoutlets: 5, outlettype: ['signal', 'signal', 'signal', 'signal', 'signal'],
  patching_rect: [20.0, 100.0, 760.0, 620.0], rnbo_classname: 'codebox~' });
I.wire('in1', 0, 'cb', 0);
[['out-1', 'out~ 1', 'left'], ['out-2', 'out~ 2', 'right']].forEach(([id, text, comment], i) => {
  I.obj(id, text, 20 + 120 * i, 740, 50, 1, 0, { rnbo_classname: 'out~', rnbo_extra_attributes: { comment, meta: '' } });
  I.wire('cb', i, id, 0);
});
['pose', 'presence', 'holding'].forEach((name, i) => {
  const x = 300 + 160 * i;
  I.obj(`snap-${name}`, 'snapshot~ 33', x, 740, 90, 2, 1, { rnbo_classname: 'snapshot~' });
  I.obj(`port-${name}`, `outport ${name}`, x, 770, 110, 1, 0, { rnbo_classname: 'outport' });
  I.wire('cb', 2 + i, `snap-${name}`, 0); I.wire(`snap-${name}`, 0, `port-${name}`, 0);
});
I.note('c-face', 'the face listens to these about 30 times a second; a plugin host ignores them', 300, 800, 480);
const inner = { fileversion: 1, appversion, classnamespace: 'rnbo', rect: [80.0, 80.0, 900.0, 860.0],
  default_fontname: 'Lato', gridsize: [15.0, 15.0], title: 'retrospective-delay', boxes: I.boxes, lines: I.lines };

// ---- the Max patch ----------------------------------------------------
const G = graph();
G.add({ id: 'title', maxclass: 'comment', fontsize: 18.0, patching_rect: [20.0, 10.0, 900.0, 27.0],
  text: 'The portal. The same séance, now one RNBO codebox that can leave Max.' });
G.note('c-how', 'Turn the dac on. Play into the mic input, then stop: the last measure is kept. Raise the knob to summon it. If the rnbo~ will not compile, read the UNVERIFIED SEAMS at the top of the codebox~. Then use the export sidebar: VST3/AU, Max for Live, or Web.', 20, 40, 900, 40);
G.add({ id: 'adc', maxclass: 'ezadc~', numinlets: 1, numoutlets: 2, outlettype: ['signal', 'signal'], patching_rect: [20.0, 100.0, 45.0, 45.0] });
G.note('c-adc', 'input (or replace with sfplay~ and a dry loop)', 75, 115, 300);
G.wire('adc', 0, 'rnbo', 0);
// the knob
G.note('c-gain', 'gain: the one gesture', 20, 170, 200);
G.add({ id: 'gain', maxclass: 'flonum', format: 6, minimum: 0.0, maximum: 1.0, numinlets: 1, numoutlets: 2, outlettype: ['', 'bang'], parameter_enable: 0, patching_rect: [20.0, 195.0, 60.0, 22.0] });
G.add({ id: 'gslider', maxclass: 'slider', size: 1.0, floatoutput: 1, numinlets: 1, numoutlets: 1, outlettype: [''], parameter_enable: 0, patching_rect: [90.0, 195.0, 160.0, 20.0], orientation: 1 });
G.obj('pg', 'prepend gain', 20, 225, 90, 1, 1);
G.wire('gslider', 0, 'gain'); G.wire('gain', 0, 'pg'); G.wire('pg', 0, 'rnbo');
// the lag
G.note('c-lag', 'lag: how far back', 300, 170, 200);
G.msg('lq', 'lag 0.25', 300, 195, 65); G.msg('lh', 'lag 0.5', 370, 195, 60); G.msg('lw', 'lag 1', 435, 195, 50);
G.note('c-lagn', 'quarter · half · whole note — exactly 1 is safe here, as in gen~', 300, 222, 380);
for (const s of ['lq', 'lh', 'lw']) G.wire(s, 0, 'rnbo');
// the tempo
G.note('c-bpm', 'bpm (Live and VST hosts can drive this from their transport)', 700, 170, 300, 34);
G.obj('lm-bpm', 'loadmess 120', 700, 205, 90, 1, 1);
G.add({ id: 'bpm', maxclass: 'flonum', format: 6, numinlets: 1, numoutlets: 2, outlettype: ['', 'bang'], parameter_enable: 0, patching_rect: [700.0, 232.0, 60.0, 22.0] });
G.obj('pb', 'prepend bpm', 700, 260, 85, 1, 1);
G.wire('lm-bpm', 0, 'bpm'); G.wire('bpm', 0, 'pb'); G.wire('pb', 0, 'rnbo');
G.add({ id: 'rnbo', maxclass: 'newobj', text: 'rnbo~ @title retrospective-delay', numinlets: 1, numoutlets: 3,
  outlettype: ['signal', 'signal', 'list'], patching_rect: [20.0, 300.0, 600.0, 22.0], rnboattrcache: {},
  rnboversion: '1.4.0', autosave: 1, saved_object_attributes: { optimization: 'O1', parameter_enable: 1 },
  varname: 'retrospective-delay', patcher: inner });
G.add({ id: 'dac', maxclass: 'ezdac~', numinlets: 2, numoutlets: 0, patching_rect: [20.0, 350.0, 45.0, 45.0] });
G.wire('rnbo', 0, 'dac', 0); G.wire('rnbo', 1, 'dac', 1);
// the face's three facts
G.obj('route', 'route pose presence holding', 300, 350, 200, 1, 4);
G.wire('rnbo', 2, 'route');
['pose', 'presence', 'holding'].forEach((name, i) => {
  const x = 300 + 110 * i;
  G.add({ id: `f-${name}`, maxclass: 'flonum', format: 6, numinlets: 1, numoutlets: 2, outlettype: ['', 'bang'], parameter_enable: 0, patching_rect: [x, 385.0, 70.0, 22.0] });
  G.note(`c-f-${name}`, name, x, 410, 100);
  G.wire('route', i, `f-${name}`);
});
G.note('c-cat', 'These three numbers are what the cat from the fourth move reads: wire them to seance-cat.js (stage-4-character/jsui) through [prepend set_gain], [prepend presence], [prepend holding].', 300, 440, 450, 40);
G.note('c-ref', 'Reference: portal-performance.wav is this codebox\'s own output through the séance performance; it matches the gen~ face model to the last bit.', 20, 500, 700);

const patcher = { patcher: { fileversion: 1, appversion, classnamespace: 'box', rect: [60.0, 60.0, 1100.0, 600.0],
  default_fontname: 'Lato', gridsize: [15.0, 15.0], boxes: G.boxes, lines: G.lines } };
fs.writeFileSync(path.join(here, 'portal.maxpat'), JSON.stringify(patcher, null, '\t'));
console.log(`portal.maxpat: ${G.boxes.length} boxes outside, ${I.boxes.length} inside the rnbo~`);
