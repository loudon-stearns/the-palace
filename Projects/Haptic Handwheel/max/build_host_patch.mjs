// Builds handwheel-host.maxpat — the Max side of the knob's serial protocol
// (see ../firmware/handwheel/handwheel.ino). UNVERIFIED: written without Max.
//   node build_host_patch.mjs
import fs from 'node:fs';
const boxes = [], lines = [];
let n = 0;
// [maxclass or text, x, y, w, inlets, outlets, extra]
function obj(text, x, y, ins, outs, w = 0, extra = {}) {
  const id = `obj-${++n}`;
  const isNew = !['message', 'comment', 'toggle', 'flonum', 'umenu', 'ezdac~', 'button'].includes(extra.maxclass);
  const box = { id, maxclass: extra.maxclass || 'newobj', numinlets: ins, numoutlets: outs,
    outlettype: extra.outlettype || Array(outs).fill(''), patching_rect: [x, y, w || Math.max(40, text.length * 7 + 16), 22] };
  if (isNew || extra.maxclass === 'message' || extra.maxclass === 'comment') box.text = text;
  delete extra.maxclass; delete extra.outlettype;
  Object.assign(box, extra);
  boxes.push({ box });
  return id;
}
const msg = (t, x, y, w) => obj(t, x, y, 2, 1, w, { maxclass: 'message' });
const note = (t, x, y, w = 300) => obj(t, x, y, 1, 0, w, { maxclass: 'comment', linecount: Math.ceil(t.length * 7 / w) });
const wire = (a, ao, b, bi = 0) => lines.push({ patchline: { source: [a, ao], destination: [b, bi] } });

note('HAPTIC HANDWHEEL — host. Max talks to the knob over USB serial, one text line per message. Unverified: built without Max or the knob.', 20, 10, 640);

// ── the port ─────────────────────────────────────────────
note('1 · find the knob: click print, read the Max console, pick its letter', 20, 50, 420);
const print = msg('print', 20, 80);
const close = msg('close', 70, 80);
const ports = obj('', 120, 80, 1, 3, 60, { maxclass: 'umenu', items: ['a', ',', 'b', ',', 'c', ',', 'd', ',', 'e', ',', 'f'], outlettype: ['int', '', ''] });
const portPre = obj('prepend port', 190, 80, 2, 1);
const serial = obj('serial a 921600', 20, 140, 1, 2, 120, { outlettype: ['int', ''] });
wire(print, 0, serial); wire(close, 0, serial); wire(ports, 1, portPre); wire(portPre, 0, serial);
const pollT = obj('', 300, 80, 1, 1, 24, { maxclass: 'toggle', outlettype: ['int'] });
const poll = obj('qmetro 1', 300, 110, 2, 1);
note('listen', 330, 80, 60);
wire(pollT, 0, poll); wire(poll, 0, serial);

// ── reading: "a <angle rad> <speed rad/s> <torque N·m>" every 2 ms ──
const sel = obj('sel 10 13', 20, 190, 1, 3, 80, { outlettype: ['bang', 'bang', ''] });
const group = obj('zl group 1024', 20, 220, 2, 2, 100);
const itoa = obj('itoa', 20, 250, 3, 1);
const froms = obj('fromsymbol', 20, 280, 1, 1);
const route = obj('route a', 20, 310, 2, 2);
const unpack = obj('unpack f f f', 20, 340, 1, 3, 100, { outlettype: ['float', 'float', 'float'] });
const benchPrint = obj('print handwheel', 140, 340, 1, 0, 110);
wire(serial, 0, sel); wire(sel, 2, group); wire(sel, 0, group); wire(group, 0, itoa);
wire(itoa, 0, froms); wire(froms, 0, route); wire(route, 0, unpack); wire(route, 1, benchPrint);
const fA = obj('', 20, 380, 1, 2, 60, { maxclass: 'flonum', outlettype: ['', 'bang'], format: 6 });
const fS = obj('', 90, 380, 1, 2, 60, { maxclass: 'flonum', outlettype: ['', 'bang'], format: 6 });
const fT = obj('', 160, 380, 1, 2, 60, { maxclass: 'flonum', outlettype: ['', 'bang'], format: 6 });
note('angle (rad) · speed (rad/s) · torque you feel (N·m)', 20, 405, 320);
wire(unpack, 0, fA); wire(unpack, 1, fS); wire(unpack, 2, fT);

// ── the knob as a pitch: 12 semitones per turn around middle C ──
note('3 · hear where the knob is: angle → pitch, 12 semitones a turn', 20, 440, 420);
const semis = obj('expr $f1 * 12. / 6.283185 + 60.', 20, 470, 1, 1, 200);
const pk = obj('pack f 2', 20, 500, 2, 1);
const ln = obj('line~', 20, 530, 2, 2, 50, { outlettype: ['signal', 'bang'] });
const mtof = obj('mtof~', 20, 560, 1, 1, 50, { outlettype: ['signal'] });
const osc = obj('cycle~', 20, 590, 2, 1, 50, { outlettype: ['signal'] });
const gain = obj('*~ 0.1', 20, 620, 2, 1, 50, { outlettype: ['signal'] });
const dac = obj('', 20, 650, 2, 0, 45, { maxclass: 'ezdac~' });
wire(unpack, 0, semis); wire(semis, 0, pk); wire(pk, 0, ln); wire(ln, 0, mtof); wire(mtof, 0, osc);
wire(osc, 0, gain); wire(gain, 0, dac, 0); wire(gain, 0, dac, 1);

// ── writing: every command ends as ASCII bytes + newline into [serial] ──
const tosym = obj('tosymbol', 460, 560, 1, 1);
const atoi = obj('atoi', 460, 590, 3, 1);
const nl = obj('append 10', 460, 620, 2, 1);
wire(tosym, 0, atoi); wire(atoi, 0, nl); wire(nl, 0, serial);
const send = (id) => wire(id, 0, tosym);

note('2 · pick a feel (computed on the knob, so stiff ones stay calm)', 460, 50, 420);
const feels = obj('', 460, 80, 1, 3, 110, { maxclass: 'umenu',
  items: ['frets', ',', 'string', ',', 'struck', ',', 'pendulum', ',', 'follow', ',', 'turntable', ',', 'centre', ',', 'free'],
  outlettype: ['int', '', ''] });
const feelPre = obj('prepend feel', 580, 80, 2, 1);
wire(feels, 1, feelPre); send(feelPre);

const params = [
  ['k', 'stiffness N·m/rad (frets ~0.7, string ~0.8)'],
  ['damp', 'damping on the knob N·m·s/rad'],
  ['cancelBrake', '0 = motor brakes itself, 1 = brake cancelled (struck, pendulum, turntable)'],
  ['rpm', 'turntable speed'],
  ['tauMax', 'torque ceiling N·m — start low'],
];
params.forEach(([p, label], i) => {
  const y = 130 + i * 34;
  const f = obj('', 460, y, 1, 2, 60, { maxclass: 'flonum', outlettype: ['', 'bang'], format: 6 });
  const pre = obj(`prepend set ${p}`, 530, y, 2, 1, 130);
  note(label, 670, y, 300);
  wire(f, 0, pre); send(pre);
});

note('4 · play torque into the hand: an LFO you feel (rate-limited by USB; a pitch needs the audio line, not built yet)', 460, 310, 460);
const lfoOn = obj('', 460, 350, 1, 1, 24, { maxclass: 'toggle', outlettype: ['int'] });
const rate = obj('', 500, 350, 1, 2, 50, { maxclass: 'flonum', outlettype: ['', 'bang'], format: 6 });
const amp = obj('', 560, 350, 1, 2, 50, { maxclass: 'flonum', outlettype: ['', 'bang'], format: 6 });
note('on · rate Hz · depth N·m (try 0.01)', 620, 350, 260);
const lfo = obj('cycle~ 2', 500, 390, 2, 1, 60, { outlettype: ['signal'] });
const depth = obj('*~ 0.01', 500, 420, 2, 1, 60, { outlettype: ['signal'] });
const snap = obj('snapshot~ 5', 500, 450, 2, 1, 80, { outlettype: ['float'] });
const playPre = obj('prepend play', 500, 480, 2, 1);
const off = obj('sel 0', 400, 390, 2, 2, 50, { outlettype: ['bang', ''] });
const zero = msg('play 0', 400, 420, 60);
wire(rate, 0, lfo); wire(amp, 0, depth, 1); wire(lfo, 0, depth); wire(depth, 0, snap);
wire(lfoOn, 0, snap); wire(lfoOn, 0, off); wire(off, 0, zero); wire(snap, 0, playPre); send(playPre); send(zero);

note('5 · bench tests (see BENCH.md). Capture the "b,…" lines to a file for bench_analyze.py — the Max console only shows them.', 460, 660, 460);
['coast', 'accel-bare', 'accel-disc', 'cog', 'chirp'].forEach((t, i) => send(msg(`bench ${t}`, 460 + i * 90, 700, 84)));

const patcher = { patcher: { fileversion: 1,
  appversion: { major: 8, minor: 6, revision: 0, architecture: 'x64', modernui: 1 },
  classnamespace: 'box', rect: [80, 80, 1000, 760], bglocked: 0, openinpresentation: 0,
  default_fontsize: 12, default_fontface: 0, default_fontname: 'Arial', gridonopen: 1, gridsize: [15, 15],
  boxes, lines } };
fs.writeFileSync(new URL('./handwheel-host.maxpat', import.meta.url), JSON.stringify(patcher, null, '\t'));
console.log(`${boxes.length} boxes, ${lines.length} lines`);
