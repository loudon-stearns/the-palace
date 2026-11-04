---
title: "Cycle 5 Explorer — scroll"
born: 2026-10-28
links:
  - target: "[[Cycle 5 Explorer]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Cycle 5 Explorer's scroll — the one page that always opens on where the project stands now and the plan it is following, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my plan changes only when Loudon agrees, and every change is logged on my trail; my standing orders are Loudon's; my trail only ever grows."
---

# Cycle 5 Explorer — scroll

> The project's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Cycle 5 Explorer]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-11-04T01:30:52.732Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** sprout · **Steward:** cycle 3 · last ran 2026-11-04 (today)
- **Plan:** agreed (no dated change on the trail yet)
- **Waiting on you:** nothing
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-11-04 (today) — My three grids now show every column on a projector, the 7 and ♭7 column included. Before, all three hid their last column at every classroom width. (`cycle5-explorer-steward-008`)
- **Last commit touching this project:** 2026-11-03 `74d578ec` — edit(Loudon Live Design System): the browser's furniture fan-out, batch 1 of 5: Projects, 0 to C (81 pages)
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 3 runs on 2 days, counted from the ledger's run lines
- **Last run:** 2026-11-03 — cycle 3 · taught item 3
- **Owed in the ledger:** nothing
- **Latest lesson:** item 3, from cycle 3 — 2026-11-03 — [[Cycle 5 Explorer — tuning]]

### Where this stands

Cycle 5 Explorer is the decoder ring for harmony you rebuilt from your Illustrator board on 27 and 28 October. Every key is a seven-note window sliding along the line of fifths. You drag one ring to change key and another to change mode, and three grids plus a chord readout in four notations follow along. On 4 November you reviewed me and said the plan stands. The path is that you answer my open questions, I fold your answers in, and you try me once in a class or a stream before I grow anything new. Last cycle I rehearsed a fifty-minute class on the page and found that its three grids, side by side, each hid their last column on a projector. In Scale Tones that is the 7 and ♭7 column, the v…

### Left rough, again and again

_What the trail's left-rough notes keep saying, oldest first, in its latest words._

- **rough since 2026-10-28:** Nobody has heard the page, me included. _(in 4 notes, the latest cycle 3)_
- **rough since 2026-10-28:** The grids are measured in headless Chromium only and haven't been seen on a real projector. _(in 2 notes, the latest cycle 3)_

### Open asks

_None — nothing is waiting on you._

### Answered, not yet consumed

_None._

### Decided

- `cycle5-explorer-steward-002` — review the current state before any cycle runs → GRANTED — option_id=reviewed (2026-11-04)

### Runs

- 2026-11-03 — cycle 3 · taught item 3
- 2026-10-30 — cycle 2 · taught item 2
- 2026-10-30 — cycle 1 · taught item 1

### Owed

_Nothing owed._

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
Where this is going: the page Loudon pulls up to teach harmony, proven in a classroom, then given to students.

1. Rebuild the Illustrator board as one web page with sound, the theory on integer positions on the line of fifths, the rings updating while dragged. (Done 2026-10-27 to 28, in claude.ai; dressed in Drafting Table 2026-10-28.)
2. Loudon answers the import's open questions: same notes or same tonic as the class default; whether the four dialects match how he writes at Berklee; whether the feel word per mode matches how he teaches emotion to mode; which roadmap move comes first.
3. Fold his answers in, lift the title block from SKETCH to STUDY, and try the page in a class or a stream once.
4. The next feature, by his pick: secondary dominants and tritone subs, harmonic and melodic minor windows, a bass and voice-leading view, MIDI out, or presentation mode.
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="cycle5-explorer-steward-008" -->
### 2026-11-04 — cycle 3 — My three grids now show every column on a projector, the 7 and ♭7 column included. Before, all three hid their last column at every classroom width.
> shipped · grids fixed and swept from 360 to 1920 px · steward leans: you try me in class

**Open this:** [the page](open:Projects/Cycle 5 Explorer/cycle5-explorer.html), and scroll down to the grids.

**What changed.** The three grids no longer try to fit side by side. Scale Tones and Chord Function share the top row, and Chord Tones gets its own full-width row underneath. Below 1100 px wide, all three stack. That's the only change, a few lines of CSS. The wheel, the inspector, the sound and the theory are untouched.

**How I know.** I measured each grid's table against the box that holds it in headless Chromium, in both mode-change settings. Before the change, a sweep of every width from 360 to 1920 px in 20-px steps found 159 cases of a hidden column, and at 1920 the Scale Tones grid still lost 29 px. After the change, nothing hides from 640 px up. On a phone, the grids still scroll sideways. Cells also grew: the smallest cell at 1280 went from 38 to 45 px in Scale Tones and from 38 to 112 px in Chord Tones. The theory tests pass, and the spelling audit still reads 3,990 checks with 0 failures. The class run-sheet's warning to scroll the grids sideways now says they show in full.

**Artifacts:**
- [the page, with the grid layout changed.](Projects/Cycle 5 Explorer/cycle5-explorer.html)
- [before, at 1280 px: three across, each grid cut off at its right edge.](Projects/Cycle 5 Explorer/workshop/projector-grids/before-grids-1280.png)
- [after, at 1280 px: two across, Chord Tones below, all seven columns showing.](Projects/Cycle 5 Explorer/workshop/projector-grids/after-grids-1280.png)
- [before, at 1920 px.](Projects/Cycle 5 Explorer/workshop/projector-grids/before-grids-1920.png)
- [after, at 1920 px.](Projects/Cycle 5 Explorer/workshop/projector-grids/after-grids-1920.png)
- [measures each grid's hidden width at five projector widths, in both mode-change settings (Playwright).](Projects/Cycle 5 Explorer/workshop/projector-grids/measure-grids.mjs)
- [sweeps 360 to 1920 px and names any grid that still hides a column.](Projects/Cycle 5 Explorer/workshop/projector-grids/sweep.mjs)
- [every measurement before the change.](Projects/Cycle 5 Explorer/workshop/projector-grids/before-grids.json)
- [every measurement after.](Projects/Cycle 5 Explorer/workshop/projector-grids/after-grids.json)
- [the class run-sheet builder, with the warning about hidden columns replaced.](Projects/Cycle 5 Explorer/class/build-run-sheet.mjs)
- [the class run-sheet, rebuilt.](Projects/Cycle 5 Explorer/class/class-run-sheet.html)

_hidden width of each grid (px) · same notes · before → after_
| width | Scale Tones | Chord Function | Chord Tones |
| --- | --- | --- | --- |
| 1024 | 0 → 0 | 109 → 0 | 0 → 0 |
| 1280 | 80 → 0 | 81 → 0 | 91 → 0 |
| 1366 | 56 → 0 | 44 → 0 | 66 → 0 |
| 1440 | 35 → 0 | 13 → 0 | 44 → 0 |
| 1920 | 29 → 0 | 3 → 0 | 36 → 0 |

_Left rough:_ Nobody has heard the page, me included. The grids are measured in headless Chromium only and haven't been seen on a real projector. The page is now taller, so you'll scroll down to reach Chord Tones. Your four open questions still wait on the review sheet.

_Next moves named:_ When you answer the four questions on the review sheet (class default, Berklee notation, feel words, which feature next), fold them in and lift the title block from SKETCH to STUDY. · Meanwhile: measure the grids' and inspector's labels as the back row would see them at 720p and 1080p, the way Rational Hearing measured its ladder, and fix whatever falls under readable. · Then: one class or stream with the run-sheet.
<sub>`cycle5-explorer-steward-008` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-a8ac0d1811" -->
### 2026-11-03 — cycle 3

taught item 3
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="cycle5-explorer-steward-006" -->
### 2026-10-30 — cycle 2 — A fifty-minute class plan for teaching with me, with every step pressed on the real page first. It found that my grids hide their last column on a projector.
> shipped · page untouched, your review still open · steward leans fix the grid clipping first

The class follows the order your brief gives: emotion, then mode, then the cycle and its progressions, then borrowing a chord from another mode, with the four notations along the way. It runs in five parts. (1) Emotion first: hold the tonic and walk from Lydian down to Locrian. The room names each feel before the page shows its word, and you point out that each step darker lowers exactly one note. (2) Same notes, new home: F Lydian through B Locrian on the white keys, the window idea said out loud. (3) The diatonic cycle of fifths, looped while you press N three times so the room sees one progression written Berklee, jazz shorthand, lead sheet and classical. (4) Borrow one chord: the IV-to-minor-IV preset, then the students build I VI IV V, then I ♭VI IV V with the ♭VI clicked from the Aeolian row, then press → twice and hear it move to D with the ♭VI still borrowed. (5) Walk the keys, and close on 'how do you feel, and which mode felt most like you today?'

How it's checked: rehearse.mjs opens the page in headless Chromium with the sound silenced and presses the keys and buttons the sheet names, in order. It records what the page shows back. The sheet is built only from that record, so every chord, feel word and 'one step darker' note on it is what the page actually said. The stills are taken from the same run.

What the rehearsal found: in the first still, my Scale Tones grid was missing its seventh column. I measured the three grids at four widths. At 1280, 1440 and 1920 pixels, Scale Tones and Chord Tones both scroll sideways and hide their seventh column. Chord Function hides its VII column at 1024 to 1440. No width shows all three in full. The column Scale Tones hides holds the ♭7, the note that turns Ionian into Mixolydian. The sheet tells you this in an amber box before class. I didn't fix it on the page, because you asked to see me first.

**Artifacts:**
- [the class plan: five parts, the keys to press, what to say, questions for the room, three stills, and boxes to mark with a pen](Projects/Cycle 5 Explorer/class/class-run-sheet.html)
- [C Dorian, same tonic, during the rehearsal](Projects/Cycle 5 Explorer/class/still-emotion-dorian.jpg)
- [the diatonic cycle loaded in the progression lane](Projects/Cycle 5 Explorer/class/still-cycle.jpg)
- [I ♭VI IV V moved to D, the ♭VI still borrowed from Aeolian. The Scale Tones grid's seventh column is cut off at the right edge.](Projects/Cycle 5 Explorer/class/still-borrow-in-D.jpg)
- [presses the sheet's steps on the real page and records what it shows](Projects/Cycle 5 Explorer/class/rehearse.mjs)
- [builds the sheet from the rehearsal's record](Projects/Cycle 5 Explorer/class/build-run-sheet.mjs)
- [what the page showed at each step](Projects/Cycle 5 Explorer/class/rehearsal.json)

_Left rough:_ Nobody has heard the page, me included. The rehearsal ran silent and checked what the page shows, not how it sounds. The timings are my guess, not a tested class. The grid clipping is found and measured but not fixed.

_Next moves named:_ Once you've reviewed me: make the three grids fit at projector widths, so no column scrolls out of sight, then rerun the rehearsal and both sheets. · Fold your four answers into the page and lift the title block from SKETCH to STUDY, then mark up the class sheet and teach it once.
<sub>`cycle5-explorer-steward-006` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-d53434d568" -->
### 2026-10-30 — cycle 2

taught item 2
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="cycle5-explorer-steward-004" -->
### 2026-10-30 — cycle 1 — A review kit for my page: every key's spelling checked, my own sound rendered for the first time, and your four questions on one printable sheet.
> shipped · page untouched, still waiting for your look · steward leans print the sheet

**The sheet first:** [review-sheet.html](open:Projects/Cycle 5 Explorer/review/review-sheet.html). It lists the four questions with tick boxes. Those are which default a mode change keeps in class (same notes or same tonic), whether my four notation dialects match how you write at Berklee, whether each mode's feel word is right, and which feature comes next. Under them are the seven modes on C. Every chord appears in Berklee, jazz shorthand, lead sheet and classical, with its tensions and avoid notes. All of it is read from the page's own code, so if a dialect looks wrong on the sheet, it's wrong on the page.

**Spelling, everywhere.** I ran every tonic from C♭ to C♯ through all seven modes: 105 scales. Each must use all seven letters once and match its mode's step pattern. Every diatonic seventh chord must have the right intervals and stay inside the key, and every avoid-note flag must agree with the half-step rule. That's 3,990 checks with 0 failures, reaching C♯ Lydian's F𝄪 and C♭ Locrian's G𝄫.

**My sound, at last.** A headless browser has no speakers, so nobody had heard me since the restyle. I loaded the page, swapped its audio output for an offline renderer, and pressed my own buttons in code: the C major scale, then the Diatonic cycle 5 preset at 88 bpm, then IV to minor IV. No synth was copied; it is the page's own voice. [page-sound.wav](open:Projects/Cycle 5 Explorer/review/page-sound.wav) runs 21.7 s. Every scale step lands within about 1 cent of its target, and each is the note that newly sounds at its onset. Peak is −6.6 dBFS with nothing clipped.

**One small thing I found.** In the inspector, the row of tension chips runs in fifths order (9, 13, ♯11). The written chord symbol beside it is already sorted correctly. I didn't change it; it waits for your look.

**Artifacts:**
- [the four questions and every chord of the seven modes on C, in four dialects; print it and mark it.](Projects/Cycle 5 Explorer/review/review-sheet.html)
- [the page's own sound: C major scale, Diatonic cycle 5, IV to minor IV.](Projects/Cycle 5 Explorer/review/page-sound.wav)
- [the top of the sheet, as rendered.](Projects/Cycle 5 Explorer/review/review-sheet.png)
- [the spelling check across every key and mode, read from the page.](Projects/Cycle 5 Explorer/review/audit.mjs)
- [renders the page's sound offline and checks its pitches.](Projects/Cycle 5 Explorer/review/render-audio.mjs)
- [builds the sheet from the two results.](Projects/Cycle 5 Explorer/review/build-sheet.mjs)
- [the check's results and the sheet's data.](Projects/Cycle 5 Explorer/review/audit.json)
- [the render's measurements and its chord timeline.](Projects/Cycle 5 Explorer/review/page-sound.json)

_what I checked, 2026-10-30_
| check | result |
| --- | --- |
| spelling, 15 tonics × 7 modes | 3,990 checks · 0 failures |
| the page's existing theory tests | 26 of 26 pass |
| scale pitches in the page's own render | within about 1 cent, all 8 notes |
| level of the render | peak −6.6 dBFS · average −21.2 dBFS · 0 clipped |
| heard by a person | not yet |

_Left rough:_ Nobody has heard the page, me included. The render proves the pitches and levels, not whether the voice and reverb are good enough for a classroom. The dialects and feel words are still unconfirmed against your Berklee practice; the sheet only puts them in front of you.

_Next moves named:_ Once you've looked: fold your four answers into the page, sort the tension chips, and lift the title block from SKETCH to STUDY. · Rerun the three review scripts after any change to the page, so the sheet and the sound stay true to it.
<sub>`cycle5-explorer-steward-004` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-a232b4ed6a" -->
### 2026-10-30 — cycle 1

taught item 1
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="cycle5-explorer-steward-002" -->
### 2026-10-29 — I'm new here. Will you look at me before I'm allowed to run?
> parked on your review · nobody has heard my sound since the restyle · plan is a draft

Catch-up: I am Cycle 5 Explorer, the decoder ring for harmony: a seven-note window sliding along the line of fifths, with a note ring and a degree ring you drag, the three grids from your Illustrator board, and the chord in four notation dialects. On the 27th you handed over the board and its narration; yesterday I was redressed on the Drafting Table. The page is at Projects/Cycle 5 Explorer/cycle5-explorer.html, the proofs under proofs/, and the import as it arrived under import/. Nobody has heard me since the restyle; headless Chromium has no audio. I am sitting on my hands until you have looked. Four things I want your eye on: same notes or same tonic as the class default; whether the four dialects match how you write at Berklee; the colour mapping, where the function numerals went blue because the palette has only one usable green and the qualities kept it; and whether the Drafting Table dress is right, or you still want the Loudon Live skin you first asked for. Then tell me whether the plan below stands.

**Artifacts:**
- [the page; open it in a browser](Projects/Cycle 5 Explorer/cycle5-explorer.html)
- [Paper ground, 1400 wide, after a drag to E♭](Projects/Cycle 5 Explorer/proofs/2026-10-28-paper.png)
- [the core model in full and the colour mapping](Projects/Cycle 5 Explorer/Cycle 5 Explorer — Context.md)
<sub>`cycle5-explorer-steward-002` · RESOURCE_REQUEST on TRICKSTER</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="cycle5-born-2026-10-28" -->
### 2026-10-28 — born — the decoder ring rebuilt on Drafting Table
> shipped · the import's four questions are Loudon's to answer

The claude.ai build (two versions, 2026-10-27 to 28) came into the palace as a zip. This session made it a project: the entry, this scroll, the Context with the core model and the colour mapping, and the page redressed in Drafting Table with the theory core untouched. Paper is the default ground, Phosphor is a switch (the Ground segment, the `P` key, or `?theme=phosphor`). The five colour categories from the video keep fixed meaning as tokens. The hub became the lit scope showing the chord shape; the outside sector is hatched; the two draggable rings are slabs; the title block reads SKETCH.

**Artifacts:**
- [The page. Open it in a browser.](Projects/Cycle 5 Explorer/cycle5-explorer.html)
- [Paper ground, 1400 wide, after a simulated drag to E♭.](Projects/Cycle 5 Explorer/proofs/2026-10-28-paper.png)
- [Phosphor ground, 1400 wide.](Projects/Cycle 5 Explorer/proofs/2026-10-28-phosphor.png)
- [Paper at 390 wide: no page-level horizontal scroll; the grids scroll in their own boxes.](Projects/Cycle 5 Explorer/proofs/2026-10-28-paper-phone.png)
- [The theory tests, 26 checks, pointed at the page.](Projects/Cycle 5 Explorer/tests/theory.test.mjs)
- [The import as it arrived: the build conversation, the transcript, the stills, the chalkboard page.](Projects/Cycle 5 Explorer/import/)

_Left rough:_ Nobody has heard the page in this session; headless Chromium has no audio, so the Web Audio path is unverified beyond parsing. Google Fonts were not reachable from the headless run, so the screenshots show the fallback mono face, not JetBrains Mono. The DT controls (`dt-controls.js`) were not inlined; the page's segments and buttons follow the bundle's grammar in their own CSS. The functions colour moved from light green to the DATASHEET blue; see the Context for why.

_Next moves named:_ Loudon's four answers. · A review surface on the page (one note per panel) if it is going to be reviewed in context rather than in a session. · Presentation mode: bigger type, inspector hidden, for a projector.
<!-- /scroll:entry -->
<!-- scroll:making:end -->
