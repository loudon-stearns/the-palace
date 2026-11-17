// The checks for THE TWO CHECKS in v2/device/ltc.js: every frame the decoder
// reads says whether its 0s are even, whether it follows the frame before,
// and how many sure frames in a row it ends. Written in SMPTE LTC's workshop
// (the palace, 2026-11-17) for a GoButton session to land beside
// tests/v2-ltc-tests.js; run there by tests/run-v2-tests.js, or here by
// run-checks.js against the patched copy.
//
// The decoder codebox (v2/timecode/ltc-decoder.genexpr) does not have the
// checks yet: Max work is paused until there are patching standards. What it
// will need is in this folder's README. Nothing here changes what the
// decoder already returns, so the codebox still gives the very same time.
const path = require('path');
const ROOT = path.join(__dirname, '..');

function run(check, section, known, Ltc) {   // known: the runner's third argument, unused; Ltc: a copy to test instead (run-checks.js)
  Ltc = Ltc || require(path.join(ROOT, 'v2', 'device', 'ltc.js'));
  const R = Ltc.RATES;
  const sound = (rate, sr, start, seconds, speed) => {
    const e = Ltc.newEncoder(R[rate], sr, Ltc.toFrames(Ltc.parse(start), R[rate]), 0);
    if (speed) e.speed = speed;
    return Ltc.encode(e, Math.round(sr * seconds));
  };

  section('Timecode: the two checks (even 0s, the frame after), and how many sure frames in a row', () => {
    const clean = Ltc.decode(Ltc.newDecoder(48000), sound('30', 48000, '01:00:00:00', 1));
    check('a clean stream: the first frame read has even 0s but nothing before it, so it is not sure',
      [clean[0].even, clean[0].follows, clean[0].sure, clean[0].run], [true, false, false, 0]);
    check('...every frame after it is sure, and the run counts up: 1, 2, 3 ...',
      [clean.slice(1).every((f) => f.sure), clean.slice(1, 5).map((f) => f.run)], [true, [1, 2, 3, 4]]);
    check('...and the frames and their times are what they were before the checks (only fields were added)',
      [Ltc.text(clean[0]), clean[0].at, Ltc.text(clean[0].now)], ['01:00:00:01', 3200, '01:00:00:02']);

    const every = [];
    for (const rate of Object.keys(R)) for (const sr of [44100, 48000]) {
      const got = Ltc.decode(Ltc.newDecoder(sr), sound(rate, sr, '00:59:58:00', 3));
      every.push(got.length > 60 && got.slice(1).every((f) => f.sure));
    }
    check('every rate at 44.1 and 48 kHz, across the hour: after the first frame, every frame is sure', every, every.map(() => true));

    const drop = Ltc.decode(Ltc.newDecoder(48000), sound('29.97 drop', 48000, '00:00:59:25', 1)).concat(
      Ltc.decode(Ltc.newDecoder(48000), sound('29.97 drop', 48000, '00:09:59:25', 1)));
    const minute = drop.find((f) => f.m === 1 && f.s === 0), tenth = drop.find((f) => f.m === 10 && f.s === 0);
    check('drop-frame: 00:01:00;02 follows 00:00:59;29, and 00:10:00;00 follows 00:09:59;29: both sure',
      [Ltc.text(minute), minute.sure, Ltc.text(tenth), tenth.sure], ['00:01:00:02', true, '00:10:00:00', true]);

    const half = Ltc.decode(Ltc.newDecoder(48000), sound('25', 48000, '02:00:00:00', 2, 0.5));
    check('a tape at half speed measures 12.5 frames a second and still counts 25: every frame after the first is sure',
      [half.length > 20, half.slice(1).every((f) => f.sure)], [true, true]);

    // One bit misread: one extra flip in the middle of bit 1 of frame
    // 01:00:00:05 (a 0), so it reads as a 1. Everything after the flip is
    // upside down, which a reader never minds. At 30 frames and 48 kHz a bit
    // is 20 samples and a frame 1600.
    const hit = sound('30', 48000, '01:00:00:00', 0.5);
    for (let i = 5 * 1600 + 30; i < hit.length; i++) hit[i] = -hit[i];
    const misread = Ltc.decode(Ltc.newDecoder(48000), hit);
    const at = misread.findIndex((f) => f.at > 5 * 1600 && f.at <= 6 * 1600);
    check('one bit misread: that frame\'s 0s are odd, it is not sure, and its run is 0',
      [misread[at].even, misread[at].sure, misread[at].run], [false, false, 0]);
    check('...the frame after it has nothing checked to follow, so it is not sure either; the one after that is',
      [misread[at + 1].sure, misread[at + 2].sure, misread[at + 2].run], [false, true, 1]);

    const a = Ltc.newEncoder(R['30'], 48000, 120, 0);
    const jump = Array.from(Ltc.encode(a, 16000));
    Ltc.setEncoder(a, 108000, 0);
    const jumped = Ltc.decode(Ltc.newDecoder(48000), Float32Array.from(jump.concat(Array.from(Ltc.encode(a, 16000)))));
    const first = jumped.findIndex((f) => f.h === 1);
    check('a jump (the show devamped): the first frame read after it does not follow, so it is not sure; the next one is',
      [jumped[first - 1].sure, jumped[first].sure, jumped[first + 1].sure], [true, false, true]);

    // Someone thought it was music: +12 dB at 2 kHz, Q 2, into a clip. The
    // reader finds a sync word in every frame and reads the wrong time from
    // it. A few wrong frames pass both checks by chance; none pass two in a row.
    const eq = Array.from(sound('30', 48000, '01:00:00:00', 4), (v) => 0.5 * v);
    let lp = 0; const k = 1 - Math.exp(-2.2 / (25e-6 * 48000));
    for (let i = 0; i < eq.length; i++) eq[i] = lp += (eq[i] - lp) * k;   // soft edges, 25 µs
    const w = 2 * Math.PI * 2000 / 48000, c = Math.cos(w), al = Math.sin(w) / 4, A = 10 ** (12 / 40);
    const b0 = (1 + al * A) / (1 + al / A), b1 = -2 * c / (1 + al / A), b2 = (1 - al * A) / (1 + al / A), a1 = b1, a2 = (1 - al / A) / (1 + al / A);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < eq.length; i++) {
      const x = eq[i], y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y; eq[i] = Math.max(-0.99, Math.min(0.99, y));
    }
    const sent = new Set(); for (let n = 108000; n < 108000 + 121; n++) sent.add(Ltc.text(Ltc.fromFrames(n, R['30'])));
    const heard = Ltc.decode(Ltc.newDecoder(48000), Float32Array.from(eq));
    const wrong = (list) => list.filter((f) => !sent.has(Ltc.text(f))).length;
    check('+12 dB at 2 kHz: the decoder reads a frame for nearly every frame sent, and every one is wrong',
      [heard.length > 100, wrong(heard) === heard.length], [true, true]);
    check('...the checks stop all but a few; asking for two sure frames in a row stops every one',
      [wrong(heard.filter((f) => f.sure)) < 10, wrong(heard.filter((f) => f.run >= 2))], [true, 0]);
  });
}

module.exports = { run };
