---
title: "Wavetable Scanner — scroll"
born: 2026-09-23
links:
  - target: "[[Wavetable Scanner]]"
    type: connects-to
    label: scroll-for
forward_vector: "I am Wavetable Scanner's scroll — the one page that always opens on where the project stands now, then reads down through everything it has made, newest first. My top is regenerated from the board and the palace whenever anyone looks; my standing orders are Loudon's and never regenerated; my trail only ever grows."
---

# Wavetable Scanner — scroll

> The project's front door. **Now** is regenerated on every look; **Standing Orders** are Loudon's; **The making** is the trail, newest first. Rendered in [[STIGMERGY]]'s PROJECTS deck; the entry [[Wavetable Scanner]] stays the considered truth and this is the live one. See [[The Scroll]].

<!-- scroll:now:start -->
## Now

> _Regenerated 2026-11-03T23:58:54.930Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 1 · last ran 2026-11-03 (today)
- **Plan:** none agreed yet — the next run works from what the ledger owes and the forward vector · **a proposed revision is waiting on you**
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-11-04 (today) — The scanner packs its own tables now: drop a folder of single-cycle WAVs on the page and it sorts, plays and draws them, no Python. (`wavetable-scanner-steward-001`)
- **Last commit touching this project:** 2026-11-03 `a027a3f7` — edit(Loudon Live Design System): the browser's furniture fan-out, batch 3 of 5: Projects, Q to Z (94 pages)
- **Signal:** steady
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 1 run on 1 day, counted from the ledger's run lines
- **Last run:** 2026-11-03 — cycle 1 · taught item 1, proposed items 2, 3 for canon
- **Owed in the ledger:** nothing
- **Proposed for canon:** 2 — items 2, 3; waiting on Loudon's review, and the page has not changed
- **Latest lesson:** item 3, from cycle 1 — 2026-11-03 — [[Wavetable Scanner — tuning]]

### Where this stands

Wavetable Scanner is the browser page that shows a wavetable as a 3D ridge landscape and lets you sweep Position to hear the frames morph. It was built as a Sketch on 2026-05-31. Until now it could only load a table that was already packed, and packing a folder of single cycles meant running pack_wavetable.py outside the browser. This cycle moved that packer into the page. Now you can drop a folder of single-cycle WAVs onto the stage, or pick one. The page resamples every cycle to 1024 samples, sorts the cycles dull to bright, normalises them together, and plays and draws the table. A toggle keeps the folder's own order instead, and a button downloads the table for Ableton. The old Sketch p…

### Open asks

- `wavetable-scanner-steward-002` — proposed plan revision: a first plan for the scanner · posted 2026-11-04 · options: adopt · keep · drag-first

### Answered, not yet consumed

_None._

### Decided

_Nothing decided on the board yet._

### Runs

- 2026-11-03 — cycle 1 · taught item 1, proposed items 2, 3 for canon

### Owed

_Nothing owed._

### Proposed for canon

_Changes the steward wants in the house, kept in its tuning ledger until Loudon's review. Its cycles work as if they hold; the pages have not changed._

- **2.** 2026-11-03 · [[Wavetable Scanner]] · § Tiers, a new subsection after 'Sketch round 2 — Drone default fix' — the Study tier names 'port the resampler to JS' as its reach, and it now exists
- **3.** 2026-11-03 · `Projects/Wavetable Scanner/Wavetable Scanner — gotchas.md` · a new gotcha at the end — a trap the next browser wavetable tool would fall into silently; it belongs beside the other build gotchas

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
<!-- scroll:entry id="wavetable-scanner-steward-001" -->
### 2026-11-04 — cycle 1 — The scanner packs its own tables now: drop a folder of single-cycle WAVs on the page and it sorts, plays and draws them, no Python.
> shipped · checked against pack_wavetable.py on six AKWF folders · steward leans family chain next

Open [wavetable_scanner_study.html](obsidian://open?vault=The%20Palace&file=Projects/Wavetable%20Scanner/wavetable_scanner_study.html). It opens on a cello table that this same packer built from AKWF_cello. Click Engage, then Choose folder… and pick ~/Desktop/AKWF/AKWF_fmsynth: 122 cycles pack in about a tenth of a second. The HUD now says what the order means. Under centroid sort, the back ridges are brighter and the HUD shows each frame's brightness in Hz. Under file order it says depth means nothing. That answers the entry's open question about which order to use.

How it works. It does the same five steps as pack_wavetable.py, with one change. The Python script tiles each cycle three times through a filter and keeps the middle copy, so the filter never meets an edge. A single cycle's own spectrum is already perfectly periodic, so the page resamples in the spectrum and needs no tiling. Brightness, sort order, normalising together to 0.99, the 32-bit float output and the filename truncation all follow the script exactly.

One trap changed the design. The browser's built-in decoder (decodeAudioData) resamples every file to the audio device's rate. A 600-sample AKWF cycle decoded at 48 kHz comes back 653 samples long, so it's no longer one cycle. The packer reads the WAV chunks itself: PCM 8, 16, 24 and 32-bit, float, and extensible headers.

How I checked it. compare.py packed six AKWF folders with both tools (table). Up to the 250th harmonic the frames agree to −59 dB or better. Above that the two really differ: scipy's filter rolls off the top 50 or so harmonics of a 600-sample cycle, and the spectral resample keeps them. That top-end energy moves a few centroids by up to 40 Hz, so a few near-tied neighbours swap places. Then I drove the page in Chrome with the real file picker: 122 FM files, the HUD at both ends, the order toggle and the export. There were no page errors, and the downloaded table is bit-identical to the packer run in node. To try it in a synth or listen, see the [packer notes](obsidian://open?vault=The%20Palace&file=Projects/Wavetable%20Scanner/packer/BUILD.md).

**Artifacts:**
- [the scanner with the packer built in: choose a folder, or drop one on the stage.](Projects/Wavetable Scanner/wavetable_scanner_study.html)
- [122 FM cycles packed in Chrome, cursor at the bright end (2526 Hz).](Projects/Wavetable Scanner/packer/shot-fmsynth-bright-end.png)
- [the same table at the dull end (74 Hz).](Projects/Wavetable Scanner/packer/shot-fmsynth-dull-end.png)
- [the same cycles in file order: the HUD says depth means nothing.](Projects/Wavetable Scanner/packer/shot-fmsynth-file-order.png)
- [what the page opens on: the cello table this packer built.](Projects/Wavetable Scanner/packer/shot-demo-cello.png)
- [20 s at 110 Hz, Position 0 → 1 through the browser-packed FM table, played with the page's own lookup.](Projects/Wavetable Scanner/packer/sweep_fmsynth_packed_in_browser.wav)
- [12 s through the 19 cello cycles.](Projects/Wavetable Scanner/packer/sweep_cello_packed_in_browser.wav)
- [the table Chrome downloaded: drop it on Ableton Wavetable.](Projects/Wavetable Scanner/packer/browser_export_fmsynth.wav)
- [the cello table baked into the page as its opening demo.](Projects/Wavetable Scanner/packer/demo_cello.wav)
- [the packer: WAV reader, spectral resample, centroid, sort, normalise, WAV writer. Runs in the page and in node.](Projects/Wavetable Scanner/packer/packer.js)
- [what to open, what to listen for, what was checked.](Projects/Wavetable Scanner/packer/BUILD.md)
- [builds the study page from the Sketch, every edit checked.](Projects/Wavetable Scanner/packer/build_page.py)
- [packs folders with both tools and compares order, centroids and frames.](Projects/Wavetable Scanner/packer/compare.py)
- [the table above, as data.](Projects/Wavetable Scanner/packer/compare.json)
- [the browser packer run headless in node.](Projects/Wavetable Scanner/packer/pack_folder.cjs)
- [drives the page in Chrome: pick 122 files, read the HUD, toggle, export.](Projects/Wavetable Scanner/packer/browser_check.mjs)
- [no page errors; what the HUD said; audio running.](Projects/Wavetable Scanner/packer/browser_check.json)
- [renders a Position sweep with the worklet's arithmetic.](Projects/Wavetable Scanner/packer/render_sweep.cjs)
- [the demo table's frame names and centroids.](Projects/Wavetable Scanner/packer/demo_cello.json)

_pack_wavetable.py vs the browser packer, same folders, 1024-sample frames_
| AKWF folder | cycles | same frame position | near-tie swaps | frames agree below h250 (worst) | browser time |
| --- | --- | --- | --- | --- | --- |
| fmsynth | 122 | 113 | 4 | −59 dB | 53 ms |
| eorgan | 154 | 136 | 8 | −62 dB | 63 ms |
| bw_saw | 50 | 46 | 2 | −68 dB | 26 ms |
| cello | 19 | 17 | 1 | −69 dB (whole frame) | 16 ms |
| bitreduced | 68 | 68 | 0 | −62 dB | 34 ms |
| 0001 | 100 | 96 | 2 | −59 dB or better | 44 ms |

_Changed in the workshop:_ BUILD — new workshop folder: the browser packer, what was checked, and what to listen for.
_Proposed for canon:_ Wavetable Scanner (§ Tiers, a new subsection after 'Sketch round 2 — Drone default fix') — the Study tier names 'port the resampler to JS' as its reach, and it now exists; owed in the tuning ledger until Loudon's review
_Proposed for canon:_ Projects/Wavetable Scanner/Wavetable Scanner — gotchas.md (a new gotcha at the end) — a trap the next browser wavetable tool would fall into silently; it belongs beside the other build gotchas; owed in the tuning ledger until Loudon's review

_Left rough:_ Nobody has heard it. Chrome only: Safari and Firefox are untried. Dragging a folder onto the stage wasn't tested, only the picker was. Tables stop at 256 frames, and a bigger folder is thinned evenly. Phase alignment and the family-chain order from Generative Wavetable Libraries aren't in the page yet.

_Next moves named:_ Port the family chain (similar cycles grouped, each group walked smoothly, darkest group first) and the frame-to-frame phase alignment from Generative Wavetable Libraries as a third order, so the page can pack the way you picked on 2026-10-14. · Then Study's remaining checks: Safari and Firefox, folder drag-and-drop, and dragging the cursor plane in the 3D scene to set Position.
<sub>`wavetable-scanner-steward-001` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-0cb10b3b73" -->
### 2026-11-03 — cycle 1

taught item 1, proposed items 2, 3 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="backfill-2026-09-23" -->
### 2026-09-23 — backfilled from the bundle

No steward has posted a made thing for this project yet, so the trail opens with what the bundle already holds (1 media file, newest first):

- [wavetable_scanner.html](Projects/Wavetable Scanner/wavetable_scanner.html) · 2026-09-23
<sub>backfill · scroll born 2026-09-23</sub>
<!-- /scroll:entry -->
<!-- scroll:making:end -->
