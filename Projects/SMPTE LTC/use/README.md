# use — how a show uses LTC

Workshop for the standing order of 2026-11-08, "all the way up": the protocol is taught, now show it used.
Not an entry. It starts from Loudon's own rig, GoButton's TIMECODE track.

- `the chase room.html` — the piece. A show on the TIMECODE track (a Pre-Roll clip, `01:00:00:00`, a
  Pre-Roll or a cut, `02:00:00:00`), sent down one cable, read by GoButton's reader, chased by three made-up
  desks with three settings each: how many good frames in a row before it trusts the clock, how long it
  freewheels when the clock goes quiet, and whether it adds the frame every reader is late. Five lessons
  set it up; every control can be changed. The table says, per desk, which cues land, which come late
  and by how many frames, and which fire after the show has stopped. Play sends the real LTC to the
  speakers, quietly, with the playhead running. Built by `make.mjs` from `the chase room.src.html`,
  `chase-core.js`, `lessons.js` and the rich face's `ltc.js`, inlined whole. Edit the source, then make.
- `chase-core.js` — the show, the wire, the reader and the desks. Everything about LTC is ltc.js
  (`runs`, `split`, the encoder, `decodeSample`); only the desk is modelled here.
- `check.mjs` — runs the five lessons in Node through the same core and prints every verdict; each
  lesson pins the verdicts its words claim, and the check fails if one moves.
- `the chase room.png` — the piece on the show-stops lesson.

Measured under it, in `../hostile/chase.mjs` (30 fps, 48 kHz): every reader in the hostile folder names
its first frame 2 or 3 frames after the signal starts, and the frame it names is one behind the one
playing. After a dropout of 1, 3, 10 or 30 frames it names a frame again the same 2 or 3 frames after
the signal comes back, whatever the gap. A cut from one song's clip to the next costs GoButton's reader
1 frame and the checked readers 2. No reader named a wrong frame in any of it, clean or with noise
20 dB down. The readers differ by a frame; the desks' settings differ by ten.

The lessons, as the check prints them: with no Pre-Roll the first cue is 4, 11 and 5 frames late on the
three desks; with 2 s of Pre-Roll every desk is on time but the DAW, a frame late on every cue because it
shows the frame it read; a 10-frame dropout is ridden by a second of freewheel and costs the others 11
and 5 frames; the same second of freewheel fires the hit at 01:00:03:10 after the show has stopped; a cut
between songs costs each desk its trust again (3, 10, 4 frames).

Not checked: any real desk. The desk settings are not any brand's numbers. No hardware has chased this.
