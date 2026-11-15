---
title: "OBS — scroll"
born: 2026-11-15
links:
  - target: "[[OBS]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am OBS's scroll — the page's front door, opening on where it stands now and the plan it is following, then reading down through what was made from it, newest first. My top is regenerated whenever anyone looks; my plan changes only when Loudon agrees; my standing orders are Loudon's; my trail only ever grows."
---

# OBS — scroll

> The page's front door. **Now** is regenerated on every look; the **Plan** is the path agreed with Loudon, changed only with his yes; **Standing Orders** are Loudon's; **The making** is the trail, newest first. The entry [[OBS]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-11-15T14:10:57.960Z from the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the page is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** alive · **Stage:** — · **Steward:** none — this page has no permanent steward yet
- **Plan:** none agreed yet — the next run works from what the ledger owes and the forward vector
- **Runs:** 1 run on 1 day, counted from the ledger's run lines
- **Last run:** 2026-09-02 — building the LDN RTM recording rig, recorded · taught items 1, 2, 3, 4
- **Owed in the ledger:** nothing
- **Latest lesson:** item 6, from the test-scroll session — 2026-11-15 — a test list, not a run — [[OBS — tuning]]

### Runs

- 2026-09-02 — building the LDN RTM recording rig, recorded · taught items 1, 2, 3, 4

### Owed

_Nothing owed._

<!-- scroll:now:end -->

## Plan

<!-- scroll:plan:start -->
_No plan agreed yet. Until there is one, the work leans on the page's forward vector. A plan is agreed with Loudon — he writes it here, or a steward proposes one as an ask and it lands here when he says yes._
<!-- scroll:plan:end -->

## Standing Orders

<!-- scroll:orders:start -->
_Loudon's standing direction for this page — never regenerated. A steward, if the page ever has one, reads it every cycle before anything else._
<!-- scroll:orders:end -->

## The making

<!-- scroll:making:start -->
<!-- scroll:entry id="tests-2026-11-15-obs-test-list" -->
### 2026-11-15 — The test list: what OBS has not yet shown, for Loudon to run

OBS is Loudon's recording rig, so nothing here was run: no session launched or drove it. This is the list, read from the card's *Not yet shown to hold* line, its ledger and the web on 2026-11-15, in the order worth running. Each one, when run, becomes a dated proof on this scroll and a run line on [[OBS — tuning]]. A better test than these, or a better order, is the operator's to choose.

**First, because something changed under the rig.** The page pins OBS 32.1.2; this Mac now has **33.0.1** (read from the app's Info.plist, not launched). OBS 33 (released 2026-10-23) moved its browser engine from CEF 127 to 150, changed snapping, changed macOS Screen Capture's transparency handling, and asked plugin authors to rebuild.

1. **Does the LDN RTM rig survive 33.0.1?** With OBS open and its WebSocket server on 127.0.0.1:4455: `python3 "Projects/LDN RTM/obs/rtm.py" check`. It reads the whole rig and changes nothing. Time it: the preflight has never been timed. A script can say pass or fail; only an eye on the program-scene screenshot says the Ableton capture, the camera box and the cards still sit right.
2. **The level check on 33.** `rtm.py levels` with signal arriving. OBS 32.1 rebuilt its audio mixer; the page's tap order `[magnitude, peak, inputPeak]` (item 5 on the ledger) was learned on the old one. A muted source still proves the layout: −120 on the first two taps, signal on the third.
3. **One short recorded take, end to end.** `take`, a minute of playing, `stop`, `process`. The file's duration, codecs and audio rate checked by ffprobe; the tail card held, so ffmpeg touches audio only (the page's recipe). OBS 32 made Hybrid MP4/MOV the default for new profiles; whether the rig's profile is still plain MP4 is worth reading back, not assuming.

**Then the half that has never run: streaming.** Everything the page says about live behaviour is read from the protocol. Its own Open Question asks which claims survive a real broadcast.

4. **A private test broadcast,** unlisted, five minutes, with `GetStreamStatus` sampled every few seconds: skipped and dropped frames as a fraction of the total, congestion, bytes sent. The stream key stays in OBS's own settings and never in a script or this page.
5. **Scene changes live, configuration never.** During that broadcast, switch Starting Soon → talking → build → Stream Ended, and confirm nothing in the profile changed (read it back before and after).

**Worth trying, from what is new** (found 2026-11-15, untried):

6. **The experimental Metal renderer** (OBS 32.0, Apple Silicon). Same take recorded once on the default renderer and once on Metal; compare CPU, dropped frames and the file.
7. **Hybrid MOV with ProRes** (OBS 32.0, macOS) against the rig's H.264, for a take that will be edited: size, and whether ffmpeg's audio-only batch still holds.

<sub>Written 2026-11-15 by the shop-tests-motion session from [[OBS]]'s card, [[OBS — tuning]], `Projects/LDN RTM/obs/rtm.py` and the OBS release notes (obsproject.com 32.0–32.2; Phoronix and Linuxiac on 33.0). OBS was not launched. Nobody has run any of these.</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-079e7125a3" -->
### 2026-09-02 — building the LDN RTM recording rig, recorded

taught items 1, 2, 3, 4
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
