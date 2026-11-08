// ======================================================================
// title: SMPTE LTC — rich — ltc.js
// born: 2026-11-04
// links: [[SMPTE LTC]] connects-to · rich-face-engine · loaded by the pieces in [[SMPTE LTC — rich.json]]
// forward_vector: I am GoButton's tested LTC specification, copied whole so the teaching room runs
//   the same code the show runs: counting with drop-frame, the 80 bits, the encoder and the decoder.
//   I change only when the original does, and then I am copied again, never edited here.
// source: GoButton Local/v2/device/ltc.js at commit b169078 (2026-10-06),
//   sha256 40efd97cafc3a34f85196440ae9e457083a0eef9c4019ee2837bbefb2c38f7cc. Everything below the
//   line of dashes is that file, byte for byte; "SMPTE LTC — rich — checks.mjs" holds it to that.
// ----------------------------------------------------------------------
// ======================================================================
// ltc.js: LTC (SMPTE timecode as audio), in plain JavaScript
// ======================================================================
// THIS FILE GOES INTO MAX, in the device's folder: the timecode device's
// scripts (timecode.js, timecodebuild.js, timecodecore.js) load it.
//
// It is also the SPECIFICATION and the TEST for the timecode device's two
// gen~ codeboxes (v2/timecode/ltc-encoder.genexpr and ltc-decoder.genexpr).
// gen~ code can't be run outside Max, so every algorithm is written here
// first, tested in Node (tests/v2-ltc-tests.js), and the codebox then
// follows it line for line. It is pure: no Max, Node or browser features.
// v2/timecode/LTC-NOTES.md explains LTC in one page.
//
// The encoder and the decoder are written the way gen~ works: a few numbers
// of state, and one small function called once for every sample. That is on
// purpose, so the codebox can be compared with them a line at a time.
//
// CONTENTS
//   1. RATES            the six standard frame rates
//   2. COUNTING         a timecode ↔ a frame number, with drop-frame
//   3. THE FRAME        one timecode as 80 bits
//   4. THE ENCODER      frame numbers in, audio samples out, at any sample rate
//   5. THE DECODER      audio samples in, timecodes out, with no rate setting
//   6. CLIPS            the TIMECODE track: which timecode a place in the set has

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Ltc = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ====================================================================
  // 1. RATES
  // ====================================================================
  // fps    real frames a second (the two "fractional" rates run 0.1% slow)
  // count  how many frame numbers a second has: 0 to count - 1
  // drop   drop-frame counting (only ever with 29.97)
  const RATES = {
    '23.976': { fps: 24000 / 1001, count: 24, drop: false },
    '24': { fps: 24, count: 24, drop: false },
    '25': { fps: 25, count: 25, drop: false },
    '29.97': { fps: 30000 / 1001, count: 30, drop: false },
    '29.97 drop': { fps: 30000 / 1001, count: 30, drop: true },
    '30': { fps: 30, count: 30, drop: false },
  };

  // ====================================================================
  // 2. COUNTING
  // ====================================================================
  // A timecode is { h, m, s, f }. A frame number counts frames from
  // 00:00:00:00. Without drop-frame that is simple arithmetic.
  //
  // DROP-FRAME drops no pictures: it skips the frame NUMBERS 00 and 01 at
  // the start of every minute, except every tenth minute, so a count that
  // really runs at 29.97 stays with the clock on the wall. So a minute has
  // 1798 frame numbers, a tenth minute has 1800, and ten minutes have 17982.
  const DROP_MINUTE = 1798;
  const DROP_TEN_MINUTES = 17982;

  function toFrames(tc, rate) {
    const minutes = tc.h * 60 + tc.m;
    const plain = (minutes * 60 + tc.s) * rate.count + tc.f;
    if (!rate.drop) return plain;
    // Two numbers are skipped for every minute so far, but not for the tenth ones.
    return plain - 2 * (minutes - Math.floor(minutes / 10));
  }

  function fromFrames(n, rate) {
    const day = rate.drop ? 24 * 6 * DROP_TEN_MINUTES : 24 * 3600 * rate.count;
    n = ((Math.floor(n) % day) + day) % day;   // timecode runs round the clock: after 23:59:59:29 comes 00:00:00:00
    if (rate.drop) {
      // Put back the numbers that were skipped, then it is plain arithmetic.
      const tens = Math.floor(n / DROP_TEN_MINUTES);
      const rest = n % DROP_TEN_MINUTES;
      // The first minute of each ten has all 1800 numbers; the other nine have 1798.
      const minutesIn = rest < 1800 ? 0 : 1 + Math.floor((rest - 1800) / DROP_MINUTE);
      n += 2 * (tens * 9 + minutesIn);
    }
    const f = n % rate.count;
    const seconds = Math.floor(n / rate.count);
    return { h: Math.floor(seconds / 3600), m: Math.floor(seconds / 60) % 60, s: seconds % 60, f };
  }

  // "01:02:03:04" → { h, m, s, f }, or null when it is not a timecode. A ;
  // or a . before the frames is accepted too (drop-frame is often written so).
  function parse(text) {
    const m = String(text).trim().match(/^(\d{1,2}):(\d{2}):(\d{2})[:;.](\d{2})$/);
    if (!m) return null;
    const tc = { h: Number(m[1]), m: Number(m[2]), s: Number(m[3]), f: Number(m[4]) };
    if (tc.h > 23 || tc.m > 59 || tc.s > 59 || tc.f > 29) return null;
    return tc;
  }

  function text(tc) {
    const two = (n) => (n < 10 ? '0' : '') + n;
    return two(tc.h) + ':' + two(tc.m) + ':' + two(tc.s) + ':' + two(tc.f);
  }

  // ====================================================================
  // 3. THE FRAME
  // ====================================================================
  // One timecode as the 80 bits LTC sends, bit 0 first. Each number is sent
  // as two decimal digits, each digit in binary, smallest bit first.
  const SYNC = [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1];   // bits 64 to 79, the same in every frame

  // Where each digit goes: [first bit, how many bits].
  const DIGITS = {
    frameUnits: [0, 4], frameTens: [8, 2],
    secondUnits: [16, 4], secondTens: [24, 3],
    minuteUnits: [32, 4], minuteTens: [40, 3],
    hourUnits: [48, 4], hourTens: [56, 2],
  };
  const DROP_BIT = 10;

  function frameBits(tc, rate) {
    const bits = new Array(80).fill(0);
    const put = (place, digit) => {
      for (let i = 0; i < place[1]; i++) bits[place[0] + i] = (digit >> i) & 1;
    };
    put(DIGITS.frameUnits, tc.f % 10); put(DIGITS.frameTens, Math.floor(tc.f / 10));
    put(DIGITS.secondUnits, tc.s % 10); put(DIGITS.secondTens, Math.floor(tc.s / 10));
    put(DIGITS.minuteUnits, tc.m % 10); put(DIGITS.minuteTens, Math.floor(tc.m / 10));
    put(DIGITS.hourUnits, tc.h % 10); put(DIGITS.hourTens, Math.floor(tc.h / 10));
    if (rate.drop) bits[DROP_BIT] = 1;
    for (let i = 0; i < 16; i++) bits[64 + i] = SYNC[i];
    // The polarity bit makes the number of 0 bits in the frame even, so the
    // wave points the same way at every sync word. It is bit 59 at 25
    // frames, bit 27 at every other rate.
    let zeros = 0;
    for (const b of bits) if (b === 0) zeros++;
    if (zeros % 2 === 1) bits[rate.count === 25 ? 59 : 27] = 1;
    return bits;
  }

  // The 80 bits back into a timecode (bits 27, 43, 58 and 59 are ignored).
  function readBits(bits) {
    const get = (place) => {
      let digit = 0;
      for (let i = 0; i < place[1]; i++) digit += bits[place[0] + i] << i;
      return digit;
    };
    return {
      h: get(DIGITS.hourTens) * 10 + get(DIGITS.hourUnits),
      m: get(DIGITS.minuteTens) * 10 + get(DIGITS.minuteUnits),
      s: get(DIGITS.secondTens) * 10 + get(DIGITS.secondUnits),
      f: get(DIGITS.frameTens) * 10 + get(DIGITS.frameUnits),
      drop: bits[DROP_BIT] === 1,
    };
  }

  // ====================================================================
  // 4. THE ENCODER
  // ====================================================================
  // Bi-phase mark: the level flips at the start of every bit, and a 1 flips
  // again in its middle. The encoder keeps a PHASE that runs from 0 to 80
  // through the frame (the whole number is the bit, the fraction is how far
  // into it), moved on by 80 x fps / sample rate each sample. That works at
  // any frame rate and any sample rate, whole number of samples per bit or
  // not (29.97 at 48 kHz is 20.02).
  //
  // THE ENCODER COUNTS BY ITSELF, sample for sample, so timecode runs as
  // evenly as the sound card's clock. JavaScript never says "be at this
  // frame NOW" while the show plays: a message from JavaScript arrives some
  // milliseconds late, a different number each time, and a frame at 30 a
  // second is only 33 ms long. Three things from outside steer it instead:
  //
  //   NUDGE  move the count BY so many frames (the hack's lesson: move BY,
  //          not TO). JavaScript reads where the playhead is and where the
  //          encoder is in the same moment, and sends the difference. The
  //          difference is right whenever it arrives.
  //   FROM, TO   the encoder only SOUNDS from one place in the count up to
  //          another: a clip's own first frame and its end. So a clip starts
  //          and ends exactly on its frame, to the sample, with JavaScript
  //          only having to say so in good time.
  //   SET    be at this frame now. Only used while Live is stopped (the
  //          three seconds of timecode up to the playhead), when there is no
  //          music to be in time with.
  //
  // It is silent below 00:00:00:00, whatever it is told (Loudon, 2026-10-05:
  // "never jump to hour 23"): a count that would be negative is not sent as
  // 23:59:59, which a lighting desk would take for the end of the day.
  //
  // The state (the codebox keeps the same numbers):
  //   frame   the frame number being sent (may be negative: then it is silent)
  //   phase   0 to 80: where in the frame the next sample is
  //   level   +1 or -1
  //   bits    the 80 bits of that frame
  //   run     true = send; false = silence (it goes on counting)
  //   from    { frame, phase }: silent before this place in the count
  //   to      { frame, phase }: silent from this place on
  //   speed   1 normally; the tests run it a little fast or slow
  const TINY = 1e-9;
  const FOREVER = 100000000;   // a frame number no day reaches: "no end"
  function newEncoder(rate, sampleRate, startFrame, startPhase) {
    const e = { rate, sampleRate, frame: startFrame || 0, phase: startPhase || 0, level: 1, speed: 1, bits: null,
      run: true, from: { frame: 0, phase: 0 }, to: { frame: FOREVER, phase: 0 } };
    e.bits = frameBits(fromFrames(e.frame, rate), rate);
    return e;
  }

  // set: be at this frame now. The next sample is the start of that frame's
  // bit "phase".
  function setEncoder(e, frame, phase) {
    e.frame = frame;
    e.phase = phase || 0;
    e.bits = frameBits(fromFrames(e.frame, e.rate), e.rate);
  }

  // nudge: move the count by so many whole frames and so many bits (0 to 80).
  function nudgeEncoder(e, frames, phase) {
    e.phase += phase || 0;
    const extra = Math.floor(e.phase / 80);   // the bits may carry into the next frame
    e.phase -= extra * 80;
    e.frame += Math.floor(frames) + extra;
    e.bits = frameBits(fromFrames(e.frame, e.rate), e.rate);
  }

  // Would the next sample sound? Not below 00:00:00:00, not outside from/to.
  // (Frames and bits are compared apart: put together as one number, a
  // frame number in the millions leaves no room for the last digits of the
  // bits. TINY as in encodeSample: a hair under counts as reached.)
  function sounding(e) {
    const p = e.phase + TINY;
    const reached = e.frame > e.from.frame || (e.frame === e.from.frame && p >= e.from.phase);
    const ended = e.frame > e.to.frame || (e.frame === e.to.frame && p >= e.to.phase);
    return e.run && e.frame >= 0 && reached && !ended;
  }

  // One sample out.
  function encodeSample(e) {
    const step = (80 * e.rate.fps * e.speed) / e.sampleRate;   // how far the phase moves in one sample
    // (TINY: adding a fraction 1600 times can come out a hair under the
    // whole number it should reach. A hair under counts as reached.)
    const before = e.phase + TINY;
    const bit = Math.floor(before);
    // The start of a bit was crossed during the last sample (or this is the
    // very start of the frame): flip.
    if (before - step < bit) e.level = -e.level;
    // The middle of a 1 was crossed during the last sample: flip again.
    const half = bit + 0.5;
    if (e.bits[bit] === 1 && before >= half && before - step < half) e.level = -e.level;
    const out = sounding(e) ? e.level : 0;
    e.phase += step;
    if (e.phase + TINY >= 80) {
      // The frame is done: the next one.
      e.phase = Math.max(0, e.phase - 80);
      e.frame += 1;
      e.bits = frameBits(fromFrames(e.frame, e.rate), e.rate);
    }
    return out;
  }

  // n samples in one go (for the tests and for writing WAV files).
  function encode(e, n) {
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = encodeSample(e);
    return out;
  }

  // ====================================================================
  // 5. THE DECODER
  // ====================================================================
  // It needs no frame-rate setting. It measures the time between flips, in
  // samples, and keeps a running measure of how long one BIT is:
  //   - a pulse shorter than 3/4 of a bit is a SHORT one (half a 1);
  //   - a pulse up to 1 1/2 bits is a LONG one (a 0);
  //   - two short pulses in a row are a 1.
  // Every 0 and every 1 refreshes the measure, so it follows any frame rate
  // and a tape that runs fast or slow. A pulse longer than 1 1/2 bits means
  // the measure is wrong (or the signal stopped): start measuring again.
  //
  // Each bit is shifted into the last 80 bits heard. When the newest 16 are
  // the sync word, the 64 before them are a frame: read its digits.
  //
  // The frame rate is worked out from the samples between one sync word and
  // the next (averaged, because 23.976 and 24 differ by one part in 1000).
  //
  // The state (the codebox keeps the same numbers):
  //   last      the sign of the last sample (+1 or -1)
  //   count     samples since the last flip
  //   bit       the running measure of one bit, in samples (0 = not known)
  //   half      1 when a short pulse is waiting for its other half
  //   bits      the last 80 bits heard
  //   fresh     how many of them were heard since the measure last began
  //             (a frame is only read when all 80 are: never half a frame)
  //   since     samples since the last sync word
  //   frameLen  the running measure of one frame, in samples (0 = not known)
  const SMOOTH_BIT = 0.25;     // how fast the bit measure follows (1 = at once)
  const SMOOTH_FRAME = 0.2;    // how fast the frame measure follows
  const LOCK_FRAMES = 3;       // no sync word for this many frames: not locked

  function newDecoder(sampleRate) {
    return { sampleRate, last: 0, count: 0, bit: 0, half: 0, bits: new Array(80).fill(0), fresh: 0, since: 0, frameLen: 0, frames: 0, out: null };
  }

  // One sample in. Returns a frame when this sample completed one:
  //   { h, m, s, f, drop, fps, rate, now }   (rate = the standard rate's name, or '')
  // and null otherwise. h, m, s, f is the frame that was just READ; now is
  // the time it is at this sample: the frame after it (THE TIME NOW, below).
  function decodeSample(d, x) {
    d.count += 1;
    d.since += 1;
    const sign = x >= 0 ? 1 : -1;
    if (d.last === 0) { d.last = sign; return null; }
    if (sign === d.last) return null;
    // A flip: the pulse that just ended was "count" samples long.
    d.last = sign;
    const pulse = d.count;
    d.count = 0;
    if (d.bit === 0) { d.bit = pulse; d.half = 0; d.fresh = 0; return null; }   // the first pulse: take it for a whole bit, to start
    if (pulse > d.bit * 1.5) {
      // Too long for a bit: the measure was a short pulse's, or the signal
      // paused. This pulse is the new measure.
      d.bit = pulse;
      d.half = 0;
      d.fresh = 0;
      return null;
    }
    if (pulse < d.bit * 0.75) {
      // A short pulse: half of a 1. The second half completes it.
      if (d.half === 0) { d.half = pulse; return null; }
      d.bit += (d.half + pulse - d.bit) * SMOOTH_BIT;
      d.half = 0;
      return heard(d, 1);
    }
    // A long pulse: a 0. (A short one left waiting was noise: forget it.)
    d.half = 0;
    d.bit += (pulse - d.bit) * SMOOTH_BIT;
    return heard(d, 0);
  }

  // One bit was heard: shift it in, and look for the sync word.
  function heard(d, bit) {
    d.bits.shift();
    d.bits.push(bit);
    d.fresh += 1;
    for (let i = 0; i < 16; i++) if (d.bits[64 + i] !== SYNC[i]) return null;
    if (d.fresh < 80) { d.since = 0; return null; }   // a sync word, but not a whole frame before it yet
    // A frame. How long was it, in samples?
    if (d.frames > 0 && d.since < d.bit * 80 * 1.5) {
      d.frameLen = d.frameLen === 0 ? d.since : d.frameLen + (d.since - d.frameLen) * SMOOTH_FRAME;
    }
    d.since = 0;
    d.frames += 1;
    const tc = readBits(d.bits);
    tc.fps = d.frameLen > 0 ? d.sampleRate / d.frameLen : d.sampleRate / (d.bit * 80);
    tc.rate = nameRate(tc.fps, tc.drop);
    tc.now = nextFrame(tc, countFor(tc.fps), tc.drop);
    d.out = tc;
    return tc;
  }

  // THE TIME NOW. A frame's number belongs to the START of the frame: the
  // frame named 04:00:00:00 begins at the moment hour four begins. But a
  // reader only has the number when the frame has ENDED, because the sync
  // word that says "this was a frame" is its last 16 bits. So at the moment
  // a frame has been read, the time it names is one frame old, and the time
  // NOW is the next frame's. That is what a reader should show, and what the
  // reader codebox sends out (Loudon's question, 2026-10-05).
  //   count  how many frame numbers a second has (24, 25 or 30)
  //   drop   drop-frame counting: frames 00 and 01 are skipped at the start
  //          of a minute, except every tenth
  function nextFrame(tc, count, drop) {
    let f = tc.f + 1;
    let s = tc.s;
    let m = tc.m;
    let h = tc.h;
    if (f >= count) { f = 0; s += 1; }
    if (s >= 60) { s = 0; m += 1; }
    if (m >= 60) { m = 0; h += 1; }
    if (h >= 24) h = 0;
    if (drop && s === 0 && f < 2 && m % 10 !== 0) f = 2;
    return { h, m, s, f };
  }

  // A TIME AS ONE NUMBER: the seconds since midnight, times 100, plus the
  // frames (01:00:00:12 is 360012). The reader codebox sends the time now
  // this way out of its 8th outlet, so that one [snapshot~] reads the whole
  // time at one sample: four separate ones, each on its own clock, can
  // catch a new second with an old frame number (seen in Live, 2026-10-05).
  // It stays below 8,640,000, which every kind of number in Max holds exactly.
  function packTime(tc) {
    return ((tc.h * 60 + tc.m) * 60 + tc.s) * 100 + tc.f;
  }

  function unpackTime(n) {
    const whole = Math.max(0, Math.round(n));
    const seconds = Math.floor(whole / 100);
    return { h: Math.floor(seconds / 3600), m: Math.floor(seconds / 60) % 60, s: seconds % 60, f: whole % 100 };
  }

  // How many frame numbers a second has, from the frame rate the reader
  // measures (23.976 counts 24, 29.97 counts 30; a tape a little off speed
  // still falls in the right one of the three).
  function countFor(fps) {
    if (fps < 24.5) return 24;
    if (fps < 27.5) return 25;
    return 30;
  }

  // Is the decoder hearing timecode right now?
  function locked(d) {
    return d.frames > 0 && d.bit > 0 && d.since < d.bit * 80 * LOCK_FRAMES;
  }

  // The standard rate nearest to a measured one (within 0.05%), or ''.
  function nameRate(fps, drop) {
    for (const name of Object.keys(RATES)) {
      const r = RATES[name];
      if (r.drop === !!drop && Math.abs(fps / r.fps - 1) < 0.0005) return name;
    }
    return '';
  }

  // Every frame in a block of samples (for the tests).
  function decode(d, samples) {
    const out = [];
    for (let i = 0; i < samples.length; i++) {
      const tc = decodeSample(d, samples[i]);
      if (tc) out.push(Object.assign({ at: i }, tc));
    }
    return out;
  }

  // ====================================================================
  // 6. CLIPS
  // ====================================================================
  // The TIMECODE track (the guide): a clip named hh:mm:ss:ff sends timecode
  // that is exactly that time at the clip's start and runs on from there in
  // real seconds, whatever the tempo does. A clip named Pre-Roll right
  // before one counts UP INTO it, so the count arrives exactly on the clip's
  // time at the clip's start: the run-in that lights, sound and projection
  // need to lock on.
  //
  // A RUN is one unbroken stretch of timecode: a timecode clip, together
  // with the Pre-Roll (or Pre-Rolls) right before it.
  //
  //   runs(clips, secondsAt, rate) → { runs, look }
  //     clips      [{ start, end, name }] in beats, in time order (showset.js)
  //     secondsAt  beat → seconds into the set, as Live plays (the plan's
  //                clock: timecodecore.js, plan)
  //     rate       one of RATES
  //   a run: { start, end   the run in beats (start = its Pre-Roll's start)
  //            clipStart    where the named clip starts
  //            name, zero   the clip's name, and that time as a frame number
  //            zeroSeconds  secondsAt(clipStart)
  //            from, to     the count at the run's start and at its end, in
  //                         frames (fractions too). Never below 0, never past
  //                         the end of the day: timecode does not go round
  //                         the clock here (Loudon, 2026-10-05).
  //            preRoll      seconds of Pre-Roll before the clip (0 = none) }
  //   look: what the programmer should look at: [{ beat, text }]

  // How many frame numbers a day has.
  function dayFrames(rate) {
    return rate.drop ? 24 * 6 * DROP_TEN_MINUTES : 24 * 3600 * rate.count;
  }

  // Why a clip's name is not a timecode at this rate ('' = it is one).
  function badTime(tc, rate) {
    if (tc.f >= rate.count) return 'there is no frame ' + tc.f + ' at ' + rate.count + ' frames a second';
    if (rate.drop && tc.s === 0 && tc.f < 2 && tc.m % 10 !== 0) return 'drop-frame skips that number (frames 00 and 01 at the start of a minute)';
    return '';
  }

  function runs(clips, secondsAt, rate) {
    const out = [];
    const look = [];
    const joined = (a, b) => Math.abs(a.end - b.start) < 1e-6;
    for (let i = 0; i < clips.length; i++) {
      const c = clips[i];
      if (isPreRoll(c.name)) {
        // A Pre-Roll belongs to the timecode clip right after it (other
        // Pre-Rolls may sit between: Live splits a clip when one is dropped
        // on it). With none, it has nothing to count up to.
        let j = i;
        while (clips[j + 1] && joined(clips[j], clips[j + 1]) && isPreRoll(clips[j + 1].name)) j++;
        const next = clips[j + 1];
        if (!next || !joined(clips[j], next) || !parse(next.name)) {
          look.push({ beat: c.start, text: 'the Pre-Roll has no timecode clip right after it: it sends nothing' });
        }
        continue;
      }
      const tc = parse(c.name);
      if (!tc) {
        look.push({ beat: c.start, text: 'the clip "' + c.name + '" is not a timecode (hh:mm:ss:ff) or Pre-Roll: it sends nothing' });
        continue;
      }
      const bad = badTime(tc, rate);
      if (bad) {
        look.push({ beat: c.start, text: 'the clip "' + c.name + '": ' + bad + ': it sends nothing' });
        continue;
      }
      // The Pre-Roll (or Pre-Rolls) right before it: the run starts there.
      let start = c.start;
      for (let j = i - 1; j >= 0 && isPreRoll(clips[j].name) && Math.abs(clips[j].end - start) < 1e-6; j--) start = clips[j].start;
      const before = clips[i - 1];
      if (before && joined(before, c) && before.name.trim() === c.name.trim()) {
        look.push({ beat: c.start, text: 'two clips in a row are named ' + c.name.trim() + ': the timecode starts again here. If Live split one clip, join the two (Cmd-J) or rename the second' });
      }
      const run = { start, end: c.end, clipStart: c.start, name: c.name.trim(), zero: toFrames(tc, rate), zeroSeconds: secondsAt(c.start) };
      run.preRoll = run.zeroSeconds - secondsAt(start);
      run.from = framesAt(run, start, secondsAt, rate);
      run.to = framesAt(run, c.end, secondsAt, rate);
      if (run.from < 0) {
        look.push({ beat: start, text: 'the Pre-Roll before ' + run.name + ' would start before 00:00:00:00: it is silent until 00:00:00:00' });
        run.from = 0;
      }
      if (run.to > dayFrames(rate)) {
        look.push({ beat: c.start, text: 'the clip ' + run.name + ' runs past the end of the day: it is silent from 24:00:00:00' });
        run.to = dayFrames(rate);
      }
      out.push(run);
    }
    return { runs: out, look };
  }

  // The count at a beat, by a run's clock: the clip's time, plus the real
  // time since the clip's start (minus, in its Pre-Roll). In frames, with
  // fractions; it may be below 0 or outside the run: the caller decides.
  function framesAt(run, beat, secondsAt, rate) {
    return run.zero + (secondsAt(beat) - run.zeroSeconds) * rate.fps;
  }

  // The run a beat is in, or null.
  function runAt(list, beat) {
    for (const run of list) if (beat >= run.start && beat < run.end) return run;
    return null;
  }

  // A count in frames as the encoder takes it: { frame, phase } (whole
  // frames, and bits 0 to 80 into the next one).
  function split(frames) {
    const frame = Math.floor(frames + 1e-9);
    return { frame, phase: Math.max(0, (frames - frame) * 80) };
  }

  // Which timecode a beat has: { frame, phase }, or null where nothing is
  // sent (outside every run, or where the count would be below 0).
  function timecodeAt(clips, beat, secondsAt, rate) {
    const run = runAt(runs(clips, secondsAt, rate).runs, beat);
    if (!run) return null;
    const frames = framesAt(run, beat, secondsAt, rate);
    if (frames < run.from - 1e-9 || frames >= run.to) return null;
    return split(frames);
  }

  function isPreRoll(name) {
    return /^pre[- ]?roll$/i.test(String(name).trim());
  }

  return {
    RATES, SYNC, FOREVER, toFrames, fromFrames, parse, text, frameBits, readBits, dayFrames,
    newEncoder, setEncoder, nudgeEncoder, sounding, encodeSample, encode,
    newDecoder, decodeSample, decode, locked, nameRate, nextFrame, countFor, packTime, unpackTime,
    runs, runAt, framesAt, split, timecodeAt, isPreRoll,
  };
});
