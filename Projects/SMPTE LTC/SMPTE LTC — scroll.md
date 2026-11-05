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

> _Regenerated 2026-11-05T15:51:48.364Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 1 · last ran 2026-11-05 (today)
- **Plan:** none agreed yet — the next run works from what the ledger owes and the forward vector · **a proposed revision is waiting on you**
- **Waiting on you:** 2 open asks
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-11-05 (today) — GoButton's reader reads wrong times through a boosted EQ. Should I draft the two-check fix for GoButton's ltc.js? (`smpte-ltc-steward-003`)
- **Last commit touching this project:** 2026-11-05 `fa0b2565` — enrich(SMPTE LTC): both claim-change offers taken in a4cdd3b1; The fine points and Every form restamped
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 1 run on 1 day, counted from the ledger's run lines
- **Last run:** 2026-11-05 — cycle 1 · taught item 1, proposed items 2, 3 for canon
- **Owed in the ledger:** nothing
- **Proposed for canon:** 2 — items 2, 3; waiting on Loudon's review, and the page has not changed
- **Latest lesson:** item 3, from cycle 1 — 2026-11-05 — [[SMPTE LTC — tuning]]

### Where this stands

SMPTE LTC is your page on timecode as sound: the eighty bits, biphase mark, the sync word, drop-frame and the reader that is always a frame late. It should teach until a student can make and read LTC in every form and prove the tool right. GoButton's ltc.js is the specification every build is held to. On 4 November the page got its first rich face: the teaching room's Count and Bits, an encoder and a backward reader. The room's last stop promises a challenge, 'a reader that passes its hostile test files', but those files didn't exist. Now they do. There are 26 of them, each one broken in a single way, with a scorer that any reader can take. GoButton's own reader went through it first, and t…

### Open asks

- `smpte-ltc-steward-003` — directional_decision · posted 2026-11-05 · options: DRAFT-PATCH · FINDING-ONLY · TEACH-ONLY
- `smpte-ltc-steward-004` — proposed plan revision: a first plan for SMPTE LTC · posted 2026-11-05 · options: adopt · keep

### Answered, not yet consumed

_None._

### Decided

_Nothing decided on the board yet._

### Runs

- 2026-11-05 — cycle 1 · taught item 1, proposed items 2, 3 for canon

### Owed

_Nothing owed._

### Proposed for canon

_Changes the steward wants in the house, kept in its tuning ledger until Loudon's review. Its cycles work as if they hold; the pages have not changed._

- **2.** 2026-11-05 · [[SMPTE LTC]] · § The builds, a new bullet after 'The specification and its tests' — The page promises hostile test files; they exist now, and what they found about wrong frames is the most teachable fact the project has made.
- **3.** 2026-11-05 · [[SMPTE LTC]] · § Open questions, the 'Resampling' bullet — The gauntlet's sample-rate sweep answers most of the question; what remains is narrower.

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this project. The steward reads this zone every cycle before anything else, and it is never regenerated. Taste, priorities, "stop asking me about X", "always prefer Y" — write it once here instead of answering it every cycle._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
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
