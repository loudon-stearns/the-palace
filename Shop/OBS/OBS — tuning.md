---
title: "OBS — tuning"
born: 2026-11-08
links:
  - target: "[[OBS]]"
    type: connects-to
    label: tuning-for
forward_vector: "I am the OBS page's record of what operating it has taught: a line for every take or stream, and a numbered item when one taught something, naming what changed because of it. The page keeps today's gotchas; I keep where each came from. My recording half has entries; my streaming half has none, and the first real broadcast should give it some. Never prune what a real take taught."
ledger: tuning
standards:
  for: "what operating OBS taught the OBS page"
  run: "one session operated through obs-websocket — a recorded take or a live stream — or a probe of the socket itself"
  line: "- run · <date> · <session or probe>, <recorded | stream | probe> · nothing new | taught item N"
  read: "the last 40 lines with run lines set aside, plus every line not yet paid, before a first stream or a new rig"
  writes: "by hand, in the session's commit — the operator after the take, or the elder placing a reviewed proposal"
  merge: union
  kept: git
  trim: never
---

# OBS — tuning

What each session taught the OBS page. Each item names what the session showed and what changed because of it, if anything did. Newest last. Items 1 to 4 are the page's founding gotchas from building the [[LDN RTM]] recording rig (`4604d5d1`); item 5 was found five days later on the same rig (`fe85bf47`) and was dated 2026-09-02 on the page, so its date here follows the commit. All five moved here on 2026-11-08 when the page's Gotchas became present-tense rules. The run line is the day the page's `last_tested` recorded; the 2026-09-07 find carries none, as seeded history doesn't. Everything here is from recorded work. Nothing yet is from a stream.

## From building the LDN RTM recording rig — 2026-09-02 — recorded

1. **Stripping the relative copy of a scene item's transform rescaled everything.** Each item carries `pos`/`scale`/`bounds` and also `pos_rel`/`scale_rel`/`bounds_rel` with a `scale_ref` naming the canvas they were authored against. Removing the `_rel` keys as apparently-derived data rescaled every item by `1080/1329` when the canvas changed: a `Screen` at scale 0.5 became 0.4063, a cam at (13, 767) became (135, 623). The file parsed perfectly. Changed: transforms are set through the socket and OBS derives them; nothing hand-writes them.
2. **`bounds_rel` is in half-height units, not pixels.** The unit is `H/2`, 540 on a 1080 canvas, the same unit `pos_rel` uses for its ±1 vertical range. Writing `bounds_rel` equal to the pixel bounds turned an intended 346 × 256 box into **186840 × 138240**. The source file had no example to derive from, because none of its items used bounds. Changed: read the true value with `GetSceneItemTransform`; a file read does not report it.
3. **A profile copied as a directory was invisible.** A profile's display name lives in `Name=` inside `basic.ini`, not in the directory name, so the copy declared the same internal name as its source and OBS never listed it. Its contents were entirely correct. Changed: verifying a config's contents is not verifying that the application can see it.
4. **Display capture plus a crop recorded whatever sat on top, OBS's own window included.** Cropping a display capture to a window's region is not window isolation. Only a screenshot revealed it; every numeric check passed. Changed: isolate an app with Application Capture on its bundle id (`com.ableton.live`), which, unlike Window Capture, does not depend on a window id that changes between launches and survives a relaunch mid-session. The Self-Check's looked-at screenshot is the check that catches it.

- run · 2026-09-02 · building the LDN RTM recording rig, recorded · taught items 1, 2, 3, 4

## From the LDN RTM level check — 2026-09-07 — recorded

5. **The level check read the pre-fader tap, so OBS's fader looked inert.** Loudon moved a fader and the meter did not budge. Each channel of `inputLevelsMul` in `InputVolumeMeters` is `[magnitude, peak, inputPeak]`, and the third is measured before the volume slider; reducing them with `max()` reported it essentially always. A muted source proved the layout: Screen read −120 on the first two taps while the third still showed −51.7. The corrected reading also overturned that morning's advice to raise the loopback: input was −1.0 dBFS with the fader at −20.5, the source nearly clipping at the interface and the fader all that saved the take. Changed: `levels` in `Projects/LDN RTM/obs/` reports `[1]`, what records, and `[2]`, what arrives, with the fader delta between them, and a hot-input check now fails a source that arrives near clipping, because OBS cannot un-clip what arrives clipped (`fe85bf47`).
