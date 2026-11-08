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

> _Regenerated 2026-11-08T14:49:34.891Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 2 · last ran 2026-11-05 (3 days ago)
- **Plan:** agreed 2026-11-08 (today) · 0 made things since
- **Waiting on you:** nothing
- **Ready to advance:** 2 answers filed since the steward last ran — a cycle will consume them
- **Last shipped:** 2026-11-05 (3 days ago) — The teaching room's backward reader took the gauntlet. With one added check it is the first reader to play a tape backward with zero wrong frames. (`smpte-ltc-steward-006`)
- **Last commit touching this project:** 2026-11-08 `183844aa` — ops(SMPTE LTC): tuning items 3 and 5 paid in 11d48abd, on Loudon's yes
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 2 runs on 1 day, counted from the ledger's run lines
- **Last run:** 2026-11-05 — cycle 2 · taught item 4, proposed item 5 for canon
- **Owed in the ledger:** nothing
- **Latest lesson:** item 5, from cycle 2 — 2026-11-05 — [[SMPTE LTC — tuning]]

### Where this stands

SMPTE LTC is your page on timecode as sound. GoButton's ltc.js is the specification every other build is held to. Earlier today I built the hostile gauntlet: 26 LTC files, each broken one way, plus a scorer. GoButton's reader passed 22 of them but read 297 wrong frames. A careful reader, the same code with three changes, read none. Neither reads a tape played backward. This cycle the reader your rich face's Read step already runs went through the same 26 files, unchanged. It reads the backward file, and in the sweeps it read 102 wrong frames. Adding one check fixes that: a frame counts only when it follows the frame before. With that check it reads backward and reads nothing wrong. I also f…

### Left rough, again and again

_What the trail's left-rough notes keep saying, oldest first, in its latest words._

- **rough since cycle 1:** No hardware reader has heard any of these files, so 'passes' means passes against ltc.js's own encoder, not against a desk. _(in 2 notes, the latest cycle 2)_
- **rough since cycle 1:** The rich face's Read step still runs the unchecked reader. _(in 2 notes, the latest cycle 2)_
- **rough since cycle 1:** Noise 6 dB down and the resonant EQ still defeat every reader. _(in 2 notes, the latest cycle 2)_

### Open asks

_None — nothing is waiting on you._

### Answered, not yet consumed

- `smpte-ltc-steward-003` — GRANTED — option_id=DRAFT-PATCH; notes: "Loudon, live 2026-11-08, answering the four open items as recommended: "yes to all four". Filed by the live session that rewrote SMPTE LTC (8eaea235), in his words. The recommendation he took: draft in the workshop, a GoButton session lands it; when it lands, refresh the room's pinned copy (see the live note smpte-ltc-live-note-20261108T131332)." · answered 2026-11-08 — waiting for the next cycle
- `smpte-ltc-steward-004` — GRANTED — option_id=adopt; notes: "Loudon, live 2026-11-08, answering the four open items as recommended: "yes to all four". Filed by the live session that rewrote SMPTE LTC (8eaea235), in his words. Your tuning proposals 3 (Resampling) and 5 (the gauntlet under The builds) were also yes; the Concierge places them against the page as it stands now." · answered 2026-11-08 — waiting for the next cycle

### Decided

- `smpte-ltc-steward-004` — a first plan for SMPTE LTC → GRANTED — option_id=adopt; notes: "Loudon, live 2026-11-08, answering the four open items as recommended: "yes to all four". Filed by the live session that rewrote SMPTE LTC (8eaea235), in his words. Your tuning proposals 3 (Resampling) and 5 (the gauntlet under The builds) were also yes; the Concierge places them against the page as it stands now." (2026-11-08)
- `smpte-ltc-steward-003` — directional_decision → GRANTED — option_id=DRAFT-PATCH; notes: "Loudon, live 2026-11-08, answering the four open items as recommended: "yes to all four". Filed by the live session that rewrote SMPTE LTC (8eaea235), in his words. The recommendation he took: draft in the workshop, a GoButton session lands it; when it lands, refresh the room's pinned copy (see the live note smpte-ltc-live-note-20261108T131332)." (2026-11-08)

### Runs

- 2026-11-05 — cycle 2 · taught item 4, proposed item 5 for canon
- 2026-11-05 — cycle 1 · taught item 1, proposed items 2, 3 for canon

### Owed

_Nothing owed._

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
