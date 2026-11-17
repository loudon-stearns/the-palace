// The chase room's three desks and its lessons. The desks are made up, each set the way a real one
// can be set: real desks call these lock frames (or chase threshold), freewheel (or drop-out time)
// and offset. Check the manual of yours before you trust these numbers.
const DESKS = [
  { name: 'lighting desk', trust: 3, freewheel: 30, present: true },
  { name: 'video server', trust: 10, freewheel: 8, present: true },
  { name: 'DAW', trust: 4, freewheel: 0, present: false },
];
const LESSONS = [
  { id: 'no-preroll', title: 'No Pre-Roll: the first cue comes before anyone can know the time',
    say: 'Song 1 starts cold at 01:00:00:00. Every reader hears two frames before it can name one, and each desk waits for its own run of frames on top. So "house to black" fires late on every desk.',
    settings: { preRoll: 0, betweenPreRoll: 1, fault: 'none' },
    expect: [['lighting desk', 'house to black', '4 frames late'], ['video server', 'house to black', '11 frames late'], ['DAW', 'house to black', '5 frames late']] },
  { id: 'preroll', title: 'Two seconds of Pre-Roll: everyone is there before the first cue',
    say: 'A Pre-Roll clip before the song counts up into 01:00:00:00. Sixty frames is time for every desk to lock. The DAW is still a frame late on every cue: it shows the frame it read, which is already over.',
    settings: { preRoll: 2, betweenPreRoll: 1, fault: 'none' },
    expect: [['lighting desk', 'house to black', 'on time'], ['video server', 'house to black', 'on time'], ['DAW', 'house to black', '1 frame late']] },
  { id: 'dropout', title: 'A 10-frame dropout: freewheel rides it, or doesn\'t',
    say: 'The cable drops out for a third of a second at 01:00:03:00. The lighting desk runs on alone for a second and never notices. The video server runs on for 8 frames, stops, and comes back late for the hit. The DAW stops at once.',
    settings: { preRoll: 2, betweenPreRoll: 1, fault: 'dropout-10' },
    expect: [['lighting desk', 'song 1, the hit', 'on time'], ['video server', 'song 1, the hit', '11 frames late'], ['DAW', 'song 1, the hit', '5 frames late']] },
  { id: 'stop', title: 'The show stops: freewheel fires a cue that never happened',
    say: 'The operator stops song 1 at 01:00:03:00 and goes to song 2. The lighting desk\'s second of freewheel carries it through the hit at 01:00:03:10, and it fires the hit into a silent room. The long freewheel that saved the dropout is what fires it.',
    settings: { preRoll: 2, betweenPreRoll: 1, fault: 'stop' },
    expect: [['lighting desk', 'song 1, the hit', 'fired, but the show had stopped']] },
  { id: 'cut', title: 'Song 2 cut straight in: the jump costs every desk its lock time',
    say: 'Two clips side by side on the TIMECODE track: 01:00:00:00, then 02:00:00:00 with no Pre-Roll between. The time leaps an hour in one frame. Each desk waits for its run of frames again, and song 2\'s first cue is late.',
    settings: { preRoll: 2, betweenPreRoll: 0, fault: 'none' },
    expect: [['lighting desk', 'song 2, its look', '3 frames late'], ['video server', 'song 2, its look', '10 frames late'], ['DAW', 'song 2, its look', '4 frames late']] },
];
if (typeof module === 'object' && module.exports) module.exports = { DESKS, LESSONS };
