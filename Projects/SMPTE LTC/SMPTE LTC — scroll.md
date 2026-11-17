---
title: "SMPTE LTC — scroll"
born: 2026-09-23
links:
  - target: "[[SMPTE LTC]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am SMPTE LTC's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# SMPTE LTC — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[SMPTE LTC]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-11-17T13:40:50.858Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 5 · last ran 2026-11-17 (today)
- **Plan:** agreed 2026-11-08 (9 days ago) · 4 made things since · **a proposed revision is waiting on you**
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-11-17 (today) — The chase room: your TIMECODE track sent down a cable to three desks, showing which cues land, which come late, and which fire after the show stops. (`smpte-ltc-steward-013`)
- **Last commit touching this project:** 2026-11-17 `4dbdbece` — steward(SMPTE LTC): cycle 4 — SPINNING UP. HOME: [SMPTE LTC](?deck=STATE&entry=Projects/SMPTE LTC.md)…
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 5 runs on 2 days, counted from the ledger's run lines
- **Last run:** 2026-11-17 — cycle 5 · taught item 9, proposed item 10 for canon
- **Owed in the ledger:** nothing
- **Proposed for canon:** 2 — items 8, 10; waiting on Loudon's review, and the page has not changed
- **Latest lesson:** item 10, from cycle 5 — 2026-11-17 — [[SMPTE LTC — tuning]]

### Where this stands

SMPTE LTC is your page on timecode as sound, with GoButton's ltc.js as the specification every build is held to. Through November I built a set of 26 deliberately broken LTC files and put five readers through them. The best reads no wrong frame and passes 23. On 8 November you said the page shows how the protocol works but not how it is used. That is a standing order, and a plan revision adding a 'how it is used' step is waiting on you. This cycle acted on the order. I measured when each reader names a frame (after a cold start, a dropout, a cut between songs), not just whether it does. Then I built the chase room: a show on GoButton's TIMECODE track, read by GoButton's reader and chased by…

### Left rough, again and again

_What the trail's left-rough notes keep saying, oldest first, in its latest words._

- **rough since cycle 1:** No hardware reader has heard any of these files, and no real desk has chased the show; _(in 5 notes, the latest cycle 5)_
- **rough since cycle 1:** The rich face's Read step still runs the unchecked reader. _(in 2 notes, the latest cycle 2)_
- **rough since cycle 1:** The resonant EQ still defeats every reader. _(in 4 notes, the latest cycle 4)_

### Open asks

- `smpte-ltc-steward-009` — proposed plan revision: teach LTC all the way up · posted 2026-11-17 · options: adopt · keep

### Answered, not yet consumed

_None._

### Decided

- `smpte-ltc-steward-004` — a first plan for SMPTE LTC → GRANTED — option_id=adopt; notes: "Loudon, live 2026-11-08, answering the four open items as recommended: "yes to all four". Filed by the live session that rewrote SMPTE LTC (8eaea235), in his words. Your tuning proposals 3 (Resampling) and 5 (the gauntlet under The builds) were also yes; the Concierge places them against the page as it stands now." (2026-11-08)
- `smpte-ltc-steward-003` — directional_decision → GRANTED — option_id=DRAFT-PATCH; notes: "Loudon, live 2026-11-08, answering the four open items as recommended: "yes to all four". Filed by the live session that rewrote SMPTE LTC (8eaea235), in his words. The recommendation he took: draft in the workshop, a GoButton session lands it; when it lands, refresh the room's pinned copy (see the live note smpte-ltc-live-note-20261108T131332)." (2026-11-08)

### Runs

- 2026-11-17 — cycle 5 · taught item 9, proposed item 10 for canon
- 2026-11-17 — cycle 4 · taught item 7, proposed item 8 for canon
- 2026-11-17 — cycle 3 · taught item 6
- 2026-11-05 — cycle 2 · taught item 4, proposed item 5 for canon
- 2026-11-05 — cycle 1 · taught item 1, proposed items 2, 3 for canon

### Owed

_Nothing owed._

### Proposed for canon

_Changes the steward wants in the house, kept in its tuning ledger until Loudon's review. Its cycles work as if they hold; the pages have not changed._

- **8.** 2026-11-17 · [[SMPTE LTC]] · § The builds, the hostile gauntlet bullet, appended after its last sentence — The stopwatch-versus-clock contrast is the deepest reading lesson the project has found, and the page's gauntlet bullet stops at four readers.
- **10.** 2026-11-17 · [[SMPTE LTC]] · a new section, ## In a show, after § Every form — The standing order asks the page to show LTC used, and the page has no section on what happens downstream of the cable; this one starts from Loudon's own rig and carries only what the chase room measured.

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
Where it's going: a student can make and read LTC in every form, and prove each tool right against GoButton's ltc.js, in a room you can teach it from.

1. The hostile gauntlet: 26 broken files, an answer key, a scorer any reader can take. (Shipped 2026-11-05.)
2. Readers through the gauntlet: the rich face's backward reader, then a reader with a filter matched to the bit, aiming to take the files nobody passes (noise 6 dB down, MP3 at 32 kbps, a resonant EQ) and to read zero wrong frames.
3. The room's middle stops, Wave, Read and Break it, built in the workshop and proposed through Enrichment, with Break it playing the gauntlet's files.
4. Build: an LTC reader and writer plugin (VST3/AU and standalone) from VST Template in JUCE, the third copy, held to ltc.js sample for sample and put through the gauntlet. The writer follows the host's playhead by moving, never jumping.
5. The proof in the world: an hour of 29.97 drop read by a hardware reader, and a student encoder that fools one. This one is yours, in a room with a cable.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._

- **All the way up** (Loudon, 2026-11-08), in his words: "I have read the page, it is excellent, it states that we need to teach "all the way down" but it doesn't teach "all the way up" we have done a great job of showing how the protocol works, but we have not shown how it is used."
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="smpte-ltc-steward-013" -->
### 2026-11-17 — cycle 5 — Off plan — The chase room: your TIMECODE track sent down a cable to three desks, showing which cues land, which come late, and which fire after the show stops.
> shipped · first move on 'all the way up' · steward leans adopting the waiting plan revision

_Off plan — the 'all the way up' step in the plan revision waiting on you, acted on now under your standing order of 2026-11-08. Offered as proof of a different direction; the plan stands unless Loudon agrees to change it._

What I measured (hostile/chase.mjs, 30 fps, 48 kHz, every reader in the hostile folder). From silence, a reader names its first frame 2 or 3 frames after the signal starts, and the frame it names is one behind the frame playing. After a dropout of 1, 3, 10 or 30 frames, it names a frame again the same 2 or 3 frames after the signal comes back; the length of the gap doesn't matter. A cut from one song's clip straight into the next costs GoButton's reader 1 frame and the checked readers 2. No wrong frame anywhere, clean or with noise 20 dB down. The readers differ by a frame; desk settings differ by ten.

So the room's subject is the desk. The chase room builds the show the way GoButton does: L.runs() turns clips named 'Pre-Roll', '01:00:00:00' and '02:00:00:00' into runs. ltc.js's encoder sends it, a fault is cut into the cable at 01:00:03:00, and GoButton's decodeSample reads it sample by sample. Three made-up desks chase what the reader names: a lighting desk (trusts after 3 frames, runs on alone for 1 s, shows the frame now), a video server (10 frames, 8 frames, the frame now) and a DAW (4 frames, no time, the frame it read). Every setting can be changed. A canvas shows the track, the wire, every frame the reader named, and each desk's state (waiting, locking, locked, running on alone, lost). The cue table gives each desk's verdict. Play sends the real LTC to the speakers at −30 dB with the playhead running; nothing sounds before the click.

The five lessons, pinned in use/check.mjs, which fails if any verdict moves: no Pre-Roll, the first cue is 4, 11 and 5 frames late; 2 s of Pre-Roll, everyone on time except the DAW, a frame late on every cue; a 10-frame dropout is ridden by the lighting desk's second of running on alone and costs the others 11 and 5 frames; when the show stops at 01:00:03:00, that same second of running on alone fires the hit at 01:00:03:10 into a silent room; a cut between songs costs each desk its trust again (3, 10 and 4 frames). Conform and web-smoke pass: 0 errors and 0 warnings at two widths, and no console errors in headless Chromium.

**Artifacts:**
- [the chase room: pick a lesson or set your own Pre-Roll, fault and desk settings; play sends the real LTC, quietly.](Projects/SMPTE LTC/use/the chase room.html)
- [the show-stops lesson: the lighting desk fires the hit after the wire has gone silent.](Projects/SMPTE LTC/use/the chase room.png)
- [the piece's source; make.mjs inlines ltc.js, the core and the lessons.](Projects/SMPTE LTC/use/the chase room.src.html)
- [the show, wire, reader and desks; all the LTC is ltc.js, only the desk is modelled.](Projects/SMPTE LTC/use/chase-core.js)
- [the three desks and five lessons, each pinning the verdicts its words claim.](Projects/SMPTE LTC/use/lessons.js)
- [runs the lessons in Node through the same core; fails if a verdict moves.](Projects/SMPTE LTC/use/check.mjs)
- [builds the self-contained piece.](Projects/SMPTE LTC/use/make.mjs)
- [what the use folder holds and what it measured.](Projects/SMPTE LTC/use/README.md)
- [times every reader at a cold start, after dropouts and across a cut.](Projects/SMPTE LTC/hostile/chase.mjs)
- [those timings.](Projects/SMPTE LTC/hostile/chase.json)
- [now lists chase.mjs.](Projects/SMPTE LTC/hostile/README.md)
- [cycle 4's change, adding the matched reader to the report; it was left undeclared, so it rides now.](Projects/SMPTE LTC/hostile/report.py)

_the five lessons, as check.mjs prints them (lighting desk · video server · DAW)_
| lesson | the cue that tells | lighting desk | video server | DAW |
| --- | --- | --- | --- | --- |
| no Pre-Roll | 01:00:00:00 house to black | 4 frames late | 11 frames late | 5 frames late |
| 2 s of Pre-Roll | every cue | on time | on time | 1 frame late |
| 10-frame dropout | 01:00:03:10 the hit | on time | 11 frames late | 5 frames late |
| the show stops | 01:00:03:10 the hit | fired after the show stopped | never played, never fired | never played, never fired |
| cut between songs | 02:00:00:00 song 2 | 3 frames late | 10 frames late | 4 frames late |

_Changed in the workshop:_ README — new workshop folder for how LTC is used: the chase room and its check.
_Changed in the workshop:_ README — lists chase.mjs, the readers timed the way a show uses them.
_Proposed for canon:_ SMPTE LTC (a new section, ## In a show, after § Every form) — The standing order asks the page to show LTC used, and the page has no section on what happens downstream of the cable; this one starts from Loudon's own rig and carries only what the chase room measured.; owed in the tuning ledger until Loudon's review

_Left rough:_ No hardware reader has heard any of these files, and no real desk has chased the show; the desk settings are not any brand's numbers. The resonant EQ and the 32 kbps MP3 still beat every reader, untouched this cycle.

_Next moves named:_ Take the room on set and in post: jam sync and a camera drifting from the slate; syncing two recorders by timecode; the broadcast-WAV timestamp that is not timecode; 23.976 against 24. · In the DAW: LTC converted to MIDI timecode, eight quarter-frames per time, so a MIDI chaser waits two frames. · Back on the readers: the resonant EQ, where the matched reader's clock settles a quarter bit early.
<sub>`smpte-ltc-steward-013` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-a3ac019263" -->
### 2026-11-17 — cycle 5

taught item 9, proposed item 10 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="smpte-ltc-steward-011" -->
### 2026-11-17 — cycle 4 — A new LTC reader that keeps its own clock instead of timing crossings: 23 of 26 hostile files, the noise file nobody passed, no wrong frame anywhere.
> shipped · the readers step of the plan, two files still unbeaten · steward leans the MP3 next

Every earlier reader is a stopwatch. It times the gap between two crossings and calls it short or long, so anything that moves a crossing moves a bit. The matched reader keeps a clock that ticks every half bit. At each tick it asks which way the signal leaned, on balance, over the whole half bit it just heard. Noise adds up to almost nothing over twenty samples, and a smeared edge still leaves most of the half bit on its own side of zero. Where two half bits differ, a flip happened at the tick, and the quarter bits on either side of it should cancel. Whatever doesn't cancel says how early or late the clock is, and the clock is nudged. Biphase mark flips at every bit boundary, so of the two ways to pair half bits into bits, the right one is the one that breaks that rule less. The careful reader's two checks still guard every frame: an even count of 0s, and the frame after the last one.

The score: 23 of 26 files, and no wrong frame in the files or the sweeps. In the noise sweep it reads 97% of frames at 4 dB and 57% at 1 dB. The careful reader is gone by 10 dB. It holds every sample rate from 8 kHz to 96 kHz, every DC offset, a 2 kHz high-pass under noise, and speeds from 0.05× to 4×.

Two things went wrong on the way and are fixed. First, a run of 0s looks exactly like a run of 1s at half the speed, so the reader now waits until it has heard both kinds of pulse before it starts its clock. The sync word guarantees both kinds in every frame. Second, at 11.025 kHz, rounding pulses to whole samples pulled the bit estimate 16% short, so it now divides samples counted by bits heard.

I also tried an equalizer in front of the clock that learned the line from the reader's own decisions, and took it out. It and the clock pulled against each other and drifted off together, and the clean files began to miss.

**Artifacts:**
- [The gauntlet's report, now with five readers side by side: scores, six milliseconds of every file, clips to hear, the sweeps, and a section on the matched reader.](Projects/SMPTE LTC/hostile/report.html)
- [The matched reader, one file, its six steps written at the top for a student to read.](Projects/SMPTE LTC/hostile/matched-reader.mjs)
- [Its score on the 26 files.](Projects/SMPTE LTC/hostile/results-matched-reader.json)
- [Its sweeps: noise, sample rate, low-pass, high-pass under noise, DC, speed.](Projects/SMPTE LTC/hostile/sweeps-matched-reader.json)
- [The run, file by file.](Projects/SMPTE LTC/hostile/run-matched.txt)
- [The sweeps as text.](Projects/SMPTE LTC/hostile/sweep-matched.txt)

_Five readers through the hostile gauntlet (wrong frames counted across the files and every sweep)_
| reader | files passed | wrong frames | 6 dB noise | noise sweep: last clean read | reads backward |
| --- | --- | --- | --- | --- | --- |
| GoButton (as shipped) | 22 | 300 | no | ~15 dB | no |
| careful | 22 | 0 | no | 12 dB | no |
| room | 21 | 102 | no | — | yes |
| room, checked | 21 | 0 | no | — | yes |
| matched (new) | 23 | 0 | yes | 4 dB (57% at 1 dB) | no |

_Changed in the workshop:_ README — the fourth run: the matched reader, what it takes, what it loses, the equalizer that was tried and removed.
_Proposed for canon:_ SMPTE LTC (§ The builds, the hostile gauntlet bullet, appended after its last sentence) — The stopwatch-versus-clock contrast is the deepest reading lesson the project has found, and the page's gauntlet bullet stops at four readers.; owed in the tuning ledger until Loudon's review

_Left rough:_ No hardware reader has heard any of these files, so 'passes' means passes against ltc.js's own encoder, not against a desk. The resonant EQ still defeats every reader. The matched reader goes deaf through a 1.5 kHz low-pass at 30 fps and at 8× shuttle. The 'room' rows' noise column is left blank because I didn't re-read their sweep for this table.

_Next moves named:_ The 32 kbps MP3: its misses come in pairs, one damaged frame and then the next, which has no checked frame before it to follow. A 'follows' check that counts forward from the last good frame should get it to a pass. · The resonant EQ: decide each pair of half bits as a sequence rather than one at a time, or weight the clock's error by where a half bit's energy sits, so the ringing can't pull the clock early. · Then the room's Read step can show the stopwatch and the clock side by side on the same broken file.
<sub>`smpte-ltc-steward-011` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-86adc8e79c" -->
### 2026-11-17 — cycle 4

taught item 7, proposed item 8 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="smpte-ltc-steward-009" -->
### 2026-11-17 — cycle 3 — Add a step that teaches how LTC is used, starting from your own show rig, before the room's middle stops?
> still working · two-check patch drafted · steward leans adopt

Catch-up: SMPTE LTC teaches timecode as sound. The plan you adopted on 8 November goes all the way down: the hostile test files, readers held to them, the room's Wave, Read and Break-it stops, a plugin, and a hardware check. That same day you wrote: 'we have done a great job of showing how the protocol works, but we have not shown how it is used.' That's a standing order now, and this is how I'd act on it. I'd add one step, right after the readers: how LTC is used, starting from your rig. GoButton's TIMECODE track goes out through the interface to the desks that chase it, with pre-roll, chase, freewheel through a dropout, level and bleed. Then on set (jam sync, slates, cameras), in post (syncing by timecode, the broadcast-WAV timestamp that isn't timecode, 23.976 against 24), and in the DAW (chasing LTC, converting to MIDI timecode). Each comes with a failure you can hear and its fix, and some become a Use stop in the room. I build it in my workshop and propose the page section. It costs the room's middle stops one place in line. The project keeps moving whatever you choose.

**Artifacts:**
- [report.html](Projects/SMPTE LTC/hostile/report.html)
- [report.png](Projects/SMPTE LTC/hostile/report.png)
- [25-rate-change.wav](Projects/SMPTE LTC/hostile/files/25-rate-change.wav)
- [24-dropout.wav](Projects/SMPTE LTC/hostile/files/24-dropout.wav)
- [23-reverse.wav](Projects/SMPTE LTC/hostile/files/23-reverse.wav)
- [22-tape-stop.wav](Projects/SMPTE LTC/hostile/files/22-tape-stop.wav)
- [21-varispeed-x4.wav](Projects/SMPTE LTC/hostile/files/21-varispeed-x4.wav)
- [20-varispeed-half.wav](Projects/SMPTE LTC/hostile/files/20-varispeed-half.wav)
- [19-wrong-clock.wav](Projects/SMPTE LTC/hostile/files/19-wrong-clock.wav)
- [18-8k.wav](Projects/SMPTE LTC/hostile/files/18-8k.wav)
- [17-44k1.wav](Projects/SMPTE LTC/hostile/files/17-44k1.wav)
- [16-mp3-32.wav](Projects/SMPTE LTC/hostile/files/16-mp3-32.wav)
<sub>`smpte-ltc-steward-009` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="smpte-ltc-steward-008" -->
### 2026-11-17 — cycle 3 — GoButton's reader now has two free checks drafted and tested. They cut its 300 wrong frames to 4; asking for two in a row cuts them to 0.
> shipped · draft in my workshop, GoButton untouched · steward leans the device act on two sure frames in a row

**What I made.** [The patch's notes](?deck=STATE&entry=Projects/SMPTE LTC/gobutton-patch/README.md) explain it, with the land-it steps for a GoButton session. The patched `ltc.js` and its diff are next to it, with eleven new checks written in GoButton's own test format.

**What it showed.** I ran GoButton's reader through the gauntlet with only the two checks added and nothing else changed. The table below has the counts. The checks alone don't get to zero. Through the boosted EQ the reader misreads 119 frames, and 4 of them happen to have an even count of 0s *and* follow the one before. Two checks are not proof. Asking for two checked frames in a row stops all 4, and costs one more frame (33 ms at 30 fps) each time the reader locks on. So ltc.js reports the run and the device decides. My lean is that the show rig waits for two in a row. A desk that locks 33 ms later loses nothing; a desk that jumps loses the show.

**Checked:** I made a scratch copy of GoButton and ran its whole test suite with the patch and the new checks: 1956 of 1968 pass. The 12 that fail are colour checks, and they fail the same way without the patch, because GoButton's working folder has an uncommitted colours file. All 11 new checks pass. I didn't touch anything in GoButton Local.

**Passed over:** dropping unchecked frames inside the decoder itself. That would put ltc.js out of step with the codebox it specifies, and break existing checks like 'after a jump, the first frame is the new time.'

**Artifacts:**
- [the patch's notes: why, what changes, the gauntlet's counts, how a GoButton session lands it, what the codebox will need.](Projects/SMPTE LTC/gobutton-patch/README.md)
- [GoButton's ltc.js with the two checks and the run count added.](Projects/SMPTE LTC/gobutton-patch/ltc.js)
- [the whole change, as a diff against GoButton's file.](Projects/SMPTE LTC/gobutton-patch/ltc.js.diff)
- [GoButton's ltc.js as I found it (sha256 40efd97c…), the base of the diff.](Projects/SMPTE LTC/gobutton-patch/ltc.original.js)
- [eleven checks in GoButton's test format, ready for its tests folder.](Projects/SMPTE LTC/gobutton-patch/v2-ltc-checks-tests.js)
- [runs the eleven checks here against the patched copy.](Projects/SMPTE LTC/gobutton-patch/run-checks.js)
- [GoButton's reader with only the two checks, for the gauntlet; TRUST=2 asks for two in a row.](Projects/SMPTE LTC/hostile/sure-reader.mjs)
- [the gauntlet run, one checked frame.](Projects/SMPTE LTC/hostile/run-sure.txt)
- [the gauntlet run, two checked frames in a row.](Projects/SMPTE LTC/hostile/run-sure-2.txt)
- [the sweeps, one checked frame.](Projects/SMPTE LTC/hostile/sweep-sure.txt)
- [the sweeps, two in a row.](Projects/SMPTE LTC/hostile/sweep-sure-2.txt)
- [per-file scores, one checked frame.](Projects/SMPTE LTC/hostile/results-sure-reader.json)
- [per-file scores, two in a row.](Projects/SMPTE LTC/hostile/results-sure-reader-2.json)
- [sweep scores, one checked frame.](Projects/SMPTE LTC/hostile/sweeps-sure-reader.json)
- [sweep scores, two in a row.](Projects/SMPTE LTC/hostile/sweeps-sure-reader-2.json)
- [the gauntlet's notes, with this third run.](Projects/SMPTE LTC/hostile/README.md)

_wrong times read across the gauntlet's 26 files and its sweeps_
| reader | wrong, files | wrong, sweeps | files passed |
| --- | --- | --- | --- |
| GoButton's, as it is | 125 | 175 | 22 of 26 |
| + the two checks | 4 | 0 | 22 of 26 |
| + two checked frames in a row | 0 | 0 | 0 of 26 (one more frame late at each lock than the gauntlet allows) |
| careful reader (checks + hysteresis + gap rule) | 0 | 0 | 22 of 26 |

_Changed in the workshop:_ README — new workshop folder: the two-check patch for GoButton, and how to land it.
_Changed in the workshop:_ README — the third run: the checks alone, and two in a row.

_Left rough:_ No hardware reader has heard any of these files, so 'passes' means passes against ltc.js's own encoder, not against a desk. The patch protects nothing on stage until the codebox gets the checks, and that waits on the Max pause. The gauntlet report page wasn't rebuilt to show the new reader. Noise 6 dB down and the resonant EQ still defeat every reader.

_Next moves named:_ A GoButton session lands the patch, using the four steps in the patch's notes, then refreshes the teaching room's pinned copy of ltc.js. · The other half of the plan's reader step: a reader with a filter matched to the bit, aimed at the noisy and EQ'd files nobody reads. · If you adopt the plan proposal on the TRICKSTER board, the next cycle starts teaching how LTC is used, beginning with your own show rig.
<sub>`smpte-ltc-steward-008` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-aaed5f0dc8" -->
### 2026-11-17 — cycle 3

taught item 6
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="plan-smpte-ltc-steward-004" -->
### 2026-11-08 — Plan agreed: SMPTE LTC has no plan yet. Here's one: gauntlet, better readers, the room's last stops, a JUCE plugin, then a hardware check.

Catch-up: SMPTE LTC teaches timecode down to the bits, and every build is held to GoButton's ltc.js. The rich face already has Count, Bits, an encoder and a backward reader. Today I added the hostile gauntlet, the challenge the room's last stop promises. There's no plan on the scroll, so I'm working from the page's direction alone. This plan follows the page's own path. Readers go through the gauntlet until one passes it all. The room's middle stops get built and proposed through Enrichment. Then comes the plugin, a third copy held to the specification. I lean JUCE through VST Template, because Max and RNBO are paused and the template already builds and checks plugins. A hardware run is last, and it's yours. What it costs: the plugin waits behind the room.

Loudon: "Loudon, live 2026-11-08, answering the four open items as recommended: "yes to all four". Filed by the live session that rewrote SMPTE LTC (8eaea235), in his words. Your tuning proposals 3 (Resampling) and 5 (the gauntlet under The builds) were also yes; the Concierge places them against the page as it stands now."
<sub>`plan-smpte-ltc-steward-004` · plan agreed · agreed 2026-11-08T14:46:08Z · proposed by SMPTE LTC's steward (`smpte-ltc-steward-004`), adopted by Loudon (`resp-smpte-ltc-004-adopt`)</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="smpte-ltc-steward-006" -->
### 2026-11-05 — cycle 2 — The teaching room's backward reader took the gauntlet. With one added check it is the first reader to play a tape backward with zero wrong frames.
> shipped · workshop only · four readers scored · steward leans the sequence check is the lesson

**Open this:** [the gauntlet report](open:Projects/SMPTE LTC/hostile/report.html). It now sets four readers side by side.

**The room's reader, unchanged.** `backward-reader.mjs` lifts the reader script straight out of the rich face's page, so the score belongs to the exact reader a class sees. It works differently from GoButton's. It takes in the whole buffer, times every edge, then locks onto the longest gaps. It also looks for the sync word both ways round. It passes 21 of 26 files and reads `23-reverse`, which nothing else did. It keeps reading through a 1.2 kHz low-pass and a 2 kHz high-pass under noise, where the careful reader goes deaf. It loses three files the others keep: hum as loud as the code, a DC offset past 40%, and 8 kHz. All three come from the same cause: it finds its crossings at the true zero.

**The finding.** The room's reader already makes one of LTC's two free checks: it throws out a word whose count of 0s is odd. That check is not enough. At a 7 kHz sample rate the reader read 98 frames, all wrong (04:00:00:07, 02:00:00:07, 02:00:00:07…), and every one had an even count of 0s. Not one of them followed the frame before. `checked-backward-reader.mjs` adds the second check: a frame counts only when it is the next frame in the direction the tape is running. The reader doesn't know the rate, so the check accepts any count a tape can have, and uses drop-frame only when the word's own flag says so. That check costs one frame each time the reader locks on, and it takes the wrong frames from 102 to 0. The careful reader showed the same thing from the other side. The order check is the one that holds.

**My bug, fixed.** At 32 kbps, lame quietly drops the sample rate to 22.05 kHz. The gauntlet read the file back as if it were still 44.1, so `16-mp3-32` played at double speed. Last cycle I said MP3 at 32 kbps defeats both readers, and that was wrong. With `--resample` holding the rate, only that file changed. Every reader now reads most of it (70 to 92 of 100), and none passes. GoButton's total went from 297 wrong frames to 300.

**Artifacts:**
- [the gauntlet report, now four readers side by side: scores, waveforms, clips, the sweeps.](Projects/SMPTE LTC/hostile/report.html)
- [the report photographed: the two room columns read 23-reverse; orange is a wrong frame.](Projects/SMPTE LTC/hostile/report.png)
- [the teaching room's reader, lifted from its page unchanged and run through the gauntlet.](Projects/SMPTE LTC/hostile/backward-reader.mjs)
- [the room's reader plus one check: a frame counts only when it follows the last.](Projects/SMPTE LTC/hostile/checked-backward-reader.mjs)
- [the MP3 round trip now holds its sample rate (the 32 kbps file had been at double speed).](Projects/SMPTE LTC/hostile/gauntlet.mjs)
- [the report, generalised to any list of readers.](Projects/SMPTE LTC/hostile/report.py)
- [the gauntlet's note, with the second run and the bug.](Projects/SMPTE LTC/hostile/README.md)
- [GoButton, re-run on the fixed file.](Projects/SMPTE LTC/hostile/results.json)
- [careful, re-run.](Projects/SMPTE LTC/hostile/results-careful-reader.json)
- [the room's reader, file by file.](Projects/SMPTE LTC/hostile/results-backward-reader.json)
- [the room's reader, checked, file by file.](Projects/SMPTE LTC/hostile/results-checked-backward-reader.json)
- [where GoButton breaks.](Projects/SMPTE LTC/hostile/sweeps.json)
- [where careful breaks.](Projects/SMPTE LTC/hostile/sweeps-careful-reader.json)
- [where the room's reader breaks, including its 98 wrong frames at 7 kHz.](Projects/SMPTE LTC/hostile/sweeps-backward-reader.json)
- [where the checked room reader breaks: never wrongly.](Projects/SMPTE LTC/hostile/sweeps-checked-backward-reader.json)
- [printout, GoButton.](Projects/SMPTE LTC/hostile/run-gobutton.txt)
- [printout, careful.](Projects/SMPTE LTC/hostile/run-careful.txt)
- [printout, the room's reader.](Projects/SMPTE LTC/hostile/run-backward.txt)
- [printout, the room's reader checked.](Projects/SMPTE LTC/hostile/run-checked-backward.txt)
- [the answer key, remade (only 16-mp3-32 changed).](Projects/SMPTE LTC/hostile/files/answers.json)
- [the fixed 32 kbps file, now at its true speed (stays on this Mac).](Projects/SMPTE LTC/hostile/files/16-mp3-32.wav)
- [the backward file the room's reader now reads (stays on this Mac).](Projects/SMPTE LTC/hostile/files/23-reverse.wav)

_the gauntlet, second run · four readers, told nothing about rate, polarity or speed_
|  | GoButton | careful | room | room, checked |
| --- | --- | --- | --- | --- |
| wrong frames, files + sweeps | 300 | 0 | 102 | 0 |
| files passed (of 26) | 22 | 22 | 21 | 21 |
| played backward | 0/120 | 0/120 | 118/120 | 117/120 |
| 1.2 kHz low-pass | 98% | 0% (deaf) | 98% | 98% |
| hum / 8 kHz | read / read | read / read | deaf / deaf | deaf / deaf |
| MP3 32 kbps, fixed | 88/100, 6 wrong | 70/100 | 92/100 | 87/100 |

_Changed in the workshop:_ README — the second run: four readers, the double-speed MP3 bug and its fix, the sequence check as the one that holds.
_Proposed for canon:_ SMPTE LTC (§ The builds, a new bullet after 'The specification and its tests') — The gauntlet now holds the room's own reader, and its finding (the even-zeros check is not enough, the order check is) is the most teachable thing the project has made; this updates the counts after the MP3 fix.; owed in the tuning ledger until Loudon's review; it replaces item 2

_Left rough:_ No hardware reader has heard any of these files, so 'passes' means passes against ltc.js's own encoder, not against a desk. Noise 6 dB down and the resonant EQ still defeat every reader. Speed 10× and 16× read nothing while 12× reads, in every reader, and I didn't chase why. The rich face's Read step still runs the unchecked reader.

_Next moves named:_ Propose the follows-the-last check for the rich face's reader, so the room teaches the check that holds (a change to a face, so it waits on your yes). · Find why 10× and 16× shuttle go dark while 12× reads: likely the bit landing on whole samples, a resampling lesson worth a step in the room. · A reader that times crossings through a filter matched to the bit, aimed at the noise-6 dB and EQ files that nobody passes.
<sub>`smpte-ltc-steward-006` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-28a291538b" -->
### 2026-11-05 — cycle 2

taught item 4, proposed item 5 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="smpte-ltc-steward-003" -->
### 2026-11-05 — cycle 1 — GoButton's reader reads wrong times through a boosted EQ. Should I draft the two-check fix for GoButton's ltc.js?
> still working · gauntlet shipped · steward leans DRAFT-PATCH

Catch-up: SMPTE LTC now has a hostile gauntlet. It's 26 broken LTC files with an answer key, and GoButton's reader went through it first ([the report](open:Projects/SMPTE LTC/hostile/report.html)). Through +12 dB of EQ at 2 kHz, it reads 119 frames and every one has the wrong time. It also reads wrong times with heavy noise and below 8 kHz. In your rig that's a desk jumping the show, not one waiting. Two free checks stop it: an even count of 0s, and each frame following the last. Together they cost one frame of delay at lock. A careful reader with them read zero wrong frames. GoButton's ltc.js is outside my bundle, so I'm asking. The paths: I draft the patch and its tests in my workshop for the GoButton session to land; I leave it as a finding only; or you'd rather the reader stay simple for teaching and the careful one live only here. The gen~ codebox waits for the Max pause either way. The project keeps moving whatever you choose.

**Artifacts:**
- [the gauntlet report: the EQ row is the one to look at.](Projects/SMPTE LTC/hostile/report.html)
<sub>`smpte-ltc-steward-003` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="smpte-ltc-steward-002" -->
### 2026-11-05 — cycle 1 — Twenty-six hostile LTC files with an answer key. GoButton's reader passes 22 but reads 297 wrong frames; a careful reader with three changes reads none.
> shipped · workshop only, nothing in the house touched · steward leans carry the checks into GoButton

**Open this:** [the gauntlet report](open:Projects/SMPTE LTC/hostile/report.html). It shows every file's score, six milliseconds of each waveform, five clips you can hear and where each reader breaks.

**The files.** All are rendered by GoButton's encoder, then damaged by plain DSP that a student can read in `gauntlet.mjs`: white noise at 20 and 6 dB, 60 Hz hum, a DC offset, +24 dB into a clip, -46 dBFS, a 300 Hz high-pass, a 3 kHz low-pass, +12 dB of EQ at 2 kHz, a broadcast compressor, real MP3 round trips through lame at 128 and 32 kbps, 44.1 and 8 kHz, a card clock 8% slow, half speed, 4× shuttle, a tape slowing to 0.2×, reverse, a 200 ms dropout, a cut from 25 to 29.97 drop, and drop-frame across an ordinary minute and a tenth minute.

**What I found.** Both readers pass 22 of 26. The number that matters is wrong frames. On the EQ file, GoButton's reader finds every sync word and reads 119 frames, every one with the wrong time (04:00:20:01 for 01:00:00:01). It reads 26 wrong frames with noise 10 dB down and 118 at a 7 kHz sample rate. A desk that hears no timecode waits; a desk that hears the wrong time jumps the show. LTC has no checksum, but there are two free checks. The polarity bit keeps every frame's count of 0s even, and every frame should follow the one before. GoButton's reader makes neither check.

**The careful reader** is GoButton's reader line for line, with three changes, and each change was earned by a file. Hysteresis: a flip counts only across a band a fifth of the signal's height wide. That takes noise 10 dB down from 64% read with 26 wrong to 94% read with none. A gap is a gap: a pulse over four bits long means relearn the bit. Trust only a checked frame. Across all the files and sweeps it read zero wrong frames. The cost is a frame of delay at every lock, and through a 1.2 kHz low-pass it hears nothing where GoButton's still reads.

**Your resampling question, partly answered:** at 30 fps both readers read everything from 8 kHz up (3.3 samples a bit) and nothing below. Speed holds from 0.05× to 8×.

**Artifacts:**
- [the gauntlet report: scores, waveforms, five clips, the sweeps. One standalone page.](Projects/SMPTE LTC/hostile/report.html)
- [the report photographed: orange is a wrong frame, grey is a reader hearing nothing.](Projects/SMPTE LTC/hostile/report.png)
- [make the files, run any reader, sweep where it breaks.](Projects/SMPTE LTC/hostile/gauntlet.mjs)
- [GoButton's reader with three marked changes.](Projects/SMPTE LTC/hostile/careful-reader.mjs)
- [builds the report from the results.](Projects/SMPTE LTC/hostile/report.py)
- [what the gauntlet is and how to put a reader through it.](Projects/SMPTE LTC/hostile/README.md)
- [the answer key: what was done to each file, and every frame that went in.](Projects/SMPTE LTC/hostile/files/answers.json)
- [GoButton's reader, file by file.](Projects/SMPTE LTC/hostile/results.json)
- [the careful reader, file by file.](Projects/SMPTE LTC/hostile/results-careful-reader.json)
- [where GoButton's reader breaks.](Projects/SMPTE LTC/hostile/sweeps.json)
- [where the careful reader breaks.](Projects/SMPTE LTC/hostile/sweeps-careful-reader.json)
- [the run's printout, GoButton.](Projects/SMPTE LTC/hostile/run-gobutton.txt)
- [the run's printout, careful.](Projects/SMPTE LTC/hostile/run-careful.txt)
- [the file that fooled GoButton's reader 119 times (stays on this Mac).](Projects/SMPTE LTC/hostile/files/13-eq-peak.wav)
- [the control (stays on this Mac).](Projects/SMPTE LTC/hostile/files/00-clean-30.wav)

_the gauntlet, 2026-11-05 · two readers, told nothing about rate, polarity or speed_
|  | GoButton's reader | careful reader |
| --- | --- | --- |
| files passed (of 26) | 22 | 22 |
| wrong frames, files + sweeps | 297 | 0 |
| +12 dB EQ at 2 kHz | 119 of 120 wrong | silent, 0 wrong |
| noise 10 dB down | 64% read, 26 wrong | 94% read, 0 wrong |
| 1.2 kHz low-pass | 98% read | 0% (deaf) |
| defeats both | noise 6 dB, MP3 32 kbps, the EQ, reverse | same |

_Changed in the workshop:_ README — the gauntlet's own note: what it is, how to run a reader through it, what it found.
_Proposed for canon:_ SMPTE LTC (§ The builds, a new bullet after 'The specification and its tests') — The page promises hostile test files; they exist now, and what they found about wrong frames is the most teachable fact the project has made.; owed in the tuning ledger until Loudon's review
_Proposed for canon:_ SMPTE LTC (§ Open questions, the 'Resampling' bullet) — The gauntlet's sample-rate sweep answers most of the question; what remains is narrower.; owed in the tuning ledger until Loudon's review

_Left rough:_ No hardware reader has heard any of these files, so 'passes' means passes against ltc.js's own encoder, not against a desk. The backward reader on the rich face hasn't taken the gauntlet yet. Noise 6 dB down, MP3 at 32 kbps and the resonant EQ defeat both readers.

_Next moves named:_ Put the rich face's backward reader through the gauntlet: the first reader that should pass 23-reverse. · Write a reader that times its crossings through a filter matched to the bit, and see if it takes the three files nobody passes without losing the 1.2 kHz low-pass. · If you say yes on the board, write the two checks as a patch for GoButton's ltc.js with its tests, for the GoButton session to land. The gen~ reader codebox follows once the Max pause lifts.
<sub>`smpte-ltc-steward-002` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-b79d6e013d" -->
### 2026-11-05 — cycle 1

taught item 1, proposed items 2, 3 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

_Nothing made yet — the first shipped thing will open the trail._
<!-- scroll:making:end -->
