# The hostile gauntlet

The teaching room's challenge — "a reader that passes its hostile test files" — made real, and the
first two readers held to it. Workshop, not an entry.

- `gauntlet.mjs make` writes 26 LTC files in `files/`, each broken one way (noise, hum, DC, clipping,
  EQ, a compressor, MP3 round trips, odd sample rates, a wrong card clock, varispeed, a tape stop,
  reverse, a dropout, a rate change), and `files/answers.json`, the frames that went into each.
  Encoder: GoButton's `ltc.js`, through the rich face's byte-for-byte copy. The damage is plain DSP
  in the same file. Seeded, so every run makes the same files.
- `gauntlet.mjs run [reader.mjs]` scores a reader: right, wrong, missed, and the rate it settles on.
  With no argument it runs GoButton's own reader. Any module that exports
  `read(samples, sampleRate) → [{h,m,s,f,rate}]` can take the gauntlet — that is the room's challenge.
- `gauntlet.mjs sweep [reader.mjs]` finds where a reader breaks: noise, sample rate, low-pass,
  high-pass with noise, DC offset, speed.
- `careful-reader.mjs` is GoButton's reader with three changes: hysteresis, a gap is a gap, and trust
  only a checked frame (even 0s, and the frame after the last).
- `backward-reader.mjs` runs the teaching room's own backward reader, lifted out of
  `SMPTE LTC — rich — backward.html` as it stands (not copied), so the score is the reader a class sees.
- `checked-backward-reader.mjs` is the room's reader with one change: a frame counts only when it
  follows the frame before, in the direction the tape runs.
- `sure-reader.mjs` is GoButton's reader with only the two checks, through the patch drafted in
  `../gobutton-patch/`: nothing else changed. `TRUST=2` asks for two sure frames in a row.
- `matched-reader.mjs` times no crossing. It keeps a clock that ticks every half bit, sums the signal
  over each half bit (the filter matched to the bit), nudges the clock from the quarter bits either side
  of each flip, and pairs halves into bits the way that keeps a flip at every bit boundary. The careful
  reader's two checks guard its frames. Forward only.
- `chase.mjs` times the readers the way a show uses them: how many frames after the signal starts,
  after a dropout, and after a cut from one song's clip to the next, each reader names a frame. It feeds
  the chase room in `../use/`.
- `report.py` builds `report.html`, one standalone page: five readers' scores, six milliseconds of every file,
  five clips to hear, the sweeps.

Fourth run, 2026-11-17: the matched reader. It passes 23 of 26, more than any reader yet, and reads
no wrong frame in the files or the sweeps. It takes `08-noise-6dB`, which nothing had: in the noise
sweep it reads 97% at 4 dB and 57% at 1 dB, where the careful reader is gone by 10. It holds 8 kHz to
96 kHz, every DC offset, a 2 kHz high-pass under noise, and speeds from 0.05× to 4×. It goes deaf
through a 1.5 kHz low-pass at 30 fps (its clock needs the 1s' flips) and at 8× shuttle. Still beaten:
`13-eq-peak`, where it locks and lets go (the ringing puts a half bit's weight just after each flip and
the clock settles a quarter bit early), and `16-mp3-32`, read 90 of 100, misses in pairs. A
decision-taught equalizer in front of the clock was tried and taken out: it and the clock walked off
together and the clean files began to miss.

Third run, 2026-11-17: are the two checks enough by themselves? GoButton's reader with only the checks
reads 4 wrong frames, all in `13-eq-peak`, down from 300 (119 misread frames there, and 4 of them had
even 0s and followed the one before by chance). Asking for two sure frames in a row reads none, files
or sweeps, and costs one more frame at every lock, which the slack of three counts as a miss: 0 of 26
pass on that rule alone. With one sure frame it passes 22, as GoButton's does. Hysteresis is what took
the careful reader to zero with one.

Second run, 2026-11-05: the 32 kbps MP3 file was wrong. lame drops to 22.05 kHz at that bitrate and the
file was read back at 44.1, so it played at double speed. `--resample` now holds the rate; only that
file changed. Four readers, wrong frames across files and sweeps: GoButton 300, careful 0, room 102,
room checked 0. Files passed: 22, 22, 21, 21. The two room readers read `23-reverse`; the others can't.
The room's reader checks even 0s and still read 98 wrong frames at 7 kHz, every one with even 0s and
none following the last: the sequence check is the one that holds. The room's reader keeps reading
through a 1.2 kHz low-pass and a 2 kHz high-pass under noise, where the careful reader goes deaf, and
loses hum, DC past 40%, and 8 kHz, because it finds its crossings at the true zero.

First run, 2026-11-05: both readers pass 22 of 26. GoButton's reader read 297 wrong frames across the
files and sweeps; the careful reader read none. The careful reader costs a frame of delay at every
lock and goes deaf through a 1.2 kHz low-pass, where GoButton's still reads. Neither takes noise
6 dB down or the resonant EQ; neither reads backward.

Not checked: any hardware reader, any real cable or desk. The WAVs stay on this Mac.
