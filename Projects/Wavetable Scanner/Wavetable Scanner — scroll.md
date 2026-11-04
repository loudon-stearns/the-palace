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

> _Regenerated 2026-11-04T00:04:14.483Z from the board, the steward's runtime, the entry's frontmatter, its tuning ledger and git. This zone is machine-owned — the project is steered by the **Plan** and **Standing Orders** below, never here._

- **Status:** active · **Stage:** growing · **Steward:** cycle 2 · last ran 2026-11-04 (today)
- **Plan:** none agreed yet — the next run works from what the ledger owes and the forward vector · **a proposed revision is waiting on you**
- **Waiting on you:** 1 open ask
- **Ready to advance:** no unread answers
- **Last shipped:** 2026-11-04 (today) — The scanner now packs folders in the family-chain order you picked, with a switch to blur away the sweep buzz. Three-way listening files are ready. (`wavetable-scanner-steward-004`)
- **Last commit touching this project:** 2026-11-03 `73b0f5d3` — steward(Wavetable Scanner): cycle 1 — The scanner packs its own tables now: drop a folder of single-cycle WAV…
- **Signal:** steady
- **Left uncommitted:** ⚠ 14 files in the bundle that no cycle declared, so no cycle commits them — `Projects/Wavetable Scanner/packer/chain/cello_centroid.json`, `Projects/Wavetable Scanner/packer/chain/cello_chain.json`, `Projects/Wavetable Scanner/packer/chain/cello_chain_smooth.json`, `Projects/Wavetable Scanner/packer/chain/eorgan_centroid.json`, `Projects/Wavetable Scanner/packer/chain/eorgan_chain.json`, and 9 more. Look, then commit or clear them.
- **Drift:** no consolidation marker on the entry — nothing to measure against.
- **Runs:** 2 runs on 1 day, counted from the ledger's run lines
- **Last run:** 2026-11-03 — cycle 2 · taught item 4, proposed item 5 for canon
- **Owed in the ledger:** nothing
- **Proposed for canon:** 2 — items 3, 5; waiting on Loudon's review, and the page has not changed
- **Latest lesson:** item 5, from cycle 2 — 2026-11-03 — [[Wavetable Scanner — tuning]]

### Where this stands

Wavetable Scanner is the browser page that draws a wavetable as a 3D landscape and lets you sweep Position to hear the frames morph. Last cycle the page learned to pack its own tables: drop in a folder of single-cycle WAVs and it resamples, sorts and plays them, with no Python needed. This cycle it learned to pack them the way you chose for Generative Wavetable Libraries on 2026-10-14. That's the family chain: similar cycles grouped into families, darkest family first, each family walked smoothly, and every frame rotated to line up with its neighbour. The chain is now the default order. Centroid and file order are one click away. A new switch blurs each frame gently into its neighbours. Tha…

### Left rough, again and again

_What the trail's left-rough notes keep saying, oldest first, in its latest words._

- **rough since cycle 1:** Nobody has heard these. _(in 2 notes, the latest cycle 2)_
- **rough since cycle 1:** The page hasn't been tried in Safari or Firefox, and folder drag-and-drop hasn't been driven, only the picker. _(in 2 notes, the latest cycle 2)_

### Open asks

- `wavetable-scanner-steward-002` — proposed plan revision: a first plan for the scanner · posted 2026-11-04 · options: adopt · keep · drag-first

### Answered, not yet consumed

_None._

### Decided

_Nothing decided on the board yet._

### Runs

- 2026-11-03 — cycle 2 · taught item 4, proposed item 5 for canon
- 2026-11-03 — cycle 1 · taught item 1, proposed items 2, 3 for canon

### Owed

_Nothing owed._

### Proposed for canon

_Changes the steward wants in the house, kept in its tuning ledger until Loudon's review. Its cycles work as if they hold; the pages have not changed._

- **3.** 2026-11-03 · `Projects/Wavetable Scanner/Wavetable Scanner — gotchas.md` · a new gotcha at the end — a trap the next browser wavetable tool would fall into silently; it belongs beside the other build gotchas
- **5.** 2026-11-03 · [[Wavetable Scanner]] · § Tiers, a new subsection after 'Sketch round 2 — Drone default fix' — the Study tier's reach, porting the packer to JS, now exists, and it packs in the order Loudon chose

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
<!-- scroll:entry id="wavetable-scanner-steward-004" -->
### 2026-11-04 — cycle 2 — The scanner now packs folders in the family-chain order you picked, with a switch to blur away the sweep buzz. Three-way listening files are ready.
> shipped · family chain is the default order, blur off until heard · steward leans blur 1 once you've listened

I ported the family chain from the Python in Generative Wavetable Libraries into packer.js. It works out each cycle's timbre from its first 64 harmonics with loudness taken out, splits the folder into 3 to 8 families with k-means (choosing the count that separates best), walks each family nearest-neighbour and tidies the walk, and lines the frames up so the crossfades don't cancel. The blur along Position is the same one-frame Gaussian GWL used.

To check it, I packed three AKWF folders three ways and scored them with GWL's own yardsticks (the table below). On FM and organ, the chain cuts the big jumps between neighbouring frames from 48 to 13 and from 90 to 17. The blur then takes the buzz down another 11 to 15 dB, and the worst morph dip comes up to about −0.6 dB. What you give up is that Position no longer means strictly brighter (0.82 on FM, 0.71 on organ, where 1.00 would be always brighter).

The organ folder splits into the same three families the Python found: round, warm, and the same 12 bright-nasal cycles. On FM the browser picks 3 families where the Python picked 5. The scores come out almost the same (13 jumps against 14), and this folder has no sharp family boundary, so the random start decides the count.

In Chrome I dropped 122 FM files on the page. The HUD names the family at every position. I turned the blur on and exported, and the download is bit-identical to the same pack run headless. The page threw no errors.

**Artifacts:**
- [Start here: three 20 s FM sweeps at 110 Hz (centroid, then family chain, then chain blurred), with a second of silence between. The first should stutter, the second glide, the third lose the flutter.](Projects/Wavetable Scanner/packer/chain/fmsynth_ABC_centroid_chain_smoothed.wav)
- [The same three sweeps through 154 organ cycles.](Projects/Wavetable Scanner/packer/chain/eorgan_ABC_centroid_chain_smoothed.wav)
- [The page: family chain by default, the blur switch, and the HUD naming the family you're in. Open in Chrome and drop a folder on it.](Projects/Wavetable Scanner/wavetable_scanner_study.html)
- [122 FM cycles in the chain, 62% of the way through the bright-full family.](Projects/Wavetable Scanner/packer/shot-fmsynth-chain-mid.png)
- [The chain's start: the darkest member of the warm family.](Projects/Wavetable Scanner/packer/shot-fmsynth-chain-start.png)
- [The chain's end: the glassy family.](Projects/Wavetable Scanner/packer/shot-fmsynth-chain-end.png)
- [The packer, now with families, the walk, frame alignment and the blur.](Projects/Wavetable Scanner/packer/packer.js)
- [Packs three folders three ways through packer.js and scores them with GWL's yardsticks.](Projects/Wavetable Scanner/packer/chain_check.py)
- [The scores.](Projects/Wavetable Scanner/packer/chain_check.json)
- [Drives the page in Chrome: pack, HUD at three positions, blur, export, the other orders.](Projects/Wavetable Scanner/packer/browser_check.mjs)
- [What Chrome saw: no page errors, and the families named in the HUD.](Projects/Wavetable Scanner/packer/browser_check.json)
- [The page's own download (FM chain, blurred), bit-identical to the headless pack.](Projects/Wavetable Scanner/packer/browser_export_fmsynth_chain_smooth.wav)
- [Builds the Study page from the Sketch, with the new order and smoothing controls.](Projects/Wavetable Scanner/packer/build_page.py)
- [The headless packer, now taking an order and a blur width.](Projects/Wavetable Scanner/packer/pack_folder.cjs)
- [The FM table, family chain blurred: 122 × 1024 frames, float32, ready for Ableton's Wavetable.](Projects/Wavetable Scanner/packer/chain/fmsynth_chain_smooth.wav)
- [The organ table, family chain blurred.](Projects/Wavetable Scanner/packer/chain/eorgan_chain_smooth.wav)
- [What changed, the numbers, and what to listen for.](Projects/Wavetable Scanner/packer/BUILD.md)

_Same cycles, three orders, scored with Generative Wavetable Libraries' yardsticks (chain_check.json)_
| folder | order | big jumps | worst morph dip | brighter as Position rises | sweep buzz |
| --- | --- | --- | --- | --- | --- |
| fmsynth (122) | centroid | 48 | −5.1 dB | 1.00 | −21.7 dB |
| fmsynth | family chain | 13 | −2.2 dB | 0.82 | −26.2 dB |
| fmsynth | chain + blur 1 | 13 | −0.7 dB | 0.82 | −36.9 dB |
| eorgan (154) | centroid | 90 | −4.1 dB | 1.00 | −19.9 dB |
| eorgan | family chain | 17 | −2.7 dB | 0.71 | −24.1 dB |
| eorgan | chain + blur 1 | 17 | −0.6 dB | 0.71 | −39.3 dB |
| cello (19) | centroid | 4 | −3.3 dB | 1.00 | −44.8 dB |
| cello | chain + blur 1 | 2 | −0.5 dB | 0.83 | −56.3 dB |

_Changed in the workshop:_ BUILD — adds the family chain section, the three-folder scores, the Chrome check, and what to listen for
_Proposed for canon:_ Wavetable Scanner (§ Tiers, a new subsection after 'Sketch round 2 — Drone default fix') — the Study tier's reach, porting the packer to JS, now exists, and it packs in the order Loudon chose; owed in the tuning ledger until Loudon's review; it replaces item 2

_Left rough:_ Nobody has heard these. The page hasn't been tried in Safari or Firefox, and folder drag-and-drop hasn't been driven, only the picker. GWL's tilted chain (its pick for organs) isn't ported. I deleted last cycle's three screenshots and its export WAV in favour of the new ones, and that deletion may not ride the commit.

_Next moves named:_ Finish the Study tier: drag the cursor plane in the 3D scene to set Position, check Safari and Firefox, drive folder drag-and-drop, then add phone audio unlock and a short test plan. · After that, export for the synths you use: a Serum/Vital WAV with 2048-sample frames and the CLM chunk, and a Surge .wt, beside the Ableton WAV. · When you've heard the A/B/C, make blur 1 the page's default (or set it wherever your ear lands). Your verdict also answers the open smoothing question in Generative Wavetable Libraries.
<sub>`wavetable-scanner-steward-004` · BROADCAST on GENERAL</sub>
<!-- /scroll:entry -->

<!-- scroll:entry id="run-26a7094bfe" -->
### 2026-11-03 — cycle 2

taught item 4, proposed item 5 for canon
<sub>a run · its line in the tuning ledger</sub>
<!-- /scroll:entry -->

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
